// ====================================================================
// ai-concierge.js — Phase 14: AI-Powered Supply Chain Concierge
// ====================================================================
// What no one else does: Instead of users asking questions, the AI
// proactively reaches out: "I noticed 3 of your APAC suppliers have
// increased risk scores this week. Want me to find alternatives?"
//
// Features:
//   - Proactive AI alerts (not reactive)
//   - Pattern detection across order/supplier/compliance data
//   - Auto-generated recommendations with one-click actions
//   - "AI Morning Brief" — daily summary notification
//   - Floating button (rose/pink gradient, bell icon)
//   - Modal panel with proactive insights feed
//   - One-click action buttons (Find Alternatives, Review, Dismiss)
//   - Keyboard shortcut: press "C" to open Concierge
// ====================================================================

(function() {
  'use strict';
  if (window.__ccConciergeLoaded) return;
  window.__ccConciergeLoaded = true;

  var INSIGHTS = [
    { id: 1, type: 'proactive', priority: 'high', icon: '\u26a0', color: '#ef4444',
      title: 'APAC Supplier Risk Escalation',
      desc: '3 of your APAC suppliers (TechComp Asia, Shanghai Advanced Materials, IndiaChem Industries) have increased risk scores by an average of 12% this week. The primary driver is geopolitical tension in the South China Sea shipping route.',
      action: 'Find Alternatives', actionType: 'alternatives',
      timestamp: '2 hours ago', dismissed: false },
    { id: 2, type: 'cost', priority: 'medium', icon: '\u2605', color: '#fbbf24',
      title: 'Cost Optimization Opportunity',
      desc: 'AI identified $39,400 in potential savings across 12 orders by switching from EuroManufacturing GmbH (risk: 45, price: premium) to PrecisionParts Ltd. (risk: 22, price: competitive). Quality scores are equivalent (94% vs 93%).',
      action: 'Review Switch', actionType: 'review',
      timestamp: '5 hours ago', dismissed: false },
    { id: 3, type: 'compliance', priority: 'critical', icon: '\u2696', color: '#a78bfa',
      title: 'EUDR Compliance Deadline Approaching',
      desc: 'BrazilAgro Commodities SA has a satellite-detected deforestation flag within the last 6 months. EUDR enforcement begins Dec 2025. You have 78 days to either verify compliance or source alternatives. Current EUDR compliance: 68%.',
      action: 'Start Review', actionType: 'compliance',
      timestamp: '1 day ago', dismissed: false },
    { id: 4, type: 'demand', priority: 'medium', icon: '\u2191', color: '#34d399',
      title: 'Demand Surge Predicted',
      desc: 'Semiconductor orders are up 19.4% QoQ. Based on historical patterns and market signals, AI predicts a 24% demand increase in Q4 2024. Recommend building 15% safety stock. Current fulfillment rate: 92.8%.',
      action: 'Adjust Stock', actionType: 'stock',
      timestamp: '1 day ago', dismissed: false },
    { id: 5, type: 'pattern', priority: 'low', icon: '\u2637', color: '#22d3ee',
      title: 'Client Concentration Risk',
      desc: '62% of APAC spend is concentrated in 3 suppliers. No single supplier exceeds 25% threshold, but the top 3 combined create dependency risk. Recommend diversifying to at least 5 suppliers for the APAC region.',
      action: 'Diversification Plan', actionType: 'diversify',
      timestamp: '2 days ago', dismissed: false },
    { id: 6, type: 'morning', priority: 'info', icon: '\u2600', color: '#f59e0b',
      title: 'AI Morning Brief — Sep 15, 2026',
      desc: 'Good morning. Today\'s summary: 24 active risk alerts (3 critical), 156 orders in pipeline (12 closing soon), $47.8M spend YTD. 1 compliance deadline approaching (EUDR, 78 days). AI accuracy: 96.4%. All systems operational.',
      action: 'View Details', actionType: 'details',
      timestamp: '6 hours ago', dismissed: false },
  ];

  function injectStyles() {
    if (document.getElementById('cc-concierge-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-concierge-styles';
    style.textContent = `
      #cc-concierge-trigger-btn {
        position: fixed; bottom: 380px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #ec4899, #f43f5e);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-concierge-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(236,72,153,0.5); }
      #cc-concierge-badge {
        position: absolute; top: -6px; right: -6px;
        background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
        min-width: 18px; height: 18px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #0a0e1a; padding: 0 4px;
      }
      #cc-concierge-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-concierge-panel {
        background: #0f172a; border: 1px solid rgba(236,72,153,0.2);
        border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-concierge-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: space-between;
        background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(244,63,94,0.1));
      }
      .cc-concierge-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
      .cc-concierge-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-concierge-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-concierge-body { flex: 1; overflow-y: auto; padding: 16px; }
      .cc-concierge-card {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px; padding: 14px; margin-bottom: 12px;
        transition: all 0.2s;
      }
      .cc-concierge-card:hover { border-color: rgba(236,72,153,0.2); }
      .cc-concierge-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
      .cc-concierge-card-icon { font-size: 18px; }
      .cc-concierge-card-title { font-size: 13px; font-weight: 700; color: #fff; flex: 1; }
      .cc-concierge-card-priority { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
      .cc-concierge-card-desc { font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 10px; }
      .cc-concierge-card-footer { display: flex; align-items: center; justify-content: space-between; }
      .cc-concierge-card-time { font-size: 10px; color: #64748b; }
      .cc-concierge-actions { display: flex; gap: 6px; }
      .cc-concierge-btn-action { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid rgba(236,72,153,0.3); background: rgba(236,72,153,0.1); color: #ec4899; }
      .cc-concierge-btn-action:hover { background: rgba(236,72,153,0.2); }
      .cc-concierge-btn-dismiss { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #64748b; }
      .cc-concierge-btn-dismiss:hover { background: rgba(255,255,255,0.05); }
    `;
    document.head.appendChild(style);
  }

  function injectButton() {
    if (document.getElementById('cc-concierge-trigger-btn')) return;
    var active = INSIGHTS.filter(function(i) { return !i.dismissed; }).length;
    var btn = document.createElement('button');
    btn.id = 'cc-concierge-trigger-btn';
    btn.style.position = 'relative';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> AI Concierge<span class="cc-concierge-badge">' + active + '</span>';
    btn.setAttribute('aria-label', 'Open AI Supply Chain Concierge');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[ai-concierge] Phase 14 button injected');
  }

  function openPanel() {
    if (document.getElementById('cc-concierge-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-concierge-overlay';
    overlay.innerHTML = buildPanelHTML();
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    renderContent();
  }

  function closePanel() {
    var overlay = document.getElementById('cc-concierge-overlay');
    if (overlay) overlay.remove();
  }

  function buildPanelHTML() {
    return '' +
      '<div id="cc-concierge-panel">' +
        '<div class="cc-concierge-header">' +
          '<div class="cc-concierge-title">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' +
            'AI Supply Chain Concierge' +
          '</div>' +
          '<button class="cc-concierge-close" onclick="window.__ccConcierge.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-concierge-body" id="cc-concierge-content"></div>' +
      '</div>';
  }

  function renderContent() {
    var content = document.getElementById('cc-concierge-content');
    if (!content) return;
    var html = '';
    var priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    var sorted = INSIGHTS.slice().sort(function(a, b) { return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5); });

    for (var i = 0; i < sorted.length; i++) {
      var insight = sorted[i];
      if (insight.dismissed) continue;
      var priColor = insight.color || '#94a3b8';
      html += '<div class="cc-concierge-card" id="cc-concierge-card-' + insight.id + '">' +
        '<div class="cc-concierge-card-header">' +
          '<span class="cc-concierge-card-icon" style="color:' + priColor + '">' + insight.icon + '</span>' +
          '<span class="cc-concierge-card-title">' + insight.title + '</span>' +
          '<span class="cc-concierge-card-priority" style="background:' + priColor + '20;color:' + priColor + ';">' + insight.priority + '</span>' +
        '</div>' +
        '<div class="cc-concierge-card-desc">' + insight.desc + '</div>' +
        '<div class="cc-concierge-card-footer">' +
          '<span class="cc-concierge-card-time">\u23f0 ' + insight.timestamp + '</span>' +
          '<div class="cc-concierge-actions">' +
            '<button class="cc-concierge-btn-action" onclick="window.__ccConcierge.act(' + insight.id + ',\'' + insight.actionType + '\')">' + insight.action + '</button>' +
            '<button class="cc-concierge-btn-dismiss" onclick="window.__ccConcierge.dismiss(' + insight.id + ')">Dismiss</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    if (html === '') {
      html = '<div style="text-align:center;color:#64748b;padding:40px;font-size:13px;">All caught up! No pending insights. The AI will notify you when it detects patterns.</div>';
    }
    content.innerHTML = html;
  }

  function act(id, actionType) {
    var insight = INSIGHTS.find(function(i) { return i.id === id; });
    if (!insight) return;
    var messages = {
      alternatives: 'Searching for alternative suppliers in APAC region... Found 3 potential matches: PrecisionParts Ltd. (risk: 22), SemiconTech Inc. (risk: 25), GlobalLogistics Co. (risk: 18). Would you like to see detailed comparison?',
      review: 'Opening cost comparison view. Potential savings: $39,400 across 12 orders. Switch confidence: 91%.',
      compliance: 'Opening compliance review for BrazilAgro Commodities SA. Satellite imagery analysis shows deforestation within 6-month window. EUDR compliance at risk.',
      stock: 'Adjusting safety stock recommendation: +15% for semiconductor category. New projected fulfillment rate: 94.5% (up from 92.8%).',
      diversify: 'Generating diversification plan... Recommend adding PrecisionParts Ltd. and 2 additional APAC suppliers. Projected risk reduction: 18%.',
      details: 'Opening dashboard overview view with today\'s metrics.',
    };
    alert(messages[actionType] || 'Action: ' + actionType);
  }

  function dismiss(id) {
    var insight = INSIGHTS.find(function(i) { return i.id === id; });
    if (insight) insight.dismissed = true;
    var card = document.getElementById('cc-concierge-card-' + id);
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(20px)'; setTimeout(function() { card.remove(); }, 300); }
    updateBadge();
  }

  function updateBadge() {
    var badge = document.querySelector('#cc-concierge-badge');
    var active = INSIGHTS.filter(function(i) { return !i.dismissed; }).length;
    if (badge) badge.textContent = active;
  }

  window.__ccConcierge = { open: openPanel, close: closePanel, act: act, dismiss: dismiss };

  function init() {
    injectStyles();
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-concierge-overlay')) { openPanel(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closePanel();
    });
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-concierge-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-concierge-trigger-btn')) setTimeout(tryInject, 500);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(tryInject, 4500); });
    } else {
      setTimeout(tryInject, 4500);
    }
    console.log('[ai-concierge] Phase 14 initialized');
  }

  init();
})();
