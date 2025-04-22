"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, X, ImageIcon, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadString, getDownloadURL } from "firebase/storage"

// Définition du type pour la devise
type Currency = "EUR" | "USD" | "GBP" | "CHF"

// Étapes du wizard
type Step = "profil" | "entreprise" | "adresse" | "facturation"

export default function ConfigurePage() {
  const [currentStep, setCurrentStep] = useState<Step>("profil")
  
  const [displayName, setDisplayName] = useState("")
  const [company, setCompany] = useState("")
  const [companyNumber, setCompanyNumber] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [currency, setCurrency] = useState<Currency>("EUR")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, updateUserProfile } = useAuth()
  const router = useRouter()

  // États pour l'adresse
  const [street, setStreet] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [country, setCountry] = useState("Belgique")

  // États pour le logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)

  useEffect(() => {
    // Récupérer l'email stocké lors de l'inscription
    const storedEmail = sessionStorage.getItem('registerEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Si pas d'email, rediriger vers la page d'inscription
      router.push('/auth/register')
    }
  }, [router])

  // Gestion du logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      try {
        setLogoLoading(true)

        // Créer un FileReader pour lire le fichier
        const reader = new FileReader()
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string

          // Créer un aperçu pour l'UI
          setLogoPreview(dataUrl)

          // Uploader vers Firebase Storage seulement à la soumission finale
        }

        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Erreur lors de l'upload du logo:", error)
        setError("Une erreur est survenue lors de l'upload du logo.")
      } finally {
        setLogoLoading(false)
      }
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let logoUrl: string | undefined = undefined

      // Si un logo a été chargé, l'uploader vers Firebase Storage
      if (logoPreview && user) {
        const storageRef = ref(storage, `users/${user.uid}/logo`)
        await uploadString(storageRef, logoPreview, "data_url")
        logoUrl = await getDownloadURL(storageRef)
      }

      await updateUserProfile({
        displayName,
        company,
        companyNumber,
        vatNumber,
        phone,
        currency,
        logo: logoUrl,
        address: {
          street,
          postalCode,
          city,
          province,
          country
        },
        invoiceSettings: {
          prefix: "FAC-",
          startNumber: 1,
          nextNumber: 1
        }
      })
      // Effacer l'email stocké après utilisation
      sessionStorage.removeItem('registerEmail')
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Erreur de configuration:", err)
      setError("Une erreur s'est produite lors de la configuration du compte. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep === "profil") setCurrentStep("entreprise")
    else if (currentStep === "entreprise") setCurrentStep("adresse")
    else if (currentStep === "adresse") setCurrentStep("facturation")
  }

  const prevStep = () => {
    if (currentStep === "facturation") setCurrentStep("adresse")
    else if (currentStep === "adresse") setCurrentStep("entreprise")
    else if (currentStep === "entreprise") setCurrentStep("profil")
  }

  // Render des différentes étapes
  const renderStepIndicator = () => {
    const steps = [
      { key: "profil", label: "Profil" },
      { key: "entreprise", label: "Entreprise" },
      { key: "adresse", label: "Adresse" },
      { key: "facturation", label: "Facturation" }
    ]

    return (
      <div className="flex justify-between mb-8 w-full">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                ${currentStep === step.key ? 'bg-primary text-primary-foreground' : 
                  index < steps.findIndex(s => s.key === currentStep) ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {index < steps.findIndex(s => s.key === currentStep) ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs ${currentStep === step.key ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="h-0.5 w-16 bg-muted absolute left-1/2 transform -translate-x-1/2 mt-4 hidden md:block"></div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderProfilStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom complet</Label>
          <Input
            id="displayName"
            placeholder="Jean Dupont"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+32 123 45 67 89"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
          />
          <p className="text-xs text-muted-foreground">L'adresse email ne peut pas être modifiée</p>
        </div>
      </div>
    </>
  )

  const renderEntrepriseStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Nom de l'entreprise</Label>
          <Input
            id="company"
            placeholder="Ma Société SARL"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Logo de l'entreprise</Label>
          <div className="flex flex-row items-center gap-4">
            {logoPreview ? (
              <div className="relative h-20 w-20 flex-shrink-0">
                <img
                  src={logoPreview}
                  alt="Logo de l'entreprise"
                  className="h-full w-full object-contain border rounded-md p-1"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={removeLogo}
                  disabled={logoLoading}
                  type="button"
                >
                  {logoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 w-20 border border-dashed rounded-md p-2 flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Aucun logo</p>
              </div>
            )}
            <div className="flex-grow">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-1 rounded-md w-fit text-sm">
                  {logoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{logoPreview ? "Changer" : "Télécharger"}</span>
                </div>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={logoLoading}
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Format recommandé: PNG (transparent)</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyNumber">Numéro d'entreprise</Label>
            <Input
              id="companyNumber"
              placeholder="BE 0123.456.789"
              value={companyNumber}
              onChange={(e) => setCompanyNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Numéro de TVA</Label>
            <Input
              id="vatNumber"
              placeholder="BE 0123456789"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  )

  const renderAdresseStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Rue et numéro</Label>
          <Input
            id="street"
            placeholder="Rue de la Loi 16"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              placeholder="1000"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              placeholder="Bruxelles"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              placeholder="Bruxelles-Capitale"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  )

  const renderFacturationStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Devise par défaut</Label>
          <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar américain ($)</SelectItem>
              <SelectItem value="GBP">Livre sterling (£)</SelectItem>
              <SelectItem value="CHF">Franc suisse (CHF)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <p className="text-sm font-medium">Paramètres par défaut</p>
          <p className="text-xs mt-1 text-muted-foreground">Les paramètres suivants seront appliqués automatiquement :</p>
          <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
            <li>• Préfixe de facture : FAC-</li>
            <li>• Numérotation : à partir de 1</li>
            <li>• Taux de TVA standard du pays</li>
          </ul>
          <p className="text-xs mt-2">Vous pourrez modifier ces paramètres ultérieurement dans les réglages.</p>
        </div>
      </div>
    </>
  )

  // Détermine si le bouton Suivant doit être activé pour chaque étape
  const isNextEnabled = () => {
    if (currentStep === "profil") {
      return !!displayName && !!phone
    }
    if (currentStep === "entreprise") {
      return !!company
    }
    return true // Pour les autres étapes, pas de validation obligatoire
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Configuration du compte</CardTitle>
          <CardDescription>Quelques informations pour bien démarrer</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="min-h-[320px] py-4">
            {currentStep === "profil" && renderProfilStep()}
            {currentStep === "entreprise" && renderEntrepriseStep()}
            {currentStep === "adresse" && renderAdresseStep()}
            {currentStep === "facturation" && renderFacturationStep()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep !== "profil" ? (
            <Button variant="outline" onClick={prevStep} type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
          ) : (
            <div></div> // Placeholder pour maintenir le layout
          )}
          
          {currentStep !== "facturation" ? (
            <Button 
              onClick={nextStep} 
              type="button" 
              disabled={!isNextEnabled()}
              className="ml-auto"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              type="button" 
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalisation...
                </>
              ) : (
                "Terminer"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 