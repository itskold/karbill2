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

// Schéma acompte
export const depositSchema = z.object({
  id: z.string(),
  userId: z.string(),
  numero: z.string(),
  clientId: z.string(),
  vehiculeId: z.string().optional(),
  montant: z.number(),
  dateCreation: z.date(),
  dateEcheance: z.date().optional(),
  statut: z.enum(["payé", "en_attente", "annulé"]),
  modePaiement: z.enum(["espèces", "carte", "virement", "chèque"]).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Deposit = z.infer<typeof depositSchema>

// Service Firebase pour les acomptes
export const depositService = {
  // Obtenir la référence à la collection acomptes d'un utilisateur
  getDepositsRef(userId: string) {
    return collection(userService.getUserRef(userId), "deposits")
  },

  // Obtenir tous les acomptes d'un utilisateur
  async getDeposits(userId: string, constraints: QueryConstraint[] = []): Promise<Deposit[]> {
    const depositsRef = this.getDepositsRef(userId)
    const q = query(depositsRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        dateCreation: data.dateCreation?.toDate(),
        dateEcheance: data.dateEcheance?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Deposit
    })
  },

  // Obtenir un acompte par ID
  async getDeposit(userId: string, depositId: string): Promise<Deposit | null> {
    const depositRef = doc(this.getDepositsRef(userId), depositId)
    const depositDoc = await getDoc(depositRef)

    if (!depositDoc.exists()) return null

    const data = depositDoc.data()
    return {
      id: depositDoc.id,
      userId,
      ...data,
      dateCreation: data.dateCreation?.toDate(),
      dateEcheance: data.dateEcheance?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Deposit
  },

  // Créer un nouvel acompte
  async createDeposit(
    userId: string,
    depositData: Omit<Deposit, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const depositsRef = this.getDepositsRef(userId)
    const newDepositRef = doc(depositsRef)
    const timestamp = serverTimestamp()

    await setDoc(newDepositRef, {
      ...depositData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newDepositRef.id
  },

  // Mettre à jour un acompte
  async updateDeposit(userId: string, depositId: string, depositData: Partial<Deposit>): Promise<void> {
    const depositRef = doc(this.getDepositsRef(userId), depositId)

    await updateDoc(depositRef, {
      ...depositData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer un acompte
  async deleteDeposit(userId: string, depositId: string): Promise<void> {
    const depositRef = doc(this.getDepositsRef(userId), depositId)
    await deleteDoc(depositRef)
  },

  // Obtenir les acomptes par client
  async getDepositsByClient(userId: string, clientId: string): Promise<Deposit[]> {
    return this.getDeposits(userId, [where("clientId", "==", clientId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les acomptes par véhicule
  async getDepositsByVehicule(userId: string, vehiculeId: string): Promise<Deposit[]> {
    return this.getDeposits(userId, [where("vehiculeId", "==", vehiculeId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les acomptes par statut
  async getDepositsByStatus(userId: string, statut: Deposit["statut"]): Promise<Deposit[]> {
    return this.getDeposits(userId, [where("statut", "==", statut), orderBy("dateCreation", "desc")])
  },
}
