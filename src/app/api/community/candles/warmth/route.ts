import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candleId } = body;

    if (!candleId) {
      return NextResponse.json({ error: 'ID de vela requerido' }, { status: 400 });
    }

    const warmthCount = await CandlesService.sendWarmth(candleId);

    return NextResponse.json({
      success: true,
      warmthCount,
    });
  } catch (err: any) {
    console.error('Error in candles warmth route:', err);
    return NextResponse.json({ error: err.message || 'Error al enviar abrazo de luz' }, { status: 400 });
  }
}
