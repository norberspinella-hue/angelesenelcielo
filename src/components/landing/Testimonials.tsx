export function Testimonials() {
  return (
    <section className="pt-[62px] pb-16 text-center">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-4xl text-[#C9A961] mb-6">&quot;</div>
        <p className="text-2xl font-serif text-[#1E2A78] italic leading-relaxed">
          Crear este espacio para Max me ha dado mucha paz. Saber que su recuerdo 
          vivirá aquí para siempre y que puedo visitarlo cuando le echo de menos, 
          es un consuelo invaluable.
        </p>
        <div className="mt-8">
          <div className="font-bold text-[#1E2A78]">Laura G.</div>
          <div className="text-[#706A95] text-sm mt-1">Mamá de Max (Estrella Brillante)</div>
        </div>
        
        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-[#1E2A78]"></div>
          <div className="w-2 h-2 rounded-full bg-[#1E2A78]/20"></div>
          <div className="w-2 h-2 rounded-full bg-[#1E2A78]/20"></div>
        </div>
      </div>
    </section>
  );
}
