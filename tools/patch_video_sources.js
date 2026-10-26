const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'patches', 'cardiopoly_mcp_runtime_bridge.js');
let code = fs.readFileSync(filePath, 'utf8');

const regex = /<video class="cutin-video" src="\$\{videoSrc\}"[\s\S]*?<\/video>/;
const replacement = `<video class="cutin-video" autoplay muted loop playsinline
                 onerror="this.style.display='none'; const p=this.nextElementSibling; if(p) p.style.display='block';">
            <source src="\${videoSrc}" type="video/webm">
            <source src="\${videoSrc.replace(/\\.webm$/, '.mp4')}" type="video/mp4">
          </video>`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated cutin video sources in patches/cardiopoly_mcp_runtime_bridge.js');
} else {
  console.error('Regex did not match');
}
