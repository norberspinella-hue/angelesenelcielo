/**
 * exportCertificate.ts
 * Exportar DoradoEternoCertificateA4 a PNG y PDF
 *
 * Estrategia recomendada por plantilla técnica:
 *   Frontend (preview rápido): html-to-image
 *   Producción / calidad máxima: Playwright en API route
 *
 * Instalar según estrategia elegida:
 *   npm install html-to-image
 *   npm install playwright  (solo backend/API route)
 */

// ─────────────────────────────────────────────────────────────────────────────
// OPCIÓN A · Frontend con html-to-image (para preview o descarga directa)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exporta el elemento del certificado como PNG y lo descarga en el navegador.
 * Llamar con el ref del componente a tamaño real (scale=1).
 *
 * @param elementId  id del div raíz del certificado ("certificate-dorado-eterno")
 * @param fileName   nombre del archivo descargado (sin extensión)
 */
export async function exportCertificateToPng(
  elementId: string = "certificate-dorado-eterno",
  fileName: string = "certificado-angelsenelcielo"
): Promise<void> {
  // Import dinámico para no cargar en SSR
  const { toPng } = await import("html-to-image");

  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Elemento #${elementId} no encontrado`);

  const dataUrl = await toPng(node, {
    width: 2480,
    height: 3508,
    pixelRatio: 1,
    quality: 1,
    cacheBust: true,
  });

  // Descargar automáticamente
  const link = document.createElement("a");
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Exporta el certificado como PDF imprimible (A4).
 * Usa la ventana de impresión del navegador con media print.
 * Para PDF de producción usar la ruta API con Playwright (ver Opción B).
 */
export function exportCertificateToPdfBrowser(
  elementId: string = "certificate-dorado-eterno"
): void {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Elemento #${elementId} no encontrado`);

  // Abrir ventana de impresión con solo el certificado visible
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Certificado Ángeles en el Cielo</title>
      <style>
        @page { size: A4 portrait; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 210mm; height: 297mm; overflow: hidden; }
        img { max-width: 100%; }
      </style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Nunito+Sans:wght@400;600&display=swap" rel="stylesheet" />
    </head>
    <body>
      ${node.outerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Esperar fuentes y luego imprimir
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 800);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper · Llamar a la API route desde el cliente
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCertificateViaApi(
  memoryCode: string,
  certificateUrl: string
): Promise<{ pngUrl: string; pdfUrl: string }> {
  const res = await fetch("/api/certificate/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memoryCode, certificateUrl }),
  });

  if (!res.ok) {
    throw new Error(`Error generando certificado: ${res.status}`);
  }

  return res.json();
}
