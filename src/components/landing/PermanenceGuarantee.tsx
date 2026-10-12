import Link from 'next/link';

export function PermanenceGuarantee() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto bg-gradient-to-b from-white/90 via-[#FDFBFE]/90 to-white/90 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.08)]">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEFA] border border-[#E3D9F2] text-xs font-semibold text-[#6C539A] mb-4">
            <span>🛡️</span>
            <span>Compromiso de Perpetuidad y Transparencia</span>
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E2A78] leading-tight mb-4">
            ¿Qué ocurre con el recuerdo de tu mascota con el paso de los años?
          </h2>
          <p className="text-[#706A95] text-sm sm:text-base leading-relaxed">
            Es la pregunta más honesta y comprensible que se hace cualquier familia antes de elegir un espacio en el cielo. 
            Aquí tienes nuestro compromiso real, técnico y legal para tu absoluta tranquilidad.
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
              Infraestructura Perpetua
            </h3>
            <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
              Ángeles en el Cielo está desarrollado sobre arquitectura serverless y almacenamiento ultra-optimizado. Los costes técnicos de mantener el mural online son casi nulos, lo que garantiza su viabilidad durante décadas sin depender de suscripciones ni cuotas recurrentes.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#1E2A78] flex items-center gap-1.5">
              <span>✦</span> Sin coste de renovación para ti
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col bg-white/70 p-6 rounded-2xl border border-[#EDE8F5] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6E5] text-[#C9A961] flex items-center justify-center text-2xl mb-4 shadow-sm">
              📜
            </div>
            <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
              Custodia y Archivo Propio
            </h3>
            <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
              El recuerdo de tu pequeño no depende únicamente de una web: nada más publicarse su estrella, tu familia recibe el Certificado Celestial oficial en PDF y el archivo conmemorativo en alta resolución para conservarlo, imprimirlo y guardarlo en tus propios dispositivos.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#C9A961] flex items-center gap-1.5">
              <span>✦</span> Siempre en tus manos
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col bg-white/70 p-6 rounded-2xl border border-[#EDE8F5] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#E05282] flex items-center justify-center text-2xl mb-4 shadow-sm">
              🤝
            </div>
            <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
              ¿Y si el proyecto cerrase?
            </h3>
            <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
              Si por cualquier causa de fuerza mayor el proyecto cesara su actividad en un futuro lejano, nos comprometemos por contrato a: <strong>6 meses de preaviso</strong> por email, entrega de copia de seguridad completa a cada familia y cesión del archivo público a una entidad protectora de animales o a The Internet Archive.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#E05282] flex items-center gap-1.5">
              <span>✦</span> Garantía vinculante en Términos
            </div>
          </div>

        </div>

        {/* Bottom banner link to legal terms */}
        <div className="mt-8 pt-6 border-t border-[#EDE8F5] text-center">
          <p className="text-xs sm:text-sm text-[#706A95]">
            Queremos que sientas la misma paz con la que ellos descansan. Puedes consultar la cláusula legal completa en nuestros{' '}
            <Link href="/terminos" className="text-[#1E2A78] font-semibold underline hover:text-[#4A3F6B] transition-colors">
              Términos y Condiciones (Cláusula 4: Compromiso de Perpetuidad)
            </Link>.
          </p>
        </div>

      </div>
    </section>
  );
}
