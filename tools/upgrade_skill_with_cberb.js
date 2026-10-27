const fs = require('fs');
const path = require('path');

const WORKSPACE_SKILL_PATH = path.resolve(__dirname, '../.agents/skills/game-development/SKILL.md');
const GLOBAL_SKILL_PATH = 'C:\\Users\\lauye\\.gemini\\config\\skills\\game-gradient-booster\\SKILL.md';

const newSection19 = `
---

### 19. Code Blue Emergent Reliability & Activation Benchmark (CBERB)

Emergent in-game Quick-Time Events (such as the Code Blue Ventricular Fibrillation resuscitation challenge) must reliably activate, render, and engage human players during live matches, eliminating silent trigger failures, canonical property binding mismatches, and modal display suppression.

#### 1. Canonical State Property Safety Invariant
- Challenge triggers (\`shouldTriggerEmergentChallenge\`) must only evaluate authenticated, canonical engine properties:
  \`\`\`javascript
  const turn = Number(gameState.turnNumber ?? gameState.turnCount ?? gameState.turnCounter ?? 1);
  \`\`\`
- Using unverified or renamed properties (e.g. \`gameState.turnCount\` when the engine tracks \`gameState.turnNumber\`) is strictly prohibited. Automated contract audits must verify non-undefined evaluation across all game turns.

#### 2. Guaranteed Early-Game Induction Metric (100% Session Discovery)
- To guarantee that every player discovers and experiences the competitive resuscitation challenge during their match without waiting dozens of turns, the engine enforces a guaranteed early-game induction threshold:
  $$P(\\text{Code Blue in Turns 2--3}) = 100.0\\%$$
- On Turn 2 or Turn 3 (first match experience), if the challenge has not yet occurred, the engine guarantees an emergent hospital cardiac arrest broadcast.
- Post-induction dynamic emergence continues at a high pacing cadence ($P_{emergent} \\ge 0.20$ per turn cycle, or whenever SBP $\\ge 195\\text{ mmHg}$ / Complications $\ge 1$).

#### 3. Modal Display & DOM Visibility Invariant
- Challenge overlay containers must be visibly instantiated with \`.active\` and explicit flex rendering:
  \`\`\`javascript
  modal.className = 'screen-overlay active';
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.zIndex = '10050';
  \`\`\`
- Overlays must never remain hidden behind \`display: none\` when emergency audio or alarms trigger:
  $$\\text{Visibility Rate } V_{modal} = 100.0\\%$$

#### 4. All-Agent Hospital-Wide Contention Invariant
- Hospital cardiac arrest emergencies are hospital-wide events that summon all available clinicians.
- The interactive QTE resuscitation modal must ALWAYS present to the active human player, regardless of whether the crisis was triggered during a human turn or an AI bot's turn:
  $$C_{human\\_participation} = 100.0\\%$$
- The human player races concurrently against computer bots (Dr. Cath-A-Lot, Inspector Clawback, V.P. Margin) in real-time under the 5-second countdown.
`;

const newGate22 = `
- [ ] **Gate 22 (Code Blue Emergent Reliability & Activation Gate - CBERB)**: Verifies that Code Blue evaluates canonical engine properties (\`gameState.turnNumber\`), guarantees early-game emergence on Turn 2/3 ($P_{early} = 100.0\\%$), enforces DOM modal visibility (\`modal.classList.contains('active')\`, \`display: flex\`), and engages the human player during all hospital emergencies ($C_{human\\_participation} = 100.0\\%$).
`;

function upgradeSkill(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('### 19. Code Blue Emergent Reliability & Activation Benchmark (CBERB)')) {
    console.log('Section 19 already present in ' + filePath);
    return;
  }

  const checklistIdx = content.indexOf('## QA Verification Checklist');
  if (checklistIdx === -1) {
    console.error('Could not find QA Verification Checklist in ' + filePath);
    return;
  }

  const beforeChecklist = content.slice(0, checklistIdx).trim();
  const afterChecklist = content.slice(checklistIdx);

  // Update gates count from 21 to 22
  let updatedChecklist = afterChecklist.replace('verify all 21 gates:', 'verify all 22 gates:');
  updatedChecklist = updatedChecklist.trim() + newGate22;

  const finalContent = beforeChecklist + '\n' + newSection19 + '\n' + updatedChecklist + '\n';
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✓ Successfully upgraded ' + filePath + ' with Section 19 and Gate 22');
}

upgradeSkill(WORKSPACE_SKILL_PATH);
if (fs.existsSync(GLOBAL_SKILL_PATH)) {
  upgradeSkill(GLOBAL_SKILL_PATH);
} else {
  console.log('Global skill path not found: ' + GLOBAL_SKILL_PATH);
}
