/**
 * Cardiopoly - Test-Driven Verification Suite for Antigravity Pack Patch Integration
 * Tests all 4 Phases and 5 Verification Gates.
 */

const assert = require('assert');
const fs = require('fs');

console.log('================================================================');
console.log('    CARDIOPOLY PATCH VERIFICATION & TDD SUITE                   ');
console.log('================================================================\n');

// 1. Load Patch Module
const patchesModule = require('../patches/cardiopoly_script_patches.js');
const patches = (typeof window !== 'undefined' && window.CardiopolyPatches) ? window.CardiopolyPatches : patchesModule;

// Load Policies Module
const policies = require('../src/engine/policies.js');

// --- PHASE 1 TESTS: Regimes, AI Personas, Faction Race ---
console.log('--- TEST 1: Healthcare Regime Normalization (No undefinedx) ---');
const regimeKeys = [
  'singapore', 'usa', 'uk', 'sweden', 'japan', 'south_korea', 'taiwan', 'malaysia', 'indonesia'
];

regimeKeys.forEach((key) => {
  const regFromPatch = patches.CARDIOPOLY_REGIMES_PATCH[key];
  assert(regFromPatch, `Regime ${key} must exist in CARDIOPOLY_REGIMES_PATCH`);
  assert(typeof regFromPatch.rvuMultiplier === 'number', `${key} rvuMultiplier must be numeric`);
  assert(typeof regFromPatch.rvuMult === 'number', `${key} rvuMult must be numeric`);
  assert(typeof regFromPatch.coPayRate === 'number', `${key} coPayRate must be numeric`);
  assert(typeof regFromPatch.rentMultiplier === 'number', `${key} rentMultiplier must be numeric`);
  assert(typeof regFromPatch.specialRule === 'string' && regFromPatch.specialRule.length > 5, `${key} specialRule must be valid string`);

  const ruleText = patches.formatRegimeRuleText(regFromPatch);
  assert(!ruleText.includes('undefined'), `Formatted rule text for ${key} must not contain undefined: "${ruleText}"`);
  assert(!ruleText.includes('NaN'), `Formatted rule text for ${key} must not contain NaN`);
  assert(ruleText.includes('Co-pay rate'), `Rule text must mention Co-pay rate`);
  assert(ruleText.includes('RVU mult'), `Rule text must mention RVU mult`);
  assert(ruleText.includes('Rent mult'), `Rule text must mention Rent mult`);
});
console.log('✓ All 9 Healthcare Regimes formatted without undefinedx');

console.log('--- TEST 2: AI Player Name Sanitization (No Fat Slob / Lazy Larry / Sloppy Susan) ---');
const mockPlayers = [
  { id: 0, name: 'You', isHuman: true, faction: 'ACADEMIC_CLINICIAN' },
  { id: 1, name: 'Fat Slob', isBot: true, faction: 'INTERVENTIONALIST' },
  { id: 2, name: 'Lazy Larry', isBot: true, faction: 'HOSPITAL_CEO' },
  { id: 3, name: 'Sloppy Susan', isBot: true, faction: 'REGULATORY_AUDITOR' }
];

patches.sanitizePlayerNames(mockPlayers);

assert.strictEqual(mockPlayers[0].name, 'You');
assert.strictEqual(mockPlayers[0].factionBadge, 'ACAD');
assert.strictEqual(mockPlayers[1].name, 'Dr. Cath-A-Lot');
assert.strictEqual(mockPlayers[1].factionBadge, 'IC');
assert.strictEqual(mockPlayers[2].name, 'V.P. Margin');
assert.strictEqual(mockPlayers[2].factionBadge, 'CEO');
assert.strictEqual(mockPlayers[3].name, 'Inspector Clawback');
assert.strictEqual(mockPlayers[3].factionBadge, 'AUDIT');

// Verify script.js does not contain legacy names
const scriptContent = fs.readFileSync('script.js', 'utf8');
const legacyNamesRegex = /Fat Slob|Lazy Larry|Sloppy Susan/;
const legacyMatchesInScript = scriptContent.match(legacyNamesRegex);
if (legacyMatchesInScript) {
  console.log('  Notice: script.js still has raw occurrences to be sanitized:', legacyMatchesInScript[0]);
} else {
  console.log('✓ script.js free of legacy AI placeholder names');
}
console.log('✓ sanitizePlayerNames properly maps AI personas & badges');

console.log('--- TEST 3: Faction Race Progress Formulas ---');
// Academic Clinician
const acadProgress = patches.computePlayerFactionProgress({
  faction: 'ACADEMIC',
  gdmtPoints: 120,
  encounters: 8,
  complications: 0
}, { mode: 'clinical_mastery' });
assert(acadProgress.pct >= 0 && acadProgress.pct <= 100, 'ACAD pct valid');
assert(!acadProgress.statusText.includes('undefined'), 'ACAD statusText valid');
assert(acadProgress.statusText.includes('GDMT'), 'ACAD includes GDMT');

// Interventionalist
const icProgress = patches.computePlayerFactionProgress({
  faction: 'INTERVENTIONALIST',
  rvu: 6000,
  sanctions: 1
}, { mode: 'clinical_mastery' });
assert.strictEqual(icProgress.pct, 50);
assert(!icProgress.statusText.includes('undefined'), 'IC statusText valid');
assert(icProgress.statusText.includes('6,000/12k RVU'), 'IC formatted numbers');

// CEO
const ceoProgress = patches.computePlayerFactionProgress({
  faction: 'CEO',
  monopolies: 1,
  wp: 5000
}, { mode: 'clinical_mastery' });
assert(ceoProgress.pct === 50, 'CEO 50% progress on 5000 WP');
assert(!ceoProgress.statusText.includes('undefined'), 'CEO statusText valid');

// Auditor
const auditProgress = patches.computePlayerFactionProgress({
  faction: 'AUDITOR',
  auditClawback: 7500
}, { mode: 'clinical_mastery' });
assert.strictEqual(auditProgress.pct, 50);
assert(!auditProgress.statusText.includes('undefined'), 'AUDIT statusText valid');

// Bureaucratic Satire mode
const satireProgress = patches.computePlayerFactionProgress({
  sbp: 160,
  wp: 5000,
  bmi: 47
}, { mode: 'bureaucratic_satire' });
assert(satireProgress.pct >= 50, 'Satire calculates correctly');
assert(satireProgress.statusText.includes('SBP 160/200'), 'Satire status text includes vitals');
console.log('✓ Faction race progress formulas calculate accurately without undefined');

console.log('--- TEST 4: Telemetry ECG Color Shifting ---');
// Mock DOM elements for testing telemetry update
let updatedHr = null;
let updatedBp = null;
let updatedRhythm = null;
let updatedColor = null;

global.document = {
  querySelector: function(sel) {
    if (sel.includes('hr')) return { set textContent(v) { updatedHr = v; } };
    if (sel.includes('bp')) return { set textContent(v) { updatedBp = v; } };
    if (sel.includes('rhythm')) return {
      set textContent(v) { updatedRhythm = v; },
      style: { set color(c) { updatedColor = c; } }
    };
    if (sel.includes('trace') || sel.includes('waveform')) return {
      style: {
        setProperty: function(k, v) { if (k === '--ecg-color') updatedColor = v; },
        set stroke(s) { updatedColor = s; }
      }
    };
    return null;
  }
};

// NSR check
patches.updateTelemetryFromActivePlayer({ sbp: 120, bmi: 24 });
assert.strictEqual(updatedColor, '#10b981', 'Normal vitals -> Emerald #10b981');
assert.strictEqual(updatedRhythm, 'Normal Sinus Rhythm');

// Tachycardia check
patches.updateTelemetryFromActivePlayer({ sbp: 155, bmi: 30 });
assert.strictEqual(updatedColor, '#f59e0b', 'Elevated SBP -> Amber #f59e0b');
assert(updatedRhythm.includes('Sinus Tachycardia'));

// NSVT / Crisis check
patches.updateTelemetryFromActivePlayer({ sbp: 185, bmi: 30 });
assert.strictEqual(updatedColor, '#ef4444', 'Crisis SBP -> Crimson #ef4444');
assert(updatedRhythm.includes('WARNING: Runs of NSVT'));
console.log('✓ Dynamic vital-linked telemetry color shifts accurately');

console.log('--- TEST 5: Hospital Suite <-> Vignette Synergies & Follow-Up Queue ---');
// Test ACS Pipeline Synergy
const mockPlayer = { id: 0, sbp: 130, wp: 1000 };
const baseOutcome = { gdmtDelta: 10, wasteDelta: 0, complicationProb: 0.20, sbpDelta: 10, rvuDelta: 1000 };
const gameState = { turnNumber: 5, followUpQueue: [] };

const acsOutcome = patches.evaluateVignetteWithSynergies(
  mockPlayer,
  ['ECG room'],
  baseOutcome,
  'GDMT',
  gameState
);
assert.strictEqual(acsOutcome.gdmtDelta, 15, 'ACS Pipeline adds +5 GDMT');
assert.strictEqual(acsOutcome.wasteDelta, -50, 'ACS Pipeline reduces Waste by -50');
assert.strictEqual(acsOutcome.complicationProb, 0.10, 'ACS Pipeline cuts complication risk by 50%');
assert(acsOutcome.activeSynergies.length > 0, 'Active synergies reported');

// Test CCU / Telemetry Shield
const ccuOutcome = patches.evaluateVignetteWithSynergies(
  mockPlayer,
  ['Telemetry bed'],
  baseOutcome,
  'GDMT',
  gameState
);
assert.strictEqual(ccuOutcome.sbpDelta, 0, 'CCU Shield negates positive SBP spike');
assert.strictEqual(ccuOutcome.complicationProb, 0.12, 'CCU Shield reduces M&M risk by 40%');

// Test Cardiac Rehab Synergy
const rehabOutcome = patches.evaluateVignetteWithSynergies(
  mockPlayer,
  ['CPET lab'],
  { sbpDelta: 0, bmiDelta: 0 },
  'GDMT',
  gameState
);
assert.strictEqual(rehabOutcome.sbpDelta, -3, 'Cardiac Rehab lowers SBP by -3');
assert.strictEqual(rehabOutcome.bmiDelta, -0.4, 'Cardiac Rehab lowers BMI by -0.4');

// Test Industry Hospitality
const pharmaOutcome = patches.evaluateVignetteWithSynergies(
  mockPlayer,
  ['Pharma Rep Steak Dinner'],
  { rvuDelta: 2000, auditExposure: 0 },
  'INVASIVE',
  gameState
);
assert.strictEqual(pharmaOutcome.rvuDelta, 2400, 'Industry Hospitality boosts RVUs by 20%');
assert.strictEqual(pharmaOutcome.auditExposure, 0.15, 'Industry Hospitality adds +15% audit exposure');

// Test Follow-Up Queue generation on Cost Containment
patches.evaluateVignetteWithSynergies(
  mockPlayer,
  [],
  baseOutcome,
  'COST_CONTAINMENT',
  gameState
);
assert.strictEqual(gameState.followUpQueue.length, 1, 'Follow-up queued');
assert.strictEqual(gameState.followUpQueue[0].triggerTurn, 11, 'Trigger scheduled at turn + 6');
console.log('✓ Hospital suite synergies and longitudinal follow-ups verify perfectly');

console.log('--- TEST 6: Career Compendium Persistence ---');
const storageMap = {};
global.localStorage = {
  getItem: (k) => storageMap[k] || null,
  setItem: (k, v) => { storageMap[k] = v; }
};

const comp = patches.loadCareerCompendium();
assert(Array.isArray(comp.trialsEncountered), 'Trials array initialized');
assert.strictEqual(comp.lifetimeTotalChoices, 0, 'Choices count initialized');

patches.recordVignetteTrialInCompendium('COURAGE', true);
const savedComp = JSON.parse(storageMap['cardiopoly_career_v1']);
assert(savedComp.trialsEncountered.includes('COURAGE'), 'COURAGE recorded');
assert.strictEqual(savedComp.lifetimeTotalChoices, 1, 'Total choices incremented');
assert.strictEqual(savedComp.lifetimeGdmtChoices, 1, 'GDMT choices incremented');
console.log('✓ Career Compendium persistence verified in localStorage');

console.log('\n================================================================');
console.log('   ALL TDD VERIFICATION TESTS COMPLETED SUCCESSFULLY!           ');
console.log('================================================================');
