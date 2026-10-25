const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Test ToastQueue and showToast unit functionality
const { ToastQueue, showToast, dismissToast, clearToasts, CardiopolyToasts } = require('../src/components/toasts.js');

// --- Test 1: ToastQueue data structure (push, pop, items, clear) ---
const queue = new ToastQueue();
assert.strictEqual(Array.isArray(queue.items), true, 'queue.items must be an array');
assert.strictEqual(queue.items.length, 0, 'new queue must be empty');

const item1 = queue.push({ title: 'Bot Purchase', text: 'Fat Slob bought ECG room', durationMs: 1500 });
assert.strictEqual(queue.items.length, 1, 'queue.items length should be 1');
assert.strictEqual(item1.title, 'Bot Purchase');
assert.strictEqual(item1.message, 'Fat Slob bought ECG room');
assert.strictEqual(item1.durationMs, 1500);

const item2 = queue.push({ title: 'Tax Warning', message: 'Hospital Tax Audit', theme: 'warning' });
assert.strictEqual(queue.items.length, 2, 'queue.items length should be 2');

// FIFO queue pop behavior
const popped1 = queue.pop();
assert.strictEqual(popped1.title, 'Bot Purchase', 'First pop should return first item pushed');
assert.strictEqual(queue.items.length, 1, 'Queue length should decrease after pop');

const popped2 = queue.pop();
assert.strictEqual(popped2.title, 'Tax Warning', 'Second pop should return second item pushed');
assert.strictEqual(queue.items.length, 0, 'Queue should be empty after popping all items');

// Test clear()
queue.push({ title: 'A', message: 'Alpha' });
queue.push({ title: 'B', message: 'Beta' });
assert.strictEqual(queue.items.length, 2);
queue.clear();
assert.strictEqual(queue.items.length, 0, 'queue.clear() must empty the items array');

// --- Test 2: showToast options parsing & theme handling ---
// Supported themes: info, event, auction, warning, success
const themes = ['info', 'event', 'auction', 'warning', 'success'];
for (const theme of themes) {
  const t = showToast({ title: `${theme} Title`, message: `${theme} message`, theme: theme });
  assert.strictEqual(t.theme, theme, `Theme ${theme} should be parsed correctly`);
  assert.strictEqual(t.durationMs, 2000, 'Default durationMs should be 2000ms');
}

// Fallback for invalid theme
const fallbackToast = showToast({ title: 'Invalid', message: 'Test', theme: 'nonexistent' });
assert.strictEqual(fallbackToast.theme, 'info', 'Invalid theme should fallback to info');

// String message support
const stringToast = showToast('Quick alert');
assert.strictEqual(stringToast.message, 'Quick alert');
assert.strictEqual(stringToast.theme, 'info');
assert.strictEqual(stringToast.durationMs, 2000);

// Fallback from text -> message
const textToast = showToast({ text: 'Legacy text property' });
assert.strictEqual(textToast.message, 'Legacy text property');

// Custom duration
const customDurationToast = showToast({ message: 'Custom', durationMs: 4500 });
assert.strictEqual(customDurationToast.durationMs, 4500);

// --- Test 3: Headless-safe execution when running in Node.js without DOM ---
// In Node.js, document and window are undefined, so showToast must not throw!
assert.doesNotThrow(() => {
  const nodeToast = showToast({ title: 'Headless', message: 'Running without DOM', theme: 'event' });
  assert.strictEqual(nodeToast.title, 'Headless');
  dismissToast(nodeToast.id);
  clearToasts();
}, 'showToast, dismissToast, and clearToasts must be headless-safe in Node.js');

// Verify CardiopolyToasts namespace export
if (CardiopolyToasts) {
  assert.strictEqual(typeof CardiopolyToasts.showToast, 'function', 'CardiopolyToasts.showToast should be exported');
  assert.strictEqual(typeof CardiopolyToasts.ToastQueue, 'function', 'CardiopolyToasts.ToastQueue should be exported');
}

// --- Test 4: Integration contracts with index.html, styles.css, and script.js ---
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.includes('src/components/toasts.js'), 'index.html must load src/components/toasts.js');
const toastsScriptIdx = html.indexOf('src/components/toasts.js');
const scriptIdx = html.indexOf('script.js');
assert(toastsScriptIdx < scriptIdx, 'toasts.js must be loaded before script.js');

const cssPath = path.join(__dirname, '..', 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('#toast-container') || css.includes('.toast-container'), 'styles.css must style toast container');
assert(css.includes('z-index: 1200'), 'toast container must have z-index: 1200');
assert(css.includes('.toast-card'), 'styles.css must style .toast-card');
assert(css.includes('backdrop-filter') || css.includes('-webkit-backdrop-filter'), 'styles.css must have frosted glass backdrop filter for toasts');

const scriptPath = path.join(__dirname, '..', 'script.js');
const scriptJs = fs.readFileSync(scriptPath, 'utf8');

// Speed constants verification
assert(/const\s+USER_TOKEN_STEP_MS\s*=\s*280;/.test(scriptJs), 'USER_TOKEN_STEP_MS must be 280');
assert(/const\s+BOT_TOKEN_STEP_MS\s*=\s*80;/.test(scriptJs), 'BOT_TOKEN_STEP_MS must be 80');
assert(/const\s+BOT_PRE_ROLL_DELAY_MS\s*=\s*300;/.test(scriptJs), 'BOT_PRE_ROLL_DELAY_MS must be 300');
assert(/const\s+BOT_POST_TURN_DELAY_MS\s*=\s*350;/.test(scriptJs), 'BOT_POST_TURN_DELAY_MS must be 350');
assert(/const\s+SPLASH_DURATION_MS\s*=\s*1200;/.test(scriptJs), 'SPLASH_DURATION_MS must be 1200');

// Non-blocking toast call verification for bot turns
assert(scriptJs.includes('CardiopolyToasts.showToast') || scriptJs.includes('showToast'), 'script.js must use toasts for bot notifications');

console.log('toasts.test.js: All unit and integration tests passed successfully.');
