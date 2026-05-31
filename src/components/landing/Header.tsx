import Link from 'next/link';

export function Header() {
  return (
    <header className="heaven-header flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <img 
          src="/images/icons/logoheart.svg" 
          alt="Ángeles en el Cielo" 
          className="h-[112px] -my-3" 
        />
        <div className="flex flex-col font-serif text-[#1E2A78] text-xl font-bold leading-tight justify-center">
          <span>Ángeles en</span>
          <span>el Cielo</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <Link href="#el-mural" className="heaven-nav-link text-sm">El Mural</Link>
        <Link href="#como-funciona" className="heaven-nav-link text-sm">Cómo funciona</Link>
        <Link href="#planes" className="heaven-nav-link text-sm">Opciones</Link>
      </nav>
    </header>
  );
}
