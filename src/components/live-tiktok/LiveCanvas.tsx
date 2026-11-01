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
    sessionCandlesCount,
  } = state;

  const currentLetter = PRELOADED_LETTERS[currentLetterIndex] || PRELOADED_LETTERS[0];
  const currentAngel = SHELTER_ANGELS[currentShelterIndex] || SHELTER_ANGELS[0];

  // Cálculo de mascota protagonista activa en el altar
  const currentPet = activePetName.trim();
  const rawDedication = activePetDedication.trim() || (currentPet ? 'Tu luz seguirá brillando\nen nuestros corazones' : '');
  const isJustLit = Boolean(candleLitAt && Date.now() - candleLitAt < 4500);

  // Lista de hasta 5 nombres recientes para el ticker superior sin truncar el estado
  const recentCandles = candles.slice(0, 5);

  // Auto-adaptación de escala tipográfica según longitud del nombre (sin deformar letras)
  const nameLength = currentPet.length;
  let nameFontSize = 'clamp(44px, 11.5vw, 124px)'; // Nombres cortos: Chloé, Bro, Xena
  if (nameLength > 18) {
    nameFontSize = 'clamp(20px, 5.2vw, 56px)'; // Nombres muy largos: Maximiliano Fernando
  } else if (nameLength > 12) {
    nameFontSize = 'clamp(26px, 6.8vw, 76px)'; // Nombres largos: Mary Margaret
  } else if (nameLength > 6) {
    nameFontSize = 'clamp(34px, 8.8vw, 96px)'; // Nombres medios: Juliette
  }

  // Auto-adaptación de escala para la dedicatoria de hasta 2 líneas
  const dedicationLength = rawDedication.length;
  let dedicationFontSize = 'clamp(13px, 2.8vw, 30px)';
  if (dedicationLength > 60) {
    dedicationFontSize = 'clamp(10px, 2.1vw, 22px)';
  } else if (dedicationLength > 35) {
    dedicationFontSize = 'clamp(11.5px, 2.4vw, 25px)';
  }

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
          {/* 1. CONTADORES SUPERIORES INDEPENDIENTES (Y: ~24.5% en 1080x1920) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2.5 sm:gap-4 z-20 w-full max-w-[90%]"
            style={{ top: '24.2%' }}
          >
            {/* Píldora Mural Global (Dato real verificado de Supabase) */}
            <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#FFFDF8]/80 backdrop-blur-md border border-[#DDBF80]/55 shadow-[0_4px_16px_rgba(78,35,100,0.08)]">
              <span className="text-xs sm:text-sm drop-shadow-xs">⭐</span>
              <span className="text-[11px] sm:text-xs font-serif font-bold text-[#3B142D] tracking-wide whitespace-nowrap">
                <strong className="font-extrabold text-[#2E0D1E]">{muralStarsCount || 151}</strong> en el mural
              </span>
            </div>

            {/* Píldora Sesión LIVE (Contador propio de la emisión actual) */}
            <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#FAF0FC]/80 backdrop-blur-md border border-[#D5A0DC]/55 shadow-[0_4px_16px_rgba(78,35,100,0.08)]">
              <span className="text-xs sm:text-sm drop-shadow-xs">🕯️</span>
              <span className="text-[11px] sm:text-xs font-serif font-bold text-[#3B142D] tracking-wide whitespace-nowrap">
                <strong className="font-extrabold text-[#2E0D1E]">{sessionCandlesCount}</strong> en este directo
              </span>
            </div>
          </div>

          {/* 2. TICKER DE LUCES RECIENTES (Y: ~30.2% en 1080x1920) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-20 w-full max-w-[90%]"
            style={{ top: '30.2%' }}
          >
            <span
              className="font-serif italic text-xs sm:text-sm text-[#4A1E3C] tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Pequeñas luces que nunca se apagan
            </span>
            <span className="text-[10px] text-[#A05C88] my-0.5 leading-none">♡</span>

            {/* Ticker horizontal de hasta 5 mascotas recientes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap px-2 max-w-full">
              {recentCandles.map((c, idx) => (
                <React.Fragment key={c.id || idx}>
                  {idx > 0 && (
                    <span className="text-[10px] text-[#A05C88]/70 select-none">♡</span>
                  )}
                  <span
                    className={`font-serif italic text-xs sm:text-sm text-[#38112C] font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] transition-all duration-700 ${
                      idx === 0 && isJustLit ? 'text-[#8B1E5F] font-black scale-105' : ''
                    }`}
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {c.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3. VELA PROTAGONISTA: AURA Y LLAMA VIVA SINCRONIZADA CON LA MECHA (Y: ~52%) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center"
            style={{ top: '51.8%', width: '120px', height: '120px' }}
          >
            {/* Aureola cálida permanente respirando suavemente */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-t from-amber-400/25 via-amber-200/20 to-transparent blur-xl animate-live-aura-breath" />

            {/* Transición luminosa delicada (Luminous Flare Bloom) al pulsar "Encender vela" */}
            {isJustLit && (
              <>
                <div
                  className="absolute inset-0 flex items-center justify-center animate-ping"
                  style={{ animationDuration: '2.8s', animationIterationCount: 1 }}
                >
                  <div className="w-28 h-28 rounded-full bg-radial from-amber-300/60 via-pink-400/30 to-transparent blur-md" />
                </div>
                {/* Partículas doradas flotantes */}
                <div
                  className="absolute -top-3 left-4 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_#FDE047]"
                  style={{ animation: 'liveSparkleFloat 2.5s ease-out forwards' }}
                />
                <div
                  className="absolute -top-6 right-5 w-1 h-1 rounded-full bg-pink-100 shadow-[0_0_8px_#FFF]"
                  style={{ animation: 'liveSparkleFloat 3s ease-out 0.4s forwards' }}
                />
              </>
            )}

            {/* Micro-chispa celestial sobre la mecha de la vela */}
            <div className="absolute top-[38px] w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_12px_#FDE047] animate-pulse" />
          </div>

          {/* 4. PLACA CONMEMORATIVA DEL PEDESTAL (Y: ~67.2% en 1080x1920) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-20 w-[68%] max-w-[500px]"
            style={{ top: '67.2%', height: '12.8%' }}
          >
            {currentPet ? (
              <div className="w-full h-full flex flex-col justify-between items-center py-1">
                {/* Nombre Protagonista con Allura y adaptación automática de tamaño */}
                <div className="flex-1 flex items-center justify-center w-full px-2 overflow-hidden">
                  <span
                    className="leading-none tracking-normal select-none text-center block w-full truncate"
                    style={{
                      fontFamily: "'Allura', cursive",
                      color: '#2E0D1E',
                      fontSize: nameFontSize,
                      textShadow: '0 1px 3px rgba(255,255,255,0.85), 0 2px 8px rgba(220,180,230,0.4)',
                    }}
                  >
                    {currentPet}
                  </span>
                </div>

                {/* Frase conmemorativa de máximo 2 líneas */}
                <div className="w-full px-2 pb-0.5 text-center flex items-center justify-center">
                  <p
                    className="font-serif italic text-[#4A1E3C] leading-snug line-clamp-2 max-w-[95%]"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: dedicationFontSize,
                      textShadow: '0 1px 2px rgba(255,255,255,0.85)',
                    }}
                  >
                    {rawDedication}
                  </p>
                </div>
              </div>
            ) : (
              /* Estado de reposo / Altar inicial */
              <div className="w-full h-full flex flex-col justify-center items-center py-1 text-center">
                <span
                  className="leading-none tracking-normal select-none block"
                  style={{
                    fontFamily: "'Allura', cursive",
                    color: '#3B142D',
                    fontSize: 'clamp(32px, 5.5vw, 56px)',
                    textShadow: '0 1px 3px rgba(255,255,255,0.85)',
                  }}
                >
                  Ángeles en el Cielo
                </span>
                <p
                  className="font-serif italic text-xs sm:text-sm text-[#5C2B4E] mt-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    textShadow: '0 1px 2px rgba(255,255,255,0.85)',
                  }}
                >
                  Escribe el nombre de tu ángel en el chat 🕯️
                </p>
              </div>
            )}
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