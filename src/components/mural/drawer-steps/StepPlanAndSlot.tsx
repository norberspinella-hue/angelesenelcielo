import React, { useEffect, useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { PLANS, PLAN_ORDER, PlanId, getPlan, slotsLabel } from '@/lib/plans';

export interface WorldSpaceContextInfo {
  spaceId: string;
  planId: PlanId;
  displayName: string;
  zone: string;
  supportType?: string;
}

interface StepPlanAndSlotProps {
  onNext: () => void;
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  preSelectedSlot: { col: number; row: number } | null;
  isFounderSlot: boolean;
  worldSpaceContext?: WorldSpaceContextInfo | null;
}

export function StepPlanAndSlot({
  onNext,
  selectedPlan,
  setSelectedPlan,
  preSelectedSlot,
  isFounderSlot,
  worldSpaceContext,
}: StepPlanAndSlotProps) {
  const { formatPrice } = useCurrency();

  const plans = PLAN_ORDER.map((id) => {
    const p = PLANS[id];
    return {
      id: p.id,
      title: p.title,
      price: formatPrice(p.id),
      duration: p.durationShort,
      slots: slotsLabel(p),
      icon: p.drawerIcon
    };
  });

  const [founderInfo, setFounderInfo] = useState<{ count: number; maxFounders: number; available: boolean } | null>(null);
  const lockedPlanId = worldSpaceContext?.planId || null;
  const isFounderConflictWithWorld3D = Boolean(
    lockedPlanId &&
    isFounderSlot &&
    !['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(lockedPlanId)
  );

  useEffect(() => {
    if (lockedPlanId) {
      if (selectedPlan !== lockedPlanId) {
        setSelectedPlan(lockedPlanId);
      }
      return;
    }
    const isFounderEligible = ['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(selectedPlan);
    if (isFounderSlot && !isFounderEligible) {
      setSelectedPlan('corazon_eterno');
    }
  }, [isFounderSlot, selectedPlan, setSelectedPlan, lockedPlanId]);

  useEffect(() => {
    fetch('/api/mural/founders')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFounderInfo(data);
        }
      })
      .catch(err => console.error('Error fetching founders:', err));
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 1 — Elige tu plan y tu slot</h2>
        <p className="text-sm text-[#706A95]">Elige tu plan y la presencia de tu angelito en el mural.</p>
      </div>

      <div className="flex flex-col gap-4 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {worldSpaceContext && (
          <div className="p-3.5 bg-[#FFF6EE] rounded-2xl border-2 border-[#C9A961]/70 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C3F71] mb-1">
              Lugar 3D seleccionado · Cielo 3D
            </p>
            <p className="text-sm font-bold text-[#1E2A78]">{worldSpaceContext.displayName}</p>
            <p className="text-xs text-[#706A95] mt-0.5">
              {worldSpaceContext.zone} · Plan requerido: <strong>{PLANS[worldSpaceContext.planId].title}</strong>
            </p>
            {isFounderConflictWithWorld3D && (
              <p className="text-xs text-red-700 font-semibold mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                Esta casilla está en la zona central de Fundadores (3×3 o superior). Cierra este panel y haz clic en otro hueco del Mural Global para usar este espacio 3D.
              </p>
            )}
          </div>
        )}

        {isFounderSlot && !isFounderConflictWithWorld3D && (
          <div className="p-4 bg-gradient-to-r from-[#FFF9E6] via-[#FFEBB3] to-[#FFF1CC] rounded-2xl border-2 border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-md shrink-0 border border-[#D4AF37]/30">
              <img src="/images/icons/plans/icon-plan-eterno.svg" alt="Ángeles Fundadores" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-[#8A6D1C] text-sm font-serif">Espacio de Ángel Fundador</h4>
              <p className="text-xs text-[#9B7D3B] mt-0.5 leading-relaxed">
                Este espacio está en la zona premium reservada para los Ángeles Fundadores. Requiere como mínimo el plan Corazón Eterno o cualquiera de los planes superiores (Ángelito Protector, Galaxia de Amor o Vínculo Infinito).
              </p>
            </div>
          </div>
        )}

        {plans.map((plan) => {
          const isFounderPlan = ['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(plan.id);
          const isDisabled = (lockedPlanId ? plan.id !== lockedPlanId : false) || (isFounderSlot && !isFounderPlan);
          return (
            <div 
              key={plan.id}
              onClick={() => {
                if (!isDisabled) {
                  setSelectedPlan(plan.id);
                }
              }}
              style={isDisabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-[#C9A961] bg-[#FFF8F4] shadow-md' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1E2A78]">{plan.title}</h3>
                <div className="text-right">
                  <span className="font-bold text-[#1E2A78] text-base">{plan.price}</span>
                  <span className="block text-[10px] text-[#706A95]">{plan.duration}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#C9A961] bg-[#C9A961]/10 px-2 py-1 rounded-md">
                  {plan.icon}
                </span>
                <span className="text-xs text-[#706A95]">
                  {plan.slots === '1 espacio' ? '1 espacio incluido' : `${plan.slots} incluidos`}
                </span>
              </div>
            </div>
          );
        })}

        {['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(selectedPlan) && founderInfo?.available && (
          <div className="mt-2 p-3 bg-gradient-to-r from-[#FFF8E7] to-[#FCE7BA] rounded-xl border border-[#E5C88A] shadow-sm flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#C9A961] shrink-0">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-bold text-[#8A6033]">
                Eres el fundador #{founderInfo.count + 1}
              </p>
              <p className="text-xs text-[#9A7D63] mt-0.5">
                tu espacio irá en la zona central del mural
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-sm font-bold text-[#1E2A78] mb-2">Vista previa de presencia en el mural</h4>
          <div className="flex flex-col gap-4">
            <div className="text-xs text-[#706A95]">
              El espacio seleccionado empezará en la coordenada <strong>{preSelectedSlot?.col}, {preSelectedSlot?.row}</strong> y ocupará el espacio correspondiente al plan.
            </div>
            <div className="w-full flex justify-center">
              {(() => {
                const selectedPlanConfig = getPlan(selectedPlan);
                const blockSize = selectedPlanConfig?.size ?? 1;
                const previewCols = Math.max(10, blockSize + 4);
                const previewRows = Math.max(7, blockSize + 2);
                const colOffset = Math.max(2, Math.floor((previewCols - blockSize) / 2));
                const rowOffset = Math.max(1, Math.floor((previewRows - blockSize) / 2));

                return (
                  <div
                    className="bg-white border border-gray-200 rounded shadow-inner"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${previewCols}, 16px)`,
                      gridTemplateRows: `repeat(${previewRows}, 16px)`,
                      gap: '2px',
                      padding: '8px',
                    }}
                  >
                    {Array.from({ length: previewCols * previewRows }).map((_, idx) => {
                      const colIdx = idx % previewCols;
                      const rowIdx = Math.floor(idx / previewCols);

                      const actualCol = (preSelectedSlot?.col || 0) - colOffset + colIdx;
                      const actualRow = (preSelectedSlot?.row || 0) - rowOffset + rowIdx;

                      const isSelected = Boolean(
                        selectedPlanConfig &&
                        preSelectedSlot &&
                        actualCol >= preSelectedSlot.col &&
                        actualCol < preSelectedSlot.col + blockSize &&
                        actualRow >= preSelectedSlot.row &&
                        actualRow < preSelectedSlot.row + blockSize
                      );

                      const isOccupiedNeighbor = !isSelected && ((actualCol * 7 + actualRow * 13) % 10 === 0);

                      return (
                        <div
                          key={idx}
                          className={`w-full h-full rounded-[2px] transition-colors ${
                            isSelected
                              ? 'bg-[#C9A961] shadow-sm animate-pulse'
                              : isOccupiedNeighbor
                                ? 'bg-[#F8C7D8]'
                                : 'bg-gray-100 border border-gray-200'
                          }`}
                          title={isSelected ? 'Tu selección' : isOccupiedNeighbor ? 'Ocupado' : 'Libre'}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button 
          onClick={onNext}
          disabled={isFounderConflictWithWorld3D}
          className="btn-primary-heaven btn-drawer-cta w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
