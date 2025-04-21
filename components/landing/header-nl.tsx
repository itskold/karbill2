"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 backdrop-blur-sm",
        scrolled ? "bg-white/90 shadow-sm py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2 animate-fade-in">
          <Link href="/nl" className="flex items-center space-x-2">
            <Image
              src="https://karbill.be/assets/images/logo/logo2.png"
              alt="Karbill Logo"
              width={120}
              height={40}
              priority
              className="h-auto w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 animate-fade-in">
          <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
            Functies
          </Link>
          <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
            Getuigenissen
          </Link>
          <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
            Prijzen
          </Link>
          <Link href="#faq" className="text-sm font-medium transition-colors hover:text-primary">
            FAQ
          </Link>
          <Link href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4 animate-fade-in">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="font-medium">
              Inloggen
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="default" size="sm" className="font-medium shadow-md hover:shadow-lg transition-all">
              Gratis proberen
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Menu omschakelen</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 bg-white rounded-b-lg shadow-lg animate-slide-up">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Functies
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Getuigenissen
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Prijzen
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full justify-start">
                  Inloggen
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="w-full justify-start">
                  Gratis proberen
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
