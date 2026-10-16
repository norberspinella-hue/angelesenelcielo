'use client';

import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { PLANS, slotsLabel } from '@/lib/plans';

export function OfferStrip() {
  const { formatPrice } = useCurrency();

  return (
    <div className="offer-strip bg-white/40 backdrop-blur-md rounded-[32px] shadow-sm border border-white/60">
      <div className="offer-item py-4 sm:py-6 px-4 sm:px-8">
        <div className="flex-shrink-0 flex items-center justify-center w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Recuerdo Inicial" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-100" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] text-lg sm:text-xl font-bold whitespace-nowrap">Huellita</h3>
          <p className="offer-detail text-xs sm:text-sm text-[#706A95]">{`Ocupa ${slotsLabel(PLANS.huellita)} en el mural`}</p>
          <div className="offer-price text-xl sm:text-2xl font-black text-[#1E2A78]">
            {formatPrice('huellita')}
            <span className="offer-period text-xs sm:text-sm font-normal text-[#706A95] ml-1">/ año</span>
          </div>
        </div>
      </div>
      
      <div className="offer-item py-4 sm:py-6 px-4 sm:px-8">
        <div className="flex-shrink-0 flex items-center justify-center w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella Anual" width={235} height={235} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-100" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] text-lg sm:text-xl font-bold whitespace-nowrap">Estrella Brillante</h3>
          <p className="offer-detail text-xs sm:text-sm text-[#706A95]">{`Ocupa ${slotsLabel(PLANS.estrella_brillante)} en el mural`}</p>
          <div className="offer-price text-xl sm:text-2xl font-black text-[#1E2A78]">
            {formatPrice('estrella_brillante')}
          </div>
        </div>
      </div>
      
      <div className="offer-item py-4 sm:py-6 px-4 sm:px-8">
        <div className="flex-shrink-0 flex items-center justify-center w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Recuerdo Eterno" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-100" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] text-lg sm:text-xl font-bold whitespace-nowrap">Corazón Eterno</h3>
          <p className="offer-detail text-xs sm:text-sm text-[#706A95]">
            {`Ocupa ${slotsLabel(PLANS.corazon_eterno)} en el mural`}{' '}<span className="font-normal">para siempre</span>
          </p>
          <div className="offer-price text-xl sm:text-2xl font-black text-[#1E2A78]">
            {formatPrice('corazon_eterno')}
          </div>
        </div>
      </div>
    </div>
  );
}
