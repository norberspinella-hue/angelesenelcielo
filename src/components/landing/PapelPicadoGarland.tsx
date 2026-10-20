'use client';

export function PapelPicadoGarland({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute left-0 right-0 w-full pointer-events-none select-none z-[5] overflow-visible ${className}`}
      style={{
        top: 'calc(100% - 20px)',
        height: '150px',
      }}
      aria-hidden="true"
    >
      <svg 
        className="w-full h-full overflow-visible" 
        viewBox="0 0 1000 170" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Sombra suave para los papeles picados */}
          <filter id="papel-paper-shadow" x="-20%" y="-15%" width="140%" height="135%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#38103A" floodOpacity="0.18"/>
          </filter>

          {/* CALADO 1: HUELLA DE PERRITO (Grande, nítida y con encaje floral) */}
          <g id="papel-cutout-paw">
            <ellipse cx="0" cy="8" rx="14" ry="11" fill="white" opacity="0.95"/>
            <ellipse cx="-12" cy="-10" rx="4.8" ry="7.2" transform="rotate(-18 -12 -10)" fill="white" opacity="0.95"/>
            <ellipse cx="-4.2" cy="-16" rx="4.8" ry="7.8" transform="rotate(-6 -4.2 -16)" fill="white" opacity="0.95"/>
            <ellipse cx="4.2" cy="-16" rx="4.8" ry="7.8" transform="rotate(6 4.2 -16)" fill="white" opacity="0.95"/>
            <ellipse cx="12" cy="-10" rx="4.8" ry="7.2" transform="rotate(18 12 -10)" fill="white" opacity="0.95"/>
            {/* Encaje perimetral */}
            <circle cx="-32" cy="-14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="-24" cy="-22" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="24" cy="-22" r="2.2" fill="white" opacity="0.9"/>
            <circle cx="32" cy="-14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="-34" cy="6" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="34" cy="6" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="-28" cy="22" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="28" cy="22" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="0" cy="25" r="2.5" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 2: ALAS DE ÁNGEL Y CORAZÓN */}
          <g id="papel-cutout-angel-heart">
            <path d="M 0 16 C 0 16, -17 2, -17 -8 C -17 -17, -7 -19, 0 -13 C 7 -19, 17 -17, 17 -8 C 17 2, 0 16, 0 16 Z" fill="white" opacity="0.95"/>
            <path d="M -16 -4 C -30 -10, -28 -22, -20 -20 C -24 -14, -22 -8, -16 -4 Z" fill="white" opacity="0.9"/>
            <path d="M 16 -4 C 30 -10, 28 -22, 20 -20 C 24 -14, 22 -8, 16 -4 Z" fill="white" opacity="0.9"/>
            <circle cx="0" cy="-22" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="-32" cy="10" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="32" cy="10" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="-18" cy="22" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="18" cy="22" r="2.5" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 3: FLOR ROSETÓN CEMPASÚCHIL */}
          <g id="papel-cutout-flower">
            <circle cx="0" cy="0" r="5.5" fill="white" opacity="0.95"/>
            <circle cx="0" cy="-13" r="4" fill="white" opacity="0.95"/>
            <circle cx="0" cy="13" r="4" fill="white" opacity="0.95"/>
            <circle cx="-13" cy="0" r="4" fill="white" opacity="0.95"/>
            <circle cx="13" cy="0" r="4" fill="white" opacity="0.95"/>
            <circle cx="-9" cy="-9" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="9" cy="-9" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="-9" cy="9" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="9" cy="9" r="3.5" fill="white" opacity="0.95"/>
            <circle cx="-28" cy="0" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="28" cy="0" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="0" cy="-25" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="0" cy="25" r="2.5" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 4: ESTRELLA CELESTIAL */}
          <g id="papel-cutout-star">
            <polygon points="0,-18 5,-6 18,-6 8,3 12,16 0,8 -12,16 -8,3 -18,-6 -5,-6" fill="white" opacity="0.95"/>
            <circle cx="-25" cy="-14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="25" cy="-14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="-25" cy="14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="25" cy="14" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="0" cy="24" r="2.5" fill="white" opacity="0.9"/>
          </g>
        </defs>

        {/* CUERDA RÚSTICA: TRAZADA EXACTAMENTE POR LA PARTE SUPERIOR DE CADA BANDERÍN */}
        <path 
          d="M 70,16 Q 500,104 930,16" 
          fill="none" 
          stroke="#C8A57A" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeDasharray="7,2"
        />

        {/* ========================================================
             LOS 6 BANDERINES (ANCHO 120px CADA UNO · SEPARACIÓN 14px)
             ======================================================== */}

        {/* Banderín 1: Morado Violeta - Flor Cempasúchil */}
        <g transform="translate(156, 32)">
          <g transform="rotate(9.3)">
            <animateTransform attributeName="transform" type="rotate" values="8; 11; 8" dur="5.2s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#8B5CF6" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-flower" x="0" y="34"/>
          </g>
        </g>

        {/* Banderín 2: Naranja Cempasúchil - HUELLA DE PERRITO 🐾 */}
        <g transform="translate(294, 50)">
          <g transform="rotate(5.6)">
            <animateTransform attributeName="transform" type="rotate" values="4; 7; 4" dur="4.6s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-paw" x="0" y="34"/>
          </g>
        </g>

        {/* Banderín 3: Rosa Mexicano - Alas de Ángel y Corazón 💖 */}
        <g transform="translate(431, 59)">
          <g transform="rotate(1.9)">
            <animateTransform attributeName="transform" type="rotate" values="0.5; 3.5; 0.5" dur="5.6s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#EC4899" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-angel-heart" x="0" y="34"/>
          </g>
        </g>

        {/* Banderín 4: Amarillo Oro - Estrella Celestial ⭐ */}
        <g transform="translate(569, 59)">
          <g transform="rotate(-1.9)">
            <animateTransform attributeName="transform" type="rotate" values="-3.5; -0.5; -3.5" dur="4.9s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#F59E0B" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-star" x="0" y="34"/>
          </g>
        </g>

        {/* Banderín 5: Naranja Cempasúchil - HUELLA DE PERRITO 🐾 */}
        <g transform="translate(706, 50)">
          <g transform="rotate(-5.6)">
            <animateTransform attributeName="transform" type="rotate" values="-7; -4; -7" dur="5.3s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-paw" x="0" y="34"/>
          </g>
        </g>

        {/* Banderín 6: Morado Púrpura - Flor Cempasúchil */}
        <g transform="translate(844, 32)">
          <g transform="rotate(-9.3)">
            <animateTransform attributeName="transform" type="rotate" values="-11; -8; -11" dur="4.8s" repeatCount="indefinite"/>
            <path d="M -60,0 L 60,0 L 60,70 Q 48,78 36,70 Q 24,78 12,70 Q 0,78 -12,70 Q -24,78 -36,70 Q -48,78 -60,70 Z" fill="#6D28D9" filter="url(#papel-paper-shadow)"/>
            <circle cx="-50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="-50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="12" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="28" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="44" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="50" cy="60" r="2.2" fill="white" opacity="0.85"/>
            <use href="#papel-cutout-flower" x="0" y="34"/>
          </g>
        </g>

      </svg>
    </div>
  );
}
