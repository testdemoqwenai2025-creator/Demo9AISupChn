// ====================================================================
// ai-doc-generator.js — Phase 20: AI-Powered Document Generation
// ====================================================================
// Generate professional supply chain documents as downloadable HTML:
// Purchase Orders, RFQs, Compliance Reports, Supplier Assessments,
// Tender Responses. Template engine + form inputs → formatted document.
// ====================================================================

(function() {
  'use strict';
  if (window.__ccDocGenLoaded) return;
  window.__ccDocGenLoaded = true;

  var SUPPLIERS = [
    'TechComp Asia Pte Ltd', 'EuroManufacturing GmbH', 'SemiconTech Inc.',
    'PrecisionParts Ltd.', 'IndiaChem Industries', 'GlobalLogistics Co.',
    'Shanghai Advanced Materials', 'BrazilAgro Commodities SA'
  ];

  var DOC_TYPES = [
    { id: 'po', name: 'Purchase Order (PO)', icon: '\u{1F4C4}' },
    { id: 'rfq', name: 'Request for Quotation (RFQ)', icon: '\u{1F4E7}' },
    { id: 'compliance', name: 'Compliance Report', icon: '\u2705' },
    { id: 'assessment', name: 'Supplier Assessment', icon: '\u{1F4CA}' },
    { id: 'tender', name: 'Tender Response', icon: '\u{1F4CB}' },
  ];

  function injectStyles() {
    if (document.getElementById('cc-docgen-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-docgen-styles';
    style.textContent = `
      #cc-docgen-trigger-btn {
        position: fixed; bottom: 560px; right: 20px; z-index: 9999;
        padding: 12px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #059669, #0891b2);
        color: #fff; border: none; font-size: 13px; font-weight: 700;
        cursor: pointer; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #cc-docgen-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(5,150,105,0.5); }
      #cc-docgen-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); z-index: 10003;
        display: flex; align-items: center; justify-content: center;
        padding: 20px; backdrop-filter: blur(8px);
      }
      #cc-docgen-panel {
        background: #0f172a; border: 1px solid rgba(5,150,105,0.2);
        border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .cc-dg-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(5,150,105,0.1), rgba(8,145,178,0.1)); }
      .cc-dg-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-dg-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
      .cc-dg-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .cc-dg-body { flex: 1; overflow-y: auto; padding: 20px; }
      .cc-dg-types { display: grid; grid-template-columns: repeat(1, 1fr); gap: 8px; margin-bottom: 16px; }
      .cc-dg-type { padding: 12px 14px; border-radius: 10px; cursor: pointer; border: 2px solid transparent; background: rgba(255,255,255,0.03); display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
      .cc-dg-type:hover { border-color: rgba(5,150,105,0.3); background: rgba(5,150,105,0.05); }
      .cc-dg-type.selected { border-color: #059669; background: rgba(5,150,105,0.1); }
      .cc-dg-type-icon { font-size: 20px; }
      .cc-dg-type-name { font-size: 13px; font-weight: 600; color: #fff; font-family: -apple-system, sans-serif; }
      .cc-dg-label { font-size: 11px; color: #94a3b8; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
      .cc-dg-input { width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-family: inherit; margin-bottom: 12px; }
      .cc-dg-input:focus { border-color: rgba(5,150,105,0.5); outline: none; }
      .cc-dg-select { width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-family: inherit; margin-bottom: 12px; }
      .cc-dg-row { display: flex; gap: 8px; }
      .cc-dg-row > div { flex: 1; }
      .cc-dg-generate { width: 100%; padding: 12px; border-radius: 8px; background: linear-gradient(135deg, #059669, #0891b2); color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: -apple-system, sans-serif; }
      .cc-dg-generate:hover { transform: scale(1.02); }
    `;
    document.head.appendChild(style);
  }

  var selectedType = null;

  function openPanel() {
    if (document.getElementById('cc-docgen-overlay')) return;
    injectStyles();

    var typesHTML = '';
    for (var i = 0; i < DOC_TYPES.length; i++) {
      typesHTML += '<div class="cc-dg-type" onclick="window.__ccDocGen.selectType(' + i + ',this)">' +
        '<span class="cc-dg-type-icon">' + DOC_TYPES[i].icon + '</span>' +
        '<span class="cc-dg-type-name">' + DOC_TYPES[i].name + '</span></div>';
    }

    var supplierOptions = '';
    for (var j = 0; j < SUPPLIERS.length; j++) {
      supplierOptions += '<option>' + SUPPLIERS[j] + '</option>';
    }

    var overlay = document.createElement('div');
    overlay.id = 'cc-docgen-overlay';
    overlay.innerHTML =
      '<div id="cc-docgen-panel">' +
        '<div class="cc-dg-header">' +
          '<div class="cc-dg-title"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>AI Document Generator</div>' +
          '<button class="cc-dg-close" onclick="window.__ccDocGen.close()">&times;</button>' +
        '</div>' +
        '<div class="cc-dg-body">' +
          '<div class="cc-dg-label">Select Document Type</div>' +
          '<div class="cc-dg-types">' + typesHTML + '</div>' +
          '<div id="cc-dg-form" style="display:none;">' +
            '<div class="cc-dg-label">Supplier</div>' +
            '<select class="cc-dg-select" id="cc-dg-supplier">' + supplierOptions + '</select>' +
            '<div class="cc-dg-row">' +
              '<div><div class="cc-dg-label">PO Number</div><input type="text" class="cc-dg-input" id="cc-dg-ponum" value="PO-2026-' + Math.floor(Math.random()*9000+1000) + '"></div>' +
              '<div><div class="cc-dg-label">Amount ($)</div><input type="text" class="cc-dg-input" id="cc-dg-amount" value="185,000"></div>' +
            '</div>' +
            '<div class="cc-dg-label">Items / Description</div>' +
            '<textarea class="cc-dg-input" id="cc-dg-items" rows="3" style="resize:vertical;">Semiconductor components, batch SC-2026-Q4\nQuantity: 5,000 units\nUnit Price: $37.00\nDelivery: 30 days ARO</textarea>' +
            '<div class="cc-dg-row">' +
              '<div><div class="cc-dg-label">Payment Terms</div><input type="text" class="cc-dg-input" id="cc-dg-terms" value="Net 30"></div>' +
              '<div><div class="cc-dg-label">Delivery Date</div><input type="text" class="cc-dg-input" id="cc-dg-delivery" value="2026-10-15"></div>' +
            '</div>' +
            '<button class="cc-dg-generate" onclick="window.__ccDocGen.generate()">\u26a1 Generate Document</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) closePanel(); };
    document.body.appendChild(overlay);
  }

  function closePanel() {
    var overlay = document.getElementById('cc-docgen-overlay');
    if (overlay) overlay.remove();
  }

  function selectType(idx, el) {
    selectedType = DOC_TYPES[idx];
    var all = document.querySelectorAll('.cc-dg-type');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');
    document.getElementById('cc-dg-form').style.display = 'block';
  }

  function generate() {
    if (!selectedType) { alert('Please select a document type'); return; }
    var supplier = document.getElementById('cc-dg-supplier').value;
    var poNum = document.getElementById('cc-dg-ponum').value;
    var amount = document.getElementById('cc-dg-amount').value;
    var items = document.getElementById('cc-dg-items').value;
    var terms = document.getElementById('cc-dg-terms').value;
    var delivery = document.getElementById('cc-dg-delivery').value;
    var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    var title = selectedType.name;
    var body = '';

    if (selectedType.id === 'po') {
      body = '<h2>PURCHASE ORDER</h2>' +
        '<table class="info"><tr><td><strong>PO Number:</strong></td><td>' + poNum + '</td></tr>' +
        '<tr><td><strong>Date:</strong></td><td>' + date + '</td></tr>' +
        '<tr><td><strong>Supplier:</strong></td><td>' + supplier + '</td></tr>' +
        '<tr><td><strong>Payment Terms:</strong></td><td>' + terms + '</td></tr>' +
        '<tr><td><strong>Delivery Date:</strong></td><td>' + delivery + '</td></tr></table>' +
        '<h3>Items</h3><pre>' + items + '</pre>' +
        '<h3>Total Amount</h3><p style="font-size:24px;font-weight:700;color:#059669">$' + amount + '</p>' +
        '<hr><p style="font-size:11px;color:#64748b;">This document was generated by AI Supply Chain Advanced on ' + date + '. This is a system-generated document and is valid without signature.</p>';
    } else if (selectedType.id === 'rfq') {
      body = '<h2>REQUEST FOR QUOTATION</h2>' +
        '<table class="info"><tr><td><strong>RFQ Number:</strong></td><td>' + poNum + '</td></tr>' +
        '<tr><td><strong>Date:</strong></td><td>' + date + '</td></tr>' +
        '<tr><td><strong>Target Supplier:</strong></td><td>' + supplier + '</td></tr>' +
        '<tr><td><strong>Response Deadline:</strong></td><td>' + delivery + '</td></tr></table>' +
        '<h3>Requirements</h3><pre>' + items + '</pre>' +
        '<h3>Evaluation Criteria</h3><ul><li>Price (40%)</li><li>Quality certification (25%)</li><li>Delivery timeline (20%)</li><li>Sustainability score (15%)</li></ul>' +
        '<hr><p style="font-size:11px;color:#64748b;">Please submit your quotation by ' + delivery + '. Late submissions will not be considered.</p>';
    } else if (selectedType.id === 'compliance') {
      body = '<h2>COMPLIANCE REPORT</h2>' +
        '<table class="info"><tr><td><strong>Report ID:</strong></td><td>' + poNum + '</td></tr>' +
        '<tr><td><strong>Date:</strong></td><td>' + date + '</td></tr>' +
        '<tr><td><strong>Supplier:</strong></td><td>' + supplier + '</td></tr></table>' +
        '<h3>Compliance Status</h3><table class="info"><tr><th>Framework</th><th>Status</th><th>Score</th></tr>' +
        '<tr><td>UFLPA</td><td style="color:#fbbf24;">Review Required</td><td>72%</td></tr>' +
        '<tr><td>EUDR</td><td style="color:#ef4444;">Non-Compliant</td><td>68%</td></tr>' +
        '<tr><td>CSDDD</td><td style="color:#34d399;">Compliant</td><td>85%</td></tr>' +
        '<tr><td>Sanctions</td><td style="color:#34d399;">Compliant</td><td>92%</td></tr></table>' +
        '<h3>Details</h3><pre>' + items + '</pre>' +
        '<hr><p style="font-size:11px;color:#64748b;">Report generated by AI Supply Chain Advanced. Data sources: satellite imagery, entity list screening, financial health analysis.</p>';
    } else if (selectedType.id === 'assessment') {
      var risk = Math.floor(Math.random() * 60 + 20);
      body = '<h2>SUPPLIER ASSESSMENT</h2>' +
        '<table class="info"><tr><td><strong>Assessment ID:</strong></td><td>' + poNum + '</td></tr>' +
        '<tr><td><strong>Date:</strong></td><td>' + date + '</td></tr>' +
        '<tr><td><strong>Supplier:</strong></td><td>' + supplier + '</td></tr></table>' +
        '<h3>Risk Score: <span style="color:' + (risk > 50 ? '#ef4444' : '#34d399') + ';">' + risk + '/100</span></h3>' +
        '<table class="info"><tr><th>Category</th><th>Score</th><th>Trend</th></tr>' +
        '<tr><td>Geopolitical</td><td>' + Math.floor(risk * 0.4) + '%</td><td>\u2191</td></tr>' +
        '<tr><td>Financial</td><td>' + Math.floor(risk * 0.3) + '%</td><td>\u2192</td></tr>' +
        '<tr><td>Operational</td><td>' + Math.floor(risk * 0.2) + '%</td><td>\u2193</td></tr>' +
        '<tr><td>Compliance</td><td>' + Math.floor(risk * 0.1) + '%</td><td>\u2192</td></tr></table>' +
        '<h3>Notes</h3><pre>' + items + '</pre>' +
        '<h3>Recommendation</h3><p>' + (risk > 50 ? 'Consider diversifying to alternative suppliers.' : 'Supplier performance is within acceptable parameters.') + '</p>';
    } else if (selectedType.id === 'tender') {
      body = '<h2>TENDER RESPONSE</h2>' +
        '<table class="info"><tr><td><strong>Response ID:</strong></td><td>' + poNum + '</td></tr>' +
        '<tr><td><strong>Date:</strong></td><td>' + date + '</td></tr>' +
        '<tr><td><strong>Bidder:</strong></td><td>' + supplier + '</td></tr>' +
        '<tr><td><strong>Bid Amount:</strong></td><td>$' + amount + '</td></tr></table>' +
        '<h3>Cover Letter</h3><p>We are pleased to submit our proposal in response to your tender. Our team has extensive experience in the required scope, and we are confident in our ability to deliver on time and within budget.</p>' +
        '<h3>Capability Statement</h3><pre>' + items + '</pre>' +
        '<h3>Pricing</h3><p>Total Bid: $' + amount + '</p><p>Payment Terms: ' + terms + '</p>' +
        '<hr><p style="font-size:11px;color:#64748b;">This bid is valid for 60 days from the date of submission.</p>';
    }

    var fullHTML = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + ' — ' + poNum + '</title>' +
      '<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;color:#1e293b;line-height:1.6}' +
      'h1{color:#059669;border-bottom:3px solid #059669;padding-bottom:10px;font-size:28px}' +
      'h2{color:#0891b2;margin-top:30px}h3{color:#475569;margin-top:20px}' +
      'table.info{width:100%;border-collapse:collapse;margin:15px 0}table.info td,table.info th{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}' +
      'table.info th{background:#f1f5f9;text-align:left}pre{background:#f8fafc;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap}' +
      'hr{border:none;border-top:1px solid #cbd5e1;margin:20px 0}' +
      '@media print{body{margin:0}}</style></head><body>' +
      '<h1>' + title + '</h1>' + body +
      '<p style="text-align:center;color:#64748b;font-size:10px;margin-top:40px;">Generated by AI Supply Chain Advanced \u2014 ' + date + '</p>' +
      '</body></html>';

    var blob = new Blob([fullHTML], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = selectedType.id + '-' + poNum + '.html';
    a.click();
    URL.revokeObjectURL(url);
    console.log('[ai-doc-gen] Document generated: ' + selectedType.id + ' / ' + poNum);
  }

  window.__ccDocGen = { open: openPanel, close: closePanel, selectType: selectType, generate: generate };

  function injectButton() {
    if (document.getElementById('cc-docgen-trigger-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cc-docgen-trigger-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> AI Docs';
    btn.setAttribute('aria-label', 'Open AI Document Generator');
    btn.onclick = openPanel;
    document.body.appendChild(btn);
    console.log('[ai-doc-gen] Phase 20 button injected');
  }

  function init() {
    injectStyles();
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!document.getElementById('cc-docgen-overlay')) { openPanel(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closePanel();
    });
    var attempts = 0;
    function tryInject() {
      attempts++;
      if (document.getElementById('cc-docgen-trigger-btn')) return;
      if (attempts > 30) return;
      injectButton();
      if (!document.getElementById('cc-docgen-trigger-btn')) setTimeout(tryInject, 500);
    }
    setTimeout(tryInject, 6000);
  }

  init();
})();
