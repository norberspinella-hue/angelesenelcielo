// Lectura del comando del chat de TikTok LIVE
// Soporta: "!angel Luna 12", "!angel Luna 12 años", "!Ángel Toby 6 meses", "angel Dumbo y Snow", etc.

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;
const NON_NAME_CHARS_REGEX = new RegExp("[^\\p{L}\\p{N} '.\\-&]", 'gu');
const WORD_FIRST_LETTER_REGEX = new RegExp('(^|\\s)(\\p{L})', 'gu');

export function sanitizeLiveName(raw: string): string {
  return raw
    .replace(NON_NAME_CHARS_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
}

export function sanitizeLiveTime(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 20);
}

export function normalizeTikTokUsername(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^@+/, '').toLowerCase().slice(0, 60);
  return cleaned.length > 0 ? cleaned : null;
}

export function parsear(texto: string, comando: string): { nombre: string; tiempo: string } | null {
  if (!texto || !comando) return null;
  const t = texto.trim().replace(/\s+/g, ' ');
  const cmd = comando.trim().toLowerCase();
  if (!cmd) return null;

  const sinTildes = (s: string) => s.normalize('NFD').replace(COMBINING_MARKS_REGEX, '');
  const sinSigno = cmd.replace(/^!/, '');
  const variantes = Array.from(new Set([cmd, sinSigno, sinTildes(sinSigno)])).filter(Boolean);

  const low = sinTildes(t.toLowerCase());
  const usado = variantes.find((v) => low === v || low.startsWith(v + ' '));
  if (!usado) return null;

  let resto = t.slice(usado.length).trim();
  if (!resto) return null;

  let tiempo = '';
  const m = resto.match(/^(.*?)[\s,·\-]+(\d{1,2})\s*(años?|anos?|a|meses?|m)?\.?$/i);
  if (m && m[1].trim()) {
    resto = m[1].trim();
    const n = parseInt(m[2], 10);
    const u = (m[3] || 'años').toLowerCase();
    tiempo = u.startsWith('m')
      ? `${n} ${n === 1 ? 'mes' : 'meses'}`
      : `${n} ${n === 1 ? 'año' : 'años'}`;
  }

  const nombre = sanitizeLiveName(resto);
  if (nombre.length < 2) return null;

  const bonito =
    nombre === nombre.toLowerCase()
      ? nombre.replace(WORD_FIRST_LETTER_REGEX, (_, a, b) => a + b.toUpperCase())
      : nombre;

  return { nombre: bonito, tiempo: sanitizeLiveTime(tiempo) };
}
