const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {
  REGIMES,
  getRegime,
  computeProcedureTariff,
  evaluateAuditScrutiny,
  applyRegimePolicyCard,
  rotateNextRegime,
  getRegimeMultiplier
} = require('../src/engine/policies.js');

// ============================================================================
// 1. All 9 Regimes Definition Verification
// ============================================================================
const requiredRegimes = [
  'SINGAPORE',
  'UNITED_STATES',
  'UNITED_KINGDOM',
  'SWEDEN',
  'JAPAN',
  'SOUTH_KOREA',
  'TAIWAN',
  'MALAYSIA',
  'INDONESIA'
];

assert(REGIMES && typeof REGIMES === 'object', 'REGIMES must be an object');

requiredRegimes.forEach((regimeId) => {
  const regime = REGIMES[regimeId];
  assert(regime, `REGIMES must define ${regimeId}`);
  assert.strictEqual(regime.id, regimeId, `${regimeId}.id must equal ${regimeId}`);
  assert(typeof regime.name === 'string' && regime.name.length > 0, `${regimeId}.name must be non-empty string`);
  assert(typeof regime.fullName === 'string' && regime.fullName.length > 0, `${regimeId}.fullName must be non-empty string`);
  assert(typeof regime.flag === 'string' && regime.flag.length > 0, `${regimeId}.flag must be non-empty string`);
  assert(typeof regime.systemType === 'string', `${regimeId}.systemType must be string`);
  assert(typeof regime.baseCoPay === 'number', `${regimeId}.baseCoPay must be number`);
  assert(typeof regime.ffsMultiplier === 'number', `${regimeId}.ffsMultiplier must be number`);
  assert(typeof regime.rentMultiplier === 'number', `${regimeId}.rentMultiplier must be number`);
  assert(typeof regime.auditStrictness === 'number', `${regimeId}.auditStrictness must be number`);
  assert(typeof regime.description === 'string', `${regimeId}.description must be string`);
});

// Alias resolution checks
assert.strictEqual(getRegime('US').id, 'UNITED_STATES');
assert.strictEqual(getRegime('USA').id, 'UNITED_STATES');
assert.strictEqual(getRegime('UK').id, 'UNITED_KINGDOM');
assert.strictEqual(getRegime('SG').id, 'SINGAPORE');
assert.strictEqual(getRegime('SE').id, 'SWEDEN');
assert.strictEqual(getRegime('JP').id, 'JAPAN');
assert.strictEqual(getRegime('KR').id, 'SOUTH_KOREA');
assert.strictEqual(getRegime('TW').id, 'TAIWAN');
assert.strictEqual(getRegime('MY').id, 'MALAYSIA');
assert.strictEqual(getRegime('ID').id, 'INDONESIA');
assert.strictEqual(getRegime('UNKNOWN_COUNTRY').id, 'SINGAPORE', 'Default fallback should be SINGAPORE');

// ============================================================================
// 2. computeProcedureTariff Verification
// ============================================================================

// 2a. Singapore: Class A with IP Rider bills high (>1000 WP) and sets 0.05 coPayPercent
const sgCath = computeProcedureTariff('PCI_3_STENT', 'SINGAPORE', { ward: 'CLASS_A', ipRider: true });
assert.strictEqual(sgCath.approved, true);
assert.strictEqual(sgCath.reimbursedWP > 1000, true, `sgCath.reimbursedWP should be > 1000, got ${sgCath.reimbursedWP}`);
assert.strictEqual(sgCath.coPayPercent, 0.05, `sgCath.coPayPercent should be 0.05, got ${sgCath.coPayPercent}`);
assert.strictEqual(sgCath.patientCoPayWP, Math.round(sgCath.reimbursedWP * 0.05));

// Subsidized Class B2 Singapore ward has default baseCoPay (0.20)
const sgSubsidized = computeProcedureTariff('PCI_3_STENT', 'SINGAPORE', { ward: 'CLASS_B2', ipRider: false });
assert.strictEqual(sgSubsidized.coPayPercent, 0.20);

// 2b. UK NHS: Fails unindicated procedures with low QALY gain (<0.03)
const ukDenied = computeProcedureTariff('ELECTIVE_STENT', 'UK', { qalyGain: 0.02 });
assert.strictEqual(ukDenied.approved, false, 'UK NHS must deny elective stenting with QALY gain < 0.03');
assert(ukDenied.reason && ukDenied.reason.includes('NICE') && ukDenied.reason.includes('QALY'), 'Reason must mention NICE and QALY');

// Indicated UK procedure with high QALY gain passes with 0% patient co-pay
const ukApproved = computeProcedureTariff('ELECTIVE_STENT', 'UNITED_KINGDOM', { qalyGain: 0.06 });
assert.strictEqual(ukApproved.approved, true);
assert.strictEqual(ukApproved.coPayPercent, 0.0, 'NHS care should have 0 co-pay at point of care');
assert.strictEqual(ukApproved.patientCoPayWP, 0);

// 2c. Indonesia: Applies INA-CBG bundled flat cap
const idCathSingle = computeProcedureTariff('PCI_SINGLE_STENT', 'INDONESIA', { stents: 1 });
const idCathTriple = computeProcedureTariff('PCI_3_STENT', 'INDONESIA', { stents: 3, complex: true });
assert.strictEqual(idCathSingle.approved, true);
assert.strictEqual(idCathTriple.approved, true);
assert.strictEqual(idCathTriple.reimbursedWP <= 650, true, `INA-CBG cap must limit reimbursement to <= 650, got ${idCathTriple.reimbursedWP}`);
assert.strictEqual(idCathSingle.reimbursedWP, idCathTriple.reimbursedWP, 'INA-CBG should apply identical flat bundled cap regardless of extra stents');
assert(idCathTriple.tariffDescription.includes('INA-CBG'), 'Tariff description must mention INA-CBG bundled flat cap');

// 2d. Taiwan: Applies floating point budget multiplier when volume exceeds cap
const twNormal = computeProcedureTariff('PCI_3_STENT', 'TAIWAN', { volumeRatio: 0.95 });
const twSurge = computeProcedureTariff('PCI_3_STENT', 'TAIWAN', { volumeRatio: 1.30 });
assert.strictEqual(twNormal.approved, true);
assert.strictEqual(twSurge.approved, true);
assert.strictEqual(twSurge.reimbursedWP < twNormal.reimbursedWP, true, 'Surge volume must cause floating point devaluation under Taiwan Global Budget');
assert(twSurge.tariffDescription.includes('Floating Point') || twSurge.tariffDescription.includes('floating point'), 'Must document floating point discount');

// ============================================================================
// 3. evaluateAuditScrutiny Verification
// ============================================================================

// 3a. Singapore: Flags unindicated FFR (>0.80) with MOH Fee Benchmark violation
const sgAuditFlagged = evaluateAuditScrutiny('PCI_3_STENT', 'SINGAPORE', { ffr: 0.86 });
assert.strictEqual(sgAuditFlagged.flagged, true);
assert.strictEqual(sgAuditFlagged.reason.includes('MOH Fee Benchmark'), true, `Expected reason to include 'MOH Fee Benchmark', got: ${sgAuditFlagged.reason}`);
assert(sgAuditFlagged.clawbackWP > 0, 'Flagged audit should impose clawback');

const sgAuditPassed = evaluateAuditScrutiny('PCI_3_STENT', 'SINGAPORE', { ffr: 0.74 });
assert.strictEqual(sgAuditPassed.flagged, false);

// 3b. US: Flags unindicated procedures lacking Prior Authorization
const usAuditNoAuth = evaluateAuditScrutiny('PCI_3_STENT', 'UNITED_STATES', { priorAuth: false });
assert.strictEqual(usAuditNoAuth.flagged, true);
assert(usAuditNoAuth.reason.toLowerCase().includes('prior authorization'), `Expected Prior Authorization in reason, got: ${usAuditNoAuth.reason}`);

const usAuditWithAuth = evaluateAuditScrutiny('PCI_3_STENT', 'US', { priorAuth: true, ffr: 0.75 });
assert.strictEqual(usAuditWithAuth.flagged, false);

// 3c. South Korea: Flags unindicated stent usage with HIRA clawback
const krAuditFlagged = evaluateAuditScrutiny('PCI_3_STENT', 'SOUTH_KOREA', { ffr: 0.85, stentCount: 3 });
assert.strictEqual(krAuditFlagged.flagged, true);
assert(krAuditFlagged.reason.includes('HIRA'), `Expected HIRA in reason, got: ${krAuditFlagged.reason}`);
assert(krAuditFlagged.clawbackWP > 0, 'HIRA audit must clawback WP');

const krAuditPassed = evaluateAuditScrutiny('PCI_3_STENT', 'KR', { ffr: 0.72, stentCount: 1 });
assert.strictEqual(krAuditPassed.flagged, false);

// ============================================================================
// 4. applyRegimePolicyCard & State Management Verification
// ============================================================================
const testGameState = {
  currentRegime: 'SINGAPORE',
  players: [{ id: 0, wp: 1000 }, { id: 1, wp: 1000 }]
};

const switchResult = applyRegimePolicyCard(testGameState, 'SWEDEN');
assert.strictEqual(testGameState.currentRegime, 'SWEDEN');
assert.strictEqual(switchResult.regime.id, 'SWEDEN');
assert.strictEqual(switchResult.regime.flag, '🇸🇪');

const rotatedResult = rotateNextRegime(testGameState);
assert.notStrictEqual(rotatedResult.regime.id, 'SWEDEN');
assert.strictEqual(testGameState.currentRegime, rotatedResult.regime.id);

// Regimes multipliers
const usRentMult = getRegimeMultiplier('UNITED_STATES', 'RENT');
const ukRentMult = getRegimeMultiplier('UNITED_KINGDOM', 'RENT');
assert.strictEqual(usRentMult > ukRentMult, true, 'US market rents should exceed UK NHS capped rents');

// ============================================================================
// 5. Data & Integration Contracts Verification
// ============================================================================

// 5a. data/regimes.json must exist and match all 9 regimes
const dataJsonPath = path.join(__dirname, '..', 'data', 'regimes.json');
assert(fs.existsSync(dataJsonPath), 'data/regimes.json must exist');
const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
requiredRegimes.forEach((id) => {
  assert(dataJson[id], `data/regimes.json must contain entry for ${id}`);
});

// 5b. index.html integration
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('id="telemetry-regime-badge"'), 'index.html must include #telemetry-regime-badge');
assert(html.includes('src/engine/policies.js'), 'index.html must include src/engine/policies.js');
const policiesIdx = html.indexOf('src/engine/policies.js');
const scriptIdx = html.indexOf('script.js');
assert(policiesIdx < scriptIdx, 'src/engine/policies.js must load before script.js');

// 5c. styles.css integration
const cssPath = path.join(__dirname, '..', 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');
assert(css.includes('.regime-badge'), 'styles.css must style .regime-badge');
assert(css.includes('.telemetry-regime-wrap'), 'styles.css must style .telemetry-regime-wrap');

// 5d. script.js integration
const scriptJsPath = path.join(__dirname, '..', 'script.js');
const jsCode = fs.readFileSync(scriptJsPath, 'utf8');
assert(jsCode.includes('currentRegime: "SINGAPORE"'), 'script.js must initialize gameState.currentRegime = "SINGAPORE"');
assert(jsCode.includes('CardiopolyPolicies.getRegime'), 'script.js must use CardiopolyPolicies.getRegime');
assert(jsCode.includes('CardiopolyPolicies.rotateNextRegime'), 'script.js must support rotating regimes');
assert(jsCode.includes('CardiopolyPolicies.getRegimeMultiplier'), 'script.js must apply getRegimeMultiplier');

console.log('policies.test.js: All 9-nation policy rules, tariffs, audits, and integration contracts passed.');
