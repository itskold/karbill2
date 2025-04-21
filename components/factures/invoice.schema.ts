import { z } from "zod"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore"
import { userService } from "../users/user.schema"

// Schéma ligne de facture
export const invoiceLineSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantite: z.number(),
  prixUnitaire: z.number(),
  tva: z.number().default(20),
  remise: z.number().default(0),
  total: z.number(),
})

export type InvoiceLine = z.infer<typeof invoiceLineSchema>

// Schéma paiement
export const paymentSchema = z.object({
  id: z.string(),
  date: z.date(),
  montant: z.number(),
  mode: z.enum(["espèces", "carte", "virement", "chèque"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export type Payment = z.infer<typeof paymentSchema>

// Schéma facture
export const invoiceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  numero: z.string(),
  clientId: z.string(),
  vehiculeId: z.string().optional(),
  proformaId: z.string().optional(),
  dateCreation: z.date(),
  dateEcheance: z.date().optional(),
  statut: z.enum(["brouillon", "envoyée", "payée", "partiellement_payée", "en_retard", "annulée"]),
  lignes: z.array(invoiceLineSchema),
  paiements: z.array(paymentSchema).optional(),
  totalHT: z.number(),
  totalTVA: z.number(),
  totalTTC: z.number(),
  montantPaye: z.number().default(0),
  notes: z.string().optional(),
  conditionsPaiement: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Invoice = z.infer<typeof invoiceSchema>

// Service Firebase pour les factures
export const invoiceService = {
  // Obtenir la référence à la collection factures d'un utilisateur
  getInvoicesRef(userId: string) {
    return collection(userService.getUserRef(userId), "invoices")
  },

  // Obtenir toutes les factures d'un utilisateur
  async getInvoices(userId: string, constraints: QueryConstraint[] = []): Promise<Invoice[]> {
    const invoicesRef = this.getInvoicesRef(userId)
    const q = query(invoicesRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        dateCreation: data.dateCreation?.toDate(),
        dateEcheance: data.dateEcheance?.toDate(),
        paiements: data.paiements?.map((p: any) => ({
          ...p,
          date: p.date?.toDate(),
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Invoice
    })
  },

  // Obtenir une facture par ID
  async getInvoice(userId: string, invoiceId: string): Promise<Invoice | null> {
    const invoiceRef = doc(this.getInvoicesRef(userId), invoiceId)
    const invoiceDoc = await getDoc(invoiceRef)

    if (!invoiceDoc.exists()) return null

    const data = invoiceDoc.data()
    return {
      id: invoiceDoc.id,
      userId,
      ...data,
      dateCreation: data.dateCreation?.toDate(),
      dateEcheance: data.dateEcheance?.toDate(),
      paiements: data.paiements?.map((p: any) => ({
        ...p,
        date: p.date?.toDate(),
      })),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Invoice
  },

  // Créer une nouvelle facture
  async createInvoice(
    userId: string,
    invoiceData: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const invoicesRef = this.getInvoicesRef(userId)
    const newInvoiceRef = doc(invoicesRef)
    const timestamp = serverTimestamp()

    await setDoc(newInvoiceRef, {
      ...invoiceData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newInvoiceRef.id
  },

  // Mettre à jour une facture
  async updateInvoice(userId: string, invoiceId: string, invoiceData: Partial<Invoice>): Promise<void> {
    const invoiceRef = doc(this.getInvoicesRef(userId), invoiceId)

    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer une facture
  async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    const invoiceRef = doc(this.getInvoicesRef(userId), invoiceId)
    await deleteDoc(invoiceRef)
  },

  // Ajouter un paiement à une facture
  async addPayment(userId: string, invoiceId: string, payment: Omit<Payment, "id">): Promise<void> {
    const invoice = await this.getInvoice(userId, invoiceId)
    if (!invoice) throw new Error("Facture non trouvée")

    const newPayment = {
      id: crypto.randomUUID(),
      ...payment,
    }

    const paiements = invoice.paiements || []
    const montantPaye = invoice.montantPaye + payment.montant

    let statut = invoice.statut
    if (montantPaye >= invoice.totalTTC) {
      statut = "payée"
    } else if (montantPaye > 0) {
      statut = "partiellement_payée"
    }

    await this.updateInvoice(userId, invoiceId, {
      paiements: [...paiements, newPayment],
      montantPaye,
      statut,
    })
  },

  // Obtenir les factures par client
  async getInvoicesByClient(userId: string, clientId: string): Promise<Invoice[]> {
    return this.getInvoices(userId, [where("clientId", "==", clientId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les factures par véhicule
  async getInvoicesByVehicule(userId: string, vehiculeId: string): Promise<Invoice[]> {
    return this.getInvoices(userId, [where("vehiculeId", "==", vehiculeId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les factures par statut
  async getInvoicesByStatus(userId: string, statut: Invoice["statut"]): Promise<Invoice[]> {
    return this.getInvoices(userId, [where("statut", "==", statut), orderBy("dateCreation", "desc")])
  },
}
