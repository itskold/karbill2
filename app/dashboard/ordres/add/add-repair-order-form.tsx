"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Wrench,
  Package,
  Car,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Schéma pour une pièce
const partSchema = z.object({
  name: z.string().min(1, "Le nom de la pièce est requis"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Le prix doit être un nombre positif",
  }),
  supplier: z.string().optional(),
  quantity: z
    .string()
    .refine(
      (val) =>
        !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)),
      {
        message: "La quantité doit être un nombre entier positif",
      }
    ),
});

// Schéma pour une réparation
const repairSchema = z.object({
  description: z.string().min(1, "La description de la réparation est requise"),
  estimatedHours: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le temps estimé doit être un nombre positif",
    }),
  technicianNotes: z.string().optional(),
  technicianId: z.string().optional(),
});

// Schéma pour le formulaire complet
const formSchema = z.object({
  vehicleId: z.string().min(1, "Veuillez sélectionner un véhicule"),
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  orderDate: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  estimatedCompletionDate: z.date({
    required_error: "Veuillez sélectionner une date estimée de fin",
  }),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"], {
    required_error: "Veuillez sélectionner un statut",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Veuillez sélectionner une priorité",
  }),
  customerComplaints: z.string().optional(),
  repairs: z.array(repairSchema).min(1, "Au moins une réparation est requise"),
  parts: z.array(partSchema),
  laborCost: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Le coût de main d'œuvre doit être un nombre positif",
    }),
  notes: z.string().optional(),
  assignedTechnicianId: z.string().optional(),
});

// Type pour le formulaire
type FormValues = z.infer<typeof formSchema>;

// Données fictives pour les véhicules et clients
const mockVehicles = [
  { id: "v1", name: "Audi A4 - 1ABC123" },
  { id: "v2", name: "BMW 320i - 2DEF456" },
  { id: "v3", name: "Mercedes C200 - 3GHI789" },
];

const mockClients = [
  { id: "c1", name: "Jean Dupont" },
  { id: "c2", name: "Marie Martin" },
  { id: "c3", name: "Pierre Durand" },
];

// Données fictives pour les techniciens
const mockTechnicians = [
  {
    id: "emp-001",
    name: "Michel Dupont",
    specialization: "Mécanique générale",
  },
  {
    id: "emp-003",
    name: "Jean Lefebvre",
    specialization: "Électronique automobile",
  },
  { id: "emp-004", name: "Marie Dubois", specialization: "Chef d'atelier" },
];

export default function AddRepairOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valeurs par défaut du formulaire
  const defaultValues: Partial<FormValues> = {
    orderDate: new Date(),
    estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    status: "pending",
    priority: "medium",
    repairs: [
      {
        description: "",
        estimatedHours: "1",
        technicianNotes: "",
        technicianId: "",
      },
    ],
    parts: [],
    laborCost: "0",
    assignedTechnicianId: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Fonction pour ajouter une réparation
  const addRepair = () => {
    const currentRepairs = form.getValues("repairs") || [];
    form.setValue("repairs", [
      ...currentRepairs,
      {
        description: "",
        estimatedHours: "1",
        technicianNotes: "",
        technicianId: "",
      },
    ]);
  };

  // Fonction pour supprimer une réparation
  const removeRepair = (index: number) => {
    const currentRepairs = form.getValues("repairs");
    if (currentRepairs.length > 1) {
      form.setValue(
        "repairs",
        currentRepairs.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Erreur",
        description: "Au moins une réparation est requise",
        variant: "destructive",
      });
    }
  };

  // Fonction pour ajouter une pièce
  const addPart = () => {
    const currentParts = form.getValues("parts") || [];
    form.setValue("parts", [
      ...currentParts,
      { name: "", description: "", price: "0", supplier: "", quantity: "1" },
    ]);
  };

  // Fonction pour supprimer une pièce
  const removePart = (index: number) => {
    const currentParts = form.getValues("parts");
    form.setValue(
      "parts",
      currentParts.filter((_, i) => i !== index)
    );
  };

  // Fonction pour calculer le total
  const calculateTotal = () => {
    const parts = form.getValues("parts") || [];
    const laborCost = form.getValues("laborCost") || "0";

    const partsTotal = parts.reduce((sum, part) => {
      return sum + Number(part.price) * Number(part.quantity || 1);
    }, 0);

    return (Number(laborCost) + partsTotal).toFixed(2);
  };

  // Soumission du formulaire
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      // Ici, vous feriez normalement un appel API pour enregistrer l'ordre de réparation
      console.log("Données soumises:", data);

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Ordre de réparation créé",
        description: "L'ordre de réparation a été créé avec succès",
      });

      // Rediriger vers la liste des ordres
      router.push("/dashboard/ordres");
    } catch (error) {
      console.error("Erreur lors de la création de l'ordre:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la création de l'ordre de réparation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Informations de base sur l'ordre de réparation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection du véhicule */}
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un véhicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélection du client */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date de l'ordre */}
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de l'ordre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="w-full pl-3"
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : undefined;
                            field.onChange(date);
                          }}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date estimée de fin */}
              <FormField
                control={form.control}
                name="estimatedCompletionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date estimée de fin</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="w-full pl-3"
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : undefined;
                            field.onChange(date);
                          }}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statut */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priorité */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Technicien assigné */}
              <FormField
                control={form.control}
                name="assignedTechnicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technicien assigné</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un technicien" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockTechnicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name} - {tech.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le technicien principal responsable de cet ordre
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plaintes du client */}
              <FormField
                control={form.control}
                name="customerComplaints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plaintes du client</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez les plaintes ou problèmes signalés par le client"
                        className="resize-none"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Coûts et notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Coûts et notes
              </CardTitle>
              <CardDescription>
                Informations sur les coûts et notes supplémentaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coût de main d'œuvre */}
              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coût de main d'œuvre (€)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Coût total de la main d'œuvre pour toutes les réparations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes générales */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes générales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes supplémentaires sur l'ordre de réparation"
                        className="resize-none"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total calculé */}
              <div className="mt-6 rounded-md border p-4">
                <div className="text-sm font-medium">Résumé des coûts</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Main d'œuvre:</span>
                    <span>
                      {Number(form.watch("laborCost") || 0).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pièces:</span>
                    <span>
                      {form
                        .watch("parts")
                        ?.reduce(
                          (sum, part) =>
                            sum +
                            Number(part.price || 0) *
                              Number(part.quantity || 1),
                          0
                        )
                        .toFixed(2)}{" "}
                      €
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{calculateTotal()} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Réparations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Réparations à effectuer
              </CardTitle>
              <CardDescription>
                Liste des réparations à effectuer sur le véhicule
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addRepair}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une réparation
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.watch("repairs")?.map((_, index) => (
              <div key={index} className="rounded-md border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Réparation {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeRepair(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`repairs.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Description de la réparation"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`repairs.${index}.estimatedHours`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps estimé (heures)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`repairs.${index}.technicianId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technicien assigné</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un technicien" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Non assigné
                            </SelectItem>
                            {mockTechnicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`repairs.${index}.technicianNotes`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes du technicien</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes techniques sur la réparation"
                            className="resize-none"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pièces */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pièces nécessaires
              </CardTitle>
              <CardDescription>
                Liste des pièces nécessaires pour les réparations
              </CardDescription>
            </div>
            <Button type="button" onClick={addPart} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une pièce
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.watch("parts")?.length === 0 && (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  Aucune pièce ajoutée. Cliquez sur "Ajouter une pièce" pour
                  commencer.
                </p>
              </div>
            )}
            {form.watch("parts")?.map((_, index) => (
              <div key={index} className="rounded-md border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Pièce {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removePart(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`parts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de la pièce" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description de la pièce"
                            className="resize-none"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.supplier`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fournisseur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du fournisseur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parts.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
