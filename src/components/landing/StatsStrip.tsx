export function StatsStrip() {
  return (
    <div className="stats-strip bg-white/40 backdrop-blur-md shadow-sm border border-white/60">
      <div className="offer-item text-center flex flex-col justify-center items-center py-8">
        <span className="text-4xl font-bold text-[#394B87]">1.000.000</span>
        <span className="text-[#706A95] text-sm font-medium uppercase tracking-wider mt-1">
          Espacios totales en el mural
        </span>
      </div>
      <div className="offer-item text-center flex flex-col justify-center items-center py-8">
        <span className="text-4xl font-bold text-[#C8B8E8]">1.000.000</span>
        <span className="text-[#706A95] text-sm font-medium uppercase tracking-wider mt-1">
          Ángeles en el Cielo
        </span>
      </div>
      <div className="offer-item text-center flex flex-col justify-center items-center py-8">
        <span className="text-4xl font-bold text-[#FBBF24]">1.000</span>
        <span className="text-[#706A95] text-sm font-medium uppercase tracking-wider mt-1">
          Ángeles Fundadores disponibles
        </span>
      </div>
    </div>
  );
}
