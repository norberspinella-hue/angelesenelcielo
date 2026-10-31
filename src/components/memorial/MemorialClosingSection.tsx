'use client';

import React from 'react';

export const MemorialClosingSection: React.FC = () => {
  return (
    <footer className="relative w-full overflow-hidden select-none py-12 sm:py-20 flex flex-col items-center">
      {/* 1. FONDOS CELESTIALES MAESTROS APROBADOS CON MÁSCARA DE DEGRADADO VERTICAL PARA TRANSICIÓN SUAVE */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/08-cierre-desktop.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/08-cierre-movil.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
        }}
      />

      {/* 2. CONTENIDO PRINCIPAL: RECREACIÓN VECTORIAL DE LA FIRMA OFICIAL */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* Divisor superior con corazón outline idéntico a las tarjetas del mural */}
        <div className="flex items-center justify-center gap-3 w-40 sm:w-56 mb-1 opacity-80 select-none">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/70" />
          <span className="text-xl sm:text-2xl text-[#C59A45] leading-none">♡</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8860B]/70" />
        </div>

        {/* Firma caligráfica oficial recreada en código puro: «Ángeles en el Cielo» */}
        <h3
          className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.05] text-center my-0.5 select-none"
          style={{
            fontFamily: "'Allura', cursive",
            color: '#B8860B',
            textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(184, 134, 11, 0.35)',
          }}
        >
          Ángeles en el Cielo
        </h3>

        {/* Eslogan oficial con corazones rosa */}
        <div className="flex items-center justify-center gap-2 my-2 select-none">
          <span className="text-xs text-pink-400">🩷</span>
          <p
            className="text-[10px] sm:text-xs font-bold text-[#8C7355] tracking-[0.25em] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Todas las mascotas van al cielo
          </p>
          <span className="text-xs text-pink-400">🩷</span>
        </div>

        {/* Frase poética de cierre */}
        <p
          className="text-base sm:text-lg text-[#5A4868] italic my-2 max-w-md select-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            textShadow: '0 1px 4px rgba(255, 255, 255, 0.9)',
          }}
        >
          El amor nunca se va, solo se transforma en luz.
        </p>

        {/* Divisor inferior con huellita dorada oficial */}
        <div className="flex items-center justify-center gap-3 w-36 sm:w-48 mt-2 opacity-85 select-none">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/60" />
          <img
            src="/images/icons/plans/icon-plan-inicial.svg"
            alt="Huellita oficial"
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain inline-block shrink-0"
          />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8860B]/60" />
        </div>

      </div>
    </footer>
  );
};
