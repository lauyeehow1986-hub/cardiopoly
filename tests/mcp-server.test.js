const assert = require('assert');
const path = require('path');

// Import MCP server module (will fail before tools/mcp-guideline-server.js is created)
const {
  evaluateGuideline,
  generateClinicalVignette,
  benchmarkInternationalTariff,
  handleJsonRpcMessage
} = require('../tools/mcp-guideline-server.js');

console.log('--- Testing MCP Medical Guideline Bridge Server (TDD) ---');

// ============================================================================
// 1. evaluateGuideline Unit Tests
// ============================================================================

// Case A: Stable Chronic Coronary Disease with routine immediate stenting without trial of GDMT
const stableCadRes = evaluateGuideline({
  condition: 'Stable Chronic Coronary Disease',
  anatomy: 'Single vessel proximal LAD 75%',
  ischemiaSeverity: 'Moderate',
  treatment: 'Routine Immediate Stenting without trial of GDMT'
});

assert(stableCadRes, 'evaluateGuideline must return a result object');
assert.strictEqual(
  stableCadRes.recommendationClass,
  'Class III: No Benefit / Harm',
  'Unindicated immediate stenting for stable CAD must be Class III: No Benefit / Harm'
);
assert(
  Array.isArray(stableCadRes.citations),
  'Citations must be an array'
);
assert(
  stableCadRes.citations.some(c => c.includes('ISCHEMIA') || c.includes('ORBITA')),
  'Stable CAD stenting without GDMT must cite ISCHEMIA or ORBITA'
);
console.log('✓ Stable CAD routine stenting evaluation passed');

// Case B: Acute STEMI / emergency primary PCI
const stemiRes = evaluateGuideline({
  condition: 'Acute STEMI',
  treatment: 'Emergency Primary PCI',
  anatomy: '100% acute thrombotic occlusion LAD'
});

assert(
  stemiRes.recommendationClass.includes('Class I: Strong'),
  'Emergency primary PCI in STEMI must be Class I: Strong'
);
assert(
  stemiRes.citations.some(c => c.includes('STEMI') || c.includes('ACC/AHA') || c.includes('ESC')),
  'STEMI must cite standard ACC/AHA or ESC revascularization guidelines'
);
console.log('✓ Acute STEMI emergency primary PCI evaluation passed');

// Case C: Cardiorenal CKD Stage 3b (eGFR 35) with unhydrated high-contrast catheterization
const ckdRes = evaluateGuideline({
  condition: 'Cardiorenal CKD Stage 3b',
  egfr: 35,
  treatment: 'Unhydrated high-contrast catheterization'
});

assert(
  ckdRes.recommendationClass.includes('Class III') || ckdRes.recommendationClass.includes('Harm'),
  'Unhydrated high contrast in CKD 3b must be Class III / Harm'
);
assert(
  (ckdRes.citations && ckdRes.citations.some(c => c.includes('KDIGO'))) ||
  (ckdRes.crossSpecialtyAlerts && ckdRes.crossSpecialtyAlerts.some(a => a.includes('KDIGO'))),
  'CKD contrast load must cite KDIGO guidelines'
);
console.log('✓ Cardiorenal CKD Stage 3b KDIGO evaluation passed');

// Case D: Heart Failure with reduced ejection fraction (LVEF 30%) with Quadruple GDMT
const hfRes = evaluateGuideline({
  condition: 'Heart Failure with reduced ejection fraction',
  lvef: 30,
  treatment: 'Quadruple GDMT (ARNI, BB, MRA, SGLT2i)'
});

assert(
  hfRes.recommendationClass.includes('Class I: Strong'),
  'Quadruple GDMT in HFrEF must be Class I: Strong'
);
assert(
  hfRes.citations.some(c => c.includes('DAPA-HF') || c.includes('PARADIGM-HF')),
  'HFrEF Quadruple GDMT must cite DAPA-HF or PARADIGM-HF'
);
console.log('✓ HFrEF Quadruple GDMT evaluation passed');

// Case E: MOH Singapore FFR Guideline Check
const sgRes = evaluateGuideline({
  condition: 'Intermediate Coronary Stenosis (LAD 60%)',
  ffr: 0.86,
  treatment: 'Elective Stenting',
  regime: 'SINGAPORE'
});
assert(
  sgRes.recommendationClass.includes('Class III'),
  'Elective stenting with negative FFR > 0.80 must be Class III'
);
assert(
  sgRes.citations.some(c => c.includes('MOH') || c.includes('FAME')),
  'Singapore FFR evaluation must cite MOH Fee Benchmarks or FAME trial'
);
console.log('✓ Singapore MOH FFR benchmark evaluation passed');

// ============================================================================
// 2. generateClinicalVignette Tests
// ============================================================================
const vignette = generateClinicalVignette('Cath Lab', 'SINGAPORE', 'high');
assert(vignette, 'generateClinicalVignette must return a vignette object');
assert(vignette.patient, 'Vignette must contain patient object');
assert(typeof vignette.patient.age === 'number', 'Patient must have age');
assert(typeof vignette.patient.sbp === 'number', 'Patient must have sbp');
assert(typeof vignette.patient.egfr === 'number', 'Patient must have egfr');
assert(typeof vignette.patient.lvef === 'number', 'Patient must have lvef');
assert(vignette.ecg && typeof vignette.ecg.summary === 'string', 'Vignette must have ecg summary');
assert(vignette.choices, 'Vignette must define choices');
assert(vignette.choices.CHOICE_GDMT, 'Vignette must contain CHOICE_GDMT');
assert(vignette.choices.CHOICE_INTERVENTION, 'Vignette must contain CHOICE_INTERVENTION');
assert(vignette.choices.CHOICE_COST_CONTAINMENT, 'Vignette must contain CHOICE_COST_CONTAINMENT');
assert(vignette.crossDiscipline, 'Vignette must define crossDiscipline flags');
console.log('✓ generateClinicalVignette passed');

// Test generateClinicalVignette with object params as well
const vignetteByObj = generateClinicalVignette({ department: 'Emergency Room', regime: 'UNITED_STATES' });
assert(vignetteByObj && vignetteByObj.patient, 'generateClinicalVignette with object params must work');

// ============================================================================
// 3. benchmarkInternationalTariff Tests
// ============================================================================
const tariffBenchmark = benchmarkInternationalTariff('PCI_SINGLE_STENT', 'SINGAPORE');
assert(tariffBenchmark, 'benchmarkInternationalTariff must return benchmark data');
assert(typeof tariffBenchmark.reimbursedWP === 'number', 'Must specify reimbursedWP');
assert(typeof tariffBenchmark.patientCoPayWP === 'number', 'Must specify patientCoPayWP');
assert(typeof tariffBenchmark.coPayPercent === 'number', 'Must specify coPayPercent');
assert(tariffBenchmark.regime, 'Must contain target regime details');
assert(Array.isArray(tariffBenchmark.comparisons), 'Must include international comparisons array');

// Check Singapore vs US benchmark comparison
const usComp = tariffBenchmark.comparisons.find(c => c.countryId === 'UNITED_STATES');
assert(usComp, 'Comparisons must include UNITED_STATES');
const sgComp = tariffBenchmark.comparisons.find(c => c.countryId === 'SINGAPORE');
assert(sgComp, 'Comparisons must include SINGAPORE');
assert(usComp.reimbursedWP > sgComp.reimbursedWP, 'US FFS reimbursement must exceed Singapore base tariff');
console.log('✓ benchmarkInternationalTariff passed');

// ============================================================================
// 4. JSON-RPC 2.0 MCP Protocol Handling Tests
// ============================================================================

// 4a. initialize method
const initReq = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2024-11-05', clientInfo: { name: 'test-client' } }
};
const initRes = handleJsonRpcMessage(initReq);
assert.strictEqual(initRes.jsonrpc, '2.0');
assert.strictEqual(initRes.id, 1);
assert(initRes.result.serverInfo, 'Must return serverInfo');
assert.strictEqual(initRes.result.serverInfo.name, 'cardiopoly-mcp-server');
assert(initRes.result.capabilities && initRes.result.capabilities.tools, 'Must declare tools capability');
console.log('✓ MCP initialize passed');

// 4b. tools/list method
const toolsListReq = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};
const toolsListRes = handleJsonRpcMessage(toolsListReq);
assert.strictEqual(toolsListRes.id, 2);
assert(Array.isArray(toolsListRes.result.tools), 'tools/list must return array of tools');
const toolNames = toolsListRes.result.tools.map(t => t.name);
assert(toolNames.includes('evaluate_guideline_indication'), 'Must expose evaluate_guideline_indication');
assert(toolNames.includes('generate_clinical_vignette'), 'Must expose generate_clinical_vignette');
assert(toolNames.includes('benchmark_international_tariff'), 'Must expose benchmark_international_tariff');
console.log('✓ MCP tools/list passed');

// 4c. tools/call: evaluate_guideline_indication
const evalCallReq = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'evaluate_guideline_indication',
    arguments: {
      condition: 'Stable Chronic Coronary Disease',
      anatomy: 'Single vessel proximal LAD 75%',
      ischemiaSeverity: 'Moderate',
      treatment: 'Routine Immediate Stenting without trial of GDMT'
    }
  }
};
const evalCallRes = handleJsonRpcMessage(evalCallReq);
assert.strictEqual(evalCallRes.id, 3);
assert(Array.isArray(evalCallRes.result.content), 'tools/call must return content array');
assert(evalCallRes.result.content[0].text, 'Content item must have text');
const evalParsed = JSON.parse(evalCallRes.result.content[0].text);
assert.strictEqual(evalParsed.recommendationClass, 'Class III: No Benefit / Harm');
assert(evalParsed.citations.some(c => c.includes('ISCHEMIA')));
console.log('✓ MCP tools/call evaluate_guideline_indication passed');

// 4d. tools/call: generate_clinical_vignette
const vignetteCallReq = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'generate_clinical_vignette',
    arguments: {
      department: 'Cath Lab',
      regime: 'SINGAPORE'
    }
  }
};
const vignetteCallRes = handleJsonRpcMessage(vignetteCallReq);
assert.strictEqual(vignetteCallRes.id, 4);
const vignetteParsed = JSON.parse(vignetteCallRes.result.content[0].text);
assert(vignetteParsed.patient && vignetteParsed.choices, 'Vignette from tools/call must have patient and choices');
console.log('✓ MCP tools/call generate_clinical_vignette passed');

// 4e. tools/call: benchmark_international_tariff
const tariffCallReq = {
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: {
    name: 'benchmark_international_tariff',
    arguments: {
      procedureType: 'PCI_SINGLE_STENT',
      countryId: 'SINGAPORE'
    }
  }
};
const tariffCallRes = handleJsonRpcMessage(tariffCallReq);
assert.strictEqual(tariffCallRes.id, 5);
const tariffParsed = JSON.parse(tariffCallRes.result.content[0].text);
assert(tariffParsed.reimbursedWP && tariffParsed.comparisons, 'Tariff benchmark from tools/call must be valid');
console.log('✓ MCP tools/call benchmark_international_tariff passed');

// 4f. Error handling: invalid method & invalid tool name
const unknownMethodReq = {
  jsonrpc: '2.0',
  id: 6,
  method: 'non_existent_method'
};
const unknownMethodRes = handleJsonRpcMessage(unknownMethodReq);
assert(unknownMethodRes.error, 'Unknown method must return error object');
assert.strictEqual(unknownMethodRes.error.code, -32601);

const unknownToolReq = {
  jsonrpc: '2.0',
  id: 7,
  method: 'tools/call',
  params: {
    name: 'non_existent_tool',
    arguments: {}
  }
};
const unknownToolRes = handleJsonRpcMessage(unknownToolReq);
assert(unknownToolRes.error || (unknownToolRes.result && unknownToolRes.result.isError), 'Unknown tool must return error');
console.log('✓ MCP error handling passed');

console.log('mcp-server.test.js passed all unit, guideline, and MCP protocol tests!');
