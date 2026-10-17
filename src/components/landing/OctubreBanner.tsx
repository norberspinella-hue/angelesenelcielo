'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export function OctubreBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Solo mostrar si no fue cerrado en la sesión actual
    const dismissed = sessionStorage.getItem('dismiss_octubre_banner')
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('dismiss_octubre_banner', 'true')
  }

  if (!isVisible) return null

  return (
    <div 
      className="w-full relative z-40 text-white shadow-md transition-all border-b border-amber-500/30"
      style={{
        background: 'linear-gradient(90deg, #180B2B 0%, #341145 35%, #6B2310 75%, #B45309 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Lado izquierdo: Autobús y mensaje */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
          <span className="text-base sm:text-lg shrink-0 select-none animate-bounce" style={{ animationDuration: '3s' }}>
            🚌🌼
          </span>
          <div className="leading-snug truncate">
            <span className="font-extrabold text-[#FDE68A] uppercase tracking-wider text-[11px] sm:text-xs mr-2">
              27 de Octubre · Día de Muertos de las Mascotas
            </span>
            <span className="text-amber-100/90 hidden md:inline">
              El autobús de los angelitos ya viene de regreso a casa. Prepara su luz eterna en el cielo.
            </span>
          </div>
        </div>

        {/* Lado derecho: Botón CTA y Cerrar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/#planes"
            className="px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-slate-950 transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
            }}
          >
            <span>Esperar su llegada 🐾</span>
            <span className="text-[10px]">→</span>
          </Link>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 text-xs transition-colors rounded-full hover:bg-white/10"
            aria-label="Cerrar aviso conmemorativo"
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  )
}
