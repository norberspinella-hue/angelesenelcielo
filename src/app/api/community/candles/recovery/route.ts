import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

const failedRecoveryAttemptsMap = new Map<string, number[]>();
const MAX_FAILED_RECOVERY_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const now = Date.now();
  const attempts = failedRecoveryAttemptsMap.get(ip) || [];
  const recent = attempts.filter(ts => now - ts < LOCKOUT_WINDOW_MS);
  failedRecoveryAttemptsMap.set(ip, recent);

  if (recent.length >= MAX_FAILED_RECOVERY_ATTEMPTS) {
    const oldest = recent[0];
    const remainingSec = Math.ceil((LOCKOUT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, remainingSec };
  }
  return { allowed: true };
}

function recordAttempt(ip: string) {
  const now = Date.now();
  const attempts = failedRecoveryAttemptsMap.get(ip) || [];
  attempts.push(now);
  failedRecoveryAttemptsMap.set(ip, attempts);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes de recuperación. Inténtalo de nuevo en ${rateLimit.remainingSec} segundos.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { candleId, email } = body;

    if (!candleId || !email) {
      recordAttempt(ip);
      return NextResponse.json(
        { error: 'Debes indicar el identificador de la vela y tu correo electrónico.' },
        { status: 400 }
      );
    }

    recordAttempt(ip);
    const result = await CandlesService.recoverCandleAccess(candleId, email);

    // Nunca exponer tokens ni hashes en la respuesta
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    recordAttempt(ip);
    console.error('Error in candles recovery route:', err.message || 'Error');
    return NextResponse.json(
      { error: err.message || 'Error al procesar la recuperación de la vela' },
      { status: 400 }
    );
  }
}
