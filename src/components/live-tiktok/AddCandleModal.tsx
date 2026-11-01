'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AddCandleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCandle: (name: string, species: string, dedication?: string) => void;
  triggerElementRef?: React.RefObject<HTMLElement | null>;
}

export function AddCandleModal({
  isOpen,
  onClose,
  onAddCandle,
  triggerElementRef,
}: AddCandleModalProps) {
  const [petName, setPetName] = useState<string>('');
  const [speciesType, setSpeciesType] = useState<string>('Perrito');
  const [dedication, setDedication] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Trap focus & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Reset draft policy on open
    setErrorMessage('');
    
    // Auto focus first input after mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes dialog cleanly
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      // Tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Return focus to triggering element on unmount / close
      if (triggerElementRef?.current) {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, triggerElementRef]);

  // Handle Cancel with clear draft policy
  const handleCancel = () => {
    setPetName('');
    setDedication('');
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = petName.trim();

    if (!cleanName) {
      setErrorMessage('Por favor, indica el nombre de la mascota.');
      inputRef.current?.focus();
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage('El nombre debe tener al menos 2 caracteres.');
      inputRef.current?.focus();
      return;
    }

    if (cleanName.length > 30) {
      setErrorMessage('El nombre es demasiado largo (máximo 30 caracteres).');
      inputRef.current?.focus();
      return;
    }

    onAddCandle(cleanName, speciesType, dedication.trim() || undefined);
    setPetName('');
    setDedication('');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candle-modal-title"
      aria-describedby="candle-modal-description"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-sm bg-[#1A0B28] border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-left space-y-4 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3
            id="candle-modal-title"
            className="font-serif font-black text-lg text-amber-200 flex items-center gap-2"
          >
            <span>🕯️</span> Encender Vela del Chat
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cerrar ventana"
            className="w-8 h-8 rounded-full flex items-center justify-center text-pink-300 hover:text-white hover:bg-white/10 transition-colors font-bold text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p id="candle-modal-description" className="text-xs text-pink-200/85 leading-relaxed">
          Introduce el nombre de la mascota mencionada en los comentarios de TikTok para incorporarla de inmediato al Altar de luces de la emisión.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="live-pet-name-input"
              className="text-xs font-bold text-pink-200 block mb-1.5"
            >
              Nombre del angelito <span className="text-amber-400">*</span>:
            </label>
            <input
              id="live-pet-name-input"
              ref={inputRef}
              type="text"
              value={petName}
              onChange={(e) => {
                setPetName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={(e) => {
                // Ensure form typing doesn't trigger parent hotkeys
                e.stopPropagation();
              }}
              placeholder="Ej: Maya, Toby, Coco..."
              maxLength={30}
              className={`w-full px-4 py-3 rounded-xl bg-black/60 border text-amber-100 placeholder-pink-400/40 font-bold outline-none text-sm transition-colors ${
                errorMessage
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                  : 'border-pink-400/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
              }`}
            />
            {errorMessage && (
              <p role="alert" className="text-xs font-bold text-rose-400 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errorMessage}
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-pink-200 block mb-1.5">
              Tipo de compañero:
            </span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de mascota">
              {[
                { id: 'Perrito', label: 'Perrito', icon: '🐾' },
                { id: 'Gatito', label: 'Gatito', icon: '✨' },
                { id: 'Compañero', label: 'Compañero', icon: '🌟' },
              ].map((t) => {
                const isSelected = speciesType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSpeciesType(t.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md font-black scale-[1.02]'
                        : 'bg-white/5 text-pink-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="live-dedication-input"
              className="text-xs font-bold text-pink-200 block mb-1.5"
            >
              Dedicatoria / Frase (opcional):
            </label>
            <input
              id="live-dedication-input"
              type="text"
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Ej: Tu luz seguirá brillando en nuestros corazones"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-pink-400/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-amber-100 placeholder-pink-400/40 text-xs font-medium outline-none transition-colors"
            />
            <span className="text-[10px] text-pink-300/60 mt-1 block">
              Si se deja vacío, se mostrará la frase conmemorativa por defecto.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl text-xs font-bold text-pink-200 hover:bg-white/10 border border-white/15 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🕯️</span>
              <span>Encender Vela</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
