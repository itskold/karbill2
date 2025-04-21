"use client"

import { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Car, Users, FileText, PenToolIcon as Tool, Calendar, BarChart, CreditCard, MessageSquare } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Car className="h-10 w-10 text-primary" />,
      title: "Voertuigbeheer",
      description: "Volg de volledige geschiedenis van elk voertuig, van reparaties tot onderhoud.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Klantenbeheer",
      description: "Centraliseer alle informatie van uw klanten en hun interventiegeschiedenis.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Eenvoudige facturatie",
      description: "Maak offertes, facturen en voorschotten met enkele klikken, conform de Belgische normen.",
    },
    {
      icon: <Tool className="h-10 w-10 text-primary" />,
      title: "Reparatieorders",
      description: "Plan en volg de interventies van uw werkplaats op een efficiënte manier.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Planning",
      description: "Organiseer uw agenda en optimaliseer de werktijd van uw team.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary" />,
      title: "Statistieken",
      description: "Analyseer uw prestaties en neem weloverwogen beslissingen voor uw bedrijf.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Betalingsbeheer",
      description: "Volg betalingen en beheer eenvoudig klantaanmaningen.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Klantcommunicatie",
      description: "Verstuur automatische meldingen voor afspraken en opvolging.",
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
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section id="features" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Functies</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Alles wat uw garage nodig heeft</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Karbill combineert alle essentiële functies om uw autogarage in België efficiënt te beheren.
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="feature-card flex flex-col items-center space-y-4 rounded-lg border p-6 bg-white"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
