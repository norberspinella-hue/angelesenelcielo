import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { resolveAuthorizedTestRecipient } from '@/lib/community/stagingEmailAdapter';

export interface World3DClaimEmailPayload {
  requestedEmail: string;
  petName: string;
  spaceId: string;
  spaceDisplayName: string;
  rawToken: string;
  appOrigin?: string;
}

export interface World3DClaimEmailResult {
  sent: boolean;
  reason: string;
}

function isValidClaimOrigin(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl.trim());
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return null;
    const isAllowed =
      host === 'todaslasmascotasvanalcielo.com' ||
      host === 'www.todaslasmascotasvanalcielo.com' ||
      host === 'angelesenelcielo-staging.vercel.app' ||
      /^angelesenelcielo-[a-z0-9-]+-todoslasmascotasvanalcielo\.vercel\.app$/.test(host);
    return isAllowed ? u.origin : null;
  } catch {
    return null;
  }
}

/**
 * Envío aislado del Magic Link para reclamar la 1.ª plaza 3D de un homenaje ya pagado.
 * En Staging solo envía a destinatarios de prueba autorizados (`resolveAuthorizedTestRecipient`)
 * cuando `COMMUNITY_EMAIL_SEND_ENABLED === 'true'`. Nunca registra tokens en consola ni respuestas HTTP.
 */
export async function sendWorld3DClaimMagicLink(
  payload: World3DClaimEmailPayload
): Promise<World3DClaimEmailResult> {
  if (process.env.NODE_ENV !== 'production') {
    captureDevWorld3DClaimEmail(payload);
  }

  const allowedEnv = process.env.COMMUNITY_ALLOWED_ENV || '';
  if (allowedEnv !== 'staging' && allowedEnv !== 'production') {
    return { sent: false, reason: 'entorno_no_habilitado' };
  }

  if (process.env.COMMUNITY_EMAIL_SEND_ENABLED !== 'true') {
    return { sent: false, reason: 'envio_desactivado' };
  }

  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return { sent: false, reason: 'falta_resend_api_key' };
  }

  const recipient =
    allowedEnv === 'staging'
      ? resolveAuthorizedTestRecipient(payload.requestedEmail)
      : payload.requestedEmail.trim().toLowerCase();

  if (!recipient) {
    return { sent: false, reason: 'destinatario_no_autorizado' };
  }

  const baseOrigin =
    isValidClaimOrigin(payload.appOrigin || '') ||
    isValidClaimOrigin(process.env.NEXT_PUBLIC_APP_URL || '') ||
    isValidClaimOrigin(process.env.NEXT_PUBLIC_URL || '');

  if (!baseOrigin) {
    return { sent: false, reason: 'origin_no_valido' };
  }

  const claimUrl = `${baseOrigin}/mural-global?space_id=${encodeURIComponent(payload.spaceId)}&claim_token=${encodeURIComponent(payload.rawToken)}&source=cielo3d`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `Ángeles en el Cielo <${fromEmail}>`,
    to: [recipient],
    subject: `${allowedEnv === 'staging' ? '[STAGING] ' : ''}Confirma el lugar 3D para ${payload.petName}`,
    html: `
      <div style="font-family: Georgia, serif; color: #541731; background: #FFF8F0; padding: 24px; border-radius: 12px; border: 1px solid #D4B79E; max-width: 540px; margin: 0 auto;">
        <h2 style="margin: 0 0 12px; font-size: 22px;">Tu homenaje para ${payload.petName}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4E2331;">
          Has solicitado vincular tu homenaje ya pagado del Mural Global al espacio 3D <strong>${payload.spaceDisplayName}</strong> sin coste adicional.
        </p>
        <p style="margin: 24px 0;">
          <a href="${claimUrl}" style="display: inline-block; background: #541731; color: #FFF6EE; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-family: sans-serif; font-weight: bold; font-size: 14px;">
            Confirmar lugar 3D →
          </a>
        </p>
        <p style="font-size: 12px; color: #7A4253;">
          Este enlace es personal, de un solo uso y caduca en 15 minutos.
        </p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, reason: 'error_resend' };
  }

  return { sent: true, reason: 'ok' };
}

function captureDevWorld3DClaimEmail(payload: World3DClaimEmailPayload): void {
  try {
    const appOrigin = payload.appOrigin || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
    const claimUrl = `${appOrigin}/mural-global?space_id=${encodeURIComponent(payload.spaceId)}&claim_token=${encodeURIComponent(payload.rawToken)}&source=cielo3d`;
    const sinkPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'world3d_claim_email_sink.json');
    let existing: Array<Record<string, string>> = [];
    if (fs.existsSync(sinkPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(sinkPath, 'utf8'));
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }
    }
    existing.push({
      id: `world3d-claim-${Date.now()}`,
      spaceId: payload.spaceId,
      petName: payload.petName,
      rawToken: payload.rawToken,
      claimUrl,
      createdAt: new Date().toISOString(),
    });
    if (existing.length > 20) existing = existing.slice(-20);
    fs.writeFileSync(sinkPath, JSON.stringify(existing, null, 2), { mode: 0o600 });
  } catch {
    // Silencioso en caso de entorno sin escritura temporal
  }
}
