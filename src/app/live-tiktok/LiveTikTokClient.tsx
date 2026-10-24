'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Cartas al cielo con fotos reales y dedicatorias
interface LetterItem {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  years?: string;
  family: string;
  message: string;
  photoUrl: string;
  slot: string;
}

const PRELOADED_LETTERS: LetterItem[] = [
  {
    id: 'letter-nano',
    petName: 'Nano',
    species: 'perro',
    years: '2011 — 2026',
    family: 'Familia Cerro',
    message: 'Cómo siempre te decía dándote besitos: no te amaré toda tu vida, te amaré toda la mía. Gracias por quince años de miradas que me salvaron cada día.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/nano_1792605318398.jpg',
    slot: '503, 499',
  },
  {
    id: 'letter-chloe',
    petName: 'Chloe',
    species: 'gato',
    years: '2014 — 2026',
    family: 'Familia Spinella',
    message: 'No hay despedida para quien vive para siempre en el corazón. Tu ronroneo suave sigue siendo la paz de toda mi casa en las noches.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/chloe_1791659186920.jpg',
    slot: '499, 499',
  },
  {
    id: 'letter-house',
    petName: 'House',
    species: 'perro',
    years: '2007 — 2020',
    family: 'Familia House',
    message: 'Trece años corriendo a mi lado, esperándome tras cada puerta con la misma alegría del primer día. Descansa en paz, mi viejo y noble amigo.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg',
    slot: '495, 499',
  },
  {
    id: 'letter-mary',
    petName: 'Mary Margaret',
    species: 'gato',
    years: '2012 — 2023',
    family: 'Familia Gómez',
    message: 'Tus patitas dejaron huellas imborrables en nuestra alma. Gracias por once años de cariño dulce y silencioso. Siempre en nuestro cielo.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/mary_margaret_1791704934801.jpg',
    slot: '497, 503',
  },
  {
    id: 'letter-juliette',
    petName: 'Juliette',
    species: 'perro',
    years: '2013 — 2018',
    family: 'Refugio Nueva Vida',
    message: 'Tu mirada dulce vive en cada estrella que ilumina la noche. Encontraste un hogar en nuestros corazones antes de partir.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg',
    slot: '497, 495',
  },
];

// Velas encendidas en el Altar
interface LiveCandle {
  id: string;
  name: string;
  species: string;
  timeAgo: string;
  isNew?: boolean;
}

const INITIAL_CANDLES: LiveCandle[] = [
  { id: 'c1', name: 'Nano', species: '🐾 Perrito', timeAgo: 'hace 2 min' },
  { id: 'c2', name: 'Chloe', species: '✨ Gatita', timeAgo: 'hace 4 min' },
  { id: 'c3', name: 'House', species: '🐾 Perrito', timeAgo: 'hace 7 min' },
  { id: 'c4', name: 'Vaiana', species: '🐾 Almas de 4 patas', timeAgo: 'hace 12 min' },
  { id: 'c5', name: 'Juliette', species: '🐾 Refugio Nueva Vida', timeAgo: 'hace 15 min' },
  { id: 'c6', name: 'Mary Margaret', species: '✨ Gatita', timeAgo: 'hace 19 min' },
  { id: 'c7', name: 'Toby', species: '🐾 Golden Retriever', timeAgo: 'hace 24 min' },
  { id: 'c8', name: 'Luna', species: '✨ Gatita blanca', timeAgo: 'hace 28 min' },
];

export default function LiveTikTokClient() {
  // Escena activa: 1 = Cielo de luces, 2 = Carta al cielo (Visor Ghibli), 3 = Luz del refugio
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);

  // Cartas y navegación
  const [letters] = useState<LetterItem[]>(PRELOADED_LETTERS);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);

  // Velas comunitarias
  const [candles, setCandles] = useState<LiveCandle[]>(INITIAL_CANDLES);
  const [weeklyCount, setWeeklyCount] = useState<number>(438);

  // Modal para encender vela en vivo
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newLivePetName, setNewLivePetName] = useState<string>('');
  const [newLiveType, setNewLiveType] = useState<string>('Perrito');

  // Ajustes de emisión OBS
  const [hideControls, setHideControls] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [autoPlayLetters, setAutoPlayLetters] = useState<boolean>(false);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) return;

      if (e.key === '1') setActiveScene(1);
      if (e.key === '2') setActiveScene(2);
      if (e.key === '3') setActiveScene(3);
      if (e.key === 'h' || e.key === 'H') setHideControls((prev) => !prev);
      if (e.key === 'z' || e.key === 'Z') setShowSafeZone((prev) => !prev);
      if (e.key === 'n' || e.key === 'N') setShowAddModal(true);

      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentLetterIndex((prev) => (prev + 1) % letters.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentLetterIndex((prev) => (prev - 1 + letters.length) % letters.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, letters.length]);

  // Autoplay de cartas
  useEffect(() => {
    if (!autoPlayLetters || activeScene !== 2) return;
    const interval = setInterval(() => {
      setCurrentLetterIndex((prev) => (prev + 1) % letters.length);
    }, 14000);
    return () => clearInterval(interval);
  }, [autoPlayLetters, activeScene, letters.length]);

  const handleAddLiveCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLivePetName.trim()) return;

    const newCandle: LiveCandle = {
      id: `live-${Date.now()}`,
      name: newLivePetName.trim(),
      species: `🐾 ${newLiveType}`,
      timeAgo: 'ahora mismo',
      isNew: true,
    };

    setCandles((prev) => [newCandle, ...prev]);
    setWeeklyCount((prev) => prev + 1);
    setNewLivePetName('');
    setShowAddModal(false);
  };

  const currentLetter = letters[currentLetterIndex];

  return (
    <div className="relative w-full min-h-screen bg-[#0C061A] text-white flex items-center justify-center overflow-hidden font-sans select-none">

      {/* ESTILOS DE LLAMA, RESPLANDOR Y ACUARELA GHIBLI */}
      <style jsx global>{`
        @keyframes ghibliFlame {
          0%, 100% {
            transform: scale(1) rotate(-1deg);
            opacity: 0.96;
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 45px rgba(244, 114, 182, 0.5));
          }
          25% {
            transform: scale(1.05, 0.95) rotate(1.8deg);
            opacity: 1;
            filter: drop-shadow(0 0 28px rgba(251, 191, 36, 1)) drop-shadow(0 0 55px rgba(236, 72, 153, 0.6));
          }
          50% {
            transform: scale(0.96, 1.04) rotate(-1.5deg);
            opacity: 0.92;
            filter: drop-shadow(0 0 22px rgba(251, 191, 36, 0.85)) drop-shadow(0 0 48px rgba(245, 158, 11, 0.5));
          }
          75% {
            transform: scale(1.03, 0.98) rotate(1deg);
            opacity: 0.98;
            filter: drop-shadow(0 0 26px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 52px rgba(244, 114, 182, 0.55));
          }
        }

        @keyframes auraBreath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.95;
          }
        }

        @keyframes wingsFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }

        .animate-ghibli-flame {
          animation: ghibliFlame 2.8s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .animate-aura-breath {
          animation: auraBreath 4s ease-in-out infinite;
        }

        .animate-wings-float {
          animation: wingsFloat 3.8s ease-in-out infinite;
        }
      `}</style>

      {/* CONTENEDOR VERTICAL 9:16 (1080x1920) CON FONDO CIELO DE LUCES & PALETA GHIBLI */}
      <main className="relative w-full max-w-[450px] sm:max-w-[480px] h-screen max-h-[960px] sm:max-h-[100vh] bg-gradient-to-b from-[#180A26] via-[#120721] to-[#0A0314] flex flex-col justify-between overflow-hidden shadow-2xl border-x border-[#F3D5E4]/20">

        {/* RESPLANDOR CELESTIAL DE FONDO (ACUARELA GHIBLI / CIELO DE LUCES) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Brillo superior en tono amatista y rosa amanecer */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[380px] h-[340px] bg-gradient-to-b from-[#B83C7E]/25 via-[#EC4899]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          {/* Brillo cálido central de vela */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          {/* Estrellas titilantes */}
          <div className="absolute top-16 left-8 w-1 h-1 rounded-full bg-amber-200 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-28 right-10 w-1.5 h-1.5 rounded-full bg-pink-200 animate-pulse" />
          <div className="absolute top-72 left-6 w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-96 right-8 w-1 h-1 rounded-full bg-amber-100 animate-ping" style={{ animationDuration: '6s' }} />
        </div>

        {/* GUÍA DE ZONA SEGURA DE TIKTOK (ACTÍVALA CON Z) */}
        {showSafeZone && (
          <div className="absolute inset-0 pointer-events-none z-50 border-4 border-dashed border-amber-400/40 flex flex-col justify-between p-4">
            <div className="h-[15%] bg-rose-500/20 rounded-xl flex items-center justify-center text-[11px] font-bold text-amber-200">
              ⚠️ ZONA SUPERIOR TIKTOK (Avatares, Título y Botón Seguir)
            </div>
            <div className="h-[55%] border-2 border-emerald-400/50 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-xs font-black text-emerald-300">
              ✅ ZONA SEGURA 100% VISIBLE (Fotos, Nombres y Cartas)
            </div>
            <div className="h-[30%] bg-rose-500/20 rounded-xl flex items-center justify-center text-[11px] font-bold text-amber-200 text-center px-4">
              ⚠️ ZONA INFERIOR TIKTOK (Chat de comentarios, regalos y caja de texto)
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PARTE SUPERIOR (CABECERA GHIBLI · CIELO DE LUCES)        */}
        {/* ======================================================== */}
        <header className="relative z-10 pt-5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#B83C7E]/25 text-[#FBCFE8] border border-[#F0BED6]/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
              En Directo
            </span>
            <span className="text-xs font-bold text-[#FDE8F1]">
              Cielo Lleno de Luces
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1 justify-end">
              <span>🕯️</span> {weeklyCount} velas vivas
            </span>
            <span className="text-[10px] text-pink-200/70 font-serif">
              todaslasmascotasvanalcielo.com
            </span>
          </div>
        </header>

        {/* ======================================================== */}
        {/* ZONA CENTRAL ACTIVA (LAS 3 VISTAS GHIBLI / CIELO DE LUCES)*/}
        {/* ======================================================== */}
        <div className="relative z-10 flex-1 flex flex-col justify-start pt-3 sm:pt-6 px-5 pb-2">

          {/* ---------------------------------------------------- */}
          {/* VISTA 1: CIELO DE LUCES (ALTAR DE VELAS EN VIVO)     */}
          {/* ---------------------------------------------------- */}
          {activeScene === 1 && (
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
              
              {/* LA VELA CENTRAL MAJESTUOSA EN LA PARTE SUPERIOR */}
              <div className="relative flex flex-col items-center pt-1 pb-3">
                {/* Aura de resplandor áureo y rosa celestial */}
                <div className="absolute -top-16 w-56 h-56 rounded-full bg-gradient-to-r from-amber-400/30 via-[#EC4899]/20 to-orange-500/25 blur-3xl animate-aura-breath pointer-events-none" />

                {/* Llama Ghibli viva */}
                <div className="relative z-20 animate-ghibli-flame mb-0.5">
                  <div className="w-[36px] h-[75px] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 rounded-full shadow-[0_0_36px_rgba(251,191,36,1)]" />
                  <div className="absolute top-6 left-2 w-[18px] h-[38px] bg-white/95 rounded-full blur-[1px]" />
                </div>

                {/* Mecha */}
                <div className="w-[3px] h-[12px] bg-stone-900 -mt-1.5 z-10" />

                {/* Vaso de cristal con cera cálida marfil */}
                <div className="w-[96px] h-[116px] bg-gradient-to-b from-[#FFFDF9] via-[#FDF3E7] to-[#F5DEC3] rounded-t-xl rounded-b-3xl shadow-2xl relative border-2 border-amber-200/70 ring-4 ring-[#B83C7E]/20 flex flex-col justify-between p-2.5 overflow-hidden">
                  <div className="w-full h-3.5 bg-amber-100/70 rounded-full blur-[1px]" />
                  <div className="w-full text-center pb-1">
                    <span className="text-[10px] font-serif font-black text-[#5C3C58] tracking-widest uppercase block">
                      Llama Eterna
                    </span>
                  </div>
                </div>
              </div>

              {/* Título de Cielo de Luces con caligrafía serena y curva rosa */}
              <div className="space-y-1.5 z-10 pt-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFDFB] leading-tight">
                  Un cielo lleno <span className="text-[#F472B6]">de luces ✨</span>
                </h1>
                <p className="text-xs text-[#E9D5E4] max-w-[320px] mx-auto leading-relaxed">
                  Cada vela encendida es una historia de amor que sigue viva. Ningún angelito parte del todo mientras lo recordemos.
                </p>
              </div>

              {/* LISTA DINÁMICA DE VELAS (ESTILO TARJETAS DE CIELO DE LUCES) */}
              <div className="w-full max-w-[340px] bg-white/10 backdrop-blur-md border border-[#F3D5E4]/30 rounded-3xl p-4 shadow-xl space-y-2 z-10">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-200 border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <span>🕯️</span> Velas encendidas esta semana
                  </span>
                  <span className="text-[#FBCFE8] font-mono text-[10px]">Altar Vivo</span>
                </div>

                <div className="max-h-[140px] overflow-hidden space-y-1.5 text-left">
                  {candles.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                        c.isNew
                          ? 'bg-gradient-to-r from-amber-500/30 to-[#EC4899]/30 border border-amber-300 text-amber-100 animate-pulse'
                          : 'bg-white/5 border border-white/5 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">🕯️</span>
                        <span className="font-bold text-[#FFFDFB]">{c.name}</span>
                        <span className="text-[10px] text-pink-200/70">{c.species}</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono">{c.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VISTA 2: CARTA AL CIELO (VISOR CORAZÓN GHIBLI)       */}
          {/* ---------------------------------------------------- */}
          {activeScene === 2 && currentLetter && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
              
              {/* TARJETA VISOR CORAZÓN GHIBLI (ALGODÓN CÁLIDO + MARCO ARQUEADO) */}
              <div className="w-full max-w-[350px] bg-gradient-to-b from-[#FFFDFE] via-[#FFF5F8] to-[#FCE7F3] text-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-[#FBCFE8] relative overflow-hidden text-center">
                
                {/* Resplandor suave superior Ghibli */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-28 bg-gradient-to-b from-[#F472B6]/25 to-transparent rounded-full blur-xl pointer-events-none" />

                {/* Alas conmemorativas de Studio Ghibli flotando */}
                <div className="flex items-center justify-center -mt-2 mb-2 animate-wings-float">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#F3D5E4] text-[10px] font-black text-[#8C3F71] uppercase tracking-wider shadow-xs">
                    <span>📖</span> Del Libro de los Ángeles
                  </div>
                </div>

                {/* Retrato Arqueado Ghibli con borde dorado y halo rosa */}
                <div className="relative mx-auto mb-3">
                  <div className="relative w-[92px] h-[116px] mx-auto rounded-t-full rounded-b-2xl overflow-hidden bg-pink-100 border-3 border-amber-300 shadow-lg ring-3 ring-pink-200/70">
                    <img
                      src={currentLetter.photoUrl}
                      alt={currentLetter.petName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Coordenadas en sello */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-[#EC4899] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    ★ Slot ({currentLetter.slot})
                  </div>
                </div>

                {/* Nombre y Fechas en Playfair Display */}
                <div className="mt-3">
                  <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2A78] leading-tight">
                    {currentLetter.petName}
                  </h2>
                  <p className="text-xs font-bold text-[#BE185D] mt-0.5">
                    {currentLetter.years || 'Amor Eterno'} · {currentLetter.family}
                  </p>
                </div>

                {/* Dedicatoria emotiva en papiro cálido */}
                <div className="bg-white/80 border border-[#FBCFE8] rounded-2xl p-4 my-3 shadow-xs">
                  <p className="font-serif italic text-sm sm:text-base text-[#2D0F31] leading-relaxed">
                    «{currentLetter.message}»
                  </p>
                </div>

                {/* Pie de carta */}
                <div className="flex items-center justify-between text-[10px] font-bold text-[#8C5A7B] pt-1 border-t border-[#F3D5E4]">
                  <span>Mural Global de Ángeles</span>
                  <span className="text-[#B83C7E] flex items-center gap-1 font-extrabold">
                    Huella Inolvidable ✨
                  </span>
                </div>
              </div>

              {/* Indicador de carta actual */}
              <div className="flex items-center gap-1.5 mt-3">
                {letters.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentLetterIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentLetterIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/25'
                    }`}
                  />
                ))}
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VISTA 3: LUZ DEL REFUGIO (CORAZÓN DE ÁNGEL GHIBLI)   */}
          {/* ---------------------------------------------------- */}
          {activeScene === 3 && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
              
              {/* TARJETA SOLIDARIA CORAZONES DE ÁNGEL EN PALETA CIELO DE LUCES */}
              <div className="w-full max-w-[350px] bg-gradient-to-b from-[#2B1038] via-[#21092F] to-[#150420] border-2 border-[#F3D5E4]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-center">
                
                {/* Emblema superior Corazones de Ángel */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF0F6] text-[#8C3F71] border border-[#F0BED6] mb-3 shadow-xs">
                  🐾 Reconocimiento Corazón de Ángel
                </div>

                {/* Retrato Arqueado Ghibli de Vaiana */}
                <div className="relative mx-auto mb-3">
                  <div className="relative w-[92px] h-[116px] mx-auto rounded-t-full rounded-b-2xl overflow-hidden bg-pink-100 border-3 border-amber-400 shadow-xl ring-3 ring-pink-400/40">
                    <img
                      src="/images/solidario/vaiana_real_mural.jpg"
                      alt="Vaiana"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/shelter_1792348293948.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    👑 Fundadora #0005
                  </div>
                </div>

                {/* Nombre y Protectora */}
                <div className="mt-3">
                  <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#FFFDFB]">
                    Vaiana 🐾
                  </h2>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">
                    Almas de 4 patas (Málaga)
                  </p>
                </div>

                {/* Historia conmovedora (extraída de cielo-lleno-de-luces) */}
                <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 my-3 shadow-xs">
                  <p className="font-serif italic text-xs sm:text-[13px] text-pink-100 leading-relaxed">
                    «Vaiana era solo un bebé cuando la rescatamos. Conoció el amor y la calidez de una familia de acogida antes de partir. Hoy sus 9 estrellas brillan para siempre en el mural.»
                  </p>
                </div>

                {/* Compromiso Solidario */}
                <div className="bg-gradient-to-r from-[#B83C7E]/30 to-[#8C3F71]/30 border border-[#F0BED6]/30 rounded-xl p-2.5 text-[11px] text-pink-200 font-semibold leading-snug">
                  🎁 El 50% de cada recuerdo apadrina a los compañeros que siguen esperando un hogar en el refugio.
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* PARTE INFERIOR: RESPETO ZONA SEGURA DE TIKTOK & LLAMADA  */}
        {/* ======================================================== */}
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

      </main>

      {/* ======================================================== */}
      {/* BARRA DE CONTROL PARA OBS (OCULTABLE CON H O BOTÓN)      */}
      {/* ======================================================== */}
      {!hideControls ? (
        <aside className="fixed bottom-4 z-40 bg-[#160B24]/95 backdrop-blur-md border-2 border-[#F3D5E4]/40 rounded-3xl p-3 shadow-2xl flex items-center gap-2 max-w-[94vw] overflow-x-auto text-xs">
          
          {/* Conmutador de escenas */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveScene(1)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 1
                  ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                  : 'text-pink-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 1"
            >
              [1] 🕯️ Cielo de Luces
            </button>

            <button
              onClick={() => setActiveScene(2)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 2
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#BE185D] text-white shadow-md font-black'
                  : 'text-pink-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 2"
            >
              [2] 💌 Visor Ghibli
            </button>

            <button
              onClick={() => setActiveScene(3)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 3
                  ? 'bg-gradient-to-r from-[#B83C7E] to-[#8C3F71] text-white shadow-md font-black'
                  : 'text-pink-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 3"
            >
              [3] 🐾 Luz del Refugio
            </button>
          </div>

          {/* Navegación de cartas si está en Escena 2 */}
          {activeScene === 2 && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() =>
                  setCurrentLetterIndex(
                    (prev) => (prev - 1 + letters.length) % letters.length
                  )
                }
                className="px-2 py-1 rounded-lg text-pink-200 hover:bg-white/10 font-bold"
                title="Carta anterior (Flecha Izq)"
              >
                ◀
              </button>
              <span className="text-[11px] font-mono text-amber-300 px-1">
                {currentLetterIndex + 1}/{letters.length}
              </span>
              <button
                onClick={() =>
                  setCurrentLetterIndex((prev) => (prev + 1) % letters.length)
                }
                className="px-2 py-1 rounded-lg text-pink-200 hover:bg-white/10 font-bold"
                title="Siguiente carta (Flecha Der o Espacio)"
              >
                ▶
              </button>
              <button
                onClick={() => setAutoPlayLetters((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  autoPlayLetters ? 'bg-emerald-600 text-white' : 'text-pink-300'
                }`}
                title="Pase automático cada 14 seg"
              >
                Auto {autoPlayLetters ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Botón Encender Velita al Vuelo */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-xs hover:opacity-90 shadow-md cursor-pointer flex items-center gap-1"
            title="Atajo: Tecla N"
          >
            ➕ Encender Vela en Vivo
          </button>

          {/* Guía de Zona Segura */}
          <button
            onClick={() => setShowSafeZone((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-2xl text-[11px] font-bold border transition-all ${
              showSafeZone
                ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                : 'text-pink-200 border-[#F3D5E4]/30 hover:bg-white/10'
            }`}
            title="Atajo: Tecla Z"
          >
            📐 {showSafeZone ? 'Ocultar Guía' : 'Ver Zona Segura'}
          </button>

          {/* Ocultar barra (Modo OBS) */}
          <button
            onClick={() => setHideControls(true)}
            className="px-2.5 py-1.5 rounded-2xl text-[11px] font-bold text-gray-400 hover:text-white border border-white/10"
            title="Atajo: Tecla H"
          >
            Ocultar (H) ✕
          </button>

        </aside>
      ) : (
        /* BOTÓN FLOTANTE MINIMALISTA CUANDO LOS CONTROLES ESTÁN OCULTOS */
        <button
          onClick={() => setHideControls(false)}
          className="fixed bottom-3 right-3 z-40 w-8 h-8 rounded-full bg-purple-900/60 hover:bg-purple-800 text-pink-200 border border-pink-400/30 flex items-center justify-center text-xs opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Mostrar controles (Tecla H)"
        >
          ⚙️
        </button>
      )}

      {/* MODAL PARA ENCENDER VELA DICHA EN EL CHAT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A0B28] border-2 border-amber-400/70 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-serif font-black text-lg text-amber-200 flex items-center gap-2">
                <span>🕯️</span> Encender Velita del Chat
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-pink-300 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-pink-200/80">
              Escribe el nombre de la mascota que pidieron en los comentarios de TikTok para que aparezca al instante en pantalla.
            </p>

            <form onSubmit={handleAddLiveCandle} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-pink-200 block mb-1">
                  Nombre del angelito:
                </label>
                <input
                  type="text"
                  value={newLivePetName}
                  onChange={(e) => setNewLivePetName(e.target.value)}
                  placeholder="Ej: Maya, Toby, Coco..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-pink-400/40 text-amber-200 placeholder-pink-400/50 font-bold outline-hidden focus:border-amber-400 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-pink-200 block mb-1">
                  Tipo:
                </label>
                <div className="flex items-center gap-2">
                  {['Perrito', 'Gatito', 'Compañero'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewLiveType(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        newLiveType === t
                          ? 'bg-amber-400 text-stone-950 border-amber-300'
                          : 'bg-white/5 text-pink-200 border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-pink-300 hover:bg-white/5 border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-md hover:opacity-90 cursor-pointer"
                >
                  Encender ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
