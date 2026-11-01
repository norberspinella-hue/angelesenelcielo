'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PRELOADED_LETTERS,
  SHELTER_ANGELS,
} from './types';
import { useLiveStreamSync } from './useLiveStreamSync';
import { LiveCanvas } from './LiveCanvas';
import { AddCandleModal } from './AddCandleModal';

export function PresenterPanel() {
  const {
    state,
    updateState,
    addCandle,
    activatePet,
    resetLiveSession,
    syncStatus,
    activeOutputsCount,
    isAuthenticated,
    loginWithPin,
    logout,
  } = useLiveStreamSync({ isController: true });

  const [activeTab, setActiveTab] = useState<'scenes' | 'candles' | 'preview' | 'sync'>('scenes');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [safeZoneOpacity, setSafeZoneOpacity] = useState<number>(0.85);

  // PIN login state
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSubmittingPin, setIsSubmittingPin] = useState<boolean>(false);

  const addCandleBtnRef = useRef<HTMLButtonElement>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) {
      setPinError('Introduce el PIN de acceso.');
      return;
    }
    setIsSubmittingPin(true);
    setPinError('');
    const res = await loginWithPin(inputPin.trim());
    setIsSubmittingPin(false);
    if (!res.success) {
      setPinError(res.error || 'PIN incorrecto.');
    } else {
      setInputPin('');
    }
  };

  // Global Keyboard shortcuts (DISABLED when typing in input/textarea/select or unauthenticated)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (showAddModal) return;

      // Scene switching: 1, 2, 3
      if (e.key === '1') {
        e.preventDefault();
        updateState({ activeScene: 1 });
      } else if (e.key === '2') {
        e.preventDefault();
        updateState({ activeScene: 2 });
      } else if (e.key === '3') {
        e.preventDefault();
        updateState({ activeScene: 3 });
      }

      // Safe zone: Z
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setShowSafeZone((prev) => !prev);
      }

      // New candle modal: N
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      }

      // Card navigation: ArrowLeft / ArrowRight / Space
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        updateState((prev) => ({
          currentLetterIndex: (prev.currentLetterIndex + 1) % PRELOADED_LETTERS.length,
        }));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateState((prev) => ({
          currentLetterIndex:
            (prev.currentLetterIndex - 1 + PRELOADED_LETTERS.length) % PRELOADED_LETTERS.length,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, isAuthenticated, updateState]);

  return (
    <div className="min-h-screen bg-[#0A0314] text-white flex flex-col font-sans select-none overflow-x-hidden w-full max-w-full">
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR: STATUS, TITLES & LINK TO OUTPUT            */}
      {/* ======================================================== */}
      <header className="border-b border-[#F3D5E4]/20 bg-[#120721]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-[#EC4899] flex items-center justify-center text-stone-950 font-black text-xs sm:text-sm shadow-md shrink-0">
            🎙️
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-serif font-black text-amber-100 flex items-center gap-1.5 truncate">
              <span>Presentador</span>
              <span className="text-[9px] sm:text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-300/30">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] text-pink-200/70 hidden sm:block truncate">
              Control en vivo sincronizado con OBS Studio y TikTok LIVE Studio
            </p>
          </div>
        </div>

        {/* Status badges & Output Launcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                🔒 Autenticado
              </span>
              <button
                onClick={logout}
                className="text-[10px] text-pink-300/80 hover:text-white underline cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-400/30">
              🔒 Bloqueado por PIN
            </span>
          )}

          {/* Sync indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              syncStatus === 'synced'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
            }`}
            title="Sincronización multi-canal activa (BroadcastChannel + Realtime)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {syncStatus === 'synced' ? 'Sincronizado' : 'Conectando'}
            </span>
            <span className="text-[10px] font-mono opacity-80">
              ({activeOutputsCount > 0 ? `${activeOutputsCount} OBS` : 'Listo'})
            </span>
          </div>

          {/* Direct link to open Salida LIVE */}
          <Link
            href="/live-tiktok/output"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#BE185D] hover:from-[#f45fa9] hover:to-[#ce246e] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            title="Abrir la Salida Limpia 1080x1920 para capturar en OBS"
          >
            <span>📺</span>
            <span className="hidden sm:inline">Abrir Salida LIVE</span>
            <span className="text-[10px] opacity-75">↗</span>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. PIN AUTHENTICATION GATE (If not authenticated)        */}
      {/* ======================================================== */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#160B24] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔐
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-amber-100">
                Acceso al Estudio del Presentador
              </h2>
              <p className="text-xs text-pink-200/80 mt-1.5 leading-relaxed">
                Introduce el PIN de seguridad de emisión para tomar el control del directo y sincronizar la salida de OBS.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Introduce el PIN de emisión"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-pink-400/40 text-amber-200 placeholder-pink-300/40 font-bold text-center tracking-widest outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-base"
                  autoFocus
                />
                {pinError && (
                  <p role="alert" className="text-xs font-bold text-rose-400 mt-2">
                    ⚠️ {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingPin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPin ? 'Verificando...' : 'Desbloquear Controles ✨'}
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 text-[11px] text-pink-300/70">
              🔒 Protección de canal activada. Nadie puede emitir sin autorización.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* 3. MOBILE TABS NAVIGATION (Visible on screens < 1024px)   */}
          {/* ======================================================== */}
          <nav
            aria-label="Pestañas de control"
            className="lg:hidden flex items-center justify-around border-b border-white/10 bg-[#170928] px-2 py-1 sticky top-[57px] z-20"
          >
            {[
              { id: 'scenes', label: 'Escenas', icon: '🎬' },
              { id: 'candles', label: 'Velitas', icon: '🕯️' },
              { id: 'preview', label: 'Monitor', icon: '📺' },
              { id: 'sync', label: 'Ajustes', icon: '⚡' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                      : 'text-pink-200 hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ======================================================== */}
          {/* 4. MAIN WORKSPACE (2 Columns on Desktop, Tabbed on Mobile)*/}
          {/* ======================================================== */}
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ====================================================== */}
            {/* LEFT COLUMN: PRESENTER CONTROLS                        */}
            {/* ====================================================== */}
            <section
              aria-label="Panel de controles del presentador"
              className={`lg:col-span-7 flex flex-col gap-6 ${
                activeTab === 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* TAB 1: ESCENAS Y CARTAS */}
              <div
                className={`flex flex-col gap-5 ${
                  activeTab !== 'scenes' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* 1.1 Conmutador de Escenas */}
                <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-2">
                      <span>🎬</span> Escena Activa en la Emisión
                    </span>
                    <span className="text-[11px] text-pink-200/60 font-mono hidden sm:inline">
                      Atajos: [1] [2] [3]
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 1, title: 'Cielo de Luces', sub: 'Altar de Velas', key: '1', icon: '🕯️' },
                      { id: 2, title: 'Visor Ghibli', sub: 'Cartas al Cielo', key: '2', icon: '💌' },
                      { id: 3, title: 'Luz del Refugio', sub: 'Vaiana Solidaria', key: '3', icon: '🐾' },
                    ].map((sc) => {
                      const isCurrent = state.activeScene === sc.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => updateState({ activeScene: sc.id as any })}
                          className={`p-3.5 rounded-2xl border text-left transition-all min-h-[58px] cursor-pointer flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 border-amber-300 shadow-lg font-black scale-[1.02]'
                              : 'bg-black/30 border-white/10 text-pink-100 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-lg">{sc.icon}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                                isCurrent ? 'bg-black/20 text-stone-900 font-bold' : 'bg-white/10 text-pink-300'
                              }`}
                            >
                              [{sc.key}]
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight mt-1">{sc.title}</div>
                            <div
                              className={`text-[10px] leading-tight ${
                                isCurrent ? 'text-stone-800' : 'text-pink-300/70'
                              }`}
                            >
                              {sc.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Control de Cartas */}
                <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-200 flex items-center gap-2">
                        <span>💌</span> Selección de Cartas ({state.currentLetterIndex + 1}/
                        {PRELOADED_LETTERS.length})
                      </span>
                      <p className="text-[11px] text-pink-200/60 mt-0.5">
                        Homenajeando a: <strong className="text-amber-300">{PRELOADED_LETTERS[state.currentLetterIndex]?.petName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateState((prev) => ({
                            currentLetterIndex:
                              (prev.currentLetterIndex - 1 + PRELOADED_LETTERS.length) %
                              PRELOADED_LETTERS.length,
                          }))
                        }
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-pink-100 border border-white/15 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Carta anterior (Flecha Izquierda)"
                      >
                        ◀
                      </button>

                      <button
                        onClick={() =>
                          updateState((prev) => ({
                            autoPlayLetters: !prev.autoPlayLetters,
                          }))
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-black border transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
                          state.autoPlayLetters
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md animate-pulse'
                            : 'bg-white/10 text-pink-200 border-white/15 hover:bg-white/20'
                        }`}
                        title="Activar o pausar pase automático"
                      >
                        <span>{state.autoPlayLetters ? '⏸ Pausar' : '▶ Auto'}</span>
                      </button>

                      <button
                        onClick={() =>
                          updateState((prev) => ({
                            currentLetterIndex: (prev.currentLetterIndex + 1) % PRELOADED_LETTERS.length,
                          }))
                        }
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-pink-100 border border-white/15 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Siguiente carta (Flecha Derecha o Espacio)"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* Slider de Duración de Cartas */}
                  <div className="bg-black/30 rounded-2xl p-3 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs text-pink-200">
                      <span className="font-bold">⏱️ Intervalo de pase automático:</span>{' '}
                      <span className="font-mono text-amber-300 font-bold">{state.letterDuration} seg</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={30}
                        step={1}
                        value={state.letterDuration}
                        onChange={(e) => updateState({ letterDuration: Number(e.target.value) })}
                        className="w-40 accent-amber-400 cursor-pointer"
                        aria-label="Ajustar duración de cada carta en segundos"
                      />
                      <span className="text-[11px] font-mono text-pink-300/80">30s</span>
                    </div>
                  </div>

                  {/* Galería de las 7 cartas predefinidas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
                    {PRELOADED_LETTERS.map((letter, idx) => {
                      const isSelected = state.currentLetterIndex === idx;
                      return (
                        <button
                          key={letter.id}
                          onClick={() => {
                            updateState({
                              currentLetterIndex: idx,
                              activeScene: 2,
                            });
                          }}
                          className={`p-2 rounded-2xl border text-left transition-all flex flex-col items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-b from-[#EC4899]/30 to-[#BE185D]/40 border-amber-300 ring-2 ring-amber-400/50 shadow-lg scale-[1.02]'
                              : 'bg-black/25 border-white/10 hover:bg-white/5 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-300 bg-pink-100 shrink-0">
                            <img
                              src={letter.photoUrl}
                              alt={letter.petName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center w-full">
                            <span className="font-serif font-black text-xs text-white block truncate">
                              {letter.petName}
                            </span>
                            <span className="text-[10px] text-pink-300/80 font-mono block truncate">
                              Slot: {letter.slot}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TAB 2: GESTIÓN DE VELITAS DEL CHAT */}
              <div
                className={`flex flex-col gap-4 ${
                  activeTab !== 'candles' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-4">
                  {/* Métricas Separadas del Directo y del Mural */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10">
                    <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-3">
                      <span className="text-[11px] font-bold text-amber-200/80 block">
                        🌟 Estrellas en el Mural Global (BD)
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-amber-300">
                          {state.muralStarsCount}
                        </span>
                        <span className="text-[10px] text-pink-200/60 font-sans">
                          (Dato real verificado · Inmutable)
                        </span>
                      </div>
                    </div>
                    <div className="sm:pl-3 pt-2 sm:pt-0 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-pink-300 block">
                          🕯️ Velas Encendidas en Este Directo
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xl font-black font-mono text-white">
                            {state.sessionCandlesCount}
                          </span>
                          <span className="text-[10px] text-pink-200/60 font-sans">
                            (Sesión actual)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={resetLiveSession}
                        className="text-[10px] text-pink-400 hover:text-white underline cursor-pointer"
                        title="Reiniciar contador de velas a cero para un nuevo directo"
                      >
                        Reiniciar a 0
                      </button>
                    </div>
                  </div>

                  {/* Mascota Activa en el Pedestal */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-amber-300/40 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                        👑 Mascota Activa en el Pedestal
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-serif font-black text-white">
                          {state.activePetName || '(Altar en reposo / Sin vela activa)'}
                        </span>
                        {state.activePetSpecies && (
                          <span className="text-[10px] text-pink-200/80 bg-white/10 px-2 py-0.5 rounded-md">
                            {state.activePetSpecies}
                          </span>
                        )}
                      </div>
                      {state.activePetDedication && (
                        <p className="text-[11px] text-pink-200/70 italic mt-0.5 font-serif line-clamp-1">
                          «{state.activePetDedication.replace('\n', ' ')}»
                        </p>
                      )}
                    </div>
                    {state.activePetName && (
                      <button
                        onClick={() =>
                          updateState({
                            activePetName: '',
                            activePetSpecies: '',
                            activePetDedication: '',
                          })
                        }
                        className="text-[11px] text-pink-300 hover:text-white underline cursor-pointer px-2 py-1"
                        title="Dejar el altar en estado de reposo"
                      >
                        Limpiar altar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-2">
                        <span>🕯️</span> Incorporar Velita del Chat
                      </span>
                      <p className="text-[11px] text-pink-200/70 mt-0.5">
                        Escribe el nombre del perrito/gatito pedido en comentarios
                      </p>
                    </div>

                    <button
                      ref={addCandleBtnRef}
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 active:scale-95 text-stone-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                      title="Atajo: Tecla N"
                    >
                      <span>➕</span>
                      <span>Encender Vela (N)</span>
                    </button>
                  </div>

                  {/* Lista dinámica de velas activas */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-pink-300/70 block">
                      Velas registradas en la emisión:
                    </span>
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {state.candles.slice(0, 12).map((c) => {
                        const isCurrentActive = state.activePetName === c.name;
                        return (
                          <div
                            key={c.id}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border transition-all ${
                              isCurrentActive
                                ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 border-amber-300 text-white font-bold shadow-md'
                                : c.isNew
                                ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 border-amber-300/60 text-amber-100'
                                : 'bg-black/30 border-white/5 text-pink-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-amber-400 text-sm shrink-0">🕯️</span>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">{c.name}</span>
                                <span className="text-[10px] text-pink-300/70 truncate block">{c.species}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono text-amber-300 bg-white/5 px-2 py-0.5 rounded-md">
                                {c.timeAgo}
                              </span>
                              <button
                                onClick={() => activatePet(c)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isCurrentActive
                                    ? 'bg-amber-400 text-stone-950 border-amber-300'
                                    : 'bg-white/10 text-pink-200 border-white/15 hover:bg-white/20'
                                }`}
                                title="Mostrar esta mascota en el pedestal"
                              >
                                {isCurrentActive ? '★ En Altar' : 'Poner en Altar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 4: AJUSTES, ENCUADRE Y ATAJOS */}
              <div
                className={`flex flex-col gap-4 ${
                  activeTab !== 'sync' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="bg-[#160B24] border border-[#F3D5E4]/25 rounded-3xl p-5 shadow-xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-200 flex items-center gap-2">
                    <span>⚡</span> Ajustes de Producción & Atajos de Teclado
                  </span>

                  {/* Controles de Guía de Zona Segura */}
                  <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-200 block">
                          📐 Guía de Zona Segura TikTok
                        </span>
                        <span className="text-[11px] text-pink-200/70">
                          Visible únicamente en este monitor (nunca en la salida LIVE)
                        </span>
                      </div>
                      <button
                        onClick={() => setShowSafeZone((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          showSafeZone
                            ? 'bg-amber-400 text-stone-950 border-amber-300 font-black'
                            : 'bg-white/10 text-pink-200 border-white/15'
                        }`}
                      >
                        {showSafeZone ? 'Ocultar Guía (Z)' : 'Mostrar Guía (Z)'}
                      </button>
                    </div>

                    {showSafeZone && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <span className="text-pink-300">Opacidad de la guía:</span>
                        <input
                          type="range"
                          min={0.2}
                          max={1}
                          step={0.05}
                          value={safeZoneOpacity}
                          onChange={(e) => setSafeZoneOpacity(Number(e.target.value))}
                          className="w-32 accent-amber-400 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tabla de atajos de teclado */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-pink-300">Atajos rápidos disponibles:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Cielo de Luces</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">1</kbd>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Visor Ghibli</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">2</kbd>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Luz del Refugio</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">3</kbd>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Siguiente carta</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">▶ o Espacio</kbd>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Carta anterior</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">◀</kbd>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-pink-200">Encender vela</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300 font-bold">N</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================== */}
            {/* RIGHT COLUMN: LIVE 9:16 PREVIEW MONITOR                */}
            {/* ====================================================== */}
            <aside
              aria-label="Previsualización de la emisión en directo"
              className={`lg:col-span-5 flex flex-col items-center ${
                activeTab !== 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="sticky top-20 w-full flex flex-col items-center gap-3">
                <div className="w-full flex items-center justify-between px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-2">
                    <span>📺</span> Previsualización 9:16 en Vivo
                  </span>
                  <button
                    onClick={() => setShowSafeZone((prev) => !prev)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      showSafeZone
                        ? 'bg-amber-400 text-stone-950 border-amber-300'
                        : 'bg-white/10 text-pink-200 border-white/15'
                    }`}
                    title="Conmutar Guía TikTok en el monitor"
                  >
                    {showSafeZone ? '📐 Guía ON' : '📐 Guía OFF'}
                  </button>
                </div>

                {/* MARCO DE PREVISUALIZACIÓN DEL LIENZO */}
                <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-[#F3D5E4]/30 shadow-2xl bg-black">
                  <LiveCanvas
                    state={state}
                    showSafeZone={showSafeZone}
                    safeZoneOpacity={safeZoneOpacity}
                  />
                </div>

                <div className="w-full max-w-[360px] flex items-center justify-between text-[11px] text-pink-200/70 px-1">
                  <span>Resolución OBS: 1080 × 1920</span>
                  <Link
                    href="/live-tiktok/output"
                    target="_blank"
                    className="text-amber-300 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Probar Salida Completa</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            </aside>

          </div>

          {/* MODAL ACCESIBLE PARA ENCENDER VELA */}
          <AddCandleModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAddCandle={addCandle}
            triggerElementRef={addCandleBtnRef}
          />
        </>
      )}
    </div>
  );
}
