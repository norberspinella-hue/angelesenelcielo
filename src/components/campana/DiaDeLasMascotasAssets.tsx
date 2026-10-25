'use client';

import React from 'react';

// 1. Tag Ribbon "27 de octubre · Día de las mascotas" recreado fielmente a partir de la referencia original
export function RibbonTag({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block w-full max-w-[460px] select-none ${className}`}>
      <picture>
        <source srcSet="/images/campanas/lazo-27-octubre-hero.webp" type="image/webp" />
        <img
          src="/images/campanas/lazo-27-octubre-hero.png"
          alt="27 de octubre · Día de las mascotas"
          width="840"
          height="120"
          className="w-full h-auto drop-shadow-[0_4px_14px_rgba(217,119,6,0.30)] object-contain"
          loading="eager"
        />
      </picture>
    </div>
  );
}

// 2. Picado tradicional en la esquina superior derecha
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
          <filter id="corner-shadow-picado" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#3B0764" floodOpacity="0.3" />
          </filter>
        </defs>

        <path 
          d="M 40 0 Q 140 100 250 160" 
          stroke="#78350F" 
          strokeWidth="1.8" 
          strokeDasharray="3 2" 
          opacity="0.6" 
        />

        <g transform="translate(60, 22) rotate(32)" filter="url(#corner-shadow-picado)">
          <path d="M 0 0 L 38 0 L 34 50 L 19 44 L 4 50 Z" fill="#F97316" />
          <circle cx="19" cy="22" r="6" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="14" cy="12" rx="2" ry="3.5" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="24" cy="12" rx="2" ry="3.5" fill="#FFF8F4" opacity="0.9" />
          <circle cx="6" cy="6" r="1.5" fill="#FFF8F4" opacity="0.8" />
          <circle cx="32" cy="6" r="1.5" fill="#FFF8F4" opacity="0.8" />
        </g>

        <g transform="translate(115, 62) rotate(42)" filter="url(#corner-shadow-picado)">
          <path d="M 0 0 L 36 0 L 32 48 L 18 42 L 4 48 Z" fill="#9333EA" />
          <circle cx="18" cy="20" r="4.5" fill="#FFF8F4" opacity="0.9" />
          <circle cx="18" cy="11" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="18" cy="29" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="9" cy="20" r="2" fill="#FFF8F4" opacity="0.9" />
          <circle cx="27" cy="20" r="2" fill="#FFF8F4" opacity="0.9" />
        </g>

        <g transform="translate(168, 110) rotate(52)" filter="url(#corner-shadow-picado)">
          <path d="M 0 0 L 38 0 L 34 50 L 19 44 L 4 50 Z" fill="#EC4899" />
          <path d="M 19 28 C 19 28 11 20 11 15 C 11 11 15 9 19 13 C 23 9 27 11 27 15 C 27 20 19 28 19 28 Z" fill="#FFF8F4" opacity="0.9" />
          <circle cx="6" cy="8" r="1.5" fill="#FFF8F4" opacity="0.8" />
          <circle cx="32" cy="8" r="1.5" fill="#FFF8F4" opacity="0.8" />
        </g>

        <g transform="translate(212, 168) rotate(60)" filter="url(#corner-shadow-picado)">
          <path d="M 0 0 L 34 0 L 30 46 L 17 40 L 4 46 Z" fill="#FBBF24" />
          <circle cx="17" cy="18" r="5" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="12" cy="10" rx="1.8" ry="3" fill="#FFF8F4" opacity="0.9" />
          <ellipse cx="22" cy="10" rx="1.8" ry="3" fill="#FFF8F4" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

// 3. SVG Claqueta / Cámara idéntico a media_1792932657797_c38fcd0b.png
export function ClapperCameraIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 54 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Barra superior de claqueta abierta con rayas diagonales blancas */}
      <g>
        <path d="M 6 13 L 44 6 L 47 14 L 9 21 Z" fill="#E28925" />
        <path d="M 14 12 L 18 11 L 16 19 L 12 20 Z" fill="#FFFFFF" />
        <path d="M 23 10 L 27 9 L 25 18 L 21 18 Z" fill="#FFFFFF" />
        <path d="M 32 9 L 36 8 L 34 16 L 30 17 Z" fill="#FFFFFF" />
        <path d="M 41 7 L 44 6.5 L 43 15 L 40 15 Z" fill="#FFFFFF" />
      </g>
      
      {/* Cuerpo inferior rectangular de la claqueta */}
      <rect 
        x="6" 
        y="18" 
        width="40" 
        height="24" 
        rx="4" 
        fill="#FFF7ED" 
        stroke="#E28925" 
        strokeWidth="2"
      />

      {/* Pantalla interior con botón de play */}
      <rect x="12" y="22" width="28" height="16" rx="2" fill="#FED7AA" opacity="0.7" />
      <path d="M 23 26 L 31 30 L 23 34 Z" fill="#FFFFFF" />
    </svg>
  );
}

// 4. Lápiz dibujado idéntico a media_1792932799961_656eacdb.png
export function PencilIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Borrador superior redondeado */}
      <path 
        d="M 24 6 C 26 4 28 4 30 6 C 32 8 32 10 30 12 L 27 15 L 21 9 L 24 6 Z" 
        stroke="#C45A77" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Línea divisoria del borrador */}
      <line x1="23" y1="11" x2="27" y2="7" stroke="#C45A77" strokeWidth="2" />

      {/* Cuerpo principal del lápiz */}
      <line x1="21" y1="9" x2="11" y2="19" stroke="#C45A77" strokeWidth="2" />
      <line x1="27" y1="15" x2="17" y2="25" stroke="#C45A77" strokeWidth="2" />

      {/* Punta de madera y mina de grafito */}
      <path d="M 11 19 L 17 25 L 8 28 Z" stroke="#C45A77" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 8 28 L 11 25" stroke="#C45A77" strokeWidth="2" />
      <polygon points="8,28 10,26 12,27" fill="#C45A77" />

      {/* Línea horizontal en la base como en el mockup */}
      <line x1="4" y1="31" x2="22" y2="31" stroke="#C45A77" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 5. Ícono de compartir idéntico al mockup (tres nodos conectados)
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

// 6. Recuadro de papel vintage para "27 OCT. Día de las mascotas" idéntico a la imagen
export function PostcardPaperTag() {
  return (
    <div className="bg-[#FFFDF9] border border-[#E7D6C6] rounded-xl px-3 py-2 shadow-sm text-center select-none flex flex-col items-center leading-tight">
      <div className="text-[10px] text-[#C45A77] tracking-widest font-serif leading-none mb-0.5">
        ∿∿∿
      </div>
      <span 
        className="text-[12px] font-bold text-[#6B1D34] tracking-wide block"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        27 OCT.
      </span>
      <span className="text-[10px] font-serif italic text-[#78350F] block">
        Día de las
      </span>
      <span className="text-[10px] font-serif text-[#78350F] block mb-1">
        mascotas
      </span>
      <span className="text-sm text-[#E28925]">🐾</span>
    </div>
  );
}
