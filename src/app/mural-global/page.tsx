'use client';

import { useRef, useState } from 'react';
import { MuralCanvas, MuralCanvasRef } from '@/components/mural/MuralCanvas';
import { MuralControls } from '@/components/mural/MuralControls';
import { MuralDrawer } from '@/components/mural/MuralDrawer';
import Link from 'next/link';
import Image from 'next/image';

import { ParticlesBackground } from '@/components/mural/ParticlesBackground';

export default function MuralGlobalPage() {
  const [selectedSlot, setSelectedSlot] = useState<{ col: number; row: number } | null>(null);
  const [slotData, setSlotData] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<MuralCanvasRef>(null);

  const handleSelectSlot = async (col: number, row: number) => {
    setSelectedSlot({ col, row });
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
    <main className="mural-page font-inter fixed inset-0 w-screen h-screen overflow-hidden">
      <ParticlesBackground />

      {/* The Interactive Canvas */}
      <div 
        className="mural-canvas-wrapper absolute z-0"
        style={{
          top: '90px',
          left: '360px',
          right: '20px', 
          bottom: '80px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(255, 245, 255, 0.20)',
          backdropFilter: 'blur(1px)',
          border: '1.5px solid rgba(255,255,255,0.55)',
          boxShadow: '0 8px 32px rgba(180,140,220,0.12)',
        }}
      >
        <MuralCanvas 
          ref={canvasRef}
          onSelectSlot={handleSelectSlot} 
          selectedSlot={selectedSlot}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Top Nav (Superior) */}
      <header 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[min(1180px,calc(100%-32px))] rounded-full border border-white/90 shadow-sm pointer-events-auto"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.75)'
        }}
      >
        <div className="flex items-center gap-4">
          <Image src="/images/icons/Logo Ángeles en el Cielo.svg" alt="Ángeles en el Cielo" width={175} height={50} className="h-10 w-auto object-contain" />
          <Link href="/angeles-en-el-cielo" className="text-sm font-semibold text-[#706A95] hover:text-[#1E2A78] transition-colors">
            ← Volver a la landing
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-[#706A95] text-sm font-semibold hover:text-[#1E2A78]">
            Pantalla completa
          </button>
          <button className="flex items-center gap-2 bg-[#E5C88A]/30 pl-1 pr-4 py-1 rounded-full text-[#1E2A78] font-bold hover:bg-[#E5C88A]/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
              U
            </div>
            <span className="text-sm">Norberto</span>
          </button>
        </div>
      </header>

      {/* Left UI overlay */}
      <div className="absolute top-24 left-4 md:left-8 z-40 flex flex-col gap-4 pointer-events-none w-[320px]">
        {/* Card superior izquierda */}
        <div 
          className="bg-white/90 backdrop-blur-md p-6 pb-20 rounded-3xl shadow-lg border border-white pointer-events-auto"
          style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🩷</span>
            <h1 className="font-playfair font-bold text-xl text-[#1E2A78]">Mural de Ángeles</h1>
          </div>
          <p className="text-[#706A95] text-sm mb-2 leading-relaxed">
            Un millón de ángeles de 4 patas, un solo cielo global.
          </p>
          <p className="text-[#1E2A78] text-xs mb-6 font-normal">
            Arrastra para moverte. Usa la rueda para acercarte y haz click en el trocito de cielo libre para reservarlo
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-inicial.svg" alt="Ocupados" width={32} height={32} />
                Ocupados
              </span>
              <span className="font-bold text-[#1E2A78]">50.000</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E2A78]" style={{ width: '5%' }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Libres" width={32} height={32} />
                Libres
              </span>
              <span className="font-bold text-[#C9A961]">950.000</span>
            </div>
            
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-[#706A95] flex items-center gap-2">
                <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Fundadores" width={32} height={32} />
                Ángeles fundadores
              </span>
              <span className="font-bold text-[#1E2A78]">48.210</span>
            </div>
            
            <p className="text-[#706A95] text-xs mt-4 leading-relaxed">
              Cada foto es una historia de amor que nunca se olvidará. Aquí quedará para siempre.
            </p>
          </div>
        </div>
      </div>

      {/* Buscador (Inferior Izquierda) */}
      <div className="absolute bottom-8 left-4 md:left-8 z-40 pointer-events-auto w-[320px]">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            🐾
          </div>
          <input 
            type="text" 
            placeholder="Buscar mascota..." 
            className="w-full bg-white/90 backdrop-blur-md border border-white shadow-lg rounded-full py-3 pl-12 pr-4 text-sm text-[#1E2A78] placeholder:text-[#706A95] outline-none focus:ring-2 focus:ring-[#C9A961]"
          />
        </div>
      </div>

      {/* Leyenda (Inferior Centro) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto hidden md:block">
        <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-md border border-white flex items-center gap-6 text-xs font-semibold text-[#706A95]">
          <div className="flex items-center gap-1.5"><span className="text-[#C9A961] text-sm">★</span> Libre</div>
          <div className="flex items-center gap-1.5"><span className="text-[#1E2A78] text-sm">🐾</span> Ocupado</div>
          <div className="flex items-center gap-1.5"><span className="text-[#D94F8B] text-sm">♥</span> En reserva</div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2 border-[#C9A961] bg-[#FBEF8A]"></div> Tu selección
          </div>
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
      />
    </main>
  );
}
