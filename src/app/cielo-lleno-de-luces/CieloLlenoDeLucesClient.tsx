'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OctubreBanner } from '@/components/landing/OctubreBanner';
import { CartasAlCieloHeader } from '@/components/comunidad/CartasAlCieloHeader';
import { Footer } from '@/components/landing/Footer';

export interface AltarCandle {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  authorName: string;
  dedication: string;
  photoUrl?: string;
  litDate: string;
  daysRemaining: number; // 0 = llama apagada
  isNeedsReignition: boolean; // true = llama apagada
  isEternal?: boolean; // Apadrinar o tener un plan mantiene la vela encendida para siempre!
  warmthCount: number;
  isShelterPet?: boolean;
  shelterName?: string;
  socialHandle?: string;
  anniversaryDate?: string;
}

const SEED_CANDLES: AltarCandle[] = [
  {
    id: 'candle-vaiana',
    petName: 'Vaiana',
    species: 'perro',
    authorName: 'Amaya · Almas de 4 patas',
    dedication: 'Vaiana solo era un bebe recien nacida, cuando la dejaron abandonada en medio de la nada, pero encontró Un Corazón de Ángel, Amaya. Ella le dió todo el amor del mundo. Vaiana se fue a los pocos días, pero conoció lo que es el cariño y calidez de una mamá perruna.',
    photoUrl: '/images/solidario/vaiana_real_mural.jpg',
    litDate: 'Hace 1 día',
    daysRemaining: 7,
    isNeedsReignition: false,
    isEternal: true, // Llama Eterna por apadrinamiento en el mural
    warmthCount: 148,
    isShelterPet: true,
    shelterName: 'Almas de 4 patas · Málaga',
    socialHandle: '@almas.de.4.patas',
  },
  {
    id: 'candle-chloe',
    petName: 'Chloe',
    species: 'perro',
    authorName: 'Familia Mendoza',
    dedication: 'Tu luz sigue guiando nuestros días.',
    photoUrl: '/images/comunidad/golden_retriever_celestial_clean.webp',
    litDate: 'Hace 1 día',
    daysRemaining: 7,
    isNeedsReignition: false,
    isEternal: true, // Plan Eterno en el Mural
    warmthCount: 24,
  },
  {
    id: 'candle-luna',
    petName: 'Luna',
    species: 'gato',
    authorName: 'Elena y Sofía',
    dedication: 'Siempre en mi corazón, pequeña estrella.',
    photoUrl: '/images/comunidad/pet-luna.webp',
    litDate: 'Hace 2 días',
    daysRemaining: 5,
    isNeedsReignition: false,
    warmthCount: 18,
  },
  {
    id: 'candle-max',
    petName: 'Max',
    species: 'perro',
    authorName: 'Carlos M.',
    dedication: 'Gracias por todas nuestras aventuras.',
    photoUrl: '/images/comunidad/pet-coco.webp',
    litDate: 'Hace 3 días',
    daysRemaining: 4,
    isNeedsReignition: false,
    warmthCount: 32,
  },
  {
    id: 'candle-nube',
    petName: 'Nube',
    species: 'otro',
    authorName: 'Mamá de Nube',
    dedication: 'Fuiste pequeño, pero dejaste una huella enorme.',
    photoUrl: '/images/comunidad/pet-nube.webp',
    litDate: 'Hace 4 días',
    daysRemaining: 3,
    isNeedsReignition: false,
    warmthCount: 16,
  },
  {
    id: 'candle-bobby',
    petName: 'Bobby',
    species: 'perro',
    authorName: 'Refugio Nueva Vida · Valencia',
    dedication: 'Bobby nos cuidó con su mirada agradecida tras 7 años esperando una familia. Ningún animalito cruza el puente en soledad.',
    photoUrl: '/images/solidario/tarjeta1-220x220.webp',
    litDate: 'Hace 2 días',
    daysRemaining: 5,
    isNeedsReignition: false,
    warmthCount: 112,
    isShelterPet: true,
    shelterName: 'Refugio Nueva Vida',
  },
  {
    id: 'candle-roco',
    petName: 'Roco',
    species: 'perro',
    authorName: 'Mateo y Clara',
    dedication: 'Valiente hasta el último minuto. Gracias por protegernos cada instante de tu vida.',
    photoUrl: '/images/comunidad/pet-roco.webp',
    litDate: 'Hace 8 días',
    daysRemaining: 0,
    isNeedsReignition: true, // Llama apagada tras 7 días
    warmthCount: 38,
  },
  {
    id: 'candle-coco',
    petName: 'Coco',
    species: 'perro',
    authorName: 'Familia Torres',
    dedication: 'Pequeño terremoto de amor. Gracias por enseñarnos a sonreír sin importar nada.',
    photoUrl: '/images/comunidad/pet-coco.webp',
    litDate: 'Hace 9 días',
    daysRemaining: 0,
    isNeedsReignition: true, // Llama apagada tras 7 días
    warmthCount: 42,
  },
  {
    id: 'candle-toby',
    petName: 'Toby',
    species: 'perro',
    authorName: 'Familia Gómez Martí',
    dedication: '14 años llenando nuestra casa de alegría pura. Siempre serás mi lugar favorito en el mundo.',
    photoUrl: '/images/comunidad/pet-max.webp',
    litDate: 'Hace 3 días',
    daysRemaining: 4,
    isNeedsReignition: false,
    warmthCount: 84,
  },
  {
    id: 'candle-mia',
    petName: 'Mía',
    species: 'gato',
    authorName: 'Laura V.',
    dedication: 'Dulce, sabia y silenciosa. Tu mirada de ojos esmeralda vive para siempre en mi alma.',
    photoUrl: '/images/comunidad/pet-mia.webp',
    litDate: 'Hace 2 días',
    daysRemaining: 5,
    isNeedsReignition: false,
    warmthCount: 56,
  },
  {
    id: 'candle-juliette',
    petName: 'Juliette',
    species: 'perro',
    authorName: 'Sector Fundadores',
    dedication: 'Tu huella quedó grabada en el alma, tu mirada vive en cada estrella que ilumina la noche.',
    photoUrl: '/images/comunidad/pet-roco.webp',
    litDate: 'Hace 1 día',
    daysRemaining: 7,
    isNeedsReignition: false,
    isEternal: true,
    warmthCount: 96,
  },
  {
    id: 'candle-thor',
    petName: 'Thor',
    species: 'perro',
    authorName: 'Andrés y Lucía',
    dedication: 'Grande como un gigante y tierno como un bebé. Te extrañamos en cada rincón.',
    photoUrl: '/images/comunidad/pet-max.webp',
    litDate: 'Hace 5 días',
    daysRemaining: 2,
    isNeedsReignition: false,
    warmthCount: 67,
  },
];

export default function CieloLlenoDeLucesClient() {
  const [hasTopBanner, setHasTopBanner] = useState(true);
  const [candles, setCandles] = useState<AltarCandle[]>(SEED_CANDLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'vivas' | 'reavivar' | 'perro' | 'gato' | 'refugios'>('todos');
  
  // Modales
  const [selectedCandle, setSelectedCandle] = useState<AltarCandle | null>(null);
  const [showNewCandleModal, setShowNewCandleModal] = useState(false);
  const [newCandleCelebration, setNewCandleCelebration] = useState(false);

  // Formulario nueva vela
  const [newPetName, setNewPetName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'perro' | 'gato' | 'otro'>('perro');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDedication, setNewDedication] = useState('');
  const [newAnniversaryDate, setNewAnniversaryDate] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAnniversaryOptIn, setNewAnniversaryOptIn] = useState(true);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Contadores
  const totalCandlesCount = 148;
  const activeCandlesCount = candles.filter(c => !c.isNeedsReignition).length;
  const needsReignitionCount = candles.filter(c => c.isNeedsReignition).length;

  // Filtrado
  const filteredCandles = useMemo(() => {
    return candles.filter((candle) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = candle.petName.toLowerCase().includes(query);
        const matchesAuthor = candle.authorName.toLowerCase().includes(query);
        const matchesDedication = candle.dedication.toLowerCase().includes(query);
        if (!matchesName && !matchesAuthor && !matchesDedication) return false;
      }

      if (filterMode === 'vivas') return !candle.isNeedsReignition;
      if (filterMode === 'reavivar') return candle.isNeedsReignition;
      if (filterMode === 'perro') return candle.species === 'perro';
      if (filterMode === 'gato') return candle.species === 'gato';
      if (filterMode === 'refugios') return candle.isShelterPet;

      return true;
    });
  }, [candles, searchQuery, filterMode]);

  // Manejo de foto subida
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Acción: Encender llama apagada (ciclo de 7 días catedralicio)
  const handleReigniteCandle = (candleId: string) => {
    setCandles(prev => prev.map(c => {
      if (c.id === candleId) {
        return {
          ...c,
          isNeedsReignition: false,
          daysRemaining: 7,
          warmthCount: c.warmthCount + 1,
          litDate: 'Encendida de nuevo hoy',
        };
      }
      return c;
    }));

    if (selectedCandle && selectedCandle.id === candleId) {
      setSelectedCandle(prev => prev ? {
        ...prev,
        isNeedsReignition: false,
        daysRemaining: 7,
        warmthCount: prev.warmthCount + 1,
        litDate: 'Encendida de nuevo hoy',
      } : null);
    }

    showToast('Llama encendida con éxito. Permanecerá ardiendo 7 días más en el Cielo de Luces.');
  };

  // Acción: Acompañar / Enviar calor
  const handleSendWarmth = (candleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCandles(prev => prev.map(c => {
      if (c.id === candleId) {
        return { ...c, warmthCount: c.warmthCount + 1 };
      }
      return c;
    }));

    if (selectedCandle && selectedCandle.id === candleId) {
      setSelectedCandle(prev => prev ? { ...prev, warmthCount: prev.warmthCount + 1 } : null);
    }

    showToast('Has acompañado esta vela con un abrazo de luz.');
  };

  // Envío del formulario de nueva vela
  const handleCreateCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const newEntry: AltarCandle = {
      id: 'user-candle-' + Date.now(),
      petName: newPetName.trim(),
      species: newSpecies,
      authorName: newAuthor.trim() || 'Familia amorosa',
      dedication: newDedication.trim() || 'Una luz eterna que nunca se apagará en el Cielo de Luces.',
      photoUrl: uploadedPhotoPreview || '/images/comunidad/golden_retriever_celestial_clean.webp',
      litDate: 'Encendida hoy',
      daysRemaining: 7,
      isNeedsReignition: false,
      warmthCount: 1,
      anniversaryDate: newAnniversaryOptIn ? newAnniversaryDate : undefined,
    };

    setCandles(prev => [newEntry, ...prev]);
    setNewCandleCelebration(true);
    showToast(`¡Vela encendida en el Cielo de Luces por ${newPetName}!`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#2D0F31] flex flex-col selection:bg-[#F3D5E4] selection:text-[#8C3F71] relative">
      
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2D0F31] text-white px-5 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 animate-bounce">
          <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={16} height={16} className="w-4 h-4 object-contain inline-block shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Cintillo del 27 de Octubre (Día de Muertos de las Mascotas) */}
      <OctubreBanner onVisibilityChange={setHasTopBanner} />

      {/* 2. Cabecera Cápsula Flotante con Papel Picado (Idéntica a todaslasmascotasvanalcielo) */}
      <CartasAlCieloHeader hasTopBanner={hasTopBanner} showGarland={true} />

      {/* ========================================================================= */}
      {/* HERO: ENTRADA AL SANTUARIO «UN CIELO LLENO DE LUCES» (MAQUETA MAESTRA)   */}
      {/* ========================================================================= */}
      <section 
        className={`relative pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-300 ${
          hasTopBanner ? 'pt-36 sm:pt-40 md:pt-44' : 'pt-24 sm:pt-28'
        }`}
        style={{
          backgroundImage: "url('/images/luces/fondo_hero_PC_1920x1080.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          isolation: 'isolate',
        }}
      >
        
        {/* Fondo fotográfico celestial SIN capa de opacidad global (100% nítido) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Desktop (> 1024px) */}
          <div className="hidden lg:block absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_PC_1920x1080.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              className="object-cover object-center" 
            />
          </div>
          {/* Tablet (640px - 1024px) */}
          <div className="hidden sm:block lg:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_tablet_1200x900.webp" 
              alt="Cielo lleno de luces tablet" 
              fill 
              priority 
              className="object-cover object-center" 
            />
          </div>
          {/* Móvil (< 640px) */}
          <div className="block sm:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_MOVIL_1080x1350.webp" 
              alt="Cielo lleno de luces móvil" 
              fill 
              priority 
              className="object-cover object-center" 
            />
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* COLUMNA IZQUIERDA (7 cols): MANCHA DE TRANSPARENCIA BLANCA SUAVE DETRÁS DEL TEXTO */}
          <div className="lg:col-span-7 space-y-5 text-left relative">

            {/* Título Oficial: Alineado a la izquierda sin badge ni desplazamientos */}
            <h1 className="relative font-playfair text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#2D0F31] leading-[1.12]">
              <span 
                className="absolute pointer-events-none select-none -z-10 blur-2xl rounded-3xl"
                style={{
                  left: '-20%',
                  right: '5%',
                  top: '-18px',
                  bottom: '-58px',
                  background: 'radial-gradient(ellipse 65% 75% at 38% 46%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.80) 50%, rgba(255, 255, 255, 0.40) 75%, rgba(255, 255, 255, 0) 95%)',
                }}
              />
              Un cielo lleno <br />
              <span className="relative inline-block text-[#B83C7E]">
                de luces <span className="inline-block font-sans text-3xl sm:text-4xl text-[#B83C7E] ml-1">♡</span>
                <svg className="w-full h-3 text-[#B83C7E]/40 -mt-1" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none">
                  <path d="M0,8 Q60,0 120,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Párrafo descriptivo exacto de la maqueta */}
            <p className="text-sm sm:text-base text-[#523A4E] max-w-xl leading-relaxed font-sans font-medium">
              Cada familia puede encender una vela por su ángel, para que su luz siga brillando en este cielo. Un pequeño gesto que nos une y recuerda que siempre viven en nuestros corazones.
            </p>

            {/* Botón Principal: Encender una vela → */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setNewCandleCelebration(false);
                  setShowNewCandleModal(true);
                }}
                className="w-full sm:w-auto justify-center px-7 sm:px-8 py-3.5 rounded-full font-bold text-white text-sm sm:text-base shadow-[0_10px_28px_rgba(184,60,126,0.38)] hover:shadow-[0_14px_32px_rgba(184,60,126,0.48)] hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer bg-gradient-to-r from-[#B83C7E] via-[#A83273] to-[#8C2860]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C10.5 4.2 10 5.8 10 7.2C10 8.8 10.9 9.8 12 9.8C13.1 9.8 14 8.8 14 7.2C14 5.8 13.5 4.2 12 2Z" fill="#FFFFFF"/>
                  <rect x="8" y="12" width="8" height="10" rx="1.8" fill="#FFFFFF"/>
                </svg>
                <span>Encender una vela</span>
                <span className="text-base sm:text-lg">→</span>
              </button>

              <Link
                href="/desde-el-corazon"
                className="px-5 py-3 rounded-full font-bold text-[#8C3F71] bg-white/95 hover:bg-[#FFF0F6] border border-[#F0BED6] text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Image 
                  src="/images/icons/plans/icon-plan-estrella.svg" 
                  alt="Estrella" 
                  width={18} 
                  height={18} 
                  className="w-[18px] h-[18px] object-contain shrink-0" 
                />
                <span>Llama Eterna</span>
              </Link>
            </div>

            {/* Caja de estadísticas de la maqueta con corazón relleno rosa */}
            <div className="bg-white/90  rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_8px_24px_rgba(140,60,110,0.08)] max-w-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    🕯️
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D0F31] leading-none">
                        148
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#5C3C58]">
                        Hoy se han encendido 148 velas
                      </span>
                    </div>
                  </div>
                </div>
                {/* Corazón con relleno rosa oficial */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#DF6197" className="shrink-0 select-none overflow-visible">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <p className="text-[11px] text-[#7A6478] mt-2 pt-2 border-t border-[#F2DEE9] italic font-serif">
                Cada luz es un recuerdo, cada llama una historia de amor.
              </p>
            </div>

          </div>

          {/* COLUMNA DERECHA (5 cols): PANEL DE VELA SOLIDARIA (VAIANA - FOTO REAL DEL MURAL Y REDES) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              className="w-full max-w-md lg:max-w-[85%] rounded-3xl p-4 sm:p-6 border border-[#F5D5E4]/80 shadow-[0_16px_40px_rgba(140,60,110,0.10)] flex flex-col justify-between relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 248, 250, 0.75) 0%, rgba(252, 238, 245, 0.75) 100%)',
              }}
            >
              {/* Imagen de fondo: Corazón Ghibli como marca de agua celestial */}
              <div className="absolute -bottom-6 -right-6 w-52 h-52 opacity-25 pointer-events-none select-none z-0">
                <Image 
                  src="/images/icons/corazon-de-angel.webp" 
                  alt="Corazón Ghibli" 
                  fill 
                  className="object-contain" 
                />
              </div>

              <div className="relative z-10 space-y-3.5">
                
                {/* Badge oficial: iconplanpaw + Ángel del Refugio de la Semana */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F6] border border-[#F0BED6] text-[11px] font-bold text-[#8C3F71] uppercase tracking-wide shadow-xs">
                    <Image 
                      src="/images/icons/plans/pawrosa.svg" 
                      alt="Huella" 
                      width={14} 
                      height={14} 
                      className="w-3.5 h-3.5 object-contain" 
                    />
                    <span>Ángel del Refugio de la Semana</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#A87A9A] uppercase tracking-wider">
                    Solidario
                  </span>
                </div>

                {/* Perfil del Angelito: Vaiana (FOTO REAL DEL MURAL) */}
                <div className="flex items-center gap-3.5">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden relative shadow-md border-2 border-[#F59E0B] shrink-0 bg-white ring-2 ring-white">
                    <Image 
                      src="/images/solidario/vaiana_real_mural.jpg" 
                      alt="Vaiana subiendo las escaleras celestiales - Almas de 4 patas" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-[#2D0F31] leading-tight">
                      Vaiana · Almas de 4 patas
                    </h3>
                    <p className="text-[11.5px] text-[#8C5A7B] font-medium">
                      Málaga · Cruzó el puente de acogida
                    </p>
                    {/* Usuario de la Red Social */}
                    <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#F3D5E4] text-[10.5px] font-bold text-[#8C3F71]">
                      <span>📸</span>
                      <span>@almas.de.4.patas</span>
                    </div>
                  </div>
                </div>

                {/* Dedicatoria emotiva real de Vaiana del mural */}
                <p className="text-xs text-[#5D4657] leading-relaxed italic">
                  «Vaiana solo era un bebe recien nacida, cuando la dejaron abandonada en medio de la nada, pero encontró Un Corazón de Ángel, Amaya. Ella le dió todo el amor del mundo. Vaiana se fue a los pocos días, pero conoció lo que es el cariño y calidez de una mamá perruna.»
                </p>

                {/* Nota del 50% solidario */}
                <div className="p-3 rounded-2xl bg-white/85 border border-[#F3D9E7] text-[11px] text-[#7A506C] leading-snug">
                  <strong className="text-[#8C3F71] font-semibold">El 50% de las estrellas solidarias</strong> se destina a alimentación, mantas térmicas y medicación para los perritos ancianos que siguen en refugios.
                </div>

                {/* Botón CTA con el icono oficial de Desde el Corazón */}
                <div className="pt-1">
                  <Link
                    href="/desde-el-corazon"
                    className="w-full py-3 px-4 rounded-2xl font-bold text-[#8C3F71] bg-white hover:bg-[#FFF0F6] border border-[#F0BED6] text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <Image 
                      src="/images/icons/plans/icon-plan-eterno.svg" 
                      alt="Corazón" 
                      width={18} 
                      height={18} 
                      className="object-contain" 
                    />
                    <span>Apadrinar una Estrella por Vaiana →</span>
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE FILTROS & BUSCADOR                                               */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-[#F6E1EE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Buscador de perritos */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A7893] pointer-events-none text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por el nombre de tu angelito..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E6D4E0] bg-[#FAF3F8] text-xs sm:text-sm text-[#2D0F31] placeholder-[#9A7893] outline-none focus:border-[#B8589E] focus:bg-white transition-all"
            />
          </div>

          {/* Píldoras de filtro: Icono corazón para Llamas encendidas / Llamas apagadas */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterMode('todos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'todos'
                  ? 'bg-[#8C3F71] text-white shadow-sm'
                  : 'bg-[#FAF1F7] text-[#6E4F66] hover:bg-[#F5E2EF]'
              }`}
            >
              Todas ({candles.length})
            </button>

            {/* Llamas encendidas con el icono de corazón de Desde el Corazón */}
            <button
              onClick={() => setFilterMode('vivas')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'vivas'
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]'
              }`}
            >
              <Image 
                src="/images/icons/plans/icon-plan-eterno.svg" 
                alt="Corazón" 
                width={14} 
                height={14} 
                className="w-3.5 h-3.5 object-contain" 
              />
              <span>Llamas encendidas ({activeCandlesCount})</span>
            </button>

            <button
              onClick={() => setFilterMode('reavivar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'reavivar'
                  ? 'bg-[#B45309] text-white shadow-sm'
                  : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
              }`}
            >
              <span>⏳ Llamas apagadas ({needsReignitionCount})</span>
            </button>

            <button
              onClick={() => setFilterMode('perro')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'perro'
                  ? 'bg-[#8C3F71] text-white shadow-sm'
                  : 'bg-[#FAF1F7] text-[#6E4F66] hover:bg-[#F5E2EF]'
              }`}
            >
              Perros
            </button>

            <button
              onClick={() => setFilterMode('gato')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'gato'
                  ? 'bg-[#8C3F71] text-white shadow-sm'
                  : 'bg-[#FAF1F7] text-[#6E4F66] hover:bg-[#F5E2EF]'
              }`}
            >
              Gatos
            </button>

            <button
              onClick={() => setFilterMode('refugios')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'refugios'
                  ? 'bg-[#9E366E] text-white shadow-sm'
                  : 'bg-[#FFF0F6] text-[#8C3F71] hover:bg-[#FFE3EE]'
              }`}
            >
              <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={12} height={12} className="object-contain" />
              <span>Refugios</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* EL LAMPADARIO DE LAS CATEDRALES (TARJETAS DE VELAS DE LA MAQUETA)          */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* Banner informativo: Apadrinar o escoger un plan en Ángeles en el Cielo */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-[#FFF9F3] via-[#FFF3EB] to-[#FFF0F6] border border-[#FADCC7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/icons/plans/icon-plan-estrella.svg" 
              alt="Estrella" 
              width={64} 
              height={64} 
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-sm" 
            />
            <div>
              <h4 className="font-playfair text-sm sm:text-base font-bold text-[#8C3F71]">
                ¿Deseas que la vela de tu angelito nunca se apague?
              </h4>
              <p className="text-xs text-[#6F516B]">
                Las velas de la comunidad permanecen encendidas durante 7 días y te enviamos un aviso para volver a encenderlas. <strong>Apadrinar o escoger un plan en Ángeles en el Cielo</strong> mantiene su llama encendida para siempre en el Cielo de Luces.
              </p>
            </div>
          </div>
          <Link
            href="/#planes"
            className="shrink-0 w-full sm:w-auto text-center px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#D9629B] to-[#9B3F77] shadow-sm hover:shadow transition-all flex items-center justify-center"
          >
            Ver Planes & Apadrinar →
          </Link>
        </div>

        {/* Grid de Velas de la Maqueta (Chloe, Luna, Max, Nube...) */}
        {filteredCandles.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white/80 rounded-3xl border border-[#F2D8E8] p-8">
            <div className="text-4xl">🕯️</div>
            <p className="font-playfair text-xl font-bold text-[#2D0F31]">
              No encontramos ninguna vela con ese nombre
            </p>
            <p className="text-xs text-[#7A6478]">
              Puedes encender la primera vela para tu pequeño pulsando el botón de abajo.
            </p>
            <button
              onClick={() => setShowNewCandleModal(true)}
              className="mt-2 px-6 py-2.5 rounded-full font-bold text-white text-xs bg-[#8C3F71] shadow-md hover:bg-[#A44F99] transition-all cursor-pointer"
            >
              Encender vela ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredCandles.map((candle) => {
              const isNeedsReignition = candle.isNeedsReignition;
              const isEternal = candle.isEternal;

              return (
                <div
                  key={candle.id}
                  onClick={() => setSelectedCandle(candle)}
                  className="group relative bg-white/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_12px_36px_rgba(140,60,110,0.08)] hover:shadow-[0_18px_44px_rgba(184,60,126,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between text-center select-none overflow-hidden"
                  style={{
                    background: isEternal
                      ? 'linear-gradient(180deg, rgba(255, 253, 245, 0.98) 0%, rgba(255, 248, 252, 0.95) 100%)'
                      : isNeedsReignition
                        ? 'linear-gradient(180deg, rgba(255, 251, 235, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)'
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 252, 0.95) 100%)',
                    borderColor: isEternal ? '#FDE68A' : isNeedsReignition ? '#FED7AA' : '#F7E3EE',
                  }}
                >
                  
                  {/* Badge de Llama Eterna o Refugio */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                    {isEternal && (
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border border-[#FDE68A] text-[10px] font-bold text-[#92400E] flex items-center gap-1.5 shadow-xs">
                        <Image 
                          src="/images/icons/plans/icon-plan-estrella.svg" 
                          alt="Estrella" 
                          width={20} 
                          height={20} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span>Llama Eterna</span>
                      </span>
                    )}
                    {candle.isShelterPet && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F6] border border-[#F0BED6] text-[9.5px] font-bold text-[#8C3F71] flex items-center gap-1 shadow-xs">
                        <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={10} height={10} />
                        <span>Refugio</span>
                      </span>
                    )}
                  </div>

                  {/* Contador de corazones arriba a la derecha con relleno rosa */}
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#F3D5E4] text-[11px] font-bold text-[#DF6197] flex items-center gap-1 shadow-xs z-20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#DF6197" className="shrink-0 overflow-visible">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{candle.warmthCount}</span>
                  </span>

                  {/* IMAGEN DE LA VELA ENCENDIDA (.webp oficial) */}
                  <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-1">
                    <Image 
                      src="/images/luces/vela_encendida_WEB_1080x1350.webp" 
                      alt="Vela encendida" 
                      fill 
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                  </div>

                  {/* RETRATO CIRCULAR CON HALO DORADO (Superpuesto en el frente de la vela) */}
                  <div className="relative -mt-9 mb-2 flex justify-center z-10">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#F59E0B] shadow-[0_4px_14px_rgba(245,158,11,0.38)] overflow-hidden bg-white ring-2 ring-white relative">
                      <Image 
                        src={candle.photoUrl || '/images/comunidad/golden_retriever_celestial_clean.webp'} 
                        alt={candle.petName} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </div>

                  {/* DATOS DEL PERRO / GATO */}
                  <div className="space-y-1 px-1">
                    <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#2D0F31] group-hover:text-[#B83C7E] transition-colors leading-tight">
                      {candle.petName}
                    </h3>
                    <p className="text-xs text-[#5C3C58] italic line-clamp-2 min-h-[32px] flex items-center justify-center font-serif">
                      «{candle.dedication}»
                    </p>
                    <p className="text-[10.5px] text-[#9A7893] truncate">
                      {candle.authorName}
                    </p>
                  </div>

                  {/* ESTADO DE LA VELA (LLAMAS ENCENDIDAS CON CORAZÓN / LLAMAS APAGADAS) */}
                  <div className="my-2.5">
                    {isEternal ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#92400E] text-[11px] font-bold border border-[#FDE68A]">
                        <Image 
                          src="/images/icons/plans/icon-plan-estrella.svg" 
                          alt="Estrella" 
                          width={20} 
                          height={20} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span>Llama Eterna (Siempre encendida)</span>
                      </span>
                    ) : isNeedsReignition ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold border border-[#FDE68A] animate-pulse">
                        ⏳ Llama apagada · Toca para encenderla
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] text-[#166534] text-[11px] font-medium border border-[#BBF7D0]">
                        <Image 
                          src="/images/icons/plans/icon-plan-eterno.svg" 
                          alt="Corazón" 
                          width={20} 
                          height={20} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span>Llama encendida · Quedan {candle.daysRemaining} días</span>
                      </span>
                    )}
                  </div>

                  {/* BOTÓN «Te acompaño» CON CORAZÓN RELLENO ROSA Y ENLACE «Ver su recuerdo →» */}
                  <div className="space-y-2 pt-1 border-t border-[#F5E2EE]">
                    <button
                      onClick={(e) => handleSendWarmth(candle.id, e)}
                      className="w-full py-2 px-3 rounded-full text-xs font-bold text-[#B83C7E] bg-[#FFF0F6] hover:bg-[#FFE3EE] border border-[#F0BED6] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#DF6197" className="shrink-0 overflow-visible">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>Te acompaño</span>
                    </button>

                    <button
                      onClick={() => setSelectedCandle(candle)}
                      className="text-[11px] font-semibold text-[#8C3F71] hover:text-[#B83C7E] transition-colors block w-full py-0.5"
                    >
                      Ver su recuerdo →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: DETALLE DE VELA SELECCIONADA                                     */}
      {/* ========================================================================= */}
      {selectedCandle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-center space-y-4 relative text-[#2D0F31] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCandle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Vela y foto */}
            <div className="relative w-24 h-24 mx-auto rounded-full border-[3px] border-[#F59E0B] shadow-lg overflow-hidden bg-white ring-4 ring-[#FFF0F6]">
              <Image 
                src={selectedCandle.photoUrl || '/images/comunidad/golden_retriever_celestial_clean.webp'} 
                alt={selectedCandle.petName} 
                fill 
                className="object-cover" 
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFF0F6] border border-[#F0BED6] text-[10.5px] font-bold text-[#8C3F71] mb-1">
                <span>🕯️</span>
                <span>Vela del Cielo de Luces</span>
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#2D0F31]">
                {selectedCandle.petName}
              </h3>
              <p className="text-xs text-[#8C6D83] italic">
                Encendida por {selectedCandle.authorName} · {selectedCandle.litDate}
              </p>
              {selectedCandle.socialHandle && (
                <p className="text-[11px] font-semibold text-[#8C3F71] mt-0.5">
                  📸 {selectedCandle.socialHandle}
                </p>
              )}
            </div>

            {/* Dedicatoria completa */}
            <div className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#F5E2CC] text-xs sm:text-sm text-[#5C3C58] italic font-serif leading-relaxed">
              «{selectedCandle.dedication}»
            </div>

            {/* Estado de días o aviso de apagado */}
            <div className="text-xs font-semibold text-[#8C3F71] flex items-center justify-center gap-2">
              {selectedCandle.isEternal ? (
                <span className="flex items-center gap-1 text-[#92400E]">
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  <span>Esta vela tiene una Llama Eterna que nunca se apagará.</span>
                </span>
              ) : selectedCandle.daysRemaining > 0 ? (
                <span className="flex items-center gap-1 text-[#166534]">
                  <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Corazón" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  <span>Su llama permanecerá encendida {selectedCandle.daysRemaining} días más (te llegará un aviso si se apaga)</span>
                </span>
              ) : (
                <span className="text-[#B45309]">⏳ Esta llama se ha apagado. Te hemos enviado un aviso por email para que puedas volver a encenderla con tu amor.</span>
              )}
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col gap-2.5">
              {selectedCandle.isNeedsReignition ? (
                <button
                  onClick={() => handleReigniteCandle(selectedCandle.id)}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#D97706] to-[#F59E0B]"
                >
                  <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Corazón" width={16} height={16} className="w-4 h-4 object-contain" />
                  <span>Volver a encender su llama por 7 días</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSendWarmth(selectedCandle.id)}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#B83C7E] to-[#8C2860]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" className="shrink-0">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Acompañar con un abrazo de luz ({selectedCandle.warmthCount})</span>
                </button>
              )}

              {/* Botón para hacer la llama eterna si aún no lo es */}
              {!selectedCandle.isEternal && (
                <Link
                  href="/desde-el-corazon"
                  className="w-full py-2.5 rounded-2xl font-bold text-[#92400E] bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-xs transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  <span>Apadrinar o escoger un plan en Ángeles en el Cielo para hacer su llama eterna</span>
                </Link>
              )}

              <Link
                href="/comunidad"
                className="w-full py-2.5 rounded-2xl font-semibold text-[#6C5367] bg-gray-100 hover:bg-gray-200 text-xs transition-all text-center"
              >
                Ver Cartas al Cielo
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORMULARIO PARA ENCENDER UNA NUEVA VELA                          */}
      {/* ========================================================================= */}
      {showNewCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-left space-y-4 relative text-[#2D0F31] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowNewCandleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            {!newCandleCelebration ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-2xl shadow-inner">
                    🕯️
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-[#2D0F31] leading-tight">
                      Encender una vela en el Cielo de Luces
                    </h3>
                    <p className="text-xs text-[#7A6478]">
                      Tu llama permanecerá encendida durante 7 días (te avisaremos si se apaga)
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateCandle} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      ¿Cómo se llama tu angelito? *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="Ej. Toby, Chloe, Luna..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D9CBD6] bg-[#FAF1EC] text-sm text-[#2D0F31] outline-none focus:border-[#B85F9F] focus:bg-white"
                    />
                  </div>

                  {/* Subir foto opcional del perrito con pawrosa */}
                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      Foto de tu angelito para la vela (opcional)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-[#F59E0B] overflow-hidden bg-white shrink-0 relative flex items-center justify-center shadow-xs">
                        {uploadedPhotoPreview ? (
                          <Image src={uploadedPhotoPreview} alt="Foto subida" fill className="object-cover" />
                        ) : (
                          <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={22} height={22} className="object-contain opacity-80" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl border border-[#D9CBD6] bg-white hover:bg-[#FAF1EC] text-xs font-semibold text-[#8C3F71] transition-all cursor-pointer"
                      >
                        {uploadedPhotoPreview ? 'Cambiar foto' : 'Subir fotografía'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      Tipo de mascota
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewSpecies('perro')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          newSpecies === 'perro'
                            ? 'bg-[#8C3F71] text-white shadow-xs'
                            : 'bg-[#F9EFF5] text-[#6E4F66] hover:bg-[#F2DEEC]'
                        }`}
                      >
                        🐶 Perro
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSpecies('gato')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          newSpecies === 'gato'
                            ? 'bg-[#8C3F71] text-white shadow-xs'
                            : 'bg-[#F9EFF5] text-[#6E4F66] hover:bg-[#F2DEEC]'
                        }`}
                      >
                        🐱 Gato
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSpecies('otro')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          newSpecies === 'otro'
                            ? 'bg-[#8C3F71] text-white shadow-xs'
                            : 'bg-[#F9EFF5] text-[#6E4F66] hover:bg-[#F2DEEC]'
                        }`}
                      >
                        <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={13} height={13} className="object-contain" />
                        <span>Otro</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      Tu nombre o dedicatoria de familia
                    </label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Ej. Familia Martínez, Tu mamá que te ama..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D9CBD6] bg-[#FAF1EC] text-sm text-[#2D0F31] outline-none focus:border-[#B85F9F] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      Una frase o recuerdo de luz
                    </label>
                    <textarea
                      rows={2}
                      value={newDedication}
                      onChange={(e) => setNewDedication(e.target.value)}
                      placeholder="Ej. Siempre iluminarás mi camino y cada estrella del cielo..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D9CBD6] bg-[#FAF1EC] text-sm text-[#2D0F31] outline-none focus:border-[#B85F9F] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Pilar 3: Recordatorio de aniversario con fecha + email */}
                  <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F5E2CC] space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newAnniversaryOptIn}
                        onChange={(e) => setNewAnniversaryOptIn(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CBD6] text-[#A06020] focus:ring-[#A06020] cursor-pointer"
                      />
                      <span className="text-[11.5px] text-[#6A4D3B] leading-snug">
                        <strong className="font-semibold text-[#8B4513]">Recordatorio de aniversario y aviso si se apaga la vela:</strong> Deseo recibir un aviso cariñoso por email en su fecha especial y si su llama necesita ser encendida.
                      </span>
                    </label>

                    {newAnniversaryOptIn && (
                      <div className="space-y-2 pt-1 border-t border-[#F5E2CC]/60">
                        <div>
                          <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                            Fecha de aniversario o partida *
                          </label>
                          <input
                            type="date"
                            required
                            value={newAnniversaryDate}
                            onChange={(e) => setNewAnniversaryDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                            Tu correo electrónico para los avisos *
                          </label>
                          <input
                            type="email"
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="w-full px-3 py-1.5 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#B83C7E] via-[#A83273] to-[#8C2860]"
                  >
                    <span>Encender vela por {newPetName || 'mi angelito'}</span>
                    <span>→</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                  🕯️
                </div>
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-[#2D0F31]">
                    ¡La vela de {newPetName} ya brilla!
                  </h3>
                  <p className="text-xs text-[#6A5266] mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Tu llama permanecerá encendida durante 7 días en el Cielo de Luces para acompañar su vuelo. Si se apaga, te enviaremos un aviso a {newEmail || 'tu email'}.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#F5E2CC] text-xs text-[#7A5B45] italic font-serif">
                  «{newDedication || 'Una luz eterna que nunca se apagará en el Cielo de Luces.'}»
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E] flex items-center gap-2 text-left">
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
                  <span>
                    <strong>¿Quieres que su llama nunca se apague?</strong> Al <Link href="/#planes" className="underline font-bold">apadrinar o escoger un plan en Ángeles en el Cielo</Link>, su vela brillará encendida para siempre.
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = 'He encendido una vela por ' + newPetName + ' en el Cielo de Luces de Todas las mascotas van al cielo 🕯️🤍';
                      if (navigator.share) {
                        navigator.share({ title: 'Cielo lleno de luces', text: shareText, url: window.location.href });
                      } else {
                        window.open('https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + window.location.href), '_blank');
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer bg-gradient-to-r from-[#25D366] to-[#128C7E]"
                  >
                    <span>Compartir en WhatsApp o Estado</span>
                    <span>↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNewCandleModal(false)}
                    className="w-full py-2.5 px-4 rounded-2xl font-semibold text-[#6C5367] bg-gray-100 hover:bg-gray-200 text-xs transition-all cursor-pointer"
                  >
                    Cerrar y contemplar el santuario
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer oficial (idéntico a Cartas al Cielo y landing) */}
      <Footer />

    </div>
  );
}
