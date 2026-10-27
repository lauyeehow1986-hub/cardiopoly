const fs = require('fs');
const path = require('path');

const WORKSPACE_SKILL_PATH = path.resolve(__dirname, '../.agents/skills/game-development/SKILL.md');
const GLOBAL_SKILL_PATH = 'C:\\Users\\lauye\\.gemini\\config\\skills\\game-gradient-booster\\SKILL.md';

const newSectionsAndGates = `
---

### 14. Legacy Element & Deprecated Control Purge Benchmark (LEDAPB)

Development artifacts, temporary test triggers, and deprecated staging buttons (e.g. manual emergency trigger buttons, debug shortcuts) must never leak into production releases or persist in user browsers through aggressive mobile HTTP caching.

#### 1. Zero Deprecated Element Invariant
- Static source files (\`index.html\`, \`script.js\`) must be 100% free of legacy/staging selectors (\`#test-code-blue-btn\`, \`#trigger-code-blue-btn\`, \`#test-resus-btn\`):
  $$\\Theta_{deprecated} = 0$$
- Automated static code scanning must verify zero occurrences of forbidden staging button patterns.

#### 2. Defensive Client-Side DOM Purge Routine
- Because mobile browsers (iOS Safari, Android Chrome) and Progressive Web Apps (PWAs) aggressively cache static HTML shells across application updates, the runtime engine must execute an automated defensive cleanup routine (\`purgeDeprecatedTestElements()\`) during:
  1. Initial \`DOMContentLoaded\` / engine boot.
  2. Setup lobby instantiation (\`initSetupModal()\`).
  3. Modal invocation (\`openSetupModal()\`).
- Any elements matching deprecated test IDs or classes found in the live DOM are immediately removed via \`element.remove()\` prior to frame paint.

#### 3. Mobile HTTP Cache Invalidation Protocol
- The application root document (\`index.html\`) must declare strict anti-caching \`<meta>\` directives in \`<head>\`:
  \`\`\`html
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  \`\`\`
- All local stylesheet and script references must carry synchronized, incremented cache-busting version query parameters (e.g., \`?v=2.3.0\`).

---

### 15. Perimeter Board Visual Hierarchy & Non-Occlusion Benchmark (PBVHB)

On dense board layouts (such as a 40-tile perimeter square board rendered on mobile screens down to $320\\text{px}$ width), multiple layered visual indicators (property color tabs, purchasable price tags, ownership glow rings, mortgage striping, and token avatars) must occupy the same tile container without physical occlusion, text clipping, or visual conflict.

#### 1. Color Bar Dimensional Boundary Invariant
- Property color bands must never consume excessive tile area (e.g., legacy $32\\%$ blocks that obliterate central text).
- Color strips must be engineered as crisp, slim accent edge banners:
  $$t_{bar} \\le 6\\text{px} \\quad (\\text{or } \\le 15\\% \\text{ of tile dimension})$$
- Orientation rules:
  - Bottom row: \`top: 0; left: 0; right: 0; height: 5px;\`
  - Top row: \`bottom: 0; left: 0; right: 0; height: 5px;\`
  - Left column: \`top: 0; bottom: 0; right: 0; width: 5px;\`
  - Right column: \`top: 0; bottom: 0; left: 0; width: 5px;\`

#### 2. Directional Margin Clearance & Layered Z-Index
- The central property price badge (\`.tile-cost-badge\`) must specify:
  1. Explicit \`position: relative\` with $z\\text{-index} \\ge 2$.
  2. Non-interactive click-through: \`pointer-events: none\`.
  3. Directional clearance margin away from the active color strip edge ($m_{clear} \\ge 4\\text{px}$):
     - \`.side-bottom\`: \`margin-top: 5px; margin-bottom: 0;\`
     - \`.side-top\`: \`margin-bottom: 5px; margin-top: 0;\`
     - \`.side-left\`: \`margin-right: 5px; margin-left: 0;\`
     - \`.side-right\`: \`margin-left: 5px; margin-right: 0;\`

#### 3. Bounding-Box Geometric Occlusion Metric
- Across all supported viewport widths ($320\\text{px}$ to $1920\\text{px}$), the geometric intersection area between the color bar bounding box and the cost badge bounding box must equal zero:
  $$O_{badge} = \\frac{\\text{Area}(\\text{Bar} \\cap \\text{Badge})}{\\text{Area}(\\text{Badge})} = 0.00\\%$$

---

### 16. Monopoly Economic Tiering & Property Price Variance Benchmark (METPB)

In economic and clinical simulation board games, purchasable assets must exhibit authentic progressive financial tiering corresponding to group order, prestige, and clinical yield. Uniform, flat, or fallback pricing across distinct asset groups severely disrupts player decision-making, strategic pacing, and game balance.

#### 1. Group-Tiered Pricing Law
- Property acquisition costs must scale progressively across color groups:
  - Low tier (e.g. Clinic / Brown): $300\\text{ WP}$
  - Mid-low tier (Cardiac Rehab / Light Blue): $350\\text{ WP}$
  - Mid tier (Observation / Pink, Short-Stay / Orange, ACS Pipeline / Railroads): $400\\text{ WP}$
  - Upper-mid tier (Nuclear Lab / Red): $450\\text{ WP}$
  - High tier (Echo Lab / Yellow): $500\\text{ WP}$
  - Elite tier (Cath Lab / Green): $550\\text{ WP}$
  - Flagship tier (Coronary Care Unit / Dark Blue): $650\\text{ WP}$

#### 2. Statistical Variance & Anti-Uniformity Metrics
- Price distribution across all purchasable suites on the perimeter board must meet strict variance thresholds:
  1. **Standard Deviation:** $\\sigma_{price} \\ge 80\\text{ WP}$.
  2. **Range Spread:** $P_{min} \\ge 300\\text{ WP}$ and $P_{max} \\ge 600\\text{ WP}$.
  3. **Maximum Frequency Cap:** No single price point may account for more than $50\\%$ of purchasable suites:
     $$\\max_{p} \\left( \\frac{N(p)}{N_{total}} \\right) \\le 0.50$$
     (Guarantees detection of accidental flat-rate fallback bugs, e.g., the "all 300 WP" defect).

#### 3. Model-to-DOM Data-Binding Fidelity
- The runtime board tile construction routine must redundantly and defensively map property pricing attributes (\`priceWP\`, \`price\`, \`cost\`, \`basePrice\`).
- Perimeter DOM cost badge rendering must bind directly to the canonical model price:
  $$\\Delta_{\\text{DOM-Model}} = |P_{\\text{DOM}} - P_{\\text{Model}}| = 0$$
- Any discrepancy between the underlying game engine property model and the rendered perimeter badge constitutes a critical test failure.
`;

const updatedChecklist = `## QA Verification Checklist

Before completing any game optimization task, verify all 19 gates:

- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of \`undefined\`, \`NaN\`, or truncated labels.
- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes \`AudioContext\` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.
- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\\le 16.7\\text{ms}$.
- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within \`88vh\` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.
- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.
- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in \`localStorage\`.
- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.
- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 5.5s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.
- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits \`tests/exhaustive_playthrough_report.json\`.
- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\\text{ LUFS}$, UI $-14\\text{ LUFS}$, Stingers $-12\\text{ LUFS}$, Alarms $-8\\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \\ge 12\\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.
- [ ] **Gate 11 (Cut-In Video Autoplay & Media Resilience Gate - VC-PRB)**: Verifies that all cut-in presets have valid video/poster sources, MP4 faststart headers, mobile playsinline attributes, and zero bare/static placeholders.
- [ ] **Gate 12 (Interaction Flow & State Suspension Gate - IFSRS)**: Verifies that triggering high-severity events halts auction clocks and bot timers without race conditions, and resumes with 100% time integrity.
- [ ] **Gate 13 (Image Integrity & Non-Distortion Gate - IINDB)**: Verifies that all visual media conforms to 16:9 / 1:1 aspect ratio invariants, passes the $D_{tear} < 32$ pixel continuity gradient scan, and enforces CSS absolute geometric pinning (\`inset: 0; width: 100%; height: 100%; object-fit: cover; max-height: none;\`) so no horizontal tear or split can ever occur.
- [ ] **Gate 14 (Video Performance & Engagement Gate - VPEB)**: Verifies fast-start MP4 header layout (\`moov\` before \`mdat\`), mobile autoplay quad-attributes, dual-stream availability (MP4 + WebM), kinematic motion vector density $M_{vec} \\ge 0.35$, and video engagement index $E_{vid} \\ge 0.75$.
- [ ] **Gate 15 (Data-Binding & Text Interpolation Gate - DTTIB)**: Verifies zero instances of \`undefined\`, \`NaN\`, \`null%\`, or \`undefined%\` in static source templates and rendered DOM modal components (Defect Rate $\\Theta_{defect} = 0.0\\%$).
- [ ] **Gate 16 (Competitive Resuscitation & Emergent Challenge Gate - CRECB)**: Verifies that Code Blue operates as an emergent in-game QTE challenge with scaling difficulty, real-time multi-agent AI bot competition, complete state freeze, and elimination of main-menu test buttons.
- [ ] **Gate 17 (Legacy Element & Deprecated Control Purge Gate - LEDAPB)**: Verifies zero deprecated test buttons in static HTML or live DOM ($\\Theta_{deprecated} = 0$), presence of runtime defensive DOM purge routine, and active HTTP cache-invalidation meta tags/asset versioning.
- [ ] **Gate 18 (Perimeter Board Visual Hierarchy & Non-Occlusion Gate - PBVHB)**: Verifies color bar thickness $\\le 6\\text{px}$, price badge $z\\text{-index} \\ge 2$ with directional margin clearance, and zero geometric occlusion ($O_{badge} = 0.00\\%$) between color tabs and cost badges across all viewport widths.
- [ ] **Gate 19 (Monopoly Economic Tiering & Property Price Variance Gate - METPB)**: Verifies progressive price scaling ($\\sigma_{price} \\ge 80\\text{ WP}$, spread $300\\text{ WP}$ to $650\\text{ WP}$, max single price frequency $\\le 50\\%$) and 100% model-to-DOM price binding fidelity.
`;

function updateSkillFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const checklistHeader = '## QA Verification Checklist';
  const checklistIdx = content.indexOf(checklistHeader);
  if (checklistIdx === -1) {
    console.error('Could not find QA Verification Checklist in ' + filePath);
    return;
  }
  
  const beforeChecklist = content.slice(0, checklistIdx).trim();
  
  if (beforeChecklist.includes('### 14. Legacy Element & Deprecated Control Purge Benchmark (LEDAPB)')) {
    console.log('Sections 14-16 already present in ' + filePath);
    return;
  }
  
  const updatedContent = beforeChecklist + '\n' + newSectionsAndGates + '\n' + updatedChecklist;
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('✓ Successfully upgraded ' + filePath + ' with Sections 14-16 and Gates 17-19');
}

updateSkillFile(WORKSPACE_SKILL_PATH);
if (fs.existsSync(GLOBAL_SKILL_PATH)) {
  updateSkillFile(GLOBAL_SKILL_PATH);
} else {
  console.log('Global skill path not found: ' + GLOBAL_SKILL_PATH);
}
