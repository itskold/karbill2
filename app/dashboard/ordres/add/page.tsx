import type { Metadata } from "next"
import AddRepairOrderForm from "./add-repair-order-form"

export const metadata: Metadata = {
  title: "Ajouter un ordre de réparation",
  description: "Créer un nouvel ordre de réparation avec véhicule, réparations et pièces",
}

export default function AddRepairOrderPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Nouvel ordre de réparation</h2>
      </div>
      <AddRepairOrderForm />
    </div>
  )
}
