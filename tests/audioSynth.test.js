const assert = require('assert');
const { createAudioSynth } = require('../src/components/audioSynth.js');

// Test in headless Node.js environment
const synth = createAudioSynth({ headless: true });

assert.strictEqual(typeof synth, 'object');
assert.strictEqual(typeof synth.playDiceRoll, 'function');
assert.strictEqual(typeof synth.playEcgBeep, 'function');
assert.strictEqual(typeof synth.playCashChime, 'function');
assert.strictEqual(typeof synth.playAlertAlarm, 'function');
assert.strictEqual(typeof synth.playDefibrillatorCharge, 'function');
assert.strictEqual(typeof synth.playFlatline, 'function');
assert.strictEqual(typeof synth.setMuted, 'function');
assert.strictEqual(typeof synth.toggleMute, 'function');
assert.strictEqual(typeof synth.isMuted, 'function');

// Verify default mute state & toggle
assert.strictEqual(synth.isMuted(), false);
synth.setMuted(true);
assert.strictEqual(synth.isMuted(), true);
synth.toggleMute();
assert.strictEqual(synth.isMuted(), false);

// Calling audio playback functions in headless should safely return without throwing
assert.doesNotThrow(() => {
  synth.playDiceRoll();
  synth.playEcgBeep(120);
  synth.playCashChime();
  synth.playAlertAlarm();
  synth.playDefibrillatorCharge();
  synth.playFlatline();
});

console.log('audioSynth.test.js passed all unit assertions successfully!');
