'use client';

import { useRef, useState, useEffect } from 'react';
import { MuralCanvas, MuralCanvasRef } from '@/components/mural/MuralCanvas';
import { MuralControls } from '@/components/mural/MuralControls';
import { MuralDrawer } from '@/components/mural/MuralDrawer';
import Link from 'next/link';
import Image from 'next/image';
import { ParticlesBackground } from '@/components/mural/ParticlesBackground';
import { RecentAngelToast } from '@/components/mural/RecentAngelToast';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/plans';
import { buildWorld3DDeepLink } from '@/lib/world3d/contracts';
import type { WorldSpaceContextInfo } from '@/components/mural/drawer-steps/StepPlanAndSlot';


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
  const [worldSpaceContext, setWorldSpaceContext] = useState<WorldSpaceContextInfo | null>(null);
  const [worldSpaceError, setWorldSpaceError] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [claimResultBanner, setClaimResultBanner] = useState<{
    ok: boolean;
    text: string;
    spaceId?: string | null;
    memorialId?: string | null;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hasDeepLink = Boolean(
      params.get('memorialId') || params.get('highlight') || params.get('space_id') || params.get('claim_token')
    )
    const hasSeenWelcome = localStorage.getItem('mural-welcome-seen')
    if (!hasSeenWelcome && !hasDeepLink) {
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
  const [isFromAltar, setIsFromAltar] = useState(false)

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
    
    if (params.get('memorialId') || params.get('from') === 'altar') {
      setIsFromAltar(true)
    }
    const memorialIdParam = params.get('memorialId')
    const fromAltar = params.get('from') === 'altar'
    if (memorialIdParam) {
      setTimeout(async () => {
        await handleResultClick(memorialIdParam)
        if (!fromAltar) {
          canvasRef.current?.openMemorialCard(memorialIdParam)
        }
      }, 800)
    }

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

    const spaceIdParam = params.get('space_id')?.trim()
    const claimTokenParam = params.get('claim_token')?.trim()

    if (spaceIdParam && !claimTokenParam) {
      fetch(`/api/world-3d/spaces?space_id=${encodeURIComponent(spaceIdParam)}`)
        .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
        .then(({ ok, d }) => {
          if (!ok || !d?.space) {
            setWorldSpaceError('No pudimos encontrar el espacio 3D seleccionado.')
            return
          }
          if (d.space.status !== 'available') {
            setWorldSpaceError(
              `El espacio ${d.space.displayName} (${d.space.zone}) ya está reservado, ocupado o en revisión.`
            )
            return
          }
          setWorldSpaceContext({
            spaceId: d.space.spaceId,
            planId: d.space.planId,
            displayName: d.space.displayName,
            zone: d.space.zone,
            supportType: d.space.supportType,
          })
        })
        .catch(() => {
          setWorldSpaceError('No se pudo validar el espacio 3D seleccionado.')
        })
    }

    if (claimTokenParam) {
      fetch('/api/world-3d/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: claimTokenParam }),
      })
        .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d?.success) {
            setClaimResultBanner({
              ok: true,
              text: '¡Lugar 3D confirmado sin coste adicional! Tu homenaje pagado del Mural Global ya vive también en ese espacio.',
              spaceId: d.spaceId,
              memorialId: d.memorialId,
            })
          } else {
            const errMap: Record<string, string> = {
              TOKEN_EXPIRED: 'Este enlace temporal ha caducado. Solicita uno nuevo desde el lugar elegido.',
              TOKEN_ALREADY_USED: 'Este enlace ya fue utilizado anteriormente.',
              MEMORIAL_ALREADY_HAS_WORLD_SPACE: 'Tu homenaje del Mural ya tiene asignado su espacio 3D principal.',
              COMMUNITY_FREE_NO_3D_RIGHT: 'Los recuerdos gratuitos de Cartas al Cielo no incluyen plaza comercial 3D.',
              PLAN_MISMATCH: 'El plan de tu homenaje no coincide con el plan de ese lugar 3D.',
              SPACE_NOT_FREE: 'Otro ángel acaba de reservar u ocupar ese lugar 3D.',
            }
            setClaimResultBanner({
              ok: false,
              text: errMap[d?.error] || 'No pudimos confirmar el enlace temporal.',
            })
          }
        })
        .catch(() => {
          setClaimResultBanner({ ok: false, text: 'Error al validar tu enlace temporal.' })
        })
    }
  }, [])

  const handleRequestClaimLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!worldSpaceContext || !claimEmail.trim()) return
    setClaimSubmitting(true)
    setClaimFeedback(null)
    try {
      const res = await fetch('/api/world-3d/claim/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: worldSpaceContext.spaceId,
          email: claimEmail.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        setClaimFeedback({ ok: true, text: data.message })
      } else {
        setClaimFeedback({ ok: false, text: data?.message || 'No pudimos procesar la solicitud.' })
      }
    } catch {
      setClaimFeedback({ ok: false, text: 'Error de conexión al solicitar el enlace.' })
    } finally {
      setClaimSubmitting(false)
    }
  }

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
          {isFromAltar ? (
            <Link href="/cielo-lleno-de-luces" className="text-xs sm:text-sm font-bold text-[#8C3F71] hover:text-[#6D2F56] transition-colors flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1 rounded-full border border-[#F0BED6] shadow-xs">
              <span>←</span>
              <span className="hidden sm:inline">Volver al Altar</span>
              <span className="sm:hidden">Altar</span>
            </Link>
          ) : (
            <Link href="/" className="text-xs sm:text-sm font-semibold text-[#706A95] hover:text-[#1E2A78] transition-colors flex items-center gap-1">
              <span>←</span>
              <span className="hidden sm:inline">Volver a la landing</span>
              <span className="sm:hidden">Landing</span>
            </Link>
          )}
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
                      {pet.plan_type === 'recuerdo_eterno' || pet.plan_type === 'corazon_eterno' ? 'Corazón Eterno' : 
                       pet.plan_type === 'angelito_protector' ? 'Ángelito Protector' :
                       pet.plan_type === 'galaxia_amor' ? 'Galaxia de Amor' :
                       pet.plan_type === 'vinculo_infinito' ? 'Vínculo Infinito' :
                       pet.plan_type === 'estrella_anual' || pet.plan_type === 'estrella_brillante' ? 'Estrella Brillante' : 
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
        worldSpaceContext={worldSpaceContext}
      />

      {/* Banner flotante de integración Cielo 3D <-> Mural Global */}
      {(worldSpaceContext || worldSpaceError || claimResultBanner) && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-40 w-[min(580px,94vw)] pointer-events-auto">
          {claimResultBanner && (
            <div className={`mb-2 rounded-2xl p-4 shadow-xl border backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              claimResultBanner.ok
                ? 'bg-[#FFF9F2]/95 border-[#C9A961] text-[#1E2A78]'
                : 'bg-red-50/95 border-red-200 text-red-800'
            }`}>
              <p className="text-xs sm:text-sm font-semibold leading-snug">{claimResultBanner.text}</p>
              <div className="flex items-center gap-2 shrink-0">
                {claimResultBanner.ok && claimResultBanner.spaceId && (
                  <a
                    href={buildWorld3DDeepLink(
                      process.env.NEXT_PUBLIC_WORLD3D_URL || 'https://cielo3d-piloto-75-1.vercel.app/cielo3d/',
                      { memorialId: claimResultBanner.memorialId || undefined, spaceId: claimResultBanner.spaceId }
                    )}
                    className="px-3.5 py-1.5 rounded-full bg-[#1E2A78] text-white text-xs font-bold hover:opacity-90"
                  >
                    Ver en Mundo 3D →
                  </a>
                )}
                <button
                  onClick={() => setClaimResultBanner(null)}
                  className="text-xs font-bold px-2 py-1 rounded-full hover:bg-black/5"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {worldSpaceError && (
            <div className="mb-2 rounded-2xl p-3.5 bg-amber-50/95 border border-amber-300 text-amber-900 shadow-lg flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-semibold">{worldSpaceError}</p>
              <button onClick={() => setWorldSpaceError(null)} className="text-xs font-bold px-2">✕</button>
            </div>
          )}

          {worldSpaceContext && (
            <div className="rounded-2xl p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-2 border-[#C9A961] shadow-xl flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C3F71]">
                    Lugar 3D elegido · {PLANS[worldSpaceContext.planId].title}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#1E2A78]">
                    {worldSpaceContext.displayName} · <span className="font-normal text-[#706A95]">{worldSpaceContext.zone}</span>
                  </p>
                </div>
                <button
                  onClick={() => setWorldSpaceContext(null)}
                  className="text-xs text-[#706A95] hover:text-[#1E2A78] font-bold px-1.5"
                  title="Quitar selección 3D"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4E4670]">
                <span>Haz clic en un bloque libre del Mural Global para continuar con tu nueva compra, o:</span>
                <button
                  onClick={() => {
                    setClaimFeedback(null)
                    setShowClaimModal(true)
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#FFF6EE] border border-[#C9A961] text-[#541731] font-bold hover:bg-[#FDEEE0] transition-colors"
                >
                  Ya tengo un homenaje pagado — Reclamar con Magic Link
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de reclamación Magic Link para familias con homenaje pagado */}
      {showClaimModal && worldSpaceContext && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setShowClaimModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#C9A961]/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-[#1E2A78] font-serif">
                Vincular homenaje ya pagado
              </h3>
              <button onClick={() => setShowClaimModal(false)} className="text-gray-400 hover:text-gray-700 font-bold">
                ✕
              </button>
            </div>
            <p className="text-xs text-[#706A95] mb-4 leading-relaxed">
              Si ya tienes un homenaje pagado del plan <strong>{PLANS[worldSpaceContext.planId].title}</strong> en el Mural Global sin plaza 3D asignada, introduce tu correo para reclamar <strong>{worldSpaceContext.displayName}</strong> sin coste adicional.
            </p>
            <form onSubmit={handleRequestClaimLink} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A78] outline-none focus:border-[#C9A961]"
              />
              {claimFeedback && (
                <p className={`text-xs font-semibold p-3 rounded-xl ${claimFeedback.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {claimFeedback.text}
                </p>
              )}
              <button
                type="submit"
                disabled={claimSubmitting}
                className="btn-primary-heaven btn-drawer-cta w-full py-2.5 rounded-full text-sm font-bold disabled:opacity-50"
              >
                {claimSubmitting ? 'Enviando enlace...' : 'Enviar enlace temporal (Magic Link)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showWelcome && (
        <WelcomePopup onClose={handleCloseWelcome} />
      )}

      {/* Aviso Flotante Celestial de nuevos angelitos */}
      <RecentAngelToast onSelectPet={handleResultClick} />
    </main>
  );
}
