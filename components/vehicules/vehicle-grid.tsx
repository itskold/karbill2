import Link from "next/link";
import { useState } from "react";
import { Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  getStatusBadge,
  getFuelTypeText,
  getTransmissionText,
} from "@/components/vehicules/utils";
import type { IVehicle } from "@/components/vehicules/types";
import { vehiculeService } from "@/components/vehicules/vehicule.schema";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface VehicleGridProps {
  vehicles: IVehicle[];
  onVehicleDeleted?: () => void;
}

export function VehicleGrid({ vehicles, onVehicleDeleted }: VehicleGridProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-video relative">
              <img
                src={
                  vehicle.photos[0] || "/placeholder.svg?height=200&width=300"
                }
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(vehicle.status)}
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-slate-900">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {vehicle.variant ? `${vehicle.variant}` : ""} <br />
                  </p>
                </div>
                <p className="font-semibold text-lg text-slate-900">
                  {vehicle.priceSale?.toLocaleString()} €
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary text-white border-primary"
                >
                  {getFuelTypeText(vehicle.fuelType)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-primary text-white border-primary"
                >
                  {getTransmissionText(vehicle.transmission)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-primary text-white border-primary"
                >
                  {vehicle.year}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-primary text-white border-primary"
                >
                  {vehicle.mileage + " km"}
                </Badge>
              </div>
            </CardContent>
            <div className="px-5 pb-5 flex justify-between border-t border-slate-100 mt-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-slate-700 border-slate-300"
              >
                <Link href={`/dashboard/vehicules/${vehicle.id}`}>
                  <Eye className="mr-2 h-3 w-3" /> Détails
                </Link>
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
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/vehicules/${vehicle.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setVehicleToDelete(vehicle)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
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
