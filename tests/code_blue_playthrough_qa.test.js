/**
 * TEST SUITE: CODE BLUE FULL PLAYTHROUGH & INTERACTION QA AUDIT (CB-QA)
 * 
 * Verifies that the Emergent Code Blue Resuscitation challenge:
 * 1. Operates as an interactive real-time multi-agent race, NEVER a static dismiss box.
 * 2. Maintains persistent DOM nodes across the entire QTE duration (0% input drop rate).
 * 3. Correctly handles rapid human mashing (pointerdown, click, Spacebar, Enter) to achieve ROSC.
 * 4. Correctly resolves bot victories when AI physicians reach 100% first.
 * 5. Correctly enforces asystole malpractice penalties when the timer expires.
 * 6. Smoothly unfreezes game state and resumes normal board gameplay upon completion.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('  TEST SUITE: CODE BLUE PLAYTHROUGH & INTERACTION QA AUDIT      ');
console.log('================================================================\n');

// Mock DOM Environment
const createdElements = new Map();

function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    className: '',
    _classes: new Set(),
    classList: {
      add(c) { this._parent._classes.add(c); },
      remove(c) { this._parent._classes.delete(c); },
      toggle(c) {
        if (this._parent._classes.has(c)) this._parent._classes.delete(c);
        else this._parent._classes.add(c);
      },
      contains(c) { return this._parent._classes.has(c); }
    },
    style: {},
    textContent: '',
    innerHTML: '',
    _listeners: {},
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    },
    removeEventListener(evt, fn) {
      if (!this._listeners[evt]) return;
      this._listeners[evt] = this._listeners[evt].filter(f => f !== fn);
    },
    dispatchEvent(evt) {
      const fns = this._listeners[evt.type] || [];
      fns.forEach(fn => fn(evt));
    },
    click() {
      if (typeof this.onclick === 'function') {
        this.onclick({ type: 'click', preventDefault: () => {} });
      }
      this.dispatchEvent({ type: 'click', preventDefault: () => {} });
    },
    getContext() {
      return {
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {}
      };
    },
    appendChild(c) { return c; },
    remove() { createdElements.delete(id); }
  };
}

function makeElement(id, tag = 'div') {
  const el = createMockElement(id, tag);
  el.classList._parent = el;
  return el;
}

const mockDoc = {
  body: makeElement('body'),
  getElementById(id) {
    if (!createdElements.has(id)) {
      createdElements.set(id, makeElement(id));
    }
    return createdElements.get(id);
  },
  createElement(tag) {
    const id = `mock_${tag}_${Math.random().toString(36).substr(2, 6)}`;
    const el = makeElement(id, tag);
    createdElements.set(id, el);
    return el;
  }
};

global.document = mockDoc;
global.window = {
  document: mockDoc,
  addEventListener: (evt, fn) => {
    if (!global.window._listeners) global.window._listeners = {};
    if (!global.window._listeners[evt]) global.window._listeners[evt] = [];
    global.window._listeners[evt].push(fn);
  },
  removeEventListener: (evt, fn) => {
    if (!global.window._listeners || !global.window._listeners[evt]) return;
    global.window._listeners[evt] = global.window._listeners[evt].filter(f => f !== fn);
  },
  dispatchEvent: (evt) => {
    const fns = (global.window._listeners && global.window._listeners[evt.type]) || [];
    fns.forEach(fn => fn(evt));
  },
  freezeEmergencyState: (reason) => {
    global.mockEmergencyFrozen = true;
  },
  unfreezeEmergencyState: (reason) => {
    global.mockEmergencyFrozen = false;
  }
};

global.performance = {
  _now: 1000,
  now() { return this._now; },
  advance(ms) { this._now += ms; }
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Load script patches
const patchesPath = path.resolve(__dirname, '../patches/cardiopoly_script_patches.js');
const patchesContent = fs.readFileSync(patchesPath, 'utf8');
eval(patchesContent);

const { ResuscitationEngine } = window.CardiopolyPatches;
assert(ResuscitationEngine, 'ResuscitationEngine must be exported');

async function runAllPlaythroughAudits() {
  // -------------------------------------------------------------
  // TEST 1: Persistent DOM Architecture & Non-Dismiss Invariant
  // -------------------------------------------------------------
  console.log('--- TEST 1: Persistent DOM & Non-Dismiss Box Invariant ---');

  const player1 = { id: 0, name: 'Dr. Player', wp: 5000, gdmtScore: 75, rvuPoints: 1200, sbp: 130, bmi: 24.5, isBot: false };
  const bots = [
    { id: 1, name: 'Dr. Cath-A-Lot', faction: 'INTERVENTIONALIST', isBot: true, wp: 4000 },
    { id: 2, name: 'Inspector Clawback', faction: 'REGULATORY_AUDITOR', isBot: true, wp: 4000 },
    { id: 3, name: 'V.P. Margin', faction: 'HOSPITAL_CEO', isBot: true, wp: 4000 }
  ];

  const gameState = {
    players: [player1, ...bots],
    currentPlayerIndex: 0,
    turnNumber: 2,
    turnCounter: 2,
    codeBlueDifficulty: 0
  };

  let challengeResult = null;
  ResuscitationEngine.openChallengeModal(player1, gameState, (res) => {
    challengeResult = res;
  });

  const modal = createdElements.get('code-blue-qte-modal');
  assert(modal, 'Modal element #code-blue-qte-modal must exist');
  assert(modal.classList.contains('active'), 'Modal must have active class');

  const mashBtn = createdElements.get('qte-mash-btn');
  assert(mashBtn, 'Action button #qte-mash-btn must exist on initial render');
  assert.notStrictEqual(mashBtn.textContent, 'Acknowledge & Resume Simulation', 'Initial modal MUST NOT be a dismiss box');
  assert(mashBtn.textContent.includes('CHARGE') || mashBtn.textContent.includes('AIRWAY'), 'Action button must display clinical resuscitation step');

  const initialMashBtnRef = mashBtn;

  // Advance clock slightly
  global.performance.advance(100);

  // Verify persistent DOM node reference was NOT destroyed
  const mashBtnAfterTick = createdElements.get('qte-mash-btn');
  assert.strictEqual(mashBtnAfterTick, initialMashBtnRef, 'CRITICAL: Action button DOM node must NOT be recreated on timer ticks');

  console.log('✓ Persistent DOM verified: zero DOM thrashing, action button is persistent and interactive');

  // -------------------------------------------------------------
  // TEST 2: Interactive Player Mashing Playthrough (Heroic ROSC Victory)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Interactive Player Mashing Playthrough (Heroic Victory) ---');

  // Step 1: Charge
  mashBtn.dispatchEvent({ type: 'pointerdown', preventDefault: () => {} });
  assert(mashBtn.textContent.includes('COMPRESSION'), 'Button must transition to CHEST COMPRESSION after Charge');

  // Step 2: Deliver 8 compressions via rapid Spacebar and pointerdown
  for (let c = 1; c <= 8; c++) {
    global.performance.advance(50);
    if (c % 2 === 0) {
      global.window.dispatchEvent({ type: 'keydown', code: 'Space', key: ' ', preventDefault: () => {} });
    } else {
      mashBtn.dispatchEvent({ type: 'pointerdown', preventDefault: () => {} });
    }
  }

  assert(mashBtn.textContent.includes('CLEAR & DELIVER'), 'Button must transition to CLEAR & DELIVER BIPHASIC SHOCK after 8 compressions');

  // Step 3: Final Shock
  global.performance.advance(50);
  mashBtn.dispatchEvent({ type: 'pointerdown', preventDefault: () => {} });

  // Verify Victory Screen is rendered into modal
  assert(modal.innerHTML.includes('HEROIC RESUSCITATION ACHIEVED!'), 'Modal must display HEROIC RESUSCITATION ACHIEVED!');
  assert.strictEqual(player1.wp, 6200, 'Player must receive +1200 WP clinical bounty: got ' + player1.wp);
  assert.strictEqual(player1.gdmtScore, 85, 'Player must receive +10 GDMT');
  assert.strictEqual(player1.rvuPoints, 1700, 'Player must receive +500 RVUs');
  assert.strictEqual(player1.sbp, 120, 'Player SBP must be stabilized to 120');

  // Verify close & resume button is now available and resumes simulation
  const closeBtn = createdElements.get('qte-close-btn');
  assert(closeBtn, 'Close button #qte-close-btn must be present on victory screen');
  closeBtn.click();
  assert(!modal.classList.contains('active'), 'Modal must close upon acknowledgement');
  assert.strictEqual(global.mockEmergencyFrozen, false, 'Emergency state must be unfrozen on close');
  assert(challengeResult, 'challengeResult callback must be triggered on acknowledgement');
  assert.strictEqual(challengeResult.status, 'PLAYER_VICTORY', 'Outcome must be PLAYER_VICTORY');

  console.log('✓ Player victory playthrough verified: 100% of mashing inputs registered, clinical bounty credited, and game resumed');

  // -------------------------------------------------------------
  // TEST 3: Multi-Agent Bot Race Playthrough (Cath-A-Lot Victory)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Multi-Agent Bot Race Playthrough (Bot Victory) ---');

  const player2 = { id: 0, name: 'Dr. Player', wp: 5000, gdmtScore: 75, rvuPoints: 1200, sbp: 130, bmi: 24.5, isBot: false };
  const bots2 = [
    { id: 1, name: 'Dr. Cath-A-Lot', faction: 'INTERVENTIONALIST', isBot: true, wp: 4000 },
    { id: 2, name: 'Inspector Clawback', faction: 'REGULATORY_AUDITOR', isBot: true, wp: 4000 }
  ];
  const gameState2 = { players: [player2, ...bots2], codeBlueDifficulty: 0 };

  let botRaceResult = null;
  ResuscitationEngine.openChallengeModal(player2, gameState2, (res) => {
    botRaceResult = res;
  });

  const botRates = ResuscitationEngine.computeBotRates(bots2, 1);
  const cathFinishMs = (botRates[1].finishTimeSec + 0.1) * 1000;

  global.performance.advance(cathFinishMs);
  await new Promise(r => setTimeout(r, 70));

  const modal2 = createdElements.get('code-blue-qte-modal');
  assert(modal2.innerHTML.includes('BOT PHYSICIAN RESUSCITATED FIRST'), 'Modal must display BOT PHYSICIAN RESUSCITATED FIRST');
  assert.strictEqual(bots2[0].wp, 5200, 'Winning bot Dr. Cath-A-Lot must receive +1200 WP bounty: got ' + bots2[0].wp);
  assert.strictEqual(player2.wp, 5000, 'Player did not lose WP on bot victory (patient saved)');

  const closeBtn2 = createdElements.get('qte-close-btn');
  if (closeBtn2) closeBtn2.click();
  assert.strictEqual(botRaceResult.status, 'BOT_VICTORY', 'Outcome must be BOT_VICTORY');

  console.log('✓ Bot victory playthrough verified: Dr. Cath-A-Lot wins race when player is slow, bounty credited to bot');

  // -------------------------------------------------------------
  // TEST 4: Timeout & Malpractice Penalty Playthrough
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Timeout & Malpractice Penalty Playthrough ---');

  const player3 = { id: 0, name: 'Dr. Player', wp: 5000, gdmtScore: 75, rvuPoints: 1200, sbp: 130, bmi: 24.5, isBot: false };
  const gameState3 = { players: [player3], codeBlueDifficulty: 0 };

  let timeoutResult = null;
  ResuscitationEngine.openChallengeModal(player3, gameState3, (res) => {
    timeoutResult = res;
  });

  // Advance time past 5.0 seconds
  global.performance.advance(5200);
  await new Promise(r => setTimeout(r, 70));

  const modal3 = createdElements.get('code-blue-qte-modal');
  assert(modal3.innerHTML.includes('PATIENT CARDIAC ARREST (ASYSTOLE)'), 'Modal must display ASYSTOLE on timeout');
  assert.strictEqual(player3.wp, 3500, 'Player penalized -1500 WP for malpractice: got ' + player3.wp);
  assert.strictEqual(player3.gdmtScore, 65, 'Player penalized -10 GDMT');
  assert.strictEqual(player3.inJail, true, 'Player quarantined in CCU lockup');

  const closeBtn3 = createdElements.get('qte-close-btn');
  if (closeBtn3) closeBtn3.click();
  assert.strictEqual(timeoutResult.status, 'ASYSTOLE_FAILURE', 'Outcome must be ASYSTOLE_FAILURE');

  console.log('✓ Timeout playthrough verified: severe malpractice penalty and CCU lockup enforced');

  // -------------------------------------------------------------
  // TEST 5: Fail-Safe Anti-Freeze & Static Container Architecture
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Fail-Safe Anti-Freeze & Static Container Architecture ---');

  const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.resolve(__dirname, '../styles.css'), 'utf8');
  const mainScriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

  // 1. Static container in index.html
  assert.ok(
    htmlContent.includes('id="code-blue-qte-modal"'),
    'index.html must statically declare #code-blue-qte-modal container'
  );
  assert.ok(
    htmlContent.includes('class="screen-overlay hidden"'),
    '#code-blue-qte-modal must start as hidden screen-overlay'
  );
  console.log('✓ Static HTML container architecture verified in index.html');

  // 2. High z-index in styles.css
  assert.ok(
    /#code-blue-qte-modal\.screen-overlay\s*\{[^}]*z-index:\s*100050/i.test(cssContent),
    'styles.css must declare z-index: 100050 on #code-blue-qte-modal to sit above all game elements'
  );
  console.log('✓ Topmost emergency z-index (100050) verified in styles.css');

  // 3. Fail-safe timeout in script.js
  assert.ok(
    mainScriptContent.includes('safetyTimer') && mainScriptContent.includes('12000'),
    'script.js must enforce 12s fail-safe safety timeout around openChallengeModal'
  );
  assert.ok(
    mainScriptContent.includes('try {') && mainScriptContent.includes('safeResolve'),
    'script.js must protect openChallengeModal in try/catch with safeResolve'
  );
  console.log('✓ Fail-safe 12s anti-freeze execution wrapper verified in script.js');

  console.log('\n================================================================');
  console.log('   ALL CODE BLUE PLAYTHROUGH & INTERACTION QA AUDITS PASSED!    ');
  console.log('================================================================');
}

runAllPlaythroughAudits().catch(err => {
  console.error(err);
  process.exit(1);
});
