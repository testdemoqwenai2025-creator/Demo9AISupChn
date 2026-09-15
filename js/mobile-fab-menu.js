// ====================================================================
// mobile-fab-menu.js — Phase 16: Collapsible Floating Button Menu
// ====================================================================
// Wraps all floating buttons in a collapsible FAB container.
// Desktop: shows all buttons stacked vertically (current behavior).
// Mobile (<768px): collapses into a single FAB with expand animation.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccFABMenuLoaded) return;
  window.__ccFABMenuLoaded = true;

  function injectStyles() {
    if (document.getElementById('cc-fab-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-fab-styles';
    style.textContent = `
      @media (max-width: 768px) {
        /* Hide individual floating buttons on mobile, show FAB menu instead */
        #cc-om-trigger-btn,
        #cc-tm-trigger-btn,
        #cc-pa-trigger-btn,
        #cc-ai-trigger-btn,
        #cc-waze-trigger-btn,
        #cc-concierge-trigger-btn,
        #cc-blockchain-trigger-btn,
        #cc-tm2-trigger-btn {
          opacity: 0 !important;
          pointer-events: none !important;
          transform: scale(0.5) !important;
          transition: all 0.3s ease !important;
        }

        body.cc-fab-expanded #cc-om-trigger-btn,
        body.cc-fab-expanded #cc-tm-trigger-btn,
        body.cc-fab-expanded #cc-pa-trigger-btn,
        body.cc-fab-expanded #cc-ai-trigger-btn,
        body.cc-fab-expanded #cc-waze-trigger-btn,
        body.cc-fab-expanded #cc-concierge-trigger-btn,
        body.cc-fab-expanded #cc-blockchain-trigger-btn,
        body.cc-fab-expanded #cc-tm2-trigger-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: scale(1) !important;
        }
      }

      #cc-fab-toggle {
        position: fixed; bottom: 20px; right: 20px; z-index: 100000;
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #06b6d4);
        border: none; cursor: pointer;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        display: none; align-items: center; justify-content: center;
        transition: all 0.3s ease;
      }

      @media (max-width: 768px) {
        #cc-fab-toggle { display: flex; }
      }

      #cc-fab-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
      }

      #cc-fab-toggle svg {
        width: 24px; height: 24px; color: #fff;
        transition: transform 0.3s ease;
      }

      body.cc-fab-expanded #cc-fab-toggle {
        background: linear-gradient(135deg, #ef4444, #f97316);
        transform: rotate(45deg);
      }

      #cc-fab-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.3); z-index: 99998;
        display: none;
      }

      body.cc-fab-expanded #cc-fab-overlay {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();

    // Create FAB toggle button
    var fabBtn = document.createElement('button');
    fabBtn.id = 'cc-fab-toggle';
    fabBtn.setAttribute('aria-label', 'Toggle quick actions menu');
    fabBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    document.body.appendChild(fabBtn);

    // Create overlay (click to close)
    var overlay = document.createElement('div');
    overlay.id = 'cc-fab-overlay';
    document.body.appendChild(overlay);

    // Toggle handler
    fabBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.body.classList.toggle('cc-fab-expanded');
    });

    overlay.addEventListener('click', function() {
      document.body.classList.remove('cc-fab-expanded');
    });

    // ESC to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.body.classList.remove('cc-fab-expanded');
      }
    });

    console.log('[mobile-fab-menu] Phase 16 initialized');
  }

  // Start after enhancement scripts have injected their buttons
  setTimeout(init, 6000);
})();
