const fs = require('fs');

let raw = fs.readFileSync('script.js', 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

// 1. Safe resolveFactionKey in renderThumbnailBoard
const t1 = `    // Phase 2: Render inline SVG medical token
    if (typeof CardiopolyPatches !== "undefined") {
      const fKey = CardiopolyPatches.resolveFactionKey(player.factionId || player.faction || player.role);
      const meta = CardiopolyPatches.FACTION_METADATA[fKey];
      if (meta && meta.tokenSvg) {
        tokenEl.innerHTML = meta.tokenSvg;
      }
    }`;

const r1 = `    // Phase 2: Render inline SVG medical token
    if (typeof CardiopolyPatches !== "undefined" && CardiopolyPatches.FACTION_METADATA) {
      const fKey = typeof CardiopolyPatches.resolveFactionKey === "function"
        ? CardiopolyPatches.resolveFactionKey(player.factionId || player.faction || player.role)
        : (player.factionId || 'ACADEMIC');
      const meta = CardiopolyPatches.FACTION_METADATA[fKey] || CardiopolyPatches.FACTION_METADATA['ACADEMIC'];
      if (meta && meta.tokenSvg) {
        tokenEl.innerHTML = meta.tokenSvg;
      }
    }`;

if (!code.includes(t1)) {
  console.error("Target 1 not found in script.js");
  process.exit(1);
}
code = code.replace(t1, r1);

// 2. Immediate splash click/pointer handler and fail-safe error handling in initGame
const t2 = `async function initGame() {
  initTelemetryController();
  initCenterConsole();
  initSetupModal();
  initializePlayerFactions(gameState.players);
  initDieElement(document.getElementById("die-1"));
  initDieElement(document.getElementById("die-2"));
  renderDieFace(document.getElementById("die-1"), 1);
  renderDieFace(document.getElementById("die-2"), 1);

  wireEventListeners();

  // Animate splash screen progress bar at one-third speed while loading assets
  const progressBar = document.getElementById("splash-progress-bar");
  const statusText = document.getElementById("splash-status-text");

  const [propsText, cardsText, milestonesText] = await Promise.all([
    fetchTextWithFallback("Properties.csv", FALLBACK_PROPERTIES_CSV),
    fetchTextWithFallback("Cards.csv", FALLBACK_CARDS_CSV),
    fetchTextWithFallback("Milestones.csv", FALLBACK_MILESTONES_CSV)
  ]);

  const propertiesMap = parsePropertiesCSV(propsText);
  gameState.tiles = buildBoardTiles(propertiesMap);
  const parsedCards = parseCardsCSV(cardsText);
  gameState.cards.chance = parsedCards.chance;
  gameState.cards.communityChest = parsedCards.communityChest;
  gameState.milestonesData = parseMilestonesCSV(milestonesText);

  // Load dynamic clinical vignettes if available
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

  renderThumbnailBoard();
  refreshAllViews();

  let splashDismissed = false;
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
  }

  const splashScreenEl = document.getElementById("splash-screen");
  if (splashScreenEl) {
    splashScreenEl.onclick = skipSplash;
  }

  // Fill progress bar steadily over SPLASH_DURATION_MS
  const steps = 20;
  const stepWait = Math.round(SPLASH_DURATION_MS / steps);
  for (let i = 1; i <= steps; i++) {
    if (splashDismissed) break;
    const pct = Math.round((i / steps) * 100);
    if (progressBar) progressBar.style.width = \`\${pct}%\`;
    if (statusText) {
      if (pct === 40) {
        statusText.textContent = "Stocking Wegovy & Oculostenotic Stents...";
      } else if (pct === 85) {
        statusText.textContent = "Ready for Admission!";
      }
    }
    await sleep(stepWait);
  }

  if (!splashDismissed) {
    skipSplash();
  }
}`;

const r2 = `async function initGame() {
  let splashDismissed = false;
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
  }

  // Bind skip handlers immediately so title screen never hangs on user interaction
  const splashScreenEl = document.getElementById("splash-screen");
  if (splashScreenEl) {
    splashScreenEl.onclick = skipSplash;
    splashScreenEl.addEventListener("pointerdown", skipSplash, { once: true });
    splashScreenEl.addEventListener("keydown", skipSplash, { once: true });
  }

  try {
    initTelemetryController();
    initCenterConsole();
    initSetupModal();
    initializePlayerFactions(gameState.players);
    initDieElement(document.getElementById("die-1"));
    initDieElement(document.getElementById("die-2"));
    renderDieFace(document.getElementById("die-1"), 1);
    renderDieFace(document.getElementById("die-2"), 1);

    wireEventListeners();

    // Animate splash screen progress bar while loading assets
    const progressBar = document.getElementById("splash-progress-bar");
    const statusText = document.getElementById("splash-status-text");

    const [propsText, cardsText, milestonesText] = await Promise.all([
      fetchTextWithFallback("Properties.csv", FALLBACK_PROPERTIES_CSV),
      fetchTextWithFallback("Cards.csv", FALLBACK_CARDS_CSV),
      fetchTextWithFallback("Milestones.csv", FALLBACK_MILESTONES_CSV)
    ]);

    const propertiesMap = parsePropertiesCSV(propsText);
    gameState.tiles = buildBoardTiles(propertiesMap);
    const parsedCards = parseCardsCSV(cardsText);
    gameState.cards.chance = parsedCards.chance;
    gameState.cards.communityChest = parsedCards.communityChest;
    gameState.milestonesData = parseMilestonesCSV(milestonesText);

    // Load dynamic clinical vignettes if available
    try {
      const vignRes = await fetch("data/vignettes.json", { cache: "no-store" });
      if (vignRes.ok) {
        const data = await vignRes.json();
        window.__CARDIOPOLY_VIGNETTES__ = Array.isArray(data) ? data : (data.vignettes || []);
        if (typeof CardiopolyVignettes !== "undefined" && typeof CardiopolyVignettes.loadVignettes === "function") {
          CardiopolyVignettes.loadVignettes();
        }
      }
    } catch (_) {
      // Falls back to embedded vignettes
    }

    // Load MCP Live World Feed & initialize Macro Shock Engine
    if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
      try {
        await CardiopolyMcpBridge.macroShockEngine.loadMcpFeed("data/liveWorldFeed.json");
        CardiopolyMcpBridge.macroShockEngine.advanceTurn(gameState.turnNumber || 1);
      } catch (_) {}
    }

    renderThumbnailBoard();
    refreshAllViews();

    // Fill progress bar steadily over SPLASH_DURATION_MS
    const steps = 20;
    const stepWait = Math.round(SPLASH_DURATION_MS / steps);
    for (let i = 1; i <= steps; i++) {
      if (splashDismissed) break;
      const pct = Math.round((i / steps) * 100);
      if (progressBar) progressBar.style.width = \`\${pct}%\`;
      if (statusText) {
        if (pct === 40) {
          statusText.textContent = "Stocking Wegovy & Oculostenotic Stents...";
        } else if (pct === 85) {
          statusText.textContent = "Ready for Admission!";
        }
      }
      await sleep(stepWait);
    }
  } catch (err) {
    console.error("[Cardiopoly Init Warning]", err);
  } finally {
    if (!splashDismissed) {
      skipSplash();
    }
  }
}`;

if (!code.includes(t2)) {
  console.error("Target 2 not found in script.js");
  process.exit(1);
}
code = code.replace(t2, r2);

fs.writeFileSync('script.js', isCrlf ? code.replace(/\n/g, '\r\n') : code, 'utf8');
console.log('Successfully enhanced splash screen and token defense-in-depth');
