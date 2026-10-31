'use client';

import React from 'react';
import { PetData } from './types';

interface PetCardBackProps {
  petData: PetData | null;
  datesStr: string;
  onClose: () => void;
  onFlip: () => void;
  backRef?: React.RefObject<HTMLDivElement>;
}

export const PetCardBack: React.FC<PetCardBackProps> = ({
  petData,
  datesStr,
  onClose,
  onFlip,
  backRef,
}) => {
  const nombre = petData?.pet_name || 'Ángel';
  const rawDedication = petData?.dedication || 'Siempre serás mi lugar favorito en el mundo.';
  const dedLen = rawDedication.length;

  let fontSize = '13px';
  let lineHeight = 1.55;
  if (dedLen > 650) {
    fontSize = '9.5px';
    lineHeight = 1.35;
  } else if (dedLen > 450) {
    fontSize = '10.5px';
    lineHeight = 1.42;
  } else if (dedLen > 250) {
    fontSize = '11.5px';
    lineHeight = 1.48;
  }

  const socialUser =
    petData?.story_answers?.socialHandle ||
    petData?.story_answers?.tiktok ||
    petData?.story_answers?.instagram;

  return (
    <div
      ref={backRef}
      className="rounded-[28px] border-[2.5px] border-white/90 shadow-[0_16px_50px_rgba(100,70,150,0.22)] flex flex-col items-center select-none relative"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 360,
        height: 500,
        overflow: 'hidden',
        backgroundImage: "url('/images/mural-preview/card-heaven-back-master.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#FDF2F8',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg) translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        boxSizing: 'border-box',
        padding: '16px 20px 48px',
        textAlign: 'center',
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

      {/* 2. Icono Logoheart superior */}
      <img
        src="/images/icons/Logoheart.svg"
        alt=""
        style={{
          width: 42,
          height: 42,
          marginBottom: 3,
          filter: 'drop-shadow(0 2px 8px rgba(236,111,163,0.30))',
          flexShrink: 0,
        }}
      />

      {/* 3. Encabezado de la historia */}
      <h3
        style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '16.5px',
          fontWeight: 700,
          color: '#4A3F6B',
          margin: '0 0 2px 0',
          textShadow: '0 1px 2px rgba(255,255,255,0.95)',
          flexShrink: 0,
        }}
      >
        La historia de {nombre}
      </h3>

      {/* Fechas en formato completo en español */}
      {datesStr && (
        <p
          style={{
            fontSize: '10.5px',
            color: '#8A7B9B',
            fontFamily: 'sans-serif',
            fontWeight: 600,
            margin: '0 0 6px 0',
            lineHeight: 1.3,
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(255,255,255,0.85)',
            flexShrink: 0,
          }}
        >
          {datesStr}
        </p>
      )}

      {/* 4. Área central crema translúcida tipo pergamino con marco dorado luminoso */}
      <div
        className="scrollbar-thin scrollbar-thumb-purple-200"
        style={{
          width: '100%',
          maxWidth: '318px',
          flex: 1,
          maxHeight: socialUser ? '195px' : '225px',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: 'rgba(255, 252, 245, 0.94)',
          borderRadius: '20px',
          border: '1.5px solid #D9A447',
          boxShadow: '0 0 0 1px #F6D991, 0 4px 18px rgba(217, 164, 71, 0.18), inset 0 1px 3px rgba(255, 255, 255, 0.9)',
          padding: '14px 16px',
          boxSizing: 'border-box',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize,
            lineHeight,
            color: '#4A3F6B',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            whiteSpace: 'pre-line',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {rawDedication}
        </div>
      </div>

      {/* 5. Usuario de redes sociales si fue proporcionado */}
      {socialUser && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            margin: '5px 0 2px',
            padding: '2px 10px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.90)',
            border: '1px solid rgba(244, 114, 182, 0.45)',
            boxShadow: '0 2px 6px rgba(100, 70, 150, 0.08)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '10.5px', color: '#BE185D', fontWeight: 700, fontFamily: 'sans-serif' }}>
            @{socialUser.replace(/^@/, '')}
          </span>
        </div>
      )}

      {/* 6. Frase "Siempre en nuestro corazón" */}
      <p
        style={{
          fontSize: '10.5px',
          color: 'rgba(123, 111, 154, 0.95)',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          marginTop: '4px',
          textAlign: 'center',
          margin: '4px 0 2px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          flexShrink: 0,
        }}
      >
        — Siempre en nuestro corazón
        <img
          src="/images/icons/plans/pawrosa.svg"
          alt=""
          style={{ width: '12px', height: '12px', opacity: 0.8 }}
        />
      </p>

      {/* Firma oficial discreta al pie */}
      <img
        src="/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png"
        alt="Ángeles en el Cielo"
        style={{
          width: '125px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          opacity: 0.85,
        }}
      />

      {/* 7. BOTÓN INTERACTIVO PARA REGRESAR AL ANVERSO: «Volver a ver a {nombre}» */}
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
          title={`Volver a ver a ${nombre}`}
        >
          {/* Icono de retorno */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D9A447"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-rotate-45"
          >
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
          <span className="font-semibold tracking-wide">Volver a ver a {nombre}</span>
        </button>
      </div>
    </div>
  );
};
