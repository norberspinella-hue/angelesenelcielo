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

  let fontSize = '13.5px';
  let lineHeight = 1.6;
  if (dedLen > 650) {
    fontSize = '10px';
    lineHeight = 1.38;
  } else if (dedLen > 450) {
    fontSize = '11px';
    lineHeight = 1.45;
  } else if (dedLen > 250) {
    fontSize = '12px';
    lineHeight = 1.52;
  }

  const socialUser =
    petData?.story_answers?.socialHandle ||
    petData?.story_answers?.tiktok ||
    petData?.story_answers?.instagram;

  return (
    <div
      ref={backRef}
      className="rounded-[28px] border-[2.5px] border-white/90 shadow-[0_16px_50px_rgba(100,70,150,0.22)] flex flex-col items-center select-none"
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
        padding: '16px 20px 20px',
        textAlign: 'center',
      }}
    >
      {/* 1. Botón X de cerrar (Estilo rosado de lujo) */}
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
          width: 44,
          height: 44,
          marginBottom: 4,
          filter: 'drop-shadow(0 2px 8px rgba(236,111,163,0.30))',
          flexShrink: 0,
        }}
      />

      {/* 3. Encabezado de la historia */}
      <h3
        style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '17px',
          fontWeight: 700,
          color: '#4A3F6B',
          margin: '0 0 2px 0',
          textShadow: '0 1px 2px rgba(255,255,255,0.9)',
          flexShrink: 0,
        }}
      >
        La historia de {nombre}
      </h3>

      {/* Fechas en formato completo en español */}
      {datesStr && (
        <p
          style={{
            fontSize: '11px',
            color: '#8A7B9B',
            fontFamily: 'sans-serif',
            fontWeight: 600,
            margin: '0 0 8px 0',
            lineHeight: 1.3,
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            flexShrink: 0,
          }}
        >
          {datesStr}
        </p>
      )}

      {/* 4. Área central crema translúcida tipo pergamino con dedicatoria */}
      <div
        className="scrollbar-thin scrollbar-thumb-purple-200"
        style={{
          width: '100%',
          flex: 1,
          maxHeight: socialUser ? '230px' : '265px',
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 252, 245, 0.90)',
          borderRadius: '18px',
          border: '1px solid rgba(201, 169, 97, 0.40)',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03), 0 4px 16px rgba(100,70,150,0.08)',
          padding: '12px 14px 12px 16px',
          boxSizing: 'border-box',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        {/* Barra lateral de acento rosa */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '8px',
            bottom: '12px',
            width: '3.5px',
            borderRadius: '2px',
            background: 'linear-gradient(180deg, #F472B6 0%, #EC4899 100%)',
          }}
        />

        <div
          style={{
            fontSize,
            lineHeight,
            color: '#5A4E7A',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            paddingLeft: '10px',
            whiteSpace: 'pre-line',
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
            margin: '6px 0 2px',
            padding: '2px 12px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(244, 114, 182, 0.45)',
            boxShadow: '0 2px 6px rgba(100, 70, 150, 0.08)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '11px', color: '#BE185D', fontWeight: 700, fontFamily: 'sans-serif' }}>
            @{socialUser.replace(/^@/, '')}
          </span>
        </div>
      )}

      {/* 6. Frase "Siempre en nuestro corazón" */}
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(123, 111, 154, 0.95)',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          marginTop: '6px',
          textAlign: 'center',
          margin: '6px 0 4px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        — Siempre en nuestro corazón
        <img
          src="/images/icons/plans/pawrosa.svg"
          alt=""
          style={{ width: '13px', height: '13px', opacity: 0.8 }}
        />
      </p>

      {/* Firma oficial discreta al pie */}
      <img
        src="/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png"
        alt="Ángeles en el Cielo"
        style={{
          width: '130px',
          height: 'auto',
          display: 'block',
          margin: '0 auto 4px',
          opacity: 0.85,
        }}
      />

      {/* 7. Botón para volver al anverso: "Volver a ver a {pet_name} ↺" */}
      <button
        data-download-ignore="true"
        onClick={(e) => {
          e.stopPropagation();
          onFlip();
        }}
        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#6D28D9] font-bold text-[11px] flex items-center gap-1.5 shadow-md border border-[#DDD6FE] transition-all hover:scale-105 active:scale-95 cursor-pointer z-30 select-none"
        title="Volver a ver retrato"
      >
        <span>Volver a ver a {nombre}</span>
        <span className="text-xs">↺</span>
      </button>
    </div>
  );
};
