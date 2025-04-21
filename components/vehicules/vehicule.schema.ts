import { z } from "zod";
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
} from "firebase/firestore";
import { userService } from "../users/user.schema";
import { db } from "@/lib/firebase";

// Types
export type TVehicleStatus = "available" | "sold" | "reserved" | "maintenance";

export interface IVehicleEvent {
  id: string;
  date: Date;
  type:
    | "status_change"
    | "price_change"
    | "document_added"
    | "maintenance"
    | "other";
  title: string;
  description: string;
}

// Schéma véhicule
export const vehiculeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  // Informations principales
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  variant: z.string().optional(),
  chassisNumber: z.string().min(1, "Le numéro de chassis est requis"),
  year: z.coerce
    .number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(
      new Date().getFullYear() + 1,
      `L'année ne peut pas dépasser ${new Date().getFullYear() + 1}`
    ),
  firstCirculationDate: z
    .string()
    .min(1, "La date de première mise en circulation est requise"),
  priceSale: z.coerce.number().optional(),
  pricePurchase: z.coerce.number().optional(),

  // Caractéristiques techniques
  fuelType: z.enum(["diesel", "gasoline", "electric", "hybrid", "other"]),
  engineCapacity: z.coerce.number().min(1, "La cylindrée est requise"),
  transmission: z.enum(["manual", "automatic"]),
  mileage: z.coerce.number().min(0, "Le kilométrage doit être positif"),
  power: z.coerce.number().min(1, "La puissance est requise"),
  poidsVide: z.coerce.number().optional(),

  // Détails additionnels
  color: z.string().optional(),
  doors: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  status: z.enum(["available", "sold", "reserved", "maintenance"]),
  notes: z.string().optional(),
  autoscoutId: z.string().optional(),
  options: z.array(z.string()).optional(),

  // Media
  photos: z.array(z.string()).default([]),

  // Événements et historique
  events: z.array(z.any()).optional(),

  // Horodatage
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Vehicule = z.infer<typeof vehiculeSchema>;

// Service Firebase pour les véhicules
export const vehiculeService = {
  // Obtenir la référence à la collection véhicules d'un utilisateur
  getVehiculesRef(userId: string) {
    return collection(userService.getUserRef(userId), "vehicules");
  },

  // Obtenir tous les véhicules d'un utilisateur
  async getVehicules(
    userId: string,
    constraints: QueryConstraint[] = []
  ): Promise<Vehicule[]> {
    const vehiculesRef = this.getVehiculesRef(userId);
    const q = query(vehiculesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Vehicule;
    });
  },

  // Obtenir un véhicule par ID
  async getVehicule(
    userId: string,
    vehiculeId: string
  ): Promise<Vehicule | null> {
    const vehiculeRef = doc(this.getVehiculesRef(userId), vehiculeId);
    const vehiculeDoc = await getDoc(vehiculeRef);

    if (!vehiculeDoc.exists()) return null;

    const data = vehiculeDoc.data();
    return {
      id: vehiculeDoc.id,
      userId,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Vehicule;
  },

  // Créer un nouveau véhicule
  async createVehicule(
    userId: string,
    vehiculeData: Omit<Vehicule, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const vehiculesRef = this.getVehiculesRef(userId);
    const newVehiculeRef = doc(vehiculesRef);
    const timestamp = serverTimestamp();

    await setDoc(newVehiculeRef, {
      ...vehiculeData,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return newVehiculeRef.id;
  },

  // Mettre à jour un véhicule
  async updateVehicule(
    userId: string,
    vehiculeId: string,
    vehiculeData: Partial<Vehicule>
  ): Promise<void> {
    const vehiculeRef = doc(this.getVehiculesRef(userId), vehiculeId);

    await updateDoc(vehiculeRef, {
      ...vehiculeData,
      updatedAt: serverTimestamp(),
    });
  },

  // Supprimer un véhicule
  async deleteVehicule(userId: string, vehiculeId: string): Promise<void> {
    const vehiculeRef = doc(this.getVehiculesRef(userId), vehiculeId);
    await deleteDoc(vehiculeRef);
  },

  // Obtenir les véhicules disponibles
  async getAvailableVehicules(userId: string): Promise<Vehicule[]> {
    return this.getVehicules(userId, [
      where("status", "==", "available"),
      orderBy("brand"),
      orderBy("model"),
    ]);
  },

  // Obtenir les véhicules vendus
  async getSoldVehicules(userId: string): Promise<Vehicule[]> {
    return this.getVehicules(userId, [
      where("status", "==", "sold"),
      orderBy("updatedAt", "desc"),
    ]);
  },

  // Obtenir les véhicules réservés
  async getReservedVehicules(userId: string): Promise<Vehicule[]> {
    return this.getVehicules(userId, [
      where("status", "==", "reserved"),
      orderBy("updatedAt", "desc"),
    ]);
  },

  // Obtenir les véhicules en maintenance
  async getMaintenanceVehicules(userId: string): Promise<Vehicule[]> {
    return this.getVehicules(userId, [
      where("status", "==", "maintenance"),
      orderBy("updatedAt", "desc"),
    ]);
  },

  // Rechercher des véhicules par marque et modèle
  async searchVehicules(
    userId: string,
    searchTerm: string
  ): Promise<Vehicule[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const vehicules = await this.getVehicules(userId);

    return vehicules.filter(
      (vehicule) =>
        vehicule.brand.toLowerCase().includes(lowerSearchTerm) ||
        vehicule.model.toLowerCase().includes(lowerSearchTerm) ||
        (vehicule.variant &&
          vehicule.variant.toLowerCase().includes(lowerSearchTerm)) ||
        (vehicule.chassisNumber &&
          vehicule.chassisNumber.toLowerCase().includes(lowerSearchTerm))
    );
  },
};
