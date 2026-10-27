---
name: game-development
description: >-
  Use when developing, optimizing, auditing, or refactoring web, canvas, or simulation games.
  Implements the 6-dimension Gradient-Boosting Game Optimization Framework (I0 -> I1 -> I2)
  covering visual polish, Web Audio API ADSR sound design, multimodal juice & feedback synchronization,
  code deduplication, core gameplay synergies & long-term retention loops, runtime stability/data-binding,
  the Iteration 2 MCP ecosystem (real-world macro shocks, voiceovers, character art, and video cut-ins),
  the Comprehensive Game Music & Sound Benchmarking Standard (GMSBS / PSDPBS-5),
  the Exhaustive Playthrough & Edge-Case Audit Protocol (EPAP-15),
  and the Cut-In, Multimodal & Interaction Flow Robustness Standard (CMIFRS).
---

# Gradient-Boosted Game Development Framework

## Overview

The **Gradient-Boosted Game Development Framework** is an iterative engineering and design methodology for transforming web, board, canvas, and simulation games from rough prototypes ($I_0$) through production grade ($I_1 \ge 90/100$) to multimodal, live-world integrated masterworks ($I_2 \ge 95/100$).

Game quality is optimized across **6 core dimensions**, prioritizing the highest residual deficits ($P_k = w_k \cdot \Delta_k$) through systematic phase-based implementation, exhaustive 15-scene automated audits, audio benchmarking, cut-in media resilience, interaction flow suspension, and test-driven verification gates.

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
   [Phase 9: Cut-In, Multimodal & Interaction Flow Robustness (CMIFRS)]
     ├─ Video Cut-In & Media Resilience Benchmark (VC-MRB: Faststart MP4 + Layered Posters)
     ├─ Multimodal Audio-Visual-Haptic Triad Benchmark (MAVHT-B: 1.8Hz CPR Strobe + Δt <= 16.7ms)
     └─ Interaction Flow & Suspension Robustness Standard (IFSRS: Atomic Auction & Bot Freezing)
                         │
                         ▼
       [Masterwork Game I2 (Target >= 95.6)] ──► QA & Verification Gates (Gates 1-12)
```

---

## The 6-Dimension Game Gradient-Boosting Scorecard ($I_0 \to I_1 \to I_2$)

When evaluating or upgrading any web game, score the baseline across these 6 weighted dimensions:

| Dimension | Weight ($w_k$) | Baseline ($I_0$) | Target ($I_1$) | Target ($I_2$) | Description & Standards |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Visual Polish & Layout Integrity** | `0.20` | `58` | `90` | `95` | Modals fit within `88vh`; perimeter tiles show prices, owner glow, upgrade pips; custom SVG tokens; live macro ticker & bespoke character portrait frames. |
| **2. Audio, Music & Sound Design** | `0.15` | `35` | `88` | `95` | Adheres to GMSBS / PSDPBS-5: click-free ADSR envelopes; EBU R128 LUFS loudness isolation; adaptive ambient tension pulse; dynamic sub-bass morphing; voiceover & sound stems. |
| **3. Multimodal Feedback & Juice** | `0.15` | `42` | `89` | `96` | Synchronized audio cue + floating resource badge + HUD/telemetry reaction within $\le 16.7\text{ms}$ + 5.5s broadcast video cut-in overlay with zero-blank dual-plane fallback. |
| **4. Deduplication & Code Hygiene** | `0.15` | `54` | `88` | `93` | Single-source formatters; clean architectural separation; schema-validated news/shock engine (`data/liveWorldFeed.json`); zero duplicate helpers. |
| **5. Core Gameplay & Long-Term Engagement** | `0.25` | `62` | `92` | `97` | Cross-system synergies; longitudinal consequence queues; active regime rule hooks; dynamic real-world macro shocks (epidemic, shortage, CPI, guideline revisions). |
| **6. Runtime Stability & Data Binding** | `0.10` | `45` | `96` | `98` | Zero `undefined` or clipped strings; in-game Options pauses timers cleanly; atomic interaction freeze on emergencies; passes EPAP-15 and CMIFRS audits. |

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
         └── CutInOverlayManager ──► 5.5s Broadcast Video / Dual-Plane Fallback
```

---

### 8. Exhaustive Playthrough & Edge-Case Audit Protocol (EPAP-15)

Production game engines must be resilient against edge-case state permutations, asynchronous race conditions, and catastrophic lockups. The **EPAP-15 Protocol** defines an automated, programmatic 15-scene matrix verifying zero gameplay deadlocks, data corruptions, or visual desyncs.

| Scene ID | Scene Name | Critical Triggers & Edge Conditions | Invariants & Expected Output | Failure Heuristics & Red Flags |
| :---: | :--- | :--- | :--- | :--- |
| **S01** | **Boot, Preloader & Splash Screen** | Hard page reload; missing remote assets; offline sandbox mode; immediate interaction before preloads complete. | Zero console errors; audio warmup chime triggers cleanly; hero fallback art renders if remote 404s; splash dismisses within $\le 350\text{ms}$. | Infinite loading spinner; frozen title card; unhandled promise rejection on missing MP4/WAV; missing start button. |
| **S02** | **Setup, Factions & Regime Config** | 2 to 4 players; all-bot vs human-only matches; extreme custom regime parameters (capitation, value-based care, fee-for-service). | Initial RVU balance, starting SBP/BMI, and faction traits bind without `NaN` or `undefined`; setup modal closes cleanly. | Missing player tokens; negative starting cash; unselected faction crash; broken color scheme inheritance. |
| **S03** | **Perimeter Board & Token Movement** | Dice rolls (2 to 12); dynamic movement pacing curve $\tau_{step}(D)$; passing GO/Salary tile; speed-stepping bots. | Active tile updates accurately; player token hops along SVG path; board perimeter scales without overflow; salary credited. | Token hopping off-grid; player index out of bounds; turn stuck in stepping loop; duplicate dice triggers while hopping. |
| **S04** | **Clinical Encounters & Vignettes** | Landing on clinical/patient tile; 88vh viewport constraint; option selection under high-fatigue state; consequence triggers. | Sticky header remains visible; choices grid wraps responsively; GDMT/RVU outcomes apply; hospital suite synergies trigger toast. | Modal buttons obscured below fold; selection does nothing; null patient object; text overlapping in patient history. |
| **S05** | **Center Console & Tile Inspector** | Inspecting unowned, owned, and mortgaged properties; purchasing upgrades (pips 1–4); toggling mortgage status. | Inspector modal renders full tier pricing; mortgage status toggles hazard striping; upgrade pips render in color bar; unmortgage fee accurate. | Upgrading beyond tier 4; negative rent calculations; mortgaged property charging rent; broken SVG color swatch. |
| **S06** | **Telemetry & Hemodynamic HUD** | Active player turn switch; fluctuating SBP/HR; arterial line waveform canvas animation; audio pitch matching vitals. | Real-time ECG trace redraws at 60 FPS; SBP badge reflects player health; sub-bass audio morphs wave type cleanly; canvas resizes on DPR. | Canvas stretching/distortion; memory leak from uncleared `requestAnimationFrame`; audio oscillator runaway; NaN pulse. |
| **S07** | **Live Property Auctions** | Declining tile purchase; multi-bot bidding war; auction countdown timer; anti-sniping extension rule; zero-cash player. | Timer ticks smoothly; bots place rational bids within valuation ceiling; winning bidder debited and tile awarded; atomic emergency suspension. | Timer freezing at 0s; infinite auction loop; negative bids; bankruptcy crash during auction; orphaned auction interval. |
| **S08** | **Strategic Trading & Asset Transfers** | Player-to-player trade proposal; unequal property bundles; cash considerations; bot valuation evaluation; rejection/acceptance. | Bot accepts fair trades ($> 1.05\times$ valuation) and rejects unfair ones; property ownership arrays update atomically; cash transfers cleanly. | Duplicate property assignment; negative cash balances; trading mortgaged property without tag; trade modal getting stuck open. |
| **S09** | **Code Blue & Emergency Incidents** | Patient vitals crossing critical threshold (SBP $\ge 200$, BMI $\ge 70$); screen-shake trigger; emergency audio alarm synthesis. | Screen shake animation fires for 450ms; room red perimeter strobe; V-Fib canvas animation; defib audio chain; ICU transfer penalty debited. | Permanent screen shake lock; audio alarm looping indefinitely without decay; player teleporting off-board; game stall. |
| **S10** | **Longitudinal Consequence Queue** | Multi-turn deferred outcomes (`followUpQueue`); premature discharge readmission; clinical trial publication delay. | Events queue on turn $T$ and fire precisely at turn $T + N$; readmission penalties applied; compendium updates trial discovery. | Event executing on wrong turn; duplicate event execution; queue array mutation during iteration causing skipped events. |
| **S11** | **MCP Live-World Macro Shocks** | Turn modulo 4 boundary (`turn % 4 == 0`); drug shortages; epidemic surge; reimbursement cuts; PubMed guideline updates. | Macro ticker scrolls breaking incident; dynamic multipliers apply to clinic revenue and cath lab surcharges; offline deck fallback works. | Undefined ticker text; game freezing on turn 4; missing offline deck; unhandled network fetch timeout. |
| **S12** | **Cut-In Overlays & Media Fallbacks** | Triggering Code Blue, Cath Lab, or Regulatory Audit; missing MP4 video file; missing voiceover audio; skip on click/keypress. | 5.5s broadcast banner renders with skewed perspective; graceful procedural CRT/canvas fallback if media 404s; audio ducks $-18\text{dB}$. | Broken video icon in viewport; unhandled promise rejection on `video.play()`; overlay blocking clicks indefinitely after dismiss. |
| **S13** | **Pause, Options & State Suspension** | Opening settings dialog during active bot turn or live auction; volume mute toggles; closing settings and resuming. | All active timeouts and auction intervals pause; sound stops immediately on mute; resuming restores exact turn and timer state. | Bot executing move behind open modal; auction expiring while paused; audio resuming in muted state; duplicate timers on resume. |
| **S14** | **Career Compendium & Persistence** | Unlocking clinical trials; winning a match; browser localStorage quota exceeded; corrupted or legacy save state schema. | Saves serialize with version tag (`v1`); unlocked trials and achievements display in Compendium; legacy schema migrations succeed. | `localStorage` quota crash; JSON parse crash on corrupted string; stats resetting to 0 on refresh; missing trial descriptions. |
| **S15** | **Game Over & Victory Resolution** | Player bankruptcy (cash < 0 and no unmortgaged assets); GDMT victory threshold reached; monopoly on all hospital suites. | Eliminated players removed from turn queue; assets liquidated or transferred to creditor; victory splash reveals final RVU leaderboard. | Turn passing to bankrupt player; game crashing when active player eliminated; restart button failing to reset full gameState. |

---

### 9. Cut-In, Multimodal & Interaction Flow Robustness Standard (CMIFRS)

Web game engines with rich multimodal cut-ins must guarantee 100% visual and interactive reliability across cellular mobile devices, low-spec tablets, and high-DPI desktop viewports. Adhere to the **3 Core Robustness Benchmarks**:

#### 1. Video Cut-In Performance & Resilience Benchmark (VC-PRB)
1. **Container & Codec Precedence:**
   - **Primary**: H.264 High/Baseline MP4 with `-movflags +faststart`, yuv420p, 16:9 aspect ratio ($640 \times 360$ or $1280 \times 720$). Moving the `moov` atom to the file head guarantees instant playback without downloading the whole file.
   - **Secondary**: VP8/VP9 WebM for lightweight desktop Chromium rendering.
   - **Layered Dual-Plane Stacking**: Never hide poster images with `display: none` while video buffers. Stack keyframe posters at `z-index: 1` directly under the video at `z-index: 2` (with initial `opacity: 0` transitioning to `1` on `video.onplaying`). If cellular data saver or mobile Low Power Mode restricts autoplay, the poster is rendered with zero visual latency ($\tau_{visual} \le 50\text{ms}$).
2. **Mobile Autoplay Invariants:**
   - Always enforce 5 mandatory attributes: `autoplay`, `muted`, `loop`, `playsinline`, `webkit-playsinline`.
   - Explicit Programmatic Activation: Call `video.muted = true`, `video.load()`, and `video.play().catch(...)`.
   - Error Isolation: Never rely on `<video onerror>` when child `<source>` tags are present, because standard HTML5 specifies source load errors do not bubble to the parent video.
3. **Zero-Empty-Placeholder Guarantee:**
   - No cut-in preset (`code_blue`, `cath_lab`, `regulatory_audit`, `macro_shock`, `monopoly`) may ever fall back to a bare static vector line.
   - Every procedural fallback must render a rich 60 FPS CRT Phosphor Oscilloscope Canvas with scanline sweeps, live vital/financial waveforms, and phosphor glow.

#### 2. Multimodal Audio-Visual-Haptic Triad Benchmark (MAVHT-B)
1. **Audio-Visual-DOM Transient Latency Bound ($\Delta t_{AVH}$):**
   - Transients (floating DOM delta badge, audio stinger onset, and screen shake/strobe) must fire within a strict frame bound:
     $$\Delta t_{AVH} \le 16.7\text{ ms} \quad (\text{1 video frame at 60 FPS})$$
2. **Emergency Room Illumination Law ($E_{strobe}$):**
   - Critical clinical emergencies (`code_blue`, ICU arrest) must project ambient room illumination (`.code-blue-crisis-strobe`) pulsing at $1.8\text{ Hz}$ ($108\text{ BPM}$, matching AHA/ERC CPR chest compression standards) via a radial perimeter vignette.
3. **Dynamic Physiological Telemetry Coupling:**
   - ECG color, sub-bass oscillator waveshape (sine $\to$ triangle $\to$ sawtooth), and vital badges must update synchronously from active player physiological metrics.

#### 3. Interaction Flow & State Suspension Robustness Standard (IFSRS)
1. **Atomic Interaction Lockout:**
   - When an emergency or cut-in activates, all background timers (live auction clocks, bot decision timeouts, trading intervals) must atomically freeze.
   - User inputs (`#roll-btn`, property inspection, trade modal) must be locked via `pointer-events: none` and state flags (`isEmergencyPaused = true`).
2. **Temporal Preservation Invariant:**
   - Auction clocks must preserve remaining seconds with floating-point precision ($\Delta \tau = 0$ while frozen).
   - Zero bot bids or timer decrements may execute while `isEmergencyFrozen` is true.
3. **Clean Resumption without Desync:**
   - Resuming from an emergency must restore the exact remaining time, re-queue bot intervals, fade background music back up over $800\text{ ms}$, and clear all emergency CSS classes.

---


---

### 10. Image Integrity & Non-Distortion Benchmark (IINDB)

Production games must never display stretched, torn, clipped, or corrupted graphics across differing screen geometries (desktop, tablet, mobile portrait/landscape). The **IINDB Standard** guarantees that all in-game image assets and stacked presentation planes render completely and seamlessly without distortion artifacts.

#### 1. Dual-Plane Geometric Pinning Law ($S_{pin}$)
- When a raster poster (`<img class="cutin-poster">`) and a video stream (`<video class="cutin-video">`) or canvas layer coexist inside a dual-plane container (`.cutin-media-container`), both elements must share identical absolute geometric bounding boxes:
  ```css
  .cutin-poster,
  .cutin-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-height: none;
    object-fit: cover;
    display: block;
  }
  .cutin-poster { z-index: 1; }
  .cutin-video  { z-index: 2; }
  ```
- **Zero Flow Clipping Invariant:** Under no circumstances may an inner media layer rely on `position: relative` with `height: 100%` inside an `aspect-ratio: 16/9` container, as mobile WebKit/Blink resolves relative percentage heights against implicit container heights, causing partial flow wrapping and horizontal split/tear artifacts across the screen.

#### 2. Uniform Aspect Ratio & Boundary Fit Standard ($AR_{fit}$)
- Cut-in and cinematic modal artwork must strictly conform to a 16:9 ratio ($1.77 \pm 0.05$).
- Character avatars and centerpiece emblems must conform to 1:1 ($1.00 \pm 0.01$).
- Scale distortion tolerance: $S_x = S_y = 1.0 \pm 0.02$. Anisotropic scaling (stretching) is strictly forbidden.

#### 3. Pixel Continuity & Shear Discontinuity Scan ($D_{tear}$)
- Every generated or imported raster asset must pass an automated inter-row gradient scan:
  $$D_{tear}(y) = \frac{1}{W} \sum_{x=1}^{W} \|\mathbf{P}(x, y) - \mathbf{P}(x, y+1)\|$$
- For clean illustrations and photographs, the maximum inter-row discontinuity must satisfy:
  $$D_{tear}(y) \le 32.0 \quad \forall y \in [10, H-10]$$
- Any spike ($D_{tear} > 32$) indicates an artificial horizontal splice, missing canvas tile, or broken buffer blit.

#### 4. Zero-Broken-Asset Guarantee
- All images must contain valid format headers (e.g. JPEG SOI `0xFF 0xD8`, PNG signature `0x89 0x50 0x4E 0x47`).
- If a remote asset fails to load over network or offline mode, the engine must immediately fall back to a local pre-rendered asset or procedural CRT phosphor canvas with zero unhandled promise rejections.

---

### 11. Video Performance & Engagement Benchmark (VPEB)

Video cut-ins must never feel like static screenshots or cause mobile browser lag. The **VPEB Standard** enforces both low-latency technical playback metrics and high-intensity cinematic engagement.

#### 1. Technical Playback Performance Standards
1. **Time to First Frame Bound ($\tau_{TTFF}$):**
   $$\tau_{TTFF} \le 120\text{ ms}$$
   - **Fast-Start MP4 Requirement:** All MP4 video containers must be encoded with the `moov` metadata atom positioned at the beginning of the file (before the `mdat` media atom) via FFmpeg `-movflags +faststart`. This enables instant playback streaming on mobile devices without waiting for the full file to download.
2. **Mobile Autoplay Readiness Index ($ARI_{mob}$):**
   - Every `<video>` element must include the complete quad-attribute configuration: `autoplay`, `muted`, `loop`, `playsinline`, `webkit-playsinline`, and `preload="auto"`.
   - JavaScript bridge must enforce programmatic `videoEl.muted = true` before invoking `videoEl.play()`.
3. **Dual-Stream Redundancy Protocol:**
   - Every cut-in preset must provide parallel H.264 MP4 and VP8 WebM sources, allowing instant hardware-accelerated playback across Safari/iOS, Android Chrome, and desktop environments.
4. **Seamless Zero-Flicker Failover ($\tau_{failover} = 0\text{ ms}$):**
   - If mobile Low Power Mode or data-saver blocks video autoplay (`video.play().catch(...)`), the underlying poster image remains seamlessly visible with zero flash of black or broken video icon.

#### 2. Video Engagement Index ($E_{vid}$)
A cut-in video must exhibit visceral, dynamic motion that immediately communicates urgency and consequence. Static camera pans (e.g. a 2-pixel-per-second Ken Burns zoom) score $E_{vid} < 0.30$ and fail this benchmark.

The composite **Video Engagement Index ($E_{vid}$)** is defined as:
$$E_{vid} = 0.40 \cdot M_{vec} + 0.25 \cdot L_{dyn} + 0.20 \cdot S_{trans} + 0.15 \cdot A_{sync} \ge 0.75$$

Where:
- **Kinematic Motion Vector Density ($M_{vec} \ge 0.35$):**
  Normalized inter-frame pixel delta across time:
  $$M_{vec} = \min\left(1.0, \frac{1}{20 \cdot T} \sum_{t=1}^{T} \frac{1}{W \cdot H} \sum_{x,y} |P(x,y,t) - P(x,y,t-1)|\right)$$
  Requires active intra-frame movement (CPR chest heaving at 1.8 Hz, pulsed cine-fluoroscopy strobing at 3.0 Hz, scanning radar beams, document slam vibrations).
- **Dynamic Lighting Modulation ($L_{dyn} \ge 0.70$):**
  Periodic luminosity and contrast oscillation simulating emergency beacons, X-ray tubes, or alarm strobes.
- **Dramatic Narrative Transient ($S_{trans} \ge 0.80$):**
  At least one high-impact keyframe event per cut-in sequence:
  - *Code Blue:* Defibrillation electrical discharge flash ($t = 3.2\text{s}$).
  - *Cath Lab:* Stent balloon dilation bloom & radial contrast flare ($t = 2.5\text{s}$).
  - *Regulatory Audit:* Ministry clawback stamp camera slam & document shake ($t = 1.35\text{s}$).
- **Audio-Visual Transient Synchrony ($A_{sync}$):**
  Visual transient onset must synchronize with Web Audio API sound cue stingers within $\Delta t_{AV} \le 16.7\text{ ms}$ (1 video frame at 60 FPS).


---

### 12. Data-Binding & Text Interpolation Integrity Benchmark (DTTIB)

Every user-facing template string, HUD label, modal body, and faction dossier card must be protected against runtime interpolation anomalies (`undefined`, `NaN`, `null%`, `undefined%`, `[object Object]`). The **DTTIB Standard** establishes strict runtime and static invariants for all text rendering pipelines.

#### 1. Zero-Undefined Invariant ($\Theta_{defect}$)
- The Data-Binding Defect Rate across all DOM nodes and text nodes must strictly equal zero:
  $$\Theta_{defect} = \frac{N_{unbound}}{N_{total\_fields}} = 0.0\%$$
- Any occurrence of `undefined%`, `(undefined%)`, or `NaN` in rendered UI cards triggers an immediate test failure.

#### 2. Defensive Coalescing & Safe Accessor Standard
- When extracting calculated properties from engine calculators, UI renderers must never assume a single hardcoded property name. Renderers must implement fallback coalescing chains:
  ```javascript
  const pct = prog.progressPct ?? prog.percentComplete ?? prog.percent ?? comp.pct ?? 0;
  const label = prog.label || `${pct}% Target Progress`;
  ```
- Engine progress calculators (`getFactionProgress`, `computePlayerFactionProgress`) must guarantee that all numeric progress fields are valid integers ($[0, 100]$) and all descriptive labels are non-empty strings.

---

### 13. Competitive Resuscitation & Emergent Challenge Benchmark (CRECB)

High-severity clinical emergencies (e.g. Code Blue Ventricular Fibrillation) must never exist as artificial main-menu test buttons. Instead, they must operate as **dynamic, emergent in-game Quick-Time Events (QTE)** where all active human and computer physicians compete in real-time under intense pressure.

#### 1. Dynamic Emergence Law
- Emergencies trigger through authentic clinical risk mechanics:
  1. **Physiological Criticality:** When active player SBP $\ge 195\text{ mmHg}$ or clinical complications $\ge 2$.
  2. **Emergent Hospital Arrest:** After turn 1, a dynamic hospital cardiac arrest event occurs with probability $P_{emergent} \in [0.08, 0.12]$ per turn cycle.
- **Main-Menu Sanity Invariant:** No test or cheat buttons triggering emergency mechanics may ever reside in production setup or main selection menus.

#### 2. 5-Second Multi-Phase Rhythm & Compression Protocol
- Players must execute a multi-phase resuscitation sequence within a strict countdown window ($T_{limit} \in [3.5\text{s}, 5.0\text{s}]$):
  - Phase 1: `⚡ CHARGE DEFIBRILLATOR PADDLES`
  - Phase 2: `❤️ CHEST COMPRESSIONS` (Mash button at 100-120 BPM rhythm)
  - Phase 3: `⚡ CLEAR & DELIVER 200J BIPHASIC SHOCK`
- Button mashing triggers visual screen shakes (`.code-blue-screen-shake`), depth feedback, and audio compression thumps.

#### 3. Real-Time Multi-Agent AI Contention
- The emergency is broadcast simultaneously to all physicians in the match.
- Computer bot physicians simulate authentic clinical response speeds:
  $$t_{Cath-A-Lot} < t_{Clawback} < t_{Margin} < T_{limit}$$
  - *Dr. Cath-A-Lot (Interventionalist):* Fastest mechanical hands (~70-82% of time limit).
  - *Inspector Clawback (Auditor):* Systematic clinical response (~80-88% of time limit).
  - *V.P. Margin (CEO):* Deliberate, risk-hesitant pacing (~88-94% of time limit).
- **Contention Rule:** First clinician (player or bot) to reach 100% resuscitation progress claims the Clinical Bounty.

#### 4. Scaling Difficulty & High-Stakes Asymmetry
- Difficulty scales with each occurrence ($L = 1, 2, 3, ...$):
  - **Time Window Compression:** $T_{limit}(L) = \max(3.5, 5.0 - (L - 1) \cdot 0.4\text{s})$.
  - **Rhythm Compressions:** $N_{mashes}(L) = 8 + (L - 1) \cdot 3$.
  - **Clinical Bounty Reward:** $+\$1,200 + (L - 1) \cdot 400\text{ WP}$, $+10\text{ GDMT}$, $+500\text{ RVU}$.
  - **Catastrophic Failure Penalty:** If the timer reaches $0.00\text{s}$ before resuscitation succeeds, the active player suffers an immediate malpractice/CCU charge of $-\$1,500 + (L - 1) \cdot 500\text{ WP}$, $-10\text{ GDMT}$, and transfer to CCU quarantine lockup.

#### 5. Interaction State Suspension Invariant
- During the active QTE, `freezeEmergencyState('CODE_BLUE_QTE')` atomically halts all auction clocks and bot turn intervals, restoring exact timestamps upon challenge completion.

---

### 14. Legacy Element & Deprecated Control Purge Benchmark (LEDAPB)

Development artifacts, temporary test triggers, and deprecated staging buttons (e.g. manual emergency trigger buttons, debug shortcuts) must never leak into production releases or persist in user browsers through aggressive mobile HTTP caching.

#### 1. Zero Deprecated Element Invariant
- Static source files (`index.html`, `script.js`) must be 100% free of legacy/staging selectors (`#test-code-blue-btn`, `#trigger-code-blue-btn`, `#test-resus-btn`):
  $$\Theta_{deprecated} = 0$$
- Automated static code scanning must verify zero occurrences of forbidden staging button patterns.

#### 2. Defensive Client-Side DOM Purge Routine
- Because mobile browsers (iOS Safari, Android Chrome) and Progressive Web Apps (PWAs) aggressively cache static HTML shells across application updates, the runtime engine must execute an automated defensive cleanup routine (`purgeDeprecatedTestElements()`) during:
  1. Initial `DOMContentLoaded` / engine boot.
  2. Setup lobby instantiation (`initSetupModal()`).
  3. Modal invocation (`openSetupModal()`).
- Any elements matching deprecated test IDs or classes found in the live DOM are immediately removed via `element.remove()` prior to frame paint.

#### 3. Mobile HTTP Cache Invalidation Protocol
- The application root document (`index.html`) must declare strict anti-caching `<meta>` directives in `<head>`:
  ```html
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  ```
- All local stylesheet and script references must carry synchronized, incremented cache-busting version query parameters (e.g., `?v=2.3.0`).

---

### 15. Perimeter Board Visual Hierarchy & Non-Occlusion Benchmark (PBVHB)

On dense board layouts (such as a 40-tile perimeter square board rendered on mobile screens down to $320\text{px}$ width), multiple layered visual indicators (property color tabs, purchasable price tags, ownership glow rings, mortgage striping, and token avatars) must occupy the same tile container without physical occlusion, text clipping, or visual conflict.

#### 1. Color Bar Dimensional Boundary Invariant
- Property color bands must never consume excessive tile area (e.g., legacy $32\%$ blocks that obliterate central text).
- Color strips must be engineered as crisp, slim accent edge banners:
  $$t_{bar} \le 6\text{px} \quad (\text{or } \le 15\% \text{ of tile dimension})$$
- Orientation rules:
  - Bottom row: `top: 0; left: 0; right: 0; height: 5px;`
  - Top row: `bottom: 0; left: 0; right: 0; height: 5px;`
  - Left column: `top: 0; bottom: 0; right: 0; width: 5px;`
  - Right column: `top: 0; bottom: 0; left: 0; width: 5px;`

#### 2. Directional Margin Clearance & Layered Z-Index
- The central property price badge (`.tile-cost-badge`) must specify:
  1. Explicit `position: relative` with $z\text{-index} \ge 2$.
  2. Non-interactive click-through: `pointer-events: none`.
  3. Directional clearance margin away from the active color strip edge ($m_{clear} \ge 4\text{px}$):
     - `.side-bottom`: `margin-top: 5px; margin-bottom: 0;`
     - `.side-top`: `margin-bottom: 5px; margin-top: 0;`
     - `.side-left`: `margin-right: 5px; margin-left: 0;`
     - `.side-right`: `margin-left: 5px; margin-right: 0;`

#### 3. Bounding-Box Geometric Occlusion Metric
- Across all supported viewport widths ($320\text{px}$ to $1920\text{px}$), the geometric intersection area between the color bar bounding box and the cost badge bounding box must equal zero:
  $$O_{badge} = \frac{\text{Area}(\text{Bar} \cap \text{Badge})}{\text{Area}(\text{Badge})} = 0.00\%$$

---

### 16. Monopoly Economic Tiering & Property Price Variance Benchmark (METPB)

In economic and clinical simulation board games, purchasable assets must exhibit authentic progressive financial tiering corresponding to group order, prestige, and clinical yield. Uniform, flat, or fallback pricing across distinct asset groups severely disrupts player decision-making, strategic pacing, and game balance.

#### 1. Group-Tiered Pricing Law
- Property acquisition costs must scale progressively across color groups:
  - Low tier (e.g. Clinic / Brown): $300\text{ WP}$
  - Mid-low tier (Cardiac Rehab / Light Blue): $350\text{ WP}$
  - Mid tier (Observation / Pink, Short-Stay / Orange, ACS Pipeline / Railroads): $400\text{ WP}$
  - Upper-mid tier (Nuclear Lab / Red): $450\text{ WP}$
  - High tier (Echo Lab / Yellow): $500\text{ WP}$
  - Elite tier (Cath Lab / Green): $550\text{ WP}$
  - Flagship tier (Coronary Care Unit / Dark Blue): $650\text{ WP}$

#### 2. Statistical Variance & Anti-Uniformity Metrics
- Price distribution across all purchasable suites on the perimeter board must meet strict variance thresholds:
  1. **Standard Deviation:** $\sigma_{price} \ge 80\text{ WP}$.
  2. **Range Spread:** $P_{min} \ge 300\text{ WP}$ and $P_{max} \ge 600\text{ WP}$.
  3. **Maximum Frequency Cap:** No single price point may account for more than $50\%$ of purchasable suites:
     $$\max_{p} \left( \frac{N(p)}{N_{total}} \right) \le 0.50$$
     (Guarantees detection of accidental flat-rate fallback bugs, e.g., the "all 300 WP" defect).

#### 3. Model-to-DOM Data-Binding Fidelity
- The runtime board tile construction routine must redundantly and defensively map property pricing attributes (`priceWP`, `price`, `cost`, `basePrice`).
- Perimeter DOM cost badge rendering must bind directly to the canonical model price:
  $$\Delta_{\text{DOM-Model}} = |P_{\text{DOM}} - P_{\text{Model}}| = 0$$
- Any discrepancy between the underlying game engine property model and the rendered perimeter badge constitutes a critical test failure.

## QA Verification Checklist

Before completing any game optimization task, verify all 19 gates:

- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.
- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.
- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\le 16.7\text{ms}$.
- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.
- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.
- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.
- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.
- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 5.5s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.
- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits `tests/exhaustive_playthrough_report.json`.
- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\text{ LUFS}$, UI $-14\text{ LUFS}$, Stingers $-12\text{ LUFS}$, Alarms $-8\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \ge 12\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.
- [ ] **Gate 11 (Cut-In Video Autoplay & Media Resilience Gate - VC-PRB)**: Verifies that all cut-in presets have valid video/poster sources, MP4 faststart headers, mobile playsinline attributes, and zero bare/static placeholders.
- [ ] **Gate 12 (Interaction Flow & State Suspension Gate - IFSRS)**: Verifies that triggering high-severity events halts auction clocks and bot timers without race conditions, and resumes with 100% time integrity.
- [ ] **Gate 13 (Image Integrity & Non-Distortion Gate - IINDB)**: Verifies that all visual media conforms to 16:9 / 1:1 aspect ratio invariants, passes the $D_{tear} < 32$ pixel continuity gradient scan, and enforces CSS absolute geometric pinning (`inset: 0; width: 100%; height: 100%; object-fit: cover; max-height: none;`) so no horizontal tear or split can ever occur.
- [ ] **Gate 14 (Video Performance & Engagement Gate - VPEB)**: Verifies fast-start MP4 header layout (`moov` before `mdat`), mobile autoplay quad-attributes, dual-stream availability (MP4 + WebM), kinematic motion vector density $M_{vec} \ge 0.35$, and video engagement index $E_{vid} \ge 0.75$.
- [ ] **Gate 15 (Data-Binding & Text Interpolation Gate - DTTIB)**: Verifies zero instances of `undefined`, `NaN`, `null%`, or `undefined%` in static source templates and rendered DOM modal components (Defect Rate $\Theta_{defect} = 0.0\%$).
- [ ] **Gate 16 (Competitive Resuscitation & Emergent Challenge Gate - CRECB)**: Verifies that Code Blue operates as an emergent in-game QTE challenge with scaling difficulty, real-time multi-agent AI bot competition, complete state freeze, and elimination of main-menu test buttons.
- [ ] **Gate 17 (Legacy Element & Deprecated Control Purge Gate - LEDAPB)**: Verifies zero deprecated test buttons in static HTML or live DOM ($\Theta_{deprecated} = 0$), presence of runtime defensive DOM purge routine, and active HTTP cache-invalidation meta tags/asset versioning.
- [ ] **Gate 18 (Perimeter Board Visual Hierarchy & Non-Occlusion Gate - PBVHB)**: Verifies color bar thickness $\le 6\text{px}$, price badge $z\text{-index} \ge 2$ with directional margin clearance, and zero geometric occlusion ($O_{badge} = 0.00\%$) between color tabs and cost badges across all viewport widths.
- [ ] **Gate 19 (Monopoly Economic Tiering & Property Price Variance Gate - METPB)**: Verifies progressive price scaling ($\sigma_{price} \ge 80\text{ WP}$, spread $300\text{ WP}$ to $650\text{ WP}$, max single price frequency $\le 50\%$) and 100% model-to-DOM price binding fidelity.
