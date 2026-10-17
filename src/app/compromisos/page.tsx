import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Nuestros Compromisos · Transparencia y Seguridad | Ángeles en el Cielo',
  description: 'Conoce los compromisos fundamentales de Ángeles en el Cielo: custodia de certificados, permanencia sin cuotas periódicas y protocolo ético de perpetuidad.',
};

export default function CompromisosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F4]">
      {/* Header flotante */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-[960px] mx-auto space-y-12">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEFA] border border-[#E3D9F2] text-xs font-semibold text-[#6C539A] mb-4 shadow-sm">
              <span>🛡️</span>
              <span>Tranquilidad, Ética y Seguridad para tu Familia</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E2A78] leading-tight mb-5">
              Nuestros Compromisos Fundamentales
            </h1>
            <p className="text-[#5A639C] text-base sm:text-lg leading-relaxed">
              Sabemos lo sagrado que es el recuerdo de tu mascota. Por eso establecemos compromisos técnicos y humanos transparentes, honestos y sin letra pequeña.
            </p>
          </div>

          {/* Bloque: Los 3 Pilares Técnicos y Humanos */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Pilar 1: Infraestructura Estable */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF0FF] text-[#1E2A78] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  ☁️
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Infraestructura Estable
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  Ángeles en el Cielo está desarrollado sobre arquitectura moderna y eficiente de mínimo coste técnico. Esto permite mantener el mural abierto y disponible durante la duración del proyecto sin depender de cuotas mensuales de las familias.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#1E2A78] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Espacio activo durante la duración del proyecto
                </div>
              </div>

              {/* Pilar 2: Custodia y Certificado Propio */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF6E5] text-[#C9A961] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  📜
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Custodia y Certificado Propio
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  El recuerdo de tu pequeño no depende únicamente de una web: nada más publicarse su estrella, tu familia recibe el Certificado Celestial oficial en PDF y el archivo conmemorativo en alta resolución para guardarlo e imprimirlo siempre en casa.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#C9A961] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Siempre en tus manos
                </div>
              </div>

              {/* Pilar 3: Sin Cuotas ni Renovaciones */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#E05282] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  ✨
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Sin Cuotas ni Renovaciones
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  Realizas un único pago y tu angelito ocupa su lugar en el cielo (o suscripción anual transparente en Plan Huellita). No existen cobros ocultos, ni renovaciones automáticas no deseadas, ni costes de permanencia posteriores. Claridad absoluta para tu tranquilidad.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#E05282] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Pago transparente sin sorpresas
                </div>
              </div>

            </div>
          </section>

          {/* Bloque: Protocolo de Perpetuidad en Caso de Cierre Futuro */}
          <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#E9E4F0] shadow-sm">
            <h3 className="font-playfair font-bold text-lg sm:text-xl text-[#1E2A78] mb-3 flex items-center gap-2">
              <span>🤝</span>
              <span>¿Y si el proyecto cerrase en un futuro lejano?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5A639C] leading-relaxed mb-4">
              La honestidad exige contemplar todos los escenarios. Si en algún momento, por inviabilidad a largo plazo, el proyecto tuviera que concluir, asumimos un compromiso ético y contractual con cada familia:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4A3F6B] font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Preaviso formal mínimo de 6 meses</strong> por correo electrónico a todas las familias registradas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Entrega de copia de seguridad digital completa</strong> de la foto, dedicatoria y coordenadas de tu homenaje.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Cesión del archivo conmemorativo</strong> a una entidad protectora de animales o su preservación en el registro abierto e histórico de <em>The Internet Archive</em>.</span>
              </li>
            </ul>
          </section>

          {/* Banner de términos y contacto */}
          <div className="text-center pt-4">
            <p className="text-xs sm:text-sm text-[#706A95] mb-6">
              Para conocer las condiciones legales completas de nuestro servicio, puedes consultar los{' '}
              <Link href="/terminos" className="text-[#1E2A78] font-bold underline hover:text-[#4A3F6B] transition-colors">
                Términos y Condiciones de Uso
              </Link>{' '}
              o leer sobre el origen y propósito del proyecto en{' '}
              <Link href="/desde-el-corazon" className="text-[#E05282] font-bold underline hover:text-[#B83260] transition-colors">
                Desde el Corazón
              </Link>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/mural-global"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1E2A78] to-[#2E3C94] text-white font-bold text-sm shadow-[0_4px_16px_rgba(30,42,120,0.30)] hover:shadow-[0_6px_22px_rgba(30,42,120,0.40)] hover:scale-105 active:scale-95 transition-all"
              >
                Ver el Mural de Ángeles ✨
              </Link>
              <Link
                href="/contacto"
                className="px-6 py-3 rounded-full bg-white/90 text-[#1E2A78] font-bold text-sm border border-[#D5CAE6] hover:bg-white shadow-sm transition-all"
              >
                ¿Tienes dudas? Escríbenos 💬
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
