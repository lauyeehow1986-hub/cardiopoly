const fs = require('fs');
const path = require('path');

const workspaceSkill = path.resolve('c:/Users/lauye/Downloads/cardiopoly/.agents/skills/game-development/SKILL.md');
const globalSkill = path.resolve('C:/Users/lauye/.gemini/config/skills/game-gradient-booster/SKILL.md');

const newSections = [
  "",
  "---",
  "",
  "### 12. Data-Binding & Text Interpolation Integrity Benchmark (DTTIB)",
  "",
  "Every user-facing template string, HUD label, modal body, and faction dossier card must be protected against runtime interpolation anomalies (`undefined`, `NaN`, `null%`, `undefined%`, `[object Object]`). The **DTTIB Standard** establishes strict runtime and static invariants for all text rendering pipelines.",
  "",
  "#### 1. Zero-Undefined Invariant ($\\Theta_{defect}$)",
  "- The Data-Binding Defect Rate across all DOM nodes and text nodes must strictly equal zero:",
  "  $$\\Theta_{defect} = \\frac{N_{unbound}}{N_{total\\_fields}} = 0.0\\%$$",
  "- Any occurrence of `undefined%`, `(undefined%)`, or `NaN` in rendered UI cards triggers an immediate test failure.",
  "",
  "#### 2. Defensive Coalescing & Safe Accessor Standard",
  "- When extracting calculated properties from engine calculators, UI renderers must never assume a single hardcoded property name. Renderers must implement fallback coalescing chains:",
  "  ```javascript",
  "  const pct = prog.progressPct ?? prog.percentComplete ?? prog.percent ?? comp.pct ?? 0;",
  "  const label = prog.label || `${pct}% Target Progress`;",
  "  ```",
  "- Engine progress calculators (`getFactionProgress`, `computePlayerFactionProgress`) must guarantee that all numeric progress fields are valid integers ($[0, 100]$) and all descriptive labels are non-empty strings.",
  "",
  "---",
  "",
  "### 13. Competitive Resuscitation & Emergent Challenge Benchmark (CRECB)",
  "",
  "High-severity clinical emergencies (e.g. Code Blue Ventricular Fibrillation) must never exist as artificial main-menu test buttons. Instead, they must operate as **dynamic, emergent in-game Quick-Time Events (QTE)** where all active human and computer physicians compete in real-time under intense pressure.",
  "",
  "#### 1. Dynamic Emergence Law",
  "- Emergencies trigger through authentic clinical risk mechanics:",
  "  1. **Physiological Criticality:** When active player SBP $\\ge 195\\text{ mmHg}$ or clinical complications $\\ge 2$.",
  "  2. **Emergent Hospital Arrest:** After turn 1, a dynamic hospital cardiac arrest event occurs with probability $P_{emergent} \\in [0.08, 0.12]$ per turn cycle.",
  "- **Main-Menu Sanity Invariant:** No test or cheat buttons triggering emergency mechanics may ever reside in production setup or main selection menus.",
  "",
  "#### 2. 5-Second Multi-Phase Rhythm & Compression Protocol",
  "- Players must execute a multi-phase resuscitation sequence within a strict countdown window ($T_{limit} \\in [3.5\\text{s}, 5.0\\text{s}]$):",
  "  - Phase 1: `⚡ CHARGE DEFIBRILLATOR PADDLES`",
  "  - Phase 2: `❤️ CHEST COMPRESSIONS` (Mash button at 100-120 BPM rhythm)",
  "  - Phase 3: `⚡ CLEAR & DELIVER 200J BIPHASIC SHOCK`",
  "- Button mashing triggers visual screen shakes (`.code-blue-screen-shake`), depth feedback, and audio compression thumps.",
  "",
  "#### 3. Real-Time Multi-Agent AI Contention",
  "- The emergency is broadcast simultaneously to all physicians in the match.",
  "- Computer bot physicians simulate authentic clinical response speeds:",
  "  $$t_{Cath-A-Lot} < t_{Clawback} < t_{Margin} < T_{limit}$$",
  "  - *Dr. Cath-A-Lot (Interventionalist):* Fastest mechanical hands (~70-82% of time limit).",
  "  - *Inspector Clawback (Auditor):* Systematic clinical response (~80-88% of time limit).",
  "  - *V.P. Margin (CEO):* Deliberate, risk-hesitant pacing (~88-94% of time limit).",
  "- **Contention Rule:** First clinician (player or bot) to reach 100% resuscitation progress claims the Clinical Bounty.",
  "",
  "#### 4. Scaling Difficulty & High-Stakes Asymmetry",
  "- Difficulty scales with each occurrence ($L = 1, 2, 3, ...$):",
  "  - **Time Window Compression:** $T_{limit}(L) = \\max(3.5, 5.0 - (L - 1) \\cdot 0.4\\text{s})$.",
  "  - **Rhythm Compressions:** $N_{mashes}(L) = 8 + (L - 1) \\cdot 3$.",
  "  - **Clinical Bounty Reward:** $+\\$1,200 + (L - 1) \\cdot 400\\text{ WP}$, $+10\\text{ GDMT}$, $+500\\text{ RVU}$.",
  "  - **Catastrophic Failure Penalty:** If the timer reaches $0.00\\text{s}$ before resuscitation succeeds, the active player suffers an immediate malpractice/CCU charge of $-\\$1,500 + (L - 1) \\cdot 500\\text{ WP}$, $-10\\text{ GDMT}$, and transfer to CCU quarantine lockup.",
  "",
  "#### 5. Interaction State Suspension Invariant",
  "- During the active QTE, `freezeEmergencyState('CODE_BLUE_QTE')` atomically halts all auction clocks and bot turn intervals, restoring exact timestamps upon challenge completion.",
  ""
].join('\n');

const oldChecklist = [
  "## QA Verification Checklist",
  "",
  "Before completing any game optimization task, verify all 14 gates:",
  "",
  "- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.",
  "- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.",
  "- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\\le 16.7\\text{ms}$.",
  "- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.",
  "- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.",
  "- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.",
  "- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.",
  "- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 5.5s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.",
  "- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits `tests/exhaustive_playthrough_report.json`.",
  "- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\\text{ LUFS}$, UI $-14\\text{ LUFS}$, Stingers $-12\\text{ LUFS}$, Alarms $-8\\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \\ge 12\\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.",
  "- [ ] **Gate 11 (Cut-In Video Autoplay & Media Resilience Gate - VC-PRB)**: Verifies that all cut-in presets have valid video/poster sources, MP4 faststart headers, mobile playsinline attributes, and zero bare/static placeholders.",
  "- [ ] **Gate 12 (Interaction Flow & State Suspension Gate - IFSRS)**: Verifies that triggering high-severity events halts auction clocks and bot timers without race conditions, and resumes with 100% time integrity.",
  "- [ ] **Gate 13 (Image Integrity & Non-Distortion Gate - IINDB)**: Verifies that all visual media conforms to 16:9 / 1:1 aspect ratio invariants, passes the $D_{tear} < 32$ pixel continuity gradient scan, and enforces CSS absolute geometric pinning (`inset: 0; width: 100%; height: 100%; object-fit: cover; max-height: none;`) so no horizontal tear or split can ever occur.",
  "- [ ] **Gate 14 (Video Performance & Engagement Gate - VPEB)**: Verifies fast-start MP4 header layout (`moov` before `mdat`), mobile autoplay quad-attributes, dual-stream availability (MP4 + WebM), kinematic motion vector density $M_{vec} \\ge 0.35$, and video engagement index $E_{vid} \\ge 0.75$."
].join('\n');

const newChecklist = [
  "## QA Verification Checklist",
  "",
  "Before completing any game optimization task, verify all 16 gates:",
  "",
  "- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.",
  "- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.",
  "- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\\le 16.7\\text{ms}$.",
  "- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.",
  "- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.",
  "- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.",
  "- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.",
  "- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 5.5s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.",
  "- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits `tests/exhaustive_playthrough_report.json`.",
  "- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\\text{ LUFS}$, UI $-14\\text{ LUFS}$, Stingers $-12\\text{ LUFS}$, Alarms $-8\\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \\ge 12\\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.",
  "- [ ] **Gate 11 (Cut-In Video Autoplay & Media Resilience Gate - VC-PRB)**: Verifies that all cut-in presets have valid video/poster sources, MP4 faststart headers, mobile playsinline attributes, and zero bare/static placeholders.",
  "- [ ] **Gate 12 (Interaction Flow & State Suspension Gate - IFSRS)**: Verifies that triggering high-severity events halts auction clocks and bot timers without race conditions, and resumes with 100% time integrity.",
  "- [ ] **Gate 13 (Image Integrity & Non-Distortion Gate - IINDB)**: Verifies that all visual media conforms to 16:9 / 1:1 aspect ratio invariants, passes the $D_{tear} < 32$ pixel continuity gradient scan, and enforces CSS absolute geometric pinning (`inset: 0; width: 100%; height: 100%; object-fit: cover; max-height: none;`) so no horizontal tear or split can ever occur.",
  "- [ ] **Gate 14 (Video Performance & Engagement Gate - VPEB)**: Verifies fast-start MP4 header layout (`moov` before `mdat`), mobile autoplay quad-attributes, dual-stream availability (MP4 + WebM), kinematic motion vector density $M_{vec} \\ge 0.35$, and video engagement index $E_{vid} \\ge 0.75$.",
  "- [ ] **Gate 15 (Data-Binding & Text Interpolation Gate - DTTIB)**: Verifies zero instances of `undefined`, `NaN`, `null%`, or `undefined%` in static source templates and rendered DOM modal components (Defect Rate $\\Theta_{defect} = 0.0\\%$).",
  "- [ ] **Gate 16 (Competitive Resuscitation & Emergent Challenge Gate - CRECB)**: Verifies that Code Blue operates as an emergent in-game QTE challenge with scaling difficulty, real-time multi-agent AI bot competition, complete state freeze, and elimination of main-menu test buttons."
].join('\n');

function updateSkillFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  if (content.includes('Data-Binding & Text Interpolation Integrity Benchmark (DTTIB)')) {
    console.log('Skill already updated: ' + filePath);
    return;
  }

  const checklistIndex = content.indexOf('## QA Verification Checklist');
  if (checklistIndex === -1) {
    console.error('Checklist not found in: ' + filePath);
    return;
  }

  const beforeChecklist = content.slice(0, checklistIndex);
  const updatedContent = beforeChecklist + newSections + '\n' + newChecklist + '\n';
  fs.writeFileSync(filePath, updatedContent.replace(/\n/g, '\r\n'), 'utf8');
  console.log('✓ Successfully upgraded ' + filePath);
}

updateSkillFile(workspaceSkill);
try {
  updateSkillFile(globalSkill);
} catch (e) {
  console.log('Global skill update note: ' + e.message);
}
