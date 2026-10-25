/**
 * Cardiopoly - Real-time Physiological Telemetry Engine
 * 
 * Provides physiological waveform simulation (ECG P-Q-R-S-T morphology, ABP)
 * and interactive HTML5 Canvas oscilloscope rendering with glowing medical display.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CardiopolyTelemetry = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Computes expected pulse rate (BPM) based on Systolic Blood Pressure (SBP).
   * Baseline SBP of 120 mmHg corresponds to 72 BPM resting heart rate.
   * Dynamic response: 0.6 BPM increase per 1 mmHg SBP elevation.
   *
   * @param {number} [sbp=120] - Systolic Blood Pressure in mmHg
   * @returns {number} Heart rate in beats per minute (BPM)
   */
  function computePulseRate(sbp) {
    var validSbp = (typeof sbp === 'number' && !isNaN(sbp)) ? sbp : 120;
    return Math.round(72 + (validSbp - 120) * 0.6);
  }

  /**
   * Generates instantaneous ECG voltage sample for a normalized cardiac phase [0, 1).
   * Models anatomical P-Q-R-S-T wave complex using sum of Gaussian distributions:
   * - P wave (atrial depolarization): peak at 0.20, width 0.025, amp +0.18
   * - Q dip (septal depolarization): peak at 0.35, width 0.015, amp -0.20
   * - R spike (ventricular depolarization peak): peak at 0.40, width 0.012, amp +1.05
   * - S dip (late ventricular depolarization): peak at 0.45, width 0.018, amp -0.32
   * - T wave (ventricular repolarization): peak at 0.72, width 0.045, amp +0.28
   * - Isoelectric baseline elsewhere: ~0.0
   *
   * @param {number} phase - Cardiac cycle phase from 0.0 to 1.0 (wraps periodically)
   * @returns {number} Normalized voltage deflection amplitude (-0.4 to +1.1)
   */
  function generateEcgSample(phase) {
    // Wrap phase cleanly to [0, 1) and mitigate IEEE 754 floating point wobble
    var p = ((phase % 1) + 1) % 1;
    p = Math.round(p * 1e8) / 1e8;
    if (p >= 1) p = 0;

    // Gaussian bell curve helper: a * exp(-((x - b)^2) / (2 * c^2))
    function gaussian(x, amp, center, width) {
      var diff = x - center;
      return amp * Math.exp(-(diff * diff) / (2 * width * width));
    }

    var pWave = gaussian(p, 0.18, 0.20, 0.025);
    var qWave = gaussian(p, -0.20, 0.35, 0.015);
    var rWave = gaussian(p, 1.05, 0.40, 0.012);
    var sWave = gaussian(p, -0.32, 0.45, 0.018);
    var tWave = gaussian(p, 0.28, 0.72, 0.045);

    // Sum wave components
    return pWave + qWave + rWave + sWave + tWave;
  }

  /**
   * Initializes real-time scrolling/sweeping ECG telemetry on an HTML5 canvas element.
   *
   * @param {HTMLCanvasElement|null} canvasEl - Target canvas element
   * @param {Object} [options] - Configuration overrides
   * @returns {Object} Telemetry controller instance { start, stop, update, destroy, getVitals }
   */
  function initTelemetryCanvas(canvasEl, options) {
    var opts = options || {};
    var sbp = (typeof opts.sbp === 'number') ? opts.sbp : 120;
    var dbp = (typeof opts.dbp === 'number') ? opts.dbp : 80;
    var lineColor = opts.lineColor || '#06b6d4'; // Glowing neon cyan default
    var glowColor = opts.glowColor || 'rgba(6, 182, 212, 0.65)';
    var isRunning = false;
    var animFrameId = null;

    if (!canvasEl || typeof canvasEl.getContext !== 'function') {
      return {
        start: function () {},
        stop: function () {},
        destroy: function () {},
        update: function (newOpts) {
          if (newOpts) {
            if (typeof newOpts.sbp === 'number') sbp = newOpts.sbp;
            if (typeof newOpts.dbp === 'number') dbp = newOpts.dbp;
          }
        },
        getVitals: function () {
          return { sbp: sbp, dbp: dbp, hr: computePulseRate(sbp) };
        }
      };
    }

    var ctx = canvasEl.getContext('2d');
    var phase = 0;
    var sweepX = 0;
    var points = [];
    var maxPoints = 300;
    var lastTimestamp = null;

    function resize() {
      if (!canvasEl.parentElement) return;
      var rect = canvasEl.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var width = rect.width || canvasEl.width || 300;
      var height = rect.height || canvasEl.height || 60;

      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      maxPoints = Math.max(100, Math.floor(width));
      while (points.length > maxPoints) {
        points.shift();
      }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', resize);
    }
    resize();

    function drawGrid(w, h) {
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      var gridSize = 20;

      ctx.beginPath();
      for (var x = 0; x < w; x += gridSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (var y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      // Isoelectric midline
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.stroke();
      ctx.restore();
    }

    function render(timestamp) {
      if (!isRunning) return;

      if (!lastTimestamp) lastTimestamp = timestamp;
      var dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Cap delta time to prevent leap after tab suspension
      if (dt > 0.1) dt = 0.1;

      var currentHr = computePulseRate(sbp);
      var beatsPerSec = currentHr / 60;
      phase = (phase + dt * beatsPerSec) % 1.0;

      var voltage = generateEcgSample(phase);
      points.push(voltage);
      if (points.length > maxPoints) {
        points.shift();
      }

      var rect = canvasEl.getBoundingClientRect ? canvasEl.getBoundingClientRect() : { width: canvasEl.width, height: canvasEl.height };
      var w = rect.width || canvasEl.width || 300;
      var h = rect.height || canvasEl.height || 60;

      // Clear with dark slate backdrop
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      // Draw ECG trace with neon glow
      if (points.length > 1) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        var midY = h * 0.55;
        var ampY = h * 0.38;
        var stepX = w / (maxPoints - 1);

        ctx.beginPath();
        for (var i = 0; i < points.length; i++) {
          var px = i * stepX;
          var py = midY - points[i] * ampY;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        // Glowing sweep head dot
        var headX = (points.length - 1) * stepX;
        var headY = midY - points[points.length - 1] * ampY;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      if (isRunning) {
        animFrameId = (typeof requestAnimationFrame !== 'undefined')
          ? requestAnimationFrame(render)
          : setTimeout(function () { render(Date.now()); }, 16);
      }
    }

    function start() {
      if (!isRunning) {
        isRunning = true;
        lastTimestamp = null;
        if (typeof requestAnimationFrame !== 'undefined') {
          animFrameId = requestAnimationFrame(render);
        } else {
          animFrameId = setTimeout(function () { render(Date.now()); }, 16);
        }
      }
    }

    function stop() {
      isRunning = false;
      if (animFrameId) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(animFrameId);
        } else {
          clearTimeout(animFrameId);
        }
        animFrameId = null;
      }
    }

    function destroy() {
      stop();
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('resize', resize);
      }
      points = [];
    }

    function update(newOpts) {
      if (!newOpts) return;
      if (typeof newOpts.sbp === 'number') sbp = newOpts.sbp;
      if (typeof newOpts.dbp === 'number') dbp = newOpts.dbp;
      if (newOpts.lineColor) lineColor = newOpts.lineColor;
      if (newOpts.glowColor) glowColor = newOpts.glowColor;
    }

    function getVitals() {
      return {
        sbp: sbp,
        dbp: dbp,
        hr: computePulseRate(sbp)
      };
    }

    // Auto-start by default
    start();

    return {
      start: start,
      stop: stop,
      destroy: destroy,
      update: update,
      getVitals: getVitals
    };
  }

  return {
    computePulseRate: computePulseRate,
    generateEcgSample: generateEcgSample,
    initTelemetryCanvas: initTelemetryCanvas
  };
}));
