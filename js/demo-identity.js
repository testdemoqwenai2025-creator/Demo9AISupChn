// ====================================================================
// demo-identity.js — Phase 18: Demo Identity System
// ====================================================================
// Instead of real auth, gives users a persistent identity:
// - First visit: "Set up your profile" modal
// - Pick display name + avatar color + role
// - Stored in localStorage (cc-user-profile)
// - Shows "Logged in as" badge in header
// - Integrates with Phase 11 (cursors) + Phase 13 (Waze reputation)
// - Settings panel to change profile later
// ====================================================================

(function() {
  'use strict';
  if (window.__ccIdentityLoaded) return;
  window.__ccIdentityLoaded = true;

  var PROFILE_KEY = 'cc-user-profile';
  var COLORS = ['#10b981','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#ec4899','#3b82f6','#14b8a6','#f97316','#a855f7'];
  var ROLES = ['Viewer', 'Operator', 'Admin'];

  function getProfile() {
    var stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return null;
  }

  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Also sync with cursor identity
    if (profile.name) localStorage.setItem('cc-cursor-id', profile.name);
    if (profile.color) localStorage.setItem('cc-cursor-color', profile.color);
  }

  function generateDefaultProfile() {
    var id = Math.random().toString(36).substring(2, 7).toUpperCase();
    return {
      name: 'User-' + id,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      role: 'Viewer',
      createdAt: Date.now()
    };
  }

  function injectStyles() {
    if (document.getElementById('cc-identity-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-identity-styles';
    style.textContent = `
      #cc-identity-badge {
        display: flex; align-items: center; gap: 6px;
        padding: 4px 10px; border-radius: 9999px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        font-size: 11px; font-weight: 600; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        cursor: pointer; transition: all 0.2s;
      }
      #cc-identity-badge:hover { background: rgba(255,255,255,0.1); }
      #cc-identity-avatar {
        width: 20px; height: 20px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700; color: #fff;
      }
      #cc-identity-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-identity-panel {
        background: #0f172a; border: 1px solid rgba(16,185,129,0.2);
        border-radius: 16px; width: 100%; max-width: 420px;
        padding: 28px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-id-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: -apple-system, sans-serif; }
      .cc-id-subtitle { font-size: 12px; color: #94a3b8; margin-bottom: 24px; font-family: -apple-system, sans-serif; }
      .cc-id-label { font-size: 11px; color: #94a3b8; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
      .cc-id-input { width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 14px; font-family: inherit; margin-bottom: 16px; }
      .cc-id-input:focus { border-color: rgba(16,185,129,0.5); outline: none; }
      .cc-id-colors { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
      .cc-id-color { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: all 0.2s; }
      .cc-id-color.selected { border-color: #fff; transform: scale(1.15); }
      .cc-id-roles { display: flex; gap: 8px; margin-bottom: 20px; }
      .cc-id-role { padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; font-family: -apple-system, sans-serif; }
      .cc-id-role.selected { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); color: #34d399; }
      .cc-id-save { width: 100%; padding: 12px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: -apple-system, sans-serif; }
      .cc-id-save:hover { transform: scale(1.02); }
    `;
    document.head.appendChild(style);
  }

  var selectedColor = COLORS[0];
  var selectedRole = 'Viewer';

  function showProfileModal() {
    injectStyles();
    var profile = getProfile() || generateDefaultProfile();
    selectedColor = profile.color;
    selectedRole = profile.role;

    var colorsHTML = '';
    for (var i = 0; i < COLORS.length; i++) {
      colorsHTML += '<div class="cc-id-color' + (COLORS[i] === selectedColor ? ' selected' : '') + '" style="background:' + COLORS[i] + '" onclick="window.__ccIdentity.selectColor(\'' + COLORS[i] + '\', this)"></div>';
    }

    var rolesHTML = '';
    for (var j = 0; j < ROLES.length; j++) {
      rolesHTML += '<button class="cc-id-role' + (ROLES[j] === selectedRole ? ' selected' : '') + '" onclick="window.__ccIdentity.selectRole(\'' + ROLES[j] + '\', this)">' + ROLES[j] + '</button>';
    }

    var overlay = document.createElement('div');
    overlay.id = 'cc-identity-overlay';
    overlay.innerHTML =
      '<div id="cc-identity-panel">' +
        '<div class="cc-id-title">Your Profile</div>' +
        '<div class="cc-id-subtitle">This identity is used for collaboration, cursors, and reputation.</div>' +
        '<div class="cc-id-label">Display Name</div>' +
        '<input type="text" class="cc-id-input" id="cc-id-name" value="' + profile.name + '" maxlength="20">' +
        '<div class="cc-id-label">Avatar Color</div>' +
        '<div class="cc-id-colors">' + colorsHTML + '</div>' +
        '<div class="cc-id-label">Role</div>' +
        '<div class="cc-id-roles">' + rolesHTML + '</div>' +
        '<button class="cc-id-save" onclick="window.__ccIdentity.save()">Save Profile</button>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  function selectColor(color, el) {
    selectedColor = color;
    var all = document.querySelectorAll('.cc-id-color');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');
  }

  function selectRole(role, el) {
    selectedRole = role;
    var all = document.querySelectorAll('.cc-id-role');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');
  }

  function save() {
    var name = document.getElementById('cc-id-name').value.trim() || 'User-ANON';
    var profile = { name: name, color: selectedColor, role: selectedRole, createdAt: Date.now() };
    saveProfile(profile);
    var overlay = document.getElementById('cc-identity-overlay');
    if (overlay) overlay.remove();
    updateBadge(profile);
    console.log('[demo-identity] Profile saved: ' + name + ' (' + selectedRole + ')');
  }

  function updateBadge(profile) {
    if (!profile) profile = getProfile();
    if (!profile) return;

    var existing = document.getElementById('cc-identity-badge');
    if (existing) existing.remove();

    var initials = profile.name.replace('User-', '').substring(0, 2).toUpperCase();
    var badge = document.createElement('div');
    badge.id = 'cc-identity-badge';
    badge.innerHTML = '<div id="cc-identity-avatar" style="background:' + profile.color + '">' + initials + '</div><span>' + profile.name + '</span><span style="color:#64748b;font-size:10px;">' + profile.role + '</span>';
    badge.onclick = showProfileModal;

    var header = document.querySelector('header');
    if (header) header.appendChild(badge);
    else document.body.appendChild(badge);
  }

  window.__ccIdentity = { show: showProfileModal, selectColor: selectColor, selectRole: selectRole, save: save };

  function init() {
    injectStyles();
    var profile = getProfile();
    if (profile) {
      updateBadge(profile);
      console.log('[demo-identity] Profile loaded: ' + profile.name + ' (' + profile.role + ')');
    } else {
      // First visit — create default profile silently
      profile = generateDefaultProfile();
      saveProfile(profile);
      updateBadge(profile);
      console.log('[demo-identity] Created default profile: ' + profile.name);
    }
  }

  setTimeout(init, 2000);
})();
