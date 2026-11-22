import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyLivePanelAuth } from '@/lib/live/auth';
import { createAdminClient } from '@/lib/supabase/server';
import {
  addManualPerrito,
  approvePendingPerrito,
  getActiveLiveContext,
  ingestChatMessage,
  startNewLiveSession,
  updateLiveAjustesPartial,
} from '@/lib/live/db';

export const dynamic = 'force-dynamic';

const AccionSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('aprobar'),
    id: z.string().uuid(),
    nombre: z.string().max(40).optional(),
    tiempo: z.string().max(30).optional(),
  }),
  z.object({
    tipo: z.literal('rechazar'),
    id: z.string().uuid(),
  }),
  z.object({
    tipo: z.literal('rechazarTodos'),
  }),
  z.object({
    tipo: z.literal('manual'),
    nombre: z.string().min(2).max(40),
    tiempo: z.string().max(30).optional(),
    usuario: z.string().max(60).optional(),
  }),
  z.object({
    tipo: z.literal('quitar'),
    id: z.string().uuid(),
  }),
  z.object({
    tipo: z.literal('vaciar'),
  }),
  z.object({
    tipo: z.literal('nuevoDirecto'),
    titulo: z.string().max(80).optional(),
  }),
  z.object({
    tipo: z.literal('ajustes'),
    ajustes: z.object({
      max_perritos: z.number().int().min(1).max(150).optional(),
      por_usuario: z.number().int().min(1).max(20).optional(),
      comando: z.string().min(1).max(20).optional(),
      centro: z.string().max(28).optional(),
      ritmo: z.enum(['normal', 'rapido']).optional(),
      auto_aprobar: z.boolean().optional(),
      instruccion: z.boolean().optional(),
      escena_output: z.enum(['video', 'cielo']).optional(),
    }),
  }),
  z.object({
    tipo: z.literal('simular'),
    usuario: z.string().max(60).optional(),
    texto: z.string().min(1).max(300),
  }),
  z.object({
    tipo: z.literal('lector'),
    activo: z.boolean(),
    tiktokUsuario: z.string().max(60).optional(),
  }),
]);

export async function POST(req: NextRequest) {
  const auth = verifyLivePanelAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const parsed = AccionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Acción o parámetros no válidos.' }, { status: 400 });
  }

  const sb = createAdminClient() as any;
  const action = parsed.data;

  try {
    switch (action.tipo) {
      case 'aprobar': {
        const perrito = await approvePendingPerrito({
          id: action.id,
          nombre: action.nombre,
          tiempo: action.tiempo,
        });
        return NextResponse.json({ success: true, perrito });
      }
      case 'rechazar': {
        const { ajustes } = await getActiveLiveContext();
        await sb
          .from('live_perritos')
          .update({ estado: 'rechazado' })
          .eq('id', action.id)
          .eq('sesion_id', ajustes.sesion_id)
          .eq('estado', 'pendiente');
        return NextResponse.json({ success: true });
      }
      case 'rechazarTodos': {
        const { ajustes } = await getActiveLiveContext();
        if (ajustes.sesion_id) {
          await sb
            .from('live_perritos')
            .update({ estado: 'rechazado' })
            .eq('sesion_id', ajustes.sesion_id)
            .eq('estado', 'pendiente');
        }
        return NextResponse.json({ success: true });
      }
      case 'manual': {
        const perrito = await addManualPerrito({
          nombre: action.nombre,
          tiempo: action.tiempo,
          usuario: action.usuario,
        });
        return NextResponse.json({ success: true, perrito }, { status: 201 });
      }
      case 'quitar': {
        const { ajustes } = await getActiveLiveContext();
        await sb
          .from('live_perritos')
          .update({ estado: 'quitado', quitado_at: new Date().toISOString() })
          .eq('id', action.id)
          .eq('sesion_id', ajustes.sesion_id)
          .eq('estado', 'aprobado');
        return NextResponse.json({ success: true });
      }
      case 'vaciar': {
        const { ajustes } = await getActiveLiveContext();
        if (ajustes.sesion_id) {
          await sb
            .from('live_perritos')
            .update({ estado: 'quitado', quitado_at: new Date().toISOString() })
            .eq('sesion_id', ajustes.sesion_id)
            .eq('estado', 'aprobado');
        }
        return NextResponse.json({ success: true });
      }
      case 'nuevoDirecto': {
        const sesion = await startNewLiveSession(action.titulo);
        return NextResponse.json({ success: true, sesion });
      }
      case 'ajustes': {
        await updateLiveAjustesPartial(action.ajustes);
        return NextResponse.json({ success: true });
      }
      case 'simular': {
        const res = await ingestChatMessage({
          usuario: action.usuario || 'prueba_panel',
          apodo: 'Prueba del panel',
          texto: action.texto,
          origen: 'prueba',
        });
        return NextResponse.json({ success: true, result: res });
      }
      case 'lector': {
        await updateLiveAjustesPartial({
          lector_activo: action.activo,
          ...(action.tiktokUsuario !== undefined ? { tiktok_usuario: action.tiktokUsuario } : {}),
        });
        return NextResponse.json({ success: true });
      }
    }
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('CIELO_LLENO') || msg.includes('LIMITE_USUARIO') || msg.includes('PERRITO_NO_PENDIENTE')) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    if (msg.includes('NOMBRE_INVALIDO')) {
      return NextResponse.json({ error: 'El nombre debe tener entre 2 y 24 caracteres válidos.' }, { status: 400 });
    }
    console.error('Error en POST /api/live/accion:', msg);
    return NextResponse.json({ error: 'No se pudo completar la acción.' }, { status: 500 });
  }
}
