import Image from "next/image"

export function ClientLogos() {
  // Remplacez ces URLs par les logos réels de vos clients
  const logos = [
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
    "/placeholder.svg?height=60&width=180",
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <h3 className="text-center text-lg font-medium text-gray-600 mb-8">Ils nous font confiance</h3>

        <div className="scroll-container">
          <div className="scroll-wrapper">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={`logo-1-${index}`} className="flex-shrink-0 mx-8">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt={`Client logo ${index + 1}`}
                  width={180}
                  height={60}
                  className="client-logo h-12 w-auto object-contain"
                />
              </div>
            ))}

            {/* Duplicate set for seamless scrolling */}
            {logos.map((logo, index) => (
              <div key={`logo-2-${index}`} className="flex-shrink-0 mx-8">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt={`Client logo ${index + 1}`}
                  width={180}
                  height={60}
                  className="client-logo h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
