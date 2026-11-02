'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MetricsResponse {
  timestamp: string;
  bloque1_operativo: {
    persistence_enabled: boolean;
    confirmation_email_enabled: boolean;
    reminders_cron_enabled: boolean;
    cron_running: boolean;
    cron_last_completed_at: string | null;
    cron_last_summary: {
      preRemindersSent: number;
      extinguishedNoticesSent: number;
    };
    resend_stats: {
      connected: boolean;
      deliveredCount: number;
      bouncedCount: number;
      complaintCount: number;
      totalTracked: number;
      deliveryRate: string;
    };
    audit_log: Array<{
      timestamp: string;
      actor: string;
      reason: string;
      changes: Record<string, any>;
    }>;
  };
  bloque2_altar: {
    homenajes_mural_importados: number;
    velas_comunitarias_total: number;
    velas_comunitarias_vivas: number;
    velas_comunitarias_reposo: number;
    reencendidos_gratuitos_total: number;
    abrazos_luz_total: number;
    actividad_diaria_7d: Array<{ date: string; count: number }>;
    distincion_mural: {
      casillas_ocupadas_grid: number;
      memoriales_totales: number;
      memoriales_publicados: number;
      memoriales_borrador: number;
      aclaracion: string;
    };
  };
  bloque3_correos_cron: {
    confirmaciones_enviadas: { valor: number; fuente: string };
    recordatorios_dia5_48h: { valor: number; fuente: string };
    recordatorios_dia7_reposo: { valor: number; fuente: string };
    bajas_recordatorios: { valor: number; fuente: string };
    fallos_envio: { valor: number; fuente: string };
    quejas_spam: { valor: number; fuente: string };
  };
  bloque4_captacion_conversion: {
    familias_que_regresan: { disponible: boolean; valor: number; detalle: string };
    reencendidos_gratuitos: { disponible: boolean; valor: number; detalle: string };
    visitas_altar: { disponible: boolean; estado: string; motivo: string };
    tasa_encendido: { disponible: boolean; estado: string; motivo: string };
    clics_hacia_mural_global: { disponible: boolean; estado: string; motivo: string };
    compras_atribuibles_altar: { disponible: boolean; estado: string; motivo: string };
  };
  recientes_anonimizados: Array<{
    id: string;
    pet_name: string;
    type: string;
    status: string;
    is_lit: boolean;
    reignite_count: number;
    reminder_opt_in: boolean;
    created_at: string;
    expires_at: string;
  }>;
}

export default function AdminAltarDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [fetchError, setFetchError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'altar' | 'correos' | 'conversion' | 'seguridad'>('general');

  // Comprobar autenticación guardada en sesión
  useEffect(() => {
    const savedPin = localStorage.getItem('admin_altar_auth') || localStorage.getItem('admin_moderacion_auth');
    if (savedPin === 'cielo2026' || savedPin === 'angeles2026' || savedPin === 'altar-admin-secure-key-2026') {
      setIsAuthenticated(true);
      fetchMetrics(savedPin);
    } else {
      setLoading(false);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();
    if (clean === 'cielo2026' || clean === 'angeles2026' || clean === 'altar-admin-secure-key-2026') {
      localStorage.setItem('admin_altar_auth', clean);
      setIsAuthenticated(true);
      setPinError('');
      fetchMetrics(clean);
    } else {
      setPinError('PIN de seguridad incorrecto. Acceso denegado.');
    }
  };

  const fetchMetrics = async (token: string) => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch(`/api/admin/altar-metrics?token=${encodeURIComponent(token)}`);
      if (res.status === 401 || res.status === 429) {
        const errJson = await res.json();
        setFetchError(errJson.error || 'Acceso no autorizado.');
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      } else {
        setFetchError(data.error || 'Error al obtener métricas');
      }
    } catch (err: any) {
      setFetchError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 1. PANTALLA DE ACCESO ADMINISTRATIVO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1426] via-[#161C33] to-[#0A0D1A] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1E2540] border border-[#3A4570] rounded-3xl p-8 shadow-2xl text-center space-y-6 text-white">
          <div className="w-16 h-16 rounded-full bg-[#2A3459] border border-[#526399] flex items-center justify-center mx-auto text-3xl shadow-inner">
            ✨
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#374473] text-[#E0E7FF] border border-[#5365A4]">
              Ángeles en el Cielo · Altar
            </span>
            <h1 className="text-2xl font-black font-serif text-white mt-2">
              Dashboard de Cielo de Luces
            </h1>
            <p className="text-xs text-[#A5B4FC] mt-1.5 leading-relaxed">
              Introduce tus credenciales autorizadas de administrador para supervisar el altar y sus comunicaciones.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN o Clave administrativa"
              className="w-full px-4 py-3 rounded-2xl bg-[#0F1426] border border-[#3A4570] focus:border-[#818CF8] outline-hidden text-center text-lg font-bold tracking-widest text-white placeholder-slate-500"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-rose-400 font-semibold">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full text-white font-black text-xs tracking-wider uppercase bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] shadow-lg transition-all cursor-pointer"
            >
              Acceder al Panel de Control
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD ADMINISTRATIVO COMPLETO
  return (
    <div className="min-h-screen bg-[#0A0D1A] text-slate-100 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-[1360px] mx-auto space-y-6">

        {/* CABECERA Y NAVEGACIÓN ADMINISTRATIVA */}
        <header className="bg-[#141B33] border border-[#2B3559] rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                ✦ Dashboard Administrativo · Fase P1
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Cielo Lleno de Luces
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Producción en Línea
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white">
              Supervisión Operativa & Analítica
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitorización de salud del altar comunitario, transaccionalidad de correo con Resend, auditoría del cron y trazabilidad con el Mural Global.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/moderacion"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1E2646] text-slate-300 hover:text-white hover:bg-[#28335D] border border-[#344275] transition-all"
            >
              🛡️ Moderación Mural
            </Link>
            <Link
              href="/admin/certificados"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1E2646] text-slate-300 hover:text-white hover:bg-[#28335D] border border-[#344275] transition-all"
            >
              📜 Certificados
            </Link>
            <Link
              href="/cielo-lleno-de-luces"
              target="_blank"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2E2045] text-purple-200 hover:bg-[#3D2B5C] border border-[#523A7A] transition-all"
            >
              ✨ Ver Altar Público ↗
            </Link>
            <button
              onClick={() => {
                const token = localStorage.getItem('admin_altar_auth') || '';
                fetchMetrics(token);
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>↻</span> Actualizar
            </button>
          </div>
        </header>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex items-center gap-2 border-b border-[#242D4C] pb-3 overflow-x-auto">
          {[
            { id: 'general', label: '📊 Estado Operativo (B1)', icon: '🟢' },
            { id: 'altar', label: '✨ Actividad del Altar (B2)', icon: '🕯️' },
            { id: 'correos', label: '✉️ Correos & Cron (B3)', icon: '📬' },
            { id: 'conversion', label: '🎯 Captación & Conversión (B4)', icon: '📈' },
            { id: 'seguridad', label: '🛡️ Seguridad & Kill-Switch (B5)', icon: '🔒' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-400/40'
                  : 'bg-[#141B33] text-slate-300 hover:text-white hover:bg-[#1E2646] border border-[#2B3559]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="bg-[#141B33] border border-[#2B3559] rounded-3xl p-16 text-center text-slate-400 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium">Consultando datos en tiempo real de Supabase y Resend...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-rose-950/40 border border-rose-800 rounded-3xl p-8 text-center text-rose-300 space-y-2">
            <p className="text-base font-bold">Error de consulta: {fetchError}</p>
            <p className="text-xs text-rose-400">Verifica la autorización administrativa o el estado del servidor.</p>
          </div>
        ) : metrics ? (
          <div className="space-y-6">

            {/* PESTAÑA 1 / BLOQUE 1: ESTADO OPERATIVO */}
            {(activeTab === 'general' || activeTab === 'seguridad') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                    <span>🟢</span> BLOQUE 1 — Estado Operativo & Infraestructura
                  </h2>
                  <span className="text-xs text-slate-400">Fuente: Supabase altar_settings & Resend API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Persistencia */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2 shadow-md">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Persistencia Altar</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-white">
                        {metrics.bloque1_operativo.persistence_enabled ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        metrics.bloque1_operativo.persistence_enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}>
                        {metrics.bloque1_operativo.persistence_enabled ? '✓ En Línea' : '✕ Contingencia'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Lectura y escritura en base de datos.</p>
                  </div>

                  {/* Confirmaciones */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2 shadow-md">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Confirmación</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-white">
                        {metrics.bloque1_operativo.confirmation_email_enabled ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        metrics.bloque1_operativo.confirmation_email_enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      }`}>
                        {metrics.bloque1_operativo.confirmation_email_enabled ? '✓ Despacho Real' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Envío inmediato al encender vela.</p>
                  </div>

                  {/* Recordatorios Cron */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2 shadow-md">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cron Recordatorios</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-white">
                        {metrics.bloque1_operativo.reminders_cron_enabled ? 'Activo' : 'Pausado'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        metrics.bloque1_operativo.reminders_cron_enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}>
                        {metrics.bloque1_operativo.reminders_cron_enabled ? '✓ Barrido 24h' : '✕ Desactivado'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Avisos automáticos de día 5 y día 7.</p>
                  </div>

                  {/* Resend Entregabilidad */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2 shadow-md">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entregabilidad Resend</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-emerald-400">
                        {metrics.bloque1_operativo.resend_stats.deliveryRate}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                        {metrics.bloque1_operativo.resend_stats.deliveredCount} Entregados
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Rebotes: {metrics.bloque1_operativo.resend_stats.bouncedCount} · Quejas: {metrics.bloque1_operativo.resend_stats.complaintCount}
                    </p>
                  </div>
                </div>

                {/* Sub-tarjeta de última ejecución de Cron */}
                <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                      <h3 className="text-sm font-bold text-white">Última Ejecución Programada del Cron</h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Fecha: {metrics.bloque1_operativo.cron_last_completed_at ? new Date(metrics.bloque1_operativo.cron_last_completed_at).toLocaleString('es-ES') : 'Sin ejecuciones registradas'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="bg-[#1E2646] px-3.5 py-2 rounded-xl border border-[#344275]">
                      <span className="text-slate-400">Avisos Día 5: </span>
                      <strong className="text-white">{metrics.bloque1_operativo.cron_last_summary.preRemindersSent}</strong>
                    </div>
                    <div className="bg-[#1E2646] px-3.5 py-2 rounded-xl border border-[#344275]">
                      <span className="text-slate-400">Avisos Día 7: </span>
                      <strong className="text-white">{metrics.bloque1_operativo.cron_last_summary.extinguishedNoticesSent}</strong>
                    </div>
                    <div className="bg-[#1E2646] px-3.5 py-2 rounded-xl border border-[#344275]">
                      <span className="text-slate-400">Estado Cerrojo: </span>
                      <strong className={metrics.bloque1_operativo.cron_running ? 'text-amber-400' : 'text-emerald-400'}>
                        {metrics.bloque1_operativo.cron_running ? 'En Ejecución' : 'Libre (Listo)'}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* PESTAÑA 2 / BLOQUE 2: ACTIVIDAD DEL ALTAR */}
            {(activeTab === 'general' || activeTab === 'altar') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                    <span>🕯️</span> BLOQUE 2 — Actividad del Altar & Distinción Estructural
                  </h2>
                  <span className="text-xs text-slate-400">Fuente: Supabase altar_candles & mural_slots</span>
                </div>

                {/* ALERTA DE DISTINCIÓN DE DATOS OBLIGATORIA */}
                <div className="bg-amber-950/40 border-2 border-amber-600/50 rounded-2xl p-4.5 text-xs text-amber-200/90 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="space-y-1">
                    <strong className="font-bold text-amber-100 block">Distinción Estructural de Datos del Proyecto:</strong>
                    <p className="leading-relaxed text-amber-200/80">
                      {metrics.bloque2_altar.distincion_mural.aclaracion}
                    </p>
                    <div className="flex items-center gap-4 pt-1 font-semibold text-amber-300">
                      <span>• Casillas físicas grid: <strong>{metrics.bloque2_altar.distincion_mural.casillas_ocupadas_grid}</strong></span>
                      <span>• Memoriales públicos: <strong>{metrics.bloque2_altar.distincion_mural.memoriales_publicados}</strong></span>
                      <span>• Memoriales borrador (no públicos): <strong>{metrics.bloque2_altar.distincion_mural.memoriales_borrador}</strong></span>
                      <span>• Velas importadas del mural: <strong>{metrics.bloque2_altar.homenajes_mural_importados}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Homenajes Mural</span>
                    <p className="text-2xl font-black text-amber-300">{metrics.bloque2_altar.homenajes_mural_importados}</p>
                    <span className="text-[10px] text-slate-500 block">Permanentes (Fijo)</span>
                  </div>

                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Velas de Familias</span>
                    <p className="text-2xl font-black text-indigo-300">{metrics.bloque2_altar.velas_comunitarias_total}</p>
                    <span className="text-[10px] text-slate-500 block">Comunitarias orgánicas</span>
                  </div>

                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Llamas Vivas Hoy</span>
                    <p className="text-2xl font-black text-emerald-400">{metrics.bloque2_altar.velas_comunitarias_vivas}</p>
                    <span className="text-[10px] text-slate-500 block">Ardiendo actualmente</span>
                  </div>

                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Velas en Reposo</span>
                    <p className="text-2xl font-black text-purple-300">{metrics.bloque2_altar.velas_comunitarias_reposo}</p>
                    <span className="text-[10px] text-slate-500 block">Tarjeta visible siempre</span>
                  </div>

                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Reencendidos</span>
                    <p className="text-2xl font-black text-pink-400">{metrics.bloque2_altar.reencendidos_gratuitos_total}</p>
                    <span className="text-[10px] text-slate-500 block">Acciones de reavivado</span>
                  </div>
                </div>

                {/* Desglose de Actividad Diaria (Últimos 7 días) */}
                <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ritmo de Nuevas Velas por Día (Últimos 7 días)
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {metrics.bloque2_altar.actividad_diaria_7d.map((d) => (
                      <div key={d.date} className="bg-[#1A2342] border border-[#2D3963] rounded-xl p-3 text-center space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 block">{d.date.slice(5)}</span>
                        <strong className="text-lg font-black text-white">{d.count}</strong>
                        <span className="text-[9px] text-slate-500 block">velas</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* PESTAÑA 3 / BLOQUE 3: CORREOS Y CRON */}
            {(activeTab === 'general' || activeTab === 'correos') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                    <span>📬</span> BLOQUE 3 — Correos Transaccionales & Automatización
                  </h2>
                  <span className="text-xs text-slate-400">Identificación explícita de fuentes de datos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Confirmaciones */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Confirmaciones Enviadas</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                        Inmediato
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {metrics.bloque3_correos_cron.confirmaciones_enviadas.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.confirmaciones_enviadas.fuente}
                    </p>
                  </div>

                  {/* Avisos Día 5 */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Avisos 48 Horas Antes (D5)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                        Cron 24h
                      </span>
                    </div>
                    <p className="text-2xl font-black text-purple-300">
                      {metrics.bloque3_correos_cron.recordatorios_dia5_48h.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.recordatorios_dia5_48h.fuente}
                    </p>
                  </div>

                  {/* Avisos Día 7 */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Avisos Vela en Reposo (D7)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                        Cron 24h
                      </span>
                    </div>
                    <p className="text-2xl font-black text-purple-300">
                      {metrics.bloque3_correos_cron.recordatorios_dia7_reposo.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.recordatorios_dia7_reposo.fuente}
                    </p>
                  </div>

                  {/* Bajas de Recordatorios */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Bajas Voluntarias (Unsubscribe)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
                        1 Clic
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-200">
                      {metrics.bloque3_correos_cron.bajas_recordatorios.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.bajas_recordatorios.fuente}
                    </p>
                  </div>

                  {/* Fallos de Envío */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Rebotes Detectados</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                        {metrics.bloque3_correos_cron.fallos_envio.valor === 0 ? '0 Fallos' : 'Atención'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">
                      {metrics.bloque3_correos_cron.fallos_envio.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.fallos_envio.fuente}
                    </p>
                  </div>

                  {/* Quejas de Spam */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Quejas de Correo no Deseado</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                        Objetivo 0.0%
                      </span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">
                      {metrics.bloque3_correos_cron.quejas_spam.valor}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Fuente:</strong> {metrics.bloque3_correos_cron.quejas_spam.fuente}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* PESTAÑA 4 / BLOQUE 4: CAPTACIÓN Y CONVERSIÓN */}
            {(activeTab === 'general' || activeTab === 'conversion') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                    <span>📈</span> BLOQUE 4 — Captación, Retención & Atribución Comercial
                  </h2>
                  <span className="text-xs text-slate-400">Transparencia: Métricas reales vs Pendientes</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Familias que regresan */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Familias que Regresan</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                        ✓ Medible Real
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {metrics.bloque4_captacion_conversion.familias_que_regresan.valor} familias
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {metrics.bloque4_captacion_conversion.familias_que_regresan.detalle}
                    </p>
                  </div>

                  {/* Reencendidos acumulados */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Reencendidos Gratuitos</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                        ✓ Medible Real
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {metrics.bloque4_captacion_conversion.reencendidos_gratuitos.valor} ciclos
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {metrics.bloque4_captacion_conversion.reencendidos_gratuitos.detalle}
                    </p>
                  </div>

                  {/* Visitas al Altar */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Visitas Únicas al Altar</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                        ⏳ En Instrumentación
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 pt-1">
                      {metrics.bloque4_captacion_conversion.visitas_altar.estado}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {metrics.bloque4_captacion_conversion.visitas_altar.motivo}
                    </p>
                  </div>

                  {/* Tasa de Encendido */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Tasa de Encendido</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                        ⏳ En Instrumentación
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 pt-1">
                      {metrics.bloque4_captacion_conversion.tasa_encendido.estado}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {metrics.bloque4_captacion_conversion.tasa_encendido.motivo}
                    </p>
                  </div>

                  {/* Clics al Mural Global */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Clics hacia el Mural Global</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                        ⏳ En Instrumentación
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 pt-1">
                      {metrics.bloque4_captacion_conversion.clics_hacia_mural_global.estado}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {metrics.bloque4_captacion_conversion.clics_hacia_mural_global.motivo}
                    </p>
                  </div>

                  {/* Compras Atribuibles */}
                  <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">Conversiones con Origen Altar</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                        ⏳ En Instrumentación
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 pt-1">
                      {metrics.bloque4_captacion_conversion.compras_atribuibles_altar.estado}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {metrics.bloque4_captacion_conversion.compras_atribuibles_altar.motivo}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* PESTAÑA 5 / BLOQUE 5: SEGURIDAD Y CONTROLES DE EMERGENCIA */}
            {(activeTab === 'general' || activeTab === 'seguridad') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                    <span>🔒</span> BLOQUE 5 — Seguridad & Protocolo de Emergencia
                  </h2>
                  <span className="text-xs text-slate-400">Modo Supervisión: Mutaciones deshabilitadas en V1</span>
                </div>

                <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-6 space-y-5">
                  <div className="flex items-start gap-3 bg-[#1C2547] border border-[#374477] p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <strong className="text-white block mb-0.5">Control de Parada de Emergencia (Kill-Switch)</strong>
                      Los siguientes tres controles permiten intervenir de forma selectiva ante eventuales fallos de proveedores o picos de tráfico. En esta primera versión, los controles se presentan en modo de lectura segura sin capacidad de mutación accidental.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1A2240] border border-[#303B63] p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-white">1. Altar Comunitario</strong>
                        <span className="text-[10px] font-bold text-emerald-400">ACTIVO</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Permite pausar nuevas velas comunitarias manteniendo las existentes.</p>
                      <button disabled className="w-full py-2 px-3 rounded-lg bg-[#273259] text-slate-400 text-xs font-semibold cursor-not-allowed border border-[#3B4A7D]">
                        Interruptor Bloqueado (Supervisión)
                      </button>
                    </div>

                    <div className="bg-[#1A2240] border border-[#303B63] p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-white">2. Confirmaciones Email</strong>
                        <span className="text-[10px] font-bold text-emerald-400">ACTIVO</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Pausa envíos transaccionales inmediatos si Resend reportara demoras.</p>
                      <button disabled className="w-full py-2 px-3 rounded-lg bg-[#273259] text-slate-400 text-xs font-semibold cursor-not-allowed border border-[#3B4A7D]">
                        Interruptor Bloqueado (Supervisión)
                      </button>
                    </div>

                    <div className="bg-[#1A2240] border border-[#303B63] p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-white">3. Recordatorios Cron</strong>
                        <span className="text-[10px] font-bold text-emerald-400">ACTIVO</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Desactiva el cron diario de aviso de 48h y de reposo.</p>
                      <button disabled className="w-full py-2 px-3 rounded-lg bg-[#273259] text-slate-400 text-xs font-semibold cursor-not-allowed border border-[#3B4A7D]">
                        Interruptor Bloqueado (Supervisión)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabla de Muestreo Reciente Anonimizado (Cero PII expuesto) */}
                <div className="bg-[#141B33] border border-[#2B3559] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Muestreo de Actividad Reciente del Altar (Sin Datos Personales)
                    </h3>
                    <span className="text-[11px] text-slate-500">Cero emails, tokens, IP ni claves expuestas</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#192244] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2C3863]">
                        <tr>
                          <th className="py-2.5 px-3">ID</th>
                          <th className="py-2.5 px-3">Mascota</th>
                          <th className="py-2.5 px-3">Tipo / Canal</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Llama</th>
                          <th className="py-2.5 px-3">Reencendidos</th>
                          <th className="py-2.5 px-3">Recordatorios</th>
                          <th className="py-2.5 px-3">Creación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#232D52]">
                        {metrics.recientes_anonimizados.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-500">
                              No hay velas comunitarias recientes registradas.
                            </td>
                          </tr>
                        ) : (
                          metrics.recientes_anonimizados.map((item) => (
                            <tr key={item.id} className="hover:bg-[#1A2242] transition-colors">
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{item.id}</td>
                              <td className="py-2.5 px-3 font-bold text-white">{item.pet_name}</td>
                              <td className="py-2.5 px-3 text-slate-300 font-medium">{item.type}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.is_lit
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                    : 'bg-purple-950 text-purple-300 border border-purple-700/60'
                                }`}>
                                  {item.is_lit ? '🔥 Encendida' : '💤 En Reposo'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-200">{item.reignite_count}</td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[11px] font-semibold ${item.reminder_opt_in ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {item.reminder_opt_in ? '✓ Activos' : '✕ Baja'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{item.created_at ? item.created_at.split('T')[0] : '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
}
