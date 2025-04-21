"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  History,
  MoreHorizontal,
  Receipt,
  Share,
  Trash2,
  User,
  Car,
  Clock,
  Send,
  FileCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { mockProformas, getStatusBadge, getTypeBadge, formatPrice } from "@/components/factures/utils"

export default function ProformaDetailPageClient({ params }: { params: { id: string } }) {
  const proforma = mockProformas.find((p) => p.id === params.id)

  if (!proforma) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/factures/proforma">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Proforma {proforma.number}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{proforma.issueDate.toLocaleDateString()}</span>
              <span>•</span>
              <span>{formatPrice(proforma.total)}</span>
              <span>•</span>
              <span>{proforma.client.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <Link href={`/dashboard/factures/proforma/${proforma.id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
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
                Télécharger PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Envoyer par email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileCheck className="mr-2 h-4 w-4" />
                Convertir en facture
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Êtes-vous sûr de vouloir supprimer cette facture proforma ?</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible et supprimera définitivement la facture proforma {proforma.number}.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert variant="destructive">
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                      La suppression de cette facture proforma entraînera la perte de toutes les données associées.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button variant="outline">Annuler</Button>
                    <Button variant="destructive">Supprimer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="details" className="flex-1">
        <div className="border-b px-4 md:px-8">
          <TabsList className="h-12">
            <TabsTrigger value="details" className="data-[state=active]:bg-background">
              <Receipt className="mr-2 h-4 w-4" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-background">
              <History className="mr-2 h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-4 md:p-8">
          <TabsContent value="details" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Numéro</span>
                      <span className="font-medium">{proforma.number}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Statut</span>
                      <span>{getStatusBadge(proforma.status)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Type</span>
                      <span>{getTypeBadge(proforma.type)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Date d'émission</span>
                      <span>{proforma.issueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Date d'échéance</span>
                      <span>{proforma.dueDate.toLocaleDateString()}</span>
                    </div>
                    {proforma.convertedToInvoice && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Convertie en facture</span>
                        <span className="font-medium text-emerald-600">Oui</span>
                      </div>
                    )}
                    {proforma.convertedInvoiceId && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Facture liée</span>
                        <Link
                          href={`/dashboard/factures/vente/${proforma.convertedInvoiceId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {proforma.convertedInvoiceNumber}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Montants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatPrice(proforma.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">TVA</span>
                      <span>{formatPrice(proforma.taxTotal)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between py-1 font-medium">
                      <span>Total</span>
                      <span>{formatPrice(proforma.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Client</CardTitle>
                  <Link href={`/dashboard/clients/${proforma.clientId}`}>
                    <Button variant="ghost" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Voir la fiche
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Nom</span>
                      <span className="font-medium">{proforma.client.name}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Email</span>
                      <span>{proforma.client.email}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span>{proforma.client.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {proforma.vehicleId && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Véhicule</CardTitle>
                    <Link href={`/dashboard/vehicules/${proforma.vehicleId}`}>
                      <Button variant="ghost" size="sm">
                        <Car className="mr-2 h-4 w-4" />
                        Voir la fiche
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-1">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Marque</span>
                        <span className="font-medium">{proforma.vehicle.make}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Modèle</span>
                        <span>{proforma.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Immatriculation</span>
                        <span>{proforma.vehicle.licensePlate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
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
                        {proforma.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">{formatPrice(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                            <td className="px-4 py-3 text-right">
                              {formatPrice(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {proforma.notes && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{proforma.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Historique des actions</CardTitle>
                <CardDescription>Suivi des modifications et actions sur cette facture proforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative ml-3 space-y-4 pt-2">
                  <div className="absolute bottom-0 left-0 top-2 w-px bg-border"></div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                      <FileText className="h-3 w-3" />
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">Création de la facture proforma</h4>
                        <time className="text-sm text-muted-foreground">{proforma.createdAt.toLocaleDateString()}</time>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        La facture proforma a été créée avec le numéro {proforma.number}.
                      </p>
                    </div>
                  </div>

                  {proforma.status === "sent" && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                        <Send className="h-3 w-3" />
                      </div>
                      <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-semibold">Envoi au client</h4>
                          <time className="text-sm text-muted-foreground">
                            {new Date(proforma.updatedAt).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          La facture proforma a été envoyée au client par email.
                        </p>
                      </div>
                    </div>
                  )}

                  {proforma.convertedToInvoice && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                        <FileCheck className="h-3 w-3" />
                      </div>
                      <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-semibold">Conversion en facture</h4>
                          <time className="text-sm text-muted-foreground">
                            {new Date(proforma.convertedDate).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          La facture proforma a été convertie en facture de vente {proforma.convertedInvoiceNumber}.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div className="rounded-lg border bg-muted p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">Informations système</h4>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Créée le</span>
                          <span>{proforma.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière modification</span>
                          <span>{proforma.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
