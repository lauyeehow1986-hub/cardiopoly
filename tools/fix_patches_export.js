const fs = require('fs');
let c = fs.readFileSync('patches/cardiopoly_script_patches.js', 'utf8');

const p = c.indexOf('// UMD & Node.js test environment support');
if (p !== -1) {
  c = c.substring(0, p);
  c += '\nif (typeof module !== "undefined" && module.exports) {\n  module.exports = window.CardiopolyPatches;\n}\n';
}

fs.writeFileSync('patches/cardiopoly_script_patches.js', c, 'utf8');
console.log('Cleaned up duplicate declaration in script patches!');
