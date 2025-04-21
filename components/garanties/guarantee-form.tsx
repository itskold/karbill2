"use client"

import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IGuaranteeTemplate } from "@/components/garanties/types"

interface GuaranteeFormProps {
  guarantee: Partial<IGuaranteeTemplate>
  onGuaranteeChange: (guarantee: Partial<IGuaranteeTemplate>) => void
  onSubmit: () => void
  onCancel?: () => void
}

export function GuaranteeForm({ guarantee, onGuaranteeChange, onSubmit, onCancel }: GuaranteeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un modèle de garantie</CardTitle>
        <CardDescription>
          Définissez les détails du modèle de garantie qui pourra être appliqué aux véhicules.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la garantie*</Label>
              <Input
                id="name"
                placeholder="Ex: Garantie Standard"
                value={guarantee.name || ""}
                onChange={(e) => onGuaranteeChange({ ...guarantee, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de garantie*</Label>
              <Select
                value={guarantee.type || "standard"}
                onValueChange={(value) => onGuaranteeChange({ ...guarantee, type: value as any })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="extended">Étendue</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description courte de la garantie"
              value={guarantee.description || ""}
              onChange={(e) => onGuaranteeChange({ ...guarantee, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (en mois)*</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="12"
                value={guarantee.duration || ""}
                onChange={(e) =>
                  onGuaranteeChange({
                    ...guarantee,
                    duration: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicability">Applicabilité*</Label>
              <Select
                value={guarantee.applicability || "all"}
                onValueChange={(value) => onGuaranteeChange({ ...guarantee, applicability: value as any })}
              >
                <SelectTrigger id="applicability">
                  <SelectValue placeholder="Sélectionner l'applicabilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous véhicules</SelectItem>
                  <SelectItem value="new">Véhicules neufs uniquement</SelectItem>
                  <SelectItem value="used">Véhicules d'occasion uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions de la garantie</Label>
              <Textarea
                id="conditions"
                placeholder="Détaillez les conditions de la garantie..."
                className="min-h-[100px]"
                value={guarantee.conditions || ""}
                onChange={(e) => onGuaranteeChange({ ...guarantee, conditions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limitations">Limitations et exclusions</Label>
              <Textarea
                id="limitations"
                placeholder="Détaillez les limitations et exclusions de la garantie..."
                className="min-h-[100px]"
                value={guarantee.limitations || ""}
                onChange={(e) => onGuaranteeChange({ ...guarantee, limitations: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <RadioGroup
              value={guarantee.status || "draft"}
              onValueChange={(value) => onGuaranteeChange({ ...guarantee, status: value as any })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-600" /> Inactive
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" /> Brouillon
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button onClick={onSubmit} className="ml-auto">
          Créer le modèle de garantie
        </Button>
      </CardFooter>
    </Card>
  )
}
