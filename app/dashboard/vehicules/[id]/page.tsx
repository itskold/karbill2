"use client";

import { useState, use, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// Composants
import { InfoSection } from "@/components/vehicules/vehicle-detail/info-section";

// Types
import type { IVehicle } from "@/components/vehicules/types";
import {
  vehiculeService,
  type Vehicule,
} from "@/components/vehicules/vehicule.schema";
import { useAuth } from "@/hooks/use-auth";

// Type pour les paramètres
type VehicleParams = {
  id: string;
};

// Fonction pour convertir le format Vehicule (Firebase) vers IVehicle (UI)
const convertVehiculeToIVehicle = (vehicule: Vehicule): IVehicle => {
  // Conversion des événements si présents
  const events = vehicule.events
    ? vehicule.events.map((event) => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date),
      }))
    : [];

  return {
    id: vehicule.id,
    userId: vehicule.userId,
    brand: vehicule.brand,
    model: vehicule.model,
    variant: vehicule.variant || "",
    chassisNumber: vehicule.chassisNumber || "",
    year: vehicule.year,
    firstCirculationDate: vehicule.firstCirculationDate,
    priceSale: vehicule.priceSale,
    pricePurchase: vehicule.pricePurchase,
    fuelType: vehicule.fuelType,
    engineCapacity: vehicule.engineCapacity,
    transmission: vehicule.transmission,
    mileage: vehicule.mileage,
    power: vehicule.power,
    poidsVide: vehicule.poidsVide,
    color: vehicule.color || "",
    doors: vehicule.doors,
    seats: vehicule.seats,
    status: vehicule.status,
    notes: vehicule.notes || "",
    autoscoutId: vehicule.autoscoutId || "",
    options: vehicule.options || [],
    photos: vehicule.photos || [],
    events: events,
    createdAt: vehicule.createdAt || new Date(),
    updatedAt: vehicule.updatedAt || new Date(),
  };
};

export default function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const unwrappedParams = use(params as any) as VehicleParams;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const vehicleData = await vehiculeService.getVehicule(
          user.uid,
          unwrappedParams.id
        );

        if (vehicleData) {
          setVehicle(convertVehiculeToIVehicle(vehicleData));
        } else {
          toast({
            title: "Véhicule introuvable",
            description: "Le véhicule demandé n'existe pas ou a été supprimé.",
            variant: "destructive",
          });
          router.push("/dashboard/vehicules");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du véhicule:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du véhicule.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [user, unwrappedParams.id, router, toast]);

  // Navigation dans la galerie de photos
  const nextPhoto = () => {
    if (!vehicle || !vehicle.photos.length) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % vehicle.photos.length);
  };

  const prevPhoto = () => {
    if (!vehicle || !vehicle.photos.length) return;
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + vehicle.photos.length) % vehicle.photos.length
    );
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!user || !vehicle) return;

    try {
      setIsDeleting(true);
      await vehiculeService.deleteVehicule(user.uid, vehicle.id);

      toast({
        title: "Véhicule supprimé",
        description: "Le véhicule a été supprimé avec succès.",
      });

      router.push("/dashboard/vehicules");
    } catch (error) {
      console.error("Erreur lors de la suppression du véhicule:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le véhicule.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <VehicleDetailSkeleton />;
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Véhicule introuvable</h1>
          <p className="text-slate-500 mb-4">
            Le véhicule demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.push("/dashboard/vehicules")}>
            Retour à la liste des véhicules
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
                onClick={() => router.push("/dashboard/vehicules")}
                className="h-8 w-8 mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {vehicle.brand} {vehicle.model}
                  <span className="text-slate-500 text-sm block">
                    {vehicle.variant}
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span>{vehicle.year}</span>
                  <span>•</span>
                  <span>{vehicle.mileage.toLocaleString()} km</span>
                  <span>•</span>
                  <span>{getStatusBadge(vehicle.status)}</span>
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
                <a href={`/dashboard/vehicules/${unwrappedParams.id}/modifier`}>
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
                      <FileText className="mr-2 h-4 w-4" /> Générer une facture
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
                  <Car className="h-4 w-4" />
                  Détails
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photos
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
            <InfoSection vehicle={vehicle} />
          </TabsContent>

          {/* Onglet Photos */}
          <TabsContent
            value="photos"
            className="space-y-6 mt-4"
            id="photos-tab"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Galerie photos</CardTitle>
                <CardDescription>
                  {vehicle.photos.length > 0
                    ? `${currentPhotoIndex + 1} sur ${
                        vehicle.photos.length
                      } photos`
                    : "Aucune photo disponible"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                    {vehicle.photos.length > 0 ? (
                      <img
                        src={
                          vehicle.photos[currentPhotoIndex] ||
                          "/placeholder.svg?height=600&width=800"
                        }
                        alt={`${vehicle.brand} ${vehicle.model} - Photo ${
                          currentPhotoIndex + 1
                        }`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p>Aucune photo disponible</p>
                      </div>
                    )}
                  </div>

                  {/* Boutons de navigation */}
                  {vehicle.photos.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevPhoto}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextPhoto}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
              {vehicle.photos.length > 0 && (
                <CardFooter className="p-4">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 w-full">
                    {vehicle.photos.map((photo, index) => (
                      <div
                        key={index}
                        className={`aspect-square cursor-pointer border-2 rounded-md overflow-hidden ${
                          index === currentPhotoIndex
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      >
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Historique du véhicule</CardTitle>
                <CardDescription>
                  Tous les événements liés à ce véhicule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.events && vehicle.events.length > 0 ? (
                  <div className="relative">
                    {/* Ligne verticale pour la timeline */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-slate-200" />

                    <div className="space-y-4">
                      {vehicle.events.map((event) => (
                        <div key={event.id} className="flex gap-4 relative">
                          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center z-10">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                              <h4 className="font-medium text-slate-900">
                                {event.title}
                              </h4>
                              <p className="text-sm text-slate-500">
                                {format(event.date, "dd MMMM yyyy", {
                                  locale: fr,
                                })}
                              </p>
                            </div>
                            <p className="text-slate-700">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Aucun événement enregistré</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un événement
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Ajouté le</p>
                    <p className="text-sm text-slate-900">
                      {format(vehicle.createdAt, "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">
                      Dernière modification
                    </p>
                    <p className="text-sm text-slate-900">
                      {format(vehicle.updatedAt, "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">ID du véhicule</p>
                    <p className="text-sm text-slate-900">{vehicle.id}</p>
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
              Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              La suppression de ce véhicule entraînera également la suppression
              de tous les documents et événements associés.
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

// Composant squelette pour l'état de chargement
function VehicleDetailSkeleton() {
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
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
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
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caractéristiques */}
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import missing components and functions
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Car,
  ImageIcon,
  History,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getStatusBadge } from "@/components/vehicules/utils";

// Function to get event icon
function getEventIcon(type: string) {
  switch (type) {
    case "status_change":
      return <Tag className="h-4 w-4 text-blue-500" />;
    case "price_change":
      return <Banknote className="h-4 w-4 text-green-500" />;
    case "document_added":
      return <FileText className="h-4 w-4 text-amber-500" />;
    case "maintenance":
      return <Settings className="h-4 w-4 text-slate-500" />;
    default:
      return <History className="h-4 w-4 text-slate-500" />;
  }
}

// Import missing icons
import { Tag, Banknote, Settings } from "lucide-react";
