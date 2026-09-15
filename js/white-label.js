// ====================================================================
// white-label.js — Phase 19: White-Label Settings Panel
// ====================================================================
// Users can customize branding: company name, primary color, accent,
// logo, and theme. All stored in localStorage, applied via CSS variables.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccWhiteLabelLoaded) return;
  window.__ccWhiteLabelLoaded = true;

  var SETTINGS_KEY = 'cc-white-label';
  var DEFAULTS = {
    companyName: 'AI Supply Chain',
    subtitle: 'Enterprise Command Center',
    primaryColor: '#10b981',
    accentColor: '#06b6d4',
    logoPreset: 'shield'
  };

  var LOGO_PRESETS = {
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>'
  };

  var COLOR_PRESETS = [
    { name: 'Emerald', primary: '#10b981', accent: '#06b6d4' },
    { name: 'Blue', primary: '#3b82f6', accent: '#8b5cf6' },
    { name: 'Violet', primary: '#8b5cf6', accent: '#ec4899' },
    { name: 'Amber', primary: '#f59e0b', accent: '#ef4444' },
    { name: 'Rose', primary: '#f43f5e', accent: '#f97316' },
    { name: 'Teal', primary: '#14b8a6', accent: '#3b82f6' },
  ];

  function getSettings() {
    var stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { return Object.assign({}, DEFAULTS, JSON.parse(stored)); } catch(e) {}
    }
    return DEFAULTS;
  }

  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    applySettings(s);
  }

  function applySettings(s) {
    var root = document.documentElement;
    root.style.setProperty('--primary', s.primaryColor);
    root.style.setProperty('--accent', s.accentColor);
    root.style.setProperty('--color-primary', s.primaryColor);
    root.style.setProperty('--color-accent', s.accentColor);
    root.style.setProperty('--color-emerald', s.primaryColor);
    root.style.setProperty('--color-cyan', s.accentColor);

    // Update sidebar logo text
    var logoTexts = document.querySelectorAll('.gradient-text');
    logoTexts.forEach(function(el) {
      if (el.textContent.includes('AI Supply Chain') || el.textContent.includes('Enterprise')) {
        el.textContent = s.companyName;
      }
    });

    // Update subtitle
    var subtitles = document.querySelectorAll('.text-\\[10px\\]');
    subtitles.forEach(function(el) {
      if (el.textContent.includes('Enterprise Command Center') || el.textContent.includes('Command Center')) {
        el.textContent = s.subtitle;
      }
    });

    // Update document title
    document.title = s.companyName + ' | ' + s.subtitle;
  }

  function injectStyles() {
    if (document.getElementById('cc-wl-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-wl-styles';
    style.textContent = `
      #cc-wl-trigger-btn {
        position: fixed; bottom: 500px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #0ea5e9, #6366f1);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-wl-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.5); }
      #cc-wl-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-wl-panel {
        background: #0f172a; border: 1px solid rgba(14,165,233,0.2);
        border-radius: 16px; width: 100%; max-width: 460px; max-height: 90vh;
        overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-wl-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.1)); }
      .cc-wl-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-wl-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-wl-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-wl-body { padding: 20px; }
      .cc-wl-label { font-size: 11px; color: #94a3b8; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
      .cc-wl-input { width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 14px; font-family: inherit; margin-bottom: 16px; }
      .cc-wl-input:focus { border-color: rgba(14,165,233,0.5); outline: none; }
      .cc-wl-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
      .cc-wl-preset { padding: 10px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; text-align: center; transition: all 0.2s; background: rgba(255,255,255,0.03); }
      .cc-wl-preset:hover { border-color: rgba(255,255,255,0.2); }
      .cc-wl-preset.selected { border-color: #fff; }
      .cc-wl-preset-swatch { display: flex; gap: 4px; justify-content: center; margin-bottom: 4px; }
      .cc-wl-swatch-dot { width: 20px; height: 20px; border-radius: 50%; }
      .cc-wl-preset-name { font-size: 10px; color: #94a3b8; font-family: -apple-system, sans-serif; }
      .cc-wl-logos { display: flex; gap: 8px; margin-bottom: 16px; }
      .cc-wl-logo-btn { width: 44px; height: 44px; border-radius: 10px; cursor: pointer; border: 2px solid transparent; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
      .cc-wl-logo-btn:hover { border-color: rgba(255,255,255,0.2); }
      .cc-wl-logo-btn.selected { border-color: #fff; background: rgba(14,165,233,0.1); }
      .cc-wl-logo-btn svg { width: 20px; height: 20px; color: #94a3b8; }
      .cc-wl-logo-btn.selected svg { color: #0ea5e9; }
      .cc-wl-save { width: 100%; padding: 12px; border-radius: 8px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: -apple-system, sans-serif; margin-top: 8px; }
      .cc-wl-save:hover { transform: scale(1.02); }
      .cc-wl-reset { width: 100%; padding: 8px; border-radius: 8px; background: transparent; color: #64748b; border: 1px solid rgba(255,255,255,0.1); font-size: 12px; cursor: pointer; font-family: -apple-system, sans-serif; margin-top: 8px; }
    `;
    document.head.appendChild(style);
  }

  var selectedSettings = DEFAULTS;

  function openPanel() {
    if (document.getElementById('cc-wl-overlay')) return;
    injectStyles();
    selectedSettings = getSettings();

    var presetsHTML = '';
    for (var i = 0; i < COLOR_PRESETS.length; i++) {
      var p = COLOR_PRESETS[i];
      var selected = (p.primary === selectedSettings.primaryColor) ? ' selected' : '';
      presetsHTML += '<div class="cc-wl-preset' + selected + '" onclick="window.__ccWL.selectPreset(' + i + ',this)">' +
        '<div class="cc-wl-preset-swatch"><div class="cc-wl-swatch-dot" style="background:' + p.primary + '"></div><div class="cc-wl-swatch-dot" style="background:' + p.accent + '"></div></div>' +
        '<div class="cc-wl-preset-name">' + p.name + '</div></div>';
    }

    var logosHTML = '';
    var logoNames = Object.keys(LOGO_PRESETS);
    for (var j = 0; j < logoNames.length; j++) {
      var ln = logoNames[j];
      var ls = (ln === selectedSettings.logoPreset) ? ' selected' : '';
      logosHTML += '<div class="cc-wl-logo-btn' + ls + '" onclick="window.__ccWL.selectLogo(\'' + ln + '\',this)">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + LOGO_PRESETS[ln] + '</svg></div>';
    }

    var overlay = document.createElement('div');
    overlay.id = 'cc-wl-overlay';
    overlay.innerHTML =
      '<div id="cc-wl-panel">' +
        '<div class="cc-wl-header">' +
          '<div class="cc-wl-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>White-Label Settings</div>' +
          '<button class="cc-wl-close" onclick="window.__ccWL.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-wl-body">' +
          '<div class="cc-wl-label">Company Name</div>' +
          '<input type="text" class="cc-wl-input" id="cc-wl-name" value="' + selectedSettings.companyName + '" maxlength="30">' +
          '<div class="cc-wl-label">Subtitle</div>' +
          '<input type="text" class="cc-wl-input" id="cc-wl-subtitle" value="' + selectedSettings.subtitle + '" maxlength="40">' +
          '<div class="cc-wl-label">Color Theme</div>' +
          '<div class="cc-wl-presets">' + presetsHTML + '</div>' +
          '<div class="cc-wl-label">Logo Icon</div>' +
          '<div class="cc-wl-logos">' + logosHTML + '</div>' +
          '<button class="cc-wl-save" onclick="window.__ccWL.save()">Apply Branding</button>' +
          '<button class="cc-wl-reset" onclick="window.__ccWL.reset()">Reset to Defaults</button>' +
        '</div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
  }

  function closePanel() {
    var overlay = document.getElementById('cc-wl-overlay');
    if (overlay) overlay.remove();
  }

  function selectPreset(idx, el) {
    var p = COLOR_PRESETS[idx];
    selectedSettings.primaryColor = p.primary;
    selectedSettings.accentColor = p.accent;
    var all = document.querySelectorAll('.cc-wl-preset');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');
  }

  function selectLogo(name, el) {
    selectedSettings.logoPreset = name;
    var all = document.querySelectorAll('.cc-wl-logo-btn');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');
  }

  function save() {
    selectedSettings.companyName = document.getElementById('cc-wl-name').value.trim() || 'AI Supply Chain';
    selectedSettings.subtitle = document.getElementById('cc-wl-subtitle').value.trim() || 'Enterprise Command Center';
    saveSettings(selectedSettings);
    closePanel();
    console.log('[white-label] Settings applied: ' + selectedSettings.companyName + ' / ' + selectedSettings.primaryColor);
  }

  function reset() {
    selectedSettings = Object.assign({}, DEFAULTS);
    saveSettings(selectedSettings);
    closePanel();
    console.log('[white-label] Reset to defaults');
  }

  window.__ccWL = { open: openPanel, close: closePanel, selectPreset: selectPreset, selectLogo: selectLogo, save: save, reset: reset };

  function injectButton() {
    if (document.getElementById('cc-wl-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-wl-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Branding';
    btn.setAttribute('aria-label', 'Open White-Label Settings');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[white-label] Phase 19 button injected');
  }

  function init() {
    injectStyles();
    var settings = getSettings();
    applySettings(settings);
    console.log('[white-label] Phase 19 initialized — brand: ' + settings.companyName);

    document.addEventListener('keydown', function(e) {
      if ((e.key === 'w' || e.key === 'W') && !e.metaKey && !e.ctrlKey && e.shiftKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-wl-overlay')) { openPanel(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closePanel();
    });

    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-wl-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-wl-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 5500);
  }

  init();
})();
