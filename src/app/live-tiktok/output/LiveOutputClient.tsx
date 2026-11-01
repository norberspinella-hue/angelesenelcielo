'use client';

import React from 'react';
import { useLiveStreamSync } from '@/components/live-tiktok/useLiveStreamSync';
import { LiveCanvas } from '@/components/live-tiktok/LiveCanvas';

export default function LiveOutputClient() {
  const { state } = useLiveStreamSync({ isController: false });

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-[#0C061A] flex items-center justify-center overflow-hidden m-0 p-0 select-none"
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      {/* 
        Contenedor 9:16 con resolución lógica 1080 x 1920.
        En OBS (1080x1920) ocupa exactamente el 100% sin márgenes.
        En monitores estándar se escala respetando 9:16 centrado.
      */}
      <div
        className="relative h-full max-h-screen aspect-[9/16] overflow-hidden flex items-center justify-center shadow-2xl"
        style={{
          width: 'auto',
          height: '100%',
          maxHeight: '100vh',
        }}
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
