const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const target = '<script src="patches/cardiopoly_script_patches.js"></script>';
const replacement = '<script src="patches/cardiopoly_script_patches.js"></script>\n  <script src="patches/cardiopoly_mcp_runtime_bridge.js"></script>';
if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully updated index.html');
} else {
  console.error('Target not found');
  process.exit(1);
}
