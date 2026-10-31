'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import PostalStoryShareModal from '@/components/ui/PostalStoryShareModal';
import { MemorialHeroSection } from '@/components/memorial/MemorialHeroSection';
import { MemorialStorySection } from '@/components/memorial/MemorialStorySection';
import { MemorialMuralSection } from '@/components/memorial/MemorialMuralSection';
import { MemorialShareSection } from '@/components/memorial/MemorialShareSection';
import { MemorialClosingSection } from '@/components/memorial/MemorialClosingSection';

interface Memorial {
  id: string;
  pet_name: string;
  species: string;
  breed: string;
  birth_date: string;
  death_date: string;
  location: string;
  dedication: string;
  photo_url: string;
  plan_type: string;
  profile_slug: string;
  slot_assigned?: string;
  story_answers?: {
    socialHandle?: string;
    tiktok?: string;
    instagram?: string;
    [key: string]: any;
  };
}

interface MemorialClientProps {
  slug: string;
  initialMemorial?: Memorial | null;
  initialSlotCoords?: { x: number; y: number } | null;
}

export default function MemorialClient({
  slug,
  initialMemorial = null,
  initialSlotCoords = null,
}: MemorialClientProps) {
  const [memorial, setMemorial] = useState<Memorial | null>(initialMemorial);
  const [slotCoords, setSlotCoords] = useState<{ x: number; y: number } | null>(initialSlotCoords);
  const [loading, setLoading] = useState(!initialMemorial);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!initialMemorial) {
      loadMemorial();
    }
  }, [slug, initialMemorial]);

  const loadMemorial = async () => {
    const { data, error } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('profile_slug', slug)
      .eq('visibility', 'public')
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setMemorial(data);

    // Cargar coordenadas en el mural
    const { data: slot } = await supabase
      .from('mural_slots')
      .select('x, y')
      .eq('memorial_id', data.id)
      .order('x', { ascending: true })
      .order('y', { ascending: true })
      .limit(1)
      .single();

    if (slot) {
      setSlotCoords(slot as { x: number; y: number });
    } else if (data.slot_assigned && data.slot_assigned.includes(',')) {
      const [x, y] = data.slot_assigned.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        setSlotCoords({ x, y });
      }
    }

    setLoading(false);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const trimmed = String(dateStr).trim();
    if (!trimmed) return null;

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
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return trimmed;
  };

  const birthDateFormatted = formatDate(memorial?.birth_date);
  const deathDateFormatted = formatDate(memorial?.death_date);

  const datesText =
    birthDateFormatted && deathDateFormatted
      ? `${birthDateFormatted} — ${deathDateFormatted}`
      : deathDateFormatted
      ? `${deathDateFormatted}`
      : birthDateFormatted
      ? `${birthDateFormatted}`
      : null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform: string) => {
    const text = `${memorial?.pet_name || 'Mi Ángel'} siempre estará en nuestros corazones 🐾✨\nVisita su recuerdo en el Mural de Ángeles:\n${shareUrl}`;
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] font-sans text-2xl text-[#4A3F6B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#EC6F9B] border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse text-lg font-medium text-[#7B6F9A]">Cargando recuerdo celestial... ✨</p>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] text-center p-8 font-sans">
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="text-[#4A3F6B] text-2xl md:text-3xl font-bold mb-3">Este recuerdo no existe</h1>
        <p className="text-[#7B6F9A] text-sm max-w-md mb-6">
          El perfil que estás buscando no está disponible o está configurado como privado.
        </p>
        <Link
          href="/mural-global"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          Ir al Mural Global 🐾
        </Link>
      </div>
    );
  }

  const muralUrl = slotCoords
    ? `/mural-global?highlight=${slotCoords.x},${slotCoords.y}&zoom=true`
    : memorial.slot_assigned
    ? `/mural-global?highlight=${memorial.slot_assigned}&zoom=true`
    : `/mural-global`;

  // Cita breve para el Hero: primer párrafo o recorte elegante
  const shortQuote = memorial.dedication
    ? memorial.dedication.split('\n')[0].slice(0, 180)
    : 'Siempre serás mi lugar favorito en el mundo.';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FFFBF4] text-[#3B2D54] font-sans antialiased relative selection:bg-purple-200">
      {/* Fuentes oficiales: Allura y Playfair Display */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Allura&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&family=Nunito+Sans:wght@400;600;700&display=swap"
      />

      {/* SECCIÓN 01 — HERO CELESTIAL CON HEADER INTEGRADO */}
      <MemorialHeroSection
        petName={memorial.pet_name}
        photoUrl={memorial.photo_url}
        datesText={datesText}
        shortQuote={shortQuote}
        muralUrl={muralUrl}
      />

      {/* SECCIÓN 02 — SU HISTORIA */}
      <MemorialStorySection
        petName={memorial.pet_name}
        dedication={memorial.dedication}
      />

      {/* SECCIÓN 03 — SU LUZ EN EL MURAL */}
      <MemorialMuralSection muralUrl={muralUrl} />

      {/* SECCIÓN 04 — COMPARTE SU RECUERDO */}
      <MemorialShareSection
        onOpenStoryModal={() => setIsShareModalOpen(true)}
        onShareWhatsApp={() => handleShare('whatsapp')}
        onShareFacebook={() => handleShare('facebook')}
        onCopyLink={() => handleShare('copy')}
        copied={copied}
      />

      {/* SECCIÓN 05 — CIERRE Y FIRMA OFICIAL */}
      <MemorialClosingSection />

      {/* Modal Viral de Compartir Story / Postal */}
      {memorial && (
        <PostalStoryShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          petName={memorial.pet_name}
          photoUrl={memorial.photo_url}
          birthDate={memorial.birth_date}
          deathDate={memorial.death_date}
          dedication={memorial.dedication}
          socialHandle={
            memorial.story_answers?.tiktok ||
            memorial.story_answers?.socialHandle ||
            memorial.story_answers?.instagram
          }
          planType={memorial.plan_type}
          memorialUrl={shareUrl}
        />
      )}
    </div>
  );
}
