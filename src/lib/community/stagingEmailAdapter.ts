import { Resend } from 'resend';

export interface StagingMagicLinkPayload {
  requestedEmail: string;
  tributeSlug: string;
  petName: string;
  rawToken: string;
  kind?: 'magic' | 'claim_control';
  appOrigin?: string;
}

function isValidStagingBaseUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl.trim());
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('todaslasmascotasvanalcielo.com')) {
      return null;
    }
    // RFC 1035: cada etiqueta DNS debe tener <= 63 caracteres
    if (host.split('.').some((label) => label.length === 0 || label.length > 63)) {
      return null;
    }
    const extraAllowlist = (process.env.COMMUNITY_ALLOWED_APP_ORIGINS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const isAllowed =
      host === 'angelesenelcielo-staging.vercel.app' ||
      /^angelesenelcielo-[a-z0-9]+-todoslasmascotasvanalcielo\.vercel\.app$/.test(host) ||
      extraAllowlist.includes(u.origin.toLowerCase()) ||
      extraAllowlist.includes(host);

    return isAllowed ? u.origin : null;
  } catch {
    return null;
  }
}

export interface StagingEmailResult {
  sent: boolean;
  reason: string;
}

/**
 * Comprueba si un destinatario pertenece exclusivamente a la lista blanca de pruebas.
 * Impide cualquier envío accidental a direcciones de familias reales.
 */
export function resolveAuthorizedTestRecipient(requestedEmail: string): string | null {
  const sink = (process.env.COMMUNITY_EMAIL_SINK || '').trim().toLowerCase();
  if (sink) {
    return sink;
  }

  const normalized = requestedEmail.trim().toLowerCase();
  if (normalized.endsWith('@resend.dev')) {
    return normalized;
  }

  const allowlist = (process.env.COMMUNITY_ALLOWED_TEST_RECIPIENTS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.includes(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Adaptador controlado de Resend para Magic Links en Supabase Staging / Preview.
 * - Desactivado por defecto si COMMUNITY_EMAIL_SEND_ENABLED !== 'true'.
 * - Solo activo si COMMUNITY_ALLOWED_ENV === 'staging'.
 * - Nunca envía correos a familias reales ni registra tokens en consola.
 */
export async function sendStagingMagicLinkEmail(
  payload: StagingMagicLinkPayload
): Promise<StagingEmailResult> {
  if (process.env.COMMUNITY_ALLOWED_ENV !== 'staging') {
    return { sent: false, reason: 'entorno_no_staging' };
  }

  if (process.env.COMMUNITY_EMAIL_SEND_ENABLED !== 'true') {
    return { sent: false, reason: 'envio_desactivado' };
  }

  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return { sent: false, reason: 'falta_resend_api_key' };
  }

  const recipient = resolveAuthorizedTestRecipient(payload.requestedEmail);
  if (!recipient) {
    return { sent: false, reason: 'destinatario_no_autorizado_en_staging' };
  }

  const appUrl =
    isValidStagingBaseUrl(process.env.NEXT_PUBLIC_APP_URL || '') ||
    isValidStagingBaseUrl(payload.appOrigin || '');
  if (!appUrl) {
    return { sent: false, reason: 'url_staging_no_autorizada_o_invalida' };
  }

  const paramName = payload.kind === 'claim_control' ? 'claimToken' : 'magicToken';
  const magicUrl = `${appUrl}/comunidad?${paramName}=${encodeURIComponent(payload.rawToken)}&tribute=${encodeURIComponent(payload.tributeSlug)}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `Ángeles en el Cielo (Staging) <${fromEmail}>`,
    to: [recipient],
    subject: `[STAGING] Enlace temporal para acceder a las cartas de ${payload.petName}`,
    html: `
      <div style="font-family: Georgia, serif; color: #541731; background: #FFF8F0; padding: 24px; border-radius: 12px; border: 1px solid #D4B79E; max-width: 540px; margin: 0 auto;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8C3F71; margin: 0 0 8px;">Entorno de Pruebas Aislado (Staging)</p>
        <h2 style="margin: 0 0 12px; font-size: 22px;">Acceso temporal a las cartas para ${payload.petName}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4E2331;">
          Has solicitado un enlace de un solo uso para acceder como familia guardiana. Este enlace caduca en <strong>15 minutos</strong> y se invalida automáticamente tras utilizarse.
        </p>
        <p style="margin: 24px 0;">
          <a href="${magicUrl}" style="display: inline-block; background: #541731; color: #FFF6EE; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-family: sans-serif; font-weight: bold; font-size: 14px;">
            Abrir acceso seguro →
          </a>
        </p>
        <p style="font-size: 12px; color: #7A4253;">
          Si no solicitaste este acceso de prueba, puedes ignorar este mensaje.
        </p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, reason: 'error_resend' };
  }

  return { sent: true, reason: 'ok' };
}
