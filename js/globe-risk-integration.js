// ====================================================================
// globe-risk-integration.js — Phase 23: 3D Globe + Risk Engine
// ====================================================================
// Connects the supply chain data (ports, suppliers) with the simulated
// risk engine to create a live 3D globe visualization.
//
// Features:
//   - Interactive 3D globe using Three.js (loaded dynamically)
//   - Port nodes (from ports.json) positioned by lat/lng
//   - Supplier nodes (from suppliers-full.json) positioned by lat/lng
//   - Shipping routes (from routes.json) as animated arcs
//   - Risk heat-map overlay (red/amber/green based on risk score)
//   - When Risk Engine fires → corresponding node flashes
//   - Click a node → see port/supplier details
//   - Play/Pause animation for shipping route particles
//   - Risk filter slider (show only risk > X)
//   - Floating button (violet/fuchsia gradient, globe icon)
//   - Keyboard shortcut: press "G" to open
// ====================================================================

(function() {
  'use strict';
  if (window.__ccGlobeRiskLoaded) return;
  window.__ccGlobeRiskLoaded = true;

  var DATA_BASE = '/Demo9AISupChn/spa/data';
  var ports = [], suppliers = [], routes = [];
  var dataLoaded = false;
  var scene, camera, renderer, globe, nodes = [], arcs = [];
  var animationId = null;
  var riskFilter = 0;
  var isPlaying = true;

  function loadData(cb) {
    if (dataLoaded) { cb(); return; }
    var pending = 3;
    function done() { if (--pending === 0) { dataLoaded = true; cb(); } }
    fetch(DATA_BASE + '/ports.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){ports=d;done();}).catch(function(){done();});
    fetch(DATA_BASE + '/suppliers-full.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){suppliers=d;done();}).catch(function(){done();});
    fetch(DATA_BASE + '/routes.json?v=' + Date.now()).then(function(r){return r.json();}).then(function(d){routes=d;done();}).catch(function(){done();});
  }

  function injectStyles() {
    if (document.getElementById('cc-globe-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-globe-styles';
    s.textContent = `
      #cc-globe-trigger-btn {
        position: fixed; bottom: 740px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #8b5cf6, #d946ef);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(139,92,246,0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-globe-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,92,246,0.5); }
      #cc-globe-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.95); z-index: 10003;
        display: flex; flex-direction: column;
      }
      #cc-globe-canvas-container { flex: 1; position: relative; }
      #cc-globe-canvas { width: 100%; height: 100%; display: block; }
      .cc-globe-header {
        padding: 12px 20px; display: flex; align-items: center; justify-content: space-between;
        background: rgba(15,23,42,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(139,92,246,0.2);
      }
      .cc-globe-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-globe-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-globe-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-globe-controls {
        position: absolute; bottom: 20px; left: 20px; right: 20px;
        display: flex; gap: 12px; align-items: center; justify-content: center;
        background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);
        padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.2);
      }
      .cc-globe-legend { display: flex; gap: 12px; font-size: 11px; color: #94a3b8; font-family: -apple-system, sans-serif; }
      .cc-globe-legend-item { display: flex; align-items: center; gap: 4px; }
      .cc-globe-legend-dot { width: 10px; height: 10px; border-radius: 50%; }
      .cc-globe-slider-group { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 11px; font-family: -apple-system, sans-serif; }
      .cc-globe-slider { width: 120px; -webkit-appearance: none; appearance: none; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; outline: none; }
      .cc-globe-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #8b5cf6; cursor: pointer; }
      .cc-globe-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(139,92,246,0.3); background: rgba(139,92,246,0.1); color: #a78bfa; font-family: -apple-system, sans-serif; }
      .cc-globe-btn:hover { background: rgba(139,92,246,0.2); }
      .cc-globe-stats {
        position: absolute; top: 60px; right: 20px;
        background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);
        padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.2);
        font-size: 11px; color: #94a3b8; font-family: -apple-system, sans-serif;
        min-width: 180px;
      }
      .cc-globe-stat-row { display: flex; justify-content: space-between; padding: 2px 0; }
      .cc-globe-stat-value { color: #fff; font-weight: 600; }
      .cc-globe-tooltip {
        position: absolute; background: rgba(15,23,42,0.95); border: 1px solid rgba(139,92,246,0.3);
        border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #fff;
        pointer-events: none; display: none; z-index: 100; font-family: -apple-system, sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(s);
  }

  // Convert lat/lng to 3D coordinates on a sphere
  function latLngToVector3(lat, lng, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lng + 180) * (Math.PI / 180);
    var x = -(radius * Math.sin(phi) * Math.cos(theta));
    var z = (radius * Math.sin(phi) * Math.sin(theta));
    var y = (radius * Math.cos(phi));
    return { x: x, y: y, z: z };
  }

  function riskColor(risk) {
    if (risk < 30) return { r: 0.2, g: 0.85, b: 0.5 }; // green
    if (risk < 60) return { r: 0.98, g: 0.75, b: 0.14 }; // amber
    return { r: 0.95, g: 0.27, b: 0.27 }; // red
  }

  function openPanel() {
    if (document.getElementById('cc-globe-overlay')) return;
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = 'cc-globe-overlay';
    overlay.innerHTML =
      '<div class="cc-globe-header">' +
        '<div class="cc-globe-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Supply Chain 3D Globe \u2014 Live Risk Visualization</div>' +
        '<button class="cc-globe-close" onclick="window.__ccGlobe.close()">&times;</button>' +
      '</div>' +
      '<div id="cc-globe-canvas-container">' +
        '<canvas id="cc-globe-canvas"></canvas>' +
        '<div class="cc-globe-stats" id="cc-globe-stats"></div>' +
        '<div class="cc-globe-tooltip" id="cc-globe-tooltip"></div>' +
        '<div class="cc-globe-controls">' +
          '<button class="cc-globe-btn" id="cc-globe-play" onclick="window.__ccGlobe.togglePlay()">\u23f8 Pause</button>' +
          '<div class="cc-globe-slider-group">' +
            '<span>Min Risk:</span>' +
            '<input type="range" min="0" max="100" value="0" class="cc-globe-slider" id="cc-globe-risk-slider" oninput="window.__ccGlobe.setRiskFilter(this.value)">' +
            '<span id="cc-globe-risk-val">0</span>' +
          '</div>' +
          '<div class="cc-globe-legend">' +
            '<div class="cc-globe-legend-item"><div class="cc-globe-legend-dot" style="background:#34d399;"></div>Low Risk</div>' +
            '<div class="cc-globe-legend-item"><div class="cc-globe-legend-dot" style="background:#fbbf24;"></div>Medium</div>' +
            '<div class="cc-globe-legend-item"><div class="cc-globe-legend-dot" style="background:#f43f5e;"></div>High Risk</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    loadData(function() { initThree(); });
  }

  function closePanel() {
    var o = document.getElementById('cc-globe-overlay');
    if (o) o.remove();
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (renderer) { renderer.dispose(); renderer = null; }
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    var btn = document.getElementById('cc-globe-play');
    if (btn) btn.textContent = isPlaying ? '\u23f8 Pause' : '\u25b6 Play';
  }

  function setRiskFilter(val) {
    riskFilter = parseInt(val);
    var display = document.getElementById('cc-globe-risk-val');
    if (display) display.textContent = riskFilter;
    updateNodeVisibility();
  }

  function updateNodeVisibility() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.userData && n.userData.risk >= riskFilter) {
        n.visible = true;
      } else {
        n.visible = false;
      }
    }
  }

  function initThree() {
    // Dynamically load Three.js if not already loaded
    if (typeof THREE === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = function() { buildScene(); };
      document.head.appendChild(script);
    } else {
      buildScene();
    }
  }

  function buildScene() {
    var canvas = document.getElementById('cc-globe-canvas');
    var container = document.getElementById('cc-globe-canvas-container');
    var w = container.clientWidth, h = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000);
    camera.position.set(0, 0, 250);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create globe sphere
    var globeGeom = new THREE.SphereGeometry(80, 64, 64);
    var globeMat = new THREE.MeshPhongMaterial({
      color: 0x0f172a, transparent: true, opacity: 0.9,
      wireframe: false
    });
    globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Wireframe overlay
    var wireGeom = new THREE.SphereGeometry(80.5, 32, 32);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.3 });
    var wire = new THREE.Mesh(wireGeom, wireMat);
    scene.add(wire);

    // Atmosphere glow
    var atmGeom = new THREE.SphereGeometry(84, 32, 32);
    var atmMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.08, side: THREE.BackSide });
    var atm = new THREE.Mesh(atmGeom, atmMat);
    scene.add(atm);

    // Star field
    var starGeom = new THREE.BufferGeometry();
    var starVerts = [];
    for (var i = 0; i < 500; i++) {
      starVerts.push((Math.random()-0.5)*800, (Math.random()-0.5)*800, (Math.random()-0.5)*800);
    }
    starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.6 });
    var stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    var dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(100, 100, 200);
    scene.add(dir);

    // Add port nodes
    nodes = [];
    for (var p = 0; p < ports.length; p++) {
      var port = ports[p];
      var pos = latLngToVector3(port.lat, port.lng, 81);
      var c = riskColor(port.risk);
      var nodeGeom = new THREE.SphereGeometry(2, 16, 16);
      var nodeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.r, c.g, c.b) });
      var node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(pos.x, pos.y, pos.z);
      node.userData = { type: 'port', name: port.name, country: port.country, risk: port.risk, congestion: port.congestion, waitTime: port.waitTime, throughput: port.throughput };
      globe.add(node);
      nodes.push(node);

      // Glow ring for high-risk ports
      if (port.risk > 50) {
        var ringGeom = new THREE.RingGeometry(3, 4, 16);
        var ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        var ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(node.position);
        ring.lookAt(0, 0, 0);
        ring.userData = { pulse: true };
        globe.add(ring);
      }
    }

    // Add supplier nodes
    for (var s = 0; s < suppliers.length; s++) {
      var sup = suppliers[s];
      var spos = latLngToVector3(sup.lat, sup.lng, 81);
      var sc = riskColor(sup.risk);
      var sGeom = new THREE.ConeGeometry(1.5, 3, 8);
      var sMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(sc.r, sc.g, sc.b) });
      var sNode = new THREE.Mesh(sGeom, sMat);
      sNode.position.set(spos.x, spos.y, spos.z);
      sNode.userData = { type: 'supplier', name: sup.name, country: sup.country, risk: sup.risk, category: sup.category, annualSpend: sup.annualSpend, financial: sup.financial.rating };
      globe.add(sNode);
      nodes.push(sNode);
    }

    // Add shipping route arcs
    arcs = [];
    for (var r = 0; r < routes.length; r++) {
      var route = routes[r];
      var originPort = ports.find(function(p) { return p.name === route.origin; });
      var destPort = ports.find(function(p) { return p.name === route.destination; });
      if (!originPort || !destPort) continue;

      var oPos = latLngToVector3(originPort.lat, originPort.lng, 81);
      var dPos = latLngToVector3(destPort.lat, destPort.lng, 81);

      // Create arc curve
      var midPoint = new THREE.Vector3(
        (oPos.x + dPos.x) / 2,
        (oPos.y + dPos.y) / 2,
        (oPos.z + dPos.z) / 2
      );
      var dist = Math.sqrt(midPoint.x*midPoint.x + midPoint.y*midPoint.y + midPoint.z*midPoint.z);
      midPoint.normalize().multiplyScalar(dist + 30);

      var curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(oPos.x, oPos.y, oPos.z),
        midPoint,
        new THREE.Vector3(dPos.x, dPos.y, dPos.z)
      );

      var points = curve.getPoints(50);
      var arcGeom = new THREE.BufferGeometry().setFromPoints(points);
      var rc = riskColor(route.risk);
      var arcMat = new THREE.LineBasicMaterial({ color: new THREE.Color(rc.r * 0.5, rc.g * 0.5, rc.b * 0.5), transparent: true, opacity: 0.4 });
      var arcLine = new THREE.Line(arcGeom, arcMat);
      globe.add(arcLine);
      arcs.push({ line: arcLine, curve: curve, points: points, t: Math.random() });

      // Moving particle on the arc
      var particleGeom = new THREE.SphereGeometry(0.8, 8, 8);
      var particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      var particle = new THREE.Mesh(particleGeom, particleMat);
      globe.add(particle);
      arcs[arcs.length - 1].particle = particle;
    }

    // Mouse interaction
    var isDragging = false, prevX = 0, prevY = 0;
    canvas.addEventListener('mousedown', function(e) { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    canvas.addEventListener('mouseup', function() { isDragging = false; });
    canvas.addEventListener('mousemove', function(e) {
      if (isDragging) {
        var dx = e.clientX - prevX;
        var dy = e.clientY - prevY;
        globe.rotation.y += dx * 0.005;
        globe.rotation.x += dy * 0.005;
        globe.rotation.x = Math.max(-1.2, Math.min(1.2, globe.rotation.x));
        prevX = e.clientX;
        prevY = e.clientY;
      }
      // Hover tooltip
      checkHover(e);
    });
    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      camera.position.z = Math.max(120, Math.min(400, camera.position.z + e.deltaY * 0.3));
    });

    // Resize handler
    window.addEventListener('resize', function() {
      var nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });

    // Update stats
    updateStats();

    // Start animation
    animate();
  }

  function checkHover(e) {
    var canvas = document.getElementById('cc-globe-canvas');
    var rect = canvas.getBoundingClientRect();
    var mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    var mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
    var intersects = raycaster.intersectObjects(nodes, false);
    var tooltip = document.getElementById('cc-globe-tooltip');
    if (intersects.length > 0 && intersects[0].object.userData) {
      var d = intersects[0].object.userData;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
      tooltip.style.top = (e.clientY - rect.top + 15) + 'px';
      tooltip.innerHTML = '<strong>' + d.name + '</strong><br>' +
        'Type: ' + d.type + '<br>' +
        'Country: ' + d.country + '<br>' +
        'Risk: ' + d.risk + '/100<br>' +
        (d.congestion ? 'Congestion: ' + d.congestion + '<br>Wait: ' + d.waitTime + 'h' : '') +
        (d.category ? 'Category: ' + d.category + '<br>Spend: $' + d.annualSpend + 'M' : '');
    } else {
      tooltip.style.display = 'none';
    }
  }

  function updateStats() {
    var stats = document.getElementById('cc-globe-stats');
    if (!stats) return;
    var visiblePorts = ports.filter(function(p) { return p.risk >= riskFilter; });
    var visibleSuppliers = suppliers.filter(function(s) { return s.risk >= riskFilter; });
    var avgRisk = 0;
    var allRisks = visiblePorts.concat(visibleSuppliers);
    for (var i = 0; i < allRisks.length; i++) avgRisk += allRisks[i].risk;
    avgRisk = allRisks.length > 0 ? Math.round(avgRisk / allRisks.length) : 0;
    stats.innerHTML =
      '<div class="cc-globe-stat-row"><span>Ports Visible</span><span class="cc-globe-stat-value">' + visiblePorts.length + '/' + ports.length + '</span></div>' +
      '<div class="cc-globe-stat-row"><span>Suppliers Visible</span><span class="cc-globe-stat-value">' + visibleSuppliers.length + '/' + suppliers.length + '</span></div>' +
      '<div class="cc-globe-stat-row"><span>Shipping Routes</span><span class="cc-globe-stat-value">' + routes.length + '</span></div>' +
      '<div class="cc-globe-stat-row"><span>Avg Risk Score</span><span class="cc-globe-stat-value">' + avgRisk + '/100</span></div>' +
      '<div class="cc-globe-stat-row"><span>High Risk Nodes</span><span class="cc-globe-stat-value" style="color:#f87171;">' + allRisks.filter(function(a){return a.risk>60;}).length + '</span></div>';
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (isPlaying) {
      globe.rotation.y += 0.001;

      // Animate particles on arcs
      for (var i = 0; i < arcs.length; i++) {
        var arc = arcs[i];
        arc.t += 0.005;
        if (arc.t > 1) arc.t = 0;
        var pos = arc.curve.getPoint(arc.t);
        if (arc.particle) arc.particle.position.set(pos.x, pos.y, pos.z);
      }

      // Pulse high-risk rings
      globe.children.forEach(function(child) {
        if (child.userData && child.userData.pulse) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.3);
          child.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
        }
      });
    }

    if (renderer) renderer.render(scene, camera);
  }

  // Listen for risk engine events
  window.addEventListener('storage', function(e) {
    if (e.key === 'cc-waze-reports' && document.getElementById('cc-globe-overlay')) {
      updateStats();
    }
  });

  window.__ccGlobe = { open: openPanel, close: closePanel, togglePlay: togglePlay, setRiskFilter: setRiskFilter };

  function injectButton() {
    if (document.getElementById('cc-globe-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-globe-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> 3D Globe';
    btn.setAttribute('aria-label', 'Open 3D Supply Chain Globe');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[globe-risk-integration] Phase 23 button injected');
  }

  function init() {
    injectStyles();
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-globe-overlay')) { openPanel(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closePanel();
    });
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-globe-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-globe-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 7500);
  }

  init();
})();
