'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface PostalStoryShareModalProps {
  isOpen: boolean
  onClose: () => void
  petName: string
  photoUrl: string
  birthDate?: string | null
  deathDate?: string | null
  dedication?: string | null
  socialHandle?: string | null
  planType?: string | null
  memorialUrl?: string
}

export default function PostalStoryShareModal({
  isOpen,
  onClose,
  petName,
  photoUrl,
  birthDate,
  deathDate,
  dedication,
  socialHandle,
  planType,
  memorialUrl,
}: PostalStoryShareModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ref del contenedor de exportación en resolución completa 1080x1920
  const storyExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const resolvedName = petName?.trim() || 'Mi Ángel'
  const resolvedPhoto = photoUrl || '/images/placeholders/first.webp'
  const resolvedUrl = memorialUrl || (typeof window !== 'undefined' ? window.location.href : 'https://todaslasmascotasvanalcielo.com')
  const resolvedDedication = dedication?.trim() || 'Siempre serás mi lugar favorito en el mundo.'

  // Dynamic font size for pet name
  const nameLen = resolvedName.length
  let previewNameSize = 44
  let exportNameSize = 120
  if (nameLen > 18) {
    previewNameSize = 26
    exportNameSize = 72
  } else if (nameLen > 14) {
    previewNameSize = 30
    exportNameSize = 84
  } else if (nameLen > 10) {
    previewNameSize = 36
    exportNameSize = 98
  } else if (nameLen > 7) {
    previewNameSize = 40
    exportNameSize = 110
  }

  // Dynamic font size for dedication
  const dedLen = resolvedDedication.length
  let previewDedSize = 11.5
  let previewDedLineHeight = 1.45
  let exportDedSize = 32
  let exportDedLineHeight = 1.48

  if (dedLen > 300) {
    previewDedSize = 8.5
    previewDedLineHeight = 1.25
    exportDedSize = 22
    exportDedLineHeight = 1.30
  } else if (dedLen > 180) {
    previewDedSize = 9.5
    previewDedLineHeight = 1.32
    exportDedSize = 25
    exportDedLineHeight = 1.36
  } else if (dedLen > 100) {
    previewDedSize = 10.5
    previewDedLineHeight = 1.38
    exportDedSize = 28
    exportDedLineHeight = 1.42
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Generación PNG a 1080 × 1920
  const generatePngDataUrl = async (): Promise<string | null> => {
    if (!storyExportRef.current) return null
    const { toPng } = await import('html-to-image')

    return await toPng(storyExportRef.current, {
      width: 1080,
      height: 1920,
      pixelRatio: 1,
      cacheBust: true,
      style: {
        transform: 'none',
        visibility: 'visible',
        display: 'flex',
      },
    })
  }

  // Compartir en Instagram (Web Share API o descarga directa con aviso)
  const handleShareInstagram = async () => {
    try {
      setIsExporting(true)
      const dataUrl = await generatePngDataUrl()
      if (!dataUrl) throw new Error('No se pudo generar la imagen')

      const filename = `angeles-en-el-cielo-${resolvedName.toLowerCase().replace(/\s+/g, '-')}-story.png`

      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          const file = new File([blob], filename, { type: 'image/png' })

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Story de ${resolvedName} · Ángeles en el Cielo`,
              text: `En memoria de mi ángel ${resolvedName} 🐾✨`,
            })
            showToast('¡Listo para publicar en tu Story! 🐾✨')
            setIsExporting(false)
            return
          }
        } catch (shareErr) {
          console.log('Navegador canceló Web Share o no compatible con archivo, descargando:', shareErr)
        }
      }

      // Descarga directa
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      showToast('¡Story guardada en tu galería! Ya puedes abrir Instagram y publicarla ✨')
    } catch (err) {
      console.error('Error generando Story:', err)
      showToast('No se pudo generar la imagen. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  // Guardar imagen PNG 1080x1920
  const handleSaveImage = async () => {
    try {
      setIsExporting(true)
      const dataUrl = await generatePngDataUrl()
      if (!dataUrl) throw new Error('No se pudo generar la imagen')

      const filename = `angeles-en-el-cielo-${resolvedName.toLowerCase().replace(/\s+/g, '-')}-story.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      showToast('¡Story descargada en alta resolución (1080×1920)! 💌🖼️')
    } catch (err) {
      console.error('Error guardando imagen:', err)
      showToast('No se pudo guardar la imagen.')
    } finally {
      setIsExporting(false)
    }
  }

  // Compartir en WhatsApp
  const handleShareWhatsApp = () => {
    const text = `Te comparto el recuerdo especial de mi angelito ${resolvedName} en Ángeles en el Cielo 🐾✨\nPuedes visitarlo aquí:\n${resolvedUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Copiar enlace del memorial
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(resolvedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      showToast('¡Enlace del memorial copiado al portapapeles! 📋✨')
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{
        background: 'rgba(25, 18, 38, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] px-5 py-3 rounded-full bg-white text-[#BE185D] border-2 border-[#FBCFE8] shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <span>💖</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL PRINCIPAL DE 2 COLUMNAS */}
      <div 
        className="relative w-full max-w-[940px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_24px_60px_rgba(74,31,110,0.22)] border border-white/80 p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN X CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] flex items-center justify-center transition-colors z-20 text-sm font-bold"
          title="Cerrar"
        >
          ✕
        </button>

        {/* COLUMNA IZQUIERDA: VISTA PREVIA STORY 9:16 (55-60%) */}
        <div className="w-full md:w-[54%] flex justify-center items-center shrink-0">
          <div 
            className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[9/16] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_16px_40px_rgba(168,85,247,0.25)] border-[2.5px] border-[#FCE7F3]"
            style={{
              backgroundImage: 'url(/images/memorial/story-heaven-bg-1080.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Contenido superpuesto de la Story */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-5 select-none pointer-events-none">
              
              {/* ZONA SUPERIOR: MI ANGELITO + NOMBRE */}
              <div className="w-full flex flex-col items-center text-center mt-2">
                <span 
                  className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#4A3258] uppercase"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  MI ANGELITO
                </span>

                <h2 
                  className="font-normal leading-tight mt-0.5 tracking-tight"
                  style={{
                    fontFamily: "'Allura', 'Pinyon Script', cursive",
                    fontSize: `${previewNameSize}px`,
                    color: '#B8860B',
                    textShadow: '0 1px 2px rgba(255,255,255,0.9), 0 2px 8px rgba(184,134,11,0.28)',
                  }}
                >
                  {resolvedName}
                </h2>

                {/* Corazón dorado sutil bajo el nombre (idéntico al mockup) */}
                <div className="mt-0.5 text-[11px] sm:text-[13px] text-[#D4AF37] select-none">
                  💛
                </div>
              </div>

              {/* ZONA CENTRAL: FOTO CON AUREOLA Y MARIPOSAS */}
              <div className="relative flex flex-col items-center justify-center my-auto">
                {/* Aureola dorada inclinada flotando sobre la cabeza */}
                <div 
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-[116px] h-[32px] flex items-center justify-center pointer-events-none"
                  style={{ transform: 'translateX(-50%) rotate(-4deg)' }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 220 70" fill="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <filter id="haloStoryPreviewGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="haloGoldGradPreview" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFA000" />
                        <stop offset="25%" stopColor="#FFD54F" />
                        <stop offset="50%" stopColor="#FFF9C4" />
                        <stop offset="75%" stopColor="#FFD54F" />
                        <stop offset="100%" stopColor="#FFA000" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFD54F" strokeWidth="8" opacity="0.85" filter="url(#haloStoryPreviewGlow)" />
                    <ellipse cx="110" cy="35" rx="95" ry="24" stroke="url(#haloGoldGradPreview)" strokeWidth="4.5" opacity="1.0" />
                    <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFFFFF" strokeWidth="2.2" opacity="1.0" />
                  </svg>
                </div>

                {/* Mariposas luminosas flotantes (posicionadas a los lados del pecho como en el mockup) */}
                <div className="absolute -left-7 bottom-3 w-7 h-7 opacity-95 pointer-events-none">
                  <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain -rotate-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                </div>
                <div className="absolute -right-7 bottom-5 w-6 h-6 opacity-95 pointer-events-none">
                  <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain rotate-15 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                </div>

                {/* Resplandor cálido exterior */}
                <div 
                  className="absolute -inset-4 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 235, 170, 0.70) 0%, rgba(254, 215, 226, 0.45) 50%, transparent 75%)',
                    filter: 'blur(10px)',
                  }}
                />

                {/* Círculo de la foto real con fusión suave de nubes */}
                <div 
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-white z-0"
                  style={{
                    border: '3px solid rgba(254, 240, 138, 0.90)',
                    boxShadow: '0 0 20px rgba(250, 204, 21, 0.45), 0 10px 30px rgba(180, 140, 80, 0.28)',
                  }}
                >
                  <img 
                    src={resolvedPhoto} 
                    alt={resolvedName} 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous"
                  />
                  {/* Fusión suave inferior con las nubes */}
                  <div 
                    className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(255, 245, 235, 0.70) 0%, rgba(255, 245, 235, 0.20) 50%, transparent 100%)',
                    }}
                  />
                </div>
              </div>

              {/* ZONA EMOCIONAL: DEDICATORIA */}
              <div className="w-full text-center px-2 mb-2">
                <p 
                  className="font-serif italic text-[#3B2648] m-0 max-w-[280px] mx-auto line-clamp-4"
                  style={{
                    fontSize: `${previewDedSize}px`,
                    lineHeight: previewDedLineHeight,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: '0 1px 2px rgba(255,255,255,0.85)',
                  }}
                >
                  “{resolvedDedication}”
                </p>

                {/* Pequeño corazón dorado */}
                <div className="mt-1.5 text-[9px] text-[#D4AF37]">
                  💛
                </div>

                {/* Frase fija */}
                <p 
                  className="text-[8.5px] sm:text-[9.5px] font-medium text-[#655C86] mt-1 tracking-wide"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Tu recuerdo sigue brillando aquí.
                </p>

                {/* FIRMA OFICIAL */}
                <div className="flex flex-col items-center mt-1.5">
                  <span 
                    className="text-[17px] sm:text-[19px] leading-tight text-[#B8860B]"
                    style={{
                      fontFamily: "'Allura', 'Pinyon Script', cursive",
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    Ángeles en el Cielo
                  </span>
                  
                  {/* Trazo divisorio con corazón */}
                  <div className="flex items-center justify-center gap-1.5 w-24 -mt-0.5 opacity-75">
                    <div className="h-[0.6px] flex-1 bg-[#C29028]"></div>
                    <span className="text-[7px] text-[#C29028]">♡</span>
                    <div className="h-[0.6px] flex-1 bg-[#C29028]"></div>
                  </div>

                  <span className="text-[5.5px] sm:text-[6.5px] font-bold tracking-[0.24em] text-[#8B7B9E] uppercase mt-0.5">
                    TODOS LOS PERROS VAN AL CIELO
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TEXTO Y BOTONES DE ACCIÓN (40-45%) */}
        <div className="w-full md:w-[46%] flex flex-col justify-center items-start text-left">
          
          {/* BADGE SUPERIOR */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] shadow-xs mb-3">
            <span className="text-xs">💗</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#BE185D] tracking-wide">
              Su recuerdo ya está listo ✨
            </span>
          </div>

          {/* TÍTULO PRINCIPAL */}
          <h3 
            className="text-xl sm:text-2xl font-bold text-[#1E1B4B] leading-snug mb-2 font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {resolvedName} tiene ahora una Story creada especialmente para él.
          </h3>

          {/* SUBTÍTULO */}
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-5">
            Si quieres, ahora puedes compartir su recuerdo con quienes también le quisieron.
          </p>

          {/* BOTONES DE ACCIÓN */}
          <div className="w-full flex flex-col gap-2.5 sm:gap-3">
            
            {/* BOTÓN 1: PRINCIPAL CTA (COMPARTIR STORY) */}
            <button
              onClick={handleShareInstagram}
              disabled={isExporting}
              className="w-full py-3 sm:py-3.5 px-5 rounded-full text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-[0_8px_20px_rgba(236,72,153,0.30)] hover:shadow-[0_12px_28px_rgba(236,72,153,0.40)] transition-all hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-75"
              style={{
                background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 45%, #A855F7 100%)',
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Icono Instagram SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>{isExporting ? 'Generando Story...' : 'Compartir Story'}</span>
              </div>
              <span className="text-sm font-bold opacity-90 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {/* BOTÓN 2: COMPARTIR POR WHATSAPP */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#F9FAFB] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#E5E7EB] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2.5">
                {/* Icono WhatsApp verde */}
                <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.112.551 4.095 1.517 5.823l-1.611 5.885 6.046-1.586c1.667.909 3.57 1.428 5.594 1.428 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <span>Compartir por WhatsApp</span>
              </div>
              <span className="text-xs text-[#9CA3AF] transition-transform group-hover:translate-x-1">→</span>
            </button>

            {/* BOTÓN 3: GUARDAR IMAGEN */}
            <button
              onClick={handleSaveImage}
              disabled={isExporting}
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#F9FAFB] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#E5E7EB] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-75"
            >
              <div className="flex items-center gap-2.5">
                {/* Icono Descargar */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Guardar imagen</span>
              </div>
              <span className="text-xs text-[#9CA3AF] transition-transform group-hover:translate-x-1">→</span>
            </button>

            {/* BOTÓN 4: COPIAR ENLACE */}
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#F9FAFB] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#E5E7EB] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2.5">
                {/* Icono Enlace */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{copied ? '✓ Enlace copiado' : 'Copiar enlace del memorial'}</span>
              </div>
              <span className="text-xs text-[#9CA3AF] transition-transform group-hover:translate-x-1">→</span>
            </button>

          </div>

          {/* TARJETA INFERIOR DE PIE (LAVANDA EMOCIONAL) */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE]/60 flex items-center gap-3">
            <span className="text-base text-[#8B5CF6] shrink-0">💜</span>
            <p className="text-[11px] sm:text-xs text-[#584582] leading-relaxed m-0 font-medium">
              Esta Story es un recuerdo especial de {resolvedName} para que su luz siga llegando a más corazones.
            </p>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* CONTENEDOR OCULTO DE ALTA RESOLUCIÓN: 1080 × 1920 PX                      */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'fixed',
          top: -99999,
          left: -99999,
          width: 1080,
          height: 1920,
          overflow: 'hidden',
          visibility: 'hidden',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <div
          ref={storyExportRef}
          style={{
            width: 1080,
            height: 1920,
            backgroundImage: 'url(/images/memorial/story-heaven-bg-1080.png)',
            backgroundSize: '1080px 1920px',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '70px 60px 80px 60px',
            boxSizing: 'border-box',
          }}
        >
          {/* 1. TOP: MI ANGELITO + NOMBRE */}
          <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '0.24em',
                color: '#4A3258',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              MI ANGELITO
            </span>

            <h1
              style={{
                fontFamily: "'Allura', 'Pinyon Script', cursive",
                fontSize: exportNameSize,
                color: '#B8860B',
                fontWeight: 400,
                margin: 0,
                lineHeight: 1.1,
                textShadow: '0 2px 4px rgba(255,255,255,0.9), 0 4px 18px rgba(184,134,11,0.35)',
              }}
            >
              {resolvedName}
            </h1>

            {/* Corazón dorado sutil bajo el nombre (idéntico al mockup) */}
            <div style={{ fontSize: 28, color: '#D4AF37', marginTop: 8 }}>
              💛
            </div>
          </div>

          {/* 2. CENTRO: FOTO CIRCULAR PROTAGONISTA CON HALO Y MARIPOSAS */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
            
            {/* Halo celestial dorado a escala 1080 */}
            <div
              style={{
                position: 'absolute',
                top: -42,
                left: '50%',
                transform: 'translateX(-50%) rotate(-4deg)',
                width: 390,
                height: 104,
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 220 70" fill="none" style={{ overflow: 'visible' }}>
                <defs>
                  <filter id="haloStoryExportGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="haloGoldGradExport" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFA000" />
                    <stop offset="25%" stopColor="#FFD54F" />
                    <stop offset="50%" stopColor="#FFF9C4" />
                    <stop offset="75%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#FFA000" />
                  </linearGradient>
                </defs>
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFD54F" strokeWidth="8" opacity="0.85" filter="url(#haloStoryExportGlow)" />
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="url(#haloGoldGradExport)" strokeWidth="4.5" opacity="1.0" />
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFFFFF" strokeWidth="2.4" opacity="1.0" />
              </svg>
            </div>

            {/* Mariposas decorativas a los lados */}
            <img 
              src="/images/icons/butterfly1.svg" 
              alt="" 
              style={{
                position: 'absolute',
                left: -76,
                bottom: 30,
                width: 76,
                height: 76,
                transform: 'rotate(-12deg)',
                filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.95))',
                zIndex: 5,
              }}
            />
            <img 
              src="/images/icons/butterfly2.svg" 
              alt="" 
              style={{
                position: 'absolute',
                right: -76,
                bottom: 45,
                width: 70,
                height: 70,
                transform: 'rotate(15deg)',
                filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.95))',
                zIndex: 5,
              }}
            />

            {/* Resplandor cálido exterior */}
            <div
              style={{
                position: 'absolute',
                inset: -24,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 235, 170, 0.75) 0%, rgba(254, 215, 226, 0.50) 50%, transparent 75%)',
                filter: 'blur(22px)',
              }}
            />

            {/* Marco circular de la foto con fusión inferior */}
            <div
              style={{
                width: 440,
                height: 440,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '8px solid rgba(254, 240, 138, 0.92)',
                boxShadow: '0 0 45px rgba(250, 204, 21, 0.50), 0 25px 70px rgba(180, 140, 80, 0.35)',
                backgroundColor: '#FFFFFF',
                position: 'relative',
              }}
            >
              <img
                src={resolvedPhoto}
                alt={resolvedName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                crossOrigin="anonymous"
              />
              {/* Fusión suave inferior con las nubes */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '35%',
                  background: 'linear-gradient(to top, rgba(255, 245, 235, 0.75) 0%, rgba(255, 245, 235, 0.20) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* 3. ZONA EMOCIONAL: DEDICATORIA + CIERRE */}
          <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: exportDedSize,
                lineHeight: exportDedLineHeight,
                color: '#3B2648',
                margin: '0 auto 16px auto',
                maxWidth: 820,
                textShadow: '0 2px 4px rgba(255,255,255,0.9)',
              }}
            >
              “{resolvedDedication}”
            </p>

            {/* Corazón dorado */}
            <div style={{ fontSize: 28, color: '#D4AF37', marginBottom: 10 }}>
              💛
            </div>

            {/* Frase fija */}
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 26,
                fontWeight: 600,
                color: '#655C86',
                margin: '0 0 24px 0',
                letterSpacing: 0.5,
              }}
            >
              Tu recuerdo sigue brillando aquí.
            </p>

            {/* FIRMA OFICIAL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: "'Allura', 'Pinyon Script', cursive",
                  fontSize: 54,
                  color: '#B8860B',
                  lineHeight: 1,
                  textShadow: '0 2px 4px rgba(255,255,255,0.9)',
                }}
              >
                Ángeles en el Cielo
              </span>

              {/* Trazo divisorio con corazón */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: 280, marginTop: 4, opacity: 0.8 }}>
                <div style={{ height: 1.5, flex: 1, backgroundColor: '#C29028' }} />
                <span style={{ fontSize: 18, color: '#C29028' }}>♡</span>
                <div style={{ height: 1.5, flex: 1, backgroundColor: '#C29028' }} />
              </div>

              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  color: '#8B7B9E',
                  textTransform: 'uppercase',
                  marginTop: 10,
                }}
              >
                TODOS LOS PERROS VAN AL CIELO
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
