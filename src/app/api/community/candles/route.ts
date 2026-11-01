import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get('filter') as any) || 'todos';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [candlesResult, stats] = await Promise.all([
      CandlesService.getPublicCandles({ filter, search, limit, offset }),
      CandlesService.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      candles: candlesResult.candles,
      total: candlesResult.total,
      stats,
    });
  } catch (err: any) {
    console.error('Error in candles GET route:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const result = await CandlesService.createCandle(body, ip);

    return NextResponse.json({
      success: true,
      candle: result.candle,
      manageToken: result.manageToken,
    });
  } catch (err: any) {
    console.error('Error in candles POST route:', err);
    return NextResponse.json({ error: err.message || 'Error al encender vela' }, { status: 400 });
  }
}
