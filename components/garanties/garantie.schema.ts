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

// Schéma garantie
export const garantieSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number(), // Durée en mois
  price: z.number(),
  conditions: z.string().optional(),
  isTemplate: z.boolean().default(false),
  templateId: z.string().optional(),
  vehiculeId: z.string().optional(), // Si la garantie est liée à un véhicule spécifique
  clientId: z.string().optional(), // Si la garantie est liée à un client spécifique
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["active", "expired", "cancelled"]).optional(),
  type: z.enum(["standard", "extended", "premium", "custom"]).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schéma pour les templates de garantie
export const garantieTemplateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number(), // Durée en mois
  price: z.number(),
  conditions: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
  type: z
    .enum(["standard", "extended", "premium", "custom"])
    .default("standard"),
  applicability: z.enum(["new", "used", "all"]).default("all"),
  limitations: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Garantie = z.infer<typeof garantieSchema>;
export type GarantieTemplate = z.infer<typeof garantieTemplateSchema>;

// Service Firebase pour les garanties
export const garantieService = {
  // Obtenir la référence à la collection garanties d'un utilisateur
  getGarantiesRef(userId: string) {
    return collection(userService.getUserRef(userId), "garanties");
  },

  // Obtenir la référence à la collection des templates de garantie d'un utilisateur
  getGarantieTemplatesRef(userId: string) {
    return collection(userService.getUserRef(userId), "garantiestemplates");
  },

  // Obtenir toutes les garanties d'un utilisateur
  async getGaranties(
    userId: string,
    constraints: QueryConstraint[] = []
  ): Promise<Garantie[]> {
    const garantiesRef = this.getGarantiesRef(userId);
    const q = query(garantiesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Garantie;
    });
  },

  // Obtenir tous les templates de garantie d'un utilisateur
  async getTemplates(
    userId: string,
    constraints: QueryConstraint[] = []
  ): Promise<GarantieTemplate[]> {
    const templatesRef = this.getGarantieTemplatesRef(userId);
    const q = query(templatesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as GarantieTemplate;
    });
  },

  // Obtenir une garantie par ID
  async getGarantie(
    userId: string,
    garantieId: string
  ): Promise<Garantie | null> {
    const garantieRef = doc(this.getGarantiesRef(userId), garantieId);
    const garantieDoc = await getDoc(garantieRef);

    if (!garantieDoc.exists()) return null;

    const data = garantieDoc.data();
    return {
      id: garantieDoc.id,
      userId,
      ...data,
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Garantie;
  },

  // Obtenir un template de garantie par ID
  async getTemplate(
    userId: string,
    templateId: string
  ): Promise<GarantieTemplate | null> {
    const templateRef = doc(this.getGarantieTemplatesRef(userId), templateId);
    const templateDoc = await getDoc(templateRef);

    if (!templateDoc.exists()) return null;

    const data = templateDoc.data();
    return {
      id: templateDoc.id,
      userId,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as GarantieTemplate;
  },

  // Créer une nouvelle garantie
  async createGarantie(
    userId: string,
    garantieData: Omit<Garantie, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const garantiesRef = this.getGarantiesRef(userId);
    const newGarantieRef = doc(garantiesRef);
    const timestamp = serverTimestamp();

    await setDoc(newGarantieRef, {
      ...garantieData,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return newGarantieRef.id;
  },

  // Créer un nouveau template de garantie
  async createTemplate(
    userId: string,
    templateData: Omit<
      GarantieTemplate,
      "id" | "userId" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    const templatesRef = this.getGarantieTemplatesRef(userId);
    const newTemplateRef = doc(templatesRef);
    const timestamp = serverTimestamp();

    await setDoc(newTemplateRef, {
      ...templateData,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return newTemplateRef.id;
  },

  // Mettre à jour une garantie
  async updateGarantie(
    userId: string,
    garantieId: string,
    garantieData: Partial<Garantie>
  ): Promise<void> {
    const garantieRef = doc(this.getGarantiesRef(userId), garantieId);

    await updateDoc(garantieRef, {
      ...garantieData,
      updatedAt: serverTimestamp(),
    });
  },

  // Mettre à jour un template de garantie
  async updateTemplate(
    userId: string,
    templateId: string,
    templateData: Partial<GarantieTemplate>
  ): Promise<void> {
    const templateRef = doc(this.getGarantieTemplatesRef(userId), templateId);

    await updateDoc(templateRef, {
      ...templateData,
      updatedAt: serverTimestamp(),
    });
  },

  // Supprimer une garantie
  async deleteGarantie(userId: string, garantieId: string): Promise<void> {
    const garantieRef = doc(this.getGarantiesRef(userId), garantieId);
    await deleteDoc(garantieRef);
  },

  // Supprimer un template de garantie
  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    const templateRef = doc(this.getGarantieTemplatesRef(userId), templateId);
    await deleteDoc(templateRef);
  },

  // Obtenir les modèles de garantie (pour maintenir la compatibilité)
  async getGarantieTemplates(userId: string): Promise<Garantie[]> {
    // Appeler la nouvelle méthode qui utilise la collection séparée
    const templates = await this.getTemplates(userId, [
      where("status", "==", "active"),
      orderBy("name"),
    ]);

    // Convertir les templates au format Garantie pour la compatibilité
    return templates.map(
      (template) =>
        ({
          id: template.id,
          userId: template.userId,
          name: template.name,
          description: template.description,
          duration: template.duration,
          price: template.price,
          conditions: template.conditions,
          isTemplate: true, // Marquer comme template pour la compatibilité
          status: "active" as any, // Conversion de statut pour la compatibilité
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        } as Garantie)
    );
  },

  // Obtenir les garanties actives
  async getActiveGaranties(userId: string): Promise<Garantie[]> {
    return this.getGaranties(userId, [
      where("status", "==", "active"),
      orderBy("startDate", "desc"),
    ]);
  },

  // Obtenir les garanties par véhicule
  async getGarantiesByVehicule(
    userId: string,
    vehiculeId: string
  ): Promise<Garantie[]> {
    return this.getGaranties(userId, [
      where("vehiculeId", "==", vehiculeId),
      orderBy("startDate", "desc"),
    ]);
  },

  // Version avec orthographe anglaise pour compatibilité avec l'interface
  async getGarantiesByVehicle(
    userId: string,
    vehicleId: string
  ): Promise<Garantie[]> {
    return this.getGarantiesByVehicule(userId, vehicleId);
  },

  // Obtenir les garanties par client
  async getGarantiesByClient(
    userId: string,
    clientId: string
  ): Promise<Garantie[]> {
    return this.getGaranties(userId, [
      where("clientId", "==", clientId),
      orderBy("startDate", "desc"),
    ]);
  },
};
