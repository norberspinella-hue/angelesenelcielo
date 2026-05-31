import Image from 'next/image';

export function OfferStrip() {
  return (
    <div className="offer-strip bg-white/40 backdrop-blur-md rounded-[32px] shadow-sm border border-white/60">
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Recuerdo Inicial" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Recuerdo Inicial</h3>
          <div className="offer-price">1,99 €</div>
          <p className="offer-detail">Ocupa 1 slot en el mural</p>
        </div>
      </div>
      
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella Anual" width={235} height={235} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Estrella Anual</h3>
          <div className="offer-price">
            4,99 € <span className="text-sm font-normal text-[#706A95]">/ año</span>
          </div>
          <p className="offer-detail">Ocupa 4 slots en el mural</p>
        </div>
      </div>
      
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Recuerdo Eterno" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Recuerdo Eterno</h3>
          <div className="offer-price">
            9,99 € <span className="text-sm font-normal text-[#706A95]">pago único</span>
          </div>
          <p className="offer-detail">Ocupa 9 slots en el mural</p>
        </div>
      </div>
    </div>
  );
}
