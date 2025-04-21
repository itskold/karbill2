"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Ban, AlertTriangle, FileText, Receipt, FileCheck, CreditCard } from "lucide-react"

// Types
export type TFactureStatus = "paid" | "sent" | "draft" | "cancelled" | "overdue" | "converted"
export type TFactureType = "sale" | "deposit" | "proforma" | "credit"
export type TPaymentMethod = "cash" | "card" | "transfer" | "check" | "bank"

// Fonction pour obtenir le badge de statut
export const getStatusBadge = (status: TFactureStatus) => {
  switch (status) {
    case "paid":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Payée
        </Badge>
      )
    case "sent":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          <Clock className="mr-1 h-3 w-3" /> Envoyée
        </Badge>
      )
    case "draft":
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">
          <FileText className="mr-1 h-3 w-3" /> Brouillon
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
          <Ban className="mr-1 h-3 w-3" /> Annulée
        </Badge>
      )
    case "overdue":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          <AlertTriangle className="mr-1 h-3 w-3" /> En retard
        </Badge>
      )
    case "converted":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
          <FileCheck className="mr-1 h-3 w-3" /> Convertie
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Fonction pour obtenir le badge de type de facture
export const getTypeBadge = (type: TFactureType) => {
  switch (type) {
    case "sale":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          <FileCheck className="mr-1 h-3 w-3" /> Vente
        </Badge>
      )
    case "deposit":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          <Receipt className="mr-1 h-3 w-3" /> Acompte
        </Badge>
      )
    case "proforma":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
          <FileText className="mr-1 h-3 w-3" /> Proforma
        </Badge>
      )
    case "credit":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          <CreditCard className="mr-1 h-3 w-3" /> Avoir
        </Badge>
      )
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

// Fonction pour obtenir le texte du moyen de paiement
export const getPaymentMethodText = (method?: TPaymentMethod): string => {
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

// Fonction pour formater le prix
export const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return "-"
  return price.toLocaleString() + " €"
}

// Ajouter les données mock pour les proformas et les dépôts après les fonctions existantes

// Données fictives pour les clients et véhicules
export const mockClients = [
  { id: "c1", name: "Dupont Jean", email: "jean.dupont@example.com", phone: "0612345678" },
  { id: "c2", name: "Martin Sophie", email: "sophie.martin@example.com", phone: "0623456789" },
  { id: "c3", name: "Bernard Thomas", email: "thomas.bernard@example.com", phone: "0634567890" },
  { id: "c4", name: "Petit Laura", email: "laura.petit@example.com", phone: "0645678901" },
  { id: "c5", name: "Durand Michel", email: "michel.durand@example.com", phone: "0656789012" },
]

export const mockVehicles = [
  { id: "v1", make: "Peugeot", model: "308", year: 2022, price: 25000, vin: "VF3LBHZTXLS123456" },
  { id: "v2", make: "Renault", model: "Clio", year: 2021, price: 18500, vin: "VF15RPNJ5MT789012" },
  { id: "v3", make: "Citroën", model: "C3", year: 2023, price: 19800, vin: "VF7SXHMZ3LT345678" },
  { id: "v4", make: "Volkswagen", model: "Golf", year: 2022, price: 28500, vin: "WVWZZZAUZNW901234" },
  { id: "v5", make: "BMW", model: "Série 3", year: 2021, price: 42000, vin: "WBA5E51070G567890" },
]

// Données fictives pour les factures proforma
export const mockProformas = [
  {
    id: "p1",
    number: "PRO-2023-001",
    client: { id: "c1", name: "Dupont Jean" },
    vehicle: { id: "v1", make: "Peugeot", model: "308" },
    issueDate: new Date(2023, 0, 15),
    dueDate: new Date(2023, 1, 15),
    total: 1250.5,
    status: "draft",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p2",
    number: "PRO-2023-002",
    client: { id: "c2", name: "Martin Sophie" },
    vehicle: { id: "v2", make: "Renault", model: "Clio" },
    issueDate: new Date(2023, 1, 5),
    dueDate: new Date(2023, 2, 5),
    total: 2340.75,
    status: "sent",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p3",
    number: "PRO-2023-003",
    client: { id: "c3", name: "Bernard Thomas" },
    vehicle: { id: "v3", make: "Citroën", model: "C3" },
    issueDate: new Date(2023, 2, 10),
    dueDate: new Date(2023, 3, 10),
    total: 1875.25,
    status: "sent",
    type: "proforma",
    convertedToInvoice: true,
  },
  {
    id: "p4",
    number: "PRO-2023-004",
    client: { id: "c4", name: "Petit Laura" },
    vehicle: { id: "v4", make: "Volkswagen", model: "Golf" },
    issueDate: new Date(2023, 3, 20),
    dueDate: new Date(2023, 4, 20),
    total: 3150.0,
    status: "draft",
    type: "proforma",
    convertedToInvoice: false,
  },
  {
    id: "p5",
    number: "PRO-2023-005",
    client: { id: "c5", name: "Durand Michel" },
    vehicle: { id: "v5", make: "BMW", model: "Série 3" },
    issueDate: new Date(2023, 4, 5),
    dueDate: new Date(2023, 5, 5),
    total: 4250.5,
    status: "sent",
    type: "proforma",
    convertedToInvoice: true,
  },
]

// Données fictives pour les factures d'acompte
export const mockDeposits = [
  {
    id: "d1",
    number: "DEP-2023-001",
    clientId: "c1",
    vehicleId: "v1",
    issueDate: new Date(2023, 0, 10),
    depositAmount: 500,
    depositPercentage: 20,
    status: "paid",
    mainInvoiceId: "inv001",
  },
  {
    id: "d2",
    number: "DEP-2023-002",
    clientId: "c2",
    vehicleId: "v2",
    issueDate: new Date(2023, 1, 15),
    depositAmount: 750,
    depositPercentage: 30,
    status: "sent",
    mainInvoiceId: null,
  },
  {
    id: "d3",
    number: "DEP-2023-003",
    clientId: "c3",
    vehicleId: "v3",
    issueDate: new Date(2023, 2, 20),
    depositAmount: 600,
    depositPercentage: 25,
    status: "draft",
    mainInvoiceId: null,
  },
  {
    id: "d4",
    number: "DEP-2023-004",
    clientId: "c4",
    vehicleId: "v4",
    issueDate: new Date(2023, 3, 5),
    depositAmount: 1000,
    depositPercentage: 35,
    status: "overdue",
    mainInvoiceId: null,
  },
  {
    id: "d5",
    number: "DEP-2023-005",
    clientId: "c5",
    vehicleId: "v5",
    issueDate: new Date(2023, 4, 10),
    depositAmount: 1200,
    depositPercentage: 40,
    status: "paid",
    mainInvoiceId: "inv005",
  },
]
