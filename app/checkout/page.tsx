"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, CreditCard, Lock, ExternalLink } from "lucide-react"
import { planFeatures } from "@/components/subscription/subscription.schema"
// Import stripe conditionnellement pour éviter les erreurs si les modules ne sont pas installés
const StripeImports = () => {
  try {
    const { Elements } = require('@stripe/react-stripe-js');
    const { loadStripe } = require('@stripe/stripe-js');
    return { Elements, loadStripe };
  } catch (e) {
    // Fallback pour l'environnement de développement si les modules ne sont pas installés
    return {
      Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      loadStripe: () => Promise.resolve(null),
    };
  }
};

const { Elements, loadStripe } = StripeImports();

// Initialiser Stripe - remplacer par votre propre clé publique
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") as "basic" | "pro" | null
  const userId = searchParams.get("userId")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

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

    // Créer une session de paiement pour l'abonnement
    const createCheckoutSession = async () => {
      try {
        setIsLoading(true)
        
        // Appel à l'API pour créer une session de paiement
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création de la session de paiement");
        }

        const data = await response.json();
        
        if (data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl);
        } else {
          // Pour la démonstration, utiliser une URL simulée
          setTimeout(() => {
            // Simuler une redirection vers Stripe après un court délai
            router.push(`/auth/register?success=true&plan=${plan}&userId=${userId}`);
          }, 3000);
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError("Impossible d'initialiser le paiement. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    createCheckoutSession()
  }, [plan, userId, router])

  const selectedPlan = plan ? planFeatures[plan] : null

  // Fonction pour rediriger vers Stripe Checkout
  const proceedToCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      // Pour la démonstration, rediriger directement
      router.push(`/auth/register?success=true&plan=${plan}&userId=${userId}`);
    }
  };
  
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
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Récapitulatif</h3>
                    <span className="text-lg font-bold">{selectedPlan.price}€ / mois</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Plan {selectedPlan.name}</h4>
                      <ul className="space-y-1">
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="mr-2">•</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      <span>Paiement sécurisé via Stripe</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={proceedToCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Payer avec Stripe
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  En procédant au paiement, vous acceptez nos conditions générales d'utilisation et notre politique de confidentialité.
                </div>
              </div>
            </CardContent>
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