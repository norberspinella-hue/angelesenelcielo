'use client';

import React from 'react';
import { MemorialHeader } from './MemorialHeader';

interface MemorialHeroSectionProps {
  petName: string;
  photoUrl: string;
  datesText: string | null;
  shortQuote: string | null;
  muralUrl: string;
}

// Icono de corazón rosa 3D sombreado exactamente idéntico a la imagen oficial de referencia
const CelestialPinkHeart = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} inline-block select-none shrink-0`}
    style={{ filter: 'drop-shadow(0 1.5px 3.5px rgba(246, 99, 125, 0.45))' }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="heroPinkHeartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFAEC0" />
        <stop offset="40%" stopColor="#FF8599" />
        <stop offset="85%" stopColor="#F6637D" />
        <stop offset="100%" stopColor="#E94F6C" />
      </linearGradient>
      <radialGradient id="heroPinkHeartShine" cx="35%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="55%" stopColor="#FFAEC0" stopOpacity="0.30" />
        <stop offset="100%" stopColor="#F6637D" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heroPinkHeartGrad)"
    />
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heroPinkHeartShine)"
    />
  </svg>
);

export const MemorialHeroSection: React.FC<MemorialHeroSectionProps> = ({
  petName,
  photoUrl,
  datesText,
  shortQuote,
  muralUrl,
}) => {
  return (
    <section className="relative w-full overflow-hidden select-none min-h-[520px] md:min-h-[580px] flex flex-col justify-between">
      {/* 1. FONDOS CELESTIALES MAESTROS APROBADOS CON MÁSCARA DE DEGRADADO INFERIOR */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/02-hero-desktop.webp')",
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/02-hero-movil.webp')",
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      />

      {/* 2. HEADER CELESTIAL SUPERIOR INTEGRADO CON DEGRADADO LATERAL DIRECTO SOBRE EL CIELO */}
      <div className="relative z-30 w-full pt-1">
        <MemorialHeader muralUrl={muralUrl} />
      </div>

      {/* 3. CONTENIDO PRINCIPAL DEL HERO */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-10 sm:pb-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-12 min-w-0">
        
        {/* COLUMNA IZQUIERDA: RETRATO PROTAGONISTA ENTRE LAS ALAS */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative min-w-0">
          <div className="relative flex items-center justify-center">
            
            {/* 1. Resplandor cálido central antes de la foto (idéntico a la tarjeta del mural) */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '280px',
                height: '140px',
                background: 'radial-gradient(ellipse at center, rgba(255, 253, 240, 0.85) 0%, rgba(255, 245, 215, 0.50) 45%, rgba(255, 240, 195, 0) 80%)',
                filter: 'blur(16px)',
                zIndex: 2,
              }}
            />

            {/* 2. Aureola Celestial Dorada (-4°) idéntica a la tarjeta del mural */}
            <div
              className="absolute pointer-events-none z-20"
              style={{
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%) rotate(-4deg)',
                width: '160px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 220 70" fill="none" style={{ overflow: 'visible' }}>
                <defs>
                  <filter id="frontHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="frontHaloGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFA000" />
                    <stop offset="25%" stopColor="#FFD54F" />
                    <stop offset="50%" stopColor="#FFF9C4" />
                    <stop offset="75%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#FFA000" />
                  </linearGradient>
                </defs>
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFD54F" strokeWidth="8" opacity="0.85" filter="url(#frontHaloGlow)" />
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="url(#frontHaloGoldGrad)" strokeWidth="4.2" opacity="1.0" />
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.98" />
              </svg>
            </div>

            {/* 3. Fotografía de la mascota en marco circular idéntico a la tarjeta del mural */}
            <div
              className="w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 rounded-full overflow-hidden relative z-10 transition-transform duration-300 hover:scale-[1.01]"
              style={{
                border: '3.5px solid #C9A961',
                boxShadow: '0 0 22px rgba(201,169,97,0.45), 0 8px 20px rgba(74,31,110,0.18)',
                backgroundColor: 'white',
              }}
            >
              <img
                src={photoUrl || '/images/placeholders/first.webp'}
                alt={petName}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: BLOQUE EDITORIAL SIN CAJA — FUSIÓN SUAVE POR DEGRADADO PERIMETRAL */}
        <div className="w-full min-w-0 md:w-1/2 flex flex-col items-center justify-center relative">
          
          <div className="relative w-full max-w-md flex flex-col items-center text-center select-none py-4 px-2">
            
            {/* Zona de opacidad con degradado perimetral que se funde suavemente con el fondo (sin bordes de caja) */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background:
                  'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(255, 252, 246, 0.72) 0%, rgba(255, 250, 242, 0.38) 50%, rgba(255, 250, 242, 0) 80%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Título: MI ANGELITO idéntico al mockup */}
            <div
              className="text-[12px] sm:text-[13.5px] font-bold text-[#534068] tracking-[0.28em] uppercase select-none mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Mi angelito
            </div>

            {/* 1er Corazón Rosa Oficial con líneas doradas laterales */}
            <div className="flex items-center justify-center gap-3 w-full my-1">
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#C69C4E] to-[#C69C4E]" />
              <CelestialPinkHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#C69C4E] to-[#C69C4E]" />
            </div>

            {/* Nombre caligráfico Allura en violeta vibrante idéntico a la imagen de referencia */}
            <h1
              className="text-6xl sm:text-7xl md:text-8xl leading-[0.95] font-normal my-1 break-words max-w-full select-none"
              style={{
                fontFamily: "'Allura', cursive",
                background: 'linear-gradient(135deg, #A855F7 0%, #8B2FE8 55%, #701AD4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#8B2FE8',
                filter: 'drop-shadow(0 1px 2px rgba(139, 47, 232, 0.20))',
              }}
            >
              {petName}
            </h1>

            {/* Fechas de nacimiento y partida */}
            {datesText && (
              <p
                className="text-[13px] sm:text-[14.5px] text-[#55426B] font-medium tracking-wide my-1 select-none"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {datesText}
              </p>
            )}

            {/* 2do Corazón Rosa Oficial con líneas doradas laterales */}
            <div className="flex items-center justify-center gap-3 w-full my-1.5">
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#C69C4E] to-[#C69C4E]" />
              <CelestialPinkHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#C69C4E] to-[#C69C4E]" />
            </div>

            {/* Cita breve conmemorativa en cursiva serif elegante */}
            {shortQuote && (
              <blockquote
                className="text-xs sm:text-[13.5px] text-[#4E3F63] italic leading-relaxed max-w-sm mt-1 select-none font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                “{shortQuote}”
              </blockquote>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
