import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyLiveIngestAuth } from '@/lib/live/auth';
import { ingestChatMessage } from '@/lib/live/db';

export const dynamic = 'force-dynamic';

const IngestSchema = z.object({
  usuario: z.string().max(80).optional().nullable(),
  apodo: z.string().max(100).optional().nullable(),
  texto: z.string().min(1).max(400),
});

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

  const parsed = IngestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos de entrada inválidos.' }, { status: 400 });
  }

  try {
    const result = await ingestChatMessage({
      usuario: parsed.data.usuario,
      apodo: parsed.data.apodo,
      texto: parsed.data.texto,
      origen: 'chat',
    });

    if (result.status === 'ignored_parse') {
      return new NextResponse(null, { status: 204 });
    }

    if (result.status === 'rate_limited') {
      return NextResponse.json({ ignored: true, reason: 'rate_limited' }, { status: 202 });
    }

    if (result.status === 'ignored_duplicate') {
      return NextResponse.json({ ignored: true, reason: 'duplicate_pending' }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      id: result.perrito?.id,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error en /api/live/ingest:', err?.message || err);
    return NextResponse.json({ error: 'Error interno al procesar mensaje.' }, { status: 500 });
  }
}
