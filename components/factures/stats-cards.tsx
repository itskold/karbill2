import { Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalDeposits: number
  paidDeposits: number
  pendingDeposits: number
  totalDepositAmount: number
}

export function StatsCards({ totalDeposits, paidDeposits, pendingDeposits, totalDepositAmount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Receipt className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total acomptes</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{totalDeposits}</p>
                <p className="text-xs text-slate-500">factures</p>
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
              <p className="text-sm font-medium text-slate-500">Acomptes payés</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{paidDeposits}</p>
                <p className="text-xs text-emerald-600">{Math.round((paidDeposits / totalDeposits) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-amber-50 p-3 rounded-md">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">En attente</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{pendingDeposits}</p>
                <p className="text-xs text-amber-600">{Math.round((pendingDeposits / totalDeposits) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <AlertTriangle className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Montant total</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{(totalDepositAmount / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">EUR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
