import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieBanner from '@/components/CookieBanner';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://todaslasmascotasvanalcielo.com'),
  title: "Ángeles en el Cielo | Todas las mascotas van al cielo",
  description: "Una experiencia memorial digital para mascotas fallecidas. Cada foto guarda una historia. Cada historia deja una huella.",
  openGraph: {
    title: "Ángeles en el Cielo | Todas las mascotas van al cielo",
    description: "Una experiencia memorial digital para mascotas fallecidas. Cada foto guarda una historia. Cada historia deja una huella.",
    url: "https://todaslasmascotasvanalcielo.com",
    siteName: "Ángeles en el Cielo",
    images: [
      {
        url: '/logoheart-og.png',
        width: 600,
        height: 600,
        type: 'image/png',
        alt: 'Logo Ángeles en el Cielo',
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ángeles en el Cielo | Todas las mascotas van al cielo",
    description: "Una experiencia memorial digital para mascotas fallecidas. Cada foto guarda una historia. Cada historia deja una huella.",
    images: ['/logoheart-og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.tagged-events.js"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Nunito+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
        <CookieBanner />
        <WhatsAppButton />
      </body>
    </html>
  );
}
