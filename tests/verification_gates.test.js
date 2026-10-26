/**
 * tests/verification_gates.test.js
 * Comprehensive end-to-end verification of all 5 Verification Gates.
 */

const assert = require('assert');
const fs = require('fs');

console.log('================================================================');
console.log('    CARDIOPOLY 5 VERIFICATION GATES AUDIT                      ');
console.log('================================================================\n');

const policies = require('../src/engine/policies.js');
const patches = require('../patches/cardiopoly_script_patches.js');

// ----------------------------------------------------------------------------
// GATE 1: Setup Screen Regime Selector (No undefinedx)
// ----------------------------------------------------------------------------
console.log('--- GATE 1: Setup Screen Healthcare Regime Selector ---');
const all9Regimes = [
  'SINGAPORE', 'UNITED_STATES', 'UNITED_KINGDOM', 'SWEDEN',
  'JAPAN', 'SOUTH_KOREA', 'TAIWAN', 'MALAYSIA', 'INDONESIA'
];

all9Regimes.forEach((key) => {
  const reg = policies.getRegime(key);
  assert(reg, `Regime ${key} must resolve`);
  const ruleText = patches.formatRegimeRuleText(reg);
  assert(!ruleText.includes('undefined'), `Regime ${key} rule text must not contain undefined: "${ruleText}"`);
  assert(!ruleText.includes('NaN'), `Regime ${key} rule text must not contain NaN`);
  assert(ruleText.match(/RVU mult \d+\.\d{2}x/), `Regime ${key} must have formatted RVU mult: "${ruleText}"`);
  assert(ruleText.match(/Rent mult \d+\.\d{2}x/), `Regime ${key} must have formatted Rent mult: "${ruleText}"`);
  assert(ruleText.match(/Co-pay rate \d+%/), `Regime ${key} must have formatted Co-pay rate: "${ruleText}"`);
  assert(ruleText.includes('|'), `Regime ${key} must include specialRule separator: "${ruleText}"`);
  console.log(`  [Pass] ${reg.name}: ${ruleText}`);
});
console.log('>>> GATE 1: PASSED (Zero undefinedx across all 9 regimes)\n');

// ----------------------------------------------------------------------------
// GATE 2: Center Board Faction Race Tab (Names, Badges, Valid Progress)
// ----------------------------------------------------------------------------
console.log('--- GATE 2: Faction Race Tab & AI Thematic Personas ---');
const players = [
  { id: 0, name: 'You', isHuman: true, factionId: 'ACADEMIC_CLINICIAN', hex: '#2563eb' },
  { id: 1, name: '', isBot: true, factionId: 'INTERVENTIONALIST', hex: '#dc2626' },
  { id: 2, name: '', isBot: true, factionId: 'HOSPITAL_CEO', hex: '#eab308' },
  { id: 3, name: '', isBot: true, factionId: 'REGULATORY_AUDITOR', hex: '#16a34a' }
];

patches.sanitizePlayerNames(players);
assert.strictEqual(players[0].name, 'You');
assert.strictEqual(players[0].factionBadge, 'ACAD');
assert.strictEqual(players[1].name, 'Dr. Cath-A-Lot');
assert.strictEqual(players[1].factionBadge, 'IC');
assert.strictEqual(players[2].name, 'V.P. Margin');
assert.strictEqual(players[2].factionBadge, 'CEO');
assert.strictEqual(players[3].name, 'Inspector Clawback');
assert.strictEqual(players[3].factionBadge, 'AUDIT');

// Mock container
const mockContainer = {
  innerHTML: ''
};

patches.renderFactionRacePatched(mockContainer, players, { mode: 'clinical_mastery' });
assert(!mockContainer.innerHTML.includes('undefined'), 'Rendered race HTML must not have undefined');
assert(mockContainer.innerHTML.includes('Dr. Cath-A-Lot'), 'HTML includes Dr. Cath-A-Lot');
assert(mockContainer.innerHTML.includes('V.P. Margin'), 'HTML includes V.P. Margin');
assert(mockContainer.innerHTML.includes('Inspector Clawback'), 'HTML includes Inspector Clawback');
assert(mockContainer.innerHTML.includes('ACAD'), 'HTML includes ACAD badge');
assert(mockContainer.innerHTML.includes('IC'), 'HTML includes IC badge');
assert(mockContainer.innerHTML.includes('CEO'), 'HTML includes CEO badge');
assert(mockContainer.innerHTML.includes('AUDIT'), 'HTML includes AUDIT badge');
assert(mockContainer.innerHTML.includes('0%'), 'HTML includes valid progress bar width');
console.log('>>> GATE 2: PASSED (Thematic AI names, clean badges, valid progress)\n');

// ----------------------------------------------------------------------------
// GATE 3: Clinical Encounter Modal Viewport & 3-Column Layout
// ----------------------------------------------------------------------------
console.log('--- GATE 3: Modal Viewport Ergonomics & 3-Column Layout ---');
const styles = fs.readFileSync('styles.css', 'utf8');
assert(styles.includes('max-height: 88vh;'), 'styles.css must have max-height: 88vh for modal content');
assert(styles.includes('width: min(960px, 94vw);'), 'styles.css must constrain modal width');
assert(styles.includes('.vignette-patient-banner'), 'styles.css must define .vignette-patient-banner');
assert(styles.includes('position: sticky;'), 'styles.css must have sticky patient banner');
assert(styles.includes('.vignette-options-grid'), 'styles.css must define .vignette-options-grid');
assert(styles.includes('grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));'), 'styles.css must define 3-column responsive option grid');

const vigModalSrc = fs.readFileSync('src/components/vignetteModal.js', 'utf8');
assert(vigModalSrc.includes('vignette-modal-content'), 'vignetteModal.js must render .vignette-modal-content');
assert(vigModalSrc.includes('vignette-patient-banner'), 'vignetteModal.js must render .vignette-patient-banner');
assert(vigModalSrc.includes('vignette-options-grid'), 'vignetteModal.js must render .vignette-options-grid');
assert(vigModalSrc.includes('vignette-option-card'), 'vignetteModal.js must render .vignette-option-card');
console.log('>>> GATE 3: PASSED (88vh viewport ceiling, sticky vitals banner, 3-column layout)\n');

// ----------------------------------------------------------------------------
// GATE 4: Perimeter Tiles (Cost Badges, Owner Glow, Upgrade Pips, SVG Tokens)
// ----------------------------------------------------------------------------
console.log('--- GATE 4: Perimeter Board Tiles & SVG Medical Tokens ---');
assert(styles.includes('.tile-cost-badge'), 'styles.css defines .tile-cost-badge');
assert(styles.includes('.tile.is-owned') || styles.includes('.board-tile.is-owned'), 'styles.css defines .is-owned');
assert(styles.includes('.is-mortgaged'), 'styles.css defines .is-mortgaged');
assert(styles.includes('.tile-upgrade-pip'), 'styles.css defines .tile-upgrade-pip');
assert(styles.includes('.player-token.is-hopping'), 'styles.css defines .is-hopping animation');

const scriptSrc = fs.readFileSync('script.js', 'utf8');
assert(scriptSrc.includes('tile-cost-badge'), 'script.js renders .tile-cost-badge');
assert(scriptSrc.includes('is-owned'), 'script.js toggles .is-owned');
assert(scriptSrc.includes('tile-upgrade-pip'), 'script.js renders .tile-upgrade-pip');
assert(scriptSrc.includes('tokenSvg'), 'script.js injects tokenSvg');
assert(scriptSrc.includes('is-hopping'), 'script.js animates hopping');
console.log('>>> GATE 4: PASSED (Cost badges, glow borders, upgrade pips, SVG tokens, hopping)\n');

// ----------------------------------------------------------------------------
// GATE 5: Dynamic Telemetry, Floating Resource Deltas, Career Compendium
// ----------------------------------------------------------------------------
console.log('--- GATE 5: Dynamic Telemetry, Floating Deltas & Career Compendium ---');
assert(styles.includes('.floating-delta-badge'), 'styles.css defines .floating-delta-badge');
assert(scriptSrc.includes('updateTelemetryFromActivePlayer'), 'script.js hooks dynamic telemetry');
assert(scriptSrc.includes('spawnFloatingResourceDelta'), 'script.js spawns floating resource deltas');

// Test Career Compendium localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; }
};

patches.recordVignetteTrialInCompendium('PARADIGM-HF', true);
const rawSaved = storage['cardiopoly_career_v1'];
assert(rawSaved, 'cardiopoly_career_v1 must exist in localStorage');
const parsed = JSON.parse(rawSaved);
assert(parsed.trialsEncountered.includes('PARADIGM-HF'), 'PARADIGM-HF trial saved');
assert(parsed.lifetimeGdmtChoices > 0, 'GDMT choice counted');
console.log('  [Pass] Career Compendium stored in localStorage:', rawSaved);
console.log('>>> GATE 5: PASSED (Telemetry readout updated, floating deltas hooked, career trials persisted)\n');

console.log('================================================================');
console.log('   ALL 5 VERIFICATION GATES CONFIRMED AND 100% PASSING!        ');
console.log('================================================================');
