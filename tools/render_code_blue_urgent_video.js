const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const inputImage = path.join(rootDir, 'assets', 'images', 'cutins', 'code_blue.jpg');
const outMp4 = path.join(rootDir, 'assets', 'video', 'cutins', 'code_blue.mp4');
const outWebm = path.join(rootDir, 'assets', 'video', 'cutins', 'code_blue.webm');

if (!fs.existsSync(inputImage)) {
  console.error('Input image not found:', inputImage);
  process.exit(1);
}

console.log('Rendering high-motion Code Blue emergency video via FFmpeg...');

// Filter complex:
// 1. Scale image to 720x405 for zoom headroom
// 2. Zoompan with CPR rhythm compression pulses (1.8 Hz / 108 BPM)
// 3. Dynamic contrast and saturation pulses matching chest compressions
// 4. Defibrillation white flash shock at t=3.15 - 3.32s
const filterStr = [
  "scale=720:405",
  "zoompan=z='1.05+0.035*sin(2*PI*1.8*on/30)+0.0006*on':x='iw/2-(iw/zoom/2)+10*sin(2*PI*1.8*on/30)':y='ih/2-(ih/zoom/2)+6*cos(2*PI*1.8*on/30)':d=165:s=640x360:fps=30",
  "eq=brightness='if(between(t,3.15,3.32),0.55,0.02*sin(2*PI*1.8*t))':contrast='if(between(t,3.15,3.32),1.8,1.08+0.15*sin(2*PI*1.8*t))':saturation='1.35+0.35*sin(2*PI*1.8*t)'"
].join(',');

// 1. Render MP4 (H.264 + faststart)
console.log('Generating MP4:', outMp4);
const mp4Args = [
  '-y',
  '-loop', '1',
  '-i', inputImage,
  '-vf', filterStr,
  '-c:v', 'libx264',
  '-t', '5.5',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  outMp4
];

const resMp4 = spawnSync('ffmpeg', mp4Args, { stdio: 'inherit' });
if (resMp4.status !== 0) {
  console.error('Failed to generate MP4');
  process.exit(1);
}

// 2. Render WebM (VP8)
console.log('Generating WebM:', outWebm);
const webmArgs = [
  '-y',
  '-loop', '1',
  '-i', inputImage,
  '-vf', filterStr,
  '-c:v', 'libvpx',
  '-b:v', '1400k',
  '-t', '5.5',
  '-pix_fmt', 'yuv420p',
  outWebm
];

const resWebm = spawnSync('ffmpeg', webmArgs, { stdio: 'inherit' });
if (resWebm.status !== 0) {
  console.error('Failed to generate WebM');
  process.exit(1);
}

console.log('✓ Successfully rendered urgent Code Blue MP4 and WebM videos!');
