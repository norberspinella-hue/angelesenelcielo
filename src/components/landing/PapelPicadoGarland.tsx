'use client';

export function PapelPicadoGarland({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute left-0 right-0 w-full pointer-events-none select-none z-[5] overflow-visible ${className}`}
      style={{
        top: 'calc(100% - 15px)',
        height: '110px',
      }}
      aria-hidden="true"
    >
      <svg 
        className="w-full h-full overflow-visible" 
        viewBox="0 0 1000 120" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Sombra suave para los papeles picados */}
          <filter id="papel-paper-shadow" x="-20%" y="-15%" width="140%" height="135%">
            <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#38103A" floodOpacity="0.22"/>
          </filter>

          {/* CALADO 1: HUELLA DE PERRITO (Con encaje floral) */}
          <g id="papel-cutout-paw">
            <ellipse cx="0" cy="8" rx="14" ry="11" fill="white" opacity="0.95"/>
            <ellipse cx="-12" cy="-10" rx="4.8" ry="7.2" transform="rotate(-18 -12 -10)" fill="white" opacity="0.95"/>
            <ellipse cx="-4.2" cy="-16" rx="4.8" ry="7.8" transform="rotate(-6 -4.2 -16)" fill="white" opacity="0.95"/>
            <ellipse cx="4.2" cy="-16" rx="4.8" ry="7.8" transform="rotate(6 4.2 -16)" fill="white" opacity="0.95"/>
            <ellipse cx="12" cy="-10" rx="4.8" ry="7.2" transform="rotate(18 12 -10)" fill="white" opacity="0.95"/>
            {/* Encaje perimetral */}
            <circle cx="-28" cy="-10" r="2.4" fill="white" opacity="0.9"/>
            <circle cx="28" cy="-10" r="2.4" fill="white" opacity="0.9"/>
            <circle cx="-26" cy="18" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="26" cy="18" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="0" cy="24" r="2.2" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 2: ALAS DE ÁNGEL Y CORAZÓN */}
          <g id="papel-cutout-angel-heart">
            <path d="M 0 14 C 0 14, -14 2, -14 -6 C -14 -14, -6 -16, 0 -10 C 6 -16, 14 -14, 14 -6 C 14 2, 0 14, 0 14 Z" fill="white" opacity="0.95"/>
            <path d="M -13 -3 C -25 -8, -23 -18, -16 -16 C -20 -11, -18 -6, -13 -3 Z" fill="white" opacity="0.9"/>
            <path d="M 13 -3 C 25 -8, 23 -18, 16 -16 C 20 -11, 18 -6, 13 -3 Z" fill="white" opacity="0.9"/>
            <circle cx="0" cy="-18" r="2.4" fill="white" opacity="0.9"/>
            <circle cx="-22" cy="14" r="2" fill="white" opacity="0.9"/>
            <circle cx="22" cy="14" r="2" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 3: FLOR ROSETÓN CEMPASÚCHIL */}
          <g id="papel-cutout-flower">
            <circle cx="0" cy="0" r="5" fill="white" opacity="0.95"/>
            <circle cx="0" cy="-11" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="0" cy="11" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="-11" cy="0" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="11" cy="0" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="-8" cy="-8" r="3" fill="white" opacity="0.95"/>
            <circle cx="8" cy="-8" r="3" fill="white" opacity="0.95"/>
            <circle cx="-8" cy="8" r="3" fill="white" opacity="0.95"/>
            <circle cx="8" cy="8" r="3" fill="white" opacity="0.95"/>
            <circle cx="-24" cy="0" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="24" cy="0" r="2.2" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 4: ESTRELLA CELESTIAL */}
          <g id="papel-cutout-star">
            <polygon points="0,-16 4,-5 16,-5 7,3 10,14 0,7 -10,14 -7,3 -16,-5 -4,-5" fill="white" opacity="0.95"/>
            <circle cx="-22" cy="-12" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="22" cy="-12" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="-22" cy="12" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="22" cy="12" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="0" cy="20" r="2.2" fill="white" opacity="0.9"/>
          </g>
        </defs>

        {/* CUERDA RÚSTICA: TRAZADA EXACTAMENTE POR LA PARTE SUPERIOR DE CADA BANDERÍN */}
        <path 
          d="M 35,15 Q 500,80 965,15" 
          fill="none" 
          stroke="#C8A57A" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeDasharray="6,2"
        />

        {/* ========================================================
             LOS 16 BANDERINES COMPACTOS (ANCHO 56px · SEPARACIÓN 2.4px)
             ======================================================== */}

        {/* Banderín 1 (#FBBF24) */}
        <g transform="translate(62.0, 18.7)">
          <g transform="rotate(7.5)">
            <animateTransform attributeName="transform" type="rotate" values="6.3; 8.7; 6.3" dur="4.4s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#FBBF24" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 2 (#7C3AED) */}
        <g transform="translate(120.4, 25.8)">
          <g transform="rotate(6.51)">
            <animateTransform attributeName="transform" type="rotate" values="5.3; 7.7; 5.3" dur="4.7s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#7C3AED" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-flower"/>
            </g>
          </g>
        </g>
        {/* Banderín 3 (#F97316) */}
        <g transform="translate(178.8, 32.0)">
          <g transform="rotate(5.52)">
            <animateTransform attributeName="transform" type="rotate" values="4.3; 6.7; 4.3" dur="5.0s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-angel-heart"/>
            </g>
          </g>
        </g>
        {/* Banderín 4 (#EC4899) */}
        <g transform="translate(237.2, 37.1)">
          <g transform="rotate(4.52)">
            <animateTransform attributeName="transform" type="rotate" values="3.3; 5.7; 3.3" dur="5.3s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#EC4899" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 5 (#8B5CF6) */}
        <g transform="translate(295.6, 41.2)">
          <g transform="rotate(3.52)">
            <animateTransform attributeName="transform" type="rotate" values="2.3; 4.7; 2.3" dur="5.6s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#8B5CF6" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-star"/>
            </g>
          </g>
        </g>
        {/* Banderín 6 (#F59E0B) */}
        <g transform="translate(354.0, 44.3)">
          <g transform="rotate(2.51)">
            <animateTransform attributeName="transform" type="rotate" values="1.3; 3.7; 1.3" dur="5.9s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#F59E0B" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-flower"/>
            </g>
          </g>
        </g>
        {/* Banderín 7 (#6D28D9) */}
        <g transform="translate(412.4, 46.3)">
          <g transform="rotate(1.51)">
            <animateTransform attributeName="transform" type="rotate" values="0.3; 2.7; 0.3" dur="4.4s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#6D28D9" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 8 (#EA580C) */}
        <g transform="translate(470.8, 47.4)">
          <g transform="rotate(0.5)">
            <animateTransform attributeName="transform" type="rotate" values="-0.7; 1.7; -0.7" dur="4.7s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#EA580C" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-angel-heart"/>
            </g>
          </g>
        </g>
        {/* Banderín 9 (#FBBF24) */}
        <g transform="translate(529.2, 47.4)">
          <g transform="rotate(-0.5)">
            <animateTransform attributeName="transform" type="rotate" values="-1.7; 0.7; -1.7" dur="5.0s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#FBBF24" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 10 (#EC4899) */}
        <g transform="translate(587.6, 46.3)">
          <g transform="rotate(-1.51)">
            <animateTransform attributeName="transform" type="rotate" values="-2.7; -0.3; -2.7" dur="5.3s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#EC4899" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-flower"/>
            </g>
          </g>
        </g>
        {/* Banderín 11 (#7C3AED) */}
        <g transform="translate(646.0, 44.3)">
          <g transform="rotate(-2.51)">
            <animateTransform attributeName="transform" type="rotate" values="-3.7; -1.3; -3.7" dur="5.6s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#7C3AED" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-star"/>
            </g>
          </g>
        </g>
        {/* Banderín 12 (#F97316) */}
        <g transform="translate(704.4, 41.2)">
          <g transform="rotate(-3.52)">
            <animateTransform attributeName="transform" type="rotate" values="-4.7; -2.3; -4.7" dur="5.9s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 13 (#8B5CF6) */}
        <g transform="translate(762.8, 37.1)">
          <g transform="rotate(-4.52)">
            <animateTransform attributeName="transform" type="rotate" values="-5.7; -3.3; -5.7" dur="4.4s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#8B5CF6" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-angel-heart"/>
            </g>
          </g>
        </g>
        {/* Banderín 14 (#F59E0B) */}
        <g transform="translate(821.2, 32.0)">
          <g transform="rotate(-5.52)">
            <animateTransform attributeName="transform" type="rotate" values="-6.7; -4.3; -6.7" dur="4.7s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#F59E0B" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-flower"/>
            </g>
          </g>
        </g>
        {/* Banderín 15 (#EA580C) */}
        <g transform="translate(879.6, 25.8)">
          <g transform="rotate(-6.51)">
            <animateTransform attributeName="transform" type="rotate" values="-7.7; -5.3; -7.7" dur="5.0s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#EA580C" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-paw"/>
            </g>
          </g>
        </g>
        {/* Banderín 16 (#6D28D9) */}
        <g transform="translate(938.0, 18.7)">
          <g transform="rotate(-7.5)">
            <animateTransform attributeName="transform" type="rotate" values="-8.7; -6.3; -8.7" dur="5.3s" repeatCount="indefinite"/>
            <path d="M -28,0 L 28,0 L 28,42 Q 22.4,47 16.8,42 Q 11.2,47 5.6,42 Q 0,47 -5.6,42 Q -11.2,47 -16.8,42 Q -22.4,47 -28,42 Z" fill="#6D28D9" filter="url(#papel-paper-shadow)"/>
            <circle cx="-23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="-23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="8" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="18" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="28" r="1.4" fill="white" opacity="0.85"/>
            <circle cx="23" cy="37" r="1.4" fill="white" opacity="0.85"/>
            <g transform="translate(0, 22) scale(0.65)">
              <use href="#papel-cutout-star"/>
            </g>
          </g>
        </g>

      </svg>
    </div>
  );
}
