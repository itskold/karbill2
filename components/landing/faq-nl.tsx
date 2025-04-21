"use client"

import { useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function FAQ() {
  const faqs = [
    {
      question: "Kan ik Karbill uitproberen voordat ik me abonneer?",
      answer:
        "Ja, we bieden een gratis proefperiode van 14 dagen zonder verplichtingen. U kunt alle functies van het platform testen en vervolgens beslissen of het aan uw behoeften voldoet.",
    },
    {
      question: "Is Karbill conform de Belgische regelgeving?",
      answer:
        "Absoluut. Karbill is specifiek ontwikkeld voor de Belgische markt en voldoet aan alle fiscale en boekhoudkundige voorschriften die in België van kracht zijn, inclusief factureringsnormen.",
    },
    {
      question: "Hoe werkt de migratie van mijn bestaande gegevens?",
      answer:
        "Ons team begeleidt u bij het migratieproces van uw bestaande gegevens. We bieden een importservice om uw klanten, voertuigen en geschiedenis van uw oude systeem naar Karbill over te zetten, wat zorgt voor een soepele overgang.",
    },
    {
      question: "Werkt Karbill op alle apparaten?",
      answer:
        "Ja, Karbill is een responsieve webapplicatie die op alle apparaten werkt: computers, tablets en smartphones. U kunt er vanaf elke moderne browser toegang toe krijgen, waar u ook bent.",
    },
    {
      question: "Zijn mijn gegevens beveiligd?",
      answer:
        "Veiligheid is onze prioriteit. Al uw gegevens worden opgeslagen op beveiligde servers in Europa, met dagelijkse back-ups en end-to-end encryptie. We houden ons strikt aan de AVG.",
    },
    {
      question: "Kan ik de factuursjablonen aanpassen?",
      answer:
        "Ja, met Karbill kunt u uw sjablonen voor facturen, offertes en andere documenten volledig aanpassen met uw logo, kleuren en bedrijfsinformatie.",
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Veelgestelde vragen</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Heeft u vragen? Wij hebben de antwoorden.
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
