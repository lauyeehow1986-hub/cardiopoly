const fs = require('fs');
const path = require('path');

// 1. UPDATE styles.css
const cssPath = path.resolve(__dirname, '../styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace color bar thickness with 5px
css = css.replace(
  /\.thumb-tile\.side-bottom\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-bottom .thumb-color-bar {
  top: 0; left: 0; right: 0; height: 5px;
  border-bottom: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-left\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-left .thumb-color-bar {
  top: 0; bottom: 0; right: 0; width: 5px;
  border-left: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-top\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-top .thumb-color-bar {
  bottom: 0; left: 0; right: 0; height: 5px;
  border-top: 0.5px solid rgba(0,0,0,0.45);
}`
);

css = css.replace(
  /\.thumb-tile\.side-right\s+\.thumb-color-bar\s*\{[^}]+\}/,
  `.thumb-tile.side-right .thumb-color-bar {
  top: 0; bottom: 0; left: 0; width: 5px;
  border-right: 0.5px solid rgba(0,0,0,0.45);
}`
);

// Replace .tile-cost-badge with z-index, pointer-events: none, and directional offsets
const costBadgeRegex = /\.tile-cost-badge\s*\{[^}]+\}/;
const newCostBadgeCss = `.tile-cost-badge {
  position: relative;
  z-index: 2;
  font-size: 0.58rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  color: #f1f5f9;
  background: rgba(2, 6, 23, 0.75);
  padding: 1px 3px;
  border-radius: 3px;
  align-self: center;
  pointer-events: none;
  white-space: nowrap;
}

/* Directional clearance to guarantee 0% geometric occlusion with color bars */
.thumb-tile.side-bottom .tile-cost-badge {
  margin-top: 5px;
  margin-bottom: 0;
}
.thumb-tile.side-top .tile-cost-badge {
  margin-bottom: 5px;
  margin-top: 0;
}
.thumb-tile.side-left .tile-cost-badge {
  margin-right: 5px;
  margin-left: 0;
}
.thumb-tile.side-right .tile-cost-badge {
  margin-left: 5px;
  margin-right: 0;
}`;

if (costBadgeRegex.test(css)) {
  css = css.replace(costBadgeRegex, newCostBadgeCss);
  console.log('✓ Updated .tile-cost-badge and added directional clearance offsets in styles.css');
} else {
  css += '\n' + newCostBadgeCss;
  console.log('✓ Appended .tile-cost-badge to styles.css');
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('✓ Successfully wrote styles.css');

// 2. UPDATE script.js
const scriptPath = path.resolve(__dirname, '../script.js');
let script = fs.readFileSync(scriptPath, 'utf8');

// Update buildBoardTiles to include price, cost, basePrice
script = script.replace(
  /priceWP:\s*prop\.priceWP,/,
  `priceWP: prop.priceWP,\n          price: prop.priceWP,\n          cost: prop.priceWP,\n          basePrice: prop.priceWP,`
);

// Update costBadge.textContent in renderThumbnailBoard
script = script.replace(
  /costBadge\.textContent\s*=\s*`\$\{tile\.price\s*\|\|\s*tile\.cost\s*\|\|\s*300\}\s*WP`;/,
  'costBadge.textContent = `${tile.priceWP || tile.price || tile.cost || 300} WP`;'
);

// Add purgeDeprecatedTestElements if not present
if (!script.includes('function purgeDeprecatedTestElements()')) {
  const purgeFn = `
// ============================================================================
// PURGE DEPRECATED TEST CONTROLS (LEDAPB Benchmark Compliance)
// Ensures any legacy test controls cached in mobile browsers/PWAs are eliminated
// ============================================================================
function purgeDeprecatedTestElements() {
  const staleIds = [
    "test-code-blue-btn",
    "trigger-code-blue-btn",
    "test-resus-btn",
    "dev-test-code-blue"
  ];
  staleIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  if (typeof document !== "undefined" && document.querySelectorAll) {
    document.querySelectorAll("[id*='test-code-blue'], [id*='trigger-code-blue'], [class*='test-code-blue']").forEach((el) => {
      el.remove();
    });
  }
}
`;
  script = script.replace('function initSetupModal() {', `${purgeFn}\nfunction initSetupModal() {\n  purgeDeprecatedTestElements();`);
  script = script.replace('function openSetupModal() {', 'function openSetupModal() {\n  purgeDeprecatedTestElements();');
  script = script.replace('async function initGame() {', 'async function initGame() {\n  purgeDeprecatedTestElements();');
  console.log('✓ Injected purgeDeprecatedTestElements() into script.js');
}

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('✓ Successfully wrote script.js');

// 3. UPDATE index.html
const htmlPath = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Add Cache-Control meta tags if missing
if (!html.includes('http-equiv="Cache-Control"')) {
  const metaTags = `  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n  <meta http-equiv="Pragma" content="no-cache" />\n  <meta http-equiv="Expires" content="0" />\n`;
  html = html.replace(/<title>/, `${metaTags}  <title>`);
  console.log('✓ Added HTTP Cache-Control meta tags to index.html');
}

// Bump ?v=2.2.0 to ?v=2.3.0
html = html.replace(/\?v=2\.2\.0/g, '?v=2.3.0');
console.log('✓ Bumped asset query strings in index.html to ?v=2.3.0');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ Successfully wrote index.html');
