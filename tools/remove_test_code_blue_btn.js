const fs = require('fs');
const path = require('path');

// 1. Remove from index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8').replace(/\r\n/g, '\n');

const oldBtnHtml = `        <button id="test-code-blue-btn" class="btn btn-secondary" type="button" style="border-color:#ef4444; color:#ef4444; margin-top:8px; width:100%;">🚨 Trigger Code Blue Resuscitation (Test Experience)</button>`;
if (html.includes(oldBtnHtml)) {
  html = html.replace(oldBtnHtml + '\n', '');
  fs.writeFileSync(htmlPath, html.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✓ Removed test-code-blue-btn from index.html");
} else {
  console.log("test-code-blue-btn not found in index.html (already removed)");
}

// 2. Remove listener from script.js
const scriptPath = path.join(__dirname, '..', 'script.js');
let script = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

const oldBtnJs = `  const testCodeBlueBtn = document.getElementById("test-code-blue-btn");
  if (testCodeBlueBtn) {
    testCodeBlueBtn.onclick = () => {
      closeSetupModal();
      const p = gameState.players[0];
      p.sbp = 202;
      finishPlayerTurn();
    };
  }`;

if (script.includes(oldBtnJs)) {
  script = script.replace(oldBtnJs, '');
  fs.writeFileSync(scriptPath, script.replace(/\n/g, '\r\n'), 'utf8');
  console.log("✓ Removed testCodeBlueBtn click listener from script.js");
} else {
  console.log("testCodeBlueBtn not found in script.js (already removed)");
}
