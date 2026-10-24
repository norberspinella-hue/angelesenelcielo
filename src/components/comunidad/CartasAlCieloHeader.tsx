'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PapelPicadoGarland } from '@/components/landing/PapelPicadoGarland';

interface CartasAlCieloHeaderProps {
  hasTopBanner?: boolean;
  showGarland?: boolean;
}

export function CartasAlCieloHeader({ 
  hasTopBanner = false,
  showGarland = true,
}: CartasAlCieloHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header 
      className={`heaven-header flex items-center justify-between px-4 sm:px-6 relative transition-all duration-300 ${
        hasTopBanner ? '!top-[62px] sm:!top-[72px] md:!top-[78px]' : ''
      }`}
    >
      {/* Guirnalda tradicional de Papel Picado en 'U' con la huella canina */}
      {showGarland && <PapelPicadoGarland />}

      {/* Brand: Logo heart + Ángeles en el Cielo (Idéntico a landing) */}
      <Link href="/" className="flex items-center gap-2 select-none relative z-20">
        <img 
          src="/images/icons/Logoheart.svg" 
          alt="Ángeles en el Cielo" 
          className="h-[52px] sm:h-[72px] md:h-[90px] -my-1 sm:-my-2 object-contain" 
        />
        <div className="flex flex-col font-serif text-[#1E2A78] text-sm sm:text-base md:text-xl font-bold leading-tight justify-center">
          <span>Ángeles en</span>
          <span>el Cielo</span>
        </div>
      </Link>

      {/* Desktop Navigation (Mismo diseño, tipografía y fuentes que Ángeles en el Cielo) */}
      <nav className="hidden md:flex items-center gap-5 lg:gap-8 whitespace-nowrap relative z-20">
        {/* 1. El Mural */}
        <Link href="/mural-global" className="heaven-nav-link text-sm">
          El Mural
        </Link>

        {/* 2. Cartas al Cielo */}
        <Link href="/comunidad" className="heaven-nav-link text-sm">
          Cartas al Cielo
        </Link>



        {/* 4. Desde el Corazón con el icono heart flotante encima */}
        <Link 
          href="/desde-el-corazon" 
          className="relative inline-flex flex-col items-center justify-center group heaven-nav-link text-sm"
          title="Desde el Corazón"
        >
          <img 
            src="/images/icons/plans/icon-plan-eterno.svg" 
            alt="Corazón Eterno" 
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[18px] h-[18px] object-contain filter drop-shadow-[0_2px_4px_rgba(201,169,97,0.50)] group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200 select-none pointer-events-none" 
          />
          <span>Desde el Corazón</span>
        </Link>

        {/* 5. Ángeles en el Cielo (Volver a la landing) */}
        <Link 
          href="/" 
          className="heaven-nav-link text-sm"
          title="Volver a Ángeles en el Cielo"
        >
          Ángeles en el Cielo
        </Link>
      </nav>

      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 rounded-full text-[#1E2A78] hover:bg-white/50 transition-colors focus:outline-none relative z-20"
        aria-label="Abrir menú"
      >
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-[24px] border border-white/80 shadow-[0_16px_40px_rgba(30,42,120,0.18)] p-6 flex flex-col gap-4 items-center md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 1. El Mural */}
          <Link 
            href="/mural-global" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            El Mural
          </Link>

          {/* 2. Cartas al Cielo */}
          <Link 
            href="/comunidad" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            Cartas al Cielo
          </Link>



          {/* 4. Desde el Corazón con el icono */}
          <Link 
            href="/desde-el-corazon" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1 inline-flex items-center gap-2 group"
          >
            <span>Desde el Corazón</span>
            <img 
              src="/images/icons/plans/icon-plan-eterno.svg" 
              alt="Corazón Eterno" 
              className="w-4 h-4 object-contain filter drop-shadow-[0_1px_3px_rgba(201,169,97,0.40)] group-hover:scale-110 transition-transform duration-200" 
            />
          </Link>

          {/* 5. Ángeles en el Cielo */}
          <Link 
            href="/" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            Ángeles en el Cielo
          </Link>
        </div>
      )}
    </header>
  );
}
