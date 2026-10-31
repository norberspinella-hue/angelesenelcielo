'use client';

import React from 'react';
import { PetData } from './types';

interface PetCardFrontProps {
  petData: PetData | null;
  loading: boolean;
  thumbnailUrl: string;
  isShelterPet: boolean;
  onClose: () => void;
  onFlip: () => void;
  frontRef?: React.RefObject<HTMLDivElement>;
}

export const PetCardFront: React.FC<PetCardFrontProps> = ({
  petData,
  loading,
  thumbnailUrl,
  isShelterPet,
  onClose,
  onFlip,
  frontRef,
}) => {
  const nombre = loading ? '' : petData?.pet_name || 'Ángel';
  const nameLen = nombre.trim().length;

  // Ajuste dinámico del tamaño de fuente en caligrafía Allura
  let dynamicFontSize = 64;
  if (nameLen > 16) dynamicFontSize = 32;
  else if (nameLen > 13) dynamicFontSize = 38;
  else if (nameLen > 10) dynamicFontSize = 46;
  else if (nameLen > 7) dynamicFontSize = 54;

  const photoSrc = petData?.photo_url || thumbnailUrl || '/images/placeholders/first.webp';
  const planBadgeSrc = '/images/icons/plans/icon-plan-eterno.svg';

  return (
    <div
      ref={frontRef}
      className="rounded-[28px] border-[2.5px] border-white/90 shadow-[0_16px_50px_rgba(100,70,150,0.22)] flex flex-col select-none relative"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 360,
        height: 500,
        overflow: 'hidden',
        backgroundImage: "url('/images/mural-preview/card-heaven-front-master.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {/* 1. Botón X de cerrar en la esquina (Rosado premium) */}
      <button
        data-download-ignore="true"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[#FCE7F3]/90 hover:bg-[#FBCFE8] text-[#BE185D] hover:text-[#9D174D] border border-[#FBCFE8] flex items-center justify-center transition-colors z-30 text-xs font-bold shadow-xs cursor-pointer"
        title="Cerrar"
      >
        ✕
      </button>

      {/* 2. Distintivo Corazón de Ángel (para protectoras) */}
      {isShelterPet && (
        <div
          data-download-ignore="true"
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px 3px 4px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid #F472B6',
            boxShadow: '0 4px 14px rgba(244, 114, 182, 0.35)',
            zIndex: 30,
          }}
        >
          <img
            src="/images/icons/badge-alas-angel.webp"
            alt="Corazón de Ángel"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#BE185D',
              letterSpacing: '0.4px',
            }}
          >
            CORAZÓN DE ÁNGEL
          </span>
        </div>
      )}

      {/* 3. Encabezado superior: "MI ANGELITO" */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            fontWeight: 700,
            color: '#4A3258',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(255,255,255,0.95)',
          }}
        >
          MI ANGELITO
        </span>
      </div>

      {/* 4. Nombre de la mascota en caligrafía Allura */}
      <h3
        style={{
          position: 'absolute',
          top: '46px',
          left: 0,
          right: 0,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: "'Allura', 'Pinyon Script', cursive",
          fontSize: `${dynamicFontSize}px`,
          fontWeight: 400,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 10,
          color: '#B8860B',
          textShadow: '0 1px 2px rgba(255,255,255,0.95), 0 2px 8px rgba(184,134,11,0.30)',
          padding: '0 20px',
          margin: 0,
        }}
      >
        {nombre}
      </h3>

      {/* Pequeño corazón dorado ornamental */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '11px',
          zIndex: 10,
          color: '#D4AF37',
        }}
      >
        💛
      </div>

      {/* 5. Resplandor cálido central antes de la foto */}
      <div
        style={{
          position: 'absolute',
          top: '95px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '270px',
          height: '135px',
          background: 'radial-gradient(ellipse at center, rgba(255, 253, 240, 0.85) 0%, rgba(255, 245, 215, 0.50) 45%, rgba(255, 240, 195, 0) 80%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* 6. Aureola Celestial Dorada (-4°) */}
      <div
        style={{
          position: 'absolute',
          top: '124px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-4deg)',
          width: '150px',
          height: '40px',
          zIndex: 7,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 220 70" fill="none" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="frontHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="frontHaloGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="25%" stopColor="#FFD54F" />
              <stop offset="50%" stopColor="#FFF9C4" />
              <stop offset="75%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFD54F" strokeWidth="8" opacity="0.85" filter="url(#frontHaloGlow)" />
          <ellipse cx="110" cy="35" rx="95" ry="24" stroke="url(#frontHaloGoldGrad)" strokeWidth="4.2" opacity="1.0" />
          <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.98" />
        </svg>
      </div>

      {/* 7. Fotografía de la mascota en marco circular */}
      <div
        style={{
          position: 'absolute',
          top: '150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '175px',
          height: '175px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3.5px solid #C9A961',
          boxShadow: '0 0 22px rgba(201,169,97,0.45), 0 8px 20px rgba(74,31,110,0.18)',
          backgroundColor: 'white',
          zIndex: 5,
        }}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-pink-50/50">
            <div
              style={{
                border: '3px solid #C9A961',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : (
          <img
            src={photoSrc}
            alt={nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Distintivo de Plan Eterno */}
      {planBadgeSrc && (
        <img
          src={planBadgeSrc}
          alt="Plan Eterno"
          style={{
            position: 'absolute',
            top: 278,
            left: 184,
            width: 62,
            height: 62,
            zIndex: 8,
            filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
          }}
        />
      )}

      {/* 8. Zona Inferior: Mensaje y Firma oficial */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: '14px',
            color: '#4A3258',
            margin: '0 0 2px 0',
            lineHeight: 1.25,
            textShadow: '0 1px 2px rgba(255,255,255,0.9)',
          }}
        >
          Siempre serás mi lugar favorito en el mundo.
        </p>

        {/* Firma Oficial auténtica de Ángeles en el Cielo */}
        <img
          src="/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png"
          alt="Ángeles en el Cielo"
          style={{
            width: '170px',
            height: 'auto',
            display: 'block',
            margin: '1px auto 2px',
            filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.9))',
          }}
        />

        <span
          style={{
            fontSize: '7.5px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#8B7B9E',
            textTransform: 'uppercase',
          }}
        >
          TODOS LOS PERROS VAN AL CIELO
        </span>
      </div>

      {/* 9. BOTÓN INTERACTIVO PARA GIRAR: «Leer su historia» */}
      <div
        data-download-ignore="true"
        className="absolute bottom-2.5 left-0 right-0 flex justify-center z-30 pointer-events-auto"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="group px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 100%)',
            border: '1.5px solid #D9A447',
            boxShadow: '0 0 0 1px #F6D991, 0 4px 14px rgba(217, 164, 71, 0.25)',
            color: '#3B2D54',
          }}
          title="Leer dedicatoria e historia"
        >
          {/* Icono de libro */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D9A447" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="font-semibold tracking-wide">Leer su historia</span>
          {/* Flecha */}
          <span className="text-xs font-bold text-[#D9A447] transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  );
};
