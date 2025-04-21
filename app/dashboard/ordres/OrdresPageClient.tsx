"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Clock, Filter, Plus, Search, Settings, PenToolIcon as Tool, Truck, WrenchIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { IRepairOrder } from "@/components/ordres/types"
import { formatDate } from "@/lib/utils"

// Données fictives pour les ordres de réparation
const repairOrders: IRepairOrder[] = [
  {
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
  {
    id: "ord-002",
    number: "ORD-2023-002",
    vehicleId: "veh-002",
    clientId: "cli-002",
    orderDate: new Date("2023-04-12"),
    estimatedCompletionDate: new Date("2023-04-14"),
    status: "pending",
    priority: "medium",
    customerComplaints: "Problème de freinage, vibrations lors du freinage",
    repairs: [
      {
        id: "rep-003",
        description: "Inspection du système de freinage",
        estimatedHours: 1,
        completed: false,
      },
    ],
    parts: [],
    laborCost: 80,
    partsTotal: 0,
    total: 80,
    createdAt: new Date("2023-04-12"),
    updatedAt: new Date("2023-04-12"),
  },
  {
    id: "ord-003",
    number: "ORD-2023-003",
    vehicleId: "veh-003",
    clientId: "cli-003",
    orderDate: new Date("2023-04-05"),
    estimatedCompletionDate: new Date("2023-04-08"),
    completedDate: new Date("2023-04-08"),
    status: "completed",
    priority: "low",
    customerComplaints: "Entretien régulier - vidange d'huile et filtres",
    repairs: [
      {
        id: "rep-004",
        description: "Vidange d'huile et remplacement du filtre",
        estimatedHours: 1,
        completed: true,
        completedAt: new Date("2023-04-07"),
      },
      {
        id: "rep-005",
        description: "Remplacement du filtre à air",
        estimatedHours: 0.5,
        completed: true,
        completedAt: new Date("2023-04-07"),
      },
    ],
    parts: [
      {
        id: "part-002",
        name: "Huile moteur 5W30",
        price: 39.99,
        supplier: "LubeExpress",
        quantity: 1,
        received: true,
        receivedAt: new Date("2023-04-06"),
      },
      {
        id: "part-003",
        name: "Filtre à huile",
        price: 12.99,
        supplier: "AutoParts Pro",
        quantity: 1,
        received: true,
        receivedAt: new Date("2023-04-06"),
      },
      {
        id: "part-004",
        name: "Filtre à air",
        price: 19.99,
        supplier: "AutoParts Pro",
        quantity: 1,
        received: true,
        receivedAt: new Date("2023-04-06"),
      },
    ],
    laborCost: 120,
    partsTotal: 72.97,
    total: 192.97,
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-08"),
  },
  {
    id: "ord-004",
    number: "ORD-2023-004",
    vehicleId: "veh-004",
    clientId: "cli-004",
    orderDate: new Date("2023-04-13"),
    estimatedCompletionDate: new Date("2023-04-20"),
    status: "in_progress",
    priority: "urgent",
    customerComplaints: "Panne totale, véhicule ne démarre pas",
    repairs: [
      {
        id: "rep-006",
        description: "Diagnostic électronique complet",
        estimatedHours: 2,
        completed: true,
        completedAt: new Date("2023-04-13"),
      },
      {
        id: "rep-007",
        description: "Remplacement de la batterie",
        estimatedHours: 0.5,
        completed: true,
        completedAt: new Date("2023-04-14"),
      },
      {
        id: "rep-008",
        description: "Vérification du système de démarrage",
        estimatedHours: 1.5,
        completed: false,
      },
    ],
    parts: [
      {
        id: "part-005",
        name: "Batterie 70Ah",
        price: 129.99,
        supplier: "BatteryPlus",
        quantity: 1,
        received: true,
        receivedAt: new Date("2023-04-14"),
      },
    ],
    laborCost: 320,
    partsTotal: 129.99,
    total: 449.99,
    createdAt: new Date("2023-04-13"),
    updatedAt: new Date("2023-04-14"),
  },
  {
    id: "ord-005",
    number: "ORD-2023-005",
    vehicleId: "veh-005",
    clientId: "cli-005",
    orderDate: new Date("2023-04-01"),
    estimatedCompletionDate: new Date("2023-04-03"),
    status: "cancelled",
    priority: "medium",
    customerComplaints: "Remplacement des plaquettes de frein",
    repairs: [
      {
        id: "rep-009",
        description: "Remplacement des plaquettes de frein avant",
        estimatedHours: 1.5,
        completed: false,
      },
    ],
    parts: [
      {
        id: "part-006",
        name: "Plaquettes de frein avant",
        price: 59.99,
        supplier: "BrakeSpecialist",
        quantity: 1,
        received: false,
      },
    ],
    laborCost: 120,
    partsTotal: 59.99,
    total: 179.99,
    notes: "Client a annulé la réparation car il a trouvé moins cher ailleurs",
    createdAt: new Date("2023-04-01"),
    updatedAt: new Date("2023-04-02"),
  },
]

// Données pour les statistiques
const stats = {
  total: repairOrders.length,
  pending: repairOrders.filter((order) => order.status === "pending").length,
  inProgress: repairOrders.filter((order) => order.status === "in_progress").length,
  completed: repairOrders.filter((order) => order.status === "completed").length,
  cancelled: repairOrders.filter((order) => order.status === "cancelled").length,
  urgent: repairOrders.filter((order) => order.priority === "urgent").length,
}

// Données pour les véhicules (fictives)
const vehicles = {
  "veh-001": { make: "Renault", model: "Clio", year: 2018, plate: "1-ABC-123" },
  "veh-002": { make: "Peugeot", model: "308", year: 2019, plate: "1-DEF-456" },
  "veh-003": { make: "Volkswagen", model: "Golf", year: 2020, plate: "1-GHI-789" },
  "veh-004": { make: "BMW", model: "Serie 3", year: 2021, plate: "1-JKL-012" },
  "veh-005": { make: "Audi", model: "A4", year: 2017, plate: "1-MNO-345" },
}

// Données pour les clients (fictives)
const clients = {
  "cli-001": { name: "Jean Dupont", phone: "0123456789" },
  "cli-002": { name: "Marie Martin", phone: "0234567890" },
  "cli-003": { name: "Pierre Durand", phone: "0345678901" },
  "cli-004": { name: "Sophie Lefebvre", phone: "0456789012" },
  "cli-005": { name: "Thomas Bernard", phone: "0567890123" },
}

// Composant client pour le badge de statut
const StatusBadge = ({ status }: { status: string }) => {
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

// Composant client pour le badge de priorité
const PriorityBadge = ({ priority }: { priority: string }) => {
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

// Composant client pour le véhicule
const VehicleDisplay = ({ vehicleId }: { vehicleId: string }) => {
  const vehicle = vehicles[vehicleId as keyof typeof vehicles]
  return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : vehicleId
}

// Composant client pour le client
const ClientDisplay = ({ clientId }: { clientId: string }) => {
  const client = clients[clientId as keyof typeof clients]
  return client ? client.name : clientId
}

// Définition des colonnes pour le tableau
const columns: ColumnDef<IRepairOrder>[] = [
  {
    accessorKey: "number",
    header: "Numéro",
    cell: ({ row }) => (
      <Link href={`/dashboard/ordres/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
        {row.original.number}
      </Link>
    ),
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.orderDate),
  },
  {
    accessorKey: "vehicleId",
    header: "Véhicule",
    cell: ({ row }) => <VehicleDisplay vehicleId={row.original.vehicleId} />,
  },
  {
    accessorKey: "clientId",
    header: "Client",
    cell: ({ row }) => <ClientDisplay clientId={row.original.clientId} />,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "priority",
    header: "Priorité",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => `${row.original.total.toFixed(2)} €`,
  },
  {
    accessorKey: "estimatedCompletionDate",
    header: "Date estimée",
    cell: ({ row }) => formatDate(row.original.estimatedCompletionDate),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/ordres/${row.original.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Voir les détails</span>
          </Button>
        </Link>
      </div>
    ),
  },
]

export default function OrdresPageClient() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ordres de réparation</h1>
          <p className="text-muted-foreground">Gérez vos ordres de réparation et suivez leur progression</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ordres/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel ordre
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des ordres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <WrenchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <Tool className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <Truck className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.urgent}</div>
              <Clock className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher..." className="w-full pl-8" />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>
        </div>
        <DataTable columns={columns} data={repairOrders} />
      </div>
    </div>
  )
}
