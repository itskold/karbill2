"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  ArrowLeft,
  Printer,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  Shield,
  Clock,
  Car,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getGuaranteeTypeBadge, getApplicabilityBadge, getGuaranteeStatusBadge } from "@/components/garanties/utils"

// Données mockées pour la démonstration
const mockGuarantee = {
  id: "g1",
  templateId: "t1",
  vehicleId: "v1",
  clientId: "c1",
  invoiceId: "i1",
  startDate: new Date(2023, 5, 15),
  endDate: new Date(2025, 5, 14),
  status: "active",
  price: 1200,
  notes: "Garantie standard pour véhicule neuf",
  createdAt: new Date(2023, 5, 10),
  updatedAt: new Date(2023, 5, 10),
  events: [
    {
      id: "e1",
      type: "creation",
      date: new Date(2023, 5, 10),
      description: "Création de la garantie",
      user: "John Doe",
    },
    {
      id: "e2",
      type: "activation",
      date: new Date(2023, 5, 15),
      description: "Activation de la garantie",
      user: "John Doe",
    },
    {
      id: "e3",
      type: "modification",
      date: new Date(2023, 6, 1),
      description: "Modification des conditions",
      user: "Jane Smith",
    },
  ],
}

const mockTemplate = {
  id: "t1",
  name: "Garantie Premium 24 mois",
  description: "Garantie complète couvrant tous les composants mécaniques et électroniques",
  type: "premium",
  duration: 24,
  applicability: "new",
  conditions: "Véhicule de moins de 3 ans et moins de 100 000 km",
  limitations: "Exclus: pièces d'usure normale, consommables, et dommages dus à une utilisation inappropriée",
  status: "active",
  price: 1200,
  createdAt: new Date(2022, 1, 15),
  updatedAt: new Date(2023, 3, 20),
}

const mockVehicle = {
  id: "v1",
  brand: "Peugeot",
  model: "3008",
  year: 2022,
  vin: "VF30ABCDE12345678",
  registration: "AB-123-CD",
}

const mockClient = {
  id: "c1",
  name: "Martin Dupont",
  email: "martin.dupont@example.com",
  phone: "06 12 34 56 78",
}

export default function GuaranteeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Dans une application réelle, vous récupéreriez les données de la garantie à partir de l'API
  const guarantee = mockGuarantee
  const template = mockTemplate
  const vehicle = mockVehicle
  const client = mockClient

  // Fonction pour formater la durée en mois/années
  const formatDuration = (months: number) => {
    if (months < 12) {
      return `${months} mois`
    } else if (months % 12 === 0) {
      return `${months / 12} an${months > 12 ? "s" : ""}`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      return `${years} an${years > 1 ? "s" : ""} et ${remainingMonths} mois`
    }
  }

  // Fonction pour obtenir l'icône d'événement en fonction du type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "activation":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "modification":
        return <Edit className="h-5 w-5 text-amber-500" />
      case "cancellation":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-500" />
    }
  }

  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/dashboard/factures/garanties")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{template.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-normal">
                  ID: {guarantee.id}
                </Badge>
                {getGuaranteeTypeBadge(template.type)}
                {getGuaranteeStatusBadge(guarantee.status)}
                {getApplicabilityBadge(template.applicability)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9"
              onClick={() => router.push(`/dashboard/factures/garanties/${params.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" /> Exporter
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" /> Prolonger
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer cette garantie ?</DialogTitle>
                      <DialogDescription>
                        Cette action est irréversible. La garantie sera définitivement supprimée de notre système.
                      </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Attention</AlertTitle>
                      <AlertDescription>
                        La suppression de cette garantie annulera toute couverture associée au véhicule.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter className="mt-6">
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDeleteDialogOpen(false)
                          router.push("/dashboard/factures/garanties")
                        }}
                      >
                        Supprimer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b mb-8">
            <TabsTrigger
              value="details"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <Shield className="mr-2 h-[18px] w-[18px]" /> Détails
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <Clock className="mr-2 h-[18px] w-[18px]" /> Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations sur le modèle de garantie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" /> Modèle de garantie
                  </CardTitle>
                  <CardDescription>Informations sur le modèle de garantie appliqué</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Nom</p>
                      <p className="text-slate-900">{template.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Description</p>
                      <p className="text-slate-900">{template.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Type</p>
                      <div>{getGuaranteeTypeBadge(template.type)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Durée</p>
                      <p className="text-slate-900">{formatDuration(template.duration)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails de l'application de la garantie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" /> Détails de l'application
                  </CardTitle>
                  <CardDescription>Informations sur l'application de cette garantie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date de début</p>
                      <p className="text-slate-900">{format(guarantee.startDate, "dd MMMM yyyy", { locale: fr })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date de fin</p>
                      <p className="text-slate-900">{format(guarantee.endDate, "dd MMMM yyyy", { locale: fr })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Statut</p>
                      <div>{getGuaranteeStatusBadge(guarantee.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Prix appliqué</p>
                      <p className="text-slate-900 font-medium">{guarantee.price.toLocaleString()} €</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations sur le véhicule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5 text-primary" /> Véhicule couvert
                  </CardTitle>
                  <CardDescription>Informations sur le véhicule couvert par cette garantie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Marque et modèle</p>
                      <p className="text-slate-900">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Numéro d'immatriculation</p>
                      <p className="text-slate-900">{vehicle.registration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Numéro de série (VIN)</p>
                      <p className="text-slate-900">{vehicle.vin}</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Car className="mr-2 h-4 w-4" /> Voir le véhicule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations sur le client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" /> Client
                  </CardTitle>
                  <CardDescription>Informations sur le client bénéficiaire de cette garantie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Nom</p>
                      <p className="text-slate-900">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email</p>
                      <p className="text-slate-900">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Téléphone</p>
                      <p className="text-slate-900">{client.phone}</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <User className="mr-2 h-4 w-4" /> Voir le client
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditions d'application */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" /> Conditions d'application
                  </CardTitle>
                  <CardDescription>Conditions et limitations de cette garantie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-2">Conditions</h3>
                      <p className="text-slate-900">{template.conditions}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-2">Limitations et exclusions</h3>
                      <p className="text-slate-900">{template.limitations}</p>
                    </div>
                    {guarantee.notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Notes spécifiques</h3>
                          <p className="text-slate-900">{guarantee.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" /> Historique des événements
                </CardTitle>
                <CardDescription>Chronologie des événements liés à cette garantie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {guarantee.events.map((event, index) => (
                    <div key={event.id || index} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                          {getEventIcon(event.type)}
                        </div>
                        {index < guarantee.events.length - 1 && (
                          <div className="h-full w-px bg-slate-200 absolute top-10 bottom-0 left-5"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-slate-900">{event.description}</h3>
                          <p className="text-sm text-slate-500">{format(event.date, "dd MMMM yyyy", { locale: fr })}</p>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Par {event.user}</p>
                      </div>
                    </div>
                  ))}

                  {guarantee.events.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900">Aucun événement</h3>
                      <p className="text-slate-500 mt-1">Aucun événement n'a été enregistré pour cette garantie.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
