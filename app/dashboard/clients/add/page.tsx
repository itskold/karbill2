"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  User,
  Building2,
  MapPin,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { clientService, type Client } from "@/components/clients/client.schema";
import { useAuth } from "@/hooks/use-auth";
import { TClientType } from "@/components/clients/types";

// Type pour le formulaire basé sur le schéma zod
type FormValues = z.infer<typeof clientSchema>;

// Interface locale (simplifié pour le formulaire)
interface IClientForm {
  id?: string;
  userId: string;
  // Type de client
  clientType: TClientType;

  // Informations personnelles (individu)
  firstName?: string;
  lastName?: string;

  // Informations entreprise
  companyName?: string;
  vatNumber?: string;
  companyNumber?: string;

  // Coordonnées
  email: string;
  phone?: string;
  mobile?: string;

  // Adresse
  address: string;
  addressComplement?: string;
  postalCode: string;
  city: string;
  country: string;

  // Préférences
  preferredContactMethod: "email" | "phone" | "mail";
  sendMarketingEmails: boolean;

  // Notes
  notes?: string;
}

// Validation schema
const clientSchema = z
  .object({
    clientType: z.enum(["particulier", "professionnel"]),

    // Informations personnelles/entreprise conditionnelles
    firstName: z
      .string()
      .min(1, "Le prénom est requis")
      .optional()
      .or(z.literal("")),
    lastName: z
      .string()
      .min(1, "Le nom est requis")
      .optional()
      .or(z.literal("")),
    companyName: z
      .string()
      .min(1, "Le nom de l'entreprise est requis")
      .optional()
      .or(z.literal("")),
    vatNumber: z.string().optional().or(z.literal("")),
    companyNumber: z.string().optional().or(z.literal("")),

    // Coordonnées
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
    phone: z.string().optional().or(z.literal("")),
    mobile: z.string().optional().or(z.literal("")),

    // Adresse
    address: z.string().min(1, "L'adresse est requise"),
    addressComplement: z.string().optional().or(z.literal("")),
    postalCode: z.string().min(1, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    country: z.string().min(1, "Le pays est requis"),

    // Préférences
    preferredContactMethod: z.enum(["email", "phone", "mail"]),
    sendMarketingEmails: z.boolean(),

    // Notes
    notes: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.clientType === "particulier") {
        return !!data.firstName && !!data.lastName;
      } else if (data.clientType === "professionnel") {
        return !!data.companyName;
      }
      return false;
    },
    {
      message:
        "Veuillez remplir les champs obligatoires selon le type de client",
      path: ["clientType"],
    }
  );

export default function NewClientPage() {
  const router = useRouter();
  // Ajouter ces lignes juste après la déclaration du router
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientType: "particulier",
      firstName: "",
      lastName: "",
      companyName: "",
      vatNumber: "",
      companyNumber: "",
      email: "",
      phone: "",
      mobile: "",
      address: "",
      addressComplement: "",
      postalCode: "",
      city: "",
      country: "Belgique",
      preferredContactMethod: "email",
      sendMarketingEmails: false,
      notes: "",
    },
  });

  // Watch client type to conditionally render fields
  const clientType = form.watch("clientType");
  // const sameBillingAddress = form.watch("sameBillingAddress")

  // Remplacer la fonction onSubmit par cette version qui utilise Firebase
  const onSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (!user?.uid) {
        throw new Error("Utilisateur non authentifié");
      }

      // Préparer les données du client selon le schéma attendu par Firebase
      const clientData: Omit<
        Client,
        "id" | "userId" | "createdAt" | "updatedAt"
      > = {
        nom: values.clientType === "particulier" ? values.lastName || "" : "",
        prenom:
          values.clientType === "particulier" ? values.firstName || "" : "",
        email: values.email,
        telephone: values.phone || values.mobile || "",
        adresse: values.address,
        codePostal: values.postalCode,
        ville: values.city,
        pays: values.country,
        entreprise:
          values.clientType === "professionnel" ? values.companyName || "" : "",
        siret:
          values.clientType === "professionnel"
            ? values.companyNumber || ""
            : "",
        tva:
          values.clientType === "professionnel" ? values.vatNumber || "" : "",
        notes: values.notes || "",
        type: values.clientType,
      };

      // Enregistrer le client dans Firebase
      const clientId = await clientService.createClient(user.uid, clientData);

      toast({
        title: "Client créé avec succès",
        description: "Le client a été ajouté à votre base de données.",
      });

      // Rediriger vers la liste des clients
      router.push("/dashboard/clients");
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du client.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Créer un nouveau client
          </h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau client à votre base de données.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/clients")}
        >
          Annuler
        </Button>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="info" className="w-full">
        <div className="mb-8 border-b">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Coordonnées
              </div>
            </TabsTrigger>
            {/* <TabsTrigger
              value="billing"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Facturation
              </div>
            </TabsTrigger> */}
            <TabsTrigger
              value="preferences"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Préférences
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <TabsContent value="info" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Type de client</CardTitle>
                  <CardDescription>
                    Sélectionnez le type de client que vous souhaitez créer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="particulier"
                                id="particulier"
                              />
                              <Label
                                htmlFor="particulier"
                                className="flex items-center gap-2"
                              >
                                <User className="h-4 w-4" /> Particulier
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="professionnel"
                                id="professionnel"
                              />
                              <Label
                                htmlFor="professionnel"
                                className="flex items-center gap-2"
                              >
                                <Building2 className="h-4 w-4" /> Entreprise
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {clientType === "particulier" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Entrez les informations du particulier.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom*</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom*</FormLabel>
                            <FormControl>
                              <Input placeholder="Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Date de naissance</Label>
                      <div className="relative">
                        <Input
                          id="birthDate"
                          type="date"
                          className="w-full pl-3"
                          min="1900-01-01"
                          max={format(new Date(), "yyyy-MM-dd")}
                          value={
                            birthDate ? format(birthDate, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : undefined;
                            setBirthDate(date);
                          }}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de l&apos;entreprise</CardTitle>
                    <CardDescription>
                      Entrez les informations de l&apos;entreprise.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l&apos;entreprise*</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de TVA</FormLabel>
                            <FormControl>
                              <Input placeholder="BE 0123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro d&apos;entreprise</FormLabel>
                            <FormControl>
                              <Input placeholder="BE 0123.456.789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Coordonnées</CardTitle>
                  <CardDescription>
                    Entrez les coordonnées du client.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="exemple@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone fixe</FormLabel>
                          <FormControl>
                            <Input placeholder="+32 2 123 45 67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="+32 470 12 34 56" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                  <CardDescription>
                    Entrez l&apos;adresse du client.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rue et numéro*</FormLabel>
                        <FormControl>
                          <Input placeholder="Rue de la Loi 16" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressComplement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complément d&apos;adresse</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Boîte 4, Étage 2, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal*</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville*</FormLabel>
                            <FormControl>
                              <Input placeholder="Bruxelles" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un pays" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Belgique">Belgique</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Luxembourg">
                              Luxembourg
                            </SelectItem>
                            <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                            <SelectItem value="Allemagne">Allemagne</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="billing" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adresse de facturation</CardTitle>
                  <CardDescription>Définissez l&apos;adresse de facturation du client.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sameBillingAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Utiliser la même adresse que l&apos;adresse principale</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Cochez cette case si l&apos;adresse de facturation est identique à l&apos;adresse
                            principale.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!sameBillingAddress && (
                    <div className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="billingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rue et numéro*</FormLabel>
                            <FormControl>
                              <Input placeholder="Rue de la Loi 16" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingAddressComplement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complément d&apos;adresse</FormLabel>
                            <FormControl>
                              <Input placeholder="Boîte 4, Étage 2, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="billingPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code postal*</FormLabel>
                              <FormControl>
                                <Input placeholder="1000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="billingCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ville*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bruxelles" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="billingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un pays" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Belgique">Belgique</SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                                <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                                <SelectItem value="Allemagne">Allemagne</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent> */}

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de contact</CardTitle>
                  <CardDescription>
                    Définissez les préférences de contact du client.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferredContactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de contact préférée*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une méthode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                              </div>
                            </SelectItem>
                            <SelectItem value="phone">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Téléphone
                              </div>
                            </SelectItem>
                            <SelectItem value="mail">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Courrier postal
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendMarketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Envoyer des emails marketing</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Le client accepte de recevoir des emails marketing
                            et promotionnels.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Ajoutez des notes ou remarques concernant ce client.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes et remarques sur le client..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/dashboard/clients")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer le client"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
