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
  isFounderSlot: boolean;
}

export function MuralDrawer({ isOpen, onClose, selectedSlot, slotData, isFounderSlot }: MuralDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('corazon_eterno');
  const [draftData, setDraftData] = useState<any>({
    name: '',
    date: '',
    message: '',
    rightsConfirmed: false,
    species: 'perro',
    breed: '',
    birthDate: '',
    location: ''
  });

  if (!isOpen) return null;

  // Si el slot está ocupado, mostramos el modal simple de visualización (Phase 3)
  // Si está libre (o no hay datos), mostramos el flujo de creación (Phase 4)
  const isOccupied = slotData !== null;

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setStep(1);
      setDraftData({ 
        name: '', 
        date: '', 
        message: '', 
        rightsConfirmed: false,
        species: 'perro',
        breed: '',
        birthDate: '',
        location: ''
      });
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
        className={`relative pointer-events-auto h-full bg-white shadow-2xl rounded-l-[16px] overflow-hidden flex flex-row animate-in slide-in-from-right duration-300 border-l border-white/50 ${
          isOccupied ? 'w-full lg:w-[600px] p-8' : 'w-[98vw] max-w-[1800px]'
        }`}
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#1E2A78] transition-colors z-50"
        >
          ✕
        </button>

        {!isOccupied && (
          <div className="hidden md:block flex-1 h-full relative shrink-0" style={{ borderRadius: '16px 0 0 16px', overflow: 'hidden' }}>
            <img 
              src="/images/mascota-emotiva.webp"
              alt="Mascota en el cielo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }}
            />
            <div 
              className="absolute pointer-events-none" 
              style={{ 
                top: '35%', 
                left: '4%', 
                transform: 'translate(-5%, -50%)', 
                width: 'min(85%, 520px)',
                textAlign: 'center'
              }}
            >
              {/* Fondo difuminado detrás del texto */}
              <div 
                className="absolute inset-[-60px] -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(255,248,240,0.85) 0%, rgba(255,248,240,0.5) 45%, transparent 75%)',
                  filter: 'blur(25px)',
                  borderRadius: '50%'
                }}
              />
              
              {/* Icono decorativo (corazón con huella/aureola) */}
              <div className="flex justify-center mb-[18px] opacity-90 drop-shadow-md">
                <img 
                  src="/images/icons/Logoheart.svg" 
                  alt="Corazón de Ángeles" 
                  className="h-[100px] w-auto object-contain"
                />
              </div>

              <h2 
                style={{ 
                  fontFamily: 'var(--font-display), Georgia, serif', 
                  fontSize: 'clamp(32px, 3.5vw, 48px)', 
                  lineHeight: '1.15',
                  fontWeight: 700, 
                  background: 'linear-gradient(to right, #151D54, #A393C4)', /* 15% más oscuro que #1E2A78 y #C8B8E8 */
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '24px',
                  letterSpacing: '-0.02em',
                  textShadow: 'none'
                }}
              >
                Un lugar en el cielo<br/>
                para quien iluminó<br/>
                tu mundo
              </h2>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div style={{ flexBasis: '64px', height: '0', borderTop: '1px solid rgba(201, 169, 97, 0.5)' }}></div>
                <span className="text-[#C9A961] text-lg">✦</span>
                <div style={{ flexBasis: '64px', height: '0', borderTop: '1px solid rgba(201, 169, 97, 0.5)' }}></div>
              </div>

              <p 
                style={{ 
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(16px, 1.8vw, 21px)', 
                  lineHeight: '1.5',
                  color: '#2A365C', 
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                Honra su memoria, compártela con amor<br/>
                y mantén viva su luz para siempre.
              </p>
            </div>
          </div>
        )}

        {isOccupied ? (
          /* VISTA: Slot Ocupado (Perfil) */
          <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
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
          <div className="flex flex-col w-full md:w-[500px] lg:w-[550px] shrink-0 h-full relative z-10 p-6 md:p-8 overflow-y-auto">
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
                  isFounderSlot={isFounderSlot}
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
                  draftData={draftData}
                  selectedPlan={selectedPlan}
                  selectedSlot={selectedSlot}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
