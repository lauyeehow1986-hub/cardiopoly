const fs = require('fs');

console.log('=== UPGRADING CARDIOPOLY TO ITERATION 2+ (SOUNDTRACK & BULLETPROOF SPLASH) ===');

// ============================================================================
// 1. UPDATE patches/cardiopoly_script_patches.js
// ============================================================================
let patchesCode = fs.readFileSync('patches/cardiopoly_script_patches.js', 'utf8');
const isPatchesCrlf = patchesCode.includes('\r\n');
patchesCode = patchesCode.replace(/\r\n/g, '\n');

const audioTarget = `class CardiopolyAudioEngineV2 {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambienceTimer = null;
    this.currentSbp = 120;
  }`;

const audioReplacement = `class CardiopolyAudioEngineV2 {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.musicEnabled = false;
    this.ambienceTimer = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.currentSbp = 120;
  }`;

if (patchesCode.includes(audioTarget)) {
  patchesCode = patchesCode.replace(audioTarget, audioReplacement);
  if (!patchesCode.includes(methodsTarget)) {
    console.error('methodsTarget not found in patches/cardiopoly_script_patches.js');
    process.exit(1);
  }
  patchesCode = patchesCode.replace(methodsTarget, methodsReplacement);
  fs.writeFileSync('patches/cardiopoly_script_patches.js', isPatchesCrlf ? patchesCode.replace(/\n/g, '\r\n') : patchesCode, 'utf8');
  console.log('✓ Successfully injected Clinical Lo-Fi Strategy Soundtrack into patches/cardiopoly_script_patches.js');
} else {
  console.log('✓ Clinical Lo-Fi Strategy Soundtrack already present in patches/cardiopoly_script_patches.js');
}


// ============================================================================
// 2. UPDATE index.html (Failsafe Script, Music Button, Cache-Busting)
// ============================================================================
let html = fs.readFileSync('index.html', 'utf8');
const isHtmlCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// A. Cache busting on stylesheet links
html = html.replace(
  '<link rel="stylesheet" href="styles.css" />\n  <link rel="stylesheet" href="patches/cardiopoly_styles_patches.css" />',
  '<link rel="stylesheet" href="styles.css?v=2.2.0" />\n  <link rel="stylesheet" href="patches/cardiopoly_styles_patches.css?v=2.2.0" />'
);

// B. Inline failsafe script right after splash-screen
const splashEndTag = `        <div class="splash-hint-sub">Click anywhere to skip intro</div>
      </div>
    </div>
  </div>`;

const splashFailsafeScript = `        <div class="splash-hint-sub">Tap anywhere to skip intro</div>
      </div>
    </div>
  </div>
  <script>
    (function () {
      var dismissed = false;
      function dismissSplash() {
        if (dismissed) return;
        dismissed = true;
        var s = document.getElementById("splash-screen");
        if (s) {
          s.classList.remove("active");
          s.style.opacity = "0";
          s.style.pointerEvents = "none";
          setTimeout(function () { if (s.parentNode) s.style.display = "none"; }, 350);
        }
        var r = document.getElementById("rules-screen");
        if (r && (!window.gameState || window.gameState.phase === "RULES" || window.gameState.phase === "LOADING")) {
          r.classList.add("active");
        }
      }
      window.__dismissCardiopolySplash = dismissSplash;

      // Instant touch & pointer dismiss
      window.addEventListener("pointerdown", function () {
        var s = document.getElementById("splash-screen");
        if (s && s.classList.contains("active")) { dismissSplash(); }
      }, { capture: true, passive: true });

      // Progressive status updates
      var pct = 0;
      var statusMessages = [
        "Calibrating Cath Lab Billing Codes...",
        "Loading ACC/AHA Guideline Formularies...",
        "Syncing RVU Reimbursement Schedules...",
        "Connecting Real-Time Telemetry ECG...",
        "Ready for Clinical Admission!"
      ];
      var timer = setInterval(function () {
        if (dismissed) { clearInterval(timer); return; }
        pct = Math.min(100, pct + 14);
        var bar = document.getElementById("splash-progress-bar");
        var txt = document.getElementById("splash-status-text");
        if (bar) bar.style.width = pct + "%";
        if (txt) {
          var stepIdx = Math.min(statusMessages.length - 1, Math.floor((pct / 100) * statusMessages.length));
          txt.textContent = statusMessages[stepIdx];
        }
        if (pct >= 100) {
          clearInterval(timer);
          setTimeout(dismissSplash, 280);
        }
      }, 100);

      // Hard ceiling timeout: never hangs longer than 1.4s under any condition
      setTimeout(dismissSplash, 1400);
    })();
  </script>`;

if (!html.includes(splashEndTag)) {
  console.error('splashEndTag not found in index.html');
  process.exit(1);
}
html = html.replace(splashEndTag, splashFailsafeScript);

// C. Add Music button to navbar
const navButtonsTarget = `<button id="audio-mute-btn" class="btn-chip btn-icon-chip" type="button" title="Toggle Sound Audio">🔊 Sound</button>
          <button id="lobby-setup-btn" class="btn-chip btn-icon-chip" type="button" title="Match Settings &amp; Rules">⚙️ Options</button>`;

const navButtonsReplacement = `<button id="audio-mute-btn" class="btn-chip btn-icon-chip" type="button" title="Toggle Sound SFX">🔊 Sound</button>
          <button id="audio-music-btn" class="btn-chip btn-icon-chip" type="button" title="Toggle Clinical Lo-Fi Strategy Music">🎵 Music</button>
          <button id="lobby-setup-btn" class="btn-chip btn-icon-chip" type="button" title="Match Settings &amp; Rules">⚙️ Options</button>`;

if (!html.includes(navButtonsTarget)) {
  console.error('navButtonsTarget not found in index.html');
  process.exit(1);
}
html = html.replace(navButtonsTarget, navButtonsReplacement);

// D. Cache busting on script tags
html = html.replace(
  `<script src="src/components/audioSynth.js"></script>
  <script src="src/components/telemetry.js"></script>
  <script src="src/engine/factions.js"></script>
  <script src="src/engine/policies.js"></script>
  <script src="src/components/toasts.js"></script>
  <script src="src/engine/aiController.js"></script>
  <script src="src/engine/departmentUpgrades.js"></script>
  <script src="src/components/vignetteModal.js"></script>
  <script src="src/network/supabaseClient.js"></script>
  <script src="src/network/p2pSync.js"></script>
  <script src="patches/cardiopoly_script_patches.js"></script>
  <script src="patches/cardiopoly_mcp_runtime_bridge.js"></script>
  <script src="script.js"></script>`,
  `<script src="src/components/audioSynth.js?v=2.2.0"></script>
  <script src="src/components/telemetry.js?v=2.2.0"></script>
  <script src="src/engine/factions.js?v=2.2.0"></script>
  <script src="src/engine/policies.js?v=2.2.0"></script>
  <script src="src/components/toasts.js?v=2.2.0"></script>
  <script src="src/engine/aiController.js?v=2.2.0"></script>
  <script src="src/engine/departmentUpgrades.js?v=2.2.0"></script>
  <script src="src/components/vignetteModal.js?v=2.2.0"></script>
  <script src="src/network/supabaseClient.js?v=2.2.0"></script>
  <script src="src/network/p2pSync.js?v=2.2.0"></script>
  <script src="patches/cardiopoly_script_patches.js?v=2.2.0"></script>
  <script src="patches/cardiopoly_mcp_runtime_bridge.js?v=2.2.0"></script>
  <script src="script.js?v=2.2.0"></script>`
);

fs.writeFileSync('index.html', isHtmlCrlf ? html.replace(/\n/g, '\r\n') : html, 'utf8');
console.log('✓ Successfully updated index.html with inline failsafe, music button, and cache-busting');


// ============================================================================
// 3. UPDATE script.js (Wire Music Button, Coordinate with Inline Splash Failsafe)
// ============================================================================
let scriptCode = fs.readFileSync('script.js', 'utf8');
const isScriptCrlf = scriptCode.includes('\r\n');
scriptCode = scriptCode.replace(/\r\n/g, '\n');

const muteBtnWiring = `  const muteBtn = document.getElementById("audio-mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
        const muted = window.CardiopolyAudio.audioSynth.toggleMute();
        muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
      }
    });
  }`;

const muteAndMusicWiring = `  const muteBtn = document.getElementById("audio-mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (window.CardiopolyPatches?.cardiopolyAudioV2) {
        const enabled = window.CardiopolyPatches.cardiopolyAudioV2.toggleSound();
        muteBtn.textContent = enabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
        muteBtn.classList.toggle("active", enabled);
      } else if (window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
        const muted = window.CardiopolyAudio.audioSynth.toggleMute();
        muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
      }
    });
  }

  const musicBtn = document.getElementById("audio-music-btn");
  if (musicBtn) {
    musicBtn.addEventListener("click", () => {
      if (window.CardiopolyPatches?.cardiopolyAudioV2) {
        const isMusic = window.CardiopolyPatches.cardiopolyAudioV2.toggleMusic();
        musicBtn.textContent = isMusic ? "🎵 Music: ON" : "🔇 Music: OFF";
        musicBtn.classList.toggle("active", isMusic);
      }
    });
  }`;

if (!scriptCode.includes(muteBtnWiring)) {
  console.error('muteBtnWiring not found in script.js');
  process.exit(1);
}
scriptCode = scriptCode.replace(muteBtnWiring, muteAndMusicWiring);

// Coordinate with window.__dismissCardiopolySplash in initGame
const skipSplashDecl = `  let splashDismissed = false;
  function skipSplash() {
    if (splashDismissed) return;
    splashDismissed = true;
    const splashEl = document.getElementById("splash-screen");
    if (splashEl) {
      splashEl.classList.remove("active");
      splashEl.onclick = null;
    }
    const rulesEl = document.getElementById("rules-screen");
    if (rulesEl) rulesEl.classList.add("active");
    gameState.phase = "RULES";
  }`;

const skipSplashEnhanced = `  let splashDismissed = false;
  function skipSplash() {
    if (splashDismissed) return;
    splashDismissed = true;
    if (typeof window.__dismissCardiopolySplash === "function") {
      window.__dismissCardiopolySplash();
    } else {
      const splashEl = document.getElementById("splash-screen");
      if (splashEl) {
        splashEl.classList.remove("active");
        splashEl.onclick = null;
      }
    }
    const rulesEl = document.getElementById("rules-screen");
    if (rulesEl) rulesEl.classList.add("active");
    gameState.phase = "RULES";
  }`;

if (!scriptCode.includes(skipSplashDecl)) {
  console.error('skipSplashDecl not found in script.js');
  process.exit(1);
}
scriptCode = scriptCode.replace(skipSplashDecl, skipSplashEnhanced);

fs.writeFileSync('script.js', isScriptCrlf ? scriptCode.replace(/\n/g, '\r\n') : scriptCode, 'utf8');
console.log('✓ Successfully wired Music button and coordinated splash dismiss in script.js');


// ============================================================================
// 4. UPDATE styles.css (Smooth Transitions & Music Button Styling)
// ============================================================================
let stylesCode = fs.readFileSync('styles.css', 'utf8');
const isStylesCrlf = stylesCode.includes('\r\n');
stylesCode = stylesCode.replace(/\r\n/g, '\n');

const splashStylesTarget = `.splash-card {
  width: 100%;
  max-width: 420px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(6, 182, 212, 0.35);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15);
  text-align: center;
}`;

const splashStylesEnhanced = `.splash-card {
  width: 100%;
  max-width: 420px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.45);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.22);
  text-align: center;
  transition: opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1), transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.splash-hint-sub {
  margin-top: 10px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.04em;
  animation: splashBreathe 2s ease-in-out infinite;
}

@keyframes splashBreathe {
  0%, 100% { opacity: 0.65; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

.btn-icon-chip.active {
  background: rgba(16, 185, 129, 0.25);
  border-color: #10b981;
  color: #34d399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
}`;

if (!stylesCode.includes(splashStylesTarget)) {
  console.error('splashStylesTarget not found in styles.css');
  process.exit(1);
}
stylesCode = stylesCode.replace(splashStylesTarget, splashStylesEnhanced);

fs.writeFileSync('styles.css', isStylesCrlf ? stylesCode.replace(/\n/g, '\r\n') : stylesCode, 'utf8');
console.log('✓ Successfully enhanced styles.css with hardware-accelerated transitions & music styling');

console.log('\n=== ALL UPGRADES APPLIED CLEANLY (4/4) ===\n');
