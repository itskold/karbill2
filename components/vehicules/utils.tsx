import { Badge } from "@/components/ui/badge"
import { Check, Clock, Ban, Tag } from "lucide-react"
import type { TVehicleStatus, TFuelType, TTransmission } from "@/components/vehicules/types"

// Fonction pour obtenir le badge de statut
export const getStatusBadge = (status: TVehicleStatus) => {
  switch (status) {
    case "available":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          <Check className="mr-1 h-3 w-3" /> Disponible
        </Badge>
      )
    case "reserved":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          <Clock className="mr-1 h-3 w-3" /> Réservé
        </Badge>
      )
    case "sold":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 font-medium">
          <Tag className="mr-1 h-3 w-3" /> Vendu
        </Badge>
      )
    case "maintenance":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          <Ban className="mr-1 h-3 w-3" /> Maintenance
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Fonction pour obtenir le texte du type de carburant
export const getFuelTypeText = (fuelType: TFuelType): string => {
  switch (fuelType) {
    case "gasoline":
      return "Essence"
    case "diesel":
      return "Diesel"
    case "electric":
      return "Électrique"
    case "hybrid":
      return "Hybride"
    default:
      return fuelType
  }
}

// Fonction pour obtenir le texte du type de transmission
export const getTransmissionText = (transmission: TTransmission): string => {
  return transmission === "manual" ? "Manuelle" : "Automatique"
}

// Fonction pour formater le prix
export const formatPrice = (price?: number): string => {
  if (!price) return "-"
  return price.toLocaleString() + " €"
}
