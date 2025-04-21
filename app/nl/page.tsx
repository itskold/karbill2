import { Header } from "@/components/landing/header-nl"
import { Hero } from "@/components/landing/hero-nl"
import { Stats } from "@/components/landing/stats-nl"
import { ClientLogos } from "@/components/landing/client-logos"
import { Features } from "@/components/landing/features-nl"
import { Testimonials } from "@/components/landing/testimonials-nl"
import { Pricing } from "@/components/landing/pricing-nl"
import { FAQ } from "@/components/landing/faq-nl"
import { CTA } from "@/components/landing/cta-nl"
import { Contact } from "@/components/landing/contact-nl"
import { Footer } from "@/components/landing/footer-nl"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Karbill | Beheersoftware voor autogarages in België",
  description:
    "Karbill is een complete beheersoftware voor autogarages in België. Beheer uw klanten, voertuigen, facturen en meer.",
  keywords: [
    "garage software",
    "garage beheer",
    "auto software",
    "werkplaats beheer",
    "garage facturen",
    "België",
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
