const fs = require('fs');
let s = fs.readFileSync('styles.css', 'utf8').replace(/\r\n/g, '\n');
const target = `.cutin-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cutin-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: cutinKenBurns 5.5s linear forwards;
}`;

const repl = `.cutin-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  animation: cutinKenBurns 5.5s linear forwards;
}

.cutin-video {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  display: block;
}

.cutin-macro-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}`;

if (!s.includes(target)) {
  console.error('Target not found in styles.css');
  process.exit(1);
}
s = s.replace(target, repl);
fs.writeFileSync('styles.css', s.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated styles.css with layered video, poster, and macro canvas!');
