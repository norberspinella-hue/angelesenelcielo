'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useMuralViewport } from '@/hooks/useMuralViewport';
import { getVisibleRange, getSlotSize, screenToGrid, PREMIUM_ZONE, PREMIUM_ZONE as PZ } from '@/lib/mural/gridMath';
import { generateSeedSlots } from '@/lib/mural/mockSeed';

interface MuralCanvasProps {
  onSelectSlot?: (col: number, row: number) => void;
  selectedSlot?: { col: number; row: number } | null;
  onZoomChange?: (zoom: number) => void;
}

export interface MuralCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerPremium: () => void;
}

export const MuralCanvas = forwardRef<MuralCanvasRef, MuralCanvasProps>(({ onSelectSlot, selectedSlot, onZoomChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    viewport,
    updateViewportSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    zoomIn,
    zoomOut,
    centerOnCoord
  } = useMuralViewport();

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
    centerPremium: () => centerOnCoord(PZ.x + PZ.w / 2, PZ.y + PZ.h / 2, 1)
  }));

  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(viewport.zoom);
    }
  }, [viewport.zoom, onZoomChange]);

  const [seedMap] = useState(() => generateSeedSlots(50000)); // 50k initial slots

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

          if (isSelected) {
            ctx.fillStyle = 'rgba(255,220,80,0.9)';
            ctx.strokeStyle = '#C0A020';
            ctx.lineWidth = 1;
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            ctx.stroke();
          } else if (isPremium) {
            // Animación de pulso
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
  }, [viewport, seedMap, selectedSlot, showPremiumBadge]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      const inPremiumZone = 
        col >= PZ.x && col < PZ.x + PZ.w && 
        row >= PZ.y && row < PZ.y + PZ.h;

      if (!inPremiumZone) {
        setShowPremiumBadge(true);
      }

      if (onSelectSlot) {
        onSelectSlot(col, row);
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
    </div>
  );
});

MuralCanvas.displayName = 'MuralCanvas';
