import Link from 'next/link';
import { HeavenCTAButton } from '@/components/ui/HeavenCTAButton';

export function HeroSection() {
  return (
    <section className="heaven-hero">
      <div className="heaven-hero-content grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Content */}
        <div className="text-left flex flex-col items-start">
          <div className="text-[#1E2A78] font-bold text-sm md:text-base tracking-widest mb-4">
            UN LUGAR EN EL CIELO PARA SIEMPRE 🩷
          </div>
          <h1 
            className="hero-title"
            style={{
              background: 'linear-gradient(to right, #1E2A78, #C8B8E8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Mural de Ángeles<br />en el Cielo
          </h1>
          <p className="heaven-hero-subtitle text-[#1E2A78] mt-6 text-xl md:text-2xl font-medium">
            1.000.000 de espacios para recordar, amar y honrar.
          </p>
          <p className="text-[#1E2A78] mt-4 opacity-90 leading-relaxed max-w-[500px]">
            Un mural interactivo en el cielo, donde cada angelito tiene su propio lugar eterno. Forma parte del mural de angelitos antes que se complete.
          </p>
          <div className="heaven-hero-actions mt-8 flex flex-wrap gap-4">
            <HeavenCTAButton href="/mural-global" className="py-3 px-6 text-base" />
            <Link href="/mural-global" className="btn-secondary-heaven !bg-[#EBD5D0] hover:!bg-[#D7BCB6] !text-[#1E2A78] !border-none">
              Explorar el mural
            </Link>
          </div>
        </div>
        
        {/* Right Column: Empty (Image contains the dog and frame) */}
        <div className="hidden md:block"></div>
      </div>
    </section>
  );
}
