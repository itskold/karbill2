import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { TGuaranteeType, TGuaranteeStatus, TGuaranteeApplicability } from "@/components/garanties/types"

export function getGuaranteeTypeBadge(type: TGuaranteeType) {
  switch (type) {
    case "standard":
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
          <Shield className="mr-1 h-3 w-3" /> Standard
        </Badge>
      )
    case "extended":
      return (
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
          <Shield className="mr-1 h-3 w-3" /> Étendue
        </Badge>
      )
    case "premium":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-800">
          <Shield className="mr-1 h-3 w-3" /> Premium
        </Badge>
      )
    case "custom":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Shield className="mr-1 h-3 w-3" /> Personnalisée
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="bg-slate-50 text-slate-700 hover:bg-slate-50 hover:text-slate-800">
          <Shield className="mr-1 h-3 w-3" /> Inconnue
        </Badge>
      )
  }
}

export function getApplicabilityBadge(applicability: TGuaranteeApplicability) {
  switch (applicability) {
    case "new":
      return (
        <Badge variant="outline" className="text-xs font-normal">
          Véhicules neufs
        </Badge>
      )
    case "used":
      return (
        <Badge variant="outline" className="text-xs font-normal">
          Véhicules d'occasion
        </Badge>
      )
    case "all":
      return (
        <Badge variant="outline" className="text-xs font-normal">
          Tous véhicules
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs font-normal">
          Non spécifié
        </Badge>
      )
  }
}

export function getGuaranteeStatusBadge(status: TGuaranteeStatus | string) {
  switch (status) {
    case "active":
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="secondary" className="bg-slate-50 text-slate-700 hover:bg-slate-50 hover:text-slate-800">
          Inactive
        </Badge>
      )
    case "draft":
      return (
        <Badge variant="secondary" className="bg-slate-50 text-slate-700 hover:bg-slate-50 hover:text-slate-800">
          Brouillon
        </Badge>
      )
    case "expired":
      return (
        <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Expirée
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Annulée
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="bg-slate-50 text-slate-700 hover:bg-slate-50 hover:text-slate-800">
          Statut inconnu
        </Badge>
      )
  }
}
