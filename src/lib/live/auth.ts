import crypto from 'crypto';
import { NextRequest } from 'next/server';

const COMPROMISED_PIN = '5a84545b';
const COMPROMISED_SECRET = '529ab53a1dd9fe03d3e2fd66ab97c75a3b45fb93e15c8e9c3c7bdd4d4c8a5095';

export const LIVE_PANEL_COOKIE_NAME = 'live_panel_session';

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getLiveStreamSecret(): string | null {
  const secret = (process.env.LIVE_STREAM_SECRET || '').trim();
  if (secret.length < 32 || secret === COMPROMISED_SECRET) {
    return null;
  }
  return secret;
}

export function getLiveStreamPin(): string | null {
  const pin = (process.env.LIVE_STREAM_PIN || '').trim();
  if (pin.length < 6 || pin === COMPROMISED_PIN) {
    return null;
  }
  return pin;
}

export function generateLiveSessionToken(secret: string, windowHours = 12): string {
  const timeBlock = Math.floor(Date.now() / (1000 * 60 * 60 * windowHours));
  return crypto.createHmac('sha256', secret).update(`live_stream_session_${timeBlock}`).digest('hex');
}

export function isValidLiveSessionToken(token: string, secret: string): boolean {
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return false;

  const curr = generateLiveSessionToken(secret);
  const prevTimeBlock = Math.floor(Date.now() / (1000 * 60 * 60 * 12)) - 1;
  const prev = crypto
    .createHmac('sha256', secret)
    .update(`live_stream_session_${prevTimeBlock}`)
    .digest('hex');

  return timingSafeCompare(token, curr) || timingSafeCompare(token, prev);
}

/**
 * Valida autenticación del panel de control aceptando tanto:
 * 1) Cookie HttpOnly `live_panel_session`
 * 2) Cabecera `Authorization: Bearer <token>` emitida por /api/live-tiktok/auth
 */
export function verifyLivePanelAuth(req: NextRequest): { ok: true } | { ok: false; status: 401 | 503; error: string } {
  const secret = getLiveStreamSecret();
  const pin = getLiveStreamPin();
  if (!secret || !pin) {
    return { ok: false, status: 503, error: 'Servicio de emisión no configurado o credenciales no disponibles.' };
  }

  const authHeader = req.headers.get('authorization');
  const bearer = authHeader && authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.substring(7).trim()
    : '';
  const cookieToken = req.cookies.get(LIVE_PANEL_COOKIE_NAME)?.value?.trim() || '';

  const candidate = bearer || cookieToken;
  if (!candidate || !isValidLiveSessionToken(candidate, secret)) {
    return { ok: false, status: 401, error: 'No autorizado: inicia sesión con tu PIN en el panel.' };
  }

  return { ok: true };
}

/**
 * Valida la cabecera Authorization: Bearer LIVE_INGEST_SECRET para el lector Node independiente.
 */
export function verifyLiveIngestAuth(req: NextRequest): { ok: true } | { ok: false; status: 401 | 503; error: string } {
  const expected = (process.env.LIVE_INGEST_SECRET || '').trim();
  if (expected.length < 32) {
    return { ok: false, status: 503, error: 'LIVE_INGEST_SECRET no configurado o insuficiente (mínimo 32 caracteres).' };
  }

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return { ok: false, status: 401, error: 'Autorización Bearer requerida.' };
  }

  const token = authHeader.substring(7).trim();
  if (!token || !timingSafeCompare(token, expected)) {
    return { ok: false, status: 401, error: 'Secreto de lector inválido.' };
  }

  return { ok: true };
}
