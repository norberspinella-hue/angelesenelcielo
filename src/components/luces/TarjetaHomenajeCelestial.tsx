'use client';

import React from 'react';
import Image from 'next/image';

export interface CandleHomenajeData {
  id: string;
  petName: string;
  species?: 'perro' | 'gato' | 'otro' | string;
  authorName?: string;
  dedication?: string;
  photoUrl?: string;
  litDate?: string;
  daysRemaining?: number;
  isNeedsReignition?: boolean;
  isEternal?: boolean;
  warmthCount?: number;
  isShelterPet?: boolean;
  shelterName?: string;
  socialHandle?: string;
  anniversaryDate?: string;
  isFromMural?: boolean;
  memorialId?: string | null;
}

interface TarjetaHomenajeCelestialProps<T extends CandleHomenajeData = CandleHomenajeData> {
  candle: T;
  onSendWarmth: (id: string, e: React.MouseEvent) => void;
  onSelect: (candle: T) => void;
  className?: string;
}

export default function TarjetaHomenajeCelestial<T extends CandleHomenajeData = CandleHomenajeData>({
  candle,
  onSendWarmth,
  onSelect,
  className = '',
}: TarjetaHomenajeCelestialProps<T>) {
  const isLit = !candle.isNeedsReignition;

  return (
    <article
      role="article"
      aria-label={`Homenaje celestial a ${candle.petName}`}
      className={`group relative shrink-0 snap-start w-[254px] h-[366px] rounded-[22px] overflow-hidden select-none bg-[#FAF3F7] border border-[#F6DCEB]/95 shadow-[0_8px_28px_rgba(184,60,126,0.14)] hover:shadow-[0_14px_34px_rgba(184,60,126,0.20)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${className}`}
    >
      {/* 1. ZONA SUPERIOR: FOTOGRAFÍA PROTAGONISTA (182px, termina en la unión con el subcontenedor) */}
      <div className="relative w-full h-[182px] overflow-hidden bg-[#FDF4F8] shrink-0">
        <Image
          src={candle.photoUrl || '/images/comunidad/xena.jpg'}
          alt={candle.petName}
          fill
          sizes="254px"
          priority
          className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Resplandor cálido de la vela sobre la esquina inferior izquierda de la foto */}
        {isLit && (
          <div className="absolute -bottom-4 -left-4 w-[120px] h-[120px] rounded-full bg-radial from-amber-300/28 via-rose-300/10 to-transparent pointer-events-none blur-md" />
        )}

        {/* Destellos celestiales sutiles */}
        <span className="absolute top-3.5 right-4 text-[#FFEBA3] text-[11px] opacity-85 select-none pointer-events-none [text-shadow:0_0_6px_rgba(255,235,163,0.9)]">✦</span>
        <span className="absolute top-9 right-8 text-[#FFD4EA] text-[8px] opacity-75 select-none pointer-events-none">✨</span>
      </div>

      {/* 2. VELA OFICIAL SUPERPUESTA EN LA ESQUINA INFERIOR IZQUIERDA */}
      {/* Recurso oficial pilar-enciende-luz.webp con transparencia alfa */}
      <div className="absolute top-[124px] left-[6px] z-25 w-[74px] h-[106px] pointer-events-none">
        {/* Sombra de contacto */}
        <div className="absolute bottom-[2px] left-[10px] w-[54px] h-[14px] rounded-full bg-black/16 blur-[4px]" />

        {/* Imagen de la vela oficial (estática, sin animación, no interactiva) */}
        <div className="relative w-full h-full">
          <Image
            src="/images/luces/pilar-enciende-luz.webp"
            alt="Vela oficial del proyecto"
            fill
            sizes="74px"
            className="object-contain object-bottom drop-shadow-[0_4px_10px_rgba(232,194,136,0.40)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* 3. SUBCONTENEDOR INFERIOR: FONDO VISIBLE DIRECTO DEL MURAL GLOBAL (NUBES CELESTIALES) */}
      <div
        className="relative z-10 flex-1 rounded-t-[20px] overflow-hidden border-t border-white/90 shadow-[0_-3px_14px_rgba(184,60,126,0.08)] flex flex-col justify-between pt-2.5 pb-3 px-3.5 pl-[64px]"
        style={{
          backgroundImage: "url('/images/mural-preview/card-heaven-front-master.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 88%',
        }}
      >
        {/* Velo muy sutil para contraste y legibilidad sin ocultar las nubes */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-white/10 to-[#FFF5FA]/18 pointer-events-none z-0" />

        {/* Cabecera de la placa: Nombre y Separador Ornamental Dorado */}
        <div className="relative z-1 flex flex-col items-center text-center">
          <h3 className="font-playfair font-bold text-[21px] text-[#2D0F31] tracking-[-0.2px] leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]">
            {candle.petName}
          </h3>

          {/* Separador ornamental dorado oficial */}
          <div className="my-1 w-[120px] h-[10px] flex items-center justify-center opacity-95">
            <Image
              src="/images/luces/separador-ornamental-dorado.svg"
              alt="Adorno dorado"
              width={120}
              height={10}
              className="object-contain"
            />
          </div>

          {/* Dedicatoria centrada en cursiva */}
          <p className="font-playfair italic text-[11.5px] leading-[1.32] text-[#381232] line-clamp-3 max-w-[172px] drop-shadow-[0_1px_2px_rgba(255,255,255,0.80)]">
            “{candle.dedication || 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor incondicional.'}”
          </p>
        </div>

        {/* Acciones: Botón «♡ Te acompaño» y enlace «Ver su recuerdo →» */}
        <div className="relative z-1 flex flex-col items-center gap-1.5 mt-1 -ml-[50px] w-[222px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendWarmth(candle.id, e);
            }}
            className="w-[188px] h-[34px] rounded-full bg-white/78 hover:bg-white/92 backdrop-blur-xs border border-[#ECC9DE]/90 text-[#843E78] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_6px_rgba(132,62,120,0.08)] active:scale-95"
          >
            <span className="text-[#C4679B] text-xs">♡</span>
            <span>Te acompaño</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(candle);
            }}
            className="text-[11px] text-[#843E78] hover:text-[#2D0F31] underline font-semibold cursor-pointer transition-colors inline-flex items-center gap-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
          >
            <span>Ver su recuerdo</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
