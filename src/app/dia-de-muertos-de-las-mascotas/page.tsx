'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Caveat } from 'next/font/google';
import { 
  RibbonTag, 
  CornerPapelPicado, 
  ClapperCameraIcon, 
  PencilIcon, 
  ShareNodeIcon, 
  PostcardPaperTag 
} from '@/components/campana/DiaDeLasMascotasAssets';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export default function DiaDeLasMascotasLanding() {
  // Mobile Nav Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form State
  const [petName, setPetName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dedication, setDedication] = useState('');

  // Form Validation & Status
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoModalRef = useRef<HTMLDivElement>(null);

  const MAX_DEDICATION_LENGTH = 600;

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'La fotografía no puede superar 10 MB.' }));
        return;
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setErrors((prev) => ({ ...prev, photo: 'Formato no admitido. Usa JPEG, PNG o WebP.' }));
        return;
      }

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const newErrors: { [key: string]: string } = {};
    if (!petName.trim()) {
      newErrors.petName = 'El nombre de la mascota es obligatorio.';
    }
    if (!dedication.trim()) {
      newErrors.dedication = 'Por favor escribe una dedicatoria.';
    } else if (dedication.length > MAX_DEDICATION_LENGTH) {
      newErrors.dedication = `La dedicatoria no puede superar los ${MAX_DEDICATION_LENGTH} caracteres.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let uploadedPhotoUrl = '';

      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const uploadRes = await fetch('/api/upload-pet-photo', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedPhotoUrl = uploadData.originalUrl || uploadData.thumbnailUrl || '';
        }
      }

      const res = await fetch('/api/campana-dia-de-muertos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: petName.trim(),
          guardianName: 'Familia',
          contactType: 'web',
          contactValue: 'Formulario oficial Día de las Mascotas',
          dedication: dedication.trim(),
          photoUrl: uploadedPhotoUrl,
          authorizedSocials: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al enviar el recuerdo.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setServerError(err.message || 'No se pudo enviar el recuerdo en este momento. Por favor inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (videoModalOpen) setVideoModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoModalOpen, mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#3D314A] font-inter relative selection:bg-[#FDE68A] selection:text-[#6B1D34]">
      
      {/* 3. Papel Picado en la esquina superior derecha */}
      <CornerPapelPicado />

      {/* Fondo global suave con nubes y flores */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/images/campanas/fondo-global-grande-1000x1500.webp" />
          <source media="(min-width: 640px)" srcSet="/images/campanas/fondo-global-movil-640x960.webp" />
          <img
            src="/images/campanas/fondo-global-movil-480x720.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </picture>
      </div>

      {/* =========================================================================
          CABECERA OFICIAL
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FFFDFB]/90 backdrop-blur-md border-b border-[#F7E6CE] shadow-[0_2px_12px_rgba(107,29,52,0.04)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <Link 
            href="/" 
            className="flex items-center gap-2 group select-none shrink-0"
            title="Ángeles en el Cielo · Inicio"
          >
            <img 
              src="/images/icons/Logoheart.svg" 
              alt="Logotipo de Ángeles en el Cielo" 
              className="h-9 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col font-serif leading-tight">
              <span className="text-[#6B1D34] text-sm sm:text-base md:text-lg font-bold tracking-tight">Ángeles en</span>
              <span className="text-[#6B1D34] text-sm sm:text-base md:text-lg font-bold tracking-tight">el Cielo</span>
            </div>
          </Link>

          <nav 
            className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#5B4A6A]"
            aria-label="Navegación principal"
          >
            <Link href="/" className="hover:text-[#6B1D34] transition-colors py-1">
              Inicio
            </Link>
            <Link href="/mural-global" className="hover:text-[#6B1D34] transition-colors py-1">
              Mural
            </Link>
            <Link href="/comunidad" className="hover:text-[#6B1D34] transition-colors py-1">
              Historias
            </Link>
            <Link href="/como-funciona" className="hover:text-[#6B1D34] transition-colors py-1">
              Sobre nosotros
            </Link>
            <Link href="/contacto" className="hover:text-[#6B1D34] transition-colors py-1">
              Ayuda
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/#planes"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.30)] hover:scale-105 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
            >
              <span>⭐ Enciende su estrella</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#6B1D34] hover:bg-[#FDF2E9] focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDFB] border-b border-[#F7E6CE] px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <nav className="flex flex-col gap-2.5 text-base font-medium text-[#5B4A6A]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FDF2E9] hover:text-[#6B1D34]">
                Inicio
              </Link>
              <Link href="/mural-global" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FDF2E9] hover:text-[#6B1D34]">
                Mural
              </Link>
              <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FDF2E9] hover:text-[#6B1D34]">
                Historias
              </Link>
              <Link href="/como-funciona" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FDF2E9] hover:text-[#6B1D34]">
                Sobre nosotros
              </Link>
              <Link href="/contacto" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FDF2E9] hover:text-[#6B1D34]">
                Ayuda
              </Link>
            </nav>
            <div className="pt-2">
              <Link
                href="/#planes"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
              >
                <span>⭐ Enciende su estrella</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          1, 2 & 3. HERO SECTION (IMAGEN DE FONDO DE SECCIÓN COMPLETA SIN TARJETA)
         ========================================================================= */}
      <section className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex items-center overflow-hidden mb-12 sm:mb-16">
        
        {/* 2. Imagen de fondo del Hero extendida en toda la sección sin caja contenedora */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 1200px)" srcSet="/images/campanas/hero-escritorio-1600x900.webp" />
            <source media="(min-width: 768px)" srcSet="/images/campanas/hero-escritorio-1200x675.webp" />
            <source media="(min-width: 480px)" srcSet="/images/campanas/hero-movil-752x941.webp" />
            <img
              src="/images/campanas/hero-movil-480x600.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-right sm:object-center"
              loading="eager"
            />
          </picture>

          {/* Difuminado sutil a la izquierda para garantizar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/80 to-transparent sm:w-2/3 lg:w-3/5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/85 via-transparent to-transparent sm:hidden pointer-events-none" />
        </div>

        {/* Frase poética en la zona de nubes encima de las velas de la derecha idéntica a media_1792943992647_fe6f1fc7.png */}
        <div className="absolute top-[26%] sm:top-[28%] lg:top-[26%] xl:top-[24%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 z-20 select-none pointer-events-none text-right -rotate-3 sm:-rotate-6">
          <p 
            className={`${caveat.className} text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-[#7A1B38] leading-[1.08] drop-shadow-[0_1.5px_4px_rgba(255,255,255,0.9)] font-bold tracking-wide`}
          >
            <span className="block">Nuestro amor</span>
            <span className="block">también celebra</span>
            <span className="inline-flex items-center justify-end gap-1">
              <span>la vida</span>
              <svg 
                className="w-5 h-6 sm:w-6 sm:h-7 text-[#7A1B38] inline-block -mt-1 ml-0.5" 
                viewBox="0 0 24 28" 
                fill="none"
                aria-hidden="true"
              >
                <path 
                  d="M 12 25 C 9 18 2 12 3 6 C 4 2 9 2 12 7 C 15 2 20 2 21 6 C 22 12 15 18 12 25 Z" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </p>
        </div>

        {/* Contenido a la izquierda idéntico a media_1792932568659_a9340d93.png */}
        <div className="relative z-10 max-w-[1240px] w-full mx-auto px-4 sm:px-6">
          <div className="max-w-xl text-left space-y-5 sm:space-y-6">
            
            {/* 1. Tag Ribbon SVG recreado idéntico al pantallazo adjunto */}
            <div className="max-w-[440px]">
              <RibbonTag />
            </div>

            {/* 3. Título idéntico al mockup (3 líneas con trazo de corazón a mano alzada idéntico a media_1792940574111_ac794658.png) */}
            <h1 
              className="text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#6B1D34] leading-[1.12] tracking-tight"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              <span className="block">Hay amores que</span>
              <span className="block">siempre encuentran</span>
              <span className="inline-flex items-center flex-wrap gap-x-2 gap-y-1">
                <span className="text-[#5B162C]">el camino</span>
                <span className="text-[#9E5B3D] font-normal inline-flex items-baseline">
                  <span>de vuelta</span>
                  <svg 
                    className="w-12 h-9 sm:w-16 sm:h-12 inline-block -mb-1 ml-0.5 text-[#8C2440] select-none pointer-events-none" 
                    viewBox="0 0 100 70" 
                    fill="none"
                    aria-hidden="true"
                  >
                    <path 
                      d="M 2 52 C 16 55 32 52 44 44 C 48 41 51 38 52 36 C 45 27 36 20 39 12 C 41 7 48 8 52 19 C 55 11 60 5 64 7 C 69 9 68 17 64 25 C 59 32 55 35 52 36 C 49 37 54 39 60 40.5 C 65 41.5 70 41.5 76 41" 
                      stroke="currentColor" 
                      strokeWidth="2.4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </span>
              </span>
            </h1>

            {/* 3. Párrafos idénticos a la imagen 2 */}
            <div className="space-y-2 text-[#4A3B58] text-base sm:text-lg sm:leading-relaxed font-normal">
              <p className="font-normal text-[#4A3B58]">
                Una fecha para recordar a quienes siguen viviendo en nuestro corazón.
              </p>
              <p className="text-sm sm:text-base text-[#5B4A6A]">
                Este <strong className="text-[#5B162C] font-semibold">Día de las mascotas</strong>, enciende una luz por quien dejó huellas eternas.
              </p>
            </div>

            {/* 3. Botones CTAs idénticos a la imagen 2 */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              
              {/* CTA 1: Ámbar-naranja con estrella blanca y flecha */}
              <Link
                href="/#planes"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm sm:text-base font-medium text-white shadow-[0_4px_16px_rgba(217,119,6,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
              >
                <svg className="w-4 h-4 fill-none stroke-white stroke-2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Enciende su estrella</span>
                <span className="text-white text-base">→</span>
              </Link>

              {/* CTA 2: Blanco con icono play burdeos */}
              <a
                href="#pelicula-chloe"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold text-[#6B1D34] bg-white hover:bg-[#FFFDFB] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="text-[#7A1B38] text-xs">▶</span>
                <span>Conoce la historia de Chloe</span>
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* Contenedor de las Secciones */}
      <main className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-14 sm:space-y-20 pb-16">

        {/* =========================================================================
            4 & 5. PELÍCULA DE CHLOÉ (TEXTO IDÉNTICO + OVERLAY DERECHA EN MINIATURA)
           ========================================================================= */}
        <section 
          id="pelicula-chloe" 
          className="rounded-3xl bg-[#FFFDFB]/95 border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-10 lg:p-12"
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* 4. Columna Izquierda: Información idéntica a imagen 3 */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="inline-block">
                <ClapperCameraIcon className="w-12 h-12" />
              </div>

              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1D34] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Película de Chloe
              </h2>

              <p className="text-sm sm:text-base text-[#4A3B58] font-normal leading-relaxed">
                Video emocional con subtítulos y reproducción voluntaria.
              </p>

              <p className="text-sm sm:text-base text-[#4A3B58] font-normal leading-relaxed">
                Una historia de amor que sigue viviendo, más allá del tiempo.
              </p>

              {/* Dibujo de corazón a mano alzada inferior matching mockup */}
              <div className="pt-2">
                <svg className="w-32 h-6 text-[#C45A77]" viewBox="0 0 120 24" fill="none">
                  <path d="M 10 12 Q 35 18 50 12 Q 54 8 58 12 Q 62 16 66 12 Q 85 6 110 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 58 10 C 58 10 54 6 54 3 C 54 1 56 0 58 2 C 60 0 62 1 62 3 C 62 6 58 10 58 10 Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* 5. Columna Derecha: Miniatura idéntica a imagen 4 */}
            <div className="lg:col-span-7">
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border-2 border-amber-200/60 bg-[#1A0D1D] group cursor-pointer"
                onClick={() => setVideoModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setVideoModalOpen(true)}
                aria-label="Reproducir Película de Chloe"
              >
                {/* 2. Cintillo diagonal rosa "Pronto disponible" color rosa Ángeles en el Cielo */}
                <div className="absolute top-0 left-0 overflow-hidden w-40 h-40 z-20 pointer-events-none">
                  <div className="absolute top-7 -left-12 -rotate-45 bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#DB2777] text-white text-[9px] sm:text-[10px] font-bold py-1 w-56 text-center shadow-md uppercase tracking-wider">
                    Pronto disponible
                  </div>
                </div>

                <picture>
                  <source media="(min-width: 1200px)" srcSet="/images/campanas/pelicula-chloe-escritorio-1600x900.webp" width="1600" height="900" />
                  <source media="(min-width: 768px)" srcSet="/images/campanas/pelicula-chloe-escritorio-1200x675.webp" width="1200" height="675" />
                  <source media="(min-width: 480px)" srcSet="/images/campanas/pelicula-chloe-movil-800x450.webp" width="800" height="450" />
                  <img
                    src="/images/campanas/pelicula-chloe-movil-480x270.webp"
                    alt="Miniatura Película de Chloe"
                    width="480"
                    height="270"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Botón de reproducción circular central con triángulo blanco */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 backdrop-blur-xs group-hover:bg-black/60 text-white shadow-2xl flex items-center justify-center pl-1 group-hover:scale-110 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* 5. Texto de la derecha idéntico a imagen 4 */}
                <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-right select-none pointer-events-none space-y-1">
                  <p 
                    className="text-3xl sm:text-4xl lg:text-5xl text-[#FDE68A] drop-shadow-md leading-none"
                    style={{ fontFamily: 'cursive, "Brush Script MT", Georgia, serif' }}
                  >
                    Chloe
                  </p>
                  <p 
                    className="text-xs sm:text-sm text-white/95 drop-shadow-md leading-tight"
                    style={{ fontFamily: 'cursive, Georgia, serif' }}
                  >
                    Siempre en<br />nuestros corazones
                  </p>
                  <div className="text-sm text-white/90 drop-shadow-sm pt-0.5">
                    ♡
                  </div>
                </div>

                {/* 5. Duración 03:24 en la esquina inferior derecha */}
                <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  03:24
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Modal de información de la película */}
        {videoModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            <div 
              ref={videoModalRef}
              className="bg-[#FFFDFB] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#F5E1CB] shadow-2xl space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 text-[#6B1D34] hover:bg-[#FDF2E9] p-2 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <span className="text-3xl">🎬 🐾</span>
                <h3 
                  id="video-modal-title"
                  className="text-2xl font-bold text-[#6B1D34]"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  Película de Chloe
                </h3>
                <p className="text-sm text-[#581528] font-medium">
                  «Una historia de amor que sigue viviendo, más allá del tiempo.»
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-amber-200/80 text-xs sm:text-sm text-[#4A3B58] space-y-2 leading-relaxed">
                <p>
                  Estamos finalizando la edición de esta película conmemorativa.
                </p>
                <p>
                  Su estreno oficial tendrá lugar este <strong>27 de octubre</strong>. Enciende su estrella en el Mural de Ángeles mientras preparamos la sala.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#6B1D34] hover:bg-[#581528] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6 & 7. COMPARTE SU RECUERDO & POSTAL PARA COMPARTIR (2 COLUMNAS CON FONDOS ADAPTATIVOS)
           ========================================================================= */}
        <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* 6. Columna Izquierda: Formulario idéntico a imagen 5 con fondo adaptativo */}
          <div className="lg:col-span-7 rounded-3xl border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-8 relative overflow-hidden bg-[#FFFDFB]">
            
            {/* Imagen de fondo adaptativa: PC (1024x576), Tablet (1024x768), Móvil (768x1152) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
              <picture>
                <source media="(min-width: 1024px)" srcSet="/images/campanas/fondo-nubes-flores-sin-perrito-pc-1024x576.webp" />
                <source media="(min-width: 640px)" srcSet="/images/campanas/fondo-nubes-flores-sin-perrito-tablet-1024x768.webp" />
                <img
                  src="/images/campanas/fondo-nubes-flores-sin-perrito-movil-768x1152.webp"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-[#FFFDFB]/85 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 space-y-6">
              
              {/* Encabezado con Lápiz idéntico a imagen 5 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 text-[#6B1D34]">
                  <PencilIcon className="w-8 h-8" />
                  <h2 
                    className="text-2xl sm:text-3xl font-bold text-[#6B1D34]"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    Comparte su recuerdo
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#6B5A7A]">
                  Déjanos un mensaje para mantener viva su luz.
                </p>
              </div>

              {isSuccess ? (
                <div className="p-8 rounded-2xl bg-[#FFF9F3] border border-amber-300 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </div>
                  <h3 
                    className="text-2xl font-bold text-[#6B1D34]"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    ¡El recuerdo de {petName} ha sido recibido!
                  </h3>
                  <p className="text-sm text-[#581528] max-w-md mx-auto leading-relaxed">
                    Gracias por confiar en nosotros su historia. Formará parte de nuestro homenaje conmemorativo.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setPetName('');
                      setDedication('');
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-[#6B1D34] bg-white border border-[#6B1D34]/30 hover:bg-[#FDF2E9] transition-all"
                  >
                    Compartir otro recuerdo
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  
                  {serverError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                      ⚠️ {serverError}
                    </div>
                  )}

                  {/* Grid de 2 columnas para campos según imagen 5 */}
                  <div className="grid sm:grid-cols-12 gap-5 items-start">
                    
                    {/* Campos de texto a la izquierda */}
                    <div className="sm:col-span-7 space-y-4">
                      
                      {/* Campo Nombre */}
                      <div>
                        <label 
                          htmlFor="pet-name-input" 
                          className="block text-xs sm:text-sm font-semibold text-[#6B1D34] mb-1.5"
                        >
                          Nombre *
                        </label>
                        <input
                          id="pet-name-input"
                          type="text"
                          required
                          value={petName}
                          onChange={(e) => {
                            setPetName(e.target.value);
                            if (errors.petName) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.petName;
                                return copy;
                              });
                            }
                          }}
                          placeholder="Tu nombre"
                          className={`w-full px-4 py-3 rounded-xl bg-white border text-[#3D314A] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all ${
                            errors.petName ? 'border-red-400 bg-red-50/20' : 'border-[#E8D7C6]'
                          }`}
                        />
                        {errors.petName && (
                          <p className="text-xs text-red-600 mt-1 font-medium">{errors.petName}</p>
                        )}
                      </div>

                      {/* Campo Dedicatoria */}
                      <div>
                        <label 
                          htmlFor="dedication-input"
                          className="block text-xs sm:text-sm font-semibold text-[#6B1D34] mb-1.5"
                        >
                          Dedicatoria *
                        </label>

                        <textarea
                          id="dedication-input"
                          required
                          rows={4}
                          value={dedication}
                          maxLength={MAX_DEDICATION_LENGTH}
                          onChange={(e) => {
                            setDedication(e.target.value);
                            if (errors.dedication) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.dedication;
                                return copy;
                              });
                            }
                          }}
                          placeholder="Escribe aquí tu mensaje..."
                          className={`w-full px-4 py-3 rounded-xl bg-white border text-[#3D314A] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all leading-relaxed ${
                            errors.dedication ? 'border-red-400 bg-red-50/20' : 'border-[#E8D7C6]'
                          }`}
                        />
                        {errors.dedication && (
                          <p className="text-xs text-red-600 mt-1 font-medium">{errors.dedication}</p>
                        )}
                      </div>

                    </div>

                    {/* Caja de Fotografía a la derecha según imagen 5 */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs sm:text-sm font-semibold text-[#6B1D34] mb-1.5">
                        Fotografía opcional
                      </label>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />

                      {photoPreview ? (
                        <div className="p-4 rounded-2xl bg-white border border-[#E8D7C6] text-center space-y-2 shadow-xs">
                          <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto border border-amber-200">
                            <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-semibold text-[#3D314A] truncate">{photoFile?.name}</p>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                          >
                            Eliminar foto
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 rounded-2xl border-2 border-dashed border-[#E8D7C6] hover:border-[#C45A77] bg-white/60 hover:bg-[#FFF9F3] text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        >
                          <svg className="w-8 h-8 text-[#C45A77] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <p className="text-xs font-semibold text-[#6B1D34] leading-tight">
                            Sube una foto<br />de tu angelito
                          </p>
                          <span className="text-lg text-[#C45A77] mt-2 select-none">🐾</span>
                        </div>
                      )}
                      {errors.photo && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.photo}</p>
                      )}
                    </div>

                  </div>

                  {/* 6. Botón CTA idéntico a imagen 5 (Rosa suave con corazón sonriente) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 rounded-full text-base font-semibold text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 bg-[#C45A77] hover:bg-[#B84A68]"
                    >
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{isSubmitting ? 'Enviando recuerdo...' : 'Compartir recuerdo'}</span>
                    </button>
                  </div>

                  {/* 6. Texto informativo del Mural sin pedir permiso con casilla */}
                  <div className="pt-1 text-center">
                    <p className="inline-flex items-center justify-center gap-1.5 text-xs text-[#5B4A6A] font-medium">
                      <svg className="w-3.5 h-3.5 text-[#6B1D34]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>Tu mensaje formará parte de nuestro Mural de Ángeles. ✨</span>
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>

          {/* 7. Columna Derecha: "Postal para compartir" inclinada estilo polaroid con fondo adaptativo */}
          <div className="lg:col-span-5 rounded-3xl border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between bg-[#FFFDFB]">
            
            {/* Imagen de fondo adaptativa: PC vertical (1024x1536), Tablet (1024x768), Móvil (768x1152) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
              <picture>
                <source media="(min-width: 1024px)" srcSet="/images/campanas/fondo-nubes-flores-sin-perrito-original-vertical-1024x1536.webp" />
                <source media="(min-width: 640px)" srcSet="/images/campanas/fondo-nubes-flores-sin-perrito-tablet-1024x768.webp" />
                <img
                  src="/images/campanas/fondo-nubes-flores-sin-perrito-movil-768x1152.webp"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-[#FFFDFB]/85 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 text-[#6B1D34]">
                  <ShareNodeIcon className="w-6 h-6" />
                  <h2 
                    className="text-2xl sm:text-3xl font-bold text-[#6B1D34]"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    Postal para compartir
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#6B5A7A]">
                  Si activamos la generación gratuita.
                </p>
              </div>

              {/* 7. Presentación de la foto de Chloe inclinada hacia la izquierda estilo polaroid */}
              <div className="relative flex justify-center items-center my-4 py-2">
                
                {/* Contenedor relativo centrado para la foto y sus detalles */}
                <div className="relative">
                  {/* Foto cuadrada inclinada hacia la izquierda */}
                  <div className="relative -rotate-3 hover:rotate-0 transition-transform duration-300 w-[240px] xs:w-[260px] sm:w-[280px] bg-white p-3 rounded-2xl shadow-[0_10px_25px_rgba(107,29,52,0.12)] border border-[#F5E1CB]">
                    
                    {/* Imagen de Chloe */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FFF2E2]">
                      <img
                        src="/images/campanas/postal-grande-1000x1500.webp"
                        alt="Postal de Chloe"
                        className="w-full h-full object-cover object-top"
                      />
                      
                      {/* Texto al pie de la foto dentro del marco matching mockup */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 text-center">
                        <p className="text-white text-xs sm:text-sm font-serif italic leading-tight drop-shadow-md">
                          Hay amores<br />
                          que siempre encuentran<br />
                          el camino de vuelta<br />
                          <span className="text-sm">♡</span>
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* 7. Tag 27 OCT dentro de recuadro de papel en la esquina superior derecha */}
                  <div className="absolute -top-3 -right-2 sm:-right-4 z-20">
                    <PostcardPaperTag />
                  </div>

                  {/* 7. Texto "Comparte su luz en el mundo ♡" a mano alzada */}
                  <div className="absolute -right-14 sm:-right-16 bottom-4 text-right select-none pointer-events-none hidden md:block">
                    <p 
                      className="text-xs sm:text-sm text-[#7A1B38] leading-tight"
                      style={{ fontFamily: 'cursive, Georgia, serif' }}
                    >
                      Compartes<br />
                      su luz<br />
                      en el mundo<br />
                      <span className="text-base text-[#EA580C]">♡</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* 7. CTA de Descargar Postal IDÉNTICO al mockup (Rosa pastel con bandeja de descarga) */}
              <div className="pt-2">
                <a
                  href="/images/campanas/postal-grande-1000x1500.webp"
                  download="Postal-Recuerdo-Dia-de-las-Mascotas.webp"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold text-[#831843] bg-[#FCE7F3] hover:bg-[#FBCFE8] border border-[#F472B6]/40 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  <span>Descargar postal</span>
                </a>
              </div>

            </div>

          </div>

        </section>

        {/* =========================================================================
            8. MURAL DE ÁNGELES (CON IMAGEN DE FONDO, ESTRELLA Y CTA CON DEGRADADO)
           ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] min-h-[460px] sm:min-h-[520px] flex items-center bg-[#160E29]">
          
          {/* Imagen de fondo del Mural v2 con Chloé, House y Mary Margaret */}
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(min-width: 1200px)" srcSet="/images/campanas/mural-angeles-escritorio-1600x900.webp" />
              <source media="(min-width: 768px)" srcSet="/images/campanas/mural-angeles-escritorio-1200x675.webp" />
              <source media="(min-width: 480px)" srcSet="/images/campanas/mural-angeles-movil-752x941.webp" />
              <img
                src="/images/campanas/mural-angeles-movil-480x600.webp"
                alt="Mural de Ángeles"
                className="w-full h-full object-cover object-right sm:object-center"
                loading="lazy"
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/85 to-transparent sm:w-2/3 lg:w-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/40 to-transparent sm:hidden pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl text-left space-y-4">
            
            {/* 8. Estrella dorada con el mismo estilo y color del mockup */}
            <div className="text-3xl text-[#F59E0B] select-none drop-shadow-sm">
              ⭐
            </div>
            
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1D34]"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Mural de Ángeles
            </h2>

            <p className="text-sm sm:text-base font-semibold text-[#7E6E8D]">
              Recuerdo dentro de nuestro cielo.
            </p>

            <p className="text-sm sm:text-base text-[#4A3B58] leading-relaxed">
              Cada estrella representa una vida que dejó huellas eternas. Aquí, sus historias siguen brillando.
            </p>

            {/* 8. CTA con degradado de color a color idéntico al mockup */}
            <div className="pt-2">
              <Link
                href="/mural-global"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-[#78350F] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 50%, #F59E0B 100%)' }}
              >
                <span>Explorar el Mural</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

          </div>
        </section>

        {/* =========================================================================
            11. CORAZONES DE ÁNGEL (CON IMAGEN DE FONDO, ICON PLAN ETERNO Y CTA IDÉNTICO)
           ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] min-h-[460px] sm:min-h-[500px] flex items-center bg-[#FFF2E2]">
          
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(min-width: 1200px)" srcSet="/images/campanas/corazones-angel-escritorio-1600x900.webp" />
              <source media="(min-width: 768px)" srcSet="/images/campanas/corazones-angel-escritorio-1200x675.webp" />
              <source media="(min-width: 480px)" srcSet="/images/campanas/corazones-angel-movil-752x941.webp" />
              <img
                src="/images/campanas/corazones-angel-movil-480x600.webp"
                alt="Juliette descansando junto a velas"
                className="w-full h-full object-cover object-right sm:object-center"
                loading="lazy"
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/85 to-transparent sm:w-2/3 lg:w-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/40 to-transparent sm:hidden pointer-events-none" />
          </div>

          <div className="absolute top-6 right-6 z-10 hidden lg:block select-none pointer-events-none text-right">
            <p className="font-serif italic text-sm text-[#7A1B38] leading-tight">
              El amor<br />
              también vive<br />
              aquí ♡
            </p>
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl text-left space-y-4">
            
            {/* 11. Icono del Plan Eterno oficial de Ángeles en el Cielo */}
            <div className="inline-block select-none">
              <img 
                src="/images/icons/plans/icon-plan-eterno.svg" 
                alt="Corazones de Ángel" 
                className="w-11 h-11 object-contain filter drop-shadow-[0_2px_4px_rgba(201,169,97,0.40)]" 
              />
            </div>

            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1D34]"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Corazones de Ángel
            </h2>

            <p className="text-sm sm:text-base font-semibold text-[#7E6E8D]">
              También recordamos a los perritos de refugios y protectoras.
            </p>

            <p className="text-sm sm:text-base text-[#4A3B58] leading-relaxed">
              Ellos también merecen ser recordados. Aquí honramos a todas los perritos que esperan una familia, y a los que aún esperan una oportunidad de ser amados.
            </p>

            {/* 11. CTA melocotón idéntico al mockup ("Conoce más →") */}
            <div className="pt-2">
              <Link
                href="/#corazones-de-angel"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-[#9A3412] bg-[#FFEDD5] hover:bg-[#FED7AA] border border-[#FDBA74]/50 shadow-xs hover:shadow-sm transition-all"
              >
                <span>Conoce más</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* =========================================================================
          9. PIE DE PÁGINA (CON INFORMACIÓN DE TODASLASMASCOTASVANALCIELO Y ÁNGELES EN EL CIELO)
         ========================================================================= */}
      <footer className="border-t border-[#F5E1CB] bg-[#FFF9F5] py-14 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center space-y-6">
          
          <nav 
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-[#7A6B8A]"
            aria-label="Navegación del pie de página"
          >
            <Link href="/" className="hover:text-[#6B1D34] transition-colors">
              Inicio
            </Link>
            <Link href="/mural-global" className="hover:text-[#6B1D34] transition-colors">
              Mural
            </Link>
            <Link href="/comunidad" className="hover:text-[#6B1D34] transition-colors">
              Historias
            </Link>
            <Link href="/como-funciona" className="hover:text-[#6B1D34] transition-colors">
              Sobre nosotros
            </Link>
            <Link href="/contacto" className="hover:text-[#6B1D34] transition-colors">
              Ayuda
            </Link>
            <Link href="/contacto" className="hover:text-[#6B1D34] transition-colors">
              Contacto
            </Link>
            <Link href="/privacidad" className="hover:text-[#6B1D34] transition-colors">
              Privacidad
            </Link>
            <Link href="/aviso-legal" className="hover:text-[#6B1D34] transition-colors">
              Aviso legal
            </Link>
          </nav>

          {/* 9. Logotipo oficial de la empresa e información institucional */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Link href="/" className="flex items-center gap-2 select-none group">
              <img 
                src="/images/icons/Logoheart.svg" 
                alt="Logotipo Ángeles en el Cielo" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <div className="text-left font-serif leading-none">
                <span className="text-[#6B1D34] text-xl font-bold block" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  Ángeles en el Cielo
                </span>
                <span className="text-[10px] text-[#A69AA8] font-sans font-medium tracking-wide">
                  todaslasmascotasvanalcielo.com
                </span>
              </div>
            </Link>
            
            <p className="text-[11px] uppercase tracking-widest text-[#B84A68] font-semibold pt-1">
              PORQUE EL AMOR NUNCA SE DESPIDE
            </p>

            <p className="text-xs text-[#7A6B8A] max-w-md mx-auto pt-1 leading-relaxed">
              <strong>Todas las mascotas van al cielo</strong> · <strong>Ángeles en el Cielo</strong><br />
              Un santuario conmemorativo digital dedicado al amor eterno por nuestros compañeros de vida.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#8C3F54] pt-1">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full bg-white/80 hover:bg-white hover:text-[#6B1D34] shadow-xs transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full bg-white/80 hover:bg-white hover:text-[#6B1D34] shadow-xs transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full bg-white/80 hover:bg-white hover:text-[#6B1D34] shadow-xs transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          <p className="text-[11px] text-[#A69AA8]">
            © {new Date().getFullYear()} Todas las mascotas van al cielo · Ángeles en el Cielo · Todos los derechos reservados.
          </p>

        </div>
      </footer>

    </div>
  );
}
