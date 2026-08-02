import React from 'react';

interface StepDataAndPreviewProps {
  onNext: () => void;
  onBack: () => void;
  draftData: any;
  setDraftData: (data: any) => void;
  selectedPlan: string;
}

export function StepDataAndPreview({ onNext, onBack, draftData, setDraftData, selectedPlan }: StepDataAndPreviewProps) {
  const isFormValid = draftData.name && draftData.date && draftData.rightsConfirmed;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 2 — Foto, datos, dedicatoria</h2>
        <p className="text-sm text-[#706A95]">Completa los datos de tu angelito y crea su recuerdo en el mural.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Columna Izquierda: Formulario */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Foto de tu angelito</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#1E2A78] transition-colors bg-gray-50">
              <div className="text-2xl mb-1">☁️</div>
              <div className="text-sm font-semibold text-[#1E2A78]">Subir foto</div>
              <div className="text-xs text-[#706A95]">JPG o PNG (máx 10MB)</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Nombre de tu angelito</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ej. Luna" 
                value={draftData.name || ''}
                onChange={(e) => setDraftData({ ...draftData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🐾</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Fecha</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="DD/MM/AAAA" 
                value={draftData.date || ''}
                onChange={(e) => setDraftData({ ...draftData, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
            </div>
          </div>

          <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-lg p-3">
            <label className="block text-xs font-bold text-[#1E2A78] mb-1">Plan seleccionado</label>
            <div className="text-sm text-[#1E2A78]">
              {selectedPlan === 'corazon_eterno' ? 'Corazón Eterno (9,99€)' : 
               selectedPlan === 'estrella_brillante' ? 'Estrella Brillante (4,99€/año)' : 
               'Huellita (1€)'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Dedicatoria (opcional)</label>
            <textarea 
              rows={3}
              placeholder="Un pequeño mensaje..."
              value={draftData.message || ''}
              onChange={(e) => setDraftData({ ...draftData, message: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none resize-none"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              className="mt-1"
              checked={draftData.rightsConfirmed || false}
              onChange={(e) => setDraftData({ ...draftData, rightsConfirmed: e.target.checked })}
            />
            <span className="text-xs text-[#706A95]">
              Confirmo que tengo los derechos sobre esta imagen y acepto las políticas de uso.
            </span>
          </label>
        </div>

        {/* Columna Derecha: Preview */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-bold text-[#1E2A78] mb-1">previsualización de tu recuerdo</label>
          <div className="flex-1 bg-[#F5E6D3] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#E5C88A]">
            {/* Halo y marco simulado */}
            <div className="w-24 h-24 rounded-full bg-white mb-4 border-4 border-[#C9A961] shadow-lg flex items-center justify-center overflow-hidden">
              <span className="text-4xl text-gray-300">🐾</span>
            </div>
            
            <h3 className="font-serif font-bold text-xl text-[#1E2A78] text-center mb-1">
              {draftData.name || 'Nombre'}
            </h3>
            <p className="text-xs text-[#706A95] mb-4 text-center">
              {draftData.date || 'DD/MM/AAAA'}
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl w-full text-center italic text-sm text-[#1E2A78]">
              "{draftData.message || 'Tu dedicatoria aparecerá aquí y será visible en el mural.'}"
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-4">
        <button 
          onClick={onBack}
          className="btn-secondary-heaven px-6"
        >
          ← Volver
        </button>
        <button 
          onClick={onNext}
          disabled={!isFormValid}
          className="btn-primary-heaven flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
