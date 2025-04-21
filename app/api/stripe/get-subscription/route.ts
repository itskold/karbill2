import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authToken = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!authToken) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Récupérer l'ID du client Stripe depuis Firestore
    const subscriptionsRef = adminDb.collection("users").doc(userId).collection("subscriptions");
    const activeSubscriptionsSnapshot = await subscriptionsRef
      .where("status", "in", ["active", "past_due", "trialing", "pending"])
      .limit(1)
      .get();

    if (activeSubscriptionsSnapshot.empty) {
      // Si aucun abonnement, renvoyer un abonnement gratuit par défaut
      return NextResponse.json({
        subscription: {
          id: null,
          planType: "free",
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
        }
      });
    }

    const subscription = activeSubscriptionsSnapshot.docs[0].data();
    const stripeSubscriptionId = subscription.stripeSubscriptionId;
    const stripeCustomerId = subscription.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json({
        subscription: {
          ...subscription,
          id: subscription.id || null,
          planType: subscription.planType || "free",
          status: subscription.status || "active",
        }
      });
    }

    // Si l'abonnement a un ID Stripe, récupérer les détails directement depuis Stripe
    if (stripeSubscriptionId && stripe) {
      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      
      // Déterminer le type de plan basé sur le prix
      const priceId = stripeSubscription.items.data[0].price.id;
      let planType: "basic" | "pro" = "basic";
      
      if (priceId === process.env.STRIPE_PRICE_PRO) {
        planType = "pro";
      }

      return NextResponse.json({
        subscription: {
          id: stripeSubscription.id,
          planType,
          status: stripeSubscription.status,
          stripeCustomerId: stripeSubscription.customer as string,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        }
      });
    }

    // Si un client existe mais pas d'abonnement Stripe actif,
    // récupérer les abonnements du client pour voir le dernier état
    if (stripe) {
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      if (stripeSubscriptions.data.length > 0) {
        const latestSubscription = stripeSubscriptions.data[0];
        
        // Déterminer le type de plan basé sur le prix
        const priceId = latestSubscription.items.data[0].price.id;
        let planType: "basic" | "pro" = "basic";
        
        if (priceId === process.env.STRIPE_PRICE_PRO) {
          planType = "pro";
        }

        return NextResponse.json({
          subscription: {
            id: latestSubscription.id,
            planType,
            status: latestSubscription.status,
            stripeCustomerId,
            currentPeriodStart: new Date(latestSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(latestSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: latestSubscription.cancel_at_period_end,
          }
        });
      }
    }

    // Si le client existe mais n'a pas d'abonnement, retourner les informations de base
    return NextResponse.json({
      subscription: {
        ...subscription,
        id: subscription.id || null,
        planType: subscription.planType || "free",
        status: subscription.status || "active",
        stripeCustomerId,
      }
    });

  } catch (error: any) {
    console.error("Erreur lors de la récupération des informations d'abonnement Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 