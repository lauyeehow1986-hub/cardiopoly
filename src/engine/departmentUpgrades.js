/**
 * Cardiopoly - Department Upgrades & Mathematical Rent Engine
 * 
 * Provides deep strategy mechanics for color group monopolies:
 * - 3 Upgrade Tiers: Clinical Fellow (Tier 1), Subspecialty Attending (Tier 2), Flagship Heart Institute (Tier 3)
 * - Non-mutating dynamic rent calculation incorporating:
 *   * Immutable Base Rent
 *   * Color Group Monopoly Multiplier (2.0x, or 3.0x for Hospital CEO)
 *   * Upgrade Tier Multiplier (1.0x, 1.5x, 2.2x, 3.5x)
 *   * National Policy Regime Multipliers (Singapore, US, UK, etc.)
 *   * Faction Passives (Interventionalist Cath Lab / CCU extraction)
 * 
 * Guarantees zero exponential rent compounding bug!
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./policies.js'));
  } else {
    var exports = factory(root.CardiopolyPolicies);
    root.CardiopolyUpgrades = exports;
    root.UPGRADE_TIERS = exports.UPGRADE_TIERS;
    root.canUpgradeProperty = exports.canUpgradeProperty;
    root.getUpgradeCost = exports.getUpgradeCost;
    root.upgradeProperty = exports.upgradeProperty;
    root.getEffectiveRent = exports.getEffectiveRent;
  }
}(typeof self !== 'undefined' ? self : this, function (policiesModule) {
  'use strict';

  var UPGRADE_TIERS = {
    0: { id: 0, name: 'Standard Suite', rentMultiplier: 1.0, starPips: '', description: 'Standard un-upgraded clinical space' },
    1: { id: 1, name: 'Clinical Fellow', rentMultiplier: 1.5, starPips: '⭐', description: '+50% rent and clinical case bonus' },
    2: { id: 2, name: 'Subspecialty Attending', rentMultiplier: 2.2, starPips: '⭐⭐', description: '+120% rent and advanced imaging suite' },
    3: { id: 3, name: 'Flagship Heart Institute', rentMultiplier: 3.5, starPips: '⭐⭐⭐', description: '+250% rent and mandatory clinical challenge for rivals' }
  };

  function checkFullGroupOwned(tile, ownerId, gameState) {
    if (!tile || !gameState || !gameState.tiles) return false;
    var groupName = tile.groupName;
    var groupOrder = tile.groupOrder;
    var count = 0;
    var ownedCount = 0;

    for (var i = 0; i < gameState.tiles.length; i++) {
      var t = gameState.tiles[i];
      if (t && t.type === 'PROPERTY') {
        var matches = groupName ? (t.groupName === groupName) : (t.groupOrder === groupOrder);
        if (matches) {
          count++;
          if (t.ownerId === ownerId) {
            ownedCount++;
          }
        }
      }
    }

    return count > 0 && ownedCount === count;
  }

  function canUpgradeProperty(property, owner, gameState) {
    if (!property || property.type !== 'PROPERTY' || !owner) return false;
    if (property.ownerId !== owner.id) return false;
    var currentLevel = property.upgradeLevel || 0;
    if (currentLevel >= 3) return false; // Maximum Tier 3

    // Must own complete color group monopoly to build upgrades
    var ownsMonopoly = checkFullGroupOwned(property, owner.id, gameState);
    if (!ownsMonopoly) return false;

    var cost = getUpgradeCost(property, owner);
    var playerWp = owner.wp || 0;
    return playerWp >= cost;
  }

  function getUpgradeCost(property, owner) {
    if (!property) return 200;
    var basePrice = property.priceWP || 400;
    var baseUpgradeCost = Math.round(basePrice * 0.5);

    // Hospital CEO passive: 15% discount on suite acquisitions & upgrades
    if (owner && owner.factionId === 'HOSPITAL_CEO') {
      baseUpgradeCost = Math.round(baseUpgradeCost * 0.85);
    }

    return Math.max(100, baseUpgradeCost);
  }

  function upgradeProperty(property, owner, gameState) {
    if (!canUpgradeProperty(property, owner, gameState)) {
      return { success: false, reason: 'Upgrade criteria not met or insufficient WP' };
    }

    var cost = getUpgradeCost(property, owner);
    var currentLevel = property.upgradeLevel || 0;
    var nextLevel = currentLevel + 1;

    property.upgradeLevel = nextLevel;
    owner.wp = Math.max(0, (owner.wp || 0) - cost);

    // Track faction metrics
    if (typeof owner.departmentMargin === 'number') {
      owner.departmentMargin += Math.round(cost * 1.5);
    }

    var tierInfo = UPGRADE_TIERS[nextLevel] || UPGRADE_TIERS[1];

    return {
      success: true,
      newLevel: nextLevel,
      newTier: nextLevel,
      tierName: tierInfo.name,
      starPips: tierInfo.starPips,
      costPaid: cost,
      cost: cost,
      message: (owner.name || 'Owner') + ' upgraded ' + property.name + ' to Tier ' + nextLevel + ' (' + tierInfo.name + ' ' + tierInfo.starPips + ') for ' + cost + ' WP!'
    };
  }

  /**
   * Computes derived effective rent without mutating base property state.
   */
  function getEffectiveRent(property, owner, activeRegime, ownerFaction, gameState) {
    if (!property) return 100;
    var baseRent = property.baseRent || 100;
    var ownerId = owner ? owner.id : property.ownerId;
    var fid = ownerFaction || (owner ? owner.factionId : null);
    var returnDetails = false;
    var actualRegime = 'SINGAPORE';

    // Handle overload: getEffectiveRent(property, owner, visitor, regime, gameState)
    if (activeRegime && typeof activeRegime === 'object') {
      returnDetails = true;
      actualRegime = (typeof ownerFaction === 'string') ? ownerFaction : 'SINGAPORE';
    } else if (typeof activeRegime === 'string') {
      actualRegime = activeRegime;
    }

    // 1. Monopoly Multiplier
    var monopolyMultiplier = 1.0;
    if (ownerId !== null && ownerId !== undefined) {
      if (gameState && checkFullGroupOwned(property, ownerId, gameState)) {
        monopolyMultiplier = 2.0;
      } else if (gameState && gameState.tiles) {
        var gTiles = gameState.tiles.filter(function (t) { return t.groupOrder === property.groupOrder || t.groupName === property.groupName; });
        if (gTiles.length > 0 && gTiles.every(function (t) { return t.ownerId === ownerId; })) {
          monopolyMultiplier = 2.0;
        }
      }
      if (monopolyMultiplier > 1.0 && fid === 'HOSPITAL_CEO') {
        monopolyMultiplier = 3.0;
      }
    }

    // 2. Department Upgrade Tier Multiplier
    var level = property.upgradeLevel || 0;
    var tierInfo = UPGRADE_TIERS[level] || UPGRADE_TIERS[0];
    var upgradeMultiplier = tierInfo.rentMultiplier || 1.0;

    // 3. National Healthcare Policy Multiplier
    var regimeMultiplier = 1.0;
    if (policiesModule && typeof policiesModule.getRegimeMultiplier === 'function') {
      regimeMultiplier = policiesModule.getRegimeMultiplier(actualRegime, 'RENT') || 1.0;
    }

    // 4. Faction Synergy Multiplier
    var factionBonus = 1.0;
    var gname = (property.groupName || '').toLowerCase();
    if (fid === 'INTERVENTIONALIST') {
      if (gname.includes('cath') || gname.includes('echo') || gname.includes('coronary') || gname.includes('acs')) {
        factionBonus = 1.25; // +25% extra rent extraction on interventional suites
      }
    }

    var totalRent = Math.round(baseRent * monopolyMultiplier * upgradeMultiplier * regimeMultiplier * factionBonus);
    var finalVal = Math.max(50, totalRent);

    if (returnDetails) {
      return {
        effectiveRent: finalVal,
        baseRent: baseRent,
        monopolyMultiplier: monopolyMultiplier,
        upgradeMultiplier: upgradeMultiplier,
        tier: level,
        regimeMultiplier: regimeMultiplier,
        factionBonus: factionBonus,
        valueOf: function () { return finalVal; },
        toString: function () { return String(finalVal); }
      };
    }

    return finalVal;
  }

  return {
    UPGRADE_TIERS: UPGRADE_TIERS,
    canUpgradeProperty: canUpgradeProperty,
    canUpgrade: canUpgradeProperty,
    getUpgradeCost: getUpgradeCost,
    upgradeProperty: upgradeProperty,
    upgradeTile: upgradeProperty,
    getEffectiveRent: getEffectiveRent,
    checkFullGroupOwned: checkFullGroupOwned
  };
}));
