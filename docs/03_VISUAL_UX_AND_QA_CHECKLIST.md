# 03 — Visual Polish, Modal Ergonomics & QA Verification Checklist

## 1. Clinical Encounter Modal Viewport Fix
- **Problem**: On laptops (`1366x768`) and mobile screens, clinical vignettes extend below the bottom edge of the viewport, hiding the `Select GDMT`, `Select Intervention`, and `Select Cost Control` buttons.
- **CSS Solution (`patches/cardiopoly_styles_patches.css`)**:
  - `.vignette-modal-content`: Constrains height to `max-height: 88vh; width: min(960px, 94vw); overflow-y: auto;`.
  - `.vignette-patient-banner`: Applies `position: sticky; top: 0;` with backdrop blur so patient vitals (`SBP`, `LVEF`, ECG findings) remain visible while reviewing options.
  - `.vignette-options-grid`: Uses `grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 12px;` to present all 3 clinical pathways side-by-side on desktop and stacked cleanly on mobile (`<= 1024px`).

## 2. 11x11 Perimeter Tile Visual Hierarchy
- **Problem**: Perimeter tiles only show short codes (`GO`, `REST`, `AUDIT`, `M&M`, `CC`, `?`, `TAX`, `VIP`) or clipped names, forcing players to inspect the sidebar **Magnified View** to see prices, ownership, or upgrade tiers.
- **DOM & CSS Solution**:
  - Add `.tile-cost-badge` (`300 WP`, `400 WP`, `450 WP`, `650 WP`) to every purchasable suite cell.
  - Toggle `.is-owned` with `--owner-color` on purchased tiles to render an inset border and subtle outer neon glow.
  - Toggle `.is-mortgaged` on mortgaged suites to overlay diagonal crimson hazard stripes (`MORTGAGED`).
  - Inside `.tile-color-bar`, inject `1` to `4` `.tile-upgrade-pip` dots representing the current clinical upgrade tier.

## 3. Dynamic Vital-Linked Telemetry ECG
- **Problem**: The center **Telemetry** tab displays a static green waveform (`72 BPM`, `120/80 mmHg`) regardless of whether a player is in hypertensive crisis (`SBP >= 180 mmHg`).
- **JS & CSS Solution**:
  - Call `updateTelemetryFromActivePlayer(player)` at turn start and after every vignette/tile effect:
    - `SBP < 145` & `BMI < 40`: Emerald `#10b981` — `Normal Sinus Rhythm`
    - `145 <= SBP < 175` or `40 <= BMI < 60`: Amber `#f59e0b` — `Sinus Tachycardia / LV Strain`
    - `SBP >= 175` or `BMI >= 60`: Crimson `#ef4444` — `WARNING: Runs of NSVT / Hypertensive Crisis`

## 4. Pre-Deployment QA Checklist
Run through these 5 checks in Antigravity's preview browser after applying the patches:
1. **Regime String Check**: Click through all 9 Healthcare Regimes on the Setup Screen and verify `RVU mult` displays a formatted number (`1.00x`, `1.60x`, `0.75x`, etc.) with zero instances of `undefinedx`.
2. **Faction Race Check**: Start a match and open the **Faction Race** tab; confirm all 4 rows show thematic AI names (`Dr. Guidelines`, `Dr. Cath-A-Lot`, `V.P. Margin`, `Inspector Clawback`), short badge pills (`ACAD`, `IC`, `CEO`, `AUDIT`), and valid percentage strings (`0%` at start).
3. **Vignette Viewport Check**: Land on a `?` or `CC` tile and confirm all 3 decision buttons fit inside the viewport without requiring page scrolling on desktop.
4. **Board Tile & SVG Token Check**: Purchase and upgrade a property suite (e.g., `ECG room` or `UA area`) and verify the tile border glows in the owner's color and renders yellow `.tile-upgrade-pip` indicators.
5. **Telemetry & Floating Delta Check**: Complete a vignette and verify a floating `+RVU` / `+WP` / `+SBP` badge animates upward and the **Telemetry** tab updates HR and BP to match the active player's vitals.
