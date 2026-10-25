const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Import Vignette module (will fail initially before implementation)
const {
  loadVignettes,
  getAllVignettes,
  getVignetteByDepartment,
  getVignetteByTileIndex,
  getVignetteForTile,
  resolveVignetteDecision,
  getBotVignetteChoice,
  showVignetteModal,
  CardiopolyVignettes
} = require('../src/components/vignetteModal.js');

console.log('--- Testing Clinical Case Vignette Decision Encounter Engine ---');

// ============================================================================
// 1. Data Library Loading & Structure (data/vignettes.json)
// ============================================================================
const vignettesDataPath = path.join(__dirname, '..', 'data', 'vignettes.json');
assert(fs.existsSync(vignettesDataPath), 'data/vignettes.json must exist');

const vignettesRaw = JSON.parse(fs.readFileSync(vignettesDataPath, 'utf8'));
const vignettesList = Array.isArray(vignettesRaw) ? vignettesRaw : vignettesRaw.vignettes;
assert(Array.isArray(vignettesList), 'vignettes.json must contain an array of scenarios');
assert(vignettesList.length >= 25, `Expected 25+ clinical scenarios, found ${vignettesList.length}`);

// Validate scenario schema
vignettesList.forEach((scenario, idx) => {
  assert(scenario.id, `Scenario #${idx} must have an id`);
  assert(scenario.department, `Scenario ${scenario.id} must define a department name`);
  assert(scenario.patient, `Scenario ${scenario.id} must define patient vitals`);
  assert(typeof scenario.patient.age === 'number', `${scenario.id} patient must have age`);
  assert(typeof scenario.patient.sbp === 'number', `${scenario.id} patient must have sbp`);
  assert(typeof scenario.patient.egfr === 'number', `${scenario.id} patient must have egfr`);
  assert(scenario.ecg && typeof scenario.ecg.summary === 'string', `${scenario.id} must have ECG summary`);
  assert(scenario.crossDiscipline, `${scenario.id} must define crossDiscipline flags`);
  assert(scenario.choices, `${scenario.id} must define choices`);
  assert(scenario.choices.CHOICE_GDMT, `${scenario.id} must define CHOICE_GDMT`);
  assert(scenario.choices.CHOICE_INTERVENTION, `${scenario.id} must define CHOICE_INTERVENTION`);
  assert(scenario.choices.CHOICE_COST_CONTAINMENT, `${scenario.id} must define CHOICE_COST_CONTAINMENT`);
});

// Test loadVignettes and getAllVignettes helper
const allVignettes = getAllVignettes();
assert(Array.isArray(allVignettes) && allVignettes.length >= 25, 'getAllVignettes() must return 25+ scenarios');

// ============================================================================
// 2. Scenario Lookup Tests (by Department Name and Tile Index)
// ============================================================================
// Test four key departments required by spec
const oculostenotic = getVignetteByDepartment('Oculostenotic space');
assert(oculostenotic, 'Must find scenario for "Oculostenotic space"');
assert.strictEqual(oculostenotic.department, 'Oculostenotic space');

const troponin = getVignetteByDepartment('Troponin cubicle');
assert(troponin, 'Must find scenario for "Troponin cubicle"');
assert.strictEqual(troponin.department, 'Troponin cubicle');

const triplePressor = getVignetteByDepartment('Triple-pressor area');
assert(triplePressor, 'Must find scenario for "Triple-pressor area"');
assert.strictEqual(triplePressor.department, 'Triple-pressor area');

const radialRecovery = getVignetteByDepartment('Radial recovery lounge');
assert(radialRecovery, 'Must find scenario for "Radial recovery lounge"');
assert.strictEqual(radialRecovery.department, 'Radial recovery lounge');

// Case-insensitivity and whitespace resilience
const caseInsensitiveMatch = getVignetteByDepartment('  oculostenotic space  ');
assert(caseInsensitiveMatch, 'Department lookup must be case-insensitive and trimmed');
assert.strictEqual(caseInsensitiveMatch.id, oculostenotic.id);

// Tile index lookup
if (oculostenotic.tileIndex !== undefined) {
  const byIndex = getVignetteByTileIndex(oculostenotic.tileIndex);
  assert(byIndex, 'Lookup by tileIndex must return matching scenario');
  assert.strictEqual(byIndex.id, oculostenotic.id);
}

// Fallback for unmapped tile
const fallbackVignette = getVignetteByDepartment('Nonexistent Department');
assert(fallbackVignette !== null, 'Unknown department should return a valid fallback clinical scenario');

// getVignetteForTile wrapper
const tileObj = { name: 'Oculostenotic space', index: 32 };
const vignetteForTile = getVignetteForTile(tileObj);
assert(vignetteForTile && vignetteForTile.department === 'Oculostenotic space');

// ============================================================================
// 3. Decision Resolution: resolveVignetteDecision
// ============================================================================
const sampleScenarioLowEGFR = {
  id: 'CASE_CCS2_LAD',
  department: 'Oculostenotic space',
  patient: {
    age: 62,
    gender: 'M',
    sbp: 146,
    hr: 72,
    egfr: 42, // < 45!
    hba1c: 8.6, // elevated
    symptoms: 'Class II Angina',
    ischemia: 'Mild',
    anatomy: '75% mid-LAD lesion, FFR 0.83'
  },
  crossDiscipline: {
    nephrology: { flag: true, egfr: 42, note: 'Stage 3b CKD - Contrast-induced nephropathy alert' },
    endocrinology: { flag: true, hba1c: 8.6, indication: 'Type 2 Diabetes - SGLT2i / GLP-1 RA indicated' },
    cardiothoracic: { flag: false, syntaxScore: 12, heartTeamRequired: false }
  },
  choices: {
    CHOICE_GDMT: {
      id: 'CHOICE_GDMT',
      title: 'Guideline-Directed Medical Therapy (GDMT)',
      gdmtPoints: 15,
      rvuPoints: 100,
      wastePoints: -50,
      margin: 400,
      complicationRisk: 'Low'
    },
    CHOICE_INTERVENTION: {
      id: 'CHOICE_INTERVENTION',
      title: 'Immediate PCI Stenting',
      gdmtPoints: 2,
      rvuPoints: 1800,
      wastePoints: 750,
      margin: 2200,
      complicationRisk: 'Moderate'
    },
    CHOICE_COST_CONTAINMENT: {
      id: 'CHOICE_COST_CONTAINMENT',
      title: 'Outpatient Medical Observation',
      gdmtPoints: 8,
      rvuPoints: 250,
      wastePoints: 20,
      margin: 3200,
      complicationRisk: 'Low'
    }
  }
};

// Test A: CHOICE_GDMT awards GDMT points to Academic Clinician and lowers complication risk
const gdmtRes = resolveVignetteDecision(sampleScenarioLowEGFR, 'CHOICE_GDMT', 'ACADEMIC_CLINICIAN', 'SINGAPORE');
assert(gdmtRes.gdmtPoints > 0, 'CHOICE_GDMT must award GDMT points');
assert.strictEqual(gdmtRes.complicationRisk, 'Low', 'CHOICE_GDMT complication risk must be Low');
assert(gdmtRes.factionBonus && gdmtRes.factionBonus.gdmtBonus > 0, 'Academic Clinician gets faction bonus on GDMT');

// Test B: CHOICE_INTERVENTION awards RVU points to Interventionalist, increases procedural waste points,
// and triggers nephroContrastAlert when eGFR < 45
const stentRes = resolveVignetteDecision(sampleScenarioLowEGFR, 'CHOICE_INTERVENTION', 'INTERVENTIONALIST', 'UNITED_STATES');
assert(stentRes.rvuPoints > 0, 'CHOICE_INTERVENTION must award RVU points');
assert(stentRes.wastePoints > 0, 'CHOICE_INTERVENTION must increase procedural waste points');
assert.strictEqual(stentRes.nephroContrastAlert, true, 'eGFR 42 (< 45) must trigger nephroContrastAlert');
assert(stentRes.factionBonus && stentRes.factionBonus.rvuBonus > 0, 'Interventionalist gets RVU faction bonus');

// Test B2: Alias 'CHOICE_STENT' compatibility
const stentAliasRes = resolveVignetteDecision(sampleScenarioLowEGFR, 'CHOICE_STENT', 'INTERVENTIONALIST');
assert(stentAliasRes.rvuPoints > 0, 'CHOICE_STENT alias must resolve identically');
assert.strictEqual(stentAliasRes.nephroContrastAlert, true, 'CHOICE_STENT alias must trigger nephroContrastAlert');

// Test B3: When eGFR >= 45, nephroContrastAlert is false
const sampleScenarioNormalKidneys = {
  ...sampleScenarioLowEGFR,
  patient: { ...sampleScenarioLowEGFR.patient, egfr: 88 }
};
const normalKidneyRes = resolveVignetteDecision(sampleScenarioNormalKidneys, 'CHOICE_INTERVENTION', 'INTERVENTIONALIST');
assert.strictEqual(normalKidneyRes.nephroContrastAlert, false, 'eGFR 88 (>= 45) must NOT trigger nephroContrastAlert');

// Test C: CHOICE_COST_CONTAINMENT awards hospital margin to Hospital CEO and avoids audit flags
const costRes = resolveVignetteDecision(sampleScenarioLowEGFR, 'CHOICE_COST_CONTAINMENT', 'HOSPITAL_CEO', 'UNITED_KINGDOM');
assert(costRes.margin > 0, 'CHOICE_COST_CONTAINMENT must award hospital turnover margin');
assert.strictEqual(costRes.auditFlag, false, 'CHOICE_COST_CONTAINMENT must avoid audit flags');
assert(costRes.factionBonus && costRes.factionBonus.marginBonus > 0, 'Hospital CEO gets margin faction bonus');

// ============================================================================
// 4. Cross-Disciplinary Flags Verification
// ============================================================================
// Nephrology: eGFR < 45 cardiorenal flag
assert.strictEqual(sampleScenarioLowEGFR.crossDiscipline.nephrology.flag, true);
assert(sampleScenarioLowEGFR.crossDiscipline.nephrology.egfr < 45);

// Endocrinology: Diabetes / elevated HbA1c SGLT2i/GLP-1 recommendation
assert.strictEqual(sampleScenarioLowEGFR.crossDiscipline.endocrinology.flag, true);
assert(sampleScenarioLowEGFR.crossDiscipline.endocrinology.indication.includes('SGLT2i') || sampleScenarioLowEGFR.crossDiscipline.endocrinology.indication.includes('GLP-1'));

// Cardiothoracic surgery: Multi-vessel / high SYNTAX Heart Team CABG vs PCI flag
const sampleComplexCAD = {
  id: 'CASE_COMPLEX_3VD',
  department: 'Cath lab',
  patient: { age: 67, egfr: 60, sbp: 152, symptoms: 'Multi-vessel CAD with diabetic LM equiv' },
  crossDiscipline: {
    nephrology: { flag: false, egfr: 60 },
    endocrinology: { flag: true, hba1c: 9.1, indication: 'Type 2 DM' },
    cardiothoracic: { flag: true, syntaxScore: 34, heartTeamRequired: true, cabgPreferred: true, note: 'SYNTAX >= 33 favors CABG over PCI' }
  },
  choices: sampleScenarioLowEGFR.choices
};
assert.strictEqual(sampleComplexCAD.crossDiscipline.cardiothoracic.flag, true);
assert.strictEqual(sampleComplexCAD.crossDiscipline.cardiothoracic.heartTeamRequired, true);
assert.strictEqual(sampleComplexCAD.crossDiscipline.cardiothoracic.cabgPreferred, true);

// ============================================================================
// 5. Bot Decision Archetype Logic (getBotVignetteChoice)
// ============================================================================
const academicBot = { id: 1, name: 'Evidence Bot', factionId: 'ACADEMIC_CLINICIAN' };
const interventionalBot = { id: 2, name: 'Stent Bot', factionId: 'INTERVENTIONALIST' };
const ceoBot = { id: 3, name: 'Margin Bot', factionId: 'HOSPITAL_CEO' };
const auditorBot = { id: 4, name: 'Audit Bot', factionId: 'REGULATORY_AUDITOR' };

assert.strictEqual(getBotVignetteChoice(sampleScenarioLowEGFR, academicBot, 'SINGAPORE'), 'CHOICE_GDMT', 'Academic Clinician bot prefers GDMT');
assert.strictEqual(getBotVignetteChoice(sampleScenarioLowEGFR, interventionalBot, 'UNITED_STATES'), 'CHOICE_INTERVENTION', 'Interventionalist bot prefers Intervention');
assert.strictEqual(getBotVignetteChoice(sampleScenarioLowEGFR, ceoBot, 'UNITED_STATES'), 'CHOICE_COST_CONTAINMENT', 'Hospital CEO bot prefers Cost-Containment for margin');
assert(['CHOICE_GDMT', 'CHOICE_COST_CONTAINMENT'].includes(getBotVignetteChoice(sampleScenarioLowEGFR, auditorBot, 'UNITED_KINGDOM')), true, 'Auditor bot avoids high-waste intervention');

// ============================================================================
// 6. Modal Component & Module Contract
// ============================================================================
assert(typeof showVignetteModal === 'function', 'showVignetteModal must be an exported function');
assert(CardiopolyVignettes && typeof CardiopolyVignettes.resolveVignetteDecision === 'function', 'CardiopolyVignettes namespace must be exported');

// ============================================================================
// 7. Integration Verification (index.html, styles.css, script.js)
// ============================================================================
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(htmlContent.includes('src/components/vignetteModal.js'), 'index.html must load src/components/vignetteModal.js');
assert(htmlContent.includes('id="vignette-modal"'), 'index.html must contain #vignette-modal container');

const cssContent = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
assert(cssContent.includes('#vignette-modal'), 'styles.css must style #vignette-modal');
assert(cssContent.includes('.vignette-patient-card'), 'styles.css must style .vignette-patient-card');
assert(cssContent.includes('.vignette-vitals-strip'), 'styles.css must style .vignette-vitals-strip');
assert(cssContent.includes('.vignette-choice-card'), 'styles.css must style .vignette-choice-card');
assert(cssContent.includes('.cross-discipline-tag'), 'styles.css must style .cross-discipline-tag');

const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
assert(scriptContent.includes('handleClinicalEncounter'), 'script.js must define handleClinicalEncounter');
assert(scriptContent.includes('applyClinicalDecisionToPlayer'), 'script.js must define applyClinicalDecisionToPlayer');
assert(scriptContent.includes('await handleClinicalEncounter(player, tile)'), 'resolveLandedTile must trigger handleClinicalEncounter on PROPERTY');

console.log('vignettes.test.js passed all unit and integration contracts successfully.');
