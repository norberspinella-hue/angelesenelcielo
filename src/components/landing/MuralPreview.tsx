'use client'

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PetPreview {
  id: string
  pet_name: string
  photo_url: string
  profile_slug: string
}

export function MuralPreview() {
  const [latest, setLatest] = useState<PetPreview[]>([])
  const [founders, setFounders] = useState<PetPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mural/preview')
      .then(res => res.json())
      .then(data => {
        setLatest(data.latest || [])
        setFounders(data.founders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="mural-preview-card rounded-[24px] shadow-sm relative text-left">
      {/* Imagen de fondo */}
      <Image
        src="/images/mural preview/mural-preview.webp"
        alt="Mural de Ángeles"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center center', zIndex: 0 }}
      />
      {/* Overlay gradiente encima de la imagen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,248,244,0.65) 100%)'
      }} />

      {/* Content wrapper */}
      <div className="relative z-10 p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-stretch w-full">
        {/* Left Column */}
        <div className="mural-preview-left flex-1">
          <h3 className="text-[#1E2A78] font-bold text-lg sm:text-xl mb-4 sm:mb-6">Últimos añadidos</h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`loading-latest-${i}`} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="w-[60px] h-[60px] sm:w-[84px] sm:h-[84px] rounded-full bg-[rgba(180,150,220,0.20)] border-2 border-white/60" />
                  <span className="text-[9px] sm:text-[10px] text-[#706A95]/50 text-center font-medium leading-tight">Cargando...</span>
                </div>
              ))
            ) : latest.length > 0 ? (
              latest.map(pet => (
                <div key={pet.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="relative w-[60px] h-[60px] sm:w-[84px] sm:h-[84px]">
                    <img
                      src={pet.photo_url || '/images/placeholders/first.webp'}
                      alt={pet.pet_name}
                      className="w-[60px] h-[60px] sm:w-[84px] sm:h-[84px] rounded-full object-cover border-2 border-white/90 shadow-[0_2px_8px_rgba(100,70,150,0.20)]"
                    />
                  </div>
                  <span className="text-xs sm:text-[15px] text-[#706A95] text-center font-medium leading-tight max-w-[64px] sm:max-w-[84px] truncate">
                    {pet.pet_name}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#706A95', fontFamily: 'sans-serif', gridColumn: 'span 4' }}>
                Sé el primero en añadir tu mascota 🐾
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[#C9A961]/20 my-2" />
        <div className="md:hidden h-px w-full bg-[#C9A961]/20 my-2" />

        {/* Right Column */}
        <div className="mural-preview-right flex-1">
          <h3 className="text-[#1E2A78] font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span>Fundadores <span className="text-[#C9A961] text-base">★</span></span>
            <span className="text-[#706A95] text-xs sm:text-[15px] font-normal">
              (1000 primeros ángeles de 4 patas)
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`loading-founder-${i}`} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="w-[60px] h-[60px] sm:w-[84px] sm:h-[84px] rounded-full bg-[rgba(180,150,220,0.20)] border-2 border-white/60" />
                  <span className="text-[9px] sm:text-[10px] text-[#706A95]/50 text-center font-medium leading-tight">Cargando...</span>
                </div>
              ))
            ) : founders.length > 0 ? (
              founders.map(pet => (
                <div key={pet.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="relative w-[60px] h-[60px] sm:w-[84px] sm:h-[84px]">
                    <img
                      src={pet.photo_url || '/images/placeholders/first.webp'}
                      alt={pet.pet_name}
                      className="w-[60px] h-[60px] sm:w-[84px] sm:h-[84px] rounded-full object-cover border-2 border-white/90 shadow-[0_2px_8px_rgba(100,70,150,0.20)]"
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: -2, right: -2,
                      width: 16, height: 16,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9,
                      boxShadow: '0 0 4px rgba(255,215,0,0.80)',
                    }}>★</div>
                  </div>
                  <span className="text-xs sm:text-[15px] text-[#706A95] text-center font-medium leading-tight max-w-[64px] sm:max-w-[84px] truncate">
                    {pet.pet_name}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#706A95', fontFamily: 'sans-serif', gridColumn: 'span 4' }}>
                Conviértete en uno de los 1000 Ángeles Fundadores ⭐
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
