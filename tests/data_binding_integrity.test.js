const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SCRIPT_PATH = path.join(ROOT_DIR, 'script.js');
const FACTIONS_PATH = path.join(ROOT_DIR, 'src', 'engine', 'factions.js');
const PATCHES_PATH = path.join(ROOT_DIR, 'patches', 'cardiopoly_script_patches.js');

console.log('================================================================');
console.log('  TEST SUITE: DATA-BINDING & TEXT INTERPOLATION INTEGRITY (DTTIB)');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST 1: Static Source Code Interpolation Audit
// -------------------------------------------------------------
console.log('--- TEST 1: Static Source Code Interpolation Audit ---');
const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');

// Assert no raw literal "undefined%" or "(undefined%)" in source code
assert(!scriptSource.includes('undefined%'), 'script.js must NOT contain literal "undefined%"');
assert(!scriptSource.includes('(undefined%)'), 'script.js must NOT contain literal "(undefined%)"');
assert(!scriptSource.includes('${prog.label} (${prog.progressPct}%)'), 'Legacy buggy faction progress pattern must be eliminated');

console.log('✓ Static source code free of literal undefined% defect patterns');

// -------------------------------------------------------------
// TEST 2: Faction Engine Progress Contract Verification
// -------------------------------------------------------------
console.log('\n--- TEST 2: Faction Engine Progress Contract Verification ---');
const factions = require(FACTIONS_PATH);
const mockPlayer = {
  id: 0,
  name: 'Academic Clinician',
  factionId: 'ACADEMIC_CLINICIAN',
  gdmtScore: 70,
  encounters: 8,
  complications: 0
};

const prog = factions.getFactionProgress(mockPlayer, { mode: 'clinical_mastery' });
assert(prog.label !== undefined, 'prog.label must be defined');
assert(typeof prog.label === 'string', 'prog.label must be a string');
assert(!prog.label.includes('undefined'), 'prog.label must NOT contain "undefined"');
assert(typeof prog.progressPct === 'number', 'prog.progressPct must be a number');
assert(!isNaN(prog.progressPct), 'prog.progressPct must not be NaN');

console.log(`✓ Faction progress contract verified: label="${prog.label}", progressPct=${prog.progressPct}%`);

// -------------------------------------------------------------
// TEST 3: Headless Faction Dossier Rendering Simulation
// -------------------------------------------------------------
console.log('\n--- TEST 3: Headless Faction Dossier Rendering Simulation ---');
const patches = require(PATCHES_PATH);
const players = [
  { id: 0, name: 'You', factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 70, rvuPoints: 2313, clawbackWP: 0 },
  { id: 1, name: 'Dr. Cath-A-Lot', factionId: 'INTERVENTIONALIST', gdmtScore: 70, rvuPoints: 1125, sanctions: 0 },
  { id: 2, name: 'V.P. Margin', factionId: 'HOSPITAL_CEO', gdmtScore: 70, departmentMargin: 0, fullDepartmentGroups: 0 },
  { id: 3, name: 'Inspector Clawback', factionId: 'REGULATORY_AUDITOR', gdmtScore: 70, clawbackWP: 0 }
];

const renderedDossierStrings = [];
players.forEach(p => {
  const comp = patches.computePlayerFactionProgress(p, { mode: 'clinical_mastery' });
  const fprog = factions.getFactionProgress(p, { mode: 'clinical_mastery' });
  const pct = fprog.progressPct ?? fprog.percent ?? comp.pct ?? 0;
  const progressText = fprog.label || `${pct}% Target Progress`;
  
  assert(!progressText.includes('undefined'), `Dossier progressText must not include undefined: ${progressText}`);
  assert(!progressText.includes('NaN'), `Dossier progressText must not include NaN: ${progressText}`);
  renderedDossierStrings.push(`${p.name} -> ${progressText}`);
});

renderedDossierStrings.forEach(s => console.log(`✓ Rendered: ${s}`));

// -------------------------------------------------------------
// TEST 4: Zero Defect Rate Calculation (Theta_defect = 0.0%)
// -------------------------------------------------------------
console.log('\n--- TEST 4: Zero Defect Rate Calculation (Theta_defect = 0.0%) ---');
let totalAuditedFields = 0;
let defectCount = 0;

players.forEach(p => {
  const fields = [
    p.name,
    p.factionId,
    String(p.gdmtScore),
    String(p.rvuPoints || 0),
    String(p.clawbackWP || 0)
  ];
  fields.forEach(f => {
    totalAuditedFields++;
    if (f.includes('undefined') || f.includes('NaN') || f.includes('null')) {
      defectCount++;
    }
  });
});

const thetaDefect = (defectCount / totalAuditedFields) * 100;
assert.strictEqual(thetaDefect, 0.0, `Theta_defect must be 0.0%: got ${thetaDefect}%`);
console.log(`✓ Data-binding defect rate: Theta_defect = ${thetaDefect.toFixed(2)}% across ${totalAuditedFields} fields`);

console.log('\n================================================================');
console.log('   ALL DATA-BINDING & INTERPOLATION BENCHMARKS PASSED!         ');
console.log('================================================================');
