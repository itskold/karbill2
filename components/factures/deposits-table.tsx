"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Check, Clock, FileText, MoreHorizontal, Printer, Trash2, AlertTriangle, Car, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { IDepositInvoice } from "@/components/factures/types"
import { useRouter } from "next/navigation"

// Données fictives pour les clients et véhicules
const mockClients = [
  { id: "c1", name: "Dupont Jean", email: "jean.dupont@example.com", phone: "0612345678" },
  { id: "c2", name: "Martin Sophie", email: "sophie.martin@example.com", phone: "0623456789" },
  { id: "c3", name: "Bernard Thomas", email: "thomas.bernard@example.com", phone: "0634567890" },
  { id: "c4", name: "Petit Laura", email: "laura.petit@example.com", phone: "0645678901" },
  { id: "c5", name: "Durand Michel", email: "michel.durand@example.com", phone: "0656789012" },
]

const mockVehicles = [
  { id: "v1", make: "Peugeot", model: "308", year: 2022, price: 25000, vin: "VF3LBHZTXLS123456" },
  { id: "v2", make: "Renault", model: "Clio", year: 2021, price: 18500, vin: "VF15RPNJ5MT789012" },
  { id: "v3", make: "Citroën", model: "C3", year: 2023, price: 19800, vin: "VF7SXHMZ3LT345678" },
  { id: "v4", make: "Volkswagen", model: "Golf", year: 2022, price: 28500, vin: "WVWZZZAUZNW901234" },
  { id: "v5", make: "BMW", model: "Série 3", year: 2021, price: 42000, vin: "WBA5E51070G567890" },
]

// Fonction pour obtenir le nom du client
const getClientName = (clientId: string) => {
  const client = mockClients.find((c) => c.id === clientId)
  return client ? client.name : "Client inconnu"
}

// Fonction pour obtenir les informations du véhicule
const getVehicleInfo = (vehicleId?: string) => {
  if (!vehicleId) return null
  const vehicle = mockVehicles.find((v) => v.id === vehicleId)
  return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : null
}

// Composant pour afficher le statut avec un badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="mr-1 h-3 w-3" /> Payée
        </Badge>
      )
    case "sent":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Envoyée
        </Badge>
      )
    case "draft":
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
          <FileText className="mr-1 h-3 w-3" /> Brouillon
        </Badge>
      )
    case "overdue":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertTriangle className="mr-1 h-3 w-3" /> En retard
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

interface DepositsTableProps {
  deposits: IDepositInvoice[]
}

export function DepositsTable({ deposits }: DepositsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const router = useRouter()

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (deposits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-lg">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Aucune facture d'acompte trouvée</h3>
        <p className="text-slate-500 mt-1 max-w-md">
          Aucune facture d'acompte ne correspond à vos critères de recherche. Veuillez modifier vos filtres ou créer une
          nouvelle facture d'acompte.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-slate-100/80">
            <TableHead className="font-medium text-slate-700">Numéro</TableHead>
            <TableHead className="font-medium text-slate-700">Client</TableHead>
            <TableHead className="font-medium text-slate-700">Véhicule</TableHead>
            <TableHead className="font-medium text-slate-700">Date d'émission</TableHead>
            <TableHead className="font-medium text-slate-700">Montant</TableHead>
            <TableHead className="font-medium text-slate-700">Statut</TableHead>
            <TableHead className="text-right font-medium text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit.id} className="hover:bg-slate-50">
              <TableCell>
                <div className="font-medium text-slate-900">{deposit.number}</div>
                {deposit.mainInvoiceId && (
                  <div className="text-xs text-slate-500">Lié à la facture #{deposit.mainInvoiceId}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-slate-900">{getClientName(deposit.clientId)}</div>
                <div className="text-xs text-slate-500">ID: {deposit.clientId}</div>
              </TableCell>
              <TableCell>
                {deposit.vehicleId ? (
                  <div className="flex items-center text-slate-900">
                    <Car className="mr-2 h-4 w-4 text-slate-400" />
                    {getVehicleInfo(deposit.vehicleId)}
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-slate-700">
                {format(deposit.issueDate, "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell>
                <div className="font-medium text-slate-900">{deposit.depositAmount.toLocaleString()} €</div>
                {deposit.depositPercentage && (
                  <div className="text-xs text-slate-500">({deposit.depositPercentage}%)</div>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={deposit.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/factures/acompte/${deposit.id}`)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Check className="mr-2 h-4 w-4" /> Marquer comme payée
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
