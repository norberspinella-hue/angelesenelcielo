import { createClient } from '@supabase/supabase-js';
import {
  LiveAjustes,
  LiveEscenaOutput,
  LiveLectorEstado,
  LiveOrigen,
  LivePerrito,
  LiveRitmo,
  LiveSesion,
} from './types';
import { normalizeTikTokUsername, parsear, sanitizeLiveName, sanitizeLiveTime } from './parsear';

export function getLiveSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  ) as any;
}

export async function getActiveLiveContext(): Promise<{
  ajustes: LiveAjustes;
  sesion: LiveSesion | null;
}> {
  const sb = getLiveSupabase();
  const { data: ajustes, error: ajErr } = await sb
    .from('live_ajustes')
    .select('*')
    .eq('id', 1)
    .single();

  if (ajErr || !ajustes) {
    throw new Error(ajErr?.message || 'No se encontró live_ajustes (id=1)');
  }

  let sesion: LiveSesion | null = null;
  if (ajustes.sesion_id) {
    const { data: sesData } = await sb
      .from('live_sesiones')
      .select('*')
      .eq('id', ajustes.sesion_id)
      .single();
    sesion = sesData || null;
  }

  return { ajustes, sesion };
}

export async function ingestChatMessage(params: {
  usuario?: string | null;
  apodo?: string | null;
  texto: string;
  origen?: LiveOrigen;
}): Promise<{
  status: 'ignored_parse' | 'ignored_duplicate' | 'rate_limited' | 'pending' | 'approved';
  perrito?: LivePerrito;
}> {
  const sb = getLiveSupabase();
  const { ajustes } = await getActiveLiveContext();
  if (!ajustes.sesion_id) {
    throw new Error('No hay sesión de directo activa.');
  }

  const parsed = parsear(params.texto, ajustes.comando);
  if (!parsed) {
    return { status: 'ignored_parse' };
  }

  const normUser = normalizeTikTokUsername(params.usuario);
  const cleanApodo = params.apodo ? params.apodo.trim().slice(0, 80) : null;
  const cleanRaw = params.texto.trim().slice(0, 300);

  // Ingesta atómica en PostgreSQL (serializa por usuario para antispam exacto en ráfagas)
  const { data: ingData, error: ingErr } = await sb.rpc('live_ingestar', {
    p_nombre: parsed.nombre,
    p_tiempo: parsed.tiempo,
    p_usuario: normUser,
    p_apodo: cleanApodo,
    p_texto_original: cleanRaw,
    p_origen: params.origen || 'chat',
  });

  if (ingErr) {
    throw new Error(ingErr.message || 'Error en ingesta de mensaje');
  }

  const resRow = Array.isArray(ingData) ? ingData[0] : ingData;
  if (!resRow) throw new Error('Respuesta vacía de live_ingestar');

  if (resRow.ingest_status === 'ignored_duplicate') {
    return { status: 'ignored_duplicate' };
  }
  if (resRow.ingest_status === 'rate_limited') {
    return { status: 'rate_limited' };
  }

  const { data: inserted } = await sb
    .from('live_perritos')
    .select('*')
    .eq('id', resRow.perrito_id)
    .single();

  // Auto-aprobación si está encendida (respeta límites de hueco y por usuario)
  if (ajustes.auto_aprobar && inserted) {
    try {
      const approved = await approvePendingPerrito({ id: inserted.id });
      return { status: 'approved', perrito: approved };
    } catch {
      return { status: 'pending', perrito: inserted };
    }
  }

  return { status: 'pending', perrito: inserted };
}

export async function approvePendingPerrito(params: {
  id: string;
  nombre?: string;
  tiempo?: string;
}): Promise<LivePerrito> {
  const sb = getLiveSupabase();
  const cleanNombre = params.nombre !== undefined ? sanitizeLiveName(params.nombre) : null;
  const cleanTiempo = params.tiempo !== undefined ? sanitizeLiveTime(params.tiempo) : null;

  const { data, error } = await sb.rpc('live_aprobar', {
    p_id: params.id,
    p_nombre: cleanNombre && cleanNombre.length >= 2 ? cleanNombre : null,
    p_tiempo: cleanTiempo !== null ? cleanTiempo : null,
  });

  if (error) {
    throw new Error(error.message || 'No se pudo aprobar');
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Respuesta vacía de live_aprobar');
  return row as LivePerrito;
}

export async function addManualPerrito(params: {
  nombre: string;
  tiempo?: string;
  usuario?: string;
}): Promise<LivePerrito> {
  const sb = getLiveSupabase();
  const { ajustes } = await getActiveLiveContext();
  if (!ajustes.sesion_id) throw new Error('No hay sesión activa');

  const cleanNombre = sanitizeLiveName(params.nombre);
  if (cleanNombre.length < 2) {
    throw new Error('NOMBRE_INVALIDO');
  }
  const cleanTiempo = sanitizeLiveTime(params.tiempo || '');
  const normUser = normalizeTikTokUsername(params.usuario);

  const { data: inserted, error: insErr } = await sb
    .from('live_perritos')
    .insert({
      sesion_id: ajustes.sesion_id,
      estado: 'pendiente',
      nombre: cleanNombre,
      tiempo: cleanTiempo,
      tiktok_usuario: normUser,
      tiktok_apodo: null,
      texto_original: null,
      origen: 'manual',
    })
    .select('*')
    .single();

  if (insErr || !inserted) {
    throw new Error(insErr?.message || 'Error creando perrito manual');
  }

  try {
    return await approvePendingPerrito({ id: inserted.id });
  } catch (err) {
    await sb.from('live_perritos').delete().eq('id', inserted.id);
    throw err;
  }
}

export async function getPanelEstado() {
  const sb = getLiveSupabase();
  const { ajustes, sesion } = await getActiveLiveContext();
  const sesionId = ajustes.sesion_id;

  let rows: LivePerrito[] = [];
  if (sesionId) {
    const { data, error } = await sb
      .from('live_perritos')
      .select('*')
      .eq('sesion_id', sesionId)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    rows = data || [];
  }

  const aprobados = rows
    .filter((r) => r.estado === 'aprobado')
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));

  const usosMap = new Map<string, number>();
  for (const ap of aprobados) {
    const u = normalizeTikTokUsername(ap.tiktok_usuario);
    if (u) usosMap.set(u, (usosMap.get(u) || 0) + 1);
  }

  const pendientes = rows
    .filter((r) => r.estado === 'pendiente')
    .map((p) => {
      const u = normalizeTikTokUsername(p.tiktok_usuario);
      return {
        ...p,
        usos: u ? usosMap.get(u) || 0 : 0,
      };
    });

  const quitados_recientes = rows
    .filter((r) => r.estado === 'quitado')
    .sort((a, b) => new Date(b.quitado_at || b.created_at).getTime() - new Date(a.quitado_at || a.created_at).getTime())
    .slice(0, 15);

  const vistoAtMs = ajustes.lector_visto_at ? new Date(ajustes.lector_visto_at).getTime() : 0;
  const vivo = Boolean(vistoAtMs && Date.now() - vistoAtMs < 30_000);

  // Construir últimos 60 eventos de actividad desde los registros reales de la sesión
  const actividad: Array<{ t: number; txt: string }> = [];
  for (const r of rows) {
    const userLabel = r.tiktok_usuario ? `@${r.tiktok_usuario}` : 'manual';
    if (r.origen !== 'manual') {
      actividad.push({
        t: new Date(r.created_at).getTime(),
        txt: `${r.origen === 'prueba' ? '🧪' : '💬'} ${r.nombre} (${userLabel}): ${r.texto_original || r.nombre}`,
      });
    }
    if (r.aprobado_at) {
      actividad.push({
        t: new Date(r.aprobado_at).getTime(),
        txt: `✅ ${r.nombre}${r.tiktok_usuario ? ` (@${r.tiktok_usuario})` : ''} al cielo`,
      });
    }
    if (r.quitado_at) {
      actividad.push({
        t: new Date(r.quitado_at).getTime(),
        txt: `🗑️ ${r.nombre} quitado del cielo`,
      });
    }
  }
  actividad.sort((a, b) => b.t - a.t);

  return {
    ajustes,
    sesion,
    pendientes,
    aprobados,
    quitados_recientes,
    ocupados: aprobados.length,
    lector: {
      activo: ajustes.lector_activo,
      vivo,
      estado: ajustes.lector_estado,
      detalle: ajustes.lector_detalle,
      visto_at: ajustes.lector_visto_at,
      tiktokUsuario: ajustes.tiktok_usuario,
    },
    actividad: actividad.slice(0, 60),
    ahora: Date.now(),
  };
}

export async function updateLectorHeartbeat(params: {
  estado: LiveLectorEstado;
  detalle?: string;
}) {
  const sb = getLiveSupabase();
  const { error } = await sb
    .from('live_ajustes')
    .update({
      lector_estado: params.estado,
      lector_detalle: (params.detalle || '').slice(0, 200),
      lector_visto_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) throw new Error(error.message);
}

export async function updateLiveAjustesPartial(patch: {
  max_perritos?: number;
  por_usuario?: number;
  comando?: string;
  centro?: string;
  ritmo?: LiveRitmo;
  auto_aprobar?: boolean;
  instruccion?: boolean;
  escena_output?: LiveEscenaOutput;
  lector_activo?: boolean;
  tiktok_usuario?: string | null;
}) {
  const sb = getLiveSupabase();
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

  if (patch.max_perritos !== undefined) updateData.max_perritos = patch.max_perritos;
  if (patch.por_usuario !== undefined) updateData.por_usuario = patch.por_usuario;
  if (patch.comando !== undefined) updateData.comando = patch.comando.trim().slice(0, 20) || '!angel';
  if (patch.centro !== undefined) updateData.centro = patch.centro.trim().slice(0, 28);
  if (patch.ritmo !== undefined) updateData.ritmo = patch.ritmo;
  if (patch.auto_aprobar !== undefined) updateData.auto_aprobar = patch.auto_aprobar;
  if (patch.instruccion !== undefined) updateData.instruccion = patch.instruccion;
  if (patch.escena_output !== undefined) updateData.escena_output = patch.escena_output;
  if (patch.lector_activo !== undefined) updateData.lector_activo = patch.lector_activo;
  if (patch.tiktok_usuario !== undefined) {
    updateData.tiktok_usuario = normalizeTikTokUsername(patch.tiktok_usuario);
  }

  const { error } = await sb.from('live_ajustes').update(updateData).eq('id', 1);
  if (error) throw new Error(error.message);
}

export async function startNewLiveSession(titulo?: string): Promise<LiveSesion> {
  const sb = getLiveSupabase();
  const { ajustes } = await getActiveLiveContext();
  if (ajustes.sesion_id) {
    await sb
      .from('live_sesiones')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', ajustes.sesion_id)
      .is('ended_at', null);
  }

  const label = (titulo || '').trim() || `Directo ${new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
  const { data: newSes, error: sesErr } = await sb
    .from('live_sesiones')
    .insert({ titulo: label.slice(0, 80) })
    .select('*')
    .single();

  if (sesErr || !newSes) throw new Error(sesErr?.message || 'No se pudo crear la nueva sesión');

  const { error: ajErr } = await sb
    .from('live_ajustes')
    .update({ sesion_id: newSes.id, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (ajErr) throw new Error(ajErr.message);
  return newSes as LiveSesion;
}
