import Image from "next/image"

export function ClientLogos() {
  // Remplacez ces URLs par les logos réels de vos clients
  const logos = [
    "/stell-logo-blue.svg",
    "/geely.svg?color=#232323",
    "/byd.svg",
    "/autohero.svg",
    "/vanmossel.svg",
    "/autosphere.svg",
    "/am.svg",
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
                  width={100}
                  height={100}
                  className="client-logo h-12 object-contain "
                />
              </div>
            ))}

            {/* Duplicate set for seamless scrolling */}
            {logos.map((logo, index) => (
              <div key={`logo-2-${index}`} className="flex-shrink-0 mx-8">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt={`Client logo ${index + 1}`}
                  width={100}
                  height={100}
                  className="client-logo h-12 object-contain "
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
