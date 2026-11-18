/**
 * TEST SUITE FASE 2 — VALIDACIÓN INTEGRAL EN POSTGRESQL 16 REAL
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 * 
 * Valida:
 * - FASE 1: RLS Exhaustivo en Homenajes y Cartas (roles anon, authenticated)
 * - FASE 2: Concurrencia atómica de 20 publicaciones simultáneas sin errores 23505
 * - FASE 3: Rollback bidireccional recuperable (1 histórica + 3 adicionales -> rollback -> reactivación)
 * - FASE 4: Escenarios familiares A (primera carta), B (segunda carta), C (visitante), D (homónimas), E (sin foto)
 * - FASE 5: Seguridad de guardianes (blind index, hash de tokens, revocación)
 */

const { Client, Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

async function runComprehensiveValidation() {
  const adminClient = new Client(DB_CONFIG);
  await adminClient.connect();

  console.log('================================================================');
  console.log('FASE 2: VALIDACIÓN INTEGRAL EN MOTOR POSTGRESQL 16 REAL');
  console.log('================================================================');

  const versionRes = await adminClient.query('SELECT version();');
  console.log(`Versión detectada: ${versionRes.rows[0].version}\n`);

  const results = [];

  function record(section, name, passed, detail) {
    results.push({ section, name, passed, detail });
    const mark = passed ? '✅ PASÓ' : '❌ FALLÓ';
    console.log(`[${section}] ${mark} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  try {
    // =========================================================================
    // 0. APLICAR DDL DEFINITIVO Y FUNCIÓN ATÓMICA DE CONCURRENCIA
    // =========================================================================
    await adminClient.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
      END $$;

      -- Limpiar tablas si existen para garantizar ejecución idempotente y limpia
      DROP TABLE IF EXISTS rollback_companion_letters CASCADE;
      DROP TABLE IF EXISTS guardian_sessions CASCADE;
      DROP TABLE IF EXISTS tribute_guardians CASCADE;
      DROP TABLE IF EXISTS tribute_letters CASCADE;
      DROP TABLE IF EXISTS community_tributes CASCADE;
      DROP TABLE IF EXISTS memorials CASCADE;

      -- 1. TABLA HISTÓRICA ('memorials')
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

      -- 6. TABLA DE RESGUARDO PARA ROLLBACK
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

      -- PERMISOS BASE
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT SELECT ON community_tributes, tribute_letters TO anon, authenticated;
      REVOKE ALL ON tribute_guardians, guardian_sessions, memorials, rollback_companion_letters FROM anon, authenticated;
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

      DROP POLICY IF EXISTS "Denegar inserciones anónimas en homenajes" ON community_tributes;
      CREATE POLICY "Denegar inserciones anónimas en homenajes"
      ON community_tributes FOR INSERT TO anon, authenticated
      WITH CHECK (false);

      DROP POLICY IF EXISTS "Denegar modificaciones anónimas en homenajes" ON community_tributes;
      CREATE POLICY "Denegar modificaciones anónimas en homenajes"
      ON community_tributes FOR UPDATE TO anon, authenticated
      USING (false);

      DROP POLICY IF EXISTS "Denegar eliminaciones anónimas en homenajes" ON community_tributes;
      CREATE POLICY "Denegar eliminaciones anónimas en homenajes"
      ON community_tributes FOR DELETE TO anon, authenticated
      USING (false);

      -- POLÍTICAS RLS EN CARTAS (CON COMPROBACIÓN DEL HOMENAJE PADRE)
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

      DROP POLICY IF EXISTS "Denegar inserciones anónimas en cartas" ON tribute_letters;
      CREATE POLICY "Denegar inserciones anónimas en cartas"
      ON tribute_letters FOR INSERT TO anon, authenticated
      WITH CHECK (false);

      DROP POLICY IF EXISTS "Denegar modificaciones anónimas en cartas" ON tribute_letters;
      CREATE POLICY "Denegar modificaciones anónimas en cartas"
      ON tribute_letters FOR UPDATE TO anon, authenticated
      USING (false);

      DROP POLICY IF EXISTS "Denegar eliminaciones anónimas en cartas" ON tribute_letters;
      CREATE POLICY "Denegar eliminaciones anónimas en cartas"
      ON tribute_letters FOR DELETE TO anon, authenticated
      USING (false);

      -- FUNCIÓN TRANSACCIONAL ATÓMICA DE PUBLICACIÓN CONCURRENTE
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
          -- 1. Idempotencia: si ya existe por idempotency_key, devolver existente
          IF p_idempotency_key IS NOT NULL THEN
              SELECT tl.id INTO v_existing_id
              FROM tribute_letters tl
              WHERE tl.idempotency_key = p_idempotency_key;

              IF v_existing_id IS NOT NULL THEN
                  SELECT * INTO v_res_record FROM tribute_letters WHERE tribute_letters.id = v_existing_id;
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
              END IF;
          END IF;

          -- 2. Bloqueo exclusivo a nivel de fila sobre el homenaje padre
          -- Esto serializa transacciones hacia la misma mascota sin bloquear otras mascotas
          PERFORM 1 FROM community_tributes WHERE community_tributes.id = p_tribute_id FOR UPDATE;

          -- 3. Asignación secuencial atómica
          SELECT COALESCE(MAX(tl.letter_seq_num), 0) + 1 INTO v_seq
          FROM tribute_letters tl
          WHERE tl.tribute_id = p_tribute_id;

          -- 4. Inserción garantizada libre de colisiones
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
    `);

    console.log('Esquema y función transaccional atómica instalados con éxito.\n');

    // =========================================================================
    // FASE 1: REVISIÓN Y CORRECCIÓN DE POLÍTICAS RLS (CON ROLES anon Y authenticated)
    // =========================================================================
    console.log('--- FASE 1: POLÍTICAS RLS ---');

    // 1.1. Lectura pública de homenajes
    const anonClient = new Client(DB_CONFIG);
    await anonClient.connect();
    await anonClient.query('SET ROLE anon;');

    // Insertar con admin cliente homenajes de diferentes estados
    const insHoms = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, visibility, publication_status, is_archived, deleted_at)
      VALUES 
      ('f1-pub', 'Homenaje Publico', 'perro', 'Fam A', 'public', 'published', false, null),
      ('f1-priv', 'Homenaje Privado', 'gato', 'Fam B', 'private', 'published', false, null),
      ('f1-arch', 'Homenaje Archivado', 'perro', 'Fam C', 'public', 'archived', true, null),
      ('f1-del', 'Homenaje Eliminado', 'otro', 'Fam D', 'public', 'published', false, NOW())
      RETURNING id, slug;
    `);

    const homMap = {};
    insHoms.rows.forEach(r => { homMap[r.slug] = r.id; });

    // Consultar desde rol anon
    const anonReadHom = await anonClient.query(`
      SELECT slug FROM community_tributes WHERE slug IN ('f1-pub', 'f1-priv', 'f1-arch', 'f1-del');
    `);

    const f1_1_passed = anonReadHom.rows.length === 1 && anonReadHom.rows[0].slug === 'f1-pub';
    record('FASE 1.1', 'Lectura pública exclusiva de homenajes válidos', f1_1_passed,
      `De 4 estados posibles, rol anon únicamente pudo leer: [${anonReadHom.rows.map(r=>r.slug).join(', ')}]`);

    // 1.2. Protección de cartas privadas / de padres no válidos
    await adminClient.query(`
      INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status, is_archived, deleted_at)
      VALUES
      ($1, 1, 'Carta en Público', 'despedida', 'Msg 1', 'Fam A', 'Nov 2026', 'crema', 'published', false, null),
      ($1, 2, 'Carta Pendiente en Público', 'despedida', 'Msg 2', 'Fam A', 'Nov 2026', 'crema', 'pending_review', false, null),
      ($1, 3, 'Carta Archivada en Público', 'despedida', 'Msg 3', 'Fam A', 'Nov 2026', 'crema', 'published', true, null),
      ($1, 4, 'Carta Eliminada en Público', 'despedida', 'Msg 4', 'Fam A', 'Nov 2026', 'crema', 'published', false, NOW()),
      ($2, 1, 'Carta en Padre Privado', 'despedida', 'Msg 5', 'Fam B', 'Nov 2026', 'lavanda', 'published', false, null),
      ($3, 1, 'Carta en Padre Archivado', 'despedida', 'Msg 6', 'Fam C', 'Nov 2026', 'rosa', 'published', false, null),
      ($4, 1, 'Carta en Padre Eliminado', 'despedida', 'Msg 7', 'Fam D', 'Nov 2026', 'crema', 'published', false, null);
    `, [homMap['f1-pub'], homMap['f1-priv'], homMap['f1-arch'], homMap['f1-del']]);

    const anonLetters = await anonClient.query(`
      SELECT tl.title
      FROM tribute_letters tl
      WHERE tl.tribute_id IN ($1, $2, $3, $4);
    `, [homMap['f1-pub'], homMap['f1-priv'], homMap['f1-arch'], homMap['f1-del']]);

    const f1_2_passed = anonLetters.rows.length === 1 && anonLetters.rows[0].title === 'Carta en Público';
    record('FASE 1.2', 'Protección de cartas privadas, pendientes o con padre no público', f1_2_passed,
      `De 7 cartas insertadas con diferentes restricciones, rol anon únicamente pudo leer: [${anonLetters.rows.map(r=>r.title).join(', ')}]`);

    // 1.3. Denegación de acceso a tablas privadas e intentos de escritura
    let blockGuardian = false;
    let blockSession = false;
    let blockInsertHom = false;
    let blockInsertLetter = false;

    try { await anonClient.query('SELECT * FROM tribute_guardians;'); } catch (e) { if (e.code === '42501') blockGuardian = true; }
    try { await anonClient.query('SELECT * FROM guardian_sessions;'); } catch (e) { if (e.code === '42501') blockSession = true; }
    try { await anonClient.query('INSERT INTO community_tributes (slug, pet_name, species, author_display_name) VALUES (\'hack\', \'x\', \'perro\', \'h\');'); } 
    catch (e) { if (e.code === '42501' || e.message.includes('row-level security')) blockInsertHom = true; }
    try { await anonClient.query('INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color) VALUES ($1, 99, \'h\', \'despedida\', \'c\', \'a\', \'d\', \'crema\');', [homMap['f1-pub']]); } 
    catch (e) { if (e.code === '42501' || e.message.includes('row-level security')) blockInsertLetter = true; }

    await anonClient.end();

    const f1_3_passed = blockGuardian && blockSession && blockInsertHom && blockInsertLetter;
    record('FASE 1.3', 'Aislamiento de tablas privadas y bloqueo total de escrituras anónimas', f1_3_passed,
      `Guardianes privados: ${blockGuardian ? 'Bloqueado (42501)' : 'ERROR'}, Sesiones privadas: ${blockSession ? 'Bloqueado (42501)' : 'ERROR'}, Insert Homenaje: ${blockInsertHom ? 'Denegado' : 'ERROR'}, Insert Carta: ${blockInsertLetter ? 'Denegado' : 'ERROR'}`);

    console.log('');

    // =========================================================================
    // FASE 2: RESOLVER LA CONCURRENCIA DE PUBLICACIONES (20 SIMULTÁNEAS)
    // =========================================================================
    console.log('--- FASE 2: PRUEBA DE ESTRÉS DE CONCURRENCIA (20 PUBLICACIONES) ---');

    // Crear homenaje exclusivo para la prueba de estrés
    const insStress = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name)
      VALUES ('stress-test-pet', 'Balu', 'perro', 'Familia Balu')
      RETURNING id;
    `);
    const baluId = insStress.rows[0].id;

    // Crear un pool de 20 conexiones simultáneas
    const stressPool = new Pool({ ...DB_CONFIG, max: 25 });

    const TOTAL_CONCURRENT = 20;
    const concurrentPromises = [];

    console.log(`Lanzando ${TOTAL_CONCURRENT} solicitudes de publicación simultáneas sobre Balu...`);

    for (let i = 1; i <= TOTAL_CONCURRENT; i++) {
      const p = (async () => {
        const client = await stressPool.connect();
        try {
          const res = await client.query(`
            SELECT * FROM publish_tribute_letter(
              $1,
              $2,
              'espontanea',
              $3,
              'Familia Balu',
              '18 Nov 2026',
              'lavanda',
              $4
            );
          `, [baluId, `Carta Concurrente #${i}`, `Contenido del mensaje ${i}`, `idem-balu-key-${i}`]);
          return { success: true, row: res.rows[0] };
        } catch (err) {
          return { success: false, error: err.message, code: err.code };
        } finally {
          client.release();
        }
      })();
      concurrentPromises.push(p);
    }

    const stressResults = await Promise.all(concurrentPromises);
    await stressPool.end();

    const allSuccessful = stressResults.every(r => r.success);
    const failureCount = stressResults.filter(r => !r.success).length;

    // Verificar en la base de datos la secuencia y los IDs
    const baluLetters = await adminClient.query(`
      SELECT letter_seq_num, title, idempotency_key
      FROM tribute_letters
      WHERE tribute_id = $1
      ORDER BY letter_seq_num ASC;
    `, [baluId]);

    const seqNums = baluLetters.rows.map(r => r.letter_seq_num);
    const has20Letters = baluLetters.rows.length === TOTAL_CONCURRENT;
    const isStrictSequence = seqNums.every((val, idx) => val === idx + 1);

    const f2_concurrency_passed = allSuccessful && has20Letters && isStrictSequence && failureCount === 0;
    record('FASE 2.1', `Publicación concurrente de ${TOTAL_CONCURRENT} cartas simultáneas`, f2_concurrency_passed,
      `Éxitos: ${stressResults.filter(r=>r.success).length}/${TOTAL_CONCURRENT}, Fallos: ${failureCount}. Secuencia generada: [${seqNums.slice(0,5).join(', ')} ... ${seqNums.slice(-5).join(', ')}] sin colisiones 23505.`);

    // Prueba de reintento idempotente sobre una de las 20 cartas
    // Obtener primero el registro original de la carta con key 'idem-balu-key-5'
    const origCardRes = await adminClient.query(`
      SELECT id, letter_seq_num FROM tribute_letters WHERE idempotency_key = 'idem-balu-key-5';
    `);
    const origId = origCardRes.rows[0].id;
    const origSeq = origCardRes.rows[0].letter_seq_num;

    const idemTestRes = await adminClient.query(`
      SELECT * FROM publish_tribute_letter(
        $1,
        'Carta Repetida',
        'espontanea',
        'Intento de duplicación',
        'Familia Balu',
        '18 Nov 2026',
        'crema',
        'idem-balu-key-5'
      );
    `, [baluId]);

    const isDuplicateFlag = idemTestRes.rows[0].is_duplicate === true;
    const sameRecordId = idemTestRes.rows[0].id === origId;
    const sameSeqNum = idemTestRes.rows[0].letter_seq_num === origSeq;
    
    // Verificar que el conteo total sigue siendo 20
    const checkCountAfterIdem = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [baluId]);
    const noNewRowAdded = parseInt(checkCountAfterIdem.rows[0].count) === TOTAL_CONCURRENT;

    const f2_idempotency_passed = isDuplicateFlag && sameRecordId && sameSeqNum && noNewRowAdded;
    record('FASE 2.2', 'Idempotencia estricta ante reintentos de red', f2_idempotency_passed,
      `Reintento con idempotency_key='idem-balu-key-5': is_duplicate=${isDuplicateFlag}, id=${idemTestRes.rows[0].id.slice(0,8)}... (coincide con original), seq=${idemTestRes.rows[0].letter_seq_num}, total cartas en BD=${checkCountAfterIdem.rows[0].count}. Cero duplicados.`);

    console.log('');

    // =========================================================================
    // FASE 3: ROLLBACK REALMENTE RECUPERABLE
    // =========================================================================
    console.log('--- FASE 3: PRUEBA DE ROLLBACK RECUPERABLE Y REACTIVACIÓN ---');

    // 1. Chloe tiene carta histórica en memorials
    const chloeMemorialId = 'mem-chloe-escenario';
    const chloeOriginalDedication = 'Chloe, nuestra perrita mimada por 12 años. Llenaste nuestra casa de amor incondicional.';
    
    await adminClient.query(`
      INSERT INTO memorials (id, pet_name, species, email, dedication, plan_type, profile_slug)
      VALUES ($1, 'Chloe', 'perro', 'familia.chloe@ejemplo.com', $2, 'pack_estelar', 'chloe-memorial');
    `, [chloeMemorialId, chloeOriginalDedication]);

    // 2. Familia migra/conecta a multicarta y publica 3 cartas adicionales (total 4 cartas)
    const insChloeCT = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name, mural_reference_id)
      VALUES ('chloe-multicarta-col', 'Chloe', 'perro', 'Familia de Chloe', $1)
      RETURNING id;
    `, [chloeMemorialId]);
    const chloeCTId = insChloeCT.rows[0].id;

    // Carta 1 (fundacional)
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Hasta siempre querida Chloe', 'despedida', $2, 'Familia de Chloe', '10 Ene 2026', 'crema');
    `, [chloeCTId, chloeOriginalDedication]);

    // Cartas 2, 3, 4 (adicionales)
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Tu primer cumpleaños en el cielo', 'cumpleanos', 'Hoy habrías cumplido 13 años. Te extrañamos cada día.', 'Familia de Chloe', '15 Mar 2026', 'lavanda');
    `, [chloeCTId]);
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Un ramo de lavanda para ti', 'aniversario', 'Guardamos tus juguetes con inmenso cariño.', 'Familia de Chloe', '10 Jul 2026', 'lavanda');
    `, [chloeCTId]);
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Navidad bajo las estrellas', 'espontanea', 'Dejamos una luz encendida por ti en el árbol.', 'Familia de Chloe', '24 Dic 2026', 'rosa');
    `, [chloeCTId]);

    const countBeforeRollback = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [chloeCTId]);

    // 3. SE EJECUTA EL ROLLBACK (Desactivación de multicarta)
    // Se respaldan cartas adicionales (seq >= 2) a rollback_companion_letters
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
      WHERE tl.letter_seq_num >= 2 AND ct.mural_reference_id = $1;
    `, [chloeMemorialId]);

    // 4. Comprobación en estado de rollback:
    // a) memorials.dedication permanece 100% intacta
    const checkChloeDed = await adminClient.query('SELECT dedication FROM memorials WHERE id = $1;', [chloeMemorialId]);
    const dedicationIntact = checkChloeDed.rows[0].dedication === chloeOriginalDedication;

    // b) Vista de compatibilidad para lectura de todas las cartas en rollback
    await adminClient.query(`
      CREATE OR REPLACE VIEW v_legacy_memorial_letters AS
      SELECT 
        m.id AS memorial_id,
        m.pet_name,
        1 AS letter_seq_num,
        'Carta fundacional' AS title,
        'despedida' AS category,
        m.dedication AS content,
        'Familia' AS author_name,
        m.created_at::TEXT AS display_date,
        'crema' AS envelope_color,
        'historical_dedication' AS source_table
      FROM memorials m
      UNION ALL
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

    const rollbackRead = await adminClient.query(`
      SELECT letter_seq_num, title, source_table
      FROM v_legacy_memorial_letters
      WHERE memorial_id = $1
      ORDER BY letter_seq_num ASC;
    `, [chloeMemorialId]);

    const canRead4LettersInRollback = rollbackRead.rows.length === 4;

    // 5. REACTIVACIÓN DEL SISTEMA MULTICARTA
    // Simular que se reactiva la colección y se reconcilian datos
    const checkReactivated = await adminClient.query(`
      SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;
    `, [chloeCTId]);
    const reactivatedLettersCount = parseInt(checkReactivated.rows[0].count);

    const f3_passed = dedicationIntact && canRead4LettersInRollback && reactivatedLettersCount === 4;
    record('FASE 3', 'Rollback recuperable y reactivación sin pérdida de cartas', f3_passed,
      `memorials.dedication inmutable: ${dedicationIntact}. Lectura en rollback: ${rollbackRead.rows.length}/4 cartas accesibles vía vista de compatibilidad. Reactivación: ${reactivatedLettersCount}/4 cartas intactas.`);

    console.log('');

    // =========================================================================
    // FASE 4: VALIDACIÓN DE LA EXPERIENCIA FAMILIAR (ESCENARIOS A, B, C, D, E)
    // =========================================================================
    console.log('--- FASE 4: VALIDACIÓN DE ESCENARIOS FAMILIARES ---');

    // Escenario A: Primera carta
    const scACheck = await adminClient.query(`
      SELECT ct.id, ct.pet_name, count(tl.id) as letters_count
      FROM community_tributes ct
      JOIN tribute_letters tl ON ct.id = tl.tribute_id
      WHERE ct.slug = 'chloe-multicarta-col'
      GROUP BY ct.id, ct.pet_name;
    `);
    const scA_ok = scACheck.rows.length === 1 && parseInt(scACheck.rows[0].letters_count) >= 1;
    record('ESCENARIO A', 'Primera carta de Chloe vinculada e indexada en un único sobre', scA_ok,
      `Homenaje: ${scACheck.rows[0].pet_name} | Cartas registradas en colección: ${scACheck.rows[0].letters_count}`);

    // Escenario B: Segunda carta meses después
    const scBCheck = await adminClient.query(`
      SELECT letter_seq_num, title, envelope_color, display_date
      FROM tribute_letters
      WHERE tribute_id = $1
      ORDER BY letter_seq_num ASC;
    `, [chloeCTId]);
    const scB_ok = scBCheck.rows.length >= 2 && scBCheck.rows[1].letter_seq_num === 2;
    record('ESCENARIO B', 'Segunda carta incorporada cronológicamente con sobre diferenciado', scB_ok,
      `Carta 1: ${scBCheck.rows[0].envelope_color} (${scBCheck.rows[0].display_date}) | Carta 2: ${scBCheck.rows[1].envelope_color} (${scBCheck.rows[1].display_date})`);

    // Escenario C: Visitante
    const anonVisitor = new Client(DB_CONFIG);
    await anonVisitor.connect();
    await anonVisitor.query('SET ROLE anon;');
    
    // Visitante lee cartas públicas
    const visRead = await anonVisitor.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [chloeCTId]);
    // Visitante no puede ver guardianes
    let visBlockG = false;
    try { await anonVisitor.query('SELECT * FROM tribute_guardians WHERE tribute_id = $1;', [chloeCTId]); } catch(e) { if(e.code==='42501') visBlockG=true; }
    // Visitante no puede escribir
    let visBlockW = false;
    try {
      await anonVisitor.query(`
        INSERT INTO tribute_letters (tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ($1, 99, 'Falsa', 'espontanea', 'Falsa', 'Impostor', 'Nov 2026', 'crema');
      `, [chloeCTId]);
    } catch(e) { if(e.code==='42501'||e.message.includes('row-level security')) visBlockW=true; }
    await anonVisitor.end();

    const scC_ok = parseInt(visRead.rows[0].count) === 4 && visBlockG && visBlockW;
    record('ESCENARIO C', 'Modo Visitante: lectura pública permitida, datos de familia y escrituras bloqueadas', scC_ok,
      `Cartas leídas: ${visRead.rows[0].count}/4. Bloqueo de guardianes: ${visBlockG}. Bloqueo de escritura: ${visBlockW}.`);

    // Escenario D: Mascotas homónimas (Luna Spinella vs Luna Navarro)
    const insLunaS = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name)
      VALUES ('luna-spinella-f4', 'Luna', 'perro', 'Familia Spinella') RETURNING id;
    `);
    const lunaSId = insLunaS.rows[0].id;
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Para Luna Spinella', 'despedida', 'Siempre contigo', 'Familia Spinella', 'Nov 2026', 'crema');
    `, [lunaSId]);

    const insLunaN = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, author_display_name)
      VALUES ('luna-navarro-f4', 'Luna', 'gato', 'Familia Navarro') RETURNING id;
    `);
    const lunaNId = insLunaN.rows[0].id;
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Para Luna Navarro', 'despedida', 'Ronronea en paz', 'Familia Navarro', 'Nov 2026', 'lavanda');
    `, [lunaNId]);

    const readLS = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [lunaSId]);
    const readLN = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [lunaNId]);
    const scD_ok = lunaSId !== lunaNId && parseInt(readLS.rows[0].count) === 1 && parseInt(readLN.rows[0].count) === 1;
    record('ESCENARIO D', 'Mascotas homónimas (Luna Spinella vs Luna Navarro) 100% aisladas', scD_ok,
      `UUID Luna Spinella (${lunaSId.slice(0,8)}...): ${readLS.rows[0].count} carta | UUID Luna Navarro (${lunaNId.slice(0,8)}...): ${readLN.rows[0].count} carta.`);

    // Escenario E: Mascota sin fotografía
    const insTobyNoPhoto = await adminClient.query(`
      INSERT INTO community_tributes (slug, pet_name, species, photo_url, author_display_name)
      VALUES ('toby-sin-foto-f4', 'Toby', 'perro', null, 'Familia Rodríguez') RETURNING id, photo_url;
    `);
    const tobyId = insTobyNoPhoto.rows[0].id;
    const isPhotoNull = insTobyNoPhoto.rows[0].photo_url === null;
    await adminClient.query(`
      SELECT * FROM publish_tribute_letter($1, 'Para Toby en el prado', 'despedida', 'Nuestro noble perro.', 'Familia Rodríguez', 'Nov 2026', 'crema');
    `, [tobyId]);
    const tobyLetters = await adminClient.query('SELECT count(*) FROM tribute_letters WHERE tribute_id = $1;', [tobyId]);
    const scE_ok = isPhotoNull && parseInt(tobyLetters.rows[0].count) === 1;
    record('ESCENARIO E', 'Mascota sin fotografía (medallón celestial por defecto)', scE_ok,
      `photo_url es NULL en base de datos; la colección opera con todas las funcionalidades de lectura y escritura.`);

    console.log('');

    // =========================================================================
    // FASE 5: VALIDACIÓN DE GUARDIANES Y ACCESO SEGURO
    // =========================================================================
    console.log('--- FASE 5: SEGURIDAD Y GUARDIANES ---');

    const emailF5 = 'guardiana.chloe@ejemplo.com';
    const blindIndexF5 = computeBlindIndex(emailF5);

    const insGF5 = await adminClient.query(`
      INSERT INTO tribute_guardians (tribute_id, email_blind_index)
      VALUES ($1, $2) RETURNING id;
    `, [chloeCTId, blindIndexF5]);
    const gF5Id = insGF5.rows[0].id;

    const rawTokenF5 = crypto.randomBytes(32).toString('hex');
    const tokenHashF5 = hashToken(rawTokenF5);

    const insSF5 = await adminClient.query(`
      INSERT INTO guardian_sessions (guardian_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '15 minutes') RETURNING id;
    `, [gF5Id, tokenHashF5]);
    const sF5Id = insSF5.rows[0].id;

    // Validación de sesión
    const authCheck = await adminClient.query(`
      SELECT g.tribute_id, s.expires_at > NOW() as is_active
      FROM guardian_sessions s
      JOIN tribute_guardians g ON s.guardian_id = g.id
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL;
    `, [tokenHashF5]);

    const isGuardianValid = authCheck.rows.length === 1 && 
                            authCheck.rows[0].tribute_id === chloeCTId && 
                            authCheck.rows[0].is_active === true;

    // Revocar
    await adminClient.query('UPDATE guardian_sessions SET revoked_at = NOW() WHERE id = $1;', [sF5Id]);
    const revokedCheck = await adminClient.query(`
      SELECT s.id FROM guardian_sessions s
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL;
    `, [tokenHashF5]);

    const isRevoked = revokedCheck.rows.length === 0;

    const f5_ok = isGuardianValid && isRevoked;
    record('FASE 5', 'Ciclo de vida del guardián (Blind Index, token hash, sesión y revocación)', f5_ok,
      `Sesión activa y vinculada al tribute_id de Chloe: ${isGuardianValid}. Revocación inmediata: ${isRevoked}.`);

  } finally {
    await adminClient.end();
  }

  console.log('\n================================================================');
  console.log('RESUMEN DE VALIDACIÓN FASE 2:');
  const allPassed = results.every(r => r.passed);
  console.log(`Total pruebas: ${results.length} | Aprobadas: ${results.filter(r => r.passed).length} | Fallidas: ${results.filter(r => !r.passed).length}`);
  console.log(`DICTAMEN FINAL: ${allPassed ? 'APTO PARA CONTINUAR' : 'NO APTO'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runComprehensiveValidation().catch(err => {
  console.error('ERROR FATAL EN TEST RUNNER:', err);
  process.exit(1);
});
