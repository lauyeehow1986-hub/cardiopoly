---
name: game-development
description: >-
  Use when developing, optimizing, auditing, or refactoring web, canvas, or simulation games.
  Implements the 6-dimension Gradient-Boosting Game Optimization Framework: visual polish,
  Web Audio API ADSR sound design, multimodal juice & feedback synchronization, code deduplication,
  core gameplay synergies & long-term retention loops, and runtime stability/data-binding.
---

# Gradient-Boosted Game Development Framework

## Overview

The **Gradient-Boosted Game Development Framework** is an iterative engineering and design methodology for transforming web, board, canvas, and simulation games from rough prototypes ($I_0$) into polished, production-grade experiences ($I_1 \ge 90/100$).

Game quality is optimized across **6 core dimensions**, prioritizing the highest residual deficits ($P_k = w_k \cdot \Delta_k$) through systematic phase-based implementation and test-driven verification gates.

```
       [Live Baseline Game I0]
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
       [Production Game I1 >= 90/100] ──► 6-Gate QA Verification
```

---

## The 6-Dimension Game Gradient-Boosting Scorecard

When evaluating or upgrading any web game, score the baseline across these 6 weighted dimensions:

| Dimension | Weight ($w_k$) | Description | Target Standard ($I_1$) |
| :--- | :---: | :--- | :--- |
| **1. Visual Polish & Layout Integrity** | `0.20` | Responsive layout, modal viewport ergonomics, macro board visual hierarchy, token design. | Modals fit within `88vh`; perimeter tiles show prices, owner glow, and upgrade pips; custom SVG tokens. |
| **2. Audio, Music & Sound Design** | `0.15` | Procedural Web Audio API synthesis, click-free ADSR envelopes, low-pass filtering, adaptive ambient loops. | Context resumes on gesture; no square-wave clicks; polyphonic event chimes; tension-reactive ambient pulse. |
| **3. Multimodal Feedback & Juice** | `0.15` | Simultaneous coordination of visual, auditory, and HUD responses; floating deltas; screenshake. | Every action triggers synchronized audio cue + floating resource badge + HUD/telemetry reaction. |
| **4. Deduplication & Code Hygiene** | `0.15` | Single-source-of-truth formatters, elimination of dead/mocked UI shells, clear architectural separation. | No duplicated formatters; dead network controls replaced with local career views; zero code duplication. |
| **5. Core Gameplay & Long-Term Engagement** | `0.25` | Property $\leftrightarrow$ event synergies, delayed consequence queues, asymmetric faction goals, career persistence. | Cross-system synergies active; longitudinal consequence queues; active regime rules; `localStorage` career. |
| **6. Runtime Stability & Data Binding** | `0.10` | Error-free data binding, zero `undefined` or `NaN` outputs, non-destructive pause/resume, timer management. | Zero `undefinedx` or clipped strings; in-game Options cleanly pauses active timers; seamless resume. |

**Composite Quality Formula:**
$$S = \sum_{k=1}^6 w_k \cdot s_k, \qquad P_k = w_k \cdot (100 - s_k)$$

---

## Dimension-by-Dimension Technical Implementation

### 1. Visual Polish & Modal Viewport Ergonomics
- **88vh Modal Ceiling**: Never allow interactive modals or clinical encounter dialogs to overflow below the fold on `1366x768` or laptop screens.
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
- **Sticky Status Banner**: Keep key actor vitals or patient parameters pinned to the top of the modal while scrolling choices:
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

```css
/* Floating Delta Badge Animation */
.floating-delta-badge {
  position: absolute;
  top: -8px;
  right: 8px;
  z-index: 30;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  pointer-events: none;
  animation: cardiopolyFloatUp 1.4s ease-out forwards;
}

@keyframes cardiopolyFloatUp {
  0% { opacity: 0; transform: translateY(6px) scale(0.92); }
  18% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-24px) scale(1.06); }
}

/* Screen Shake on Crisis Events */
.code-blue-screen-shake {
  animation: screenShakeKeyframes 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes screenShakeKeyframes {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, -1px, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 2px, 0); }
  40%, 60% { transform: translate3d(6px, -2px, 0); }
}
```

---

### 4. Deduplication & Code Hygiene
1. **Single Source of Truth**: Consolidate repetitive formatters (`formatRegimeRuleText`, `computePlayerFactionProgress`) so all UI elements reference identical normalized logic.
2. **Remove Dead UI Shells**: If WebRTC or cloud backend features are mocked or unsupported on zero-build static hosting, replace them with a functional **Career Compendium & Milestone Tracker** backed by `localStorage`.
3. **Macro vs. Micro HUD Separation**:
   - Macro perimeter tiles display essential state (cost badge, owner color glow, upgrade tier pips).
   - Sidebar magnified / inspector view displays deep parameters (rent tier schedules, mortgage actions).

---

### 5. Core Gameplay Synergies & Retention Loops
1. **Cross-System Synergies**: Property ownership directly alters encounter and card outcomes.
   - Example: Owning diagnostic suites (`ECG room`, `UA area`) grants clinical bonuses (+5 GDMT, -50 Waste, -50% complication probability) when resolving relevant scenarios.
2. **Longitudinal Consequence Queue (`followUpQueue`)**:
   - Short-term shortcuts (e.g. premature discharge via Cost Containment) push an event onto `gameState.followUpQueue` scheduled for `currentTurn + N`.
   - At `turnNumber >= triggerTurn`, the event resolves with readmission penalties (which can be mitigated by holding specific shield properties like `Telemetry bed`).
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

## 6-Gate QA Verification Checklist

Before completing any game development or optimization task, verify all 6 gates:

- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.
- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.
- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update.
- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.
- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.
- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.
