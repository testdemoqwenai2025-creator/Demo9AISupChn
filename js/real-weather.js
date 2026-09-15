// ====================================================================
// real-weather.js — Phase 26: Real Weather Data for Ports
// ====================================================================
// Fetches real weather data from Open-Meteo API (free, no key needed)
// for all 20 major ports. Shows wind, precipitation, visibility.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccWeatherLoaded) return;
  window.__ccWeatherLoaded = true;

  var PORTS = [
    { name: 'Shanghai', lat: 31.23, lng: 121.47 },
    { name: 'Singapore', lat: 1.27, lng: 103.84 },
    { name: 'Rotterdam', lat: 51.95, lng: 4.07 },
    { name: 'Los Angeles', lat: 33.74, lng: -118.27 },
    { name: 'Hamburg', lat: 53.55, lng: 9.93 },
    { name: 'Busan', lat: 35.10, lng: 129.04 },
    { name: 'Shenzhen', lat: 22.50, lng: 113.93 },
    { name: 'Dubai', lat: 25.01, lng: 55.06 },
    { name: 'Mumbai', lat: 18.95, lng: 72.95 },
    { name: 'New York', lat: 40.67, lng: -74.04 },
    { name: 'Houston', lat: 29.71, lng: -95.05 },
    { name: 'Sydney', lat: -33.85, lng: 151.21 },
  ];
  var weatherData = [];

  function injectStyles() {
    if (document.getElementById('cc-weather-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-weather-styles';
    s.textContent = `
      #cc-weather-trigger-btn {
        position: fixed; bottom: 860px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #0284c7, #0ea5e9);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(2,132,199,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-weather-trigger-btn:hover { transform: translateY(-2px); }
      #cc-weather-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-weather-panel {
        background: #0f172a; border: 1px solid rgba(2,132,199,0.2);
        border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-wx-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(2,132,199,0.1), rgba(14,165,233,0.1)); }
      .cc-wx-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-wx-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-wx-body { flex: 1; overflow-y: auto; padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
      .cc-wx-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; text-align: center; }
      .cc-wx-port { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 8px; font-family: -apple-system, sans-serif; }
      .cc-wx-icon { font-size: 28px; margin-bottom: 4px; }
      .cc-wx-temp { font-size: 22px; font-weight: 700; color: #fff; }
      .cc-wx-detail { font-size: 11px; color: #94a3b8; padding: 2px 0; font-family: -apple-system, sans-serif; }
      .cc-wx-alert { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-top: 4px; display: inline-block; }
      .cc-wx-alert-warning { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .cc-wx-alert-danger { background: rgba(239,68,68,0.15); color: #f87171; }
      .cc-wx-loading { text-align: center; padding: 40px; color: #64748b; font-size: 13px; font-family: -apple-system, sans-serif; grid-column: 1 / -1; }
    `;
    document.head.appendChild(s);
  }

  function getWeatherIcon(code, wind) {
    if (code === 0) return wind > 15 ? '\u{1F32C}' : '\u2600'; // clear/windy
    if (code <= 3) return '\u26c5'; // partly cloudy
    if (code <= 48) return '\u{1F32B}'; // fog
    if (code <= 67) return '\u{1F327}'; // rain
    if (code <= 77) return '\u2744'; // snow
    if (code <= 82) return '\u{1F327}'; // rain showers
    if (code <= 86) return '\u2744'; // snow showers
    if (code >= 95) return '\u26c8'; // thunderstorm
    return '\u{1F326}';
  }

  function getAlert(wind, precip, vis) {
    if (wind > 50) return { cls: 'cc-wx-alert-danger', text: 'STORM WARNING' };
    if (wind > 30 || vis < 2) return { cls: 'cc-wx-alert-warning', text: 'DELAY RISK' };
    if (precip > 5) return { cls: 'cc-wx-alert-warning', text: 'HEAVY RAIN' };
    return null;
  }

  function fetchWeather(callback) {
    weatherData = [];
    var pending = PORTS.length;
    PORTS.forEach(function(port) {
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + port.lat + '&longitude=' + port.lng + '&current=temperature_2m,wind_speed_10m,precipitation,visibility,weather_code&timezone=auto';
      fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var c = d.current || {};
          var alert = getAlert(c.wind_speed_10m || 0, c.precipitation || 0, (c.visibility || 9999)/1000);
          weatherData.push({
            port: port.name, lat: port.lat, lng: port.lng,
            temp: Math.round(c.temperature_2m || 0), wind: Math.round(c.wind_speed_10m || 0),
            precip: (c.precipitation || 0).toFixed(1), vis: ((c.visibility || 9999)/1000).toFixed(1),
            code: c.weather_code || 0, alert: alert,
            icon: getWeatherIcon(c.weather_code || 0, c.wind_speed_10m || 0)
          });
        })
        .catch(function(e) { console.warn('[weather] Failed: ' + port.name); })
        .finally(function() { if (--pending === 0) callback(); });
    });
  }

  function openPanel() {
    if (document.getElementById('cc-weather-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'cc-weather-overlay';
    overlay.innerHTML =
      '<div id="cc-weather-panel">' +
        '<div class="cc-wx-header">' +
          '<div class="cc-wx-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 14.9"/></svg>Port Weather Monitor \u2014 Live Data</div>' +
          '<button class="cc-wx-close" onclick="window.__ccWeather.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-wx-body" id="cc-weather-content"><div class="cc-wx-loading">Fetching live weather for 12 major ports...</div></div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
    fetchWeather(function() { renderContent(); });
  }

  function closePanel() { var o = document.getElementById('cc-weather-overlay'); if (o) o.remove(); }

  function renderContent() {
    var c = document.getElementById('cc-weather-content');
    if (!c) return;
    if (weatherData.length === 0) { c.innerHTML = '<div class="cc-wx-loading">Could not fetch weather data.</div>'; return; }
    var html = '';
    weatherData.sort(function(a,b) { return (b.alert?1:0) - (a.alert?1:0); });
    for (var i = 0; i < weatherData.length; i++) {
      var w = weatherData[i];
      html += '<div class="cc-wx-card">' +
        '<div class="cc-wx-port">' + w.port + '</div>' +
        '<div class="cc-wx-icon">' + w.icon + '</div>' +
        '<div class="cc-wx-temp">' + w.temp + '\u00b0C</div>' +
        '<div class="cc-wx-detail">Wind: ' + w.wind + ' km/h</div>' +
        '<div class="cc-wx-detail">Rain: ' + w.precip + ' mm</div>' +
        '<div class="cc-wx-detail">Visibility: ' + w.vis + ' km</div>' +
        (w.alert ? '<div class="cc-wx-alert ' + w.alert.cls + '">' + w.alert.text + '</div>' : '') +
      '</div>';
    }
    c.innerHTML = html;
    console.log('[weather] Rendered ' + weatherData.length + ' ports');
  }

  window.__ccWeather = { open: openPanel, close: closePanel };

  function injectButton() {
    if (document.getElementById('cc-weather-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-weather-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 14.9"/></svg> Port Weather';
    btn.setAttribute('aria-label', 'Open port weather monitor');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[real-weather] Phase 26 button injected');
  }

  setTimeout(function() {
    injectStyles();
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-weather-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-weather-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 8500);
  }, 100);
})();
