import { PetData } from './types';

// Helper para precargar fuentes y esperar a que el navegador las tenga listas
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('400 135px Allura'),
        document.fonts.load('700 46px Georgia'),
        document.fonts.load('400 32px Georgia'),
      ]);
      await document.fonts.ready;
    } catch (e) {
      console.warn('Advertencia cargando fuentes:', e);
    }
  }
}

// Helper para cargar imágenes de forma segura con reintento CORS
export function loadSafeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.decode) {
        img.decode().then(() => resolve(img)).catch(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => {
      const retryImg = new Image();
      retryImg.onload = () => resolve(retryImg);
      retryImg.onerror = (err) => reject(err);
      retryImg.src = src;
    };
    img.src = src;
  });
}

// Helper para dibujar imagen dentro de un marco circular aplicando object-fit: cover
function drawCircularImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const aspect = iw / ih;

  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (aspect > 1) {
    // Imagen horizontal: recortar los laterales centrando
    sw = ih;
    sx = (iw - sw) / 2;
  } else {
    // Imagen vertical: recortar parte superior/inferior centrando
    sh = iw;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

// =========================================================================
// MOTOR DE EXPORTACIÓN CANVAS 2D DE ALTA RESOLUCIÓN: ANVERSO (RECUERDO)
// Resolución: 1080 × 1500 px (proporción exacta de la tarjeta 360:500)
// =========================================================================
export async function generateFrontCardPng(petData: PetData, isShelterPet: boolean = false): Promise<string> {
  await ensureFontsLoaded();
  const width = 1080;
  const height = 1500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D.');

  // 1. Cargar recursos maestros
  const [bgImg, photoImg, signatureImg, planBadgeImg, shelterBadgeImg] = await Promise.all([
    loadSafeImage('/images/mural-preview/card-heaven-front-master.webp'),
    loadSafeImage(petData.photo_url || '/images/placeholders/first.webp').catch(() => loadSafeImage('/images/placeholders/first.webp')),
    loadSafeImage('/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png').catch(() => null),
    loadSafeImage('/images/icons/plans/icon-plan-eterno.svg').catch(() => null),
    isShelterPet ? loadSafeImage('/images/icons/badge-alas-angel.webp').catch(() => null) : Promise.resolve(null),
  ]);

  // Dibujar Fondo Celestial
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Insignia Corazón de Ángel (si es protectora, centrada en la parte superior para no colisionar)
  if (isShelterPet && shelterBadgeImg) {
    ctx.save();
    const bw = 350;
    const bh = 66;
    const bx = (width - bw) / 2;
    const by = 36;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(244, 114, 182, 0.40)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 33);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.drawImage(shelterBadgeImg, bx + 14, by + 8, 50, 50);
    ctx.font = '800 21px sans-serif';
    ctx.fillStyle = '#BE185D';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORAZÓN DE ÁNGEL', bx + 74, by + bh / 2 + 1);
    ctx.restore();
  }

  // Encabezado "MI ANGELITO" en serif clásico
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = isShelterPet ? '700 40px Georgia, serif' : '700 44px Georgia, serif';
  ctx.fillStyle = '#4A3258';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 8;
  try {
    // @ts-ignore
    ctx.letterSpacing = '8px';
  } catch (e) {}
  ctx.fillText('MI ANGELITO', width / 2, isShelterPet ? 142 : 115);
  ctx.restore();

  // Nombre de la mascota en caligrafía Allura con ajuste automático
  const petName = petData.pet_name || 'Ángel';
  const nameLen = petName.trim().length;
  let nameFontSize = 135;
  if (nameLen > 16) nameFontSize = 75;
  else if (nameLen > 12) nameFontSize = 90;
  else if (nameLen > 8) nameFontSize = 110;

  const nameY = isShelterPet ? 230 : 210;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${nameFontSize}px "Allura", "Pinyon Script", "Great Vibes", cursive`;
  ctx.fillStyle = '#B8860B';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 12;
  ctx.fillText(petName, width / 2, nameY);
  ctx.restore();

  // Corazón dorado ornamental bajo el nombre
  const heartY = isShelterPet ? 292 : 272;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#D4AF37';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText('💛', width / 2, heartY);
  ctx.restore();

  // Resplandor cálido central antes de la foto
  const photoCenterX = width / 2;
  const photoCenterY = 660;
  const photoRadius = 260;

  ctx.save();
  const auraGrad = ctx.createRadialGradient(photoCenterX, photoCenterY - 60, 80, photoCenterX, photoCenterY - 60, 360);
  auraGrad.addColorStop(0, 'rgba(255, 250, 220, 0.85)');
  auraGrad.addColorStop(0.5, 'rgba(255, 240, 200, 0.40)');
  auraGrad.addColorStop(1, 'rgba(255, 240, 190, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY - 60, 360, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Fotografía de la Mascota en Marco Circular Protagonista (con object-fit cover sin distorsión)
  ctx.save();
  ctx.shadowColor = 'rgba(74, 31, 110, 0.25)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  drawCircularImageCover(ctx, photoImg, photoCenterX, photoCenterY, photoRadius);
  ctx.restore();

  // Borde perimetral dorado luminoso
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#C9A961';
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(201, 169, 97, 0.6)';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  // Aureola Celestial Dorada (-4°): corona exactamente la parte superior del marco circular
  const haloCenterX = width / 2;
  const haloCenterY = 385; // Borde superior del círculo está en 400 (660 - 260), la aureola corona suavemente
  const haloRx = 210;
  const haloRy = 55;

  ctx.save();
  ctx.translate(haloCenterX, haloCenterY);
  ctx.rotate((-4 * Math.PI) / 180);

  // Aura difusa exterior del halo
  ctx.beginPath();
  ctx.ellipse(0, 0, haloRx, haloRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = 14;
  ctx.shadowColor = 'rgba(255, 213, 79, 0.95)';
  ctx.shadowBlur = 28;
  ctx.stroke();

  // Núcleo brillante blanco cálido
  ctx.beginPath();
  ctx.ellipse(0, 0, haloRx, haloRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();

  // Distintivo de Plan Eterno en la esquina inferior derecha del marco circular
  if (planBadgeImg) {
    ctx.save();
    const pbSize = 160;
    const pbx = photoCenterX + photoRadius * 0.72 - pbSize / 2;
    const pby = photoCenterY + photoRadius * 0.72 - pbSize / 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 12;
    ctx.drawImage(planBadgeImg, pbx, pby, pbSize, pbSize);
    ctx.restore();
  }

  // Zona Inferior: Mensaje conmemorativo
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 36px Georgia, serif';
  ctx.fillStyle = '#4A3258';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 6;
  ctx.fillText('Siempre serás mi lugar favorito en el mundo.', width / 2, 1010);
  ctx.restore();

  // Firma Oficial de Ángeles en el Cielo
  if (signatureImg) {
    ctx.save();
    const sigW = 380;
    const sigH = (signatureImg.height / signatureImg.width) * sigW;
    const sigX = (width - sigW) / 2;
    const sigY = 1065;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 6;
    ctx.drawImage(signatureImg, sigX, sigY, sigW, sigH);
    ctx.restore();
  }

  // Lema oficial en mayúsculas
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 22px sans-serif';
  ctx.fillStyle = '#8B7B9E';
  try {
    // @ts-ignore
    ctx.letterSpacing = '5px';
  } catch (e) {}
  ctx.fillText('TODAS LAS MASCOTAS VAN AL CIELO', width / 2, 1255);
  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
}

// =========================================================================
// MOTOR DE EXPORTACIÓN CANVAS 2D DE ALTA RESOLUCIÓN: REVERSO (HISTORIA)
// Resolución: 1080 × 1500 px (acabado pergamino luminoso celestial)
// =========================================================================
export async function generateBackCardPng(petData: PetData, datesStr: string = ''): Promise<string> {
  await ensureFontsLoaded();
  const width = 1080;
  const height = 1500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D.');

  // 1. Cargar recursos maestros
  const [bgImg, logoHeartImg, signatureImg] = await Promise.all([
    loadSafeImage('/images/mural-preview/card-heaven-back-master.webp'),
    loadSafeImage('/images/icons/Logoheart.svg').catch(() => null),
    loadSafeImage('/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png').catch(() => null),
  ]);

  // Dibujar Fondo Celestial Reverso
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Icono Logoheart superior
  if (logoHeartImg) {
    ctx.save();
    const lhSize = 100;
    ctx.shadowColor = 'rgba(236, 111, 163, 0.4)';
    ctx.shadowBlur = 14;
    ctx.drawImage(logoHeartImg, (width - lhSize) / 2, 65, lhSize, lhSize);
    ctx.restore();
  }

  // Título: "La historia de {pet_name}"
  const petName = petData.pet_name || 'Ángel';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 700 48px Georgia, serif';
  ctx.fillStyle = '#4A3F6B';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 8;
  ctx.fillText(`La historia de ${petName}`, width / 2, 205);
  ctx.restore();

  // Fechas (si existen)
  if (datesStr) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 28px sans-serif';
    ctx.fillStyle = '#8A7B9B';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 4;
    ctx.fillText(datesStr, width / 2, 260);
    ctx.restore();
  }

  // Área central crema translúcida tipo pergamino con acabado dorado luminoso
  const boxX = 90;
  const boxY = datesStr ? 310 : 275;
  const boxW = width - 180;
  const boxH = datesStr ? 680 : 715;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 252, 245, 0.94)';
  ctx.strokeStyle = '#D9A447';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(217, 164, 71, 0.28)';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 32);
  ctx.fill();
  ctx.stroke();

  // Reflejo fino interior dorado (#F6D991)
  ctx.strokeStyle = '#F6D991';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(boxX + 3, boxY + 3, boxW - 6, boxH - 6, 29);
  ctx.stroke();
  ctx.restore();

  // Texto real completo de la dedicatoria con ajuste estricto al ancho interior disponible
  const rawDedication = petData.dedication || 'Siempre serás mi lugar favorito en el mundo.';
  const dedLen = rawDedication.length;

  let fontSize = 34;
  let lineHeight = 52;
  if (dedLen > 650) {
    fontSize = 22;
    lineHeight = 34;
  } else if (dedLen > 450) {
    fontSize = 25;
    lineHeight = 38;
  } else if (dedLen > 250) {
    fontSize = 29;
    lineHeight = 44;
  }

  ctx.save();
  ctx.font = `italic 400 ${fontSize}px Georgia, serif`;
  ctx.fillStyle = '#4A3F6B';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const marginX = 55;
  const textX = boxX + marginX;
  let textY = boxY + 45;
  const maxTextW = boxW - marginX * 2; // 900 - 110 = 790px de ancho disponible
  const maxY = boxY + boxH - 45;

  const paragraphs = rawDedication.split(/\n+/);
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxTextW && currentLine !== '') {
        if (textY + lineHeight <= maxY) {
          ctx.fillText(currentLine, textX, textY);
          textY += lineHeight;
          currentLine = words[i];
        } else {
          currentLine += '...';
          break;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && textY + lineHeight <= maxY) {
      ctx.fillText(currentLine, textX, textY);
      textY += lineHeight + Math.round(lineHeight * 0.4); // Salto entre párrafos
    }
  }
  ctx.restore();

  // Zona Inferior del Reverso: Firma oficial y lema
  if (signatureImg) {
    ctx.save();
    const sigW = 380;
    const sigH = (signatureImg.height / signatureImg.width) * sigW;
    const sigX = (width - sigW) / 2;
    const sigY = 1045;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 6;
    ctx.drawImage(signatureImg, sigX, sigY, sigW, sigH);
    ctx.restore();
  }

  // Lema oficial en mayúsculas en el reverso
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 22px sans-serif';
  ctx.fillStyle = '#8B7B9E';
  try {
    // @ts-ignore
    ctx.letterSpacing = '5px';
  } catch (e) {}
  ctx.fillText('TODAS LAS MASCOTAS VAN AL CIELO', width / 2, 1240);
  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
}
