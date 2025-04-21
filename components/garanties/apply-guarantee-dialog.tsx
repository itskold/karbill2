"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Car, User, Shield, EuroIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type {
  IGuaranteeTemplate,
  IGuarantee,
} from "@/components/garanties/types";
import {
  vehiculeService,
  type Vehicule,
} from "@/components/vehicules/vehicule.schema";
import { clientService, type Client } from "@/components/clients/client.schema";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ApplyGuaranteeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: IGuaranteeTemplate[];
  onSubmit: (guarantee: Partial<IGuarantee>) => void;
}

export function ApplyGuaranteeDialog({
  open,
  onOpenChange,
  templates = [],
  onSubmit,
}: ApplyGuaranteeDialogProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [price, setPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // États pour les données Firebase
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);

  // Charger les données des véhicules et des clients au montage
  useEffect(() => {
    if (!user || !open) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Récupérer les véhicules disponibles
        const vehicleData = await vehiculeService.getVehicules(user.uid, []);
        setVehicles(vehicleData || []);

        // Récupérer les clients
        const clientData = await clientService.getClients(user.uid, []);
        setClients(clientData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Réinitialiser à des tableaux vides en cas d'erreur
        setVehicles([]);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, open]);

  // Mettre à jour le prix lorsqu'un modèle est sélectionné
  useEffect(() => {
    if (selectedTemplateObj) {
      setPrice(selectedTemplateObj.price);
    }
  }, [selectedTemplate, selectedTemplateObj]);

  // Calculer la date de fin en fonction du modèle sélectionné
  const endDate = selectedTemplateObj
    ? new Date(
        startDate.getTime() +
          selectedTemplateObj.duration * 30 * 24 * 60 * 60 * 1000
      )
    : startDate;

  const handleSubmit = () => {
    // Vérifier que toutes les données requises sont présentes
    if (
      !selectedTemplate ||
      !selectedVehicle ||
      !selectedClient ||
      !startDate
    ) {
      console.error("Données manquantes pour la soumission de la garantie");
      return;
    }

    const newGuarantee: Partial<IGuarantee> = {
      templateId: selectedTemplate,
      vehicleId: selectedVehicle,
      clientId: selectedClient,
      startDate,
      endDate,
      status: "active",
      price,
      notes: notes || "",
      createdAt: new Date(),
    };
    onSubmit(newGuarantee);

    // Réinitialiser le formulaire
    setSelectedTemplate("");
    setSelectedVehicle("");
    setSelectedClient("");
    setStartDate(new Date());
    setPrice(0);
    setNotes("");

    onOpenChange(false);
  };

  // Formatter le nom du client pour l'affichage
  const formatClientName = (client: Client) => {
    if (!client) return "Client inconnu";

    if (client.type === "particulier") {
      return `${client.prenom || ""} ${client.nom || ""}`.trim() || "Sans nom";
    } else {
      return (
        client.entreprise ||
        `${client.prenom || ""} ${client.nom || ""}`.trim() ||
        "Sans nom"
      );
    }
  };

  // Formatter le nom du véhicule pour l'affichage
  const formatVehicleName = (vehicle: Vehicule) => {
    if (!vehicle) return "Véhicule inconnu";

    return (
      `${vehicle.brand || ""} ${vehicle.model || ""} ${
        vehicle.year ? `(${vehicle.year})` : ""
      } ${vehicle.chassisNumber ? `- ${vehicle.chassisNumber}` : ""}`.trim() ||
      "Véhicule sans détails"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Appliquer une garantie</DialogTitle>
          <DialogDescription>
            Sélectionnez un modèle de garantie et appliquez-le à un véhicule et
            un client.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
            <span className="ml-2 text-slate-600">
              Chargement des données...
            </span>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Modèle de garantie*</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Sélectionner un modèle de garantie" />
                </SelectTrigger>
                <SelectContent>
                  {(templates || []).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-slate-500" />
                        <span>{template.name}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          ({template.duration} mois -{" "}
                          {(template.price || 0).toLocaleString()} €)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplateObj && (
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTemplateObj.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Véhicule*</Label>
                <Select
                  value={selectedVehicle}
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger id="vehicle" className="w-full">
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicles || [])
                      .filter(
                        (v) =>
                          v &&
                          (v.status === "available" || v.status === "reserved")
                      )
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center">
                            <Car className="mr-2 h-4 w-4 text-slate-500" />
                            <span>{formatVehicleName(vehicle)}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client*</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients || []).map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-slate-500" />
                          <span>{formatClientName(client)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début*</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    className="w-full pl-3"
                    min={format(
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1)
                      ),
                      "yyyy-MM-dd"
                    )}
                    max={format(
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 10)
                      ),
                      "yyyy-MM-dd"
                    )}
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      date && setStartDate(date);
                    }}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date de fin (calculée)</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700 flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {format(endDate, "dd MMMM yyyy", { locale: fr })}
                </div>
                {selectedTemplateObj && (
                  <p className="text-xs text-slate-500">
                    Durée: {selectedTemplateObj.duration} mois
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)*</Label>
              <div className="relative">
                <EuroIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={price.toString()}
                  onChange={(e) =>
                    setPrice(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              {selectedTemplateObj && (
                <p className="text-xs text-slate-500">
                  Prix suggéré:{" "}
                  {(selectedTemplateObj.price || 0).toLocaleString()} €
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou commentaires sur cette garantie..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !selectedTemplate ||
              !selectedVehicle ||
              !selectedClient ||
              price <= 0
            }
          >
            Appliquer la garantie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
