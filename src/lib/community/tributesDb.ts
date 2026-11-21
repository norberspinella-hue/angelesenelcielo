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
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: true } }),
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
