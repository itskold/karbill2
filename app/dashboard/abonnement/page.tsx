"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  CreditCard,
  Calendar,
  Check,
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  planFeatures,
  type Subscription,
} from "@/components/subscription/subscription.schema";

export default function AbonnementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les informations d'abonnement directement depuis Stripe
  const fetchSubscriptionFromStripe = async () => {
    if (!user) return;
    
    setIsLoadingSubscription(true);
    setError(null);
    
    try {
      const token = await user.getIdToken(true);
      const response = await fetch("/api/stripe/get-subscription", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la récupération de l'abonnement");
      }

      const data = await response.json();
      
      if (data.subscription) {
        // Conversion des dates string en objets Date
        if (data.subscription.currentPeriodStart && typeof data.subscription.currentPeriodStart === 'string') {
          data.subscription.currentPeriodStart = new Date(data.subscription.currentPeriodStart);
        }
        if (data.subscription.currentPeriodEnd && typeof data.subscription.currentPeriodEnd === 'string') {
          data.subscription.currentPeriodEnd = new Date(data.subscription.currentPeriodEnd);
        }
        
        setSubscription(data.subscription);
      }
    } catch (err: any) {
      console.error("Erreur de récupération de l'abonnement:", err);
      setError("Impossible de récupérer les informations d'abonnement");
      toast({
        title: "Erreur",
        description: err.message || "Impossible de récupérer les informations d'abonnement",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Charger les informations d'abonnement au chargement de la page
  useEffect(() => {
    if (user) {
      fetchSubscriptionFromStripe();
    }
  }, [user]);

  // Statut de l'abonnement avec des couleurs adaptées
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Actif",
          variant: "default" as const,
          icon: Check,
        };
      case "canceled":
        return {
          label: "Annulé",
          variant: "destructive" as const,
          icon: AlertCircle,
        };
      case "past_due":
        return {
          label: "Paiement en retard",
          variant: "destructive" as const,
          icon: AlertTriangle,
        };
      case "unpaid":
        return {
          label: "Impayé",
          variant: "destructive" as const,
          icon: AlertCircle,
        };
      case "pending":
        return {
          label: "En attente",
          variant: "outline" as const,
          icon: Calendar,
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          icon: Calendar,
        };
    }
  };

  // Gérer l'abonnement via le portail Stripe
  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour gérer votre abonnement",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'utilisateur a un ID client Stripe via l'abonnement
    const hasStripeCustomerId = subscription?.stripeCustomerId;

    if (!hasStripeCustomerId) {
      toast({
        title: "Erreur",
        description: "Aucun compte client Stripe trouvé. Veuillez contacter le support.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPortal(true);

    try {
      const token = await user.getIdToken(true);
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur de création du portail Stripe");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Aucune URL de portail n'a été retournée");
      }
    } catch (error: any) {
      console.error("Erreur de création du portail Stripe:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de gérer l'abonnement",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  // Préparer l'URL de mise à niveau pour les plans gratuits
  useEffect(() => {
    const prepareUpgradeUrl = async () => {
      if (user && subscription?.planType === "free") {
        try {
          const token = await user.getIdToken(true);
          const response = await fetch("/api/stripe/create-checkout-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              planType: "basic",
              returnUrl: window.location.href,
            }),
          });

          const data = await response.json();
          if (data.url) {
            setUpgradeUrl(data.url);
          }
        } catch (error) {
          console.error("Erreur de préparation de l'URL de mise à niveau:", error);
        }
      }
    };

    if (subscription) {
      prepareUpgradeUrl();
    }
  }, [user, subscription]);

  // Afficher un état de chargement
  if (authLoading || isLoadingSubscription) {
    return (
      <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-2 text-muted-foreground">
          Chargement de votre abonnement...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={fetchSubscriptionFromStripe}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucun abonnement trouvé. Veuillez contacter le support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(subscription.status);
  const planInfo = planFeatures[subscription.planType];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et vos paiements.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchSubscriptionFromStripe}
          title="Rafraîchir les informations depuis Stripe"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails de l'abonnement</CardTitle>
                <Badge variant={statusConfig.variant} className="ml-auto">
                  <statusConfig.icon className="h-3.5 w-3.5 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              <CardDescription>
                Votre plan actuel et son statut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">Plan {planInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.planType === "free"
                    ? "Gratuit"
                    : `${planInfo.price}€ par mois`}
                </p>
              </div>

              {subscription.currentPeriodStart && (
                <div className="flex flex-row gap-8">
                  <div>
                    <h4 className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Période actuelle début:
                    </h4>
                    <p className="text-sm">
                      {subscription.currentPeriodStart.toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  {subscription.currentPeriodEnd && (
                    <div>
                      <h4 className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        Prochain renouvellement:
                      </h4>
                      <p className="text-sm">
                        {subscription.currentPeriodEnd.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Votre abonnement sera annulé à la fin de la période actuelle.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-4">
              {subscription.planType !== "free" &&
                subscription.stripeCustomerId && (
                  <Button
                    onClick={handleManageSubscription}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {isLoadingPortal
                      ? "Chargement..."
                      : "Gérer l'abonnement et la facturation"}
                  </Button>
                )}

              {subscription.planType === "free" && upgradeUrl && (
                <Button
                  onClick={() => {
                    window.location.href = upgradeUrl;
                  }}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Passer à un plan payant
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités incluses</CardTitle>
              <CardDescription>
                Ce qui est disponible dans votre plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {planInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 