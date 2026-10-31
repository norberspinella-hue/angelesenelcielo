'use client';

import React from 'react';
import Link from 'next/link';

interface MemorialHeaderProps {
  muralUrl: string;
}

export const MemorialHeader: React.FC<MemorialHeaderProps> = ({ muralUrl }) => {
  return (
    <header className="w-full relative z-30 select-none">
      {/* Barra de menú con efecto de degradado transparente en los laterales (Idéntico a imagen 2) */}
      <div
        className="w-full py-2.5 sm:py-3.5 px-4 sm:px-8"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 250, 244, 0.75) 10%, rgba(255, 252, 248, 0.92) 22%, rgba(255, 252, 248, 0.92) 78%, rgba(255, 250, 244, 0.75) 90%, rgba(255, 255, 255, 0) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.35)',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* 1. Logotipo y lema oficial de Ángeles en el Cielo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-[1.02] shrink-0"
          >
            <img
              src="/images/icons/Logoheart.svg"
              alt="Ángeles en el Cielo"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs shrink-0"
            />
            <div className="flex flex-col text-left">
              <span
                className="text-sm sm:text-base md:text-lg font-bold italic text-[#3B2D54] tracking-tight leading-tight whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Ángeles en el Cielo
              </span>
              <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] text-[#8C7355] font-semibold tracking-wide whitespace-nowrap">
                <span className="text-[8px] text-pink-400">🩷</span>
                <span>Todas las mascotas van al cielo</span>
                <span className="text-[8px] text-pink-400">🩷</span>
              </div>
            </div>
          </Link>

          {/* 2. Navegación central con las opciones oficiales de la landing */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-[13px] font-semibold text-[#4A3B60]">
            <Link
              href="/mural-global"
              className="hover:text-[#9333EA] transition-colors py-1"
            >
              El Mural
            </Link>
            <Link
              href="/como-funciona"
              className="hover:text-[#9333EA] transition-colors py-1"
            >
              Cómo funciona
            </Link>
            <Link
              href="/#planes"
              className="hover:text-[#9333EA] transition-colors py-1"
            >
              Opciones
            </Link>
            <Link
              href="/comunidad"
              className="hover:text-[#9333EA] transition-colors py-1"
            >
              Cartas al Cielo
            </Link>
            <Link
              href="/contacto"
              className="hover:text-[#9333EA] transition-colors py-1"
            >
              Contacto
            </Link>
          </nav>

          {/* 3. Botón de retorno al Mural Global con borde morado fino */}
          <Link
            href={muralUrl}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs flex items-center gap-1.5 shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1.5px solid #C084FC',
              color: '#5B21B6',
              boxShadow: '0 2px 8px rgba(192, 132, 252, 0.20)',
            }}
          >
            <span>Volver al mural</span>
            <span className="text-sm">←</span>
          </Link>

        </div>
      </div>
    </header>
  );
};
