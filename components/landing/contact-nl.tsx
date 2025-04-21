"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hier zou u de logica voor het verzenden van het formulier implementeren
    console.log("Form submitted:", formData)
    alert("Bedankt voor uw bericht! We nemen binnenkort contact met u op.")
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    })
  }

  return (
    <section id="contact" className="py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Contact</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Laten we over uw project praten</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Vragen? Behoefte aan een persoonlijke demo? Ons team staat voor u klaar.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 mt-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Adres</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Louizalaan 123
                  <br />
                  1050 Brussel
                  <br />
                  België
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Telefoon</h3>
                <p className="text-gray-500 dark:text-gray-400">+32 2 123 45 67</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">E-mail</h3>
                <p className="text-gray-500 dark:text-gray-400">info@karbill.be</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Volg ons</h3>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-6 w-6 text-gray-500 hover:text-primary" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-6 w-6 text-gray-500 hover:text-primary" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-6 w-6 text-gray-500 hover:text-primary" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-6 w-6 text-gray-500 hover:text-primary" />
                </a>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Uw naam"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Uw e-mail"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Uw telefoonnummer"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Bedrijf</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Naam van uw bedrijf"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Bericht</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Hoe kunnen we u helpen?"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Bericht verzenden
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
