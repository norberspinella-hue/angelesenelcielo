'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { ApadrinarDrawer } from '@/components/solidario/ApadrinarDrawer'
import SponsorshipCertificateA4 from '@/components/certificates/SponsorshipCertificateA4'

export function CorazonesDeAngelSection() {
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false)
  const [isSocialDemoOpen, setIsSocialDemoOpen] = useState(false)
  const [isApadrinarDrawerOpen, setIsApadrinarDrawerOpen] = useState(false)
  const [shelterName, setShelterName] = useState('')
  const [shelterCity, setShelterCity] = useState('')
  const [shelterEmail, setShelterEmail] = useState('')
  const [shelterPhone, setShelterPhone] = useState('')
  const [shelterNotes, setShelterNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isShelterModalOpen || isSocialDemoOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isShelterModalOpen, isSocialDemoOpen])

  const handleSubmitShelter = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/shelter-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelterName,
          shelterCity,
          shelterEmail,
          shelterPhone,
          notes: shelterNotes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud')
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Error enviando formulario de protectora:', err)
      setSubmitError(err.message || 'Hubo un error al enviar la solicitud. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section 
      id="corazones-de-angel"
      className="w-full py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center transition-all"
    >
      {/* Contenedor central con la tipografía estándar del sitio */}
      <div className="relative z-10 w-full max-w-[1120px] mx-auto flex flex-col items-center text-center">

        {/* 1. TÍTULO PRINCIPAL DE LA SECCIÓN (MISMO TAMAÑO QUE EL RESTO DE SECCIONES) */}
        <h2 className="section-title">
          Iniciativa Solidaria · Corazones de Ángel
        </h2>

        {/* 2. SUBTÍTULO (MISMO TAMAÑO QUE EL RESTO DE SECCIONES) */}
        <p className="body-copy max-w-[700px] mx-auto mt-4 section-subtitle font-medium">
          Una huella por los que siguen esperando
        </p>

        {/* 3. TEXTO EMOCIONAL (JULIETTE) */}
        <p className="body-copy max-w-[720px] mx-auto mt-3">
          Inspirados en la historia de <strong className="text-[#1E2A78] font-bold">Juliette</strong> y en todos los compañeros que llenaron nuestras vidas de amor.<br className="hidden sm:inline" />
          Porque recordar a los que ya brillan y cuidar a los que siguen esperando son dos formas de decir lo mismo:{' '}
          <strong className="text-[#1E2A78] font-bold">todas las vidas importan.</strong>
        </p>

        {/* 4. CITA REFLEXIVA */}
        <p className="text-sm sm:text-base italic text-[#706A95] max-w-[620px] mx-auto mt-2 mb-8">
          No todos los perritos tuvieron una familia que pudiera pronunciar su nombre al despedirse...<br />
          Todos merecen una historia, una luz y un lugar digno en el cielo.
        </p>

        {/* ======================================================== */}
        {/* 5. LAS 3 TARJETAS (MISMO TAMAÑO QUE LOS PLANES · PRICING-GRID) */}
        {/* ======================================================== */}
        <div className="pricing-grid items-stretch my-2 w-full">
          
          {/* ======================= */}
          {/* TARJETA 1: PROTECTORAS */}
          {/* ======================= */}
          <div 
            className="plan-card heaven-card flex flex-col justify-between relative group rounded-[28px] p-6 sm:p-7 transition-all duration-300 overflow-hidden shadow-[0_12px_32px_rgba(180,140,190,0.12)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(180,140,190,0.20)]"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.70)', 
              borderColor: 'rgba(255, 255, 255, 0.85)', 
              borderWidth: '1.5px',
              backdropFilter: 'blur(14px)'
            }}
          >
            {/* 6 MARIPOSAS REPARTIDAS POR LA TARJETA */}
            <div className="absolute top-3 left-[135px] sm:left-[150px] w-7 h-7 -rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.30)] opacity-95 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-4 right-3 w-6 h-6 rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.30)] opacity-85 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={24} height={24} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[140px] right-3 w-5 h-5 -rotate-6 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.30)] opacity-75 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[152px] left-3 w-5 h-5 rotate-45 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[90px] right-4 w-7 h-7 rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.30)] opacity-85 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[92px] left-4 w-5 h-5 -rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10">
              {/* Encabezado: Logo Casa en la esquina izquierda (aumentada 100% · 160px igual que tarjeta 2 y 3) */}
              <div className="flex items-center justify-start w-full mb-2">
                <div className="w-36 h-36 sm:w-40 sm:h-40 relative flex items-center justify-center shrink-0 -ml-3 -mt-2">
                  <Image 
                    src="/images/solidario/icon-casa-protectoras.svg" 
                    alt="Casa Protectoras" 
                    width={160}
                    height={160}
                    className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(200,160,180,0.35)] hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <h3 className="plan-title text-[#1E2A78] mb-2 leading-tight">
                Ángel de Protectora
              </h3>
              <p className="body-copy text-sm sm:text-base leading-relaxed mb-3">
                Invitamos a protectoras colaboradoras a publicar hasta 5 perros fallecidos bajo su custodia sin ningún coste. Tendrán su luz y su historia preservadas para siempre en el mural.
              </p>

              {/* Imagen Ilustrativa Tarjeta 1 (220x220) con suave opacidad */}
              <div className="w-full flex justify-center my-3">
                <div className="w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border border-[#FDE68A]/70 shadow-md relative bg-white/60 backdrop-blur-xs group/img">
                  <Image 
                    src="/images/solidario/tarjeta1-220x220.webp" 
                    alt="Ángel de Protectora" 
                    width={220} 
                    height={220} 
                    className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 transition-opacity duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Botón CTA Estilo HeavenCTAButton */}
            <button 
              onClick={() => {
                setIsShelterModalOpen(true)
                setSubmitted(false)
              }}
              className="mt-6 w-full py-3.5 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer relative z-10"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
                boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(180, 83, 9, 0.4), 0 0 0 1.8px rgba(253, 230, 138, 0.85), 0 0 14px 3px rgba(245, 158, 11, 0.4), 0 8px 20px -2px rgba(217, 119, 6, 0.4)',
                letterSpacing: '0.3px',
                textShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}
            >
              <span className="flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path fill="#FFFDF0" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span>Inscribir angelitos sin cielo</span>
              <span className="text-xs">›</span>
            </button>
          </div>

          {/* ======================= */}
          {/* TARJETA 2: COMUNIDAD */}
          {/* ======================= */}
          <div 
            className="plan-card heaven-card flex flex-col justify-between relative group rounded-[28px] p-6 sm:p-7 transition-all duration-300 overflow-hidden shadow-[0_12px_32px_rgba(180,140,190,0.12)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(180,140,190,0.20)]"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.70)', 
              borderColor: 'rgba(255, 255, 255, 0.85)', 
              borderWidth: '1.5px',
              backdropFilter: 'blur(14px)'
            }}
          >
            {/* 6 MARIPOSAS REPARTIDAS POR LA TARJETA */}
            <div className="absolute top-3 left-[135px] sm:left-[150px] w-7 h-7 -rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.30)] opacity-95 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-4 right-3 w-6 h-6 rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.30)] opacity-85 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={24} height={24} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[140px] right-3 w-5 h-5 -rotate-6 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.30)] opacity-75 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[165px] left-3 w-5 h-5 rotate-45 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[90px] right-4 w-7 h-7 rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.30)] opacity-85 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[92px] left-4 w-5 h-5 -rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10">
              {/* Encabezado: Estrella en la esquina izquierda (aumentada 100% · 160px) */}
              <div className="flex items-center justify-start w-full mb-2">
                <div className="w-36 h-36 sm:w-40 sm:h-40 relative flex items-center justify-center shrink-0 -ml-3 -mt-2">
                  <Image 
                    src="/images/icons/plans/icon-plan-estrella.svg" 
                    alt="Estrella Solidaria" 
                    width={160}
                    height={160}
                    className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(245,190,60,0.45)] hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <h3 className="plan-title text-[#1E2A78] mb-2 leading-tight">
                Ayuda a un Ángelito, dale 9 estrellas en el cielo.
              </h3>
              <p className="body-copy text-sm sm:text-base leading-relaxed mb-3">
                Una protectora le da una luz; tú puedes hacer que brille como se merece. Al patrocinar su constelación 3×3, el 50% del importe se destina como donación directa al refugio para alimentar y cuidar a los perros que aún esperan adopción.
              </p>

              {/* Cuadrícula 3x3 Miniatura ilustrativa Ampliada con paleta suave pastel */}
              <div className="w-full flex justify-center my-3">
                <div 
                  className="grid grid-cols-3 gap-2.5 p-3 rounded-[24px] border shadow-md w-full max-w-[220px]"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderColor: 'rgba(255, 235, 245, 0.9)',
                    boxShadow: '0 8px 24px rgba(210, 180, 220, 0.16)'
                  }}
                >
                  {/* (0,0) Melocotón suave */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#FFF6EC] to-[#FFE5CC] border border-[#FED7AA] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(251,146,60,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/paw.svg" alt="Huella" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.20)]" />
                  </div>

                  {/* (0,1) Rosa pastel */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(244,114,182,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/star.svg" alt="Destello" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.20)]" />
                  </div>

                  {/* (0,2) Lavanda suave */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#F5F0FF] to-[#E9DEFF] border border-[#DDD6FE] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(167,139,250,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/paw.svg" alt="Huella" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(139,92,246,0.20)]" />
                  </div>
                  
                  {/* (1,0) Celeste periwinkle */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#F0F6FF] to-[#E0EBFF] border border-[#BFDBFE] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(96,165,250,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/star.svg" alt="Destello" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.20)]" />
                  </div>

                  {/* (1,1) Foto del perrito en el centro con marco dorado */}
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#EAB308]/70 shadow-[0_4px_12px_rgba(234,179,8,0.25)] bg-white relative hover:scale-105 transition-transform duration-300">
                    <img 
                      src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg" 
                      alt="Perrito apadrinado"
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* (1,2) Melocotón crema */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEACC] border border-[#FED7AA] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(251,146,60,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/star.svg" alt="Destello" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.20)]" />
                  </div>

                  {/* (2,0) Lila pastel */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#EDE4FF] border border-[#E9D5FF] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(192,132,252,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/paw.svg" alt="Huella" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(168,85,247,0.20)]" />
                  </div>

                  {/* (2,1) Rosa nube */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(251,113,133,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/star.svg" alt="Destello" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.20)]" />
                  </div>

                  {/* (2,2) Celeste malva */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#E4E7FF] border border-[#C7D2FE] flex items-center justify-center p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_2px_6px_rgba(129,140,248,0.12)] hover:scale-105 transition-transform duration-300">
                    <Image src="/images/icons/paw.svg" alt="Huella" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(99,102,241,0.20)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Botón CTA Moradito Claro Estilo HeavenCTAButton */}
            <button 
              onClick={() => setIsApadrinarDrawerOpen(true)}
              className="mt-6 w-full py-3.5 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer relative z-10"
              style={{
                background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #8B5CF6 100%)',
                boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -3px 6px rgba(139, 92, 246, 0.4), 0 0 0 1.8px rgba(233, 213, 255, 0.9), 0 0 14px 3px rgba(167, 139, 250, 0.45), 0 8px 20px -2px rgba(139, 92, 246, 0.4)',
                letterSpacing: '0.3px',
                textShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}
            >
              <span className="flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path fill="#FFFDF0" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span>Dar 9 estrellas a un angelito</span>
              <span className="text-xs">›</span>
            </button>
          </div>

          {/* ======================= */}
          {/* TARJETA 3: RECONOCIMIENTO */}
          {/* ======================= */}
          <div 
            className="plan-card heaven-card flex flex-col justify-between relative group rounded-[28px] p-6 sm:p-7 transition-all duration-300 overflow-hidden shadow-[0_12px_32px_rgba(180,140,190,0.12)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(180,140,190,0.20)]"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.70)', 
              borderColor: 'rgba(255, 255, 255, 0.85)', 
              borderWidth: '1.5px',
              backdropFilter: 'blur(14px)'
            }}
          >
            {/* 6 MARIPOSAS REPARTIDAS POR LA TARJETA */}
            <div className="absolute top-3 left-[135px] sm:left-[150px] w-7 h-7 -rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.30)] opacity-95 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-4 right-3 w-6 h-6 rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.30)] opacity-85 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={24} height={24} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[140px] right-3 w-5 h-5 -rotate-6 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.30)] opacity-75 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-[165px] left-3 w-5 h-5 rotate-45 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[90px] right-4 w-7 h-7 rotate-12 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.30)] opacity-85 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly1.svg" alt="Mariposa" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[92px] left-4 w-5 h-5 -rotate-15 pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(167,139,250,0.25)] opacity-70 group-hover:scale-115 transition-transform duration-500">
              <Image src="/images/icons/butterfly2.svg" alt="Mariposa" width={20} height={20} className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10">
              {/* Encabezado: Logoheart en la esquina izquierda (aumentado 100% · 160px) */}
              <div className="flex items-center justify-start w-full mb-2">
                <div className="w-36 h-36 sm:w-40 sm:h-40 relative flex items-center justify-center shrink-0 -ml-3 -mt-2">
                  <Image 
                    src="/images/icons/Logoheart.svg" 
                    alt="Corazón de Ángel" 
                    width={160}
                    height={160}
                    className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(244,114,182,0.45)] hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <h3 className="plan-title text-[#1E2A78] mb-2 leading-tight">
                Reconocimiento Corazón de Ángel
              </h3>
              <p className="body-copy text-sm sm:text-base leading-relaxed mb-3">
                Si apadrinas en memoria de tu propia mascota, su amor se convertirá en un puente: recibirás el distintivo oficial <strong>Ángel con Corazón de Perrito</strong>, visible en el mural y con certificado conmemorativo descargable.
              </p>

              {/* Imagen Ilustrativa Tarjeta 3 (220x220) con suave opacidad y cintillo de Ejemplo */}
              <div className="w-full flex justify-center my-3">
                <div className="w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border border-[#FDE68A]/70 shadow-md relative bg-white/60 backdrop-blur-xs group/img">
                  <Image 
                    src="/images/solidario/tarjeta3-220x220.webp" 
                    alt="Reconocimiento Corazón de Ángel" 
                    width={220} 
                    height={220} 
                    className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 transition-opacity duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Botón CTA Color Oficial heaven-cta-btn (Rosa/Melocotón Cálido Celestial) */}
            <button 
              onClick={() => setIsSocialDemoOpen(true)}
              className="mt-6 w-full py-3.5 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer relative z-10"
              style={{
                background: 'linear-gradient(135deg, #F86E9E 0%, #FA8994 50%, #FFB680 100%)',
                boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -3px 6px rgba(255, 140, 90, 0.4), 0 0 0 1.8px rgba(255, 225, 130, 0.85), 0 0 14px 3px rgba(255, 160, 80, 0.5), 0 8px 20px -2px rgba(248, 110, 158, 0.55)',
                letterSpacing: '0.3px',
                textShadow: '0 1px 2px rgba(0,0,0,0.12)'
              }}
            >
              <span className="flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <defs>
                    <linearGradient id="cream-heart-card3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="50%" stopColor="#FFF2D6" />
                      <stop offset="100%" stopColor="#FFDEB5" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#cream-heart-card3)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span>Ver ejemplo de Reconocimiento</span>
              <span className="text-xs">›</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: REGISTRO DE PROTECTORA PILOTO */}
      {mounted && isShelterModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 10, 30, 0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShelterModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#E9D5FF] text-left">
            <button
              onClick={() => setIsShelterModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-2xl">🏡</span>
              <h3 
                className="text-xl font-bold text-[#1E2A78]"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Programa Piloto para Protectoras
              </h3>
            </div>
            <p className="text-xs text-[#5D4E75] mb-5 leading-relaxed">
              Publica 5 angelitos que hayan fallecido en tu protectora o refugio de forma 100% gratuita. Los prepararemos con amor para el Mural Global.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <span className="text-4xl block">🐾✨</span>
                <h4 className="font-bold text-emerald-900 text-base">¡Solicitud recibida con éxito!</h4>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Hemos recibido los datos de <strong>{shelterName}</strong>. Te hemos enviado un correo de confirmación a <strong>{shelterEmail}</strong> y nos pondremos en contacto contigo en las próximas 24 horas para habilitar los 5 recuerdos gratuitos de tu refugio.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      setIsShelterModalOpen(false)
                      setSubmitted(false)
                      setShelterName('')
                      setShelterCity('')
                      setShelterEmail('')
                      setShelterPhone('')
                      setShelterNotes('')
                    }}
                    className="px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Entendido, muchas gracias
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola, acabo de enviar la solicitud del programa piloto para la protectora ${shelterName} en ${shelterCity}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Escribir también por WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitShelter} className="space-y-3.5 text-xs">
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">
                    Nombre de la Protectora o Refugio <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Asociación Amigos de los Animales"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">
                    Ciudad o Región <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valencia, Madrid, Sevilla..."
                    value={shelterCity}
                    onChange={(e) => setShelterCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">
                    Email de contacto <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. contacto@protectora.org"
                    value={shelterEmail}
                    onChange={(e) => setShelterEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">
                    Teléfono o WhatsApp <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 612 345 678"
                    value={shelterPhone}
                    onChange={(e) => setShelterPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">
                    Notas o comentarios <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="N.º aproximado de perros en custodia, enlace a vuestra web o redes sociales..."
                    value={shelterNotes}
                    onChange={(e) => setShelterNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <span>🐾</span>
                      <span>Solicitar 5 recuerdos gratuitos para la protectora</span>
                      <span>›</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: DIPLOMA CONMEMORATIVO OFICIAL A4 */}
      {mounted && isSocialDemoOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSocialDemoOpen(false)
          }}
        >
          <div className="bg-white rounded-3xl max-w-[760px] w-full p-4 sm:p-6 text-left shadow-2xl border-2 border-pink-200 relative my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl">📜</span>
                <h4 
                  className="font-bold text-sm sm:text-base text-[#1E2A78]"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  Diploma Conmemorativo Oficial · Corazones de Ángel
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 tracking-wide uppercase shrink-0">
                  Muestra de Ejemplo
                </span>
              </div>
              <button 
                onClick={() => setIsSocialDemoOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5D4E75] mb-4 leading-relaxed">
              Este es un <strong>modelo de demostración</strong>. Al apadrinar las 9 estrellas de un angelito en memoria de tu propia mascota, recibirás este <strong>Reconocimiento Oficial personalizado descargable en alta resolución (A4 imprimible a 300 DPI)</strong> y la cinta conmemorativa de apadrinamiento en el Mural Global.
            </p>

            <SponsorshipCertificateA4 
              data={{
                sponsorName: 'Familia Gómez Martí',
                petName: 'Juliette',
                shelterName: 'Refugio Nueva Vida',
              }}
              isSample={true}
            />
          </div>
        </div>,
        document.body
      )}

      {/* DRAWER DE APADRINAMIENTO SOLIDARIO (9 ESTRELLAS - ESTILO MURAL DRAWER) */}
      <ApadrinarDrawer 
        isOpen={isApadrinarDrawerOpen} 
        onClose={() => setIsApadrinarDrawerOpen(false)} 
      />

    </section>
  )
}
