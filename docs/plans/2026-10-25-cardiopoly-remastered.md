# Cardiopoly Remastered Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Cardiopoly into a modern, multi-stakeholder clinical strategy game featuring 4 asymmetric factions, a 9-nation healthcare policy engine (including Singapore's 3M/Healthier SG regime), clinical vignette decision encounters scored against guidelines via MCP, glassmorphic ECG telemetry UI, and P2P WebRTC multiplayer.

**Architecture:** A modular client-side engine with separated concerns: core board/token loop, asymmetric faction victory evaluator, 9-nation economic policy modifiers, clinical case vignette engine, and an MCP guideline evaluation bridge. Networking uses PeerJS for direct WebRTC peer-to-peer room state synchronization, backed by Supabase for high-score leaderboards and clinical case analytics.

**Tech Stack:** Vanilla JavaScript (ES6+), Modern CSS3 (Glassmorphism, CSS Grid/Flexbox), HTML5 Canvas/SVG (Live ECG Telemetry), PeerJS (WebRTC P2P DataChannels), Supabase Client (PostgreSQL / Realtime), Node.js (Test harness & MCP Guideline Server SDK).

---

## Task Breakdown

### Task 1: Live Physiological Telemetry Component (ECG & ABP Waveforms)

**Files:**
- Create: `src/components/telemetry.js`
- Test: `tests/telemetry.test.js`
- Modify: `index.html:120-146`, `styles.css`

**Step 1: Write the failing unit test for telemetry calculation**
```javascript
// tests/telemetry.test.js
const assert = require('assert');
const { computePulseRate, generateEcgSample } = require('../src/components/telemetry.js');

// Verifies pulse rate scales appropriately with SBP and stress
assert.strictEqual(computePulseRate(120), 72);
assert.strictEqual(computePulseRate(180), 108);

// Verifies ECG sample generation returns valid Y coordinate points
const sample = generateEcgSample(0.2); // QRS peak phase
assert(typeof sample === 'number' && !isNaN(sample));
console.log('telemetry.test.js passed');
```

**Step 2: Run test to verify it fails**
Run: `node tests/telemetry.test.js`
Expected: FAIL with `Cannot find module '../src/components/telemetry.js'`

**Step 3: Implement minimal code for telemetry component**
Create `src/components/telemetry.js` with functions `computePulseRate(sbp)` and `generateEcgSample(phase)` plus canvas rendering loop.

**Step 4: Run test to verify it passes**
Run: `node tests/telemetry.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/telemetry.js tests/telemetry.test.js
git commit -m "feat(telemetry): add physiological ECG and pulse rate calculator"
```

---

### Task 2: Modern Command Center UI & Glassmorphism Overhaul

**Files:**
- Modify: `styles.css:1-150`
- Modify: `index.html:115-235`

**Step 1: Define CSS custom properties for Command Center theme**
Add slate/navy palette (`--bg-command-center: #0b1120`), frosted glass panels (`--glass-bg: rgba(15, 23, 42, 0.75)`), neon telemetry cyan (`#06b6d4`), and emerald accents.

**Step 2: Add top telemetry bar and responsive layout grid**
Embed `<canvas id="ecg-canvas">` inside the top telemetry bar in `index.html` alongside real-time SBP, Heart Rate, and Faction badges.

**Step 3: Verify visual rendering**
Launch local preview or run automated layout check.

**Step 4: Commit**
```bash
git add styles.css index.html
git commit -m "feat(ui): implement glassmorphic medical command center and telemetry canvas"
```

---

### Task 3: Asymmetric Faction Engine & Win Condition Evaluator

**Files:**
- Create: `src/engine/factions.js`
- Test: `tests/factions.test.js`
- Modify: `script.js`

**Step 1: Write the failing unit test for faction scoring and win criteria**
```javascript
// tests/factions.test.js
const assert = require('assert');
const { FACTIONS, evaluateFactionWin, recordFactionAction } = require('../src/engine/factions.js');

const clinician = { factionId: 'ACADEMIC_CLINICIAN', gdmtScore: 88, encounters: 16, complications: 0 };
assert.strictEqual(evaluateFactionWin(clinician), true);

const interventionalist = { factionId: 'INTERVENTIONALIST', rvuPoints: 12500, sanctions: 0 };
assert.strictEqual(evaluateFactionWin(interventionalist), true);

const auditor = { factionId: 'REGULATORY_AUDITOR', clawbackWP: 16000 };
assert.strictEqual(evaluateFactionWin(auditor), true);

console.log('factions.test.js passed');
```

**Step 2: Run test to verify it fails**
Run: `node tests/factions.test.js`
Expected: FAIL with `Cannot find module '../src/engine/factions.js'`

**Step 3: Implement minimal code for factions engine**
Define `FACTIONS` configuration object:
- `ACADEMIC_CLINICIAN`: GDMT Target $\ge 85\%$, Complications $< 2$.
- `INTERVENTIONALIST`: RVU Target $\ge 12,000$.
- `HOSPITAL_CEO`: 4 Department Groups + Solvency $\ge \$10\text{M}$.
- `REGULATORY_AUDITOR`: Clawback Target $\ge 15,000\text{ WP}$.

**Step 4: Run test to verify it passes**
Run: `node tests/factions.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/engine/factions.js tests/factions.test.js
git commit -m "feat(factions): implement asymmetric faction roles and win condition engine"
```

---

### Task 4: Pacing Refactor & Non-Blocking Toast Notification System

**Files:**
- Create: `src/components/toasts.js`
- Modify: `script.js:16-24, 1130-1165, 1536-1576`
- Modify: `styles.css`

**Step 1: Write unit test for toast queue manager**
```javascript
// tests/toasts.test.js
const assert = require('assert');
const { ToastQueue } = require('../src/components/toasts.js');

const queue = new ToastQueue();
queue.push({ title: 'Bot Purchase', text: 'Fat Slob bought ECG room', durationMs: 1500 });
assert.strictEqual(queue.items.length, 1);
assert.strictEqual(queue.pop().title, 'Bot Purchase');
console.log('toasts.test.js passed');
```

**Step 2: Run test to verify failure**
Run: `node tests/toasts.test.js`
Expected: FAIL

**Step 3: Implement ToastQueue and DOM Toast Container**
- Replace blocking modal popups on bot turns with animated floating toast notifications.
- Speed up `USER_TOKEN_STEP_MS` from 1400ms to 320ms for smooth, responsive movement.
- Shorten initial splash screen delay from 4200ms to 1200ms with instant skip on click.

**Step 4: Run test and verify pass**
Run: `node tests/toasts.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/toasts.js tests/toasts.test.js script.js
git commit -m "feat(pacing): speed up token hops and add non-blocking toast notifications"
```

---

### Task 5: 9-Nation Healthcare Policy Engine (Including Singapore 3M)

**Files:**
- Create: `src/engine/policies.js`
- Test: `tests/policies.test.js`
- Create: `data/regimes.json`

**Step 1: Write the failing unit test for 9-nation policy tariffs and audit rules**
```javascript
// tests/policies.test.js
const assert = require('assert');
const { REGIMES, computeProcedureTariff, evaluateAuditScrutiny } = require('../src/engine/policies.js');

// Singapore: IP Rider allows high-tech billing, but unindicated FFR triggers MOH Fee Benchmark audit
const sgCath = computeProcedureTariff('PCI_3_STENT', 'SINGAPORE', { ward: 'CLASS_A', ipRider: true });
assert.strictEqual(sgCath.reimbursedWP > 1000, true);
assert.strictEqual(sgCath.coPayPercent, 0.05);

const sgAudit = evaluateAuditScrutiny('PCI_3_STENT', 'SINGAPORE', { ffr: 0.86 });
assert.strictEqual(sgAudit.flagged, true);
assert.strictEqual(sgAudit.reason.includes('MOH Fee Benchmark'), true);

// UK (NHS): Low tariff, strict QALY gate
const ukCath = computeProcedureTariff('ELECTIVE_STENT', 'UK', { qalyGain: 0.02 });
assert.strictEqual(ukCath.approved, false); // Fails NICE QALY threshold

console.log('policies.test.js passed');
```

**Step 2: Run test to verify failure**
Run: `node tests/policies.test.js`
Expected: FAIL

**Step 3: Implement 9-nation policy matrix**
Implement data rules for Singapore, US, UK, Sweden, Japan, South Korea, Taiwan, Malaysia, and Indonesia covering:
- Procedural reimbursement tariffs
- Patient co-pay percentages
- Audit scrutiny criteria (MOH benchmarks, NICE QALYs, HIRA clawbacks, Global budget floating points)
- Prevention / capitation bonuses (Healthier SG)

**Step 4: Run test and verify pass**
Run: `node tests/policies.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/engine/policies.js tests/policies.test.js data/regimes.json
git commit -m "feat(policies): implement 9-nation healthcare policy engine and Singapore 3M rules"
```

---

### Task 6: Clinical Case Vignette Decision Encounter Engine

**Files:**
- Create: `src/components/vignetteModal.js`
- Create: `data/vignettes.json`
- Test: `tests/vignettes.test.js`

**Step 1: Write test for vignette resolution**
```javascript
// tests/vignettes.test.js
const assert = require('assert');
const { resolveVignetteDecision } = require('../src/components/vignetteModal.js');

const scenario = {
  id: 'CASE_CCS2_LAD',
  department: 'Oculostenotic space',
  patient: { age: 62, sbp: 146, egfr: 42, symptoms: 'Class II Angina', ischemia: 'Mild' }
};

const gdmtResult = resolveVignetteDecision(scenario, 'CHOICE_GDMT', 'ACADEMIC_CLINICIAN');
assert.strictEqual(gdmtResult.gdmtPoints > 0, true);
assert.strictEqual(gdmtResult.complicationRisk, 'Low');

const stentResult = resolveVignetteDecision(scenario, 'CHOICE_STENT', 'INTERVENTIONALIST');
assert.strictEqual(stentResult.rvuPoints > 0, true);
assert.strictEqual(stentResult.nephroContrastAlert, true); // Triggered by eGFR 42!

console.log('vignettes.test.js passed');
```

**Step 2: Run test to verify failure**
Run: `node tests/vignettes.test.js`
Expected: FAIL

**Step 3: Implement vignette modal and scenario library**
- 30+ authentic clinical case scenarios mapped to board departments.
- Tri-choice encounter interface: GDMT vs. High-Margin Intervention vs. Cost-Containment.
- Cross-specialty flags (Nephrology contrast check, Endo SGLT2i/GLP-1 metabolic control, Heart Team CABG vs. PCI).

**Step 4: Run test and verify pass**
Run: `node tests/vignettes.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/vignetteModal.js data/vignettes.json tests/vignettes.test.js
git commit -m "feat(vignettes): add clinical case vignette engine with cross-discipline trade-offs"
```

---

### Task 7: MCP Medical Guideline Bridge Server

**Files:**
- Create: `tools/mcp-guideline-server.js`
- Create: `package.json`
- Test: `tests/mcp-server.test.js`

**Step 1: Write integration test for MCP guideline evaluation**
```javascript
// tests/mcp-server.test.js
const assert = require('assert');
const { evaluateGuideline } = require('../tools/mcp-guideline-server.js');

const res = evaluateGuideline({
  condition: 'Stable Chronic Coronary Disease',
  anatomy: 'Single vessel proximal LAD 75%',
  ischemiaSeverity: 'Moderate',
  treatment: 'Routine Immediate Stenting without trial of GDMT'
});

assert.strictEqual(res.recommendationClass, 'Class III: No Benefit / Harm');
assert(res.citations.some(c => c.includes('ISCHEMIA') || c.includes('ORBITA')));
console.log('mcp-server.test.js passed');
```

**Step 2: Run test to verify failure**
Run: `node tests/mcp-server.test.js`
Expected: FAIL

**Step 3: Implement Model Context Protocol (MCP) Server**
Expose tools via `@modelcontextprotocol/sdk`:
- `evaluate_guideline_indication`
- `generate_clinical_vignette`
- `benchmark_international_tariff`

**Step 4: Run test and verify pass**
Run: `node tests/mcp-server.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add tools/mcp-guideline-server.js package.json tests/mcp-server.test.js
git commit -m "feat(mcp): implement MCP medical guideline evaluation server"
```

---

### Task 8: P2P Multiplayer (PeerJS WebRTC) & Supabase Persistence

**Files:**
- Create: `src/network/p2pSync.js`
- Create: `src/network/supabaseClient.js`
- Modify: `index.html`, `script.js`
- Test: `tests/network.test.js`

**Step 1: Write mock synchronization test**
```javascript
// tests/network.test.js
const assert = require('assert');
const { createGameRoomPayload, syncActionToPeers } = require('../src/network/p2pSync.js');

const action = { type: 'ROLL_DICE', playerIndex: 1, dice: [4, 5] };
const payload = createGameRoomPayload('ROOM-402', action);
assert.strictEqual(payload.roomId, 'ROOM-402');
assert.strictEqual(payload.action.type, 'ROLL_DICE');
console.log('network.test.js passed');
```

**Step 2: Run test to verify failure**
Run: `node tests/network.test.js`
Expected: FAIL

**Step 3: Implement WebRTC Mesh & Supabase Leaderboard**
- Add PeerJS room creation and direct data connection mesh for 2–4 players.
- Connect Supabase client for storing global leaderboard high scores and completed clinical case decisions.

**Step 4: Run test and verify pass**
Run: `node tests/network.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add src/network/p2pSync.js src/network/supabaseClient.js tests/network.test.js
git commit -m "feat(network): implement PeerJS WebRTC multiplayer and Supabase leaderboards"
```

---

### Task 9: Comprehensive End-to-End Integration & Screenshot Verification

**Files:**
- Create: `tests/e2e-simulation.js`
- Run: Complete automated 4-player game simulation under Singapore and US regimes.
- Verify: Full visual screenshot capture of the remastered interface.

**Step 1: Run end-to-end simulation test**
Run: `node tests/e2e-simulation.js`
Expected: Successful game completion across all 4 factions with valid victory declaration.

**Step 2: Commit final integrated system**
```bash
git add .
git commit -m "feat(release): Cardiopoly Remastered complete integration"
```
