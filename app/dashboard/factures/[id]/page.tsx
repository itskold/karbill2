import type { Metadata } from "next"
import FactureDetailPageClient from "./FactureDetailPageClient"

export const metadata: Metadata = {
  title: "Détails Facture | Dashboard",
  description: "Détails de la facture",
}

export default function FactureDetailPage({ params }: { params: { id: string } }) {
  return <FactureDetailPageClient params={params} />
}
