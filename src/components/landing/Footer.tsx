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
        <Link href="/terminos" className="hover:text-[#6F5FA8]">Términos</Link>
        <Link href="/cookies" className="hover:text-[#6F5FA8]">Cookies</Link>
      </div>
      
      <p style={{
        fontSize: 12,
        color: 'rgba(155,143,176,0.70)',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        marginTop: 16,
      }}>
        © 2026 Ángeles en el Cielo. 
        Todos los derechos reservados.
      </p>
    </footer>
  );
}
