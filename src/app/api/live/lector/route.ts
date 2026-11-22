import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyLiveIngestAuth } from '@/lib/live/auth';
import { getActiveLiveContext, updateLectorHeartbeat } from '@/lib/live/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const HeartbeatSchema = z.object({
  estado: z.enum(['desconectado', 'conectando', 'conectado', 'error']),
  detalle: z.string().max(240).optional(),
});

export async function GET(req: NextRequest) {
  const auth = verifyLiveIngestAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { ajustes } = await getActiveLiveContext();
    return NextResponse.json({
      activo: ajustes.lector_activo,
      tiktokUsuario: ajustes.tiktok_usuario || '',
      comando: ajustes.comando,
      sessionId: ajustes.sesion_id,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    console.error('Error en GET /api/live/lector:', err?.message || err);
    return NextResponse.json({ error: 'Error consultando configuración del lector.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyLiveIngestAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const parsed = HeartbeatSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Heartbeat inválido.' }, { status: 400 });
  }

  try {
    await updateLectorHeartbeat({
      estado: parsed.data.estado,
      detalle: parsed.data.detalle,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error en POST /api/live/lector:', err?.message || err);
    return NextResponse.json({ error: 'Error guardando heartbeat del lector.' }, { status: 500 });
  }
}
