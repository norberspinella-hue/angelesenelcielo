'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface OctubreBannerProps {
  onVisibilityChange?: (visible: boolean) => void
}

export function OctubreBanner({ onVisibilityChange }: OctubreBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismiss_octubre_banner_27')
    if (!dismissed) {
      setIsVisible(true)
      onVisibilityChange?.(true)
    } else {
      onVisibilityChange?.(false)
    }
  }, [onVisibilityChange])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('dismiss_octubre_banner_27', 'true')
    onVisibilityChange?.(false)
  }

  if (!isVisible) return null

  return (
    <div 
      className="w-full bg-[#180A2D] border-b border-[#F5C842]/40 relative z-50 overflow-hidden text-white shadow-md select-none"
    >
      {/* Fondo artístico con los perritos y flores a la izquierda, y altar con velas a la derecha */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-30 sm:opacity-70">
        <div className="relative h-full w-[160px] sm:w-[220px]">
          <Image 
            src="/images/campanas/perritos-octubre-fade.webp" 
            alt="Perritos con flores y velas" 
            fill
            className="object-cover object-left"
            priority
          />
        </div>
        <div className="relative h-full w-[140px] sm:w-[200px] hidden md:block">
          <Image 
            src="/images/campanas/altar-octubre-fade.webp" 
            alt="Altar de velas" 
            fill
            className="object-cover object-right"
          />
        </div>
      </div>

      {/* Contenedor principal con textos vectoriales de máxima nitidez */}
      <div className="relative z-10 max-w-[1240px] mx-auto flex items-center justify-between gap-2 px-3 sm:px-6 h-[54px] sm:h-[60px]">
        
        {/* Lado izquierdo: Avatar miniatura de perritos + Textos conmemorativos */}
        <Link 
          href="/dia-de-muertos" 
          className="flex items-center gap-2.5 sm:gap-3.5 overflow-hidden group cursor-pointer"
        >
          <div className="relative h-[42px] sm:h-[48px] w-[66px] sm:w-[76px] shrink-0 rounded overflow-hidden shadow-inner border border-[#F5C842]/30">
            <Image 
              src="/images/campanas/perritos-octubre-fade.webp" 
              alt="27 de octubre - Día de Muertos de las Mascotas" 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-2">
              <span 
                className="font-bold text-sm sm:text-base text-[#FDE68A] tracking-wide drop-shadow-xs"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                27 de octubre
              </span>
              <span className="hidden sm:inline-block text-[#F59E0B] text-xs">✦</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-[#FCD34D]/90">
                Día de las Mascotas
              </span>
            </div>
            <span className="text-xs sm:text-sm text-white/95 font-medium group-hover:text-amber-200 transition-colors">
              Encendamos una luz por nuestras mascotas <span className="hidden lg:inline text-white/75">· Ellas regresan a visitarnos antes que nadie 🕯️</span>
            </span>
          </div>
        </Link>

        {/* Lado derecho: Botón CTA y Cerrar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/dia-de-muertos" 
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-[#180A2D] flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' }}
          >
            <span>Encender su luz 🕯️</span>
            <span className="text-[10px]">›</span>
          </Link>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 text-xs transition-colors rounded-full hover:bg-white/10"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  )
}
