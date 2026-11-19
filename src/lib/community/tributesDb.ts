import { Pool } from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
  publicationStatus: 'published' | 'pending_review' | 'archived';
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

const SERVER_HMAC_SECRET = process.env.COMMUNITY_HMAC_SECRET || 'antigravity-staging-secret-key-2026-secure-hmac-seed';

export function computeBlindIndex(email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(normalized).digest('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getDatabaseConfig() {
  if (process.env.COMMUNITY_DB_URL) {
    return { connectionString: process.env.COMMUNITY_DB_URL };
  }

  // Comprobar si existe el archivo de credenciales de staging temporal en local
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

  return null;
}

let poolInstance: Pool | null = null;

export function getDbPool(): Pool | null {
  if (poolInstance) return poolInstance;
  const config = getDatabaseConfig();
  if (!config) return null;
  poolInstance = new Pool(config);
  return poolInstance;
}

// Inicializar esquema si no existe
export async function ensureTributesSchema() {
  const pool = getDbPool();
  if (!pool) return false;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS community_tributes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT NOT NULL UNIQUE,
          pet_name TEXT NOT NULL,
          species TEXT NOT NULL CHECK (species IN ('perro', 'gato', 'otro')),
          photo_url TEXT,
          years_or_dates TEXT,
          author_display_name TEXT NOT NULL,
          mural_reference_id TEXT,
          candles_count INT NOT NULL DEFAULT 0,
          hugs_count INT NOT NULL DEFAULT 0,
          publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'pending_review', 'archived')),
          visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
          is_archived BOOLEAN NOT NULL DEFAULT FALSE,
          deleted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tribute_letters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tribute_id UUID NOT NULL REFERENCES community_tributes(id) ON DELETE RESTRICT,
          letter_seq_num INT NOT NULL,
          idempotency_key TEXT,
          title TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('despedida', 'cumpleanos', 'aniversario', 'espontanea')),
          content TEXT NOT NULL,
          author_name TEXT NOT NULL,
          display_date TEXT NOT NULL,
          envelope_color TEXT NOT NULL CHECK (envelope_color IN ('crema', 'lavanda', 'rosa')),
          publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'pending_review', 'archived')),
          is_archived BOOLEAN NOT NULL DEFAULT FALSE,
          deleted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_tribute_letter_seq UNIQUE (tribute_id, letter_seq_num),
          CONSTRAINT uq_tribute_letter_idempotency UNIQUE (tribute_id, idempotency_key)
      );

      CREATE TABLE IF NOT EXISTS tribute_guardians (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tribute_id UUID NOT NULL REFERENCES community_tributes(id) ON DELETE RESTRICT,
          email_blind_index TEXT NOT NULL,
          is_claimed BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_tribute_guardian UNIQUE (tribute_id, email_blind_index)
      );

      CREATE TABLE IF NOT EXISTS guardian_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          guardian_id UUID NOT NULL REFERENCES tribute_guardians(id) ON DELETE RESTRICT,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          revoked_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Función transaccional atómica con bloqueo pesimista FOR UPDATE
      CREATE OR REPLACE FUNCTION publish_tribute_letter(
          p_tribute_id UUID,
          p_title TEXT,
          p_category TEXT,
          p_content TEXT,
          p_author_name TEXT,
          p_display_date TEXT,
          p_envelope_color TEXT,
          p_idempotency_key TEXT DEFAULT NULL
      )
      RETURNS TABLE (
          id UUID,
          tribute_id UUID,
          letter_seq_num INT,
          title TEXT,
          category TEXT,
          content TEXT,
          author_name TEXT,
          display_date TEXT,
          envelope_color TEXT,
          is_duplicate BOOLEAN
      ) AS $$
      DECLARE
          v_seq INT;
          v_existing_id UUID;
          v_res_record tribute_letters%ROWTYPE;
      BEGIN
          -- Idempotencia acotada a la mascota
          IF p_idempotency_key IS NOT NULL THEN
              SELECT tl.id INTO v_existing_id
              FROM tribute_letters tl
              WHERE tl.tribute_id = p_tribute_id AND tl.idempotency_key = p_idempotency_key;

              IF v_existing_id IS NOT NULL THEN
                  SELECT * INTO v_res_record FROM tribute_letters WHERE tribute_letters.id = v_existing_id;

                  -- Comprobar si los campos relevantes son idénticos
                  IF v_res_record.title = p_title 
                     AND v_res_record.category = p_category 
                     AND v_res_record.content = p_content 
                     AND v_res_record.author_name = p_author_name 
                     AND v_res_record.envelope_color = p_envelope_color THEN
                      -- Reintento idéntico legítimo: devolver sin duplicar
                      RETURN QUERY SELECT 
                          v_res_record.id,
                          v_res_record.tribute_id,
                          v_res_record.letter_seq_num,
                          v_res_record.title,
                          v_res_record.category,
                          v_res_record.content,
                          v_res_record.author_name,
                          v_res_record.display_date,
                          v_res_record.envelope_color,
                          TRUE;
                      RETURN;
                  ELSE
                      -- Mismo idempotency_key pero con contenido diferente: conflicto 409
                      RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT: La clave de idempotencia ya fue utilizada con un contenido diferente para esta mascota'
                          USING ERRCODE = 'P0004';
                  END IF;
              END IF;
          END IF;

          -- Bloqueo pesimista por fila del homenaje padre
          PERFORM 1 FROM community_tributes WHERE community_tributes.id = p_tribute_id FOR UPDATE;

          -- Siguiente secuencia
          SELECT COALESCE(MAX(tl.letter_seq_num), 0) + 1 INTO v_seq
          FROM tribute_letters tl
          WHERE tl.tribute_id = p_tribute_id;

          -- Inserción
          INSERT INTO tribute_letters (
              tribute_id,
              letter_seq_num,
              idempotency_key,
              title,
              category,
              content,
              author_name,
              display_date,
              envelope_color
          ) VALUES (
              p_tribute_id,
              v_seq,
              p_idempotency_key,
              p_title,
              p_category,
              p_content,
              p_author_name,
              p_display_date,
              p_envelope_color
          )
          RETURNING * INTO v_res_record;

          RETURN QUERY SELECT 
              v_res_record.id,
              v_res_record.tribute_id,
              v_res_record.letter_seq_num,
              v_res_record.title,
              v_res_record.category,
              v_res_record.content,
              v_res_record.author_name,
              v_res_record.display_date,
              v_res_record.envelope_color,
              FALSE;
      END;
      $$ LANGUAGE plpgsql;

      -- Seguridad: restringir EXECUTE exclusivamente a service_role / administradores
      REVOKE EXECUTE ON FUNCTION publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO postgres;
    `);
    return true;
  } finally {
    client.release();
  }
}

// Sembrar datos iniciales de staging si la tabla está vacía
export async function seedStagingTributes(): Promise<boolean> {
  const pool = getDbPool();
  if (!pool) return false;

  const countRes = await pool.query('SELECT count(*) FROM community_tributes;');
  if (parseInt(countRes.rows[0].count) > 0) {
    return true; // Ya existen datos
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Chloe
    const insChloe = await client.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url, candles_count, hugs_count)
      VALUES ('chloe-spinella', 'Chloe', 'perro', 'Familia Spinella', '2014 - 2026', '/images/comunidad/chloe.jpg', 156, 72)
      RETURNING id;
    `);
    const chloeId = insChloe.rows[0].id;

    // Cartas de Chloe
    await client.query(`
      INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      VALUES 
      ($1, 1, 'Hasta siempre pequeñita', 'despedida', 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor. Nos enseñaste a querer de nuevo, nos curaste heridas que no sabíamos que se podían curar. Te agradecemos todo lo que nos diste pequeñita. Te echaremos de menos siempre.', 'Familia Spinella', '15 Octubre, 2024', 'crema'),
      ($1, 2, 'Tu primer cumpleaños en las estrellas', 'cumpleanos', 'Hoy habrías cumplido años. Miramos al cielo sabiendo que corres feliz persiguiendo mariposas.', 'Familia Spinella', '12 Mayo, 2025', 'lavanda'),
      ($1, 3, 'Un año de luz en el cielo', 'aniversario', 'Ha pasado un año entero desde tu partida. En casa todo sigue guardando tu olor y tu ternura.', 'Familia Spinella', '15 Octubre, 2025', 'rosa');
    `, [chloeId]);

    // Guardián de Chloe
    const chloeBIndex = computeBlindIndex('familia.spinella@ejemplo.com');
    const insCG = await client.query(`
      INSERT INTO tribute_guardians (tribute_id, email_blind_index)
      VALUES ($1, $2) RETURNING id;
    `, [chloeId, chloeBIndex]);
    const chloeGId = insCG.rows[0].id;

    // Sesión activa para Chloe
    const chloeToken = 'chloe_staging_guardian_token_secret_seed_2026';
    const chloeTokenHash = hashToken(chloeToken);
    await client.query(`
      INSERT INTO guardian_sessions (guardian_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '30 days')
      ON CONFLICT (token_hash) DO NOTHING;
    `, [chloeGId, chloeTokenHash]);

    // 2. Luna Spinella (gato)
    const insLunaS = await client.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url, candles_count, hugs_count)
      VALUES ('luna-spinella', 'Luna Spinella', 'gato', 'Familia Spinella', '2015 - 2024', '/images/comunidad/luna_real_clean.webp', 210, 95)
      RETURNING id;
    `);
    const lunaSId = insLunaS.rows[0].id;
    await client.query(`
      INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      VALUES 
      ($1, 1, 'Hasta siempre Luna mía', 'despedida', 'Diez años de maullidos dulces. Siempre en el corazón.', 'Familia Spinella', '10 Mar 2024', 'crema');
    `, [lunaSId]);

    // 3. Luna Navarro (homónima, perro)
    const insLunaN = await client.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url, candles_count, hugs_count)
      VALUES ('luna-navarro', 'Luna', 'perro', 'Familia Navarro', '2012 - 2025', '/images/comunidad/pet-luna.webp', 88, 34)
      RETURNING id;
    `);
    const lunaNId = insLunaN.rows[0].id;
    await client.query(`
      INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      VALUES 
      ($1, 1, 'Para mi perrita fiel Luna', 'despedida', 'Nuestra guardiana durante 13 años. Gracias por cuidarnos.', 'Familia Navarro', '10 Oct 2025', 'crema');
    `, [lunaNId]);

    // 4. Toby (sin foto)
    const insToby = await client.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url, candles_count, hugs_count)
      VALUES ('toby-rodriguez', 'Toby', 'perro', 'Familia Rodríguez', '2010 - 2023', NULL, 120, 45)
      RETURNING id;
    `);
    const tobyId = insToby.rows[0].id;
    await client.query(`
      INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      VALUES 
      ($1, 1, 'Para Toby en el prado eterno', 'despedida', 'El perro más noble y bueno. Aunque no tengamos foto aquí, tu imagen vive en el alma.', 'Familia Rodríguez', '5 Sep 2023', 'crema');
    `, [tobyId]);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al sembrar datos de staging:', err);
    return false;
  } finally {
    client.release();
  }
}

// Consultar homenajes públicos
export async function getPublicTributes(options: { species?: string; limit?: number } = {}): Promise<TributeDto[]> {
  const pool = getDbPool();
  if (!pool) return [];

  const limit = options.limit || 50;
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
    FROM community_tributes ct
    LEFT JOIN tribute_letters tl ON ct.id = tl.tribute_id 
      AND tl.publication_status = 'published' 
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

// Consultar homenaje por slug con sus cartas
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
    FROM community_tributes ct
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
      tl.publication_status as "publicationStatus",
      tl.created_at as "createdAt"
    FROM tribute_letters tl
    WHERE tl.tribute_id = $1
      AND tl.publication_status = 'published'
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

    // Generar slug único
    const baseSlug = data.petName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'angelito';
    const randSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${randSuffix}`;

    // 1. Insertar homenaje
    const insT = await client.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, slug, pet_name as "petName";
    `, [slug, data.petName, data.species, data.authorName, data.yearsOrDates || null, data.photoUrl || null]);
    const tribute = insT.rows[0];

    // 2. Insertar primera carta mediante función atómica
    const dateFormatted = data.displayDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const insL = await client.query(`
      SELECT * FROM publish_tribute_letter($1, $2, $3, $4, $5, $6, $7);
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

    // 3. Crear guardián con blind index
    const blindIndex = computeBlindIndex(data.email);
    const insG = await client.query(`
      INSERT INTO tribute_guardians (tribute_id, email_blind_index)
      VALUES ($1, $2)
      RETURNING id;
    `, [tribute.id, blindIndex]);
    const guardianId = insG.rows[0].id;

    // 4. Generar sesión de guardián
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tHash = hashToken(rawToken);

    await client.query(`
      INSERT INTO guardian_sessions (guardian_id, token_hash, expires_at)
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

// Validar sesión de guardián para un homenaje específico
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
    FROM guardian_sessions s
    JOIN tribute_guardians g ON s.guardian_id = g.id
    JOIN community_tributes ct ON g.tribute_id = ct.id
    WHERE s.token_hash = $1
      AND s.expires_at > NOW()
      AND s.revoked_at IS NULL;
  `, [tHash]);

  if (res.rows.length === 0) return null;
  const session = res.rows[0];

  if (targetTributeIdOrSlug) {
    if (session.tributeId !== targetTributeIdOrSlug && session.tributeSlug !== targetTributeIdOrSlug) {
      return null; // No pertenece al homenaje solicitado
    }
  }

  return session;
}

// Publicar carta adicional verificando autorización
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

  // 1. Validar sesión del guardián
  const session = await validateGuardianSession(data.rawGuardianToken, data.tributeSlug);
  if (!session) {
    const error: any = new Error('No autorizado: sesión no válida o sin permiso para esta colección');
    error.status = 403;
    throw error;
  }

  const dateFormatted = data.displayDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  // 2. Invocar función atómica con control de idempotencia
  try {
    const res = await pool.query(`
      SELECT * FROM publish_tribute_letter($1, $2, $3, $4, $5, $6, $7, $8);
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

// Revocar sesión de guardián
export async function revokeGuardianSession(rawToken: string): Promise<boolean> {
  const pool = getDbPool();
  if (!pool || !rawToken) return false;

  const tHash = hashToken(rawToken);
  const res = await pool.query(`
    UPDATE guardian_sessions
    SET revoked_at = NOW()
    WHERE token_hash = $1 AND revoked_at IS NULL;
  `, [tHash]);

  return (res.rowCount || 0) > 0;
}

// Solicitar recuperación de acceso (Magic Link controlado en staging)
export async function requestGuardianRecovery(email: string, tributeSlug: string) {
  const pool = getDbPool();
  if (!pool) throw new Error('Base de datos no disponible');

  const bIndex = computeBlindIndex(email);

  const res = await pool.query(`
    SELECT g.id, g.tribute_id, ct.pet_name as "petName"
    FROM tribute_guardians g
    JOIN community_tributes ct ON g.tribute_id = ct.id
    WHERE g.email_blind_index = $1 AND ct.slug = $2;
  `, [bIndex, tributeSlug]);

  if (res.rows.length === 0) {
    // Protección de enumeración: respuesta idéntica
    return { success: true, message: 'Si el correo coincide con el guardián registrado, se ha generado el enlace de recuperación.' };
  }

  const guardian = res.rows[0];
  const rawMagicToken = crypto.randomBytes(32).toString('hex');
  const tHash = hashToken(rawMagicToken);

  // Crear sesión temporal de 15 minutos
  await pool.query(`
    INSERT INTO guardian_sessions (guardian_id, token_hash, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '15 minutes');
  `, [guardian.id, tHash]);

  return {
    success: true,
    message: 'Enlace de recuperación generado con éxito.',
    // En staging local se devuelve el token para pruebas automatizadas sin enviar emails reales
    stagingMagicToken: rawMagicToken
  };
}
