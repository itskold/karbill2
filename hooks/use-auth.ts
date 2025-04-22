"use client"

import { useState, useEffect, useRef } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { userService, type User } from "@/components/users/user.schema"
import { subscriptionService, type Subscription } from "@/components/subscription/subscription.schema"

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Référence pour suivre les IDs d'utilisateurs que nous avons déjà enregistrés
  // pour éviter les tentatives multiples de récupération qui pourraient échouer
  const registeredUserIds = useRef<Set<string>>(new Set())
  
  // Flag pour désactiver temporairement les vérifications automatiques pendant l'inscription
  const [skipUserDataFetch, setSkipUserDataFetch] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Vérifier si nous devons sauter la récupération des données
          if (skipUserDataFetch) {
            console.log("Récupération des données utilisateur désactivée temporairement")
            return
          }
          
          // Vérifier si nous avons déjà les données pour cet utilisateur
          if (userData && userData.id === firebaseUser.uid) {
            return
          }
          
          // Vérifier si c'est un utilisateur que nous venons d'enregistrer
          if (registeredUserIds.current.has(firebaseUser.uid)) {
            console.log("Utilisateur récemment enregistré, les données sont déjà en cache")
            return
          }

          try {
            // Récupérer les données utilisateur
            console.log("Tentative de récupération des données utilisateur:", firebaseUser.uid)
            const userDoc = await userService.getUser(firebaseUser.uid)
            console.log("Données utilisateur récupérées avec succès")
            setUserData(userDoc)
            
            // Récupérer l'abonnement actif
            try {
              const activeSubscription = await subscriptionService.getActiveSubscription(firebaseUser.uid)
              setSubscription(activeSubscription)
            } catch (subErr) {
              console.error("Erreur lors de la récupération de l'abonnement:", subErr)
              // Ne pas bloquer le flux si l'abonnement ne peut pas être récupéré
            }
          } catch (userErr: any) {
            console.error("Erreur lors de la récupération des données utilisateur:", userErr)
            // Si l'utilisateur n'est pas trouvé, créer un profil minimal par défaut
            if (userErr.message && userErr.message.includes("non trouvé")) {
              console.log("Création d'un profil utilisateur par défaut")
              // Créer un profil minimal par défaut
              const defaultUserData = {
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
              }
              await userService.setUser(firebaseUser.uid, defaultUserData)
              setUserData(defaultUserData as User)
            }
          }
        } catch (err) {
          console.error("Erreur générale dans le hook d'authentification:", err)
        }
      } else {
        setUserData(null)
        setSubscription(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData, skipUserDataFetch])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // Réactiver la récupération automatique des données
      setSkipUserDataFetch(false)
      return userCredential.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null)
      
      // Désactiver la récupération automatique des données pour éviter les erreurs
      setSkipUserDataFetch(true)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Créer le profil utilisateur dans Firestore avec tous les champs requis
      const fullUserData = {
        id: user.uid,
        email: user.email || email,
        ...userData,
        createdAt: new Date(),
      }
      
      console.log("Création du profil utilisateur dans Firestore:", user.uid)
      await userService.setUser(user.uid, fullUserData)
      console.log("Profil utilisateur créé avec succès")
      
      // Créer automatiquement un abonnement gratuit pour l'utilisateur
      try {
        console.log("Création de l'abonnement gratuit pour l'utilisateur:", user.uid)
        await subscriptionService.createFreeSubscription(user.uid)
        console.log("Abonnement gratuit créé avec succès")
      } catch (subErr) {
        console.error("Erreur lors de la création de l'abonnement gratuit:", subErr)
        // Ne pas bloquer l'inscription si la création de l'abonnement échoue
      }
      
      // Mettre à jour les données utilisateur localement pour éviter une requête supplémentaire
      setUserData(fullUserData as User)
      
      // Ajouter l'ID à notre liste d'utilisateurs récemment enregistrés
      registeredUserIds.current.add(user.uid)

      // Retourner l'utilisateur nouvellement créé
      return user
    } catch (err: any) {
      // Réactiver la récupération automatique des données en cas d'erreur
      setSkipUserDataFetch(false)
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      // Réactiver la récupération automatique des données
      setSkipUserDataFetch(false)
      // Vider le cache des utilisateurs enregistrés
      registeredUserIds.current.clear()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("Utilisateur non connecté")

    try {
      // Fusionner avec les données existantes
      const updatedData = userData ? { ...userData, ...data } : data
      
      await userService.setUser(user.uid, updatedData)
      
      // Mettre à jour les données localement pour éviter une requête supplémentaire
      setUserData(prevData => prevData ? { ...prevData, ...data } : data as User)
      
      return updatedData
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Réactiver manuellement la récupération des données utilisateur
  const enableUserDataFetch = () => {
    setSkipUserDataFetch(false);
  }

  // Vérifier manuellement si l'utilisateur existe dans Firestore
  const checkUserExists = async (userId: string): Promise<boolean> => {
    try {
      await userService.getUser(userId);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Fonction de débogage pour afficher les données utilisateur
  const debugUserData = () => {
    if (userData) {
      console.log("Données utilisateur actuelles:", {
        id: userData.id,
        email: userData.email,
        invoiceSettings: userData.invoiceSettings,
        currency: userData.currency,
      })
    } else {
      console.log("Aucune donnée utilisateur disponible")
    }
  }

  // Appeler cette fonction quand userData change
  useEffect(() => {
    debugUserData()
  }, [userData])

  return {
    user,
    userData,
    subscription,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    checkUserExists,
    enableUserDataFetch,
  }
}
