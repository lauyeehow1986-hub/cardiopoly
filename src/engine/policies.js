/**
 * Cardiopoly - 9-Nation Healthcare Policy Engine (Including Singapore 3M)
 * 
 * Implements international healthcare financing systems and audit mechanisms:
 * 1. Singapore (3M: Medisave, MediShield Life, Medifund + Healthier SG)
 * 2. United States (Commercial Fee-for-Service & Medicare RVUs + Prior Auth)
 * 3. United Kingdom (NHS Beveridge Single-Payer + NICE QALY Thresholds)
 * 4. Sweden (Decentralized Regional Nordic + Swedeheart Quality Registry)
 * 5. Japan (Statutory Health Insurance SHIS + Shinryo Hoshu Biennial Tariffs)
 * 6. South Korea (NHIS Single-Payer + HIRA Big Data Retrospective Clawbacks)
 * 7. Taiwan (NHI Single-Payer + Macro Global Budget Floating Point)
 * 8. Malaysia (Dual-Track Heavily Subsidized Public MOH & Private Tourism)
 * 9. Indonesia (BPJS Kesehatan Single-Payer + INA-CBG Bundled DRG Caps)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyPolicies = exports;
    root.REGIMES = exports.REGIMES;
    root.getRegime = exports.getRegime;
    root.computeProcedureTariff = exports.computeProcedureTariff;
    root.evaluateAuditScrutiny = exports.evaluateAuditScrutiny;
    root.applyRegimePolicyCard = exports.applyRegimePolicyCard;
    root.rotateNextRegime = exports.rotateNextRegime;
    root.getRegimeMultiplier = exports.getRegimeMultiplier;
    root.updateRegimeBadge = exports.updateRegimeBadge;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Complete dictionary of 9 national healthcare policy regimes.
   */
  var REGIMES = {
    SINGAPORE: {
      id: 'SINGAPORE',
      name: 'Singapore',
      fullName: 'Singapore (3M / MediShield Life & Healthier SG)',
      flag: '🇸🇬',
      systemType: 'Mixed Multi-Payer (Medisave, MediShield Life, Medifund)',
      baseCoPay: 0.20,
      classACoPayWithRider: 0.05,
      ffsMultiplier: 1.25,
      rentMultiplier: 1.05,
      auditStrictness: 0.85,
      mohBenchmarkLimit: 0.80,
      capitationBonusWP: 250,
      keyGuideline: 'MOH Table of Surgical Procedures (TOSP) & Fee Benchmarks',
      description: 'Individual responsibility via Medisave accounts and MediShield Life catastrophic coverage. Integrated Shield Plans (IP) with private riders cover private Class A care with mandatory 5% co-pay. MOH Fee Benchmarks strictly scrutinize unindicated revascularization (FFR > 0.80).'
    },
    UNITED_STATES: {
      id: 'UNITED_STATES',
      name: 'United States',
      fullName: 'United States (Fee-for-Service & Medicare/MA)',
      flag: '🇺🇸',
      systemType: 'Multi-Payer Commercial & Medicare FFS',
      baseCoPay: 0.20,
      classACoPayWithRider: 0.15,
      ffsMultiplier: 2.10,
      rentMultiplier: 1.50,
      auditStrictness: 0.90,
      priorAuthRequired: true,
      keyGuideline: 'ACC/AHA Appropriate Use Criteria (AUC) & Payer Prior Auth',
      description: 'High procedural RVU reimbursement under fee-for-service, but insurers aggressively audit and claw back claims lacking pre-authorized clinical indications (Prior Authorization).'
    },
    UNITED_KINGDOM: {
      id: 'UNITED_KINGDOM',
      name: 'United Kingdom',
      fullName: 'United Kingdom (NHS / NICE Single-Payer)',
      flag: '🇬🇧',
      systemType: 'Beveridge Single-Payer NHS',
      baseCoPay: 0.0,
      classACoPayWithRider: 0.0,
      ffsMultiplier: 0.65,
      rentMultiplier: 0.70,
      auditStrictness: 0.95,
      qalyThreshold: 0.03,
      keyGuideline: 'NICE Guidelines (CG95 / NG185) & Technology Appraisals',
      description: 'Universal healthcare free at the point of delivery (0% co-pay). Strict National Institute for Health and Care Excellence (NICE) cost-effectiveness thresholds block elective procedures with low QALY gains (< 0.03).'
    },
    SWEDEN: {
      id: 'SWEDEN',
      name: 'Sweden',
      fullName: 'Sweden (Decentralized Regional / Swedeheart)',
      flag: '🇸🇪',
      systemType: 'Decentralized Universal Nordic',
      baseCoPay: 0.08,
      classACoPayWithRider: 0.08,
      ffsMultiplier: 0.80,
      rentMultiplier: 0.80,
      auditStrictness: 0.88,
      oopMaxCap: 150,
      swedeheartRegistryAudit: true,
      keyGuideline: 'Swedeheart Quality Registry & Socialstyrelsen National Guidelines',
      description: 'Universal regional county healthcare with annual out-of-pocket maximum caps (Högkostnadsskydd). Real-time nationwide registry tracking (Swedeheart) flags clinical deviations.'
    },
    JAPAN: {
      id: 'JAPAN',
      name: 'Japan',
      fullName: 'Japan (Statutory Health Insurance / Shinryo Hoshu)',
      flag: '🇯🇵',
      systemType: 'Bismarck Statutory Health Insurance System (SHIS)',
      baseCoPay: 0.30,
      classACoPayWithRider: 0.20,
      ffsMultiplier: 0.95,
      rentMultiplier: 0.90,
      auditStrictness: 0.80,
      highCostCapWP: 800,
      keyGuideline: 'MHLW Medical Fee Schedule (Shinryo Hoshu) & JCS Guidelines',
      description: 'Universal coverage with uniform biennial national fee schedule and statutory 30% co-pay, capped on a monthly basis by the High-Cost Medical Expense Benefit (Kogaku Ryoyohi).'
    },
    SOUTH_KOREA: {
      id: 'SOUTH_KOREA',
      name: 'South Korea',
      fullName: 'South Korea (NHIS & HIRA Scrutiny)',
      flag: '🇰🇷',
      systemType: 'Single-Payer NHIS with HIRA Review',
      baseCoPay: 0.20,
      classACoPayWithRider: 0.15,
      ffsMultiplier: 1.15,
      rentMultiplier: 1.00,
      auditStrictness: 0.95,
      hiraClawbackThreshold: 0.80,
      keyGuideline: 'HIRA Reimbursement Criteria & Korean Circulation Society Guidelines',
      description: 'Single-payer national health insurance with advanced diagnostic tech adoption, policed by Health Insurance Review and Assessment Service (HIRA) automated big data audits and retrospective multi-stent clawbacks.'
    },
    TAIWAN: {
      id: 'TAIWAN',
      name: 'Taiwan',
      fullName: 'Taiwan (NHI Global Budget Floating Point)',
      flag: '🇹🇼',
      systemType: 'Single-Payer NHI Global Budget',
      baseCoPay: 0.10,
      classACoPayWithRider: 0.10,
      ffsMultiplier: 0.85,
      rentMultiplier: 0.85,
      auditStrictness: 0.82,
      floatingPointDiscount: 0.82,
      keyGuideline: 'Taiwan NHI Medical Service Payment Standards & Global Budget Cap',
      description: 'Universal smart-card single-payer NHI. Total national expenditures are constrained by a macro Global Budget: when national volume surges exceed spending caps, point reimbursement floats downward (e.g. 0.82 WP/point).'
    },
    MALAYSIA: {
      id: 'MALAYSIA',
      name: 'Malaysia',
      fullName: 'Malaysia (Dual-Track Public MOH & Private)',
      flag: '🇲🇾',
      systemType: 'Dual-Tier Public / Private Healthcare',
      baseCoPay: 0.05,
      classACoPayWithRider: 0.25,
      ffsMultiplier: 0.90,
      rentMultiplier: 0.85,
      auditStrictness: 0.70,
      publicSubsidizedFlatWP: 50,
      keyGuideline: 'Ministry of Health Clinical Practice Guidelines & Private Healthcare Act',
      description: 'Dichotomous system featuring heavily subsidized public hospitals (RM1 outpatient visits) coexisting alongside a rapidly expanding private medical tourism sector billing market fees.'
    },
    INDONESIA: {
      id: 'INDONESIA',
      name: 'Indonesia',
      fullName: 'Indonesia (BPJS Kesehatan & INA-CBGs)',
      flag: '🇮🇩',
      systemType: 'Single-Payer JKN / INA-CBG Bundled DRG',
      baseCoPay: 0.0,
      classACoPayWithRider: 0.0,
      ffsMultiplier: 0.55,
      rentMultiplier: 0.60,
      auditStrictness: 0.85,
      bundledFlatCapWP: 650,
      inaCbgCode: 'I-4-10-I',
      keyGuideline: 'BPJS Kesehatan INA-CBG Tariffs & Formularium Nasional (Fornas)',
      description: 'Universal social health insurance (BPJS Kesehatan) under JKN. Reimburses procedures via bundled INA-CBG case-based flat tariffs (e.g. 650 WP ceiling), requiring hospitals to absorb device costs and extra stents.'
    }
  };

  /**
   * Alias mapping for flexible nation resolution.
   */
  var REGIME_ALIASES = {
    SG: 'SINGAPORE',
    SINGAPORE: 'SINGAPORE',
    US: 'UNITED_STATES',
    USA: 'UNITED_STATES',
    UNITED_STATES: 'UNITED_STATES',
    UK: 'UNITED_KINGDOM',
    GB: 'UNITED_KINGDOM',
    UNITED_KINGDOM: 'UNITED_KINGDOM',
    SE: 'SWEDEN',
    SWEDEN: 'SWEDEN',
    JP: 'JAPAN',
    JAPAN: 'JAPAN',
    KR: 'SOUTH_KOREA',
    KOREA: 'SOUTH_KOREA',
    SOUTH_KOREA: 'SOUTH_KOREA',
    TW: 'TAIWAN',
    TAIWAN: 'TAIWAN',
    MY: 'MALAYSIA',
    MALAYSIA: 'MALAYSIA',
    ID: 'INDONESIA',
    INDONESIA: 'INDONESIA'
  };

  var REGIME_ORDER = [
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

  var PROCEDURE_BASE_CATALOG = {
    PCI_3_STENT: { baseWP: 1500, qalyDefault: 0.08, name: 'Triple Vessel PCI Stenting' },
    PCI_SINGLE_STENT: { baseWP: 1000, qalyDefault: 0.07, name: 'Single Vessel PCI Stenting' },
    ELECTIVE_STENT: { baseWP: 900, qalyDefault: 0.04, name: 'Elective Coronary Stenting' },
    ANGIOGRAM: { baseWP: 500, qalyDefault: 0.02, name: 'Diagnostic Coronary Angiogram' },
    CABG: { baseWP: 3500, qalyDefault: 0.25, name: 'Coronary Artery Bypass Grafting' },
    GDMT_CONSULT: { baseWP: 200, qalyDefault: 0.06, name: 'GDMT Heart Failure Consult' }
  };

  /**
   * Resolve canonical regime object by ID or alias.
   * @param {string} countryId
   * @returns {object} Regime configuration
   */
  function getRegime(countryId) {
    if (!countryId || typeof countryId !== 'string') {
      return REGIMES.SINGAPORE;
    }
    var normalized = countryId.trim().toUpperCase();
    var canonicalKey = REGIME_ALIASES[normalized] || (REGIMES[normalized] ? normalized : 'SINGAPORE');
    return REGIMES[canonicalKey] || REGIMES.SINGAPORE;
  }

  /**
   * Computes reimbursement and patient co-payment for clinical procedures under the specified regime.
   * 
   * @param {string} procedureType Procedure identifier (e.g. 'PCI_3_STENT', 'ELECTIVE_STENT')
   * @param {string} countryId Target regime country code/alias
   * @param {object} context Clinical/setting context: { ward, ipRider, qalyGain, volumeRatio, ffr, ... }
   * @returns {object} { approved, reimbursedWP, patientCoPayWP, coPayPercent, regime, ... }
   */
  function computeProcedureTariff(procedureType, countryId, context) {
    var regime = getRegime(countryId);
    var ctx = context || {};
    var proc = PROCEDURE_BASE_CATALOG[procedureType] || { baseWP: 600, qalyDefault: 0.05, name: procedureType || 'Procedure' };
    var baseCost = typeof ctx.baseWP === 'number' ? ctx.baseWP : proc.baseWP;

    // 1. UK (NHS Single-Payer): Strict NICE QALY threshold gate
    if (regime.id === 'UNITED_KINGDOM') {
      var qalyGain = typeof ctx.qalyGain === 'number' ? ctx.qalyGain : proc.qalyDefault;
      var threshold = typeof regime.qalyThreshold === 'number' ? regime.qalyThreshold : 0.03;
      if (qalyGain < threshold) {
        return {
          approved: false,
          reimbursedWP: 0,
          patientCoPayWP: 0,
          coPayPercent: 0,
          regime: regime.id,
          reason: 'NICE health technology appraisal: QALY gain (' + qalyGain.toFixed(2) + ') fails required threshold (>=' + threshold + ') for NHS funding.',
          tariffDescription: 'Procedure not commissioned by NHS due to insufficient cost-effectiveness.'
        };
      }
      var ukTariff = Math.round(baseCost * regime.ffsMultiplier);
      return {
        approved: true,
        reimbursedWP: ukTariff,
        patientCoPayWP: 0,
        coPayPercent: 0.0,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'NHS commissioned procedure: 100% tax-funded with zero patient co-pay at point of care.'
      };
    }

    // 2. Indonesia (BPJS Kesehatan): INA-CBG bundled flat DRG cap
    if (regime.id === 'INDONESIA') {
      var bundledCap = regime.bundledFlatCapWP || 650;
      return {
        approved: true,
        reimbursedWP: bundledCap,
        patientCoPayWP: 0,
        coPayPercent: 0.0,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'INA-CBG bundled flat cap of ' + bundledCap + ' WP applied under BPJS Kesehatan JKN single-payer coverage.'
      };
    }

    // 3. Taiwan: Macro Global Budget with floating point devaluation on volume surges
    if (regime.id === 'TAIWAN') {
      var volumeRatio = typeof ctx.volumeRatio === 'number' ? ctx.volumeRatio : 1.0;
      var pointVal = 1.0;
      var isDevalued = false;
      if (volumeRatio > 1.0 || ctx.excessVolume) {
        pointVal = regime.floatingPointDiscount || 0.82;
        isDevalued = true;
      }
      var twReimbursed = Math.round(baseCost * regime.ffsMultiplier * pointVal);
      var twCoPayRate = regime.baseCoPay;
      var twCoPayWP = Math.round(twReimbursed * twCoPayRate);
      return {
        approved: true,
        reimbursedWP: twReimbursed,
        patientCoPayWP: twCoPayWP,
        coPayPercent: twCoPayRate,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: isDevalued
          ? 'Taiwan NHI Global Budget: Floating Point devalued to ' + pointVal + ' due to national quarterly volume overflow.'
          : 'Taiwan NHI Global Budget standard point reimbursement.'
      };
    }

    // 4. Singapore (3M: Medisave + MediShield Life + Private IP Rider)
    if (regime.id === 'SINGAPORE') {
      var sgReimbursed = Math.round(baseCost * regime.ffsMultiplier);
      var sgCoPay = regime.baseCoPay; // 20% standard subsidized ward
      var isClassA = ctx.ward === 'CLASS_A';
      var hasRider = Boolean(ctx.ipRider);

      if (isClassA && hasRider) {
        // Integrated Shield Plan (IP) with private rider mandates 5% minimum co-pay
        sgCoPay = regime.classACoPayWithRider || 0.05;
      } else if (isClassA) {
        sgCoPay = 0.15;
      } else if (ctx.ward === 'CLASS_B2' || ctx.ward === 'CLASS_C') {
        sgCoPay = regime.baseCoPay;
      }

      var sgPatientWP = Math.round(sgReimbursed * sgCoPay);
      return {
        approved: true,
        reimbursedWP: sgReimbursed,
        patientCoPayWP: sgPatientWP,
        coPayPercent: sgCoPay,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: (isClassA && hasRider)
          ? 'Singapore Class A private ward billed with Integrated Shield Plan (IP) rider at mandatory 5% co-pay.'
          : 'Singapore 3M subsidized ward tariff with Medisave/MediShield Life co-payment.'
      };
    }

    // 5. United States (FFS / Medicare / Commercial Insurance)
    if (regime.id === 'UNITED_STATES') {
      var usReimbursed = Math.round(baseCost * regime.ffsMultiplier);
      var usCoPayRate = regime.baseCoPay;
      var usCoPayWP = Math.round(usReimbursed * usCoPayRate);
      return {
        approved: true,
        reimbursedWP: usReimbursed,
        patientCoPayWP: usCoPayWP,
        coPayPercent: usCoPayRate,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'US Fee-for-Service commercial/Medicare procedural RVU tariff.'
      };
    }

    // 6. Sweden (Nordic Decentralized with Högkostnadsskydd Out-of-Pocket Cap)
    if (regime.id === 'SWEDEN') {
      var seReimbursed = Math.round(baseCost * regime.ffsMultiplier);
      var seRawCoPay = Math.round(seReimbursed * regime.baseCoPay);
      var seCoPayWP = Math.min(seRawCoPay, regime.oopMaxCap || 150);
      return {
        approved: true,
        reimbursedWP: seReimbursed,
        patientCoPayWP: seCoPayWP,
        coPayPercent: regime.baseCoPay,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'Sweden regional universal healthcare with Högkostnadsskydd out-of-pocket maximum protection.'
      };
    }

    // 7. Japan (Bismarck Statutory SHIS + High-Cost Expense Cap)
    if (regime.id === 'JAPAN') {
      var jpReimbursed = Math.round(baseCost * regime.ffsMultiplier);
      var jpRawCoPay = Math.round(jpReimbursed * regime.baseCoPay);
      var jpCoPayWP = Math.min(jpRawCoPay, regime.highCostCapWP || 800);
      return {
        approved: true,
        reimbursedWP: jpReimbursed,
        patientCoPayWP: jpCoPayWP,
        coPayPercent: regime.baseCoPay,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'Japan Statutory Health Insurance uniform fee schedule with High-Cost Medical Expense Benefit cap.'
      };
    }

    // 8. South Korea (NHIS Single-Payer)
    if (regime.id === 'SOUTH_KOREA') {
      var krReimbursed = Math.round(baseCost * regime.ffsMultiplier);
      var krCoPayWP = Math.round(krReimbursed * regime.baseCoPay);
      return {
        approved: true,
        reimbursedWP: krReimbursed,
        patientCoPayWP: krCoPayWP,
        coPayPercent: regime.baseCoPay,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: 'South Korea NHIS statutory procedural tariff.'
      };
    }

    // 9. Malaysia (Dual-Track Public/Private)
    if (regime.id === 'MALAYSIA') {
      var isPublic = ctx.sector === 'PUBLIC';
      var myReimbursed = isPublic ? (regime.publicSubsidizedFlatWP || 50) : Math.round(baseCost * regime.ffsMultiplier);
      var myCoPayRate = isPublic ? regime.baseCoPay : (regime.classACoPayWithRider || 0.25);
      var myCoPayWP = Math.round(myReimbursed * myCoPayRate);
      return {
        approved: true,
        reimbursedWP: myReimbursed,
        patientCoPayWP: myCoPayWP,
        coPayPercent: myCoPayRate,
        regime: regime.id,
        regimeName: regime.name,
        flag: regime.flag,
        tariffDescription: isPublic
          ? 'Malaysia MOH heavily subsidized public hospital rate.'
          : 'Malaysia private medical center commercial tariff.'
      };
    }

    // General fallback
    var defReimbursed = Math.round(baseCost * (regime.ffsMultiplier || 1.0));
    var defCoPayRate = regime.baseCoPay || 0.20;
    return {
      approved: true,
      reimbursedWP: defReimbursed,
      patientCoPayWP: Math.round(defReimbursed * defCoPayRate),
      coPayPercent: defCoPayRate,
      regime: regime.id,
      regimeName: regime.name,
      flag: regime.flag,
      tariffDescription: 'Standard baseline procedural tariff.'
    };
  }

  /**
   * Evaluates regulatory audit scrutiny and potential clawbacks for clinical interventions.
   * 
   * @param {string} procedureType Procedure code
   * @param {string} countryId Nation regime code
   * @param {object} clinicalContext { ffr, priorAuth, stentCount, qalyGain, ... }
   * @returns {object} { flagged: boolean, clawbackWP: number, reason: string, auditor: string, regime: string }
   */
  function evaluateAuditScrutiny(procedureType, countryId, clinicalContext) {
    var regime = getRegime(countryId);
    var ctx = clinicalContext || {};

    var auditResult = {
      flagged: false,
      clawbackWP: 0,
      reason: '',
      auditor: '',
      regime: regime.id
    };

    // 1. Singapore: MOH Fee Benchmark violation on non-ischemic FFR (> 0.80)
    if (regime.id === 'SINGAPORE') {
      var mohLimit = typeof regime.mohBenchmarkLimit === 'number' ? regime.mohBenchmarkLimit : 0.80;
      if (typeof ctx.ffr === 'number' && ctx.ffr > mohLimit) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 1800;
        auditResult.auditor = 'Singapore MOH Claims Review Committee';
        auditResult.reason = 'MOH Fee Benchmark & Clinical Appropriateness violation: Stenting physiologically non-ischemic vessel (FFR ' + ctx.ffr + ' > ' + mohLimit + '). Overutilization sanction applied.';
        return auditResult;
      }
    }

    // 2. United States: Unindicated procedure lacking Prior Authorization
    if (regime.id === 'UNITED_STATES') {
      if (ctx.priorAuth === false) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 2500;
        auditResult.auditor = 'Commercial Payer Utilization Management & Recovery Audit Contractor (RAC)';
        auditResult.reason = 'Commercial payer claim denied: Catheterization procedure performed without mandatory Prior Authorization.';
        return auditResult;
      }
      if (typeof ctx.ffr === 'number' && ctx.ffr > 0.80 && !ctx.highRiskIschemia) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 2000;
        auditResult.auditor = 'CMS Recovery Audit Contractor';
        auditResult.reason = 'ACC/AHA Appropriate Use Criteria violation: Elective intervention lacking documented ischemia.';
        return auditResult;
      }
    }

    // 3. South Korea: HIRA clawback for off-guideline multi-stent usage
    if (regime.id === 'SOUTH_KOREA') {
      var hiraThreshold = typeof regime.hiraClawbackThreshold === 'number' ? regime.hiraClawbackThreshold : 0.80;
      var hasHighFfr = typeof ctx.ffr === 'number' && ctx.ffr > hiraThreshold;
      var hasExcessStents = typeof ctx.stentCount === 'number' && ctx.stentCount > 2;

      if (hasHighFfr || hasExcessStents) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 1600;
        auditResult.auditor = 'Health Insurance Review and Assessment Service (HIRA)';
        auditResult.reason = 'HIRA retrospective clawback: Automated claims cross-referencing flagged unindicated stent placement beyond reimbursement guidelines.';
        return auditResult;
      }
    }

    // 4. United Kingdom: NICE guideline non-compliance
    if (regime.id === 'UNITED_KINGDOM') {
      if (typeof ctx.qalyGain === 'number' && ctx.qalyGain < (regime.qalyThreshold || 0.03)) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 1000;
        auditResult.auditor = 'Care Quality Commission & NICE Trust Audit';
        auditResult.reason = 'NICE Clinical Audit sanction: Intervention failed cost-effective health gain benchmark.';
        return auditResult;
      }
    }

    // 5. Sweden: Swedeheart registry mismatch
    if (regime.id === 'SWEDEN') {
      if (ctx.swedeheartRegistryDiscrepancy) {
        auditResult.flagged = true;
        auditResult.clawbackWP = 1200;
        auditResult.auditor = 'Swedeheart National Quality Registry Audit';
        auditResult.reason = 'Swedeheart registry audit: Guideline deviation in procedural indication recorded.';
        return auditResult;
      }
    }

    return auditResult;
  }

  /**
   * Applies a national policy shift card to the game state.
   * 
   * @param {object|string} stateOrRegime Game state or regime ID
   * @param {string|object} regimeOrState Regime ID or game state
   * @returns {object} Shift metadata
   */
  function applyRegimePolicyCard(stateOrRegime, regimeOrState) {
    var state = stateOrRegime;
    var targetRegimeId = regimeOrState;
    if (typeof stateOrRegime === 'string' && typeof regimeOrState === 'object') {
      state = regimeOrState;
      targetRegimeId = stateOrRegime;
    }

    var regime = getRegime(targetRegimeId);
    if (state && typeof state === 'object') {
      state.currentRegime = regime.id;
    }

    updateRegimeBadge(regime.id);

    return {
      success: true,
      regime: regime,
      announcement: 'GLOBAL HEALTH POLICY SHIFT: Active regime is now ' + regime.flag + ' ' + regime.name + ' (' + regime.systemType + ')!'
    };
  }

  /**
   * Rotates game state to the next country regime in sequential order.
   * 
   * @param {object} gameState
   * @returns {object} Shift metadata
   */
  function rotateNextRegime(gameState) {
    var currentId = (gameState && gameState.currentRegime) ? getRegime(gameState.currentRegime).id : 'SINGAPORE';
    var currentIndex = REGIME_ORDER.indexOf(currentId);
    var nextIndex = (currentIndex + 1) % REGIME_ORDER.length;
    var nextRegimeId = REGIME_ORDER[nextIndex];
    return applyRegimePolicyCard(gameState, nextRegimeId);
  }

  /**
   * Returns economic modifier multipliers (e.g. RENT, FFS, AUDIT) for a nation regime.
   * 
   * @param {string} countryId
   * @param {string} actionType 'RENT' | 'FFS' | 'PROCEDURE' | 'AUDIT'
   * @returns {number} Multiplier
   */
  function getRegimeMultiplier(countryId, actionType) {
    var regime = getRegime(countryId);
    var action = (actionType || '').toUpperCase();
    if (action === 'RENT') {
      return typeof regime.rentMultiplier === 'number' ? regime.rentMultiplier : 1.0;
    }
    if (action === 'FFS' || action === 'PROCEDURE' || action === 'PURCHASE') {
      return typeof regime.ffsMultiplier === 'number' ? regime.ffsMultiplier : 1.0;
    }
    if (action === 'AUDIT' || action === 'SCRUTINY') {
      return typeof regime.auditStrictness === 'number' ? regime.auditStrictness : 1.0;
    }
    return 1.0;
  }

  /**
   * Updates the DOM regime badge element (#telemetry-regime-badge) if present.
   * 
   * @param {string} countryId
   */
  function updateRegimeBadge(countryId) {
    if (typeof document === 'undefined') return;
    var badge = document.getElementById('telemetry-regime-badge');
    if (!badge) return;
    var regime = getRegime(countryId);
    badge.textContent = regime.flag + ' ' + regime.name;
    badge.setAttribute('title', regime.fullName + '\n\n' + regime.description);
    badge.setAttribute('data-regime-id', regime.id);
  }

  return {
    REGIMES: REGIMES,
    REGIME_ORDER: REGIME_ORDER,
    getRegime: getRegime,
    computeProcedureTariff: computeProcedureTariff,
    evaluateAuditScrutiny: evaluateAuditScrutiny,
    applyRegimePolicyCard: applyRegimePolicyCard,
    rotateNextRegime: rotateNextRegime,
    getRegimeMultiplier: getRegimeMultiplier,
    updateRegimeBadge: updateRegimeBadge
  };
}));
