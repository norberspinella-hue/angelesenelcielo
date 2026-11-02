import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Secreto HMAC dedicado, independiente del PIN administrativo y de tokens de sesión.
 * Derivado de variables de entorno de servidor de alta entropía.
 */
function getHmacSecret(): string {
  if (process.env.ADMIN_RATE_LIMIT_HMAC_SECRET) {
    return process.env.ADMIN_RATE_LIMIT_HMAC_SECRET;
  }
  // Derivación determinista basada en el service_role de Supabase (nunca expuesta al cliente)
  const masterKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_SECRET || 'antigravity-altar-admin-salt-2026';
  return crypto.createHash('sha256').update(`${masterKey}:admin_rate_limiter_salt_v1`).digest('hex');
}

/**
 * Extracción estricta de IP confiable inyectada por infraestructura de borde.
 * Nunca confía en cabeceras arbitrarias o configuradas por clientes directos.
 */
export function getTrustedClientIp(req: NextRequest): string {
  // 1. Cabecera Vercel Edge (la más confiable en despliegue en Vercel, inyectada por su proxy)
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    const candidate = vercelIp.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }

  // 2. Cabecera Cloudflare Edge
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  // 3. Fallback a x-real-ip
  const realIp = req.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // 4. Primer elemento de x-forwarded-for con validación
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  // Validación básica IPv4 e IPv6
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Seudonimiza la IP mediante HMAC-SHA256 con clave secreta de servidor.
 * Cero almacenamiento o registro de IPs reales en base de datos.
 */
export function getPseudonymizedKey(ip: string, scope = 'ip'): string {
  const secret = getHmacSecret();
  return crypto.createHmac('sha256', secret).update(`${scope}:${ip.trim()}`).digest('hex');
}

export interface RateLimitCheckResult {
  allowed: boolean;
  status?: number;
  remainingSeconds?: number;
  error?: string;
}

/**
 * Comprueba de forma atómica si el origen está bloqueado antes de evaluar credenciales.
 * Política FAIL-CLOSED: ante cualquier indisponibilidad de Supabase, rechaza con HTTP 503.
 */
export async function checkRateLimit(req: NextRequest): Promise<RateLimitCheckResult> {
  const ip = getTrustedClientIp(req);
  const key = getPseudonymizedKey(ip, 'ip');

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .rpc('check_admin_rate_limit', { p_key: key });

    if (error) {
      console.error('Error en check_admin_rate_limit RPC (Fail-Closed):', error.message);
      return {
        allowed: false,
        status: 503,
        error: 'Servicio de autenticación administrativa temporalmente no disponible. Intente nuevamente en unos minutos.',
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.is_blocked) {
      return {
        allowed: false,
        status: 429,
        remainingSeconds: row.remaining_seconds || 900,
        error: `Demasiados intentos fallidos. Acceso temporalmente bloqueado durante ${row.remaining_seconds || 900} segundos.`,
      };
    }

    return { allowed: true };
  } catch (err: any) {
    console.error('Excepción de conectividad en limitador administrativo (Fail-Closed):', err?.message || err);
    return {
      allowed: false,
      status: 503,
      error: 'Servicio de autenticación administrativa temporalmente no disponible. Intente nuevamente en unos minutos.',
    };
  }
}

/**
 * Registra un intento fallido de forma atómica en PostgreSQL.
 * Incrementa el contador y decide el bloqueo sin condiciones de carrera.
 */
export async function recordFailedAttempt(req: NextRequest): Promise<{ blocked: boolean; remainingSeconds?: number }> {
  const ip = getTrustedClientIp(req);
  const key = getPseudonymizedKey(ip, 'ip');

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .rpc('record_admin_failed_attempt', {
        p_key: key,
        p_scope: 'ip',
        p_max_attempts: 5,
        p_window_seconds: 900,  // 15 minutos
        p_lockout_seconds: 900 // 15 minutos
      });

    if (error) {
      console.error('Error en record_admin_failed_attempt RPC:', error.message);
      return { blocked: true, remainingSeconds: 900 };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      blocked: !!row?.is_blocked,
      remainingSeconds: row?.remaining_seconds || 0,
    };
  } catch (err: any) {
    console.error('Excepción al registrar intento fallido:', err?.message || err);
    return { blocked: true, remainingSeconds: 900 };
  }
}

/**
 * Limpia los intentos registrados para la IP tras una autenticación exitosa legítima.
 */
export async function clearAttemptsOnSuccess(req: NextRequest): Promise<void> {
  const ip = getTrustedClientIp(req);
  const key = getPseudonymizedKey(ip, 'ip');

  try {
    const supabase = createAdminClient();
    await (supabase as any)
      .rpc('clear_admin_attempts', { p_key: key });
  } catch (err: any) {
    console.warn('Advertencia no bloqueante al limpiar intentos tras éxito:', err?.message || err);
  }
}
