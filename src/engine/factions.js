/**
 * Cardiopoly - Asymmetric Faction Engine & Dual-Mode Victory Evaluator
 * 
 * Implements 4 distinct clinical and economic stakeholders:
 * - ACADEMIC CLINICIAN: Focuses on evidence-based GDMT adherence and patient encounters.
 * - INTERVENTIONALIST: Maximizes catheterization RVUs while balancing complication/sanction risk.
 * - HOSPITAL CEO: Consolidates service-line monopolies and hospital operating margins.
 * - REGULATORY AUDITOR: Flags overutilization and claws back wasted healthcare funds.
 * 
 * Supports two distinct game modes:
 * - CLINICAL_MASTERY (Default): Strategic gamer mode where SBP 200 / BMI 70 causes Code Blue
 *   Hospitalization and match ends on Faction Victory or Global Systemic Collapse.
 * - BUREAUCRATIC_SATIRE: Classic parody escalation where SBP 200 / BMI 70 is celebrated as victory.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyFactions = exports;
    root.FACTIONS = exports.FACTIONS;
    root.GAME_MODES = exports.GAME_MODES;
    root.evaluateFactionWin = exports.evaluateFactionWin;
    root.recordFactionAction = exports.recordFactionAction;
    root.assignFactionToPlayer = exports.assignFactionToPlayer;
    root.countCompletedGroups = exports.countCompletedGroups;
    root.getFactionProgress = exports.getFactionProgress;
    root.getFactionPassives = exports.getFactionPassives;
    root.checkCodeBlueHospitalization = exports.checkCodeBlueHospitalization;
    root.checkGlobalCollapse = exports.checkGlobalCollapse;
    root.computeNetEmpireScore = exports.computeNetEmpireScore;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var GAME_MODES = {
    CLINICAL_MASTERY: 'CLINICAL_MASTERY',
    BUREAUCRATIC_SATIRE: 'BUREAUCRATIC_SATIRE'
  };

  /**
   * Complete dictionary of asymmetric factions with metadata, win targets, and passive perks.
   */
  var FACTIONS = {
    ACADEMIC_CLINICIAN: {
      id: 'ACADEMIC_CLINICIAN',
      name: 'Academic Clinician',
      badge: 'ACADEMIC CLINICIAN',
      role: 'Evidence-Based Guideline Champion',
      description: 'Prioritizes guideline-directed medical therapy (GDMT) and clinical outcomes over procedural volume.',
      icon: '🩺',
      colorHex: '#06b6d4',
      passives: {
        gdmtBonusPercent: 20,          // +20% Vignette GDMT bonus
        peerReviewDiscountPercent: 25   // -25% M&M Peer Review bail penalty
      },
      winConditionDescription: 'Achieve GDMT adherence >= 85%, complete >= 12 clinical encounters, with < 2 complications.',
      winTarget: {
        gdmtScore: 85,
        encounters: 12,
        maxComplications: 2 // must be strictly < 2
      }
    },
    INTERVENTIONALIST: {
      id: 'INTERVENTIONALIST',
      name: 'Interventionalist',
      badge: 'INTERVENTIONALIST',
      role: 'High-Volume Cath Lab Operator',
      description: 'Maximizes catheterization and procedural RVUs while navigating clinical complication risks and hospital sanctions.',
      icon: '💉',
      colorHex: '#dc2626',
      passives: {
        cathSuiteMultiplier: 2.0,      // Double RVU/WP extraction on Cath Lab, Echo Lab & CCU suites
        procedureBonusPercent: 15       // +15% procedural reimbursement
      },
      winConditionDescription: 'Accumulate >= 12,000 RVU points with fewer than 3 institutional sanctions.',
      winTarget: {
        rvuPoints: 12000,
        maxSanctions: 3 // must be strictly < 3
      }
    },
    HOSPITAL_CEO: {
      id: 'HOSPITAL_CEO',
      name: 'Hospital CEO',
      badge: 'HOSPITAL CEO',
      role: 'Healthcare Enterprise Executive',
      description: 'Consolidates clinical service lines, acquires departmental monopolies, and expands hospital operating margins.',
      icon: '🏥',
      colorHex: '#eab308',
      passives: {
        acquisitionDiscountPercent: 15, // 15% discount on suite acquisitions & upgrades
        monopolyRentBonusPercent: 50    // +50% monopoly rent bonus
      },
      winConditionDescription: 'Control >= 3 complete department groups or generate >= 10,000 department margin.',
      winTarget: {
        fullDepartmentGroups: 3,
        departmentMargin: 10000
      }
    },
    REGULATORY_AUDITOR: {
      id: 'REGULATORY_AUDITOR',
      name: 'Regulatory Auditor',
      badge: 'REGULATORY AUDITOR',
      role: 'Oversight & Compliance Watchdog',
      description: 'Monitors overutilization, flags fraudulent or unindicated procedures, and claws back wasted healthcare funds.',
      icon: '📋',
      colorHex: '#10b981',
      passives: {
        auditClawbackSharePercent: 25   // Collects 25% Audit Clawback whenever any player triggers a defensive test or runaway auction
      },
      winConditionDescription: 'Claw back >= 15,000 Waste Points (WP) through compliance and billing audits.',
      winTarget: {
        clawbackWP: 15000
      }
    }
  };

  function getFactionPassives(factionId) {
    var f = FACTIONS[factionId];
    return f && f.passives ? f.passives : {};
  }

  function assignFactionToPlayer(player, factionId) {
    if (!player) return player;
    var faction = FACTIONS[factionId] || FACTIONS.ACADEMIC_CLINICIAN;
    player.factionId = faction.id;
    player.faction = faction;

    if (typeof player.gdmtScore !== 'number') player.gdmtScore = 70;
    if (typeof player.encounters !== 'number') player.encounters = 0;
    if (typeof player.complications !== 'number') player.complications = 0;
    if (typeof player.rvuPoints !== 'number') player.rvuPoints = 0;
    if (typeof player.sanctions !== 'number') player.sanctions = 0;
    if (typeof player.fullDepartmentGroups !== 'number') player.fullDepartmentGroups = 0;
    if (typeof player.departmentMargin !== 'number') player.departmentMargin = 0;
    if (typeof player.clawbackWP !== 'number') player.clawbackWP = 0;

    return player;
  }

  function countCompletedGroups(playerId, tiles) {
    if (!tiles || !Array.isArray(tiles)) return 0;
    var groupMap = {};

    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (t && t.type === 'PROPERTY' && t.groupName && t.groupName !== 'Hospital Zone' && t.groupName !== 'Card Draw') {
        if (!groupMap[t.groupName]) {
          groupMap[t.groupName] = { total: 0, owned: 0 };
        }
        groupMap[t.groupName].total++;
        if (t.ownerId === playerId) {
          groupMap[t.groupName].owned++;
        }
      }
    }

    var completeCount = 0;
    for (var gn in groupMap) {
      if (Object.prototype.hasOwnProperty.call(groupMap, gn)) {
        if (groupMap[gn].total > 0 && groupMap[gn].owned === groupMap[gn].total) {
          completeCount++;
        }
      }
    }
    return completeCount;
  }

  function evaluateFactionWin(player, gameState) {
    if (!player || !player.factionId) return false;

    switch (player.factionId) {
      case 'ACADEMIC_CLINICIAN': {
        var gdmt = typeof player.gdmtScore === 'number' ? player.gdmtScore : 0;
        var enc = typeof player.encounters === 'number' ? player.encounters : 0;
        var comp = typeof player.complications === 'number' ? player.complications : 0;
        return gdmt >= 85 && enc >= 12 && comp < 2;
      }

      case 'INTERVENTIONALIST': {
        var rvu = typeof player.rvuPoints === 'number' ? player.rvuPoints : 0;
        var sanctions = typeof player.sanctions === 'number' ? player.sanctions : 0;
        return rvu >= 12000 && sanctions < 3;
      }

      case 'HOSPITAL_CEO': {
        var groups = typeof player.fullDepartmentGroups === 'number' ? player.fullDepartmentGroups : 0;
        if (gameState && gameState.tiles) {
          var boardGroups = countCompletedGroups(player.id, gameState.tiles);
          if (boardGroups > groups) groups = boardGroups;
        }
        var margin = typeof player.departmentMargin === 'number' ? player.departmentMargin : 0;
        return groups >= 3 || margin >= 10000;
      }

      case 'REGULATORY_AUDITOR': {
        var clawback = typeof player.clawbackWP === 'number' ? player.clawbackWP : 0;
        return clawback >= 15000;
      }

      default:
        return false;
    }
  }

  function checkCodeBlueHospitalization(player, gameMode) {
    if (!player || gameMode === GAME_MODES.BUREAUCRATIC_SATIRE) {
      return { triggered: false };
    }

    var sbp = typeof player.sbp === 'number' ? player.sbp : 120;
    var bmi = typeof player.bmi === 'number' ? player.bmi : 24.0;

    if (sbp >= 200 || bmi >= 70) {
      var isHypertensive = sbp >= 200;
      var reason = isHypertensive
        ? 'Hypertensive Crisis (SBP >= 200 mmHg)'
        : 'Metabolic Collapse (BMI >= 70 kg/m²)';

      player.sbp = 140;
      player.bmi = 35.0;
      player.inJail = true;
      player.jailTurns = 0;
      player.position = 10;
      player.wp = Math.max(0, (player.wp || 0) + 1500);

      return {
        triggered: true,
        reason: reason,
        message: (player.name || 'Player') + ' suffered a Code Blue ' + reason + '! Rushed to CCU / M&M Peer Review, stabilized at SBP 140 mmHg, and charged 1,500 WP in resuscitation fees!'
      };
    }

    return { triggered: false };
  }

  function checkGlobalCollapse(players, gameMode, options) {
    if (!players || !Array.isArray(players) || gameMode === GAME_MODES.BUREAUCRATIC_SATIRE) {
      return { triggered: false };
    }

    options = options || {};
    var individualCap = options.individualCap || options.wasteThreshold || 10000;
    var systemicCap = options.systemicCap || (options.wasteThreshold ? options.wasteThreshold : 30000);

    var totalSystemicWP = 0;
    var breachedPlayer = null;

    for (var i = 0; i < players.length; i++) {
      var wp = players[i].wp || 0;
      totalSystemicWP += wp;
      if (wp >= individualCap && !breachedPlayer) {
        breachedPlayer = players[i];
      }
    }

    if (breachedPlayer || totalSystemicWP >= systemicCap) {
      var name = breachedPlayer && breachedPlayer.name ? breachedPlayer.name : 'A player';
      var reason = breachedPlayer
        ? 'Ministry Audit Freeze — Waste Cap Exceeded: ' + name + ' crossed ' + individualCap.toLocaleString() + ' WP!'
        : 'Ministry Audit Freeze — National Waste Limit: Global hospital waste reached ' + systemicCap.toLocaleString() + ' WP!';

      var winner = null;
      var maxScore = -1;
      for (var j = 0; j < players.length; j++) {
        var pScore = computeNetEmpireScore(players[j], options.gameState || {});
        if (pScore > maxScore) {
          maxScore = pScore;
          winner = players[j];
        }
      }

      return {
        triggered: true,
        reason: reason,
        winner: winner,
        winnerScore: { total: maxScore },
        totalSystemicWP: totalSystemicWP,
        threshold: breachedPlayer ? individualCap : systemicCap,
        message: reason,
        details: 'Ministry of Health & CMS have enacted an emergency clinical audit freeze. The match ends immediately and clinical prestige will be audited!'
      };
    }

    return { triggered: false };
  }

  function computeNetEmpireScore(player, gameState) {
    if (!player) return 0;
    var progress = getFactionProgress(player, gameState).percent;
    var baseScore = progress * 50;
    var marginScore = (player.departmentMargin || 0) * 0.5;
    var rvuScore = (player.rvuPoints || 0) * 0.4;
    var clawbackScore = (player.clawbackWP || 0) * 0.4;
    var groupScore = (player.fullDepartmentGroups || 0) * 800;
    var penalty = ((player.complications || 0) * 350) + ((player.sanctions || 0) * 500);

    return Math.max(0, Math.round(baseScore + marginScore + rvuScore + clawbackScore + groupScore - penalty));
  }

  function recordFactionAction(player, actionType, payload) {
    if (!player) return player;
    var data = payload || {};

    switch (actionType) {
      case 'GDMT_PRESCRIBED': {
        player.encounters = (player.encounters || 0) + 1;
        if (typeof data.score === 'number') {
          player.gdmtScore = Math.min(100, Math.max(0, data.score));
        } else if (typeof data.delta === 'number') {
          var passives = getFactionPassives(player.factionId);
          var bonusMultiplier = 1 + ((passives.gdmtBonusPercent || 0) / 100);
          var delta = Math.round(data.delta * bonusMultiplier);
          player.gdmtScore = Math.min(100, Math.max(0, (player.gdmtScore || 70) + delta));
        } else {
          player.gdmtScore = Math.min(100, Math.max(0, (player.gdmtScore || 70) + 2));
        }
        if (data.complication) {
          player.complications = (player.complications || 0) + 1;
        }
        break;
      }

      case 'STENT_DEPLOYED': {
        var rvu = typeof data.rvu === 'number' ? data.rvu : (typeof data.rvuPoints === 'number' ? data.rvuPoints : 1200);
        player.rvuPoints = (player.rvuPoints || 0) + rvu;
        if (data.sanction) {
          player.sanctions = (player.sanctions || 0) + 1;
        }
        break;
      }

      case 'DEPARTMENT_ACQUIRED': {
        var margin = typeof data.margin === 'number' ? data.margin : (typeof data.amount === 'number' ? data.amount : 2500);
        player.departmentMargin = (player.departmentMargin || 0) + margin;
        if (data.fullGroup || data.groupCompleted) {
          player.fullDepartmentGroups = (player.fullDepartmentGroups || 0) + 1;
        }
        break;
      }

      case 'AUDIT_CLAWBACK': {
        var clawback = typeof data.clawbackWP === 'number' ? data.clawbackWP : (typeof data.amount === 'number' ? data.amount : (typeof data.wp === 'number' ? data.wp : 2000));
        player.clawbackWP = (player.clawbackWP || 0) + clawback;
        break;
      }
    }

    return player;
  }

  function getFactionProgress(player, gameState) {
    if (!player || !player.factionId) {
      return { factionId: null, isWin: false, percent: 0, percentComplete: 0, summary: 'No faction assigned' };
    }

    var isWin = evaluateFactionWin(player, gameState);
    var percent = 0;
    var summary = '';

    switch (player.factionId) {
      case 'ACADEMIC_CLINICIAN': {
        var gdmt = player.gdmtScore || 0;
        var enc = player.encounters || 0;
        var p1 = Math.min(100, (gdmt / 85) * 100);
        var p2 = Math.min(100, (enc / 12) * 100);
        percent = Math.round((p1 + p2) / 2);
        summary = 'GDMT: ' + gdmt + '/85% • Encounters: ' + enc + '/12 • Complications: ' + (player.complications || 0) + '/1 max';
        break;
      }

      case 'INTERVENTIONALIST': {
        var rvu = player.rvuPoints || 0;
        percent = Math.min(100, Math.round((rvu / 12000) * 100));
        summary = 'RVUs: ' + rvu.toLocaleString() + '/12,000 • Sanctions: ' + (player.sanctions || 0) + '/2 max';
        break;
      }

      case 'HOSPITAL_CEO': {
        var groups = player.fullDepartmentGroups || 0;
        if (gameState && gameState.tiles) {
          var bg = countCompletedGroups(player.id, gameState.tiles);
          if (bg > groups) groups = bg;
        }
        var margin = player.departmentMargin || 0;
        var pg1 = Math.min(100, (groups / 3) * 100);
        var pg2 = Math.min(100, (margin / 10000) * 100);
        percent = Math.round(Math.max(pg1, pg2));
        summary = 'Groups: ' + groups + '/3 or Margin: ' + margin.toLocaleString() + '/10,000 WP';
        break;
      }

      case 'REGULATORY_AUDITOR': {
        var claw = player.clawbackWP || 0;
        percent = Math.min(100, Math.round((claw / 15000) * 100));
        summary = 'Audit Clawbacks: ' + claw.toLocaleString() + '/15,000 WP';
        break;
      }

      default:
        summary = 'Standard Monopoly Mode';
    }

    return {
      factionId: player.factionId,
      isWin: isWin,
      percent: percent,
      percentComplete: percent,
      summary: summary
    };
  }

  return {
    GAME_MODES: GAME_MODES,
    FACTIONS: FACTIONS,
    getFactionPassives: getFactionPassives,
    assignFactionToPlayer: assignFactionToPlayer,
    countCompletedGroups: countCompletedGroups,
    evaluateFactionWin: evaluateFactionWin,
    checkCodeBlueHospitalization: checkCodeBlueHospitalization,
    checkGlobalCollapse: checkGlobalCollapse,
    computeNetEmpireScore: computeNetEmpireScore,
    recordFactionAction: recordFactionAction,
    getFactionProgress: getFactionProgress
  };
}));
