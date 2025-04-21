"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Eye, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDocumentIcon } from "@/components/clients/utils"
import type { IClient } from "@/components/clients/types"

interface DocumentsSectionProps {
  client: IClient
}

export function DocumentsSection({ client }: DocumentsSectionProps) {
  const documents = client.documents || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Documents</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un document
          </Button>
        </div>
        <CardDescription>Documents associés au client</CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-slate-100 p-2 rounded-md">{getDocumentIcon(document.type)}</div>
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{document.title}</h4>
                      <p className="text-xs text-slate-500">{format(document.date, "dd/MM/yyyy", { locale: fr })}</p>
                    </div>
                  </div>
                  {document.description && <p className="text-sm text-slate-700 mb-3">{document.description}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="text-slate-700" asChild>
                      <a href={document.fileUrl || "#"} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-1 h-3 w-3" /> Voir
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-700">
                      <Download className="mr-1 h-3 w-3" /> Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Aucun document</h3>
            <p className="text-slate-500 mt-1 max-w-md">Aucun document n'a été ajouté pour ce client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
