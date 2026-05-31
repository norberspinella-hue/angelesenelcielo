import Link from 'next/link';

export function PricingSection() {
  return (
    <section id="planes" className="pt-16 pb-[62px]">
      <div className="text-center mb-16">
        <h2 className="section-title">Elige cómo mantener su luz encendida</h2>
        <p className="body-copy max-w-[600px] mx-auto mt-4">
          Opciones accesibles para que el recuerdo de tu compañero perdure, 
          con diferentes niveles de protagonismo en nuestro mural global.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Plan 1 */}
        <div className="plan-card heaven-card flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#ede1ff', borderColor: 'white', borderWidth: '2px' }}>
          <h3 className="plan-title text-[#1E2A78]">Recuerdo Inicial</h3>
          <p className="microcopy mt-2 text-[#5A639C]">Un espacio sencillo y eterno para siempre</p>
          <div className="plan-price text-[#1E2A78]">1,99 €</div>
          <span className="plan-meta text-sm text-[#5A639C]">Pago único (IVA incluido)</span>
          
          <ul className="plan-list flex-1 text-[#5A639C]">
            <li>1 bloque en el mural (1x1)</li>
            <li>Perfil público para siempre</li>
            <li>Sube su mejor foto</li>
            <li>Escribe su historia y dedicatoria</li>
          </ul>
          
          <Link href="/mural-global" className="w-full mt-4 flex items-center justify-center min-h-[52px] rounded-full text-[#1E2A78] font-normal shadow-[0_4px_14px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]" style={{ backgroundColor: 'white', border: '1px solid white' }}>
            Elegir Inicial
          </Link>
        </div>

        {/* Plan 2 */}
        <div className="plan-card heaven-card is-featured flex flex-col shadow-[0_0_15px_rgba(255,215,100,0.8),_0_0_40px_rgba(240,160,50,0.6)]" style={{ backgroundColor: '#ede1ff', borderColor: 'white', borderWidth: '2px' }}>
          <div className="plan-badge bg-[#1E2A78] text-white">El más elegido</div>
          <h3 className="plan-title text-[#1E2A78]">Estrella Anual</h3>
          <p className="microcopy mt-2 text-[#5A639C]">Mayor visibilidad renovable cada año</p>
          <div className="plan-price text-[#1E2A78]">4,99€</div>
          <span className="plan-meta text-sm text-[#5A639C]">Al año (IVA incluido)</span>
          
          <ul className="plan-list flex-1 text-[#5A639C]">
            <li>4 bloques en el mural (2x2)</li>
            <li>Destaca más visualmente</li>
            <li>Perfil público enriquecido</li>
            <li>Recordatorio especial de aniversario</li>
          </ul>
          
          <Link href="/mural-global" className="w-full mt-4 flex items-center justify-center min-h-[52px] rounded-full text-white font-normal shadow-[0_8px_20px_rgba(30,42,120,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(30,42,120,0.4)]" style={{ background: 'linear-gradient(to right, #2C3B96, #1E2A78)' }}>
            Elegir Estrella
          </Link>
        </div>

        {/* Plan 3 */}
        <div className="plan-card heaven-card flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#FCF5EE', borderColor: 'white', borderWidth: '2px' }}>
          <h3 className="plan-title text-[#8A6033]">Recuerdo Eterno</h3>
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
    </section>
  );
}
