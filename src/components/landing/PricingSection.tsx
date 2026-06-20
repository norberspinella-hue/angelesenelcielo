import Link from 'next/link';
import Image from 'next/image';

export function PricingSection() {
  return (
    <section id="planes" className="pt-16 pb-[62px]">
      <div className="text-center mb-16">
        <h2 className="section-title">Su amor ocupó un lugar inmenso en tu vida</h2>
        <p className="body-copy max-w-[700px] mx-auto mt-4">
          Ahora puedes elegir cómo quieres que su foto aparezca en el mural: como una pequeña luz, como una huella visible o como una constelación que siga brillando para siempre
        </p>
      </div>

      <div className="pricing-grid">
        {/* Plan 1 */}
        <div className="plan-card heaven-card flex flex-col relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
          <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
            <Image src="/images/placeholders/first.webp" alt="Fondo Recuerdo Inicial" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full flex-1">
            <h3 className="plan-title text-[#1E2A78]">Huellita</h3>
            <p className="microcopy mt-2 text-[#5A639C]">Un espacio sencillo y eterno para siempre</p>
            <div className="plan-price text-[#1E2A78]">1,99 €</div>
            <span className="plan-meta text-sm text-[#5A639C]">Pago único (IVA incluido)</span>
            
            <ul className="plan-list flex-1 text-[#5A639C]">
              <li>1 bloque en el mural (1x1)</li>
              <li>Perfil público para siempre</li>
              <li>Sube su mejor foto</li>
              <li>Escribe su historia y dedicatoria</li>
            </ul>
            
            <Link href="/mural-global" className="btn-inicial-heaven w-full mt-4 text-center">
              Elegir Inicial
            </Link>
          </div>
        </div>

        {/* Plan 2 */}
        <div className="plan-card heaven-card is-featured flex flex-col relative group shadow-[0_0_15px_rgba(255,215,100,0.8),_0_0_40px_rgba(240,160,50,0.6)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
          <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
            <Image src="/images/placeholders/first.webp" alt="Fondo Estrella Anual" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
          </div>
          
          <div className="plan-badge bg-[#1E2A78] text-white">El más elegido</div>
          <div className="relative z-10 flex flex-col h-full flex-1">
            <h3 className="plan-title text-[#1E2A78]">Estrella Brillante</h3>
            <p className="microcopy mt-2 text-[#5A639C]">Mayor visibilidad renovable cada año</p>
            <div className="plan-price text-[#1E2A78]">4,99€</div>
            <span className="plan-meta text-sm text-[#5A639C]">Al año (IVA incluido)</span>
            
            <ul className="plan-list flex-1 text-[#5A639C]">
              <li>4 bloques en el mural (2x2)</li>
              <li>Destaca más visualmente</li>
              <li>Perfil público enriquecido</li>
              <li>Recordatorio especial de aniversario</li>
            </ul>
            
            <Link href="/mural-global" className="btn-estrella-heaven w-full mt-4 text-center">
              Elegir Estrella
            </Link>
          </div>
        </div>

        {/* Plan 3 */}
        <div className="plan-card heaven-card flex flex-col relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
          <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
            <Image src="/images/placeholders/two.webp" alt="Fondo Recuerdo Eterno" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full flex-1">
            <h3 className="plan-title text-[#8A6033]">Corazón Eterno</h3>
            <p className="microcopy mt-2 text-[#9A7D63]">El homenaje máximo, sin renovaciones</p>
            <div className="plan-price text-[#8A6033]">9,99€</div>
            <span className="plan-meta text-sm text-[#9A7D63]">Pago único (IVA incluido)</span>
            
            <ul className="plan-list flex-1 text-[#9A7D63]">
              <li>9 bloques en el mural (3x3)</li>
              <li>Tamaño máximo para siempre</li>
              <li>Perfil público destacado</li>
              <li>Un legado inborrable en el centro</li>
            </ul>
            
            <Link href="/mural-global" className="btn-secondary-heaven w-full mt-4 !bg-[#EBD5D0] hover:!bg-[#D7BCB6] !text-[#8A6033] !border-none">
              Elegir Eterno
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
