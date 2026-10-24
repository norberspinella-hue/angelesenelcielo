'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OctubreBanner } from '@/components/landing/OctubreBanner';
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
  const [hasTopBanner, setHasTopBanner] = useState(false);
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
            alt={m.petName}
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

          {/* División no uniforme como mancha de pintura a lo largo (Request 2) */}
          <svg className="absolute -bottom-px left-0 w-full h-9 pointer-events-none z-20" viewBox="0 0 500 48" preserveAspectRatio="none">
            <path d="M0,22 Q30,6 65,18 T135,14 T205,24 T275,10 T345,22 T415,12 T485,20 Q495,16 500,18 L500,48 L0,48 Z" fill="#FFFFFF"/>
            <path d="M0,28 Q40,16 80,24 T160,20 T240,28 T320,18 T400,26 T480,22 Q495,24 500,25 L500,48 L0,48 Z" fill="#FFFFFF" opacity="0.65"/>
          </svg>

          {/* Corazón de Ángel Oficial (Request 7 anterior) */}
          <button
            type="button"
            onClick={() => handleReaction(m.id, 'heart')}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-[0_4px_12px_rgba(160,60,120,0.18)] border border-[rgba(246,214,229,0.9)] flex items-center justify-center p-1 hover:scale-115 active:scale-95 transition-all z-30 cursor-pointer"
            title="Plan Eterno"
          >
            <Image 
              src="/images/icons/plans/icon-plan-eterno.svg" alt="Plan Eterno" 
              width={24} 
              height={24} 
              className="object-contain" 
            />
          </button>
        </div>

        {/* Zona de texto y dedicatoria */}
        <div className="p-3.5 pt-1 space-y-1 bg-white relative z-20">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-playfair font-bold text-[#2D0F31] text-base group-hover:text-[#8C3F71] transition-colors">
              {/* Iconplanestrella junto al nombre (Request 3 - triplicado) */}
              <Image 
                src="/images/icons/plans/icon-plan-estrella.svg" 
                alt="Estrella" 
                width={45} 
                height={45} 
                className="object-contain drop-shadow-[0_2px_6px_rgba(217,130,24,0.35)] shrink-0" 
              />
              <span>{m.petName}</span>
            </div>
            {m.yearsOrDates && (
              <span className="text-[10px] text-[#9CA3AF] font-semibold">
                {m.yearsOrDates}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#54465B] line-clamp-3 leading-snug font-normal italic pt-0.5">
            {m.message}
          </p>

          {/* Botón para abrir modal de carta completa */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMemoryForRead(m);
              }}
              className="text-[11.5px] font-semibold text-[#8C3F71] hover:text-[#C25796] hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Leer carta completa</span>
              <span className="text-xs">→</span>
            </button>
          </div>

          {/* Redes sociales (Instagram & TikTok) */}
          {(m.instagram || m.tiktok) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-0.5">
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
                  <span>@{m.instagram.replace(/^@/, '')}</span>
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
                  <span>@{m.tiktok.replace(/^@/, '')}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {reactionFeedback[m.id] && (
        <div className="mx-3.5 mb-1 py-0.5 px-1 rounded bg-[#FFF8FA] border border-[#D89DBF] text-[9px] font-bold text-[#8C3F71] text-center">
          {reactionFeedback[m.id]}
        </div>
      )}

      {/* Contadores limpios como Imagen 3 (Request 7) */}
      <div className="p-3.5 pt-2 border-t border-[#FAF0F6] flex items-center justify-between text-xs font-semibold bg-white relative z-20">
        <div 
          onClick={() => handleReaction(m.id, 'heart')}
          className="flex items-center gap-2 cursor-pointer select-none hover:scale-105 transition-transform"
          title="Enviar amor"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#DF6197">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="font-sans font-semibold text-[13px] text-[#775C73]">{m.candlesCount}</span>
        </div>

        <div 
          onClick={() => handleReaction(m.id, 'paw')}
          className="flex items-center gap-2 cursor-pointer select-none hover:scale-105 transition-transform"
          title="Dejar huella"
        >
          <svg width="21" height="21" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[#2D0F31] bg-[#FBF6F8]">
      
      {/* Cintillo Día de las Mascotas (Octubre) */}
      <OctubreBanner onVisibilityChange={setHasTopBanner} />

      {/* Menú Propio Oficial de Cartas al Cielo */}
      <CartasAlCieloHeader hasTopBanner={hasTopBanner} />

      {/* ========================================================================= */}
      {/* HERO SECTION CON FONDO COMPLETO PANORÁMICO Y DIFUMINADO SUAVE             */}
      {/* ========================================================================= */}
      <section 
        className={`hero-chihuahua-bg relative bg-cover bg-no-repeat bg-top pb-28 sm:pb-36 transition-all duration-500 overflow-hidden ${
          hasTopBanner ? 'pt-[160px] sm:pt-[180px] md:pt-[190px]' : 'pt-[105px] sm:pt-[125px] md:pt-[135px]'
        }`}
      >
        {/* Manto difuminado inferior (funde de forma invisible con la galería) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(251, 246, 248, 0) 0%, rgba(251, 246, 248, 0.5) 40%, rgba(251, 246, 248, 0.92) 80%, #FBF6F8 100%)',
          }}
        />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* COLUMNA IZQUIERDA: Titular con trazo de corazón + 3 valores */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Titular Hero Oficial: Cartas al Cielo con la fuente y tamaño del hero y el degradado del tag */}
              <div>
                <h1 
                  className="hero-title inline-block"
                  style={{
                    fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif',
                    background: 'linear-gradient(90deg, #8C3F71 0%, #B8589E 45%, #DF6197 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1.15,
                    paddingBottom: '0.12em',
                    letterSpacing: '-0.03em',
                    margin: 0,
                  }}
                >
                  Cartas al Cielo
                </h1>

                {/* Subtítulo: Aquí sus nombres nunca se olvidan ♡ (Idéntico a Preview) */}
                <h2 
                  className="font-playfair text-[32px] sm:text-[40px] md:text-[46px] font-bold text-[#2D0F31] leading-[1.15] mb-4 mt-2"
                  style={{
                    textShadow: '0 1px 3px rgba(255, 255, 255, 0.8), 0 2px 10px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Aquí sus nombres <br className="hidden sm:inline" />
                  nunca se olvidan <span className="inline-flex items-center text-[#DF6197] text-[26px] ml-1.5 align-middle not-italic font-normal">♡</span>
                </h2>
              </div>

              <p 
                className="font-sans text-[15px] leading-[1.65] text-[#54465B] mb-6 max-w-[480px] font-medium"
                style={{
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.7)',
                }}
              >
                Un espacio para recordar, compartir y sentirnos acompañados. Cuéntanos cómo se llamaba tu pequeño y deja unas palabras. Aquí siempre habrá alguien dispuesto a escucharlo.
              </p>

              {/* 3 Valores de Comunidad con iconos de Imagen 2 (Request 6) */}
              <div className="grid grid-cols-3 gap-3 pt-3 max-w-lg">
                <div className="p-3.5 pt-3 rounded-[18px] bg-white/80 backdrop-blur-md border border-white/95 shadow-[0_4px_14px_rgba(140,63,113,0.06)] text-center space-y-1.5 hover:-translate-y-1 transition-transform group">
                  <div className="w-11 h-11 mx-auto rounded-full bg-white/85 border border-[rgba(255,235,245,0.9)] shadow-[0_4px_10px_rgba(140,63,113,0.07)] flex items-center justify-center group-hover:scale-105 group-hover:bg-white transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C3F71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div className="text-[11.5px] font-bold text-[#2D0F31] leading-tight">
                    Comparte<br />su nombre
                  </div>
                </div>

                <div className="p-3.5 pt-3 rounded-[18px] bg-white/80 backdrop-blur-md border border-white/95 shadow-[0_4px_14px_rgba(140,63,113,0.06)] text-center space-y-1.5 hover:-translate-y-1 transition-transform group">
                  <div className="w-11 h-11 mx-auto rounded-full bg-white/85 border border-[rgba(255,235,245,0.9)] shadow-[0_4px_10px_rgba(140,63,113,0.07)] flex items-center justify-center group-hover:scale-105 group-hover:bg-white transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C3F71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </div>
                  <div className="text-[11.5px] font-bold text-[#2D0F31] leading-tight">
                    Cuenta su historia<br />o escribe una carta
                  </div>
                </div>

                <div className="p-3.5 pt-3 rounded-[18px] bg-white/80 backdrop-blur-md border border-white/95 shadow-[0_4px_14px_rgba(140,63,113,0.06)] text-center space-y-1.5 hover:-translate-y-1 transition-transform group">
                  <div className="w-11 h-11 mx-auto rounded-full bg-white/85 border border-[rgba(255,235,245,0.9)] shadow-[0_4px_10px_rgba(140,63,113,0.07)] flex items-center justify-center group-hover:scale-105 group-hover:bg-white transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C3F71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="text-[11.5px] font-bold text-[#2D0F31] leading-tight">
                    Siente el apoyo<br />de otras familias
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMNA DERECHA: Tarjeta Flotante con Marca de Agua y Campos (Réplica Exacta Canva) */}
            <div id="formulario-recuerdo" className="lg:col-span-6 pt-7 relative scroll-mt-28">
              <div className="relative rounded-[28px] bg-[#FFF9F6] p-5 sm:p-9 shadow-[0_24px_60px_rgba(120,50,95,0.11),0_6px_18px_rgba(0,0,0,0.03)] border border-[rgba(255,240,235,0.9)] max-w-lg ml-auto overflow-visible text-[#2D0F31]">
                
                {/* Marca de agua dorada en la esquina superior derecha */}
                <svg className="absolute -top-3 -right-2 w-28 h-28 pointer-events-none select-none rotate-[18deg]" viewBox="0 0 100 100" fill="none">
                  <g opacity="0.45" fill="#F4C996">
                    <path d="M50 82 C38 82 30 72 32 60 C33 53 40 48 50 48 C60 48 67 53 68 60 C70 72 62 82 50 82 Z"/>
                    <ellipse cx="28" cy="46" rx="9" ry="12" transform="rotate(-20 28 46)"/>
                    <ellipse cx="43" cy="34" rx="8.5" ry="13" transform="rotate(-6 43 34)"/>
                    <ellipse cx="57" cy="34" rx="8.5" ry="13" transform="rotate(6 57 34)"/>
                    <ellipse cx="72" cy="46" rx="9" ry="12" transform="rotate(20 72 46)"/>
                    <circle cx="88" cy="30" r="2.5" opacity="0.7"/>
                    <circle cx="18" cy="28" r="2" opacity="0.6"/>
                    <circle cx="78" cy="18" r="1.8" opacity="0.5"/>
                    <circle cx="85" cy="65" r="1.8" opacity="0.5"/>
                    <circle cx="15" cy="60" r="1.5" opacity="0.4"/>
                  </g>
                </svg>

                {/* Medallón superior con ICONPLANETERNO oficial (Request 4) */}
                <div 
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#FFF9F6] border-[3.5px] border-[#F6D6E5] shadow-[0_8px_20px_rgba(168,90,159,0.35)] flex items-center justify-center z-20 p-1.5"
                >
                  <Image 
                    src="/images/icons/plans/icon-plan-eterno.svg" 
                    alt="Plan Eterno" 
                    width={44} 
                    height={44} 
                    className="object-contain drop-shadow-[0_2px_5px_rgba(168,90,159,0.3)]" 
                  />
                </div>

                <div className="text-center pt-2 mb-5 relative z-10">
                  <h2 className="font-playfair text-[25px] font-bold text-[#2D0F31] mb-1 tracking-tight">
                    Hoy quiero recordar a...
                  </h2>
                  <p className="text-xs text-[#6C5B70] leading-relaxed">
                    Escribe el nombre de tu ángel y, si lo deseas, comparte una foto y unas palabras. Es un espacio gratuito.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
                  
                  {/* Campo 1 con icono de huella dorada */}
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
                      type="text"
                      required
                      value={petName}
                      onChange={e => setPetName(e.target.value)}
                      placeholder="¿Cómo se llamaba tu pequeño?"
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#D9CBD6] focus:border-[#B85F9F] focus:ring-[3.5px] focus:ring-[rgba(184,95,159,0.15)] focus:bg-white outline-none text-[13.5px] text-[#2D0F31] placeholder-[#94788D] placeholder:italic placeholder:font-serif transition-all bg-[#FAF1EC]"
                    />
                  </div>

                  {/* Campo 2 con icono de corazón morado */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 pointer-events-none flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#9E457C">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </span>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="¿Qué te gustaría contarle hoy?&#10;Te echo de menos..."
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#D9CBD6] focus:border-[#B85F9F] focus:ring-[3.5px] focus:ring-[rgba(184,95,159,0.15)] focus:bg-white outline-none text-[13.5px] text-[#2D0F31] placeholder-[#94788D] placeholder:italic placeholder:font-serif transition-all resize-none bg-[#FAF1EC] h-24 leading-relaxed"
                    />
                  </div>

                  {/* Fila opcional de Instagram y TikTok */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Instagram */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[#9E3D6F]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={instagram}
                        onChange={e => setInstagram(e.target.value)}
                        placeholder="Instagram (@usuario)"
                        className="w-full pl-10 pr-3 py-2 rounded-2xl border border-[#D9CBD6] focus:border-[#B85F9F] focus:ring-[3px] focus:ring-[rgba(184,95,159,0.15)] focus:bg-white outline-none text-[12.5px] text-[#2D0F31] placeholder-[#94788D] placeholder:italic transition-all bg-[#FAF1EC]"
                      />
                    </div>

                    {/* TikTok */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[#472242]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.47 6.27 6.27 0 0 0 1.88-4.48V8.78a8.28 8.28 0 0 0 4.85 1.56V6.89a4.84 4.84 0 0 1-1-.2z"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={tiktok}
                        onChange={e => setTiktok(e.target.value)}
                        placeholder="TikTok (@usuario)"
                        className="w-full pl-10 pr-3 py-2 rounded-2xl border border-[#D9CBD6] focus:border-[#B85F9F] focus:ring-[3px] focus:ring-[rgba(184,95,159,0.15)] focus:bg-white outline-none text-[12.5px] text-[#2D0F31] placeholder-[#94788D] placeholder:italic transition-all bg-[#FAF1EC]"
                      />
                    </div>
                  </div>

                  {/* Añadir foto con marco punteado */}
                  <div>
                    {photoPreview ? (
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[#D6A8BF] bg-[#FFF8FA] h-[44px]">
                        <div className="w-8 h-8 rounded-lg overflow-hidden relative shadow-sm border border-white flex-shrink-0">
                          <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-[#843969] truncate flex-1">Foto seleccionada</span>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="text-xs text-red-500 font-bold px-2 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2.5 w-full h-[44px] px-3 rounded-2xl border-[1.5px] border-dashed border-[#D6A8BF] hover:border-[#B85F9F] bg-[#FFFBF8] hover:bg-[#FFF4F8] transition-all cursor-pointer group select-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E457C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="4" ry="4"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="#9E457C"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span className="text-[12.5px] font-bold text-[#843969]">Añadir una foto</span>
                        <span className="text-[11px] font-medium text-[#A68A9D] italic">(opcional)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Aviso respetuoso sobre difusión y redes sociales (sin opción de desmarcar) */}
                  <div className="p-3 rounded-2xl bg-[#FFF5F8] border border-[#F3D5E4] flex items-start gap-2.5 text-left">
                    <span className="text-sm select-none shrink-0 mt-0.5">🕊️</span>
                    <p className="text-[11px] text-[#6B4E63] leading-relaxed">
                      <strong className="font-semibold text-[#8C3F71]">Homenaje en comunidad y redes:</strong> Al compartir tu carta, formará parte de nuestro santuario público y podrá ser seleccionada con profundo respeto en nuestras cuentas oficiales de <span className="font-semibold text-[#2D0F31]">Instagram (@angeles_en_el_cielo_)</span> y <span className="font-semibold text-[#2D0F31]">TikTok (@angeles_en_elcielo)</span> para honrar su memoria y acompañar a otras familias en su duelo.
                    </p>
                  </div>

                  {/* Opción de Recordatorio de Aniversario (Pilar 3) */}
                  <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#F5E2CC] flex flex-col gap-2 text-left">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wantsAnniversaryReminder}
                        onChange={(e) => setWantsAnniversaryReminder(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CBD6] text-[#A06020] focus:ring-[#A06020] cursor-pointer"
                      />
                      <span className="text-[11.5px] text-[#6A4D3B] leading-snug">
                        <strong className="font-semibold text-[#8B4513]">Recordatorio de aniversario:</strong> Deseo que me aviséis en su fecha especial para volver a encender su vela con la comunidad.
                      </span>
                    </label>
                    {wantsAnniversaryReminder && (
                      <div className="space-y-2 pt-1 border-t border-[#F5E2CC]/60">
                        <div>
                          <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                            Fecha de aniversario o partida *
                          </label>
                          <input
                            type="date"
                            required
                            value={anniversaryDate}
                            onChange={(e) => setAnniversaryDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#8B4513] mb-1">
                            Tu correo electrónico para el aviso cariñoso *
                          </label>
                          <input
                            type="email"
                            required
                            value={anniversaryEmail}
                            onChange={(e) => setAnniversaryEmail(e.target.value)}
                            placeholder="Tu correo electrónico para el aviso cariñoso"
                            className="w-full px-3 py-1.5 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* Botón con avión de papel apuntando arriba y degradado Imagen 1 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-7 rounded-full font-bold text-white text-sm transition-all duration-300 shadow-[0_10px_24px_rgba(175,80,155,0.38)] hover:shadow-[0_14px_28px_rgba(175,80,155,0.48)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.10) 100%), linear-gradient(90deg, #A44F99 0%, #B8589E 35%, #CE5E9B 75%, #D7659F 100%)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Compartiendo tu recuerdo...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ transform: 'rotate(-38deg)', marginTop: '-1px' }}>
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                        <span>Compartir mi recuerdo</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* FRANJA PORTAL DE LUZ (OPCIÓN 1: CONEXIÓN ELEGANTE A CIELO LLENO DE LUCES) */}
      {/* ========================================================================= */}
      <section id="vela-semanal" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 scroll-mt-24">
        <div 
          className="rounded-[24px] px-5 sm:px-8 py-4 sm:py-4.5 border border-[#F3DBEA] shadow-[0_8px_24px_rgba(140,60,110,0.06)] flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF5F9 50%, #FBF1EB 100%)',
          }}
        >
          {/* Lado izquierdo: Llama conmemorativa y mensaje poético */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#FFF5F8] flex items-center justify-center text-2xl relative">
              🕯️
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F59E0B] animate-ping" />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-0.5">
                <span className="text-[10.5px] font-bold text-[#A06020] uppercase tracking-wider">
                  Ritual Semanal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10.5px] font-bold">
                  {weeklyCandlesCount} luces vivas
                </span>
              </div>
              <h3 className="font-playfair text-base sm:text-lg font-bold text-[#2D0F31] leading-tight">
                Un manto de luz para que ningún angelito quede en soledad
              </h3>
              <p className="text-xs text-[#7A6275] mt-0.5 leading-snug">
                Dedicada con amor a <strong className="font-semibold text-[#8C3F71]">Bobby</strong> (Refugio Nueva Vida) y a todos los que nos cuidan desde arriba.
              </p>
            </div>
          </div>

          {/* Lado derecho: Botón elegante hacia Cielo lleno de luces */}
          <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-center">
            <Link
              href="/cielo-lleno-de-luces"
              className="w-full md:w-auto px-6 py-3 rounded-full font-bold text-white text-xs sm:text-sm shadow-[0_8px_20px_rgba(200,90,140,0.32)] hover:shadow-[0_12px_26px_rgba(200,90,140,0.42)] hover:-translate-y-0.5 transition-all flex items-center justify-center text-center cursor-pointer"
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
      {/* GALERÍA / FEED «RECUERDOS RECIENTES» (IDÉNTICO AL MOCKUP)                 */}
      {/* ========================================================================= */}
      <section id="galeria-recuerdos" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Título Oficial: El Libro de Los Ángeles en el Cielo (Misma fuente del Hero, 20% más pequeño) */}
        <div id="libro-angeles-cielo" className="pt-2 pb-2 scroll-mt-24">
          <h2
            className="inline-block"
            style={{
              fontFamily: 'var(--font-title), var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(1.9rem, 4.8vw, 3.68rem)',
              fontWeight: 700,
              lineHeight: 1.25,
              paddingBottom: '0.18em',
              letterSpacing: '-0.025em',
              background: 'linear-gradient(90deg, #8C3F71 0%, #B8589E 45%, #DF6197 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
            }}
          >
            El Libro de Los Ángeles en el Cielo
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#EDE2EB]">
          <div className="flex items-center gap-3">
            {/* Iconplanestrella oficial (Request 3 - triplicado) */}
            <Image
              src="/images/icons/plans/icon-plan-estrella.svg"
              alt="Estrella"
              width={72}
              height={72}
              className="object-contain drop-shadow-[0_4px_10px_rgba(217,130,24,0.4)]"
            />
            <h2 className="font-playfair text-2xl font-bold text-[#2D0F31]">
              Recuerdos recientes
            </h2>
            <div className="w-16 h-px bg-[#EDE2EB] hidden sm:block" />
            <span className="text-xs text-[#B65D86] font-semibold hidden md:inline">
              Cada nombre deja una huella eterna ♥
            </span>
          </div>

          {/* Selectores de animales réplica exacta Imagen 2 (Request 4) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[rgba(246,238,244,0.75)] border border-[#EFE4EC]">
              <button
                type="button"
                onClick={() => { setActiveFilter('todos'); setCurrentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
                onClick={() => { setActiveFilter('perro'); setCurrentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
                onClick={() => { setActiveFilter('gato'); setCurrentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
                onClick={() => { setActiveFilter('otro'); setCurrentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeFilter === 'otro'
                    ? 'bg-gradient-to-r from-[#A4509B] to-[#C85998] text-white font-bold shadow-[0_3px_10px_rgba(164,80,155,0.3)]'
                    : 'bg-white text-[#5B2E58] hover:bg-[#FFF7FB] border border-[#DCCDDD]/40'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={activeFilter === 'otro' ? '#FFFFFF' : '#843969'}><ellipse cx="12" cy="16.5" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.8" r="2.2"/><circle cx="14" cy="6.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>
                <span>Otras mascotas</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D9CBD6] text-xs font-semibold text-[#5B2E58] cursor-pointer hover:border-[#B85F9F] transition-colors">
              <span>Más recientes</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B2E58" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        {/* Barra de Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-white/95 to-[#FDF8FC]/95 border border-[#F0DFEB] rounded-2xl px-4 sm:px-6 py-3 mb-6 shadow-[0_4px_18px_rgba(132,57,105,0.05)]">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#FFF1F7] border border-[#ECCEDB] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-[#843969]">
              <span className="font-semibold text-[#8C3F71]">
                {filteredMemories.length > 0 
                  ? `Página ${safePage} de ${totalPages} · Mostrando ${startIndex + 1}–${Math.min(startIndex + cardsPerPage, filteredMemories.length)} de ${filteredMemories.length} ángeles`
                  : 'Sin ángeles registrados'}
              </span>
            </div>
          </div>
        </div>

        {/* Escenario de Álbum 3D: El Libro de los Ángeles */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-3xl p-4 sm:p-7 md:p-8 border border-[#EBD5E2] bg-[radial-gradient(circle_at_50%_50%,#FFFCFB_0%,#FAF2F6_100%)] shadow-[0_20px_50px_rgba(90,30,68,0.09),inset_0_0_60px_rgba(230,200,220,0.18)] overflow-hidden [perspective:2000px] [transform-style:preserve-3d]"
        >
          {/* Hoja inferior (Underneath page) fija en el fondo que se revela conforme se dobla la superior */}
          {isPageTurning && (
            <div className="absolute inset-4 sm:inset-7 md:inset-8 z-0 pointer-events-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {nextPageMemories.map(m => renderMemoryCard(m))}
            </div>
          )}

          {/* Sombra ambiental suave sobre la página de fondo durante el hojeado */}
          {isPageTurning && (
            <div 
              className={`absolute inset-0 pointer-events-none z-[3] rounded-3xl ${
                turnDirection === 'forward' ? 'anim-shadow-forward' : 'anim-shadow-backward'
              }`}
            />
          )}

          {/* Hoja superior activa: Una sola hoja completa que se arquea, pliega y dobla */}
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 relative z-10 [transform-style:preserve-3d] [backface-visibility:hidden] will-change-transform ${
              isPageTurning 
                ? (turnDirection === 'forward' ? 'anim-page-turn-forward' : 'anim-page-turn-backward')
                : ''
            }`}
          >
            {pageMemories.length === 0 ? (
              <div className="col-span-full text-center py-16 text-[#843969] font-medium text-base">
                No se encontraron recuerdos para esta categoría. ¡Sé el primero en encender una luz para tu ángel!
              </div>
            ) : (
              pageMemories.map(m => renderMemoryCard(m))
            )}
          </div>

          {/* Brillo satinado cilíndrico que recorre la hoja al combarse */}
          {isPageTurning && (
            <div 
              className={`absolute inset-0 pointer-events-none z-[12] rounded-3xl book-curvature-sheen ${
                turnDirection === 'forward' ? 'anim-sheen-forward' : 'anim-sheen-backward'
              }`}
            />
          )}

          {/* Pestaña decorativa de esquina (Corner curl) para hojear hacia adelante */}
          {safePage < totalPages && (
            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              className="group absolute bottom-0 right-0 w-11 h-11 hover:w-14 hover:h-14 transition-all duration-300 rounded-tl-xl shadow-[-3px_-3px_8px_rgba(132,57,105,0.12)] hover:shadow-[-5px_-5px_14px_rgba(132,57,105,0.25)] flex items-end justify-end p-1.5 cursor-pointer z-25"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, #F5E5EF 50%, #EBD5E2 100%)',
              }}
              title="Hojear hacia adelante"
            >
              <span className="text-xs group-hover:scale-125 transition-transform">✨</span>
            </button>
          )}
        </div>

        {/* Barra de Navegación de Páginas: Hojear el Libro de los Ángeles */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1 || isPageTurning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#7A3563] bg-white border border-[#E6D0DE] hover:bg-[#FFF4F9] hover:border-[#B85F9F] hover:text-[#4A1938] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_14px_rgba(120,48,93,0.06)] hover:shadow-[0_6px_18px_rgba(120,48,93,0.12)] disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none transition-all"
              title="Ver página anterior"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>‹ Hojear página anterior</span>
            </button>

            {/* Pastillas numeradas de páginas */}
            <div className="inline-flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isPageTurning}
                  className={`min-w-10 h-10 px-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center ${
                    pageNumber === safePage
                      ? 'bg-gradient-to-r from-[#B85F9F] to-[#843969] text-white shadow-[0_4px_14px_rgba(132,57,105,0.32)] scale-105 ring-2 ring-[#F5D89F]'
                      : 'bg-white text-[#6E3058] border border-[#E6D0DE] hover:bg-[#FFF2F7] hover:border-[#B85F9F] hover:scale-105'
                  }`}
                  title={`Ir a la página ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages || isPageTurning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#7A3563] bg-white border border-[#E6D0DE] hover:bg-[#FFF4F9] hover:border-[#B85F9F] hover:text-[#4A1938] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_14px_rgba(120,48,93,0.06)] hover:shadow-[0_6px_18px_rgba(120,48,93,0.12)] disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none transition-all"
              title="Ver siguiente página"
            >
              <span>Hojear página siguiente ›</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* BLOQUES INFERIORES: VELA Y PUENTE AL MURAL CON CTAs ALINEADOS Y VELA BLANCA */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Vela Semanal con Fondo de Nubes y CTA con Vela Blanca */}
        <div 
          className="rounded-3xl p-6 border border-[#FCE7F3] shadow-[0_16px_40px_rgba(140,60,110,0.08)] flex flex-col justify-between relative overflow-hidden h-full"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(255, 245, 248, 0.88) 0%, rgba(248, 236, 248, 0.88) 50%, rgba(254, 242, 238, 0.88) 100%), url('/images/solidario/bg-corazones-pc.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-start gap-4 relative z-10 flex-1">
            <div className="w-[84px] h-[84px] min-h-[84px] rounded-2xl overflow-hidden relative shadow-md border-2 border-white flex-shrink-0">
              <Image src="/images/comunidad/candle-banner.webp" alt="Vela encendida" fill className="object-cover" />
            </div>
            <div className="flex-1">
              {/* Título con fuente idéntica a la tarjeta derecha (Request 1) */}
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

        {/* Puente al Mural con Fondo de Nubes y CTA Alineado */}
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
              {/* Título con fuente idéntica a la tarjeta izquierda e Iconplanestrella (Request 1 & 3 - triplicado) */}
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

            <div className="w-[84px] h-[84px] min-h-[84px] rounded-2xl overflow-hidden relative shadow-md border-2 border-white flex-shrink-0 rotate-3">
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

      {/* Estilos de animación 3D de curvatura real del Libro de los Ángeles (sin cortes ni trozos grises) */}
      <style>{`
        @keyframes bookPageTurnForward {
          0% {
            transform-origin: left center;
            transform: perspective(2600px) rotateY(0deg) rotateZ(0deg) skewY(0deg) scaleX(1) translateZ(0);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(140, 60, 110, 0.08));
          }
          28% {
            transform-origin: left center;
            transform: perspective(2600px) rotateY(-36deg) rotateZ(3.5deg) skewY(-4.5deg) scaleX(0.88) translateZ(75px);
            opacity: 1;
            filter: drop-shadow(-16px 12px 28px rgba(120, 40, 95, 0.16));
          }
          55% {
            transform-origin: left center;
            transform: perspective(2600px) rotateY(-82deg) rotateZ(5deg) skewY(-6.5deg) scaleX(0.72) translateZ(115px);
            opacity: 0.98;
            filter: drop-shadow(-28px 16px 36px rgba(120, 40, 95, 0.22));
          }
          82% {
            transform-origin: left center;
            transform: perspective(2600px) rotateY(-118deg) rotateZ(3deg) skewY(-3.5deg) scaleX(0.86) translateZ(55px);
            opacity: 0.25;
            filter: drop-shadow(-12px 8px 18px rgba(120, 40, 95, 0.12));
          }
          100% {
            transform-origin: left center;
            transform: perspective(2600px) rotateY(-145deg) rotateZ(0deg) skewY(0deg) scaleX(1) translateZ(0);
            opacity: 0;
            filter: none;
          }
        }

        @keyframes bookPageTurnBackward {
          0% {
            transform-origin: right center;
            transform: perspective(2600px) rotateY(0deg) rotateZ(0deg) skewY(0deg) scaleX(1) translateZ(0);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(140, 60, 110, 0.08));
          }
          28% {
            transform-origin: right center;
            transform: perspective(2600px) rotateY(36deg) rotateZ(-3.5deg) skewY(4.5deg) scaleX(0.88) translateZ(75px);
            opacity: 1;
            filter: drop-shadow(16px 12px 28px rgba(120, 40, 95, 0.16));
          }
          55% {
            transform-origin: right center;
            transform: perspective(2600px) rotateY(82deg) rotateZ(-5deg) skewY(6.5deg) scaleX(0.72) translateZ(115px);
            opacity: 0.98;
            filter: drop-shadow(28px 16px 36px rgba(120, 40, 95, 0.22));
          }
          82% {
            transform-origin: right center;
            transform: perspective(2600px) rotateY(118deg) rotateZ(-3deg) skewY(3.5deg) scaleX(0.86) translateZ(55px);
            opacity: 0.25;
            filter: drop-shadow(12px 8px 18px rgba(120, 40, 95, 0.12));
          }
          100% {
            transform-origin: right center;
            transform: perspective(2600px) rotateY(145deg) rotateZ(0deg) skewY(0deg) scaleX(1) translateZ(0);
            opacity: 0;
            filter: none;
          }
        }

        .book-curvature-sheen {
          background: linear-gradient(
            105deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.35) 30%,
            rgba(255, 255, 255, 0.95) 48%,
            rgba(255, 248, 235, 0.92) 52%,
            rgba(240, 215, 230, 0.2) 65%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        @keyframes curvatureSheenWaveForward {
          0% {
            opacity: 0;
            transform: translateX(35%);
          }
          28% {
            opacity: 0.85;
            transform: translateX(10%);
          }
          58% {
            opacity: 0.95;
            transform: translateX(-35%);
          }
          100% {
            opacity: 0;
            transform: translateX(-85%);
          }
        }

        @keyframes curvatureSheenWaveBackward {
          0% {
            opacity: 0;
            transform: translateX(-35%);
          }
          28% {
            opacity: 0.85;
            transform: translateX(-10%);
          }
          58% {
            opacity: 0.95;
            transform: translateX(35%);
          }
          100% {
            opacity: 0;
            transform: translateX(85%);
          }
        }

        @keyframes underShadowForward {
          0% {
            opacity: 0;
            background: linear-gradient(to left, rgba(140, 60, 110, 0.12) 0%, transparent 60%);
          }
          45% {
            opacity: 0.75;
            background: linear-gradient(to left, rgba(140, 60, 110, 0.18) 0%, rgba(140, 60, 110, 0.05) 45%, transparent 75%);
          }
          100% {
            opacity: 0;
            background: linear-gradient(to left, rgba(140, 60, 110, 0.12) 0%, transparent 60%);
          }
        }

        @keyframes underShadowBackward {
          0% {
            opacity: 0;
            background: linear-gradient(to right, rgba(140, 60, 110, 0.12) 0%, transparent 60%);
          }
          45% {
            opacity: 0.75;
            background: linear-gradient(to right, rgba(140, 60, 110, 0.18) 0%, rgba(140, 60, 110, 0.05) 45%, transparent 75%);
          }
          100% {
            opacity: 0;
            background: linear-gradient(to right, rgba(140, 60, 110, 0.12) 0%, transparent 60%);
          }
        }

        .hero-chihuahua-bg {
          background-image: url('/images/comunidad/fondo-hero-chihuahua-movil.webp');
        }
        @media (min-width: 640px) {
          .hero-chihuahua-bg {
            background-image: url('/images/comunidad/fondo-hero-chihuahua-pc.webp');
          }
        }

        .anim-page-turn-forward {
          animation: bookPageTurnForward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .anim-sheen-forward {
          animation: curvatureSheenWaveForward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .anim-shadow-forward {
          animation: underShadowForward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .anim-page-turn-backward {
          animation: bookPageTurnBackward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .anim-sheen-backward {
          animation: curvatureSheenWaveBackward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .anim-shadow-backward {
          animation: underShadowBackward 0.90s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* MODAL 1: LEER CARTA COMPLETA */}
      {selectedMemoryForRead && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#180A1C]/75 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setSelectedMemoryForRead(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-[#F3DFEB] my-auto text-[#2D0F31]"
            onClick={e => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setSelectedMemoryForRead(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#775C73] hover:text-[#2D0F31] shadow-md border border-[#F0E3EB] flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            {/* Cabecera con Foto */}
            <div className="relative w-full h-56 sm:h-64 bg-[#FAF4F9] overflow-hidden">
              <Image
                src={selectedMemoryForRead.photoUrl}
                alt={selectedMemoryForRead.petName}
                fill
                unoptimized
                className="object-cover"
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,0.95) 100%)',
                }}
              />

              {/* Medallón Corazón de Ángel */}
              <div 
                className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-[rgba(246,214,229,0.9)] flex items-center justify-center p-1"
                title="Plan Eterno · Ángeles en el Cielo"
              >
                <Image 
                  src="/images/icons/plans/icon-plan-eterno.svg" 
                  alt="Plan Eterno" 
                  width={26} 
                  height={26} 
                  className="object-contain" 
                />
              </div>
            </div>

            {/* Contenido de la Carta */}
            <div className="p-6 sm:p-7 pt-1 space-y-4">
              
              {/* Título y Datos del Ángel */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 font-playfair font-bold text-[#2D0F31] text-2xl sm:text-3xl">
                  <Image 
                    src="/images/icons/plans/icon-plan-estrella.svg" 
                    alt="Estrella" 
                    width={40} 
                    height={40} 
                    className="object-contain drop-shadow-[0_2px_6px_rgba(217,130,24,0.35)] shrink-0" 
                  />
                  <span>{selectedMemoryForRead.petName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8C3F71] mt-0.5">
                  <span>🐾 {selectedMemoryForRead.yearsOrDates || 'Siempre en el corazón'}</span>
                  {selectedMemoryForRead.authorName && (
                    <>
                      <span>·</span>
                      <span className="text-[#775C73]">{selectedMemoryForRead.authorName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Carta Íntegra */}
              <div className="p-5 rounded-2xl bg-[#FFF8FA] border border-[#F2D7E7] text-left relative">
                <p className="font-serif italic text-[15px] sm:text-[16px] text-[#3E1C38] leading-relaxed whitespace-pre-wrap">
                  «{selectedMemoryForRead.message}»
                </p>
              </div>

              {/* Redes Sociales del Autor si existen */}
              {(selectedMemoryForRead.instagram || selectedMemoryForRead.tiktok) && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {selectedMemoryForRead.instagram && (
                    <a
                      href={`https://instagram.com/${selectedMemoryForRead.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF0F6] border border-[#EAC2DB] text-[#9E3D6F] hover:bg-[#F5DFEE] hover:border-[#DF6197] transition-all"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span>@{selectedMemoryForRead.instagram.replace(/^@/, '')}</span>
                    </a>
                  )}
                  {selectedMemoryForRead.tiktok && (
                    <a
                      href={`https://tiktok.com/@${selectedMemoryForRead.tiktok.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F2F6] border border-[#DDD4DE] text-[#472242] hover:bg-[#ECE4ED] hover:border-[#2D0F31] transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.47 6.27 6.27 0 0 0 1.88-4.48V8.78a8.28 8.28 0 0 0 4.85 1.56V6.89a4.84 4.84 0 0 1-1-.2z"/>
                      </svg>
                      <span>@{selectedMemoryForRead.tiktok.replace(/^@/, '')}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Barra de Reacciones dentro del Modal */}
              <div className="pt-2 pb-1 border-t border-[#F5EAF2] flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'heart')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F6] hover:bg-[#FFE3F0] text-[#9E3D6F] font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#DF6197">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Encender vela ({selectedMemoryForRead.candlesCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReaction(selectedMemoryForRead.id, 'paw')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDF6ED] hover:bg-[#F9ECCF] text-[#A66F3E] font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#C99155">
                    <ellipse cx="12" cy="16.5" rx="5.3" ry="4.2"/>
                    <circle cx="5.8" cy="10.2" r="2.3"/>
                    <circle cx="9.8" cy="6.8" r="2.3"/>
                    <circle cx="14.2" cy="6.8" r="2.3"/>
                    <circle cx="18.2" cy="10.2" r="2.3"/>
                  </svg>
                  <span>Dejar huella ({selectedMemoryForRead.supportCount})</span>
                </button>
              </div>

              {reactionFeedback[selectedMemoryForRead.id] && (
                <div className="py-1 px-3 rounded-xl bg-[#FFF8FA] border border-[#D89DBF] text-[11px] font-bold text-[#8C3F71] text-center animate-fade-in">
                  {reactionFeedback[selectedMemoryForRead.id]}
                </div>
              )}

              {/* Botones de Postal Conmemorativa y Compartir */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPostcard(selectedMemoryForRead)}
                  disabled={isGeneratingPostal}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(164,80,155,0.32)] hover:shadow-[0_12px_24px_rgba(164,80,155,0.42)] hover:-translate-y-0.5 transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #A4509B 0%, #C85998 50%, #9B3D75 100%)',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>{isGeneratingPostal ? 'Generando postal conmemorativa...' : 'Descargar postal conmemorativa digital'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareMemory(selectedMemoryForRead)}
                  className="w-full py-2.5 px-4 rounded-2xl font-semibold text-[#6C5367] bg-white hover:bg-[#FAF4F9] border border-[#E8D2E2] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Compartir en WhatsApp o Redes</span>
                </button>
              </div>

              {postalFeedback && (
                <div className="py-1 px-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-bold text-[#166534] text-center animate-fade-in">
                  {postalFeedback}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUMAR MI LUZ EN LA VELA SEMANAL (DOMINGOS DE LUZ) */}
      {showWeeklyCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-left space-y-4 relative text-[#2D0F31]">
            <button
              onClick={() => setShowWeeklyCandleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
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

                  {/* Pilar 3: Recordatorio de Aniversario */}
                  <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#F5E2CC] space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={candleAnniversaryOptIn}
                        onChange={(e) => setCandleAnniversaryOptIn(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CBD6] text-[#A06020] focus:ring-[#A06020] cursor-pointer"
                      />
                      <span className="text-[11.5px] text-[#6A4D3B] leading-snug">
                        <strong className="font-semibold text-[#8B4513]">Recordatorio de Aniversario:</strong> Deseo recibir un aviso cariñoso en sus fechas especiales para volver a encender su vela con la comunidad.
                      </span>
                    </label>
                    {candleAnniversaryOptIn && (
                      <input
                        type="email"
                        value={candleEmail}
                        onChange={(e) => setCandleEmail(e.target.value)}
                        placeholder="Tu correo electrónico (opcional)"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5CEBA] bg-white text-xs text-[#2D0F31] outline-none focus:border-[#C69062]"
                      />
                    )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F0D24]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white text-center space-y-4 relative text-[#2D0F31]">
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
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
