"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  Calendar,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { invoiceService } from "@/components/factures/invoice.schema"
import { vehiculeService } from "@/components/vehicules/vehicule.schema"
import { clientService } from "@/components/clients/client.schema"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    marginRate: 0,
    pendingInvoices: 0,
    revenueChange: 0,
    profitChange: 0,
    marginChange: 0,
    pendingChange: 0,
  })

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        // Récupérer les factures
        const invoices = await invoiceService.getInvoices(user.uid)

        // Récupérer les véhicules
        const vehicles = await vehiculeService.getVehicules(user.uid)

        // Récupérer les clients
        const clients = await clientService.getClients(user.uid)

        // Calculer les statistiques
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0)
        const totalProfit = invoices.reduce((sum, invoice) => sum + (invoice.totalHT - (invoice.montantPaye || 0)), 0)
        const marginRate = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
        const pendingInvoices = invoices
          .filter((invoice) => invoice.statut === "envoyée" || invoice.statut === "partiellement_payée")
          .reduce((sum, invoice) => sum + invoice.totalTTC, 0)

        // Mettre à jour les statistiques
        setStats({
          totalRevenue,
          totalProfit,
          marginRate,
          pendingInvoices,
          revenueChange: 12.5, // Valeurs fictives pour l'exemple
          profitChange: 8.2,
          marginChange: 1.8,
          pendingChange: -3.2,
        })
      } catch (err) {
        console.error("Erreur lors de la récupération des données du tableau de bord:", err)
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchDashboardData()
    }
  }, [user, authLoading, period])

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Non autorisé</AlertTitle>
          <AlertDescription>Vous devez être connecté pour accéder à cette page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Données pour les graphiques (à remplacer par des données réelles)
  const revenueData = [
    { mois: "Jan", ventes: 12500, benefices: 4200, acomptes: 3800 },
    { mois: "Fév", ventes: 15000, benefices: 5100, acomptes: 4200 },
    { mois: "Mar", ventes: 18200, benefices: 6300, acomptes: 5100 },
    { mois: "Avr", ventes: 16800, benefices: 5800, acomptes: 4700 },
    { mois: "Mai", ventes: 21000, benefices: 7200, acomptes: 6300 },
    { mois: "Juin", ventes: 19500, benefices: 6700, acomptes: 5800 },
    { mois: "Juil", ventes: 22800, benefices: 7900, acomptes: 6800 },
    { mois: "Août", ventes: 20500, benefices: 7100, acomptes: 6100 },
    { mois: "Sep", ventes: 23500, benefices: 8200, acomptes: 7000 },
    { mois: "Oct", ventes: 25800, benefices: 9000, acomptes: 7700 },
    { mois: "Nov", ventes: 27200, benefices: 9500, acomptes: 8200 },
    { mois: "Déc", ventes: 29500, benefices: 10300, acomptes: 8900 },
  ]

  const clientsData = [
    { mois: "Jan", nouveaux: 15, recurrents: 42 },
    { mois: "Fév", nouveaux: 18, recurrents: 45 },
    { mois: "Mar", nouveaux: 22, recurrents: 48 },
    { mois: "Avr", nouveaux: 19, recurrents: 50 },
    { mois: "Mai", nouveaux: 25, recurrents: 53 },
    { mois: "Juin", nouveaux: 23, recurrents: 55 },
    { mois: "Juil", nouveaux: 28, recurrents: 58 },
    { mois: "Août", nouveaux: 24, recurrents: 60 },
    { mois: "Sep", nouveaux: 30, recurrents: 63 },
    { mois: "Oct", nouveaux: 32, recurrents: 65 },
    { mois: "Nov", nouveaux: 35, recurrents: 68 },
    { mois: "Déc", nouveaux: 38, recurrents: 70 },
  ]

  const vehiculesData = [
    { type: "Berline", valeur: 35 },
    { type: "SUV", valeur: 25 },
    { type: "Citadine", valeur: 20 },
    { type: "Utilitaire", valeur: 15 },
    { type: "Autre", valeur: 5 },
  ]

  const facturesData = [
    { status: "Payées", valeur: 65 },
    { status: "En attente", valeur: 20 },
    { status: "En retard", valeur: 10 },
    { status: "Annulées", valeur: 5 },
  ]

  const STATUS_COLORS = {
    Payées: "#10b981",
    "En attente": "#f59e0b",
    "En retard": "#ef4444",
    Annulées: "#6b7280",
  }

  const VEHICLE_COLORS = {
    Berline: "#3b82f6",
    SUV: "#8b5cf6",
    Citadine: "#ec4899",
    Utilitaire: "#f97316",
    Autre: "#6b7280",
  }

  const recentTransactions = [
    { id: 1, client: "Dupont Jean", montant: 1250, date: "2024-04-10", status: "Payée" },
    { id: 2, client: "Martin Sophie", montant: 2340, date: "2024-04-09", status: "En attente" },
    { id: 3, client: "Dubois Pierre", montant: 890, date: "2024-04-08", status: "Payée" },
    { id: 4, client: "Leroy Emma", montant: 1780, date: "2024-04-07", status: "Payée" },
    { id: 5, client: "Moreau Thomas", montant: 3200, date: "2024-04-06", status: "En retard" },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Tabs defaultValue="month" className="w-full md:w-auto mt-4 md:mt-0" onValueChange={setPeriod}>
          <div className="mb-2 border-b">
            <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="week"
                className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Semaine
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Mois
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Année
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center pt-1 text-xs text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>
                    +{stats.revenueChange}% par rapport à{" "}
                    {period === "week"
                      ? "la semaine dernière"
                      : period === "month"
                        ? "au mois dernier"
                        : "à l'année dernière"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats.totalProfit.toLocaleString()}</div>
                <div className="flex items-center pt-1 text-xs text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>
                    +{stats.profitChange}% par rapport à{" "}
                    {period === "week"
                      ? "la semaine dernière"
                      : period === "month"
                        ? "au mois dernier"
                        : "à l'année dernière"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taux de marge</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.marginRate.toFixed(1)}%</div>
                <div className="flex items-center pt-1 text-xs text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>
                    +{stats.marginChange}% par rapport à{" "}
                    {period === "week"
                      ? "la semaine dernière"
                      : period === "month"
                        ? "au mois dernier"
                        : "à l'année dernière"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats.pendingInvoices.toLocaleString()}</div>
                <div className="flex items-center pt-1 text-xs text-amber-500">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  <span>
                    {stats.pendingChange}% par rapport à{" "}
                    {period === "week"
                      ? "la semaine dernière"
                      : period === "month"
                        ? "au mois dernier"
                        : "à l'année dernière"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques principaux */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Évolution des ventes et bénéfices</CardTitle>
                <CardDescription>Analyse comparative des ventes et bénéfices sur l'année</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Bar dataKey="ventes" name="Ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="benefices" name="Bénéfices" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Statut des factures</CardTitle>
                <CardDescription>Répartition des factures par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={facturesData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="status" width={80} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Bar dataKey="valeur" name="Pourcentage" radius={[0, 4, 4, 0]}>
                        {facturesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques secondaires */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Évolution des clients</CardTitle>
                <CardDescription>Nouveaux clients vs clients récurrents</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={clientsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="nouveaux"
                        name="Nouveaux clients"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="recurrents"
                        name="Clients récurrents"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Transactions récentes</CardTitle>
                <CardDescription>Les dernières transactions effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.client}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">€{transaction.montant.toLocaleString()}</p>
                          <p
                            className={`text-xs ${
                              transaction.status === "Payée"
                                ? "text-emerald-500"
                                : transaction.status === "En attente"
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          >
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <a href="/dashboard/factures" className="text-sm text-blue-600 hover:underline">
                  Voir toutes les transactions
                </a>
              </CardFooter>
            </Card>
          </div>

          {/* Dernière ligne de graphiques */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Types de véhicules</CardTitle>
                <CardDescription>Répartition des ventes par type de véhicule</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vehiculesData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="type" width={80} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Bar dataKey="valeur" name="Pourcentage" radius={[0, 4, 4, 0]}>
                        {vehiculesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={VEHICLE_COLORS[entry.type as keyof typeof VEHICLE_COLORS]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Acomptes vs Ventes</CardTitle>
                <CardDescription>Comparaison des acomptes et des ventes totales</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ventes"
                        name="Ventes totales"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="acomptes"
                        name="Acomptes"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
