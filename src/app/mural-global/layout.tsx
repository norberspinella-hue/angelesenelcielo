import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://angelesenelcielo.com'
  return {
    title: 'Mural de Ángeles en el Cielo',
    description: 'Un lugar eterno para las mascotas que siempre estarán en nuestros corazones.',
    openGraph: {
      title: 'Mural de Ángeles en el Cielo 🐾',
      description: 'Visita el recuerdo eterno en el Mural de Ángeles ✨',
      images: [{
        url: `${siteUrl}/api/og`,
        width: 1200,
        height: 630,
      }],
    },
  }
}

export default function MuralGlobalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
