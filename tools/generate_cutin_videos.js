const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3988;
const ROOT_DIR = path.resolve(__dirname, '..');

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
  if (req.method === 'POST' && req.url.startsWith('/upload-video')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { id, data } = payload;
        const videoBuffer = Buffer.from(data, 'base64');
        const outDir = path.join(ROOT_DIR, 'assets', 'video', 'cutins');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const filePath = path.join(outDir, `${id}.webm`);
        fs.writeFileSync(filePath, videoBuffer);
        console.log(`[VIDEO GENERATED] ${filePath} (${videoBuffer.length} bytes)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, size: videoBuffer.length }));
      } catch (e) {
        console.error('Error saving video:', e);
        res.writeHead(500);
        res.end(e.message);
      }
    });
    return;
  }

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

  const CDP_PORT = 9555;
  const browserProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=800,600',
    '--user-data-dir=' + path.resolve('.temp_video_render_profile')
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
        if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          console.log(`[Browser Console]: ${text}`);
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
        }, 20000);
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

    const renderUrl = `http://127.0.0.1:${PORT}/tools/render_cutins.html`;
    console.log('Navigating to cut-in renderer:', renderUrl);
    await send('Page.navigate', { url: renderUrl });

    // Wait until done
    for (let i = 0; i < 45; i++) {
      await sleep(1000);
      const evalRes = await send('Runtime.evaluate', {
        expression: '({ done: !!window.__ALL_VIDEOS_RENDERED, err: window.__VIDEO_RENDER_ERROR || null, status: document.getElementById("status") ? document.getElementById("status").textContent : "" })',
        returnByValue: true
      });
      const val = evalRes?.result?.result?.value;
      if (val) {
        console.log(`[Status ${i}s]: ${val.status}`);
        if (val.done) {
          console.log('SUCCESS: All videos generated!');
          break;
        }
        if (val.err) {
          console.error('ERROR in renderer:', val.err);
          break;
        }
      }
    }

    ws.close();
  } catch (err) {
    console.error('Render error:', err);
  } finally {
    browserProc.kill();
    server.close();
    try {
      fs.rmSync(path.resolve('.temp_video_render_profile'), { recursive: true, force: true });
    } catch (_) {}
  }
}

main();
