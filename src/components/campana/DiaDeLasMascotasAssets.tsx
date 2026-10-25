'use client';

import React from 'react';

// 1. Tag Ribbon "27 de octubre · Día de las mascotas" idéntico al mockup
export function RibbonTag({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg 
        viewBox="0 0 420 54" 
        className="w-full h-auto drop-shadow-[0_4px_10px_rgba(217,119,6,0.25)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ribbon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="fold-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="fold-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* Cola izquierda con corte de golondrina */}
        <path d="M 30 10 L 0 25 L 30 40 L 45 35 L 45 15 Z" fill="#D97706" />
        <path d="M 45 35 L 35 48 L 45 42 Z" fill="url(#fold-left)" />

        {/* Cola derecha con corte de golondrina */}
        <path d="M 390 10 L 420 25 L 390 40 L 375 35 L 375 15 Z" fill="#D97706" />
        <path d="M 375 35 L 385 48 L 375 42 Z" fill="url(#fold-right)" />

        {/* Cuerpo principal curvado de la cinta */}
        <path 
          d="M 35 6 Q 210 16 385 6 C 390 6 392 10 390 16 L 382 42 C 380 46 376 48 370 48 Q 210 40 50 48 C 44 48 40 46 38 42 L 30 16 C 28 10 30 6 35 6 Z" 
          fill="url(#ribbon-gradient)" 
        />
        {/* Borde sutil superior con brillo */}
        <path 
          d="M 36 8 Q 210 17 384 8" 
          stroke="#FEF3C7" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          opacity="0.8" 
        />
      </svg>

      {/* Contenido tipográfico y huellitas */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 px-6 pt-1 text-white font-extrabold text-[12px] sm:text-[13px] md:text-sm tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.50)]">
        <span className="text-white text-xs sm:text-sm drop-shadow-sm">🐾</span>
        <span>27 de octubre · Día de las mascotas</span>
        <span className="text-white text-xs sm:text-sm drop-shadow-sm">🐾</span>
      </div>
    </div>
  );
}

// 2. Picado en la esquina superior derecha (de borde superior a borde lateral derecho)
export function CornerPapelPicado({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute top-0 right-0 w-36 sm:w-56 md:w-72 h-36 sm:h-56 md:h-72 pointer-events-none z-30 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 250 250" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="corner-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#3B0764" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Cuerda diagonal combada */}
        <path 
          d="M 40 0 Q 140 100 250 160" 
          stroke="#78350F" 
          strokeWidth="1.8" 
          strokeDasharray="3 2" 
          opacity="0.6" 
        />

        {/* Banderín 1: Naranja con huella canina */}
        <g transform="translate(60, 22) rotate(32)" filter="url(#corner-shadow)">
          <path d="M 0 0 L 38 0 L 34 50 L 19 44 L 4 50 Z" fill="#F97316" />
          {/* Calados decorativos */}
          <circle cx="19" cy="22" r="6" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="14" cy="12" rx="2" ry="3.5" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="24" cy="12" rx="2" ry="3.5" fill="#FFF8F4" opacity="0.9" />
          <circle cx="6" cy="6" r="1.5" fill="#FFF8F4" opacity="0.8" />
          <circle cx="32" cy="6" r="1.5" fill="#FFF8F4" opacity="0.8" />
        </g>

        {/* Banderín 2: Morado/Violeta con rosetón */}
        <g transform="translate(115, 62) rotate(42)" filter="url(#corner-shadow)">
          <path d="M 0 0 L 36 0 L 32 48 L 18 42 L 4 48 Z" fill="#9333EA" />
          {/* Rosetón calado */}
          <circle cx="18" cy="20" r="4.5" fill="#FFF8F4" opacity="0.9" />
          <circle cx="18" cy="11" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="18" cy="29" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="9" cy="20" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="27" cy="20" r="2" fill="#FFF8F4" opacity="0.9" />
        </g>

        {/* Banderín 3: Fucsia / Rosa con corazón */}
        <g transform="translate(168, 110) rotate(52)" filter="url(#corner-shadow)">
          <path d="M 0 0 L 38 0 L 34 50 L 19 44 L 4 50 Z" fill="#EC4899" />
          {/* Corazón calado */}
          <path d="M 19 28 C 19 28 11 20 11 15 C 11 11 15 9 19 13 C 23 9 27 11 27 15 C 27 20 19 28 19 28 Z" fill="#FFF8F4" opacity="0.9" />
          <circle cx="6" cy="8" r="1.5" fill="#FFF8F4" opacity="0.8" />
          <circle cx="32" cy="8" r="1.5" fill="#FFF8F4" opacity="0.8" />
        </g>

        {/* Banderín 4: Amarillo Cempasúchil */}
        <g transform="translate(212, 168) rotate(60)" filter="url(#corner-shadow)">
          <path d="M 0 0 L 34 0 L 30 46 L 17 40 L 4 46 Z" fill="#FBBF24" />
          <circle cx="17" cy="18" r="5" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="12" cy="10" rx="1.8" ry="3" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="22" cy="10" rx="1.8" ry="3" fill="#FFF8F4" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

// 3. SVG Claqueta / Cámara idéntico al mockup para "Película de Chloe"
export function ClapperCameraIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="clapper-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      {/* Barra superior de claqueta abierta */}
      <path 
        d="M 6 12 L 40 8 L 42 16 L 8 20 Z" 
        fill="#7A1B38" 
        rx="2"
      />
      {/* Rayas de claqueta */}
      <path d="M 12 11 L 16 10 L 14 19 L 10 19 Z" fill="#FFFDF5" />
      <path d="M 22 10 L 26 9 L 24 18 L 20 18 Z" fill="#FFFDF5" />
      <path d="M 32 9 L 36 8 L 34 17 L 30 17 Z" fill="#FFFDF5" />
      
      {/* Cuerpo inferior de la claqueta */}
      <rect 
        x="6" 
        y="18" 
        width="36" 
        height="24" 
        rx="4" 
        fill="url(#clapper-body)" 
        stroke="#7A1B38" 
        strokeWidth="1.5"
      />
      {/* Pantalla interior con botón de play */}
      <rect x="10" y="22" width="28" height="16" rx="2" fill="#7A1B38" opacity="0.15" />
      <path d="M 22 26 L 30 30 L 22 34 Z" fill="#7A1B38" />
    </svg>
  );
}

// 4. Lápiz dibujado idéntico al mockup para "Comparte su recuerdo"
export function PencilIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M 18.5 2.5 C 19.3 1.7 20.7 1.7 21.5 2.5 C 22.3 3.3 22.3 4.7 21.5 5.5 L 8.5 18.5 L 2 22 L 5.5 15.5 L 18.5 2.5 Z" 
        stroke="#C45A77" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 15 6 L 18 9" 
        stroke="#C45A77" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

// 5. Ícono de compartir idéntico al mockup (tres círculos conectados)
export function ShareNodeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="5" r="3" stroke="#C45A77" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="#C45A77" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="#C45A77" strokeWidth="2" />
      <line x1="8.6" y1="10.7" x2="15.4" y2="6.3" stroke="#C45A77" strokeWidth="2" strokeLinecap="round" />
      <line x1="8.6" y1="13.3" x2="15.4" y2="17.7" stroke="#C45A77" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 6. Sello / Tag vintage para la tarjeta postal ("27 OCT. Día de las mascotas")
export function PostcardStamp() {
  return (
    <div className="bg-[#FFFDF7] border border-[#E5D5C5] rounded-xl px-2.5 py-1.5 shadow-sm text-center select-none flex flex-col items-center leading-tight">
      <div className="text-[10px] text-[#C45A77] tracking-widest font-serif leading-none mb-0.5">
        ∿∿∿
      </div>
      <span className="text-[11px] font-bold text-[#6B1D34] tracking-wide block">
        27 OCT.
      </span>
      <span className="text-[9.5px] font-serif italic text-[#78350F] block">
        Día de las
      </span>
      <span className="text-[9.5px] font-serif text-[#78350F] block mb-1">
        mascotas
      </span>
      <span className="text-xs text-[#EA580C]">🐾</span>
    </div>
  );
}
