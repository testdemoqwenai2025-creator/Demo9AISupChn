// ====================================================================
// home-experience.js — Phases 30-37: Complete Home Page Experience
// ====================================================================
// Combines all 8 home page enhancements into one script:
//   30: Demo login with 3 personas (Sarah/Michael/Guest)
//   31: Live data ticker bar (scrolling news + FX + weather + risk)
//   32: Animated count-up statistics (Intersection Observer)
//   33: Dark/light theme toggle on home page
//   34: Interactive hero with mini preview
//   35: Scroll animations (fade + slide in)
//   36: Role-based landing (personalized welcome)
//   37: Home page FAB (quick access menu)
// ====================================================================

(function() {
  'use strict';
  if (window.__ccHomeExpLoaded) return;
  window.__ccHomeExpLoaded = true;

  // ====================================================================
  // PHASE 33: Theme Toggle
  // ====================================================================
  function initThemeToggle() {
    var stored = localStorage.getItem('cc-theme') || 'dark';
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    // Add toggle button to header if not present
    var header = document.querySelector('header, .header-content, nav');
    if (header && !document.getElementById('home-theme-toggle')) {
      var btn = document.createElement('button');
      btn.id = 'home-theme-toggle';
      btn.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 10px;cursor:pointer;color:inherit;display:flex;align-items:center;gap:4px;font-size:13px;font-family:inherit;transition:all 0.2s;';
      btn.innerHTML = stored === 'dark' ? '\u{1F319}' : '\u2600';
      btn.setAttribute('aria-label', 'Toggle theme');
      btn.onclick = function() {
        var isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('cc-theme', 'light');
          btn.innerHTML = '\u2600';
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('cc-theme', 'dark');
          btn.innerHTML = '\u{1F319}';
        }
      };
      // Try to insert near login button
      var loginBtn = header.querySelector('[onclick*="login"], [onclick*="openModal"], .btn-login');
      if (loginBtn && loginBtn.parentNode) {
        loginBtn.parentNode.insertBefore(btn, loginBtn);
      } else {
        header.appendChild(btn);
      }
    }
    console.log('[home-experience] Phase 33: Theme toggle initialized');
  }

  // ====================================================================
  // PHASE 32: Animated Count-Up Statistics
  // ====================================================================
  function initCountUp() {
    var stats = [
      { id: 'stat-suppliers', target: 847, suffix: '' },
      { id: 'stat-spend', target: 47.8, prefix: '$', suffix: 'M', isFloat: true },
      { id: 'stat-accuracy', target: 96.4, suffix: '%', isFloat: true },
      { id: 'stat-alerts', target: 24, suffix: '' },
      { id: 'stat-countries', target: 42, suffix: '' },
    ];

    function animateCount(el, target, isFloat, prefix, suffix) {
      var duration = 2000;
      var start = 0;
      var startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = start + (target - start) * eased;
        var display = isFloat ? current.toFixed(1) : Math.round(current);
        el.textContent = (prefix || '') + display + (suffix || '');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var stat = stats.find(function(s) { return s.id === el.id; });
          if (stat) {
            animateCount(el, stat.target, stat.isFloat, stat.prefix, stat.suffix);
            observer.unobserve(el);
          }
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(function(stat) {
      var el = document.getElementById(stat.id);
      if (el) { el.textContent = '0'; observer.observe(el); }
    });
    console.log('[home-experience] Phase 32: Count-up animations initialized');
  }

  // ====================================================================
  // PHASE 31: Live Data Ticker
  // ====================================================================
  function initTicker() {
    if (document.getElementById('home-ticker')) return;
    var ticker = document.createElement('div');
    ticker.id = 'home-ticker';
    ticker.style.cssText = 'position:sticky;top:0;z-index:100;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(16,185,129,0.15);overflow:hidden;white-space:nowrap;';
    ticker.innerHTML =
      '<div id="ticker-content" style="display:inline-block;padding:8px 0;animation:ticker-scroll 60s linear infinite;font-size:12px;color:#94a3b8;font-family:-apple-system,sans-serif;">' +
        '<span style="margin:0 30px;color:#f87171;">\u26a0 Risk Alert: Shanghai Advanced Materials flagged UFLPA Entity List match (86.1% confidence)</span>' +
        '<span style="margin:0 30px;color:#34d399;">\u2191 EUR/USD: 1.0847 (+0.2%)</span>' +
        '<span style="margin:0 30px;color:#22d3ee;">\u{1F326} Port of Shanghai: 28\u00b0C, Wind 12 km/h, Clear</span>' +
        '<span style="margin:0 30px;color:#fbbf24;">\u{1F4E0} 156 orders in pipeline across 42 countries</span>' +
        '<span style="margin:0 30px;color:#f87171;">\u26a0 TechComp Asia: Geopolitical risk escalation (South China Sea)</span>' +
        '<span style="margin:0 30px;color:#a78bfa;">\u{1F50E} AI Accuracy: 96.4% (SHAP-explainable models)</span>' +
        '<span style="margin:0 30px;color:#34d399;">\u2191 SGD/USD: 1.3442 (+0.1%)</span>' +
        '<span style="margin:0 30px;color:#22d3ee;">\u{1F326} Port of Rotterdam: 14\u00b0C, Wind 8 km/h, Partly Cloudy</span>' +
        '<span style="margin:0 30px;color:#fbbf24;">\u{1F4CB} 43 active tenders, $2.1B total value</span>' +
        '<span style="margin:0 30px;color:#ec4899;">\u{1F9E0} AI Concierge: 3 APAC suppliers risk increased 12% this week</span>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent = '@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }';
    document.head.appendChild(style);

    // Insert after header
    var header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(ticker, header.nextSibling);
    } else {
      document.body.insertBefore(ticker, document.body.firstChild);
    }
    console.log('[home-experience] Phase 31: Live data ticker initialized');
  }

  // ====================================================================
  // PHASE 35: Scroll Animations
  // ====================================================================
  function initScrollAnimations() {
    var style = document.createElement('style');
    style.textContent =
      '.cc-fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }' +
      '.cc-fade-in.cc-visible { opacity: 1; transform: translateY(0); }' +
      '.cc-fade-in-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.6s ease, transform 0.6s ease; }' +
      '.cc-fade-in-left.cc-visible { opacity: 1; transform: translateX(0); }' +
      '.cc-fade-in-right { opacity: 0; transform: translateX(30px); transition: opacity 0.6s ease, transform 0.6s ease; }' +
      '.cc-fade-in-right.cc-visible { opacity: 1; transform: translateX(0); }' +
      '.cc-scale-in { opacity: 0; transform: scale(0.9); transition: opacity 0.6s ease, transform 0.6s ease; }' +
      '.cc-scale-in.cc-visible { opacity: 1; transform: scale(1); }';
    document.head.appendChild(style);

    // Add classes to elements
    var cards = document.querySelectorAll('.glass, .industry-card, .capability-card, .cc-data-card');
    cards.forEach(function(card, i) {
      var classes = ['cc-fade-in', 'cc-fade-in-left', 'cc-fade-in-right', 'cc-scale-in'];
      card.classList.add(classes[i % classes.length]);
    });

    var sections = document.querySelectorAll('section');
    sections.forEach(function(section) {
      section.classList.add('cc-fade-in');
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('cc-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.cc-fade-in, .cc-fade-in-left, .cc-fade-in-right, .cc-scale-in').forEach(function(el) {
      observer.observe(el);
    });
    console.log('[home-experience] Phase 35: Scroll animations initialized');
  }

  // ====================================================================
  // PHASE 34: Interactive Hero Mini Preview
  // ====================================================================
  function initHeroPreview() {
    var hero = document.querySelector('.hero, section:first-of-type');
    if (!hero || document.getElementById('hero-mini-preview')) return;

    var preview = document.createElement('div');
    preview.id = 'hero-mini-preview';
    preview.style.cssText = 'margin-top:32px;padding:20px;background:rgba(15,23,42,0.6);border:1px solid rgba(16,185,129,0.15);border-radius:16px;backdrop-filter:blur(8px);max-width:500px;';
    preview.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
        '<span style="font-size:12px;color:#94a3b8;font-family:-apple-system,sans-serif;">\u{1F4CA} Live Command Center Preview</span>' +
        '<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#34d399;"><span style="width:6px;height:6px;border-radius:50%;background:#34d399;animation:cc-pulse 2s infinite;"></span> LIVE</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">' +
        '<div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#f87171;" id="mini-alerts">24</div><div style="font-size:9px;color:#64748b;">Risk Alerts</div></div>' +
        '<div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#34d399;" id="mini-orders">156</div><div style="font-size:9px;color:#64748b;">Orders</div></div>' +
        '<div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#a78bfa;" id="mini-accuracy">96.4%</div><div style="font-size:9px;color:#64748b;">AI Accuracy</div></div>' +
      '</div>' +
      '<div style="margin-top:10px;font-size:10px;color:#64748b;text-align:center;font-family:-apple-system,sans-serif;">Click "Launch Command Center" to explore all 28 features</div>';

    var pulseStyle = document.createElement('style');
    pulseStyle.textContent = '@keyframes cc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }';
    document.head.appendChild(pulseStyle);

    // Insert into hero
    var ctaContainer = hero.querySelector('.btn-primary, a[href*="command-center"]');
    if (ctaContainer) {
      ctaContainer.parentNode.appendChild(preview);
    } else {
      hero.appendChild(preview);
    }

    // Animate mini counters
    var alertsEl = document.getElementById('mini-alerts');
    var ordersEl = document.getElementById('mini-orders');
    if (alertsEl && ordersEl) {
      setInterval(function() {
        var a = parseInt(alertsEl.textContent);
        if (Math.random() > 0.7) {
          a = Math.max(15, Math.min(40, a + (Math.random() > 0.5 ? 1 : -1)));
          alertsEl.textContent = a;
          alertsEl.style.transition = 'color 0.3s';
          alertsEl.style.color = '#ef4444';
          setTimeout(function() { alertsEl.style.color = '#f87171'; }, 300);
        }
      }, 5000);
    }
    console.log('[home-experience] Phase 34: Hero mini preview initialized');
  }

  // ====================================================================
  // PHASE 30 + 36: Demo Login with Personas + Role-Based Landing
  // ====================================================================
  var PERSONAS = [
    { name: 'Sarah Chen', email: 'sarah@aisupplychain.com', role: 'admin', color: '#10b981', initials: 'SC', desc: 'Full access — all 28 features' },
    { name: 'Michael Rodriguez', email: 'michael@aisupplychain.com', role: 'operator', color: '#06b6d4', initials: 'MR', desc: 'Orders + Tenders — operational features' },
    { name: 'Guest Viewer', email: 'guest@aisupplychain.com', role: 'viewer', color: '#8b5cf6', initials: 'GV', desc: 'Read-only — explore dashboards' },
  ];

  function initDemoLogin() {
    // Replace the login modal content
    var loginModal = document.getElementById('loginModal') || document.getElementById('cc-auth-login');
    if (!loginModal) {
      // Try to find login form in the page
      var loginForm = document.querySelector('[onsubmit*="login"], form#login-form, #login .cc-auth-fg');
      if (loginForm) {
        enhanceLoginForm(loginForm);
      }
    }

    // Also enhance the "Get Started" modal
    var gsModal = document.getElementById('getstartedModal') || document.getElementById('cc-auth-gs');
    if (gsModal) {
      enhanceGetStartedModal(gsModal);
    }

    // Check if user is already "logged in"
    var stored = localStorage.getItem('cc-auth-user');
    if (stored) {
      try {
        var user = JSON.parse(stored);
        showPersonalizedWelcome(user);
      } catch(e) {}
    }
    console.log('[home-experience] Phase 30+36: Demo login + role-based landing initialized');
  }

  function enhanceLoginForm(form) {
    // Check if already enhanced
    if (form.querySelector('.persona-selector')) return;

    var personaHTML = '<div class="persona-selector" style="margin-bottom:16px;">' +
      '<p style="font-size:12px;color:#94a3b8;margin-bottom:8px;font-family:-apple-system,sans-serif;">Choose a demo persona:</p>' +
      '<div style="display:flex;gap:8px;">';

    PERSONAS.forEach(function(p, i) {
      personaHTML += '<button type="button" onclick="window.__ccHomeExp.selectPersona(' + i + ')" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;text-align:center;transition:all 0.2s;" onmouseover="this.style.borderColor=\'rgba(16,185,129,0.3)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,0.1)\'">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:' + p.color + ';margin:0 auto 6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;">' + p.initials + '</div>' +
        '<div style="font-size:12px;font-weight:600;color:#fff;">' + p.name + '</div>' +
        '<div style="font-size:10px;color:#64748b;margin-top:2px;">' + p.desc + '</div>' +
      '</button>';
    });
    personaHTML += '</div></div>';

    // Prepend persona selector
    form.insertAdjacentHTML('afterbegin', personaHTML);

    // Pre-fill with default
    selectPersona(0);

    // Add demo notice
    var notice = document.createElement('div');
    notice.style.cssText = 'padding:8px;background:rgba(16,185,129,0.1);border-radius:8px;margin-top:12px;font-size:11px;color:#34d399;text-align:center;font-family:-apple-system,sans-serif;';
    notice.textContent = '\u2705 Demo mode — no real authentication. Click a persona above, then submit.';
    form.appendChild(notice);
  }

  function enhanceGetStartedModal(modal) {
    if (modal.querySelector('.persona-selector')) return;
    var form = modal.querySelector('form') || modal;
    enhanceLoginForm(form);
  }

  function selectPersona(idx) {
    var p = PERSONAS[idx];
    // Fill the email/password fields
    var emailInput = document.querySelector('input[type="email"]');
    var passInput = document.querySelector('input[type="password"]');
    if (emailInput) emailInput.value = p.email;
    if (passInput) passInput.value = 'demo';

    // Highlight selected persona
    var buttons = document.querySelectorAll('.persona-selector button');
    buttons.forEach(function(btn, i) {
      btn.style.borderColor = i === idx ? p.color : 'rgba(255,255,255,0.1)';
      btn.style.background = i === idx ? p.color + '15' : 'rgba(255,255,255,0.03)';
    });

    window.__ccHomeExp._selectedPersona = p;
    console.log('[home-experience] Selected persona: ' + p.name + ' (' + p.role + ')');
  }

  function showPersonalizedWelcome(user) {
    if (document.getElementById('personalized-welcome')) return;
    var hero = document.querySelector('.hero, section:first-of-type');
    if (!hero) return;

    var welcome = document.createElement('div');
    welcome.id = 'personalized-welcome';
    welcome.style.cssText = 'position:absolute;top:10px;right:20px;padding:8px 16px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:9999px;display:flex;align-items:center;gap:8px;font-size:12px;color:#34d399;font-family:-apple-system,sans-serif;backdrop-filter:blur(8px);';
    welcome.innerHTML =
      '<div style="width:24px;height:24px;border-radius:50%;background:' + (user.color || '#10b981') + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px;">' + (user.name || 'U').substring(0,2).toUpperCase() + '</div>' +
      '<span>Welcome back, ' + (user.name || 'User').split(' ')[0] + '</span>' +
      '<span style="color:#64748b;font-size:10px;">(' + (user.role || 'viewer') + ')</span>' +
      '<a href="./command-center" style="color:#34d399;text-decoration:none;font-weight:600;">\u2192 Resume</a>';
    hero.style.position = 'relative';
    hero.appendChild(welcome);
  }

  // ====================================================================
  // PHASE 37: Home Page FAB (Quick Access Menu)
  // ====================================================================
  function initHomeFAB() {
    if (document.getElementById('home-fab')) return;

    var style = document.createElement('style');
    style.textContent =
      '#home-fab { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }' +
      '#home-fab-main { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #06b6d4); border: none; cursor: pointer; box-shadow: 0 6px 20px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }' +
      '#home-fab-main:hover { transform: scale(1.1); }' +
      '#home-fab-main svg { width: 24px; height: 24px; color: #fff; transition: transform 0.3s; }' +
      'body.cc-fab-open #home-fab-main svg { transform: rotate(45deg); }' +
      'body.cc-fab-open #home-fab-main { background: linear-gradient(135deg, #ef4444, #f97316); }' +
      '#home-fab-menu { position: absolute; bottom: 70px; right: 0; display: flex; flex-direction: column; gap: 8px; opacity: 0; pointer-events: none; transition: opacity 0.3s; }' +
      'body.cc-fab-open #home-fab-menu { opacity: 1; pointer-events: auto; }' +
      '.home-fab-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 12px; background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; font-family: -apple-system, sans-serif; white-space: nowrap; transition: all 0.2s; backdrop-filter: blur(8px); }' +
      '.home-fab-item:hover { transform: translateX(-4px); border-color: rgba(16,185,129,0.3); }' +
      '.home-fab-item-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }' +
      '#home-fab-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9998; display: none; }' +
      'body.cc-fab-open #home-fab-overlay { display: block; }';
    document.head.appendChild(style);

    var fab = document.createElement('div');
    fab.id = 'home-fab';
    fab.innerHTML =
      '<div id="home-fab-overlay"></div>' +
      '<div id="home-fab-menu">' +
        '<a href="./command-center" class="home-fab-item"><div class="home-fab-item-icon" style="background:rgba(16,185,129,0.15);">\u26a1</div>Launch Command Center</a>' +
        '<a href="./command-center" class="home-fab-item" onclick="sessionStorage.setItem(\'cc-open-globe\',\'1\')"><div class="home-fab-item-icon" style="background:rgba(139,92,246,0.15);">\u{1F30E}</div>View 3D Globe</a>' +
        '<a href="./command-center" class="home-fab-item" onclick="sessionStorage.setItem(\'cc-open-news\',\'1\')"><div class="home-fab-item-icon" style="background:rgba(220,38,38,0.15);">\u{1F4F0}</div>Read Latest News</a>' +
        '<a href="./command-center" class="home-fab-item" onclick="sessionStorage.setItem(\'cc-open-fx\',\'1\')"><div class="home-fab-item-icon" style="background:rgba(5,150,105,0.15);">\u{1F4B9}</div>Check FX Rates</a>' +
        '<a href="./command-center" class="home-fab-item" onclick="sessionStorage.setItem(\'cc-open-weather\',\'1\')"><div class="home-fab-item-icon" style="background:rgba(2,132,199,0.15);">\u{1F326}</div>Port Weather</a>' +
      '</div>' +
      '<button id="home-fab-main"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
    document.body.appendChild(fab);

    document.getElementById('home-fab-main').addEventListener('click', function(e) {
      e.stopPropagation();
      document.body.classList.toggle('cc-fab-open');
    });
    document.getElementById('home-fab-overlay').addEventListener('click', function() {
      document.body.classList.remove('cc-fab-open');
    });
    console.log('[home-experience] Phase 37: Home FAB initialized');
  }

  // ====================================================================
  // INTERCEPT LOGIN FORM SUBMISSION
  // ====================================================================
  function interceptLogin() {
    // Find all forms that look like login forms
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      if (form.dataset.ccIntercepted) return;
      var hasEmail = form.querySelector('input[type="email"]');
      var hasPassword = form.querySelector('input[type="password"]');
      if (!hasEmail || !hasPassword) return;

      form.dataset.ccIntercepted = '1';
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var persona = window.__ccHomeExp._selectedPersona || PERSONAS[0];
        var user = {
          email: hasEmail.value || persona.email,
          name: persona.name,
          role: persona.role,
          color: persona.color
        };
        localStorage.setItem('cc-auth-user', JSON.stringify(user));
        console.log('[home-experience] Login as: ' + user.name + ' (' + user.role + ')');
        // Redirect to command center
        window.location.href = './command-center';
      });
    });

    // Also intercept button-based login (onclick)
    var loginBtns = document.querySelectorAll('[onclick*="login"], [onclick*="Launch"], [onclick*="command-center"]');
    loginBtns.forEach(function(btn) {
      // Don't intercept if it's a direct link
    });
    console.log('[home-experience] Login forms intercepted');
  }

  // ====================================================================
  // INIT ALL PHASES
  // ====================================================================
  window.__ccHomeExp = {
    selectPersona: selectPersona,
    _selectedPersona: PERSONAS[0]
  };

  function init() {
    // Phase 33: Theme toggle
    initThemeToggle();

    // Phase 31: Live ticker
    initTicker();

    // Phase 34: Hero preview
    setTimeout(initHeroPreview, 1000);

    // Phase 32: Count-up stats
    setTimeout(initCountUp, 1500);

    // Phase 35: Scroll animations
    setTimeout(initScrollAnimations, 500);

    // Phase 30+36: Demo login + role-based landing
    setTimeout(initDemoLogin, 800);
    setTimeout(interceptLogin, 1000);

    // Phase 37: Home FAB
    setTimeout(initHomeFAB, 1200);

    console.log('[home-experience] Phases 30-37 all initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
