/**
 * tools/apply_phase1_to_phase4.js
 * Applies all Phase 1-4 patches to script.js, styles.css, src/components/vignetteModal.js, and index.html
 * with strict line-ending normalization.
 */

const fs = require('fs');

console.log('>>> Starting Cardiopoly Phase 1-4 Patch Application (with LF normalization)...');

// Helper to replace normalized text
function replaceNormalized(content, target, replacement) {
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');

  if (!normContent.includes(normTarget)) {
    console.error('Target not found in content! Target preview:\n', normTarget.slice(0, 100));
    return content;
  }
  return normContent.replace(normTarget, normReplacement);
}

// ============================================================================
// 1. MERGE STYLES PATCHES INTO styles.css
// ============================================================================
let stylesContent = fs.readFileSync('styles.css', 'utf8');
const stylesPatchContent = fs.readFileSync('patches/cardiopoly_styles_patches.css', 'utf8');

if (!stylesContent.includes('CARDIOPOLY PATCHES MERGED')) {
  stylesContent += '\n\n/* --- CARDIOPOLY PATCHES MERGED --- */\n' + stylesPatchContent;
  fs.writeFileSync('styles.css', stylesContent, 'utf8');
  console.log('✓ Merged cardiopoly_styles_patches.css into styles.css');
}

// ============================================================================
// 2. ENHANCE VIGNETTE MODAL IN src/components/vignetteModal.js
// ============================================================================
let vigModal = fs.readFileSync('src/components/vignetteModal.js', 'utf8');

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="vignette-title">',
  '<div class="vignette-modal-dialog vignette-modal-content clinical-modal-card" role="dialog" aria-modal="true" aria-labelledby="vignette-title">'
);

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-patient-card">',
  '<div class="vignette-patient-card vignette-patient-banner">'
);

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-choices-grid">',
  '<div class="vignette-choices-grid vignette-options-grid clinical-choices-container">'
);

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-choice-card choice-gdmt" data-choice="CHOICE_GDMT" tabindex="0">',
  '<div class="vignette-choice-card vignette-option-card choice-gdmt" data-choice="CHOICE_GDMT" tabindex="0">'
);

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-choice-card choice-intervention" data-choice="CHOICE_INTERVENTION" tabindex="0">',
  '<div class="vignette-choice-card vignette-option-card choice-intervention" data-choice="CHOICE_INTERVENTION" tabindex="0">'
);

vigModal = replaceNormalized(
  vigModal,
  '<div class="vignette-choice-card choice-cost" data-choice="CHOICE_COST_CONTAINMENT" tabindex="0">',
  '<div class="vignette-choice-card vignette-option-card choice-cost" data-choice="CHOICE_COST_CONTAINMENT" tabindex="0">'
);

if (!vigModal.includes('CardiopolyPatches.evaluateVignetteWithSynergies')) {
  vigModal = replaceNormalized(
    vigModal,
    'function onChoiceSelected(choiceId) {',
    `function onChoiceSelected(choiceId) {
        var decision = resolveVignetteDecision(s, choiceId, p.factionId, countryRegime);
        
        // Phase 4: Suite Synergies, Career Compendium, and Follow-Up Queue
        if (typeof CardiopolyPatches !== 'undefined') {
          var patches = CardiopolyPatches;
          var state = (typeof gameState !== 'undefined') ? gameState : {};
          var ownedTileNames = [];
          if (state && Array.isArray(state.tiles)) {
            ownedTileNames = state.tiles
              .filter(function (t) { return t.ownerId === p.id; })
              .map(function (t) { return t.name; });
          }
          var choiceType = choiceId === 'CHOICE_GDMT' ? 'GDMT' : (choiceId === 'CHOICE_INTERVENTION' ? 'INVASIVE' : 'COST_CONTAINMENT');
          if (typeof patches.evaluateVignetteWithSynergies === 'function') {
            decision = patches.evaluateVignetteWithSynergies(p, ownedTileNames, decision, choiceType, state);
          }
          if (typeof patches.recordVignetteTrialInCompendium === 'function') {
            var trialRef = (s.choices && s.choices[choiceId] && s.choices[choiceId].trialReference) || s.trialCode || s.trialReference || 'ISCHEMIA';
            var cleanTrialCode = trialRef.split(' ')[0].replace(/[^A-Za-z0-9-]/g, '') || 'ISCHEMIA';
            patches.recordVignetteTrialInCompendium(cleanTrialCode, choiceId === 'CHOICE_GDMT');
          }
        }`
  );
}
fs.writeFileSync('src/components/vignetteModal.js', vigModal, 'utf8');
console.log('✓ Updated src/components/vignetteModal.js');

// ============================================================================
// 3. UPDATE script.js (Phases 1, 2, 3, 4)
// ============================================================================
let script = fs.readFileSync('script.js', 'utf8');

// A. Sanitize default player definitions (lines 476-480 and lines 2087-2092)
script = replaceNormalized(
  script,
  '{ id: 1, name: "Fat Slob",     shortName: "Fat Slob",     possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "INTERVENTIONALIST", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 },',
  '{ id: 1, name: "Dr. Cath-A-Lot", shortName: "Dr. Cath-A-Lot", possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "INTERVENTIONALIST", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 },'
);
script = replaceNormalized(
  script,
  '{ id: 2, name: "Lazy Larry",   shortName: "Lazy Larry",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "HOSPITAL_CEO", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 },',
  '{ id: 2, name: "V.P. Margin",   shortName: "V.P. Margin",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "HOSPITAL_CEO", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 },'
);
script = replaceNormalized(
  script,
  '{ id: 3, name: "Sloppy Susan", shortName: "Sloppy Susan", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "REGULATORY_AUDITOR", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 }',
  '{ id: 3, name: "Inspector Clawback", shortName: "Inspector Clawback", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, factionId: "REGULATORY_AUDITOR", gdmtScore: 70, encounters: 0, complications: 0, rvuPoints: 0, sanctions: 0, fullDepartmentGroups: 0, departmentMargin: 0, clawbackWP: 0, inJail: false, jailTurns: 0 }'
);

// Reset definitions in resetGameToRules
script = replaceNormalized(
  script,
  '{ id: 1, name: "Fat Slob",     shortName: "Fat Slob",     possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },',
  '{ id: 1, name: "Dr. Cath-A-Lot", shortName: "Dr. Cath-A-Lot", possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },'
);
script = replaceNormalized(
  script,
  '{ id: 2, name: "Lazy Larry",   shortName: "Lazy Larry",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },',
  '{ id: 2, name: "V.P. Margin",   shortName: "V.P. Margin",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },'
);
script = replaceNormalized(
  script,
  '{ id: 3, name: "Sloppy Susan", shortName: "Sloppy Susan", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] }',
  '{ id: 3, name: "Inspector Clawback", shortName: "Inspector Clawback", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] }'
);

// Call sanitizePlayerNames in initializePlayerFactions
if (!script.includes('CardiopolyPatches.sanitizePlayerNames(players)')) {
  script = replaceNormalized(
    script,
    'function initializePlayerFactions(players) {',
    `function initializePlayerFactions(players) {
  if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.sanitizePlayerNames === "function") {
    CardiopolyPatches.sanitizePlayerNames(players);
  }`
  );
}

// B. Update updateRegimePreviewCard(countryKey) using formatRegimeRuleText
const oldPreviewFn = `function updateRegimePreviewCard(countryKey) {
  const previewCard = document.getElementById("setup-regime-preview-card");
  if (!previewCard) return;
  if (typeof CardiopolyPolicies !== "undefined" && typeof CardiopolyPolicies.getRegime === "function") {
    const reg = CardiopolyPolicies.getRegime(countryKey);
    previewCard.innerHTML = \`
      <strong>\${reg.flag} \${reg.name} (\${reg.fullName})</strong><br/>
      <em>\${reg.tagline || ""}</em><br/>
      \${reg.description || ""}<br/>
      <span style="color:#38bdf8;">Key Rule: Co-pay rate \${((reg.coPayRate || 0) * 100).toFixed(0)}%, RVU mult \${reg.rvuMultiplier}x, Rent mult \${reg.rentMultiplier}x</span>
    \`;
  }
}`;

const newPreviewFn = `function updateRegimePreviewCard(countryKey) {
  const previewCard = document.getElementById("setup-regime-preview-card");
  if (!previewCard) return;
  if (typeof CardiopolyPolicies !== "undefined" && typeof CardiopolyPolicies.getRegime === "function") {
    const reg = CardiopolyPolicies.getRegime(countryKey);
    const ruleText = (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.formatRegimeRuleText === "function")
      ? CardiopolyPatches.formatRegimeRuleText(reg)
      : \`Key Rule: Co-pay rate \${Math.round(Number(reg.coPayRate ?? 0) * 100)}%, RVU mult \${Number(reg.rvuMult ?? reg.rvuMultiplier ?? 1.0).toFixed(2)}x, Rent mult \${Number(reg.rentMult ?? reg.rentMultiplier ?? 1.0).toFixed(2)}x\${reg.specialRule ? ' | ' + reg.specialRule : ''}\`;
    previewCard.innerHTML = \`
      <strong>\${reg.flag} \${reg.name} (\${reg.fullName})</strong><br/>
      <em>\${reg.tagline || ""}</em><br/>
      \${reg.description || ""}<br/>
      <span style="color:#38bdf8;">\${ruleText}</span>
    \`;
  }
}`;

script = replaceNormalized(script, oldPreviewFn, newPreviewFn);

// C. Update updateCenterConsoleFactionRace() to use renderFactionRacePatched
const oldRaceFn = `function updateCenterConsoleFactionRace() {
  const container = document.getElementById("console-faction-bars");
  if (!container) return;

  const factionColors = {
    ACADEMIC_CLINICIAN: "fill-clinician",
    INTERVENTIONALIST: "fill-interventionalist",
    HOSPITAL_CEO: "fill-ceo",
    REGULATORY_AUDITOR: "fill-auditor"
  };

  container.innerHTML = "";
  gameState.players.forEach((p) => {
    let progressPct = 0;
    let desc = "";
    if (typeof CardiopolyFactions !== "undefined" && typeof CardiopolyFactions.getFactionProgress === "function") {
      const prog = CardiopolyFactions.getFactionProgress(p, gameState);
      progressPct = prog.progressPct;
      desc = prog.label;
    } else {
      progressPct = Math.min(100, Math.round((p.wp / 5000) * 100));
      desc = \`\${p.wp} WP\`;
    }

    const row = document.createElement("div");
    row.className = "faction-bar-row";
    const colorClass = factionColors[p.factionId] || "fill-clinician";

    row.innerHTML = \`
      <div class="faction-bar-label-row">
        <span>\${p.shortName} (\${p.factionId ? p.factionId.replace(/_/g, " ").slice(0, 10) : "CLIN"})</span>
        <span>\${desc} (\${progressPct}%)</span>
      </div>
      <div class="faction-bar-track">
        <div class="faction-bar-fill \${colorClass}" style="width: \${progressPct}%"></div>
      </div>
    \`;
    container.appendChild(row);
  });
}`;

const newRaceFn = `function updateCenterConsoleFactionRace() {
  const container = document.getElementById("console-faction-bars");
  if (!container) return;

  if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.renderFactionRacePatched === "function") {
    CardiopolyPatches.renderFactionRacePatched(container, gameState.players, gameState);
    return;
  }
}`;

script = replaceNormalized(script, oldRaceFn, newRaceFn);

// D. Options button & in-game pause / resume handling
if (!script.includes('gameState.isPaused')) {
  const oldOpenSetupModal = `function openSetupModal() {
  const modal = document.getElementById("setup-modal");
  if (modal) modal.classList.add("active");
}`;

  const newOpenSetupModal = `function openSetupModal() {
  const modal = document.getElementById("setup-modal");
  if (!modal) return;
  modal.classList.add("active");

  const isMatchActive = gameState.phase !== "RULES" && gameState.phase !== "LOADING";
  const resumeBtn = document.getElementById("setup-resume-btn");
  const quickStartBtn = document.getElementById("setup-quick-start-btn");
  const launchBtn = document.getElementById("setup-launch-match-btn");

  if (isMatchActive) {
    gameState.isPaused = true;
    clearTimeout(gameState.botTurnTimeout);
    if (gameState.activeAuction && gameState.activeAuction.intervalId) {
      clearInterval(gameState.activeAuction.intervalId);
    }
    if (resumeBtn) resumeBtn.classList.remove("hidden");
    if (quickStartBtn) quickStartBtn.classList.add("hidden");
    if (launchBtn) launchBtn.textContent = "Restart Match (Confirm)";
  } else {
    gameState.isPaused = false;
    if (resumeBtn) resumeBtn.classList.add("hidden");
    if (quickStartBtn) quickStartBtn.classList.remove("hidden");
    if (launchBtn) launchBtn.textContent = "Launch Clinical Match";
  }
}

function resumeActiveMatch() {
  gameState.isPaused = false;
  closeSetupModal();
  const curPlayer = gameState.players[gameState.currentPlayerIndex];
  if (curPlayer && curPlayer.isBot && gameState.phase === "WAIT_FOR_ROLL") {
    clearTimeout(gameState.botTurnTimeout);
    gameState.botTurnTimeout = setTimeout(() => {
      rollDiceAndMove(curPlayer);
    }, 1200);
  }
}`;

  script = replaceNormalized(script, oldOpenSetupModal, newOpenSetupModal);
}

// E. 11x11 Board Tiles Rendering & SVG Tokens & Hopping
const oldRenderThumbnailBoardStart = `  gameState.tiles.forEach((tile) => {
    const tileEl = document.createElement("div");
    tileEl.className = \`thumb-tile side-\${tile.side}\`;
    tileEl.id = \`thumb-tile-\${tile.index}\`;
    tileEl.style.gridColumn = String(tile.gridCol);
    tileEl.style.gridRow = String(tile.gridRow);

    if (tile.index === 0) {
      tileEl.classList.add("tile-go");
      tileEl.innerHTML = \`<span>GO</span><span class="go-arrow">←</span>\`;
    } else if (tile.type === "PROPERTY") {
      const colorBar = document.createElement("div");
      colorBar.className = "thumb-color-bar";
      if (tile.colorHex !== "transparent") {
        colorBar.style.background = tile.colorHex;
      } else {
        // Transparent group (ACS pipeline / Quick-Fix Service): subtle clinical hatch
        colorBar.style.background =
          "repeating-linear-gradient(45deg, rgba(15,23,42,0.18), rgba(15,23,42,0.18) 2px, transparent 2px, transparent 4px)";
      }
      tileEl.appendChild(colorBar);
    } else {
      const sym = document.createElement("span");
      sym.className = "thumb-mini-symbol";
      sym.textContent = tile.shortLabel;
      tileEl.appendChild(sym);
    }`;

const newRenderThumbnailBoardStart = `  gameState.tiles.forEach((tile) => {
    const tileEl = document.createElement("div");
    tileEl.className = \`thumb-tile board-tile tile side-\${tile.side}\`;
    tileEl.id = \`thumb-tile-\${tile.index}\`;
    tileEl.style.gridColumn = String(tile.gridCol);
    tileEl.style.gridRow = String(tile.gridRow);

    if (tile.index === 0) {
      tileEl.classList.add("tile-go");
      tileEl.innerHTML = \`<span>GO</span><span class="go-arrow">←</span>\`;
    } else if (tile.type === "PROPERTY") {
      const colorBar = document.createElement("div");
      colorBar.className = "thumb-color-bar tile-color-bar";
      if (tile.colorHex !== "transparent") {
        colorBar.style.background = tile.colorHex;
      } else {
        // Transparent group (ACS pipeline / Quick-Fix Service): subtle clinical hatch
        colorBar.style.background =
          "repeating-linear-gradient(45deg, rgba(15,23,42,0.18), rgba(15,23,42,0.18) 2px, transparent 2px, transparent 4px)";
      }
      tileEl.appendChild(colorBar);

      // Phase 2: WP Cost Badge on perimeter purchasable suites
      const costBadge = document.createElement("span");
      costBadge.className = "tile-cost-badge";
      costBadge.textContent = \`\${tile.price || tile.cost || 300} WP\`;
      tileEl.appendChild(costBadge);
    } else {
      const sym = document.createElement("span");
      sym.className = "thumb-mini-symbol";
      sym.textContent = tile.shortLabel;
      tileEl.appendChild(sym);
    }`;

script = replaceNormalized(script, oldRenderThumbnailBoardStart, newRenderThumbnailBoardStart);

// Token layer rendering with SVG tokens
const oldTokenLayer = `  gameState.players.forEach((player) => {
    const tokenEl = document.createElement("div");
    tokenEl.id = \`board-token-\${player.id}\`;
    tokenEl.className = \`board-token \${player.colorClass} \${player.id === 0 ? "token-user" : ""}\`;
    tokensLayer.appendChild(tokenEl);
  });`;

const newTokenLayer = `  gameState.players.forEach((player) => {
    const tokenEl = document.createElement("div");
    tokenEl.id = \`board-token-\${player.id}\`;
    tokenEl.className = \`board-token player-token \${player.colorClass} \${player.id === 0 ? "token-user" : ""}\`;
    
    // Phase 2: Render inline SVG medical token
    if (typeof CardiopolyPatches !== "undefined") {
      const fKey = CardiopolyPatches.resolveFactionKey(player.factionId || player.faction || player.role);
      const meta = CardiopolyPatches.FACTION_METADATA[fKey];
      if (meta && meta.tokenSvg) {
        tokenEl.innerHTML = meta.tokenSvg;
      }
    }
    tokensLayer.appendChild(tokenEl);
  });`;

script = replaceNormalized(script, oldTokenLayer, newTokenLayer);

// Ownership frames with .is-owned, --owner-color, .is-mortgaged, and upgrade pips
const oldOwnershipFrames = `function updateThumbnailOwnershipFrames() {
  gameState.tiles.forEach((tile) => {
    const tileEl = document.getElementById(\`thumb-tile-\${tile.index}\`);
    if (!tileEl) return;
    tileEl.classList.remove("owned-by-0", "owned-by-1", "owned-by-2", "owned-by-3");
    if (tile.ownerId !== null && tile.ownerId !== undefined) {
      tileEl.classList.add(\`owned-by-\${tile.ownerId}\`);
    }
    let starPipEl = tileEl.querySelector(".tile-star-pips");
    if (tile.upgradeLevel > 0) {
      if (!starPipEl) {
        starPipEl = document.createElement("span");
        starPipEl.className = "tile-star-pips";
        tileEl.appendChild(starPipEl);
      }
      starPipEl.textContent = "⭐".repeat(tile.upgradeLevel);
    } else if (starPipEl) {
      starPipEl.remove();
    }
  });
}`;

const newOwnershipFrames = `function updateThumbnailOwnershipFrames() {
  gameState.tiles.forEach((tile) => {
    const tileEl = document.getElementById(\`thumb-tile-\${tile.index}\`);
    if (!tileEl) return;
    tileEl.classList.remove("owned-by-0", "owned-by-1", "owned-by-2", "owned-by-3", "is-owned", "is-mortgaged");
    
    if (tile.ownerId !== null && tile.ownerId !== undefined) {
      tileEl.classList.add(\`owned-by-\${tile.ownerId}\`, "is-owned");
      const owner = gameState.players[tile.ownerId];
      if (owner && owner.hex) {
        tileEl.style.setProperty("--owner-color", owner.hex);
      }
    }
    if (tile.isMortgaged) {
      tileEl.classList.add("is-mortgaged");
    }

    // 1-4 .tile-upgrade-pip markers inside .tile-color-bar
    const colorBar = tileEl.querySelector(".tile-color-bar, .thumb-color-bar");
    if (colorBar) {
      colorBar.querySelectorAll(".tile-upgrade-pip").forEach((pip) => pip.remove());
      const tier = tile.upgradeTier || tile.upgradeLevel || 0;
      for (let p = 0; p < Math.min(4, tier); p++) {
        const pip = document.createElement("div");
        pip.className = "tile-upgrade-pip";
        colorBar.appendChild(pip);
      }
    }

    let starPipEl = tileEl.querySelector(".tile-star-pips");
    if (tile.upgradeLevel > 0) {
      if (!starPipEl) {
        starPipEl = document.createElement("span");
        starPipEl.className = "tile-star-pips";
        tileEl.appendChild(starPipEl);
      }
      starPipEl.textContent = "⭐".repeat(tile.upgradeLevel);
    } else if (starPipEl) {
      starPipEl.remove();
    }
  });
}`;

script = replaceNormalized(script, oldOwnershipFrames, newOwnershipFrames);

// Token hopping animation in sequential move loop
const oldMoveStep = `    player.position = (player.position + 1) % 40;

    // Check if passing or landing on GO (Tile 0)`;

const newMoveStep = `    player.position = (player.position + 1) % 40;

    // Phase 2: Animate step-by-step tile hopping (.is-hopping at 90ms)
    const movingTokenEl = document.getElementById(\`board-token-\${player.id}\`);
    if (movingTokenEl) {
      movingTokenEl.classList.add("is-hopping");
      setTimeout(() => movingTokenEl.classList.remove("is-hopping"), 90);
    }

    // Check if passing or landing on GO (Tile 0)`;

script = replaceNormalized(script, oldMoveStep, newMoveStep);

// F. Hook updateTelemetryFromActivePlayer and floating resource deltas in applyClinicalDecisionToPlayer
const oldApplyClinical = `  // 1. Update basic physiological and financial metrics
  if (typeof decision.wastePoints === "number") {
    player.wp = Math.max(0, player.wp + decision.wastePoints);
  }
  if (typeof decision.sbpDelta === "number") {
    player.sbp = Math.max(90, Math.min(240, player.sbp + decision.sbpDelta));
  }`;

const newApplyClinical = `  // 1. Update basic physiological and financial metrics
  if (typeof decision.wastePoints === "number") {
    player.wp = Math.max(0, player.wp + decision.wastePoints);
  }
  if (typeof decision.sbpDelta === "number") {
    player.sbp = Math.max(90, Math.min(240, player.sbp + decision.sbpDelta));
  }
  if (typeof decision.bmiDelta === "number") {
    player.bmi = roundOneDecimal(Math.max(18, Math.min(75, player.bmi + decision.bmiDelta)));
  }

  // Phase 4 Rule Hook: UK GDMT Bonus
  if ((gameState.currentRegime === "UNITED_KINGDOM" || gameState.currentRegime === "uk") && decision.choiceId === "CHOICE_GDMT") {
    player.wp += 100;
  }

  // Phase 3: Dynamic Vital-Linked Telemetry and Floating Resource Deltas
  if (typeof CardiopolyPatches !== "undefined") {
    if (typeof CardiopolyPatches.updateTelemetryFromActivePlayer === "function") {
      CardiopolyPatches.updateTelemetryFromActivePlayer(player);
    }
    const cardSel = \`#player-card-\${player.id}\`;
    const tileSel = \`#thumb-tile-\${player.position}\`;
    if (decision.wastePoints) {
      const sign = decision.wastePoints >= 0 ? "+" : "";
      const tone = decision.wastePoints >= 0 ? "positive" : "negative";
      CardiopolyPatches.spawnFloatingResourceDelta(cardSel, \`\${sign}\${decision.wastePoints} WP\`, tone);
      CardiopolyPatches.spawnFloatingResourceDelta(tileSel, \`\${sign}\${decision.wastePoints} WP\`, tone);
    }
    if (decision.gdmtPoints) {
      CardiopolyPatches.spawnFloatingResourceDelta(cardSel, \`+\${decision.gdmtPoints} GDMT\`, "positive");
    }
    if (decision.rvuPoints) {
      CardiopolyPatches.spawnFloatingResourceDelta(cardSel, \`+\${decision.rvuPoints} RVU\`, "positive");
    }
    if (decision.sbpDelta) {
      const sign = decision.sbpDelta >= 0 ? "+" : "";
      const tone = decision.sbpDelta > 0 ? "negative" : "positive";
      CardiopolyPatches.spawnFloatingResourceDelta(cardSel, \`\${sign}\${decision.sbpDelta} SBP\`, tone);
    }
  }`;

script = replaceNormalized(script, oldApplyClinical, newApplyClinical);

// G. Hook updateTelemetryFromActivePlayer in updateTelemetryVitals
if (!script.includes('CardiopolyPatches.updateTelemetryFromActivePlayer(player);')) {
  script = replaceNormalized(
    script,
    'window.telemetryController.update({ sbp: sbp, dbp: dbp });',
    `window.telemetryController.update({ sbp: sbp, dbp: dbp });
  if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.updateTelemetryFromActivePlayer === "function") {
    CardiopolyPatches.updateTelemetryFromActivePlayer(player);
  }`
  );
}

// H. Process Longitudinal Patient Follow-Up Queue at Turn Transition
const oldAdvanceTurn = `  // Advance turn
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.phase = "WAIT_FOR_ROLL";
  refreshAllViews();`;

const newAdvanceTurn = `  // Advance turn
  gameState.turnNumber = (gameState.turnNumber || 1) + 1;
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.phase = "WAIT_FOR_ROLL";

  // Phase 4: Process Longitudinal Patient Follow-Up Queue (turnNumber >= triggerTurn)
  if (Array.isArray(gameState.followUpQueue) && gameState.followUpQueue.length > 0) {
    const nextP = gameState.players[gameState.currentPlayerIndex];
    const followUpIdx = gameState.followUpQueue.findIndex(
      (item) => item.playerId === nextP.id && gameState.turnNumber >= item.triggerTurn
    );
    if (followUpIdx !== -1) {
      const item = gameState.followUpQueue.splice(followUpIdx, 1)[0];
      const hasShield = gameState.tiles.some(
        (t) => t.ownerId === nextP.id && (t.name === "Telemetry bed" || t.name === "CPET lab")
      );
      const actualWpPenalty = hasShield ? Math.round(item.wpPenalty * 0.5) : item.wpPenalty;
      nextP.sbp = Math.min(240, nextP.sbp + item.sbpPenalty);
      nextP.wp = Math.max(0, nextP.wp - actualWpPenalty);
      
      const followUpMsg = \`⚠️ FOLLOW-UP EVENT: \${item.patientName} - \${item.reason} (+8 SBP, -\${actualWpPenalty} WP\${hasShield ? ' [50% Shielded]' : ''})\`;
      setBoardTicker(followUpMsg);
      appendCenterConsoleActionLog(followUpMsg);

      if (typeof CardiopolyPatches !== "undefined") {
        CardiopolyPatches.spawnFloatingResourceDelta(\`#player-card-\${nextP.id}\`, \`-\${actualWpPenalty} WP\`, "negative");
        CardiopolyPatches.spawnFloatingResourceDelta(\`#player-card-\${nextP.id}\`, \`+8 SBP\`, "negative");
        CardiopolyPatches.updateTelemetryFromActivePlayer(nextP);
      }
    }
  }

  refreshAllViews();`;

script = replaceNormalized(script, oldAdvanceTurn, newAdvanceTurn);

// I. Sweden SWEDEHEART Quality Dividend at GO
const oldGoPass = `      player.wp += PASS_GO_WP_ADDED;
      player.sbp += PASS_GO_SBP_ADDED;
      player.bmi = roundOneDecimal(player.bmi + PASS_GO_BMI_ADDED);
      setBoardTicker(\`\${player.shortName} passed GO (+\${PASS_GO_WP_ADDED} WP routine admission labs)!\`);`;

const newGoPass = `      player.wp += PASS_GO_WP_ADDED;
      player.sbp += PASS_GO_SBP_ADDED;
      player.bmi = roundOneDecimal(player.bmi + PASS_GO_BMI_ADDED);

      // Phase 4: Sweden (SWEDEHEART) Registry Quality Dividend (+250 WP when GDMT >= 80%)
      const isSweden = (gameState.currentRegime === "SWEDEN" || gameState.currentRegime === "sweden");
      const hasHighGdmt = (player.gdmtAdherence >= 80 || player.gdmtScore >= 80);
      if (isSweden && hasHighGdmt) {
        player.wp += 250;
        if (typeof CardiopolyPatches !== "undefined") {
          CardiopolyPatches.spawnFloatingResourceDelta(\`#player-card-\${player.id}\`, "+250 WP (SWEDEHEART Dividend)", "positive");
        }
        setBoardTicker(\`\${player.shortName} passed GO: Collected +\${PASS_GO_WP_ADDED} WP + 250 WP SWEDEHEART Quality Bonus!\`);
      } else {
        setBoardTicker(\`\${player.shortName} passed GO (+\${PASS_GO_WP_ADDED} WP routine admission labs)!\`);
      }`;

script = replaceNormalized(script, oldGoPass, newGoPass);

// J. Setup modal action listeners for Resume Match
const oldLaunchListener = `  const launchBtn = document.getElementById("setup-launch-match-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", () => {
      playAudio("CASH");
      closeSetupModal();
      if (gameState.phase === "RULES" || gameState.phase === "LOADING") {
        gameState.phase = "WAIT_FOR_ROLL";
        refreshAllViews();
      }
    });
  }`;

const newLaunchListener = `  const resumeBtn = document.getElementById("setup-resume-btn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      playAudio("CASH");
      resumeActiveMatch();
    });
  }

  const launchBtn = document.getElementById("setup-launch-match-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", () => {
      playAudio("CASH");
      const isMatchActive = gameState.phase !== "RULES" && gameState.phase !== "LOADING";
      closeSetupModal();
      if (isMatchActive) {
        resetGameToRules();
        gameState.phase = "WAIT_FOR_ROLL";
        refreshAllViews();
      } else if (gameState.phase === "RULES" || gameState.phase === "LOADING") {
        gameState.phase = "WAIT_FOR_ROLL";
        refreshAllViews();
      }
    });
  }`;

script = replaceNormalized(script, oldLaunchListener, newLaunchListener);

fs.writeFileSync('script.js', script, 'utf8');
console.log('✓ Successfully patched script.js across Phases 1-4');

// ============================================================================
// 4. ADD RESUME BUTTON TO index.html SETUP MODAL FOOTER
// ============================================================================
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('id="setup-resume-btn"')) {
  indexHtml = replaceNormalized(
    indexHtml,
    '<button id="setup-quick-start-btn" class="btn btn-secondary btn-large" type="button">Quick Start (Defaults)</button>',
    '<button id="setup-resume-btn" class="btn btn-secondary btn-large hidden" type="button">▶️ Resume Match</button>\n        <button id="setup-quick-start-btn" class="btn btn-secondary btn-large" type="button">Quick Start (Defaults)</button>'
  );
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('✓ Added #setup-resume-btn to index.html');
}

console.log('>>> All patch applications complete!');
