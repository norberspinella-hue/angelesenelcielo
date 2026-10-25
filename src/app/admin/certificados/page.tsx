'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CertificateItem {
  id: string;
  order_id: string;
  user_email: string;
  pet_name: string;
  plan: string;
  founder_number: number | null;
  slot_code: string | null;
  pet_photo_url: string;
  profile_url: string | null;
  upload_token: string;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'uploaded';
  certificate_pdf_url: string | null;
  certificate_png_url: string | null;
  created_at: string;
  delivered_at: string | null;
  species?: string;
  breed?: string;
  birth_date?: string | null;
  death_date?: string | null;
  dedication?: string;
  mural_url?: string | null;
}

interface StatsData {
  totalFounders: number;
  foundersOccupied: number;
  foundersAvailable: number;
  pendingCount: number;
  deliveredCount: number;
  totalCertificates: number;
}

export default function AdminCertificadosPage() {
  // Autenticación por PIN
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Datos
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalFounders: 2000,
    foundersOccupied: 6,
    foundersAvailable: 1994,
    pendingCount: 0,
    deliveredCount: 0,
    totalCertificates: 6,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'founders' | 'pending' | 'delivered'>('all');

  // Estados de edición por tarjeta
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editPdfUrl, setEditPdfUrl] = useState<string>('');
  const [editPngUrl, setEditPngUrl] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; isError?: boolean } | null>(null);

  // Verificar PIN guardado
  useEffect(() => {
    const savedPin = localStorage.getItem('admin_moderacion_auth');
    if (savedPin === 'cielo2026' || savedPin === 'angeles2026') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'cielo2026' || pinInput.trim() === 'angeles2026') {
      localStorage.setItem('admin_moderacion_auth', 'cielo2026');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. Introduce cielo2026.');
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/certificates');
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error cargando certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCertificates();
    }
  }, [isAuthenticated]);

  // Actualizar estado rápido
  const handleUpdateStatus = async (certId: string, newStatus: string) => {
    setSavingId(certId);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: certId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCertificates((prev) =>
          prev.map((c) => (c.id === certId ? { ...c, status: newStatus as any } : c))
        );
        showFeedback(certId, 'Estado actualizado con éxito');
      } else {
        showFeedback(certId, data.error || 'Error al actualizar', true);
      }
    } catch (err: any) {
      showFeedback(certId, err.message, true);
    } finally {
      setSavingId(null);
    }
  };

  // Guardar URLs de archivos / email
  const handleSaveDetails = async (cert: CertificateItem) => {
    setSavingId(cert.id);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cert.id,
          certificate_pdf_url: editPdfUrl.trim() || cert.certificate_pdf_url,
          certificate_png_url: editPngUrl.trim() || cert.certificate_png_url,
          user_email: editEmail.trim() || cert.user_email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertificates((prev) =>
          prev.map((c) =>
            c.id === cert.id
              ? {
                  ...c,
                  certificate_pdf_url: editPdfUrl.trim() || c.certificate_pdf_url,
                  certificate_png_url: editPngUrl.trim() || c.certificate_png_url,
                  user_email: editEmail.trim() || c.user_email,
                }
              : c
          )
        );
        setEditingCertId(null);
        showFeedback(cert.id, 'Datos guardados correctamente');
      } else {
        showFeedback(cert.id, data.error || 'Error al guardar', true);
      }
    } catch (err: any) {
      showFeedback(cert.id, err.message, true);
    } finally {
      setSavingId(null);
    }
  };

  // Enviar email de entrega oficial con 1 clic
  const handleDeliverEmail = async (cert: CertificateItem) => {
    if (!cert.certificate_pdf_url && !cert.certificate_png_url) {
      showFeedback(
        cert.id,
        'Debes añadir primero la URL del PDF o del PNG del diploma antes de enviarlo',
        true
      );
      return;
    }

    const confirmSend = window.confirm(
      `¿Deseas enviar oficialmente el certificado de ${cert.pet_name} a ${cert.user_email}?`
    );
    if (!confirmSend) return;

    setDeliveringId(cert.id);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deliver_email',
          id: cert.id,
          user_email: cert.user_email,
          certificate_pdf_url: cert.certificate_pdf_url,
          certificate_png_url: cert.certificate_png_url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertificates((prev) =>
          prev.map((c) =>
            c.id === cert.id
              ? { ...c, status: 'delivered', delivered_at: new Date().toISOString() }
              : c
          )
        );
        showFeedback(cert.id, `¡Diploma enviado a ${cert.user_email}! ✨`);
      } else {
        showFeedback(cert.id, data.error || 'Error al enviar email', true);
      }
    } catch (err: any) {
      showFeedback(cert.id, err.message, true);
    } finally {
      setDeliveringId(null);
    }
  };

  const showFeedback = (id: string, text: string, isError: boolean = false) => {
    setFeedbackMsg({ id, text, isError });
    setTimeout(() => {
      setFeedbackMsg((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  // Filtros y búsqueda
  const filteredList = certificates.filter((item) => {
    if (filter === 'founders' && !item.founder_number) return false;
    if (filter === 'pending' && item.status !== 'pending' && item.status !== 'in_progress') return false;
    if (filter === 'delivered' && item.status !== 'delivered' && item.status !== 'uploaded') return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.pet_name.toLowerCase().includes(term) ||
      (item.user_email || '').toLowerCase().includes(term) ||
      (item.founder_number ? `#${item.founder_number}`.includes(term) : false) ||
      (item.slot_code || '').includes(term)
    );
  });

  // Pantalla PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-2 border-[#FBCFE8] rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
            📜
          </div>
          <div>
            <h1 className="text-2xl font-black font-serif text-[#1E2A78]">
              Gestión de Certificados
            </h1>
            <p className="text-xs text-[#706A95] mt-1">
              Introduce el PIN de administrador para acceder al control de diplomas y fundadores.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN de acceso (ej. cielo2026)"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-[#EC4899] outline-hidden text-center text-lg font-bold tracking-widest text-[#1E2A78]"
              autoFocus
            />

            {pinError && <p className="text-xs text-red-500 font-semibold">{pinError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full text-white font-black text-sm tracking-wider uppercase bg-gradient-to-r from-[#F472B6] to-[#EC4899] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Acceder al Control
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDFE] via-[#FFF8FA] to-[#FFF5F8] text-slate-800 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-[1340px] mx-auto space-y-6">

        {/* CABECERA PRINCIPAL */}
        <header className="bg-white/95 backdrop-blur-md border-2 border-pink-200 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                👑 Conteo de Ángeles Fundadores
              </span>
              <span className="text-xs text-[#706A95] font-semibold">
                Santuario Memorial
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2A78]">
              Gestión de Certificados & Diplomas
            </h1>
            <p className="text-xs sm:text-sm text-[#706A95] mt-0.5">
              Supervisión de cada estrella, asignación del número oficial de fundador y entrega manual de diplomas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/moderacion"
              className="px-4 py-2 rounded-full text-xs font-bold bg-pink-50 text-[#BE185D] hover:bg-pink-100 border border-pink-300 transition-all"
            >
              🛡️ Moderación
            </Link>
            <Link
              href="/admin/onboarding-protectoras"
              className="px-4 py-2 rounded-full text-xs font-bold bg-pink-50 text-[#BE185D] hover:bg-pink-100 border border-pink-300 transition-all"
            >
              🐾 Alta Protectoras
            </Link>
            <Link
              href="/live-tiktok"
              target="_blank"
              className="px-4 py-2 rounded-full text-xs font-black bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-95 transition-all shadow-xs flex items-center gap-1"
            >
              <span>🔴 TikTok LIVE Studio</span>
              <span>↗</span>
            </Link>
            <Link
              href="/mural-global"
              target="_blank"
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#1E2A78] text-white hover:bg-[#151D54] transition-all shadow-xs"
            >
              🌌 Ver Mural ↗
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('admin_moderacion_auth');
                setIsAuthenticated(false);
              }}
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-red-600 transition-all"
              title="Cerrar sesión"
            >
              Salir 🚪
            </button>
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS Y CONTEO DE FUNDADORES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-200 shadow-xs">
            <span className="text-xs text-amber-800 font-bold block">👑 Fundadores Activos</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-900 mt-1 block">
              {stats.foundersOccupied} <span className="text-sm font-semibold text-amber-700">/ {stats.totalFounders}</span>
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Primeros 2.000 del cielo</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-xs">
            <span className="text-xs text-[#706A95] font-bold block">🌌 Plazas Disponibles</span>
            <span className="text-2xl sm:text-3xl font-black text-[#1E2A78] mt-1 block">
              {stats.foundersAvailable}
            </span>
            <span className="text-[11px] text-indigo-500 font-medium">En la Zona Central</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-rose-100 shadow-xs">
            <span className="text-xs text-[#706A95] font-bold block">⏳ Pendientes de Diseño</span>
            <span className="text-2xl sm:text-3xl font-black text-[#BE185D] mt-1 block">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-rose-400 font-medium">Por elaborar artesanalmente</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-xs">
            <span className="text-xs text-[#706A95] font-bold block">🎁 Entregados a Familia</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {stats.deliveredCount}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Diplomas despachados</span>
          </div>
        </div>

        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div className="bg-white rounded-2xl border border-pink-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#1E2A78] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({certificates.length})
            </button>
            <button
              onClick={() => setFilter('founders')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'founders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              👑 Fundadores ({stats.foundersOccupied})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-[#BE185D] text-white shadow-xs'
                  : 'bg-rose-50 text-[#BE185D] hover:bg-rose-100'
              }`}
            >
              ⏳ Pendientes ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              🎁 Entregados ({stats.deliveredCount})
            </button>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o #..."
              className="w-full px-3.5 py-1.5 text-xs rounded-full border border-pink-200 focus:border-[#EC4899] outline-hidden text-[#1E2A78]"
            />
          </div>
        </div>

        {/* LISTADO DE CERTIFICADOS */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-pink-300 border-t-[#EC4899] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-[#706A95]">Cargando diplomas y fundadores...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-pink-200 p-12 text-center text-[#706A95]">
            <span className="text-4xl block mb-2">🐾</span>
            <p className="font-serif text-lg font-bold text-[#1E2A78]">No se encontraron registros</p>
            <p className="text-xs mt-1">Prueba con otro filtro o término de búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const isEditing = editingCertId === item.id;
              const isSaving = savingId === item.id;
              const isDelivering = deliveringId === item.id;
              const currentFeedback = feedbackMsg?.id === item.id ? feedbackMsg : null;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border-2 transition-all p-5 shadow-sm ${
                    item.founder_number ? 'border-amber-200/90' : 'border-pink-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                    {/* COLUMNA 1: FOTO Y DATOS ESENCIALES */}
                    <div className="flex items-start sm:items-center gap-4 min-w-[280px]">
                      {/* Miniatura de la foto */}
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-pink-100 border-2 border-pink-200 shrink-0 shadow-xs">
                        {item.pet_photo_url ? (
                          <img
                            src={item.pet_photo_url}
                            alt={item.pet_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🐾
                          </div>
                        )}
                        {item.founder_number && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            ★ #{item.founder_number}
                          </div>
                        )}
                      </div>

                      {/* Nombre y detalles */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-black font-serif text-[#1E2A78]">
                            {item.pet_name}
                          </h3>
                          {item.founder_number ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300 shadow-xs">
                              👑 Fundador #{String(item.founder_number).padStart(4, '0')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#BE185D] border border-pink-200">
                              Estrella Eterna
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#706A95] flex items-center gap-2 flex-wrap">
                          <span>{item.species === 'gato' ? '🐱 Gatito' : '🐶 Perrito'}</span>
                          {item.breed && <span>· {item.breed}</span>}
                          {item.birth_date && item.death_date && (
                            <span>
                              · {new Date(item.birth_date).getFullYear()} — {new Date(item.death_date).getFullYear()}
                            </span>
                          )}
                        </div>

                        {/* Coordenadas en mural y plan */}
                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#7B5EA9] border border-purple-200">
                            ✨ {
                              item.plan === 'recuerdo_eterno' || item.plan === 'corazon_eterno'
                                ? 'Corazón Eterno (9 estrellas, 3×3)'
                                : item.plan === 'angelito_protector'
                                ? 'Ángelito Protector (16 estrellas, 4×4)'
                                : item.plan === 'galaxia_amor'
                                ? 'Galaxia de Amor (25 estrellas, 5×5)'
                                : item.plan === 'vinculo_infinito'
                                ? 'Vínculo Infinito (36 estrellas, 6×6)'
                                : item.plan === 'estrella_anual' || item.plan === 'estrella_brillante'
                                ? 'Estrella Brillante (4 estrellas, 2×2)'
                                : item.plan === 'recuerdo_inicial' || item.plan === 'huellita'
                                ? 'Huellita (1 estrella)'
                                : item.plan
                            }
                          </span>
                          {item.slot_code && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                              📍 Casilla ({item.slot_code})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 2: FAMILIA Y DEDICATORIA */}
                    <div className="w-full lg:max-w-[340px] space-y-1.5 text-xs text-[#706A95]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1E2A78]">Familia:</span>
                        <span className="font-mono bg-pink-50/60 px-2 py-0.5 rounded border border-pink-100 text-[11px] text-[#25335F]">
                          {item.user_email || 'No indicado'}
                        </span>
                      </div>

                      {item.dedication && (
                        <p className="font-serif italic text-slate-600 line-clamp-2 bg-[#FFF8FA] p-2 rounded-xl border border-pink-100/60">
                          «{item.dedication}»
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px]">
                        {item.mural_url && (
                          <a
                            href={item.mural_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#EC4899] hover:underline font-bold flex items-center gap-0.5"
                          >
                            🌌 Ver en Mural ↗
                          </a>
                        )}
                        {item.profile_url && (
                          <a
                            href={item.profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7B5EA9] hover:underline font-bold flex items-center gap-0.5"
                          >
                            📖 Ver Memorial ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 3: ESTADO Y ACCIONES PRINCIPALES */}
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5">
                      {/* Estado visual actual */}
                      <div className="flex items-center gap-1.5">
                        {item.status === 'delivered' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            ✅ Entregado a la Familia
                          </span>
                        ) : item.status === 'ready' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                            ✨ Listo para Enviar
                          </span>
                        ) : item.status === 'in_progress' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                            🎨 En Proceso / Boceto
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-[#BE185D] border border-rose-300 flex items-center gap-1">
                            ⏳ Pendiente de Diseño
                          </span>
                        )}

                        {/* Botón editar URLs */}
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingCertId(null);
                            } else {
                              setEditingCertId(item.id);
                              setEditPdfUrl(item.certificate_pdf_url || '');
                              setEditPngUrl(item.certificate_png_url || '');
                              setEditEmail(item.user_email || '');
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer"
                        >
                          {isEditing ? 'Cerrar ✕' : 'Gestionar Archivos ✏️'}
                        </button>
                      </div>

                      {/* Botón principal de Envío por Email con 1 Clic */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeliverEmail(item)}
                          disabled={isDelivering}
                          className={`px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                            item.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white hover:opacity-95 shadow-md active:scale-98'
                          }`}
                        >
                          {isDelivering ? (
                            'Enviando correo...'
                          ) : item.status === 'delivered' ? (
                            'Reenviar Diploma ✉️'
                          ) : (
                            'Enviar Diploma a Familia 🚀'
                          )}
                        </button>

                        {/* Enlace directo a la pantalla de subida clásica */}
                        <Link
                          href={`/admin/upload-certificate?token=${item.upload_token}`}
                          target="_blank"
                          className="px-3 py-2 rounded-full text-[11px] font-bold bg-pink-50 text-[#BE185D] hover:bg-pink-100 border border-pink-200 transition-all"
                          title="Abrir formulario de subida de archivos"
                        >
                          Subir PDF/PNG ↗
                        </Link>
                      </div>

                      {/* Mensaje de feedback temporal */}
                      {currentFeedback && (
                        <p
                          className={`text-xs font-bold ${
                            currentFeedback.isError ? 'text-red-500' : 'text-emerald-600'
                          }`}
                        >
                          {currentFeedback.text}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* CAJA DESPLEGABLE DE EDICIÓN RÁPIDA (URLs DE CERTIFICADOS Y EMAIL) */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-pink-100 bg-[#FFFDFE] p-4 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#1E2A78] block mb-1">
                            Email de destino:
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-pink-200 focus:border-[#EC4899] outline-hidden text-[#1E2A78]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#1E2A78] block mb-1">
                            URL Certificado PDF:
                          </label>
                          <input
                            type="url"
                            value={editPdfUrl}
                            onChange={(e) => setEditPdfUrl(e.target.value)}
                            placeholder="https://.../diploma.pdf"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-pink-200 focus:border-[#EC4899] outline-hidden text-[#1E2A78]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#1E2A78] block mb-1">
                            URL Certificado PNG:
                          </label>
                          <input
                            type="url"
                            value={editPngUrl}
                            onChange={(e) => setEditPngUrl(e.target.value)}
                            placeholder="https://.../diploma.png"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-pink-200 focus:border-[#EC4899] outline-hidden text-[#1E2A78]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                        {/* Selector manual de estado */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[#706A95]">Cambiar estado:</span>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'pending')}
                            disabled={isSaving}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                              item.status === 'pending'
                                ? 'bg-rose-500 text-white border-rose-600'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Pendiente
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                            disabled={isSaving}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                              item.status === 'in_progress'
                                ? 'bg-purple-500 text-white border-purple-600'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            En Proceso
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'ready')}
                            disabled={isSaving}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                              item.status === 'ready'
                                ? 'bg-blue-500 text-white border-blue-600'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Listo
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'delivered')}
                            disabled={isSaving}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                              item.status === 'delivered'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Entregado
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveDetails(item)}
                            disabled={isSaving}
                            className="px-4 py-1.5 text-xs font-black bg-[#1E2A78] text-white rounded-xl hover:bg-[#151D54] transition-all cursor-pointer shadow-xs"
                          >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios 💾'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
