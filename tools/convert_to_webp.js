const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 4055;
const ROOT_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save-webp') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const buf = Buffer.from(payload.data, 'base64');
        const outPath = path.join(ROOT_DIR, 'assets', 'images', 'cardiopoly_centerpiece_remastered.webp');
        fs.writeFileSync(outPath, buf);
        console.log(`[WebP Created]: ${outPath} (${buf.length} bytes)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, size: buf.length }));
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT_DIR, decodeURIComponent(pathname));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.jpg' ? 'image/jpeg' : (ext === '.html' ? 'text/html' : 'application/octet-stream');
    res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

async function main() {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const CDP_PORT = 9888;
  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--user-data-dir=' + path.resolve('.temp_webp_prof')
  ]);

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
        if (res && res.length > 0 && res[0].webSocketDebuggerUrl) return res[0].webSocketDebuggerUrl;
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
        const timer = setTimeout(() => { pending.delete(id); resolve(null); }, 15000);
        pending.set(id, (val) => { clearTimeout(timer); resolve(val); });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    await sleep(600);

    const result = await send('Runtime.evaluate', {
      expression: `(async function() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = '/assets/images/cardiopoly_centerpiece_remastered.jpg';
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/webp', 0.90);
        const base64 = dataUrl.split(',')[1];
        await fetch('/save-webp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64 })
        });
        return { ok: true, width: canvas.width, height: canvas.height };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Conversion result:', result?.result?.value);
    ws.close();
  } catch (err) {
    console.error('Error converting to webp:', err);
  } finally {
    browserProc.kill();
    server.close();
    try { fs.rmSync('.temp_webp_prof', { recursive: true, force: true }); } catch (_) {}
    process.exit(0);
  }
}

main();
