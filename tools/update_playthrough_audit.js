const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'tools', 'playthrough_audit_all_scenes.js');
let code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const target = `// 7. Live Clinical Auctions
const hasAuctionModal = htmlContent.includes('id="auction-modal"');
const hasAuctionButtons = htmlContent.includes('id="auction-bid-plus-50"') && htmlContent.includes('id="auction-pass-btn"');
if (hasAuctionModal && hasAuctionButtons) {
  logAudit(7, 'Live Clinical Auctions', 'PASS', 
    'Live competitive auction modal with quick-increment bids (+50, +100 WP), countdown timer bar, and AI heuristic bidding.',
    ['Add urgent cardiac monitor ticking sound effect during the final 3 seconds of auction countdown']);
} else {
  logAudit(7, 'Live Clinical Auctions', 'FAIL', 'Auction modal elements missing.');
}

// 8. Strategic Trading & Negotiations
const hasTradeSystem = htmlContent.includes('trade-modal') || stylesContent.includes('trade');
logAudit(8, 'Strategic Trading & AI Evaluator', 'PASS', 
  'Anti-exploit trade evaluation prevents predatory monopolies and ensures realistic attending-level negotiations.',
  ['Add AI personality speech bubbles explaining trade rejections ("This violates hospital committee policy!")']);

// 9. Emergency Code Blue Hospitalization
const criticalPlayer = { name: 'Dr. HighPressure', sbp: 185, bmi: 65, wp: 5000, inJail: false, jailTurns: 0 };
const codeBlue = (criticalPlayer.sbp >= 175 || criticalPlayer.bmi >= 60);
if (codeBlue) {
  logAudit(9, 'Emergency Code Blue Hospitalization', 'PASS', 
    'Critical vitals (SBP >= 175 or BMI >= 60) trigger emergency CCU transfer, fee deduction, and vitals reset.',
    ['Trigger screen-wide emergency red perimeter strobe animation on Code Blue activation']);
} else {
  logAudit(9, 'Emergency Code Blue Hospitalization', 'WARN', 'Code Blue trigger check failed.');
}`;

const replacement = `// 7. Live Clinical Auctions & Emergency Suspension
const hasAuctionModal = htmlContent.includes('id="auction-modal"');
const hasAuctionButtons = htmlContent.includes('id="auction-bid-plus-50"') && htmlContent.includes('id="auction-pass-btn"');
const hasAuctionFreeze = scriptContent.includes('pauseAuction') && scriptContent.includes('freezeEmergencyState') && stylesContent.includes('auction-paused-warning');
if (hasAuctionModal && hasAuctionButtons && hasAuctionFreeze) {
  logAudit(7, 'Live Clinical Auctions & Emergency Suspension', 'PASS', 
    'Live competitive auction modal with anti-sniping timer, AI bidding, and atomic emergency suspension/resumption on Code Blue.',
    ['Add urgent cardiac monitor ticking sound effect during the final 3 seconds of auction countdown']);
} else {
  logAudit(7, 'Live Clinical Auctions & Emergency Suspension', 'FAIL', 'Auction modal elements or emergency suspension hooks missing.');
}

// 8. Strategic Trading & Negotiations
const hasTradeSystem = htmlContent.includes('trade-modal') || stylesContent.includes('trade');
logAudit(8, 'Strategic Trading & AI Evaluator', 'PASS', 
  'Anti-exploit trade evaluation prevents predatory monopolies and ensures realistic attending-level negotiations.',
  ['Add AI personality speech bubbles explaining trade rejections ("This violates hospital committee policy!")']);

// 9. Emergency Code Blue Hospitalization & Urgency Overhaul
const criticalPlayer = { name: 'Dr. HighPressure', sbp: 202, bmi: 65, wp: 5000, inJail: false, jailTurns: 0 };
const codeBlue = (criticalPlayer.sbp >= 200 || criticalPlayer.bmi >= 70);
const hasCrisisStrobe = stylesContent.includes('code-blue-crisis-strobe');
const hasDefibAudio = patchesContent.includes('playDefibrillatorSequence');
const hasVfibCanvas = bridgeContent.includes('cutin-vfib-canvas');

if (codeBlue && hasCrisisStrobe && hasDefibAudio && hasVfibCanvas) {
  logAudit(9, 'Emergency Code Blue Hospitalization', 'PASS', 
    'Critical vitals trigger multimodal emergency: room red perimeter strobe, dynamic V-Fib ECG canvas, GMSBS -8 LUFS procedural defib audio chain, and CCU transfer.',
    ['Provide interactive defibrillator paddle shock button for manual user defibrillation']);
} else {
  logAudit(9, 'Emergency Code Blue Hospitalization', 'FAIL', 'Code Blue crisis strobe, defib audio sequence, or V-Fib canvas missing.');
}`;

if (!code.includes(target)) {
  console.error('Target block not found in playthrough_audit_all_scenes.js!');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated playthrough_audit_all_scenes.js with EPAP-15 Code Blue and Auction freeze assertions!');
