import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import {
  stripe,
  createStripeCheckoutSession,
  createStripeCustomer,
} from "@/lib/stripe";
import { subscriptionService } from "@/components/subscription/subscription.schema";

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authToken = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!authToken) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token Firebase avec Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Récupérer les données de la requête
    const { name, email, planType, origin } = await request.json();

    if (!planType || !email) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Créer un client Stripe
    const stripeCustomer = await createStripeCustomer({
      email,
      name,
    });

    // Créer un ID d'abonnement temporaire
    const subscriptionId = crypto.randomUUID();

    // Déterminer le prix en fonction du plan
    const priceId =
      planType === "basic"
        ? process.env.STRIPE_PRICE_BASIC
        : process.env.STRIPE_PRICE_PRO;

    // Créer une session de paiement Stripe
    const session = await createStripeCheckoutSession({
      customerId: stripeCustomer.id,
      priceId: priceId as string,
      successUrl: `${origin}/dashboard?success=true`,
      cancelUrl: `${origin}/auth/plans?canceled=true`,
    });

    // Enregistrer les informations temporaires de l'abonnement
    await subscriptionService.setSubscription(userId, subscriptionId, {
      id: subscriptionId,
      userId,
      planType,
      status: "pending",
      stripeCustomerId: stripeCustomer.id,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error(
      "Erreur lors de la création du client et de la session de paiement:",
      error
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
