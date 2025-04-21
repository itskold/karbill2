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
    // Ici, vous implémenteriez la logique d'envoi du formulaire
    console.log("Form submitted:", formData)
    alert("Merci pour votre message ! Nous vous contacterons bientôt.")
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Parlons de votre projet</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Des questions ? Besoin d'une démo personnalisée ? Notre équipe est là pour vous aider.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 mt-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Adresse</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Avenue Louise 123
                  <br />
                  1050 Bruxelles
                  <br />
                  Belgique
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Téléphone</h3>
                <p className="text-gray-500 dark:text-gray-400">+32 2 123 45 67</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Email</h3>
                <p className="text-gray-500 dark:text-gray-400">info@karbill.be</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Suivez-nous</h3>
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
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Votre nom"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Votre email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Votre téléphone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Nom de votre entreprise"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Comment pouvons-nous vous aider ?"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Envoyer le message
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
