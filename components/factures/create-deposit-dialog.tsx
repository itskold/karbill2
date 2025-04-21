"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, User, Receipt, Percent, EuroIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IDepositInvoice } from "@/components/factures/types";

// Données fictives pour les clients et factures
const mockClients = [
  {
    id: "c1",
    name: "Dupont Jean",
    email: "jean.dupont@example.com",
    phone: "0612345678",
  },
  {
    id: "c2",
    name: "Martin Sophie",
    email: "sophie.martin@example.com",
    phone: "0623456789",
  },
  {
    id: "c3",
    name: "Bernard Thomas",
    email: "thomas.bernard@example.com",
    phone: "0634567890",
  },
  {
    id: "c4",
    name: "Petit Laura",
    email: "laura.petit@example.com",
    phone: "0645678901",
  },
  {
    id: "c5",
    name: "Durand Michel",
    email: "michel.durand@example.com",
    phone: "0656789012",
  },
];

const mockInvoices = [
  {
    id: "inv1",
    number: "FAC-2024-0001",
    client: "Dupont Jean",
    amount: 5000,
    date: "2024-03-15",
  },
  {
    id: "inv2",
    number: "FAC-2024-0002",
    client: "Martin Sophie",
    amount: 7500,
    date: "2024-03-20",
  },
  {
    id: "inv3",
    number: "FAC-2024-0003",
    client: "Bernard Thomas",
    amount: 3200,
    date: "2024-03-25",
  },
  {
    id: "inv4",
    number: "FAC-2024-0004",
    client: "Petit Laura",
    amount: 9800,
    date: "2024-04-01",
  },
  {
    id: "inv5",
    number: "FAC-2024-0005",
    client: "Durand Michel",
    amount: 4500,
    date: "2024-04-05",
  },
];

// Ajouter des données fictives pour les véhicules
const mockVehicles = [
  {
    id: "v1",
    make: "Peugeot",
    model: "308",
    year: 2022,
    price: 25000,
    vin: "VF3LBHZTXLS123456",
  },
  {
    id: "v2",
    make: "Renault",
    model: "Clio",
    year: 2021,
    price: 18500,
    vin: "VF15RPNJ5MT789012",
  },
  {
    id: "v3",
    make: "Citroën",
    model: "C3",
    year: 2023,
    price: 19800,
    vin: "VF7SXHMZ3LT345678",
  },
  {
    id: "v4",
    make: "Volkswagen",
    model: "Golf",
    year: 2022,
    price: 28500,
    vin: "WVWZZZAUZNW901234",
  },
  {
    id: "v5",
    make: "BMW",
    model: "Série 3",
    year: 2021,
    price: 42000,
    vin: "WBA5E51070G567890",
  },
];

interface CreateDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (deposit: Partial<IDepositInvoice>) => void;
}

export function CreateDepositDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateDepositDialogProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [depositType, setDepositType] = useState<"standalone" | "linked">(
    "standalone"
  );
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [vehiclePrice, setVehiclePrice] = useState<number>(0);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ); // +30 jours
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositPercentage, setDepositPercentage] = useState<number>(0);
  const [amountType, setAmountType] = useState<"fixed" | "percentage">("fixed");
  const [notes, setNotes] = useState<string>("");
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0);

  // Mettre à jour le montant ou le pourcentage en fonction de la sélection
  useEffect(() => {
    if (depositType === "linked" && selectedInvoice) {
      const invoice = mockInvoices.find((inv) => inv.id === selectedInvoice);
      if (invoice) {
        setInvoiceTotal(invoice.amount);

        if (amountType === "percentage") {
          // Mettre à jour le montant basé sur le pourcentage
          setDepositAmount((invoice.amount * depositPercentage) / 100);
        } else {
          // Mettre à jour le pourcentage basé sur le montant
          setDepositPercentage(
            depositAmount > 0 ? (depositAmount / invoice.amount) * 100 : 0
          );
        }
      }
    }
  }, [
    selectedInvoice,
    depositType,
    amountType,
    depositAmount,
    depositPercentage,
  ]);

  // Mettre à jour le prix du véhicule lorsqu'un véhicule est sélectionné
  useEffect(() => {
    if (selectedVehicle) {
      const vehicle = mockVehicles.find((v) => v.id === selectedVehicle);
      if (vehicle) {
        setVehiclePrice(vehicle.price);

        if (amountType === "percentage") {
          // Mettre à jour le montant basé sur le pourcentage
          setDepositAmount((vehicle.price * depositPercentage) / 100);
        } else {
          // Mettre à jour le pourcentage basé sur le montant
          setDepositPercentage(
            depositAmount > 0 ? (depositAmount / vehicle.price) * 100 : 0
          );
        }
      }
    }
  }, [selectedVehicle, amountType, depositAmount, depositPercentage]);

  // Mettre à jour le montant lorsque le pourcentage change
  const handlePercentageChange = (value: number) => {
    setDepositPercentage(value);
    if (depositType === "linked" && invoiceTotal > 0) {
      setDepositAmount((invoiceTotal * value) / 100);
    } else if (selectedVehicle && vehiclePrice > 0) {
      setDepositAmount((vehiclePrice * value) / 100);
    }
  };

  // Mettre à jour le pourcentage lorsque le montant change
  const handleAmountChange = (value: number) => {
    setDepositAmount(value);
    if (depositType === "linked" && invoiceTotal > 0) {
      setDepositPercentage((value / invoiceTotal) * 100);
    } else if (selectedVehicle && vehiclePrice > 0) {
      setDepositPercentage((value / vehiclePrice) * 100);
    }
  };

  const handleSubmit = () => {
    const newDeposit: Partial<IDepositInvoice> = {
      type: "deposit",
      clientId: selectedClient,
      vehicleId: selectedVehicle || undefined,
      issueDate,
      dueDate,
      depositAmount,
      depositPercentage:
        amountType === "percentage" ? depositPercentage : undefined,
      status: "draft",
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (depositType === "linked" && selectedInvoice) {
      newDeposit.mainInvoiceId = selectedInvoice;
    }

    onSubmit(newDeposit);

    // Réinitialiser le formulaire
    setDepositType("standalone");
    setSelectedClient("");
    setSelectedVehicle("");
    setSelectedInvoice("");
    setIssueDate(new Date());
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setDepositAmount(0);
    setDepositPercentage(0);
    setAmountType("fixed");
    setNotes("");
    setInvoiceTotal(0);
    setVehiclePrice(0);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer une facture d'acompte</DialogTitle>
          <DialogDescription>
            Créez une facture d'acompte indépendante ou liée à une facture
            existante.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-8">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="general"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Informations générales
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Montant et paiement
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type de facture d'acompte</Label>
                <RadioGroup
                  value={depositType}
                  onValueChange={(value) =>
                    setDepositType(value as "standalone" | "linked")
                  }
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standalone" id="standalone" />
                    <Label
                      htmlFor="standalone"
                      className="flex items-center gap-2"
                    >
                      <Receipt className="h-4 w-4 text-slate-600" /> Acompte
                      indépendant
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="linked" id="linked" />
                    <Label htmlFor="linked" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-slate-600" /> Acompte lié
                      à une facture
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-slate-500 mt-1">
                  {depositType === "standalone"
                    ? "Créez un acompte indépendant qui n'est pas lié à une facture existante."
                    : "Liez cet acompte à une facture existante pour le déduire du montant total."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client*</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-slate-500" />
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Véhicule (optionnel)</Label>
                <Select
                  value={selectedVehicle}
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger id="vehicle" className="w-full">
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center">
                          <span className="mr-2 h-4 w-4 text-slate-500">
                            🚗
                          </span>
                          <span>
                            {vehicle.make} {vehicle.model} ({vehicle.year}) -{" "}
                            {vehicle.price.toLocaleString()} €
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVehicle && (
                  <p className="text-xs text-slate-500 mt-1">
                    Prix de vente: {vehiclePrice.toLocaleString()} €
                  </p>
                )}
              </div>

              {depositType === "linked" && (
                <div className="space-y-2">
                  <Label htmlFor="invoice">Facture liée*</Label>
                  <Select
                    value={selectedInvoice}
                    onValueChange={setSelectedInvoice}
                  >
                    <SelectTrigger id="invoice" className="w-full">
                      <SelectValue placeholder="Sélectionner une facture" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          <div className="flex items-center">
                            <Receipt className="mr-2 h-4 w-4 text-slate-500" />
                            <span>
                              {invoice.number} - {invoice.client} (
                              {invoice.amount.toLocaleString()} €)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Date d'émission*</Label>
                  <div className="relative">
                    <Input
                      id="issueDate"
                      type="date"
                      className="w-full pl-3"
                      value={issueDate ? format(issueDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        date && setIssueDate(date);
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance*</Label>
                  <div className="relative">
                    <Input
                      id="dueDate"
                      type="date"
                      className="w-full pl-3"
                      value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        date && setDueDate(date);
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-2">
              <Label>Type de montant</Label>
              <RadioGroup
                value={amountType}
                onValueChange={(value) =>
                  setAmountType(value as "fixed" | "percentage")
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="flex items-center gap-2">
                    <EuroIcon className="h-4 w-4 text-slate-600" /> Montant fixe
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label
                    htmlFor="percentage"
                    className="flex items-center gap-2"
                  >
                    <Percent className="h-4 w-4 text-slate-600" /> Pourcentage
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {amountType === "fixed" ? (
              <div className="space-y-2">
                <Label htmlFor="amount">Montant de l'acompte (€)*</Label>
                <div className="relative">
                  <EuroIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={depositAmount || ""}
                    onChange={(e) =>
                      handleAmountChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                {depositType === "linked" && invoiceTotal > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">
                    Représente {depositPercentage.toFixed(2)}% du montant total
                    de la facture ({invoiceTotal.toLocaleString()} €)
                  </p>
                ) : selectedVehicle && vehiclePrice > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">
                    Représente {depositPercentage.toFixed(2)}% du prix du
                    véhicule ({vehiclePrice.toLocaleString()} €)
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentage">Pourcentage (%)*</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={depositPercentage || ""}
                    onChange={(e) =>
                      handlePercentageChange(
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                {depositType === "linked" && invoiceTotal > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">
                    Représente {depositAmount.toLocaleString()} € du montant
                    total de la facture ({invoiceTotal.toLocaleString()} €)
                  </p>
                ) : selectedVehicle && vehiclePrice > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">
                    Représente {depositAmount.toLocaleString()} € du prix du
                    véhicule ({vehiclePrice.toLocaleString()} €)
                  </p>
                ) : null}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou commentaires sur cette facture d'acompte..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedClient ||
              depositAmount <= 0 ||
              (depositType === "linked" && !selectedInvoice)
            }
          >
            Créer la facture d'acompte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
