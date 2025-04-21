import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export const storageService = {
  // Télécharger un fichier
  async uploadFile(userId: string, file: File, path: string): Promise<string> {
    // Construire le chemin complet du fichier
    const fullPath = `users/${userId}/${path}/${file.name}`;
    console.log(`Tentative d'upload vers: ${fullPath}`);

    try {
      const storageRef = ref(storage, fullPath);

      // Log de l'objet de référence pour débogage
      console.log("Référence de stockage:", {
        fullPath: storageRef.fullPath,
        bucket: storageRef.bucket,
        name: storageRef.name,
      });

      // Upload du fichier
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Fichier uploadé avec succès:", snapshot);

      // Récupération de l'URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("URL de téléchargement obtenue:", downloadURL);

      return downloadURL;
    } catch (error) {
      console.error("Erreur détaillée dans uploadFile:", error);
      throw error; // Relancer l'erreur pour la gestion en amont
    }
  },

  // Télécharger une image de véhicule
  async uploadVehiculeImage(
    userId: string,
    vehiculeId: string,
    file: File
  ): Promise<string> {
    console.log(
      `uploadVehiculeImage appelé pour userId=${userId}, vehiculeId=${vehiculeId}, fichier=${file.name}`
    );
    return this.uploadFile(userId, file, `vehicules/${vehiculeId}/images`);
  },

  // Télécharger un document de véhicule
  async uploadVehiculeDocument(
    userId: string,
    vehiculeId: string,
    file: File
  ): Promise<string> {
    return this.uploadFile(userId, file, `vehicules/${vehiculeId}/documents`);
  },

  // Télécharger un document de client
  async uploadClientDocument(
    userId: string,
    clientId: string,
    file: File
  ): Promise<string> {
    return this.uploadFile(userId, file, `customers/${clientId}/documents`);
  },

  // Télécharger un document de garantie
  async uploadGarantieDocument(
    userId: string,
    garantieId: string,
    file: File
  ): Promise<string> {
    return this.uploadFile(userId, file, `garanties/${garantieId}`);
  },

  // Télécharger un document de facture
  async uploadInvoiceDocument(
    userId: string,
    invoiceId: string,
    file: File
  ): Promise<string> {
    return this.uploadFile(userId, file, `invoices/${invoiceId}`);
  },

  // Supprimer un fichier
  async deleteFile(filePath: string): Promise<void> {
    console.log(`Tentative de suppression du fichier: ${filePath}`);
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log("Fichier supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      throw error;
    }
  },
};
