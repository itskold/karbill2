import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-6 w-48" />
            <div className="mt-1 flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <span>•</span>
              <Skeleton className="h-4 w-20" />
              <span>•</span>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <Tabs defaultValue="details" className="flex-1">
        <div className="border-b px-4 md:px-8">
          <TabsList className="h-12">
            <TabsTrigger value="details" disabled className="data-[state=active]:bg-background">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </TabsTrigger>
            <TabsTrigger value="history" disabled className="data-[state=active]:bg-background">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-4 md:p-8">
          <TabsContent value="details" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Montants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="flex justify-between py-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between py-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between py-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Client</CardTitle>
                  <Skeleton className="h-8 w-28" />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Véhicule</CardTitle>
                  <Skeleton className="h-8 w-28" />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-medium">Description</th>
                          <th className="px-4 py-3 font-medium text-right">Quantité</th>
                          <th className="px-4 py-3 font-medium text-right">Prix unitaire</th>
                          <th className="px-4 py-3 font-medium text-right">TVA</th>
                          <th className="px-4 py-3 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3">
                                <Skeleton className="h-4 w-48" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Skeleton className="ml-auto h-4 w-8" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Skeleton className="ml-auto h-4 w-20" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Skeleton className="ml-auto h-4 w-12" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Skeleton className="ml-auto h-4 w-24" />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
