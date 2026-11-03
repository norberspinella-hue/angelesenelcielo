'use client';

import React from 'react';
import {
  LiveStreamState,
  PRELOADED_LETTERS,
  SHELTER_ANGELS,
} from './types';
import { TikTokSafeZoneGuide } from './TikTokSafeZoneGuide';

interface LiveCanvasProps {
  state: LiveStreamState;
  showSafeZone?: boolean;
  safeZoneOpacity?: number;
  className?: string;
}

export function LiveCanvas({
  state,
  showSafeZone = false,
  safeZoneOpacity = 0.85,
  className = '',
}: LiveCanvasProps) {
  const {
    activeScene,
    currentLetterIndex,
    currentShelterIndex,
    candles = [],
    activePetName = '',
    activePetDedication = '',
    candleLitAt = 0,
    muralStarsCount,
    webCandlesCount = 18,
    sessionCandlesCount,
  } = state;

  const currentLetter = PRELOADED_LETTERS[currentLetterIndex] || PRELOADED_LETTERS[0];
  const currentAngel = SHELTER_ANGELS[currentShelterIndex] || SHELTER_ANGELS[0];

  // Cálculo de mascota protagonista activa en el altar
  const currentPet = activePetName.trim();
  const rawDedication = activePetDedication.trim() || (currentPet ? 'Tu luz seguirá brillando\nen nuestros corazones' : '');
  const isJustLit = Boolean(candleLitAt && Date.now() - candleLitAt < 4500);

  // Lista de hasta 5 nombres recientes para el ticker superior sin truncar el estado
  // Memorial secundario ampliado: 20 nombres visibles (5 líneas × 4 nombres)
  const DEFAULT_20_NAMES = [
    'Luna', 'Thor', 'Coco', 'Milo',
    'Nala', 'Simba', 'Rocky', 'Toby',
    'Kira', 'Bruno', 'Maya', 'Leo',
    'Bella', 'Lucas', 'Lola', 'Max',
    'Zeus', 'Sasha', 'Pancho', 'Bimba'
  ];

  // Combina las velas activas del directo con los ángeles base garantizando siempre 20 visibles
  const sessionCandleNames = candles.map(c => c.name).filter(Boolean);
  const combinedMemorialNames = Array.from(new Set([...sessionCandleNames, ...DEFAULT_20_NAMES]));

  // Rotación automática suave por tandas de 20 nombres cuando hay más de 20 registros
  const [rotationBatchIndex, setRotationBatchIndex] = React.useState(0);
  const totalMemorialCount = combinedMemorialNames.length;

  React.useEffect(() => {
    if (totalMemorialCount <= 20) return;
    const interval = setInterval(() => {
      setRotationBatchIndex(prev => (prev + 1) % Math.ceil(totalMemorialCount / 20));
    }, 14000);
    return () => clearInterval(interval);
  }, [totalMemorialCount]);

  const startIdx = (rotationBatchIndex * 20) % totalMemorialCount;
  const active20MemorialNames = Array.from({ length: 20 }, (_, i) => combinedMemorialNames[(startIdx + i) % totalMemorialCount]);

  // Agrupación en 5 líneas de 4 nombres
  const nameRows: string[][] = [
    active20MemorialNames.slice(0, 4),
    active20MemorialNames.slice(4, 8),
    active20MemorialNames.slice(8, 12),
    active20MemorialNames.slice(12, 16),
    active20MemorialNames.slice(16, 20),
  ];

  // 1. NOMBRE PRINCIPAL: 3 Escalones Tipográficos Obligatorios y Centrado Perfecto
  const nameLength = currentPet.length;
  let nameFontSize = 'clamp(34px, 7.4vw, 82px)'; // Escalón 1 · Nombre Corto (1 a 5 chars: Dura, Bro, Coco, Maya)
  if (nameLength > 11) {
    nameFontSize = 'clamp(20px, 4.2vw, 48px)'; // Escalón 3 · Nombre Largo (12+ chars: Maximiliano Fernando, Mary Margaret)
  } else if (nameLength > 5) {
    nameFontSize = 'clamp(26px, 5.8vw, 66px)'; // Escalón 2 · Nombre Medio (6 a 11 chars: Chloé, Juliette, Kassius)
  }

  // 2. DEDICATORIA: Control Estricto de 1 o 2 Líneas Equilibradas (Sin Palabras Huérfanas)
  const dedicationLength = rawDedication.length;
  let dedicationFontSize = 'clamp(18px, 3.8vw, 38px)';
  if (dedicationLength > 65) {
    dedicationFontSize = 'clamp(15px, 3.0vw, 30px)';
  } else if (dedicationLength > 40) {
    dedicationFontSize = 'clamp(17px, 3.4vw, 34px)';
  }

  // Formateo en líneas limpias para evitar que palabras queden aisladas en 3ª línea
  const dedicationLines = rawDedication.includes('\n')
    ? rawDedication.split('\n').filter(Boolean)
    : [rawDedication];

  return (
    <div
      className={`relative w-full h-full aspect-[9/16] ${
        activeScene === 1
          ? 'bg-cover bg-center bg-no-repeat'
          : 'bg-[#0C061A] bg-gradient-to-b from-[#180A26] via-[#120721] to-[#0A0314]'
      } text-white flex flex-col justify-between overflow-hidden font-sans select-none ${className}`}
      style={{
        boxSizing: 'border-box',
        backgroundImage:
          activeScene === 1
            ? "url('/images/luces/jardin-luces-fondo-maestro.webp')"
            : undefined,
      }}
    >
      {/* KEYFRAMES & ESTILOS DE LLAMA Y RESPLANDOR */}
      <style jsx global>{`
        @keyframes liveRealisticFlameSway {
          0%, 100% {
            transform: rotate(-1.2deg) skewX(-0.8deg) scale(1, 1);
            filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 38px rgba(245, 158, 11, 0.65)) drop-shadow(0 0 75px rgba(234, 88, 12, 0.4));
          }
          20% {
            transform: rotate(2deg) skewX(1.2deg) scale(1.04, 0.96);
            filter: drop-shadow(0 0 22px rgba(251, 191, 36, 1)) drop-shadow(0 0 48px rgba(244, 114, 182, 0.55)) drop-shadow(0 0 85px rgba(245, 158, 11, 0.5));
          }
          45% {
            transform: rotate(-1.8deg) skewX(-1.5deg) scale(0.96, 1.05);
            filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 40px rgba(234, 88, 12, 0.6)) drop-shadow(0 0 70px rgba(234, 88, 12, 0.35));
          }
          68% {
            transform: rotate(1.2deg) skewX(0.8deg) scale(1.02, 0.98);
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 44px rgba(245, 158, 11, 0.65));
          }
          85% {
            transform: rotate(-0.5deg) skewX(-0.5deg) scale(0.99, 1.01);
            filter: drop-shadow(0 0 17px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 38px rgba(245, 158, 11, 0.55));
          }
        }

        @keyframes liveFlameCoreJitter {
          0%, 100% {
            opacity: 0.96;
            transform: scale(1) translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.06, 0.94) translateY(-1px);
          }
          40% {
            opacity: 0.88;
            transform: scale(0.95, 1.03) translateY(1px);
          }
          70% {
            opacity: 0.98;
            transform: scale(1.03, 0.97) translateY(-0.5px);
          }
        }

        @keyframes liveAuraBreath {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.95;
          }
        }

        @keyframes liveWingsFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }

        @keyframes liveSparkleFloat {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(1.2);
            opacity: 0;
          }
        }

        .animate-live-aura-breath {
          animation: liveAuraBreath 3.5s ease-in-out infinite;
        }

        .animate-live-wings-float {
          animation: liveWingsFloat 3.8s ease-in-out infinite;
        }
      `}</style>

      {/* GUÍA DE ENCUADRE TIKTOK (SOLO SI SE SOLICITA EN EL MONITOR DE PRODUCCIÓN) */}
      {showSafeZone && (
        <TikTokSafeZoneGuide opacity={safeZoneOpacity} showDetails={true} />
      )}

      {/* ========================================================================= */}
      {/* ESCENA 1: EL JARDÍN DE LAS LUCES · CIELO DE LUCES (ESCENARIO MAESTRO LIVE) */}
      {/* ========================================================================= */}
      {activeScene === 1 && (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
          {/* 1. CONTADORES SUPERIORES CON ICONOS CELESTIALES SVG EXCLUSIVOS (Y: ~18.8%) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 sm:gap-2.5 z-30 w-full max-w-[98%]"
            style={{ top: '18.8%' }}
          >
            {/* Píldora 1: Mural Global (Estrella Celestial de Oro Cálido) */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFFDF8]/96 backdrop-blur-md border border-[#D5B77B]/80 shadow-[0_4px_16px_rgba(78,35,100,0.12)]">
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="starGoldGradLive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="45%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="8" fill="#FEF08A" fillOpacity="0.45" />
                <path d="M12 2L14.2 9.2L21.5 9.2L15.6 13.5L17.8 20.7L12 16.4L6.2 20.7L8.4 13.5L2.5 9.2L9.8 9.2L12 2Z" fill="url(#starGoldGradLive)" stroke="#B45309" strokeWidth="0.5" />
                <circle cx="12" cy="12" r="1.8" fill="#FFFFFF" />
              </svg>
              <span className="text-[13px] sm:text-[14.5px] font-serif font-bold text-[#2A0820] tracking-wide whitespace-nowrap">
                <strong className="font-black text-[15px] sm:text-[17px] text-[#1E0417]">{muralStarsCount || 151}</strong> en el mural
              </span>
            </div>

            {/* Píldora 2: Altar Web (Chispas Celestiales en Rosa Frambuesa / Malva) */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFF8FA]/96 backdrop-blur-md border border-[#EAC2D8]/85 shadow-[0_4px_16px_rgba(78,35,100,0.12)]">
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sparkleRoseGradLive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBCFE8" />
                    <stop offset="45%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#BE185D" />
                  </linearGradient>
                </defs>
                <circle cx="9" cy="9" r="6" fill="#F472B6" fillOpacity="0.35" />
                <path d="M9 2C9 5.866 5.866 9 2 9C5.866 9 9 12.134 9 16C9 12.134 12.134 9 16 9C12.134 9 9 5.866 9 2Z" fill="url(#sparkleRoseGradLive)" />
                <circle cx="9" cy="9" r="1.4" fill="#FFFFFF" />
                <path d="M18 4C18 5.657 16.657 7 15 7C16.657 7 18 8.343 18 10C18 8.343 19.343 7 21 7C19.343 7 18 5.657 18 4Z" fill="#F472B6" />
                <path d="M17 15C17 16.105 16.105 17 15 17C16.105 17 17 17.895 17 19C17 17.895 17.895 17 19 17C17.895 17 17 16.105 17 15Z" fill="#F9A8D4" />
              </svg>
              <span className="text-[13px] sm:text-[14.5px] font-serif font-bold text-[#2A0820] tracking-wide whitespace-nowrap">
                <strong className="font-black text-[15px] sm:text-[17px] text-[#1E0417]">{webCandlesCount || 18}</strong> en la web
              </span>
            </div>

            {/* Píldora 3: Sesión LIVE (Cirio Celestial en Malva y Llama Cálida) */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF0FC]/96 backdrop-blur-md border border-[#D09BD8]/80 shadow-[0_4px_16px_rgba(78,35,100,0.12)]">
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="flameGradLive" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FEF08A" />
                  </linearGradient>
                  <linearGradient id="candleGradLive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5D0FE" />
                    <stop offset="60%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#7E22CE" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="7" r="5" fill="#FDE047" fillOpacity="0.4" />
                <path d="M12 2C10.5 4.5 9.5 6 9.5 7.8C9.5 9.2 10.6 10.3 12 10.3C13.4 10.3 14.5 9.2 14.5 7.8C14.5 6 13.5 4.5 12 2Z" fill="url(#flameGradLive)" />
                <circle cx="12" cy="8" r="1.1" fill="#FFFFFF" />
                <line x1="12" y1="10.3" x2="12" y2="12" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
                <rect x="8.5" y="12" width="7" height="9" rx="2" fill="url(#candleGradLive)" stroke="#A855F7" strokeWidth="0.6" />
                <rect x="9.8" y="13.2" width="1.8" height="6.5" rx="0.9" fill="#FFFFFF" fillOpacity="0.55" />
              </svg>
              <span className="text-[13px] sm:text-[14.5px] font-serif font-bold text-[#2A0820] tracking-wide whitespace-nowrap">
                <strong className="font-black text-[15px] sm:text-[17px] text-[#1E0417]">{sessionCandlesCount}</strong> en este directo
              </span>
            </div>
          </div>

          {/* 2. MEMORIAL SECUNDARIO: 20 NOMBRES VISIBLES (5 LÍNEAS × 4 NOMBRES) (AMPLIADOS 25-30%) (Y: ~24.0%) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-30 w-full max-w-[96%] pointer-events-none"
            style={{ top: '24.0%' }}
          >
            {/* Subtítulo discreto con mayor presencia y elegancia */}
            <span
              className="font-serif italic font-semibold text-[13px] sm:text-[15.5px] text-[#4E1E3C] tracking-wide"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: '0 1px 3px rgba(255,255,255,0.98), 0 0 8px rgba(255,255,255,0.85)',
              }}
            >
              Pequeñas luces que nunca se apagan
            </span>
            <span className="text-[11px] text-[#8B1E5F]/70 my-0.5 leading-none font-bold">♡</span>

            {/* Rejilla de 5 líneas × 4 nombres con tipografía 25-30% más grande y separación mejorada */}
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full max-w-[620px]">
              {nameRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center justify-center gap-1.5 sm:gap-3 w-full">
                  {row.map((name, colIdx) => (
                    <React.Fragment key={colIdx}>
                      {colIdx > 0 && (
                        <span className="text-[10px] sm:text-[12px] text-[#8B1E5F]/60 font-bold select-none">·</span>
                      )}
                      <span
                        className="font-serif italic font-bold text-[13.5px] sm:text-[16.5px] text-[#421731] tracking-wide whitespace-nowrap"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 7px rgba(255,255,255,0.85)',
                        }}
                      >
                        {name}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 3. VELA PROTAGONISTA: ANIMACIÓN NATURAL INTEGRADA SOBRE LA LLAMA ORIGINAL */}
          <div
            className="absolute pointer-events-none z-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: '21.5%', top: '35.0%', width: '130px', height: '130px' }}
          >
            {/* Aureola ambiental cálida permanente y muy suave respirando con la llama */}
            <div
              className="absolute w-28 h-28 rounded-full pointer-events-none animate-live-aura-breath"
              style={{
                background: 'radial-gradient(circle, rgba(255, 190, 60, 0.40) 0%, rgba(245, 140, 30, 0.18) 50%, transparent 75%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* Suave parpadeo lumínico directo sobre el núcleo de la llama de la foto */}
            <div
              className="absolute w-6 h-11 pointer-events-none"
              style={{
                top: '47px',
                borderRadius: '50% 50% 40% 40% / 60% 60% 30% 30%',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 220, 110, 0.55) 45%, rgba(255, 140, 20, 0.20) 80%, transparent 100%)',
                mixBlendMode: 'screen',
                animation: 'liveFlameCoreJitter 0.25s ease-in-out infinite alternate',
              }}
            />

            {/* Resplandor cálido adicional al pulsar "Encender vela" (sin aros ni indicadores artificiales) */}
            {isJustLit && (
              <div
                className="absolute w-32 h-32 rounded-full pointer-events-none blur-md animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 230, 140, 0.6) 0%, rgba(245, 160, 60, 0.3) 45%, transparent 75%)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </div>

          {/* 4. PLACA CONMEMORATIVA DEL PEDESTAL (CTA DE PARTICIPACIÓN + NOMBRE + DEDICATORIA) */}
          {currentPet ? (
            <>
              {/* CTA PRINCIPAL DE PARTICIPACIÓN: INMEDIATAMENTE ENCIMA DEL NOMBRE PROTAGONISTA */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-center z-30 w-[86%] max-w-[540px] pointer-events-none"
                style={{ top: '65.2%' }}
              >
                <span
                  className="font-serif italic font-extrabold text-[15.5px] sm:text-[19px] text-[#3D122A] tracking-wide"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.95), 0 0 18px rgba(255,255,255,0.7)',
                  }}
                >
                  Enciende una luz por tu angelito 🕯️
                </span>
              </div>

              {/* ZONA SUPERIOR: NOMBRE PROTAGONISTA CENTRADO CON RESPLANDOR CELESTIAL */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-center z-30 w-[76%] max-w-[500px] px-4"
                style={{ top: '69.6%', height: '5.6%' }}
              >
                {/* Halo / Círculo rojizo-dorado expansivo al entrar el perrito */}
                {isJustLit && (
                  <>
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-xl animate-ping"
                      style={{
                        width: '280px',
                        height: '110px',
                        background: 'radial-gradient(ellipse at center, rgba(244, 63, 94, 0.48) 0%, rgba(225, 29, 72, 0.28) 45%, rgba(251, 191, 36, 0.15) 70%, transparent 90%)',
                        mixBlendMode: 'screen',
                        animationDuration: '3.0s',
                        animationIterationCount: 1,
                      }}
                    />
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-lg animate-pulse"
                      style={{
                        width: '240px',
                        height: '80px',
                        background: 'radial-gradient(ellipse at center, rgba(251, 113, 133, 0.35) 0%, rgba(244, 63, 94, 0.18) 50%, transparent 80%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  </>
                )}

                <span
                  className="leading-none tracking-normal select-none text-center block w-full truncate relative z-10"
                  style={{
                    fontFamily: "'Allura', cursive",
                    color: '#1A0213',
                    fontSize: nameFontSize,
                    textShadow: '0 1px 4px rgba(255,255,255,1), 0 2px 10px rgba(255,255,255,0.95), 0 0 18px rgba(255,255,255,0.85)',
                  }}
                >
                  {currentPet}
                </span>
              </div>

              {/* ZONA INFERIOR: DEDICATORIA DE 1 O 2 LÍNEAS EQUILIBRADAS */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-30 w-[76%] max-w-[500px] px-3"
                style={{ top: '75.6%', height: '5.5%' }}
              >
                {dedicationLines.length > 1 ? (
                  <div className="w-full flex flex-col items-center justify-center leading-tight">
                    {dedicationLines.map((line, idx) => (
                      <p
                        key={idx}
                        className="font-serif italic font-bold text-[#23051B] tracking-normal"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: dedicationFontSize,
                          textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.85)',
                          margin: 0,
                          lineHeight: '1.2',
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p
                    className="font-serif italic font-bold text-[#23051B] leading-tight tracking-normal"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: dedicationFontSize,
                      textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.85)',
                      textWrap: 'balance',
                      margin: 0,
                      lineHeight: '1.25',
                    }}
                  >
                    {rawDedication}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Estado de reposo / Altar inicial */
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center py-1 text-center z-30 w-[84%] max-w-[540px]"
              style={{ top: '65.2%', height: '14.5%' }}
            >
              {/* CTA principal en reposo */}
              <span
                className="font-serif italic font-extrabold text-[16px] sm:text-[20px] text-[#3D122A] tracking-wide mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.95), 0 0 18px rgba(255,255,255,0.7)',
                }}
              >
                Enciende una luz por tu angelito 🕯️
              </span>
              <span
                className="font-serif italic font-extrabold text-[17px] sm:text-[21px] text-[#24051B] tracking-wide mt-1"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: '0 1px 4px rgba(255,255,255,1), 0 0 12px rgba(255,255,255,0.95)',
                }}
              >
                Un altar eterno de luz y amor
              </span>
              <span className="text-sm text-[#8B1E5F] my-0.5 leading-none font-black">♡</span>
              <p
                className="font-serif italic font-bold text-[14px] sm:text-[17px] text-[#4A1736] mt-0.5"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: '0 1px 3px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.85)',
                }}
              >
                Escribe el nombre de tu ángel en el chat
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ESCENAS OPCIONALES CONSERVADAS EN EL CÓDIGO (VISOR GHIBLI & LUZ DEL REFUGIO) */}
      {/* ========================================================================= */}
      {activeScene !== 1 && (
        <>
          {/* CABECERA PARA ESCENAS 2 Y 3 */}
          <header className="relative z-10 pt-5 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#B83C7E]/25 text-[#FBCFE8] border border-[#F0BED6]/40 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
                En Directo
              </span>
              <span className="text-xs font-bold text-[#FDE8F1]">
                {activeScene === 2 ? 'Visor de Recuerdos' : 'Luz del Refugio'}
              </span>
            </div>

            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-200/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-300/30">
                  🌟 {muralStarsCount || 151} en el Mural
                </span>
                <span className="text-xs font-black text-amber-300 flex items-center gap-1 bg-pink-500/15 px-2 py-0.5 rounded-md border border-pink-400/30">
                  <span>🕯️</span> {sessionCandlesCount} en este directo
                </span>
              </div>
              <span className="text-[10px] text-pink-200/70 font-serif">
                todaslasmascotasvanalcielo.com
              </span>
            </div>
          </header>

          <main className="relative z-10 flex-1 flex flex-col justify-center px-5 py-2">
            {/* ESCENA 2: VISOR GHIBLI · CARTAS AL CIELO (7 cartas predefinidas) */}
            {activeScene === 2 && currentLetter && (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <div className="w-full max-w-[350px] bg-gradient-to-b from-[#FFFDFE] via-[#FFF5F8] to-[#FCE7F3] text-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-[#FBCFE8] relative overflow-hidden text-center">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-28 bg-gradient-to-b from-[#F472B6]/25 to-transparent rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center justify-center -mt-2 mb-2 animate-live-wings-float">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#F3D5E4] text-[10px] font-black text-[#8C3F71] uppercase tracking-wider shadow-xs">
                      <span>📖</span> Del Libro de los Ángeles
                    </div>
                  </div>

                  <div className="relative mx-auto mb-3">
                    <div className="relative w-[92px] h-[116px] mx-auto rounded-t-full rounded-b-2xl overflow-hidden bg-pink-100 border-3 border-amber-300 shadow-lg ring-3 ring-pink-200/70">
                      <img
                        src={currentLetter.photoUrl}
                        alt={currentLetter.petName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-[#EC4899] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                      ★ Slot ({currentLetter.slot})
                    </div>
                  </div>

                  <div className="mt-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2A78] leading-tight">
                      {currentLetter.petName}
                    </h2>
                    <p className="text-xs font-bold text-[#BE185D] mt-0.5">
                      {currentLetter.years || 'Amor Eterno'} · {currentLetter.family}
                    </p>
                  </div>

                  <div className="bg-white/80 border border-[#FBCFE8] rounded-2xl p-4 my-3 shadow-xs">
                    <p className="font-serif italic text-sm sm:text-base text-[#2D0F31] leading-relaxed">
                      «{currentLetter.message}»
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8C5A7B] pt-1 border-t border-[#F3D5E4]">
                    <span>Mural Global de Ángeles</span>
                    <span className="text-[#B83C7E] flex items-center gap-1 font-extrabold">
                      Huella Inolvidable ✨
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  {PRELOADED_LETTERS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentLetterIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ESCENA 3: LUZ DEL REFUGIO (HOMENAJE SOLIDARIO A VAIANA) */}
            {activeScene === 3 && currentAngel && (
              <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
                <div className="w-full max-w-[350px] bg-gradient-to-b from-[#2B1038] via-[#21092F] to-[#150420] border-2 border-[#F3D5E4]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF0F6] text-[#8C3F71] border border-[#F0BED6] mb-3 shadow-xs">
                    🐾 Reconocimiento Corazón de Ángel
                  </div>

                  <div className="relative mx-auto mb-3">
                    <div className="relative w-[96px] h-[118px] mx-auto rounded-t-full rounded-b-2xl overflow-hidden bg-pink-100 border-3 border-amber-400 shadow-xl ring-3 ring-pink-400/40">
                      <img
                        src={currentAngel.photoUrl}
                        alt={currentAngel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = currentAngel.fallbackPhotoUrl;
                        }}
                      />
                    </div>
                    <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 ${currentAngel.badgeColor} text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap`}>
                      {currentAngel.badge}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#FFFDFB]">
                      {currentAngel.name} 🐾
                    </h2>
                    <p className="text-xs font-bold text-amber-300 mt-0.5">
                      {currentAngel.shelterName}
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 my-3 shadow-xs">
                    <p className="font-serif italic text-xs sm:text-[13px] text-pink-100 leading-relaxed">
                      {currentAngel.history}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#B83C7E]/30 to-[#8C3F71]/30 border border-[#F0BED6]/30 rounded-xl p-2.5 text-[11px] text-pink-200 font-semibold leading-snug">
                    🎁 El 50% de cada recuerdo apadrina a los compañeros que siguen esperando un hogar en el refugio.
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="relative z-10 pb-6 px-5 text-center space-y-2">
            <div className="bg-gradient-to-r from-amber-500/20 via-[#EC4899]/20 to-[#8C3F71]/20 backdrop-blur-md border border-[#F3D5E4]/30 rounded-2xl py-2.5 px-4 shadow-lg">
              <p className="text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5">
                <span>💬</span>
                <span>Escribe en el chat su nombre y una velita 🕯️</span>
              </p>
              <p className="text-[10px] text-pink-200/80 mt-0.5 font-serif">
                Uniremos su luz al Altar en voz alta durante esta noche
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}