import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Stats } from "@/components/landing/stats"
import { ClientLogos } from "@/components/landing/client-logos"
import { Features } from "@/components/landing/features"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Contact } from "@/components/landing/contact"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Karbill | Logiciel de gestion pour garages automobiles en Belgique",
  description:
    "Karbill est un logiciel de gestion complet pour les garages automobiles en Belgique. Gérez vos clients, véhicules, factures et plus encore.",
  keywords: [
    "logiciel garage",
    "gestion garage",
    "logiciel automobile",
    "gestion atelier",
    "factures garage",
    "Belgique",
    "garage management",
    "software",
    "karbill",
  ],
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <ClientLogos />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
