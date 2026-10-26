# Cardiopoly: Antigravity Prompt (Fine-Tuned for Gemini 3.8 Flash — High Effort)

Copy the XML-structured prompt block below into **Antigravity** (with your model set to **Gemini 3.8 Flash · High Effort**) and attach or extract `cardiopoly_antigravity_gemini_flash_pack.zip` into your workspace.

```xml
<antigravity_task model_target="gemini-3.8-flash" reasoning_effort="high">

<role>
You are a Staff Front-End Game Architect and Clinical Simulation Engineer operating inside Antigravity on the Cardiopoly repository (`index.html`, `styles.css`, `script.js`).
Because you are running on Gemini 3.8 Flash at High Effort, use your full reasoning budget before making each file edit to trace variable bindings across `index.html`, `styles.css`, and `script.js`, verify object property names, and ensure zero regressions to existing dice, auction, audio (`CardiopolyAudioSynth`), and 40-tile board mechanics.
</role>

<reference_package>
Read the extracted files from `cardiopoly_antigravity_gemini_flash_pack.zip` before planning your edits:
1. `docs/01_BUG_AUDIT_AND_SCHEMAS.md` — Exact root causes and normalized schemas for all 9 Healthcare Regimes, 4 Factions, and `renderFactionRace()`.
2. `docs/02_GAMEPLAY_SYNERGIES_AND_ENGAGEMENT_SPEC.md` — State machines and formulas for Longitudinal Patient Follow-Ups, Hospital Suite <-> Vignette Synergies, Proactive AI Trading, and the `localStorage` Career Compendium.
3. `docs/03_VISUAL_UX_AND_QA_CHECKLIST.md` — CSS layout specifications for clinical encounter modals, 11x11 perimeter tile badges/pips, SVG medical tokens, and dynamic vital-driven ECG telemetry.
4. `patches/cardiopoly_script_patches.js` — Drop-in JavaScript module (`window.CardiopolyPatches`) containing tested implementations of all fixes and new systems.
5. `patches/cardiopoly_styles_patches.css` — Drop-in CSS rules for modal viewport ergonomics, tile ownership glow, upgrade pips, and floating resource deltas.
</reference_package>

<strict_invariants>
1. NO TRUNCATION OR PLACEHOLDERS: Never output `// ... existing code ...` or omit existing board tiles, clinical vignettes, or regime entries when editing `script.js`, `styles.css`, or `index.html`. Perform targeted surgical edits or complete module integrations.
2. STATIC GITHUB PAGES COMPATIBILITY: Keep the app 100% compatible with zero-build static hosting on GitHub Pages (`https://lauyeehow1986-hub.github.io/cardiopoly/`). Do not introduce npm build steps or external network dependencies that fail offline.
3. PRESERVE CORE AUDIO & STATE: Keep `CardiopolyAudioSynth` (Web Audio API tone synthesis), both game modes (`Clinical Mastery` and `Bureaucratic Satire`), all 40 perimeter tiles (`#0 GO (ER Triage)`, `#10 M&M`, `#20 REST`, `#30 AUDIT`, and all 28 suites), and live clinical auctions intact.
</strict_invariants>

<surgical_search_anchors>
Before modifying `script.js`, `styles.css`, or `index.html`, run a search/grep across the workspace for these exact anchors to map the existing code structure:
- Anchor A (Healthcare Regime Interpolation Bug): Search `script.js` for `RVU mult` or `Rent mult` or `Co-pay rate`. Inspect the exact keys on the 9 regime objects (`Singapore (3M)`, `United States (Commercial FFS)`, `United Kingdom (NHS Single-Payer)`, `Sweden (SWEDEHEART)`, `Japan (Chuikyo)`, `South Korea (HIRA)`, `Taiwan (Global Budget)`, `Malaysia (MOH Care)`, `Indonesia (BPJS Kesehatan)`).
- Anchor B (Faction Race `undefined (undefined%)` Bug): Search `script.js` for `Faction Race` or `renderFactionRace` or `.slice(` where role strings truncate to `ACADEMIC C`, `INTERVENTI`, `HOSPITAL C`, `REGULATORY`.
- Anchor C (AI Default Names): Search `script.js` for `Fat Slob`, `Lazy Larry`, and `Sloppy Susan`.
- Anchor D (Clinical Encounter Modal & Options Button): Search `index.html` and `script.js` for `GDMT PROTOCOL`, `INVASIVE CATH`, `COST CONTAINMENT`, and the navbar `Options` click handler.
- Anchor E (Telemetry Tab & Board Tiles): Search `index.html` and `styles.css` for `Telemetry`, `72 BPM`, `120/80`, and the 11x11 board tile rendering loop.
</surgical_search_anchors>

<execution_phases>
Execute this upgrade in 4 sequential phases. Complete and verify each phase before moving to the next:

### PHASE 1: Data-Binding & UI Bug Repairs (`script.js`)
1. Integrate `CARDIOPOLY_REGIMES_PATCH` and `formatRegimeRuleText(regime)` from `patches/cardiopoly_script_patches.js` so every regime displays a formatted numeric `RVU mult` (e.g., `1.00x`, `1.60x`, `0.75x`) and its active rule hook (`specialRule`) with zero instances of `undefinedx`.
2. Replace `Fat Slob`, `Lazy Larry`, and `Sloppy Susan` using `sanitizePlayerNames()` and `FACTION_METADATA` so AI opponents default to `Dr. Guidelines` (`ACAD`), `Dr. Cath-A-Lot` (`IC`), `V.P. Margin` (`CEO`), and `Inspector Clawback` (`AUDIT`).
3. Replace the broken progress string in `renderFactionRace` with `computePlayerFactionProgress(player, gameState)` and `renderFactionRacePatched()` so both `Clinical Mastery` (GDMT %, RVUs, Monopolies/Margin, Audit Clawback) and `Bureaucratic Satire` (SBP/200, WP/10000, BMI/70) render accurate 0–100% bars and clean faction badges (`ACAD`, `IC`, `CEO`, `AUDIT`).
4. Update the navbar `Options` button handler so opening Options during an active match pauses active auction/AI timers and provides a "Resume Match" button alongside a confirmed "Reconfigure / Restart Match" action.

### PHASE 2: Modal Ergonomics, 11x11 Tile Hierarchy & SVG Tokens (`styles.css` & `index.html`)
1. Merge `patches/cardiopoly_styles_patches.css` into `styles.css` (or link it in `index.html` right after `styles.css`).
2. Update the Clinical Encounter modal DOM template in `script.js` / `index.html` to apply `.vignette-modal-content`, `.vignette-patient-banner` (sticky header for patient vitals like `Carl D. 57yo M` or `Howard S. 70yo M`), and `.vignette-options-grid` (3-column responsive grid for `GDMT PROTOCOL`, `INVASIVE CATH / STENT`, and `COST CONTAINMENT`).
3. Enhance the 40 perimeter tile cells in the board renderer so purchasable suites display their `.tile-cost-badge` (`300 WP`, `400 WP`, `450 WP`, `650 WP`), owner border glow (`.is-owned`), mortgaged overlay (`.is-mortgaged`), and 1–4 `.tile-upgrade-pip` markers inside `.tile-color-bar`.
4. Render the inline SVG medical tokens (`FACTION_METADATA[fKey].tokenSvg`) inside `.player-token` and animate step-by-step tile hopping (`.is-hopping` at `90ms` per tile) when moving around the perimeter.

### PHASE 3: Dynamic Vital-Linked Telemetry & Floating Resource Deltas (`script.js`)
1. Hook `updateTelemetryFromActivePlayer(activePlayer)` into the turn transition and vignette resolution lifecycle so the center `Telemetry` tab dynamically updates HR, BP (`SBP/DBP mmHg`), rhythm status, and ECG trace color (`#10b981` Normal Sinus Rhythm -> `#f59e0b` Sinus Tachycardia/LV Strain at `SBP >= 145` -> `#ef4444` NSVT/Pre-Code Blue crisis at `SBP >= 175` or `BMI >= 60`).
2. Trigger `spawnFloatingResourceDelta()` over the active player's scoreboard card and board tile whenever `WP`, `RVU`, `GDMT`, `SBP`, or `BMI` changes.

### PHASE 4: Long-Term Engagement Loops & Career Compendium (`script.js`)
1. Wire `evaluateVignetteWithSynergies()` into clinical encounter resolution so owning matching hospital suites (`ECG room`, `UA area`, `Telemetry bed`, `Palliative reality room`, `CPET lab`, `Pharma Rep Steak Dinner`) applies active clinical bonuses and displays active synergy badges inside the vignette modal.
2. Process `gameState.followUpQueue` at the start of each turn: when `turnNumber >= item.triggerTurn`, trigger the longitudinal patient readmission / M&M inquiry modal for consequences of prior `COST CONTAINMENT` or non-indicated stenting choices.
3. Enforce active regime rule hooks (`Singapore (3M)` MediShield Code Blue relief, `United States (Commercial FFS)` 1.6x RVU + 1.5x M&M penalty, `United Kingdom (NHS)` +100 WP GDMT bonus, `Sweden (SWEDEHEART)` +250 WP GO dividend at `GDMT >= 80%`, `Taiwan (Global Budget)` waste deflator).
4. Wire `loadCareerCompendium()` and `recordVignetteTrialInCompendium()` to persist lifetime faction wins, GDMT adherence rate, and unlocked landmark trials (`CURE`, `PLATO`, `COURAGE`, `ISCHEMIA`, `PARADIGM-HF`, `MADIT-II`) in `localStorage`.
</execution_phases>

<verification_gates>
Before finishing your turn in Antigravity, launch the browser preview or inspect the DOM to verify all 5 gates:
- [ ] Gate 1: Setup screen regime selector displays valid numeric `RVU mult` values (zero `undefinedx` strings) across all 9 regimes.
- [ ] Gate 2: Center board `Faction Race` tab displays `Dr. Guidelines (ACAD)`, `Dr. Cath-A-Lot (IC)`, `V.P. Margin (CEO)`, and `Inspector Clawback (AUDIT)` with valid progress strings and `0%–100%` bars (zero `undefined (undefined%)` strings).
- [ ] Gate 3: Clinical Encounter modals fit within `88vh` with all 3 action buttons visible side-by-side on desktop without vertical clipping.
- [ ] Gate 4: Perimeter board tiles show WP cost badges, owner glow borders, and upgrade pips, and player tokens render faction SVG icons.
- [ ] Gate 5: Selecting a clinical vignette option updates the dynamic ECG telemetry readout, spawns floating delta badges, and logs the trial in `localStorage.getItem('cardiopoly_career_v1')`.
</verification_gates>

</antigravity_task>
```
