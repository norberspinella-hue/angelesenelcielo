import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/40 mt-16 text-center">
      <div className="flex justify-center mb-6">
        <Image 
          src="/images/icons/Logo Ángeles en el Cielo.svg" 
          alt="Logo Ángeles en el Cielo" 
          width={240} 
          height={80} 
          className="object-contain"
        />
      </div>

      {/* Redes Sociales Oficiales */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-8 px-4">
        <a
          href="https://www.instagram.com/angeles_en_el_cielo_/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#4A3F6B] hover:text-[#E1306C] border border-[#F3DCE7] shadow-sm hover:shadow transition-all text-xs font-semibold"
          title="Síguenos en Instagram"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Instagram</span>
        </a>

        <a
          href="https://www.tiktok.com/@angeles_en_elcielo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#4A3F6B] hover:text-black border border-[#F3DCE7] shadow-sm hover:shadow transition-all text-xs font-semibold"
          title="Síguenos en TikTok"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span>TikTok</span>
        </a>

                <a
          href="https://wa.me/34610319143?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20memorial%20de%20%C3%81ngeles%20en%20el%20Cielo%20%F0%9F%90%BE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#4A3F6B] hover:text-[#25D366] border border-[#F3DCE7] shadow-sm hover:shadow transition-all text-xs font-semibold"
          title="Atención por WhatsApp (+34 610 31 91 43)"
        >
          <svg className="w-4 h-4 fill-current shrink-0 text-[#25D366]" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>WhatsApp (+34 610 31 91 43)</span>
        </a>

<a
          href="https://www.facebook.com/profile.php?id=61595498662151"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#4A3F6B] hover:text-[#1877F2] border border-[#F3DCE7] shadow-sm hover:shadow transition-all text-xs font-semibold"
          title="Síguenos en Facebook"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </a>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 text-sm text-[#706A95]">
        <Link href="/desde-el-corazon" className="hover:text-[#6F5FA8]">Desde el Corazón</Link>
        <Link href="/contacto" className="hover:text-[#6F5FA8]">Contacto</Link>
        <Link href="/compromisos" className="hover:text-[#6F5FA8]">Compromisos</Link>
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
