// ====================================================================
// simulated-risk-engine.js — Phase 21: Simulated Real-Time Risk Engine
// ====================================================================
// Creates the illusion of real-time data by generating random risk score
// changes, toast notifications, and live feed updates.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccRiskEngineLoaded) return;
  window.__ccRiskEngineLoaded = true;

  var SUPPLIERS = [
    { name: 'TechComp Asia Pte Ltd', risk: 62, trend: 0 },
    { name: 'EuroManufacturing GmbH', risk: 45, trend: 0 },
    { name: 'SemiconTech Inc.', risk: 25, trend: 0 },
    { name: 'PrecisionParts Ltd.', risk: 22, trend: 0 },
    { name: 'IndiaChem Industries', risk: 52, trend: 0 },
    { name: 'Shanghai Advanced Materials', risk: 78, trend: 0 },
  ];

  var ALERT_TYPES = [
    { type: 'Geopolitical', icon: '\u{1F30E}', suppliers: ['TechComp Asia Pte Ltd', 'Shanghai Advanced Materials'] },
    { type: 'Financial', icon: '\u{1F4B0}', suppliers: ['EuroManufacturing GmbH', 'IndiaChem Industries'] },
    { type: 'Operational', icon: '\u2699', suppliers: ['SemiconTech Inc.', 'PrecisionParts Ltd.'] },
    { type: 'Compliance', icon: '\u2705', suppliers: ['Shanghai Advanced Materials', 'IndiaChem Industries'] },
  ];

  var NOTIFICATIONS = [];
  var UPDATE_INTERVAL = 45000; // 45 seconds
  var enabled = true;

  function injectStyles() {
    if (document.getElementById('cc-risk-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-risk-engine-styles';
    style.textContent = `
      #cc-risk-toast-container {
        position: fixed; bottom: 20px; left: 20px; z-index: 100001;
        display: flex; flex-direction: column; gap: 8px;
        max-width: 360px; pointer-events: none;
      }
      .cc-risk-toast {
        background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        padding: 12px 16px; display: flex; align-items: flex-start; gap: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3); pointer-events: auto;
        animation: cc-risk-slide-in 0.3s ease; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-risk-toast.removing { animation: cc-risk-slide-out 0.3s ease forwards; }
      @keyframes cc-risk-slide-in { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes cc-risk-slide-out { to { transform: translateX(-100%); opacity: 0; } }
      .cc-risk-toast-icon { font-size: 18px; flex-shrink: 0; }
      .cc-risk-toast-body { flex: 1; }
      .cc-risk-toast-title { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 2px; }
      .cc-risk-toast-desc { font-size: 11px; color: #94a3b8; line-height: 1.4; }
      .cc-risk-toast-change { font-size: 11px; font-weight: 700; }
      .cc-risk-toast-change.up { color: #f87171; }
      .cc-risk-toast-change.down { color: #34d399; }
      .cc-risk-toast-close { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 0; }
      #cc-risk-engine-toggle {
        position: fixed; bottom: 620px; right: 20px; z-index: 9999;
        padding: 10px 16px; border-radius: 10px;
        background: linear-gradient(135deg, #1e293b, #334155);
        color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); font-size: 12px; font-weight: 600;
        cursor: pointer; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        transition: all 0.2s;
      }
      #cc-risk-engine-toggle.active { background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff; border-color: rgba(16,185,129,0.3); }
      #cc-risk-engine-toggle:hover { transform: translateY(-1px); }
      .cc-risk-pulse { width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: cc-risk-pulse 2s infinite; }
      #cc-risk-engine-toggle.active .cc-risk-pulse { background: #fff; }
      @keyframes cc-risk-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    `;
    document.head.appendChild(style);
  }

  function showToast(title, desc, change, isUp) {
    var container = document.getElementById('cc-risk-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cc-risk-toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'cc-risk-toast';
    var changeHTML = change !== undefined ? '<div class="cc-risk-toast-change ' + (isUp ? 'up' : 'down') + '">' + (isUp ? '\u2191' : '\u2193') + ' ' + Math.abs(change) + ' points</div>' : '';
    toast.innerHTML =
      '<div class="cc-risk-toast-body">' +
        '<div class="cc-risk-toast-title">' + title + '</div>' +
        '<div class="cc-risk-toast-desc">' + desc + '</div>' +
        changeHTML +
      '</div>' +
      '<button class="cc-risk-toast-close" onclick="this.parentElement.classList.add(\'removing\');setTimeout(()=>this.parentElement.remove(),300)">&times;</button>';
    container.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('removing');
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 8000);
  }

  function generateRiskUpdate() {
    if (!enabled) return;

    var supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    var change = Math.floor(Math.random() * 12 - 4); // -4 to +7
    if (change === 0) change = 1;
    var oldRisk = supplier.risk;
    supplier.risk = Math.max(5, Math.min(95, supplier.risk + change));
    supplier.trend = change;
    var isUp = change > 0;

    var alertType = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    var desc = alertType.type + ' risk ' + (isUp ? 'escalation' : 'improvement') + ' detected for ' + supplier.name + '.';

    showToast(alertType.icon + ' ' + alertType.type + ' Risk Update', desc, change, isUp);
    console.log('[risk-engine] ' + supplier.name + ': ' + oldRisk + ' \u2192 ' + supplier.risk + ' (' + (isUp ? '+' : '') + change + ')');
  }

  function generateRandomAlert() {
    if (!enabled) return;

    var alertType = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    var supplier = alertType.suppliers[Math.floor(Math.random() * alertType.suppliers.length)];
    var severities = ['Low', 'Medium', 'High', 'Critical'];
    var severity = severities[Math.floor(Math.random() * severities.length)];
    var riskScore = Math.floor(Math.random() * 50 + 30);

    var descs = [
      'AI model detected anomaly in shipping patterns. Confidence: ' + (70 + Math.floor(Math.random() * 25)) + '%',
      'Real-time monitoring flagged ' + alertType.type.toLowerCase() + ' risk factor. Score: ' + riskScore + '/100',
      'Pattern analysis identified elevated risk indicators for ' + supplier + '.',
      'Automated screening triggered ' + severity + ' alert. Review recommended.',
    ];
    var desc = descs[Math.floor(Math.random() * descs.length)];

    showToast(alertType.icon + ' ' + severity + ' Alert: ' + alertType.type, desc);
    console.log('[risk-engine] Random alert: ' + severity + ' / ' + alertType.type + ' / ' + supplier);
  }

  function toggle() {
    enabled = !enabled;
    var btn = document.getElementById('cc-risk-engine-toggle');
    if (btn) {
      btn.classList.toggle('active', enabled);
      btn.innerHTML = enabled ?
        '<span class="cc-risk-pulse"></span> Risk Engine: LIVE' :
        '<span class="cc-risk-pulse" style="background:#64748b;"></span> Risk Engine: OFF';
    }
    console.log('[risk-engine] ' + (enabled ? 'Enabled' : 'Disabled'));
  }

  function injectToggleButton() {
    if (document.getElementById('cc-risk-engine-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-risk-engine-toggle';
    btn.className = 'active';
    btn.innerHTML = '<span class="cc-risk-pulse"></span> Risk Engine: LIVE';
    btn.setAttribute('aria-label', 'Toggle simulated risk engine');
    btn.onclick = toggle;
    document.body.appendChild(btn);
    console.log('[risk-engine] Phase 21 toggle button injected');
  }

  function init() {
    injectStyles();

    // Risk score updates every 45 seconds
    setInterval(generateRiskUpdate, UPDATE_INTERVAL);

    // Random alerts every 60-120 seconds
    setInterval(function() {
      if (Math.random() > 0.5) generateRandomAlert();
    }, 60000);

    // Initial alert after 10 seconds
    setTimeout(generateRiskUpdate, 10000);
    setTimeout(generateRandomAlert, 20000);

    // Inject toggle button
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-risk-engine-toggle')) return;
      if (attempts > 30) return;
      injectToggleButton();
      if (!document.getElementById('cc-risk-engine-toggle')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 6500);

    console.log('[risk-engine] Phase 21 initialized — updates every ' + (UPDATE_INTERVAL / 1000) + 's');
  }

  init();
})();
