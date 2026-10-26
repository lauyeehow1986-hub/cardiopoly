/**
 * CARDIOPOLY — Iteration 2 MCP Runtime Bridge (`cardiopoly_mcp_runtime_bridge.js`)
 * Connects MCP-generated Live News/Macro Shocks, FDA Supply Shortages,
 * Clinical Guideline Updates, Character Voiceovers, and In-Game Video Cut-Ins
 * into the static GitHub Pages runtime with 100% offline fallback support.
 */

const DEFAULT_MACRO_SHOCK_DECK = [
  {
    id: 'pandemic_surge',
    category: 'EPIDEMIOLOGICAL ALERT',
    headline: 'Acute Viral Myocarditis & Respiratory Surge Overwhelms ER Triage',
    sourceTag: 'WHO / MOH Surveillance Feed',
    patientVolumeMult: 1.5,
    rvuMod: 1.1,
    rentMod: 0.9,
    sbpStressDelta: 3,
    cathSurchargeWp: 0,
    gdmtBonusPoints: 5,
    description: 'Patient encounter volume +50%. All clinical encounters add +3 SBP clinician fatigue unless mitigated by Telemetry bed.'
  },
  {
    id: 'contrast_shortage',
    category: 'FDA SUPPLY SHORTAGE',
    headline: 'Global Iodinated Contrast Media & Drug-Eluting Stent Bottleneck',
    sourceTag: 'OpenFDA Device & Drug Shortage Registry',
    patientVolumeMult: 1.0,
    rvuMod: 0.8,
    rentMod: 1.0,
    sbpStressDelta: 0,
    cathSurchargeWp: 300,
    gdmtBonusPoints: 10,
    description: 'Invasive Cath / Stent procedures incur a 300 WP supply surcharge and -20% RVU margin; GDMT Protocol grants +10 bonus GDMT points.'
  },
  {
    id: 'insurance_premium_spike',
    category: 'MACROECONOMIC SHOCK',
    headline: 'Commercial Insurance Premiums & Deductibles Spike +18% YoY',
    sourceTag: 'FRED Medical Care CPI / Payer Bulletin',
    patientVolumeMult: 0.85,
    rvuMod: 1.0,
    rentMod: 0.8,
    sbpStressDelta: 2,
    cathSurchargeWp: 0,
    gdmtBonusPoints: 0,
    description: 'Patients delay elective clinic visits: Suite rent collection drops by 20%, and Cost Containment triggers +50% higher readmission risk.'
  },
  {
    id: 'guideline_class_1a_update',
    category: 'GUIDELINE REVISION',
    headline: 'Joint ACC/ESC/MOH Rapid Four-Pillar GDMT Mandate Issued',
    sourceTag: 'PubMed / National Guideline Clearinghouse',
    patientVolumeMult: 1.0,
    rvuMod: 0.95,
    rentMod: 1.05,
    sbpStressDelta: -2,
    cathSurchargeWp: 0,
    gdmtBonusPoints: 10,
    description: 'Selecting GDMT Protocol grants +10 extra GDMT Points and -2 SBP relief. Guideline-discordant stenting doubles Regulatory Auditor clawback.'
  }
];

class MacroShockEngine {
  constructor() {
    this.events = [...DEFAULT_MACRO_SHOCK_DECK];
    this.activeShock = null;
    this.turnCounter = 0;
  }

  async loadMcpFeed(feedUrl = 'data/liveWorldFeed.json') {
    try {
      if (typeof fetch === 'function') {
        const res = await fetch(feedUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.events) && data.events.length > 0) {
            this.events = data.events;
          }
        }
      }
    } catch (_) {
      // Offline / static fallback uses DEFAULT_MACRO_SHOCK_DECK
    }
    return this.events;
  }

  advanceTurn(turnNumber) {
    this.turnCounter = turnNumber;
    if (turnNumber === 1 || turnNumber % 4 === 0 || !this.activeShock) {
      const next = this.events[Math.floor(Math.random() * this.events.length)] || DEFAULT_MACRO_SHOCK_DECK[0];
      this.activeShock = next;
      this.renderNewsTicker(next);
      return next;
    }
    return this.activeShock;
  }

  renderNewsTicker(shock) {
    if (!shock || typeof document === 'undefined') return;
    let ticker = document.getElementById('cardiopoly-macro-ticker');
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.id = 'cardiopoly-macro-ticker';
      ticker.className = 'macro-news-ticker';
      document.body.prepend(ticker);
    }
    ticker.innerHTML = `
      <span class="macro-badge">${shock.category || 'MACRO ALERT'}</span>
      <strong class="macro-headline">${shock.headline || 'Healthcare Policy Shift'}</strong>
      <span class="macro-desc">${shock.description || ''}</span>
      <span class="macro-source">[${shock.sourceTag || 'Live Feed'}]</span>
    `;
  }
}

class CutInOverlayManager {
  constructor() {
    this.overlayEl = null;
    this.hideTimer = null;
  }

  ensureOverlay() {
    if (typeof document === 'undefined') return null;
    if (this.overlayEl && document.body.contains(this.overlayEl)) return this.overlayEl;
    let el = document.getElementById('cardiopoly-cutin-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cardiopoly-cutin-overlay';
      el.className = 'cutin-overlay-backdrop hidden';
      el.addEventListener('click', () => this.hide());
      document.body.appendChild(el);
    }
    this.overlayEl = el;
    return el;
  }

  playCutIn({ id = 'code_blue', title = 'CODE BLUE HOSPITALIZATION', subtitle = 'Emergency Telemetry Alert', accentColor = '#ef4444', videoSrc = null, voiceoverSrc = null }) {
    const el = this.ensureOverlay();
    if (!el) return;

    el.style.setProperty('--cutin-accent', accentColor);

    const videoMarkup = videoSrc
      ? `<video class="cutin-video" src="${videoSrc}" autoplay muted playsinline onerror="this.style.display='none'"></video>`
      : `<div class="cutin-procedural-graphic">
           <svg viewBox="0 0 320 90" width="100%" height="90">
             <polyline fill="none" stroke="${accentColor}" stroke-width="3.5"
               points="0,45 55,45 70,20 85,75 102,10 120,82 138,38 155,45 320,45" />
           </svg>
         </div>`;

    el.innerHTML = `
      <div class="cutin-banner-card">
        ${videoMarkup}
        <div class="cutin-text-block">
          <div class="cutin-kicker">LIVE CLINICAL CUT-IN // TAP TO DISMISS</div>
          <h2 class="cutin-title">${title}</h2>
          <p class="cutin-subtitle">${subtitle}</p>
        </div>
      </div>
    `;
    el.classList.remove('hidden');

    if (voiceoverSrc && typeof Audio !== 'undefined') {
      try {
        const vo = new Audio(voiceoverSrc);
        vo.volume = 0.85;
        vo.play().catch(() => {});
      } catch (_) {}
    } else if (typeof window !== 'undefined' && window.CardiopolyPatches?.cardiopolyAudioV2) {
      window.CardiopolyPatches.cardiopolyAudioV2.playCue(id === 'code_blue' ? 'codeBlueAlert' : 'invasiveCath');
    }

    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), 2800);
  }

  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  }
}

const macroShockEngineInstance = new MacroShockEngine();
const cutInOverlayInstance = new CutInOverlayManager();

const CardiopolyMcpBridge = {
  macroShockEngine: macroShockEngineInstance,
  cutInOverlay: cutInOverlayInstance,
  MacroShockEngine,
  CutInOverlayManager,
  DEFAULT_MACRO_SHOCK_DECK
};

if (typeof window !== 'undefined') {
  window.CardiopolyMcpBridge = CardiopolyMcpBridge;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardiopolyMcpBridge;
}
