import React from 'react';

interface StepStoryProps {
  onNext: () => void;
  onBack: () => void;
  draftData: any;
  setDraftData: (data: any) => void;
}

export function StepStory({ onNext, onBack, draftData, setDraftData }: StepStoryProps) {
  const isFormValid = draftData.rightsConfirmed;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row gap-6 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Columna Izquierda: Formulario e Inspiración */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Cuéntanos su historia</h2>
            <p className="text-sm text-[#706A95]">Estas preguntas pueden ayudarte a encontrar las palabras.</p>
          </div>

          <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-xl p-4 mb-2">
            <ul className="text-sm text-[#1E2A78] space-y-2">
              <li className="flex gap-2"><span className="text-[#C9A961]">✦</span> ¿Cómo llegó a tu vida?</li>
              <li className="flex gap-2"><span className="text-[#C9A961]">✦</span> ¿Qué era lo que más le gustaba?</li>
              <li className="flex gap-2"><span className="text-[#C9A961]">✦</span> ¿Qué huella dejó en tu corazón?</li>
              <li className="flex gap-2"><span className="text-[#C9A961]">✦</span> ¿Qué le dirías si pudieras abrazarlo una vez más?</li>
            </ul>
          </div>

          <div className="h-[1px] bg-gray-100 my-2" />

          {/* Resumen de mascota con foto de Step 2 */}
          {(draftData.thumbnailUrl || draftData.photoUrl) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 18px',
              background: 'rgba(245,240,255,0.60)',
              borderRadius: 16,
              marginBottom: 20,
              border: '1px solid rgba(180,150,220,0.25)',
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(236,111,163,0.40)',
                flexShrink: 0,
              }}>
                <img
                  src={draftData.thumbnailUrl || draftData.photoUrl}
                  alt={draftData.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <p style={{
                  fontWeight: 700,
                  color: '#4A3F6B',
                  margin: 0,
                  fontSize: 16,
                  fontFamily: 'Georgia, serif',
                }}>
                  {draftData.name}
                </p>
                {draftData.petDate && (
                  <p style={{
                    color: '#9B8FB0',
                    margin: 0,
                    fontSize: 12,
                    fontFamily: 'sans-serif',
                  }}>
                    🌈 {new Date(draftData.petDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Dedicatoria (opcional)</label>
            <textarea 
              rows={4}
              placeholder="Escribe aquí lo que sientes... Deja que las preguntas te guíen."
              value={draftData.message || ''}
              onChange={(e) => setDraftData({ ...draftData, message: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none resize-none flex-1"
            />
          </div>

          {/* Campo opcional: Usuario de Instagram o TikTok */}
          <div className="mt-1">
            <label className="block text-xs font-bold text-[#1E2A78] mb-1">
              Tu usuario de Instagram o TikTok <span className="text-[#9B8FB0] font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#9B8FB0] font-semibold">@</span>
              <input 
                type="text"
                placeholder="tu_usuario"
                value={draftData.socialHandle || ''}
                onChange={(e) => setDraftData({ ...draftData, socialHandle: e.target.value.replace(/^@/, '').trim() })}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none"
              />
            </div>
            <p className="text-[11px] text-[#9B8FB0] mt-1 leading-snug">
              Para poder mencionarte y etiquetarte si compartimos el homenaje de tu angelito en nuestras redes sociales 🐾
            </p>
          </div>

          {/* Casilla obligatoria: Derechos y políticas */}
          <label className="flex items-start gap-2.5 cursor-pointer mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <input 
              type="checkbox" 
              className="mt-0.5 flex-shrink-0 rounded text-[#1E2A78] focus:ring-[#1E2A78]"
              checked={draftData.rightsConfirmed || false}
              onChange={(e) => setDraftData({ ...draftData, rightsConfirmed: e.target.checked })}
            />
            <span className="text-xs text-[#706A95] leading-relaxed">
              Confirmo que tengo los derechos sobre esta fotografía y acepto los <a href="/terminos" target="_blank" className="underline hover:text-[#1E2A78]">Términos</a> y la <a href="/privacidad" target="_blank" className="underline hover:text-[#1E2A78]">Política de Privacidad</a>. <strong className="text-rose-500">*</strong>
            </span>
          </label>

          {/* Casilla opcional: Difusión en Redes Sociales */}
          <label className="flex items-start gap-2.5 cursor-pointer mt-2 bg-[#FFF8F7] p-3 rounded-xl border border-[#F3DCE7] hover:border-[#E8B8CE] transition-colors">
            <input 
              type="checkbox" 
              className="mt-0.5 flex-shrink-0 rounded text-[#F65F8F] focus:ring-[#F65F8F]"
              checked={draftData.shareOnSocials || false}
              onChange={(e) => setDraftData({ ...draftData, shareOnSocials: e.target.checked })}
            />
            <span className="text-xs text-[#706A95] leading-relaxed">
              <strong className="text-[#25335F] font-semibold">Autorizo con amor</strong> compartir la foto y la dedicatoria de mi angelito en las redes sociales de Ángeles en el Cielo (Instagram, TikTok y Facebook) para rendirle homenaje y dar a conocer su historia a la comunidad. <span className="text-[#9B8FB0] font-normal">(Opcional)</span>
            </span>
          </label>
        </div>

        {/* Columna Derecha: Preview */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-bold text-[#1E2A78] mb-1 opacity-0">Preview</label>
          <div 
            className="flex-1 bg-[#F5E6D3] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#E5C88A]"
            style={{ backgroundImage: 'url("/images/mural%20preview/previewrecuerdo.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="w-24 h-24 rounded-full bg-white mb-4 border-4 border-[#C9A961] shadow-lg flex items-center justify-center overflow-hidden">
              {draftData.thumbnailUrl || draftData.photoUrl ? (
                <img
                  src={draftData.thumbnailUrl || draftData.photoUrl}
                  alt={draftData.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <span className="text-4xl text-gray-300">🐾</span>
              )}
            </div>
            
            <h3 className="font-serif font-bold text-xl text-[#1E2A78] text-center mb-1">
              {draftData.name || 'Nombre'}
            </h3>
            <p className="text-xs text-[#706A95] mb-4 text-center">
              {draftData.petDate 
                ? new Date(draftData.petDate).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })
                : ''}
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl w-full text-center italic text-sm text-[#1E2A78]">
              {draftData.message ? (
                `"${draftData.message}"`
              ) : (
                <span className="text-gray-400">"Tu dedicatoria aparecerá aquí..."</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-4">
        <button 
          onClick={onBack}
          className="btn-secondary-heaven btn-drawer-back px-6"
        >
          ← Volver
        </button>
        <button 
          onClick={onNext}
          disabled={!isFormValid}
          className="btn-primary-heaven btn-drawer-cta flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
