import React from 'react';

export function TrustStrip() {
  return (
    <div className="w-[min(1120px,calc(100%-32px))] mx-auto mt-6 mb-12 px-8 py-5 rounded-[40px] md:rounded-[999px] bg-white/40 border border-white/70 backdrop-blur-md shadow-[0_8px_32px_rgba(112,106,149,0.05)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center text-left">
        
        {/* Item 1 */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#C59B73]/20 flex items-center justify-center bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#C59B73" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E2A78] leading-tight">Hecho con amor</h4>
            <p className="text-xs text-[#706A95] mt-0.5 leading-normal">por familias de mascotas</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#C59B73]/20 flex items-center justify-center bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#C59B73" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 5.714Z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E2A78] leading-tight">Privado y seguro</h4>
            <p className="text-xs text-[#706A95] mt-0.5 leading-normal">tu memorial siempre protegido</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#C59B73]/20 flex items-center justify-center bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#C59B73" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E2A78] leading-tight">Comunidad que abraza</h4>
            <p className="text-xs text-[#706A95] mt-0.5 leading-normal">no estás solo en tu duelo</p>
          </div>
        </div>

        {/* Item 4 */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#C59B73]/20 flex items-center justify-center bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#C59B73" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.5v3m0 0 1-1m-1 1-1-1" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E2A78] leading-tight">Siempre en tu corazón</h4>
            <p className="text-xs text-[#706A95] mt-0.5 leading-normal">su recuerdo, para siempre</p>
          </div>
        </div>

      </div>
    </div>
  );
}
