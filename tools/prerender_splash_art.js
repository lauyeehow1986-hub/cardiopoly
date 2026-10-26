const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. UPDATE index.html
const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Add preload link in <head> if not present
if (!html.includes('rel="preload" as="image" href="assets/images/cardiopoly_centerpiece_remastered.jpg"')) {
  html = html.replace(
    /<link rel="stylesheet" href="styles\.css\?v=2\.2\.0" \/>/,
    `<link rel="preload" as="image" href="assets/images/cardiopoly_centerpiece_remastered.jpg" fetchpriority="high" />\n  <link rel="stylesheet" href="styles.css?v=2.2.0" />`
  );
  console.log('[index.html] Added preload hint for remastered centerpiece art');
}

// Update Splash Screen Markup
const oldSplashCardRegex = /<div class="splash-card">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<script>/;
const newSplashCard = `<div class="splash-card">
      <div class="splash-badge-kicker">WHERE EVIDENCE-BASED MEDICINE MEETS HIGH-MARGIN METAL</div>
      <div class="splash-image-wrap">
        <img
          id="splash-img"
          src="assets/images/cardiopoly_centerpiece_remastered.jpg"
          alt="Cardiopoly Remastered Game Centerpiece"
          fetchpriority="high"
          decoding="sync"
          onerror="this.src='Monopoly_board_center.png'"
        />
        <div class="splash-image-overlay-glow"></div>
      </div>
      <div class="splash-loading-area">
        <div class="splash-status" id="splash-status-text">Calibrating Cath Lab Billing Codes...</div>
        <div class="splash-progress-track">
          <div class="splash-progress-bar" id="splash-progress-bar"></div>
        </div>
        <button id="skip-splash-btn" class="splash-enter-btn" type="button">ENTER SIMULATION</button>
        <div class="splash-hint-sub">Tap anywhere or press Space / Enter to skip</div>
      </div>
    </div>
  </div>
  <script>`;

if (oldSplashCardRegex.test(html)) {
  html = html.replace(oldSplashCardRegex, newSplashCard);
  console.log('[index.html] Updated splash-card markup with remastered art & enter button');
} else {
  console.error('[index.html] Could not match oldSplashCardRegex');
}

// Update Keyboard listener and click on skip-splash-btn in inline script
const oldKeyboardCheck = `window.addEventListener("pointerdown", function () {`;
const newKeyboardCheck = `// Enter simulation button click
      var enterBtn = document.getElementById("skip-splash-btn");
      if (enterBtn) {
        enterBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          dismissSplash();
        });
      }

      // Keyboard dismiss (Space, Enter, Escape)
      window.addEventListener("keydown", function(e) {
        if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
          var s = document.getElementById("splash-screen");
          if (s && s.classList.contains("active")) {
            e.preventDefault();
            dismissSplash();
          }
        }
      });

      window.addEventListener("pointerdown", function () {`;

if (!html.includes('id="skip-splash-btn"')) {
  // It was just replaced above
}
if (!html.includes('// Enter simulation button click') && html.includes(oldKeyboardCheck)) {
  html = html.replace(oldKeyboardCheck, newKeyboardCheck);
  console.log('[index.html] Added keyboard and explicit button listeners to splash script');
}

fs.writeFileSync(indexPath, html, 'utf8');

// 2. UPDATE styles.css
const stylesPath = path.join(ROOT, 'styles.css');
let css = fs.readFileSync(stylesPath, 'utf8');

const splashCssUpgrade = `
/* ========================================================
   SPLASH SCREEN PRE-RENDER & ARTWORK POLISH (GRADIENT-BOOST)
   ======================================================== */
.splash-badge-kicker {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 12px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  backdrop-filter: blur(4px);
}

.splash-image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 2px solid rgba(6, 182, 212, 0.45);
  background: radial-gradient(circle at center, #0f172a 0%, #030712 100%);
  box-shadow: 0 0 28px rgba(6, 182, 212, 0.35), inset 0 0 16px rgba(0, 0, 0, 0.8);
  animation: splashGlowPulse 3.5s infinite ease-in-out;
}

@keyframes splashGlowPulse {
  0%, 100% {
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 0 24px rgba(6, 182, 212, 0.25), inset 0 0 16px rgba(0, 0, 0, 0.8);
  }
  50% {
    border-color: rgba(6, 182, 212, 0.85);
    box-shadow: 0 0 38px rgba(6, 182, 212, 0.55), inset 0 0 20px rgba(6, 182, 212, 0.25);
  }
}

.splash-image-overlay-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, transparent 40%, rgba(3, 7, 18, 0.45) 100%);
}

.splash-enter-btn {
  margin-top: 12px;
  width: 100%;
  padding: 11px 18px;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ffffff;
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  text-transform: uppercase;
}

.splash-enter-btn:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 22px rgba(6, 182, 212, 0.65);
  filter: brightness(1.12);
}

.splash-enter-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.35);
}
`;

if (!css.includes('SPLASH SCREEN PRE-RENDER & ARTWORK POLISH')) {
  css += '\n' + splashCssUpgrade;
  fs.writeFileSync(stylesPath, css, 'utf8');
  console.log('[styles.css] Appended splash screen pre-render and artwork polish styles');
}

console.log('Splash pre-render upgrade successfully applied.');
