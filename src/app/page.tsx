import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { OfferStrip } from '@/components/landing/OfferStrip';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';
import { RainbowBridge } from '@/components/landing/RainbowBridge';
import { MuralPreview } from '@/components/landing/MuralPreview';
import { HeavenCTAButton } from '@/components/ui/HeavenCTAButton';
import { TrustStrip } from '@/components/landing/TrustStrip';

export default function AngelesEnElCieloLanding() {
  return (
    <>
      <Header />
      
      <main>
        <HeroSection />
        
        <div className="heaven-body">
          <OfferStrip />
          
          {/* Mini-mural preview section */}
          <section id="el-mural" className="pt-16 pb-0 text-center">
            <h2 className="section-title mb-4">Mural de Ángeles en el Cielo</h2>
            <p className="text-[#706A95] mb-8">Cada foto guarda una historia. Cada historia deja una huella.</p>
            <div className="mx-auto flex flex-col items-center w-full">
              <MuralPreview />
            </div>
          </section>

          {/* Sección Banner Ángeles Fundadores */}
          <section className="px-6 pt-12 pb-6">
            <a 
              href="/mural-global"
              className="block relative w-full max-w-[1200px] aspect-[3/1] mx-auto rounded-[24px] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <Image
                src="/images/icons/plans/angeles_fundadores_banner_1200x400.webp"
                alt="Ángeles Fundadores Banner"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-[1.02] transition-transform duration-500"
                priority
              />
            </a>
          </section>

          <ValueProposition />
          
          <PricingSection />
          <RainbowBridge />
          <Testimonials />
 
          {/* Final CTA */}
          <section className="final-heaven-cta relative overflow-hidden text-white rounded-[32px] mx-auto w-[min(1120px,calc(100%-32px))] mt-[80px] mb-[40px] px-[32px] py-[52px] text-center shadow-[0_26px_70px_rgba(111,95,168,0.24)]">
            {/* Imagen de fondo */}
            <Image
              src="/images/mural preview/mural-preview.webp"
              alt="Cielo y ángeles"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center right', zIndex: 0 }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="section-title mb-4 text-white !font-[500]">¿Quieres darle su lugar en el cielo?</h2>
              <p className="max-w-[500px] mx-auto mb-8 opacity-90 text-[#F5E6D3]">
                Porque el amor nunca se va, solo se transforma en luz.
              </p>
              <HeavenCTAButton href="/mural-global" className="py-3 px-6 text-base" />
            </div>
          </section>
 
          <TrustStrip />
        </div>
      </main>
 
      <Footer />
    </>
  );
}
