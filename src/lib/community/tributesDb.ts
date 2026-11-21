import { Pool } from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { assertStagingIsolation } from './stagingGuard';
import { captureDevMagicLinkEmail } from './devEmailSink';
import { sendStagingMagicLinkEmail } from './stagingEmailAdapter';

export interface TributeDto {
  id: string;
  slug: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  photoUrl: string | null;
  yearsOrDates: string | null;
  authorDisplayName: string;
  muralReferenceId?: string | null;
  candlesCount: number;
  hugsCount: number;
  publicationStatus: 'published' | 'pending_review' | 'archived';
  visibility: 'public' | 'private';
  lettersCount?: number;
  createdAt: string;
}

export interface TributeLetterDto {
  id: string;
  tributeId: string;
  letterSeqNum: number;
  title: string;
  category: 'despedida' | 'cumpleanos' | 'aniversario' | 'espontanea';
  content: string;
  authorName: string;
  displayDate: string;
  envelopeColor: 'crema' | 'lavanda' | 'rosa';
  moderationStatus: 'approved' | 'pending_review' | 'rejected';
  createdAt: string;
}

export interface GuardianSessionDto {
  id: string;
  guardianId: string;
  tributeId: string;
  tributeSlug: string;
  petName: string;
  expiresAt: string;
}

/**
 * Obtiene el secreto HMAC obligatorio para blind index y rate limiting.
 * Falla de forma segura si falta (cero secretos hardcodeados de respaldo).
 */
function getHmacSecret(): string {
  const envSecret = process.env.COMMUNITY_HMAC_SECRET;
  if (envSecret && envSecret.trim().length >= 32) {
    return envSecret.trim();
  }

  // En desarrollo local con Docker aislado únicamente, admitir archivo efímero generado fuera del repositorio
  if (process.env.NODE_ENV !== 'production') {
    try {
      const tempHmacPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_hmac.tmp');
      if (fs.existsSync(tempHmacPath)) {
        const fileSecret = fs.readFileSync(tempHmacPath, 'utf8').trim();
        if (fileSecret.length >= 32) return fileSecret;
      }
    } catch {
      // continuar hacia fallo seguro
    }
  }

  throw new Error('Falta el secreto obligatorio COMMUNITY_HMAC_SECRET (mínimo 32 caracteres).');
}

export function computeBlindIndex(email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', getHmacSecret()).update(normalized).digest('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getDatabaseConfig() {
  if (process.env.COMMUNITY_DB_URL) {
    return { connectionString: process.env.COMMUNITY_DB_URL };
  }

  // Solo en entorno local aislado: archivo de contraseña efímera de Docker
  if (process.env.NODE_ENV !== 'production') {
    try {
      const tempPassPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_pass.tmp');
      if (fs.existsSync(tempPassPath)) {
        const pass = fs.readFileSync(tempPassPath, 'utf8').trim();
        return {
          host: '127.0.0.1',
          port: 5432,
          user: 'postgres',
          password: pass,
          database: 'cartas_staging'
        };
      }
    } catch {
      // ignorar error de lectura
    }
  }

  return null;
}

let poolInstance: Pool | null = null;

export function getDbPool(): Pool | null {
  if (poolInstance) return poolInstance;
  const config = getDatabaseConfig();
  if (!config) return null;

  // Guarda estricta anti-producción antes de abrir cualquier socket PostgreSQL
  const target = assertStagingIsolation(config);
  const isLocal = target.host === '127.0.0.1' || target.host === 'localhost';

  poolInstance = new Pool({
    ...config,
    ...(isLocal
      ? {}
      : {
          ssl: {
            rejectUnauthorized: true,
            ...(process.env.COMMUNITY_DB_CA_CERT ? { ca: process.env.COMMUNITY_DB_CA_CERT } : {}),
          },
        }),
  });

  return poolInstance;
}

// Consultar homenajes públicos para el índice general (solo lectura segura)
export async function getPublicTributes(options: { species?: string; limit?: number } = {}): Promise<TributeDto[]> {
  const pool = getDbPool();
  if (!pool) return [];

  const limit = Math.min(Math.max(options.limit || 50, 1), 100);
  const params: any[] = [limit];
  let filterClause = '';

  if (options.species && options.species !== 'todos') {
    params.push(options.species);
    filterClause = `AND ct.species = $${params.length}`;
  }

  const query = `
    SELECT 
      ct.id,
      ct.slug,
      ct.pet_name as "petName",
      ct.species,
      ct.photo_url as "photoUrl",
      ct.years_or_dates as "yearsOrDates",
      ct.author_display_name as "authorDisplayName",
      ct.mural_reference_id as "muralReferenceId",
      ct.candles_count as "candlesCount",
      ct.hugs_count as "hugsCount",
      ct.publication_status as "publicationStatus",
      ct.visibility,
      ct.created_at as "createdAt",
      (ct.legacy_memorial_id IS NOT NULL) as "isLegacy",
      EXISTS (SELECT 1 FROM public.tribute_guardians tg WHERE tg.tribute_id = ct.id) as "hasGuardian",
      COUNT(tl.id)::int as "lettersCount"
    FROM public.community_tributes ct
    LEFT JOIN public.tribute_letters tl ON ct.id = tl.tribute_id 
      AND tl.moderation_status = 'approved' 
      AND NOT tl.is_archived 
      AND tl.deleted_at IS NULL
    WHERE ct.publication_status = 'published'
      AND ct.visibility = 'public'
      AND NOT ct.is_archived
      AND ct.deleted_at IS NULL
      ${filterClause}
    GROUP BY ct.id
    ORDER BY ct.created_at DESC
    LIMIT $1;
  `;

  const res = await pool.query(query, params);
  return res.rows;
}

// Consultar homenaje por slug con sus cartas públicas
export async function getTributeBySlug(slug: string): Promise<{ tribute: TributeDto; letters: TributeLetterDto[] } | null> {
  const pool = getDbPool();
  if (!pool) return null;

  const tribRes = await pool.query(`
    SELECT 
      ct.id,
      ct.slug,
      ct.pet_name as "petName",
      ct.species,
      ct.photo_url as "photoUrl",
      ct.years_or_dates as "yearsOrDates",
      ct.author_display_name as "authorDisplayName",
      ct.mural_reference_id as "muralReferenceId",
      ct.candles_count as "candlesCount",
      ct.hugs_count as "hugsCount",
      ct.publication_status as "publicationStatus",
      ct.visibility,
      ct.created_at as "createdAt"
    FROM public.community_tributes ct
    WHERE ct.slug = $1
      AND ct.publication_status = 'published'
      AND ct.visibility = 'public'
      AND NOT ct.is_archived
      AND ct.deleted_at IS NULL;
  `, [slug]);

  if (tribRes.rows.length === 0) return null;
  const tribute = tribRes.rows[0];

  const lettersRes = await pool.query(`
    SELECT 
      tl.id,
      tl.tribute_id as "tributeId",
      tl.letter_seq_num as "letterSeqNum",
      tl.title,
      tl.category,
      tl.content,
      tl.author_name as "authorName",
      tl.display_date as "displayDate",
      tl.envelope_color as "envelopeColor",
      tl.moderation_status as "moderationStatus",
      tl.created_at as "createdAt"
    FROM public.tribute_letters tl
    WHERE tl.tribute_id = $1
      AND tl.moderation_status = 'approved'
      AND NOT tl.is_archived
      AND tl.deleted_at IS NULL
    ORDER BY tl.letter_seq_num ASC;
  `, [tribute.id]);

  tribute.lettersCount = lettersRes.rows.length;

  return {
    tribute,
    letters: lettersRes.rows
  };
}

// Crear homenaje con primera carta y devolver sesión de guardián
export async function createTributeWithFirstLetter(data: {
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  authorName: string;
  email: string;
  yearsOrDates?: string;
  photoUrl?: string | null;
  firstLetterTitle: string;
  firstLetterCategory: 'despedida' | 'cumpleanos' | 'aniversario' | 'espontanea';
  firstLetterContent: string;
  firstLetterEnvelopeColor: 'crema' | 'lavanda' | 'rosa';
  displayDate?: string;
}) {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const baseSlug = data.petName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'angelito';
    const randSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${randSuffix}`;

    const insT = await client.query(`
      INSERT INTO public.community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, slug, pet_name as "petName";
    `, [slug, data.petName, data.species, data.authorName, data.yearsOrDates || null, data.photoUrl || null]);
    const tribute = insT.rows[0];

    const dateFormatted = data.displayDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const insL = await client.query(`
      SELECT * FROM public.publish_tribute_letter($1, $2, $3, $4, $5, $6, $7);
    `, [
      tribute.id,
      data.firstLetterTitle,
      data.firstLetterCategory,
      data.firstLetterContent,
      data.authorName,
      dateFormatted,
      data.firstLetterEnvelopeColor
    ]);
    const letter = insL.rows[0];

    const blindIndex = computeBlindIndex(data.email);
    const insG = await client.query(`
      INSERT INTO public.tribute_guardians (tribute_id, email_blind_index, guardian_name)
      VALUES ($1, $2, $3)
      RETURNING id;
    `, [tribute.id, blindIndex, data.authorName]);
    const guardianId = insG.rows[0].id;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tHash = hashToken(rawToken);

    await client.query(`
      INSERT INTO public.guardian_sessions (guardian_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days');
    `, [guardianId, tHash]);

    await client.query('COMMIT');

    return {
      tribute,
      letter,
      rawSessionToken: rawToken
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Validar sesión activa de guardián para un homenaje específico
export async function validateGuardianSession(rawToken: string, targetTributeIdOrSlug?: string): Promise<GuardianSessionDto | null> {
  const pool = getDbPool();
  if (!pool || !rawToken) return null;

  const tHash = hashToken(rawToken);

  const res = await pool.query(`
    SELECT 
      s.id,
      s.guardian_id as "guardianId",
      g.tribute_id as "tributeId",
      ct.slug as "tributeSlug",
      ct.pet_name as "petName",
      s.expires_at as "expiresAt"
    FROM public.guardian_sessions s
    JOIN public.tribute_guardians g ON s.guardian_id = g.id
    JOIN public.community_tributes ct ON g.tribute_id = ct.id
    WHERE s.token_hash = $1
      AND s.expires_at > NOW()
      AND s.revoked_at IS NULL
      AND ct.deleted_at IS NULL;
  `, [tHash]);

  if (res.rows.length === 0) return null;
  const session = res.rows[0];

  if (targetTributeIdOrSlug) {
    if (session.tributeId !== targetTributeIdOrSlug && session.tributeSlug !== targetTributeIdOrSlug) {
      return null;
    }
  }

  return session;
}

// Publicar carta adicional verificando autorización de sesión
export async function publishAuthorizedLetter(data: {
  tributeSlug: string;
  rawGuardianToken: string;
  title: string;
  category: 'despedida' | 'cumpleanos' | 'aniversario' | 'espontanea';
  content: string;
  authorName: string;
  envelopeColor: 'crema' | 'lavanda' | 'rosa';
  displayDate?: string;
  idempotencyKey?: string;
}) {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  const session = await validateGuardianSession(data.rawGuardianToken, data.tributeSlug);
  if (!session) {
    const error: any = new Error('No autorizado: sesión no válida o sin permiso para esta colección');
    error.status = 403;
    throw error;
  }

  const dateFormatted = data.displayDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  try {
    const res = await pool.query(`
      SELECT * FROM public.publish_tribute_letter($1, $2, $3, $4, $5, $6, $7, $8);
    `, [
      session.tributeId,
      data.title,
      data.category,
      data.content,
      data.authorName,
      dateFormatted,
      data.envelopeColor,
      data.idempotencyKey || null
    ]);

    return {
      letter: res.rows[0],
      isDuplicate: res.rows[0].is_duplicate
    };
  } catch (err: any) {
    if (err.message && err.message.includes('IDEMPOTENCY_CONFLICT')) {
      const conflictError: any = new Error('La clave de idempotencia ya fue utilizada con un contenido diferente.');
      conflictError.status = 409;
      throw conflictError;
    }
    throw err;
  }
}

// Revocar sesión actual o todas las sesiones del guardián
export async function revokeGuardianSession(rawToken: string, revokeAll = false): Promise<boolean> {
  const pool = getDbPool();
  if (!pool || !rawToken) return false;

  const tHash = hashToken(rawToken);

  if (revokeAll) {
    const res = await pool.query(`
      UPDATE public.guardian_sessions gs
      SET revoked_at = NOW()
      WHERE gs.guardian_id = (
        SELECT guardian_id FROM public.guardian_sessions WHERE token_hash = $1 LIMIT 1
      )
      AND gs.revoked_at IS NULL;
    `, [tHash]);
    return (res.rowCount || 0) > 0;
  }

  const res = await pool.query(`
    UPDATE public.guardian_sessions
    SET revoked_at = NOW()
    WHERE token_hash = $1 AND revoked_at IS NULL;
  `, [tHash]);

  return (res.rowCount || 0) > 0;
}

/**
 * Solicitud de recuperación mediante Magic Link efímero (15 min, 1 solo uso).
 * Anti-enumeración estricta: respuesta y flujo de tiempo constantes; jamás devuelve tokens en HTTP.
 */
export async function requestGuardianRecovery(email: string, tributeSlug: string): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  const bIndex = computeBlindIndex(email);

  const res = await pool.query(`
    SELECT g.id, g.tribute_id, ct.slug as "tributeSlug", ct.pet_name as "petName"
    FROM public.tribute_guardians g
    JOIN public.community_tributes ct ON g.tribute_id = ct.id
    WHERE g.email_blind_index = $1
      AND ct.slug = $2
      AND ct.deleted_at IS NULL;
  `, [bIndex, tributeSlug]);

  // Paso criptográfico constante tanto si existe como si no existe para mitigar timing side-channels
  const rawMagicToken = crypto.randomBytes(32).toString('hex');
  const tHash = hashToken(rawMagicToken);

  if (res.rows.length > 0) {
    const guardian = res.rows[0];
    await pool.query(`
      INSERT INTO public.guardian_magic_links (guardian_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '15 minutes');
    `, [guardian.id, tHash]);

    if (process.env.COMMUNITY_ALLOWED_ENV === 'staging' && process.env.COMMUNITY_EMAIL_SEND_ENABLED === 'true') {
      await sendStagingMagicLinkEmail({
        requestedEmail: email,
        tributeSlug: guardian.tributeSlug,
        petName: guardian.petName,
        rawToken: rawMagicToken,
      });
    } else {
      // Capturador local exclusivo de pruebas/desarrollo (nunca se envía por HTTP ni se loguea en consola)
      captureDevMagicLinkEmail({
        tributeSlug: guardian.tributeSlug,
        emailBlindHint: bIndex,
        rawToken: rawMagicToken,
      });
    }
  }

  return {
    success: true,
    message: 'Si el correo coincide con la familia guardiana registrada, recibirás un enlace temporal de acceso.'
  };
}

/**
 * Canjea un Magic Link de un solo uso por una nueva sesión independiente de guardián (7 días).
 */
export async function verifyAndExchangeMagicLink(rawMagicToken: string, tributeSlug?: string): Promise<{
  sessionToken: string;
  tributeSlug: string;
  petName: string;
  expiresAt: string;
} | null> {
  const pool = getDbPool();
  if (!pool || !rawMagicToken) return null;

  const magicHash = hashToken(rawMagicToken);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Consumo atómico de un solo uso
    const consumedRes = await client.query(`
      SELECT guardian_id as "guardianId", tribute_slug as "tributeSlug", pet_name as "petName"
      FROM public.consume_guardian_magic_link($1, $2);
    `, [magicHash, tributeSlug || null]);

    if (consumedRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const { guardianId, tributeSlug: resolvedSlug, petName } = consumedRes.rows[0];

    // Generar nueva sesión independiente (rotación de token)
    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const sessionHash = hashToken(rawSessionToken);

    const sessRes = await client.query(`
      INSERT INTO public.guardian_sessions (guardian_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days')
      RETURNING expires_at as "expiresAt";
    `, [guardianId, sessionHash]);

    await client.query('COMMIT');

    return {
      sessionToken: rawSessionToken,
      tributeSlug: resolvedSlug,
      petName,
      expiresAt: sessRes.rows[0].expiresAt
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Registra una reacción comunitaria (vela, abrazo o apoyo) con protección anti-duplicados por ip_hash.
 * Independiente del sistema Cielo lleno de luces.
 */
export async function recordTributeReaction(
  slug: string,
  reactionType: 'candle' | 'hug' | 'support',
  ipHash: string
): Promise<{
  recorded: boolean;
  alreadyReacted: boolean;
  candlesCount: number;
  hugsCount: number;
  supportCount: number;
} | null> {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  const tribRes = await pool.query(`
    SELECT id FROM public.community_tributes
    WHERE slug = $1
      AND publication_status = 'published'
      AND visibility = 'public'
      AND is_archived = FALSE
      AND deleted_at IS NULL;
  `, [slug]);

  if (tribRes.rows.length === 0) return null;

  const res = await pool.query(`
    SELECT recorded, already_reacted as "alreadyReacted",
           candles_count as "candlesCount", hugs_count as "hugsCount", support_count as "supportCount"
    FROM public.record_community_tribute_reaction($1, $2, $3);
  `, [tribRes.rows[0].id, reactionType, ipHash]);

  return res.rows[0] || null;
}

/**
 * Listado unificado de homenajes y cartas multicarta para el panel /admin/moderacion.
 */
export async function getAdminCommunityModerationData(options: {
  statusFilter?: string;
  search?: string;
  limit?: number;
} = {}) {
  const pool = getDbPool();
  if (!pool) return { tributes: [], letters: [] };

  const limit = Math.min(Math.max(options.limit || 50, 1), 100);
  const search = options.search?.trim() ? `%${options.search.trim()}%` : null;

  const tribParams: any[] = [limit];
  let tribWhere = 'WHERE 1=1';
  if (search) {
    tribParams.push(search);
    tribWhere += ` AND (ct.pet_name ILIKE $${tribParams.length} OR ct.author_display_name ILIKE $${tribParams.length})`;
  }
  if (options.statusFilter === 'pending') {
    tribWhere += ` AND ct.publication_status = 'pending_review'`;
  } else if (options.statusFilter === 'archived') {
    tribWhere += ` AND (ct.is_archived = TRUE OR ct.publication_status = 'archived')`;
  } else if (options.statusFilter === 'removal_requests') {
    tribWhere += ` AND ct.deleted_at IS NOT NULL`;
  }

  const tributesRes = await pool.query(`
    SELECT ct.id, ct.slug, ct.pet_name as "petName", ct.species, ct.author_display_name as "authorDisplayName",
           ct.publication_status as "publicationStatus", ct.visibility, ct.is_archived as "isArchived",
           ct.deleted_at as "deletedAt", ct.legacy_memorial_id as "legacyMemorialId", ct.created_at as "createdAt"
    FROM public.community_tributes ct
    ${tribWhere}
    ORDER BY ct.created_at DESC
    LIMIT $1;
  `, tribParams);

  const letterParams: any[] = [limit];
  let letterWhere = 'WHERE 1=1';
  if (search) {
    letterParams.push(search);
    letterWhere += ` AND (tl.title ILIKE $${letterParams.length} OR tl.author_name ILIKE $${letterParams.length} OR ct.pet_name ILIKE $${letterParams.length})`;
  }
  if (options.statusFilter === 'pending') {
    letterWhere += ` AND tl.moderation_status = 'pending_review' AND tl.deleted_at IS NULL`;
  } else if (options.statusFilter === 'approved') {
    letterWhere += ` AND tl.moderation_status = 'approved' AND tl.is_archived = FALSE AND tl.deleted_at IS NULL`;
  } else if (options.statusFilter === 'archived') {
    letterWhere += ` AND (tl.is_archived = TRUE OR tl.moderation_status = 'rejected')`;
  } else if (options.statusFilter === 'removal_requests') {
    letterWhere += ` AND tl.deleted_at IS NOT NULL`;
  }

  const lettersRes = await pool.query(`
    SELECT tl.id, tl.tribute_id as "tributeId", ct.slug as "tributeSlug", ct.pet_name as "petName",
           ct.legacy_memorial_id as "legacyMemorialId",
           tl.letter_seq_num as "letterSeqNum", tl.title, tl.category, tl.content, tl.author_name as "authorName",
           tl.moderation_status as "moderationStatus", tl.is_archived as "isArchived",
           tl.deleted_at as "deletedAt", tl.created_at as "createdAt"
    FROM public.tribute_letters tl
    JOIN public.community_tributes ct ON ct.id = tl.tribute_id
    ${letterWhere}
    ORDER BY tl.created_at DESC
    LIMIT $1;
  `, letterParams);

  return {
    tributes: tributesRes.rows,
    letters: lettersRes.rows,
  };
}

/**
 * Acción administrativa sobre un homenaje o una carta individual en /admin/moderacion.
 */
export async function moderateCommunityEntity(params: {
  entityType: 'tribute' | 'tribute_letter';
  id: string;
  action: 'approve' | 'pending' | 'reject' | 'archive' | 'soft_delete' | 'restore';
}): Promise<boolean> {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  if (params.entityType === 'tribute') {
    const queryMap: Record<string, string> = {
      approve: `UPDATE public.community_tributes SET publication_status = 'published', visibility = 'public', is_archived = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = $1`,
      pending: `UPDATE public.community_tributes SET publication_status = 'pending_review', updated_at = NOW() WHERE id = $1`,
      reject: `UPDATE public.community_tributes SET visibility = 'private', is_archived = TRUE, updated_at = NOW() WHERE id = $1`,
      archive: `UPDATE public.community_tributes SET publication_status = 'archived', is_archived = TRUE, updated_at = NOW() WHERE id = $1`,
      soft_delete: `UPDATE public.community_tributes SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
      restore: `UPDATE public.community_tributes SET publication_status = 'published', visibility = 'public', is_archived = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = $1`,
    };
    const sql = queryMap[params.action];
    if (!sql) return false;
    const res = await pool.query(sql, [params.id]);
    return (res.rowCount || 0) > 0;
  }

  const letterMap: Record<string, string> = {
    approve: `UPDATE public.tribute_letters SET moderation_status = 'approved', is_archived = FALSE, deleted_at = NULL WHERE id = $1`,
    pending: `UPDATE public.tribute_letters SET moderation_status = 'pending_review' WHERE id = $1`,
    reject: `UPDATE public.tribute_letters SET moderation_status = 'rejected' WHERE id = $1`,
    archive: `UPDATE public.tribute_letters SET is_archived = TRUE WHERE id = $1`,
    soft_delete: `UPDATE public.tribute_letters SET deleted_at = NOW() WHERE id = $1`,
    restore: `UPDATE public.tribute_letters SET moderation_status = 'approved', is_archived = FALSE, deleted_at = NULL WHERE id = $1`,
  };
  const sql = letterMap[params.action];
  if (!sql) return false;
  const res = await pool.query(sql, [params.id]);
  return (res.rowCount || 0) > 0;
}

/**
 * Replicación idempotente para ventana de doble escritura desde POST /api/community/memories.
 * No es atómica respecto a la escritura previa en Supabase REST (memorials); si falla,
 * migrate_legacy_community_memorials() reconcilia sin duplicados.
 */
export async function replicateLegacyMemoryToMulticarta(data: {
  legacyMemorialId: string;
  slug: string;
  petName: string;
  species: string;
  photoUrl: string | null;
  yearsOrDates?: string | null;
  authorName: string;
  message: string;
  isPublic: boolean;
}) {
  const pool = getDbPool();
  if (!pool) return { replicated: false, reason: 'no_pool' };

  const mappedSpecies = data.species === 'gato' ? 'gato' : data.species === 'perro' ? 'perro' : 'otro';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tribRes = await client.query(`
      INSERT INTO public.community_tributes (
        legacy_memorial_id, legacy_profile_slug, slug, pet_name, species, photo_url,
        years_or_dates, author_display_name, candles_count, visibility, publication_status
      )
      VALUES ($1, $2, $2, $3, $4, $5, $6, $7, 1, $8, 'published')
      ON CONFLICT (legacy_memorial_id) DO NOTHING
      RETURNING id;
    `, [
      data.legacyMemorialId,
      data.slug,
      data.petName,
      mappedSpecies,
      data.photoUrl,
      data.yearsOrDates || null,
      data.authorName,
      data.isPublic ? 'public' : 'private',
    ]);

    let tributeId = tribRes.rows[0]?.id;
    if (!tributeId) {
      const existing = await client.query(`SELECT id FROM public.community_tributes WHERE legacy_memorial_id = $1;`, [data.legacyMemorialId]);
      tributeId = existing.rows[0]?.id;
    }

    if (tributeId) {
      const displayDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      await client.query(`
        SELECT * FROM public.publish_tribute_letter($1, $2, 'despedida', $3, $4, $5, 'crema', $6);
      `, [
        tributeId,
        `Para ${data.petName}`,
        data.message,
        data.authorName,
        displayDate,
        `legacy-memorial-${data.legacyMemorialId}`,
      ]);
    }

    await client.query('COMMIT');
    return { replicated: true, tributeId };
  } catch (err) {
    await client.query('ROLLBACK');
    return { replicated: false, reason: 'replication_error' };
  } finally {
    client.release();
  }
}

function maskEmailAddress(email: string): string {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function isReliableHistoricalEmail(email?: string | null): boolean {
  if (!email) return false;
  const norm = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(norm)) return false;
  const blockedFragments = ['sin-correo', 'no-email', 'anonimo', 'noreply', 'no-reply', 'unknown@', 'placeholder'];
  return !blockedFragments.some((frag) => norm.includes(frag));
}

/**
 * Registra una solicitud de custodia para una colección histórica.
 * NUNCA asigna guardián automáticamente por coincidencia de nombre, foto o dedicatoria.
 * Cuando existe un correo histórico fiable y coincide, exige verificación criptográfica
 * de control de bandeja mediante token temporal antes de pasar a aprobación administrativa.
 */
export async function submitLegacyGuardianClaim(data: {
  slug: string;
  claimantEmail: string;
  proofEmail?: string;
  proofDeletionToken?: string;
  proofNote?: string;
}) {
  const pool = getDbPool();
  if (!pool) throw Object.assign(new Error('Base de datos no disponible'), { status: 503 });

  const tribRes = await pool.query(`
    SELECT ct.id, ct.pet_name, ct.legacy_memorial_id, ct.author_display_name,
           EXISTS (SELECT 1 FROM public.tribute_guardians tg WHERE tg.tribute_id = ct.id) AS has_guardian
    FROM public.community_tributes ct
    WHERE ct.slug = $1 AND ct.deleted_at IS NULL
    LIMIT 1;
  `, [data.slug]);

  const trib = tribRes.rows[0];
  if (!trib) {
    return { ok: false as const, status: 404, error: 'Colección no encontrada.' };
  }
  if (!trib.legacy_memorial_id) {
    return { ok: false as const, status: 400, error: 'Esta colección no requiere reclamación histórica.' };
  }
  if (trib.has_guardian) {
    return { ok: false as const, status: 409, error: 'Esta colección ya cuenta con un guardián verificado.' };
  }

  const claimantEmailHash = computeBlindIndex(data.claimantEmail);
  const dupRes = await pool.query(`
    SELECT id FROM public.legacy_guardian_claims
    WHERE tribute_id = $1 AND claimant_email_hash = $2 AND claim_status = 'pending_review'
    LIMIT 1;
  `, [trib.id, claimantEmailHash]);

  if (dupRes.rows[0]) {
    return {
      ok: false as const,
      status: 409,
      error: 'Ya existe una solicitud de custodia pendiente para esta colección con ese correo.',
    };
  }

  let privateProofMatch = false;
  let verificationMethod: 'legacy_email_match' | 'deletion_token_match' | 'manual_private_proof' = 'manual_private_proof';
  let rawControlToken: string | null = null;
  let controlTokenHash: string | null = null;
  let legacyEmailForChallenge: string | null = null;

  const memRes = await pool.query(`
    SELECT email, deletion_token
    FROM public.memorials
    WHERE id = $1
    LIMIT 1;
  `, [trib.legacy_memorial_id]);

  const mem = memRes.rows[0];
  if (mem) {
    const reliableEmail = isReliableHistoricalEmail(mem.email);
    const normalizedProofEmail = (data.proofEmail || data.claimantEmail || '').trim().toLowerCase();
    const normalizedLegacyEmail = (mem.email || '').trim().toLowerCase();

    if (reliableEmail && normalizedProofEmail && normalizedProofEmail === normalizedLegacyEmail) {
      privateProofMatch = true;
      verificationMethod = 'legacy_email_match';
      rawControlToken = crypto.randomBytes(24).toString('hex');
      controlTokenHash = hashToken(rawControlToken);
      legacyEmailForChallenge = normalizedLegacyEmail;
    } else if (
      data.proofDeletionToken &&
      mem.deletion_token &&
      data.proofDeletionToken.trim().toLowerCase() === String(mem.deletion_token).trim().toLowerCase()
    ) {
      privateProofMatch = true;
      verificationMethod = 'deletion_token_match';
    }
  }

  const claimantEmailMasked = maskEmailAddress(data.claimantEmail);
  const safeNote = (data.proofNote || '').trim().slice(0, 300) || null;

  const controlTokenExpiresAt = controlTokenHash ? new Date(Date.now() + 30 * 60 * 1000) : null;

  const insertRes = await pool.query(`
    INSERT INTO public.legacy_guardian_claims (
      tribute_id, legacy_memorial_id, claimant_email_hash, claimant_email_masked,
      verification_method, private_proof_match, private_proof_note, claim_status,
      control_token_hash, control_token_expires_at, email_control_verified
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, 'pending_review',
      $8, $9, FALSE
    )
    RETURNING id, claim_status, private_proof_match, created_at;
  `, [
    trib.id,
    trib.legacy_memorial_id,
    claimantEmailHash,
    claimantEmailMasked,
    verificationMethod,
    privateProofMatch,
    safeNote,
    controlTokenHash,
    controlTokenExpiresAt,
  ]);

  return {
    ok: true as const,
    status: 201,
    claimId: insertRes.rows[0].id as string,
    claimStatus: insertRes.rows[0].claim_status as string,
    privateProofMatch: Boolean(insertRes.rows[0].private_proof_match),
    petName: trib.pet_name as string,
    rawControlToken,
    legacyEmailForChallenge,
  };
}

export async function verifyLegacyClaimEmailControl(rawToken: string) {
  const pool = getDbPool();
  if (!pool) throw Object.assign(new Error('Base de datos no disponible'), { status: 503 });

  const tokenHash = hashToken(rawToken.trim());
  const res = await pool.query(`
    UPDATE public.legacy_guardian_claims
    SET email_control_verified = TRUE,
        email_control_verified_at = timezone('utc'::text, now()),
        control_token_hash = NULL,
        control_token_expires_at = NULL
    WHERE control_token_hash = $1
      AND control_token_expires_at > timezone('utc'::text, now())
      AND claim_status = 'pending_review'
    RETURNING id, tribute_id, claim_status, email_control_verified;
  `, [tokenHash]);

  if (!res.rows[0]) {
    return { ok: false as const, status: 400, error: 'El enlace de verificación es inválido o ha caducado.' };
  }

  return {
    ok: true as const,
    status: 200,
    claimId: res.rows[0].id as string,
    claimStatus: res.rows[0].claim_status as string,
  };
}

export async function getAdminLegacyGuardianClaims(filter: string = 'all') {
  const pool = getDbPool();
  if (!pool) return [];

  const params: any[] = [];
  let whereClause = '';
  if (filter === 'pending' || filter === 'pending_review') {
    whereClause = `WHERE c.claim_status = 'pending_review'`;
  } else if (filter === 'approved') {
    whereClause = `WHERE c.claim_status = 'approved'`;
  } else if (filter === 'rejected') {
    whereClause = `WHERE c.claim_status = 'rejected'`;
  }

  const res = await pool.query(`
    SELECT c.id, c.tribute_id as "tributeId", ct.slug as "tributeSlug", ct.pet_name as "petName",
           c.claimant_email_masked as "claimantEmailMasked",
           c.verification_method as "verificationMethod",
           c.private_proof_match as "privateProofMatch",
           c.email_control_verified as "emailControlVerified",
           c.email_control_verified_at as "emailControlVerifiedAt",
           c.confirmation_sent_at as "confirmationSentAt",
           c.private_proof_note as "privateProofNote",
           c.claim_status as "claimStatus",
           c.decision_reason as "decisionReason",
           c.reviewed_by as "reviewedBy",
           c.reviewed_at as "reviewedAt",
           c.created_at as "createdAt"
    FROM public.legacy_guardian_claims c
    JOIN public.community_tributes ct ON ct.id = c.tribute_id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT 100;
  `, params);

  return res.rows;
}

export async function reviewLegacyGuardianClaim(data: {
  claimId: string;
  decision: 'approve' | 'reject';
  decisionReason: string;
  reviewedBy: string;
}) {
  const pool = getDbPool();
  if (!pool) throw Object.assign(new Error('Base de datos no disponible'), { status: 503 });

  const reason = data.decisionReason.trim();
  if (reason.length < 4) {
    return { ok: false as const, status: 400, error: 'Se requiere un motivo de decisión auditable.' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const claimRes = await client.query(`
      SELECT id, tribute_id, claimant_email_hash, claim_status, private_proof_match
      FROM public.legacy_guardian_claims
      WHERE id = $1
      FOR UPDATE;
    `, [data.claimId]);

    const claim = claimRes.rows[0];
    if (!claim) {
      await client.query('ROLLBACK');
      return { ok: false as const, status: 404, error: 'Solicitud de custodia no encontrada.' };
    }
    if (claim.claim_status !== 'pending_review') {
      await client.query('ROLLBACK');
      return { ok: false as const, status: 409, error: 'Esta solicitud ya fue resuelta anteriormente.' };
    }

    let assignedGuardianId: string | null = null;
    if (data.decision === 'approve') {
      const existingGuardian = await client.query(`
        SELECT id FROM public.tribute_guardians
        WHERE tribute_id = $1
        LIMIT 1;
      `, [claim.tribute_id]);

      if (existingGuardian.rows[0]) {
        await client.query('ROLLBACK');
        return { ok: false as const, status: 409, error: 'La colección ya tiene un guardián activo.' };
      }

      const tribAuthorRes = await client.query(`SELECT author_display_name FROM public.community_tributes WHERE id = $1 LIMIT 1;`, [claim.tribute_id]);
      const guardianName = tribAuthorRes.rows[0]?.author_display_name || 'Familia guardiana';

      const guardRes = await client.query(`
        INSERT INTO public.tribute_guardians (tribute_id, email_blind_index, guardian_name, verified_at)
        VALUES ($1, $2, $3, timezone('utc'::text, now()))
        RETURNING id;
      `, [claim.tribute_id, claim.claimant_email_hash, guardianName]);
      assignedGuardianId = guardRes.rows[0].id;
    }

    const finalStatus = data.decision === 'approve' ? 'approved' : 'rejected';
    await client.query(`
      UPDATE public.legacy_guardian_claims
      SET claim_status = $2,
          decision_reason = $3,
          reviewed_by = $4,
          reviewed_at = timezone('utc'::text, now()),
          assigned_guardian_id = $5,
          confirmation_sent_at = CASE WHEN $2 = 'approved' THEN timezone('utc'::text, now()) ELSE NULL END
      WHERE id = $1;
    `, [claim.id, finalStatus, reason, data.reviewedBy, assignedGuardianId]);

    await client.query(`
      INSERT INTO public.legacy_guardian_claim_decisions (
        claim_id, tribute_id, decision, decision_reason, reviewed_by
      )
      VALUES ($1, $2, $3, $4, $5);
    `, [claim.id, claim.tribute_id, finalStatus, reason, data.reviewedBy]);

    await client.query('COMMIT');
    return { ok: true as const, status: 200, claimStatus: finalStatus, assignedGuardianId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
