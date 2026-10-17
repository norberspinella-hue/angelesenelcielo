'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { PLANS, slotsLabel } from '@/lib/plans';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

export function PricingSection() {
  const { formatPrice, taxGuarantee, currency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'esenciales' | 'grandes'>('esenciales');

  return (
    <section id="planes" className="pt-16 pb-[62px]">
      <div className="text-center mb-8">
        <h2 className="section-title">Su amor ocupó un lugar inmenso en tu vida</h2>
        <p className="body-copy max-w-[700px] mx-auto mt-4 section-subtitle">
          Ahora puedes elegir cómo quieres que su foto aparezca en el mural: como una pequeña luz, como una huella visible o como una gran constelación que siga brillando para siempre
        </p>
      </div>

      {/* Selector de divisa */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <span className="text-xs sm:text-sm font-semibold text-[#5A639C]">Mostrar precios en:</span>
        <CurrencySelector size="md" />
      </div>

      {/* Pestañas de categoría de planes */}
      <div className="flex justify-center mb-10 px-4">
        <div className="inline-flex p-1.5 rounded-full bg-[#EDE8F5]/90 backdrop-blur-sm border border-white/80 shadow-sm max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('esenciales')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'esenciales'
                ? 'bg-[#1E2A78] text-white shadow-md'
                : 'text-[#5A639C] hover:text-[#1E2A78]'
            }`}
          >
            ✨ Planes Esenciales (1x1, 2x2, 3x3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grandes')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'grandes'
                ? 'bg-[#1E2A78] text-white shadow-md'
                : 'text-[#5A639C] hover:text-[#1E2A78]'
            }`}
          >
            <span>🌟 Grandes Homenajes (4x4, 5x5, 6x6)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A961] text-white font-bold tracking-wider">
              NUEVO
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'esenciales' ? (
        <>
          <div className="pricing-grid animate-in fade-in duration-300">
            {/* Plan 1 */}
            <div className="plan-card heaven-card flex flex-col relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
              <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
                <Image src="/images/placeholders/first.webp" alt="Fondo Recuerdo Inicial" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full flex-1">
                <h3 className="plan-title text-[#1E2A78]">Huellita</h3>
                <p className="microcopy mt-2 text-[#5A639C]">Un espacio para tu pequeño</p>
                <div className="plan-price text-[#1E2A78]">{formatPrice('huellita')}</div>
                <span className="plan-meta text-sm text-[#5A639C]">Anual</span>
                
                <ul className="plan-list flex-1 text-[#5A639C]">
                  <li>{`Un trocito de cielo propio (${slotsLabel(PLANS.huellita)})`}</li>
                  <li>Sube su foto más bonita</li>
                  <li>Escribe su historia y dedicatoria</li>
                  <li>
                    Certificado Huellita
                    <span className="block text-xs text-[#706A95] opacity-80 italic mt-0.5">
                      Para los 100 primeros angelitos
                    </span>
                  </li>
                </ul>
                
                <Link href="/mural-global" className="btn-inicial-heaven w-full mt-4 text-center">
                  Elige Huellita
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
                <p className="microcopy mt-2 text-[#5A639C]">Mayor visibilidad para siempre</p>
                <div className="plan-price text-[#1E2A78]">{formatPrice('estrella_brillante')}</div>
                <span className="plan-meta text-sm text-[#5A639C]">Para siempre</span>
                
                <ul className="plan-list flex-1 text-[#5A639C]">
                  <li>{`Un pedacito de cielo ampliado (${slotsLabel(PLANS.estrella_brillante)})`}</li>
                  <li>La foto de tu peque se verá más en el mural</li>
                  <li>Brillo durante la semana de su aniversario</li>
                  <li>Certificado Estrella</li>
                </ul>
                
                <Link href="/mural-global" className="btn-estrella-heaven w-full mt-4 text-center">
                  Elige Estrella Brillante
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
                <p className="microcopy mt-2 text-[#9A7D63]">Ángel Fundador en el centro del cielo</p>
                <div className="plan-price text-[#8A6033]">{formatPrice('corazon_eterno')}</div>
                <span className="plan-meta text-sm text-[#9A7D63]">Para siempre</span>
                
                <ul className="plan-list flex-1 text-[#9A7D63]">
                  <li>{`Un gran espacio en el corazón del cielo (${slotsLabel(PLANS.corazon_eterno)})`}</li>
                  <li>Espacio de Ángel Fundador en la zona central</li>
                  <li>Certificado Especial en su Aniversario</li>
                  <li>Certificado Corazón Eterno</li>
                  <li>Página propia conmemorativa para compartir su historia</li>
                </ul>
                
                <Link href="/mural-global" className="btn-secondary-heaven w-full mt-4 !bg-[#EBD5D0] hover:!bg-[#D7BCB6] !text-[#8A6033] !border-none">
                  Elige Corazón Eterno
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setActiveTab('grandes')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8B6BB5] hover:text-[#1E2A78] transition-colors group cursor-pointer"
            >
              <span>¿Buscas un espacio más grande e imponente para tu angelito?</span>
              <span className="underline group-hover:translate-x-0.5 transition-transform font-bold">Ver Grandes Homenajes (4x4, 5x5 y 6x6) →</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="pricing-grid animate-in fade-in duration-300">
            {/* Plan 4: Ángelito Protector (4x4) */}
            <div className="plan-card heaven-card flex flex-col relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
              <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
                <Image src="/images/placeholders/first.webp" alt="Fondo Ángelito Protector" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
              </div>
              
              <div className="plan-badge bg-[#394B87] text-white">4×4 en el cielo</div>
              <div className="relative z-10 flex flex-col h-full flex-1">
                <h3 className="plan-title text-[#1E2A78]">Ángelito Protector</h3>
                <p className="microcopy mt-2 text-[#5A639C]">Un gran tributo de 16 casillas continuas</p>
                <div className="plan-price text-[#1E2A78]">{formatPrice('angelito_protector')}</div>
                <span className="plan-meta text-sm text-[#5A639C]">Para siempre</span>
                
                <ul className="plan-list flex-1 text-[#5A639C]">
                  <li>{`Un gran bloque continuo en el cielo (${slotsLabel(PLANS.angelito_protector)})`}</li>
                  <li>4 veces más grande que Estrella Brillante</li>
                  <li>Gran visibilidad desde cualquier ángulo del mural</li>
                  <li>Certificado Especial Ángelito Protector</li>
                  <li>Página conmemorativa propia para compartir</li>
                </ul>
                
                <Link href="/mural-global" className="btn-inicial-heaven w-full mt-4 text-center">
                  Elige Ángelito Protector
                </Link>
              </div>
            </div>

            {/* Plan 5: Galaxia de Amor (5x5) */}
            <div className="plan-card heaven-card flex flex-col relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: '#EDE8F5', borderColor: 'white', borderWidth: '2px' }}>
              <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
                <Image src="/images/placeholders/first.webp" alt="Fondo Galaxia de Amor" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
              </div>
              
              <div className="plan-badge bg-[#8B6BB5] text-white">5×5 Constelación</div>
              <div className="relative z-10 flex flex-col h-full flex-1">
                <h3 className="plan-title text-[#1E2A78]">Galaxia de Amor</h3>
                <p className="microcopy mt-2 text-[#5A639C]">Una presencia estelar majestuosa</p>
                <div className="plan-price text-[#1E2A78]">{formatPrice('galaxia_amor')}</div>
                <span className="plan-meta text-sm text-[#5A639C]">Para siempre</span>
                
                <ul className="plan-list flex-1 text-[#5A639C]">
                  <li>{`Un espacio estelar privilegiado (${slotsLabel(PLANS.galaxia_amor)})`}</li>
                  <li>Resplandor visible al explorar el cielo</li>
                  <li>Certificado Especial Galaxia de Amor</li>
                  <li>Página conmemorativa propia en alta resolución</li>
                  <li>Brillo conmemorativo en su fecha especial</li>
                </ul>
                
                <Link href="/mural-global" className="btn-estrella-heaven w-full mt-4 text-center">
                  Elige Galaxia de Amor
                </Link>
              </div>
            </div>

            {/* Plan 6: Vínculo Infinito (6x6) */}
            <div className="plan-card heaven-card is-featured flex flex-col relative group shadow-[0_0_20px_rgba(201,169,97,0.85),_0_0_45px_rgba(180,130,40,0.5)]" style={{ backgroundColor: '#EDE8F5', borderColor: '#C9A961', borderWidth: '2px' }}>
              <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
                <Image src="/images/placeholders/two.webp" alt="Fondo Vínculo Infinito" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white/20 transition-opacity duration-700 group-hover:bg-white/0" />
              </div>
              
              <div className="plan-badge bg-[#8A6033] text-white">6×6 El Mayor Tributo</div>
              <div className="relative z-10 flex flex-col h-full flex-1">
                <h3 className="plan-title text-[#8A6033]">Vínculo Infinito</h3>
                <p className="microcopy mt-2 text-[#9A7D63]">El memorial supremo y más grande del cielo</p>
                <div className="plan-price text-[#8A6033]">{formatPrice('vinculo_infinito')}</div>
                <span className="plan-meta text-sm text-[#9A7D63]">Para siempre</span>
                
                <ul className="plan-list flex-1 text-[#9A7D63]">
                  <li>{`El espacio más grande de todo el mural (${slotsLabel(PLANS.vinculo_infinito)})`}</li>
                  <li>Visible incluso con el zoom alejado al máximo</li>
                  <li>Aureola y corona de luz celestial única</li>
                  <li>Certificado de Honor Vínculo Infinito</li>
                  <li>Página propia conmemorativa con galería completa</li>
                </ul>
                
                <Link href="/mural-global" className="btn-secondary-heaven w-full mt-4 !bg-[#C9A961] hover:!bg-[#B3934B] !text-white !border-none font-bold shadow-md">
                  Elige Vínculo Infinito
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setActiveTab('esenciales')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8B6BB5] hover:text-[#1E2A78] transition-colors group cursor-pointer"
            >
              <span>←</span>
              <span className="underline font-bold">Volver a los planes esenciales (Huellita, Estrella, Corazón)</span>
            </button>
          </div>
        </>
      )}

      {/* Garantía de precios transparentes */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 text-xs sm:text-sm font-medium text-[#706A95]">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">✓</span> {taxGuarantee}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">✓</span> Pago único · Sin suscripciones ni renovaciones
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">✓</span> Activo durante la duración del proyecto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">✓</span> {currency === 'EUR' ? 'Pagos internacionales con conversión automática a tu divisa' : 'Pagos seguros procesados con Stripe'}
        </span>
      </div>

      {/* Aclaración para empresas */}
      <p className="text-center italic mt-10 text-sm sm:text-base font-medium text-[#8B6BB5] tracking-wide">
        Si eres empresa y quieres un espacio, contacta vía{' '}
        <a 
          href="https://wa.me/34690196207?text=Hola,%20somos%20una%20empresa%20y%20nos%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20un%20espacio%20en%20el%20mural%20de%20%C3%81ngeles%20en%20el%20Cielo"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#6D4C99] transition-colors"
        >
          whatsapp
        </a>{' '}
        o{' '}
        <Link 
          href="/contacto" 
          className="underline hover:text-[#6D4C99] transition-colors"
        >
          email
        </Link>.
      </p>
    </section>
  );
}
