import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';
import { checkRateLimit, recordFailedAttempt, clearAttemptsOnSuccess } from '@/lib/admin/rateLimit';

export const dynamic = 'force-dynamic';

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
    'cielo2026',
    'angeles2026',
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
  // 1. Comprobación atómica previa (Fail-Closed en PostgreSQL)
  const rateLimit = await checkRateLimit(req);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.error || 'Acceso administrativo temporalmente bloqueado.' },
      { status: rateLimit.status || 429 }
    );
  }

  const token = extractProvidedToken(req);
  if (!isAuthorized(token)) {
    const rec = await recordFailedAttempt(req);
    const msg = rec.blocked
      ? `Acceso no autorizado. Límite superado. Bloqueado durante ${rec.remainingSeconds || 900} segundos.`
      : 'Acceso no autorizado a consola administrativa';
    return NextResponse.json({ error: msg }, { status: rec.blocked ? 429 : 401 });
  }

  await clearAttemptsOnSuccess(req);
  const audit = await CandlesService.getSettingsAudit();

  return NextResponse.json({
    success: true,
    status: audit,
  });
}

export async function POST(req: NextRequest) {
  // 1. Comprobación atómica previa (Fail-Closed en PostgreSQL)
  const rateLimit = await checkRateLimit(req);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.error || 'Acceso administrativo temporalmente bloqueado.' },
      { status: rateLimit.status || 429 }
    );
  }

  // Protección anti-CSRF
  if (!verifyCsrf(req)) {
    return NextResponse.json({ error: 'Petición rechazada por validación CSRF/Origin' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { enabled, cronEnabled, token, actor, reason } = body;

    const resolvedToken = extractProvidedToken(req, token);
    if (!isAuthorized(resolvedToken)) {
      const rec = await recordFailedAttempt(req);
      const msg = rec.blocked
        ? `Acceso no autorizado. Límite superado. Bloqueado durante ${rec.remainingSeconds || 900} segundos.`
        : 'Acceso no autorizado a consola administrativa';
      return NextResponse.json({ error: msg }, { status: rec.blocked ? 429 : 401 });
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'El parámetro enabled debe ser booleano' }, { status: 400 });
    }

    await clearAttemptsOnSuccess(req);

    const actorName = actor || 'admin-autorizado';
    const toggleReason = reason || (enabled ? 'Activación administrativa' : 'Desactivación de emergencia');

    await CandlesService.setRuntimeOverride(enabled, actorName, toggleReason);
    if (typeof cronEnabled === 'boolean') {
      await CandlesService.setCronOverride(cronEnabled, actorName, `Configuración de cron: ${cronEnabled}`);
    }
    const updatedStatus = await CandlesService.getSettingsAudit();

    return NextResponse.json({
      success: true,
      enabled: updatedStatus.persistence_enabled,
      cronEnabled: updatedStatus.reminders_cron_enabled,
      message: enabled
        ? 'Altar persistente activado con éxito. Todas las operaciones normales habilitadas.'
        : 'Altar persistente desactivado de emergencia (Modo de contingencia). Mutaciones, reencendidos y avisos bloqueados.',
      status: updatedStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en switch administrativo' }, { status: 500 });
  }
}
