import { Car, Check, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  soldVehicles: number;
  totalInventoryValue: number;
}

export function StatsCards({
  totalVehicles,
  availableVehicles,
  reservedVehicles,
  soldVehicles,
  totalInventoryValue,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Car className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total véhicules
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {totalVehicles}
                </p>
                <p className="text-xs text-slate-500">unités</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-emerald-50 p-3 rounded-md">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Disponibles</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {availableVehicles}
                </p>
                <p className="text-xs text-emerald-600">
                  {Math.round((availableVehicles / totalVehicles) * 100) || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-blue-50 p-3 rounded-md">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Réservés</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {reservedVehicles}
                </p>
                <p className="text-xs text-blue-600">
                  {Math.round((reservedVehicles / totalVehicles) * 100) || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Tag className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Valeur inventaire
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {totalInventoryValue}
                </p>
                <p className="text-xs text-slate-500">EUR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
