"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 hero-gradient overflow-hidden relative">
      <div className="hero-curve" aria-hidden="true"></div>

      {/* Animated blobs */}
      <div
        className="blob-animation bg-primary/10 w-[300px] h-[300px] top-[20%] left-[10%]"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="blob-animation bg-primary/5 w-[400px] h-[400px] bottom-[10%] right-[5%]"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container px-4 md:px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary/20 text-sm font-medium text-primary mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            <span>3000+ garages vertrouwen op ons</span>
            <Link href="#testimonials" className="underline underline-offset-2">
              Bekijk getuigenissen
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
          >
            Vereenvoudig het beheer van uw autogarage
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Karbill is de alles-in-één software voor autogarages in België. Beheer uw klanten, voertuigen, facturen en
            meer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Link href="/auth/register">
              <Button size="lg" className="gap-1.5 px-8 shadow-lg hover:shadow-xl transition-all">
                Gratis proberen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="gap-1.5 px-8">
                Demo bekijken
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-8 text-sm"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>14 dagen proefperiode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Lokale ondersteuning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Geen verplichtingen</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Karbill Interface"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Floating UI elements */}
          <div
            className="absolute -top-6 -left-6 md:-top-10 md:-left-10 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-medium">Factuur aangemaakt</div>
              </div>
            </div>
          </div>

          <div
            className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 animate-float"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-medium">Klant toegevoegd</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
