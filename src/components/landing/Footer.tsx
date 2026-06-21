import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/40 mt-16 text-center">
      <div className="flex justify-center mb-8">
        <Image 
          src="/images/icons/Logo Ángeles en el Cielo.svg" 
          alt="Logo Ángeles en el Cielo" 
          width={240} 
          height={80} 
          className="object-contain"
        />
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 text-sm text-[#706A95]">
        <Link href="/aviso-legal" className="hover:text-[#6F5FA8]">Aviso Legal</Link>
        <Link href="/privacidad" className="hover:text-[#6F5FA8]">Privacidad</Link>
        <Link href="/cookies" className="hover:text-[#6F5FA8]">Cookies</Link>
        <Link href="/condiciones-contratacion" className="hover:text-[#6F5FA8]">Condiciones</Link>
      </div>
      
      <div className="mt-8 text-xs text-[#706A95]">
        © {new Date().getFullYear()} Ángeles en el Cielo. Todos los derechos reservados.
      </div>
    </footer>
  );
}
