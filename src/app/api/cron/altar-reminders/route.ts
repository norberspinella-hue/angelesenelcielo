import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verificación de seguridad para Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const forceSend = req.nextUrl.searchParams.get('forceSend') === 'true';
    const testMode = isProd ? false : !forceSend;
    const result = await CandlesService.processScheduledReminders(testMode);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: any) {
    console.error('Error in cron altar-reminders:', err);
    return NextResponse.json({ error: err.message || 'Error en ejecucion programada' }, { status: 500 });
  }
}
