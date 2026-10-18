'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

export interface SponsorshipCertificateData {
  sponsorName: string
  petName: string
  shelterName: string
  sponsorPetName?: string
  date?: string
  registryCode?: string
}

interface SponsorshipCertificateA4Props {
  data: SponsorshipCertificateData
  className?: string
  showDownloadButton?: boolean
  isSample?: boolean
}

export default function SponsorshipCertificateA4({
  data,
  className = '',
  showDownloadButton = true,
  isSample = false,
}: SponsorshipCertificateA4Props) {
  const [isDownloading, setIsDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sponsor = data.sponsorName?.trim() || 'Familia Solidaria'
  const pet = data.petName?.trim() || 'Juliette'
  const shelter = data.shelterName?.trim() || 'Refugio Protector'
  const sponsorPet = data.sponsorPetName?.trim() || ''

  // Asegurar que las fuentes de caligrafía y estilo clásico estén cargadas
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('google-fonts-certificate')) {
      const link = document.createElement('link')
      link.id = 'google-fonts-certificate'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Montserrat:wght@400;500;600;700&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  // Función para dibujar el diploma en el canvas de alta resolución (1200 × 896)
  const renderCertificate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    if (isSample) {
      img.src = '/images/certificates/diploma-corazones-de-angel-ejemplo.png'
      img.onload = () => {
        ctx.clearRect(0, 0, 1200, 896)
        ctx.drawImage(img, 0, 0, 1200, 896)
      }
      return
    }

    // Modo real: usar la plantilla base en blanco y pintar caligrafía dinámica
    img.src = '/images/certificates/plantilla-base-corazon-de-angel.webp'
    img.onerror = () => {
      // Fallback a versión JPG si webp diera algún problema
      img.src = '/images/certificates/plantilla-base-corazon-de-angel.jpg'
    }

    img.onload = () => {
      ctx.clearRect(0, 0, 1200, 896)
      ctx.drawImage(img, 0, 0, 1200, 896)

      ctx.textAlign = 'center'

      // 1. Apadrinado por [Nombre del Padrino]
      let sponsorFontSize = 40
      ctx.font = `italic 700 ${sponsorFontSize}px "Playfair Display", Georgia, serif`
      let sponsorText = `Apadrinado por ${sponsor}`
      while (ctx.measureText(sponsorText).width > 760 && sponsorFontSize > 22) {
        sponsorFontSize -= 2
        ctx.font = `italic 700 ${sponsorFontSize}px "Playfair Display", Georgia, serif`
      }
      ctx.fillStyle = '#1E2A78' // Azul marino noble
      const sponsorY = sponsorPet ? 505 : 520
      ctx.fillText(sponsorText, 600, sponsorY)

      // 1.5. Cita en memoria (si el apadrinamiento fue en honor a su propio ángel)
      let currentY = sponsorY
      if (sponsorPet) {
        ctx.font = 'italic 500 20px "Playfair Display", Georgia, serif'
        ctx.fillStyle = '#6B4C7D'
        currentY += 32
        ctx.fillText(`en memoria de su amado ángel ${sponsorPet} 🐾`, 600, currentY)
      }

      // 2. Subtítulo lema: - Tienes corazón de perrito -
      currentY += (sponsorPet ? 42 : 55)
      ctx.fillStyle = '#967126' // Oro ámbar cálido
      ctx.font = 'italic 700 22px "Playfair Display", Georgia, serif'
      ctx.fillText('- Tienes corazón de perrito -', 600, currentY)

      // 3. Agradecimiento cuerpo línea 1
      currentY += 46
      ctx.fillStyle = '#374151'
      ctx.font = '500 17px "Montserrat", sans-serif'
      ctx.fillText('Hay personas que no miran hacia otro lado, que ven una historia y deciden hacer algo.', 600, currentY)

      // 4. Agradecimiento cuerpo línea 2 con datos dinámicos
      currentY += 28
      ctx.fillStyle = '#1E2A78'
      ctx.font = '600 17.5px "Montserrat", sans-serif'
      const agradecimientoText = `Gracias por apadrinar con 9 estrellas a ${pet} del refugio ${shelter}.`
      if (ctx.measureText(agradecimientoText).width > 800) {
        ctx.fillText(`Gracias por apadrinar con 9 estrellas a ${pet}`, 600, currentY)
        currentY += 26
        ctx.fillText(`del refugio ${shelter}.`, 600, currentY)
      } else {
        ctx.fillText(agradecimientoText, 600, currentY)
      }
    }
  }, [isSample, sponsor, pet, shelter, sponsorPet])

  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(renderCertificate)
    } else {
      renderCertificate()
    }
  }, [renderCertificate])

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // En modo ejemplo, descargamos la imagen de demostración con cintillo diagonal
      if (isSample) {
        const link = document.createElement('a')
        link.download = 'ejemplo-reconocimiento-corazon-de-angel.png'
        link.href = '/images/certificates/diploma-corazones-de-angel-ejemplo.png'
        link.click()
        return
      }

      // En modo real, exportamos directamente el canvas personalizado en alta resolución
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png', 1.0)
        const cleanName = sponsor.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const link = document.createElement('a')
        link.download = `reconocimiento-corazon-de-angel-${cleanName || 'oficial'}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('Error al descargar el reconocimiento:', err)
      const link = document.createElement('a')
      link.download = isSample 
        ? 'ejemplo-reconocimiento-corazon-de-angel.png' 
        : 'reconocimiento-corazon-de-angel.png'
      link.href = isSample 
        ? '/images/certificates/diploma-corazones-de-angel-ejemplo.png' 
        : '/images/certificates/plantilla-base-corazon-de-angel.png'
      link.click()
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      
      {/* Marco contenedor del diploma con iluminación celestial */}
      <div 
        className="w-full max-w-[760px] rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F8] border-2 border-pink-200/80 shadow-[0_16px_40px_rgba(244,114,182,0.22)] relative overflow-hidden"
      >
        {/* Canvas del Certificado Imprimible de alta resolución */}
        <canvas 
          ref={canvasRef}
          id="certificate-corazon-de-angel"
          width={1200}
          height={896}
          className="w-full h-auto aspect-[1200/896] rounded-xl shadow-xl border-[5px] sm:border-[8px] border-[#FAF0E6] bg-[#FBF8F2] select-none block"
          style={{
            maxWidth: '100%',
          }}
        />
      </div>

      {/* Botón CTA de descarga con el estilo oficial de ProfileCard */}
      {showDownloadButton && (
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2.5 text-white font-bold text-xs sm:text-sm rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 select-none"
            style={{
              background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '999px',
              padding: '12px 28px',
              boxShadow: '0 4px 16px rgba(244, 114, 182, 0.45)',
            }}
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            <span>
              {isDownloading 
                ? 'Generando Reconocimiento...' 
                : isSample 
                  ? 'Descargar Ejemplo de Reconocimiento (A4)' 
                  : 'Descargar Reconocimiento Oficial (A4 Imprimible)'}
            </span>
          </button>
        </div>
      )}

    </div>
  )
}
