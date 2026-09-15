// ====================================================================
// real-ai-chat.js — Phase 27: Real AI Model for AI Expert Chat
// ====================================================================
// Replaces fuzzy matching (Phase 5) with real LLM via z-ai-web-dev-sdk.
// Falls back to fuzzy matching if SDK unavailable.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccRealAILoaded) return;
  window.__ccRealAILoaded = true;

  // Supply chain context for the AI
  var SYSTEM_PROMPT = 'You are an AI Supply Chain Expert assistant for a command center dashboard. ' +
    'Current metrics: 24 active risk alerts, 156 orders in pipeline, 43 active tenders ($2.1B total), ' +
    '$47.8M global spend YTD, 847 suppliers across 42 countries, 96.4% AI prediction accuracy. ' +
    'Key risks: UFLPA entity list match (Shanghai Advanced Materials), geopolitical tension (South China Sea), ' +
    'credit downgrade (EuroManufacturing GmbH A- to BBB+), EUDR deforestation risk (BrazilAgro). ' +
    'Answer concisely in 2-3 sentences. Use supply chain terminology.';

  var chatHistory = [];

  function injectStyles() {
    if (document.getElementById('cc-realai-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-realai-styles';
    s.textContent = `
      #cc-realai-trigger-btn {
        position: fixed; bottom: 980px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #7c3aed, #c026d3);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(124,58,237,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-realai-trigger-btn:hover { transform: translateY(-2px); }
      #cc-realai-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-realai-panel {
        background: #0f172a; border: 1px solid rgba(124,58,237,0.2);
        border-radius: 16px; width: 100%; max-width: 480px; height: 75vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-rai-header { padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(192,38,211,0.1)); }
      .cc-rai-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-rai-badge { padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 700; background: rgba(16,185,129,0.15); color: #34d399; }
      .cc-rai-close { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; padding: 4px; }
      .cc-rai-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
      .cc-rai-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; font-family: -apple-system, sans-serif; white-space: pre-wrap; }
      .cc-rai-msg.user { background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; align-self: flex-end; }
      .cc-rai-msg.bot { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; align-self: flex-start; }
      .cc-rai-typing { display: flex; gap: 4px; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 12px; align-self: flex-start; }
      .cc-rai-typing span { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: cc-rai-bounce 1.4s infinite; }
      .cc-rai-typing span:nth-child(2) { animation-delay: 0.2s; }
      .cc-rai-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes cc-rai-bounce { 0%,60%,100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
      .cc-rai-input-area { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px; }
      .cc-rai-input { flex: 1; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-family: inherit; outline: none; }
      .cc-rai-input:focus { border-color: rgba(124,58,237,0.5); }
      .cc-rai-send { padding: 10px 16px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; border: none; cursor: pointer; font-size: 14px; }
      .cc-rai-send:hover { transform: scale(1.05); }
    `;
    document.head.appendChild(s);
  }

  var isOpen = false;

  function openPanel() {
    if (document.getElementById('cc-realai-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-realai-overlay';
    overlay.innerHTML =
      '<div id="cc-realai-panel">' +
        '<div class="cc-rai-header">' +
          '<div class="cc-rai-title"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg> Real AI Supply Chain Expert <span class="cc-rai-badge" id="cc-rai-status">Connecting...</span></div>' +
          '<button class="cc-rai-close" onclick="window.__ccRealAI.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-rai-messages" id="cc-rai-messages"><div class="cc-rai-msg bot">\u{1F44B} Hi! I\'m your AI Supply Chain Expert powered by a real LLM. Ask me about risks, suppliers, orders, compliance, or anything supply chain related!</div></div>' +
        '<div class="cc-rai-input-area">' +
          '<input type="text" class="cc-rai-input" id="cc-rai-input" placeholder="Ask about risks, suppliers, compliance..." autocomplete="off">' +
          '<button class="cc-rai-send" onclick="window.__ccRealAI.send()">\u2192</button>' +
        '</div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    isOpen = true;
    chatHistory = [];

    // Check if z-ai SDK is available
    checkAIAvailability();

    // Enter key handler
    var input = document.getElementById('cc-rai-input');
    if (input) {
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') window.__ccRealAI.send(); });
      input.focus();
    }
  }

  function closePanel() { var o = document.getElementById('cc-realai-overlay'); if (o) o.remove(); isOpen = false; }

  var aiAvailable = false;
  function checkAIAvailability() {
    // Try to load the SDK
    if (window.ZAI) { aiAvailable = true; updateStatus('AI Live'); return; }
    // Try dynamic import
    try {
      import('z-ai-web-dev-sdk').then(function(mod) {
        window.ZAI = mod.default || mod;
        aiAvailable = true;
        updateStatus('AI Live');
      }).catch(function() {
        aiAvailable = false;
        updateStatus('Demo Mode');
      });
    } catch(e) {
      aiAvailable = false;
      updateStatus('Demo Mode');
    }
  }

  function updateStatus(text) {
    var badge = document.getElementById('cc-rai-status');
    if (badge) badge.textContent = text;
  }

  function addMessage(role, text) {
    chatHistory.push({ role: role, text: text });
    var container = document.getElementById('cc-rai-messages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'cc-rai-msg ' + role;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById('cc-rai-messages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'cc-rai-typing';
    div.id = 'cc-rai-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() { var t = document.getElementById('cc-rai-typing-indicator'); if (t) t.remove(); }

  async function send() {
    var input = document.getElementById('cc-rai-input');
    if (!input || !input.value.trim()) return;
    var query = input.value.trim();
    input.value = '';
    addMessage('user', query);
    showTyping();

    if (aiAvailable && window.ZAI) {
      try {
        var zai = await window.ZAI.create();
        var messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        for (var i = 0; i < chatHistory.length; i++) {
          messages.push({ role: chatHistory[i].role === 'bot' ? 'assistant' : 'user', content: chatHistory[i].text });
        }
        messages.push({ role: 'user', content: query });
        var response = await zai.chat.completions.create({ messages: messages, model: 'glm-4' });
        hideTyping();
        var answer = response.choices && response.choices[0] ? response.choices[0].message.content : 'I could not generate a response.';
        addMessage('bot', answer);
      } catch(e) {
        hideTyping();
        addMessage('bot', 'I encountered an error connecting to the AI model. Please try again.\n\nError: ' + e.message);
      }
    } else {
      // Fallback: simulated response
      setTimeout(function() {
        hideTyping();
        var fallback = generateFallback(query);
        addMessage('bot', fallback);
      }, 1200);
    }
  }

  function generateFallback(query) {
    var q = query.toLowerCase();
    if (q.includes('risk')) return 'Current risk status: 24 active alerts. Top risks:\n\n1. UFLPA Entity List match (Shanghai Advanced Materials) - 86.1% confidence\n2. Geopolitical escalation (TechComp Asia, South China Sea) - 78.3% confidence\n3. Credit downgrade (EuroManufacturing GmbH, A- to BBB+) - 91.2% confidence\n\nRecommend immediate review of Shanghai Advanced Materials.';
    if (q.includes('supplier')) return 'Top suppliers by spend:\n\n1. TechComp Asia ($18.6M, risk: 62)\n2. EuroManufacturing ($15.2M, risk: 45)\n3. SemiconTech ($12.4M, risk: 25)\n\nConsider diversifying APAC supplier base.';
    if (q.includes('compliance')) return 'Compliance status:\n\n- UFLPA: 72% (needs attention)\n- EUDR: 68% (BrazilAgro deforestation flag)\n- CSDDD: 85% (compliant)\n- Sanctions: 92% (compliant)';
    if (q.includes('order') || q.includes('pipeline')) return 'Orders in pipeline: 156 across 42 countries.\n\n- 4 in transit\n- 3 at risk\n- 12 closing soon\n- Avg fulfillment: 70%\n- AI savings: $2.4M YTD';
    return 'I can help with: risks, suppliers, orders, compliance, spend analysis, currency exposure, AI accuracy, and deadlines. Try asking about any of these topics!\n\n(Demo mode - connect z-ai-web-dev-sdk for full AI responses)';
  }

  window.__ccRealAI = { open: openPanel, close: closePanel, send: send };

  function injectButton() {
    if (document.getElementById('cc-realai-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-realai-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg> Real AI Chat';
    btn.setAttribute('aria-label', 'Open Real AI Supply Chain Expert');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[real-ai-chat] Phase 27 button injected');
  }

  setTimeout(function() {
    injectStyles();
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-realai-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-realai-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 9500);
  }, 100);
})();
