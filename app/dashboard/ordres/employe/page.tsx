import type { Metadata } from "next"
import EmployesPageClient from "./EmployesPageClient"

export const metadata: Metadata = {
  title: "Employés | Karbill",
  description: "Gérez vos employés et leurs compétences",
}

export default function EmployesPage() {
  return <EmployesPageClient />
}
