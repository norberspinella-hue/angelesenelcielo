'use client';

export function PapelPicadoGarland({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none z-[-1] overflow-visible ${className}`}
      style={{
        top: 'calc(100% - 22px)',
        width: 'min(980px, calc(100% + 20px))',
        height: '140px',
      }}
      aria-hidden="true"
    >
      <svg 
        className="w-full h-full overflow-visible" 
        viewBox="0 0 1000 165" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Sombra suave para los papeles picados */}
          <filter id="papel-paper-shadow" x="-25%" y="-15%" width="150%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.8" floodColor="#38103A" floodOpacity="0.20"/>
          </filter>

          {/* CALADO 1: HUELLA DE PERRITO (Fiel a la foto de referencia) */}
          <g id="papel-cutout-paw">
            <ellipse cx="0" cy="5" rx="8.5" ry="7" fill="white" opacity="0.95"/>
            <ellipse cx="-7.5" cy="-6.5" rx="2.8" ry="4.2" transform="rotate(-16 -7.5 -6.5)" fill="white" opacity="0.95"/>
            <ellipse cx="-2.6" cy="-10.5" rx="2.8" ry="4.4" transform="rotate(-5 -2.6 -10.5)" fill="white" opacity="0.95"/>
            <ellipse cx="2.6" cy="-10.5" rx="2.8" ry="4.4" transform="rotate(5 2.6 -10.5)" fill="white" opacity="0.95"/>
            <ellipse cx="7.5" cy="-6.5" rx="2.8" ry="4.2" transform="rotate(16 7.5 -6.5)" fill="white" opacity="0.95"/>
            <circle cx="-16" cy="-12" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="16" cy="-12" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="-16" cy="13" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="16" cy="13" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="0" cy="17" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="-10" cy="16" r="1.8" fill="white" opacity="0.9"/>
            <circle cx="10" cy="16" r="1.8" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 2: ALAS DE ÁNGEL Y CORAZÓN */}
          <g id="papel-cutout-angel-heart">
            <path d="M 0 9 C 0 9, -10 1, -10 -5 C -10 -11, -4.5 -13, 0 -9 C 4.5 -13, 10 -11, 10 -5 C 10 1, 0 9, 0 9 Z" fill="white" opacity="0.95"/>
            <path d="M -9.5 -2 C -18 -5, -17 -13, -12 -12 C -14 -8, -13 -5, -9.5 -2 Z" fill="white" opacity="0.9"/>
            <path d="M 9.5 -2 C 18 -5, 17 -13, 12 -12 C 14 -8, 13 -5, 9.5 -2 Z" fill="white" opacity="0.9"/>
            <circle cx="0" cy="-14" r="1.6" fill="white" opacity="0.9"/>
            <circle cx="-14" cy="7" r="1.6" fill="white" opacity="0.9"/>
            <circle cx="14" cy="7" r="1.6" fill="white" opacity="0.9"/>
          </g>

          {/* CALADO 3: FLOR ROSETÓN TRADICIONAL */}
          <g id="papel-cutout-flower">
            <circle cx="0" cy="0" r="3.2" fill="white" opacity="0.95"/>
            <circle cx="0" cy="-7.5" r="2.3" fill="white" opacity="0.95"/>
            <circle cx="0" cy="7.5" r="2.3" fill="white" opacity="0.95"/>
            <circle cx="-7.5" cy="0" r="2.3" fill="white" opacity="0.95"/>
            <circle cx="7.5" cy="0" r="2.3" fill="white" opacity="0.95"/>
            <circle cx="-5.3" cy="-5.3" r="2" fill="white" opacity="0.95"/>
            <circle cx="5.3" cy="-5.3" r="2" fill="white" opacity="0.95"/>
            <circle cx="-5.3" cy="5.3" r="2" fill="white" opacity="0.95"/>
            <circle cx="5.3" cy="5.3" r="2" fill="white" opacity="0.95"/>
          </g>

          {/* CALADO 4: ESTRELLA CELESTIAL */}
          <g id="papel-cutout-star">
            <polygon points="0,-12 3.2,-4 11.5,-4 5,2 7.2,10 0,5 -7.2,10 -5,2 -11.5,-4 -3.2,-4" fill="white" opacity="0.95"/>
            <circle cx="-14" cy="-10" r="1.6" fill="white" opacity="0.9"/>
            <circle cx="14" cy="-10" r="1.6" fill="white" opacity="0.9"/>
            <circle cx="-14" cy="10" r="1.6" fill="white" opacity="0.9"/>
            <circle cx="14" cy="10" r="1.6" fill="white" opacity="0.9"/>
          </g>
        </defs>

        {/* Cuerda / Hilo rústico colgando en curva parabólica en U */}
        <path 
          d="M 30,12 Q 500,98 970,12" 
          fill="none" 
          stroke="#D7B58B" 
          strokeWidth="2.3" 
          strokeLinecap="round" 
          strokeDasharray="6,2"
        />

        {/* 8 Banderines de papel picado colgando a lo largo de la U */}

        {/* Banderín 1 (Izquierda superior): Violeta - Flor */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '14deg' }} 
          transform="translate(75, 23) rotate(14)"
        >
          <path d="M -26,0 L 26,0 L 26,60 Q 20,66 13,60 Q 6,66 0,60 Q -6,66 -13,60 Q -20,66 -26,60 Z" fill="#8B5CF6" filter="url(#papel-paper-shadow)"/>
          <circle cx="-20" cy="8" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="20" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="32" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="45" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="8" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="32" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="45" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-flower" x="0" y="28"/>
        </g>

        {/* Banderín 2: Naranja Cempasúchil - HUELLA DE PERRITO 🐾 */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '10deg' }} 
          transform="translate(195, 46) rotate(10)"
        >
          <path d="M -27,0 L 27,0 L 27,64 Q 21,70 14,64 Q 7,70 0,64 Q -7,70 -14,64 Q -21,70 -27,64 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
          <circle cx="-21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-paw" x="0" y="31"/>
        </g>

        {/* Banderín 3: Rosa Mexicano - Alas de Ángel y Corazón */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '5deg' }} 
          transform="translate(320, 64) rotate(5)"
        >
          <path d="M -27,0 L 27,0 L 27,64 Q 21,70 14,64 Q 7,70 0,64 Q -7,70 -14,64 Q -21,70 -27,64 Z" fill="#EC4899" filter="url(#papel-paper-shadow)"/>
          <circle cx="-21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-angel-heart" x="0" y="31"/>
        </g>

        {/* Banderín 4 (CENTRO DE LA U - MÁS BAJO): Amarillo Oro / Flor Cempasúchil - Estrella Celestial */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '0deg' }} 
          transform="translate(450, 76) rotate(0)"
        >
          <path d="M -28,0 L 28,0 L 28,66 Q 22,72 14,66 Q 7,72 0,66 Q -7,72 -14,66 Q -22,72 -28,66 Z" fill="#F59E0B" filter="url(#papel-paper-shadow)"/>
          <circle cx="-22" cy="10" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="-22" cy="25" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="-22" cy="39" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="-22" cy="53" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="22" cy="10" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="22" cy="25" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="22" cy="39" r="1.6" fill="white" opacity="0.9"/>
          <circle cx="22" cy="53" r="1.6" fill="white" opacity="0.9"/>
          <use href="#papel-cutout-star" x="0" y="33"/>
        </g>

        {/* Banderín 5: Morado Violeta - Huella de perrito 🐾 */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '-2deg' }} 
          transform="translate(580, 74) rotate(-2)"
        >
          <path d="M -27,0 L 27,0 L 27,64 Q 21,70 14,64 Q 7,70 0,64 Q -7,70 -14,64 Q -21,70 -27,64 Z" fill="#7C3AED" filter="url(#papel-paper-shadow)"/>
          <circle cx="-21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-paw" x="0" y="31"/>
        </g>

        {/* Banderín 6: Rosa Fucsia - Flor tradicional */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '-6deg' }} 
          transform="translate(705, 62) rotate(-6)"
        >
          <path d="M -27,0 L 27,0 L 27,64 Q 21,70 14,64 Q 7,70 0,64 Q -7,70 -14,64 Q -21,70 -27,64 Z" fill="#DB2777" filter="url(#papel-paper-shadow)"/>
          <circle cx="-21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-flower" x="0" y="31"/>
        </g>

        {/* Banderín 7: Naranja Cempasúchil - Alas y Corazón */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '-11deg' }} 
          transform="translate(825, 43) rotate(-11)"
        >
          <path d="M -27,0 L 27,0 L 27,64 Q 21,70 14,64 Q 7,70 0,64 Q -7,70 -14,64 Q -21,70 -27,64 Z" fill="#F97316" filter="url(#papel-paper-shadow)"/>
          <circle cx="-21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="9" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="36" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="21" cy="49" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-angel-heart" x="0" y="31"/>
        </g>

        {/* Banderín 8 (Derecha superior): Morado Púrpura - Flor */}
        <g 
          className="papel-flag-group" 
          style={{ ['--base-rot' as any]: '-15deg' }} 
          transform="translate(935, 20) rotate(-15)"
        >
          <path d="M -26,0 L 26,0 L 26,60 Q 20,66 13,60 Q 6,66 0,60 Q -6,66 -13,60 Q -20,66 -26,60 Z" fill="#6D28D9" filter="url(#papel-paper-shadow)"/>
          <circle cx="-20" cy="8" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="20" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="32" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="-20" cy="45" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="8" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="32" r="1.5" fill="white" opacity="0.85"/>
          <circle cx="20" cy="45" r="1.5" fill="white" opacity="0.85"/>
          <use href="#papel-cutout-flower" x="0" y="28"/>
        </g>
      </svg>
    </div>
  );
}
