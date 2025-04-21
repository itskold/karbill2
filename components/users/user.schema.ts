import { z } from "zod"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Schéma pour une taxe
export const taxSchema = z.object({
  id: z.string(),
  rate: z.number().min(0).max(100),
  isDefault: z.boolean().default(false),
})

export type Tax = z.infer<typeof taxSchema>

// Schéma pour l'adresse
export const addressSchema = z.object({
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default("Belgique"),
})

export type Address = z.infer<typeof addressSchema>

// Schéma pour les paramètres de facturation
export const invoiceSettingsSchema = z.object({
  prefix: z.string().default("FAC-"),
  startNumber: z.number().int().positive().default(1),
  nextNumber: z.number().int().positive().default(1),
})

export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>

// Schéma utilisateur
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),

  // Informations entreprise
  company: z.string().optional(),
  companyNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().optional(), // Lien vers Firebase Storage

  // Adresse
  address: addressSchema.optional(),

  // Paramètres
  invoiceSettings: invoiceSettingsSchema.default({}),
  taxes: z.array(taxSchema).default([]),
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]).default("EUR"),
  signature: z.string().optional(), // DataURL de la signature

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type User = z.infer<typeof userSchema>

// Service Firebase pour les utilisateurs
export const userService = {
  // Référence à un document utilisateur
  getUserRef(userId: string) {
    return doc(db, "users", userId)
  },

  // Obtenir un utilisateur
  async getUser(userId: string): Promise<User> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate(),
      taxes: userData.taxes || [],
      invoiceSettings: userData.invoiceSettings || {
        prefix: "FAC-",
        startNumber: 1,
        nextNumber: 1,
      },
      address: userData.address || {},
      currency: userData.currency || "EUR",
    } as User
  },

  // Créer ou mettre à jour un utilisateur
  async setUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = this.getUserRef(userId)
    const timestamp = serverTimestamp()

    const userExists = (await getDoc(userRef)).exists()

    if (userExists) {
      await updateDoc(userRef, {
        ...userData,
        updatedAt: timestamp,
      })
    } else {
      await setDoc(userRef, {
        ...userData,
        id: userId,
        taxes: userData.taxes || [],
        invoiceSettings: userData.invoiceSettings || {
          prefix: "FAC-",
          startNumber: 1,
          nextNumber: 1,
        },
        currency: userData.currency || "EUR",
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }
  },

  // Ajouter une taxe
  async addTax(userId: string, tax: Omit<Tax, "id">): Promise<string> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    const taxes = userData.taxes || []

    // Générer un ID unique pour la taxe
    const taxId = crypto.randomUUID()
    const newTax = { ...tax, id: taxId }

    // Ajouter la nouvelle taxe au tableau
    await updateDoc(userRef, {
      taxes: [...taxes, newTax],
      updatedAt: serverTimestamp(),
    })

    return taxId
  },

  // Mettre à jour une taxe
  async updateTax(userId: string, taxId: string, taxData: Partial<Omit<Tax, "id">>): Promise<void> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    const taxes = userData.taxes || []

    // Trouver l'index de la taxe à mettre à jour
    const taxIndex = taxes.findIndex((tax: Tax) => tax.id === taxId)

    if (taxIndex === -1) {
      throw new Error(`Taxe avec l'ID ${taxId} non trouvée`)
    }

    // Mettre à jour la taxe
    taxes[taxIndex] = { ...taxes[taxIndex], ...taxData }

    await updateDoc(userRef, {
      taxes: taxes,
      updatedAt: serverTimestamp(),
    })
  },

  // Supprimer une taxe
  async deleteTax(userId: string, taxId: string): Promise<void> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    const taxes = userData.taxes || []

    // Filtrer la taxe à supprimer
    const updatedTaxes = taxes.filter((tax: Tax) => tax.id !== taxId)

    await updateDoc(userRef, {
      taxes: updatedTaxes,
      updatedAt: serverTimestamp(),
    })
  },

  // Mettre à jour les paramètres de facturation
  async updateInvoiceSettings(userId: string, settings: Partial<InvoiceSettings>): Promise<void> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    const currentSettings = userData.invoiceSettings || {
      prefix: "FAC-",
      startNumber: 1,
      nextNumber: 1,
    }

    // S'assurer que les valeurs numériques sont bien des nombres
    const updatedSettings = {
      ...currentSettings,
      ...(settings.prefix !== undefined ? { prefix: settings.prefix } : {}),
      ...(settings.startNumber !== undefined ? { startNumber: Number(settings.startNumber) } : {}),
      ...(settings.nextNumber !== undefined ? { nextNumber: Number(settings.nextNumber) } : {}),
    }

    console.log("Mise à jour des paramètres de facturation:", updatedSettings)

    // Mettre à jour uniquement les paramètres de facturation
    await updateDoc(userRef, {
      invoiceSettings: updatedSettings,
      updatedAt: serverTimestamp(),
    })

    console.log("Paramètres de facturation mis à jour avec succès")
  },

  // Mettre à jour l'adresse
  async updateAddress(userId: string, address: Partial<Address>): Promise<void> {
    const userRef = this.getUserRef(userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`)
    }

    const userData = userDoc.data()
    const currentAddress = userData.address || {}

    await updateDoc(userRef, {
      address: { ...currentAddress, ...address },
      updatedAt: serverTimestamp(),
    })
  },
}
