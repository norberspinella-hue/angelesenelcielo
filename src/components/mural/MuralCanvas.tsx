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

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      // Setup high-DPI canvas
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Clear
      ctx.clearRect(0, 0, viewport.width, viewport.height);

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

      // Draw premium zone glow first
      if (
        range.colStart <= PREMIUM_ZONE.x + PREMIUM_ZONE.w && 
        range.colEnd >= PREMIUM_ZONE.x &&
        range.rowStart <= PREMIUM_ZONE.y + PREMIUM_ZONE.h && 
        range.rowEnd >= PREMIUM_ZONE.y
      ) {
        ctx.fillStyle = 'rgba(255, 220, 97, 0.04)';
        const px = viewport.x + PREMIUM_ZONE.x * slotSize;
        const py = viewport.y + PREMIUM_ZONE.y * slotSize;
        const pw = PREMIUM_ZONE.w * slotSize;
        const ph = PREMIUM_ZONE.h * slotSize;
        rr(px, py, pw, ph, Math.max(1, cell * 0.5));
        ctx.fill();
      }

      // Draw slots
      for (let row = range.rowStart; row <= range.rowEnd; row++) {
        for (let col = range.colStart; col <= range.colEnd; col++) {
          const sx = viewport.x + col * slotSize;
          const sy = viewport.y + row * slotSize;
          const key = `${col},${row}`;
          const seeded = seedMap.get(key);
          const isSelected = selectedSlot?.col === col && selectedSlot?.row === row;
          const radius = Math.max(1, cell * 0.15);

          if (isSelected) {
            ctx.fillStyle = 'rgba(255,220,80,0.9)';
            ctx.strokeStyle = '#C0A020';
            ctx.lineWidth = 1;
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            ctx.stroke();
          } else if (seeded) {
            // Animación de pulso (glow) basada en fase
            const phase = (col * 7 + row * 13) % (Math.PI * 2);
            const glowIntensity = 0.6 + 0.4 * Math.sin(Date.now() / 1500 + phase);
            
            ctx.shadowColor = '#E5C88A';
            ctx.shadowBlur = (slotSize > 12 ? 4 : 2) * glowIntensity;
            ctx.globalAlpha = 0.7 + 0.3 * glowIntensity;

            ctx.fillStyle = seeded.color;
            ctx.strokeStyle = seeded.color; // Remove the hardcoded gold and just use the seeded color
            ctx.lineWidth = 0.3;
            rr(sx, sy, cell, cell, radius);
            ctx.fill();
            if (slotSize > 6) ctx.stroke();

            // Reset ctx
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          } else {
            // Empty slot
            ctx.fillStyle = 'rgba(255,255,255,0.15)'; // Slightly whiter instead of purple
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 0.3;
            rr(sx, sy, cell, cell, Math.max(1, cell * 0.12));
            ctx.fill();
            if (slotSize > 4) ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    
    return () => cancelAnimationFrame(rafId);
  }, [viewport, seedMap, selectedSlot]);

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
    if (coord && onSelectSlot) {
      onSelectSlot(coord.col, coord.row);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 block cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={(e) => handleWheel(e.nativeEvent)}
        onClick={handleClick}
        style={{ width: viewport.width, height: viewport.height }}
      />
    </div>
  );
});

MuralCanvas.displayName = 'MuralCanvas';
