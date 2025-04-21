"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { type Subscription, planFeatures } from "./subscription.schema"

interface SubscriptionInfoProps {
  subscription: Subscription
}

export function SubscriptionInfo({ subscription }: SubscriptionInfoProps) {
  const [isLoading, setIsLoading] = useState(false)
  const planInfo = planFeatures[subscription.planType]

  const handleManageSubscription = async () => {
    if (!subscription.stripeCustomerId) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getIdToken()}`,
        },
      })

      const data = await response.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session de gestion d'abonnement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction fictive pour obtenir le token d'authentification
  const getIdToken = async () => {
    // Dans une implémentation réelle, vous utiliseriez Firebase Auth pour obtenir le token
    return "token"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Votre abonnement</CardTitle>
            <CardDescription>Gérez votre abonnement et vos paiements</CardDescription>
          </div>
          <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
            {subscription.status === "active" ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Plan {planInfo.name}</h3>
          <p className="text-sm text-gray-500">
            {subscription.planType === "free" ? "Gratuit" : `${planInfo.price}€ par mois`}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Fonctionnalités incluses:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {planInfo.features.map((feature, index) => (
              <li key={index} className="text-sm">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {subscription.currentPeriodEnd && (
          <div>
            <h4 className="text-sm font-medium">Prochain renouvellement:</h4>
            <p className="text-sm">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {subscription.planType !== "free" && subscription.stripeCustomerId && (
          <Button onClick={handleManageSubscription} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Chargement..." : "Gérer l'abonnement"}
          </Button>
        )}
        {subscription.planType === "free" && (
          <Button variant="outline" href="/auth/plans">
            Passer à un plan payant
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
