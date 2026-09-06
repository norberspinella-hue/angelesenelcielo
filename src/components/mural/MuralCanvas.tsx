'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useMuralViewport } from '@/hooks/useMuralViewport';
import { getVisibleRange, getSlotSize, screenToGrid, PREMIUM_ZONE, PREMIUM_ZONE as PZ, BASE_SLOT } from '@/lib/mural/gridMath';
import { generateSeedSlots } from '@/lib/mural/mockSeed';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const imageCache = new Map<string, HTMLImageElement>()
const MAX_CACHE = 500
const loadingSet = new Set<string>()
const MAX_CONCURRENT = 8

const loadImage = (url: string, onLoad: () => void): HTMLImageElement | null => {
  if (imageCache.has(url)) return imageCache.get(url)!
  if (loadingSet.size >= MAX_CONCURRENT) return null
  if (loadingSet.has(url)) return null
  
  loadingSet.add(url)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    if (imageCache.size >= MAX_CACHE) {
      const firstKey = imageCache.keys().next().value
      if (firstKey) imageCache.delete(firstKey)
    }
    imageCache.set(url, img)
    loadingSet.delete(url)
    onLoad()
  }
  img.onerror = () => loadingSet.delete(url)
  img.src = url
  return null
}

interface PetProfileCardProps {
  memorialId: string;
  planType: string;
  thumbnailUrl: string;
  onClose: () => void;
}

function PetProfileCard({ memorialId, planType, thumbnailUrl, onClose }: PetProfileCardProps) {
  const [petData, setPetData] = useState<{ pet_name: string; photo_url: string; plan_type: string; profile_slug?: string | null; slots_count?: number | null; birth_date?: string | null; death_date?: string | null; dedication?: string | null } | null>(null);
  const [slotData, setSlotData] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const frontFaceRef = useRef<HTMLDivElement>(null);
  const backFaceRef = useRef<HTMLDivElement>(null);

  const handleDownloadFront = async () => {
    if (!frontFaceRef.current) return;
    const { toPng } = await import('html-to-image');

    const dataUrl = await toPng(frontFaceRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      width: 360,
      height: 500,
      style: {
        transform: 'none',
        width: '360px',
        height: '500px',
        maxWidth: '360px',
        minWidth: '360px',
        visibility: 'visible',
        backfaceVisibility: 'visible',
      },
      filter: (node: HTMLElement) => {
        if (node?.getAttribute?.('data-download-ignore') === 'true') {
          return false;
        }
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = `${petData?.pet_name || 'angelito'}-recuerdo.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadBack = async () => {
    if (!backFaceRef.current) return;
    const { toPng } = await import('html-to-image');

    const dataUrl = await toPng(backFaceRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      width: 360,
      height: 500,
      style: {
        transform: 'none',
        width: '360px',
        height: '500px',
        maxWidth: '360px',
        minWidth: '360px',
        visibility: 'visible',
        backfaceVisibility: 'visible',
      },
      filter: (node: HTMLElement) => {
        if (node?.getAttribute?.('data-download-ignore') === 'true') {
          return false;
        }
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = `${petData?.pet_name || 'angelito'}-dedicatoria.png`;
    link.href = dataUrl;
    link.click();
  };

  useEffect(() => {
    setMounted(true);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('memorials')
          .select('pet_name, photo_url, plan_type, profile_slug, slots_count, birth_date, death_date, dedication')
          .eq('id', memorialId)
          .single();
        
        if (error) {
          console.error('Error fetching pet profile:', error);
        } else if (data) {
          setPetData(data);
        }

        const { data: slot } = await supabase
          .from('mural_slots')
          .select('x, y')
          .eq('memorial_id', memorialId)
          .order('x', { ascending: true })
          .order('y', { ascending: true })
          .limit(1)
          .single();

        if (slot) {
          setSlotData(slot as { x: number; y: number });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (memorialId) {
      fetchPetData();
    }
  }, [memorialId]);

  const nombre = petData?.pet_name || 'Ángel';
  const foto = petData?.photo_url || thumbnailUrl || '/images/placeholders/first.webp';
  const plan = petData?.plan_type || planType;

  const shareUrl = typeof window !== 'undefined'
    ? petData?.profile_slug
      ? `${window.location.origin}/memorial/${petData.profile_slug}`
      : slotData
        ? `${window.location.origin}/mural-global?highlight=${slotData.x},${slotData.y}&zoom=true`
        : `${window.location.origin}/mural-global`
    : '';

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
          year: 'numeric' 
        });
      }
    }

    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const birthStr = formatDate(petData?.birth_date);
  const deathStr = formatDate(petData?.death_date);

  const datesStr = birthStr && deathStr 
    ? `${birthStr} – ${deathStr}` 
    : deathStr 
      ? `${deathStr}` 
      : birthStr 
        ? `${birthStr}` 
        : '';

  const slotsCount = petData?.slots_count ||
    (planType === 'recuerdo_eterno' ? 9 : 
     planType === 'estrella_anual' ? 4 : 1);

  // Render plan badge conditionally
  const planBadgeSrc = 
    petData?.plan_type === 'recuerdo_eterno' 
      ? '/images/icons/plans/icon-plan-eterno.svg'
      : petData?.plan_type === 'estrella_anual'
      ? '/images/icons/plans/icon-plan-estrella.svg'
      : '/images/icons/plans/icon-plan-inicial.svg';

  // Handle closing modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.50)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '24px 10px 48px',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div 
        style={{
          margin: 'auto 0',
          width: 'min(360px, calc(100vw - 20px))',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        
        {/* CONTENEDOR 3D FLIP CARD */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            position: 'relative',
            width: 360,
            height: 500,
            maxWidth: '100%',
            transform: 'scale(min(1, calc((100vw - 20px) / 360)))',
            transformOrigin: 'top center',
            marginBottom: 'calc((min(1, calc((100vw - 20px) / 360)) - 1) * 500px)',
            perspective: '1000px',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {/* DIV INTERIOR QUE ROTA */}
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
            {/* CARA FRONTAL — EL RECUERDO */}
            <div 
              ref={frontFaceRef}
              className="rounded-[24px] border-[2.5px] border-white/95 shadow-[0_12px_40px_rgba(100,70,150,0.18)] flex flex-col"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 360,
                height: 500,
                overflow: 'hidden',
                backgroundImage: "url('/images/mural-preview/profilecard-front.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {/* 1. Botón X de cerrar */}
              <button
                data-download-ignore="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.85)',
                  color: '#4A3F6B',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  zIndex: 30,
                }}
              >
                ✕
              </button>

              {/* CABECERA: MI ANGELITO CURVADO EN ARCO */}
              <div 
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <svg width="260" height="38" viewBox="0 0 260 38" fill="none" style={{ overflow: 'visible' }}>
                  <path id="archTextPath" d="M 20,32 Q 130,8 240,32" fill="none" />
                  <text 
                    fill="#584582" 
                    fontFamily="Georgia, serif" 
                    fontSize="21" 
                    fontWeight="700" 
                    letterSpacing="3" 
                    textAnchor="middle"
                  >
                    <textPath href="#archTextPath" startOffset="50%">
                      MI ANGELITO
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* RESPLANDOR CENTRAL DE CONTRALUZ (AURA BLANCA-DORADA) */}
              <div 
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '300px',
                  height: '130px',
                  background: 'radial-gradient(ellipse at center, rgba(255, 253, 240, 0.85) 0%, rgba(255, 245, 215, 0.50) 45%, rgba(255, 240, 195, 0) 80%)',
                  filter: 'blur(12px)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }} 
              />

              {/* ELEMENTO 1: NOMBRE DE LA MASCOTA */}
              <h3 
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: 72,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  zIndex: 10,
                  color: '#C29028',
                  filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.70)) drop-shadow(0 2px 4px rgba(110,70,15,0.30))',
                  padding: '0 16px',
                  margin: 0,
                  transform: 'translateZ(1px)',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {loading ? '' : (petData?.pet_name || '')}
              </h3>

              {/* CORAZÓN DORADO 3D */}
              <div
                style={{
                  position: 'absolute',
                  top: '130px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg 
                  width="15" 
                  height="15" 
                  viewBox="0 0 24 24" 
                  style={{
                    filter: 'drop-shadow(0 1.5px 2px rgba(100,60,10,0.45)) drop-shadow(0 0 4px rgba(255,245,200,0.60))',
                  }}
                >
                  <defs>
                    <radialGradient id="heartGold3D" cx="38%" cy="32%" r="68%" fx="35%" fy="28%">
                      <stop offset="0%" stopColor="#FFFBE6" />
                      <stop offset="30%" stopColor="#F5D06A" />
                      <stop offset="70%" stopColor="#C29028" />
                      <stop offset="100%" stopColor="#7D4E08" />
                    </radialGradient>
                  </defs>
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill="url(#heartGold3D)" 
                  />
                </svg>
              </div>

              {/* ELEMENTO 2: HALO CELESTIAL FINO Y RADIANTE */}
              <div 
                style={{
                  position: 'absolute',
                  top: '155px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '121px',
                  height: '32px',
                  zIndex: 7,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 220 70" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <filter id="haloCelestialGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur1" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="haloGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFA000" stopOpacity="1.0" />
                      <stop offset="20%" stopColor="#FFD54F" stopOpacity="1.0" />
                      <stop offset="50%" stopColor="#FFF9C4" stopOpacity="1.0" />
                      <stop offset="80%" stopColor="#FFD54F" stopOpacity="1.0" />
                      <stop offset="100%" stopColor="#FFA000" stopOpacity="1.0" />
                    </linearGradient>
                  </defs>

                  {/* 1. Aura difusa dorada exterior */}
                  <ellipse 
                    cx="110" 
                    cy="35" 
                    rx="95" 
                    ry="24" 
                    stroke="#FFD54F" 
                    strokeWidth="8" 
                    opacity="0.85" 
                    filter="url(#haloCelestialGlow)" 
                  />

                  {/* 2. Cuerpo del anillo dorado */}
                  <ellipse 
                    cx="110" 
                    cy="35" 
                    rx="95" 
                    ry="24" 
                    stroke="url(#haloGoldGradient)" 
                    strokeWidth="4.2" 
                    opacity="1.0" 
                    filter="drop-shadow(0 0 5px #FFD54F)" 
                  />

                  {/* 3. Filamento incandescente blanco puro en el núcleo */}
                  <ellipse 
                    cx="110" 
                    cy="35" 
                    rx="95" 
                    ry="24" 
                    stroke="#FFFFFF" 
                    strokeWidth="2.4" 
                    opacity="0.98" 
                    filter="drop-shadow(0 0 3px #FFFFFF)" 
                  />
                </svg>
              </div>

              {/* ICONO DEL PLAN */}
              {planBadgeSrc && (
                <img
                  src={planBadgeSrc}
                  alt="Plan"
                  style={{
                    position: 'absolute',
                    top: 322,
                    left: 189,
                    width: 72,
                    height: 72,
                    zIndex: 8,
                  }}
                />
              )}

              {/* ELEMENTO 3: FOTO CIRCULAR */}
              <div 
                style={{
                  position: 'absolute',
                  top: '190px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid rgba(201,169,97,0.70)',
                  boxShadow: '0 0 24px rgba(201,169,97,0.35)',
                  backgroundColor: 'white',
                  zIndex: 5,
                }}
              >
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div 
                      style={{
                        border: '4px solid #C9A961',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        animation: 'spin 0.8s linear infinite',
                      }} 
                    />
                  </div>
                ) : (
                  <img 
                    src={petData?.photo_url || thumbnailUrl || '/images/placeholders/first.webp'} 
                    alt={petData?.pet_name || 'Ángel'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
              </div>

              {/* CIERRE INFERIOR */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 20px',
                }}
              >
                <p 
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '18.5px',
                    color: '#584582',
                    margin: '0 0 12px 0',
                    lineHeight: 1.35,
                    fontSynthesis: 'none',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Siempre serás mi</span>
                  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>lugar favorito en el mundo</span>
                </p>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#584582',
                    opacity: 0.9,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Ángeles en el Cielo</span>
                </div>
              </div>

              {/* Botón girar flip */}
              <div
                data-download-ignore="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#C9B8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 30,
                  boxShadow: '0 2px 8px rgba(100,70,150,0.25)',
                }}
              >
                {!isFlipped ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" 
                       fill="none" stroke="white" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5"/>
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" 
                       fill="none" stroke="white" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 10L20 15l-5 5"/>
                    <path d="M20 15H9.5a5.5 5.5 0 0 1 0-11H13"/>
                  </svg>
                )}
              </div>
            </div>

            {/* CARA TRASERA — REVERSO */}
            <div 
              ref={backFaceRef}
              className="rounded-[24px] border-[2.5px] border-white/95 shadow-[0_12px_40px_rgba(100,70,150,0.18)] flex flex-col"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 360,
                height: 500,
                overflow: 'hidden',
                background: "url('/images/mural-preview/profilecard-back.webp') no-repeat center center / cover",
                backgroundColor: '#f5e8ff',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                boxSizing: 'border-box',
                padding: '20px 24px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'center',
              }}
            >
              {/* Icono Logoheart.svg */}
              <img 
                src="/images/icons/Logoheart.svg"
                alt=""
                style={{ width: 108, height: 108, marginBottom: 8 }}
              />

              {/* Título */}
              <h3 style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '18px',
                fontWeight: 700,
                color: '#4A3F6B',
                marginBottom: '4px',
                margin: 0,
              }}>
                Historia de amor
              </h3>

              {/* Fechas en formato completo en español */}
              {datesStr && (
                <p style={{
                  fontSize: '12px',
                  color: '#8A7B9B',
                  fontFamily: 'sans-serif',
                  fontWeight: 600,
                  margin: '0 0 10px 0',
                  lineHeight: 1.4,
                  textAlign: 'center',
                }}>
                  {datesStr}
                </p>
              )}

              {/* Dedicatoria */}
              <div 
                style={{
                  fontSize: '14px',
                  color: '#7B6F9A',
                  lineHeight: 1.7,
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  borderLeft: '3px solid rgba(236,111,163,0.40)',
                  paddingLeft: '16px',
                  textAlign: 'left',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                className="scrollbar-none"
              >
                {petData?.dedication || 'Sin dedicatoria'}
              </div>

              {/* Texto Siempre en nuestro corazón */}
              <p style={{
                fontSize: 12,
                color: 'rgba(155,143,176,0.80)',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                marginTop: 12,
                textAlign: 'center',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                — Siempre en nuestro corazón
                <img 
                  src="/images/icons/plans/pawrosa.svg"
                  alt=""
                  style={{ width: '16px', height: '16px', opacity: 0.70 }}
                />
              </p>

              {/* Icono girar lila */}
              <div
                data-download-ignore="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#C9B8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 30,
                  boxShadow: '0 2px 8px rgba(100,70,150,0.25)',
                }}
              >
                {!isFlipped ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" 
                       fill="none" stroke="white" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5"/>
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="white" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 10L20 15l-5 5"/>
                    <path d="M20 15H9.5a5.5 5.5 0 0 1 0-11H13"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 2 — COMPARTIR */}
        <div 
          className="rounded-[24px] border border-[rgba(255,255,255,0.65)] shadow-[0_12px_40px_rgba(30,10,50,0.15)] p-4 sm:p-[24px_20px] flex flex-col items-center overflow-hidden w-full max-w-[360px]"
          style={{
            width: 'min(360px, calc(100vw - 20px))',
            position: 'relative',
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(255, 230, 235, 0.85) 0%, rgba(250, 200, 215, 0.85) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >


          <h4 className="font-serif font-bold text-[18px] text-[#4A3F6B] m-0 mb-[6px] text-center">
            Haz que su recuerdo siga brillando
          </h4>
          
          <p className="text-[12px] text-[#7B6F9A] m-0 mb-5 text-center leading-[1.4] font-sans">
            Comparte a {nombre} y ayuda a que su luz llegue a más personas. ✨
          </p>

          {/* Botones de descarga */}
          <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 16 }}>
            <button
              onClick={handleDownloadFront}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
                border: '1px solid rgba(255, 255, 255, 0.40)',
                borderRadius: 999,
                padding: '11px 16px',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'sans-serif',
                boxShadow: '0 4px 14px rgba(244, 114, 182, 0.40)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Recuerdo
            </button>
            <button
              onClick={handleDownloadBack}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                background: 'linear-gradient(135deg, #C084FC 0%, #A855F7 100%)',
                border: '1px solid rgba(255, 255, 255, 0.40)',
                borderRadius: 999,
                padding: '11px 16px',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'sans-serif',
                boxShadow: '0 4px 14px rgba(192, 132, 252, 0.40)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Dedicatoria
            </button>
          </div>

          {/* Botones sociales */}
          <div className="flex gap-5 w-full justify-center">
            
            {/* WhatsApp */}
            <div 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const text = `${petData?.pet_name || 'Ángel'} siempre estará en nuestros corazones 🐾\nVisita su recuerdo eterno en el Mural de Ángeles:\n${shareUrl}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white bg-[#25D366] shadow-[0_8px_20px_rgba(37,211,102,0.35)]">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
              </div>
              <span className="text-[11px] text-[#4A3F6B] font-medium font-sans">WhatsApp</span>
            </div>

            {/* Instagram */}
            <div 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Enlace copiado. ¡Compártelo en Instagram!');
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div 
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(220,39,67,0.35)]"
                style={{
                  background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="white" strokeWidth="2.2"/>
                  <circle cx="12" cy="12" r="4.4" stroke="white" stroke-width="2.2"/>
                  <circle cx="17.3" cy="6.7" r="1.3" fill="white"/>
                </svg>
              </div>
              <span className="text-[11px] text-[#4A3F6B] font-medium font-sans">Instagram</span>
            </div>

            {/* TikTok */}
            <div 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(shareUrl);
                  alert('¡Enlace copiado! Pégalo en TikTok para compartir el recuerdo de tu mascota 🐾');
                  window.open('https://www.tiktok.com', '_blank');
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div 
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white bg-[#000000] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.78a4.85 4.85 0 0 1-1.03-.09z"/>
                </svg>
              </div>
              <span className="text-[10px] text-[#9B8FB0] font-medium font-sans">TikTok</span>
            </div>

            {/* Facebook */}
            <div 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white bg-[#1877F2] shadow-[0_8px_20px_rgba(24,119,242,0.35)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03.3-2 2-2h1.5V1.5c-.3-.04-1.2-.1-2.5-.1-2.6 0-4.5 1.6-4.5 4.5v3.1H7v4h3.5V22h3.5V13.5z" fill="white"/>
                </svg>
              </div>
              <span className="text-[11px] text-[#4A3F6B] font-medium font-sans">Facebook</span>
            </div>

            {/* Copiar enlace */}
            <div 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Enlace copiado al portapapeles');
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div 
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <span className="text-[11px] text-[#4A3F6B] font-medium font-sans">Copiar enlace</span>
            </div>

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

interface MuralCanvasProps {
  onSelectSlot?: (slot: { col: number; row: number; isPremiumSlot: boolean }) => void;
  selectedSlot?: { col: number; row: number } | null;
  onZoomChange?: (zoom: number) => void;
  highlightedMemorialId?: string | null;
}

export interface MuralCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerPremium: () => void;
  centerOnSlot: (x: number, y: number) => void;
  zoomToSlot: (x: number, y: number) => void;
}

export const MuralCanvas = forwardRef<MuralCanvasRef, MuralCanvasProps>(({ 
  onSelectSlot, 
  selectedSlot, 
  onZoomChange,
  highlightedMemorialId 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    viewport,
    setViewport,
    updateViewportSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    zoomIn,
    zoomOut,
    centerOnCoord,
    isPinching,
    hasMovedSignificantly
  } = useMuralViewport();

  // Attach native touch event listeners for pinch-to-zoom on mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => handleTouchStart(e, canvas.getBoundingClientRect());
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e, canvas.getBoundingClientRect());
    const onTouchEnd = (e: TouchEvent) => handleTouchEnd(e);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Track pointer down to differentiate click from drag
  const [pointerDownPos, setPointerDownPos] = useState<{ x: number; y: number } | null>(null);
  const [showPremiumBadge, setShowPremiumBadge] = useState(true);

  // Sync calculations for HTML overlays
  const slotSizeScreen = getSlotSize(viewport.zoom);
  const premiumCenterX = viewport.x + (PZ.x + PZ.w / 2) * slotSizeScreen;
  const premiumCenterY = viewport.y + (PZ.y + PZ.h / 2) * slotSizeScreen;

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setPointerDownPos({ x: e.clientX, y: e.clientY });
    handlePointerDown(e);
  };

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    centerPremium: () => centerOnCoord(PZ.x + PZ.w / 2, PZ.y + PZ.h / 2, 1),
    centerOnSlot: (x: number, y: number) => {
      const slotSize = BASE_SLOT * viewport.zoom
      setViewport(prev => ({
        ...prev,
        x: viewport.width / 2 - x * slotSize,
        y: viewport.height / 2 - y * slotSize,
      }))
    },
    zoomToSlot: (x: number, y: number) => {
      const targetZoom = 2.5
      const startZoom = viewport.zoom
      const startX = viewport.x
      const startY = viewport.y
      const endX = viewport.width / 2 - x * BASE_SLOT * targetZoom
      const endY = viewport.height / 2 - y * BASE_SLOT * targetZoom
      const duration = 600
      const start = performance.now()

      const animate = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)

        setViewport(prev => ({
          ...prev,
          zoom: startZoom + (targetZoom - startZoom) * ease,
          x: startX + (endX - startX) * ease,
          y: startY + (endY - startY) * ease,
        }))

        if (progress < 1) requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }
  }));

  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(viewport.zoom);
    }
  }, [viewport.zoom, onZoomChange]);

  const [seedMap] = useState(() => generateSeedSlots(50000)); // 50k initial slots
  const [realSlotsMap, setRealSlotsMap] = useState<Map<string, any>>(new Map());
  const [showPetProfile, setShowPetProfile] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Cargar los slots reales ocupados desde Supabase
  useEffect(() => {
    const loadOccupiedSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('mural_slots')
          .select('x, y, plan_type, memorial_id, thumbnail_url')
          .eq('status', 'occupied');
        
        if (error) {
          console.error('Error cargando slots:', error);
          return;
        }
        
        if (data) {
          // 1. Agrupar por memorial_id para encontrar el slot de origen (x mínimo y y mínimo)
          const minsMap = new Map<string, { minX: number; minY: number }>();
          data.forEach((slot: any) => {
            if (!slot.memorial_id) return;
            const current = minsMap.get(slot.memorial_id);
            if (!current) {
              minsMap.set(slot.memorial_id, { minX: slot.x, minY: slot.y });
            } else {
              current.minX = Math.min(current.minX, slot.x);
              current.minY = Math.min(current.minY, slot.y);
            }
          });

          // 2. Poblar el mapa realSlots directamente usando las celdas de la base de datos
          const realSlots = new Map<string, any>();
          data.forEach((slot: any) => {
            const key = `${slot.x},${slot.y}`;
            const mins = slot.memorial_id ? minsMap.get(slot.memorial_id) : null;
            const isMain = mins ? (slot.x === mins.minX && slot.y === mins.minY) : true;
            
            realSlots.set(key, {
              status: 'occupied',
              plan_type: slot.plan_type,
              memorial_id: slot.memorial_id,
              thumbnail_url: slot.thumbnail_url,
              isMainSlot: isMain,
              x: slot.x,
              y: slot.y
            });
          });
          setRealSlotsMap(realSlots);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    loadOccupiedSlots();
  }, []);

  // Observe container resizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        updateViewportSize(rect.width, rect.height);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          updateViewportSize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    obs.observe(el);

    return () => {
      window.removeEventListener('resize', measure);
      obs.disconnect();
    };
  }, [updateViewportSize]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const img1 = new window.Image();
    img1.src = '/images/icons/butterfly1.svg';
    const img2 = new window.Image();
    img2.src = '/images/icons/butterfly2.svg';

    const butterflies: any[] = Array.from({length: 10}).map((_, i) => ({
      x: Math.random() * 2000, // Initial random x
      y: Math.random() * 1500, // Initial random y
      vX: (Math.random() - 0.5) * 0.5,
      vY: -Math.random() * 0.5 - 0.5,
      life: Math.random() * 400,
      maxLife: 300 + Math.random() * 200,
      size: Math.random() * 15 + 25, // 25px to 40px
      img: i % 2 === 0 ? img1 : img2,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02
    }));

    const pzButterflies: any[] = Array.from({length: 10}).map((_, i) => ({
      gX: Math.random() * PZ.w,
      gY: Math.random() * PZ.h,
      vX: (Math.random() - 0.5) * 0.03,
      vY: -Math.random() * 0.05 - 0.02,
      life: Math.random() * 200,
      maxLife: 150 + Math.random() * 100,
      size: Math.random() * 2 + 1.5,
      img: i % 2 === 0 ? img1 : img2,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.05 + Math.random() * 0.05
    }));

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.floor(viewport.width * dpr);
      const targetHeight = Math.floor(viewport.height * dpr);

      // Only resize the canvas buffer when size actually changes (prevents 60fps GPU texture re-allocations)
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.scale(dpr, dpr);
      } else {
        ctx.clearRect(0, 0, viewport.width, viewport.height);
      }

      const slotSize = getSlotSize(viewport.zoom);
      const gap = Math.max(0.5, slotSize * 0.08);
      const cell = slotSize - gap;

      const range = getVisibleRange(viewport);

      // Helper for rounded rects
      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        r = Math.max(0, Math.min(r, w/2, h/2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
      };

      // Draw premium zone frame
      const px = viewport.x + PZ.x * slotSize;
      const py = viewport.y + PZ.y * slotSize;
      const pw = PZ.w * slotSize;
      const ph = PZ.h * slotSize;

      // Premium slots gradient (covers the whole premium zone)
      const premiumGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
      premiumGrad.addColorStop(0, 'rgba(255, 208, 170, 0.25)'); // #FFD0AA
      premiumGrad.addColorStop(1, 'rgba(255, 182, 186, 0.25)'); // #FFB6BA
      
      const premiumGradStroke = ctx.createLinearGradient(px, py, px + pw, py + ph);
      premiumGradStroke.addColorStop(0, 'rgba(255, 208, 170, 0.65)'); 
      premiumGradStroke.addColorStop(1, 'rgba(255, 182, 186, 0.65)'); 

      // Marco exterior coral pulsante
      const time = Date.now() / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.2);
      ctx.shadowBlur = 20 + pulse * 15;
      ctx.shadowColor = 'rgba(255, 192, 163, 0.8)';
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.80 + pulse * 0.20})`;
      ctx.lineWidth = 3;
      rr(px, py, pw, ph, 12);
      ctx.stroke();

      // Marco interior fino blanco con resplandor coral
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 192, 163, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.lineWidth = 1;
      rr(px + 5, py + 5, pw - 10, ph - 10, 10);
      ctx.stroke();
      
      // Reset shadow for slots
      ctx.shadowBlur = 0;

      // Draw slots
      for (let row = range.rowStart; row <= range.rowEnd; row++) {
        for (let col = range.colStart; col <= range.colEnd; col++) {
          const sx = viewport.x + col * slotSize;
          const sy = viewport.y + row * slotSize;
          const key = `${col},${row}`;
          const seeded = seedMap.get(key);
          const isSelected = selectedSlot?.col === col && selectedSlot?.row === row;
          const isPremium = col >= PZ.x && col < PZ.x + PZ.w && row >= PZ.y && row < PZ.y + PZ.h;
          const radius = Math.max(1, cell * 0.15);
          const realSlot = realSlotsMap.get(key);

          if (isSelected) {
            ctx.fillStyle = 'rgba(255,220,80,0.9)';
            ctx.strokeStyle = '#C0A020';
            ctx.lineWidth = 1;
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            ctx.stroke();
          } else if (realSlot) {
            const thumbnailUrl = realSlot.thumbnail_url;
            const isMainSlot = realSlot.isMainSlot;

            if (thumbnailUrl && !isMainSlot) {
              // slot cubierto por la foto del principal
              // no hacer nada en absoluto
            } else {
              let imageDrawn = false;

              const planSize = 
                realSlot.plan_type === 'recuerdo_eterno' ? 3 :
                realSlot.plan_type === 'estrella_anual' ? 2 : 1;

              if (thumbnailUrl && isMainSlot) {
                const img = loadImage(thumbnailUrl, () => {
                  requestAnimationFrame(render);
                });
                if (img) {
                  const fullSize = slotSize * planSize;
                  ctx.save();
                  ctx.beginPath();
                  const radius = Math.max(2, fullSize * 0.08);
                  ctx.moveTo(sx + radius, sy);
                  ctx.lineTo(sx + fullSize - radius, sy);
                  ctx.arcTo(sx + fullSize, sy, sx + fullSize, sy + radius, radius);
                  ctx.lineTo(sx + fullSize, sy + fullSize - radius);
                  ctx.arcTo(sx + fullSize, sy + fullSize, sx + fullSize - radius, sy + fullSize, radius);
                  ctx.lineTo(sx + radius, sy + fullSize);
                  ctx.arcTo(sx, sy + fullSize, sx, sy + fullSize - radius, radius);
                  ctx.lineTo(sx, sy + radius);
                  ctx.arcTo(sx, sy, sx + radius, sy, radius);
                  ctx.closePath();
                  ctx.clip();
                  ctx.drawImage(img, sx, sy, fullSize, fullSize);
                  ctx.restore();

                  const isHighlighted = realSlot?.memorial_id === highlightedMemorialId;
                  if (isHighlighted) {
                    ctx.save();
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = 'rgba(255,220,60,0.95)';
                    ctx.strokeStyle = 'rgba(255,220,60,1)';
                    ctx.lineWidth = 3;
                    rr(sx, sy, fullSize, fullSize, radius);
                    ctx.stroke();
                    ctx.restore();
                  }

                  imageDrawn = true;
                }
              }

              if (!imageDrawn) {
                if (realSlot.plan_type === 'recuerdo_eterno') {
                  ctx.fillStyle = 'rgba(201,169,97,0.85)';
                } else if (realSlot.plan_type === 'estrella_anual') {
                  ctx.fillStyle = 'rgba(180,140,220,0.85)';
                } else {
                  ctx.fillStyle = 'rgba(236,111,163,0.85)';
                }
                rr(sx, sy, cell, cell, radius);
                ctx.fill();

                const isHighlighted = realSlot?.memorial_id === highlightedMemorialId;
                if (isHighlighted) {
                  ctx.save();
                  ctx.shadowBlur = 20;
                  ctx.shadowColor = 'rgba(255,220,60,0.95)';
                  ctx.strokeStyle = 'rgba(255,220,60,1)';
                  ctx.lineWidth = 3;
                  rr(sx, sy, cell, cell, radius);
                  ctx.stroke();
                  ctx.restore();
                }
              }

              if (slotSize > 4) {
                if (thumbnailUrl && isMainSlot) {
                  const fullSize = slotSize * planSize;
                  const radius = Math.max(2, fullSize * 0.08);
                  rr(sx, sy, fullSize, fullSize, radius);
                } else {
                  rr(sx, sy, cell, cell, radius);
                }
                ctx.strokeStyle = realSlot.plan_type === 'recuerdo_eterno' ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          } else if (isPremium) {
            const phase = (col * 7 + row * 13) % (Math.PI * 2);
            const glowIntensity = 0.6 + 0.4 * Math.sin(Date.now() / 1500 + phase);
            
            ctx.fillStyle = premiumGrad;
            ctx.strokeStyle = premiumGradStroke;
            ctx.lineWidth = 0.8;

            if (!showPremiumBadge) {
              ctx.shadowBlur = 10 + glowIntensity * 8;
              ctx.shadowColor = 'rgba(255, 192, 163, 0.75)';
            }
            
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            if (slotSize > 4) ctx.stroke();
            
            ctx.shadowBlur = 0;
          } else if (seeded) {
            // Verificar si está dentro del bloque de una mascota real
            const isInsideRealBlock = (() => {
              let inside = false;
              realSlotsMap.forEach((v, k) => {
                if (inside || !v.isMainSlot) return;
                const planSize = v.plan_type === 'recuerdo_eterno' ? 3 :
                                 v.plan_type === 'estrella_anual' ? 2 : 1;
                const [mx, my] = k.split(',').map(Number);
                if (col >= mx && col < mx + planSize &&
                    row >= my && row < my + planSize) {
                  inside = true;
                }
              });
              return inside;
            })();



            if (isInsideRealBlock) {
              continue;
            }

            // Animación de pulso (glow) basada en fase
            const phase = (col * 7 + row * 13) % (Math.PI * 2);
            const glowIntensity = 0.6 + 0.4 * Math.sin(Date.now() / 1500 + phase);
            
            ctx.shadowColor = '#E5C88A';
            ctx.shadowBlur = (slotSize > 12 ? 4 : 2) * glowIntensity;
            ctx.globalAlpha = 0.7 + 0.3 * glowIntensity;

            ctx.fillStyle = seeded.color + 'EE';
            ctx.strokeStyle = seeded.color + 'EE'; // Use same color with EE opacity
            ctx.lineWidth = 0.3;
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            if (slotSize > 6) ctx.stroke();

            // Reset ctx
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          } else {
            // Empty slot
            ctx.fillStyle = 'rgba(220, 200, 240, 0.20)';
            ctx.strokeStyle = 'rgba(180, 150, 210, 0.30)';
            ctx.lineWidth = 0.8;
            rr(sx, sy, cell, cell, Math.max(1, cell * 0.12));
            ctx.fill();
            if (slotSize > 4) ctx.stroke();
          }
        }
      }

      // Draw butterflies over the entire viewport
      butterflies.forEach(b => {
        b.life++;
        if (b.life > b.maxLife) {
          b.life = 0;
          b.maxLife = 300 + Math.random() * 200;
          b.x = Math.random() * viewport.width;
          b.y = viewport.height + 50; // start slightly below screen
          b.vX = (Math.random() - 0.5) * 0.5;
          b.vY = -Math.random() * 0.5 - 0.5;
        }
        b.x += b.vX;
        b.y += b.vY;
        
        const screenX = b.x + Math.sin(b.life * b.wobbleSpeed + b.wobbleOffset) * 30;
        const screenY = b.y;
        const opacity = Math.sin((b.life / b.maxLife) * Math.PI);
        
        const drawSize = b.size;

        if (b.img.complete) {
          ctx.globalAlpha = opacity * 0.85;
          ctx.drawImage(b.img, screenX - drawSize/2, screenY - drawSize/2, drawSize, drawSize);
          ctx.globalAlpha = 1;
        }
      });

      // Draw butterflies tied strictly to the premium zone
      pzButterflies.forEach(b => {
        b.life++;
        if (b.life > b.maxLife) {
          b.life = 0;
          b.maxLife = 150 + Math.random() * 100;
          b.gX = Math.random() * PZ.w;
          b.gY = PZ.h * 0.5 + Math.random() * PZ.h * 0.5; // start lower half
          b.vX = (Math.random() - 0.5) * 0.03;
          b.vY = -Math.random() * 0.05 - 0.02;
        }
        b.gX += b.vX;
        b.gY += b.vY;
        
        const screenX = viewport.x + (PZ.x + b.gX + Math.sin(b.life * b.wobbleSpeed + b.wobbleOffset) * 0.5) * slotSize;
        const screenY = viewport.y + (PZ.y + b.gY) * slotSize;
        const opacity = Math.sin((b.life / b.maxLife) * Math.PI);
        
        const drawSize = b.size * Math.max(0.5, slotSize / 2);

        if (b.img.complete) {
          ctx.globalAlpha = opacity * 0.85;
          ctx.drawImage(b.img, screenX - drawSize/2, screenY - drawSize/2, drawSize, drawSize);
          ctx.globalAlpha = 1;
        }
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    
    return () => cancelAnimationFrame(rafId);
  }, [viewport, seedMap, selectedSlot, showPremiumBadge, realSlotsMap, highlightedMemorialId]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPinching.current || hasMovedSignificantly.current) {
      return; // It was a pinch or drag gesture, ignore click
    }

    if (pointerDownPos) {
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      if (dx > 5 || dy > 5) {
        return; // It was a drag, ignore click
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const coord = screenToGrid(mx, my, viewport);
    if (coord) {
      const { col, row } = coord;
      const key = `${col},${row}`;
      const realSlot = realSlotsMap.get(key);

      if (realSlot) {
        setSelectedPet({
          memorial_id: realSlot.memorial_id,
          plan_type: realSlot.plan_type,
          thumbnail_url: realSlot.thumbnail_url,
        });
        setShowPetProfile(true);
        return; // NO abrir drawer de compra
      }

      const inPremiumZone = 
        col >= PZ.x && col < PZ.x + PZ.w && 
        row >= PZ.y && row < PZ.y + PZ.h;

      if (!inPremiumZone) {
        setShowPremiumBadge(true);
      }

      const isPremiumSlot = col >= 483 && col < 517 && row >= 485 && row < 515;
      if (onSelectSlot) {
        onSelectSlot({ col, row, isPremiumSlot });
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden"
      style={{
        background: 'rgba(255, 245, 255, 0.25)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 block cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={(e) => handleWheel(e.nativeEvent, canvasRef.current?.getBoundingClientRect())}
        onClick={handleClick}
        style={{ width: viewport.width, height: viewport.height }}
      />
      
      <div 
        className="absolute flex flex-col items-center justify-center cursor-pointer"
        style={{
          left: premiumCenterX + 'px',
          top: premiumCenterY + 'px',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: showPremiumBadge ? 'auto' : 'none',
          opacity: showPremiumBadge ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: 'levitate 3s ease-in-out infinite',
        }}
        onClick={() => setShowPremiumBadge(false)}
      >
        <img 
          src="/images/icons/Badgefundadores.svg"
          alt="Ángeles Fundadores"
          style={{
            width: `${140 * viewport.zoom}px`,
            height: `${140 * viewport.zoom}px`,
            filter: `drop-shadow(0 0 ${18 * viewport.zoom}px rgba(255,150,180,0.80)) drop-shadow(0 0 ${36 * viewport.zoom}px rgba(255,200,60,0.40))`,
          }}
        />
      </div>

      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
      `}</style>

      {showPetProfile && selectedPet && (
        <PetProfileCard 
          memorialId={selectedPet.memorial_id}
          planType={selectedPet.plan_type}
          thumbnailUrl={selectedPet.thumbnail_url}
          onClose={() => {
            setShowPetProfile(false);
            setSelectedPet(null);
          }}
        />
      )}
    </div>
  );
});

MuralCanvas.displayName = 'MuralCanvas';
