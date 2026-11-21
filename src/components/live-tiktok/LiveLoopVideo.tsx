'use client';

import React, { useEffect, useRef } from 'react';

interface LiveLoopVideoProps {
  src?: string;
  poster?: string;
  className?: string;
}

/**
 * Reproductor de fondo en bucle continuo 16:9 sin cortes ni pantallas negras.
 * Mantiene el primer fotograma como respaldo visual debajo del <video> para evitar
 * parpadeos al cargar o reiniciar el bucle en Browser Source (TikTok LIVE Studio / OBS).
 */
export function LiveLoopVideo({
  src = '/videos/live-tiktok/porch-letter-1080p-loop.mp4',
  poster = '/videos/live-tiktok/porch-letter-poster.webp',
  className = '',
}: LiveLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      if (video.paused) {
        video.play().catch(() => {
          // Algunos entornos esperan al primer evento canplay; se reintenta en onCanPlay.
        });
      }
    };

    tryPlay();
    video.addEventListener('canplay', tryPlay);
    return () => {
      video.removeEventListener('canplay', tryPlay);
    };
  }, [src]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden bg-[#0C061A] pointer-events-none select-none ${className}`}
    >
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={(e) => {
          const v = e.currentTarget;
          v.currentTime = 0;
          v.play().catch(() => {});
        }}
        className="relative z-[1] w-full h-full object-cover object-center"
      />
    </div>
  );
}
