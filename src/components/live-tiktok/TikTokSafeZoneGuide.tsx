'use client';

import React from 'react';

interface TikTokSafeZoneGuideProps {
  opacity?: number; // 0 to 1
  showDetails?: boolean;
}

export function TikTokSafeZoneGuide({
  opacity = 0.85,
  showDetails = true,
}: TikTokSafeZoneGuideProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between overflow-hidden font-sans select-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* 1. ZONA SUPERIOR TIKTOK (Header, Perfil, Rango y Salir) ~ 12% */}
      <div className="relative w-full h-[13%] bg-rose-950/40 border-b-2 border-dashed border-rose-400/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-black text-rose-200">
          <span className="bg-rose-900/80 px-2 py-0.5 rounded-md border border-rose-400/60 shadow-xs">
            ⚠️ Oculto por TikTok (Top Bar)
          </span>
          <span className="text-[10px] text-rose-300 font-mono">Y: 0px – 250px</span>
        </div>
        {showDetails && (
          <div className="text-[10px] text-rose-200/90 italic flex items-center justify-between px-1">
            <span>[Foto Host, Seguidores, Rango diario]</span>
            <span>[Botón Salir ✕]</span>
          </div>
        )}
      </div>

      {/* 2. ZONA CENTRAL (ZONA SEGURA PRINCIPAL RECOMENDADA) ~ 57% */}
      <div className="relative w-full h-[57%] border-y-2 border-emerald-400/90 bg-emerald-500/10 flex flex-col justify-between p-3">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-800/90 text-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-emerald-400/60 shadow-xs">
            ✅ ZONA SEGURA DE VISIÓN (1080×1920)
          </span>
          <span className="text-[10px] text-emerald-300 font-mono">Y: 250px – 1340px</span>
        </div>

        {/* Marcador lateral derecho (Botones de regalos / compartir de TikTok) */}
        <div className="self-end w-24 h-48 bg-rose-900/35 border-2 border-dashed border-rose-400/60 rounded-xl p-1.5 flex flex-col justify-around text-right my-auto">
          <span className="text-[9px] font-bold text-rose-200 block">⚠️ Botones TikTok</span>
          <span className="text-[8px] text-rose-300 block">🎁 Regalos</span>
          <span className="text-[8px] text-rose-300 block">💖 Corazones</span>
          <span className="text-[8px] text-rose-300 block">↗ Compartir</span>
        </div>

        <div className="text-center text-[10px] font-bold text-emerald-300/80">
          Elemento protagonista: Retratos, Dedicatorias y Velas centradas
        </div>
      </div>

      {/* 3. ZONA INFERIOR TIKTOK (Chat de directo, regalos animados y cajetín) ~ 30% */}
      <div className="relative w-full h-[30%] bg-rose-950/40 border-t-2 border-dashed border-rose-400/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-black text-rose-200">
          <span className="bg-rose-900/80 px-2 py-0.5 rounded-md border border-rose-400/60 shadow-xs">
            ⚠️ Oculto por Chat y Regalos (Bottom Area)
          </span>
          <span className="text-[10px] text-rose-300 font-mono">Y: 1340px – 1920px</span>
        </div>

        {showDetails && (
          <div className="space-y-1 py-1">
            <div className="bg-black/40 rounded-lg p-1.5 text-[9px] text-rose-200/90 font-mono">
              💬 Flujo de comentarios de los espectadores (streaming continuo)
            </div>
            <div className="bg-black/40 rounded-lg p-1 text-[9px] text-rose-200/90 font-mono">
              ✨ Animaciones de rosas, cofres y regalos
            </div>
          </div>
        )}

        <div className="bg-rose-900/60 rounded-lg py-1 px-2 text-center text-[10px] font-bold text-rose-200 border border-rose-400/40">
          [Caja de texto de TikTok: "Añadir comentario..." & Botones de interacción]
        </div>
      </div>
    </div>
  );
}
