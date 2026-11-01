import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

const failedAttemptsMap = new Map<string, number[]>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const now = Date.now();
  const attempts = failedAttemptsMap.get(ip) || [];
  const recent = attempts.filter(ts => now - ts < LOCKOUT_WINDOW_MS);
  failedAttemptsMap.set(ip, recent);

  if (recent.length >= MAX_FAILED_ATTEMPTS) {
    const oldest = recent[0];
    const remainingSec = Math.ceil((LOCKOUT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, remainingSec };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const attempts = failedAttemptsMap.get(ip) || [];
  attempts.push(now);
  failedAttemptsMap.set(ip, attempts);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${rateLimit.remainingSec} segundos.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { candleId, manageToken } = body;

    if (!candleId || !manageToken) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const candle = await CandlesService.reignite(candleId, manageToken);

    // Éxito: limpiar intentos fallidos
    failedAttemptsMap.delete(ip);

    return NextResponse.json({
      success: true,
      candle,
    });
  } catch (err: any) {
    recordFailedAttempt(ip);
    console.error('Error in candles reignite route:', err.message || 'Error');
    return NextResponse.json({ error: err.message || 'Error al reavivar vela' }, { status: 400 });
  }
}
