const fs = require('fs');
const path = require('path');

const targetSection = `### 2. Procedural Sound & Dynamic Gameflow Pacing Framework (PSDPBS-5)

Procedural Web Audio and game pacing are symbiotic: sound drives emotional tempo, and dynamic pacing prevents turn fatigue. Apply the **5-Pillar Procedural Sound & Dynamic Pacing Standard**:

#### Pillar 1: Dynamic Gameflow & Movement Pacing Curve ($T_{step}$)
Never use fixed linear step delays for board movement or entity traversal. High rolls (e.g. 10–12 tiles) feel sluggish under fixed 280ms delays (3.36s total duration), while small rolls (2–3 tiles) finish too quickly to register:
$$\\tau_{step}(D) = \\begin{cases} 
220\\text{ ms}, & D \\le 5 \\\\
\\max(110\\text{ ms}, 280 - (D - 6) \\times 24\\text{ ms}), & D > 5
\\end{cases}$$
- **Zero Dead-Time Bot Turns**: Bots should execute their decision cycle within 450–650ms, triggering brief highlight markers so human players understand bot actions without waiting.

#### Pillar 2: Psychoacoustic & Spectral Benchmarking ($B_{spectral}$)
Adhere to EBU R128 loudness standards across 4 audio layers:
- **Layer 1: Ambient Strategy Music / Pads**: $-18.0 \\pm 1.0\\text{ LUFS}$ (warm background presence).
- **Layer 2: UI Clicks & Token Traversal**: $-14.0 \\pm 1.0\\text{ LUFS}$ (crisp, non-fatiguing navigation ticks).
- **Layer 3: Event & Decision Stingers**: $-12.0 \\pm 1.0\\text{ LUFS}$ (satisfying resolution confirmation).
- **Layer 4: Critical Emergencies & Cut-Ins**: $-8.0 \\pm 1.0\\text{ LUFS}$ (high-stakes alarms, sirens, gavels).

**Frequency Spectrum Isolation:**
- **Heartbeat / Bass**: $40\\text{ Hz} - 120\\text{ Hz}$ (low-pass filtered; modulates wave type from sine to sawtooth under crisis).
- **Harmony / Chords**: $180\\text{ Hz} - 1400\\text{ Hz}$ (warm triangle/sine waves with 2400 Hz low-pass anti-aliasing).
- **Telemetry / Leads**: $1600\\text{ Hz} - 4500\\text{ Hz}$ (arpeggios with exponential decay).
- **Click Elimination**: Attack $\\ge 12\\text{ ms}$, release $\\ge 40\\text{ ms}$, with linear/exponential gain ramps to prevent DC offset clicks.

#### Pillar 3: Adaptive Harmonic Consonance Index ($H_{tension}$)
Dynamically modulate chord voicings and tempo based on live game state:
- **Calm State** (e.g. SBP < 145 mmHg): 72 BPM; lush Major 9th / 13th chords ($Dm9 \\to G13 \\to Cmaj9 \\to Am7$); dissonance index $< 0.15$.
- **Tension State** (e.g. 145 $\\le$ SBP < 175 mmHg, live auctions): 104 BPM; minor 9th / suspended chords with amber tension pulses.
- **Crisis State** (e.g. SBP $\\ge$ 175 mmHg, pre-Code Blue): 136 BPM; diminished 7th / tritone chords ($B\\text{dim7} \\to E7\\flat9 \\to Am9$); dissonance index $> 0.75$.

#### Pillar 4: Dynamic Acoustic Ducking ($D_{duck}$)
When high-priority events occur (dialog modals, video cut-ins, live auction final countdowns):
- Instantly duck the background music by $-12\\text{ dB}$ (gain factor: $0.25$) over $150\\text{ms}$.
- Restore music volume over $800\\text{ms}$ upon event dismissal.

#### Pillar 5: Multimodal Audio-Visual-Haptic Triad ($M_{triad}$)
Audio transients must synchronize with screen actions within $< 16.7\\text{ms}$ (1 video frame at 60 FPS). Every resource delta (\`+1500 RVU\`, \`-15 SBP\`) must trigger simultaneously with its acoustic stinger and visual badge.`;

const pathsToUpdate = [
  path.resolve(__dirname, '..', '.agents', 'skills', 'game-development', 'SKILL.md'),
  'C:\\Users\\lauye\\.gemini\\config\\skills\\game-gradient-booster\\SKILL.md'
];

pathsToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldSectionRegex = /### 2\. Click-Free Web Audio API Engine[\s\S]*?### 3\. Multimodal Feedback & Juice Matrix/;
    if (oldSectionRegex.test(content)) {
      content = content.replace(oldSectionRegex, `${targetSection}\n\n### 3. Multimodal Feedback & Juice Matrix`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[SKILL.md] Updated ${filePath}`);
    } else {
      console.warn(`[SKILL.md] Old section regex not matched in ${filePath}`);
    }
  } else {
    console.warn(`[SKILL.md] File not found: ${filePath}`);
  }
});

console.log('Skill documentation updated successfully.');
