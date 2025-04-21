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

// Schéma tâche
export const taskSchema = z.object({
  id: z.string(),
  description: z.string(),
  workerId: z.string().optional(),
  statut: z.enum(["à_faire", "en_cours", "terminée", "annulée"]).default("à_faire"),
  tempsEstime: z.number().optional(), // en minutes
  tempsReel: z.number().optional(), // en minutes
  dateDebut: z.date().optional(),
  dateFin: z.date().optional(),
  notes: z.string().optional(),
})

export type Task = z.infer<typeof taskSchema>

// Schéma pièce
export const partSchema = z.object({
  id: z.string(),
  nom: z.string(),
  reference: z.string().optional(),
  quantite: z.number(),
  prixUnitaire: z.number(),
  tva: z.number().default(20),
  total: z.number(),
})

export type Part = z.infer<typeof partSchema>

// Schéma ordre de réparation
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  numero: z.string(),
  clientId: z.string(),
  vehiculeId: z.string(),
  dateCreation: z.date(),
  dateFinPrevue: z.date().optional(),
  dateFinReelle: z.date().optional(),
  statut: z.enum(["en_attente", "en_cours", "terminé", "facturé", "annulé"]),
  description: z.string(),
  taches: z.array(taskSchema),
  pieces: z.array(partSchema).optional(),
  totalPieces: z.number().default(0),
  totalMainOeuvre: z.number().default(0),
  totalHT: z.number(),
  totalTVA: z.number(),
  totalTTC: z.number(),
  factureId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Order = z.infer<typeof orderSchema>

// Service Firebase pour les ordres de réparation
export const orderService = {
  // Obtenir la référence à la collection ordres d'un utilisateur
  getOrdersRef(userId: string) {
    return collection(userService.getUserRef(userId), "orders")
  },

  // Obtenir tous les ordres d'un utilisateur
  async getOrders(userId: string, constraints: QueryConstraint[] = []): Promise<Order[]> {
    const ordersRef = this.getOrdersRef(userId)
    const q = query(ordersRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        dateCreation: data.dateCreation?.toDate(),
        dateFinPrevue: data.dateFinPrevue?.toDate(),
        dateFinReelle: data.dateFinReelle?.toDate(),
        taches: data.taches?.map((t: any) => ({
          ...t,
          dateDebut: t.dateDebut?.toDate(),
          dateFin: t.dateFin?.toDate(),
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Order
    })
  },

  // Obtenir un ordre par ID
  async getOrder(userId: string, orderId: string): Promise<Order | null> {
    const orderRef = doc(this.getOrdersRef(userId), orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) return null

    const data = orderDoc.data()
    return {
      id: orderDoc.id,
      userId,
      ...data,
      dateCreation: data.dateCreation?.toDate(),
      dateFinPrevue: data.dateFinPrevue?.toDate(),
      dateFinReelle: data.dateFinReelle?.toDate(),
      taches: data.taches?.map((t: any) => ({
        ...t,
        dateDebut: t.dateDebut?.toDate(),
        dateFin: t.dateFin?.toDate(),
      })),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Order
  },

  // Créer un nouvel ordre
  async createOrder(
    userId: string,
    orderData: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ordersRef = this.getOrdersRef(userId)
    const newOrderRef = doc(ordersRef)
    const timestamp = serverTimestamp()

    await setDoc(newOrderRef, {
      ...orderData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newOrderRef.id
  },

  // Mettre à jour un ordre
  async updateOrder(userId: string, orderId: string, orderData: Partial<Order>): Promise<void> {
    const orderRef = doc(this.getOrdersRef(userId), orderId)

    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer un ordre
  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const orderRef = doc(this.getOrdersRef(userId), orderId)
    await deleteDoc(orderRef)
  },

  // Ajouter une tâche à un ordre
  async addTask(userId: string, orderId: string, task: Omit<Task, "id">): Promise<void> {
    const order = await this.getOrder(userId, orderId)
    if (!order) throw new Error("Ordre non trouvé")

    const newTask = {
      id: crypto.randomUUID(),
      ...task,
    }

    const taches = order.taches || []

    await this.updateOrder(userId, orderId, {
      taches: [...taches, newTask],
    })
  },

  // Mettre à jour une tâche
  async updateTask(userId: string, orderId: string, taskId: string, taskData: Partial<Task>): Promise<void> {
    const order = await this.getOrder(userId, orderId)
    if (!order) throw new Error("Ordre non trouvé")

    const taches = order.taches || []
    const taskIndex = taches.findIndex((t) => t.id === taskId)

    if (taskIndex === -1) throw new Error("Tâche non trouvée")

    taches[taskIndex] = {
      ...taches[taskIndex],
      ...taskData,
    }

    await this.updateOrder(userId, orderId, { taches })
  },

  // Ajouter une pièce à un ordre
  async addPart(userId: string, orderId: string, part: Omit<Part, "id">): Promise<void> {
    const order = await this.getOrder(userId, orderId)
    if (!order) throw new Error("Ordre non trouvé")

    const newPart = {
      id: crypto.randomUUID(),
      ...part,
    }

    const pieces = order.pieces || []
    const totalPieces = (order.totalPieces || 0) + newPart.total
    const totalHT = (order.totalHT || 0) + newPart.total
    const totalTVA = (order.totalTVA || 0) + (newPart.total * newPart.tva) / 100
    const totalTTC = totalHT + totalTVA

    await this.updateOrder(userId, orderId, {
      pieces: [...pieces, newPart],
      totalPieces,
      totalHT,
      totalTVA,
      totalTTC,
    })
  },

  // Obtenir les ordres par client
  async getOrdersByClient(userId: string, clientId: string): Promise<Order[]> {
    return this.getOrders(userId, [where("clientId", "==", clientId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les ordres par véhicule
  async getOrdersByVehicule(userId: string, vehiculeId: string): Promise<Order[]> {
    return this.getOrders(userId, [where("vehiculeId", "==", vehiculeId), orderBy("dateCreation", "desc")])
  },

  // Obtenir les ordres par employé
  async getOrdersByWorker(userId: string, workerId: string): Promise<Order[]> {
    return this.getOrders(userId, [where("taches", "array-contains", { workerId }), orderBy("dateCreation", "desc")])
  },

  // Obtenir les ordres par statut
  async getOrdersByStatus(userId: string, statut: Order["statut"]): Promise<Order[]> {
    return this.getOrders(userId, [where("statut", "==", statut), orderBy("dateCreation", "desc")])
  },
}
