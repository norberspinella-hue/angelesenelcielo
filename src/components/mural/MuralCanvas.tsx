'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { PetProfileCard } from './pet-card/PetProfileCard';
import { createPortal } from 'react-dom';
import { useMuralViewport } from '@/hooks/useMuralViewport';
import { getVisibleRange, getSlotSize, screenToGrid, PREMIUM_ZONE, PREMIUM_ZONE as PZ, BASE_SLOT } from '@/lib/mural/gridMath';
import { generateSeedSlots } from '@/lib/mural/mockSeed';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getPlanByDbName } from '@/lib/plans';
import { ApadrinarDrawer, DEFAULT_SHELTER_PETS, ShelterPet } from '@/components/solidario/ApadrinarDrawer';

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
  const premiumTopY = viewport.y + PZ.y * slotSizeScreen;

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
      const targetZoom = 3.8
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
  const [apadrinarPet, setApadrinarPet] = useState<ShelterPet | null>(null);
  const [isApadrinarOpen, setIsApadrinarOpen] = useState(false);

  // Cargar los slots reales ocupados desde Supabase
  useEffect(() => {
    const loadOccupiedSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('mural_slots')
          .select('x, y, status, plan_type, memorial_id, thumbnail_url, memorials(pet_name, photo_url, story_answers, visibility, moderation_status)')
          .or('status.eq.occupied,status.eq.blocked_admin,memorial_id.not.is.null');
        
        if (error) {
          console.error('Error cargando slots:', error);
          return;
        }
        
        if (data) {
          // Detectar mascotas que están ocultadas por moderación / privadas
          const hiddenMemorialIds = new Set<string>();
          const hiddenPetNames = new Set<string>();
          const blockedCoords = new Set<string>();

          data.forEach((slot: any) => {
            const isHidden = 
              slot.status === 'blocked_admin' || 
              slot.memorials?.visibility === 'private' || 
              slot.memorials?.moderation_status === 'rejected';

            if (isHidden) {
              if (slot.memorial_id) hiddenMemorialIds.add(slot.memorial_id);
              if (slot.memorials?.pet_name) hiddenPetNames.add(slot.memorials.pet_name.toLowerCase().trim());
              blockedCoords.add(`${slot.x},${slot.y}`);
            }
          });

          // Filtrar slots válidos y activos
          const validSlots = data.filter((slot: any) => {
            if (slot.status === 'blocked_admin') return false;
            if (slot.memorial_id && hiddenMemorialIds.has(slot.memorial_id)) return false;
            if (slot.memorials?.visibility === 'private' || slot.memorials?.moderation_status === 'rejected') return false;
            return true;
          });

          // 1. Agrupar por memorial_id (o thumbnail_url + plan_type) para encontrar el slot de origen (x mínimo y y mínimo)
          const minsMap = new Map<string, { minX: number; minY: number }>();
          validSlots.forEach((slot: any) => {
            const groupKey = slot.memorial_id || (slot.thumbnail_url && slot.plan_type ? `${slot.thumbnail_url}_${slot.plan_type}` : null);
            if (!groupKey) return;
            const current = minsMap.get(groupKey);
            if (!current) {
              minsMap.set(groupKey, { minX: slot.x, minY: slot.y });
            } else {
              current.minX = Math.min(current.minX, slot.x);
              current.minY = Math.min(current.minY, slot.y);
            }
          });

          // 2. Poblar el mapa realSlots directamente usando las celdas de la base de datos
          const realSlots = new Map<string, any>();
          validSlots.forEach((slot: any) => {
            const key = `${slot.x},${slot.y}`;
            const groupKey = slot.memorial_id || (slot.thumbnail_url && slot.plan_type ? `${slot.thumbnail_url}_${slot.plan_type}` : null);
            const mins = groupKey ? minsMap.get(groupKey) : null;
            const planSize = getPlanByDbName(slot.plan_type)?.size ?? 1;
            const isMain = mins ? (slot.x === mins.minX && slot.y === mins.minY) : (planSize === 1);
            const isDbShelter = Boolean(
              slot.memorial_id?.startsWith('shelter_') ||
              slot.memorials?.story_answers?.isShelter ||
              slot.memorials?.story_answers?.shelterName
            );
            const isSponsored = Boolean(
              slot.memorials?.story_answers?.isSponsored || 
              (slot.memorials?.story_answers?.isSponsorship && slot.memorials?.story_answers?.sponsorName)
            );
            
            realSlots.set(key, {
              status: 'occupied',
              plan_type: slot.plan_type,
              memorial_id: slot.memorial_id,
              thumbnail_url: slot.thumbnail_url || slot.memorials?.photo_url || '',
              isMainSlot: isMain,
              x: slot.x,
              y: slot.y,
              isShelter: isDbShelter,
              isSponsored: isSponsored,
              minX: mins?.minX ?? slot.x,
              minY: mins?.minY ?? slot.y,
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
            const isShelterSlot = Boolean(realSlot.isShelter || realSlot.memorial_id?.startsWith('shelter_'));
            const isSponsored = Boolean(realSlot.isSponsored);
            const isShelterUnsponsored = isShelterSlot && !isSponsored;

            // Determinar si es un perrito de protectora en espera de padrino (1x1)
            const minX = realSlot.minX ?? realSlot.x;
            const minY = realSlot.minY ?? realSlot.y;
            const is3x3ShelterBlock = isShelterSlot && (realSlot.plan_type === 'recuerdo_eterno' || realSlot.plan_type === 'corazon_eterno');
            const shelterCenterCol = is3x3ShelterBlock ? minX + 1 : minX;
            const shelterCenterRow = is3x3ShelterBlock ? minY + 1 : minY;
            const isShelterPhotoSlot = (col === shelterCenterCol && row === shelterCenterRow);
            const isShelterOrigin = (col === minX && row === minY);

            if (thumbnailUrl && !isMainSlot && !isShelterUnsponsored) {
              // slot cubierto por la foto del principal
              // no hacer nada en absoluto
            } else if (isShelterUnsponsored) {
              // 1. DIBUJAR PERRO DE PROTECTORA EN ESPERA DE PADRINO (TAMAÑO 1x1 EN EL CENTRO)
              if (isShelterPhotoSlot) {
                let imageDrawn = false;
                if (thumbnailUrl) {
                  const img = loadImage(thumbnailUrl, () => {
                    requestAnimationFrame(render);
                  });
                  if (img) {
                    const fullSize = slotSize;
                    const radius = Math.max(2, fullSize * 0.12);
                    ctx.save();
                    ctx.beginPath();
                    rr(sx, sy, fullSize, fullSize, radius);
                    ctx.clip();
                    ctx.drawImage(img, sx, sy, fullSize, fullSize);
                    ctx.restore();

                    // Aureola suave pulsante con tono rosa cálido Ghibli
                    ctx.save();
                    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
                    ctx.shadowBlur = 10 * pulse + 4;
                    ctx.shadowColor = 'rgba(244, 114, 182, 0.95)';
                    ctx.strokeStyle = '#F472B6';
                    ctx.lineWidth = Math.max(1.8, fullSize * 0.04);
                    rr(sx, sy, fullSize, fullSize, radius);
                    ctx.stroke();

                    // Mini badge de alas de ángel en la esquina
                    if (fullSize >= 14) {
                      const badgeD = Math.max(14, Math.min(26, fullSize * 0.38));
                      const bX = sx + fullSize - badgeD + 2;
                      const bY = sy - 2;
                      const badgeImg = loadImage('/images/icons/badge-alas-angel.webp', () => {
                        requestAnimationFrame(render);
                      });
                      if (badgeImg) {
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = 'rgba(244, 114, 182, 0.8)';
                        ctx.drawImage(badgeImg, bX, bY, badgeD, badgeD);
                      }
                    }
                    ctx.restore();

                    imageDrawn = true;
                  }
                }

                if (!imageDrawn) {
                  ctx.fillStyle = 'rgba(244, 114, 182, 0.85)';
                  rr(sx, sy, cell, cell, radius);
                  ctx.fill();
                }

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
              } else {
                // 2. DIBUJAR LAS OTRAS 8 ESTRELLAS EN ESPERA DE LA CONSTELACIÓN
                const cx = sx + cell / 2;
                const cy = sy + cell / 2;
                const phase = (col * 3 + row * 7) % (Math.PI * 2);
                const starPulse = 0.6 + 0.4 * Math.sin(Date.now() / 500 + phase);
                ctx.save();
                ctx.fillStyle = `rgba(251, 182, 206, ${0.45 * starPulse + 0.25})`;
                ctx.shadowBlur = 8 * starPulse;
                ctx.shadowColor = 'rgba(244, 114, 182, 0.85)';
                ctx.beginPath();
                ctx.arc(cx, cy, Math.max(2, cell * 0.16), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Si es la celda superior izquierda del cuadrante 3x3, dibujar silueta punteada de la constelación
                if (isShelterOrigin && is3x3ShelterBlock && slotSize > 4) {
                  const fullBlock = slotSize * 3;
                  ctx.save();
                  ctx.setLineDash([4, 4]);
                  ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
                  ctx.lineWidth = 1;
                  rr(sx, sy, fullBlock, fullBlock, Math.max(4, fullBlock * 0.04));
                  ctx.stroke();
                  ctx.restore();
                }
              }
            } else {
              let imageDrawn = false;

              const planSize = getPlanByDbName(realSlot.plan_type)?.size ?? 1;

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

                  const isShelterSlot = Boolean(realSlot?.isShelter || realSlot?.memorial_id?.startsWith('shelter_'));
                  if (isShelterSlot) {
                    ctx.save();
                    // Aureola suave pulsante con tono rosado cálido y dorado
                    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 450);
                    ctx.shadowBlur = 12 * pulse + 6;
                    ctx.shadowColor = 'rgba(244, 114, 182, 0.85)';
                    ctx.strokeStyle = 'rgba(251, 146, 60, 0.95)';
                    ctx.lineWidth = Math.max(1.8, fullSize * 0.035);
                    rr(sx, sy, fullSize, fullSize, radius);
                    ctx.stroke();

                    // Distintivo alado en la esquina superior derecha (Corazones de Ángel - Studio Ghibli)
                    if (fullSize >= 18) {
                      const badgeD = Math.max(18, Math.min(36, fullSize * 0.35));
                      const bX = sx + fullSize - badgeD + 2;
                      const bY = sy - 2;

                      const badgeImg = loadImage('/images/icons/badge-alas-angel.webp', () => {
                        requestAnimationFrame(render);
                      });

                      if (badgeImg) {
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = 'rgba(244, 114, 182, 0.75)';
                        ctx.drawImage(badgeImg, bX, bY, badgeD, badgeD);
                      } else {
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = 'rgba(0,0,0,0.3)';
                        ctx.fillStyle = '#F472B6';
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.arc(bX + badgeD / 2, bY + badgeD / 2, badgeD / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();

                        ctx.font = `${Math.round(badgeD * 0.6)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillText('💖', bX + badgeD / 2, bY + badgeD / 2 + 1);
                      }
                    }
                    ctx.restore();
                  }

                  imageDrawn = true;
                }
              }

              const isGoldenPlan = ['recuerdo_eterno', 'corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(realSlot.plan_type);

              if (!imageDrawn) {
                if (isGoldenPlan) {
                  ctx.fillStyle = 'rgba(201,169,97,0.85)';
                } else if (realSlot.plan_type === 'estrella_anual' || realSlot.plan_type === 'estrella_brillante') {
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
                ctx.strokeStyle = isGoldenPlan ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.2)';
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
                const planSize = getPlanByDbName(v.plan_type)?.size ?? 1;
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
          isShelter: realSlot.isShelter || Boolean(realSlot.memorial_id?.startsWith('shelter_')),
          shelterPet: realSlot.shelterPet,
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

      const isPremiumSlot = inPremiumZone;
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
          top: premiumTopY + 'px',
          transform: 'translate(-50%, -85%)',
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
          0%, 100% { transform: translate(-50%, -85%) translateY(0); }
          50% { transform: translate(-50%, -85%) translateY(-8px); }
        }
      `}</style>

      {showPetProfile && selectedPet && (
        <PetProfileCard 
          memorialId={selectedPet.memorial_id}
          planType={selectedPet.plan_type}
          thumbnailUrl={selectedPet.thumbnail_url}
          isShelter={selectedPet.isShelter}
          shelterPet={selectedPet.shelterPet}
          onClose={() => {
            setShowPetProfile(false);
            setSelectedPet(null);
          }}
          onApadrinar={(pet) => {
            setShowPetProfile(false);
            setSelectedPet(null);
            setApadrinarPet(pet);
            setIsApadrinarOpen(true);
          }}
        />
      )}

      {/* DRAWER DE APADRINAMIENTO SOLIDARIO (9 ESTRELLAS - ESTILO MURAL DRAWER) */}
      <ApadrinarDrawer 
        isOpen={isApadrinarOpen}
        onClose={() => {
          setIsApadrinarOpen(false);
          setApadrinarPet(null);
        }}
        preSelectedPet={apadrinarPet}
      />
    </div>
  );
});

MuralCanvas.displayName = 'MuralCanvas';
