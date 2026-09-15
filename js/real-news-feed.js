// ====================================================================
// real-news-feed.js — Phase 25: Real News API (RSS Feeds)
// ====================================================================
// Connects to real RSS news feeds via CORS proxy.
// Fetches supply chain, shipping, and logistics news.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccNewsLoaded) return;
  window.__ccNewsLoaded = true;

  var CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  var FEEDS = [
    { name: 'Supply Chain Dive', url: 'https://www.supplychaindive.com/feeds/news/', category: 'Supply Chain' },
    { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews', category: 'Business' },
    { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
    { name: 'Transport Topics', url: 'https://ttnews.com/feed/', category: 'Transport' },
  ];
  var articles = [];
  var loaded = false;

  function injectStyles() {
    if (document.getElementById('cc-news-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-news-styles';
    s.textContent = `
      #cc-news-trigger-btn {
        position: fixed; bottom: 800px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #dc2626, #ea580c);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(220,38,38,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-news-trigger-btn:hover { transform: translateY(-2px); }
      #cc-news-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-news-panel {
        background: #0f172a; border: 1px solid rgba(220,38,38,0.2);
        border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-news-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(220,38,38,0.1), rgba(234,88,12,0.1)); }
      .cc-news-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-news-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-news-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-news-body { flex: 1; overflow-y: auto; padding: 16px; }
      .cc-news-article { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-bottom: 10px; transition: all 0.2s; }
      .cc-news-article:hover { border-color: rgba(220,38,38,0.2); transform: translateY(-1px); }
      .cc-news-article-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .cc-news-source { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: rgba(220,38,38,0.15); color: #f87171; }
      .cc-news-cat { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.05); color: #94a3b8; }
      .cc-news-article-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: -apple-system, sans-serif; line-height: 1.4; }
      .cc-news-article-title a { color: #fff; text-decoration: none; }
      .cc-news-article-title a:hover { color: #f87171; }
      .cc-news-article-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 6px; }
      .cc-news-article-meta { font-size: 10px; color: #64748b; }
      .cc-news-loading { text-align: center; padding: 40px; color: #64748b; font-size: 13px; font-family: -apple-system, sans-serif; }
      .cc-news-error { text-align: center; padding: 20px; color: #f87171; font-size: 12px; font-family: -apple-system, sans-serif; }
    `;
    document.head.appendChild(s);
  }

  function parseRSS(xmlText, feedName, category) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'text/xml');
    var items = doc.querySelectorAll('item');
    var results = [];
    items.forEach(function(item, idx) {
      if (idx >= 5) return; // Max 5 per feed
      var title = item.querySelector('title') ? item.querySelector('title').textContent : 'Untitled';
      var link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
      var desc = item.querySelector('description') ? item.querySelector('description').textContent.replace(/<[^>]+>/g, '').substring(0, 200) : '';
      var pubDate = item.querySelector('pubDate') ? item.querySelector('pubDate').textContent : '';
      results.push({ title: title, link: link, desc: desc, source: feedName, category: category, date: pubDate });
    });
    return results;
  }

  function loadFeeds(callback) {
    if (loaded) { callback(); return; }
    articles = [];
    var pending = FEEDS.length;
    FEEDS.forEach(function(feed) {
      fetch(CORS_PROXY + encodeURIComponent(feed.url))
        .then(function(r) { return r.text(); })
        .then(function(xml) {
          var parsed = parseRSS(xml, feed.name, feed.category);
          articles = articles.concat(parsed);
        })
        .catch(function(e) { console.warn('[news] Failed to load: ' + feed.name); })
        .finally(function() { if (--pending === 0) { articles.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); }); loaded = true; callback(); } });
    });
  }

  function openPanel() {
    if (document.getElementById('cc-news-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-news-overlay';
    overlay.innerHTML =
      '<div id="cc-news-panel">' +
        '<div class="cc-news-header">' +
          '<div class="cc-news-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg> Live Supply Chain News</div>' +
          '<button class="cc-news-close" onclick="window.__ccNews.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-news-body" id="cc-news-content"><div class="cc-news-loading">Fetching live news from Reuters, BBC, Supply Chain Dive...</div></div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    loadFeeds(function() { renderContent(); });
  }

  function closePanel() {
    var o = document.getElementById('cc-news-overlay');
    if (o) o.remove();
  }

  function renderContent() {
    var c = document.getElementById('cc-news-content');
    if (!c) return;
    if (articles.length === 0) {
      c.innerHTML = '<div class="cc-news-error">Could not fetch news feeds. CORS proxy may be unavailable.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < articles.length; i++) {
      var a = articles[i];
      var dateStr = a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      html += '<div class="cc-news-article">' +
        '<div class="cc-news-article-header">' +
          '<span class="cc-news-source">' + a.source + '</span>' +
          '<span class="cc-news-cat">' + a.category + '</span>' +
        '</div>' +
        '<div class="cc-news-article-title"><a href="' + a.link + '" target="_blank" rel="noopener">' + a.title + '</a></div>' +
        '<div class="cc-news-article-desc">' + a.desc + '</div>' +
        '<div class="cc-news-article-meta">\u23f0 ' + dateStr + '</div>' +
      '</div>';
    }
    c.innerHTML = html;
    console.log('[news] Rendered ' + articles.length + ' articles');
  }

  window.__ccNews = { open: openPanel, close: closePanel, refresh: function(){ loaded=false; loadFeeds(function(){renderContent();}); } };

  function injectButton() {
    if (document.getElementById('cc-news-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-news-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/></svg> Live News';
    btn.setAttribute('aria-label', 'Open live supply chain news feed');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[real-news-feed] Phase 25 button injected');
  }

  setTimeout(function() {
    injectStyles();
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-news-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-news-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 8000);
  }, 100);
})();
