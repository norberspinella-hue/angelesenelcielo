'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_SHELTER_PETS, ShelterPet } from '@/components/solidario/ApadrinarDrawer';
import { PetProfileCardProps, PetData, SlotCoord } from './types';
import { PetCardFront } from './PetCardFront';
import { PetCardBack } from './PetCardBack';
import { PetCardSolidarityPanel } from './PetCardSolidarityPanel';
import { PetCardSharePanel } from './PetCardSharePanel';
import { generateFrontCardPng, generateBackCardPng } from './PetCardExport';

const supabase = createClient();

export function PetProfileCard({
  memorialId,
  planType,
  thumbnailUrl,
  isShelter,
  shelterPet,
  onClose,
  onApadrinar,
}: PetProfileCardProps) {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [slotData, setSlotData] = useState<SlotCoord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const frontFaceRef = useRef<HTMLDivElement>(null);
  const backFaceRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Carga de datos dinámicos desde Supabase con cascada de rescate
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);

        let data: any = null;
        const isUuid = Boolean(
          memorialId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memorialId)
        );

        if (isUuid) {
          const { data: memById } = await supabase
            .from('memorials')
            .select(
              'id, pet_name, photo_url, plan_type, profile_slug, slots_count, birth_date, death_date, dedication, story_answers, slot_assigned'
            )
            .eq('id', memorialId)
            .maybeSingle();
          if (memById) data = memById;
        }

        // Búsqueda por sponsoredPetId en caso de apadrinamiento
        if (!data && memorialId) {
          const { data: memBySponsored } = await (supabase.from('memorials') as any)
            .select(
              'id, pet_name, photo_url, plan_type, profile_slug, slots_count, birth_date, death_date, dedication, story_answers, slot_assigned'
            )
            .filter('story_answers->>sponsoredPetId', 'eq', memorialId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (memBySponsored) data = memBySponsored;
        }

        // Búsqueda por nombre de protectora
        const petNameToSearch = shelterPet?.name || '';
        if (!data && petNameToSearch) {
          const { data: memByName } = await (supabase.from('memorials') as any)
            .select(
              'id, pet_name, photo_url, plan_type, profile_slug, slots_count, birth_date, death_date, dedication, story_answers, slot_assigned'
            )
            .ilike('pet_name', petNameToSearch)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (memByName) data = memByName;
        }

        if (data) {
          setPetData(data);
        } else if (memorialId?.startsWith('shelter_') || isShelter) {
          // Fallback seguro a datos de protectora
          const matched =
            shelterPet ||
            DEFAULT_SHELTER_PETS.find(
              (p) =>
                p.id === memorialId ||
                (shelterPet ? p.name.toLowerCase() === (shelterPet as any).name?.toLowerCase() : false)
            );
          if (matched) {
            setPetData({
              pet_name: matched.name,
              photo_url: matched.photoUrl,
              plan_type: 'recuerdo_eterno',
              profile_slug: null,
              slots_count: 9,
              birth_date: null,
              death_date: null,
              dedication:
                matched.storyPreview ||
                'Angelito de protectora esperando un corazón generoso que encienda sus 9 estrellas perpetuas.',
              story_answers: {
                isSponsorship: true,
                shelterName: matched.shelterName,
                shelterCity: matched.shelterCity,
                isSponsored: matched.isSponsored || false,
                sponsorName: matched.sponsorName,
                sponsorPetName: matched.memorialPetName,
              },
            });
          }
        }

        // Coordenadas del slot en el mural
        const targetMemorialId = data?.id || memorialId;
        const isTargetUuid = Boolean(
          targetMemorialId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetMemorialId)
        );
        if (isTargetUuid) {
          const { data: slot } = await supabase
            .from('mural_slots')
            .select('x, y')
            .eq('memorial_id', targetMemorialId)
            .order('x', { ascending: true })
            .order('y', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (slot) {
            setSlotData(slot as SlotCoord);
          }
        }
      } catch (err) {
        console.error('Error cargando memorial:', err);
      } finally {
        setLoading(false);
      }
    };

    if (memorialId) {
      fetchPetData();
    }
  }, [memorialId, isShelter, shelterPet]);

  // Determinación de si es mascota de protectora
  const isShelterPet = Boolean(
    isShelter ||
      memorialId?.startsWith('shelter_') ||
      petData?.story_answers?.isSponsorship ||
      petData?.story_answers?.isShelter ||
      petData?.story_answers?.shelterName
  );

  const matchedShelterPet: ShelterPet =
    shelterPet ||
    DEFAULT_SHELTER_PETS.find((p) => p.id === memorialId) || {
      id: memorialId,
      name: petData?.pet_name || 'Angelito',
      photoUrl: petData?.photo_url || thumbnailUrl || '/images/placeholders/first.webp',
      shelterName: petData?.story_answers?.shelterName || 'Refugio Colaborador',
      shelterCity: petData?.story_answers?.shelterCity || 'España',
      storyPreview: petData?.story_answers?.storyPreview || petData?.dedication || '',
      isSponsored: petData?.story_answers?.isSponsored || false,
      sponsorName: petData?.story_answers?.sponsorName,
      memorialPetName: petData?.story_answers?.sponsorPetName || petData?.story_answers?.memorialPetName,
    };

  const isSponsored = Boolean(
    petData?.story_answers?.isSponsored ||
      (petData?.story_answers?.isSponsorship && petData?.story_answers?.sponsorName) ||
      matchedShelterPet.isSponsored
  );
  const sponsorName = petData?.story_answers?.sponsorName || matchedShelterPet.sponsorName || '';
  const memorialPetName =
    petData?.story_answers?.sponsorPetName ||
    petData?.story_answers?.memorialPetName ||
    matchedShelterPet.memorialPetName ||
    '';

  const nombre = petData?.pet_name || 'Ángel';

  const shareUrl =
    typeof window !== 'undefined'
      ? petData?.profile_slug
        ? `${window.location.origin}/memorial/${petData.profile_slug}`
        : slotData
        ? `${window.location.origin}/mural-global?highlight=${slotData.x},${slotData.y}&zoom=true`
        : `${window.location.origin}/mural-global`
      : '';

  // Formateador de fechas a español
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
    if (!trimmed) return '';
    if (/^\d{4}$/.test(trimmed)) return trimmed;

    const parts = trimmed.split(/[-/T]/);
    if (parts.length >= 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const localDate = new Date(year, month, day);
      if (!isNaN(localDate.getTime())) {
        return localDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    }

    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const birthStr = formatDate(petData?.birth_date);
  const deathStr = formatDate(petData?.death_date);
  const datesStr =
    birthStr && deathStr
      ? `${birthStr} – ${deathStr}`
      : deathStr
      ? `${deathStr}`
      : birthStr
      ? `${birthStr}`
      : '';

  // =========================================================================
  // DESCARGA Y COMPARTICIÓN EN ALTA DEFINICIÓN (CANVAS 2D DETERMINISTA)
  // =========================================================================
  const handleDownloadFront = async () => {
    if (!petData) return;
    try {
      setIsExporting(true);
      const dataUrl = await generateFrontCardPng(petData, isShelterPet);
      const filename = `angeles-en-el-cielo-${nombre.toLowerCase().replace(/\s+/g, '-')}-recuerdo.png`;

      // Intentar compartir de forma nativa en móviles
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Retrato de ${nombre} · Ángeles en el Cielo`,
              text: `En memoria de mi ángel ${nombre} 🐾✨`,
            });
            showToast('¡Listo para compartir en tus redes! 🐾✨');
            setIsExporting(false);
            return;
          }
        } catch (shareErr) {
          console.log('Compartir nativo no disponible, descargando:', shareErr);
        }
      }

      // Descarga directa
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      showToast('¡Retrato celestial guardado en tu galería! 🐾✨');
    } catch (err) {
      console.error('Error exportando anverso:', err);
      showToast('No se pudo exportar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBack = async () => {
    if (!petData) return;
    try {
      setIsExporting(true);
      const dataUrl = await generateBackCardPng(petData, datesStr);
      const filename = `angeles-en-el-cielo-${nombre.toLowerCase().replace(/\s+/g, '-')}-dedicatoria.png`;

      // Intentar compartir de forma nativa en móviles
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Dedicatoria de ${nombre} · Ángeles en el Cielo`,
              text: `La historia de ${nombre} siempre en nuestros corazones 🐾✨`,
            });
            showToast('¡Listo para compartir en tus redes! 🐾✨');
            setIsExporting(false);
            return;
          }
        } catch (shareErr) {
          console.log('Compartir nativo no disponible, descargando:', shareErr);
        }
      }

      // Descarga directa
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      showToast('¡Dedicatoria guardada en tu galería! 🐾✨');
    } catch (err) {
      console.error('Error exportando reverso:', err);
      showToast('No se pudo exportar la dedicatoria. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Redes sociales
  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = `${nombre} siempre estará en nuestros corazones 🐾✨\nVisita su recuerdo eterno en el Mural de Ángeles:\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleShareInstagram = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      showToast('¡Enlace copiado! Ya puedes compartirlo en Instagram ✨');
    }
  };

  const handleShareTikTok = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      showToast('¡Enlace copiado! Pégalo en TikTok para compartir su recuerdo 🐾');
      window.open('https://www.tiktok.com', '_blank');
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showToast('¡Enlace copiado al portapapeles! 📋✨');
    }
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{
        background: 'rgba(25, 18, 38, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Toast flotante de retroalimentación */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] px-5 py-3 rounded-full bg-white text-[#BE185D] border-2 border-[#FBCFE8] shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <span>💖</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DEL MODAL */}
      <div
        className="relative w-full max-w-[860px] rounded-[32px] sm:rounded-[36px] border border-[#FCE7F3] p-5 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 my-auto overflow-hidden"
        style={{
          boxShadow: '0 24px 60px rgba(74,31,110,0.22), 0 0 30px rgba(255,255,255,0.40) inset',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. CAPA DE FONDO CELESTIAL REAL */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            backgroundImage: "url('/images/memorial/bg-memorial-heaven.webp')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* 2. VELO ROSADO CELESTIAL TRANSLÚCIDO (Permite apreciar con claridad las nubes y el cielo) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 245, 248, 0.45) 0%, rgba(253, 242, 248, 0.50) 50%, rgba(252, 231, 243, 0.55) 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />

        {/* Botón X de cerrar en la esquina del modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#BE185D] hover:text-[#9D174D] border border-[#FBCFE8] flex items-center justify-center transition-colors z-30 text-sm font-bold shadow-xs cursor-pointer"
          title="Cerrar"
        >
          ✕
        </button>

        {/* COLUMNA IZQUIERDA: TARJETA 3D MEMORIAL (ANVERSO / REVERSO) */}
        <div className="relative z-10 flex flex-col items-center justify-center shrink-0">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              position: 'relative',
              width: 360,
              height: 500,
              maxWidth: '100%',
              transform: 'scale(min(1, calc((100vw - 32px) / 360)))',
              transformOrigin: 'top center',
              marginBottom: 'calc((min(1, calc((100vw - 32px) / 360)) - 1) * 500px)',
              perspective: '1000px',
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {/* Div interior que rota 180° */}
            <div
              style={{
                position: 'relative',
                width: 360,
                height: 500,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                willChange: 'transform',
                flexShrink: 0,
              }}
            >
              {/* Cara Frontal (Anverso) */}
              <PetCardFront
                petData={petData}
                loading={loading}
                thumbnailUrl={thumbnailUrl}
                isShelterPet={isShelterPet}
                onClose={onClose}
                onFlip={() => setIsFlipped(!isFlipped)}
                frontRef={frontFaceRef}
              />

              {/* Cara Trasera (Reverso) */}
              <PetCardBack
                petData={petData}
                datesStr={datesStr}
                onClose={onClose}
                onFlip={() => setIsFlipped(!isFlipped)}
                backRef={backFaceRef}
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANELES DE ACCIÓN, COMPARTIR Y SOLIDARIDAD */}
        <div className="relative z-10 w-full md:w-[420px] flex flex-col items-center gap-4 shrink-0">
          {/* Panel solidario si es mascota de protectora */}
          {isShelterPet && (
            <PetCardSolidarityPanel
              isShelterPet={isShelterPet}
              isSponsored={isSponsored}
              matchedShelterPet={matchedShelterPet}
              sponsorName={sponsorName}
              memorialPetName={memorialPetName}
              onApadrinar={onApadrinar}
            />
          )}

          {/* Panel de compartir y descargas en alta resolución */}
          <PetCardSharePanel
            nombre={nombre}
            shareUrl={shareUrl}
            profileSlug={petData?.profile_slug}
            isExporting={isExporting}
            onDownloadFront={handleDownloadFront}
            onDownloadBack={handleDownloadBack}
            onShareWhatsApp={handleShareWhatsApp}
            onShareInstagram={handleShareInstagram}
            onShareTikTok={handleShareTikTok}
            onShareFacebook={handleShareFacebook}
            onCopyLink={handleCopyLink}
            copied={copied}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
