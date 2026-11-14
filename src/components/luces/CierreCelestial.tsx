'use client';

import React from 'react';
import Image from 'next/image';

interface CierreCelestialProps {
  className?: string;
}

/**
 * CierreCelestial - Cierre poético y emotivo de «Cielo lleno de luces» (Fase 5)
 * 
 * - Frase de cierre poética situada en ciruela oscuro #30142D sobre la zona clara del cielo.
 * - Firma caligráfica oficial: «Ángeles en el Cielo» (Allura).
 * - Isotipo / separador ornamental dorado con corazón alado oficial.
 * - Fondos oficiales con farol, velas en frasco dorado, flores celestiales y nubes.
 * - Espacio inferior optimizado para conectar con armonía con el pie de página.
 */
export default function CierreCelestial({ className = '' }: CierreCelestialProps) {
  return (
    <section
      id="cierre-celestial"
      className={`relative z-10 w-full overflow-hidden text-center select-none pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col items-center justify-center -mt-4 sm:-mt-6 ${className}`}
      style={{
        isolation: 'isolate',
      }}
    >
      {/* Fondo ambiental oficial con máscara de gradiente suave */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30px, rgba(0,0,0,0.85) 100px, black 160px, black calc(100% - 70px), rgba(0,0,0,0.5) calc(100% - 20px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30px, rgba(0,0,0,0.85) 100px, black 160px, black calc(100% - 70px), rgba(0,0,0,0.5) calc(100% - 20px), transparent 100%)',
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

        {/* Halo ambiental sutil de luz cálida en el centro para dar soporte al texto */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 248, 252, 0.45) 45%, transparent 75%)',
          }}
        />
      </div>

      {/* Contenido textual central en ciruela oscuro #30142D sobre la zona clara del cielo */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Frase poética en ciruela oscuro #30142D */}
        <p 
          className="font-playfair italic font-bold text-[22px] sm:text-2xl md:text-3xl lg:text-[34px] text-[#30142D] leading-[1.32] tracking-tight max-w-xl mx-auto drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]"
        >
          Cada luz es una historia de amor<br className="hidden sm:inline" /> que nunca se apaga.
        </p>

        {/* Firma caligráfica oficial en frambuesa oscuro #762759 */}
        <h3 
          className="mt-2.5 sm:mt-3.5 lg:mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#762759] font-normal leading-[1.2] tracking-wide drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)]"
          style={{
            fontFamily: "'Allura', cursive",
          }}
        >
          Ángeles en el Cielo
        </h3>

        {/* Separador ornamental dorado con corazón alado oficial */}
        <div className="mt-2 sm:mt-3 w-[130px] sm:w-[150px] lg:w-[165px] h-[14px] flex items-center justify-center opacity-95">
          <Image
            src="/images/luces/separador-ornamental-dorado.svg"
            alt="Separador ornamental dorado"
            width={165}
            height={14}
            className="object-contain drop-shadow-[0_2px_8px_rgba(217,119,6,0.30)]"
          />
        </div>
      </div>
    </section>
  );
}
