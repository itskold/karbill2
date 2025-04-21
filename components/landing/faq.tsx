"use client"

import { useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function FAQ() {
  const faqs = [
    {
      question: "Puis-je essayer Karbill avant de m'abonner ?",
      answer:
        "Oui, nous proposons un essai gratuit de 14 jours sans engagement. Vous pouvez tester toutes les fonctionnalités de la plateforme et décider ensuite si elle correspond à vos besoins.",
    },
    {
      question: "Karbill est-il conforme aux réglementations belges ?",
      answer:
        "Absolument. Karbill a été développé spécifiquement pour le marché belge et respecte toutes les réglementations fiscales et comptables en vigueur en Belgique, y compris les normes de facturation.",
    },
    {
      question: "Comment fonctionne la migration de mes données existantes ?",
      answer:
        "Notre équipe vous accompagne dans le processus de migration de vos données existantes. Nous proposons un service d'importation pour transférer vos clients, véhicules et historique depuis votre ancien système vers Karbill, assurant une transition en douceur.",
    },
    {
      question: "Karbill fonctionne-t-il sur tous les appareils ?",
      answer:
        "Oui, Karbill est une application web responsive qui fonctionne sur tous les appareils : ordinateurs, tablettes et smartphones. Vous pouvez y accéder depuis n'importe quel navigateur moderne, où que vous soyez.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer:
        "La sécurité est notre priorité. Toutes vos données sont stockées sur des serveurs sécurisés en Europe, avec des sauvegardes quotidiennes et un chiffrement de bout en bout. Nous respectons scrupuleusement le RGPD.",
    },
    {
      question: "Puis-je personnaliser les modèles de factures ?",
      answer:
        "Oui, Karbill vous permet de personnaliser entièrement vos modèles de factures, devis et autres documents avec votre logo, vos couleurs et vos informations d'entreprise.",
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="faq" className="py-20 md:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Questions fréquentes</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Vous avez des questions ? Nous avons les réponses.
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem value={`item-${index}`} className="border-b border-gray-200 py-2">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
