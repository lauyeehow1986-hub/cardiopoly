const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('  TEST SUITE: COMPETITIVE RESUSCITATION & EMERGENT QTE CHALLENGE');
console.log('================================================================\n');

// Import the resuscitation engine
const patches = require('../patches/cardiopoly_script_patches.js');
const { ResuscitationEngine } = patches;

assert(ResuscitationEngine, 'ResuscitationEngine must be exported from cardiopoly_script_patches.js');

// -------------------------------------------------------------
// TEST 1: Difficulty Scaling Formulas
// -------------------------------------------------------------
console.log('--- TEST 1: Difficulty Scaling Formulas ---');
const l1 = ResuscitationEngine.getDifficultyParameters(1);
const l2 = ResuscitationEngine.getDifficultyParameters(2);
const l3 = ResuscitationEngine.getDifficultyParameters(3);

assert.strictEqual(l1.durationSec, 5.0, 'Level 1 duration must be 5.0s');
assert.strictEqual(l2.durationSec, 4.6, 'Level 2 duration must be 4.6s');
assert.strictEqual(l3.durationSec, 4.2, 'Level 3 duration must be 4.2s');

assert.strictEqual(l1.requiredCompressions, 8, 'Level 1 requires 8 compressions');
assert.strictEqual(l2.requiredCompressions, 11, 'Level 2 requires 11 compressions');
assert.strictEqual(l3.requiredCompressions, 14, 'Level 3 requires 14 compressions');

assert.strictEqual(l1.rewardWP, 1200, 'Level 1 reward must be 1200 WP');
assert.strictEqual(l2.rewardWP, 1600, 'Level 2 reward must be 1600 WP');
assert.strictEqual(l3.rewardWP, 2000, 'Level 3 reward must be 2000 WP');

assert.strictEqual(l1.penaltyWP, 1500, 'Level 1 penalty must be 1500 WP');
assert.strictEqual(l2.penaltyWP, 2000, 'Level 2 penalty must be 2000 WP');
assert.strictEqual(l3.penaltyWP, 2500, 'Level 3 penalty must be 2500 WP');

console.log('✓ Scaling difficulty gradients verified (Time, Compressions, Rewards, Penalties)');

// -------------------------------------------------------------
// TEST 2: Multi-Agent AI Competitor Rates
// -------------------------------------------------------------
console.log('\n--- TEST 2: Multi-Agent AI Competitor Rates ---');
const mockBots = [
  { id: 1, name: 'Dr. Cath-A-Lot', faction: 'INTERVENTIONALIST', isBot: true },
  { id: 2, name: 'Inspector Clawback', faction: 'REGULATORY_AUDITOR', isBot: true },
  { id: 3, name: 'V.P. Margin', faction: 'HOSPITAL_CEO', isBot: true }
];

const botRates = ResuscitationEngine.computeBotRates(mockBots, 1);
assert(botRates[1].rate > botRates[2].rate, 'Dr. Cath-A-Lot must be faster than Inspector Clawback');
assert(botRates[2].rate > botRates[3].rate, 'Inspector Clawback must be faster than V.P. Margin');
assert(botRates[1].finishTimeSec < 5.0, 'Dr. Cath-A-Lot finish time must be within time window');
assert(botRates[1].finishTimeSec > 3.8, 'Dr. Cath-A-Lot must give player fair reaction window');

console.log(`✓ Bot competition rates verified: Cath-A-Lot (${botRates[1].finishTimeSec.toFixed(2)}s) > Clawback (${botRates[2].finishTimeSec.toFixed(2)}s) > Margin (${botRates[3].finishTimeSec.toFixed(2)}s)`);

// -------------------------------------------------------------
// TEST 3: Player Victory Outcome & Clinical Bounty
// -------------------------------------------------------------
console.log('\n--- TEST 3: Player Victory Outcome & Clinical Bounty ---');
const mockPlayer = { id: 0, name: 'Academic Clinician', wp: 3000, gdmtScore: 70, rvuPoints: 1000, sbp: 198, bmi: 34 };
const mockState = { players: [mockPlayer, ...mockBots], codeBlueDifficulty: 1 };

const winRes = ResuscitationEngine.resolveOutcome({
  winner: 'PLAYER',
  winnerId: 0,
  player: mockPlayer,
  gameState: mockState,
  elapsedSec: 3.5,
  difficulty: 1
});

assert.strictEqual(winRes.status, 'PLAYER_VICTORY', 'Outcome must be PLAYER_VICTORY');
assert.strictEqual(mockPlayer.wp, 4200, 'Player must receive +1200 WP bounty: got ' + mockPlayer.wp);
assert.strictEqual(mockPlayer.gdmtScore, 80, 'Player must receive +10 GDMT: got ' + mockPlayer.gdmtScore);
assert.strictEqual(mockPlayer.rvuPoints, 1500, 'Player must receive +500 RVUs: got ' + mockPlayer.rvuPoints);
assert.strictEqual(mockPlayer.sbp, 120, 'Vitals must be stabilized to 120 SBP');

console.log('✓ Player victory correctly applies clinical bounty and stabilizes vitals');

// -------------------------------------------------------------
// TEST 4: Computer Bot Victory Outcome
// -------------------------------------------------------------
console.log('\n--- TEST 4: Computer Bot Victory Outcome ---');
const botRes = ResuscitationEngine.resolveOutcome({
  winner: 'BOT',
  winnerId: 1, // Dr. Cath-A-Lot
  player: mockPlayer,
  gameState: mockState,
  elapsedSec: 4.1,
  difficulty: 1
});

assert.strictEqual(botRes.status, 'BOT_VICTORY', 'Outcome must be BOT_VICTORY');
assert.strictEqual(mockBots[0].wp, 1200, 'Winning bot must receive bounty WP');
assert.strictEqual(mockPlayer.wp, 4200, 'Player WP unchanged (missed bounty)');

console.log('✓ Bot victory correctly credits bounty to fastest AI physician');

// -------------------------------------------------------------
// TEST 5: Catastrophic Time-Out & Malpractice Penalty
// -------------------------------------------------------------
console.log('\n--- TEST 5: Catastrophic Time-Out & Malpractice Penalty ---');
const timeoutRes = ResuscitationEngine.resolveOutcome({
  winner: 'NONE',
  winnerId: null,
  player: mockPlayer,
  gameState: mockState,
  elapsedSec: 5.0,
  difficulty: 1
});

assert.strictEqual(timeoutRes.status, 'ASYSTOLE_FAILURE', 'Outcome must be ASYSTOLE_FAILURE');
assert.strictEqual(mockPlayer.wp, 2700, 'Player must be penalized -1500 WP: got ' + mockPlayer.wp);
assert.strictEqual(mockPlayer.gdmtScore, 70, 'Player penalized -10 GDMT');
assert.strictEqual(mockPlayer.complications, 1, 'Player acquires +1 complication');
assert.strictEqual(mockPlayer.inJail, true, 'Player transferred to CCU quarantine lockup');

console.log('✓ Resuscitation timeout enforces severe malpractice deduction and CCU lockup');

// -------------------------------------------------------------
// TEST 6: Emergent In-Game Trigger Probability
// -------------------------------------------------------------
console.log('\n--- TEST 6: Emergent In-Game Trigger Probability ---');
// Emergent check function
const t0 = ResuscitationEngine.shouldTriggerEmergentChallenge({ turnCount: 1, isEmergencyFrozen: false }, mockPlayer, 0.05);
assert.strictEqual(t0, false, 'Should not trigger on turn 1');

const tFrozen = ResuscitationEngine.shouldTriggerEmergentChallenge({ turnCount: 4, isEmergencyFrozen: true }, mockPlayer, 0.05);
assert.strictEqual(tFrozen, false, 'Should not trigger while frozen');

const tRandom = ResuscitationEngine.shouldTriggerEmergentChallenge({ turnCount: 3, isEmergencyFrozen: false }, mockPlayer, 0.08);
assert.strictEqual(tRandom, true, 'Should trigger on 8% roll after turn 1');

console.log('✓ Emergent trigger rules verified');

console.log('\n================================================================');
console.log('   ALL COMPETITIVE RESUSCITATION UNIT TESTS PASSED!             ');
console.log('================================================================');
