'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatPlanPrice, getPlan, type PlanId } from '@/lib/plans';

export type Currency = 'EUR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (plan: PlanId, options?: { showPeriod?: boolean }) => string;
  taxGuarantee: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('aec_currency') as Currency | null;
      if (saved === 'EUR' || saved === 'USD') {
        setCurrencyState(saved);
        return;
      }
      // Auto-detect if visitor is in the Americas (Mexico, US, Latin America)
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('America/')) {
        setCurrencyState('USD');
      } else {
        setCurrencyState('EUR');
      }
    } catch {
      setCurrencyState('EUR');
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('aec_currency', c);
    } catch {}
  };

  const formatPrice = (plan: PlanId, options?: { showPeriod?: boolean }): string => {
    const planConfig = getPlan(plan);
    if (!planConfig) return '';
    return formatPlanPrice(planConfig, currency, options);
  };

  const taxGuarantee = currency === 'EUR'
    ? 'Todos los precios incluyen IVA (21%)'
    : 'Precios finales sin cargos ocultos ni sorpresas';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, taxGuarantee }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
