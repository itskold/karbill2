import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { subscriptionService } from "@/components/subscription/subscription.schema"

// Cette fonction gère les webhooks Stripe
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object

      // Récupérer les métadonnées de la session
      const userId = session.metadata?.userId
      const subscriptionId = session.metadata?.subscriptionId

      if (userId && subscriptionId) {
        // Mettre à jour l'abonnement avec les informations Stripe
        await subscriptionService.setSubscription(userId, subscriptionId, {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
          planType: session.metadata.planType as "basic" | "pro",
        })
      }
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object
      const subscriptionId = invoice.subscription as string

      // Récupérer l'abonnement par l'ID d'abonnement Stripe
      // Cette partie nécessiterait une requête supplémentaire pour trouver l'utilisateur
      // associé à cet abonnement Stripe
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object
      // Mettre à jour l'abonnement
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object
      // Marquer l'abonnement comme annulé
      break
    }
  }

  return NextResponse.json({ received: true })
}
