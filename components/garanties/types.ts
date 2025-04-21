export type TGuaranteeType = "standard" | "extended" | "premium" | "custom";
export type TGuaranteeStatus = "active" | "inactive" | "draft";
export type TGuaranteeApplicability = "all" | "new" | "used";

export interface IGuaranteeTemplate {
  id: string;
  name: string;
  description: string;
  type: TGuaranteeType;
  duration: number; // en mois
  applicability: TGuaranteeApplicability;
  conditions: string;
  limitations: string;
  status: TGuaranteeStatus;
  price: number; // Prix suggéré en euros
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuarantee {
  id: string;
  templateId: string;
  vehicleId?: string;
  clientId?: string;
  invoiceId?: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  price: number; // Prix appliqué en euros
  notes?: string;
  createdAt: Date;
}
