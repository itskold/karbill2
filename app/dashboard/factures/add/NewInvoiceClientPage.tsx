"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Shield, CheckCircle2, Plus, Truck, Car, MoreHorizontal } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { vehiculeService, type Vehicule } from "@/components/vehicules/vehicule.schema"

// Type pour la garantie
type Guarantee = {
  id: string
  name: string
  description: string
  duration: number
  price: number
  vehicle: string
}

// Types pour les articles
type ItemType = "vehicle" | "shipping" | "custom"

type InvoiceItem = {
  id: string
  type: ItemType
  description: string
  quantity: number
  unitPrice: number
  vat: number
  discount: number
  vehicleId?: string
}

// Type pour la reprise de véhicule
type TradeInVehicle = {
  make: string
  model: string
  year: number
  mileage: number
  price: number
  condition: string
}

export default function NewInvoiceClientPage() {
  // État pour les véhicules
  const [vehicles, setVehicles] = useState<Vehicule[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isSelectGuaranteeOpen, setIsSelectGuaranteeOpen] = useState(false)
  const [selectedGuarantee, setSelectedGuarantee] = useState<Guarantee | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [hasTradeIn, setHasTradeIn] = useState(false)
  const [tradeInVehicle, setTradeInVehicle] = useState<TradeInVehicle>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    condition: "good",
  })
  const [activeTab, setActiveTab] = useState("general")

  // Récupération des paramètres d'URL
  const searchParams = useSearchParams()
  const vehicleIdFromUrl = searchParams.get("vehicleId")

  // Utilisation du hook d'authentification
  const { user, userData } = useAuth()

  // Effet pour charger les véhicules
  useEffect(() => {
    async function loadVehicles() {
      if (user?.uid) {
        try {
          setIsLoadingVehicles(true)
          const availableVehicles = await vehiculeService.getAvailableVehicules(user.uid)
          setVehicles(availableVehicles)
        } catch (error) {
          console.error("Erreur lors du chargement des véhicules:", error)
        } finally {
          setIsLoadingVehicles(false)
        }
      }
    }

    loadVehicles()
  }, [user?.uid])

  // Effet pour ajouter automatiquement le véhicule spécifié dans l'URL
  useEffect(() => {
    if (vehicleIdFromUrl && vehicles.length > 0 && !items.some(item => item.type === "vehicle")) {
      const vehicleToAdd = vehicles.find(v => v.id === vehicleIdFromUrl)
      
      if (vehicleToAdd) {
        // Ajouter ce véhicule comme article
        const newItem: InvoiceItem = {
          id: `item-${Date.now()}`,
          type: "vehicle",
          description: `${vehicleToAdd.brand} ${vehicleToAdd.model} (${vehicleToAdd.year})`,
          quantity: 1,
          unitPrice: vehicleToAdd.priceSale || 0,
          vat: 21,
          discount: 0,
          vehicleId: vehicleToAdd.id
        }
        
        setItems([...items, newItem])
        
        // Basculer vers l'onglet Articles
        setActiveTab("articles")
      }
    }
  }, [vehicleIdFromUrl, vehicles, items])

  // Données mockées pour les garanties existantes
  const mockGuarantees = [
    {
      id: "g1",
      name: "Garantie Standard",
      description: "Garantie de base pour tous les véhicules",
      duration: 12,
      price: 299,
      vehicle: "Peugeot 308 - 2020",
    },
    {
      id: "g2",
      name: "Garantie Premium",
      description: "Garantie étendue avec couverture complète",
      duration: 24,
      price: 599,
      vehicle: "Renault Clio - 2019",
    },
    {
      id: "g3",
      name: "Garantie Moteur",
      description: "Garantie spécifique pour le moteur et la transmission",
      duration: 36,
      price: 399,
      vehicle: "Citroën C3 - 2021",
    },
  ]

  // Fonction pour ajouter un article
  const addItem = (type: ItemType) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      type,
      description: type === "shipping" ? "Frais de livraison" : "",
      quantity: 1,
      unitPrice: type === "shipping" ? 150 : 0,
      vat: 21,
      discount: 0,
    }
    setItems([...items, newItem])
  }

  // Fonction pour supprimer un article
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Fonction pour mettre à jour un article
  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  // Fonction pour calculer le total d'un article
  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discountAmount = subtotal * (item.discount / 100)
    return subtotal - discountAmount
  }

  // Fonction pour calculer le sous-total de tous les articles
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  // Fonction pour calculer la TVA totale
  const calculateTotalVAT = () => {
    return items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item)
      return sum + itemTotal * (item.vat / 100)
    }, 0)
  }

  // Fonction pour calculer le total général
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalVAT()
  }

  // Fonction pour formater un montant en euros
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
  }

  // Vérifier si un véhicule a déjà été ajouté
  const hasVehicle = items.some((item) => item.type === "vehicle")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/factures" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Nouvelle Facture</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">Annuler</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Aperçu</DropdownMenuItem>
              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <div className="container flex-1 items-start">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="general"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Général
                  </TabsTrigger>
                  <TabsTrigger
                    value="articles"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Articles
                  </TabsTrigger>
                  <TabsTrigger
                    value="guarantee"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Garantie
                  </TabsTrigger>
                  <TabsTrigger
                    value="tradein"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Reprise
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="mt-6">
              <TabsContent value="general" className="m-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Informations générales</CardTitle>
                        <CardDescription>Informations de base pour la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="client">Client</Label>
                          <Select>
                            <SelectTrigger id="client">
                              <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client1">Dupont Automobiles</SelectItem>
                              <SelectItem value="client2">Garage Martin</SelectItem>
                              <SelectItem value="client3">Auto Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="issueDate">Date d'émission</Label>
                            <Input type="date" id="issueDate" className="w-full" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dueDate">Date d'échéance</Label>
                            <Input type="date" id="dueDate" className="w-full" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                          <Input id="invoiceNumber" placeholder="FAC-2023-001" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Récapitulatif</CardTitle>
                        <CardDescription>Résumé des montants de la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sous-total</span>
                            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">TVA</span>
                            <span className="font-medium">{formatCurrency(calculateTotalVAT())}</span>
                          </div>

                          {/* Afficher les frais de livraison s'ils existent */}
                          {items.some((item) => item.type === "shipping") && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Frais de livraison</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  items
                                    .filter((item) => item.type === "shipping")
                                    .reduce((sum, item) => sum + calculateItemTotal(item), 0),
                                )}
                              </span>
                            </div>
                          )}

                          {/* Afficher la garantie si elle est sélectionnée */}
                          {selectedGuarantee && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Garantie ({selectedGuarantee.name})</span>
                              <span className="font-medium">{formatCurrency(selectedGuarantee.price)}</span>
                            </div>
                          )}

                          {/* Afficher la reprise de véhicule si elle existe */}
                          {hasTradeIn && tradeInVehicle.price > 0 && (
                            <div className="flex items-center justify-between text-green-600">
                              <span className="text-sm">
                                Reprise véhicule ({tradeInVehicle.make} {tradeInVehicle.model})
                              </span>
                              <span className="font-medium">- {formatCurrency(tradeInVehicle.price)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(
                                calculateTotal() +
                                  (selectedGuarantee ? selectedGuarantee.price : 0) -
                                  (hasTradeIn ? tradeInVehicle.price : 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="articles" className="m-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Articles</CardTitle>
                        <CardDescription>Ajoutez les articles à inclure dans la facture</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-auto">
                          <table className="w-full caption-bottom text-sm">
                            <thead className="border-b">
                              <tr className="text-left">
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium text-center">Quantité</th>
                                <th className="px-4 py-3 font-medium text-center">Prix unitaire</th>
                                <th className="px-4 py-3 font-medium text-center">TVA (%)</th>
                                <th className="px-4 py-3 font-medium text-center">Remise (%)</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                <th className="px-4 py-3 font-medium w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    Aucun article ajouté. Commencez par ajouter un véhicule.
                                  </td>
                                </tr>
                              ) : (
                                items.map((item) => (
                                  <tr key={item.id} className="border-b">
                                    <td className="px-4 py-3">
                                      {item.type === "vehicle" ? (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                          <Car className="mr-1 h-3 w-3" />
                                          Véhicule
                                        </span>
                                      ) : item.type === "shipping" ? (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                          <Truck className="mr-1 h-3 w-3" />
                                          Livraison
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                                          Personnalisé
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      {item.type === "vehicle" ? (
                                        <Select
                                          value={item.vehicleId}
                                          onValueChange={(value) => {
                                            const vehicle = vehicles.find((v) => v.id === value)
                                            if (vehicle) {
                                              updateItem(item.id, {
                                                vehicleId: value,
                                                description: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
                                                unitPrice: vehicle.priceSale || 0,
                                              })
                                            }
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un véhicule" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {vehicles.map((vehicle) => (
                                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          value={item.description}
                                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                          placeholder="Description de l'article"
                                        />
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          updateItem(item.id, { quantity: Number.parseInt(e.target.value) || 1 })
                                        }
                                        className="text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                          updateItem(item.id, { unitPrice: Number.parseFloat(e.target.value) || 0 })
                                        }
                                        className="text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <Select
                                        value={item.vat.toString()}
                                        onValueChange={(value) => updateItem(item.id, { vat: Number.parseInt(value) })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="0">0%</SelectItem>
                                          <SelectItem value="6">6%</SelectItem>
                                          <SelectItem value="21">21%</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={item.discount}
                                        onChange={(e) =>
                                          updateItem(item.id, { discount: Number.parseInt(e.target.value) || 0 })
                                        }
                                        className="text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(calculateItemTotal(item))}</td>
                                    <td className="px-4 py-3 text-center">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeItem(item.id)}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="h-4 w-4"
                                        >
                                          <path d="M3 6h18"></path>
                                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={8} className="px-4 py-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un article
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {!hasVehicle && (
                                        <DropdownMenuItem onClick={() => addItem("vehicle")}>
                                          <Car className="mr-2 h-4 w-4" />
                                          Ajouter un véhicule
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => addItem("shipping")}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Ajouter des frais de livraison
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => addItem("custom")}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un article personnalisé
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Récapitulatif</CardTitle>
                        <CardDescription>Résumé des montants de la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sous-total</span>
                            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">TVA</span>
                            <span className="font-medium">{formatCurrency(calculateTotalVAT())}</span>
                          </div>

                          {/* Afficher les frais de livraison s'ils existent */}
                          {items.some((item) => item.type === "shipping") && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Frais de livraison</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  items
                                    .filter((item) => item.type === "shipping")
                                    .reduce((sum, item) => sum + calculateItemTotal(item), 0),
                                )}
                              </span>
                            </div>
                          )}

                          {/* Afficher la garantie si elle est sélectionnée */}
                          {selectedGuarantee && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Garantie ({selectedGuarantee.name})</span>
                              <span className="font-medium">{formatCurrency(selectedGuarantee.price)}</span>
                            </div>
                          )}

                          {/* Afficher la reprise de véhicule si elle existe */}
                          {hasTradeIn && tradeInVehicle.price > 0 && (
                            <div className="flex items-center justify-between text-green-600">
                              <span className="text-sm">
                                Reprise véhicule ({tradeInVehicle.make} {tradeInVehicle.model})
                              </span>
                              <span className="font-medium">- {formatCurrency(tradeInVehicle.price)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(
                                calculateTotal() +
                                  (selectedGuarantee ? selectedGuarantee.price : 0) -
                                  (hasTradeIn ? tradeInVehicle.price : 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guarantee" className="m-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Garantie (optionnel)</CardTitle>
                        <CardDescription>Ajoutez une garantie à cette facture</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Affichage de la garantie sélectionnée */}
                          {selectedGuarantee && (
                            <div className="rounded-lg border border-slate-200 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-slate-900">{selectedGuarantee.name}</h4>
                                  <p className="text-sm text-slate-500 mt-1">{selectedGuarantee.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="text-sm">
                                      <span className="text-slate-500">Durée:</span>{" "}
                                      <span className="font-medium">{selectedGuarantee.duration} mois</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-slate-500">Prix:</span>{" "}
                                      <span className="font-medium">{selectedGuarantee.price.toLocaleString()} €</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-slate-500">Véhicule:</span>{" "}
                                      <span className="font-medium">{selectedGuarantee.vehicle}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setSelectedGuarantee(null)}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Boutons pour ajouter une garantie */}
                          {!selectedGuarantee && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                                <Shield className="mr-2 h-4 w-4" /> Créer une garantie
                              </Button>
                              <Button
                                variant="outline"
                                className="border-slate-300 text-slate-700"
                                onClick={() => setIsSelectGuaranteeOpen(true)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Utiliser une garantie existante
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Récapitulatif</CardTitle>
                        <CardDescription>Résumé des montants de la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sous-total</span>
                            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">TVA</span>
                            <span className="font-medium">{formatCurrency(calculateTotalVAT())}</span>
                          </div>

                          {/* Afficher les frais de livraison s'ils existent */}
                          {items.some((item) => item.type === "shipping") && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Frais de livraison</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  items
                                    .filter((item) => item.type === "shipping")
                                    .reduce((sum, item) => sum + calculateItemTotal(item), 0),
                                )}
                              </span>
                            </div>
                          )}

                          {/* Afficher la garantie si elle est sélectionnée */}
                          {selectedGuarantee && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Garantie ({selectedGuarantee.name})</span>
                              <span className="font-medium">{formatCurrency(selectedGuarantee.price)}</span>
                            </div>
                          )}

                          {/* Afficher la reprise de véhicule si elle existe */}
                          {hasTradeIn && tradeInVehicle.price > 0 && (
                            <div className="flex items-center justify-between text-green-600">
                              <span className="text-sm">
                                Reprise véhicule ({tradeInVehicle.make} {tradeInVehicle.model})
                              </span>
                              <span className="font-medium">- {formatCurrency(tradeInVehicle.price)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(
                                calculateTotal() +
                                  (selectedGuarantee ? selectedGuarantee.price : 0) -
                                  (hasTradeIn ? tradeInVehicle.price : 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tradein" className="m-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Reprise de véhicule (optionnel)</CardTitle>
                            <CardDescription>Informations sur le véhicule repris</CardDescription>
                          </div>
                          <Button
                            variant={hasTradeIn ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setHasTradeIn(!hasTradeIn)}
                          >
                            {hasTradeIn ? "Supprimer la reprise" : "Ajouter une reprise"}
                          </Button>
                        </div>
                      </CardHeader>
                      {hasTradeIn && (
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="tradein-make">Marque</Label>
                              <Input
                                id="tradein-make"
                                value={tradeInVehicle.make}
                                onChange={(e) => setTradeInVehicle({ ...tradeInVehicle, make: e.target.value })}
                                placeholder="Ex: Peugeot"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tradein-model">Modèle</Label>
                              <Input
                                id="tradein-model"
                                value={tradeInVehicle.model}
                                onChange={(e) => setTradeInVehicle({ ...tradeInVehicle, model: e.target.value })}
                                placeholder="Ex: 308"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="tradein-year">Année</Label>
                              <Input
                                id="tradein-year"
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={tradeInVehicle.year}
                                onChange={(e) =>
                                  setTradeInVehicle({
                                    ...tradeInVehicle,
                                    year: Number.parseInt(e.target.value) || new Date().getFullYear(),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tradein-mileage">Kilométrage</Label>
                              <Input
                                id="tradein-mileage"
                                type="number"
                                min="0"
                                value={tradeInVehicle.mileage}
                                onChange={(e) =>
                                  setTradeInVehicle({
                                    ...tradeInVehicle,
                                    mileage: Number.parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="Ex: 75000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tradein-condition">État</Label>
                              <Select
                                value={tradeInVehicle.condition}
                                onValueChange={(value) => setTradeInVehicle({ ...tradeInVehicle, condition: value })}
                              >
                                <SelectTrigger id="tradein-condition">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="excellent">Excellent</SelectItem>
                                  <SelectItem value="good">Bon</SelectItem>
                                  <SelectItem value="fair">Moyen</SelectItem>
                                  <SelectItem value="poor">Mauvais</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tradein-price">Prix de reprise</Label>
                            <div className="flex items-center">
                              <Input
                                id="tradein-price"
                                type="number"
                                min="0"
                                step="100"
                                value={tradeInVehicle.price}
                                onChange={(e) =>
                                  setTradeInVehicle({
                                    ...tradeInVehicle,
                                    price: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="rounded-r-none"
                              />
                              <div className="bg-muted px-3 py-2 border border-l-0 border-input rounded-r-md">€</div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Récapitulatif</CardTitle>
                        <CardDescription>Résumé des montants de la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sous-total</span>
                            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">TVA</span>
                            <span className="font-medium">{formatCurrency(calculateTotalVAT())}</span>
                          </div>

                          {/* Afficher les frais de livraison s'ils existent */}
                          {items.some((item) => item.type === "shipping") && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Frais de livraison</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  items
                                    .filter((item) => item.type === "shipping")
                                    .reduce((sum, item) => sum + calculateItemTotal(item), 0),
                                )}
                              </span>
                            </div>
                          )}

                          {/* Afficher la garantie si elle est sélectionnée */}
                          {selectedGuarantee && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Garantie ({selectedGuarantee.name})</span>
                              <span className="font-medium">{formatCurrency(selectedGuarantee.price)}</span>
                            </div>
                          )}

                          {/* Afficher la reprise de véhicule si elle existe */}
                          {hasTradeIn && tradeInVehicle.price > 0 && (
                            <div className="flex items-center justify-between text-green-600">
                              <span className="text-sm">
                                Reprise véhicule ({tradeInVehicle.make} {tradeInVehicle.model})
                              </span>
                              <span className="font-medium">- {formatCurrency(tradeInVehicle.price)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(
                                calculateTotal() +
                                  (selectedGuarantee ? selectedGuarantee.price : 0) -
                                  (hasTradeIn ? tradeInVehicle.price : 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="m-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Notes</CardTitle>
                        <CardDescription>Ajoutez des notes ou des informations supplémentaires</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Notes ou informations supplémentaires pour le client..."
                          className="min-h-[200px]"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Récapitulatif</CardTitle>
                        <CardDescription>Résumé des montants de la facture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sous-total</span>
                            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">TVA</span>
                            <span className="font-medium">{formatCurrency(calculateTotalVAT())}</span>
                          </div>

                          {/* Afficher les frais de livraison s'ils existent */}
                          {items.some((item) => item.type === "shipping") && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Frais de livraison</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  items
                                    .filter((item) => item.type === "shipping")
                                    .reduce((sum, item) => sum + calculateItemTotal(item), 0),
                                )}
                              </span>
                            </div>
                          )}

                          {/* Afficher la garantie si elle est sélectionnée */}
                          {selectedGuarantee && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-sm">Garantie ({selectedGuarantee.name})</span>
                              <span className="font-medium">{formatCurrency(selectedGuarantee.price)}</span>
                            </div>
                          )}

                          {/* Afficher la reprise de véhicule si elle existe */}
                          {hasTradeIn && tradeInVehicle.price > 0 && (
                            <div className="flex items-center justify-between text-green-600">
                              <span className="text-sm">
                                Reprise véhicule ({tradeInVehicle.make} {tradeInVehicle.model})
                              </span>
                              <span className="font-medium">- {formatCurrency(tradeInVehicle.price)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(
                                calculateTotal() +
                                  (selectedGuarantee ? selectedGuarantee.price : 0) -
                                  (hasTradeIn ? tradeInVehicle.price : 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Dialogue pour sélectionner une garantie existante */}
      <Dialog open={isSelectGuaranteeOpen} onOpenChange={setIsSelectGuaranteeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sélectionner une garantie existante</DialogTitle>
            <DialogDescription>Choisissez une garantie existante à associer à cette facture.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              {/* Liste des garanties existantes */}
              {mockGuarantees.map((guarantee) => (
                <div
                  key={guarantee.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer"
                  onClick={() => {
                    setSelectedGuarantee(guarantee)
                    setIsSelectGuaranteeOpen(false)
                  }}
                >
                  <div>
                    <h4 className="font-medium text-slate-900">{guarantee.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{guarantee.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-slate-500">Durée:</span>{" "}
                        <span className="font-medium">{guarantee.duration} mois</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Prix:</span>{" "}
                        <span className="font-medium">{guarantee.price.toLocaleString()} €</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Véhicule:</span>{" "}
                        <span className="font-medium">{guarantee.vehicle}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedGuarantee(guarantee)
                      setIsSelectGuaranteeOpen(false)
                    }}
                  >
                    Sélectionner
                  </Button>
                </div>
              ))}

              {mockGuarantees.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h4 className="text-lg font-medium text-slate-700">Aucune garantie disponible</h4>
                  <p className="mt-1">Ce client n'a pas encore de garanties actives.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectGuaranteeOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
