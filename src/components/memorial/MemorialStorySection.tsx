'use client';

import React from 'react';

interface MemorialStorySectionProps {
  petName: string;
  dedication: string;
}

export const MemorialStorySection: React.FC<MemorialStorySectionProps> = ({
  petName,
  dedication,
}) => {
  const storyText =
    dedication ||
    'Siempre serás nuestro lugar favorito en el mundo, llenando cada rincón de luz y amor infinito.';

  return (
    <section className="relative w-full overflow-hidden select-none py-10 sm:py-16">
      {/* 1. FONDOS CELESTIALES MAESTROS APROBADOS CON MÁSCARA DE DEGRADADO VERTICAL PARA TRANSICIÓN SUAVE */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/03-historia-desktop.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/03-historia-movil.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />

      {/* 2. CONTENIDO PRINCIPAL: COMPOSICIÓN MEMORIAL EDITORIAL */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        
        {/* Cabecera centrada con icono oficial del plan inicial (huellita) y título caligráfico */}
        <div className="flex flex-col items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-3 w-40 sm:w-56 mb-1 opacity-85">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/60" />
            <img
              src="/images/icons/plans/icon-plan-inicial.svg"
              alt="Huellita oficial"
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
            Su historia
          </h2>
        </div>

        {/* COMPOSICIÓN ASIMÉTRICA: TEXTO ALINEADO ARRIBA SIN CAJA + MENSAJE GRANDE EN 3 LÍNEAS CENTRADO A LA DERECHA */}
        <div className="w-full flex flex-col md:flex-row items-start justify-between gap-8 md:gap-10">
          
          {/* Bloque Izquierdo: Dedicatoria alineada arriba, sin caja y con fuente normal */}
          <div className="w-full md:w-[58%] flex flex-col items-start relative pt-1">
            {/* Capa difusa de fusión suave sin bordes perceptibles de caja */}
            <div
              className="absolute -inset-4 pointer-events-none -z-10"
              style={{
                background:
                  'radial-gradient(ellipse 80% 75% at 40% 40%, rgba(255, 252, 246, 0.75) 0%, rgba(255, 250, 242, 0.35) 60%, rgba(255, 250, 242, 0) 85%)',
                filter: 'blur(8px)',
              }}
            />

            <div
              className="text-[#38284C] font-serif not-italic text-[15.5px] sm:text-[17px] leading-[1.85] text-left"
              style={{
                fontFamily: "Georgia, 'Playfair Display', serif",
                fontStyle: 'normal',
                whiteSpace: 'pre-line',
                overflowWrap: 'break-word',
              }}
            >
              {storyText}
            </div>
          </div>

          {/* Bloque Derecho: «Gracias por todo, Menus ♡» en 3 líneas, centrado verticalmente y el doble de grande */}
          <div className="w-full md:w-[42%] flex flex-col items-center md:items-center justify-center my-auto py-6 sm:py-10 text-center select-none">
            <div className="flex flex-col items-center leading-[0.92] text-[#7E6699]">
              <span
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-normal block"
                style={{
                  fontFamily: "'Allura', cursive",
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(126, 102, 153, 0.20)',
                }}
              >
                Gracias
              </span>
              <span
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-normal block mt-1"
                style={{
                  fontFamily: "'Allura', cursive",
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(126, 102, 153, 0.20)',
                }}
              >
                por todo,
              </span>
              <span
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-normal block mt-1"
                style={{
                  fontFamily: "'Allura', cursive",
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(126, 102, 153, 0.20)',
                }}
              >
                {petName} ♡
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
