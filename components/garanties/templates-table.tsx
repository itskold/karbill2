import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Copy,
  Edit,
  MoreHorizontal,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getGuaranteeTypeBadge,
  getApplicabilityBadge,
  getGuaranteeStatusBadge,
} from "@/components/garanties/utils";
import type { IGuaranteeTemplate } from "@/components/garanties/types";

interface TemplatesTableProps {
  templates: IGuaranteeTemplate[];
}

export function TemplatesTable({ templates = [] }: TemplatesTableProps) {
  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-lg">
        <Shield className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">
          Aucun modèle de garantie trouvé
        </h3>
        <p className="text-slate-500 mt-1 max-w-md">
          Aucun modèle de garantie ne correspond à vos critères de recherche.
          Veuillez modifier vos filtres ou créer un nouveau modèle.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-slate-100/80">
            <TableHead className="font-medium text-slate-700">Nom</TableHead>
            <TableHead className="font-medium text-slate-700">Type</TableHead>
            <TableHead className="font-medium text-slate-700">Durée</TableHead>
            <TableHead className="font-medium text-slate-700">Prix</TableHead>
            <TableHead className="font-medium text-slate-700">
              Applicabilité
            </TableHead>
            <TableHead className="font-medium text-slate-700">Statut</TableHead>
            <TableHead className="font-medium text-slate-700">
              Créée le
            </TableHead>
            <TableHead className="text-right font-medium text-slate-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id} className="hover:bg-slate-50">
              <TableCell>
                <div className="font-medium text-slate-900">
                  {template.name}
                </div>
                <div className="text-sm text-slate-500">
                  {template.description}
                </div>
              </TableCell>
              <TableCell>{getGuaranteeTypeBadge(template.type)}</TableCell>
              <TableCell>
                {template.duration} {template.duration > 1 ? "mois" : "mois"}
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                {template.price} €
              </TableCell>
              <TableCell>
                {getApplicabilityBadge(template.applicability)}
              </TableCell>
              <TableCell>{getGuaranteeStatusBadge(template.status)}</TableCell>
              <TableCell className="text-slate-700">
                {format(template.createdAt, "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-700"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" /> Dupliquer
                      </DropdownMenuItem>
                      {template.status === "active" ? (
                        <DropdownMenuItem>
                          <AlertCircle className="mr-2 h-4 w-4" /> Désactiver
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Activer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
