const fs = require('fs');
const path = require('path');
const vm = require('vm');

const domListeners = {};
const elements = new Map();

function createMockElement(tag, id = '', className = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id,
    className,
    style: { setProperty(k, v) { this[k] = v; } },
    dataset: {},
    classList: {
      _classes: new Set(className ? className.split(' ') : []),
      add(c) { this._classes.add(c); el.className = Array.from(this._classes).join(' '); },
      remove(c) { this._classes.delete(c); el.className = Array.from(this._classes).join(' '); },
      contains(c) { return this._classes.has(c); }
    },
    children: [],
    appendChild(c) { this.children.push(c); },
    prepend(c) { this.children.unshift(c); },
    insertBefore(newChild, refChild) {
      const idx = this.children.indexOf(refChild);
      if (idx !== -1) this.children.splice(idx, 0, newChild);
      else this.children.push(newChild);
    },
    addEventListener(evt, fn) { this['on' + evt] = fn; },
    removeEventListener() {},
    setAttribute() {},
    getAttribute() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getContext() {
      return {
        clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
        fillRect() {}, fillText() {}, save() {}, restore() {}, setLineDash() {},
        arc() {}, fill() {},
        createLinearGradient() { return { addColorStop() {} }; }
      };
    }
  };
  if (id) elements.set(id, el);
  return el;
}

const html = fs.readFileSync('index.html', 'utf8');
const idMatches = html.matchAll(/id=["']([^"']+)["']/g);
for (const m of idMatches) {
  createMockElement('div', m[1]);
}

const mockDocument = {
  getElementById(id) {
    if (!elements.has(id)) {
      elements.set(id, createMockElement('div', id));
    }
    return elements.get(id);
  },
  createElement(tag) { return createMockElement(tag); },
  querySelector(sel) {
    if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
    return createMockElement('div');
  },
  querySelectorAll() { return []; },
  addEventListener(evt, fn) {
    domListeners[evt] = domListeners[evt] || [];
    domListeners[evt].push(fn);
  },
  body: elements.get('game-container') || createMockElement('body', 'body')
};

const mockWindow = {
  document: mockDocument,
  console: console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  addEventListener(evt, fn) {
    domListeners[evt] = domListeners[evt] || [];
    domListeners[evt].push(fn);
  },
  location: { href: 'http://localhost/' },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  fetch: async (url) => {
    // Return actual local file if exists
    try {
      if (fs.existsSync(url)) {
        const text = fs.readFileSync(url, 'utf8');
        return {
          ok: true,
          status: 200,
          text: async () => text,
          json: async () => JSON.parse(text)
        };
      }
    } catch (_) {}
    return {
      ok: false,
      status: 404,
      text: async () => '',
      json: async () => ({})
    };
  },
  AudioContext: class {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; }
    resume() { this.state = 'running'; }
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    createBiquadFilter() { return { connect() {}, frequency: { setValueAtTime() {} } }; }
  }
};

mockWindow.window = mockWindow;
global.window = mockWindow;
global.document = mockDocument;

const ctx = vm.createContext(mockWindow);

const scriptFiles = [
  'src/components/audioSynth.js',
  'src/components/telemetry.js',
  'src/engine/factions.js',
  'src/engine/policies.js',
  'src/components/toasts.js',
  'src/engine/aiController.js',
  'src/engine/departmentUpgrades.js',
  'src/components/vignetteModal.js',
  'src/network/supabaseClient.js',
  'src/network/p2pSync.js',
  'patches/cardiopoly_script_patches.js',
  'patches/cardiopoly_mcp_runtime_bridge.js',
  'script.js'
];

for (const sf of scriptFiles) {
  const code = fs.readFileSync(sf, 'utf8');
  vm.runInContext(code, ctx, { filename: sf });
}

console.log('--- FIRING DOMContentLoaded ---');
if (domListeners['DOMContentLoaded']) {
  (async () => {
    for (const fn of domListeners['DOMContentLoaded']) {
      await fn();
    }
    console.log('✓ DOMContentLoaded handler completed successfully!');
    console.log('gameState.phase:', mockWindow.gameState?.phase);
    console.log('gameState.turnNumber:', mockWindow.gameState?.turnNumber);
    console.log('splash screen active:', mockWindow.document.getElementById('splash-screen')?.classList.contains('active'));
    console.log('rules screen active:', mockWindow.document.getElementById('rules-screen')?.classList.contains('active'));
    process.exit(0);
  })().catch(err => {
    console.error('✗ ERROR:', err);
    process.exit(1);
  });
}
