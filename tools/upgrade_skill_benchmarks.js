const fs = require('fs');
const path = require('path');

const workspaceSkill = path.resolve('c:/Users/lauye/Downloads/cardiopoly/.agents/skills/game-development/SKILL.md');
const globalSkill = path.resolve('C:/Users/lauye/.gemini/config/skills/game-gradient-booster/SKILL.md');

const newContent = [
  "",
  "---",
  "",
  "### 10. Image Integrity & Non-Distortion Benchmark (IINDB)",
  "",
  "Production games must never display stretched, torn, clipped, or corrupted graphics across differing screen geometries (desktop, tablet, mobile portrait/landscape). The **IINDB Standard** guarantees that all in-game image assets and stacked presentation planes render completely and seamlessly without distortion artifacts.",
  "",
  "#### 1. Dual-Plane Geometric Pinning Law ($S_{pin}$)",
  "- When a raster poster (`<img class=\"cutin-poster\">`) and a video stream (`<video class=\"cutin-video\">`) or canvas layer coexist inside a dual-plane container (`.cutin-media-container`), both elements must share identical absolute geometric bounding boxes:",
  "  ```css",
  "  .cutin-poster,",
  "  .cutin-video {",
  "    position: absolute;",
  "    inset: 0;",
  "    width: 100%;",
  "    height: 100%;",
  "    max-height: none;",
  "    object-fit: cover;",
  "    display: block;",
  "  }",
  "  .cutin-poster { z-index: 1; }",
  "  .cutin-video  { z-index: 2; }",
  "  ```",
  "- **Zero Flow Clipping Invariant:** Under no circumstances may an inner media layer rely on `position: relative` with `height: 100%` inside an `aspect-ratio: 16/9` container, as mobile WebKit/Blink resolves relative percentage heights against implicit container heights, causing partial flow wrapping and horizontal split/tear artifacts across the screen.",
  "",
  "#### 2. Uniform Aspect Ratio & Boundary Fit Standard ($AR_{fit}$)",
  "- Cut-in and cinematic modal artwork must strictly conform to a 16:9 ratio ($1.77 \\pm 0.05$).",
  "- Character avatars and centerpiece emblems must conform to 1:1 ($1.00 \\pm 0.01$).",
  "- Scale distortion tolerance: $S_x = S_y = 1.0 \\pm 0.02$. Anisotropic scaling (stretching) is strictly forbidden.",
  "",
  "#### 3. Pixel Continuity & Shear Discontinuity Scan ($D_{tear}$)",
  "- Every generated or imported raster asset must pass an automated inter-row gradient scan:",
  "  $$D_{tear}(y) = \\frac{1}{W} \\sum_{x=1}^{W} \\|\\mathbf{P}(x, y) - \\mathbf{P}(x, y+1)\\|$$",
  "- For clean illustrations and photographs, the maximum inter-row discontinuity must satisfy:",
  "  $$D_{tear}(y) \\le 32.0 \\quad \\forall y \\in [10, H-10]$$",
  "- Any spike ($D_{tear} > 32$) indicates an artificial horizontal splice, missing canvas tile, or broken buffer blit.",
  "",
  "#### 4. Zero-Broken-Asset Guarantee",
  "- All images must contain valid format headers (e.g. JPEG SOI `0xFF 0xD8`, PNG signature `0x89 0x50 0x4E 0x47`).",
  "- If a remote asset fails to load over network or offline mode, the engine must immediately fall back to a local pre-rendered asset or procedural CRT phosphor canvas with zero unhandled promise rejections.",
  "",
  "---",
  "",
  "### 11. Video Performance & Engagement Benchmark (VPEB)",
  "",
  "Video cut-ins must never feel like static screenshots or cause mobile browser lag. The **VPEB Standard** enforces both low-latency technical playback metrics and high-intensity cinematic engagement.",
  "",
  "#### 1. Technical Playback Performance Standards",
  "1. **Time to First Frame Bound ($\\tau_{TTFF}$):**",
  "   $$\\tau_{TTFF} \\le 120\\text{ ms}$$",
  "   - **Fast-Start MP4 Requirement:** All MP4 video containers must be encoded with the `moov` metadata atom positioned at the beginning of the file (before the `mdat` media atom) via FFmpeg `-movflags +faststart`. This enables instant playback streaming on mobile devices without waiting for the full file to download.",
  "2. **Mobile Autoplay Readiness Index ($ARI_{mob}$):**",
  "   - Every `<video>` element must include the complete quad-attribute configuration: `autoplay`, `muted`, `loop`, `playsinline`, `webkit-playsinline`, and `preload=\"auto\"`.",
  "   - JavaScript bridge must enforce programmatic `videoEl.muted = true` before invoking `videoEl.play()`.",
  "3. **Dual-Stream Redundancy Protocol:**",
  "   - Every cut-in preset must provide parallel H.264 MP4 and VP8 WebM sources, allowing instant hardware-accelerated playback across Safari/iOS, Android Chrome, and desktop environments.",
  "4. **Seamless Zero-Flicker Failover ($\\tau_{failover} = 0\\text{ ms}$):**",
  "   - If mobile Low Power Mode or data-saver blocks video autoplay (`video.play().catch(...)`), the underlying poster image remains seamlessly visible with zero flash of black or broken video icon.",
  "",
  "#### 2. Video Engagement Index ($E_{vid}$)",
  "A cut-in video must exhibit visceral, dynamic motion that immediately communicates urgency and consequence. Static camera pans (e.g. a 2-pixel-per-second Ken Burns zoom) score $E_{vid} < 0.30$ and fail this benchmark.",
  "",
  "The composite **Video Engagement Index ($E_{vid}$)** is defined as:",
  "$$E_{vid} = 0.40 \\cdot M_{vec} + 0.25 \\cdot L_{dyn} + 0.20 \\cdot S_{trans} + 0.15 \\cdot A_{sync} \\ge 0.75$$",
  "",
  "Where:",
  "- **Kinematic Motion Vector Density ($M_{vec} \\ge 0.35$):**",
  "  Normalized inter-frame pixel delta across time:",
  "  $$M_{vec} = \\min\\left(1.0, \\frac{1}{20 \\cdot T} \\sum_{t=1}^{T} \\frac{1}{W \\cdot H} \\sum_{x,y} |P(x,y,t) - P(x,y,t-1)|\\right)$$",
  "  Requires active intra-frame movement (CPR chest heaving at 1.8 Hz, pulsed cine-fluoroscopy strobing at 3.0 Hz, scanning radar beams, document slam vibrations).",
  "- **Dynamic Lighting Modulation ($L_{dyn} \\ge 0.70$):**",
  "  Periodic luminosity and contrast oscillation simulating emergency beacons, X-ray tubes, or alarm strobes.",
  "- **Dramatic Narrative Transient ($S_{trans} \\ge 0.80$):**",
  "  At least one high-impact keyframe event per cut-in sequence:",
  "  - *Code Blue:* Defibrillation electrical discharge flash ($t = 3.2\\text{s}$).",
  "  - *Cath Lab:* Stent balloon dilation bloom & radial contrast flare ($t = 2.5\\text{s}$).",
  "  - *Regulatory Audit:* Ministry clawback stamp camera slam & document shake ($t = 1.35\\text{s}$).",
  "- **Audio-Visual Transient Synchrony ($A_{sync}$):**",
  "  Visual transient onset must synchronize with Web Audio API sound cue stingers within $\\Delta t_{AV} \\le 16.7\\text{ ms}$ (1 video frame at 60 FPS).",
  ""
].join('\n');

const newChecklist = [
  "## QA Verification Checklist",
  "",
  "Before completing any game optimization task, verify all 14 gates:",
  "",
  "- [ ] **Gate 1 (Stability & Data Binding)**: All setup and HUD selectors display valid numbers and strings; zero instances of `undefined`, `NaN`, or truncated labels.",
  "- [ ] **Gate 2 (Audio & Music)**: Clicking sound toggles resumes `AudioContext` without error, plays click-free ADSR polyphonic chimes, and starts the adaptive tension ambient loop.",
  "- [ ] **Gate 3 (Multimodal Synchronization)**: Major game actions simultaneously trigger their visual cue, audio chime, and HUD/telemetry delta update within $\\le 16.7\\text{ms}$.",
  "- [ ] **Gate 4 (Visual Layout)**: Interactive modals fit within `88vh` with responsive multi-column buttons; perimeter tiles display cost badges, owner border glow, and upgrade pips.",
  "- [ ] **Gate 5 (Gameplay Synergies)**: Cross-system synergies and delayed consequence events fire reliably based on property ownership and prior decisions.",
  "- [ ] **Gate 6 (Persistence)**: Lifetime achievements, trials, and faction statistics load and persist cleanly in `localStorage`.",
  "- [ ] **Gate 7 (MCP Live World & Ticker)**: Top breaking-news macro ticker renders on turn 1 and rotates every 4 turns, applying real modifiers to costs and GDMT points.",
  "- [ ] **Gate 8 (Cut-In Overlay & Offline Fallback)**: High-stakes events trigger the 5.5s dramatic cut-in overlay with zero broken media icons or unhandled promise rejections on static GitHub Pages.",
  "- [ ] **Gate 9 (Exhaustive All-Scene Audit Gate - EPAP-15)**: Automated 15-scene traversal script passes with 15/15 scenes verified, 0 assertions failed, 0 unhandled promise rejections, and emits `tests/exhaustive_playthrough_report.json`.",
  "- [ ] **Gate 10 (Sound & Music Benchmarking Gate - GMSBS)**: Audio architecture conforms to EBU R128 LUFS specifications (Ambience $-18\\text{ LUFS}$, UI $-14\\text{ LUFS}$, Stingers $-12\\text{ LUFS}$, Alarms $-8\\text{ LUFS}$), click-free ADSR anti-aliasing envelopes ($t_{attack} \\ge 12\\text{ms}$), dynamic acoustic ducking on cut-ins/modals, and adaptive harmonic tension scaling.",
  "- [ ] **Gate 11 (Cut-In Video Autoplay & Media Resilience Gate - VC-PRB)**: Verifies that all cut-in presets have valid video/poster sources, MP4 faststart headers, mobile playsinline attributes, and zero bare/static placeholders.",
  "- [ ] **Gate 12 (Interaction Flow & State Suspension Gate - IFSRS)**: Verifies that triggering high-severity events halts auction clocks and bot timers without race conditions, and resumes with 100% time integrity.",
  "- [ ] **Gate 13 (Image Integrity & Non-Distortion Gate - IINDB)**: Verifies that all visual media conforms to 16:9 / 1:1 aspect ratio invariants, passes the $D_{tear} < 32$ pixel continuity gradient scan, and enforces CSS absolute geometric pinning (`inset: 0; width: 100%; height: 100%; object-fit: cover; max-height: none;`) so no horizontal tear or split can ever occur.",
  "- [ ] **Gate 14 (Video Performance & Engagement Gate - VPEB)**: Verifies fast-start MP4 header layout (`moov` before `mdat`), mobile autoplay quad-attributes, dual-stream availability (MP4 + WebM), kinematic motion vector density $M_{vec} \\ge 0.35$, and video engagement index $E_{vid} \\ge 0.75$."
].join('\n');

function updateSkill(skillPath) {
  if (!fs.existsSync(skillPath)) {
    console.error('File not found: ' + skillPath);
    return;
  }
  let txt = fs.readFileSync(skillPath, 'utf8').replace(/\r\n/g, '\n');
  if (txt.includes('Image Integrity & Non-Distortion Benchmark (IINDB)')) {
    console.log('Skill already updated: ' + skillPath);
    return;
  }

  const checklistIndex = txt.indexOf('## QA Verification Checklist');
  if (checklistIndex === -1) {
    console.error('Could not find checklist in ' + skillPath);
    return;
  }

  const beforeChecklist = txt.slice(0, checklistIndex);
  const updatedTxt = beforeChecklist + newContent + '\n' + newChecklist + '\n';
  fs.writeFileSync(skillPath, updatedTxt, 'utf8');
  console.log('✓ Successfully upgraded ' + skillPath);
}

updateSkill(workspaceSkill);
try {
  updateSkill(globalSkill);
} catch (e) {
  console.log('Global skill notice: ' + e.message);
}
