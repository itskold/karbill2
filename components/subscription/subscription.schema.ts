import { z } from "zod"
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Définir les types de plans disponibles
export const planTypes = ["free", "basic", "pro"] as const

// Schéma d'abonnement
export const subscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planType: z.enum(planTypes),
  status: z.enum(["active", "canceled", "past_due", "unpaid", "pending"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodStart: z.date().optional(),
  currentPeriodEnd: z.date().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Subscription = z.infer<typeof subscriptionSchema>

// Fonctionnalités disponibles pour chaque plan
export const planFeatures = {
  free: {
    name: "Gratuit",
    price: 0,
    features: ["5 véhicules maximum", "10 clients maximum", "Gestion des factures basique", "1 utilisateur"],
    limits: {
      vehicles: 5,
      clients: 10,
      invoices: 20,
      users: 1,
    },
  },
  basic: {
    name: "Basique",
    price: 19,
    features: [
      "50 véhicules maximum",
      "100 clients maximum",
      "Gestion complète des factures",
      "Gestion des garanties",
      "Gestion des acomptes",
      "2 utilisateurs",
      "Support par email",
    ],
    limits: {
      vehicles: 50,
      clients: 100,
      invoices: 500,
      users: 2,
    },
  },
  pro: {
    name: "Professionnel",
    price: 99,
    features: [
      "Véhicules illimités",
      "Clients illimités",
      "Gestion complète des factures",
      "Gestion des garanties",
      "Gestion des acomptes",
      "Gestion des ordres de réparation",
      "Gestion des employés",
      "Rapports avancés",
      "Utilisateurs illimités",
      "Support prioritaire",
    ],
    limits: {
      vehicles: Number.POSITIVE_INFINITY,
      clients: Number.POSITIVE_INFINITY,
      invoices: Number.POSITIVE_INFINITY,
      users: Number.POSITIVE_INFINITY,
    },
  },
}

// Service Firebase pour les abonnements
export const subscriptionService = {
  // Référence à la collection subscriptions
  getSubscriptionsRef(userId: string) {
    return collection(db, "users", userId, "subscriptions")
  },

  // Obtenir l'abonnement actif d'un utilisateur
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const subscriptionsRef = this.getSubscriptionsRef(userId)
    const q = query(subscriptionsRef, where("status", "==", "active"))

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null

    const subDoc = querySnapshot.docs[0]
    const subData = subDoc.data()

    return {
      id: subDoc.id,
      ...subData,
      currentPeriodStart: subData.currentPeriodStart?.toDate(),
      currentPeriodEnd: subData.currentPeriodEnd?.toDate(),
      createdAt: subData.createdAt?.toDate(),
      updatedAt: subData.updatedAt?.toDate(),
    } as Subscription
  },

  // Créer ou mettre à jour un abonnement
  async setSubscription(
    userId: string,
    subscriptionId: string,
    subscriptionData: Partial<Subscription>,
  ): Promise<void> {
    const subscriptionsRef = this.getSubscriptionsRef(userId)
    const subscriptionRef = doc(subscriptionsRef, subscriptionId)
    const timestamp = serverTimestamp()

    const subscriptionExists = (await getDoc(subscriptionRef)).exists()

    if (subscriptionExists) {
      await updateDoc(subscriptionRef, {
        ...subscriptionData,
        updatedAt: timestamp,
      })
    } else {
      await setDoc(subscriptionRef, {
        ...subscriptionData,
        userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }
  },
  
  // Mettre à jour un abonnement existant
  async updateSubscription(
    userId: string,
    subscriptionId: string,
    subscriptionData: Partial<Subscription>,
  ): Promise<void> {
    return this.setSubscription(userId, subscriptionId, subscriptionData)
  },

  // Créer un abonnement gratuit pour un nouvel utilisateur
  async createFreeSubscription(userId: string): Promise<string> {
    const subscriptionsRef = this.getSubscriptionsRef(userId);
    
    // Vérifier si un abonnement actif existe déjà
    const activeQuery = query(subscriptionsRef, where("status", "==", "active"));
    const activeSnapshot = await getDocs(activeQuery);
    
    // Si un abonnement actif existe déjà, le retourner
    if (!activeSnapshot.empty) {
      const existingDoc = activeSnapshot.docs[0];
      const existingData = existingDoc.data();
      
      // Si c'est déjà un abonnement gratuit, on le retourne simplement
      if (existingData.planType === "free") {
        console.log(`Abonnement gratuit existant trouvé pour l'utilisateur: ${userId}`);
        return existingDoc.id;
      }
      
      // Sinon, on crée un nouvel abonnement gratuit (cas rare)
      console.log(`Abonnement actif existant trouvé pour l'utilisateur: ${userId}, mais pas gratuit. Création d'un nouveau.`);
    }
    
    // Créer une référence à un nouveau document avec un ID auto-généré
    const newSubscriptionRef = doc(subscriptionsRef);
    const subscriptionId = newSubscriptionRef.id;

    console.log(`Création d'un nouvel abonnement gratuit pour l'utilisateur: ${userId}`);
    await setDoc(newSubscriptionRef, {
      id: subscriptionId,
      userId,
      planType: "free",
      status: "active",
      cancelAtPeriodEnd: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Abonnement gratuit créé avec succès: ${subscriptionId}`);

    return subscriptionId;
  },

  // Vérifier si l'utilisateur a atteint les limites de son plan
  async checkPlanLimits(userId: string, resourceType: keyof typeof planFeatures.free.limits): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId)
    if (!subscription) return false

    const planType = subscription.planType
    const limit = planFeatures[planType].limits[resourceType]

    // Si la limite est infinie, retourner true
    if (limit === Number.POSITIVE_INFINITY) return true

    // Vérifier le nombre de ressources actuelles
    let count = 0

    switch (resourceType) {
      case "vehicles":
        // Compter les véhicules
        const vehiclesRef = collection(db, "users", userId, "vehicules")
        const vehiclesSnapshot = await getDocs(vehiclesRef)
        count = vehiclesSnapshot.size
        break
      case "clients":
        // Compter les clients
        const clientsRef = collection(db, "users", userId, "customers")
        const clientsSnapshot = await getDocs(clientsRef)
        count = clientsSnapshot.size
        break
      case "invoices":
        // Compter les factures
        const invoicesRef = collection(db, "users", userId, "invoices")
        const invoicesSnapshot = await getDocs(invoicesRef)
        count = invoicesSnapshot.size
        break
      // Ajouter d'autres cas selon les besoins
    }

    return count < limit
  },
}
