/**
 * CARDIOPOLY — Drop-In JavaScript Patch & Gameplay Upgrade Module (`cardiopoly_script_patches.js`)
 * Target Repository: https://lauyeehow1986-hub.github.io/cardiopoly/ (`script.js`)
 *
 * Fixes & Upgrades Included:
 * 1. Normalizes all 9 Healthcare Regimes so `RVU mult undefinedx` never occurs, adding active regime hooks.
 * 2. Fixes `renderFactionRace()` so `undefined (undefined%)` and truncated faction strings are replaced
 *    with accurate real-time progress bars and clean role badges (`ACAD`, `IC`, `CEO`, `AUDIT`).
 * 3. Replaces placeholder AI names (`Fat Slob`, `Lazy Larry`, `Sloppy Susan`) with faction-matched clinical personas.
 * 4. Adds non-destructive in-game Options pause/resume state handling.
 * 5. Adds Dynamic Vital-Linked ECG Telemetry rendering (NSR -> Sinus Tachycardia -> Pre-Code Blue NSVT).
 * 6. Adds Longitudinal Patient Follow-Up Queue, Hospital Suite <-> Vignette Synergies, and Career Compendium (`localStorage`).
 */

// ============================================================================
// 1. NORMALIZED HEALTHCARE REGIMES (Fixes `RVU mult undefinedx`)
// ============================================================================
const CARDIOPOLY_REGIMES_PATCH = {
  singapore: {
    id: 'singapore',
    name: 'Singapore (3M)',
    coPayRate: 0.15,
    rvuMult: 1.00,
    rvuMultiplier: 1.00,
    rentMult: 1.05,
    rentMultiplier: 1.05,
    specialRule: 'MediSave/MediShield buffer reduces Code Blue bail by 30% when GDMT >= 75%.'
  },
  usa: {
    id: 'usa',
    name: 'United States (Commercial FFS)',
    coPayRate: 0.25,
    rvuMult: 1.60,
    rvuMultiplier: 1.60,
    rentMult: 1.35,
    rentMultiplier: 1.35,
    specialRule: '1.6x RVU procedural extraction; M&M peer-review sanctions carry +50% WP penalty.'
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom (NHS Single-Payer)',
    coPayRate: 0.00,
    rvuMult: 0.75,
    rvuMultiplier: 0.75,
    rentMult: 0.85,
    rentMultiplier: 0.85,
    specialRule: 'NICE cost-effectiveness mandate: Selecting GDMT Protocol grants +100 WP bonus.'
  },
  sweden: {
    id: 'sweden',
    name: 'Sweden (SWEDEHEART)',
    coPayRate: 0.05,
    rvuMult: 0.95,
    rvuMultiplier: 0.95,
    rentMult: 1.00,
    rentMultiplier: 1.00,
    specialRule: 'Registry quality bonus: Collect +250 WP at GO (ER Triage) when GDMT adherence >= 80%.'
  },
  japan: {
    id: 'japan',
    name: 'Japan (Chuikyo)',
    coPayRate: 0.10,
    rvuMult: 0.90,
    rvuMultiplier: 0.90,
    rentMult: 0.95,
    rentMultiplier: 0.95,
    specialRule: 'Biennial fee schedule: Diagnostic suites (ECG room, Telemetry bed) cost 20% less to upgrade.'
  },
  south_korea: {
    id: 'south_korea',
    name: 'South Korea (HIRA)',
    coPayRate: 0.20,
    rvuMult: 1.15,
    rvuMultiplier: 1.15,
    rentMult: 1.10,
    rentMultiplier: 1.10,
    specialRule: 'Automated HIRA claim audit increases Regulatory Auditor clawback yield by +15%.'
  },
  taiwan: {
    id: 'taiwan',
    name: 'Taiwan (Global Budget)',
    coPayRate: 0.10,
    rvuMult: 1.05,
    rvuMultiplier: 1.05,
    rentMult: 1.00,
    rentMultiplier: 1.00,
    specialRule: 'Floating point value: Effective RVU multiplier drops by 0.20x when global waste exceeds 5,000 WP.'
  },
  malaysia: {
    id: 'malaysia',
    name: 'Malaysia (MOH Care)',
    coPayRate: 0.05,
    rvuMult: 0.85,
    rvuMultiplier: 0.85,
    rentMult: 0.90,
    rentMultiplier: 0.90,
    specialRule: 'Public safety net: Clinic-tier properties can be unmortgaged without the 10% interest surcharge.'
  },
  indonesia: {
    id: 'indonesia',
    name: 'Indonesia (BPJS Kesehatan)',
    coPayRate: 0.00,
    rvuMult: 0.80,
    rvuMultiplier: 0.80,
    rentMult: 0.90,
    rentMultiplier: 0.90,
    specialRule: 'INA-CBG bundled payment: Cost Containment choices incur 50% less SBP and BMI penalty.'
  }
};

/**
 * Safe formatter for the Setup Screen "Host Healthcare System" rule description.
 * Prevents `RVU mult undefinedx` even if a regime object uses legacy keys.
 */
function formatRegimeRuleText(regime) {
  if (!regime) return 'Key Rule: Standard reimbursement parameters active.';
  const coPayPct = Math.round(Number(regime.coPayRate ?? regime.copay ?? 0) * 100);
  const rvuMult = Number(regime.rvuMult ?? regime.rvuMultiplier ?? regime.rvu ?? 1.0).toFixed(2);
  const rentMult = Number(regime.rentMult ?? regime.rentMultiplier ?? regime.rent ?? 1.0).toFixed(2);
  const hookText = regime.specialRule ? ` | ${regime.specialRule}` : '';
  return `Key Rule: Co-pay rate ${coPayPct}%, RVU mult ${rvuMult}x, Rent mult ${rentMult}x${hookText}`;
}

// ============================================================================
// 2. THEMATIC AI PERSONAS & FACTION BADGES (Replaces placeholder AI names)
// ============================================================================
const FACTION_METADATA = {
  ACADEMIC: {
    id: 'ACADEMIC',
    badge: 'ACAD',
    fullName: 'Academic Clinician',
    aiDefaultName: 'Dr. Guidelines',
    tokenSvg: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M4 4v5a6 6 0 0 0 12 0V4"/><path d="M10 15v2a4 4 0 0 0 8 0v-3"/><circle cx="18" cy="12" r="2"/></svg>`
  },
  INTERVENTIONALIST: {
    id: 'INTERVENTIONALIST',
    badge: 'IC',
    fullName: 'Interventionalist',
    aiDefaultName: 'Dr. Cath-A-Lot',
    tokenSvg: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
  },
  CEO: {
    id: 'CEO',
    badge: 'CEO',
    fullName: 'Hospital CEO',
    aiDefaultName: 'V.P. Margin',
    tokenSvg: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`
  },
  AUDITOR: {
    id: 'AUDITOR',
    badge: 'AUDIT',
    fullName: 'Regulatory Auditor',
    aiDefaultName: 'Inspector Clawback',
    tokenSvg: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
  }
};

function resolveFactionKey(rawFactionString = '') {
  const upper = String(rawFactionString).toUpperCase();
  if (upper.includes('ACADEMIC')) return 'ACADEMIC';
  if (upper.includes('INTERVENT')) return 'INTERVENTIONALIST';
  if (upper.includes('CEO') || upper.includes('HOSPITAL')) return 'CEO';
  if (upper.includes('AUDIT') || upper.includes('REGULAT')) return 'AUDITOR';
  return 'ACADEMIC';
}

function sanitizePlayerNames(players = []) {
  const legacyNames = new Set(['Fat Slob', 'Lazy Larry', 'Sloppy Susan']);
  players.forEach((p, idx) => {
    const fKey = resolveFactionKey(p.faction || p.factionId || p.role);
    const meta = FACTION_METADATA[fKey];
    p.factionBadge = meta.badge;
    if (!p.isHuman && (!p.name || legacyNames.has(p.name))) {
      p.name = meta.aiDefaultName || `Attending AI #${idx}`;
    }
  });
}

// ============================================================================
// 3. FIXED FACTION RACE RENDERER (Eliminates `undefined (undefined%)`)
// ============================================================================
function computePlayerFactionProgress(player, gameState = {}) {
  const mode = gameState.mode || 'clinical_mastery';
  const fKey = resolveFactionKey(player.faction || player.factionId || player.role);

  // Extract safe numerical stats from player object
  const gdmtPoints = Number(player.gdmtPoints ?? player.gdmt ?? 0);
  const encounters = Math.max(0, Number(player.encounters ?? player.vignettesCompleted ?? 0));
  const gdmtRate = Number(
    player.gdmtAdherence ??
    (encounters > 0 ? Math.min(100, Math.round((gdmtPoints / (encounters * 15)) * 100)) : 0)
  );
  const complications = Number(player.complications ?? 0);
  const rvu = Number(player.rvu ?? player.rvus ?? 0);
  const sanctions = Number(player.sanctions ?? 0);
  const monopolies = Number(player.monopolies ?? player.colorMonopolies ?? 0);
  const wp = Number(player.wp ?? player.margin ?? player.money ?? 0);
  const clawback = Number(player.auditClawback ?? player.clawback ?? 0);
  const sbp = Number(player.sbp ?? 120);
  const bmi = Number(player.bmi ?? 24.0);

  // Mode 2: Bureaucratic Satire (Classic Escalation Mode)
  if (mode === 'bureaucratic_satire' || mode === 'satire') {
    const sbpPct = Math.max(0, ((sbp - 120) / (200 - 120)) * 100);
    const wpPct = Math.max(0, (wp / 10000) * 100);
    const bmiPct = Math.max(0, ((bmi - 24) / (70 - 24)) * 100);
    const maxPct = Math.min(100, Math.round(Math.max(sbpPct, wpPct, bmiPct)));
    return {
      pct: maxPct,
      statusText: `SBP ${sbp}/200 · WP ${wp.toLocaleString()}/10k · BMI ${bmi.toFixed(1)}/70 (${maxPct}%)`
    };
  }

  // Mode 1: Clinical Mastery (Faction-Specific Victory Targets)
  switch (fKey) {
    case 'ACADEMIC': {
      const gdmtRatio = Math.min(1, gdmtRate / 85);
      const encRatio = Math.min(1, encounters / 12);
      let pct = Math.round((gdmtRatio * 0.5 + encRatio * 0.5) * 100);
      if (complications >= 2) pct = Math.min(pct, 75);
      return {
        pct,
        statusText: `${gdmtRate}% GDMT · ${encounters}/12 Cases · ${complications}/2 Comp (${pct}%)`
      };
    }
    case 'INTERVENTIONALIST': {
      let pct = Math.min(100, Math.round((rvu / 12000) * 100));
      if (sanctions >= 3) pct = Math.min(pct, 80);
      return {
        pct,
        statusText: `${rvu.toLocaleString()}/12k RVU · ${sanctions}/3 Sanctions (${pct}%)`
      };
    }
    case 'CEO': {
      const monoRatio = Math.min(1, monopolies / 3);
      const wpRatio = Math.min(1, Math.max(0, wp) / 10000);
      const pct = Math.min(100, Math.round(Math.max(monoRatio, wpRatio) * 100));
      return {
        pct,
        statusText: `${monopolies}/3 Monopolies · ${wp.toLocaleString()}/10k WP (${pct}%)`
      };
    }
    case 'AUDITOR': {
      const pct = Math.min(100, Math.round((clawback / 15000) * 100));
      return {
        pct,
        statusText: `${clawback.toLocaleString()}/15k WP Clawback (${pct}%)`
      };
    }
    default:
      return { pct: 0, statusText: `0%` };
  }
}

function renderFactionRacePatched(containerEl, players = [], gameState = {}) {
  if (!containerEl) return;
  sanitizePlayerNames(players);

  const rowsHtml = players
    .map((player) => {
      const fKey = resolveFactionKey(player.faction || player.factionId || player.role);
      const meta = FACTION_METADATA[fKey];
      const { pct, statusText } = computePlayerFactionProgress(player, gameState);
      const barColor = player.color || '#22d3ee';

      return `
        <div class="faction-race-row" style="margin-bottom: 10px;">
          <div class="faction-race-header" style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; margin-bottom:4px;">
            <span style="font-weight:600; color:#f8fafc;">
              ${player.name} <span class="faction-badge-pill" style="padding:1px 6px; border-radius:4px; background:rgba(34,211,238,0.15); color:#38bdf8; font-size:0.72rem; margin-left:4px;">${meta.badge}</span>
            </span>
            <span style="color:#94a3b8; font-family:monospace; font-size:0.78rem;">${statusText}</span>
          </div>
          <div class="faction-race-track" style="height:8px; background:rgba(15,23,42,0.85); border-radius:999px; overflow:hidden; border:1px solid rgba(148,163,184,0.2);">
            <div class="faction-race-fill" style="width:${pct}%; height:100%; background:${barColor}; transition:width 0.35s ease;"></div>
          </div>
        </div>
      `;
    })
    .join('');

  containerEl.innerHTML = `<div class="faction-race-list">${rowsHtml}</div>`;
}

// ============================================================================
// 4. DYNAMIC VITAL-LINKED TELEMETRY & FLOATING DELTA CALLOUTS
// ============================================================================
function updateTelemetryFromActivePlayer(player) {
  if (!player) return;
  const sbp = Number(player.sbp ?? 120);
  const bmi = Number(player.bmi ?? 24.0);
  const dia = Math.round(sbp * 0.66);
  const hr = Math.min(168, Math.round(72 + Math.max(0, sbp - 120) * 0.85 + Math.max(0, bmi - 24) * 0.6));

  const hrEl = document.querySelector('[data-telemetry="hr"], .telemetry-hr');
  const bpEl = document.querySelector('[data-telemetry="bp"], .telemetry-bp');
  const rhythmEl = document.querySelector('[data-telemetry="rhythm"], .telemetry-rhythm');
  const traceEl = document.querySelector('.ecg-trace, #ecg-waveform');

  let strokeColor = '#10b981'; // Emerald NSR
  let rhythmLabel = 'Normal Sinus Rhythm';

  if (sbp >= 175 || bmi >= 60) {
    strokeColor = '#ef4444'; // Crimson Code Blue Warning
    rhythmLabel = 'WARNING: Runs of NSVT / Hypertensive Crisis';
  } else if (sbp >= 145 || bmi >= 40) {
    strokeColor = '#f59e0b'; // Amber Sinus Tachycardia
    rhythmLabel = 'Sinus Tachycardia / LV Strain';
  }

  if (hrEl) hrEl.textContent = `${hr} BPM`;
  if (bpEl) bpEl.textContent = `${sbp}/${dia} mmHg`;
  if (rhythmEl) {
    rhythmEl.textContent = rhythmLabel;
    rhythmEl.style.color = strokeColor;
  }
  if (traceEl) {
    traceEl.style.setProperty('--ecg-color', strokeColor);
    traceEl.style.stroke = strokeColor;
  }
}

function spawnFloatingResourceDelta(anchorSelector, labelText, tone = 'positive') {
  const anchor = typeof anchorSelector === 'string' ? document.querySelector(anchorSelector) : anchorSelector;
  if (!anchor) return;
  const badge = document.createElement('div');
  badge.className = `floating-delta-badge delta-${tone}`;
  badge.textContent = labelText;
  anchor.style.position = anchor.style.position || 'relative';
  anchor.appendChild(badge);
  setTimeout(() => badge.remove(), 1450);
}

// ============================================================================
// 5. HOSPITAL SUITE <-> CLINICAL VIGNETTE SYNERGIES & FOLLOW-UP QUEUE
// ============================================================================
const SUITE_SYNERGY_RULES = [
  {
    suiteNames: ['ECG room', 'UA area'],
    bonusLabel: 'ACS Pipeline Synergy (+5 GDMT, -50 WP Waste)',
    applyBonus(outcome) {
      outcome.gdmtDelta = (outcome.gdmtDelta || 0) + 5;
      outcome.wasteDelta = (outcome.wasteDelta || 0) - 50;
      outcome.complicationProb = Math.max(0, (outcome.complicationProb || 0) * 0.5);
    }
  },
  {
    suiteNames: ['Telemetry bed', 'Palliative reality room'],
    bonusLabel: 'CCU / Telemetry Shield (Prevents SBP Spike & -40% M&M Risk)',
    applyBonus(outcome) {
      if (outcome.sbpDelta > 0) outcome.sbpDelta = 0;
      outcome.complicationProb = Math.max(0, (outcome.complicationProb || 0) * 0.6);
    }
  },
  {
    suiteNames: ['CPET lab'],
    bonusLabel: 'Cardiac Rehab Synergy (-3 SBP, -0.4 BMI on GDMT)',
    applyBonus(outcome, choiceType) {
      if (choiceType === 'GDMT') {
        outcome.sbpDelta = (outcome.sbpDelta || 0) - 3;
        outcome.bmiDelta = (outcome.bmiDelta || 0) - 0.4;
      }
    }
  },
  {
    suiteNames: ['Pharma Rep Steak Dinner'],
    bonusLabel: 'Industry Hospitality (+20% Invasive RVUs, +15% Audit Exposure)',
    applyBonus(outcome, choiceType) {
      if (choiceType === 'INVASIVE') {
        outcome.rvuDelta = Math.round((outcome.rvuDelta || 0) * 1.2);
        outcome.auditExposure = (outcome.auditExposure || 0) + 0.15;
      }
    }
  }
];

function evaluateVignetteWithSynergies(player, ownedTileNames = [], baseOutcome = {}, choiceType = 'GDMT', gameState = {}) {
  const outcome = { ...baseOutcome };
  const activeSynergies = [];
  const ownedSet = new Set(ownedTileNames.map((n) => String(n).toLowerCase()));

  SUITE_SYNERGY_RULES.forEach((rule) => {
    const hasMatch = rule.suiteNames.some((s) => ownedSet.has(s.toLowerCase()));
    if (hasMatch) {
      rule.applyBonus(outcome, choiceType);
      activeSynergies.push(rule.bonusLabel);
    }
  });

  // Schedule longitudinal patient follow-up if Cost Containment or aggressive stenting chosen
  if (choiceType === 'COST_CONTAINMENT' || (choiceType === 'INVASIVE' && baseOutcome.guidelineDiscordant)) {
    gameState.followUpQueue = gameState.followUpQueue || [];
    gameState.followUpQueue.push({
      playerId: player.id,
      triggerTurn: (gameState.turnNumber || 1) + 6,
      patientName: baseOutcome.patientName || 'Readmitted ACS Patient',
      reason:
        choiceType === 'COST_CONTAINMENT'
          ? 'Unscheduled ER Readmission after premature Cost Containment discharge'
          : 'Subacute Stent Thrombosis / M&M Peer Review Inquiry',
      sbpPenalty: 8,
      wpPenalty: 450
    });
  }

  outcome.activeSynergies = activeSynergies;
  return outcome;
}

// ============================================================================
// 6. CAREER COMPENDIUM PERSISTENCE (`localStorage`)
// ============================================================================
const CAREER_STORAGE_KEY = 'cardiopoly_career_v1';

function loadCareerCompendium() {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage unavailable for Career Compendium:', e);
  }
  return {
    matchesPlayed: 0,
    winsByFaction: { ACADEMIC: 0, INTERVENTIONALIST: 0, CEO: 0, AUDITOR: 0 },
    trialsEncountered: ['CURE', 'PLATO'],
    lifetimeGdmtChoices: 0,
    lifetimeTotalChoices: 0
  };
}

function recordVignetteTrialInCompendium(trialCode, isGdmtChoice) {
  const data = loadCareerCompendium();
  if (trialCode && !data.trialsEncountered.includes(trialCode)) {
    data.trialsEncountered.push(trialCode);
  }
  data.lifetimeTotalChoices += 1;
  if (isGdmtChoice) data.lifetimeGdmtChoices += 1;
  try {
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignore storage quota errors
  }
  return data;
}

const rootScope = typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this);
if (typeof window === "undefined") { global.window = rootScope; }
window.CardiopolyPatches = {
  CARDIOPOLY_REGIMES_PATCH,
  formatRegimeRuleText,
  FACTION_METADATA,
  resolveFactionKey,
  sanitizePlayerNames,
  computePlayerFactionProgress,
  renderFactionRacePatched,
  updateTelemetryFromActivePlayer,
  spawnFloatingResourceDelta,
  evaluateVignetteWithSynergies,
  loadCareerCompendium,
  recordVignetteTrialInCompendium
};


// ============================================================================
// 7. WEB AUDIO ADSR SYNTH, ADAPTIVE SOUNDSCAPE & MULTIMODAL ENGINE (V2)
// ============================================================================
class CardiopolyAudioEngineV2 {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.musicEnabled = false;
    this.ambienceTimer = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.currentSbp = 120;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(forceState) {
    this.initContext();
    this.enabled = typeof forceState === 'boolean' ? forceState : !this.enabled;
    if (this.enabled) {
      this.playChord([523.25, 659.25, 783.99], 0.18, 'triangle', 0.08);
      this.startAdaptiveHospitalAmbience();
    } else {
      this.stopAdaptiveHospitalAmbience();
    }
    return this.enabled;
  }

  playEnvelopedTone(freq = 440, duration = 0.15, type = 'sine', peakGain = 0.08, delaySec = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Low-pass filter prevents harsh square/sawtooth digital clicking artifacts
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    // Click-free ADSR envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peakGain * 0.4), now + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playChord(freqs = [], duration = 0.25, type = 'triangle', peakGain = 0.06) {
    freqs.forEach((f, idx) => {
      this.playEnvelopedTone(f, duration, type, peakGain, idx * 0.035);
    });
  }

  playCue(cueName, stepIndex = 0) {
    if (!this.enabled) return;
    this.initContext();
    switch (cueName) {
      case 'diceRoll':
        [320, 420, 540, 680].forEach((f, i) => this.playEnvelopedTone(f, 0.07, 'triangle', 0.07, i * 0.045));
        break;
      case 'tokenStep':
        this.playEnvelopedTone(280 + (stepIndex % 12) * 22, 0.055, 'sine', 0.05, 0);
        break;
      case 'suitePurchase':
        this.playChord([523.25, 659.25, 783.99, 1046.5], 0.28, 'triangle', 0.07);
        break;
      case 'gdmtSelected':
        this.playChord([349.23, 440.0, 523.25, 659.25], 0.32, 'sine', 0.08);
        break;
      case 'invasiveCath':
        this.playChord([392.0, 493.88, 587.33, 783.99], 0.26, 'sawtooth', 0.055);
        break;
      case 'auditClawback':
      case 'codeBlueAlert':
        [880, 659.25, 880, 659.25].forEach((f, i) => this.playEnvelopedTone(f, 0.14, 'square', 0.06, i * 0.16));
        break;
      default:
        this.playEnvelopedTone(440, 0.1, 'sine', 0.05, 0);
    }
  }

  startAdaptiveHospitalAmbience() {
    this.stopAdaptiveHospitalAmbience();
    if (!this.enabled) return;
    const scheduleNextPulse = () => {
      if (!this.enabled) return;
      const sbp = this.currentSbp || 120;
      const bpm = Math.min(156, Math.round(72 + Math.max(0, sbp - 120) * 0.85));
      const intervalMs = Math.max(380, Math.round((60 / bpm) * 1000));
      const pulseFreq = sbp >= 175 ? 987.77 : sbp >= 145 ? 783.99 : 659.25;
      this.playEnvelopedTone(pulseFreq, 0.065, 'sine', 0.022, 0);
      this.ambienceTimer = setTimeout(scheduleNextPulse, intervalMs);
    };
    scheduleNextPulse();
  }

  stopAdaptiveHospitalAmbience() {
    if (this.ambienceTimer) {
      clearTimeout(this.ambienceTimer);
      this.ambienceTimer = null;
    }
  }

  toggleMusic(forceState) {
    this.initContext();
    this.musicEnabled = typeof forceState === 'boolean' ? forceState : !this.musicEnabled;
    if (this.musicEnabled) {
      this.startClinicalLoFiSoundtrack();
    } else {
      this.stopClinicalLoFiSoundtrack();
    }
    return this.musicEnabled;
  }

  startClinicalLoFiSoundtrack() {
    this.stopClinicalLoFiSoundtrack();
    if (!this.ctx) return;
    this.musicEnabled = true;

    // Normal play: Smooth Dm9 -> G13 -> Cmaj9 -> Am7 (Hospital Chillhop Strategy)
    const normalChords = [
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [98.00, 174.61, 246.94, 329.63, 440.00],  // G13
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [110.00, 196.00, 261.63, 329.63]          // Am7
    ];

    // High tension / auction / elevated SBP: Darker diminished/minor progression
    const tensionChords = [
      [123.47, 174.61, 207.65, 261.63], // Bdim7
      [164.81, 207.65, 246.94, 311.13], // E7b9
      [110.00, 164.81, 220.00, 261.63], // Am9
      [146.83, 174.61, 220.00, 293.66]  // Dm9
    ];

    const leadMotifs = [
      [523.25, 587.33, 659.25, 783.99], // C5, D5, E5, G5
      [440.00, 523.25, 659.25, 880.00], // A4, C5, E5, A5
      [587.33, 659.25, 783.99, 1046.5]  // D5, E5, G5, C6
    ];

    const tick = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const sbp = this.currentSbp || 120;
      const bpm = sbp >= 175 ? 136 : (sbp >= 145 ? 104 : 72);
      const beatInterval = (60 / bpm);
      const stepInterval = beatInterval / 4; // 16th note step

      const measureStep = this.musicStep % 16;
      const chordIndex = Math.floor((this.musicStep / 16) % 4);
      const isTension = sbp >= 145;
      const chordSet = isTension ? tensionChords : normalChords;
      const currentChord = chordSet[chordIndex];

      // 1. Beat 1: Warm Rhodes Piano Chord (ADSR with lowpass warmth)
      if (measureStep === 0) {
        currentChord.forEach((freq, idx) => {
          this.playEnvelopedTone(freq, beatInterval * 3.6, 'triangle', 0.032, idx * 0.022);
        });
      }

      // 2. Cardiac Heartbeat Sub-Bass ("Lub-Dub" at beats 0 and 2.5)
      if (measureStep === 0 || measureStep === 10) {
        const bassFreq = measureStep === 0 ? 55 : 44;
        this.playEnvelopedTone(bassFreq, 0.16, 'sine', 0.055, 0);
      }

      // 3. Subtle Syncopated Arpeggio Lead (clinical telemetry vibe)
      if (measureStep === 4 || measureStep === 8 || measureStep === 14) {
        const motif = leadMotifs[chordIndex % leadMotifs.length];
        const note = motif[Math.floor(Math.random() * motif.length)];
        this.playEnvelopedTone(note, 0.22, 'sine', 0.018, 0);
      }

      this.musicStep++;
      this.musicTimer = setTimeout(tick, Math.round(stepInterval * 1000));
    };

    tick();
  }

  stopClinicalLoFiSoundtrack() {
    this.musicEnabled = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

const cardiopolyAudioV2 = new CardiopolyAudioEngineV2();

function triggerMultimodalEvent({ player, cueName, anchorSelector, deltaText, deltaTone = 'positive' }) {
  if (player) {
    cardiopolyAudioV2.currentSbp = Number(player.sbp ?? 120);
    updateTelemetryFromActivePlayer(player);
  }
  if (cueName) {
    cardiopolyAudioV2.playCue(cueName);
  }
  if (anchorSelector && deltaText) {
    spawnFloatingResourceDelta(anchorSelector, deltaText, deltaTone);
  }
  if (player && (Number(player.sbp ?? 120) >= 200 || Number(player.bmi ?? 24) >= 70)) {
    document.body.classList.add('code-blue-screen-shake');
    setTimeout(() => document.body.classList.remove('code-blue-screen-shake'), 450);
  }
}

window.CardiopolyPatches.cardiopolyAudioV2 = cardiopolyAudioV2;
window.CardiopolyPatches.triggerMultimodalEvent = triggerMultimodalEvent;


if (typeof module !== "undefined" && module.exports) {
  module.exports = window.CardiopolyPatches;
}
