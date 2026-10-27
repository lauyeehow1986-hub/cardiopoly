const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'assets', 'images');
const CUTINS_DIR = path.join(IMAGES_DIR, 'cutins');
const STYLES_PATH = path.join(ROOT_DIR, 'styles.css');
const BRIDGE_PATH = path.join(ROOT_DIR, 'patches', 'cardiopoly_mcp_runtime_bridge.js');

console.log('================================================================');
console.log('  TEST SUITE: IMAGE INTEGRITY & NON-DISTORTION BENCHMARK (IINDB)');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST 1: Image Asset Existence & Completeness
// -------------------------------------------------------------
console.log('--- TEST 1: Image Asset Existence & Completeness ---');
const targetImages = [
  path.join(CUTINS_DIR, 'code_blue.jpg'),
  path.join(CUTINS_DIR, 'cath_lab.jpg'),
  path.join(CUTINS_DIR, 'regulatory_audit.jpg'),
  path.join(IMAGES_DIR, 'cardiopoly_centerpiece_remastered.jpg')
];

for (const imgPath of targetImages) {
  assert(fs.existsSync(imgPath), `Image file must exist: ${imgPath}`);
  const stat = fs.statSync(imgPath);
  assert(stat.size > 20000, `Image file size must be substantial (>20KB): ${stat.size} bytes`);

  // Verify JPEG header SOI (0xFF, 0xD8)
  const fd = fs.openSync(imgPath, 'r');
  const headerBuf = Buffer.alloc(2);
  fs.readSync(fd, headerBuf, 0, 2, 0);
  fs.closeSync(fd);
  assert.strictEqual(headerBuf[0], 0xff, `JPEG SOI byte 0 must be 0xFF: ${imgPath}`);
  assert.strictEqual(headerBuf[1], 0xd8, `JPEG SOI byte 1 must be 0xD8: ${imgPath}`);
  console.log(`✓ Image verified: ${path.basename(imgPath)} (${stat.size} bytes, valid JPEG SOI)`);
}

// -------------------------------------------------------------
// TEST 2: Aspect Ratio Uniformity & Geometric Invariance
// -------------------------------------------------------------
console.log('\n--- TEST 2: Aspect Ratio Uniformity & Geometric Invariance ---');
for (const imgPath of targetImages.slice(0, 3)) {
  const probe = execSync(`ffprobe -v error -show_entries stream=width,height -of csv=p=0 "${imgPath}"`).toString().trim();
  const [w, h] = probe.split(',').map(Number);
  assert(w >= 640 && h >= 360, `Cutin image dimensions must be >= 640x360: got ${w}x${h}`);
  const ratio = w / h;
  const expectedRatio = 16 / 9; // ~1.777
  assert(Math.abs(ratio - expectedRatio) < 0.05, `Cutin image aspect ratio must be ~16:9: got ${ratio.toFixed(3)} for ${path.basename(imgPath)}`);
  console.log(`✓ Aspect ratio verified: ${path.basename(imgPath)} is ${w}x${h} (Ratio ${ratio.toFixed(3)} ≈ 16:9)`);
}

// Centerpiece 1:1 check
const cpProbe = execSync(`ffprobe -v error -show_entries stream=width,height -of csv=p=0 "${targetImages[3]}"`).toString().trim();
const [cpW, cpH] = cpProbe.split(',').map(Number);
assert(cpW === cpH, `Centerpiece must be 1:1 square: got ${cpW}x${cpH}`);
console.log(`✓ Centerpiece 1:1 ratio verified: ${cpW}x${cpH}`);

// -------------------------------------------------------------
// TEST 3: Pixel Continuity & Tear/Shear Non-Distortion Scan (D_tear)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Pixel Continuity & Tear/Shear Non-Distortion Scan (D_tear) ---');
// Extract raw 640x360 RGB stream and verify that there is no abrupt horizontal shear tear across rows
for (const imgPath of targetImages.slice(0, 3)) {
  const rawBuf = execSync(`ffmpeg -v error -y -i "${imgPath}" -vf "scale=320:180" -pix_fmt rgb24 -f rawvideo -`);
  const W = 320;
  const H = 180;
  let maxRowJump = 0;
  let maxJumpRow = 0;

  for (let y = 10; y < H - 10; y++) {
    let diff = 0;
    for (let x = 15; x < W - 15; x++) {
      const idx1 = (y * W + x) * 3;
      const idx2 = ((y + 1) * W + x) * 3;
      diff += Math.abs(rawBuf[idx1] - rawBuf[idx2]) +
              Math.abs(rawBuf[idx1 + 1] - rawBuf[idx2 + 1]) +
              Math.abs(rawBuf[idx1 + 2] - rawBuf[idx2 + 2]);
    }
    const avgDiff = diff / ((W - 30) * 3);
    if (avgDiff > maxRowJump) {
      maxRowJump = avgDiff;
      maxJumpRow = y;
    }
  }

  // An abrupt artificial tear/shear split produces avg inter-row gradient > 45
  // Natural illustrations have smooth gradients avg < 25
  assert(maxRowJump < 32, `Image ${path.basename(imgPath)} has abnormal row discontinuity at row ${maxJumpRow}: ${maxRowJump.toFixed(2)}`);
  console.log(`✓ Pixel continuity passed for ${path.basename(imgPath)}: Max inter-row delta is ${maxRowJump.toFixed(2)} at row ${maxJumpRow} (Threshold < 32)`);
}

// -------------------------------------------------------------
// TEST 4: CSS Dual-Plane Geometric Pinning Invariants
// -------------------------------------------------------------
console.log('\n--- TEST 4: CSS Dual-Plane Geometric Pinning Invariants ---');
const styles = fs.readFileSync(STYLES_PATH, 'utf8');

// 1. .cutin-poster must be position: absolute; inset: 0; width: 100%; height: 100%;
assert(styles.includes('.cutin-poster'), 'styles.css must style .cutin-poster');
assert(styles.includes('.cutin-video'), 'styles.css must style .cutin-video');

// 2. No relative positioning or max-height bounding on .cutin-video
assert(!styles.includes('max-height: 240px'), 'styles.css must NOT contain legacy max-height: 240px on cutin-video');

// 3. Confirm both are pinned absolutely inside .cutin-media-container
const posterPinningRegex = /\.cutin-poster\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*cover;/s;
assert(posterPinningRegex.test(styles), '.cutin-poster must have absolute inset:0 100% cover pinning');

const videoPinningRegex = /\.cutin-video\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*cover;/s;
assert(videoPinningRegex.test(styles), '.cutin-video must have absolute inset:0 100% cover pinning');

console.log('✓ CSS dual-plane absolute geometric pinning verified (Zero seam offset possible)');

// -------------------------------------------------------------
// TEST 5: Bridge Fallback & Aspect Ratio Resilience
// -------------------------------------------------------------
console.log('\n--- TEST 5: Bridge Fallback & Aspect Ratio Resilience ---');
const bridge = fs.readFileSync(BRIDGE_PATH, 'utf8');

assert(bridge.includes('playsinline'), 'Bridge must set playsinline for mobile autoplay');
assert(bridge.includes('webkit-playsinline'), 'Bridge must set webkit-playsinline for iOS/WebKit');
assert(bridge.includes('videoEl.muted = true'), 'Bridge must enforce programmatic muted before play');
assert(bridge.includes('videoEl.load()'), 'Bridge must explicitly call videoEl.load()');
assert(bridge.includes('cutin-macro-canvas'), 'Bridge must provide dynamic 60 FPS CRT macro oscilloscope fallback');

console.log('✓ Bridge autoplay and procedural fallback resilience verified');

console.log('\n================================================================');
console.log('   ALL IMAGE INTEGRITY & NON-DISTORTION BENCHMARKS PASSED!      ');
console.log('================================================================');
