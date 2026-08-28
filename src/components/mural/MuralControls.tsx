export function MuralControls({
  onZoomIn,
  onZoomOut,
  onCenter,
  zoomLevel = 1,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  zoomLevel?: number;
}) {
  // Convert arbitrary zoom level to a percentage (assuming 1 is 100%)
  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className="absolute bottom-4 right-2.5 sm:bottom-8 sm:right-6 z-50 flex flex-col gap-2 pointer-events-auto select-none">
      <button 
        onClick={onCenter}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-white flex items-center justify-center text-[#1E2A78] hover:bg-white hover:text-[#C9A961] transition-colors font-bold text-[9px] sm:text-[10px]"
        title="Centrar Mural"
      >
        Centrar
      </button>
      
      <div className="flex flex-col rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-white overflow-hidden items-center">
        <button 
          onClick={onZoomIn}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#1E2A78] hover:bg-gray-50 hover:text-[#C9A961] transition-colors border-b border-gray-100"
          title="Acercar"
        >
          <span className="text-xl sm:text-2xl font-light">+</span>
        </button>
        <div className="w-10 sm:w-12 py-1.5 sm:py-2 flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#706A95] border-b border-gray-100 bg-white/50">
          {zoomPercent}%
        </div>
        <button 
          onClick={onZoomOut}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#1E2A78] hover:bg-gray-50 hover:text-[#C9A961] transition-colors"
          title="Alejar"
        >
          <span className="text-xl sm:text-2xl font-light">−</span>
        </button>
      </div>
    </div>
  );
}
