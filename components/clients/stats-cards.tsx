import { Users, User, Building2, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalClients: number
  individualClients: number
  companyClients: number
  totalPurchases: number
}

export function StatsCards({ totalClients, individualClients, companyClients, totalPurchases }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Users className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total clients</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{totalClients}</p>
                <p className="text-xs text-slate-500">clients</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-blue-50 p-3 rounded-md">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Particuliers</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{individualClients}</p>
                <p className="text-xs text-blue-600">{Math.round((individualClients / totalClients) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-emerald-50 p-3 rounded-md">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Entreprises</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{companyClients}</p>
                <p className="text-xs text-emerald-600">{Math.round((companyClients / totalClients) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="mr-4 bg-slate-100 p-3 rounded-md">
              <Check className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total achats</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900 mr-2">{totalPurchases}</p>
                <p className="text-xs text-slate-500">transactions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
