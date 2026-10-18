'use client'

import React, { useState, useRef } from 'react'

export interface SponsorshipCertificateData {
  sponsorName: string
  petName: string
  shelterName: string
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
  const certificateRef = useRef<HTMLDivElement>(null)

  const sponsor = data.sponsorName || 'Familia Solidaria'
  const pet = data.petName || 'Juliette'
  const shelter = data.shelterName || 'Refugio Protector'

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // En modo ejemplo, descargamos directamente la imagen PNG que lleva el cintillo diagonal 'EJEMPLO' integrado en el archivo
      if (isSample) {
        const link = document.createElement('a')
        link.download = 'ejemplo-reconocimiento-corazon-de-angel.png'
        link.href = '/images/certificates/diploma-corazones-de-angel-ejemplo.png'
        link.click()
        return
      }

      const { toPng } = await import('html-to-image')
      if (certificateRef.current) {
        const dataUrl = await toPng(certificateRef.current, {
          quality: 1,
          pixelRatio: 2, // 2x para resolución nítida imprimible
          cacheBust: true,
        })
        const cleanName = sponsor.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const link = document.createElement('a')
        link.download = `reconocimiento-corazon-de-angel-${cleanName}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('Error al descargar el reconocimiento:', err)
      // Fallback a descarga de la imagen base oficial
      const link = document.createElement('a')
      link.download = isSample 
        ? 'ejemplo-reconocimiento-corazon-de-angel.png' 
        : 'reconocimiento-corazon-de-angel.png'
      link.href = isSample 
        ? '/images/certificates/diploma-corazones-de-angel-ejemplo.png' 
        : '/images/certificates/diploma-corazones-de-angel.png'
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
        {/* Contenedor del Certificado Imprimible */}
        <div 
          ref={certificateRef}
          id="certificate-corazon-de-angel"
          className="relative w-full aspect-[1200/896] rounded-xl overflow-hidden shadow-xl border-[5px] sm:border-[8px] border-[#FAF0E6] bg-cover bg-center select-none"
          style={{
            backgroundImage: isSample 
              ? "url('/images/certificates/diploma-corazones-de-angel-ejemplo.webp')" 
              : "url('/images/certificates/diploma-corazones-de-angel.webp')",
            backgroundColor: '#FBF8F2',
          }}
        >
          {/* Capa de respaldo para asegurar visibilidad en cualquier dispositivo */}
          <div className="absolute inset-0 pointer-events-none" />
        </div>
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
