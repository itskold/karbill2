"use client"

import { useState, useEffect } from "react"
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
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Ne pas tenter de récupérer les données si c'est un nouvel utilisateur
          // ou si les données ont déjà été récupérées pour cet utilisateur
          if (isNewUser) {
            console.log("Nouvel utilisateur détecté, les données seront récupérées ultérieurement")
            setIsNewUser(false) // Réinitialiser pour les connexions futures
          } else if (!userData || userData.id !== firebaseUser.uid) {
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
  }, [userData, isNewUser])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null)
      
      // Indiquer qu'il s'agit d'un nouvel utilisateur pour que le hook ne tente pas
      // immédiatement de récupérer des données qui n'existent pas encore
      setIsNewUser(true)
      
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
      
      // Mettre à jour les données utilisateur localement pour éviter une requête supplémentaire
      setUserData(fullUserData as User)

      return user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
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

  // Fonction de débogage pour afficher les données utilisateur
  const debugUserData = () => {
    if (userData) {
      console.log("Données utilisateur actuelles:", {
        id: userData.id,
        email: userData.email,
        invoiceSettings: userData.invoiceSettings,
        currency: userData.currency,
      })
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
  }
}
