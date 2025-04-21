import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Edit, Trash2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getStatusBadge } from "@/components/vehicules/utils";
import type { IVehicle } from "@/components/vehicules/types";
import { vehiculeService } from "@/components/vehicules/vehicule.schema";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface VehicleListProps {
  vehicles: IVehicle[];
  onVehicleDeleted?: () => void;
}

export function VehicleList({ vehicles, onVehicleDeleted }: VehicleListProps) {
  const [vehicleToDelete, setVehicleToDelete] = useState<IVehicle | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!vehicleToDelete || !user) return;

    try {
      await vehiculeService.deleteVehicule(user.uid, vehicleToDelete.id);
      toast({
        title: "Véhicule supprimé",
        description: `Le véhicule ${vehicleToDelete.brand} ${vehicleToDelete.model} a été supprimé avec succès.`,
        variant: "default",
      });

      // Rafraîchir la liste après suppression
      if (onVehicleDeleted) {
        onVehicleDeleted();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du véhicule:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du véhicule.",
        variant: "destructive",
      });
    } finally {
      setVehicleToDelete(null);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-lg">
        <Car className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">
          Aucun véhicule trouvé
        </h3>
        <p className="text-slate-500 mt-1 max-w-md">
          Aucun véhicule ne correspond à vos critères de recherche. Veuillez
          modifier vos filtres ou ajouter de nouveaux véhicules.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-100/80">
              <TableHead className="font-medium text-slate-700">
                Véhicule
              </TableHead>
              <TableHead className="font-medium text-slate-700">
                Année
              </TableHead>
              <TableHead className="font-medium text-slate-700">
                Kilométrage
              </TableHead>
              <TableHead className="font-medium text-slate-700">Prix</TableHead>
              <TableHead className="font-medium text-slate-700">
                Statut
              </TableHead>
              <TableHead className="font-medium text-slate-700">
                Ajouté le
              </TableHead>
              <TableHead className="text-right font-medium text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="font-medium text-slate-900">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="text-sm text-slate-500">
                    {vehicle.variant || ""}
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">{vehicle.year}</TableCell>
                <TableCell className="text-slate-700">
                  {vehicle.mileage.toLocaleString()} km
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {vehicle.priceSale?.toLocaleString()} €
                </TableCell>
                <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                <TableCell className="text-slate-700">
                  {format(vehicle.createdAt, "dd/MM/yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-slate-700 h-8 w-8"
                    >
                      <Link href={`/dashboard/vehicules/${vehicle.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-slate-700 h-8 w-8"
                    >
                      <Link
                        href={`/dashboard/vehicules/${vehicle.id}/modifier`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 h-8 w-8"
                      onClick={() => setVehicleToDelete(vehicle)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce véhicule{" "}
              {vehicleToDelete?.brand} {vehicleToDelete?.model} ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Import Car icon
import { Car } from "lucide-react";
