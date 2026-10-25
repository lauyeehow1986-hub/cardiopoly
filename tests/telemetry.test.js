const assert = require('assert');
const { computePulseRate, generateEcgSample, initTelemetryCanvas } = require('../src/components/telemetry.js');

// 1. Verifies pulse rate scales appropriately with SBP and stress
assert.strictEqual(computePulseRate(120), 72, '120 SBP should yield 72 bpm');
assert.strictEqual(computePulseRate(180), 108, '180 SBP should yield 108 bpm');
assert.strictEqual(computePulseRate(90), 54, '90 SBP should yield 54 bpm');
assert.strictEqual(computePulseRate(), 72, 'Default SBP should yield 72 bpm');
assert.strictEqual(computePulseRate(NaN), 72, 'NaN SBP should yield 72 bpm');

// 2. Verifies ECG sample generation returns valid Y coordinate points
const sample = generateEcgSample(0.2);
assert(typeof sample === 'number' && !isNaN(sample) && Number.isFinite(sample), 'Sample must be a finite number');

// 3. Test key ECG wave morphology (P-Q-R-S-T)
const baseSample = generateEcgSample(0.05); // baseline (~0)
const pSample = generateEcgSample(0.20);    // P wave (> baseline)
const qSample = generateEcgSample(0.35);    // Q dip (< baseline)
const rSample = generateEcgSample(0.40);    // R spike (peak, highest)
const sSample = generateEcgSample(0.45);    // S dip (< baseline)
const tSample = generateEcgSample(0.72);    // T wave (> baseline)

assert(rSample > pSample, 'R spike should be taller than P wave');
assert(rSample > tSample, 'R spike should be taller than T wave');
assert(qSample < baseSample, 'Q wave should dip below baseline');
assert(sSample < baseSample, 'S wave should dip below baseline');
assert(pSample > baseSample, 'P wave should rise above baseline');
assert(tSample > baseSample, 'T wave should rise above baseline');

// 4. Verify phase wrapping and range
assert(Math.abs(generateEcgSample(0.40) - generateEcgSample(1.40)) < 1e-6, 'Phase should wrap modulo 1.0');
assert(Math.abs(generateEcgSample(-0.60) - generateEcgSample(0.40)) < 1e-6, 'Negative phase should wrap correctly');

// Check that samples across a full cardiac cycle are finite
for (let p = 0; p <= 1.0; p += 0.02) {
  const v = generateEcgSample(p);
  assert(Number.isFinite(v), `Sample at phase ${p} must be finite`);
}

// 5. Verify initTelemetryCanvas export & controller API
assert.strictEqual(typeof initTelemetryCanvas, 'function', 'initTelemetryCanvas should be a function');

// Safe execution without DOM canvas
const controller = initTelemetryCanvas(null, { sbp: 140, dbp: 90 });
assert.strictEqual(typeof controller, 'object', 'initTelemetryCanvas(null) should return safe control object');
assert.strictEqual(typeof controller.start, 'function');
assert.strictEqual(typeof controller.stop, 'function');
assert.strictEqual(typeof controller.destroy, 'function');
assert.strictEqual(typeof controller.update, 'function');
assert.strictEqual(typeof controller.getVitals, 'function');

const vitals = controller.getVitals();
assert.strictEqual(vitals.sbp, 140);
assert.strictEqual(vitals.dbp, 90);
assert.strictEqual(vitals.hr, computePulseRate(140));

controller.update({ sbp: 160, dbp: 100 });
const updatedVitals = controller.getVitals();
assert.strictEqual(updatedVitals.sbp, 160);
assert.strictEqual(updatedVitals.dbp, 100);
assert.strictEqual(updatedVitals.hr, computePulseRate(160));

controller.stop();
controller.destroy();

console.log('telemetry.test.js passed all unit and contract tests successfully');
