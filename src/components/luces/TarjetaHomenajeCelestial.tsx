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

/**
 * Recorta la dedicatoria priorizando que termine en una frase completa con sentido
 */
function getSentenceSnippet(text?: string, targetLength: number = 95): string {
  if (!text) return 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor.';
  const clean = text.trim();
  if (clean.length <= targetLength) return clean;

  // Buscar el primer punto que cierre frase a partir de un largo razonable
  const firstPeriod = clean.indexOf('.', 35);
  if (firstPeriod !== -1 && firstPeriod <= targetLength + 25) {
    return clean.slice(0, firstPeriod + 1);
  }

  // Buscar última palabra antes del límite para no cortar letras a medias
  const lastSpace = clean.lastIndexOf(' ', targetLength);
  const cutoff = lastSpace > 25 ? lastSpace : targetLength;
  return clean.slice(0, cutoff).replace(/[,;:\s]+$/, '') + '…';
}

export default function TarjetaHomenajeCelestial<T extends CandleHomenajeData = CandleHomenajeData>({
  candle,
  onSendWarmth,
  onSelect,
  className = '',
}: TarjetaHomenajeCelestialProps<T>) {
  const isLit = !candle.isNeedsReignition;
  const dedicationSnippet = getSentenceSnippet(candle.dedication);

  return (
    <article
      role="article"
      aria-label={`Homenaje celestial a ${candle.petName}`}
      className={`group relative shrink-0 snap-center md:snap-start w-[256px] h-[376px] rounded-[22px] overflow-visible select-none transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${className}`}
      style={{
        isolation: 'isolate',
        boxShadow: `
          0 0 5px 1.5px rgba(255, 240, 225, 0.98),
          0 0 14px 4px rgba(255, 202, 190, 0.80),
          0 0 28px 7px rgba(244, 166, 175, 0.48),
          0 0 46px 12px rgba(226, 141, 170, 0.25),
          0 12px 28px rgba(116, 52, 90, 0.12)
        `,
      }}
    >
      {/* Halo y Borde Oro Rosa Luminoso Externo */}
      <div
        className="absolute -inset-[1.5px] rounded-[23.5px] pointer-events-none z-30"
        style={{
          padding: '2px',
          background: 'linear-gradient(135deg, #FFF9ED 0%, #FFD8C7 22%, #F1B2BD 45%, #FFE7CB 68%, #FFF7E9 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Contenedor Estructural Interior */}
      <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-[#FAF3F7] shadow-[inset_0_0_8px_rgba(255,251,236,0.65)] flex flex-col">
        
        {/* ================================================================= */}
        {/* 1. ZONA SUPERIOR: FOTOGRAFÍA RETRATO PROTAGONISTA (Más amplia)    */}
        {/* ================================================================= */}
        <div className="absolute top-0 left-0 w-full h-[225px] overflow-hidden bg-[#FDF4F8] z-1">
          <Image
            src={candle.photoUrl || '/images/comunidad/xena.jpg'}
            alt={candle.petName}
            fill
            sizes="256px"
            priority
            className="object-cover object-[center_24%] group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Resplandor cálido sutil de luz */}
          {isLit && (
            <div className="absolute bottom-5 -left-4 w-[100px] h-[100px] rounded-full bg-radial from-amber-300/20 via-rose-300/5 to-transparent pointer-events-none blur-md" />
          )}

          {/* Cifra de abrazos con protagonismo visual moderado (discreto, elegante) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSendWarmth(candle.id, e);
            }}
            className="absolute top-3 right-3 z-15 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#F2CADB]/80 shadow-[0_2px_6px_rgba(116,52,90,0.10)] text-[#762759] transition-all cursor-pointer group-hover:scale-105 active:scale-95"
            title={`${candle.warmthCount || 0} abrazos de luz. Haz clic para acompañar.`}
            aria-label={`${candle.warmthCount || 0} abrazos de luz`}
          >
            <span className="text-[#BE185D] text-[11px] select-none" aria-hidden="true">♥</span>
            <span className="font-sans font-semibold text-[11px] text-[#762759] leading-none select-none tracking-tight">
              {candle.warmthCount || 0}
            </span>
          </div>

          {/* Estado de la vela sutil en esquina superior izquierda */}
          <div className="absolute top-3 left-3 z-15">
            {candle.isEternal ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-md text-[#762759] text-[9.5px] font-bold border border-amber-300/70 shadow-xs">
                <span>⭐</span>
                <span>Eterna</span>
              </span>
            ) : candle.isNeedsReignition ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30142D]/85 backdrop-blur-md text-amber-200 text-[9.5px] font-bold shadow-xs">
                <span>⏳</span>
                <span>En reposo</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-md text-[#166534] text-[9.5px] font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Encendida</span>
              </span>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SUBCONTENEDOR INFERIOR: BASE ROSA CLARO CASI OPACA              */}
        {/* ================================================================= */}
        <div
          className="absolute bottom-0 left-0 w-full h-[184px] z-10 rounded-t-[22px] overflow-hidden shadow-[0_-4px_20px_rgba(184,60,126,0.08)] flex flex-col justify-between pt-2.5 pb-3 px-3.5"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 247, 251, 0.97) 0%, rgba(253, 239, 246, 0.98) 100%)',
            borderTop: '1.5px solid rgba(255, 232, 242, 0.95)',
          }}
        >
          {/* Borde superior curvado luminoso */}
          <div
            className="absolute inset-x-0 top-0 h-[18px] pointer-events-none z-25 rounded-t-[22px]"
            style={{
              borderTop: '2px solid rgba(255, 242, 232, 0.95)',
              borderLeft: '1.5px solid rgba(244, 206, 218, 0.65)',
              borderRight: '1.5px solid rgba(244, 206, 218, 0.65)',
              filter: 'drop-shadow(0 0 4px rgba(255, 220, 205, 0.70))',
            }}
          />

          {/* VELA OFICIAL SUPERPUESTA EN ESQUINA SUPERIOR IZQUIERDA */}
          <div className="absolute top-1.5 left-2 z-20 w-[46px] h-[66px] pointer-events-none">
            {/* Sombra de contacto */}
            <div className="absolute bottom-[2px] left-[5px] w-[34px] h-[9px] rounded-full bg-black/12 blur-[2px]" />
            <div className="relative w-full h-full">
              <Image
                src="/images/luces/pilar-enciende-luz.webp"
                alt="Vela oficial"
                fill
                sizes="46px"
                className="object-contain object-bottom drop-shadow-[0_2px_8px_rgba(232,194,136,0.45)] transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Nombre y Dedicatoria centrados */}
          <div className="relative z-1 flex flex-col items-center text-center w-full pl-6 pr-2 sm:px-4">
            <h3 className="font-playfair font-bold text-[20px] text-[#30142D] tracking-[-0.2px] leading-tight">
              {candle.petName}
            </h3>

            {/* Separador ornamental dorado oficial */}
            <div className="my-1 w-[110px] h-[8px] flex items-center justify-center opacity-90">
              <Image
                src="/images/luces/separador-ornamental-dorado.svg"
                alt="Adorno dorado"
                width={110}
                height={8}
                className="object-contain"
              />
            </div>

            {/* Dedicatoria en frase completa con texto de lectura #493344 */}
            <p className="font-playfair italic text-[11px] leading-[1.35] text-[#493344] max-w-[176px] line-clamp-2">
              «{dedicationSnippet}»
            </p>
          </div>

          {/* Acciones: «Te acompaño» y «Ver su recuerdo →» */}
          <div className="relative z-1 flex flex-col items-center gap-1.5 mt-1 w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSendWarmth(candle.id, e);
              }}
              className="w-[188px] h-[34px] rounded-full bg-white hover:bg-[#FFF5F8] border border-[#F0BED6] text-[#762759] font-bold text-[11.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_6px_rgba(118,39,89,0.08)] hover:shadow-sm active:scale-95"
            >
              <span className="text-[#BE185D] text-xs">♡</span>
              <span>Te acompaño</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(candle);
              }}
              className="text-[11px] text-[#762759] hover:text-[#30142D] font-semibold cursor-pointer transition-colors inline-flex items-center gap-0.5 hover:underline"
            >
              <span>Ver su recuerdo</span>
              <span>→</span>
            </button>
          </div>

        </div>

      </div>
    </article>
  );
}
