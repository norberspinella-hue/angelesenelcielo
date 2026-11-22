'use client';

import React from 'react';
import { useLiveStreamSync } from '@/components/live-tiktok/useLiveStreamSync';
import { LiveCanvas } from '@/components/live-tiktok/LiveCanvas';

export default function LiveOutputClient() {
  const { state } = useLiveStreamSync({ isController: false });
  const isHorizontal = state.activeScene === 1;

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-[#0C061A] flex items-center justify-center overflow-hidden m-0 p-0 select-none"
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      {/*
        Contenedor 16:9 (1920x1080) para la escena principal con vídeo en bucle continuo,
        o 9:16 (1080x1920) para escenas verticales secundarias.
        En TikTok LIVE Studio / OBS (1920x1080) ocupa exactamente el 100% sin bordes ni deformación.
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
        <LiveCanvas
          state={state}
          showSafeZone={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
