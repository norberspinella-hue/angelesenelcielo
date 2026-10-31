'use client';

import React from 'react';
import Link from 'next/link';

interface MemorialMuralSectionProps {
  muralUrl: string;
}

export const MemorialMuralSection: React.FC<MemorialMuralSectionProps> = ({ muralUrl }) => {
  return (
    <section className="relative w-full overflow-hidden select-none py-12 sm:py-20 flex flex-col items-center">
      {/* 1. FONDOS CELESTIALES MAESTROS APROBADOS CON MÁSCARA DE DEGRADADO VERTICAL PARA TRANSICIÓN SUAVE */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/05-su-luz-en-el-mural-seccion-desktop.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/05-su-luz-en-el-mural-seccion-movil.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />

      {/* 2. 6 MARIPOSAS SVG DISTRIBUIDAS ARTÍSTICAMENTE POR LA SECCIÓN */}
      {/* 1. Superior Izquierda */}
      <div className="absolute top-6 left-4 sm:left-12 w-8 h-8 sm:w-11 sm:h-11 -rotate-15 pointer-events-none select-none opacity-85 z-20 filter drop-shadow-[0_2px_8px_rgba(236,72,153,0.30)]">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain" />
      </div>
      {/* 2. Superior Derecha */}
      <div className="absolute top-8 right-5 sm:right-14 w-8 h-8 sm:w-10 sm:h-10 rotate-20 pointer-events-none select-none opacity-85 z-20 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.30)]">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain" />
      </div>
      {/* 3. Centro Izquierda */}
      <div className="absolute top-1/2 -translate-y-12 left-2 sm:left-6 w-9 h-9 sm:w-12 sm:h-12 -rotate-25 pointer-events-none select-none opacity-80 z-20 filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.30)]">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain" />
      </div>
      {/* 4. Centro Derecha */}
      <div className="absolute top-1/2 -translate-y-8 right-2 sm:right-6 w-9 h-9 sm:w-12 sm:h-12 rotate-18 pointer-events-none select-none opacity-85 z-20 filter drop-shadow-[0_2px_8px_rgba(236,72,153,0.30)]">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain" />
      </div>
      {/* 5. Inferior Izquierda */}
      <div className="absolute bottom-12 left-6 sm:left-16 w-8 h-8 sm:w-10 sm:h-10 rotate-15 pointer-events-none select-none opacity-80 z-20 filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.25)]">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain" />
      </div>
      {/* 6. Inferior Derecha */}
      <div className="absolute bottom-14 right-6 sm:right-16 w-8 h-8 sm:w-11 sm:h-11 -rotate-20 pointer-events-none select-none opacity-85 z-20 filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.30)]">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain" />
      </div>

      {/* 3. CONTENIDO PRINCIPAL: MISMO ANCHO MÁXIMO QUE LA SECCIÓN DE COMPARTIR */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* Cabecera centrada con icono oficial del plan estrella */}
        <div className="flex flex-col items-center mb-5 sm:mb-7">
          <div className="flex items-center gap-3 w-40 sm:w-56 mb-1 opacity-85">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/60" />
            <img
              src="/images/icons/plans/icon-plan-estrella.svg"
              alt="Estrella celestial oficial"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain inline-block shrink-0"
            />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8860B]/60" />
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-center"
            style={{
              fontFamily: "'Allura', cursive",
              color: '#B8860B',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(184, 134, 11, 0.25)',
            }}
          >
            Su luz en el mural
          </h2>

          <p
            className="text-xs sm:text-[13.5px] text-[#5A4668] max-w-xl mt-1.5 sm:mt-2 px-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ahora su luz forma parte del Mural de Ángeles, donde todas las mascotas son recordadas y su amor sigue brillando para siempre.
          </p>
        </div>

        {/* Panorámica del mural enmarcada: AMPLIA A LO LARGO Y ALTO, USANDO 07-su estrella.webp, SIN FRANJA BLANCA (FONDO TRANSPARENTE) */}
        <div
          className="w-full rounded-[24px] sm:rounded-[32px] overflow-hidden p-0 mb-6 sm:mb-8 transition-transform duration-300 hover:scale-[1.01]"
          style={{
            background: 'transparent',
            border: '2px solid rgba(217, 164, 71, 0.70)',
            boxShadow: '0 8px 32px rgba(217, 164, 71, 0.22)',
          }}
        >
          <img
            src="/images/memorial/07-su%20estrella.webp"
            alt="Su estrella en el Mural de Ángeles"
            className="w-full h-auto min-h-[200px] sm:min-h-[260px] md:min-h-[320px] max-h-[460px] object-cover block"
          />
        </div>

        {/* Botón de acción hacia el mural */}
        <Link
          href={muralUrl}
          className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full text-white text-xs sm:text-sm font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 45%, #EC4899 100%)',
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
          }}
        >
          <span>⭐</span>
          <span>Ver su estrella en el mural</span>
          <span className="text-base leading-none">›</span>
        </Link>

      </div>
    </section>
  );
};
