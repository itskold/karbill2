"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  ImagePlus,
  Trash2,
  FileText,
  Settings,
  ImageIcon,
  CheckSquare,
  Loader2,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";

import { vehiculeService } from "@/components/vehicules/vehicule.schema";
import { storageService } from "@/lib/storage-service";
import { useAuth } from "@/hooks/use-auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Options du véhicule par catégorie
const vehicleOptionsCategories = {
  Équipement: [
    "4x4",
    "Airbag central",
    "Airbag conducteur",
    "Airbag genoux",
    "Airbag latéral",
    "Airbag passager",
    "Airbag rideau",
  ],
  "Assistance au stationnement": [
    "Caméra 360°",
    "Caméra d'aide au stationnement",
    "Caméra d'aide au stationnement arrière",
    "Système d'aide au stationnement automatique",
  ],
  Autres: [
    "Acoudoir",
    "Alarme",
    "Attache remorque",
    "Chauffage auxiliaire",
    "Chaufage sans huile",
    "Compatible E10",
    "Contrôle à bord",
    "Douze avec sioux caméléon",
    "Démarreur",
    "Équipement handicapé",
    "Filtre à particules",
    "Frein de stationnement électronique",
    "Jantes alliage",
    "Kit depannage",
    "Kit démarrage",
    "MP3",
    "Pack Sport",
    "Pare-brise",
    "Phares LED",
    "Phares Xénon",
    "Prises USB",
    "Suspension sport",
    "Système de contrôle de la pression des pneus",
    "Trappe à ski",
    "Verrouillage centralisé",
    "Vitres teintées",
  ],
  Climatisation: [
    "Climatisation",
    "Climatisation automatique",
    "Climatisation automatique 4 zones",
    "Climatisation automatique bi-zone",
  ],
  Confort: [
    "Accoudoir",
    "Chauffage auxiliaire",
    "Chauffage des sièges",
    "Chargeur sans fil",
    "Détecteur de pluie",
    "Fermeture centralisée",
    "Pare-brise chauffant",
    "Rétroviseur intérieur auto-dim",
    "Rétroviseurs télépliables électriques",
    "Siège chauffant",
    "Suspension pneumatique",
    "Toit ouvrant",
    "Toit panoramique",
    "Vitres surteintées",
    "Volant chauffant",
  ],
  "Divertissement / Médias": [
    "Bluetooth",
    "CD",
    "DAB/Digital Radio",
    "Détecteur de bord",
    "Écran multimédia",
    "Fonction TV",
    "Haut-parleurs de bord",
    "MP3",
    "Radio",
    "Système de navigation",
    "USB",
    "Volant multifonction",
    "Wi-Fi",
  ],
  "Régulateur de vitesse": [
    "Régulateur de vitesse",
    "Régulateur de vitesse adaptatif",
  ],
  Sièges: [
    "Sièges avant électriques",
    "Sièges chauffants",
    "Sièges sport",
    "Sièges ventilés",
  ],
  "Système d'assistance": [
    "Aide au démarrage en côte",
    "Aide au maintien de trajectoire",
    "Alerte de franchissement de ligne",
    "Assistance au démarrage en côte",
    "Assistance au freinage d'urgence",
    "Détecteur d'angle mort",
    "Détecteur des panneaux routiers",
    "Système d'avertissement de distance",
  ],
  Sécurité: [
    "ABS",
    "Alarme",
    "Anti-démarrage",
    "Anti-patinage",
    "ESP",
    "Système d'appel d'urgence",
    "Système de contrôle de la pression des pneus",
    "Système de détection de la fatigue",
  ],
};

// Schéma de formulaire
const formSchema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  variant: z.string().optional(),
  chassisNumber: z.string().optional(),
  year: z.coerce
    .number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(
      new Date().getFullYear() + 1,
      `L'année ne peut pas dépasser ${new Date().getFullYear() + 1}`
    ),
  firstCirculationDate: z
    .string()
    .min(1, "La date de première mise en circulation est requise"),
  priceSale: z.coerce.number().optional(),
  pricePurchase: z.coerce.number().optional(),
  fuelType: z.enum(["diesel", "gasoline", "electric", "hybrid", "other"]),
  engineCapacity: z.coerce.number().min(1, "La cylindrée est requise"),
  transmission: z.enum(["manual", "automatic"]),
  mileage: z.coerce.number().min(0, "Le kilométrage doit être positif"),
  power: z.coerce.number().min(1, "La puissance est requise"),
  poidsVide: z.coerce.number().optional(),
  color: z.string().optional(),
  doors: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  status: z.enum(["available", "sold", "reserved", "maintenance"]),
  notes: z.string().optional(),
  autoscoutId: z.string().optional(),
  options: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

export default function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [externalPhotoUrls, setExternalPhotoUrls] = useState<string[]>([]);
  const [circulationDate, setCirculationDate] = useState<Date>();
  const [customOption, setCustomOption] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoscoutUrl, setAutoscoutUrl] = useState("");
  const [isScrapingData, setIsScrapingData] = useState(false);
  const [vehicleId, setVehicleId] = useState(params.id);
  
  // États pour la modale de progression
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState({
    1: "pending", // connection = pending, success, error
    2: "waiting", // récupération = waiting, pending, success, error
    3: "waiting", // traitement = waiting, pending, success, error
    4: "waiting", // importation = waiting, pending, success, error
  });

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      variant: "",
      chassisNumber: "",
      year: new Date().getFullYear(),
      firstCirculationDate: "",
      fuelType: "diesel" as const,
      engineCapacity: 0,
      transmission: "manual" as const,
      mileage: 0,
      power: 0,
      notes: "",
      pricePurchase: 0,
      priceSale: 0,
      status: "available" as const,
      options: [],
    },
  });

  // Charger les données du véhicule existant
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const vehicleData = await vehiculeService.getVehicule(
          user.uid,
          vehicleId
        );

        if (vehicleData) {
          // Remplir le formulaire avec les données existantes
          form.setValue("brand", vehicleData.brand);
          form.setValue("model", vehicleData.model);
          form.setValue("variant", vehicleData.variant || "");
          form.setValue("chassisNumber", vehicleData.chassisNumber || "");
          form.setValue("year", vehicleData.year);
          form.setValue("firstCirculationDate", 
            typeof vehicleData.firstCirculationDate === 'object' && vehicleData.firstCirculationDate !== null 
              ? format(vehicleData.firstCirculationDate as Date, "yyyy-MM-dd") 
              : typeof vehicleData.firstCirculationDate === 'string'
                ? vehicleData.firstCirculationDate
                : ""
          );
          form.setValue("priceSale", vehicleData.priceSale || 0);
          form.setValue("pricePurchase", vehicleData.pricePurchase || 0);
          form.setValue("fuelType", vehicleData.fuelType);
          form.setValue("engineCapacity", vehicleData.engineCapacity);
          form.setValue("transmission", vehicleData.transmission);
          form.setValue("mileage", vehicleData.mileage);
          form.setValue("power", vehicleData.power);
          form.setValue("poidsVide", vehicleData.poidsVide || 0);
          form.setValue("color", vehicleData.color || "");
          form.setValue("doors", vehicleData.doors || 0);
          form.setValue("seats", vehicleData.seats || 0);
          form.setValue("status", vehicleData.status);
          form.setValue("notes", vehicleData.notes || "");
          form.setValue("autoscoutId", vehicleData.autoscoutId || "");

          // Gérer les options
          if (vehicleData.options && vehicleData.options.length > 0) {
            setSelectedOptions(vehicleData.options);
            form.setValue("options", vehicleData.options);
          }

          // Gérer les photos existantes
          if (vehicleData.photos && vehicleData.photos.length > 0) {
            setExistingPhotos(vehicleData.photos);
            setPhotoPreview(vehicleData.photos);
          }

          // Gérer la date de première mise en circulation
          if (vehicleData.firstCirculationDate) {
            const date = typeof vehicleData.firstCirculationDate === 'object' && vehicleData.firstCirculationDate !== null
              ? vehicleData.firstCirculationDate as Date
              : new Date(vehicleData.firstCirculationDate);
            setCirculationDate(date);
          }
        } else {
          uiToast({
            title: "Véhicule introuvable",
            description: "Le véhicule demandé n'existe pas ou a été supprimé.",
            variant: "destructive",
          });
          router.push("/dashboard/vehicules");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du véhicule:", error);
        toast.error("Impossible de charger les informations du véhicule.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchVehicleData();
    }
  }, [user, vehicleId, router, form, uiToast]);

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setPhotoFiles([...photoFiles, ...newFiles]);

      // Créer les URLs pour les aperçus
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPhotoPreview([...photoPreview, ...newPreviews]);
    }
  };

  // Remove existing photo
  const removeExistingPhoto = (url: string) => {
    setPhotosToDelete([...photosToDelete, url]);
    setExistingPhotos(existingPhotos.filter(photo => photo !== url));
    setPhotoPreview(photoPreview.filter(photo => photo !== url));
  };

  // Remove photo (pour les nouvelles photos)
  const removePhoto = (index: number) => {
    const newPhotoFiles = [...photoFiles];
    newPhotoFiles.splice(index, 1);
    setPhotoFiles(newPhotoFiles);

    // Trouver l'URL de prévisualisation qui n'est pas dans existingPhotos
    const nonExistingPreviews = photoPreview.filter(url => !existingPhotos.includes(url));
    if (nonExistingPreviews[index]) {
      URL.revokeObjectURL(nonExistingPreviews[index]);
      const newPreviews = [...photoPreview];
      const previewIndex = photoPreview.indexOf(nonExistingPreviews[index]);
      if (previewIndex !== -1) {
        newPreviews.splice(previewIndex, 1);
        setPhotoPreview(newPreviews);
      }
    }
  };

  // Add custom option
  const addCustomOption = () => {
    if (customOption.trim() && !selectedOptions.includes(customOption.trim())) {
      const newOptions = [...selectedOptions, customOption.trim()];
      setSelectedOptions(newOptions);
      form.setValue("options", newOptions);
      setCustomOption("");
    }
  };

  // Toggle option selection
  const toggleOption = (option: string) => {
    const newOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newOptions);
    form.setValue("options", newOptions);
  };

  // Remove option
  const removeOption = (option: string) => {
    const newOptions = selectedOptions.filter((o) => o !== option);
    setSelectedOptions(newOptions);
    form.setValue("options", newOptions);
  };

  // Nouvelle fonction pour télécharger une image depuis une URL externe
  const downloadImageFromUrl = async (
    imageUrl: string
  ): Promise<File | null> => {
    try {
      console.log(`Téléchargement de l'image depuis l'URL: ${imageUrl}`);

      // Télécharger l'image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `Erreur lors du téléchargement de l'image: ${response.statusText}`
        );
      }

      // Convertir en blob
      const blob = await response.blob();

      // Générer un nom de fichier unique
      const fileName = `autoscout_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}.jpg`;

      // Créer un fichier à partir du blob
      const file = new File([blob], fileName, { type: "image/jpeg" });

      console.log(
        `Image téléchargée avec succès: ${fileName} (${file.size} bytes)`
      );
      return file;
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast.error(
        `Erreur lors du téléchargement d'une image externe: ${imageUrl}`
      );
      return null;
    }
  };

  // Upload photos to Firebase Storage
  async function uploadPhotos(
    userId: string,
    vehiculeId: string
  ): Promise<string[]> {
    const photoUrls: string[] = [];

    console.log(`Début de l'upload pour le véhicule: ${vehiculeId}`);
    console.log(`Nombre de photos locales à uploader: ${photoFiles.length}`);
    console.log(`Nombre de photos externes à télécharger: ${externalPhotoUrls.length}`);

    // Afficher une notification pour indiquer le début de l'upload
    const totalPhotos = photoFiles.length + externalPhotoUrls.length;
    toast.info(`Téléchargement de ${totalPhotos} photo(s) en cours...`);

    return new Promise(async (resolve) => {
      // 1. D'abord uploader les fichiers locaux
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        try {
          console.log(`Upload de la photo ${i + 1}/${photoFiles.length}: ${file.name}`);

          // Afficher une notification pour chaque photo
          toast.loading(`Upload ${i + 1}/${photoFiles.length}: ${file.name}`, {
            id: `upload-${i}`,
            duration: 3000,
          });

          const url = await storageService.uploadVehiculeImage(
            userId,
            vehiculeId,
            file
          );

          console.log(`Photo ${i + 1} uploadée avec succès. URL: ${url}`);
          photoUrls.push(url);

          // Mise à jour du succès
          toast.success(`Photo ${i + 1}/${photoFiles.length} uploadée`, {
            id: `upload-${i}`,
          });
        } catch (error) {
          console.error("Erreur détaillée lors de l'upload:", error);
          toast.error(`Erreur: photo ${file.name} non uploadée`);
        }
      }

      // 2. Puis télécharger et uploader les photos externes
      if (externalPhotoUrls.length > 0) {
        toast.info(
          `Traitement des ${externalPhotoUrls.length} photos depuis AutoScout24...`
        );

        for (let i = 0; i < externalPhotoUrls.length; i++) {
          const url = externalPhotoUrls[i];
          try {
            console.log(
              `Téléchargement de la photo externe ${i + 1}/${
                externalPhotoUrls.length
              }`
            );

            // Notification de téléchargement
            toast.loading(
              `Téléchargement photo externe ${i + 1}/${externalPhotoUrls.length}`,
              {
                id: `download-${i}`,
                duration: 3000,
              }
            );

            // Télécharger l'image depuis l'URL externe
            const file = await downloadImageFromUrl(url);

            if (file) {
              console.log(
                `Upload de la photo externe ${i + 1} vers Firebase Storage`
              );

              toast.loading(
                `Upload photo externe ${i + 1}/${externalPhotoUrls.length}`,
                {
                  id: `external-upload-${i}`,
                  duration: 3000,
                }
              );

              // Uploader le fichier téléchargé vers Firebase Storage
              const firebaseUrl = await storageService.uploadVehiculeImage(
                userId,
                vehiculeId,
                file
              );

              console.log(
                `Photo externe ${
                  i + 1
                } uploadée avec succès. URL Firebase: ${firebaseUrl}`
              );
              photoUrls.push(firebaseUrl);

              toast.success(
                `Photo externe ${i + 1}/${externalPhotoUrls.length} importée`,
                {
                  id: `external-upload-${i}`,
                }
              );
            }
          } catch (error) {
            console.error(
              `Erreur lors du traitement de la photo externe ${i + 1}:`,
              error
            );
            toast.error(`Erreur: photo externe ${i + 1} non importée`);
          }
        }
      }

      console.log(`Upload terminé. ${photoUrls.length}/${totalPhotos} photos uploadées.`);
      resolve(photoUrls);
    });
  }



  // Handle form submission - modifié pour la mise à jour
  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Vous devez être connecté pour modifier un véhicule");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Mettre à jour le véhicule dans Firestore sans les photos
      await vehiculeService.updateVehicule(user.uid, vehicleId, {
        ...data,
        chassisNumber: data.chassisNumber || "",
      });

      // 2. Supprimer les photos marquées pour suppression
      for (const photoUrl of photosToDelete) {
        try {
          await storageService.deleteFile(photoUrl);
          console.log(`Photo supprimée: ${photoUrl}`);
        } catch (error) {
          console.error(`Erreur lors de la suppression de la photo ${photoUrl}:`, error);
        }
      }

      // 3. Télécharger les nouvelles photos
      let updatedPhotoUrls = [...existingPhotos]; // Commencer avec les photos existantes non supprimées
      
      if (photoFiles.length > 0 || externalPhotoUrls.length > 0) {
        const newPhotoUrls = await uploadPhotos(user.uid, vehicleId);
        
        if (newPhotoUrls.length > 0) {
          updatedPhotoUrls = [...updatedPhotoUrls, ...newPhotoUrls];
          
          // Mettre à jour le véhicule avec toutes les URLs de photos
          await vehiculeService.updateVehicule(user.uid, vehicleId, {
            photos: updatedPhotoUrls,
          });
          console.log("Photos mises à jour dans la base de données");
        }
      } else if (existingPhotos.length !== photoPreview.length) {
        // S'il y a eu des suppressions mais pas de nouveaux ajouts
        await vehiculeService.updateVehicule(user.uid, vehicleId, {
          photos: existingPhotos,
        });
        console.log("Liste de photos mise à jour après suppressions");
      }

      toast.success("Véhicule mis à jour avec succès");
      router.push(`/dashboard/vehicules/${vehicleId}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du véhicule:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du véhicule");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des données du véhicule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Modifier le véhicule
          </h1>
          <p className="text-muted-foreground">
            Modifiez les informations du véhicule existant.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/vehicules/${vehicleId}`)}
        >
          Annuler
        </Button>
      </div>

      {/* Modale de progression */}
      <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-950 border-0 shadow-xl">
          <div className="bg-primary py-6 px-6">
            <DialogTitle className="text-xl font-semibold text-white mb-2">
              Importation des données
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              Récupération des données depuis AutoScout24 en cours...
            </DialogDescription>
          </div>

          <div className="space-y-8 p-6">
            {/* Barre de progression */}
            <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            {/* Étape 1: Connexion */}
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <div
                  className={`
                  flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                  ${
                    stepStatus[1] === "pending"
                      ? "bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10"
                      : stepStatus[1] === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : stepStatus[1] === "error"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }
                `}
                >
                  {stepStatus[1] === "pending" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-primary" />
                  ) : stepStatus[1] === "success" ? (
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : stepStatus[1] === "error" ? (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
                {currentStep > 1 && stepStatus[1] === "success" && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 transition-all duration-300">
                <h4
                  className={`font-medium text-base ${
                    currentStep === 1
                      ? "text-primary dark:text-primary"
                      : stepStatus[1] === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stepStatus[1] === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Connexion au serveur
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Établissement de la connexion avec AutoScout24
                </p>
              </div>
            </div>

            {/* Étape 2: Récupération */}
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <div
                  className={`
                  flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                  ${
                    stepStatus[2] === "pending"
                      ? "bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10"
                      : stepStatus[2] === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : stepStatus[2] === "error"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }
                `}
                >
                  {stepStatus[2] === "pending" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-primary" />
                  ) : stepStatus[2] === "success" ? (
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : stepStatus[2] === "error" ? (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
                {currentStep > 2 && stepStatus[2] === "success" && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 transition-all duration-300">
                <h4
                  className={`font-medium text-base ${
                    currentStep === 2
                      ? "text-primary dark:text-primary"
                      : stepStatus[2] === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stepStatus[2] === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Récupération des données
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Extraction des informations du véhicule
                </p>
              </div>
            </div>

            {/* Étape 3: Traitement */}
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <div
                  className={`
                  flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                  ${
                    stepStatus[3] === "pending"
                      ? "bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10"
                      : stepStatus[3] === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : stepStatus[3] === "error"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }
                `}
                >
                  {stepStatus[3] === "pending" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-primary" />
                  ) : stepStatus[3] === "success" ? (
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : stepStatus[3] === "error" ? (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
                {currentStep > 3 && stepStatus[3] === "success" && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 transition-all duration-300">
                <h4
                  className={`font-medium text-base ${
                    currentStep === 3
                      ? "text-primary dark:text-primary"
                      : stepStatus[3] === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stepStatus[3] === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Traitement des données
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analyse et formatage des informations
                </p>
              </div>
            </div>

            {/* Étape 4: Importation */}
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <div
                  className={`
                  flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                  ${
                    stepStatus[4] === "pending"
                      ? "bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10"
                      : stepStatus[4] === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : stepStatus[4] === "error"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }
                `}
                >
                  {stepStatus[4] === "pending" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-primary" />
                  ) : stepStatus[4] === "success" ? (
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : stepStatus[4] === "error" ? (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
                {currentStep > 4 && stepStatus[4] === "success" && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 transition-all duration-300">
                <h4
                  className={`font-medium text-base ${
                    currentStep === 4
                      ? "text-primary dark:text-primary"
                      : stepStatus[4] === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stepStatus[4] === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Importation dans le formulaire
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remplissage automatique des champs du formulaire
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsProgressModalOpen(false)}
              disabled={currentStep < 4 || stepStatus[4] !== "success"}
              className={`
                min-w-[120px] transition-all duration-300
                ${
                  stepStatus[4] === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                    : ""
                }
              `}
            >
              {currentStep < 4 || stepStatus[4] !== "success" ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Veuillez patienter...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Terminé</span>
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator className="my-6" />
      <Separator className="my-6" />

      <Tabs defaultValue="info" className="w-full">
        <div className="mb-8 border-b">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="tech"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Caractéristiques
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Options
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Photos
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="info" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations principales</CardTitle>
                  <CardDescription>
                    Entrez les informations de base du véhicule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marque*</FormLabel>
                          <FormControl>
                            <Input placeholder="Volkswagen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modèle*</FormLabel>
                          <FormControl>
                            <Input placeholder="Golf" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="variant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variante</FormLabel>
                          <FormControl>
                            <Input placeholder="GTI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chassisNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de chassis*</FormLabel>
                          <FormControl>
                            <Input placeholder="WVWZZZ1KZXW000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année*</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstCirculationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Date de 1ère mise en circulation*
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                className="w-full pl-3"
                                min="1900-01-01"
                                max={format(new Date(), "yyyy-MM-dd")}
                                value={field.value || ""}
                                onChange={(e) => {
                                  const date = e.target.value
                                    ? new Date(e.target.value)
                                    : undefined;
                                  setCirculationDate(date);
                                  field.onChange(e.target.value || "");
                                }}
                              />
                              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">
                                Disponible
                              </SelectItem>
                              <SelectItem value="sold">Vendu</SelectItem>
                              <SelectItem value="reserved">Réservé</SelectItem>
                              <SelectItem value="maintenance">
                                En maintenance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pricePurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix d&apos;achat (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Prix d'achat"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priceSale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix de vente (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Prix de vente"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="autoscoutId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID AutoScout24</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ID de l'annonce sur AutoScout24"
                            {...field}
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Ajoutez des notes ou remarques concernant ce véhicule.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes et remarques sur le véhicule..."
                            className="min-h-[120px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tech" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques techniques</CardTitle>
                  <CardDescription>
                    Entrez les spécifications techniques du véhicule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de carburant*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="gasoline">Essence</SelectItem>
                              <SelectItem value="electric">
                                Électrique
                              </SelectItem>
                              <SelectItem value="hybrid">Hybride</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manual">Manuelle</SelectItem>
                              <SelectItem value="automatic">
                                Automatique
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="engineCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cylindrée (cc)*</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="power"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puissance (kW)*</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilométrage*</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur</FormLabel>
                          <FormControl>
                            <Input placeholder="Noir" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="doors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de portes</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de places</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="poidsVide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poids à vide (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Options et équipements</CardTitle>
                  <CardDescription>
                    Sélectionnez les options et équipements présents sur le
                    véhicule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedOptions.length > 0 ? (
                      selectedOptions.map((option) => (
                        <Badge
                          key={option}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {option}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeOption(option)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aucune option sélectionnée
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Ajouter une option personnalisée"
                      value={customOption}
                      onChange={(e) => setCustomOption(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addCustomOption}>
                      Ajouter
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(vehicleOptionsCategories).map(
                        ([category, options]) => (
                          <AccordionItem key={category} value={category}>
                            <AccordionTrigger className="text-base font-medium">
                              {category}{" "}
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({options.length})
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                                {options.map((option) => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`option-${option}`}
                                      checked={selectedOptions.includes(option)}
                                      onCheckedChange={() =>
                                        toggleOption(option)
                                      }
                                    />
                                    <label
                                      htmlFor={`option-${option}`}
                                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Photos du véhicule</CardTitle>
                  <CardDescription>
                    Gérez les photos existantes ou ajoutez-en de nouvelles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">
                            Cliquez pour télécharger
                          </span>{" "}
                          ou glissez-déposez
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG ou WEBP (max. 10 MB par image)
                        </p>
                      </div>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </Label>
                  </div>

                  {photoPreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {photoPreview.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Vehicle photo ${index + 1}`}
                            className="h-40 w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => 
                              existingPhotos.includes(photo)
                                ? removeExistingPhoto(photo)
                                : removePhoto(index)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push(`/dashboard/vehicules/${vehicleId}`)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour le véhicule
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
