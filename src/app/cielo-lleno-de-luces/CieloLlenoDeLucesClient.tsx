'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { OctubreBanner } from '@/components/landing/OctubreBanner';
import { CartasAlCieloHeader } from '@/components/comunidad/CartasAlCieloHeader';
import { Footer } from '@/components/landing/Footer';
import type { AltarStats } from '@/types/altar';

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
  isFromMural?: boolean;
  memorialId?: string | null;
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isPersistentAltarEnabled = process.env.NEXT_PUBLIC_ENABLE_PERSISTENT_ALTAR !== 'false';
  const [hasTopBanner, setHasTopBanner] = useState(true);
  const [candles, setCandles] = useState<AltarCandle[]>(SEED_CANDLES);
  const [stats, setStats] = useState<AltarStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'vivas' | 'reavivar' | 'perro' | 'gato' | 'refugios'>('todos');
  
  // Modales
  const [selectedCandle, setSelectedCandle] = useState<AltarCandle | null>(null);
  const [showNewCandleModal, setShowNewCandleModal] = useState(false);
  const [newCandleCelebration, setNewCandleCelebration] = useState(false);
  const [latestManageToken, setLatestManageToken] = useState<string | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  // Bloqueo de scroll en body cuando un modal está abierto para evitar movimientos de fondo
  useEffect(() => {
    if (showNewCandleModal || selectedCandle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showNewCandleModal, selectedCandle]);

  // Formulario nueva vela
  const [newPetName, setNewPetName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'perro' | 'gato' | 'otro'>('perro');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDedication, setNewDedication] = useState('');
  const [newAnniversaryDate, setNewAnniversaryDate] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [commercialConsent, setCommercialConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAnniversaryOptIn, setNewAnniversaryOptIn] = useState(false);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleScrollToLights = () => {
    const el = document.getElementById('seccion-luces');
    if (el) {
      const yOffset = -96;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Carga reactiva de velas persistentes
  useEffect(() => {
    if (!isPersistentAltarEnabled) return;
    let isCancelled = false;

    async function loadCandles() {
      try {
        const queryParams = new URLSearchParams();
        if (filterMode && filterMode !== 'todos') queryParams.set('filter', filterMode);
        if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
        
        const res = await fetch(`/api/community/candles?${queryParams.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled || !data.success) return;

        if (data.stats) {
          setStats(data.stats);
        }

        if (Array.isArray(data.candles) && data.candles.length > 0) {
          const mapped: AltarCandle[] = data.candles.map((c: any) => ({
            id: c.id,
            petName: c.pet_name,
            species: c.species,
            authorName: c.author_name,
            dedication: c.dedication,
            photoUrl: c.photo_url || '/images/comunidad/golden_retriever_celestial_clean.webp',
            litDate: c.is_lit ? 'Encendida' : 'Llama en reposo',
            daysRemaining: c.days_remaining,
            isNeedsReignition: !c.is_lit,
            isEternal: c.is_eternal,
            warmthCount: c.warmth_count,
            isShelterPet: c.is_shelter_pet,
            shelterName: c.shelter_name,
            isFromMural: c.is_from_mural,
            memorialId: c.memorial_id || null,
          }));
          setCandles(mapped);
        }
      } catch (err) {
        console.error('Error fetching persistent altar candles:', err);
      }
    }

    loadCandles();
    return () => { isCancelled = true; };
  }, [isPersistentAltarEnabled, filterMode, searchQuery]);


  // Manejo seguro de tickets de intercambio de un solo uso y apertura por enlace de correo
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    const candleIdParam = params.get('candleId');
    const actionParam = params.get('action');

    // 1. Canje de ticket de un solo uso (confirmación o recuperación)
    if (ticketParam) {
      fetch('/api/community/candles/exchange-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: ticketParam })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.candleId && data.manageToken) {
            try {
              localStorage.setItem(`altar_manage_${data.candleId}`, data.manageToken);
            } catch {}
            // Limpieza inmediata del ticket en la URL (prevención de fugas en historial, logs y compartir)
            const cleanUrl = `${window.location.pathname}?candleId=${data.candleId}`;
            window.history.replaceState({}, '', cleanUrl);

            // Auto-seleccionar la vela si ya cargó
            const target = candles.find(c => c.id === data.candleId);
            if (target) {
              setSelectedCandle(target);
            }
            showToast('✓ Dispositivo vinculado con éxito para gestionar este homenaje.');
          } else {
            showToast(data.error || 'El enlace de acceso ya no es válido o ha caducado.');
          }
        })
        .catch(() => {
          showToast('Error al procesar el enlace de acceso.');
        });
    } else if (candleIdParam) {
      // 2. Apertura directa por enlace de aviso previo o reposo (?candleId=...&action=reignite)
      const target = candles.find(c => c.id === candleIdParam);
      if (target) {
        setSelectedCandle(target);
        if (actionParam === 'reignite') {
          showToast(`Homenaje de ${target.petName} abierto. Confirma el reavivado en el panel.`);
        }
      }
    }
  }, [candles]);

  // Contadores vivos
  const activeCandlesCount = stats ? stats.active_candles_count : candles.filter(c => !c.isNeedsReignition).length;
  const needsReignitionCount = candles.filter(c => c.isNeedsReignition).length;
  const totalCandlesCount = stats ? stats.total_historical_candles : candles.length;

  // Filtrado de respaldo en cliente
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

  // Reavivar con clave manual para multidispositivo
  const handleReigniteWithToken = async (candleId: string, customToken: string) => {
    if (!customToken.trim()) {
      showToast('Por favor introduce tu clave privada de gestión.');
      return;
    }
    try {
      const res = await fetch('/api/community/candles/reignite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candleId, manageToken: customToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Clave de gestión incorrecta para este homenaje.');
      }

      try {
        localStorage.setItem(`altar_manage_${candleId}`, customToken.trim());
      } catch {}

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

      setManualTokenInput('');
      showToast('¡Llama reavivada con éxito! Este dispositivo ha quedado recordado.');
    } catch (err: any) {
      showToast(err.message || 'Error al reavivar la vela.');
    }
  };

  // Solicitar recuperación segura de clave
  const handleRequestRecovery = async (candleId: string, emailArg?: string) => {
    const targetEmail = (emailArg || recoveryEmailInput).trim();
    if (!targetEmail) {
      showToast('Por favor introduce tu correo electrónico.');
      return;
    }
    setIsRecovering(true);
    try {
      const res = await fetch('/api/community/candles/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candleId, email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo tramitar la solicitud.');
      }
      showToast(data.message || 'Solicitud de recuperación verificada.');
      setShowRecoveryForm(false);
      setRecoveryEmailInput('');
    } catch (err: any) {
      showToast(err.message || 'Error en la solicitud.');
    } finally {
      setIsRecovering(false);
    }
  };

  // Acción: Encender llama apagada (Reavivado gratuito e ilimitado)
  const handleReigniteCandle = async (candleId: string) => {
    let token = '';
    try {
      token = localStorage.getItem(`altar_manage_${candleId}`) || '';
    } catch {}

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

    if (isPersistentAltarEnabled && token) {
      try {
        await fetch('/api/community/candles/reignite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candleId, manageToken: token }),
        });
      } catch (err) {
        console.error('Error re-igniting candle via API:', err);
      }
    }

    showToast('Llama encendida con éxito. Permanecerá ardiendo 7 días más en el Cielo de Luces.');
  };

  // Acción: Acompañar / Enviar calor
  const handleSendWarmth = async (candleId: string, e?: React.MouseEvent) => {
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

    if (isPersistentAltarEnabled) {
      try {
        await fetch('/api/community/candles/warmth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candleId }),
        });
      } catch (err) {
        console.error('Error sending warmth:', err);
      }
    }
  };

  // Envío del formulario de nueva vela comunitaria gratuita
  const handleCreateCandle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) {
      showToast('Por favor introduce el nombre de tu mascota.');
      return;
    }
    if (!newEmail.trim()) {
      showToast('Por favor introduce tu correo electrónico.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isPersistentAltarEnabled) {
        const res = await fetch('/api/community/candles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pet_name: newPetName.trim(),
            species: newSpecies,
            author_name: newAuthor.trim() || 'Familia amorosa',
            dedication: newDedication.trim() || 'Una luz eterna que nunca se apagará en el Cielo de Luces.',
            photo_url: uploadedPhotoPreview || null,
            email: newEmail.trim(),
            commercial_opt_in: commercialConsent,
            honeypot: honeypot,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'No se pudo encender la vela');
        }

        const newCandle: AltarCandle = {
          id: data.candle.id,
          petName: data.candle.pet_name,
          species: data.candle.species,
          authorName: data.candle.author_name,
          dedication: data.candle.dedication,
          photoUrl: data.candle.photo_url || '/images/comunidad/golden_retriever_celestial_clean.webp',
          litDate: 'Encendida hoy',
          daysRemaining: 7,
          isNeedsReignition: false,
          warmthCount: 1,
        };

        setCandles(prev => [newCandle, ...prev]);
        if (data.manageToken) {
          setLatestManageToken(data.manageToken);
          try {
            localStorage.setItem(`altar_manage_${data.candle.id}`, data.manageToken);
          } catch {}
        }
      } else {
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
        };
        setCandles(prev => [newEntry, ...prev]);
      }

      setNewCandleCelebration(true);
      showToast(`¡Vela encendida en el Cielo de Luces por ${newPetName}!`);
    } catch (err: any) {
      showToast(err.message || 'Error al encender la vela.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#2D0F31] flex flex-col selection:bg-[#F3D5E4] selection:text-[#8C3F71] relative w-full max-w-full">
      
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
      {/* HERO: PORTAL CELESTIAL «CIELO LLENO DE LUCES» (FASE 1)                    */}
      {/* ========================================================================= */}
      <section 
        className={`relative overflow-hidden transition-all duration-300 ${
          hasTopBanner ? 'pt-52 sm:pt-56 md:pt-44 lg:pt-32' : 'pt-40 sm:pt-44 lg:pt-24'
        } pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-12 flex flex-col justify-between`}
        style={{
          minHeight: 'clamp(720px, 94vh, 980px)',
          isolation: 'isolate',
        }}
      >
        
        {/* Fondos WebP oficiales adaptativos por breakpoint (sin texto incrustado) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Pantallas muy grandes / 2K / 4K (> 1920px) */}
          <div className="hidden 2xl:block absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_PC_2560x1440.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-left-bottom xl:object-center" 
            />
          </div>
          {/* Escritorio estándar (1024px - 1920px) */}
          <div className="hidden lg:block 2xl:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_PC_1920x1080.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-left-bottom lg:object-center" 
            />
          </div>
          {/* Tablet (640px - 1024px) */}
          <div className="hidden sm:block lg:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_MOVIL_1080x1350.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-bottom" 
            />
          </div>
          {/* Móvil (< 640px) */}
          <div className="block sm:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_MOVIL_1080x1920.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-bottom" 
            />
          </div>
        </div>

        {/* Contenedor principal: Grilla en desktop (portal a la izq, texto a la dcha) */}
        <div className="max-w-[1360px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center relative z-10 my-auto min-w-0">
          
          {/* COLUMNA IZQUIERDA (Desktop): Área visual libre para contemplar el portal, escaleras y perrito */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none min-h-[460px] xl:min-h-[520px]" />

          {/* COLUMNA DERECHA (Desktop) / SUPERIOR (Móvil): Textos y CTAs */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5 relative w-full max-w-full min-w-0 px-2 sm:px-0">
            
            {/* Halo sutil de fondo para máxima legibilidad tipográfica */}
            <div 
              className="absolute -inset-4 sm:-inset-6 -z-10 rounded-3xl blur-2xl pointer-events-none opacity-75 lg:opacity-60"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.94) 0%, rgba(255, 250, 253, 0.78) 55%, rgba(255, 255, 255, 0) 100%)',
              }}
            />

            {/* Título Oficial: «Cielo lleno de luces» */}
            <h1 className="font-playfair text-3xl sm:text-5xl lg:text-[44px] xl:text-[52px] font-bold tracking-tight text-[#2D0F31] leading-[1.12] w-full max-w-full break-words">
              Cielo lleno <br className="hidden sm:inline" />
              <span className="relative inline-block text-[#B83C7E]">
                de luces <span className="inline-block font-sans text-2xl sm:text-4xl text-[#B83C7E] ml-1">♡</span>
                <svg className="w-full h-3 text-[#B83C7E]/40 -mt-1" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none">
                  <path d="M0,8 Q60,0 120,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtítulo Oficial: «Un lugar donde el amor sigue brillando». */}
            <p className="font-playfair italic text-base sm:text-xl text-[#8C3F71] font-semibold leading-snug w-full max-w-full break-words">
              «Un lugar donde el amor sigue brillando».
            </p>

            {/* Texto Emocional Oficial */}
            <p className="font-sans text-xs sm:text-base text-[#523A4E] max-w-md sm:max-w-lg leading-relaxed font-medium w-full max-w-full break-words">
              Enciende una luz por tu mascota y deja que su recuerdo siga iluminando nuestro cielo.
            </p>

            {/* Botones de Acción Oficiales */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[340px] sm:max-w-none mx-auto lg:mx-0">
              {/* Botón Principal: «Enciende una luz» */}
              <button
                type="button"
                onClick={() => {
                  setNewCandleCelebration(false);
                  setShowNewCandleModal(true);
                }}
                className="w-full sm:w-auto justify-center px-7 sm:px-8 py-3.5 rounded-full font-bold text-white text-sm sm:text-base shadow-[0_10px_28px_rgba(184,60,126,0.38)] hover:shadow-[0_14px_34px_rgba(184,60,126,0.48)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 cursor-pointer bg-gradient-to-r from-[#B83C7E] via-[#A83273] to-[#8C2860]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C10.5 4.2 10 5.8 10 7.2C10 8.8 10.9 9.8 12 9.8C13.1 9.8 14 8.8 14 7.2C14 5.8 13.5 4.2 12 2Z" fill="#FFFFFF"/>
                  <rect x="8" y="12" width="8" height="10" rx="1.8" fill="#FFFFFF"/>
                </svg>
                <span>Enciende una luz</span>
                <span className="text-base sm:text-lg">→</span>
              </button>

              {/* Botón Secundario: «Ver todas las luces» */}
              <button
                type="button"
                onClick={handleScrollToLights}
                className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3.5 rounded-full font-bold text-[#8C3F71] bg-white/95 hover:bg-[#FFF0F6] border border-[#F0BED6] text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Ver todas las luces</span>
                <span className="text-sm">↓</span>
              </button>
            </div>

            {/* Indicador Real de Llamas Vivas */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-semibold text-[#6E4F66] w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span>
                Hoy arden <strong className="text-[#2D0F31] font-bold">{activeCandlesCount}</strong> llamas vivas en el Altar
              </span>
            </div>

          </div>

          {/* En Móvil: Espacio libre para contemplar el portal celestial y el perrito en la parte inferior */}
          <div className="block lg:hidden w-full h-[320px] sm:h-[400px] pointer-events-none select-none" />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE FILTROS & BUSCADOR                                               */}
      {/* ========================================================================= */}
      <section id="seccion-luces" className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 scroll-mt-24 min-w-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-[#F6E1EE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-full min-w-0">
          
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
          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-2 md:pb-0 scrollbar-none">
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
      {mounted && selectedCandle && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#0D0312]/85 backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCandle(null);
          }}
        >
          <div 
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.50)] border border-white text-center space-y-4 relative text-[#2D0F31] max-h-[92vh] overflow-y-auto my-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button
              type="button"
              onClick={() => setSelectedCandle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors z-20 font-bold select-none"
              aria-label="Cerrar modal"
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
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const localTok = typeof window !== 'undefined' ? localStorage.getItem(`altar_manage_${selectedCandle.id}`) : null;
                      if (localTok) {
                        handleReigniteCandle(selectedCandle.id);
                      } else {
                        setShowRecoveryForm(prev => !prev);
                      }
                    }}
                    className="w-full py-3 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#D97706] to-[#F59E0B]"
                  >
                    <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Corazón" width={16} height={16} className="w-4 h-4 object-contain" />
                    <span>Volver a encender su llama por 7 días</span>
                  </button>

                  {/* Panel de clave para reavivado multidispositivo cuando no está en localStorage */}
                  {showRecoveryForm && (
                    <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#92400E]">🔑 Reavivar desde este dispositivo</span>
                        <span className="text-[10px] text-[#A16207]">Clave privada requerida</span>
                      </div>
                      <p className="text-[11px] text-[#78350F] leading-tight">
                        Esta vela se encendió desde otro equipo. Introduce su clave privada de gestión para volver a encenderla:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={manualTokenInput}
                          onChange={(e) => setManualTokenInput(e.target.value)}
                          placeholder="Clave privada de gestión..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#D97706]/40 bg-white text-xs outline-none text-[#2D0F31]"
                        />
                        <button
                          type="button"
                          onClick={() => handleReigniteWithToken(selectedCandle.id, manualTokenInput)}
                          className="px-3 py-1.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all cursor-pointer"
                        >
                          Validar
                        </button>
                      </div>

                      <div className="pt-1 border-t border-[#FDE68A]/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const emailPrompt = prompt('Introduce el correo electrónico con el que registraste esta vela:');
                            if (emailPrompt) handleRequestRecovery(selectedCandle.id, emailPrompt);
                          }}
                          className="text-[10.5px] font-semibold text-[#8C3F71] hover:underline cursor-pointer"
                        >
                          ¿Olvidaste tu clave privada?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Enlace al Mural Global para velas vinculadas */}
              {selectedCandle.isFromMural && (
                <Link
                  href={selectedCandle.memorialId ? `/mural-global?memorialId=${selectedCandle.memorialId}` : '/mural-global'}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-[#8C3F71] bg-[#FFF0F6] hover:bg-[#FCE3EE] border border-[#F0BED6] text-xs transition-all text-center flex items-center justify-center gap-2 shadow-xs"
                >
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Mural" width={16} height={16} className="w-4 h-4 object-contain" />
                  <span>Ver su casilla en el Mural Global →</span>
                </Link>
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORMULARIO PARA ENCENDER UNA NUEVA VELA                          */}
      {/* ========================================================================= */}
      {mounted && showNewCandleModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#0D0312]/85 backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewCandleModal(false);
          }}
        >
          <div 
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.50)] border border-white text-left space-y-4 relative text-[#2D0F31] max-h-[92vh] overflow-y-auto my-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button
              type="button"
              onClick={() => setShowNewCandleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors z-20 font-bold select-none"
              aria-label="Cerrar modal"
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
                      Tu llama permanecerá encendida durante 7 días y podrás reavivarla gratis desde este dispositivo
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

                  {/* Correo electrónico obligatorio para gestión y recordatorios */}
                  <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F5E2CC] space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                        Tu correo electrónico para gestionar la vela *
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="tu.correo@ejemplo.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                      />
                      <p className="text-[10px] text-[#8B5A3C] mt-1 leading-tight">
                        Tu correo vincula la vela a tu familia. Tu acceso para reavivarla se guarda automáticamente en este dispositivo. (Los avisos automáticos por correo se activarán próximamente).
                      </p>
                    </div>

                    {/* Casilla RGPD independiente para novedades comerciales (Opcional) */}
                    <label className="flex items-start gap-2 pt-1 border-t border-[#F5E2CC]/60 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={commercialConsent}
                        onChange={(e) => setCommercialConsent(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CBD6] text-[#A06020] focus:ring-[#A06020] cursor-pointer"
                      />
                      <span className="text-[11px] text-[#6A4D3B] leading-snug">
                        Deseo recibir novedades y homenajes especiales de Ángeles en el Cielo (Opcional).
                      </span>
                    </label>

                    {/* Campo Honeypot invisible contra bots */}
                    <input
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: 'none' }}
                      aria-hidden="true"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#B83C7E] via-[#A83273] to-[#8C2860] ${
                      isSubmitting ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    <span>{isSubmitting ? 'Encendiendo vela...' : `Encender vela por ${newPetName || 'mi angelito'}`}</span>
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
                    Tu llama permanecerá encendida durante 7 días en el Cielo de Luces para acompañar su vuelo. Tu clave privada ha quedado guardada de forma segura en este dispositivo para reavivarla gratis en cualquier momento.
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

                {latestManageToken && (
                  <div className="p-3 rounded-2xl bg-[#FFF0F6]/80 border border-[#F0BED6] text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8C3F71]">🔑 Clave privada para otro dispositivo</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(latestManageToken);
                            showToast('Clave privada copiada. Guárdala si deseas reavivar la vela desde otro equipo.');
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-[#8C3F71] text-white text-[10px] font-semibold hover:bg-[#6D2F56] transition-all cursor-pointer"
                      >
                        Copiar clave
                      </button>
                    </div>
                    <p className="text-[10px] text-[#7A5B70] leading-tight">
                      En este navegador ya está guardada. Copia esta clave solo si deseas reavivar la llama desde otro móvil u ordenador. No la compartas públicamente.
                    </p>
                  </div>
                )}

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
        </div>,
        document.body
      )}

      {/* Footer oficial (idéntico a Cartas al Cielo y landing) */}
      <Footer />

    </div>
  );
}
