#!/usr/bin/env node
/**
 * Cardiopoly - Model Context Protocol (MCP) Medical Guideline Bridge Server
 * 
 * Provides an MCP bridge exposing:
 * 1. evaluate_guideline_indication: Evaluates clinical interventions against
 *    international medical guidelines (ACC/AHA, ESC, KDIGO, ADA/EASD, MOH Singapore).
 * 2. generate_clinical_vignette: Generates structured cardiology clinical vignettes
 *    with vitals, ECG, cross-discipline flags, and tri-choice decision options.
 * 3. benchmark_international_tariff: Compares procedural reimbursement, patient co-pays,
 *    and regulatory audit scrutiny across 9 international healthcare systems.
 * 
 * Protocol: JSON-RPC 2.0 (MCP 2024-11-05 standard).
 * Supports both programmatic module exports and stdio CLI execution.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import policies engine if present
let policiesEngine = null;
try {
  policiesEngine = require('../src/engine/policies.js');
} catch (e) {
  // Graceful fallback if invoked from another working directory
  try {
    policiesEngine = require(path.join(__dirname, '..', 'src', 'engine', 'policies.js'));
  } catch (err) {
    policiesEngine = null;
  }
}

// Import vignettes library if present
let cachedVignettes = null;
function getVignettesLibrary() {
  if (cachedVignettes) return cachedVignettes;
  const possiblePaths = [
    path.join(__dirname, '..', 'data', 'vignettes.json'),
    path.join(process.cwd(), 'data', 'vignettes.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        cachedVignettes = Array.isArray(raw) ? raw : (raw.vignettes || []);
        return cachedVignettes;
      } catch (e) {}
    }
  }
  return [];
}

// ============================================================================
// Core Medical Guideline Evaluation Engine
// ============================================================================

/**
 * Evaluates clinical scenario against international guidelines.
 * 
 * @param {object} params Clinical parameters
 * @returns {object} Structured recommendation with class, evidence, citations, alerts
 */
function evaluateGuideline(params) {
  params = params || {};
  const condition = (params.condition || params.diagnosis || params.clinicalScenario || '').toLowerCase();
  const treatment = (params.treatment || params.procedure || params.intervention || '').toLowerCase();
  const anatomy = (params.anatomy || params.lesion || '').toLowerCase();
  const ischemiaSeverity = (params.ischemiaSeverity || params.ischemia || '').toLowerCase();
  const egfr = typeof params.egfr === 'number' ? params.egfr : null;
  const lvef = typeof params.lvef === 'number' ? params.lvef : null;
  const ffr = typeof params.ffr === 'number' ? params.ffr : null;
  const hba1c = typeof params.hba1c === 'number' ? params.hba1c : null;
  const regime = (params.regime || params.countryId || '').toUpperCase();

  // --------------------------------------------------------------------------
  // Rule 1: Acute STEMI / Emergency Primary PCI
  // --------------------------------------------------------------------------
  if (
    condition.includes('stemi') ||
    condition.includes('st-elevation') ||
    treatment.includes('primary pci') ||
    treatment.includes('emergency primary pci')
  ) {
    return {
      recommendationClass: 'Class I: Strong',
      levelOfEvidence: 'Level A',
      appropriatenessScore: 9,
      guidelineBody: 'ACC/AHA/SCAI 2021 Coronary Revascularization & 2023 ESC ACS Guidelines',
      summary: 'Emergency primary PCI is indicated in all patients with symptoms of ischemia of <= 12 hours duration and persistent ST-segment elevation. Target door-to-balloon time < 90 minutes.',
      citations: [
        '2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization (Circulation 2022;145:e18-e114)',
        '2023 ESC Guidelines for the management of acute coronary syndromes (Eur Heart J 2023;44:3720-3826)',
        'DANAMI-2 Trial: Superiority of primary PCI over fibrinolysis in acute STEMI (NEJM 2003;349:733-742)'
      ],
      crossSpecialtyAlerts: [
        'Interventional Cardiology: Emergent radial access preferred over femoral to minimize major bleeding mortality.'
      ],
      auditRisk: 'None'
    };
  }

  // --------------------------------------------------------------------------
  // Rule 2: Unhydrated High-Contrast Catheterization in CKD Stage 3b-5
  // --------------------------------------------------------------------------
  const isCkd = condition.includes('ckd') || condition.includes('kidney') || condition.includes('renal') || (egfr !== null && egfr < 45);
  const isUnhydratedContrast = treatment.includes('unhydrated') || (treatment.includes('contrast') && treatment.includes('unhydrated')) || treatment.includes('high-contrast');

  if (isCkd && isUnhydratedContrast) {
    return {
      recommendationClass: 'Class III: Harm',
      levelOfEvidence: 'Level B-R',
      appropriatenessScore: 1,
      guidelineBody: 'KDIGO 2023 Clinical Practice Guideline for Acute Kidney Injury / Contrast-Associated AKI',
      summary: 'Administering iodinated intravascular contrast media without volume expansion in patients with eGFR < 45 mL/min/1.73m² (CKD Stage 3b) confers high risk of contrast-induced acute kidney injury (CI-AKI) and dialysis.',
      citations: [
        'KDIGO 2023 Clinical Practice Guideline for Acute Kidney Injury / CI-AKI Prevention (Kidney Int 2023)',
        'PRESERVE Trial: Outcomes after Angiography with Sodium Bicarbonate and Acetylcysteine (NEJM 2018;378:603-614)',
        'AMACING Trial: Prophylactic hydration vs no hydration in high-risk patients receiving iodinated contrast (Lancet 2017;389:1312-1322)'
      ],
      crossSpecialtyAlerts: [
        'Nephrology KDIGO Alert: Patient eGFR (' + (egfr || 35) + ' mL/min/1.73m²) represents Stage 3b CKD. Intravenous volume expansion with isotonic sodium chloride (1.0-1.5 mL/kg/h for 3-12h pre- and 6-12h post-procedure) is mandatory. Minimize contrast volume to ratio of Contrast Volume (mL) / eGFR < 3.0.'
      ],
      auditRisk: 'High'
    };
  }

  // --------------------------------------------------------------------------
  // Rule 3: Heart Failure with Reduced Ejection Fraction (HFrEF) & Quadruple GDMT
  // --------------------------------------------------------------------------
  const isHf = condition.includes('heart failure') || condition.includes('hfref') || condition.includes('reduced ejection') || (lvef !== null && lvef <= 40);
  const isQuadrupleGdmt = treatment.includes('quadruple') || treatment.includes('arni') || treatment.includes('sglt2') || treatment.includes('mra') || treatment.includes('gdmt');

  if (isHf && isQuadrupleGdmt) {
    return {
      recommendationClass: 'Class I: Strong',
      levelOfEvidence: 'Level A',
      appropriatenessScore: 9,
      guidelineBody: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure & 2023 ESC Focused Update',
      summary: 'In patients with HFrEF (LVEF <= 40%), quadruple guideline-directed medical therapy (GDMT) comprising ARNI/ACEi, evidence-based beta-blocker, MRA, and SGLT2 inhibitor reduces all-cause cardiovascular death and heart failure hospitalization.',
      citations: [
        'DAPA-HF Trial: Dapagliflozin in Patients with Heart Failure and Reduced Ejection Fraction (NEJM 2019;381:1995-2008)',
        'PARADIGM-HF Trial: Angiotensin-Neprilysin Inhibition versus Enalapril in Heart Failure (NEJM 2014;371:993-1004)',
        'EMPEROR-Reduced Trial: Cardiovascular and Renal Outcomes with Empagliflozin in Heart Failure (NEJM 2020;383:1413-1424)',
        '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure (Circulation 2022;145:e895-e1032)'
      ],
      crossSpecialtyAlerts: [
        'Cardiology & Nephrology: Monitor serum creatinine and potassium 1-2 weeks after starting ARNI and MRA. Mild eGFR dip (<30%) upon initiating SGLT2i is hemodynamic and expected.'
      ],
      auditRisk: 'None'
    };
  }

  // --------------------------------------------------------------------------
  // Rule 4: Stable CAD / Chronic Coronary Disease - Routine Immediate Stenting without GDMT Trial
  // --------------------------------------------------------------------------
  const isStableCad = condition.includes('stable') || condition.includes('chronic coronary') || condition.includes('ccs') || condition.includes('cad');
  const isRoutineStentingWithoutGdmt = treatment.includes('without trial of gdmt') ||
    treatment.includes('without prior gdmt') ||
    treatment.includes('routine immediate stenting') ||
    (treatment.includes('stent') && !treatment.includes('gdmt') && !treatment.includes('stemi') && !treatment.includes('acs'));

  if (isStableCad && isRoutineStentingWithoutGdmt) {
    return {
      recommendationClass: 'Class III: No Benefit / Harm',
      levelOfEvidence: 'Level A',
      appropriatenessScore: 2,
      guidelineBody: 'ACC/AHA/SCAI 2021 Coronary Revascularization & 2024 ESC Chronic Coronary Syndromes Guidelines',
      summary: 'In patients with stable chronic coronary disease and single or multi-vessel disease without refractory angina or left main disease, routine immediate revascularization by PCI provides no reduction in myocardial infarction or death compared to initial optimal medical therapy (GDMT).',
      citations: [
        'ISCHEMIA Trial: Initial Invasive vs. Conservative Strategy for Stable Coronary Disease (NEJM 2020;382:1395-1407)',
        'ORBITA Trial: Percutaneous coronary intervention in stable angina - a randomised, double-blind, sham-controlled trial (Lancet 2017;390:2325-2340)',
        'ORBITA-2 Trial: A Placebo-Controlled Trial of PCI for Stable Angina Off Antianginal Medications (NEJM 2023;389:1419-1429)',
        'COURAGE Trial: Optimal Medical Therapy with or without PCI for Stable Coronary Artery Disease (NEJM 2007;356:1503-1516)'
      ],
      crossSpecialtyAlerts: [
        'Quality & Payer Compliance: Inappropriate revascularization without documentation of refractory CCS angina class III-IV despite maximal tolerated anti-anginal pharmacotherapy triggers immediate audit clawback under US AUC and Singapore MOH Fee Benchmarks.'
      ],
      auditRisk: 'High'
    };
  }

  // --------------------------------------------------------------------------
  // Rule 5: Singapore MOH Fee Benchmarks / TOSP FFR Criteria
  // --------------------------------------------------------------------------
  if (ffr !== null && ffr > 0.80 && (treatment.includes('stent') || treatment.includes('pci'))) {
    return {
      recommendationClass: 'Class III: No Benefit',
      levelOfEvidence: 'Level A',
      appropriatenessScore: 1,
      guidelineBody: 'MOH Singapore Table of Surgical Procedures (TOSP) & FAME Trial Criteria',
      summary: 'Coronary revascularization of lesions with Fractional Flow Reserve (FFR) > 0.80 is hemodynamically non-significant. Stenting of non-ischemic lesions exposes patients to in-stent restenosis without prognostic or symptomatic benefit.',
      citations: [
        'FAME Trial: Fractional Flow Reserve versus Angiography for Multivessel Evaluation (NEJM 2009;360:213-224)',
        'FAME 2 Trial: Fractional Flow Reserve-Guided PCI plus Medical Therapy vs Medical Therapy Alone (NEJM 2012;367:991-1001)',
        'Ministry of Health Singapore (MOH) Table of Surgical Procedures (TOSP) & Private Healthcare Fee Benchmarks (2024 Scrutiny Standards)'
      ],
      crossSpecialtyAlerts: [
        'Singapore MOH Benchmark Scrutiny: Submitting claims for non-ischemic stenting (FFR ' + ffr + ' > 0.80) incurs mandatory audit review, MediShield Life claims denial, and clinic benchmark flag.'
      ],
      auditRisk: 'High'
    };
  }

  // --------------------------------------------------------------------------
  // Rule 6: Type 2 Diabetes with Cardiorenal Disease (ADA / EASD Guidelines)
  // --------------------------------------------------------------------------
  const isDiabetes = condition.includes('diabetes') || (hba1c !== null && hba1c >= 7.0);
  if (isDiabetes && (treatment.includes('sglt2') || treatment.includes('glp-1') || treatment.includes('glp1'))) {
    return {
      recommendationClass: 'Class I: Strong',
      levelOfEvidence: 'Level A',
      appropriatenessScore: 9,
      guidelineBody: 'ADA/EASD 2023 Consensus on Management of Hyperglycemia & Cardiorenal Risk',
      summary: 'In adults with type 2 diabetes and established atherosclerotic cardiovascular disease, heart failure, or chronic kidney disease, an SGLT2 inhibitor and/or GLP-1 receptor agonist with proven cardiovascular benefit is recommended independent of baseline HbA1c.',
      citations: [
        'EMPA-REG OUTCOME Trial: Empagliflozin, Cardiovascular Outcomes, and Mortality in Type 2 Diabetes (NEJM 2015;373:2117-2128)',
        'LEADER Trial: Liraglutide and Cardiovascular Outcomes in Type 2 Diabetes (NEJM 2016;375:311-322)',
        'ADA/EASD 2023 Consensus Statement on Management of Hyperglycemia in T2D (Diabetes Care 2023;46:e5-e27)'
      ],
      crossSpecialtyAlerts: [
        'Endocrinology: SGLT2i provides concurrent renal preservation, blood pressure reduction, and glycemic control.'
      ],
      auditRisk: 'None'
    };
  }

  // --------------------------------------------------------------------------
  // Default Guideline Evaluation
  // --------------------------------------------------------------------------
  return {
    recommendationClass: 'Class IIa: Moderate',
    levelOfEvidence: 'Level B-NR',
    appropriatenessScore: 6,
    guidelineBody: 'ACC/AHA & ESC Cardiovascular Guidelines Consolidated Index',
    summary: 'Clinical decision requires individualized Heart Team consideration, evaluating patient-specific anatomical complexity, functional ischemia, comorbidities, and patient values.',
    citations: [
      '2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization',
      '2024 ESC Guidelines for the Management of Chronic Coronary Syndromes'
    ],
    crossSpecialtyAlerts: [],
    auditRisk: 'Low'
  };
}

// ============================================================================
// Clinical Vignette Generator Engine
// ============================================================================

/**
 * Generates a structured clinical vignette.
 * 
 * @param {string|object} departmentOrParams Department name or parameter object
 * @param {string} [regime] Healthcare regime
 * @param {string} [complexity] Complexity level
 * @returns {object} Structured clinical vignette
 */
function generateClinicalVignette(departmentOrParams, regime, complexity) {
  let dept = 'Cath Lab';
  let reg = 'SINGAPORE';
  let comp = 'standard';

  if (departmentOrParams && typeof departmentOrParams === 'object') {
    dept = departmentOrParams.department || dept;
    reg = departmentOrParams.regime || reg;
    comp = departmentOrParams.complexity || comp;
  } else {
    if (departmentOrParams) dept = departmentOrParams;
    if (regime) reg = regime;
    if (complexity) comp = complexity;
  }

  const library = getVignettesLibrary();
  const normalizedDept = dept.toLowerCase().replace(/[^a-z0-9]/g, '');

  let matched = library.find(v => {
    const vDept = (v.department || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return vDept.includes(normalizedDept) || normalizedDept.includes(vDept);
  });

  if (!matched && library.length > 0) {
    matched = library[0];
  }

  if (matched) {
    const clone = JSON.parse(JSON.stringify(matched));
    clone.regime = reg;
    clone.complexity = comp;
    return clone;
  }

  // Fallback synthetic high-fidelity cardiology vignette
  return {
    id: 'CASE_SYNTHETIC_' + Date.now(),
    department: dept,
    title: '66yo M with Exertional Angina and 75% Proximal LAD Stenosis',
    patient: {
      name: 'Tan K.H.',
      age: 66,
      gender: 'M',
      sbp: 138,
      hr: 74,
      egfr: 42,
      hba1c: 7.6,
      lvef: 45,
      troponin: 'Negative',
      symptoms: 'CCS Class II exertional angina on moderate hill walking',
      ischemia: 'Moderate anterior wall ischemia on stress CMR',
      anatomy: '75% eccentric calcified stenosis in proximal LAD, normal LCx and RCA'
    },
    ecg: {
      summary: 'Normal sinus rhythm, 74 bpm, nonspecific anterior ST-T wave flattening',
      rate: 74,
      rhythm: 'Sinus Rhythm'
    },
    crossDiscipline: {
      nephrology: {
        flag: true,
        egfr: 42,
        contrastRisk: 'Moderate to High',
        note: 'Stage 3b CKD. Requires pre-hydration and strict contrast volume conservation.'
      },
      endocrinology: {
        flag: true,
        hba1c: 7.6,
        indication: 'T2D with CKD - SGLT2 inhibitor (Dapagliflozin 10mg) strongly indicated.'
      },
      cardiothoracic: {
        flag: false,
        syntaxScore: 18,
        heartTeamRequired: false,
        cabgPreferred: false
      }
    },
    choices: {
      CHOICE_GDMT: {
        id: 'CHOICE_GDMT',
        title: 'Trial of Quadruple Anti-Anginal GDMT + SGLT2i',
        description: 'Initiate high-intensity Statin, Bisoprolol 5mg, Aspirin 100mg, and Dapagliflozin 10mg. Defer invasive stenting per ISCHEMIA trial protocol.',
        gdmtPoints: 20,
        rvuPoints: 120,
        wastePoints: -100,
        margin: 450,
        complicationRisk: 'Very Low',
        auditRisk: 'None',
        trialReference: 'ISCHEMIA / ORBITA-2 trials'
      },
      CHOICE_INTERVENTION: {
        id: 'CHOICE_INTERVENTION',
        title: 'Immediate Drug-Eluting Stenting of Proximal LAD',
        description: 'Deploy 3.5 x 24mm DES with IVUS guidance under standard high-osmolar contrast load.',
        gdmtPoints: 2,
        rvuPoints: 1650,
        wastePoints: 850,
        margin: 2200,
        complicationRisk: 'Moderate (Contrast-induced nephropathy risk)',
        auditRisk: 'High',
        trialReference: 'Routine Invasive vs Conservative in Stable CAD'
      },
      CHOICE_COST_CONTAINMENT: {
        id: 'CHOICE_COST_CONTAINMENT',
        title: 'Ambulatory Tiered Workup with FFR Physiology',
        description: 'Physiological assessment with pressure wire (FFR/iFR). Stent only if FFR <= 0.80, with renal protective minimal-contrast protocol.',
        gdmtPoints: 12,
        rvuPoints: 600,
        wastePoints: 0,
        margin: 1200,
        complicationRisk: 'Low',
        auditRisk: 'Low',
        trialReference: 'FAME / RIPCORD pathways'
      }
    },
    regime: reg,
    complexity: comp
  };
}

// ============================================================================
// International Healthcare Tariff Benchmark Engine
// ============================================================================

/**
 * Computes procedural reimbursement, patient co-payments, and international comparisons.
 * 
 * @param {string|object} procedureTypeOrParams Procedure identifier or parameter object
 * @param {string} [countryId] Target healthcare regime code
 * @returns {object} Comprehensive tariff benchmarks
 */
function benchmarkInternationalTariff(procedureTypeOrParams, countryId) {
  let procedure = 'PCI_SINGLE_STENT';
  let targetCountry = 'SINGAPORE';

  if (procedureTypeOrParams && typeof procedureTypeOrParams === 'object') {
    procedure = procedureTypeOrParams.procedureType || procedure;
    targetCountry = procedureTypeOrParams.countryId || targetCountry;
  } else {
    if (procedureTypeOrParams) procedure = procedureTypeOrParams;
    if (countryId) targetCountry = countryId;
  }

  targetCountry = targetCountry.toUpperCase();

  // Reference base catalog
  const catalog = {
    PCI_3_STENT: { baseWP: 1500, qalyDefault: 0.08, name: 'Triple Vessel PCI Stenting' },
    PCI_SINGLE_STENT: { baseWP: 1000, qalyDefault: 0.07, name: 'Single Vessel PCI Stenting' },
    ELECTIVE_STENT: { baseWP: 900, qalyDefault: 0.04, name: 'Elective Coronary Stenting' },
    ANGIOGRAM: { baseWP: 500, qalyDefault: 0.02, name: 'Diagnostic Coronary Angiogram' },
    CABG: { baseWP: 3500, qalyDefault: 0.25, name: 'Coronary Artery Bypass Grafting' },
    GDMT_CONSULT: { baseWP: 200, qalyDefault: 0.06, name: 'GDMT Heart Failure Consult' }
  };

  const procInfo = catalog[procedure] || { baseWP: 1000, qalyDefault: 0.05, name: procedure };

  // Regime registry details
  const regimesData = policiesEngine && policiesEngine.REGIMES ? policiesEngine.REGIMES : {
    SINGAPORE: {
      id: 'SINGAPORE',
      name: 'Singapore',
      fullName: 'Singapore (3M / MediShield Life & Healthier SG)',
      flag: '🇸🇬',
      systemType: 'Mixed Multi-Payer (Medisave, MediShield Life, Medifund)',
      baseCoPay: 0.20,
      ffsMultiplier: 1.25,
      auditStrictness: 0.85,
      keyGuideline: 'MOH Table of Surgical Procedures (TOSP) & Fee Benchmarks'
    },
    UNITED_STATES: {
      id: 'UNITED_STATES',
      name: 'United States',
      fullName: 'United States (Fee-for-Service & Medicare/MA)',
      flag: '🇺🇸',
      systemType: 'Multi-Payer Commercial & Medicare FFS',
      baseCoPay: 0.20,
      ffsMultiplier: 2.10,
      auditStrictness: 0.90,
      keyGuideline: 'ACC/AHA Appropriate Use Criteria (AUC) & Payer Prior Auth'
    },
    UNITED_KINGDOM: {
      id: 'UNITED_KINGDOM',
      name: 'United Kingdom',
      fullName: 'United Kingdom (NHS / NICE Single-Payer)',
      flag: '🇬🇧',
      systemType: 'Beveridge Single-Payer NHS',
      baseCoPay: 0.0,
      ffsMultiplier: 0.65,
      auditStrictness: 0.95,
      keyGuideline: 'NICE Guidelines (CG95 / NG185) & Technology Appraisals'
    },
    SWEDEN: {
      id: 'SWEDEN',
      name: 'Sweden',
      fullName: 'Sweden (Decentralized Regional / Swedeheart)',
      flag: '🇸🇪',
      systemType: 'Decentralized Universal Nordic',
      baseCoPay: 0.08,
      ffsMultiplier: 0.80,
      auditStrictness: 0.88,
      keyGuideline: 'Swedeheart Quality Registry & Socialstyrelsen National Guidelines'
    },
    JAPAN: {
      id: 'JAPAN',
      name: 'Japan',
      fullName: 'Japan (Statutory Health Insurance / Shinryo Hoshu)',
      flag: '🇯🇵',
      systemType: 'Bismarck Statutory Health Insurance System (SHIS)',
      baseCoPay: 0.30,
      ffsMultiplier: 0.95,
      auditStrictness: 0.80,
      keyGuideline: 'MHLW Medical Fee Schedule (Shinryo Hoshu) & JCS Guidelines'
    },
    SOUTH_KOREA: {
      id: 'SOUTH_KOREA',
      name: 'South Korea',
      fullName: 'South Korea (NHIS & HIRA Scrutiny)',
      flag: '🇰🇷',
      systemType: 'Single-Payer NHIS with HIRA Review',
      baseCoPay: 0.20,
      ffsMultiplier: 1.15,
      auditStrictness: 0.95,
      keyGuideline: 'HIRA Reimbursement Criteria & Korean Circulation Society Guidelines'
    },
    TAIWAN: {
      id: 'TAIWAN',
      name: 'Taiwan',
      fullName: 'Taiwan (NHI Global Budget Floating Point)',
      flag: '🇹🇼',
      systemType: 'Single-Payer NHI Global Budget',
      baseCoPay: 0.10,
      ffsMultiplier: 0.85,
      auditStrictness: 0.85,
      keyGuideline: 'Taiwan NHI Point Value & Dual Review'
    },
    MALAYSIA: {
      id: 'MALAYSIA',
      name: 'Malaysia',
      fullName: 'Malaysia (Dual-Track Public MOH & Private)',
      flag: '🇲🇾',
      systemType: 'Dual-Tier Public / Private Healthcare',
      baseCoPay: 0.05,
      ffsMultiplier: 0.90,
      auditStrictness: 0.70,
      keyGuideline: 'Ministry of Health Clinical Practice Guidelines'
    },
    INDONESIA: {
      id: 'INDONESIA',
      name: 'Indonesia',
      fullName: 'Indonesia (BPJS Kesehatan & INA-CBGs)',
      flag: '🇮🇩',
      systemType: 'Single-Payer JKN / INA-CBG Bundled DRG',
      baseCoPay: 0.0,
      ffsMultiplier: 0.55,
      auditStrictness: 0.85,
      keyGuideline: 'BPJS Kesehatan INA-CBG Tariffs'
    }
  };

  const currentRegime = regimesData[targetCountry] || regimesData.SINGAPORE;

  // Compute tariff using engine or formula
  let reimbursedWP = Math.round(procInfo.baseWP * (currentRegime.ffsMultiplier || 1.0));
  let coPayPercent = Math.round((currentRegime.baseCoPay || 0.20) * 100);
  let patientCoPayWP = Math.round(reimbursedWP * (currentRegime.baseCoPay || 0.20));

  if (policiesEngine && typeof policiesEngine.computeProcedureTariff === 'function') {
    try {
      const calc = policiesEngine.computeProcedureTariff(procedure, targetCountry, { ward: 'B1', ipRider: false });
      if (calc) {
        reimbursedWP = calc.reimbursedWP;
        patientCoPayWP = calc.patientCoPayWP;
        coPayPercent = calc.coPayPercent;
      }
    } catch (e) {}
  }

  // Generate comparison across all regimes
  const comparisons = Object.keys(regimesData).map(key => {
    const r = regimesData[key];
    const rReimbursed = Math.round(procInfo.baseWP * (r.ffsMultiplier || 1.0));
    const rCoPayPercent = Math.round((r.baseCoPay || 0.20) * 100);
    const rCoPayWP = Math.round(rReimbursed * (r.baseCoPay || 0.20));
    return {
      countryId: r.id,
      countryName: r.name,
      flag: r.flag,
      systemType: r.systemType,
      reimbursedWP: rReimbursed,
      patientCoPayWP: rCoPayWP,
      coPayPercent: rCoPayPercent,
      auditStrictness: r.auditStrictness,
      keyGuideline: r.keyGuideline
    };
  });

  return {
    procedureType: procedure,
    procedureName: procInfo.name,
    countryId: currentRegime.id,
    regime: currentRegime,
    reimbursedWP,
    patientCoPayWP,
    coPayPercent,
    auditStrictness: currentRegime.auditStrictness,
    keyGuideline: currentRegime.keyGuideline,
    regulatoryAuditNotes: 'Reimbursement under ' + currentRegime.fullName + ' entails ' +
      Math.round(currentRegime.auditStrictness * 100) + '% audit rigor. Mandatory adherence to ' +
      currentRegime.keyGuideline + '.',
    comparisons
  };
}

// ============================================================================
// Model Context Protocol (MCP) JSON-RPC 2.0 Router
// ============================================================================

const MCP_TOOLS = [
  {
    name: 'evaluate_guideline_indication',
    description: 'Evaluates clinical cases and planned cardiac interventions against international practice guidelines (ACC/AHA, ESC, KDIGO, ADA/EASD, and Singapore MOH Fee Benchmarks). Returns recommendation class (I, IIa, IIb, III), level of evidence, trial citations (e.g. ISCHEMIA, ORBITA, DAPA-HF), and cross-specialty safety alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        condition: {
          type: 'string',
          description: 'Primary clinical condition or diagnosis (e.g. Stable Chronic Coronary Disease, Acute STEMI, HFrEF, CKD Stage 3b).'
        },
        treatment: {
          type: 'string',
          description: 'Planned procedure or pharmacotherapy (e.g. Routine Immediate Stenting without trial of GDMT, Emergency Primary PCI, Quadruple GDMT).'
        },
        anatomy: {
          type: 'string',
          description: 'Coronary anatomical lesion details (e.g. 75% proximal LAD, 3-vessel disease).'
        },
        ischemiaSeverity: {
          type: 'string',
          description: 'Severity of functional ischemia (None, Mild, Moderate, Severe).'
        },
        egfr: {
          type: 'number',
          description: 'Estimated Glomerular Filtration Rate in mL/min/1.73m² (triggers KDIGO contrast alerts if < 45).'
        },
        lvef: {
          type: 'number',
          description: 'Left Ventricular Ejection Fraction percentage (triggers HFrEF guideline rules if <= 40).'
        },
        ffr: {
          type: 'number',
          description: 'Fractional Flow Reserve measurement (triggers MOH Singapore benchmark clawback if > 0.80).'
        },
        regime: {
          type: 'string',
          description: 'Healthcare system regime code (e.g. SINGAPORE, UNITED_STATES, UNITED_KINGDOM).'
        }
      },
      required: ['condition', 'treatment']
    }
  },
  {
    name: 'generate_clinical_vignette',
    description: 'Generates an authentic cardiology clinical vignette with patient demographics, vitals, 12-lead ECG interpretation, cross-disciplinary alerts (Nephrology, Endocrinology, Heart Team), and tri-choice decision options (GDMT vs Intervention vs Cost-Containment).',
    inputSchema: {
      type: 'object',
      properties: {
        department: {
          type: 'string',
          description: 'Hospital department or diagnostic suite (e.g. Cath Lab, ECG room, Consultation room, Emergency Room).'
        },
        regime: {
          type: 'string',
          description: 'Healthcare policy regime (e.g. SINGAPORE, UNITED_STATES, UNITED_KINGDOM, SWEDEN, JAPAN, SOUTH_KOREA, TAIWAN, MALAYSIA, INDONESIA).'
        },
        complexity: {
          type: 'string',
          description: 'Case complexity level (standard, intermediate, high).'
        }
      }
    }
  },
  {
    name: 'benchmark_international_tariff',
    description: 'Benchmarks procedural reimbursement, patient co-payments, and audit scrutiny across 9 international healthcare systems (Singapore 3M, US Fee-for-Service, UK NHS Beveridge, Sweden Nordic, Japan SHIS, South Korea HIRA, Taiwan Global Budget, Malaysia Dual-Track, Indonesia BPJS).',
    inputSchema: {
      type: 'object',
      properties: {
        procedureType: {
          type: 'string',
          description: 'Procedure code (e.g. PCI_SINGLE_STENT, PCI_3_STENT, ELECTIVE_STENT, ANGIOGRAM, CABG, GDMT_CONSULT).'
        },
        countryId: {
          type: 'string',
          description: 'Target country code (e.g. SINGAPORE, UNITED_STATES, UNITED_KINGDOM, SWEDEN, JAPAN, SOUTH_KOREA, TAIWAN, MALAYSIA, INDONESIA).'
        }
      },
      required: ['procedureType']
    }
  }
];

/**
 * Handles incoming JSON-RPC 2.0 message according to MCP specification.
 * 
 * @param {string|object} message Raw or parsed JSON-RPC request
 * @returns {object} JSON-RPC response object
 */
function handleJsonRpcMessage(message) {
  let req;
  if (typeof message === 'string') {
    try {
      req = JSON.parse(message);
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: Invalid JSON' }
      };
    }
  } else {
    req = message;
  }

  if (!req || typeof req !== 'object') {
    return {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32600, message: 'Invalid Request: Expected object' }
    };
  }

  const { jsonrpc, id, method, params } = req;

  // Handle standard MCP methods
  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: id !== undefined ? id : 1,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'cardiopoly-mcp-server',
            version: '1.0.0'
          },
          capabilities: {
            tools: {}
          }
        }
      };

    case 'notifications/initialized':
      return null;

    case 'ping':
      return {
        jsonrpc: '2.0',
        id: id !== undefined ? id : 1,
        result: {}
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: id !== undefined ? id : 1,
        result: {
          tools: MCP_TOOLS
        }
      };

    case 'tools/call': {
      if (!params || !params.name) {
        return {
          jsonrpc: '2.0',
          id: id !== undefined ? id : 1,
          error: { code: -32602, message: 'Invalid params: tool name required' }
        };
      }

      const toolName = params.name;
      const args = params.arguments || {};

      try {
        let output;
        if (toolName === 'evaluate_guideline_indication') {
          output = evaluateGuideline(args);
        } else if (toolName === 'generate_clinical_vignette') {
          output = generateClinicalVignette(args);
        } else if (toolName === 'benchmark_international_tariff') {
          output = benchmarkInternationalTariff(args);
        } else {
          return {
            jsonrpc: '2.0',
            id: id !== undefined ? id : 1,
            error: { code: -32601, message: 'Method not found: unknown tool ' + toolName }
          };
        }

        return {
          jsonrpc: '2.0',
          id: id !== undefined ? id : 1,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(output, null, 2)
              }
            ]
          }
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id: id !== undefined ? id : 1,
          result: {
            content: [
              {
                type: 'text',
                text: 'Error executing ' + toolName + ': ' + (err.message || String(err))
              }
            ],
            isError: true
          }
        };
      }
    }

    default:
      return {
        jsonrpc: '2.0',
        id: id !== undefined ? id : 1,
        error: { code: -32601, message: 'Method not found: ' + method }
      };
  }
}

// ============================================================================
// Stdio CLI Server Loop (for direct MCP execution)
// ============================================================================

function startStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    line = line.trim();
    if (!line) return;

    // Handle Content-Length headers if present in stream
    if (line.toLowerCase().startsWith('content-length:')) return;
    if (line.startsWith('{')) {
      const response = handleJsonRpcMessage(line);
      if (response !== null) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  });

  process.stderr.write('Cardiopoly MCP Medical Guideline Server listening on stdio...\n');
}

if (require.main === module) {
  startStdioServer();
}

// Export module interface for tests and programmatic usage
module.exports = {
  evaluateGuideline,
  generateClinicalVignette,
  benchmarkInternationalTariff,
  handleJsonRpcMessage,
  MCP_TOOLS
};
