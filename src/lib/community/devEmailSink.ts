import fs from 'fs';
import path from 'path';

export interface CapturedDevEmail {
  id: string;
  toBlindHint: string;
  tributeSlug: string;
  magicLinkUrl: string;
  createdAt: string;
}

/**
 * Capturador de correo exclusivo para desarrollo/pruebas locales aisladas.
 * - NUNCA activo en producción.
 * - NUNCA escribe tokens en console.log ni en respuestas HTTP públicas.
 * - Permite verificar el intercambio completo de Magic Links de un solo uso en pruebas automatizadas locales.
 */
export function captureDevMagicLinkEmail(params: {
  tributeSlug: string;
  emailBlindHint: string;
  rawToken: string;
}): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
  const magicLinkUrl = `${appUrl}/comunidad?magicToken=${encodeURIComponent(params.rawToken)}&tribute=${encodeURIComponent(params.tributeSlug)}`;

  const entry: CapturedDevEmail = {
    id: `dev-mail-${Date.now()}`,
    toBlindHint: params.emailBlindHint.slice(0, 12),
    tributeSlug: params.tributeSlug,
    magicLinkUrl,
    createdAt: new Date().toISOString(),
  };

  try {
    const sinkPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cartas_dev_email_sink.json');
    let existing: CapturedDevEmail[] = [];
    if (fs.existsSync(sinkPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(sinkPath, 'utf8'));
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }
    }
    existing.push(entry);
    // Conservar solo los últimos 20 mensajes locales
    if (existing.length > 20) existing = existing.slice(-20);
    fs.writeFileSync(sinkPath, JSON.stringify(existing, null, 2), { mode: 0o600 });
  } catch {
    // Silencioso si no hay permisos de escritura en TEMP
  }
}
