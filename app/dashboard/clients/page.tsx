"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Composants
import { StatsCards } from "@/components/clients/stats-cards";
import { SearchFilters } from "@/components/clients/search-filters";
import { ClientGrid } from "@/components/clients/client-grid";
import { ClientList } from "@/components/clients/client-list";

// Services et types
import { clientService, type Client } from "@/components/clients/client.schema";
import { type IClient } from "@/components/clients/types";

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

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const fetchedClients = await clientService.getClients(user.uid);
        setClients(fetchedClients);
      } catch (err) {
        console.error("Erreur lors de la récupération des clients:", err);
        setError(
          "Une erreur est survenue lors du chargement des clients. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchClients();
    }
  }, [user, authLoading]);

  // Filtrer et trier les clients
  const filteredClients = clients
    .filter((client) => {
      // Filtre de recherche
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        client.nom.toLowerCase().includes(searchLower) ||
        client.prenom.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.entreprise &&
          client.entreprise.toLowerCase().includes(searchLower)) ||
        (client.ville && client.ville.toLowerCase().includes(searchLower));

      // Filtre de type de client
      const matchesType =
        clientTypeFilter === "all" || client.type === clientTypeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Tri
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name-asc":
          return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
        case "name-desc":
          return `${b.nom} ${b.prenom}`.localeCompare(`${a.nom} ${a.prenom}`);
        default:
          return 0;
      }
    });

  // Statistiques
  const totalClients = clients.length;
  const individualClients = clients.filter(
    (c) => c.type === "particulier"
  ).length;
  const companyClients = clients.filter(
    (c) => c.type === "professionnel"
  ).length;
  // Pour le total des achats, nous aurions besoin de récupérer les factures liées aux clients
  const totalPurchases = 0; // À implémenter avec les données réelles

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Non autorisé</AlertTitle>
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* En-tête avec fond subtil */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Gestion des clients
              </h1>
              <p className="text-slate-500 mt-1">
                Gérez votre base de clients et suivez leurs activités
              </p>
            </div>
            <div>
              <Button
                asChild
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Link href="/dashboard/clients/add">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un client
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cartes de statistiques */}
        <StatsCards
          totalClients={totalClients}
          individualClients={individualClients}
          companyClients={companyClients}
          totalPurchases={totalPurchases}
        />

        {/* Filtres et contrôles */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clientTypeFilter={clientTypeFilter}
          setClientTypeFilter={setClientTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "grid" | "list")}
          >
            <TabsContent value="grid">
              <ClientGrid
                clients={filteredClients.map(convertClientToIClient)}
              />
            </TabsContent>

            <TabsContent value="list">
              <ClientList
                clients={filteredClients.map(convertClientToIClient)}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
