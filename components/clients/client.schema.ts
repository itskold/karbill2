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

// Schéma client
export const clientSchema = z.object({
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
  entreprise: z.string().optional(),
  siret: z.string().optional(),
  tva: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["particulier", "professionnel"]).default("particulier"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Client = z.infer<typeof clientSchema>

// Service Firebase pour les clients
export const clientService = {
  // Obtenir la référence à la collection clients d'un utilisateur
  getClientsRef(userId: string) {
    return collection(userService.getUserRef(userId), "customers")
  },

  // Obtenir tous les clients d'un utilisateur
  async getClients(userId: string, constraints: QueryConstraint[] = []): Promise<Client[]> {
    const clientsRef = this.getClientsRef(userId)
    const q = query(clientsRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Client
    })
  },

  // Obtenir un client par ID
  async getClient(userId: string, clientId: string): Promise<Client | null> {
    const clientRef = doc(this.getClientsRef(userId), clientId)
    const clientDoc = await getDoc(clientRef)

    if (!clientDoc.exists()) return null

    const data = clientDoc.data()
    return {
      id: clientDoc.id,
      userId,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Client
  },

  // Créer un nouveau client
  async createClient(
    userId: string,
    clientData: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const clientsRef = this.getClientsRef(userId)
    const newClientRef = doc(clientsRef)
    const timestamp = serverTimestamp()

    await setDoc(newClientRef, {
      ...clientData,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return newClientRef.id
  },

  // Mettre à jour un client
  async updateClient(userId: string, clientId: string, clientData: Partial<Client>): Promise<void> {
    const clientRef = doc(this.getClientsRef(userId), clientId)

    await updateDoc(clientRef, {
      ...clientData,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer un client
  async deleteClient(userId: string, clientId: string): Promise<void> {
    const clientRef = doc(this.getClientsRef(userId), clientId)
    await deleteDoc(clientRef)
  },

  // Rechercher des clients
  async searchClients(userId: string, searchParams: Partial<Client>): Promise<Client[]> {
    const constraints: QueryConstraint[] = []

    // Ajouter des contraintes de recherche en fonction des paramètres
    if (searchParams.nom) {
      constraints.push(where("nom", "==", searchParams.nom))
    }
    if (searchParams.prenom) {
      constraints.push(where("prenom", "==", searchParams.prenom))
    }
    if (searchParams.email) {
      constraints.push(where("email", "==", searchParams.email))
    }
    if (searchParams.type) {
      constraints.push(where("type", "==", searchParams.type))
    }

    // Ajouter un tri par date de création décroissante
    constraints.push(orderBy("createdAt", "desc"))

    return this.getClients(userId, constraints)
  },
}
