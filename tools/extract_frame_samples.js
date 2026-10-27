const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'scratch', 'frame_samples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const videos = [
  'assets/video/cutins/cath_lab.mp4',
  'assets/video/cutins/code_blue.mp4',
  'assets/video/cutins/regulatory_audit.mp4'
];

for (const v of videos) {
  const base = path.basename(v, '.mp4');
  for (const t of [0.5, 2.5, 4.0]) {
    const framePath = path.join(outDir, `${base}_t${t.toFixed(1)}.jpg`);
    spawnSync('ffmpeg', [
      '-y',
      '-ss', String(t),
      '-i', v,
      '-vframes', '1',
      '-q:v', '2',
      framePath
    ]);
    console.log(`Extracted: ${framePath} (${fs.statSync(framePath).size} bytes)`);
  }
}
console.log('✓ All frame samples extracted successfully!');
