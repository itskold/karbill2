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
const mockProformas = [
  {
    id: "p1",
    number: "PRO-2023-001",
    client: { id: "c1", name: "Dupont Jean" },
    vehicle: { id: "v1", make: "Peugeot", model: "308" },
    issueDate: new Date(2023, 0, 15),
    dueDate: new Date(2023, 1, 15),
    total: 1250.5,
    status: "draft",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p2",
    number: "PRO-2023-002",
    client: { id: "c2", name: "Martin Sophie" },
    vehicle: { id: "v2", make: "Renault", model: "Clio" },
    issueDate: new Date(2023, 1, 5),
    dueDate: new Date(2023, 2, 5),
    total: 2340.75,
    status: "sent",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p3",
    number: "PRO-2023-003",
    client: { id: "c3", name: "Bernard Thomas" },
    vehicle: { id: "v3", make: "Citroën", model: "C3" },
    issueDate: new Date(2023, 2, 10),
    dueDate: new Date(2023, 3, 10),
    total: 1875.25,
    status: "sent",
    type: "proforma",
    convertedToInvoice: true,
  },
  {
    id: "p4",
    number: "PRO-2023-004",
    client: { id: "c4", name: "Petit Laura" },
    vehicle: { id: "v4", make: "Volkswagen", model: "Golf" },
    issueDate: new Date(2023, 3, 20),
    dueDate: new Date(2023, 4, 20),
    total: 3150.0,
    status: "draft",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p5",
    number: "PRO-2023-005",
    client: { id: "c5", name: "Durand Michel" },
    vehicle: { id: "v5", make: "BMW", model: "Série 3" },
    issueDate: new Date(2023, 4, 5),
    dueDate: new Date(2023, 5, 5),
    total: 4250.5,
    status: "sent",
    type: "proforma",
    convertedToInvoice: true,
  },
]

export default function ProformaPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures Proforma</h1>
          <p className="text-muted-foreground">Gérez vos factures proforma et suivez leur statut.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/factures/proforma/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Proforma
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
              Toutes
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Brouillons
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Envoyées
            </TabsTrigger>
            <TabsTrigger
              value="converted"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Converties
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
              <CardTitle>Toutes les factures proforma</CardTitle>
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
                      <th className="px-4 py-3 font-medium">Échéance</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProformas.map((proforma) => (
                      <tr key={proforma.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/factures/proforma/${proforma.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {proforma.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{proforma.client.name}</td>
                        <td className="px-4 py-3">{`${proforma.vehicle.make} ${proforma.vehicle.model}`}</td>
                        <td className="px-4 py-3">{proforma.issueDate.toLocaleDateString()}</td>
                        <td className="px-4 py-3">{proforma.dueDate.toLocaleDateString()}</td>
                        <td className="px-4 py-3">{formatPrice(proforma.total)}</td>
                        <td className="px-4 py-3">
                          {proforma.convertedToInvoice ? getStatusBadge("converted") : getStatusBadge(proforma.status)}
                        </td>
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
                                <Link href={`/dashboard/factures/proforma/${proforma.id}`} className="flex w-full">
                                  Voir les détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/dashboard/factures/proforma/${proforma.id}/edit`} className="flex w-full">
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Télécharger PDF</DropdownMenuItem>
                              <DropdownMenuItem>Envoyer par email</DropdownMenuItem>
                              {!proforma.convertedToInvoice && (
                                <DropdownMenuItem>Convertir en facture</DropdownMenuItem>
                              )}
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
