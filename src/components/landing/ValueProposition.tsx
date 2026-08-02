import Image from 'next/image';

export function ValueProposition() {
  return (
    <section id="como-funciona" className="value-proposition-section">
      <div className="section-header text-center mb-12 px-6">
        <h2 className="section-title text-[#1E2A78]">Comparte la historia de tu peque</h2>
        <p className="text-[#706A95] max-w-2xl mx-auto mt-4 section-subtitle">
          Honra la vida de tu angelito, manten vivo su recuerdo para siempre<br />en el mural más grande del mundo
        </p>
        <p className="text-[#1E2A78] font-semibold mt-4 text-lg">
          Explica al mundo como era tu peque:
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6 max-w-[1200px] mx-auto px-6">
        
        {/* Card 1 */}
        <div className="value-proposition-card relative overflow-hidden text-center transition-shadow hover:shadow-md group">
          <Image src="/images/placeholders/first.webp" alt="Fondo vida" fill className="object-cover z-0 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-white/20 z-0 transition-opacity duration-700 group-hover:bg-white/0" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Image src="/images/icons/story/icon-pregunta-vida.svg" alt="Pregunta Vida" width={160} height={160} className="mix-blend-multiply" />
            </div>
            <h3 className="text-[#1E2A78] font-bold text-lg mb-4">¿Cómo llegó a tu vida?</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="value-proposition-card relative overflow-hidden text-center transition-shadow hover:shadow-md group">
          <Image src="/images/placeholders/two.webp" alt="Fondo gustaba" fill className="object-cover z-0 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-white/20 z-0 transition-opacity duration-700 group-hover:bg-white/0" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Image src="/images/icons/story/icon-pregunta-gustaba.svg" alt="Pregunta Gustaba" width={160} height={160} className="mix-blend-multiply" />
            </div>
            <h3 className="text-[#1E2A78] font-bold text-lg mb-4">¿Qué era lo que más le gustaba?</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="value-proposition-card relative overflow-hidden text-center transition-shadow hover:shadow-md group">
          <Image src="/images/placeholders/three.webp" alt="Fondo huella" fill className="object-cover z-0 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-white/20 z-0 transition-opacity duration-700 group-hover:bg-white/0" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Image src="/images/icons/story/icon-pregunta-huella.svg" alt="Pregunta Huella" width={160} height={160} className="mix-blend-multiply" />
            </div>
            <h3 className="text-[#1E2A78] font-bold text-lg mb-4">¿Qué huella dejó en tu corazón?</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="value-proposition-card relative overflow-hidden text-center transition-shadow hover:shadow-md group">
          <Image src="/images/placeholders/last.webp" alt="Fondo abrazo" fill className="object-cover z-0 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-white/20 z-0 transition-opacity duration-700 group-hover:bg-white/0" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Image src="/images/icons/story/icon-pregunta-abrazo.svg" alt="Pregunta Abrazo" width={160} height={160} className="mix-blend-multiply" />
            </div>
            <h3 className="text-[#1E2A78] font-bold text-lg mb-4">¿Qué le dirías si pudieras abrazarlo una vez más?</h3>
          </div>
        </div>

      </div>
      
      <div className="text-center mt-12 hidden">
      </div>
    </section>
  );
}
