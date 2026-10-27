const fs = require('fs');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Find function openSetupModal()
const fnStart = content.indexOf('function openSetupModal() {');
if (fnStart === -1) {
  console.error('Could not find openSetupModal in script.js');
  process.exit(1);
}

const activeIdx = content.indexOf('modal.classList.add("active");', fnStart);
if (activeIdx === -1) {
  console.error('Could not find modal.classList.add("active")');
  process.exit(1);
}

const insertionPoint = activeIdx + 'modal.classList.add("active");'.length;
const codeToInsert = `
  modal.scrollTop = 0;
  const innerModal = modal.querySelector(".setup-modal");
  if (innerModal) innerModal.scrollTop = 0;
  const section1 = modal.querySelector(".setup-section");
  if (section1) section1.scrollIntoView({ block: "start", inline: "nearest" });`;

content = content.slice(0, insertionPoint) + codeToInsert + content.slice(insertionPoint);
fs.writeFileSync(scriptPath, content, 'utf8');
console.log('✓ Successfully patched openSetupModal in script.js');
