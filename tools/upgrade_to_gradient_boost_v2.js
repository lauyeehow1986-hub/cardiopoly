/**
 * tools/upgrade_to_gradient_boost_v2.js
 * Integrates CardiopolyAudioEngineV2, triggerMultimodalEvent, screen-shake CSS,
 * and Career Compendium HUD view into Cardiopoly.
 */

const fs = require('fs');

console.log('>>> Integrating Gradient Boost v2 Audio & Multimodal Upgrades...');

// 1. Update patches/cardiopoly_script_patches.js
let newScriptPatch = fs.readFileSync('temp_skill_pack/patches/cardiopoly_script_patches.js', 'utf8');

// Ensure UMD compatibility for Node testing
const umdExport = `
// UMD & Node.js test environment support
const rootScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
rootScope.CardiopolyPatches = (typeof window !== 'undefined' && window.CardiopolyPatches) ? window.CardiopolyPatches : {
  CARDIOPOLY_REGIMES_PATCH,
  formatRegimeRuleText,
  FACTION_METADATA,
  resolveFactionKey,
  sanitizePlayerNames,
  computePlayerFactionProgress,
  renderFactionRacePatched,
  updateTelemetryFromActivePlayer,
  spawnFloatingResourceDelta,
  SUITE_SYNERGY_RULES,
  evaluateVignetteWithSynergies,
  loadCareerCompendium,
  recordVignetteTrialInCompendium,
  CardiopolyAudioEngineV2,
  cardiopolyAudioV2,
  triggerMultimodalEvent
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = rootScope.CardiopolyPatches;
}
`;

if (!newScriptPatch.includes('module.exports = rootScope.CardiopolyPatches')) {
  newScriptPatch += umdExport;
  fs.writeFileSync('patches/cardiopoly_script_patches.js', newScriptPatch, 'utf8');
  console.log('✓ Updated patches/cardiopoly_script_patches.js with CardiopolyAudioEngineV2');
}

// 2. Update patches/cardiopoly_styles_patches.css and styles.css
let newStylesPatch = fs.readFileSync('temp_skill_pack/patches/cardiopoly_styles_patches.css', 'utf8');
fs.writeFileSync('patches/cardiopoly_styles_patches.css', newStylesPatch, 'utf8');

let styles = fs.readFileSync('styles.css', 'utf8');
if (!styles.includes('code-blue-screen-shake')) {
  styles += '\r\n\r\n/* --- CODE BLUE CRISIS SCREEN SHAKE --- */\r\n' + `
.code-blue-screen-shake {
  animation: cardiopolyScreenShake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes cardiopolyScreenShake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, -1px, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 2px, 0); }
  40%, 60% { transform: translate3d(6px, -2px, 0); }
}
`;
  fs.writeFileSync('styles.css', styles, 'utf8');
  console.log('✓ Added .code-blue-screen-shake to styles.css');
}

// 3. Update script.js for CardiopolyAudioEngineV2 and Sound button
let script = fs.readFileSync('script.js', 'utf8');

// Hook navbar Sound button to toggleSound()
const oldMuteHandler = `  const muteBtn = document.getElementById("audio-mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
        const muted = window.CardiopolyAudio.audioSynth.toggleMute();
        muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
      }
    });
  }`;

const newMuteHandler = `  const muteBtn = document.getElementById("audio-mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (typeof window !== "undefined" && window.CardiopolyPatches && window.CardiopolyPatches.cardiopolyAudioV2) {
        const isEnabled = window.CardiopolyPatches.cardiopolyAudioV2.toggleSound();
        muteBtn.textContent = isEnabled ? "🔊 Sound: On" : "🔇 Sound: Off";
        muteBtn.classList.toggle("sound-active", isEnabled);
      } else if (window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
        const muted = window.CardiopolyAudio.audioSynth.toggleMute();
        muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
      }
    });
  }`;

if (script.includes(oldMuteHandler)) {
  script = script.replace(oldMuteHandler, newMuteHandler);
  console.log('✓ Hooked navbar Sound button to CardiopolyAudioEngineV2');
}

// Hook playAudio to trigger CardiopolyAudioEngineV2 cues
const oldPlayAudioStart = `function playAudio(action, param) {
  try {
    if (typeof window !== "undefined" && window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
      const synth = window.CardiopolyAudio.audioSynth;
      if (typeof synth.initAudio === "function") synth.initAudio();`;

const newPlayAudioStart = `function playAudio(action, param) {
  try {
    if (typeof window !== "undefined" && window.CardiopolyPatches && window.CardiopolyPatches.cardiopolyAudioV2) {
      const audioV2 = window.CardiopolyPatches.cardiopolyAudioV2;
      switch (action) {
        case "DICE": audioV2.playCue("diceRoll"); break;
        case "CASH": audioV2.playCue("suitePurchase"); break;
        case "DEFIB":
        case "ALARM": audioV2.playCue("codeBlueAlert"); break;
        case "FLATLINE": audioV2.playCue("auditClawback"); break;
      }
    }
    if (typeof window !== "undefined" && window.CardiopolyAudio && window.CardiopolyAudio.audioSynth) {
      const synth = window.CardiopolyAudio.audioSynth;
      if (typeof synth.initAudio === "function") synth.initAudio();`;

if (script.includes(oldPlayAudioStart)) {
  script = script.replace(oldPlayAudioStart, newPlayAudioStart);
  console.log('✓ Hooked playAudio to CardiopolyAudioEngineV2');
}

// Hook step tick sound during player token hopping
const oldHoppingStep = `    const movingTokenEl = document.getElementById(\`board-token-\${player.id}\`);
    if (movingTokenEl) {
      movingTokenEl.classList.add("is-hopping");
      setTimeout(() => movingTokenEl.classList.remove("is-hopping"), 90);
    }`;

const newHoppingStep = `    const movingTokenEl = document.getElementById(\`board-token-\${player.id}\`);
    if (movingTokenEl) {
      movingTokenEl.classList.add("is-hopping");
      setTimeout(() => movingTokenEl.classList.remove("is-hopping"), 90);
      if (typeof window !== "undefined" && window.CardiopolyPatches && window.CardiopolyPatches.cardiopolyAudioV2) {
        window.CardiopolyPatches.cardiopolyAudioV2.playCue("tokenStep", s);
      }
    }`;

if (script.includes(oldHoppingStep)) {
  script = script.replace(oldHoppingStep, newHoppingStep);
  console.log('✓ Hooked token step audio to CardiopolyAudioEngineV2');
}

// Hook multimodal trigger on vignette decision
const oldDecisionSound = `  // Phase 3: Dynamic Vital-Linked Telemetry and Floating Resource Deltas
  if (typeof CardiopolyPatches !== "undefined") {`;

const newDecisionSound = `  // Phase 3: Dynamic Vital-Linked Telemetry, Floating Resource Deltas & Multimodal Cues
  if (typeof CardiopolyPatches !== "undefined") {
    if (typeof CardiopolyPatches.triggerMultimodalEvent === "function") {
      const cue = decision.choiceId === "CHOICE_GDMT" ? "gdmtSelected" : (decision.choiceId === "CHOICE_INTERVENTION" ? "invasiveCath" : "suitePurchase");
      CardiopolyPatches.triggerMultimodalEvent({ player, cueName: cue });
    }`;

if (script.includes(oldDecisionSound)) {
  script = script.replace(oldDecisionSound, newDecisionSound);
  console.log('✓ Hooked triggerMultimodalEvent on vignette decision');
}

// Hook screen shake on Code Blue Hospitalization in finishPlayerTurn
const oldCodeBlueAnim = `      playAudio("DEFIB");
      playAudio("ALARM");
      setBoardTicker(\`🚨 \${codeBlue.message}\`);`;

const newCodeBlueAnim = `      playAudio("DEFIB");
      playAudio("ALARM");
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.add("code-blue-screen-shake");
        setTimeout(() => document.body.classList.remove("code-blue-screen-shake"), 450);
      }
      setBoardTicker(\`🚨 \${codeBlue.message}\`);`;

if (script.includes(oldCodeBlueAnim)) {
  script = script.replace(oldCodeBlueAnim, newCodeBlueAnim);
  console.log('✓ Hooked code-blue-screen-shake on Code Blue hospitalization');
}

// Replace dead multiplayer shell with functional Career Compendium modal renderer
if (!script.includes('function renderCareerCompendiumModal()')) {
  const careerModalFn = `
function renderCareerCompendiumModal() {
  const modal = document.getElementById("multiplayer-modal");
  if (!modal) return;
  const data = (typeof CardiopolyPatches !== "undefined" && typeof CardiopolyPatches.loadCareerCompendium === "function")
    ? CardiopolyPatches.loadCareerCompendium()
    : { matchesPlayed: 0, winsByFaction: { ACADEMIC: 0, INTERVENTIONALIST: 0, CEO: 0, AUDITOR: 0 }, trialsEncountered: ["CURE", "PLATO"], lifetimeGdmtChoices: 0, lifetimeTotalChoices: 0 };

  const trialsList = ["CURE", "PLATO", "COURAGE", "ISCHEMIA", "PARADIGM-HF", "MADIT-II"];
  const trialCardsHtml = trialsList.map((trial) => {
    const isUnlocked = data.trialsEncountered && data.trialsEncountered.includes(trial);
    const descriptions = {
      CURE: "Dual antiplatelet therapy in UA/NSTEMI reduces cardiovascular death and MI.",
      PLATO: "Ticagrelor reduces mortality compared to clopidogrel across acute coronary syndromes.",
      COURAGE: "Optimal medical therapy is non-inferior to initial PCI in stable ischemic heart disease.",
      ISCHEMIA: "Routine invasive therapy does not reduce overall ischemic events in stable CAD.",
      "PARADIGM-HF": "ARNI (Sacubitril/Valsartan) reduces cardiovascular death and hospitalization in HFrEF.",
      "MADIT-II": "Prophylactic ICD implantation improves survival in patients with prior MI and LVEF <= 30%."
    };
    return \`
      <div style="background:\${isUnlocked ? 'rgba(16,185,129,0.12)' : 'rgba(30,41,59,0.6)'}; border:1px solid \${isUnlocked ? 'rgba(52,211,153,0.5)' : 'rgba(148,163,184,0.2)'}; border-radius:8px; padding:10px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:\${isUnlocked ? '#34d399' : '#94a3b8'}; font-size:0.95rem;">\${isUnlocked ? '⭐ ' : '🔒 '}\${trial}</strong>
          <span style="font-size:0.75rem; color:\${isUnlocked ? '#34d399' : '#64748b'}; font-weight:700;">\${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
        </div>
        <p style="font-size:0.78rem; color:#cbd5e1; margin-top:4px; line-height:1.4;">\${descriptions[trial] || "Cardiology Landmark Clinical Trial"}</p>
      </div>
    \`;
  }).join("");

  const hostSection = document.getElementById("tab-host");
  if (hostSection) {
    hostSection.innerHTML = \`
      <div class="career-compendium-panel">
        <h3 style="color:#f8fafc; font-size:1.1rem; margin-bottom:8px;">🏆 Career Compendium & Landmark Trial Registry</h3>
        <p style="color:#94a3b8; font-size:0.8rem; margin-bottom:12px;">Persistent career history and landmark trials unlocked across your matches.</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:14px;">
          <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.4rem; font-weight:700; color:#38bdf8;">\${data.matchesPlayed || 0}</div>
            <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Matches Played</div>
          </div>
          <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.4rem; font-weight:700; color:#34d399;">\${data.trialsEncountered ? data.trialsEncountered.length : 0} / 6</div>
            <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Trials Unlocked</div>
          </div>
          <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.4rem; font-weight:700; color:#facc15;">\${data.lifetimeTotalChoices > 0 ? Math.round((data.lifetimeGdmtChoices / data.lifetimeTotalChoices) * 100) : 0}%</div>
            <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Lifetime GDMT %</div>
          </div>
        </div>
        <h4 style="color:#38bdf8; font-size:0.88rem; margin-bottom:8px;">Landmark Trials Unlocked</h4>
        <div style="max-height:260px; overflow-y:auto; padding-right:4px;">
          \${trialCardsHtml}
        </div>
      </div>
    \`;
  }
}
`;
  script += '\r\n' + careerModalFn;
  console.log('✓ Added renderCareerCompendiumModal to script.js');
}

// Hook multiplayer button to open Career Compendium
const oldMultiBtn = `const multiBtn = document.getElementById("multiplayer-btn");
  if (multiBtn) {
    multiBtn.addEventListener("click", () => {
      openMultiplayerModal();
    });
  }`;

const newMultiBtn = `const multiBtn = document.getElementById("multiplayer-btn");
  if (multiBtn) {
    multiBtn.addEventListener("click", () => {
      if (typeof renderCareerCompendiumModal === "function") {
        renderCareerCompendiumModal();
      }
      openMultiplayerModal();
    });
  }`;

if (script.includes(oldMultiBtn)) {
  script = script.replace(oldMultiBtn, newMultiBtn);
  console.log('✓ Hooked multiplayer button to renderCareerCompendiumModal');
}

fs.writeFileSync('script.js', script, 'utf8');
console.log('✓ script.js upgrade complete!');

// 4. Update index.html navbar button title
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(
  'title="Multiplayer &amp; Global Leaderboards">🌐 Multiplayer</button>',
  'title="Career Compendium &amp; Landmark Trials">🏆 Career &amp; Trials</button>'
);
fs.writeFileSync('index.html', index, 'utf8');
console.log('✓ Updated index.html navbar button to Career & Trials');

console.log('>>> All Gradient Boost v2 upgrades applied successfully!');
