const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3999;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT_DIR, decodeURIComponent(pathname));
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('Not Found: ' + filePath);
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

  const CDP_PORT = 9666;
  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,850',
    '--user-data-dir=' + path.resolve('.temp_qa_profile')
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
    const consoleLogs = [];

    ws.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8');
        const msg = JSON.parse(raw);
        if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          consoleLogs.push(text);
          console.log(`[Browser Console]: ${text}`);
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error(`[Browser Exception]:`, msg.params.exceptionDetails);
        }
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
        }, 15000);
        pending.set(id, (val) => {
          clearTimeout(timer);
          resolve(val);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res && res.result && res.result.data) {
        fs.writeFileSync(filename, Buffer.from(res.result.data, 'base64'));
        console.log(`[Screenshot Saved]: ${filename}`);
      }
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    const appUrl = `http://127.0.0.1:${PORT}/index.html`;
    console.log('Navigating to app:', appUrl);
    await send('Page.navigate', { url: appUrl });

    // Step 1: Capture Splash Screen
    await sleep(400);
    await captureScreenshot('screenshot_01_splash_v2.png');

    // Step 2: Skip Splash Screen to Rules View
    console.log('Skipping splash screen...');
    await send('Runtime.evaluate', {
      expression: 'document.getElementById("skip-splash-btn") ? document.getElementById("skip-splash-btn").click() : document.getElementById("splash-screen").click();'
    });
    await sleep(800);
    await captureScreenshot('screenshot_02_rules_v2.png');

    // Step 3: Start match and verify Board with Centerpiece Art
    console.log('Starting match to inspect centerpiece board...');
    await send('Runtime.evaluate', {
      expression: `
        if (typeof resetGameToRules === 'function') resetGameToRules();
        const startBtn = document.getElementById("start-match-btn") || document.getElementById("start-game-btn");
        if (startBtn) startBtn.click();
        else if (typeof initGame === 'function') initGame();
      `
    });
    await sleep(1200);

    // Verify Centerpiece tab is active
    const centerpieceActive = await send('Runtime.evaluate', {
      expression: `
        ({
          isCenterpieceTabActive: document.getElementById("tab-centerpiece-btn")?.classList.contains("active"),
          isCenterpieceViewActive: document.getElementById("console-centerpiece-view")?.classList.contains("active"),
          centerpieceImgSrc: document.getElementById("centerpiece-main-img")?.src,
          regimeBadge: document.getElementById("centerpiece-regime-badge")?.textContent,
          turnBadge: document.getElementById("centerpiece-turn-badge")?.textContent,
          hasMusicBtn: !!document.getElementById("audio-music-btn")
        })
      `,
      returnByValue: true
    });
    console.log('[Centerpiece Verification]:', JSON.stringify(centerpieceActive?.result?.result?.value, null, 2));

    await captureScreenshot('screenshot_03_centerpiece_board.png');

    // Step 4: Test Audio / Music Toggle
    console.log('Testing Audio Soundtrack toggle...');
    const audioState = await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById("audio-music-btn");
        if (btn) btn.click();
        ({
          btnText: btn?.textContent,
          synthMusicEnabled: window.CardiopolyAudioSynth?.musicEnabled
        })
      `,
      returnByValue: true
    });
    console.log('[Audio Toggle Test]:', JSON.stringify(audioState?.result?.result?.value, null, 2));

    // Step 5: Test Cut-In Overlay with Code Blue
    console.log('Triggering live Cut-In overlay...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.CardiopolyMcpBridge?.cutInOverlay) {
          window.CardiopolyMcpBridge.cutInOverlay.playCutIn({
            id: 'code_blue',
            title: 'CODE BLUE HOSPITALIZATION',
            subtitle: 'Ventricular Fibrillation & Emergency CCU Resuscitation',
            accentColor: '#ef4444'
          });
        }
      `
    });
    await sleep(600);
    await captureScreenshot('screenshot_04_live_cutin.png');

    // Step 6: Dismiss cut-in and test tab switching
    console.log('Dismissing cut-in and testing tab switching...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.CardiopolyMcpBridge?.cutInOverlay) {
          window.CardiopolyMcpBridge.cutInOverlay.hide();
        }
        const raceBtn = document.getElementById("tab-race-btn");
        if (raceBtn) raceBtn.click();
      `
    });
    await sleep(600);
    await captureScreenshot('screenshot_05_faction_race_tab.png');

    console.log('QA Verification Run Completed Successfully!');
    ws.close();
  } catch (err) {
    console.error('QA Test error:', err);
  } finally {
    browserProc.kill();
    server.close();
    try {
      fs.rmSync(path.resolve('.temp_qa_profile'), { recursive: true, force: true });
    } catch (_) {}
  }
}

main();
