/**
 * Unit & Integration Tests: P2P Multiplayer (PeerJS WebRTC) & Supabase Persistence
 * 
 * Verifies:
 * 1. Protocol schema: createGameRoomPayload(roomId, action, senderId, stateSnapshot)
 * 2. Action handling: handleIncomingAction(action, gameState) for:
 *    - ROLL_DICE
 *    - CLINICAL_DECISION
 *    - PROPERTY_ACQUIRED
 *    - TRADE_OFFER
 *    - REGIME_SHIFT
 * 3. P2P room state manager (CardiopolyP2P / P2PRoomManager):
 *    - Host lobby registration
 *    - Client connection & handshake
 *    - Peer list updates & disconnect
 *    - Room code generation & validation
 * 4. Supabase client methods (CardiopolyDB):
 *    - saveGameSession(sessionData) with local storage cache fallback
 *    - fetchGlobalLeaderboards(countryId, factionId) with filtering
 *    - logClinicalDecision(vignetteDecision)
 *    - Graceful fallback when offline or without credentials
 * 5. Markup and script integration checks (index.html, styles.css, script.js)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Testing P2P Multiplayer & Supabase Persistence (TDD) ---');

// 1. Require modules under test
const {
  createGameRoomPayload,
  handleIncomingAction,
  generateRoomCode,
  isValidRoomCode,
  CardiopolyP2P,
  P2PActionTypes
} = require('../src/network/p2pSync.js');

const {
  CardiopolyDB,
  createSupabaseClient
} = require('../src/network/supabaseClient.js');

// ============================================================================
// TEST SUITE 1: Protocol Schema & Payload Generation
// ============================================================================
console.log('Testing createGameRoomPayload...');
const testAction = {
  type: 'ROLL_DICE',
  playerIndex: 1,
  dice: [3, 4],
  timestamp: Date.now()
};
const mockSnapshot = {
  turn: 5,
  currentPlayerIndex: 1,
  phase: 'WAIT_FOR_ROLL'
};

const payload = createGameRoomPayload('CARDIO-742', testAction, 'peer-user-0', mockSnapshot);

assert(payload, 'Payload must be returned');
assert.strictEqual(payload.protocol, 'CARDIOPOLY_P2P_v1', 'Protocol version mismatch');
assert.strictEqual(payload.roomId, 'CARDIO-742', 'Room ID must match');
assert.strictEqual(payload.senderId, 'peer-user-0', 'Sender ID must match');
assert.deepStrictEqual(payload.action, testAction, 'Action must match');
assert.deepStrictEqual(payload.stateSnapshot, mockSnapshot, 'State snapshot must match');
assert(typeof payload.timestamp === 'number' || typeof payload.timestamp === 'string', 'Timestamp must be present');

// Payload with defaults
const defaultPayload = createGameRoomPayload('CARDIO-101', { type: 'HEARTBEAT' });
assert.strictEqual(defaultPayload.roomId, 'CARDIO-101');
assert.strictEqual(defaultPayload.action.type, 'HEARTBEAT');
assert.strictEqual(defaultPayload.senderId, 'anonymous');
assert.strictEqual(defaultPayload.stateSnapshot, null);
console.log('✓ Protocol schema and payload creation verified');

// ============================================================================
// TEST SUITE 2: Action Handlers (handleIncomingAction)
// ============================================================================
console.log('Testing handleIncomingAction for core game events...');

function createMockGameState() {
  return {
    phase: 'WAIT_FOR_ROLL',
    currentPlayerIndex: 0,
    currentRoll: [1, 1],
    activeCountryId: 'SG',
    policyRegime: { id: 'SG', name: 'Singapore 3M' },
    players: [
      { id: 0, name: 'You', factionId: 'ACADEMIC_CLINICIAN', position: 0, sbp: 120, bmi: 24.5, wp: 0, encountersCompleted: 0, gdmtAdherentCount: 0 },
      { id: 1, name: 'Fat Slob', factionId: 'INTERVENTIONALIST', position: 0, sbp: 140, bmi: 32.0, wp: 100, rvuPoints: 0, sanctionsCount: 0 },
      { id: 2, name: 'Lazy Larry', factionId: 'HOSPITAL_CEO', position: 0, sbp: 130, bmi: 27.5, wp: 50, propertiesOwned: [] },
      { id: 3, name: 'Sloppy Susan', factionId: 'REGULATORY_AUDITOR', position: 0, sbp: 125, bmi: 26.0, wp: 20 }
    ],
    properties: Array.from({ length: 40 }, (_, i) => ({
      index: i,
      name: `Department ${i}`,
      owner: null,
      price: 150
    })),
    tradeState: { activeOffer: null, history: [] },
    vignetteLogs: []
  };
}

// 2a. ROLL_DICE action
let state = createMockGameState();
let rollRes = handleIncomingAction({
  type: 'ROLL_DICE',
  playerIndex: 1,
  dice: [4, 5],
  newPosition: 9
}, state);

assert.strictEqual(rollRes.success, true, 'ROLL_DICE must succeed');
assert.deepStrictEqual(state.currentRoll, [4, 5], 'GameState currentRoll updated');
assert.strictEqual(state.players[1].position, 9, 'Player 1 position updated to 9');
console.log('✓ ROLL_DICE action handled successfully');

// 2b. CLINICAL_DECISION action
state = createMockGameState();
let clinicalRes = handleIncomingAction({
  type: 'CLINICAL_DECISION',
  playerIndex: 0,
  vignetteId: 'VIG-CAD-01',
  choiceIndex: 0,
  choiceLabel: 'GDMT + Lifestyle',
  adherent: true,
  effects: { sbp: -5, bmi: -0.4, wp: 20 },
  rvuDelta: 0
}, state);

assert.strictEqual(clinicalRes.success, true, 'CLINICAL_DECISION must succeed');
assert.strictEqual(state.players[0].sbp, 115, 'SBP decreased by 5');
assert.strictEqual(state.players[0].encountersCompleted, 1, 'Encounters completed incremented');
assert.strictEqual(state.players[0].gdmtAdherentCount, 1, 'GDMT adherence incremented');
assert.strictEqual(state.vignetteLogs.length, 1, 'Vignette decision logged');
console.log('✓ CLINICAL_DECISION action handled successfully');

// 2c. PROPERTY_ACQUIRED action
state = createMockGameState();
let propRes = handleIncomingAction({
  type: 'PROPERTY_ACQUIRED',
  playerIndex: 2,
  propertyIndex: 6,
  cost: 200
}, state);

assert.strictEqual(propRes.success, true, 'PROPERTY_ACQUIRED must succeed');
assert.strictEqual(state.properties[6].owner, 2, 'Property owner set to player 2');
assert.strictEqual(state.players[2].wp, 250, 'Waste points increased by 200 (50 + 200)');
assert(state.players[2].propertiesOwned.includes(6), 'Property recorded in player owned array');
console.log('✓ PROPERTY_ACQUIRED action handled successfully');

// 2d. TRADE_OFFER action
state = createMockGameState();
state.properties[3].owner = 0;
state.properties[8].owner = 1;

let tradeRes = handleIncomingAction({
  type: 'TRADE_OFFER',
  fromPlayerIndex: 0,
  toPlayerIndex: 1,
  offeredPropertyIndex: 3,
  requestedPropertyIndex: 8,
  status: 'ACCEPTED'
}, state);

assert.strictEqual(tradeRes.success, true, 'TRADE_OFFER accepted should succeed');
assert.strictEqual(state.properties[3].owner, 1, 'Offered property transferred to recipient');
assert.strictEqual(state.properties[8].owner, 0, 'Requested property transferred to initiator');
assert(state.tradeState.history.length >= 1, 'Trade history recorded');
console.log('✓ TRADE_OFFER action handled successfully');

// 2e. REGIME_SHIFT action
state = createMockGameState();
let regimeRes = handleIncomingAction({
  type: 'REGIME_SHIFT',
  countryId: 'US',
  regimeName: 'United States Multi-Payer'
}, state);

assert.strictEqual(regimeRes.success, true, 'REGIME_SHIFT should succeed');
assert.strictEqual(state.activeCountryId, 'US', 'Active country updated to US');
assert.strictEqual(state.policyRegime.id, 'US', 'Policy regime object updated to US');
console.log('✓ REGIME_SHIFT action handled successfully');

// ============================================================================
// TEST SUITE 3: Room Code Generation & P2P Room Manager
// ============================================================================
console.log('Testing Room Code Generation & CardiopolyP2P Manager...');

// Room code format test: prefix-number e.g. CARDIO-882
const code1 = generateRoomCode();
assert(/^CARDIO-[0-9A-Z]{3,4}$/.test(code1), `Room code ${code1} must match pattern CARDIO-XXX`);
assert.strictEqual(isValidRoomCode(code1), true, 'Generated room code should validate as true');
assert.strictEqual(isValidRoomCode('CARDIO-882'), true);
assert.strictEqual(isValidRoomCode('INVALID_CODE'), false);
assert.strictEqual(isValidRoomCode(''), false);

// CardiopolyP2P Manager unit tests (Headless mode for Node.js)
const p2pHost = new CardiopolyP2P({ isHeadless: true });
assert.strictEqual(p2pHost.isHost, false);
assert.strictEqual(p2pHost.status, 'DISCONNECTED');
assert.strictEqual(p2pHost.getPeerCount(), 0);

// Host lobby creation
const hostLobby = p2pHost.initHost('CARDIO-999', { playerName: 'Host Dr. Heart', factionId: 'ACADEMIC_CLINICIAN' });
assert.strictEqual(p2pHost.isHost, true);
assert.strictEqual(p2pHost.roomId, 'CARDIO-999');
assert.strictEqual(p2pHost.status, 'HOSTING');
assert.strictEqual(hostLobby.roomId, 'CARDIO-999');

// Mock client joining host
const p2pClient = new CardiopolyP2P({ isHeadless: true });
const joinRes = p2pClient.joinRoom('CARDIO-999', { playerName: 'Guest Dr. Cath', factionId: 'INTERVENTIONALIST' });
assert.strictEqual(p2pClient.isHost, false);
assert.strictEqual(p2pClient.roomId, 'CARDIO-999');
assert.strictEqual(p2pClient.status, 'JOINED');

// Simulate client connecting to host peer list
p2pHost.addPeer({ id: 'client-peer-1', name: 'Guest Dr. Cath', factionId: 'INTERVENTIONALIST' });
assert.strictEqual(p2pHost.getPeerCount(), 1);
assert.strictEqual(p2pHost.getPeers()[0].name, 'Guest Dr. Cath');

// Action broadcast callback registration
let receivedAction = null;
p2pClient.onAction((action, senderId) => {
  receivedAction = { action, senderId };
});

const broadcastPayload = p2pHost.broadcastAction({
  type: 'ROLL_DICE',
  playerIndex: 0,
  dice: [6, 6]
});

assert(broadcastPayload, 'Broadcast payload returned');
assert.strictEqual(broadcastPayload.action.type, 'ROLL_DICE');

// Simulate deliver action to client
p2pClient.simulateIncomingPayload(broadcastPayload);
assert(receivedAction, 'Client should receive broadcast action');
assert.strictEqual(receivedAction.action.type, 'ROLL_DICE');
assert.deepStrictEqual(receivedAction.action.dice, [6, 6]);

// Peer disconnect
p2pHost.removePeer('client-peer-1');
assert.strictEqual(p2pHost.getPeerCount(), 0);

p2pHost.disconnect();
assert.strictEqual(p2pHost.status, 'DISCONNECTED');
assert.strictEqual(p2pHost.isHost, false);
p2pClient.disconnect();
assert.strictEqual(p2pClient.status, 'DISCONNECTED');
console.log('✓ CardiopolyP2P room management & peer mesh verified');

// ============================================================================
// TEST SUITE 4: Supabase Client & Offline Persistence (CardiopolyDB)
// ============================================================================
console.log('Testing Supabase Client & Offline Fallback...');

const db = new CardiopolyDB({
  supabaseUrl: 'https://example-placeholder.supabase.co',
  supabaseKey: 'mock-anon-key',
  offlineFallback: true,
  storageDriver: 'memory'
});

// 4a. saveGameSession with local storage / offline fallback
const sessionData = {
  id: 'sess-101',
  countryId: 'SG',
  winnerFaction: 'ACADEMIC_CLINICIAN',
  winnerPlayerName: 'You',
  totalTurns: 18,
  scores: {
    sbp: 124,
    bmi: 23.8,
    wp: 350
  },
  clinicalMetrics: {
    gdmtScore: 91,
    encountersCompleted: 14,
    complicationsCount: 0
  }
};

const saveRes = db.saveGameSession(sessionData);
assert(saveRes, 'saveGameSession must return result');
assert.strictEqual(saveRes.success, true, 'Save session should succeed');
assert(saveRes.session, 'Saved session payload must be returned');
assert.strictEqual(saveRes.session.id, 'sess-101');
assert.strictEqual(saveRes.savedLocally, true, 'Should save locally when offline or mock');

// Verify session is retrieved from local session cache
const cachedSessions = db.getLocalSessions();
assert(Array.isArray(cachedSessions), 'getLocalSessions should return array');
assert(cachedSessions.some(s => s.id === 'sess-101'), 'Cached sessions must include sess-101');
console.log('✓ saveGameSession & local session fallback verified');

// 4b. fetchGlobalLeaderboards with filtering
const leaderboards = db.fetchGlobalLeaderboards();
assert(Array.isArray(leaderboards), 'fetchGlobalLeaderboards should return array');
assert(leaderboards.length >= 3, 'Default leaderboards should have records');
// Rank sorting check (descending score or composite rank)
for (let i = 0; i < leaderboards.length - 1; i++) {
  assert(leaderboards[i].rank <= leaderboards[i + 1].rank, 'Leaderboards must be ordered by rank ascending (1, 2, 3...)');
}

// Filter by country
const sgLeaderboards = db.fetchGlobalLeaderboards({ countryId: 'SG' });
assert(sgLeaderboards.every(rec => rec.countryId === 'SG'), 'All records must match country SG');

// Filter by faction
const clinicianLeaderboards = db.fetchGlobalLeaderboards({ factionId: 'ACADEMIC_CLINICIAN' });
assert(clinicianLeaderboards.every(rec => rec.factionId === 'ACADEMIC_CLINICIAN'), 'All records must match ACADEMIC_CLINICIAN');
console.log('✓ fetchGlobalLeaderboards & filtering verified');

// 4c. logClinicalDecision
const decisionRecord = {
  id: 'dec-88',
  vignetteId: 'VIG-CAD-01',
  playerIndex: 0,
  factionId: 'ACADEMIC_CLINICIAN',
  choiceSelected: 'Guideline-Directed Medical Therapy (GDMT)',
  adherent: true,
  clinicalScore: 95
};

const logRes = db.logClinicalDecision(decisionRecord);
assert.strictEqual(logRes.success, true, 'logClinicalDecision should succeed');
const cachedDecisions = db.getLocalDecisions();
assert(cachedDecisions.some(d => d.id === 'dec-88'), 'Decision must be present in local cache');
console.log('✓ logClinicalDecision verified');

// 4d. Graceful fallback when URL/Key not supplied
const offlineDb = new CardiopolyDB({ offlineFallback: true, storageDriver: 'memory' });
assert.strictEqual(offlineDb.isConfigured(), false, 'DB without credentials should report not configured');
const offlineSave = offlineDb.saveGameSession({ id: 'sess-offline', winnerFaction: 'HOSPITAL_CEO' });
assert.strictEqual(offlineSave.success, true);
assert.strictEqual(offlineSave.savedLocally, true);
const offlineBoards = offlineDb.fetchGlobalLeaderboards();
assert(Array.isArray(offlineBoards) && offlineBoards.length > 0, 'Should return fallback leaderboards when offline');
console.log('✓ Graceful offline fallback verified');

// ============================================================================
// TEST SUITE 5: Markup, Stylesheet, and Script Integration Contracts
// ============================================================================
console.log('Testing index.html, styles.css, and script.js integration...');

const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
const scriptContent = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

// index.html checks
assert(htmlContent.includes('peerjs'), 'index.html must include PeerJS script');
assert(htmlContent.includes('src/network/supabaseClient.js'), 'index.html must include supabaseClient.js');
assert(htmlContent.includes('src/network/p2pSync.js'), 'index.html must include p2pSync.js');
assert(htmlContent.includes('id="multiplayer-btn"'), 'index.html must contain #multiplayer-btn');
assert(htmlContent.includes('id="multiplayer-modal"'), 'index.html must contain #multiplayer-modal');
assert(htmlContent.includes('multiplayer-tabs'), 'index.html must contain multiplayer tab controls');

// styles.css checks
assert(cssContent.includes('#multiplayer-modal') || cssContent.includes('.multiplayer-modal'), 'styles.css must style multiplayer modal');
assert(cssContent.includes('.leaderboard-table') || cssContent.includes('#leaderboard-table'), 'styles.css must style leaderboard table');

// script.js checks
assert(scriptContent.includes('CardiopolyDB') || scriptContent.includes('saveGameSession'), 'script.js must wire up session saving');
assert(scriptContent.includes('CardiopolyP2P') || scriptContent.includes('p2pSync') || scriptContent.includes('broadcastAction'), 'script.js must wire up P2P network sync');

console.log('✓ Markup, CSS, and Script integration contracts passed');
console.log('All network.test.js unit, protocol, manager, DB, and integration tests passed successfully!');
