const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3877;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
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

async function run() {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Server listening on http://127.0.0.1:${PORT}`);

  const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const CDP_PORT = 9444;
  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,850',
    '--user-data-dir=' + path.resolve('.temp_shot_profile')
  ]);

  async function getWsUrl() {
    for (let i = 0; i < 40; i++) {
      try {
        const res = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${CDP_PORT}/json`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
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
      } catch (_) {}
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          resolve(null);
        }, 10000);
        pending.set(id, (val) => {
          clearTimeout(timer);
          resolve(val);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    const appUrl = `http://127.0.0.1:${PORT}/index.html`;
    console.log('Navigating to:', appUrl);
    await send('Page.navigate', { url: appUrl });

    // Wait 400ms to capture animated splash
    await sleep(400);
    const shotSplash = await send('Page.captureScreenshot', { format: 'png' });
    if (shotSplash?.result?.data) {
      fs.writeFileSync('screenshot_01_splash.png', Buffer.from(shotSplash.result.data, 'base64'));
      console.log('✓ Captured updated screenshot_01_splash.png');
    }

    // Wait 1.6s for splash to complete and show rules screen
    await sleep(1600);

    // Bypass setup modal directly into active match and test Music
    console.log('Launching active match and testing Music button...');
    const matchState = await send('Runtime.evaluate', {
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

        // Toggle Music On
        const musicBtn = document.getElementById('audio-music-btn');
        if (musicBtn) {
          musicBtn.click();
        }

        return {
          phase: window.gameState?.phase,
          hasMusicBtn: !!document.getElementById('audio-music-btn'),
          musicBtnText: document.getElementById('audio-music-btn')?.textContent,
          musicEnabled: window.CardiopolyPatches?.cardiopolyAudioV2?.musicEnabled
        };
      })()`,
      returnByValue: true
    });
    console.log('Match State after Music toggle:', matchState?.result?.value);

    await sleep(800);
    const shotBoard = await send('Page.captureScreenshot', { format: 'png' });
    if (shotBoard?.result?.data) {
      fs.writeFileSync('screenshot_03_active_board.png', Buffer.from(shotBoard.result.data, 'base64'));
      console.log('✓ Captured updated screenshot_03_active_board.png');
    }

    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    browserProc.kill();
    server.close();
    try {
      fs.rmSync('.temp_shot_profile', { recursive: true, force: true });
    } catch (_) {}
    process.exit(0);
  }
}

run();
