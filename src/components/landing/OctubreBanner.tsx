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
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-2 px-3 sm:px-6 h-[50px] sm:h-[58px] md:h-[62px]">
        
        {/* Lado izquierdo: Banner conmemorativo de perros y velas */}
        <Link 
          href="/#planes" 
          className="flex items-center gap-2.5 sm:gap-3 overflow-hidden group cursor-pointer"
        >
          <div className="relative h-[38px] sm:h-[46px] md:h-[50px] w-auto aspect-[1024/126] shrink-0 rounded overflow-hidden">
            <Image 
              src="/images/campanas/banner-27-octubre.webp" 
              alt="27 de octubre - Encendamos una luz por nuestras mascotas" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden lg:flex flex-col text-left leading-tight">
            <span className="text-[10px] uppercase font-bold text-[#FDE68A] tracking-wider">
              Tradición del Día de Muertos de las Mascotas
            </span>
            <span className="text-xs text-white/90 font-medium group-hover:text-amber-200 transition-colors">
              Ellos regresan a visitarnos antes que nadie. Prepara su luz en el cielo.
            </span>
          </div>
        </Link>

        {/* Lado derecho: Botón CTA y Cerrar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/#planes" 
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
