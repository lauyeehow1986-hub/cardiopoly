/**
 * Cardiopoly - Web Audio API Synthesizer
 * 
 * Provides crisp, zero-dependency medical and arcade audio feedback:
 * - Dice clicks
 * - Dynamic ECG telemetry beeps (pitch-scaled with SBP)
 * - Hospital defibrillator charge tones
 * - Billing / cash register chimes
 * - Hypertensive crisis / Code Blue dual-tone alert alarms
 * - Flatline tones
 * 
 * Completely self-contained, handles browser autoplay policies safely,
 * and falls back gracefully in headless or restricted environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyAudio = exports;
    root.audioSynth = exports.audioSynth;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STORAGE_KEY_MUTED = 'cardiopoly_audio_muted';

  function createAudioSynth(options) {
    options = options || {};
    var isHeadless = Boolean(options.headless || (typeof window === 'undefined') || (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined'));
    var muted = false;

    // Load initial mute preference from localStorage if available
    if (!isHeadless && typeof window !== 'undefined' && window.localStorage) {
      try {
        muted = window.localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
      } catch (e) {
        muted = false;
      }
    }

    var audioCtx = null;

    function getAudioContext() {
      if (isHeadless) return null;
      if (!audioCtx) {
        try {
          var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
          }
        } catch (e) {
          audioCtx = null;
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        try {
          audioCtx.resume().catch(function () {});
        } catch (e) {}
      }
      return audioCtx;
    }

    function isMuted() {
      return muted;
    }

    function setMuted(val) {
      muted = Boolean(val);
      if (!isHeadless && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
        } catch (e) {}
      }
      return muted;
    }

    function toggleMute() {
      return setMuted(!muted);
    }

    /**
     * Play dice roll clicking sound
     */
    function playDiceRoll() {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var now = ctx.currentTime;
        var clicks = 3 + Math.floor(Math.random() * 3);
        for (var i = 0; i < clicks; i++) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var startTime = now + (i * 0.045) + (Math.random() * 0.02);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(240 + Math.random() * 180, startTime);
          osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.035);

          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.04);
        }
      } catch (e) {}
    }

    /**
     * Play real-time ECG QRS telemetry beep (frequency scales with SBP)
     */
    function playEcgBeep(sbp) {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var validSbp = (typeof sbp === 'number' && !isNaN(sbp)) ? sbp : 120;
        // Baseline 800 Hz at SBP 120; ascends to 1250 Hz at SBP 200
        var freq = Math.min(1400, Math.max(650, 800 + (validSbp - 120) * 5.6));
        var now = ctx.currentTime;

        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {}
    }

    /**
     * Play cash register / fee collection chime
     */
    function playCashChime() {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var now = ctx.currentTime;
        var notes = [1318.51, 1567.98]; // E6, G6
        notes.forEach(function (freq, index) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var startTime = now + (index * 0.08);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
      } catch (e) {}
    }

    /**
     * Play clinical emergency / Code Blue alarm
     */
    function playAlertAlarm() {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var now = ctx.currentTime;
        // Dual-tone high-priority alert (950 Hz -> 750 Hz)
        var tones = [950, 750, 950, 750];
        tones.forEach(function (freq, idx) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var startTime = now + (idx * 0.12);

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.08, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.10);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.11);
        });
      } catch (e) {}
    }

    /**
     * Play defibrillator charging tone
     */
    function playDefibrillatorCharge() {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.65);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.50);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.70);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.72);
      } catch (e) {}
    }

    /**
     * Play cardiac flatline tone
     */
    function playFlatline() {
      if (muted || isHeadless) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      } catch (e) {}
    }

    return {
      playDiceRoll: playDiceRoll,
      playEcgBeep: playEcgBeep,
      playCashChime: playCashChime,
      playAlertAlarm: playAlertAlarm,
      playDefibrillatorCharge: playDefibrillatorCharge,
      playDefibCharge: playDefibrillatorCharge,
      playFlatline: playFlatline,
      isMuted: isMuted,
      setMuted: setMuted,
      toggleMute: toggleMute,
      getAudioContext: getAudioContext
    };
  }

  var defaultInstance = createAudioSynth();

  return {
    createAudioSynth: createAudioSynth,
    audioSynth: defaultInstance
  };
}));
