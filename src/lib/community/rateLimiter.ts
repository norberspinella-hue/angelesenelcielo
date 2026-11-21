import { NextRequest, NextResponse } from 'next/server';
import { computeBlindIndex, getDbPool } from './tributesDb';

export type RateLimitAction = 'recover' | 'verify' | 'create_tribute' | 'publish_letter' | 'revoke';

const ACTION_LIMITS: Record<RateLimitAction, { maxAttempts: number; windowSeconds: number; lockoutSeconds: number }> = {
  recover: { maxAttempts: 5, windowSeconds: 900, lockoutSeconds: 900 },
  verify: { maxAttempts: 10, windowSeconds: 900, lockoutSeconds: 900 },
  create_tribute: { maxAttempts: 5, windowSeconds: 900, lockoutSeconds: 900 },
  publish_letter: { maxAttempts: 25, windowSeconds: 900, lockoutSeconds: 900 },
  revoke: { maxAttempts: 10, windowSeconds: 900, lockoutSeconds: 900 },
};

export function extractClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

/**
 * Comprueba y consume un intento en el limitador persistente de PostgreSQL (multi-instancia).
 * Devuelve null si está permitido, o NextResponse 429 si excede el umbral.
 */
export async function enforceRateLimit(
  req: NextRequest,
  action: RateLimitAction,
  extraIdentifier?: string
): Promise<NextResponse | null> {
  const pool = getDbPool();
  if (!pool) {
    // Fail-closed si el motor de BD no está disponible para operaciones mutadoras
    return NextResponse.json(
      { success: false, error: 'Servicio temporalmente no disponible.' },
      { status: 503 }
    );
  }

  const ip = extractClientIp(req);
  const rawKey = extraIdentifier ? `${action}:${ip}:${extraIdentifier}` : `${action}:${ip}`;
  const keyHash = computeBlindIndex(rawKey);
  const cfg = ACTION_LIMITS[action];

  try {
    const res = await pool.query(
      `SELECT allowed, remaining_attempts, retry_after_seconds
       FROM public.consume_community_rate_limit($1, $2, $3, $4, $5);`,
      [keyHash, action, cfg.maxAttempts, cfg.windowSeconds, cfg.lockoutSeconds]
    );

    const row = res.rows[0];
    if (row && row.allowed === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'Has realizado demasiadas solicitudes en poco tiempo. Por favor, espera unos minutos antes de intentarlo de nuevo.'
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(row.retry_after_seconds || cfg.lockoutSeconds),
          }
        }
      );
    }
    return null;
  } catch (err) {
    // Fail-closed ante errores de control de tasa
    return NextResponse.json(
      { success: false, error: 'No se pudo verificar el límite de solicitudes.' },
      { status: 503 }
    );
  }
}
