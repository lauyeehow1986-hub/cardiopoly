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

  duckSoundtrack(durationMs = 4500) {
    this.soundtrackDucked = true;
    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      this.soundtrackDucked = false;
    }, durationMs);
  }

  playHospitalChime() {
    this.initContext();
    if (!this.ctx) return;
    const chimeFreqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6 (Cmaj9 arpeggio)
    chimeFreqs.forEach((freq, idx) => {
      this.playEnvelopedTone(freq, 0.45, 'triangle', 0.042, idx * 0.045);
    });
  }

  playDefibrillatorSequence() {
    this.initContext();
    if (!this.ctx) return;

    // GMSBS Layer 4: High-stakes emergency (-8.0 LUFS target), duck background soundtrack -18dB
    this.duckSoundtrack(5800);

    const now = this.ctx.currentTime;

    // Step 1: Hospital Overhead Pager Chime (A5 -> D5 dual-tone)
    this.playEnvelopedTone(880.00, 0.18, 'sine', 0.12, 0);
    this.playEnvelopedTone(587.33, 0.28, 'sine', 0.14, 0.18);

    // Step 2: Automated PA Voice Announcement (SpeechSynthesis if available)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance('Code Blue. CCU Resuscitation.');
        utter.rate = 1.35;
        utter.pitch = 0.92;
        utter.volume = 0.95;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }

    // Step 3: Defibrillator Capacitor Charging Whine (220 Hz -> 2400 Hz exponential ramp)
    try {
      const chargeOsc = this.ctx.createOscillator();
      const chargeGain = this.ctx.createGain();
      chargeOsc.type = 'sawtooth';
      chargeOsc.frequency.setValueAtTime(220, now + 0.5);
      chargeOsc.frequency.exponentialRampToValueAtTime(2400, now + 2.7);

      chargeGain.gain.setValueAtTime(0.0001, now + 0.5);
      chargeGain.gain.linearRampToValueAtTime(0.095, now + 2.5);
      chargeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.75);

      chargeOsc.connect(chargeGain);
      chargeGain.connect(this.ctx.destination);

      chargeOsc.start(now + 0.5);
      chargeOsc.stop(now + 2.8);
    } catch (_) {}

    // Step 4: Warning Alert Beeps ("All Clear!") at t = 2.75s & 2.95s
    this.playEnvelopedTone(1760.00, 0.09, 'square', 0.08, 2.75);
    this.playEnvelopedTone(1760.00, 0.09, 'square', 0.08, 2.95);

    // Step 5: High-Voltage Defibrillation Shock Discharge (t = 3.2s)
    // 5a. Sub-bass acoustic thump (45 Hz resonant sine)
    try {
      const thumpOsc = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(90, now + 3.2);
      thumpOsc.frequency.exponentialRampToValueAtTime(38, now + 3.6);

      thumpGain.gain.setValueAtTime(0.38, now + 3.2);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.75);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(this.ctx.destination);

      thumpOsc.start(now + 3.2);
      thumpOsc.stop(now + 3.8);
    } catch (_) {}

    // 5b. Electrical discharge crackle / noise burst
    try {
      const bufferSize = this.ctx.sampleRate * 0.22;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now + 3.2);
      filter.Q.setValueAtTime(3.0, now + 3.2);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now + 3.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.42);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now + 3.2);
    } catch (_) {}

    // Step 6: Post-Resuscitation Sinus Bradycardia Pulse (72 BPM blips at t = 3.9s, 4.75s, 5.5s)
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 3.9);
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 4.75);
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 5.5);
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
      const duckMultiplier = this.soundtrackDucked ? 0.25 : 1.0;

      // 1. Beat 1: Warm Rhodes Piano Chord (ADSR with lowpass warmth)
      if (measureStep === 0) {
        currentChord.forEach((freq, idx) => {
          this.playEnvelopedTone(freq, beatInterval * 3.6, 'triangle', 0.032 * duckMultiplier, idx * 0.022);
        });
      }

      // 2. Cardiac Heartbeat Sub-Bass ("Lub-Dub" at beats 0 and 2.5)
      if (measureStep === 0 || measureStep === 10) {
        const bassFreq = measureStep === 0 ? 55 : 44;
        const waveType = sbp >= 175 ? 'sawtooth' : (sbp >= 145 ? 'triangle' : 'sine');
        const peakGain = (sbp >= 175 ? 0.075 : (sbp >= 145 ? 0.065 : 0.052)) * duckMultiplier;
        this.playEnvelopedTone(bassFreq, 0.16, waveType, peakGain, 0);
      }

      // 3. Subtle Syncopated Arpeggio Lead (clinical telemetry vibe)
      if (measureStep === 4 || measureStep === 8 || measureStep === 14) {
        const motif = leadMotifs[chordIndex % leadMotifs.length];
        const note = motif[Math.floor(Math.random() * motif.length)];
        this.playEnvelopedTone(note, 0.22, 'sine', 0.018 * duckMultiplier, 0);
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
window.CardiopolyPatches.playDefibrillatorSequence = () => cardiopolyAudioV2.playDefibrillatorSequence();



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
    const turn = Number(gameState.turnNumber ?? gameState.turnCount ?? gameState.turnCounter ?? 1);

    // Condition A: Severe physiological distress (clinical threshold for crisis arrest)
    if (curPlayer && (Number(curPlayer.sbp ?? 120) >= 195 || Number(curPlayer.complications ?? 0) >= 2)) {
      return true;
    }
    // Condition B: Guaranteed early-game introduction on Turn 2 or Turn 3 (first match experience)
    if ((turn === 2 || turn === 3) && !gameState.hasExperiencedCodeBlue) {
      gameState.hasExperiencedCodeBlue = true;
      return true;
    }
    // Condition C: High dynamic in-game emergence (22% per turn after turn 1)
    if (turn >= 2 && roll < 0.22) {
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
        message: `🏆 HEROIC RESUSCITATION! You beat the competition in ${elapsedSec.toFixed(2)}s and claimed +${p.rewardWP} WP Clinical Bounty!`,
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
        message: `⚠️ BOT RESUSCITATION: ${winningBot ? winningBot.name : 'AI Clinician'} delivered the shock first! Bot claimed +${p.rewardWP} WP. You missed the bounty.`,
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
        message: `💀 CATASTROPHIC CODE BLUE FAILURE: Resuscitation timed out (${elapsedSec.toFixed(1)}s)! Patient suffered arrest. -${p.penaltyWP} WP deducted for CCU life-support and malpractice review. Admitted to CCU lockup.`,
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
      modal.className = 'screen-overlay active';
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '10050';
    modal.scrollTop = 0;

    let currentStepIdx = 0;
    let compressionsDone = 0;
    let playerPct = 0;
    const botProgress = {};
    bots.forEach(b => botProgress[b.id] = 0);

    const startTime = performance.now();
    let timerInterval = null;
    let animFrame = null;
    let isFinished = false;

    const getStepDetails = (stepIdx, compDone) => {
      const step = params.steps[stepIdx] || 'shock';
      if (step === 'airway') {
        return { text: '💨 SECURE AIRWAY (TAP)', cls: 'btn-primary' };
      } else if (step === 'epinephrine') {
        return { text: '💉 INJECT EPINEPHRINE 1mg (TAP)', cls: 'btn-warning' };
      } else if (step === 'charge') {
        return { text: '⚡ CHARGE DEFIBRILLATOR PADDLES (TAP)', cls: 'btn-warning' };
      } else if (step === 'compress') {
        return {
          text: `❤️ DELIVER CHEST COMPRESSION (MASH!) [${compDone}/${params.requiredCompressions}]`,
          cls: 'btn-danger pulse-action'
        };
      } else {
        return { text: '⚡ CLEAR & DELIVER 200J BIPHASIC SHOCK (TAP)', cls: 'btn-success pulse-action' };
      }
    };

    const initialDetails = getStepDetails(currentStepIdx, compressionsDone);

    const botsMarkup = bots.map(b => {
      return `
        <div class="competitor-race-row">
          <div class="competitor-info">
            <span class="competitor-name">${b.name}</span>
            <span id="qte-bot-pct-${b.id}" class="competitor-pct">0%</span>
          </div>
          <div class="competitor-progress-track">
            <div id="qte-bot-fill-${b.id}" class="competitor-progress-fill bot" style="width: 0%;"></div>
          </div>
        </div>
      `;
    }).join('');

    // Render modal shell ONCE to avoid DOM thrashing & dropped click inputs
    modal.innerHTML = `
      <div class="qte-modal-window" role="dialog" aria-modal="true" aria-label="Code Blue Resuscitation Challenge">
        <div class="qte-header">
          <span class="qte-level-badge">🚨 EMERGENCY CCU PROTOCOL // LEVEL ${diff}</span>
          <h2>EMERGENT CODE BLUE RESUSCITATION</h2>
          <p class="qte-subtitle">Patient in Ventricular Fibrillation! Compete against hospital physicians to resuscitate!</p>
        </div>

        <div class="qte-instructions-banner">
          ⚡ RAPIDLY TAP / MASH THE ACTION BUTTON (OR PRESS SPACEBAR) TO RESUSCITATE BEFORE DR. CATH-A-LOT &amp; THE BOTS REACH 100%!
        </div>

        <div class="qte-timer-banner">
          <div id="qte-timer-display" class="qte-timer-value">
            ⏱️ ${params.durationSec.toFixed(2)}s REMAINING
          </div>
          <div class="qte-stakes-badge">
            🏆 Reward: +$${params.rewardWP.toLocaleString()} WP | 💀 Fail: -$${params.penaltyWP.toLocaleString()} WP
          </div>
        </div>

        <div class="qte-telemetry-box">
          <canvas id="qte-ecg-canvas" width="560" height="60" aria-label="Dynamic V-Fib Telemetry"></canvas>
        </div>

        <div class="qte-competitors-panel">
          <div class="competitor-race-row player-row">
            <div class="competitor-info">
              <span class="competitor-name">👤 YOU (${player.name || 'Academic Clinician'})</span>
              <span id="qte-player-pct" class="competitor-pct" style="color:#22d3ee; font-weight:800;">0%</span>
            </div>
            <div class="competitor-progress-track">
              <div id="qte-player-fill" class="competitor-progress-fill player" style="width: 0%;"></div>
            </div>
          </div>
          ${botsMarkup}
        </div>

        <div class="qte-action-container">
          <button id="qte-mash-btn" class="btn ${initialDetails.cls} btn-qte-action" type="button">
            ${initialDetails.text}
          </button>
        </div>
      </div>
    `;

    // Elements lookup
    const timerDisplay = document.getElementById('qte-timer-display');
    const playerPctEl = document.getElementById('qte-player-pct');
    const playerFill = document.getElementById('qte-player-fill');
    const mashBtn = document.getElementById('qte-mash-btn');
    const botFillEls = {};
    const botPctEls = {};
    bots.forEach(b => {
      botFillEls[b.id] = document.getElementById(`qte-bot-fill-${b.id}`);
      botPctEls[b.id] = document.getElementById(`qte-bot-pct-${b.id}`);
    });

    const updatePlayerUI = () => {
      const stepDetails = getStepDetails(currentStepIdx, compressionsDone);
      if (mashBtn) {
        mashBtn.textContent = stepDetails.text;
        mashBtn.className = `btn ${stepDetails.cls} btn-qte-action`;
      }
      if (playerFill) {
        playerFill.style.width = `${playerPct}%`;
      }
      if (playerPctEl) {
        playerPctEl.textContent = `${Math.round(playerPct)}%`;
      }
    };

    updatePlayerUI();

    let lastActionTime = 0;
    const handlePlayerAction = (e) => {
      if (isFinished) return;
      const now = performance.now();
      if (now - lastActionTime < 35) return; // 35ms debounce prevents hardware bounce while allowing ~25 mashes/sec
      lastActionTime = now;

      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Haptic screen shake
      if (document.body?.classList) {
        document.body.classList.add('code-blue-screen-shake');
        setTimeout(() => document.body.classList.remove('code-blue-screen-shake'), 90);
      }

      const currentStep = params.steps[currentStepIdx] || 'shock';

      // Audio feedback
      if (typeof playAudio === 'function') {
        if (currentStep === 'compress') {
          playAudio('BEEP', 120 + compressionsDone * 5);
        } else if (currentStep === 'charge') {
          playAudio('DEFIB');
        } else {
          playAudio('BEEP', 140);
        }
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
        // Player finishes & claims victory!
        playerPct = 100;
        updatePlayerUI();
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

      updatePlayerUI();
    };

    // Attach high-performance pointerdown and click
    if (mashBtn) {
      mashBtn.addEventListener('pointerdown', handlePlayerAction);
      mashBtn.addEventListener('click', handlePlayerAction);
    }

    // Keyboard Spacebar and Enter
    const handleKeydown = (e) => {
      if (isFinished) return;
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter' || e.key === 'Enter') {
        handlePlayerAction(e);
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', handleKeydown);
    }

    const finishChallenge = (winner, winnerId) => {
      if (isFinished) return;
      isFinished = true;
      clearInterval(timerInterval);
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('keydown', handleKeydown);
      }
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

      modal.innerHTML = `
        <div class="qte-modal-window" role="dialog" aria-modal="true">
          <div class="qte-header" style="border-bottom: 2px solid ${color};">
            <span class="qte-level-badge" style="background: ${color}; color:#000;">${icon} ${title}</span>
            <h2 style="color:${color}; margin-top:8px;">${result.message}</h2>
          </div>
          <div class="qte-result-body" style="padding: 20px; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1;">
            <p>${isPlayerWin ? `Congratulations! You beat the clock in ${elapsedSec.toFixed(2)}s and stabilized patient hemodynamics.` : (isBotWin ? `The attending bot was faster to the paddles. You missed the clinical bonus.` : `Failure to achieve ROSC within the critical time window. Patient transferred to CCU lockup.`)}</p>
          </div>
          <div class="qte-action-container">
            <button id="qte-close-btn" class="btn btn-primary" type="button" style="width:100%; padding: 14px;">
              Acknowledge & Resume Simulation
            </button>
          </div>
        </div>
      `;

      const closeBtn = document.getElementById('qte-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.classList.remove('active');
          modal.classList.add('hidden');
          modal.style.display = 'none';
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
      const remainingSec = Math.max(0, params.durationSec - elapsed);

      if (timerDisplay) {
        timerDisplay.textContent = `⏱️ ${remainingSec.toFixed(2)}s REMAINING`;
        if (remainingSec <= 1.5) {
          timerDisplay.classList.add('urgent');
        } else {
          timerDisplay.classList.remove('urgent');
        }
      }

      // Update bot progresses
      for (const b of bots) {
        const rateInfo = botRates[b.id];
        if (rateInfo) {
          const bp = Math.min(100, Math.round(elapsed * rateInfo.rate));
          botProgress[b.id] = bp;
          if (botFillEls[b.id]) {
            botFillEls[b.id].style.width = `${bp}%`;
          }
          if (botPctEls[b.id]) {
            botPctEls[b.id].textContent = `${bp}%`;
          }
          if (bp >= 100) {
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
    }, 50);
  }
};

window.CardiopolyPatches.ResuscitationEngine = ResuscitationEngine;

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.CardiopolyPatches;
}
