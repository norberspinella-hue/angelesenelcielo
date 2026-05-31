'use client';

import React from "react";
import { DoradoEternoCertificateA4, EXAMPLE_DATA } from "@/components/certificates/DoradoEternoCertificateA4";
import { exportCertificateToPng } from "@/components/certificates/exportCertificate";

export default function CertificadoDemoPage() {
  const handleExport = async () => {
    try {
      await exportCertificateToPng("certificate-dorado-eterno", "certificado-demo-rocky");
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Error al exportar el certificado. Asegúrate de que las imágenes se carguen correctamente.");
    }
  };

  // Sobrescribimos con una imagen real del proyecto para evitar enlaces rotos
  const demoData = {
    ...EXAMPLE_DATA,
    petPhotoUrl: "/images/placeholders/first.webp"
  };

  return (
    <main className="min-h-screen bg-[#FFF8F4] py-12 px-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl text-center mb-8">
        <div className="text-sm font-bold text-[#C9A961] tracking-widest mb-2 uppercase">
          DEMO INTERACTIVA
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1E2A78] mb-4">
          Certificado Dorado Eterno
        </h1>
        <p className="text-[#706A95] mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          Esta es una página de prueba interactiva a escala reducida (scale = 0.28) para previsualización. 
          Puedes descargarlo en tamaño real y máxima resolución A4 (300 ppp) usando el botón de abajo.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-[#1E2A78] text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-[#151C5C] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          ⬇️ Descargar Certificado (PNG A4)
        </button>
      </div>

      {/* Tarjeta contenedora de la previsualización */}
      <div className="border border-white/80 rounded-[32px] shadow-[0_24px_70px_rgba(112,106,149,0.12)] overflow-hidden bg-white/50 backdrop-blur-md p-6 max-w-full flex justify-center items-center">
        {/* Renderizado del certificado a escala 0.28 para vista óptima en pantallas */}
        <DoradoEternoCertificateA4 data={demoData} scale={0.28} />
      </div>
    </main>
  );
}
