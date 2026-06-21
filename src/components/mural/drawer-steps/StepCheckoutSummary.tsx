import React from 'react';

interface StepCheckoutSummaryProps {
  onBack: () => void;
  onCheckout: () => void;
  draftData: any;
  selectedPlan: string;
}

export function StepCheckoutSummary({ onBack, onCheckout, draftData, selectedPlan }: StepCheckoutSummaryProps) {
  
  const getPlanDetails = () => {
    switch(selectedPlan) {
      case 'corazon_eterno': return { title: 'Corazón Eterno', price: '9,99 €', duration: 'Para siempre', slots: '9 slots' };
      case 'estrella_brillante': return { title: 'Estrella Brillante', price: '4,99 €', duration: 'Para siempre', slots: '4 slots' };
      default: return { title: 'Huellita', price: '1,99 €/año', duration: '1 año', slots: '1 slot' };
    }
  };

  const plan = getPlanDetails();

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 3 — Checkout Seguro</h2>
        <p className="text-sm text-[#706A95]">Estás a un paso de completar tu homenaje. Revisa tu selección.</p>
      </div>

      <div className="flex flex-col gap-4 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Resumen del plan */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-[#C9A961]">
             <span className="text-2xl">🐾</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1E2A78] mb-1">{plan.title}</h3>
            <div className="flex gap-4 text-xs text-[#706A95]">
              <div>👤 <span className="font-semibold text-[#1E2A78]">{plan.price}</span></div>
              <div>📅 <span className="font-semibold text-[#1E2A78]">{plan.slots}</span></div>
              <div>⏱ <span className="font-semibold text-[#1E2A78]">{plan.duration}</span></div>
            </div>
          </div>
        </div>

        {/* Resumen de dedicatoria */}
        <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-2xl p-4">
          <h4 className="text-xs font-bold text-[#1E2A78] mb-2 uppercase tracking-wider">Dedicatoria para {draftData.name}</h4>
          <p className="text-sm text-[#1E2A78] italic">"{draftData.message || 'Sin mensaje'}" ✨</p>
        </div>

        {/* Bloque Stripe */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mt-4">
          <div className="text-[#1E2A78] text-2xl mb-2">🔒</div>
          <h4 className="font-bold text-[#1E2A78] mb-2">Pago seguro con Stripe</h4>
          <p className="text-xs text-[#706A95] mb-4">
            Serás redirigido a Stripe Checkout para completar tu pago de forma segura.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            <span>🔐 Cifrado</span>
            <span>•</span>
            <span>🛡 Protegido</span>
            <span>•</span>
            <span>✓ 100% Seguro</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
        <button 
          onClick={onCheckout}
          className="bg-[#1E2A78] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[#151C5C] hover:shadow-lg transition-all w-full flex items-center justify-center gap-2"
        >
          Ir a Stripe Checkout ↗
        </button>
        <button 
          onClick={onBack}
          className="text-[#706A95] text-sm font-semibold hover:text-[#1E2A78] py-2"
        >
          ← Volver a datos
        </button>
      </div>
    </div>
  );
}
