/**
 * Cardiopoly - Clinical Case Vignette Decision Encounter Engine
 * 
 * Provides interactive medical scenario encounters mapped to hospital departments.
 * Presents a tri-choice encounter (GDMT vs Intervention vs Cost-Containment)
 * incorporating cross-disciplinary clinical trade-offs:
 * - Nephrology: eGFR cardiorenal contrast nephropathy alert
 * - Endocrinology: SGLT2i / GLP-1 RA metabolic guidelines
 * - Cardiothoracic Surgery: Multidisciplinary Heart Team (CABG vs PCI / TAVR)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyVignettes = exports;
    root.loadVignettes = exports.loadVignettes;
    root.getAllVignettes = exports.getAllVignettes;
    root.getVignetteByDepartment = exports.getVignetteByDepartment;
    root.getVignetteByTileIndex = exports.getVignetteByTileIndex;
    root.getVignetteForTile = exports.getVignetteForTile;
    root.resolveVignetteDecision = exports.resolveVignetteDecision;
    root.getBotVignetteChoice = exports.getBotVignetteChoice;
    root.showVignetteModal = exports.showVignetteModal;
    root.closeVignetteModal = exports.closeVignetteModal;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var _cachedVignettes = null;

  /**
   * Loads the clinical case vignettes library.
   * Reads from data/vignettes.json in Node.js or uses cached/embedded data in browser.
   *
   * @returns {Array<Object>} List of clinical scenario objects
   */
  function loadVignettes() {
    if (_cachedVignettes && _cachedVignettes.length > 0) {
      return _cachedVignettes;
    }

    if (typeof require !== 'undefined' && typeof __dirname !== 'undefined') {
      try {
        var fs = require('fs');
        var path = require('path');
        var jsonPath = path.join(__dirname, '..', '..', 'data', 'vignettes.json');
        if (fs.existsSync(jsonPath)) {
          var parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          _cachedVignettes = Array.isArray(parsed) ? parsed : (parsed.vignettes || []);
          return _cachedVignettes;
        }
      } catch (err) {
        // Fall back to embedded list
      }
    }

    if (typeof window !== 'undefined' && window.__CARDIOPOLY_VIGNETTES__) {
      _cachedVignettes = window.__CARDIOPOLY_VIGNETTES__;
      return _cachedVignettes;
    }

    // Default embedded fallback library covering hospital departments
    _cachedVignettes = getEmbeddedVignettes();
    return _cachedVignettes;
  }

  /**
   * Returns all loaded vignettes.
   *
   * @returns {Array<Object>}
   */
  function getAllVignettes() {
    return loadVignettes();
  }

  /**
   * Normalizes a text string for case-insensitive, whitespace-trimmed comparison.
   */
  function normalizeKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Look up a vignette by department name.
   *
   * @param {string} departmentName
   * @returns {Object|null}
   */
  function getVignetteByDepartment(departmentName) {
    var list = loadVignettes();
    if (!departmentName) return list.length > 0 ? list[0] : null;

    var targetKey = normalizeKey(departmentName);

    // Exact or normalized match
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.department && normalizeKey(item.department) === targetKey) {
        return item;
      }
    }

    // Secondary match: correspondsTo (e.g. "north carolina avenue")
    for (var j = 0; j < list.length; j++) {
      var item2 = list[j];
      if (item2.correspondsTo && normalizeKey(item2.correspondsTo) === targetKey) {
        return item2;
      }
    }

    // Partial substring match
    for (var k = 0; k < list.length; k++) {
      var item3 = list[k];
      var deptNorm = normalizeKey(item3.department || '');
      if (deptNorm && (deptNorm.indexOf(targetKey) !== -1 || targetKey.indexOf(deptNorm) !== -1)) {
        return item3;
      }
    }

    // Fallback: return default scenario
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Look up a vignette by board tile index (0..39).
   *
   * @param {number} tileIndex
   * @returns {Object|null}
   */
  function getVignetteByTileIndex(tileIndex) {
    var list = loadVignettes();
    for (var i = 0; i < list.length; i++) {
      if (list[i].tileIndex === tileIndex) {
        return list[i];
      }
    }
    return null;
  }

  /**
   * Look up scenario for a given tile object.
   *
   * @param {Object} tile
   * @returns {Object|null}
   */
  function getVignetteForTile(tile) {
    if (!tile) return null;
    if (tile.name) {
      var found = getVignetteByDepartment(tile.name);
      if (found) return found;
    }
    if (typeof tile.index === 'number') {
      var foundIndex = getVignetteByTileIndex(tile.index);
      if (foundIndex) return foundIndex;
    }
    if (tile.correspondsTo) {
      return getVignetteByDepartment(tile.correspondsTo);
    }
    return loadVignettes()[0] || null;
  }

  /**
   * Normalizes choice identifier to canonical key.
   */
  function canonicalizeChoiceId(choiceId) {
    if (!choiceId) return 'CHOICE_GDMT';
    var upper = String(choiceId).trim().toUpperCase();
    if (upper === 'CHOICE_GDMT' || upper === 'GDMT') return 'CHOICE_GDMT';
    if (upper === 'CHOICE_INTERVENTION' || upper === 'CHOICE_STENT' || upper === 'INTERVENTION' || upper === 'STENT') return 'CHOICE_INTERVENTION';
    if (upper === 'CHOICE_COST_CONTAINMENT' || upper === 'CHOICE_OBSERVATION' || upper === 'COST_CONTAINMENT' || upper === 'OBSERVATION') return 'CHOICE_COST_CONTAINMENT';
    return upper;
  }

  /**
   * Resolves consequences of a clinical decision on a scenario.
   *
   * @param {Object} scenario - Scenario object
   * @param {string} choiceId - 'CHOICE_GDMT' | 'CHOICE_INTERVENTION' | 'CHOICE_COST_CONTAINMENT' (or 'CHOICE_STENT')
   * @param {string|Object} [playerFaction] - Faction ID string or Player object
   * @param {string|Object} [countryRegime] - National policy regime
   * @returns {Object} Calculated clinical & financial outcomes
   */
  function resolveVignetteDecision(scenario, choiceId, playerFaction, countryRegime) {
    var s = scenario || (loadVignettes()[0]);
    var canonicalKey = canonicalizeChoiceId(choiceId);
    var choiceData = (s.choices && s.choices[canonicalKey]) ? s.choices[canonicalKey] : (s.choices ? (s.choices.CHOICE_GDMT || {}) : {});

    // Normalize factionId
    var factionId = '';
    if (typeof playerFaction === 'string') {
      factionId = playerFaction;
    } else if (playerFaction && playerFaction.factionId) {
      factionId = playerFaction.factionId;
    } else if (playerFaction && playerFaction.faction && playerFaction.faction.id) {
      factionId = playerFaction.faction.id;
    }

    // Normalize regime
    var regimeId = 'SINGAPORE';
    var ffsMultiplier = 1.0;
    var auditStrictness = 0.85;
    var capitationBonus = 0;

    if (typeof countryRegime === 'string') {
      regimeId = countryRegime.toUpperCase();
    } else if (countryRegime && countryRegime.id) {
      regimeId = countryRegime.id.toUpperCase();
      if (typeof countryRegime.ffsMultiplier === 'number') ffsMultiplier = countryRegime.ffsMultiplier;
      if (typeof countryRegime.auditStrictness === 'number') auditStrictness = countryRegime.auditStrictness;
      if (typeof countryRegime.capitationBonusWP === 'number') capitationBonus = countryRegime.capitationBonusWP;
    }

    if (typeof CardiopolyPolicies !== 'undefined' && CardiopolyPolicies.getRegime) {
      var fullRegime = CardiopolyPolicies.getRegime(regimeId);
      if (fullRegime) {
        ffsMultiplier = fullRegime.ffsMultiplier || 1.0;
        auditStrictness = fullRegime.auditStrictness || 0.85;
        capitationBonus = fullRegime.capitationBonusWP || 0;
      }
    }

    var patient = s.patient || { egfr: 60, sbp: 130, age: 60 };
    var patientEGFR = typeof patient.egfr === 'number' ? patient.egfr : 60;
    var isLowEGFR = patientEGFR < 45;

    // Base values from choiceData
    var baseGDMT = typeof choiceData.gdmtPoints === 'number' ? choiceData.gdmtPoints : 10;
    var baseRVU = typeof choiceData.rvuPoints === 'number' ? choiceData.rvuPoints : 200;
    var baseWaste = typeof choiceData.wastePoints === 'number' ? choiceData.wastePoints : 50;
    var baseMargin = typeof choiceData.margin === 'number' ? choiceData.margin : 500;
    var compRisk = choiceData.complicationRisk || 'Low';

    var nephroContrastAlert = false;
    var auditFlag = false;
    var complicationOccurred = false;
    var factionBonus = {};
    var sbpDelta = 0;
    var summary = '';

    if (canonicalKey === 'CHOICE_GDMT') {
      compRisk = 'Low';
      complicationOccurred = false;
      sbpDelta = -4; // Guideline medical therapy lowers blood pressure safely

      // Academic Clinician faction bonus
      if (factionId === 'ACADEMIC_CLINICIAN') {
        var gdmtBonus = 6;
        baseGDMT += gdmtBonus;
        factionBonus.gdmtBonus = gdmtBonus;
        factionBonus.badge = 'Academic Guideline Bonus';
      }

      // Singapore Capitation / Healthier SG prevention bonus
      if (regimeId.includes('SINGAPORE') || capitationBonus > 0) {
        baseWaste -= 50; // extra waste reduction from capitation
      }

      summary = 'Prescribed optimal Guideline-Directed Medical Therapy. Complication risk is minimized, advancing patient health.';
    } else if (canonicalKey === 'CHOICE_INTERVENTION') {
      // Intervention awards high RVUs but generates procedural waste
      if (isLowEGFR) {
        nephroContrastAlert = true;
        baseWaste += 150; // Contrast load & nephrology hydration protocol adds procedural waste
      }

      // Regime procedural tariffs
      baseRVU = Math.round(baseRVU * ffsMultiplier);
      baseMargin = Math.round(baseMargin * (ffsMultiplier > 1 ? 1.2 : 0.9));

      // Interventionalist faction bonus
      if (factionId === 'INTERVENTIONALIST') {
        var rvuBonus = 400;
        baseRVU += rvuBonus;
        factionBonus.rvuBonus = rvuBonus;
        factionBonus.badge = 'High-Volume Cath Operator Bonus';
      }

      // Scrutiny check: if unindicated or mild ischemia, audit risk triggers under high strictness
      if (auditStrictness > 0.85 && (s.patient && s.patient.ischemia === 'Mild')) {
        auditFlag = true;
        baseWaste += 200; // audit penalty
      }

      sbpDelta = +2; // Acute procedural stress
      summary = isLowEGFR
        ? 'Invasive intervention performed. CONTRAST ALERT: eGFR < 45 required nephro-protection hydration.'
        : 'Invasive intervention completed successfully with high procedural RVU yield.';
    } else if (canonicalKey === 'CHOICE_COST_CONTAINMENT') {
      auditFlag = false;
      compRisk = 'Low';
      complicationOccurred = false;

      // Hospital CEO faction bonus
      if (factionId === 'HOSPITAL_CEO') {
        var marginBonus = 750;
        baseMargin += marginBonus;
        factionBonus.marginBonus = marginBonus;
        factionBonus.badge = 'Service-Line Margin Expansion';
      }

      sbpDelta = -1;
      summary = 'Cost-containment outpatient observation protocol activated. Hospital margin expanded, zero audit exposure.';
    }

    return {
      scenarioId: s.id,
      department: s.department,
      choiceId: canonicalKey,
      choiceTitle: choiceData.title || canonicalKey,
      choiceDescription: choiceData.description || '',
      gdmtPoints: baseGDMT,
      rvuPoints: baseRVU,
      wastePoints: baseWaste,
      margin: baseMargin,
      sbpDelta: sbpDelta,
      complicationRisk: compRisk,
      complicationOccurred: complicationOccurred,
      nephroContrastAlert: nephroContrastAlert,
      auditFlag: auditFlag,
      auditRisk: choiceData.auditRisk || 'None',
      trialReference: choiceData.trialReference || '',
      crossDisciplineFlags: s.crossDiscipline || {},
      factionBonus: factionBonus,
      summary: summary,
      theme: canonicalKey === 'CHOICE_GDMT' ? 'success' : (canonicalKey === 'CHOICE_INTERVENTION' ? (isLowEGFR ? 'warning' : 'event') : 'auction')
    };
  }

  /**
   * Selects a rational vignette choice for a bot player based on their faction archetype.
   *
   * @param {Object} scenario - Scenario object
   * @param {Object} botPlayer - Bot player object with factionId
   * @param {string|Object} countryRegime - National regime
   * @returns {string} 'CHOICE_GDMT' | 'CHOICE_INTERVENTION' | 'CHOICE_COST_CONTAINMENT'
   */
  function getBotVignetteChoice(scenario, botPlayer, countryRegime) {
    var factionId = '';
    if (typeof botPlayer === 'string') {
      factionId = botPlayer;
    } else if (botPlayer && botPlayer.factionId) {
      factionId = botPlayer.factionId;
    } else if (botPlayer && botPlayer.faction && botPlayer.faction.id) {
      factionId = botPlayer.faction.id;
    }

    switch (factionId) {
      case 'ACADEMIC_CLINICIAN':
        return 'CHOICE_GDMT';

      case 'INTERVENTIONALIST':
        return 'CHOICE_INTERVENTION';

      case 'HOSPITAL_CEO':
        return 'CHOICE_COST_CONTAINMENT';

      case 'REGULATORY_AUDITOR':
        // Auditors avoid high-waste invasive interventions
        return 'CHOICE_GDMT';

      default:
        // Default clinical triage heuristic
        if (scenario && scenario.patient && scenario.patient.ischemia === 'Severe') {
          return 'CHOICE_INTERVENTION';
        }
        if (scenario && scenario.patient && scenario.patient.egfr < 45) {
          return 'CHOICE_GDMT';
        }
        return 'CHOICE_GDMT';
    }
  }

  /**
   * Renders and displays the frosted-glass Clinical Case Vignette Encounter Modal.
   *
   * @param {Object} scenario - Clinical case scenario object
   * @param {Object} player - Current player object
   * @param {string|Object} countryRegime - Current healthcare policy regime
   * @param {Function} [onChoiceCallback] - Callback function invoked upon player choice
   * @returns {Promise<Object>} Resolves with { choiceId, decision }
   */
  function showVignetteModal(scenario, player, countryRegime, onChoiceCallback) {
    var s = scenario || loadVignettes()[0];
    var p = player || { name: 'Player', factionId: 'ACADEMIC_CLINICIAN' };
    var patient = s.patient || { name: 'Patient', age: 60, gender: 'M', sbp: 130, hr: 75, egfr: 60, hba1c: 6.5, troponin: 'Normal' };
    var ecg = s.ecg || { summary: 'Normal sinus rhythm', rate: 72, rhythm: 'Sinus Rhythm' };
    var cross = s.crossDiscipline || {};

    if (typeof document === 'undefined') {
      // Non-browser / Node testing environment
      var defaultDecision = resolveVignetteDecision(s, 'CHOICE_GDMT', p.factionId, countryRegime);
      if (typeof onChoiceCallback === 'function') {
        onChoiceCallback('CHOICE_GDMT', defaultDecision);
      }
      return Promise.resolve({ choiceId: 'CHOICE_GDMT', decision: defaultDecision });
    }

    return new Promise(function (resolve) {
      // Locate or create #vignette-modal
      var modal = document.getElementById('vignette-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vignette-modal';
        modal.className = 'vignette-modal-overlay';
        document.body.appendChild(modal);
      }

      // Cross-disciplinary tags markup
      var crossTagsHtml = '';
      if (cross.nephrology && cross.nephrology.flag) {
        crossTagsHtml += '<span class="cross-discipline-tag nephrology-tag" title="' + (cross.nephrology.note || '') + '">🫘 Nephrology: eGFR ' + patient.egfr + ' (CIN Alert)</span>';
      }
      if (cross.endocrinology && cross.endocrinology.flag) {
        crossTagsHtml += '<span class="cross-discipline-tag endocrinology-tag" title="' + (cross.endocrinology.indication || '') + '">🩸 Endo: HbA1c ' + (patient.hba1c || 'Elevated') + '% (SGLT2i Indicated)</span>';
      }
      if (cross.cardiothoracic && cross.cardiothoracic.flag) {
        var ctText = cross.cardiothoracic.cabgPreferred ? 'CABG Preferred (SYNTAX ' + cross.cardiothoracic.syntaxScore + ')' : 'Heart Team Consult';
        crossTagsHtml += '<span class="cross-discipline-tag cardiothoracic-tag" title="' + (cross.cardiothoracic.note || '') + '">🫀 Heart Team: ' + ctText + '</span>';
      }

      var choices = s.choices || {};
      var gdmt = choices.CHOICE_GDMT || {};
      var interv = choices.CHOICE_INTERVENTION || {};
      var cost = choices.CHOICE_COST_CONTAINMENT || {};

      var egfrClass = (patient.egfr < 45) ? 'vital-danger' : 'vital-normal';
      var sbpClass = (patient.sbp >= 140) ? 'vital-warning' : 'vital-normal';

      modal.innerHTML = [
        '<div class="vignette-modal-backdrop"></div>',
        '<div class="vignette-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="vignette-title">',
        '  <header class="vignette-header">',
        '    <div class="vignette-department-badge">',
        '      <span class="vignette-dept-icon">🏥</span> ' + (s.department || 'Clinical Encounter'),
        '    </div>',
        '    <h2 id="vignette-title" class="vignette-title">' + (s.title || 'Clinical Encounter') + '</h2>',
        '    <div class="vignette-meta-bar">',
        '      <span class="patient-id-badge">👤 ' + (patient.name || 'Patient') + ' (' + patient.age + 'yo ' + patient.gender + ')</span>',
        '      <span class="regime-badge-small">🌐 ' + (countryRegime && countryRegime.name ? countryRegime.name : (countryRegime || 'Singapore')) + '</span>',
        '    </div>',
        '  </header>',
        '  <div class="vignette-body">',
        '    <div class="vignette-patient-card">',
        '      <div class="vignette-vitals-strip">',
        '        <div class="vital-item ' + sbpClass + '"><span class="vital-lbl">BP</span><span class="vital-val">' + patient.sbp + ' mmHg</span></div>',
        '        <div class="vital-item"><span class="vital-lbl">HR</span><span class="vital-val">' + (patient.hr || 75) + ' bpm</span></div>',
        '        <div class="vital-item ' + egfrClass + '"><span class="vital-lbl">eGFR</span><span class="vital-val">' + patient.egfr + ' mL/min</span></div>',
        '        <div class="vital-item"><span class="vital-lbl">HbA1c</span><span class="vital-val">' + (patient.hba1c ? patient.hba1c + '%' : 'N/A') + '</span></div>',
        '        <div class="vital-item"><span class="vital-lbl">LVEF</span><span class="vital-val">' + (patient.lvef ? patient.lvef + '%' : 'Normal') + '</span></div>',
        '      </div>',
        '      <div class="vignette-ecg-summary">',
        '        <span class="ecg-lead-badge">ECG</span> <span class="ecg-strip-text">⚡ ' + ecg.summary + '</span>',
        '      </div>',
        '      <p class="vignette-presentation-text"><strong>Presentation:</strong> ' + (patient.symptoms || '') + ' ' + (patient.anatomy ? ' — <em>' + patient.anatomy + '</em>' : '') + '</p>',
        crossTagsHtml ? '      <div class="cross-discipline-strip">' + crossTagsHtml + '</div>' : '',
        '    </div>',
        '    <div class="vignette-choices-grid">',
        '      <!-- CHOICE 1: GDMT -->',
        '      <div class="vignette-choice-card choice-gdmt" data-choice="CHOICE_GDMT" tabindex="0">',
        '        <div class="choice-header">',
        '          <span class="choice-tag gdmt-tag">GDMT PROTOCOL</span>',
        '          <span class="choice-risk low-risk">Risk: Low</span>',
        '        </div>',
        '        <h3 class="choice-title">' + (gdmt.title || 'Guideline-Directed Medical Therapy') + '</h3>',
        '        <p class="choice-desc">' + (gdmt.description || 'Quadruple medical therapy & lifestyle optimization.') + '</p>',
        '        <div class="choice-metrics-preview">',
        '          <span class="metric-pill pill-cyan">+15 GDMT Points</span>',
        '          <span class="metric-pill pill-emerald">-50 Waste</span>',
        '          <span class="metric-ref">' + (gdmt.trialReference || 'ISCHEMIA / Class I') + '</span>',
        '        </div>',
        '        <button class="choice-select-btn btn-gdmt">Select GDMT</button>',
        '      </div>',
        '      <!-- CHOICE 2: INTERVENTION -->',
        '      <div class="vignette-choice-card choice-intervention" data-choice="CHOICE_INTERVENTION" tabindex="0">',
        '        <div class="choice-header">',
        '          <span class="choice-tag interv-tag">INVASIVE CATH / STENT</span>',
        '          <span class="choice-risk ' + (patient.egfr < 45 ? 'high-risk' : 'mod-risk') + '">Risk: ' + (patient.egfr < 45 ? 'High (CIN)' : 'Moderate') + '</span>',
        '        </div>',
        '        <h3 class="choice-title">' + (interv.title || 'Immediate Invasive Intervention') + '</h3>',
        '        <p class="choice-desc">' + (interv.description || 'Perform catheterization and stent deployment.') + '</p>',
        '        <div class="choice-metrics-preview">',
        '          <span class="metric-pill pill-crimson">+1,800 RVUs</span>',
        '          <span class="metric-pill pill-warning">+750 Waste</span>',
        '          <span class="metric-ref">' + (interv.trialReference || 'High-Yield RVU') + '</span>',
        '        </div>',
        '        <button class="choice-select-btn btn-interv">Select Intervention</button>',
        '      </div>',
        '      <!-- CHOICE 3: COST CONTAINMENT -->',
        '      <div class="vignette-choice-card choice-cost" data-choice="CHOICE_COST_CONTAINMENT" tabindex="0">',
        '        <div class="choice-header">',
        '          <span class="choice-tag cost-tag">COST CONTAINMENT</span>',
        '          <span class="choice-risk low-risk">Audit Flag: None</span>',
        '        </div>',
        '        <h3 class="choice-title">' + (cost.title || 'Observation & Cost-Containment') + '</h3>',
        '        <p class="choice-desc">' + (cost.description || 'Outpatient short-stay and generic medical management.') + '</p>',
        '        <div class="choice-metrics-preview">',
        '          <span class="metric-pill pill-gold">+2,500 Margin</span>',
        '          <span class="metric-pill pill-neutral">+15 Waste</span>',
        '          <span class="metric-ref">' + (cost.trialReference || 'Value-Based Care') + '</span>',
        '        </div>',
        '        <button class="choice-select-btn btn-cost">Select Cost Control</button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      modal.classList.add('visible');

      // Bind click handlers to cards and buttons
      var cards = modal.querySelectorAll('.vignette-choice-card');
      var onChoiceSelected = function (choiceId) {
        var decision = resolveVignetteDecision(s, choiceId, p.factionId, countryRegime);
        closeVignetteModal();
        if (typeof onChoiceCallback === 'function') {
          onChoiceCallback(choiceId, decision);
        }
        resolve({ choiceId: choiceId, decision: decision });
      };

      cards.forEach(function (card) {
        var choiceId = card.getAttribute('data-choice');
        card.addEventListener('click', function () {
          onChoiceSelected(choiceId);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChoiceSelected(choiceId);
          }
        });
      });
    });
  }

  /**
   * Closes the active vignette modal dialog.
   */
  function closeVignetteModal() {
    if (typeof document === 'undefined') return;
    var modal = document.getElementById('vignette-modal');
    if (modal) {
      modal.classList.remove('visible');
    }
  }

  /**
   * Fallback embedded library of 28 authentic scenarios matching hospital departments.
   */
  function getEmbeddedVignettes() {
    return [
      {
        id: "CASE_ECG_ROOM",
        department: "ECG room",
        tileIndex: 1,
        correspondsTo: "mediterranean avenue",
        title: "58yo F with Atrial Fibrillation and Rapid Ventricular Response",
        patient: { name: "Evelyn R.", age: 58, gender: "F", sbp: 128, hr: 134, egfr: 65, hba1c: 6.8, troponin: "Negative", symptoms: "Palpitations for 4 hours" },
        ecg: { summary: "Atrial Fibrillation with RVR, rate 134 bpm", rate: 134, rhythm: "Atrial Fibrillation" },
        crossDiscipline: { nephrology: { flag: false, egfr: 65 }, endocrinology: { flag: false, hba1c: 6.8 }, cardiothoracic: { flag: false } },
        choices: {
          CHOICE_GDMT: { id: "CHOICE_GDMT", title: "Rate & DOAC Anticoagulation", gdmtPoints: 14, rvuPoints: 120, wastePoints: -40, margin: 350, complicationRisk: "Low" },
          CHOICE_INTERVENTION: { id: "CHOICE_INTERVENTION", title: "Urgent TEE & Synchronized Cardioversion", gdmtPoints: 3, rvuPoints: 1450, wastePoints: 550, margin: 1800, complicationRisk: "Moderate" },
          CHOICE_COST_CONTAINMENT: { id: "CHOICE_COST_CONTAINMENT", title: "Outpatient Diltiazem & Observation", gdmtPoints: 6, rvuPoints: 180, wastePoints: 10, margin: 2400, complicationRisk: "Low" }
        }
      },
      {
        id: "CASE_TROPONIN_CUBICLE",
        department: "Troponin cubicle",
        tileIndex: 11,
        correspondsTo: "st. charles place",
        title: "66yo F with Dynamic High-Sensitivity Troponin I and Chest Pressure",
        patient: { name: "Maria C.", age: 66, gender: "F", sbp: 142, hr: 80, egfr: 41, hba1c: 8.8, troponin: "840 ng/L", symptoms: "Retrosternal tightness" },
        ecg: { summary: "Sinus rhythm, 1mm ST depression in V4-V6", rate: 80, rhythm: "Sinus Rhythm with ST depression" },
        crossDiscipline: { nephrology: { flag: true, egfr: 41, note: "Stage 3b CKD - CIN alert" }, endocrinology: { flag: true, hba1c: 8.8, indication: "T2D SGLT2i" }, cardiothoracic: { flag: false } },
        choices: {
          CHOICE_GDMT: { id: "CHOICE_GDMT", title: "ACS Medical Protocol (DAPT + Statin)", gdmtPoints: 16, rvuPoints: 220, wastePoints: -40, margin: 600, complicationRisk: "Low" },
          CHOICE_INTERVENTION: { id: "CHOICE_INTERVENTION", title: "Urgent PCI Stenting with Hydration", gdmtPoints: 5, rvuPoints: 2100, wastePoints: 820, margin: 2400, complicationRisk: "Moderate" },
          CHOICE_COST_CONTAINMENT: { id: "CHOICE_COST_CONTAINMENT", title: "Short-Stay Unit Observation", gdmtPoints: 7, rvuPoints: 350, wastePoints: 40, margin: 2900, complicationRisk: "Moderate" }
        }
      },
      {
        id: "CASE_RADIAL_RECOVERY",
        department: "Radial recovery lounge",
        tileIndex: 18,
        correspondsTo: "tennessee avenue",
        title: "63yo F with Severe Radial Artery Spasm Post-PCI",
        patient: { name: "Elena V.", age: 63, gender: "F", sbp: 134, hr: 72, egfr: 56, hba1c: 6.9, troponin: "Normal", symptoms: "Severe forearm pain" },
        ecg: { summary: "Normal sinus rhythm, 72 bpm", rate: 72, rhythm: "Normal Sinus" },
        crossDiscipline: { nephrology: { flag: false, egfr: 56 }, endocrinology: { flag: false }, cardiothoracic: { flag: false } },
        choices: {
          CHOICE_GDMT: { id: "CHOICE_GDMT", title: "Sublingual Nitroglycerin & Warm Compress", gdmtPoints: 15, rvuPoints: 90, wastePoints: -40, margin: 320, complicationRisk: "Low" },
          CHOICE_INTERVENTION: { id: "CHOICE_INTERVENTION", title: "Emergency Brachial Angiogram & Recannulation", gdmtPoints: 2, rvuPoints: 1350, wastePoints: 700, margin: 1750, complicationRisk: "Moderate" },
          CHOICE_COST_CONTAINMENT: { id: "CHOICE_COST_CONTAINMENT", title: "Gradual TR Band Titration & Same-Day Discharge", gdmtPoints: 8, rvuPoints: 150, wastePoints: 15, margin: 2600, complicationRisk: "Low" }
        }
      },
      {
        id: "CASE_OCULOSTENOTIC",
        department: "Oculostenotic space",
        tileIndex: 32,
        correspondsTo: "north carolina avenue",
        title: "62yo M with 75% Mid-LAD Stenosis, FFR 0.83, and Mild CCS II Angina",
        patient: { name: "Robert T.", age: 62, gender: "M", sbp: 146, hr: 72, egfr: 42, hba1c: 8.6, troponin: "Negative", symptoms: "Class II Angina", ischemia: "Mild" },
        ecg: { summary: "Sinus rhythm, 1mm ST depression in V4-V6", rate: 72, rhythm: "Sinus Rhythm" },
        crossDiscipline: { nephrology: { flag: true, egfr: 42, note: "Contrast Alert" }, endocrinology: { flag: true, hba1c: 8.6, indication: "SGLT2i" }, cardiothoracic: { flag: false } },
        choices: {
          CHOICE_GDMT: { id: "CHOICE_GDMT", title: "Guideline-Directed Medical Therapy (GDMT)", gdmtPoints: 18, rvuPoints: 120, wastePoints: -60, margin: 450, complicationRisk: "Low" },
          CHOICE_INTERVENTION: { id: "CHOICE_INTERVENTION", title: "Oculostenotic Stenting (DES)", gdmtPoints: 1, rvuPoints: 1950, wastePoints: 950, margin: 2400, complicationRisk: "Moderate" },
          CHOICE_COST_CONTAINMENT: { id: "CHOICE_COST_CONTAINMENT", title: "Outpatient Lifestyle and Generic Anti-Anginal", gdmtPoints: 9, rvuPoints: 180, wastePoints: 20, margin: 2900, complicationRisk: "Low" }
        }
      },
      {
        id: "CASE_TRIPLE_PRESSOR",
        department: "Triple-pressor area",
        tileIndex: 37,
        correspondsTo: "park place",
        title: "73yo M in Refractory Cardiogenic Shock on Norepi, Vaso, & Dobutamine",
        patient: { name: "Vincent K.", age: 73, gender: "M", sbp: 82, hr: 118, egfr: 32, hba1c: 7.2, troponin: "4800 ng/L", symptoms: "Shock post-anterior STEMI", ischemia: "Severe" },
        ecg: { summary: "Sinus tachycardia, 4mm ST elevation V1-V4", rate: 118, rhythm: "Anterior STEMI" },
        crossDiscipline: { nephrology: { flag: true, egfr: 32, note: "Cardiorenal shock eGFR 32" }, endocrinology: { flag: false }, cardiothoracic: { flag: true, syntaxScore: 28, heartTeamRequired: true } },
        choices: {
          CHOICE_GDMT: { id: "CHOICE_GDMT", title: "Hemodynamic Inodilator De-escalation", gdmtPoints: 15, rvuPoints: 500, wastePoints: -50, margin: 650, complicationRisk: "Moderate" },
          CHOICE_INTERVENTION: { id: "CHOICE_INTERVENTION", title: "Percutaneous Mechanical Circulatory Support (Impella)", gdmtPoints: 8, rvuPoints: 4200, wastePoints: 800, margin: 5200, complicationRisk: "High" },
          CHOICE_COST_CONTAINMENT: { id: "CHOICE_COST_CONTAINMENT", title: "Standard Medical Vasopressor Escalation", gdmtPoints: 5, rvuPoints: 600, wastePoints: 150, margin: 3200, complicationRisk: "High" }
        }
      }
    ];
  }

  var exp = {
    loadVignettes: loadVignettes,
    getAllVignettes: getAllVignettes,
    getVignetteByDepartment: getVignetteByDepartment,
    getVignetteByTileIndex: getVignetteByTileIndex,
    getVignetteForTile: getVignetteForTile,
    resolveVignetteDecision: resolveVignetteDecision,
    getBotVignetteChoice: getBotVignetteChoice,
    showVignetteModal: showVignetteModal,
    closeVignetteModal: closeVignetteModal
  };
  exp.CardiopolyVignettes = exp;
  return exp;
}));
