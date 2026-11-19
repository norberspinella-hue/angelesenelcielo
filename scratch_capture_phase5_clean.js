const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\9c17e7fa-6607-4f37-82ff-eecc66d630bc';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://127.0.0.1:3000/comunidad?multicarta=true';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 1;
    this.pending = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => console.log('CDP WS ERROR:', err);
      this.ws.onclose = event => console.log('CDP WS CLOSED: code=', event.code);
      this.ws.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
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
    console.log(`[CAPTURA GUARDADA] ${filename} (${buffer.length} bytes)`);
  }

  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function run() {
  console.log('1. Comprobando / iniciando servidor Next.js en 127.0.0.1:3000...');
  let serverProcess = null;

  try {
    const s = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:3000/comunidad', r => res(r.statusCode)).on('error', rej);
    });
    if (s === 200) console.log('Servidor ya activo.');
  } catch (e) {
    console.log('Iniciando Next.js en segundo plano dentro del script...');
    serverProcess = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '127.0.0.1'], {
      cwd: __dirname,
      shell: true,
      stdio: 'ignore'
    });

    for (let i = 0; i < 40; i++) {
      await sleep(600);
      try {
        const s = await new Promise((res, rej) => {
          http.get('http://127.0.0.1:3000/comunidad', r => res(r.statusCode)).on('error', rej);
        });
        if (s === 200) {
          console.log('Next.js dev server listo!');
          break;
        }
      } catch (err) {}
    }
  }

  const tmpProfile = path.join(__dirname, '.chrome_profile_phase5_' + Date.now());
  fs.mkdirSync(tmpProfile, { recursive: true });
  const cdpPort = 9335;

  console.log('2. Iniciando Google Chrome en modo Headless...');
  const chrome = spawn(chromePath, [
    '--headless=old',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${tmpProfile}`
  ], { stdio: 'ignore' });

  let client;
  try {
    for (let i = 0; i < 30; i++) {
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

    const viewports = [
      { prefix: 'fase5', width: 1440, height: 900, isMobile: false, label: 'Escritorio (1440x900)' },
      { prefix: 'fase5-mobile', width: 390, height: 844, isMobile: true, label: 'Móvil (390x844)' }
    ];

    for (const vp of viewports) {
      console.log(`\n======================================================`);
      console.log(`Generando capturas para: ${vp.label}`);
      console.log(`======================================================`);

      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.isMobile
      });

      // Navegar a la página con multicarta activo
      await client.send('Page.navigate', { url: targetUrl });
      await sleep(3000);

      // Limpiar cookies banner, whatsapp y dock
      await client.eval(`
        try {
          localStorage.setItem('cookie-consent', 'rejected');
        } catch (e) {}
        
        const cookieBanner = document.querySelector('[aria-label="Consentimiento de cookies"]') || document.querySelector('[role="dialog"][aria-label*="cookie" i]');
        if (cookieBanner) cookieBanner.remove();

        const wa = document.querySelector('aside[aria-label="Atención por WhatsApp"]');
        if (wa) wa.remove();

        const dock = document.querySelector('.fixed.top-3.right-3') || document.getElementById('demo-dock');
        if (dock) dock.remove();
        const dockBtn = document.getElementById('btn-show-demo-dock');
        if (dockBtn) dockBtn.remove();
      `);
      await sleep(500);

      // -------------------------------------------------------------------------
      // CAPTURA 1: Índice general con varias mascotas
      // -------------------------------------------------------------------------
      console.log(`-> Capturando 01: Índice general...`);
      await client.eval(`
        const sec = document.getElementById('libro-de-los-angeles');
        if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
      `);
      await sleep(1000);
      await client.captureScreenshot(`${vp.prefix}-01-indice-general.png`);

      // -------------------------------------------------------------------------
      // CAPTURA 2: Mascota sin fotografía (Toby con medallón celestial)
      // -------------------------------------------------------------------------
      console.log(`-> Abriendo colección de Toby (mascota sin fotografía con medallón celestial)...`);
      await client.eval(`
        const tobyBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.getAttribute('aria-label')?.includes('Toby') || (b.textContent && b.textContent.includes('Toby'))
        );
        if (tobyBtn) tobyBtn.click();
      `);
      await sleep(1500);

      await client.eval(`
        const colHeading = Array.from(document.querySelectorAll('h3, span')).find(el => 
          el.textContent && el.textContent.includes('Las cartas para mi angelito')
        );
        if (colHeading) colHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      `);
      await sleep(1000);
      await client.captureScreenshot(`${vp.prefix}-02-mascota-sin-foto.png`);

      // Volver al libro para abrir la colección de Chloe
      await client.eval(`
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent && b.textContent.includes('Volver al Libro de los Ángeles')
        );
        if (backBtn) backBtn.click();
      `);
      await sleep(1000);

      // -------------------------------------------------------------------------
      // CAPTURA 3: Colección de Chloe con 2 cartas
      // -------------------------------------------------------------------------
      console.log(`-> Abriendo colección de Chloe (2 cartas)...`);
      await client.eval(`
        const chloeBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.getAttribute('aria-label')?.includes('Chloe') || (b.textContent && b.textContent.includes('Para Chloe'))
        );
        if (chloeBtn) chloeBtn.click();
      `);
      await sleep(1500);

      // Limpiar elementos flotantes que puedan reaparecer
      await client.eval(`
        document.querySelector('aside[aria-label="Atención por WhatsApp"]')?.remove();
        document.querySelector('.fixed.top-3.right-3')?.remove();
        const colHeading = Array.from(document.querySelectorAll('h3, span')).find(el => 
          el.textContent && el.textContent.includes('Las cartas para mi angelito')
        );
        if (colHeading) colHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      `);
      await sleep(1000);
      await client.captureScreenshot(`${vp.prefix}-03-coleccion-chloe.png`);

      // -------------------------------------------------------------------------
      // CAPTURA 4: Sobres individuales completos
      // -------------------------------------------------------------------------
      console.log(`-> Capturando 04: Sobres individuales con CTA y motivo...`);
      await client.eval(`
        const listaSobres = document.getElementById('cartas-coleccion-lista');
        if (listaSobres) {
          listaSobres.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      `);
      await sleep(1000);
      await client.captureScreenshot(`${vp.prefix}-04-sobres-individuales.png`);

      // -------------------------------------------------------------------------
      // CAPTURA 5: Carta corta abierta (Carta 1 de Chloe: Primera despedida)
      // -------------------------------------------------------------------------
      console.log(`-> Abriendo Carta 1 (carta corta de despedida)...`);
      const cortaOpened = await client.eval(`
        (() => {
          const btn = Array.from(document.querySelectorAll('button.libro-sobre')).find(b => 
            b.getAttribute('aria-label')?.includes('despedida') || b.textContent.includes('despedida') || b.textContent.includes('Despedida')
          ) || document.querySelectorAll('button.libro-sobre')[1];
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `);
      console.log('Carta corta abierta:', cortaOpened);
      await sleep(1500);
      await client.captureScreenshot(`${vp.prefix}-05-carta-corta-abierta.png`);

      // Cerrar carta corta
      console.log('-> Cerrando carta corta...');
      await client.eval(`
        (() => {
          const closeBtn = document.getElementById('modal-close-letter-btn') || document.querySelector('.libro-cerrar');
          if (closeBtn) closeBtn.click();
        })()
      `);
      await sleep(1200);

      // -------------------------------------------------------------------------
      // CAPTURA 6: Carta larga de varios párrafos abierta (Carta 2 de Chloe: Cumpleaños)
      // -------------------------------------------------------------------------
      console.log(`-> Abriendo Carta 2 (carta larga de 3 párrafos: Cumpleaños)...`);
      const largaOpened = await client.eval(`
        (() => {
          const btn = Array.from(document.querySelectorAll('button.libro-sobre')).find(b => 
            b.getAttribute('aria-label')?.includes('cumpleaños') || b.textContent.includes('cumpleaños') || b.textContent.includes('Cumpleaños')
          ) || document.querySelectorAll('button.libro-sobre')[0];
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `);
      console.log('Carta larga abierta:', largaOpened);
      await sleep(1500);
      await client.captureScreenshot(`${vp.prefix}-06-carta-larga-abierta.png`);

      // Cerrar carta larga
      console.log('-> Cerrando carta larga...');
      await client.eval(`
        (() => {
          const closeBtn = document.getElementById('modal-close-letter-btn') || document.querySelector('.libro-cerrar');
          if (closeBtn) closeBtn.click();
        })()
      `);
      await sleep(1200);

      // Volver al libro
      await client.eval(`
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent && b.textContent.includes('Volver al Libro de los Ángeles')
        );
        if (backBtn) backBtn.click();
      `);
      await sleep(800);
    }

    console.log('\n======================================================');
    console.log('¡TODAS LAS CAPTURAS COMPLETADAS CON ÉXITO!');
    console.log('======================================================');

  } finally {
    if (client) client.close();
    chrome.kill();
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch(err => {
  console.error('Error durante la ejecución de capturas:', err);
  process.exit(1);
});
