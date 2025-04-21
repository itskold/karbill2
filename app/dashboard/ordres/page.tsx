import type { Metadata } from "next"
import OrdresPageClient from "./OrdresPageClient"

export const metadata: Metadata = {
  title: "Ordres de réparation | Karbill",
  description: "Gérez vos ordres de réparation et suivez leur progression",
}

export default function OrdresPage() {
  return <OrdresPageClient />
}
