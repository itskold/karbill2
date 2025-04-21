"use client"

import type React from "react"

import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockDeposits } from "@/components/factures/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function EditDepositInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Trouver la facture d'acompte correspondante dans les données mockées
  const deposit = mockDeposits.find((d) => d.id === id)

  // Si la facture n'existe pas, afficher un message d'erreur
  if (!deposit) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard/factures/acompte">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Facture d'acompte introuvable</CardTitle>
            <CardDescription>La facture d'acompte avec l'identifiant {id} n'existe pas.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // État pour les données du formulaire
  const [formData, setFormData] = useState(() => {
    return {
      invoiceNumber: deposit.invoiceNumber,
      date: new Date(deposit.date).toISOString().split("T")[0],
      clientId: deposit.client.id,
      amount: deposit.amount.toString(),
      description: deposit.description || "",
      notes: deposit.notes || "",
      status: deposit.status,
      paymentMethod: deposit.paymentMethod || "",
      paymentDate: deposit.paymentDate ? new Date(deposit.paymentDate).toISOString().split("T")[0] : "",
      vehicleId: deposit.vehicle?.id || "",
    }
  })

  // Onglet actif
  const [activeTab, setActiveTab] = useState("general")

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Gérer les changements dans les selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique de mise à jour ici
    router.push(`/dashboard/factures/acompte/${id}`)
  }

  return (
    <div className="container mx-auto py-10">
      {/* En-tête avec navigation et actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/dashboard/factures/acompte/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Modifier la facture d'acompte</h1>
        </div>
        <Button type="submit" form="edit-deposit-form">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>

      <form id="edit-deposit-form" onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-8">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="general"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Informations générales
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Montant et paiement
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la facture</CardTitle>
                <CardDescription>Modifiez les informations générales de la facture d'acompte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={deposit.client.id}>{deposit.client.name}</SelectItem>
                      {/* Autres clients ici */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Véhicule (optionnel)</Label>
                  <Select value={formData.vehicleId} onValueChange={(value) => handleSelectChange("vehicleId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun véhicule</SelectItem>
                      {deposit.vehicle && (
                        <SelectItem value={deposit.vehicle.id}>
                          {deposit.vehicle.make} {deposit.vehicle.model} ({deposit.vehicle.licensePlate})
                        </SelectItem>
                      )}
                      {/* Autres véhicules ici */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Montant et statut de paiement</CardTitle>
                <CardDescription>Modifiez le montant et les informations de paiement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (€)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="status">Statut de paiement</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="unpaid">Non payé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === "paid" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une méthode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Virement bancaire</SelectItem>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="card">Carte bancaire</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Date de paiement</Label>
                      <Input
                        id="paymentDate"
                        name="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
