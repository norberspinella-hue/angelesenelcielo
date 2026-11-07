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
  const isEternal = Boolean(candle.isEternal);

  return (
    <article
      role="article"
      aria-label={`Homenaje celestial a ${candle.petName}`}
      className={`group relative shrink-0 snap-start w-[254px] h-[366px] rounded-[22px] overflow-hidden select-none bg-gradient-to-b from-[#FFFDFE] via-[#FAF3F7] to-[#F5E4ED] border border-[#F6DCEB]/95 shadow-[0_8px_26px_rgba(184,60,126,0.12)] hover:shadow-[0_14px_34px_rgba(184,60,126,0.20)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${className}`}
    >
      {/* 1. ZONA SUPERIOR: FOTOGRAFÍA PROTAGONISTA (48-52% DE ALTURA) */}
      <div className="relative w-full h-[184px] overflow-hidden bg-gradient-to-b from-[#FAF1F7] to-[#F5E4ED]">
        <Image
          src={candle.photoUrl || '/images/comunidad/xena.jpg'}
          alt={candle.petName}
          fill
          sizes="254px"
          priority
          className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Resplandor cálido sutil de la vela sobre la esquina inferior izquierda de la foto */}
        {isLit && (
          <div
            className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-radial from-amber-300/35 via-rose-300/15 to-transparent pointer-events-none blur-md animate-pulse"
            style={{ animationDuration: '4s' }}
          />
        )}

        {/* Degradado suave de contacto hacia la placa inferior */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#FAF3EF]/80 to-transparent pointer-events-none" />
      </div>

      {/* 2. VELA CELESTIAL SUPERPUESTA EN LA ESQUINA INFERIOR IZQUIERDA DE LA FOTOGRAFÍA */}
      <div className="absolute top-[138px] left-[4px] z-20 w-[84px] h-[102px] pointer-events-none">
        {/* Sombra de contacto */}
        <div className="absolute bottom-2 left-3 w-16 h-5 rounded-full bg-black/15 blur-sm" />

        {/* Imagen del tarro translúcido con cera dorada, huella y flores */}
        <div className="relative w-full h-full">
          <Image
            src={
              isLit
                ? '/images/luces/vela-tarro-dorado-transparente.webp'
                : '/images/luces/vela-tarro-dorado-apagada.webp'
            }
            alt={isLit ? 'Vela encendida' : 'Vela apagada que espera reencendido'}
            fill
            sizes="84px"
            className={`object-contain object-bottom drop-shadow-[0_4px_10px_rgba(232,194,136,0.45)] transition-transform duration-500 group-hover:scale-105`}
          />

          {/* Llama viva animada con oscilación y resplandor suave */}
          {isLit && (
            <div
              className={`absolute top-[4px] left-[35px] w-[14px] h-[22px] rounded-full pointer-events-none ${
                isEternal
                  ? 'bg-amber-300/40 blur-[2px] animate-pulse'
                  : 'bg-amber-200/35 blur-[1.5px] animate-pulse'
              }`}
              style={{
                animationDuration: isEternal ? '2.5s' : '3.2s',
              }}
            />
          )}
        </div>
      </div>

      {/* 3. PLACA INFERIOR MARFIL ROSADA CON ESQUINAS SUPERIORES REDONDEADAS */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-3 pb-3 px-4 bg-gradient-to-b from-[#FAF4F0]/95 via-[#FCF6F3]/95 to-[#F8EFF4]/95 backdrop-blur-xs rounded-t-[20px] border-t border-[#F6E2EE]/80 shadow-[0_-4px_16px_rgba(184,60,126,0.04)] pl-[68px]">
        {/* Cabecera de la placa: Nombre y Separador Ornamental Dorado */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-playfair font-bold text-[21px] text-[#2D0F31] tracking-tight leading-tight">
            {candle.petName}
          </h3>

          {/* Separador ornamental dorado de la identidad oficial */}
          <div className="my-1 w-[120px] h-[10px] flex items-center justify-center opacity-90">
            <Image
              src="/images/luces/separador-ornamental-dorado.svg"
              alt="Adorno dorado"
              width={120}
              height={10}
              className="object-contain"
            />
          </div>

          {/* Dedicatoria centrada en cursiva */}
          <p className="font-playfair italic text-[11.5px] leading-[1.3] text-[#4A1B43] line-clamp-3 max-w-[172px]">
            “{candle.dedication || 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor incondicional.'}”
          </p>
        </div>

        {/* Acciones: Botón «♡ Te acompaño» y enlace «Ver su recuerdo →» */}
        <div className="flex flex-col items-center gap-1.5 mt-1 -ml-[54px] w-[222px]">
          <button
            type="button"
            onClick={(e) => onSendWarmth(candle.id, e)}
            className="w-[188px] h-[34px] rounded-full bg-[#FAF1F7] hover:bg-[#F5E2EF] border border-[#ECC9DE] text-[#843E78] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-[#C4679B] text-xs">♡</span>
            <span>Te acompaño</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(candle)}
            className="text-[11px] text-[#843E78] hover:text-[#2D0F31] underline font-medium cursor-pointer transition-colors inline-flex items-center gap-0.5"
          >
            <span>Ver su recuerdo</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 4. NUBES ROSA-LAVANDA EN LA BASE Y BORDE LUMINOSO */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#EACAD8]/40 to-transparent pointer-events-none" />
    </article>
  );
}
