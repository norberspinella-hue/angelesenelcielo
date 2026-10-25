'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PapelPicadoGarland } from '@/components/landing/PapelPicadoGarland';

export default function DiaDeMuertosPage() {
  // Form State
  const [petName, setPetName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'instagram' | 'tiktok'>('email');
  const [contactValue, setContactValue] = useState('');
  const [dedication, setDedication] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [authorizedSocials, setAuthorizedSocials] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!petName.trim()) {
      setErrorMessage('Por favor introduce el nombre de tu perrito o mascota.');
      return;
    }
    if (!contactValue.trim()) {
      setErrorMessage('Indícanos tu email o usuario para poder avisarte cuando esté publicado.');
      return;
    }
    if (!dedication.trim()) {
      setErrorMessage('Escribe unas palabras o un recuerdo especial para tu compañero.');
      return;
    }
    if (!authorizedSocials) {
      setErrorMessage('Debes marcar la casilla autorizando la publicación en el homenaje.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalPhotoUrl = '';

      // Si subió foto, primero la subimos a Supabase Storage
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const uploadRes = await fetch('/api/upload-pet-photo', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.originalUrl || uploadData.thumbnailUrl || '';
        } else {
          console.warn('No se pudo subir la foto a Supabase, se enviará sin imagen');
        }
      }

      // Enviar la historia completa a la API de campaña
      const res = await fetch('/api/campana-dia-de-muertos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName,
          guardianName,
          contactType,
          contactValue,
          dedication,
          photoUrl: finalPhotoUrl,
          authorizedSocials,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al enviar el recuerdo.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B071A] text-white selection:bg-[#F59E0B] selection:text-[#0B071A]">
      {/* Guirnalda de Papel Picado en cabecera */}
      <Header />

      {/* Hero Principal Especial */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Luces y resplandores celestiales de fondo */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#F59E0B]/20 via-[#EC4899]/15 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-40 right-10 w-[280px] h-[280px] bg-[#9333EA]/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge de Campaña */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#EC4899]/20 border border-[#F5C842]/40 text-[#FDE68A] text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm">
            <span>🕯️ Campaña Especial Día de Muertos</span>
            <span className="text-[#F59E0B]">✦</span>
            <span>25 de Octubre al 2 de Noviembre</span>
          </div>

          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF5] via-[#FDE68A] to-[#F59E0B] leading-[1.15] mb-6"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Hay amores que siempre encuentran el camino de vuelta
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-[#E9D5FF] font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
            Este Día de Muertos, encendamos una luz por quienes dejaron huellas eternas.
          </p>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Hay pequeños que se marchan de nuestros brazos, pero nunca de nuestra historia. Durante estos días queremos recordar sus nombres, sus miradas, sus travesuras y todos esos momentos que hicieron nuestra vida más bonita. Porque fueron mucho más que mascotas: fueron nuestra familia.
          </p>

          {/* Botones de acción rápida */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#formulario"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[#0B071A] text-base shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5"
              style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' }}
            >
              <span>⭐ Comparte su recuerdo</span>
              <span className="text-xs">›</span>
            </a>

            <a
              href="#chloe"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-semibold text-white/90 border border-white/20 hover:border-[#FDE68A]/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>🐾 Conoce la historia de Chloe</span>
            </a>
          </div>
        </div>
      </section>

      {/* Sección 1: La Historia de Chloe */}
      <section id="chloe" className="py-16 px-4 sm:px-6 relative border-t border-white/10 bg-[#120B26]/60">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            {/* Retrato de Chloe con aura dorada */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#F59E0B] via-[#EC4899] to-[#8B5CF6] rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#F5C842]/50 shadow-2xl bg-[#180A2D]">
                  <Image
                    src="/images/comunidad/chloe.jpg"
                    alt="Chloe · Ángeles en el Cielo"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B071A] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="text-[11px] uppercase tracking-widest text-[#FDE68A] font-semibold block mb-0.5">En su memoria</span>
                    <h3 className="text-xl font-bold text-white font-serif">Chloe</h3>
                    <p className="text-xs text-white/70">12 años de amor infinito</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto de la historia */}
            <div className="md:col-span-7 text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 text-[#F59E0B] text-xs uppercase font-bold tracking-widest">
                <span>✦ La chispa que inspira este cielo</span>
              </div>

              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFDF5] leading-tight"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Una historia de amor llamada Chloe
              </h2>

              <p className="text-base text-white/85 leading-relaxed font-light">
                Durante doce años, Chloe llenó una casa de pasos alegres, miradas cómplices y pequeños momentos de felicidad pura.
              </p>

              <p className="text-base text-white/85 leading-relaxed font-light">
                Su partida dejó un silencio inmenso, pero también la certeza de que el vínculo jamás desaparece. Su historia inspira este homenaje colectivo a todos los perritos y compañeritos que ya no están físicamente a nuestro lado, pero que siguen vivos en cada latido.
              </p>

              <blockquote className="border-l-2 border-[#F59E0B] pl-4 py-1 my-4 italic text-[#FDE68A] text-lg font-serif">
                «Chloe · El amor siempre sabe volver a casa»
              </blockquote>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20 flex items-center gap-3">
                <span className="text-2xl">🎬</span>
                <div className="text-xs sm:text-sm text-white/80">
                  <strong className="text-[#FDE68A] block">Homenaje Audiovisual en Producción</strong>
                  Estreno especial este 27 de octubre en nuestras redes sociales y aquí en la web.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sección 2: Las 3 Vías de Participación */}
      <section className="py-14 px-4 sm:px-6 bg-[#0B071A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-2xl sm:text-3xl font-bold text-[#FDE68A] mb-3"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            3 Formas de Compartir su Historia
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto mb-10">
            Participar en este homenaje conmemorativo es completamente gratuito. Elige la vía que te resulte más cómoda:
          </p>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {/* Vía 1: Web */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-[#F5C842]/30 hover:border-[#F5C842] transition-colors relative group">
              <div className="text-3xl mb-3">🌐</div>
              <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider block mb-1">Vía 1 · Directa</span>
              <h3 className="text-lg font-bold text-white mb-2">Formulario Web</h3>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                Sube su foto y dedicatoria aquí mismo. Recibirás confirmación y la posibilidad de descargar su postal.
              </p>
              <a href="#formulario" className="text-xs font-semibold text-[#FDE68A] hover:underline flex items-center gap-1">
                Ir al formulario abajo ↓
              </a>
            </div>

            {/* Vía 2: Instagram */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-pink-500/30 hover:border-pink-500 transition-colors relative group">
              <div className="text-3xl mb-3">📸</div>
              <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Vía 2 · Mensaje Privado</span>
              <h3 className="text-lg font-bold text-white mb-2">Instagram</h3>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                Envíanos un DM con la palabra <strong>HOMENAJE</strong>, la fotografía de tu perrito y sus años juntos.
              </p>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-semibold text-pink-300 hover:underline flex items-center gap-1"
              >
                Abrir Instagram ↗
              </a>
            </div>

            {/* Vía 3: TikTok */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-cyan-500/30 hover:border-cyan-500 transition-colors relative group">
              <div className="text-3xl mb-3">🎵</div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Vía 3 · Red Social</span>
              <h3 className="text-lg font-bold text-white mb-2">TikTok</h3>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                Déjanos un comentario o envíanos un mensaje privado con el nombre y recuerdo de tu angelito.
              </p>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-semibold text-cyan-300 hover:underline flex items-center gap-1"
              >
                Abrir TikTok ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Formulario Oficial de Campaña */}
      <section id="formulario" className="py-16 px-4 sm:px-6 relative bg-gradient-to-b from-[#120B26] to-[#0B071A]">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="text-3xl">⭐ 🕯️ 🐾</span>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFDF5] mt-2 mb-2"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Detrás de cada estrella hay una historia
            </h2>
            <p className="text-sm sm:text-base text-[#FDE68A]">
              Nos gustaría conocer a quien dejó una huella eterna en tu vida. ¿Cómo se llamaba tu pequeño?
            </p>
            <p className="text-xs text-white/60 mt-1">
              Participar en este homenaje conmemorativo es completamente gratuito. No requiere comprar ningún espacio en el mural.
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-[#180F33]/80 border border-[#F5C842]/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 text-3xl flex items-center justify-center mx-auto animate-bounce">
                  ✓
                </div>
                <h3 
                  className="text-2xl font-bold text-[#FDE68A]"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  ¡La historia de {petName} ha sido recibida!
                </h3>
                <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                  Gracias de corazón por confiar en nosotros su recuerdo. La cuidaremos con todo el amor y respeto para el homenaje conmemorativo. Te avisaremos cuando su estrella brille.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setPetName('');
                      setGuardianName('');
                      setContactValue('');
                      setDedication('');
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setAuthorizedSocials(false);
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    Compartir otra historia
                  </button>
                  <Link
                    href="/mural-global"
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-[#0B071A] bg-[#F59E0B] hover:bg-[#FBBF24] transition-colors"
                  >
                    Explorar el Mural de Ángeles ↗
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs sm:text-sm">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Nombre de la mascota */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#FDE68A] uppercase tracking-wider mb-2">
                    1. Nombre de tu angelito *
                  </label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Ej: Chloe, Toby, Nara, Luna..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#F5C842] text-sm"
                  />
                </div>

                {/* Nombre de la familia */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#FDE68A] uppercase tracking-wider mb-2">
                    2. Tu nombre o familia (opcional)
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Ej: Familia Gómez, Laura, Papás de Chloe..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#F5C842] text-sm"
                  />
                </div>

                {/* Vía de contacto para avisarle */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#FDE68A] uppercase tracking-wider mb-2">
                    3. ¿Por dónde prefieres que te avisemos cuando esté publicado? *
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setContactType('email')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        contactType === 'email'
                          ? 'bg-[#F59E0B]/20 border-[#F5C842] text-[#FDE68A]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      ✉️ Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType('instagram')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        contactType === 'instagram'
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      📸 Instagram
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType('tiktok')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        contactType === 'tiktok'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      🎵 TikTok
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={
                      contactType === 'email'
                        ? 'tu-correo@ejemplo.com'
                        : contactType === 'instagram'
                        ? '@tu_usuario_instagram'
                        : '@tu_usuario_tiktok'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#F5C842] text-sm"
                  />
                </div>

                {/* Dedicatoria */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#FDE68A] uppercase tracking-wider mb-2">
                    4. Su recuerdo o dedicatoria *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="Cuéntanos aquello que hacía único a tu pequeño, una anécdota entrañable o las palabras que siempre le dirás..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#F5C842] text-sm leading-relaxed"
                  />
                </div>

                {/* Subida de Fotografía */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#FDE68A] uppercase tracking-wider mb-2">
                    5. Fotografía de tu pequeño (opcional pero muy recomendada)
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="relative w-full p-4 rounded-xl bg-white/5 border border-[#F5C842]/40 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/20">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{photoFile?.name}</p>
                        <p className="text-[11px] text-[#FDE68A]">Foto cargada correctamente</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="text-white/60 hover:text-red-400 text-xs px-2 py-1"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-[#F5C842] rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
                    >
                      <span className="text-2xl block mb-1">📷</span>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">
                        Haz clic aquí para seleccionar su foto
                      </p>
                      <p className="text-[11px] text-white/40 mt-1">
                        Formatos JPG, PNG o WebP (máx. 20MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Checkbox de autorización */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={authorizedSocials}
                      onChange={(e) => setAuthorizedSocials(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-[#F59E0B] focus:ring-[#F59E0B]"
                    />
                    <span className="text-xs text-white/80 leading-relaxed">
                      Autorizo expresamente a incluir el nombre, dedicatoria y fotografía en el homenaje conmemorativo colectivo y en las redes sociales de Ángeles en el Cielo (participación totalmente gratuita sin compromiso comercial).
                    </span>
                  </label>
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full font-bold text-[#0B071A] text-base shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' }}
                >
                  {isSubmitting ? (
                    <span>Enviando historia con amor... 🕯️</span>
                  ) : (
                    <span>Enviar su historia al cielo ⭐</span>
                  )}
                </button>

                <p className="text-[11px] text-center text-white/60 leading-relaxed">
                  Recibimos historias para optar al gran vídeo homenaje del 2 de noviembre hasta el <strong>30 de octubre a las 20:00 h</strong>. La posibilidad de compartir historias y participar en la comunidad de Ángeles en el Cielo permanece abierta todo el año.
                </p>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* Sección 4: Comparativa de Recuerdos */}
      <section className="py-16 px-4 sm:px-6 bg-[#0B071A] border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFDF5]"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Dos formas de mantener viva su luz
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto mt-2">
              Unimos el cariño de una convocatoria abierta con la tranquilidad de un santuario que permanece en el tiempo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tarjeta 1: Gratuito Campaña */}
            <div className="rounded-2xl p-6 sm:p-8 bg-white/[0.03] border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#FDE68A] uppercase tracking-wider block mb-1">Iniciativa Comunitaria</span>
                <h3 className="text-xl font-bold text-white mb-4">Homenaje Gratuito de Campaña</h3>
                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Participación 100% gratuita en la convocatoria</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Posibilidad de aparecer en los homenajes colectivos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Descarga de postal conmemorativa digital</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">✦</span>
                    <span>Participación y recuerdo abierto todo el año</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <a href="#formulario" className="text-xs font-semibold text-[#FDE68A] hover:underline">
                  Participar en la convocatoria arriba ↑
                </a>
              </div>
            </div>

            {/* Tarjeta 2: Mural de Ángeles */}
            <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#1E113E] to-[#140A2B] border-2 border-[#F5C842]/50 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#F59E0B] text-[#0B071A] text-[10px] font-bold uppercase tracking-wider">
                Recuerdo Permanente
              </div>
              <div>
                <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block mb-1">Santuario Digital</span>
                <h3 className="text-xl font-bold text-white mb-4">Mural de Ángeles en el Cielo</h3>
                <ul className="space-y-3 text-sm text-white/85">
                  <li className="flex items-center gap-2">
                    <span className="text-[#F5C842]">★</span>
                    <span>Espacio individual con coordenadas fijas en el cielo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#F5C842]">★</span>
                    <span>Página memorial dedicada para compartir con la familia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#F5C842]">★</span>
                    <span>Certificado conmemorativo oficial en alta resolución</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#F5C842]">★</span>
                    <span>Permanencia garantizada más allá de la campaña</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/mural-global"
                  className="inline-block w-full py-3 rounded-full text-xs font-bold text-[#0B071A] bg-gradient-to-r from-[#FDE68A] to-[#F59E0B] hover:brightness-110 transition-all"
                >
                  Descubrir el Mural de Ángeles ↗
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sección 5: Corazones de Ángel (Protectoras) */}
      <section className="py-14 px-4 sm:px-6 bg-[#0E0821] border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-3xl mb-2 inline-block">🐾 🤍 🕊️</span>
          <h2 
            className="text-2xl font-bold text-[#FDE68A] mb-2"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Corazones de Ángel · Los que partieron sin hogar
          </h2>
          <p className="text-sm text-white/75 leading-relaxed max-w-2xl mx-auto mb-6">
            Durante este Día de Muertos también reservamos un lugar de amor puro para los perritos y gatitos de refugios y protectoras que fallecieron esperando una familia. Porque ningún corazón debe ser olvidado.
          </p>
          <Link
            href="/#corazones-de-angel"
            className="text-xs font-semibold text-[#FDE68A] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Conoce la iniciativa solidaria Corazones de Ángel</span>
            <span>↗</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
