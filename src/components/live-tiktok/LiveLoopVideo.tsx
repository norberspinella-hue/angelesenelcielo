'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LiveLoopVideoProps {
  src?: string;
  poster?: string;
  className?: string;
  /** Cuando es true (vista previa del presentador), mantiene el vídeo silenciado para evitar eco. */
  mutedByDefault?: boolean;
  /** Muestra un botón discreto solo si el navegador bloquea el autoplay con sonido en /output. */
  allowUnmuteControl?: boolean;
}

/**
 * Reproductor de fondo en bucle continuo 16:9 con audio AAC original sincronizado.
 * En la señal de salida (/live-tiktok/output) intenta iniciar con sonido activo;
 * si la política de autoplay del navegador lo bloquea, cambia automáticamente a modo
 * silenciado para no detener el vídeo y ofrece un botón discreto para activar el audio.
 */
export function LiveLoopVideo({
  src = '/videos/live-tiktok/porch-letter-1080p-loop.mp4',
  poster = '/videos/live-tiktok/porch-letter-poster.webp',
  className = '',
  mutedByDefault = false,
  allowUnmuteControl = true,
}: LiveLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    video.playsInline = true;

    const startPlayback = async () => {
      if (cancelled) return;

      if (mutedByDefault) {
        video.defaultMuted = true;
        video.muted = true;
        setNeedsAudioUnlock(false);
        try {
          if (video.paused) await video.play();
        } catch {
          // Reintento en canplay
        }
        return;
      }

      // Intentar reproducción directa con sonido (funciona en TikTok LIVE Studio / OBS / tras gesto)
      video.defaultMuted = false;
      video.muted = false;
      try {
        await video.play();
        if (!cancelled) {
          setNeedsAudioUnlock(video.muted);
        }
      } catch {
        // Fallback sin bloquear el vídeo en navegadores con política estricta de autoplay
        if (cancelled) return;
        video.defaultMuted = true;
        video.muted = true;
        setNeedsAudioUnlock(true);
        try {
          await video.play();
        } catch {
          // Se reintentará en canplay
        }
      }
    };

    const handleCanPlay = () => {
      if (video.paused) {
        void startPlayback();
      }
    };

    const handleFirstGesture = () => {
      if (mutedByDefault) return;
      if (video.muted || video.paused) {
        video.muted = false;
        video.play()
          .then(() => {
            if (!cancelled) setNeedsAudioUnlock(video.muted);
          })
          .catch(() => {
            video.muted = true;
            void video.play().catch(() => {});
          });
      }
    };

    void startPlayback();
    video.addEventListener('canplay', handleCanPlay);
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', handleCanPlay);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [src, mutedByDefault]);

  const handleUnlockAudio = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = false;
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      setNeedsAudioUnlock(video.muted);
    } catch {
      // Si el entorno sigue impidiendo el sonido, volver a silenciado para no detener el vídeo
      video.defaultMuted = true;
      video.muted = true;
      try {
        await video.play();
      } catch {}
    }
  };

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
        muted={mutedByDefault}
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

      {!mutedByDefault && allowUnmuteControl && needsAudioUnlock && (
        <button
          type="button"
          onClick={handleUnlockAudio}
          className="pointer-events-auto absolute bottom-4 right-4 z-50 px-3.5 py-2 rounded-full bg-black/75 hover:bg-black/90 text-[#FFFDF8] border border-amber-300/60 text-xs font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
          title="Haz clic para activar el audio original del escenario si tu navegador bloqueó el sonido automático"
        >
          <span>🔊</span>
          <span>Activar audio del escenario</span>
        </button>
      )}
    </div>
  );
}
