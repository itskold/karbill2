"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function Stats() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const stats = [
    { value: 3000, label: "Garages", suffix: "+" },
    { value: 50000, label: "Factures générées", suffix: "+" },
    { value: 99, label: "Satisfaction client", suffix: "%" },
    { value: 24, label: "Support", suffix: "/7" },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <CounterStat
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              inView={inView}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CounterStat({ value, label, suffix = "", inView, delay = 0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let start = 0
    const duration = 2000 // ms
    const step = Math.ceil(value / (duration / 16)) // 60fps

    // Add a small delay before starting the animation
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += step
        if (start > value) {
          setCount(value)
          clearInterval(interval)
        } else {
          setCount(start)
        }
      }, 16)

      return () => clearInterval(interval)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [inView, value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-primary stats-counter">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-gray-600">{label}</div>
    </motion.div>
  )
}
