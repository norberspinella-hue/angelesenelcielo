import React from 'react';

interface StepPlanAndSlotProps {
  onNext: () => void;
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  preSelectedSlot: { col: number; row: number } | null;
}

export function StepPlanAndSlot({ onNext, selectedPlan, setSelectedPlan, preSelectedSlot }: StepPlanAndSlotProps) {
  const plans = [
    {
      id: 'recuerdo_inicial',
      title: 'Recuerdo Inicial',
      price: '1,99 €',
      duration: 'pago único',
      slots: '1 slot',
      icon: '⭐'
    },
    {
      id: 'estrella_anual',
      title: 'Estrella Anual',
      price: '4,99 €',
      duration: '/ año',
      slots: '4 slots',
      icon: '⭐⭐⭐⭐'
    },
    {
      id: 'recuerdo_eterno',
      title: 'Recuerdo Eterno',
      price: '9,99 €',
      duration: 'pago único',
      slots: '9 slots',
      icon: '⭐ 3x3'
    }
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 1 — Elige tu plan y tu slot</h2>
        <p className="text-sm text-[#706A95]">Elige tu plan y la presencia de tu angelito en el mural.</p>
      </div>

      <div className="flex flex-col gap-4 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'border-[#C9A961] bg-[#FFF8F4] shadow-md' 
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#1E2A78]">{plan.title}</h3>
              <div className="text-right">
                <span className="font-bold text-[#1E2A78]">{plan.price}</span>
                <span className="text-xs text-[#706A95] ml-1">{plan.duration}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#C9A961] bg-[#C9A961]/10 px-2 py-1 rounded-md">
                {plan.icon}
              </span>
              <span className="text-xs text-[#706A95]">{plan.slots} incluidos</span>
            </div>
          </div>
        ))}

        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-sm font-bold text-[#1E2A78] mb-2">Vista previa de presencia en el mural</h4>
          <div className="flex flex-col gap-4">
            <div className="text-xs text-[#706A95]">
              El espacio seleccionado empezará en la coordenada <strong>{preSelectedSlot?.col}, {preSelectedSlot?.row}</strong> y ocupará el espacio correspondiente al plan.
            </div>
            <div className="w-full flex justify-center">
              <div 
                className="bg-white border border-gray-200 rounded shadow-inner"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 16px)',
                  gridTemplateRows: 'repeat(6, 16px)',
                  gap: '2px',
                  padding: '8px'
                }}
              >
                {Array.from({ length: 60 }).map((_, idx) => {
                  const colIdx = idx % 10;
                  const rowIdx = Math.floor(idx / 10);
                  
                  // Calculate actual coordinates for this cell
                  const actualCol = (preSelectedSlot?.col || 0) - 4 + colIdx;
                  const actualRow = (preSelectedSlot?.row || 0) - 2 + rowIdx;
                  
                  // Determine if this cell is part of the selected plan
                  const isMainSlot = actualCol === preSelectedSlot?.col && actualRow === preSelectedSlot?.row;
                  let isSelected = false;
                  
                  if (selectedPlan === 'recuerdo_inicial') {
                    isSelected = isMainSlot;
                  } else if (selectedPlan === 'estrella_anual') {
                    isSelected = actualCol >= (preSelectedSlot?.col || 0) && actualCol < (preSelectedSlot?.col || 0) + 2 &&
                                 actualRow >= (preSelectedSlot?.row || 0) && actualRow < (preSelectedSlot?.row || 0) + 2;
                  } else if (selectedPlan === 'recuerdo_eterno') {
                    isSelected = actualCol >= (preSelectedSlot?.col || 0) && actualCol < (preSelectedSlot?.col || 0) + 3 &&
                                 actualRow >= (preSelectedSlot?.row || 0) && actualRow < (preSelectedSlot?.row || 0) + 3;
                  }

                  // Mock: Some random neighbors are occupied based on coordinates to look realistic
                  const isOccupiedNeighbor = !isSelected && ((actualCol * 7 + actualRow * 13) % 10 === 0);

                  return (
                    <div 
                      key={idx}
                      className={`w-full h-full rounded-[2px] transition-colors ${
                        isSelected ? 'bg-[#C9A961] shadow-sm animate-pulse' : 
                        isOccupiedNeighbor ? 'bg-[#F8C7D8]' : 
                        'bg-gray-100 border border-gray-200'
                      }`}
                      title={isSelected ? 'Tu selección' : isOccupiedNeighbor ? 'Ocupado' : 'Libre'}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button 
          onClick={onNext}
          className="btn-primary-heaven w-full"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
