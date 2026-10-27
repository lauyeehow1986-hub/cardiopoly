const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Replace first .cutin-video declaration
const target1 = /\.cutin-video\s*\{\s*width:\s*100%;\s*max-height:\s*240px;\s*object-fit:\s*cover;\s*display:\s*block;\s*\}/;
const replace1 = `.cutin-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: cover;
  display: block;
}`;

if (!target1.test(css)) {
  console.error("Target 1 not found in styles.css");
  process.exit(1);
}
css = css.replace(target1, replace1);

// 2. Replace second .cutin-poster and .cutin-video declaration
const target2 = /\.cutin-poster\s*\{[\s\S]*?animation:\s*cutinKenBurns\s*5\.5s\s*linear\s*forwards;\s*\}\s*\.cutin-video\s*\{[\s\S]*?z-index:\s*2;\s*display:\s*block;\s*\}/;
const replace2 = `.cutin-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: cover;
  z-index: 1;
}

.cutin-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: cover;
  z-index: 2;
  display: block;
  opacity: 1;
  transition: opacity 0.25s ease-out;
}`;

if (!target2.test(css)) {
  console.error("Target 2 not found in styles.css");
  process.exit(1);
}
css = css.replace(target2, replace2);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("✓ Successfully updated styles.css with dual-plane geometric alignment fix!");
