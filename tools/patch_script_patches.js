const fs = require('fs');

let raw = fs.readFileSync('patches/cardiopoly_script_patches.js', 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

const target = `window.CardiopolyPatches = {
  CARDIOPOLY_REGIMES_PATCH,
  formatRegimeRuleText,
  FACTION_METADATA,
  sanitizePlayerNames,
  computePlayerFactionProgress,
  renderFactionRacePatched,
  updateTelemetryFromActivePlayer,
  spawnFloatingResourceDelta,
  evaluateVignetteWithSynergies,
  loadCareerCompendium,
  recordVignetteTrialInCompendium
};`;

const replacement = `window.CardiopolyPatches = {
  CARDIOPOLY_REGIMES_PATCH,
  formatRegimeRuleText,
  FACTION_METADATA,
  resolveFactionKey,
  sanitizePlayerNames,
  computePlayerFactionProgress,
  renderFactionRacePatched,
  updateTelemetryFromActivePlayer,
  spawnFloatingResourceDelta,
  evaluateVignetteWithSynergies,
  loadCareerCompendium,
  recordVignetteTrialInCompendium
};`;

if (!code.includes(target)) {
  console.error('Target not found in patches/cardiopoly_script_patches.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync('patches/cardiopoly_script_patches.js', isCrlf ? code.replace(/\n/g, '\r\n') : code, 'utf8');
console.log('Successfully added resolveFactionKey to CardiopolyPatches exports');
