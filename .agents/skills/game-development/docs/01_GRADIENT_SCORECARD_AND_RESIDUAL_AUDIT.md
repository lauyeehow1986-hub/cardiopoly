# 01 - Gradient-Boosting Scorecard, Residual Audit & Deduplication Plan

## 1. Iteration Scorecard: Live Baseline ($I_0$) vs. Target Boosted Iteration ($I_1$)

| Dimension | Weight ($w_k$) | Live Baseline ($I_0$) | Target ($I_1$) | Delta ($\Delta$) | Priority Boost Weight ($P_k$) | Primary Residual Defects Identified on Live Site |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **1. Visual Polish & Layout Integrity** | `0.20` | `58 / 100` | `90 / 100` | `+32` | `8.40` | Clinical encounter modals clip below `1366x768` fold; 11x11 perimeter tiles lack WP cost badges, ownership glow, and upgrade pips; generic colored circles for tokens |
| **2. Audio, Music & Sound Design** | `0.15` | `35 / 100` | `88 / 100` | `+53` | `9.75` | Top navbar `Sound` toggle produces no ambient music; raw un-enveloped oscillator steps cause square-wave click artifacts; `AudioContext` fails to resume cleanly on first gesture; no adaptive clinical tension audio |
| **3. Multimodal Feedback & Juice** | `0.15` | `42 / 100` | `89 / 100` | `+47` | `8.70` | Resource changes (`+RVU`, `+WP`, `+SBP`) only log as text; center Telemetry ECG (`72 BPM`, `120/80`) is static and disconnected from active player `SBP`/`BMI` and audio pulse |
| **4. Deduplication & Code Hygiene** | `0.15` | `54 / 100` | `88 / 100` | `+34` | `6.90` | Duplicate tile inspection info between perimeter tooltips and Magnified View; repeated inline string formatting for regimes/factions; dead/mocked WebRTC & Supabase UI shell in Network Command modal |
| **5. Core Gameplay & Long-Term Engagement** | `0.25` | `62 / 100` | `92 / 100` | `+30` | `9.50` | Hospital suite ownership has zero effect on clinical vignettes; no longitudinal patient readmissions; passive AI trading; no persistent `localStorage` Career Compendium |
| **6. Runtime Stability & Data Binding** | `0.10` | `45 / 100` | `96 / 100` | `+51` | `5.50` | Setup screen prints `RVU mult undefinedx`; Faction Race prints `undefined (undefined%)` and truncates role labels; Options button does not pause active timers |
| **Composite Weighted Score** | **`1.00`** | **`51.9 / 100`** | **`90.3 / 100`** | **`+38.4`** | - | **Top 3 Boosting Priorities: (1) Audio/Music, (2) Gameplay Synergies, (3) Multimodal + Visuals** |

## 2. Deduplication & UI Consolidation Audit
1. **Consolidate Mocked Network Command Modal**: The *Cardiology Network Command* modal exposes dead WebRTC Mesh and Supabase Cloud UI controls that always fall back to local storage. Replace dead network connection buttons with the functional **Career Compendium & Trial Registry** panel backed by `localStorage`.
2. **Unified Regime & Faction Formatter**: Replace scattered string concatenations for regime rules and faction progress with two single-source-of-truth helpers (`formatRegimeRuleText(regime)` and `computePlayerFactionProgress(player, gameState)`).
3. **Deduplicate Tile Status Readouts**: Make the 11x11 perimeter tiles self-sufficient for macro scanning (showing cost badge, owner border glow, and 1-4 upgrade pips) while reserving the sidebar **Magnified View** for full rent tables, SBP/BMI deltas, and mortgage/upgrade action buttons.
