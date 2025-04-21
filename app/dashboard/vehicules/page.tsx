"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  Check,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Composants
import { StatsCards } from "@/components/vehicules/stats-cards";
import { SearchFilters } from "@/components/vehicules/search-filters";
import { VehicleGrid } from "@/components/vehicules/vehicle-grid";
import { VehicleList } from "@/components/vehicules/vehicle-list";

// Services et types
import {
  vehiculeService,
  type Vehicule,
} from "@/components/vehicules/vehicule.schema";
import { IVehicle } from "@/components/vehicules/types";
import { storageService } from "@/lib/storage-service";

export default function VehiculesPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le dialogue d'importation d'Autoscout24
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [autoscoutProfileUrl, setAutoscoutProfileUrl] = useState("");
  const [isScrapingProfile, setIsScrapingProfile] = useState(false);
  const [profileVehicles, setProfileVehicles] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      price: number | string;
      imageUrl: string | null;
      url: string;
      chassisNumber: string;
      pricePurchase: number | null;
      isSelected: boolean;
    }>
  >([]);
  const [isImporting, setIsImporting] = useState(false);
  const [currentImportStep, setCurrentImportStep] = useState<number>(0);
  const [totalImportSteps, setTotalImportSteps] = useState<number>(0);
  const [importProgress, setImportProgress] = useState<number>(0);

  // Fonction pour récupérer les véhicules
  const fetchVehicles = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedVehicles = await vehiculeService.getVehicules(user.uid);
      setVehicles(fetchedVehicles);
    } catch (err) {
      console.error("Erreur lors de la récupération des véhicules:", err);
      setError(
        "Une erreur est survenue lors du chargement des véhicules. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchVehicles();
    }
  }, [user, authLoading]);

  // Filtrer et trier les véhicules
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      // Filtre de recherche
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower);

      // Filtre de statut
      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
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
        case "price-asc":
          return (a.priceSale || 0) - (b.priceSale || 0);
        case "price-desc":
          return (b.priceSale || 0) - (a.priceSale || 0);
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        default:
          return 0;
      }
    });

  // Mapper les véhicules du schéma (Vehicule) vers l'interface (IVehicle) pour les composants
  const mappedVehicles: IVehicle[] = filteredVehicles.map((vehicle) => ({
    ...vehicle,
    createdAt: vehicle.createdAt || new Date(),
    updatedAt: vehicle.updatedAt || new Date(),
  }));

  // Statistiques
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "available"
  ).length;
  const reservedVehicles = vehicles.filter(
    (v) => v.status === "reserved"
  ).length;
  const soldVehicles = vehicles.filter((v) => v.status === "sold").length;
  const totalInventoryValue = vehicles
    .filter((v) => v.status === "available" || v.status === "reserved")
    .reduce((sum, v) => sum + (v.priceSale || 0), 0);

  // Fonction pour récupérer les véhicules d'un profil Autoscout24
  const fetchAutoscoutProfile = async () => {
    if (!autoscoutProfileUrl || !autoscoutProfileUrl.includes("autoscout24")) {
      toast.error("Veuillez entrer une URL AutoScout24 valide");
      return;
    }

    try {
      setIsScrapingProfile(true);
      setProfileVehicles([]);

      // Appel à l'API pour scraper le profil
      const response = await fetch("/api/scrape-autoscout-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: autoscoutProfileUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la récupération des données"
        );
      }

      const { vehicles: scrapedVehicles } = await response.json();

      // Transformer et enregistrer les véhicules récupérés
      const transformedVehicles = scrapedVehicles.map((vehicle: any) => ({
        ...vehicle,
        chassisNumber: "",
        pricePurchase: null,
        isSelected: false,
      }));

      setProfileVehicles(transformedVehicles);
      toast.success(`${transformedVehicles.length} véhicules trouvés`);
    } catch (error) {
      console.error("Erreur lors du scraping du profil:", error);
      toast.error(
        `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    } finally {
      setIsScrapingProfile(false);
    }
  };

  // Télécharger une image depuis une URL externe
  const downloadImageFromUrl = async (
    imageUrl: string
  ): Promise<File | null> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `Erreur lors du téléchargement de l'image: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const fileName = `autoscout_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}.jpg`;
      return new File([blob], fileName, { type: "image/jpeg" });
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      return null;
    }
  };

  // Upload des photos vers Firebase Storage
  const uploadPhotos = async (
    userId: string,
    vehiculeId: string,
    imageUrl: string | null
  ): Promise<string[]> => {
    const photoUrls: string[] = [];

    if (!imageUrl) return photoUrls;

    try {
      const file = await downloadImageFromUrl(imageUrl);
      if (file) {
        const url = await storageService.uploadVehiculeImage(
          userId,
          vehiculeId,
          file
        );
        photoUrls.push(url);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload des photos:", error);
    }

    return photoUrls;
  };

  // Importer les véhicules sélectionnés
  const importSelectedVehicles = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour importer des véhicules");
      return;
    }

    const selectedVehicles = profileVehicles.filter(
      (v) => v.isSelected && v.chassisNumber.trim() !== ""
    );

    if (selectedVehicles.length === 0) {
      toast.error(
        "Veuillez sélectionner au moins un véhicule et renseigner son numéro de châssis"
      );
      return;
    }

    try {
      setIsImporting(true);
      setTotalImportSteps(selectedVehicles.length);
      setImportProgress(0);

      for (let i = 0; i < selectedVehicles.length; i++) {
        const vehicle = selectedVehicles[i];
        setCurrentImportStep(i + 1);

        // 1. Récupérer les détails complets du véhicule depuis l'API
        const vehicleDetailsResponse = await fetch("/api/scrape-autoscout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: vehicle.url }),
        });

        if (!vehicleDetailsResponse.ok) {
          throw new Error(
            `Erreur lors de la récupération des détails du véhicule ${vehicle.title}`
          );
        }

        const vehicleData = await vehicleDetailsResponse.json();

        // 2. Ajouter le numéro de châssis et le prix d'achat aux données du véhicule
        vehicleData.chassisNumber = vehicle.chassisNumber;
        if (vehicle.pricePurchase) {
          vehicleData.pricePurchase = vehicle.pricePurchase;
        }

        // 3. Enregistrer le véhicule dans Firestore
        const vehicleId = await vehiculeService.createVehicule(user.uid, {
          ...vehicleData,
        });

        // 4. Télécharger et uploader l'image principale
        if (vehicleData.photos) {
          const photos = vehicleData.photos;
          const photoUrls: string[] = [];
          photos.forEach(async (photo: string) => {
            const url = await uploadPhotos(user.uid, vehicleId, photo);
            photoUrls.push(...url);
          });

          // 5. Mettre à jour le véhicule avec les URLs des photos
          if (photoUrls.length > 0) {
            await vehiculeService.updateVehicule(user.uid, vehicleId, {
              photos: photoUrls,
            });
          }
        }

        // Mettre à jour la progression
        setImportProgress(((i + 1) / selectedVehicles.length) * 100);
      }

      toast.success(
        `${selectedVehicles.length} véhicule(s) importé(s) avec succès`
      );

      // Fermer le dialogue et rafraîchir la liste des véhicules
      setIsImportDialogOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error("Erreur lors de l'importation des véhicules:", error);
      toast.error(
        `Erreur: ${
          error instanceof Error
            ? error.message
            : "Erreur lors de l'importation"
        }`
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Mettre à jour le numéro de châssis d'un véhicule
  const updateChassisNumber = (id: string, chassisNumber: string) => {
    setProfileVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, chassisNumber } : vehicle
      )
    );
  };

  // Mettre à jour le prix d'achat d'un véhicule
  const updatePricePurchase = (id: string, value: string) => {
    const numericValue = value === "" ? null : Number(value);
    setProfileVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === id
          ? { ...vehicle, pricePurchase: numericValue }
          : vehicle
      )
    );
  };

  // Mettre à jour la sélection d'un véhicule
  const toggleVehicleSelection = (id: string) => {
    setProfileVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === id
          ? { ...vehicle, isSelected: !vehicle.isSelected }
          : vehicle
      )
    );
  };

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
                Inventaire des véhicules
              </h1>
              <p className="text-slate-500 mt-1">
                Gestion et suivi de votre parc automobile
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                className="bg-[#f5f301] hover:bg-[#e5e301] text-black font-medium relative pl-4 pr-12"
              >
                Importer d'Autoscout24
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-contain bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url('https://www.autoscout24.be/assets/acquisition-fragments/metatags/images/favicon/apple-touch-icon.png')",
                  }}
                />
              </Button>
              <Button
                asChild
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Link href="/dashboard/vehicules/add">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un véhicule
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
          totalVehicles={totalVehicles}
          availableVehicles={availableVehicles}
          reservedVehicles={reservedVehicles}
          soldVehicles={soldVehicles}
          totalInventoryValue={totalInventoryValue}
        />

        {/* Filtres et contrôles */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
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
              <VehicleGrid
                vehicles={mappedVehicles}
                onVehicleDeleted={() => fetchVehicles()}
              />
            </TabsContent>

            <TabsContent value="list">
              <VehicleList
                vehicles={mappedVehicles}
                onVehicleDeleted={() => fetchVehicles()}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Dialogue d'importation d'Autoscout24 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importer des véhicules depuis AutoScout24</DialogTitle>
            <DialogDescription>
              Entrez l'URL d'un profil AutoScout24 pour importer plusieurs
              véhicules à la fois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formulaire d'importation */}
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="autoscout-profile">
                    URL du profil AutoScout24
                  </Label>
                  <div className="flex mt-1.5 gap-2">
                    <Input
                      id="autoscout-profile"
                      placeholder="https://www.autoscout24.be/fr/professional/..."
                      value={autoscoutProfileUrl}
                      onChange={(e) => setAutoscoutProfileUrl(e.target.value)}
                      className="flex-1"
                      disabled={isScrapingProfile || isImporting}
                    />
                    <Button
                      onClick={fetchAutoscoutProfile}
                      disabled={isScrapingProfile || isImporting}
                    >
                      {isScrapingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        "Récupérer"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des véhicules trouvés */}
            {profileVehicles.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Véhicules trouvés ({profileVehicles.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {profileVehicles.filter((v) => v.isSelected).length}{" "}
                    sélectionné(s)
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {profileVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`border rounded-lg p-4 ${
                        vehicle.isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                          {vehicle.imageUrl ? (
                            <img
                              src={vehicle.imageUrl}
                              alt={vehicle.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-base">
                                {vehicle.title}
                              </h4>
                              {vehicle.subtitle && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {vehicle.subtitle}
                                </p>
                              )}
                              <p className="text-sm font-medium mt-2">
                                {typeof vehicle.price === "number"
                                  ? new Intl.NumberFormat("fr-BE", {
                                      style: "currency",
                                      currency: "EUR",
                                      maximumFractionDigits: 0,
                                    }).format(vehicle.price)
                                  : vehicle.price}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={vehicle.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-muted"
                              >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  toggleVehicleSelection(vehicle.id)
                                }
                                disabled={isImporting}
                                className="p-1.5"
                              >
                                {vehicle.isSelected ? (
                                  <Check className="h-5 w-5 text-primary" />
                                ) : (
                                  <Plus className="h-5 w-5 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Numéro de châssis */}
                          <div className="mt-3">
                            <Label
                              htmlFor={`chassis-${vehicle.id}`}
                              className="text-sm font-normal"
                            >
                              Numéro de châssis
                            </Label>
                            <Input
                              id={`chassis-${vehicle.id}`}
                              value={vehicle.chassisNumber}
                              onChange={(e) =>
                                updateChassisNumber(vehicle.id, e.target.value)
                              }
                              placeholder="WVWZZZ1KZXW000000"
                              className="mt-1 h-8 text-sm"
                              disabled={isImporting || !vehicle.isSelected}
                            />
                          </div>

                          {/* Prix d'achat */}
                          <div className="mt-3">
                            <Label
                              htmlFor={`purchase-price-${vehicle.id}`}
                              className="text-sm font-normal"
                            >
                              Prix d&apos;achat (€)
                            </Label>
                            <Input
                              id={`purchase-price-${vehicle.id}`}
                              type="number"
                              value={
                                vehicle.pricePurchase === null
                                  ? ""
                                  : vehicle.pricePurchase
                              }
                              onChange={(e) =>
                                updatePricePurchase(vehicle.id, e.target.value)
                              }
                              placeholder="Prix d'achat (optionnel)"
                              className="mt-1 h-8 text-sm"
                              disabled={isImporting || !vehicle.isSelected}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barre de progression pendant l'importation */}
            {isImporting && (
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span>
                    Importation en cours: {currentImportStep}/{totalImportSteps}
                  </span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
              disabled={isImporting}
            >
              Annuler
            </Button>
            <Button
              onClick={importSelectedVehicles}
              disabled={
                isScrapingProfile ||
                isImporting ||
                profileVehicles.filter(
                  (v) => v.isSelected && v.chassisNumber.trim() !== ""
                ).length === 0
              }
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                `Importer les véhicules (${
                  profileVehicles.filter(
                    (v) => v.isSelected && v.chassisNumber.trim() !== ""
                  ).length
                })`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
