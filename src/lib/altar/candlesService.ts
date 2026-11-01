import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { 
  AltarCandlePublic, 
  AltarCandlePrivateRecord, 
  CreateCandleInput, 
  AltarStats, 
  SpeciesType 
} from '@/types/altar';
import { createAdminClient } from '@/lib/supabase/server';

const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'altar_candles_local.json');

// Sal para anonimización irreversible de IP
const IP_SALT = process.env.ALTAR_IP_SALT || 'angeles-cielo-salt-2026';

function hashValue(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

export function hashIp(ip: string): string {
  return hashValue(`${ip}:${IP_SALT}`);
}

export function generateSecureTokens() {
  const manageToken = crypto.randomBytes(24).toString('hex');
  const unsubscribeToken = crypto.randomBytes(24).toString('hex');
  return {
    manageToken,
    manageTokenHash: hashValue(manageToken),
    unsubscribeToken,
    unsubscribeTokenHash: hashValue(unsubscribeToken),
  };
}

// Helpers para el almacén local aislado
function ensureLocalDir() {
  const dir = path.dirname(LOCAL_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLocalCandles(): AltarCandlePrivateRecord[] {
  try {
    ensureLocalDir();
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
    return JSON.parse(raw) as AltarCandlePrivateRecord[];
  } catch (err) {
    console.error('Error reading local candles store:', err);
    return [];
  }
}

function writeLocalCandles(candles: AltarCandlePrivateRecord[]): void {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(candles, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local candles store:', err);
  }
}

export function computePresentationFields(candle: AltarCandlePrivateRecord): AltarCandlePublic {
  const now = new Date().getTime();
  const expTime = new Date(candle.expires_at).getTime();
  const isLit = candle.status === 'active' && (candle.is_eternal || expTime > now);
  const diffDays = Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));

  return {
    id: candle.id,
    pet_name: candle.pet_name,
    species: candle.species,
    author_name: candle.author_name,
    dedication: candle.dedication,
    photo_url: candle.photo_url,
    is_from_mural: candle.is_from_mural,
    is_eternal: candle.is_eternal,
    warmth_count: candle.warmth_count,
    is_shelter_pet: candle.is_shelter_pet,
    shelter_name: candle.shelter_name,
    status: candle.status,
    created_at: candle.created_at,
    expires_at: candle.expires_at,
    reignited_at: candle.reignited_at,
    reignite_count: candle.reignite_count,
    memorial_id: candle.memorial_id,
    is_lit: isLit,
    days_remaining: candle.is_eternal ? 999 : diffDays,
  };
}

export class CandlesService {
  /**
   * Obtiene estadísticas agregadas oficiales sin descargar colecciones pesadas
   */
  static async getStats(): Promise<AltarStats> {
    let muralOccupied = 151;
    try {
      const supabase = createAdminClient();
      const { count } = await supabase
        .from('mural_slots')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'occupied');
      if (typeof count === 'number') muralOccupied = count;
    } catch {
      // Fallback seguro a última auditoría
      muralOccupied = 151;
    }

    const candles = readLocalCandles().filter(c => c.status === 'active');
    const now = new Date().getTime();
    const activeCandles = candles.filter(c => c.is_eternal || new Date(c.expires_at).getTime() > now).length;

    return {
      mural_occupied_slots: muralOccupied,
      active_candles_count: activeCandles,
      total_historical_candles: candles.length,
    };
  }

  /**
   * Listado público de velas con paginación, búsqueda y filtros
   */
  static async getPublicCandles(params: {
    filter?: 'todos' | 'vivas' | 'reavivar' | 'perro' | 'gato' | 'refugios';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ candles: AltarCandlePublic[]; total: number }> {
    const raw = readLocalCandles().filter(c => c.status === 'active');
    const now = new Date().getTime();

    let filtered = raw.map(computePresentationFields);

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.pet_name.toLowerCase().includes(q) ||
        c.author_name.toLowerCase().includes(q) ||
        c.dedication.toLowerCase().includes(q)
      );
    }

    if (params.filter) {
      if (params.filter === 'vivas') filtered = filtered.filter(c => c.is_lit);
      if (params.filter === 'reavivar') filtered = filtered.filter(c => !c.is_lit);
      if (params.filter === 'perro') filtered = filtered.filter(c => c.species === 'perro');
      if (params.filter === 'gato') filtered = filtered.filter(c => c.species === 'gato');
      if (params.filter === 'refugios') filtered = filtered.filter(c => c.is_shelter_pet);
    }

    // Ordenar: vivas primero, luego por fecha de creación descendente
    filtered.sort((a, b) => {
      if (a.is_lit !== b.is_lit) return a.is_lit ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return { candles: paginated, total };
  }

  /**
   * Creación protegida de una nueva vela comunitaria gratuita
   */
  static async createCandle(
    input: CreateCandleInput,
    ip: string
  ): Promise<{ candle: AltarCandlePublic; manageToken: string }> {
    // 1. Detección honeypot
    if (input.honeypot && input.honeypot.trim().length > 0) {
      throw new Error('Petición rechazada por control antispam.');
    }

    // 2. Validación de campos obligatorios
    const petName = input.pet_name?.trim();
    if (!petName || petName.length > 50) {
      throw new Error('El nombre de la mascota es obligatorio y no puede superar 50 caracteres.');
    }

    const dedication = input.dedication?.trim();
    if (!dedication || dedication.length > 300) {
      throw new Error('La dedicatoria es obligatoria y no puede superar 300 caracteres.');
    }

    const email = input.email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Debes indicar un correo electrónico válido para gestionar la vela.');
    }

    const species: SpeciesType = (['perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro'].includes(input.species)
      ? input.species
      : 'perro') as SpeciesType;

    const authorName = input.author_name?.trim() || 'Familia amorosa';

    // 3. Control de límites (Rate limit: máx 3 por hora por IP hash)
    const ipH = hashIp(ip || '127.0.0.1');
    const existing = readLocalCandles();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentByIp = existing.filter(c => c.ip_hash === ipH && new Date(c.created_at).getTime() > oneHourAgo);
    if (recentByIp.length >= 3) {
      throw new Error('Has alcanzado el límite de velas por hora. Por favor inténtalo más tarde.');
    }

    // 4. Prevención de duplicados exactos en ventana de 2 horas
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const isDuplicate = existing.some(
      c => c.pet_name.toLowerCase() === petName.toLowerCase() &&
           c.dedication.toLowerCase() === dedication.toLowerCase() &&
           new Date(c.created_at).getTime() > twoHoursAgo
    );
    if (isDuplicate) {
      throw new Error('Ya se ha encendido una vela idéntica recientemente.');
    }

    // 5. Generación de tokens seguros y marcas temporales
    const tokens = generateSecureTokens();
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newRecord: AltarCandlePrivateRecord = {
      id: crypto.randomUUID(),
      pet_name: petName,
      species,
      author_name: authorName,
      dedication,
      photo_url: input.photo_url || null,
      email,
      manage_token_hash: tokens.manageTokenHash,
      unsubscribe_token_hash: tokens.unsubscribeTokenHash,
      reminder_opt_in: true,
      commercial_opt_in: !!input.commercial_opt_in,
      opted_out_at: null,
      ip_hash: ipH,
      is_from_mural: false,
      is_eternal: false,
      memorial_id: null,
      mural_plan: null,
      warmth_count: 1,
      is_shelter_pet: false,
      shelter_name: null,
      status: 'active',
      created_at: nowIso,
      expires_at: expiresIso,
      reignited_at: null,
      reignite_count: 0,
      is_lit: true,
      days_remaining: 7,
    };

    existing.unshift(newRecord);
    writeLocalCandles(existing);

    return {
      candle: computePresentationFields(newRecord),
      manageToken: tokens.manageToken,
    };
  }

  /**
   * Reavivar llama extinguida (7 nuevos días gratuitos e ilimitados)
   */
  static async reignite(candleId: string, manageToken: string): Promise<AltarCandlePublic> {
    if (!manageToken || !manageToken.trim()) {
      throw new Error('Token de verificación requerido.');
    }

    const tokenHash = hashValue(manageToken.trim());
    const existing = readLocalCandles();
    const index = existing.findIndex(c => c.id === candleId);

    if (index === -1) {
      throw new Error('Homenaje no encontrado.');
    }

    const candle = existing[index];

    // Verificar token criptográfico
    if (candle.manage_token_hash && candle.manage_token_hash !== tokenHash) {
      throw new Error('El token de gestión no coincide con este homenaje.');
    }

    // Protección contra reencendidos masivos en ráfaga (máx 1 cada 6 horas)
    if (candle.reignited_at) {
      const lastReignite = new Date(candle.reignited_at).getTime();
      const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
      if (lastReignite > sixHoursAgo && new Date(candle.expires_at).getTime() > Date.now()) {
        throw new Error('Esta llama ya ha sido reavivada recientemente y permanece encendida.');
      }
    }

    const nowIso = new Date().toISOString();
    const newExpiresIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    candle.expires_at = newExpiresIso;
    candle.reignited_at = nowIso;
    candle.reignite_count = (candle.reignite_count || 0) + 1;

    existing[index] = candle;
    writeLocalCandles(existing);

    return computePresentationFields(candle);
  }

  /**
   * Dar de baja recordatorios de correo en un clic
   */
  static async unsubscribe(unsubscribeToken: string): Promise<boolean> {
    if (!unsubscribeToken || !unsubscribeToken.trim()) {
      throw new Error('Token inválido.');
    }

    const tokenHash = hashValue(unsubscribeToken.trim());
    const existing = readLocalCandles();
    let updated = false;

    for (const c of existing) {
      if (c.unsubscribe_token_hash === tokenHash) {
        c.reminder_opt_in = false;
        c.commercial_opt_in = false;
        c.opted_out_at = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      writeLocalCandles(existing);
    }

    return updated;
  }

  /**
   * Enviar abrazo de calor / luz comunitaria
   */
  static async sendWarmth(candleId: string): Promise<number> {
    const existing = readLocalCandles();
    const candle = existing.find(c => c.id === candleId);
    if (!candle) throw new Error('Vela no encontrada');

    candle.warmth_count = (candle.warmth_count || 0) + 1;
    writeLocalCandles(existing);
    return candle.warmth_count;
  }

  /**
   * Importación idempotente y controlada de los 18 memoriales reales
   */
  static async importMemorials(memorialsList: any[]): Promise<{ imported: number; skipped: number }> {
    const existing = readLocalCandles();
    let imported = 0;
    let skipped = 0;

    for (const m of memorialsList) {
      // Evitar duplicados por memorial_id
      const alreadyImported = existing.some(c => c.memorial_id === m.id);
      if (alreadyImported) {
        skipped++;
        continue;
      }

      const tokens = generateSecureTokens();
      const nowIso = new Date().toISOString();
      // Duración: Si es memorial vigente en mural, llama activa permanente
      const isEternal = true;
      const farFuture = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString();

      const newCandle: AltarCandlePrivateRecord = {
        id: crypto.randomUUID(),
        pet_name: m.pet_name,
        species: (m.species || 'perro') as SpeciesType,
        author_name: 'Memorial del Mural',
        dedication: m.dedication || 'Su luz brilla en el Mural de Ángeles.',
        photo_url: m.photo_url || null,
        email: null, // Privacidad absoluta: no se importan emails
        manage_token_hash: tokens.manageTokenHash,
        unsubscribe_token_hash: tokens.unsubscribeTokenHash,
        reminder_opt_in: false,
        commercial_opt_in: false,
        opted_out_at: null,
        ip_hash: null,
        is_from_mural: true,
        is_eternal: isEternal,
        memorial_id: m.id,
        mural_plan: m.plan_type || 'recuerdo_eterno',
        warmth_count: 50 + Math.floor(Math.random() * 80),
        is_shelter_pet: m.pet_name === 'Vaiana',
        shelter_name: m.pet_name === 'Vaiana' ? 'Almas de 4 patas · Málaga' : null,
        status: 'active',
        created_at: m.created_at || nowIso,
        expires_at: farFuture,
        reignited_at: null,
        reignite_count: 0,
        is_lit: true,
        days_remaining: 999,
      };

      existing.push(newCandle);
      imported++;
    }

    writeLocalCandles(existing);
    return { imported, skipped };
  }
}
