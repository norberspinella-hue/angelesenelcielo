import Image from 'next/image';

export function OfferStrip() {
  return (
    <div className="offer-strip bg-white/40 backdrop-blur-md rounded-[32px] shadow-sm border border-white/60">
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Recuerdo Inicial" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Huellita</h3>
          <p className="offer-detail">Ocupa 1 espacio en el mural</p>
          <div className="offer-price">
            1,99 €
            <span className="offer-period text-[17px] font-normal text-[#706A95]">/ año</span>
          </div>
        </div>
      </div>
      
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella Anual" width={235} height={235} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Estrella Brillante</h3>
          <p className="offer-detail">Ocupa 4 espacios en el mural</p>
          <div className="offer-price">
            4,99 €
          </div>
        </div>
      </div>
      
      <div className="offer-item">
        <div className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] relative mr-2">
          <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Recuerdo Eterno" width={224} height={224} className="mix-blend-multiply absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="offer-title text-[#394B87] whitespace-nowrap">Corazón Eterno</h3>
          <p className="offer-detail">
            Ocupa 9 espacios en el mural <span className="text-[17px] font-normal text-[#706A95]">para siempre</span>
          </p>
          <div className="offer-price">
            9,99 €
          </div>
        </div>
      </div>
    </div>
  );
}
