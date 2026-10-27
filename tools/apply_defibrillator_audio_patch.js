const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'patches', 'cardiopoly_script_patches.js');
let code = fs.readFileSync(filePath, 'utf8');

function normalize(s) { return s.replace(/\r\n/g, '\n'); }

let normCode = normalize(code);

const targetChime = `  playHospitalChime() {
    this.initContext();
    if (!this.ctx) return;
    const chimeFreqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6 (Cmaj9 arpeggio)
    chimeFreqs.forEach((freq, idx) => {
      this.playEnvelopedTone(freq, 0.45, 'triangle', 0.042, idx * 0.045);
    });
  }`;

const replacementChime = `  playHospitalChime() {
    this.initContext();
    if (!this.ctx) return;
    const chimeFreqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6 (Cmaj9 arpeggio)
    chimeFreqs.forEach((freq, idx) => {
      this.playEnvelopedTone(freq, 0.45, 'triangle', 0.042, idx * 0.045);
    });
  }

  playDefibrillatorSequence() {
    this.initContext();
    if (!this.ctx) return;

    // GMSBS Layer 4: High-stakes emergency (-8.0 LUFS target), duck background soundtrack -18dB
    this.duckSoundtrack(5800);

    const now = this.ctx.currentTime;

    // Step 1: Hospital Overhead Pager Chime (A5 -> D5 dual-tone)
    this.playEnvelopedTone(880.00, 0.18, 'sine', 0.12, 0);
    this.playEnvelopedTone(587.33, 0.28, 'sine', 0.14, 0.18);

    // Step 2: Automated PA Voice Announcement (SpeechSynthesis if available)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance('Code Blue. CCU Resuscitation.');
        utter.rate = 1.35;
        utter.pitch = 0.92;
        utter.volume = 0.95;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }

    // Step 3: Defibrillator Capacitor Charging Whine (220 Hz -> 2400 Hz exponential ramp)
    try {
      const chargeOsc = this.ctx.createOscillator();
      const chargeGain = this.ctx.createGain();
      chargeOsc.type = 'sawtooth';
      chargeOsc.frequency.setValueAtTime(220, now + 0.5);
      chargeOsc.frequency.exponentialRampToValueAtTime(2400, now + 2.7);

      chargeGain.gain.setValueAtTime(0.0001, now + 0.5);
      chargeGain.gain.linearRampToValueAtTime(0.095, now + 2.5);
      chargeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.75);

      chargeOsc.connect(chargeGain);
      chargeGain.connect(this.ctx.destination);

      chargeOsc.start(now + 0.5);
      chargeOsc.stop(now + 2.8);
    } catch (_) {}

    // Step 4: Warning Alert Beeps ("All Clear!") at t = 2.75s & 2.95s
    this.playEnvelopedTone(1760.00, 0.09, 'square', 0.08, 2.75);
    this.playEnvelopedTone(1760.00, 0.09, 'square', 0.08, 2.95);

    // Step 5: High-Voltage Defibrillation Shock Discharge (t = 3.2s)
    // 5a. Sub-bass acoustic thump (45 Hz resonant sine)
    try {
      const thumpOsc = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(90, now + 3.2);
      thumpOsc.frequency.exponentialRampToValueAtTime(38, now + 3.6);

      thumpGain.gain.setValueAtTime(0.38, now + 3.2);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.75);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(this.ctx.destination);

      thumpOsc.start(now + 3.2);
      thumpOsc.stop(now + 3.8);
    } catch (_) {}

    // 5b. Electrical discharge crackle / noise burst
    try {
      const bufferSize = this.ctx.sampleRate * 0.22;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now + 3.2);
      filter.Q.setValueAtTime(3.0, now + 3.2);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now + 3.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.42);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now + 3.2);
    } catch (_) {}

    // Step 6: Post-Resuscitation Sinus Bradycardia Pulse (72 BPM blips at t = 3.9s, 4.75s, 5.5s)
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 3.9);
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 4.75);
    this.playEnvelopedTone(783.99, 0.08, 'sine', 0.05, 5.5);
  }`;

if (!normCode.includes(targetChime)) {
  console.error("Target chime not found in cardiopoly_script_patches.js!");
  process.exit(1);
}

normCode = normCode.replace(targetChime, replacementChime);

// Expose on window.CardiopolyPatches
const targetExports = `window.CardiopolyPatches.cardiopolyAudioV2 = cardiopolyAudioV2;
window.CardiopolyPatches.triggerMultimodalEvent = triggerMultimodalEvent;`;

const replacementExports = `window.CardiopolyPatches.cardiopolyAudioV2 = cardiopolyAudioV2;
window.CardiopolyPatches.triggerMultimodalEvent = triggerMultimodalEvent;
window.CardiopolyPatches.playDefibrillatorSequence = () => cardiopolyAudioV2.playDefibrillatorSequence();`;

if (!normCode.includes(targetExports)) {
  console.error("Target exports not found!");
  process.exit(1);
}

normCode = normCode.replace(targetExports, replacementExports);

const finalCode = normCode.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, finalCode, 'utf8');
console.log("Successfully patched cardiopoly_script_patches.js with GMSBS Layer 4 Defibrillator Audio!");
