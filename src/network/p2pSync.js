/**
 * Cardiopoly - WebRTC Peer-to-Peer Synchronization Engine (PeerJS)
 * 
 * Manages multiplayer game rooms, direct peer-to-peer data channels,
 * state synchronization, and action routing across 2-4 connected players.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CardiopolyP2PModule = exports;
    root.CardiopolyP2P = exports.CardiopolyP2P;
    root.createGameRoomPayload = exports.createGameRoomPayload;
    root.handleIncomingAction = exports.handleIncomingAction;
    root.generateRoomCode = exports.generateRoomCode;
    root.isValidRoomCode = exports.isValidRoomCode;
    root.P2PActionTypes = exports.P2PActionTypes;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROTOCOL_VERSION = 'CARDIOPOLY_P2P_v1';

  var P2PActionTypes = {
    ROLL_DICE: 'ROLL_DICE',
    CLINICAL_DECISION: 'CLINICAL_DECISION',
    PROPERTY_ACQUIRED: 'PROPERTY_ACQUIRED',
    TRADE_OFFER: 'TRADE_OFFER',
    REGIME_SHIFT: 'REGIME_SHIFT',
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    HEARTBEAT: 'HEARTBEAT',
    SYNC_STATE: 'SYNC_STATE'
  };

  /**
   * Generates a 3-4 character uppercase room code with prefix CARDIO-
   * Example: CARDIO-882, CARDIO-4K9
   */
  function generateRoomCode(prefix) {
    prefix = prefix || 'CARDIO';
    var chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    var suffix = '';
    for (var i = 0; i < 3; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + '-' + suffix;
  }

  /**
   * Validates room code format (CARDIO-XXX or CARDIO-XXXX)
   */
  function isValidRoomCode(code) {
    if (!code || typeof code !== 'string') return false;
    return /^CARDIO-[0-9A-Za-z]{3,4}$/.test(code.trim());
  }

  /**
   * Creates a standardized WebRTC wire protocol message payload.
   */
  function createGameRoomPayload(roomId, action, senderId, stateSnapshot) {
    return {
      protocol: PROTOCOL_VERSION,
      roomId: roomId || 'DEFAULT_ROOM',
      senderId: senderId || 'anonymous',
      timestamp: Date.now(),
      action: action || { type: 'HEARTBEAT' },
      stateSnapshot: stateSnapshot !== undefined ? stateSnapshot : null
    };
  }

  /**
   * Applies an incoming network action payload directly to the local game state.
   */
  function handleIncomingAction(action, gameState) {
    if (!action || !gameState) {
      return { success: false, error: 'Invalid action or gameState provided' };
    }

    var type = action.type;

    switch (type) {
      case P2PActionTypes.ROLL_DICE: {
        if (Array.isArray(action.dice)) {
          gameState.currentRoll = [action.dice[0], action.dice[1]];
        }
        if (action.playerIndex != null && gameState.players && gameState.players[action.playerIndex]) {
          var player = gameState.players[action.playerIndex];
          if (action.newPosition != null) {
            player.position = action.newPosition;
          }
        }
        return { success: true, actionType: type, action: action };
      }

      case P2PActionTypes.CLINICAL_DECISION: {
        if (action.playerIndex != null && gameState.players && gameState.players[action.playerIndex]) {
          var targetPlayer = gameState.players[action.playerIndex];
          
          if (action.effects) {
            if (typeof action.effects.sbp === 'number') targetPlayer.sbp += action.effects.sbp;
            if (typeof action.effects.bmi === 'number') {
              targetPlayer.bmi = Math.round((targetPlayer.bmi + action.effects.bmi) * 10) / 10;
            }
            if (typeof action.effects.wp === 'number') targetPlayer.wp += action.effects.wp;
          }

          if (targetPlayer.encountersCompleted != null) {
            targetPlayer.encountersCompleted += 1;
          }
          if (action.adherent && targetPlayer.gdmtAdherentCount != null) {
            targetPlayer.gdmtAdherentCount += 1;
          }
          if (typeof action.rvuDelta === 'number' && targetPlayer.rvuPoints != null) {
            targetPlayer.rvuPoints += action.rvuDelta;
          }

          if (!gameState.vignetteLogs) {
            gameState.vignetteLogs = [];
          }
          gameState.vignetteLogs.push({
            vignetteId: action.vignetteId,
            playerIndex: action.playerIndex,
            choiceIndex: action.choiceIndex,
            choiceLabel: action.choiceLabel,
            timestamp: Date.now()
          });
        }
        return { success: true, actionType: type, action: action };
      }

      case P2PActionTypes.PROPERTY_ACQUIRED: {
        var propIdx = action.propertyIndex;
        var pIdx = action.playerIndex;

        if (propIdx != null && gameState.properties && gameState.properties[propIdx]) {
          gameState.properties[propIdx].owner = pIdx;
        }

        if (pIdx != null && gameState.players && gameState.players[pIdx]) {
          var buyer = gameState.players[pIdx];
          if (typeof action.cost === 'number') {
            buyer.wp = (buyer.wp || 0) + action.cost;
          }
          if (!buyer.propertiesOwned) {
            buyer.propertiesOwned = [];
          }
          if (propIdx != null && buyer.propertiesOwned.indexOf(propIdx) === -1) {
            buyer.propertiesOwned.push(propIdx);
          }
        }
        return { success: true, actionType: type, action: action };
      }

      case P2PActionTypes.TRADE_OFFER: {
        if (!gameState.tradeState) {
          gameState.tradeState = { activeOffer: null, history: [] };
        }
        if (!gameState.tradeState.history) {
          gameState.tradeState.history = [];
        }

        if (action.status === 'ACCEPTED') {
          var offProp = action.offeredPropertyIndex;
          var reqProp = action.requestedPropertyIndex;
          var fromP = action.fromPlayerIndex;
          var toP = action.toPlayerIndex;

          if (offProp != null && gameState.properties && gameState.properties[offProp] && toP != null) {
            gameState.properties[offProp].owner = toP;
          }
          if (reqProp != null && gameState.properties && gameState.properties[reqProp] && fromP != null) {
            gameState.properties[reqProp].owner = fromP;
          }
        }

        gameState.tradeState.history.push(action);
        return { success: true, actionType: type, action: action };
      }

      case P2PActionTypes.REGIME_SHIFT: {
        if (action.countryId) {
          gameState.activeCountryId = action.countryId;
          if (!gameState.policyRegime) {
            gameState.policyRegime = {};
          }
          gameState.policyRegime.id = action.countryId;
          if (action.regimeName) {
            gameState.policyRegime.name = action.regimeName;
          }
        }
        return { success: true, actionType: type, action: action };
      }

      default:
        return { success: true, actionType: type, action: action };
    }
  }

  /**
   * CardiopolyP2P Room State Manager
   * Handles peer connections, host lobby setup, heartbeat, and action messaging.
   */
  function CardiopolyP2P(options) {
    options = options || {};
    this.isHeadless = options.isHeadless || (typeof window === 'undefined') || (typeof window.Peer === 'undefined');
    this.isHost = false;
    this.roomId = null;
    this.peerId = null;
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, HOSTING, JOINED, CONNECTED
    this.peers = [];
    this.connections = {};
    this.actionListeners = [];
    this.stateListeners = [];
    this.peerListeners = [];
    this.peerInstance = null;
    this.heartbeatTimer = null;
    this.localPlayerInfo = options.localPlayerInfo || { name: 'Player', factionId: 'ACADEMIC_CLINICIAN' };
  }

  CardiopolyP2P.prototype.initHost = function (roomCode, options) {
    var self = this;
    options = options || {};
    this.roomId = (roomCode && isValidRoomCode(roomCode)) ? roomCode.trim().toUpperCase() : generateRoomCode();
    this.isHost = true;
    this.peerId = 'cardiopoly-host-' + this.roomId.toLowerCase();
    this.status = 'HOSTING';
    if (options.playerName) this.localPlayerInfo.name = options.playerName;
    if (options.factionId) this.localPlayerInfo.factionId = options.factionId;

    if (!this.isHeadless && typeof window !== 'undefined' && typeof window.Peer !== 'undefined') {
      try {
        if (this.peerInstance) this.peerInstance.destroy();
        this.peerInstance = new window.Peer(this.peerId, { debug: 1 });
        
        this.peerInstance.on('connection', function (conn) {
          self._handleIncomingConnection(conn);
        });

        this.peerInstance.on('error', function (err) {
          console.warn('[CardiopolyP2P] PeerJS host warning/error:', err);
        });
      } catch (err) {
        console.warn('[CardiopolyP2P] Could not initialize browser PeerJS:', err);
      }
    }

    this.startHeartbeat();
    return {
      roomId: this.roomId,
      peerId: this.peerId,
      isHost: true
    };
  };

  CardiopolyP2P.prototype.joinRoom = function (roomCode, options) {
    var self = this;
    options = options || {};
    if (!roomCode || !isValidRoomCode(roomCode)) {
      throw new Error('Invalid room code format: ' + roomCode);
    }
    this.roomId = roomCode.trim().toUpperCase();
    this.isHost = false;
    this.peerId = 'cardiopoly-peer-' + Math.random().toString(36).substring(2, 8);
    this.status = 'JOINED';
    if (options.playerName) this.localPlayerInfo.name = options.playerName;
    if (options.factionId) this.localPlayerInfo.factionId = options.factionId;

    if (!this.isHeadless && typeof window !== 'undefined' && typeof window.Peer !== 'undefined') {
      try {
        if (this.peerInstance) this.peerInstance.destroy();
        this.peerInstance = new window.Peer(this.peerId, { debug: 1 });

        this.peerInstance.on('open', function () {
          var targetHostId = 'cardiopoly-host-' + self.roomId.toLowerCase();
          var conn = self.peerInstance.connect(targetHostId, {
            metadata: {
              name: self.localPlayerInfo.name,
              factionId: self.localPlayerInfo.factionId
            }
          });
          self._setupConnectionEvents(conn);
        });

        this.peerInstance.on('error', function (err) {
          console.warn('[CardiopolyP2P] PeerJS client warning/error:', err);
        });
      } catch (err) {
        console.warn('[CardiopolyP2P] Could not initialize client PeerJS:', err);
      }
    }

    this.startHeartbeat();
    return {
      roomId: this.roomId,
      peerId: this.peerId,
      isHost: false
    };
  };

  CardiopolyP2P.prototype._handleIncomingConnection = function (conn) {
    var self = this;
    this._setupConnectionEvents(conn);
    conn.on('open', function () {
      var peerInfo = {
        id: conn.peer,
        name: (conn.metadata && conn.metadata.name) || 'Doctor ' + conn.peer.slice(-4),
        factionId: (conn.metadata && conn.metadata.factionId) || 'ACADEMIC_CLINICIAN',
        isHost: false,
        latency: 25,
        lastSeen: Date.now()
      };
      self.addPeer(peerInfo);
    });
  };

  CardiopolyP2P.prototype._setupConnectionEvents = function (conn) {
    var self = this;
    this.connections[conn.peer] = conn;

    conn.on('data', function (data) {
      if (!data) return;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }
      self._dispatchIncomingPayload(data, conn.peer);
    });

    conn.on('close', function () {
      self.removePeer(conn.peer);
      delete self.connections[conn.peer];
    });

    conn.on('error', function () {
      self.removePeer(conn.peer);
      delete self.connections[conn.peer];
    });
  };

  CardiopolyP2P.prototype._dispatchIncomingPayload = function (payload, senderId) {
    if (!payload || payload.protocol !== PROTOCOL_VERSION) return;
    
    senderId = senderId || payload.senderId || 'remote-peer';

    if (payload.action) {
      for (var i = 0; i < this.actionListeners.length; i++) {
        try {
          this.actionListeners[i](payload.action, senderId);
        } catch (e) {
          console.error('[CardiopolyP2P] Error in action listener:', e);
        }
      }
    }

    if (payload.stateSnapshot) {
      for (var j = 0; j < this.stateListeners.length; j++) {
        try {
          this.stateListeners[j](payload.stateSnapshot, senderId);
        } catch (e) {
          console.error('[CardiopolyP2P] Error in state listener:', e);
        }
      }
    }
  };

  CardiopolyP2P.prototype.broadcastAction = function (action, stateSnapshot) {
    var payload = createGameRoomPayload(this.roomId, action, this.peerId, stateSnapshot);

    for (var peerId in this.connections) {
      if (this.connections.hasOwnProperty(peerId)) {
        var conn = this.connections[peerId];
        if (conn && conn.open) {
          try {
            conn.send(payload);
          } catch (e) {
            console.warn('[CardiopolyP2P] Failed to send payload to peer:', peerId, e);
          }
        }
      }
    }

    return payload;
  };

  CardiopolyP2P.prototype.simulateIncomingPayload = function (payload) {
    this._dispatchIncomingPayload(payload, payload.senderId);
  };

  CardiopolyP2P.prototype.onAction = function (callback) {
    if (typeof callback === 'function') {
      this.actionListeners.push(callback);
    }
  };

  CardiopolyP2P.prototype.onState = function (callback) {
    if (typeof callback === 'function') {
      this.stateListeners.push(callback);
    }
  };

  CardiopolyP2P.prototype.onPeersChanged = function (callback) {
    if (typeof callback === 'function') {
      this.peerListeners.push(callback);
    }
  };

  CardiopolyP2P.prototype.addPeer = function (peerInfo) {
    if (!peerInfo || !peerInfo.id) return;
    var existingIdx = -1;
    for (var i = 0; i < this.peers.length; i++) {
      if (this.peers[i].id === peerInfo.id) {
        existingIdx = i;
        break;
      }
    }
    if (existingIdx >= 0) {
      this.peers[existingIdx] = Object.assign({}, this.peers[existingIdx], peerInfo);
    } else {
      this.peers.push(peerInfo);
    }
    this._notifyPeersChanged();
  };

  CardiopolyP2P.prototype.removePeer = function (peerId) {
    this.peers = this.peers.filter(function (p) {
      return p.id !== peerId;
    });
    this._notifyPeersChanged();
  };

  CardiopolyP2P.prototype.getPeers = function () {
    return this.peers.slice();
  };

  CardiopolyP2P.prototype.getPeerCount = function () {
    return this.peers.length;
  };

  CardiopolyP2P.prototype._notifyPeersChanged = function () {
    for (var i = 0; i < this.peerListeners.length; i++) {
      try {
        this.peerListeners[i](this.getPeers());
      } catch (e) {
        console.error('[CardiopolyP2P] Error in peer listener:', e);
      }
    }
  };

  CardiopolyP2P.prototype.startHeartbeat = function (intervalMs) {
    var self = this;
    this.stopHeartbeat();
    intervalMs = intervalMs || 5000;
    this.heartbeatTimer = setInterval(function () {
      if (self.status === 'HOSTING' || self.status === 'JOINED' || self.status === 'CONNECTED') {
        self.broadcastAction({ type: P2PActionTypes.HEARTBEAT, timestamp: Date.now() });
      }
    }, intervalMs);
    if (this.heartbeatTimer && typeof this.heartbeatTimer.unref === 'function') {
      this.heartbeatTimer.unref();
    }
  };

  CardiopolyP2P.prototype.stopHeartbeat = function () {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  };

  CardiopolyP2P.prototype.disconnect = function () {
    this.stopHeartbeat();
    for (var peerId in this.connections) {
      if (this.connections.hasOwnProperty(peerId)) {
        try {
          this.connections[peerId].close();
        } catch (e) {}
      }
    }
    this.connections = {};
    if (this.peerInstance) {
      try {
        this.peerInstance.destroy();
      } catch (e) {}
      this.peerInstance = null;
    }
    this.isHost = false;
    this.roomId = null;
    this.peerId = null;
    this.status = 'DISCONNECTED';
    this.peers = [];
    this._notifyPeersChanged();
  };

  return {
    CardiopolyP2P: CardiopolyP2P,
    createGameRoomPayload: createGameRoomPayload,
    handleIncomingAction: handleIncomingAction,
    generateRoomCode: generateRoomCode,
    isValidRoomCode: isValidRoomCode,
    P2PActionTypes: P2PActionTypes
  };
}));
