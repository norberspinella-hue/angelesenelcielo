'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { LiveAjustes, LiveEscenaOutput, LivePerrito, LiveRitmo, LiveSesion } from '@/lib/live/types';

interface PendienteConUsos extends LivePerrito {
  usos: number;
}

interface EstadoResponse {
  ajustes: LiveAjustes;
  sesion: LiveSesion | null;
  pendientes: PendienteConUsos[];
  aprobados: LivePerrito[];
  quitados_recientes: LivePerrito[];
  ocupados: number;
  lector: {
    activo: boolean;
    vivo: boolean;
    estado: string;
    detalle: string | null;
    visto_at: string | null;
    tiktokUsuario: string | null;
  };
  actividad: Array<{ t: number; txt: string }>;
  ahora: number;
}

interface CieloControlPanelProps {
  authToken: string | null;
  onEscenaChange?: (escena: LiveEscenaOutput) => void;
}

export function CieloControlPanel({ authToken, onEscenaChange }: CieloControlPanelProps) {
  const [estado, setEstado] = useState<EstadoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Estado editable local (nunca pisado por el polling de 1,5 s mientras el usuario edita)
  const [tiktokInput, setTiktokInput] = useState('');
  const editingTiktokRef = useRef(false);

  const [pendingEdits, setPendingEdits] = useState<Record<string, { nombre: string; tiempo: string }>>({});
  const editingPendingRef = useRef<Set<string>>(new Set());

  const [manualNombre, setManualNombre] = useState('');
  const [manualTiempo, setManualTiempo] = useState('');
  const [manualUsuario, setManualUsuario] = useState('');

  const [simUsuario, setSimUsuario] = useState('mariaperez');
  const [simTexto, setSimTexto] = useState('!angel Luna 12');

  const [settingsDraft, setSettingsDraft] = useState<{
    max_perritos: number;
    por_usuario: number;
    comando: string;
    centro: string;
  }>({
    max_perritos: 40,
    por_usuario: 1,
    comando: '!angel',
    centro: 'Ángeles en el Cielo',
  });
  const editingSettingsRef = useRef(false);

  // Confirmaciones inline (cero alert/confirm nativos)
  const [confirmAction, setConfirmAction] = useState<null | 'vaciar' | 'nuevoDirecto' | 'rechazarTodos'>(null);

  // Seguimiento de recién llegados para resaltar 4 s
  const seenPendingIdsRef = useRef<Set<string>>(new Set());
  const [highlightedMap, setHighlightedMap] = useState<Record<string, number>>({});

  const showNotice = useCallback((type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) h.Authorization = `Bearer ${authToken}`;
    return h;
  }, [authToken]);

  const fetchEstado = useCallback(async () => {
    try {
      const res = await fetch('/api/live/estado', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as EstadoResponse;
      setEstado(data);
      onEscenaChange?.(data.ajustes.escena_output);
      setLoading(false);

      if (!editingTiktokRef.current) {
        setTiktokInput(data.ajustes.tiktok_usuario || '');
      }
      if (!editingSettingsRef.current) {
        setSettingsDraft({
          max_perritos: data.ajustes.max_perritos,
          por_usuario: data.ajustes.por_usuario,
          comando: data.ajustes.comando,
          centro: data.ajustes.centro,
        });
      }

      // Sincronizar campos de pendientes sin pisar los que están en edición
      setPendingEdits((prev) => {
        const next: Record<string, { nombre: string; tiempo: string }> = {};
        for (const p of data.pendientes) {
          if (editingPendingRef.current.has(p.id) && prev[p.id]) {
            next[p.id] = prev[p.id];
          } else {
            next[p.id] = { nombre: p.nombre, tiempo: p.tiempo || '' };
          }
        }
        return next;
      });

      // Resaltar recién llegados 4 s
      const now = Date.now();
      const freshIds: string[] = [];
      for (const p of data.pendientes) {
        if (!seenPendingIdsRef.current.has(p.id)) {
          seenPendingIdsRef.current.add(p.id);
          freshIds.push(p.id);
        }
      }
      if (freshIds.length > 0 && seenPendingIdsRef.current.size > freshIds.length) {
        setHighlightedMap((prev) => {
          const updated = { ...prev };
          for (const id of freshIds) updated[id] = now + 4000;
          return updated;
        });
      }
    } catch {
      setLoading(false);
    }
  }, [authToken, onEscenaChange]);

  useEffect(() => {
    fetchEstado();
    const timer = setInterval(fetchEstado, 1500);
    return () => clearInterval(timer);
  }, [fetchEstado]);

  const sendAction = useCallback(
    async (payload: Record<string, any>, successMsg?: string) => {
      try {
        const res = await fetch('/api/live/accion', {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const rawErr = String(data.error || 'No se pudo completar la acción.');
          if (rawErr.includes('CIELO_LLENO')) {
            showNotice('err', 'Cielo lleno: sube el máximo o quita alguna estrella.');
          } else if (rawErr.includes('LIMITE_USUARIO')) {
            showNotice('err', 'Este usuario ya llegó a su límite de estrellas en este directo.');
          } else {
            showNotice('err', rawErr);
          }
          return false;
        }
        if (successMsg) showNotice('ok', successMsg);
        await fetchEstado();
        return true;
      } catch {
        showNotice('err', 'Error de conexión con el servidor.');
        return false;
      }
    },
    [authHeaders, fetchEstado, showNotice]
  );

  if (loading && !estado) {
    return (
      <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-6 text-center text-sm text-pink-200/70">
        Cargando Cielo interactivo...
      </div>
    );
  }

  if (!estado) {
    return (
      <div className="bg-[#160B24] border border-red-400/30 rounded-3xl p-6 text-center text-sm text-red-200">
        No se pudo conectar con /api/live/estado. Verifica la migración de base de datos y variables del servidor.
      </div>
    );
  }

  const { ajustes, pendientes, aprobados, ocupados, lector, actividad, ahora } = estado;
  const cieloLleno = ocupados >= ajustes.max_perritos;
  const pctLleno = Math.min(100, Math.round((ocupados / Math.max(1, ajustes.max_perritos)) * 100));

  let lectorColor = 'bg-red-500/20 text-red-200 border-red-400/40';
  let lectorDot = 'bg-red-400';
  let lectorLabel = 'Desconectado';
  if (lector.vivo && lector.estado === 'conectado') {
    lectorColor = 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40';
    lectorDot = 'bg-emerald-400 animate-pulse';
    lectorLabel = 'Conectado';
  } else if (lector.estado === 'conectando' || (lector.activo && !lector.vivo)) {
    lectorColor = 'bg-amber-500/20 text-amber-200 border-amber-400/40';
    lectorDot = 'bg-amber-400 animate-pulse';
    lectorLabel = lector.estado === 'conectando' ? 'Conectando' : 'Esperando al lector PC';
  } else if (lector.estado === 'error') {
    lectorLabel = 'Error';
  }

  return (
    <div className="flex flex-col gap-5">
      {feedback && (
        <div
          role="status"
          className={`px-4 py-3 rounded-2xl text-xs font-bold border shadow-lg ${
            feedback.type === 'ok'
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
              : 'bg-red-500/25 border-red-400/50 text-red-100'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* 1. LECTOR DEL CHAT + CONMUTADOR ESCENA OUTPUT */}
      <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              ✨ Cielo Interactivo · Lector TikTok
            </span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${lectorColor}`}>
            <span className={`w-2 h-2 rounded-full ${lectorDot}`} />
            <span>{lectorLabel}</span>
          </span>
        </div>

        {lector.detalle && (
          <p className="text-xs text-pink-200/80 bg-black/30 rounded-xl px-3 py-2 border border-white/10">
            {lector.detalle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={tiktokInput}
            onFocus={() => {
              editingTiktokRef.current = true;
            }}
            onBlur={() => {
              editingTiktokRef.current = false;
            }}
            onChange={(e) => setTiktokInput(e.target.value)}
            placeholder="@tu_usuario_tiktok"
            aria-label="Usuario de TikTok para el lector"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-pink-200/40 outline-none focus:border-amber-300"
          />
          <button
            type="button"
            onClick={() => {
              editingTiktokRef.current = false;
              sendAction(
                { tipo: 'lector', activo: !lector.activo, tiktokUsuario: tiktokInput },
                lector.activo ? 'Lector apagado.' : 'Lector encendido.'
              );
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black min-h-[44px] cursor-pointer transition-all ${
              lector.activo
                ? 'bg-red-500/85 hover:bg-red-500 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
            }`}
          >
            {lector.activo ? 'Apagar lector' : 'Encender lector'}
          </button>
        </div>

        {/* Conmutador Escena Output: Vídeo vs Cielo */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-pink-100">Escena activa en /live-tiktok/output</div>
            <div className="text-[11px] text-pink-200/60">Conmuta con fundido suave de 0,8 s</div>
          </div>
          <div className="flex items-center gap-2">
            {(['video', 'cielo'] as const).map((sc) => {
              const active = ajustes.escena_output === sc;
              return (
                <button
                  key={sc}
                  type="button"
                  onClick={() =>
                    sendAction({ tipo: 'ajustes', ajustes: { escena_output: sc } }, `Output cambiado a ${sc === 'cielo' ? 'Cielo' : 'Vídeo'}.`)
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-black min-h-[40px] cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-400 text-stone-950 border-amber-300'
                      : 'bg-black/30 text-pink-100 border-white/15 hover:bg-white/10'
                  }`}
                >
                  {sc === 'video' ? '🎬 Vídeo' : '🌌 Cielo'}
                </button>
              );
            })}
            <Link
              href="/live-tiktok/cielo"
              target="_blank"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 min-h-[40px] flex items-center"
            >
              /cielo ↗
            </Link>
          </div>
        </div>
      </div>

      {/* 2. POR APROBAR */}
      <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Por aprobar ({pendientes.length})
            </h3>
            <p className="text-[11px] text-pink-200/60">Nada sale al cielo sin tu aprobación</p>
          </div>
          {pendientes.length > 0 && (
            confirmAction === 'rechazarTodos' ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    await sendAction({ tipo: 'rechazarTodos' }, 'Pendientes descartados.');
                    setConfirmAction(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar descartar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 text-pink-100 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('rechazarTodos')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-pink-200 text-xs font-bold border border-white/15 cursor-pointer"
              >
                Descartar todos
              </button>
            )
          )}
        </div>

        {pendientes.length === 0 ? (
          <p className="text-xs text-pink-200/60 italic py-4 text-center">
            No hay nombres esperando aprobación ahora mismo.
          </p>
        ) : (
          <ul className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {pendientes.map((p) => {
              const edit = pendingEdits[p.id] || { nombre: p.nombre, tiempo: p.tiempo || '' };
              const userAtLimit = Boolean(p.tiktok_usuario && p.usos >= ajustes.por_usuario);
              const blocked = cieloLleno || userAtLimit;
              const isFresh = (highlightedMap[p.id] || 0) > Date.now();
              const blockReason = cieloLleno
                ? 'Cielo lleno'
                : userAtLimit
                  ? `Este usuario ya tiene ${p.usos} en el cielo`
                  : undefined;

              return (
                <li
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-colors space-y-2 ${
                    isFresh
                      ? 'bg-amber-400/15 border-amber-300/60'
                      : 'bg-black/30 border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-pink-200/75">
                    <span>
                      {p.tiktok_usuario ? `@${p.tiktok_usuario}` : 'Sin usuario'}
                      {p.texto_original ? ` · “${p.texto_original}”` : ''}
                    </span>
                    {userAtLimit && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold border border-amber-400/40">
                        ya tiene {p.usos} en el cielo
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      maxLength={24}
                      value={edit.nombre}
                      onFocus={() => editingPendingRef.current.add(p.id)}
                      onBlur={() => editingPendingRef.current.delete(p.id)}
                      onChange={(e) =>
                        setPendingEdits((prev) => ({
                          ...prev,
                          [p.id]: { ...edit, nombre: e.target.value },
                        }))
                      }
                      aria-label={`Nombre para ${p.nombre}`}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-sm font-bold text-white outline-none focus:border-amber-300"
                    />
                    <input
                      type="text"
                      maxLength={20}
                      value={edit.tiempo}
                      placeholder="Tiempo (opcional)"
                      onFocus={() => editingPendingRef.current.add(p.id)}
                      onBlur={() => editingPendingRef.current.delete(p.id)}
                      onChange={(e) =>
                        setPendingEdits((prev) => ({
                          ...prev,
                          [p.id]: { ...edit, tiempo: e.target.value },
                        }))
                      }
                      aria-label={`Tiempo para ${p.nombre}`}
                      className="sm:w-36 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-pink-100 outline-none focus:border-amber-300"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={blocked}
                        title={blockReason}
                        onClick={() => {
                          editingPendingRef.current.delete(p.id);
                          sendAction(
                            { tipo: 'aprobar', id: p.id, nombre: edit.nombre, tiempo: edit.tiempo },
                            `✨ ${edit.nombre} al cielo`
                          );
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-stone-950 font-black text-xs min-h-[40px] cursor-pointer"
                      >
                        ✓ Al cielo
                      </button>
                      <button
                        type="button"
                        aria-label={`Descartar ${p.nombre}`}
                        onClick={() => {
                          editingPendingRef.current.delete(p.id);
                          sendAction({ tipo: 'rechazar', id: p.id });
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-pink-100 font-bold text-xs min-h-[40px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 3. EL CIELO ACTUAL */}
      <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">
              El cielo ({ocupados} / {ajustes.max_perritos})
            </h3>
            <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-pink-400 transition-all"
                style={{ width: `${pctLleno}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {confirmAction === 'vaciar' ? (
              <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-400/40 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] text-red-100 font-bold">¿Vaciar cielo?</span>
                <button
                  type="button"
                  onClick={async () => {
                    await sendAction({ tipo: 'vaciar' }, 'Cielo vaciado.');
                    setConfirmAction(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Sí, vaciar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-1 rounded-lg bg-white/10 text-pink-100 text-xs cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('vaciar')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-pink-100 text-xs font-bold border border-white/15 cursor-pointer"
              >
                Vaciar cielo
              </button>
            )}

            {confirmAction === 'nuevoDirecto' ? (
              <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] text-amber-100 font-bold">¿Nuevo directo?</span>
                <button
                  type="button"
                  onClick={async () => {
                    await sendAction({ tipo: 'nuevoDirecto' }, 'Nuevo directo iniciado (sesión anterior guardada).');
                    setConfirmAction(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-xs font-black cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-1 rounded-lg bg-white/10 text-pink-100 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('nuevoDirecto')}
                className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold border border-amber-300/40 cursor-pointer"
              >
                Nuevo directo
              </button>
            )}
          </div>
        </div>

        {aprobados.length === 0 ? (
          <p className="text-xs text-pink-200/60 italic py-2">Aún no hay estrellas en este directo.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aprobados.map((p) => {
              const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
              const durMs = p.duracion_ms || 15900;
              const yaEnCielo = subeMs > 0 && ahora >= subeMs + durMs * (15.2 / 15.9);
              return (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/15 text-xs text-white"
                >
                  <span>{yaEnCielo ? '★' : '⏳'}</span>
                  <span className="font-bold">{p.nombre}</span>
                  {p.tiktok_usuario && <span className="text-pink-200/60">@{p.tiktok_usuario}</span>}
                  <button
                    type="button"
                    onClick={() => sendAction({ tipo: 'quitar', id: p.id }, `${p.nombre} quitado del cielo.`)}
                    aria-label={`Quitar ${p.nombre}`}
                    className="ml-1 text-red-300 hover:text-red-200 font-bold cursor-pointer"
                  >
                    quitar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. AÑADIR A MANO + PROBAR SIN DIRECTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!manualNombre.trim()) return;
            const ok = await sendAction(
              { tipo: 'manual', nombre: manualNombre, tiempo: manualTiempo, usuario: manualUsuario },
              `${manualNombre} añadido al cielo.`
            );
            if (ok) {
              setManualNombre('');
              setManualTiempo('');
              setManualUsuario('');
            }
          }}
          className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-4 shadow-xl space-y-2.5"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-pink-200">Añadir a mano</h3>
          <input
            type="text"
            required
            maxLength={24}
            value={manualNombre}
            onChange={(e) => setManualNombre(e.target.value)}
            placeholder="Nombre de la mascota *"
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-300"
          />
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={20}
              value={manualTiempo}
              onChange={(e) => setManualTiempo(e.target.value)}
              placeholder="Tiempo (ej. 12 años)"
              className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-300"
            />
            <input
              type="text"
              maxLength={30}
              value={manualUsuario}
              onChange={(e) => setManualUsuario(e.target.value)}
              placeholder="@usuario (opc.)"
              className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-300"
            />
          </div>
          <button
            type="submit"
            disabled={cieloLleno}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/40 text-stone-950 font-black text-xs cursor-pointer"
          >
            + Subir al cielo
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!simTexto.trim()) return;
            sendAction({ tipo: 'simular', usuario: simUsuario, texto: simTexto }, 'Mensaje simulado enviado.');
          }}
          className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-4 shadow-xl space-y-2.5"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-pink-200">Probar sin directo</h3>
          <input
            type="text"
            value={simUsuario}
            onChange={(e) => setSimUsuario(e.target.value)}
            placeholder="Usuario simulado"
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-300"
          />
          <input
            type="text"
            value={simTexto}
            onChange={(e) => setSimTexto(e.target.value)}
            placeholder="!angel Luna 12"
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-300"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/15 cursor-pointer"
          >
            Simular mensaje de chat
          </button>
        </form>
      </div>

      {/* 5. AJUSTES DEL CIELO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editingSettingsRef.current = false;
          sendAction(
            {
              tipo: 'ajustes',
              ajustes: {
                max_perritos: settingsDraft.max_perritos,
                por_usuario: settingsDraft.por_usuario,
                comando: settingsDraft.comando,
                centro: settingsDraft.centro,
              },
            },
            'Ajustes guardados.'
          );
        }}
        className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">Ajustes del Cielo</h3>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs cursor-pointer"
          >
            Guardar ajustes
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="text-[11px] text-pink-200/80 space-y-1">
            <span>Máximo (1–150)</span>
            <input
              type="number"
              min={1}
              max={150}
              value={settingsDraft.max_perritos}
              onFocus={() => { editingSettingsRef.current = true; }}
              onBlur={() => { editingSettingsRef.current = false; }}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, max_perritos: Number(e.target.value) || 1 }))}
              className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
            />
          </label>
          <label className="text-[11px] text-pink-200/80 space-y-1">
            <span>Por usuario (1–20)</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settingsDraft.por_usuario}
              onFocus={() => { editingSettingsRef.current = true; }}
              onBlur={() => { editingSettingsRef.current = false; }}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, por_usuario: Number(e.target.value) || 1 }))}
              className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
            />
          </label>
          <label className="text-[11px] text-pink-200/80 space-y-1">
            <span>Comando</span>
            <input
              type="text"
              maxLength={20}
              value={settingsDraft.comando}
              onFocus={() => { editingSettingsRef.current = true; }}
              onBlur={() => { editingSettingsRef.current = false; }}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, comando: e.target.value }))}
              className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
            />
          </label>
          <label className="text-[11px] text-pink-200/80 space-y-1">
            <span>Estrella central</span>
            <input
              type="text"
              maxLength={28}
              value={settingsDraft.centro}
              onFocus={() => { editingSettingsRef.current = true; }}
              onBlur={() => { editingSettingsRef.current = false; }}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, centro: e.target.value }))}
              className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-pink-200/75">Ritmo:</span>
            {(['normal', 'rapido'] as LiveRitmo[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => sendAction({ tipo: 'ajustes', ajustes: { ritmo: r } })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  ajustes.ritmo === r
                    ? 'bg-amber-400 text-stone-950 border-amber-300'
                    : 'bg-black/30 text-pink-100 border-white/15'
                }`}
              >
                {r === 'normal' ? 'Normal (16 s)' : 'Rápido (9 s)'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => sendAction({ tipo: 'ajustes', ajustes: { instruccion: !ajustes.instruccion } })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
              ajustes.instruccion
                ? 'bg-white/15 text-white border-white/25'
                : 'bg-black/30 text-pink-200/60 border-white/10'
            }`}
          >
            Instrucción en pantalla: {ajustes.instruccion ? 'Sí' : 'No'}
          </button>

          <button
            type="button"
            onClick={() => sendAction({ tipo: 'ajustes', ajustes: { auto_aprobar: !ajustes.auto_aprobar } })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
              ajustes.auto_aprobar
                ? 'bg-amber-500/25 text-amber-100 border-amber-400/50'
                : 'bg-black/30 text-pink-200/60 border-white/10'
            }`}
          >
            Aprobación automática: {ajustes.auto_aprobar ? 'ON (sin tu filtro)' : 'OFF'}
          </button>
        </div>

        {ajustes.auto_aprobar && (
          <p className="text-[11px] text-amber-200 bg-amber-500/15 border border-amber-400/40 rounded-xl px-3 py-2">
            ⚠️ Aprobación automática activada: los mensajes del chat saldrán en pantalla sin tu filtro previo.
          </p>
        )}
      </form>

      {/* 6. ACTIVIDAD RECIENTE (ÚLTIMOS 60 EVENTOS) */}
      <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-4 shadow-xl space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-pink-200">
          Actividad ({actividad.length})
        </h3>
        {actividad.length === 0 ? (
          <p className="text-xs text-pink-200/50 italic">Sin actividad registrada todavía en este directo.</p>
        ) : (
          <ul className="max-h-40 overflow-y-auto space-y-1 text-[11px] text-pink-100/80 font-mono">
            {actividad.map((ev, i) => (
              <li key={`${ev.t}-${i}`} className="truncate">
                {new Date(ev.t).toLocaleTimeString('es-ES')} · {ev.txt}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
