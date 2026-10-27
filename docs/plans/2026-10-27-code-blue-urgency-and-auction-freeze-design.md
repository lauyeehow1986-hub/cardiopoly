# Technical Design: Code Blue Emergency Overhaul & Global Interaction Freeze

**Date:** 2026-10-27  
**Status:** Approved  
**Framework:** Gradient-Boosted Game Development Framework (GMSBS / PSDPBS-5 & EPAP-15)  

---

## 1. Problem Statement & Motivation
During clinical gameplay in *Cardiopoly*, crossing critical vital thresholds (`SBP >= 200 mmHg` or `BMI >= 70 kg/m²` in Clinical Mastery) triggers a **Code Blue Hospitalization**. 

Two distinct deficiencies were identified in production:
1. **Lack of Visual & Acoustic Urgency:** The current cut-in displayed a static image (or slow canvas pan) followed by a standard dialog popup. It lacked high-energy motion, synchronized defibrillation acoustics, hospital paging voiceover, and room-wide emergency lighting.
2. **Background Action Interference (Race Conditions):** When Code Blue occurred while a live unowned property auction was running (`gameState.activeAuction`) or while bot turns were queued (`gameState.botTurnTimeout`), asynchronous intervals continued executing in the background. The auction clock would expire behind the emergency modal, bots would place bids unseen, and state updates clashed.

---

## 2. Proposed Architecture & Solution

### 2.1 Multimodal Urgency Architecture (GMSBS Layer 4)
When Code Blue activates, a synchronized 4-component audio-visual sequence executes:

1. **Room Perimeter Red Alarm Strobe (`.code-blue-crisis-strobe`):**
   - Injected into `document.body` for the duration of the emergency.
   - Pulsing 1.8 Hz emergency red perimeter glow with CRT scanline flicker.
2. **Preloaded 5.5s Animated Resuscitation Video Cut-In:**
   - Preloaded via `<link rel="preload" as="video">` for instant playback.
   - Features animated chest compressions, defibrillator paddles, and emergency CCU lighting.
   - Dual-source fallback: `assets/video/cutins/code_blue.webm` and `assets/video/cutins/code_blue.mp4`.
3. **Dynamic Ventricular Fibrillation (V-Fib) Telemetry Canvas:**
   - Real-time animated canvas waveform mounted directly over the cut-in card.
   - Transitions through 4 clinical phases:
     - *Phase 1 (0.0s – 2.0s):* Chaotic high-frequency Ventricular Fibrillation (V-Fib).
     - *Phase 2 (2.0s – 3.2s):* Ventricular flatline (asystole) during paddle charging.
     - *Phase 3 (3.2s – 3.8s):* Electrical defibrillation flash artifact.
     - *Phase 4 (3.8s – 5.5s):* Sinus bradycardia / normal rhythm recovery.
4. **Procedural Web Audio Defibrillator Chain & Voiceover:**
   - **GMSBS Loudness:** Master output calibrated to $-8.0 \pm 1.0\text{ LUFS}$.
   - **Sidechain Music Ducking:** Background soundtrack immediately ducks by $-18\text{ dB}$ ($0.125\times$) over $120\text{ ms}$.
   - **5-Step Procedural Audio Chain:**
     1. *Hospital Paging Alert:* Dual-frequency chime ($880\text{ Hz} \to 587\text{ Hz}$) + automated PA prompt (*"Code Blue: CCU Resuscitation in progress"*).
     2. *Capacitor Charge Whine:* Exponential ramp ($220\text{ Hz} \to 2400\text{ Hz}$) over $2.0\text{s}$.
     3. *Discharge Alert Tone:* High-frequency staccato pulses at $1760\text{ Hz}$ (*"All Clear"*).
     4. *Defibrillator Shock Discharge:* Sub-bass resonant thump ($45\text{ Hz}$ sine burst + bandpass filtered white noise burst).
     5. *Restored Sinus Monitor Pulse:* Steady $72\text{ BPM}$ sinus blip.

---

### 2.2 Global Interaction Freeze & Background Action Pause System
To prevent auction countdown leaks and bot turn collisions, a centralized freeze/resume lifecycle is introduced:

```
                  [Code Blue Triggered]
                            │
                            ▼
               [freezeEmergencyState()]
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[Freeze Auction Clock]  [Cancel Bot Timer]  [Lock User Inputs]
- Store clockSeconds    - clearTimeout      - Disable #roll-btn
- clearInterval(clock)  - Set pending flag  - Block tile inspect
- clearInterval(bids)                       - Set isEmergencyPaused
- Show "PAUSED" banner
                            │
                            ▼
            [Emergency Cut-In & Modal Display]
                            │
                            ▼
          [User Clicks "Acknowledge Resuscitation"]
                            │
                            ▼
              [unfreezeEmergencyState()]
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[Resume Auction Clock]  [Reschedule Bot]    [Unlock User Inputs]
- Restore clockSeconds  - setTimeout(450ms) - Enable #roll-btn
- Restart intervals     - Clear pending     - Clear isEmergencyPaused
- Remove PAUSED banner                      - Restore music (800ms)
```

#### State Invariants:
- `gameState.isEmergencyPaused === true` while Code Blue modal or cut-in is active.
- If `gameState.activeAuction` exists during Code Blue, `gameState.activeAuction.isEmergencyFrozen === true`.
- Zero auction timer ticks or bot bids may occur while `isEmergencyFrozen` is true.
- Upon unfreezing, auction concludes only after remaining `clockSeconds` reach `0.0s`.

---

## 3. EPAP-15 QA Verification Matrix

| Scene / Test | Target Behavior | Verification Criteria |
| :--- | :--- | :--- |
| **S07: Live Auctions** | Auction running when Code Blue occurs | Clock stops at exact second; zero bids emitted while frozen; resumes smoothly upon dismissal. |
| **S09: Code Blue Emergency** | Player crosses SBP 200 or BMI 70 | `.code-blue-crisis-strobe` active; video/canvas V-Fib plays; defib audio chain executes; vitals reset to 140/35. |
| **GMSBS Audio Benchmarking** | Volume ducking & loudness compliance | Background music ducks $-18\text{ dB}$; procedural audio peaks at $-8.0\text{ LUFS}$; zero DC offset clicks. |
| **EPAP-15 Full Suite** | 15-scene automated runner | All 15 scenes pass with 0 failures in `tests/exhaustive_playthrough_report.json`. |

---

## 4. Implementation Steps
1. **Step 1:** Implement `freezeEmergencyState()` and `unfreezeEmergencyState()` in `script.js` and hook into `finishPlayerTurn` and auction timers.
2. **Step 2:** Upgrade `CutInOverlayManager` in `patches/cardiopoly_mcp_runtime_bridge.js` to render the dynamic V-Fib canvas overlay, video autoplay assurance, and emergency strobe.
3. **Step 3:** Implement procedural defibrillator audio chain (`playDefibrillatorSequence`) in `patches/cardiopoly_script_patches.js` adhering to GMSBS $-8\text{ LUFS}$.
4. **Step 4:** Re-encode / generate high-motion animated Code Blue cut-in video snippet (`assets/video/cutins/code_blue.mp4` / `.webm`).
5. **Step 5:** Add regression test suite for concurrent auction + Code Blue freeze in `tests/master_rebuild.test.js` and `tests/patch_verification.test.js`.
6. **Step 6:** Run full EPAP-15 audit runner (`tools/playthrough_audit_all_scenes.js`) and verify all 15 scenes pass.
