// ====================================================================
// supply-chain-data.js — Phase 22: Real Supply Chain Data Viewer
// ====================================================================
// Loads and displays real-world supply chain data:
//   - 20 major global ports (lat/lng, throughput, congestion, risk)
//   - 12 shipping routes (distance, transit time, cost, disruptions)
//   - 12 suppliers (risk, compliance, financial, ESG, certifications)
//   - 12 countries customs data (UFLPA, EUDR, tariffs, sanctions)
//
// Floating button (cyan/teal) opens a data explorer panel with tabs:
//   Ports | Routes | Suppliers | Customs
// ====================================================================

(function() {
  'use strict';
  if (window.__ccDataViewerLoaded) return;
  window.__ccDataViewerLoaded = true;

  var DATA_BASE = '/Demo9AISupChn/spa/data';
  var ports = [], routes = [], suppliers = [], customs = [];
  var loaded = false;

  function loadData(callback) {
    if (loaded) { callback(); return; }
    var pending = 4;
    function done() { if (--pending === 0) { loaded = true; callback(); } }

    fetch(DATA_BASE + '/ports.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){ports=d;done();}).catch(function(){done();});
    fetch(DATA_BASE + '/routes.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){routes=d;done();}).catch(function(){done();});
    fetch(DATA_BASE + '/suppliers-full.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){suppliers=d;done();}).catch(function(){done();});
    fetch(DATA_BASE + '/customs.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){customs=d;done();}).catch(function(){done();});
  }

  function injectStyles() {
    if (document.getElementById('cc-data-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-data-styles';
    s.textContent = `
      #cc-data-trigger-btn {
        position: fixed; bottom: 680px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #06b6d4, #0ea5e9);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(6,182,212,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-data-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(6,182,212,0.5); }
      #cc-data-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-data-panel {
        background: #0f172a; border: 1px solid rgba(6,182,212,0.2);
        border-radius: 16px; width: 100%; max-width: 900px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-data-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1)); }
      .cc-data-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-data-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-data-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-data-tabs { display: flex; gap: 4px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .cc-data-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #94a3b8; font-family: -apple-system, sans-serif; }
      .cc-data-tab.active { background: rgba(6,182,212,0.15); color: #22d3ee; }
      .cc-data-body { flex: 1; overflow-y: auto; padding: 16px; }
      .cc-data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
      .cc-data-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; }
      .cc-data-card-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
      .cc-data-card-row { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; padding: 3px 0; font-family: -apple-system, sans-serif; }
      .cc-data-card-value { color: #e2e8f0; font-weight: 600; }
      .cc-data-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; }
      .cc-data-badge-low { background: rgba(16,185,129,0.15); color: #34d399; }
      .cc-data-badge-medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .cc-data-badge-high { background: rgba(239,68,68,0.15); color: #f87171; }
      .cc-data-loading { text-align: center; padding: 40px; color: #64748b; font-size: 13px; font-family: -apple-system, sans-serif; }
    `;
    document.head.appendChild(s);
  }

  var activeTab = 'ports';

  function openPanel() {
    if (document.getElementById('cc-data-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-data-overlay';
    overlay.innerHTML = '' +
      '<div id="cc-data-panel">' +
        '<div class="cc-data-header">' +
          '<div class="cc-data-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg> Supply Chain Data Explorer</div>' +
          '<button class="cc-data-close" onclick="window.__ccData.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-data-tabs">' +
          '<button class="cc-data-tab active" onclick="window.__ccData.tab(\'ports\')">Ports (' + (ports.length||20) + ')</button>' +
          '<button class="cc-data-tab" onclick="window.__ccData.tab(\'routes\')">Routes (' + (routes.length||12) + ')</button>' +
          '<button class="cc-data-tab" onclick="window.__ccData.tab(\'suppliers\')">Suppliers (' + (suppliers.length||12) + ')</button>' +
          '<button class="cc-data-tab" onclick="window.__ccData.tab(\'customs\')">Customs (' + (customs.length||12) + ')</button>' +
        '</div>' +
        '<div class="cc-data-body" id="cc-data-content"><div class="cc-data-loading">Loading data...</div></div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);

    loadData(function() { renderContent(); });
  }

  function closePanel() {
    var o = document.getElementById('cc-data-overlay');
    if (o) o.remove();
  }

  function tab(t) {
    activeTab = t;
    var tabs = document.querySelectorAll('.cc-data-tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    renderContent();
    var activeBtn = document.querySelector('.cc-data-tab[onclick*="' + t + '"]');
    if (activeBtn) activeBtn.classList.add('active');
  }

  function badgeClass(score) {
    if (score < 30) return 'cc-data-badge-low';
    if (score < 60) return 'cc-data-badge-medium';
    return 'cc-data-badge-high';
  }

  function renderContent() {
    var c = document.getElementById('cc-data-content');
    if (!c) return;
    var html = '<div class="cc-data-grid">';

    if (activeTab === 'ports') {
      for (var i = 0; i < ports.length; i++) {
        var p = ports[i];
        html += '<div class="cc-data-card">' +
          '<div class="cc-data-card-title">' + p.name + '</div>' +
          '<div class="cc-data-card-row"><span>Country</span><span class="cc-data-card-value">' + p.country + '</span></div>' +
          '<div class="cc-data-card-row"><span>Throughput</span><span class="cc-data-card-value">' + (p.throughput/1000000).toFixed(1) + 'M TEU</span></div>' +
          '<div class="cc-data-card-row"><span>Congestion</span><span class="cc-data-badge ' + badgeClass(p.risk) + '">' + p.congestion + '</span></div>' +
          '<div class="cc-data-card-row"><span>Risk Score</span><span class="cc-data-card-value">' + p.risk + '/100</span></div>' +
          '<div class="cc-data-card-row"><span>Wait Time</span><span class="cc-data-card-value">' + p.waitTime + 'h</span></div>' +
          '<div class="cc-data-card-row"><span>Coordinates</span><span class="cc-data-card-value">' + p.lat + ', ' + p.lng + '</span></div>' +
          '</div>';
      }
    } else if (activeTab === 'routes') {
      for (var j = 0; j < routes.length; j++) {
        var r = routes[j];
        html += '<div class="cc-data-card">' +
          '<div class="cc-data-card-title">' + r.name + '</div>' +
          '<div class="cc-data-card-row"><span>Route</span><span class="cc-data-card-value">' + r.origin + ' \u2192 ' + r.destination + '</span></div>' +
          '<div class="cc-data-card-row"><span>Distance</span><span class="cc-data-card-value">' + r.distance.toLocaleString() + ' km</span></div>' +
          '<div class="cc-data-card-row"><span>Transit Time</span><span class="cc-data-card-value">' + r.transitDays + ' days</span></div>' +
          '<div class="cc-data-card-row"><span>Cost/TEU</span><span class="cc-data-card-value">$' + r.costPerTEU.toLocaleString() + '</span></div>' +
          '<div class="cc-data-card-row"><span>Risk</span><span class="cc-data-badge ' + badgeClass(r.risk) + '">' + r.risk + '/100</span></div>' +
          (r.disruptions.length > 0 ? '<div class="cc-data-card-row"><span>Disruptions</span><span class="cc-data-card-value" style="color:#fbbf24;">' + r.disruptions.join(', ') + '</span></div>' : '') +
          '</div>';
      }
    } else if (activeTab === 'suppliers') {
      for (var k = 0; k < suppliers.length; k++) {
        var s = suppliers[k];
        html += '<div class="cc-data-card">' +
          '<div class="cc-data-card-title">' + s.name + '</div>' +
          '<div class="cc-data-card-row"><span>Country</span><span class="cc-data-card-value">' + s.country + '</span></div>' +
          '<div class="cc-data-card-row"><span>Category</span><span class="cc-data-card-value">' + s.category + '</span></div>' +
          '<div class="cc-data-card-row"><span>Risk Score</span><span class="cc-data-badge ' + badgeClass(s.risk) + '">' + s.risk + '/100</span></div>' +
          '<div class="cc-data-card-row"><span>Financial</span><span class="cc-data-card-value">' + s.financial.rating + ' (' + s.financial.trend + ')</span></div>' +
          '<div class="cc-data-card-row"><span>ESG Score</span><span class="cc-data-card-value">' + s.esg + '/100</span></div>' +
          '<div class="cc-data-card-row"><span>Annual Spend</span><span class="cc-data-card-value">$' + s.annualSpend + 'M</span></div>' +
          '<div class="cc-data-card-row"><span>Certs</span><span class="cc-data-card-value" style="font-size:10px;">' + s.certifications.join(', ') + '</span></div>' +
          '</div>';
      }
    } else if (activeTab === 'customs') {
      for (var l = 0; l < customs.length; l++) {
        var cu = customs[l];
        html += '<div class="cc-data-card">' +
          '<div class="cc-data-card-title">' + cu.country + '</div>' +
          '<div class="cc-data-card-row"><span>UFLPA</span><span class="cc-data-badge ' + badgeClass(cu.uflpa.score) + '">' + cu.uflpa.status + ' (' + cu.uflpa.score + '%)</span></div>' +
          '<div class="cc-data-card-row"><span>EUDR</span><span class="cc-data-badge ' + badgeClass(cu.eudr.score) + '">' + cu.eudr.status + ' (' + cu.eudr.score + '%)</span></div>' +
          '<div class="cc-data-card-row"><span>Tariff Rate</span><span class="cc-data-card-value">' + cu.tariffRate + '%</span></div>' +
          '<div class="cc-data-card-row"><span>Sanctions Risk</span><span class="cc-data-card-value">' + cu.sanctionsRisk + '</span></div>' +
          '<div class="cc-data-card-row" style="font-size:10px;color:#64748b;margin-top:4px;">' + cu.uflpa.notes + '</div>' +
          '</div>';
      }
    }

    html += '</div>';
    c.innerHTML = html;
  }

  window.__ccData = { open: openPanel, close: closePanel, tab: tab };

  function injectButton() {
    if (document.getElementById('cc-data-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-data-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg> Data Explorer';
    btn.setAttribute('aria-label', 'Open Supply Chain Data Explorer');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[supply-chain-data] Phase 22 button injected');
  }

  function init() {
    injectStyles();
    // Preload data in background
    loadData(function() { console.log('[supply-chain-data] Loaded: ' + ports.length + ' ports, ' + routes.length + ' routes, ' + suppliers.length + ' suppliers, ' + customs.length + ' customs'); });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePanel();
    });

    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-data-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-data-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 7000);
  }

  init();
})();
