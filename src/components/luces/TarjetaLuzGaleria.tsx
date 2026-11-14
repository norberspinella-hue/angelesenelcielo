'use client';

import React from 'react';
import Image from 'next/image';

export interface CandleGaleriaData {
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

interface TarjetaLuzGaleriaProps<T extends CandleGaleriaData = CandleGaleriaData> {
  candle: T;
  onSelect: (candle: T) => void;
  onSendWarmth?: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

/**
 * TarjetaLuzGaleria - Tarjeta compacta horizontal de la galería «Todas las luces de nuestro cielo»
 * 
 * REQUISITO CRÍTICO DE DISEÑO CONSERVADO:
 * - Se preserva ESTRICTAMENTE el fondo ilustrado original de la franja inferior:
 *   /images/mural-preview/card-heaven-front-master.webp
 * - Misma composición, encuadre y vela oficial (/images/luces/pilar-enciende-luz.webp).
 * - Mejora de legibilidad con paleta aprobada:
 *   - Nombre de la mascota: ciruela oscuro #30142D
 *   - Cifra de corazones: frambuesa oscuro #762759
 * - Distinción textual y con icono del estado de la vela (encendida / en reposo / eterna).
 */
export default function TarjetaLuzGaleria<T extends CandleGaleriaData = CandleGaleriaData>({
  candle,
  onSelect,
  onSendWarmth,
  className = '',
}: TarjetaLuzGaleriaProps<T>) {
  // Fotografía original limpia de la mascota
  const petPhoto = candle.photoUrl || '/images/comunidad/xena.jpg';

  return (
    <div
      onClick={() => onSelect(candle)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(candle);
        }
      }}
      aria-label={`Ver recuerdo y luz de ${candle.petName}`}
      className={`group relative w-full max-w-[230px] h-[180px] sm:h-[188px] lg:h-[192px] rounded-[20px] cursor-pointer select-none transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#D9629B]/40 ${className}`}
      style={{
        isolation: 'isolate',
        // Resplandor exterior oro rosa Variante B aprobado
        boxShadow: `
          0 0 5px 1.5px rgba(255, 240, 225, 0.98),
          0 0 14px 4px rgba(255, 202, 190, 0.80),
          0 0 28px 7px rgba(244, 166, 175, 0.48),
          0 0 46px 12px rgba(226, 141, 170, 0.25),
          0 10px 24px rgba(116, 52, 90, 0.12)
        `,
      }}
    >
      {/* Halo y Borde Oro Rosa Luminoso Externo */}
      <div
        className="absolute -inset-[1.5px] rounded-[21.5px] pointer-events-none z-30"
        style={{
          padding: '1.5px',
          background: 'linear-gradient(135deg, #FFF9ED 0%, #FFD8C7 22%, #F1B2BD 45%, #FFE7CB 68%, #FFF7E9 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Contenedor Estructural Interior con radio de 20px recortado */}
      <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-[#FAF3F7] shadow-[inset_0_0_8px_rgba(255,251,236,0.65)] flex flex-col">
        
        {/* ================================================================= */}
        {/* 1. ZONA SUPERIOR: FOTOGRAFÍA REAL PROTAGONISTA                    */}
        {/* ================================================================= */}
        <div className="absolute top-0 left-0 w-full h-[126px] sm:h-[134px] lg:h-[138px] overflow-hidden bg-[#FDF4F8] z-1">
          <Image
            src={petPhoto}
            alt={candle.petName}
            fill
            sizes="(max-width: 640px) 175px, (max-width: 1024px) 210px, 230px"
            priority={false}
            className={`object-cover object-[center_28%] transition-transform duration-700 ease-out group-hover:scale-105 ${
              candle.isNeedsReignition ? 'filter saturate-[0.82]' : ''
            }`}
          />

          {/* Sutil resplandor de luz celestial superior */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/35 via-white/10 to-transparent rounded-full pointer-events-none blur-[6px]" />

          {/* Distinción textual y con icono del estado de la vela (nunca solo por color) */}
          <div className="absolute top-2 left-2 z-10">
            {candle.isEternal ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/92 backdrop-blur-md text-[#762759] text-[9.5px] font-bold border border-amber-300/80 shadow-xs select-none">
                <span className="text-amber-500">⭐</span>
                <span>Eterna</span>
              </span>
            ) : candle.isNeedsReignition ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30142D]/88 backdrop-blur-md text-amber-200 text-[9.5px] font-bold shadow-xs select-none">
                <span>⏳</span>
                <span>En reposo</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/92 backdrop-blur-md text-[#166534] text-[9.5px] font-bold border border-[#DCFCE7] shadow-xs select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Encendida</span>
              </span>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. PLACA INFERIOR ORIGINAL CON IMAGEN card-heaven-front-master     */}
        {/* ================================================================= */}
        <div
          className="absolute bottom-0 left-0 w-full h-[58px] sm:h-[60px] lg:h-[62px] z-10 rounded-t-[16px] overflow-hidden shadow-[0_-3px_12px_rgba(184,60,126,0.08)] flex items-center justify-between px-3 sm:px-3.5"
          style={{
            backgroundImage: "url('/images/mural-preview/card-heaven-front-master.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        >
          {/* Borde superior curvado luminoso suave (integra la placa con la foto) */}
          <div
            className="absolute inset-x-0 top-0 h-[16px] pointer-events-none z-20 rounded-t-[16px]"
            style={{
              borderTop: '1.5px solid rgba(255, 238, 216, 0.95)',
              borderLeft: '1.5px solid rgba(244, 191, 185, 0.75)',
              borderRight: '1.5px solid rgba(244, 191, 185, 0.75)',
              filter: 'drop-shadow(0 0 3px rgba(255, 201, 177, 0.70))',
            }}
          />

          {/* Contenido frontal: Nombre real en ciruela oscuro #30142D + Contador de corazones en frambuesa oscuro #762759 */}
          <div className="relative z-10 flex items-center gap-1.5 min-w-0 pr-10">
            <h3 className="font-playfair font-bold text-[14.5px] sm:text-[16px] lg:text-[17px] text-[#30142D] leading-tight tracking-[-0.2px] truncate drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]">
              {candle.petName}
            </h3>
            <span
              onClick={(e) => {
                if (onSendWarmth) {
                  e.stopPropagation();
                  onSendWarmth(candle.id, e);
                }
              }}
              className="inline-flex items-center gap-0.5 text-[#762759] hover:text-[#9E2B6C] font-bold text-[11px] sm:text-[12px] select-none shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] cursor-pointer transition-colors"
              title={`${candle.warmthCount || 0} abrazos de luz. Haz clic para acompañar.`}
            >
              <span className="text-[#762759] text-[11px] sm:text-[12px]" aria-hidden="true">♥</span>
              <span className="font-sans font-bold leading-none">{candle.warmthCount || 0}</span>
            </span>
          </div>

          {/* =============================================================== */}
          {/* 3. VELA OFICIAL ESTÁTICA EN ESQUINA INFERIOR DERECHA            */}
          {/* =============================================================== */}
          <div className="absolute right-1.5 sm:right-2 bottom-1 z-20 w-[38px] sm:w-[40px] lg:w-[42px] h-[54px] sm:h-[58px] lg:h-[60px] pointer-events-none">
            {/* Sombra de contacto */}
            <div className="absolute bottom-[2px] left-[5px] w-[28px] sm:w-[32px] h-[7px] sm:h-[8px] rounded-full bg-black/15 blur-[2px]" />
            
            <Image
              src="/images/luces/pilar-enciende-luz.webp"
              alt="Vela oficial"
              fill
              sizes="42px"
              className="object-contain object-bottom drop-shadow-[0_2px_8px_rgba(232,194,136,0.55)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
