// cc-enhancements.js — AI Supply Chain Expert Chat
// Floating button + chat panel for AI-powered supply chain Q&A
// Pattern matches order-management.js, tender-management.js, platform-analytics.js
(function() {
  'use strict';
  if (window.__ccEnhancementsLoaded) return;
  window.__ccEnhancementsLoaded = true;

  // ====================================================================
  // AI EXPERT KNOWLEDGE BASE — supply chain domain Q&A
  // ====================================================================
  const EXPERT_TOPICS = [
    {
      keywords: ['risk', 'alert', 'threat', 'danger', 'supplier risk'],
      question: 'What are the current supply chain risks?',
      answer: 'Currently monitoring 24 active risk alerts. Key threats:\n\n🔴 CRITICAL: UFLPA Entity List match — Shanghai Advanced Materials flagged for potential forced labor connection (86.1% confidence, XGBoost Ensemble v3.2).\n\n🟡 WARNING: TechComp Asia — Geopolitical risk escalation in South China Sea shipping route (78.3% confidence).\n\n🟡 WARNING: EuroManufacturing GmbH — Credit score downgraded from A- to BBB+ (91.2% confidence, Financial Health LSTM v1.8).\n\nRecommend immediate review of Shanghai Advanced Materials before any shipments.',
    },
    {
      keywords: ['supplier', 'vendor', 'top supplier', 'spend'],
      question: 'Who are the top suppliers by spend?',
      answer: 'Top 5 suppliers by spend:\n\n1. TechComp Asia Pte Ltd (Singapore) — $18.6M, Risk: 62, 15 orders\n2. EuroManufacturing GmbH (Germany) — $15.2M, Risk: 45, 8 orders\n3. SemiconTech Inc. (USA) — $12.4M, Risk: 25, 12 orders\n4. PrecisionParts Ltd. (USA) — $8.9M, Risk: 22, 9 orders\n5. IndiaChem Industries (India) — $5.6M, Risk: 52, 7 orders\n\n⚠️ TechComp Asia has elevated risk (62/100) due to South China Sea route tensions.',
    },
    {
      keywords: ['order', 'purchase', 'po', 'pipeline'],
      question: 'What\'s the status of orders in pipeline?',
      answer: '156 orders in pipeline across 42 countries:\n\n📊 Status breakdown:\n• 4 orders in transit\n• 3 orders at risk (need attention)\n• 12 closing soon\n• 70% average fulfillment rate\n• 4.2 days average delivery time\n\n💰 Cost savings from AI optimization: $2.4M YTD\n\n⚡ 3 pending orders need attention ($148K total value).',
    },
    {
      keywords: ['tender', 'bid', 'opportunity', 'rfq'],
      question: 'What are the active tenders?',
      answer: '43 active tenders, $2.1B total value:\n\n🔥 Hot opportunities:\n• APAC Healthcare Cold Chain — ADB, $26.5M (3 days left)\n• DOD Semiconductor Program — U.S. DOD, $82.5M (14 days left)\n• EU Green Deal Initiative — European Commission, €52.5M (45 days left)\n\n12% increase from last quarter.',
    },
    {
      keywords: ['compliance', 'uflpa', 'eudr', 'csddd', 'gdpr', 'regulatory'],
      question: 'What\'s the compliance status?',
      answer: 'Compliance Snapshot (91.8% overall):\n\n✅ Sanctions: 92% compliant\n✅ CSDDD: 85% compliant\n⚠️ UFLPA: 72% — needs attention (Shanghai Advanced Materials flagged)\n⚠️ EUDR: 68% — BrazilAgro deforestation risk detected\n\nLast scan: 2 hours ago. 2 frameworks need attention.',
    },
    {
      keywords: ['spend', 'cost', 'budget', 'money', 'finance'],
      question: 'What\'s the spend analysis?',
      answer: 'Global Spend YTD: $47.8M (+$5.1M vs last year)\n\n🌍 Regional distribution:\n• Asia Pacific: $18.6M (342 suppliers, elevated risk)\n• Europe: $15.2M (256 suppliers, stable)\n• North America: $12.4M (189 suppliers, optimal)\n• Latin America: $1.2M (42 suppliers, monitor)\n• MENA: $0.4M (18 suppliers, high risk)\n\n💡 AI identified $39,400 savings across 12 orders via supplier switching.',
    },
    {
      keywords: ['currency', 'fx', 'exchange', 'hedg'],
      question: 'What\'s the currency exposure?',
      answer: 'Currency Exposure:\n\n💵 USD: 42%\n💶 EUR: 28%\n🇸🇬 SGD: 18%\n🇮🇳 INR: 7%\n🌍 Other: 5%\n\n⚠️ FX Risk (VaR 95%): $1.2M\n✅ Hedged Exposure: 68%\n\nRecommend increasing EUR hedge ratio given EuroManufacturing credit concerns.',
    },
    {
      keywords: ['ai', 'model', 'accuracy', 'prediction', 'machine learning'],
      question: 'How accurate is the AI?',
      answer: 'AI Prediction Accuracy: 96.4% (SHAP-explainable models)\n\n🧠 Active models:\n• XGBoost Ensemble v3.2 — UFLPA risk detection (86.1% confidence)\n• Geopolitical Risk CNN v2.1 — South China Sea analysis (78.3% confidence)\n• Financial Health LSTM v1.8 — Credit scoring (91.2% confidence)\n• Satellite Analysis CNN v3.0 — EUDR deforestation (96.4% confidence)\n• Cyber Threat Detector v2.4 — Portal security (84.7% confidence)\n\nAll predictions include SHAP values for full transparency.',
    },
    {
      keywords: ['deadline', 'due', 'urgent', 'expiring'],
      question: 'What deadlines are coming up?',
      answer: 'Upcoming Deadlines (2 urgent):\n\n🔴 APAC Healthcare Cold Chain — ADB, $26.5M — 3 days left\n🟡 DOD Semiconductor Program — U.S. DOD, $82.5M — 14 days left\n• PO-2026-0845 Delivery — PrecisionParts, $185K — 7 days left\n• PO-2026-0847 Delivery — SemiconTech, $212.5K — 17 days left\n• EU Green Deal Initiative — European Commission, €52.5M — 45 days left\n\n⚠️ 3 operational incidents being resolved.',
    },
    {
      keywords: ['help', 'what can you', 'options', 'menu'],
      question: 'What can you help with?',
      answer: 'I\'m your AI Supply Chain Expert. I can answer questions about:\n\n📊 Risks & Alerts — current threats, risk breakdown\n🏢 Suppliers — top suppliers, risk scores, spend\n📦 Orders — pipeline status, fulfillment\n📋 Tenders — active opportunities, deadlines\n✅ Compliance — UFLPA, EUDR, CSDDD status\n💰 Spend — analysis, savings, currency exposure\n🧠 AI Models — accuracy, confidence, explainability\n⏰ Deadlines — urgent items, upcoming due dates\n\nAsk me anything about your supply chain!',
    },
  ];

  // ====================================================================
  // FUZZY MATCHING — find best topic for user query
  // ====================================================================
  function findBestTopic(query) {
    if (!query || !query.trim()) return null;
    const q = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const topic of EXPERT_TOPICS) {
      let score = 0;
      for (const kw of topic.keywords) {
        if (q.includes(kw)) score += kw.length * 2;
      }
      // Also match words from the question
      const words = topic.question.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && q.includes(word)) score += word.length;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = topic;
      }
    }
    return bestScore > 0 ? bestMatch : null;
  }

  // ====================================================================
  // CHAT STATE
  // ====================================================================
  let chatHistory = [];
  let isOpen = false;

  // ====================================================================
  // STYLES
  // ====================================================================
  function injectStyles() {
    if (document.getElementById('cc-ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-ai-styles';
    style.textContent = `
      /* Floating Button */
      #cc-ai-trigger-btn {
        position: fixed; bottom: 260px; right: 150px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      #cc-ai-trigger-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5);
      }
      #cc-ai-trigger-btn .badge {
        position: absolute; top: -6px; right: -6px;
        background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
        min-width: 18px; height: 18px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #0a0e1a; padding: 0 4px;
      }

      /* Chat Panel */
      #cc-ai-panel-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(4px);
      }
      #cc-ai-panel {
        background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px; width: 100%; max-width: 480px; height: 70vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      #cc-ai-panel .cc-ai-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: space-between;
        background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1));
      }
      #cc-ai-panel .cc-ai-header .cc-ai-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 15px; font-weight: 700; color: #fff;
      }
      #cc-ai-panel .cc-ai-header .cc-ai-status {
        font-size: 11px; color: #34d399; display: flex; align-items: center; gap: 4px;
      }
      #cc-ai-panel .cc-ai-header .cc-ai-status::before {
        content: ''; width: 8px; height: 8px; border-radius: 50%;
        background: #34d399; animation: pulse 2s infinite;
      }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      #cc-ai-panel .cc-ai-close {
        background: none; border: none; color: #94a3b8; font-size: 24px;
        cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.2s;
      }
      #cc-ai-panel .cc-ai-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

      #cc-ai-panel .cc-ai-messages {
        flex: 1; overflow-y: auto; padding: 16px; display: flex;
        flex-direction: column; gap: 12px;
      }
      #cc-ai-panel .cc-ai-msg {
        max-width: 85%; padding: 10px 14px; border-radius: 12px;
        font-size: 13px; line-height: 1.5; white-space: pre-wrap;
      }
      #cc-ai-panel .cc-ai-msg.user {
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: #fff; align-self: flex-end; border-bottom-right-radius: 4px;
      }
      #cc-ai-panel .cc-ai-msg.bot {
        background: rgba(255,255,255,0.05); color: #e2e8f0;
        border: 1px solid rgba(255,255,255,0.08); align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      #cc-ai-panel .cc-ai-msg.bot .cc-ai-topic {
        font-size: 10px; color: #f59e0b; text-transform: uppercase;
        letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 700;
      }

      #cc-ai-panel .cc-ai-quick {
        padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; gap: 6px; flex-wrap: wrap;
      }
      #cc-ai-panel .cc-ai-quick-btn {
        padding: 4px 10px; font-size: 11px; border-radius: 9999px;
        background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
        color: #f59e0b; cursor: pointer; transition: all 0.2s; white-space: nowrap;
      }
      #cc-ai-panel .cc-ai-quick-btn:hover {
        background: rgba(245,158,11,0.2); transform: translateY(-1px);
      }

      #cc-ai-panel .cc-ai-input-area {
        padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08);
        display: flex; gap: 8px;
      }
      #cc-ai-panel .cc-ai-input {
        flex: 1; padding: 10px 14px; border-radius: 10px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        color: #fff; font-size: 13px; font-family: inherit; outline: none;
        transition: all 0.2s;
      }
      #cc-ai-panel .cc-ai-input:focus {
        border-color: rgba(245,158,11,0.5);
        box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
      }
      #cc-ai-panel .cc-ai-send {
        padding: 10px 16px; border-radius: 10px;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: #fff; border: none; cursor: pointer; font-size: 14px;
        transition: all 0.2s; display: flex; align-items: center; gap: 4px;
      }
      #cc-ai-panel .cc-ai-send:hover { transform: scale(1.05); }

      #cc-ai-panel .cc-ai-typing {
        display: flex; gap: 4px; padding: 10px 14px;
        background: rgba(255,255,255,0.05); border-radius: 12px;
        align-self: flex-start; border: 1px solid rgba(255,255,255,0.08);
      }
      #cc-ai-panel .cc-ai-typing span {
        width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
        animation: typing 1.4s infinite;
      }
      #cc-ai-panel .cc-ai-typing span:nth-child(2) { animation-delay: 0.2s; }
      #cc-ai-panel .cc-ai-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing {
        0%,60%,100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-4px); }
      }

      /* Scrollbar */
      #cc-ai-panel .cc-ai-messages::-webkit-scrollbar { width: 6px; }
      #cc-ai-panel .cc-ai-messages::-webkit-scrollbar-track { background: transparent; }
      #cc-ai-panel .cc-ai-messages::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1); border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  // ====================================================================
  // INJECT FLOATING BUTTON
  // ====================================================================
  function injectButton() {
    if (document.getElementById('cc-ai-trigger-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'cc-ai-trigger-btn';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>
        <path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>
      </svg>
      AI Expert
      <span class="badge">10</span>
    `;
    btn.setAttribute('aria-label', 'Open AI Supply Chain Expert chat');
    btn.style.position = 'relative'; // for badge positioning
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[cc-enhancements] AI Expert chat button injected');
  }

  // ====================================================================
  // CHAT PANEL
  // ====================================================================
  function openPanel() {
    if (document.getElementById('cc-ai-panel-overlay')) return;
    injectStyles();

    const overlay = document.createElement('div');
    overlay.id = 'cc-ai-panel-overlay';
    overlay.innerHTML = `
      <div id="cc-ai-panel">
        <div class="cc-ai-header">
          <div class="cc-ai-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>
            </svg>
            AI Supply Chain Expert
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="cc-ai-status">Online</span>
            <button class="cc-ai-close" onclick="window.__ccAI.closePanel()" aria-label="Close">&times;</button>
          </div>
        </div>
        <div class="cc-ai-messages" id="cc-ai-messages">
          <div class="cc-ai-msg bot">
            <div class="cc-ai-topic">Welcome</div>
            👋 Hi! I'm your AI Supply Chain Expert. I can answer questions about risks, suppliers, orders, tenders, compliance, spend, and more.

            Try asking: "What are the current risks?" or "Who are the top suppliers?"
          </div>
        </div>
        <div class="cc-ai-quick" id="cc-ai-quick">
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('What are the current supply chain risks?')">📊 Risks</button>
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('Who are the top suppliers by spend?')">🏢 Suppliers</button>
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('What is the compliance status?')">✅ Compliance</button>
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('What are the active tenders?')">📋 Tenders</button>
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('What deadlines are coming up?')">⏰ Deadlines</button>
          <button class="cc-ai-quick-btn" onclick="window.__ccAI.ask('How accurate is the AI?')">🧠 AI Models</button>
        </div>
        <div class="cc-ai-input-area">
          <input type="text" class="cc-ai-input" id="cc-ai-input" placeholder="Ask about risks, suppliers, orders, compliance..." autocomplete="off">
          <button class="cc-ai-send" onclick="window.__ccAI.sendInput()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    isOpen = true;

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('cc-ai-input');
      if (input) input.focus();
      // Enter key handler
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); window.__ccAI.sendInput(); }
      });
    }, 100);

    // Render chat history
    renderHistory();
  }

  function closePanel() {
    const overlay = document.getElementById('cc-ai-panel-overlay');
    if (overlay) overlay.remove();
    isOpen = false;
  }

  function addMessage(role, text, topic) {
    chatHistory.push({ role, text, topic });
    if (isOpen) renderHistory();
  }

  function renderHistory() {
    const container = document.getElementById('cc-ai-messages');
    if (!container) return;
    container.innerHTML = '';
    for (const msg of chatHistory) {
      const div = document.createElement('div');
      div.className = 'cc-ai-msg ' + msg.role;
      if (msg.role === 'bot' && msg.topic) {
        div.innerHTML = '<div class="cc-ai-topic">' + msg.topic + '</div>' + msg.text;
      } else {
        div.textContent = msg.text;
      }
      container.appendChild(div);
    }
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('cc-ai-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'cc-ai-typing';
    div.id = 'cc-ai-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const indicator = document.getElementById('cc-ai-typing-indicator');
    if (indicator) indicator.remove();
  }

  function ask(query) {
    if (!query || !query.trim()) return;
    addMessage('user', query);

    // Clear input
    const input = document.getElementById('cc-ai-input');
    if (input) input.value = '';

    // Show typing
    showTyping();

    // Simulate AI thinking (500ms)
    setTimeout(() => {
      hideTyping();
      const match = findBestTopic(query);
      if (match) {
        addMessage('bot', match.answer, match.question);
      } else {
        addMessage('bot',
          'I don\'t have a specific answer for that, but I can help with:\n\n• Supply chain risks & alerts\n• Top suppliers & spend\n• Orders & pipeline status\n• Active tenders\n• Compliance (UFLPA, EUDR, CSDDD)\n• Currency exposure\n• AI model accuracy\n• Upcoming deadlines\n\nTry asking about any of these topics!',
          'Contact Support'
        );
      }
    }, 500);
  }

  function sendInput() {
    const input = document.getElementById('cc-ai-input');
    if (input) ask(input.value);
  }

  // ====================================================================
  // INIT
  // ====================================================================
  function init() {
    window.__ccAI = {
      openPanel,
      closePanel,
      ask,
      sendInput,
    };

    // Keyboard shortcut: press "E" to open AI Expert
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-ai-panel-overlay')) {
          openPanel();
          e.preventDefault();
        }
      }
      if (e.key === 'Escape') closePanel();
    });

    // Inject button after delay (matches other enhancement scripts)
    let attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-ai-trigger-btn')) return;
      if (attempts > 30) return;
      injectStyles();
      injectButton();
      if (!document.getElementById('cc-ai-trigger-btn')) setTimeout(tryInject, 500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(tryInject, 3000); });
    } else {
      setTimeout(tryInject, 3000);
    }
  }

  init();
})();
