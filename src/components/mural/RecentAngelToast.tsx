'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RecentPet {
  id: string;
  pet_name: string;
  photo_url: string | null;
  profile_slug: string;
  plan_type: string;
  slot_assigned?: string | null;
  story_answers?: any;
}

interface RecentAngelToastProps {
  onSelectPet: (memorialId: string) => void;
}

export function RecentAngelToast({ onSelectPet }: RecentAngelToastProps) {
  const [pets, setPets] = useState<RecentPet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya lo cerró en esta sesión
    if (typeof window !== 'undefined' && sessionStorage.getItem('celestial-toast-dismissed') === 'true') {
      setIsDismissed(true);
      return;
    }

    const fetchRecentPets = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('memorials')
          .select('id, pet_name, photo_url, profile_slug, plan_type, slot_assigned, story_answers')
          .eq('publication_status', 'published')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data && data.length > 0) {
          setPets(data as RecentPet[]);
        }
      } catch (err) {
        console.error('Error fetching recent angels for toast:', err);
      }
    };

    fetchRecentPets();
  }, []);

  useEffect(() => {
    if (pets.length === 0 || isDismissed) return;

    let hideTimeout: NodeJS.Timeout;

    // Primer aviso tras 4 segundos de cortesía
    const showTimeout = setTimeout(() => {
      setIsVisible(true);

      // Ocultar tras 7 segundos visible
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    }, 4000);

    // Ciclo de rotación cada 26 segundos
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pets.length);
      setIsVisible(true);

      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    }, 26000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, [pets.length, isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('celestial-toast-dismissed', 'true');
    }
  };

  if (pets.length === 0 || isDismissed) return null;

  const currentPet = pets[currentIndex];
  if (!currentPet) return null;

  // Determinar si realmente es un Ángel Fundador (zona PREMIUM_ZONE x:476..523, y:479..520 o flag en story_answers)
  const isFounder = (() => {
    if (currentPet.story_answers?.isFounder || currentPet.story_answers?.founderBadge) return true;
    if (currentPet.slot_assigned) {
      const [x, y] = currentPet.slot_assigned.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y) && x >= 476 && x < 476 + 48 && y >= 479 && y < 479 + 42) {
        return true;
      }
    }
    return false;
  })();

  return (
    <>
      {/* 1. VISTA ESCRITORIO (TARJETA CRISTAL TRANSLÚCIDA CON BADGE DE FUNDADORES) */}
      <div 
        className={`hidden md:block fixed top-20 left-6 z-40 pointer-events-none transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div
          onClick={() => onSelectPet(currentPet.id)}
          className="pointer-events-auto w-[360px] rounded-2xl p-3.5 flex items-center gap-3 relative cursor-pointer group hover:scale-[1.02] transition-all shadow-[0_16px_40px_rgba(15,10,35,0.55),0_0_24px_rgba(251,191,36,0.30)]"
          style={{
            background: 'linear-gradient(135deg, rgba(32, 20, 64, 0.58) 0%, rgba(18, 12, 40, 0.48) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1.5px solid rgba(255, 215, 130, 0.45)',
          }}
          title="Toca para ver su estrella en el mural"
        >
          {/* Botón cerrar X translúcido */}
          <button
            onClick={handleDismiss}
            title="Cerrar aviso"
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white/90 text-xs font-bold flex items-center justify-center transition-colors border border-white/20"
          >
            ✕
          </button>

          {/* Avatar con Halo + Badge Oficial de Fundadores */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Foto circular */}
            <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.40)] bg-purple-950">
              <img 
                src={currentPet.photo_url || '/images/placeholders/first.webp'} 
                alt={currentPet.pet_name} 
                className="w-13 h-13 object-cover"
                style={{ width: 52, height: 52 }}
              />
            </div>

            {/* Badge Fundadores Oficial (solo si es fundador) */}
            {isFounder && (
              <div 
                className="absolute -bottom-1.5 -right-2 z-20 w-7 h-7 pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,200,60,0.85))' }}
              >
                <img 
                  src="/images/icons/Badgefundadores.svg" 
                  alt="Badge Fundador" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Halo celestial fino */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-2 rounded-full border border-amber-300 bg-amber-200/60 blur-[0.5px] z-20"></div>
          </div>

          {/* Textos descriptivos */}
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {isFounder ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-200 border border-amber-300/40">
                  <span>⭐ Ángel Fundador</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wider uppercase bg-purple-400/20 text-purple-200 border border-purple-300/40">
                  <span>✨ Nuevo Ángel</span>
                </span>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <h4 className="font-serif font-bold text-base text-white group-hover:text-amber-200 transition-colors truncate drop-shadow-sm leading-snug">
              {currentPet.pet_name}
            </h4>

            <p className="text-[11.5px] text-purple-200/90 font-medium leading-tight">
              Su luz ya brilla en el cielo
            </p>

            <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5 group-hover:translate-x-1 transition-transform">
              <span>Toca para ver su estrella</span>
              <span>›</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. VISTA MÓVIL (PÍLDORA CRISTAL TRANSLÚCIDA SUPERIOR) */}
      <div 
        className={`md:hidden fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[92%] max-w-[340px] transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div
          onClick={() => onSelectPet(currentPet.id)}
          className="pointer-events-auto rounded-full py-1.5 px-3 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all shadow-[0_12px_32px_rgba(15,10,35,0.50),0_0_18px_rgba(251,191,36,0.25)]"
          style={{
            background: 'linear-gradient(135deg, rgba(32, 20, 64, 0.62) 0%, rgba(18, 12, 40, 0.52) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1.5px solid rgba(255, 215, 130, 0.45)',
          }}
          title="Toca para ver su estrella en el mural"
        >
          {/* Avatar móvil + Badge Fundadores */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-300 bg-purple-950">
              <img 
                src={currentPet.photo_url || '/images/placeholders/first.webp'} 
                alt={currentPet.pet_name} 
                className="w-9 h-9 object-cover"
                style={{ width: 36, height: 36 }}
              />
            </div>
            {/* Badge Fundadores móvil (solo si es fundador) */}
            {isFounder && (
              <div 
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 drop-shadow-[0_0_5px_rgba(255,200,60,0.85)]"
                style={{ width: 18, height: 18 }}
              >
                <img 
                  src="/images/icons/Badgefundadores.svg" 
                  alt="Badge" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Texto móvil */}
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] text-white font-bold truncate leading-tight">
              ✨ <span className="text-amber-200">{currentPet.pet_name}</span> ya brilla
            </p>
            <p className="text-[10px] text-purple-200/90 font-medium">
              Toca para visitar su estrella ›
            </p>
          </div>

          {/* Botón cerrar móvil */}
          <button
            onClick={handleDismiss}
            title="Cerrar"
            className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white text-[10px] font-bold flex items-center justify-center shrink-0 border border-white/20"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
