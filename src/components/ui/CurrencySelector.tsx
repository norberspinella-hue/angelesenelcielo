'use client';

import React from 'react';
import { useCurrency, Currency } from '@/context/CurrencyContext';

interface CurrencySelectorProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function CurrencySelector({ size = 'md', className = '' }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  const isSmall = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Seleccionar moneda"
      className={`inline-flex items-center p-0.5 rounded-full bg-white/70 backdrop-blur-md border border-[#F3DCE7] shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setCurrency('EUR')}
        aria-pressed={currency === 'EUR'}
        className={`flex items-center gap-1 rounded-full font-bold transition-all duration-200 select-none ${
          isSmall
            ? 'px-2.5 py-1 text-[11px]'
            : 'px-3.5 py-1.5 text-xs'
        } ${
          currency === 'EUR'
            ? 'bg-gradient-to-r from-[#1E2A78] to-[#2E3C94] text-white shadow-[0_2px_8px_rgba(30,42,120,0.25)]'
            : 'text-[#5A639C] hover:text-[#1E2A78]'
        }`}
      >
        <span className="text-[12px]">🇪🇺</span>
        <span>€ EUR</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrency('USD')}
        aria-pressed={currency === 'USD'}
        className={`flex items-center gap-1 rounded-full font-bold transition-all duration-200 select-none ${
          isSmall
            ? 'px-2.5 py-1 text-[11px]'
            : 'px-3.5 py-1.5 text-xs'
        } ${
          currency === 'USD'
            ? 'bg-gradient-to-r from-[#1E2A78] to-[#2E3C94] text-white shadow-[0_2px_8px_rgba(30,42,120,0.25)]'
            : 'text-[#5A639C] hover:text-[#1E2A78]'
        }`}
      >
        <span className="text-[12px]">🌎</span>
        <span>$ USD</span>
      </button>
    </div>
  );
}
