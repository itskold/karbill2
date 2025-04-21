"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Eye,
  MoreHorizontal,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGuaranteeStatusBadge } from "@/components/garanties/utils";
import type {
  GarantieTemplate,
  Garantie,
} from "@/components/garanties/garantie.schema";
import type { Vehicule } from "@/components/vehicules/vehicule.schema";
import type { Client } from "@/components/clients/client.schema";
import { useEffect, useState } from "react";

interface GuaranteesTableProps {
  guarantees: Garantie[];
  templates: GarantieTemplate[];
}

export function GuaranteesTable({
  guarantees = [],
  templates = [],
}: GuaranteesTableProps) {
  const router = useRouter();
  const [vehiclesData, setVehiclesData] = useState<Record<string, Vehicule>>(
    {}
  );
  const [clientsData, setClientsData] = useState<Record<string, Client>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour obtenir le nom du client en fonction de son type
  const getClientName = (clientId?: string) => {
    if (!clientId || !clientsData[clientId]) return "Client inconnu";

    const client = clientsData[clientId];

    if (client.type === "particulier") {
      return `${client.prenom || ""} ${client.nom || ""}`.trim();
    } else {
      return client.entreprise || "Entreprise";
    }
  };

  // Fonction pour obtenir les informations du véhicule
  const getVehicleInfo = (vehicleId?: string) => {
    if (!vehicleId || !vehiclesData[vehicleId]) return "Véhicule inconnu";

    const vehicle = vehiclesData[vehicleId];
    return `${vehicle.brand || ""} ${vehicle.model || ""}`.trim();
  };

  // Fonction pour naviguer vers la page de détails d'une garantie
  const navigateToGuaranteeDetails = (guaranteeId: string) => {
    router.push(`/dashboard/factures/garanties/${guaranteeId}`);
  };

  if (!guarantees || guarantees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-lg">
        <Shield className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">
          Aucune garantie trouvée
        </h3>
        <p className="text-slate-500 mt-1 max-w-md">
          Aucune garantie ne correspond à vos critères de recherche. Veuillez
          modifier vos filtres ou créer une nouvelle garantie.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-slate-100/80">
            <TableHead className="font-medium text-slate-700">Modèle</TableHead>
            <TableHead className="font-medium text-slate-700">
              Véhicule / Client
            </TableHead>
            <TableHead className="font-medium text-slate-700">
              Période
            </TableHead>
            <TableHead className="font-medium text-slate-700">Prix</TableHead>
            <TableHead className="font-medium text-slate-700">Statut</TableHead>
            <TableHead className="font-medium text-slate-700">
              Créée le
            </TableHead>
            <TableHead className="text-right font-medium text-slate-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guarantees.map((guarantee) => {
            const template = templates.find(
              (t) => t.id === guarantee.templateId
            );
            return (
              <TableRow key={guarantee.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="font-medium text-slate-900">
                    {template?.name || "Garantie inconnue"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {template
                      ? getGuaranteeStatusBadge(guarantee.type || "")
                      : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-900">
                    {getVehicleInfo(guarantee.vehiculeId)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {getClientName(guarantee.clientId)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-900">
                    {format(guarantee.startDate || new Date(), "dd/MM/yyyy", {
                      locale: fr,
                    })}{" "}
                    -{" "}
                    {format(guarantee.endDate || new Date(), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </div>
                  <div className="text-sm text-slate-500">
                    {Math.round(
                      (guarantee.endDate?.getTime() ||
                        new Date().getTime() -
                          (guarantee.startDate?.getTime() ||
                            new Date().getTime())) /
                        (1000 * 60 * 60 * 24 * 30)
                    )}{" "}
                    mois
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {guarantee.price.toLocaleString()} €
                </TableCell>
                <TableCell>
                  {getGuaranteeStatusBadge(guarantee.status || "")}
                </TableCell>
                <TableCell className="text-slate-700">
                  {format(guarantee.createdAt || new Date(), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToGuaranteeDetails(guarantee.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigateToGuaranteeDetails(guarantee.id)
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" /> Voir détails
                        </DropdownMenuItem>
                        {guarantee.status === "active" ? (
                          <DropdownMenuItem>
                            <AlertCircle className="mr-2 h-4 w-4" /> Annuler
                          </DropdownMenuItem>
                        ) : guarantee.status === "cancelled" ? (
                          <DropdownMenuItem>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Réactiver
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
