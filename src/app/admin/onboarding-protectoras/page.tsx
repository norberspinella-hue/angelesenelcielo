'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecentShelterPet {
  id: string;
  pet_name: string;
  species: string;
  breed?: string;
  photo_url?: string;
  dedication?: string;
  slot_assigned?: string;
  created_at: string;
  story_answers?: {
    shelterName?: string;
    shelterCity?: string;
    storyPreview?: string;
    isSponsored?: boolean;
    sponsorName?: string;
  };
}

export default function OnboardingProtectorasPage() {
  // Estado del formulario
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('perro');
  const [breed, setBreed] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [shelterCity, setShelterCity] = useState('');
  const [shelterContact, setShelterContact] = useState('');
  const [storyPreview, setStoryPreview] = useState('');
  const [status, setStatus] = useState<'disponible_apadrinar' | 'ya_apadrinado'>('disponible_apadrinar');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPetName, setSponsorPetName] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('');

  // Foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [directPhotoUrl, setDirectPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCreatedMuralUrl, setLastCreatedMuralUrl] = useState<string | null>(null);
  const [recentPets, setRecentPets] = useState<RecentShelterPet[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Cargar angelitos recientes
  const loadRecentPets = async () => {
    try {
      setLoadingRecent(true);
      const res = await fetch('/api/admin/onboarding-protectora');
      const data = await res.json();
      if (data.success && data.shelterPets) {
        setRecentPets(data.shelterPets);
      }
    } catch (err) {
      console.error('Error cargando angelitos recientes:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadRecentPets();
  }, []);

  // Manejo de archivo de imagen
  const handleFileChange = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLastCreatedMuralUrl(null);

    if (!petName.trim()) {
      setErrorMessage('Por favor, indica el nombre del angelito.');
      return;
    }
    if (!shelterName.trim()) {
      setErrorMessage('Por favor, indica el nombre del refugio o protectora.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('petName', petName.trim());
      formData.append('species', species);
      formData.append('breed', breed.trim());
      formData.append('shelterName', shelterName.trim());
      formData.append('shelterCity', shelterCity.trim());
      formData.append('shelterContact', shelterContact.trim());
      formData.append('storyPreview', storyPreview.trim());
      formData.append('status', status);
      formData.append('sponsorName', sponsorName.trim());
      formData.append('sponsorPetName', sponsorPetName.trim());
      formData.append('preferredSlot', preferredSlot.trim());

      if (photoFile) {
        formData.append('photoFile', photoFile);
      } else if (directPhotoUrl.trim()) {
        formData.append('photoUrl', directPhotoUrl.trim());
      }

      const res = await fetch('/api/admin/onboarding-protectora', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al guardar el angelito');
      }

      setSuccessMessage(`¡${petName} ha sido dado de alta con éxito en el slot (${data.coords?.x}, ${data.coords?.y})!`);
      if (data.muralUrl) {
        setLastCreatedMuralUrl(data.muralUrl);
      }

      // Limpiar formulario básico para el siguiente angelito
      setPetName('');
      setBreed('');
      setStoryPreview('');
      setPhotoFile(null);
      setPhotoPreview('');
      setDirectPhotoUrl('');
      setSponsorName('');
      setSponsorPetName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Recargar lista reciente
      loadRecentPets();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDFB] via-[#FDF7F9] to-[#F7EFF5] text-slate-800 antialiased p-4 sm:p-8 font-sans">
      
      <div className="max-w-[1100px] mx-auto space-y-8">

        {/* ============================================================== */}
        {/* CABECERA PRINCIPAL CON EL LOGO GHIBLI CORAZONES DE ÁNGEL      */}
        {/* ============================================================== */}
        <header className="bg-white/95 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            
            {/* Logo Alas Ghibli con Corazón Rosa */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-pink-50/80 border-2 border-pink-300 p-2 flex items-center justify-center shrink-0 shadow-md">
              <img 
                src="/images/icons/badge-alas-angel.webp" 
                alt="Corazones de Ángel" 
                className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(244,114,182,0.45)]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-300">
                  💖 Panel de Onboarding
                </span>
                <span className="text-xs text-amber-700 font-bold hidden sm:inline">
                  Corazones de Ángel · Solidario
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-[#1E2A78] font-serif leading-tight">
                Alta Manual de Angelitos de Protectora
              </h1>
              <p className="text-xs sm:text-sm text-[#706A95] mt-1 max-w-[620px]">
                Registra fácilmente los perritos y gatitos recibidos por WhatsApp o email de refugios colaboradores para iluminar sus constelaciones en el mural global.
              </p>
            </div>
          </div>

          {/* Enlaces de administración */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/certificados"
              className="px-4 py-2.5 rounded-full text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>📜 Certificados & Fundadores</span>
            </Link>
            <Link
              href="/admin/moderacion"
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#BE185D] bg-pink-50 hover:bg-pink-100 border border-pink-300 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>🛡️ Moderación</span>
            </Link>
            <Link
              href="/mural-global"
              target="_blank"
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#1E2A78] bg-pink-50 hover:bg-pink-100 border border-pink-300 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>🌌 Ver Mural Global</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        {/* Mensajes de Estado */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span><strong>{successMessage}</strong></span>
            </div>
            {lastCreatedMuralUrl && (
              <Link
                href={lastCreatedMuralUrl}
                target="_blank"
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0"
              >
                Ver en el Mural →
              </Link>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
            <span className="text-lg">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* CONTENEDOR PRINCIPAL: FORMULARIO + SIDEBAR CON TARJETA 3       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: EL FORMULARIO (8 COLS) */}
          <form 
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white/95 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
          >
            
            {/* 1. DATOS DEL ANGELITO */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-100">
                <span className="text-lg">🐾</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E2A78]">
                  1. Datos del Angelito
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Nombre del Angelito <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juliette, Rocky, Galleta..."
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Especie
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  >
                    <option value="perro">🐶 Perro</option>
                    <option value="gato">🐱 Gato</option>
                    <option value="otro">🐾 Otro compañero</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Raza o Mestizo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mestizo, Galgo español, Podenco..."
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  />
                </div>
              </div>
            </div>

            {/* 2. DATOS DE LA PROTECTORA */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-100">
                <span className="text-lg">🏡</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E2A78]">
                  2. Protectora o Refugio Colaborador
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Nombre del Refugio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Refugio Nueva Vida"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Ciudad / Provincia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Valencia, Sevilla, Madrid..."
                    value={shelterCity}
                    onChange={(e) => setShelterCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Contacto interno (Teléfono / WhatsApp / Email)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +34 600 000 000 / contacto@refugio.org"
                    value={shelterContact}
                    onChange={(e) => setShelterContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE]"
                  />
                </div>
              </div>
            </div>

            {/* 3. HISTORIA & DEDICATORIA */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-100">
                <span className="text-lg">💌</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E2A78]">
                  3. Su Historia & Dedicatoria
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                  Texto emotivo enviado por la protectora
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Rescatada tras 8 años, partió rodeada de cariño y paz. Espera un padrino para sus 9 estrellas perpetuas..."
                  value={storyPreview}
                  onChange={(e) => setStoryPreview(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-[#FFFDFE] resize-none"
                />
              </div>
            </div>

            {/* 4. FOTO DEL ANGELITO */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-100">
                <span className="text-lg">📷</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E2A78]">
                  4. Fotografía del Angelito
                </h2>
              </div>

              {/* Zona de Arrastrar y Soltar */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-pink-300 hover:border-pink-500 bg-[#FFFDFE] hover:bg-pink-50/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />

                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-400 shadow-md">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Cambiar
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl shadow-xs">
                      📸
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1E2A78] block">
                        Haz clic o arrastra la foto del animalito aquí
                      </span>
                      <span className="text-[11px] text-[#706A95]">
                        Soporta JPG, PNG y WebP (hasta 20MB)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* O URL directa */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#706A95] mb-1">
                  O pega una URL directa de la foto (opcional si no subes archivo):
                </label>
                <input
                  type="url"
                  placeholder="https://... /foto.jpg"
                  value={directPhotoUrl}
                  onChange={(e) => {
                    setDirectPhotoUrl(e.target.value);
                    if (!photoFile) setPhotoPreview(e.target.value);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs text-[#1E2A78] focus:border-pink-500 focus:outline-none bg-[#FFFDFE]"
                />
              </div>
            </div>

            {/* 5. ESTADO EN EL MURAL */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-100">
                <span className="text-lg">⭐</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E2A78]">
                  5. Estado Inicial en el Mural
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  status === 'disponible_apadrinar' 
                    ? 'border-pink-400 bg-pink-50/70 shadow-xs' 
                    : 'border-pink-100 bg-white hover:bg-pink-50/30'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'disponible_apadrinar'}
                    onChange={() => setStatus('disponible_apadrinar')}
                    className="mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1E2A78] block">
                      ⏳ Disponible para Apadrinar
                    </span>
                    <span className="text-[11px] text-[#706A95] leading-snug block mt-0.5">
                      1 estrella encendida por la protectora; 8 estrellas esperando padrino solidario.
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  status === 'ya_apadrinado' 
                    ? 'border-pink-400 bg-pink-50/70 shadow-xs' 
                    : 'border-pink-100 bg-white hover:bg-pink-50/30'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'ya_apadrinado'}
                    onChange={() => setStatus('ya_apadrinado')}
                    className="mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1E2A78] block">
                      💖 Ya Apadrinado
                    </span>
                    <span className="text-[11px] text-[#706A95] leading-snug block mt-0.5">
                      Las 9 estrellas encendidas con los datos de la familia o padrino solidario.
                    </span>
                  </div>
                </label>
              </div>

              {/* Si ya está apadrinado, pedir datos del padrino */}
              {status === 'ya_apadrinado' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-pink-50/60 border border-pink-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                      Nombre del Padrino o Familia:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Familia Gómez, Laura..."
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs text-[#1E2A78] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                      En memoria de su mascota (opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Toby, Luna..."
                      value={sponsorPetName}
                      onChange={(e) => setSponsorPetName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs text-[#1E2A78] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN CTA PRINCIPAL */}
            <div className="pt-4 border-t border-pink-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(244,114,182,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en el Mural Celestial...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Dar de Alta en el Mural Celestial</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* COLUMNA DERECHA: SIDEBAR CON IMAGEN TARJETA 3 & LIVE PREVIEW (4 COLS) */}
          <aside className="lg:col-span-5 space-y-6">
            
            {/* TARJETA 3 OFICIAL: RECONOCIMIENTO CORAZÓN DE ÁNGEL */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-5 shadow-xl text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-300">
                  💖 Iniciativa Solidaria
                </span>
              </div>
              <h3 className="font-serif font-black text-base text-[#1E2A78] mb-1">
                Corazones de Ángel
              </h3>
              <p className="text-xs text-[#706A95] leading-relaxed mb-4">
                Hasta 5 angelitos gratuitos por cada protectora colaboradora para preservar su historia y luz para siempre.
              </p>

              {/* Imagen Oficial de la Tarjeta 3 */}
              <div className="w-full max-w-[200px] aspect-square mx-auto rounded-2xl overflow-hidden border border-pink-200 shadow-md relative bg-white/70">
                <Image
                  src="/images/solidario/tarjeta3-220x220.webp"
                  alt="Reconocimiento Corazón de Ángel"
                  width={220}
                  height={220}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-pink-100 text-left text-xs text-[#706A95] space-y-1.5">
                <div className="flex items-center gap-2 text-pink-700 font-bold">
                  <span>✓</span> <span>Constelación 3×3 reservada en el mural</span>
                </div>
                <div className="flex items-center gap-2 text-pink-700 font-bold">
                  <span>✓</span> <span>Emblema Studio Ghibli con corazón rosa</span>
                </div>
                <div className="flex items-center gap-2 text-pink-700 font-bold">
                  <span>✓</span> <span>50% solidario al formalizar apadrinamiento</span>
                </div>
              </div>
            </div>

            {/* PREVISUALIZACIÓN EN VIVO (LIVE PREVIEW) */}
            <div className="bg-gradient-to-b from-pink-50/80 to-purple-50/50 border-2 border-pink-200/90 rounded-3xl p-5 shadow-sm text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-700 mb-2 block">
                👀 Previsualización en Vivo de la Ficha
              </span>

              <div className="bg-white rounded-2xl p-4 border border-pink-200 shadow-md max-w-[280px] mx-auto text-center relative">
                
                {/* Foto con el Emblema Ghibli en la esquina */}
                <div className="w-20 h-20 rounded-full border-3 border-pink-300 overflow-hidden mx-auto mb-2 shadow-sm relative bg-pink-50">
                  <img 
                    src={photoPreview || directPhotoUrl || '/images/placeholders/first.webp'} 
                    alt={petName || 'Angelito'} 
                    className="w-full h-full object-cover"
                  />
                  <img 
                    src="/images/icons/badge-alas-angel.webp" 
                    alt="Alas" 
                    className="absolute -bottom-1 -right-1 w-7 h-7 object-contain drop-shadow" 
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 mb-1">
                  <img src="/images/icons/badge-alas-angel.webp" className="w-3.5 h-3.5 object-contain" alt="Alas" />
                  <span className="text-[10px] font-black text-pink-800">CORAZÓN DE ÁNGEL</span>
                </div>

                <h4 className="font-serif font-black text-base text-[#1E2A78] leading-tight">
                  {petName || 'Nombre del Angelito'}
                </h4>
                <p className="text-xs text-[#5D4E75] mb-2 font-medium">
                  {shelterName || 'Nombre del Refugio'} {shelterCity ? `· ${shelterCity}` : ''}
                </p>

                <div className="text-[11px] text-gray-700 bg-pink-50/60 p-2 rounded-xl border border-pink-100 text-left italic line-clamp-3">
                  "{storyPreview || 'Historia del angelito...'}"
                </div>

                <div className="mt-3 pt-2 border-t border-pink-100 flex items-center justify-between text-[11px] font-bold text-pink-900">
                  <span>⭐ 9 Estrellas</span>
                  <span className="text-emerald-700">50% Donación</span>
                </div>
              </div>
            </div>

          </aside>

        </div>

        {/* ============================================================== */}
        {/* TABLA DE ANGELITOS DADOS DE ALTA RECIENTEMENTE                 */}
        {/* ============================================================== */}
        <section className="bg-white/95 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="text-base font-extrabold text-[#1E2A78]">
                Angelitos de Protectora Dados de Alta ({recentPets.length})
              </h2>
            </div>
            <button
              onClick={loadRecentPets}
              className="text-xs text-pink-700 hover:text-pink-900 font-bold underline cursor-pointer"
            >
              🔄 Actualizar lista
            </button>
          </div>

          {loadingRecent ? (
            <div className="py-8 text-center text-xs text-[#706A95]">
              Cargando angelitos registrados...
            </div>
          ) : recentPets.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#706A95]">
              Aún no hay angelitos registrados en la base de datos con este panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentPets.map((pet) => {
                const [x, y] = (pet.slot_assigned || '').split(',');
                return (
                  <div 
                    key={pet.id}
                    className="p-3.5 rounded-2xl border border-pink-200 bg-[#FFFDFE] hover:shadow-md transition-all flex items-center gap-3.5"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-300 shrink-0 relative bg-pink-50">
                      <img 
                        src={pet.photo_url || '/images/placeholders/first.webp'} 
                        alt={pet.pet_name} 
                        className="w-full h-full object-cover" 
                      />
                      <img 
                        src="/images/icons/badge-alas-angel.webp" 
                        alt="Alas" 
                        className="absolute bottom-0 right-0 w-5 h-5 object-contain" 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-[#1E2A78] truncate">{pet.pet_name}</h4>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-pink-100 text-pink-800 shrink-0">
                          {pet.species}
                        </span>
                      </div>
                      <span className="text-xs text-[#5D4E75] block truncate">
                        {pet.story_answers?.shelterName || 'Refugio'}
                      </span>
                      {pet.slot_assigned && (
                        <Link
                          href={`/mural-global?highlight=${x},${y}&zoom=true`}
                          target="_blank"
                          className="text-[11px] font-bold text-pink-700 hover:text-pink-900 underline block mt-0.5"
                        >
                          Slot ({x}, {y}) en Mural →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
