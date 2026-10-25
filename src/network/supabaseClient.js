/**
 * Cardiopoly - Supabase Cloud Persistence & Offline Fallback Client
 * 
 * Provides unified data storage for game sessions, clinical case decision telemetry,
 * and international competitive leaderboards with seamless offline local-storage fallback.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyDBModule = exports;
    root.CardiopolyDB = exports.CardiopolyDB;
    root.createSupabaseClient = exports.createSupabaseClient;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STORAGE_KEYS = {
    SESSIONS: 'cardiopoly_db_sessions',
    LEADERBOARDS: 'cardiopoly_db_leaderboards',
    DECISIONS: 'cardiopoly_db_decisions'
  };

  /**
   * Seed curated global leaderboard records for international healthcare comparisons.
   */
  var SEED_LEADERBOARDS = [
    {
      id: 'lb-1',
      rank: 1,
      playerName: 'Dr. Evelyn Reed',
      countryId: 'SG',
      regimeName: 'Singapore 3M',
      factionId: 'ACADEMIC_CLINICIAN',
      score: 9850,
      gdmtScore: 94,
      encountersCompleted: 15,
      wp: 180,
      date: '2026-10-24T14:20:00Z'
    },
    {
      id: 'lb-2',
      rank: 2,
      playerName: 'Dr. Marcus Vance',
      countryId: 'US',
      regimeName: 'United States Multi-Payer',
      factionId: 'INTERVENTIONALIST',
      score: 9420,
      gdmtScore: 78,
      encountersCompleted: 18,
      wp: 820,
      date: '2026-10-25T09:12:00Z'
    },
    {
      id: 'lb-3',
      rank: 3,
      playerName: 'Directrice Claire Dubois',
      countryId: 'FR',
      regimeName: 'France Sécurité Sociale',
      factionId: 'HOSPITAL_CEO',
      score: 9150,
      gdmtScore: 82,
      encountersCompleted: 11,
      wp: 410,
      date: '2026-10-25T11:45:00Z'
    },
    {
      id: 'lb-4',
      rank: 4,
      playerName: 'Dr. Kenji Takahashi',
      countryId: 'JP',
      regimeName: 'Japan SHI',
      factionId: 'ACADEMIC_CLINICIAN',
      score: 8900,
      gdmtScore: 91,
      encountersCompleted: 13,
      wp: 240,
      date: '2026-10-25T16:04:00Z'
    },
    {
      id: 'lb-5',
      rank: 5,
      playerName: 'Prof. Hans Weber',
      countryId: 'DE',
      regimeName: 'Germany GKV',
      factionId: 'REGULATORY_AUDITOR',
      score: 8750,
      gdmtScore: 88,
      encountersCompleted: 10,
      wp: 190,
      date: '2026-10-25T18:30:00Z'
    },
    {
      id: 'lb-6',
      rank: 6,
      playerName: 'Dr. Sofia Chen',
      countryId: 'SG',
      regimeName: 'Singapore 3M',
      factionId: 'HOSPITAL_CEO',
      score: 8600,
      gdmtScore: 85,
      encountersCompleted: 12,
      wp: 320,
      date: '2026-10-25T20:15:00Z'
    },
    {
      id: 'lb-7',
      rank: 7,
      playerName: 'Dott. Matteo Rossi',
      countryId: 'IT',
      regimeName: 'Italy SSN',
      factionId: 'INTERVENTIONALIST',
      score: 8400,
      gdmtScore: 75,
      encountersCompleted: 16,
      wp: 650,
      date: '2026-10-25T22:00:00Z'
    }
  ];

  /**
   * Safe persistent memory / localStorage abstraction
   */
  function MemoryStorageAdapter() {
    this.store = {};
  }
  MemoryStorageAdapter.prototype.getItem = function (key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  };
  MemoryStorageAdapter.prototype.setItem = function (key, value) {
    this.store[key] = String(value);
  };
  MemoryStorageAdapter.prototype.removeItem = function (key) {
    delete this.store[key];
  };

  function getStorage(driver) {
    if (driver === 'memory') {
      return new MemoryStorageAdapter();
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        var testKey = '__test_ls__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      } catch (e) {
        return new MemoryStorageAdapter();
      }
    }
    return new MemoryStorageAdapter();
  }

  /**
   * CardiopolyDB constructor
   */
  function CardiopolyDB(options) {
    options = options || {};
    this.supabaseUrl = options.supabaseUrl || '';
    this.supabaseKey = options.supabaseKey || '';
    this.offlineFallback = options.offlineFallback !== false;
    this.storage = getStorage(options.storageDriver);

    // Initialize seed leaderboards in storage if empty
    if (!this.storage.getItem(STORAGE_KEYS.LEADERBOARDS)) {
      this.storage.setItem(STORAGE_KEYS.LEADERBOARDS, JSON.stringify(SEED_LEADERBOARDS));
    }
  }

  /**
   * Checks whether valid Supabase cloud configuration is present.
   */
  CardiopolyDB.prototype.isConfigured = function () {
    return Boolean(
      this.supabaseUrl &&
      this.supabaseUrl.trim().length > 0 &&
      this.supabaseKey &&
      this.supabaseKey.trim().length > 0 &&
      this.supabaseUrl.indexOf('example-placeholder') === -1
    );
  };

  /**
   * Saves a completed game session.
   * Gracefully caches locally in storage if offline or Supabase is unconfigured.
   */
  CardiopolyDB.prototype.saveGameSession = function (sessionData) {
    if (!sessionData) {
      return { success: false, error: 'No sessionData provided' };
    }

    var record = {
      id: sessionData.id || 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      countryId: sessionData.countryId || 'SG',
      winnerFaction: sessionData.winnerFaction || 'UNKNOWN',
      winnerPlayerName: sessionData.winnerPlayerName || 'Doctor',
      totalTurns: sessionData.totalTurns || 0,
      scores: sessionData.scores || {},
      clinicalMetrics: sessionData.clinicalMetrics || {},
      savedAt: new Date().toISOString()
    };

    // Save locally
    var sessions = this.getLocalSessions();
    sessions.unshift(record);
    // Keep max 50 recent sessions
    if (sessions.length > 50) sessions = sessions.slice(0, 50);
    this.storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Try cloud REST dispatch if online and configured
    var isOnline = (typeof navigator !== 'undefined' && navigator.onLine !== false);
    if (this.isConfigured() && isOnline && typeof fetch === 'function') {
      try {
        fetch(this.supabaseUrl.replace(/\/$/, '') + '/rest/v1/game_sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': 'Bearer ' + this.supabaseKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(record)
        }).catch(function (err) {
          console.warn('[CardiopolyDB] Supabase async sync warning:', err);
        });
      } catch (err) {
        console.warn('[CardiopolyDB] Supabase network exception:', err);
      }
    }

    return {
      success: true,
      savedLocally: true,
      session: record
    };
  };

  /**
   * Returns list of cached local sessions.
   */
  CardiopolyDB.prototype.getLocalSessions = function () {
    try {
      var raw = this.storage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  /**
   * Fetches global leaderboard rankings with optional filtering by countryId or factionId.
   */
  CardiopolyDB.prototype.fetchGlobalLeaderboards = function (filters) {
    filters = filters || {};
    var countryId = filters.countryId;
    var factionId = filters.factionId;

    var rawBoards = [];
    try {
      var raw = this.storage.getItem(STORAGE_KEYS.LEADERBOARDS);
      rawBoards = raw ? JSON.parse(raw) : SEED_LEADERBOARDS.slice();
    } catch (e) {
      rawBoards = SEED_LEADERBOARDS.slice();
    }

    // Filter
    var filtered = rawBoards.filter(function (entry) {
      if (countryId && entry.countryId !== countryId) return false;
      if (factionId && entry.factionId !== factionId) return false;
      return true;
    });

    // Sort by score descending
    filtered.sort(function (a, b) {
      return (b.score || 0) - (a.score || 0);
    });

    // Reassign continuous rank numbers
    return filtered.map(function (item, idx) {
      return Object.assign({}, item, { rank: idx + 1 });
    });
  };

  /**
   * Logs a clinical encounter decision for longitudinal decision analytics.
   */
  CardiopolyDB.prototype.logClinicalDecision = function (vignetteDecision) {
    if (!vignetteDecision) {
      return { success: false, error: 'No decision data provided' };
    }

    var record = {
      id: vignetteDecision.id || 'dec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      vignetteId: vignetteDecision.vignetteId,
      playerIndex: vignetteDecision.playerIndex,
      factionId: vignetteDecision.factionId,
      choiceSelected: vignetteDecision.choiceSelected,
      adherent: Boolean(vignetteDecision.adherent),
      clinicalScore: vignetteDecision.clinicalScore || 0,
      timestamp: new Date().toISOString()
    };

    var decisions = this.getLocalDecisions();
    decisions.unshift(record);
    if (decisions.length > 100) decisions = decisions.slice(0, 100);
    this.storage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));

    return {
      success: true,
      savedLocally: true,
      decision: record
    };
  };

  /**
   * Returns list of cached local clinical decisions.
   */
  CardiopolyDB.prototype.getLocalDecisions = function () {
    try {
      var raw = this.storage.getItem(STORAGE_KEYS.DECISIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  function createSupabaseClient(config) {
    return new CardiopolyDB(config);
  }

  return {
    CardiopolyDB: CardiopolyDB,
    createSupabaseClient: createSupabaseClient,
    SEED_LEADERBOARDS: SEED_LEADERBOARDS
  };
}));
