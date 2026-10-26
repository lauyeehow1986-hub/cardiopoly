const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. UPDATE index.html
const indexPath = path.join(ROOT, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const oldConsoleRegex = /<!-- LIVE INTERACTIVE CARDIOLOGY CENTER CONSOLE[\s\S]*?<!-- Token layer with X\/Y coordinates/;
const newConsoleSnippet = `<!-- LIVE INTERACTIVE CARDIOLOGY CENTER CONSOLE -->
        <div class="board-center-console" id="board-center-console">
          <div class="console-tab-bar">
            <button id="tab-centerpiece-btn" class="console-tab active" type="button">Centerpiece</button>
            <button id="tab-race-btn" class="console-tab" type="button">Faction Race</button>
            <button id="tab-ticker-btn" class="console-tab" type="button">Action Feed</button>
            <button id="tab-telemetry-btn" class="console-tab" type="button">Telemetry</button>
          </div>

          <div class="console-tab-content">
            <!-- Tab 1: Remastered Game Board Centerpiece Art -->
            <div id="console-centerpiece-view" class="console-view active">
              <div class="centerpiece-art-card">
                <img src="assets/images/cardiopoly_centerpiece_remastered.jpg" alt="Cardiopoly Centerpiece Art" class="centerpiece-img" id="centerpiece-main-img" onerror="this.src='Monopoly_board_center.png'" />
                <div class="centerpiece-overlay-hud">
                  <div class="centerpiece-top-row">
                    <span id="centerpiece-regime-badge" class="centerpiece-badge regime">Singapore (3M)</span>
                    <span id="centerpiece-turn-badge" class="centerpiece-badge turn">Turn 1</span>
                  </div>
                  <div class="centerpiece-bottom-row">
                    <span id="centerpiece-player-badge" class="centerpiece-badge player">Dr. Guidelines</span>
                    <span id="centerpiece-shock-badge" class="centerpiece-badge shock">Standard Policy</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Faction Objectives & Victory Race Leaderboard -->
            <div id="console-race-view" class="console-view">
              <div id="console-faction-bars" class="console-faction-bars">
                <!-- Dynamically populated faction progress bars -->
              </div>
            </div>

            <!-- Tab 3: Action Feed & Ticker -->
            <div id="console-ticker-view" class="console-view">
              <div id="board-ticker-text" class="board-ticker-text">Welcome to Cardiopoly Command. Tap dice box to roll!</div>
              <div id="console-action-log" class="console-action-log"></div>
            </div>

            <!-- Tab 4: Live Animated Telemetry Waveform & Rhythm Readout -->
            <div id="console-telemetry-view" class="console-view">
              <canvas id="console-ecg-canvas" width="230" height="56" class="console-ecg-canvas"></canvas>
              <div class="console-rhythm-bar">
                <span id="console-rhythm-badge" class="rhythm-badge sinus">NORMAL SINUS RHYTHM</span>
                <span id="console-vital-hr" class="rhythm-hr">72 BPM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Token layer with X/Y coordinates`;

if (oldConsoleRegex.test(indexContent)) {
  indexContent = indexContent.replace(oldConsoleRegex, newConsoleSnippet);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('[index.html] Updated center console with centerpiece tab');
} else {
  console.error('[index.html] Failed to find old console snippet regex');
}

// 2. UPDATE styles.css
const stylesPath = path.join(ROOT, 'styles.css');
let stylesContent = fs.readFileSync(stylesPath, 'utf8');

const centerpieceCss = `
/* ========================================================
   CARDIOPOLY CENTERPIECE & CUT-IN VIDEO UPGRADE (GRADIENT-BOOST V2)
   ======================================================== */

/* Centerpiece Art View */
#console-centerpiece-view {
  width: 100%;
  height: 100%;
  display: none;
  position: relative;
  overflow: hidden;
}

#console-centerpiece-view.active {
  display: flex !important;
}

.centerpiece-art-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0f172a 0%, #030712 100%);
  border: 1px solid rgba(6, 182, 212, 0.4);
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.7);
}

.centerpiece-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease, filter 0.4s ease;
  filter: contrast(1.05) saturate(1.1);
}

.centerpiece-art-card:hover .centerpiece-img {
  transform: scale(1.03);
}

.centerpiece-overlay-hud {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 8px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(3, 7, 18, 0.75) 0%, transparent 30%, transparent 70%, rgba(3, 7, 18, 0.85) 100%);
}

.centerpiece-top-row,
.centerpiece-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.centerpiece-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  pointer-events: auto;
}

.centerpiece-badge.regime {
  background: rgba(6, 182, 212, 0.25);
  color: #38bdf8;
  border: 1px solid rgba(6, 182, 212, 0.5);
}

.centerpiece-badge.turn {
  background: rgba(148, 163, 184, 0.2);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.centerpiece-badge.player {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.centerpiece-badge.shock {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* CUT-IN OVERLAY SYSTEM */
.cutin-overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(3, 7, 18, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cutinFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  cursor: pointer;
}

.cutin-overlay-backdrop.hidden {
  display: none !important;
}

.cutin-banner-card {
  position: relative;
  width: 92%;
  max-width: 680px;
  background: #090e1a;
  border: 2px solid var(--cutin-accent, #06b6d4);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 32px var(--cutin-accent, rgba(6, 182, 212, 0.4)), 0 20px 40px rgba(0, 0, 0, 0.8);
  animation: cutinSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cutin-media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}

.cutin-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cutin-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: cutinKenBurns 5.5s linear forwards;
}

.cutin-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 2px,
    transparent 2px,
    transparent 4px
  );
}

.cutin-procedural {
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0f172a 0%, #030712 100%);
}

.cutin-text-block {
  padding: 14px 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cutin-kicker {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--cutin-accent, #38bdf8);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.cutin-title {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: #ffffff;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.cutin-subtitle {
  font-size: 0.82rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.35;
}

@keyframes cutinFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes cutinSlideUp {
  from { transform: scale(0.92) translateY(24px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes cutinKenBurns {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}
`;

if (!stylesContent.includes('CARDIOPOLY CENTERPIECE & CUT-IN VIDEO UPGRADE')) {
  stylesContent += '\n' + centerpieceCss;
  fs.writeFileSync(stylesPath, stylesContent, 'utf8');
  console.log('[styles.css] Appended centerpiece & cut-in video CSS');
}

// 3. UPDATE patches/cardiopoly_mcp_runtime_bridge.js
const mcpBridgePath = path.join(ROOT, 'patches', 'cardiopoly_mcp_runtime_bridge.js');
let mcpBridgeContent = fs.readFileSync(mcpBridgePath, 'utf8');

const updatedCutInOverlayManager = `const CUTIN_PRESETS = {
  code_blue: {
    videoSrc: 'assets/video/cutins/code_blue.webm',
    posterSrc: 'assets/images/cutins/code_blue.jpg',
    accentColor: '#ef4444',
    title: 'CODE BLUE HOSPITALIZATION',
    subtitle: 'Emergency Ventricular Fibrillation Resuscitation'
  },
  cath_lab: {
    videoSrc: 'assets/video/cutins/cath_lab.webm',
    posterSrc: 'assets/images/cutins/cath_lab.jpg',
    accentColor: '#06b6d4',
    title: 'HIGH-RISK CATH / STENT DEPLOYED',
    subtitle: 'Percutaneous Coronary Intervention in Progress'
  },
  regulatory_audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  monopoly_complete: {
    videoSrc: null,
    posterSrc: 'assets/images/cardiopoly_centerpiece_remastered.jpg',
    accentColor: '#10b981',
    title: 'DEPARTMENT MONOPOLY FORMED',
    subtitle: 'Full Clinical Department Consolidation Achieved'
  },
  macro_shock: {
    videoSrc: null,
    posterSrc: null,
    accentColor: '#38bdf8',
    title: 'MACRO POLICY SHIFT',
    subtitle: 'Global Healthcare Economic Intervention'
  }
};

class CutInOverlayManager {
  constructor() {
    this.overlayEl = null;
    this.hideTimer = null;
  }

  ensureOverlay() {
    if (typeof document === 'undefined') return null;
    if (this.overlayEl && document.body.contains(this.overlayEl)) return this.overlayEl;
    let el = document.getElementById('cardiopoly-cutin-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cardiopoly-cutin-overlay';
      el.className = 'cutin-overlay-backdrop hidden';
      el.addEventListener('click', () => this.hide());
      document.body.appendChild(el);
    }
    this.overlayEl = el;
    return el;
  }

  playCutIn(options = {}) {
    const el = this.ensureOverlay();
    if (!el) return;

    const id = options.id || 'code_blue';
    const preset = CUTIN_PRESETS[id] || {};
    const title = options.title || preset.title || 'CLINICAL ENCOUNTER';
    const subtitle = options.subtitle || preset.subtitle || 'Hospital Telemetry Alert';
    const accentColor = options.accentColor || preset.accentColor || '#06b6d4';
    const videoSrc = options.videoSrc !== undefined ? options.videoSrc : preset.videoSrc;
    const posterSrc = options.posterSrc !== undefined ? options.posterSrc : preset.posterSrc;
    const voiceoverSrc = options.voiceoverSrc || null;

    el.style.setProperty('--cutin-accent', accentColor);

    let mediaMarkup = '';
    if (videoSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <video class="cutin-video" src="\${videoSrc}" autoplay muted loop playsinline
                 onerror="this.style.display='none'; const p=this.nextElementSibling; if(p) p.style.display='block';"></video>
          \${posterSrc ? \`<img class="cutin-poster" src="\${posterSrc}" alt="\${title}" style="display:none;" />\` : ''}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else if (posterSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <img class="cutin-poster" src="\${posterSrc}" alt="\${title}" />
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else {
      mediaMarkup = \`
        <div class="cutin-media-container cutin-procedural">
          <svg viewBox="0 0 320 90" width="100%" height="90">
            <polyline fill="none" stroke="\${accentColor}" stroke-width="3.5"
              points="0,45 55,45 70,20 85,75 102,10 120,82 138,38 155,45 320,45" />
          </svg>
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    }

    el.innerHTML = \`
      <div class="cutin-banner-card" role="dialog" aria-modal="true" aria-label="\${title}">
        \${mediaMarkup}
        <div class="cutin-text-block">
          <div class="cutin-kicker">LIVE CLINICAL CUT-IN // TAP TO DISMISS</div>
          <h2 class="cutin-title">\${title}</h2>
          <p class="cutin-subtitle">\${subtitle}</p>
        </div>
      </div>
    \`;
    el.classList.remove('hidden');

    // Duck soundtrack for drama
    if (typeof window !== 'undefined' && window.CardiopolyAudioSynth && typeof window.CardiopolyAudioSynth.duckSoundtrack === 'function') {
      window.CardiopolyAudioSynth.duckSoundtrack(5000);
    }

    if (voiceoverSrc && typeof Audio !== 'undefined') {
      try {
        const vo = new Audio(voiceoverSrc);
        vo.volume = 0.85;
        vo.play().catch(() => {});
      } catch (_) {}
    } else if (typeof window !== 'undefined' && window.CardiopolyPatches?.cardiopolyAudioV2) {
      const cue = id === 'code_blue' ? 'codeBlueAlert' : (id === 'cath_lab' ? 'invasiveCath' : 'monopolyAcquired');
      window.CardiopolyPatches.cardiopolyAudioV2.playCue(cue);
    }

    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), 5200);
  }

  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}`;

const oldCutInRegex = /class CutInOverlayManager\s*\{[\s\S]*?hide\(\)\s*\{[\s\S]*?\}\s*\}/;
if (oldCutInRegex.test(mcpBridgeContent)) {
  mcpBridgeContent = mcpBridgeContent.replace(oldCutInRegex, updatedCutInOverlayManager);
  fs.writeFileSync(mcpBridgePath, mcpBridgeContent, 'utf8');
  console.log('[patches/cardiopoly_mcp_runtime_bridge.js] Updated CutInOverlayManager with video/poster presets');
} else {
  console.error('[patches/cardiopoly_mcp_runtime_bridge.js] Old CutInOverlayManager not matched');
}

// 4. UPDATE patches/cardiopoly_script_patches.js
const scriptPatchesPath = path.join(ROOT, 'patches', 'cardiopoly_script_patches.js');
let scriptPatchesContent = fs.readFileSync(scriptPatchesPath, 'utf8');

// Add duckSoundtrack to CardiopolyAudioSynth
if (!scriptPatchesContent.includes('duckSoundtrack(durationMs')) {
  scriptPatchesContent = scriptPatchesContent.replace(
    /startClinicalLoFiSoundtrack\(\)\s*\{/,
    `duckSoundtrack(durationMs = 4500) {
    this.soundtrackDucked = true;
    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      this.soundtrackDucked = false;
    }, durationMs);
  }

  startClinicalLoFiSoundtrack() {`
  );

  // Apply duckMultiplier in tick
  scriptPatchesContent = scriptPatchesContent.replace(
    /const currentChord = chordSet\[chordIndex\];/,
    `const currentChord = chordSet[chordIndex];
      const duckMultiplier = this.soundtrackDucked ? 0.25 : 1.0;`
  );

  // Scale volume in playEnvelopedTone calls inside tick
  scriptPatchesContent = scriptPatchesContent.replace(
    /this\.playEnvelopedTone\(freq, beatInterval \* 3\.6, 'triangle', 0\.032, idx \* 0\.022\);/,
    `this.playEnvelopedTone(freq, beatInterval * 3.6, 'triangle', 0.032 * duckMultiplier, idx * 0.022);`
  );
  scriptPatchesContent = scriptPatchesContent.replace(
    /this\.playEnvelopedTone\(bassFreq, 0\.16, 'sine', 0\.055, 0\);/,
    `this.playEnvelopedTone(bassFreq, 0.16, 'sine', 0.055 * duckMultiplier, 0);`
  );
  scriptPatchesContent = scriptPatchesContent.replace(
    /this\.playEnvelopedTone\(note, 0\.22, 'sine', 0\.018, 0\);/,
    `this.playEnvelopedTone(note, 0.22, 'sine', 0.018 * duckMultiplier, 0);`
  );

  fs.writeFileSync(scriptPatchesPath, scriptPatchesContent, 'utf8');
  console.log('[patches/cardiopoly_script_patches.js] Added duckSoundtrack and dynamic volume scaling');
}

// 5. UPDATE script.js
const scriptPath = path.join(ROOT, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

const updatedInitCenterConsole = `// --- 2. CENTER CARDIOLOGY COMMAND CONSOLE ---
function initCenterConsole() {
  const tabCenterpieceBtn = document.getElementById("tab-centerpiece-btn");
  const tabRaceBtn = document.getElementById("tab-race-btn");
  const tabTickerBtn = document.getElementById("tab-ticker-btn");
  const tabTelemetryBtn = document.getElementById("tab-telemetry-btn");

  const viewCenterpiece = document.getElementById("console-centerpiece-view");
  const viewRace = document.getElementById("console-race-view");
  const viewTicker = document.getElementById("console-ticker-view");
  const viewTelemetry = document.getElementById("console-telemetry-view");

  const allTabs = [
    { btn: tabCenterpieceBtn, view: viewCenterpiece, name: "centerpiece" },
    { btn: tabRaceBtn, view: viewRace, name: "race" },
    { btn: tabTickerBtn, view: viewTicker, name: "ticker" },
    { btn: tabTelemetryBtn, view: viewTelemetry, name: "telemetry" }
  ];

  const setConsoleTab = (tabName) => {
    allTabs.forEach((t) => {
      if (t.btn) t.btn.classList.toggle("active", t.name === tabName);
      if (t.view) t.view.classList.toggle("active", t.name === tabName);
    });

    if (tabName === "centerpiece") {
      updateCenterpieceHud();
    } else if (tabName === "race") {
      updateCenterConsoleFactionRace();
    } else if (tabName === "telemetry") {
      updateCenterConsoleTelemetry();
    }
  };

  allTabs.forEach((t) => {
    if (t.btn) {
      t.btn.addEventListener("click", () => setConsoleTab(t.name));
    }
  });

  const consoleCanvas = document.getElementById("console-ecg-canvas");
  if (consoleCanvas && typeof CardiopolyTelemetry !== "undefined" && typeof CardiopolyTelemetry.initTelemetryCanvas === "function") {
    window.consoleTelemetryController = CardiopolyTelemetry.initTelemetryCanvas(consoleCanvas, { sbp: 120, dbp: 80 });
  }

  updateCenterpieceHud();
}

function updateCenterpieceHud() {
  const regimeBadge = document.getElementById("centerpiece-regime-badge");
  const turnBadge = document.getElementById("centerpiece-turn-badge");
  const playerBadge = document.getElementById("centerpiece-player-badge");
  const shockBadge = document.getElementById("centerpiece-shock-badge");

  if (regimeBadge && typeof gameState !== "undefined") {
    regimeBadge.textContent = gameState.currentRegime || "Singapore (3M)";
  }

  if (turnBadge && typeof gameState !== "undefined") {
    turnBadge.textContent = \`Turn \${gameState.turnNumber || 1}\`;
  }

  if (playerBadge && typeof gameState !== "undefined" && gameState.players && gameState.players[gameState.currentPlayerIndex]) {
    const curP = gameState.players[gameState.currentPlayerIndex];
    playerBadge.textContent = \`\${curP.name || 'Dr. Guidelines'}\`;
  }

  if (shockBadge && typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine?.activeShock) {
    shockBadge.textContent = CardiopolyMcpBridge.macroShockEngine.activeShock.headline || "Policy Active";
  } else if (shockBadge) {
    shockBadge.textContent = "Standard Protocol";
  }
}`;

const oldInitConsoleRegex = /\/\/ --- 2\. CENTER CARDIOLOGY COMMAND CONSOLE ---[\s\S]*?function updateCenterConsoleTelemetry\(\)/;
if (oldInitConsoleRegex.test(scriptContent)) {
  scriptContent = scriptContent.replace(oldInitConsoleRegex, `${updatedInitCenterConsole}\n\nfunction updateCenterConsoleTelemetry()`);
  
  // Wire updateCenterpieceHud into turn change
  if (!scriptContent.includes('updateCenterpieceHud();')) {
    scriptContent = scriptContent.replace(/updateTopScoreboard\(\);/g, 'updateTopScoreboard(); try { updateCenterpieceHud(); } catch(_) {}');
  }

  // Add audit cut-in trigger on TAX/AUDIT tile
  if (!scriptContent.includes("id: 'regulatory_audit'")) {
    const auditTileTarget = `if (tile.type === "TAX" || tile.type === "AUDIT") {`;
    const auditTileReplacement = `if (tile.type === "TAX" || tile.type === "AUDIT") {
    if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
      CardiopolyMcpBridge.cutInOverlay.playCutIn({
        id: 'regulatory_audit',
        title: 'REGULATORY CLAWBACK & AUDIT',
        subtitle: \`\${player.name} flagged for hospital billing review!\`,
        accentColor: '#f59e0b'
      });
    }`;
    scriptContent = scriptContent.replace(auditTileTarget, auditTileReplacement);
  }

  fs.writeFileSync(scriptPath, scriptContent, 'utf8');
  console.log('[script.js] Successfully updated initCenterConsole, updateCenterpieceHud, and regulatory_audit cut-in');
} else {
  console.error('[script.js] Failed to match oldInitConsoleRegex');
}

console.log('All upgrades applied successfully.');
