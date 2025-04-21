"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, FileText, Settings, PenToolIcon as Tool, Truck, User } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { IRepairOrder } from "@/components/ordres/types"

// Données fictives pour les ordres de réparation
const repairOrders: Record<string, IRepairOrder> = {
  "ord-001": {
    id: "ord-001",
    number: "ORD-2023-001",
    vehicleId: "veh-001",
    clientId: "cli-001",
    orderDate: new Date("2023-04-10"),
    estimatedCompletionDate: new Date("2023-04-15"),
    status: "in_progress",
    priority: "high",
    customerComplaints: "Le moteur fait un bruit étrange lors de l'accélération",
    repairs: [
      {
        id: "rep-001",
        description: "Vérification du système d'échappement",
        estimatedHours: 1.5,
        completed: true,
        completedAt: new Date("2023-04-11"),
      },
      {
        id: "rep-002",
        description: "Remplacement des bougies d'allumage",
        estimatedHours: 2,
        completed: false,
      },
    ],
    parts: [
      {
        id: "part-001",
        name: "Bougies d'allumage NGK",
        price: 45.99,
        supplier: "AutoParts Pro",
        quantity: 4,
        received: true,
        receivedAt: new Date("2023-04-11"),
      },
    ],
    laborCost: 175,
    partsTotal: 183.96,
    total: 358.96,
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-04-11"),
  },
}

// Données pour les véhicules (fictives)
const vehicles = {
  "veh-001": { make: "Renault", model: "Clio", year: 2018, plate: "1-ABC-123" },
}

// Données pour les clients (fictives)
const clients = {
  "cli-001": { name: "Jean Dupont", phone: "0123456789", email: "jean.dupont@example.com" },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = repairOrders[params.id]

  if (!order) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/ordres">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Ordre de réparation non trouvé</h1>
        </div>
        <p>L'ordre de réparation que vous recherchez n'existe pas.</p>
      </div>
    )
  }

  const vehicle = vehicles[order.vehicleId as keyof typeof vehicles]
  const client = clients[order.clientId as keyof typeof clients]

  // Fonction pour afficher le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            En attente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            En cours
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Terminé
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Annulé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Fonction pour afficher le badge de priorité
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Basse
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Moyenne
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Haute
          </Badge>
        )
      case "urgent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Urgente
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/ordres">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              Ordre #{order.number} {getStatusBadge(order.status)}
            </h1>
            <p className="text-muted-foreground">Créé le {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">{client?.name}</p>
                <p className="text-sm text-muted-foreground">{client?.phone}</p>
                <p className="text-sm text-muted-foreground">{client?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Véhicule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <Truck className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {vehicle?.make} {vehicle?.model}
                </p>
                <p className="text-sm text-muted-foreground">Année: {vehicle?.year}</p>
                <p className="text-sm text-muted-foreground">Plaque: {vehicle?.plate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Date de commande:</p>
                  <p className="text-sm font-medium">{formatDate(order.orderDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Date estimée:</p>
                  <p className="text-sm font-medium">{formatDate(order.estimatedCompletionDate)}</p>
                </div>
                {order.completedDate && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Date de fin:</p>
                    <p className="text-sm font-medium">{formatDate(order.completedDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mb-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="repairs">Réparations</TabsTrigger>
          <TabsTrigger value="parts">Pièces</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro d'ordre</p>
                  <p className="font-medium">{order.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <div>{getPriorityBadge(order.priority)}</div>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-2">Problème signalé</h3>
              <p>{order.customerComplaints}</p>
            </div>
            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p>{order.notes}</p>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="repairs" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Liste des réparations</h3>
            <div className="space-y-4">
              {order.repairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Tool className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{repair.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Temps estimé: {repair.estimatedHours} heure(s)
                          </p>
                        </div>
                      </div>
                      <div>
                        {repair.completed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Terminé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            En attente
                          </Badge>
                        )}
                      </div>
                    </div>
                    {repair.completed && repair.completedAt && (
                      <div className="mt-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Terminé le {formatDate(repair.completedAt)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="parts" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Pièces utilisées</h3>
            {order.parts.length > 0 ? (
              <div className="space-y-4">
                {order.parts.map((part) => (
                  <Card key={part.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground">Fournisseur: {part.supplier}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {part.quantity} x {part.price.toFixed(2)} €
                          </p>
                        </div>
                        <div>
                          {part.received ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Reçu
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              En attente
                            </Badge>
                          )}
                        </div>
                      </div>
                      {part.received && part.receivedAt && (
                        <div className="mt-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Reçu le {formatDate(part.receivedAt)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune pièce utilisée pour cette réparation.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="billing" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Résumé de facturation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Main d'œuvre</p>
                <p>{order.laborCost.toFixed(2)} €</p>
              </div>
              <div className="flex justify-between">
                <p>Pièces</p>
                <p>{order.partsTotal.toFixed(2)} €</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>{order.total.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
