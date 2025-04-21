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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Si userData existe déjà (défini lors de l'inscription), ne pas le récupérer à nouveau
          if (!userData || userData.id !== firebaseUser.uid) {
            // Récupérer les données utilisateur
            const userDoc = await userService.getUser(firebaseUser.uid)
            setUserData(userDoc)
          }

          // Récupérer l'abonnement actif
          const activeSubscription = await subscriptionService.getActiveSubscription(firebaseUser.uid)
          setSubscription(activeSubscription)
        } catch (err) {
          console.error("Erreur lors de la récupération des données:", err)
        }
      } else {
        setUserData(null)
        setSubscription(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData])

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Créer le profil utilisateur dans Firestore
      await userService.setUser(user.uid, {
        id: user.uid,
        email: user.email || email,
        ...userData,
      })

      // S'assurer que les données utilisateur sont disponibles immédiatement
      try {
        const userDoc = await userService.getUser(user.uid)
        setUserData(userDoc)
      } catch (docError) {
        console.error("Erreur lors de la récupération des données utilisateur:", docError)
        // Ne pas faire échouer l'inscription si la récupération des données échoue
      }

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
      await userService.setUser(user.uid, data)
      const updatedUserData = await userService.getUser(user.uid)
      setUserData(updatedUserData)
      return updatedUserData
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
