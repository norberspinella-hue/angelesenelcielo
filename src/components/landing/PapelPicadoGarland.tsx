'use client';

export function PapelPicadoGarland({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute left-0 right-0 w-full pointer-events-none select-none z-[5] overflow-visible ${className}`}
      style={{
        top: 'calc(100% - 20px)',
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

        {/* Cuerda rústica colgando en arco en 'U' a lo largo de todo el menú */}
        <path 
          d="M 30,12 Q 500,98 970,12" 
          fill="none" 
          stroke="#D7B58B" 
          strokeWidth="2.3" 
          strokeLinecap="round" 
          strokeDasharray="6,2"
        />

        {/* 8 Banderines de papel picado distribuidos a lo largo del menú */}

        {/* Banderín 1 (Izquierda superior ~7.5%): Violeta - Flor */}
        <g transform="translate(75, 23)">
          <g transform="rotate(14)">
            <animateTransform attributeName="transform" type="rotate" values="12; 16; 12" dur="5.2s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 2 (~19.5%): Naranja Cempasúchil - HUELLA DE PERRITO 🐾 */}
        <g transform="translate(195, 46)">
          <g transform="rotate(10)">
            <animateTransform attributeName="transform" type="rotate" values="8; 12; 8" dur="4.6s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 3 (~32%): Rosa Mexicano - Alas de Ángel y Corazón */}
        <g transform="translate(320, 64)">
          <g transform="rotate(5)">
            <animateTransform attributeName="transform" type="rotate" values="3; 7; 3" dur="5.8s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 4 (CENTRO DE LA U - MÁS BAJO ~45%): Amarillo Oro - Estrella Celestial */}
        <g transform="translate(450, 76)">
          <g transform="rotate(0)">
            <animateTransform attributeName="transform" type="rotate" values="-2; 2; -2" dur="4.9s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 5 (~58%): Morado Violeta - Huella de perrito 🐾 */}
        <g transform="translate(580, 74)">
          <g transform="rotate(-2)">
            <animateTransform attributeName="transform" type="rotate" values="-4; 0; -4" dur="5.4s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 6 (~70.5%): Rosa Fucsia - Flor tradicional */}
        <g transform="translate(705, 62)">
          <g transform="rotate(-6)">
            <animateTransform attributeName="transform" type="rotate" values="-8; -4; -8" dur="4.7s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 7 (~82.5%): Naranja Cempasúchil - Alas y Corazón */}
        <g transform="translate(825, 43)">
          <g transform="rotate(-11)">
            <animateTransform attributeName="transform" type="rotate" values="-13; -9; -13" dur="5.6s" repeatCount="indefinite" />
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
        </g>

        {/* Banderín 8 (Derecha superior ~93.5%): Morado Púrpura - Flor */}
        <g transform="translate(935, 20)">
          <g transform="rotate(-15)">
            <animateTransform attributeName="transform" type="rotate" values="-17; -13; -17" dur="5.1s" repeatCount="indefinite" />
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
        </g>
      </svg>
    </div>
  );
}
