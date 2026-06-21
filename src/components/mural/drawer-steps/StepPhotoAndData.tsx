import React from 'react';

interface StepPhotoAndDataProps {
  onNext: () => void;
  onBack: () => void;
  draftData: any;
  setDraftData: (data: any) => void;
  selectedPlan: string;
}

export function StepPhotoAndData({ onNext, onBack, draftData, setDraftData, selectedPlan }: StepPhotoAndDataProps) {
  const isFormValid = draftData.name && draftData.date;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 2 — Foto y datos</h2>
        <p className="text-sm text-[#706A95]">Completa los datos de tu angelito para iniciar su recuerdo.</p>
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

          <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-lg p-3 mt-auto">
            <label className="block text-xs font-bold text-[#1E2A78] mb-1">Plan seleccionado</label>
            <div className="text-sm text-[#1E2A78]">
              {selectedPlan === 'corazon_eterno' ? 'Corazón Eterno (9,99€)' : 
               selectedPlan === 'estrella_brillante' ? 'Estrella Brillante (4,99€/año)' : 
               'Huellita (1,99€)'}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Preview */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-bold text-[#1E2A78] mb-1">Preview de tu recuerdo</label>
          <div 
            className="flex-1 bg-[#F5E6D3] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#E5C88A]"
            style={{ backgroundImage: 'url("/images/mural%20preview/previewrecuerdo.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
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
