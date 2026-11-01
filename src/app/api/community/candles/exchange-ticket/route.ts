import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

const failedExchangeAttemptsMap = new Map<string, number[]>();
const MAX_EXCHANGE_ATTEMPTS = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const now = Date.now();
  const attempts = failedExchangeAttemptsMap.get(ip) || [];
  const recent = attempts.filter(ts => now - ts < LOCKOUT_WINDOW_MS);
  failedExchangeAttemptsMap.set(ip, recent);

  if (recent.length >= MAX_EXCHANGE_ATTEMPTS) {
    const oldest = recent[0];
    const remainingSec = Math.ceil((LOCKOUT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, remainingSec };
  }
  return { allowed: true };
}

function recordAttempt(ip: string) {
  const now = Date.now();
  const attempts = failedExchangeAttemptsMap.get(ip) || [];
  attempts.push(now);
  failedExchangeAttemptsMap.set(ip, attempts);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos de canje. Inténtalo de nuevo en ${rateLimit.remainingSec} segundos.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { ticket } = body;

    if (!ticket || typeof ticket !== 'string') {
      recordAttempt(ip);
      return NextResponse.json(
        { error: 'Ticket de acceso no proporcionado.' },
        { status: 400 }
      );
    }

    const result = CandlesService.exchangeTicket(ticket);

    return NextResponse.json({
      success: true,
      candleId: result.candleId,
      manageToken: result.manageToken,
    });
  } catch (err: any) {
    recordAttempt(ip);
    return NextResponse.json(
      { error: err.message || 'Error al canjear el enlace de acceso.' },
      { status: 400 }
    );
  }
}
