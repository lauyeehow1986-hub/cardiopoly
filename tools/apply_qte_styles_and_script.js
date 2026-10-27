const fs = require('fs');
const path = require('path');

// 1. Add CSS to styles.css
const stylesPath = path.join(__dirname, '..', 'styles.css');
let css = fs.readFileSync(stylesPath, 'utf8').replace(/\r\n/g, '\n');

const qteCss = `
/* ========================================================
   CODE BLUE COMPETITIVE RESUSCITATION QTE MODAL & MULTI-AGENT RACE
   ======================================================== */
.qte-modal-window {
  position: relative;
  width: 92%;
  max-width: 600px;
  background: #090e1a;
  border: 2px solid #ef4444;
  border-radius: 14px;
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.5), 0 24px 48px rgba(0, 0, 0, 0.9);
  padding: 22px 20px;
  color: #fff;
  z-index: 9999;
  animation: cutinSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.qte-header {
  text-align: center;
  margin-bottom: 14px;
}

.qte-level-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.22);
  border: 1px solid #ef4444;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ef4444;
  margin-bottom: 6px;
}

.qte-header h2 {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #f8fafc;
  margin: 4px 0;
}

.qte-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.qte-timer-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

.qte-timer-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.15rem;
  font-weight: 900;
  color: #38bdf8;
}

.qte-timer-value.urgent {
  color: #ef4444;
  animation: pulseUrgent 0.25s infinite alternate;
}

@keyframes pulseUrgent {
  from { transform: scale(1); filter: brightness(1); }
  to { transform: scale(1.08); filter: brightness(1.5); }
}

.qte-stakes-badge {
  font-size: 0.72rem;
  color: #cbd5e1;
  font-weight: 600;
}

.qte-telemetry-box {
  background: #040711;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  padding: 6px;
  margin-bottom: 14px;
  overflow: hidden;
}

.qte-telemetry-box canvas {
  width: 100%;
  height: 50px;
  display: block;
}

.qte-competitors-panel {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.competitor-race-row {
  margin-bottom: 8px;
}

.competitor-race-row:last-child {
  margin-bottom: 0;
}

.competitor-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  margin-bottom: 3px;
}

.competitor-name {
  font-weight: 700;
  color: #cbd5e1;
}

.competitor-race-row.player-row .competitor-name {
  color: #38bdf8;
}

.competitor-pct {
  font-family: monospace;
  font-weight: 800;
  color: #94a3b8;
}

.competitor-progress-track {
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 4px;
  overflow: hidden;
}

.competitor-progress-fill {
  height: 100%;
  transition: width 0.08s linear;
}

.competitor-progress-fill.player {
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
}

.competitor-progress-fill.bot {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.qte-action-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-qte-action {
  width: 100%;
  min-height: 56px;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.06s ease, filter 0.06s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.btn-qte-action:active {
  transform: scale(0.97);
  filter: brightness(1.25);
}

.btn-qte-action.pulse-action {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
  animation: pulseAction 0.6s infinite alternate;
}

@keyframes pulseAction {
  from { transform: scale(1); }
  to { transform: scale(1.02); box-shadow: 0 0 28px rgba(239, 68, 68, 0.9); }
}
`;

if (!css.includes('.qte-modal-window')) {
  css = css + '\n' + qteCss;
  fs.writeFileSync(stylesPath, css.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✓ Added QTE modal styles to styles.css");
} else {
  console.log("QTE styles already present in styles.css");
}

// 2. Wire into script.js finishPlayerTurn()
const scriptPath = path.join(__dirname, '..', 'script.js');
let script = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

const oldFinishBlock = `  // 1. Dual-Mode Victory: Check Code Blue Hospitalization (Mode A: Clinical Mastery)
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

const newFinishBlock = `  // 1. Emergent Code Blue Resuscitation Quick-Time Event (Competitive Multi-Player)
  const isPhysiologicalCrisis = typeof CardiopolyFactions !== "undefined" &&
                               typeof CardiopolyFactions.checkCodeBlueHospitalization === "function" &&
                               CardiopolyFactions.checkCodeBlueHospitalization(curPlayer, gameState.gameMode).triggered;

  const isEmergentCrisis = typeof CardiopolyPatches !== "undefined" &&
                          CardiopolyPatches.ResuscitationEngine &&
                          CardiopolyPatches.ResuscitationEngine.shouldTriggerEmergentChallenge(gameState, curPlayer);

  if ((isPhysiologicalCrisis || isEmergentCrisis) && !gameState.isEmergencyFrozen) {
    if (typeof CardiopolyMcpBridge !== "undefined" && CardiopolyMcpBridge.cutInOverlay) {
      CardiopolyMcpBridge.cutInOverlay.playCutIn({
        id: 'code_blue',
        title: 'CODE BLUE: CARDIAC ARREST DETECTED',
        subtitle: \`Rapid Response Activated for \${curPlayer.name}! Multi-Physician Resuscitation In Progress\`,
        accentColor: '#ef4444'
      });
    }

    setBoardTicker(\`🚨 CODE BLUE: Cardiac arrest alert! Resuscitation team responding!\`);
    appendCenterConsoleActionLog(\`🚨 CODE BLUE ALERT: \${curPlayer.name} suffered acute arrest. Multi-clinician resuscitation active!\`);
    refreshAllViews();

    if (curPlayer.isBot) {
      // For bots, run the multi-agent race simulation directly
      if (typeof CardiopolyPatches?.ResuscitationEngine === 'object') {
        const diff = Math.min(5, (gameState.codeBlueDifficulty || 0) + 1);
        gameState.codeBlueDifficulty = diff;
        const bots = (gameState.players || []).filter(p => p.isBot);
        const botRates = CardiopolyPatches.ResuscitationEngine.computeBotRates(bots, diff);
        const fastestBot = bots.sort((a, b) => (botRates[a.id]?.finishTimeSec || 99) - (botRates[b.id]?.finishTimeSec || 99))[0];
        
        const outcome = CardiopolyPatches.ResuscitationEngine.resolveOutcome({
          winner: 'BOT',
          winnerId: fastestBot ? fastestBot.id : curPlayer.id,
          player: curPlayer,
          gameState,
          elapsedSec: botRates[fastestBot?.id]?.finishTimeSec || 4.2,
          difficulty: diff
        });

        if (typeof CardiopolyToasts !== "undefined" && CardiopolyToasts.showToast) {
          CardiopolyToasts.showToast({
            title: "CODE BLUE RESUSCITATION",
            message: outcome.message,
            theme: "danger",
            durationMs: 4000
          });
        }
        appendCenterConsoleActionLog(outcome.message);
      }
    } else {
      // For human player, launch the real-time interactive QTE modal!
      await new Promise((resolve) => {
        if (typeof CardiopolyPatches?.ResuscitationEngine?.openChallengeModal === 'function') {
          CardiopolyPatches.ResuscitationEngine.openChallengeModal(curPlayer, gameState, (res) => {
            appendCenterConsoleActionLog(res.message);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
  }`;

if (script.includes(oldFinishBlock)) {
  script = script.replace(oldFinishBlock, newFinishBlock);
  fs.writeFileSync(scriptPath, script.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✓ Successfully hooked competitive emergent QTE into script.js finishPlayerTurn()");
} else {
  console.error("Could not find oldFinishBlock in script.js");
  process.exit(1);
}
