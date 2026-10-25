const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {
  FACTIONS,
  evaluateFactionWin,
  recordFactionAction,
  assignFactionToPlayer,
  countCompletedGroups,
  getFactionProgress
} = require('../src/engine/factions.js');

// ============================================================================
// 1. FACTIONS Dictionary Specification
// ============================================================================
const expectedFactionKeys = [
  'ACADEMIC_CLINICIAN',
  'INTERVENTIONALIST',
  'HOSPITAL_CEO',
  'REGULATORY_AUDITOR'
];

assert(FACTIONS && typeof FACTIONS === 'object', 'FACTIONS must be an object');
expectedFactionKeys.forEach((key) => {
  const faction = FACTIONS[key];
  assert(faction, `FACTIONS must define ${key}`);
  assert.strictEqual(faction.id, key, `${key}.id must equal ${key}`);
  assert(typeof faction.name === 'string' && faction.name.length > 0, `${key}.name must be non-empty string`);
  assert(typeof faction.badge === 'string' && faction.badge.length > 0, `${key}.badge must be non-empty string`);
  assert(typeof faction.role === 'string' && faction.role.length > 0, `${key}.role must be non-empty string`);
  assert(typeof faction.description === 'string' && faction.description.length > 0, `${key}.description must be non-empty string`);
  assert(typeof faction.winConditionDescription === 'string', `${key}.winConditionDescription must be string`);
  assert(faction.winTarget && typeof faction.winTarget === 'object', `${key}.winTarget must be an object`);
});

// Specific win targets checks
assert.strictEqual(FACTIONS.ACADEMIC_CLINICIAN.winTarget.gdmtScore, 85);
assert.strictEqual(FACTIONS.ACADEMIC_CLINICIAN.winTarget.encounters, 12);
assert.strictEqual(FACTIONS.ACADEMIC_CLINICIAN.winTarget.maxComplications, 2);

assert.strictEqual(FACTIONS.INTERVENTIONALIST.winTarget.rvuPoints, 12000);
assert.strictEqual(FACTIONS.INTERVENTIONALIST.winTarget.maxSanctions, 3);

assert.strictEqual(FACTIONS.HOSPITAL_CEO.winTarget.fullDepartmentGroups, 3);
assert.strictEqual(FACTIONS.HOSPITAL_CEO.winTarget.departmentMargin, 10000);

assert.strictEqual(FACTIONS.REGULATORY_AUDITOR.winTarget.clawbackWP, 15000);

// ============================================================================
// 2. assignFactionToPlayer Function
// ============================================================================
const freshPlayer = { id: 0, name: 'You' };
const assigned = assignFactionToPlayer(freshPlayer, 'ACADEMIC_CLINICIAN');

assert.strictEqual(assigned.factionId, 'ACADEMIC_CLINICIAN');
assert.strictEqual(assigned.faction.id, 'ACADEMIC_CLINICIAN');
assert.strictEqual(typeof assigned.gdmtScore, 'number');
assert.strictEqual(typeof assigned.encounters, 'number');
assert.strictEqual(typeof assigned.complications, 'number');
assert.strictEqual(typeof assigned.rvuPoints, 'number');
assert.strictEqual(typeof assigned.sanctions, 'number');
assert.strictEqual(typeof assigned.fullDepartmentGroups, 'number');
assert.strictEqual(typeof assigned.departmentMargin, 'number');
assert.strictEqual(typeof assigned.clawbackWP, 'number');

// Preserves existing non-zero values if already defined
const playerWithValues = { id: 1, name: 'Test', gdmtScore: 82, rvuPoints: 4000 };
assignFactionToPlayer(playerWithValues, 'INTERVENTIONALIST');
assert.strictEqual(playerWithValues.factionId, 'INTERVENTIONALIST');
assert.strictEqual(playerWithValues.gdmtScore, 82);
assert.strictEqual(playerWithValues.rvuPoints, 4000);

// ============================================================================
// 3. recordFactionAction Function
// ============================================================================
const clinicianPlayer = assignFactionToPlayer({ id: 0, name: 'Clinician' }, 'ACADEMIC_CLINICIAN');

// GDMT_PRESCRIBED
recordFactionAction(clinicianPlayer, 'GDMT_PRESCRIBED', { score: 90 });
assert.strictEqual(clinicianPlayer.encounters, 1);
assert.strictEqual(clinicianPlayer.gdmtScore, 90);

recordFactionAction(clinicianPlayer, 'GDMT_PRESCRIBED', { score: 80, complication: true });
assert.strictEqual(clinicianPlayer.encounters, 2);
assert.strictEqual(clinicianPlayer.complications, 1);

// STENT_DEPLOYED
const stentPlayer = assignFactionToPlayer({ id: 1, name: 'Operator' }, 'INTERVENTIONALIST');
recordFactionAction(stentPlayer, 'STENT_DEPLOYED', { rvu: 1500 });
assert.strictEqual(stentPlayer.rvuPoints, 1500);

recordFactionAction(stentPlayer, 'STENT_DEPLOYED', { rvu: 2000, sanction: true });
assert.strictEqual(stentPlayer.rvuPoints, 3500);
assert.strictEqual(stentPlayer.sanctions, 1);

// DEPARTMENT_ACQUIRED
const ceoPlayer = assignFactionToPlayer({ id: 2, name: 'CEO' }, 'HOSPITAL_CEO');
recordFactionAction(ceoPlayer, 'DEPARTMENT_ACQUIRED', { margin: 3000, fullGroup: true });
assert.strictEqual(ceoPlayer.departmentMargin, 3000);
assert.strictEqual(ceoPlayer.fullDepartmentGroups, 1);

// AUDIT_CLAWBACK
const auditorPlayer = assignFactionToPlayer({ id: 3, name: 'Auditor' }, 'REGULATORY_AUDITOR');
recordFactionAction(auditorPlayer, 'AUDIT_CLAWBACK', { amount: 5000 });
assert.strictEqual(auditorPlayer.clawbackWP, 5000);

// ============================================================================
// 4. evaluateFactionWin Function
// ============================================================================

// ACADEMIC_CLINICIAN: gdmtScore >= 85, encounters >= 12, complications < 2
assert.strictEqual(
  evaluateFactionWin({ factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 88, encounters: 16, complications: 0 }),
  true,
  'Clinician wins when meeting all criteria'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 85, encounters: 12, complications: 1 }),
  true,
  'Clinician wins at exact threshold with 1 complication'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 84, encounters: 16, complications: 0 }),
  false,
  'Clinician fails when gdmtScore < 85'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 92, encounters: 11, complications: 0 }),
  false,
  'Clinician fails when encounters < 12'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 92, encounters: 16, complications: 2 }),
  false,
  'Clinician fails when complications >= 2'
);

// INTERVENTIONALIST: rvuPoints >= 12000, sanctions < 3
assert.strictEqual(
  evaluateFactionWin({ factionId: 'INTERVENTIONALIST', rvuPoints: 12500, sanctions: 0 }),
  true,
  'Interventionalist wins when RVUs >= 12000 and sanctions < 3'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'INTERVENTIONALIST', rvuPoints: 12000, sanctions: 2 }),
  true,
  'Interventionalist wins at boundary RVU with 2 sanctions'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'INTERVENTIONALIST', rvuPoints: 11999, sanctions: 0 }),
  false,
  'Interventionalist fails when RVUs < 12000'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'INTERVENTIONALIST', rvuPoints: 16000, sanctions: 3 }),
  false,
  'Interventionalist fails when sanctions >= 3'
);

// HOSPITAL_CEO: fullDepartmentGroups >= 3 OR departmentMargin >= 10000
assert.strictEqual(
  evaluateFactionWin({ factionId: 'HOSPITAL_CEO', fullDepartmentGroups: 3, departmentMargin: 5000 }),
  true,
  'CEO wins with >= 3 department groups'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'HOSPITAL_CEO', fullDepartmentGroups: 1, departmentMargin: 10000 }),
  true,
  'CEO wins with >= 10000 department margin'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'HOSPITAL_CEO', fullDepartmentGroups: 2, departmentMargin: 9999 }),
  false,
  'CEO fails when both groups < 3 and margin < 10000'
);

// CEO win evaluation using gameState tiles
const mockGameState = {
  tiles: [
    { type: 'PROPERTY', groupName: 'Diagnostics', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Diagnostics', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Surgery', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Surgery', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Surgery', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Rehab', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'Rehab', ownerId: 2 },
    { type: 'PROPERTY', groupName: 'ICU', ownerId: 1 } // unowned by CEO
  ]
};
assert.strictEqual(
  countCompletedGroups(2, mockGameState.tiles),
  3,
  'countCompletedGroups should detect 3 complete groups'
);
assert.strictEqual(
  evaluateFactionWin({ id: 2, factionId: 'HOSPITAL_CEO', fullDepartmentGroups: 0, departmentMargin: 0 }, mockGameState),
  true,
  'CEO wins when controlling 3 complete groups in gameState tiles'
);

// REGULATORY_AUDITOR: clawbackWP >= 15000
assert.strictEqual(
  evaluateFactionWin({ factionId: 'REGULATORY_AUDITOR', clawbackWP: 16000 }),
  true,
  'Auditor wins with > 15000 clawback'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'REGULATORY_AUDITOR', clawbackWP: 15000 }),
  true,
  'Auditor wins at exact 15000 clawback threshold'
);
assert.strictEqual(
  evaluateFactionWin({ factionId: 'REGULATORY_AUDITOR', clawbackWP: 14999 }),
  false,
  'Auditor fails when clawback < 15000'
);

// Invalid or empty faction
assert.strictEqual(evaluateFactionWin(null), false);
assert.strictEqual(evaluateFactionWin({}), false);
assert.strictEqual(evaluateFactionWin({ factionId: 'UNKNOWN' }), false);

// ============================================================================
// 5. getFactionProgress Helper Function
// ============================================================================
const progressClinician = getFactionProgress({
  factionId: 'ACADEMIC_CLINICIAN',
  gdmtScore: 88,
  encounters: 6,
  complications: 0
});
assert.strictEqual(progressClinician.factionId, 'ACADEMIC_CLINICIAN');
assert.strictEqual(progressClinician.isWin, false);
assert(typeof progressClinician.percentComplete === 'number');
assert(progressClinician.percentComplete > 0 && progressClinician.percentComplete < 100);

// ============================================================================
// 6. Integration Contract Verification (HTML, CSS, script.js)
// ============================================================================
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(html.includes('src/engine/factions.js'), 'index.html must load src/engine/factions.js');

const js = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
assert(js.includes('ACADEMIC_CLINICIAN'), 'script.js must assign ACADEMIC_CLINICIAN to player 0');
assert(js.includes('INTERVENTIONALIST'), 'script.js must assign INTERVENTIONALIST to player 1');
assert(js.includes('HOSPITAL_CEO'), 'script.js must assign HOSPITAL_CEO to player 2');
assert(js.includes('REGULATORY_AUDITOR'), 'script.js must assign REGULATORY_AUDITOR to player 3');
assert(js.includes('checkFactionWins'), 'script.js must include checkFactionWins()');
assert(js.includes('evaluateFactionWin'), 'script.js must evaluate faction win conditions');
assert(js.includes('player-faction-badge'), 'script.js must render faction badges on score cards');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
assert(css.includes('.player-faction-badge'), 'styles.css must define .player-faction-badge');

console.log('factions.test.js: All faction engine unit and integration tests passed successfully.');
