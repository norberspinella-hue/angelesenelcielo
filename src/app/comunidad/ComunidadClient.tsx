'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartasAlCieloHeader } from '@/components/comunidad/CartasAlCieloHeader';
import { INITIAL_MOCK_TRIBUTES, MockTribute, MockTributeLetter } from '@/lib/community/mockTributes';

export interface CommunityMemory {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  photoUrl: string;
  message: string;
  authorName?: string;
  yearsOrDates?: string;
  instagram?: string;
  tiktok?: string;
  candlesCount: number;
  supportCount: number;
  hugsCount: number;
  profileSlug?: string;
  createdAt?: string;
}

interface Props {
  initialMemories: CommunityMemory[];
  isMulticartaActive?: boolean;
}

export default function ComunidadClient({ initialMemories, isMulticartaActive = false }: Props) {
  const [activeMulticarta, setActiveMulticarta] = useState(isMulticartaActive);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('multicarta') === 'true' || p.get('v') === 'multicarta') {
        setActiveMulticarta(true);
      }
    }
  }, []);

  const [memories, setMemories] = useState<CommunityMemory[]>(initialMemories);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'perro' | 'gato' | 'otro'>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'velas'>('recientes');

  // Paginación y Giro 3D: "El Libro de los Ángeles"
  const [currentPage, setCurrentPage] = useState(1);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [touchStartX, setTouchStartX] = useState(0);
  const cardsPerPage = 12; // 4 filas x 3 columnas en escritorio para simetría perfecta

  // Form state
  const [petName, setPetName] = useState('');
  const [message, setMessage] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [socialShareAllowed, setSocialShareAllowed] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Focus and keyboard accessibility refs
  const lastActiveTriggerRef = React.useRef<HTMLElement | null>(null);
  const modalCloseButtonRef = React.useRef<HTMLButtonElement | null>(null);

  // Integración desde el Mural: Si viene con ?pet=Nombre, prellenar y permitir edición
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const petParam = params.get('pet');
      if (petParam) {
        setPetName(decodeURIComponent(petParam));
        if (window.location.hash === '#formulario-recuerdo') {
          setTimeout(() => {
            document.getElementById('formulario-recuerdo')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    }
  }, []);

  // Helper de previsualización para fragmentos de cartas en sobres e índice
  const previewLetterText = (text: string, maxChars: number = 140) => {
    if (!text) return '';
    const chars = Array.from(text.trim());
    if (chars.length <= maxChars) return chars.join('');
    return chars.slice(0, maxChars).join('').replace(/\s+\S*$/, '') + '…';
  };

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedMemory, setPublishedMemory] = useState<CommunityMemory | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Modal de Lectura de Carta Completa
  const [selectedMemoryForRead, setSelectedMemoryForRead] = useState<CommunityMemory | null>(null);

  // Postal Conmemorativa Digital (Descarga & Compartir)
  const [isGeneratingPostal, setIsGeneratingPostal] = useState(false);
  const [postalFeedback, setPostalFeedback] = useState<string | null>(null);

  // User reactions tracker
  const [userReactions, setUserReactions] = useState<{ [id: string]: { [type: string]: boolean } }>({});
  const [reactionFeedback, setReactionFeedback] = useState<{ [id: string]: string }>({});

  // Recordatorio de Aniversario en formulario principal
  const [wantsAnniversaryReminder, setWantsAnniversaryReminder] = useState(false);
  const [anniversaryEmail, setAnniversaryEmail] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');

  // =========================================================================
  // ESTADOS DEL PROTOTIPO EXPERIMENTAL: «LAS CARTAS DE SU VIDA» (MULTICARTA)
  // =========================================================================
  const [tributes, setTributes] = useState<MockTribute[]>(INITIAL_MOCK_TRIBUTES);
  const [activeTributeForCollection, setActiveTributeForCollection] = useState<MockTribute | null>(null);
  const [activeLetterForReader, setActiveLetterForReader] = useState<{ letter: MockTributeLetter; tribute: MockTribute } | null>(null);
  const [reviewerRole, setReviewerRole] = useState<'guardian' | 'visitor'>('guardian');
  const [isDemoDockCollapsed, setIsDemoDockCollapsed] = useState(false);
  const [showNewLetterForm, setShowNewLetterForm] = useState(false);
  const [newLetterCategory, setNewLetterCategory] = useState<'cumpleanos' | 'aniversario' | 'espontanea' | 'despedida'>('cumpleanos');
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterMessage, setNewLetterMessage] = useState('');
  const [newLetterAuthor, setNewLetterAuthor] = useState('');
  const [newLetterDate, setNewLetterDate] = useState('15 de noviembre, 2026');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del acceso discreto de reclamación/recuperación de cartas históricas
  const [showLegacyClaimModal, setShowLegacyClaimModal] = useState(false);
  const [claimTributeSlug, setClaimTributeSlug] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [claimProofEmail, setClaimProofEmail] = useState('');
  const [claimProofNote, setClaimProofNote] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'pending' | 'error'; text: string } | null>(null);

  const handleSubmitLegacyClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTributeSlug || !claimEmail.trim()) {
      setClaimFeedback({ type: 'error', text: 'Selecciona un homenaje e indica tu correo.' });
      return;
    }
    setClaimSubmitting(true);
    setClaimFeedback(null);
    try {
      const res = await fetch('/api/community/guardian/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: claimTributeSlug,
          claimantEmail: claimEmail.trim(),
          proofEmail: claimProofEmail.trim() || undefined,
          proofNote: claimProofNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimFeedback({
          type: 'pending',
          text:
            data.message ||
            'Tu solicitud está pendiente de revisión. No concedemos acceso automático por datos públicos; te confirmaremos por correo cuando sea aprobada.',
        });
      } else {
        setClaimFeedback({ type: 'error', text: data.error || 'No se pudo registrar la solicitud.' });
      }
    } catch {
      setClaimFeedback({ type: 'error', text: 'Error de conexión al enviar la solicitud.' });
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Atajo para saltar directamente a los escenarios requeridos por la prueba
  const selectScenario = (tributeId: string) => {
    const target = tributes.find(t => t.id === tributeId);
    if (target) {
      handleOpenCollection(target);
      setShowNewLetterForm(false);
      setTimeout(() => {
        document.getElementById('libro-de-los-angeles')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Cargar datos de homenajes y estado de sesión del guardián desde los endpoints reales
  React.useEffect(() => {
    if (!activeMulticarta) return;

    async function loadRealData() {
      try {
        // 1. Comprobar sesión de guardián activa
        const sessionRes = await fetch('/api/community/guardian/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.isAuthenticated) {
            setReviewerRole('guardian');
          }
        }

        // 2. Obtener homenajes reales
        const tributesRes = await fetch('/api/community/tributes');
        if (tributesRes.ok) {
          const tributesData = await tributesRes.json();
          if (tributesData.success && Array.isArray(tributesData.tributes) && tributesData.tributes.length > 0) {
            const mappedTributes: MockTribute[] = tributesData.tributes.map((t: any) => {
              const existing = INITIAL_MOCK_TRIBUTES.find(m => m.slug === t.slug || m.petName.toLowerCase() === t.petName.toLowerCase());
              return {
                id: t.id,
                slug: t.slug,
                petName: t.petName,
                species: t.species,
                speciesLabel: t.species === 'gato' ? 'Gatita' : t.species === 'perro' ? 'Perrita' : 'Ángel',
                photoUrl: t.photoUrl || (existing ? existing.photoUrl : null),
                yearsOrDates: t.yearsOrDates || (existing ? existing.yearsOrDates : ''),
                authorName: t.authorDisplayName || (existing ? existing.authorName : 'Familia'),
                guardianEmail: existing ? existing.guardianEmail : 'familia@ejemplo.com',
                muralSlot: existing ? existing.muralSlot : null,
                candlesCount: t.candlesCount || 0,
                supportCount: 0,
                hugsCount: t.hugsCount || 0,
                letters: existing ? existing.letters : [],
              };
            });

            setTributes(prev => {
              const combined = [...INITIAL_MOCK_TRIBUTES];
              for (const t of mappedTributes) {
                if (!combined.some(c => c.slug === t.slug || c.id === t.id)) {
                  combined.push(t);
                }
              }
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Cargando con datos locales de staging:', err);
      }
    }

    loadRealData();
  }, [activeMulticarta]);

  // Abrir colección individual y cargar cartas reales desde el backend si existen
  const handleOpenCollection = async (tribute: MockTribute) => {
    setActiveTributeForCollection(tribute);
    setShowNewLetterForm(false);

    if (tribute.slug) {
      try {
        const res = await fetch(`/api/community/tributes/${tribute.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.letters && data.letters.length > 0) {
            const categoryLabels: Record<string, string> = {
              cumpleanos: '🎂 Cumpleaños en el cielo',
              aniversario: '🕊️ Aniversario de partida',
              espontanea: '🌿 Recuerdo espontáneo',
              despedida: '💌 Carta de despedida',
            };

            const backendLetters: MockTributeLetter[] = data.letters.map((l: any, idx: number) => ({
              id: l.id,
              tributeId: tribute.id,
              title: l.title,
              category: l.category,
              categoryLabel: categoryLabels[l.category] || '💌 Carta de homenaje',
              message: l.content,
              authorName: l.authorName,
              displayDate: l.displayDate,
              publishedAt: l.createdAt,
              candlesCount: 1,
              hugsCount: 0,
              envelopeColor: (l.envelopeColor as any) || (idx % 3 === 0 ? 'crema' : idx % 3 === 1 ? 'lavanda' : 'rosa'),
            }));

            // Ordenar con las más recientes arriba
            const sortedLetters = [...backendLetters].reverse();

            setActiveTributeForCollection(prev => prev ? {
              ...prev,
              letters: sortedLetters,
            } : null);

            if (data.isGuardian !== undefined) {
              setReviewerRole(data.isGuardian ? 'guardian' : 'visitor');
            }
          }
        }
      } catch (err) {
        console.warn('Usando cartas locales para colección:', err);
      }
    }
  };

  // Cambio de rol con llamada HTTP real para activar o revocar la cookie HttpOnly
  const handleSwitchRole = async (newRole: 'guardian' | 'visitor') => {
    if (newRole === 'visitor') {
      try {
        await fetch('/api/community/guardian/revoke', { method: 'POST' });
      } catch {}
      setReviewerRole('visitor');
      setToastMessage('👀 Modo Visitante activado (solo lectura, sin permiso de escritura).');
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      try {
        await fetch('/api/community/guardian/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'chloe_staging_guardian_token_secret_seed_2026',
            tributeSlug: 'chloe-spinella'
          })
        });
      } catch {}
      setReviewerRole('guardian');
      setToastMessage('🛡️ Modo Guardián activado para la familia de Chloe (permiso de escritura habilitado).');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Reacción amorosa / velita persistente en backend (con fallback local para escenarios mock)
  const handleReactionTribute = async (tributeId: string, type: 'candle' | 'hug') => {
    const target = tributes.find(t => t.id === tributeId) || activeTributeForCollection;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tributeId);

    if (isUuid && target?.slug) {
      try {
        const res = await fetch(`/api/community/tributes/${encodeURIComponent(target.slug)}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType: type }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.counts) {
            setTributes(prev => prev.map(t => t.id === tributeId ? {
              ...t,
              candlesCount: data.counts.candlesCount,
              hugsCount: data.counts.hugsCount,
            } : t));
            if (activeTributeForCollection && activeTributeForCollection.id === tributeId) {
              setActiveTributeForCollection(prev => prev ? {
                ...prev,
                candlesCount: data.counts.candlesCount,
                hugsCount: data.counts.hugsCount,
              } : null);
            }
            if (data.alreadyReacted) {
              setToastMessage(type === 'candle' ? '🕯️ Ya habías encendido una velita de recuerdo.' : '🐾 Ya habías dejado un abrazo de consuelo.');
            } else {
              setToastMessage(type === 'candle' ? '🕯️ ¡Has encendido una velita de recuerdo!' : '🐾 ¡Has dejado un abrazo de consuelo!');
            }
            setTimeout(() => setToastMessage(null), 3000);
            return;
          }
        }
      } catch {
        // continuar con actualización local si no hay conexión
      }
    }

    setTributes(prev => prev.map(t => {
      if (t.id === tributeId) {
        return {
          ...t,
          candlesCount: type === 'candle' ? t.candlesCount + 1 : t.candlesCount,
          hugsCount: type === 'hug' ? t.hugsCount + 1 : t.hugsCount,
        };
      }
      return t;
    }));

    if (activeTributeForCollection && activeTributeForCollection.id === tributeId) {
      setActiveTributeForCollection(prev => prev ? {
        ...prev,
        candlesCount: type === 'candle' ? prev.candlesCount + 1 : prev.candlesCount,
        hugsCount: type === 'hug' ? prev.hugsCount + 1 : prev.hugsCount,
      } : null);
    }

    setToastMessage(type === 'candle' ? '🕯️ ¡Has encendido una velita de recuerdo!' : '🐾 ¡Has dejado un abrazo de consuelo!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Agregar nueva carta a la colección en Modo Guardián
  const handleAddNewLetterToCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTributeForCollection || !newLetterMessage.trim()) return;

    const categoryLabels: Record<string, string> = {
      cumpleanos: '🎂 Cumpleaños en el cielo',
      aniversario: '🕊️ Aniversario de partida',
      espontanea: '🌿 Recuerdo espontáneo',
      despedida: '💌 Carta de despedida',
    };

    const nextColor: 'crema' | 'lavanda' | 'rosa' = activeTributeForCollection.letters.length % 3 === 0 ? 'crema' : activeTributeForCollection.letters.length % 3 === 1 ? 'lavanda' : 'rosa';
    const finalTitle = newLetterTitle.trim() || categoryLabels[newLetterCategory];
    const finalAuthor = newLetterAuthor.trim() || activeTributeForCollection.authorName;
    const finalDate = newLetterDate.trim() || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    // Si tiene slug de base de datos, enviar al endpoint
    if (activeTributeForCollection.slug) {
      try {
        const res = await fetch(`/api/community/tributes/${activeTributeForCollection.slug}/letters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: finalTitle,
            category: newLetterCategory,
            content: newLetterMessage.trim(),
            authorName: finalAuthor,
            envelopeColor: nextColor,
            displayDate: finalDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al guardar la carta');
        }

        const returned = data.letter;
        const newLetter: MockTributeLetter = {
          id: returned.id || `letter-${Date.now()}`,
          tributeId: activeTributeForCollection.id,
          title: returned.title || finalTitle,
          category: (returned.category as any) || newLetterCategory,
          categoryLabel: categoryLabels[newLetterCategory],
          message: returned.content || newLetterMessage.trim(),
          authorName: returned.author_name || finalAuthor,
          displayDate: returned.display_date || finalDate,
          publishedAt: returned.created_at || new Date().toISOString(),
          candlesCount: 1,
          hugsCount: 0,
          envelopeColor: (returned.envelope_color as any) || nextColor,
        };

        const updatedTributes = tributes.map(t => {
          if (t.id === activeTributeForCollection.id) {
            return {
              ...t,
              letters: [newLetter, ...t.letters],
            };
          }
          return t;
        });

        setTributes(updatedTributes);
        setActiveTributeForCollection(prev => prev ? {
          ...prev,
          letters: [newLetter, ...prev.letters],
        } : null);

        setNewLetterMessage('');
        setNewLetterTitle('');
        setShowNewLetterForm(false);
        setToastMessage(`¡Nueva carta guardada con amor en base de datos para ${activeTributeForCollection.petName}! (Total ahora: ${activeTributeForCollection.letters.length + 1} cartas)`);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      } catch (err: any) {
        setToastMessage(`⛔ ${err.message || 'No autorizado para publicar en esta colección.'}`);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
    } else {
      setToastMessage('⛔ Este homenaje no dispone de identificador válido en el servidor.');
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
  };

  // Restablecer datos simulados
  const handleResetPrototypeData = () => {
    setTributes(INITIAL_MOCK_TRIBUTES);
    setActiveTributeForCollection(null);
    setActiveLetterForReader(null);
    setShowNewLetterForm(false);
    setToastMessage('Datos de prueba del prototipo restablecidos.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Vela Semanal: Domingos de Luz & Altar Solidario
  const [weeklyCandlesCount, setWeeklyCandlesCount] = useState(438);
  const [hasLitWeeklyCandle, setHasLitWeeklyCandle] = useState(false);
  const [showWeeklyCandleModal, setShowWeeklyCandleModal] = useState(false);
  const [candlePetName, setCandlePetName] = useState('');
  const [candleDedication, setCandleDedication] = useState('');
  const [candleEmail, setCandleEmail] = useState('');
  const [candleAnniversaryOptIn, setCandleAnniversaryOptIn] = useState(true);
  const [candleCelebration, setCandleCelebration] = useState(false);

  // Keyboard Escape listener & focus restoration
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMemoryForRead) {
          setSelectedMemoryForRead(null);
          setTimeout(() => {
            lastActiveTriggerRef.current?.focus();
          }, 50);
        } else if (activeLetterForReader) {
          setActiveLetterForReader(null);
          setTimeout(() => {
            lastActiveTriggerRef.current?.focus();
          }, 50);
        } else if (showCelebrationModal) {
          setShowCelebrationModal(false);
        } else if (showWeeklyCandleModal) {
          setShowWeeklyCandleModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemoryForRead, activeLetterForReader, showCelebrationModal, showWeeklyCandleModal]);

  React.useEffect(() => {
    if (selectedMemoryForRead) {
      setTimeout(() => {
        modalCloseButtonRef.current?.focus();
      }, 50);
    } else if (activeLetterForReader) {
      setTimeout(() => {
        document.getElementById('modal-close-letter-btn')?.focus();
      }, 50);
    }
  }, [selectedMemoryForRead, activeLetterForReader]);



  // Dedicatorias recientes de la Vela Semanal
  const [recentCandleDedications, setRecentCandleDedications] = useState([
    { id: '1', pet: 'Toby', note: 'Siempre en mi corazón y en cada estrella' },
    { id: '2', pet: 'Luna', note: 'Gracias por 14 años de puro amor incondicional' },
    { id: '3', pet: 'Max', note: 'Cuidando de nosotros desde arriba con su alegría' },
    { id: '4', pet: 'Juliette', note: 'Tu huella quedó grabada en mi alma para siempre' },
  ]);

  const handleLightCandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candlePetName.trim()) return;

    setWeeklyCandlesCount(prev => prev + 1);
    setHasLitWeeklyCandle(true);
    setRecentCandleDedications(prev => [
      {
        id: Date.now().toString(),
        pet: candlePetName.trim(),
        note: candleDedication.trim() || 'Una luz eterna que nunca se apaga en el Cielo',
      },
      ...prev.slice(0, 5),
    ]);
    setCandleCelebration(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !message.trim()) {
      setSubmitError('Por favor escribe el nombre de tu ángel y unas palabras para él.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalPhotoUrl = '';

      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const uploadRes = await fetch('/api/upload-pet-photo', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.thumbnailUrl || uploadData.originalUrl || '';
        }
      }

      if (!finalPhotoUrl) {
        finalPhotoUrl = '/images/comunidad/pet-max.webp';
      }

      const cleanInstagram = instagram.trim().replace(/^@+/, '');
      const cleanTiktok = tiktok.trim().replace(/^@+/, '');

      const res = await fetch('/api/community/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: petName.trim(),
          message: message.trim(),
          species: 'perro',
          authorName: `Familia de ${petName.trim()}`,
          yearsOrDates: '2026',
          photoUrl: finalPhotoUrl,
          instagram: cleanInstagram,
          tiktok: cleanTiktok,
          isPublic,
          socialShareAllowed: false,
          anniversaryDate: '',
          anniversaryEmail: '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No se pudo registrar el recuerdo.');
      }

      const resData = await res.json();
      const newMemory: CommunityMemory = {
        id: resData.memory?.id || `mem-${Date.now()}`,
        petName: resData.memory?.petName || petName.trim(),
        species: 'perro',
        photoUrl: finalPhotoUrl,
        message: resData.memory?.message || message.trim(),
        authorName: `Familia de ${resData.memory?.petName || petName.trim()}`,
        yearsOrDates: '2026',
        instagram: cleanInstagram,
        tiktok: cleanTiktok,
        candlesCount: 1,
        supportCount: 0,
        hugsCount: 0,
        createdAt: new Date().toISOString(),
      };

      setMemories(prev => [newMemory, ...prev]);
      setCurrentPage(1);
      setPublishedMemory(newMemory);
      setShowCelebrationModal(true);

      // Si está activo el modo multicarta, registrar también en PostgreSQL como homenaje con 1ª carta
      if (activeMulticarta) {
        try {
          const tributeRes = await fetch('/api/community/tributes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              petName: petName.trim(),
              species: 'perro',
              authorName: `Familia de ${petName.trim()}`,
              email: anniversaryEmail || 'familia.prueba@ejemplo.com',
              yearsOrDates: '2026',
              photoUrl: finalPhotoUrl,
              firstLetterTitle: `Para ${petName.trim()}`,
              firstLetterCategory: 'despedida',
              firstLetterContent: message.trim(),
              firstLetterEnvelopeColor: 'crema',
              displayDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            }),
          });

          if (tributeRes.ok) {
            const tributeData = await tributeRes.json();
            const createdTribute: MockTribute = {
              id: tributeData.tribute.id,
              slug: tributeData.tribute.slug,
              petName: tributeData.tribute.petName,
              species: 'perro',
              speciesLabel: 'Perrita',
              photoUrl: finalPhotoUrl,
              yearsOrDates: '2026',
              authorName: `Familia de ${petName.trim()}`,
              guardianEmail: anniversaryEmail || 'familia.prueba@ejemplo.com',
              muralSlot: null,
              candlesCount: 1,
              supportCount: 0,
              hugsCount: 0,
              letters: [{
                id: tributeData.letter.id,
                tributeId: tributeData.tribute.id,
                title: tributeData.letter.title,
                category: tributeData.letter.category,
                categoryLabel: '💌 Carta de despedida',
                message: tributeData.letter.content,
                authorName: tributeData.letter.author_name,
                displayDate: tributeData.letter.display_date,
                publishedAt: tributeData.letter.created_at,
                candlesCount: 1,
                hugsCount: 0,
                envelopeColor: tributeData.letter.envelope_color || 'crema',
              }]
            };

            setTributes(prev => [createdTribute, ...prev]);
            setReviewerRole('guardian');
            setActiveTributeForCollection(createdTribute);
          }
        } catch (tributeErr) {
          console.warn('No se pudo registrar en /api/community/tributes:', tributeErr);
        }
      }

      setPetName('');
      setMessage('');
      setInstagram('');
      setTiktok('');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err: any) {
      console.error('Error submitting memory:', err);
      setSubmitError(err.message || 'Ha ocurrido un error al compartir tu recuerdo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (memoryId: string, reactionType: 'heart' | 'paw') => {
    const hasReacted = userReactions[memoryId]?.[reactionType];
    if (hasReacted) return;

    setMemories(prev =>
      prev.map(m => {
        if (m.id === memoryId) {
          return {
            ...m,
            candlesCount: reactionType === 'heart' ? m.candlesCount + 1 : m.candlesCount,
            supportCount: reactionType === 'paw' ? m.supportCount + 1 : m.supportCount,
          };
        }
        return m;
      })
    );

    setUserReactions(prev => ({
      ...prev,
      [memoryId]: {
        ...(prev[memoryId] || {}),
        [reactionType]: true,
      },
    }));

    if (selectedMemoryForRead && selectedMemoryForRead.id === memoryId) {
      setSelectedMemoryForRead(prev =>
        prev
          ? {
              ...prev,
              candlesCount: reactionType === 'heart' ? prev.candlesCount + 1 : prev.candlesCount,
              supportCount: reactionType === 'paw' ? prev.supportCount + 1 : prev.supportCount,
            }
          : null
      );
    }

    const feedbackText =
      reactionType === 'heart'
        ? '💖 Has enviado tu amor'
        : '🐾 Huellita de cariño enviada';

    setReactionFeedback(prev => ({ ...prev, [memoryId]: feedbackText }));
    setTimeout(() => {
      setReactionFeedback(prev => {
        const next = { ...prev };
        delete next[memoryId];
        return next;
      });
    }, 2800);

    try {
      await fetch('/api/community/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memoryId, 
          reactionType: reactionType === 'heart' ? 'candle' : 'support' 
        }),
      });
    } catch (err) {
      console.error('Error syncing reaction to server:', err);
    }
  };

  const handleShareMemory = async (memory: CommunityMemory) => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/comunidad` : 'https://todaslasmascotasvanalcielo.com/comunidad';
    const shareData = {
      title: `Carta al Cielo: ${memory.petName} · Ángeles en el Cielo`,
      text: `«${memory.message}» — Un recuerdo eterno para ${memory.petName} en el santuario de Ángeles en el Cielo.`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setPostalFeedback('¡Compartido con éxito!');
        setTimeout(() => setPostalFeedback(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        setPostalFeedback('Enlace copiado al portapapeles ♥');
        setTimeout(() => setPostalFeedback(null), 3000);
      } catch (e) {
        setPostalFeedback('Enlace: ' + shareUrl);
        setTimeout(() => setPostalFeedback(null), 3500);
      }
    }
  };

  const handleDownloadPostcard = (memory: CommunityMemory) => {
    setIsGeneratingPostal(true);
    setPostalFeedback(null);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingPostal(false);
      return;
    }

    const renderCard = (imageObj: HTMLImageElement | null, starObj: HTMLImageElement | null) => {
      const bg = ctx.createLinearGradient(0, 0, 0, 1350);
      bg.addColorStop(0, '#FFFDFB');
      bg.addColorStop(0.3, '#FAF0F6');
      bg.addColorStop(0.7, '#F6E4EF');
      bg.addColorStop(1, '#EED4E4');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#D89DBF';
      ctx.lineWidth = 3;
      ctx.strokeRect(34, 34, 1080 - 68, 1350 - 68);

      ctx.strokeStyle = 'rgba(198, 144, 98, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(46, 46, 1080 - 92, 1350 - 92);

      // Esquinas con icon-plan-estrella oficial
      if (starObj) {
        const starSize = 50;
        ctx.drawImage(starObj, 44, 44, starSize, starSize);
        ctx.drawImage(starObj, 1080 - 44 - starSize, 44, starSize, starSize);
        ctx.drawImage(starObj, 44, 1350 - 44 - starSize, starSize, starSize);
        ctx.drawImage(starObj, 1080 - 44 - starSize, 1350 - 44 - starSize, starSize, starSize);
      } else {
        ctx.fillStyle = '#C69062';
        ctx.font = '24px serif';
        ctx.fillText('★', 65, 78);
        ctx.fillText('★', 1080 - 75, 78);
        ctx.fillText('★', 65, 1350 - 60);
        ctx.fillText('★', 1080 - 75, 1350 - 60);
      }

      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#8C3F71';
      ctx.fillText('ÁNGELES EN EL CIELO', 540, 102);

      ctx.font = 'italic 17px sans-serif';
      ctx.fillStyle = '#8C7084';
      ctx.fillText('El Libro de los Ángeles · Postal Conmemorativa', 540, 132);

      const imgX = 85;
      const imgY = 165;
      const imgW = 910;
      const imgH = 630;
      const r = 26;

      if (imageObj) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(imgX + r, imgY);
        ctx.lineTo(imgX + imgW - r, imgY);
        ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + r);
        ctx.lineTo(imgX + imgW, imgY + imgH - r);
        ctx.quadraticCurveTo(imgX + imgW, imgY + imgH, imgX + imgW - r, imgY + imgH);
        ctx.lineTo(imgX + r, imgY + imgH);
        ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH - r);
        ctx.lineTo(imgX, imgY + r);
        ctx.quadraticCurveTo(imgX, imgY, imgX + r, imgY);
        ctx.closePath();
        ctx.clip();

        const hRatio = imgW / imageObj.width;
        const vRatio = imgH / imageObj.height;
        const ratio = Math.max(hRatio, vRatio);
        const shiftX = (imgW - imageObj.width * ratio) / 2;
        const shiftY = (imgH - imageObj.height * ratio) / 2;

        ctx.drawImage(
          imageObj,
          0,
          0,
          imageObj.width,
          imageObj.height,
          imgX + shiftX,
          imgY + shiftY,
          imageObj.width * ratio,
          imageObj.height * ratio
        );
        ctx.restore();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.strokeRect(imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = '#FAF0F6';
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.font = '80px sans-serif';
        ctx.fillText('🕊️', 540, 500);
      }

      ctx.textAlign = 'center';
      ctx.font = 'bold 50px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#2D0F31';
      ctx.fillText(memory.petName, 540, 870);

      // Icon paws a los lados de la fecha (sin emojis)
      const drawPawIcon = (cx: number, cy: number, scale: number = 1) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#C69062';

        // Almohadilla central
        ctx.beginPath();
        ctx.ellipse(0, 5, 7.2, 5.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4 dedos
        ctx.beginPath();
        ctx.arc(-8.2, -2.5, 3.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-3, -7.8, 3.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3, -7.8, 3.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(8.2, -2.5, 3.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      const datesText = `En memoria eterna · ${memory.yearsOrDates || 'Siempre en el corazón'}`;
      ctx.font = '600 20px sans-serif';
      ctx.fillStyle = '#C69062';
      ctx.textAlign = 'center';
      ctx.fillText(datesText, 540, 910);

      const textWidth = ctx.measureText(datesText).width;
      const pawOffset = textWidth / 2 + 28;
      drawPawIcon(540 - pawOffset, 902, 1.15);
      drawPawIcon(540 + pawOffset, 902, 1.15);

      ctx.strokeStyle = '#E2B8D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(360, 940);
      ctx.lineTo(720, 940);
      ctx.stroke();

      ctx.font = 'italic 25px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#4A2A42';

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lineCount++;
            if (lineCount >= maxLines) {
              ctx.fillText(line.trim() + '...', x, currentY);
              return;
            }
            ctx.fillText(line.trim(), x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, currentY);
      };

      wrapText(`«${memory.message}»`, 540, 990, 840, 42, 4);

      const handles = [
        memory.instagram ? `@${memory.instagram.replace(/^@/, '')}` : '',
        memory.tiktok ? `@${memory.tiktok.replace(/^@/, '')}` : '',
      ].filter(Boolean).join('  ·  ');

      if (handles) {
        ctx.font = '600 18px sans-serif';
        ctx.fillStyle = '#8C3F71';
        ctx.fillText(handles, 540, 1220);
      }

      ctx.font = '500 17px sans-serif';
      ctx.fillStyle = '#9C8295';
      ctx.fillText('todaslasmascotasvanalcielo.com · Ángeles en el Cielo', 540, 1270);

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const cleanName = memory.petName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        link.download = `postal-${cleanName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setPostalFeedback('¡Postal guardada con éxito!');
        setTimeout(() => setPostalFeedback(null), 3500);
      } catch (err) {
        console.error('Error exportando postal canvas:', err);
        setPostalFeedback('No se pudo guardar automáticamente la imagen.');
        setTimeout(() => setPostalFeedback(null), 3500);
      } finally {
        setIsGeneratingPostal(false);
      }
    };

    const loadAsset = (url?: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new (window as any).Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    Promise.all([
      loadAsset(memory.photoUrl),
      loadAsset('/images/icons/plans/icon-plan-estrella.svg'),
    ]).then(([photoImg, starImg]) => {
      renderCard(photoImg, starImg);
    });
  };

  const filteredMemories = memories
    .filter(m => {
      if (activeFilter === 'todos') return true;
      if (activeFilter === 'perro') return m.species === 'perro';
      if (activeFilter === 'gato') return m.species === 'gato';
      if (activeFilter === 'otro') return m.species !== 'perro' && m.species !== 'gato';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'velas') {
        return (b.candlesCount + b.supportCount) - (a.candlesCount + a.supportCount);
      }
      return 0;
    });

  // Cálculos de Paginación para "El Libro de los Ángeles"
  const totalPages = Math.ceil(filteredMemories.length / cardsPerPage) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * cardsPerPage;
  const pageMemories = filteredMemories.slice(startIndex, startIndex + cardsPerPage);

  const nextSafePage = targetPage !== null ? Math.min(Math.max(targetPage, 1), totalPages) : safePage;
  const nextStartIndex = (nextSafePage - 1) * cardsPerPage;
  const nextPageMemories = filteredMemories.slice(nextStartIndex, nextStartIndex + cardsPerPage);

  const handlePageChange = (newPage: number) => {
    if (isPageTurning || newPage === safePage || newPage < 1 || newPage > totalPages) return;
    setTurnDirection(newPage > safePage ? 'forward' : 'backward');
    setTargetPage(newPage);
    setIsPageTurning(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setTargetPage(null);
      setIsPageTurning(false);
    }, 900);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        handlePageChange(safePage + 1);
      } else {
        handlePageChange(safePage - 1);
      }
    }
  };

  const renderMemoryCard = (m: CommunityMemory) => (
    <div
      key={m.id}
      className="group relative bg-white rounded-[22px] overflow-hidden shadow-[0_8px_24px_rgba(140,63,113,0.06)] hover:shadow-[0_14px_32px_rgba(140,63,113,0.13)] border border-[#F0E3EB] hover:border-[#D89DBF] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div>
        {/* Contenedor de la foto de borde a borde */}
        <div className="relative w-full h-44 sm:h-48 bg-[#FAF4F9] overflow-hidden">
          <Image
            src={m.photoUrl}
            alt={`Fotografía de ${m.petName}`}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Degradado suave de fondo */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 35%, rgba(255, 255, 255, 0.95) 100%)',
            }}
          />

          {/* División no uniforme como mancha de pintura a lo largo */}
          <svg className="absolute -bottom-px left-0 w-full h-9 pointer-events-none z-20" viewBox="0 0 500 48" preserveAspectRatio="none">
            <path d="M0,22 Q30,6 65,18 T135,14 T205,24 T275,10 T345,22 T415,12 T485,20 Q495,16 500,18 L500,48 L0,48 Z" fill="#FFFFFF"/>
            <path d="M0,28 Q40,16 80,24 T160,20 T240,28 T320,18 T400,26 T480,22 Q495,24 500,25 L500,48 L0,48 Z" fill="#FFFFFF" opacity="0.65"/>
          </svg>
        </div>

        {/* Zona de texto y dedicatoria */}
        <div className="p-3.5 pt-1 space-y-1 bg-white relative z-20">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-playfair font-bold text-[#2D0F31] text-base group-hover:text-[#8C3F71] transition-colors">
              <span className="text-[#D98218] drop-shadow-[0_1px_3px_rgba(217,130,24,0.3)]">★</span>
              <span className="truncate">{m.petName}</span>
            </div>
            {m.yearsOrDates && (
              <span className="text-[10px] text-[#9CA3AF] font-semibold shrink-0">
                {m.yearsOrDates}
              </span>
            )}
          </div>

          <p className="text-xs text-[#54465B] line-clamp-3 leading-relaxed font-normal italic pt-0.5">
            «{m.message}»
          </p>

          {/* Botón accesible para abrir modal de carta completa con área táctil >= 44px */}
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                lastActiveTriggerRef.current = e.currentTarget;
                setSelectedMemoryForRead(m);
              }}
              aria-label={`Leer carta completa de ${m.petName}`}
              className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-[#8C3F71] hover:text-[#C25796] hover:underline cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8589E] rounded-md px-1"
            >
              <span>Leer carta completa</span>
              <span aria-hidden="true" className="text-sm">→</span>
            </button>
          </div>

          {/* Redes sociales (Instagram & TikTok) */}
          {(m.instagram || m.tiktok) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-0.5">
              {m.instagram && (
                <a
                  href={`https://instagram.com/${m.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FAF0F6] border border-[#EAC2DB] text-[#9E3D6F] hover:bg-[#F5DFEE] hover:border-[#DF6197] hover:-translate-y-0.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  title={`Ver Instagram de ${m.petName}: @${m.instagram.replace(/^@/, '')}`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>@${m.instagram.replace(/^@/, '')}</span>
                </a>
              )}
              {m.tiktok && (
                <a
                  href={`https://tiktok.com/@${m.tiktok.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#F5F2F6] border border-[#DDD4DE] text-[#472242] hover:bg-[#ECE4ED] hover:border-[#2D0F31] hover:-translate-y-0.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  title={`Ver TikTok de ${m.petName}: @${m.tiktok.replace(/^@/, '')}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.47 6.27 6.27 0 0 0 1.88-4.48V8.78a8.28 8.28 0 0 0 4.85 1.56V6.89a4.84 4.84 0 0 1-1-.2z"/>
                  </svg>
                  <span>@${m.tiktok.replace(/^@/, '')}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {reactionFeedback[m.id] && (
        <div className="mx-3.5 mb-1 py-0.5 px-1 rounded bg-[#FFF8FA] border border-[#D89DBF] text-[9px] font-bold text-[#8C3F71] text-center" role="status" aria-live="polite">
          {reactionFeedback[m.id]}
        </div>
      )}

      {/* Contadores semánticos y botones de reacción accesibles */}
      <div className="p-3.5 pt-2 border-t border-[#FAF0F6] flex items-center justify-between text-xs font-semibold bg-white relative z-20">
        <button 
          type="button"
          onClick={() => handleReaction(m.id, 'heart')}
          aria-label={`Enviar amor a ${m.petName} (${m.candlesCount} recibidos)`}
          className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-2.5 rounded-full hover:bg-[#FFF0F6] active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DF6197]"
          title="Enviar amor"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#DF6197" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="font-sans font-semibold text-[13px] text-[#775C73]">{m.candlesCount}</span>
        </button>

        <button 
          type="button"
          onClick={() => handleReaction(m.id, 'paw')}
          aria-label={`Dejar huella de cariño para ${m.petName} (${m.supportCount} recibidas)`}
          className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-2.5 rounded-full hover:bg-[#FDF6ED] active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C99155]"
          title="Dejar huella"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`pawGrad-${m.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F2C694"/>
                <stop offset="50%" stopColor="#E3AF78"/>
                <stop offset="100%" stopColor="#C99155"/>
              </linearGradient>
            </defs>
            <ellipse cx="12" cy="16.5" rx="5.3" ry="4.2" fill={`url(#pawGrad-${m.id})`}/>
            <circle cx="5.8" cy="10.2" r="2.3" fill={`url(#pawGrad-${m.id})`}/>
            <circle cx="9.8" cy="6.8" r="2.3" fill={`url(#pawGrad-${m.id})`}/>
            <circle cx="14.2" cy="6.8" r="2.3" fill={`url(#pawGrad-${m.id})`}/>
            <circle cx="18.2" cy="10.2" r="2.3" fill={`url(#pawGrad-${m.id})`}/>
          </svg>
          <span className="font-sans font-semibold text-[13px] text-[#775C73]">{m.supportCount}</span>
        </button>
      </div>
    </div>
  );


  // Cálculos para El Libro de los Ángeles (Prototipo Multicarta: Un sobre por mascota)
  const filteredTributes = tributes.filter(t => {
    if (activeFilter === 'todos') return true;
    return t.species === activeFilter;
  });
  const firstFeaturedTribute = filteredTributes[0] || null;
  const otherTributes = filteredTributes.slice(1);
  const envelopesPerPage = 9; // 3 columnas x 3 filas
  const totalLibroPages = Math.ceil(otherTributes.length / envelopesPerPage) || 1;
  const safeLibroPage = Math.min(Math.max(currentPage, 1), totalLibroPages);
  const startEnvelopeIndex = (safeLibroPage - 1) * envelopesPerPage;
  const paginatedOtherTributes = otherTributes.slice(startEnvelopeIndex, startEnvelopeIndex + envelopesPerPage);

  // Cálculos legado de memorias individuales
  const firstFeaturedLetter = filteredMemories[0] || null;
  const otherLetters = filteredMemories.slice(1);
  const paginatedOtherLetters = otherLetters.slice(startEnvelopeIndex, startEnvelopeIndex + envelopesPerPage);
  return (
    <div className="min-h-screen text-[#2D0F31] bg-[#24143C]">
      
      {/* ========================================================================= */}
      {/* 🧪 BARRA TÉCNICA: PANEL DE DEMOSTRACIÓN · EXCLUSIVO EN DESARROLLO LOCAL   */}
      {/* NUNCA SE MUESTRA EN PRODUCCIÓN NI CONCEDE PERMISOS SIN AUTORIZACIÓN DB   */}
      {/* ========================================================================= */}
      {process.env.NODE_ENV === 'development' && activeMulticarta && (
        isDemoDockCollapsed ? (
          <div className="fixed top-3 right-3 sm:right-6 z-[9999]">
            <button
              id="btn-show-demo-dock"
              type="button"
              onClick={() => setIsDemoDockCollapsed(false)}
              className="bg-[#1C0D26]/95 hover:bg-[#2D0F31] text-white px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E8D4BB]/40 shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              aria-label="Mostrar panel de demostración técnica"
            >
              <span>🧪</span>
              <span>Panel de Demostración</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Mostrar ▾</span>
            </button>
          </div>
        ) : (
          <aside 
            aria-label="Panel de demostración técnica" 
            className="bg-[#1C0D26] border-b border-[#E8D4BB]/30 text-white py-2.5 px-3 sm:px-6 sticky top-0 z-[9999] shadow-2xl transition-all"
          >
            <div className="max-w-7xl mx-auto flex flex-col gap-2.5 text-xs">
              {/* Fila superior: Identificador y Ocultar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-[#D9629B] to-[#9B3F77] text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] tracking-wider uppercase shadow-xs">
                    🧪 PANEL DE DEMOSTRACIÓN LOCAL (NO VISIBLE EN PRODUCCIÓN)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] text-white/60 hidden xl:inline">
                    * Los permisos se validan estrictamente en el backend. Un cambio de modo visual no concede autorización de escritura.
                  </span>
                  <button
                    id="btn-hide-demo-dock"
                    type="button"
                    onClick={() => setIsDemoDockCollapsed(true)}
                    className="text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-white/20 inline-flex items-center gap-1"
                    title="Minimizar panel para ver la interfaz limpia sin elementos de prueba"
                  >
                    <span>✕</span>
                    <span>Ocultar panel</span>
                  </button>
                </div>
              </div>

              {/* Fila inferior: Escenarios de prueba y Selector de rol simulado */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-white/60 text-[11px] hidden lg:inline mr-0.5">Escenarios:</span>
                  <button
                    id="scenario-btn-chloe"
                    type="button"
                    onClick={() => selectScenario('tribute-chloe')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      activeTributeForCollection?.id === 'tribute-chloe'
                        ? 'bg-[#E1CEDF] text-[#24143C] border-white font-bold shadow-sm'
                        : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🐶 Chloe (Perrita · 3 cartas)
                  </button>

                  <button
                    id="scenario-btn-luna-spinella"
                    type="button"
                    onClick={() => selectScenario('tribute-luna-spinella')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      activeTributeForCollection?.id === 'tribute-luna-spinella'
                        ? 'bg-[#E1CEDF] text-[#24143C] border-white font-bold shadow-sm'
                        : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🐱 Luna Spinella (Gatita · 10 cartas)
                  </button>

                  <button
                    id="scenario-btn-luna-navarro"
                    type="button"
                    onClick={() => selectScenario('tribute-luna-navarro')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      activeTributeForCollection?.id === 'tribute-luna-navarro'
                        ? 'bg-[#E1CEDF] text-[#24143C] border-white font-bold shadow-sm'
                        : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🐶 Luna Navarro (Perra · 1 carta · Homónima)
                  </button>

                  <button
                    id="scenario-btn-toby"
                    type="button"
                    onClick={() => selectScenario('tribute-toby-gomez')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      activeTributeForCollection?.id === 'tribute-toby-gomez'
                        ? 'bg-[#E1CEDF] text-[#24143C] border-white font-bold shadow-sm'
                        : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🕊️ Toby (Perro · Sin foto)
                  </button>

                  <button
                    id="scenario-btn-bruno"
                    type="button"
                    onClick={() => selectScenario('tribute-bruno-morales')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      activeTributeForCollection?.id === 'tribute-bruno-morales'
                        ? 'bg-[#FFF0DD] text-[#24143C] border-[#D4B79E] font-bold shadow-sm'
                        : 'bg-[#FFF0DD]/20 text-[#FFF0DD] border-[#D4B79E]/40 hover:bg-[#FFF0DD]/30'
                    }`}
                  >
                    ⭐ Bruno (Perro · Con Mural)
                  </button>

                  {activeTributeForCollection && (
                    <button
                      id="scenario-btn-index"
                      type="button"
                      onClick={() => {
                        setActiveTributeForCollection(null);
                        setShowNewLetterForm(false);
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#A44F99] text-white border border-white/30 hover:bg-[#B8589E] transition-all cursor-pointer"
                    >
                      📚 Volver al Índice General
                    </button>
                  )}
                </div>

                {/* Selector de Rol Simulado & Reinicio */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center p-0.5 rounded-full bg-white/10 border border-white/20">
                    <button
                      id="role-btn-guardian"
                      type="button"
                      onClick={() => handleSwitchRole('guardian')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        reviewerRole === 'guardian'
                          ? 'bg-[#D9629B] text-white shadow-xs'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      🛡️ Modo Guardián
                    </button>
                    <button
                      id="role-btn-visitor"
                      type="button"
                      onClick={() => handleSwitchRole('visitor')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        reviewerRole === 'visitor'
                          ? 'bg-[#D9629B] text-white shadow-xs'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      👀 Modo Visitante
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPrototypeData}
                    title="Restablecer datos de prueba"
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs transition-colors cursor-pointer border border-white/20"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )
      )}

      {/* Menú Propio Oficial de Cartas al Cielo */}
      <CartasAlCieloHeader />

      {/* ========================================================================= */}
      {/* 2. HERO NOCTURNO: PORTAL CELESTIAL ENVOLVENTE A ANCHO COMPLETO             */}
      {/* ========================================================================= */}
      <section className="relative bg-[#24143C] text-white overflow-hidden">
        
        {/* Fondo Panorámico Envolvente Escritorio (ancho completo, sin marco ni bordes) */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <picture className="w-full h-full block">
            <source 
              type="image/avif" 
              srcSet="/images/cartas-al-cielo/hero/hero-escritorio-1752.avif 1752w, /images/cartas-al-cielo/hero/hero-escritorio-1440.avif 1440w, /images/cartas-al-cielo/hero/hero-escritorio-1024.avif 1024w" 
              sizes="100vw"
            />
            <source 
              type="image/webp" 
              srcSet="/images/cartas-al-cielo/hero/hero-escritorio-1752.webp 1752w, /images/cartas-al-cielo/hero/hero-escritorio-1440.webp 1440w, /images/cartas-al-cielo/hero/hero-escritorio-1024.webp 1024w" 
              sizes="100vw"
            />
            <img 
              src="/images/cartas-al-cielo/hero/hero-escritorio-1440.webp" 
              alt="Portal celestial con arco de rosas, perro contemplando las estrellas y sobre iluminado" 
              className="w-full h-full object-cover object-[78%_center] lg:object-right"
              loading="eager"
            />
          </picture>
        </div>

        {/* CONTENIDO ESCRITORIO: Zona izquierda sobre el cielo estrellado */}
        <div className="hidden md:block relative z-10 max-w-[1240px] mx-auto px-6 lg:px-8 pt-32 lg:pt-36 pb-24 lg:pb-32">
          <div className="max-w-[480px] lg:max-w-[520px] space-y-6">
            
            {/* Título Oficial con degradado de marca y tipografía emocional */}
            <div>
              <h1 
                className="hero-title inline-block"
                style={{
                  fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif',
                  background: 'linear-gradient(90deg, #F8C8DC 0%, #FFFFFF 40%, #E891BA 85%, #DF6197 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.15,
                  paddingBottom: '0.12em',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  filter: 'drop-shadow(0 2px 14px rgba(223, 97, 151, 0.35))',
                }}
              >
                Cartas al Cielo
              </h1>

              <h2 
                className="font-playfair text-[32px] lg:text-[40px] font-bold text-[#FFF5F8] leading-[1.2] mt-3"
                style={{
                  textShadow: '0 2px 16px rgba(20, 10, 35, 0.9), 0 0 25px rgba(223, 97, 151, 0.3)',
                }}
              >
                Bajo las estrellas, <br />
                aún tenemos tanto que decirte.
              </h2>
            </div>

            <p 
              className="font-sans text-[15px] lg:text-[16px] leading-[1.65] text-[#E8D4BB] font-normal"
              style={{
                textShadow: '0 1px 8px rgba(10, 5, 20, 0.9)',
              }}
            >
              Un rincón de paz para escribir tu homenaje, compartir su luz en el Libro de los Ángeles y sentir el abrazo de quienes también aman más allá de este mundo.
            </p>

            {/* Botones HTML independientes */}
            <div className="flex flex-row items-center gap-4 pt-2">
              <a
                href="#formulario-recuerdo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('formulario-recuerdo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="min-h-[48px] px-7 py-3 rounded-full font-bold text-white shadow-[0_4px_22px_rgba(223,97,151,0.5)] hover:shadow-[0_6px_28px_rgba(223,97,151,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                style={{
                  background: 'linear-gradient(135deg, #9B447A 0%, #B85591 50%, #DF6197 100%)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
                <span>Escribir una carta</span>
              </a>

              <a
                href="#libro-de-los-angeles"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('libro-de-los-angeles')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="min-h-[48px] px-7 py-3 rounded-full font-semibold text-[#FFF0F5] bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>Leer las cartas</span>
              </a>
            </div>

            <div className="pt-1">
              <button
                type="button"
                id="btn-open-legacy-claim-desktop"
                onClick={() => {
                  setClaimFeedback(null);
                  if (!claimTributeSlug && tributes.length > 0) setClaimTributeSlug(tributes[0].slug);
                  setShowLegacyClaimModal(true);
                }}
                className="text-xs sm:text-[13px] text-[#FFE8F2]/85 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors cursor-pointer bg-transparent border-0"
              >
                ¿Ya escribiste una carta a tu angelito? Recupera su recuerdo.
              </button>
            </div>

          </div>
        </div>

        {/* CONTENIDO MÓVIL (<768px): Título y botones antes de la escena a ancho completo */}
        <div className="md:hidden flex flex-col relative z-10 pt-24 pb-0">
          <div className="px-5 space-y-4 text-center">
            <h1 
              className="hero-title inline-block text-[34px] sm:text-[38px]"
              style={{
                fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif',
                background: 'linear-gradient(90deg, #F8C8DC 0%, #FFFFFF 40%, #E891BA 85%, #DF6197 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.15,
                paddingBottom: '0.1em',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Cartas al Cielo
            </h1>

            <h2 
              className="font-playfair text-[22px] sm:text-[26px] font-bold text-[#FFF5F8] leading-[1.25]"
              style={{
                textShadow: '0 2px 14px rgba(20, 10, 35, 0.9)',
              }}
            >
              Bajo las estrellas, <br />
              aún tenemos tanto que decirte.
            </h2>

            <p className="font-sans text-[14px] leading-[1.6] text-[#E8D4BB] font-normal max-w-sm mx-auto">
              Un rincón de paz para escribir tu homenaje y compartir su luz en el Libro de los Ángeles.
            </p>

            {/* Botones Móvil */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#formulario-recuerdo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('formulario-recuerdo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-full font-bold text-white shadow-[0_4px_20px_rgba(223,97,151,0.5)] flex items-center justify-center gap-2 cursor-pointer text-sm"
                style={{
                  background: 'linear-gradient(135deg, #9B447A 0%, #B85591 50%, #DF6197 100%)',
                }}
              >
                <span>Escribir una carta</span>
              </a>

              <a
                href="#libro-de-los-angeles"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('libro-de-los-angeles')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-full font-semibold text-[#FFF0F5] bg-white/10 border border-white/25 backdrop-blur-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Leer las cartas</span>
              </a>
            </div>

            <div className="pt-1">
              <button
                type="button"
                id="btn-open-legacy-claim-mobile"
                onClick={() => {
                  setClaimFeedback(null);
                  if (!claimTributeSlug && tributes.length > 0) setClaimTributeSlug(tributes[0].slug);
                  setShowLegacyClaimModal(true);
                }}
                className="text-xs text-[#FFE8F2]/85 underline underline-offset-4 decoration-white/40 cursor-pointer bg-transparent border-0"
              >
                ¿Ya escribiste una carta a tu angelito? Recupera su recuerdo.
              </button>
            </div>
          </div>

          {/* Escena móvil original a ancho completo (sin marco, sin tarjeta, sin deformar) */}
          <div className="w-full relative mt-6 -mb-1">
            <picture className="w-full block">
              <source 
                type="image/avif" 
                srcSet="/images/cartas-al-cielo/hero/hero-movil-768.avif 768w, /images/cartas-al-cielo/hero/hero-movil-480.avif 480w" 
                sizes="100vw"
              />
              <source 
                type="image/webp" 
                srcSet="/images/cartas-al-cielo/hero/hero-movil-768.webp 768w, /images/cartas-al-cielo/hero/hero-movil-480.webp 480w" 
                sizes="100vw"
              />
              <img 
                src="/images/cartas-al-cielo/hero/hero-movil-768.webp" 
                alt="Portal celestial con perro contemplando las estrellas y sobre iluminado" 
                className="w-full h-auto block object-cover"
                loading="eager"
              />
            </picture>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. TRANSICIÓN DE ATMÓSFERA: DE ÍNDIGO NOCTURNO A ROSA CÁLIDO DEL JARDÍN    */}
      {/* ========================================================================= */}
      <div className="libro-transicion-cielo" aria-hidden="true" />

      {/* ========================================================================= */}
      {/* 4. EL LIBRO DE LOS ÁNGELES · JARDÍN DE ROSAS AL AMANECER                   */}
      {/* ========================================================================= */}
      <section className="libro" id="libro-de-los-angeles" aria-labelledby="libro-titulo">
        
        {/* Fondo oficial del jardín de rosas al amanecer */}
        <picture className="libro-jardin">
          <source media="(max-width: 700px)" srcSet="/images/cartas-al-cielo/libro/fondos/jardin-movil-768.webp" />
          <img src="/images/cartas-al-cielo/libro/fondos/jardin-escritorio-1440.webp" alt="" loading="lazy" />
        </picture>

        {/* ========================================================================= */}
        {/* VISTA CONDICIONAL: HISTÓRICA / PRODUCCIÓN VS EXPERIMENTAL MULTICARTA       */}
        {/* ========================================================================= */}
        {!activeMulticarta ? (
          <div className="libro-contenido max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pb-16">
            <header className="text-center pt-8 pb-4">
              <img 
                className="libro-insignia mx-auto mb-3" 
                src="/images/cartas-al-cielo/libro/assets/sobre-abierto.webp" 
                alt="Sobre abierto de El Libro de los Ángeles" 
              />
              <h2 id="libro-titulo" className="font-playfair text-3xl sm:text-4xl text-[#541731] font-bold">El Libro de los Ángeles</h2>
              <p className="text-xs sm:text-sm text-[#7A4253] text-center max-w-lg mx-auto mt-2 italic font-serif">
                Un rincón sagrado donde cada ángel tiene su luz encendida.
              </p>
            </header>

            {/* SELECTOR ORIGINAL DE FILTROS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 sm:my-8 max-w-4xl mx-auto px-2 relative z-10">
              <div 
                role="tablist" 
                aria-label="Filtrar cartas por tipo de mascota" 
                className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl sm:rounded-full bg-[rgba(246,238,244,0.75)] border border-[#EFE4EC] shadow-sm max-w-full"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'todos'}
                  onClick={() => { setActiveFilter('todos'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'todos'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'todos' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Todos</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'perro'}
                  onClick={() => { setActiveFilter('perro'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'perro'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'perro' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Perros</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'gato'}
                  onClick={() => { setActiveFilter('gato'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'gato'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'gato' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Gatos</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'otro'}
                  onClick={() => { setActiveFilter('otro'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'otro'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'otro' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Otros</span>
                </button>
              </div>
            </div>

            {/* Grid de recuerdos históricos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
              {pageMemories.map(m => renderMemoryCard(m))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8 relative z-10">
                <button
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  ← Anterior
                </button>
                <span className="text-xs font-bold text-[#834E54] px-2 select-none">
                  Página {safePage} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VISTA MULTICARTA: NIVEL 1 (ÍNDICE GENERAL) VS NIVEL 2 (COLECCIÓN)        */
          /* ========================================================================= */
          !activeTributeForCollection ? (
          <>
            {/* 4.1 CABECERA DEL LIBRO DE LOS ÁNGELES */}
            <header>
              <img 
                className="libro-insignia" 
                src="/images/cartas-al-cielo/libro/assets/sobre-abierto.webp" 
                alt="Sobre abierto de El Libro de los Ángeles" 
              />
              <h2 id="libro-titulo">El Libro de los Ángeles</h2>
              <p className="text-xs sm:text-sm text-[#7A4253] text-center max-w-lg mx-auto mt-2 italic font-serif">
                Un homenaje eterno por cada ángel. Abre su sobre para descubrir las cartas para este angelito.
              </p>
            </header>

            {/* SELECTOR ORIGINAL DE CARTAS RESTAURADO (IDÉNTICO A PRODUCCIÓN) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 sm:my-8 max-w-4xl mx-auto px-2 relative z-10">
              <div 
                role="tablist" 
                aria-label="Filtrar cartas por tipo de mascota" 
                className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl sm:rounded-full bg-[rgba(246,238,244,0.75)] border border-[#EFE4EC] shadow-sm max-w-full"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'todos'}
                  onClick={() => { setActiveFilter('todos'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'todos'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'todos' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Todos</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'perro'}
                  onClick={() => { setActiveFilter('perro'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'perro'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'perro' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Perros</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'gato'}
                  onClick={() => { setActiveFilter('gato'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'gato'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'gato' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Gatos</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'otro'}
                  onClick={() => { setActiveFilter('otro'); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                    activeFilter === 'otro'
                      ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                      : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'otro' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                  <span>Otras mascotas</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D9CBD6] text-xs font-semibold text-[#5B2E58] shadow-sm select-none min-h-[36px]">
                <span>Colecciones: {filteredTributes.length} ángeles</span>
              </div>
            </div>

            {/* 4.2 CARTA DESTACADA EN HOJA DE PAPEL MARFIL */}
            {firstFeaturedTribute ? (
              <article className={`libro-hoja libro-destacada ${!firstFeaturedTribute.photoUrl ? 'sin-foto' : ''}`}>
                {firstFeaturedTribute.photoUrl ? (
                  <figure className="libro-foto">
                    <img 
                      src={firstFeaturedTribute.photoUrl} 
                      alt={`Fotografía conmemorativa de ${firstFeaturedTribute.petName}`} 
                      loading="lazy" 
                    />
                  </figure>
                ) : (
                  /* Medallón celestial digno y proporcionado cuando la mascota carece de fotografía */
                  <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 shadow-[0_6px_24px_rgba(84,45,38,0.14)] bg-gradient-to-br from-[#FFF5EC] via-[#FCEFF6] to-[#EBD5E4] border-2 border-[#D4B79E]">
                      <div className="w-full h-full rounded-full border border-[#D4B79E]/60 flex flex-col items-center justify-center bg-radial from-white via-[#FFF8F2] to-[#FCEEF5] p-2 text-center">
                        <span className="text-2xl sm:text-3xl mb-0.5" aria-hidden="true">
                          {firstFeaturedTribute.species === 'gato' ? '🐱' : firstFeaturedTribute.species === 'perro' ? '🐶' : '🕊️'}
                        </span>
                        <span className="font-playfair font-bold text-[#541731] text-sm sm:text-base leading-tight">
                          {firstFeaturedTribute.petName}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-serif italic text-[#8C3F71] mt-0.5">
                          Ángel eterno
                        </span>
                      </div>
                      <span className="absolute -top-1 -right-1 text-sm select-none" aria-hidden="true">✨</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1CEDF] text-[#541731] font-bold text-xs border border-[#B89CB6]">
                      ✉️ {firstFeaturedTribute.letters.length === 0 ? 'Sin cartas aún' : firstFeaturedTribute.letters.length === 1 ? '1 carta llena de amor' : `${firstFeaturedTribute.letters.length} cartas llenas de amor`}
                    </span>
                    {firstFeaturedTribute.yearsOrDates && (
                      <span className="text-xs sm:text-sm text-[#7A4253] italic font-serif">
                        {firstFeaturedTribute.yearsOrDates} · {firstFeaturedTribute.authorName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-playfair text-[#541731] text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Para {firstFeaturedTribute.petName}
                  </h3>
                  
                  {firstFeaturedTribute.letters.length > 0 ? (
                    <p className="text-[#642944] leading-relaxed text-base sm:text-lg font-serif">
                      {previewLetterText(firstFeaturedTribute.letters[0]?.message || '', 210)}
                    </p>
                  ) : (
                    <p className="text-[#7A4253] leading-relaxed text-sm sm:text-base font-serif italic">
                      Esta colección conmemorativa está abierta con amor. Aún no se han escrito cartas para este angelito; su familia o amigos pueden dedicarle la primera.
                    </p>
                  )}
                  
                  <button 
                    type="button" 
                    className="libro-leer inline-flex items-center gap-2 text-[#541731] font-bold cursor-pointer hover:opacity-80 transition-opacity text-sm sm:text-base"
                    onClick={(e) => {
                      lastActiveTriggerRef.current = e.currentTarget;
                      handleOpenCollection(firstFeaturedTribute);
                    }}
                  >
                    <span>
                      {firstFeaturedTribute.letters.length === 0 
                        ? `Esperando su primera carta para ${firstFeaturedTribute.petName}` 
                        : `Descubrir las cartas para ${firstFeaturedTribute.petName} (${firstFeaturedTribute.letters.length} ${firstFeaturedTribute.letters.length === 1 ? 'carta llena de amor' : 'cartas llenas de amor'})`}
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ) : (
              <div className="libro-hoja text-center py-12 text-[#834E54]">
                Aún no hay cartas en el Libro para este filtro. ¡Sé el primero en escribir una!
              </div>
            )}

            {/* 4.3 «MÁS CARTAS»: SOBRES CON PESTAÑA ASOMADA Y CONTADOR DE COLECCIÓN */}
            {paginatedOtherTributes.length > 0 && (
              <div className="mt-14 sm:mt-16 space-y-8">
                <div className="text-center">
                  <h3 className="libro-mas font-playfair text-[#541731] text-2xl sm:text-3xl font-bold">
                    Más cartas
                  </h3>
                  <div className="w-20 h-0.5 bg-[#a87541]/40 mx-auto mt-2" />
                </div>

                <ul className="libro-indice">
                  {paginatedOtherTributes.map((tribute, idx) => {
                    const globalIdx = (safeLibroPage - 1) * envelopesPerPage + idx;
                    const envelopeAsset = 
                      globalIdx % 3 === 0 ? '/images/cartas-al-cielo/libro/assets/sobre-crema.webp' :
                      globalIdx % 3 === 1 ? '/images/cartas-al-cielo/libro/assets/sobre-lavanda.webp' :
                      '/images/cartas-al-cielo/libro/assets/sobre-rosa.webp';

                    const latestLetter = tribute.letters[0];
                    const hasLetters = tribute.letters.length > 0;

                    return (
                      <li key={tribute.id} className="w-full">
                        <button
                          type="button"
                          className="libro-sobre group focus:outline-none w-full"
                          aria-label={`Abrir la colección de cartas para ${tribute.petName}`}
                          onClick={(e) => {
                            lastActiveTriggerRef.current = e.currentTarget;
                            handleOpenCollection(tribute);
                          }}
                        >
                          {/* Papel marfil que sobresale: Motivo, Fecha, Título corto y fragmento con contraste WCAG AA/AAA */}
                          <span className="libro-pestaña">
                            {hasLetters ? (
                              <>
                                <span className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-xs font-bold text-[#5E1A37] tracking-wide inline-flex items-center gap-1 truncate max-w-[65%]">
                                    <span>{latestLetter?.categoryLabel || 'Carta conmemorativa'}</span>
                                  </span>
                                  <span className="text-[11px] text-[#4E2331] font-serif italic shrink-0">
                                    {latestLetter?.displayDate}
                                  </span>
                                </span>
                                {latestLetter?.title ? (
                                  <span className="block font-playfair font-semibold text-xs sm:text-sm text-[#541731] line-clamp-1 mb-0.5">
                                    «{latestLetter.title}»
                                  </span>
                                ) : null}
                                <span className="block font-serif text-[12px] sm:text-[13px] leading-relaxed line-clamp-2 text-[#3B1826]">
                                  {previewLetterText(latestLetter?.message || '', 85)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="block text-xs font-bold text-[#5E1A37] mb-1">
                                  Esperando su primera carta
                                </span>
                                <span className="block font-serif text-[12px] sm:text-[13px] leading-relaxed line-clamp-2 text-[#4E2331] italic">
                                  Esta colección aún no tiene cartas publicadas por su familia.
                                </span>
                              </>
                            )}
                          </span>

                          {/* Frontal del sobre: Protagonista «Para [Nombre]» con placa marfil localizada de alto contraste */}
                          <span 
                            className="libro-frente"
                            style={{
                              backgroundImage: `url('${envelopeAsset}')`,
                            }}
                          >
                            <span className="relative z-10 flex flex-col items-center justify-end text-center w-full max-w-[92%] gap-1.5">
                              {/* Para [Nombre] en burdeos profundo #541731 sobre placa marfil compacta y proporcional */}
                              <span
                                className={`libro-nombre-placa font-playfair font-bold text-[#541731] text-center ${
                                  tribute.petName.length > 14
                                    ? 'libro-nombre-placa--larga text-[12.5px] sm:text-[13.5px] lg:text-[15px] leading-[1.18]'
                                    : 'text-[13.5px] sm:text-[15.5px] lg:text-[17px] leading-[1.2]'
                                }`}
                              >
                                Para {tribute.petName}
                              </span>

                              {/* Botón de acción: Nivel 1 (Índice General) */}
                              {hasLetters ? (
                                <span className="libro-cta-primaria inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-xs transition-colors min-h-[44px] min-w-[44px]">
                                  <span>Descubrir sus cartas</span>
                                  <span aria-hidden="true">→</span>
                                </span>
                              ) : reviewerRole === 'guardian' ? (
                                <span className="libro-cta-primaria inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-xs transition-colors min-h-[44px] min-w-[44px]">
                                  <span>Escribir su primera carta</span>
                                  <span aria-hidden="true">✍️</span>
                                </span>
                              ) : (
                                <span className="libro-cta-espera inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold shadow-xs min-h-[44px] min-w-[44px]">
                                  <span>Esperando su primera carta</span>
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Paginación funcional del Libro */}
                {totalLibroPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-6 relative z-10">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safeLibroPage <= 1}
                      className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs font-bold text-[#834E54] px-2 select-none">
                      Página {safeLibroPage} de {totalLibroPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalLibroPages, p + 1))}
                      disabled={safeLibroPage >= totalLibroPages}
                      className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* ========================================================================= */
          /* NIVEL 2: COLECCIÓN INDIVIDUAL «LAS CARTAS DE SU VIDA»                     */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in relative z-10 max-w-5xl mx-auto px-2">
            
            {/* Barra superior de navegación interna de la colección */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-[#D4B79E] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setActiveTributeForCollection(null);
                  setShowNewLetterForm(false);
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#541731] hover:text-[#8C3F71] transition-colors cursor-pointer"
              >
                <span className="text-base">←</span>
                <span>Volver al Libro de los Ángeles (Todas las mascotas)</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A4253] font-semibold hidden sm:inline">Modo actual:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  reviewerRole === 'guardian'
                    ? 'bg-[#E1CEDF] text-[#541731] border-[#B89CB6]'
                    : 'bg-[#FFF0DD] text-[#7A4253] border-[#D4B79E]'
                }`}>
                  {reviewerRole === 'guardian' ? '🛡️ Familia Autorizada (Guardián)' : '👀 Visitante Público'}
                </span>
              </div>
            </div>

            {/* Tarjeta de Identidad y Cabecera de la Colección */}
            <article className={`libro-hoja libro-destacada ${!activeTributeForCollection.photoUrl ? 'sin-foto' : ''} md:!grid-cols-[280px_1fr]`}>
              {/* 4. Fotografía o medallón celestial */}
              {activeTributeForCollection.photoUrl ? (
                <figure className="libro-foto max-w-[180px] max-h-[180px] md:max-w-[280px] md:max-h-[300px] w-full mx-auto md:mx-0 overflow-hidden rounded-xl shadow-md border-2 border-white/80">
                  <img 
                    src={activeTributeForCollection.photoUrl} 
                    alt={`Fotografía conmemorativa de ${activeTributeForCollection.petName}`} 
                    loading="lazy" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </figure>
              ) : (
                /* Medallón celestial digno y proporcionado cuando la mascota carece de fotografía */
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-[260px] mx-auto md:mx-0 w-full">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-2 shadow-[0_8px_30px_rgba(84,45,38,0.16)] bg-gradient-to-br from-[#FFF5EC] via-[#FCEFF6] to-[#EBD5E4] border-2 border-[#D4B79E]">
                    <div className="w-full h-full rounded-full border border-[#D4B79E]/60 flex flex-col items-center justify-center bg-radial from-white via-[#FFF8F2] to-[#FCEEF5] p-3 text-center">
                      <span className="text-3xl sm:text-4xl mb-1" aria-hidden="true">
                        {activeTributeForCollection.species === 'gato' ? '🐱' : activeTributeForCollection.species === 'perro' ? '🐶' : '🕊️'}
                      </span>
                      <span className="font-playfair font-bold text-[#541731] text-base sm:text-lg leading-tight">
                        {activeTributeForCollection.petName}
                      </span>
                      <span className="text-[11px] font-serif italic text-[#8C3F71] mt-1">
                        Ángel en el cielo
                      </span>
                    </div>
                    <span className="absolute -top-1 -right-1 text-base select-none" aria-hidden="true">✨</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  {/* 1. Título de la colección */}
                  <span className="block font-serif text-xs sm:text-sm font-bold tracking-wider text-[#8C3F71] uppercase mb-1">
                    Las cartas para mi angelito
                  </span>

                  {/* 2. Nombre destacado debajo */}
                  <h3 className="font-playfair text-[#541731] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {activeTributeForCollection.petName}
                  </h3>

                  {/* 3. Subtítulo dinámico */}
                  <p className="font-playfair italic text-base sm:text-xl text-[#8C3F71] mt-1 font-medium">
                    {activeTributeForCollection.letters.length === 0
                      ? 'Esperando su primera carta'
                      : activeTributeForCollection.letters.length === 1 
                        ? '1 carta llena de amor' 
                        : `${activeTributeForCollection.letters.length} cartas llenas de amor`}
                  </p>

                  {/* 5. Familia y fechas */}
                  <p className="text-xs sm:text-sm font-sans text-[#7A4253] mt-2">
                    {[
                      `Dedicado por ${activeTributeForCollection.authorName}`,
                      activeTributeForCollection.yearsOrDates,
                      activeTributeForCollection.speciesLabel || (activeTributeForCollection.species === 'gato' ? 'Gatita' : activeTributeForCollection.species === 'perro' ? 'Perrita / Perro' : 'Compañero')
                    ].filter(Boolean).join(' · ')}
                  </p>

                  {/* Contadores secundarios con protagonismo visual reducido */}
                  <div className="flex items-center gap-3 text-[11.5px] font-sans text-[#7A4253]/70 pt-1.5 flex-wrap">
                    <span>🕯️ {activeTributeForCollection.candlesCount} velas encendidas</span>
                    <span>·</span>
                    <span>🐾 {activeTributeForCollection.hugsCount} abrazos de consuelo</span>
                  </div>
                </div>

                {/* Escenario B: Distintivo de Vinculación al Mural Global */}
                {activeTributeForCollection.muralSlot?.assigned && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF5EA] to-[#FCE7F3] border border-[#E8D4BB] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <div className="text-xs text-[#541731]">
                        <span className="font-bold">Brilla en el Mural Global</span>
                        <span className="block text-[#7A4253] text-[11px]">{activeTributeForCollection.muralSlot.slotLabel}</span>
                      </div>
                    </div>
                    <Link
                      href="/mural-global"
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-[#541731] bg-white border border-[#D4B79E] hover:bg-[#FFF8F4] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <span>Ver estrella</span>
                      <span>↗</span>
                    </Link>
                  </div>
                )}

                {/* Acceso directo a las cartas en móvil */}
                {activeTributeForCollection.letters.length > 0 && (
                  <div className="md:hidden pt-2">
                    <a
                      href="#cartas-coleccion-lista"
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById('cartas-coleccion-lista');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#541731] bg-[#FFF9F2] hover:bg-[#FFF2E5] border border-[#D4B79E] shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>↓</span>
                      <span>Ver las cartas ({activeTributeForCollection.letters.length})</span>
                    </a>
                  </div>
                )}

                {/* Acciones según Rol (Guardián vs Visitante) */}
                <div className="pt-2 border-t border-[#D4B79E]/60">
                  {reviewerRole === 'guardian' ? (
                    <div className="space-y-3">
                      <p className="text-xs text-[#7A4253] leading-relaxed">
                        Estás identificado como <strong>familia guardiana</strong> de {activeTributeForCollection.petName}. Puedes escribirle nuevas cartas en cualquier momento: aniversarios, cumpleaños o pensamientos íntimos.
                      </p>
                      <button
                        id="btn-write-another-letter"
                        type="button"
                        onClick={() => setShowNewLetterForm(prev => !prev)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all cursor-pointer border border-white/20 active:scale-[0.98] min-h-[44px]"
                        style={{
                          background: 'linear-gradient(135deg, #722B55 0%, #8C3F71 50%, #541731 100%)',
                        }}
                      >
                        <span aria-hidden="true">✍️</span>
                        <span>{showNewLetterForm ? 'Ocultar formulario' : (activeTributeForCollection.letters.length === 0 ? `Escribir su primera carta a ${activeTributeForCollection.petName}` : `Escribirle otra carta a ${activeTributeForCollection.petName}`)}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[#7A4253] leading-relaxed">
                        Estás visitando la colección pública en homenaje a {activeTributeForCollection.petName}. Puedes leer sus recuerdos y dejarle una muestra de cariño a su familia.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReactionTribute(activeTributeForCollection.id, 'candle')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#541731] bg-[#FFF0DD] hover:bg-[#FFE6CC] border border-[#D4B79E] transition-all cursor-pointer shadow-xs min-h-[44px]"
                        >
                          <span>🕯️ Encender una vela en su honor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReactionTribute(activeTributeForCollection.id, 'hug')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#541731] bg-[#FFF0DD] hover:bg-[#FFE6CC] border border-[#D4B79E] transition-all cursor-pointer shadow-xs min-h-[44px]"
                        >
                          <span>🐾 Dejar un abrazo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* Formulario contextual para escribirle otra carta (Solo Guardián cuando showNewLetterForm === true) */}
            {showNewLetterForm && reviewerRole === 'guardian' && (
              <div className="libro-hoja p-6 sm:p-8 rounded-2xl border-2 border-[#A44F99]/40 bg-[#FFFBF8] shadow-lg animate-fade-in">
                <div className="text-center max-w-md mx-auto mb-6">
                  <h4 className="font-playfair text-2xl font-bold text-[#541731]">
                    Escribirle otra carta a {activeTributeForCollection.petName}
                  </h4>
                  <p className="text-xs text-[#7A4253] mt-1">
                    Esta carta se sumará de forma permanente y gratuita a la colección de {activeTributeForCollection.petName}.
                  </p>
                </div>

                <form onSubmit={handleAddNewLetterToCollection} className="space-y-4 max-w-2xl mx-auto">
                  {/* Motivo u Ocasión de la carta */}
                  <div>
                    <label className="block text-xs font-bold text-[#541731] mb-2">
                      Motivo de esta carta:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'cumpleanos', label: '🎂 Cumpleaños en el cielo' },
                        { id: 'aniversario', label: '🕊️ Aniversario de partida' },
                        { id: 'espontanea', label: '🌿 Recuerdo espontáneo' },
                        { id: 'despedida', label: '💌 Carta de amor' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewLetterCategory(cat.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            newLetterCategory === cat.id
                              ? 'bg-[#A44F99] text-white border-[#A44F99] shadow-sm font-bold'
                              : 'bg-white text-[#541731] border-[#D4B79E] hover:bg-[#FFF8F4]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Título opcional */}
                  <div>
                    <label className="block text-xs font-bold text-[#541731] mb-1">
                      Título o dedicatoria corta (opcional):
                    </label>
                    <input
                      type="text"
                      value={newLetterTitle}
                      onChange={e => setNewLetterTitle(e.target.value)}
                      placeholder="Ej. Pensando en ti hoy, Tu rincón bajo el sol, Dos primaveras..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D4B79E] bg-white text-xs text-[#541731] outline-none focus:border-[#722B55]"
                    />
                  </div>

                  {/* Fecha de la carta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#541731] mb-1">
                        Fecha de esta carta:
                      </label>
                      <input
                        type="text"
                        value={newLetterDate}
                        onChange={e => setNewLetterDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D4B79E] bg-white text-xs text-[#541731] outline-none focus:border-[#722B55]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#541731] mb-1">
                        Firma o autor:
                      </label>
                      <input
                        type="text"
                        value={newLetterAuthor}
                        onChange={e => setNewLetterAuthor(e.target.value)}
                        placeholder={activeTributeForCollection.authorName}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D4B79E] bg-white text-xs text-[#541731] outline-none focus:border-[#722B55]"
                      />
                    </div>
                  </div>

                  {/* Mensaje de la carta */}
                  <div>
                    <label className="block text-xs font-bold text-[#541731] mb-1">
                      Mensaje de la carta <span className="text-[#A44F99]">*</span>:
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={newLetterMessage}
                      onChange={e => setNewLetterMessage(e.target.value)}
                      placeholder={`Escribe aquí lo que quieras decirle a ${activeTributeForCollection.petName}...`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4B79E] bg-white text-xs sm:text-sm text-[#541731] font-serif leading-relaxed outline-none focus:border-[#722B55]"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewLetterForm(false)}
                      className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full font-bold text-xs text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #A44F99 0%, #C35694 100%)',
                      }}
                    >
                      Publicar en su colección
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Secuencia Cronológica de Sobres Individuales de esta Mascota */}
            <div id="cartas-coleccion-lista" className="space-y-6 pt-4 scroll-mt-28">
              <div className="text-center">
                <h4 className="font-playfair text-[#541731] text-2xl sm:text-3xl font-bold">
                  Todas las cartas dedicadas a {activeTributeForCollection.petName} ({activeTributeForCollection.letters.length})
                </h4>
                <p className="text-xs sm:text-sm text-[#7A4253] italic font-serif mt-1">
                  Pulsa sobre cualquier sobre para desplegar la carta completa en papel marfil.
                </p>
                <div className="w-20 h-0.5 bg-[#a87541]/40 mx-auto mt-2" />
              </div>

              {activeTributeForCollection.letters.length === 0 ? (
                <div className="libro-hoja text-center py-10 px-6 max-w-xl mx-auto space-y-3 bg-[#FFFBF8] border border-[#D4B79E] rounded-2xl shadow-xs">
                  <span className="text-3xl">💌</span>
                  <h5 className="font-playfair text-xl font-bold text-[#541731]">
                    Esperando su primera carta
                  </h5>
                  <p className="text-xs sm:text-sm text-[#7A4253] leading-relaxed max-w-md mx-auto">
                    {reviewerRole === 'guardian'
                      ? `Aún no has escrito la primera carta para ${activeTributeForCollection.petName}. Puedes redactarla ahora mismo para honrar su memoria.`
                      : `La familia de ${activeTributeForCollection.petName} aún no ha publicado ninguna carta en esta colección. Puedes encender una vela en su honor para acompañarles en su recuerdo.`}
                  </p>
                  {reviewerRole === 'guardian' && !showNewLetterForm && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewLetterForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#541731] hover:bg-[#722B55] text-white text-xs font-bold shadow-sm transition-all cursor-pointer min-h-[44px]"
                      >
                        <span aria-hidden="true">✍️</span>
                        <span>Escribir su primera carta</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <ul className="libro-indice">
                  {activeTributeForCollection.letters.map((letter, idx) => {
                    const envelopeAsset = 
                      letter.envelopeColor === 'crema' ? '/images/cartas-al-cielo/libro/assets/sobre-crema.webp' :
                      letter.envelopeColor === 'lavanda' ? '/images/cartas-al-cielo/libro/assets/sobre-lavanda.webp' :
                      '/images/cartas-al-cielo/libro/assets/sobre-rosa.webp';

                    const letterNumber = activeTributeForCollection.letters.length - idx;

                    return (
                      <li key={letter.id} className="w-full">
                        <button
                          type="button"
                          className="libro-sobre group focus:outline-none w-full"
                          aria-label={`Abrir carta: ${letter.title} para ${activeTributeForCollection.petName}`}
                          onClick={(e) => {
                            lastActiveTriggerRef.current = e.currentTarget;
                            setActiveLetterForReader({ letter, tribute: activeTributeForCollection });
                          }}
                        >
                          {/* Papel marfil que sobresale: Motivo, Fecha, Título corto y fragmento con contraste WCAG AA/AAA */}
                          <span className="libro-pestaña">
                            <span className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#5E1A37] tracking-wide inline-flex items-center gap-1">
                                <span className="text-[#541731] font-bold">#{letterNumber}</span>
                                <span className="text-[#541731]">·</span>
                                <span>{letter.categoryLabel}</span>
                              </span>
                              <span className="text-[11px] text-[#4E2331] font-serif italic">
                                {letter.displayDate}
                              </span>
                            </span>
                            {letter.title && (
                              <span className="block font-playfair font-semibold text-sm sm:text-base text-[#541731] line-clamp-1 mb-0.5">
                                «{letter.title}»
                              </span>
                            )}
                            <span className="block font-serif text-[12px] sm:text-[13px] leading-relaxed line-clamp-2 text-[#3B1826] mt-1">
                              {previewLetterText(letter.message || '', 85)}
                            </span>
                          </span>

                          {/* Frontal del sobre: Protagonista «Para [Nombre]» con placa marfil localizada de alto contraste */}
                          <span 
                            className="libro-frente"
                            style={{
                              backgroundImage: `url('${envelopeAsset}')`,
                            }}
                          >
                            <span className="relative z-10 flex flex-col items-center justify-end text-center w-full max-w-[92%] gap-1.5">
                              {/* Para [Nombre] en burdeos profundo #541731 sobre placa marfil compacta y proporcional */}
                              <span
                                className={`libro-nombre-placa font-playfair font-bold text-[#541731] text-center ${
                                  activeTributeForCollection.petName.length > 14
                                    ? 'libro-nombre-placa--larga text-[12.5px] sm:text-[13.5px] lg:text-[15px] leading-[1.18]'
                                    : 'text-[13.5px] sm:text-[15.5px] lg:text-[17px] leading-[1.2]'
                                }`}
                              >
                                Para {activeTributeForCollection.petName}
                              </span>

                              {/* Botón de apertura en la parte inferior */}
                              <span className="libro-cta-primaria inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-xs transition-colors min-h-[44px] min-w-[44px]">
                                <span>Abrir esta carta</span>
                                <span aria-hidden="true">→</span>
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Escenario A: Invitación respetuosa al Mural Global para mascotas sin casilla */}
            {!activeTributeForCollection.muralSlot?.assigned && (
              <div className="libro-hoja mt-12 p-6 sm:p-8 text-center space-y-3 max-w-2xl mx-auto border border-[#E8D4BB] rounded-2xl bg-white/70">
                <div className="text-2xl">✨</div>
                <h4 className="font-playfair text-xl font-bold text-[#541731]">
                  ¿Deseas encender una estrella permanente para {activeTributeForCollection.petName} en el cielo?
                </h4>
                <p className="text-xs sm:text-sm text-[#7A4253] leading-relaxed max-w-lg mx-auto">
                  En el <strong>Mural Global de Ángeles en el Cielo</strong> puedes dedicarle una casilla eterna con certificado conmemorativo oficial, visible para siempre junto a cientos de ángeles iluminados.
                </p>
                <Link 
                  href="/mural-global"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #A44F99 0%, #C35694 50%, #E07A70 100%)',
                  }}
                >
                  <span>Conocer el Mural Global</span>
                  <span>→</span>
                </Link>
              </div>
            )}

            {/* Botón inferior de retorno al Libro */}
            <div className="text-center pt-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTributeForCollection(null);
                  setShowNewLetterForm(false);
                  setTimeout(() => {
                    document.getElementById('libro-de-los-angeles')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/90 border border-[#D4B79E] text-xs sm:text-sm font-bold text-[#541731] hover:bg-white transition-all cursor-pointer shadow-sm"
              >
                <span>←</span>
                <span>Volver al Libro de los Ángeles (Todas las mascotas)</span>
              </button>
            </div>

          </div>
        ))}

      </section>

      {/* ========================================================================= */}
      {/* 5. FORMULARIO: ESCRIBIR UNA CARTA AL CIELO                                */}
      {/* Integrado con la atmósfera cálida de marfil, accesible desde Hero y Mural */}
      {/* ========================================================================= */}
      <section 
        id="formulario-recuerdo" 
        className="bg-[#F7E9DC] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E8D4BB] relative z-10 scroll-mt-20"
      >
        <div className="max-w-xl mx-auto">
          
          <div className="libro-hoja relative overflow-visible text-[#2D0F31]">
            
            {/* Medallón superior con sobre alado */}
            <div 
              className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#FFF4E7] border-[3px] border-[#D4B79E] shadow-[0_8px_20px_rgba(84,45,38,0.22)] flex items-center justify-center z-20 p-2"
            >
              <span className="text-2xl select-none" role="img" aria-label="Carta">✉️</span>
            </div>

            <div className="text-center pt-3 mb-6 relative z-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#541731] mb-1.5 tracking-tight">
                Escribe tu carta al cielo
              </h2>
              <p className="text-xs sm:text-sm text-[#834E54] leading-relaxed max-w-md mx-auto">
                Dedica unas palabras de amor a tu angelito para que formen parte de El Libro de los Ángeles.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              {/* Campo 1: Nombre de la mascota */}
              <div>
                <label htmlFor="formPetName" className="block text-xs font-bold text-[#541731] mb-1.5">
                  Nombre de tu ángel <span className="text-[#A44F99]" title="Campo obligatorio">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C69062">
                      <ellipse cx="12" cy="16.5" rx="5" ry="4"/>
                      <circle cx="6" cy="10" r="2.2"/>
                      <circle cx="10" cy="6.8" r="2.2"/>
                      <circle cx="14" cy="6.8" r="2.2"/>
                      <circle cx="18" cy="10" r="2.2"/>
                    </svg>
                  </span>
                  <input
                    id="formPetName"
                    type="text"
                    required
                    aria-required="true"
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    placeholder="Ej. Toby, Luna, Chloe, Max..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#D4B79E] focus:border-[#722B55] focus:ring-[3px] focus:ring-[rgba(114,43,85,0.15)] focus:bg-white outline-none text-[13.5px] text-[#541731] placeholder-[#A07090] placeholder:italic transition-all bg-[#FFFBF8]"
                  />
                </div>
              </div>

              {/* Campo 2: Carta o recuerdo */}
              <div>
                <label htmlFor="formMessage" className="block text-xs font-bold text-[#541731] mb-1.5">
                  Tu carta o recuerdo <span className="text-[#A44F99]" title="Campo obligatorio">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 pointer-events-none flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9E457C">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </span>
                  <textarea
                    id="formMessage"
                    required
                    aria-required="true"
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Escribe lo que sientes en tu corazón..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#D4B79E] focus:border-[#722B55] focus:ring-[3px] focus:ring-[rgba(114,43,85,0.15)] focus:bg-white outline-none text-[13.5px] text-[#541731] placeholder-[#A07090] placeholder:italic transition-all resize-none bg-[#FFFBF8] h-28 leading-relaxed"
                  />
                </div>
                <p className="text-[11.5px] text-[#834E54] italic mt-1 leading-snug">
                  Puedes contar cómo era, recordar un momento juntos o hablarle directamente con tus palabras.
                </p>
              </div>

              {/* Sección colapsable: Fotografía y detalles opcionales */}
              <div className="border border-[#D4B79E]/70 rounded-2xl bg-[#FFFBF8] p-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#541731] hover:text-[#722B55] transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Añadir detalles (fotografía y redes)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#834E54]">
                    {showOptionalDetails ? 'Ocultar ▲' : 'Desplegar ▼'}
                  </span>
                </button>

                {showOptionalDetails && (
                  <div className="space-y-3 pt-2 border-t border-[#D4B79E]/50">
                    
                    {/* Añadir foto */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#541731] mb-1">
                        Fotografía de tu ángel (opcional)
                      </label>
                      {photoPreview ? (
                        <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[#D4B79E] bg-white h-[44px]">
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative shadow-xs border border-white shrink-0">
                            <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                          </div>
                          <span className="text-[11px] font-bold text-[#541731] truncate flex-1">Foto seleccionada</span>
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="text-xs text-red-500 font-bold px-2 hover:underline cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2.5 w-full h-[44px] px-3 rounded-2xl border-[1.5px] border-dashed border-[#D4B79E] hover:border-[#722B55] bg-white hover:bg-[#FFF4E7] transition-all cursor-pointer group select-none">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#722B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="#722B55"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span className="text-[12.5px] font-bold text-[#541731]">Subir una fotografía</span>
                          <span className="text-[11px] font-medium text-[#834E54] italic">(opcional)</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Redes sociales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="formInstagram" className="block text-[11px] font-bold text-[#541731] mb-1">
                          Instagram (opcional)
                        </label>
                        <input
                          id="formInstagram"
                          type="text"
                          value={instagram}
                          onChange={e => setInstagram(e.target.value)}
                          placeholder="@usuario"
                          className="w-full px-3 py-1.5 rounded-xl border border-[#D4B79E] focus:border-[#722B55] outline-none text-xs text-[#541731] placeholder-[#A07090] bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="formTiktok" className="block text-[11px] font-bold text-[#541731] mb-1">
                          TikTok (opcional)
                        </label>
                        <input
                          id="formTiktok"
                          type="text"
                          value={tiktok}
                          onChange={e => setTiktok(e.target.value)}
                          placeholder="@usuario"
                          className="w-full px-3 py-1.5 rounded-xl border border-[#D4B79E] focus:border-[#722B55] outline-none text-xs text-[#541731] placeholder-[#A07090] bg-white"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Aviso de privacidad legal */}
              <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#E8D4BB] text-left space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#541731]">
                  <span>🕊️</span>
                  <span>Publicación comunitaria en Cartas al Cielo</span>
                </div>
                <p className="text-[11.5px] text-[#6B4E63] leading-relaxed">
                  El nombre, fotografía y dedicatoria se publican en el Libro de los Ángeles para que otras familias puedan acompañarte. Tu correo electrónico nunca se muestra públicamente.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8C5D7E] pt-1.5 border-t border-[#E8D4BB]/60">
                  <span>🔒</span>
                  <span>Tratamiento confidencial conforme a nuestra <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[#541731] hover:text-[#722B55]">política de privacidad</a>.</span>
                </div>
              </div>

              {submitError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700" role="alert">
                  {submitError}
                </div>
              )}

              {/* Botón «Publicar mi carta» */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-7 rounded-full font-bold text-white text-sm transition-all duration-300 shadow-[0_10px_24px_rgba(84,45,38,0.25)] hover:shadow-[0_14px_28px_rgba(84,45,38,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.12) 100%), linear-gradient(90deg, #722B55 0%, #8C3F71 50%, #A44F99 100%)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publicando tu carta...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ transform: 'rotate(-38deg)', marginTop: '-1px' }}>
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span>Publicar mi carta</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FRANJA PORTAL DE LUZ (CONEXIÓN ELEGANTE A CIELO LLENO DE LUCES)           */}
      {/* ========================================================================= */}
      <section id="vela-semanal" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 scroll-mt-24">
        <div 
          className="rounded-[24px] px-5 sm:px-8 py-5 border border-[#F3DBEA] shadow-[0_8px_24px_rgba(140,60,110,0.06)] flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden bg-white/95"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-[#FFF5F8] flex items-center justify-center text-2xl relative">
              🕯️
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F59E0B] animate-ping" />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-0.5">
                <span className="text-[10.5px] font-bold text-[#A06020] uppercase tracking-wider">
                  Ritual Comunitario Semanal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10.5px] font-bold" title="Comunidad de Cartas al Cielo">
                  {weeklyCandlesCount} luces en comunidad
                </span>
              </div>
              <h3 className="font-playfair text-base sm:text-lg font-bold text-[#2D0F31] leading-tight">
                Un manto de luz para que ningún angelito quede en soledad
              </h3>
              <p className="text-xs text-[#7A6275] mt-0.5 leading-snug">
                Cada domingo recordamos con amor a todos los compañeros que partieron y nos cuidan desde arriba.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-center">
            <Link
              href="/cielo-lleno-de-luces"
              className="min-h-[44px] w-full md:w-auto px-6 py-2.5 rounded-full font-bold text-white text-xs sm:text-sm shadow-[0_8px_20px_rgba(200,90,140,0.32)] hover:shadow-[0_12px_26px_rgba(200,90,140,0.42)] hover:-translate-y-0.5 transition-all flex items-center justify-center text-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #D9629B 0%, #C35694 50%, #9B3F77 100%)',
              }}
            >
              <span>Entrar en el Cielo de Luces</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BLOQUES INFERIORES: VELA Y PUENTE AL MURAL                                */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Vela Semanal */}
        <div 
          className="rounded-3xl p-6 border border-[#FCE7F3] shadow-[0_16px_40px_rgba(140,60,110,0.08)] flex flex-col justify-between relative overflow-hidden h-full"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(255, 245, 248, 0.88) 0%, rgba(248, 236, 248, 0.88) 50%, rgba(254, 242, 238, 0.88) 100%), url('/images/solidario/bg-corazones-pc.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-start gap-4 relative z-10 flex-1">
            <div className="w-[84px] h-[84px] min-h-[84px] rounded-2xl overflow-hidden relative shadow-md border-2 border-white shrink-0">
              <Image src="/images/comunidad/candle-banner.webp" alt="Vela encendida" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-[#2D0F31] text-lg font-bold flex items-center gap-2 mb-1.5">
                <span className="text-base">🕯️</span>
                <span>Un cielo lleno de luces</span>
              </h3>
              <p className="text-[12.5px] text-[#54465B] leading-relaxed">
                Cada semana encendemos una vela por todos nuestros ángeles. Únete al próximo encuentro y deja su nombre.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-auto flex justify-start relative z-10">
            <Link
              href="/cielo-lleno-de-luces"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-[0_8px_22px_rgba(160,70,135,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(160,70,135,0.45)] transition-all text-center cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #D4629B 0%, #C25796 45%, #9E458C 100%)',
              }}
            >
              <span>Entrar en el Cielo de Luces</span>
            </Link>
          </div>
        </div>

        {/* Puente al Mural */}
        <div 
          className="rounded-3xl p-6 border border-[#F3E8FF] shadow-[0_16px_40px_rgba(140,60,110,0.08)] flex flex-col justify-between relative overflow-hidden h-full"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(255, 245, 248, 0.88) 0%, rgba(248, 236, 248, 0.88) 50%, rgba(254, 242, 238, 0.88) 100%), url('/images/solidario/bg-corazones-pc.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-start justify-between gap-4 relative z-10 flex-1">
            <div className="flex-1">
              <h3 className="font-playfair text-[#2D0F31] text-lg font-bold flex items-center gap-2 mb-1.5">
                <Image 
                  src="/images/icons/plans/icon-plan-estrella.svg" 
                  alt="Estrella" 
                  width={54} 
                  height={54} 
                  className="object-contain drop-shadow-[0_2px_6px_rgba(217,130,24,0.35)] shrink-0" 
                />
                <span>¿Quieres que su recuerdo brille para siempre?</span>
              </h3>
              <p className="text-[12.5px] text-[#54465B] leading-relaxed">
                Convierte su historia en un homenaje permanente en el Mural de un Millón de Ángeles.
              </p>
            </div>

            <div className="w-[84px] h-[84px] min-h-[84px] rounded-2xl overflow-hidden relative shadow-md border-2 border-white shrink-0 rotate-3">
              <Image src="/images/comunidad/bridge-frame.webp" alt="Marco dorado" fill className="object-cover" />
            </div>
          </div>
          <div className="pt-4 mt-auto flex justify-start relative z-10">
            <Link
              href="/#planes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-[0_8px_22px_rgba(160,70,135,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(160,70,135,0.45)] transition-all"
              style={{
                background: 'linear-gradient(180deg, #D4629B 0%, #C25796 45%, #9E458C 100%)',
              }}
            >
              <span className="text-white text-sm">★</span>
              <span>Conocer los planes</span>
            </Link>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. MODAL LECTOR DE CARTA COMPLETA (HOJA MARFIL LUMINOSA Y OPACA)           */}
      {/* ========================================================================= */}
      {selectedMemoryForRead && (
        <>
          {/* Fondo oscuro translúcido con desenfoque suave */}
          <div 
            className="libro-dialog-backdrop"
            onClick={() => {
              setSelectedMemoryForRead(null);
              setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
            }}
          />

          <dialog 
            open
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-carta-titulo"
            className="libro-dialog"
            style={{
              backgroundColor: '#fff4e7',
              backgroundImage: "url('/images/cartas-al-cielo/libro/assets/papel.svg')",
              color: '#541731',
            }}
          >
            {/* Barra superior con botón volver al libro accesible y botón cerrar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D4B79E]/60 mb-5">
              <button
                ref={modalCloseButtonRef}
                type="button"
                className="libro-cerrar text-[#8C3F71] hover:text-[#541731] font-bold text-sm sm:text-base inline-flex items-center gap-2 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedMemoryForRead(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
              >
                <span>←</span>
                <span>Volver al Libro</span>
              </button>

              <button
                type="button"
                className="min-w-[38px] min-h-[38px] rounded-full bg-[#FAF0E6] hover:bg-[#F2DEC9] text-[#541731] flex items-center justify-center font-bold text-base cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#8C3F71]"
                onClick={() => {
                  setSelectedMemoryForRead(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
                aria-label="Cerrar carta y volver al libro"
              >
                ✕
              </button>
            </div>

            {/* Cabecera de la carta: Para [nombre] y fechas/familia */}
            <div className="space-y-1 text-center sm:text-left">
              <h3 id="dialog-carta-titulo" className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#541731]">
                Para {selectedMemoryForRead.petName}
              </h3>

              {(selectedMemoryForRead.yearsOrDates || selectedMemoryForRead.authorName) && (
                <p className="text-sm font-sans text-[#7A4253] italic">
                  {[selectedMemoryForRead.yearsOrDates, selectedMemoryForRead.authorName].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Fotografía original con esquinas ornamentales */}
            {selectedMemoryForRead.photoUrl && (
              <figure className="libro-foto max-w-[380px] mx-auto my-5">
                <img 
                  src={selectedMemoryForRead.photoUrl} 
                  alt={`Fotografía de ${selectedMemoryForRead.petName}`} 
                  loading="lazy"
                  className="w-full max-h-[360px] object-cover rounded"
                />
              </figure>
            )}

            {/* Contenido completo de la carta con párrafos originales preservados */}
            <div className="font-serif text-[16px] sm:text-[18px] leading-[1.7] text-[#541731] my-5 space-y-4">
              <p className="whitespace-pre-wrap">{selectedMemoryForRead.message}</p>
            </div>

            {/* Botones de amor, huellita y acciones */}
            <div className="mt-6 pt-4 border-t border-[#D4B79E]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'heart')}
                  aria-label={`Enviar amor a ${selectedMemoryForRead.petName}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    userReactions[selectedMemoryForRead.id]?.heart
                      ? 'bg-[#E1CEDF] text-[#541731] border-[#B89CB6]'
                      : 'bg-[#FFF0DD] text-[#541731] border-[#D4B79E]/60 hover:bg-[#FFE8CC]'
                  }`}
                >
                  <span>💖</span>
                  <span>{selectedMemoryForRead.candlesCount || 1}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'paw')}
                  aria-label={`Enviar huellita a ${selectedMemoryForRead.petName}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    userReactions[selectedMemoryForRead.id]?.paw
                      ? 'bg-[#EDCBC7] text-[#541731] border-[#C89B95]'
                      : 'bg-[#FFF0DD] text-[#541731] border-[#D4B79E]/60 hover:bg-[#FFE8CC]'
                  }`}
                >
                  <span>🐾</span>
                  <span>{selectedMemoryForRead.supportCount || 0}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMemoryForRead(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
                className="text-xs sm:text-sm font-semibold text-[#8C3F71] hover:underline cursor-pointer"
              >
                Volver al Libro de los Ángeles
              </button>
            </div>
          </dialog>
        </>
      )}

      {/* MODAL 3: SUMAR MI LUZ EN LA VELA SEMANAL (DOMINGOS DE LUZ) */}
      {showWeeklyCandleModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-candle-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-left space-y-4 relative text-[#2D0F31]">
            <button
              onClick={() => setShowWeeklyCandleModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 flex items-center justify-center font-bold text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C3F71]"
              aria-label="Cerrar modal de vela semanal"
            >
              ✕
            </button>

            {!candleCelebration ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF5F8] border border-[#F5C2DA] flex items-center justify-center text-2xl shadow-sm">
                    🕯️
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-[#2D0F31] leading-tight">
                      Sumar mi luz por mi angelito
                    </h3>
                    <p className="text-xs text-[#7A6478]">
                      Domingos de Luz · Ritual comunitario gratuito
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLightCandleSubmit} className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      ¿Cómo se llama tu angelito? *
                    </label>
                    <input
                      type="text"
                      required
                      value={candlePetName}
                      onChange={(e) => setCandlePetName(e.target.value)}
                      placeholder="Ej. Toby, Luna, Max..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D9CBD6] bg-[#FAF1EC] text-sm text-[#2D0F31] outline-none focus:border-[#B85F9F] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D4964] mb-1">
                      Una frase o dedicatoria de luz (opcional)
                    </label>
                    <input
                      type="text"
                      value={candleDedication}
                      onChange={(e) => setCandleDedication(e.target.value)}
                      placeholder="Ej. Siempre iluminarás mi camino..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D9CBD6] bg-[#FAF1EC] text-sm text-[#2D0F31] outline-none focus:border-[#B85F9F] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl font-bold text-white text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #D9629B 0%, #C35694 50%, #9B3F77 100%)',
                    }}
                  >
                    <span>Encender mi vela en el Cielo</span>
                    <span>🕊️</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-3 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF5F8] border-2 border-[#F5C2DA] flex items-center justify-center text-3xl shadow-lg animate-bounce">
                  🕯️
                </div>
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-[#2D0F31]">
                    ¡La luz de {candlePetName} ya brilla!
                  </h3>
                  <p className="text-xs text-[#6A5266] mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Tu velita se ha unido al manto colectivo de los Domingos de Luz. Ahora sois {weeklyCandlesCount} familias iluminando el cielo juntos.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#F5E2CC] text-xs text-[#7A5B45] italic">
                  «{candleDedication || 'Una luz eterna que nunca se apaga en el Cielo'}»
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = 'He encendido una vela por ' + candlePetName + ' en los Domingos de Luz de Todas las mascotas van al cielo 🕊️🕯️';
                      if (navigator.share) {
                        navigator.share({ title: 'Vela Semanal en el Cielo', text: shareText, url: window.location.href });
                      } else {
                        window.open('https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + window.location.href), '_blank');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    }}
                  >
                    <span>Compartir en WhatsApp o Estado</span>
                    <span>↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWeeklyCandleModal(false)}
                    className="w-full py-2.5 px-4 rounded-2xl font-semibold text-[#6C5367] bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Cerrar y volver a Cartas al Cielo
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL LECTOR DE PAPEL MARFIL PARA CARTA DE COLECCIÓN */}
      {activeLetterForReader && (
        <>
          {/* Fondo oscuro translúcido con desenfoque suave */}
          <div 
            className="libro-dialog-backdrop"
            onClick={() => {
              setActiveLetterForReader(null);
              setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
            }}
          />

          <dialog 
            open
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="dialog-carta-coleccion-titulo"
            className="libro-dialog"
            style={{
              backgroundColor: '#fff4e7',
              backgroundImage: "url('/images/cartas-al-cielo/libro/assets/papel.svg')",
              color: '#541731',
            }}
          >
            {/* Botones de navegación superior */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D4B79E]/60 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveLetterForReader(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
                className="libro-cerrar text-xs sm:text-sm font-semibold text-[#8C3F71] hover:text-[#541731] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Volver a la colección de {activeLetterForReader.tribute.petName}</span>
              </button>

              <button
                id="modal-close-letter-btn"
                type="button"
                onClick={() => {
                  setActiveLetterForReader(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
                className="min-w-[38px] min-h-[38px] rounded-full bg-[#FAF0E6] hover:bg-[#F2DEC9] text-[#541731] flex items-center justify-center font-bold text-base cursor-pointer transition-colors border border-[#D4B79E]/60 shadow-xs focus:ring-2 focus:ring-[#8C3F71] focus:outline-none"
                aria-label={`Cerrar carta para ${activeLetterForReader.tribute.petName} y volver a la colección`}
              >
                ✕
              </button>
            </div>

            {/* Cabecera de la carta con motivo y nombre destacado */}
            <div className="space-y-1.5 text-center sm:text-left mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#D4B79E] text-xs font-bold text-[#8C3F71] shadow-2xs">
                {activeLetterForReader.letter.categoryLabel}
              </div>

              <h3 id="dialog-carta-coleccion-titulo" className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#541731]">
                Para {activeLetterForReader.tribute.petName}
              </h3>

              {activeLetterForReader.letter.title && (
                <p className="font-playfair text-base sm:text-lg italic text-[#7A4253]">
                  «{activeLetterForReader.letter.title}»
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#7A4253] font-sans">
                {activeLetterForReader.letter.displayDate} · Escrita por {activeLetterForReader.letter.authorName}
              </p>

              {/* Ornamento celestial discreto */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#D4B79E] text-xs pt-2 pb-1" aria-hidden="true">
                <span>✦</span>
                <span className="w-12 h-px bg-[#D4B79E]/60" />
                <span>🕊️</span>
                <span className="w-12 h-px bg-[#D4B79E]/60" />
                <span>✦</span>
              </div>
            </div>

            {/* Fotografía de la mascota únicamente si existe (sin marco vacío) */}
            {activeLetterForReader.tribute.photoUrl && (
              <figure className="libro-foto max-w-[280px] sm:max-w-[320px] mx-auto my-4">
                <img 
                  src={activeLetterForReader.tribute.photoUrl} 
                  alt={`Fotografía de ${activeLetterForReader.tribute.petName}`}
                  loading="lazy"
                  className="w-full max-h-[300px] object-cover rounded-lg shadow-sm border border-[#D4B79E]/60"
                />
              </figure>
            )}

            {/* Contenido completo de la carta con párrafos originales preservados */}
            <div className="font-serif text-[16px] sm:text-[18px] leading-[1.85] text-[#541731] my-5 space-y-4">
              {activeLetterForReader.letter.message
                .split(/\n\s*\n/)
                .filter((p) => p.trim().length > 0)
                .map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-wrap">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>

            {/* Firma familiar conmemorativa */}
            <div className="mt-6 pt-4 border-t border-[#D4B79E]/40 text-right">
              <p className="font-serif italic text-sm sm:text-base text-[#7A4253]">
                Con todo nuestro amor en la Tierra y en el Cielo,
              </p>
              <p className="font-playfair font-bold text-base sm:text-lg text-[#541731] mt-0.5">
                {activeLetterForReader.letter.authorName}
              </p>
              <p className="text-xs text-[#8C3F71]/80 mt-0.5 font-sans">
                {activeLetterForReader.letter.displayDate}
              </p>
            </div>

            {/* Acciones de velita, abrazo y botón volver */}
            <div className="mt-8 pt-4 border-t border-[#D4B79E]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleReactionTribute(activeLetterForReader.tribute.id, 'candle')}
                  aria-label={`Encender vela por ${activeLetterForReader.tribute.petName}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#D4B79E] bg-[#FFF0DD] text-[#541731] hover:bg-[#FFE8CC] cursor-pointer transition-colors"
                >
                  <span>🕯️</span>
                  <span>{activeLetterForReader.tribute.candlesCount}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleReactionTribute(activeLetterForReader.tribute.id, 'hug')}
                  aria-label={`Mandar abrazo al cielo para ${activeLetterForReader.tribute.petName}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#D4B79E] bg-[#FFF0DD] text-[#541731] hover:bg-[#FFE8CC] cursor-pointer transition-colors"
                >
                  <span>🐾</span>
                  <span>{activeLetterForReader.tribute.hugsCount}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveLetterForReader(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
                className="text-xs sm:text-sm font-semibold text-[#8C3F71] hover:text-[#541731] hover:underline cursor-pointer transition-colors"
              >
                Volver a la colección de {activeLetterForReader.tribute.petName}
              </button>
            </div>
          </dialog>
        </>
      )}

      {/* TOAST DE NOTIFICACIÓN DEL PROTOTIPO */}
      {toastMessage && (
        <div 
          role="status" 
          aria-live="polite" 
          className="fixed bottom-6 right-6 z-[99999] bg-[#2D1236] text-[#FFF8F4] px-5 py-3 rounded-2xl shadow-2xl border border-[#D4B79E] text-xs font-semibold flex items-center gap-2 animate-fade-in"
        >
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL 2: CONFIRMACIÓN Y CELEBRACIÓN TRAS PUBLICAR */}
      {showCelebrationModal && publishedMemory && (
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-celebration-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-center space-y-4 relative text-[#2D0F31]">
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 flex items-center justify-center font-bold text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C3F71]"
              aria-label="Cerrar confirmación"
            >
              ✕
            </button>

            <div 
              className="w-14 h-14 mx-auto rounded-full text-white flex items-center justify-center text-2xl shadow-lg ring-8 ring-[#FCE7F3]"
              style={{
                background: 'linear-gradient(135deg, #9B447A 0%, #B85591 100%)',
              }}
            >
              🕊️
            </div>

            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-[#2D0F31]">
                {publishedMemory.petName} ya está en el cielo
              </h3>
              <p className="text-xs text-[#54465B] leading-relaxed">
                Hemos encendido una vela en su honor. Tu recuerdo ya brilla en el Libro de los Ángeles donde otras familias podrán leer su nombre y acompañarte.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#EDE2EB] text-left space-y-1">
              <div className="font-bold text-sm text-[#2D0F31]">{publishedMemory.petName}</div>
              <div className="text-xs text-[#54465B] italic">«{publishedMemory.message}»</div>
            </div>

            {/* Opciones de Postal y Compartir en la Celebración */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadPostcard(publishedMemory)}
                disabled={isGeneratingPostal}
                className="w-full py-2.5 px-4 rounded-2xl font-bold text-[#8C3F71] bg-[#FFF0F6] hover:bg-[#FFE3EE] border border-[#F0BED6] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>{isGeneratingPostal ? 'Generando postal...' : 'Descargar postal conmemorativa digital'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareMemory(publishedMemory)}
                className="w-full py-2 px-4 rounded-2xl font-semibold text-[#6C5367] bg-white hover:bg-gray-50 border border-gray-200 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Compartir en WhatsApp o Redes</span>
                <span>↗</span>
              </button>
            </div>

            {postalFeedback && (
              <div className="py-1 px-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-bold text-[#166534] text-center animate-fade-in">
                {postalFeedback}
              </div>
            )}

            <button
              onClick={() => {
                setShowCelebrationModal(false);
                const el = document.getElementById('galeria-recuerdos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 rounded-2xl font-bold text-white text-xs sm:text-sm shadow-md"
              style={{
                background: 'linear-gradient(135deg, #9B447A 0%, #B85591 100%)',
              }}
            >
              Ver su recuerdo en Cartas al Cielo
            </button>
          </div>
        </div>
      )}

      {/* MODAL DISCRETO DE RECLAMACIÓN DE CUSTODIA HISTÓRICA */}
      {showLegacyClaimModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legacy-claim-title"
        >
          <div className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl bg-[#FFF8F0] border border-[#D4B79E] shadow-2xl p-6 space-y-4 text-[#541731]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C3F71]">
                  Custodia de recuerdos anteriores
                </p>
                <h3
                  id="legacy-claim-title"
                  className="text-xl font-bold mt-0.5"
                  style={{ fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif' }}
                >
                  Recupera el recuerdo de tu angelito
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLegacyClaimModal(false)}
                aria-label="Cerrar ventana"
                className="min-w-[36px] min-h-[36px] rounded-full bg-[#541731]/10 hover:bg-[#541731]/20 text-[#541731] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed text-[#4E2331]">
              Por seguridad de las familias, la custodia nunca se asigna de forma automática por el nombre o la foto pública. Verificaremos el control del correo histórico o realizaremos una revisión supervisada.
            </p>

            <form onSubmit={handleSubmitLegacyClaim} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" htmlFor="claim-tribute-select">
                  Selecciona el homenaje
                </label>
                <select
                  id="claim-tribute-select"
                  value={claimTributeSlug}
                  onChange={(e) => setClaimTributeSlug(e.target.value)}
                  className="w-full rounded-xl border border-[#D4B79E] bg-white px-3 py-2 text-sm text-[#541731]"
                  required
                >
                  <option value="">-- Elegir homenaje --</option>
                  {tributes.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.petName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" htmlFor="claim-email-input">
                  Tu correo actual de contacto
                </label>
                <input
                  id="claim-email-input"
                  type="email"
                  required
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-[#D4B79E] bg-white px-3 py-2 text-sm text-[#541731]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" htmlFor="claim-proof-email-input">
                  Correo con el que escribiste el recuerdo original (si lo recuerdas)
                </label>
                <input
                  id="claim-proof-email-input"
                  type="email"
                  value={claimProofEmail}
                  onChange={(e) => setClaimProofEmail(e.target.value)}
                  placeholder="correo-original@ejemplo.com"
                  className="w-full rounded-xl border border-[#D4B79E] bg-white px-3 py-2 text-sm text-[#541731]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" htmlFor="claim-proof-note-input">
                  Detalle privado para verificación (fecha aproximada, código o contexto familiar)
                </label>
                <textarea
                  id="claim-proof-note-input"
                  rows={2}
                  value={claimProofNote}
                  onChange={(e) => setClaimProofNote(e.target.value)}
                  placeholder="Ej: Escribí la carta en mayo de 2024 desde Valencia..."
                  className="w-full rounded-xl border border-[#D4B79E] bg-white px-3 py-2 text-sm text-[#541731]"
                />
              </div>

              {claimFeedback && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium border ${
                    claimFeedback.type === 'pending'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {claimFeedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={claimSubmitting}
                className="w-full min-h-[44px] rounded-full bg-[#541731] hover:bg-[#3f1024] text-[#FFF6EE] font-bold text-sm transition cursor-pointer disabled:opacity-60"
              >
                {claimSubmitting ? 'Enviando solicitud...' : 'Solicitar custodia para revisión'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
