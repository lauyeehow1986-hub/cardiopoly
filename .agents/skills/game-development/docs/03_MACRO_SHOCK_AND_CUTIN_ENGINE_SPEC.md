# 03 - Macro-Shock Engine, Guideline Shift & Video Cut-In Specification

## 1. Real-World Macro & Policy Shock Mechanics (`MacroShockEngine`)
Every 4 turns (or when triggered via a live/cached MCP feed in `data/liveWorldFeed.json`), the game draws a **Global Healthcare & Macro Incident** that modifies hospital economics for all 4 players:

| Incident Category | Example Real-World Trigger (MCP Source) | Patient Volume Effect | Economic & Clinical Rule Modifier |
| :--- | :--- | :--- | :--- |
| **Pandemic / Epidemic Surge** | Respiratory virus wave (`Brave Search` / `Tavily MCP`) | `+50%` Vignette encounter rate (Chance/CC trigger on adjacent tiles) | ER Triage (`GO`) payout `+150 WP`, but all clinical choices carry `+3 SBP` burnout stress unless player owns `Telemetry bed` |
| **Medical Supply Shortage** | Iodinated contrast media or drug-eluting stent shortage (`OpenFDA MCP`) | Normal (`1.0x`) | `INVASIVE CATH / STENT` costs `+300 WP` supply surcharge and yields `-25% RVU` unless player holds an ACS Pipeline monopoly |
| **Economic Crisis & Insurance Hike** | Medical CPI / insurance co-pay spike (`FRED MCP`) | `-20%` elective clinic visits, `+35%` severe late-presentation ACS | Regime `coPayRate` increases by `+10%`; uncollected patient co-pays reduce `Hospital CEO` rent by `-20%` |
| **National Guideline / Policy Revision** | New Class Ia ACC/ESC/MOH GDMT recommendation (`PubMed MCP`) | Normal (`1.0x`) | `GDMT PROTOCOL` yields `+25 GDMT Points` (up from `+15`); non-indicated stenting doubles `Regulatory Auditor` clawback to `50%` |

## 2. In-Game Dramatic Video Cut-In & Voiceover System (`CutInOverlayManager`)
When a high-impact event occurs (*Code Blue Hospitalization*, *High-Risk Cath Stent*, *Monopoly Completed*, *Ministry Audit Freeze*, or *Macro Shock Breaking News*):
1. A sleek broadcast-style cut-in banner slides across the viewport (`2.8s` duration, skippable on click/keypress) displaying either:
   - The MCP-generated `.webm`/`.mp4` video snippet from `assets/video/cutins/<event_id>.webm` + ElevenLabs character voiceover line from `assets/audio/vo/<event_id>.mp3`, OR
   - An instant high-contrast procedural SVG/Canvas broadcast animation + Web Audio API polyphonic fanfare if local media files are absent.
