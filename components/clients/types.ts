export type TClientType = "particulier" | "professionnel";
export type TPreferredContactMethod = "email" | "phone" | "mail";
export type TPaymentMethod = "cash" | "card" | "transfer" | "check";
export type TDocumentType = "invoice" | "contract" | "receipt" | "other";
export type TInteractionType = "call" | "email" | "meeting" | "note" | "other";

export interface IPurchase {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "cancelled";
  paymentMethod: TPaymentMethod;
  description: string;
  invoiceNumber?: string;
}

export interface IDocument {
  id: string;
  date: Date;
  type: TDocumentType;
  title: string;
  description?: string;
  fileUrl?: string;
}

export interface IInteraction {
  id: string;
  date: Date;
  type: TInteractionType;
  title: string;
  description: string;
  user: string;
}

export interface IClient {
  id: string;
  clientType: TClientType;

  // Informations personnelles (individu)
  firstName?: string;
  lastName?: string;
  birthDate?: string;

  // Informations entreprise
  companyName?: string;
  vatNumber?: string;
  companyNumber?: string;

  // Coordonnées
  email: string;
  phone?: string;
  mobile?: string;

  // Adresse
  address: string;
  addressComplement?: string;
  postalCode: string;
  city: string;
  country: string;

  // Préférences
  preferredContactMethod: TPreferredContactMethod;
  sendMarketingEmails: boolean;

  // Notes
  notes?: string;

  // Relations
  purchases?: IPurchase[];
  documents?: IDocument[];
  interactions?: IInteraction[];

  // Statistiques
  totalPurchases: number;
  totalSpent?: number;
  lastPurchaseDate?: Date;

  // Horodatage
  createdAt: Date;
  updatedAt?: Date;
}
