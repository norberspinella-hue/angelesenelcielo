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
      {/* 1. ZONA SUPERIOR: FOTOGRAFÍA PROTAGONISTA (se extiende hasta 215px para continuar limpiamente detrás de las curvas) */}
      <div className="absolute top-0 left-0 w-full h-[215px] overflow-hidden bg-[#FDF4F8] z-1">
        <Image
          src={candle.photoUrl || '/images/comunidad/xena.jpg'}
          alt={candle.petName}
          fill
          sizes="254px"
          priority
          className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Resplandor cálido sutil de luz (sin estrellas artificiales) */}
        {isLit && (
          <div className="absolute bottom-5 -left-4 w-[100px] h-[100px] rounded-full bg-radial from-amber-300/20 via-rose-300/5 to-transparent pointer-events-none blur-md" />
        )}
      </div>

      {/* 2. SUBCONTENEDOR INFERIOR: ESQUINAS REDONDEADAS RESTAURADAS rounded-t-[20px] Y FONDO DIRECTO DEL MURAL */}
      <div
        className="absolute bottom-0 left-0 w-full h-[190px] z-10 rounded-t-[20px] overflow-hidden shadow-[0_-4px_16px_rgba(184,60,126,0.10)] flex flex-col justify-between pt-2.5 pb-3 px-3.5"
        style={{
          backgroundImage: "url('/images/mural-preview/card-heaven-front-master.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      >
        {/* VELA OFICIAL SUPERPUESTA: Íntegramente dentro del subcontenedor inferior (esquina superior izquierda) */}
        <div className="absolute top-1.5 left-2 z-20 w-[48px] h-[68px] pointer-events-none">
          {/* Sombra de contacto */}
          <div className="absolute bottom-[2px] left-[6px] w-[36px] h-[10px] rounded-full bg-black/16 blur-[3px]" />

          {/* Imagen oficial pilar-enciende-luz.webp (estática, sin animación, no interactiva) */}
          <div className="relative w-full h-full">
            <Image
              src="/images/luces/pilar-enciende-luz.webp"
              alt="Vela oficial del proyecto"
              fill
              sizes="48px"
              className="object-contain object-bottom drop-shadow-[0_2px_8px_rgba(232,194,136,0.50)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Cabecera del subcontenedor: Nombre y Separador Ornamental 100% CENTRADOS respecto al ancho total */}
        <div className="relative z-1 flex flex-col items-center text-center w-full">
          <h3 className="font-playfair font-bold text-[21px] text-[#2D0F31] tracking-[-0.2px] leading-tight drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
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
          <p className="font-playfair italic text-[11.5px] leading-[1.32] text-[#381232] line-clamp-3 max-w-[172px] drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
            “{candle.dedication || 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor incondicional.'}”
          </p>
        </div>

        {/* Acciones: Botón «♡ Te acompaño» y enlace «Ver su recuerdo →» 100% CENTRADOS */}
        <div className="relative z-1 flex flex-col items-center gap-1.5 mt-1 w-full">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendWarmth(candle.id, e);
            }}
            className="w-[188px] h-[34px] rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-xs border border-[#ECC9DE]/90 text-[#843E78] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_6px_rgba(132,62,120,0.10)] active:scale-95"
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
            className="text-[11px] text-[#843E78] hover:text-[#2D0F31] underline font-semibold cursor-pointer transition-colors inline-flex items-center gap-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
          >
            <span>Ver su recuerdo</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
