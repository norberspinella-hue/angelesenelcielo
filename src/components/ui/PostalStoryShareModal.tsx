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

      const filename = `${resolvedName.toLowerCase().replace(/\s+/g, '-')}-${isStory ? 'story-instagram' : 'postal-recuerdo'}.png`

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
        showToast('¡Postal guardada en tu galería! 🖼️')
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
            Sube la Story formateada a Instagram con 1 clic o descarga la postal conmemorativa.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-2 p-1.5 bg-pink-50/80 border border-pink-200 rounded-full mb-5 w-full max-w-xs justify-center shadow-inner">
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
            <span>🖼️</span>
            <span>Postal 1:1</span>
          </button>
        </div>

        {/* ÁREA DE PREVISUALIZACIÓN EN VIVO (Escalada para que entre cómoda en cualquier pantalla) */}
        <div className="w-full flex items-center justify-center my-2 overflow-hidden">
          {activeTab === 'story' ? (
            /* Vista previa Story 9:16 (escalada a 260px ancho) */
            <div 
              className="relative rounded-[22px] overflow-hidden shadow-xl border-2 border-pink-200/90 flex flex-col items-center justify-between select-none"
              style={{
                width: 250,
                height: 444, // 9:16
                background: 'radial-gradient(ellipse at 50% 25%, #182252 0%, #0F1638 60%, #090D22 100%)',
                padding: '16px 12px',
              }}
            >
              {/* Estrellitas de fondo */}
              <div className="absolute top-4 left-4 text-[10px] text-[#FDE68A]/60 animate-pulse">✦</div>
              <div className="absolute top-12 right-6 text-[8px] text-[#FDE68A]/40">✧</div>
              <div className="absolute bottom-16 left-6 text-[9px] text-[#FDE68A]/50">⋆</div>
              <div className="absolute bottom-20 right-5 text-[11px] text-[#FDE68A]/60 animate-pulse">✦</div>

              {/* Top badge */}
              <div className="z-10 px-3 py-1 rounded-full bg-white/10 border border-[#F5C842]/50 text-[#FDE68A] text-[9px] font-bold tracking-wider uppercase text-center shadow-sm">
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
                <span className="text-[10px] font-bold text-[#F3E8FF] tracking-wide">
                  🐾 TodasLasMascotasVanAlCielo.com
                </span>
                <span className="text-[8px] text-[#FBCFE8] italic">
                  Mural Global de las Estrellas
                </span>
              </div>
            </div>
          ) : (
            /* Vista previa Postal 1:1 (escalada a 270px) */
            <div 
              className="relative rounded-[20px] overflow-hidden shadow-xl border-2 border-pink-200/90 flex flex-col items-center justify-center select-none"
              style={{
                width: 270,
                height: 270,
                background: 'radial-gradient(ellipse at 50% 25%, #182252 0%, #0F1638 60%, #090D22 100%)',
                padding: '14px',
              }}
            >
              {/* Estrellitas */}
              <div className="absolute top-3 left-3 text-[9px] text-[#FDE68A]/60">✦</div>
              <div className="absolute bottom-3 right-3 text-[9px] text-[#FDE68A]/60">✦</div>

              {/* Contenedor central postal */}
              <div 
                className="w-full h-full rounded-[14px] border border-white/80 p-3 flex flex-col items-center justify-between"
                style={{
                  backgroundImage: "url('/images/mural-preview/profilecard-front.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="text-center">
                  <div className="text-[9px] font-bold text-[#584582] tracking-widest font-serif">
                    MI ANGELITO
                  </div>
                  <div 
                    className="h-6 flex items-center justify-center"
                    style={{
                      fontFamily: "'Pinyon Script', cursive",
                      fontSize: previewFontSize * 0.52,
                      color: '#C29028',
                    }}
                  >
                    {resolvedName}
                  </div>
                  {/* Corazón dorado */}
                  <div className="flex items-center justify-center my-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24">
                      <path fill="#C29028" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                </div>

                {/* Foto circular con halo y medalla */}
                <div className="relative">
                  <div 
                    className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-[#F5C842] shadow-[0_0_6px_#F5C842]"
                    style={{ width: 62, height: 16 }}
                  />
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#C9A961] shadow-md bg-white mt-1 relative"
                  >
                    <img 
                      src={resolvedPhoto} 
                      alt={resolvedName} 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous"
                    />
                  </div>
                  {/* Insignia corazón del plan */}
                  <img
                    src="/images/icons/plans/icon-plan-eterno.svg"
                    alt="Corazón"
                    className="absolute -bottom-1 -right-1 w-6 h-6 object-contain drop-shadow"
                  />
                </div>

                <div className="text-center">
                  <p className="text-[7.5px] font-bold text-[#584582] font-serif leading-tight m-0">
                    Siempre serás mi lugar favorito en el mundo
                  </p>
                  <span className="text-[7.5px] text-[#584582] font-bold font-serif opacity-90 mt-0.5 block">
                    Ángeles en el Cielo
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
                <span className="text-lg">📥</span>
                <span>Descargar Postal Cuadrada HD (1:1)</span>
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
            background: 'radial-gradient(ellipse at 50% 30%, #182252 0%, #0F1638 55%, #090D22 100%)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Estrellas decorativas */}
          <div style={{ position: 'absolute', top: 120, left: 100, fontSize: 36, color: 'rgba(253, 230, 138, 0.7)' }}>✦</div>
          <div style={{ position: 'absolute', top: 220, right: 120, fontSize: 28, color: 'rgba(253, 230, 138, 0.5)' }}>✧</div>
          <div style={{ position: 'absolute', bottom: 350, left: 110, fontSize: 32, color: 'rgba(253, 230, 138, 0.6)' }}>⋆</div>
          <div style={{ position: 'absolute', bottom: 420, right: 90, fontSize: 40, color: 'rgba(253, 230, 138, 0.7)' }}>✦</div>

          {/* Top Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 48px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.12)',
              border: '2.5px solid rgba(245, 200, 66, 0.7)',
              color: '#FDE68A',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 3,
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
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
                fontSize: 32,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: 2,
              }}
            >
              🐾 TodasLasMascotasVanAlCielo.com
            </div>
            <div
              style={{
                fontSize: 22,
                color: '#FBCFE8',
                fontStyle: 'italic',
              }}
            >
              Mural Global de las Estrellas
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
            background: 'radial-gradient(ellipse at 50% 30%, #182252 0%, #0F1638 55%, #090D22 100%)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Estrellas decorativas */}
          <div style={{ position: 'absolute', top: 50, left: 60, fontSize: 30, color: 'rgba(253, 230, 138, 0.7)' }}>✦</div>
          <div style={{ position: 'absolute', bottom: 50, right: 60, fontSize: 30, color: 'rgba(253, 230, 138, 0.7)' }}>✦</div>

          {/* Marco Postal */}
          <div
            style={{
              width: 960,
              height: 960,
              borderRadius: 40,
              border: '4px solid rgba(255, 255, 255, 0.85)',
              overflow: 'hidden',
              backgroundImage: "url('/images/mural-preview/profilecard-front.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '60px 40px 40px 40px',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Cabecera */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#584582',
                  letterSpacing: 4,
                  marginBottom: 6,
                }}
              >
                MI ANGELITO
              </div>
              <div
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: exportFontSize * 1.5,
                  color: '#C29028',
                }}
              >
                {resolvedName}
              </div>
              {/* Corazón dorado 3D */}
              <div style={{ marginTop: 4 }}>
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path fill="#C29028" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>

            {/* Foto circular con Halo y medalla corazón */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 240,
                  height: 60,
                  borderRadius: '50%',
                  border: '5px solid #F5C842',
                  boxShadow: '0 0 20px #F5C842',
                  marginBottom: -25,
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  width: 320,
                  height: 320,
                  borderRadius: 160,
                  overflow: 'hidden',
                  border: '6px solid rgba(201, 169, 97, 0.85)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
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
              {/* Insignia corazón del plan */}
              <img
                src="/images/icons/plans/icon-plan-eterno.svg"
                alt="Corazón"
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  width: 84,
                  height: 84,
                  objectFit: 'contain',
                  zIndex: 10,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
                }}
              />
            </div>

            {/* Dedicatoria y cierre */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#584582',
                  maxWidth: 700,
                  lineHeight: 1.35,
                }}
              >
                Siempre serás mi lugar favorito en el mundo
              </div>
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#584582',
                  opacity: 0.9,
                  marginTop: 2,
                }}
              >
                Ángeles en el Cielo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
