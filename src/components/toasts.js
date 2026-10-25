/**
 * Cardiopoly - Non-Blocking Toast Notification System
 * 
 * Provides a lightweight, high-performance notification queue and DOM renderer
 * for fast-paced bot turns, preventing modal fatigue while keeping players informed.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    var exp = factory();
    module.exports = exp;
    // CommonJS convenience exports
    module.exports.ToastQueue = exp.ToastQueue;
    module.exports.showToast = exp.showToast;
    module.exports.dismissToast = exp.dismissToast;
    module.exports.clearToasts = exp.clearToasts;
    module.exports.CardiopolyToasts = exp;
  } else {
    root.CardiopolyToasts = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VALID_THEMES = ['info', 'event', 'auction', 'warning', 'success'];

  /**
   * Safe HTML escaping helper for plain-text strings
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * ToastQueue manages an ordered list of active notification items.
   *
   * @param {number} [maxItems=20] - Maximum capacity of simultaneous toasts
   */
  function ToastQueue(maxItems) {
    this.maxItems = (typeof maxItems === 'number' && maxItems > 0) ? maxItems : 20;
    this.items = [];
  }

  ToastQueue.prototype.push = function (opts) {
    var raw = opts || {};
    if (typeof raw === 'string') {
      raw = { message: raw };
    }

    var themeStr = (typeof raw.theme === 'string') ? raw.theme.toLowerCase() : 'info';
    var theme = VALID_THEMES.indexOf(themeStr) !== -1 ? themeStr : 'info';

    var msg = '';
    if (typeof raw.message === 'string') {
      msg = raw.message;
    } else if (typeof raw.text === 'string') {
      msg = raw.text;
    }

    var item = {
      id: raw.id || ('toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8)),
      title: typeof raw.title === 'string' ? raw.title : '',
      message: msg,
      theme: theme,
      durationMs: (typeof raw.durationMs === 'number' && raw.durationMs > 0) ? raw.durationMs : 2000,
      timestamp: Date.now()
    };

    if (this.items.length >= this.maxItems) {
      this.items.shift();
    }

    this.items.push(item);
    return item;
  };

  ToastQueue.prototype.pop = function () {
    return this.items.shift();
  };

  ToastQueue.prototype.remove = function (id) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) {
        return this.items.splice(i, 1)[0];
      }
    }
    return null;
  };

  ToastQueue.prototype.clear = function () {
    var cleared = this.items.slice();
    this.items = [];
    return cleared;
  };

  var defaultQueue = new ToastQueue(25);

  /**
   * Helper to resolve appropriate icon badge for a theme
   */
  function getThemeBadge(theme) {
    switch (theme) {
      case 'event':
        return '⚡ EVENT';
      case 'auction':
        return '🔨 AUCTION';
      case 'warning':
        return '⚠️ ALERT';
      case 'success':
        return '✅ SUCCESS';
      case 'info':
      default:
        return 'ℹ️ INFO';
    }
  }

  /**
   * Displays an animated toast message in the floating notification container.
   * Headless-safe: in non-DOM environments (like Node.js), it parses and queues
   * without error.
   *
   * @param {Object|string} options - Toast configuration or message string
   * @returns {Object} Normalized toast item descriptor
   */
  function showToast(options) {
    var item = defaultQueue.push(options);

    // Headless-safe execution when running without browser DOM
    if (typeof document === 'undefined') {
      return item;
    }

    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    var card = document.createElement('div');
    card.id = item.id;
    card.className = 'toast-card toast-' + item.theme;
    card.setAttribute('role', 'alert');

    var headerHtml = '<div class="toast-header">' +
      '<span class="toast-theme-badge">' + getThemeBadge(item.theme) + '</span>' +
      (item.title ? '<span class="toast-title">' + escapeHtml(item.title) + '</span>' : '') +
      '<button class="toast-close-btn" type="button" aria-label="Close notification">&times;</button>' +
      '</div>';

    var bodyHtml = '<div class="toast-body">' + item.message + '</div>';

    card.innerHTML = headerHtml + bodyHtml;

    container.appendChild(card);

    var dismissed = false;
    var timerId = null;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (timerId) clearTimeout(timerId);

      card.classList.add('toast-exit');
      setTimeout(function () {
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
        defaultQueue.remove(item.id);
      }, 300);
    }

    timerId = setTimeout(dismiss, item.durationMs);

    var closeBtn = card.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        dismiss();
      };
    }

    card.onclick = function () {
      dismiss();
    };

    item.dismiss = dismiss;
    return item;
  }

  /**
   * Programmatically dismisses a toast by id
   */
  function dismissToast(id) {
    defaultQueue.remove(id);
    if (typeof document === 'undefined') return;

    var el = document.getElementById(id);
    if (el) {
      el.classList.add('toast-exit');
      setTimeout(function () {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 300);
    }
  }

  /**
   * Clears all active toasts immediately
   */
  function clearToasts() {
    defaultQueue.clear();
    if (typeof document === 'undefined') return;

    var container = document.getElementById('toast-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  var exportsObj = {
    ToastQueue: ToastQueue,
    showToast: showToast,
    dismissToast: dismissToast,
    clearToasts: clearToasts,
    toastQueue: defaultQueue
  };

  return exportsObj;
}));
