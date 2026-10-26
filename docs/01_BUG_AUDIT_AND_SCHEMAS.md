# 01 — Bug Audit, Root Causes & Normalized Data Schemas

## 1. Live Bug Inventory on `https://lauyeehow1986-hub.github.io/cardiopoly/`

### Bug A: Healthcare Regime Setup String Outputs `RVU mult undefinedx`
- **Observed UI Output**:
  > `"Key Rule: Co-pay rate 0%, RVU mult undefinedx, Rent mult 1.05x"`
- **Root Cause**: The setup panel formatter interpolates `regime.rvuMult` (or a mismatched property name) that is undefined on the regime configuration object.
- **Fix**: Normalize all 9 regime objects to include both `rvuMult` and `rvuMultiplier` plus `specialRule`, and use `formatRegimeRuleText(regime)` from `patches/cardiopoly_script_patches.js`.

| Regime Key | Display Name | `coPayRate` | `rvuMult` | `rentMult` | Active `specialRule` |
| :--- | :--- | ---: | ---: | ---: | :--- |
| `singapore` | Singapore (3M) | `0.15` | `1.00` | `1.05` | MediSave/MediShield buffer reduces Code Blue bail by 30% when `GDMT >= 75%` |
| `usa` | United States (Commercial FFS) | `0.25` | `1.60` | `1.35` | 1.6x RVU procedural extraction; M&M peer-review sanctions carry +50% WP penalty |
| `uk` | United Kingdom (NHS Single-Payer) | `0.00` | `0.75` | `0.85` | NICE cost-effectiveness mandate: Selecting GDMT Protocol grants +100 WP bonus |
| `sweden` | Sweden (SWEDEHEART) | `0.05` | `0.95` | `1.00` | Registry quality bonus: Collect +250 WP at GO (ER Triage) when `GDMT >= 80%` |
| `japan` | Japan (Chuikyo) | `0.10` | `0.90` | `0.95` | Biennial fee schedule: Diagnostic suites (`ECG room`, `Telemetry bed`) cost 20% less to upgrade |
| `south_korea` | South Korea (HIRA) | `0.20` | `1.15` | `1.10` | Automated HIRA claim audit increases Regulatory Auditor clawback yield by +15% |
| `taiwan` | Taiwan (Global Budget) | `0.10` | `1.05` | `1.00` | Floating point value: Effective RVU multiplier drops by 0.20x when global waste exceeds 5,000 WP |
| `malaysia` | Malaysia (MOH Care) | `0.05` | `0.85` | `0.90` | Public safety net: Clinic-tier properties can be unmortgaged without the 10% interest surcharge |
| `indonesia` | Indonesia (BPJS Kesehatan) | `0.00` | `0.80` | `0.90` | INA-CBG bundled payment: Cost Containment choices incur 50% less SBP and BMI penalty |

### Bug B: Faction Race Tab Outputs `undefined (undefined%)` and Truncates Role Names
- **Observed UI Output**:
  > `"You (ACADEMIC C) undefined (undefined%)"`
  > `"Fat Slob (INTERVENTI) undefined (undefined%)"`
  > `"Lazy Larry (HOSPITAL C) undefined (undefined%)"`
  > `"Sloppy Susan (REGULATORY) undefined (undefined%)"`
- **Root Cause**: `renderFactionRace()` reads non-existent progress keys on the player object and slices the faction title string to 10 characters.
- **Fix**: Use `computePlayerFactionProgress(player, gameState)` and `renderFactionRacePatched()` in `patches/cardiopoly_script_patches.js`:

| Faction | Badge | Victory Target (Clinical Mastery) | Normalized `pct` Formula | Status Readout Format |
| :--- | :--- | :--- | :--- | :--- |
| Academic Clinician | `ACAD` | `GDMT >= 85%`, `Encounters >= 12`, `Complications < 2` | `round((min(1, gdmtRate/85)*0.5 + min(1, enc/12)*0.5)*100)` (cap at `75%` if `comp >= 2`) | `${gdmtRate}% GDMT · ${enc}/12 Cases · ${comp}/2 Comp (${pct}%)` |
| Interventionalist | `IC` | `RVUs >= 12,000`, `Sanctions < 3` | `min(100, round((rvu/12000)*100))` (cap at `80%` if `sanctions >= 3`) | `${rvu.toLocaleString()}/12k RVU · ${sanctions}/3 Sanctions (${pct}%)` |
| Hospital CEO | `CEO` | `>= 3` Monopolies OR `Margin >= 10,000 WP` | `min(100, round(max(min(1, mono/3), min(1, wp/10000))*100))` | `${mono}/3 Monopolies · ${wp.toLocaleString()}/10k WP (${pct}%)` |
| Regulatory Auditor | `AUDIT` | `Audit Clawback >= 15,000 WP` | `min(100, round((clawback/15000)*100))` | `${clawback.toLocaleString()}/15k WP Clawback (${pct}%)` |

### Bug C: Placeholder AI Opponent Names
- **Observed UI Output**: `Fat Slob`, `Lazy Larry`, `Sloppy Susan`.
- **Fix**: `sanitizePlayerNames(players)` maps AI opponents to faction-appropriate personas (`Dr. Guidelines`, `Dr. Cath-A-Lot`, `V.P. Margin`, `Inspector Clawback`).
