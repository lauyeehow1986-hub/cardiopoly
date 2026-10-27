const fs = require('fs');
const path = require('path');

// 1. UPDATE styles.css
const cssPath = path.resolve(__dirname, '../styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Update .screen-overlay
css = css.replace(
  /\.screen-overlay\s*\{[^}]+\}/,
  `.screen-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.94);
  display: none;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 10px;
}`
);

// Update .screen-overlay.active
css = css.replace(
  /\.screen-overlay\.active\s*\{[^}]+\}/,
  `.screen-overlay.active {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}`
);

// Update .setup-modal
css = css.replace(
  /\.setup-modal\s*\{[^}]+\}/,
  `.setup-modal {
  width: 100%;
  max-width: 660px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(6, 182, 212, 0.35);
  border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2);
  color: #f1f5f9;
  max-height: none;
  overflow: visible;
}`
);

// Update .board-wrapper
css = css.replace(
  /\.board-wrapper\s*\{[^}]+\}/,
  `.board-wrapper {
  position: relative;
  width: 100%;
  max-width: min(96vw, 440px);
  aspect-ratio: 1 / 1;
  background: var(--bg-board);
  border: 2.5px solid #0f172a;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  grid-template-rows: repeat(11, 1fr);
  overflow: hidden;
  margin: 0 auto;
}`
);

// Update color bars to slim 4px / 3.5px
css = css.replace(
  /\.thumb-tile\.side-bottom\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-bottom .thumb-color-bar {
  top: 0; left: 0; right: 0; height: 4px;
  border-bottom: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-left\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-left .thumb-color-bar {
  top: 0; bottom: 0; right: 0; width: 3.5px;
  border-left: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-top\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-top .thumb-color-bar {
  bottom: 0; left: 0; right: 0; height: 4px;
  border-top: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-right\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-right .thumb-color-bar {
  top: 0; bottom: 0; left: 0; width: 3.5px;
  border-right: 0.5px solid rgba(0,0,0,0.45);
}`
);

// Update .tile-cost-badge and directional margins
const costBadgeBlockRegex = /\.tile-cost-badge\s*\{[^}]+\}[\s\S]*?\.thumb-tile\.side-right\s+\.tile-cost-badge\s*\{[^}]+\}/;
const newCostBadgeBlock = `.tile-cost-badge {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  font-size: clamp(0.44rem, 1.6vw, 0.54rem);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f1f5f9;
  background: rgba(2, 6, 23, 0.82);
  padding: 1px 2px;
  border-radius: 2px;
  align-self: center;
  pointer-events: none;
  white-space: nowrap;
  max-width: 95%;
  overflow: hidden;
  line-height: 1;
}

.tile-cost-val {
  font-weight: 800;
}

.tile-cost-unit {
  font-size: 0.78em;
  font-weight: 700;
  opacity: 0.85;
  margin-left: 1px;
}

/* Directional clearance to guarantee 0% geometric occlusion with color bars */
.thumb-tile.side-bottom .tile-cost-badge {
  margin-top: 4px;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
}
.thumb-tile.side-top .tile-cost-badge {
  margin-bottom: 4px;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0;
}
.thumb-tile.side-left .tile-cost-badge {
  margin: 0;
  padding-right: 1px;
}
.thumb-tile.side-right .tile-cost-badge {
  margin: 0;
  padding-left: 1px;
}`;

css = css.replace(costBadgeBlockRegex, newCostBadgeBlock);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('✓ Successfully updated styles.css with PBTNB & MVEAB rules');

// 2. UPDATE script.js
const scriptPath = path.resolve(__dirname, '../script.js');
let script = fs.readFileSync(scriptPath, 'utf8');

// Update renderThumbnailBoard costBadge innerHTML
script = script.replace(
  /const costBadge = document\.createElement\("span"\);\s*costBadge\.className = "tile-cost-badge";\s*costBadge\.textContent = `\$\{tile\.priceWP \|\| tile\.price \|\| tile\.cost \|\| 300\} WP`;/,
  `const costBadge = document.createElement("span");
      costBadge.className = "tile-cost-badge";
      const costWP = tile.priceWP || tile.price || tile.cost || 300;
      costBadge.innerHTML = \`<span class="tile-cost-val">\${costWP}</span><span class="tile-cost-unit">WP</span>\`;`
);

// Update openSetupModal with scroll-to-top reset
const oldOpenSetup = `function openSetupModal() {
  purgeDeprecatedTestElements();
  const modal = document.getElementById("setup-modal");
  if (!modal) return;
  modal.classList.add("active");`;

const newOpenSetup = `function openSetupModal() {
  purgeDeprecatedTestElements();
  const modal = document.getElementById("setup-modal");
  if (!modal) return;
  modal.classList.add("active");
  modal.scrollTop = 0;
  const innerModal = modal.querySelector(".setup-modal");
  if (innerModal) innerModal.scrollTop = 0;
  const section1 = modal.querySelector(".setup-section");
  if (section1) section1.scrollIntoView({ block: "start", inline: "nearest" });`;

script = script.replace(oldOpenSetup, newOpenSetup);

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('✓ Successfully updated script.js with structured badge and scroll-to-top reset');
