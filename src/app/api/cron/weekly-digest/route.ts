import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklyDigestNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret') || authHeader?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET || 'celestial_cron_secret_key';

    // Verificación de seguridad básica para evitar llamadas accidentales
    if (secret !== expectedSecret && process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await sendWeeklyDigestNotification();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in weekly-digest cron:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
