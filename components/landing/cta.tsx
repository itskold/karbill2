"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0"></div>

          {/* Animated background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div
                className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/30 animate-float"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-40 right-20 w-40 h-40 rounded-full bg-white/20 animate-float"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-10 left-1/3 w-52 h-52 rounded-full bg-white/20 animate-float"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>

          <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Prêt à simplifier la gestion de votre garage ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8"
            >
              Rejoignez des milliers de professionnels qui font confiance à Karbill pour gérer leur activité au
              quotidien.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 px-8 shadow-lg"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="border-black bg-black text-white hover:bg-black/90 px-8">
                  Nous contacter
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
