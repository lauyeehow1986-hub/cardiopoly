---
name: game-development
description: >-
  Use when developing, optimizing, auditing, or refactoring web, canvas, or simulation games.
  Implements the 6-dimension Gradient-Boosting Game Optimization Framework (I0 -> I1 -> I2)
  covering visual polish, Web Audio API ADSR sound design, multimodal juice & feedback synchronization,
  code deduplication, core gameplay synergies & long-term retention loops, runtime stability/data-binding,
  and the Iteration 2 MCP ecosystem (real-world macro shocks, voiceovers, character art, and video cut-ins).
---

# Gradient-Boosted Game Development Framework

## Overview

The **Gradient-Boosted Game Development Framework** is an iterative engineering and design methodology for transforming web, board, canvas, and simulation games from rough prototypes ($I_0$) through production grade ($I_1 \ge 90/100$) to multimodal, live-world integrated masterworks ($I_2 \ge 95/100$).

Game quality is optimized across **6 core dimensions**, prioritizing the highest residual deficits ($P_k = w_k \cdot \Delta_k$) through systematic phase-based implementation and test-driven verification gates.

```
       [Live Baseline Game I0 (Score ~51.9)]
                         │
                         ▼
   [Quantitative 6-Dimension Scorecard] ──► Priority Residuals Ranked
                         │
                         ▼
   [Phase 1: Runtime Stability & Data-Binding]
                         │
                         ▼
   [Phase 2: Web Audio API ADSR Soundscape & Ambient Tension]
                         │
                         ▼
   [Phase 3: Visual Ergonomics, 11x11 Tile Hierarchy & Tokens]
                         │
                         ▼
   [Phase 4: Gameplay Synergies, Longitudinal Queues & Career]
                         │
                         ▼
   [Phase 5: Multimodal Juice & Screen-Shake Synchronization]
                         │
                         ▼
       [Production Game I1 (Score >= 90.3)]
                         │
                         ▼
   [Phase 6: Iteration 2 MCP Multimodal & Live World Boost]
     ├─ Real-World Macro Shock Engine (Brave/Tavily/FRED/OpenFDA/PubMed)
     ├─ In-Game Video Cut-Ins & Character Voiceovers (Luma/MiniMax/ElevenLabs)
     ├─ Faction Character Art & Cover Splash (Fal.ai/Replicate Flux)
     └─ Zero-Build Offline Fallback Safety (GitHub Pages)
                         │
                         ▼
       [Masterwork Game I2 (Target >= 95.6)] ──► QA & Verification Gates
```

---

## The 6-Dimension Game Gradient-Boosting Scorecard ($I_0 \to I_1 \to I_2$)

When evaluating or upgrading any web game, score the baseline across these 6 weighted dimensions:

| Dimension | Weight ($w_k$) | Baseline ($I_0$) | Target ($I_1$) | Target ($I_2$) | Description & Standards |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Visual Polish & Layout Integrity** | `0.20` | `58` | `90` | `95` | Modals fit within `88vh`; perimeter tiles show prices, owner glow, upgrade pips; custom SVG tokens; live macro ticker & bespoke character portrait frames. |
| **2. Audio, Music & Sound Design** | `0.15` | `35` | `88` | `95` | Click-free ADSR envelopes; low-pass filtering; adaptive ambient tension pulse; ElevenLabs/MiniMax voiceover lines & dynamic sound stems. |
| **3. Multimodal Feedback & Juice** | `0.15` | `42` | `89` | `96` | Synchronized audio cue + floating resource badge + HUD/telemetry reaction + 2.8s anime/broadcast video cut-in overlay with procedural fallback. |
| **4. Deduplication & Code Hygiene** | `0.15` | `54` | `88` | `93` | Single-source formatters; clean architectural separation; schema-validated news/shock engine (`data/liveWorldFeed.json`); zero duplicate helpers. |
| **5. Core Gameplay & Long-Term Engagement** | `0.25` | `62` | `92` | `97` | Cross-system synergies; longitudinal consequence queues; active regime rule hooks; dynamic real-world macro shocks (epidemic, shortage, CPI, guideline revisions). |
| **6. Runtime Stability & Data Binding** | `0.10` | `45` | `96` | `98` | Zero `undefinedx` or clipped strings; in-game Options pauses timers cleanly; 100% offline fallback cache for zero 404s/rejections on static GitHub Pages. |

**Composite Quality Formula:**
$$S = \sum_{k=1}^6 w_k \cdot s_k, \qquad P_k = w_k \cdot (100 - s_k)$$

---

## Dimension-by-Dimension Technical Implementation

### 1. Visual Polish & Modal Viewport Ergonomics
- **88vh Modal Ceiling**: Never allow interactive modals or encounter dialogs to overflow below the fold on `1366x768` or laptop screens.
  ```css
  .modal-dialog,
  .vignette-modal-content {
    max-height: 88vh;
    width: min(960px, 94vw);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #38bdf8 #0f172a;
  }
  ```
- **Sticky Status Banner**: Keep key actor vitals pinned to the top of the modal while scrolling choices:
  ```css
  .vignette-patient-banner {
    position: sticky;
    top: 0;
    z-index: 5;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  }
  ```
- **Responsive 3-Column Choices Grid**:
  ```css
  .vignette-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
    gap: 12px;
  }
  ```
- **Perimeter Tile Visual Hierarchy**:
  - Add `.tile-cost-badge` showing WP/cash cost.
  - Apply `.is-owned` with `--owner-color` for inset border and neon glow.
  - Apply `.is-mortgaged` with diagonal hazard striping.
  - Render 1 to 4 `.tile-upgrade-pip` dots inside `.tile-color-bar`.
  - Render inline SVG tokens inside `.player-token` and trigger `.is-hopping` (90ms) during tile stepping.

---

### 2. Click-Free Web Audio API Engine (`CardiopolyAudioEngineV2`)

Web Audio implementations often suffer from two major flaws: **suspended audio context** and **square-wave DC offset clicks**. Use this reference pattern:

```javascript
class ProceduralGameAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambienceTimer = null;
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

  // Click-free ADSR envelope with low-pass anti-aliasing filter
  playEnvelopedTone(freq = 440, duration = 0.15, type = 'sine', peakGain = 0.08, delaySec = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Filter out harsh digital harmonics
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    // ADSR Envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.012); // Attack
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peakGain * 0.4), now + duration * 0.65); // Decay/Sustain
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Release

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
}
```

#### Adaptive Ambience Loop:
Dynamically adjust ambient drone pulse rate and tone based on player tension / vitals:
- **Calm State** (e.g. SBP < 145): 72 BPM soft sine blip + C-major9 chord.
- **Tension State** (e.g. 145 <= SBP < 175): 108 BPM amber pulse + D-minor7 tension pad.
- **Crisis State** (e.g. SBP >= 175): 144 BPM pre-Code-Blue dual-tone warning beep.

---

### 3. Multimodal Feedback & Juice Matrix

Every meaningful game event must coordinate **Audio + Visual + HUD**:

```javascript
function triggerMultimodalEvent({ player, cueName, anchorSelector, deltaText, deltaTone = 'positive' }) {
  if (player) {
    audioEngine.currentSbp = Number(player.sbp ?? 120);
    updateTelemetryFromActivePlayer(player);
  }
  if (cueName) {
    audioEngine.playCue(cueName);
  }
  if (anchorSelector && deltaText) {
    spawnFloatingResourceDelta(anchorSelector, deltaText, deltaTone);
  }
  if (player && (Number(player.sbp ?? 120) >= 200 || Number(player.bmi ?? 24) >= 70)) {
    document.body.classList.add('code-blue-screen-shake');
    setTimeout(() => document.body.classList.remove('code-blue-screen-shake'), 450);
  }
}
```

---

### 4. Deduplication & Code Hygiene
1. **Single Source of Truth**: Consolidate repetitive formatters (`formatRegimeRuleText`, `computePlayerFactionProgress`) so all UI elements reference identical normalized logic.
2. **Remove Dead UI Shells**: If cloud backend features are mocked or unsupported on zero-build static hosting, replace them with a functional **Career Compendium & Milestone Tracker** backed by `localStorage`.
3. **Macro vs. Micro HUD Separation**:
   - Macro perimeter tiles display essential state (cost badge, owner color glow, upgrade tier pips).
   - Sidebar magnified / inspector view displays deep parameters (rent tier schedules, mortgage actions).

---

### 5. Core Gameplay Synergies & Retention Loops
1. **Cross-System Synergies**: Property ownership directly alters encounter and card outcomes.
   - Example: Owning diagnostic suites (`ECG room`, `UA area`) grants clinical bonuses (+5 GDMT, -50 Waste, -50% complication probability) when resolving relevant scenarios.
2. **Longitudinal Consequence Queue (`followUpQueue`)**:
   - Short-term shortcuts (e.g. premature discharge via Cost Containment) push an event onto `gameState.followUpQueue` scheduled for `currentTurn + N`.
   - At `turnNumber >= triggerTurn`, the event resolves with readmission penalties.
3. **Career Compendium Persistence**:
   - Store lifetime wins, faction stats, adherence rates, and landmark achievements under `localStorage.getItem('game_career_v1')`.

---

### 6. Runtime Stability & Data Binding
1. **Schema Normalization**: Normalize configuration keys across all entities so that alternative property names (`rvuMult` vs `rvuMultiplier`, `coPayRate` vs `copay`) always resolve to valid numbers.
2. **Options Pause / Resume Handling**:
   - When settings or options open during an active match, pause all running timers:
     ```javascript
     clearTimeout(gameState.botTurnTimeout);
     if (gameState.activeAuction?.intervalId) clearInterval(gameState.activeAuction.intervalId);
     gameState.isPaused = true;
     ```
   - Provide an explicit **Resume Match** button to restart timers cleanly.

---

### 7. MCP Multimodal & Live-World Ecosystem Architecture (Iteration 2)

```
 [Antigravity Global MCP Config (C:\Users\lauye\.gemini\config\mcp_config.json)]
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
 [Live News & Macro]      [FDA & Trials]       [Multimodal Media]
  - brave-search-news      - openfda-shortages   - fal-visuals-audio-video
  - tavily-live-events     - pubmed-guidelines   - replicate-media
  - fred-macroeconomics    - clinical-trials     - elevenlabs-voice-sfx
                           - biomcp              - minimax-multimodal
                                                 - luma-video-cutins
                               │
                               ▼
            [data/liveWorldFeed.json (Offline Cache)]
                               │
                               ▼
        [patches/cardiopoly_mcp_runtime_bridge.js]
        ├── MacroShockEngine  ──► #cardiopoly-macro-ticker (Turn % 4)
        └── CutInOverlayManager ──► 2.8s Broadcast Video / SVG Fallback
```

#### Macro Shock Engine Pattern
- Rotates macro incidents every 4 turns (turn 1, turn 4, turn 8, etc.).
- Modifies patient volume multiplier, cath surcharges, co-pay rates, and GDMT bonuses.
- Uses `DEFAULT_MACRO_SHOCK_DECK` as a 100% offline fallback when `data/liveWorldFeed.json` is unreachable.

#### In-Game Video Cut-In & Voiceover Overlay Pattern
- Triggers on Code Blue hospitalization, high-risk cath stenting, monopoly completion, and breaking macro shocks.
- Displays a skewed broadcast-style banner across the viewport (`2.8s` duration, skippable on click/key).
- If video or voiceover media is absent, seamlessly falls back to inline SVG cardiac vector animations and procedural Web Audio API cues (`playCue('codeBlueAlert')`).

---

## QA Verification Checklist

Before completing any game optimization task, verify all gates:

- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.
- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.
- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update.
- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.
- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.
- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.
- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.
- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 2.8s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.
