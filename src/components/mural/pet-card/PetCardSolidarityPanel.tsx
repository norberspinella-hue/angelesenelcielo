'use client';

import React from 'react';
import { ShelterPet } from '@/components/solidario/ApadrinarDrawer';

interface PetCardSolidarityPanelProps {
  isShelterPet: boolean;
  isSponsored: boolean;
  matchedShelterPet: ShelterPet;
  sponsorName: string;
  memorialPetName: string;
  onApadrinar?: (pet: ShelterPet) => void;
}

export const PetCardSolidarityPanel: React.FC<PetCardSolidarityPanelProps> = ({
  isShelterPet,
  isSponsored,
  matchedShelterPet,
  sponsorName,
  memorialPetName,
  onApadrinar,
}) => {
  if (!isShelterPet) return null;

  // Estado 2: Ya apadrinado (Cinta conmemorativa)
  if (isSponsored) {
    return (
      <div
        className="rounded-[24px] border border-[#FBCFE8] shadow-[0_12px_40px_rgba(244,114,182,0.22)] p-4 sm:p-[18px_16px] flex flex-col items-center overflow-hidden w-full max-w-[360px] text-center relative"
        style={{
          width: 'min(360px, calc(100vw - 20px))',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(255, 253, 254, 0.95) 0%, rgba(255, 245, 248, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#FFF0F5] border border-pink-200/80 shadow-xs">
          <img src="/images/icons/badge-alas-angel.webp" alt="Corazón de Ángel" className="w-5 h-5 object-contain" />
          <span className="text-[11px] font-extrabold text-[#BE185D] tracking-wider uppercase">
            Apadrinado · Corazón de Ángel
          </span>
          <img src="/images/icons/badge-alas-angel.webp" alt="Corazón de Ángel" className="w-5 h-5 object-contain" />
        </div>

        <h4 className="font-serif font-bold text-[16px] text-[#1E2A78] m-0 mb-1 leading-snug">
          «Apadrinado con amor por {sponsorName || 'un Ángel'}
          {memorialPetName ? ` en memoria de su ángel ${memorialPetName} 🐾` : ''}»
        </h4>

        <p className="text-[11.5px] text-[#706A95] m-0 leading-[1.4] font-sans">
          {matchedShelterPet.shelterName} {matchedShelterPet.shelterCity ? `· ${matchedShelterPet.shelterCity}` : ''} ·{' '}
          <strong className="text-[#BE185D]">Constelación de 9 estrellas</strong>
        </p>
      </div>
    );
  }

  // Estado 1: Esperando padrino (Banner de apadrinamiento solidario)
  return (
    <div
      className="rounded-[24px] border border-[#FBCFE8] shadow-[0_12px_36px_rgba(244,114,182,0.22)] p-4 sm:p-5 flex flex-col items-center overflow-hidden w-full max-w-[360px] text-center"
      style={{
        width: 'min(360px, calc(100vw - 20px))',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(255, 253, 254, 0.95) 0%, rgba(255, 245, 248, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#FFF0F5] border border-pink-200/80 shadow-xs">
        <img src="/images/icons/badge-alas-angel.webp" alt="Alas" className="w-5 h-5 object-contain" />
        <span className="text-[11px] font-extrabold text-[#BE185D] tracking-wider uppercase">
          Esperando mi Corazón de Ángel
        </span>
        <img src="/images/icons/badge-alas-angel.webp" alt="Alas" className="w-5 h-5 object-contain" />
      </div>

      <p className="text-xs text-[#5D4E75] mb-3 font-medium leading-relaxed">
        <strong className="text-[#1E2A78] text-[13px]">{matchedShelterPet.shelterName}</strong>{' '}
        {matchedShelterPet.shelterCity ? <span className="text-[#BE185D]">· {matchedShelterPet.shelterCity}</span> : ''}
        <br />
        <span className="text-[11px] text-[#706A95] mt-1.5 block">
          Actualmente tiene <strong className="text-[#BE185D]">1 sola estrella</strong> en el cielo. ¡Apadrínalo para transformar su recuerdo en una{' '}
          <strong className="text-[#1E2A78]">constelación de 9 estrellas (3x3)</strong>! Además el{' '}
          <strong className="text-[#BE185D] font-bold">50% del importe (5,00 €)</strong> se dona directamente a su refugio.
        </span>
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onApadrinar) {
            onApadrinar(matchedShelterPet);
          }
        }}
        className="w-full py-3 px-4 rounded-full text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
        style={{
          background: 'linear-gradient(135deg, #F86E9E 0%, #FA8994 50%, #FFB680 100%)',
          boxShadow:
            'inset 0 2px 3px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(255, 150, 100, 0.45), 0 0 0 1.5px rgba(255, 220, 130, 0.9), 0 4px 12px rgba(248, 110, 158, 0.25)',
          letterSpacing: '0.3px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
        }}
      >
        <span>💖</span>
        <span>Apadrinar sus 9 estrellas (5,00 €)</span>
        <span className="text-base leading-none font-bold">›</span>
      </button>
    </div>
  );
};
