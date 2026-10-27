# Code Blue Urgency Overhaul & Global Interaction Freeze Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the Cardiopoly Code Blue emergency event into an intensely urgent multimodal experience (preloaded high-motion video, dynamic V-Fib ECG canvas, GMSBS -8 LUFS procedural defibrillator audio chain, and red alarm room strobe) while implementing a centralized interaction freeze that suspends active auction timers and bot turns to prevent background race conditions.

**Architecture:** 
1. Centralized `freezeEmergencyState()` / `unfreezeEmergencyState()` in `script.js` that atomically pauses `gameState.activeAuction` countdown/bot bids, clears `gameState.botTurnTimeout`, and locks player inputs until resuscitation is acknowledged.
2. Procedural Web Audio API Defibrillator Chain in `patches/cardiopoly_script_patches.js` adhering to GMSBS Layer 4 ($-8\text{ LUFS}$) with $-18\text{ dB}$ sidechain ducking.
3. Upgraded `CutInOverlayManager` in `patches/cardiopoly_mcp_runtime_bridge.js` with dynamic 4-phase V-Fib canvas telemetry, video playback assurance (`.play()`), and room perimeter red strobe (`.code-blue-crisis-strobe`).
4. Re-rendered high-motion Code Blue MP4/WebM video asset via `ffmpeg`.
5. Comprehensive test verification via EPAP-15 15-scene runner (`tools/playthrough_audit_all_scenes.js`) and dedicated concurrency unit tests.

**Tech Stack:** Vanilla JavaScript (ES2022), Web Audio API, HTML5 Canvas 2D, CSS3 Animations, Node.js Test Runners, FFmpeg 9.0.

---

### Task 1: TDD Test Suite for Emergency Interaction Freeze

**Files:**
- Create: `tests/emergency_freeze.test.js`

**Step 1: Write the failing test**
Create `tests/emergency_freeze.test.js` with comprehensive assertions:
- Test 1: Auction clock and bot bids freeze immediately when `freezeEmergencyState()` is called.
- Test 2: Auction clock does not decrement and bots place 0 bids while `isEmergencyFrozen` is true.
- Test 3: `unfreezeEmergencyState()` restores remaining seconds and resumes clock and bidding.
- Test 4: Bot turn timeouts are cleared during freeze and re-queued upon unfreeze.

```javascript
// tests/emergency_freeze.test.js
const assert = require('assert');

// Mock DOM
global.document = {
  getElementById: (id) => {
    if (id === 'auction-modal') return { classList: { add: () => {}, remove: () => {} }, querySelector: () => null };
    if (id === 'auction-paused-banner') return null;
    return null;
  },
  createElement: () => ({ classList: { add: () => {}, remove: () => {} }, style: {} }),
  body: { classList: { add: () => {}, remove: () => {} } }
};

// Test implementation will verify freezeEmergencyState and unfreezeEmergencyState
console.log('Testing Emergency Freeze & Auction Suspension...');
```

**Step 2: Run test to verify it fails**
Run: `node tests/emergency_freeze.test.js`
Expected: FAIL (functions not yet defined or implemented).

**Step 3: Implement minimal mock and assertions**
Complete `tests/emergency_freeze.test.js` so it cleanly imports or defines the contract for `freezeEmergencyState` and `unfreezeEmergencyState`.

**Step 4: Run test to verify it passes against test harness**
Run: `node tests/emergency_freeze.test.js`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/emergency_freeze.test.js
git commit -m "test: add TDD unit test suite for emergency state interaction freeze"
```

---

### Task 2: Implement `freezeEmergencyState` & `unfreezeEmergencyState` in `script.js`

**Files:**
- Modify: `script.js:2510-2560` (finishPlayerTurn Code Blue trigger)
- Modify: `script.js:3410-3440` (startLiveAuction interval handlers)
- Modify: `script.js:2210-2240` (options pause / resume handling)

**Step 1: Implement `freezeEmergencyState` and `unfreezeEmergencyState`**
Add the functions to `script.js`:
- `freezeEmergencyState(reason)`:
  - If `gameState.activeAuction`: stores `clockSeconds`, calls `clearInterval(clockIntervalId)` and `clearInterval(botBidIntervalId)`, sets `gameState.activeAuction.isEmergencyFrozen = true`.
  - Injects or unhides `#auction-paused-banner` inside `#auction-modal`.
  - Calls `clearTimeout(gameState.botTurnTimeout)` and flags `gameState.botTurnPending = true`.
  - Sets `gameState.isEmergencyPaused = true`.
  - Disables `#roll-btn` and adds `.emergency-locked` to board.
- `unfreezeEmergencyState(reason)`:
  - If `gameState.activeAuction && gameState.activeAuction.isEmergencyFrozen`: restores countdown clock using stored `clockSeconds`, restarts `botBidIntervalId`, clears `isEmergencyFrozen`, and removes `#auction-paused-banner`.
  - If `gameState.botTurnPending`: clears pending flag and sets `gameState.botTurnTimeout = setTimeout(..., 450)`.
  - Sets `gameState.isEmergencyPaused = false`.
  - Re-enables `#roll-btn` and removes `.emergency-locked`.

**Step 2: Hook into `finishPlayerTurn`**
- Call `freezeEmergencyState("CODE_BLUE")` right before `CardiopolyMcpBridge.cutInOverlay.playCutIn`.
- Call `unfreezeEmergencyState("CODE_BLUE")` inside `showEventPopupModal` resolution callback (and inside bot toast timeout).

**Step 3: Run unit and integration tests**
Run: `node tests/emergency_freeze.test.js`
Run: `node tests/patch_verification.test.js`
Run: `node tests/master_rebuild.test.js`
Expected: ALL PASS.

**Step 4: Commit**
```bash
git add script.js
git commit -m "feat(engine): implement freezeEmergencyState and unfreezeEmergencyState to prevent auction and bot race conditions"
```

---

### Task 3: Procedural GMSBS Defibrillator Audio Chain

**Files:**
- Modify: `patches/cardiopoly_script_patches.js`
- Test: `tests/patch_verification.test.js`

**Step 1: Implement `playDefibrillatorSequence()` adhering to GMSBS Layer 4**
In `patches/cardiopoly_script_patches.js`:
- Check audio context: warmup or resume if suspended.
- Sidechain ducking: call `duckSoundtrack(5500)` driving background volume to $-18\text{ dB}$ ($0.125\times$).
- Step 1 ($t = 0.0\text{s}$): Paging dual-tone chime ($880\text{ Hz} \to 587\text{ Hz}$ sine, $180\text{ ms}$ each).
- Step 2 ($t = 0.5\text{s} - 2.5\text{s}$): Capacitor charge whine: ascending oscillator from $220\text{ Hz}$ to $2400\text{ Hz}$ with linear gain ramp.
- Step 3 ($t = 2.5\text{s}$): High-frequency alert double blip ($1760\text{ Hz}$).
- Step 4 ($t = 3.2\text{s}$): Shock discharge thump: $45\text{ Hz}$ sine burst ($0.8$ peak) combined with bandpass filtered white noise burst ($120\text{ ms}$ decay).
- Step 5 ($t = 4.0\text{s} - 5.5\text{s}$): Sinus pulse blips at $72\text{ BPM}$.
- Anti-aliasing envelope: all gains scheduled with `cancelScheduledValues` and $t_{attack} \ge 12\text{ ms}$, $\tau_{rel} \ge 40\text{ ms}$.

**Step 2: Run audio test verification**
Run: `node tests/patch_verification.test.js`
Expected: PASS.

**Step 3: Commit**
```bash
git add patches/cardiopoly_script_patches.js
git commit -m "feat(audio): implement GMSBS Layer 4 procedural defibrillator sound chain with sidechain ducking"
```

---

### Task 4: Dynamic V-Fib Canvas & Video Cut-In Strobe Overlay

**Files:**
- Modify: `patches/cardiopoly_mcp_runtime_bridge.js`
- Modify: `styles.css`
- Test: `tests/dom_macro_cutin.test.js`

**Step 1: Update `CutInOverlayManager` in `patches/cardiopoly_mcp_runtime_bridge.js`**
- Add dynamic V-Fib `<canvas class="cutin-vfib-canvas" width="640" height="90">` into `mediaMarkup`.
- Launch a 60 FPS animation loop on the canvas during Code Blue:
  - $0.0\text{s} - 2.0\text{s}$: High-frequency chaotic V-Fib waveform with red glow.
  - $2.0\text{s} - 3.2\text{s}$: Flatline asystole with steady alert tone line.
  - $3.2\text{s} - 3.6\text{s}$: Massive defibrillator shock spike artifact and screen flash.
  - $3.6\text{s} - 5.5\text{s}$: Clean Sinus Rhythm (P-QRS-T) recovery in emerald green (`#10b981`).
- Assure `<video class="cutin-video">` autoplay by explicitly attaching `videoEl.play().catch(...)` on DOM injection.
- Add `document.body.classList.add('code-blue-crisis-strobe')` on trigger and remove upon overlay dismissal.

**Step 2: Add CSS rules in `styles.css`**
- `.code-blue-crisis-strobe`: Fullscreen radial vignette pulsing at 1.8 Hz with emergency crimson illumination (`rgba(239, 68, 68, 0.35)`).
- `.cutin-vfib-canvas`: Positioned at the bottom of `.cutin-media-container` with CRT scanlines and phosphor glow.
- `.auction-paused-warning`: Amber glowing pill banner (`AUCTION PAUSED // CODE BLUE EMERGENCY`).

**Step 3: Run DOM cut-in verification tests**
Run: `node tests/dom_macro_cutin.test.js`
Expected: PASS.

**Step 4: Commit**
```bash
git add patches/cardiopoly_mcp_runtime_bridge.js styles.css
git commit -m "feat(ui): add dynamic V-Fib telemetry canvas, video autoplay assurance, and emergency strobe"
```

---

### Task 5: Re-Render High-Motion Code Blue Video Snippet via FFmpeg

**Files:**
- Modify: `assets/video/cutins/code_blue.mp4`
- Modify: `assets/video/cutins/code_blue.webm`
- Script: `tools/render_code_blue_urgent_video.js`

**Step 1: Create automated video generator script**
- In `tools/render_code_blue_urgent_video.js`, generate a 5.5-second sequence using FFmpeg filters:
  - Base image: `assets/images/cutins/code_blue.jpg`
  - High-frequency emergency red flash filter (`geq` / `colorchannelmixer` strobe)
  - Zoom-in / camera shake pulses synchronized with chest compressions (100-120 CPM)
  - Defibrillator electrical discharge bright white burst at $t = 3.2\text{s}$
- Encode to both fast-start MP4 (`-movflags +faststart`) and WebM (`libvpx-vp9` / `vp8`).

**Step 2: Execute script and verify file integrity**
Run: `node tools/render_code_blue_urgent_video.js`
Verify: `ffprobe assets/video/cutins/code_blue.mp4` shows valid video stream with fast-start tags.

**Step 3: Commit**
```bash
git add assets/video/cutins/code_blue.mp4 assets/video/cutins/code_blue.webm tools/render_code_blue_urgent_video.js
git commit -m "asset(cutin): re-render high-motion Code Blue defibrillation video cut-in with compression pulses"
```

---

### Task 6: EPAP-15 Comprehensive 15-Scene QA Audit & Full Suite Run

**Files:**
- Modify: `tools/playthrough_audit_all_scenes.js`
- Output: `tests/exhaustive_playthrough_report.json`

**Step 1: Update EPAP-15 Scene 9 and Scene 7 in `tools/playthrough_audit_all_scenes.js`**
- Scene 7 (Live Auctions): Assert auction clock is frozen during simultaneous emergency trigger and resumes cleanly.
- Scene 9 (Code Blue): Assert room strobe class, V-Fib canvas rendering, defib audio sequence execution, and vitals reset.

**Step 2: Run all test suites**
Run: `node tests/emergency_freeze.test.js`
Run: `node tests/patch_verification.test.js`
Run: `node tests/master_rebuild.test.js`
Run: `node tests/mcp_runtime_bridge.test.js`
Run: `node tests/dom_macro_cutin.test.js`
Run: `node tools/playthrough_audit_all_scenes.js`

**Step 3: Verify EPAP-15 report**
Verify `tests/exhaustive_playthrough_report.json` reports `15/15` scenes `PASSED` (0 failures).

**Step 4: Commit and Push**
```bash
git add .
git commit -m "test(epap-15): verify Code Blue emergency overhaul and auction suspension across all 15 scenes"
git push origin main
git push origin main:gh-pages
```

---

### Execution Handoff
This plan is ready for systematic execution using **superpowers:executing-plans** or subagent-driven development.
