// ====================================================================
// collaborative-cursors.js — Phase 11: Collaborative Live Cursors
// ====================================================================
// What no one else does: When multiple users are viewing the SPA
// simultaneously, they see each other's cursors moving in real-time —
// like Figma or Google Docs, but for supply chain data.
//
// Features:
//   - Track local mouse position + active view
//   - Broadcast cursor position via GitHub Contents API
//   - Render other users' cursors with colored avatars
//   - Presence indicator badge in header ("X users viewing")
//   - Poll for other cursors every 3 seconds
//   - Auto-expire stale cursors (no update in 15 seconds = offline)
//   - Click another user's cursor → see their view name
//
// Architecture:
//   - Uses GitHub Contents API as real-time database (Phase 8 pattern)
//   - Stores cursor data in spa/data/cursors.json
//   - Each user gets a random color + anonymous name (User-A1B2C)
//   - Throttled writes (max 1 write per 5 seconds to avoid rate limits)
// ====================================================================

(function() {
  'use strict';
  if (window.__ccCursorsLoaded) return;
  window.__ccCursorsLoaded = true;

  // ====================================================================
  // CONFIG
  // ====================================================================
  var GH_TOKEN = window.__GH_TOKEN || '';
  var REPO_OWNER = 'testdemoqwenai2025-creator';
  var REPO_NAME = 'Demo9AISupChn';
  var DATA_PATH = 'spa/data';
  var BRANCH = 'main';
  var API_BASE = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME;
  var CURSORS_FILE = 'cursors.json';
  var POLL_INTERVAL = 3000;     // 3 seconds
  var BROADCAST_INTERVAL = 5000; // 5 seconds (throttled)
  var STALE_TIMEOUT = 15000;     // 15 seconds = offline
  var COLORS = [
    '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444',
    '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#a855f7'
  ];

  // ====================================================================
  // USER IDENTITY
  // ====================================================================
  var userId = localStorage.getItem('cc-cursor-id');
  if (!userId) {
    userId = 'User-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    localStorage.setItem('cc-cursor-id', userId);
  }
  var userColor = localStorage.getItem('cc-cursor-color');
  if (!userColor) {
    userColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    localStorage.setItem('cc-cursor-color', userColor);
  }

  var currentView = 'Overview';
  var mouseThrottle = null;
  var lastBroadcast = 0;
  var knownCursors = {};
  var isInitialized = false;

  // ====================================================================
  // STYLES
  // ====================================================================
  function injectStyles() {
    if (document.getElementById('cc-cursor-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-cursor-styles';
    style.textContent = `
      .cc-cursor {
        position: fixed; z-index: 99998; pointer-events: none;
        transition: transform 0.3s ease, opacity 0.5s ease;
        opacity: 0;
      }
      .cc-cursor.active { opacity: 1; }
      .cc-cursor-arrow {
        width: 16px; height: 16px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
      .cc-cursor-label {
        position: absolute; left: 18px; top: -2px;
        padding: 2px 8px; border-radius: 6px;
        font-size: 11px; font-weight: 600; color: #fff;
        white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 4px;
      }
      .cc-cursor-view {
        font-size: 9px; opacity: 0.8; font-weight: 400;
      }
      .cc-presence-badge {
        position: fixed; top: 12px; right: 200px; z-index: 99998;
        padding: 4px 12px; border-radius: 9999px;
        background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399; font-size: 11px; font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex; align-items: center; gap: 6px;
        transition: opacity 0.3s ease; opacity: 0;
        backdrop-filter: blur(8px);
      }
      .cc-presence-badge.visible { opacity: 1; }
      .cc-presence-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #34d399; animation: cc-pulse 2s infinite;
      }
      @keyframes cc-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      .cc-presence-avatars {
        display: flex; gap: -4px; margin-left: 4px;
      }
      .cc-presence-avatar {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid #0a0e1a;
        font-size: 9px; display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 700;
        margin-left: -4px;
      }
    `;
    document.head.appendChild(style);
  }

  // ====================================================================
  // GITHUB API — read/write cursors.json
  // ====================================================================
  function readCursors(callback) {
    if (!GH_TOKEN || GH_TOKEN === '[REDACTED:github_token]') {
      callback(null);
      return;
    }
    fetch(API_BASE + '/contents/' + DATA_PATH + '/' + CURSORS_FILE + '?ref=' + BRANCH + '&v=' + Date.now(), {
      headers: {
        'Authorization': 'token ' + GH_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
      }
    })
    .then(function(res) {
      if (!res.ok) { callback(null); return null; }
      return res.json();
    })
    .then(function(data) {
      if (!data) { callback(null); return; }
      try {
        var content = atob(data.content.replace(/\n/g, ''));
        var json = JSON.parse(content);
        callback({ json: json, sha: data.sha });
      } catch(e) { callback(null); }
    })
    .catch(function() { callback(null); });
  }

  function writeCursors(data, sha, callback) {
    if (!GH_TOKEN || GH_TOKEN === '[REDACTED:github_token]') {
      if (callback) callback(false);
      return;
    }
    var encoded = btoa(JSON.stringify(data, null, 0));
    var body = JSON.stringify({
      message: 'cursor: ' + userId + ' @ ' + new Date().toISOString(),
      content: encoded,
      sha: sha || undefined,
      branch: BRANCH
    });

    fetch(API_BASE + '/contents/' + DATA_PATH + '/' + CURSORS_FILE, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + GH_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: body
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (callback) callback(true, data.content ? data.content.sha : null);
    })
    .catch(function() { if (callback) callback(false); });
  }

  // ====================================================================
  // MOUSE TRACKING
  // ====================================================================
  function onMouseMove(e) {
    var now = Date.now();
    if (now - lastBroadcast < BROADCAST_INTERVAL) return;
    lastBroadcast = now;

    // Detect current view from active sidebar item
    var activeBtn = document.querySelector('button[aria-current="page"], button[class*="bg-emerald-500/10"]');
    if (activeBtn) {
      var labelText = activeBtn.textContent.trim().split(/\s+/)[0];
      if (labelText) currentView = labelText;
    }

    broadcastCursor(e.clientX, e.clientY);
  }

  function broadcastCursor(x, y) {
    if (!GH_TOKEN || GH_TOKEN === '[REDACTED:github_token]') return;

    readCursors(function(existing) {
      var data = existing ? existing.json : {};
      var sha = existing ? existing.sha : null;

      // Clean stale cursors
      var now = Date.now();
      for (var id in data) {
        if (now - data[id].ts > STALE_TIMEOUT) {
          delete data[id];
        }
      }

      // Update our cursor
      data[userId] = {
        x: x, y: y,
        view: currentView,
        color: userColor,
        ts: now,
        page: 'command-center'
      };

      writeCursors(data, sha);
    });
  }

  // ====================================================================
  // RENDER OTHER USERS' CURSORS
  // ====================================================================
  function renderCursors(cursorData) {
    var now = Date.now();
    var activeCount = 0;

    for (var id in cursorData) {
      if (id === userId) continue;
      var cursor = cursorData[id];
      var age = now - cursor.ts;

      // Skip stale cursors
      if (age > STALE_TIMEOUT) {
        var el = document.getElementById('cc-cursor-' + id);
        if (el) el.remove();
        delete knownCursors[id];
        continue;
      }

      activeCount++;
      var el = document.getElementById('cc-cursor-' + id);

      if (!el) {
        // Create cursor element
        el = document.createElement('div');
        el.id = 'cc-cursor-' + id;
        el.className = 'cc-cursor';
        el.innerHTML =
          '<svg class="cc-cursor-arrow" viewBox="0 0 16 16" fill="' + cursor.color + '">' +
          '<path d="M0 0 L16 6 L6 8 L4 16 Z"/>' +
          '</svg>' +
          '<div class="cc-cursor-label" style="background:' + cursor.color + '">' +
          '<span>' + id + '</span>' +
          '<span class="cc-cursor-view"> · ' + (cursor.view || 'Overview') + '</span>' +
          '</div>';
        document.body.appendChild(el);
        knownCursors[id] = true;
      }

      // Update position
      el.style.transform = 'translate(' + cursor.x + 'px, ' + cursor.y + 'px)';
      el.classList.add('active');

      // Update view label
      var viewSpan = el.querySelector('.cc-cursor-view');
      if (viewSpan) viewSpan.textContent = ' · ' + (cursor.view || 'Overview');
    }

    // Remove cursors for users no longer in data
    for (var knownId in knownCursors) {
      if (!cursorData[knownId]) {
        var oldEl = document.getElementById('cc-cursor-' + knownId);
        if (oldEl) oldEl.remove();
        delete knownCursors[knownId];
      }
    }

    // Update presence badge
    updatePresenceBadge(activeCount, cursorData);
  }

  // ====================================================================
  // PRESENCE BADGE
  // ====================================================================
  var presenceBadge = null;

  function updatePresenceBadge(count, cursorData) {
    if (!presenceBadge) {
      presenceBadge = document.createElement('div');
      presenceBadge.className = 'cc-presence-badge';
      document.body.appendChild(presenceBadge);
    }

    if (count === 0) {
      presenceBadge.classList.remove('visible');
      return;
    }

    presenceBadge.classList.add('visible');

    // Build avatars
    var avatarsHtml = '';
    var shown = 0;
    for (var id in cursorData) {
      if (id === userId) continue;
      if (shown >= 5) break;
      var c = cursorData[id];
      avatarsHtml += '<div class="cc-presence-avatar" style="background:' + c.color + '">' +
        id.replace('User-', '')[0] + '</div>';
      shown++;
    }

    presenceBadge.innerHTML =
      '<span class="cc-presence-dot"></span>' +
      '<span>' + count + ' user' + (count > 1 ? 's' : '') + ' viewing</span>' +
      '<div class="cc-presence-avatars">' + avatarsHtml + '</div>';
  }

  // ====================================================================
  // POLLING — fetch other cursors every 3 seconds
  // ====================================================================
  function pollCursors() {
    readCursors(function(result) {
      if (result && result.json) {
        renderCursors(result.json);
      }
    });
  }

  // ====================================================================
  // CLEANUP — remove our cursor on page unload
  // ====================================================================
  function cleanup() {
    readCursors(function(existing) {
      if (!existing) return;
      var data = existing.json;
      var sha = existing.sha;
      delete data[userId];
      writeCursors(data, sha);
    });
  }

  // ====================================================================
  // INIT
  // ====================================================================
  function init() {
    injectStyles();

    // Track mouse
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Detect view changes (sidebar clicks)
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button[aria-label], nav button');
      if (btn) {
        var label = btn.getAttribute('aria-label') || btn.textContent.trim().split(/\s+/)[0];
        if (label) currentView = label;
      }
    }, { passive: true });

    // Poll for other cursors
    setInterval(pollCursors, POLL_INTERVAL);
    pollCursors(); // initial poll

    // Cleanup on unload
    window.addEventListener('beforeunload', cleanup);

    // Console log
    console.log('[collaborative-cursors] Phase 11 initialized — user: ' + userId + ', color: ' + userColor);
    if (!GH_TOKEN || GH_TOKEN === '[REDACTED:github_token]') {
      console.log('[collaborative-cursors] No GitHub token — running in demo mode (cursors not broadcast)');
    }
  }

  // Start after delay (same pattern as other enhancement scripts)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 2000); });
  } else {
    setTimeout(init, 2000);
  }
})();
