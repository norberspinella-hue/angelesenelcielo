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
  counterTextVariant?: 'white' | 'plum';
}

export function LiveCanvas({
  state,
  showSafeZone = false,
  safeZoneOpacity = 0.85,
  className = '',
  counterTextVariant = 'white',
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

  // 1. NOMBRE PRINCIPAL: 4 Escalones Tipográficos Obligatorios y Centrado Dinámico
  const nameLength = currentPet.length;
  let nameFontSize = 'clamp(40px, 8.5vw, 100px)'; // 1 a 5 chars (Poppy, Luna, Coco)
  if (nameLength > 13) {
    nameFontSize = 'clamp(28px, 5.8vw, 74px)';   // 14+ chars (Mary Margaret)
  } else if (nameLength > 9) {
    nameFontSize = 'clamp(32px, 6.8vw, 84px)';   // 10 a 13 chars (Maximiliano)
  } else if (nameLength > 5) {
    nameFontSize = 'clamp(36px, 7.8vw, 92px)';   // 6 a 9 chars (Juliette)
  }

  // 2. DEDICATORIA: Control Estricto de 1 o 2 Líneas Equilibradas (Sin Palabras Huérfanas)
  const dedicationLength = rawDedication.length;
  let dedicationFontSize = 'clamp(18px, 3.4vw, 34px)';
  if (dedicationLength > 65) {
    dedicationFontSize = 'clamp(15px, 2.7vw, 27px)';
  } else if (dedicationLength > 40) {
    dedicationFontSize = 'clamp(16px, 3.0vw, 30px)';
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

        @keyframes ctaFlameSway {
          0%, 100% {
            transform: rotate(-1.5deg) scale(0.98, 1.02);
            opacity: 0.95;
          }
          25% {
            transform: rotate(1.4deg) scale(1.02, 0.98) translateY(-0.4px);
            opacity: 1;
          }
          50% {
            transform: rotate(-0.8deg) scale(0.97, 1.03) translateY(0.2px);
            opacity: 0.92;
          }
          75% {
            transform: rotate(1.5deg) scale(1.03, 0.97) translateY(-0.2px);
            opacity: 0.98;
          }
        }

        @keyframes ctaAuraBreathe {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }

        .animate-cta-flame {
          transform-origin: 18px 21px;
          animation: ctaFlameSway 2.5s ease-in-out infinite;
        }

        .animate-cta-aura {
          transform-origin: 18px 14px;
          animation: ctaAuraBreathe 3.2s ease-in-out infinite;
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
          {/* 1. CONTADORES SUPERIORES EN 2 FILAS CON 85% DE OPACIDAD (Y: >= 230px, top: 12.4%) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1.5 z-30 w-full max-w-[620px] px-2"
            style={{ top: '12.4%' }}
          >
            {/* FILA 1: En el mural + En la web (Alineados horizontalmente a partir de Y=230px) */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {/* Píldora 1: Mural Global (Estrella de Oro Cálido) - Fondo 85% opacidad */}
              <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 253, 249, 0.48) 0%, rgba(255, 253, 248, 0.36) 30%, rgba(250, 240, 245, 0.26) 70%, rgba(242, 222, 233, 0.32) 100%)',
                  border: '1.4px solid rgba(232, 189, 121, 0.85)',
                  boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.80), inset 0 -2px 3px 0 rgba(118, 84, 109, 0.16), 0 4px 12px 0 rgba(118, 84, 109, 0.25), 0 0 14px 0 rgba(232, 189, 121, 0.30)',
                  backdropFilter: 'blur(10px) saturate(125%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(125%)',
                }}>
                <img src="/images/icons/plans/icon-plan-estrella.svg" className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] shrink-0 object-contain select-none -my-1.5" alt="Plan Estrella" />
                <span
                  className={`text-[12.5px] sm:text-[14px] font-serif font-bold tracking-wide whitespace-nowrap ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#4A1E37]'}`}
                  style={counterTextVariant === 'white' ? { textShadow: '0 1px 2px rgba(118, 84, 109, 0.45), 0 0 4px rgba(118, 84, 109, 0.25)' } : undefined}
                >
                  <strong className={`font-black text-[14.5px] sm:text-[16.5px] ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#331024]'}`}>{muralStarsCount || 151}</strong> en el mural
                </span>
              </div>

              {/* Píldora 2: Web Global (Destellos Rosa Frambuesa) - Fondo 85% opacidad */}
              <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 251, 253, 0.48) 0%, rgba(255, 248, 250, 0.36) 30%, rgba(252, 238, 244, 0.26) 70%, rgba(245, 220, 232, 0.32) 100%)',
                  border: '1.4px solid rgba(232, 184, 203, 0.85)',
                  boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.80), inset 0 -2px 3px 0 rgba(118, 84, 109, 0.16), 0 4px 12px 0 rgba(118, 84, 109, 0.25), 0 0 14px 0 rgba(232, 184, 203, 0.30)',
                  backdropFilter: 'blur(10px) saturate(125%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(125%)',
                }}>
                <img src="/images/icons/plans/icon-plan-inicial.svg" className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] shrink-0 object-contain select-none -my-1.5" alt="Plan Inicial" />
                <span
                  className={`text-[12.5px] sm:text-[14px] font-serif font-bold tracking-wide whitespace-nowrap ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#4A1E37]'}`}
                  style={counterTextVariant === 'white' ? { textShadow: '0 1px 2px rgba(118, 84, 109, 0.45), 0 0 4px rgba(118, 84, 109, 0.25)' } : undefined}
                >
                  <strong className={`font-black text-[14.5px] sm:text-[16.5px] ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#331024]'}`}>{webCandlesCount}</strong> en la web
                </span>
              </div>
            </div>

            {/* FILA 2: En este directo (Centrado horizontalmente debajo) - Fondo 85% opacidad */}
            <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(252, 246, 254, 0.48) 0%, rgba(250, 240, 252, 0.36) 30%, rgba(245, 232, 250, 0.26) 70%, rgba(238, 216, 246, 0.32) 100%)',
                border: '1.4px solid rgba(203, 168, 219, 0.85)',
                boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.80), inset 0 -2px 3px 0 rgba(118, 84, 109, 0.16), 0 4px 12px 0 rgba(118, 84, 109, 0.25), 0 0 14px 0 rgba(203, 168, 219, 0.30)',
                backdropFilter: 'blur(10px) saturate(125%)',
                WebkitBackdropFilter: 'blur(10px) saturate(125%)',
              }}>
              <svg className="w-[16px] h-[22px] shrink-0 select-none -my-0.5" viewBox="0 0 36 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="14" r="18" fill="url(#ctaCandleAuraLiveFinal)" className="animate-cta-aura" />
                <g className="animate-cta-flame">
                  <path d="M 18 2 C 24.5 8, 25.2 14, 18 20 C 10.8 14, 11.5 8, 18 2 Z" fill="url(#ctaFlameOuterGradLiveFinal)" />
                  <path d="M 18 5.5 C 22 10, 22.3 14, 18 18 C 13.7 14, 14 10, 18 5.5 Z" fill="url(#ctaFlameInnerGradLiveFinal)" />
                  <ellipse cx="18" cy="14.5" rx="2" ry="3.5" fill="#FFFFFF" opacity="0.95" />
                </g>
                <path d="M 18 17.5 Q 18.8 19.5, 18 22" stroke="#5A2E12" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <ellipse cx="18" cy="22.5" rx="8.3" ry="2" fill="url(#ctaWaxRimGradLiveFinal)" stroke="#C8A265" strokeWidth="0.8" />
                <path d="M 9.7 22.5 L 10 44 C 10 47, 26 47, 26 44 L 26.3 22.5 Z" fill="url(#ctaCandleBodyGradLiveFinal)" stroke="#B89355" strokeWidth="0.8" />
                <path d="M 14 23.5 L 14.4 43 C 15.5 43.5, 16.2 43.5, 16.5 43 L 16.2 23.5 Z" fill="#FFFFFF" opacity="0.5" />
                <path d="M 24.1 23 C 25.9 26, 25.9 30, 24.1 31 C 23 30, 23.4 26, 24.1 23 Z" fill="#FFF8EC" opacity="0.85" stroke="#D5B77B" strokeWidth="0.5" />
                <ellipse cx="18" cy="44" rx="9" ry="2.2" fill="url(#ctaCandleBaseGradLiveFinal)" stroke="#9A7532" strokeWidth="0.8" />
              </svg>
              <span
                className={`text-[12.5px] sm:text-[14px] font-serif font-bold tracking-wide whitespace-nowrap ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#4A1E37]'}`}
                style={counterTextVariant === 'white' ? { textShadow: '0 1px 2px rgba(118, 84, 109, 0.45), 0 0 4px rgba(118, 84, 109, 0.25)' } : undefined}
              >
                <strong className={`font-black text-[14.5px] sm:text-[16.5px] ${counterTextVariant === 'white' ? 'text-[#FFFDF8]' : 'text-[#331024]'}`}>{sessionCandlesCount}</strong> en este directo
              </span>
            </div>
          </div>

          {/* 2. MEMORIAL SECUNDARIO: 20 NOMBRES VISIBLES (5 LÍNEAS × 4 NOMBRES) (AMPLIADOS 25-30%) (Y: ~24.0%) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-30 w-full max-w-[96%] pointer-events-none"
            style={{ top: '21.2%' }}
          >
            {/* Subtítulo discreto en blanco marfil con sombra malva suave */}
            <span
              className="font-serif italic font-semibold text-[13px] sm:text-[15.5px] text-[#FFFDF8] tracking-wide"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: '0 1px 3px rgba(118, 84, 109, 0.45), 0 0 6px rgba(118, 84, 109, 0.25)',
              }}
            >
              Pequeñas luces que nunca se apagan
            </span>
            <span
              className="text-[11px] text-[#FFFDF8]/90 my-0.5 leading-none font-bold select-none"
              style={{ textShadow: '0 1px 2px rgba(118, 84, 109, 0.8)' }}
            >
              ♡
            </span>

            {/* Rejilla de 5 líneas × 4 nombres en blanco marfil #FFFDF8 con sombra malva oscuro #76546D */}
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full max-w-[620px]">
              {nameRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center justify-center gap-1.5 sm:gap-3 w-full">
                  {row.map((name, colIdx) => (
                    <React.Fragment key={colIdx}>
                      {colIdx > 0 && (
                        <span className="text-[10px] sm:text-[12px] text-[#FFFDF8]/60 font-bold select-none">·</span>
                      )}
                      <span
                        className="font-serif italic font-bold text-[13.5px] sm:text-[16.5px] text-[#FFFDF8] tracking-wide whitespace-nowrap"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          textShadow: '0 1px 3px rgba(118, 84, 109, 0.45), 0 0 6px rgba(118, 84, 109, 0.25)',
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
            {/* Aureola ambiental cálida difusa permanente (100% natural, sin aros ni círculos digitales) */}
            <div
              className="absolute w-28 h-28 rounded-full pointer-events-none animate-live-aura-breath blur-lg"
              style={{
                background: 'radial-gradient(circle, rgba(255, 195, 80, 0.28) 0%, rgba(245, 140, 30, 0.10) 50%, transparent 75%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* Suave respiración lumínica orgánica sobre el núcleo cálido de la fotografía */}
            <div
              className="absolute w-5 h-10 pointer-events-none blur-xs"
              style={{
                top: '47px',
                borderRadius: '50% 50% 40% 40% / 60% 60% 30% 30%',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(255, 220, 110, 0.35) 45%, transparent 80%)',
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

          {/* 3. CTA DE PARTICIPACIÓN EN LA HUELLA TALLADA DEL CORAZÓN (Y: ~53.0%, 2 LÍNEAS + VELA DORADA CENTRADA DEBAJO) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-30 pointer-events-none w-[75%] max-w-[380px]"
            style={{ top: '53.0%' }}
          >
            {/* Texto en 2 líneas en blanco marfil cálido #FFFDF8 con sombra malva suave #76546D */}
            <span
              className="font-serif italic font-bold text-[16px] sm:text-[18.5px] text-[#FFFDF8] tracking-wide leading-none"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: '0 1px 3px rgba(118, 84, 109, 0.45), 0 0 6px rgba(118, 84, 109, 0.25)',
              }}
            >
              Enciende una luz
            </span>
            <span
              className="font-serif italic font-bold text-[16px] sm:text-[18.5px] text-[#FFFDF8] tracking-wide leading-tight mt-1"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: '0 1px 3px rgba(118, 84, 109, 0.45), 0 0 6px rgba(118, 84, 109, 0.25)',
              }}
            >
              por tu angelito
            </span>

            {/* Vela SVG Celestial Premium centrada debajo del texto (con mini llama viva animada) */}
            <svg className="w-[22px] h-[32px] sm:w-[26px] sm:h-[36px] shrink-0 mt-1" viewBox="0 0 36 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="ctaCandleAuraLiveFinal" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.80" />
                  <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.40" />
                  <stop offset="70%" stopColor="#EA580C" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ctaFlameOuterGradLiveFinal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="20%" stopColor="#FDE68A" />
                  <stop offset="55%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="ctaFlameInnerGradLiveFinal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="ctaWaxRimGradLiveFinal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EED5A5" />
                  <stop offset="50%" stopColor="#FFFDF7" />
                  <stop offset="100%" stopColor="#D9B778" />
                </linearGradient>
                <linearGradient id="ctaCandleBodyGradLiveFinal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EDE0C8" />
                  <stop offset="22%" stopColor="#FFFDF9" />
                  <stop offset="60%" stopColor="#F7EEDD" />
                  <stop offset="85%" stopColor="#E8D5B5" />
                  <stop offset="100%" stopColor="#D2B47E" />
                </linearGradient>
                <linearGradient id="ctaCandleBaseGradLiveFinal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B89355" />
                  <stop offset="50%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#9A7532" />
                </linearGradient>
              </defs>
              {/* Halo cálido sutil animado */}
              <circle cx="18" cy="14" r="18" fill="url(#ctaCandleAuraLiveFinal)" className="animate-cta-aura" />
              
              {/* Mini llama viva animada (oscilación lateral y ligero cambio de tamaño) */}
              <g className="animate-cta-flame">
                <path d="M 18 2 C 24.5 8, 25.2 14, 18 20 C 10.8 14, 11.5 8, 18 2 Z" fill="url(#ctaFlameOuterGradLiveFinal)" />
                <path d="M 18 5.5 C 22 10, 22.3 14, 18 18 C 13.7 14, 14 10, 18 5.5 Z" fill="url(#ctaFlameInnerGradLiveFinal)" />
                <ellipse cx="18" cy="14.5" rx="2" ry="3.5" fill="#FFFFFF" opacity="0.95" />
              </g>

              {/* Mecha fina exactamente debajo de la llama */}
              <path d="M 18 17.5 Q 18.8 19.5, 18 22" stroke="#5A2E12" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <ellipse cx="18" cy="22.5" rx="8.3" ry="2" fill="url(#ctaWaxRimGradLiveFinal)" stroke="#C8A265" strokeWidth="0.8" />
              <path d="M 9.7 22.5 L 10 44 C 10 47, 26 47, 26 44 L 26.3 22.5 Z" fill="url(#ctaCandleBodyGradLiveFinal)" stroke="#B89355" strokeWidth="0.8" />
              <path d="M 14 23.5 L 14.4 43 C 15.5 43.5, 16.2 43.5, 16.5 43 L 16.2 23.5 Z" fill="#FFFFFF" opacity="0.5" />
              <path d="M 24.1 23 C 25.9 26, 25.9 30, 24.1 31 C 23 30, 23.4 26, 24.1 23 Z" fill="#FFF8EC" opacity="0.85" stroke="#D5B77B" strokeWidth="0.5" />
              <ellipse cx="18" cy="44" rx="9" ry="2.2" fill="url(#ctaCandleBaseGradLiveFinal)" stroke="#9A7532" strokeWidth="0.8" />
            </svg>
          </div>

          {/* 4. PLACA CONMEMORATIVA DEL PEDESTAL (NOMBRE PROTAGONISTA + DEDICATORIA) CON DISTANCIA ANTI-COLISIÓN */}
          {currentPet ? (
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-start text-center z-30 w-[82%] max-w-[540px] px-3 pointer-events-none"
              style={{ top: '65.2%' }}
            >
              {/* Halo / Círculo rojizo-dorado expansivo al entrar el perrito */}
              {isJustLit && (
                <>
                  <div
                    className="absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-xl animate-ping"
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
                    className="absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-lg animate-pulse"
                    style={{
                      width: '240px',
                      height: '80px',
                      background: 'radial-gradient(ellipse at center, rgba(251, 113, 133, 0.35) 0%, rgba(244, 63, 94, 0.18) 50%, transparent 80%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                </>
              )}

              {/* ZONA SUPERIOR: NOMBRE PROTAGONISTA */}
              <div className="w-full flex items-center justify-center relative z-10">
                <span
                  className="leading-none tracking-normal select-none text-center block w-full truncate relative z-10"
                  style={{
                    fontFamily: "'Allura', cursive",
                    color: '#FFFDF8',
                    fontSize: nameFontSize,
                    textShadow: '0 2px 6px rgba(118, 84, 109, 0.48), 0 0 16px rgba(118, 84, 109, 0.28)',
                  }}
                >
                  {currentPet}
                </span>
              </div>

              {/* ZONA INFERIOR: DEDICATORIA CON SEPARACIÓN GARANTIZADA DE 44-48PX (NUNCA SOLAPA) */}
              <div
                className="w-full flex flex-col items-center justify-center text-center relative z-10"
                style={{ marginTop: 'clamp(32px, 4.5vw, 48px)', lineHeight: 1.22 }}
              >
                {dedicationLines.length > 1 ? (
                  <div className="w-full flex flex-col items-center justify-center leading-tight">
                    {dedicationLines.map((line, idx) => (
                      <p
                        key={idx}
                        className="font-serif italic font-bold text-[#FFFDF8] tracking-normal"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: dedicationFontSize,
                          textShadow: '0 1.5px 4px rgba(118, 84, 109, 0.45), 0 0 8px rgba(118, 84, 109, 0.25)',
                          margin: 0,
                          lineHeight: '1.22',
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p
                    className="font-serif italic font-bold text-[#FFFDF8] leading-tight tracking-normal"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: dedicationFontSize,
                      textShadow: '0 1.5px 4px rgba(118, 84, 109, 0.45), 0 0 8px rgba(118, 84, 109, 0.25)',
                      textWrap: 'balance',
                      margin: 0,
                      lineHeight: '1.25',
                    }}
                  >
                    {rawDedication}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Estado de reposo / Altar inicial */
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center py-1 text-center z-30 w-[84%] max-w-[540px]"
              style={{ top: '67.0%', height: '11.0%' }}
            >
              <span
                className="font-serif italic font-extrabold text-[17px] sm:text-[21px] text-[#FFFDF8] tracking-wide"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: '0 1.5px 4px rgba(118, 84, 109, 0.45), 0 0 8px rgba(118, 84, 109, 0.25)',
                }}
              >
                Un altar eterno de luz y amor
              </span>
              <span className="text-sm text-[#FFFDF8]/90 my-0.5 leading-none font-black" style={{ textShadow: '0 1px 2px rgba(118, 84, 109, 0.8)' }}>♡</span>
              <p
                className="font-serif italic font-bold text-[14px] sm:text-[17px] text-[#FFFDF8] mt-0.5"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: '0 1.5px 4px rgba(118, 84, 109, 0.45), 0 0 8px rgba(118, 84, 109, 0.25)',
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