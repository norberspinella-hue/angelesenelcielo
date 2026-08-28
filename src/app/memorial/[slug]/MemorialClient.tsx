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
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(140,100,180,0.18)] border border-white flex flex-col items-center text-center transition-all animate-fadeIn">
          
          {/* FOTO CIRCULAR CON AUREOLA */}
          <div className="relative mb-6">
            {/* Halo dorado resplandeciente */}
            <div 
              className="absolute -inset-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(245,200,66,0.60) 0%, rgba(245,200,66,0.15) 60%, transparent 75%)',
                filter: 'blur(4px)',
              }}
            />

            {/* Círculo foto */}
            <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-[3.5px] border-amber-300/80 shadow-lg relative z-10 bg-purple-50">
              <img
                src={memorial.photo_url || '/images/placeholders/first.webp'}
                alt={memorial.pet_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Icono de aureola celestial */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl select-none z-20 drop-shadow-sm">
              😇
            </div>
          </div>

          {/* NOMBRE EN TIPOGRAFÍA CURSIVA PINYON SCRIPT */}
          <h1 
            className="text-5xl md:text-6xl text-[#EC6F9B] mb-2 font-normal"
            style={{ fontFamily: "'Pinyon Script', cursive" }}
          >
            {memorial.pet_name}
          </h1>

          {/* SUBTÍTULO: AÑOS Y RAZA */}
          <p className="text-xs md:text-sm text-[#7B6F9A] font-semibold mb-4 tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
            <span>✨</span>
            {yearsText && <span>{yearsText}</span>}
            {yearsText && (memorial.breed || memorial.species) && <span>·</span>}
            {memorial.breed && <span>{memorial.breed}</span>}
            {!memorial.breed && memorial.species && <span className="capitalize">{memorial.species}</span>}
            <span>✨</span>
          </p>

          {/* DEDICATORIA */}
          <div className="max-w-md mb-8">
            <blockquote 
              className="text-sm md:text-base text-[#4A3F6B] italic leading-relaxed font-serif"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              "{memorial.dedication || 'Siempre serás mi lugar favorito en el mundo y la luz que nunca se apagará.'}"
            </blockquote>
          </div>

          {/* BOTÓN CTA PRINCIPAL: VER EN EL MURAL */}
          <Link
            href={muralUrl}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#9333EA] via-[#C084FC] to-[#EC6F9B] text-white text-sm font-bold shadow-md hover:shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
          >
            <span>📍 Ver a {memorial.pet_name} en el Mural Global</span>
            <span>✨</span>
          </Link>

          {/* BOTONES SOCIALES SIMPLES */}
          <div className="pt-5 border-t border-purple-100/60 w-full flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#9B8FB0] uppercase tracking-wider mb-3">
              Compartir este recuerdo
            </span>
            <div className="flex gap-3 items-center justify-center">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                title="Compartir por WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.112.551 4.095 1.517 5.823l-1.611 5.885 6.046-1.586c1.667.909 3.57 1.428 5.594 1.428 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/></svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                title="Compartir por Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="px-3.5 py-1.5 rounded-full bg-purple-100 text-[#4A3F6B] text-xs font-semibold hover:bg-purple-200 transition-colors flex items-center gap-1.5"
                title="Copiar enlace"
              >
                <span>{copied ? '✓ ¡Copiado!' : '🔗 Copiar'}</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER DISCRETO */}
      <footer className="w-full text-center py-4 px-4 text-[11px] text-[#9B8FB0]">
        Mural de Ángeles en el Cielo · Recuerdos eternos con amor 🐾✨
      </footer>
    </div>
  )
}
