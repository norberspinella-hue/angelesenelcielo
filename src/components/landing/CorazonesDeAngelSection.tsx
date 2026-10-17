'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function CorazonesDeAngelSection() {
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false)
  const [isSocialDemoOpen, setIsSocialDemoOpen] = useState(false)
  const [shelterName, setShelterName] = useState('')
  const [shelterCity, setShelterCity] = useState('')
  const [shelterContact, setShelterContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitShelter = (e: React.FormEvent) => {
    e.preventDefault()
    const message = `Hola, represento a la protectora ${shelterName} en ${shelterCity}. Queremos sumarnos al programa piloto Corazones de Ángel para publicar 5 angelitos de forma gratuita. Contacto: ${shelterContact}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <section 
      id="corazones-de-angel"
      className="w-full py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center transition-all"
    >
      {/* Contenedor central proporcionado */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center">

        {/* 1. BADGE CABECERA PILL */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#DCA257]/50 shadow-xs text-xs font-semibold text-[#8B6528] tracking-wide mb-2">
          <span className="text-xs select-none">🐾</span>
          <span className="font-bold tracking-widest text-[10px] sm:text-[11px] text-[#A67831]">INICIATIVA SOLIDARIA</span>
          <span className="text-xs select-none">💛</span>
        </div>

        {/* 2. TÍTULO PRINCIPAL SERIF */}
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-3xl text-[#2E214D]"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Iniciativa Solidaria · Corazones de Ángel
        </h2>

        {/* 3. SUBTÍTULO CON DIAMANTES DORADOS */}
        <div 
          className="flex items-center justify-center gap-2 my-2 text-xs sm:text-sm md:text-base italic font-semibold text-[#A07028]"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          <span className="text-[10px] select-none">◇</span>
          <span>Una huella por los que siguen esperando</span>
          <span className="text-[10px] select-none">◇</span>
        </div>

        {/* 4. TEXTO EMOCIONAL (JULIETTE) */}
        <p className="text-xs sm:text-sm text-[#4A3F6B] max-w-2xl leading-relaxed mt-0.5 font-medium">
          Inspirados en la historia de <strong>Juliette</strong> y en todos los compañeros que llenaron nuestras vidas de amor.<br className="hidden sm:inline" />
          Porque recordar a los que ya brillan y cuidar a los que siguen esperando son dos formas de decir lo mismo:<br />
          <strong className="text-[#2E214D] font-bold">todas las vidas importan.</strong>
        </p>

        {/* 5. CITA REFLEXIVA */}
        <p className="text-[11px] sm:text-xs text-[#6C5B8A] italic max-w-lg leading-relaxed mt-1.5 mb-6">
          No todos los perritos tuvieron una familia que pudiera pronunciar su nombre al despedirse...<br />
          Todos merecen una historia, una luz y un lugar digno en el cielo.
        </p>

        {/* ======================================================== */}
        {/* 6. LAS 3 TARJETAS DE CRISTAL (PROTECTORAS · COMUNIDAD · BADGE) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full max-w-4xl text-left my-1 items-stretch">
          
          {/* ======================= */}
          {/* TARJETA 1: PROTECTORAS */}
          {/* ======================= */}
          <div className="rounded-[24px] p-5 sm:p-5 flex flex-col justify-between relative overflow-hidden bg-white/85 backdrop-blur-[14px] border-[1.5px] border-white/95 shadow-[0_12px_32px_rgba(180,140,190,0.14)] hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(180,140,190,0.22)] transition-all">
            <div>
              {/* Encabezado: Logo Casa en la esquina izquierda + Mariposa a su derecha + Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                    <Image 
                      src="/images/solidario/icon-casa-protectoras.svg" 
                      alt="Casa Protectoras" 
                      width={54}
                      height={54}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(200,160,180,0.30)] hover:scale-105 transition-transform"
                    />
                  </div>
                  {/* Mariposa al lado derecho del icono */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 relative -mt-3 shrink-0">
                    <Image 
                      src="/images/icons/butterfly1.svg" 
                      alt="Mariposa" 
                      width={32}
                      height={32}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(236,72,153,0.35)] hover:scale-110 hover:rotate-6 transition-transform"
                    />
                  </div>
                </div>

                {/* Badge Mayor Impacto */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[9.5px] font-bold shadow-xs">
                  <span>👑</span>
                  <span>Mayor Impacto</span>
                </div>
              </div>

              <span className="text-[9.5px] font-extrabold text-[#9C7A4E] uppercase tracking-wider block mb-0.5">
                PARA PROTECTORAS & REFUGIOS
              </span>
              <h3 
                className="text-base sm:text-lg font-bold text-[#2E214D] mb-1.5 leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                5 Angelitos Gratuitos
              </h3>
              <p className="text-[11.5px] text-[#584582] leading-relaxed">
                Invitamos a protectoras colaboradoras a publicar hasta 5 perros fallecidos bajo su custodia sin ningún coste. Tendrán su luz y su historia preservadas para siempre en el mural.
              </p>
            </div>

            {/* Botón CTA Estilo HeavenCTAButton */}
            <button 
              onClick={() => {
                setIsShelterModalOpen(true)
                setSubmitted(false)
              }}
              className="mt-4 w-full py-3 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
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
              <span>Inscribir protectora piloto</span>
              <span className="text-xs">›</span>
            </button>
          </div>

          {/* ======================= */}
          {/* TARJETA 2: COMUNIDAD */}
          {/* ======================= */}
          <div className="rounded-[24px] p-5 sm:p-5 flex flex-col justify-between relative overflow-hidden bg-white/85 backdrop-blur-[14px] border-[1.5px] border-white/95 shadow-[0_12px_32px_rgba(180,140,190,0.14)] hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(180,140,190,0.22)] transition-all">
            <div>
              {/* Encabezado: Estrella en la esquina izquierda (misma posicón) + Mariposa a su derecha + Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                    <Image 
                      src="/images/icons/plans/icon-plan-estrella.svg" 
                      alt="Estrella Solidaria" 
                      width={54}
                      height={54}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(245,190,60,0.40)] hover:scale-105 transition-transform"
                    />
                  </div>
                  {/* Mariposa al lado derecho del icono */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 relative -mt-3 shrink-0">
                    <Image 
                      src="/images/icons/butterfly2.svg" 
                      alt="Mariposa" 
                      width={32}
                      height={32}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(167,139,250,0.35)] hover:scale-110 hover:-rotate-6 transition-transform"
                    />
                  </div>
                </div>

                {/* Badge 50% donación directa */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-[9.5px] font-bold shadow-xs">
                  <span>🩷</span>
                  <span>50% donación directa</span>
                </div>
              </div>

              <span className="text-[9.5px] font-extrabold text-[#9C7A4E] uppercase tracking-wider block mb-0.5">
                COMUNIDAD SOLIDARIA
              </span>
              <h3 
                className="text-base sm:text-lg font-bold text-[#2E214D] mb-1.5 leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Patrocinar sus 9 Estrellas
              </h3>
              <p className="text-[11.5px] text-[#584582] leading-relaxed mb-2">
                Una protectora le da una luz; tú puedes hacer que brille como se merece. Al patrocinar su constelación 3×3, el 50% del importe se destina como donación directa al refugio para alimentar y cuidar a los perros que aún esperan adopción.
              </p>

              {/* Cuadrícula 3x3 Miniatura ilustrativa */}
              <div className="w-full flex justify-center my-1">
                <div className="grid grid-cols-3 gap-1 p-1.5 rounded-xl bg-white/75 border border-[#E9D5FF]/60 shadow-inner w-32">
                  <div className="h-6 rounded bg-[#FFFBEB] flex items-center justify-center text-[10px]">🐾</div>
                  <div className="h-6 rounded bg-pink-50 flex items-center justify-center text-[8px]">✨</div>
                  <div className="h-6 rounded bg-[#FFFBEB] flex items-center justify-center text-[10px]">🐾</div>
                  
                  <div className="h-6 rounded bg-pink-50 flex items-center justify-center text-[8px]">✨</div>
                  {/* Foto del perrito en el centro */}
                  <div className="h-6 rounded overflow-hidden border border-[#DCA257] shadow-xs bg-white">
                    <img 
                      src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg" 
                      alt="Perrito apadrinado"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="h-6 rounded bg-pink-50 flex items-center justify-center text-[8px]">✨</div>

                  <div className="h-6 rounded bg-[#FFFBEB] flex items-center justify-center text-[10px]">🐾</div>
                  <div className="h-6 rounded bg-pink-50 flex items-center justify-center text-[8px]">✨</div>
                  <div className="h-6 rounded bg-[#FFFBEB] flex items-center justify-center text-[10px]">🐾</div>
                </div>
              </div>
            </div>

            {/* Botón CTA Moradito Claro Estilo HeavenCTAButton */}
            <Link 
              href="/mural-global"
              className="mt-4 w-full py-3 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
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
              <span>Ver ángeles en el mural</span>
              <span className="text-xs">›</span>
            </Link>
          </div>

          {/* ======================= */}
          {/* TARJETA 3: RECONOCIMIENTO */}
          {/* ======================= */}
          <div className="rounded-[24px] p-5 sm:p-5 flex flex-col justify-between relative overflow-hidden bg-white/85 backdrop-blur-[14px] border-[1.5px] border-white/95 shadow-[0_12px_32px_rgba(180,140,190,0.14)] hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(180,140,190,0.22)] transition-all">
            <div>
              {/* Encabezado: Logoheart en la esquina izquierda (misma posición) + Mariposa a su derecha + Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                    <Image 
                      src="/images/icons/Logoheart.svg" 
                      alt="Corazón de Ángel" 
                      width={54}
                      height={54}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(244,114,182,0.40)] hover:scale-105 transition-transform"
                    />
                  </div>
                  {/* Mariposa al lado derecho del icono */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 relative -mt-3 shrink-0">
                    <Image 
                      src="/images/icons/butterfly1.svg" 
                      alt="Mariposa" 
                      width={32}
                      height={32}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.35)] hover:scale-110 hover:rotate-6 transition-transform"
                    />
                  </div>
                </div>

                {/* Badge Guardián Solidario */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[9.5px] font-bold shadow-xs">
                  <span>💛</span>
                  <span>Guardián Solidario</span>
                </div>
              </div>

              <span className="text-[9.5px] font-extrabold text-[#9C7A4E] uppercase tracking-wider block mb-0.5">
                ESTATUS PROSOCIAL & RECUERDO
              </span>
              <h3 
                className="text-base sm:text-lg font-bold text-[#2E214D] mb-1.5 leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Badge «Corazón de Ángel»
              </h3>
              <p className="text-[11.5px] text-[#584582] leading-relaxed mb-2">
                Si apadrinas en memoria de tu propia mascota, su amor se convertirá en un puente: recibirás el distintivo oficial <strong>Ángel con Corazón de Perrito</strong>, visible en el mural y con certificado conmemorativo descargable.
              </p>

              {/* Miniatura de certificado y medalla */}
              <div className="w-full flex items-center justify-center gap-2 p-1.5 rounded-xl bg-white/75 border border-[#FDE68A] shadow-xs my-1">
                <div 
                  className="text-[8.5px] text-center text-[#8A6528] leading-tight"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  <span className="font-bold block">📜 Certificado Oficial</span>
                  <span className="text-[7.5px] opacity-75">Corazón de Ángel</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FDE68A] to-[#F59E0B] flex items-center justify-center shadow-xs text-[10px]">
                  💛
                </div>
              </div>
            </div>

            {/* Botón CTA Color Oficial heaven-cta-btn (Rosa/Melocotón Cálido Celestial) */}
            <button 
              onClick={() => setIsSocialDemoOpen(true)}
              className="mt-4 w-full py-3 px-4 rounded-full text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
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
              <span>Reconocimiento y Badge</span>
              <span className="text-xs">›</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 7. BARRA FLOTANTE INFERIOR: RECORDAR TAMBIÉN SALVA VIDAS */}
        {/* ======================================================== */}
        <div className="w-full max-w-3xl mt-6 rounded-full p-2.5 sm:p-3 bg-white/85 backdrop-blur-xl border border-white/95 shadow-[0_12px_30px_rgba(180,140,190,0.14)] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 text-left pl-2 sm:pl-3">
            <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-base shrink-0 shadow-inner">
              🐾
            </div>
            <div>
              <h4 
                className="font-bold text-xs sm:text-sm text-[#2E214D] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Recordar también puede salvar vidas.
              </h4>
              <p className="text-[10.5px] text-[#706A95] leading-snug">
                Cada historia compartida mantiene viva su luz y ayuda a otros perros que aún esperan una oportunidad.
              </p>
            </div>
          </div>

          <Link 
            href="/mural-global"
            className="py-2 px-5 sm:px-6 rounded-full text-xs font-bold text-white shadow-sm whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(90deg, #F472B6 0%, #EC4899 100%)' }}
          >
            <span>Quiero ayudar 🩷</span>
            <span className="ml-1">›</span>
          </Link>

        </div>

      </div>

      {/* MODAL 1: REGISTRO DE PROTECTORA PILOTO */}
      {isShelterModalOpen && (
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
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-3xl block mb-2">🐾</span>
                <h4 className="font-bold text-emerald-800 text-sm mb-1">¡Gracias por contactarnos!</h4>
                <p className="text-xs text-emerald-700">
                  Te responderemos muy pronto por WhatsApp o correo para habilitar los 5 recuerdos gratuitos de tu refugio.
                </p>
                <button
                  onClick={() => setIsShelterModalOpen(false)}
                  className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitShelter} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-[#1E2A78] block mb-1">Nombre de la Protectora o Refugio</label>
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
                  <label className="font-semibold text-[#1E2A78] block mb-1">Ciudad o Región</label>
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
                  <label className="font-semibold text-[#1E2A78] block mb-1">Teléfono (WhatsApp) o Email de contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 612 345 678 o info@asociacion.org"
                    value={shelterContact}
                    onChange={(e) => setShelterContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01] mt-2"
                  style={{ background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)' }}
                >
                  Solicitar los 5 recuerdos gratuitos por WhatsApp 💬
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DEMOSTRACIÓN VISIBILIDAD & ENLACE SOCIAL DONANTE */}
      {isSocialDemoOpen && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSocialDemoOpen(false)
          }}
        >
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 text-left shadow-2xl border border-purple-200 relative">
            <button 
              onClick={() => setIsSocialDemoOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📱</span>
              <h4 
                className="font-bold text-lg text-[#1E2A78]"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Enlace Social del Donante / Protectora
              </h4>
            </div>

            <p className="text-xs text-[#5D4E75] mb-4 leading-relaxed">
              Así es como luce la ficha de un perrito apadrinado en el mural para dar <strong>visibilidad pública, estatus y agradecimiento</strong> a quien realizó la aportación:
            </p>

            {/* Tarjeta simulación del mural con badge de donante */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#FFF9F5] to-[#F5EEFF] border border-[#F5C842]/50 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DCA257]">
                  <img 
                    src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg" 
                    alt="Juliette"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#1E2A78]">Juliette · Ángel Protegido</h5>
                  <span className="text-[11px] text-[#706A95]">Refugio Huellas de Esperanza</span>
                </div>
              </div>

              {/* CINTA DE RECONOCIMIENTO CON ENLACE SOCIAL */}
              <div className="p-3 rounded-xl bg-white/90 border border-[#FDE68A] flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase text-[#B45309] tracking-wider flex items-center gap-1">
                  <span>💛</span>
                  <span>Apadrinado por Corazón de Ángel</span>
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-bold text-[#1E2A78]">Laura & Familia (en memoria de Toby)</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                    <span>📸</span>
                    <span>@laura_petlover ↗</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#706A95] italic">«Gracias por hacer que su estrella brille eternamente en el cielo.»</span>
              </div>
            </div>

            <button 
              onClick={() => setIsSocialDemoOpen(false)} 
              className="mt-5 w-full py-2.5 rounded-full bg-[#1E2A78] text-white text-xs font-bold hover:bg-[#151C5C] transition-colors"
            >
              Entendido ✓
            </button>
          </div>
        </div>
      )}

    </section>
  )
}
