const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Verify index.html contains telemetry dashboard and scripts in correct order
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.includes('id="telemetry-dashboard"'), 'index.html must include #telemetry-dashboard');
assert(html.includes('<canvas id="ecg-canvas" width="280" height="48"'), 'ecg-canvas must match required 280x48 dimensions');
assert(html.includes('id="telemetry-hr-val"'), 'index.html must include #telemetry-hr-val');
assert(html.includes('id="telemetry-bp-val"'), 'index.html must include #telemetry-bp-val');
assert(html.includes('id="telemetry-faction-badge"'), 'index.html must include #telemetry-faction-badge');

const telemetryScriptIdx = html.indexOf('src/components/telemetry.js');
const mainScriptIdx = html.indexOf('script.js');
assert(telemetryScriptIdx !== -1, 'index.html must include src/components/telemetry.js');
assert(mainScriptIdx !== -1, 'index.html must include script.js');
assert(telemetryScriptIdx < mainScriptIdx, 'src/components/telemetry.js must be loaded before script.js');

// 2. Verify styles.css contains modern command center and glassmorphism tokens
const cssPath = path.join(__dirname, '..', 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('--bg-command-center: #0b1120'), 'styles.css must define --bg-command-center');
assert(css.includes('--glass-bg: rgba(15, 23, 42, 0.78)'), 'styles.css must define --glass-bg');
assert(css.includes('--neon-cyan: #06b6d4'), 'styles.css must define --neon-cyan');
assert(css.includes('--accent-emerald: #10b981'), 'styles.css must define --accent-emerald');
assert(css.includes('--accent-crimson: #ef4444'), 'styles.css must define --accent-crimson');

assert(css.includes('.telemetry-dashboard'), 'styles.css must include .telemetry-dashboard');
assert(css.includes('.player-score-card.active-turn'), 'styles.css must include .player-score-card.active-turn');
assert(css.includes('backdrop-filter: blur(12px)'), 'styles.css must include frosted glass backdrop blur');

// 3. Verify script.js initializes and updates telemetry
const jsPath = path.join(__dirname, '..', 'script.js');
const js = fs.readFileSync(jsPath, 'utf8');

assert(js.includes('initTelemetryCanvas'), 'script.js must initialize telemetry canvas');
assert(js.includes('window.telemetryController.update'), 'script.js must update telemetryController on state changes');
assert(js.includes('updateTelemetryVitals'), 'script.js must call updateTelemetryVitals in refresh loop');

console.log('ui_command_center.test.js: All markup, styling, and integration contracts passed successfully.');
