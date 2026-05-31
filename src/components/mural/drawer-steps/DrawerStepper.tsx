import React from 'react';

interface DrawerStepperProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export function DrawerStepper({ currentStep }: DrawerStepperProps) {
  const steps = [
    { num: 1, label: 'Plan' },
    { num: 2, label: 'Foto' },
    { num: 3, label: 'Historia' },
    { num: 4, label: 'Pago' },
    { num: 5, label: 'Gracias' },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-[400px] mb-8 relative">
      <div className="absolute top-3 left-6 right-6 h-[2px] bg-gray-200 z-0" />
      
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        const isPending = currentStep < step.num;

        return (
          <div key={step.num} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                isCompleted ? 'bg-[#1E2A78] text-white' : 
                isActive ? 'bg-[#1E2A78] text-white ring-4 ring-[#1E2A78]/20' : 
                'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? '✓' : step.num}
            </div>
            <span 
              className={`text-[10px] font-semibold whitespace-nowrap ${
                isActive || isCompleted ? 'text-[#1E2A78]' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
