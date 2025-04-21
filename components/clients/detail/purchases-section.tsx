"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Eye, Edit, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPaymentMethodIcon, getPaymentMethodText } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, X } from "lucide-react"

interface PurchasesSectionProps {
  client: IClient
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          <Check className="mr-1 h-3 w-3" /> Payé
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          <Clock className="mr-1 h-3 w-3" /> En attente
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
          <X className="mr-1 h-3 w-3" /> Annulé
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PurchasesSection({ client }: PurchasesSectionProps) {
  const purchases = client.purchases || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Historique des achats</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un achat
          </Button>
        </div>
        <CardDescription>Liste des achats et transactions du client</CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-700">Date</TableHead>
                <TableHead className="font-medium text-slate-700">Description</TableHead>
                <TableHead className="font-medium text-slate-700">N° Facture</TableHead>
                <TableHead className="font-medium text-slate-700">Paiement</TableHead>
                <TableHead className="font-medium text-slate-700">Statut</TableHead>
                <TableHead className="font-medium text-slate-700 text-right">Montant</TableHead>
                <TableHead className="font-medium text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{format(purchase.date, "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>{purchase.description}</TableCell>
                  <TableCell>{purchase.invoiceNumber || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(purchase.paymentMethod)}
                      <span>{getPaymentMethodText(purchase.paymentMethod)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPaymentStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-right font-medium">{purchase.amount.toLocaleString()} €</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Aucun achat</h3>
            <p className="text-slate-500 mt-1 max-w-md">Ce client n'a pas encore effectué d'achat.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
