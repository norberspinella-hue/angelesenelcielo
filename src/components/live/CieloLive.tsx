'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LiveAjustesPublicos, LivePerrito } from '@/lib/live/types';

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
  /** Muestra el aviso táctil cuando el navegador bloquea el audio (desactivado por defecto en emisión) */
  showAudioHint?: boolean;
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
  showAudioHint = false,
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
    audioHint: false,
  });

  useEffect(() => {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    configFlagsRef.current = {
      fondo: transparentBg !== undefined ? !transparentBg : q?.get('fondo') !== '0',
      sonido: soundEnabled !== undefined ? soundEnabled : q?.get('sonido') !== '0',
      audioHint: showAudioHint || q?.get('avisoAudio') === '1',
    };
    if (!configFlagsRef.current.audioHint) setShowAudioPrompt(false);
  }, [transparentBg, soundEnabled, showAudioHint]);

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

    const loraFamily = 'Lora, Georgia, serif';
    const interFamily = 'Inter, "Segoe UI", Arial, sans-serif';

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

    function estrella(x: number, y: number, c: [number, number, number], r: number, a: number, rot = 0) {
      if (a <= 0.01 || !ctx) return;
      const rk = r * K;
      halo(x, y, rk * 7.5, c, 0.6 * a);
      ctx.fillStyle = rgba(c, a);
      ctx.beginPath();
      ctx.arc(x, y, rk, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba([255, 255, 255], a);
      ctx.beginPath();
      ctx.arc(x, y, rk * 0.55, 0, Math.PI * 2);
      ctx.fill();
      const L = rk * 4.4;
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.strokeStyle = rgba(c, 0.72 * a);
      ctx.lineWidth = Math.max(1.2, 1.35 * K);
      ctx.beginPath();
      ctx.moveTo(-L, 0);
      ctx.lineTo(L, 0);
      ctx.moveTo(0, -L);
      ctx.lineTo(0, L);
      ctx.stroke();
      ctx.restore();
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
        ctx.shadowColor = 'rgba(0,0,0,0.82)';
        ctx.shadowBlur = 12 * K;
      }
      ctx.fillStyle = color.replace('A', String(clamp(a)));
      ctx.fillText(s, x, y);
      ctx.shadowBlur = 0;
    }

    function roundBox(x: number, y: number, w: number, h: number, r: number) {
      if (!ctx) return;
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    const SERIF = (k: number) => `italic 600 ${Math.round(k * K)}px ${loraFamily}`;
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
        if (configFlagsRef.current.audioHint) {
          setShowAudioPrompt(true);
        }
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
      const n = Math.max(110, Math.round(300 * ((W * H) / (1080 * 1920))));
      polvo = Array.from({ length: n }, () => {
        const b = Math.pow(r(), 1.35) * 0.78 + 0.25;
        return {
          x: r() * W,
          y: r() * H,
          b,
          v: (20 + 68 * Math.pow(b, 0.7) + r() * 18) * K,
          f: 0.5 + r() * 1.4,
          p: r() * 6.28,
          big: r() < 0.24,
        };
      });
    }

    function slots(maxPerritos: number): [number, number][] {
      const n = Math.max(1, maxPerritos);
      if (slotsCache.n === n && slotsCache.w === W && slotsCache.h === H) return slotsCache.pts;
      const landscape = W > H;
      const x0 = W * (landscape ? 0.07 : 0.10);
      const x1 = W * (landscape ? 0.93 : 0.90);
      const y0 = H * (landscape ? 0.08 : 0.145);
      const y1 = H * (landscape ? 0.44 : 0.355);
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

      const isLandscape = W > H;
      ctx.globalCompositeOperation = 'lighter';

      // Auroras y nebulosas suaves en movimiento continuo (visibles incluso tras la zona del chat)
      if (configFlagsRef.current.fondo) {
        const aurora = (
          bx: number,
          by: number,
          dx: number,
          dy: number,
          spd: number,
          ph: number,
          rx: number,
          ry: number,
          col: [number, number, number],
          alpha: number
        ) => {
          const ax = bx + Math.sin(t * spd + ph) * dx;
          const ay = by + Math.cos(t * spd * 0.78 + ph) * dy;
          const breath = 0.85 + 0.15 * Math.sin(t * spd * 1.4 + ph);
          ctx.save();
          ctx.translate(ax, ay);
          ctx.scale(1, ry / Math.max(1, rx));
          ctx.globalAlpha = clamp(alpha * breath);
          ctx.drawImage(glow(col), -rx, -rx, rx * 2, rx * 2);
          ctx.globalAlpha = 1;
          ctx.restore();
        };
        aurora(W * 0.28, H * 0.24, 65 * K, 38 * K, 0.24, 0.2, W * 0.56, H * 0.26, [82, 62, 195], 0.22);
        aurora(W * 0.74, H * 0.40, 75 * K, 42 * K, 0.19, 1.8, W * 0.52, H * 0.24, [38, 126, 215], 0.20);
        aurora(W * 0.50, H * (isLandscape ? 0.58 : 0.52), 55 * K, 30 * K, 0.28, 3.4, W * 0.58, H * 0.22, [175, 118, 72], 0.13);
        if (!isLandscape) {
          aurora(W * 0.36, H * 0.78, 80 * K, 45 * K, 0.22, 4.9, W * 0.62, H * 0.25, [72, 56, 175], 0.22);
          aurora(W * 0.70, H * 0.88, 60 * K, 35 * K, 0.26, 2.5, W * 0.50, H * 0.20, [32, 110, 178], 0.18);
        }
      }

      // Polvo de estrellas con deriva suave horizontal y descendente
      ctx.globalCompositeOperation = 'source-over';
      for (const s of polvo) {
        s.y += s.v * dt;
        if (s.y > H + 6) s.y = -6;
        const sx = (s.x + Math.sin(t * 0.55 + s.p) * 18 * K + W) % W;
        const tw = s.b * (0.68 + 0.32 * Math.sin(t * s.f * 2.2 + s.p));
        ctx.fillStyle = `rgba(222,232,255,${tw})`;
        const z = (s.big ? 3.2 : 1.7) * K;
        ctx.fillRect(sx, s.y, z, z);
        ctx.fillStyle = `rgba(215,228,255,${tw * 0.42})`;
        ctx.fillRect(sx, s.y - 4 * z, z, 4 * z);
      }

      ctx.globalCompositeOperation = 'lighter';

      // Estrellas fugaces periódicas cada ~5,5 s en la zona visible
      const meteorPeriod = 5.5;
      const meteorIdx = Math.floor(t / meteorPeriod);
      const meteorLocal = t % meteorPeriod;
      if (meteorLocal < 1.35) {
        const mr = seededRnd(4100 + meteorIdx);
        const dir = mr() < 0.5 ? 1 : -1;
        const xStart = dir > 0 ? W * (0.08 + mr() * 0.25) : W * (0.67 + mr() * 0.25);
        const xEnd = xStart + dir * W * (0.34 + mr() * 0.22);
        const yStart = H * ((isLandscape ? 0.08 : 0.14) + mr() * 0.14);
        const yEnd = yStart + H * (0.07 + mr() * 0.08);
        const mu = easeOut(meteorLocal / 1.35);
        const fade = Math.sin(Math.PI * clamp(meteorLocal / 1.35));
        const mCtrl: [number, number] = [(xStart + xEnd) / 2, (yStart + yEnd) / 2 - 28 * K];
        const mPts: [number, number][] = [];
        const tailStart = Math.max(0, mu - 0.32);
        for (let i = 0; i <= 18; i++) {
          mPts.push(bez([xStart, yStart], mCtrl, [xEnd, yEnd], tailStart + ((mu - tailStart) * i) / 18));
        }
        estela(mPts, [210, 232, 255], 0, 0.85 * fade, 2.8);
        const mHead = mPts[mPts.length - 1];
        estrella(mHead[0], mHead[1], [255, 244, 210], 5.5, fade, 0.25);
      }

      const ajustes = ajustesRef.current;
      const skySlots = slots(ajustes.max_perritos || 40);
      const posCielo = (p: LivePerrito): [number, number] => {
        const s = typeof p.slot === 'number' && p.slot >= 0 ? p.slot : 0;
        return skySlots[s % skySlots.length];
      };
      const centroPos: [number, number] = [
        W / 2 + (isLandscape ? 24 : 34) * K * Math.sin(t * 0.42),
        H * (isLandscape ? 0.58 : 0.415) + (isLandscape ? 14 : 18) * K * Math.sin(t * 0.63),
      ];
      const escenarioPos = (p: LivePerrito): [number, number] => {
        const lado = hashStr(p.id) & 1 ? 1 : -1;
        return [
          W / 2 + lado * Math.min(W * 0.27, 300 * K),
          H * (isLandscape ? 0.58 : 0.435) - (isLandscape ? 70 : 55) * K,
        ];
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
      const settledPets: LivePerrito[] = [];
      let hasActiveAscent = false;
      for (const p of aprobados) {
        const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
        if (!subeMs) continue;
        const durMs = p.duracion_ms || 15900;
        const f = durMs / 15900;
        const animTotalSec = 15.2 * f;
        const elapsedSinceSube = (ahoraServer - subeMs) / 1000;
        if (elapsedSinceSube >= 0 && elapsedSinceSube < animTotalSec) {
          hasActiveAscent = true;
        }
        if (elapsedSinceSube >= animTotalSec) {
          settledPets.push(p);
        }
      }

      // En momentos de calma (sin subida activa), rotar cada 14 s un homenaje ya asentado
      const idleHighlightPet =
        !hasActiveAscent && settledPets.length > 0
          ? settledPets[Math.floor(ahoraServer / 14000) % settledPets.length]
          : null;
      const idlePhase = (ahoraServer % 14000) / 14000;
      const idleAlpha = idleHighlightPet ? clamp(idlePhase * 7) * clamp((1 - idlePhase) * 7) * 0.94 : 0;

      for (const p of settledPets) {
        const subeMs = p.sube_at ? new Date(p.sube_at).getTime() : 0;
        const durMs = p.duracion_ms || 15900;
        const animTotalSec = 15.2 * (durMs / 15900);
        const elapsedSinceSube = (ahoraServer - subeMs) / 1000;
        const [bx, by] = posCielo(p);
        const ph = faseDe(p);
        const c = colorDe(p);
        const x = bx + 5 * K * Math.sin(t * 0.5 + ph);
        const y = by + 6 * K * Math.sin(t * 0.65 + ph);
        const tl = elapsedSinceSube - animTotalSec;
        const burst = Math.sin(Math.PI * clamp((tl + 0.3) / 1.8));
        const isIdleSpotlight = idleHighlightPet?.id === p.id && idleAlpha > 0.05;
        if (burst > 0.01) halo(x, y, (44 + 65 * burst) * K, c, 0.38 * burst);
        if (isIdleSpotlight) {
          halo(x, y, (68 + 18 * Math.sin(t * 2.4)) * K, hex2rgb(ORO), 0.32 * idleAlpha);
        }
        const baseStarR = isLandscape ? 6 : 8.5;
        estrella(
          x,
          y,
          c,
          baseStarR + 4 * burst + (isIdleSpotlight ? 2.5 * idleAlpha : 0),
          0.84 + 0.16 * Math.sin(t * 2.2 + ph) + 0.35 * burst
        );
        etiquetas.push([corto(p.nombre, 14), x, y - (isLandscape ? 20 : 28) * K, c, clamp(tl / 1.5)]);
      }

      // Fundido de 1.5 s para estrellas quitadas
      quitandoRef.current = quitandoRef.current.filter((q) => t - q.t0 < 1.5);
      for (const q of quitandoRef.current) {
        const [x, y] = posCielo(q.p);
        estrella(x, y, colorDe(q.p), isLandscape ? 6 : 8, 1 - (t - q.t0) / 1.5);
      }

      // Estrella central dorada ("Ángeles en el Cielo") más viva y luminosa
      const [cx, cy] = centroPos;
      const pulso = 1 + 0.16 * Math.sin(t * 1.9);
      cola(cx, cy, hex2rgb(ORO), t * 1.25, 1, 1, isLandscape ? 235 : 255);
      halo(cx, cy, (isLandscape ? 78 : 98) * K, hex2rgb(ORO), 0.42);
      estrella(cx, cy, hex2rgb(ORO), (isLandscape ? 12 : 14.5) * pulso, 1, Math.sin(t * 0.25) * 0.08);
      estrella(cx, cy, [255, 232, 170], (isLandscape ? 7.5 : 9.5) * pulso, 0.72, Math.PI / 4 + t * 0.18);

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

      // Si no hay subida activa, mostrar el homenaje rotatorio en calma
      if (!rotulo && idleHighlightPet && idleAlpha > 0.01) {
        const idleSub = [
          idleHighlightPet.tiempo ? `${idleHighlightPet.tiempo} de amor` : 'Brilla en el cielo',
          idleHighlightPet.tiktok_usuario ? `de @${idleHighlightPet.tiktok_usuario}` : '',
        ]
          .filter(Boolean)
          .join('  ·  ');
        rotulo = {
          a: idleAlpha,
          n: idleHighlightPet.nombre,
          s: idleSub,
          dorado: true,
        };
      }

      ctx.globalCompositeOperation = 'source-over';

      // Etiquetas de nombres (exclusivamente fillText en canvas, ampliadas para móvil 9:16)
      for (const [s, x, y, c, a, grande] of etiquetas) {
        const col = `rgba(${Math.round(c[0] * 0.45 + 140)},${Math.round(c[1] * 0.45 + 140)},${Math.round(c[2] * 0.45 + 140)},A)`;
        const fnt = isLandscape
          ? (grande ? SANS(32, 600) : SANS(22, 600))
          : (grande ? SANS(42, 700) : SANS(33, 600));
        texto(s, x, y, fnt, grande ? 'rgba(246,248,255,A)' : col, a * (grande ? 1 : 0.96));
      }
      if (ajustes.centro) {
        texto(
          ajustes.centro,
          cx,
          cy - (isLandscape ? 50 : 62) * K,
          SANS(isLandscape ? 36 : 46, 700),
          'rgba(255,234,184,A)',
          1
        );
      }

      // Rótulo principal grande (en 9:16 se sitúa encima de la línea del chat de TikTok)
      const yR = H * (isLandscape ? 0.74 : 0.505);
      if (rotulo) {
        texto(rotulo.n, W / 2, yR, SERIF(isLandscape ? 66 : 78), 'rgba(255,255,255,A)', rotulo.a);
        texto(
          rotulo.s,
          W / 2,
          yR + (isLandscape ? 62 : 58) * K,
          SERIF(isLandscape ? 40 : 44),
          rotulo.dorado ? 'rgba(255,226,170,A)' : 'rgba(205,220,250,A)',
          rotulo.a * (rotulo.cambio ?? 1)
        );
      }

      // Instrucción y contador (en 9:16 centrados encima del límite ~63% del chat de TikTok)
      if (ajustes.instruccion) {
        const ocupados = aprobados.length;
        const max = ajustes.max_perritos || 40;
        const lleno = ocupados >= max;
        if (isLandscape) {
          const yI = H * 0.905;
          texto('Síguenos, escribe su nombre y su edad para subirlo al cielo', W / 2, yI, SANS(28, 600), 'rgba(232,238,255,A)', 0.9);
          texto(
            lleno ? `El cielo está completo · ${ocupados} estrellas` : `${ocupados} / ${max} estrellas`,
            W / 2,
            yI + 42 * K,
            SANS(22, 600),
            lleno ? 'rgba(255,214,140,A)' : 'rgba(185,196,230,A)',
            0.84
          );
        } else {
          const yI = H * 0.582;
          const boxW = W - 84 * K;
          const boxH = 104 * K;
          ctx.save();
          roundBox((W - boxW) / 2, yI - 38 * K, boxW, boxH, 22 * K);
          ctx.fillStyle = 'rgba(12, 18, 52, 0.54)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 228, 170, 0.28)';
          ctx.lineWidth = Math.max(1.5, 2 * K);
          ctx.stroke();
          ctx.restore();

          texto('Síguenos, escribe su nombre y su edad', W / 2, yI - 2 * K, SANS(33, 700), 'rgba(244,247,255,A)', 0.96);
          texto('para subirlo al cielo', W / 2, yI + 38 * K, SANS(33, 700), 'rgba(244,247,255,A)', 0.96);
          texto(
            lleno ? `El cielo está completo · ${ocupados} estrellas` : `${ocupados} / ${max} estrellas`,
            W / 2,
            yI + 94 * K,
            SANS(27, 600),
            lleno ? 'rgba(255,214,140,A)' : 'rgba(203,214,250,A)',
            0.9
          );
        }
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
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ background: 'transparent' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400;1,500&display=swap');
      `}</style>
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
