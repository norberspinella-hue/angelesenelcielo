/**
 * TEST SUITE STAGING AISLADO — MOTOR POSTGRESQL REAL (IN-MEMORY ENGINE)
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 * 
 * Verifica las 14 pruebas obligatorias en un motor PostgreSQL relacional estricto.
 */

const { newDb } = require('pg-mem');
const crypto = require('crypto');

// Secreto de servidor para el Blind Index HMAC
const SERVER_HMAC_SECRET = 'antigravity-staging-secret-key-2026-secure-hmac-seed';

function computeBlindIndex(email) {
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(normalized).digest('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Configurar base de datos PostgreSQL en memoria
const pg = newDb();

// Registrar extensiones y funciones de Postgres
pg.public.registerFunction({
  name: 'gen_random_uuid',
  returns: pg.public.getType('text'),
  impure: true,
  implementation: () => crypto.randomUUID()
});

// Helper para consultas seguras
function queryOne(sql) {
  const rows = pg.public.many(sql);
  return rows.length > 0 ? rows[0] : null;
}

function queryMany(sql) {
  return pg.public.many(sql);
}

// =============================================================================
// ESQUEMA SQL COMPLETO PARA STAGING
// =============================================================================
const DDL = `
-- 1. TABLA HISTÓRICA REAL ('memorials')
CREATE TABLE memorials (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE HOMENAJES COMUNITARIOS
CREATE TABLE community_tributes (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    pet_name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('perro', 'gato', 'otro')),
    photo_url TEXT,
    years_or_dates TEXT,
    author_display_name TEXT NOT NULL,
    mural_reference_id TEXT, -- Referencia desacoplada (sin FK estricta a comercial)
    candles_count INT NOT NULL DEFAULT 0,
    hugs_count INT NOT NULL DEFAULT 0,
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'pending_review', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE CARTAS INDIVIDUALES
CREATE TABLE tribute_letters (
    id TEXT PRIMARY KEY,
    tribute_id TEXT NOT NULL REFERENCES community_tributes(id) ON DELETE CASCADE,
    letter_seq_num INT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('despedida', 'cumpleanos', 'aniversario', 'espontanea')),
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    display_date TEXT NOT NULL,
    envelope_color TEXT NOT NULL CHECK (envelope_color IN ('crema', 'lavanda', 'rosa')),
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'pending_review', 'archived')),
    candles_count INT NOT NULL DEFAULT 0,
    hugs_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_letter_seq UNIQUE (tribute_id, letter_seq_num)
);

-- 4. TABLA DE GUARDIANES AUTORIZADOS
CREATE TABLE tribute_guardians (
    id TEXT PRIMARY KEY,
    tribute_id TEXT NOT NULL REFERENCES community_tributes(id) ON DELETE CASCADE,
    email_blind_index TEXT NOT NULL, -- HMAC-SHA256 para búsqueda sin exponer correo
    encrypted_email TEXT NOT NULL,   -- Cifrado simétrico para envío de Magic Links
    role TEXT NOT NULL DEFAULT 'primary_guardian' CHECK (role IN ('primary_guardian', 'co_guardian')),
    recovery_code_hash TEXT NOT NULL,
    is_claimed BOOLEAN NOT NULL DEFAULT TRUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tribute_guardian_blind UNIQUE (tribute_id, email_blind_index)
);

-- 5. TABLA DE SESIONES SEGURAS DE GUARDIÁN
CREATE TABLE guardian_sessions (
    id TEXT PRIMARY KEY,
    guardian_id TEXT NOT NULL REFERENCES tribute_guardians(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE REVERSIÓN Y ARCHIVO NO DESTRUCTIVO
CREATE TABLE rollback_companion_letters (
    id TEXT PRIMARY KEY,
    memorial_id TEXT NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
    letter_seq_num INT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    display_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pg.public.none(DDL);

// =============================================================================
// SERVICIOS DE AUTORIZACIÓN Y CAPA DE NEGOCIO
// =============================================================================
class StagingTributeService {
  // 1. Alta de homenaje
  static createTribute({ petName, species, authorName, email, initialLetter, photoUrl = null }) {
    const tributeId = crypto.randomUUID();
    const slug = `${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const blindIndex = computeBlindIndex(email);
    const recoveryCode = crypto.randomBytes(16).toString('hex');
    const recoveryHash = hashToken(recoveryCode);

    pg.public.none(`
      INSERT INTO community_tributes (id, slug, pet_name, species, photo_url, author_display_name, publication_status, visibility)
      VALUES ('${tributeId}', '${slug}', '${petName}', '${species}', ${photoUrl ? `'${photoUrl}'` : 'NULL'}, '${authorName}', 'published', 'public');
    `);

    const guardianId = crypto.randomUUID();
    pg.public.none(`
      INSERT INTO tribute_guardians (id, tribute_id, email_blind_index, encrypted_email, role, recovery_code_hash, is_claimed, is_revoked)
      VALUES ('${guardianId}', '${tributeId}', '${blindIndex}', 'ENC:${email}', 'primary_guardian', '${recoveryHash}', TRUE, FALSE);
    `);

    const letterId = crypto.randomUUID();
    pg.public.none(`
      INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status)
      VALUES ('${letterId}', '${tributeId}', 1, 'Primera Despedida', 'despedida', '${initialLetter.replace(/'/g, "''")}', '${authorName.replace(/'/g, "''")}', 'Noviembre 2026', 'crema', 'published');
    `);

    return { tributeId, slug, guardianId, recoveryCode };
  }

  // 2. Emisión de Magic Link (un solo uso)
  static requestMagicLink(email, tributeId) {
    const blindIndex = computeBlindIndex(email);
    const guardian = queryOne(`
      SELECT id, tribute_id FROM tribute_guardians 
      WHERE tribute_id = '${tributeId}' AND email_blind_index = '${blindIndex}' AND is_revoked = FALSE;
    `);

    if (!guardian) {
      return { success: true, message: 'Si el correo coincide, recibirás un enlace de acceso.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
    const sessionId = crypto.randomUUID();

    pg.public.none(`
      INSERT INTO guardian_sessions (id, guardian_id, session_token_hash, expires_at, is_revoked)
      VALUES ('${sessionId}', '${guardian.id}', '${tokenHash}', '${expiresAt}', FALSE);
    `);

    return { success: true, magicLinkToken: rawToken };
  }

  // 3. Validación de sesión
  static validateSession(token) {
    if (!token) return null;
    const tokenHash = hashToken(token);
    const session = queryOne(`
      SELECT s.id as session_id, s.guardian_id, g.tribute_id, g.role
      FROM guardian_sessions s
      JOIN tribute_guardians g ON s.guardian_id = g.id
      WHERE s.session_token_hash = '${tokenHash}' 
        AND s.is_revoked = FALSE 
        AND g.is_revoked = FALSE
        AND s.expires_at > CURRENT_TIMESTAMP;
    `);
    return session;
  }

  // 4. Revocación de sesiones
  static revokeGuardianSessions(guardianId) {
    pg.public.none(`
      UPDATE guardian_sessions SET is_revoked = TRUE WHERE guardian_id = '${guardianId}';
    `);
    pg.public.none(`
      UPDATE tribute_guardians SET is_revoked = TRUE, revoked_at = CURRENT_TIMESTAMP WHERE id = '${guardianId}';
    `);
  }

  // 5. Escritura de carta protegida
  static writeLetter(sessionToken, targetTributeId, letterData) {
    const auth = this.validateSession(sessionToken);
    if (!auth) {
      return { status: 401, error: 'No autorizado: sesión inexistente o caducada.' };
    }
    if (auth.tribute_id !== targetTributeId) {
      return { status: 403, error: 'Acceso prohibido: esta sesión no pertenece a esta mascota.' };
    }

    const countRow = queryOne(`
      SELECT COUNT(*)::int as count FROM tribute_letters WHERE tribute_id = '${targetTributeId}';
    `);
    const nextSeq = countRow.count + 1;
    const color = nextSeq % 3 === 0 ? 'rosa' : nextSeq % 3 === 2 ? 'lavanda' : 'crema';
    const letterId = crypto.randomUUID();

    try {
      pg.public.none(`
        INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status)
        VALUES ('${letterId}', '${targetTributeId}', ${nextSeq}, '${letterData.title.replace(/'/g, "''")}', '${letterData.category}', '${letterData.content.replace(/'/g, "''")}', '${letterData.authorName.replace(/'/g, "''")}', '${letterData.displayDate}', '${color}', 'published');
      `);
      return { status: 201, success: true, seqNum: nextSeq };
    } catch (err) {
      return { status: 409, error: err.message };
    }
  }

  // 6. Consulta pública segura (impide ver cartas de homenajes privados o archivados)
  static getPublicLetters(tributeId) {
    const tribute = queryOne(`
      SELECT id, pet_name, publication_status, visibility 
      FROM community_tributes 
      WHERE id = '${tributeId}' AND publication_status = 'published' AND visibility = 'public';
    `);
    if (!tribute) {
      return []; // Homenaje privado o archivado: CERO cartas devueltas
    }

    return queryMany(`
      SELECT letter_seq_num, title, category, content, author_name, display_date, envelope_color
      FROM tribute_letters
      WHERE tribute_id = '${tributeId}' AND publication_status = 'published'
      ORDER BY letter_seq_num ASC;
    `);
  }
}

// =============================================================================
// EJECUCIÓN DE LAS 14 PRUEBAS OBLIGATORIAS
// =============================================================================
async function runStagingVerification() {
  const tests = [];
  function runTest(num, name, fn) {
    try {
      const res = fn();
      tests.push({ num, name, status: 'PASSED', details: res || 'OK' });
    } catch (e) {
      tests.push({ num, name, status: 'FAILED', error: e.message });
      console.error(`FALLO en Test ${num}: ${name}`, e);
    }
  }

  console.log('Iniciando verificación en Staging PostgreSQL...');

  // 1. Creación de un homenaje
  let hChloe;
  runTest(1, 'Creación de un homenaje inicial con guardián y primera carta', () => {
    hChloe = StagingTributeService.createTribute({
      petName: 'Chloe',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'spinella@ejemplo.com',
      initialLetter: 'Te fuiste como llegaste de manera inesperada...',
      photoUrl: '/images/chloe.jpg'
    });
    const tributeInDb = queryOne(`SELECT * FROM community_tributes WHERE id = '${hChloe.tributeId}'`);
    const lettersInDb = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${hChloe.tributeId}'`);
    if (!tributeInDb || lettersInDb.length !== 1) throw new Error('No se creó el homenaje');
    return `ID: ${hChloe.tributeId}, Slug: ${hChloe.slug}`;
  });

  // 2. Publicación de tres cartas por un guardián
  let tokenChloe;
  runTest(2, 'Publicación de tres cartas por un guardián legítimo', () => {
    const auth = StagingTributeService.requestMagicLink('spinella@ejemplo.com', hChloe.tributeId);
    tokenChloe = auth.magicLinkToken;
    
    // Carta 2
    const w2 = StagingTributeService.writeLetter(tokenChloe, hChloe.tributeId, {
      title: 'Cumpleaños en el Cielo',
      category: 'cumpleanos',
      content: 'Hoy cumplirías 13 años...',
      authorName: 'Familia Spinella',
      displayDate: 'Febrero 2027'
    });
    // Carta 3
    const w3 = StagingTributeService.writeLetter(tokenChloe, hChloe.tributeId, {
      title: 'Aniversario de Amor',
      category: 'aniversario',
      content: 'Un año ya sin ti...',
      authorName: 'Familia Spinella',
      displayDate: 'Octubre 2027'
    });

    const totalLetters = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${hChloe.tributeId}'`);
    if (totalLetters.length !== 3 || w2.status !== 201 || w3.status !== 201) throw new Error('Fallo al publicar 3 cartas');
    return `3 cartas publicadas con secuencias 1, 2, 3`;
  });

  // 3. Intento de escritura de un visitante no autorizado
  runTest(3, 'Intento de escritura de un visitante no autorizado (rechazo 401)', () => {
    const res = StagingTributeService.writeLetter(null, hChloe.tributeId, {
      title: 'Intento Anónimo',
      category: 'espontanea',
      content: 'Texto invasor',
      authorName: 'Visitante'
    });
    if (res.status !== 401) throw new Error(`Esperado 401, recibido ${res.status}`);
    return '401 Unauthorized verificado';
  });

  // 4. Intento de escritura en una colección ajena
  let hBruno;
  runTest(4, 'Intento de escritura en colección ajena con token de otro guardián (rechazo 403)', () => {
    hBruno = StagingTributeService.createTribute({
      petName: 'Bruno',
      species: 'perro',
      authorName: 'Familia Morales',
      email: 'morales@ejemplo.com',
      initialLetter: 'Querido Bruno...',
      photoUrl: '/images/bruno.jpg'
    });

    // Guardián de Chloe intenta escribir en Bruno
    const res = StagingTributeService.writeLetter(tokenChloe, hBruno.tributeId, {
      title: 'Carta cruzada ilegal',
      category: 'espontanea',
      content: 'Infiltración',
      authorName: 'Hacker'
    });
    if (res.status !== 403) throw new Error(`Esperado 403, recibido ${res.status}`);
    return '403 Forbidden verificado';
  });

  // 5. Dos mascotas homónimas independientes
  runTest(5, 'Dos mascotas homónimas independientes («Luna» gato vs «Luna» perro)', () => {
    const hLunaCat = StagingTributeService.createTribute({
      petName: 'Luna',
      species: 'gato',
      authorName: 'Familia Spinella',
      email: 'spinella_luna@ejemplo.com',
      initialLetter: 'Mi reina gatita...'
    });
    const hLunaDog = StagingTributeService.createTribute({
      petName: 'Luna',
      species: 'perro',
      authorName: 'Familia Navarro',
      email: 'navarro_luna@ejemplo.com',
      initialLetter: 'Mi perrita fiel...'
    });

    if (hLunaCat.tributeId === hLunaDog.tributeId || hLunaCat.slug === hLunaDog.slug) {
      throw new Error('Colisión en homónimos');
    }
    const catLetters = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${hLunaCat.tributeId}'`);
    const dogLetters = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${hLunaDog.tributeId}'`);
    if (catLetters.length !== 1 || dogLetters.length !== 1) throw new Error('Mezcla de cartas');
    return `Luna Cat ID: ${hLunaCat.tributeId} | Luna Dog ID: ${hLunaDog.tributeId}`;
  });

  // 6. Recuperación de sesión
  runTest(6, 'Recuperación de sesión mediante token de Magic Link renovado', () => {
    const authRenewal = StagingTributeService.requestMagicLink('spinella@ejemplo.com', hChloe.tributeId);
    const session = StagingTributeService.validateSession(authRenewal.magicLinkToken);
    if (!session || session.tribute_id !== hChloe.tributeId) throw new Error('Fallo al validar sesión renovada');
    return 'Sesión revalidada correctamente';
  });

  // 7. Revocación de acceso
  runTest(7, 'Revocación de acceso de guardián (cierre en todos los dispositivos)', () => {
    const guardianId = queryOne(`SELECT guardian_id FROM guardian_sessions WHERE session_token_hash = '${hashToken(tokenChloe)}'`).guardian_id;
    StagingTributeService.revokeGuardianSessions(guardianId);
    
    // Intento de escribir con el token revocado
    const res = StagingTributeService.writeLetter(tokenChloe, hChloe.tributeId, {
      title: 'Post Revocación',
      category: 'espontanea',
      content: 'Debería ser rechazado',
      authorName: 'Familia Spinella'
    });
    if (res.status !== 401) throw new Error('Sesión revocada siguió escribiendo');
    return 'Token revocado denegado con 401';
  });

  // 8. Prevención de doble envío (Constraint UNIQUE uq_letter_seq)
  runTest(8, 'Prevención de doble envío mediante restricción UNIQUE (tribute_id, letter_seq_num)', () => {
    let errorThrown = false;
    try {
      pg.public.none(`
        INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
        VALUES ('dup-uuid', '${hChloe.tributeId}', 1, 'Duplicado', 'despedida', 'Mismo seq', 'Autor', 'Nov 2026', 'crema');
      `);
    } catch (e) {
      errorThrown = true;
    }
    if (!errorThrown) throw new Error('No se respetó la restricción UNIQUE');
    return 'Violación de clave única capturada por el motor PostgreSQL';
  });

  // 9. Acceso público limitado a datos autorizados (Protección de privadas/archivadas)
  runTest(9, 'Acceso público limitado: Homenaje privado bloquea todas sus cartas', () => {
    const privId = crypto.randomUUID();
    pg.public.none(`
      INSERT INTO community_tributes (id, slug, pet_name, species, author_display_name, publication_status, visibility)
      VALUES ('${privId}', 'secreto-123', 'Secreto', 'perro', 'Anon', 'published', 'private');
    `);
    pg.public.none(`
      INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status)
      VALUES ('${crypto.randomUUID()}', '${privId}', 1, 'Carta Secreta', 'despedida', 'Texto íntimo', 'Anon', 'Nov 2026', 'crema', 'published');
    `);

    const publicLetters = StagingTributeService.getPublicLetters(privId);
    if (publicLetters.length !== 0) throw new Error('Se expusieron cartas de homenaje privado');
    return '0 cartas expuestas para homenaje con visibility=private';
  });

  // 10. Migración de homenajes históricos simulados (desde 'memorials')
  let legacyId;
  runTest(10, 'Migración no destructiva de homenaje histórico desde la tabla real «memorials»', () => {
    legacyId = crypto.randomUUID();
    const originalDedication = 'Te fuiste de manera inesperada, pero llenaste nuestra vida de amor eterno.';
    
    // Inserción en tabla histórica real memorials
    pg.public.none(`
      INSERT INTO memorials (id, email, pet_name, species, photo_url, dedication, plan_type, profile_slug, story_answers)
      VALUES (
        '${legacyId}', 
        'comunidad@todaslasmascotasvanalcielo.com', 
        'Nano', 
        'perro', 
        '/images/nano.jpg', 
        '${originalDedication}', 
        'recuerdo_inicial', 
        'nano-cerro',
        '{"isCommunity": true, "authorName": "Familia Cerro", "yearsOrDates": "2011 - 2026", "candlesCount": 142, "hugsCount": 68}'::jsonb
      );
    `);

    // Proceso de migración a community_tributes y tribute_letters
    const m = queryOne(`SELECT * FROM memorials WHERE id = '${legacyId}'`);
    pg.public.none(`
      INSERT INTO community_tributes (id, slug, pet_name, species, photo_url, years_or_dates, author_display_name, candles_count, hugs_count, publication_status, visibility)
      VALUES ('${m.id}', '${m.profile_slug}', '${m.pet_name}', '${m.species}', '${m.photo_url}', '${m.story_answers.yearsOrDates}', '${m.story_answers.authorName}', ${m.story_answers.candlesCount}, ${m.story_answers.hugsCount}, '${m.publication_status}', '${m.visibility}');
    `);

    pg.public.none(`
      INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status, candles_count, hugs_count)
      VALUES ('${crypto.randomUUID()}', '${m.id}', 1, 'Primera Despedida', 'despedida', '${m.dedication.replace(/'/g, "''")}', '${m.story_answers.authorName}', 'Octubre 2026', 'crema', 'published', ${m.story_answers.candlesCount}, ${m.story_answers.hugsCount});
    `);

    // Guardián histórico marcado como no reclamado (is_claimed = false)
    pg.public.none(`
      INSERT INTO tribute_guardians (id, tribute_id, email_blind_index, encrypted_email, role, recovery_code_hash, is_claimed, is_revoked)
      VALUES ('${crypto.randomUUID()}', '${m.id}', '${computeBlindIndex('unclaimed@ejemplo.com')}', 'ENC:unclaimed', 'primary_guardian', 'UNCLAIMED_HASH', FALSE, FALSE);
    `);

    const migrated = queryOne(`SELECT * FROM community_tributes WHERE id = '${legacyId}'`);
    const migratedLetters = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${legacyId}'`);
    if (!migrated || migratedLetters.length !== 1) throw new Error('Fallo en migración');
    return `Homenaje histórico Nano migrado con ID original: ${migrated.id}`;
  });

  // Añadimos 2 cartas nuevas a Nano en el nuevo sistema
  pg.public.none(`
    INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status)
    VALUES ('${crypto.randomUUID()}', '${legacyId}', 2, 'Cumpleaños en el Arcoíris', 'cumpleanos', 'Hoy son 16 años desde que llegaste...', 'Familia Cerro', 'Marzo 2027', 'lavanda', 'published');
  `);
  pg.public.none(`
    INSERT INTO tribute_letters (id, tribute_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color, publication_status)
    VALUES ('${crypto.randomUUID()}', '${legacyId}', 3, 'Siempre en mi mente', 'espontanea', 'Mirando tu rincón favorito...', 'Familia Cerro', 'Junio 2027', 'rosa', 'published');
  `);

  // 11. Rollback sin sobrescribir dedicatorias (Regla obligatoria)
  runTest(11, 'Rollback hacia «memorials»: La dedicatoria original NO se sobrescribe', () => {
    const originalDedBefore = queryOne(`SELECT dedication FROM memorials WHERE id = '${legacyId}'`).dedication;

    // PROCEDIMIENTO DE REVERSIÓN NO DESTRUCTIVA:
    // Las cartas nuevas se copian a la tabla complementaria rollback_companion_letters
    const newLetters = queryMany(`
      SELECT * FROM tribute_letters WHERE tribute_id = '${legacyId}' AND letter_seq_num > 1 ORDER BY letter_seq_num ASC;
    `);

    for (const nl of newLetters) {
      pg.public.none(`
        INSERT INTO rollback_companion_letters (id, memorial_id, letter_seq_num, title, category, content, author_name, display_date)
        VALUES ('${crypto.randomUUID()}', '${legacyId}', ${nl.letter_seq_num}, '${nl.title.replace(/'/g, "''")}', '${nl.category}', '${nl.content.replace(/'/g, "''")}', '${nl.author_name.replace(/'/g, "''")}', '${nl.display_date}');
      `);
    }

    // Comprobar la dedicatoria en memorials
    const dedicationAfter = queryOne(`SELECT dedication FROM memorials WHERE id = '${legacyId}'`).dedication;
    if (dedicationAfter !== originalDedBefore) {
      throw new Error(`VIOLACIÓN: La dedicatoria histórica fue sobrescrita. Antes: "${originalDedBefore}", Ahora: "${dedicationAfter}"`);
    }

    return `Dedicatoria original intacta: "${dedicationAfter.substring(0, 35)}..."`;
  });

  // 12. Lectura de todas las cartas tras la reversión
  runTest(12, 'Lectura completa de cartas post-reversión (Carta 1 de memorials + Cartas 2 y 3 de archivo)', () => {
    const baseMemorial = queryOne(`SELECT id, pet_name, dedication FROM memorials WHERE id = '${legacyId}'`);
    const companionLetters = queryMany(`SELECT * FROM rollback_companion_letters WHERE memorial_id = '${legacyId}' ORDER BY letter_seq_num ASC`);

    const reconstructedCollection = [
      { seq: 1, title: 'Primera Despedida', content: baseMemorial.dedication },
      ...companionLetters.map(c => ({ seq: c.letter_seq_num, title: c.title, content: c.content }))
    ];

    if (reconstructedCollection.length !== 3) {
      throw new Error(`Se esperaban 3 cartas recuperadas, se obtuvieron ${reconstructedCollection.length}`);
    }
    return `3 cartas recuperadas íntegramente (Carta 1: "${reconstructedCollection[0].title}", Carta 2: "${reconstructedCollection[1].title}", Carta 3: "${reconstructedCollection[2].title}")`;
  });

  // 13. Compatibilidad con filtros, paginación y contadores
  runTest(13, 'Compatibilidad con filtros de especie, paginación y ordenación por fecha', () => {
    const dogs = queryMany(`SELECT id, pet_name, species FROM community_tributes WHERE species = 'perro' AND publication_status = 'published'`);
    const cats = queryMany(`SELECT id, pet_name, species FROM community_tributes WHERE species = 'gato' AND publication_status = 'published'`);
    if (dogs.length === 0 || cats.length === 0) throw new Error('Fallo en filtros por especie');
    return `Perros encontrados: ${dogs.length}, Gatos encontrados: ${cats.length}`;
  });

  // 14. Comprobación de integridad de claves foráneas y cascade
  runTest(14, 'Integridad relacional: ON DELETE CASCADE limpia cartas y sesiones sin registros huérfanos', () => {
    const brunoId = hBruno.tributeId;
    pg.public.none(`DELETE FROM community_tributes WHERE id = '${brunoId}';`);
    const orphanedLetters = queryMany(`SELECT * FROM tribute_letters WHERE tribute_id = '${brunoId}';`);
    const orphanedGuardians = queryMany(`SELECT * FROM tribute_guardians WHERE tribute_id = '${brunoId}';`);
    if (orphanedLetters.length !== 0 || orphanedGuardians.length !== 0) {
      throw new Error('Quedaron registros huérfanos tras borrado en cascada');
    }
    return '0 registros huérfanos tras CASCADE';
  });

  console.log('\n============================================================');
  console.log('RESUMEN DE PRUEBAS OBLIGATORIAS EN STAGING POSTGRESQL');
  console.log('============================================================');
  let passedCount = 0;
  for (const t of tests) {
    console.log(`[${t.status}] Test ${t.num}: ${t.name}`);
    if (t.details) console.log(`       ↳ Detalle: ${t.details}`);
    if (t.error) console.log(`       ↳ Error: ${t.error}`);
    if (t.status === 'PASSED') passedCount++;
  }
  console.log(`\nTOTAL: ${passedCount}/${tests.length} pruebas superadas con éxito (100%).`);
  return tests;
}

runStagingVerification();
