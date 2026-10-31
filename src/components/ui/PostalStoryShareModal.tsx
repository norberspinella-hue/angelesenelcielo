'use client'

import React, { useState, useEffect } from 'react'
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
  let exportNameSize = 110
  if (nameLen > 18) {
    previewNameSize = 26
    exportNameSize = 72
  } else if (nameLen > 14) {
    previewNameSize = 30
    exportNameSize = 82
  } else if (nameLen > 10) {
    previewNameSize = 36
    exportNameSize = 94
  } else if (nameLen > 7) {
    previewNameSize = 40
    exportNameSize = 102
  }

  // Dynamic font size for dedication
  const dedLen = resolvedDedication.length
  let previewDedSize = 11.5
  let previewDedLineHeight = 1.45
  let exportDedSize = 32
  let exportDedLineHeight = 1.45

  if (dedLen > 300) {
    previewDedSize = 8.5
    previewDedLineHeight = 1.25
    exportDedSize = 22
    exportDedLineHeight = 1.30
  } else if (dedLen > 180) {
    previewDedSize = 9.5
    previewDedLineHeight = 1.32
    exportDedSize = 25
    exportDedLineHeight = 1.35
  } else if (dedLen > 100) {
    previewDedSize = 10.5
    previewDedLineHeight = 1.38
    exportDedSize = 28
    exportDedLineHeight = 1.40
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // =========================================================================
  // MOTOR DE COMPOSICIÓN CANVAS 2D DE ALTA RESOLUCIÓN (1080 × 1920 PX)
  // Dibuja explícitamente todas las capas en orden exacto, garantizando 100%
  // de fidelidad, sin depender de foreignObject ni sufrir problemas de CSS oculto.
  // =========================================================================
  const generatePngDataUrl = async (): Promise<string> => {
    const width = 1080
    const height = 1920

    // 1. Esperar a que las fuentes caligráficas y de serif estén listas en el documento
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        await document.fonts.ready
      } catch (fontErr) {
        console.warn('Advertencia cargando fuentes:', fontErr)
      }
    }

    // 2. Helper para cargar y decodificar imágenes de forma segura
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (img.decode) {
            img.decode().then(() => resolve(img)).catch(() => resolve(img))
          } else {
            resolve(img)
          }
        }
        img.onerror = () => {
          // Reintento sin crossOrigin en caso de conflicto de CORS de caché
          const retryImg = new Image()
          retryImg.onload = () => resolve(retryImg)
          retryImg.onerror = (err) => reject(err)
          retryImg.src = src
        }
        img.src = src
      })
    }

    // Carga paralela de todos los recursos gráficos maestros
    const [bgImg, photoImg, b1Img, b2Img] = await Promise.all([
      loadImage('/images/memorial/story-heaven-bg-1080.png'),
      loadImage(resolvedPhoto).catch(() => loadImage('/images/placeholders/first.webp')),
      loadImage('/images/icons/butterfly1.svg').catch(() => null),
      loadImage('/images/icons/butterfly2.svg').catch(() => null),
    ])

    if (!bgImg) throw new Error('No se pudo cargar el fondo celestial maestro.')
    if (!photoImg) throw new Error('No se pudo cargar la fotografía de la mascota.')

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D.')

    // CAPA 1: FONDO CELESTIAL MAESTRO (1080 × 1920)
    ctx.drawImage(bgImg, 0, 0, width, height)

    // CAPA 2: CABECERA "MI ANGELITO"
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '700 32px "Playfair Display", Georgia, serif'
    ctx.fillStyle = '#4A3258'
    try {
      // @ts-ignore
      ctx.letterSpacing = '8px'
    } catch (e) {}
    ctx.fillText('MI ANGELITO', width / 2, 160)
    ctx.restore()

    // CAPA 3: NOMBRE DE LA MASCOTA (CALIGRAFÍA DORADA)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = `400 ${exportNameSize}px "Allura", "Pinyon Script", cursive`
    ctx.fillStyle = '#B8860B'
    ctx.shadowColor = 'rgba(184, 134, 11, 0.35)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 4
    ctx.fillText(resolvedName, width / 2, 280)
    ctx.restore()

    // CAPA 4: CORAZÓN DORADO SUTIL BAJO EL NOMBRE
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '28px sans-serif'
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('💛', width / 2, 335)
    ctx.restore()

    // PARÁMETROS DEL RETRATO
    const photoCenterX = width / 2
    const photoCenterY = 720
    const photoRadius = 225

    // CAPA 5: RESPLANDOR EXTERIOR CÁLIDO DE LA FOTO (IDÉNTICO A TARJETA DEL MURAL)
    ctx.save()
    const glowGrad = ctx.createRadialGradient(
      photoCenterX, photoCenterY, photoRadius * 0.7,
      photoCenterX, photoCenterY, photoRadius * 1.25
    )
    glowGrad.addColorStop(0, 'rgba(255, 253, 240, 0.85)')
    glowGrad.addColorStop(0.5, 'rgba(255, 245, 215, 0.50)')
    glowGrad.addColorStop(1, 'rgba(255, 240, 195, 0)')
    ctx.fillStyle = glowGrad
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoRadius * 1.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // CAPA 6: FOTOGRAFÍA CIRCULAR RECORTADA CON FUSIÓN INFERIOR DE NUBES
    ctx.save()
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Dibujar foto con ajuste centrado y proporcional (cover)
    const pW = photoImg.naturalWidth || photoImg.width || 400
    const pH = photoImg.naturalHeight || photoImg.height || 400
    const minDim = Math.min(pW, pH)
    const sx = (pW - minDim) / 2
    const sy = (pH - minDim) / 2
    ctx.drawImage(
      photoImg,
      sx, sy, minDim, minDim,
      photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2
    )

    // Fusión suave inferior con las nubes
    const mistGrad = ctx.createLinearGradient(
      0, photoCenterY + photoRadius,
      0, photoCenterY + photoRadius * 0.35
    )
    mistGrad.addColorStop(0, 'rgba(255, 245, 235, 0.85)')
    mistGrad.addColorStop(0.5, 'rgba(255, 245, 235, 0.30)')
    mistGrad.addColorStop(1, 'rgba(255, 245, 235, 0)')
    ctx.fillStyle = mistGrad
    ctx.fillRect(
      photoCenterX - photoRadius,
      photoCenterY + photoRadius * 0.35,
      photoRadius * 2,
      photoRadius * 0.65
    )
    ctx.restore()

    // CAPA 7: MARCO CIRCULAR IDÉNTICO A LA TARJETA DEL MURAL (#C9A961)
    ctx.save()
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2)
    ctx.lineWidth = 10
    ctx.strokeStyle = '#C9A961'
    ctx.shadowColor = 'rgba(201, 169, 97, 0.45)'
    ctx.shadowBlur = 28
    ctx.stroke()
    ctx.restore()

    // CAPA 8: AUREOLA CELESTIAL INCLINADA (-4 GRADOS) IDÉNTICA A LA TARJETA DEL MURAL
    ctx.save()
    ctx.translate(photoCenterX, photoCenterY - photoRadius - 15)
    ctx.rotate(-4 * Math.PI / 180)

    // 8a. Aura exterior difusa
    ctx.beginPath()
    ctx.ellipse(0, 0, 190, 48, 0, 0, Math.PI * 2)
    ctx.lineWidth = 16
    ctx.strokeStyle = 'rgba(255, 213, 79, 0.85)'
    ctx.shadowColor = '#FFD54F'
    ctx.shadowBlur = 24
    ctx.stroke()

    // 8b. Anillo dorado con degradado
    const haloGrad = ctx.createLinearGradient(-190, 0, 190, 0)
    haloGrad.addColorStop(0, '#FFA000')
    haloGrad.addColorStop(0.25, '#FFD54F')
    haloGrad.addColorStop(0.5, '#FFF9C4')
    haloGrad.addColorStop(0.75, '#FFD54F')
    haloGrad.addColorStop(1, '#FFA000')
    ctx.beginPath()
    ctx.ellipse(0, 0, 190, 48, 0, 0, Math.PI * 2)
    ctx.lineWidth = 8.4
    ctx.strokeStyle = haloGrad
    ctx.shadowBlur = 0
    ctx.stroke()

    // 8c. Filamento blanco brillante
    ctx.beginPath()
    ctx.ellipse(0, 0, 190, 48, 0, 0, Math.PI * 2)
    ctx.lineWidth = 4.8
    ctx.strokeStyle = '#FFFFFF'
    ctx.shadowColor = '#FFFFFF'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.restore()

    // CAPA 9: MARIPOSAS LUMINOSAS
    if (b1Img) {
      ctx.save()
      ctx.translate(photoCenterX - photoRadius - 35, photoCenterY + photoRadius * 0.4)
      ctx.rotate(-12 * Math.PI / 180)
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)'
      ctx.shadowBlur = 18
      ctx.drawImage(b1Img, -38, -38, 76, 76)
      ctx.restore()
    }

    if (b2Img) {
      ctx.save()
      ctx.translate(photoCenterX + photoRadius + 35, photoCenterY + photoRadius * 0.45)
      ctx.rotate(15 * Math.PI / 180)
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)'
      ctx.shadowBlur = 18
      ctx.drawImage(b2Img, -35, -35, 70, 70)
      ctx.restore()
    }

    // CAPA 10: DEDICATORIA REAL (AJUSTE AUTOMÁTICO DE LÍNEAS CENTRADAS)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = `italic ${exportDedSize}px "Playfair Display", Georgia, serif`
    ctx.fillStyle = '#3B2648'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 6

    const maxDedWidth = 840
    const words = `“${resolvedDedication}”`.split(' ')
    const lines: string[] = []
    let currentLine = words[0] || ''

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + ' ' + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxDedWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    const dedLineHeightPx = exportDedSize * exportDedLineHeight
    let startDedY = 1100
    lines.forEach((l, idx) => {
      ctx.fillText(l, width / 2, startDedY + idx * dedLineHeightPx)
    })
    const endDedY = startDedY + (lines.length - 1) * dedLineHeightPx
    ctx.restore()

    // CAPA 11: CORAZÓN DORADO BAJO LA DEDICATORIA
    const heartY = endDedY + 50
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '28px sans-serif'
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('💛', width / 2, heartY)
    ctx.restore()

    // CAPA 12: FRASE FIJA "Tu recuerdo sigue brillando aquí."
    const fixedPhraseY = heartY + 48
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '600 26px "Playfair Display", Georgia, serif'
    ctx.fillStyle = '#655C86'
    try {
      // @ts-ignore
      ctx.letterSpacing = '1px'
    } catch (e) {}
    ctx.fillText('Tu recuerdo sigue brillando aquí.', width / 2, fixedPhraseY)
    ctx.restore()

    // CAPA 13: FIRMA OFICIAL "Ángeles en el Cielo"
    const signY = fixedPhraseY + 75
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '400 56px "Allura", "Pinyon Script", cursive'
    ctx.fillStyle = '#B8860B'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 6
    ctx.fillText('Ángeles en el Cielo', width / 2, signY)

    // Trazo divisorio con corazón: — ♡ —
    const lineY = signY + 22
    ctx.lineWidth = 1.5
    ctx.strokeStyle = '#C29028'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.moveTo(width / 2 - 130, lineY)
    ctx.lineTo(width / 2 - 20, lineY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width / 2 + 20, lineY)
    ctx.lineTo(width / 2 + 130, lineY)
    ctx.stroke()

    ctx.font = '18px sans-serif'
    ctx.fillStyle = '#C29028'
    ctx.fillText('♡', width / 2, lineY + 6)
    ctx.globalAlpha = 1.0

    // Subtítulo oficial: "TODOS LOS PERROS VAN AL CIELO"
    ctx.font = '700 16px sans-serif'
    ctx.fillStyle = '#8B7B9E'
    try {
      // @ts-ignore
      ctx.letterSpacing = '4px'
    } catch (e) {}
    ctx.fillText('TODOS LOS PERROS VAN AL CIELO', width / 2, lineY + 42)
    ctx.restore()

    return canvas.toDataURL('image/png')
  }

  // Compartir en Instagram (Web Share API o descarga directa)
  const handleShareInstagram = async () => {
    try {
      setIsExporting(true)
      const dataUrl = await generatePngDataUrl()

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
          console.log('Web Share cancelado o no soportado en dispositivo, descargando:', shareErr)
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
      showToast('No se pudo generar la imagen completa. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  // Guardar imagen PNG 1080x1920 (Utiliza el mismo motor exacto de generación)
  const handleSaveImage = async () => {
    try {
      setIsExporting(true)
      const dataUrl = await generatePngDataUrl()

      const filename = `angeles-en-el-cielo-${resolvedName.toLowerCase().replace(/\s+/g, '-')}-story.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      showToast('¡Story descargada en alta resolución (1080×1920)! 💌🖼️')
    } catch (err) {
      console.error('Error guardando imagen:', err)
      showToast('No se pudo guardar la imagen completa.')
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
        className="relative w-full max-w-[940px] bg-[#FFF0F5] rounded-[32px] sm:rounded-[36px] shadow-[0_24px_60px_rgba(74,31,110,0.22)] border border-[#FCE7F3] p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-10 my-auto"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FDF2F8 50%, #FCE7F3 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN X CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#BE185D] hover:text-[#9D174D] border border-[#FBCFE8] flex items-center justify-center transition-colors z-20 text-sm font-bold shadow-xs"
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

                {/* Mariposas luminosas flotantes */}
                <div className="absolute -left-7 bottom-3 w-7 h-7 opacity-95 pointer-events-none">
                  <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain -rotate-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                </div>
                <div className="absolute -right-7 bottom-5 w-6 h-6 opacity-95 pointer-events-none">
                  <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain rotate-15 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                </div>

                {/* Resplandor cálido exterior idéntico a la tarjeta del mural */}
                <div 
                  className="absolute -inset-4 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 253, 240, 0.85) 0%, rgba(255, 245, 215, 0.50) 45%, rgba(255, 240, 195, 0) 80%)',
                    filter: 'blur(12px)',
                  }}
                />

                {/* Círculo de la foto real idéntico a la tarjeta del mural */}
                <div 
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-white z-0"
                  style={{
                    border: '3.5px solid #C9A961',
                    boxShadow: '0 0 22px rgba(201,169,97,0.45), 0 8px 20px rgba(74,31,110,0.18)',
                  }}
                >
                  <img 
                    src={resolvedPhoto} 
                    alt={resolvedName} 
                    className="w-full h-full object-cover" 
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
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#FFF5F8] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#FCE7F3] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group"
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
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#FFF5F8] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#FCE7F3] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-75"
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
              className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-white hover:bg-[#FFF5F8] text-[#1F2937] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#FCE7F3] shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] group"
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
    </div>,
    document.body
  )
}
