"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share,
  Printer,
  MoreHorizontal,
  Download,
  FileText,
  AlertTriangle,
  User,
  ShoppingCart,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Composants
import { InfoSection } from "@/components/clients/detail/info-section";
import { PurchasesSection } from "@/components/clients/detail/purchases-section";
import { DocumentsSection } from "@/components/clients/detail/documents-section";
import { InteractionsSection } from "@/components/clients/detail/interactions-section";

// Utils
import { getClientName, getClientTypeBadge } from "@/components/clients/utils";

// Types
import type { IClient } from "@/components/clients/types";
import { clientService, type Client } from "@/components/clients/client.schema";
import { useAuth } from "@/hooks/use-auth";

// Fonction pour convertir le format Client (Firebase) vers IClient (UI)
const convertClientToIClient = (client: Client): IClient => {
  return {
    id: client.id,
    clientType: client.type,
    firstName: client.prenom || "",
    lastName: client.nom || "",
    companyName: client.entreprise || "",
    vatNumber: client.tva || "",
    companyNumber: client.siret || "",
    email: client.email || "",
    phone: client.telephone || "",
    mobile: "", // Non présent dans le schéma actuel
    address: client.adresse || "",
    addressComplement: "", // Non présent dans le schéma actuel
    postalCode: client.codePostal || "",
    city: client.ville || "",
    country: client.pays || "Belgique",
    preferredContactMethod: "email", // Valeur par défaut
    sendMarketingEmails: false, // Valeur par défaut
    notes: client.notes || "",
    purchases: [], // À remplir si nécessaire
    documents: [], // À remplir si nécessaire
    interactions: [], // À remplir si nécessaire
    totalPurchases: 0, // À calculer si nécessaire
    totalSpent: 0, // À calculer si nécessaire
    lastPurchaseDate: undefined, // À remplir si nécessaire
    createdAt: client.createdAt || new Date(),
    updatedAt: client.updatedAt || new Date(),
  };
};

type ClientParams = {
  id: string;
};

export default function ClientDetailPage({ params }: { params: ClientParams }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [client, setClient] = useState<IClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const unwrappedParams = use(params as any) as ClientParams;

  useEffect(() => {
    const fetchClient = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const clientData = await clientService.getClient(
          user.uid,
          unwrappedParams.id
        );

        if (clientData) {
          setClient(convertClientToIClient(clientData));
        } else {
          toast({
            title: "Client introuvable",
            description: "Le client demandé n'existe pas ou a été supprimé.",
            variant: "destructive",
          });
          router.push("/dashboard/clients");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du client:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du client.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [user, unwrappedParams.id, router, toast]);

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!user || !client) return;

    try {
      setIsDeleting(true);
      await clientService.deleteClient(user.uid, client.id);

      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });

      router.push("/dashboard/clients");
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <ClientDetailSkeleton />;
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Client introuvable</h1>
          <p className="text-slate-500 mb-4">
            Le client demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.push("/dashboard/clients")}>
            Retour à la liste des clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/clients")}
                className="h-8 w-8 mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {getClientName(client)}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span>{client.email}</span>
                  <span>•</span>
                  <span>{getClientTypeBadge(client.clientType)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                asChild
              >
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Printer className="mr-1 h-4 w-4" /> Imprimer
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                asChild
              >
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Share className="mr-1 h-4 w-4" /> Partager
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                asChild
              >
                <a href={`/dashboard/clients/${unwrappedParams.id}/edit`}>
                  <Edit className="mr-1 h-4 w-4" /> Modifier
                </a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-slate-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <Download className="mr-2 h-4 w-4" /> Exporter en PDF
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <FileText className="mr-2 h-4 w-4" /> Créer une facture
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="details" className="w-full">
          <div className="mb-8 border-b">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Détails
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="purchases"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Achats
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historique
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Onglet Détails */}
          <TabsContent value="details" className="space-y-6 mt-4">
            <InfoSection client={client} />
          </TabsContent>

          {/* Onglet Achats */}
          <TabsContent value="purchases" className="space-y-6 mt-4">
            <PurchasesSection client={client} />
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents" className="space-y-6 mt-4">
            <DocumentsSection client={client} />
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-6 mt-4">
            <InteractionsSection client={client} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Ajouté le</p>
                    <p className="text-sm text-slate-900">
                      {client.createdAt
                        ? format(client.createdAt, "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">
                      Dernière modification
                    </p>
                    <p className="text-sm text-slate-900">
                      {client.updatedAt
                        ? format(client.updatedAt, "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">ID du client</p>
                    <p className="text-sm text-slate-900">{client.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              La suppression de ce client entraînera également la suppression de
              tous les documents et interactions associés.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant de squelette pour l'état de chargement
function ClientDetailSkeleton() {
  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div>
                <Skeleton className="h-8 w-64" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 border-b">
          <Skeleton className="h-12 w-64" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informations principales */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques client */}
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Coordonnées */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-full max-w-md" />
                      <Skeleton className="h-5 w-48 mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
