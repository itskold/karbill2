"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Clock, EuroIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IGuaranteeTemplate } from "@/components/garanties/types"

interface CreateGuaranteeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guarantee: Partial<IGuaranteeTemplate>
  onGuaranteeChange: (guarantee: Partial<IGuaranteeTemplate>) => void
  onSubmit: () => void
}

export function CreateGuaranteeDialog({
  open,
  onOpenChange,
  guarantee,
  onGuaranteeChange,
  onSubmit,
}: CreateGuaranteeDialogProps) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer un modèle de garantie</DialogTitle>
          <DialogDescription>
            Définissez les détails du modèle de garantie qui pourra être appliqué aux véhicules.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-6">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="general"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Informations générales
              </TabsTrigger>
              <TabsTrigger
                value="conditions"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Conditions
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Paramètres
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      duration: Number.parseInt(e.target.value) || guarantee.duration,
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

              <div className="space-y-2">
                <Label htmlFor="price">Prix suggéré (€)*</Label>
                <div className="relative">
                  <EuroIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={guarantee.price || ""}
                    onChange={(e) =>
                      onGuaranteeChange({
                        ...guarantee,
                        price: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions de la garantie</Label>
              <Textarea
                id="conditions"
                placeholder="Détaillez les conditions de la garantie..."
                className="min-h-[150px]"
                value={guarantee.conditions || ""}
                onChange={(e) => onGuaranteeChange({ ...guarantee, conditions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limitations">Limitations et exclusions</Label>
              <Textarea
                id="limitations"
                placeholder="Détaillez les limitations et exclusions de la garantie..."
                className="min-h-[150px]"
                value={guarantee.limitations || ""}
                onChange={(e) => onGuaranteeChange({ ...guarantee, limitations: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <RadioGroup
                value={guarantee.status || "draft"}
                onValueChange={(value) => onGuaranteeChange({ ...guarantee, status: value as any })}
                className="flex flex-col space-y-1"
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
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSubmit}>Créer la garantie</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
