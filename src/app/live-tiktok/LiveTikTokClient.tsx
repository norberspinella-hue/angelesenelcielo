'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PresenterPanel } from '@/components/live-tiktok/PresenterPanel';
import LiveOutputClient from './output/LiveOutputClient';

function LiveTikTokRouter() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  if (view === 'output') {
    return <LiveOutputClient />;
  }

  return <PresenterPanel />;
}

export default function LiveTikTokClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C061A] text-white flex items-center justify-center">Cargando estudio LIVE...</div>}>
      <LiveTikTokRouter />
    </Suspense>
  );
}
