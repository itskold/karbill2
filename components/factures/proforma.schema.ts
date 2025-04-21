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

// Schéma ligne de proforma
export const proformaLineSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantite: z.number(),
  prixUnitaire: z.number(),
  tva: z.number().default(20),
  remise: z.number().default(0),
  total: z.number(),
})

export type ProformaLine = z.infer<typeof proformaLineSchema>

// Schéma proforma
export const proformaSchema = z.object({
  id: z.string(),
  userId: z.string(),
  numero: z.string(),
  clientId: z.string(),
  vehiculeId: z.string().optional(),
  dateCreation: z.date(),
  dateValidite: z.date(),
  statut: z.enum(["brouillon", "envoyée", "acceptée", "refusée", "expirée", "convertie"]),
  lignes: z.array(proformaLineSchema),
  totalHT: z.number(),
  totalTVA: z.number(),
  totalTTC: z.number(),
  notes: z.string().optional(),
  conditionsPaiement: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Proforma = z.infer<typeof proformaSchema>

// Service Firebase pour les proformas
export const proformaService = {
  // Obtenir la référence à la collection proformas d'un utilisateur
  getProformasRef(userId: string) {
    return collection(userService.getUserRef(userId), "proforma")
  },

  // Obtenir toutes les proformas d'un utilisateur
  async getProformas(userId: string, constraints: QueryConstraint[] = []): Promise<Proforma[]> {
    const proformasRef = this.getProformasRef(userId)
    const q = query(proformasRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        dateCreation: data.dateCreation?.toDate(),
        dateValidite: data.dateValidite?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Proforma
    })
  },

  // Obtenir une proforma par ID
  async getProforma(userId: string, proformaId: string): Promise<Proforma | null> {
    const proformaRef = doc(this.getProformasRef(userId), proformaId)
    const proformaDoc = await getDoc(proformaRef)

    if (!proformaDoc.exists()) return null

    const data = proformaDoc.data()
    return {
      id: proformaDoc.id,
      userId,
      ...data,
      dateCreation: data.dateCreation?.toDate(),
      dateValidite: data.dateValidite?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Proforma
  },

  // Créer une nouvelle proforma
  async createProforma(
    userId: string,
    proformaData: Omit<Proforma, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const proformasRef = this.getProformasRef(userId)
    const newProformaRef = doc(proformasRef)
    const timestamp = serverTimestamp()

    await setDoc(newProformaRef, {
      ...proformaData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newProformaRef.id
  },

  // Mettre à jour une proforma
  async updateProforma(userId: string, proformaId: string, proformaData: Partial<Proforma>): Promise<void> {
    const proformaRef = doc(this.getProformasRef(userId), proformaId)

    await updateDoc(proformaRef, {
      ...proformaData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer une proforma
  async deleteProforma(userId: string, proformaId: string): Promise<void> {
    const proformaRef = doc(this.getProformasRef(userId), proformaId)
    await deleteDoc(proformaRef)
  },

  // Obtenir les proformas par client
  async getProformasByClient(userId: string, clientId: string): Promise<Proforma[]> {
    return this.getProformas(userId, [where("clientId", "==", clientId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les proformas par véhicule
  async getProformasByVehicule(userId: string, vehiculeId: string): Promise<Proforma[]> {
    return this.getProformas(userId, [where("vehiculeId", "==", vehiculeId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les proformas par statut
  async getProformasByStatus(userId: string, statut: Proforma["statut"]): Promise<Proforma[]> {
    return this.getProformas(userId, [where("statut", "==", statut), orderBy("dateCreation", "desc")])
  },
}
