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
  const [activeTab, setActiveTab] = useState<'story' | 'postal'>('story')
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ref de los contenedores de alta resolución ocultos
  const storyExportRef = useRef<HTMLDivElement>(null)
  const postalExportRef = useRef<HTMLDivElement>(null)

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

  // Cálculo del tamaño de fuente dinámico para evitar que nombres largos (ej: Mary Margaret) salten de línea
  const nameLen = resolvedName.length
  let previewFontSize = 54
  let exportFontSize = 76
  if (nameLen > 16) {
    previewFontSize = 26
    exportFontSize = 38
  } else if (nameLen > 13) {
    previewFontSize = 32
    exportFontSize = 46
  } else if (nameLen > 10) {
    previewFontSize = 38
    exportFontSize = 56
  } else if (nameLen > 7) {
    previewFontSize = 46
    exportFontSize = 66
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    const trimmed = String(dateStr).trim()
    if (!trimmed) return null
    if (/^\d{4}$/.test(trimmed)) return trimmed

    const parts = trimmed.split(/[-/T]/)
    if (parts.length >= 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const localDate = new Date(year, month, day)
      if (!isNaN(localDate.getTime())) {
        return localDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
    }

    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
    return trimmed
  }

  const birthDateFormatted = formatDate(birthDate)
  const deathDateFormatted = formatDate(deathDate)
  const datesText = birthDateFormatted && deathDateFormatted
    ? `${birthDateFormatted} – ${deathDateFormatted}`
    : deathDateFormatted
      ? `${deathDateFormatted}`
      : birthDateFormatted
        ? `${birthDateFormatted}`
        : null

  const resolvedDedication = dedication?.trim() || 'Siempre serás mi lugar favorito en el mundo.'
  const resolvedHandle = socialHandle?.replace(/^@/, '') || null

  const dedLen = resolvedDedication.length
  let exportDedSize = 25
  let exportDedLineHeight = 1.48
  let previewDedSize = 8
  let previewDedLineHeight = 1.35

  if (dedLen > 450) {
    exportDedSize = 16
    exportDedLineHeight = 1.32
    previewDedSize = 5.8
    previewDedLineHeight = 1.18
  } else if (dedLen > 280) {
    exportDedSize = 18.5
    exportDedLineHeight = 1.38
    previewDedSize = 6.6
    previewDedLineHeight = 1.22
  } else if (dedLen > 150) {
    exportDedSize = 21.5
    exportDedLineHeight = 1.44
    previewDedSize = 7.3
    previewDedLineHeight = 1.28
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Generar y descargar / compartir
  const handleExport = async (mode: 'story' | 'postal') => {
    const targetRef = mode === 'story' ? storyExportRef.current : postalExportRef.current
    if (!targetRef) return

    try {
      setIsExporting(true)
      const { toPng } = await import('html-to-image')

      const isStory = mode === 'story'
      const width = 1080
      const height = isStory ? 1920 : 1080

      const dataUrl = await toPng(targetRef, {
        pixelRatio: 1,
        width,
        height,
        cacheBust: true,
        style: {
          transform: 'none',
          visibility: 'visible',
          display: 'flex',
        },
      })

      const filename = `${resolvedName.toLowerCase().replace(/\s+/g, '-')}-${isStory ? 'story-instagram' : 'postal-dedicatoria'}.png`

      // Intentar compartir de forma nativa en móviles si está soportado
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          const file = new File([blob], filename, { type: 'image/png' })

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${resolvedName} ya brilla en el cielo ✨`,
              text: `Mi ángel ${resolvedName} ya tiene su lugar eterno en el cielo 🐾✨`,
            })
            showToast('¡Compartido con éxito! 🐾')
            setIsExporting(false)
            return
          }
        } catch (shareErr) {
          console.log('Compartir nativo cancelado o no disponible, procediendo a descarga:', shareErr)
        }
      }

      // Descarga directa en navegador / escritorio
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()

      if (isStory) {
        showToast('¡Story descargada! Ya puedes abrir Instagram y subirla ✨')
      } else {
        showToast('¡Postal con dedicatoria guardada en tu galería! 💌🖼️')
      }
    } catch (err) {
      console.error('Error generando imagen:', err)
      showToast('No se pudo generar la imagen. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareWhatsApp = () => {
    const text = `Mi ángel ${resolvedName} ya brilla en el cielo 🐾✨\nPuedes visitar su recuerdo aquí:\n${resolvedUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(resolvedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      showToast('¡Enlace copiado al portapapeles! 📋')
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{
        background: 'rgba(20, 15, 35, 0.70)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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

      {/* Contenedor Modal: Visor Corazón Ghibli */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#FFFDFE] via-[#FFF8FA] to-[#FFF5F8] border-2 border-[#FBCFE8] rounded-[32px] shadow-[0_25px_60px_-12px_rgba(190,24,93,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset] p-5 sm:p-7 flex flex-col items-center text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pink-100/80 hover:bg-pink-200 text-[#BE185D] hover:text-[#9D174D] flex items-center justify-center transition-all text-sm font-bold z-10 border border-pink-200 shadow-xs cursor-pointer"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="text-center max-w-md mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#BE185D] border border-pink-300 text-xs font-bold mb-2 shadow-xs">
            <span>💖</span>
            <span>Comparte su luz en el mundo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif italic text-[#1E2A78] tracking-wide">
            Recuerdo de {resolvedName}
          </h2>
          <p className="text-xs sm:text-sm text-[#706A95] mt-1 font-medium">
            {activeTab === 'story'
              ? 'Sube la Story formateada a Instagram o WhatsApp con 1 clic.'
              : 'Descarga la Postal conmemorativa con su dedicatoria de amor y fechas.'}
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-2 p-1.5 bg-pink-50/80 border border-pink-200 rounded-full mb-5 w-full max-w-sm justify-center shadow-inner">
          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-sm'
                : 'text-[#706A95] hover:text-[#1E2A78]'
            }`}
          >
            <span>📱</span>
            <span>Story 9:16</span>
          </button>
          <button
            onClick={() => setActiveTab('postal')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'postal'
                ? 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-sm'
                : 'text-[#706A95] hover:text-[#1E2A78]'
            }`}
          >
            <span>💌</span>
            <span>Postal con Dedicatoria 1:1</span>
          </button>
        </div>

        {/* ÁREA DE PREVISUALIZACIÓN EN VIVO (Escalada para que entre cómoda en cualquier pantalla) */}
        <div className="w-full flex items-center justify-center my-2 overflow-hidden">
          {activeTab === 'story' ? (
            /* Vista previa Story 9:16 (escalada a 260px ancho) */
            <div 
              className="relative rounded-[22px] overflow-hidden shadow-xl border-2 border-[#FBCFE8] flex flex-col items-center justify-between select-none"
              style={{
                width: 250,
                height: 444, // 9:16
                background: 'radial-gradient(ellipse at 50% 30%, #FFFDFE 0%, #FFF5F8 50%, #FCE7F3 100%)',
                padding: '16px 12px',
              }}
            >
              {/* Estrellitas de fondo */}
              <div className="absolute top-4 left-4 text-[11px] text-[#F59E0B] animate-pulse">✦</div>
              <div className="absolute top-12 right-6 text-[9px] text-[#F59E0B]/70">✧</div>
              <div className="absolute bottom-16 left-6 text-[10px] text-[#F59E0B]/80">⋆</div>
              <div className="absolute bottom-20 right-5 text-[12px] text-[#F59E0B] animate-pulse">✦</div>

              {/* Top badge */}
              <div className="z-10 px-3.5 py-1 rounded-full bg-white/95 border-2 border-[#FBCFE8] text-[#BE185D] text-[9px] font-black tracking-wider uppercase text-center shadow-xs">
                ✨ MI ÁNGEL YA BRILLA EN EL CIELO ✨
              </div>

              {/* Profile Card miniatura */}
              <div 
                className="relative rounded-[16px] overflow-hidden shadow-xl border-[1.5px] border-white/90 z-10"
                style={{
                  width: 200,
                  height: 278,
                  backgroundImage: "url('/images/mural-preview/profilecard-front.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* MI ANGELITO Arco */}
                <div className="absolute top-[18px] left-0 right-0 flex justify-center pointer-events-none">
                  <svg width="150" height="22" viewBox="0 0 260 38" fill="none">
                    <path id="archTextMini" d="M 20,32 Q 130,8 240,32" fill="none" />
                    <text fill="#584582" fontFamily="Georgia, serif" fontSize="22" fontWeight="700" letterSpacing="3" textAnchor="middle">
                      <textPath href="#archTextMini" startOffset="50%">MI ANGELITO</textPath>
                    </text>
                  </svg>
                </div>

                {/* Nombre */}
                <div 
                  className="absolute top-[32px] left-0 right-0 h-[38px] flex items-center justify-center text-center px-2"
                  style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: previewFontSize * 0.58,
                    color: '#C29028',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {resolvedName}
                </div>

                {/* Corazón 3D */}
                <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-10">
                  <svg width="9" height="9" viewBox="0 0 24 24">
                    <path fill="#C29028" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>

                {/* Halo */}
                <div 
                  className="absolute top-[85px] left-1/2 -translate-x-1/2 rounded-full border border-[#F5C842] shadow-[0_0_8px_#F5C842]"
                  style={{ width: 66, height: 18 }}
                />

                {/* Foto circular */}
                <div 
                  className="absolute top-[102px] left-1/2 -translate-x-1/2 rounded-full overflow-hidden border border-[#C9A961] shadow-md bg-white"
                  style={{ width: 95, height: 95 }}
                >
                  <img 
                    src={resolvedPhoto} 
                    alt={resolvedName} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Frase */}
                <div className="absolute bottom-[24px] left-0 right-0 px-2 text-center text-[8px] font-bold text-[#584582] font-serif">
                  Siempre serás mi lugar favorito en el mundo
                </div>

                {/* Pie */}
                <div className="absolute bottom-[8px] left-0 right-0 text-center text-[7px] font-semibold text-[#584582]/80">
                  Ángeles en el Cielo
                </div>
              </div>

              {/* Bottom Branding */}
              <div className="z-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black text-[#1E2A78] tracking-wide">
                  🐾 TodasLasMascotasVanAlCielo.com
                </span>
                <span className="text-[8.5px] text-[#BE185D] font-bold italic mt-0.5">
                  Un millón Ángeles, un solo cielo.
                </span>
              </div>
            </div>
          ) : (
            /* Vista previa Postal de Amor 1:1 (escalada a 270px) */
            <div 
              className="relative rounded-[22px] overflow-hidden shadow-xl border-2 border-[#FBCFE8] flex flex-col items-center justify-center select-none"
              style={{
                width: 270,
                height: 270,
                background: 'radial-gradient(ellipse at 50% 30%, #FFFDFE 0%, #FFF5F8 50%, #FCE7F3 100%)',
                padding: '10px',
              }}
            >
              {/* Estrellitas */}
              <div className="absolute top-2.5 left-3 text-[10px] text-[#F59E0B]">✦</div>
              <div className="absolute bottom-2.5 right-3 text-[10px] text-[#F59E0B]">✦</div>

              {/* Contenedor central postal con fondo de dedicatoria */}
              <div 
                className="w-full h-full rounded-[16px] border border-white/90 p-2.5 flex flex-col items-center justify-between shadow-xs overflow-hidden relative"
                style={{
                  backgroundImage: "url('/images/mural-preview/profilecard-back.webp')",
                  backgroundColor: '#fbf2f8',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Cabecera */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1">
                    <img src="/images/icons/Logoheart.svg" alt="" className="w-3 h-3 object-contain" />
                    <span className="text-[7.5px] font-bold text-[#4A3F6B] tracking-wider font-serif italic">
                      HISTORIA DE AMOR
                    </span>
                  </div>
                  <div 
                    className="h-5 flex items-center justify-center -mt-0.5"
                    style={{
                      fontFamily: "'Pinyon Script', cursive",
                      fontSize: previewFontSize * 0.44,
                      color: '#C29028',
                    }}
                  >
                    {resolvedName}
                  </div>
                </div>

                {/* Foto circular con halo y medalla */}
                <div className="relative flex flex-col items-center my-0.5">
                  <div 
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full border border-[#F5C842] shadow-[0_0_5px_#F5C842]"
                    style={{ width: 48, height: 13 }}
                  />
                  <div 
                    className="w-14 h-14 rounded-full overflow-hidden border-[1.5px] border-[#C9A961] shadow-xs bg-white relative mt-0.5"
                  >
                    <img 
                      src={resolvedPhoto} 
                      alt={resolvedName} 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous"
                    />
                  </div>
                  {/* Fechas */}
                  {datesText && (
                    <div className="text-[6.5px] font-semibold text-[#8A7B9B] mt-0.5 leading-none tracking-tight">
                      {datesText}
                    </div>
                  )}
                </div>

                {/* Dedicatoria real con marco pergamino */}
                <div 
                  className="w-full max-w-[230px] rounded-lg px-2 py-1 text-center my-0.5 border-l-2 border-r-2 border-[#EC6F9B]/50 bg-white/70 shadow-xs flex items-center justify-center"
                >
                  <p 
                    className="font-serif italic text-[#4A3F6B] m-0 line-clamp-3"
                    style={{
                      fontSize: previewDedSize,
                      lineHeight: previewDedLineHeight,
                    }}
                  >
                    “{resolvedDedication}”
                  </p>
                </div>

                {/* Pie con usuario y marca */}
                <div className="text-center flex flex-col items-center gap-0.5">
                  {resolvedHandle && (
                    <span className="text-[6px] font-bold text-[#BE185D] bg-white/80 px-2 py-0.5 rounded-full border border-pink-200">
                      @{resolvedHandle}
                    </span>
                  )}
                  <span className="text-[6px] text-[#7E6B8F] font-semibold font-serif">
                    Ángeles en el Cielo · todaslasmascotasvanalcielo.com
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCIONES Y BOTONES */}
        <div className="w-full flex flex-col gap-2.5 mt-4 max-w-md">
          {/* Botón Principal: Subir a Instagram Stories o Descargar Postal */}
          <button
            onClick={() => handleExport(activeTab)}
            disabled={isExporting}
            className="w-full py-3.5 px-6 rounded-full text-white text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50 select-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #F86E9E 0%, #FA8994 50%, #FFB680 100%)',
              boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(255, 150, 100, 0.45), 0 0 0 1.5px rgba(255, 220, 130, 0.9), 0 4px 14px rgba(248, 110, 158, 0.35)',
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
            }}
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generando recuerdo en alta calidad...</span>
              </>
            ) : activeTab === 'story' ? (
              <>
                <span className="text-lg">📲</span>
                <span>Subir a Instagram Stories (9:16)</span>
              </>
            ) : (
              <>
                <span className="text-lg">💌</span>
                <span>Descargar Postal con Dedicatoria (1:1)</span>
              </>
            )}
          </button>

          {/* Botones secundarios */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-full text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs border border-[#16a34a]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>💬</span>
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-full text-xs font-bold bg-white hover:bg-pink-50 text-[#1E2A78] border border-pink-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>

        {/* Microcopy de apoyo */}
        <p className="text-xs text-[#706A95] mt-4 text-center font-medium">
          💡 En tu teléfono se abrirá la opción de publicar directamente en tu Historia de Instagram o guardarla en tus fotos.
        </p>
      </div>

      {/* ============================================================== */}
      {/* CONTENEDORES OCULTOS DE ALTA RESOLUCIÓN (1080×1920 y 1080×1080) */}
      {/* ============================================================== */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: -99999,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {/* STORY 9:16 (1080 × 1920) */}
        <div
          ref={storyExportRef}
          style={{
            width: 1080,
            height: 1920,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '100px 60px',
            background: 'radial-gradient(ellipse at 50% 30%, #FFFDFE 0%, #FFF5F8 50%, #FCE7F3 100%)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Estrellas decorativas */}
          <div style={{ position: 'absolute', top: 120, left: 100, fontSize: 38, color: '#F59E0B' }}>✦</div>
          <div style={{ position: 'absolute', top: 220, right: 120, fontSize: 30, color: 'rgba(245, 158, 11, 0.75)' }}>✧</div>
          <div style={{ position: 'absolute', bottom: 350, left: 110, fontSize: 34, color: 'rgba(245, 158, 11, 0.85)' }}>⋆</div>
          <div style={{ position: 'absolute', bottom: 420, right: 90, fontSize: 42, color: '#F59E0B' }}>✦</div>

          {/* Top Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 48px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3.5px solid #FBCFE8',
              color: '#BE185D',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 3,
              boxShadow: '0 8px 30px rgba(190, 24, 93, 0.12)',
            }}
          >
            ✨ MI ÁNGEL YA BRILLA EN EL CIELO ✨
          </div>

          {/* Tarjeta Frontal Oficial Escalada a 720 × 1000 */}
          <div
            style={{
              position: 'relative',
              width: 720,
              height: 1000,
              borderRadius: 48,
              border: '5px solid rgba(255, 255, 255, 0.95)',
              overflow: 'hidden',
              backgroundImage: "url('/images/mural-preview/profilecard-front.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Arco MI ANGELITO */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg width="520" height="76" viewBox="0 0 260 38" fill="none">
                <path id="archTextExp" d="M 20,32 Q 130,8 240,32" fill="none" />
                <text fill="#584582" fontFamily="Georgia, serif" fontSize="21" fontWeight="700" letterSpacing="3" textAnchor="middle">
                  <textPath href="#archTextExp" startOffset="50%">MI ANGELITO</textPath>
                </text>
              </svg>
            </div>

            {/* Nombre con autoescala */}
            <div
              style={{
                position: 'absolute',
                top: 130,
                left: 0,
                right: 0,
                height: 130,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: "'Pinyon Script', cursive",
                fontSize: exportFontSize * 1.8,
                color: '#C29028',
                padding: '0 40px',
                whiteSpace: 'nowrap',
              }}
            >
              {resolvedName}
            </div>

            {/* Corazón dorado 3D */}
            <div
              style={{
                position: 'absolute',
                top: 260,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24">
                <path fill="#C29028" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* Halo celestial */}
            <div
              style={{
                position: 'absolute',
                top: 310,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 242,
                height: 64,
                borderRadius: '50%',
                border: '6px solid #F5C842',
                boxShadow: '0 0 25px #F5C842',
              }}
            />

            {/* Foto Circular */}
            <div
              style={{
                position: 'absolute',
                top: 380,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 360,
                height: 360,
                borderRadius: 180,
                overflow: 'hidden',
                border: '6px solid rgba(201, 169, 97, 0.85)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                backgroundColor: '#ffffff',
              }}
            >
              <img
                src={resolvedPhoto}
                alt={resolvedName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Frase inferior */}
            <div
              style={{
                position: 'absolute',
                bottom: 90,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: 28,
                fontWeight: 700,
                color: '#584582',
                padding: '0 40px',
              }}
            >
              Siempre serás mi lugar favorito en el mundo
            </div>

            {/* Pie */}
            <div
              style={{
                position: 'absolute',
                bottom: 35,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: 24,
                fontWeight: 700,
                color: '#584582',
              }}
            >
              Ángeles en el Cielo
            </div>
          </div>

          {/* Footer Story Branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: '#1E2A78',
                letterSpacing: 2,
              }}
            >
              🐾 TodasLasMascotasVanAlCielo.com
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#BE185D',
                fontStyle: 'italic',
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              Un millón Ángeles, un solo cielo.
            </div>
          </div>
        </div>

        {/* POSTAL 1:1 (1080 × 1080) */}
        <div
          ref={postalExportRef}
          style={{
            width: 1080,
            height: 1080,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
            background: 'radial-gradient(ellipse at 50% 30%, #FFFDFE 0%, #FFF5F8 50%, #FCE7F3 100%)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Estrellas decorativas */}
          <div style={{ position: 'absolute', top: 50, left: 60, fontSize: 32, color: '#F59E0B' }}>✦</div>
          <div style={{ position: 'absolute', bottom: 50, right: 60, fontSize: 32, color: '#F59E0B' }}>✦</div>

          {/* Marco Postal con fondo celestial de dedicatoria */}
          <div
            style={{
              width: 980,
              height: 980,
              borderRadius: 36,
              border: '4px solid rgba(255, 255, 255, 0.95)',
              overflow: 'hidden',
              backgroundImage: "url('/images/mural-preview/profilecard-back.webp')",
              backgroundColor: '#fbf2f8',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 25px 70px rgba(120, 70, 160, 0.20)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '36px 40px 28px',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Cabecera */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                <img
                  src="/images/icons/Logoheart.svg"
                  alt=""
                  style={{ width: 44, height: 44, objectFit: 'contain' }}
                />
                <span
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 20,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#4A3F6B',
                    letterSpacing: 3,
                  }}
                >
                  HISTORIA DE AMOR
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: exportFontSize * 1.35,
                  color: '#C29028',
                  lineHeight: 1.1,
                  margin: '2px 0',
                }}
              >
                {resolvedName}
              </div>
            </div>

            {/* Foto circular con Halo, Fechas y Medalla */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  height: 46,
                  borderRadius: '50%',
                  border: '4.5px solid #F5C842',
                  boxShadow: '0 0 18px #F5C842',
                  marginBottom: -22,
                  zIndex: 5,
                }}
              />
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  overflow: 'hidden',
                  border: '5px solid #C9A961',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
                  backgroundColor: '#ffffff',
                  position: 'relative',
                }}
              >
                <img
                  src={resolvedPhoto}
                  alt={resolvedName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              </div>
              {/* Fechas en español */}
              {datesText && (
                <div
                  style={{
                    fontFamily: 'sans-serif',
                    fontSize: 19,
                    fontWeight: 600,
                    color: '#8A7B9B',
                    marginTop: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  {datesText}
                </div>
              )}
            </div>

            {/* Dedicatoria real con marco pergamino */}
            <div
              style={{
                width: '100%',
                maxWidth: 880,
                borderRadius: 20,
                padding: '16px 36px',
                textAlign: 'center',
                margin: '8px auto',
                borderLeft: '4.5px solid rgba(236,111,163,0.70)',
                borderRight: '4.5px solid rgba(236,111,163,0.70)',
                background: 'rgba(255, 255, 255, 0.75)',
                boxShadow: '0 4px 20px rgba(180, 140, 190, 0.12)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: exportDedSize,
                  lineHeight: exportDedLineHeight,
                  color: '#4A3F6B',
                  whiteSpace: 'pre-line',
                }}
              >
                “{resolvedDedication}”
              </div>
            </div>

            {/* Pie con usuario de redes sociales y firma */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {resolvedHandle && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 18px',
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.90)',
                    border: '1.5px solid #FBCFE8',
                    color: '#BE185D',
                    fontSize: 16,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(190, 24, 93, 0.10)',
                  }}
                >
                  <span>@{resolvedHandle}</span>
                </div>
              )}
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#7E6B8F',
                  letterSpacing: 0.5,
                }}
              >
                Ángeles en el Cielo · todaslasmascotasvanalcielo.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
