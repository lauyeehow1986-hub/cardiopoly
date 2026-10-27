const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
let code = fs.readFileSync(scriptPath, 'utf8');

// 1. Add freezeEmergencyState & unfreezeEmergencyState before finishPlayerTurn
const target1 = `async function finishPlayerTurn() {
  const curPlayer = gameState.players[gameState.currentPlayerIndex];

  // 1. Dual-Mode Victory: Check Code Blue Hospitalization (Mode A: Clinical Mastery)
  if (gameState.gameMode === "CLINICAL_MASTERY" && typeof CardiopolyFactions !== "undefined" && typeof CardiopolyFactions.checkCodeBlueHospitalization === "function") {
    const codeBlue = CardiopolyFactions.checkCodeBlueHospitalization(curPlayer, gameState.gameMode);
    if (codeBlue.triggered) {
      if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
        CardiopolyMcpBridge.cutInOverlay.playCutIn({
          id: 'code_blue',
          title: 'CODE BLUE HOSPITALIZATION',
          subtitle: \`\${curPlayer.name} admitted to CCU (SBP: \${curPlayer.sbp} mmHg)\`,
          accentColor: '#ef4444'
        });
      }
      playAudio("DEFIB");
      playAudio("ALARM");
      setBoardTicker(\`🚨 \${codeBlue.message}\`);
      appendCenterConsoleActionLog(codeBlue.message);
      refreshAllViews();

      if (curPlayer.isBot) {
        if (typeof CardiopolyToasts !== "undefined" && CardiopolyToasts.showToast) {
          CardiopolyToasts.showToast({
            title: "CODE BLUE HOSPITALIZATION",
            message: codeBlue.message,
            theme: "danger",
            durationMs: 4000
          });
        }
      } else {
        await showEventPopupModal(
          "CODE BLUE HOSPITALIZATION",
          curPlayer,
          codeBlue.message,
          "Vitals stabilized at SBP 140 mmHg, BMI 35. 1,500 WP deducted for CCU resuscitation.",
          "game-end-theme",
          "Acknowledge Resuscitation"
        );
      }
    }
  }`;

const replacement1 = `// --- EMERGENCY INTERACTION FREEZE & RESUMPTION (EPAP-15 S07/S09) ---
function freezeEmergencyState(reason = "CODE_BLUE") {
  gameState.isEmergencyPaused = true;
  if (typeof document !== "undefined") {
    document.body.classList.add("emergency-interaction-lock");
    const rollBtn = document.getElementById("roll-btn");
    if (rollBtn) rollBtn.disabled = true;
  }

  // 1. Freeze active unowned property auction if running
  if (gameState.activeAuction) {
    if (typeof gameState.activeAuction.pauseAuction === "function") {
      gameState.activeAuction.pauseAuction();
    } else {
      if (gameState.activeAuction.clockIntervalId) {
        clearInterval(gameState.activeAuction.clockIntervalId);
        gameState.activeAuction.clockIntervalId = null;
      }
      if (gameState.activeAuction.botBidIntervalId) {
        clearInterval(gameState.activeAuction.botBidIntervalId);
        gameState.activeAuction.botBidIntervalId = null;
      }
      gameState.activeAuction.isEmergencyFrozen = true;
    }
  }

  // 2. Freeze bot turns
  if (gameState.botTurnTimeout) {
    clearTimeout(gameState.botTurnTimeout);
    gameState.botTurnTimeout = null;
    gameState.botTurnPending = true;
  }
}

function unfreezeEmergencyState(reason = "CODE_BLUE") {
  gameState.isEmergencyPaused = false;
  if (typeof document !== "undefined") {
    document.body.classList.remove("emergency-interaction-lock");
    const rollBtn = document.getElementById("roll-btn");
    if (rollBtn) rollBtn.disabled = false;
  }

  // 1. Resume active auction if frozen
  if (gameState.activeAuction) {
    if (typeof gameState.activeAuction.resumeAuction === "function") {
      gameState.activeAuction.resumeAuction();
    } else {
      gameState.activeAuction.isEmergencyFrozen = false;
    }
  }

  // 2. Resume pending bot turn
  if (gameState.botTurnPending) {
    gameState.botTurnPending = false;
    clearTimeout(gameState.botTurnTimeout);
    const curPlayer = gameState.players[gameState.currentPlayerIndex];
    if (curPlayer && curPlayer.isBot && gameState.phase === "WAIT_FOR_ROLL") {
      gameState.botTurnTimeout = setTimeout(() => {
        rollDiceAndMove(curPlayer);
      }, 450);
    }
  }
}

if (typeof window !== "undefined") {
  window.freezeEmergencyState = freezeEmergencyState;
  window.unfreezeEmergencyState = unfreezeEmergencyState;
}

async function finishPlayerTurn() {
  const curPlayer = gameState.players[gameState.currentPlayerIndex];

  // 1. Dual-Mode Victory: Check Code Blue Hospitalization (Mode A: Clinical Mastery)
  if (gameState.gameMode === "CLINICAL_MASTERY" && typeof CardiopolyFactions !== "undefined" && typeof CardiopolyFactions.checkCodeBlueHospitalization === "function") {
    const codeBlue = CardiopolyFactions.checkCodeBlueHospitalization(curPlayer, gameState.gameMode);
    if (codeBlue.triggered) {
      // SUSPEND ALL BACKGROUND ACTIONS (AUCTIONS & BOT DECISIONS) IMMEDIATELY
      freezeEmergencyState("CODE_BLUE");

      // Play GMSBS Layer 4 procedural defibrillator sound chain + ducking
      if (typeof window !== "undefined" && window.CardiopolyPatches && typeof window.CardiopolyPatches.playDefibrillatorSequence === "function") {
        window.CardiopolyPatches.playDefibrillatorSequence();
      } else {
        playAudio("DEFIB");
        playAudio("ALARM");
      }

      if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
        CardiopolyMcpBridge.cutInOverlay.playCutIn({
          id: 'code_blue',
          title: 'CODE BLUE HOSPITALIZATION',
          subtitle: \`\${curPlayer.name} admitted to CCU (SBP: \${curPlayer.sbp} mmHg)\`,
          accentColor: '#ef4444'
        });
      }
      setBoardTicker(\`🚨 \${codeBlue.message}\`);
      appendCenterConsoleActionLog(codeBlue.message);
      refreshAllViews();

      if (curPlayer.isBot) {
        if (typeof CardiopolyToasts !== "undefined" && CardiopolyToasts.showToast) {
          CardiopolyToasts.showToast({
            title: "CODE BLUE HOSPITALIZATION",
            message: codeBlue.message,
            theme: "danger",
            durationMs: 4000
          });
        }
        setTimeout(() => {
          unfreezeEmergencyState("CODE_BLUE");
        }, 4000);
      } else {
        await showEventPopupModal(
          "CODE BLUE HOSPITALIZATION",
          curPlayer,
          codeBlue.message,
          "Vitals stabilized at SBP 140 mmHg, BMI 35. 1,500 WP deducted for CCU resuscitation.",
          "game-end-theme",
          "Acknowledge Resuscitation"
        );
        unfreezeEmergencyState("CODE_BLUE");
      }
    }
  }`;

// Helper to normalize CRLF
function normalize(str) {
  return str.replace(/\r\n/g, '\n');
}

const normCode = normalize(code);
const normT1 = normalize(target1);
const normR1 = normalize(replacement1);

if (!normCode.includes(normT1)) {
  console.error("Target 1 not found in script.js!");
  process.exit(1);
}

let updated = normCode.replace(normT1, normR1);
console.log("✓ Applied replacement 1: freezeEmergencyState & Code Blue hook");

// 2. Update startLiveAuction to support pauseAuction, resumeAuction, and freeze checks
const target2 = `    const handlePlayerBid = (increment) => {
      if (settled) return;
      const human = gameState.players[0];
      currentBid += increment;
      highBidder = human;
      clockSeconds = Math.min(maxClock, clockSeconds + 3.0);
      playAudio("CASH");
      updateDisplay();

      if (botFeedEl) {
        const item = document.createElement("div");
        item.className = "auction-feed-item bid-event";
        item.textContent = \`You bid \${currentBid} WP!\`;
        botFeedEl.prepend(item);
      }
    };

    if (plus50Btn) plus50Btn.onclick = () => handlePlayerBid(50);
    if (plus100Btn) plus100Btn.onclick = () => handlePlayerBid(100);
    if (passBtn) {
      passBtn.onclick = () => {
        withdrawnPlayers.add(0);
        if (passBtn) passBtn.disabled = true;
        if (plus50Btn) plus50Btn.disabled = true;
        if (plus100Btn) plus100Btn.disabled = true;
        if (botFeedEl) {
          const item = document.createElement("div");
          item.className = "auction-feed-item";
          item.textContent = "You passed (withdrew from bidding).";
          botFeedEl.prepend(item);
        }
      };
    }

    const botBidIntervalId = setInterval(() => {
      if (settled) return;
      const bots = gameState.players.filter((p) => p.isBot && !withdrawnPlayers.has(p.id));
      if (bots.length === 0 && withdrawnPlayers.has(0)) {
        conclude();
        return;
      }

      const bot = bots[Math.floor(Math.random() * bots.length)];
      if (!bot) return;

      if (typeof CardiopolyAI !== "undefined" && typeof CardiopolyAI.decideAuctionBid === "function") {
        const decision = CardiopolyAI.decideAuctionBid(bot, tile, currentBid, highBidder, gameState, gameState.aiDifficulty);
        if (decision.bid && decision.amount > currentBid) {
          currentBid = decision.amount;
          highBidder = bot;
          clockSeconds = Math.min(maxClock, clockSeconds + 2.5);
          playAudio("CASH");
          updateDisplay();

          if (botFeedEl) {
            const item = document.createElement("div");
            item.className = "auction-feed-item bid-event";
            const quip = (typeof CardiopolyAI.generateBotQuip === "function")
              ? CardiopolyAI.generateBotQuip(bot, "OUTBID_USER", { propertyName: tile.name }, gameState.aiDifficulty)
              : "";
            item.textContent = \`\${bot.shortName} raised bid to \${currentBid} WP! \${quip ? \`"\${quip}"\` : ""}\`;
            botFeedEl.prepend(item);
          }
        } else {
          if (currentBid >= decision.maxWillingToPay) {
            withdrawnPlayers.add(bot.id);
          }
        }
      }
    }, 1200);

    const clockIntervalId = setInterval(() => {
      if (settled) return;
      clockSeconds -= 0.1;
      updateDisplay();
      if (clockSeconds <= 0) {
        conclude();
      }
    }, 100);

    gameState.activeAuction = { tile, clockIntervalId, botBidIntervalId, conclude };`;

const replacement2 = `    const handlePlayerBid = (increment) => {
      if (settled || (gameState.activeAuction && gameState.activeAuction.isEmergencyFrozen)) return;
      const human = gameState.players[0];
      currentBid += increment;
      highBidder = human;
      clockSeconds = Math.min(maxClock, clockSeconds + 3.0);
      playAudio("CASH");
      updateDisplay();

      if (botFeedEl) {
        const item = document.createElement("div");
        item.className = "auction-feed-item bid-event";
        item.textContent = \`You bid \${currentBid} WP!\`;
        botFeedEl.prepend(item);
      }
    };

    if (plus50Btn) plus50Btn.onclick = () => handlePlayerBid(50);
    if (plus100Btn) plus100Btn.onclick = () => handlePlayerBid(100);
    if (passBtn) {
      passBtn.onclick = () => {
        withdrawnPlayers.add(0);
        if (passBtn) passBtn.disabled = true;
        if (plus50Btn) plus50Btn.disabled = true;
        if (plus100Btn) plus100Btn.disabled = true;
        if (botFeedEl) {
          const item = document.createElement("div");
          item.className = "auction-feed-item";
          item.textContent = "You passed (withdrew from bidding).";
          botFeedEl.prepend(item);
        }
      };
    }

    const runBotBids = () => {
      if (settled || (gameState.activeAuction && gameState.activeAuction.isEmergencyFrozen)) return;
      const bots = gameState.players.filter((p) => p.isBot && !withdrawnPlayers.has(p.id));
      if (bots.length === 0 && withdrawnPlayers.has(0)) {
        conclude();
        return;
      }

      const bot = bots[Math.floor(Math.random() * bots.length)];
      if (!bot) return;

      if (typeof CardiopolyAI !== "undefined" && typeof CardiopolyAI.decideAuctionBid === "function") {
        const decision = CardiopolyAI.decideAuctionBid(bot, tile, currentBid, highBidder, gameState, gameState.aiDifficulty);
        if (decision.bid && decision.amount > currentBid) {
          currentBid = decision.amount;
          highBidder = bot;
          clockSeconds = Math.min(maxClock, clockSeconds + 2.5);
          playAudio("CASH");
          updateDisplay();

          if (botFeedEl) {
            const item = document.createElement("div");
            item.className = "auction-feed-item bid-event";
            const quip = (typeof CardiopolyAI.generateBotQuip === "function")
              ? CardiopolyAI.generateBotQuip(bot, "OUTBID_USER", { propertyName: tile.name }, gameState.aiDifficulty)
              : "";
            item.textContent = \`\${bot.shortName} raised bid to \${currentBid} WP! \${quip ? \`"\${quip}"\` : ""}\`;
            botFeedEl.prepend(item);
          }
        } else {
          if (currentBid >= decision.maxWillingToPay) {
            withdrawnPlayers.add(bot.id);
          }
        }
      }
    };

    const tickClock = () => {
      if (settled || (gameState.activeAuction && gameState.activeAuction.isEmergencyFrozen)) return;
      clockSeconds -= 0.1;
      updateDisplay();
      if (clockSeconds <= 0) {
        conclude();
      }
    };

    let botBidIntervalId = setInterval(runBotBids, 1200);
    let clockIntervalId = setInterval(tickClock, 100);

    const pauseAuction = () => {
      if (settled) return;
      if (clockIntervalId) {
        clearInterval(clockIntervalId);
        clockIntervalId = null;
      }
      if (botBidIntervalId) {
        clearInterval(botBidIntervalId);
        botBidIntervalId = null;
      }
      if (gameState.activeAuction) {
        gameState.activeAuction.isEmergencyFrozen = true;
        gameState.activeAuction.preservedSeconds = clockSeconds;
      }
      const auctionModal = document.getElementById("auction-modal");
      if (auctionModal) {
        let banner = document.getElementById("auction-paused-banner");
        if (!banner) {
          banner = document.createElement("div");
          banner.id = "auction-paused-banner";
          banner.className = "auction-paused-warning";
          banner.textContent = "⚠️ AUCTION PAUSED // CODE BLUE EMERGENCY IN PROGRESS";
          auctionModal.appendChild(banner);
        }
        banner.classList.remove("hidden");
      }
    };

    const resumeAuction = () => {
      if (settled) return;
      if (gameState.activeAuction) {
        gameState.activeAuction.isEmergencyFrozen = false;
      }
      const banner = document.getElementById("auction-paused-banner");
      if (banner) banner.classList.add("hidden");

      if (!botBidIntervalId) {
        botBidIntervalId = setInterval(runBotBids, 1200);
        if (gameState.activeAuction) gameState.activeAuction.botBidIntervalId = botBidIntervalId;
      }
      if (!clockIntervalId) {
        clockIntervalId = setInterval(tickClock, 100);
        if (gameState.activeAuction) gameState.activeAuction.clockIntervalId = clockIntervalId;
      }
      updateDisplay();
    };

    gameState.activeAuction = {
      tile,
      clockIntervalId,
      botBidIntervalId,
      conclude,
      pauseAuction,
      resumeAuction,
      getRemainingSeconds: () => clockSeconds,
      isEmergencyFrozen: false
    };`;

const normT2 = normalize(target2);
const normR2 = normalize(replacement2);

if (!updated.includes(normT2)) {
  console.error("Target 2 not found in script.js!");
  process.exit(1);
}

updated = updated.replace(normT2, normR2);
console.log("✓ Applied replacement 2: auction pauseAuction/resumeAuction integration");

// Convert back to CRLF
const finalCode = updated.replace(/\n/g, '\r\n');
fs.writeFileSync(scriptPath, finalCode, 'utf8');
console.log("Successfully wrote updated script.js with CRLF!");
