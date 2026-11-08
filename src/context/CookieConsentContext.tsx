'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type CookieConsentStatus = 'pending' | 'accepted' | 'rejected';

interface CookieConsentContextType {
  isBannerVisible: boolean;
  bannerHeight: number;
  consentStatus: CookieConsentStatus;
  acceptCookies: () => void;
  rejectCookies: () => void;
  openPreferences: () => void;
  setBannerHeight: (h: number) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>('pending');
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname?.startsWith('/live-tiktok')) {
      setIsBannerVisible(false);
      return;
    }

    try {
      const saved = localStorage.getItem('cookie-consent');
      if (saved === 'accepted' || saved === 'rejected') {
        setConsentStatus(saved as CookieConsentStatus);
        setIsBannerVisible(false);
      } else {
        setConsentStatus('pending');
        setIsBannerVisible(true);
      }
    } catch {
      setConsentStatus('pending');
      setIsBannerVisible(true);
    }
  }, [pathname]);

  // Permitir reapertura del banner desde enlaces de aviso legal / cookies o eventos de ventana
  useEffect(() => {
    const handleOpen = () => {
      setIsBannerVisible(true);
    };
    window.addEventListener('aec:open-cookie-preferences', handleOpen);
    return () => window.removeEventListener('aec:open-cookie-preferences', handleOpen);
  }, []);

  const acceptCookies = useCallback(() => {
    try {
      localStorage.setItem('cookie-consent', 'accepted');
    } catch {}
    setConsentStatus('accepted');
    setIsBannerVisible(false);
  }, []);

  const rejectCookies = useCallback(() => {
    try {
      localStorage.setItem('cookie-consent', 'rejected');
    } catch {}
    setConsentStatus('rejected');
    setIsBannerVisible(false);
  }, []);

  const openPreferences = useCallback(() => {
    setIsBannerVisible(true);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        isBannerVisible: mounted ? isBannerVisible : false,
        bannerHeight: isBannerVisible ? bannerHeight : 0,
        consentStatus,
        acceptCookies,
        rejectCookies,
        openPreferences,
        setBannerHeight,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    return {
      isBannerVisible: false,
      bannerHeight: 0,
      consentStatus: 'pending' as CookieConsentStatus,
      acceptCookies: () => {},
      rejectCookies: () => {},
      openPreferences: () => {},
      setBannerHeight: () => {},
    };
  }
  return context;
}
