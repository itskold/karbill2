"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Karbill heeft het beheer van mijn garage volledig getransformeerd. Ik bespaar kostbare tijd op administratieve taken en mijn klanten zijn verheugd over de kwaliteit van de service.",
      author: "Jan De Vries",
      role: "Garage-eigenaar, Brussel",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Na verschillende softwarepakketten te hebben geprobeerd, is Karbill veruit het meest geschikt voor de specifieke kenmerken van Belgische garages. De interface is intuïtief en de klantenservice is uitstekend.",
      author: "Marie Janssens",
      role: "Manager, Garage AutoService, Luik",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Het beheer van facturen en garanties is kinderspel geworden. Ik raad Karbill aan bij al mijn collega's in de autosector.",
      author: "Thomas Peeters",
      role: "Zelfstandig monteur, Namen",
      avatar: "/placeholder.svg?height=100&width=100",
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
    <section id="testimonials" className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
      <div className="blob-animation bg-primary/5 w-[500px] h-[500px] top-[10%] right-[-10%]"></div>
      <div className="blob-animation bg-primary/5 w-[400px] h-[400px] bottom-[10%] left-[-5%]"></div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Getuigenissen</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Wat onze klanten zeggen</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Ontdek hoe Karbill autoprofessionals in heel België helpt.
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
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="testimonial-card flex flex-col items-start rounded-lg border bg-white p-8"
            >
              <div className="flex space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mb-6 text-gray-700 italic">"{testimonial.quote}"</blockquote>
              <div className="mt-auto flex items-center space-x-4">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
