"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Mail, Phone, Settings, PenToolIcon as Tool, User, Wrench } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

// Types pour les employés
interface IWorker {
  id: string
  name: string
  position: string
  email: string
  phone: string
  startDate: Date
  status: "active" | "inactive" | "on_leave"
  specialties: string[]
  hourlyRate: number
  completedRepairs: number
  currentAssignments: number
  createdAt: Date
  updatedAt: Date
  address?: string
  birthDate?: Date
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  certifications?: {
    name: string
    issuedBy: string
    issuedDate: Date
    expiryDate?: Date
  }[]
  performanceReviews?: {
    date: Date
    rating: number
    comments: string
    reviewedBy: string
  }[]
}

// Données fictives pour les employés
const workers: Record<string, IWorker> = {
  "wor-001": {
    id: "wor-001",
    name: "Michel Dupont",
    position: "Mécanicien senior",
    email: "michel.dupont@example.com",
    phone: "0123456789",
    startDate: new Date("2018-05-10"),
    status: "active",
    specialties: ["Moteur", "Transmission", "Diagnostic électronique"],
    hourlyRate: 25,
    completedRepairs: 342,
    currentAssignments: 3,
    createdAt: new Date("2018-05-10"),
    updatedAt: new Date("2023-01-15"),
    address: "123 Rue des Mécaniciens, 75001 Paris",
    birthDate: new Date("1985-07-15"),
    emergencyContact: {
      name: "Marie Dupont",
      relationship: "Épouse",
      phone: "0123456780",
    },
    certifications: [
      {
        name: "Certification Mécanique Automobile Niveau 3",
        issuedBy: "Centre de Formation Automobile de Paris",
        issuedDate: new Date("2017-06-20"),
      },
      {
        name: "Spécialiste en Diagnostic Électronique",
        issuedBy: "Association des Mécaniciens Professionnels",
        issuedDate: new Date("2019-03-15"),
        expiryDate: new Date("2024-03-15"),
      },
    ],
    performanceReviews: [
      {
        date: new Date("2022-12-10"),
        rating: 4.5,
        comments: "Excellent travail, très fiable et efficace. A dépassé les objectifs de réparation.",
        reviewedBy: "Julie Petit",
      },
      {
        date: new Date("2021-12-15"),
        rating: 4.2,
        comments: "Très bon travail, quelques retards occasionnels mais excellente qualité de réparation.",
        reviewedBy: "Julie Petit",
      },
    ],
  },
}

// Composant pour le badge de statut
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Actif
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Inactif
        </Badge>
      )
    case "on_leave":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          En congé
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function WorkerDetailPage({ params }: { params: { id: string } }) {
  const worker = workers[params.id]

  if (!worker) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/ordres/employe">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Employé non trouvé</h1>
        </div>
        <p>L'employé que vous recherchez n'existe pas.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/ordres/employe">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              {worker.name} {StatusBadge({ status: worker.status })}
            </h1>
            <p className="text-muted-foreground">{worker.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            Assigner
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{worker.email}</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{worker.phone}</p>
              </div>
              {worker.address && (
                <div className="flex items-start">
                  <User className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <p>{worker.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>Embauché le {formatDate(worker.startDate)}</p>
              </div>
              {worker.birthDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>Né le {formatDate(worker.birthDate)}</p>
                </div>
              )}
              <div className="flex items-center">
                <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>Taux horaire: {worker.hourlyRate.toFixed(2)} €/h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>Réparations complétées: {worker.completedRepairs}</p>
              </div>
              <div className="flex items-center">
                <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>Assignations actuelles: {worker.currentAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="specialties" className="mb-6">
        <TabsList>
          <TabsTrigger value="specialties">Spécialités</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="performance">Évaluations</TabsTrigger>
          <TabsTrigger value="emergency">Contact d'urgence</TabsTrigger>
        </TabsList>
        <TabsContent value="specialties" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Spécialités</h3>
            <div className="flex flex-wrap gap-2">
              {worker.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="certifications" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Certifications</h3>
            {worker.certifications && worker.certifications.length > 0 ? (
              <div className="space-y-4">
                {worker.certifications.map((cert, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">Délivré par: {cert.issuedBy}</p>
                        <p className="text-sm text-muted-foreground">Date d'obtention: {formatDate(cert.issuedDate)}</p>
                        {cert.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            Date d'expiration: {formatDate(cert.expiryDate)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune certification enregistrée.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="performance" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Évaluations de performance</h3>
            {worker.performanceReviews && worker.performanceReviews.length > 0 ? (
              <div className="space-y-4">
                {worker.performanceReviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Évaluation du {formatDate(review.date)}</p>
                          <p className="text-sm text-muted-foreground">Par: {review.reviewedBy}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {review.rating}/5
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-sm">{review.comments}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune évaluation de performance enregistrée.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="emergency" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Contact d'urgence</h3>
            {worker.emergencyContact ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">{worker.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">Relation: {worker.emergencyContact.relationship}</p>
                    <p className="text-sm text-muted-foreground">Téléphone: {worker.emergencyContact.phone}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground">Aucun contact d'urgence enregistré.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
