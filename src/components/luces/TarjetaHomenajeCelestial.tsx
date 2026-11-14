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
 * Truncado limpio que prioriza oraciones completas
 */
function getSentenceSnippet(text?: string): string {
  if (!text) return 'Siempre en nuestro recuerdo, iluminando el cielo.';
  const trimmed = text.trim();
  if (trimmed.length <= 95) return trimmed;
  const sentenceEnd = trimmed.search(/[.!?](\s|$)/);
  if (sentenceEnd !== -1 && sentenceEnd >= 25 && sentenceEnd <= 95) {
    return trimmed.slice(0, sentenceEnd + 1);
  }
  const lastSpace = trimmed.slice(0, 95).lastIndexOf(' ');
  return (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed.slice(0, 95)) + '...';
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
      className={`group relative shrink-0 snap-center md:snap-start w-[254px] h-[366px] rounded-[22px] overflow-visible select-none transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${className}`}
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
        {/* 1. ZONA SUPERIOR: FOTOGRAFÍA PROTAGONISTA ORIGINAL (215px) */}
        <div className="absolute top-0 left-0 w-full h-[215px] overflow-hidden bg-[#FDF4F8] z-1">
          <Image
            src={candle.photoUrl || '/images/comunidad/xena.jpg'}
            alt={candle.petName}
            fill
            sizes="254px"
            priority
            className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Resplandor cálido sutil de luz */}
          {isLit && (
            <div className="absolute bottom-5 -left-4 w-[100px] h-[100px] rounded-full bg-radial from-amber-300/20 via-rose-300/5 to-transparent pointer-events-none blur-md" />
          )}

          {/* Contador oficial de corazones / abrazos de luz recibidos */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSendWarmth(candle.id, e);
            }}
            className="absolute top-3 right-3 z-15 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#F2CADB]/90 shadow-[0_2px_8px_rgba(116,52,90,0.12)] text-[#8C3F71] transition-all cursor-pointer group-hover:scale-105 active:scale-95"
            title={`${candle.warmthCount || 0} abrazos de luz recibidos. Haz clic para acompañar.`}
            aria-label={`${candle.warmthCount || 0} abrazos de luz`}
          >
            <span className="text-[#D9629B] text-xs select-none" aria-hidden="true">♥</span>
            <span className="font-sans font-bold text-xs text-[#8C3F71] leading-none select-none tracking-tight">
              {candle.warmthCount || 0}
            </span>
          </div>
        </div>

        {/* 2. SUBCONTENEDOR INFERIOR: FONDO CELESTIAL ILUSTRADO ORIGINAL RECUPERADO */}
        <div
          className="absolute bottom-0 left-0 w-full h-[190px] z-10 rounded-t-[20px] overflow-hidden shadow-[0_-4px_16px_rgba(184,60,126,0.10)] flex flex-col justify-between pt-2.5 pb-3 px-3.5"
          style={{
            backgroundImage: "url('/images/mural-preview/card-heaven-front-master.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        >
          {/* Borde superior curvado luminoso */}
          <div
            className="absolute inset-x-0 top-0 h-[22px] pointer-events-none z-25 rounded-t-[20px]"
            style={{
              borderTop: '2px solid rgba(255, 238, 216, 0.98)',
              borderLeft: '2px solid rgba(244, 191, 185, 0.85)',
              borderRight: '2px solid rgba(244, 191, 185, 0.85)',
              filter: 'drop-shadow(0 0 4.5px rgba(255, 201, 177, 0.85))',
            }}
          />

          {/* VELA OFICIAL SUPERPUESTA EN ESQUINA SUPERIOR IZQUIERDA */}
          <div className="absolute top-1.5 left-2 z-20 w-[48px] h-[68px] pointer-events-none">
            {/* Sombra de contacto */}
            <div className="absolute bottom-[2px] left-[6px] w-[36px] h-[10px] rounded-full bg-black/16 blur-[3px]" />

            {/* Imagen oficial pilar-enciende-luz.webp */}
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

          {/* Cabecera del subcontenedor: Nombre y Separador Ornamental CENTRADOS */}
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

            {/* Dedicatoria centrada en cursiva con recorte por frases completas */}
            <p className="font-playfair italic text-[11px] leading-[1.32] text-[#381232] line-clamp-3 max-w-[172px] drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
              “{getSentenceSnippet(candle.dedication)}”
            </p>
          </div>

          {/* Acciones: Botón «♡ Te acompaño» y NUEVO BOTÓN DESTACADO «Ver su recuerdo →» (#86245E) */}
          <div className="relative z-1 flex flex-col items-center gap-1.5 mt-1 w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSendWarmth(candle.id, e);
              }}
              className="w-[188px] h-[30px] rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-xs border border-[#ECC9DE]/90 text-[#843E78] font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_6px_rgba(132,62,120,0.10)] active:scale-95"
            >
              <span className="text-[#C4679B] text-xs">♡</span>
              <span>Te acompaño</span>
            </button>

            {/* NUEVO BOTÓN CTA: Rosa frambuesa profundo #86245E, texto blanco, bordes redondeados y accesible */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(candle);
              }}
              className="w-[188px] h-[32px] rounded-full bg-[#86245E] hover:bg-[#721C4F] active:scale-95 text-white font-bold text-[11.5px] flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(134,36,94,0.30)] hover:shadow-[0_4px_12px_rgba(134,36,94,0.40)] transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#86245E] focus:ring-offset-1 select-none"
              aria-label={`Ver recuerdo de ${candle.petName}`}
            >
              <span>Ver su recuerdo</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
