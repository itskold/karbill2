"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon, Plus, Trash2, Download, RefreshCw, Check, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup } from "@/components/ui/radio-group"
import { useAuth } from "@/hooks/use-auth"
import { userService, type Tax, type InvoiceSettings, type Address } from "@/components/users/user.schema"
import { useToast } from "@/components/ui/use-toast"
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { updatePassword } from "firebase/auth"

export default function AccountPage() {
  const { user, userData, updateUserProfile, loading: authLoading } = useAuth()
  const { toast } = useToast()

  // États pour les formulaires
  const [companyInfo, setCompanyInfo] = useState({
    company: "",
    companyNumber: "",
    vatNumber: "",
  })

  const [personalInfo, setPersonalInfo] = useState({
    displayName: "",
    email: "",
    phone: "",
  })

  const [addressInfo, setAddressInfo] = useState<Address>({
    street: "",
    postalCode: "",
    city: "",
    province: "",
    country: "Belgique",
  })

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: "FAC-",
    startNumber: 1,
    nextNumber: 1,
  })

  const [currency, setCurrency] = useState("EUR")

  // États pour le mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // États pour le logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)

  // États pour les taxes
  const [taxRates, setTaxRates] = useState<Tax[]>([])
  const [newTaxRate, setNewTaxRate] = useState("")
  const [taxLoading, setTaxLoading] = useState(false)

  // États pour la signature
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null)
  const [signatureType, setSignatureType] = useState<"draw" | "upload">("draw")
  const [signatureLoading, setSignatureLoading] = useState(false)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

  // États pour les chargements
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Initialiser les données utilisateur
  useEffect(() => {
    if (userData) {
      // Informations entreprise
      setCompanyInfo({
        company: userData.company || "",
        companyNumber: userData.companyNumber || "",
        vatNumber: userData.vatNumber || "",
      })

      // Informations personnelles
      setPersonalInfo({
        displayName: userData.displayName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      })

      // Adresse
      if (userData.address) {
        setAddressInfo(userData.address)
      }

      // Paramètres de facturation
      if (userData.invoiceSettings) {
        setInvoiceSettings(userData.invoiceSettings)
      }

      // Devise
      if (userData.currency) {
        setCurrency(userData.currency)
      }

      // Taxes
      if (userData.taxes && userData.taxes.length > 0) {
        setTaxRates(userData.taxes)
      } else {
        // Taxes par défaut si aucune n'est définie
        setTaxRates([
          { id: crypto.randomUUID(), rate: 21, isDefault: true },
          { id: crypto.randomUUID(), rate: 6, isDefault: false },
          { id: crypto.randomUUID(), rate: 12, isDefault: false },
        ])
      }

      // Logo
      if (userData.logo) {
        setLogoPreview(userData.logo)
      }

      // Signature
      if (userData.signature) {
        setSignatureDataURL(userData.signature)
      }
    }
  }, [userData])

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

          // Uploader vers Firebase Storage
          const storageRef = ref(storage, `users/${user.uid}/logo`)
          await uploadString(storageRef, dataUrl, "data_url")

          // Obtenir l'URL de téléchargement
          const downloadURL = await getDownloadURL(storageRef)

          // Mettre à jour le profil utilisateur
          await updateUserProfile({ logo: downloadURL })

          toast({
            title: "Logo mis à jour",
            description: "Votre logo a été mis à jour avec succès.",
          })
        }

        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Erreur lors de l'upload du logo:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'upload du logo.",
          variant: "destructive",
        })
      } finally {
        setLogoLoading(false)
      }
    }
  }

  const removeLogo = async () => {
    if (user && userData?.logo) {
      try {
        setLogoLoading(true)

        // Supprimer de Firebase Storage
        const storageRef = ref(storage, `users/${user.uid}/logo`)
        await deleteObject(storageRef)

        // Mettre à jour le profil utilisateur
        await updateUserProfile({ logo: null })

        // Mettre à jour l'UI
        setLogoPreview(null)

        toast({
          title: "Logo supprimé",
          description: "Votre logo a été supprimé avec succès.",
        })
      } catch (error) {
        console.error("Erreur lors de la suppression du logo:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression du logo.",
          variant: "destructive",
        })
      } finally {
        setLogoLoading(false)
      }
    }
  }

  // Gestion des taxes
  const addTaxRate = async () => {
    if (newTaxRate && user) {
      const rate = Number.parseFloat(newTaxRate)
      if (!isNaN(rate)) {
        try {
          setTaxLoading(true)

          // Ajouter la taxe via le service
          const taxId = await userService.addTax(user.uid, {
            rate,
            isDefault: taxRates.length === 0, // Par défaut si c'est la première taxe
          })

          // Mettre à jour l'UI
          setTaxRates([...taxRates, { id: taxId, rate, isDefault: taxRates.length === 0 }])
          setNewTaxRate("")

          toast({
            title: "Taux de TVA ajouté",
            description: `Le taux de TVA de ${rate}% a été ajouté avec succès.`,
          })
        } catch (error) {
          console.error("Erreur lors de l'ajout du taux de TVA:", error)
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'ajout du taux de TVA.",
            variant: "destructive",
          })
        } finally {
          setTaxLoading(false)
        }
      }
    }
  }

  const deleteTaxRate = async (id: string) => {
    // Empêcher la suppression du taux par défaut
    const taxToDelete = taxRates.find((tax) => tax.id === id)
    if (taxToDelete && taxToDelete.isDefault) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas supprimer le taux de TVA par défaut.",
        variant: "destructive",
      })
      return
    }

    if (user) {
      try {
        setTaxLoading(true)

        // Supprimer la taxe via le service
        await userService.deleteTax(user.uid, id)

        // Mettre à jour l'UI
        setTaxRates(taxRates.filter((tax) => tax.id !== id))

        toast({
          title: "Taux de TVA supprimé",
          description: "Le taux de TVA a été supprimé avec succès.",
        })
      } catch (error) {
        console.error("Erreur lors de la suppression du taux de TVA:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression du taux de TVA.",
          variant: "destructive",
        })
      } finally {
        setTaxLoading(false)
      }
    }
  }

  const setDefaultTaxRate = async (id: string) => {
    if (user) {
      try {
        setTaxLoading(true)

        // Mettre à jour toutes les taxes
        const updatedTaxes = taxRates.map((tax) => ({
          ...tax,
          isDefault: tax.id === id,
        }))

        // Mettre à jour via le service utilisateur
        await updateUserProfile({ taxes: updatedTaxes })

        // Mettre à jour l'UI
        setTaxRates(updatedTaxes)

        toast({
          title: "Taux de TVA par défaut",
          description: "Le taux de TVA par défaut a été mis à jour avec succès.",
        })
      } catch (error) {
        console.error("Erreur lors de la mise à jour du taux de TVA par défaut:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du taux de TVA par défaut.",
          variant: "destructive",
        })
      } finally {
        setTaxLoading(false)
      }
    }
  }

  // Initialisation et redimensionnement du canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const container = canvasContainerRef.current
      if (canvas && container) {
        // Ajuster la taille du canvas à celle du conteneur
        canvas.width = container.clientWidth
        canvas.height = 200 // Hauteur fixe

        // Réinitialiser le contexte après redimensionnement
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.lineWidth = 2
          ctx.lineCap = "round"
          ctx.strokeStyle = "#000"
        }
      }
    }

    // Redimensionner le canvas au chargement et lors du redimensionnement de la fenêtre
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [signatureType])

  // Gestion de la signature
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ("touches" in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    // Ajuster les coordonnées en fonction du ratio du canvas
    x = (x / rect.width) * canvas.width
    y = (y / rect.height) * canvas.height

    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    if (!coords) return

    setIsDrawing(true)
    setLastPos(coords)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(lastPos.x, lastPos.y)
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()
        setLastPos(coords)
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL()
      setSignatureDataURL(dataURL)
      saveSignature(dataURL)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setSignatureDataURL(null)
        saveSignature(null)
      }
    }
  }

  // Charger une signature existante dans le canvas
  useEffect(() => {
    if (signatureType === "draw" && signatureDataURL && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Calculer les dimensions pour maintenir le ratio
          const ratio = img.width / img.height
          let newWidth = canvas.width
          let newHeight = newWidth / ratio

          if (newHeight > canvas.height) {
            newHeight = canvas.height
            newWidth = newHeight * ratio
          }

          // Centrer l'image dans le canvas
          const x = (canvas.width - newWidth) / 2
          const y = (canvas.height - newHeight) / 2

          ctx.drawImage(img, x, y, newWidth, newHeight)
        }
        img.src = signatureDataURL
      }
    }
  }, [signatureType, signatureDataURL])

  const downloadSignature = () => {
    if (signatureDataURL) {
      const link = document.createElement("a")
      link.download = "signature.png"
      link.href = signatureDataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === "string") {
          setSignatureDataURL(result)
          saveSignature(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const saveSignature = async (dataURL: string | null) => {
    if (user) {
      try {
        setSignatureLoading(true)
        await updateUserProfile({ signature: dataURL })

        if (dataURL) {
          toast({
            title: "Signature enregistrée",
            description: "Votre signature a été enregistrée avec succès.",
          })
        } else {
          toast({
            title: "Signature supprimée",
            description: "Votre signature a été supprimée avec succès.",
          })
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la signature:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'enregistrement de la signature.",
          variant: "destructive",
        })
      } finally {
        setSignatureLoading(false)
      }
    }
  }

  // Enregistrer les modifications du profil
  const saveProfileChanges = async () => {
    if (user) {
      try {
        setSavingProfile(true)

        // Mettre à jour les informations d'entreprise et personnelles
        await updateUserProfile({
          ...companyInfo,
          ...personalInfo,
          address: addressInfo,
        })

        toast({
          title: "Profil mis à jour",
          description: "Votre profil a été mis à jour avec succès.",
        })
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du profil.",
          variant: "destructive",
        })
      } finally {
        setSavingProfile(false)
      }
    }
  }

  // Changer le mot de passe
  const changePassword = async () => {
    if (!user) return

    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    // Vérifier que le mot de passe est assez long
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingPassword(true)

      // Mettre à jour le mot de passe
      await updatePassword(user, passwordData.newPassword)

      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error)
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du mot de passe. Vous devez peut-être vous reconnecter pour effectuer cette action.",
        variant: "destructive",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  // Enregistrer les paramètres
  const saveSettings = async () => {
    if (user) {
      try {
        setSavingSettings(true)

        // 1. Mettre à jour les paramètres de facturation directement avec le service utilisateur
        await userService.updateInvoiceSettings(user.uid, {
          prefix: invoiceSettings.prefix,
          startNumber: Number(invoiceSettings.startNumber),
          nextNumber: Number(invoiceSettings.nextNumber),
        })

        // 2. Mettre à jour la devise séparément
        await updateUserProfile({
          currency,
        })

        console.log("Paramètres enregistrés:", {
          invoiceSettings: {
            prefix: invoiceSettings.prefix,
            startNumber: Number(invoiceSettings.startNumber),
            nextNumber: Number(invoiceSettings.nextNumber),
          },
          currency,
        })

        toast({
          title: "Paramètres mis à jour",
          description: "Vos paramètres ont été mis à jour avec succès.",
        })
      } catch (error) {
        console.error("Erreur lors de la mise à jour des paramètres:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des paramètres.",
          variant: "destructive",
        })
      } finally {
        setSavingSettings(false)
      }
    }
  }

  // Afficher un état de chargement pendant que les données sont récupérées
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compte</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="profile" className="w-full">
        <div className="mb-8 border-b">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profil
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Mot de passe
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="parametres"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-settings"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Paramètres
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logo de l'entreprise</CardTitle>
              <CardDescription className="text-xs">Format recommandé: PNG avec fond transparent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row items-center gap-4">
                {logoPreview ? (
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo de l'entreprise"
                      className="h-full w-full object-contain border rounded-md p-1"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={removeLogo}
                      disabled={logoLoading}
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>Mettez à jour les informations de votre entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <Input
                    id="company"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={personalInfo.displayName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+32 123 45 67 89"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
              <CardDescription>Mettez à jour l'adresse de votre entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfileChanges} disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={changePassword} disabled={savingPassword}>
                {savingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="parametres" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Numérotation des factures</CardTitle>
              <CardDescription>Définissez le format et le numéro de départ pour vos factures.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Préfixe des factures</Label>
                  <Input
                    id="invoice-prefix"
                    placeholder="FAC-"
                    value={invoiceSettings.prefix}
                    onChange={(e) => {
                      const newPrefix = e.target.value
                      setInvoiceSettings((prev) => ({
                        ...prev,
                        prefix: newPrefix,
                      }))
                      console.log("Préfixe mis à jour:", newPrefix)
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Exemple: FAC-00001</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-start">Numéro de départ</Label>
                  <Input
                    id="invoice-start"
                    type="number"
                    min="1"
                    value={invoiceSettings.startNumber}
                    onChange={(e) => {
                      const newStartNumber = Number.parseInt(e.target.value) || 1
                      setInvoiceSettings((prev) => ({
                        ...prev,
                        startNumber: newStartNumber,
                        nextNumber: newStartNumber,
                      }))
                      console.log("Numéro de départ mis à jour:", newStartNumber)
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Le prochain numéro de facture commencera à partir de ce nombre.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taux de TVA</CardTitle>
              <CardDescription>Gérez les différents taux de TVA que vous utilisez.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup defaultValue="1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Taux (%)</TableHead>
                      <TableHead className="w-[100px]">Par défaut</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRates.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell>{tax.rate}%</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {tax.isDefault ? (
                              <div className="h-8 w-8 flex items-center justify-center text-primary">
                                <Check className="h-5 w-5" />
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDefaultTaxRate(tax.id)}
                                className="h-8 w-8"
                                disabled={taxLoading}
                              >
                                <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTaxRate(tax.id)}
                            className="h-8 w-8"
                            disabled={tax.isDefault || taxLoading}
                          >
                            {taxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </RadioGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Nouveau taux (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="21"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addTaxRate} className="mb-2" disabled={taxLoading}>
                    {taxLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devise</CardTitle>
              <CardDescription>Définissez la devise par défaut pour vos factures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="currency">Devise</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                  <SelectTrigger id="currency">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signature</CardTitle>
              <CardDescription>Créez ou importez une signature pour vos documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant={signatureType === "draw" ? "default" : "outline"}
                    onClick={() => setSignatureType("draw")}
                  >
                    Dessiner
                  </Button>
                  <Button
                    variant={signatureType === "upload" ? "default" : "outline"}
                    onClick={() => setSignatureType("upload")}
                  >
                    Importer
                  </Button>
                </div>

                {signatureType === "draw" ? (
                  <div className="border rounded-md p-2" ref={canvasContainerRef}>
                    <canvas
                      ref={canvasRef}
                      className="border border-dashed rounded-md w-full touch-none bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    ></canvas>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signatureDataURL ? (
                      <div className="relative">
                        <img
                          src={signatureDataURL || "/placeholder.svg"}
                          alt="Signature"
                          className="max-h-[200px] w-auto object-contain border rounded-md p-2 bg-white"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setSignatureDataURL(null)
                            saveSignature(null)
                          }}
                          disabled={signatureLoading}
                        >
                          {signatureLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] w-full border border-dashed rounded-md p-4">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Aucune signature importée</p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="signature-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md w-fit">
                          {signatureLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>Importer une signature</span>
                        </div>
                        <Input
                          id="signature-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                          disabled={signatureLoading}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formats acceptés: PNG, JPG, GIF (fond transparent recommandé)
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {signatureType === "draw" && (
                    <Button variant="outline" onClick={clearSignature} disabled={signatureLoading}>
                      {signatureLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Effacer
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={downloadSignature}
                    disabled={!signatureDataURL || signatureLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les paramètres"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
