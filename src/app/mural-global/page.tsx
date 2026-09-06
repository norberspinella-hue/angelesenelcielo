'use client';

import { useRef, useState, useEffect } from 'react';
import { MuralCanvas, MuralCanvasRef } from '@/components/mural/MuralCanvas';
import { MuralControls } from '@/components/mural/MuralControls';
import { MuralDrawer } from '@/components/mural/MuralDrawer';
import Link from 'next/link';
import Image from 'next/image';
import { ParticlesBackground } from '@/components/mural/ParticlesBackground';
import { createClient } from '@/lib/supabase/client';


function WelcomePopup({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(40,20,80,0.55)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.5s ease',
    }}
    onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: 'min(750px, 90vw)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(100,70,150,0.30)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen del popup */}
        <img
          src="/images/mural/mural_de_angeles_popup.webp"
          alt="Bienvenido al Mural de Ángeles"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />

        {/* Botón cerrar X */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.85)',
            color: '#4A3F6B',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function MuralGlobalPage() {
  const [selectedSlot, setSelectedSlot] = useState<{ col: number; row: number } | null>(null);
  const [slotData, setSlotData] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<MuralCanvasRef>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFounderSlot, setIsFounderSlot] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('mural-welcome-seen')
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcome(true), 500)
    }
  }, [])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('mural-welcome-seen', 'true')
  }

  const [stats, setStats] = useState({
    occupied: 0,
    free: 1000000,
    founders: 0,
  })

  useEffect(() => {
    fetch('/api/mural/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching mural stats:', err))
  }, [])

  // Estados del buscador
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [highlightedMemorialId, setHighlightedMemorialId] = useState<string | null>(null)

  // Debounce e implementación robusta de búsqueda
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memorials')
        .select('id, pet_name, photo_url, profile_slug, plan_type')
        .ilike('pet_name', `%${searchQuery.trim()}%`)
        .eq('visibility', 'public')
        .limit(5)

      if (!error && data) {
        setSearchResults(data)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Al hacer clic en un resultado de búsqueda
  const handleResultClick = async (memorialId: string) => {
    const supabase = createClient()
    
    // Obtener las coordenadas del slot
    const { data: slots, error } = await supabase
      .from('mural_slots')
      .select('x, y')
      .eq('memorial_id', memorialId)
      .order('x', { ascending: true })
      .order('y', { ascending: true })
      .limit(1)

    if (slots && slots[0]) {
      const { x, y } = slots[0]
      // Centrar el mural en esas coordenadas llamando a la referencia expuesta con zoom suave
      canvasRef.current?.zoomToSlot(x, y)
      setHighlightedMemorialId(memorialId)
      setTimeout(() => setHighlightedMemorialId(null), 3000)
    }
    
    // Limpiar buscador y cerrar dropdown
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const highlight = params.get('highlight')
    const zoom = params.get('zoom')
    
    if (highlight && zoom) {
      const [x, y] = highlight.split(',').map(Number)
      setTimeout(() => {
        canvasRef.current?.zoomToSlot(x, y)
        const findAndHighlight = async () => {
          const supabase = createClient()
          const { data } = await (supabase
            .from('mural_slots') as any)
            .select('memorial_id')
            .eq('x', x)
            .eq('y', y)
            .single()
          if (data?.memorial_id) {
            setHighlightedMemorialId(data.memorial_id)
            setTimeout(() => setHighlightedMemorialId(null), 4000)
          }
        }
        findAndHighlight()
      }, 1000)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSelectSlot = async (slot: { col: number; row: number; isPremiumSlot: boolean }) => {
    const { col, row } = slot;
    setSelectedSlot({ col, row });
    setIsFounderSlot(slot.isPremiumSlot || false);
    setSlotData(null); 
    
    try {
      const res = await fetch(`/api/mural/slots?minCol=${col}&maxCol=${col}&minRow=${row}&maxRow=${row}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setSlotData(data.data[0]);
      } else {
        setSlotData(null);
      }
    } catch (e) {
      console.error(e);
      setSlotData(null);
    }
  };

  return (
    <main className="mural-page font-inter fixed inset-0 w-full h-[100dvh] overflow-hidden">

      {/* Canvas Wrapper (Full screen en móvil, adaptado en desktop) */}
      <div 
        className="mural-canvas-wrapper absolute z-0 rounded-2xl overflow-hidden top-[58px] sm:top-[70px] md:top-[90px] bottom-3 sm:bottom-4 md:bottom-[80px] left-2 sm:left-4 md:left-[412px] right-2 sm:right-4 md:right-[80px]"
        id="mural-container"
        style={{
          backdropFilter: 'blur(1px)',
          border: '3px solid #ffffff',
          boxShadow: `
            0 0 8px 2px rgba(242, 184, 210, 0.8),
            0 0 15px 4px rgba(216, 167, 208, 0.6),
            0 0 25px 8px rgba(200, 150, 190, 0.3)
          `,
        }}
      >
        <MuralCanvas 
          ref={canvasRef}
          onSelectSlot={handleSelectSlot} 
          selectedSlot={selectedSlot}
          onZoomChange={setZoomLevel}
          highlightedMemorialId={highlightedMemorialId}
        />
      </div>

      {/* Top Nav (Superior) */}
      <header 
        className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 sm:px-6 py-1.5 sm:py-1 w-[min(1180px,calc(100%-16px))] sm:w-[min(1180px,calc(100%-32px))] rounded-full border border-white/90 shadow-sm pointer-events-auto select-none"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.85)'
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Image src="/images/icons/Logoheart.svg" alt="Logo" width={40} height={40} className="h-8 sm:h-[56px] -my-1 sm:-my-3 w-auto object-contain" />
          <Link href="/" className="text-xs sm:text-sm font-semibold text-[#706A95] hover:text-[#1E2A78] transition-colors flex items-center gap-1">
            <span>←</span>
            <span className="hidden sm:inline">Volver a la landing</span>
            <span className="sm:hidden">Landing</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botón Info en móvil */}
          <button
            onClick={() => setShowMobileInfo(true)}
            className="md:hidden flex items-center gap-1 text-xs font-semibold text-[#7C3AED] bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200"
          >
            <span>ℹ️</span>
            <span>Info</span>
          </button>

          <button 
            onClick={toggleFullscreen}
            className="text-[#706A95] text-xs sm:text-sm font-semibold hover:text-[#1E2A78] whitespace-nowrap"
          >
            {isFullscreen ? 'Salir' : <span className="hidden sm:inline">Pantalla completa</span>}
            {!isFullscreen && <span className="sm:hidden">⛶ Full</span>}
          </button>
        </div>
      </header>

      {/* Left UI overlay — Desktop permanente */}
      <div className="hidden md:flex flex-col gap-4 pointer-events-none w-[380px] absolute top-24 left-8 z-40">
        {/* Card superior izquierda */}
        <div 
          className="bg-white/90 backdrop-blur-md p-6 pb-20 rounded-3xl shadow-lg border border-white pointer-events-auto"
          style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🩷</span>
            <h1 className="font-playfair font-bold text-[25px] text-[#1E2A78]">Mural de Ángeles</h1>
          </div>
          <p className="text-[#706A95] text-[17.5px] mb-2 leading-relaxed">
            Un millón de ángeles de 4 patas, un solo cielo.
          </p>
          <p className="text-[#1E2A78] text-[15px] mb-6 font-normal">
            Arrastra para moverte. Usa la rueda para acercarte y haz click en el trocito de cielo libre para reservarlo
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[17.5px]">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Ocupados" width={40} height={40} />
                Ocupados
              </span>
              <span className="font-bold text-[#1E2A78]">{stats.occupied.toLocaleString('es-ES')}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E2A78]" style={{ width: `${Math.min(100, Math.max(0.5, (stats.occupied / 1000000) * 100))}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center text-[17.5px] mt-2">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Libres" width={40} height={40} />
                Libres
              </span>
              <span className="font-bold text-[#C9A961]">{stats.free.toLocaleString('es-ES')}</span>
            </div>
            
            <div className="flex justify-between items-center text-[17.5px] mt-2">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Fundadores" width={40} height={40} />
                Ángeles fundadores
              </span>
              <span className="font-bold text-[#1E2A78]">{stats.founders.toLocaleString('es-ES')}</span>
            </div>
            
            <p className="text-[#706A95] text-[15px] mt-4 leading-relaxed">
              Cada foto es una historia de amor que nunca se olvidará. Aquí quedará para siempre.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL INFO PARA MÓVIL (Bottom Sheet desplegable) */}
      {showMobileInfo && (
        <div 
          className="md:hidden fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowMobileInfo(false)}
        >
          <div 
            className="w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-white/60 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button 
              onClick={() => setShowMobileInfo(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1E2A78] flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🩷</span>
              <h2 className="font-playfair font-bold text-xl text-[#1E2A78]">Mural de Ángeles</h2>
            </div>
            <p className="text-[#706A95] text-sm mb-2 leading-relaxed">
              Un millón de ángeles de 4 patas, un solo cielo.
            </p>
            <p className="text-[#1E2A78] text-xs mb-4 font-normal bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              🐾 Arrastra con el dedo para moverte. Pulsa en cualquier hueco libre para homenajear a tu mascota.
            </p>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#706A95] flex items-center gap-2">
                  <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Ocupados" width={28} height={28} />
                  Ocupados
                </span>
                <span className="font-bold text-[#1E2A78]">{stats.occupied.toLocaleString('es-ES')}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1E2A78]" style={{ width: `${Math.min(100, Math.max(0.5, (stats.occupied / 1000000) * 100))}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-[#706A95] flex items-center gap-2">
                  <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Libres" width={28} height={28} />
                  Libres
                </span>
                <span className="font-bold text-[#C9A961]">{stats.free.toLocaleString('es-ES')}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-[#706A95] flex items-center gap-2">
                  <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Fundadores" width={28} height={28} />
                  Ángeles fundadores
                </span>
                <span className="font-bold text-[#1E2A78]">{stats.founders.toLocaleString('es-ES')}</span>
              </div>
            </div>

            <button
              onClick={() => setShowMobileInfo(false)}
              className="w-full mt-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold text-xs shadow-md"
            >
              Explorar el Mural 🐾
            </button>
          </div>
        </div>
      )}

      {/* Buscador (Desktop e Inferior Móvil) */}
      <div className="absolute bottom-4 left-2.5 sm:bottom-8 sm:left-8 z-40 pointer-events-auto w-[calc(100%-70px)] sm:w-[320px] max-w-[320px]">
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 sm:left-4 flex items-center pointer-events-none text-xs sm:text-base">
            🐾
          </div>
          <input 
            type="text" 
            placeholder="Buscar mascota..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 backdrop-blur-md border border-white shadow-lg rounded-full py-2 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-xs sm:text-sm text-[#1E2A78] placeholder:text-[#706A95] outline-none focus:ring-2 focus:ring-[#C9A961]"
          />

          {/* Dropdown de resultados */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              borderRadius: 12,
              border: '1px solid rgba(180,150,220,0.30)',
              boxShadow: '0 8px 24px rgba(100,70,150,0.15)',
              zIndex: 50,
              maxHeight: 240,
              overflowY: 'auto',
              marginBottom: 8,
            }}>
              {searchResults.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => handleResultClick(pet.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  className="hover:bg-[rgba(245,240,255,0.80)]"
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#f5e8ff',
                    flexShrink: 0,
                  }}>
                    <img
                      src={pet.photo_url || '/images/placeholders/first.webp'}
                      alt={pet.pet_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700,
                      color: '#4A3F6B',
                      margin: 0,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {pet.pet_name}
                    </p>
                    <p style={{
                      color: '#9B8FB0',
                      margin: 0,
                      fontSize: 11,
                      fontFamily: 'sans-serif',
                      textTransform: 'capitalize',
                    }}>
                      {pet.plan_type === 'recuerdo_eterno' ? 'Corazón Eterno' : 
                       pet.plan_type === 'estrella_anual' ? 'Estrella Anual' : 
                       'Huellita'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Zoom Controls */}
      <MuralControls 
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onCenter={() => canvasRef.current?.centerPremium()}
        zoomLevel={zoomLevel}
      />

      <MuralDrawer 
        isOpen={selectedSlot !== null} 
        onClose={() => setSelectedSlot(null)}
        selectedSlot={selectedSlot}
        slotData={slotData}
        isFounderSlot={isFounderSlot}
      />

      {showWelcome && (
        <WelcomePopup onClose={handleCloseWelcome} />
      )}
    </main>
  );
}
