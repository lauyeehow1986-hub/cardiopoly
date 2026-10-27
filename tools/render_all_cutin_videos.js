const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const imagesDir = path.join(assetsDir, 'images', 'cutins');
const videoDir = path.join(assetsDir, 'video', 'cutins');

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const CUTINS = [
  {
    id: 'code_blue',
    image: path.join(imagesDir, 'code_blue.jpg'),
    mp4: path.join(videoDir, 'code_blue.mp4'),
    webm: path.join(videoDir, 'code_blue.webm'),
    // CPR chest compression rhythm (1.8 Hz / 108 BPM) + Defibrillator shock flash at t=3.15-3.35s
    filter: [
      "scale=720:405",
      "zoompan=z='1.05+0.038*sin(2*PI*1.8*on/30)+0.0005*on':x='iw/2-(iw/zoom/2)+11*sin(2*PI*1.8*on/30)':y='ih/2-(ih/zoom/2)+7*cos(2*PI*1.8*on/30)':d=165:s=640x360:fps=30",
      "eq=brightness='if(between(t,3.15,3.35),0.58,0.03*sin(2*PI*1.8*t))':contrast='if(between(t,3.15,3.35),1.85,1.10+0.16*sin(2*PI*1.8*t))':saturation='1.35+0.35*sin(2*PI*1.8*t)'"
    ].join(',')
  },
  {
    id: 'cath_lab',
    image: path.join(imagesDir, 'cath_lab.jpg'),
    mp4: path.join(videoDir, 'cath_lab.mp4'),
    webm: path.join(videoDir, 'cath_lab.webm'),
    // Cine-Fluoroscopy X-Ray Pulses (3.0 Hz strobe) + Cardiac rhythm (1.2 Hz) + Stent expansion bloom at t=2.3-2.8s
    filter: [
      "scale=720:405",
      "zoompan=z='1.04+0.03*sin(2*PI*1.2*on/30)+if(between(on,68,90),0.07*sin(PI*(on-68)/22),0)':x='iw/2-(iw/zoom/2)+8*sin(2*PI*1.2*on/30)':y='ih/2-(ih/zoom/2)+5*cos(2*PI*1.2*on/30)':d=165:s=640x360:fps=30",
      "eq=brightness='if(between(t,2.3,2.8),0.44,0.05*sin(2*PI*3.0*t))':contrast='if(between(t,2.3,2.8),1.70,1.14+0.15*sin(2*PI*3.0*t))':saturation='1.32+0.28*sin(2*PI*1.2*t)'"
    ].join(',')
  },
  {
    id: 'regulatory_audit',
    image: path.join(imagesDir, 'regulatory_audit.jpg'),
    mp4: path.join(videoDir, 'regulatory_audit.mp4'),
    webm: path.join(videoDir, 'regulatory_audit.webm'),
    // Emergency Audit Caution Strobe (2.0 Hz) + Ministry Stamp Camera Slam at t=1.2-1.5s
    filter: [
      "scale=720:405",
      "zoompan=z='1.04+0.025*sin(2*PI*2.0*on/30)+if(between(on,36,50),0.08*sin(PI*(on-36)/14),0)':x='iw/2-(iw/zoom/2)+6*sin(2*PI*2.0*on/30)+if(between(on,36,46),12*sin(PI*(on-36)/2),0)':y='ih/2-(ih/zoom/2)+4*cos(2*PI*2.0*on/30)+if(between(on,36,46),8*cos(PI*(on-36)/2),0)':d=165:s=640x360:fps=30",
      "eq=brightness='if(between(t,1.2,1.5),0.48,0.04*sin(2*PI*2.0*t))':contrast='if(between(t,1.2,1.5),1.80,1.12+0.18*sin(2*PI*2.0*t))':saturation='1.28+0.30*sin(2*PI*2.0*t)'"
    ].join(',')
  }
];

function renderVideo(cutin) {
  console.log(`\n========================================`);
  console.log(`Rendering High-Motion Cut-In: [${cutin.id}]`);
  console.log(`Input image: ${cutin.image}`);

  if (!fs.existsSync(cutin.image)) {
    console.error(`ERROR: Image missing: ${cutin.image}`);
    process.exit(1);
  }

  // 1. MP4 (H.264 + faststart)
  console.log(`-> Generating MP4: ${cutin.mp4}`);
  const mp4Args = [
    '-y',
    '-loop', '1',
    '-i', cutin.image,
    '-vf', cutin.filter,
    '-c:v', 'libx264',
    '-t', '5.5',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    cutin.mp4
  ];

  const mp4Res = spawnSync('ffmpeg', mp4Args, { stdio: 'inherit' });
  if (mp4Res.status !== 0) {
    console.error(`FFmpeg MP4 render failed for ${cutin.id}`);
    process.exit(1);
  }

  // 2. WebM (VP8)
  console.log(`-> Generating WebM: ${cutin.webm}`);
  const webmArgs = [
    '-y',
    '-loop', '1',
    '-i', cutin.image,
    '-vf', cutin.filter,
    '-c:v', 'libvpx',
    '-b:v', '1400k',
    '-t', '5.5',
    '-pix_fmt', 'yuv420p',
    cutin.webm
  ];

  const webmRes = spawnSync('ffmpeg', webmArgs, { stdio: 'inherit' });
  if (webmRes.status !== 0) {
    console.error(`FFmpeg WebM render failed for ${cutin.id}`);
    process.exit(1);
  }

  console.log(`✓ Completed [${cutin.id}] MP4 (${fs.statSync(cutin.mp4).size} bytes) & WebM (${fs.statSync(cutin.webm).size} bytes)`);
}

for (const cutin of CUTINS) {
  renderVideo(cutin);
}

console.log(`\n✓ ALL CUT-IN VIDEOS SUCCESSFULLY RENDERED WITH HIGH KINEMATIC MOTION!`);
