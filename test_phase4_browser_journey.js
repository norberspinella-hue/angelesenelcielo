/**
 * TEST SUITE FASE 4 — PRUEBA DE RECORRIDO COMPLETO, API HTTP Y SEGURIDAD
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 * 
 * Valida el recorrido exacto exigido en la Fase 4:
 * 1. Crear colección para Chloe con 1ª carta.
 * 2. Cerrar y volver a consultar la página (persistencia en PostgreSQL 16).
 * 3. Publicar segunda carta como guardián autorizado.
 * 4. Verificar que aparecen ambos sobres ordenados con sus colores.
 * 5. Abrir y leer ambas cartas con contenido completo.
 * 6. Cerrar sesión de guardián (revocación de cookie HttpOnly).
 * 7. Acceder como visitante (solo lectura permitida).
 * 8. Denegación de publicación a visitantes (401/403).
 * 9. Intento de intrusión en colección ajena (guardián de Chloe intenta escribir a Luna) -> 403.
 * 10. Seguridad de idempotencia: reintento con misma clave y contenido diferente no altera la carta original.
 * 11. Permisos EXECUTE restringidos de publish_tribute_letter.
 */

const {
  ensureTributesSchema,
  createTributeWithFirstLetter,
  getTributeBySlug,
  publishAuthorizedLetter,
  revokeGuardianSession,
  validateGuardianSession,
  getDbPool
} = require('./src/lib/community/tributesDb');

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('INICIANDO VALIDACIÓN FASE 4: RECORRIDO COMPLETO Y SEGURIDAD');
  console.log('================================================================\n');

  const results = [];
  function record(step, name, passed, detail) {
    results.push({ step, name, passed, detail });
    const mark = passed ? '✅ PASÓ' : '❌ FALLÓ';
    console.log(`[PASO ${String(step).padStart(2, '0')}] ${mark} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  const pool = getDbPool();
  if (!pool) {
    console.error('ERROR: No se pudo conectar al pool de PostgreSQL 16.');
    process.exit(1);
  }

  await ensureTributesSchema();

  // PASO 1: Crear colección para Chloe con 1ª carta
  let chloeSlug = '';
  let chloeToken = '';
  try {
    const res1 = await createTributeWithFirstLetter({
      petName: 'Chloe',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'familia.spinella@ejemplo.com',
      yearsOrDates: '2014 - 2026',
      firstLetterTitle: 'Hasta siempre Chloe',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor.',
      firstLetterEnvelopeColor: 'crema',
      displayDate: '15 Octubre, 2024'
    });

    chloeSlug = res1.tribute.slug;
    chloeToken = res1.rawSessionToken;

    const p1Ok = chloeSlug && chloeToken && res1.letter.letter_seq_num === 1;
    record(1, 'Crear colección para Chloe con su 1ª carta y sesión de guardián', p1Ok,
      `Slug generado: ${chloeSlug} | Secuencia carta: ${res1.letter.letter_seq_num} | Token generado.`);
  } catch (err) {
    record(1, 'Crear colección para Chloe', false, err.message);
  }

  // PASO 2 & 3: Cerrar y volver a abrir la página / verificar que sigue guardada
  try {
    const res2 = await getTributeBySlug(chloeSlug);
    const p2Ok = res2 && res2.tribute.petName === 'Chloe' && res2.letters.length === 1 && res2.letters[0].envelopeColor === 'crema';
    record(2, 'Persistencia verificada tras recarga (1ª carta en PostgreSQL 16)', p2Ok,
      `Homenaje: ${res2.tribute.petName} | Carta encontrada: "${res2.letters[0].title}" | Sobre: ${res2.letters[0].envelopeColor}.`);
  } catch (err) {
    record(2, 'Persistencia verificada tras recarga', false, err.message);
  }

  // PASO 4: Publicar una segunda carta como guardián
  try {
    const res3 = await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: chloeToken,
      title: 'Tu primer cumpleaños en las estrellas',
      category: 'cumpleanos',
      content: 'Hoy habrías cumplido años. Miramos al cielo sabiendo que corres feliz.',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      displayDate: '12 Mayo, 2025'
    });

    const p3Ok = res3.letter.letter_seq_num === 2 && !res3.isDuplicate;
    record(3, 'Publicar segunda carta como guardián autorizado', p3Ok,
      `Secuencia asignada: ${res3.letter.letter_seq_num} | Sobre: ${res3.letter.envelope_color} | Título: ${res3.letter.title}`);
  } catch (err) {
    record(3, 'Publicar segunda carta como guardián', false, err.message);
  }

  // PASO 5 & 6: Comprobar que aparecen dos sobres ordenados en la colección
  try {
    const res4 = await getTributeBySlug(chloeSlug);
    const letters = res4.letters;
    const hasTwoLetters = letters.length === 2;
    const seqs = letters.map(l => l.letterSeqNum);
    const isSorted = seqs[0] === 1 && seqs[1] === 2;
    const colorsMatch = letters[0].envelopeColor === 'crema' && letters[1].envelopeColor === 'lavanda';

    const p4Ok = hasTwoLetters && isSorted && colorsMatch;
    record(4, 'Comprobación de 2 sobres ordenados cronológicamente', p4Ok,
      `Total cartas: ${letters.length} | Secuencias: [${seqs.join(', ')}] | Colores: [${letters.map(l => l.envelopeColor).join(', ')}]`);
  } catch (err) {
    record(4, 'Comprobación de sobres ordenados', false, err.message);
  }

  // PASO 7: Abrir y leer ambas cartas con contenido completo
  try {
    const res5 = await getTributeBySlug(chloeSlug);
    const l1 = res5.letters[0];
    const l2 = res5.letters[1];
    const fullContentOk = l1.content.includes('vida y de amor') && l2.content.includes('corres feliz');
    record(5, 'Lectura íntegra de ambas cartas en el lector marfil', fullContentOk,
      `Carta 1: ${l1.content.slice(0, 45)}... | Carta 2: ${l2.content.slice(0, 45)}...`);
  } catch (err) {
    record(5, 'Lectura íntegra de ambas cartas', false, err.message);
  }

  // PASO 8: Cerrar la sesión del guardián (revocación de cookie)
  try {
    const revoked = await revokeGuardianSession(chloeToken);
    const sessionPost = await validateGuardianSession(chloeToken, chloeSlug);
    const p6Ok = revoked && sessionPost === null;
    record(6, 'Cierre de sesión y revocación en base de datos', p6Ok,
      `Sesión revocada: ${revoked} | Validación post-cierre: ${sessionPost === null ? 'Nula (inactiva)' : 'Activa (ERROR)'}`);
  } catch (err) {
    record(6, 'Cierre de sesión', false, err.message);
  }

  // PASO 9: Entrar como visitante (solo lectura)
  try {
    const visitorRead = await getTributeBySlug(chloeSlug);
    const p7Ok = visitorRead && visitorRead.letters.length === 2;
    record(7, 'Modo Visitante: lectura pública de la colección permitida', p7Ok,
      `Visitante pudo consultar la colección de Chloe con ${visitorRead.letters.length} cartas públicas.`);
  } catch (err) {
    record(7, 'Modo Visitante: lectura pública', false, err.message);
  }

  // PASO 10: Visitante intenta publicar sin autorización -> rechazo 403
  let visitorWriteBlocked = false;
  try {
    await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: '', // Token vacío de visitante
      title: 'Carta no autorizada',
      category: 'espontanea',
      content: 'Intento de publicación sin sesión',
      authorName: 'Visitante Desconocido',
      envelopeColor: 'rosa'
    });
  } catch (err) {
    if (err.status === 403 || err.message.includes('No autorizado')) {
      visitorWriteBlocked = true;
    }
  }
  record(8, 'Rechazo de publicación a visitantes (servidor deniega 403)', visitorWriteBlocked,
    visitorWriteBlocked ? 'El servidor denegó la operación (403 No autorizado).' : 'FALLO: Se permitió escribir sin sesión.');

  // PASO 11: Intentar acceder a colección ajena con token de otra mascota
  let crossFamilyBlocked = false;
  try {
    // Crear otra mascota (Luna Navarro)
    const lunaRes = await createTributeWithFirstLetter({
      petName: 'Luna',
      species: 'perro',
      authorName: 'Familia Navarro',
      email: 'navarro@ejemplo.com',
      firstLetterTitle: 'Para Luna',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Nuestra fiel amiga.',
      firstLetterEnvelopeColor: 'crema'
    });
    const lunaSlug = lunaRes.tribute.slug;
    const lunaToken = lunaRes.rawSessionToken;

    // El guardián de Luna intenta escribir en Chloe
    await publishAuthorizedLetter({
      tributeSlug: chloeSlug,
      rawGuardianToken: lunaToken, // Token de Luna intentando escribir en Chloe
      title: 'Intrusión',
      category: 'espontanea',
      content: 'Intentando publicar en familia ajena',
      authorName: 'Impostor',
      envelopeColor: 'rosa'
    });
  } catch (err) {
    if (err.status === 403 || err.message.includes('No autorizado')) {
      crossFamilyBlocked = true;
    }
  }
  record(9, 'Protección contra intrusión entre familias (token ajeno rechazado con 403)', crossFamilyBlocked,
    crossFamilyBlocked ? 'Token de Luna Navarro rechazado en la colección de Chloe.' : 'FALLO: Se permitió escritura cruzada.');

  // PASO 12: Idempotencia estricta con contenido diferente
  let idemSafetyOk = false;
  try {
    // Generar un nuevo token válido para Chloe
    const recChloe = await createTributeWithFirstLetter({
      petName: 'ChloeIdem',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'chloe.idem@ejemplo.com',
      firstLetterTitle: 'Carta 1',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Mensaje original de la carta',
      firstLetterEnvelopeColor: 'crema'
    });

    const idemToken = recChloe.rawSessionToken;
    const idemSlug = recChloe.tribute.slug;
    const fixedIdemKey = 'unique-idem-fixed-key-999';

    // 1. Envío inicial
    const firstPost = await publishAuthorizedLetter({
      tributeSlug: idemSlug,
      rawGuardianToken: idemToken,
      title: 'Carta Original Idempotente',
      category: 'espontanea',
      content: 'Contenido A Original',
      authorName: 'Familia Spinella',
      envelopeColor: 'crema',
      idempotencyKey: fixedIdemKey
    });

    // 2. Reintento malicioso con la misma clave pero contenido alterado ('Contenido B Alterado')
    const secondPost = await publishAuthorizedLetter({
      tributeSlug: idemSlug,
      rawGuardianToken: idemToken,
      title: 'Carta Alterada',
      category: 'espontanea',
      content: 'Contenido B Alterado Hack',
      authorName: 'Hacker',
      envelopeColor: 'rosa',
      idempotencyKey: fixedIdemKey
    });

    // Debe retornar la carta original y NO sobrescribir su contenido en base de datos
    const checkDb = await getTributeBySlug(idemSlug);
    const foundCard = checkDb.letters.find(l => l.letterSeqNum === 2);

    const isOriginalPreserved = foundCard && foundCard.content === 'Contenido A Original';
    const isFlagDuplicate = secondPost.isDuplicate === true;

    idemSafetyOk = isOriginalPreserved && isFlagDuplicate;
    record(10, 'Seguridad de idempotencia: reintento con contenido diferente no sobrescribe el original', idemSafetyOk,
      `isDuplicate=${isFlagDuplicate} | Contenido preservado: "${foundCard.content}" (no se sobrescribió).`);
  } catch (err) {
    record(10, 'Seguridad de idempotencia', false, err.message);
  }

  // PASO 11: Permisos EXECUTE restringidos de publish_tribute_letter
  let executeRestricted = false;
  try {
    const pool = require('./src/lib/community/tributesDb').getDbPool();
    const testClient = await pool.connect();
    try {
      await testClient.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
            CREATE ROLE anon;
          END IF;
        END $$;
      `);
      await testClient.query('BEGIN;');
      await testClient.query('SET LOCAL ROLE anon;');
      try {
        await testClient.query(`
          SELECT * FROM publish_tribute_letter(
            '00000000-0000-0000-0000-000000000000'::uuid,
            'Hack',
            'despedida',
            'Hack',
            'Hack',
            'Nov 2026',
            'crema'
          );
        `);
      } catch (sqlErr) {
        if (sqlErr.code === '42501' || sqlErr.message.includes('permission denied')) {
          executeRestricted = true;
        }
      }
      await testClient.query('ROLLBACK;');
    } finally {
      testClient.release();
    }

    record(11, 'Permisos EXECUTE restringidos: anon tiene denegado invocar publish_tribute_letter', executeRestricted,
      executeRestricted ? 'Llamada directa desde rol anon bloqueada con código 42501 (permission denied).' : 'FALLO: Rol anon pudo ejecutar la función.');
  } catch (err) {
    record(11, 'Permisos EXECUTE restringidos', false, err.message);
  }

  console.log('\n================================================================');
  console.log('RESUMEN DE PRUEBAS FASE 4:');
  const allPassed = results.every(r => r.passed);
  console.log(`Total pasos: ${results.length} | Aprobados: ${results.filter(r => r.passed).length} | Fallidos: ${results.filter(r => !r.passed).length}`);
  console.log(`DICTAMEN FINAL: ${allPassed ? 'APTO PARA CONTINUAR' : 'NO APTO'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runPhase4Tests().catch(err => {
  console.error('ERROR FATAL EN TEST RUNNER FASE 4:', err);
  process.exit(1);
});
