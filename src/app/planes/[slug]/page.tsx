import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PLANS, PlanId, slotsLabel } from '@/lib/plans';

interface PlanDetail {
  id: PlanId;
  slug: string;
  aliases: string[];
  name: string;
  tagline: string;
  priceEur: string;
  priceUsd: string;
  periodText: string;
  badge?: string;
  isFeatured?: boolean;
  slots: string;
  dimensions: string;
  description: string;
  features: string[];
  includesCertificate: string;
  bgGradient: string;
  accentColor: string;
}

const PLAN_DETAILS: Record<string, PlanDetail> = {
  huellita: {
    id: 'huellita',
    slug: 'huellita',
    aliases: ['huellita'],
    name: 'Plan Huellita',
    tagline: 'Un espacio propio para tu pequeño en el cielo',
    priceEur: '1,99 €',
    priceUsd: '$1.99',
    periodText: 'al año (renovación anual opcional)',
    badge: 'Esencial y Accesible',
    slots: '1 espacio memorial individual',
    dimensions: '1 casilla (1×1)',
    description: 'El espacio inicial para que tu mascota tenga su rincón eterno en el gran mural celestial. Podrás subir su foto más bonita, redactar su historia y dedicatoria para que su recuerdo permanezca vivo.',
    features: [
      'Un trocito de cielo propio en el mural global (1 espacio)',
      'Fotografía de tu angelito en alta resolución',
      'Ficha conmemorativa con su historia, fechas y dedicatoria',
      'Certificado conmemorativo digital oficial',
      'Velas y abrazos virtuales de toda la comunidad',
      'Soporte y atención con cariño por WhatsApp',
    ],
    includesCertificate: 'Certificado oficial Huellita en el Cielo',
    bgGradient: 'from-[#FAF6FB] via-[#F4EEF8] to-[#FFF9F6]',
    accentColor: '#1E2A78',
  },
  'estrella-brillante': {
    id: 'estrella_brillante',
    slug: 'estrella-brillante',
    aliases: ['estrella-brillante', 'estrella_brillante', 'estrella'],
    name: 'Plan Estrella Brillante',
    tagline: 'Mayor visibilidad en el cielo para siempre',
    priceEur: '4,99 €',
    priceUsd: '$4.99',
    periodText: 'pago único (para siempre, sin cuotas)',
    badge: 'El más elegido',
    isFeatured: true,
    slots: '4 espacios continuos (bloque 2×2)',
    dimensions: 'Bloque cuadrado 2×2',
    description: 'Un bloque ampliado de cuatro espacios para que la fotografía de tu angelito destaque con nitidez y luminosidad al recorrer el mural. Con pago único para siempre.',
    features: [
      'Pedacito de cielo ampliado: 4 espacios continuos (2×2)',
      'Permanencia para siempre garantizada, sin renovaciones',
      'La foto de tu peque se aprecia más grande y nítida en el mural',
      'Brillo conmemorativo durante la semana de su aniversario',
      'Certificado oficial Estrella en el Cielo en alta resolución',
      'Página memorial propia con enlace directo para compartir con familiares',
    ],
    includesCertificate: 'Certificado oficial Estrella en el Cielo',
    bgGradient: 'from-[#FFFDF7] via-[#FFF8E7] to-[#FAF4FE]',
    accentColor: '#1E2A78',
  },
  'corazon-eterno': {
    id: 'corazon_eterno',
    slug: 'corazon-eterno',
    aliases: ['corazon-eterno', 'corazon_eterno', 'corazon'],
    name: 'Plan Corazón Eterno',
    tagline: 'Ángel Fundador en el centro del cielo para siempre',
    priceEur: '9,99 €',
    priceUsd: '$9.99',
    periodText: 'pago único (para siempre, sin cuotas)',
    badge: 'Ángel Fundador · Zona Central',
    isFeatured: true,
    slots: '9 espacios continuos (bloque 3×3)',
    dimensions: 'Bloque cuadrado 3×3',
    description: 'Tu angelito ocupará un gran espacio en el corazón central del mural entre los Ángeles Fundadores. Su foto será protagonista desde cualquier distancia de visualización.',
    features: [
      'Gran bloque de 9 espacios continuos (3×3) en el mural',
      'Ubicación destacada en la zona central de Ángeles Fundadores',
      'Permanencia para siempre garantizada',
      'Aureola dorada luminosa y distinción de Ángel Fundador',
      'Certificado especial de Ángel Fundador personalizado e imprimible',
      'Página memorial propia completa con dedicatoria amplia',
      'Brillo celestial permanente en las fechas conmemorativas',
    ],
    includesCertificate: 'Certificado de Honor Ángel Fundador',
    bgGradient: 'from-[#FFFBF5] via-[#FFF4E4] to-[#F9EFFD]',
    accentColor: '#8A6033',
  },
  'angelito-protector': {
    id: 'angelito_protector',
    slug: 'angelito-protector',
    aliases: ['angelito-protector', 'angelito_protector', 'angelito'],
    name: 'Plan Ángelito Protector',
    tagline: 'Presencia majestuosa visible desde cualquier ángulo',
    priceEur: '14,99 €',
    priceUsd: '$14.99',
    periodText: 'pago único (para siempre, sin cuotas)',
    badge: 'Gran Presencia 4×4',
    slots: '16 espacios continuos (bloque 4×4)',
    dimensions: 'Bloque cuadrado 4×4',
    description: 'Un homenaje de dimensiones generosas (16 casillas continuas) que otorga a tu pequeño una visibilidad excepcional en el cielo, equivalente a cuatro veces el tamaño de una Estrella.',
    features: [
      'Gran bloque continuo de 16 espacios (4×4 en el mural)',
      '4 veces más grande que Estrella Brillante',
      'Máxima nitidez y presencia visual al explorar el firmamento',
      'Permanencia para siempre garantizada con pago único',
      'Certificado Especial de Honor Ángelito Protector',
      'Página conmemorativa propia con dedicatoria extensa y galería',
      'Luz celestial prioritaria en el cielo de los ángeles',
    ],
    includesCertificate: 'Certificado de Honor Ángelito Protector',
    bgGradient: 'from-[#F7F2FD] via-[#EFE6FB] to-[#FFF5F8]',
    accentColor: '#1E2A78',
  },
  'galaxia-de-amor': {
    id: 'galaxia_amor',
    slug: 'galaxia-de-amor',
    aliases: ['galaxia-de-amor', 'galaxia-amor', 'galaxia_amor', 'galaxia'],
    name: 'Plan Galaxia de Amor',
    tagline: 'Una constelación estelar majestuosa para su recuerdo',
    priceEur: '19,99 €',
    priceUsd: '$19.99',
    periodText: 'pago único (para siempre, sin cuotas)',
    badge: '5×5 Constelación',
    slots: '25 espacios continuos (bloque 5×5)',
    dimensions: 'Bloque cuadrado 5×5',
    description: 'Una constelación de 25 casillas que resplandece con luz propia en el mural. Concebido para familias que desean inmortalizar un vínculo que iluminó su existencia de manera incondicional.',
    features: [
      'Espacio estelar privilegiado de 25 espacios continuos (5×5)',
      'Resplandor visible al explorar el cielo desde cualquier nivel de zoom',
      'Permanencia para siempre garantizada con un único pago',
      'Certificado Especial de Honor Galaxia de Amor para enmarcar',
      'Página memorial exclusiva con dedicatoria, fechas y galería de fotos',
      'Brillo conmemorativo destacado en su fecha especial y aniversarios',
    ],
    includesCertificate: 'Certificado de Honor Galaxia de Amor',
    bgGradient: 'from-[#F5EDFC] via-[#ECE0F9] to-[#FFF5FA]',
    accentColor: '#6B3FA0',
  },
  'vinculo-infinito': {
    id: 'vinculo_infinito',
    slug: 'vinculo-infinito',
    aliases: ['vinculo-infinito', 'vinculo_infinito', 'vinculo'],
    name: 'Plan Vínculo Infinito',
    tagline: 'El memorial supremo y más grande del firmamento',
    priceEur: '29,99 €',
    priceUsd: '$29.99',
    periodText: 'pago único (para siempre, sin cuotas)',
    badge: '6×6 El Mayor Tributo Celestial',
    isFeatured: true,
    slots: '36 espacios continuos (bloque 6×6)',
    dimensions: 'Bloque cuadrado 6×6 (máximo tamaño)',
    description: 'El tributo más grande y honorable de todo el mural de Ángeles en el Cielo (36 espacios en bloque continuo 6×6). Visible incluso con el zoom completamente alejado, con aureola y corona de luz celestial.',
    features: [
      'El espacio más grande de todo el mural (36 espacios continuos 6×6)',
      'Visible inmediatamente incluso con el zoom alejado al máximo',
      'Aureola y corona de luz celestial única en el firmamento',
      'Permanencia para siempre garantizada sin cuotas futuras',
      'Certificado de Honor Vínculo Infinito en máxima resolución de impresión',
      'Página conmemorativa ampliada con galería multitemporal (incluye hasta 5 fotografías conmemorativas)',
      'Atención personalizada prioritaria por el equipo de Ángeles en el Cielo',
    ],
    includesCertificate: 'Certificado de Honor Supremo Vínculo Infinito',
    bgGradient: 'from-[#FFFDF2] via-[#FFF6DC] to-[#F7EEFA]',
    accentColor: '#8A6033',
  },
};

function resolvePlan(slug: string): PlanDetail | undefined {
  const normalized = slug.toLowerCase().trim();
  if (PLAN_DETAILS[normalized]) return PLAN_DETAILS[normalized];
  for (const detail of Object.values(PLAN_DETAILS)) {
    if (detail.aliases.includes(normalized)) return detail;
  }
  return undefined;
}

export function generateStaticParams() {
  return [
    { slug: 'huellita' },
    { slug: 'estrella-brillante' },
    { slug: 'corazon-eterno' },
    { slug: 'angelito-protector' },
    { slug: 'galaxia-de-amor' },
    { slug: 'galaxia-amor' },
    { slug: 'vinculo-infinito' },
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const plan = resolvePlan(params.slug);
  if (!plan) {
    return {
      title: 'Planes del Mural de Ángeles | Todas las mascotas van al cielo',
      description: 'Elige el espacio memorial para tu angelito en el cielo de los ángeles.',
    };
  }

  const title = `${plan.name} (${plan.priceEur}) · Espacio en el Mural de Ángeles | Todas las mascotas van al cielo`;
  const description = `${plan.tagline}. ${plan.slots}. Precio: ${plan.priceEur} (${plan.periodText}). Incluye ${plan.includesCertificate}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://todaslasmascotasvanalcielo.com/planes/${plan.slug}`,
      siteName: 'Todas las mascotas van al cielo',
      locale: 'es_ES',
      type: 'website',
    },
    alternates: {
      canonical: `https://todaslasmascotasvanalcielo.com/planes/${plan.slug}`,
    },
  };
}

export default function PlanDetailPage({ params }: { params: { slug: string } }) {
  const plan = resolvePlan(params.slug);
  if (!plan) notFound();

  const allPlansList = Object.values(PLAN_DETAILS).filter(
    (p, idx, arr) => arr.findIndex(item => item.id === p.id) === idx
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF7FB] text-[#2D0F31] pt-28 pb-20">
        
        {/* Migas de pan / Breadcrumb */}
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 mb-6">
          <nav aria-label="Breadcrumb" className="text-xs text-[#706A95] flex items-center gap-2">
            <Link href="/" className="hover:text-[#1E2A78] hover:underline">Inicio</Link>
            <span>/</span>
            <Link href="/planes" className="hover:text-[#1E2A78] hover:underline">Planes y Precios</Link>
            <span>/</span>
            <span className="font-semibold text-[#2D0F31]">{plan.name}</span>
          </nav>
        </div>

        {/* Tarjeta de Producto Principal */}
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className={`rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(111,95,168,0.12)] bg-gradient-to-br ${plan.bgGradient} p-6 sm:p-10 lg:p-12 relative overflow-hidden`}>
            
            {/* Badge de Categoría */}
            {plan.badge && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1E2A78] text-white text-xs font-bold tracking-wide uppercase shadow-sm mb-4">
                <span>⭐</span>
                <span>{plan.badge}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: Información de producto */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2A78] leading-tight">
                    {plan.name}
                  </h1>
                  <p className="text-base sm:text-lg text-[#5A639C] font-medium mt-2">
                    {plan.tagline}
                  </p>
                </div>

                {/* Bloque de Precio Oficial */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/90 border border-white shadow-sm space-y-2">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#1E2A78]">
                      {plan.priceEur}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#5A639C]">
                      / {plan.periodText}
                    </span>
                    <span className="text-xs text-[#706A95] bg-[#EDE8F5] px-2.5 py-1 rounded-md">
                      Equivalente: {plan.priceUsd} USD
                    </span>
                  </div>
                  <p className="text-xs text-[#706A95] flex items-center gap-1.5 pt-1">
                    <span>✓</span>
                    <span>Impuestos incluidos · Facturación segura a través de Stripe · Sin cobros ocultos</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <h2 className="font-bold text-lg text-[#1E2A78]">Descripción del memorial</h2>
                  <p className="text-sm sm:text-base text-[#4A4368] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Características y qué incluye */}
                <div className="space-y-3 pt-2">
                  <h2 className="font-bold text-lg text-[#1E2A78]">¿Qué incluye este plan?</h2>
                  <ul className="space-y-2.5 text-sm sm:text-base text-[#4A4368]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#8C3F71] font-bold text-base mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Acciones principales de compra */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    href={`/mural-global`}
                    className="py-4 px-8 rounded-full font-bold text-white text-center shadow-[0_8px_25px_rgba(30,42,120,0.30)] hover:shadow-[0_12px_32px_rgba(30,42,120,0.45)] hover:scale-[1.02] transition-all text-sm sm:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #1E2A78 0%, #3B4B9E 100%)',
                    }}
                  >
                    Elegir espacio para {plan.name} en el Mural →
                  </Link>

                  <a
                    href="https://wa.me/34610319143?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 rounded-full font-semibold text-[#1E2A78] bg-white hover:bg-gray-50 border border-gray-200 text-center transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>Preguntar por WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Columna Derecha: Ficha técnica / Resumen del artículo */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#E9E1F0] shadow-sm space-y-4">
                  <h3 className="font-playfair text-xl font-bold text-[#1E2A78]">
                    Ficha Técnica del Artículo
                  </h3>

                  <div className="space-y-3 text-sm divide-y divide-gray-100">
                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Nombre del producto:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">{plan.name}</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Espacio en el mural:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">{plan.slots}</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Dimensiones:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">{plan.dimensions}</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Tipo de duración:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">{plan.periodText}</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Certificado:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">{plan.includesCertificate}</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Entrega:</span>
                      <span className="font-semibold text-[#166534] text-right">Inmediata digital</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-[#706A95]">Plataforma:</span>
                      <span className="font-semibold text-[#1E2A78] text-right">todaslasmascotasvanalcielo.com</span>
                    </div>
                  </div>
                </div>

                {/* Caja de Garantía y Transparencia */}
                <div className="bg-[#FFF9EE] rounded-2xl p-5 border border-[#F0DFB6] text-xs space-y-2 text-[#7A612E]">
                  <div className="font-bold text-sm text-[#8A6033] flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Compromiso de permanencia y cuidado</span>
                  </div>
                  <p className="leading-relaxed">
                    Cada recuerdo se custodia en servidores seguros de alta disponibilidad con copias de seguridad continuas. El memorial de tu angelito siempre estará accesible para ti y tu familia.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Navegación a los demás planes */}
          <div className="mt-16 space-y-6">
            <div className="text-center">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78]">
                Todos los planes del Mural de Ángeles
              </h2>
              <p className="text-sm text-[#5A639C] mt-1">
                Compara las opciones disponibles para recordar a tu compañero eterno
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {allPlansList.map((item) => (
                <Link
                  key={item.id}
                  href={`/planes/${item.slug}`}
                  className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 block ${
                    item.id === plan.id
                      ? 'bg-white border-[#1E2A78] shadow-md ring-2 ring-[#1E2A78]/20'
                      : 'bg-white/80 hover:bg-white border-[#EDE4F2] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-[#1E2A78]">{item.name}</h3>
                    <span className="font-extrabold text-[#1E2A78] text-sm">{item.priceEur}</span>
                  </div>
                  <p className="text-xs text-[#5A639C] mt-1">{item.tagline}</p>
                  <p className="text-[11px] text-[#706A95] mt-2 font-medium">{item.slots}</p>
                </Link>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/#planes"
                className="text-xs sm:text-sm font-semibold text-[#8C3F71] hover:underline"
              >
                ← Volver a la comparativa de precios en la página principal
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}
