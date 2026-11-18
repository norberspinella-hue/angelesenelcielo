/**
 * TEST SUITE FASE 3 — INTEGRACIÓN REAL DE API NEXT.JS Y MOTOR POSTGRESQL 16
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 * 
 * Valida la integración completa del backend:
 * 1. Inicialización de esquema y RLS
 * 2. Creación de homenaje + 1ª carta + sesión HttpOnly
 * 3. Consulta pública de homenaje y cartas
 * 4. Bloqueo de escritura a visitantes (sin token)
 * 5. Bloqueo de escritura cruzada entre mascotas (guardián de Chloe intenta escribir a Luna)
 * 6. Publicación autorizada de 2ª carta por guardián legítimo
 * 7. Estrés de concurrencia: 20 publicaciones simultáneas atómicas
 * 8. Idempotencia ante reintentos
 * 9. Flujo de recuperación de guardián (Magic Link temporal)
 * 10. Revocación de sesión
 * 11. Preservación y Rollback (memorials.dedication inmutable)
 */

const {
  ensureTributesSchema,
  createTributeWithFirstLetter,
  getPublicTributes,
  getTributeBySlug,
  validateGuardianSession,
  publishAuthorizedLetter,
  revokeGuardianSession,
  requestGuardianRecovery,
  getDbPool
} = require('./src/lib/community/tributesDb');

async function runApiIntegrationTests() {
  console.log('================================================================');
  console.log('INICIANDO PRUEBAS DE INTEGRACIÓN FASE 3 (API + POSTGRESQL 16)');
  console.log('================================================================\n');

  const results = [];
  function record(id, name, passed, detail) {
    results.push({ id, name, passed, detail });
    const mark = passed ? '✅ PASÓ' : '❌ FALLÓ';
    console.log(`[PRUEBA ${String(id).padStart(2, '0')}] ${mark} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  // 1. Inicializar esquema
  const schemaOk = await ensureTributesSchema();
  record(1, 'Inicialización del esquema y función atómica en PostgreSQL 16', schemaOk,
    'Tablas community_tributes, tribute_letters, tribute_guardians, guardian_sessions y publish_tribute_letter verificadas.');

  // 2. Creación de homenaje + 1ª carta (Chloe)
  let chloeSlug = '';
  let chloeToken = '';
  let chloeTributeId = '';
  try {
    const chloeCreated = await createTributeWithFirstLetter({
      petName: 'Chloe',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'familia.spinella@ejemplo.com',
      yearsOrDates: '2014 - 2026',
      firstLetterTitle: 'Hasta siempre Chloe',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Nos enseñaste a querer con el alma.',
      firstLetterEnvelopeColor: 'crema'
    });

    chloeSlug = chloeCreated.tribute.slug;
    chloeToken = chloeCreated.rawSessionToken;
    chloeTributeId = chloeCreated.tribute.id;

    const createdOk = chloeSlug.startsWith('chloe') && chloeToken.length === 64 && chloeCreated.letter.letter_seq_num === 1;
    record(2, 'Creación de homenaje con primera carta y generación de token de guardián', createdOk,
      `Slug: ${chloeSlug} | Secuencia carta: ${chloeCreated.letter.letter_seq_num} | Longitud token: ${chloeToken.length}`);
  } catch (err) {
    record(2, 'Creación de homenaje con primera carta', false, err.message);
  }

  // 3. Consulta pública de homenaje y cartas
  try {
    const publicData = await getTributeBySlug(chloeSlug);
    const queryOk = publicData && publicData.tribute.petName === 'Chloe' && publicData.letters.length === 1;
    record(3, 'Consulta pública de colección individual', queryOk,
      `Homenaje: ${publicData.tribute.petName} | Cartas aprobadas: ${publicData.letters.length} | Sobre: ${publicData.letters[0].envelopeColor}`);
  } catch (err) {
    record(3, 'Consulta pública de colección individual', false, err.message);
  }

  // 4. Bloqueo de escritura a visitante sin autorización
  let visitorBlocked = false;
  try {
    await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: '', // Sin token
      title: 'Carta de Visitante',
      category: 'espontanea',
      content: 'Intentando escribir sin ser guardián',
      authorName: 'Visitante No Autorizado',
      envelopeColor: 'crema'
    });
  } catch (err) {
    if (err.status === 403 || err.message.includes('No autorizado')) {
      visitorBlocked = true;
    }
  }
  record(4, 'Denegación de escritura para visitantes no autorizados', visitorBlocked,
    visitorBlocked ? 'Rechazado con código 403 / No autorizado.' : 'FALLO: Se permitió escribir sin sesión.');

  // 5. Bloqueo de escritura cruzada entre familias distintas
  let crossBlocked = false;
  let lunaSlug = '';
  try {
    // Crear homenaje para Luna de Familia Navarro con su propio guardián
    const lunaCreated = await createTributeWithFirstLetter({
      petName: 'Luna',
      species: 'gato',
      authorName: 'Familia Navarro',
      email: 'familia.navarro@ejemplo.com',
      yearsOrDates: '2015 - 2025',
      firstLetterTitle: 'Para Luna Navarro',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Duerme tranquila pequeña.',
      firstLetterEnvelopeColor: 'lavanda'
    });
    lunaSlug = lunaCreated.tribute.slug;

    // El guardián de Chloe intenta escribir en la colección de Luna Navarro
    await publishAuthorizedLetter({
      tributeSlug: lunaSlug,
      rawGuardianToken: chloeToken, // Token de Chloe en colección de Luna
      title: 'Intrusión',
      category: 'espontanea',
      content: 'Intentando escribir en mascota ajena',
      authorName: 'Impostor',
      envelopeColor: 'rosa'
    });
  } catch (err) {
    if (err.status === 403 || err.message.includes('No autorizado')) {
      crossBlocked = true;
    }
  }
  record(5, 'Protección contra accesos entre familias distintas (escritura cruzada rechazada)', crossBlocked,
    crossBlocked ? 'El token de Chloe fue rechazado al intentar escribir en Luna Navarro.' : 'FALLO: Se permitió escritura en mascota ajena.');

  // 6. Publicación legítima de 2ª carta por el guardián de Chloe
  let secondLetterOk = false;
  try {
    const secondLetter = await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: chloeToken,
      title: 'Tu primer cumpleaños en las estrellas',
      category: 'cumpleanos',
      content: 'Hoy recordamos tu alegría de correr por el salón.',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      displayDate: '18 Nov 2026'
    });

    const chloeUpdated = await getTributeBySlug(chloeSlug);
    secondLetterOk = secondLetter.letter.letter_seq_num === 2 && chloeUpdated.letters.length === 2;
    record(6, 'Publicación autorizada de segunda carta e incremento del contador', secondLetterOk,
      `Carta 2 asignada con seq=${secondLetter.letter.letter_seq_num}. Total cartas en colección: ${chloeUpdated.letters.length}.`);
  } catch (err) {
    record(6, 'Publicación autorizada de segunda carta', false, err.message);
  }

  // 7. Estrés de concurrencia: 20 publicaciones simultáneas atómicas
  let stressOk = false;
  const runId = Math.random().toString(36).substring(2, 8);
  try {
    const stressPromises = [];
    for (let i = 1; i <= 20; i++) {
      stressPromises.push(
        publishAuthorizedLetter({
          tributeSlug: chloeSlug,
          rawGuardianToken: chloeToken,
          title: `Carta Concurrente #${i}`,
          category: 'espontanea',
          content: `Mensaje amoroso concurrente número ${i}`,
          authorName: 'Familia Spinella',
          envelopeColor: 'rosa',
          idempotencyKey: `chloe-concur-${runId}-${i}`
        })
      );
    }

    const stressRes = await Promise.all(stressPromises);
    const chloeAfterStress = await getTributeBySlug(chloeSlug);

    // Las cartas deben ser 2 iniciales + 20 = 22
    const totalCount = chloeAfterStress.letters.length;
    const seqs = chloeAfterStress.letters.map(l => l.letterSeqNum);
    const isSequential = seqs.every((val, idx) => val === idx + 1);

    stressOk = totalCount === 22 && isSequential && stressRes.every(r => !r.isDuplicate);
    record(7, 'Estrés de 20 publicaciones simultáneas atómicas (bloqueo FOR UPDATE)', stressOk,
      `Total cartas: ${totalCount}/22. Secuencia generada: [${seqs.slice(0,4).join(', ')} ... ${seqs.slice(-4).join(', ')}]. Cero colisiones.`);
  } catch (err) {
    record(7, 'Estrés de 20 publicaciones simultáneas atómicas', false, err.message);
  }

  // 8. Idempotencia ante reintentos de red
  let idemOk = false;
  try {
    const retryRes = await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: chloeToken,
      title: 'Carta Reintento',
      category: 'espontanea',
      content: 'Mensaje repetido',
      authorName: 'Familia Spinella',
      envelopeColor: 'rosa',
      idempotencyKey: `chloe-concur-${runId}-5` // Ya existía
    });

    const chloeAfterIdem = await getTributeBySlug(chloeSlug);
    idemOk = retryRes.isDuplicate === true && chloeAfterIdem.letters.length === 22;
    record(8, 'Idempotencia ante reintentos con misma clave', idemOk,
      `isDuplicate=${retryRes.isDuplicate}, total cartas se mantiene exactamente en ${chloeAfterIdem.letters.length}.`);
  } catch (err) {
    record(8, 'Idempotencia ante reintentos', false, err.message);
  }

  // 9. Flujo de recuperación de guardián (Magic Link de 15 minutos)
  let recoveryOk = false;
  try {
    const recResult = await requestGuardianRecovery('familia.spinella@ejemplo.com', chloeSlug);
    const rawMagicToken = recResult.stagingMagicToken;

    // Validar que el token generado autentica a Chloe
    const validRecSession = await validateGuardianSession(rawMagicToken, chloeSlug);
    recoveryOk = recResult.success && validRecSession && validRecSession.tributeSlug === chloeSlug;
    record(9, 'Recuperación de guardián mediante Magic Link temporal (15 min)', recoveryOk,
      `Blind index cotejado exitosamente. Token temporal validado para homenaje '${chloeSlug}'.`);
  } catch (err) {
    record(9, 'Recuperación de guardián mediante Magic Link', false, err.message);
  }

  // 10. Revocación de sesión
  let revokeOk = false;
  try {
    const revoked = await revokeGuardianSession(chloeToken);
    const postCheck = await validateGuardianSession(chloeToken, chloeSlug);

    let writeAfterRevokeBlocked = false;
    try {
      await publishAuthorizedLetter({
        tributeSlug: chloeSlug,
        rawGuardianToken: chloeToken,
        title: 'Intento tras revocación',
        category: 'espontanea',
        content: 'No debería publicarse',
        authorName: 'Familia Spinella',
        envelopeColor: 'crema'
      });
    } catch {
      writeAfterRevokeBlocked = true;
    }

    revokeOk = revoked && postCheck === null && writeAfterRevokeBlocked;
    record(10, 'Revocación instantánea de sesión y bloqueo de escrituras posteriores', revokeOk,
      `Sesión revocada: ${revoked} | Validación post-revocación: ${postCheck === null} | Escritura posterior bloqueada: ${writeAfterRevokeBlocked}.`);
  } catch (err) {
    record(10, 'Revocación de sesión', false, err.message);
  }

  // 11. Preservación de memorials.dedication y Rollback
  let rollbackOk = false;
  try {
    const pool = getDbPool();
    // Simular que Chloe tenía un registro original en memorials
    const origDedication = 'Chloe, nuestra perrita fiel e irrepetible. 2014-2026.';
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memorials (
        id TEXT PRIMARY KEY,
        pet_name TEXT NOT NULL,
        email TEXT NOT NULL,
        dedication TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        profile_slug TEXT UNIQUE,
        species TEXT NOT NULL
      );
    `);

    await pool.query(`
      INSERT INTO memorials (id, pet_name, email, dedication, plan_type, profile_slug, species)
      VALUES ('mem-chloe-real-hist', 'Chloe', 'fam@chloe.es', $1, 'pack_estelar', 'chloe-hist', 'perro')
      ON CONFLICT (id) DO NOTHING;
    `, [origDedication]);

    const checkHistBefore = await pool.query('SELECT dedication FROM memorials WHERE id = \'mem-chloe-real-hist\';');
    const dedBefore = checkHistBefore.rows[0].dedication;

    // Se efectúa simulación de rollback respaldando cartas a rollback_companion_letters
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rollback_companion_letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_memorial_id TEXT NOT NULL,
        letter_seq_num INT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        author_name TEXT NOT NULL,
        display_date TEXT NOT NULL,
        envelope_color TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_phase3_rollback UNIQUE (legacy_memorial_id, letter_seq_num)
      );
    `);

    await pool.query(`
      INSERT INTO rollback_companion_letters (legacy_memorial_id, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      SELECT 
        'mem-chloe-real-hist',
        tl.letter_seq_num,
        tl.title,
        tl.category,
        tl.content,
        tl.author_name,
        tl.display_date,
        tl.envelope_color
      FROM tribute_letters tl
      WHERE tl.tribute_id = $1 AND tl.letter_seq_num >= 2
      ON CONFLICT (legacy_memorial_id, letter_seq_num) DO NOTHING;
    `, [chloeTributeId]);

    const checkHistAfter = await pool.query('SELECT dedication FROM memorials WHERE id = \'mem-chloe-real-hist\';');
    const dedAfter = checkHistAfter.rows[0].dedication;

    const companionLetters = await pool.query('SELECT count(*) FROM rollback_companion_letters WHERE legacy_memorial_id = \'mem-chloe-real-hist\';');

    rollbackOk = (dedBefore === origDedication) && (dedAfter === origDedication) && parseInt(companionLetters.rows[0].count) >= 2;
    record(11, 'Inmutabilidad de memorials.dedication y respaldo en rollback_companion_letters', rollbackOk,
      `memorials.dedication inalterada: ${dedBefore === dedAfter}. Cartas adicionales respaldadas: ${companionLetters.rows[0].count}.`);
  } catch (err) {
    record(11, 'Preservación de memorials.dedication y Rollback', false, err.message);
  }

  console.log('\n================================================================');
  console.log('RESUMEN DE PRUEBAS DE INTEGRACIÓN FASE 3:');
  const allPassed = results.every(r => r.passed);
  console.log(`Total pruebas: ${results.length} | Aprobadas: ${results.filter(r => r.passed).length} | Fallidas: ${results.filter(r => !r.passed).length}`);
  console.log(`DICTAMEN FINAL: ${allPassed ? 'APTO PARA CONTINUAR' : 'NO APTO'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runApiIntegrationTests().catch(err => {
  console.error('ERROR FATAL EN TEST DE INTEGRACIÓN FASE 3:', err);
  process.exit(1);
});
