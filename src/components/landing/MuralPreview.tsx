import Image from 'next/image';

export function MuralPreview() {
  // Placeholders for now. En el futuro conectaremos a Supabase.
  const latestAdded = Array.from({ length: 8 }).map((_, i) => ({ id: i, name: 'Próximamente' }));
  const founders = Array.from({ length: 8 }).map((_, i) => ({ id: i, name: 'Próximamente' }));

  return (
    <div className="mural-preview-card rounded-[24px] shadow-sm relative text-left">
      {/* Imagen de fondo */}
      <Image
        src="/images/mural preview/mural-preview.webp"
        alt="Mural de Ángeles"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center center', zIndex: 0 }}
      />
      {/* Overlay gradiente encima de la imagen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,248,244,0.65) 100%)'
      }} />

      {/* Content wrapper */}
      <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-stretch w-full">
      {/* Left Column */}
      <div className="mural-preview-left flex-1">
        <h3 className="text-[#1E2A78] font-bold text-xl mb-6">Últimos añadidos</h3>
        <div className="grid grid-cols-4 gap-4">
          {latestAdded.map((pet) => (
            <div key={`latest-${pet.id}`} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow-sm flex-shrink-0" />
              <span className="text-xs text-[#706A95] text-center font-medium leading-tight">{pet.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-[#C9A961]/20 my-2" />
      <div className="md:hidden h-px w-full bg-[#C9A961]/20 my-2" />

      {/* Right Column */}
      <div className="mural-preview-right flex-1">
        <h3 className="text-[#1E2A78] font-bold text-xl mb-6 flex items-center gap-2 flex-wrap">
          <span>Fundadores <span className="text-[#C9A961] text-base">★</span></span>
          <span className="text-[#706A95] text-xs font-normal">
            (1000 primeros ángeles de 4 patas)
          </span>
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {founders.map((pet) => (
            <div key={`founder-${pet.id}`} className="flex flex-col items-center gap-2 relative">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-[#C9A961] shadow-sm flex-shrink-0" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#C9A961] rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-white">★</div>
              </div>
              <span className="text-xs text-[#706A95] text-center font-medium leading-tight">{pet.name}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
