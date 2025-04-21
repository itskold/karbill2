import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default:
      "Karbill | Logiciel de gestion pour garages automobiles en Belgique",
    template: "%s | Karbill",
  },
  description:
    "Karbill est un logiciel de gestion complet pour les garages automobiles en Belgique. Gérez vos clients, véhicules, factures et plus encore.",
  keywords: [
    "logiciel garage",
    "gestion garage",
    "logiciel automobile",
    "gestion atelier",
    "factures garage",
    "Belgique",
    "garage management",
    "software",
    "karbill",
  ],
  authors: [{ name: "Karbill" }],
  creator: "Karbill",
  publisher: "Karbill",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://karbill.be"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-BE": "/fr",
      "nl-BE": "/nl",
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: "https://karbill.be",
    title: "Karbill | Logiciel de gestion pour garages automobiles en Belgique",
    description:
      "Karbill est un logiciel de gestion complet pour les garages automobiles en Belgique. Gérez vos clients, véhicules, factures et plus encore.",
    siteName: "Karbill",
    images: [
      {
        url: "https://karbill.be/assets/images/logo/logo2.png",
        width: 800,
        height: 600,
        alt: "Logo Karbill",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karbill | Logiciel de gestion pour garages automobiles en Belgique",
    description:
      "Karbill est un logiciel de gestion complet pour les garages automobiles en Belgique. Gérez vos clients, véhicules, factures et plus encore.",
    images: ["https://karbill.be/assets/images/logo/logo2.png"],
    creator: "@karbill",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "Technology",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-BE">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="alternate" hrefLang="fr-BE" href="https://karbill.be/fr" />
        <link rel="alternate" hrefLang="nl-BE" href="https://karbill.be/nl" />
        <link rel="alternate" hrefLang="en" href="https://karbill.be" />
        <link rel="alternate" hrefLang="x-default" href="https://karbill.be" />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
