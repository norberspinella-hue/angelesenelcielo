import { PetData } from './types';

// Helper para precargar fuentes y esperar a que el navegador las tenga listas
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
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

  // 1. Cargar recursos en paralelo
  const [bgImg, photoImg, signatureImg, planBadgeImg, shelterBadgeImg] = await Promise.all([
    loadSafeImage('/images/mural-preview/card-heaven-front-master.webp'),
    loadSafeImage(petData.photo_url || '/images/placeholders/first.webp').catch(() => loadSafeImage('/images/placeholders/first.webp')),
    loadSafeImage('/images/mural-preview/Angeles_en_el_Cielo_Firma_Oficial_transparent.png').catch(() => null),
    loadSafeImage('/images/icons/plans/icon-plan-eterno.svg').catch(() => null),
    isShelterPet ? loadSafeImage('/images/icons/badge-alas-angel.webp').catch(() => null) : Promise.resolve(null),
  ]);

  // Dibujar Fondo Celestial
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Insignia Corazón de Ángel (si aplica)
  if (isShelterPet && shelterBadgeImg) {
    ctx.save();
    const bx = 45;
    const by = 40;
    const bw = 320;
    const bh = 76;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(244, 114, 182, 0.35)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 38);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.drawImage(shelterBadgeImg, bx + 12, by + 10, 56, 56);
    ctx.font = '800 24px sans-serif';
    ctx.fillStyle = '#BE185D';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORAZÓN DE ÁNGEL', bx + 78, by + bh / 2 + 2);
    ctx.restore();
  }

  // Encabezado "MI ANGELITO" curvado o centrado con arco superior
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 48px Georgia, serif';
  ctx.fillStyle = '#584582';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 8;
  try {
    // @ts-ignore
    ctx.letterSpacing = '8px';
  } catch (e) {}
  ctx.fillText('MI ANGELITO', width / 2, 120);
  ctx.restore();

  // Nombre de la mascota en caligrafía Allura con ajuste de tamaño dinámico
  const petName = petData.pet_name || 'Ángel';
  const nameLen = petName.trim().length;
  let nameFontSize = 130;
  if (nameLen > 16) nameFontSize = 75;
  else if (nameLen > 12) nameFontSize = 90;
  else if (nameLen > 8) nameFontSize = 110;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${nameFontSize}px "Allura", "Pinyon Script", cursive`;
  ctx.fillStyle = '#C29028';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 10;
  ctx.fillText(petName, width / 2, 230);
  ctx.restore();

  // Corazón dorado ornamental bajo el nombre
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#D4AF37';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText('💛', width / 2, 290);
  ctx.restore();

  // Resplandor cálido central antes de la foto
  ctx.save();
  const auraGrad = ctx.createRadialGradient(width / 2, 600, 100, width / 2, 600, 400);
  auraGrad.addColorStop(0, 'rgba(255, 250, 220, 0.85)');
  auraGrad.addColorStop(0.5, 'rgba(255, 240, 200, 0.45)');
  auraGrad.addColorStop(1, 'rgba(255, 240, 190, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(width / 2, 600, 400, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Aureola Celestial Dorada sobre la cabeza
  const haloCenterX = width / 2;
  const haloCenterY = 400;
  const haloRx = 230;
  const haloRy = 60;
  ctx.save();
  ctx.translate(haloCenterX, haloCenterY);
  ctx.rotate((-4 * Math.PI) / 180);

  // Aura difusa exterior del halo
  ctx.beginPath();
  ctx.ellipse(0, 0, haloRx, haloRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = 18;
  ctx.shadowColor = 'rgba(255, 213, 79, 0.9)';
  ctx.shadowBlur = 32;
  ctx.stroke();

  // Núcleo brillante
  ctx.beginPath();
  ctx.ellipse(0, 0, haloRx, haloRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();

  // Fotografía de la Mascota en Marco Circular Protagonista
  const photoCenterX = width / 2;
  const photoCenterY = 660;
  const photoRadius = 265;

  ctx.save();
  // Sombra exterior suave
  ctx.shadowColor = 'rgba(74, 31, 110, 0.25)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(photoImg, photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);
  ctx.restore();

  // Borde perimetral dorado con brillo cálido
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#C9A961';
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(201, 169, 97, 0.6)';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  // Distintivo de Plan Eterno en la esquina de la foto
  if (planBadgeImg) {
    ctx.save();
    const pbSize = 160;
    const pbx = photoCenterX + photoRadius - 70;
    const pby = photoCenterY + photoRadius - 70;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 12;
    ctx.drawImage(planBadgeImg, pbx, pby, pbSize, pbSize);
    ctx.restore();
  }

  // Zona Inferior: Frase conmemorativa
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 36px Georgia, serif';
  ctx.fillStyle = '#584582';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText('Siempre serás mi lugar favorito en el mundo.', width / 2, 1070);
  ctx.restore();

  // Firma Oficial de Ángeles en el Cielo
  if (signatureImg) {
    ctx.save();
    const sigW = 420;
    const sigH = (signatureImg.height / signatureImg.width) * sigW;
    const sigX = (width - sigW) / 2;
    const sigY = 1140;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 6;
    ctx.drawImage(signatureImg, sigX, sigY, sigW, sigH);
    ctx.restore();
  } else {
    // Respaldo caligráfico si la imagen fallara
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '400 48px "Allura", "Pinyon Script", cursive';
    ctx.fillStyle = '#B8860B';
    ctx.fillText('Ángeles en el Cielo', width / 2, 1180);
    ctx.restore();
  }

  // Lema oficial en mayúsculas discretas
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 20px sans-serif';
  ctx.fillStyle = '#8B7B9E';
  try {
    // @ts-ignore
    ctx.letterSpacing = '5px';
  } catch (e) {}
  ctx.fillText('TODOS LOS PERROS VAN AL CIELO', width / 2, 1310);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

// =========================================================================
// MOTOR DE EXPORTACIÓN CANVAS 2D DE ALTA RESOLUCIÓN: REVERSO (DEDICATORIA)
// Resolución: 1080 × 1500 px (proporción exacta de la tarjeta 360:500)
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
    ctx.drawImage(logoHeartImg, (width - lhSize) / 2, 70, lhSize, lhSize);
    ctx.restore();
  }

  // Título: "La historia de {pet_name}"
  const petName = petData.pet_name || 'Ángel';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 700 48px Georgia, serif';
  ctx.fillStyle = '#4A3F6B';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(`La historia de ${petName}`, width / 2, 210);
  ctx.restore();

  // Fechas (si existen)
  if (datesStr) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 28px sans-serif';
    ctx.fillStyle = '#8A7B9B';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(datesStr, width / 2, 265);
    ctx.restore();
  }

  // Área central crema translúcida tipo pergamino para la lectura
  const boxX = 90;
  const boxY = datesStr ? 315 : 280;
  const boxW = width - 180;
  const boxH = 760;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 252, 245, 0.92)';
  ctx.strokeStyle = 'rgba(201, 169, 97, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(100, 70, 150, 0.12)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 28);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Borde decorativo lateral izquierdo de acento rosa
  ctx.save();
  ctx.strokeStyle = 'rgba(236, 111, 163, 0.65)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(boxX + 24, boxY + 30);
  ctx.lineTo(boxX + 24, boxY + boxH - 30);
  ctx.stroke();
  ctx.restore();

  // Texto real completo de la dedicatoria con ajuste automático
  const rawDedication = petData.dedication || 'Siempre serás mi lugar favorito en el mundo.';
  const dedLen = rawDedication.length;

  let fontSize = 34;
  let lineHeight = 50;
  if (dedLen > 650) {
    fontSize = 22;
    lineHeight = 32;
  } else if (dedLen > 450) {
    fontSize = 25;
    lineHeight = 37;
  } else if (dedLen > 250) {
    fontSize = 28;
    lineHeight = 42;
  }

  ctx.save();
  ctx.font = `italic 400 ${fontSize}px Georgia, serif`;
  ctx.fillStyle = '#5A4E7A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const textX = boxX + 48;
  let textY = boxY + 36;
  const maxTextW = boxW - 80;

  const paragraphs = rawDedication.split('\n');
  for (const para of paragraphs) {
    if (!para.trim()) {
      textY += lineHeight * 0.6;
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextW && currentLine) {
        ctx.fillText(currentLine, textX, textY);
        textY += lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, textX, textY);
      textY += lineHeight;
    }
    textY += lineHeight * 0.4;
    if (textY > boxY + boxH - 60) break; // Límite inferior del pergamino
  }
  ctx.restore();

  // Usuario de redes sociales (si existe)
  const socialUser = petData.story_answers?.socialHandle || petData.story_answers?.tiktok || petData.story_answers?.instagram;
  if (socialUser) {
    ctx.save();
    const handleText = `@${socialUser.replace(/^@/, '')}`;
    ctx.font = '600 26px sans-serif';
    const hMetrics = ctx.measureText(handleText);
    const pillW = hMetrics.width + 50;
    const pillH = 50;
    const pillX = (width - pillW) / 2;
    const pillY = boxY + boxH + 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#BE185D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(handleText, width / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // Cierre inferior: "— Siempre en nuestro corazón 🐾"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 600 30px Georgia, serif';
  ctx.fillStyle = '#7B6F9A';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 6;
  const bottomY = socialUser ? boxY + boxH + 105 : boxY + boxH + 55;
  ctx.fillText('— Siempre en nuestro corazón 🐾', width / 2, bottomY);
  ctx.restore();

  // Firma Oficial de Ángeles en el Cielo al pie
  if (signatureImg) {
    ctx.save();
    const sigW = 340;
    const sigH = (signatureImg.height / signatureImg.width) * sigW;
    const sigX = (width - sigW) / 2;
    const sigY = bottomY + 35;
    ctx.drawImage(signatureImg, sigX, sigY, sigW, sigH);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
