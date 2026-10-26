# 02 — Long-Term Gameplay Synergies & Engagement Specification

## 1. Hospital Suite <-> Clinical Vignette Synergy Engine
Currently in Cardiopoly, buying hospital suites on the 11x11 perimeter board only affects rent/WP extraction, completely disconnected from the clinical encounter vignettes (`Chance` and `Community Chest`). Connecting board ownership to clinical outcomes makes property acquisition strategically vital for every faction:

| Owned Hospital Suite(s) | Clinical Vignette Trigger | Synergy Bonus Applied by `evaluateVignetteWithSynergies()` |
| :--- | :--- | :--- |
| `ECG room` (300 WP) or `UA area` (400 WP) | Acute Coronary Syndrome cases (e.g., *Carl D., 57yo M, Crescendo Rest Angina*) | **ACS Pipeline Synergy**: Grants `+5 GDMT Points`, reduces Waste by `-50 WP`, and cuts complication risk by `50%` |
| `Telemetry bed` or `Palliative reality room` (650 WP) | Arrhythmia & Severe LV Dysfunction cases (e.g., *Howard S., 70yo M, NSVT Runs, LVEF 32%*) | **CCU / Telemetry Shield**: Negates positive `SBP` spikes (`sbpDelta = 0`) and reduces M&M peer-review risk by `40%` |
| `CPET lab` | Any vignette where player selects `GDMT PROTOCOL` | **Cardiac Rehab Synergy**: Lowers player `SBP` by `-3 mmHg` and `BMI` by `-0.4 kg/m²` via structured exercise rehab |
| `Pharma Rep Steak Dinner` (450 WP) | Any vignette where player selects `INVASIVE CATH / STENT` | **Industry Hospitality**: Boosts procedural `RVU` payout by `+20%`, but increases `Regulatory Auditor` clawback exposure by `+15%` |

## 2. Longitudinal Patient Follow-Up Queue (`gameState.followUpQueue`)
To prevent players from spamming `COST CONTAINMENT` or guideline-discordant `INVASIVE CATH / STENT` without long-term clinical consequences:
1. When a player chooses `COST CONTAINMENT` or an non-indicated invasive stent, push a follow-up event onto `gameState.followUpQueue` scheduled for `currentTurn + 6`.
2. At the start of that player's turn when `turnNumber >= item.triggerTurn`, pop the event and display a **Readmission / M&M Inquiry** alert:
   - **Cost Containment Readmission**: Unscheduled ER bounce-back incurs `+8 mmHg SBP` and `450 WP` emergency stabilization cost (waived by 50% if the player owns `Telemetry bed` or `CPET lab`).
   - **Subacute Stent Thrombosis Inquiry**: Triggers an automatic M&M complication counter (`+1 sanction/complication`) and `450 WP` peer-review fine.

## 3. Proactive AI Backroom Turf Trades
Enhance the AI turn loop for `Resident (Easy)`, `Attending (Standard)`, and `Department Chair (Ruthless)`:
- When an AI opponent holds 2 of 3 properties in a color group and another player holds the 3rd, the AI evaluates a trade offer (`1.25x` face value in WP for `Attending`, or a counter-suite swap for `Department Chair`) and surfaces a compact non-blocking trade proposal banner in the **Backroom Turf Trades** panel.

## 4. Career Compendium & Landmark Trial Tracker (`localStorage`)
Persist player progress under `localStorage.getItem('cardiopoly_career_v1')`:
- Track `matchesPlayed`, `winsByFaction`, `lifetimeGdmtChoices`, `lifetimeTotalChoices`, and `trialsEncountered` (`CURE`, `PLATO`, `COURAGE`, `ISCHEMIA`, `PARADIGM-HF`, `MADIT-II`).
- Render unlocked trials as reference cards showing the real-world clinical takeaway (e.g., *CURE / PLATO: Dual antiplatelet therapy in UA/NSTEMI reduces ischemic events*).
