# 02 - Audio, Music, Visual & Multimodal Upgrade Specification

## 1. Web Audio API Artifact Fixes & Procedural Music Engine (`CardiopolyAudioEngineV2`)
### Observed Audio Artifacts in $I_0$
- **Unresumed `AudioContext` State**: Modern browsers suspend `AudioContext` until an explicit user gesture calls `ctx.resume()`. Toggling the navbar `Sound` button without resuming the context leaves audio silent.
- **Square-Wave Clicks / Pops**: Stopping an `OscillatorNode` abruptly without ramping its `GainNode` to near-zero (`0.0001`) creates an audible high-frequency pop at the end of every beep.
- **No Adaptive Ambient Soundscape**: The match plays in dead silence between button clicks, missing the opportunity for a clinical telemetry pulse and subtle ambient synth pad that shifts with player vitals.

### Upgraded Audio Architecture in `patches/cardiopoly_script_patches.js`
1. **Click-Free ADSR Envelope Helper (`playEnvelopedTone`)**:
   - Uses `gain.setValueAtTime(0.0001, now)`, linear attack ramp (`+12ms`), exponential decay to sustain, and exponential release (`0.0001`) before `osc.stop()`, routed through a `BiquadFilterNode` (`lowpass` at `2400 Hz`) to eliminate harsh digital aliasing.
2. **Polyphonic Event Cues**:
   - `diceRoll`: Rapid pitched marimba-style Woodblock arpeggio (`320 Hz -> 480 Hz -> 640 Hz`).
   - `suitePurchase`: Warm major triad chime (`C5 - E5 - G5 - C6`).
   - `gdmtSelected`: Evidence-based harmonic cadence (`F4 - A4 - C5 - E5`).
   - `invasiveCath`: High-energy procedural sweep + defibrillator charge whine.
   - `auditClawback` / `codeBlueAlert`: Dual-tone hospital telemetry alarm (`880 Hz / 660 Hz` alternating pulse).
3. **Adaptive Clinical Ambient Loop (`startAdaptiveHospitalAmbience`)**:
   - Generates a subtle, low-volume (`gain: 0.035`) procedural hospital monitor pulse and warm low-pass synth drone whose tempo and harmonic tension automatically adapt to the active player's `SBP`:
     - `SBP < 145`: Calm `72 BPM` soft sine monitor blip + C-major9 pad.
     - `145 <= SBP < 175`: Elevated `108 BPM` amber monitor pulse + D-minor7 tension pad.
     - `SBP >= 175`: Urgent `144 BPM` pre-Code-Blue telemetry double-beep.

## 2. Multimodal Synchronization Matrix
Every major game event triggers a coordinated **Visual + Audio + HUD** response via `triggerMultimodalEvent()`:

| Game Event | Visual Board / Modal Cue | Procedural Audio Cue | Telemetry & HUD Response |
| :--- | :--- | :--- | :--- |
| **Token Movement Step** | `.player-token.is-hopping` scale bounce (`90ms`/tile) | Soft pitched woodblock tick (`280 Hz + step*18 Hz`) | Magnified View smoothly tracks current tile |
| **GDMT Vignette Choice** | Emerald floating badge (`+15 GDMT`, `-50 WP`) | Warm major-7th clinical resolution chord | ECG trace glows `#10b981` (Normal Sinus Rhythm) |
| **Invasive Cath / Stent** | Cyan/Amber floating badge (`+1,800 RVU`, `+750 WP`) | Cath-lab fluoroscopy turbine hum + register chime | RVU counter flashes + audit exposure meter ticks up |
| **Hypertensive Crisis (`SBP >= 175`)** | Subtle red vignette pulse on active player card | Dual-tone ICU telemetry warning beep | ECG trace shifts to `#ef4444` with NSVT waveform runs |
| **Code Blue (`SBP >= 200` / `BMI >= 70`)** | Screen shake (`350ms`) + M&M Hospitalization banner | Urgent Code Blue triad alarm | Player token warps to `#10 M&M` with bail readout |
