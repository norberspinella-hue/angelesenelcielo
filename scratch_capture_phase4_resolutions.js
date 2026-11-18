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
      this.ws.onerror = err => reject(err);
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
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(brainDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function captureAll() {
  console.log('1. Checking or starting Next.js production server...');
  let serverRunning = false;
  try {
    const status = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:3000/comunidad', r => res(r.statusCode)).on('error', rej);
    });
    if (status === 200) serverRunning = true;
  } catch (e) {}

  let serverProcess = null;
  if (!serverRunning) {
    console.log('Starting Next.js production server on 127.0.0.1:3000...');
    serverProcess = spawn('npx', ['next', 'start', '-p', '3000', '-H', '127.0.0.1'], {
      cwd: __dirname,
      shell: true,
      stdio: 'ignore'
    });
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try {
        const s = await new Promise((res, rej) => {
          http.get('http://127.0.0.1:3000/comunidad', r => res(r.statusCode)).on('error', rej);
        });
        if (s === 200) {
          console.log('Next.js server is ready!');
          break;
        }
      } catch (e) {}
    }
  } else {
    console.log('Next.js server is already running.');
  }

  const tmpProfile = path.join(__dirname, '.chrome_profile_phase4_' + Date.now());
  fs.mkdirSync(tmpProfile, { recursive: true });

  console.log('2. Spawning Chrome...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${tmpProfile}`
  ], { stdio: 'ignore' });

  let client;
  try {
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        const list = await fetchJson('http://127.0.0.1:9222/json/list');
        if (list && list.length > 0) {
          const target = list.find(t => t.type === 'page') || list[0];
          client = new CDPClient(target.webSocketDebuggerUrl);
          await client.init();
          break;
        }
      } catch (e) {}
    }

    if (!client) throw new Error('Could not connect to Chrome CDP');
    console.log('Connected to Chrome CDP!');

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const resolutions = [
      { name: '1440x900-escritorio', width: 1440, height: 900, isMobile: false },
      { name: '390x844-movil-estandar', width: 390, height: 844, isMobile: true },
      { name: '375x812-movil-intermedio', width: 375, height: 812, isMobile: true },
      { name: '320x568-movil-compacto', width: 320, height: 568, isMobile: true }
    ];

    for (const res of resolutions) {
      console.log(`\n--- Capturing resolution: ${res.name} (${res.width}x${res.height}) ---`);
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: res.width,
        height: res.height,
        deviceScaleFactor: 2,
        mobile: res.isMobile
      });

      // 1. Navegar a /comunidad?multicarta=true
      await client.send('Page.navigate', { url: targetUrl });
      await sleep(2500);

      // Scroll a la sección del libro de los ángeles / cartas
      await client.eval(`
        const sec = document.getElementById('libro-de-los-angeles');
        if (sec) {
          sec.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      `);
      await sleep(1000);

      // Captura Índice General
      await client.captureScreenshot(`fase4-${res.name}-01-indice-general.png`);

      // 2. Abrir colección de Chloe pulsando el botón/sobre de Chloe
      await client.eval(`
        const chloeCard = Array.from(document.querySelectorAll('button, div')).find(el => 
          el.textContent && el.textContent.includes('Para Chloe')
        );
        if (chloeCard) {
          chloeCard.click();
        } else {
          // Si hay atajo de escenario en el dock de prueba
          const btnChloe = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Chloe'));
          if (btnChloe) btnChloe.click();
        }
      `);
      await sleep(1200);

      // Scroll arriba de la colección
      await client.eval(`
        const heading = Array.from(document.querySelectorAll('h2, h3, span')).find(el => 
          el.textContent && el.textContent.includes('Las cartas para mi angelito')
        );
        if (heading) {
          heading.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      `);
      await sleep(800);

      // Captura Colección Individual
      await client.captureScreenshot(`fase4-${res.name}-02-coleccion-individual.png`);

      // 3. Abrir la primera carta en el lector de papel marfil
      await client.eval(`
        const envelopeBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent && (b.textContent.includes('Leer carta') || b.textContent.includes('Hasta siempre') || b.textContent.includes('Chloe'))
        );
        if (envelopeBtn) {
          envelopeBtn.click();
        }
      `);
      await sleep(1200);

      // Captura Lector Marfil
      await client.captureScreenshot(`fase4-${res.name}-03-lector-marfil.png`);

      // Cerrar lector marfil pulsando botón cerrar
      await client.eval(`
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent && (b.textContent.includes('Cerrar') || b.textContent.includes('Volver')) || b.getAttribute('aria-label') === 'Cerrar'
        );
        if (closeBtn) closeBtn.click();
      `);
      await sleep(500);
    }

    console.log('\n¡Todas las capturas se han generado exitosamente!');
  } finally {
    if (client) client.close();
    chrome.kill();
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

captureAll().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
