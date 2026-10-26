const assert = require('assert');
const {
  UPGRADE_TIERS,
  canUpgradeProperty,
  getUpgradeCost,
  upgradeProperty,
  getEffectiveRent
} = require('../src/engine/departmentUpgrades.js');

// 1. Verify Upgrade Tiers
assert.strictEqual(UPGRADE_TIERS[0].name, 'Standard Suite');
assert.strictEqual(UPGRADE_TIERS[1].name, 'Clinical Fellow');
assert.strictEqual(UPGRADE_TIERS[2].name, 'Subspecialty Attending');
assert.strictEqual(UPGRADE_TIERS[3].name, 'Flagship Heart Institute');
assert.strictEqual(UPGRADE_TIERS[3].rentMultiplier, 3.5);

// 2. Setup mock property & owner
const owner = {
  id: 0,
  name: 'Dr. CEO',
  factionId: 'HOSPITAL_CEO',
  wp: 5000
};

const tile1 = {
  index: 1,
  type: 'PROPERTY',
  name: 'ECG room',
  groupName: 'Clinic',
  groupOrder: 1,
  priceWP: 300,
  baseRent: 100,
  upgradeLevel: 0,
  ownerId: 0
};

const tile2 = {
  index: 3,
  type: 'PROPERTY',
  name: 'Consultation room',
  groupName: 'Clinic',
  groupOrder: 1,
  priceWP: 300,
  baseRent: 100,
  upgradeLevel: 0,
  ownerId: 0
};

const mockGameState = {
  tiles: [
    { index: 0, type: 'GO' },
    tile1,
    { index: 2, type: 'COMMUNITY_CHEST' },
    tile2
  ],
  currentRegime: 'SINGAPORE'
};

// 3. Test Upgrade Eligibility & CEO Discount
assert.strictEqual(canUpgradeProperty(tile1, owner, mockGameState), true);

// Base cost is 300 * 0.5 = 150 WP. CEO gets 15% discount -> 128 WP!
const costCEO = getUpgradeCost(tile1, owner);
assert(costCEO < 150, 'CEO should get 15% discount on upgrade cost');
assert.strictEqual(costCEO, Math.round(150 * 0.85));

// 4. Test Upgrade Execution
const upResult = upgradeProperty(tile1, owner, mockGameState);
assert.strictEqual(upResult.success, true);
assert.strictEqual(tile1.upgradeLevel, 1);
assert.strictEqual(tile1.baseRent, 100, 'baseRent must NOT be mutated');

// 5. Test Non-Mutating Rent Calculation
// Both tiles owned in Clinic -> monopolyMultiplier = 2.0 (with CEO bonus +50% = 3.0)
// Upgrade Level 1 -> 1.5x multiplier
const rent1 = getEffectiveRent(tile1, owner, 'SINGAPORE', owner.factionId, mockGameState);
assert(rent1 > 100, 'Rent with monopoly and upgrade should scale above 100');
assert.strictEqual(tile1.baseRent, 100, 'baseRent must remain strictly 100');

// Repeated calls should yield identical result (zero exponential compounding bug!)
const rent2 = getEffectiveRent(tile1, owner, 'SINGAPORE', owner.factionId, mockGameState);
assert.strictEqual(rent1, rent2, 'Subsequent rent calls must NOT compound exponentially');

// 6. Test Tier 3 Max Cap
tile1.upgradeLevel = 3;
assert.strictEqual(canUpgradeProperty(tile1, owner, mockGameState), false, 'Cannot upgrade beyond Tier 3');

console.log('departmentUpgrades.test.js passed all unit assertions successfully!');
