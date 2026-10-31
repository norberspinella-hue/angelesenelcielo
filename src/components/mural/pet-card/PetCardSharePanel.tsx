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
      className="rounded-[28px] border border-[#FCE7F3] shadow-[0_16px_40px_rgba(74,31,110,0.12)] p-5 sm:p-6 flex flex-col items-center overflow-hidden w-full max-w-[380px] text-center"
      style={{
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FDF2F8 50%, #FCE7F3 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Título y subtítulo emocional */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] shadow-xs mb-2">
        <span className="text-xs">💗</span>
        <span className="text-[11px] sm:text-xs font-bold text-[#BE185D] tracking-wide">
          Recuerdo de amor eterno ✨
        </span>
      </div>

      <h4 className="font-serif font-bold text-[18px] sm:text-[19px] text-[#4A3258] m-0 mb-1.5 leading-snug">
        Haz que su recuerdo siga brillando
      </h4>

      <p className="text-[11.5px] sm:text-xs text-[#7B6F9A] m-0 mb-4.5 leading-relaxed font-sans max-w-xs">
        Comparte a <strong className="text-[#BE185D]">{nombre}</strong> y ayuda a que su luz llegue a más personas. ✨
      </p>

      {/* Botones principales de exportación en alta resolución */}
      <div className="flex gap-2.5 w-full mb-4">
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
      <div className="flex gap-3.5 w-full justify-center mb-4">
        {/* WhatsApp */}
        <div
          onClick={onShareWhatsApp}
          className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-2px]"
          title="Compartir por WhatsApp"
        >
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-[#25D366] shadow-[0_6px_16px_rgba(37,211,102,0.30)] hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592" />
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
        <div className="w-full pt-3 border-t border-[#FCE7F3] flex justify-center">
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
