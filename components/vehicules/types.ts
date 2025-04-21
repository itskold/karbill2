export type TVehicleStatus = "available" | "sold" | "reserved" | "maintenance";
export type TFuelType = "diesel" | "gasoline" | "electric" | "hybrid" | "other";
export type TTransmission = "manual" | "automatic";

export interface IVehicleEvent {
  id: string;
  date: Date;
  type:
    | "status_change"
    | "price_change"
    | "document_added"
    | "maintenance"
    | "other";
  title: string;
  description: string;
}

export interface IVehicle {
  id: string;
  userId: string;
  // Informations principales
  brand: string;
  model: string;
  variant?: string;
  chassisNumber?: string;
  year: number;
  firstCirculationDate: string;
  priceSale?: number;
  pricePurchase?: number;

  // Caractéristiques techniques
  fuelType: TFuelType;
  engineCapacity: number;
  transmission: TTransmission;
  mileage: number;
  power: number;
  poidsVide?: number;

  // Détails additionnels
  color?: string;
  doors?: number;
  seats?: number;
  status: TVehicleStatus;
  notes?: string;
  autoscoutId?: string;
  options?: string[];

  // Media
  photos: string[];

  // Événements et historique
  events?: IVehicleEvent[];

  // Horodatage
  createdAt: Date;
  updatedAt: Date;
}

// Options du véhicule par catégorie
export const vehicleOptionsCategories = {
  Équipement: [
    "4x4",
    "Airbag central",
    "Airbag conducteur",
    "Airbag genoux",
    "Airbag latéral",
    "Airbag passager",
    "Airbag rideau",
  ],
  "Assistance au stationnement": [
    "Caméra 360°",
    "Caméra d'aide au stationnement",
    "Caméra d'aide au stationnement arrière",
    "Système d'aide au stationnement automatique",
  ],
  Autres: [
    "Acoudoir",
    "Alarme",
    "Attache remorque",
    "Chauffage auxiliaire",
    "Chaufage sans huile",
    "Compatible E10",
    "Contrôle à bord",
    "Douze avec sioux caméléon",
    "Démarreur",
    "Équipement handicapé",
    "Filtre à particules",
    "Frein de stationnement électronique",
    "Jantes alliage",
    "Kit depannage",
    "Kit démarrage",
    "MP3",
    "Pack Sport",
    "Pare-brise",
    "Phares LED",
    "Phares Xénon",
    "Prises USB",
    "Suspension sport",
    "Système de contrôle de la pression des pneus",
    "Trappe à ski",
    "Verrouillage centralisé",
    "Vitres teintées",
  ],
  Climatisation: [
    "Climatisation",
    "Climatisation automatique",
    "Climatisation automatique 4 zones",
    "Climatisation automatique bi-zone",
  ],
  Confort: [
    "Accoudoir",
    "Chauffage auxiliaire",
    "Chauffage des sièges",
    "Chargeur sans fil",
    "Détecteur de pluie",
    "Fermeture centralisée",
    "Pare-brise chauffant",
    "Rétroviseur intérieur auto-dim",
    "Rétroviseurs télépliables électriques",
    "Siège chauffant",
    "Suspension pneumatique",
    "Toit ouvrant",
    "Toit panoramique",
    "Vitres surteintées",
    "Volant chauffant",
  ],
  "Divertissement / Médias": [
    "Bluetooth",
    "CD",
    "DAB/Digital Radio",
    "Détecteur de bord",
    "Écran multimédia",
    "Fonction TV",
    "Haut-parleurs de bord",
    "MP3",
    "Radio",
    "Système de navigation",
    "USB",
    "Volant multifonction",
    "Wi-Fi",
  ],
  "Régulateur de vitesse": [
    "Régulateur de vitesse",
    "Régulateur de vitesse adaptatif",
  ],
  Sièges: [
    "Sièges avant électriques",
    "Sièges chauffants",
    "Sièges sport",
    "Sièges ventilés",
  ],
  "Système d'assistance": [
    "Aide au démarrage en côte",
    "Aide au maintien de trajectoire",
    "Alerte de franchissement de ligne",
    "Assistance au démarrage en côte",
    "Assistance au freinage d'urgence",
    "Détecteur d'angle mort",
    "Détecteur des panneaux routiers",
    "Système d'avertissement de distance",
  ],
  Sécurité: [
    "ABS",
    "Alarme",
    "Anti-démarrage",
    "Anti-patinage",
    "ESP",
    "Système d'appel d'urgence",
    "Système de contrôle de la pression des pneus",
    "Système de détection de la fatigue",
  ],
};
