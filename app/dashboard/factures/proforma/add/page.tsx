import type { Metadata } from "next"
import NewProformaInvoiceClientPage from "./NewProformaInvoiceClientPage"

export const metadata: Metadata = {
  title: "Nouvelle Facture Proforma",
  description: "Créer une nouvelle facture proforma",
}

export default function NewProformaInvoicePage() {
  return <NewProformaInvoiceClientPage />
}
