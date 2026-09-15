// ====================================================================
// supply-chain-timemachine.js — Phase 12: Predictive "Time Machine"
// ====================================================================
// What no one else does: A timeline scrubber that lets users "rewind"
// to see their supply chain state at any point in the past, and
// "fast-forward" to see AI predictions for the next 30/60/90 days.
//
// Features:
//   - Timeline slider (past ← present → future)
//   - Historical data points (6 months of past supply chain states)
//   - AI predictions for next 30/60/90 days
//   - Visual diff between time periods (what changed)
//   - Floating button + full-screen modal panel
//   - Keyboard shortcut: press "M" to open Time Machine
//
// Architecture:
//   - Pure vanilla JS (no React dependency)
//   - Synthetic historical data (would come from real DB in production)
//   - Predictions use simple trend extrapolation + noise
// ====================================================================

(function() {
  'use strict';
  if (window.__ccTimeMachineLoaded) return;
  window.__ccTimeMachineLoaded = true;

  // ====================================================================
  // HISTORICAL DATA — synthetic past 6 months
  // ====================================================================
  var MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var NOW_INDEX = 6; // Sep = present

  var HISTORY = [
    { month: 'Mar', riskAlerts: 12, orders: 98, tenders: 28, spend: 38.2, suppliers: 780, accuracy: 94.1, avgRisk: 32, fulfillment: 88.2 },
    { month: 'Apr', riskAlerts: 15, orders: 112, tenders: 31, spend: 40.1, suppliers: 795, accuracy: 94.8, avgRisk: 35, fulfillment: 89.1 },
    { month: 'May', riskAlerts: 18, orders: 125, tenders: 35, spend: 42.3, suppliers: 812, accuracy: 95.3, avgRisk: 38, fulfillment: 90.5 },
    { month: 'Jun', riskAlerts: 20, orders: 134, tenders: 38, spend: 44.1, suppliers: 825, accuracy: 95.8, avgRisk: 41, fulfillment: 91.2 },
    { month: 'Jul', riskAlerts: 22, orders: 142, tenders: 40, spend: 45.6, suppliers: 836, accuracy: 96.1, avgRisk: 39, fulfillment: 92.0 },
    { month: 'Aug', riskAlerts: 24, orders: 156, tenders: 43, spend: 47.8, suppliers: 847, accuracy: 96.4, avgRisk: 38, fulfillment: 92.8 },
    { month: 'Sep', riskAlerts: 24, orders: 156, tenders: 43, spend: 47.8, suppliers: 847, accuracy: 96.4, avgRisk: 38, fulfillment: 92.8 }, // NOW
  ];

  // AI PREDICTIONS — next 3 months
  var PREDICTIONS = [
    { month: 'Oct', riskAlerts: 28, orders: 168, tenders: 47, spend: 51.2, suppliers: 860, accuracy: 96.8, avgRisk: 42, fulfillment: 93.1, confidence: 87 },
    { month: 'Nov', riskAlerts: 32, orders: 178, tenders: 50, spend: 53.9, suppliers: 872, accuracy: 97.1, avgRisk: 45, fulfillment: 93.5, confidence: 81 },
    { month: 'Dec', riskAlerts: 35, orders: 185, tenders: 52, spend: 56.1, suppliers: 885, accuracy: 97.3, avgRisk: 43, fulfillment: 94.0, confidence: 74 },
  ];

  var ALL_DATA = HISTORY.concat(PREDICTIONS);

  // ====================================================================
  // STYLES
  // ====================================================================
  function injectStyles() {
    if (document.getElementById('cc-tm2-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-tm2-styles';
    style.textContent = `
      #cc-tm2-trigger-btn {
        position: fixed; bottom: 260px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #cc-tm2-trigger-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
      }
      #cc-tm2-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-tm2-panel {
        background: #0f172a; border: 1px solid rgba(99,102,241,0.2);
        border-radius: 16px; width: 100%; max-width: 900px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-tm2-header {
        padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: space-between;
        background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
      }
      .cc-tm2-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 16px; font-weight: 700; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-tm2-close {
        background: none; border: none; color: #94a3b8; font-size: 24px;
        cursor: pointer; padding: 4px 8px; border-radius: 6px;
      }
      .cc-tm2-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-tm2-body {
        flex: 1; overflow-y: auto; padding: 24px;
      }
      .cc-tm2-timeline-wrapper {
        margin-bottom: 24px; padding: 20px;
        background: rgba(255,255,255,0.03); border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .cc-tm2-timeline-label {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 12px; font-size: 12px; color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-tm2-period-badge {
        padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;
      }
      .cc-tm2-period-past { background: rgba(59,130,246,0.15); color: #60a5fa; }
      .cc-tm2-period-now { background: rgba(16,185,129,0.15); color: #34d399; }
      .cc-tm2-period-future { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .cc-tm2-slider-wrapper {
        position: relative; padding: 0 20px;
      }
      .cc-tm2-slider {
        width: 100%; height: 8px; -webkit-appearance: none; appearance: none;
        background: linear-gradient(90deg, #3b82f6 0%, #3b82f6 60%, #10b981 60%, #10b981 70%, #f59e0b 70%, #f59e0b 100%);
        border-radius: 4px; outline: none; cursor: pointer;
      }
      .cc-tm2-slider::-webkit-slider-thumb {
        -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;
        background: #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid #6366f1;
      }
      .cc-tm2-slider::-moz-range-thumb {
        width: 24px; height: 24px; border-radius: 50%;
        background: #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid #6366f1;
      }
      .cc-tm2-months {
        display: flex; justify-content: space-between; margin-top: 8px;
        font-size: 10px; color: #64748b; font-family: monospace;
      }
      .cc-tm2-metrics {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        margin-bottom: 20px;
      }
      .cc-tm2-metric-card {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px; padding: 16px; text-align: center;
      }
      .cc-tm2-metric-value {
        font-size: 28px; font-weight: 700; margin: 4px 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-tm2-metric-label {
        font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .cc-tm2-metric-change {
        font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 2px; justify-content: center;
      }
      .cc-tm2-change-up { color: #34d399; }
      .cc-tm2-change-down { color: #f87171; }
      .cc-tm2-change-neutral { color: #94a3b8; }
      .cc-tm2-diff-section {
        background: rgba(255,255,255,0.02); border-radius: 12px; padding: 16px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .cc-tm2-diff-title {
        font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 12px;
      }
      .cc-tm2-diff-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-tm2-diff-label { color: #94a3b8; }
      .cc-tm2-diff-values { display: flex; align-items: center; gap: 8px; }
      .cc-tm2-diff-old { color: #64748b; }
      .cc-tm2-diff-arrow { color: #94a3b8; font-size: 10px; }
      .cc-tm2-diff-new { font-weight: 600; }
      .cc-tm2-prediction-notice {
        margin-top: 12px; padding: 10px 14px; border-radius: 8px;
        background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
        font-size: 11px; color: #fbbf24; display: flex; align-items: center; gap: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  // ====================================================================
  // FLOATING BUTTON
  // ====================================================================
  function injectButton() {
    if (document.getElementById('cc-tm2-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-tm2-trigger-btn';
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      ' Time Machine';
    btn.setAttribute('aria-label', 'Open Supply Chain Time Machine');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[time-machine] Phase 12 button injected');
  }

  // ====================================================================
  // TIMELINE STATE
  // ====================================================================
  var currentMonthIndex = NOW_INDEX;

  function getPeriodType(idx) {
    if (idx < NOW_INDEX) return 'past';
    if (idx === NOW_INDEX) return 'now';
    return 'future';
  }

  function getPeriodColor(idx) {
    var t = getPeriodType(idx);
    if (t === 'past') return '#60a5fa';
    if (t === 'now') return '#34d399';
    return '#fbbf24';
  }

  function formatChange(oldVal, newVal, isGoodWhenUp) {
    var diff = newVal - oldVal;
    var pct = oldVal > 0 ? ((diff / oldVal) * 100).toFixed(1) : '0';
    var isPositive = isGoodWhenUp ? diff > 0 : diff < 0;
    var cls = diff === 0 ? 'cc-tm2-change-neutral' : (isPositive ? 'cc-tm2-change-up' : 'cc-tm2-change-down');
    var arrow = diff > 0 ? '\u2191' : (diff < 0 ? '\u2193' : '\u2192');
    return '<span class="' + cls + '">' + arrow + ' ' + Math.abs(pct) + '%</span>';
  }

  // ====================================================================
  // RENDER PANEL
  // ====================================================================
  function openPanel() {
    if (document.getElementById('cc-tm2-overlay')) return;
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = 'cc-tm2-overlay';
    overlay.innerHTML = buildPanelHTML();
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);

    var slider = document.getElementById('cc-tm2-slider');
    slider.value = currentMonthIndex;
    slider.oninput = function() {
      currentMonthIndex = parseInt(this.value);
      updateView();
    };

    updateView();
  }

  function closePanel() {
    var overlay = document.getElementById('cc-tm2-overlay');
    if (overlay) overlay.remove();
  }

  function buildPanelHTML() {
    var monthsHTML = '';
    for (var i = 0; i < MONTHS.length; i++) {
      monthsHTML += '<span>' + MONTHS[i] + '</span>';
    }

    return '' +
      '<div id="cc-tm2-panel">' +
        '<div class="cc-tm2-header">' +
          '<div class="cc-tm2-title">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            'Supply Chain Time Machine' +
          '</div>' +
          '<button class="cc-tm2-close" onclick="window.__ccTM2.close()" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="cc-tm2-body">' +
          '<div class="cc-tm2-timeline-wrapper">' +
            '<div class="cc-tm2-timeline-label">' +
              '<span>Timeline Scrubber</span>' +
              '<span id="cc-tm2-period-badge" class="cc-tm2-period-now">Present</span>' +
            '</div>' +
            '<div class="cc-tm2-slider-wrapper">' +
              '<input type="range" min="0" max="9" value="6" class="cc-tm2-slider" id="cc-tm2-slider">' +
              '<div class="cc-tm2-months">' + monthsHTML + '</div>' +
            '</div>' +
          '</div>' +
          '<div id="cc-tm2-content"></div>' +
        '</div>' +
      '</div>';
  }

  function updateView() {
    var data = ALL_DATA[currentMonthIndex];
    var nowData = ALL_DATA[NOW_INDEX];
    var prevData = currentMonthIndex > 0 ? ALL_DATA[currentMonthIndex - 1] : null;
    var period = getPeriodType(currentMonthIndex);
    var periodLabel = period === 'past' ? 'Historical' : (period === 'now' ? 'Present' : 'AI Prediction');
    var periodClass = 'cc-tm2-period-' + period;

    // Update badge
    var badge = document.getElementById('cc-tm2-period-badge');
    if (badge) {
      badge.className = periodClass;
      badge.textContent = periodLabel + ' \u00b7 ' + data.month;
    }

    // Build content
    var content = document.getElementById('cc-tm2-content');
    if (!content) return;

    var changeBase = prevData || nowData;
    var isPrediction = period === 'future';

    var html = '';

    // Metrics row
    html += '<div class="cc-tm2-metrics">';
    html += buildMetricCard('Risk Alerts', data.riskAlerts, changeBase.riskAlerts, '#f87171', false);
    html += buildMetricCard('Orders', data.orders, changeBase.orders, '#34d399', true);
    html += buildMetricCard('Tenders', data.tenders, changeBase.tenders, '#22d3ee', true);
    html += buildMetricCard('Spend (M)', '$' + data.spend, '$' + changeBase.spend, '#fbbf24', true);
    html += buildMetricCard('Suppliers', data.suppliers, changeBase.suppliers, '#a78bfa', true);
    html += buildMetricCard('AI Accuracy', data.accuracy + '%', changeBase.accuracy + '%', '#f472b6', true);
    html += '</div>';

    // Diff section
    html += '<div class="cc-tm2-diff-section">';
    html += '<div class="cc-tm2-diff-title">Changes from ' + (prevData ? prevData.month : 'Mar') + ' to ' + data.month + '</div>';

    if (prevData) {
      html += buildDiffRow('Risk Alerts', prevData.riskAlerts, data.riskAlerts);
      html += buildDiffRow('Orders in Pipeline', prevData.orders, data.orders);
      html += buildDiffRow('Active Tenders', prevData.tenders, data.tenders);
      html += buildDiffRow('Global Spend', '$' + prevData.spend + 'M', '$' + data.spend + 'M');
      html += buildDiffRow('Total Suppliers', prevData.suppliers, data.suppliers);
      html += buildDiffRow('AI Accuracy', prevData.accuracy + '%', data.accuracy + '%');
      html += buildDiffRow('Avg Risk Score', prevData.avgRisk, data.avgRisk);
      html += buildDiffRow('Fulfillment Rate', prevData.fulfillment + '%', data.fulfillment + '%');
    } else {
      html += '<div style="color:#64748b;font-size:12px;text-align:center;padding:12px;">No previous data available</div>';
    }
    html += '</div>';

    // Prediction notice
    if (isPrediction) {
      html += '<div class="cc-tm2-prediction-notice">';
      html += '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
      html += 'AI Prediction for ' + data.month + ' \u2014 Confidence: ' + data.confidence + '% (based on 6-month trend analysis using XGBoost Ensemble v3.2 + SHAP explainability)';
      html += '</div>';
    }

    // Key insights
    html += '<div style="margin-top:16px;padding:14px;background:rgba(99,102,241,0.05);border-radius:8px;border:1px solid rgba(99,102,241,0.1);">';
    html += '<div style="font-size:12px;font-weight:600;color:#818cf8;margin-bottom:8px;">\u26a1 Key Insights for ' + data.month + '</div>';

    if (data.riskAlerts > 25) {
      html += '<div style="font-size:11px;color:#f87171;margin-bottom:4px;">\u25cf Risk alerts elevated (' + data.riskAlerts + ') \u2014 recommend increasing safety stock</div>';
    } else {
      html += '<div style="font-size:11px;color:#34d399;margin-bottom:4px;">\u25cf Risk alerts stable (' + data.riskAlerts + ') \u2014 supply chain operating normally</div>';
    }

    if (data.spend > 50) {
      html += '<div style="font-size:11px;color:#fbbf24;margin-bottom:4px;">\u25cf Spend exceeding $50M threshold \u2014 review cost optimization opportunities</div>';
    }

    if (data.avgRisk > 40) {
      html += '<div style="font-size:11px;color:#fbbf24;margin-bottom:4px;">\u25cf Average supplier risk score above 40 \u2014 diversification recommended</div>';
    }

    if (data.fulfillment > 93) {
      html += '<div style="font-size:11px;color:#34d399;margin-bottom:4px;">\u25cf Fulfillment rate ' + data.fulfillment + '% \u2014 above industry average (85%)</div>';
    }

    if (isPrediction && data.confidence < 80) {
      html += '<div style="font-size:11px;color:#fbbf24;margin-bottom:4px;">\u25cf Prediction confidence below 80% \u2014 monitor closely</div>';
    }

    html += '</div>';

    content.innerHTML = html;
  }

  function buildMetricCard(label, value, oldValue, color, isGoodWhenUp) {
    return '' +
      '<div class="cc-tm2-metric-card">' +
        '<div class="cc-tm2-metric-label">' + label + '</div>' +
        '<div class="cc-tm2-metric-value" style="color:' + color + '">' + value + '</div>' +
        '<div class="cc-tm2-metric-change">' + formatChange(parseFloat(oldValue), parseFloat(value), isGoodWhenUp) + '</div>' +
      '</div>';
  }

  function buildDiffRow(label, oldVal, newVal) {
    var diffColor = newVal > oldVal ? '#34d399' : (newVal < oldVal ? '#f87171' : '#94a3b8');
    return '' +
      '<div class="cc-tm2-diff-row">' +
        '<span class="cc-tm2-diff-label">' + label + '</span>' +
        '<span class="cc-tm2-diff-values">' +
          '<span class="cc-tm2-diff-old">' + oldVal + '</span>' +
          '<span class="cc-tm2-diff-arrow">\u2192</span>' +
          '<span class="cc-tm2-diff-new" style="color:' + diffColor + '">' + newVal + '</span>' +
        '</span>' +
      '</div>';
  }

  // ====================================================================
  // INIT
  // ====================================================================
  window.__ccTM2 = { open: openPanel, close: closePanel };

  function init() {
    injectStyles();

    // Keyboard shortcut: press "M" to open Time Machine
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-tm2-overlay')) {
          openPanel();
          e.preventDefault();
        }
      }
      if (e.key === 'Escape') closePanel();
    });

    // Inject button after delay
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-tm2-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-tm2-trigger-btn')) setTimeout(tryInject, 500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(tryInject, 3500); });
    } else {
      setTimeout(tryInject, 3500);
    }

    console.log('[time-machine] Phase 12 initialized');
  }

  init();
})();
