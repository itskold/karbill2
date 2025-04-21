import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Phone, MapPin, Mail, Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClientTypeBadge, getClientName } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"

interface ClientGridProps {
  clients: IClient[]
}

export function ClientGrid({ clients }: ClientGridProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card key={client.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-lg text-slate-900">{getClientName(client)}</h3>
                <p className="text-sm text-slate-500">{client.email}</p>
              </div>
              <div>{getClientTypeBadge(client.clientType)}</div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-slate-700">
                <Phone className="h-4 w-4 mr-2 text-slate-400" />
                {client.phone || "Non renseigné"}
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                {client.city}, {client.country}
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                {client.email}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Client depuis</p>
                <p className="text-sm font-medium text-slate-700">
                  {format(client.createdAt, "dd/MM/yyyy", { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Achats</p>
                <p className="text-sm font-medium text-slate-700">{client.totalPurchases}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-700">
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> Voir détails
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}/modifier`}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Import Users icon
import { Users } from "lucide-react"
