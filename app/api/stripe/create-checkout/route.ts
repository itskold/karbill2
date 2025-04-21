import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { createStripeCheckoutSession } from "@/lib/stripe"
import { subscriptionService } from "@/components/subscription/subscription.schema"

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authToken = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!authToken) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le token Firebase
    const decodedToken = await auth.verifyIdToken(authToken)
    const userId = decodedToken.uid

    // Récupérer les données de la requête
    const { planType, stripeCustomerId } = await request.json()

    if (!planType || !stripeCustomerId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
    }

    // Déterminer le prix en fonction du plan
    const priceId = planType === "basic" ? process.env.STRIPE_PRICE_BASIC : process.env.STRIPE_PRICE_PRO

    // Créer un ID d'abonnement temporaire
    const subscriptionId = crypto.randomUUID()

    // Créer une session de paiement Stripe
    const session = await createStripeCheckoutSession({
      customerId: stripeCustomerId,
      priceId: priceId as string,
      successUrl: `${request.headers.get("origin")}/dashboard?success=true`,
      cancelUrl: `${request.headers.get("origin")}/auth/plans?canceled=true`,
    })

    // Enregistrer les informations temporaires de l'abonnement
    await subscriptionService.setSubscription(userId, subscriptionId, {
      id: subscriptionId,
      userId,
      planType,
      status: "pending",
      stripeCustomerId,
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error: any) {
    console.error("Erreur lors de la création de la session de paiement:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
