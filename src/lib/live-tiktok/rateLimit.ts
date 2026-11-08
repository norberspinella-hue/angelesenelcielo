import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Extracción confiable de la IP del cliente:
 * - En producción (Vercel): 'x-vercel-forwarded-for' es la cabecera garantizada por el proxy perimetral de Vercel.
 * - En desarrollo / pruebas: soporte para 'x-forwarded-for' o '127.0.0.1'.
 */
export function getClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    const candidate = vercelIp.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Seudonimiza la IP para almacenamiento seguro mediante HMAC-SHA256.
 * Cero almacenamiento de IPs en texto claro en base de datos.
 */
function getPseudonymizedKey(ip: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`live_tiktok_pin:${ip.trim()}`).digest('hex');
}

export interface LiveRateLimitResult {
  allowed: boolean;
  status?: number;
  remainingSeconds?: number;
  error?: string;
}

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 900; // 15 minutos
const LOCKOUT_SECONDS = 900; // 15 minutos

// Memoria local auxiliar de contingencia
const localMemoryFallback = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

/**
 * Comprueba si la IP está bloqueada por exceso de intentos fallidos.
 * POLÍTICA FAIL-CLOSED: Si la base de datos o la RPC de seguridad no responde en producción,
 * el acceso se bloquea con HTTP 503 por seguridad preventiva (nunca se degrada en acceso abierto).
 */
export async function checkLiveRateLimit(req: NextRequest, secret: string): Promise<LiveRateLimitResult> {
  const ip = getClientIp(req);
  const key = getPseudonymizedKey(ip, secret);
  const now = Date.now();

  // 1. Comprobación rápida en memoria local de la instancia serverless
  const mem = localMemoryFallback.get(key);
  if (mem && mem.blockedUntil && mem.blockedUntil > now) {
    const remainingSeconds = Math.ceil((mem.blockedUntil - now) / 1000);
    return {
      allowed: false,
      status: 429,
      remainingSeconds,
      error: `Demasiados intentos fallidos. Acceso temporalmente bloqueado durante ${remainingSeconds} segundos.`,
    };
  }

  // 2. Comprobación atómica distribuida en Supabase PostgreSQL RPC (compartida entre lambdas)
  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FAIL-CLOSED: Infraestructura de base de datos no configurada en producción.');
      return {
        allowed: false,
        status: 503,
        error: 'Servicio de seguridad temporalmente no disponible.',
      };
    }
    // Entorno local de testing sin BD configurada
    return { allowed: true };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any).rpc('check_admin_rate_limit', { p_key: key });

    if (error) {
      console.error('FAIL-CLOSED: Error en check_admin_rate_limit RPC:', error.message);
      return {
        allowed: false,
        status: 503,
        error: 'Servicio de seguridad temporalmente no disponible. Intente nuevamente en unos minutos.',
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.is_blocked) {
      const remainingSeconds = row.remaining_seconds || LOCKOUT_SECONDS;
      return {
        allowed: false,
        status: 429,
        remainingSeconds,
        error: `Demasiados intentos fallidos. Acceso temporalmente bloqueado durante ${remainingSeconds} segundos.`,
      };
    }

    return { allowed: true };
  } catch (err: any) {
    console.error('FAIL-CLOSED: Excepción en limitador distribuido:', err?.message || err);
    return {
      allowed: false,
      status: 503,
      error: 'Servicio de seguridad temporalmente no disponible. Intente nuevamente en unos minutos.',
    };
  }
}

/**
 * Registra un intento fallido de autenticación de PIN.
 */
export async function recordLiveFailedAttempt(req: NextRequest, secret: string): Promise<void> {
  const ip = getClientIp(req);
  const key = getPseudonymizedKey(ip, secret);
  const now = Date.now();

  // 1. Registro en memoria local
  const mem = localMemoryFallback.get(key) || { count: 0, lastAttempt: now };
  if (now - mem.lastAttempt > WINDOW_SECONDS * 1000) {
    mem.count = 1;
  } else {
    mem.count += 1;
  }
  mem.lastAttempt = now;

  if (mem.count >= MAX_ATTEMPTS) {
    mem.blockedUntil = now + (LOCKOUT_SECONDS * 1000);
  }
  localMemoryFallback.set(key, mem);

  // 2. Registro atómico distribuido en Supabase PostgreSQL RPC
  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!isSupabaseConfigured) return;

  try {
    const supabase = createAdminClient();
    await (supabase as any).rpc('record_admin_failed_attempt', {
      p_key: key,
      p_scope: 'live_tiktok',
      p_max_attempts: MAX_ATTEMPTS,
      p_window_seconds: WINDOW_SECONDS,
      p_lockout_seconds: LOCKOUT_SECONDS,
    });
  } catch (err) {
    console.error('Error registrando intento fallido en Supabase:', err);
  }
}

/**
 * Limpia los intentos registrados para la IP tras una autenticación exitosa legítima.
 */
export async function clearLiveAttemptsOnSuccess(req: NextRequest, secret: string): Promise<void> {
  const ip = getClientIp(req);
  const key = getPseudonymizedKey(ip, secret);

  localMemoryFallback.delete(key);

  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!isSupabaseConfigured) return;

  try {
    const supabase = createAdminClient();
    await (supabase as any).rpc('clear_admin_attempts', { p_key: key });
  } catch (err) {
    console.warn('Aviso no bloqueante al limpiar intentos tras éxito legítimo:', err);
  }
}
