const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const targetUrl = process.argv[2] || ('file:///' + path.resolve('index.html').replace(/\\/g, '/'));
console.log('Using browser:', CHROME_PATH);
console.log('Target URL:', targetUrl);

const browserProc = spawn(CHROME_PATH, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-web-security',
  '--allow-file-access-from-files',
  '--user-data-dir=' + path.resolve('.temp_chrome_profile')
]);

browserProc.stderr.on('data', (d) => {
  // console.log('[Browser STDERR]', d.toString());
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (res && res.length > 0 && res[0].webSocketDebuggerUrl) {
        return res[0].webSocketDebuggerUrl;
      }
    } catch (_) {}
    await sleep(200);
  }
  throw new Error('Could not connect to browser CDP port 9222');
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to CDP:', wsUrl);

    const ws = new WebSocket(wsUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[BROWSER CONSOLE ${msg.params.type.toUpperCase()}]`, text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error(`[BROWSER UNCAUGHT EXCEPTION]`, JSON.stringify(msg.params.exceptionDetails, null, 2));
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');

    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });

    // Wait 3.5 seconds to observe splash animation and any initialization exceptions
    await sleep(3500);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.result && shot.result.data) {
      fs.writeFileSync('browser_screenshot_after_load.png', Buffer.from(shot.result.data, 'base64'));
      console.log('Saved screenshot to browser_screenshot_after_load.png');
    }

    // Inspect gameState
    const evalRes = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        phase: window.gameState ? window.gameState.phase : 'NO_GAMESTATE',
        turnNumber: window.gameState ? window.gameState.turnNumber : null,
        isPaused: window.gameState ? window.gameState.isPaused : null,
        splashActive: !!document.getElementById('splash-screen')?.classList.contains('active'),
        splashDisplay: document.getElementById('splash-screen')?.style.display,
        splashWidth: document.getElementById('splash-progress-bar')?.style.width
      })`
    });
    console.log('Browser gameState snapshot:', evalRes.result?.value);

    // Now test clicking the splash screen or waiting
    const clickRes = await send('Runtime.evaluate', {
      expression: `(function() {
        const splash = document.getElementById('splash-screen');
        if (splash && splash.onclick) {
          splash.onclick();
          return 'Triggered splash.onclick()';
        }
        return 'No onclick on splash';
      })()`
    });
    console.log('Click splash result:', clickRes.result?.value);

    await sleep(1000);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot2 && shot2.result && shot2.result.data) {
      fs.writeFileSync('browser_screenshot_after_click.png', Buffer.from(shot2.result.data, 'base64'));
      console.log('Saved screenshot to browser_screenshot_after_click.png');
    }

    ws.close();
  } catch (err) {
    console.error('Remote browser error:', err);
  } finally {
    browserProc.kill();
    // Clean up temp chrome profile
    try {
      fs.rmSync('.temp_chrome_profile', { recursive: true, force: true });
    } catch (_) {}
  }
}

run();
