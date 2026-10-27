const fs = require('fs');
const path = require('path');

// 1. UPDATE patches/cardiopoly_script_patches.js
const patchesPath = path.resolve(__dirname, '../patches/cardiopoly_script_patches.js');
let patches = fs.readFileSync(patchesPath, 'utf8');

// Replace shouldTriggerEmergentChallenge
const oldTriggerFn = `  shouldTriggerEmergentChallenge(gameState, curPlayer, roll = Math.random()) {
    if (!gameState || gameState.isEmergencyFrozen) return false;
    // Condition A: Severe physiological distress
    if (curPlayer && (Number(curPlayer.sbp ?? 120) >= 195 || Number(curPlayer.complications ?? 0) >= 2)) {
      return true;
    }
    // Condition B: Emergent hospital cardiac arrest (after turn 1)
    if (Number(gameState.turnCount ?? 0) >= 2 && roll < 0.10) {
      return true;
    }
    return false;
  },`;

const newTriggerFn = `  shouldTriggerEmergentChallenge(gameState, curPlayer, roll = Math.random()) {
    if (!gameState || gameState.isEmergencyFrozen) return false;
    const turn = Number(gameState.turnNumber ?? gameState.turnCount ?? gameState.turnCounter ?? 1);

    // Condition A: Severe physiological distress (mild/moderate hypertension or complications)
    if (curPlayer && (Number(curPlayer.sbp ?? 120) >= 160 || Number(curPlayer.complications ?? 0) >= 1)) {
      return true;
    }
    // Condition B: Guaranteed early-game introduction on Turn 2 or Turn 3 (first match experience)
    if ((turn === 2 || turn === 3) && !gameState.hasExperiencedCodeBlue) {
      gameState.hasExperiencedCodeBlue = true;
      return true;
    }
    // Condition C: High dynamic in-game emergence (22% per turn after turn 1)
    if (turn >= 2 && roll < 0.22) {
      return true;
    }
    return false;
  },`;

if (patches.includes(oldTriggerFn)) {
  patches = patches.replace(oldTriggerFn, newTriggerFn);
  console.log('✓ Updated shouldTriggerEmergentChallenge in cardiopoly_script_patches.js');
} else {
  // Regex replacement
  patches = patches.replace(/shouldTriggerEmergentChallenge\(gameState, curPlayer, roll = Math\.random\(\)\)\s*\{[\s\S]*?return false;\s*\},/, newTriggerFn);
  console.log('✓ Regex replaced shouldTriggerEmergentChallenge');
}

// Ensure openChallengeModal adds active, style.display = 'flex', zIndex = 10050
patches = patches.replace(
  /let modal = document\.getElementById\('code-blue-qte-modal'\);\s*if \(!modal\) \{\s*modal = document\.createElement\('div'\);\s*modal\.id = 'code-blue-qte-modal';\s*modal\.className = 'screen-overlay';\s*document\.body\.appendChild\(modal\);\s*\}/,
  `let modal = document.getElementById('code-blue-qte-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'code-blue-qte-modal';
      modal.className = 'screen-overlay active';
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '10050';
    modal.scrollTop = 0;`
);

// Ensure modal close cleans up active and style.display
patches = patches.replace(
  /modal\.classList\.add\('hidden'\);/,
  `modal.classList.remove('active');\n          modal.classList.add('hidden');\n          modal.style.display = 'none';`
);

fs.writeFileSync(patchesPath, patches, 'utf8');
console.log('✓ Successfully wrote patches/cardiopoly_script_patches.js');

// 2. UPDATE script.js
const scriptPath = path.resolve(__dirname, '../script.js');
let script = fs.readFileSync(scriptPath, 'utf8');

// Update finishPlayerTurn so human player always gets the interactive modal
const oldFinishTurnBlock = `    if (curPlayer.isBot) {
      // For bots, run the multi-agent race simulation directly
      if (typeof CardiopolyPatches?.ResuscitationEngine === 'object') {
        const diff = Math.min(5, (gameState.codeBlueDifficulty || 0) + 1);
        gameState.codeBlueDifficulty = diff;
        const bots = (gameState.players || []).filter(p => p.isBot);
        const botRates = CardiopolyPatches.ResuscitationEngine.computeBotRates(bots, diff);
        const fastestBot = bots.sort((a, b) => (botRates[a.id]?.finishTimeSec || 99) - (botRates[b.id]?.finishTimeSec || 99))[0];
        
        const outcome = CardiopolyPatches.ResuscitationEngine.resolveOutcome({
          winner: 'BOT',
          winnerId: fastestBot ? fastestBot.id : curPlayer.id,
          player: curPlayer,
          gameState,
          elapsedSec: botRates[fastestBot?.id]?.finishTimeSec || 4.2,
          difficulty: diff
        });

        if (typeof CardiopolyToasts !== "undefined" && CardiopolyToasts.showToast) {
          CardiopolyToasts.showToast({
            title: "CODE BLUE RESUSCITATION",
            message: outcome.message,
            theme: "danger",
            durationMs: 4000
          });
        }
        appendCenterConsoleActionLog(outcome.message);
      }
    } else {
      // For human player, launch the real-time interactive QTE modal!
      await new Promise((resolve) => {
        if (typeof CardiopolyPatches?.ResuscitationEngine?.openChallengeModal === 'function') {
          CardiopolyPatches.ResuscitationEngine.openChallengeModal(curPlayer, gameState, (res) => {
            appendCenterConsoleActionLog(res.message);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }`;

const newFinishTurnBlock = `    // Hospital-wide CCU cardiac arrest: Alert all physicians, human player always competes in real-time QTE!
    const humanPlayer = (gameState.players || []).find(p => !p.isBot) || curPlayer;
    await new Promise((resolve) => {
      if (typeof CardiopolyPatches?.ResuscitationEngine?.openChallengeModal === 'function') {
        CardiopolyPatches.ResuscitationEngine.openChallengeModal(humanPlayer, gameState, (res) => {
          appendCenterConsoleActionLog(res.message);
          resolve();
        });
      } else {
        resolve();
      }
    });`;

if (script.includes(oldFinishTurnBlock)) {
  script = script.replace(oldFinishTurnBlock, newFinishTurnBlock);
  console.log('✓ Updated finishPlayerTurn in script.js to guarantee human player participation');
} else {
  // Regex replacement
  script = script.replace(/if\s*\(curPlayer\.isBot\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?resolve\(\);\s*\}\s*\}\);\s*\}/, newFinishTurnBlock);
  console.log('✓ Regex replaced finishPlayerTurn block');
}

// Wire in-game drill button in wireEventListeners
if (!script.includes('in-game-code-blue-drill-btn')) {
  const wirePoint = 'function wireEventListeners() {';
  const drillWire = `function wireEventListeners() {
  const ccuDrillBtn = document.getElementById("in-game-code-blue-drill-btn");
  if (ccuDrillBtn) {
    ccuDrillBtn.addEventListener("click", () => {
      if (typeof CardiopolyPatches?.ResuscitationEngine?.openChallengeModal === "function") {
        const humanP = (gameState.players || []).find((p) => !p.isBot) || gameState.players[0];
        CardiopolyPatches.ResuscitationEngine.openChallengeModal(humanP, gameState, (res) => {
          appendCenterConsoleActionLog(res.message);
        });
      }
    });
  }`;
  script = script.replace(wirePoint, drillWire);
  console.log('✓ Wired in-game-code-blue-drill-btn in wireEventListeners');
}

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('✓ Successfully wrote script.js');

// 3. UPDATE index.html with in-game drill button inside console-telemetry-view
const htmlPath = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('in-game-code-blue-drill-btn')) {
  const targetTelemetry = '<canvas id="console-ecg-canvas" width="230" height="56" class="console-ecg-canvas"></canvas>';
  const replacementTelemetry = `${targetTelemetry}
              <button id="in-game-code-blue-drill-btn" class="btn btn-danger" style="margin-top:6px; width:100%; font-size:0.68rem; padding:4px 8px; border-radius:4px; font-weight:700;" type="button">⚡ Emergency Code Blue QTE Drill</button>`;
  html = html.replace(targetTelemetry, replacementTelemetry);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✓ Added in-game-code-blue-drill-btn to index.html telemetry view');
}
