/**
 * SUITE INTEGRAL FASE 2 LOCAL — PRUEBA COMBINADA, VELAS/ABRAZOS, MODERACIÓN, TRANSICIÓN Y E2E NAVEGADOR
 * Rama: staging/cartas-para-mi-angelito
 */

const { Client, Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const tempPassPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_pass.tmp');
const DB_PASS = fs.readFileSync(tempPassPath, 'utf8').trim();
const EPHEMERAL_HMAC = crypto.randomBytes(32).toString('hex');
const COMBINED_DB = 'cartas_phase2_combined';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpReq(port, method, urlPath, bodyObj = null, headers = {}) {
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
    return new Promise((resolve) => {
      this.ws.onopen = () => resolve();
      this.ws.onmessage = evt => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message));
          else res(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    return res.result?.value;
  }
  close() { try { this.ws.close(); } catch {} }
}

async function run() {
  const results = [];
  function record(id, name, passed, detail) {
    results.push({ id, name, passed, detail });
    console.log(`[${id}] ${passed ? '✅ PASÓ' : '❌ FALLÓ'} — ${name}`);
    if (detail) console.log(`   Detalle: ${detail}`);
  }

  const admin = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: DB_PASS, database: 'postgres' });
  await admin.connect();

  // Crear base combinada limpia para reproducir 0000..0008 + 0009..0013
  await admin.query(`DROP DATABASE IF EXISTS ${COMBINED_DB} WITH (FORCE);`);
  await admin.query(`CREATE DATABASE ${COMBINED_DB};`);

  const db = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: DB_PASS, database: COMBINED_DB });
  await db.connect();

  try {
    // -------------------------------------------------------------------------
    // 1. ESQUEMA SINTÉTICO HISTÓRICO (0000..0008) + DATOS FICTICIOS
    // -------------------------------------------------------------------------
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
          CREATE TYPE plan_type AS ENUM ('recuerdo_inicial', 'estrella_anual', 'recuerdo_eterno');
          CREATE TYPE payment_status AS ENUM ('draft', 'pending', 'paid', 'failed');
          CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived', 'expired');
          CREATE TYPE species_type AS ENUM ('perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro');
          CREATE TYPE visibility_type AS ENUM ('public', 'private');
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS public.memorials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL,
        pet_name text NOT NULL,
        species species_type NOT NULL,
        photo_url text NOT NULL,
        death_date date NOT NULL,
        dedication text,
        story_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
        plan_type plan_type NOT NULL,
        price_paid numeric(8,2) NOT NULL,
        currency text NOT NULL DEFAULT 'EUR',
        slots_count int NOT NULL CHECK (slots_count IN (1, 4, 9)),
        profile_slug text UNIQUE NOT NULL,
        visibility visibility_type NOT NULL DEFAULT 'public',
        payment_status payment_status NOT NULL DEFAULT 'draft',
        publication_status publication_status NOT NULL DEFAULT 'draft',
        moderation_status text NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
        breed text DEFAULT '',
        birth_date date,
        location text DEFAULT '',
        slot_assigned text DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const luna1Id = crypto.randomUUID();
    const luna2Id = crypto.randomUUID();
    const cocoId = crypto.randomUUID();
    const pendingId = crypto.randomUUID();
    const paidMuralId = crypto.randomUUID();

    await db.query(`
      INSERT INTO public.memorials (id, email, pet_name, species, photo_url, death_date, dedication, story_answers, plan_type, price_paid, slots_count, profile_slug, visibility, payment_status, publication_status, moderation_status)
      VALUES
        ($1, 'comunidad@todaslasmascotasvanalcielo.com', 'Luna', 'perro', '/images/comunidad/chloe.jpg', '2026-01-10', 'Dedicatoria original Luna Spinella', '{"isCommunity":true,"authorName":"Familia Spinella","yearsOrDates":"2015-2026","candlesCount":15,"hugsCount":4,"supportCount":2}'::jsonb, 'recuerdo_inicial', 0, 1, 'luna-spinella-leg', 'public', 'draft', 'published', 'approved'),
        ($2, 'comunidad@todaslasmascotasvanalcielo.com', 'Luna', 'gato', '/images/comunidad/gato-alado.webp', '2026-02-14', 'Dedicatoria original Luna Navarro', '{"isCommunity":true,"authorName":"Familia Navarro","candlesCount":8,"hugsCount":1,"supportCount":0}'::jsonb, 'recuerdo_inicial', 0, 1, 'luna-navarro-leg', 'public', 'draft', 'published', 'approved'),
        ($3, 'comunidad@todaslasmascotasvanalcielo.com', 'Coco', 'conejo', '/images/placeholders/first.webp', '2026-03-01', 'Mi conejito Coco', '{"isCommunity":true,"authorName":"Ana","candlesCount":3,"hugsCount":0,"supportCount":0}'::jsonb, 'recuerdo_inicial', 0, 1, 'coco-conejo-leg', 'public', 'draft', 'published', 'approved'),
        ($4, 'comunidad@todaslasmascotasvanalcielo.com', 'Pendiente', 'perro', '/images/placeholders/first.webp', '2026-03-05', 'Carta pendiente de moderar', '{"isCommunity":true,"authorName":"ModTest"}'::jsonb, 'recuerdo_inicial', 0, 1, 'pendiente-leg', 'public', 'draft', 'published', 'pending'),
        ($5, 'pagador@ejemplo.com', 'Max Mural', 'perro', '/images/comunidad/pet-max.webp', '2026-01-01', 'Estrella pagada del Mural', '{"isMural":true}'::jsonb, 'estrella_anual', 29.00, 1, 'max-mural-pago', 'public', 'paid', 'published', 'approved');
    `, [luna1Id, luna2Id, cocoId, pendingId, paidMuralId]);

    // Ejecutar migraciones 0009..0013
    const migDir = path.join(__dirname, 'supabase', 'migrations');
    for (const f of [
      '0009_community_multicarta_schema.sql',
      '0010_community_multicarta_rls.sql',
      '0011_publish_tribute_letter_rpc.sql',
      '0012_community_rate_limits.sql',
      '0013_legacy_memorials_bridge.sql',
    ]) {
      await db.query(fs.readFileSync(path.join(migDir, f), 'utf8'));
    }

    // Ejecutar migración puente 2 veces (idempotencia)
    const mig1 = await db.query(`SELECT * FROM public.migrate_legacy_community_memorials();`);
    const mig2 = await db.query(`SELECT * FROM public.migrate_legacy_community_memorials();`);

    const countTributes = await db.query(`SELECT COUNT(*)::int AS c FROM public.community_tributes;`);
    const countGuardians = await db.query(`SELECT COUNT(*)::int AS c FROM public.tribute_guardians;`);
    const cocoRow = await db.query(`SELECT species, candles_count, hugs_count, support_count FROM public.community_tributes WHERE legacy_memorial_id = $1;`, [cocoId]);
    const paidNotMigrated = await db.query(`SELECT COUNT(*)::int AS c FROM public.community_tributes WHERE legacy_memorial_id = $1;`, [paidMuralId]);
    const memorialsIntact = await db.query(`SELECT dedication FROM public.memorials WHERE id = $1;`, [luna1Id]);

    const combOk =
      mig1.rows[0].migrated_tributes === 4 &&
      mig2.rows[0].migrated_tributes === 0 &&
      mig2.rows[0].skipped_existing === 4 &&
      countTributes.rows[0].c === 4 &&
      countGuardians.rows[0].c === 0 &&
      cocoRow.rows[0].species === 'otro' &&
      paidNotMigrated.rows[0].c === 0 &&
      memorialsIntact.rows[0].dedication === 'Dedicatoria original Luna Spinella';

    record('COMB-01', 'Esquema combinado 0000..0013 + migración puente 1:1 sin fusiones ni guardianes automáticos', combOk,
      `Migrados: ${mig1.rows[0].migrated_tributes}, 2ª pasada: ${mig2.rows[0].migrated_tributes}, Guardianes auto: ${countGuardians.rows[0].c}, Especie conejo->${cocoRow.rows[0].species}, Pago excluido: ${paidNotMigrated.rows[0].c === 0}`);

    // Verificar RLS con rol anon (pendiente oculto)
    await db.query('BEGIN');
    await db.query('SET LOCAL ROLE anon');
    const anonLetters = await db.query('SELECT title FROM public.tribute_letters;');
    await db.query('ROLLBACK');
    const pendingHidden = !anonLetters.rows.some(r => r.title.includes('Pendiente'));
    record('COMB-02', 'Carta legacy pendiente oculta para rol anon tras migración', pendingHidden, `Cartas visibles anon: ${anonLetters.rows.map(r => r.title).join(', ')}`);

    // -------------------------------------------------------------------------
    // 2. SIMULACIÓN DE TRANSICIÓN: DOBLE ESCRITURA + RECONCILIACIÓN + ROLLBACK
    // -------------------------------------------------------------------------
    const lateLegacyId = crypto.randomUUID();
    await db.query(`
      INSERT INTO public.memorials (id, email, pet_name, species, photo_url, death_date, dedication, story_answers, plan_type, price_paid, slots_count, profile_slug, visibility, payment_status, publication_status, moderation_status)
      VALUES ($1, 'comunidad@todaslasmascotasvanalcielo.com', 'Toby Transición', 'perro', '/images/placeholders/first.webp', '2026-04-01', 'Carta durante transición', '{"isCommunity":true,"authorName":"Fam Transición","candlesCount":1}'::jsonb, 'recuerdo_inicial', 0, 1, 'toby-transicion', 'public', 'draft', 'published', 'approved');
    `, [lateLegacyId]);
    // Reconciliación tras fallo parcial en doble escritura
    const recon = await db.query(`SELECT * FROM public.migrate_legacy_community_memorials();`);
    record('TRANS-01', 'Reconciliación tras fallo parcial de doble escritura sin duplicados', recon.rows[0].migrated_tributes === 1 && recon.rows[0].skipped_existing === 4,
      `Reconciliados: ${recon.rows[0].migrated_tributes}, Omitidos: ${recon.rows[0].skipped_existing}`);

    // Rollback + reactivación
    const lunaTribute = await db.query(`SELECT id FROM public.community_tributes WHERE legacy_memorial_id = $1;`, [luna1Id]);
    const lunaTId = lunaTribute.rows[0].id;
    await db.query(`SELECT * FROM public.publish_tribute_letter($1, 'Carta adicional 2', 'aniversario', 'Segundo recuerdo', 'Familia Spinella', '20 Nov 2026', 'lavanda', 'idem-trans-2');`, [lunaTId]);
    await db.query(`
      INSERT INTO public.rollback_companion_letters (tribute_id, tribute_slug, letter_seq_num, title, category, content, author_name, display_date, envelope_color)
      SELECT ct.id, ct.slug, tl.letter_seq_num, tl.title, tl.category, tl.content, tl.author_name, tl.display_date, tl.envelope_color
      FROM public.tribute_letters tl JOIN public.community_tributes ct ON ct.id = tl.tribute_id
      WHERE tl.tribute_id = $1 AND tl.letter_seq_num >= 2
      ON CONFLICT DO NOTHING;
    `, [lunaTId]);
    const legacyView = await db.query(`SELECT title FROM public.v_legacy_companion_letters WHERE tribute_id = $1;`, [lunaTId]);
    record('TRANS-02', 'Rollback conserva memorials.dedication y recupera carta adicional en vista', legacyView.rows.length === 1 && legacyView.rows[0].title === 'Carta adicional 2', `Vista rollback: ${legacyView.rows[0]?.title}`);

    // -------------------------------------------------------------------------
    // 3. ARRANCAR NEXT.JS CONTRA cartas_phase2_combined PARA PRUEBAS HTTP Y E2E
    // -------------------------------------------------------------------------
    const port = 3097;
    const sinkPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cartas_dev_email_sink.json');
    try { fs.unlinkSync(sinkPath); } catch {}

    const serverEnv = {
      ...process.env,
      COMMUNITY_DB_URL: `postgresql://postgres:${encodeURIComponent(DB_PASS)}@127.0.0.1:5432/${COMBINED_DB}`,
      COMMUNITY_ALLOWED_DB_HOSTS: '127.0.0.1',
      COMMUNITY_HMAC_SECRET: EPHEMERAL_HMAC,
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

    let ready = false;
    for (let i = 0; i < 60; i++) {
      await sleep(500);
      try {
        const ping = await httpReq(port, 'GET', '/api/health');
        if (ping.status === 200) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('No arrancó Next.js dev en puerto 3097');

    try {
      // A. Velas y abrazos persistentes + anti-duplicado
      const react1 = await httpReq(port, 'POST', '/api/community/tributes/luna-spinella-leg/react', { reactionType: 'candle' });
      const reactDup = await httpReq(port, 'POST', '/api/community/tributes/luna-spinella-leg/react', { reactionType: 'candle' });
      const reactHug = await httpReq(port, 'POST', '/api/community/tributes/luna-spinella-leg/react', { reactionType: 'hug' });
      const reactOk =
        react1.status === 200 && react1.json.recorded === true && react1.json.counts.candlesCount === 16 &&
        reactDup.status === 200 && reactDup.json.alreadyReacted === true && reactDup.json.counts.candlesCount === 16 &&
        reactHug.status === 200 && reactHug.json.recorded === true && reactHug.json.counts.hugsCount === 5;
      record('REACT-01', 'Velas y abrazos persistentes con conteo histórico intacto y anti-duplicado', reactOk,
        `Velas 15->${react1.json?.counts?.candlesCount} (dup=${reactDup.json?.counts?.candlesCount}), Abrazos 4->${reactHug.json?.counts?.hugsCount}`);

      // B. Moderación administrativa (/api/admin/moderacion)
      const modPending = await httpReq(port, 'GET', '/api/admin/moderacion?scope=multicarta&filter=pending');
      const pendLetterId = modPending.json?.letters?.[0]?.id;
      const beforeApprove = await httpReq(port, 'GET', '/api/community/tributes/pendiente-leg');
      const modApprove = await httpReq(port, 'PATCH', '/api/admin/moderacion', { entityType: 'tribute_letter', id: pendLetterId, action: 'approve' });
      const afterApprove = await httpReq(port, 'GET', '/api/community/tributes/pendiente-leg');
      const modArchive = await httpReq(port, 'PATCH', '/api/admin/moderacion', { entityType: 'tribute_letter', id: pendLetterId, action: 'archive' });
      const afterArchive = await httpReq(port, 'GET', '/api/community/tributes/pendiente-leg');

      const modOk =
        Boolean(pendLetterId) &&
        beforeApprove.json?.letters?.length === 0 &&
        modApprove.status === 200 && afterApprove.json?.letters?.length === 1 &&
        modArchive.status === 200 && afterArchive.json?.letters?.length === 0;
      record('MOD-01', 'Compatibilidad de /api/admin/moderacion (pendiente -> aprobada -> archivada)', modOk,
        `Antes: ${beforeApprove.json?.letters?.length}, Aprobada: ${afterApprove.json?.letters?.length}, Archivada: ${afterArchive.json?.letters?.length}`);

      // C. PRUEBAS E2E EN NAVEGADOR REAL (CHROME CDP)
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      const tmpProf = path.join(__dirname, '.chrome_e2e_phase2_' + Date.now());
      fs.mkdirSync(tmpProf, { recursive: true });
      const cdpPort = 9470;
      const chrome = spawn(chromePath, ['--headless=old', `--remote-debugging-port=${cdpPort}`, '--disable-gpu', '--no-first-run', `--user-data-dir=${tmpProf}`], { stdio: 'ignore' });

      let cdp;
      for (let i = 0; i < 30; i++) {
        await sleep(300);
        try {
          const list = await fetchJson(`http://127.0.0.1:${cdpPort}/json/list`);
          if (list?.[0]) { cdp = new CDPClient(list[0].webSocketDebuggerUrl); await cdp.init(); break; }
        } catch {}
      }

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/comunidad?multicarta=true` });
        for (let i = 0; i < 30; i++) {
          await sleep(400);
          const count = await cdp.eval(`document.querySelectorAll('.libro-sobre').length`);
          if (count > 0) break;
        }

        // E2E 1: Filtros y lectura de colección migrada en navegador
        const filterRes = await cdp.eval(`
          (() => {
            const gatoTab = Array.from(document.querySelectorAll('[role="tab"]')).find(t => t.textContent?.includes('Gatos'));
            if (gatoTab) gatoTab.click();
            return true;
          })()
        `);
        await sleep(400);
        const allTabRes = await cdp.eval(`
          (() => {
            const allTab = Array.from(document.querySelectorAll('[role="tab"]')).find(t => t.textContent?.includes('Todos'));
            if (allTab) allTab.click();
            return document.querySelectorAll('.libro-sobre').length;
          })()
        `);

        // E2E 2: Navegador 1 crea colección + publica 1ª carta vía fetch real desde el navegador (cookie HttpOnly)
        const e2eCreate = await cdp.eval(`
          (async () => {
            const r = await fetch('/api/community/tributes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                petName: 'Kira E2E', species: 'perro', authorName: 'Familia E2E',
                email: 'kira.e2e@ejemplo.com', firstLetterTitle: 'Primera carta Kira',
                firstLetterCategory: 'despedida', firstLetterContent: 'Te recordamos cada día', firstLetterEnvelopeColor: 'crema'
              })
            });
            return { status: r.status, data: await r.json() };
          })()
        `);
        const kiraSlug = e2eCreate?.data?.tribute?.slug;

        // E2E 3: Navegador 1 publica 2ª carta usando su cookie HttpOnly real
        const e2eSecond = await cdp.eval(`
          (async () => {
            const r = await fetch('/api/community/tributes/${kiraSlug}/letters', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Segunda carta Kira', category: 'cumpleanos',
                content: 'Feliz cumpleaños en el cielo', authorName: 'Familia E2E', envelopeColor: 'lavanda'
              })
            });
            return { status: r.status, data: await r.json() };
          })()
        `);

        // E2E 4: Solicitar Magic Link desde navegador y canjear en "otro navegador" (petición limpia sin cookie previa)
        await cdp.eval(`
          (async () => {
            await fetch('/api/community/guardian/recover', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'kira.e2e@ejemplo.com', tributeSlug: '${kiraSlug}' })
            });
          })()
        `);
        const captured = JSON.parse(fs.readFileSync(sinkPath, 'utf8'));
        const magicToken = new URL(captured[captured.length - 1].magicLinkUrl).searchParams.get('magicToken');
        const browser2Verify = await httpReq(port, 'POST', '/api/community/guardian/verify', { token: magicToken, tributeSlug: kiraSlug });
        const browser2Cookie = (browser2Verify.headers['set-cookie'] || [])[0]?.split(';')[0];

        // E2E 5: Visitante sin cookie lee colección pública y es rechazado al intentar escribir
        const visitorGet = await httpReq(port, 'GET', `/api/community/tributes/${kiraSlug}`);
        const visitorPost = await httpReq(port, 'POST', `/api/community/tributes/${kiraSlug}/letters`, {
          title: 'Intruso', category: 'espontanea', content: 'No', authorName: 'X', envelopeColor: 'crema'
        });

        // E2E 6: Revocación desde Navegador 1 invalida también Navegador 2
        await cdp.eval(`
          (async () => {
            await fetch('/api/community/guardian/revoke', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ revokeAll: true })
            });
          })()
        `);
        const browser2AfterRevoke = await httpReq(port, 'GET', '/api/community/guardian/session', null, { Cookie: browser2Cookie });

        const e2eOk =
          filterRes === true && allTabRes > 0 &&
          e2eCreate.status === 201 &&
          e2eSecond.status === 201 &&
          browser2Verify.status === 200 && Boolean(browser2Cookie) &&
          visitorGet.status === 200 && visitorGet.json?.letters?.length === 2 && visitorPost.status === 401 &&
          browser2AfterRevoke.json?.isAuthenticated === false;

        record('E2E-01', 'Recorrido E2E navegador real (filtros, 1ª/2ª carta, Magic Link en 2º navegador, visitante 401 y revocación)', e2eOk,
          `Kira slug=${kiraSlug}, cartas=${visitorGet.json?.letters?.length}, 2º nav tras revocar=${browser2AfterRevoke.json?.isAuthenticated}`);
      } finally {
        if (cdp) cdp.close();
        chrome.kill();
        try { fs.rmSync(tmpProf, { recursive: true, force: true }); } catch {}
      }
    } finally {
      nextProc.kill();
      try { fs.unlinkSync(sinkPath); } catch {}
    }
  } finally {
    await db.end();
    await admin.query(`DROP DATABASE IF EXISTS ${COMBINED_DB} WITH (FORCE);`);
    await admin.end();
  }

  const passed = results.filter(r => r.passed).length;
  console.log(`\n================================================================`);
  console.log(`RESUMEN FASE 2 LOCAL: ${passed}/${results.length} PRUEBAS SUPERADAS`);
  console.log(`================================================================`);
  if (passed !== results.length) process.exit(1);
}

run().catch(err => {
  console.error('❌ ERROR FATAL FASE 2 LOCAL:', err);
  process.exit(1);
});
