'use client';

import React from 'react';
import Image from 'next/image';

interface CierreCelestialProps {
  className?: string;
}

/**
 * CierreCelestial - Cierre poético y emotivo de «Cielo lleno de luces» (Fase 5)
 * 
 * Basado fielmente en el bloque final del mockup oficial maestro:
 * - Mensaje celestial:
 *     Cada luz es una historia de amor
 *     que nunca se apaga.
 * - Firma caligráfica oficial: «Ángeles en el Cielo» (Allura).
 * - Isotipo / separador ornamental dorado con corazón alado oficial.
 * - Fondos oficiales con farol, velas en frasco dorado, flores celestiales y nubes:
 *     - PC: /images/luces/fondo_05_CIERRE_PC_1920x1080.webp
 *     - Móvil: /images/luces/fondo_05_CIERRE_MOVIL_1080x1920.webp
 * - Máscara de transición superior e inferior ultra-suave que garantiza cero cortes
 *   visibles con el cielo continuo unificado (#cielo-continuo-unificado) ni con el footer.
 */
export default function CierreCelestial({ className = '' }: CierreCelestialProps) {
  return (
    <section
      id="cierre-celestial"
      className={`relative z-10 w-full overflow-hidden text-center select-none pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-44 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex flex-col items-center justify-center -mt-6 sm:-mt-8 ${className}`}
      style={{
        isolation: 'isolate',
      }}
    >
      {/* Fondo ambiental oficial con máscara de gradiente suave superior e inferior para cero cortes */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.8) 120px, black 180px, black calc(100% - 90px), rgba(0,0,0,0.5) calc(100% - 30px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.8) 120px, black 180px, black calc(100% - 90px), rgba(0,0,0,0.5) calc(100% - 30px), transparent 100%)',
        }}
      >
        {/* Versión Escritorio / Tablet (>= 768px): Imagen oficial 1920x1080 */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <Image
            src="/images/luces/fondo_05_CIERRE_PC_1920x1080.webp"
            alt="Cierre celestial con farol de luz, velas y flores"
            fill
            sizes="100vw"
            quality={92}
            className="object-cover object-center"
          />
        </div>

        {/* Versión Móvil (< 768px): Imagen oficial vertical 1080x1920 */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <Image
            src="/images/luces/fondo_05_CIERRE_MOVIL_1080x1920.webp"
            alt="Cierre celestial con farol de luz, velas y flores"
            fill
            sizes="100vw"
            quality={92}
            className="object-cover object-bottom"
          />
        </div>

        {/* Halo ambiental sutil de luz dorada y lavanda en el centro */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 245, 230, 0.18) 0%, rgba(240, 215, 235, 0.12) 45%, transparent 75%)',
          }}
        />
      </div>

      {/* Contenido textual central con tipografías y composición idénticas al mockup */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Frase poética: «Cada luz es una historia de amor que nunca se apaga.» */}
        <p 
          className="font-playfair italic font-medium text-[21px] sm:text-2xl md:text-3xl lg:text-[35px] text-white leading-[1.35] tracking-tight max-w-xl mx-auto"
          style={{
            textShadow: '0 2px 10px rgba(50, 15, 55, 0.65), 0 0 25px rgba(255, 255, 255, 0.45)',
          }}
        >
          Cada luz es una historia de amor<br className="hidden sm:inline" /> que nunca se apaga.
        </p>

        {/* Firma caligráfica oficial: «Ángeles en el Cielo» */}
        <h3 
          className="mt-3 sm:mt-4 lg:mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-[66px] text-white font-normal leading-[1.2] tracking-wide"
          style={{
            fontFamily: "'Allura', cursive",
            textShadow: '0 3px 14px rgba(45, 15, 49, 0.70), 0 0 35px rgba(255, 235, 245, 0.55)',
          }}
        >
          Ángeles en el Cielo
        </h3>

        {/* Separador ornamental dorado con corazón alado oficial */}
        <div className="mt-2.5 sm:mt-3.5 w-[130px] sm:w-[150px] lg:w-[165px] h-[14px] flex items-center justify-center opacity-95">
          <Image
            src="/images/luces/separador-ornamental-dorado.svg"
            alt="Separador ornamental dorado"
            width={165}
            height={14}
            className="object-contain drop-shadow-[0_2px_10px_rgba(255,220,150,0.65)]"
          />
        </div>
      </div>
    </section>
  );
}
