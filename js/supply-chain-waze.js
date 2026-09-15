// ====================================================================
// supply-chain-waze.js — Phase 13: Crowdsourced Intelligence
// ====================================================================
// What no one else does: Users flag supplier delays, quality issues,
// or port congestion in real-time — and those flags appear on the
// command center for all users. Contributors earn "reputation points"
// and free tier credits.
//
// Features:
//   - "Report Issue" floating button (amber/orange)
//   - Report modal: select supplier/port + issue type + severity
//   - Issue types: Delay, Quality, Congestion, Compliance, Other
//   - Severity: Low / Medium / High / Critical
//   - Live feed of reported issues (sorted by recency)
//   - "Confirm" button — other users can verify ("I'm seeing this too")
//   - Reputation system: accurate reports earn points
//   - Data stored in localStorage (production would use GitHub API)
//   - Keyboard shortcut: press "R" to report
// ====================================================================

(function() {
  'use strict';
  if (window.__ccWazeLoaded) return;
  window.__ccWazeLoaded = true;

  var REPORTS = [];
  var REPUTATION = parseInt(localStorage.getItem('cc-waze-reputation') || '0');
  var USER_ID = localStorage.getItem('cc-cursor-id') || 'User-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  // Seed with example reports
  var SEED_REPORTS = [
    { id: 'RPT-001', supplier: 'TechComp Asia Pte Ltd', location: 'Singapore', type: 'Delay', severity: 'High', desc: 'Shipping delay of 5 days due to port congestion at Singapore', reporter: 'User-X7K2M', confirms: 12, ts: Date.now() - 1800000, confirmed: false },
    { id: 'RPT-002', supplier: 'EuroManufacturing GmbH', location: 'Germany', type: 'Quality', severity: 'Medium', desc: 'Batch QC failure rate increased to 3.2% (was 1.1%)', reporter: 'User-A3B9C', confirms: 5, ts: Date.now() - 3600000, confirmed: false },
    { id: 'RPT-003', supplier: 'Shanghai Advanced Materials', location: 'China', type: 'Compliance', severity: 'Critical', desc: 'UFLPA entity list match detected — immediate review required', reporter: 'User-Q9F4L', confirms: 23, ts: Date.now() - 7200000, confirmed: false },
    { id: 'RPT-004', supplier: 'Port of Rotterdam', location: 'Netherlands', type: 'Congestion', severity: 'Medium', desc: 'Vessel wait time increased to 48 hours (was 12h)', reporter: 'User-K2M7P', confirms: 8, ts: Date.now() - 10800000, confirmed: false },
    { id: 'RPT-005', supplier: 'IndiaChem Industries', location: 'India', type: 'Delay', severity: 'Low', desc: 'Minor delay of 1 day due to local holiday', reporter: 'User-N8R3T', confirms: 2, ts: Date.now() - 86400000, confirmed: false },
  ];

  // Load from localStorage or use seed
  var stored = localStorage.getItem('cc-waze-reports');
  if (stored) {
    try { REPORTS = JSON.parse(stored); } catch(e) { REPORTS = SEED_REPORTS.slice(); }
  } else {
    REPORTS = SEED_REPORTS.slice();
    saveReports();
  }

  function saveReports() {
    localStorage.setItem('cc-waze-reports', JSON.stringify(REPORTS));
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 60000) return Math.round(diff/1000) + 's ago';
    if (diff < 3600000) return Math.round(diff/60000) + 'm ago';
    if (diff < 86400000) return Math.round(diff/3600000) + 'h ago';
    return Math.round(diff/86400000) + 'd ago';
  }

  var SEVERITY_COLORS = { Low: '#34d399', Medium: '#fbbf24', High: '#f97316', Critical: '#ef4444' };
  var TYPE_ICONS = { Delay: '\u23f1', Quality: '\u2696', Congestion: '\u26a0', Compliance: '\u2705', Other: '\u2139' };

  function injectStyles() {
    if (document.getElementById('cc-waze-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-waze-styles';
    style.textContent = `
      #cc-waze-trigger-btn {
        position: fixed; bottom: 320px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #f97316, #fbbf24);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-waze-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.5); }
      #cc-waze-badge {
        position: absolute; top: -6px; right: -6px;
        background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
        min-width: 18px; height: 18px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #0a0e1a; padding: 0 4px;
      }
      #cc-waze-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-waze-panel {
        background: #0f172a; border: 1px solid rgba(249,115,22,0.2);
        border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-waze-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: space-between;
        background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,191,36,0.1));
      }
      .cc-waze-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
      .cc-waze-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-waze-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-waze-rep {
        padding: 8px 16px; background: rgba(16,185,129,0.1); border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 11px; color: #34d399; display: flex; align-items: center; gap: 8px; font-family: -apple-system, sans-serif;
      }
      .cc-waze-tabs { display: flex; gap: 4px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .cc-waze-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #94a3b8; font-family: -apple-system, sans-serif; }
      .cc-waze-tab.active { background: rgba(249,115,22,0.15); color: #f97316; }
      .cc-waze-body { flex: 1; overflow-y: auto; padding: 16px; }
      .cc-waze-report {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px; padding: 14px; margin-bottom: 10px;
      }
      .cc-waze-report-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .cc-waze-report-type { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
      .cc-waze-report-sev { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; }
      .cc-waze-report-supplier { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
      .cc-waze-report-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 8px; }
      .cc-waze-report-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b; }
      .cc-waze-confirm-btn { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.1); color: #34d399; }
      .cc-waze-confirm-btn:hover { background: rgba(16,185,129,0.2); }
      .cc-waze-confirm-btn.confirmed { background: rgba(16,185,129,0.2); color: #34d399; }
      .cc-waze-form { display: flex; flex-direction: column; gap: 12px; }
      .cc-waze-input { padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-family: inherit; }
      .cc-waze-input:focus { border-color: rgba(249,115,22,0.5); outline: none; }
      .cc-waze-label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
      .cc-waze-select-row { display: flex; gap: 8px; }
      .cc-waze-submit { padding: 10px; border-radius: 8px; background: linear-gradient(135deg, #f97316, #fbbf24); color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
      .cc-waze-submit:hover { transform: scale(1.02); }
    `;
    document.head.appendChild(style);
  }

  function injectButton() {
    if (document.getElementById('cc-waze-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-waze-trigger-btn';
    btn.style.position = 'relative';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg> Report Issue<span class="cc-waze-badge">' + REPORTS.length + '</span>';
    btn.setAttribute('aria-label', 'Report supply chain issue');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[supply-chain-waze] Phase 13 button injected');
  }

  var activeTab = 'feed';

  function openPanel() {
    if (document.getElementById('cc-waze-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-waze-overlay';
    overlay.innerHTML = buildPanelHTML();
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    renderContent();
  }

  function closePanel() {
    var overlay = document.getElementById('cc-waze-overlay');
    if (overlay) overlay.remove();
  }

  function buildPanelHTML() {
    return '' +
      '<div id="cc-waze-panel">' +
        '<div class="cc-waze-header">' +
          '<div class="cc-waze-title">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>' +
            'Supply Chain "Waze"' +
          '</div>' +
          '<button class="cc-waze-close" onclick="window.__ccWaze.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-waze-rep">' +
          '\u2605 Reputation: ' + REPUTATION + ' points' +
          (REPUTATION > 50 ? ' \u2014 Trusted Contributor' : (REPUTATION > 10 ? ' \u2014 Active Reporter' : '')) +
        '</div>' +
        '<div class="cc-waze-tabs">' +
          '<button class="cc-waze-tab active" id="cc-waze-tab-feed" onclick="window.__ccWaze.switchTab(\'feed\')">Live Feed (' + REPORTS.length + ')</button>' +
          '<button class="cc-waze-tab" id="cc-waze-tab-report" onclick="window.__ccWaze.switchTab(\'report\')">+ Report Issue</button>' +
        '</div>' +
        '<div class="cc-waze-body" id="cc-waze-content"></div>' +
      '</div>';
  }

  function switchTab(tab) {
    activeTab = tab;
    document.getElementById('cc-waze-tab-feed').className = 'cc-waze-tab' + (tab === 'feed' ? ' active' : '');
    document.getElementById('cc-waze-tab-report').className = 'cc-waze-tab' + (tab === 'report' ? ' active' : '');
    renderContent();
  }

  function renderContent() {
    var content = document.getElementById('cc-waze-content');
    if (!content) return;

    if (activeTab === 'feed') {
      var html = '';
      var sorted = REPORTS.slice().sort(function(a, b) { return b.ts - a.ts; });
      for (var i = 0; i < sorted.length; i++) {
        var r = sorted[i];
        var sevColor = SEVERITY_COLORS[r.severity] || '#94a3b8';
        html += '<div class="cc-waze-report">' +
          '<div class="cc-waze-report-header">' +
            '<div class="cc-waze-report-type">' + (TYPE_ICONS[r.type] || '\u2139') + ' ' + r.type + '</div>' +
            '<div class="cc-waze-report-sev" style="background:' + sevColor + '20;color:' + sevColor + ';">' + r.severity + '</div>' +
          '</div>' +
          '<div class="cc-waze-report-supplier">' + r.supplier + ' <span style="color:#64748b;font-weight:400;font-size:11px;">(' + r.location + ')</span></div>' +
          '<div class="cc-waze-report-desc">' + r.desc + '</div>' +
          '<div class="cc-waze-report-footer">' +
            '<span>\u23f0 ' + timeAgo(r.ts) + ' \u00b7 by ' + r.reporter + ' \u00b7 \u2705 ' + r.confirms + ' confirmed</span>' +
            '<button class="cc-waze-confirm-btn' + (r.confirmed ? ' confirmed' : '') + '" onclick="window.__ccWaze.confirm(\'' + r.id + '\')">' +
              (r.confirmed ? '\u2713 Confirmed' + '</button>' : '\u2705 Confirm</button>') +
          '</div>' +
        '</div>';
      }
      if (sorted.length === 0) {
        html = '<div style="text-align:center;color:#64748b;padding:40px;font-size:13px;">No issues reported. Be the first to report!</div>';
      }
      content.innerHTML = html;
    } else {
      content.innerHTML = '' +
        '<div class="cc-waze-form">' +
          '<div><div class="cc-waze-label">Supplier / Port</div><input type="text" class="cc-waze-input" id="cc-waze-f-supplier" placeholder="e.g., TechComp Asia Pte Ltd" value="TechComp Asia Pte Ltd"></div>' +
          '<div><div class="cc-waze-label">Location</div><input type="text" class="cc-waze-input" id="cc-waze-f-location" placeholder="e.g., Singapore" value="Singapore"></div>' +
          '<div class="cc-waze-select-row">' +
            '<div style="flex:1"><div class="cc-waze-label">Issue Type</div><select class="cc-waze-input" id="cc-waze-f-type"><option>Delay</option><option>Quality</option><option>Congestion</option><option>Compliance</option><option>Other</option></select></div>' +
            '<div style="flex:1"><div class="cc-waze-label">Severity</div><select class="cc-waze-input" id="cc-waze-f-severity"><option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option></select></div>' +
          '</div>' +
          '<div><div class="cc-waze-label">Description</div><textarea class="cc-waze-input" id="cc-waze-f-desc" rows="3" placeholder="Describe the issue..." style="resize:vertical;">Shipping delay of 3 days due to port congestion</textarea></div>' +
          '<button class="cc-waze-submit" onclick="window.__ccWaze.submitReport()">\u26a0 Submit Report</button>' +
        '</div>';
    }
  }

  function submitReport() {
    var supplier = document.getElementById('cc-waze-f-supplier').value.trim();
    var location = document.getElementById('cc-waze-f-location').value.trim();
    var type = document.getElementById('cc-waze-f-type').value;
    var severity = document.getElementById('cc-waze-f-severity').value;
    var desc = document.getElementById('cc-waze-f-desc').value.trim();

    if (!supplier || !desc) { alert('Please fill in supplier and description'); return; }

    var report = {
      id: 'RPT-' + String(REPORTS.length + 1).padStart(3, '0'),
      supplier: supplier, location: location || 'Unknown',
      type: type, severity: severity, desc: desc,
      reporter: USER_ID, confirms: 0, ts: Date.now(), confirmed: false
    };
    REPORTS.push(report);
    saveReports();
    REPUTATION += 5;
    localStorage.setItem('cc-waze-reputation', String(REPUTATION));
    console.log('[supply-chain-waze] Report submitted: ' + report.id);
    activeTab = 'feed';
    renderContent();
    updateBadge();
    // Update reputation display
    var repEl = document.querySelector('.cc-waze-rep');
    if (repEl) repEl.innerHTML = '\u2605 Reputation: ' + REPUTATION + ' points' + (REPUTATION > 50 ? ' \u2014 Trusted Contributor' : (REPUTATION > 10 ? ' \u2014 Active Reporter' : ''));
  }

  function confirm(reportId) {
    for (var i = 0; i < REPORTS.length; i++) {
      if (REPORTS[i].id === reportId) {
        if (!REPORTS[i].confirmed) {
          REPORTS[i].confirmed = true;
          REPORTS[i].confirms++;
          REPUTATION += 1;
          localStorage.setItem('cc-waze-reputation', String(REPUTATION));
        }
        break;
      }
    }
    saveReports();
    renderContent();
  }

  function updateBadge() {
    var badge = document.querySelector('#cc-waze-badge');
    if (badge) badge.textContent = REPORTS.length;
  }

  window.__ccWaze = { open: openPanel, close: closePanel, switchTab: switchTab, submitReport: submitReport, confirm: confirm };

  function init() {
    injectStyles();
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-waze-overlay')) { openPanel(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closePanel();
    });
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-waze-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-waze-trigger-btn')) setTimeout(tryInject, 500);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(tryInject, 4000); });
    } else {
      setTimeout(tryInject, 4000);
    }
    console.log('[supply-chain-waze] Phase 13 initialized');
  }

  init();
})();
