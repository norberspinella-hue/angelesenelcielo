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
      className={`group relative shrink-0 snap-start w-[254px] h-[366px] rounded-[22px] overflow-hidden select-none bg-[#FAF3F7] border border-[#F6DCEB]/95 shadow-[0_8px_28px_rgba(184,60,126,0.14)] hover:shadow-[0_14px_34px_rgba(184,60,126,0.20)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${className}`}
    >
      {/* 1. ZONA SUPERIOR: FOTOGRAFÍA PROTAGONISTA (50% DE ALTURA) */}
      <div className="relative w-full h-[182px] overflow-hidden bg-[#FDF4F8]">
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
          <div className="absolute -bottom-5 -left-5 w-[130px] h-[130px] rounded-full bg-radial from-amber-300/30 via-rose-300/12 to-transparent pointer-events-none blur-md" />
        )}

        {/* Destellos celestiales sutiles */}
        <span className="absolute top-3.5 right-4 text-[#FFEBA3] text-[11px] opacity-85 select-none pointer-events-none [text-shadow:0_0_6px_rgba(255,235,163,0.9)]">✦</span>
        <span className="absolute top-9 right-8 text-[#FFD4EA] text-[8px] opacity-75 select-none pointer-events-none">✨</span>

        {/* Degradado suave de contacto hacia la placa inferior */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#FFFDFB]/85 to-transparent pointer-events-none" />
      </div>

      {/* 2. VELA CELESTIAL SUPERPUESTA (Estática, oficial, sin animación a la llama) */}
      <div className="absolute top-[136px] left-[4px] z-20 w-[84px] h-[102px] pointer-events-none">
        {/* Sombra de contacto */}
        <div className="absolute bottom-1.5 left-3 w-[62px] h-[18px] rounded-full bg-black/15 blur-[4px]" />

        {/* Imagen del tarro oficial de cristal con cera dorada, huella y flores */}
        <div className="relative w-full h-full">
          <Image
            src={
              isLit
                ? '/images/luces/vela-tarro-dorado-transparente.webp'
                : '/images/luces/vela-tarro-dorado-apagada.webp'
            }
            alt={isLit ? 'Vela encendida' : 'Vela apagada'}
            fill
            sizes="84px"
            className="object-contain object-bottom drop-shadow-[0_4px_10px_rgba(232,194,136,0.45)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* 3. FONDO INFERIOR REUTILIZANDO EL MURAL GLOBAL */}
      <div className="absolute inset-x-0 bottom-0 h-[190px] z-[1] pointer-events-none overflow-hidden">
        <Image
          src="/images/mural-preview/card-heaven-front-master.webp"
          alt="Cielo Mural Global"
          fill
          sizes="254px"
          className="object-cover object-bottom opacity-85 saturate-[1.15] brightness-[1.02]"
        />
      </div>

      {/* 4. PLACA INFERIOR MARFIL SEMITRANSLÚCIDA CON ESQUINAS SUPERIORES REDONDEADAS */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-2.5 pb-3 px-4 pl-[66px] bg-[#FFFDFB]/88 backdrop-blur-md rounded-t-[20px] border-t border-white/90 shadow-[0_-3px_14px_rgba(184,60,126,0.05)]">
        {/* Cabecera de la placa: Nombre y Separador Ornamental Dorado */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-playfair font-bold text-[21px] text-[#2D0F31] tracking-[-0.2px] leading-tight">
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
          <p className="font-playfair italic text-[11.5px] leading-[1.32] text-[#4A1B43] line-clamp-3 max-w-[172px]">
            “{candle.dedication || 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor incondicional.'}”
          </p>
        </div>

        {/* Acciones: Botón «♡ Te acompaño» y enlace «Ver su recuerdo →» */}
        <div className="flex flex-col items-center gap-1.5 mt-1 -ml-[52px] w-[222px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendWarmth(candle.id, e);
            }}
            className="w-[188px] h-[34px] rounded-full bg-[#FAF1F7]/95 hover:bg-[#F5E2EF] border border-[#ECC9DE] text-[#843E78] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
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
            className="text-[11px] text-[#843E78] hover:text-[#2D0F31] underline font-medium cursor-pointer transition-colors inline-flex items-center gap-0.5"
          >
            <span>Ver su recuerdo</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
