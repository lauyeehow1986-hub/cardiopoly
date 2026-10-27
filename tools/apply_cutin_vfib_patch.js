const fs = require('fs');
const path = require('path');

function normalize(s) { return s.replace(/\r\n/g, '\n'); }

// 1. Patch patches/cardiopoly_mcp_runtime_bridge.js
const bridgePath = path.join(__dirname, '..', 'patches', 'cardiopoly_mcp_runtime_bridge.js');
let bridgeCode = normalize(fs.readFileSync(bridgePath, 'utf8'));

const targetBridge = `class CutInOverlayManager {
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
          <video class="cutin-video" autoplay muted loop playsinline
                 onerror="this.style.display='none'; const p=this.nextElementSibling; if(p) p.style.display='block';">
            <source src="\${videoSrc}" type="video/webm">
            <source src="\${videoSrc.replace(/\\.webm$/, '.mp4')}" type="video/mp4">
          </video>
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

const replacementBridge = `class CutInOverlayManager {
  constructor() {
    this.overlayEl = null;
    this.hideTimer = null;
    this.vfibAnimFrame = null;
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

    // Emergency Room Perimeter Red Strobe
    if (id === 'code_blue' && typeof document !== 'undefined') {
      document.body.classList.add('code-blue-crisis-strobe');
    }

    const isCodeBlue = id === 'code_blue';
    const vfibCanvasMarkup = isCodeBlue ? '<canvas class="cutin-vfib-canvas" width="640" height="90" aria-label="ECG Ventricular Fibrillation Telemetry"></canvas>' : '';

    let mediaMarkup = '';
    if (videoSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <video class="cutin-video" autoplay muted loop playsinline
                 onerror="this.style.display='none'; const p=this.nextElementSibling; if(p) p.style.display='block';">
            <source src="\${videoSrc}" type="video/webm">
            <source src="\${videoSrc.replace(/\\.webm$/, '.mp4')}" type="video/mp4">
          </video>
          \${posterSrc ? \`<img class="cutin-poster" src="\${posterSrc}" alt="\${title}" style="display:none;" />\` : ''}
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else if (posterSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <img class="cutin-poster" src="\${posterSrc}" alt="\${title}" />
          \${vfibCanvasMarkup}
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
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    }

    el.innerHTML = \`
      <div class="cutin-banner-card \${isCodeBlue ? 'code-blue-card' : ''}" role="dialog" aria-modal="true" aria-label="\${title}">
        \${mediaMarkup}
        <div class="cutin-text-block">
          <div class="cutin-kicker">\${isCodeBlue ? '🚨 EMERGENCY CCU PROTOCOL // TAP TO DISMISS' : 'LIVE CLINICAL CUT-IN // TAP TO DISMISS'}</div>
          <h2 class="cutin-title">\${title}</h2>
          <p class="cutin-subtitle">\${subtitle}</p>
        </div>
      </div>
    \`;
    el.classList.remove('hidden');

    // Assure video autoplay in all modern browsers
    if (typeof document !== 'undefined') {
      const videoEl = el.querySelector('.cutin-video');
      if (videoEl) {
        videoEl.muted = true;
        videoEl.playsInline = true;
        try {
          const p = videoEl.play();
          if (p !== undefined) {
            p.catch(() => {
              const posterEl = el.querySelector('.cutin-poster');
              if (posterEl) posterEl.style.display = 'block';
              videoEl.style.display = 'none';
            });
          }
        } catch (_) {}
      }
    }

    // Start Dynamic V-Fib Telemetry Canvas Animation
    if (isCodeBlue && typeof document !== 'undefined') {
      const canvas = el.querySelector('.cutin-vfib-canvas');
      if (canvas && typeof canvas.getContext === 'function') {
        const ctx = canvas.getContext('2d');
        const startStamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        const renderFrame = (now) => {
          if (!el || el.classList.contains('hidden') || !canvas) return;
          const elapsed = (now - startStamp) / 1000;
          ctx.clearRect(0, 0, 640, 90);

          ctx.lineWidth = 2.8;
          ctx.beginPath();

          if (elapsed < 2.0) {
            // Phase 1: High-Frequency Chaotic V-Fib Waveform
            ctx.strokeStyle = '#ef4444';
            for (let x = 0; x < 640; x += 4) {
              const phase = x * 0.08 + elapsed * 26;
              const y = 45 + (Math.sin(phase * 1.8) + Math.cos(phase * 2.7)) * 18 + (Math.random() - 0.5) * 6;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          } else if (elapsed < 3.2) {
            // Phase 2: Asystole Flatline with low-frequency tremor
            ctx.strokeStyle = '#f87171';
            for (let x = 0; x < 640; x += 8) {
              const y = 45 + Math.sin(x * 0.04 + elapsed * 5) * 2.5;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          } else if (elapsed < 3.6) {
            // Phase 3: Defibrillator Shock Discharge Spike & Screen Flash
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(0, 0, 640, 90);
            ctx.strokeStyle = '#ffffff';
            for (let x = 0; x < 640; x += 6) {
              const y = (x >= 280 && x <= 360) ? (x % 24 === 0 ? 8 : 82) : 45;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          } else {
            // Phase 4: Restored Sinus Rhythm (P-QRS-T) in Emerald Green (#10b981)
            ctx.strokeStyle = '#10b981';
            const pqrst = (xVal) => {
              const mod = (xVal - elapsed * 150) % 210;
              if (mod > 35 && mod < 50) return -7 * Math.sin((mod - 35) / 15 * Math.PI); // P wave
              if (mod >= 50 && mod < 56) return 4; // Q wave
              if (mod >= 56 && mod < 66) return -38; // R wave
              if (mod >= 66 && mod < 74) return 14; // S wave
              if (mod > 95 && mod < 125) return -10 * Math.sin((mod - 95) / 30 * Math.PI); // T wave
              return 0;
            };
            for (let x = 0; x < 640; x += 4) {
              const y = 45 + pqrst(x);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          if (typeof requestAnimationFrame !== 'undefined') {
            this.vfibAnimFrame = requestAnimationFrame(renderFrame);
          }
        };

        if (typeof requestAnimationFrame !== 'undefined') {
          this.vfibAnimFrame = requestAnimationFrame(renderFrame);
        }
      }
    }

    // Duck soundtrack for drama
    if (typeof window !== 'undefined' && window.CardiopolyAudioSynth && typeof window.CardiopolyAudioSynth.duckSoundtrack === 'function') {
      window.CardiopolyAudioSynth.duckSoundtrack(5500);
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
    this.hideTimer = setTimeout(() => this.hide(), 5500);
  }

  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.vfibAnimFrame && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.vfibAnimFrame);
      this.vfibAnimFrame = null;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('code-blue-crisis-strobe');
    }
  }
}`;

if (!bridgeCode.includes(targetBridge)) {
  console.error("targetBridge not found in cardiopoly_mcp_runtime_bridge.js!");
  process.exit(1);
}

bridgeCode = bridgeCode.replace(targetBridge, replacementBridge);
fs.writeFileSync(bridgePath, bridgeCode.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Successfully upgraded CutInOverlayManager in cardiopoly_mcp_runtime_bridge.js");

// 2. Patch styles.css with strobe and v-fib rules
const cssPath = path.join(__dirname, '..', 'styles.css');
let cssCode = normalize(fs.readFileSync(cssPath, 'utf8'));

const cssAdditions = `
/* --- CODE BLUE EMERGENCY CRISIS STROBE & V-FIB CANVAS (EPAP-15 S09) --- */
@keyframes crisisRoomStrobe {
  0%, 100% {
    box-shadow: inset 0 0 100px rgba(239, 68, 68, 0.45), inset 0 0 40px rgba(239, 68, 68, 0.6);
  }
  50% {
    box-shadow: inset 0 0 180px rgba(239, 68, 68, 0.8), inset 0 0 80px rgba(220, 38, 38, 0.95);
  }
}

body.code-blue-crisis-strobe {
  animation: crisisRoomStrobe 0.55s ease-in-out infinite alternate !important;
}

body.emergency-interaction-lock #roll-btn,
body.emergency-interaction-lock .board-tile {
  pointer-events: none !important;
  filter: brightness(0.85);
}

.cutin-banner-card.code-blue-card {
  border-color: #ef4444;
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.65), 0 20px 40px rgba(0, 0, 0, 0.9);
}

.cutin-vfib-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  pointer-events: none;
  z-index: 4;
}

.auction-paused-warning {
  margin: 10px 0;
  padding: 8px 14px;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-align: center;
  animation: pulse 1s infinite alternate;
}
`;

if (!cssCode.includes('.cutin-vfib-canvas')) {
  cssCode += cssAdditions;
  fs.writeFileSync(cssPath, cssCode.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✓ Successfully added crisis strobe and V-Fib canvas rules to styles.css");
} else {
  console.log("CSS rules already present.");
}
