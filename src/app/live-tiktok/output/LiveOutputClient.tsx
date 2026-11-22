'use client';

import React, { useEffect, useState } from 'react';
import { useLiveStreamSync } from '@/components/live-tiktok/useLiveStreamSync';
import { LiveCanvas } from '@/components/live-tiktok/LiveCanvas';
import { CieloLive } from '@/components/live/CieloLive';
import { createClient } from '@/lib/supabase/client';
import type { LiveEscenaOutput } from '@/lib/live/types';

export default function LiveOutputClient() {
  const { state } = useLiveStreamSync({ isController: false });
  const [escenaOutput, setEscenaOutput] = useState<LiveEscenaOutput>('video');
  const [mountCielo, setMountCielo] = useState<boolean>(false);
  const [forceLandscapeCielo, setForceLandscapeCielo] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    setForceLandscapeCielo(q.get('formato') === '16x9');
  }, []);

  // Escucha exclusivamente escena_output desde live_ajustes_publicos (con fallback seguro a 'video')
  useEffect(() => {
    let active = true;
    const supabase = createClient() as any;

    async function fetchEscena() {
      try {
        const { data } = await supabase
          .from('live_ajustes_publicos')
          .select('escena_output')
          .eq('id', 1)
          .single();
        if (active && data && (data.escena_output === 'video' || data.escena_output === 'cielo')) {
          setEscenaOutput(data.escena_output);
          if (data.escena_output === 'cielo') setMountCielo(true);
        }
      } catch {
        // Si la migración aún no está aplicada o falla, conserva 'video' sin romper el directo
      }
    }

    fetchEscena();

    const ch = supabase
      .channel('live_output_escena_switch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_ajustes' }, fetchEscena)
      .subscribe();

    const interval = setInterval(fetchEscena, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
      supabase.removeChannel(ch);
    };
  }, []);

  const isCieloActive = escenaOutput === 'cielo';
  const isHorizontal = isCieloActive ? forceLandscapeCielo : state.activeScene === 1;

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-[#0C061A] flex items-center justify-center overflow-hidden m-0 p-0 select-none"
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      {/*
        Contenedor 16:9 (1920x1080) para la escena principal de vídeo o Cielo en el output unificado,
        o 9:16 (1080x1920) para escenas verticales secundarias.
        Fundido suave de 0,8 s al conmutar entre Vídeo y Cielo desde /live-tiktok/control.
      */}
      <div
        className={`relative overflow-hidden flex items-center justify-center shadow-2xl ${
          isHorizontal ? 'aspect-video' : 'aspect-[9/16]'
        }`}
        style={
          isHorizontal
            ? {
                width: 'min(100vw, calc(100vh * 16 / 9))',
                height: 'min(100vh, calc(100vw * 9 / 16))',
              }
            : {
                width: 'min(100vw, calc(100vh * 9 / 16))',
                height: 'min(100vh, calc(100vw * 16 / 9))',
              }
        }
      >
        {/* Escena de vídeo / canvas existente (intacta cuando escena_output = 'video') */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-[800ms] ${
            isCieloActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={isCieloActive}
        >
          <LiveCanvas
            state={state}
            showSafeZone={false}
            forceMutedPreview={isCieloActive}
            className="w-full h-full"
          />
        </div>

        {/* Escena Cielo interactivo (montada al activarse, con fundido de 0,8 s) */}
        {mountCielo && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-[800ms] ${
              isCieloActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isCieloActive}
          >
            <CieloLive soundEnabled={isCieloActive} className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
}
