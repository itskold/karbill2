import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import { createStripeCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authToken = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!authToken) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Récupérer les données de la requête
    const { planType, returnUrl } = await request.json();

    if (!planType) {
      return NextResponse.json(
        { error: "Type de plan manquant" },
        { status: 400 }
      );
    }

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    
    const userData = userDoc.data();
    
    // Vérifier si l'utilisateur a déjà un ID client Stripe
    let stripeCustomerId = "";
    
    // Chercher dans les abonnements s'il y a un ID client Stripe
    const subscriptionsRef = adminDb.collection("users").doc(userId).collection("subscriptions");
    const subscriptionsSnapshot = await subscriptionsRef.get();
    
    if (!subscriptionsSnapshot.empty) {
      for (const doc of subscriptionsSnapshot.docs) {
        const subData = doc.data();
        if (subData.stripeCustomerId) {
          stripeCustomerId = subData.stripeCustomerId;
          break;
        }
      }
    }
    
    // Si l'utilisateur n'a pas de client Stripe, on en crée un nouveau
    if (!stripeCustomerId) {
      // Créer un nouveau client Stripe - ce code devrait être dans lib/stripe.ts
      throw new Error("La création de nouveau client n'est pas implémentée ici");
    }

    // Déterminer le prix en fonction du plan
    const priceId =
      planType === "basic"
        ? process.env.STRIPE_PRICE_BASIC
        : process.env.STRIPE_PRICE_PRO;

    // Créer une session de paiement Stripe
    const session = await createStripeCheckoutSession({
      customerId: stripeCustomerId,
      priceId: priceId as string,
      successUrl: `${request.headers.get("origin")}/dashboard/abonnement?success=true`,
      cancelUrl: returnUrl || `${request.headers.get("origin")}/dashboard/abonnement?canceled=true`,
    });

    // Générer un ID d'abonnement temporaire
    const subscriptionId = crypto.randomUUID();

    // Enregistrer les informations temporaires de l'abonnement dans Firestore
    await adminDb.collection("users").doc(userId).collection("subscriptions").doc(subscriptionId).set({
      id: subscriptionId,
      userId,
      planType,
      status: "pending",
      stripeCustomerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erreur lors de la création de la session de paiement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 