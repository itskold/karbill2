export type TFactureStatus = "draft" | "sent" | "paid" | "cancelled" | "overdue"
export type TFactureType = "sale" | "deposit" | "proforma" | "credit"
export type TPaymentMethod = "cash" | "card" | "transfer" | "check"

export interface IFactureItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount?: number
}

export interface IFacture {
  id: string
  number: string
  type: TFactureType
  status: TFactureStatus
  clientId: string
  vehicleId?: string
  issueDate: Date
  dueDate: Date
  items: IFactureItem[]
  subtotal: number
  taxTotal: number
  total: number
  notes?: string
  paymentMethod?: TPaymentMethod
  paymentDate?: Date
  relatedInvoiceId?: string // Pour les factures d'acompte, lien vers la facture principale
  createdAt: Date
  updatedAt: Date
}

export interface IDepositInvoice extends IFacture {
  type: "deposit"
  depositAmount: number
  depositPercentage?: number
  mainInvoiceId?: string // ID de la facture principale à laquelle cet acompte est lié
}
