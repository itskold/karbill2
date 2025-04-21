import { Shield, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalTemplates: number;
  activeGuarantees: number;
  expiredGuarantees: number;
  expiringGuarantees?: number;
}

export function StatsCards({
  totalTemplates,
  activeGuarantees,
  expiredGuarantees,
  expiringGuarantees,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Shield className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total garanties
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {totalTemplates}
                </p>
                <p className="text-xs text-slate-500">modèles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-emerald-50 p-3 rounded-md">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Garanties actives
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {activeGuarantees}
                </p>
                <p className="text-xs text-emerald-600">en cours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-red-50 p-3 rounded-md">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Garanties expirées
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {expiredGuarantees}
                </p>
                <p className="text-xs text-red-600">expirées</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Calendar className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Expirant bientôt
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">
                  {expiringGuarantees}
                </p>
                <p className="text-xs text-slate-500">dans 30 jours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
