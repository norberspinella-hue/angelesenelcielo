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
    id: 'letter-poppy',
    petName: 'Poppy',
    species: 'perro',
    years: '11 meses de puro amor',
    family: 'Almas de 4 patas (@almas.de.4.patas)',
    message: 'Te rescatamos y tenías un tumor, no me daban mucha esperanza por tu edad. Pero la operación salió bien y me diste 11 meses de pura alegría, encanto y amor puro. Me enseñaste lo que significa el amor, tú que habías sufrido tanto y perdonaste a todos. Tu encanto era transmitir felicidad allí donde estabas. Te fuiste rodeada de amor. Me acordaré de ti toda mi vida.',
    photoUrl: '/images/memorial/poppy_mural.png',
    slot: '470, 494 (4x4)',
  },
  {
    id: 'letter-bro',
    petName: 'Bro',
    species: 'perro',
    years: 'Abril 2017 — 26 Oct 2025',
    family: 'Familia yaritcar (@nala68271)',
    message: 'Para siempre en el cielo, siempre en nuestro corazón. Tu alegría, tu nobleza y tu amor incondicional vivirán eternamente en cada estrella.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/bro_1792878753050.jpg',
    slot: '503, 495',
  },
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
  { id: 'c-poppy', name: 'Poppy', species: '🌟 Ángelito Protector (4x4)', timeAgo: 'ahora mismo', isNew: true },
  { id: 'c0', name: 'Bro', species: '🐾 Fundador #0007 (@nala68271)', timeAgo: 'ahora mismo', isNew: true },
  { id: 'c1', name: 'Nano', species: '🐾 Perrito', timeAgo: 'hace 2 min' },
  { id: 'c2', name: 'Chloe', species: '✨ Gatita', timeAgo: 'hace 4 min' },
  { id: 'c3', name: 'House', species: '🐾 Perrito', timeAgo: 'hace 7 min' },
  { id: 'c4', name: 'Vaiana', species: '🐾 Almas de 4 patas', timeAgo: 'hace 12 min' },
  { id: 'c5', name: 'Juliette', species: '🐾 Refugio Nueva Vida', timeAgo: 'hace 15 min' },
  { id: 'c6', name: 'Mary Margaret', species: '✨ Gatita', timeAgo: 'hace 19 min' },
  { id: 'c7', name: 'Toby', species: '🐾 Golden Retriever', timeAgo: 'hace 24 min' },
  { id: 'c8', name: 'Luna', species: '✨ Gatita blanca', timeAgo: 'hace 28 min' },
];

interface ShelterAngelItem {
  id: string;
  name: string;
  shelterName: string;
  badge: string;
  badgeColor: string;
  history: string;
  photoUrl: string;
  fallbackPhotoUrl: string;
}

const SHELTER_ANGELS: ShelterAngelItem[] = [
  {
    id: 'vaiana',
    name: 'Vaiana',
    shelterName: 'Almas de 4 patas (Málaga)',
    badge: '👑 Fundadora #0005',
    badgeColor: 'bg-amber-400 text-stone-950',
    history: '«Vaiana era solo un bebé cuando la rescatamos. Conoció el amor y la calidez de una familia de acogida antes de partir. Hoy sus estrellas brillan para siempre en el mural.»',
    photoUrl: '/images/solidario/vaiana_real_mural.jpg',
    fallbackPhotoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/shelter_1792348293948.jpg',
  },
];

export default function LiveTikTokClient() {
  // Escena activa: 1 = Cielo de luces, 2 = Carta al cielo (Visor Ghibli), 3 = Luz del refugio
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);

  // Cartas y navegación
  const [letters] = useState<LetterItem[]>(PRELOADED_LETTERS);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const [currentShelterIndex, setCurrentShelterIndex] = useState<number>(0);

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
        @keyframes realisticFlameSway {
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

        @keyframes flameCoreJitter {
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

        @keyframes waxInternalGlow {
          0%, 100% {
            opacity: 0.7;
            filter: brightness(1);
          }
          50% {
            opacity: 0.95;
            filter: brightness(1.2);
          }
        }

        @keyframes smokeWisp {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.8);
            opacity: 0;
          }
          25% {
            opacity: 0.45;
          }
          100% {
            transform: translateY(-90px) translateX(15px) scale(2.2);
            opacity: 0;
          }
        }

        @keyframes auraBreath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.15);
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
              
              {/* LA VELA CENTRAL REALISTA EN VIVO */}
              <div className="relative flex flex-col items-center pt-2 pb-4">
                {/* 1. Halo de resplandor áureo y rosa celestial sincronizado */}
                <div className="absolute -top-20 w-64 h-64 rounded-full bg-gradient-to-r from-amber-400/35 via-[#EC4899]/18 to-orange-500/30 blur-3xl animate-aura-breath pointer-events-none" />

                {/* 2. Micro humo etéreo / estela de luz ascendente */}
                <div className="absolute -top-16 w-3 h-12 bg-gradient-to-t from-white/20 to-transparent rounded-full blur-[2px] pointer-events-none animate-[smokeWisp_5s_ease-out_infinite]" />

                {/* 3. Llama Hiperrealista viva multicapa */}
                <div className="relative z-20 flex flex-col items-center animate-[realisticFlameSway_3.2s_ease-in-out_infinite] origin-bottom mb-[-3px]">
                  
                  {/* Cuerpo exterior de la llama en lágrima orgánica */}
                  <div className="relative w-[38px] h-[82px] rounded-[50%_50%_35%_35%/60%_60%_40%_40%] bg-gradient-to-t from-[#2563EB]/40 via-[#F59E0B] to-[#FEF08A] shadow-[0_0_20px_rgba(251,191,36,0.9),0_0_45px_rgba(245,158,11,0.6),0_0_80px_rgba(234,88,12,0.35)] flex items-center justify-center overflow-hidden">
                    
                    {/* Halo de borde cálido naranja-rojizo */}
                    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-[#EA580C]/85 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Núcleo interno incandescente brillante (blanco / limón intenso) */}
                    <div className="w-[18px] h-[52px] rounded-[50%_50%_40%_40%/65%_65%_35%_35%] bg-gradient-to-t from-[#FBBF24] via-[#FEF9C3] to-[#FFFFFF] shadow-[0_0_15px_#FFFFFF] blur-[0.6px] mt-4 animate-[flameCoreJitter_1.8s_ease-in-out_infinite]" />

                    {/* Base de combustión azulada pura */}
                    <div className="absolute bottom-0 inset-x-2 h-4 rounded-b-full bg-gradient-to-t from-[#0284C7]/90 via-[#38BDF8]/60 to-transparent blur-[0.5px]" />
                  </div>

                  {/* Mecha de algodón con brasa incandescente en la punta */}
                  <div className="relative flex flex-col items-center -mt-1 z-30">
                    {/* Brasa incandescente roja/ámbar en la punta de ignición */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_6px_#F87171] -mb-0.5 animate-pulse" />
                    {/* Hilo de mecha negro carbón ligeramente curvado */}
                    <div className="w-[3px] h-[14px] bg-gradient-to-b from-[#1C1917] to-[#292524] rounded-sm transform rotate-[-3deg]" />
                  </div>
                </div>

                {/* 4. Cuerpo de la Vela Realista (Vaso de Altar de Cristal y Cera Líquida) */}
                <div className="relative z-10 w-[114px] flex flex-col items-center">
                  
                  {/* Piscina de cera líquida superior con reflejo brillante (Elipse 3D) */}
                  <div className="relative w-full h-[22px] rounded-[50%] bg-gradient-to-r from-[#FDE68A] via-[#FFFBEB] to-[#FCD34D] border border-amber-200/90 shadow-[inset_0_2px_4px_rgba(180,83,9,0.35),0_1px_3px_rgba(0,0,0,0.4)] z-20 flex items-center justify-center overflow-hidden">
                    {/* Depresión central donde nace la mecha */}
                    <div className="w-7 h-2.5 rounded-full bg-amber-900/30 blur-[1px]" />
                    {/* Reflejo especular de la llama en el líquido */}
                    <div className="absolute top-1 left-7 w-6 h-1.5 rounded-full bg-white/90 blur-[0.8px] transform rotate-[-8deg]" />
                  </div>

                  {/* Cilindro de cera con translucidez interna (Subsurface Scattering) */}
                  <div className="relative w-full h-[122px] -mt-[11px] rounded-b-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FDF3E7] to-[#EAD1B3] border-x-2 border-b-2 border-amber-200/70 shadow-[0_20px_45px_rgba(0,0,0,0.65),inset_0_0_25px_rgba(245,158,11,0.18)] overflow-hidden flex flex-col justify-between">
                    
                    {/* Luz interna translúcida que emite la llama a través de la cera superior */}
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-amber-400/45 via-amber-300/20 to-transparent blur-md pointer-events-none animate-[waxInternalGlow_3s_ease-in-out_infinite]" />

                    {/* Reflejos de cristal verticales a ambos lados (Vidrio de catedral) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-transparent to-white/20 pointer-events-none" />

                    {/* Filete de oro satinado decorativo */}
                    <div className="relative z-10 mt-6 mx-3 py-0.5 border-y border-amber-300/50 text-center">
                      <span className="text-[8.5px] font-serif font-black text-[#5C3C58] tracking-[2px] uppercase block drop-shadow-xs">
                        ★ Llama Eterna ★
                      </span>
                    </div>

                    {/* Base sombreada de la cera con degradado suave */}
                    <div className="relative z-10 w-full pb-2.5 text-center">
                      <span className="text-[9px] text-amber-900/60 font-serif italic block">
                        Ángeles en el Cielo
                      </span>
                    </div>
                  </div>

                  {/* 5. Sombra de contacto suave realista en la base */}
                  <div className="w-32 h-4 -mt-2 rounded-[50%] bg-black/60 blur-[3px] pointer-events-none" />
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
          {activeScene === 3 && (() => {
            const currentAngel = SHELTER_ANGELS[currentShelterIndex];
            return (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
              
              {/* TARJETA SOLIDARIA CORAZONES DE ÁNGEL EN PALETA CIELO DE LUCES */}
              <div className="w-full max-w-[350px] bg-gradient-to-b from-[#2B1038] via-[#21092F] to-[#150420] border-2 border-[#F3D5E4]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-center">
                
                {/* Selector rápido de angelito de refugio */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {SHELTER_ANGELS.map((angel, idx) => (
                    <button
                      key={angel.id}
                      onClick={() => setCurrentShelterIndex(idx)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        currentShelterIndex === idx
                          ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                          : 'bg-white/10 text-pink-200 hover:bg-white/20'
                      }`}
                    >
                      {angel.name}
                    </button>
                  ))}
                </div>

                {/* Emblema superior Corazones de Ángel */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF0F6] text-[#8C3F71] border border-[#F0BED6] mb-3 shadow-xs">
                  🐾 Reconocimiento Corazón de Ángel
                </div>

                {/* Retrato Arqueado Ghibli */}
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

                {/* Nombre y Protectora */}
                <div className="mt-3">
                  <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#FFFDFB]">
                    {currentAngel.name} 🐾
                  </h2>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">
                    {currentAngel.shelterName}
                  </p>
                </div>

                {/* Historia conmovedora */}
                <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 my-3 shadow-xs">
                  <p className="font-serif italic text-xs sm:text-[13px] text-pink-100 leading-relaxed">
                    {currentAngel.history}
                  </p>
                </div>

                {/* Compromiso Solidario */}
                <div className="bg-gradient-to-r from-[#B83C7E]/30 to-[#8C3F71]/30 border border-[#F0BED6]/30 rounded-xl p-2.5 text-[11px] text-pink-200 font-semibold leading-snug">
                  🎁 El 50% de cada recuerdo apadrina a los compañeros que siguen esperando un hogar en el refugio.
                </div>
              </div>

            </div>
            );
          })()}

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
