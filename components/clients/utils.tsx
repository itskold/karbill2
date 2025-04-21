import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  CreditCard,
} from "lucide-react";
import type {
  TClientType,
  TPreferredContactMethod,
  TPaymentMethod,
  TDocumentType,
  TInteractionType,
} from "@/components/clients/types";

// Fonction pour obtenir le badge de type de client
export const getClientTypeBadge = (clientType: TClientType) => {
  switch (clientType) {
    case "particulier":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
        >
          <User className="mr-1 h-3 w-3" /> Particulier
        </Badge>
      );
    case "professionnel":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
        >
          <Building2 className="mr-1 h-3 w-3" /> Entreprise
        </Badge>
      );
    default:
      return <Badge variant="outline">{clientType}</Badge>;
  }
};

// Fonction pour obtenir le nom complet du client
export const getClientName = (client: {
  clientType: TClientType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) => {
  if (client.clientType === "particulier") {
    return `${client.firstName} ${client.lastName}`;
  } else {
    return client.companyName;
  }
};

// Fonction pour obtenir l'icône de la méthode de contact préférée
export const getContactMethodIcon = (method: TPreferredContactMethod) => {
  switch (method) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    case "mail":
      return <FileText className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

// Fonction pour obtenir le texte de la méthode de contact préférée
export const getContactMethodText = (
  method: TPreferredContactMethod
): string => {
  switch (method) {
    case "email":
      return "Email";
    case "phone":
      return "Téléphone";
    case "mail":
      return "Courrier postal";
    default:
      return method;
  }
};

// Fonction pour obtenir l'icône du type d'interaction
export const getInteractionIcon = (type: TInteractionType) => {
  switch (type) {
    case "call":
      return <Phone className="h-4 w-4 text-blue-500" />;
    case "email":
      return <Mail className="h-4 w-4 text-amber-500" />;
    case "meeting":
      return <User className="h-4 w-4 text-green-500" />;
    case "note":
      return <FileText className="h-4 w-4 text-purple-500" />;
    default:
      return <FileText className="h-4 w-4 text-slate-500" />;
  }
};

// Fonction pour obtenir l'icône du type de document
export const getDocumentIcon = (type: TDocumentType) => {
  switch (type) {
    case "invoice":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "contract":
      return <FileText className="h-4 w-4 text-amber-500" />;
    case "receipt":
      return <CreditCard className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 text-slate-500" />;
  }
};

// Fonction pour obtenir l'icône du moyen de paiement
export const getPaymentMethodIcon = (method: TPaymentMethod) => {
  switch (method) {
    case "cash":
      return <CreditCard className="h-4 w-4 text-green-500" />;
    case "card":
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case "transfer":
      return <CreditCard className="h-4 w-4 text-amber-500" />;
    case "check":
      return <CreditCard className="h-4 w-4 text-purple-500" />;
    default:
      return <CreditCard className="h-4 w-4 text-slate-500" />;
  }
};

// Fonction pour obtenir le texte du moyen de paiement
export const getPaymentMethodText = (method: TPaymentMethod): string => {
  switch (method) {
    case "cash":
      return "Espèces";
    case "card":
      return "Carte";
    case "transfer":
      return "Virement";
    case "check":
      return "Chèque";
    default:
      return method;
  }
};
