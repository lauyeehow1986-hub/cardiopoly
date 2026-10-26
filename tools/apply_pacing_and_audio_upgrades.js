const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. UPDATE patches/cardiopoly_script_patches.js
const scriptPatchesPath = path.join(ROOT, 'patches', 'cardiopoly_script_patches.js');
let patchesCode = fs.readFileSync(scriptPatchesPath, 'utf8');

// Add playHospitalChime to CardiopolyAudioEngineV2
if (!patchesCode.includes('playHospitalChime()')) {
  patchesCode = patchesCode.replace(
    /startClinicalLoFiSoundtrack\(\)\s*\{/,
    `playHospitalChime() {
    this.initContext();
    if (!this.ctx) return;
    const chimeFreqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6 (Cmaj9 arpeggio)
    chimeFreqs.forEach((freq, idx) => {
      this.playEnvelopedTone(freq, 0.45, 'triangle', 0.042, idx * 0.045);
    });
  }

  startClinicalLoFiSoundtrack() {`
  );

  // Enhance heartbeat sub-bass modulation with SBP
  patchesCode = patchesCode.replace(
    /const bassFreq = measureStep === 0 \? 55 : 44;\s*this\.playEnvelopedTone\(bassFreq, 0\.16, 'sine', 0\.055 \* duckMultiplier, 0\);/,
    `const bassFreq = measureStep === 0 ? 55 : 44;
        const waveType = sbp >= 175 ? 'sawtooth' : (sbp >= 145 ? 'triangle' : 'sine');
        const peakGain = (sbp >= 175 ? 0.075 : (sbp >= 145 ? 0.065 : 0.052)) * duckMultiplier;
        this.playEnvelopedTone(bassFreq, 0.16, waveType, peakGain, 0);`
  );

  fs.writeFileSync(scriptPatchesPath, patchesCode, 'utf8');
  console.log('[cardiopoly_script_patches.js] Added playHospitalChime and dynamic heartbeat modulation');
}

// 2. UPDATE index.html (Audio unlock on Enter Simulation)
const indexPath = path.join(ROOT, 'index.html');
let htmlCode = fs.readFileSync(indexPath, 'utf8');

if (!htmlCode.includes('playHospitalChime')) {
  htmlCode = htmlCode.replace(
    /enterBtn\.addEventListener\("click", function\(e\) \{\s*e\.stopPropagation\(\);\s*dismissSplash\(\);/,
    `enterBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (typeof window.CardiopolyAudioSynth !== "undefined" && typeof window.CardiopolyAudioSynth.playHospitalChime === "function") {
            try { window.CardiopolyAudioSynth.playHospitalChime(); } catch(_) {}
          } else if (typeof window.CardiopolyPatches?.cardiopolyAudioV2?.playHospitalChime === "function") {
            try { window.CardiopolyPatches.cardiopolyAudioV2.playHospitalChime(); } catch(_) {}
          }
          dismissSplash();`
  );
  fs.writeFileSync(indexPath, htmlCode, 'utf8');
  console.log('[index.html] Wired playHospitalChime audio context warmup on ENTER SIMULATION');
}

// 3. UPDATE script.js (Dynamic token step delay & synergy resolution)
const scriptPath = path.join(ROOT, 'script.js');
let scriptCode = fs.readFileSync(scriptPath, 'utf8');

// Dynamic token pacing
if (!scriptCode.includes('userStepDelay')) {
  scriptCode = scriptCode.replace(
    /const stepDelay = player\.isBot \? BOT_TOKEN_STEP_MS : USER_TOKEN_STEP_MS;/,
    `const userStepDelay = totalSteps > 6 ? Math.max(110, Math.round(280 - (totalSteps - 6) * 24)) : 220;
  const botStepDelay = totalSteps > 6 ? 55 : BOT_TOKEN_STEP_MS;
  const stepDelay = player.isBot ? botStepDelay : userStepDelay;`
  );
  console.log('[script.js] Applied dynamic token movement pacing curve');
}

// Wire suite synergies and career compendium into applyClinicalDecisionToPlayer
if (!scriptCode.includes('ACTIVE SYNERGY:')) {
  const targetFn = `function applyClinicalDecisionToPlayer(player, decision, scenario) {
  if (!player || !decision) return;`;

  const synergyInjection = `function applyClinicalDecisionToPlayer(player, decision, scenario) {
  if (!player || !decision) return;

  // Active Hospital Suite Synergies & Longitudinal Follow-Up Queue
  if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.evaluateVignetteWithSynergies === "function") {
    try {
      const ownedSuiteNames = (gameState.tiles || [])
        .filter(t => t.owner === player.id)
        .map(t => t.name);
      
      const choiceType = decision.choiceId === "CHOICE_GDMT" 
        ? "GDMT" 
        : (decision.choiceId === "CHOICE_INTERVENTION" ? "INVASIVE" : "COST_CONTAINMENT");

      const synergyOutcome = CardiopolyPatches.evaluateVignetteWithSynergies(
        player,
        ownedSuiteNames,
        {
          gdmtDelta: decision.gdmtPoints || 0,
          rvuDelta: decision.rvuPoints || 0,
          sbpDelta: decision.sbpDelta || 0,
          wasteDelta: decision.wasteDelta || 0
        },
        choiceType,
        gameState
      );

      if (synergyOutcome && synergyOutcome.activeSynergies && synergyOutcome.activeSynergies.length > 0) {
        if (typeof CardiopolyToasts !== "undefined" && CardiopolyToasts.showToast) {
          CardiopolyToasts.showToast({
            title: "ACTIVE SUITE SYNERGY",
            message: synergyOutcome.activeSynergies.join(" • "),
            theme: "info",
            durationMs: 3200
          });
        }
      }
    } catch (_) {}
  }

  // Persist landmark trials in Career Compendium
  if (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.recordVignetteTrialInCompendium === "function") {
    try {
      const trialName = (scenario && scenario.trialRef) || (decision.choiceId === "CHOICE_GDMT" ? "PARADIGM-HF" : "COURAGE");
      CardiopolyPatches.recordVignetteTrialInCompendium(trialName, decision.choiceId === "CHOICE_GDMT");
    } catch (_) {}
  }`;

  scriptCode = scriptCode.replace(targetFn, synergyInjection);
  console.log('[script.js] Wired suite synergies and landmark trial recording into clinical decision resolution');
}

fs.writeFileSync(scriptPath, scriptCode, 'utf8');
console.log('All pacing, audio and synergy upgrades successfully applied.');
