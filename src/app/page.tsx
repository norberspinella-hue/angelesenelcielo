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
            <h2 className="section-title">Mural de Ángeles en el Cielo</h2>
            <p className="text-[#706A95] mt-4 mb-8">Cada foto guarda una historia. Cada historia deja una huella.</p>
            <div className="mx-auto flex flex-col items-center w-full">
              <MuralPreview />
            </div>
          </section>

          {/* Sección Banner Ángeles Fundadores */}
          <section className="w-full pt-16 pb-6 text-center">
            <div className="mx-auto w-[min(1120px,calc(100%-32px))] mb-8">
              <h2 className="section-title">Se uno de los primeros 1000 Ángelitos en el Cielo</h2>
              <div className="text-[#706A95] space-y-1.5 text-sm md:text-base max-w-2xl mx-auto mt-4">
                <p>Tu peque siempre estará en el centro del mural, siempre será visible.</p>
                <p>Además recibirás el certificado de Ángelito Fundador.</p>
              </div>
            </div>

            <a 
              href="/mural-global"
              className="block relative w-[min(1120px,calc(100%-32px))] aspect-[3/1] mx-auto rounded-[24px] overflow-hidden shadow-sm"
            >
              <Image
                src="/images/icons/plans/angeles_fundadores_banner_1200x400.webp"
                alt="Ángeles Fundadores Banner"
                fill
                sizes="(max-width: 1120px) 100vw, 1120px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </a>

            <p className="font-semibold text-[#1E2A78] mt-6 text-sm md:text-base">
              Elige la opción de Corazón Eterno y el espacio en zona Ángeles Fundadores.
            </p>
          </section>

          {/* Nueva sección: Cómo funciona mural ángeles */}
          <section className="w-full pt-12 pb-6">
            <div className="relative w-[min(1120px,calc(100%-32px))] aspect-[3/1] mx-auto rounded-[24px] overflow-hidden shadow-sm">
              <Image
                src="/images/icons/plans/como_funciona_mural_angeles.webp"
                alt="Cómo funciona el mural de ángeles"
                fill
                sizes="(max-width: 1120px) 100vw, 1120px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
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
