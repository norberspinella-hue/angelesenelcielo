'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  RibbonTag, 
  CornerPapelPicado, 
  ClapperCameraIcon, 
  PencilIcon, 
  ShareNodeIcon, 
  PostcardStamp 
} from '@/components/campana/DiaDeLasMascotasAssets';

export default function DiaDeLasMascotasLanding() {
  // Mobile Nav Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form State
  const [petName, setPetName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dedication, setDedication] = useState('');
  const [authorized, setAuthorized] = useState(false);

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
    if (!authorized) {
      newErrors.authorized = 'Debes autorizar la publicación para poder compartir su recuerdo.';
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
          guardianName: 'Comunidad Ángeles en el Cielo',
          contactType: 'web',
          contactValue: 'Recibido desde formulario web',
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
      
      {/* 3. Papel Picado en la esquina superior derecha (de borde de arriba a lateral derecha) */}
      <CornerPapelPicado />

      {/* Fondo global decorativo con nubes y flores sutiles */}
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
          
          {/* Logotipo oficial */}
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

          {/* Navegación Desktop */}
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

          {/* CTA Destacado & Botón móvil */}
          <div className="flex items-center gap-3">
            <Link
              href="/#planes"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.30)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.45)] hover:scale-105 active:scale-95 transition-all duration-200"
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

      {/* Contenedor Principal */}
      <main className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-14 sm:space-y-20">

        {/* =========================================================================
            1. & 4. HERO SECTION (CON LA FOTO DE CHLOÉ DE FONDO INTEGRADA)
           ========================================================================= */}
        <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden rounded-3xl border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] bg-[#FFFDF9]">
          
          {/* Imagen adaptativa de fondo del Hero (PC, Tablet y Móvil) */}
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

            {/* Difuminado suave sobre el área de texto para máxima legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/80 to-transparent sm:w-2/3 lg:w-3/5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/85 via-transparent to-transparent sm:hidden pointer-events-none" />
          </div>

          {/* Sello poético en la zona de Chloé matching mockup */}
          <div className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-xs hidden lg:block select-none pointer-events-none">
            <span className="text-[11px] font-serif italic text-[#6B1D34]">
              Nuestro amor también celebra la vida ♡
            </span>
          </div>

          {/* Contenido a la izquierda */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl text-left space-y-5 sm:space-y-6">
            
            {/* 4. Tag Ribbon SVG idéntico al mockup */}
            <div className="max-w-[340px] sm:max-w-[400px]">
              <RibbonTag />
            </div>

            {/* H1 Principal */}
            <h1 
              className="text-2xl sm:text-4xl lg:text-[52px] font-bold text-[#6B1D34] leading-[1.15] tracking-tight break-words"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Hay amores que siempre encuentran el camino de vuelta <span className="text-[#EA580C] font-normal inline-block">♡</span>
            </h1>

            {/* Párrafos */}
            <div className="space-y-2 text-[#4A3B58] text-base sm:text-lg sm:leading-relaxed font-normal">
              <p className="font-medium text-[#581528]">
                Una fecha para recordar a quienes siguen viviendo en nuestro corazón.
              </p>
              <p className="text-sm sm:text-base text-[#6B5A7A]">
                Este Día de las mascotas, enciende una luz por quien dejó huellas eternas.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/#planes"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full text-base font-bold text-white shadow-[0_6px_20px_rgba(234,88,12,0.35)] hover:shadow-[0_8px_26px_rgba(234,88,12,0.50)] hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
              >
                <span>⭐ Enciende su estrella</span>
                <span className="text-xs">→</span>
              </Link>

              <a
                href="#pelicula-chloe"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-full text-base font-bold text-[#6B1D34] bg-[#FFFDFB] border-2 border-[#6B1D34]/25 hover:border-[#6B1D34] hover:bg-[#FDF2E9] shadow-xs hover:shadow-md transition-all duration-200"
              >
                <span className="text-[#EA580C]">▶</span>
                <span>Conoce la historia de Chloé</span>
              </a>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. & 5. PELÍCULA DE CHLOÉ
           ========================================================================= */}
        <section 
          id="pelicula-chloe" 
          className="rounded-3xl bg-[#FFFDFB]/95 border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-10 lg:p-12"
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Información y SVG Claqueta/Cámara (Punto 5) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 5. SVG Cámara/Claqueta idéntico al mockup */}
              <div className="inline-block">
                <ClapperCameraIcon className="w-12 h-12 drop-shadow-sm" />
              </div>

              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1D34] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Película de Chloé
              </h2>

              <p className="text-base sm:text-lg text-[#581528] font-medium leading-relaxed">
                Una historia de amor que sigue viviendo, más allá del tiempo.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FFF5EB] border border-[#FDE68A] text-xs sm:text-sm text-[#7A1B38] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>ℹ️</span> Vídeo emocional con subtítulos y reproducción voluntaria.
                </p>
                <p className="text-[11px] text-[#8C3F54]">
                  Estreno conmemorativo este 27 de octubre. Puedes activar la reproducción sin sonido si lo prefieres.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-sm font-serif italic text-[#EA580C]">
                  «Durante doce años escuché sus patitas por casa...» ♡
                </span>
              </div>
            </div>

            {/* Columna Derecha: Miniatura Adaptativa con cintillo diagonal "Pronto disponible" (Punto 2) */}
            <div className="lg:col-span-7">
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border-2 border-amber-200/60 bg-[#1A0D1D] group cursor-pointer"
                onClick={() => setVideoModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setVideoModalOpen(true)}
                aria-label="Abrir información de la Película de Chloé"
              >
                {/* 2. Cintillo diagonal "Pronto disponible" color rosa de Ángeles en el Cielo */}
                <div className="absolute -top-1 -left-1 overflow-hidden w-36 h-36 z-20 pointer-events-none">
                  <div className="absolute top-6 -left-8 -rotate-45 bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#DB2777] text-white text-[10px] font-bold py-1 w-48 text-center shadow-md uppercase tracking-wider">
                    Pronto disponible
                  </div>
                </div>

                <picture>
                  <source media="(min-width: 1200px)" srcSet="/images/campanas/pelicula-chloe-escritorio-1600x900.webp" width="1600" height="900" />
                  <source media="(min-width: 768px)" srcSet="/images/campanas/pelicula-chloe-escritorio-1200x675.webp" width="1200" height="675" />
                  <source media="(min-width: 480px)" srcSet="/images/campanas/pelicula-chloe-movil-800x450.webp" width="800" height="450" />
                  <img
                    src="/images/campanas/pelicula-chloe-movil-480x270.webp"
                    alt="Miniatura de la película de Chloé al atardecer"
                    width="480"
                    height="270"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Botón de reproducción accesible */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 group-hover:bg-white text-[#EA580C] shadow-2xl flex items-center justify-center pl-1 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Insignia inferior */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 font-medium">
                    🎬 Estreno 27 de octubre
                  </span>
                  <span className="font-serif italic drop-shadow-md hidden sm:inline-block">
                    Chloe · Siempre en nuestros corazones ♡
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Modal de la Película con Accesibilidad */}
        {videoModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
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
                className="absolute top-4 right-4 text-[#6B1D34] hover:bg-[#FDF2E9] p-2 rounded-full transition-colors focus:ring-2 focus:ring-[#EA580C]"
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
                  Película de Chloé
                </h3>
                <p className="text-sm text-[#581528] font-medium">
                  «Una historia de amor que sigue viviendo, más allá del tiempo.»
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-amber-200/80 text-xs sm:text-sm text-[#4A3B58] space-y-2 leading-relaxed">
                <p>
                  Estamos finalizando la edición de esta hermosa película conmemorativa.
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
            6, 7, 8 & 9. COMPARTE SU RECUERDO & POSTAL PARA COMPARTIR (2 COLUMNAS)
           ========================================================================= */}
        <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Columna Izquierda: Formulario "Comparte su recuerdo" con Lápiz SVG (Punto 8) y CTA idéntico (Punto 9) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#FFFDFB]/95 border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-8 relative overflow-hidden">
            
            {/* Fondo suave del formulario */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <picture>
                <source media="(min-width: 1024px)" srcSet="/images/campanas/formulario-fondo-grande-1000x1500.webp" />
                <source media="(min-width: 640px)" srcSet="/images/campanas/formulario-fondo-movil-640x960.webp" />
                <img
                  src="/images/campanas/formulario-fondo-movil-480x720.webp"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </picture>
            </div>

            <div className="relative z-10 space-y-6">
              
              {/* Encabezado con 8. Lápiz dibujado SVG idéntico al mockup */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 text-[#6B1D34]">
                  <PencilIcon className="w-7 h-7" />
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
                <div className="p-8 rounded-2xl bg-[#FFF9F3] border border-amber-300 text-center space-y-4 animate-in fade-in duration-300">
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
                    Gracias por confiar en nosotros su historia. La revisaremos con amor para incluirla en el homenaje conmemorativo.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setPetName('');
                      setDedication('');
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setAuthorized(false);
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-[#6B1D34] bg-white border border-[#6B1D34]/30 hover:bg-[#FDF2E9] transition-all"
                  >
                    Compartir otro recuerdo
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  
                  {serverError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                      ⚠️ {serverError}
                    </div>
                  )}

                  {/* Nombre de la mascota */}
                  <div>
                    <label 
                      htmlFor="pet-name-input" 
                      className="block text-xs sm:text-sm font-semibold text-[#6B1D34] uppercase tracking-wider mb-1.5"
                    >
                      Nombre de la mascota *
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
                      placeholder="Ej: Chloe, Toby, Nara..."
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-[#3D314A] placeholder-gray-400 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all ${
                        errors.petName ? 'border-red-400 bg-red-50/20' : 'border-[#E8D7C6]'
                      }`}
                    />
                    {errors.petName && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.petName}</p>
                    )}
                  </div>

                  {/* Fotografía opcional */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#6B1D34] uppercase tracking-wider mb-1.5">
                      Fotografía (opcional, máx. 10 MB)
                    </label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {photoPreview ? (
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E8D7C6] flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-amber-200 bg-gray-50">
                            <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#3D314A] truncate">{photoFile?.name}</p>
                            <p className="text-[11px] text-[#059669] font-medium">✓ Fotografía seleccionada</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-5 rounded-2xl border-2 border-dashed border-[#E8D7C6] hover:border-[#EA580C] bg-white/60 hover:bg-[#FFF9F3] text-center cursor-pointer transition-all duration-200"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      >
                        <span className="text-2xl block mb-1">📷</span>
                        <p className="text-xs sm:text-sm font-semibold text-[#6B1D34]">
                          Pulsa aquí para subir una foto de tu angelito
                        </p>
                        <p className="text-[11px] text-[#7A6B8A] mt-0.5">
                          Formatos admitidos: JPEG, PNG o WebP
                        </p>
                      </div>
                    )}
                    {errors.photo && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.photo}</p>
                    )}
                  </div>

                  {/* Dedicatoria */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label 
                        htmlFor="dedication-input"
                        className="text-xs sm:text-sm font-semibold text-[#6B1D34] uppercase tracking-wider"
                      >
                        Dedicatoria *
                      </label>
                      <span className={`text-[11px] ${
                        dedication.length > MAX_DEDICATION_LENGTH ? 'text-red-600 font-bold' : 'text-[#7A6B8A]'
                      }`}>
                        {dedication.length} / {MAX_DEDICATION_LENGTH} caracteres
                      </span>
                    </div>

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
                      placeholder="Escribe aquí tu mensaje, recuerdos de su vida o lo que siempre vivirá en ti..."
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-[#3D314A] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all leading-relaxed ${
                        errors.dedication ? 'border-red-400 bg-red-50/20' : 'border-[#E8D7C6]'
                      }`}
                    />
                    {errors.dedication && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.dedication}</p>
                    )}
                  </div>

                  {/* Casilla de autorización */}
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={authorized}
                        onChange={(e) => {
                          setAuthorized(e.target.checked);
                          if (errors.authorized) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.authorized;
                              return copy;
                            });
                          }
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#6B1D34] focus:ring-[#EA580C]"
                      />
                      <span className="text-xs text-[#581528] leading-relaxed font-normal">
                        Autorizo a publicar el nombre, la dedicatoria y la fotografía en el homenaje conmemorativo. He leído y acepto la{' '}
                        <Link href="/privacidad" target="_blank" className="text-[#EA580C] underline font-medium hover:text-[#C2410C]">
                          política de privacidad
                        </Link>.
                      </span>
                    </label>
                    {errors.authorized && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.authorized}</p>
                    )}
                  </div>

                  {/* 9. Botón CTA idéntico al mockup (Rosa frambuesa #C45A77 con icono blanco y Compartir recuerdo) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-base font-semibold text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 bg-[#C45A77] hover:bg-[#B84A68]"
                    >
                      <span className="text-white text-base">♥</span>
                      <span>{isSubmitting ? 'Enviando recuerdo con amor... 🕯️' : 'Compartir recuerdo'}</span>
                    </button>
                  </div>

                  {/* Texto informativo */}
                  <p className="text-xs text-center text-[#7A6B8A] leading-relaxed pt-1">
                    🏛️ Tu mensaje formará parte de nuestro Mural de Ángeles. ✨<br />
                    <span className="text-[11px] text-[#8C3F54]">
                      El recuerdo se publicará tras su revisión con amor por nuestro equipo.
                    </span>
                  </p>

                </form>
              )}

            </div>
          </div>

          {/* Columna Derecha: "Postal para compartir" con Ícono de Red SVG (Punto 6) y CTA idéntico rosa con icono descarga (Punto 7) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#FFFDFB]/95 border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            {/* 6. Encabezado con Ícono de red para compartir idéntico al mockup */}
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

            {/* Ilustración de la Postal con 7. Sello 27 OCT y caligrafía matching mockup */}
            <div className="relative flex justify-center items-center my-2">
              <div className="relative w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#FFF2E2]">
                <picture>
                  <source media="(min-width: 1024px)" srcSet="/images/campanas/postal-grande-1000x1500.webp" width="1000" height="1500" />
                  <source media="(min-width: 640px)" srcSet="/images/campanas/postal-movil-640x960.webp" width="640" height="960" />
                  <img
                    src="/images/campanas/postal-movil-480x720.webp"
                    alt="Postal conmemorativa de Chloé entre nubes y flores"
                    width="480"
                    height="720"
                    className="w-full h-auto object-cover object-center"
                    loading="lazy"
                  />
                </picture>

                {/* 7. Tag 27 OCT. Día de las mascotas idéntico a la tarjeta postal */}
                <div className="absolute top-3 right-3 z-10">
                  <PostcardStamp />
                </div>
              </div>

              {/* Texto caligráfico decorativo lateral matching mockup */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-right hidden sm:block pointer-events-none select-none pl-3">
                <p className="font-serif italic text-xs md:text-sm text-[#7A1B38] leading-tight">
                  Compartes<br />
                  su luz<br />
                  en el mundo<br />
                  <span className="text-[#EA580C] text-base inline-block mt-0.5">♡</span>
                </p>
              </div>
            </div>

            {/* 7. CTA de Descargar Postal IDÉNTICO al mockup (Rosa suave #FCE7F3, texto burdeos e icono de bandeja) */}
            <div className="pt-2">
              <a
                href="/images/campanas/postal-grande-1000x1500.webp"
                download="Postal-Recuerdo-Dia-de-las-Mascotas.webp"
                className="w-full inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-full text-sm font-semibold text-[#831843] bg-[#FCE7F3] hover:bg-[#FBCFE8] border border-[#F472B6]/40 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all"
              >
                {/* Ícono de descarga (bandeja con flecha abajo) */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                <span>Descargar postal</span>
              </a>
            </div>

          </div>

        </section>

        {/* =========================================================================
            10. MURAL DE ÁNGELES (CON LA IMAGEN DE FONDO DE LA TARJETA)
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
                alt="Mural de Ángeles con Chloé, House y Mary Margaret en el cielo"
                className="w-full h-full object-cover object-right sm:object-center"
                loading="lazy"
              />
            </picture>

            {/* Difuminado suave a la izquierda para que los textos en burdeos y crema destaquen */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/85 to-transparent sm:w-2/3 lg:w-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/40 to-transparent sm:hidden pointer-events-none" />
          </div>

          {/* Textos y CTA a la izquierda idénticos al mockup */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl text-left space-y-4">
            
            {/* Ícono de estrella dorada */}
            <div className="text-3xl text-[#F59E0B] select-none">
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

            {/* 10. CTA idéntico al mockup (color melocotón/arena con texto terracota) */}
            <div className="pt-2">
              <Link
                href="/mural-global"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-[#7C2D12] bg-[#FED7AA] hover:bg-[#FDBA74] shadow-xs hover:shadow-sm transition-all"
              >
                <span>Explorar el Mural</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

          </div>
        </section>

        {/* =========================================================================
            11. CORAZONES DE ÁNGEL (CON LA IMAGEN DE FONDO DE LA TARJETA E ICON PLAN ETERNO)
           ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-[#F5E1CB] shadow-[0_8px_30px_rgba(107,29,52,0.06)] min-h-[460px] sm:min-h-[500px] flex items-center bg-[#FFF2E2]">
          
          {/* Imagen de fondo de Corazones de Ángel (Juliette con velas y flores) */}
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(min-width: 1200px)" srcSet="/images/campanas/corazones-angel-escritorio-1600x900.webp" />
              <source media="(min-width: 768px)" srcSet="/images/campanas/corazones-angel-escritorio-1200x675.webp" />
              <source media="(min-width: 480px)" srcSet="/images/campanas/corazones-angel-movil-752x941.webp" />
              <img
                src="/images/campanas/corazones-angel-movil-480x600.webp"
                alt="Juliette descansando junto a velas y flores de cempasúchil"
                className="w-full h-full object-cover object-right sm:object-center"
                loading="lazy"
              />
            </picture>

            {/* Difuminado suave a la izquierda */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/85 to-transparent sm:w-2/3 lg:w-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/40 to-transparent sm:hidden pointer-events-none" />
          </div>

          {/* Sello poético a la derecha matching mockup */}
          <div className="absolute top-6 right-6 z-10 hidden lg:block select-none pointer-events-none text-right">
            <p className="font-serif italic text-sm text-[#7A1B38] leading-tight">
              El amor<br />
              también vive<br />
              aquí ♡
            </p>
          </div>

          {/* Textos y CTA a la izquierda idénticos al mockup */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl text-left space-y-4">
            
            {/* 11. Ícono cambiado por icon-plan-eterno.svg idéntico a Ángeles en el Cielo */}
            <div className="inline-block select-none">
              <img 
                src="/images/icons/plans/icon-plan-eterno.svg" 
                alt="Corazones de Ángel" 
                className="w-10 h-10 object-contain filter drop-shadow-[0_2px_4px_rgba(201,169,97,0.40)]" 
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

            {/* 11. CTA con el mismo color y texto que la tarjeta del mockup ("Conoce más →") */}
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
          PIE DE PÁGINA (FOOTER)
         ========================================================================= */}
      <footer className="mt-16 sm:mt-24 border-t border-[#F5E1CB] bg-[#FFF9F5] py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center space-y-6">
          
          <nav 
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-[#7A6B8A]"
            aria-label="Navegación secundaria"
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
          </nav>

          <div className="flex flex-col items-center gap-2 pt-2">
            <Link href="/" className="flex items-center gap-2 select-none group">
              <img 
                src="/images/icons/Logoheart.svg" 
                alt="Logotipo Ángeles en el Cielo" 
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <span 
                className="text-[#6B1D34] text-xl font-bold font-serif"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Ángeles en el Cielo
              </span>
            </Link>
            
            <p className="text-[11px] uppercase tracking-widest text-[#B84A68] font-semibold">
              PORQUE EL AMOR NUNCA SE DESPIDE
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#6B1D34] pt-1">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Instagram"
            >
              📸
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Facebook"
            >
              📘
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white transition-colors"
              aria-label="YouTube / TikTok"
            >
              ▶
            </a>
          </div>

          <p className="text-[11px] text-[#A69AA8]">
            © {new Date().getFullYear()} Ángeles en el Cielo · Todos los derechos reservados.
          </p>

        </div>
      </footer>

    </div>
  );
}
