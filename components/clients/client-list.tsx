import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientTypeBadge, getClientName } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"

interface ClientListProps {
  clients: IClient[]
}

export function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-lg">
        <Users className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Aucun client trouvé</h3>
        <p className="text-slate-500 mt-1 max-w-md">
          Aucun client ne correspond à vos critères de recherche. Veuillez modifier vos filtres ou ajouter de nouveaux
          clients.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-slate-100/80">
            <TableHead className="font-medium text-slate-700">Client</TableHead>
            <TableHead className="font-medium text-slate-700">Type</TableHead>
            <TableHead className="font-medium text-slate-700">Contact</TableHead>
            <TableHead className="font-medium text-slate-700">Localisation</TableHead>
            <TableHead className="font-medium text-slate-700">Client depuis</TableHead>
            <TableHead className="font-medium text-slate-700">Achats</TableHead>
            <TableHead className="text-right font-medium text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-slate-50">
              <TableCell>
                <div className="font-medium text-slate-900">{getClientName(client)}</div>
                <div className="text-sm text-slate-500">{client.email}</div>
              </TableCell>
              <TableCell>{getClientTypeBadge(client.clientType)}</TableCell>
              <TableCell className="text-slate-700">{client.phone || "Non renseigné"}</TableCell>
              <TableCell className="text-slate-700">
                {client.city}, {client.country}
              </TableCell>
              <TableCell className="text-slate-700">{format(client.createdAt, "dd/MM/yyyy", { locale: fr })}</TableCell>
              <TableCell className="font-medium text-slate-900">{client.totalPurchases}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild className="text-slate-700 h-8 w-8">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="text-slate-700 h-8 w-8">
                    <Link href={`/dashboard/clients/${client.id}/modifier`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Import Users icon
import { Users } from "lucide-react"
