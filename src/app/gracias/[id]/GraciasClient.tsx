'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GraciasClientProps {
  sessionId: string
}

export default function GraciasClient({ sessionId }: GraciasClientProps) {
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: step 2 loading, 2: step 3 loading, 3: completed
  const [petName, setPetName] = useState('Tu ángel')
  const [petDate, setPetDate] = useState('')
  const [birthDate, setBirthDate] = useState<string>('')
  const [plan, setPlan] = useState('')
  const [petPhotoUrl, setPetPhotoUrl] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const res = await fetch(
          `/api/gracias/session?sessionId=${sessionId}`
        )
        const data = await res.json()
        if (res.ok) {
          setPetName(data.petName)
          setBirthDate(data.birthDate || '')
          setPetDate(data.petDate || '')
          setPlan(data.plan)
          if (data.photoUrl) {
            setPetPhotoUrl(data.photoUrl)
          } else if (data.thumbnailUrl) {
            setPetPhotoUrl(data.thumbnailUrl)
          }
        }
      } catch (err) {
        console.error('Error obteniendo datos de sesión:', err)
      }
    }
    
    if (sessionId) fetchSessionData()
  }, [sessionId])

  useEffect(() => {
    // Transición de pasos para simular flujo dinámico
    const timer1 = setTimeout(() => setStep(2), 1500)
    const timer2 = setTimeout(() => {
      setStep(3)
      setTimeout(() => setLoading(false), 1000)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // Círculo del paso completado (Checkmark)
  const renderCheckIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#DCA257] flex items-center justify-center text-white shadow-sm flex-shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )

  // Círculo del paso en progreso (Spinner)
  const renderLoadingIcon = () => (
    <div className="w-8 h-8 rounded-full border-2 border-[#DCA257] border-t-transparent animate-spin flex-shrink-0" />
  )

  // Círculo del paso pendiente (Vacío)
  const renderPendingIcon = () => (
    <div className="w-8 h-8 rounded-full border-2 border-[#B8B0CC] flex-shrink-0" />
  )

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden"
      style={{
        backgroundImage: 'url(/images/placeholders/Preparandorecuerdo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'var(--font-display), Georgia, serif',
      }}
    >
      {/* Contenedor principal con z-index alto */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center">
        <div className="w-full md:w-[60%] lg:w-[55%] flex flex-col items-start text-left">
          
          {/* Logo celestial corazón superior */}
          <img src="/images/icons/Logoheart.svg" alt="Heart" style={{ width: 80, height: 80, marginBottom: 24 }} className="object-contain" />

          {/* Título dinámico según estado */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{
              background: 'linear-gradient(to right, #151D54, #A393C4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {loading ? (
              <>
                Estamos preparando<br />su recuerdo
              </>
            ) : (
              <>
                Su recuerdo ya<br />brilla en el cielo
              </>
            )}
          </h1>

          {/* Separador sparkle */}
          <div className="flex items-center w-full max-w-[280px] gap-3 mb-6">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-[#DCA257]/50 flex-grow" />
            <span className="text-[#DCA257] text-xs">✦</span>
            <div className="h-[1px] bg-gradient-to-l from-transparent to-[#DCA257]/50 flex-grow" />
          </div>

          {/* Descripción */}
          <p className="text-lg leading-relaxed mb-6 max-w-[500px]" style={{ color: '#2A365C' }}>
            {loading ? (
              "Gracias por honrar su memoria con tanto amor. En unos instantes, su luz ocupará su lugar en el cielo."
            ) : (
              "Gracias por darle un lugar eterno en el mural global. Su luz y su historia formarán parte del cielo para siempre."
            )}
          </p>

          {/* Viñeta con corazón */}
          <div className="flex items-center gap-3 mb-8" style={{ color: '#2A365C' }}>
            <span>🩷</span>
            <span className="text-sm">Cada homenaje se prepara con mimo para que su recuerdo brille como merece.</span>
          </div>

          {/* Tarjeta Glassmorphic principal */}
          <div className="w-full max-w-[580px] bg-white/45 backdrop-blur-[16px] border border-white/50 rounded-[24px] p-6 md:p-8 shadow-[0_20px_50px_rgba(111,95,168,0.12)] flex flex-col sm:flex-row gap-6 items-center">
            
            {/* Columna Izquierda: Stepper */}
            <div className="flex-grow flex flex-col gap-4 w-full">
              {/* Paso 1 */}
              <div className="flex items-center gap-4">
                {renderCheckIcon()}
                <div>
                  <h3 className="font-semibold text-sm md:text-base leading-none" style={{ color: '#151D54' }}>Recibiendo su homenaje</h3>
                  <span className="text-xs text-[#706A95]">Completado</span>
                </div>
              </div>

              {/* Conector 1 */}
              <div className="h-6 w-0.5 border-l border-dashed border-[#DCA257] ml-4 -my-2" />

              {/* Paso 2 */}
              <div className="flex items-center gap-4">
                {step >= 2 ? renderCheckIcon() : renderLoadingIcon()}
                <div>
                  <h3 className="font-semibold text-sm md:text-base leading-none" style={{ color: '#151D54' }}>Preparando su recuerdo</h3>
                  <span className="text-xs text-[#706A95]">{step >= 2 ? "Completado" : "En proceso..."}</span>
                </div>
              </div>

              {/* Conector 2 */}
              <div className="h-6 w-0.5 border-l border-dashed border-[#DCA257] ml-4 -my-2" />

              {/* Paso 3 */}
              <div className="flex items-center gap-4">
                {step === 3 ? renderCheckIcon() : step === 2 ? renderLoadingIcon() : renderPendingIcon()}
                <div>
                  <h3 className="font-semibold text-sm md:text-base leading-none" style={{ color: '#151D54' }}>Colocando su luz en el mural</h3>
                  <span className="text-xs text-[#706A95]">
                    {step === 3 ? "Completado" : step === 2 ? "En proceso..." : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta del Ángel */}
            <div style={{
              background: 'rgba(255,252,248,0.95)',
              borderRadius: 24,
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 32px rgba(180,140,200,0.15)',
              border: '1px solid rgba(255,220,230,0.50)',
              minWidth: 200,
              flexShrink: 0,
            }}>
              {/* Foto circular con halo dorado */}
              <div style={{
                position: 'relative',
                width: 138,
                height: 138,
              }}>
                {/* Halo exterior dorado */}
                <div style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,220,100,0.45) 0%, rgba(255,200,80,0.20) 50%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite',
                }} />
                {/* Foto con bordes difuminados */}
                <div style={{
                  width: 138,
                  height: 138,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(255,200,80,0.40)',
                }}>
                  <img
                    src={petPhotoUrl || '/images/placeholders/first.webp'}
                    alt={petName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 80%)',
                      maskImage: 'radial-gradient(circle, black 55%, transparent 80%)',
                    }}
                  />
                </div>
              </div>

              {/* Nombre */}
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#4A3F6B',
                margin: 0,
              }}>
                {petName}
              </p>

              {/* Fecha */}
              <p style={{
                fontSize: 12,
                color: '#9B8FB0',
                margin: 0,
                fontFamily: 'sans-serif',
                textAlign: 'center',
                lineHeight: 1.6,
              }}>
                {birthDate && (
                  <>🎂 {formatDate(birthDate)}<br/></>
                )}
                {petDate && (
                  <>🌈 {formatDate(petDate)}</>
                )}
              </p>

              {/* Corazón */}
              <span style={{ fontSize: 20 }}>❤️</span>
            </div>

          </div>

          {/* Botones de acción (Aparecen al completar la carga) */}
          {!loading && (
            <div className="flex flex-wrap gap-4 mt-8 w-full z-20">
              <Link 
                href="/mural-global" 
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white font-bold text-base shadow-[0_8px_24px_rgba(236,95,150,0.35)] hover:opacity-95 transition-opacity"
              >
                Ver en el mural ✦
              </Link>
              
              <Link 
                href="/" 
                className="px-8 py-4 rounded-full bg-white/80 border border-[#DCA257]/40 text-[#1E2A78] font-bold text-base hover:bg-white transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Banner flotante de pie de página */}
      <div className="relative z-10 w-full pb-8 px-6 flex justify-center">
        <div className="bg-white/65 backdrop-blur-[8px] border border-white/40 px-6 py-3 rounded-full shadow-[0_4px_15px_rgba(20,28,79,0.05)] flex items-center gap-3 text-xs md:text-sm" style={{ color: '#2A365C' }}>
          <img src="/images/icons/star.svg" alt="Star" className="w-6 h-6 object-contain" />
          <span>
            {loading ? "Este momento solo tarda unos segundos." : "Tu recuerdo ya brilla en el cielo."}
          </span>
          <span className="text-[#706A95]/40">|</span>
          <span>Tu amor ya está creando algo eterno.</span>
          <span>🩷</span>
        </div>
      </div>

    </div>
  )
}
