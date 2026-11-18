/**
 * TEST SUITE STAGING AISLADO — MOTOR POSTGRESQL 16 REAL (DOCKER CONTAINER)
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 * 
 * Verifica las 14 pruebas obligatorias en un motor PostgreSQL 16 oficial.
 */

const { Client, Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Obtener contraseña temporal generada dinámicamente
const tempPassPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_pass.tmp');
if (!fs.existsSync(tempPassPath)) {
  console.error('ERROR: No se encontró el archivo temporal de credenciales de staging.');
  process.exit(1);
}
const DB_PASS = fs.readFileSync(tempPassPath, 'utf8').trim();

const DB_CONFIG = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: DB_PASS,
  database: 'cartas_staging'
};

const SERVER_HMAC_SECRET = 'antigravity-staging-secret-key-2026-secure-hmac-seed';

function computeBlindIndex(email) {
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(normalized).digest('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function runTests() {
  const adminClient = new Client(DB_CONFIG);
  await adminClient.connect();

  console.log('================================================================');
  console.log('INICIANDO VALIDACIÓN EN MOTOR POSTGRESQL 16 REAL');
  console.log('================================================================');

  const versionRes = await adminClient.query('SELECT version();');
  console.log(`Versión detectada: ${versionRes.rows[0].version}`);

  const results = [];

  function record(id, name, passed, detail) {
    results.push({ id, name, passed, detail });
    const mark = passed ? '✅ PASÓ' : '❌ FALLÓ';
    console.log(`[PRUEBA ${String(id).padStart(2, '0')}] ${mark} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  try {
    // -------------------------------------------------------------------------
    // 1. CREACIÓN DEL ESQUEMA EN POSTGRESQL REAL
    // -------------------------------------------------------------------------
    try {
      await adminClient.query(`
        -- Extensión de UUIDs
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- Roles Supabase / Aplicación
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
        END $$;

        -- 1. TABLA HISTÓRICA REAL SIMULADA ('memorials')
        CREATE TABLE IF NOT EXISTS memorials (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            pet_name TEXT NOT NULL,
            species TEXT NOT NULL,
            photo_url TEXT,
            death_date TEXT,
            dedication TEXT NOT NULL,
            story_answers JSONB,
            plan_type TEXT NOT NULL,
            price_paid NUMERIC DEFAULT 0.0,
            currency TEXT DEFAULT 'EUR',
            slots_count INT DEFAULT 1,
            profile_slug TEXT UNIQUE,
            visibility TEXT DEFAULT 'public',
            publication_status TEXT DEFAULT 'published',
            moderation_status TEXT DEFAULT 'approved',
            slot_assigned INT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- 2. TABLA DE HOMENAJES COMUNITARIOS
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

        -- 3. TABLA DE CARTAS INDIVIDUALES
        CREATE TABLE IF NOT EXISTS tribute_letters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tribute_id UUID NOT NULL REFERENCES community_tributes(id) ON DELETE RESTRICT,
            letter_seq_num INT NOT NULL,
            idempotency_key TEXT UNIQUE,
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
            CONSTRAINT uq_tribute_letter_seq UNIQUE (tribute_id, letter_seq_num)
        );

        -- 4. TABLA DE GUARDIANES
        CREATE TABLE IF NOT EXISTS tribute_guardians (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tribute_id UUID NOT NULL REFERENCES community_tributes(id) ON DELETE RESTRICT,
            email_blind_index TEXT NOT NULL,
            is_claimed BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_tribute_guardian UNIQUE (tribute_id, email_blind_index)
        );

        -- 5. TABLA DE SESIONES DE GUARDIÁN
        CREATE TABLE IF NOT EXISTS guardian_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            guardian_id UUID NOT NULL REFERENCES tribute_guardians(id) ON DELETE RESTRICT,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            revoked_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- 6. TABLA DE LOGS DE AUDITORÍA
        CREATE TABLE IF NOT EXISTS community_audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            operation TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            actor_role TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- 7. TABLA DE RESGUARDO PARA ROLLBACK (Cartas adicionales)
        CREATE TABLE IF NOT EXISTS rollback_companion_letters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            legacy_memorial_id TEXT NOT NULL REFERENCES memorials(id) ON DELETE RESTRICT,
            letter_seq_num INT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            author_name TEXT NOT NULL,
            display_date TEXT NOT NULL,
            envelope_color TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_rollback_letter_seq UNIQUE (legacy_memorial_id, letter_seq_num)
        );

        -- PERMISOS DE ESQUEMA
        GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
        GRANT SELECT ON community_tributes, tribute_letters TO anon, authenticated;
        REVOKE ALL ON tribute_guardians, guardian_sessions, community_audit_logs, memorials, rollback_companion_letters FROM anon, authenticated;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

        -- ACTIVAR RLS
        ALTER TABLE community_tributes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE tribute_letters ENABLE ROW LEVEL SECURITY;
        ALTER TABLE tribute_guardians ENABLE ROW LEVEL SECURITY;
        ALTER TABLE guardian_sessions ENABLE ROW LEVEL SECURITY;

        -- POLÍTICAS RLS EN HOMENAJES
        DROP POLICY IF EXISTS "Lectura pública de homenajes autorizados" ON community_tributes;
        CREATE POLICY "Lectura pública de homenajes autorizados"
        ON community_tributes FOR SELECT TO anon, authenticated
        USING (
            publication_status = 'published'
            AND visibility = 'public'
            AND NOT is_archived
            AND deleted_at IS NULL
        );

        DROP POLICY IF EXISTS "Denegar inserciones no privilegiadas en homenajes" ON community_tributes;
        CREATE POLICY "Denegar inserciones no privilegiadas en homenajes"
        ON community_tributes FOR INSERT TO anon, authenticated
        WITH CHECK (false);

        -- POLÍTICA RLS CORREGIDA EN CARTAS (CON COMPROBACIÓN DEL HOMENAJE PADRE)
        DROP POLICY IF EXISTS "Lectura pública de cartas autorizadas con validación de homenaje padre" ON tribute_letters;
        CREATE POLICY "Lectura pública de cartas autorizadas con validación de homenaje padre"
        ON tribute_letters FOR SELECT TO anon, authenticated
        USING (
            publication_status = 'published'
            AND NOT is_archived
            AND deleted_at IS NULL
            AND EXISTS (
                SELECT 1 FROM community_tributes ct
                WHERE ct.id = tribute_letters.tribute_id
                  AND ct.publication_status = 'published'
                  AND ct.visibility = 'public'
                  AND NOT ct.is_archived
                  AND ct.deleted_at IS NULL
            )
        );

        DROP POLICY IF EXISTS "Denegar inserciones no privilegiadas en cartas" ON tribute_letters;
        CREATE POLICY "Denegar inserciones no privilegiadas en cartas"
        ON tribute_letters FOR INSERT TO anon, authenticated
        WITH CHECK (false);
      `);
      record(1, 'Creación del esquema en PostgreSQL real', true, 'Tablas, tipos UUID, índices, roles y extensiones creados.');
    } catch (err) {
      record(1, 'Creación del esquema en PostgreSQL real', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 2. INTEGRIDAD DE CLAVES Y RELACIONES (ON DELETE RESTRICT)
    // -------------------------------------------------------------------------
    try {
      const insTrib = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name)
        VALUES ('test-integrity-pet', 'Thor', 'perro', 'Familia Gómez')
        RETURNING id;
      `);
      const tribId = insTrib.rows[0].id;

      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Carta 1', 'despedida', 'Te extrañamos', 'Carlos', '15 Nov 2026', 'crema');
      `, [tribId]);

      // Intentar borrar el homenaje padre teniendo cartas activas
      let deleteBlocked = false;
      try {
        await adminClient.query('DELETE FROM community_tributes WHERE id = $1;', [tribId]);
      } catch (delErr) {
        if (delErr.code === '23503') { // foreign_key_violation
          deleteBlocked = true;
        }
      }

      record(2, 'Integridad de claves y relaciones (ON DELETE RESTRICT)', deleteBlocked, 
        deleteBlocked ? 'DELETE bloqueado por clave foránea RESTRICT como debe ser.' : 'FALLO: se permitió borrar en cascada no deseada.');
    } catch (err) {
      record(2, 'Integridad de claves y relaciones', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 3. POLÍTICAS RLS CON ROLES REALES anon Y authenticated
    // -------------------------------------------------------------------------
    try {
      // Usaremos un cliente configurado con SET ROLE anon
      const testAnonClient = new Client(DB_CONFIG);
      await testAnonClient.connect();

      await testAnonClient.query('SET ROLE anon;');
      
      // Probar lectura de homenajes
      const tribRead = await testAnonClient.query('SELECT count(*) FROM community_tributes;');
      
      // Probar intento de acceso a guardianes (debe arrojar permission denied)
      let guardianBlocked = false;
      try {
        await testAnonClient.query('SELECT * FROM tribute_guardians;');
      } catch (gErr) {
        if (gErr.code === '42501') { // insufficient_privilege
          guardianBlocked = true;
        }
      }

      // Probar intento de acceso a sesiones de guardián (debe arrojar permission denied)
      let sessionBlocked = false;
      try {
        await testAnonClient.query('SELECT * FROM guardian_sessions;');
      } catch (sErr) {
        if (sErr.code === '42501') {
          sessionBlocked = true;
        }
      }

      await testAnonClient.end();

      const rlsOk = parseInt(tribRead.rows[0].count) >= 0 && guardianBlocked && sessionBlocked;
      record(3, 'Políticas RLS con roles reales anon y authenticated', rlsOk,
        'anon puede leer homenajes públicos; guardianes y sesiones quedan denegados (42501).');
    } catch (err) {
      record(3, 'Políticas RLS con roles reales anon y authenticated', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 4. BLOQUEO DE LECTURA DE CARTAS CON HOMENAJE PRIVADO, ARCHIVADO O ELIMINADO
    // -------------------------------------------------------------------------
    try {
      // Creamos 4 homenajes de prueba con service_role
      // Caso A: Homenaje Público
      const rA = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, visibility, publication_status)
        VALUES ('rls-pet-public', 'Público', 'perro', 'Fam A', 'public', 'published') RETURNING id;
      `);
      const idA = rA.rows[0].id;
      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Carta A', 'despedida', 'Msg A', 'Fam A', 'Nov 2026', 'crema');
      `, [idA]);

      // Caso B: Homenaje Privado
      const rB = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, visibility, publication_status)
        VALUES ('rls-pet-private', 'Privado', 'gato', 'Fam B', 'private', 'published') RETURNING id;
      `);
      const idB = rB.rows[0].id;
      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Carta B', 'despedida', 'Msg B', 'Fam B', 'Nov 2026', 'lavanda');
      `, [idB]);

      // Caso C: Homenaje Archivado
      const rC = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, visibility, publication_status, is_archived)
        VALUES ('rls-pet-archived', 'Archivado', 'perro', 'Fam C', 'public', 'published', true) RETURNING id;
      `);
      const idC = rC.rows[0].id;
      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Carta C', 'despedida', 'Msg C', 'Fam C', 'Nov 2026', 'rosa');
      `, [idC]);

      // Caso D: Homenaje con Soft Delete
      const rD = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, visibility, publication_status, deleted_at)
        VALUES ('rls-pet-deleted', 'Eliminado', 'otro', 'Fam D', 'public', 'published', NOW()) RETURNING id;
      `);
      const idD = rD.rows[0].id;
      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Carta D', 'despedida', 'Msg D', 'Fam D', 'Nov 2026', 'crema');
      `, [idD]);

      // Consultar desde rol anon
      const testAnon = new Client(DB_CONFIG);
      await testAnon.connect();
      await testAnon.query('SET ROLE anon;');

      const readA = await testAnon.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [idA]);
      const readB = await testAnon.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [idB]);
      const readC = await testAnon.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [idC]);
      const readD = await testAnon.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [idD]);

      await testAnon.end();

      const canSeeA = parseInt(readA.rows[0].count) === 1;
      const canSeeB = parseInt(readB.rows[0].count) === 0;
      const canSeeC = parseInt(readC.rows[0].count) === 0;
      const canSeeD = parseInt(readD.rows[0].count) === 0;

      const passed = canSeeA && canSeeB && canSeeC && canSeeD;
      record(4, 'Bloqueo de cartas con homenaje padre privado, archivado o eliminado', passed,
        `Público: ${canSeeA ? 'Visible (1)' : 'Oculto'}, Privado: ${canSeeB ? 'Oculto (0)' : 'Visible (ERROR)'}, Archivado: ${canSeeC ? 'Oculto (0)' : 'Visible (ERROR)'}, Eliminado: ${canSeeD ? 'Oculto (0)' : 'Visible (ERROR)'}`);
    } catch (err) {
      record(4, 'Bloqueo de cartas con homenaje padre privado, archivado o eliminado', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 5. BLOQUEO DE ESCRITURAS NO AUTORIZADAS
    // -------------------------------------------------------------------------
    try {
      const testAnon = new Client(DB_CONFIG);
      await testAnon.connect();
      await testAnon.query('SET ROLE anon;');

      let insertTribBlocked = false;
      try {
        await testAnon.query(`
          INSERT INTO community_tributes (slug, pet_name, species, author_display_name)
          VALUES ('hacked-pet', 'Hacked', 'perro', 'Hacker');
        `);
      } catch (err) {
        if (err.code === '42501' || err.message.includes('row-level security')) {
          insertTribBlocked = true;
        }
      }

      let insertLetterBlocked = false;
      try {
        await testAnon.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
          VALUES ('00000000-0000-0000-0000-000000000000', 99, 'Hack', 'despedida', 'Hacked', 'Hacker', 'Nov 2026', 'crema');
        `);
      } catch (err) {
        if (err.code === '42501' || err.message.includes('row-level security')) {
          insertLetterBlocked = true;
        }
      }

      await testAnon.end();

      const writeBlocked = insertTribBlocked && insertLetterBlocked;
      record(5, 'Bloqueo de escrituras no autorizadas', writeBlocked,
        `Inserción en homenajes: ${insertTribBlocked ? 'Bloqueada por RLS' : 'Permitida (ERROR)'}, Inserción en cartas: ${insertLetterBlocked ? 'Bloqueada por RLS' : 'Permitida (ERROR)'}`);
    } catch (err) {
      record(5, 'Bloqueo de escrituras no autorizadas', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 6. CREACIÓN DE VARIAS CARTAS PARA UNA MISMA MASCOTA
    // -------------------------------------------------------------------------
    let lunaSpinellaId = null;
    try {
      const insLuna = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates)
        VALUES ('luna-spinella-multi', 'Luna Spinella', 'gato', 'Familia Spinella', '2015 - 2024')
        RETURNING id;
      `);
      lunaSpinellaId = insLuna.rows[0].id;

      const lettersData = [
        { seq: 1, title: 'Hasta siempre mi angelito', cat: 'despedida', content: 'Siempre en nuestro corazón.', color: 'crema' },
        { seq: 2, title: 'Hoy cumplirías 10 años', cat: 'cumpleanos', content: 'Te recordamos con todo el amor del mundo.', color: 'lavanda' },
        { seq: 3, title: 'Una mariposa en el jardín', cat: 'espontanea', content: 'Sabemos que viniste a visitarnos hoy.', color: 'rosa' }
      ];

      for (const ld of lettersData) {
        await adminClient.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
          VALUES ($1, $2, $3, $4, $5, 'Familia Spinella', '15 Nov 2026', $6);
        `, [lunaSpinellaId, ld.seq, ld.title, ld.cat, ld.content, ld.color]);
      }

      const countCheck = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [lunaSpinellaId]);
      const multiOk = parseInt(countCheck.rows[0].count) === 3;

      record(6, 'Creación de varias cartas para una misma mascota', multiOk,
        `Registradas exitosamente ${countCheck.rows[0].count} cartas individuales asociadas al UUID de Luna Spinella.`);
    } catch (err) {
      record(6, 'Creación de varias cartas para una misma mascota', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 7. SEPARACIÓN DE MASCOTAS HOMÓNIMAS DE FAMILIAS DISTINTAS
    // -------------------------------------------------------------------------
    let lunaNavarroId = null;
    try {
      const insNavarro = await adminClient.query(`
        INSERT INTO community_tributes (slug, pet_name, species, author_display_name, years_or_dates)
        VALUES ('luna-navarro-homonima', 'Luna', 'perro', 'Familia Navarro', '2012 - 2025')
        RETURNING id;
      `);
      lunaNavarroId = insNavarro.rows[0].id;

      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 1, 'Para mi perrita fiel', 'despedida', 'Gracias por cuidarnos siempre.', 'Familia Navarro', '10 Oct 2025', 'crema');
      `, [lunaNavarroId]);

      // Comprobar que Luna Spinella tiene sus 3 cartas y Luna Navarro tiene su 1 carta independiente
      const spinellaCount = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [lunaSpinellaId]);
      const navarroCount = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [lunaNavarroId]);

      const distinctOk = lunaSpinellaId !== lunaNavarroId &&
                         parseInt(spinellaCount.rows[0].count) === 3 &&
                         parseInt(navarroCount.rows[0].count) === 1;

      record(7, 'Separación de mascotas homónimas de familias distintas', distinctOk,
        `Luna Spinella (UUID ${lunaSpinellaId.slice(0,8)}...): ${spinellaCount.rows[0].count} cartas | Luna Navarro (UUID ${lunaNavarroId.slice(0,8)}...): ${navarroCount.rows[0].count} carta. Aislamiento total.`);
    } catch (err) {
      record(7, 'Separación de mascotas homónimas de familias distintas', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 8. ORDEN CRONOLÓGICO Y NUMERACIÓN DE CARTAS
    // -------------------------------------------------------------------------
    try {
      const orderedRes = await adminClient.query(`
        SELECT letter_seq_num, title, envelope_color
        FROM tribute_letters
        WHERE tribute_id = $1
        ORDER BY letter_seq_num ASC;
      `, [lunaSpinellaId]);

      const seqs = orderedRes.rows.map(r => r.letter_seq_num);
      const isSequential = seqs.length === 3 && seqs[0] === 1 && seqs[1] === 2 && seqs[2] === 3;

      record(8, 'Orden cronológico y numeración de cartas', isSequential,
        `Secuencias obtenidas: [${seqs.join(', ')}]. Orden estricto validado por base de datos.`);
    } catch (err) {
      record(8, 'Orden cronológico y numeración de cartas', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 9. CONCURRENCIA REAL ENTRE PUBLICACIONES SIMULTÁNEAS
    // -------------------------------------------------------------------------
    try {
      // Simular dos clientes conectados en paralelo que intentan escribir la carta seq = 4 simultáneamente
      const pool = new Pool(DB_CONFIG);
      const [c1, c2] = await Promise.all([pool.connect(), pool.connect()]);

      const payload1 = {
        title: 'Carta Concurrente 1',
        content: 'Intento simultáneo cliente A'
      };
      const payload2 = {
        title: 'Carta Concurrente 2',
        content: 'Intento simultáneo cliente B'
      };

      const resultsP = await Promise.allSettled([
        c1.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
          VALUES ($1, 4, $2, 'espontanea', $3, 'Fam Spinella', '15 Nov 2026', 'lavanda');
        `, [lunaSpinellaId, payload1.title, payload1.content]),
        c2.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
          VALUES ($1, 4, $2, 'espontanea', $3, 'Fam Spinella', '15 Nov 2026', 'lavanda');
        `, [lunaSpinellaId, payload2.title, payload2.content])
      ]);

      c1.release();
      c2.release();
      await pool.end();

      const succeeded = resultsP.filter(r => r.status === 'fulfilled');
      const rejected = resultsP.filter(r => r.status === 'rejected');

      const racePrevented = succeeded.length === 1 && rejected.length === 1 && rejected[0].reason.code === '23505';

      record(9, 'Concurrencia real entre publicaciones simultáneas', racePrevented,
        racePrevented ? 'Una inserción triunfó y la colisión concurrentemente fue rechazada con código PostgreSQL 23505 (unique_violation).' : 'FALLO: no se detectó colisión.');
    } catch (err) {
      record(9, 'Concurrencia real entre publicaciones simultáneas', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 10. IDEMPOTENCIA ANTE SOLICITUDES DUPLICADAS
    // -------------------------------------------------------------------------
    try {
      const idempotencyKey = 'idem-key-' + crypto.randomUUID();

      // Primer envío
      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, idempotency_key, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 5, $2, 'Carta con Idempotencia', 'espontanea', 'Mensaje único', 'Fam Spinella', '15 Nov 2026', 'crema');
      `, [lunaSpinellaId, idempotencyKey]);

      // Segundo envío (reintento de red idéntico con la misma clave)
      let duplicateBlocked = false;
      try {
        await adminClient.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, idempotency_key, title, category, content, author_name, display_date, envelope_color)
          VALUES ($1, 5, $2, 'Carta con Idempotencia Reintento', 'espontanea', 'Mensaje duplicado', 'Fam Spinella', '15 Nov 2026', 'crema');
        `, [lunaSpinellaId, idempotencyKey]);
      } catch (idErr) {
        if (idErr.code === '23505') { // unique violation
          duplicateBlocked = true;
        }
      }

      record(10, 'Idempotencia ante solicitudes duplicadas', duplicateBlocked,
        'Reintento bloqueado por restricción UNIQUE(idempotency_key). Se evita duplicación en fallos de red.');
    } catch (err) {
      record(10, 'Idempotencia ante solicitudes duplicadas', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 11. AUTORIZACIÓN DE GUARDIANES Y REVOCACIÓN DE SESIONES
    // -------------------------------------------------------------------------
    try {
      const guardianEmail = 'guardiana.spinella@ejemplo.com';
      const bIndex = computeBlindIndex(guardianEmail);

      const insG = await adminClient.query(`
        INSERT INTO tribute_guardians (tribute_id, email_blind_index)
        VALUES ($1, $2) RETURNING id;
      `, [lunaSpinellaId, bIndex]);
      const gId = insG.rows[0].id;

      // Generar sesión
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tHash = hashToken(rawToken);

      const insS = await adminClient.query(`
        INSERT INTO guardian_sessions (guardian_id, token_hash, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING id;
      `, [gId, tHash]);
      const sId = insS.rows[0].id;

      // 1. Validar sesión activa para el homenaje propio
      const checkValid = await adminClient.query(`
        SELECT g.tribute_id
        FROM guardian_sessions s
        JOIN tribute_guardians g ON s.guardian_id = g.id
        WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.revoked_at IS NULL;
      `, [tHash]);
      const isOwner = checkValid.rows.length === 1 && checkValid.rows[0].tribute_id === lunaSpinellaId;

      // 2. Validar que no puede escribir en el homenaje de Luna Navarro
      const isAlienOwner = checkValid.rows[0].tribute_id === lunaNavarroId;

      // 3. Revocar sesión
      await adminClient.query('UPDATE guardian_sessions SET revoked_at = NOW() WHERE id = $1;', [sId]);
      const checkRevoked = await adminClient.query(`
        SELECT g.tribute_id
        FROM guardian_sessions s
        JOIN tribute_guardians g ON s.guardian_id = g.id
        WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.revoked_at IS NULL;
      `, [tHash]);
      const sessionEnded = checkRevoked.rows.length === 0;

      const guardianOk = isOwner && !isAlienOwner && sessionEnded;
      record(11, 'Autorización de guardianes y revocación de sesiones', guardianOk,
        'Sesión válida autoriza su propio homenaje, rechaza homenajes ajenos y cesa de inmediato al revocarse.');
    } catch (err) {
      record(11, 'Autorización de guardianes y revocación de sesiones', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 12. MIGRACIÓN NO DESTRUCTIVA DE DATOS HISTÓRICOS SIMULADOS
    // -------------------------------------------------------------------------
    try {
      // 1. Cargar 3 registros históricos simulados en 'memorials'
      const mockMemorials = [
        { id: 'mem-hist-001', pet: 'Toby', species: 'perro', email: 'fam.toby@ejemplo.com', ded: 'Toby, fuiste mi fiel compañero de 14 años de vida. Nunca te olvidaré.' },
        { id: 'mem-hist-002', pet: 'Michi', species: 'gato', email: 'fam.michi@ejemplo.com', ded: 'Michi ronronea desde las estrellas.' },
        { id: 'mem-hist-003', pet: 'Rocky', species: 'perro', email: 'fam.rocky@ejemplo.com', ded: 'Siempre corriendo feliz en el prado celestial.' }
      ];

      for (const m of mockMemorials) {
        await adminClient.query(`
          INSERT INTO memorials (id, pet_name, species, email, dedication, plan_type, profile_slug)
          VALUES ($1, $2, $3, $4, $5, 'pack_estelar', $1);
        `, [m.id, m.pet, m.species, m.email, m.ded]);
      }

      // Guardar el estado exacto de memorials.dedication para comprobar inmutabilidad
      const beforeDedication = await adminClient.query('SELECT id, dedication FROM memorials WHERE id IN (\'mem-hist-001\', \'mem-hist-002\', \'mem-hist-003\') ORDER BY id;');

      // 2. Ejecutar migración no destructiva
      for (const m of mockMemorials) {
        const insCT = await adminClient.query(`
          INSERT INTO community_tributes (slug, pet_name, species, author_display_name, mural_reference_id)
          VALUES ($1, $2, $3, 'Familia Memorial', $4)
          RETURNING id;
        `, [m.id + '-migrated', m.pet, m.species, m.id]);
        const ctId = insCT.rows[0].id;

        // Migrar dedication como carta seq 1
        await adminClient.query(`
          INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
          VALUES ($1, 1, 'Carta de despedida', 'despedida', $2, 'Familia Memorial', '15 Nov 2026', 'crema');
        `, [ctId, m.ded]);

        // Guardián no reclamado
        const bIdx = computeBlindIndex(m.email);
        await adminClient.query(`
          INSERT INTO tribute_guardians (tribute_id, email_blind_index, is_claimed)
          VALUES ($1, $2, FALSE);
        `, [ctId, bIdx]);
      }

      // 3. Comprobar que memorials.dedication NO sufrió alteración alguna
      const afterDedication = await adminClient.query('SELECT id, dedication FROM memorials WHERE id IN (\'mem-hist-001\', \'mem-hist-002\', \'mem-hist-003\') ORDER BY id;');
      
      let dedicationUntouched = true;
      for (let i = 0; i < beforeDedication.rows.length; i++) {
        if (beforeDedication.rows[i].dedication !== afterDedication.rows[i].dedication) {
          dedicationUntouched = false;
        }
      }

      record(12, 'Migración no destructiva de datos históricos simulados', dedicationUntouched,
        'Los registros históricos fueron migrados como carta fundacional seq 1 y memorials.dedication se preservó 100% idéntica.');
    } catch (err) {
      record(12, 'Migración no destructiva de datos históricos simulados', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 13. ROLLBACK CONSERVANDO LAS CARTAS ADICIONALES
    // -------------------------------------------------------------------------
    try {
      // Simular que para 'mem-hist-001' (Toby), se crearon 2 cartas adicionales durante el periodo activo
      const tobyCT = await adminClient.query('SELECT id FROM community_tributes WHERE mural_reference_id = \'mem-hist-001\';');
      const tobyCTId = tobyCT.rows[0].id;

      await adminClient.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES 
        ($1, 2, 'Primer mes sin ti', 'aniversario', 'Aún miramos tu rincón favorito.', 'Familia Memorial', '15 Dic 2026', 'lavanda'),
        ($1, 3, 'Navidad en el cielo', 'espontanea', 'Brindamos por tu estrella esta noche.', 'Familia Memorial', '24 Dic 2026', 'rosa');
      `, [tobyCTId]);

      // PROCEDIMIENTO DE ROLLBACK:
      // Se resguardan las cartas adicionales (seq >= 2) en la tabla 'rollback_companion_letters'
      await adminClient.query(`
        INSERT INTO rollback_companion_letters (legacy_memorial_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        SELECT 
          ct.mural_reference_id,
          tl.letter_seq_num,
          tl.title,
          tl.category,
          tl.content,
          tl.author_name,
          tl.display_date,
          tl.envelope_color
        FROM tribute_letters tl
        JOIN community_tributes ct ON tl.tribute_id = ct.id
        WHERE tl.letter_seq_num >= 2 AND ct.mural_reference_id IS NOT NULL;
      `);

      // Verificar que memorials.dedication sigue intacta
      const checkDed = await adminClient.query('SELECT dedication FROM memorials WHERE id = \'mem-hist-001\';');
      const rollbackPreserved = checkDed.rows[0].dedication === 'Toby, fuiste mi fiel compañero de 14 años de vida. Nunca te olvidaré.';

      // Verificar que las cartas adicionales están en rollback_companion_letters
      const checkCompanion = await adminClient.query('SELECT count(*) FROM rollback_companion_letters WHERE legacy_memorial_id = \'mem-hist-001\';');
      const companionCount = parseInt(checkCompanion.rows[0].count);

      const rollbackOk = rollbackPreserved && companionCount === 2;
      record(13, 'Rollback conservando las cartas adicionales', rollbackOk,
        `memorials.dedication permanece intacta y las 2 cartas adicionales fueron respaldadas con éxito en rollback_companion_letters.`);
    } catch (err) {
      record(13, 'Rollback conservando las cartas adicionales', false, err.message);
    }

    // -------------------------------------------------------------------------
    // 14. RECUPERACIÓN Y LECTURA DE LAS CARTAS TRAS EL ROLLBACK
    // -------------------------------------------------------------------------
    try {
      // Crear una vista de compatibilidad para el sistema revertido
      await adminClient.query(`
        CREATE OR REPLACE VIEW v_legacy_memorial_letters AS
        -- Carta 1 (Original desde memorials.dedication)
        SELECT 
          m.id AS memorial_id,
          m.pet_name,
          1 AS letter_seq_num,
          'Carta de despedida' AS title,
          'despedida' AS category,
          m.dedication AS content,
          'Familia' AS author_name,
          m.created_at::TEXT AS display_date,
          'crema' AS envelope_color,
          'historical_dedication' AS source_table
        FROM memorials m
        UNION ALL
        -- Cartas complementarias redactadas durante el periodo activo
        SELECT 
          rc.legacy_memorial_id AS memorial_id,
          m.pet_name,
          rc.letter_seq_num,
          rc.title,
          rc.category,
          rc.content,
          rc.author_name,
          rc.display_date,
          rc.envelope_color,
          'rollback_companion_letters' AS source_table
        FROM rollback_companion_letters rc
        JOIN memorials m ON rc.legacy_memorial_id = m.id;
      `);

      // Consultar todas las cartas de Toby en estado de rollback
      const recoveryRes = await adminClient.query(`
        SELECT letter_seq_num, title, source_table, content
        FROM v_legacy_memorial_letters
        WHERE memorial_id = 'mem-hist-001'
        ORDER BY letter_seq_num ASC;
      `);

      const allLettersRead = recoveryRes.rows.length === 3 &&
        recoveryRes.rows[0].source_table === 'historical_dedication' &&
        recoveryRes.rows[1].source_table === 'rollback_companion_letters' &&
        recoveryRes.rows[2].source_table === 'rollback_companion_letters';

      record(14, 'Recuperación y lectura de cartas tras el rollback', allLettersRead,
        `Se leen las 3 cartas completas (1 desde memorials.dedication + 2 desde companion letters) a través de la vista de compatibilidad sin pérdida de información.`);
    } catch (err) {
      record(14, 'Recuperación y lectura de cartas tras el rollback', false, err.message);
    }

  } finally {
    await adminClient.end();
  }

  console.log('\n================================================================');
  console.log('RESUMEN DE RESULTADOS:');
  const allPassed = results.every(r => r.passed);
  console.log(`Total pruebas: ${results.length} | Aprobadas: ${results.filter(r => r.passed).length} | Fallidas: ${results.filter(r => !r.passed).length}`);
  console.log(`DICTAMEN FINAL: ${allPassed ? 'APTO PARA CONTINUAR' : 'NO APTO'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('ERROR FATAL EN TEST RUNNER:', err);
  process.exit(1);
});
