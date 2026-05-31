import { useState } from 'react';
import { DrawerStepper } from './drawer-steps/DrawerStepper';
import { StepPlanAndSlot } from './drawer-steps/StepPlanAndSlot';
import { StepPhotoAndData } from './drawer-steps/StepPhotoAndData';
import { StepStory } from './drawer-steps/StepStory';
import { StepCheckoutSummary } from './drawer-steps/StepCheckoutSummary';

interface MuralDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { col: number; row: number } | null;
  slotData: any | null;
}

export function MuralDrawer({ isOpen, onClose, selectedSlot, slotData }: MuralDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('recuerdo_eterno');
  const [draftData, setDraftData] = useState<any>({
    name: '',
    date: '',
    message: '',
    rightsConfirmed: false
  });

  if (!isOpen) return null;

  // Si el slot está ocupado, mostramos el modal simple de visualización (Phase 3)
  // Si está libre (o no hay datos), mostramos el flujo de creación (Phase 4)
  const isOccupied = slotData !== null;

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setStep(1);
      setDraftData({ name: '', date: '', message: '', rightsConfirmed: false });
    }, 300);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-end">
      {/* Semi-transparent overlay to dim the mural behind the drawer */}
      <div 
        className="absolute inset-0 bg-[#394B87]/20 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" 
        onClick={handleClose}
      />
      
      {/* The Drawer Panel */}
      <div 
        className="relative pointer-events-auto w-full lg:w-[600px] h-full bg-white shadow-2xl rounded-l-[32px] overflow-hidden flex flex-col p-8 animate-in slide-in-from-right duration-300 border-l border-white/50"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#1E2A78] transition-colors z-50"
        >
          ✕
        </button>

        {isOccupied ? (
          /* VISTA: Slot Ocupado (Perfil) */
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="text-center py-4 flex-1">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-[#C9A961] overflow-hidden bg-gray-100 shadow-xl">
                <img 
                  src={slotData.photoUrl || '/images/placeholders/hero-illustration.svg'} 
                  alt="Mascota" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-bold text-[#1E2A78] font-serif mb-2">
                {slotData.stars?.name || 'Estrella'}
              </h2>
              <div className="text-[#C9A961] mb-6 flex justify-center gap-1">
                ⭐⭐⭐⭐⭐
              </div>
              <div className="p-6 mt-2 bg-[#FFF8F4] border border-[#F8C7D8] rounded-2xl text-[#1E2A78] italic text-lg shadow-sm">
                "{slotData.stars?.message || 'Siempre estarás en nuestro corazón.'}"
              </div>
            </div>
          </div>
        ) : (
          /* VISTA: Flujo de Creación (Fase 4) */
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-[#1E2A78]">Añadir mi angelito al cielo</span>
            </div>

            <DrawerStepper currentStep={step as any} />

            <div className="flex-1 overflow-hidden">
              {step === 1 && (
                <StepPlanAndSlot 
                  onNext={() => setStep(2)} 
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  preSelectedSlot={selectedSlot}
                />
              )}
              {step === 2 && (
                <StepPhotoAndData 
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  draftData={draftData}
                  setDraftData={setDraftData}
                  selectedPlan={selectedPlan}
                />
              )}
              {step === 3 && (
                <StepStory 
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  draftData={draftData}
                  setDraftData={setDraftData}
                />
              )}
              {step === 4 && (
                <StepCheckoutSummary 
                  onBack={() => setStep(3)}
                  onCheckout={() => alert('¡Redirigiendo a Stripe Checkout seguro!')}
                  draftData={draftData}
                  selectedPlan={selectedPlan}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
