/**
 * Cardiopoly - Asymmetric Faction Engine & Win Condition Evaluator
 * 
 * Implements 4 distinct clinical and economic stakeholders:
 * - ACADEMIC CLINICIAN: Focuses on evidence-based GDMT adherence and patient encounters.
 * - INTERVENTIONALIST: Maximizes catheterization RVUs while balancing complication/sanction risk.
 * - HOSPITAL CEO: Consolidates service-line monopolies and hospital operating margins.
 * - REGULATORY AUDITOR: Flags overutilization and claws back wasted healthcare funds.
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
    root.evaluateFactionWin = exports.evaluateFactionWin;
    root.recordFactionAction = exports.recordFactionAction;
    root.assignFactionToPlayer = exports.assignFactionToPlayer;
    root.countCompletedGroups = exports.countCompletedGroups;
    root.getFactionProgress = exports.getFactionProgress;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Complete dictionary of asymmetric factions with metadata and win targets.
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
      winConditionDescription: 'Claw back >= 15,000 Waste Points (WP) through compliance and billing audits.',
      winTarget: {
        clawbackWP: 15000
      }
    }
  };

  /**
   * Initializes or updates player properties to bind a specific faction.
   *
   * @param {Object} player - Target player object
   * @param {string} factionId - Key of the faction to assign
   * @returns {Object} Updated player reference
   */
  function assignFactionToPlayer(player, factionId) {
    if (!player) return player;

    var faction = FACTIONS[factionId] || null;
    player.factionId = factionId;
    player.faction = faction;

    // Initialize metrics cleanly if not already initialized
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

  /**
   * Counts how many complete property groups a player currently monopolizes/owns.
   *
   * @param {number} playerId - ID of the player
   * @param {Array<Object>} tiles - Game board tiles array
   * @returns {number} Number of complete department groups owned
   */
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

  /**
   * Evaluates whether a player has met their faction-specific asymmetric win condition.
   *
   * @param {Object} player - Player object with faction metrics
   * @param {Object} [gameState] - Optional active game state (for board tile group checking)
   * @returns {boolean} True if player meets win thresholds, false otherwise
   */
  function evaluateFactionWin(player, gameState) {
    if (!player || !player.factionId) {
      return false;
    }

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
          if (boardGroups > groups) {
            groups = boardGroups;
          }
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

  /**
   * Updates faction metrics for clinical and economic actions performed by a player.
   *
   * @param {Object} player - Target player object
   * @param {string} actionType - 'GDMT_PRESCRIBED' | 'STENT_DEPLOYED' | 'DEPARTMENT_ACQUIRED' | 'AUDIT_CLAWBACK'
   * @param {Object} [payload] - Optional details (rvu, margin, score, delta, complication, sanction, fullGroup)
   * @returns {Object} Updated player reference
   */
  function recordFactionAction(player, actionType, payload) {
    if (!player) return player;
    var data = payload || {};

    switch (actionType) {
      case 'GDMT_PRESCRIBED': {
        player.encounters = (player.encounters || 0) + 1;
        if (typeof data.score === 'number') {
          player.gdmtScore = Math.min(100, Math.max(0, data.score));
        } else if (typeof data.delta === 'number') {
          player.gdmtScore = Math.min(100, Math.max(0, (player.gdmtScore || 70) + data.delta));
        } else {
          // Default increment
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

      default:
        break;
    }

    return player;
  }

  /**
   * Computes current progress summary toward faction win target for UI displays.
   *
   * @param {Object} player - Player object
   * @param {Object} [gameState] - Optional game state
   * @returns {Object} Progress breakdown { factionId, name, badge, winTarget, percentComplete, isWin }
   */
  function getFactionProgress(player, gameState) {
    if (!player || !player.factionId || !FACTIONS[player.factionId]) {
      return {
        factionId: null,
        name: 'Unassigned',
        badge: 'UNASSIGNED',
        winTarget: null,
        percentComplete: 0,
        isWin: false,
        summary: 'No faction assigned'
      };
    }

    var faction = FACTIONS[player.factionId];
    var isWin = evaluateFactionWin(player, gameState);
    var pct = 0;
    var summary = '';

    switch (player.factionId) {
      case 'ACADEMIC_CLINICIAN': {
        var gdmtPct = Math.min(1, (player.gdmtScore || 0) / 85);
        var encPct = Math.min(1, (player.encounters || 0) / 12);
        pct = Math.round(((gdmtPct + encPct) / 2) * 100);
        summary = 'GDMT: ' + (player.gdmtScore || 0) + '% / 85% | Encounters: ' + (player.encounters || 0) + '/12 | Complications: ' + (player.complications || 0);
        break;
      }

      case 'INTERVENTIONALIST': {
        pct = Math.min(100, Math.round(((player.rvuPoints || 0) / 12000) * 100));
        summary = 'RVUs: ' + (player.rvuPoints || 0) + ' / 12,000 | Sanctions: ' + (player.sanctions || 0) + '/3';
        break;
      }

      case 'HOSPITAL_CEO': {
        var groups = player.fullDepartmentGroups || 0;
        if (gameState && gameState.tiles) {
          groups = Math.max(groups, countCompletedGroups(player.id, gameState.tiles));
        }
        var groupPct = groups / 3;
        var marginPct = (player.departmentMargin || 0) / 10000;
        pct = Math.min(100, Math.round(Math.max(groupPct, marginPct) * 100));
        summary = 'Groups: ' + groups + '/3 | Margin: $' + (player.departmentMargin || 0) + ' / $10,000';
        break;
      }

      case 'REGULATORY_AUDITOR': {
        pct = Math.min(100, Math.round(((player.clawbackWP || 0) / 15000) * 100));
        summary = 'Clawback: ' + (player.clawbackWP || 0) + ' / 15,000 WP';
        break;
      }

      default:
        pct = 0;
        summary = '';
        break;
    }

    return {
      factionId: faction.id,
      name: faction.name,
      badge: faction.badge,
      winTarget: faction.winTarget,
      percentComplete: pct,
      isWin: isWin,
      summary: summary
    };
  }

  return {
    FACTIONS: FACTIONS,
    evaluateFactionWin: evaluateFactionWin,
    recordFactionAction: recordFactionAction,
    assignFactionToPlayer: assignFactionToPlayer,
    countCompletedGroups: countCompletedGroups,
    getFactionProgress: getFactionProgress
  };
}));
