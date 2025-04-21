"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Download,
  Printer,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Car,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockProformas, getStatusBadge, formatPrice } from "@/components/factures/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FactureDetailPageClient({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("details")

  // Simuler la récupération des données de la facture
  const invoice = mockProformas.find((p) => p.id === params.id) || {
    id: "default",
    number: "FAC-2024-0001",
    status: "draft",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    items: [],
    client: {
      id: "c1",
      name: "Client par défaut",
      email: "client@example.com",
      phone: "0123456789",
      address: "123 Rue Principale",
      postalCode: "75000",
      city: "Paris",
      country: "France",
    },
    // Pas de véhicule par défaut
    notes: "",
  }

  // Simuler un statut pour cette facture (draft, sent, paid, overdue)
  const status = invoice.status || "draft"

  // Simuler une date de paiement si la facture est payée
  const paymentDate = status === "paid" ? new Date() : null

  // Simuler un moyen de paiement
  const paymentMethod = "Virement bancaire"

  // Simuler un historique d'événements
  const events = [
    {
      id: 1,
      date: new Date(2023, 10, 15, 9, 30),
      type: "created",
      description: "Facture créée",
      user: "Jean Dupont",
    },
    {
      id: 2,
      date: new Date(2023, 10, 15, 10, 45),
      type: "sent",
      description: "Facture envoyée au client",
      user: "Jean Dupont",
    },
    {
      id: 3,
      date: new Date(2023, 10, 20, 14, 15),
      type: "viewed",
      description: "Facture consultée par le client",
      user: "Client",
    },
    ...(status === "paid"
      ? [
          {
            id: 4,
            date: paymentDate || new Date(),
            type: "paid",
            description: `Paiement reçu (${paymentMethod})`,
            user: "Système",
          },
        ]
      : []),
    ...(status === "overdue"
      ? [
          {
            id: 4,
            date: new Date(2023, 11, 1, 8, 0),
            type: "overdue",
            description: "Facture en retard de paiement",
            user: "Système",
          },
          {
            id: 5,
            date: new Date(2023, 11, 2, 9, 30),
            type: "reminder",
            description: "Rappel de paiement envoyé",
            user: "Jean Dupont",
          },
        ]
      : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/factures"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Facture {invoice.number}</h1>
          {getStatusBadge(status)}
        </div>
        <div className="flex items-center gap-2">
          {status === "draft" && (
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Finaliser et envoyer
            </Button>
          )}
          {status === "sent" && (
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer comme payée
            </Button>
          )}
          {status === "overdue" && (
            <>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Envoyer un rappel
              </Button>
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme payée
              </Button>
            </>
          )}
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Envoyer par email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Dupliquer
              </DropdownMenuItem>
              {status !== "paid" && (
                <DropdownMenuItem>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme payée
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {status === "overdue" && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Facture en retard</AlertTitle>
          <AlertDescription>
            Cette facture a dépassé sa date d'échéance. Veuillez contacter le client pour un règlement immédiat.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Détails
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Historique
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Numéro</span>
                    <span className="font-medium">{invoice.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date d'émission</span>
                    <span className="font-medium">{invoice.issueDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date d'échéance</span>
                    <span className="font-medium">{invoice.dueDate.toLocaleDateString()}</span>
                  </div>
                  {status === "paid" && paymentDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date de paiement</span>
                      <span className="font-medium">{paymentDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  {status === "paid" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Moyen de paiement</span>
                      <span className="font-medium">{paymentMethod}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <span>{getStatusBadge(status)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Montants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{formatPrice(invoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">TVA (21%)</span>
                    <span className="font-medium">{formatPrice(invoice.tax)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Remise</span>
                      <span className="font-medium text-destructive">-{formatPrice(invoice.discount)}</span>
                    </div>
                  )}
                  {/* Simuler un acompte déjà payé */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Acompte payé</span>
                    <span className="font-medium text-destructive">-{formatPrice(1500)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(invoice.total - 1500)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <User className="mr-2 h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="font-medium">{invoice.client.name}</div>
                  <div className="text-muted-foreground">{invoice.client.email}</div>
                  <div className="text-muted-foreground">{invoice.client.phone}</div>
                  <div className="text-muted-foreground">{invoice.client.address}</div>
                  <div className="text-muted-foreground">
                    {invoice.client.postalCode} {invoice.client.city}
                  </div>
                  <div className="text-muted-foreground">{invoice.client.country}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/dashboard/clients/${invoice.client.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir la fiche client
                </Link>
              </CardFooter>
            </Card>
          </div>

          {invoice.vehicle && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <Car className="mr-2 h-4 w-4" />
                  Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="grid gap-2 text-sm">
                    <div className="font-medium">
                      {invoice.vehicle.make} {invoice.vehicle.model}
                    </div>
                    <div className="text-muted-foreground">Année: {invoice.vehicle.year || "N/A"}</div>
                    <div className="text-muted-foreground">
                      Kilométrage: {invoice.vehicle.mileage ? invoice.vehicle.mileage.toLocaleString() : "N/A"} km
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="font-medium">Détails techniques</div>
                    <div className="text-muted-foreground">Carburant: {invoice.vehicle.fuel || "N/A"}</div>
                    <div className="text-muted-foreground">Transmission: {invoice.vehicle.transmission || "N/A"}</div>
                    <div className="text-muted-foreground">Puissance: {invoice.vehicle.power || "N/A"} ch</div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="font-medium">Identification</div>
                    <div className="text-muted-foreground">VIN: {invoice.vehicle.vin || "N/A"}</div>
                    <div className="text-muted-foreground">
                      Immatriculation: {invoice.vehicle.registration || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {invoice.vehicle.id && (
                  <Link
                    href={`/dashboard/vehicules/${invoice.vehicle.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Voir la fiche véhicule
                  </Link>
                )}
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Quantité</th>
                      <th className="px-4 py-3 font-medium text-right">Prix unitaire</th>
                      <th className="px-4 py-3 font-medium text-right">TVA</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.description}</div>
                          {item.details && <div className="text-muted-foreground">{item.details}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-medium">
                        Sous-total
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(invoice.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-medium">
                        TVA (21%)
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(invoice.tax)}</td>
                    </tr>
                    {invoice.discount > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium">
                          Remise
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-destructive">
                          -{formatPrice(invoice.discount)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-medium">
                        Acompte payé
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-destructive">-{formatPrice(1500)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-lg font-bold">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold">{formatPrice(invoice.total - 1500)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Afficher un lien vers la facture proforma d'origine si cette facture a été convertie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Documents liés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Facture Proforma P-2023-001</span>
                  </div>
                  <Link
                    href={`/dashboard/factures/proforma/p1`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique des événements</CardTitle>
              <CardDescription>Suivi chronologique des actions liées à cette facture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                      {event.type === "created" && <FileText className="h-4 w-4" />}
                      {event.type === "sent" && <Send className="h-4 w-4" />}
                      {event.type === "viewed" && <User className="h-4 w-4" />}
                      {event.type === "paid" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {event.type === "overdue" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {event.type === "reminder" && <Clock className="h-4 w-4" />}
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.description}</span>
                        {event.type === "overdue" && <Badge variant="destructive">En retard</Badge>}
                        {event.type === "paid" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Payée
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {event.date.toLocaleDateString()} à{" "}
                          {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>•</span>
                        <span>{event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
