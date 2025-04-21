import type { Metadata } from "next"
import NewInvoiceClientPage from "./NewInvoiceClientPage"

export const metadata: Metadata = {
  title: "Nouvelle Facture",
  description: "Créer une nouvelle facture",
}

export default function NewInvoicePage() {
  return <NewInvoiceClientPage />
}
