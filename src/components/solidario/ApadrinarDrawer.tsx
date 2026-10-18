'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface ShelterPet {
  id: string;
  name: string;
  shelterName: string;
  shelterCity: string;
  photoUrl: string;
  storyPreview?: string;
  starsCount?: number;
}

// Lista inicial de angelitos piloto de protectoras (MVP para lanzamiento inmediato)
export const DEFAULT_SHELTER_PETS: ShelterPet[] = [
  {
    id: 'shelter_juliette',
    name: 'Juliette',
    shelterName: 'Refugio Nueva Vida',
    shelterCity: 'Valencia',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg',
    storyPreview: 'Rescatada tras 8 años, partió rodeada de cariño y paz en el refugio.',
    starsCount: 1,
  },
  {
    id: 'shelter_rocky',
    name: 'Rocky',
    shelterName: 'Huellas con Esperanza',
    shelterCity: 'Madrid',
    photoUrl: '/images/placeholders/two.webp',
    storyPreview: 'El guardián noble y paciente de todos los cachorros rescatados.',
    starsCount: 1,
  },
  {
    id: 'shelter_galleta',
    name: 'Galleta',
    shelterName: 'Asociación Alma Canina',
    shelterCity: 'Sevilla',
    photoUrl: '/images/placeholders/three.webp',
    storyPreview: 'Alegre, juguetona y dulce, su mirada iluminaba cada rincón del refugio.',
    starsCount: 1,
  },
];

interface ApadrinarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPet?: ShelterPet | null;
}

export function ApadrinarDrawer({ isOpen, onClose, preSelectedPet }: ApadrinarDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPet, setSelectedPet] = useState<ShelterPet>(preSelectedPet || DEFAULT_SHELTER_PETS[0]);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [isMemorial, setIsMemorial] = useState(false);
  const [sponsorPetName, setSponsorPetName] = useState('');
  const [dedication, setDedication] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preSelectedPet) {
      setSelectedPet(preSelectedPet);
      setStep(2); // Si ya viene preseleccionado desde el mural, va directo a la dedicatoria
    }
  }, [preSelectedPet]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTimeout(() => {
      setStep(1);
      setErrorMessage('');
      setLoading(false);
    }, 300);
    onClose();
  };

  const handleCheckout = async () => {
    if (!sponsorEmail.trim() || !sponsorEmail.includes('@')) {
      setErrorMessage('Por favor introduce un correo electrónico válido para enviarte el certificado.');
      return;
    }
    if (!sponsorName.trim()) {
      setErrorMessage('Por favor indícanos tu nombre o el de tu familia.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'corazon_eterno', // Plan de 9 estrellas (Constelación 3x3 · 9,99 €)
          slotId: 'auto',
          petName: selectedPet.name,
          email: sponsorEmail.trim(),
          photoUrl: selectedPet.photoUrl,
          thumbnailUrl: selectedPet.photoUrl,
          species: 'perro',
          dedication: dedication.trim() || `Apadrinado con infinito amor por ${sponsorName.trim()}`,
          isSponsorship: true,
          sponsorName: sponsorName.trim(),
          sponsorPetName: isMemorial ? sponsorPetName.trim() : '',
          shelterName: `${selectedPet.shelterName} (${selectedPet.shelterCity})`,
          sponsoredPetId: selectedPet.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || 'No se pudo iniciar la sesión de pago.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error en checkout de apadrinamiento:', err);
      setErrorMessage('Ocurrió un error al conectar con la pasarela de pago.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-end">
      {/* Overlay oscuro difuminado detrás del drawer */}
      <div 
        className="absolute inset-0 bg-[#394B87]/20 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" 
        onClick={handleClose}
      />
      
      {/* Panel deslizable desde la derecha (Mismo diseño exacto de MuralDrawer) */}
      <div className="relative pointer-events-auto h-full bg-white shadow-2xl rounded-l-[16px] overflow-hidden flex flex-row animate-in slide-in-from-right duration-300 border-l border-white/50 w-[98vw] max-w-[1800px]">
        
        {/* Botón Cerrar X */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#1E2A78] transition-colors z-50 cursor-pointer"
          aria-label="Cerrar ventana"
        >
          ✕
        </button>

        {/* ============================================================== */}
        {/* COLUMNA IZQUIERDA: HERO EMOCIONAL CON FOTO A SANGRE (DESKTOP)   */}
        {/* ============================================================== */}
        <div className="hidden md:block flex-1 h-full relative shrink-0" style={{ borderRadius: '16px 0 0 16px', overflow: 'hidden' }}>
          <img 
            src="/images/mascota-emotiva.webp"
            alt="Mascota en el cielo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }}
          />
          
          <div 
            className="absolute pointer-events-none" 
            style={{ 
              top: '36%', 
              left: '4%', 
              transform: 'translate(-5%, -50%)', 
              width: 'min(85%, 520px)',
              textAlign: 'center'
            }}
          >
            {/* Fondo difuminado radial detrás del texto */}
            <div 
              className="absolute inset-[-60px] -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(255,248,240,0.85) 0%, rgba(255,248,240,0.5) 45%, transparent 75%)',
                filter: 'blur(25px)',
                borderRadius: '50%'
              }}
            />
            
            {/* Icono Logoheart con aureola */}
            <div className="flex justify-center mb-[18px] opacity-90 drop-shadow-md">
              <img 
                src="/images/icons/Logoheart.svg" 
                alt="Corazón de Ángeles" 
                className="h-[95px] w-auto object-contain"
              />
            </div>

            <h2 
              style={{ 
                fontFamily: 'var(--font-display), Georgia, serif', 
                fontSize: 'clamp(30px, 3.2vw, 44px)', 
                lineHeight: '1.18',
                fontWeight: 700, 
                background: 'linear-gradient(to right, #151D54, #A393C4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
              }}
            >
              Un puente de amor<br/>
              para quien más<br/>
              lo necesita
            </h2>

            <div className="flex items-center justify-center gap-4 mb-5">
              <div style={{ flexBasis: '64px', height: '0', borderTop: '1px solid rgba(201, 169, 97, 0.5)' }}></div>
              <span className="text-[#C9A961] text-lg">✦</span>
              <div style={{ flexBasis: '64px', height: '0', borderTop: '1px solid rgba(201, 169, 97, 0.5)' }}></div>
            </div>

            <p 
              style={{ 
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(15px, 1.6vw, 19px)', 
                lineHeight: '1.5',
                color: '#2A365C', 
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              Al apadrinar su constelación 3×3, el <strong>50% del importe</strong> se destina como donación directa al refugio para alimentar y cuidar a los perros que aún esperan adopción.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA: FLUJO EN 2 PASOS (STEPPER + FORMULARIO)        */}
        {/* ============================================================== */}
        <div className="flex flex-col w-full md:w-[500px] lg:w-[550px] shrink-0 h-full relative z-10 p-6 md:p-8 overflow-y-auto">
          
          {/* Cabecera del Drawer */}
          <div className="flex items-center gap-2.5 mb-4">
            <img 
              src="/images/icons/badge-alas-angel.webp" 
              alt="Corazones de Ángel" 
              className="w-7 h-7 object-contain" 
            />
            <span className="font-bold text-[#1E2A78] text-base">Corazones de Ángel · Apadrinamiento</span>
          </div>

          {/* Stepper de 2 Pasos */}
          <div className="flex items-center justify-between w-full max-w-[340px] mb-6 relative">
            <div className="absolute top-3 left-6 right-6 h-[2px] bg-gray-200 z-0" />
            
            {/* Paso 1 */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step > 1 ? 'bg-emerald-600 text-white' : 'bg-[#1E2A78] text-white ring-4 ring-[#1E2A78]/20'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-[10px] font-semibold text-[#1E2A78]">Elige Angelito</span>
            </div>

            {/* Paso 2 */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step === 2 ? 'bg-[#1E2A78] text-white ring-4 ring-[#1E2A78]/20' : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span className={`text-[10px] font-semibold ${step === 2 ? 'text-[#1E2A78]' : 'text-gray-400'}`}>
                Dedicatoria & 50%
              </span>
            </div>
          </div>

          {/* CONTENIDO PASO 1: SELECCIONAR PERRITO */}
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#1E2A78] font-serif mb-1">
                  ¿A qué angelito deseas apadrinar?
                </h3>
                <p className="text-xs text-[#706A95] leading-relaxed">
                  Estos perritos fueron rescatados por protectoras y tienen una estrella reservada en el mural, esperando a que alguien encienda sus 9 estrellas completas.
                </p>
              </div>

              {/* Lista de perritos de protectoras */}
              <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-1">
                {DEFAULT_SHELTER_PETS.map((pet) => {
                  const isSelected = selectedPet.id === pet.id;
                  return (
                    <div
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 relative ${
                        isSelected 
                          ? 'border-[#F59E0B] bg-[#FFFDF5] shadow-md scale-[1.01]' 
                          : 'border-gray-200 bg-white hover:border-[#D5CAE6] hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-xs relative">
                        <img 
                          src={pet.photoUrl} 
                          alt={pet.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-sm text-[#1E2A78] truncate">{pet.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 shrink-0">
                            ⭐ Constelación 3×3
                          </span>
                        </div>
                        <span className="text-xs text-[#5D4E75] block truncate">
                          {pet.shelterName} · {pet.shelterCity}
                        </span>
                        {pet.storyPreview && (
                          <p className="text-[11px] text-gray-500 italic mt-0.5 line-clamp-1">
                            "{pet.storyPreview}"
                          </p>
                        )}
                      </div>

                      {/* Check icon */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-[#F59E0B] text-white' : 'border border-gray-300 text-transparent'
                      }`}>
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-full text-[#180A2D] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
                  boxShadow: '0 8px 20px -2px rgba(245, 158, 11, 0.4)'
                }}
              >
                <span>Continuar con {selectedPet.name}</span>
                <span className="text-base">→</span>
              </button>
            </div>
          )}

          {/* CONTENIDO PASO 2: DEDICATORIA, FORMULARIO Y CHECKOUT */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Botón Volver al Paso 1 */}
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#706A95] hover:text-[#1E2A78] font-semibold flex items-center gap-1 mb-3 self-start cursor-pointer"
              >
                <span>← Cambiar de angelito</span>
              </button>

              {/* Ficha Resumen del Angelito Seleccionado */}
              <div className="bg-gradient-to-r from-pink-50/80 via-purple-50/50 to-amber-50/50 border border-pink-200/90 rounded-2xl p-3 flex items-center gap-3 mb-4 shadow-xs">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 shrink-0 relative">
                  <img src={selectedPet.photoUrl} alt={selectedPet.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img src="/images/icons/badge-alas-angel.webp" alt="Corazón de Ángel" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block">Corazón de Ángel</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1E2A78]">{selectedPet.name}</h4>
                  <span className="text-[11px] text-[#5D4E75] truncate block">{selectedPet.shelterName} · {selectedPet.shelterCity}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-pink-700 block">9 Estrellas</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">50% Donación</span>
                </div>
              </div>

              {/* Formulario del Donante */}
              <div className="space-y-3.5 mb-5 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Tu Nombre o el de tu Familia: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Familia Gómez Martí, Laura, Carlos..."
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] text-xs text-[#1E2A78] focus:border-[#7C3AED] focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Tu Correo Electrónico: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={sponsorEmail}
                    onChange={(e) => setSponsorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CAE6] text-xs text-[#1E2A78] focus:border-[#7C3AED] focus:outline-none bg-white"
                  />
                  <span className="text-[10px] text-[#706A95] mt-0.5 block">Aquí te enviaremos el Certificado Oficial y el comprobante.</span>
                </div>

                {/* Casilla Emocional Clave: Apadrinar en memoria de propia mascota */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/70 to-pink-50/70 border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isMemorial}
                      onChange={(e) => setIsMemorial(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold text-[#1E2A78]">
                      🕊️ Deseo apadrinar en memoria de mi propia mascota
                    </span>
                  </label>

                  {isMemorial && (
                    <div className="mt-2.5">
                      <label className="text-[11px] text-gray-700 block mb-1">
                        Nombre de tu angelito en el cielo:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Max, Toby, Luna..."
                        value={sponsorPetName}
                        onChange={(e) => setSponsorPetName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 focus:border-amber-500 focus:outline-none bg-white"
                      />
                      <span className="text-[10px] text-amber-800 italic mt-1 block">
                        ✦ Ambos nombres quedarán unidos con amor en la placa pública del mural.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E2A78] mb-1">
                    Dedicatoria que aparecerá en su ficha (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Escribe unas palabras de cariño para que brillen junto a sus estrellas..."
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CAE6] text-xs text-[#1E2A78] focus:border-[#7C3AED] focus:outline-none bg-white resize-none"
                  />
                </div>

                {/* Ticket Transparente del Split Solidario 50% */}
                <div className="rounded-xl p-3.5 bg-gradient-to-br from-[#FFFBEB] to-[#F5EEFF] border border-[#F59E0B]/50 shadow-xs space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Constelación 3×3 (9 Estrellas Perpetuas)</span>
                    <span className="font-bold">9,99 €</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    <span>💖 50% Donación directa a {selectedPet.shelterName}:</span>
                    <span>5,00 €</span>
                  </div>
                  <div className="flex justify-between text-xs text-purple-800 font-semibold">
                    <span>🏅 Distintivo Ángel con Corazón de Perrito:</span>
                    <span className="text-amber-600 font-bold">INCLUIDO ✓</span>
                  </div>
                  <div className="border-t border-amber-200/70 pt-2 flex justify-between items-center text-sm font-bold text-[#1E2A78]">
                    <span>Total aportación única:</span>
                    <span className="text-base text-amber-600 font-extrabold">9,99 €</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                    ⚠️ {errorMessage}
                  </div>
                )}
              </div>

              {/* Botón Stripe Checkout */}
              <button
                disabled={loading}
                onClick={handleCheckout}
                className="w-full py-3.5 px-6 rounded-full text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 20px -2px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>{loading ? 'Preparando pasarela segura...' : `Completar Apadrinamiento y Donar 5,00 € →`}</span>
              </button>

              <span className="text-[10px] text-center text-gray-400 block mt-2">
                🔒 Pago seguro con tarjeta y Stripe · Sin suscripciones recurrentes · Certificado conmemorativo inmediato
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
