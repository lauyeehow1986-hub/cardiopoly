# 02 - MCP Server Ecosystem & Integration Guide for Cardiopoly

## 1. Real-World News & Macroeconomic Shock MCPs (Driving Patient Volume & Insurance)
- **Brave Search Official MCP (`@brave/brave-search-mcp-server`)**: `https://github.com/brave/brave-search-mcp-server`
  - Pulls live breaking news headlines on respiratory outbreaks, hospital overcrowding, and healthcare strikes to trigger in-game **Patient Volume Multipliers** (`0.7x` to `1.8x` vignette frequency).
- **Tavily Real-Time Research MCP (`tavily-mcp`)**: `https://github.com/tavily-ai/tavily-mcp`
  - Extracts structured summaries from global health & financial news to generate dynamic *Breaking News Ticker* events at the top of the Cardiopoly HUD.
- **FRED Economic Data MCP (`fred-mcp-server`)**: `https://github.com/stefanoamorelli/fred-mcp-server`
  - Queries 800,000+ Federal Reserve macroeconomic time series (medical care CPI, inflation, unemployment, insurance premium indices) to dynamically adjust regime `coPayRate` and `rentMult`.

## 2. Medical Guidelines, Clinical Trials & Supply Shortage MCPs
- **OpenFDA MCP Server (`@cyanheads/openfda-mcp-server`)**: `https://github.com/cyanheads/openfda-mcp-server`
  - Queries live FDA Drug & Medical Device Shortages and Recalls (e.g., iodinated contrast media shortages, heparin recalls, or coronary stent recalls) to dynamically alter `INVASIVE CATH / STENT` costs and complication probabilities.
- **PubMed MCP Server (`PubMed-MCP-Server` / `pubmedmcp`)**: `https://github.com/Augmented-Nature/PubMed-MCP-Server` and `https://github.com/grll/pubmedmcp`
  - Fetches recent cardiology meta-analyses and ACC/AHA/ESC/MOH clinical practice guideline updates to generate fresh, evidence-graded clinical vignettes.
- **ClinicalTrials.gov MCP Server (`ClinicalTrials-MCP-Server`)**: `https://github.com/Augmented-Nature/ClinicalTrials-MCP-Server`
  - Queries real ongoing and completed cardiovascular trials to expand the in-game `localStorage` **Career & Trial Compendium**.
- **BioMCP (`genomoncology/biomcp`)**: `https://github.com/genomoncology/biomcp`
  - Provides structured biomedical entity lookup for drugs, biomarkers, and adverse interactions.

## 3. Game Visual Artifacts, Cover Image & Character Design MCPs
- **Fal.ai MCP Server (`fal-mcp-server`)**: `https://github.com/raveenb/fal-mcp-server`
  - Generates high-speed Flux Pro cover art, Recraft V3 vector/SVG hospital suite icons, and consistent character portraits for the 4 factions (`Academic Clinician`, `Interventionalist`, `Hospital CEO`, `Regulatory Auditor`).
- **Replicate Official MCP (`mcp.replicate.com` / `mcp-replicate`)**: `https://mcp.replicate.com/` and `https://github.com/deepfates/mcp-replicate`
  - Runs Flux, SDXL, and transparent-background sprite generators directly from Antigravity into `assets/images/`.

## 4. AI Music Synthesis, Game Audio SFX & Character Voiceover MCPs
- **ElevenLabs Official Hosted MCP (`https://api.elevenlabs.io/v1/mcp`)**: `https://elevenlabs.io/mcp` and `https://github.com/elevenlabs/elevenlabs-mcp`
  - Generates expressive character voiceovers (e.g., *Inspector Clawback* announcing an audit freeze, *Dr. Cath-A-Lot* celebrating a high-RVU stent) and bespoke hospital sound effects (`text_to_sound_effects`) saved into `assets/audio/vo/` and `assets/audio/sfx/`.
- **Suno Music MCP (`suno-mcp`)**: `https://github.com/sandraschi/suno-mcp` and `https://github.com/unforced/suno-mcp`
  - Synthesizes full background music stems (e.g., lo-fi clinical strategy theme for normal play, high-tempo synthwave for *Code Blue* / *Live Clinical Auctions*).
- **MiniMax Official MCP (`minimax-mcp` / `minimax-mcp-js`)**: `https://github.com/minimax-ai/minimax-mcp` and `https://github.com/MiniMax-AI/MiniMax-MCP-JS`
  - All-in-one official server providing high-fidelity Speech-02 voiceover synthesis, voice cloning, image generation, and video generation.

## 5. Short Video Snippets for In-Game Video Cut-Ins MCPs
- **Luma Dream Machine Ray/Photon MCP (`luma-api-mcp`)**: `https://github.com/lumalabs/luma-api-mcp`
  - Generates 3-5 second dramatic `.mp4`/`.webm` cut-in animations from character/suite reference keyframes (e.g., *High-Risk PCI Stent Deployment*, *Code Blue Defibrillation*, *Ministry Audit Raid*).
- **RunwayML + Luma Video Gen MCP (`mcp-video-gen`)**: `https://github.com/wheattoast11/mcp-video-gen`
  - Generates image-to-video cut-ins with automated prompt enhancement and audio layering.
