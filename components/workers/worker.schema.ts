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

// Schéma employé
export const workerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nom: z.string(),
  prenom: z.string(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  poste: z.string(),
  dateEmbauche: z.date(),
  salaire: z.number().optional(),
  statut: z.enum(["actif", "inactif"]).default("actif"),
  specialites: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Worker = z.infer<typeof workerSchema>

// Service Firebase pour les employés
export const workerService = {
  // Obtenir la référence à la collection employés d'un utilisateur
  getWorkersRef(userId: string) {
    return collection(userService.getUserRef(userId), "workers")
  },

  // Obtenir tous les employés d'un utilisateur
  async getWorkers(userId: string, constraints: QueryConstraint[] = []): Promise<Worker[]> {
    const workersRef = this.getWorkersRef(userId)
    const q = query(workersRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        dateEmbauche: data.dateEmbauche?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Worker
    })
  },

  // Obtenir un employé par ID
  async getWorker(userId: string, workerId: string): Promise<Worker | null> {
    const workerRef = doc(this.getWorkersRef(userId), workerId)
    const workerDoc = await getDoc(workerRef)

    if (!workerDoc.exists()) return null

    const data = workerDoc.data()
    return {
      id: workerDoc.id,
      userId,
      ...data,
      dateEmbauche: data.dateEmbauche?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Worker
  },

  // Créer un nouvel employé
  async createWorker(
    userId: string,
    workerData: Omit<Worker, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const workersRef = this.getWorkersRef(userId)
    const newWorkerRef = doc(workersRef)
    const timestamp = serverTimestamp()

    await setDoc(newWorkerRef, {
      ...workerData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newWorkerRef.id
  },

  // Mettre à jour un employé
  async updateWorker(userId: string, workerId: string, workerData: Partial<Worker>): Promise<void> {
    const workerRef = doc(this.getWorkersRef(userId), workerId)

    await updateDoc(workerRef, {
      ...workerData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer un employé
  async deleteWorker(userId: string, workerId: string): Promise<void> {
    const workerRef = doc(this.getWorkersRef(userId), workerId)
    await deleteDoc(workerRef)
  },

  // Obtenir les employés actifs
  async getActiveWorkers(userId: string): Promise<Worker[]> {
    return this.getWorkers(userId, [where("statut", "==", "actif"), orderBy("nom")])
  },

  // Obtenir les employés par spécialité
  async getWorkersBySpeciality(userId: string, specialite: string): Promise<Worker[]> {
    return this.getWorkers(userId, [where("specialites", "array-contains", specialite), orderBy("nom")])
  },
}
