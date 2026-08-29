import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieBanner from '@/components/CookieBanner';

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
  title: "Ángeles en el Cielo | Todas las mascotas van al cielo",
  description: "Una experiencia memorial digital para mascotas fallecidas. Cada foto guarda una historia. Cada historia deja una huella.",
  icons: {
    icon: [
      { url: '/images/icons/Logoheart.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/images/icons/Logoheart.svg',
    apple: '/images/icons/Logoheart.svg',
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
      </body>
    </html>
  );
}
