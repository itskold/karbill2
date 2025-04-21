import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Receipt, History } from "lucide-react"

export default function DepositInvoiceDetailLoading() {
  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled className="h-8 w-8 mr-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <Skeleton className="h-8 w-64 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b mb-8">
            <TabsTrigger
              value="details"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              disabled
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-[18px] w-[18px]" />
                Détails
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              disabled
            >
              <div className="flex items-center gap-2">
                <History className="h-[18px] w-[18px]" />
                Historique
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations client */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-36" />
                </CardFooter>
              </Card>

              {/* Détails de paiement */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-7 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Véhicule associé */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-40" />
                </CardFooter>
              </Card>

              {/* Détails de la facture */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="h-[1px] bg-slate-200 my-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description et notes */}
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-5 w-2/3" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
