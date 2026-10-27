const fs = require('fs');
const path = require('path');

const bridgePath = path.join(__dirname, '..', 'patches', 'cardiopoly_mcp_runtime_bridge.js');
let code = fs.readFileSync(bridgePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Upgrade CUTIN_PRESETS so MP4 is primary, and macro_shock has a rich visual poster & video
const targetPresets = `const CUTIN_PRESETS = {
  code_blue: {
    videoSrc: 'assets/video/cutins/code_blue.webm',
    posterSrc: 'assets/images/cutins/code_blue.jpg',
    accentColor: '#ef4444',
    title: 'CODE BLUE HOSPITALIZATION',
    subtitle: 'Emergency Ventricular Fibrillation Resuscitation'
  },
  cath_lab: {
    videoSrc: 'assets/video/cutins/cath_lab.webm',
    posterSrc: 'assets/images/cutins/cath_lab.jpg',
    accentColor: '#06b6d4',
    title: 'HIGH-RISK CATH / STENT DEPLOYED',
    subtitle: 'Percutaneous Coronary Intervention in Progress'
  },
  regulatory_audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  monopoly_complete: {
    videoSrc: null,
    posterSrc: 'assets/images/cardiopoly_centerpiece_remastered.jpg',
    accentColor: '#10b981',
    title: 'DEPARTMENT MONOPOLY FORMED',
    subtitle: 'Full Clinical Department Consolidation Achieved'
  },
  macro_shock: {
    videoSrc: null,
    posterSrc: null,
    accentColor: '#38bdf8',
    title: 'MACRO POLICY SHIFT',
    subtitle: 'Global Healthcare Economic Intervention'
  }
};`;

const replacementPresets = `const CUTIN_PRESETS = {
  code_blue: {
    videoSrc: 'assets/video/cutins/code_blue.mp4',
    videoWebm: 'assets/video/cutins/code_blue.webm',
    posterSrc: 'assets/images/cutins/code_blue.jpg',
    accentColor: '#ef4444',
    title: 'CODE BLUE HOSPITALIZATION',
    subtitle: 'Emergency Ventricular Fibrillation Resuscitation'
  },
  cath_lab: {
    videoSrc: 'assets/video/cutins/cath_lab.mp4',
    videoWebm: 'assets/video/cutins/cath_lab.webm',
    posterSrc: 'assets/images/cutins/cath_lab.jpg',
    accentColor: '#06b6d4',
    title: 'HIGH-RISK CATH / STENT DEPLOYED',
    subtitle: 'Percutaneous Coronary Intervention in Progress'
  },
  regulatory_audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.mp4',
    videoWebm: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  audit: {
    videoSrc: 'assets/video/cutins/regulatory_audit.mp4',
    videoWebm: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#f59e0b',
    title: 'REGULATORY CLAWBACK & CLINICAL AUDIT',
    subtitle: 'Ministry of Health Billing Clawback Enforced'
  },
  monopoly_complete: {
    videoSrc: null,
    videoWebm: null,
    posterSrc: 'assets/images/cardiopoly_centerpiece_remastered.jpg',
    accentColor: '#10b981',
    title: 'DEPARTMENT MONOPOLY FORMED',
    subtitle: 'Full Clinical Department Consolidation Achieved'
  },
  macro_shock: {
    videoSrc: 'assets/video/cutins/regulatory_audit.mp4',
    videoWebm: 'assets/video/cutins/regulatory_audit.webm',
    posterSrc: 'assets/images/cutins/regulatory_audit.jpg',
    accentColor: '#38bdf8',
    title: 'MACROECONOMIC HEALTHCARE SHOCK',
    subtitle: 'Global Policy & Tariff Intervention Active'
  }
};`;

if (!code.includes(targetPresets)) {
  console.error("targetPresets not found!");
  process.exit(1);
}

code = code.replace(targetPresets, replacementPresets);
console.log("✓ Updated CUTIN_PRESETS with universal MP4 and rich macro_shock media");

// 2. Upgrade mediaMarkup generation and video autoplay resilience
const targetMediaMarkup = `    let mediaMarkup = '';
    if (videoSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <video class="cutin-video" autoplay muted loop playsinline
                 onerror="this.style.display='none'; const p=this.nextElementSibling; if(p) p.style.display='block';">
            <source src="\${videoSrc}" type="video/webm">
            <source src="\${videoSrc.replace(/\\.webm$/, '.mp4')}" type="video/mp4">
          </video>
          \${posterSrc ? \`<img class="cutin-poster" src="\${posterSrc}" alt="\${title}" style="display:none;" />\` : ''}
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else if (posterSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <img class="cutin-poster" src="\${posterSrc}" alt="\${title}" />
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else {
      mediaMarkup = \`
        <div class="cutin-media-container cutin-procedural">
          <svg viewBox="0 0 320 90" width="100%" height="90">
            <polyline fill="none" stroke="\${accentColor}" stroke-width="3.5"
              points="0,45 55,45 70,20 85,75 102,10 120,82 138,38 155,45 320,45" />
          </svg>
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    }`;

const replacementMediaMarkup = `    let mediaMarkup = '';
    const mp4Url = videoSrc ? (videoSrc.endsWith('.mp4') ? videoSrc : videoSrc.replace(/\\.webm$/, '.mp4')) : null;
    const webmUrl = preset.videoWebm || (videoSrc && videoSrc.endsWith('.webm') ? videoSrc : (videoSrc ? videoSrc.replace(/\\.mp4$/, '.webm') : null));

    if (mp4Url) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          \${posterSrc ? \`<img class="cutin-poster" src="\${posterSrc}" alt="\${title}" />\` : ''}
          <video class="cutin-video" autoplay muted loop playsinline webkit-playsinline preload="auto">
            <source src="\${mp4Url}" type="video/mp4">
            \${webmUrl ? \`<source src="\${webmUrl}" type="video/webm">\` : ''}
          </video>
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else if (posterSrc) {
      mediaMarkup = \`
        <div class="cutin-media-container">
          <img class="cutin-poster" src="\${posterSrc}" alt="\${title}" />
          \${vfibCanvasMarkup}
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    } else {
      // Dynamic 60 FPS CRT Radar & Market Ticker Oscilloscope (Never a static line!)
      mediaMarkup = \`
        <div class="cutin-media-container cutin-procedural">
          <canvas class="cutin-macro-canvas" width="640" height="240" aria-label="Macroeconomic Telemetry"></canvas>
          <div class="cutin-scanlines"></div>
        </div>
      \`;
    }`;

if (!code.includes(targetMediaMarkup)) {
  console.error("targetMediaMarkup not found!");
  process.exit(1);
}

code = code.replace(targetMediaMarkup, replacementMediaMarkup);
console.log("✓ Updated mediaMarkup generation with layered poster + fast-start MP4");

// 3. Upgrade video element autoplay handling and dynamic macro canvas
const targetVideoInit = `    // Assure video autoplay in all modern browsers
    if (typeof document !== 'undefined') {
      const videoEl = el.querySelector ? el.querySelector('.cutin-video') : null;
      if (videoEl) {
        videoEl.muted = true;
        videoEl.playsInline = true;
        try {
          const p = videoEl.play();
          if (p !== undefined) {
            p.catch(() => {
              const posterEl = el.querySelector('.cutin-poster');
              if (posterEl) posterEl.style.display = 'block';
              videoEl.style.display = 'none';
            });
          }
        } catch (_) {}
      }
    }`;

const replacementVideoInit = `    // Assure video autoplay in all modern browsers (mobile & desktop)
    if (typeof document !== 'undefined') {
      const videoEl = el.querySelector ? el.querySelector('.cutin-video') : null;
      const posterEl = el.querySelector ? el.querySelector('.cutin-poster') : null;
      if (videoEl) {
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');

        // When video begins playing, smoothly reveal it over the poster
        videoEl.onplaying = () => {
          videoEl.style.opacity = '1';
        };

        try {
          videoEl.load();
          const p = videoEl.play();
          if (p !== undefined) {
            p.catch((err) => {
              // If mobile autoplay was blocked or Low Data Mode active, keep poster visible
              videoEl.style.opacity = '0';
              if (posterEl) posterEl.style.opacity = '1';
            });
          }
        } catch (_) {
          if (posterEl) posterEl.style.opacity = '1';
        }
      }

      // Dynamic Procedural Macro Chart (for macro shock or offline fallbacks)
      const macroCanvas = el.querySelector ? el.querySelector('.cutin-macro-canvas') : null;
      if (macroCanvas && typeof macroCanvas.getContext === 'function') {
        const mctx = macroCanvas.getContext('2d');
        const mStart = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const renderMacro = (now) => {
          if (!el || el.classList.contains('hidden') || !macroCanvas) return;
          const elapsed = (now - mStart) / 1000;
          mctx.clearRect(0, 0, 640, 240);

          // 1. Grid lines
          mctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          mctx.lineWidth = 1;
          for (let gy = 20; gy < 240; gy += 30) {
            mctx.beginPath(); mctx.moveTo(0, gy); mctx.lineTo(640, gy); mctx.stroke();
          }
          for (let gx = 0; gx < 640; gx += 40) {
            mctx.beginPath(); mctx.moveTo(gx, 0); mctx.lineTo(gx, 240); mctx.stroke();
          }

          // 2. Animated Trendline Wave
          mctx.strokeStyle = accentColor || '#38bdf8';
          mctx.lineWidth = 3;
          mctx.shadowColor = accentColor || '#38bdf8';
          mctx.shadowBlur = 12;
          mctx.beginPath();
          for (let x = 0; x < 640; x += 4) {
            const phase = x * 0.03 + elapsed * 8;
            const y = 120 + Math.sin(phase) * 35 + Math.cos(phase * 0.5) * 20;
            if (x === 0) mctx.moveTo(x, y);
            else mctx.lineTo(x, y);
          }
          mctx.stroke();

          // 3. Scanning Radar Line
          const scanX = (elapsed * 220) % 640;
          mctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
          mctx.fillRect(scanX - 30, 0, 30, 240);

          if (typeof requestAnimationFrame !== 'undefined') {
            this.macroAnimFrame = requestAnimationFrame(renderMacro);
          }
        };
        if (typeof requestAnimationFrame !== 'undefined') {
          this.macroAnimFrame = requestAnimationFrame(renderMacro);
        }
      }
    }`;

if (!code.includes(targetVideoInit)) {
  console.error("targetVideoInit not found!");
  process.exit(1);
}

code = code.replace(targetVideoInit, replacementVideoInit);
console.log("✓ Updated video element autoplay handling and dynamic macro canvas");

// 4. Update hide() to clean up macroAnimFrame
const targetHide = `  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.vfibAnimFrame && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.vfibAnimFrame);
      this.vfibAnimFrame = null;
    }
    if (typeof document !== 'undefined' && document.body?.classList) {
      document.body.classList.remove('code-blue-crisis-strobe');
    }
  }`;

const replacementHide = `  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.vfibAnimFrame && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.vfibAnimFrame);
      this.vfibAnimFrame = null;
    }
    if (this.macroAnimFrame && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.macroAnimFrame);
      this.macroAnimFrame = null;
    }
    if (typeof document !== 'undefined' && document.body?.classList) {
      document.body.classList.remove('code-blue-crisis-strobe');
    }
  }`;

if (!code.includes(targetHide)) {
  console.error("targetHide not found!");
  process.exit(1);
}

code = code.replace(targetHide, replacementHide);

fs.writeFileSync(bridgePath, code.replace(/\n/g, '\r\n'), 'utf8');
console.log("Successfully wrote upgraded cardiopoly_mcp_runtime_bridge.js!");
