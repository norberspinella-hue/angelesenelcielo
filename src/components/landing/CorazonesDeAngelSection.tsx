'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export function CorazonesDeAngelSection() {
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false)
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
    <section id="corazones-de-angel" className="w-full py-16 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF5FF] to-[#FFF9F2]">
      
      {/* Contenedor central */}
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#6D28D9] text-xs font-bold mb-4 shadow-xs">
          <span>🐾</span>
          <span>Iniciativa Solidaria · Corazones de Ángel</span>
          <span>💛</span>
        </div>

        {/* Título Principal */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif italic text-[#1E2A78] max-w-3xl leading-tight">
          «Una huella por los que siguen esperando»
        </h2>

        {/* Subtítulo inspirador */}
        <p className="text-sm sm:text-base md:text-lg text-[#5D4E75] max-w-2xl mt-4 leading-relaxed font-sans">
          Inspirados en la historia de <strong>Juliette</strong> y en todos los compañeros que llenaron nuestras vidas de amor. Porque recordar a los que ya brillan y cuidar a los que siguen esperando son dos formas de decir lo mismo: <em>todas las vidas importan</em>.
        </p>

        {/* Cita reflexiva (S10) */}
        <div className="max-w-xl mx-auto my-8 p-5 rounded-2xl bg-white/80 border border-[#E9D5FF] shadow-xs text-xs sm:text-sm text-[#4A3F6B] italic font-serif leading-relaxed">
          “No todos los perritos tuvieron una familia que pudiera pronunciar su nombre al despedirse. Algunos pasaron por protectoras, otros por calles donde apenas alguien los vio. Pero ninguno fue invisible. Todos merecen una historia, una luz y un lugar digno en el cielo.”
        </div>

        {/* Los 3 Pilares del Programa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left my-4">
          
          {/* Tarjeta 1: Protectoras Piloto */}
          <div className="bg-white/90 rounded-[24px] p-6 border border-[#E2D9F3] shadow-[0_8px_30px_rgba(100,70,150,0.06)] flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(100,70,150,0.12)] transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-inner">
                🏡
              </div>
              <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider block mb-1">
                Para Protectoras & Refugios
              </span>
              <h3 className="text-lg font-bold text-[#1E2A78] font-serif mb-2">
                5 Angelitos Gratuitos
              </h3>
              <p className="text-xs text-[#5D4E75] leading-relaxed">
                Invitamos a protectoras colaboradoras a publicar hasta 5 perros fallecidos bajo su custodia sin ningún coste. Tendrán su luz y su historia preservadas para siempre en el mural.
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsShelterModalOpen(true)
                setSubmitted(false)
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] text-xs font-bold transition-all text-center border border-[#C4B5FD]/50"
            >
              Inscribir protectora piloto 🐾
            </button>
          </div>

          {/* Tarjeta 2: Patrocinar 9 Estrellas */}
          <div className="bg-white/90 rounded-[24px] p-6 border border-[#FDE68A] shadow-[0_8px_30px_rgba(201,169,97,0.10)] flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(201,169,97,0.18)] transition-all relative">
            <span className="absolute -top-3 right-5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-sm">
              Mayor Impacto
            </span>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-2xl mb-4 shadow-inner">
                ✨
              </div>
              <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider block mb-1">
                Comunidad Solidaria
              </span>
              <h3 className="text-lg font-bold text-[#1E2A78] font-serif mb-2">
                Patrocinar sus 9 Estrellas
              </h3>
              <p className="text-xs text-[#5D4E75] leading-relaxed">
                Una protectora le da una luz; tú puedes hacer que brille como se merece. Al patrocinar su constelación 3×3, el <strong>50% del importe</strong> se destina como donación directa al refugio para alimentar y cuidar a los perros que aún esperan adopción.
              </p>
            </div>

            <a
              href="/mural-global"
              className="mt-6 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold transition-all text-center shadow-md hover:scale-[1.02]"
            >
              Ver ángeles en el mural 🌟
            </a>
          </div>

          {/* Tarjeta 3: Badge Corazón de Ángel */}
          <div className="bg-white/90 rounded-[24px] p-6 border border-[#FBCFE8] shadow-[0_8px_30px_rgba(236,72,153,0.08)] flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(236,72,153,0.14)] transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center text-2xl mb-4 shadow-inner">
                💛
              </div>
              <span className="text-[11px] font-bold text-[#DB2777] uppercase tracking-wider block mb-1">
                Estatus Prosocial & Recuerdo
              </span>
              <h3 className="text-lg font-bold text-[#1E2A78] font-serif mb-2">
                Badge «Corazón de Ángel»
              </h3>
              <p className="text-xs text-[#5D4E75] leading-relaxed">
                Si apadrinas en memoria de tu propia mascota, su amor se convertirá en un puente: recibirás el distintivo oficial <strong>Ángel con Corazón de Perrito</strong>, visible en el mural y con certificado conmemorativo descargable.
              </p>
            </div>

            <div className="mt-6 py-2 px-3 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] text-[11px] font-semibold text-[#BE185D] text-center flex items-center justify-center gap-1.5">
              <span>🐾</span>
              <span>Reconocimiento eterno al donante</span>
            </div>
          </div>

        </div>

        {/* Frase de pie de sección */}
        <p className="text-xs text-[#706A95] mt-8 flex items-center gap-2">
          <span>💜</span>
          <span>100% de transparencia en cada aportación benéfica vinculada a protectoras verificadas.</span>
        </p>

      </div>

      {/* Modal de Registro de Protectora Piloto */}
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
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-2xl">🏡</span>
              <h3 className="text-xl font-bold font-serif text-[#1E2A78]">
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
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                  }}
                >
                  Solicitar los 5 recuerdos gratuitos por WhatsApp 💬
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  )
}
