'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Datos de cartas al cielo precargadas para la emisión
interface LetterItem {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  years?: string;
  family: string;
  message: string;
  photoUrl?: string;
  slot?: string;
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
    id: 'letter-toby',
    petName: 'Toby',
    species: 'perro',
    years: '2013 — 2025',
    family: 'Familia Martínez',
    message: 'Gracias por enseñarme lo que significa el amor incondicional. En cada atardecer y en cada estrella que brilla, sé que estás cuidándonos desde arriba.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg',
    slot: '490, 502',
  },
];

// Velas comunitarias iniciales
interface LiveCandle {
  id: string;
  name: string;
  species: string;
  timeAgo: string;
  isNew?: boolean;
}

const INITIAL_CANDLES: LiveCandle[] = [
  { id: 'c1', name: 'Nano', species: '🐾 Perrito', timeAgo: 'hace 2 min' },
  { id: 'c2', name: 'Chloe', species: '✨ Gatita', timeAgo: 'hace 5 min' },
  { id: 'c3', name: 'House', species: '🐾 Perrito', timeAgo: 'hace 9 min' },
  { id: 'c4', name: 'Juliette', species: '🐾 Refugio Nueva Vida', timeAgo: 'hace 14 min' },
  { id: 'c5', name: 'Vaiana', species: '🐾 Almas de 4 patas', timeAgo: 'hace 18 min' },
  { id: 'c6', name: 'Mary Margaret', species: '✨ Gatita', timeAgo: 'hace 22 min' },
  { id: 'c7', name: 'Toby', species: '🐾 Golden Retriever', timeAgo: 'hace 27 min' },
  { id: 'c8', name: 'Luna', species: '✨ Gatita persa', timeAgo: 'hace 31 min' },
  { id: 'c9', name: 'Bobby', species: '🐾 Fiel compañero', timeAgo: 'hace 35 min' },
];

export default function LiveTikTokClient() {
  // Escena activa: 1 = Cielo de luces, 2 = Carta al cielo, 3 = Luz del refugio
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);

  // Cartas y navegación
  const [letters] = useState<LetterItem[]>(PRELOADED_LETTERS);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);

  // Velas del directo
  const [candles, setCandles] = useState<LiveCandle[]>(INITIAL_CANDLES);
  const [weeklyCount, setWeeklyCount] = useState<number>(438);

  // Interacción en directo (Añadir velita del chat)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newLivePetName, setNewLivePetName] = useState<string>('');
  const [newLiveType, setNewLiveType] = useState<string>('Perrito');

  // Ajustes de emisión / Modo OBS
  const [hideControls, setHideControls] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [autoPlayLetters, setAutoPlayLetters] = useState<boolean>(false);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si está escribiendo en el modal, no disparar atajos
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

  // Autoplay de cartas opcional
  useEffect(() => {
    if (!autoPlayLetters || activeScene !== 2) return;
    const interval = setInterval(() => {
      setCurrentLetterIndex((prev) => (prev + 1) % letters.length);
    }, 14000);
    return () => clearInterval(interval);
  }, [autoPlayLetters, activeScene, letters.length]);

  // Añadir una velita dicha en el chat de TikTok
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
    <div className="relative w-full min-h-screen bg-[#060714] text-white flex items-center justify-center overflow-hidden font-sans select-none">

      {/* ESTILOS CSS PARA LLAMA DE VELA Y ANIMACIONES */}
      <style jsx global>{`
        @keyframes flameFlicker {
          0%, 100% {
            transform: scale(1) rotate(-1deg);
            opacity: 0.95;
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.85)) drop-shadow(0 0 45px rgba(245, 158, 11, 0.5));
          }
          25% {
            transform: scale(1.04, 0.96) rotate(1.5deg);
            opacity: 1;
            filter: drop-shadow(0 0 26px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 55px rgba(245, 158, 11, 0.65));
          }
          50% {
            transform: scale(0.97, 1.05) rotate(-1.5deg);
            opacity: 0.9;
            filter: drop-shadow(0 0 22px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 48px rgba(245, 158, 11, 0.55));
          }
          75% {
            transform: scale(1.02, 0.98) rotate(0.8deg);
            opacity: 0.98;
            filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 52px rgba(245, 158, 11, 0.6));
          }
        }

        @keyframes flameAuraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
        }

        @keyframes floatingDust {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-280px) translateX(25px);
            opacity: 0;
          }
        }

        .animate-flame {
          animation: flameFlicker 2.8s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .animate-aura {
          animation: flameAuraPulse 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* CONTENEDOR VERTICAL ESTRICTO 9:16 (1080x1920) */}
      <main className="relative w-full max-w-[450px] sm:max-w-[480px] h-screen max-h-[960px] sm:max-h-[100vh] bg-gradient-to-b from-[#060818] via-[#0E0C28] to-[#1E1138] flex flex-col justify-between overflow-hidden shadow-2xl border-x border-purple-900/30">

        {/* FONDO DE CONSTELACIONES Y PARTÍCULAS DE LUZ */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-12 left-8 w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-32 right-12 w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
          <div className="absolute top-64 left-1/4 w-1 h-1 rounded-full bg-purple-200 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute top-80 right-1/3 w-1.5 h-1.5 rounded-full bg-pink-200 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-40 left-10 w-1 h-1 rounded-full bg-amber-100 animate-pulse" />
          <div className="absolute bottom-60 right-8 w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDuration: '5s' }} />
        </div>

        {/* GUÍA VISUAL: ZONA SEGURA DE TIKTOK (OPCIONAL PARA TEST DE OBS) */}
        {showSafeZone && (
          <div className="absolute inset-0 pointer-events-none z-50 border-4 border-dashed border-yellow-400/40 flex flex-col justify-between p-4">
            <div className="h-[15%] bg-red-500/20 rounded-xl flex items-center justify-center text-[11px] font-bold text-yellow-300">
              ⚠️ ZONA SUPERIOR TIKTOK (Avatares, Título y Botón Seguir)
            </div>
            <div className="h-[55%] border-2 border-green-400/50 bg-green-500/10 rounded-2xl flex items-center justify-center text-xs font-black text-green-300">
              ✅ ZONA SEGURA 100% VISIBLE (Fotos, Nombres y Cartas)
            </div>
            <div className="h-[30%] bg-red-500/20 rounded-xl flex items-center justify-center text-[11px] font-bold text-yellow-300 text-center px-4">
              ⚠️ ZONA INFERIOR TIKTOK (Chat de comentarios, regalos y caja de texto)
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PARTE SUPERIOR (CABECERA DISCRETA DE LA TRANSMISIÓN)     */}
        {/* ======================================================== */}
        <header className="relative z-10 pt-5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              En Directo
            </span>
            <span className="text-xs font-semibold text-purple-200/80">
              Ritual del Cielo
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-amber-300 block">
              ✨ {weeklyCount} luces unidas
            </span>
            <span className="text-[10px] text-purple-300/70">
              todaslasmascotasvanalcielo.com
            </span>
          </div>
        </header>

        {/* ======================================================== */}
        {/* ZONA CENTRAL ACTIVA (ESCENAS DINÁMICAS 1, 2 Y 3)          */}
        {/* ======================================================== */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-2">

          {/* ---------------------------------------------------- */}
          {/* ESCENA 1: CIELO DE LUCES (ALTAR DE VELAS EN VIVO)     */}
          {/* ---------------------------------------------------- */}
          {activeScene === 1 && (
            <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
              
              {/* LA VELA CENTRAL CON LLAMA OSCILANTE */}
              <div className="relative flex flex-col items-center">
                {/* Halo de resplandor áureo */}
                <div className="absolute -top-12 w-44 h-44 rounded-full bg-amber-500/25 blur-2xl animate-aura pointer-events-none" />

                {/* La Llama viva */}
                <div className="relative z-10 animate-flame">
                  <div className="w-7 h-16 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 rounded-full shadow-[0_0_28px_rgba(251,191,36,0.9)] transform -translate-y-1" />
                  <div className="absolute top-5 left-1.5 w-4 h-9 bg-white/90 rounded-full blur-[1px]" />
                </div>

                {/* Mecha */}
                <div className="w-1 h-3 bg-stone-800 -mt-1" />

                {/* Cuerpo de la vela cilíndrica */}
                <div className="w-20 h-28 bg-gradient-to-b from-[#FFFDF9] via-[#FDF5E6] to-[#EAD5BA] rounded-t-lg rounded-b-2xl shadow-2xl relative overflow-hidden border border-amber-200/40">
                  <div className="absolute top-0 inset-x-0 h-3 bg-amber-100/60 rounded-full blur-[1px]" />
                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="text-[10px] font-serif text-amber-900/60 font-black tracking-widest uppercase">
                      Luz Eterna
                    </span>
                  </div>
                </div>
              </div>

              {/* Título de la escena */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-wide drop-shadow-md">
                  Cielo Lleno de Luces
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-[320px] mx-auto leading-relaxed">
                  Un santuario donde ninguna huella se apaga. Cada llama es un abrazo que viaja hacia las estrellas.
                </p>
              </div>

              {/* LISTA / STREAM DE VELAS ENCENDIDAS RECIENTES */}
              <div className="w-full max-w-[340px] bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-2xl p-3.5 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 border-b border-purple-400/20 pb-1.5">
                  <span>🕯️ Velas que brillan esta noche</span>
                  <span className="text-purple-300 font-normal">En directo</span>
                </div>

                <div className="max-h-[140px] overflow-hidden space-y-1.5 text-left">
                  {candles.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                        c.isNew
                          ? 'bg-amber-500/20 border border-amber-400/50 text-amber-100 animate-pulse'
                          : 'bg-white/5 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">🕯️</span>
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-purple-300/70">{c.species}</span>
                      </div>
                      <span className="text-[10px] text-amber-300/80 font-mono">{c.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* ESCENA 2: CARTA AL CIELO (HOMENAJE ÍNTIMO)           */}
          {/* ---------------------------------------------------- */}
          {activeScene === 2 && currentLetter && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
              
              {/* TARJETA POSTAL GHIBLI / COTTON PARCHMENT */}
              <div className="w-full max-w-[360px] bg-gradient-to-b from-[#FFFDFB] via-[#FFF9F5] to-[#FDF1E6] text-slate-800 rounded-3xl p-6 shadow-2xl border-2 border-amber-200/90 relative overflow-hidden">
                
                {/* Sello conmemorativo en esquina */}
                <div className="absolute top-4 right-4 bg-amber-50 border border-amber-300 rounded-full px-2 py-0.5 text-[9px] font-black text-amber-800 uppercase tracking-widest shadow-xs">
                  Libro de los Ángeles 📖
                </div>

                {/* Foto del angelito con marco polaroid suave */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-amber-100 border-2 border-amber-300/80 shadow-md shrink-0">
                    {currentLetter.photoUrl ? (
                      <img
                        src={currentLetter.photoUrl}
                        alt={currentLetter.petName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🐾
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black font-serif text-[#1E2A78] leading-tight">
                      {currentLetter.petName}
                    </h2>
                    <p className="text-[11px] font-bold text-[#A0285D] mt-0.5">
                      {currentLetter.years || 'Para siempre en el cielo'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      De su {currentLetter.family}
                    </p>
                  </div>
                </div>

                {/* Mensaje de la carta (Gran legibilidad) */}
                <div className="bg-[#FFF4EC] border-l-4 border-[#EC4899] rounded-r-2xl p-4 my-2 shadow-xs">
                  <p className="font-serif italic text-base sm:text-lg text-slate-800 leading-relaxed">
                    «{currentLetter.message}»
                  </p>
                </div>

                {/* Pie de la tarjeta */}
                <div className="flex items-center justify-between pt-3 text-[10px] font-bold text-slate-500 border-t border-amber-200/60 mt-2">
                  <span>Mural Global · Coordenadas ({currentLetter.slot || 'Zona Fundadores'})</span>
                  <span className="text-[#EC4899] flex items-center gap-1">
                    Amor Eterno ✨
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
                      idx === currentLetterIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* ESCENA 3: LUZ DEL REFUGIO (MOMENTO SOLIDARIO)        */}
          {/* ---------------------------------------------------- */}
          {activeScene === 3 && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
              
              {/* TARJETA SOLIDARIA CORAZONES DE ÁNGEL */}
              <div className="w-full max-w-[360px] bg-gradient-to-b from-[#1C1635] via-[#241A44] to-[#17102E] border-2 border-pink-400/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                
                {/* Insignia solidaria */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/30 text-pink-200 border border-pink-400/50 mb-4 shadow-xs">
                  🐾 Corazones de Ángel · Homenaje Solidario
                </div>

                {/* Retrato del angelito del refugio */}
                <div className="relative w-28 h-28 mx-auto rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl mb-3">
                  <img
                    src="/images/solidario/vaiana_real_mural.jpg"
                    alt="Vaiana"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/shelter_1792348293948.jpg';
                    }}
                  />
                  <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    Fundadora #0005
                  </div>
                </div>

                <h2 className="text-2xl font-black font-serif text-pink-100">
                  Vaiana 🐾
                </h2>
                <p className="text-xs font-bold text-amber-300 mt-0.5">
                  Almas de 4 patas (Málaga)
                </p>

                <p className="text-xs text-purple-200/90 italic leading-relaxed my-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  «Una guerrera noble que nos enseñó a no rendirnos jamás. Aunque partió en el refugio, hoy tiene su constelación de 9 estrellas en el cielo de los ángeles.»
                </p>

                {/* Destacado del 50% de donación */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/40 rounded-xl p-2.5 text-[11px] text-pink-200 font-semibold">
                  🎁 El 50% de cada recuerdo solidario apoya a los compañeros que siguen esperando un hogar.
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* PARTE INFERIOR: ESPACIO DE COMENTARIOS TIKTOK Y LLAMADA  */}
        {/* ======================================================== */}
        <footer className="relative z-10 pb-6 px-6 text-center space-y-2">
          {/* Banner sutil que invita a la gente a comentar sin tapar */}
          <div className="bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 backdrop-blur-md border border-amber-300/30 rounded-2xl py-2.5 px-4 shadow-lg">
            <p className="text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5">
              <span>💬</span>
              <span>Deja su nombre y una velita 🕯️ en el chat</span>
            </p>
            <p className="text-[10px] text-purple-200/70 mt-0.5">
              Uniremos su luz al ritual en voz alta durante esta noche
            </p>
          </div>
        </footer>

      </main>

      {/* ======================================================== */}
      {/* BARRA DE CONTROL FLOTANTE PARA OBS / EMISIÓN             */}
      {/* (Ocultable con la tecla H o botón)                       */}
      {/* ======================================================== */}
      {!hideControls ? (
        <aside className="fixed bottom-4 z-40 bg-[#16122E]/95 backdrop-blur-md border-2 border-purple-400/40 rounded-3xl p-3 shadow-2xl flex items-center gap-2 max-w-[94vw] overflow-x-auto text-xs">
          
          {/* Conmutador de escenas */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveScene(1)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 1
                  ? 'bg-amber-500 text-stone-900 shadow-md font-black'
                  : 'text-purple-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 1"
            >
              [1] 🕯️ Cielo de Luces
            </button>

            <button
              onClick={() => setActiveScene(2)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 2
                  ? 'bg-[#EC4899] text-white shadow-md font-black'
                  : 'text-purple-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 2"
            >
              [2] 💌 Carta al Cielo
            </button>

            <button
              onClick={() => setActiveScene(3)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeScene === 3
                  ? 'bg-purple-600 text-white shadow-md font-black'
                  : 'text-purple-200 hover:bg-white/10'
              }`}
              title="Atajo: Tecla 3"
            >
              [3] 🐾 Luz del Refugio
            </button>
          </div>

          {/* Navegación de cartas si está en Escena 2 */}
          {activeScene === 2 && (
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() =>
                  setCurrentLetterIndex(
                    (prev) => (prev - 1 + letters.length) % letters.length
                  )
                }
                className="px-2 py-1 rounded-lg text-purple-200 hover:bg-white/10 font-bold"
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
                className="px-2 py-1 rounded-lg text-purple-200 hover:bg-white/10 font-bold"
                title="Siguiente carta (Flecha Der o Espacio)"
              >
                ▶
              </button>
              <button
                onClick={() => setAutoPlayLetters((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  autoPlayLetters ? 'bg-emerald-600 text-white' : 'text-purple-300'
                }`}
                title="Pase automático cada 14 seg"
              >
                Auto {autoPlayLetters ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Botón Encender Velita al Vuelo (Chat de TikTok) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-xs hover:opacity-90 shadow-md cursor-pointer flex items-center gap-1"
            title="Atajo: Tecla N"
          >
            ➕ Encender Vela en Vivo
          </button>

          {/* Guía de Zona Segura */}
          <button
            onClick={() => setShowSafeZone((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-2xl text-[11px] font-bold border transition-all ${
              showSafeZone
                ? 'bg-yellow-500 text-black border-yellow-300'
                : 'text-purple-300 border-purple-400/30 hover:bg-white/10'
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
          className="fixed bottom-3 right-3 z-40 w-8 h-8 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-400/30 flex items-center justify-center text-xs opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Mostrar controles (Tecla H)"
        >
          ⚙️
        </button>
      )}

      {/* ======================================================== */}
      {/* MODAL RÁPIDO PARA ENCENDER VELITA POR NOMBRE DEL CHAT    */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#181335] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-purple-400/20 pb-2">
              <h3 className="font-serif font-black text-lg text-amber-200 flex items-center gap-2">
                <span>🕯️</span> Encender Velita del Chat
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-purple-300 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200/80">
              Escribe el nombre de la mascota que pidieron en los comentarios de TikTok para que aparezca al instante en pantalla.
            </p>

            <form onSubmit={handleAddLiveCandle} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-purple-200 block mb-1">
                  Nombre del angelito:
                </label>
                <input
                  type="text"
                  value={newLivePetName}
                  onChange={(e) => setNewLivePetName(e.target.value)}
                  placeholder="Ej: Maya, Toby, Coco..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-400/40 text-amber-200 placeholder-purple-400/50 font-bold outline-hidden focus:border-amber-400 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-purple-200 block mb-1">
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
                          : 'bg-white/5 text-purple-200 border-white/10'
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
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-purple-300 hover:bg-white/5 border border-white/10"
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
