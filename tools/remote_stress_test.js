const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3855;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT_DIR, decodeURIComponent(pathname));
  if (!filePath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
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
  console.log(`Local static server listening on http://127.0.0.1:${PORT}`);

  const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const CDP_PORT = 9333;
  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,850',
    '--user-data-dir=' + path.resolve('.temp_stress_profile')
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
    throw new Error('CDP connection timeout on port ' + CDP_PORT);
  }

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();
    const uncaughtErrors = [];

    ws.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8');
        const msg = JSON.parse(raw);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
        if (msg.method === 'Runtime.consoleAPICalled') {
          const t = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          console.log(`[BROWSER ${msg.params.type.toUpperCase()}]`, t);
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
          uncaughtErrors.push(desc);
          console.error('[BROWSER EXCEPTION]', desc);
        }
      } catch (e) {}
    };

    function send(method, params = {}, timeoutMs = 8000) {
      return new Promise((resolve) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          resolve(null);
        }, timeoutMs);
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
    await send('Page.navigate', { url: appUrl });

    // Wait 2.2s for splash screen to complete and show rules screen
    await sleep(2200);

    // Click "Enter Game Setup"
    await send('Runtime.evaluate', {
      expression: `document.getElementById('start-game-btn')?.click()`
    });
    await sleep(600);

    // In Setup Modal, click "Quick Start Match" or "Launch Clinical Match"
    console.log('Launching Match from Setup Modal...');
    await send('Runtime.evaluate', {
      expression: `(function() {
        const qBtn = document.getElementById('setup-quick-start-btn');
        if (qBtn) { qBtn.click(); return 'Clicked setup-quick-start-btn'; }
        const lBtn = document.getElementById('setup-launch-match-btn');
        if (lBtn) { lBtn.click(); return 'Clicked setup-launch-match-btn'; }
        return 'Launch button not found';
      })()`
    });
    await sleep(1000);

    // Capture clean active board screenshot
    const shotBoard = await send('Page.captureScreenshot', { format: 'png' });
    if (shotBoard?.result?.data) {
      fs.writeFileSync('screenshot_03_active_board.png', Buffer.from(shotBoard.result.data, 'base64'));
      console.log('✓ Captured screenshot_03_active_board.png');
    }

    // Stress test: simulate 8 turns
    console.log('--- STRESS TESTING: SIMULATING 8 TURNS ---');
    for (let t = 1; t <= 8; t++) {
      const turnEval = await send('Runtime.evaluate', {
        expression: `(async function() {
          const cur = window.gameState?.players[window.gameState?.currentPlayerIndex];
          const phase = window.gameState?.phase;
          // If in dice roll phase, trigger roll
          if (phase === 'WAIT_FOR_ROLL' && typeof window.rollDiceAndMove === 'function' && cur) {
            window.rollDiceAndMove(cur);
            return 'Turn ' + ${t} + ': Rolled dice for ' + cur.name;
          }
          // If property purchase banner is visible, buy property
          const buyBtn = document.getElementById('prop-buy-now-btn');
          if (buyBtn && !buyBtn.closest('#action-banner')?.classList.contains('hidden')) {
            buyBtn.click();
            return 'Turn ' + ${t} + ': Purchased property';
          }
          return 'Turn ' + ${t} + ': Phase is ' + phase + ' (Player: ' + cur?.name + ')';
        })()`,
        awaitPromise: true
      });
      console.log('  ->', turnEval?.result?.value);
      await sleep(1500);
    }

    const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
    if (shotFinal?.result?.data) {
      fs.writeFileSync('screenshot_04_stress_tested_board.png', Buffer.from(shotFinal.result.data, 'base64'));
      console.log('✓ Captured screenshot_04_stress_tested_board.png');
    }

    // Audit active state
    const auditRes = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        phase: window.gameState?.phase,
        turnNumber: window.gameState?.turnNumber,
        currentRegime: window.gameState?.currentRegime,
        activeMacroShock: window.CardiopolyMcpBridge?.macroShockEngine?.activeShock?.headline,
        macroCategory: window.CardiopolyMcpBridge?.macroShockEngine?.activeShock?.category,
        macroTickerVisible: !document.getElementById('cardiopoly-macro-ticker')?.classList.contains('hidden'),
        tokensOnBoard: document.querySelectorAll('.player-token').length,
        tilesCount: window.gameState?.tiles?.length,
        players: window.gameState?.players?.map(p => ({
          name: p.name,
          wp: p.wp,
          sbp: p.sbp,
          bmi: p.bmi,
          position: p.position,
          propsCount: p.properties?.length
        }))
      })`
    });
    console.log('\n=== LIVE BROWSER STRESS TEST AUDIT ===');
    console.log(JSON.stringify(JSON.parse(auditRes?.result?.value || '{}'), null, 2));

    console.log('\n=== UNCAUGHT ERRORS: ' + uncaughtErrors.length + ' ===');
    ws.close();
  } catch (err) {
    console.error('Stress test error:', err);
  } finally {
    browserProc.kill();
    server.close();
    try {
      fs.rmSync('.temp_stress_profile', { recursive: true, force: true });
    } catch (_) {}
    process.exit(0);
  }
}

run();
