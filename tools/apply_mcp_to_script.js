const fs = require('fs');

let rawCode = fs.readFileSync('script.js', 'utf8');
const isCrlf = rawCode.includes('\r\n');
let code = rawCode.replace(/\r\n/g, '\n');

function replaceNormalized(source, target, replacement, label) {
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  if (!source.includes(normTarget)) {
    console.error(`Target not found: ${label}`);
    process.exit(1);
  }
  return source.replace(normTarget, normReplacement);
}

// 1. initGame: load MCP feed & advance turn 1
const t1 = `  renderThumbnailBoard();
  refreshAllViews();`;
const r1 = `  // Load MCP Live World Feed & initialize Macro Shock Engine
  if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
    try {
      await CardiopolyMcpBridge.macroShockEngine.loadMcpFeed("data/liveWorldFeed.json");
      CardiopolyMcpBridge.macroShockEngine.advanceTurn(gameState.turnNumber || 1);
    } catch (_) {}
  }

  renderThumbnailBoard();
  refreshAllViews();`;
code = replaceNormalized(code, t1, r1, "1. initGame");

// 2. finishPlayerTurn: Code Blue Cut-In Overlay
const t2 = `    const codeBlue = CardiopolyFactions.checkCodeBlueHospitalization(curPlayer, gameState.gameMode);
    if (codeBlue.triggered) {
      playAudio("DEFIB");
      playAudio("ALARM");`;
const r2 = `    const codeBlue = CardiopolyFactions.checkCodeBlueHospitalization(curPlayer, gameState.gameMode);
    if (codeBlue.triggered) {
      if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
        CardiopolyMcpBridge.cutInOverlay.playCutIn({
          id: 'code_blue',
          title: 'CODE BLUE HOSPITALIZATION',
          subtitle: \`\${curPlayer.name} admitted to CCU (SBP: \${curPlayer.sbp} mmHg)\`,
          accentColor: '#ef4444'
        });
      }
      playAudio("DEFIB");
      playAudio("ALARM");`;
code = replaceNormalized(code, t2, r2, "2. Code Blue");

// 3. finishPlayerTurn: advance macro shocks every 4 turns
const t3 = `  // Advance turn
  gameState.turnNumber = (gameState.turnNumber || 1) + 1;
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.phase = "WAIT_FOR_ROLL";`;
const r3 = `  // Advance turn
  gameState.turnNumber = (gameState.turnNumber || 1) + 1;
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.phase = "WAIT_FOR_ROLL";

  // MCP Runtime Bridge: Advance Macro Shocks every 4 turns
  if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine) {
    const shock = CardiopolyMcpBridge.macroShockEngine.advanceTurn(gameState.turnNumber);
    if (gameState.turnNumber % 4 === 0 && shock && CardiopolyMcpBridge.cutInOverlay) {
      CardiopolyMcpBridge.cutInOverlay.playCutIn({
        id: 'macro_shock',
        title: (shock.headline || 'MACRO POLICY SHIFT').toUpperCase(),
        subtitle: \`\${shock.category}: \${shock.description}\`,
        accentColor: '#38bdf8'
      });
    }
  }`;
code = replaceNormalized(code, t3, r3, "3. Macro Shock Advance");

// 4. applyClinicalDecisionToPlayer: apply active shock modifiers & cut-in on cath stent
const t4 = `function applyClinicalDecisionToPlayer(player, decision, scenario) {
  if (!player || !decision) return;`;
const r4 = `function applyClinicalDecisionToPlayer(player, decision, scenario) {
  if (!player || !decision) return;

  // MCP Macro Shock Modifiers
  const activeShock = (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.macroShockEngine)
    ? CardiopolyMcpBridge.macroShockEngine.activeShock
    : null;

  if (activeShock) {
    if (decision.choiceId === "CHOICE_INTERVENTION" && activeShock.cathSurchargeWp) {
      player.wp = Math.max(0, player.wp - activeShock.cathSurchargeWp);
    }
    if (decision.choiceId === "CHOICE_GDMT" && activeShock.gdmtBonusPoints) {
      decision.gdmtPoints = (decision.gdmtPoints || 3) + activeShock.gdmtBonusPoints;
    }
    if (activeShock.sbpStressDelta) {
      player.sbp = Math.max(90, Math.min(240, player.sbp + activeShock.sbpStressDelta));
    }
  }

  // MCP Video Cut-In Trigger on High-Risk Cath / Stenting
  if (decision.choiceId === "CHOICE_INTERVENTION" && typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
    CardiopolyMcpBridge.cutInOverlay.playCutIn({
      id: 'cath_lab',
      title: 'HIGH-RISK CATH / STENT DEPLOYED',
      subtitle: \`\${player.name} deployed DES in \${(scenario && scenario.department) || 'Cath Lab'} (+\${decision.rvuPoints || 1500} RVU)\`,
      accentColor: '#38bdf8'
    });
  }`;
code = replaceNormalized(code, t4, r4, "4. Decision Modifiers");

// 5. assignPropertyToPlayer: cut-in on completed monopoly
const t5 = `    const completedGroup = groupTiles.length > 0 && groupTiles.every((t) => t.ownerId === player.id);
    recordFactionAction(player, "DEPARTMENT_ACQUIRED", {
      margin: Math.round(wpCost * 1.5),
      fullGroup: completedGroup
    });
  }`;
const r5 = `    const completedGroup = groupTiles.length > 0 && groupTiles.every((t) => t.ownerId === player.id);
    recordFactionAction(player, "DEPARTMENT_ACQUIRED", {
      margin: Math.round(wpCost * 1.5),
      fullGroup: completedGroup
    });
    if (completedGroup && typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
      CardiopolyMcpBridge.cutInOverlay.playCutIn({
        id: 'monopoly_complete',
        title: 'DEPARTMENT MONOPOLY FORMED',
        subtitle: \`\${player.name} consolidated all suites in \${tile.groupName}!\`,
        accentColor: '#10b981'
      });
    }
  }`;
code = replaceNormalized(code, t5, r5, "5. Monopoly Cut-In");

const finalCode = isCrlf ? code.replace(/\n/g, '\r\n') : code;
fs.writeFileSync('script.js', finalCode, 'utf8');
console.log('Successfully applied all 5 MCP bridge integrations to script.js');
