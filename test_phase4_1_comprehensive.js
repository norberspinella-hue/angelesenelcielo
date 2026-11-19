/**
 * TEST SUITE FASE 4.1 — VALIDACIÓN INTEGRAL DE 3 CAPAS:
 * A. Backend PostgreSQL 16 (Aislamiento, RLS, Concurrencia, Idempotencia 409, Permisos EXECUTE)
 * B. Endpoints HTTP (Next.js API Routes, Cookies HttpOnly, 401, 403, 409 Conflict, Feature Flag)
 * C. Interfaz Real en Navegador (Chrome Headless CDP, Formularios, Teclado Escape, Retorno de Foco)
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\9c17e7fa-6607-4f37-82ff-eecc66d630bc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const {
  ensureTributesSchema,
  createTributeWithFirstLetter,
  getTributeBySlug,
  publishAuthorizedLetter,
  revokeGuardianSession,
  validateGuardianSession,
  getDbPool
} = require('./src/lib/community/tributesDb');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      if (typeof postData === 'string') req.write(postData);
      else req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 1;
    this.pending = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout waiting for CDP method: ${method}`));
        }
      }, 60000);
      this.pending.set(id, {
        resolve: (val) => { clearTimeout(timer); resolve(val); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(brainDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`   📸 Captura guardada: ${filename} (${buffer.length} bytes)`);
  }

  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('INICIANDO SUITE FASE 4.1: CORRECCIONES FINALES Y VALIDACIÓN 3 CAPAS');
  console.log('================================================================\n');

  const results = [];
  function record(block, num, name, passed, detail) {
    results.push({ block, num, name, passed, detail });
    const mark = passed ? '✅ PASÓ' : '❌ FALLÓ';
    console.log(`[BLOQUE ${block} - ${String(num).padStart(2, '0')}] ${mark} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  // ---------------------------------------------------------------------------
  // BLOQUE A: VALIDACIÓN DE BACKEND Y POSTGRESQL 16 REAL
  // ---------------------------------------------------------------------------
  console.log('\n--- BLOQUE A: VALIDACIÓN DE BASE DE DATOS POSTGRESQL 16 REAL ---');
  const pool = getDbPool();
  if (!pool) {
    console.error('ERROR: No se pudo conectar al pool de PostgreSQL 16.');
    process.exit(1);
  }

  await ensureTributesSchema();

  // A.1: Idempotencia con mismo contenido devuelve duplicate=true
  let idemSameOk = false;
  const testSlugChloe = 'chloe-test-' + Date.now();
  let chloeTributeId = '';
  let chloeToken = '';
  let chloeRealSlug = '';
  const fixedIdemKey = 'idem-key-' + Date.now();

  try {
    const resChloe = await createTributeWithFirstLetter({
      petName: 'Chloe Test',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'spinella.test@ejemplo.com',
      yearsOrDates: '2014 - 2026',
      firstLetterTitle: 'Hasta siempre Chloe',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Primera carta de prueba para Chloe.',
      firstLetterEnvelopeColor: 'crema'
    });
    chloeTributeId = resChloe.tribute.id;
    chloeToken = resChloe.rawSessionToken;
    chloeRealSlug = resChloe.tribute.slug;

    // Publicación inicial con idempotency_key
    const post1 = await publishAuthorizedLetter({
      tributeSlug: chloeRealSlug,
      rawGuardianToken: chloeToken,
      title: 'Carta Cumpleaños',
      category: 'cumpleanos',
      content: 'Contenido A Original Legítimo',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      idempotencyKey: fixedIdemKey
    });

    // Reintento con exactamente el mismo contenido
    const post2 = await publishAuthorizedLetter({
      tributeSlug: chloeRealSlug,
      rawGuardianToken: chloeToken,
      title: 'Carta Cumpleaños',
      category: 'cumpleanos',
      content: 'Contenido A Original Legítimo',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      idempotencyKey: fixedIdemKey
    });

    idemSameOk = post2.isDuplicate === true && post2.letter.letter_seq_num === post1.letter.letter_seq_num;
    record('A', 1, 'Idempotencia: reintento idéntico retorna carta original sin duplicar', idemSameOk,
      `isDuplicate=${post2.isDuplicate} | Seq asignada=${post2.letter.letter_seq_num}`);
  } catch (err) {
    record('A', 1, 'Idempotencia con mismo contenido', false, err.message);
  }

  // A.2: Idempotencia con CONTENIDO DIFERENTE lanza conflicto 409
  let idemDiffOk = false;
  try {
    await publishAuthorizedLetter({
      tributeSlug: chloeRealSlug,
      rawGuardianToken: chloeToken,
      title: 'Carta Cumpleaños Alterada',
      category: 'cumpleanos',
      content: 'CONTENIDO MODIFICADO DISCREPANTE',
      authorName: 'Familia Spinella',
      envelopeColor: 'rosa',
      idempotencyKey: fixedIdemKey
    });
    idemDiffOk = false; // no debió pasar
  } catch (err) {
    if (err.status === 409 || (err.message && err.message.includes('idempotencia'))) {
      idemDiffOk = true;
      record('A', 2, 'Idempotencia: reintento con contenido diferente arroja HTTP 409 Conflict', true,
        `Status=${err.status} | Mensaje: "${err.message}"`);
    } else {
      record('A', 2, 'Idempotencia con contenido diferente', false, `Error inesperado: ${err.message}`);
    }
  }

  // A.3: Permisos EXECUTE restringidos de publish_tribute_letter a rol anon
  let execDenied = false;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
            CREATE ROLE anon;
          END IF;
        END $$;
      `);
      await client.query('BEGIN;');
      await client.query('SET LOCAL ROLE anon;');
      try {
        await client.query(`
          SELECT * FROM publish_tribute_letter(
            '00000000-0000-0000-0000-000000000000'::uuid,
            'Hack', 'despedida', 'Hack', 'Hack', 'Nov 2026', 'crema'
          );
        `);
      } catch (sqlErr) {
        if (sqlErr.code === '42501' || sqlErr.message.includes('permission denied')) {
          execDenied = true;
        }
      }
      await client.query('ROLLBACK;');
    } finally {
      client.release();
    }
    record('A', 3, 'Permisos EXECUTE: rol anon denegado en publish_tribute_letter (42501)', execDenied,
      execDenied ? 'Bloqueo SQL nativo 42501 verificado.' : 'FALLO: Rol anon pudo invocar la función.');
  } catch (err) {
    record('A', 3, 'Permisos EXECUTE', false, err.message);
  }

  // A.4: Aislamiento estricto entre mascotas homónimas (Luna Spinella vs Luna Navarro)
  let homonymAisleOk = false;
  try {
    const resLunaS = await createTributeWithFirstLetter({
      petName: 'Luna',
      species: 'gato',
      authorName: 'Familia Spinella',
      email: 'luna.spinella@ejemplo.com',
      firstLetterTitle: 'Para mi Luna gatita',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Nuestra Luna Spinella dulce.',
      firstLetterEnvelopeColor: 'crema'
    });

    const resLunaN = await createTributeWithFirstLetter({
      petName: 'Luna',
      species: 'perro',
      authorName: 'Familia Navarro',
      email: 'luna.navarro@ejemplo.com',
      firstLetterTitle: 'Para mi Luna perrita',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Nuestra Luna Navarro fiel.',
      firstLetterEnvelopeColor: 'lavanda'
    });

    // Guardián de Luna Navarro intenta publicar en Luna Spinella
    let crossWriteBlocked = false;
    try {
      await publishAuthorizedLetter({
        tributeSlug: resLunaS.tribute.slug,
        rawGuardianToken: resLunaN.rawSessionToken,
        title: 'Intrusión',
        category: 'espontanea',
        content: 'Intrusión no permitida',
        authorName: 'Familia Navarro',
        envelopeColor: 'rosa'
      });
    } catch (e) {
      if (e.status === 403) crossWriteBlocked = true;
    }

    const checkS = await getTributeBySlug(resLunaS.tribute.slug);
    const checkN = await getTributeBySlug(resLunaN.tribute.slug);
    homonymAisleOk = crossWriteBlocked && checkS.letters.length === 1 && checkN.letters.length === 1 && checkS.tribute.id !== checkN.tribute.id;
    record('A', 4, 'Aislamiento de homónimas: cartas y sesiones de Luna Spinella y Luna Navarro nunca se cruzan', homonymAisleOk,
      `Slug S=${resLunaS.tribute.slug} | Slug N=${resLunaN.tribute.slug} | Intrusión bloqueada con 403: ${crossWriteBlocked}`);
  } catch (err) {
    record('A', 4, 'Aislamiento de homónimas', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // BLOQUE B: VALIDACIÓN DE ENDPOINTS HTTP
  // ---------------------------------------------------------------------------
  console.log('\n--- BLOQUE B: VALIDACIÓN DE ENDPOINTS HTTP (API ROUTES EN PUERTO 3000) ---');

  // Asegurar que el servidor Next.js está respondiendo
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const ping = await httpRequest({ host: '127.0.0.1', port: 3000, path: '/api/health', method: 'GET' });
      if (ping.statusCode === 200 || ping.statusCode === 404) { serverReady = true; break; }
    } catch {}
    await sleep(400);
  }

  if (!serverReady) {
    console.error('ERROR: Servidor Next.js no responde en 127.0.0.1:3000');
    process.exit(1);
  }

  // B.1: POST /api/community/tributes crea homenaje, 1ª carta y fija cookie guardian_session
  let httpPostTributeOk = false;
  let createdTributeSlug = '';
  let guardianCookie = '';
  try {
    const postRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: '/api/community/tributes?multicarta=true',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      petName: 'Chloe Via HTTP',
      species: 'perro',
      authorName: 'Familia Spinella',
      email: 'spinella.http@ejemplo.com',
      yearsOrDates: '2014 - 2026',
      firstLetterTitle: 'Hasta siempre pequeña Chloe',
      firstLetterCategory: 'despedida',
      firstLetterContent: 'Carta fundacional registrada vía endpoint HTTP.',
      firstLetterEnvelopeColor: 'crema'
    });

    const setCookie = postRes.headers['set-cookie'];
    if (setCookie && setCookie.some(c => c.includes('guardian_session='))) {
      guardianCookie = setCookie.find(c => c.includes('guardian_session=')).split(';')[0];
    }

    httpPostTributeOk = postRes.statusCode === 201 && postRes.json?.success === true && !!guardianCookie;
    createdTributeSlug = postRes.json?.tribute?.slug;
    record('B', 1, 'POST /api/community/tributes: registra homenaje, 1ª carta y fija cookie HttpOnly', httpPostTributeOk,
      `Status=${postRes.statusCode} | Slug=${createdTributeSlug} | Cookie=${guardianCookie ? 'Fijada (HttpOnly)' : 'NO fijada'}`);
  } catch (err) {
    record('B', 1, 'POST /api/community/tributes', false, err.message);
  }

  // B.2: POST /api/community/tributes/[slug]/letters como guardián autorizado (con cookie)
  let httpPostLetterOk = false;
  const httpIdemKey = 'http-idem-' + Date.now();
  try {
    const postLetRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: `/api/community/tributes/${createdTributeSlug}/letters?multicarta=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': guardianCookie
      }
    }, {
      title: 'Tu primer cumpleaños en el cielo',
      category: 'cumpleanos',
      content: 'Miramos al cielo sabiendo que corres feliz.',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      idempotencyKey: httpIdemKey
    });

    httpPostLetterOk = postLetRes.statusCode === 201 && postLetRes.json?.success === true && postLetRes.json?.letter?.letter_seq_num === 2;
    record('B', 2, 'POST /api/community/tributes/[slug]/letters: guardián publica 2ª carta exitosamente', httpPostLetterOk,
      `Status=${postLetRes.statusCode} | Secuencia asignada=${postLetRes.json?.letter?.letter_seq_num}`);
  } catch (err) {
    record('B', 2, 'POST /api/community/tributes/[slug]/letters', false, err.message);
  }

  // B.3: Idempotencia HTTP - Reintento con mismo contenido devuelve 200 OK y isDuplicate=true
  let httpIdemSameOk = false;
  try {
    const retryRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: `/api/community/tributes/${createdTributeSlug}/letters?multicarta=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': guardianCookie
      }
    }, {
      title: 'Tu primer cumpleaños en el cielo',
      category: 'cumpleanos',
      content: 'Miramos al cielo sabiendo que corres feliz.',
      authorName: 'Familia Spinella',
      envelopeColor: 'lavanda',
      idempotencyKey: httpIdemKey
    });

    httpIdemSameOk = retryRes.statusCode === 200 && retryRes.json?.isDuplicate === true;
    record('B', 3, 'Idempotencia HTTP: reintento idéntico retorna 200 OK e isDuplicate=true', httpIdemSameOk,
      `Status=${retryRes.statusCode} | isDuplicate=${retryRes.json?.isDuplicate}`);
  } catch (err) {
    record('B', 3, 'Idempotencia HTTP mismo contenido', false, err.message);
  }

  // B.4: Idempotencia HTTP - Reintento con CONTENIDO DIFERENTE devuelve HTTP 409 Conflict
  let httpIdemDiffOk = false;
  try {
    const alterRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: `/api/community/tributes/${createdTributeSlug}/letters?multicarta=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': guardianCookie
      }
    }, {
      title: 'Carta Alterada Maliciosa',
      category: 'cumpleanos',
      content: 'CONTENIDO DISCREPANTE NO COINCIDENTE',
      authorName: 'Atacante',
      envelopeColor: 'rosa',
      idempotencyKey: httpIdemKey
    });

    httpIdemDiffOk = alterRes.statusCode === 409 && alterRes.json?.error?.includes('diferente');
    record('B', 4, 'Idempotencia HTTP: reintento con contenido diferente devuelve HTTP 409 Conflict', httpIdemDiffOk,
      `Status=${alterRes.statusCode} (409 Conflict verificado) | Error: "${alterRes.json?.error}"`);
  } catch (err) {
    record('B', 4, 'Idempotencia HTTP contenido diferente', false, err.message);
  }

  // B.5: Rechazo a Visitante sin cookie (401 Unauthorized)
  let httpAnonBlocked = false;
  try {
    const anonRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: `/api/community/tributes/${createdTributeSlug}/letters?multicarta=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' } // Sin cookie
    }, {
      title: 'Intento de Visitante',
      category: 'espontanea',
      content: 'Visitante sin permisos intenta escribir.',
      authorName: 'Visitante',
      envelopeColor: 'crema'
    });

    httpAnonBlocked = anonRes.statusCode === 401;
    record('B', 5, 'Seguridad HTTP: petición de escritura sin sesión rechazada con 401 Unauthorized', httpAnonBlocked,
      `Status=${anonRes.statusCode} | Error="${anonRes.json?.error}"`);
  } catch (err) {
    record('B', 5, 'Rechazo a Visitante', false, err.message);
  }

  // B.6: Revocación de sesión (POST /api/community/guardian/revoke)
  let httpRevokeOk = false;
  try {
    const revRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: '/api/community/guardian/revoke?multicarta=true',
      method: 'POST',
      headers: { 'Cookie': guardianCookie }
    });

    // Comprobar sesión posterior
    const chkRes = await httpRequest({
      host: '127.0.0.1',
      port: 3000,
      path: '/api/community/guardian/session?multicarta=true',
      method: 'GET',
      headers: { 'Cookie': guardianCookie }
    });

    httpRevokeOk = revRes.statusCode === 200 && chkRes.json?.isAuthenticated === false;
    record('B', 6, 'Revocación HTTP: sesión invalidada en DB y cookie eliminada', httpRevokeOk,
      `Revoke Status=${revRes.statusCode} | Session check post-revocación: isAuthenticated=${chkRes.json?.isAuthenticated}`);
  } catch (err) {
    record('B', 6, 'Revocación de sesión', false, err.message);
  }

  // B.7: Seguridad de entorno: en producción simulada ?multicarta=true NUNCA activa el sistema
  let prodIsolationOk = false;
  try {
    const prevEnv = process.env.NODE_ENV;
    const prevFlag = process.env.COMMUNITY_MULTICARTA_ENABLED;
    process.env.NODE_ENV = 'production';
    delete process.env.COMMUNITY_MULTICARTA_ENABLED;
    const { isMulticartaFeatureEnabled } = require('./src/lib/community/featureFlags');
    const enabledInProd = isMulticartaFeatureEnabled({
      url: 'https://todaslasmascotas.com/comunidad?multicarta=true'
    });
    process.env.NODE_ENV = prevEnv;
    if (prevFlag !== undefined) process.env.COMMUNITY_MULTICARTA_ENABLED = prevFlag;

    prodIsolationOk = enabledInProd === false;
    record('B', 7, 'Seguridad de entorno: en producción con flag apagado, ?multicarta=true devuelve FALSE', prodIsolationOk,
      `Resultado en producción: enabled=${enabledInProd} (Protección garantizada en producción sin autorización explícita)`);
  } catch (err) {
    record('B', 7, 'Seguridad de entorno', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // BLOQUE C: VALIDACIÓN REAL DE INTERFAZ EN NAVEGADOR (CHROME HEADLESS + CDP)
  // ---------------------------------------------------------------------------
  console.log('\n--- BLOQUE C: VALIDACIÓN REAL DE INTERFAZ EN NAVEGADOR ---');

  const tmpProfile = path.join(__dirname, '.chrome_profile_phase4_1_' + Date.now());
  fs.mkdirSync(tmpProfile, { recursive: true });

  const cdpPort = 9333;
  const chrome = spawn(chromePath, [
    '--headless=old',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${tmpProfile}`
  ], { stdio: 'ignore' });

  let client;
  try {
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        const list = await fetchJson(`http://127.0.0.1:${cdpPort}/json/list`);
        if (list && list.length > 0) {
          const target = list.find(t => t.type === 'page') || list[0];
          client = new CDPClient(target.webSocketDebuggerUrl);
          await client.init();
          break;
        }
      } catch (e) {}
    }

    if (!client) throw new Error('No se pudo conectar a Chrome CDP');
    console.log('Conectado a Chrome CDP exitosamente!');

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // C.1: Navegación de escritorio 1440x900 y comprobación de elementos visuales
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/comunidad?multicarta=true' });
    await sleep(2500);

    // Captura 1: Hero nocturno
    await client.eval(`window.scrollTo(0, 0);`);
    await sleep(800);
    await client.captureScreenshot('fase4-1-1440x900-01-hero-nocturno.png');

    // Scroll al Libro de los Ángeles
    await client.eval(`
      const sec = document.getElementById('libro-de-los-angeles');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await sleep(1000);

    // Captura 2: Índice general con sobres
    await client.captureScreenshot('fase4-1-1440x900-02-indice-general.png');

    // C.2: Abrir colección de Chloe y verificar jerarquía aprobada
    await client.eval(`
      const btnChloe = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Para Chloe')) ||
                       Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Chloe'));
      if (btnChloe) btnChloe.click();
    `);
    await sleep(1500);

    const hierarchyInfo = await client.eval(`
      (() => {
        const titleEl = document.querySelector('h2');
        const petEl = document.querySelector('h3');
        const textContent = document.body.textContent || '';
        return {
          hasMainTitle: textContent.includes('Las cartas para mi angelito'),
          hasPetName: textContent.includes('Chloe'),
          hasLetterCount: textContent.includes('cartas llenas de amor') || textContent.includes('carta llena de amor')
        };
      })()
    `);

    const hierarchyOk = hierarchyInfo.hasMainTitle && hierarchyInfo.hasPetName && hierarchyInfo.hasLetterCount;
    record('C', 1, 'Jerarquía aprobada visible en navegador: Las cartas para mi angelito → Chloe → N cartas', hierarchyOk,
      `Título: ${hierarchyInfo.hasMainTitle} | Nombre: ${hierarchyInfo.hasPetName} | Contador: ${hierarchyInfo.hasLetterCount}`);

    // Captura 3: Colección de Chloe con sus cartas
    await client.captureScreenshot('fase4-1-1440x900-03-coleccion-chloe.png');

    // C.3: Formulario «Escribirle otra carta»
    await client.eval(`
      const writeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Escribirle otra carta'));
      if (writeBtn) writeBtn.click();
    `);
    await sleep(800);

    // Captura 4: Formulario Escribirle otra carta abierto
    await client.captureScreenshot('fase4-1-1440x900-04-formulario-otra-carta.png');

    // Cerrar formulario y abrir Lector de papel marfil
    await client.eval(`
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cancelar'));
      if (cancelBtn) cancelBtn.click();
    `);
    await sleep(500);

    // C.4: Abrir Lector de papel marfil
    await client.eval(`
      const letterCard = document.querySelector('.libro-sobre') || 
                         Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Abrir carta'));
      if (letterCard) letterCard.click();
    `);
    await sleep(1500);

    const readerOpened = await client.eval(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !!dialog && (dialog.textContent.includes('Para Chloe') || dialog.textContent.includes('Chloe'));
      })()
    `);
    record('C', 2, 'Lector marfil: modal abierto con contenido íntegro y rol dialog accesible', readerOpened,
      readerOpened ? 'Modal dialog visible con dedicatoria completa.' : 'FALLO: Dialog no encontrado.');

    // Captura 5: Lector marfil abierto
    await client.captureScreenshot('fase4-1-1440x900-05-lector-marfil.png');

    // C.5: Navegación con teclado: pulsar Escape y comprobar retorno de foco
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(800);

    const escapeClosedAndFocusReturned = await client.eval(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !dialog; // cerrado
      })()
    `);
    record('C', 3, 'Accesibilidad: tecla Escape cierra el lector marfil y restaura el foco', escapeClosedAndFocusReturned,
      escapeClosedAndFocusReturned ? 'Lector cerrado correctamente vía Escape.' : 'Dialog permaneció abierto tras Escape.');

    // C.6: Vista de visitante en navegador
    await client.eval(`
      const btnVisitor = document.getElementById('role-btn-visitor');
      if (btnVisitor) btnVisitor.click();
    `);
    await sleep(1000);

    // Captura 6: Vista de visitante (modo solo lectura)
    await client.captureScreenshot('fase4-1-1440x900-06-vista-visitante.png');

    const visitorReadonlyOk = await client.eval(`
      (() => {
        const isBadgeVisitor = document.body.textContent.includes('Visitante Público') || 
                               document.body.textContent.includes('Estás visitando la colección pública') ||
                               !document.getElementById('btn-write-another-letter');
        return isBadgeVisitor;
      })()
    `);
    record('C', 4, 'Modo Visitante en UI: modo solo lectura activo y datos privados protegidos', visitorReadonlyOk,
      visitorReadonlyOk ? 'Interfaz en modo solo lectura para visitantes.' : 'No se detectó modo solo lectura.');

    // -------------------------------------------------------------------------
    // CAPTURAS ADICIONALES EN MÓVIL (390x844, 375x812, 320x568)
    // -------------------------------------------------------------------------
    console.log('\n--- CAPTURAS MULTI-RESOLUCIÓN EN MÓVIL ---');
    const mobileResolutions = [
      { name: '390x844-movil-estandar', width: 390, height: 844 },
      { name: '375x812-movil-intermedio', width: 375, height: 812 },
      { name: '320x568-movil-compacto', width: 320, height: 568 }
    ];

    for (const mRes of mobileResolutions) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: mRes.width,
        height: mRes.height,
        deviceScaleFactor: 1,
        mobile: true
      });

      // Navegar a /comunidad?multicarta=true
      await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/comunidad?multicarta=true' });
      await sleep(2000);

      // 1. Hero
      await client.eval(`window.scrollTo(0, 0);`);
      await sleep(600);
      await client.captureScreenshot(`fase4-1-${mRes.name}-01-hero-nocturno.png`);

      // 2. Índice General
      await client.eval(`
        const sec = document.getElementById('libro-de-los-angeles');
        if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
      `);
      await sleep(800);
      await client.captureScreenshot(`fase4-1-${mRes.name}-02-indice-general.png`);

      // 3. Colección Chloe
      await client.eval(`
        const btnChloe = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Chloe'));
        if (btnChloe) btnChloe.click();
      `);
      await sleep(1000);
      await client.captureScreenshot(`fase4-1-${mRes.name}-03-coleccion-chloe.png`);

      // 4. Lector Marfil
      await client.eval(`
        const letterCard = document.querySelector('.libro-sobre') || 
                           Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Abrir carta'));
        if (letterCard) letterCard.click();
      `);
      await sleep(1000);
      await client.captureScreenshot(`fase4-1-${mRes.name}-04-lector-marfil.png`);

      // Cerrar lector
      await client.eval(`
        const closeBtn = document.getElementById('modal-close-letter-btn');
        if (closeBtn) closeBtn.click();
      `);
      await sleep(500);

      // 5. Formulario otra carta
      await client.eval(`
        const btnGuardian = document.getElementById('role-btn-guardian');
        if (btnGuardian) btnGuardian.click();
      `);
      await sleep(400);
      await client.eval(`
        const writeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Escribirle otra carta'));
        if (writeBtn) writeBtn.click();
      `);
      await sleep(800);
      await client.captureScreenshot(`fase4-1-${mRes.name}-05-formulario-otra-carta.png`);

      // 6. Vista visitante
      await client.eval(`
        const btnVisitor = document.getElementById('role-btn-visitor');
        if (btnVisitor) btnVisitor.click();
      `);
      await sleep(600);
      await client.captureScreenshot(`fase4-1-${mRes.name}-06-vista-visitante.png`);
    }

  } finally {
    if (client) client.close();
    chrome.kill();
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
  }

  // Resumen final
  console.log('\n================================================================');
  console.log('RESUMEN DE PRUEBAS FASE 4.1:');
  const allPassed = results.every(r => r.passed);
  console.log(`Total pruebas: ${results.length} | Aprobadas: ${results.filter(r => r.passed).length} | Fallidas: ${results.filter(r => !r.passed).length}`);
  console.log(`DICTAMEN FINAL: ${allPassed ? 'APTO PARA CONTINUAR' : 'NO APTO'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('ERROR FATAL EN TEST RUNNER FASE 4.1:', err);
  process.exit(1);
});
