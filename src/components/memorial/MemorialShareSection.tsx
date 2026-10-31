'use client';

import React from 'react';

interface MemorialShareSectionProps {
  onOpenStoryModal: () => void;
  onShareWhatsApp: () => void;
  onShareFacebook: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export const MemorialShareSection: React.FC<MemorialShareSectionProps> = ({
  onOpenStoryModal,
  onShareWhatsApp,
  onShareFacebook,
  onCopyLink,
  copied,
}) => {
  return (
    <section className="relative w-full overflow-hidden select-none py-10 sm:py-16 flex flex-col items-center">
      {/* 1. FONDOS CELESTIALES MAESTROS APROBADOS CON MÁSCARA DE DEGRADADO VERTICAL */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/06-compartir-desktop.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover pointer-events-none"
        style={{
          backgroundImage: "url('/images/memorial/06-compartir-movil.webp')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* Cabecera centrada con icono de compartir */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 w-40 sm:w-56 mb-1 opacity-80">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/60" />
            {/* Icono de compartir delicado */}
            <svg
              className="w-4 h-4 text-[#B8860B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8860B]/60" />
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-center"
            style={{
              fontFamily: "'Allura', cursive",
              color: '#B8860B',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(184, 134, 11, 0.25)',
            }}
          >
            Comparte su recuerdo
          </h2>

          <p
            className="text-xs sm:text-[13.5px] text-[#5A4668] max-w-lg mt-1 sm:mt-2 px-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ayuda a que más personas conozcan su historia y que su luz siga llegando más lejos.
          </p>
        </div>

        {/* 4 BOTONES DE ACCIÓN CELESTIALES DE GRAN TAMAÑO SEGÚN EL MOCKUP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
          
          {/* 1. STORY DE INSTAGRAM */}
          <button
            onClick={onOpenStoryModal}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-[20px] text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #E1306C 48%, #833AB4 100%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(225, 48, 108, 0.35)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono Instagram grande */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 text-white">
                <span className="font-bold text-xs sm:text-[13.5px] leading-tight truncate">
                  Story de Instagram
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-white/85 leading-tight mt-0.5 truncate">
                  Compartir en mis historias
                </span>
              </div>
            </div>
            <span className="text-white text-lg font-bold ml-2 transition-transform group-hover:translate-x-0.5">›</span>
          </button>

          {/* 2. WHATSAPP */}
          <button
            onClick={onShareWhatsApp}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-[20px] text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono WhatsApp grande */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 text-white">
                <span className="font-bold text-xs sm:text-[13.5px] leading-tight truncate">
                  WhatsApp
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-white/85 leading-tight mt-0.5 truncate">
                  Compartir por WhatsApp
                </span>
              </div>
            </div>
            <span className="text-white text-lg font-bold ml-2 transition-transform group-hover:translate-x-0.5">›</span>
          </button>

          {/* 3. FACEBOOK */}
          <button
            onClick={onShareFacebook}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-[20px] text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #1877F2 0%, #0C56BE 100%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(24, 119, 242, 0.35)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono Facebook grande */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 text-white">
                <span className="font-bold text-xs sm:text-[13.5px] leading-tight truncate">
                  Facebook
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-white/85 leading-tight mt-0.5 truncate">
                  Compartir en Facebook
                </span>
              </div>
            </div>
            <span className="text-white text-lg font-bold ml-2 transition-transform group-hover:translate-x-0.5">›</span>
          </button>

          {/* 4. COPIAR ENLACE */}
          <button
            onClick={onCopyLink}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-[20px] text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #F8F2FE 0%, #EDE4F8 100%)',
              border: '1.5px solid rgba(192, 132, 252, 0.65)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.16)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono Link grande */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                <svg className="w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs sm:text-[13.5px] leading-tight text-[#4C1D95] truncate">
                  Copiar enlace
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-[#7C3AED] leading-tight mt-0.5 truncate">
                  {copied ? '¡Copiado al portapapeles!' : 'Copiar al portapapeles'}
                </span>
              </div>
            </div>
            <span className="text-[#7C3AED] text-lg font-bold ml-2 transition-transform group-hover:translate-x-0.5">›</span>
          </button>

        </div>

      </div>
    </section>
  );
};
