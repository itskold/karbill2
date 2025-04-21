"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, ExternalLink } from "lucide-react";
import { getStatusBadge } from "@/components/vehicules/utils";
import type { IVehicle } from "@/components/vehicules/types";
import Link from "next/link";
interface InfoSectionProps {
  vehicle: IVehicle;
}

export function InfoSection({ vehicle }: InfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Informations principales */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Informations principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Marque</p>
                <p className="text-slate-900">{vehicle.brand}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Modèle</p>
                <p className="text-slate-900">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Variante</p>
                <p className="text-slate-900">{vehicle.variant || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Numéro de chassis
                </p>
                <p className="text-slate-900">{vehicle.chassisNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Année</p>
                <p className="text-slate-900">{vehicle.year}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Date de 1ère mise en circulation
                </p>
                <p className="text-slate-900">
                  {format(
                    new Date(vehicle.firstCirculationDate),
                    "dd MMMM yyyy",
                    { locale: fr }
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Prix d'achat
                </p>
                <p className="text-slate-900">
                  {vehicle.pricePurchase?.toLocaleString() || "-"} €
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Prix de vente
                </p>
                <p className="text-slate-900 font-semibold">
                  {vehicle.priceSale?.toLocaleString() || "-"} €
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Statut</p>
                <div className="mt-1">{getStatusBadge(vehicle.status)}</div>
              </div>
              {vehicle.autoscoutId && (
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    AutoScout24
                  </p>
                  <Link
                    href={`https://www.autoscout24.be/fr/offres/${vehicle.autoscoutId}`}
                    target="_blank"
                    className="flex items-center text-slate-900"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Accéder à l'annonce
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo principale */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Photo principale</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-0">
          <img
            src={vehicle.photos[0] || "/placeholder.svg?height=300&width=400"}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-auto object-cover"
          />
        </CardContent>
        <CardFooter className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => document.getElementById("photos-tab")?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" /> Voir toutes les photos (
            {vehicle.photos.length})
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
