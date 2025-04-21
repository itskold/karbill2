"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { planFeatures } from "@/components/subscription/subscription.schema"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") as "basic" | "pro" | null
  const userId = searchParams.get("userId")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validation des paramètres
    if (!plan || !userId) {
      setError("Paramètres de paiement invalides. Veuillez réessayer.")
      return
    }

    if (plan !== "basic" && plan !== "pro") {
      setError("Plan non valide sélectionné.")
      return
    }

    // Ici, vous pourriez initialiser Stripe
    // Par exemple:
    // loadStripe()
    //   .then(stripe => initCheckout(stripe, plan, userId))
    //   .catch(err => setError("Erreur lors de l'initialisation du paiement."))
  }, [plan, userId])

  const handlePayment = async () => {
    if (!plan || !userId) return
    
    try {
      setIsLoading(true)
      
      // Simulation d'un paiement réussi
      // En production, vous intégreriez Stripe ici
      
      setTimeout(() => {
        // Rediriger vers la page d'inscription avec l'indication que le paiement a réussi
        router.push(`/auth/register?success=true&plan=${plan}&userId=${userId}`)
      }, 2000)
    } catch (err) {
      setError("Une erreur est survenue lors du traitement du paiement.")
      setIsLoading(false)
    }
  }

  const selectedPlan = plan ? planFeatures[plan] : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => router.push(`/auth/register?userId=${userId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la sélection de plan
        </Button>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : selectedPlan ? (
          <Card>
            <CardHeader>
              <CardTitle>Paiement - Plan {selectedPlan.name}</CardTitle>
              <CardDescription>Complétez votre abonnement pour continuer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium">Récapitulatif de votre commande</h3>
                  <div className="flex justify-between mt-2">
                    <span>Plan {selectedPlan.name}</span>
                    <span>{selectedPlan.price}€ / mois</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Fonctionnalités incluses :</h3>
                  <ul className="space-y-1">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Ici, vous incluriez les éléments de formulaire Stripe */}
                <div className="border p-4 rounded-md bg-gray-50">
                  <p className="text-center text-sm text-muted-foreground">
                    Intégration Stripe à implémenter ici
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${selectedPlan.price}€ / mois`
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  )
} 