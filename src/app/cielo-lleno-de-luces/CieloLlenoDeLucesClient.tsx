'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import TarjetaHomenajeCelestial from '@/components/luces/TarjetaHomenajeCelestial';
import TarjetaLuzGaleria from '@/components/luces/TarjetaLuzGaleria';
import CierreCelestial from '@/components/luces/CierreCelestial';
import Link from 'next/link';
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
    id: 'candle-xena',
    petName: 'Xena',
    species: 'perro',
    authorName: 'Familia de Xena',
    dedication: 'Siempre en nuestro recuerdo, iluminando el cielo con tu amor incondicional.',
    photoUrl: '/images/comunidad/xena.jpg',
    litDate: 'Hace 1 día',
    daysRemaining: 7,
    isNeedsReignition: false,
    isEternal: true,
    warmthCount: 52,
  },
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
    dedication: 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor. Nos enseñaste a querer de nuevo. Te echaremos de menos siempre.',
    photoUrl: '/images/comunidad/chloe.jpg',
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
    photoUrl: '/images/comunidad/pet-luna-clean.webp',
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
    dedication: 'Me acompañaste en cada paso del camino, fuiste es y serás mi guía, mi apoyo y mi fuerza. Te ame toda tu vida y te amare toda la mia.',
    photoUrl: '/images/comunidad/max_real_mural.jpg',
    litDate: 'Hace 3 días',
    daysRemaining: 4,
    isNeedsReignition: false,
    warmthCount: 32,
  },
  {
    id: 'candle-menus',
    petName: 'Menus',
    species: 'gato',
    authorName: 'Familia de Menus',
    dedication: 'Fuiste un luchador, luchaste contra tu enfermedad. Siempre fuiste y serás mi guerrero.',
    photoUrl: '/images/comunidad/menus_real_mural.jpg',
    litDate: 'Hace 3 días',
    daysRemaining: 7,
    isNeedsReignition: false,
    isEternal: true,
    warmthCount: 29,
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

// Estructura versionada para historial local de visitas y abrazos de luz
export interface StoredWarmthRecord {
  lastSeenWarmthCount: number;
  lastViewedAt: string;
}

export const WARMTH_HISTORY_STORAGE_KEY = 'cielo_luces_warmth_history_v1';

export function getStoredWarmthHistory(): Record<string, StoredWarmthRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WARMTH_HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as Record<string, StoredWarmthRecord>;
  } catch {
    return {};
  }
}

export function saveWarmthRecord(candleId: string, warmthCount: number): void {
  if (typeof window === 'undefined' || !candleId) return;
  try {
    const history = getStoredWarmthHistory();
    history[candleId] = {
      lastSeenWarmthCount: Math.max(0, Number(warmthCount) || 0),
      lastViewedAt: new Date().toISOString(),
    };
    localStorage.setItem(WARMTH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Failsafe ante modo incógnito estricto o cuota de almacenamiento llena
  }
}

export default function CieloLlenoDeLucesClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isPersistentAltarEnabled = process.env.NEXT_PUBLIC_ENABLE_PERSISTENT_ALTAR !== 'false';
  const [candles, setCandles] = useState<AltarCandle[]>(SEED_CANDLES);
  const [stats, setStats] = useState<AltarStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'vivas' | 'reavivar' | 'perro' | 'gato' | 'refugios'>('todos');
  
  // Luces destacadas (Fase 3: Carrusel horizontal de homenajes con fotografía real)
  const [featuredCandles, setFeaturedCandles] = useState<AltarCandle[]>(() => {
    return SEED_CANDLES.filter(c => c.photoUrl && c.photoUrl.trim() !== '');
  });
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const checkCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardStep = typeof window !== 'undefined' && window.innerWidth >= 768 ? 256 + 24 : 256 + 16;
    const index = Math.round(scrollLeft / cardStep);
    setActiveCarouselIndex(Math.min(Math.max(index, 0), featuredCandles.length - 1));
  }, [featuredCandles.length]);

  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const { clientWidth } = carouselRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkCarouselScroll, 350);
  };

  const scrollToCarouselIndex = (index: number) => {
    if (!carouselRef.current) return;
    const cardStep = typeof window !== 'undefined' && window.innerWidth >= 768 ? 256 + 24 : 256 + 16;
    carouselRef.current.scrollTo({ left: index * cardStep, behavior: 'smooth' });
    setTimeout(checkCarouselScroll, 350);
  };

  useEffect(() => {
    checkCarouselScroll();
    window.addEventListener('resize', checkCarouselScroll);
    return () => window.removeEventListener('resize', checkCarouselScroll);
  }, [checkCarouselScroll, featuredCandles]);
  
  // Modales
  const [selectedCandle, setSelectedCandle] = useState<AltarCandle | null>(null);
  const [newWarmthSinceLastVisit, setNewWarmthSinceLastVisit] = useState<number>(0);
  const [showNewCandleModal, setShowNewCandleModal] = useState(false);
  const [newCandleCelebration, setNewCandleCelebration] = useState(false);
  const [createdCandle, setCreatedCandle] = useState<AltarCandle | null>(null);
  const [latestManageToken, setLatestManageToken] = useState<string | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  // Referencias para accesibilidad y retorno de foco
  const openModalTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Apertura de ficha de homenaje calculando novedades de abrazos
  const handleOpenCandleModal = useCallback((candle: AltarCandle) => {
    const currentCount = typeof candle.warmthCount === 'number' ? candle.warmthCount : 0;
    const history = getStoredWarmthHistory();
    const existingRecord = history[candle.id];

    if (existingRecord && typeof existingRecord.lastSeenWarmthCount === 'number') {
      const diff = Math.max(0, currentCount - existingRecord.lastSeenWarmthCount);
      setNewWarmthSinceLastVisit(diff);
    } else {
      setNewWarmthSinceLastVisit(0);
    }

    saveWarmthRecord(candle.id, currentCount);
    setSelectedCandle(candle);
  }, []);

  const handleCloseCandleModal = useCallback(() => {
    setSelectedCandle(null);
    setNewWarmthSinceLastVisit(0);
    setShowRecoveryForm(false);
    setManualTokenInput('');
  }, []);

  const handleCloseNewCandleModal = useCallback(() => {
    setShowNewCandleModal(false);
    setNewCandleCelebration(false);
    // Devolver foco al botón que abrió el modal
    if (openModalTriggerRef.current) {
      openModalTriggerRef.current.focus();
    }
  }, []);

  // Bloqueo de scroll y cierre con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNewCandleModal) {
          handleCloseNewCandleModal();
        } else if (selectedCandle) {
          handleCloseCandleModal();
        }
      }
    };

    if (showNewCandleModal || selectedCandle) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNewCandleModal, selectedCandle, handleCloseNewCandleModal, handleCloseCandleModal]);

  // Formulario nueva vela
  const petNameInputRef = useRef<HTMLInputElement>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);

  // Gestión de foco accesible al abrir el modal o la confirmación
  useEffect(() => {
    if (showNewCandleModal && !newCandleCelebration) {
      const timer = setTimeout(() => {
        petNameInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [showNewCandleModal, newCandleCelebration]);

  useEffect(() => {
    if (showNewCandleModal && newCandleCelebration) {
      const timer = setTimeout(() => {
        successButtonRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [showNewCandleModal, newCandleCelebration]);

  const [newPetName, setNewPetName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'perro' | 'gato' | 'otro'>('perro');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDedication, setNewDedication] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [commercialConsent, setCommercialConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

          if (!searchQuery.trim() && filterMode === 'todos') {
            const seedIds = new Set(SEED_CANDLES.map(s => s.id));
            const dbExtras = mapped.filter(c => !seedIds.has(c.id) && c.photoUrl && c.photoUrl.trim() !== '');
            const combined = [...SEED_CANDLES.filter(c => c.photoUrl && c.photoUrl.trim() !== ''), ...dbExtras];
            setFeaturedCandles(combined);
          }
        }
      } catch (err) {
        console.error('Error fetching persistent altar candles:', err);
      }
    }

    loadCandles();
    return () => { isCancelled = true; };
  }, [isPersistentAltarEnabled, filterMode, searchQuery]);

  // Manejo de tickets y enlaces directos
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    const candleIdParam = params.get('candleId');
    const actionParam = params.get('action');

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
            const cleanUrl = `${window.location.pathname}?candleId=${data.candleId}`;
            window.history.replaceState({}, '', cleanUrl);

            const target = candles.find(c => c.id === data.candleId);
            if (target) {
              handleOpenCandleModal(target);
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
      const target = candles.find(c => c.id === candleIdParam);
      if (target) {
        handleOpenCandleModal(target);
        if (actionParam === 'reignite') {
          showToast(`Homenaje de ${target.petName} abierto. Confirma el reavivado en el panel.`);
        }
      }
    }
  }, [candles, handleOpenCandleModal]);

  // Contadores reales de velas
  const activeCandlesCount = stats ? stats.active_candles_count : candles.filter(c => !c.isNeedsReignition).length;
  const needsReignitionCount = candles.filter(c => c.isNeedsReignition).length;

  // Filtrado de velas en cliente
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

  // Reavivar con clave manual
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

      const targetCandle = candles.find(c => c.id === candleId) || (selectedCandle?.id === candleId ? selectedCandle : null);
      saveWarmthRecord(candleId, (targetCandle?.warmthCount || 0) + 1);

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

  // Reavivar vela guardada
  const handleReigniteCandle = async (candleId: string) => {
    let token = '';
    try {
      token = localStorage.getItem(`altar_manage_${candleId}`) || '';
    } catch {}

    const currentCandle = candles.find(c => c.id === candleId) || (selectedCandle?.id === candleId ? selectedCandle : null);
    saveWarmthRecord(candleId, (currentCandle?.warmthCount || 0) + 1);

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

  // Acompañar con un abrazo de luz
  const handleSendWarmth = async (candleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const currentCandle = candles.find(c => c.id === candleId) || (selectedCandle?.id === candleId ? selectedCandle : null);
    const updatedWarmth = (currentCandle?.warmthCount || 0) + 1;
    saveWarmthRecord(candleId, updatedWarmth);

    setCandles(prev => prev.map(c => {
      if (c.id === candleId) {
        return { ...c, warmthCount: (c.warmthCount || 0) + 1 };
      }
      return c;
    }));

    setFeaturedCandles(prev => prev.map(c => {
      if (c.id === candleId) {
        return { ...c, warmthCount: (c.warmthCount || 0) + 1 };
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

  // Creación de nueva vela comunitaria gratuita
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
        if (!res.ok || !data.success || !data.candle?.id) {
          throw new Error(data.error || 'No se pudo encender la vela en el servidor.');
        }

        const newCandle: AltarCandle = {
          id: data.candle.id,
          petName: data.candle.pet_name,
          species: data.candle.species,
          authorName: data.candle.author_name,
          dedication: data.candle.dedication,
          photoUrl: data.candle.photo_url || uploadedPhotoPreview || '/images/comunidad/golden_retriever_celestial_clean.webp',
          litDate: 'Encendida hoy',
          daysRemaining: 7,
          isNeedsReignition: false,
          warmthCount: 1,
        };

        setCandles(prev => [newCandle, ...prev]);
        setCreatedCandle(newCandle);

        if (data.manageToken) {
          setLatestManageToken(data.manageToken);
          try {
            localStorage.setItem(`altar_manage_${data.candle.id}`, data.manageToken);
          } catch {}
        }

        // Mostrar confirmación personalizada específica para esta mascota
        setNewCandleCelebration(true);
        showToast(`¡Vela encendida en el Cielo de Luces por ${newPetName}!`);

        // Limpiar campos del formulario
        setNewPetName('');
        setNewDedication('');
        setNewAuthor('');
        setNewEmail('');
        setUploadedPhotoPreview(null);
      } else {
        throw new Error('El servicio de encendido de velas no está disponible temporalmente.');
      }
    } catch (err: any) {
      // Conservar campos introducidos para que el usuario pueda reintentar
      showToast(err.message || 'Error al encender la vela. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#30142D] flex flex-col selection:bg-[#F3D5E4] selection:text-[#762759] relative w-full max-w-full">
      
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#30142D] text-white px-5 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 animate-bounce">
          <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={16} height={16} className="w-4 h-4 object-contain inline-block shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera oficial compartida */}
      <CartasAlCieloHeader />

      {/* ========================================================================= */}
      {/* 2. HERO: PORTADA «CIELO LLENO DE LUCES»                                   */}
      {/* ========================================================================= */}
      <section 
        className="relative z-10 overflow-hidden transition-all duration-300 pt-28 sm:pt-32 lg:pt-24 pb-12 sm:pb-16 lg:pb-24 px-4 sm:px-6 lg:px-12 flex flex-col justify-between"
        style={{
          minHeight: 'clamp(740px, 92vh, 1020px)',
          isolation: 'isolate',
        }}
      >
        
        {/* Fondos oficiales adaptativos */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 86%, rgba(0,0,0,0.92) 89%, rgba(0,0,0,0.65) 93%, rgba(0,0,0,0.25) 96%, transparent 98.5%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 86%, rgba(0,0,0,0.92) 89%, rgba(0,0,0,0.65) 93%, rgba(0,0,0,0.25) 96%, transparent 98.5%, transparent 100%)',
          }}
        >
          <div className="hidden 2xl:block absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_PC_2560x1440.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-left-top xl:object-top" 
            />
          </div>
          <div className="hidden lg:block 2xl:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_PC_1920x1080.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-left-top lg:object-top" 
            />
          </div>
          <div className="hidden sm:block lg:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_MOVIL_1080x1350.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-top" 
            />
          </div>
          <div className="block sm:hidden absolute inset-0">
            <Image 
              src="/images/luces/fondo_hero_MOVIL_1080x1920.webp" 
              alt="Cielo lleno de luces" 
              fill 
              priority 
              quality={90}
              className="object-cover object-top" 
            />
          </div>
        </div>

        {/* Zona de transición atmosférica suave */}
        <div 
          className="absolute bottom-0 inset-x-0 h-40 sm:h-48 lg:h-56 pointer-events-none select-none z-[1]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(253, 234, 226, 0.25) 30%, rgba(249, 222, 233, 0.45) 60%, rgba(245, 218, 237, 0.25) 85%, transparent 98%, transparent 100%)',
          }}
        />

        {/* Contenedor principal: Grilla en desktop (perrito alado y arco a la izq, texto a la dcha) */}
        <div className="max-w-[1360px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center relative z-10 my-auto min-w-0">
          
          {/* Columna Izquierda: Perro alado y arco celestial en escritorio */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 pointer-events-none min-h-[460px] xl:min-h-[520px]" />

          {/* Columna Derecha: Título, invitación, botones y aviso de 7 días */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-4.5 relative w-full max-w-full min-w-0 px-2 sm:px-0">
            
            {/* Halo sutil de fondo para contraste óptimo */}
            <div 
              className="absolute -inset-4 sm:-inset-6 -z-10 rounded-3xl blur-2xl pointer-events-none opacity-80 lg:opacity-65"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.96) 0%, rgba(255, 250, 253, 0.82) 55%, rgba(255, 255, 255, 0) 100%)',
              }}
            />

            {/* Título: «Cielo lleno de luces» con «de luces» destacado en frambuesa oscuro #762759 */}
            <h1 className="font-playfair text-3xl sm:text-5xl lg:text-[44px] xl:text-[52px] font-bold tracking-tight text-[#30142D] leading-[1.12] w-full max-w-full break-words">
              Cielo lleno <br className="hidden sm:inline" />
              <span className="relative inline-block text-[#762759]">
                de luces <span className="inline-block font-sans text-2xl sm:text-4xl text-[#762759] ml-1">♡</span>
                <svg className="w-full h-3 text-[#762759]/40 -mt-1" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none">
                  <path d="M0,8 Q60,0 120,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtítulo poético */}
            <p className="font-playfair italic text-base sm:text-xl text-[#762759] font-semibold leading-snug w-full max-w-full break-words">
              Porque hay amores que nunca dejan de brillar.
            </p>

            {/* Texto de invitación */}
            <p className="font-sans text-xs sm:text-base text-[#493344] max-w-md sm:max-w-lg leading-relaxed font-medium w-full max-w-full break-words">
              Aunque ya no esté a tu lado, su luz sigue viviendo en ti. Enciende una vela en su memoria y deja que su recuerdo ilumine nuestro cielo.
            </p>

            {/* Botones de acción y nota de 7 días */}
            <div className="pt-2 flex flex-col items-center lg:items-start gap-2.5 w-full max-w-[360px] sm:max-w-none mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                
                {/* Botón Principal: «Enciende una vela en su memoria» (#86245E) */}
                <button
                  ref={openModalTriggerRef}
                  type="button"
                  onClick={() => {
                    setNewCandleCelebration(false);
                    setShowNewCandleModal(true);
                  }}
                  className="w-full sm:w-auto shrink-0 whitespace-nowrap justify-center px-6 sm:px-8 py-3.5 rounded-full font-bold text-white text-sm sm:text-base shadow-[0_10px_28px_rgba(134,36,94,0.36)] hover:shadow-[0_14px_34px_rgba(134,36,94,0.46)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 cursor-pointer bg-[#86245E] hover:bg-[#721C4F]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C10.5 4.2 10 5.8 10 7.2C10 8.8 10.9 9.8 12 9.8C13.1 9.8 14 8.8 14 7.2C14 5.8 13.5 4.2 12 2Z" fill="#FFFFFF"/>
                    <rect x="8" y="12" width="8" height="10" rx="1.8" fill="#FFFFFF"/>
                  </svg>
                  <span className="whitespace-nowrap">Enciende una vela en su memoria</span>
                  <span className="text-base sm:text-lg">→</span>
                </button>

                {/* Botón Secundario: «Ver todas las luces» */}
                <button
                  type="button"
                  onClick={handleScrollToLights}
                  className="w-full sm:w-auto shrink-0 whitespace-nowrap justify-center px-5 sm:px-6 py-3.5 rounded-full font-bold text-[#762759] bg-white/95 hover:bg-[#FFF0F6] border border-[#F0BED6] text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Ver todas las luces</span>
                  <span className="text-sm">↓</span>
                </button>
              </div>

              {/* Nota explicativa añadida junto a los botones */}
              <p className="text-[11.5px] sm:text-xs text-[#762759] font-semibold text-center lg:text-left flex items-center gap-1.5 pt-0.5">
                <span>✨</span>
                <span>Gratis durante 7 días. Puedes volver a encenderla.</span>
              </p>
            </div>

            {/* Contador dinámico real de velas: «[N] velas encendidas» */}
            <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-semibold text-[#493344] w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
              <span>
                <strong className="text-[#30142D] font-bold">{activeCandlesCount}</strong> velas encendidas
              </span>
            </div>

          </div>

          {/* En Móvil: Espacio libre controlado para contemplar la ilustración sin cortes */}
          <div className="block lg:hidden w-full h-[260px] sm:h-[320px] pointer-events-none select-none" />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONA DE FONDO CONTINUO UNIFICADO                                          */}
      {/* ========================================================================= */}
      <div 
        id="cielo-continuo-unificado" 
        className="relative w-full overflow-hidden -mt-24 sm:-mt-28 lg:-mt-36 z-0 min-w-0"
        style={{
          background: 'linear-gradient(180deg, #FBF2F6 0%, #F5E5F0 12%, #EFE1ED 30%, #E9DCED 55%, #DFD0E8 80%, #D4C3E2 100%)',
        }}
      >
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 80px, black 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 80px, black 100%)',
          }}
        >
          <div 
            className="hidden md:block absolute top-0 inset-x-0 w-full h-[1200px] lg:h-[1400px] xl:h-[1550px]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 120px, rgba(0,0,0,0.5) 240px, black 360px, black 60%, rgba(0,0,0,0.6) 80%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 120px, rgba(0,0,0,0.5) 240px, black 360px, black 60%, rgba(0,0,0,0.6) 80%, transparent 100%)',
            }}
          >
            <Image 
              src="/images/luces/fondo_02_QUE_ES_PC_1920x1080.webp" 
              alt="Cielo continuo de nubes celestiales" 
              fill 
              priority 
              quality={90}
              className="object-cover object-top" 
            />
          </div>

          <div 
            className="block md:hidden absolute top-0 inset-x-0 w-full h-[1400px] sm:h-[1600px]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100px, rgba(0,0,0,0.5) 200px, black 300px, black 60%, rgba(0,0,0,0.6) 80%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100px, rgba(0,0,0,0.5) 200px, black 300px, black 60%, rgba(0,0,0,0.6) 80%, transparent 100%)',
            }}
          >
            <Image 
              src="/images/luces/fondo_02_QUE_ES_MOVIL_1080x1920.webp" 
              alt="Cielo continuo de nubes celestiales" 
              fill 
              priority 
              quality={90}
              className="object-cover object-top" 
            />
          </div>

          <div className="absolute bottom-0 inset-x-0 h-72 sm:h-96 bg-gradient-to-t from-[#D2BFE3]/40 via-[#DFD0E8]/20 to-transparent pointer-events-none" />
        </div>

        {/* ========================================================================= */}
        {/* 3. SECCIÓN: «QUÉ ES CIELO LLENO DE LUCES» (3 TARJETAS)                    */}
        {/* ========================================================================= */}
        <section 
          id="que-es-cielo-de-luces" 
          className="relative z-10 w-full pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 min-w-0 bg-transparent"
        >
          <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
            <div 
              className="relative rounded-[28px] sm:rounded-[36px] overflow-visible transition-all duration-300"
              style={{
                isolation: 'isolate',
                boxShadow: `
                  0 0 6px 1.5px rgba(255, 240, 225, 0.90),
                  0 0 16px 4px rgba(255, 202, 190, 0.50),
                  0 0 32px 8px rgba(244, 166, 175, 0.28),
                  0 12px 38px rgba(155, 67, 110, 0.08)
                `,
              }}
            >
              {/* Borde Oro Rosa Luminoso */}
              <div
                className="absolute -inset-[1.5px] rounded-[29.5px] sm:rounded-[37.5px] pointer-events-none z-20"
                style={{
                  padding: '1.5px',
                  background: 'linear-gradient(135deg, #FFF9ED 0%, #FFD8C7 22%, #F1B2BD 45%, #FFE7CB 68%, #FFF7E9 100%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* Panel de Cristal Celestial Translúcido */}
              <div 
                className="relative z-10 w-full rounded-[28px] sm:rounded-[36px] overflow-hidden p-6 sm:p-8 lg:p-10 bg-[#FFF8FB]/[0.78] backdrop-blur-[14px] border border-[#E8A9BE]/50"
                style={{
                  boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px 0 rgba(184, 60, 126, 0.04)',
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
                  
                  {/* Título y concepto */}
                  <div className="lg:col-span-4 lg:pr-6 flex flex-col justify-center text-center lg:text-left">
                    <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#762759] uppercase mb-2">
                      Homenaje celestial
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl lg:text-[30px] font-bold text-[#30142D] leading-tight">
                      ¿Qué es Cielo lleno de luces?
                    </h2>
                    <p className="font-sans text-xs sm:text-sm text-[#493344] leading-relaxed mt-3 sm:mt-4 font-normal drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                      Un homenaje vivo y compartido, donde cada luz representa el amor, la huella y la historia de una mascota que siempre vivirá en nuestro corazón.
                    </p>
                  </div>

                  <div className="block lg:hidden w-full h-px bg-gradient-to-r from-transparent via-[#E8A9BE]/40 to-transparent -my-1" />

                  {/* Las Tres Tarjetas con fondos suaves, texto oscuro e iconos dorados */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4 items-stretch">
                    
                    {/* Tarjeta 1: Enciende su luz */}
                    <div className="relative rounded-[22px] bg-[#FFF5F9]/75 backdrop-blur-[6px] border border-[#E9C1D0]/60 shadow-[0_4px_18px_rgba(180,99,137,0.06),inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-[#FFF5F9]/95 hover:border-[#E8A9BE]/80 transition-all duration-300 flex flex-col items-center text-center p-4 sm:p-5">
                      <div className="h-[76px] sm:h-[86px] flex items-center justify-center shrink-0 mb-2.5">
                        <Image 
                          src="/images/luces/pilar-enciende-luz.webp" 
                          alt="Enciende su luz" 
                          width={508} 
                          height={726} 
                          priority 
                          className="h-[68px] sm:h-[78px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <h3 className="font-playfair font-bold text-base sm:text-lg text-[#30142D]">
                        1. Enciende su luz
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-[#493344] leading-relaxed mt-1.5 max-w-[220px]">
                        Una vela gratuita durante siete días para iluminar su memoria en el cielo.
                      </p>
                    </div>

                    {/* Tarjeta 2: Comparte su recuerdo */}
                    <div className="relative rounded-[22px] bg-[#FFF5F9]/75 backdrop-blur-[6px] border border-[#E9C1D0]/60 shadow-[0_4px_18px_rgba(180,99,137,0.06),inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-[#FFF5F9]/95 hover:border-[#E8A9BE]/80 transition-all duration-300 flex flex-col items-center text-center p-4 sm:p-5">
                      <div className="h-[76px] sm:h-[86px] flex items-center justify-center shrink-0 mb-2.5">
                        <Image 
                          src="/images/luces/pilar-comparte-recuerdo.webp" 
                          alt="Comparte su recuerdo" 
                          width={715} 
                          height={601} 
                          priority 
                          className="h-[60px] sm:h-[70px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(244,114,182,0.25)] transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <h3 className="font-playfair font-bold text-base sm:text-lg text-[#30142D]">
                        2. Comparte su recuerdo
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-[#493344] leading-relaxed mt-1.5 max-w-[220px]">
                        Añade su fotografía y dedicatoria para que todos conozcan su historia.
                      </p>
                    </div>

                    {/* Tarjeta 3: Vuelve a iluminarla */}
                    <div className="relative rounded-[22px] bg-[#FFF5F9]/75 backdrop-blur-[6px] border border-[#E9C1D0]/60 shadow-[0_4px_18px_rgba(180,99,137,0.06),inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-[#FFF5F9]/95 hover:border-[#E8A9BE]/80 transition-all duration-300 flex flex-col items-center text-center p-4 sm:p-5">
                      <div className="h-[76px] sm:h-[86px] flex items-center justify-center shrink-0 mb-2.5">
                        <Image 
                          src="/images/luces/pilar-vuelve-a-iluminar.webp" 
                          alt="Vuelve a iluminarla" 
                          width={896} 
                          height={408} 
                          priority 
                          className="w-[82px] sm:w-[96px] h-auto object-contain drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <h3 className="font-playfair font-bold text-base sm:text-lg text-[#30142D]">
                        3. Vuelve a iluminarla
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-[#493344] leading-relaxed mt-1.5 max-w-[220px]">
                        Cuando su llama descanse tras 7 días, podrás volver a encenderla gratis de forma ilimitada.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LUCES DESTACADAS (CARRUSEL MEJORADO)                                    */}
        {/* ========================================================================= */}
        <section 
          id="luces-destacadas" 
          className="relative z-10 w-full max-w-[1580px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pb-20 min-w-0 bg-transparent"
        >
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10 px-2 min-w-0">
            <h2 
              className="text-3xl sm:text-4xl lg:text-[46px] text-[#30142D] font-normal leading-[1.3] tracking-wide"
              style={{ fontFamily: "'Allura', cursive" }}
            >
              Algunas luces que hoy iluminan nuestro cielo
            </h2>
            <div className="w-24 sm:w-32 h-0.5 mx-auto mt-2 bg-gradient-to-r from-transparent via-[#F0BED6] to-transparent" />
          </div>

          <div className="relative w-full max-w-[1414px] mx-auto min-w-0">
            
            {/* Flecha Izquierda Exterior */}
            <button
              type="button"
              onClick={() => handleCarouselScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Ver luces anteriores"
              className="hidden xl:flex absolute -left-7 2xl:-left-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 hover:bg-white text-[#493344] hover:text-[#30142D] shadow-[0_4px_16px_rgba(184,60,126,0.18)] border border-[#F6E1EE] items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Carrusel Desplazable */}
            <div 
              ref={carouselRef}
              onScroll={checkCarouselScroll}
              tabIndex={0}
              aria-label="Carrusel de luces destacadas"
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none py-6 px-[calc((100%-256px)/2)] md:px-6 focus:outline-none focus:ring-2 focus:ring-[#F0BED6]/50 rounded-2xl"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredCandles.map((candle) => (
                <TarjetaHomenajeCelestial
                  key={`destacada-${candle.id}`}
                  candle={candle}
                  onSendWarmth={handleSendWarmth}
                  onSelect={handleOpenCandleModal}
                />
              ))}
            </div>

            {/* Indicadores de posición del carrusel */}
            <div 
              className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-5 select-none"
              role="tablist"
              aria-label="Indicadores de posición del carrusel"
            >
              {featuredCandles.slice(0, Math.min(featuredCandles.length, 8)).map((c, i) => (
                <button
                  key={`indicator-${c.id}`}
                  type="button"
                  onClick={() => scrollToCarouselIndex(i)}
                  aria-label={`Ver homenaje de ${c.petName}`}
                  aria-selected={activeCarouselIndex === i}
                  role="tab"
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeCarouselIndex === i
                      ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-[#F0BED6] via-[#E28DAA] to-[#86245E] shadow-[0_0_8px_rgba(226,141,170,0.65)]'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#F2D8E8] hover:bg-[#E8C2D8]'
                  }`}
                />
              ))}
            </div>

            {/* Flecha Derecha Exterior */}
            <button
              type="button"
              onClick={() => handleCarouselScroll('right')}
              disabled={!canScrollRight}
              aria-label="Ver más luces"
              className="hidden xl:flex absolute -right-7 2xl:-right-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 hover:bg-white text-[#493344] hover:text-[#30142D] shadow-[0_4px_16px_rgba(184,60,126,0.18)] border border-[#F6E1EE] items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SECCIÓN: TODAS LAS LUCES DE NUESTRO CIELO (REORDENADA)                 */}
        {/* 1. TÍTULO -> 2. BUSCADOR -> 3. FILTROS -> 4. CUADRÍCULA -> 5. LLAMA PERM */}
        {/* ========================================================================= */}
        <section 
          id="seccion-luces" 
          className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 scroll-mt-24 min-w-0 bg-transparent"
        >
          {/* 1. TÍTULO */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 px-2 min-w-0">
            <h2 
              className="text-3xl sm:text-4xl lg:text-[46px] text-[#30142D] font-normal leading-[1.3] tracking-wide"
              style={{ fontFamily: "'Allura', cursive" }}
            >
              Todas las luces de nuestro cielo
            </h2>
            <p className="font-playfair italic text-xs sm:text-sm text-[#493344] mt-1 sm:mt-1.5 max-w-md mx-auto">
              Descubre cada historia, busca a tu angelito y déjate acompañar por su luz.
            </p>
            <div className="my-2.5 w-[140px] h-[12px] mx-auto flex items-center justify-center opacity-95">
              <Image
                src="/images/luces/separador-ornamental-dorado.svg"
                alt="Separador ornamental dorado"
                width={140}
                height={12}
                className="object-contain"
              />
            </div>
          </div>

          {/* 2. BUSCADOR «Buscar por nombre» */}
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#762759] pointer-events-none text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de tu angelito..."
                aria-label="Buscar por nombre"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#ECC9DE] bg-white/95 text-xs sm:text-sm text-[#30142D] placeholder-[#6E4F66]/70 outline-none focus:border-[#86245E] focus:ring-2 focus:ring-[#86245E]/20 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#762759] hover:text-[#30142D] font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. FILTROS (Todas, Encendidas, Apagadas, Perros, Gatos, Refugios) */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => setFilterMode('todos')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'todos'
                  ? 'bg-[#86245E] text-white shadow-sm'
                  : 'bg-white/85 text-[#493344] hover:bg-[#FFF0F6] border border-[#F0BED6]'
              }`}
            >
              Todas ({candles.length})
            </button>

            <button
              onClick={() => setFilterMode('vivas')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'vivas'
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7] border border-[#BBF7D0]'
              }`}
            >
              <span>🕯️</span>
              <span>Encendidas ({activeCandlesCount})</span>
            </button>

            <button
              onClick={() => setFilterMode('reavivar')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'reavivar'
                  ? 'bg-[#92400E] text-white shadow-sm'
                  : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FCD34D]'
              }`}
            >
              <span>⏳</span>
              <span>Apagadas ({needsReignitionCount})</span>
            </button>

            <button
              onClick={() => setFilterMode('perro')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'perro'
                  ? 'bg-[#86245E] text-white shadow-sm'
                  : 'bg-white/85 text-[#493344] hover:bg-[#FFF0F6] border border-[#F0BED6]'
              }`}
            >
              🐶 Perros
            </button>

            <button
              onClick={() => setFilterMode('gato')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === 'gato'
                  ? 'bg-[#86245E] text-white shadow-sm'
                  : 'bg-white/85 text-[#493344] hover:bg-[#FFF0F6] border border-[#F0BED6]'
              }`}
            >
              🐱 Gatos
            </button>

            <button
              onClick={() => setFilterMode('refugios')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'refugios'
                  ? 'bg-[#86245E] text-white shadow-sm'
                  : 'bg-[#FFF0F6] text-[#762759] hover:bg-[#FFE3EE] border border-[#F0BED6]'
              }`}
            >
              <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={12} height={12} className="object-contain" />
              <span>Refugios</span>
            </button>
          </div>

          {/* 4. CUADRÍCULA DE HOMENAJES (5 columnas en escritorio amplio) */}
          {filteredCandles.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white/85 rounded-3xl border border-[#F2D8E8] p-8 max-w-lg mx-auto shadow-sm">
              <div className="text-4xl">🕯️</div>
              <p className="font-playfair text-xl font-bold text-[#30142D]">
                No encontramos ninguna vela con ese criterio
              </p>
              <p className="text-xs text-[#493344] max-w-xs mx-auto">
                No hay resultados para esta búsqueda o filtro en el listado de velas.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterMode('todos');
                  }}
                  className="px-5 py-2.5 rounded-full font-bold text-[#762759] text-xs bg-[#FFF0F6] border border-[#F0BED6] hover:bg-[#FCE3EE] transition-all cursor-pointer"
                >
                  Ver todas las luces
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCandleCelebration(false);
                    setShowNewCandleModal(true);
                  }}
                  className="px-5 py-2.5 rounded-full font-bold text-white text-xs bg-[#86245E] hover:bg-[#721C4F] shadow-sm transition-all cursor-pointer"
                >
                  Encender una vela ahora
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5 justify-items-center w-full">
              {filteredCandles.map((candle) => (
                <TarjetaLuzGaleria
                  key={candle.id}
                  candle={candle}
                  onSelect={(c) => handleOpenCandleModal(c as AltarCandle)}
                  onSendWarmth={handleSendWarmth}
                />
              ))}
            </div>
          )}

          {/* 5. BLOQUE «LLAMA PERMANENTE» (SITUADO DEBAJO DE LA CUADRÍCULA) */}
          <div className="mt-12 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FFF9F3] via-[#FFF3EB] to-[#FFF0F6] border border-[#FADCC7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Image 
                src="/images/icons/plans/icon-plan-estrella.svg" 
                alt="Estrella celestial" 
                width={64} 
                height={64} 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-sm" 
              />
              <div className="space-y-1">
                <h3 className="font-playfair text-base sm:text-lg font-bold text-[#30142D]">
                  Llama permanente
                </h3>
                <p className="text-xs text-[#493344] leading-relaxed max-w-xl">
                  Las velas de la comunidad permanecen encendidas durante <strong>7 días gratuitos</strong> y puedes volver a encenderlas gratis en cualquier momento. Si deseas que la luz de tu angelito no se apague nunca, puedes apadrinar o elegir un plan conmemorativo en el Mural Global.
                </p>
              </div>
            </div>
            <Link
              href="/#planes"
              className="shrink-0 w-full sm:w-auto text-center px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#86245E] hover:bg-[#721C4F] shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver planes y apadrinar</span>
              <span>→</span>
            </Link>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 7. CIERRE CELESTIAL «Ángeles en el Cielo»                                  */}
        {/* ========================================================================= */}
        <CierreCelestial />

      </div>

      {/* ========================================================================= */}
      {/* 10. FICHA DE HOMENAJE (MODAL DE DETALLE)                                  */}
      {/* ========================================================================= */}
      {mounted && selectedCandle && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#0D0312]/85 backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseCandleModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-homenaje-titulo"
        >
          <div 
            className="rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-[0_24px_64px_rgba(45,15,49,0.55),0_0_24px_rgba(240,190,214,0.30)] border border-[#F0BED6]/90 text-center space-y-4 relative text-[#30142D] max-h-[92vh] overflow-y-auto my-auto z-10 bg-[#F8E4EF] bg-cover bg-top bg-no-repeat bg-[url('/images/luces/modal-celestial-mobile-1080x1920.webp')] md:bg-[url('/images/luces/modal-celestial-desktop-1200x1600.webp')]"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button
              type="button"
              onClick={handleCloseCandleModal}
              className="absolute top-4 right-4 text-[#762759] hover:text-[#30142D] w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#F0BED6]/90 flex items-center justify-center cursor-pointer transition-colors z-20 font-bold shadow-xs select-none"
              aria-label="Cerrar modal de homenaje"
            >
              ✕
            </button>

            {/* 1. Prioridad: Fotografía del angelito */}
            <div className="relative w-24 h-24 mx-auto rounded-full border-[2.5px] border-[#F0BED6] shadow-[0_0_14px_rgba(240,190,214,0.45),0_4px_12px_rgba(116,52,90,0.15)] overflow-hidden bg-[#FAF3F7]">
              <Image 
                src={selectedCandle.photoUrl || '/images/comunidad/golden_retriever_celestial_clean.webp'} 
                alt={selectedCandle.petName} 
                fill 
                className="object-cover" 
              />
            </div>

            {/* 2. Prioridad: Nombre y autor */}
            <div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/85 backdrop-blur-md border border-[#F0BED6] text-[10.5px] font-bold text-[#762759] mb-1 shadow-xs">
                <span>🕯️</span>
                <span>Vela del Cielo de Luces</span>
              </div>
              <h3 id="modal-homenaje-titulo" className="font-playfair text-2xl font-bold text-[#30142D] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                {selectedCandle.petName}
              </h3>
              <p className="text-xs text-[#493344] italic font-medium drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                Encendida por {selectedCandle.authorName} · {selectedCandle.litDate}
              </p>
              {selectedCandle.socialHandle && (
                <p className="text-[11px] font-semibold text-[#762759] mt-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  📸 {selectedCandle.socialHandle}
                </p>
              )}
            </div>

            {/* 3. Prioridad: Estado de la vela */}
            <div className="text-xs font-semibold flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/80 backdrop-blur-xs border border-[#F0BED6]/70 shadow-xs">
              {selectedCandle.isEternal ? (
                <span className="flex items-center gap-1.5 text-[#92400E]">
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  <span>Esta vela tiene una <strong>Llama Eterna</strong> que nunca se apagará.</span>
                </span>
              ) : selectedCandle.daysRemaining > 0 ? (
                <span className="flex items-center gap-1.5 text-[#166534]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Su llama permanecerá encendida <strong>{selectedCandle.daysRemaining} días más</strong></span>
                </span>
              ) : (
                <span className="text-[#92400E] flex items-center gap-1.5">
                  <span>⏳</span>
                  <span>Esta llama ha descansado. Puedes volver a encenderla gratis.</span>
                </span>
              )}
            </div>

            {/* 4. Prioridad: Dedicatoria completa */}
            <div className="p-4 rounded-2xl bg-[#FFF8FB]/92 backdrop-blur-md border border-[#F0BED6]/90 text-xs sm:text-sm text-[#493344] italic font-serif leading-relaxed shadow-xs text-left">
              «{selectedCandle.dedication}»
            </div>

            {/* Novedades de abrazos de luz desde la última visita */}
            {newWarmthSinceLastVisit > 0 && (
              <div 
                className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF5F8]/95 backdrop-blur-md border border-[#F0BED6] text-left shadow-sm flex items-start gap-3 transition-all animate-fade-in"
                role="status"
                aria-live="polite"
              >
                <div className="w-8 h-8 rounded-full bg-[#FFEBF3] border border-[#F0BED6] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#86245E" className="shrink-0" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-[#86245E] leading-snug">
                    {newWarmthSinceLastVisit === 1
                      ? `Desde tu última visita, ${selectedCandle.petName} ha recibido un nuevo abrazo de luz.`
                      : `Desde tu última visita, ${selectedCandle.petName} ha recibido ${newWarmthSinceLastVisit} nuevos abrazos de luz.`}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#762759] italic font-serif">
                    Hay corazones que siguen acompañando su recuerdo.
                  </p>
                </div>
              </div>
            )}

            {/* Acciones principales */}
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
                    <span>🕯️</span>
                    <span>Volver a encender su llama por 7 días</span>
                  </button>

                  {showRecoveryForm && (
                    <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#92400E]">🔑 Reavivar desde este dispositivo</span>
                        <span className="text-[10px] text-[#A16207]">Clave privada</span>
                      </div>
                      <p className="text-[11px] text-[#78350F] leading-tight">
                        Esta vela se encendió desde otro equipo. Introduce tu clave privada de gestión:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={manualTokenInput}
                          onChange={(e) => setManualTokenInput(e.target.value)}
                          placeholder="Clave privada de gestión..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#D97706]/40 bg-white text-xs outline-none text-[#30142D]"
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
                          className="text-[10.5px] font-semibold text-[#762759] hover:underline cursor-pointer"
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
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#86245E] hover:bg-[#721C4F]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" className="shrink-0">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Acompañar con un abrazo de luz ({selectedCandle.warmthCount})</span>
                </button>
              )}

              {/* Enlace al Mural Global si proviene de él */}
              {selectedCandle.isFromMural && (
                <Link
                  href={selectedCandle.memorialId ? `/mural-global?memorialId=${selectedCandle.memorialId}` : '/mural-global'}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-[#762759] bg-[#FFF0F6] hover:bg-[#FCE3EE] border border-[#F0BED6] text-xs transition-all text-center flex items-center justify-center gap-2 shadow-xs"
                >
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Mural" width={16} height={16} className="w-4 h-4 object-contain" />
                  <span>Ver su casilla en el Mural Global →</span>
                </Link>
              )}

              {/* Enlace a Cartas al Cielo */}
              <Link
                href="/comunidad"
                className="w-full py-2.5 rounded-2xl font-semibold text-[#493344] bg-white/85 hover:bg-white border border-[#ECC9DE] text-xs transition-all text-center shadow-xs backdrop-blur-xs"
              >
                Ver Cartas al Cielo
              </Link>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 9 & 11. FORMULARIO Y CONFIRMACIÓN PERSONALIZADA DE ENCENDIDO              */}
      {/* ========================================================================= */}
      {mounted && showNewCandleModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#0D0312]/85 backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseNewCandleModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={newCandleCelebration ? 'modal-exito-titulo' : 'modal-encender-titulo'}
        >
          <div 
            ref={modalContainerRef}
            className="rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-[0_24px_64px_rgba(45,15,49,0.55),0_0_24px_rgba(240,190,214,0.30)] border border-[#F0BED6]/90 relative text-[#30142D] max-h-[min(92vh,calc(100dvh-2rem))] overflow-y-auto my-auto z-10 bg-[#F8E4EF] bg-cover bg-top bg-no-repeat bg-[url('/images/luces/modal-celestial-mobile-1080x1920.webp')] md:bg-[url('/images/luces/modal-celestial-desktop-1200x1600.webp')]"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button
              type="button"
              onClick={handleCloseNewCandleModal}
              className="absolute top-4 right-4 text-[#762759] hover:text-[#30142D] w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center cursor-pointer transition-colors z-20 font-bold border border-[#F0BED6]/80 select-none shadow-xs"
              aria-label="Cerrar ventana"
            >
              ✕
            </button>

            {!newCandleCelebration ? (
              <>
                <div className="flex items-center gap-3 bg-white/75 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    🕯️
                  </div>
                  <div>
                    <h3 id="modal-encender-titulo" className="font-playfair text-xl font-bold text-[#30142D] leading-tight">
                      Encender una vela en su memoria
                    </h3>
                    <p className="text-xs text-[#762759] font-medium mt-0.5">
                      Vela gratuita durante 7 días · Podrás volver a encenderla siempre
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateCandle} className="space-y-3.5 pt-1">
                  
                  {/* Nombre (Obligatorio) */}
                  <div>
                    <label className="block text-xs font-bold text-[#493344] mb-1">
                      Nombre de tu angelito * <span className="font-normal text-[#762759]">(obligatorio, público)</span>
                    </label>
                    <input
                      ref={petNameInputRef}
                      type="text"
                      required
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="Ej. Toby, Chloe, Luna..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0BED6] bg-white/90 backdrop-blur-md text-sm text-[#30142D] outline-none focus:border-[#86245E] focus:bg-white focus:ring-2 focus:ring-[#86245E]/20 transition-all shadow-xs"
                    />
                  </div>

                  {/* Foto opcional */}
                  <div>
                    <label className="block text-xs font-bold text-[#493344] mb-1">
                      Fotografía para la vela <span className="font-normal text-[#762759]">(opcional, pública)</span>
                    </label>
                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-2.5 rounded-2xl border border-white/80">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-300 overflow-hidden bg-white shrink-0 relative flex items-center justify-center shadow-xs">
                        {uploadedPhotoPreview ? (
                          <Image src={uploadedPhotoPreview} alt="Foto de la mascota" fill className="object-cover" />
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
                        className="px-3.5 py-1.5 rounded-xl border border-[#F0BED6] bg-white hover:bg-[#FAF1EC] text-xs font-semibold text-[#762759] transition-all cursor-pointer shadow-2xs"
                      >
                        {uploadedPhotoPreview ? 'Cambiar fotografía' : 'Subir fotografía'}
                      </button>
                    </div>
                  </div>

                  {/* Tipo de mascota */}
                  <div>
                    <label className="block text-xs font-bold text-[#493344] mb-1">
                      Tipo de mascota
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewSpecies('perro')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          newSpecies === 'perro'
                            ? 'bg-[#86245E] text-white shadow-xs'
                            : 'bg-white/85 backdrop-blur-xs text-[#493344] hover:bg-white border border-[#F0BED6]/60'
                        }`}
                      >
                        🐶 Perro
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSpecies('gato')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          newSpecies === 'gato'
                            ? 'bg-[#86245E] text-white shadow-xs'
                            : 'bg-white/85 backdrop-blur-xs text-[#493344] hover:bg-white border border-[#F0BED6]/60'
                        }`}
                      >
                        🐱 Gato
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSpecies('otro')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          newSpecies === 'otro'
                            ? 'bg-[#86245E] text-white shadow-xs'
                            : 'bg-white/85 backdrop-blur-xs text-[#493344] hover:bg-white border border-[#F0BED6]/60'
                        }`}
                      >
                        <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={13} height={13} className="object-contain" />
                        <span>Otro</span>
                      </button>
                    </div>
                  </div>

                  {/* Nombre de la familia */}
                  <div>
                    <label className="block text-xs font-bold text-[#493344] mb-1">
                      Tu nombre o dedicatoria de familia <span className="font-normal text-[#762759]">(opcional, público)</span>
                    </label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Ej. Familia Martínez, Tu mamá que te ama..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0BED6] bg-white/90 backdrop-blur-md text-sm text-[#30142D] outline-none focus:border-[#86245E] focus:bg-white focus:ring-2 focus:ring-[#86245E]/20 transition-all shadow-xs"
                    />
                  </div>

                  {/* Dedicatoria */}
                  <div>
                    <label className="block text-xs font-bold text-[#493344] mb-1">
                      Una frase o recuerdo de luz <span className="font-normal text-[#762759]">(opcional, público)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={newDedication}
                      onChange={(e) => setNewDedication(e.target.value)}
                      placeholder="Ej. Siempre iluminarás mi camino y cada estrella del cielo..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0BED6] bg-white/90 backdrop-blur-md text-sm text-[#30142D] outline-none focus:border-[#86245E] focus:bg-white focus:ring-2 focus:ring-[#86245E]/20 resize-none transition-all shadow-xs"
                    />
                  </div>

                  {/* Correo electrónico (Privado para gestión y avisos) */}
                  <div className="p-3.5 rounded-2xl bg-[#FFF9F3]/90 backdrop-blur-md border border-[#F5E2CC] space-y-2 shadow-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                        Tu correo electrónico para gestionar la vela * <span className="font-normal text-[#762759]">(privado, obligatorio)</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="tu.correo@ejemplo.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#30142D] outline-none focus:border-[#86245E]"
                      />
                      <p className="text-[10.5px] text-[#493344] mt-1 leading-tight">
                        🔒 Tu correo es estrictamente privado y no se publica. Se utiliza exclusivamente para enviarte tu enlace seguro de gestión y permitirte volver a encender la vela gratis desde cualquier dispositivo.
                      </p>
                    </div>

                    {/* Casilla RGPD independiente para novedades comerciales (Desmarcada por defecto) */}
                    <label className="flex items-start gap-2 pt-1 border-t border-[#F5E2CC]/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={commercialConsent}
                        onChange={(e) => setCommercialConsent(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CBD6] text-[#86245E] focus:ring-[#86245E] cursor-pointer"
                      />
                      <span className="text-[11px] text-[#493344] leading-snug">
                        Deseo recibir novedades y homenajes especiales de Ángeles en el Cielo (opcional).
                      </span>
                    </label>

                    {/* Honeypot anti-spam */}
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
                    className={`w-full py-3.5 rounded-full font-bold text-white text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#86245E] hover:bg-[#721C4F] ${
                      isSubmitting ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    <span>{isSubmitting ? 'Encendiendo vela en el cielo...' : `Encender vela por ${newPetName || 'mi angelito'}`}</span>
                    <span>→</span>
                  </button>
                </form>
              </>
            ) : (
              /* ========================================================================= */
              /* 11. CONFIRMACIÓN PERSONALIZADA POST-ENCENDIDO                             */
              /* ========================================================================= */
              <div className="text-center py-2 space-y-4">
                
                {/* Estilos para animación de encendido suave de la llama una sola vez */}
                <style>{`
                  @keyframes flameSoftIgnite {
                    0% {
                      opacity: 0.25;
                      transform: scale(0.68);
                      filter: drop-shadow(0 0 0 rgba(245, 158, 11, 0));
                    }
                    45% {
                      opacity: 1;
                      transform: scale(1.18);
                      filter: drop-shadow(0 0 14px rgba(245, 158, 11, 0.85));
                    }
                    100% {
                      opacity: 1;
                      transform: scale(1);
                      filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.55));
                    }
                  }

                  @media (prefers-reduced-motion: no-preference) {
                    .flame-ignite-once {
                      animation: flameSoftIgnite 1.25s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards;
                    }
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .flame-ignite-once {
                      animation: none !important;
                      opacity: 1 !important;
                      transform: scale(1) !important;
                      filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.55)) !important;
                    }
                  }
                `}</style>

                {/* 1 & 2. FOTOGRAFÍA PROTAGONISTA CON HALO DORADO Y LLAMA ENCENDIDA */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-1">
                  {/* Halo resplandeciente dorado celestial alrededor de la foto y llama */}
                  <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-tr from-amber-400/35 via-rose-300/25 to-amber-200/40 blur-lg pointer-events-none" />
                  
                  <div className="relative w-24 h-24 rounded-full border-3 border-amber-300/90 overflow-hidden bg-white shadow-[0_0_24px_rgba(245,158,11,0.45)] flex items-center justify-center">
                    {createdCandle?.photoUrl && !createdCandle.photoUrl.includes('golden_retriever') ? (
                      <Image src={createdCandle.photoUrl} alt={createdCandle.petName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#FAF3F7] flex items-center justify-center">
                        <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={38} height={38} className="object-contain opacity-85" />
                      </div>
                    )}
                  </div>

                  {/* Llama encendida como protagonista emocional con halo dorado y animación suave */}
                  <div 
                    aria-hidden="true"
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 flex items-center justify-center text-lg shadow-[0_2px_10px_rgba(245,158,11,0.50)] flame-ignite-once z-10"
                  >
                    🕯️
                  </div>
                </div>

                {/* 3. TÍTULO CON DETALLES CELESTIALES */}
                <div className="space-y-1">
                  <h3 id="modal-exito-titulo" className="font-playfair text-2xl sm:text-[26px] font-bold text-[#30142D] leading-tight">
                    La vela de {createdCandle?.petName || 'tu angelito'} ya está encendida
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-amber-500/80 text-xs">
                    <span>✨</span>
                    <span className="w-16 h-px bg-gradient-to-r from-transparent via-[#F0BED6] to-transparent"></span>
                    <span>✨</span>
                  </div>
                </div>

                {/* 4. DEDICATORIA SI EXISTE */}
                {createdCandle?.dedication && (
                  <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-sm border border-[#F0BED6] text-xs sm:text-[13px] text-[#381232] italic font-serif leading-relaxed shadow-xs max-w-sm mx-auto">
                    “{createdCandle.dedication}”
                  </div>
                )}

                {/* 5. INFORMACIÓN DE SIETE DÍAS */}
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/80 max-w-xs mx-auto">
                  <p className="text-xs text-[#493344] leading-relaxed">
                    Su luz brillará durante <strong className="text-[#86245E]">7 días gratuitos</strong> en el Cielo de Luces. Tu acceso para volver a encenderla ha quedado guardado automáticamente en este dispositivo.
                  </p>
                </div>

                {/* 6. BOTÓN PRINCIPAL: «Ver su luz en el cielo» */}
                <button
                  ref={successButtonRef}
                  type="button"
                  onClick={() => {
                    handleCloseNewCandleModal();
                    if (createdCandle) {
                      handleOpenCandleModal(createdCandle);
                    }
                  }}
                  className="w-full py-3.5 px-6 rounded-full font-bold text-white text-sm bg-[#86245E] hover:bg-[#721C4F] shadow-[0_4px_16px_rgba(134,36,94,0.35)] hover:shadow-[0_6px_20px_rgba(134,36,94,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#86245E] focus:ring-offset-2"
                >
                  <span>Ver su luz en el cielo</span>
                  <span>→</span>
                </button>

                {/* Acciones secundarias */}
                <div className="pt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = `He encendido una vela por ${createdCandle?.petName || 'mi angelito'} en el Cielo de Luces de Todas las mascotas van al cielo 🕯️🤍`;
                      if (navigator.share) {
                        navigator.share({ title: 'Cielo lleno de luces', text: shareText, url: window.location.href });
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`, '_blank');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-full font-bold text-white text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 transition-opacity"
                  >
                    <span>Compartir en WhatsApp o Estado</span>
                    <span>↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseNewCandleModal}
                    className="w-full py-2 px-4 rounded-full font-semibold text-[#493344] bg-white/70 hover:bg-white text-xs transition-all cursor-pointer border border-[#F0BED6]/60"
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

      {/* Footer oficial compartido */}
      <Footer />

    </div>
  );
}
