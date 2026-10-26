const fs = require('fs');

let rawCode = fs.readFileSync('script.js', 'utf8');
const isCrlf = rawCode.includes('\r\n');
let code = rawCode.replace(/\r\n/g, '\n');

// 1. In resetGameToRules: remove the async await call and replace with synchronous advanceTurn(1)
const tReset = `  // Load MCP Live World Feed & initialize Macro Shock Engine
  if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
    try {
      await CardiopolyMcpBridge.macroShockEngine.loadMcpFeed("data/liveWorldFeed.json");
      CardiopolyMcpBridge.macroShockEngine.advanceTurn(gameState.turnNumber || 1);
    } catch (_) {}
  }`;

const rReset = `  // Reset MCP Live World Engine for new game
  if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
    try {
      CardiopolyMcpBridge.macroShockEngine.advanceTurn(1);
    } catch (_) {}
  }`;

if (!code.includes(tReset)) {
  console.error("Target reset not found");
  process.exit(1);
}
code = code.replace(tReset, rReset);

// 2. In initGame: add the async loadMcpFeed right after loading vignettes
const tInit = `  // Load dynamic clinical vignettes if available
  try {
    const vignRes = await fetch("data/vignettes.json", { cache: "no-store" });
    if (vignRes.ok) {
      const data = await vignRes.json();
      window.__CARDIOPOLY_VIGNETTES__ = Array.isArray(data) ? data : (data.vignettes || []);
      if (typeof CardiopolyVignettes !== "undefined" && typeof CardiopolyVignettes.loadVignettes === "function") {
        CardiopolyVignettes.loadVignettes();
      }
    }
  } catch (err) {
    // Falls back to embedded vignettes
  }

  renderThumbnailBoard();`;

const rInit = `  // Load dynamic clinical vignettes if available
  try {
    const vignRes = await fetch("data/vignettes.json", { cache: "no-store" });
    if (vignRes.ok) {
      const data = await vignRes.json();
      window.__CARDIOPOLY_VIGNETTES__ = Array.isArray(data) ? data : (data.vignettes || []);
      if (typeof CardiopolyVignettes !== "undefined" && typeof CardiopolyVignettes.loadVignettes === "function") {
        CardiopolyVignettes.loadVignettes();
      }
    }
  } catch (err) {
    // Falls back to embedded vignettes
  }

  // Load MCP Live World Feed & initialize Macro Shock Engine
  if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
    try {
      await CardiopolyMcpBridge.macroShockEngine.loadMcpFeed("data/liveWorldFeed.json");
      CardiopolyMcpBridge.macroShockEngine.advanceTurn(gameState.turnNumber || 1);
    } catch (_) {}
  }

  renderThumbnailBoard();`;

if (!code.includes(tInit)) {
  console.error("Target init not found");
  process.exit(1);
}
code = code.replace(tInit, rInit);

const finalCode = isCrlf ? code.replace(/\n/g, '\r\n') : code;
fs.writeFileSync('script.js', finalCode, 'utf8');
console.log('Successfully fixed syntax error and placed loadMcpFeed in initGame');
