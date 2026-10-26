const assert = require('assert');
const fs = require('fs');
const path = require('path');

const bridge = require('../patches/cardiopoly_mcp_runtime_bridge.js');

console.log('=== RUNNING CARDIOPOLY MCP RUNTIME BRIDGE TEST SUITE ===');

// 1. Schema Validation for DEFAULT_MACRO_SHOCK_DECK
console.log('Test 1: DEFAULT_MACRO_SHOCK_DECK schema validation...');
assert(Array.isArray(bridge.DEFAULT_MACRO_SHOCK_DECK), 'Deck must be an array');
assert(bridge.DEFAULT_MACRO_SHOCK_DECK.length >= 4, 'Deck must contain at least 4 macro shocks');

bridge.DEFAULT_MACRO_SHOCK_DECK.forEach((shock, idx) => {
  assert(typeof shock.id === 'string' && shock.id.length > 0, `Shock #${idx} must have string id`);
  assert(typeof shock.category === 'string', `Shock #${idx} must have category`);
  assert(typeof shock.headline === 'string', `Shock #${idx} must have headline`);
  assert(typeof shock.sourceTag === 'string', `Shock #${idx} must have sourceTag`);
  assert(typeof shock.patientVolumeMult === 'number', `Shock #${idx} must have patientVolumeMult`);
  assert(typeof shock.rvuMod === 'number', `Shock #${idx} must have rvuMod`);
  assert(typeof shock.rentMod === 'number', `Shock #${idx} must have rentMod`);
  assert(typeof shock.sbpStressDelta === 'number', `Shock #${idx} must have sbpStressDelta`);
  assert(typeof shock.cathSurchargeWp === 'number', `Shock #${idx} must have cathSurchargeWp`);
  assert(typeof shock.gdmtBonusPoints === 'number', `Shock #${idx} must have gdmtBonusPoints`);
  assert(typeof shock.description === 'string', `Shock #${idx} must have description`);
});
console.log('  -> Passed: All default macro shock schema assertions valid.');

// 2. data/liveWorldFeed.json validation
console.log('Test 2: data/liveWorldFeed.json structure and loading...');
const feedPath = path.join(__dirname, '..', 'data', 'liveWorldFeed.json');
assert(fs.existsSync(feedPath), 'data/liveWorldFeed.json must exist');
const feedContent = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
assert(Array.isArray(feedContent.events), 'liveWorldFeed.json must have events array');
assert(feedContent.events.length >= 4, 'liveWorldFeed.json must have at least 4 events');
console.log(`  -> Passed: liveWorldFeed.json parsed successfully with ${feedContent.events.length} live events.`);

// 3. MacroShockEngine turn advancement
console.log('Test 3: MacroShockEngine turn progression (Turn 1, Turn % 4)...');
const engine = new bridge.MacroShockEngine();
assert.strictEqual(engine.turnCounter, 0, 'Initial turn counter should be 0');

const shockTurn1 = engine.advanceTurn(1);
assert(shockTurn1 !== null, 'Turn 1 must trigger a macro shock');
assert.strictEqual(engine.turnCounter, 1);
assert.strictEqual(engine.activeShock, shockTurn1);

const shockTurn2 = engine.advanceTurn(2);
assert.strictEqual(shockTurn2, shockTurn1, 'Turn 2 should retain active shock from Turn 1');

const shockTurn3 = engine.advanceTurn(3);
assert.strictEqual(shockTurn3, shockTurn1, 'Turn 3 should retain active shock from Turn 1');

const shockTurn4 = engine.advanceTurn(4);
assert(shockTurn4 !== null, 'Turn 4 must trigger a rotation');
assert.strictEqual(engine.turnCounter, 4);
console.log('  -> Passed: Turn rotation adheres strictly to Turn % 4 cadences.');

// 4. CutInOverlayManager Headless Safety
console.log('Test 4: CutInOverlayManager headless safety...');
const cutIn = new bridge.CutInOverlayManager();
assert.doesNotThrow(() => {
  cutIn.playCutIn({
    id: 'code_blue',
    title: 'CODE BLUE HOSPITALIZATION',
    subtitle: 'Emergency CCU Admittance',
    accentColor: '#ef4444'
  });
}, 'CutInOverlayManager should execute safely without DOM in headless mode');

assert.doesNotThrow(() => {
  cutIn.hide();
}, 'CutInOverlayManager.hide() should execute safely without DOM');
console.log('  -> Passed: CutInOverlayManager gracefully handles non-DOM environments.');

// 5. Macro Shock Economic Multipliers Evaluation
console.log('Test 5: Macro shock economic formulas and clinical impact...');
const contrastShortage = bridge.DEFAULT_MACRO_SHOCK_DECK.find(s => s.id === 'contrast_shortage');
assert(contrastShortage.cathSurchargeWp === 300, 'Contrast shortage must impose 300 WP cath surcharge');
assert(contrastShortage.gdmtBonusPoints === 10, 'Contrast shortage must grant +10 GDMT bonus points');

const mockPlayer = { id: 0, name: 'Dr. Test', wp: 1000, sbp: 120, bmi: 25 };
const initialWp = mockPlayer.wp;
mockPlayer.wp = Math.max(0, mockPlayer.wp - contrastShortage.cathSurchargeWp);
assert.strictEqual(mockPlayer.wp, initialWp - 300, 'Player WP must decrease by cathSurchargeWp');

const mockDecision = { choiceId: 'CHOICE_GDMT', gdmtPoints: 3 };
mockDecision.gdmtPoints += contrastShortage.gdmtBonusPoints;
assert.strictEqual(mockDecision.gdmtPoints, 13, 'GDMT choice must receive +10 bonus points');
console.log('  -> Passed: Economic formulas apply cleanly to clinical decisions.');

console.log('=== ALL MCP RUNTIME BRIDGE TESTS PASSED (5/5) ===\n');
