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
  const [slotCoords, setSlotCoords] = useState<{ x: number; y: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
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

    // Cargar coordenadas en el mural
    const { data: slot } = await supabase
      .from('mural_slots')
      .select('x, y')
      .eq('memorial_id', data.id)
      .order('x', { ascending: true })
      .order('y', { ascending: true })
      .limit(1)
      .single()

    if (slot) {
      setSlotCoords(slot as { x: number; y: number })
    }

    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.getFullYear()
  }

  const birthYear = memorial?.birth_date ? formatDate(memorial.birth_date) : null
  const deathYear = memorial?.death_date ? formatDate(memorial.death_date) : null

  const yearsText = birthYear && deathYear
    ? `${birthYear} – ${deathYear}`
    : deathYear
      ? `${deathYear}`
      : null

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = (platform: string) => {
    const text = `${memorial?.pet_name || 'Mi Ángel'} siempre estará en nuestros corazones 🐾✨\nVisita su recuerdo en el Mural de Ángeles:\n${shareUrl}`
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] font-sans text-2xl text-[#4A3F6B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#EC6F9B] border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse text-lg font-medium text-[#7B6F9A]">Cargando recuerdo... ✨</p>
        </div>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5e8ff] to-[#ffe8f0] text-center p-8 font-sans">
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="text-[#4A3F6B] text-2xl md:text-3xl font-bold mb-3">
          Este recuerdo no existe
        </h1>
        <p className="text-[#7B6F9A] text-sm max-w-md mb-6">
          El perfil que estás buscando no está disponible o está configurado como privado.
        </p>
        <Link href="/mural-global" className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff82ad] to-[#ec5f96] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105">
          Ir al Mural Global 🐾
        </Link>
      </div>
    )
  }

  const muralUrl = slotCoords
    ? `/mural-global?highlight=${slotCoords.x},${slotCoords.y}&zoom=true`
    : `/mural-global`

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center font-sans antialiased relative"
      style={{ 
        backgroundImage: 'url("/images/memorial/bg-memorial-heaven.webp")',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Google Font Pinyon Script */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" />

      {/* HEADER SIMPLE */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#4A3F6B] hover:opacity-80 transition-opacity">
          <Image src="/images/icons/Logoheart.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
          <span>Ángeles en el Cielo</span>
        </Link>
        <Link 
          href="/mural-global"
          className="text-xs font-bold text-[#EC6F9B] hover:text-[#C084FC] transition-colors flex items-center gap-1"
        >
          <span>Ver Mural Completo</span>
          <span>→</span>
        </Link>
      </header>

      {/* CONTENEDOR PRINCIPAL CENTRADO */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white/75 backdrop-blur-md rounded-[36px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(140,100,180,0.20)] border border-white/90 flex flex-col items-center text-center transition-all animate-fadeIn relative">
          
          {/* 1. TOP PILL BADGE: Mi angelito */}
          <div className="mb-4 inline-flex items-center justify-center px-4 py-1 rounded-full bg-[#FEF3C7]/80 border border-[#F5C842]/40 shadow-xs">
            <span className="text-xs font-bold text-[#854D0E] tracking-wide">
              Mi angelito
            </span>
          </div>

          {/* 2. MEDALLÓN CELESTIAL DE LA FOTO */}
          <div className="relative mb-3 flex items-center justify-center">
            
            {/* Mariposas decorativas mágicas */}
            <div className="absolute -top-3 -left-7 w-9 h-9 pointer-events-none opacity-85 select-none">
              <img src="/images/icons/butterfly1.svg" alt="Butterfly" className="w-full h-full object-contain -rotate-12" />
            </div>
            <div className="absolute top-1/2 -right-7 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-80 select-none">
              <img src="/images/icons/butterfly2.svg" alt="Butterfly" className="w-full h-full object-contain rotate-12" />
            </div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 pointer-events-none opacity-75 select-none">
              <img src="/images/icons/butterfly2.svg" alt="Butterfly" className="w-full h-full object-contain rotate-45" />
            </div>
            <div className="absolute -bottom-1 -right-6 w-6 h-6 pointer-events-none opacity-70 select-none">
              <img src="/images/icons/butterfly1.svg" alt="Butterfly" className="w-full h-full object-contain -rotate-12" />
            </div>

            {/* HALO CELESTIAL EXACTO DE PETPROFILECARD */}
            <div 
              style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '135px',
                height: '38px',
                zIndex: 25,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 220 70" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <filter id="memorialHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="memorialHaloGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFA000" stopOpacity="1.0" />
                    <stop offset="20%" stopColor="#FFD54F" stopOpacity="1.0" />
                    <stop offset="50%" stopColor="#FFF9C4" stopOpacity="1.0" />
                    <stop offset="80%" stopColor="#FFD54F" stopOpacity="1.0" />
                    <stop offset="100%" stopColor="#FFA000" stopOpacity="1.0" />
                  </linearGradient>
                </defs>
                {/* 1. Aura difusa dorada exterior */}
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFD54F" strokeWidth="8" opacity="0.85" filter="url(#memorialHaloGlow)" />
                {/* 2. Cuerpo del anillo dorado */}
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="url(#memorialHaloGold)" strokeWidth="4.2" opacity="1.0" filter="drop-shadow(0 0 5px #FFD54F)" />
                {/* 3. Filamento blanco puro en el núcleo */}
                <ellipse cx="110" cy="35" rx="95" ry="24" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.98" filter="drop-shadow(0 0 3px #FFFFFF)" />
              </svg>
            </div>

            {/* AURA RESPLANDECIENTE SUAVE */}
            <div 
              className="absolute -inset-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(245,200,66,0.40) 0%, rgba(216,180,254,0.25) 55%, transparent 75%)',
                filter: 'blur(6px)',
              }}
            />

            {/* CÍRCULO FOTO CON BORDE DORADO SATINADO */}
            <div className="w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden border-[3.5px] border-[#D4AF37] shadow-[0_8px_25px_rgba(180,140,80,0.25)] relative z-10 bg-purple-50">
              <img
                src={memorial.photo_url || '/images/placeholders/first.webp'}
                alt={memorial.pet_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 3. NOMBRE EN TIPOGRAFÍA CURSIVA CON DEGRADADO PÚRPURA/ROSA */}
          <h1 
            className="text-6xl md:text-7xl mb-1 font-normal select-none"
            style={{ 
              fontFamily: "'Pinyon Script', cursive",
              background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.12))',
            }}
          >
            {memorial.pet_name}
          </h1>

          {/* MICRODIVISOR CON CORAZÓN */}
          <div className="flex items-center justify-center gap-2 mb-3 w-28 opacity-60">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-pink-400"></div>
            <span className="text-xs text-pink-400 select-none">🩷</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-pink-400"></div>
          </div>

          {/* 4. METADATOS: AÑOS Y RAZA */}
          <p className="text-xs sm:text-sm text-[#7E6B8F] font-semibold mb-3 tracking-wide flex items-center justify-center gap-2 flex-wrap">
            <span className="text-amber-400">✨</span>
            {yearsText && <span>{yearsText}</span>}
            {yearsText && (memorial.breed || memorial.species) && <span>·</span>}
            {memorial.breed && <span>{memorial.breed}</span>}
            {!memorial.breed && memorial.species && <span className="capitalize">{memorial.species}</span>}
            <span className="text-amber-400">✨</span>
          </p>

          {/* 5. DEDICATORIA EN CURSIVA SERIF */}
          <div className="max-w-sm mb-2">
            <blockquote 
              className="text-sm md:text-base text-[#4A3F6B] italic leading-relaxed font-serif"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              “{memorial.dedication || 'Siempre serás mi lugar favorito en el mundo.'}”
            </blockquote>
          </div>

          {/* AFIRMACIÓN CELESTIAL */}
          <p className="text-xs text-[#A16207] font-medium mb-5 flex items-center justify-center gap-1.5">
            <span>✨</span>
            <span>Su luz ya forma parte del Mural de Ángeles.</span>
            <span>✨</span>
          </p>

          {/* 6. BOTÓN CTA PRINCIPAL RESPLANDECIENTE */}
          <Link
            href={muralUrl}
            className="w-full px-6 py-3.5 rounded-full text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mb-5 select-none"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 8px 24px rgba(168, 85, 247, 0.38)',
              border: '1px solid rgba(255, 255, 255, 0.40)',
            }}
          >
            <span>✨</span>
            <span>Ver a {memorial.pet_name} en el Mural de Ángeles</span>
            <span className="text-base font-normal opacity-90">›</span>
          </Link>

          {/* 7. DIVISOR ELEGANTE CON CORAZÓN */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-4 opacity-50">
            <div className="h-[1px] flex-1 bg-purple-300"></div>
            <span className="text-xs text-purple-400 select-none">🤍</span>
            <div className="h-[1px] flex-1 bg-purple-300"></div>
          </div>

          {/* 8. BOTONES DE COMPARTIR (CÁPSULAS) */}
          <div className="w-full flex flex-col items-center mb-5">
            <span className="text-xs font-bold text-[#6B5B7B] tracking-wide mb-3">
              Compartir este recuerdo
            </span>
            <div className="flex flex-wrap gap-2 items-center justify-center w-full">
              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex-1 min-w-[95px] max-w-[120px] py-2 px-3 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all"
                title="Compartir por WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.112.551 4.095 1.517 5.823l-1.611 5.885 6.046-1.586c1.667.909 3.57 1.428 5.594 1.428 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="flex-1 min-w-[95px] max-w-[120px] py-2 px-3 rounded-full bg-[#3B82F6] hover:bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all"
                title="Compartir por Facebook"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              {/* Copiar Enlace */}
              <button
                onClick={() => handleShare('copy')}
                className="flex-1 min-w-[105px] max-w-[130px] py-2 px-3 rounded-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#7C3AED] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all"
                title="Copiar enlace"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{copied ? '✓ ¡Copiado!' : 'Copiar enlace'}</span>
              </button>
            </div>
          </div>

          {/* 9. NOTA DE DESPEDIDA / PIE DE TARJETA */}
          <p className="text-[11px] sm:text-xs text-[#9E8FA9] italic flex items-center justify-center gap-1.5 opacity-90 select-none">
            <span>🪶</span>
            <span>Siempre serás mi lugar favorito en el mundo</span>
            <span>🪶</span>
          </p>

        </div>
      </main>

      {/* FOOTER DISCRETO */}
      <footer className="w-full text-center py-4 px-4 text-[11px] text-[#9B8FB0]">
        Mural de Ángeles en el Cielo · Recuerdos eternos con amor 🐾✨
      </footer>
    </div>
  )
}
