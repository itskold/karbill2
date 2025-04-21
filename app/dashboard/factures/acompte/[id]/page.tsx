"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  ArrowLeft,
  FileDown,
  Edit,
  Trash2,
  MoreHorizontal,
  Receipt,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Ban,
  Share,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { mockDeposits } from "@/components/factures/utils"

export default function DepositInvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Récupération des données de la facture d'acompte
  const deposit = mockDeposits.find((d) => d.id === params.id) || mockDeposits[0]

  // Fonction pour télécharger le PDF
  const handleDownloadPDF = () => {
    console.log("Téléchargement du PDF de la facture", deposit.number)
    // Logique de téléchargement à implémenter
  }

  // Fonction pour supprimer la facture
  const handleDelete = () => {
    console.log("Suppression de la facture", deposit.number)
    setDeleteDialogOpen(false)
    router.push("/dashboard/factures/acompte")
  }

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Payée
          </span>
        )
      case "sent":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" /> Envoyée
          </span>
        )
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            <FileText className="mr-1 h-3 w-3" /> Brouillon
          </span>
        )
      case "overdue":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> En retard
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="mr-1 h-3 w-3" /> Annulée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {status}
          </span>
        )
    }
  }

  // Fonction pour formater la date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Non définie"
    try {
      if (typeof date === "string") {
        return format(new Date(date), "dd MMMM yyyy", { locale: fr })
      }
      return format(date, "dd MMMM yyyy", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return "Date invalide"
    }
  }

  // Fonction pour formater le prix
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return "-"
    return price.toLocaleString() + " €"
  }

  // Fonction pour obtenir le texte du moyen de paiement
  const getPaymentMethodText = (method?: string): string => {
    if (!method) return "-"

    switch (method) {
      case "cash":
        return "Espèces"
      case "card":
        return "Carte bancaire"
      case "transfer":
        return "Virement"
      case "check":
        return "Chèque"
      case "bank":
        return "Virement bancaire"
      default:
        return method
    }
  }

  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/factures/acompte")}
                className="h-8 w-8 mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Facture d'acompte #{deposit.number}</h1>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span>{formatDate(deposit.issueDate)}</span>
                  <span>•</span>
                  <span>{formatPrice(deposit.total)}</span>
                  <span>•</span>
                  <span>{getStatusBadge(deposit.status)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-slate-700" onClick={handleDownloadPDF}>
                <FileDown className="mr-1 h-4 w-4" /> Télécharger PDF
              </Button>
              <Button variant="outline" size="sm" className="text-slate-700">
                <Share className="mr-1 h-4 w-4" /> Partager
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                onClick={() => router.push(`/dashboard/factures/acompte/${params.id}/edit`)}
              >
                <Edit className="mr-1 h-4 w-4" /> Modifier
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-slate-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.print()}>
                    <FileDown className="mr-2 h-4 w-4" /> Exporter en PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/factures/nouvelle-vente?from=${params.id}`)}>
                    <FileText className="mr-2 h-4 w-4" /> Créer facture finale
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b mb-8">
            <TabsTrigger
              value="details"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-[18px] w-[18px]" />
                Détails
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <History className="h-[18px] w-[18px]" />
                Historique
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations client */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deposit.client ? (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1">Nom</h3>
                          <p className="text-slate-900">{deposit.client.name}</p>
                        </div>
                        {deposit.client.email && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-500 mb-1">Email</h3>
                            <p className="text-slate-900">{deposit.client.email}</p>
                          </div>
                        )}
                        {deposit.client.phone && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-500 mb-1">Téléphone</h3>
                            <p className="text-slate-900">{deposit.client.phone}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500">Aucun client associé</p>
                    )}
                  </div>
                </CardContent>
                {deposit.client && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/clients/${deposit.client.id}`)}
                    >
                      Voir la fiche client
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Détails de paiement */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Détails de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Montant</h3>
                      <p className="text-xl font-semibold text-slate-900">{formatPrice(deposit.total)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Statut</h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            deposit.status === "paid"
                              ? "bg-green-500"
                              : deposit.status === "sent"
                                ? "bg-blue-500"
                                : deposit.status === "draft"
                                  ? "bg-slate-500"
                                  : deposit.status === "overdue"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                          }`}
                        />
                        <p className="text-slate-900">
                          {deposit.status === "paid"
                            ? "Payé"
                            : deposit.status === "sent"
                              ? "Envoyée"
                              : deposit.status === "draft"
                                ? "Brouillon"
                                : deposit.status === "overdue"
                                  ? "En retard"
                                  : "Annulée"}
                        </p>
                      </div>
                    </div>
                    {deposit.paymentMethod && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Méthode de paiement</h3>
                        <p className="text-slate-900">{getPaymentMethodText(deposit.paymentMethod)}</p>
                      </div>
                    )}
                    {deposit.paymentDate && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Date de paiement</h3>
                        <p className="text-slate-900">{formatDate(deposit.paymentDate)}</p>
                      </div>
                    )}
                    {deposit.depositPercentage && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Pourcentage d'acompte</h3>
                        <p className="text-slate-900">{deposit.depositPercentage}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Véhicule associé (si disponible) */}
              {deposit.vehicle && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Véhicule associé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Marque et modèle</h3>
                        <p className="text-slate-900">
                          {deposit.vehicle.make} {deposit.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Immatriculation</h3>
                        <p className="text-slate-900">{deposit.vehicle.licensePlate}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/vehicules/${deposit.vehicle.id}`)}
                    >
                      Voir la fiche véhicule
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Détails de la facture */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Détails de la facture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Numéro</span>
                      <span className="font-medium text-slate-900">{deposit.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Date d'émission</span>
                      <span className="text-slate-900">{formatDate(deposit.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Date d'échéance</span>
                      <span className="text-slate-900">{formatDate(deposit.dueDate)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Montant HT</span>
                      <span className="text-slate-900">{formatPrice(deposit.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">TVA</span>
                      <span className="text-slate-900">{formatPrice(deposit.taxTotal)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-900">Total TTC</span>
                      <span className="text-slate-900">{formatPrice(deposit.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description et notes */}
            {(deposit.description || deposit.notes) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900">{deposit.description || "Aucune description disponible."}</p>
                  {deposit.notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-medium mb-2">Notes</h3>
                        <p className="text-sm text-slate-600">{deposit.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique de la facture</CardTitle>
                <CardDescription>Tous les événements liés à cette facture d'acompte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Ligne verticale pour la timeline */}
                  <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-slate-200" />

                  <div className="space-y-4">
                    {/* Événement de création */}
                    <div className="flex gap-4 relative">
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center z-10">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <h4 className="font-medium text-slate-900">Facture créée</h4>
                          <p className="text-sm text-slate-500">
                            {deposit.createdAt ? formatDate(deposit.createdAt) : "Date inconnue"}
                          </p>
                        </div>
                        <p className="text-slate-700">
                          La facture d'acompte a été créée avec le numéro {deposit.number}
                        </p>
                      </div>
                    </div>

                    {/* Événement de mise à jour si différent de la création */}
                    {deposit.updatedAt && deposit.updatedAt.toString() !== deposit.createdAt?.toString() && (
                      <div className="flex gap-4 relative">
                        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center z-10">
                          <Edit className="h-5 w-5 text-amber-700" />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                            <h4 className="font-medium text-slate-900">Facture modifiée</h4>
                            <p className="text-sm text-slate-500">{formatDate(deposit.updatedAt)}</p>
                          </div>
                          <p className="text-slate-700">La facture d'acompte a été mise à jour</p>
                        </div>
                      </div>
                    )}

                    {/* Événement de paiement si payé */}
                    {deposit.status === "paid" && deposit.paymentDate && (
                      <div className="flex gap-4 relative">
                        <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center z-10">
                          <CheckCircle className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                            <h4 className="font-medium text-slate-900">Paiement reçu</h4>
                            <p className="text-sm text-slate-500">{formatDate(deposit.paymentDate)}</p>
                          </div>
                          <p className="text-slate-700">
                            Paiement de {formatPrice(deposit.total)} reçu par{" "}
                            {getPaymentMethodText(deposit.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Créée le</p>
                    <p className="text-sm text-slate-900">
                      {deposit.createdAt ? formatDate(deposit.createdAt) : "Date inconnue"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Dernière modification</p>
                    <p className="text-sm text-slate-900">
                      {deposit.updatedAt ? formatDate(deposit.updatedAt) : "Date inconnue"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">ID de la facture</p>
                    <p className="text-sm text-slate-900">{deposit.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogue de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture d'acompte ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              La suppression de cette facture entraînera également la suppression de tous les documents et événements
              associés.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
