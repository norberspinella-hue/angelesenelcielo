import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Catálogo de Planes y Espacios Memoriales | Todas las mascotas van al cielo',
  description: 'Conoce los 6 planes de homenaje para tu angelito en el Mural de Ángeles en el Cielo. Espacios individuales, estrellas, corazones y constelaciones.',
  openGraph: {
    title: 'Catálogo de Planes y Espacios Memoriales | Todas las mascotas van al cielo',
    description: 'Conoce los 6 planes de homenaje para tu angelito en el Mural de Ángeles en el Cielo.',
    url: 'https://todaslasmascotasvanalcielo.com/planes',
    siteName: 'Todas las mascotas van al cielo',
    locale: 'es_ES',
    type: 'website',
  },
};

const PRODUCTS = [
  {
    name: 'Plan Huellita',
    slug: 'huellita',
    price: '1,99 €',
    period: '/ año',
    slots: '1 espacio memorial individual',
    tagline: 'Un espacio propio para tu pequeño en el cielo',
    badge: 'Esencial',
  },
  {
    name: 'Plan Estrella Brillante',
    slug: 'estrella-brillante',
    price: '4,99 €',
    period: 'pago único · para siempre',
    slots: '4 espacios (bloque 2×2)',
    tagline: 'Mayor visibilidad en el cielo para siempre',
    badge: 'El más elegido',
    isFeatured: true,
  },
  {
    name: 'Plan Corazón Eterno',
    slug: 'corazon-eterno',
    price: '9,99 €',
    period: 'pago único · para siempre',
    slots: '9 espacios (bloque 3×3)',
    tagline: 'Ángel Fundador en el centro del cielo',
    badge: 'Ángel Fundador',
    isFeatured: true,
  },
  {
    name: 'Plan Ángelito Protector',
    slug: 'angelito-protector',
    price: '14,99 €',
    period: 'pago único · para siempre',
    slots: '16 espacios (bloque 4×4)',
    tagline: 'Gran visibilidad desde cualquier ángulo',
    badge: '4×4 Gran Presencia',
  },
  {
    name: 'Plan Galaxia de Amor',
    slug: 'galaxia-de-amor',
    price: '19,99 €',
    period: 'pago único · para siempre',
    slots: '25 espacios (bloque 5×5)',
    tagline: 'Una constelación estelar majestuosa',
    badge: '5×5 Constelación',
  },
  {
    name: 'Plan Vínculo Infinito',
    slug: 'vinculo-infinito',
    price: '29,99 €',
    period: 'pago único · para siempre',
    slots: '36 espacios (bloque 6×6)',
    tagline: 'El memorial supremo y más grande del firmamento',
    badge: '6×6 Máximo Tributo',
    isFeatured: true,
  },
];

export default function PlanesIndexPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF7FB] text-[#2D0F31] pt-28 pb-20">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2A78] leading-tight">
              Catálogo Oficial de Planes
            </h1>
            <p className="text-base text-[#5A639C] mt-3">
              Descubre los 6 artículos disponibles en Todas las mascotas van al cielo para dedicar un rincón eterno a tu angelito en el gran mural.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.slug}
                className="bg-white rounded-2xl p-6 border border-[#EDE4F2] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EDE8F5] text-[#1E2A78]">
                      {prod.badge}
                    </span>
                    <span className="font-playfair text-2xl font-bold text-[#1E2A78]">
                      {prod.price}
                    </span>
                  </div>

                  <h2 className="font-playfair text-xl font-bold text-[#1E2A78]">
                    {prod.name}
                  </h2>
                  <p className="text-xs text-[#706A95] font-medium">
                    {prod.period} · {prod.slots}
                  </p>
                  <p className="text-sm text-[#4A4368] leading-relaxed">
                    {prod.tagline}
                  </p>
                </div>

                <div className="pt-6 space-y-2">
                  <Link
                    href={`/planes/${prod.slug}`}
                    className="block w-full py-2.5 px-4 rounded-full text-center text-xs font-bold text-white bg-[#1E2A78] hover:bg-[#323E8D] shadow-sm transition-all"
                  >
                    Ver ficha del artículo →
                  </Link>
                  <Link
                    href="/mural-global"
                    className="block w-full py-2 px-4 rounded-full text-center text-xs font-semibold text-[#1E2A78] bg-[#F4EEF8] hover:bg-[#EBE2F2] transition-all"
                  >
                    Elegir en el mural
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/#planes"
              className="text-sm font-semibold text-[#8C3F71] hover:underline"
            >
              ← Ver comparativa detallada en la página principal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
