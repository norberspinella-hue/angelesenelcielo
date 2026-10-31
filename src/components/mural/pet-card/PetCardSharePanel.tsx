'use client';

import React from 'react';
import Link from 'next/link';

interface PetCardSharePanelProps {
  nombre: string;
  shareUrl: string;
  profileSlug?: string | null;
  isExporting: boolean;
  onDownloadFront: () => void;
  onDownloadBack: () => void;
  onShareWhatsApp: () => void;
  onShareInstagram: () => void;
  onShareTikTok: () => void;
  onShareFacebook: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export const PetCardSharePanel: React.FC<PetCardSharePanelProps> = ({
  nombre,
  shareUrl,
  profileSlug,
  isExporting,
  onDownloadFront,
  onDownloadBack,
  onShareWhatsApp,
  onShareInstagram,
  onShareTikTok,
  onShareFacebook,
  onCopyLink,
  copied,
}) => {
  return (
    <div
      className="relative rounded-[28px] border border-[#FCE7F3] shadow-[0_16px_40px_rgba(74,31,110,0.10)] p-5 sm:p-6 flex flex-col items-center overflow-hidden w-full max-w-[380px] text-center select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 245, 248, 0.75) 0%, rgba(253, 242, 248, 0.75) 50%, rgba(252, 231, 243, 0.75) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(251, 207, 232, 0.65)',
        boxShadow: '0 16px 40px rgba(74, 31, 110, 0.08), 0 0 20px rgba(255, 255, 255, 0.40) inset',
      }}
    >
      {/* MARIPOSAS DECORATIVAS */}
      {/* Mariposas en las esquinas */}
      <div className="absolute top-2.5 left-3 w-6 h-6 -rotate-12 pointer-events-none select-none opacity-80 z-0">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>
      <div className="absolute top-3 right-3.5 w-5 h-5 rotate-15 pointer-events-none select-none opacity-75 z-0">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>
      <div className="absolute top-[82px] left-2 w-4 h-4 -rotate-20 pointer-events-none select-none opacity-70 z-0">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>
      <div className="absolute top-[90px] right-2.5 w-5 h-5 rotate-25 pointer-events-none select-none opacity-75 z-0">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>

      {/* 4 MARIPOSAS GRANDES POR EL CENTRO (EL DOBLE DE GRANDES: 44px - 48px) */}
      <div className="absolute top-[138px] -left-2 w-11 h-11 sm:w-12 sm:h-12 -rotate-18 pointer-events-none select-none opacity-85 z-0 filter drop-shadow-[0_2px_8px_rgba(236,72,153,0.30)]">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-[160px] -right-2 w-12 h-12 sm:w-13 sm:h-13 rotate-20 pointer-events-none select-none opacity-85 z-0 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.30)]">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-[222px] left-2 w-10 h-10 sm:w-11 sm:h-11 rotate-25 pointer-events-none select-none opacity-80 z-0 filter drop-shadow-[0_2px_6px_rgba(168,85,247,0.25)]">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-[236px] right-3 w-10 h-10 sm:w-11 sm:h-11 -rotate-15 pointer-events-none select-none opacity-80 z-0 filter drop-shadow-[0_2px_6px_rgba(236,72,153,0.25)]">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Mariposas en la parte inferior */}
      <div className="absolute bottom-14 left-3 w-5 h-5 rotate-12 pointer-events-none select-none opacity-80 z-0">
        <img src="/images/icons/butterfly1.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>
      <div className="absolute bottom-16 right-3.5 w-4 h-4 -rotate-15 pointer-events-none select-none opacity-75 z-0">
        <img src="/images/icons/butterfly2.svg" alt="" className="w-full h-full object-contain drop-shadow-xs" />
      </div>

      {/* Título y subtítulo emocional */}
      <div className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#FFF0F5]/90 border border-[#FBCFE8] shadow-xs mb-2">
        <span className="text-xs">💗</span>
        <span className="text-[11px] sm:text-xs font-bold text-[#BE185D] tracking-wide inline-flex items-center">
          Recuerdo de amor eterno
          <img
            src="/images/icons/plans/icon-plan-estrella.svg"
            alt=""
            className="w-7 h-7 object-contain inline-block ml-1.5 align-middle"
          />
        </span>
      </div>

      <h4 className="relative z-10 font-serif font-bold text-[18px] sm:text-[19px] text-[#4A3258] m-0 mb-1.5 leading-snug">
        Haz que su recuerdo siga brillando
      </h4>

      <p className="relative z-10 text-[11.5px] sm:text-xs text-[#7B6F9A] m-0 mb-4 leading-relaxed font-sans max-w-xs flex items-center justify-center flex-wrap gap-1">
        <span>Comparte a <strong className="text-[#BE185D]">{nombre}</strong> y ayuda a que su luz llegue a más personas.</span>
        <img
          src="/images/icons/plans/icon-plan-estrella.svg"
          alt=""
          className="w-7 h-7 object-contain inline-block ml-1 align-middle"
        />
      </p>

      {/* Botones principales de exportación en alta resolución */}
      <div className="relative z-10 flex gap-2.5 w-full mb-4">
        {/* Compartir retrato (Anverso) */}
        <button
          onClick={onDownloadFront}
          disabled={isExporting}
          className="flex-1 py-2.5 px-3 rounded-full text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #A855F7 100%)',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.40)',
          }}
          title="Guardar o compartir retrato celestial en alta resolución"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{isExporting ? 'Generando...' : 'Compartir retrato'}</span>
        </button>

        {/* Compartir dedicatoria (Reverso) */}
        <button
          onClick={onDownloadBack}
          disabled={isExporting}
          className="flex-1 py-2.5 px-3 rounded-full text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #7C3AED 100%)',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.40)',
          }}
          title="Guardar o compartir dedicatoria completa en alta resolución"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{isExporting ? 'Generando...' : 'Compartir dedicatoria'}</span>
        </button>
      </div>

      {/* Botones de redes sociales */}
      <div className="relative z-10 flex gap-3.5 w-full justify-center mb-4">
        {/* WhatsApp con icono oficial del botón de contacto flotante */}
        <div
          onClick={onShareWhatsApp}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Compartir por WhatsApp"
        >
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-[#25D366] shadow-[0_6px_16px_rgba(37,211,102,0.35)] hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
          <span className="text-[10px] text-[#4A3F6B] font-medium">WhatsApp</span>
        </div>

        {/* Instagram */}
        <div
          onClick={onShareInstagram}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Copiar enlace para Instagram"
        >
          <div
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-[0_6px_16px_rgba(220,39,67,0.30)] hover:scale-105 transition-transform"
            style={{
              background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.3" cy="6.7" r="1.2" fill="white" />
            </svg>
          </div>
          <span className="text-[10px] text-[#4A3F6B] font-medium">Instagram</span>
        </div>

        {/* TikTok */}
        <div
          onClick={onShareTikTok}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Copiar enlace para TikTok"
        >
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-black shadow-[0_6px_16px_rgba(0,0,0,0.22)] hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.78a4.85 4.85 0 0 1-1.03-.09z" />
            </svg>
          </div>
          <span className="text-[10px] text-[#4A3F6B] font-medium">TikTok</span>
        </div>

        {/* Facebook */}
        <div
          onClick={onShareFacebook}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Compartir en Facebook"
        >
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-[#1877F2] shadow-[0_6px_16px_rgba(24,119,242,0.30)] hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M14 13.5h2.5l1-4H14v-2c0-1.03.3-2 2-2h1.5V1.5c-.3-.04-1.2-.1-2.5-.1-2.6 0-4.5 1.6-4.5 4.5v3.1H7v4h3.5V22h3.5V13.5z" />
            </svg>
          </div>
          <span className="text-[10px] text-[#4A3F6B] font-medium">Facebook</span>
        </div>

        {/* Copiar enlace */}
        <div
          onClick={onCopyLink}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Copiar enlace"
        >
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#A78BFA] to-[#7C3AED] shadow-[0_6px_16px_rgba(124,58,237,0.30)] hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="text-[10px] text-[#4A3F6B] font-medium">{copied ? '¡Copiado!' : 'Enlace'}</span>
        </div>
      </div>

      {/* Botón inferior: "Visitar el cielo de {nombre}" */}
      {profileSlug && (
        <div className="relative z-10 w-full pt-3 border-t border-[#FCE7F3] flex justify-center">
          <Link
            href={`/memorial/${profileSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-full text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{
              background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 50%, #A855F7 100%)',
              boxShadow: '0 4px 16px rgba(236, 72, 153, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.40)',
            }}
          >
            <img
              src="/images/icons/plans/icon-plan-eterno.svg"
              alt=""
              className="w-4 h-4 object-contain"
            />
            <span>Visitar el cielo de {nombre}</span>
            <span className="text-xs">›</span>
          </Link>
        </div>
      )}
    </div>
  );
};
