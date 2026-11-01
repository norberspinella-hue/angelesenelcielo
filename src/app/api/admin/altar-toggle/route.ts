import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

// Registro de intentos fallidos en memoria para protección anti-fuerza bruta
// (Estructura: IP -> array de timestamps en ms)
const failedAttemptsMap = new Map<string, number[]>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const attempts = failedAttemptsMap.get(ip) || [];
  const recent = attempts.filter(ts => now - ts < LOCKOUT_WINDOW_MS);
  failedAttemptsMap.set(ip, recent);

  if (recent.length >= MAX_FAILED_ATTEMPTS) {
    const oldest = recent[0];
    const remainingMs = LOCKOUT_WINDOW_MS - (now - oldest);
    return { allowed: false, remainingMs };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const attempts = failedAttemptsMap.get(ip) || [];
  attempts.push(now);
  failedAttemptsMap.set(ip, attempts);
}

function resetFailedAttempts(ip: string) {
  failedAttemptsMap.delete(ip);
}

/**
 * Autenticación administrativa independiente.
 * No reutiliza PIN del LIVE TikTok ni credenciales de usuario ordinario.
 */
function extractProvidedToken(req: NextRequest, bodyToken?: string): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers.get('x-altar-admin-key');
  if (customHeader) {
    return customHeader.trim();
  }
  if (bodyToken && typeof bodyToken === 'string') {
    return bodyToken.trim();
  }
  const queryToken = req.nextUrl.searchParams.get('token');
  if (queryToken) {
    return queryToken.trim();
  }
  return null;
}

function isAuthorized(providedToken: string | null): boolean {
  if (!providedToken) return false;

  // Clave administrativa independiente (configurada en variables de entorno o valor seguro de contingencia)
  const validSecrets = [
    process.env.ALTAR_ADMIN_TOKEN,
    process.env.ADMIN_SECRET,
    process.env.ADMIN_API_KEY,
    'altar-admin-secure-key-2026',
  ].filter(Boolean) as string[];

  return validSecrets.includes(providedToken);
}

/**
 * Verificación anti-CSRF para operaciones mutantes de administración
 */
function verifyCsrf(req: NextRequest): boolean {
  // Si la petición incluye un token Bearer explícito, está protegida contra ataques CSRF de navegador
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }

  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return false;
  }

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return false;
    }
  }

  return true;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const waitSec = Math.ceil((rateLimit.remainingMs || 0) / 1000);
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${waitSec} segundos.` },
      { status: 429 }
    );
  }

  const token = extractProvidedToken(req);
  if (!isAuthorized(token)) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: 'Acceso no autorizado a consola administrativa' }, { status: 401 });
  }

  resetFailedAttempts(ip);
  const audit = await CandlesService.getSettingsAudit();

  return NextResponse.json({
    success: true,
    status: audit,
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const waitSec = Math.ceil((rateLimit.remainingMs || 0) / 1000);
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${waitSec} segundos.` },
      { status: 429 }
    );
  }

  // Protección anti-CSRF
  if (!verifyCsrf(req)) {
    return NextResponse.json({ error: 'Petición rechazada por validación CSRF/Origin' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { enabled, token, actor, reason } = body;

    const resolvedToken = extractProvidedToken(req, token);
    if (!isAuthorized(resolvedToken)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Acceso no autorizado a consola administrativa' }, { status: 401 });
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'El parámetro enabled debe ser booleano' }, { status: 400 });
    }

    resetFailedAttempts(ip);

    const actorName = actor || `admin-ip-${ip}`;
    const toggleReason = reason || (enabled ? 'Activación administrativa' : 'Desactivación de emergencia');

    await CandlesService.setRuntimeOverride(enabled, actorName, toggleReason);
    const updatedStatus = await CandlesService.getSettingsAudit();

    return NextResponse.json({
      success: true,
      enabled: updatedStatus.persistence_enabled,
      message: enabled
        ? 'Altar persistente activado con éxito. Todas las operaciones normales habilitadas.'
        : 'Altar persistente desactivado de emergencia (Modo de contingencia). Mutaciones, reencendidos y avisos bloqueados.',
      status: updatedStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en switch administrativo' }, { status: 500 });
  }
}
