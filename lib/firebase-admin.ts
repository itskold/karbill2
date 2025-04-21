import * as admin from 'firebase-admin';

// Vérifier si nous sommes côté serveur
const isServer = typeof window === 'undefined';

// Vérifier si l'app est déjà initialisée
const apps = admin.apps.length ? admin.apps : [];
let adminApp;

if (isServer && apps.length === 0) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;
      
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error("Variables d'environnement Firebase Admin manquantes");
    }
    
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialisé avec succès");
  } catch (error) {
    console.error("Erreur d'initialisation de Firebase Admin:", error);
  }
} else if (apps.length > 0) {
  adminApp = admin.app();
}

// Exporter les services Firebase Admin
export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); 