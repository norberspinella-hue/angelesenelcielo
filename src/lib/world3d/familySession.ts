import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const FAMILY_3D_COOKIE_NAME = 'aec_family_3d';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días

export interface Family3DSessionPayload {
  emailHash: string;
  memorialIds: string[];
  exp: number;
}

function getIdentitySecret(): string | null {
  const s =
    process.env.WORLD3D_IDENTITY_SECRET ||
    process.env.COMMUNITY_HMAC_SECRET ||
    process.env.GUARDIAN_SESSION_SECRET ||
    '';
  return s.trim().length >= 16 ? s.trim() : null;
}

function signB64Url(input: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(input).digest('base64url');
}

export function createFamily3DSessionToken(params: {
  emailHash: string;
  memorialIds: string[];
  ttlSeconds?: number;
}): string | null {
  const secret = getIdentitySecret();
  if (!secret) return null;

  const payload: Family3DSessionPayload = {
    emailHash: params.emailHash,
    memorialIds: params.memorialIds.slice(0, 50),
    exp: Math.floor(Date.now() / 1000) + (params.ttlSeconds ?? SESSION_TTL_SECONDS),
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = signB64Url(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifyFamily3DSessionToken(token: string | undefined | null): Family3DSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const secret = getIdentitySecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expected = signB64Url(encoded, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Family3DSessionPayload;
    if (!parsed?.emailHash || !Array.isArray(parsed.memorialIds) || typeof parsed.exp !== 'number') {
      return null;
    }
    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readVerifiedFamily3DSessionFromCookies(): Family3DSessionPayload | null {
  try {
    const store = cookies();
    const raw = store.get(FAMILY_3D_COOKIE_NAME)?.value;
    return verifyFamily3DSessionToken(raw);
  } catch {
    return null;
  }
}

/**
 * Crea una aserción firmada corta (120s) de servidor a servidor entre Web y el Worker 3D.
 * Nunca se expone en URLs ni se confía en cabeceras enviadas directamente por el navegador.
 */
export function signWorld3DServerAssertion(payload: {
  memorialId: string;
  emailHash: string;
  isOwner: boolean;
  isAdmin: boolean;
}): string | null {
  const secret = getIdentitySecret();
  if (!secret) return null;

  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(body), 'utf8').toString('base64url');
  return `${encoded}.${signB64Url(encoded, secret)}`;
}
