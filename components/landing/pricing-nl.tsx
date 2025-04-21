"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function Pricing() {
  const plans = [
    {
      name: "Gratis",
      price: "0",
      description: "Ideaal voor kleine garages die net beginnen.",
      features: ["Maximaal 5 voertuigen", "Maximaal 10 klanten", "Basis factuurbeheer", "1 gebruiker"],
      cta: "Gratis beginnen",
      popular: false,
    },
    {
      name: "Basis",
      price: "19",
      description: "Voor groeiende garages met meer behoeften.",
      features: [
        "Maximaal 50 voertuigen",
        "Maximaal 100 klanten",
        "Volledig factuurbeheer",
        "Garantiebeheer",
        "Voorschotbeheer",
        "2 gebruikers",
        "E-mail ondersteuning",
      ],
      cta: "Probeerperiode starten",
      popular: true,
    },
    {
      name: "Professioneel",
      price: "99",
      description: "Complete oplossing voor gevestigde garages.",
      features: [
        "Onbeperkt voertuigen",
        "Onbeperkt klanten",
        "Volledig factuurbeheer",
        "Garantiebeheer",
        "Voorschotbeheer",
        "Beheer van reparatieorders",
        "Personeelsbeheer",
        "Geavanceerde rapportages",
        "Onbeperkt gebruikers",
        "Prioritaire ondersteuning",
      ],
      cta: "Probeerperiode starten",
      popular: false,
    },
  ]

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const controls = useAnimation()

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="blob-animation bg-primary/5 w-[400px] h-[400px] top-[20%] left-[-10%]"></div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Prijzen</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Pakketten aangepast aan uw behoeften</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Kies het plan dat het beste past bij de omvang en behoeften van uw garage.
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`pricing-card flex flex-col rounded-lg border p-8 bg-white ${
                plan.popular ? "border-primary shadow-lg relative card-highlight" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-medium text-white shadow-md">
                  Populair
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.price !== "Op maat" && <span className="ml-1 text-gray-500">€/maand</span>}
              </div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.description}</p>
              <div className="my-8 h-px bg-gray-100" />
              <ul className="mb-8 space-y-4 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Link href={plan.name === "Onderneming" ? "#contact" : "/auth/register"}>
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full py-6" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          Alle prijzen zijn exclusief BTW. Maandelijkse of jaarlijkse facturering beschikbaar.
        </div>
      </div>
    </section>
  )
}
