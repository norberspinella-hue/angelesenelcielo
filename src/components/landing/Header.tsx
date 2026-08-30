'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="heaven-header flex items-center justify-between px-4 sm:px-6 relative">
      <Link href="/" className="flex items-center gap-2 select-none">
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

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-7 lg:gap-8">
        <Link href="/#el-mural" className="heaven-nav-link text-sm">El Mural</Link>
        <Link href="/#como-funciona" className="heaven-nav-link text-sm">Cómo funciona</Link>
        <Link href="/#planes" className="heaven-nav-link text-sm">Opciones</Link>
        <Link href="/contacto" className="heaven-nav-link text-sm">Contacto</Link>
        <div className="relative inline-flex flex-col items-center justify-center cursor-default group" title="Tienda de recuerdos conmemorativos (Próximamente)">
          <span 
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8.5px] font-bold px-2 py-0.5 rounded-full text-white tracking-wider select-none inline-flex items-center gap-0.5 rotate-6 group-hover:rotate-2 transition-transform duration-200 z-10 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #E11D48 100%)',
              border: '1.2px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 2px 6px rgba(236, 72, 153, 0.40), inset 0 1px 1px rgba(255, 255, 255, 0.70)',
            }}
          >
            <span className="text-[8px] select-none">✨</span>
            <span>Muy pronto</span>
          </span>
          <span className="heaven-nav-link text-sm opacity-80 group-hover:opacity-100 transition-opacity">Tienda</span>
        </div>
      </nav>

      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 rounded-full text-[#1E2A78] hover:bg-white/50 transition-colors focus:outline-none"
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
          <Link 
            href="/#el-mural" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            El Mural
          </Link>
          <Link 
            href="/#como-funciona" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            Cómo funciona
          </Link>
          <Link 
            href="/#planes" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            Opciones
          </Link>
          <Link 
            href="/contacto" 
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1E2A78] font-bold text-base hover:text-[#7C3AED] transition-colors py-1"
          >
            Contacto
          </Link>
          
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 w-full justify-center">
            <span className="text-[#1E2A78]/80 font-bold text-base">Tienda</span>
            <span 
              className="text-[9px] font-bold px-2.5 py-0.5 rounded-full text-white tracking-wider select-none inline-flex items-center gap-1 rotate-3"
              style={{
                background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #E11D48 100%)',
                border: '1.2px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 6px rgba(236, 72, 153, 0.40)',
              }}
            >
              <span>✨</span>
              <span>Muy pronto</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
