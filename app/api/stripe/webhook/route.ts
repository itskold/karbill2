import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { Readable } from "stream";
import Stripe from "stripe";

// Fonction utilitaire pour lire le corps brut de la requête
async function readRawBody(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    // Récupérer le corps de la requête brut
    const rawBody = await readRawBody(request.body as ReadableStream<Uint8Array>);
    const body = rawBody.toString('utf8');
    
    // Récupérer la signature Stripe du header
    const headersList = headers();
    const signature = headersList.get("stripe-signature");
    
    if (!signature || !stripe) {
      return NextResponse.json(
        { error: "Signature manquante ou configuration Stripe invalide" },
        { status: 400 }
      );
    }
    
    // Secret de webhook configuré dans le dashboard Stripe et les variables d'environnement
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Clé secrète de webhook non configurée" },
        { status: 500 }
      );
    }
    
    // Vérifier l'événement avec la signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error(`Erreur de vérification webhook: ${error.message}`);
      return NextResponse.json(
        { error: `Signature webhook invalide: ${error.message}` },
        { status: 400 }
      );
    }
    
    // Traiter les différents types d'événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleInvoicePaid(invoice);
        }
        break;
      }
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Erreur webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Erreur webhook: ${error.message}` },
      { status: 500 }
    );
  }
}

// Gestionnaire pour session de paiement complétée
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) {
    console.error("Données client ou abonnement manquantes dans la session");
    return;
  }
  
  const customerId = typeof session.customer === "string" 
    ? session.customer 
    : session.customer.id;
    
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription.id;
  
  // Récupérer les détails de l'abonnement depuis Stripe
  if (!stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Trouver l'utilisateur associé à ce client Stripe
  const usersWithThisCustomerRef = adminDb
    .collectionGroup("subscriptions")
    .where("stripeCustomerId", "==", customerId);
  
  const snapshot = await usersWithThisCustomerRef.get();
  
  if (snapshot.empty) {
    console.error(`Aucun utilisateur trouvé avec le client Stripe ID: ${customerId}`);
    return;
  }
  
  // Pour chaque abonnement trouvé, mettre à jour son statut
  for (const doc of snapshot.docs) {
    // Extraire l'ID utilisateur du chemin de document
    const path = doc.ref.path.split("/");
    const userId = path[1]; // users/{userId}/subscriptions/{subscriptionId}
    
    // Le produit utilisé détermine le type de plan
    const priceId = subscription.items.data[0].price.id;
    let planType: "basic" | "pro" = "basic";
    
    if (priceId === process.env.STRIPE_PRICE_PRO) {
      planType = "pro";
    }
    
    // Créer ou mettre à jour l'abonnement dans Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(subscriptionId)
      .set({
        id: subscriptionId,
        userId,
        planType,
        status: subscription.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${userId}`);
  }
}

// Gestionnaire pour abonnements mis à jour
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!subscription.customer) return;
  
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  
  // Trouver l'utilisateur associé à ce client Stripe
  const usersWithThisCustomerRef = adminDb
    .collectionGroup("subscriptions")
    .where("stripeCustomerId", "==", customerId);
  
  const snapshot = await usersWithThisCustomerRef.get();
  
  if (snapshot.empty) {
    console.error(`Aucun utilisateur trouvé avec le client Stripe ID: ${customerId}`);
    return;
  }
  
  // Le produit utilisé détermine le type de plan
  const priceId = subscription.items.data[0].price.id;
  let planType: "basic" | "pro" = "basic";
  
  if (priceId === process.env.STRIPE_PRICE_PRO) {
    planType = "pro";
  }
  
  // Pour chaque abonnement trouvé, mettre à jour son statut
  for (const doc of snapshot.docs) {
    // Extraire l'ID utilisateur du chemin de document
    const path = doc.ref.path.split("/");
    const userId = path[1]; // users/{userId}/subscriptions/{subscriptionId}
    
    // Mettre à jour l'abonnement dans Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(subscription.id)
      .set({
        id: subscription.id,
        userId,
        planType,
        status: subscription.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      }, { merge: true });
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${userId}`);
  }
}

// Gestionnaire pour abonnements supprimés
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!subscription.customer) return;
  
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  
  // Trouver l'utilisateur associé à ce client Stripe
  const usersWithThisCustomerRef = adminDb
    .collectionGroup("subscriptions")
    .where("stripeCustomerId", "==", customerId);
  
  const snapshot = await usersWithThisCustomerRef.get();
  
  if (snapshot.empty) {
    console.error(`Aucun utilisateur trouvé avec le client Stripe ID: ${customerId}`);
    return;
  }
  
  // Pour chaque abonnement trouvé, mettre à jour son statut
  for (const doc of snapshot.docs) {
    // Extraire l'ID utilisateur du chemin de document
    const path = doc.ref.path.split("/");
    const userId = path[1]; // users/{userId}/subscriptions/{subscriptionId}
    
    // Mettre à jour l'abonnement à "canceled" dans Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(subscription.id)
      .set({
        status: "canceled",
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      }, { merge: true });
    
    console.log(`Abonnement marqué comme annulé pour l'utilisateur ${userId}`);
    
    // Créer un nouvel abonnement gratuit
    const freeSubscriptionId = crypto.randomUUID();
    
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(freeSubscriptionId)
      .set({
        id: freeSubscriptionId,
        userId,
        planType: "free",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    
    console.log(`Abonnement gratuit créé pour l'utilisateur ${userId}`);
  }
}

// Gestionnaire pour les factures payées
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.customer || !invoice.subscription) return;
  
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer.id;
    
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription.id;
  
  // Récupérer les détails de l'abonnement depuis Stripe
  if (!stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Trouver l'utilisateur associé à ce client Stripe
  const usersWithThisCustomerRef = adminDb
    .collectionGroup("subscriptions")
    .where("stripeCustomerId", "==", customerId);
  
  const snapshot = await usersWithThisCustomerRef.get();
  
  if (snapshot.empty) {
    console.error(`Aucun utilisateur trouvé avec le client Stripe ID: ${customerId}`);
    return;
  }
  
  // Pour chaque abonnement trouvé, mettre à jour son statut
  for (const doc of snapshot.docs) {
    // Extraire l'ID utilisateur du chemin de document
    const path = doc.ref.path.split("/");
    const userId = path[1]; // users/{userId}/subscriptions/{subscriptionId}
    
    // Mettre à jour l'abonnement dans Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(subscriptionId)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      }, { merge: true });
    
    console.log(`Période d'abonnement mise à jour pour l'utilisateur ${userId}`);
  }
} 