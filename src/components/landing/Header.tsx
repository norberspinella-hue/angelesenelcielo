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
        <div className="flex items-center gap-1.5 cursor-default group" title="Tienda de recuerdos conmemorativos (Próximamente)">
          <span className="heaven-nav-link text-sm opacity-75 group-hover:opacity-100 transition-opacity">Tienda</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-xs tracking-wide select-none">
            Pronto
          </span>
        </div>
      </nav>
    </header>
  );
}
