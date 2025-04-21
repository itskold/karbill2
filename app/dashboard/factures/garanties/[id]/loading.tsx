import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GuaranteeDetailLoading() {
  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" disabled className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-80 mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-8">
        <Tabs defaultValue="details">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b mb-8">
            <TabsTrigger
              value="details"
              className="relative h-12 rounded-none border-b-2 border-primary px-4 pb-3 pt-2 font-medium text-foreground"
              disabled
            >
              Détails
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground"
              disabled
            >
              Historique
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Squelettes pour les cartes */}
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className={i === 5 ? "md:col-span-2" : ""}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j}>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
