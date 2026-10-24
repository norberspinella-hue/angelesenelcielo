'use client';

import { useState } from 'react';
import Image from 'next/image';
import { OctubreBanner } from '@/components/landing/OctubreBanner';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { OfferStrip } from '@/components/landing/OfferStrip';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { PricingSection } from '@/components/landing/PricingSection';
import { CorazonesDeAngelSection } from '@/components/landing/CorazonesDeAngelSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';
import { RainbowBridge } from '@/components/landing/RainbowBridge';
import { MuralPreview } from '@/components/landing/MuralPreview';
import { HeavenCTAButton } from '@/components/ui/HeavenCTAButton';
import { TrustStrip } from '@/components/landing/TrustStrip';

export default function AngelesEnElCieloLanding() {
  const [hasTopBanner, setHasTopBanner] = useState(false);

  return (
    <>
      <OctubreBanner onVisibilityChange={setHasTopBanner} />
      <Header hasTopBanner={hasTopBanner} />
      
      <main>
        <HeroSection />
        
        <div className="heaven-body">
          <OfferStrip />
          
          {/* Mini-mural preview section */}
          <section id="el-mural" className="pt-16 pb-0 text-center">
            <h2 className="section-title">Mural de Ángeles en el Cielo</h2>
            <p className="text-[#706A95] mt-4 mb-8 section-subtitle">Cada foto guarda una historia. Cada historia deja una huella.</p>
            <div className="mx-auto flex flex-col items-center w-full">
              <MuralPreview />
            </div>
          </section>

          {/* Sección Banner Ángeles Fundadores */}
          <section className="w-full pt-16 pb-6 text-center">
            <div className="mx-auto w-[min(1120px,calc(100%-32px))] mb-8">
              <h2 className="section-title">Sé uno de los primeros 2.000 Ángeles Fundadores en el Cielo</h2>
              <div className="text-[#706A95] space-y-1.5 max-w-2xl mx-auto mt-4 section-subtitle">
                <p>Tu peque siempre estará en el centro del mural, siempre será visible.</p>
                <p>Además recibirás el certificado oficial de Ángel Fundador.</p>
              </div>
            </div>

            <a 
              href="/mural-global"
              className="block relative w-[min(1120px,calc(100%-32px))] aspect-[3/1] mx-auto rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-sm"
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
              Elige la opción de Corazón Eterno (o cualquiera de los planes superiores) y tu espacio en la zona central de Ángeles Fundadores.
            </p>
          </section>

          {/* Nueva sección: Cómo funciona mural ángeles */}
          <section className="w-full pt-16 pb-6 text-center">
            <div className="mx-auto w-[min(1120px,calc(100%-32px))] mb-8">
              <h2 className="section-title">Dale a tu peque un espacio en el Cielo de los Ángeles en 5 pasos sencillos</h2>
              <p className="text-[#706A95] mt-4 max-w-2xl mx-auto section-subtitle">
                Preserva su historia en pocos minutos
              </p>
            </div>
            <div className="relative w-[min(1120px,calc(100%-32px))] aspect-[3/1] mx-auto rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-sm">
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
          <CorazonesDeAngelSection />

          {/* Sección Puente a la Comunidad y Cartas al Cielo */}
          <section className="w-full pt-10 pb-6 text-center">
            <div className="mx-auto w-[min(1120px,calc(100%-32px))] rounded-[28px] p-7 sm:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(140,63,113,0.08)] border border-[#F6DCE9] bg-gradient-to-br from-[#FFF9F6] via-[#FAF2F8] to-[#FFF3E8] flex flex-col md:flex-row items-center justify-between gap-8 text-left">
              <div className="flex-1 space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#F0CFE1] text-[#9E457C] text-xs font-bold tracking-wide shadow-sm">
                  <span>🕊️</span>
                  <span>Espacio Abierto y Gratuito</span>
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D0F31] leading-tight">
                  Cartas al Cielo · El Libro de los Ángeles
                </h2>
                <p className="text-sm sm:text-base text-[#5E4D64] leading-relaxed max-w-xl">
                  Un rincón cálido donde dedicar unas palabras a tu compañero eterno, encender una vela virtual sin coste y leer las cartas de amor de otras familias que también recuerdan a sus ángeles.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="/comunidad"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white shadow-[0_8px_24px_rgba(164,80,155,0.35)] hover:shadow-[0_12px_28px_rgba(164,80,155,0.45)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #A4509B 0%, #C85998 50%, #9B3D75 100%)',
                    }}
                  >
                    <span>Escribir una carta o encender una vela</span>
                    <span>→</span>
                  </a>
                  <a
                    href="/comunidad#galeria-recuerdos"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-[#8C3F71] bg-white hover:bg-[#FFF6FB] border border-[#E9C5DB] transition-all"
                  >
                    <span>Abrir el libro de cartas</span>
                    <span>📖</span>
                  </a>
                </div>
              </div>

              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white flex-shrink-0">
                <Image
                  src="/images/comunidad/bridge-frame.webp"
                  alt="Cartas al Cielo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D0F31]/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold drop-shadow">
                    📖 El Libro de los Ángeles · Cartas al Cielo
                  </span>
                </div>
              </div>
            </div>
          </section>

          <RainbowBridge />
          <Testimonials />
 
          {/* Final CTA */}
          <section className="final-heaven-cta relative overflow-hidden text-white rounded-[32px] mx-auto w-[min(1120px,calc(100%-32px))] mt-[40px] sm:mt-[80px] mb-[40px] px-5 py-8 sm:px-[32px] sm:py-[52px] text-center shadow-[0_26px_70px_rgba(111,95,168,0.24)]">
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
