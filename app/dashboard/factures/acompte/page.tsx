"use client"

import Link from "next/link"
import { Plus, Filter, Download, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getStatusBadge, formatPrice } from "@/components/factures/utils"

// Données mock définies directement dans le composant pour éviter les problèmes de prérendu
const mockDeposits = [
  {
    id: "d1",
    number: "DEP-2023-001",
    clientId: "c1",
    client: { name: "Dupont Jean" },
    vehicleId: "v1",
    vehicle: { make: "Peugeot", model: "308" },
    issueDate: new Date(2023, 0, 10),
    depositAmount: 500,
    depositPercentage: 20,
    status: "paid",
    mainInvoiceId: "inv001",
  },
  {
    id: "d2",
    number: "DEP-2023-002",
    clientId: "c2",
    client: { name: "Martin Sophie" },
    vehicleId: "v2",
    vehicle: { make: "Renault", model: "Clio" },
    issueDate: new Date(2023, 1, 15),
    depositAmount: 750,
    depositPercentage: 30,
    status: "sent",
    mainInvoiceId: null,
  },
  {
    id: "d3",
    number: "DEP-2023-003",
    clientId: "c3",
    client: { name: "Bernard Thomas" },
    vehicleId: "v3",
    vehicle: { make: "Citroën", model: "C3" },
    issueDate: new Date(2023, 2, 20),
    depositAmount: 600,
    depositPercentage: 25,
    status: "draft",
    mainInvoiceId: null,
  },
  {
    id: "d4",
    number: "DEP-2023-004",
    clientId: "c4",
    client: { name: "Petit Laura" },
    vehicleId: "v4",
    vehicle: { make: "Volkswagen", model: "Golf" },
    issueDate: new Date(2023, 3, 5),
    depositAmount: 1000,
    depositPercentage: 35,
    status: "overdue",
    mainInvoiceId: null,
  },
  {
    id: "d5",
    number: "DEP-2023-005",
    clientId: "c5",
    client: { name: "Durand Michel" },
    vehicleId: "v5",
    vehicle: { make: "BMW", model: "Série 3" },
    issueDate: new Date(2023, 4, 10),
    depositAmount: 1200,
    depositPercentage: 40,
    status: "paid",
    mainInvoiceId: "inv005",
  },
]

export default function AcomptePage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acomptes</h1>
          <p className="text-muted-foreground">Gérez vos acomptes et suivez leur statut.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/factures/acompte/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Acompte
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="mb-8 border-b flex items-center justify-between">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Tous
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Payés
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              En attente
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher..." className="w-[200px] pl-8 md:w-[260px]" />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Tous les acomptes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium">Numéro</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Véhicule</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Montant</th>
                      <th className="px-4 py-3 font-medium">Pourcentage</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDeposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/factures/acompte/${deposit.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {deposit.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{deposit.client.name}</td>
                        <td className="px-4 py-3">
                          {deposit.vehicle ? `${deposit.vehicle.make} ${deposit.vehicle.model}` : "-"}
                        </td>
                        <td className="px-4 py-3">{deposit.issueDate.toLocaleDateString()}</td>
                        <td className="px-4 py-3">{formatPrice(deposit.depositAmount)}</td>
                        <td className="px-4 py-3">{deposit.depositPercentage}%</td>
                        <td className="px-4 py-3">{getStatusBadge(deposit.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link href={`/dashboard/factures/acompte/${deposit.id}`} className="flex w-full">
                                  Voir les détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/dashboard/factures/acompte/${deposit.id}/edit`} className="flex w-full">
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Télécharger PDF</DropdownMenuItem>
                              <DropdownMenuItem>Envoyer par email</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
