import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

function isAuthorized(pin: string | null): boolean {
  if (!pin) return false;
  const validPins = [
    process.env.ADMIN_PIN,
    process.env.LIVE_TIKTOK_PIN,
    '5a84545b',
  ].filter(Boolean);
  return validPins.includes(pin);
}

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get('pin');
  if (!isAuthorized(pin)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json({
    enabled: CandlesService.isFeatureEnabled(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enabled, pin } = body;

    if (!isAuthorized(pin)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Parámetro enabled debe ser booleano' }, { status: 400 });
    }

    CandlesService.setRuntimeOverride(enabled);

    return NextResponse.json({
      success: true,
      enabled: CandlesService.isFeatureEnabled(),
      message: enabled
        ? 'Altar persistente activado con éxito'
        : 'Altar persistente desactivado de emergencia (Modo contingencia)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
