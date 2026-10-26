---
name: game-development
description: >-
  Use when developing, optimizing, auditing, or refactoring web, canvas, or simulation games.
  Implements the 6-dimension Gradient-Boosting Game Optimization Framework (I0 -> I1 -> I2)
  covering visual polish, Web Audio API ADSR sound design, multimodal juice & feedback synchronization,
  code deduplication, core gameplay synergies & long-term retention loops, runtime stability/data-binding,
  the Iteration 2 MCP ecosystem (real-world macro shocks, voiceovers, character art, and video cut-ins),
  the Comprehensive Game Music & Sound Benchmarking Standard (GMSBS / PSDPBS-5),
  and the Exhaustive Playthrough & Edge-Case Audit Protocol (EPAP-15).
---

# Gradient-Boosted Game Development Framework

## Overview

The **Gradient-Boosted Game Development Framework** is an iterative engineering and design methodology for transforming web, board, canvas, and simulation games from rough prototypes ($I_0$) through production grade ($I_1 \ge 90/100$) to multimodal, live-world integrated masterworks ($I_2 \ge 95/100$).

Game quality is optimized across **6 core dimensions**, prioritizing the highest residual deficits ($P_k = w_k \cdot \Delta_k$) through systematic phase-based implementation, exhaustive 15-scene automated audits, audio benchmarking, and test-driven verification gates.

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
   [Phase 7: Comprehensive Audio Benchmarking (GMSBS)]
     ├─ EBU R128 LUFS Audio Tier Normalization (-18/-14/-12/-8 LUFS)
     ├─ Click-Free ADSR Envelopes & DC Offset Elimination (t_attack >= 12ms)
     ├─ Adaptive Harmonic Consonance & Dynamic Sub-Bass Waveshaping
     └─ Sidechain Acoustic Ducking (-12dB / -18dB) & Frame-Accurate Triad
                         │
                         ▼
   [Phase 8: Exhaustive Playthrough & Edge-Case Audit (EPAP-15)]
     ├─ 15-Scene Automated Headless Traversal Engine
     ├─ State Permutation & Failure Heuristic Validation
     └─ Zero Deadlock, Zero NaN/Undefined Invariant Enforcement
                         │
                         ▼
       [Masterwork Game I2 (Target >= 95.6)] ──► QA & Verification Gates (Gates 1-10)
```

---

## The 6-Dimension Game Gradient-Boosting Scorecard ($I_0 \to I_1 \to I_2$)

When evaluating or upgrading any web game, score the baseline across these 6 weighted dimensions:

| Dimension | Weight ($w_k$) | Baseline ($I_0$) | Target ($I_1$) | Target ($I_2$) | Description & Standards |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Visual Polish & Layout Integrity** | `0.20` | `58` | `90` | `95` | Modals fit within `88vh`; perimeter tiles show prices, owner glow, upgrade pips; custom SVG tokens; live macro ticker & bespoke character portrait frames. |
| **2. Audio, Music & Sound Design** | `0.15` | `35` | `88` | `95` | Adheres to GMSBS / PSDPBS-5: click-free ADSR envelopes; EBU R128 LUFS loudness isolation; adaptive ambient tension pulse; dynamic sub-bass morphing; voiceover & sound stems. |
| **3. Multimodal Feedback & Juice** | `0.15` | `42` | `89` | `96` | Synchronized audio cue + floating resource badge + HUD/telemetry reaction within $\le 16.7\text{ms}$ + 2.8s broadcast video cut-in overlay with procedural fallback. |
| **4. Deduplication & Code Hygiene** | `0.15` | `54` | `88` | `93` | Single-source formatters; clean architectural separation; schema-validated news/shock engine (`data/liveWorldFeed.json`); zero duplicate helpers. |
| **5. Core Gameplay & Long-Term Engagement** | `0.25` | `62` | `92` | `97` | Cross-system synergies; longitudinal consequence queues; active regime rule hooks; dynamic real-world macro shocks (epidemic, shortage, CPI, guideline revisions). |
| **6. Runtime Stability & Data Binding** | `0.10` | `45` | `96` | `98` | Zero `undefined` or clipped strings; in-game Options pauses timers cleanly; 100% offline fallback cache for zero 404s/rejections on static GitHub Pages; passes EPAP-15 all-scene audit. |

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

### 2. Procedural Sound & Dynamic Gameflow Pacing Framework (PSDPBS-5 / GMSBS)

Procedural Web Audio and game pacing are symbiotic: sound drives emotional tempo, and dynamic pacing prevents turn fatigue. Apply the **5-Pillar Procedural Sound & Dynamic Pacing Standard (PSDPBS-5)** and **Game Music & Sound Benchmarking Standard (GMSBS)**:

#### Pillar 1: Dynamic Gameflow & Movement Pacing Curve ($\tau_{step}$)
Never use fixed linear step delays for board movement or entity traversal. High rolls (e.g. 10–12 tiles) feel sluggish under fixed 280ms delays (3.36s total duration), while small rolls (2–3 tiles) finish too quickly to register. Apply the dynamic non-linear step curve:
$$\tau_{step}(D) = \begin{cases} 
220\text{ ms}, & D \le 5 \\
\max(110\text{ ms}, 280 - (D - 6) \times 24\text{ ms}), & D > 5
\end{cases}$$
- **Bot Pacing Acceleration**: For automated bot agents, scale movement delay by $\alpha_{bot} = 0.50$ ($\tau_{bot} = \max(55\text{ ms}, 0.5 \cdot \tau_{step}(D))$) and enforce decision latency $\le 450 - 650\text{ ms}$ with momentary visual highlight cues to eliminate dead time without confusing human players.

#### Pillar 2: Psychoacoustic & Spectral Benchmarking ($B_{spectral}$)
Adhere to international EBU R128 loudness standards across all game audio tiers to guarantee comfortable, fatigue-free listening across laptop speakers, headphones, and mobile devices:
- **Layer 1: Ambient Strategy Music / Bed**: $-18.0 \pm 1.0\text{ LUFS}$ (warm, non-intrusive harmonic background; dynamic range $\le 12\text{ LU}$).
- **Layer 2: UI Clicks & Token Traversal**: $-14.0 \pm 1.0\text{ LUFS}$ (crisp navigation ticks, filtered to avoid high-frequency ear fatigue).
- **Layer 3: Event & Decision Stingers**: $-12.0 \pm 1.0\text{ LUFS}$ (satisfying resolution confirmation, trade acceptance, upgrade fanfare).
- **Layer 4: Critical Emergencies & Cut-Ins**: $-8.0 \pm 1.0\text{ LUFS}$ (high-stakes alarms, Code Blue sirens, regulatory gavel bangs; isolated to $\le 3.0\text{s}$ duration).

**Frequency Spectrum Isolation & Anti-Aliasing Envelopes:**
- **Sub-Bass & Hemodynamic Heartbeat ($40\text{ Hz} - 120\text{ Hz}$)**: Low-pass filtered (2nd order Butterworth at $140\text{ Hz}$); dynamically morphs waveshape based on physiological crisis ($f_0 = 70\text{ Hz}$ sine at normal tension, triangle at moderate tension, sawtooth at hypertensive crisis).
- **Warm Harmonic Foundation ($180\text{ Hz} - 1,400\text{ Hz}$)**: Sine/triangle chord pads passed through a low-pass anti-aliasing filter at $2,400\text{ Hz}$ to prevent brittle harshness.
- **Telemetry & Informational Leads ($1,600\text{ Hz} - 4,500\text{ Hz}$)**: Short arpeggiated beeps ($Q = 3.0$) with exponential envelope decay.
- **Click Elimination & Anti-Aliasing ADSR**: Never set instantaneous gain changes. Every procedural gain node must use smooth automation ramps:
  $$V(t) = \begin{cases}
  V_{target} \cdot \left(\frac{t - t_0}{t_{attack}}\right), & t_0 \le t < t_0 + t_{attack} \quad (t_{attack} \ge 12\text{ ms}) \\
  V_{target} \cdot e^{-\frac{t - (t_0 + t_{attack})}{\tau_{decay}}}, & \text{decay / release} \quad (\tau_{rel} \ge 40\text{ ms})
  \end{cases}$$
  Always call `gainNode.gain.cancelScheduledValues(t)` and `setValueAtTime(currentGain, t)` before ramping to prevent DC clicks.

#### Pillar 3: Adaptive Harmonic Consonance Index ($H_{tension}$)
Dynamically compute and modulate chord progressions, dissonance, and tempo based on live game telemetry:
$$H_{tension} = w_1 \cdot \left(\frac{\text{Crisis Metric} - M_{min}}{M_{max} - M_{min}}\right) + w_2 \cdot D_{financial} + w_3 \cdot \mathbb{I}_{emergency}$$

- **Calm State ($H_{tension} < 0.20$)**:
  - Tempo: $72\text{ BPM}$. Progression: Lush Major 9th / 13th chords ($Dm9 \to G13 \to Cmaj9 \to Am7$).
  - Acoustic timbre: Soft sine pads, gentle high-shelf attenuation ($-3\text{ dB}$ at $4\text{ kHz}$).
- **Elevated Tension State ($0.20 \le H_{tension} < 0.70$)**:
  - Tempo: $96 - 108\text{ BPM}$. Progression: Minor 9th, half-diminished, and suspended chords with syncopated telemetry ticks.
  - Acoustic timbre: Mixed triangle/square waves with resonant bandpass sweeps.
- **Crisis / Emergency State ($H_{tension} \ge 0.70$)**:
  - Tempo: $132 - 144\text{ BPM}$. Progression: Diminished 7th, augmented 11th, and tritone intervals ($B\text{dim7} \to E7\flat9 \to Am9$; tritone interval ratio $f_{tritone} = f_0 \cdot \sqrt{2}$).
  - Acoustic timbre: Sawtooth sub-bass, rapid dual-tone siren modulation ($880\text{ Hz} \leftrightarrow 440\text{ Hz}$ at $3.2\text{ Hz}$ LFO rate).

#### Pillar 4: Dynamic Acoustic Ducking ($D_{duck}$)
When high-priority voiceovers, clinical dialog modals, or video cut-ins fire, apply sidechain acoustic ducking to background pads:
$$G_{bgm}(t) = G_{nominal} \cdot \left[1 - (1 - d_{depth}) \cdot \left(1 - e^{-t/\tau_{duck\_in}}\right)\right]$$
- **Ducking Depth ($d_{depth}$)**: $-12\text{ dB}$ ($0.25\times$ nominal amplitude) for modal dialogs and voiceovers; $-18\text{ dB}$ ($0.125\times$) for Code Blue cut-ins.
- **Attack Speed ($\tau_{duck\_in}$)**: $120 - 150\text{ ms}$ exponential ducking attack to clear frequency space instantly without pop artifacts.
- **Release Ramp ($\tau_{duck\_out}$)**: $600 - 900\text{ ms}$ smooth restoration upon modal or cut-in dismissal.

#### Pillar 5: Multimodal Audio-Visual-Haptic Triad ($M_{triad}$)
Synchronize audio transients with DOM/Canvas visual feedback and haptic cues within a strict $\Delta t \le 16.7\text{ ms}$ tolerance window (1 frame at 60 FPS):
- Resource change trigger $\to$ Audio stinger start + Floating DOM badge render + HUD counter interpolation must execute in the identical animation frame via `requestAnimationFrame`.

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

### 8. Exhaustive Playthrough & Edge-Case Audit Protocol (EPAP-15)

Production game engines must be resilient against edge-case state permutations, asynchronous race conditions, and catastrophic lockups. The **EPAP-15 Protocol** defines an automated, programmatic 15-scene matrix verifying zero gameplay deadlocks, data corruptions, or visual desyncs.

#### The 15-Scene Comprehensive Audit Matrix

| Scene ID | Scene Name | Critical Triggers & Edge Conditions | Invariants & Expected Output | Failure Heuristics & Red Flags |
| :---: | :--- | :--- | :--- | :--- |
| **S01** | **Boot, Preloader & Splash Screen** | Hard page reload; missing remote assets; offline sandbox mode; immediate interaction before preloads complete. | Zero console errors; audio warmup chime triggers cleanly; hero fallback art renders if remote 404s; splash dismisses within $\le 350\text{ms}$. | Infinite loading spinner; frozen title card; unhandled promise rejection on missing MP4/WAV; missing start button. |
| **S02** | **Setup, Factions & Regime Config** | 2 to 4 players; all-bot vs human-only matches; extreme custom regime parameters (capitation, value-based care, fee-for-service). | Initial RVU balance, starting SBP/BMI, and faction traits bind without `NaN` or `undefined`; setup modal closes cleanly. | Missing player tokens; negative starting cash; unselected faction crash; broken color scheme inheritance. |
| **S03** | **Perimeter Board & Token Movement** | Dice rolls (2 to 12); dynamic movement pacing curve $\tau_{step}(D)$; passing GO/Salary tile; speed-stepping bots. | Active tile updates accurately; player token hops along SVG path; board perimeter scales without overflow; salary credited. | Token hopping off-grid; player index out of bounds; turn stuck in stepping loop; duplicate dice triggers while hopping. |
| **S04** | **Clinical Encounters & Vignettes** | Landing on clinical/patient tile; 88vh viewport constraint; option selection under high-fatigue state; consequence triggers. | Sticky header remains visible; choices grid wraps responsively; GDMT/RVU outcomes apply; hospital suite synergies trigger toast. | Modal buttons obscured below fold; selection does nothing; null patient object; text overlapping in patient history. |
| **S05** | **Center Console & Tile Inspector** | Inspecting unowned, owned, and mortgaged properties; purchasing upgrades (pips 1–4); toggling mortgage status. | Inspector modal renders full tier pricing; mortgage status toggles hazard striping; upgrade pips render in color bar; unmortgage fee accurate. | Upgrading beyond tier 4; negative rent calculations; mortgaged property charging rent; broken SVG color swatch. |
| **S06** | **Telemetry & Hemodynamic HUD** | Active player turn switch; fluctuating SBP/HR; arterial line waveform canvas animation; audio pitch matching vitals. | Real-time ECG trace redraws at 60 FPS; SBP badge reflects player health; sub-bass audio morphs wave type cleanly; canvas resizes on DPR. | Canvas stretching/distortion; memory leak from uncleared `requestAnimationFrame`; audio oscillator runaway; NaN pulse. |
| **S07** | **Live Property Auctions** | Declining tile purchase; multi-bot bidding war; auction countdown timer; anti-sniping extension rule; zero-cash player. | Timer ticks smoothly; bots place rational bids within valuation ceiling; winning bidder debited and tile awarded; state unpauses. | Timer freezing at 0s; infinite auction loop; negative bids; bankruptcy crash during auction; orphaned auction interval. |
| **S08** | **Strategic Trading & Asset Transfers** | Player-to-player trade proposal; unequal property bundles; cash considerations; bot valuation evaluation; rejection/acceptance. | Bot accepts fair trades ($> 1.05\times$ valuation) and rejects unfair ones; property ownership arrays update atomically; cash transfers cleanly. | Duplicate property assignment; negative cash balances; trading mortgaged property without tag; trade modal getting stuck open. |
| **S09** | **Code Blue & Emergency Incidents** | Patient vitals crossing critical threshold (SBP $\ge 200$, BMI $\ge 70$); screen-shake trigger; emergency audio alarm synthesis. | Screen shake animation fires for 450ms; dual-tone alarm plays; ICU transfer penalty debited; emergency cut-in overlay presents option. | Permanent screen shake lock; audio alarm looping indefinitely without decay; player teleporting off-board; game stall. |
| **S10** | **Longitudinal Consequence Queue** | Multi-turn deferred outcomes (`followUpQueue`); premature discharge readmission; clinical trial publication delay. | Events queue on turn $T$ and fire precisely at turn $T + N$; readmission penalties applied; compendium updates trial discovery. | Event executing on wrong turn; duplicate event execution; queue array mutation during iteration causing skipped events. |
| **S11** | **MCP Live-World Macro Shocks** | Turn modulo 4 boundary (`turn % 4 == 0`); drug shortages; epidemic surge; reimbursement cuts; PubMed guideline updates. | Macro ticker scrolls breaking incident; dynamic multipliers apply to clinic revenue and cath lab surcharges; offline deck fallback works. | Undefined ticker text; game freezing on turn 4; missing offline deck; unhandled network fetch timeout. |
| **S12** | **Cut-In Overlays & Media Fallbacks** | Triggering Code Blue, Cath Lab, or Regulatory Audit; missing MP4 video file; missing voiceover audio; skip on click/keypress. | 2.8s broadcast banner renders with skewed perspective; graceful procedural SVG/canvas fallback if media 404s; audio ducks $-12\text{dB}$. | Broken video icon in viewport; unhandled promise rejection on `video.play()`; overlay blocking clicks indefinitely after dismiss. |
| **S13** | **Pause, Options & State Suspension** | Opening settings dialog during active bot turn or live auction; volume mute toggles; closing settings and resuming. | All active timeouts and auction intervals pause; sound stops immediately on mute; resuming restores exact turn and timer state. | Bot executing move behind open modal; auction expiring while paused; audio resuming in muted state; duplicate timers on resume. |
| **S14** | **Career Compendium & Persistence** | Unlocking clinical trials; winning a match; browser localStorage quota exceeded; corrupted or legacy save state schema. | Saves serialize with version tag (`v1`); unlocked trials and achievements display in Compendium; legacy schema migrations succeed. | `localStorage` quota crash; JSON parse crash on corrupted string; stats resetting to 0 on refresh; missing trial descriptions. |
| **S15** | **Game Over & Victory Resolution** | Player bankruptcy (cash < 0 and no unmortgaged assets); GDMT victory threshold reached; monopoly on all hospital suites. | Eliminated players removed from turn queue; assets liquidated or transferred to creditor; victory splash reveals final RVU leaderboard. | Turn passing to bankrupt player; game crashing when active player eliminated; restart button failing to reset full gameState. |

#### Automated Headless Audit Harness Pattern
Every project adhering to this framework must maintain a zero-dependency headless node audit script (`tools/playthrough_audit_all_scenes.js`) that simulates all 15 scenes:

```javascript
// tools/playthrough_audit_all_scenes.js
const fs = require('fs');
const path = require('path');

// 1. Mock DOM and Web Audio API environment
function createMockEnvironment() {
  const elements = new Map();
  const mockDoc = {
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      style: {},
      setAttribute: () => {},
      appendChild: () => {},
      addEventListener: () => {}
    }),
    getElementById: (id) => elements.get(id) || null,
    querySelector: (sel) => null,
    querySelectorAll: () => []
  };
  global.document = mockDoc;
  global.window = {
    AudioContext: class {
      createGain() { return { gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, cancelScheduledValues: () => {} }, connect: () => {} }; }
      createOscillator() { return { frequency: { setValueAtTime: () => {} }, start: () => {}, stop: () => {}, connect: () => {} }; }
    },
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); }
    }
  };
}

// 2. Scene Traversal Runner
async function runEPAP15Audit() {
  const auditReport = { timestamp: new Date().toISOString(), passedScenes: 0, totalScenes: 15, results: [] };
  const scenes = [
    { id: 'S01', name: 'Boot & Splash Screen', test: async () => /* test logic */ },
    // ... all 15 scenes
  ];

  for (const scene of scenes) {
    try {
      await scene.test();
      auditReport.passedScenes++;
      auditReport.results.push({ id: scene.id, name: scene.name, status: 'PASSED' });
    } catch (err) {
      auditReport.results.push({ id: scene.id, name: scene.name, status: 'FAILED', error: err.message });
    }
  }

  fs.writeFileSync('tests/exhaustive_playthrough_report.json', JSON.stringify(auditReport, null, 2));
  if (auditReport.passedScenes < 15) throw new Error(`Audit failed: ${15 - auditReport.passedScenes} scenes failed.`);
}
```

#### Verification Gate Integration
When running audits, check:
1. `tests/exhaustive_playthrough_report.json` must report `15/15` scenes `PASSED`.
2. Total audit execution time must be under $5.0\text{s}$ for continuous CI/CD integration.
3. Zero warnings or unhandled promise rejections.

---

## QA Verification Checklist

Before completing any game optimization task, verify all gates:

- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.
- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.
- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\le 16.7\text{ms}$.
- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.
- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.
- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.
- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.
- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 2.8s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.
- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits `tests/exhaustive_playthrough_report.json`.
- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\text{ LUFS}$, UI $-14\text{ LUFS}$, Stingers $-12\text{ LUFS}$, Alarms $-8\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \ge 12\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.
