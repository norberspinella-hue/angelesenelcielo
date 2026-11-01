import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candleId, email } = body;

    if (!candleId || !email) {
      return NextResponse.json(
        { error: 'Debes indicar el identificador de la vela y tu correo electrónico.' },
        { status: 400 }
      );
    }

    const result = await CandlesService.recoverCandleAccess(candleId, email);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error in candles recovery route:', err);
    return NextResponse.json(
      { error: err.message || 'Error al procesar la recuperación de la vela' },
      { status: 400 }
    );
  }
}
