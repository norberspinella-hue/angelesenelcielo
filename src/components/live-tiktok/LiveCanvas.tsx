'use client';

import React from 'react';
import {
  LiveStreamState,
  PRELOADED_LETTERS,
  SHELTER_ANGELS,
} from './types';
import { TikTokSafeZoneGuide } from './TikTokSafeZoneGuide';
import { LiveLoopVideo } from './LiveLoopVideo';

interface LiveCanvasProps {
  state: LiveStreamState;
  showSafeZone?: boolean;
  safeZoneOpacity?: number;
  className?: string;
  counterTextVariant?: 'white' | 'plum';
  forceMutedPreview?: boolean;
}

export function LiveCanvas({
  state,
  showSafeZone = false,
  safeZoneOpacity = 0.85,
  className = '',
  counterTextVariant = 'white',
  forceMutedPreview = false,
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

  // Memorial de nombres añadidos exclusivamente durante la emisión
  const sessionCandleNames = Array.from(new Set(candles.map(c => c.name).filter(Boolean)));
  const totalMemorialCount = sessionCandleNames.length;

  // Rotación automática suave por tandas de hasta 20 nombres cuando hay más de 20 registros
  const [rotationBatchIndex, setRotationBatchIndex] = React.useState(0);

  React.useEffect(() => {
    if (totalMemorialCount <= 20) return;
    const interval = setInterval(() => {
      setRotationBatchIndex(prev => (prev + 1) % Math.ceil(totalMemorialCount / 20));
    }, 14000);
    return () => clearInterval(interval);
  }, [totalMemorialCount]);

  const startIdx = totalMemorialCount > 0 ? (rotationBatchIndex * 20) % totalMemorialCount : 0;
  const activeMemorialBatch = sessionCandleNames.slice(startIdx, startIdx + 20);

  // Agrupación dinámica en filas de hasta 4 nombres
  const nameRows: string[][] = [];
  for (let i = 0; i < activeMemorialBatch.length; i += 4) {
    nameRows.push(activeMemorialBatch.slice(i, i + 4));
  }

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
  let dedicationFontSize = 'clamp(16px, 3.1vw, 30.5px)';
  if (dedicationLength > 65) {
    dedicationFontSize = 'clamp(13.5px, 2.4vw, 24px)';
  } else if (dedicationLength > 40) {
    dedicationFontSize = 'clamp(14.5px, 2.7vw, 27px)';
  }

  // Formateo en líneas limpias para evitar que palabras queden aisladas en 3ª línea
  const dedicationLines = rawDedication.includes('\n')
    ? rawDedication.split('\n').filter(Boolean)
    : [rawDedication];

  return (
    <div
      className={`relative w-full h-full ${
        activeScene === 1
          ? 'aspect-video bg-[#0C061A]'
          : 'aspect-[9/16] bg-[#0C061A] bg-gradient-to-b from-[#180A26] via-[#120721] to-[#0A0314]'
      } text-white flex flex-col justify-between overflow-hidden font-sans select-none ${className}`}
      style={{
        boxSizing: 'border-box',
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
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
          style={{ containerType: 'inline-size' }}
        >
          {/* Vídeo 16:9 en bucle continuo sin distorsión ni saltos */}
          <LiveLoopVideo
            mutedByDefault={forceMutedPreview}
            allowUnmuteControl={!forceMutedPreview}
          />

          {/* 1. CONTADORES SUPERIORES EN 1 FILA (Mural Global + Web Global) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-30 w-full max-w-[620px] px-2"
            style={{ top: '12.4%' }}
          >
            {/* FILA 1: En el mural + En la web */}
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
          </div>

          {/* 2. MENSAJE CENTRAL DEL DIRECTO (Tipografía blanca elegante y legible sobre la escena) */}
          <div
            className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center text-center pointer-events-none px-10 py-6"
            style={{
              width: 'min(88%, 1040px)',
              background:
                'radial-gradient(ellipse at center, rgba(28, 12, 24, 0.20) 0%, rgba(28, 12, 24, 0.08) 42%, transparent 68%)',
            }}
          >
            <h2
              className="font-serif font-bold text-[#FFFDF8] tracking-wide leading-tight m-0"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(14px, 2.75cqi, 54px)',
                textShadow:
                  '0 2px 12px rgba(24, 10, 20, 0.88), 0 1px 3px rgba(24, 10, 20, 0.95), 0 0 24px rgba(45, 22, 38, 0.65)',
              }}
            >
              ¿Cómo se llamaba tu angelito?
            </h2>
            <p
              className="font-serif italic font-semibold text-[#FFFDF8]/95 tracking-wide leading-snug mt-1.5 m-0"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(11px, 1.75cqi, 34px)',
                textShadow:
                  '0 2px 10px rgba(24, 10, 20, 0.88), 0 1px 3px rgba(24, 10, 20, 0.95), 0 0 18px rgba(45, 22, 38, 0.60)',
              }}
            >
              Aquí puedes hablar de él, de tu pérdida.
            </p>
          </div>
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
                    🎁 Por cada apadrinamiento de 9,99 €, reservamos 5 € para ayudar a las protectoras a través de Corazones de Ángel.
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