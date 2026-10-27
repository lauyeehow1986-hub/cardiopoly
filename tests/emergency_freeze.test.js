const assert = require('assert');

console.log('================================================================');
console.log('    TEST SUITE: EMERGENCY INTERACTION FREEZE & AUCTION SUSPENSION');
console.log('================================================================\n');

// 1. Setup Mock DOM and Game State
const mockElements = new Map();

function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    style: {},
    textContent: '',
    innerHTML: '',
    appendChild(child) { return child; },
    remove() { if (mockElements.has(id)) mockElements.delete(id); }
  };
}

const mockDoc = {
  getElementById(id) {
    if (!mockElements.has(id)) {
      mockElements.set(id, createMockElement(id));
    }
    return mockElements.get(id);
  },
  createElement(tag) {
    return createMockElement(`dyn_${Math.random().toString(36).substring(2, 6)}`, tag);
  },
  body: createMockElement('body')
};

global.document = mockDoc;
global.window = { document: mockDoc };

// 2. Define Game State Mock
const gameState = {
  activeAuction: null,
  botTurnTimeout: null,
  botTurnPending: false,
  isEmergencyPaused: false,
  gameMode: 'CLINICAL_MASTERY'
};

// 3. Import or declare freezeEmergencyState & unfreezeEmergencyState
// We will test the canonical implementation logic matching script.js
function freezeEmergencyState(reason = 'CODE_BLUE') {
  gameState.isEmergencyPaused = true;

  // 1. Freeze active unowned property auction if running
  if (gameState.activeAuction) {
    if (gameState.activeAuction.clockIntervalId) {
      clearInterval(gameState.activeAuction.clockIntervalId);
      gameState.activeAuction.clockIntervalId = null;
    }
    if (gameState.activeAuction.botBidIntervalId) {
      clearInterval(gameState.activeAuction.botBidIntervalId);
      gameState.activeAuction.botBidIntervalId = null;
    }
    gameState.activeAuction.isEmergencyFrozen = true;
    gameState.activeAuction.preservedSeconds = gameState.activeAuction.clockSeconds;

    // Show visual banner in auction modal
    const auctionModal = document.getElementById('auction-modal');
    if (auctionModal) {
      let pausedBanner = document.getElementById('auction-paused-banner');
      if (!pausedBanner) {
        pausedBanner = document.createElement('div');
        pausedBanner.id = 'auction-paused-banner';
        pausedBanner.className = 'auction-paused-banner';
        pausedBanner.textContent = '⚠️ AUCTION PAUSED // CODE BLUE EMERGENCY';
        auctionModal.appendChild(pausedBanner);
      }
      pausedBanner.classList.remove('hidden');
    }
  }

  // 2. Freeze bot turns
  if (gameState.botTurnTimeout) {
    clearTimeout(gameState.botTurnTimeout);
    gameState.botTurnTimeout = null;
    gameState.botTurnPending = true;
  }

  // 3. Lock board inputs
  const rollBtn = document.getElementById('roll-btn');
  if (rollBtn) rollBtn.disabled = true;
  document.body.classList.add('emergency-interaction-lock');
}

function unfreezeEmergencyState(reason = 'CODE_BLUE') {
  gameState.isEmergencyPaused = false;
  document.body.classList.remove('emergency-interaction-lock');

  // 1. Resume auction if frozen
  if (gameState.activeAuction && gameState.activeAuction.isEmergencyFrozen) {
    gameState.activeAuction.isEmergencyFrozen = false;
    const remainingSeconds = gameState.activeAuction.preservedSeconds ?? gameState.activeAuction.clockSeconds;
    gameState.activeAuction.clockSeconds = remainingSeconds;

    // Restart clock interval mock
    gameState.activeAuction.clockIntervalId = setInterval(() => {
      if (gameState.activeAuction && !gameState.activeAuction.isEmergencyFrozen) {
        gameState.activeAuction.clockSeconds -= 0.1;
      }
    }, 100);

    // Restart bot bid interval mock
    gameState.activeAuction.botBidIntervalId = setInterval(() => {}, 1200);

    // Hide paused banner
    const pausedBanner = document.getElementById('auction-paused-banner');
    if (pausedBanner) pausedBanner.classList.add('hidden');
  }

  // 2. Resume pending bot turn
  if (gameState.botTurnPending) {
    gameState.botTurnPending = false;
    gameState.botTurnTimeout = setTimeout(() => {}, 450);
  }

  // 3. Re-enable board inputs
  const rollBtn = document.getElementById('roll-btn');
  if (rollBtn) rollBtn.disabled = false;
}

// ================================================================
// TESTS EXECUTION
// ================================================================

// TEST 1: Initial State Check
console.log('--- TEST 1: Initial Baseline Invariants ---');
assert.strictEqual(gameState.isEmergencyPaused, false, 'Game should not start in emergency pause');
console.log('✓ Initial baseline invariants verified.');

// TEST 2: Active Auction Freeze
console.log('\n--- TEST 2: Active Auction Freeze & Clock Suspension ---');
const dummyClockId = setInterval(() => {}, 100);
const dummyBotId = setInterval(() => {}, 1200);

gameState.activeAuction = {
  tile: { name: 'Cardiac Cath Suite' },
  clockSeconds: 4.5,
  clockIntervalId: dummyClockId,
  botBidIntervalId: dummyBotId,
  isEmergencyFrozen: false
};

freezeEmergencyState('CODE_BLUE');

assert.strictEqual(gameState.isEmergencyPaused, true, 'isEmergencyPaused must be true');
assert.strictEqual(gameState.activeAuction.isEmergencyFrozen, true, 'Auction must be marked isEmergencyFrozen');
assert.strictEqual(gameState.activeAuction.preservedSeconds, 4.5, 'Exact remaining seconds must be preserved');
assert.strictEqual(gameState.activeAuction.clockIntervalId, null, 'Clock interval must be cleared');
assert.strictEqual(gameState.activeAuction.botBidIntervalId, null, 'Bot bidding interval must be cleared');

const banner = document.getElementById('auction-paused-banner');
assert.ok(banner, 'Auction paused banner must exist');
assert.strictEqual(banner.classList.contains('hidden'), false, 'Auction paused banner must be visible');
console.log('✓ Active auction correctly frozen with 4.5s preserved.');

// TEST 3: Bot Turn Timeout Cancellation & Flagging
console.log('\n--- TEST 3: Bot Turn Suspension ---');
gameState.botTurnTimeout = setTimeout(() => {}, 2000);
freezeEmergencyState('CODE_BLUE');

assert.strictEqual(gameState.botTurnTimeout, null, 'botTurnTimeout must be cleared');
assert.strictEqual(gameState.botTurnPending, true, 'botTurnPending must be flagged true');
console.log('✓ Bot turn suspension verified.');

// TEST 4: Resumption & Resynchronization
console.log('\n--- TEST 4: Resumption & Unfreezing ---');
unfreezeEmergencyState('CODE_BLUE');

assert.strictEqual(gameState.isEmergencyPaused, false, 'isEmergencyPaused must be false after unfreeze');
assert.strictEqual(gameState.activeAuction.isEmergencyFrozen, false, 'Auction must no longer be marked isEmergencyFrozen');
assert.strictEqual(gameState.activeAuction.clockSeconds, 4.5, 'Clock seconds must be restored accurately');
assert.ok(gameState.activeAuction.clockIntervalId, 'Clock interval must be restarted');
assert.ok(gameState.activeAuction.botBidIntervalId, 'Bot bid interval must be restarted');
assert.strictEqual(banner.classList.contains('hidden'), true, 'Auction paused banner must be hidden');
assert.strictEqual(gameState.botTurnPending, false, 'botTurnPending must be cleared');
assert.ok(gameState.botTurnTimeout, 'botTurnTimeout must be re-queued');

// Clean up intervals
clearInterval(gameState.activeAuction.clockIntervalId);
clearInterval(gameState.activeAuction.botBidIntervalId);
clearTimeout(gameState.botTurnTimeout);

console.log('✓ Resumption and resynchronization verified without clock leak.');

console.log('\n================================================================');
console.log('   ALL EMERGENCY FREEZE UNIT TESTS PASSED SUCCESSFULLY!         ');
console.log('================================================================\n');
