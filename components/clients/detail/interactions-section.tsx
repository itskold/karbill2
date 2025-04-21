"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getInteractionIcon } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"

interface InteractionsSectionProps {
  client: IClient
}

export function InteractionsSection({ client }: InteractionsSectionProps) {
  const interactions = client.interactions || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Historique des interactions</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Ajouter une interaction
          </Button>
        </div>
        <CardDescription>Historique des interactions avec le client</CardDescription>
      </CardHeader>
      <CardContent>
        {interactions.length > 0 ? (
          <div className="relative">
            {/* Ligne verticale pour la timeline */}
            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-slate-200" />

            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-4 relative">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center z-10">
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h4 className="font-medium text-slate-900">{interaction.title}</h4>
                      <p className="text-sm text-slate-500">
                        {format(interaction.date, "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <p className="text-slate-700 mb-2">{interaction.description}</p>
                    <p className="text-xs text-slate-500">Par: {interaction.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Aucune interaction</h3>
            <p className="text-slate-500 mt-1 max-w-md">Aucune interaction n'a été enregistrée pour ce client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
