import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candleId, manageToken } = body;

    if (!candleId || !manageToken) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const candle = await CandlesService.reignite(candleId, manageToken);

    return NextResponse.json({
      success: true,
      candle,
    });
  } catch (err: any) {
    console.error('Error in candles reignite route:', err);
    return NextResponse.json({ error: err.message || 'Error al reavivar vela' }, { status: 400 });
  }
}
