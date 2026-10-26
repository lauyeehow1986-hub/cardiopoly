# 03 - Core Gameplay Synergies, Retention & Architecture Specification

## 1. Hospital Suite <-> Clinical Vignette Synergy Engine
Connecting board tile ownership directly to encounter decision outcomes transforms basic property acquisition into clinical specialization:

| Owned Suite(s) | Encounter Category | Clinical Synergy Bonus |
| :--- | :--- | :--- |
| `ECG room` (300 WP) or `UA area` (400 WP) | Acute Coronary Syndromes (*Carl D., 57yo M*) | **ACS Pipeline**: Grants `+5 GDMT Points`, reduces Waste by `-50 WP`, and cuts complication probability by `50%`. |
| `Telemetry bed` or `Palliative reality room` (650 WP) | Arrhythmias & Low EF (*Howard S., 70yo M*) | **CCU Shield**: Eliminates positive `SBP` spike (`sbpDelta = 0`) and cuts M&M peer-review sanction risk by `40%`. |
| `CPET lab` | Any vignette selecting `GDMT PROTOCOL` | **Cardiac Rehab**: Lowers `SBP` by `-3 mmHg` and `BMI` by `-0.4 kg/m²` via exercise rehab protocols. |
| `Pharma Rep Steak Dinner` (450 WP) | Any vignette selecting `INVASIVE CATH / STENT` | **Industry Hospitality**: Boosts procedural `RVU` yield by `+20%`, but adds `+15%` Regulatory Auditor clawback exposure. |

## 2. Longitudinal Patient Follow-Up Queue (`gameState.followUpQueue`)
To prevent players from spamming short-term cost cuts without clinical accountability:
1. Choosing `COST CONTAINMENT` or guideline-discordant invasive stenting pushes a follow-up item onto `gameState.followUpQueue` scheduled for `currentTurn + 6`.
2. At `turnNumber >= item.triggerTurn`, pop the item and trigger the **Readmission / M&M Inquiry**:
   - **Cost Containment Bounce-Back**: Unscheduled ER bounce-back inflicts `+8 mmHg SBP` and `450 WP` stabilization fee (waived by 50% if holding `Telemetry bed` or `CPET lab`).
   - **Stent Thrombosis Inquiry**: Inflicts `+1 M&M Complication / Sanction` and a `450 WP` peer-review fine.

## 3. Career Compendium & Landmark Trial Tracker (`localStorage`)
Persist player lifetime progress under `localStorage.getItem('cardiopoly_career_v1')`:
- Tracks `matchesPlayed`, `winsByFaction`, `lifetimeGdmtChoices`, `lifetimeTotalChoices`.
- Records unlocked clinical landmark trials: `CURE`, `PLATO`, `COURAGE`, `ISCHEMIA`, `PARADIGM-HF`, `MADIT-II`.

## 4. 6-Gate QA Verification Checklist
1. **Regime Formatter**: Confirm all 9 regimes display valid numeric `RVU mult` (no `undefinedx`).
2. **Faction Race**: Confirm all 4 rows show valid progress percentages and clean badge pills (`ACAD`, `IC`, `CEO`, `AUDIT`).
3. **Audio Context & ADSR**: Confirm clicking `Sound` resumes audio cleanly without square-wave clicks.
4. **Modal Ergonomics**: Confirm clinical encounter dialogs fit within `88vh` with 3 visible choices.
5. **Perimeter Tiles**: Confirm tiles show cost badges, owner border glow, and upgrade pips.
6. **Career Compendium**: Confirm trials log to `localStorage` and persist across reloads.
