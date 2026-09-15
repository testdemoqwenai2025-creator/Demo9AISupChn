// ====================================================================
// demo-tour.js — Phase 24: Interactive Guided Tour
// ====================================================================
// 8-step guided walkthrough of all platform features.
// Auto-starts on first visit. "Replay tour" and "Skip" buttons.
// Uses spotlight overlay + tooltip to highlight elements.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccTourLoaded) return;
  window.__ccTourLoaded = true;

  var TOUR_KEY = 'cc-demo-tour-completed';
  var currentStep = 0;

  var STEPS = [
    {
      title: 'Welcome to AI Supply Chain Command Center',
      desc: 'Your enterprise-grade supply chain intelligence platform. This tour will show you all 21+ features in under 2 minutes.',
      selector: null,
      position: 'center',
      icon: '\u{1F44B}'
    },
    {
      title: 'KPI Dashboard',
      desc: '6 real-time metrics: Risk Alerts (24), Orders (156), Tenders (43), Spend ($47.8M), Suppliers (847), AI Accuracy (96.4%). Click any card to drill down.',
      selector: 'main',
      position: 'top',
      icon: '\u{1F4CA}'
    },
    {
      title: 'Sidebar Navigation',
      desc: 'Switch between Overview, Orders, Tenders, AI Documents, Compliance, and Analytics views. Use keyboard shortcuts 1-6 for instant switching.',
      selector: 'aside',
      position: 'right',
      icon: '\u{1F5C2}'
    },
    {
      title: 'Quick Actions & Templates',
      desc: '8 Quick Actions (Create Order, Generate Document, Browse Tenders, ROI Calculator, World Risk Map, AI Expert, Supplier Screening, Government Quotes). Below: 6 Quick Templates for common workflows.',
      selector: 'main',
      position: 'top',
      icon: '\u26a1'
    },
    {
      title: 'Floating Buttons (10 features)',
      desc: 'Look at the bottom-right corner. 10 floating buttons for: Create Order (O), Tenders (T), Analytics (A), AI Expert (E), Time Machine (M), Report Issue (R), AI Concierge (C), Blockchain Audit (B), AI Docs (D), and 3D Globe (G). Try pressing any key!',
      selector: null,
      position: 'bottom-right',
      icon: '\u{1F4CC}'
    },
    {
      title: 'AI Expert Chat',
      desc: 'Press E to open the AI Expert chat. Ask questions about risks, suppliers, orders, compliance, and more. Uses fuzzy keyword matching with 10 supply chain topics.',
      selector: null,
      position: 'bottom-right',
      icon: '\u{1F9E0}'
    },
    {
      title: '3D Globe & Data Explorer',
      desc: 'Press G for the 3D Supply Chain Globe (20 ports, 12 suppliers, 12 routes). Press the Data Explorer button for ports, routes, suppliers, and customs data.',
      selector: null,
      position: 'bottom-right',
      icon: '\u{1F30E}'
    },
    {
      title: 'You are ready!',
      desc: 'You now know all 21+ features. Keyboard shortcuts: O=Orders, T=Tenders, A=Analytics, E=AI Expert, M=Time Machine, R=Report, C=Concierge, B=Blockchain, D=Docs, G=Globe. Explore freely!',
      selector: null,
      position: 'center',
      icon: '\u2705'
    },
  ];

  function injectStyles() {
    if (document.getElementById('cc-tour-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-tour-styles';
    s.textContent = `
      #cc-tour-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        z-index: 100002; pointer-events: none;
      }
      #cc-tour-spotlight {
        position: fixed; border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.75);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none; z-index: 100002;
      }
      #cc-tour-tooltip {
        position: fixed; background: #0f172a;
        border: 1px solid rgba(16,185,129,0.3);
        border-radius: 16px; padding: 24px;
        max-width: 400px; z-index: 100003;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .cc-tour-icon { font-size: 32px; margin-bottom: 8px; }
      .cc-tour-step-badge {
        display: inline-block; padding: 2px 10px; border-radius: 9999px;
        background: rgba(16,185,129,0.15); color: #34d399;
        font-size: 11px; font-weight: 700; margin-bottom: 8px;
      }
      .cc-tour-title {
        font-size: 18px; font-weight: 700; color: #fff;
        margin-bottom: 8px; line-height: 1.3;
      }
      .cc-tour-desc {
        font-size: 13px; color: #94a3b8; line-height: 1.6;
        margin-bottom: 20px;
      }
      .cc-tour-footer {
        display: flex; align-items: center; justify-content: space-between;
      }
      .cc-tour-dots { display: flex; gap: 6px; }
      .cc-tour-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: rgba(255,255,255,0.15); transition: all 0.2s;
      }
      .cc-tour-dot.active { background: #10b981; width: 24px; border-radius: 4px; }
      .cc-tour-buttons { display: flex; gap: 8px; }
      .cc-tour-btn {
        padding: 8px 16px; border-radius: 8px; font-size: 12px;
        font-weight: 600; cursor: pointer; border: none;
        font-family: -apple-system, sans-serif; transition: all 0.2s;
      }
      .cc-tour-btn-skip { background: transparent; color: #64748b; }
      .cc-tour-btn-skip:hover { color: #94a3b8; }
      .cc-tour-btn-next {
        background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff;
      }
      .cc-tour-btn-next:hover { transform: scale(1.05); }
      .cc-tour-btn-back { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
      .cc-tour-btn-back:hover { background: rgba(255,255,255,0.1); }
      .cc-tour-btn-finish {
        background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff;
      }
      .cc-tour-btn-finish:hover { transform: scale(1.05); }
      #cc-tour-replay-btn {
        position: fixed; bottom: 20px; left: 20px; z-index: 9999;
        padding: 8px 16px; border-radius: 8px;
        background: rgba(15,23,42,0.8); backdrop-filter: blur(8px);
        border: 1px solid rgba(16,185,129,0.2); color: #34d399;
        font-size: 12px; font-weight: 600; cursor: pointer;
        font-family: -apple-system, sans-serif; transition: all 0.2s;
        display: flex; align-items: center; gap: 6px;
      }
      #cc-tour-replay-btn:hover { background: rgba(16,185,129,0.1); transform: translateY(-1px); }
    `;
    document.head.appendChild(s);
  }

  function startTour() {
    if (document.getElementById('cc-tour-overlay')) return;
    injectStyles();
    currentStep = 0;

    var overlay = document.createElement('div');
    overlay.id = 'cc-tour-overlay';
    overlay.innerHTML =
      '<div id="cc-tour-spotlight" style="display:none;"></div>' +
      '<div id="cc-tour-tooltip"></div>';
    document.body.appendChild(overlay);

    showStep();
  }

  function endTour() {
    var overlay = document.getElementById('cc-tour-overlay');
    if (overlay) overlay.remove();
    localStorage.setItem(TOUR_KEY, '1');
    showReplayButton();
  }

  function showReplayButton() {
    if (document.getElementById('cc-tour-replay-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-tour-replay-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Replay Tour';
    btn.onclick = function() {
      localStorage.removeItem(TOUR_KEY);
      var replay = document.getElementById('cc-tour-replay-btn');
      if (replay) replay.remove();
      startTour();
    };
    document.body.appendChild(btn);
  }

  function showStep() {
    var step = STEPS[currentStep];
    var tooltip = document.getElementById('cc-tour-tooltip');
    var spotlight = document.getElementById('cc-tour-spotlight');
    if (!tooltip) return;

    // Build dots
    var dotsHTML = '';
    for (var i = 0; i < STEPS.length; i++) {
      dotsHTML += '<div class="cc-tour-dot' + (i === currentStep ? ' active' : '') + '"></div>';
    }

    // Build buttons
    var btnsHTML = '<div class="cc-tour-dots">' + dotsHTML + '</div><div class="cc-tour-buttons">';
    if (currentStep > 0) {
      btnsHTML += '<button class="cc-tour-btn cc-tour-btn-back" onclick="window.__ccTour.back()">Back</button>';
    }
    btnsHTML += '<button class="cc-tour-btn cc-tour-btn-skip" onclick="window.__ccTour.skip()">Skip</button>';
    if (currentStep === STEPS.length - 1) {
      btnsHTML += '<button class="cc-tour-btn cc-tour-btn-finish" onclick="window.__ccTour.finish()">Get Started!</button>';
    } else {
      btnsHTML += '<button class="cc-tour-btn cc-tour-btn-next" onclick="window.__ccTour.next()">Next</button>';
    }
    btnsHTML += '</div>';

    tooltip.innerHTML =
      '<div class="cc-tour-icon">' + step.icon + '</div>' +
      '<div class="cc-tour-step-badge">Step ' + (currentStep + 1) + ' of ' + STEPS.length + '</div>' +
      '<div class="cc-tour-title">' + step.title + '</div>' +
      '<div class="cc-tour-desc">' + step.desc + '</div>' +
      '<div class="cc-tour-footer">' + btnsHTML + '</div>';

    // Position spotlight and tooltip
    if (step.selector) {
      var el = document.querySelector(step.selector);
      if (el) {
        var rect = el.getBoundingClientRect();
        spotlight.style.display = 'block';
        spotlight.style.left = (rect.left - 8) + 'px';
        spotlight.style.top = (rect.top - 8) + 'px';
        spotlight.style.width = (rect.width + 16) + 'px';
        spotlight.style.height = (rect.height + 16) + 'px';

        positionTooltip(tooltip, rect, step.position);
      } else {
        spotlight.style.display = 'none';
        centerTooltip(tooltip);
      }
    } else {
      spotlight.style.display = 'none';
      if (step.position === 'bottom-right') {
        tooltip.style.left = 'auto';
        tooltip.style.right = '40px';
        tooltip.style.top = 'auto';
        tooltip.style.bottom = '100px';
        tooltip.style.transform = 'none';
      } else {
        centerTooltip(tooltip);
      }
    }
  }

  function positionTooltip(tooltip, rect, position) {
    var tw = 400, th = tooltip.offsetHeight || 300;
    tooltip.style.transform = 'none';

    if (position === 'right') {
      tooltip.style.left = (rect.right + 20) + 'px';
      tooltip.style.top = (rect.top + rect.height/2 - th/2) + 'px';
      tooltip.style.right = 'auto';
      tooltip.style.bottom = 'auto';
    } else if (position === 'left') {
      tooltip.style.left = (rect.left - tw - 20) + 'px';
      tooltip.style.top = (rect.top + rect.height/2 - th/2) + 'px';
      tooltip.style.right = 'auto';
      tooltip.style.bottom = 'auto';
    } else if (position === 'bottom') {
      tooltip.style.left = (rect.left + rect.width/2 - tw/2) + 'px';
      tooltip.style.top = (rect.bottom + 20) + 'px';
      tooltip.style.right = 'auto';
      tooltip.style.bottom = 'auto';
    } else { // top
      tooltip.style.left = (rect.left + rect.width/2 - tw/2) + 'px';
      tooltip.style.top = 'auto';
      tooltip.style.bottom = (window.innerHeight - rect.top + 20) + 'px';
      tooltip.style.right = 'auto';
    }

    // Keep in viewport
    var tRect = tooltip.getBoundingClientRect();
    if (tRect.left < 10) tooltip.style.left = '10px';
    if (tRect.right > window.innerWidth - 10) tooltip.style.left = (window.innerWidth - tw - 10) + 'px';
  }

  function centerTooltip(tooltip) {
    tooltip.style.left = '50%';
    tooltip.style.top = '50%';
    tooltip.style.right = 'auto';
    tooltip.style.bottom = 'auto';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }

  function next() {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      showStep();
    }
  }

  function back() {
    if (currentStep > 0) {
      currentStep--;
      showStep();
    }
  }

  function skip() { endTour(); }
  function finish() { endTour(); }

  window.__ccTour = { start: startTour, next: next, back: back, skip: skip, finish: finish };

  function init() {
    injectStyles();

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (document.getElementById('cc-tour-overlay')) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') { next(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { back(); e.preventDefault(); }
        if (e.key === 'Escape') { skip(); }
      }
    });

    // Check if tour has been completed
    var completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      // Auto-start tour after 3 seconds (let page load first)
      setTimeout(startTour, 3000);
      console.log('[demo-tour] Phase 24 initialized — tour will auto-start in 3s');
    } else {
      showReplayButton();
      console.log('[demo-tour] Phase 24 initialized — tour already completed, showing replay button');
    }
  }

  init();
})();
