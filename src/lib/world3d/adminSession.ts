import crypto from 'node:crypto';

export const ADMIN_3D_COOKIE_NAME = '__Host-aec_admin_3d';
export type World3DAdminRole = 'cartas_admin' | 'garden_curator';

function getAdminIdentitySecret(): string | null {
  const s = (process.env.CARTAS_ADMIN_IDENTITY_SECRET || '').trim();
  return s.length >= 16 ? s : null;
}

export function verifyAdminPinSecret(candidate: string): boolean {
  const expected = (process.env.ADMIN_MODERACION_PIN || process.env.ADMIN_SECRET || '').trim();
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthorizedAdminRoleEmail(role: World3DAdminRole, email: string): boolean {
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  const target =
    role === 'cartas_admin'
      ? (process.env.CARTAS_OWNER_EMAIL || '').trim().toLowerCase()
      : (process.env.GARDEN_CURATOR_EMAIL || '').trim().toLowerCase();
  return Boolean(target && clean === target);
}

export function resolveExplicitAdminSubject(role: World3DAdminRole): string | null {
  const list =
    role === 'cartas_admin'
      ? process.env.CARTAS_ADMIN_SUBJECT_ALLOWLIST || ''
      : process.env.GARDEN_CURATOR_SUBJECT || process.env.CARTAS_ADMIN_SUBJECT_ALLOWLIST || '';
  const first = list
    .split(',')
    .map((s) => s.trim())
    .find(Boolean);
  return first || null;
}

export function createWorld3DAdminToken(params: {
  role: World3DAdminRole;
  subject: string;
  email: string;
  ttlSeconds?: number;
}): string | null {
  const secret = getAdminIdentitySecret();
  if (!secret) return null;

  const payload = {
    aud: 'cielo3d-admin',
    role: params.role,
    subject: params.subject,
    email: params.email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + (params.ttlSeconds ?? 4 * 60 * 60),
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}
