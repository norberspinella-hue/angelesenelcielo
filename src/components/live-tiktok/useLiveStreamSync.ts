'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LiveStreamState,
  DEFAULT_LIVE_STATE,
  PRELOADED_LETTERS,
  LiveCandle,
} from './types';

const STORAGE_KEY = 'angeles_live_tiktok_state_v3';
const AUTH_TOKEN_KEY = 'angeles_live_tiktok_auth_token_v3';
const BROADCAST_CHANNEL_NAME = 'angeles_live_tiktok_sync_v3';
const SUPABASE_CHANNEL_NAME = 'live_tiktok_realtime_stream_v3';

// Cache en memoria de tokens validados en el servidor para evitar llamadas repetidas
const verifiedTokensCache = new Set<string>();
const rejectedTokensCache = new Set<string>();

async function verifyTokenWithServer(token: string): Promise<boolean> {
  if (!token) return false;
  if (verifiedTokensCache.has(token)) return true;
  if (rejectedTokensCache.has(token)) return false;

  try {
    const res = await fetch(`/api/live-tiktok/auth?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (res.ok && data.valid === true) {
      verifiedTokensCache.add(token);
      return true;
    }
    rejectedTokensCache.add(token);
    return false;
  } catch (e) {
    console.warn('Error verificando token con servidor:', e);
    return false;
  }
}

export interface UseLiveStreamSyncOptions {
  isController?: boolean;
}

export function useLiveStreamSync({ isController = false }: UseLiveStreamSyncOptions = {}) {
  const [state, setState] = useState<LiveStreamState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_LIVE_STATE,
            ...parsed,
          };
        }
      } catch (err) {
        console.warn('Error leyendo estado live de localStorage', err);
      }
    }
    return DEFAULT_LIVE_STATE;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && isController) {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    }
    return null;
  });

  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'local'>('connecting');
  const [activeOutputsCount, setActiveOutputsCount] = useState<number>(0);

  const stateRef = useRef<LiveStreamState>(state);
  stateRef.current = state;

  const authTokenRef = useRef<string | null>(authToken);
  authTokenRef.current = authToken;

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  // Consulta real y dinámica a Supabase y al Altar para obtener contadores verificables
  useEffect(() => {
    let isMounted = true;
    async function fetchRealCounters() {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from('mural_slots')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'occupied');

        let activeWebCandles = 18;
        try {
          const res = await fetch('/api/community/candles');
          if (res.ok) {
            const data = await res.json();
            if (typeof data.stats?.active_candles_count === 'number') {
              activeWebCandles = data.stats.active_candles_count;
            }
          }
        } catch {
          activeWebCandles = 18;
        }

        if (isMounted) {
          setState((prev) => ({
            ...prev,
            muralStarsCount: !error && typeof count === 'number' ? count : (prev.muralStarsCount || 151),
            webCandlesCount: activeWebCandles,
          }));
        }
      } catch (e) {
        console.warn('No se pudo consultar contadores en vivo:', e);
      }
    }
    fetchRealCounters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper para persistir estado localmente
  const persistState = useCallback((newState: LiveStreamState) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.warn('No se pudo persistir el estado live', err);
    }
  }, []);

  // Autenticación con PIN en el servidor
  const loginWithPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/live-tiktok/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        verifiedTokensCache.add(data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'PIN incorrecto' };
    } catch (e: any) {
      return { success: false, error: 'Error de conexión con el servidor de autenticación' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, []);

  // Emisión de cambios por todos los canales
  const broadcastStateChange = useCallback((newState: LiveStreamState) => {
    const currentToken = authTokenRef.current;

    // 1. BroadcastChannel (mismo navegador / OBS local)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'STATE_UPDATE',
          payload: newState,
          authToken: currentToken,
          source: 'local',
        });
      } catch (e) {
        console.error('BroadcastChannel error', e);
      }
    }

    // 2. Supabase Realtime (remoto multi-dispositivo)
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'state_update',
          payload: {
            state: newState,
            authToken: currentToken,
          },
        });
      } catch (e) {
        // silent catch
      }
    }

    // 3. Persistencia local
    persistState(newState);
  }, [persistState]);

  // Actualización de estado autorizada
  const updateState = useCallback(
    (updater: Partial<LiveStreamState> | ((prev: LiveStreamState) => Partial<LiveStreamState>)) => {
      if (isController && !authTokenRef.current) {
        console.warn('Acción bloqueada: Presentador no autenticado con PIN.');
        return;
      }

      setState((prev) => {
        const patch = typeof updater === 'function' ? updater(prev) : updater;
        const next: LiveStreamState = {
          ...prev,
          ...patch,
          lastUpdated: Date.now(),
        };
        broadcastStateChange(next);
        return next;
      });
    },
    [isController, broadcastStateChange]
  );

  // Agregar vela de sesión (muralStarsCount NO se modifica)
  const addCandle = useCallback(
    (name: string, speciesLabel: string, dedication?: string) => {
      if (isController && !authTokenRef.current) {
        console.warn('Acción bloqueada: Presentador no autenticado.');
        return;
      }

      const trimmed = name.trim();
      if (!trimmed) return;

      const cleanDedication = dedication?.trim() || 'Tu luz seguirá brillando\nen nuestros corazones';
      const formattedSpecies = speciesLabel.startsWith('🐾') || speciesLabel.startsWith('✨') ? speciesLabel : `🐾 ${speciesLabel}`;

      const newCandle: LiveCandle = {
        id: `live-${Date.now()}`,
        name: trimmed,
        species: formattedSpecies,
        timeAgo: 'ahora mismo',
        isNew: true,
        isSessionCandle: true,
        dedication: cleanDedication,
      };

      updateState((prev) => ({
        candles: [newCandle, ...prev.candles],
        sessionCandlesCount: prev.sessionCandlesCount + 1, // Contador propio de sesión
        activePetName: trimmed,
        activePetSpecies: formattedSpecies,
        activePetDedication: cleanDedication,
        candleLitAt: Date.now(),
      }));
    },
    [isController, updateState]
  );

  // Seleccionar mascota para situarla en el pedestal sin incrementar el contador
  const activatePet = useCallback(
    (candle: LiveCandle) => {
      if (isController && !authTokenRef.current) {
        console.warn('Acción bloqueada: Presentador no autenticado.');
        return;
      }
      updateState({
        activePetName: candle.name,
        activePetSpecies: candle.species,
        activePetDedication: candle.dedication || 'Tu luz seguirá brillando\nen nuestros corazones',
        candleLitAt: Date.now(),
      });
    },
    [isController, updateState]
  );

  // Iniciar nueva emisión (resetea el contador de sesión a 0 y limpia el pedestal)
  const resetLiveSession = useCallback(() => {
    updateState({
      sessionCandlesCount: 0,
      activeScene: 1,
      currentLetterIndex: 0,
      activePetName: '',
      activePetSpecies: '',
      activePetDedication: '',
      candleLitAt: 0,
    });
  }, [updateState]);

  // Canales de Sincronización
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Web BroadcastChannel (Mismo equipo / OBS Browser Source)
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          const data = event.data;
          if (!data || !data.type) return;

          if (data.type === 'STATE_UPDATE' && data.payload) {
            setState((prev) => {
              if (data.payload.lastUpdated >= (prev.lastUpdated || 0)) {
                return {
                  ...data.payload,
                  muralStarsCount: prev.muralStarsCount, // Preservar contador de consulta real
                };
              }
              return prev;
            });
            setSyncStatus('synced');
          } else if (data.type === 'REQUEST_STATE' && isController) {
            if (bc) {
              bc.postMessage({
                type: 'STATE_UPDATE',
                payload: stateRef.current,
                authToken: authTokenRef.current,
              });
            }
            setActiveOutputsCount((c) => Math.max(c, 1));
          } else if (data.type === 'HEARTBEAT_PING') {
            if (isController) {
              setActiveOutputsCount((c) => Math.max(c, 1));
              if (bc) {
                bc.postMessage({ type: 'HEARTBEAT_ACK' });
              }
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    // 2. Storage Event (Persistencia / pestañas mismo perfil)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState((prev) => {
            if (parsed.lastUpdated >= (prev.lastUpdated || 0)) {
              return { ...parsed, muralStarsCount: prev.muralStarsCount };
            }
            return prev;
          });
          setSyncStatus('synced');
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Supabase Realtime Broadcast (Remoto multi-dispositivo)
    let supabaseSubscription: any = null;
    try {
      const supabase = createClient();
      const channel = supabase.channel(SUPABASE_CHANNEL_NAME, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'state_update' }, async ({ payload }: any) => {
          if (!payload) return;

          // SEGURIDAD CRIPTOGRÁFICA: Validar token firmado en el servidor
          const remoteToken = payload.authToken;
          if (!remoteToken) {
            console.warn('SEGURIDAD: Comando remoto descartado (no contiene token de emisión).');
            return;
          }

          const isValid = await verifyTokenWithServer(remoteToken);
          if (!isValid) {
            console.warn('SEGURIDAD: Comando remoto RECHAZADO (token no válido o falso).');
            return;
          }

          const remoteState = payload.state;
          if (remoteState && remoteState.lastUpdated) {
            setState((prev) => {
              if (remoteState.lastUpdated >= (prev.lastUpdated || 0)) {
                return {
                  ...remoteState,
                  muralStarsCount: prev.muralStarsCount, // Preservar contador de consulta real
                };
              }
              return prev;
            });
            setSyncStatus('synced');
          }
        })
        .on('broadcast', { event: 'request_state' }, () => {
          if (isController && authTokenRef.current) {
            channel.send({
              type: 'broadcast',
              event: 'state_update',
              payload: {
                state: stateRef.current,
                authToken: authTokenRef.current,
              },
            });
            setActiveOutputsCount((c) => Math.max(c, 1));
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setSyncStatus('synced');
            if (!isController) {
              channel.send({
                type: 'broadcast',
                event: 'request_state',
                payload: {},
              });
            }
          }
        });

      supabaseChannelRef.current = channel;
      supabaseSubscription = channel;
    } catch (e) {
      console.warn('Supabase Realtime error', e);
    }

    // Handshake
    if (!isController) {
      if (bc) {
        bc.postMessage({ type: 'REQUEST_STATE' });
        bc.postMessage({ type: 'HEARTBEAT_PING' });
      }
    } else {
      setSyncStatus('synced');
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      if (supabaseSubscription) {
        try {
          supabaseSubscription.unsubscribe();
        } catch (e) {}
      }
    };
  }, [isController]);

  // Autoplay de cartas
  useEffect(() => {
    if (!state.autoPlayLetters || state.activeScene !== 2) return;

    const intervalMs = (state.letterDuration || 14) * 1000;
    const interval = setInterval(() => {
      if (isController && authTokenRef.current) {
        updateState((prev) => ({
          currentLetterIndex: (prev.currentLetterIndex + 1) % PRELOADED_LETTERS.length,
        }));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state.autoPlayLetters, state.activeScene, state.letterDuration, isController, updateState]);

  return {
    state,
    updateState,
    addCandle,
    activatePet,
    resetLiveSession,
    syncStatus,
    activeOutputsCount,
    isAuthenticated: Boolean(authToken),
    loginWithPin,
    logout,
  };
}
