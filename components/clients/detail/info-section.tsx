"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getContactMethodText } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"

interface InfoSectionProps {
  client: IClient
}

export function InfoSection({ client }: InfoSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Informations principales</CardTitle>
          </CardHeader>
          <CardContent>
            {client.clientType === "individual" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Prénom</p>
                    <p className="text-slate-900">{client.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nom</p>
                    <p className="text-slate-900">{client.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Date de naissance</p>
                    <p className="text-slate-900">
                      {client.birthDate ? format(new Date(client.birthDate), "dd MMMM yyyy", { locale: fr }) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nom de l'entreprise</p>
                    <p className="text-slate-900">{client.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Numéro de TVA</p>
                    <p className="text-slate-900">{client.vatNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Numéro d'entreprise</p>
                    <p className="text-slate-900">{client.companyNumber || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques client */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Client depuis</p>
              <p className="text-sm font-semibold text-slate-900">
                {client.createdAt ? format(new Date(client.createdAt), "dd MMMM yyyy", { locale: fr }) : "-"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Dernier achat</p>
              <p className="text-sm font-semibold text-slate-900">
                {client.lastPurchaseDate
                  ? format(new Date(client.lastPurchaseDate), "dd MMMM yyyy", { locale: fr })
                  : "Aucun"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Nombre d'achats</p>
              <p className="text-sm font-semibold text-slate-900">{client.totalPurchases || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total dépensé</p>
              <p className="text-sm font-semibold text-slate-900">{(client.totalSpent || 0).toLocaleString()} €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coordonnées */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-md">
                  <Mail className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-slate-900">{client.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-md">
                  <Phone className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Téléphone</p>
                  <p className="text-slate-900">{client.phone || "-"}</p>
                </div>
              </div>
              {client.mobile && (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-md">
                    <Phone className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Mobile</p>
                    <p className="text-slate-900">{client.mobile}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-md">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Adresse</p>
                  <p className="text-slate-900">
                    {client.address || "-"}
                    {client.addressComplement && `, ${client.addressComplement}`}
                  </p>
                  {client.postalCode && client.city && (
                    <p className="text-slate-900">
                      {client.postalCode} {client.city}, {client.country || "Belgique"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Préférences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Méthode de contact préférée</p>
              <p className="text-slate-900">{getContactMethodText(client.preferredContactMethod)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Emails marketing</p>
              <p className="text-slate-900">{client.sendMarketingEmails ? "Acceptés" : "Refusés"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-line">{client.notes || "Aucune note"}</p>
        </CardContent>
      </Card>
    </>
  )
}
