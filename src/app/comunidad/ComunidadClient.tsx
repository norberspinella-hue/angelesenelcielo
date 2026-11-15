'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartasAlCieloHeader } from '@/components/comunidad/CartasAlCieloHeader';

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
}

export default function ComunidadClient({ initialMemories }: Props) {
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
        } else if (showCelebrationModal) {
          setShowCelebrationModal(false);
        } else if (showWeeklyCandleModal) {
          setShowWeeklyCandleModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemoryForRead, showCelebrationModal, showWeeklyCandleModal]);

  React.useEffect(() => {
    if (selectedMemoryForRead) {
      setTimeout(() => {
        modalCloseButtonRef.current?.focus();
      }, 50);
    }
  }, [selectedMemoryForRead]);



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


  // Cálculos para El Libro de los Ángeles (Carta Destacada + Más cartas con sobres)
  const firstFeaturedLetter = filteredMemories[0] || null;
  const otherLetters = filteredMemories.slice(1);
  const envelopesPerPage = 9; // 3 columnas x 3 filas
  const totalLibroPages = Math.ceil(otherLetters.length / envelopesPerPage) || 1;
  const safeLibroPage = Math.min(Math.max(currentPage, 1), totalLibroPages);
  const startEnvelopeIndex = (safeLibroPage - 1) * envelopesPerPage;
  const paginatedOtherLetters = otherLetters.slice(startEnvelopeIndex, startEnvelopeIndex + envelopesPerPage);
  return (
    <div className="min-h-screen text-[#2D0F31] bg-[#24143C]">
      
      {/* Menú Propio Oficial de Cartas al Cielo */}
      <CartasAlCieloHeader />

      {/* ========================================================================= */}
      {/* 2. PORTADA · UNA CARTA BAJO LAS ESTRELLAS (HERO NOCTURNO OFICIAL)          */}
      {/* ========================================================================= */}
      <section className="relative bg-[#24143C] text-white overflow-hidden pt-[95px] sm:pt-[115px] md:pt-[130px] pb-10 sm:pb-16 lg:pb-20">
        
        {/* Luces sutiles celestiales de fondo */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(140, 63, 113, 0.45) 0%, transparent 60%), radial-gradient(circle at 80% 40%, rgba(232, 212, 187, 0.25) 0%, transparent 50%)',
          }}
        />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* =================================================================== */}
            {/* COLUMNA TEXTO / BOTONES:                                            */}
            {/* En móvil: order-1 (aparece ANTES de la ilustración, según req. 2.3) */}
            {/* En escritorio: col-span-6 a la izquierda                            */}
            {/* =================================================================== */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left order-1">
              
              <div>
                <h1 
                  className="font-playfair text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.12] mb-3 tracking-tight"
                  style={{
                    fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif',
                  }}
                >
                  Cartas al Cielo
                </h1>

                <p 
                  className="font-serif italic text-xl sm:text-2xl lg:text-[26px] text-[#E8D4BB] font-normal leading-snug max-w-[540px] mx-auto lg:mx-0"
                >
                  Bajo las estrellas, aún tenemos tanto que decirte.
                </p>
              </div>

              <p className="font-sans text-[15px] sm:text-base text-[#D4C8DE] leading-relaxed max-w-[500px] mx-auto lg:mx-0 font-normal">
                Un rincón gratuito y amoroso donde el cariño trasciende la distancia. Escribe unas palabras
                para tu angelito, encuentra consuelo en otras familias y mantén viva su huella en el Libro eterno.
              </p>

              {/* Botones principales de acción: Escribir una carta / Leer las cartas */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#formulario-recuerdo"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('formulario-recuerdo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full font-bold text-[#541731] text-sm shadow-[0_8px_24px_rgba(232,212,187,0.30)] hover:shadow-[0_12px_28px_rgba(232,212,187,0.45)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center select-none bg-[#FFF4E7] hover:bg-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(-38deg)', marginTop: '-1px' }}>
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  <span>Escribir una carta</span>
                </a>

                <a
                  href="#libro-de-los-angeles"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('libro-de-los-angeles')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-full font-bold text-[#E8D4BB] hover:text-white bg-white/10 hover:bg-white/15 border border-[#E8D4BB]/40 hover:border-[#E8D4BB] transition-all flex items-center justify-center gap-2 cursor-pointer text-center select-none text-sm backdrop-blur-xs"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>Leer las cartas</span>
                </a>
              </div>

            </div>

            {/* =================================================================== */}
            {/* ILUSTRACIÓN / PORTAL NOCTURNO:                                       */}
            {/* En móvil: order-2 (después de textos y botones)                     */}
            {/* En escritorio: col-span-6 a la derecha                              */}
            {/* Muestra: portal nocturno, arco floral, perrito de espaldas,         */}
            {/* y el sobre marfil iluminado en el escalón como acceso visible       */}
            {/* =================================================================== */}
            <div className="lg:col-span-6 relative order-2 flex justify-center">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_55px_rgba(0,0,0,0.55)] border border-[#492B60] max-w-[560px] w-full">
                
                {/* Encuadre oficial: móvil (<768px) y escritorio (>=769px) */}
                <picture className="block w-full h-auto">
                  <source 
                    media="(max-width: 768px)" 
                    srcSet="/images/cartas-al-cielo/hero/hero-movil-768.webp 768w, /images/cartas-al-cielo/hero/hero-movil-480.webp 480w" 
                    sizes="(max-width: 768px) 100vw, 560px"
                  />
                  <source 
                    media="(min-width: 769px)" 
                    srcSet="/images/cartas-al-cielo/hero/hero-escritorio-1440.webp 1440w, /images/cartas-al-cielo/hero/hero-escritorio-1024.webp 1024w, /images/cartas-al-cielo/hero/hero-escritorio-1752.webp 1752w" 
                    sizes="(min-width: 1024px) 560px, 100vw"
                  />
                  <img 
                    src="/images/cartas-al-cielo/hero/hero-escritorio-1440.webp" 
                    alt="Portal nocturno hacia las estrellas con arco floral, perrito de espaldas y un sobre marfil iluminado en el escalón" 
                    className="w-full h-auto object-cover block"
                    loading="eager"
                  />
                </picture>

                {/* 3.1 El sobre como hilo conductor: cerrado e iluminado en el escalón */}
                <a
                  href="#formulario-recuerdo"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('formulario-recuerdo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group absolute bottom-[5%] right-[6%] sm:bottom-[7%] sm:right-[8%] px-3 py-1.5 rounded-full bg-[#FFF4E7]/90 hover:bg-white text-[#541731] text-[11px] sm:text-xs font-semibold shadow-[0_4px_16px_rgba(255,244,231,0.65)] hover:shadow-[0_6px_22px_rgba(255,244,231,0.95)] hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs border border-[#E8D4BB]"
                  aria-label="Escribir una carta desde el sobre iluminado"
                  title="Escribir una carta"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                  <span>✉️ Escribir una carta</span>
                </a>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4.1 TRANSICIÓN DE ATMÓSFERA: DE ÍNDIGO NOCTURNO A ROSA CÁLIDO DEL JARDÍN */}
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

        {/* 3.3 Entrada al Jardín: El sobre reaparece abierto con corazón alado cobrizo */}
        <header>
          <img 
            className="libro-insignia" 
            src="/images/cartas-al-cielo/libro/assets/sobre-abierto.webp" 
            alt="Sobre abierto de El Libro de los Ángeles con sello cobrizo alado" 
          />
          <h2 id="libro-titulo">El Libro de los Ángeles</h2>
        </header>

        {/* Filtros semánticos por especie */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative z-10 max-w-[900px] mx-auto">
          <div 
            role="tablist" 
            aria-label="Filtrar cartas por tipo de mascota" 
            className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-[#FAF0E6]/85 border border-[#D4B79E]/60 backdrop-blur-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'todos'}
              onClick={() => { setActiveFilter('todos'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                activeFilter === 'todos'
                  ? 'bg-[#541731] text-white shadow-xs'
                  : 'text-[#541731] hover:bg-white/60'
              }`}
            >
              <span>Todos</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'perro'}
              onClick={() => { setActiveFilter('perro'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                activeFilter === 'perro'
                  ? 'bg-[#541731] text-white shadow-xs'
                  : 'text-[#541731] hover:bg-white/60'
              }`}
            >
              <span>🐶 Perros</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'gato'}
              onClick={() => { setActiveFilter('gato'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                activeFilter === 'gato'
                  ? 'bg-[#541731] text-white shadow-xs'
                  : 'text-[#541731] hover:bg-white/60'
              }`}
            >
              <span>🐱 Gatos</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'otro'}
              onClick={() => { setActiveFilter('otro'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
                activeFilter === 'otro'
                  ? 'bg-[#541731] text-white shadow-xs'
                  : 'text-[#541731] hover:bg-white/60'
              }`}
            >
              <span>🐾 Otras mascotas</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-[#834E54] select-none">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'carta en el Libro' : 'cartas en el Libro'}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4.2 APERTURA DEL LIBRO CON UNA CARTA REAL (CARTA DESTACADA)               */}
        {/* ========================================================================= */}
        {firstFeaturedLetter ? (
          <article className={`libro-hoja libro-destacada ${!firstFeaturedLetter.photoUrl ? 'sin-foto' : ''}`}>
            {firstFeaturedLetter.photoUrl && (
              <figure className="libro-foto">
                <img 
                  src={firstFeaturedLetter.photoUrl} 
                  alt={`Fotografía de ${firstFeaturedLetter.petName}`} 
                  loading="lazy" 
                />
              </figure>
            )}
            <div className="space-y-3">
              <h3 className="font-playfair text-[#541731] text-2xl sm:text-3xl font-bold">
                Para {firstFeaturedLetter.petName}
              </h3>
              <p className="text-[#642944] leading-relaxed text-base sm:text-lg">
                {previewLetterText(firstFeaturedLetter.message, 210)}
              </p>
              <button 
                type="button" 
                className="libro-leer inline-flex items-center gap-2 text-[#541731] font-bold cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  lastActiveTriggerRef.current = e.currentTarget;
                  setSelectedMemoryForRead(firstFeaturedLetter);
                }}
              >
                <span>Leer la carta para {firstFeaturedLetter.petName}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ) : (
          <div className="libro-hoja text-center py-12 text-[#834E54]">
            Aún no hay cartas en el Libro para este filtro. ¡Sé el primero en escribir una!
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4.3 SECCIÓN "MÁS CARTAS" CON SOBRES DE ALTA RESOLUCIÓN                    */}
        {/* ========================================================================= */}
        {paginatedOtherLetters.length > 0 && (
          <>
            <h3 className="libro-mas font-playfair text-[#541731] text-2xl sm:text-3xl font-bold">
              Más cartas
            </h3>
            <ul className="libro-indice">
              {paginatedOtherLetters.map((letter) => (
                <li key={letter.id}>
                  <button
                    type="button"
                    className="libro-sobre"
                    aria-label={`Abrir la carta para ${letter.petName}`}
                    onClick={(e) => {
                      lastActiveTriggerRef.current = e.currentTarget;
                      setSelectedMemoryForRead(letter);
                    }}
                  >
                    <span className="libro-pestaña">
                      {previewLetterText(letter.message, 135)}
                    </span>
                    <span className="libro-frente">
                      Para {letter.petName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Paginación del Libro */}
            {totalLibroPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10 relative z-10">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeLibroPage <= 1}
                  className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ← Página anterior
                </button>
                <span className="text-xs font-bold text-[#834E54] px-2 select-none">
                  Página {safeLibroPage} de {totalLibroPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalLibroPages, p + 1))}
                  disabled={safeLibroPage >= totalLibroPages}
                  className="px-4 py-2 rounded-full border border-[#D4B79E] text-xs font-semibold text-[#541731] bg-white/80 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Página siguiente →
                </button>
              </div>
            )}
          </>
        )}

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
      {/* 4.4 LECTOR DE CARTAS (DIALOG ACCESIBLE CON VISTA PANTALLA COMPLETA EN MÓVIL) */}
      {/* ========================================================================= */}
      {selectedMemoryForRead && (
        <>
          {/* Fondo desenfocado */}
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
          >
            {/* Barra superior con botón volver al libro accesible */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D4B79E]/60 mb-5">
              <button
                ref={modalCloseButtonRef}
                type="button"
                className="libro-cerrar text-[#541731] font-bold text-sm flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setSelectedMemoryForRead(null);
                  setTimeout(() => lastActiveTriggerRef.current?.focus(), 50);
                }}
              >
                <span>←</span>
                <span>Volver al Libro</span>
              </button>

              <span className="text-xs font-semibold text-[#834E54]">
                {selectedMemoryForRead.yearsOrDates || 'En memoria eterna'}
              </span>
            </div>

            {/* Cabecera de la carta */}
            <h3 id="dialog-carta-titulo" className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#541731] mb-4">
              Para {selectedMemoryForRead.petName}
            </h3>

            {/* Fotografía con esquinas de papel */}
            {selectedMemoryForRead.photoUrl && (
              <figure className="libro-foto">
                <img 
                  src={selectedMemoryForRead.photoUrl} 
                  alt={`Fotografía de ${selectedMemoryForRead.petName}`} 
                  loading="lazy"
                />
              </figure>
            )}

            {/* Contenido con párrafos originales preservados */}
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-[#541731] my-4">
              <p className="whitespace-pre-wrap">{selectedMemoryForRead.message}</p>
            </div>

            {selectedMemoryForRead.authorName && (
              <p className="text-sm italic text-[#834E54] pt-3 border-t border-[#D4B79E]/40">
                Con amor, {selectedMemoryForRead.authorName}
              </p>
            )}

            {/* Botones de amor, huellita y compartir */}
            <div className="mt-6 pt-4 border-t border-[#D4B79E]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'heart')}
                  aria-label={`Enviar amor a ${selectedMemoryForRead.petName}`}
                  className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F6] hover:bg-[#FFE5F0] text-[#8C3F71] font-semibold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DF6197]"
                >
                  <span>💖</span>
                  <span>{selectedMemoryForRead.candlesCount}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'paw')}
                  aria-label={`Dejar huellita para ${selectedMemoryForRead.petName}`}
                  className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDF6ED] hover:bg-[#FAEAD7] text-[#A06020] font-semibold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C99155]"
                >
                  <span>🐾</span>
                  <span>{selectedMemoryForRead.supportCount}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleShareMemory(selectedMemoryForRead)}
                className="min-h-[44px] px-5 py-2 rounded-full border border-[#D4B79E] text-xs sm:text-sm font-semibold text-[#541731] hover:bg-white/80 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>🔗</span>
                <span>Compartir carta</span>
              </button>
            </div>

            {postalFeedback && (
              <div className="mt-3 text-center text-xs font-bold text-[#8C3F71]">
                {postalFeedback}
              </div>
            )}

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

    </div>
  );
}
