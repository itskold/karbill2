import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { adminDb } from "@/lib/firebase-admin"
import { createStripePortalSession } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authToken = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!authToken) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(authToken)
    const userId = decodedToken.uid

    const { returnUrl } = await request.json()

    // Récupérer l'abonnement actif de l'utilisateur depuis Firestore
    const subscriptionsRef = adminDb.collection("users").doc(userId).collection("subscriptions")
    const activeSubscriptionsSnapshot = await subscriptionsRef
      .where("status", "in", ["active", "past_due", "trialing"])
      .limit(1)
      .get()

    if (activeSubscriptionsSnapshot.empty) {
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé" },
        { status: 404 }
      )
    }

    const subscription = activeSubscriptionsSnapshot.docs[0].data()
    const stripeCustomerId = subscription.stripeCustomerId

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun ID client Stripe associé à cet abonnement" },
        { status: 400 }
      )
    }

    // Créer une session vers le portail client Stripe
    const portalSession = await createStripePortalSession({
      customerId: stripeCustomerId,
      returnUrl: returnUrl || `${request.headers.get("origin")}/dashboard/abonnement`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Erreur lors de la création de la session du portail Stripe:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
