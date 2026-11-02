import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Secreto HMAC dedicado, independiente del PIN administrativo y de tokens de sesión.
 * Exigido obligatoriamente mediante variable de entorno ADMIN_RATE_LIMIT_HMAC_SECRET.
 * Prohibido el uso de claves alternativas o por defecto.
 */
function getHmacSecret(): string {
  const secret = process.env.ADMIN_RATE_LIMIT_HMAC_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error('CONFIG_ERROR: ADMIN_RATE_LIMIT_HMAC_SECRET obligatorio no configurado o insuficiente (mínimo 16 caracteres)');
  }
  return secret.trim();
}

/**
 * Extracción estricta y exclusiva de IP autenticada por la infraestructura de borde de Vercel.
 * En nuestro despliegue en Vercel, 'x-vercel-forwarded-for' es la ÚNICA cabecera cuya autenticidad
 * garantiza el proxy de Vercel (inyectada con la IP del socket TCP y limpiada de valores previos).
 * Se rechazan cabeceras manipulables por clientes como 'cf-connecting-ip', 'x-real-ip' o 'x-forwarded-for'.
 * Si no puede determinarse de forma confiable, retorna null para aplicar rechazo defensivo.
 */
export function getTrustedClientIp(req: NextRequest): string | null {
  // Cabecera Vercel Edge: garantizada y sobrescrita exclusivamente por el proxy de borde de Vercel
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    const candidate = vercelIp.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }

  // Si no se recibe la cabecera autenticada del proxy de Vercel o la IP es inválida, retornar null.
  // Rechazo seguro: no se aceptan cabeceras arbitrarias facilitadas por el cliente.
  return null;
}

function isValidIp(ip: string): boolean {
  // Validación estricta IPv4 e IPv6
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Seudonimiza la IP mediante HMAC-SHA256 con el secreto dedicado obligatorio.
 * Cero almacenamiento o registro de IPs reales en base de datos.
 */
export function getPseudonymizedKey(ip: string, scope = 'ip'): string {
  if (!ip || ip.trim().length === 0) {
    throw new Error('IP requerida para derivación de clave seudonimizada');
  }
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
 * Política FAIL-CLOSED: ante cualquier indisponibilidad de Supabase o secreto no configurado,
 * rechaza con HTTP 503 de manera controlada.
 */
export async function checkRateLimit(req: NextRequest): Promise<RateLimitCheckResult> {
  try {
    const ip = getTrustedClientIp(req);
    if (!ip) {
      return {
        allowed: false,
        status: 403,
        error: 'No se pudo determinar el origen confiable de la conexión de red. Acceso administrativo temporalmente rechazado.',
      };
    }

    const key = getPseudonymizedKey(ip, 'ip');

    if (!key || key.trim().length === 0) {
      return {
        allowed: false,
        status: 400,
        error: 'Identificador de solicitud administrativo no válido.',
      };
    }

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
    console.error('Excepción en comprobación de limitador administrativo (Fail-Closed):', err?.message || err);
    return {
      allowed: false,
      status: 503,
      error: 'Servicio de autenticación administrativa temporalmente no disponible. Intente nuevamente en unos minutos.',
    };
  }
}

/**
 * Registra un intento fallido de forma atómica en PostgreSQL mediante INSERT ... ON CONFLICT DO UPDATE.
 * Incrementa el contador y decide el bloqueo sin condiciones de carrera.
 */
export async function recordFailedAttempt(req: NextRequest): Promise<{ blocked: boolean; remainingSeconds?: number }> {
  try {
    const ip = getTrustedClientIp(req);
    if (!ip) {
      return { blocked: true, remainingSeconds: 900 };
    }

    const key = getPseudonymizedKey(ip, 'ip');

    if (!key || key.trim().length === 0) {
      return { blocked: true, remainingSeconds: 900 };
    }

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
      console.error('Error en record_admin_failed_attempt RPC (Fail-Closed):', error.message);
      return { blocked: true, remainingSeconds: 900 };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      blocked: !!row?.is_blocked,
      remainingSeconds: row?.remaining_seconds || 0,
    };
  } catch (err: any) {
    console.error('Excepción al registrar intento fallido (Fail-Closed):', err?.message || err);
    return { blocked: true, remainingSeconds: 900 };
  }
}

/**
 * Limpia los intentos registrados para la IP tras una autenticación exitosa legítima.
 */
export async function clearAttemptsOnSuccess(req: NextRequest): Promise<void> {
  try {
    const ip = getTrustedClientIp(req);
    if (!ip) return;

    const key = getPseudonymizedKey(ip, 'ip');
    if (!key || key.trim().length === 0) return;

    const supabase = createAdminClient();
    await (supabase as any)
      .rpc('clear_admin_attempts', { p_key: key });
  } catch (err: any) {
    console.warn('Advertencia no bloqueante al limpiar intentos tras éxito legítimo:', err?.message || err);
  }
}
