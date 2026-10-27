const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');
const targetHtml = `      <div class="setup-modal-footer">
        <button id="setup-resume-btn" class="btn btn-secondary btn-large hidden" type="button">▶️ Resume Match</button>
        <button id="setup-quick-start-btn" class="btn btn-secondary btn-large" type="button">Quick Start (Defaults)</button>
        <button id="setup-launch-match-btn" class="btn btn-primary btn-large" type="button">Launch Clinical Match</button>
      </div>`;

const replHtml = `      <div class="setup-modal-footer">
        <button id="setup-resume-btn" class="btn btn-secondary btn-large hidden" type="button">▶️ Resume Match</button>
        <button id="setup-quick-start-btn" class="btn btn-secondary btn-large" type="button">Quick Start (Defaults)</button>
        <button id="setup-launch-match-btn" class="btn btn-primary btn-large" type="button">Launch Clinical Match</button>
        <button id="test-code-blue-btn" class="btn btn-secondary" type="button" style="border-color:#ef4444; color:#ef4444; margin-top:8px; width:100%;">🚨 Trigger Code Blue Resuscitation (Test Experience)</button>
      </div>`;

if (!html.includes(targetHtml)) {
  console.error("targetHtml not found!");
  process.exit(1);
}
html = html.replace(targetHtml, replHtml);
fs.writeFileSync('index.html', html.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Added test-code-blue-btn to index.html");

// 2. Wire up button in script.js
let js = fs.readFileSync('script.js', 'utf8').replace(/\r\n/g, '\n');
const targetJs = `  const resumeBtn = document.getElementById("setup-resume-btn");
  const quickStartBtn = document.getElementById("setup-quick-start-btn");
  const launchBtn = document.getElementById("setup-launch-match-btn");`;

const replJs = `  const resumeBtn = document.getElementById("setup-resume-btn");
  const quickStartBtn = document.getElementById("setup-quick-start-btn");
  const launchBtn = document.getElementById("setup-launch-match-btn");
  const testCodeBlueBtn = document.getElementById("test-code-blue-btn");
  if (testCodeBlueBtn) {
    testCodeBlueBtn.onclick = () => {
      closeSetupModal();
      const p = gameState.players[0];
      p.sbp = 202;
      finishPlayerTurn();
    };
  }`;

if (!js.includes(targetJs)) {
  console.error("targetJs not found!");
  process.exit(1);
}
js = js.replace(targetJs, replJs);
fs.writeFileSync('script.js', js.replace(/\n/g, '\r\n'), 'utf8');
console.log("✓ Hooked test-code-blue-btn click handler in script.js");
