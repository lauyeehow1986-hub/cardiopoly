const fs = require('fs');
const path = require('path');

// 1. Update src/engine/factions.js
const factionsPath = path.join(__dirname, '..', 'src', 'engine', 'factions.js');
let factionsJs = fs.readFileSync(factionsPath, 'utf8').replace(/\r\n/g, '\n');

const oldFactionsReturn = `    return {
      factionId: player.factionId,
      isWin: isWin,
      percent: percent,
      percentComplete: percent,
      summary: summary
    };`;

const newFactionsReturn = `    return {
      factionId: player.factionId,
      isWin: isWin,
      percent: percent,
      percentComplete: percent,
      progressPct: percent,
      label: isWin ? 'Victory Target Achieved' : (percent + '% Target Progress'),
      summary: summary
    };`;

if (!factionsJs.includes(oldFactionsReturn)) {
  console.error("Could not find oldFactionsReturn in factions.js");
  process.exit(1);
}
factionsJs = factionsJs.replace(oldFactionsReturn, newFactionsReturn);
fs.writeFileSync(factionsPath, factionsJs.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Updated src/engine/factions.js with progressPct and label");

// 2. Update script.js
const scriptPath = path.join(__dirname, '..', 'script.js');
let scriptJs = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

const oldScriptProgress = `    let progressText = "";
    if (typeof CardiopolyFactions !== "undefined" && typeof CardiopolyFactions.getFactionProgress === "function") {
      const prog = CardiopolyFactions.getFactionProgress(player, gameState);
      progressText = \`\${prog.label} (\${prog.progressPct}%)\`;
    }`;

const newScriptProgress = `    let progressText = "0% Target Progress";
    if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.computePlayerFactionProgress === "function") {
      const p = CardiopolyPatches.computePlayerFactionProgress(player, gameState);
      progressText = \`\${p.pct}% Target Progress\`;
    } else if (typeof CardiopolyFactions !== "undefined" && typeof CardiopolyFactions.getFactionProgress === "function") {
      const prog = CardiopolyFactions.getFactionProgress(player, gameState);
      const pct = prog.progressPct ?? prog.percentComplete ?? prog.percent ?? 0;
      progressText = prog.label || \`\${pct}% Target Progress\`;
    }`;

if (!scriptJs.includes(oldScriptProgress)) {
  console.error("Could not find oldScriptProgress in script.js");
  process.exit(1);
}

scriptJs = scriptJs.replace(oldScriptProgress, newScriptProgress);
fs.writeFileSync(scriptPath, scriptJs.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Updated script.js with robust non-undefined faction progress formatting");
