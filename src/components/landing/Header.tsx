import Link from 'next/link';

export function Header() {
  return (
    <header className="heaven-header flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <img 
          src="/images/icons/Logoheart.svg" 
          alt="Ángeles en el Cielo" 
          className="h-[80px] sm:h-[100px] md:h-[112px] -my-2 md:-my-3 object-contain" 
        />
        <div className="flex flex-col font-serif text-[#1E2A78] text-base sm:text-xl font-bold leading-tight justify-center">
          <span>Ángeles en</span>
          <span>el Cielo</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-7 lg:gap-8">
        <Link href="#el-mural" className="heaven-nav-link text-sm">El Mural</Link>
        <Link href="#como-funciona" className="heaven-nav-link text-sm">Cómo funciona</Link>
        <Link href="#planes" className="heaven-nav-link text-sm">Opciones</Link>
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
    </header>
  );
}
