# Cardiopoly — Antigravity Upgrade Package (Gemini 3.8 Flash · High Effort)

This archive contains the complete prompt, technical specifications, and drop-in code patches for upgrading **Cardiopoly** (`https://lauyeehow1986-hub.github.io/cardiopoly/`).

## Contents
- `PROMPT_GEMINI_FLASH_HIGH_EFFORT.md` — Copy-paste XML master prompt fine-tuned for **Gemini 3.8 Flash (High Effort)** in Antigravity.
- `docs/01_BUG_AUDIT_AND_SCHEMAS.md` — Root-cause analysis and normalized schemas for the 9 Healthcare Regimes, 4 Factions, and `renderFactionRace()`.
- `docs/02_GAMEPLAY_SYNERGIES_AND_ENGAGEMENT_SPEC.md` — Specification for Hospital Suite <-> Vignette Synergies, Longitudinal Patient Follow-Ups, Proactive AI Trades, and the `localStorage` Career Compendium.
- `docs/03_VISUAL_UX_AND_QA_CHECKLIST.md` — Visual layout fixes for clinical encounter modals, 11x11 perimeter tile badges/pips, SVG medical tokens, and dynamic ECG telemetry.
- `patches/cardiopoly_script_patches.js` — Standalone JavaScript patch module (`window.CardiopolyPatches`).
- `patches/cardiopoly_styles_patches.css` — Standalone CSS patch stylesheet.

## Quick Start in Antigravity
1. Upload or extract this ZIP archive into your `cardiopoly` repository workspace in Antigravity.
2. Select **Gemini 3.8 Flash (High Effort)** as your agent model.
3. Copy the `<antigravity_task>` XML block from `PROMPT_GEMINI_FLASH_HIGH_EFFORT.md` and paste it into the Antigravity chat prompt.
