const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 4001;
const CDP_PORT = 9777;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\lauye\\.gemini\\antigravity\\brain\\a2cbbd00-20b3-4ea0-9a00-f56386e8a221';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT_DIR, decodeURIComponent(pathname));
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Server listening on http://127.0.0.1:${PORT}`);

  const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,850',
    '--user-data-dir=' + path.resolve('.temp_shots_run')
  ]);

  async function getWsUrl() {
    for (let i = 0; i < 40; i++) {
      try {
        const res = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${CDP_PORT}/json`, (r) => {
            let data = '';
            r.on('data', chunk => data += chunk);
            r.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
        if (res && res.length > 0 && res[0].webSocketDebuggerUrl) {
          return res[0].webSocketDebuggerUrl;
        }
      } catch (_) {}
      await sleep(250);
    }
    throw new Error('CDP connection timeout');
  }

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8');
        const msg = JSON.parse(raw);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
      } catch (err) {
        console.error('ws.onmessage error:', err.message);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          resolve(null);
        }, 12000);
        pending.set(id, (val) => {
          clearTimeout(timer);
          resolve(val);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function saveScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
      const data = res?.result?.data;
      if (data) {
        const buf = Buffer.from(data, 'base64');
        const outPng = filename.replace(/\.png$/, '.png');
        fs.writeFileSync(path.join(ROOT_DIR, outPng), buf);
        try {
          fs.writeFileSync(path.join(ARTIFACT_DIR, outPng), buf);
        } catch (_) {}
        console.log(`[Captured]: ${outPng} (${buf.length} bytes)`);
      } else {
        console.error(`[Capture Failed for ${filename}]`, res);
      }
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    const appUrl = `http://127.0.0.1:${PORT}/index.html`;
    console.log('Navigating to app:', appUrl);
    await send('Page.navigate', { url: appUrl });

    // Wait for document ready
    for (let i = 0; i < 20; i++) {
      const state = await send('Runtime.evaluate', { expression: 'document.readyState' });
      if (state?.result?.result?.value === 'complete' || state?.result?.result?.value === 'interactive') break;
      await sleep(100);
    }

    // 1. Splash Screen
    await sleep(350);
    await saveScreenshot('screenshot_01_splash.png');

    // 2. Rules Screen
    await sleep(1400);
    await saveScreenshot('screenshot_02_rules.png');

    // 3. Active Board with Remastered Centerpiece Art
    console.log('Activating match and inspecting centerpiece...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        if (typeof window.__dismissCardiopolySplash === 'function') {
          window.__dismissCardiopolySplash();
        }
        const rules = document.getElementById('rules-screen');
        if (rules) rules.classList.remove('active');
        const setup = document.getElementById('setup-modal');
        if (setup) setup.classList.remove('active');
        window.gameState.phase = 'WAIT_FOR_ROLL';
        window.refreshAllViews();
        if (typeof updateCenterpieceHud === 'function') updateCenterpieceHud();

        // Toggle Music On
        const musicBtn = document.getElementById('audio-music-btn');
        if (musicBtn) musicBtn.click();
      })()`
    });
    await sleep(1000);
    await saveScreenshot('screenshot_03_active_board.png');

    // 4. Trigger Live Cut-In (Code Blue / Cath Lab)
    console.log('Triggering dramatic live Cut-In...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        if (window.CardiopolyMcpBridge?.cutInOverlay) {
          window.CardiopolyMcpBridge.cutInOverlay.playCutIn({
            id: 'code_blue',
            title: 'CODE BLUE HOSPITALIZATION',
            subtitle: 'Ventricular Fibrillation & Emergency CCU Resuscitation',
            accentColor: '#ef4444'
          });
        }
      })()`
    });
    await sleep(700);
    await saveScreenshot('screenshot_04_stress_tested_board.png');

    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
    ws.close();
  } catch (err) {
    console.error('Screenshot run error:', err);
  } finally {
    browserProc.kill();
    server.close();
    try {
      fs.rmSync(path.resolve('.temp_shots_run'), { recursive: true, force: true });
    } catch (_) {}
    process.exit(0);
  }
}

main();
