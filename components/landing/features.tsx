"use client"

import { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Car, Users, FileText, PenToolIcon as Tool, Calendar, BarChart, CreditCard, MessageSquare } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Car className="h-10 w-10 text-primary" />,
      title: "Gestion des véhicules",
      description: "Suivez l'historique complet de chaque véhicule, des réparations aux entretiens.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Gestion des clients",
      description: "Centralisez toutes les informations de vos clients et leur historique d'interventions.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Facturation simplifiée",
      description: "Créez des devis, factures et acomptes en quelques clics, conformes aux normes belges.",
    },
    {
      icon: <Tool className="h-10 w-10 text-primary" />,
      title: "Ordres de réparation",
      description: "Planifiez et suivez les interventions de votre atelier de manière efficace.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Planification",
      description: "Organisez votre agenda et optimisez le temps de travail de votre équipe.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary" />,
      title: "Statistiques",
      description: "Analysez vos performances et prenez des décisions éclairées pour votre entreprise.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Gestion des paiements",
      description: "Suivez les paiements et gérez facilement les relances clients.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Communication client",
      description: "Envoyez des notifications automatiques pour les rendez-vous et suivis.",
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
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Fonctionnalités</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tout ce dont votre garage a besoin</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Karbill regroupe toutes les fonctionnalités essentielles pour gérer efficacement votre garage automobile
              en Belgique.
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
