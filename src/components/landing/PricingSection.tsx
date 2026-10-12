'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

export function PricingSection() {
  const { formatPrice, taxGuarantee, currency } = useCurrency();

  return (
    <section id="planes" className="pt-16 pb-[62px]">
      <div className="text-center mb-10">
        <h2 className="section-title">Su amor ocupó un lugar inmenso en tu vida</h2>
        <p className="body-copy max-w-[700px] mx-auto mt-4 section-subtitle">
          Ahora puedes elegir cómo quieres que su foto aparezca en el mural: como una pequeña luz, como una huella visible o como una constelación que siga brillando para siempre
        </p>
      </div>

      {/* Selector de divisa */}
      <div className="flex items-center justify-center gap-2.5 mb-10">
        <span className="text-xs sm:text-sm font-semibold text-[#5A639C]">Mostrar precios en:</span>
        <CurrencySelector size="md" />
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
            <p className="microcopy mt-2 text-[#5A639C]">Un espacio para tu pequeño</p>
            <div className="plan-price text-[#1E2A78]">{formatPrice('huellita')}</div>
            <span className="plan-meta text-sm text-[#5A639C]">Anual</span>
            
            <ul className="plan-list flex-1 text-[#5A639C]">
              <li>Un trocito de cielo propio (1 espacio)</li>
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
              <li>Un pedacito de cielo ampliado (4 espacios)</li>
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
            <p className="microcopy mt-2 text-[#9A7D63]">El homenaje máximo, se verá más que los demás</p>
            <div className="plan-price text-[#8A6033]">{formatPrice('corazon_eterno')}</div>
            <span className="plan-meta text-sm text-[#9A7D63]">Para siempre</span>
            
            <ul className="plan-list flex-1 text-[#9A7D63]">
              <li>Un gran espacio en el corazón del cielo (9 espacios)</li>
              <li>Tamaño máximo para siempre y más visible que el resto</li>
              <li>Certificado Especial en su Aniversario</li>
              <li>Certificado Corazón Eterno</li>
              <li>Perfil completo en una página propia <span className="text-xs opacity-75 italic">(disponible muy pronto)</span></li>
            </ul>
            
            <Link href="/mural-global" className="btn-secondary-heaven w-full mt-4 !bg-[#EBD5D0] hover:!bg-[#D7BCB6] !text-[#8A6033] !border-none">
              Elige Corazón Eterno
            </Link>
          </div>
        </div>
      </div>

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
