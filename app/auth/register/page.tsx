"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { type Address, type InvoiceSettings, type Tax } from "@/components/users/user.schema"
import { planFeatures, planTypes } from "@/components/subscription/subscription.schema"
import { subscriptionService } from "@/components/subscription/subscription.schema"

// Étapes du formulaire d'inscription
type RegistrationStep = "personal" | "plan" | "setup"

export default function RegisterPage() {
  const router = useRouter()
  const { register, updateUserProfile, checkUserExists, enableUserDataFetch } = useAuth()

  // États pour les étapes
  const [step, setStep] = useState<RegistrationStep>("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // États pour les informations personnelles
  const [personalInfo, setPersonalInfo] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // État pour le plan choisi
  const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "pro">("free")

  // États pour la configuration du compte
  const [companyInfo, setCompanyInfo] = useState({
    company: "",
    companyNumber: "",
    vatNumber: "",
    phone: "",
  })

  const [addressInfo, setAddressInfo] = useState<Address>({
    street: "",
    postalCode: "",
    city: "",
    province: "",
    country: "Belgique",
  })

  // Gérer la soumission des informations personnelles
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation basique
    if (personalInfo.password !== personalInfo.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (personalInfo.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    try {
      setIsLoading(true)

      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await register(personalInfo.email, personalInfo.password, {
        displayName: personalInfo.displayName,
      })

      // Stocker l'ID utilisateur pour les étapes suivantes
      setUserId(userCredential.uid)
      
      // Indiquer que l'inscription est complète
      setRegistrationComplete(true)
      
      // Attendre un court délai pour s'assurer que les données sont bien enregistrées
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Passer à l'étape suivante
      setStep("plan")
      setIsLoading(false)
      
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err)
      setError(
        err.code === "auth/email-already-in-use"
          ? "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email."
          : "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
      )
      setIsLoading(false)
    }
  }

  // Gérer la sélection du plan
  const handlePlanSelection = async (plan: "free" | "basic" | "pro") => {
    setSelectedPlan(plan)

    if (plan === "free" && userId) {
      try {
        setIsLoading(true)
        
        // Créer un abonnement gratuit
        await subscriptionService.createFreeSubscription(userId)
        
        // Passer à l'étape de configuration après un court délai
        setTimeout(() => {
          setStep("setup")
          setIsLoading(false)
        }, 1000)
      } catch (err) {
        console.error("Erreur lors de la création de l'abonnement:", err)
        setError("Une erreur est survenue lors de la création de l'abonnement.")
        setIsLoading(false)
      }
    } else if ((plan === "basic" || plan === "pro") && userId) {
      // Rediriger vers la page de paiement Stripe
      router.push(`/checkout?plan=${plan}&userId=${userId}`)
    }
  }

  // Gérer la soumission de la configuration
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return
    
    try {
      setIsLoading(true)
      
      // Mettre à jour les informations utilisateur
      await updateUserProfile({
        ...companyInfo,
        address: addressInfo,
      })
      
      // Configurer les taxes par défaut
      const taxes: Tax[] = [
        { id: crypto.randomUUID(), rate: 21, isDefault: true },
        { id: crypto.randomUUID(), rate: 6, isDefault: false },
        { id: crypto.randomUUID(), rate: 12, isDefault: false },
      ]
      
      await updateUserProfile({ taxes })
      
      // Configurer les paramètres de facturation
      const invoiceSettings: InvoiceSettings = {
        prefix: "FAC-",
        startNumber: 1,
        nextNumber: 1,
      }
      
      await updateUserProfile({ invoiceSettings })
      
      // Réactiver la récupération des données utilisateur avant de rediriger
      enableUserDataFetch()
      
      // Rediriger vers le tableau de bord après un court délai
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      console.error("Erreur lors de la configuration du compte:", err)
      setError("Une erreur est survenue lors de la configuration du compte.")
      setIsLoading(false)
    }
  }

  // Effet pour récupérer le statut de l'abonnement après un retour de la page de paiement
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Vérifier si on revient de Stripe
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get("success")
      const planParam = urlParams.get("plan")
      const storedUserId = urlParams.get("userId") || userId
      
      if (success === "true" && planParam && storedUserId) {
        setUserId(storedUserId)
        setSelectedPlan(planParam as "basic" | "pro")
        
        // Ajouter un délai avant de passer à l'étape suivante
        setTimeout(() => {
          setStep("setup")
        }, 1000)
      }
    }
    
    checkSubscriptionStatus()
  }, [userId])

  // Rendu de l'étape des informations personnelles
  const renderPersonalInfoStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
        <CardDescription>Entrez vos informations pour créer un compte</CardDescription>
      </CardHeader>
      <form onSubmit={handlePersonalInfoSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={personalInfo.displayName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, displayName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={personalInfo.password}
              onChange={(e) => setPersonalInfo({ ...personalInfo, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={personalInfo.confirmPassword}
              onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {registrationComplete ? "Préparation du compte..." : "Inscription en cours..."}
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <div className="text-center text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )

  // Rendu de l'étape de sélection du plan
  const renderPlanStep = () => (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choisissez votre plan</h1>
        <p className="text-muted-foreground">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(planFeatures) as Array<keyof typeof planFeatures>).map((planType) => {
          const plan = planFeatures[planType]
          
          return (
            <Card 
              key={planType}
              className={`relative ${selectedPlan === planType ? 'border-primary shadow-lg' : ''}`}
            >
              {selectedPlan === planType && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground p-1 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price === 0 ? 'Gratuit' : `${plan.price}€ / mois`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={selectedPlan === planType ? "default" : "outline"}
                  onClick={() => handlePlanSelection(planType as "free" | "basic" | "pro")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedPlan === planType ? (
                    "Plan sélectionné"
                  ) : (
                    "Sélectionner"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )

  // Rendu de l'étape de configuration
  const renderSetupStep = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Configuration de votre compte</CardTitle>
        <CardDescription>Configurez votre profil d'entreprise pour commencer</CardDescription>
      </CardHeader>
      <form onSubmit={handleSetupSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-4">Informations de l'entreprise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nom de l'entreprise</Label>
                <Input
                  id="company"
                  placeholder="Votre entreprise"
                  value={companyInfo.company}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-number">Numéro d'entreprise</Label>
                <Input
                  id="company-number"
                  placeholder="BE 0123.456.789"
                  value={companyInfo.companyNumber}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat-number">Numéro de TVA</Label>
                <Input
                  id="vat-number"
                  placeholder="BE 0123456789"
                  value={companyInfo.vatNumber}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, vatNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+32 123 45 67 89"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Adresse</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rue et numéro</Label>
                <Input
                  id="street"
                  placeholder="Rue de la Loi 16"
                  value={addressInfo.street || ""}
                  onChange={(e) => setAddressInfo({ ...addressInfo, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Code postal</Label>
                  <Input
                    id="postal-code"
                    placeholder="1000"
                    value={addressInfo.postalCode || ""}
                    onChange={(e) => setAddressInfo({ ...addressInfo, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Bruxelles"
                    value={addressInfo.city || ""}
                    onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    placeholder="Bruxelles-Capitale"
                    value={addressInfo.province || ""}
                    onChange={(e) => setAddressInfo({ ...addressInfo, province: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={addressInfo.country || "Belgique"}
                    onChange={(e) => setAddressInfo({ ...addressInfo, country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuration en cours...
              </>
            ) : (
              "Terminer la configuration"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )

  // Afficher l'étape correspondante
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {step === "personal" && renderPersonalInfoStep()}
      {step === "plan" && renderPlanStep()}
      {step === "setup" && renderSetupStep()}
    </div>
  )
} 