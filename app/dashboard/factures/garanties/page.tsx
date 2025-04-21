"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Check, Shield, CheckCircle2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/garanties/stats-cards";
import { TemplatesTable } from "@/components/garanties/templates-table";
import { GuaranteesTable } from "@/components/garanties/guarantees-table";
import { CreateGuaranteeDialog } from "@/components/garanties/create-guarantee-dialog";
import { ApplyGuaranteeDialog } from "@/components/garanties/apply-guarantee-dialog";
import {
  Garantie,
  GarantieTemplate,
  garantieService,
} from "@/components/garanties/garantie.schema";
import type {
  IGuaranteeTemplate,
  IGuarantee,
  TGuaranteeType,
  TGuaranteeStatus,
  TGuaranteeApplicability,
} from "@/components/garanties/types";
import { useAuth } from "@/hooks/use-auth";
import { where, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";

// Mappeur pour convertir entre le schéma Firebase et l'interface IGuaranteeTemplate
const mapGarantieTemplateToTemplate = (
  template: GarantieTemplate
): IGuaranteeTemplate => {
  // Définir les valeurs par défaut qui respectent les types
  const type: TGuaranteeType = "standard";
  const applicability: TGuaranteeApplicability = "all";
  const status: TGuaranteeStatus = template.status as TGuaranteeStatus;

  return {
    id: template.id,
    name: template.name,
    description: template.description || "",
    type,
    duration: template.duration,
    applicability,
    conditions: template.conditions || "",
    limitations: "",
    status,
    price: template.price,
    createdAt: template.createdAt || new Date(),
    updatedAt: template.updatedAt || new Date(),
  };
};

// Mappeur pour convertir entre le schéma Firebase et l'interface IGuarantee
const mapGarantieToGuarantee = (garantie: Garantie): IGuarantee => {
  // Mapper le statut de la garantie
  let status: "active" | "expired" | "cancelled" = "active";

  if (garantie.status === "expired") {
    status = "expired";
  } else if (garantie.status === "cancelled") {
    status = "cancelled";
  }

  return {
    id: garantie.id,
    templateId: garantie.templateId || "",
    vehicleId: garantie.vehiculeId,
    clientId: garantie.clientId,
    invoiceId: "",
    startDate: garantie.startDate || new Date(),
    endDate: garantie.endDate || new Date(),
    status,
    price: garantie.price,
    notes: garantie.description,
    createdAt: garantie.createdAt || new Date(),
  };
};

export default function GuaranteesPage() {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<"templates" | "active">("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  // États pour stocker les données Firestore
  const [templates, setTemplates] = useState<GarantieTemplate[]>([]);
  const [guarantees, setGuarantees] = useState<Garantie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // État pour le formulaire de création
  const [newGuarantee, setNewGuarantee] = useState<Partial<IGuaranteeTemplate>>(
    {
      name: "",
      description: "",
      type: "standard",
      duration: 12,
      applicability: "all",
      conditions: "",
      limitations: "",
      status: "draft",
      price: 0,
    }
  );

  // Charger les données depuis Firebase
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Charger les templates de garantie
        const templateData = await garantieService.getTemplates(user.uid, [
          orderBy("name"),
        ]);
        setTemplates(templateData);

        // Charger les garanties actives
        const guaranteeData = await garantieService.getActiveGaranties(
          user.uid
        );
        setGuarantees(guaranteeData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, loading]);

  // Filtrer les templates de garantie
  const filteredTemplates = templates.filter((template) => {
    // Filtre de recherche
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchLower) ||
      (template.description || "").toLowerCase().includes(searchLower);

    // Filtre de statut si spécifié
    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtrer les garanties actives
  const filteredGuarantees = guarantees.filter((guarantee) => {
    // Filtre de recherche
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      guarantee.name.toLowerCase().includes(searchLower) ||
      (guarantee.description || "").toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  // Créer un nouveau modèle de garantie
  const handleCreateGuarantee = async () => {
    if (!user) return;

    try {
      // Convertir le modèle d'interface vers le modèle Firebase
      const templateData: Omit<
        GarantieTemplate,
        "id" | "userId" | "createdAt" | "updatedAt"
      > = {
        name: newGuarantee.name || "",
        description: newGuarantee.description || "",
        duration: newGuarantee.duration || 12,
        price: newGuarantee.price || 0,
        conditions: newGuarantee.conditions || "",
        status: (newGuarantee.status || "active") as
          | "active"
          | "inactive"
          | "draft",
        type: newGuarantee.type || "standard",
        applicability: newGuarantee.applicability || "all",
      };

      // Créer le modèle dans Firebase
      const newId = await garantieService.createTemplate(
        user.uid,
        templateData
      );

      // Recharger les templates
      const updatedTemplates = await garantieService.getTemplates(user.uid, [
        orderBy("name"),
      ]);
      setTemplates(updatedTemplates);

      toast.success("Modèle de garantie créé avec succès");

      // Réinitialiser le formulaire et fermer le dialogue
      setNewGuarantee({
        name: "",
        description: "",
        type: "standard",
        duration: 12,
        applicability: "all",
        conditions: "",
        limitations: "",
        status: "draft",
        price: 0,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création du modèle:", error);
      toast.error("Erreur lors de la création du modèle de garantie");
    }
  };

  // Appliquer une garantie à un véhicule/client
  const handleApplyGuarantee = async (newGuaranteeData: any) => {
    if (!user) return;

    try {
      // Trouver le template sélectionné
      const selectedTemplate = templates.find(
        (t) => t.id === newGuaranteeData.templateId
      );

      if (!selectedTemplate) {
        toast.error("Modèle de garantie introuvable");
        return;
      }

      // Calculer la date de fin basée sur la durée
      const startDate = new Date(newGuaranteeData.startDate || new Date());
      const endDate = addMonths(startDate, selectedTemplate.duration);

      // Convertir depuis l'interface vers le modèle Firebase (adapter vehicleId -> vehiculeId)
      const garantieData: Omit<
        Garantie,
        "id" | "userId" | "createdAt" | "updatedAt"
      > = {
        name: selectedTemplate.name,
        description: newGuaranteeData.notes || "",
        duration: selectedTemplate.duration,
        price: newGuaranteeData.price || selectedTemplate.price,
        conditions: selectedTemplate.conditions,
        isTemplate: false,
        templateId: newGuaranteeData.templateId, // ID du template source
        vehiculeId: newGuaranteeData.vehicleId, // Convertir vehicleId de l'interface en vehiculeId pour Firebase
        clientId: newGuaranteeData.clientId,
        startDate: startDate,
        endDate: endDate,
        status: "active",
        type: selectedTemplate.type || "standard", // Utiliser le type du template
      };

      // Créer la garantie dans Firebase
      const newId = await garantieService.createGarantie(
        user.uid,
        garantieData
      );

      // Recharger les garanties
      const updatedGuarantees = await garantieService.getActiveGaranties(
        user.uid
      );
      setGuarantees(updatedGuarantees);

      toast.success("Garantie appliquée avec succès");
      setIsApplyDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'application de la garantie:", error);
      toast.error("Erreur lors de l'application de la garantie");
    }
  };

  return (
    <div className="bg-white">
      {/* En-tête avec fond subtil */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Gestion des garanties
              </h1>
              <p className="text-slate-500 mt-1">
                Créez et gérez les garanties pour vos véhicules
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Shield className="mr-2 h-4 w-4" /> Créer un modèle
              </Button>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700"
                onClick={() => setIsApplyDialogOpen(true)}
              >
                <Car className="mr-2 h-4 w-4" /> Appliquer une garantie
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cartes de statistiques */}
        <StatsCards
          totalTemplates={templates.length}
          activeGuarantees={
            guarantees.filter((g) => g.status === "active").length
          }
          expiredGuarantees={
            guarantees.filter((g) => g.status === "expired").length
          }
        />

        {/* Onglets et filtres */}
        <div className="space-y-6 mt-8">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="w-full md:w-auto">
                <Tabs
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "templates" | "active")
                  }
                >
                  <div className="mb-8 border-b">
                    <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
                      <TabsTrigger
                        value="templates"
                        className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <Shield width="18" height="18" /> Modèles de garantie
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 width="18" height="18" /> Garanties
                          appliquées
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>

              <div className="flex flex-1 items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher une garantie..."
                    className="pl-9 border-slate-300 focus-visible:ring-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-300 text-slate-700"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel className="text-slate-700">
                      Filtrer par type
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                      {typeFilter === "all" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={typeFilter === "all" ? "font-medium" : ""}
                      >
                        Tous les types
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter("standard")}>
                      {typeFilter === "standard" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          typeFilter === "standard" ? "font-medium" : ""
                        }
                      >
                        Standard
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter("extended")}>
                      {typeFilter === "extended" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          typeFilter === "extended" ? "font-medium" : ""
                        }
                      >
                        Étendue
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter("premium")}>
                      {typeFilter === "premium" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          typeFilter === "premium" ? "font-medium" : ""
                        }
                      >
                        Premium
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter("custom")}>
                      {typeFilter === "custom" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={typeFilter === "custom" ? "font-medium" : ""}
                      >
                        Personnalisée
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-slate-700">
                      Filtrer par statut
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      {statusFilter === "all" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={statusFilter === "all" ? "font-medium" : ""}
                      >
                        Tous les statuts
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      {statusFilter === "active" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          statusFilter === "active" ? "font-medium" : ""
                        }
                      >
                        Actives
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("inactive")}
                    >
                      {statusFilter === "inactive" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          statusFilter === "inactive" ? "font-medium" : ""
                        }
                      >
                        Inactives
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                      {statusFilter === "draft" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span
                        className={
                          statusFilter === "draft" ? "font-medium" : ""
                        }
                      >
                        Brouillons
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-slate-500">Chargement des données...</p>
              </div>
            ) : (
              <>
                {viewMode === "templates" && (
                  <TemplatesTable
                    templates={filteredTemplates.map(
                      mapGarantieTemplateToTemplate
                    )}
                  />
                )}
                {viewMode === "active" && (
                  <GuaranteesTable
                    guarantees={filteredGuarantees.map(mapGarantieToGuarantee)}
                    templates={templates.map(mapGarantieTemplateToTemplate)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialogue pour créer un modèle de garantie */}
      <CreateGuaranteeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        guarantee={newGuarantee}
        onGuaranteeChange={setNewGuarantee}
        onSubmit={handleCreateGuarantee}
      />

      {/* Dialogue pour appliquer une garantie à un véhicule/client */}
      <ApplyGuaranteeDialog
        open={isApplyDialogOpen}
        onOpenChange={setIsApplyDialogOpen}
        templates={templates
          .filter((t) => t.status === "active")
          .map(mapGarantieTemplateToTemplate)}
        onSubmit={handleApplyGuarantee}
      />
    </div>
  );
}
