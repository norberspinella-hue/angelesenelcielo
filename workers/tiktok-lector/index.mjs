import 'dotenv/config';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';

const API_URL = (process.env.LIVE_API_URL || '').trim().replace(/\/+$/, '');
const INGEST_SECRET = (process.env.LIVE_INGEST_SECRET || '').trim();
const EULER_API_KEY = (process.env.EULER_API_KEY || '').trim();

if (!API_URL || !INGEST_SECRET) {
  console.error('❌ Faltan variables obligatorias en workers/tiktok-lector/.env: LIVE_API_URL y LIVE_INGEST_SECRET.');
  process.exit(1);
}

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;

function matchesCommandPrefix(texto, comando) {
  if (!texto || !comando) return false;
  const t = String(texto).trim().replace(/\s+/g, ' ');
  const cmd = String(comando).trim().toLowerCase();
  if (!cmd) return false;
  const sinTildes = (s) => s.normalize('NFD').replace(COMBINING_MARKS_REGEX, '');
  const sinSigno = cmd.replace(/^!/, '');
  const variantes = Array.from(new Set([cmd, sinSigno, sinTildes(sinSigno)])).filter(Boolean);
  const low = sinTildes(t.toLowerCase());
  return variantes.some((v) => low === v || low.startsWith(v + ' '));
}

async function apiFetch(pathname, options = {}) {
  const res = await fetch(`${API_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${INGEST_SECRET}`,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  return res;
}

let conn = null;
let wantActive = false;
let currentUser = '';
let currentComando = '!angel';
let currentState = 'desconectado'; // desconectado | conectando | conectado | error
let currentDetail = '';
let retryTimer = null;
let isConnecting = false;

function setStatus(estado, detalle = '') {
  currentState = estado;
  currentDetail = detalle;
  console.log(`[${new Date().toLocaleTimeString('es-ES')}] Estado lector: ${estado}${detalle ? ` — ${detalle}` : ''}`);
}

async function sendHeartbeat() {
  try {
    await apiFetch('/api/live/lector', {
      method: 'POST',
      body: JSON.stringify({
        estado: currentState,
        detalle: currentDetail,
      }),
    });
  } catch (err) {
    console.warn('⚠️ No se pudo enviar heartbeat:', err.message);
  }
}

async function disconnectTikTok(nextState = 'desconectado', nextDetail = '') {
  clearTimeout(retryTimer);
  retryTimer = null;
  if (conn) {
    try {
      await conn.disconnect();
    } catch {}
    conn = null;
  }
  isConnecting = false;
  setStatus(nextState, nextDetail);
}

function scheduleRetry(delayMs) {
  clearTimeout(retryTimer);
  if (!wantActive || !currentUser) return;
  retryTimer = setTimeout(() => {
    if (wantActive && currentUser) {
      connectTikTok(currentUser);
    }
  }, delayMs);
}

async function forwardChatMessage(payload) {
  try {
    const res = await apiFetch('/api/live/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.status === 201) {
      console.log(`✨ Enviado pendiente de @${payload.usuario}: ${payload.texto}`);
    }
  } catch (err) {
    console.warn('⚠️ Error reenviando mensaje a /api/live/ingest:', err.message);
  }
}

async function connectTikTok(username) {
  const cleanUser = username.trim().replace(/^@+/, '');
  if (!cleanUser) {
    setStatus('error', 'Falta @usuario de TikTok en el panel de control.');
    return;
  }
  if (isConnecting) return;

  isConnecting = true;
  clearTimeout(retryTimer);
  retryTimer = null;

  if (conn) {
    try {
      await conn.disconnect();
    } catch {}
    conn = null;
  }

  setStatus('conectando', `Conectando con @${cleanUser}...`);

  try {
    const opts = {};
    if (EULER_API_KEY) opts.signApiKey = EULER_API_KEY;
    const nextConn = new TikTokLiveConnection(cleanUser, opts);
    conn = nextConn;

    nextConn.on(WebcastEvent.CHAT, (d) => {
      const comment = d?.comment || '';
      if (!matchesCommandPrefix(comment, currentComando)) return;
      forwardChatMessage({
        usuario: d?.user?.uniqueId || 'anonimo',
        apodo: d?.user?.nickname || '',
        texto: comment,
      });
    });

    nextConn.on(ControlEvent.DISCONNECTED, () => {
      if (conn !== nextConn) return;
      conn = null;
      if (wantActive) {
        setStatus('conectando', 'Conexión perdida. Reintentando en 10 s...');
        scheduleRetry(10000);
      } else {
        setStatus('desconectado', '');
      }
    });

    nextConn.on(WebcastEvent.STREAM_END, () => {
      if (conn !== nextConn) return;
      conn = null;
      wantActive = false;
      setStatus('desconectado', 'El directo ha terminado.');
      sendHeartbeat();
    });

    const roomState = await nextConn.connect();
    isConnecting = false;
    setStatus('conectado', `Conectado a @${cleanUser} (sala ${roomState?.roomId || 'activa'})`);
    sendHeartbeat();
  } catch (err) {
    isConnecting = false;
    conn = null;
    const fullMsg = `${err?.name || ''} ${err?.message || err}`;
    const isOffline = /UserOfflineError|offline|not live|isn't online/i.test(fullMsg);
    if (isOffline) {
      setStatus('conectando', 'Esperando a que empiece el directo');
      scheduleRetry(15000);
    } else {
      setStatus('error', fullMsg.trim().slice(0, 180));
      scheduleRetry(10000);
    }
  }
}

async function pollControlSettings() {
  try {
    const res = await apiFetch('/api/live/lector', { method: 'GET' });
    if (!res.ok) {
      setStatus('error', `Error ${res.status} al consultar /api/live/lector`);
      return;
    }
    const cfg = await res.json();
    const nextUser = String(cfg.tiktokUsuario || '').trim().replace(/^@+/, '');
    const nextActive = Boolean(cfg.activo);
    currentComando = String(cfg.comando || '!angel').trim() || '!angel';

    const userChanged = nextUser !== currentUser;
    currentUser = nextUser;
    wantActive = nextActive;

    if (!wantActive) {
      if (conn || currentState !== 'desconectado') {
        await disconnectTikTok('desconectado', 'Apagado desde el panel');
      }
      return;
    }

    if (!currentUser) {
      await disconnectTikTok('error', 'Indica tu @usuario de TikTok en el panel');
      return;
    }

    if (userChanged && (conn || isConnecting)) {
      await disconnectTikTok('conectando', `Cambiando a @${currentUser}...`);
    }

    if (!conn && !isConnecting && !retryTimer) {
      connectTikTok(currentUser);
    }
  } catch (err) {
    console.warn('⚠️ Error consultando /api/live/lector:', err.message);
  }
}

console.log('=====================================================');
console.log('  ✨ Ángeles en el Cielo · Lector de Chat TikTok LIVE');
console.log('  Modo: SOLO LECTURA (sin sesión ni envío al chat)');
console.log(`  Web destino: ${API_URL}`);
console.log('=====================================================');

await pollControlSettings();
await sendHeartbeat();

setInterval(pollControlSettings, 10_000);
setInterval(sendHeartbeat, 10_000);
