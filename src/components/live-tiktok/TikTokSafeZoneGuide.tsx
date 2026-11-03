'use client';

import React from 'react';

interface TikTokSafeZoneGuideProps {
  opacity?: number; // 0 to 1
  showDetails?: boolean;
}

/**
 * Guía visual de Zona Segura móvil para TikTok LIVE (1080 × 1920, 9:16)
 * Parámetros oficiales de diseño conservador:
 * - Superior: 230 px (Y: 0 – 230)
 * - Inferior: 690 px (Y: 1230 – 1920)
 * - Izquierda: 60 px (X: 0 – 60)
 * - Derecha: 130 px (X: 950 – 1080)
 * - Zona Segura de Contenido Esencial: X = 60–950 (890 px), Y = 230–1230 (1000 px)
 */
export function TikTokSafeZoneGuide({
  opacity = 0.90,
  showDetails = true,
}: TikTokSafeZoneGuideProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden font-sans select-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* 1. FRANJA SUPERIOR INSEGURA: Y: 0 – 230 px (11.98%) */}
      <div
        className="absolute top-0 left-0 right-0 bg-red-950/40 border-b-2 border-dashed border-red-400/90 flex flex-col justify-between p-2.5"
        style={{ height: '11.98%' }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-red-200">
          <span className="bg-red-900/80 px-2 py-0.5 rounded border border-red-400/60 shadow-xs">
            ⚠️ Oculto por TikTok (Top Bar)
          </span>
          <span className="text-[10px] text-red-300 font-mono">Y: 0 – 230 px</span>
        </div>
        {showDetails && (
          <div className="text-[9.5px] text-red-200/90 italic flex items-center justify-between px-1">
            <span>[Foto Host, Título, Ranking, Audiencia]</span>
            <span>[Botón Salir ✕]</span>
          </div>
        )}
      </div>

      {/* 2. FRANJA INFERIOR INSEGURA: Y: 1230 – 1920 px (35.94% / 690 px) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-red-950/45 border-t-2 border-dashed border-red-400/90 flex flex-col justify-between p-2.5"
        style={{ height: '35.94%' }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-red-200">
          <span className="bg-red-900/80 px-2 py-0.5 rounded border border-red-400/60 shadow-xs">
            ⚠️ Oculto por Chat y Controles (690 px)
          </span>
          <span className="text-[10px] text-red-300 font-mono">Y: 1230 – 1920 px</span>
        </div>

        {showDetails && (
          <div className="space-y-1 py-1">
            <div className="bg-black/50 rounded px-2 py-1 text-[9px] text-red-200/90 font-mono border border-red-400/30">
              💬 Flujo de comentarios en vivo (chat transparente de espectadores)
            </div>
            <div className="bg-black/50 rounded px-2 py-0.5 text-[8.5px] text-red-200/80 font-mono">
              ✨ Animaciones de regalos y notificaciones flotantes
            </div>
          </div>
        )}

        <div className="bg-red-900/70 rounded py-1 px-2 text-center text-[10px] font-bold text-red-200 border border-red-400/40">
          [Caja de texto: "Añadir comentario..." & Botón de Enviar]
        </div>
      </div>

      {/* 3. LATERAL IZQUIERDO INSEGURO: X: 0 – 60 px (5.56%) */}
      <div
        className="absolute left-0 bg-amber-950/30 border-r border-dashed border-amber-400/70 flex items-center justify-center"
        style={{ top: '11.98%', height: '52.08%', width: '5.56%' }}
      >
        <span className="text-[8px] text-amber-200/80 rotate-90 whitespace-nowrap font-mono">
          60 px
        </span>
      </div>

      {/* 4. LATERAL DERECHO INSEGURO (Botones TikTok): X: 950 – 1080 px (12.04% / 130 px) */}
      <div
        className="absolute right-0 bg-amber-950/35 border-l border-dashed border-amber-400/70 flex flex-col items-center justify-around py-4"
        style={{ top: '11.98%', height: '52.08%', width: '12.04%' }}
      >
        <span className="text-[8px] text-amber-200/90 font-mono text-center">130 px</span>
        <div className="text-[8px] text-amber-200/90 font-mono flex flex-col items-center gap-2">
          <span>🎁</span>
          <span>💖</span>
          <span>↗️</span>
        </div>
        <span className="text-[7.5px] text-amber-300/80 -rotate-90 whitespace-nowrap font-mono">
          Botones TikTok
        </span>
      </div>

      {/* 5. RECTÁNGULO CENTRAL: ZONA SEGURA CONSERVADORA (X: 60–950, Y: 230–1230) */}
      <div
        className="absolute border-2 border-emerald-400/90 bg-emerald-500/10 pointer-events-none flex flex-col justify-between p-2"
        style={{
          left: '5.56%',
          top: '11.98%',
          width: '82.40%',
          height: '52.08%',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="bg-emerald-900/90 text-emerald-200 text-[10.5px] font-black px-2 py-0.5 rounded border border-emerald-400/60 shadow-xs">
            ✅ ZONA SEGURA CONSERVADORA
          </span>
          <span className="text-[9.5px] text-emerald-300 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-400/40">
            X: 60–950 | Y: 230–1230 (890 × 1000 px)
          </span>
        </div>

        <div className="text-center text-[10px] font-bold text-emerald-200/90 bg-emerald-950/60 py-0.5 px-2 rounded self-center border border-emerald-400/30">
          Contenido Esencial: Contadores, 20 Nombres, Vela viva y CTA de Participación
        </div>
      </div>
    </div>
  );
}
