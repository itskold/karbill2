"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { planFeatures } from "@/components/subscription/subscription.schema";
import { subscriptionService } from "@/components/subscription/subscription.schema";
// Ne pas importer directement les fonctions Stripe côté client
// import { createStripeCheckoutSession, createStripeCustomer } from "@/lib/stripe"

// Fonction qui traduit les erreurs techniques en messages conviviaux
const getErrorMessage = (error: any): string => {
  const errorCode = error.code || "";
  const errorMessage = error.message || "";
  
  // Erreurs Firebase Auth
  if (errorCode === "auth/email-already-in-use" || errorMessage.includes("email-already-in-use")) {
    return "Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.";
  }
  if (errorCode === "auth/invalid-email" || errorMessage.includes("invalid-email")) {
    return "L'adresse email n'est pas valide. Veuillez vérifier votre saisie.";
  }
  if (errorCode === "auth/weak-password" || errorMessage.includes("weak-password")) {
    return "Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.";
  }
  if (errorCode === "auth/network-request-failed" || errorMessage.includes("network")) {
    return "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.";
  }
  
  // Erreurs liées à Stripe
  if (errorMessage.includes("Stripe") || errorMessage.includes("payment")) {
    return "Un problème est survenu avec le service de paiement. Veuillez réessayer ultérieurement.";
  }
  
  // Message par défaut
  return "Une erreur s'est produite lors de l'inscription. Veuillez réessayer ou contacter notre support.";
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const [planType, setPlanType] = useState<"free" | "basic" | "pro">("free");

  // Récupérer le paramètre du plan à partir de l'URL côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get("plan") as "free" | "basic" | "pro";
      if (plan && ["free", "basic", "pro"].includes(plan)) {
        setPlanType(plan);
      }
    }
  }, []);

  const planInfo = planFeatures[planType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      // Créer l'utilisateur dans Firebase Auth
      const user = await register(email, password, {
        displayName: name,
        email,
      });

      // Attendre que les données utilisateur soient écrites dans Firestore
      // Cette attente est critique pour la synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (planType === "free") {
        // Créer un abonnement gratuit
        await subscriptionService.createFreeSubscription(user.uid);
        window.location.href = "/dashboard";
      } else {
        // Pour les plans payants, utiliser l'API route pour créer le client et la session
        const token = await user.getIdToken(true); // Forcer le rafraîchissement du token

        // Appeler notre API route qui gère la création du client et de la session Stripe
        const response = await fetch(
          "/api/stripe/create-customer-and-checkout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              email,
              planType,
              origin: window.location.origin,
            }),
          }
        );

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.sessionUrl) {
          // Rediriger vers la page de paiement Stripe
          window.location.href = data.sessionUrl;
        }
      }
    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            {planType === "free"
              ? "Inscrivez-vous pour accéder à votre compte gratuit"
              : `Inscrivez-vous au plan ${planInfo.name} pour ${planInfo.price}€/mois`}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </Button>
            <div className="text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
