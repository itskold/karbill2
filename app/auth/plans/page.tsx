"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { planFeatures } from "@/components/subscription/subscription.schema"
import { useAuth } from "@/hooks/use-auth"

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "pro">("free")
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled") === "true"
  const { user } = useAuth()

  const handleSelectPlan = (plan: "free" | "basic" | "pro") => {
    setSelectedPlan(plan)
  }

  const handleContinue = () => {
    if (user) {
      // Si l'utilisateur est déjà connecté, rediriger vers la page de paiement
      router.push(`/dashboard/account?upgrade=${selectedPlan}`)
    } else {
      // Sinon, rediriger vers la page d'inscription avec le plan sélectionné
      router.push(`/auth/register?plan=${selectedPlan}`)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choisissez votre plan</h1>
        <p className="text-gray-500">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
      </div>

      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-8">
          Votre paiement a été annulé. Vous pouvez réessayer ou choisir un autre plan.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(Object.keys(planFeatures) as Array<keyof typeof planFeatures>).map((plan) => {
          const planInfo = planFeatures[plan]
          return (
            <Card
              key={plan}
              className={`relative ${
                selectedPlan === plan ? "border-2 border-blue-500 shadow-lg" : "border border-gray-200"
              }`}
            >
              {plan === "pro" && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-md rounded-tr-md">
                  Populaire
                </div>
              )}
              <CardHeader>
                <CardTitle>{planInfo.name}</CardTitle>
                <CardDescription>
                  {plan === "free" ? (
                    "Gratuit pour toujours"
                  ) : (
                    <span className="text-2xl font-bold">{planInfo.price}€</span>
                  )}{" "}
                  {plan !== "free" && <span className="text-gray-500">/ mois</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={selectedPlan === plan ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {selectedPlan === plan ? "Sélectionné" : "Sélectionner"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg" onClick={handleContinue}>
          Continuer avec {planFeatures[selectedPlan].name}
        </Button>
      </div>
    </div>
  )
}
