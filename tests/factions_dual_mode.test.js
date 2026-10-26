const assert = require('assert');
const {
  FACTIONS,
  GAME_MODES,
  evaluateFactionWin,
  checkCodeBlueHospitalization,
  checkGlobalCollapse,
  computeNetEmpireScore,
  assignFactionToPlayer,
  getFactionPassives
} = require('../src/engine/factions.js');

// 1. Verify GAME_MODES definition
assert(GAME_MODES.CLINICAL_MASTERY);
assert(GAME_MODES.BUREAUCRATIC_SATIRE);

// 2. Verify Faction Passives
const clinicianPassives = getFactionPassives('ACADEMIC_CLINICIAN');
assert.strictEqual(clinicianPassives.gdmtBonusPercent, 20);
assert.strictEqual(clinicianPassives.peerReviewDiscountPercent, 25);

const interventionalistPassives = getFactionPassives('INTERVENTIONALIST');
assert.strictEqual(interventionalistPassives.cathSuiteMultiplier, 2.0);
assert.strictEqual(interventionalistPassives.procedureBonusPercent, 15);

const ceoPassives = getFactionPassives('HOSPITAL_CEO');
assert.strictEqual(ceoPassives.acquisitionDiscountPercent, 15);
assert.strictEqual(ceoPassives.monopolyRentBonusPercent, 50);

const auditorPassives = getFactionPassives('REGULATORY_AUDITOR');
assert.strictEqual(auditorPassives.auditClawbackSharePercent, 25);

// 3. Verify Code Blue Hospitalization in Clinical Mastery Mode
const playerCrisis = {
  id: 0,
  name: 'Dr. Player',
  sbp: 202,
  bmi: 30,
  wp: 4000,
  position: 24,
  inJail: false
};

const crisisResult = checkCodeBlueHospitalization(playerCrisis, GAME_MODES.CLINICAL_MASTERY);
assert.strictEqual(crisisResult.triggered, true);
assert.strictEqual(playerCrisis.sbp, 140);
assert.strictEqual(playerCrisis.position, 10); // M&M Peer Review
assert.strictEqual(playerCrisis.inJail, true);

// In Satirical mode, SBP 200 should NOT trigger Code Blue (it is victory cutoff)
const playerSatirical = { sbp: 202, bmi: 30, inJail: false };
const satireResult = checkCodeBlueHospitalization(playerSatirical, GAME_MODES.BUREAUCRATIC_SATIRE);
assert.strictEqual(satireResult.triggered, false);

// 4. Verify Global Systemic Collapse
const playersHighWaste = [
  { wp: 10500 },
  { wp: 5000 },
  { wp: 3000 },
  { wp: 2000 }
];
const collapseRes = checkGlobalCollapse(playersHighWaste, GAME_MODES.CLINICAL_MASTERY);
assert.strictEqual(collapseRes.triggered, true);
assert(collapseRes.reason.includes('Ministry') || collapseRes.reason.includes('Audit Freeze'));

// 5. Verify Net Empire Score computation
const testPlayer = assignFactionToPlayer({ id: 0, name: 'Lead' }, 'HOSPITAL_CEO');
testPlayer.fullDepartmentGroups = 2;
testPlayer.departmentMargin = 8000;
const score = computeNetEmpireScore(testPlayer);
assert(typeof score === 'number' && score > 0);

console.log('factions_dual_mode.test.js passed all assertions successfully!');
