/**
 * Cardiopoly - Human-Like AI Controller Engine
 * 
 * Replaces static 0.5 coin-flip probabilities with a multi-layered heuristic AI:
 * - 3 Difficulty Tiers: RESIDENT (Easy), ATTENDING (Normal), DEPARTMENT_CHAIR (Hard/Ruthless)
 * - Strategic Valuation: Group synergy, defensive blocks, and faction affinity
 * - Competitive Auction Bidding: Private dynamic max bids, staggered pacing, realistic dropouts
 * - Smart Anti-Exploit Trade Valuation: Rejects one-sided trades that grant opponent monopolies
 * - Contextual Clinical Decision Making matching faction archetype
 * - Satirical medical trash-talk chat quips
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyAI = exports;
    root.AI_DIFFICULTIES = exports.AI_DIFFICULTIES;
    root.calculatePropertyStrategicValue = exports.calculatePropertyStrategicValue;
    root.decidePropertyPurchase = exports.decidePropertyPurchase;
    root.calculateAuctionMaxBid = exports.calculateAuctionMaxBid;
    root.evaluateTradeOffer = exports.evaluateTradeOffer;
    root.selectVignetteChoice = exports.selectVignetteChoice;
    root.generateAiChatQuip = exports.generateAiChatQuip;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var AI_DIFFICULTIES = {
    RESIDENT: 'RESIDENT',
    ATTENDING: 'ATTENDING',
    DEPARTMENT_CHAIR: 'DEPARTMENT_CHAIR'
  };

  /**
   * Helper to inspect color group ownership for a given tile.
   */
  function inspectGroupOwnership(tile, gameState) {
    if (!tile || !gameState || !gameState.tiles) {
      return { total: 0, ownedByPlayer: {}, unowned: 0 };
    }

    var groupName = tile.groupName;
    var groupOrder = tile.groupOrder;
    var total = 0;
    var ownedByPlayer = {};
    var unowned = 0;

    for (var i = 0; i < gameState.tiles.length; i++) {
      var t = gameState.tiles[i];
      if (t && t.type === 'PROPERTY') {
        var matches = groupName ? (t.groupName === groupName) : (t.groupOrder === groupOrder);
        if (matches) {
          total++;
          if (t.ownerId === null || t.ownerId === undefined) {
            unowned++;
          } else {
            ownedByPlayer[t.ownerId] = (ownedByPlayer[t.ownerId] || 0) + 1;
          }
        }
      }
    }

    return {
      total: total,
      ownedByPlayer: ownedByPlayer,
      unowned: unowned
    };
  }

  /**
   * Calculates strategic value of an unowned or target property for a specific bot.
   */
  function calculatePropertyStrategicValue(bot, tile, gameState, difficulty) {
    if (!bot || !tile) return 0;
    var diff = difficulty || bot.difficulty || AI_DIFFICULTIES.ATTENDING;
    var baseCost = tile.priceWP || 400;

    var groupInfo = inspectGroupOwnership(tile, gameState);
    var botOwnedInGroup = groupInfo.ownedByPlayer[bot.id] || 0;
    var totalInGroup = groupInfo.total || 1;

    // 1. Color Group Synergy Multiplier
    var synergyMultiplier = 1.0;
    if (botOwnedInGroup > 0) {
      if (botOwnedInGroup === totalInGroup - 1) {
        // Completes a monopoly!
        synergyMultiplier += (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR ? 3.0 : (diff === AI_DIFFICULTIES.ATTENDING ? 2.2 : 1.4));
      } else {
        // Owns 1 or more in group
        synergyMultiplier += (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR ? 1.5 : 0.9);
      }
    }

    // 2. Defensive Block Multiplier (if opponent is about to complete a monopoly)
    var defensiveMultiplier = 1.0;
    if (gameState && gameState.players) {
      for (var p = 0; p < gameState.players.length; p++) {
        var other = gameState.players[p];
        if (other.id !== bot.id) {
          var otherOwned = groupInfo.ownedByPlayer[other.id] || 0;
          if (otherOwned === totalInGroup - 1) {
            // Other player needs just this tile to complete monopoly!
            var blockWeight = (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR ? 2.2 : (diff === AI_DIFFICULTIES.ATTENDING ? 1.5 : 0.4));
            defensiveMultiplier += blockWeight;
            break;
          }
        }
      }
    }

    // 3. Faction Affinity Multiplier
    var factionMultiplier = 1.0;
    var fid = bot.factionId;
    var gname = (tile.groupName || '').toLowerCase();

    if (fid === 'INTERVENTIONALIST') {
      if (gname.includes('cath') || gname.includes('echo') || gname.includes('coronary') || gname.includes('acs')) {
        factionMultiplier += 0.75;
      }
    } else if (fid === 'ACADEMIC_CLINICIAN') {
      if (gname.includes('clinic') || gname.includes('rehab') || gname.includes('observation')) {
        factionMultiplier += 0.75;
      }
    } else if (fid === 'HOSPITAL_CEO') {
      if (tile.priceWP >= 500) factionMultiplier += 0.50;
      if (botOwnedInGroup > 0) factionMultiplier += 0.50;
    } else if (fid === 'REGULATORY_AUDITOR') {
      if (gname.includes('quick-fix') || gname.includes('short-stay')) {
        factionMultiplier += 0.50;
      }
    }

    // Difficulty scaling & deliberate randomness
    var randomNoise = 1.0;
    if (diff === AI_DIFFICULTIES.RESIDENT) {
      randomNoise = 0.8 + (Math.random() * 0.4); // higher variance
    } else if (diff === AI_DIFFICULTIES.ATTENDING) {
      randomNoise = 0.92 + (Math.random() * 0.16);
    } else {
      randomNoise = 0.97 + (Math.random() * 0.06); // cold, deterministic precision
    }

    var totalVal = baseCost * synergyMultiplier * defensiveMultiplier * factionMultiplier * randomNoise;
    return Math.round(totalVal);
  }

  /**
   * Decides whether the bot should purchase an unowned property it landed on.
   */
  function decidePropertyPurchase(bot, tile, gameState, difficulty) {
    if (!bot || !tile) return { shouldBuy: false, reason: 'Invalid params' };
    var diff = difficulty || bot.difficulty || AI_DIFFICULTIES.ATTENDING;

    var strategicVal = calculatePropertyStrategicValue(bot, tile, gameState, diff);
    var cost = tile.priceWP || 400;

    var groupInfo = inspectGroupOwnership(tile, gameState);
    var botOwnedInGroup = groupInfo.ownedByPlayer[bot.id] || 0;
    var totalInGroup = groupInfo.total || 1;

    // Department Chair AI always buys if it completes or blocks a monopoly
    if (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) {
      if (botOwnedInGroup === totalInGroup - 1) {
        return { shouldBuy: true, reason: 'Completes color group monopoly' };
      }
      for (var pid in groupInfo.ownedByPlayer) {
        if (parseInt(pid, 10) !== bot.id && groupInfo.ownedByPlayer[pid] === totalInGroup - 1) {
          return { shouldBuy: true, reason: 'Defensive block against opponent monopoly' };
        }
      }
    }

    // Value threshold comparison
    if (diff === AI_DIFFICULTIES.RESIDENT) {
      // Resident makes occasional suboptimal passes (15% chance to decline cheap property)
      var buyProb = strategicVal >= cost ? 0.85 : 0.35;
      var passRoll = Math.random() < buyProb;
      return { shouldBuy: passRoll, reason: passRoll ? 'Resident buys suite' : 'Resident passes to auction' };
    }

    var threshold = (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) ? (cost * 0.90) : cost;
    var shouldBuy = strategicVal >= threshold;

    return {
      shouldBuy: shouldBuy,
      buy: shouldBuy,
      reason: shouldBuy ? 'Strategic value (' + strategicVal + ' WP) justifies cost (' + cost + ' WP)' : 'Low strategic priority, letting go to auction'
    };
  }

  /**
   * Calculates maximum bid for a live property auction.
   */
  function calculateAuctionMaxBid(bot, tile, gameState, difficulty) {
    if (!bot || !tile) return 0;
    var diff = difficulty || bot.difficulty || AI_DIFFICULTIES.ATTENDING;
    var cost = tile.priceWP || 400;

    var strategicVal = calculatePropertyStrategicValue(bot, tile, gameState, diff);
    var groupInfo = inspectGroupOwnership(tile, gameState);
    var botOwnedInGroup = groupInfo.ownedByPlayer[bot.id] || 0;
    var totalInGroup = groupInfo.total || 1;

    var multiplier = 1.0;
    if (botOwnedInGroup === totalInGroup - 1) {
      // Completes monopoly: will bid up to 1.8x - 2.2x base price
      multiplier = (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) ? 2.2 : (diff === AI_DIFFICULTIES.ATTENDING ? 1.8 : 1.3);
    } else {
      multiplier = (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) ? 1.4 : (diff === AI_DIFFICULTIES.ATTENDING ? 1.2 : 0.9);
    }

    var maxBid = Math.min(950, Math.round(cost * multiplier));
    if (strategicVal > maxBid && diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) {
      maxBid = Math.min(950, Math.round((cost + strategicVal) / 2));
    }

    return Math.max(cost, maxBid);
  }

  function decideAuctionBid(bot, tile, currentBid, highBidder, gameState, difficulty) {
    var maxBid = calculateAuctionMaxBid(bot, tile, gameState, difficulty);
    var nextBid = currentBid + 50;
    if (highBidder && highBidder.id === bot.id) {
      return { bid: false, amount: currentBid, maxWillingToPay: maxBid, reason: 'Already high bidder' };
    }
    if (nextBid <= maxBid && (bot.wp || 0) >= nextBid) {
      return { bid: true, amount: nextBid, maxWillingToPay: maxBid, reason: 'Bid ' + nextBid + ' WP (willing up to ' + maxBid + ' WP)' };
    }
    return { bid: false, amount: currentBid, maxWillingToPay: maxBid, reason: 'Current bid exceeds max willingness to pay (' + maxBid + ' WP)' };
  }

  /**
   * Evaluates incoming trade offer (Anti-Exploit).
   */
  function evaluateTradeOffer(bot, arg2, arg3, arg4, arg5, arg6) {
    var offeredTile = arg2;
    var requestedTile = arg3;
    var gameState = arg4;
    var difficulty = arg5;
    var extraWP = arg6 || 0;

    // Handle overload where caller passes (bot, otherPlayer, offeredTile, requestedTile, gameState, difficulty)
    if (arg2 && typeof arg2.id === 'number' && arg3 && arg3.name) {
      offeredTile = arg3;
      requestedTile = arg4;
      gameState = arg5;
      difficulty = arg6;
      extraWP = 0;
    }

    if (!bot || !offeredTile || !requestedTile) {
      return { accept: false, accepted: false, reason: 'Invalid trade offer' };
    }

    var diff = difficulty || bot.difficulty || AI_DIFFICULTIES.ATTENDING;

    // Check if giving requestedTile completes a monopoly for the other player
    var otherPlayerId = offeredTile.ownerId;
    var reqGroupInfo = inspectGroupOwnership(requestedTile, gameState);
    var otherOwnedInReq = reqGroupInfo.ownedByPlayer[otherPlayerId] || 0;
    var givesOpponentMonopoly = (otherOwnedInReq === reqGroupInfo.total - 1);

    // Check if receiving offeredTile completes a monopoly for the bot
    var offGroupInfo = inspectGroupOwnership(offeredTile, gameState);
    var botOwnedInOff = offGroupInfo.ownedByPlayer[bot.id] || 0;
    var completesBotMonopoly = (botOwnedInOff === offGroupInfo.total - 1);

    // Department Chair & Attending anti-exploit check
    if (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR || diff === AI_DIFFICULTIES.ATTENDING) {
      if (givesOpponentMonopoly && !completesBotMonopoly) {
        return {
          accept: false,
          accepted: false,
          reason: 'Rejected: Trade grants opponent a complete color monopoly without reciprocal monopoly for bot'
        };
      }
    }

    // Valuation comparison
    var valReceived = calculatePropertyStrategicValue(bot, offeredTile, gameState, diff) + extraWP;
    var valGiven = calculatePropertyStrategicValue(bot, requestedTile, gameState, diff);

    // Resident is more forgiving
    if (diff === AI_DIFFICULTIES.RESIDENT) {
      if (valReceived >= valGiven * 0.85) {
        return { accept: true, accepted: true, reason: 'Resident accepts reasonable trade' };
      }
      return { accept: false, accepted: false, reason: 'Resident declines low-value trade' };
    }

    var minThreshold = (diff === AI_DIFFICULTIES.DEPARTMENT_CHAIR) ? 1.10 : 1.0;
    var accepted = (valReceived >= valGiven * minThreshold);

    return {
      accept: accepted,
      accepted: accepted,
      reason: accepted
        ? 'Trade accepted: Received value (' + valReceived + ' WP) balances surrendered value (' + valGiven + ' WP)'
        : 'Trade declined: Surrendered value (' + valGiven + ' WP) exceeds offered value (' + valReceived + ' WP)'
    };
  }

  /**
   * Selects contextual vignette choice matching faction archetype and patient risk.
   */
  function selectVignetteChoice(bot, vignette, gameState, difficulty) {
    if (!vignette || !vignette.choices || !vignette.choices.length) {
      return { choiceId: 'CHOICE_GDMT', rationale: 'Default GDMT' };
    }

    var fid = bot.factionId;
    var choices = vignette.choices;

    // Interventionalist: heavily favors intervention unless contrast nephropathy alert
    if (fid === 'INTERVENTIONALIST') {
      var intChoice = choices.find(function (c) {
        return c.id === 'CHOICE_INTERVENTION' || c.id === 'CHOICE_STENT';
      });
      if (intChoice) {
        return { choiceId: intChoice.id, rationale: 'Interventionalist maximizes procedural RVUs and cath throughput' };
      }
    }

    // Academic Clinician: prioritizes evidence-based GDMT
    if (fid === 'ACADEMIC_CLINICIAN') {
      var gdmtChoice = choices.find(function (c) {
        return c.id === 'CHOICE_GDMT';
      });
      if (gdmtChoice) {
        return { choiceId: gdmtChoice.id, rationale: 'Academic Clinician follows Class I GDMT recommendations' };
      }
    }

    // Hospital CEO: balances cost containment and revenue
    if (fid === 'HOSPITAL_CEO') {
      var costChoice = choices.find(function (c) {
        return c.id === 'CHOICE_COST_CONTAINMENT' || c.id === 'CHOICE_OBSERVATION';
      });
      if (costChoice && Math.random() < 0.6) {
        return { choiceId: costChoice.id, rationale: 'Hospital CEO optimizes 23h observation bed turnover' };
      }
    }

    // Regulatory Auditor: favors GDMT or Cost-Containment to cut waste
    if (fid === 'REGULATORY_AUDITOR') {
      var auditChoice = choices.find(function (c) {
        return c.id === 'CHOICE_GDMT' || c.id === 'CHOICE_COST_CONTAINMENT';
      });
      if (auditChoice) {
        return { choiceId: auditChoice.id, rationale: 'Auditor selects conservative guideline care to prevent waste' };
      }
    }

    return { choiceId: choices[0].id, rationale: 'Standard clinical decision' };
  }

  /**
   * Generates satirical medical trash-talk chat quips.
   */
  function generateAiChatQuip(bot, eventType, context) {
    context = context || {};
    var fid = bot.factionId;
    var name = bot.shortName || bot.name || 'Doctor';

    var quipsByEvent = {
      AUCTION_BID: [
        'Cath Lab needs that ' + (context.propertyName || 'suite') + ' right now!',
        'Step aside, that facility fee belongs on my departmental ledger!',
        'No way I am letting you complete that department group!',
        'Our utilization committee has pre-cleared this purchase!'
      ],
      MONOPOLY_COMPLETED: [
        name + ' just locked down the entire department. Enjoy double facility fees!',
        'Full department monopoly achieved! Bring on the high-margin consults!',
        'Administrative efficiency unlocked. Expect rent inflation on every visit!'
      ],
      TRADE_REJECTED: [
        'Do I look like a first-year intern? That trade is completely one-sided!',
        'MOH guidelines forbid me from accepting such predatory terms.',
        'No deal! I am not giving you a monopoly for a bargain-bin consultation room!'
      ]
    };

    var list = quipsByEvent[eventType] || ['Clinical excellence at work!'];
    return list[Math.floor(Math.random() * list.length)];
  }

  return {
    AI_DIFFICULTIES: AI_DIFFICULTIES,
    calculatePropertyStrategicValue: calculatePropertyStrategicValue,
    decidePropertyPurchase: decidePropertyPurchase,
    calculateAuctionMaxBid: calculateAuctionMaxBid,
    decideAuctionBid: decideAuctionBid,
    evaluateTradeOffer: evaluateTradeOffer,
    selectVignetteChoice: selectVignetteChoice,
    decideVignetteOption: selectVignetteChoice,
    generateAiChatQuip: generateAiChatQuip,
    generateBotQuip: generateAiChatQuip
  };
}));
