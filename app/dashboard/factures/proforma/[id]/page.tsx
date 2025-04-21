import type { Metadata } from "next"
import ProformaDetailPageClient from "./ProformaDetailPageClient"

export const metadata: Metadata = {
  title: "Détails Facture Proforma | Dashboard",
  description: "Détails de la facture proforma",
}

export default function ProformaDetailPage({ params }: { params: { id: string } }) {
  return <ProformaDetailPageClient params={params} />
}
