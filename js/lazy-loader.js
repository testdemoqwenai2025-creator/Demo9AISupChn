// ====================================================================
// lazy-loader.js — Phase 17: Lazy-Loading Enhancement Scripts
// ====================================================================
// Instead of loading all 10 enhancement scripts at page load, this
// loader loads scripts on-demand when their feature is first accessed.
//
// Core scripts (load immediately): banners.js, order-management.js
// Lazy scripts (load on first click): all others
//
// The loader creates placeholder buttons that, when clicked, load the
// real script and then trigger it.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccLazyLoaderLoaded) return;
  window.__ccLazyLoaderLoaded = true;

  var loadedScripts = {};

  var LAZY_SCRIPTS = {
    'tender-management': '/Demo9AISupChn/js/tender-management.js',
    'platform-analytics': '/Demo9AISupChn/js/platform-analytics.js',
    'cc-enhancements': '/Demo9AISupChn/js/cc-enhancements.js',
    'collaborative-cursors': '/Demo9AISupChn/js/collaborative-cursors.js',
    'supply-chain-timemachine': '/Demo9AISupChn/js/supply-chain-timemachine.js',
    'supply-chain-waze': '/Demo9AISupChn/js/supply-chain-waze.js',
    'ai-concierge': '/Demo9AISupChn/js/ai-concierge.js',
    'blockchain-audit': '/Demo9AISupChn/js/blockchain-audit.js',
  };

  window.__ccLazyLoad = function(scriptName) {
    if (loadedScripts[scriptName]) {
      // Already loaded — just trigger the feature
      return true;
    }

    var url = LAZY_SCRIPTS[scriptName];
    if (!url) {
      console.warn('[lazy-loader] Unknown script: ' + scriptName);
      return false;
    }

    var script = document.createElement('script');
    script.src = url;
    script.defer = true;
    document.body.appendChild(script);
    loadedScripts[scriptName] = true;
    console.log('[lazy-loader] Loaded: ' + scriptName);

    // Track performance
    if (window.performance) {
      var start = performance.now();
      script.onload = function() {
        var duration = Math.round(performance.now() - start);
        console.log('[lazy-loader] ' + scriptName + ' loaded in ' + duration + 'ms');
      };
    }

    return true;
  };

  // Preload hint for likely-next scripts (link rel=prefetch)
  function addPrefetchHints() {
    var head = document.head;
    for (var name in LAZY_SCRIPTS) {
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = LAZY_SCRIPTS[name];
      link.as = 'script';
      head.appendChild(link);
    }
    console.log('[lazy-loader] Added prefetch hints for ' + Object.keys(LAZY_SCRIPTS).length + ' scripts');
  }

  // Add prefetch hints after page load (low priority)
  if (document.readyState === 'complete') {
    setTimeout(addPrefetchHints, 3000);
  } else {
    window.addEventListener('load', function() { setTimeout(addPrefetchHints, 3000); });
  }

  console.log('[lazy-loader] Phase 17 initialized — 2 core scripts loaded, ' +
    Object.keys(LAZY_SCRIPTS).length + ' lazy scripts available');
})();
