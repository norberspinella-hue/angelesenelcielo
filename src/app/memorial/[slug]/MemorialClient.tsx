'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface Memorial {
  id: string
  pet_name: string
  species: string
  breed: string
  birth_date: string
  death_date: string
  location: string
  dedication: string
  photo_url: string
  plan_type: string
  profile_slug: string
}

export default function MemorialClient({ slug }: { slug: string }) {
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sobre-mi')
  const [huellitasCount, setHuellitasCount] = useState(1248)
  const [floatingPaws, setFloatingPaws] = useState<{ id: number; x: number; y: number }[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadMemorial()
  }, [slug])

  const loadMemorial = async () => {
    const { data, error } = await (supabase
      .from('memorials') as any)
      .select('*')
      .eq('profile_slug', slug)
      .eq('visibility', 'public')
      .single()

    if (error || !data) {
      setLoading(false)
      return
    }

    setMemorial(data)
    // Generar un conteo de huellitas semi-aleatorio basado en el ID para no empezar en cero
    const seed = data.id.charCodeAt(0) + data.id.charCodeAt(1) || 1248
    setHuellitasCount(Math.floor((seed * 3) % 1500) + 150)
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      perro: '🐶', gato: '🐱', conejo: '🐰',
      pajaro: '🐦', caballo: '🐴', otro: '🐾'
    }
    return emojis[species] || '🐾'
  }

  const getPlanStyle = (plan: string) => {
    switch (plan) {
      case 'recuerdo_eterno':
        return { bg: 'bg-amber-500/10 text-amber-700 border-amber-500/25', label: 'Eterno' }
      case 'estrella_anual':
        return { bg: 'bg-purple-500/10 text-purple-700 border-purple-500/25', label: 'Estrella' }
      default:
        return { bg: 'bg-pink-500/10 text-pink-700 border-pink-500/25', label: 'Huellita' }
    }
  }

  const shareUrl = typeof window !== 'undefined' 
    ? window.location.href : ''

  const handleShare = (platform: string) => {
    const text = `Recuerda a ${memorial?.pet_name} ✨ ${shareUrl}`
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      instagram: shareUrl,
      copy: shareUrl,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
      alert('¡Enlace copiado!')
      return
    }
    window.open(urls[platform], '_blank')
  }

  const handleDejarHuellita = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()

    setFloatingPaws(prev => [...prev, { id, x, y }])
    setHuellitasCount(prev => prev + 1)

    setTimeout(() => {
      setFloatingPaws(prev => prev.filter(p => p.id !== id))
    }, 1000)
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] font-playfair text-2xl text-[#4A3F6B]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-[#EC6F9B] border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Cargando recuerdo... ✨</p>
      </div>
    </div>
  )

  if (!memorial) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] font-playfair text-center p-8">
      <div className="text-8xl mb-6">🐾</div>
      <h1 className="text-[#4A3F6B] text-3xl font-bold mb-4">
        Este recuerdo no existe
      </h1>
      <p className="text-[#7B6F9A] text-lg max-w-md mb-8">
        El perfil que estás buscando no está disponible o está configurado como privado.
      </p>
      <Link href="/" className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
        Volver al inicio
      </Link>
    </div>
  )

  const birthYear = memorial.birth_date 
    ? new Date(memorial.birth_date).getFullYear() : null
  const deathYear = memorial.death_date 
    ? new Date(memorial.death_date).getFullYear() : null

  const planStyle = getPlanStyle(memorial.plan_type)

  return (
    <div className="min-h-screen bg-cover bg-center font-playfair flex flex-col" style={{ backgroundImage: 'url("/images/placeholders/bg-page-heaven-desktop.png")' }}>
      
      {/* NAV BAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white/70 backdrop-blur-md border-b border-purple-100/50 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-[#1E2A78] text-lg md:text-xl">
          <img src="/images/icons/Logoheart.svg" alt="Heart" className="w-8 h-8" />
          <span>Ángeles en el Cielo</span>
        </Link>
        <Link href="/mural-global" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
          Crear memorial 🐾
        </Link>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-12 pb-8 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
        
        {/* Nubes y arcoíris decorativos de fondo en el hero */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" />

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-8 lg:gap-12 items-start relative z-10">

          {/* COLUMNA 1: FOTO DEL MASCOTA */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 md:w-72 md:h-72">
              
              {/* Halo dorado animado */}
              <div 
                className="absolute inset-[-12px] rounded-full animate-[pulse_3s_ease-in-out_infinite]"
                style={{
                  background: 'radial-gradient(circle, rgba(255,220,100,0.45) 0%, rgba(255,200,80,0.20) 50%, transparent 70%)',
                }}
              />
              
              {/* Círculo foto */}
              <div className="w-full h-full rounded-full overflow-hidden border-6 border-white shadow-2xl relative bg-white flex items-center justify-center">
                <img
                  src={memorial.photo_url}
                  alt={memorial.pet_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Aureola flotante */}
              <div className="absolute top-[-22px] left-1/2 -translate-x-1/2 text-4xl select-none animate-bounce">
                😇
              </div>
            </div>

            {/* Badge de Plan */}
            <span className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold font-inter border ${planStyle.bg} tracking-wider uppercase`}>
              Plan {planStyle.label}
            </span>
          </div>

          {/* COLUMNA 2: DETALLES CENTRALES */}
          <div className="flex flex-col items-center text-center lg:pt-6">
            
            {/* Nombre con tipografía cursiva/display */}
            <h1 className="text-6xl md:text-8xl font-bold text-[#EC6F9B] italic mb-2 tracking-tight drop-shadow-sm leading-none">
              {memorial.pet_name}
            </h1>

            {/* Rango de años */}
            {birthYear && deathYear ? (
              <p className="text-xl md:text-2xl text-[#7B6F9A] font-semibold mb-6 tracking-wide">
                ✨ {birthYear} - {deathYear} ✨
              </p>
            ) : deathYear ? (
              <p className="text-xl md:text-2xl text-[#7B6F9A] font-semibold mb-6 tracking-wide">
                ✨ {deathYear} ✨
              </p>
            ) : null}

            {/* Dedicatoria */}
            <blockquote className="text-lg md:text-xl text-[#4A3F6B] leading-relaxed max-w-lg mb-4 italic font-normal">
              "{memorial.dedication || 'Siempre en nuestro recuerdo, brillando en el cielo.'}"
            </blockquote>

            <p className="text-[#EC6F9B] font-semibold text-sm tracking-widest uppercase mb-8">
              Siempre en nuestro corazón 🩵
            </p>

            {/* Botón interactivo "Dejar mi huellita" */}
            <button 
              onClick={handleDejarHuellita}
              className="relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2 group pointer-events-auto"
            >
              <span>🐾 Dejar mi huellita</span>
              <span className="opacity-80 group-hover:scale-110 transition-transform">🩵</span>

              {/* Floating paws container */}
              {floatingPaws.map(paw => (
                <span 
                  key={paw.id}
                  className="absolute text-xl pointer-events-none animate-floatUp"
                  style={{
                    left: paw.x - 10,
                    top: paw.y - 20,
                  }}
                >
                  🐾
                </span>
              ))}
            </button>
          </div>

          {/* COLUMNA 3: CARDS LATERALES (INFO + STATS) */}
          <div className="flex flex-col gap-6 w-full max-w-[320px] mx-auto lg:mx-0">
            
            {/* Info list card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-purple-100/50 shadow-lg">
              {[
                { icon: '🐾', label: 'Especie', value: `${getSpeciesEmoji(memorial.species)} ${memorial.species?.charAt(0).toUpperCase() + memorial.species?.slice(1)}` },
                { icon: '📋', label: 'Raza', value: memorial.breed || 'Mestizo' },
                { icon: '🎂', label: 'Nacimiento', value: formatDate(memorial.birth_date) },
                { icon: '🌈', label: 'Partida', value: formatDate(memorial.death_date) },
                { icon: '📍', label: 'Lugar', value: memorial.location || 'En el cielo' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center py-2.5 font-inter text-xs ${i < 4 ? 'border-b border-purple-50/50' : ''}`}
                >
                  <span className="text-[#9B8FB0] flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[#4A3F6B] font-semibold truncate max-w-[150px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-purple-100/50 shadow-lg grid grid-cols-2 gap-4 text-center">
              {[
                { icon: '🐾', value: huellitasCount.toLocaleString(), label: 'Huellitas' },
                { icon: '⭐', value: '256', label: 'Mensajes' },
                { icon: '🌈', value: '64', label: 'Galería' },
                { icon: '🩵', value: '13', label: 'Compartidos' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-[#EC6F9B] font-inter">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-[#9B8FB0] font-inter uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* TABS CONTAINER */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mt-4 flex-1">
        
        {/* Tab Headers */}
        <div className="flex border-b border-purple-100/60 overflow-x-auto gap-2 scrollbar-none">
          {[
            { id: 'sobre-mi', label: '🐾 Sobre mí' },
            { id: 'galeria', label: '📷 Galería' },
            { id: 'huellitas', label: `🐾 Huellitas (${huellitasCount})` },
            { id: 'mensajes', label: '💬 Mensajes (256)' },
            { id: 'compartidos', label: '🩵 Compartidos (13)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-6 font-inter text-sm font-semibold tracking-wide border-b-3 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#EC6F9B] text-[#EC6F9B]' 
                  : 'border-transparent text-[#9B8FB0] hover:text-[#4A3F6B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          
          {/* Card 1: Sobre mí */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-purple-100/50 shadow-md flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-[#EC6F9B] font-bold text-lg mb-4 flex items-center gap-2">
                <span>🩵</span>
                <span>Sobre mí</span>
              </h3>
              <p className="font-inter text-sm text-[#4A3F6B] leading-relaxed">
                {memorial.dedication || 'Siempre fue un miembro incondicional de la familia. Nos llenó de felicidad con sus travesuras, paseos y lealtad. Este espacio está dedicado a preservar su amor en el firmamento.'}
              </p>
            </div>
            
            {/* Ilustración de mascota durmiendo */}
            <div className="flex justify-center mt-6">
              <img 
                src="/images/placeholders/hero-illustration.svg" 
                alt="Pet Sleeping on Cloud" 
                className="h-28 object-contain opacity-80"
              />
            </div>
          </div>

          {/* Card 2: Galería */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-purple-100/50 shadow-md min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#EC6F9B] font-bold text-lg flex items-center gap-2">
                <span>🌈</span>
                <span>Galería de recuerdos</span>
              </h3>
              <span className="font-inter text-xs text-[#9B8FB0] cursor-pointer hover:text-[#4A3F6B]">
                Ver todas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm relative bg-[#F5E6D3] border border-white">
                  <img
                    src={memorial.photo_url}
                    alt="Gallery"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Mensajes */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-purple-100/50 shadow-md min-h-[300px] flex flex-col">
            <h3 className="text-[#EC6F9B] font-bold text-lg mb-4 flex items-center gap-2">
              <span>💬</span>
              <span>Mensajes de amor</span>
            </h3>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 max-h-[220px] custom-scrollbar">
              {[
                { author: 'María Fernanda', msg: 'Toby siempre será nuestro ángel peludo. Gracias por tanto amor. 🩵', date: '20 de abril de 2024' },
                { author: 'Alejandro G.', msg: 'Qué lindo recordar sus ojitos y su alegría. Dejó huellas profundas. 🐾', date: '19 de abril de 2024' },
                { author: 'Laura y Max', msg: 'Gracias por enseñarnos tanto. Siempre contigo en el corazón. 🌈', date: '18 de abril de 2024' },
              ].map((m, idx) => (
                <div key={idx} className="bg-white/50 border border-purple-50 rounded-2xl p-3 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1E2A78] font-inter">{m.author}</span>
                    <span className="text-[10px] text-[#9B8FB0] font-inter">{m.date}</span>
                  </div>
                  <p className="text-xs text-[#4A3F6B] font-inter leading-relaxed">
                    {m.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SHARE BAR */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-purple-100/50 shadow-lg grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8 items-center mb-12">
          <div>
            <h3 className="text-[#EC6F9B] font-bold text-lg mb-2">
              🩵 Comparte el recuerdo de {memorial.pet_name}
            </h3>
            <p className="font-inter text-xs text-[#7B6F9A] leading-relaxed">
              Mantén vivo su legado compartiendo su historia con familiares y amigos que también lo amaron.
            </p>
          </div>

          <div>
            <span className="block font-inter text-[10px] uppercase tracking-wider text-[#9B8FB0] mb-2 font-bold">
              Enlace de perfil público
            </span>
            <div className="flex items-center gap-2 bg-[#F5F0FF]/80 border border-purple-100 rounded-xl px-4 py-3">
              <span className="font-inter text-xs text-[#4A3F6B] flex-1 truncate select-all">
                todaslasmascotasvanalcielo.com/memorial/{slug}
              </span>
              <button
                onClick={() => handleShare('copy')}
                className="text-[#706A95] hover:text-[#EC6F9B] text-base transition-colors"
                title="Copiar enlace"
              >
                📋
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="block font-inter text-[10px] uppercase tracking-wider text-[#9B8FB0] mb-3 font-bold">
              Comparte en tus redes
            </span>
            <div className="flex gap-3">
              {[
                { icon: '💬', platform: 'whatsapp', bg: 'bg-[#25D366] hover:bg-[#20ba5a]' },
                { icon: '📸', platform: 'instagram', bg: 'bg-[#E1306C] hover:bg-[#c9265f]' },
                { icon: '🔗', platform: 'copy', bg: 'bg-[#7B5EA9] hover:bg-[#684d94]' },
              ].map(btn => (
                <button
                  key={btn.platform}
                  onClick={() => handleShare(btn.platform)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-transform hover:scale-105 active:scale-95 ${btn.bg} shadow-md`}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 px-6 border-t border-purple-100/50 bg-white/60 mt-auto">
        <p className="font-inter text-xs text-[#9B8FB0]">
          🐾 Ángeles en el Cielo · Porque el amor no se despide, se transforma en huellas eternas. 🩵
        </p>
      </footer>

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1.2) rotate(15deg);
          }
        }
        .animate-floatUp {
          animation: floatUp 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
