const assert = require('assert');
const {
  AI_DIFFICULTIES,
  calculatePropertyStrategicValue,
  decidePropertyPurchase,
  calculateAuctionMaxBid,
  evaluateTradeOffer,
  selectVignetteChoice,
  generateAiChatQuip
} = require('../src/engine/aiController.js');

// 1. Verify Difficulty Constants
assert(AI_DIFFICULTIES.RESIDENT);
assert(AI_DIFFICULTIES.ATTENDING);
assert(AI_DIFFICULTIES.DEPARTMENT_CHAIR);

// Mock Game State with 40 tiles organized into realistic small groups
const mockTiles = [];
for (let i = 0; i < 40; i++) {
  let groupOrder = Math.floor(i / 4) + 1;
  let groupName = `Group ${groupOrder}`;
  if (i === 1 || i === 3) {
    groupOrder = 1;
    groupName = 'Clinic';
  } else if (i === 6 || i === 8 || i === 9) {
    groupOrder = 2;
    groupName = 'Cardiac rehab';
  }

  mockTiles.push({
    index: i,
    type: i === 0 ? 'GO' : 'PROPERTY',
    name: i === 1 ? 'ECG room' : (i === 3 ? 'Consultation room' : (i === 6 ? 'Treadmill room' : (i === 8 ? 'CPET lab' : (i === 9 ? 'Walk test' : `Suite ${i}`)))),
    groupOrder: groupOrder,
    groupName: groupName,
    priceWP: 400,
    ownerId: null
  });
}

const mockGameState = {
  tiles: mockTiles,
  players: [
    { id: 0, name: 'You', factionId: 'ACADEMIC_CLINICIAN', isBot: false },
    { id: 1, name: 'Fat Slob', factionId: 'INTERVENTIONALIST', isBot: true },
    { id: 2, name: 'Lazy Larry', factionId: 'HOSPITAL_CEO', isBot: true },
    { id: 3, name: 'Sloppy Susan', factionId: 'REGULATORY_AUDITOR', isBot: true }
  ]
};

const bot = mockGameState.players[1];

// 2. Test Property Strategic Value & Monopoly Completion Bonus
mockTiles[1].ownerId = bot.id; // bot owns 1 in Clinic group
const tile3 = mockTiles[3]; // completes Clinic group!

const valResident = calculatePropertyStrategicValue(bot, tile3, mockGameState, AI_DIFFICULTIES.RESIDENT);
const valChair = calculatePropertyStrategicValue(bot, tile3, mockGameState, AI_DIFFICULTIES.DEPARTMENT_CHAIR);

assert(valChair > tile3.priceWP, 'Completing monopoly should have high strategic value');
assert(valChair > valResident, 'Department Chair should weight monopoly synergy more heavily than Resident');

// 3. Test Purchase Decision
const buyDecision = decidePropertyPurchase(bot, tile3, mockGameState, AI_DIFFICULTIES.DEPARTMENT_CHAIR);
assert.strictEqual(buyDecision.shouldBuy, true, 'Department Chair should buy tile that completes monopoly');

// 4. Test Auction Max Bid
const maxBid = calculateAuctionMaxBid(bot, tile3, mockGameState, AI_DIFFICULTIES.DEPARTMENT_CHAIR);
assert(maxBid >= tile3.priceWP, 'Auction bid should scale above base price for monopoly completion');

// 5. Test Smart Trade Valuation (Anti-Exploit)
// Human owns tile 6 (in group 2). Bot owns tile 8 (in group 2). Human owns tile 9 (in group 2).
// Human proposing to give tile 1 (which human owns) to bot in exchange for tile 8 (which gives Human complete group 2 monopoly!)
mockTiles[1].ownerId = 0; // Human owns tile 1
mockTiles[6].ownerId = 0;
mockTiles[9].ownerId = 0;
mockTiles[8].ownerId = bot.id; // Bot owns tile 8

const tradeOfferExploit = evaluateTradeOffer(
  bot,
  mockTiles[1], // Human offering tile 1
  mockTiles[8], // Human asking for tile 8 (completing Human's monopoly!)
  mockGameState,
  AI_DIFFICULTIES.DEPARTMENT_CHAIR,
  0
);

assert.strictEqual(tradeOfferExploit.accepted, false, 'Department Chair AI should reject trade that grants human a monopoly without equal return');
assert(tradeOfferExploit.reason.toLowerCase().includes('monopoly'));

// 6. Test Contextual Vignette Decisions
const vignette = {
  department: 'Oculostenotic space',
  choices: [
    { id: 'CHOICE_GDMT', title: 'Intensify GDMT' },
    { id: 'CHOICE_INTERVENTION', title: 'Deploy Drug-Eluting Stent' },
    { id: 'CHOICE_COST_CONTAINMENT', title: '23-Hour Observation' }
  ]
};

const interventionalistChoice = selectVignetteChoice(mockGameState.players[1], vignette, mockGameState, AI_DIFFICULTIES.DEPARTMENT_CHAIR);
assert.strictEqual(interventionalistChoice.choiceId, 'CHOICE_INTERVENTION', 'Interventionalist bot should favor procedural intervention');

const clinicianChoice = selectVignetteChoice(mockGameState.players[0], vignette, mockGameState, AI_DIFFICULTIES.DEPARTMENT_CHAIR);
assert.strictEqual(clinicianChoice.choiceId, 'CHOICE_GDMT', 'Academic clinician should favor GDMT');

// 7. Test Chat Quip Generation
const quip = generateAiChatQuip(bot, 'AUCTION_BID', { propertyName: 'Cath Lab' });
assert(typeof quip === 'string' && quip.length > 5);

console.log('aiController.test.js passed all unit assertions successfully!');
