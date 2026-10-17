import Link from 'next/link';

export function PermanenceGuarantee() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto bg-gradient-to-b from-white/90 via-[#FDFBFE]/90 to-white/90 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.08)]">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F4] border border-[#F8C7D8] text-xs font-semibold text-[#E05282] mb-4">
            <span>❤️</span>
            <span>Desde el Corazón · Tranquilidad y Compromiso</span>
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E2A78] leading-tight mb-4">
            Un homenaje honesto, claro y sin letra pequeña
          </h2>
          <p className="text-[#706A95] text-sm sm:text-base leading-relaxed">
            Sabemos lo importante que es este paso para ti. Por eso diseñamos Ángeles en el Cielo con total transparencia técnica y humana desde el primer día.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1 */}
          <div className="flex flex-col bg-white/70 p-6 rounded-2xl border border-[#EDE8F5] shadow-sm">
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
              <span>✦</span> Espacio activo durante la duración del proyecto
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col bg-white/70 p-6 rounded-2xl border border-[#EDE8F5] shadow-sm">
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
              <span>✦</span> Siempre en tus manos
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col bg-white/70 p-6 rounded-2xl border border-[#EDE8F5] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#E05282] flex items-center justify-center text-2xl mb-4 shadow-sm">
              ✨
            </div>
            <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
              Sin Cuotas ni Renovaciones
            </h3>
            <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
              Realizas un único pago y tu angelito ocupa su lugar en el cielo. No existen cobros ocultos, ni renovaciones automáticas, ni costes de permanencia posteriores. Claridad absoluta para tu tranquilidad.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#E05282] flex items-center gap-1.5">
              <span>✦</span> Pago único y transparente
            </div>
          </div>

        </div>

        {/* Bottom banner link to legal terms & transparency */}
        <div className="mt-8 pt-6 border-t border-[#EDE8F5] text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#706A95]">
          <Link href="/desde-el-corazon" className="text-[#1E2A78] font-bold hover:text-[#4A3F6B] transition-colors inline-flex items-center gap-1.5 underline">
            <span>❤️</span>
            <span>Desde el Corazón: conoce nuestra historia y por qué lo creamos</span>
            <span>→</span>
          </Link>
          <span className="hidden sm:inline opacity-30">•</span>
          <p>
            Consulta nuestros{' '}
            <Link href="/terminos" className="text-[#1E2A78] font-semibold underline hover:text-[#4A3F6B] transition-colors">
              Términos y Condiciones
            </Link>.
          </p>
        </div>

      </div>
    </section>
  );
}
