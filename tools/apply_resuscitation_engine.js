const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'patches', 'cardiopoly_script_patches.js');
let code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const engineCode = `
// ============================================================================
// 7. COMPETITIVE EMERGENT CODE BLUE RESUSCITATION QTE ENGINE
// ============================================================================

const ResuscitationEngine = {
  activeSession: null,

  getDifficultyParameters(difficulty = 1) {
    const diff = Math.max(1, Math.min(5, Number(difficulty) || 1));
    return {
      difficulty: diff,
      durationSec: Math.max(3.5, Number((5.0 - (diff - 1) * 0.4).toFixed(1))),
      requiredCompressions: 8 + (diff - 1) * 3,
      rewardWP: 1200 + (diff - 1) * 400,
      rewardGDMT: 10 + (diff - 1) * 5,
      rewardRVU: 500 + (diff - 1) * 250,
      penaltyWP: 1500 + (diff - 1) * 500,
      steps: diff >= 3 
        ? ['airway', 'epinephrine', 'charge', 'compress', 'shock']
        : (diff === 2 ? ['airway', 'charge', 'compress', 'shock'] : ['charge', 'compress', 'shock'])
    };
  },

  computeBotRates(bots = [], difficulty = 1) {
    const p = this.getDifficultyParameters(difficulty);
    const rates = {};
    for (const bot of bots) {
      if (!bot.isBot) continue;
      const f = (bot.faction || bot.factionId || '').toUpperCase();
      let factor = 0.88; // baseline: finishes in 88% of duration
      if (f.includes('INTERVENTIONALIST')) {
        factor = Math.max(0.68, 0.82 - (difficulty - 1) * 0.04); // fastest: Cath lab doc
      } else if (f.includes('AUDITOR')) {
        factor = Math.max(0.72, 0.88 - (difficulty - 1) * 0.03); // moderate: systematic auditor
      } else if (f.includes('CEO')) {
        factor = Math.max(0.76, 0.94 - (difficulty - 1) * 0.02); // deliberate: executive
      } else {
        factor = Math.max(0.70, 0.85 - (difficulty - 1) * 0.03);
      }
      const finishTimeSec = Number((p.durationSec * factor).toFixed(2));
      const rate = Number((100 / finishTimeSec).toFixed(2)); // % progress per second
      rates[bot.id] = { bot, finishTimeSec, rate };
    }
    return rates;
  },

  shouldTriggerEmergentChallenge(gameState, curPlayer, roll = Math.random()) {
    if (!gameState || gameState.isEmergencyFrozen) return false;
    // Condition A: Severe physiological distress
    if (curPlayer && (Number(curPlayer.sbp ?? 120) >= 195 || Number(curPlayer.complications ?? 0) >= 2)) {
      return true;
    }
    // Condition B: Emergent hospital cardiac arrest (after turn 1)
    if (Number(gameState.turnCount ?? 0) >= 2 && roll < 0.10) {
      return true;
    }
    return false;
  },

  resolveOutcome({ winner, winnerId, player, gameState, elapsedSec, difficulty = 1 }) {
    const p = this.getDifficultyParameters(difficulty);
    const bots = (gameState && gameState.players ? gameState.players.filter(x => x.isBot) : []);

    if (winner === 'PLAYER') {
      player.wp = (player.wp || 0) + p.rewardWP;
      player.gdmtScore = Math.min(100, (player.gdmtScore || 70) + p.rewardGDMT);
      player.rvuPoints = (player.rvuPoints || 0) + p.rewardRVU;
      player.sbp = 120;
      player.bmi = 24.5;
      return {
        status: 'PLAYER_VICTORY',
        message: \`🏆 HEROIC RESUSCITATION! You beat the competition in \${elapsedSec.toFixed(2)}s and claimed +\${p.rewardWP} WP Clinical Bounty!\`,
        rewardWP: p.rewardWP,
        rewardGDMT: p.rewardGDMT,
        rewardRVU: p.rewardRVU
      };
    } else if (winner === 'BOT') {
      const winningBot = bots.find(b => b.id === winnerId) || bots[0];
      if (winningBot) {
        winningBot.wp = (winningBot.wp || 0) + p.rewardWP;
      }
      return {
        status: 'BOT_VICTORY',
        winnerName: winningBot ? winningBot.name : 'Computer Clinician',
        message: \`⚠️ BOT RESUSCITATION: \${winningBot ? winningBot.name : 'AI Clinician'} delivered the shock first! Bot claimed +\${p.rewardWP} WP. You missed the bounty.\`,
        rewardWP: p.rewardWP
      };
    } else {
      // Time-out / Asystole Failure
      player.wp = Math.max(0, (player.wp || 0) - p.penaltyWP);
      player.gdmtScore = Math.max(0, (player.gdmtScore || 70) - 10);
      player.complications = (player.complications || 0) + 1;
      player.inJail = true;
      player.jailTurns = 1;
      return {
        status: 'ASYSTOLE_FAILURE',
        message: \`💀 CATASTROPHIC CODE BLUE FAILURE: Resuscitation timed out (\${elapsedSec.toFixed(1)}s)! Patient suffered arrest. -\${p.penaltyWP} WP deducted for CCU life-support and malpractice review. Admitted to CCU lockup.\`,
        penaltyWP: p.penaltyWP
      };
    }
  },

  openChallengeModal(player, gameState, onComplete) {
    if (typeof document === 'undefined') {
      if (onComplete) onComplete({ status: 'SIMULATED' });
      return;
    }

    const diff = Math.min(5, (gameState.codeBlueDifficulty || 0) + 1);
    gameState.codeBlueDifficulty = diff;
    const params = this.getDifficultyParameters(diff);
    const bots = (gameState.players || []).filter(p => p.isBot);
    const botRates = this.computeBotRates(bots, diff);

    // Freeze emergency interaction flow
    if (typeof window.freezeEmergencyState === 'function') {
      window.freezeEmergencyState('CODE_BLUE_QTE');
    }

    // Add perimeter room crisis strobe
    if (document.body?.classList) {
      document.body.classList.add('code-blue-crisis-strobe');
    }

    // Play alarm audio
    if (typeof window.CardiopolyPatches?.playDefibrillatorSequence === 'function') {
      window.CardiopolyPatches.playDefibrillatorSequence();
    }

    let modal = document.getElementById('code-blue-qte-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'code-blue-qte-modal';
      modal.className = 'screen-overlay';
      document.body.appendChild(modal);
    }

    let currentStepIdx = 0;
    let compressionsDone = 0;
    let playerPct = 0;
    const botProgress = {};
    bots.forEach(b => botProgress[b.id] = 0);

    const startTime = performance.now();
    let timerInterval = null;
    let animFrame = null;
    let isFinished = false;

    const render = () => {
      const remainingSec = Math.max(0, params.durationSec - ((performance.now() - startTime) / 1000));
      const currentStep = params.steps[currentStepIdx] || 'shock';

      let actionBtnText = '';
      let actionBtnClass = 'btn-danger';
      if (currentStep === 'airway') {
        actionBtnText = '💨 SECURE AIRWAY (TAP)';
        actionBtnClass = 'btn-primary';
      } else if (currentStep === 'epinephrine') {
        actionBtnText = '💉 INJECT EPINEPHRINE 1mg (TAP)';
        actionBtnClass = 'btn-warning';
      } else if (currentStep === 'charge') {
        actionBtnText = '⚡ CHARGE DEFIBRILLATOR PADDLES (TAP)';
        actionBtnClass = 'btn-warning';
      } else if (currentStep === 'compress') {
        actionBtnText = \`❤️ DELIVER CHEST COMPRESSION (MASH!) [\${compressionsDone}/\${params.requiredCompressions}]\`;
        actionBtnClass = 'btn-danger pulse-action';
      } else {
        actionBtnText = '⚡ CLEAR & DELIVER 200J BIPHASIC SHOCK (TAP)';
        actionBtnClass = 'btn-success';
      }

      const botsMarkup = bots.map(b => {
        const bp = Math.min(100, Math.round(botProgress[b.id] || 0));
        return \`
          <div class="competitor-race-row">
            <div class="competitor-info">
              <span class="competitor-name">\${b.name}</span>
              <span class="competitor-pct">\${bp}%</span>
            </div>
            <div class="competitor-progress-track">
              <div class="competitor-progress-fill bot" style="width: \${bp}%;"></div>
            </div>
          </div>
        \`;
      }).join('');

      modal.innerHTML = \`
        <div class="qte-modal-window" role="dialog" aria-modal="true" aria-label="Code Blue Resuscitation Challenge">
          <div class="qte-header">
            <span class="qte-level-badge">🚨 EMERGENCY CCU PROTOCOL // LEVEL \${diff}</span>
            <h2>EMERGENT CODE BLUE RESUSCITATION</h2>
            <p class="qte-subtitle">Patient in Ventricular Fibrillation! Compete against hospital physicians to resuscitate!</p>
          </div>

          <div class="qte-timer-banner">
            <div class="qte-timer-value \${remainingSec <= 1.5 ? 'urgent' : ''}">
              ⏱️ \${remainingSec.toFixed(2)}s REMAINING
            </div>
            <div class="qte-stakes-badge">
              🏆 Reward: +\$\${params.rewardWP.toLocaleString()} WP | 💀 Fail: -\$\${params.penaltyWP.toLocaleString()} WP
            </div>
          </div>

          <div class="qte-telemetry-box">
            <canvas id="qte-ecg-canvas" width="560" height="60" aria-label="Dynamic V-Fib Telemetry"></canvas>
          </div>

          <div class="qte-competitors-panel">
            <div class="competitor-race-row player-row">
              <div class="competitor-info">
                <span class="competitor-name">👤 YOU (\${player.name || 'Academic Clinician'})</span>
                <span class="competitor-pct" style="color:#22d3ee; font-weight:800;">\${Math.round(playerPct)}%</span>
              </div>
              <div class="competitor-progress-track">
                <div class="competitor-progress-fill player" style="width: \${playerPct}%;"></div>
              </div>
            </div>
            \${botsMarkup}
          </div>

          <div class="qte-action-container">
            <button id="qte-mash-btn" class="btn \${actionBtnClass} btn-qte-action" type="button">
              \${actionBtnText}
            </button>
          </div>
        </div>
      \`;

      modal.classList.remove('hidden');

      // Wire up action button
      const mashBtn = document.getElementById('qte-mash-btn');
      if (mashBtn) {
        mashBtn.onclick = () => {
          if (isFinished) return;

          // Haptic screen shake
          if (document.body?.classList) {
            document.body.classList.add('code-blue-screen-shake');
            setTimeout(() => document.body.classList.remove('code-blue-screen-shake'), 120);
          }

          // Advance player step
          if (currentStep === 'airway' || currentStep === 'epinephrine' || currentStep === 'charge') {
            currentStepIdx++;
          } else if (currentStep === 'compress') {
            compressionsDone++;
            if (compressionsDone >= params.requiredCompressions) {
              currentStepIdx++;
            }
          } else if (currentStep === 'shock') {
            // Player finishes!
            finishChallenge('PLAYER', player.id);
            return;
          }

          // Calculate player % progress
          const totalSteps = params.steps.length;
          const stepWeight = 100 / totalSteps;
          let inStepProgress = 0;
          if (currentStep === 'compress') {
            inStepProgress = (compressionsDone / params.requiredCompressions) * stepWeight;
          }
          playerPct = Math.min(99, Math.round(currentStepIdx * stepWeight + inStepProgress));

          render();
        };
      }
    };

    const finishChallenge = (winner, winnerId) => {
      if (isFinished) return;
      isFinished = true;
      clearInterval(timerInterval);
      if (animFrame && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(animFrame);
      }

      const elapsedSec = (performance.now() - startTime) / 1000;
      const result = this.resolveOutcome({
        winner,
        winnerId,
        player,
        gameState,
        elapsedSec,
        difficulty: diff
      });

      // Play final audio
      if (winner === 'PLAYER') {
        if (typeof window.CardiopolyPatches?.playDefibrillatorSequence === 'function') {
          window.CardiopolyPatches.playDefibrillatorSequence();
        }
      }

      // Render Victory / Defeat screen in modal
      const isPlayerWin = winner === 'PLAYER';
      const isBotWin = winner === 'BOT';
      const icon = isPlayerWin ? '🏆' : (isBotWin ? '⚠️' : '💀');
      const title = isPlayerWin ? 'HEROIC RESUSCITATION ACHIEVED!' : (isBotWin ? 'BOT PHYSICIAN RESUSCITATED FIRST' : 'PATIENT CARDIAC ARREST (ASYSTOLE)');
      const color = isPlayerWin ? '#10b981' : (isBotWin ? '#f59e0b' : '#ef4444');

      modal.innerHTML = \`
        <div class="qte-modal-window" role="dialog" aria-modal="true">
          <div class="qte-header" style="border-bottom: 2px solid \${color};">
            <span class="qte-level-badge" style="background: \${color}; color:#000;">\${icon} \${title}</span>
            <h2 style="color:\${color}; margin-top:8px;">\${result.message}</h2>
          </div>
          <div class="qte-result-body" style="padding: 20px; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1;">
            <p>\${isPlayerWin ? \`Congratulations! You beat the clock in \${elapsedSec.toFixed(2)}s and stabilized patient hemodynamics.\` : (isBotWin ? \`The attending bot was faster to the paddles. You missed the clinical bonus.\` : \`Failure to achieve ROSC within the critical time window. Patient transferred to CCU lockup.\`)}</p>
          </div>
          <div class="qte-action-container">
            <button id="qte-close-btn" class="btn btn-primary" type="button" style="width:100%; padding: 14px;">
              Acknowledge & Resume Simulation
            </button>
          </div>
        </div>
      \`;

      const closeBtn = document.getElementById('qte-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.classList.add('hidden');
          if (document.body?.classList) {
            document.body.classList.remove('code-blue-crisis-strobe');
          }
          if (typeof window.unfreezeEmergencyState === 'function') {
            window.unfreezeEmergencyState('CODE_BLUE_QTE');
          }
          if (typeof refreshAllViews === 'function') {
            refreshAllViews();
          }
          if (onComplete) onComplete(result);
        };
      }
    };

    render();

    // ECG Animated Canvas
    const canvas = document.getElementById('qte-ecg-canvas');
    if (canvas && typeof canvas.getContext === 'function') {
      const ctx = canvas.getContext('2d');
      let offset = 0;
      const drawEcg = () => {
        if (isFinished) return;
        ctx.clearRect(0, 0, 560, 60);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < 560; x += 4) {
          const ph = x * 0.08 + offset;
          const y = 30 + Math.sin(ph) * (Math.random() * 18 + 8);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        offset += 0.25;
        if (typeof requestAnimationFrame !== 'undefined') {
          animFrame = requestAnimationFrame(drawEcg);
        }
      };
      drawEcg();
    }

    // Timer tick interval (50ms)
    timerInterval = setInterval(() => {
      if (isFinished) return;
      const elapsed = (performance.now() - startTime) / 1000;

      // Update bot progresses
      for (const b of bots) {
        const rateInfo = botRates[b.id];
        if (rateInfo) {
          botProgress[b.id] = Math.min(100, elapsed * rateInfo.rate);
          if (botProgress[b.id] >= 100) {
            finishChallenge('BOT', b.id);
            return;
          }
        }
      }

      // Check timeout
      if (elapsed >= params.durationSec) {
        finishChallenge('NONE', null);
        return;
      }

      render();
    }, 50);
  }
};

window.CardiopolyPatches.ResuscitationEngine = ResuscitationEngine;
`;

// Insert engineCode before module.exports
const exportIdx = code.indexOf('if (typeof module !== "undefined" && module.exports)');
if (exportIdx === -1) {
  console.error("Could not find export section in patches");
  process.exit(1);
}

const beforeExport = code.slice(0, exportIdx);
const afterExport = code.slice(exportIdx);

const updatedCode = beforeExport + engineCode + '\n' + afterExport;
fs.writeFileSync(filePath, updatedCode.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Successfully added ResuscitationEngine to cardiopoly_script_patches.js!");
