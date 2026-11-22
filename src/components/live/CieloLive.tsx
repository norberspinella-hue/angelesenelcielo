'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Lora, Inter } from 'next/font/google';
import { createClient } from '@/lib/supabase/client';
import type { LiveAjustesPublicos, LivePerrito } from '@/lib/live/types';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

const COLORES = [
  '#ffbe96', '#a0c8ff', '#beffd2', '#ffaabe', '#ffe196',
  '#d2b4ff', '#ffa0dc', '#96e6ff', '#ffcdaa', '#c8a0ff',
  '#aad7ff', '#f0f5ff', '#ffc88c', '#aaffc8', '#ffafaf',
];
const ORO = '#ffd678';
const ESCALA = [72, 74, 76, 79, 81, 84, 86, 88];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIO = (u: number) => u * u * u * (u * (6 * u - 15) + 10);

function hashStr(str: string): number {
  let h = 2166136261;
  for (const c of Array.from(String(str))) {
    h ^= c.codePointAt(0) || 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRnd(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s >>>= 0;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function hex2rgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = (c: [number, number, number], a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;

const corto = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function bez(a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] {
  const v = 1 - u;
  return [
    v * v * a[0] + 2 * v * u * c[0] + u * u * b[0],
    v * v * a[1] + 2 * v * u * c[1] + u * u * b[1],
  ];
}

function ctrl(a: [number, number], b: [number, number], k: number): [number, number] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return [mx - dy * k, my + dx * k];
}

export interface CieloLiveProps {
  /** Overrides URL ?fondo=0 */
  transparentBg?: boolean;
  /** Overrides URL ?sonido=0 */
  soundEnabled?: boolean;
  className?: string;
}

interface PolvoItem {
  x: number;
  y: number;
  b: number;
  v: number;
  f: number;
  p: number;
  big: boolean;
}

interface QuitadoItem {
  p: LivePerrito;
  t0: number;
}

const DEFAULT_AJUSTES: LiveAjustesPublicos = {
  id: 1,
  sesion_id: null,
  max_perritos: 40,
  por_usuario: 1,
  comando: '!angel',
  centro: 'Ángeles en el Cielo',
  ritmo: 'normal',
  instruccion: true,
  escena_output: 'video',
  updated_at: '',
};

export function CieloLive({
  transparentBg,
  soundEnabled,
  className = '',
}: CieloLiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  const ajustesRef = useRef<LiveAjustesPublicos>(DEFAULT_AJUSTES);
  const aprobadosRef = useRef<LivePerrito[]>([]);
  const prevMapRef = useRef<Map<string, LivePerrito>>(new Map());
  const quitandoRef = useRef<QuitadoItem[]>([]);
  const playedSoundsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef<boolean>(false);
  const serverOffsetMsRef = useRef<number>(0);
  const animTimeRef = useRef<number>(0);

  const configFlagsRef = useRef({
    fondo: true,
    sonido: true,
  });

  useEffect(() => {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    configFlagsRef.current = {
      fondo: transparentBg !== undefined ? !transparentBg : q?.get('fondo') !== '0',
      sonido: soundEnabled !== undefined ? soundEnabled : q?.get('sonido') !== '0',
    };
  }, [transparentBg, soundEnabled]);

  // 1. Sincronización de reloj + datos iniciales + Supabase Realtime (solo clave anon)
  useEffect(() => {
    let active = true;
    const supabase = createClient() as any;

    async function syncClock() {
      try {
        const tReq = Date.now();
        const res = await fetch('/api/live/hora', { cache: 'no-store' });
        if (res.ok) {
          const tResp = Date.now();
          const data = await res.json();
          if (typeof data.ahora === 'number') {
            const rttMid = (tReq + tResp) / 2;
            serverOffsetMsRef.current = data.ahora - rttMid;
          }
        }
      } catch {}
    }

    async function loadApprovedFromDb() {
      try {
        const { data: ajData } = await supabase
          .from('live_ajustes_publicos')
          .select('*')
          .eq('id', 1)
          .single();

        if (!active || !ajData) return;

        const prevSession = ajustesRef.current.sesion_id;
        ajustesRef.current = ajData as LiveAjustesPublicos;

        if (prevSession && prevSession !== ajData.sesion_id) {
          aprobadosRef.current = [];
          prevMapRef.current.clear();
          quitandoRef.current = [];
          playedSoundsRef.current.clear();
          initializedRef.current = false;
        }

        if (!ajData.sesion_id) {
          aprobadosRef.current = [];
          return;
        }

        const { data: perritosData } = await supabase
          .from('live_perritos')
          .select('*')
          .eq('sesion_id', ajData.sesion_id)
          .eq('estado', 'aprobado')
          .order('slot', { ascending: true });

        if (!active || !Array.isArray(perritosData)) return;

        const nextList = perritosData as LivePerrito[];
        const nextIds = new Set(nextList.map((p) => p.id));

        if (initializedRef.current) {
          // Cualquier estrella que desaparece (quitada o vaciar) se apaga suavemente en 1.5 s
          for (const [oldId, oldP] of Array.from(prevMapRef.current.entries())) {
            if (!nextIds.has(oldId)) {
              quitandoRef.current.push({ p: oldP, t0: animTimeRef.current });
            }
          }
        } else {
          // En la carga inicial, marcar como ya reproducidas las fases pasadas para no disparar sonidos viejos de golpe
          const ahora = Date.now() + serverOffsetMsRef.current;
          for (const p of nextList) {
            const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
            const durMs = p.duracion_ms || 15900;
            const f = durMs / 15900;
            const e = (ahora - subeMs) / 1000;
            if (subeMs && e > 0) {
              if (e > 2.6 * f * 0.6) playedSoundsRef.current.add(`${p.id}:a`);
              if (e > (2.6 + 4.6 + 1.8) * f) playedSoundsRef.current.add(`${p.id}:s`);
              if (e > (2.6 + 4.6 + 1.8 + 4.6) * f) playedSoundsRef.current.add(`${p.id}:l`);
            }
          }
          initializedRef.current = true;
        }

        const nextMap = new Map<string, LivePerrito>();
        for (const p of nextList) nextMap.set(p.id, p);
        prevMapRef.current = nextMap;
        aprobadosRef.current = nextList;
      } catch (err) {
        console.warn('Error cargando estado del Cielo:', err);
      }
    }

    syncClock().then(() => loadApprovedFromDb());

    let refetchTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefetch = () => {
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(() => {
        if (active) loadApprovedFromDb();
      }, 120);
    };

    const channel = supabase
      .channel('cielo_live_realtime_v1')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_perritos' }, scheduleRefetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_ajustes' }, scheduleRefetch)
      .subscribe();

    const safetyInterval = setInterval(() => {
      if (active) {
        syncClock();
        loadApprovedFromDb();
      }
    }, 30_000);

    return () => {
      active = false;
      if (refetchTimer) clearTimeout(refetchTimer);
      clearInterval(safetyInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Motor Canvas 2D nativo (fiel a public/overlay.html, sincronizado por horario del servidor)
  useEffect(() => {
    const cv = canvasRef.current;
    const hostEl = containerRef.current;
    if (!cv || !hostEl) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let K = 1;
    let DPR = 1;
    let fondoCanvas: HTMLCanvasElement | null = null;
    let polvo: PolvoItem[] = [];
    const sprites = new Map<string, HTMLCanvasElement>();
    let slotsCache: { n: number; w: number; h: number; pts: [number, number][] } = { n: 0, w: 0, h: 0, pts: [] };
    let ac: AudioContext | null = null;
    let nota = 0;
    let rafId = 0;
    let lastPerf = performance.now();

    const loraFamily = `${lora.style.fontFamily}, Georgia, serif`;
    const interFamily = `${inter.style.fontFamily}, "Segoe UI", Arial, sans-serif`;

    const colorDe = (p: LivePerrito) => hex2rgb(COLORES[hashStr(p.id + p.nombre) % COLORES.length]);
    const faseDe = (p: LivePerrito) => (hashStr(p.id) % 6283) / 1000;

    function glow(c: [number, number, number]) {
      const key = c.join(',');
      const cached = sprites.get(key);
      if (cached) return cached;
      const s = document.createElement('canvas');
      s.width = s.height = 128;
      const g = s.getContext('2d');
      if (g) {
        const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        rg.addColorStop(0, rgba(c, 1));
        rg.addColorStop(0.18, rgba(c, 0.55));
        rg.addColorStop(0.45, rgba(c, 0.14));
        rg.addColorStop(1, rgba(c, 0));
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
      }
      sprites.set(key, s);
      return s;
    }

    function halo(x: number, y: number, R: number, c: [number, number, number], a: number) {
      if (a <= 0.01 || !ctx) return;
      ctx.globalAlpha = clamp(a);
      ctx.drawImage(glow(c), x - R, y - R, 2 * R, 2 * R);
      ctx.globalAlpha = 1;
    }

    function estrella(x: number, y: number, c: [number, number, number], r: number, a: number) {
      if (a <= 0.01 || !ctx) return;
      const rk = r * K;
      halo(x, y, rk * 7, c, 0.55 * a);
      ctx.fillStyle = rgba(c, a);
      ctx.beginPath();
      ctx.arc(x, y, rk, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba([255, 255, 255], a);
      ctx.beginPath();
      ctx.arc(x, y, rk * 0.55, 0, Math.PI * 2);
      ctx.fill();
      const L = rk * 3.6;
      ctx.strokeStyle = rgba(c, 0.6 * a);
      ctx.lineWidth = Math.max(1, K);
      ctx.beginPath();
      ctx.moveTo(x - L, y);
      ctx.lineTo(x + L, y);
      ctx.moveTo(x, y - L);
      ctx.lineTo(x, y + L);
      ctx.stroke();
    }

    function estela(pts: [number, number][], c: [number, number, number], a0: number, a1: number, w = 3) {
      if (!ctx) return;
      ctx.lineCap = 'round';
      ctx.lineWidth = w * K;
      const n = pts.length;
      for (let i = 0; i < n - 1; i++) {
        const a = a0 + (a1 - a0) * (i / Math.max(1, n - 2));
        if (a <= 0.01) continue;
        ctx.strokeStyle = rgba(c, a);
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
        ctx.stroke();
      }
    }

    function cola(x: number, y: number, c: [number, number, number], t: number, ph: number, a: number, largo = 150) {
      if (a <= 0.01 || !ctx) return;
      const l = largo * K;
      const pts: [number, number][] = [];
      for (let i = 0; i < 26; i++) {
        const s = i / 25;
        pts.push([x + Math.sin(s * 4.2 - t * 2.6 + ph) * 13 * K * s, y + s * l]);
      }
      estela(pts, c, 0.85 * a, 0, 3);
      for (let k = 0; k < 4; k++) {
        const q = (t * 0.55 + k / 4 + ph) % 1;
        const sx = x + Math.sin(q * 5 + k * 2.1 + ph) * 16 * K * q;
        const sy = y + 20 * K + q * (l + 70 * K);
        ctx.fillStyle = rgba(c, 0.8 * a * Math.pow(1 - q, 1.5));
        ctx.beginPath();
        ctx.arc(sx, sy, (2.2 * (1 - q) + 0.6) * K, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function texto(s: string, x: number, y: number, font: string, color: string, a: number, sombra = true) {
      if (a <= 0.01 || !s || !ctx) return;
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      if (sombra) {
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8 * K;
      }
      ctx.fillStyle = color.replace('A', String(clamp(a)));
      ctx.fillText(s, x, y);
      ctx.shadowBlur = 0;
    }

    const SERIF = (k: number) => `italic 500 ${Math.round(k * K)}px ${loraFamily}`;
    const SANS = (k: number, w = 500) => `${w} ${Math.round(k * K)}px ${interFamily}`;

    function getAudio(): AudioContext | null {
      if (!configFlagsRef.current.sonido) return null;
      if (!ac) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          ac = new AudioCtx();
        } catch {
          return null;
        }
      }
      if (ac.state === 'suspended') {
        ac.resume().catch(() => {});
        setShowAudioPrompt(true);
      }
      return ac.state === 'running' ? ac : null;
    }

    const onPointerDown = () => {
      if (ac) ac.resume().catch(() => {});
      setShowAudioPrompt(false);
    };
    window.addEventListener('pointerdown', onPointerDown);

    function campana(midi: number, vol = 0.16, dur = 2.6, cuando = 0) {
      const a = getAudio();
      if (!a) return;
      const t0 = a.currentTime + cuando;
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      [[1, 1], [2.01, 0.3], [3, 0.12]].forEach(([m, v]) => {
        const o = a.createOscillator();
        const g = a.createGain();
        o.frequency.value = f * m;
        o.type = 'sine';
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol * v, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur / (m > 1 ? 2 : 1));
        o.connect(g).connect(a.destination);
        o.start(t0);
        o.stop(t0 + dur + 0.1);
      });
    }

    function subidaSound(dur: number) {
      const a = getAudio();
      if (!a) return;
      const t0 = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(262, t0);
      o.frequency.exponentialRampToValueAtTime(790, t0 + dur);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.035, t0 + dur * 0.5);
      g.gain.linearRampToValueAtTime(0, t0 + dur);
      o.connect(g).connect(a.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
    }

    function pintarFondo() {
      const c = document.createElement('canvas');
      c.width = W * DPR;
      c.height = H * DPR;
      const g = c.getContext('2d');
      if (!g) return;
      g.scale(DPR, DPR);
      const lg = g.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, '#05081a');
      lg.addColorStop(0.55, '#0b112e');
      lg.addColorStop(1, '#06091c');
      g.fillStyle = lg;
      g.fillRect(0, 0, W, H);

      const neb = (x: number, y: number, rx: number, ry: number, col: string) => {
        g.save();
        g.translate(x, y);
        g.scale(rx / ry, 1);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, ry);
        rg.addColorStop(0, col);
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(0, 0, ry, 0, Math.PI * 2);
        g.fill();
        g.restore();
      };
      neb(W * 0.3, H * 0.28, W * 0.6, H * 0.3, 'rgba(40,30,95,0.35)');
      neb(W * 0.75, H * 0.62, W * 0.55, H * 0.32, 'rgba(20,45,100,0.30)');
      const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.62);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.45)');
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
      fondoCanvas = c;
    }

    function crearPolvo() {
      const r = seededRnd(7);
      const n = Math.max(80, Math.round(260 * ((W * H) / (1080 * 1920))));
      polvo = Array.from({ length: n }, () => {
        const b = Math.pow(r(), 1.5) * 0.75 + 0.2;
        return {
          x: r() * W,
          y: r() * H,
          b,
          v: (14 + 60 * Math.pow(b, 0.7) + r() * 14) * K,
          f: 0.4 + r() * 1.2,
          p: r() * 6.28,
          big: r() < 0.18,
        };
      });
    }

    function slots(maxPerritos: number): [number, number][] {
      const n = Math.max(1, maxPerritos);
      if (slotsCache.n === n && slotsCache.w === W && slotsCache.h === H) return slotsCache.pts;
      const x0 = W * 0.07;
      const x1 = W * 0.93;
      const y0 = H * 0.07;
      const y1 = W > H ? H * 0.44 : H * 0.43;
      const aw = x1 - x0;
      const ah = y1 - y0;
      const cols = Math.max(1, Math.ceil(Math.sqrt((n * aw) / ah)));
      const rows = Math.ceil(n / cols);
      const cw = aw / cols;
      const ch = ah / rows;
      const r = seededRnd(9001 + n);
      const celdas: [number, number][] = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) celdas.push([i, j]);
      }
      for (let i = celdas.length - 1; i > 0; i--) {
        const k = Math.floor(r() * (i + 1));
        [celdas[i], celdas[k]] = [celdas[k], celdas[i]];
      }
      const cx = cols / 2;
      const cy = rows / 2;
      const primeros = celdas
        .slice()
        .sort(
          (a, b) =>
            Math.hypot(a[0] + 0.5 - cx, (a[1] + 0.5 - cy) * 1.4) + r() * 1.6 -
            (Math.hypot(b[0] + 0.5 - cx, (b[1] + 0.5 - cy) * 1.4) + r() * 1.6)
        );
      const pts: [number, number][] = primeros
        .slice(0, n)
        .map(([i, j]) => [
          x0 + (i + 0.5 + (r() - 0.5) * 0.45) * cw,
          y0 + (j + 0.5 + (r() - 0.5) * 0.45) * ch,
        ]);
      slotsCache = { n, w: W, h: H, pts };
      return pts;
    }

    function resize() {
      if (!cv || !hostEl) return;
      const rect = hostEl.getBoundingClientRect();
      const nw = Math.round(rect.width);
      const nh = Math.round(rect.height);
      if (nw < 2 || nh < 2) return;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = nw;
      H = nh;
      const baseK = Math.sqrt((W * H) / (1080 * 1920));
      K = W > H ? baseK * 0.78 : baseK;
      cv.width = W * DPR;
      cv.height = H * DPR;
      slotsCache = { n: 0, w: 0, h: 0, pts: [] };
      pintarFondo();
      crearPolvo();
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(hostEl);
    window.addEventListener('resize', resize);
    resize();

    function dibujar(nowPerf: number) {
      if (!ctx) return;
      const dt = Math.min(0.1, Math.max(0.001, (nowPerf - lastPerf) / 1000));
      lastPerf = nowPerf;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (configFlagsRef.current.fondo && fondoCanvas) {
        ctx.drawImage(fondoCanvas, 0, 0, W, H);
      }

      // Polvo de estrellas en movimiento descendente
      for (const s of polvo) {
        s.y += s.v * dt;
        if (s.y > H + 4) s.y = -4;
        const tw = s.b * (0.65 + 0.35 * Math.sin(t * s.f * 2 + s.p));
        ctx.fillStyle = `rgba(215,225,255,${tw})`;
        const z = (s.big ? 2 : 1.2) * K;
        ctx.fillRect(s.x, s.y, z, z);
        ctx.fillStyle = `rgba(215,225,255,${tw * 0.35})`;
        ctx.fillRect(s.x, s.y - 3 * z, z, 3 * z);
      }

      ctx.globalCompositeOperation = 'lighter';

      const ajustes = ajustesRef.current;
      const skySlots = slots(ajustes.max_perritos || 40);
      const posCielo = (p: LivePerrito): [number, number] => {
        const s = typeof p.slot === 'number' && p.slot >= 0 ? p.slot : 0;
        return skySlots[s % skySlots.length];
      };
      const isLandscape = W > H;
      const centroPos: [number, number] = [
        W / 2 + 10 * K * Math.sin(t * 0.31),
        H * (isLandscape ? 0.58 : 0.6) + 9 * K * Math.sin(t * 0.5),
      ];
      const escenarioPos = (p: LivePerrito): [number, number] => {
        const lado = hashStr(p.id) & 1 ? 1 : -1;
        return [W / 2 + lado * Math.min(W * 0.27, 330 * K), H * (isLandscape ? 0.58 : 0.6) - 70 * K];
      };

      const ahoraServer = Date.now() + serverOffsetMsRef.current;
      const aprobados = aprobadosRef.current;
      const etiquetas: Array<[string, number, number, [number, number, number], number, boolean?]> = [];
      let rotulo: { a: number; n: string; s: string; dorado: boolean; cambio?: number } | null = null;

      // Estelas persistentes de los recientemente asentados (< 9 s desde llegar al cielo)
      for (const p of aprobados) {
        const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
        if (!subeMs) continue;
        const durMs = p.duracion_ms || 15900;
        const f = durMs / 15900;
        const animTotalSec = 15.2 * f;
        const elapsedSinceSube = (ahoraServer - subeMs) / 1000;

        if (elapsedSinceSube >= animTotalSec && elapsedSinceSube < animTotalSec + 9) {
          const sinceArrival = elapsedSinceSube - animTotalSec;
          const k = 1 - clamp((sinceArrival - 1) / 7);
          const a = escenarioPos(p);
          const b = posCielo(p);
          const cCtrl = ctrl(a, b, hashStr(p.id) & 2 ? 0.2 : -0.2);
          const pts: [number, number][] = [];
          for (let i = 0; i <= 50; i++) pts.push(bez(a, cCtrl, b, i / 50));
          estela(pts, colorDe(p), 0.3 * k, 0.9 * k, 2.5);
        }
      }

      // Estrellas ya asentadas en el cielo
      for (const p of aprobados) {
        const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
        if (!subeMs) continue;
        const durMs = p.duracion_ms || 15900;
        const f = durMs / 15900;
        const animTotalSec = 15.2 * f;
        const elapsedSinceSube = (ahoraServer - subeMs) / 1000;

        if (elapsedSinceSube >= animTotalSec) {
          const [bx, by] = posCielo(p);
          const ph = faseDe(p);
          const c = colorDe(p);
          const x = bx + 3 * K * Math.sin(t * 0.4 + ph);
          const y = by + 4 * K * Math.sin(t * 0.55 + ph);
          const tl = elapsedSinceSube - animTotalSec;
          const burst = Math.sin(Math.PI * clamp((tl + 0.3) / 1.8));
          if (burst > 0.01) halo(x, y, (40 + 60 * burst) * K, c, 0.35 * burst);
          estrella(x, y, c, 6 + 4 * burst, 0.8 + 0.2 * Math.sin(t * 2 + ph) + 0.4 * burst);
          etiquetas.push([corto(p.nombre, 14), x, y - 20 * K, c, clamp(tl / 1.5)]);
        }
      }

      // Fundido de 1.5 s para estrellas quitadas
      quitandoRef.current = quitandoRef.current.filter((q) => t - q.t0 < 1.5);
      for (const q of quitandoRef.current) {
        const [x, y] = posCielo(q.p);
        estrella(x, y, colorDe(q.p), 6, 1 - (t - q.t0) / 1.5);
      }

      // Estrella central dorada
      const [cx, cy] = centroPos;
      const pulso = 1 + 0.12 * Math.sin(t * 1.7);
      cola(cx, cy, hex2rgb(ORO), t, 1, 1, 230);
      halo(cx, cy, 70 * K, hex2rgb(ORO), 0.35);
      estrella(cx, cy, hex2rgb(ORO), 11 * pulso, 1);

      // Perrito actualmente en escena según reloj de servidor (sube_at <= ahora < sube_at + 15.2*f)
      for (const p of aprobados) {
        const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
        if (!subeMs) continue;
        const durMs = p.duracion_ms || 15900;
        const f = durMs / 15900;
        const T = {
          llega: 2.6 * f,
          presenta: 4.6 * f,
          brilla: 1.8 * f,
          sube: 4.6 * f,
          asienta: 1.6 * f,
          total: 15.2 * f,
        };
        const e = (ahoraServer - subeMs) / 1000;
        if (e < 0 || e >= T.total) continue;

        const c = colorDe(p);
        const ph = faseDe(p);
        const home = escenarioPos(p);
        const izq = home[0] < W / 2;
        const ini: [number, number] = [izq ? -80 * K : W + 80 * K, home[1] + 380 * K];
        const cIn = ctrl(ini, home, izq ? 0.28 : -0.28);
        const sky = posCielo(p);
        const cUp = ctrl(home, sky, hashStr(p.id) & 2 ? 0.2 : -0.2);
        const bob: [number, number] = [
          11 * K * Math.sin(t * 0.37 + ph),
          13 * K * Math.sin(t * 0.52 + ph * 1.7),
        ];
        const sub = [
          p.tiempo ? `${p.tiempo} de amor` : '',
          p.tiktok_usuario ? `de @${p.tiktok_usuario}` : '',
        ]
          .filter(Boolean)
          .join('  ·  ');

        const t1 = T.llega;
        const t2 = t1 + T.presenta;
        const t3 = t2 + T.brilla;
        const t4 = t3 + T.sube;

        if (!playedSoundsRef.current.has(`${p.id}:a`) && e > t1 * 0.6) {
          playedSoundsRef.current.add(`${p.id}:a`);
          campana(ESCALA[nota++ % ESCALA.length], 0.15);
        }

        if (e < t1) {
          const u = easeOut(e / t1);
          const pts: [number, number][] = [];
          for (let i = 0; i <= 26; i++) {
            const uStart = Math.max(0, u - 0.45);
            pts.push(bez(ini, cIn, home, uStart + ((u - uStart) * i) / 26));
          }
          estela(pts, c, 0, 0.9);
          const q = pts[pts.length - 1];
          estrella(q[0], q[1], c, 7, 1);
          etiquetas.push([p.nombre, q[0], q[1] - 30 * K, c, clamp((e - t1 * 0.5) / (t1 * 0.5)), true]);
          rotulo = { a: clamp(e / 0.8), n: p.nombre, s: sub, dorado: false };
        } else if (e < t3) {
          const g = clamp((e - t1) / 2);
          const x = home[0] + bob[0] * g;
          const y = home[1] + bob[1] * g;
          const fl = e > t2 ? easeIO(clamp((e - t2) / T.brilla)) : 0;
          cola(x, y, c, t, ph, clamp((e - t1) / 1.5) * (1 - fl));
          if (fl > 0.01) halo(x, y, (40 + 110 * fl) * K, c, 0.3 * fl);
          estrella(x, y, c, 7 + 6 * fl, 0.9 + 0.1 * Math.sin(t * 2.3 + ph) + fl);
          etiquetas.push([p.nombre, x, y - 30 * K, c, 1, true]);
          rotulo =
            e < t2
              ? { a: 1, n: p.nombre, s: sub, dorado: false }
              : {
                  a: 1,
                  n: p.nombre,
                  s: 'sube al cielo de los perritos',
                  dorado: true,
                  cambio: clamp((e - t2) / 0.8),
                };
        } else {
          if (!playedSoundsRef.current.has(`${p.id}:s`) && e >= t3) {
            playedSoundsRef.current.add(`${p.id}:s`);
            subidaSound(T.sube);
            campana(69, 0.08, 3);
          }
          const u = easeIO(clamp((e - t3) / T.sube));
          const pts: [number, number][] = [];
          const nPts = Math.max(2, Math.round(70 * u) + 2);
          for (let i = 0; i < nPts; i++) pts.push(bez(home, cUp, sky, (u * i) / (nPts - 1)));
          estela(pts, c, 0.35, 1, 3);
          const q = pts[pts.length - 1];
          estrella(q[0], q[1], c, 9 + 3 * (1 - u), 1.4);
          if (e > t4 && !playedSoundsRef.current.has(`${p.id}:l`)) {
            playedSoundsRef.current.add(`${p.id}:l`);
            campana(88, 0.12, 3.2);
            campana(84, 0.09, 3.2, 0.25);
            campana(79, 0.07, 3.2, 0.5);
          }
          rotulo = {
            a: clamp((T.total - e) / 1.2),
            n: p.nombre,
            s: 'se fue al cielo de los perritos',
            dorado: true,
          };
        }
        break; // De uno en uno en escena
      }

      ctx.globalCompositeOperation = 'source-over';

      // Etiquetas de nombres (exclusivamente fillText en canvas)
      for (const [s, x, y, c, a, grande] of etiquetas) {
        const col = `rgba(${Math.round(c[0] * 0.5 + 127)},${Math.round(c[1] * 0.5 + 127)},${Math.round(c[2] * 0.5 + 127)},A)`;
        texto(s, x, y, grande ? SANS(30) : SANS(21), grande ? 'rgba(240,242,252,A)' : col, a * (grande ? 1 : 0.9));
      }
      if (ajustes.centro) {
        texto(ajustes.centro, cx, cy - 46 * K, SANS(34, 600), 'rgba(255,232,180,A)', 1);
      }

      // Rótulo principal grande
      const yR = H * (isLandscape ? 0.74 : 0.785);
      if (rotulo) {
        texto(rotulo.n, W / 2, yR, SERIF(66), 'rgba(255,255,255,A)', rotulo.a);
        texto(
          rotulo.s,
          W / 2,
          yR + 62 * K,
          SERIF(40),
          rotulo.dorado ? 'rgba(255,226,170,A)' : 'rgba(190,205,240,A)',
          rotulo.a * (rotulo.cambio ?? 1)
        );
      }

      // Instrucción y contador inferior
      if (ajustes.instruccion) {
        const yI = H * (isLandscape ? 0.905 : 0.925);
        texto(`Escribe  ${ajustes.comando} y su nombre  para subirlo al cielo`, W / 2, yI, SANS(28), 'rgba(225,230,250,A)', 0.82);
        const ocupados = aprobados.length;
        const max = ajustes.max_perritos || 40;
        const lleno = ocupados >= max;
        texto(
          lleno ? `El cielo está completo · ${ocupados} estrellas` : `${ocupados} / ${max} estrellas`,
          W / 2,
          yI + 42 * K,
          SANS(22),
          lleno ? 'rgba(255,214,140,A)' : 'rgba(170,180,215,A)',
          0.75
        );
      }
    }

    function frame(nowPerf: number) {
      rafId = requestAnimationFrame(frame);
      if (hostEl) {
        const rect = hostEl.getBoundingClientRect();
        if (Math.round(rect.width) !== W || Math.round(rect.height) !== H) {
          resize();
        }
      }
      if (W < 2 || H < 2) return;
      try {
        dibujar(nowPerf);
      } catch (e) {
        console.error('Error en ciclo Canvas CieloLive:', e);
      }
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown);
      if (ac) ac.close().catch(() => {});
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${inter.className} ${className}`}
      style={{ background: 'transparent' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {showAudioPrompt && (
        <div
          className="fixed left-1/2 bottom-3 -translate-x-1/2 px-3 py-1.5 rounded-full text-[13px] text-[#cfd6ff] bg-[rgba(10,14,40,0.7)] pointer-events-none"
        >
          Toca la pantalla para activar el sonido
        </div>
      )}
    </div>
  );
}
