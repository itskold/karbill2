"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Settings } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

// Types pour les employés
interface IWorker {
  id: string
  name: string
  position: string
  email: string
  phone: string
  startDate: Date
  status: "active" | "inactive" | "on_leave"
  specialties: string[]
  hourlyRate: number
  completedRepairs: number
  currentAssignments: number
  createdAt: Date
  updatedAt: Date
}

// Données fictives pour les employés
const workers: IWorker[] = [
  {
    id: "wor-001",
    name: "Michel Dupont",
    position: "Mécanicien senior",
    email: "michel.dupont@example.com",
    phone: "0123456789",
    startDate: new Date("2018-05-10"),
    status: "active",
    specialties: ["Moteur", "Transmission", "Diagnostic électronique"],
    hourlyRate: 25,
    completedRepairs: 342,
    currentAssignments: 3,
    createdAt: new Date("2018-05-10"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "wor-002",
    name: "Sophie Martin",
    position: "Électricienne automobile",
    email: "sophie.martin@example.com",
    phone: "0234567890",
    startDate: new Date("2019-03-15"),
    status: "active",
    specialties: ["Électricité", "Électronique", "Climatisation"],
    hourlyRate: 23,
    completedRepairs: 256,
    currentAssignments: 2,
    createdAt: new Date("2019-03-15"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    id: "wor-003",
    name: "Thomas Bernard",
    position: "Apprenti mécanicien",
    email: "thomas.bernard@example.com",
    phone: "0345678901",
    startDate: new Date("2022-09-01"),
    status: "active",
    specialties: ["Entretien général", "Freins"],
    hourlyRate: 18,
    completedRepairs: 87,
    currentAssignments: 1,
    createdAt: new Date("2022-09-01"),
    updatedAt: new Date("2023-03-10"),
  },
  {
    id: "wor-004",
    name: "Julie Petit",
    position: "Chef d'atelier",
    email: "julie.petit@example.com",
    phone: "0456789012",
    startDate: new Date("2017-02-20"),
    status: "active",
    specialties: ["Gestion d'équipe", "Diagnostic avancé", "Formation"],
    hourlyRate: 30,
    completedRepairs: 512,
    currentAssignments: 0,
    createdAt: new Date("2017-02-20"),
    updatedAt: new Date("2023-01-05"),
  },
  {
    id: "wor-005",
    name: "Pierre Moreau",
    position: "Carrossier",
    email: "pierre.moreau@example.com",
    phone: "0567890123",
    startDate: new Date("2020-06-15"),
    status: "on_leave",
    specialties: ["Carrosserie", "Peinture", "Réparation de pare-chocs"],
    hourlyRate: 22,
    completedRepairs: 198,
    currentAssignments: 0,
    createdAt: new Date("2020-06-15"),
    updatedAt: new Date("2023-04-01"),
  },
]

// Données pour les statistiques
const stats = {
  total: workers.length,
  active: workers.filter((worker) => worker.status === "active").length,
  onLeave: workers.filter((worker) => worker.status === "on_leave").length,
  inactive: workers.filter((worker) => worker.status === "inactive").length,
}

// Composant pour le badge de statut
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Actif
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Inactif
        </Badge>
      )
    case "on_leave":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          En congé
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Définition des colonnes pour le tableau
const columns: ColumnDef<IWorker>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <Link href={`/dashboard/ordres/employe/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "position",
    header: "Poste",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "hourlyRate",
    header: "Taux horaire",
    cell: ({ row }) => `${row.original.hourlyRate.toFixed(2)} €/h`,
  },
  {
    accessorKey: "currentAssignments",
    header: "Assignations",
    cell: ({ row }) => row.original.currentAssignments,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/ordres/employe/${row.original.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Voir les détails</span>
          </Button>
        </Link>
      </div>
    ),
  },
]

export default function EmployesPageClient() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employés</h1>
          <p className="text-muted-foreground">Gérez vos employés et leurs compétences</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ordres/employe/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel employé
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des employés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En congé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
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
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="on_leave">En congé</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>
        </div>
        <DataTable columns={columns} data={workers} />
      </div>
    </div>
  )
}
