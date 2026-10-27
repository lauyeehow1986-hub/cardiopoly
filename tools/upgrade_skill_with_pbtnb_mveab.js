const fs = require('fs');
const path = require('path');

const WORKSPACE_SKILL_PATH = path.resolve(__dirname, '../.agents/skills/game-development/SKILL.md');
const GLOBAL_SKILL_PATH = 'C:\\Users\\lauye\\.gemini\\config\\skills\\game-gradient-booster\\SKILL.md';

const newSections = `
---

### 17. Perimeter Board Text Non-Truncation Benchmark (PBTNB)

On dense 11x11 perimeter board layouts rendered on compact mobile displays (viewports down to $320\\text{px}$ width), numeric badges (e.g., \`400WP\`, \`650WP\`) and category markers must never suffer horizontal truncation, letter clipping, or ellipsis truncation caused by rigid monospace fonts or aggressive lateral margin shifts.

#### 1. Text-to-Tile Geometric Ratio Invariant
- The total rendered text bounding box width must never exceed $82\\%$ of the inner usable tile width:
  $$W_{text} \\le 0.82 \\cdot W_{tile}$$
- Minimum edge boundary clearance:
  $$m_{edge} = \\min(\\text{left\\_clearance}, \\text{right\\_clearance}) \\ge 2.5\\text{px}$$
- Across all tiles on the perimeter board, the truncation defect rate must equal zero:
  $$T_{defect} = \\frac{N_{truncated}}{N_{tiles}} = 0.00\\%$$

#### 2. Structured Micro-Unit Typography & Condensed Fonts
- Rigid monospace fonts (\`ui-monospace\`, \`Courier\`) are strictly forbidden on perimeter mini-tiles because their fixed $60\\%$ width-to-height character ratios trigger boundary overflow in tiles $\\le 32\\text{px}$ wide.
- Tile badges must use high-density proportional sans-serif system typography (\`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto\`) with structured value and micro-unit separation:
  \`\`\`html
  <span class="tile-cost-badge">
    <span class="tile-cost-val">400</span>
    <span class="tile-cost-unit">WP</span>
  </span>
  \`\`\`
- Fluid responsive typography: \`font-size: clamp(0.44rem, 1.6vw, 0.54rem); letter-spacing: -0.02em; font-weight: 800;\`.

#### 3. Symmetric Lateral Alignment for Column Tiles
- For left and right column perimeter tiles (\`.side-left\`, \`.side-right\`), lateral margin offsets (e.g., \`margin-right: 5px\`, \`margin-left: 5px\`) are strictly prohibited because they push the badge into the outer tile border.
- Badges must maintain symmetric centered alignment (\`margin: 0\`), relying on slim inner accent color strips ($t_{bar} \\le 3.5\\text{px}$) to preserve $100\\%$ character legibility.

---

### 18. Modal Viewport Ergonomics & Entry Accessibility Benchmark (MVEAB)

Full-screen overlay dialogs and pre-game setup lobbies must provide flawless, immediate access to initial option groups (e.g. "1. Victory Framework & Game Mode") upon modal entry, eliminating flexbox negative coordinate clipping and nested touch-scroll traps.

#### 1. Anti-Flexbox Top-Clipping Invariant
- Flexbox overlays (\`.screen-overlay\`) must never pair \`align-items: center\` with \`overflow-y: auto\` on tall content. In mobile browsers where content height exceeds screen height, vertical centering pushes the top half of the modal into negative coordinate space ($y < 0$), permanently obscuring the header and Option 1 because browser scrollbars only scroll positive coordinates.
- Overlays must declare top-anchored alignment:
  \`\`\`css
  .screen-overlay.active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
  \`\`\`

#### 2. Single Unified Touch-Scroll Architecture
- Nested scroll containers (a scrollable \`.screen-overlay\` wrapping a scrollable \`.setup-modal\` with \`max-height: 90vh\`) are strictly prohibited. Nested scroll traps cause erratic scroll jumps and prevent reaching top-level controls on mobile touchscreens.
- The inner modal container must set \`max-height: none; overflow: visible;\`, delegating smooth, momentum-based scrolling directly to the outer viewport overlay (\`-webkit-overflow-scrolling: touch;\`).

#### 3. Programmatic Entry Scroll Reset Protocol
- Upon opening any multi-section modal dialog (\`openSetupModal()\`), the runtime engine must atomically reset the scroll state to zero and anchor the initial option section:
  \`\`\`javascript
  overlay.scrollTop = 0;
  if (innerModal) innerModal.scrollTop = 0;
  const section1 = overlay.querySelector(".setup-section");
  if (section1) section1.scrollIntoView({ block: "start", inline: "nearest" });
  \`\`\`
- Visual Entry Completeness: The header and Section 1 must exhibit $100\\%$ viewport presence upon modal activation ($V_{entry} = 100.0\\%$, $y_{top} \\ge 0$).
`;

const newGates = `
- [ ] **Gate 20 (Perimeter Board Text Non-Truncation Gate - PBTNB)**: Verifies that all board tile cost badges and labels fit within tile inner boundaries ($W_{text} \\le 0.82 \\cdot W_{tile}$, $m_{edge} \\ge 2.5\\text{px}$) with proportional condensed typography, zero lateral border clipping, and $T_{defect} = 0.00\\%$ across $320\\text{px}$ to $1920\\text{px}$ viewports.
- [ ] **Gate 21 (Modal Viewport Ergonomics & Entry Accessibility Gate - MVEAB)**: Verifies that all modal overlays use top-anchored alignment (\`justify-content: flex-start\`), single-scroll architecture without nested traps, and atomic \`scrollTop = 0\` reset on entry ($V_{entry} = 100.0\\%$, $y_{top} \\ge 0$).
`;

function upgradeSkill(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if Section 17 is already present
  if (content.includes('### 17. Perimeter Board Text Non-Truncation Benchmark (PBTNB)')) {
    console.log('Sections 17 & 18 already present in ' + filePath);
    return;
  }

  // Insert sections right before "## QA Verification Checklist"
  const checklistIdx = content.indexOf('## QA Verification Checklist');
  if (checklistIdx === -1) {
    console.error('Could not find QA Verification Checklist in ' + filePath);
    return;
  }

  const beforeChecklist = content.slice(0, checklistIdx).trim();
  const afterChecklist = content.slice(checklistIdx);

  // Update gates count from 19 to 21
  let updatedChecklist = afterChecklist.replace('verify all 19 gates:', 'verify all 21 gates:');
  updatedChecklist = updatedChecklist.trim() + newGates;

  const finalContent = beforeChecklist + '\n' + newSections + '\n' + updatedChecklist + '\n';
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✓ Successfully upgraded ' + filePath + ' with Sections 17-18 and Gates 20-21');
}

upgradeSkill(WORKSPACE_SKILL_PATH);
if (fs.existsSync(GLOBAL_SKILL_PATH)) {
  upgradeSkill(GLOBAL_SKILL_PATH);
} else {
  console.log('Global skill path not found: ' + GLOBAL_SKILL_PATH);
}
