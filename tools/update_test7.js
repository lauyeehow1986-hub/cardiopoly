const fs = require('fs');
let s = fs.readFileSync('tests/patch_verification.test.js', 'utf8').replace(/\r\n/g, '\n');
const target = "console.log('\\n================================================================');\nconsole.log('   ALL TDD VERIFICATION TESTS COMPLETED SUCCESSFULLY!           ');";

const addTest = `console.log('--- TEST 7: GMSBS Layer 4 Procedural Defibrillator Audio Sequence ---');
assert.strictEqual(typeof patches.playDefibrillatorSequence, 'function', 'playDefibrillatorSequence must be exported');

// Mock Web Audio Context
patches.cardiopolyAudioV2.ctx = {
  currentTime: 0,
  sampleRate: 44100,
  destination: {},
  createGain: () => ({ gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, cancelScheduledValues: () => {} }, connect: () => {} }),
  createOscillator: () => ({ frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, start: () => {}, stop: () => {}, connect: () => {} }),
  createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
  createBufferSource: () => ({ buffer: null, connect: () => {}, start: () => {} }),
  createBiquadFilter: () => ({ frequency: { setValueAtTime: () => {} }, Q: { setValueAtTime: () => {} }, connect: () => {} })
};

patches.playDefibrillatorSequence();
assert.strictEqual(patches.cardiopolyAudioV2.soundtrackDucked, true, 'Soundtrack must be ducked by playDefibrillatorSequence');
console.log('✓ GMSBS Layer 4 Defibrillator Audio Sequence & sidechain ducking verified');\n\n` + target;

s = s.replace(target, addTest).replace(/\n/g, '\r\n');
fs.writeFileSync('tests/patch_verification.test.js', s, 'utf8');
console.log('Successfully added Test 7 to tests/patch_verification.test.js');
