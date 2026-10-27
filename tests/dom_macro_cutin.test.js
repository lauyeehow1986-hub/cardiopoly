const assert = require('assert');

// Simple DOM Mock for Headless Verification
global.document = {
  body: {
    children: [],
    prepend(el) { this.children.unshift(el); },
    appendChild(el) { this.children.push(el); },
    contains(el) { return this.children.includes(el); },
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    }
  },
  getElementById(id) {
    return this.body.children.find(c => c.id === id) || null;
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      style: {
        setProperty(k, v) { this[k] = v; }
      },
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      addEventListener(evt, fn) { this[evt] = fn; }
    };
  }
};
global.window = {
  CardiopolyPatches: {
    cardiopolyAudioV2: {
      playCue(name) { this.lastCue = name; }
    }
  }
};

const bridge = require('../patches/cardiopoly_mcp_runtime_bridge.js');

console.log('=== VERIFYING DOM CUT-IN & MACRO TICKER INTEGRATION ===');

// 1. Verify Macro Ticker Prepend to DOM
const engine = new bridge.MacroShockEngine();
const shock = engine.advanceTurn(1);
const ticker = document.getElementById('cardiopoly-macro-ticker');
assert(ticker !== null, 'Macro ticker DOM element must be created and inserted');
assert(ticker.innerHTML.includes(shock.headline), 'Ticker must display active shock headline');
assert(ticker.innerHTML.includes(shock.category), 'Ticker must display active shock category');
console.log('  -> Passed: DOM Macro Ticker successfully rendered with shock data.');

// 2. Verify Cut-In Overlay DOM Creation & Dismiss
const cutIn = new bridge.CutInOverlayManager();
cutIn.playCutIn({
  id: 'code_blue',
  title: 'CODE BLUE HOSPITALIZATION',
  subtitle: 'Dr. Test admitted to CCU',
  accentColor: '#ef4444'
});

const overlay = document.getElementById('cardiopoly-cutin-overlay');
assert(overlay !== null, 'Cut-In overlay DOM element must exist in body');
assert(!overlay.classList.contains('hidden'), 'Cut-In overlay must not be hidden when active');
assert(overlay.innerHTML.includes('CODE BLUE HOSPITALIZATION'), 'Cut-In overlay must render title');
assert(overlay.innerHTML.includes('cutin-vfib-canvas'), 'Cut-In overlay must include V-Fib canvas for code_blue');
assert(document.body.classList.contains('code-blue-crisis-strobe'), 'Body must receive code-blue-crisis-strobe class');

// Simulate dismissal click
cutIn.hide();
assert(overlay.classList.contains('hidden'), 'Cut-In overlay must add hidden class on hide()');
assert(!document.body.classList.contains('code-blue-crisis-strobe'), 'Body must remove crisis strobe class on hide()');
console.log('  -> Passed: Cut-In overlay DOM lifecycle verified.');

console.log('=== ALL DOM INTEGRATION VERIFICATIONS PASSED ===\n');
