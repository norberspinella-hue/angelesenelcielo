/**
 * TEST SUITE FASE A — ENDURECIMIENTO DE SEGURIDAD EN POSTGRESQL 16 REAL Y ENDPOINTS HTTP
 * Proyecto: Todas las mascotas van al cielo / Ángeles en el Cielo
 * Rama: staging/cartas-para-mi-angelito
 */

const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const tempPassPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_pass.tmp');
if (!fs.existsSync(tempPassPath)) {
  console.error('ERROR: No se encontró pg_staging_pass.tmp');
  process.exit(1);
}
const DB_PASS = fs.readFileSync(tempPassPath, 'utf8').trim();
const EPHEMERAL_HMAC_SECRET = crypto.randomBytes(32).toString('hex');

const DB_CONFIG = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: DB_PASS,
  database: 'cartas_staging'
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpRequest(port, method, urlPath, bodyObj = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = bodyObj !== null ? JSON.stringify(bodyObj) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        'Origin': `http://127.0.0.1:${port}`,
        ...headers,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, json, raw: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAll() {
  const results = [];
  function record(id, name, passed, detail) {
    results.push({ id, name, passed, detail });
    console.log(`[${id}] ${passed ? '✅ PASÓ' : '❌ FALLÓ'} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // 1. APLICAR MIGRACIONES FORMALES 0009..0012 DOS VECES (IDEMPOTENCIA)
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const migFiles = [
      '0009_community_multicarta_schema.sql',
      '0010_community_multicarta_rls.sql',
      '0011_publish_tribute_letter_rpc.sql',
      '0012_community_rate_limits.sql'
    ];

    // Limpiar estado previo de pruebas en staging para prueba limpia
    await client.query(`
      DROP VIEW IF EXISTS public.v_legacy_companion_letters CASCADE;
      DROP TABLE IF EXISTS public.rollback_companion_letters, public.guardian_sessions, public.guardian_magic_links, public.tribute_guardians, public.tribute_letters, public.community_tributes, public.community_rate_limits CASCADE;
    `);

    for (let pass = 1; pass <= 2; pass++) {
      for (const f of migFiles) {
        const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
        await client.query(sql);
      }
    }
    record('SQL-01', 'Migraciones formales 0009..0012 idempotentes en PostgreSQL 16', true, 'Ejecutadas 2 veces consecutivas sin errores.');

    // 2. PRIVILEGIOS SQL Y RLS CON ROLES ANON / AUTHENTICATED
    let anonPrivError = false;
    try {
      await client.query('BEGIN; SET LOCAL ROLE anon; SELECT * FROM public.guardian_magic_links; ROLLBACK;');
    } catch (e) {
      await client.query('ROLLBACK');
      anonPrivError = e.code === '42501';
    }
    let rpcBlockedForAnon = false;
    try {
      const dummyHash = '0'.repeat(64);
      await client.query(`BEGIN; SET LOCAL ROLE anon; SELECT * FROM public.consume_guardian_magic_link('${dummyHash}'); ROLLBACK;`);
    } catch (e) {
      await client.query('ROLLBACK');
      rpcBlockedForAnon = e.code === '42501';
    }
    let publishRpcBlockedForAuth = false;
    try {
      await client.query(`BEGIN; SET LOCAL ROLE authenticated; SELECT * FROM public.publish_tribute_letter(gen_random_uuid(), 'x', 'espontanea', 'x', 'x', 'x'); ROLLBACK;`);
    } catch (e) {
      await client.query('ROLLBACK');
      publishRpcBlockedForAuth = e.code === '42501';
    }
    record('SQL-02', 'Privilegios SQL mínimos (anon y authenticated bloqueados en tablas privadas y RPC)', anonPrivError && rpcBlockedForAnon && publishRpcBlockedForAuth, `Tabla magic_links: ${anonPrivError}, RPC magic_link (anon): ${rpcBlockedForAnon}, RPC publish (authenticated): ${publishRpcBlockedForAuth}`);

    // 3. CONCURRENCIA (20 PUBLICACIONES) E IDEMPOTENCIA
    const tribRes = await client.query(`
      INSERT INTO public.community_tributes (slug, pet_name, species, author_display_name)
      VALUES ('balu-fase-a', 'Balu', 'perro', 'Familia Test') RETURNING id;
    `);
    const baluId = tribRes.rows[0].id;
    const { Pool } = require('pg');
    const pool = new Pool(DB_CONFIG);
    const promises = Array.from({ length: 20 }, (_, i) =>
      pool.query(`SELECT * FROM public.publish_tribute_letter($1, $2, 'espontanea', $3, 'Familia Test', '20 Nov 2026', 'crema', $4);`,
        [baluId, `Carta ${i + 1}`, `Contenido ${i + 1}`, `idem-fase-a-${i + 1}`])
    );
    const settled = await Promise.allSettled(promises);
    const okCount = settled.filter(s => s.status === 'fulfilled').length;
    const dupRes = await pool.query(`SELECT * FROM public.publish_tribute_letter($1, 'Carta 1', 'espontanea', 'Contenido 1', 'Familia Test', '20 Nov 2026', 'crema', 'idem-fase-a-1');`, [baluId]);
    await pool.end();
    record('SQL-03', 'Concurrencia (20/20 con FOR UPDATE) e idempotencia', okCount === 20 && dupRes.rows[0].is_duplicate === true, `Éxitos: ${okCount}/20, is_duplicate: ${dupRes.rows[0].is_duplicate}`);

    // 4. ROLLBACK Y PROTECCIÓN DE PRIVADOS EN VISTA DE COMPATIBILIDAD
    const privTrib = await client.query(`
      INSERT INTO public.community_tributes (slug, pet_name, species, author_display_name, visibility)
      VALUES ('priv-rollback', 'Oculto', 'gato', 'Familia Priv', 'private') RETURNING id;
    `);
    await client.query(`
      INSERT INTO public.rollback_companion_letters (tribute_id, tribute_slug, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      VALUES ($1, 'balu-fase-a', 2, 'Carta respaldo pública', 'espontanea', 'Visible en rollback', 'Fam', '20 Nov', 'lavanda'),
             ($2, 'priv-rollback', 2, 'Carta respaldo privada', 'espontanea', 'NO debe verse', 'Fam', '20 Nov', 'rosa');
    `, [baluId, privTrib.rows[0].id]);
    const viewRes = await client.query(`SELECT tribute_slug FROM public.v_legacy_companion_letters;`);
    const onlyPublicInView = viewRes.rows.length === 1 && viewRes.rows[0].tribute_slug === 'balu-fase-a';
    record('SQL-04', 'Rollback recuperable sin exponer homenajes privados', onlyPublicInView, `Filas visibles en vista: ${viewRes.rows.map(r => r.tribute_slug).join(', ')}`);

    // 5. ARRANCAR SERVIDOR NEXT.JS DE PRUEBAS CON VARIABLES DE STAGING AISLADAS
    const port = 3099;
    const sinkPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cartas_dev_email_sink.json');
    try { fs.unlinkSync(sinkPath); } catch {}

    const serverEnv = {
      ...process.env,
      COMMUNITY_HMAC_SECRET: EPHEMERAL_HMAC_SECRET,
      COMMUNITY_MULTICARTA_ENABLED: 'true',
      COMMUNITY_ALLOWED_ENV: 'staging',
      NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${port}`,
      STRIPE_SECRET_KEY: 'sk_test_staging_placeholder',
    };

    const nextProc = spawn('npx', ['next', 'dev', '-p', String(port), '-H', '127.0.0.1'], {
      cwd: __dirname,
      env: serverEnv,
      shell: true,
      stdio: 'ignore'
    });

    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const ping = await httpRequest(port, 'GET', '/api/health');
        if (ping.status === 200) { serverReady = true; break; }
      } catch {}
    }
    if (!serverReady) throw new Error('No arrancó next start en puerto 3099');

    try {
      // 6. CREAR DOS FAMILIAS HOMÓNIMAS (LUNA SPINELLA Y LUNA NAVARRO)
      const createA = await httpRequest(port, 'POST', '/api/community/tributes', {
        petName: 'Luna', species: 'gato', authorName: 'Familia Spinella',
        email: 'spinella@ejemplo.com', firstLetterTitle: 'Luna Spinella 1',
        firstLetterCategory: 'despedida', firstLetterContent: 'Para Luna Spinella', firstLetterEnvelopeColor: 'crema'
      });
      const slugA = createA.json.tribute.slug;
      const cookieA = (createA.headers['set-cookie'] || [])[0]?.split(';')[0];

      const createB = await httpRequest(port, 'POST', '/api/community/tributes', {
        petName: 'Luna', species: 'perro', authorName: 'Familia Navarro',
        email: 'navarro@ejemplo.com', firstLetterTitle: 'Luna Navarro 1',
        firstLetterCategory: 'despedida', firstLetterContent: 'Para Luna Navarro', firstLetterEnvelopeColor: 'lavanda'
      });
      const slugB = createB.json.tribute.slug;

      record('HTTP-01', 'Creación de familias homónimas con cookie HttpOnly', createA.status === 201 && createB.status === 201 && cookieA.includes('guardian_session='), `Slugs distintos: ${slugA} vs ${slugB}`);

      // 7. ACCESO ENTRE FAMILIAS (FAMILIA A NO PUEDE ESCRIBIR EN FAMILIA B)
      const crossWrite = await httpRequest(port, 'POST', `/api/community/tributes/${slugB}/letters`, {
        title: 'Intrusión', category: 'espontanea', content: 'No permitido', authorName: 'Intruso', envelopeColor: 'rosa'
      }, { Cookie: cookieA });
      record('HTTP-02', 'Aislamiento entre familias homónimas (403 Forbidden)', crossWrite.status === 403, `Status obtenido: ${crossWrite.status}`);

      // 8. PROTECCIÓN DE DATOS PRIVADOS EN RESPUESTAS PÚBLICAS
      const pubList = await httpRequest(port, 'GET', '/api/community/tributes');
      const pubDetail = await httpRequest(port, 'GET', `/api/community/tributes/${slugA}`);
      const rawAll = JSON.stringify([pubList.json, pubDetail.json]);
      const noLeaks = !rawAll.includes('spinella@ejemplo.com') && !rawAll.includes('email_blind_index') && !rawAll.includes('token_hash') && !rawAll.includes('stagingMagicToken');
      record('HTTP-03', 'Cero datos privados en respuestas públicas', pubList.status === 200 && noLeaks, 'Sin emails, blind indexes ni tokens en JSON.');

      // 9. CSRF (SIN ORIGIN Y CON ORIGIN EXTERNO -> 403)
      const csrfMissing = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: 'x@ejemplo.com', tributeSlug: slugA }, { Origin: '' });
      // En node http.request, Origin: '' sigue enviando cabecera vacía; eliminemos Origin explícitamente usando headers sin Origin:
      const noOriginRes = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: '127.0.0.1', port, path: '/api/community/guardian/recover', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': 2 }
        }, res => { res.on('data', () => {}); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', reject);
        req.write('{}');
        req.end();
      });
      const csrfEvil = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: 'spinella@ejemplo.com', tributeSlug: slugA }, { Origin: 'https://atacante.example' });
      record('HTTP-04', 'Protección CSRF uniforme en peticiones mutadoras', noOriginRes === 403 && csrfEvil.status === 403, `Sin origen: ${noOriginRes}, Origen externo: ${csrfEvil.status}`);

      // 10. ANTI-ENUMERACIÓN Y MAGIC LINK DE UN SOLO USO + ROTACIÓN
      const recValid = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: 'spinella@ejemplo.com', tributeSlug: slugA });
      const recUnknown = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: 'nadie@ejemplo.com', tributeSlug: slugA });
      const recNoTrib = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: 'spinella@ejemplo.com', tributeSlug: 'no-existe-123' });

      const identicalResponses =
        recValid.status === 200 &&
        JSON.stringify(recValid.json) === JSON.stringify(recUnknown.json) &&
        JSON.stringify(recValid.json) === JSON.stringify(recNoTrib.json) &&
        !recValid.raw.includes('stagingMagicToken');
      record('HTTP-05', 'Anti-enumeración estricta en /guardian/recover', identicalResponses, `Mensaje único: "${recValid.json?.message}"`);

      // Leer token del capturador local de desarrollo
      const captured = JSON.parse(fs.readFileSync(sinkPath, 'utf8'));
      const lastUrl = new URL(captured[captured.length - 1].magicLinkUrl);
      const magicToken = lastUrl.searchParams.get('magicToken');

      const verify1 = await httpRequest(port, 'POST', '/api/community/guardian/verify', { token: magicToken, tributeSlug: slugA });
      const newSessionCookie = (verify1.headers['set-cookie'] || [])[0]?.split(';')[0];
      const verify2Reuse = await httpRequest(port, 'POST', '/api/community/guardian/verify', { token: magicToken, tributeSlug: slugA });

      const rotatedAndSingleUse = verify1.status === 200 && newSessionCookie && !newSessionCookie.includes(magicToken) && verify2Reuse.status === 401;
      record('HTTP-06', 'Magic Link de un solo uso y rotación a sesión independiente', rotatedAndSingleUse, `Canje 1: ${verify1.status}, Reutilización: ${verify2Reuse.status}`);

      // 11. EXPIRACIÓN DE MAGIC LINK
      const expiredRaw = crypto.randomBytes(32).toString('hex');
      const expiredHash = crypto.createHash('sha256').update(expiredRaw).digest('hex');
      const gRow = await client.query(`SELECT id FROM public.tribute_guardians LIMIT 1;`);
      await client.query(`INSERT INTO public.guardian_magic_links (guardian_id, token_hash, expires_at) VALUES ($1, $2, NOW() - INTERVAL '1 minute');`, [gRow.rows[0].id, expiredHash]);
      const verifyExpired = await httpRequest(port, 'POST', '/api/community/guardian/verify', { token: expiredRaw });
      record('HTTP-07', 'Rechazo de Magic Link expirado (401)', verifyExpired.status === 401, `Status: ${verifyExpired.status}`);

      // 12. REVOCACIÓN GLOBAL DE TODAS LAS SESIONES (revokeAll: true)
      const revokeRes = await httpRequest(port, 'POST', '/api/community/guardian/revoke', { revokeAll: true }, { Cookie: newSessionCookie });
      const checkOldCookie = await httpRequest(port, 'GET', '/api/community/guardian/session', null, { Cookie: cookieA });
      const checkNewCookie = await httpRequest(port, 'GET', '/api/community/guardian/session', null, { Cookie: newSessionCookie });
      record('HTTP-08', 'Revocación global de sesiones (revokeAll)', revokeRes.status === 200 && checkOldCookie.json?.isAuthenticated === false && checkNewCookie.json?.isAuthenticated === false, 'Ambas sesiones invalidadas inmediatamente.');

      // 13. RATE LIMITING PERSISTENTE EN POSTGRESQL (429)
      let got429 = false;
      for (let i = 0; i < 6; i++) {
        const r = await httpRequest(port, 'POST', '/api/community/guardian/recover', { email: `spam${i}@ejemplo.com`, tributeSlug: slugA });
        if (r.status === 429) { got429 = true; break; }
      }
      record('HTTP-09', 'Rate limiting persistente en PostgreSQL (429 Too Many Requests)', got429, 'Bloqueo activado tras superar el umbral de 5 solicitudes/15m.');

    } finally {
      nextProc.kill();
      try { fs.unlinkSync(sinkPath); } catch {}
    }

  } finally {
    await client.end();
  }

  const passed = results.filter(r => r.passed).length;
  console.log(`\n================================================================`);
  console.log(`RESUMEN FASE A: ${passed}/${results.length} PRUEBAS SUPERADAS`);
  console.log(`================================================================`);
  if (passed !== results.length) process.exit(1);
}

runAll().catch(err => {
  console.error('ERROR FATAL:', err);
  process.exit(1);
});
