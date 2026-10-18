'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemorialItem {
  id: string;
  pet_name: string;
  species: string;
  breed?: string;
  email?: string;
  location?: string;
  dedication?: string;
  photo_url?: string;
  plan_type: string;
  price_paid?: number;
  visibility: 'public' | 'private' | 'hidden';
  moderation_status: 'approved' | 'pending' | 'rejected' | 'flagged';
  slot_assigned?: string;
  profile_slug?: string;
  created_at: string;
  story_answers?: {
    isShelter?: boolean;
    shelterName?: string;
    shelterCity?: string;
    isSponsored?: boolean;
    sponsorName?: string;
    sponsorPetName?: string;
  };
}

interface ModerationStats {
  totalCount: number;
  publicCount: number;
  hiddenCount: number;
  shelterCount: number;
}

export default function AdminModeracionPage() {
  // Autenticación simple por PIN para el admin
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Estados de datos
  const [memorials, setMemorials] = useState<MemorialItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalCount: 0,
    publicCount: 0,
    hiddenCount: 0,
    shelterCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'public' | 'hidden' | 'shelter' | 'standard'>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Estado de edición rápida
  const [editingItem, setEditingItem] = useState<MemorialItem | null>(null);
  const [editDedication, setEditDedication] = useState<string>('');
  const [editPetName, setEditPetName] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Verificar PIN guardado
  useEffect(() => {
    const savedPin = localStorage.getItem('admin_moderacion_auth');
    if (savedPin === 'cielo2026') {
      setIsAuthenticated(true);
    }
  }, []);

  // Manejar Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'cielo2026' || pinInput.trim() === 'angeles2026') {
      localStorage.setItem('admin_moderacion_auth', 'cielo2026');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. Contacta al administrador.');
    }
  };

  // Cargar memoriales desde la API
  const fetchMemorials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
        filter: activeFilter,
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/moderacion?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMemorials(data.memorials || []);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error cargando memoriales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemorials();
    }
  }, [isAuthenticated, page, activeFilter]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchMemorials();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cambiar visibilidad (Ocultar / Publicar)
  const toggleVisibility = async (item: MemorialItem) => {
    try {
      setUpdatingId(item.id);
      const isCurrentlyHidden = item.visibility === 'private' || item.visibility === 'hidden' || item.moderation_status === 'rejected';
      const targetVisibility = isCurrentlyHidden ? 'public' : 'private';
      const targetModeration = isCurrentlyHidden ? 'approved' : 'rejected';

      const res = await fetch('/api/admin/moderacion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          visibility: targetVisibility,
          moderation_status: targetModeration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMemorials((prev) =>
          prev.map((m) =>
            m.id === item.id
              ? { ...m, visibility: targetVisibility, moderation_status: targetModeration }
              : m
          )
        );
        // Actualizar contadores
        setStats((prev) => ({
          ...prev,
          publicCount: targetVisibility === 'public' ? prev.publicCount + 1 : Math.max(0, prev.publicCount - 1),
          hiddenCount: targetVisibility === 'private' ? prev.hiddenCount + 1 : Math.max(0, prev.hiddenCount - 1),
        }));
      } else {
        alert(`Error al actualizar visibilidad: ${data.error || 'Error del servidor'}`);
      }
    } catch (err) {
      console.error('Error cambiando visibilidad:', err);
      alert('Error de conexión al actualizar la visibilidad.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Guardar edición rápida de dedicatoria / nombre
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setUpdatingId(editingItem.id);
      const res = await fetch('/api/admin/moderacion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          pet_name: editPetName.trim(),
          dedication: editDedication.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMemorials((prev) =>
          prev.map((m) =>
            m.id === editingItem.id
              ? { ...m, pet_name: editPetName.trim(), dedication: editDedication.trim() }
              : m
          )
        );
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Error guardando edición:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 1. PANTALLA DE ACCESO POR PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-2 border-[#FBCFE8] rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-black font-serif text-[#1E2A78]">
              Panel de Moderación
            </h1>
            <p className="text-xs text-[#706A95] mt-1">
              Introduce el PIN de administrador para gestionar los memoriales publicados.
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

            {pinError && (
              <p className="text-xs text-red-500 font-semibold">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full text-white font-black text-sm tracking-wider uppercase bg-gradient-to-r from-[#F472B6] to-[#EC4899] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Acceder al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PANEL DE MODERACIÓN COMPLETO
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDFE] via-[#FFF8FA] to-[#FFF5F8] text-slate-800 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-[1300px] mx-auto space-y-6">

        {/* CABECERA PRINCIPAL */}
        <header className="bg-white/95 backdrop-blur-md border-2 border-pink-200 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-pink-100 text-[#BE185D] border border-pink-300">
                🛡️ Control Editorial & Curaduría
              </span>
              <span className="text-xs text-[#706A95] font-semibold">
                Ángeles en el Cielo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2A78]">
              Panel de Moderación
            </h1>
            <p className="text-xs sm:text-sm text-[#706A95] mt-0.5">
              Supervisa las fotos, dedicatorias y visibilidad de todos los memoriales del mural.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/onboarding-protectoras"
              className="px-4 py-2 rounded-full text-xs font-bold bg-pink-50 text-[#BE185D] hover:bg-pink-100 border border-pink-300 transition-all"
            >
              🐾 Alta Protectoras
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

        {/* TARJETAS DE ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border-2 border-pink-100 shadow-xs">
            <span className="text-xs text-[#706A95] font-bold block">Total Registrados</span>
            <span className="text-2xl font-black text-[#1E2A78]">{stats.totalCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-xs">
            <span className="text-xs text-emerald-700 font-bold block">Públicos en Mural</span>
            <span className="text-2xl font-black text-emerald-600">{stats.publicCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-amber-100 shadow-xs">
            <span className="text-xs text-amber-800 font-bold block">Ocultos / Rechazados</span>
            <span className="text-2xl font-black text-amber-600">{stats.hiddenCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-pink-200 shadow-xs">
            <span className="text-xs text-[#BE185D] font-bold block">De Protectoras</span>
            <span className="text-2xl font-black text-[#EC4899]">{stats.shelterCount}</span>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white/95 rounded-2xl border-2 border-pink-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-pink-200 focus:border-[#EC4899] outline-hidden text-xs sm:text-sm text-slate-800 bg-pink-50/30"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chips de Filtro */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'public', label: 'Públicos' },
              { id: 'hidden', label: 'Ocultos' },
              { id: 'shelter', label: 'Protectoras' },
              { id: 'standard', label: 'Particulares' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id as any);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#1E2A78] text-white shadow-xs'
                    : 'bg-pink-50 text-[#706A95] hover:bg-pink-100 hover:text-[#1E2A78]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE MEMORIALES EN CUADRÍCULA */}
        {loading ? (
          <div className="py-20 text-center text-[#706A95] space-y-2">
            <div className="w-8 h-8 border-3 border-[#EC4899] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Cargando memoriales...</p>
          </div>
        ) : memorials.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-pink-200 p-12 text-center text-[#706A95]">
            <p className="text-2xl mb-2">🕊️</p>
            <p className="font-bold text-sm">No se encontraron memoriales con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {memorials.map((item) => {
              const isShelter = item.story_answers?.isShelter || Boolean(item.story_answers?.shelterName);
              const isHidden = item.visibility === 'hidden' || item.moderation_status === 'rejected';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border-2 transition-all p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md relative ${
                    isHidden
                      ? 'border-amber-300 bg-amber-50/20 opacity-80'
                      : 'border-pink-200/90'
                  }`}
                >
                  {/* Fila superior: Foto + Datos principales */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-200 shrink-0 bg-slate-100 relative shadow-xs">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.pet_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                          🐾
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-black text-base text-[#1E2A78] truncate">
                          {item.pet_name}
                        </h3>
                        {/* Badge de Visibilidad */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                            isHidden
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isHidden ? 'Oculto' : 'Público'}
                        </span>
                      </div>

                      <p className="text-xs text-[#706A95] font-medium capitalize mt-0.5">
                        {item.species} {item.breed ? `· ${item.breed}` : ''}
                      </p>

                      {/* Info de protectora o plan */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {isShelter ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#BE185D] border border-pink-200">
                            💖 {item.story_answers?.shelterName || 'Protectora'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.plan_type === 'recuerdo_eterno' ? '⭐ 9 estrellas' : item.plan_type === 'estrella_anual' ? '⭐ 4 estrellas' : '⭐ 1 estrella'}
                          </span>
                        )}
                        {item.slot_assigned && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            Slot ({item.slot_assigned})
                          </span>
                        )}
                      </div>

                      {item.email && (
                        <p className="text-[11px] text-gray-400 truncate mt-1" title={item.email}>
                          ✉️ {item.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dedicatoria */}
                  <div className="bg-pink-50/40 rounded-xl p-3 border border-pink-100/80 text-xs text-slate-700 italic relative">
                    <p className="line-clamp-3">"{item.dedication || 'Sin dedicatoria'}"</p>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditPetName(item.pet_name);
                        setEditDedication(item.dedication || '');
                      }}
                      className="text-[10px] font-bold text-[#EC4899] hover:underline mt-1 block not-italic"
                    >
                      ✏️ Editar texto
                    </button>
                  </div>

                  {/* Botonera de Acción */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-pink-100">
                    {/* Botón Ocultar / Publicar */}
                    <button
                      onClick={() => toggleVisibility(item)}
                      disabled={updatingId === item.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isHidden
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {updatingId === item.id ? (
                        <span>⏳ Guardando...</span>
                      ) : isHidden ? (
                        <>
                          <span>👁️</span>
                          <span>Publicar en Mural</span>
                        </>
                      ) : (
                        <>
                          <span>🚫</span>
                          <span>Ocultar del Mural</span>
                        </>
                      )}
                    </button>

                    {/* Enlaces de vista */}
                    <div className="flex items-center gap-2">
                      {item.profile_slug && (
                        <Link
                          href={`/memorial/${item.profile_slug}`}
                          target="_blank"
                          className="text-xs font-bold text-[#1E2A78] hover:text-[#EC4899] transition-colors"
                          title="Ver página de memorial público"
                        >
                          Memorial ↗
                        </Link>
                      )}
                      {item.slot_assigned && (
                        <Link
                          href={`/mural-global?highlight=${item.slot_assigned}&zoom=true`}
                          target="_blank"
                          className="text-xs font-bold text-[#BE185D] hover:underline"
                          title="Ver posición en el mural"
                        >
                          Mural ↗
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-pink-200 bg-white text-xs font-bold text-[#1E2A78] disabled:opacity-40 hover:bg-pink-50"
            >
              ← Anterior
            </button>
            <span className="text-xs font-bold text-[#706A95]">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full border border-pink-200 bg-white text-xs font-bold text-[#1E2A78] disabled:opacity-40 hover:bg-pink-50"
            >
              Siguiente →
            </button>
          </div>
        )}

      </div>

      {/* MODAL DE EDICIÓN RÁPIDA DE DEDICATORIA */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border-2 border-pink-300 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black font-serif text-[#1E2A78]">
                Editar datos de {editingItem.pet_name}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#706A95] block mb-1">Nombre</label>
              <input
                type="text"
                value={editPetName}
                onChange={(e) => setEditPetName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:border-[#EC4899] outline-hidden text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#706A95] block mb-1">Dedicatoria</label>
              <textarea
                rows={4}
                value={editDedication}
                onChange={(e) => setEditDedication(e.target.value)}
                className="w-full p-3 rounded-xl border border-pink-200 focus:border-[#EC4899] outline-hidden text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updatingId === editingItem.id}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#EC4899] hover:bg-[#DB2777] text-white shadow-xs"
              >
                {updatingId === editingItem.id ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
