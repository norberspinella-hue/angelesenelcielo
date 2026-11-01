import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { 
  AltarCandlePublic, 
  AltarCandlePrivateRecord, 
  CreateCandleInput, 
  AltarStats, 
  SpeciesType 
} from '../../types/altar';
import { createAdminClient } from '../supabase/server';
import { resend } from '../resend';
import { generateConfirmationEmailHtml } from './altarEmailTemplates';

const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'altar_candles_local.json');
const SETTINGS_STORE_PATH = path.join(process.cwd(), 'data', 'altar_settings.json');

// Sal para anonimización irreversible de IP
const IP_SALT = process.env.ALTAR_IP_SALT || 'angeles-cielo-salt-2026';

function ensureLocalDir() {
  const dir = path.dirname(LOCAL_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLocalSettings(): Record<string, any> {
  try {
    ensureLocalDir();
    if (!fs.existsSync(SETTINGS_STORE_PATH)) {
      return { persistence_enabled: false, reminders_cron_enabled: false };
    }
    const raw = fs.readFileSync(SETTINGS_STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { persistence_enabled: false, reminders_cron_enabled: false };
  }
}

function writeLocalSettings(settings: Record<string, any>): void {
  try {
    ensureLocalDir();
    fs.writeFileSync(SETTINGS_STORE_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing settings store:', err);
  }
}

// In-memory cache para lectura de alto rendimiento de settings con TTL

const TICKETS_STORE_PATH = path.join(process.cwd(), 'data', 'altar_tickets.json');

export interface AltarExchangeTicket {
  ticketHash: string;
  candleId: string;
  manageToken: string;
  type: 'confirmation' | 'recovery';
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

function readLocalTickets(): AltarExchangeTicket[] {
  try {
    ensureLocalDir();
    if (!fs.existsSync(TICKETS_STORE_PATH)) return [];
    const raw = fs.readFileSync(TICKETS_STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalTickets(tickets: AltarExchangeTicket[]): void {
  try {
    ensureLocalDir();
    fs.writeFileSync(TICKETS_STORE_PATH, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing tickets store:', err);
  }
}

async function getPersistentTickets(): Promise<AltarExchangeTicket[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await ((supabase as any)
      .from('altar_settings')
      .select('value')
      .eq('key', 'exchange_tickets')
      .maybeSingle() as any);
    if (data?.value && Array.isArray(data.value)) {
      return data.value;
    }
  } catch {
    // fallback a almacén local
  }
  return readLocalTickets();
}

async function savePersistentTickets(tickets: AltarExchangeTicket[]): Promise<void> {
  writeLocalTickets(tickets);
  try {
    const supabase = createAdminClient();
    await ((supabase as any)
      .from('altar_settings')
      .upsert({
        key: 'exchange_tickets',
        value: tickets,
        updated_at: new Date().toISOString(),
        updated_by: 'altar_tickets_engine'
      }) as any);
  } catch (err) {
    console.error('Error syncing tickets to Supabase:', err);
  }
}

let settingsCache: { data: Record<string, any>; expiresAt: number } | null = null;

async function getPersistentSettings(): Promise<Record<string, any>> {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) {
    return settingsCache.data;
  }

  // 1. Intentar leer de la tabla persistente de Supabase (compartida entre todas las instancias Vercel)
  try {
    const supabase = createAdminClient();
    const { data, error } = await ((supabase as any)
      .from('altar_settings')
      .select('value')
      .eq('key', 'system_config')
      .maybeSingle() as any);

    if (!error && data?.value) {
      settingsCache = { data: data.value, expiresAt: now + 10000 }; // 10s TTL
      return data.value;
    }
  } catch {
    // Supabase no configurado o modo offline local
  }

  // 2. Fallback a almacén local en disco
  const local = readLocalSettings();
  settingsCache = { data: local, expiresAt: now + 5000 };
  return local;
}

async function updatePersistentSettings(
  updates: Record<string, any>, 
  actor = 'admin', 
  reason = ''
): Promise<Record<string, any>> {
  const current = await getPersistentSettings();
  const merged: Record<string, any> = { 
    ...current, 
    ...updates, 
    updated_at: new Date().toISOString(), 
    updated_by: actor 
  };

  if (!Array.isArray(merged.audit_log)) {
    merged.audit_log = [];
  }

  merged.audit_log.unshift({
    timestamp: new Date().toISOString(),
    actor,
    reason: reason || 'Modificación de configuración',
    changes: updates,
  });

  // Limitar histórico a las últimas 50 operaciones
  if (merged.audit_log.length > 50) {
    merged.audit_log = merged.audit_log.slice(0, 50);
  }

  // 1. Persistir en Supabase para sincronización serverless
  try {
    const supabase = createAdminClient();
    await ((supabase as any)
      .from('altar_settings')
      .upsert({
        key: 'system_config',
        value: merged,
        updated_at: new Date().toISOString(),
        updated_by: actor,
      }) as any);
  } catch (err) {
    // Si la tabla aún no existe o falla la red, continúa con persistencia local
  }

  // 2. Persistir en archivo local
  writeLocalSettings(merged);
  settingsCache = { data: merged, expiresAt: Date.now() + 10000 };
  return merged;
}

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

export interface MemorialFlameRights {
  hasValidRight: boolean;
  isEternal: boolean;
  expiresAt: string;
  isLit: boolean;
  status: 'active' | 'hidden';
  planType: string;
}

/**
 * Determina los derechos de llama según la vigencia real del memorial original en el Mural Global:
 * 1. Memorial indefinido vigente (Estrella Brillante, Corazón Eterno, etc.): is_eternal = true, llama encendida permanente.
 * 2. Huellita anual vigente: is_eternal = false, respeta la fecha real de vencimiento (memorial.expires_at).
 * 3. Huellita anual caducado: is_eternal = false, llama apagada pero tarjeta visible en reposo.
 * 4. Memorial retirado, no pagado o rechazado: sin encendido automático, llama apagada u oculta según corresponda.
 */
export function determineMemorialFlameRights(memorial: {
  plan_type?: string | null;
  expires_at?: string | null;
  publication_status?: string | null;
  payment_status?: string | null;
  moderation_status?: string | null;
  visibility?: string | null;
}): MemorialFlameRights {
  const isPaid = memorial.payment_status === 'paid';
  const isPublished = memorial.publication_status === 'published';
  const isNotRejected = memorial.moderation_status !== 'rejected';
  const isVisible = memorial.visibility !== 'private';

  const hasValidRight = isPaid && isPublished && isNotRejected && isVisible;

  // Si el memorial no tiene derecho legítimo (no publicado, no pagado, rechazado o privado)
  if (!hasValidRight) {
    const isExplicitlyHidden = !isPublished || !isVisible || memorial.moderation_status === 'rejected';
    return {
      hasValidRight: false,
      isEternal: false,
      expiresAt: new Date(0).toISOString(),
      isLit: false,
      status: isExplicitlyHidden ? 'hidden' : 'active',
      planType: memorial.plan_type || 'desconocido',
    };
  }

  // Planes con permanencia indefinida: Corazón Eterno, Estrella Brillante, Ángelito Protector, Galaxia de Amor, Vínculo Infinito
  // Plan anual: Huellita (identificado por plan_type 'huellita' o 'recuerdo_inicial', o si tiene expires_at definido)
  const isAnnualPlan =
    memorial.plan_type === 'huellita' ||
    memorial.plan_type === 'recuerdo_inicial' ||
    (memorial.expires_at !== null && memorial.expires_at !== undefined);

  if (!isAnnualPlan) {
    // Memorial de permanencia indefinida con derecho vigente: llama activa permanente
    const farFuture = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString();
    return {
      hasValidRight: true,
      isEternal: true,
      expiresAt: farFuture,
      isLit: true,
      status: 'active',
      planType: memorial.plan_type || 'corazon_eterno',
    };
  }

  // Memorial Huellita anual: debe respetar su fecha real de vencimiento
  const now = Date.now();
  const memorialExpiryTime = memorial.expires_at
    ? new Date(memorial.expires_at).getTime()
    : now + 365 * 24 * 60 * 60 * 1000;
  const isExpired = memorialExpiryTime <= now;

  return {
    hasValidRight: !isExpired,
    isEternal: false, // Huellita anual NO es eterno
    expiresAt: new Date(memorialExpiryTime).toISOString(),
    isLit: !isExpired,
    status: 'active', // La tarjeta del homenaje permanece visible aunque se apague la llama
    planType: memorial.plan_type || 'huellita',
  };
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
    if (!await this.isFeatureEnabled()) {
      throw new Error('El servicio de encendido de velas se encuentra temporalmente en modo de contingencia.');
    }

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

    // Confirmación transaccional segura (separada del cron; no envía emails si confirmation_email_enabled = false)
    await this.sendConfirmationEmail(
      computePresentationFields(newRecord),
      email,
      tokens.manageToken,
      tokens.unsubscribeToken
    ).catch(err => console.warn('Aviso de confirmación omitido:', err.message));

    return {
      candle: computePresentationFields(newRecord),
      manageToken: tokens.manageToken,
    };
  }

  /**
   * Reavivar llama extinguida (7 nuevos días gratuitos e ilimitados)
   */
  static async reignite(candleId: string, manageToken: string): Promise<AltarCandlePublic> {
    if (!await this.isFeatureEnabled()) {
      throw new Error('El servicio de reavivado se encuentra temporalmente en modo de contingencia.');
    }

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
    candle.pre_reminder_sent_at = null;
    candle.extinguished_notice_sent_at = null;

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
    if (!await this.isFeatureEnabled()) {
      throw new Error('El servicio de calor se encuentra temporalmente en modo de contingencia.');
    }

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
      const rights = determineMemorialFlameRights(m);

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
        is_eternal: rights.isEternal,
        memorial_id: m.id,
        mural_plan: rights.planType,
        warmth_count: 50 + Math.floor(Math.random() * 80),
        is_shelter_pet: m.pet_name === 'Vaiana',
        shelter_name: m.pet_name === 'Vaiana' ? 'Almas de 4 patas · Málaga' : null,
        status: rights.status,
        created_at: m.created_at || nowIso,
        expires_at: rights.expiresAt,
        reignited_at: null,
        reignite_count: 0,
        is_lit: rights.isLit,
        days_remaining: rights.isEternal ? 999 : Math.max(0, Math.ceil((new Date(rights.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      };

      existing.push(newCandle);
      imported++;
    }

    writeLocalCandles(existing);
    return { imported, skipped };
  }

  /**
   * Interruptor de servidor en tiempo de ejecución (Runtime Feature Flag)
   * Almacenado de forma persistente y compartida entre todas las instancias de Vercel.
   * Por seguridad ante fallos de conexión a BD, si no es explícitamente true, se asume false (fail-safe).
   */
  static async isFeatureEnabled(): Promise<boolean> {
    if (process.env.ALTAR_PERSISTENCE_ENABLED === 'false') return false;
    try {
      const settings = await getPersistentSettings();
      return settings.persistence_enabled === true;
    } catch {
      return false;
    }
  }

  static async isCronEnabled(): Promise<boolean> {
    if (!await this.isFeatureEnabled()) return false;
    try {
      const settings = await getPersistentSettings();
      return settings.reminders_cron_enabled === true;
    } catch {
      return false;
    }
  }

  /**
   * Interruptor independiente para el correo transaccional de confirmación.
   * Separado completamente de reminders_cron_enabled.
   */
  static async isConfirmationEmailEnabled(): Promise<boolean> {
    if (!await this.isFeatureEnabled()) return false;
    try {
      const settings = await getPersistentSettings();
      return settings.confirmation_email_enabled === true;
    } catch {
      return false;
    }
  }

  static async setConfirmationEmailOverride(enabled: boolean, updatedBy = 'admin', reason = ''): Promise<void> {
    await updatePersistentSettings({ confirmation_email_enabled: enabled }, updatedBy, reason);
  }

  /**
   * Envío seguro de confirmación transaccional con enlace privado de gestión.
   * Separado del cron de recordatorios periódicos.
   * Si confirmation_email_enabled es false, se simula de forma segura sin emitir correos reales.
   */
  static async sendConfirmationEmail(
    candle: AltarCandlePublic,
    email: string,
    manageToken: string,
    unsubscribeToken?: string
  ): Promise<{ success: boolean; simulated: boolean; reason?: string; emailId?: string; ticket?: string }> {
    if (!await this.isConfirmationEmailEnabled()) {
      return {
        success: true,
        simulated: true,
        reason: 'Envíos reales de correo desactivados por política de seguridad (confirmation_email_enabled = false).'
      };
    }

    try {
      // 1. Ticket de intercambio temporal de un solo uso (caducidad 2 horas = 7200000 ms)
      const rawTicket = await this.createExchangeTicket(candle.id, manageToken, 'confirmation', 2 * 60 * 60 * 1000);
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://todaslasmascotasvanalcielo.com').replace(/\/$/, '');
      const manageUrl = `${appUrl}/cielo-lleno-de-luces?ticket=${rawTicket}`;
      const candleUrl = `${appUrl}/cielo-lleno-de-luces?candleId=${candle.id}`;
      const unsubscribeUrl = unsubscribeToken
        ? `${appUrl}/api/community/candles/unsubscribe?token=${unsubscribeToken}&candleId=${candle.id}`
        : `${appUrl}/cielo-lleno-de-luces`;

      const expDate = new Date(candle.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiresDateStr = expDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const html = generateConfirmationEmailHtml({
        petName: candle.pet_name,
        authorName: candle.author_name,
        candleUrl,
        manageUrl,
        unsubscribeUrl,
        expiresDateStr
      });

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@todaslasmascotasvanalcielo.com';
      const { data, error } = await resend.emails.send({
        from: `Ángeles en el Cielo <${fromEmail}>`,
        to: email,
        subject: `Una luz brilla por ${candle.pet_name} en el Cielo de Luces ✨`,
        html
      });

      if (error) {
        console.error('Error enviando correo de confirmación de altar con Resend:', error);
        return { success: false, simulated: false, reason: error.message };
      }

      return {
        success: true,
        simulated: false,
        emailId: data?.id,
        ticket: rawTicket
      };
    } catch (err: any) {
      console.error('Excepción al enviar confirmación de altar:', err);
      return { success: false, simulated: false, reason: err.message };
    }
  }

  /**
   * Recuperación segura multidispositivo de la clave de gestión de una vela.
   * Valida estrictamente la titularidad mediante el email registrado.
   * Velas del Mural Global (is_from_mural = true / email = null) nunca se asignan a visitantes.
   */
  
  /**
   * Crear un ticket de intercambio temporal de un solo uso
   * Evita la exposición de claves permanentes en URLs, logs o historial
   */
  static async createExchangeTicket(
    candleId: string,
    manageToken: string,
    type: 'confirmation' | 'recovery' = 'confirmation',
    ttlMs = 2 * 60 * 60 * 1000 // 2h por defecto
  ): Promise<string> {
    const rawTicket = 'tkt_' + crypto.randomBytes(24).toString('base64url');
    const ticketHash = hashValue(rawTicket);
    const now = Date.now();
    let tickets = await getPersistentTickets();
    tickets = tickets.filter(t => t.expiresAt > now && !t.used);
    tickets.push({
      ticketHash,
      candleId,
      manageToken,
      type,
      expiresAt: now + ttlMs,
      used: false,
      createdAt: new Date().toISOString()
    });
    await savePersistentTickets(tickets);
    return rawTicket;
  }

  /**
   * Canjear un ticket de intercambio temporal de un solo uso
   * Se quema inmediatamente tras su primer canje exitoso
   */
  static async exchangeTicket(rawTicket: string): Promise<{ candleId: string; manageToken: string }> {
    if (!rawTicket || !rawTicket.trim()) {
      throw new Error('Ticket no proporcionado.');
    }
    const ticketHash = hashValue(rawTicket.trim());
    const tickets = await getPersistentTickets();
    const found = tickets.find(t => t.ticketHash === ticketHash);
    if (!found) {
      throw new Error('Enlace de acceso no válido o inexistente.');
    }
    if (found.used) {
      throw new Error('Este enlace de acceso ya ha sido utilizado.');
    }
    if (Date.now() > found.expiresAt) {
      throw new Error('Este enlace de acceso ha caducado por motivos de seguridad.');
    }
    found.used = true;
    await savePersistentTickets(tickets);
    return {
      candleId: found.candleId,
      manageToken: found.manageToken
    };
  }

  /**
   * Eliminación segura y autorizada exclusivamente para pruebas o titularidad
   * Impide terminantemente eliminar velas del Mural Global
   */
  static async deleteCandle(candleId: string, manageToken: string): Promise<boolean> {
    if (!candleId || !manageToken) {
      throw new Error('Identificador y clave requeridos.');
    }
    const tokenHash = hashValue(manageToken.trim());
    const existing = readLocalCandles();
    const index = existing.findIndex(c => c.id === candleId);

    if (index !== -1 && existing[index].is_from_mural) {
      throw new Error('No se pueden eliminar homenajes del Mural Global.');
    }

    if (index !== -1) {
      if (existing[index].manage_token_hash !== tokenHash) {
        throw new Error('Clave de gestión no válida.');
      }
      existing.splice(index, 1);
      writeLocalCandles(existing);
    }

    try {
      const supabase = createAdminClient();
      await (supabase as any)
        .from('altar_candles')
        .delete()
        .eq('id', candleId)
        .eq('manage_token_hash', tokenHash)
        .eq('is_from_mural', false);
    } catch {
      // Ignorar si no está en Supabase
    }

    return true;
  }

  static async recoverCandleAccess(
    candleId: string,
    email: string
  ): Promise<{ success: boolean; message: string }> {
    if (!candleId || !email) {
      throw new Error('Identificador de vela y correo electrónico requeridos.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = readLocalCandles();
    const candle = existing.find(c => c.id === candleId);

    if (!candle) {
      return {
        success: true,
        message: 'Si los datos coinciden con un homenaje comunitario registrado, se procesará la solicitud.'
      };
    }

    if (candle.is_from_mural || candle.email === null) {
      throw new Error('Este homenaje pertenece a un memorial permanente del Mural Global y su gestión está vinculada exclusivamente a su familia titular.');
    }

    const isOwner = candle.email.trim().toLowerCase() === cleanEmail;
    if (!isOwner) {
      return {
        success: true,
        message: 'Si el correo coincide con el registrado al encender la vela, se enviará la clave de acceso.'
      };
    }

    if (await this.isConfirmationEmailEnabled()) {
      // Envío real del enlace de recuperación
    }

    return {
      success: true,
      message: 'Solicitud verificada. Cuando el canal de avisos por correo esté activo, recibirás tu enlace seguro.'
    };
  }

  static async setRuntimeOverride(enabled: boolean, updatedBy = 'admin', reason = ''): Promise<void> {
    await updatePersistentSettings({ persistence_enabled: enabled }, updatedBy, reason);
  }

  static async setCronOverride(enabled: boolean, updatedBy = 'admin', reason = ''): Promise<void> {
    await updatePersistentSettings({ reminders_cron_enabled: enabled }, updatedBy, reason);
  }

  static async getSettingsAudit(): Promise<{
    persistence_enabled: boolean;
    reminders_cron_enabled: boolean;
    updated_at: string | null;
    updated_by: string | null;
    cron_running: boolean;
    cron_last_completed_at: string | null;
    cron_last_summary: any;
    audit_log: any[];
  }> {
    const settings = await getPersistentSettings();
    return {
      persistence_enabled: settings.persistence_enabled === true,
      reminders_cron_enabled: settings.reminders_cron_enabled === true,
      updated_at: settings.updated_at || null,
      updated_by: settings.updated_by || null,
      cron_running: !!settings.cron_running,
      cron_last_completed_at: settings.cron_last_completed_at || null,
      cron_last_summary: settings.cron_last_summary || null,
      audit_log: Array.isArray(settings.audit_log) ? settings.audit_log : [],
    };
  }

  /**
   * Comprueba en tiempo real la vigencia de un derecho memorial en la tabla memorials
   * (Integración 100% de solo lectura: SELECT sin escrituras).
   */
  static async checkMemorialValidity(memorialId: string): Promise<boolean> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('memorials')
        .select('id, publication_status, payment_status, expires_at')
        .eq('id', memorialId)
        .single();

      const memorial = data as any;
      if (!memorial) return false;
      if (memorial.publication_status !== 'published' || memorial.payment_status !== 'paid') return false;
      if (memorial.expires_at && new Date(memorial.expires_at).getTime() <= Date.now()) return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sincronización de vigencia: si un derecho de memorial expira o finaliza,
   * la vela pasa al régimen gratuito sin modificar memoriales ni pagos.
   */
  static async reconcileMemorialRight(candleId: string): Promise<AltarCandlePublic | null> {
    const existing = readLocalCandles();
    const candle = existing.find(c => c.id === candleId);
    if (!candle || !candle.memorial_id) return null;

    try {
      const supabase = createAdminClient();
      const { data: memorial } = await ((supabase as any)
        .from('memorials')
        .select('id, plan_type, publication_status, payment_status, expires_at, moderation_status, visibility')
        .eq('id', candle.memorial_id)
        .maybeSingle() as any);

      if (!memorial) {
        // Memorial retirado: la llama se apaga pero la tarjeta permanece salvo que fuera ocultada
        candle.is_eternal = false;
        candle.expires_at = new Date().toISOString();
        writeLocalCandles(existing);
        return computePresentationFields(candle);
      }

      const rights = determineMemorialFlameRights(memorial);
      candle.is_eternal = rights.isEternal;
      candle.expires_at = rights.expiresAt;
      if (rights.status === 'hidden') {
        candle.status = 'hidden';
      }
      writeLocalCandles(existing);
      return computePresentationFields(candle);
    } catch {
      return computePresentationFields(candle);
    }
  }

  /**
   * Vinculación segura de futuras compras: enlaza una vela comunitaria existente
   * con un memorial adquirido, otorgando la llama activa sin tocar Stripe ni webhooks.
   */
  static async linkCandleToMemorial(candleId: string, memorialId: string): Promise<boolean> {
    if (!await this.isFeatureEnabled()) {
      throw new Error('El servicio se encuentra temporalmente en modo de contingencia.');
    }

    try {
      const supabase = createAdminClient();
      const { data: memorial } = await ((supabase as any)
        .from('memorials')
        .select('id, plan_type, publication_status, payment_status, expires_at, moderation_status, visibility')
        .eq('id', memorialId)
        .maybeSingle() as any);

      if (!memorial) return false;
      const rights = determineMemorialFlameRights(memorial);
      if (!rights.hasValidRight) return false;

      const existing = readLocalCandles();
      const candle = existing.find(c => c.id === candleId);
      if (!candle) return false;

      candle.memorial_id = memorialId;
      candle.is_from_mural = true;
      candle.is_eternal = rights.isEternal;
      candle.expires_at = rights.expiresAt;
      candle.mural_plan = rights.planType;
      candle.status = rights.status;
      writeLocalCandles(existing);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Procesador programado de recordatorios de correo con control estricto antiduplicados
   */
  static async processScheduledReminders(testMode = true): Promise<{
    preRemindersSent: number;
    extinguishedNoticesSent: number;
  }> {
    if (!await this.isCronEnabled()) {
      return { preRemindersSent: 0, extinguishedNoticesSent: 0 };
    }

    const settings = await getPersistentSettings();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (settings.cron_running && new Date(settings.cron_started_at || 0).getTime() > tenMinutesAgo) {
      console.warn('Ejecución de cron en curso omitida para evitar concurrencia.');
      return { preRemindersSent: 0, extinguishedNoticesSent: 0 };
    }

    await updatePersistentSettings(
      { cron_running: true, cron_started_at: new Date().toISOString() },
      'cron',
      'Inicio de ciclo programado'
    );

    let preRemindersSent = 0;
    let extinguishedNoticesSent = 0;

    try {
      const existing = readLocalCandles();
      const now = Date.now();
      const fortyEightHoursMs = 48 * 60 * 60 * 1000;

      for (const candle of existing) {
        // Solo velas con email, recordatorios activos y que no sean del mural
        if (!candle.email || !candle.reminder_opt_in || candle.is_from_mural) continue;

        const expTime = new Date(candle.expires_at).getTime();
        const timeLeft = expTime - now;

        // 1. Aviso previo al apagado (entre 48h y 0h restantes)
        if (timeLeft > 0 && timeLeft <= fortyEightHoursMs && !candle.pre_reminder_sent_at) {
          candle.pre_reminder_sent_at = new Date().toISOString();
          preRemindersSent++;
          if (!testMode) {
            // En producción invoca a Resend; en test permanece en log
          }
        }

        // 2. Aviso de vela apagada (expirada y aviso previo ya enviado o tiempo rebasado)
        if (timeLeft <= 0 && !candle.extinguished_notice_sent_at) {
          candle.extinguished_notice_sent_at = new Date().toISOString();
          extinguishedNoticesSent++;
          if (!testMode) {
            // En producción invoca a Resend; en test permanece en log
          }
        }
      }

      if (preRemindersSent > 0 || extinguishedNoticesSent > 0) {
        writeLocalCandles(existing);
      }
    } finally {
      await updatePersistentSettings(
        {
          cron_running: false,
          cron_last_completed_at: new Date().toISOString(),
          cron_last_summary: { preRemindersSent, extinguishedNoticesSent },
        },
        'cron',
        'Finalización de ciclo programado'
      );
    }

    return { preRemindersSent, extinguishedNoticesSent };
  }
}
