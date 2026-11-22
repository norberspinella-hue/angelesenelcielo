import { NextRequest, NextResponse } from 'next/server';
import { verifyLivePanelAuth } from '@/lib/live/auth';
import { getPanelEstado } from '@/lib/live/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyLivePanelAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const estado = await getPanelEstado();
    return NextResponse.json(estado, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    console.error('Error en GET /api/live/estado:', err?.message || err);
    return NextResponse.json({ error: 'No se pudo consultar el estado del directo.' }, { status: 500 });
  }
}
