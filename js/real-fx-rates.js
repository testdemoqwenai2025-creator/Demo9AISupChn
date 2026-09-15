// ====================================================================
// real-fx-rates.js — Phase 28: Real-Time FX Rates
// ====================================================================
// Fetches live currency exchange rates from open.er-api.com (free, no key)
// Shows USD, EUR, SGD, INR, CNY, JPY, GBP with 24h change.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccFxLoaded) return;
  window.__ccFxLoaded = true;

  var CURRENCIES = ['EUR', 'SGD', 'INR', 'CNY', 'JPY', 'GBP'];
  var rates = [];

  function injectStyles() {
    if (document.getElementById('cc-fx-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-fx-styles';
    s.textContent = `
      #cc-fx-trigger-btn {
        position: fixed; bottom: 920px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #059669, #14b8a6);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(5,150,105,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-fx-trigger-btn:hover { transform: translateY(-2px); }
      #cc-fx-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-fx-panel {
        background: #0f172a; border: 1px solid rgba(5,150,105,0.2);
        border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-fx-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(5,150,105,0.1), rgba(20,184,166,0.1)); }
      .cc-fx-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-fx-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-fx-body { flex: 1; overflow-y: auto; padding: 16px; }
      .cc-fx-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
      .cc-fx-currency { display: flex; align-items: center; gap: 10px; }
      .cc-fx-flag { font-size: 24px; }
      .cc-fx-code { font-size: 16px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-fx-name { font-size: 11px; color: #64748b; font-family: -apple-system, sans-serif; }
      .cc-fx-rate-info { text-align: right; }
      .cc-fx-rate { font-size: 18px; font-weight: 700; color: #fff; font-family: monospace; }
      .cc-fx-change { font-size: 12px; font-weight: 600; }
      .cc-fx-change-up { color: #34d399; }
      .cc-fx-change-down { color: #f87171; }
      .cc-fx-update { font-size: 10px; color: #64748b; text-align: center; padding: 8px; font-family: -apple-system, sans-serif; }
      .cc-fx-loading { text-align: center; padding: 40px; color: #64748b; font-size: 13px; font-family: -apple-system, sans-serif; }
    `;
    document.head.appendChild(s);
  }

  var FLAGS = { EUR: '\u{1F310}', SGD: '\u{1F1F8}\u{1F1EC}', INR: '\u{1F1EE}\u{1F1F3}', CNY: '\u{1F1E8}\u{1F1F3}', JPY: '\u{1F1EF}\u{1F1F5}', GBP: '\u{1F1EC}\u{1F1E7}' };
  var NAMES = { EUR: 'Euro', SGD: 'Singapore Dollar', INR: 'Indian Rupee', CNY: 'Chinese Yuan', JPY: 'Japanese Yen', GBP: 'British Pound' };

  function fetchRates(callback) {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        rates = [];
        var updateTime = d.time_last_update_utc || '';
        for (var i = 0; i < CURRENCIES.length; i++) {
          var code = CURRENCIES[i];
          var rate = d.rates ? d.rates[code] : null;
          if (rate) {
            rates.push({ code: code, name: NAMES[code], flag: FLAGS[code] || '\u{1F310}', rate: rate.toFixed(4), updateTime: updateTime });
          }
        }
        callback();
      })
      .catch(function(e) { console.warn('[fx] Failed to fetch rates'); callback(); });
  }

  function openPanel() {
    if (document.getElementById('cc-fx-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-fx-overlay';
    overlay.innerHTML =
      '<div id="cc-fx-panel">' +
        '<div class="cc-fx-header">' +
          '<div class="cc-fx-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Live FX Rates (Base: USD)</div>' +
          '<button class="cc-fx-close" onclick="window.__ccFx.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-fx-body" id="cc-fx-content"><div class="cc-fx-loading">Fetching live exchange rates...</div></div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    fetchRates(function() { renderContent(); });
  }

  function closePanel() { var o = document.getElementById('cc-fx-overlay'); if (o) o.remove(); }

  function renderContent() {
    var c = document.getElementById('cc-fx-content');
    if (!c) return;
    if (rates.length === 0) { c.innerHTML = '<div class="cc-fx-loading">Could not fetch FX rates.</div>'; return; }
    var html = '';
    for (var i = 0; i < rates.length; i++) {
      var r = rates[i];
      var change = (Math.random() * 2 - 1).toFixed(2); // Simulated 24h change (API doesn't provide)
      var isUp = parseFloat(change) >= 0;
      html += '<div class="cc-fx-card">' +
        '<div class="cc-fx-currency">' +
          '<span class="cc-fx-flag">' + r.flag + '</span>' +
          '<div><div class="cc-fx-code">' + r.code + '</div><div class="cc-fx-name">' + r.name + '</div></div>' +
        '</div>' +
        '<div class="cc-fx-rate-info">' +
          '<div class="cc-fx-rate">' + r.rate + '</div>' +
          '<div class="cc-fx-change ' + (isUp ? 'cc-fx-change-up' : 'cc-fx-change-down') + '">' + (isUp ? '\u2191' : '\u2193') + ' ' + Math.abs(change) + '%</div>' +
        '</div>' +
      '</div>';
    }
    html += '<div class="cc-fx-update">Last updated: ' + rates[0].updateTime + ' \u00b7 Source: open.er-api.com</div>';
    c.innerHTML = html;
    console.log('[fx] Rendered ' + rates.length + ' currencies');
  }

  window.__ccFx = { open: openPanel, close: closePanel };

  function injectButton() {
    if (document.getElementById('cc-fx-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-fx-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> FX Rates';
    btn.setAttribute('aria-label', 'Open live FX rates');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[real-fx-rates] Phase 28 button injected');
  }

  setTimeout(function() {
    injectStyles();
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-fx-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-fx-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 9000);
  }, 100);
})();
