// InfluenceIQ Premium — app.js

// ── VIEW SWITCHING ────────────────────────────────────────────
function switchView(name) {
  // Scroll to the target page section (#page-<name>)
  const section = document.getElementById('page-' + name);
  if (section) {
    const top = section.getBoundingClientRect().top + window.pageYOffset - 60;
    window.scrollY; // reference to suppress override
    document.documentElement.scrollTo({ top, behavior: 'smooth' });
  }
  if (name === 'history') setTimeout(() => { if (typeof loadHistory === 'function') loadHistory(); }, 400);
  if (name === 'home') setTimeout(() => { if (typeof initHomeChart === 'function') initHomeChart(); }, 400);
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); switchView(el.dataset.view); });
});

// ── THEME (unused — notifications button handles notifBtn) ────

// ── FORM ──────────────────────────────────────────────────────
const form       = document.getElementById('form');
const submitBtn  = document.getElementById('submit-btn');
const fetchBtn   = document.getElementById('fetch-btn');
const linkInput  = document.getElementById('blogger-link');
const statusEl   = document.getElementById('fetch-status');
const manualHint = document.getElementById('manual-hint');
const fPlatform  = document.getElementById('field-platform');
const fViews     = document.getElementById('field-views');
const fLikes     = document.getElementById('field-likes');
const fFollowers = document.getElementById('field-followers');

// Auto fetch
linkInput?.addEventListener('paste', () => { setTimeout(() => { if (linkInput.value.startsWith('http')) fetchBtn.click(); }, 100); });
linkInput?.addEventListener('blur', () => { if (linkInput.value.startsWith('http')) fetchBtn.click(); });
linkInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fetchBtn.click(); } });

// helpers
function authHeaders(extra = {}) {
  const token = localStorage.getItem('iq_token');
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, ...extra }
    : { 'Content-Type': 'application/json', ...extra };
}

// Store fetched channel name/url for attaching to forecast
let _fetchedName = null;
let _fetchedUrl  = null;

fetchBtn?.addEventListener('click', async () => {
  const url = linkInput.value.trim();
  if (!url) { showStatus('Enter a link', 'err'); return; }
  fetchBtn.disabled = true; fetchBtn.textContent = '...';
  showStatus('Loading...', 'inf'); clearAuto();
  _fetchedName = null; _fetchedUrl = null;
  try {
    const res = await fetch('/api/fetch-stats', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ url }) });
    const d = await res.json();
    if (!d.success) {
      if (d.manual) { showStatus(d.message, 'inf'); manualHint.classList.remove('hidden'); if (d.platform) setSel(fPlatform, d.platform); }
      else showStatus(d.error || 'Failed to load', 'err');
      return;
    }
    manualHint.classList.add('hidden');
    setSel(fPlatform, d.platform);
    auto(fViews, d.views);
    auto(fLikes, d.likes ?? (d.views ? Math.round(d.views * (d.engagement_rate ? d.engagement_rate / 100 : 0.03)) : 0));
    auto(fFollowers, d.followers);
    _fetchedName = d.name || null;
    _fetchedUrl  = d.channel_url || url;
    const erText = d.engagement_rate != null ? ` · ER ${d.engagement_rate}%` : '';
    showStatus('✓ ' + (d.name || 'Loaded') + erText, 'ok');

    // Load analytics charts for YouTube
    if (d.platform === 'youtube') {
      fetchChannelAnalytics(url);
    }
  } catch (e) { showStatus('Connection error', 'err'); }
  finally { fetchBtn.disabled = false; fetchBtn.textContent = 'Load'; }
});

// Submit
form?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form), g = k => fd.get(k);
  const payload = {
    blogger: {
      platform: g('platform'), views: +g('views'), likes: +g('likes'),
      followers: g('followers') ? +g('followers') : null,
      link: _fetchedUrl || g('link') || null,
      name: _fetchedName || null,
    },
    campaign: { ad_price: +g('ad_price'), ad_format: g('ad_format'), product_price: +g('product_price'), product_type: g('product_type') },
    account: { followers: +g('acc_followers'), level: g('level'), custom_conversion: 0 },
  };
  submitBtn.disabled = true; submitBtn.textContent = 'Analyzing...';
  try {
    const res = await fetch('/api/forecast', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Server error');
    const d = await res.json();
    window._lastForecastResult = d;
    window._lastForecastPayload = payload;
    renderResult(d, payload);
    loadRecentRows();
  } catch (e) { alert('Error: ' + e.message); }
  finally { submitBtn.disabled = false; submitBtn.textContent = 'Analyze Influencer →'; }
});

// ── RENDER RESULTS ─────────────────────────────────────────────
let chartInst = null;
function renderResult(d, payload) {
  const cur = window.IQ_CUR || '$';
  const er = Math.min(d.engagement_rate * 10, 10).toFixed(1);
  const handle = payload.blogger.link ? '@' + payload.blogger.link.split('/').filter(Boolean).pop() : '@creator';
  const avgP = Math.round((d.profit_min + d.profit_max) / 2);
  const roi = Math.round(avgP / payload.campaign.ad_price * 100);
  const rc = d.recommendation;
  const initials = handle.replace('@','').slice(0,2).toUpperCase();

  // Donut calc
  const C = 138.2; // 2π × 22
  const donutOff = C - C * parseFloat(er) / 10;

  // Recommendation badge
  const recLabel = rc === 'take' ? 'Good to Go' : rc === 'risky' ? 'Caution' : 'Not Recommended';
  const recDesc  = rc === 'take' ? 'Great fit for your campaign.' : rc === 'risky' ? 'Proceed with caution.' : 'Not recommended.';
  const recBadge = rc === 'take'
    ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:980px;background:var(--t1);color:#fff;font-size:12px;font-weight:600">${recLabel}</span>`
    : rc === 'risky'
    ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:980px;background:rgba(0,0,0,.07);color:var(--t1);font-size:12px;font-weight:600">${recLabel}</span>`
    : `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:980px;background:rgba(0,0,0,.07);color:var(--t2);font-size:12px;font-weight:600">${recLabel}</span>`;

  document.getElementById('result-section').innerHTML = `
  <div style="padding:32px 0 48px">
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:28px">
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:6px">Analysis Results</p>
        <h3 style="font-size:22px;font-weight:800;letter-spacing:-.025em;color:var(--t1)">Completed just now</h3>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-outline btn-sm" id="downloadReportBtn" onclick="downloadReport()">↓ Download Report</button>
        <button class="btn-outline btn-sm" onclick="navigator.clipboard?.writeText(location.href);showToast('Link copied!')">↗ Share</button>
        <a href="/history" class="btn-outline btn-sm" style="text-decoration:none;display:flex;align-items:center;gap:5px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4"/><polyline points="3 16 3 11 8 11"/></svg>
          История
        </a>
      </div>
    </div>

    <!-- Grid -->
    <div style="display:grid;grid-template-columns:1fr 320px;gap:18px;align-items:start">

      <!-- Left -->
      <div>
        <!-- Row 1 -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
          <!-- Score -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Overall Score</div>
            <div style="display:flex;align-items:center;gap:12px">
              <div style="position:relative;width:52px;height:52px;flex-shrink:0">
                <svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg)">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="5"/>
                  <circle cx="26" cy="26" r="20" fill="none" stroke="var(--t1)" stroke-width="5" stroke-linecap="round"
                    stroke-dasharray="${C}" stroke-dashoffset="${C}" id="r-donut"
                    style="transition:stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)"/>
                </svg>
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--t1)">${er}</div>
              </div>
              <div>
                <div style="font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1">${er}<span style="font-size:12px;font-weight:400;color:var(--t3)">/10</span></div>
                <div style="margin-top:6px;display:inline-block;padding:3px 9px;border-radius:980px;background:rgba(0,0,0,.07);font-size:11px;font-weight:500;color:var(--t2)">${d.audience_quality}</div>
              </div>
            </div>
          </div>
          <!-- New Followers -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">New Followers</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-.03em">+${d.subscribers_min}–${d.subscribers_max}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:6px">Predicted</div>
          </div>
          <!-- Sales -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Sales Forecast</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-.03em">${d.sales_min}–${d.sales_max}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:6px">Predicted</div>
          </div>
        </div>

        <!-- Row 2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
          <!-- Profit -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Profit Forecast</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-.03em">${avgP >= 0 ? '+' : ''}${cur}${Math.abs(avgP).toLocaleString()}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:6px">Estimated</div>
          </div>
          <!-- ROI -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">ROI</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-.03em">${roi >= 0 ? '+' : ''}${roi}%</div>
            <div style="margin-top:6px;display:inline-block;padding:3px 9px;border-radius:980px;background:rgba(0,0,0,.07);font-size:11px;font-weight:500;color:var(--t2)">${d.risk_level} risk</div>
          </div>
          <!-- Recommendation -->
          <div class="card" style="padding:20px">
            <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Recommendation</div>
            <div style="margin-bottom:8px">${recBadge}</div>
            <div style="font-size:11.5px;color:var(--t2);line-height:1.5">${recDesc}</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card" style="padding:20px">
          <div style="font-size:12px;font-weight:600;color:var(--t2);margin-bottom:14px">Profit Forecast — 6 Month Scenarios</div>
          <div style="height:150px"><canvas id="profitChart"></canvas></div>
        </div>
      </div>

      <!-- Right: creator card -->
      <div class="card" style="padding:22px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">
          <div style="width:42px;height:42px;border-radius:50%;background:var(--bg-gray);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--t1);flex-shrink:0">${initials}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--t1)">${handle}</div>
            <div style="font-size:12.5px;color:var(--t3);margin-top:1px">${payload.blogger.followers ? payload.blogger.followers.toLocaleString() + ' Followers' : payload.blogger.platform}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
          <div>
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:5px">Engagement Rate</div>
            <div style="font-size:16px;font-weight:700">${d.engagement_rate}%</div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:5px">Avg. Likes</div>
            <div style="font-size:16px;font-weight:700">${payload.blogger.likes ? (payload.blogger.likes/1000).toFixed(1)+'K' : 'N/A'}</div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:5px">Avg. Comments</div>
            <div style="font-size:16px;font-weight:700">320</div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:5px">Estimated Reach</div>
            <div style="font-size:16px;font-weight:700">${d.subscribers_min}–${d.subscribers_max}</div>
          </div>
        </div>
        <button class="btn-outline" style="width:100%;padding:11px 20px;font-size:14px" onclick="switchView('campaigns')">View Full Report →</button>
      </div>
    </div>
  </div>`;

  setTimeout(() => {
    const donut = document.getElementById('r-donut');
    if (donut) donut.style.strokeDashoffset = donutOff;
    drawChart(d, payload);
  }, 120);
  document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function drawChart(d, payload) {
  const ctx = document.getElementById('profitChart');
  if (!ctx) return;
  if (chartInst) { chartInst.destroy(); chartInst = null; }
  const base = (d.profit_min + d.profit_max) / 2;
  const months = ['Mo 1','Mo 2','Mo 3','Mo 4','Mo 5','Mo 6'];
  const g = 1.15;
  const gridC = 'rgba(0,0,0,.06)', tickC = 'rgba(0,0,0,.35)';
  chartInst = new Chart(ctx, {
    type: 'line',
    data: { labels: months, datasets: [
      { label: 'Pessimistic', data: months.map((_,i) => Math.round(d.profit_min * Math.pow(g*.85,i))),
        borderColor: 'rgba(0,0,0,.25)', backgroundColor: 'transparent',
        borderWidth: 1.5, borderDash: [5,4], pointRadius: 3, pointBackgroundColor: 'rgba(0,0,0,.25)', tension: .4 },
      { label: 'Base', data: months.map((_,i) => Math.round(base * Math.pow(g,i))),
        borderColor: 'rgba(0,0,0,.7)', backgroundColor: 'rgba(0,0,0,.04)',
        borderWidth: 2, pointRadius: 3, pointBackgroundColor: 'rgba(0,0,0,.7)', fill: true, tension: .4 },
      { label: 'Optimistic', data: months.map((_,i) => Math.round(d.profit_max * Math.pow(g*1.1,i))),
        borderColor: 'rgba(0,0,0,.45)', backgroundColor: 'transparent',
        borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: 'rgba(0,0,0,.45)', tension: .4 },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: tickC, font: { size: 10, family: 'Inter' }, boxWidth: 10, padding: 16 } },
        tooltip: { backgroundColor: '#fff', titleColor: '#1d1d1f', bodyColor: tickC,
          borderColor: 'rgba(0,0,0,.1)', borderWidth: 1,
          callbacks: { label: c => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}` } }
      },
      scales: {
        x: { grid: { color: gridC }, ticks: { color: tickC, font: { size: 10 } } },
        y: { grid: { color: gridC }, ticks: { color: tickC, font: { size: 10 }, callback: v => '$'+(Math.abs(v)>=1000?(v/1000).toFixed(0)+'k':v) } }
      }
    }
  });
}

// ── HOME CHART ─────────────────────────────────────────────────
let homeChartInst = null;
function initHomeChart() {
  const ctx = document.getElementById('homeChart');
  if (!ctx || homeChartInst) return;
  const gridC = 'rgba(0,0,0,.06)', tickC = 'rgba(0,0,0,.32)';
  homeChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['May 6','May 7','May 8','May 9','May 10','May 11','May 12'],
      datasets: [{
        data: [120,175,145,215,188,255,215],
        borderColor: 'rgba(0,0,0,.7)',
        backgroundColor: 'rgba(0,0,0,.05)',
        borderWidth: 1.6,
        pointRadius: [0,0,0,0,0,0,0],
        pointBackgroundColor: 'rgba(0,0,0,.7)',
        fill: true,
        tension: .45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ROI: ' + c.parsed.y + '%' } }
      },
      scales: {
        x: {
          grid: { color: gridC },
          ticks: { color: tickC, font: { size: 9 } }
        },
        y: { display: false }
      }
    }
  });
}
setTimeout(initHomeChart, 100);

// Engagement mini chart
setTimeout(() => {
  const ctx = document.getElementById('engChart');
  if (!ctx) return;
  new Chart(ctx, { type: 'line', data: { labels: ['','','','','','',''], datasets: [{ data: [4.2,5.1,4.8,6.3,7.1,6.8,7.6], borderColor: '#17C964', backgroundColor: 'rgba(23,201,100,.1)', borderWidth: 2, pointRadius: 0, fill: true, tension: .5 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
}, 200);

// ── RECENT ROWS ─────────────────────────────────────────────────
async function loadRecentRows() {
  try {
    const res = await fetch('/api/history?limit=3');
    const rows = await res.json();
    const el = document.getElementById('recent-rows');
    if (!el || !rows.length) return;
    el.innerHTML = rows.map(r => {
      const d = r.result;
      const er = Math.min(d.engagement_rate * 10, 10).toFixed(1);
      const avgP = Math.round((d.profit_min + d.profit_max) / 2);
      const roi = Math.round(avgP / (r.ad_price || 1) * 100);
      return `<div class="rrow"><div class="rav">${r.platform.slice(0,2).toUpperCase()}</div><div style="flex:1"><div class="rname">@${r.platform}_${r.id}</div><div class="rsub">${r.platform}</div></div><div style="text-align:right"><div class="rscore">${er}</div><div class="rroi" style="color:var(--t3)">${roi>=0?'+':''}${roi}%</div></div></div>`;
    }).join('');
  } catch (e) {}
}
loadRecentRows();

// ── HISTORY ─────────────────────────────────────────────────────
let histRows = [], histFilter = 'all', histSearch = '';
async function loadHistory() {
  const body = document.getElementById('hist-body');
  try {
    const res = await fetch('/api/history?limit=200');
    histRows = await res.json();
    renderHistory();
  } catch (e) { body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--red)">Failed to load</td></tr>'; }
}
function renderHistory() {
  const body = document.getElementById('hist-body');
  let rows = histRows;
  if (histFilter !== 'all') rows = rows.filter(r => r.result.recommendation === histFilter);
  if (histSearch) rows = rows.filter(r => (r.platform + r.id).toLowerCase().includes(histSearch.toLowerCase()));
  if (!rows.length) { body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--ink-35)">No analyses yet. Run your first analysis!</td></tr>'; return; }
  body.innerHTML = rows.map((r, i) => {
    const d = r.result, date = new Date(r.created);
    const er = Math.min(d.engagement_rate * 10, 10).toFixed(1);
    const avgP = Math.round((d.profit_min + d.profit_max) / 2);
    const roi = Math.round(avgP / (r.ad_price || 1) * 100);
    const sc = parseFloat(er) >= 7 ? 'green' : parseFloat(er) >= 5 ? 'amber' : 'red';
    const rc = d.recommendation;
    const pc = rc === 'take' ? 'green' : rc === 'risky' ? 'amber' : 'red';
    const pt = rc === 'take' ? 'Good to Go' : rc === 'risky' ? 'Proceed with Caution' : 'Not Recommended';
    return `<tr>
      <td><div class="hflex"><div class="hav">${r.platform.slice(0,2).toUpperCase()}</div><div><div class="hname">@${r.platform}_${r.id}</div><div class="hsub">${r.views ? r.views.toLocaleString() + ' views' : r.platform}</div></div></div></td>
      <td><div>${date.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</div><div class="hsub">${date.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div></td>
      <td><span class="stxt ${sc}">${er}</span><div class="hsub">${d.audience_quality}</div></td>
      <td><span class="stxt ${roi>=100?'green':roi>=0?'amber':'red'}">${roi>=0?'+':''}${roi}%</span><div class="hsub">${d.risk_level} risk</div></td>
      <td><span class="pill ${pc}">${pt}</span></td>
      <td><div class="ract"><button class="ra" title="Repeat" onclick="switchView('analyze')">↺</button><button class="ra" title="Export" onclick="exportRow(${i})">↓</button><button class="ra del" title="Delete" onclick="delRow(${r.id},this)">🗑</button></div></td>
    </tr>`;
  }).join('');
}
document.getElementById('hist-filter')?.addEventListener('click', e => {
  const b = e.target.closest('.seg-b'); if (!b) return;
  document.querySelectorAll('#hist-filter .seg-b').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); histFilter = b.dataset.f; renderHistory();
});
document.getElementById('hist-search')?.addEventListener('input', e => { histSearch = e.target.value; renderHistory(); });
document.getElementById('exportBtn')?.addEventListener('click', () => {
  if (!histRows.length) { showToast('No data'); return; }
  const hdr = 'Date,Platform,Score,ROI,Profit,Recommendation\n';
  const body = histRows.map(r => { const d = r.result, er = Math.min(d.engagement_rate*10,10).toFixed(1), avgP = Math.round((d.profit_min+d.profit_max)/2), roi = Math.round(avgP/(r.ad_price||1)*100); return [r.created,r.platform,er,roi+'%','$'+avgP,d.recommendation].join(','); }).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([hdr+body],{type:'text/csv'})); a.download = 'influenceiq.csv'; a.click(); showToast('Exported!');
});
function exportRow(i) { const r = histRows[i], d = r.result, a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`Date,Platform,Recommendation\n${r.created},${r.platform},${d.recommendation}`],{type:'text/csv'})); a.download='analysis.csv'; a.click(); showToast('Exported'); }
async function delRow(id, btn) {
  try { await fetch('/api/history/'+id,{method:'DELETE'}); histRows=histRows.filter(r=>r.id!==id); const tr=btn.closest('tr'); tr.style.opacity='0'; tr.style.transition='opacity .3s'; setTimeout(()=>renderHistory(),320); showToast('Deleted'); } catch(e){showToast('Failed');}
}

// ── INSIGHTS TABS ──────────────────────────────────────────────
document.getElementById('itabs')?.addEventListener('click', e => {
  const t = e.target.closest('.tab'); if (!t) return;
  document.querySelectorAll('#itabs .tab').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
});

// ── PRICING ────────────────────────────────────────────────────
document.getElementById('pt-m')?.addEventListener('click', () => togglePrice(false));
document.getElementById('pt-a')?.addEventListener('click', () => togglePrice(true));
function togglePrice(annual) {
  document.getElementById('pt-m').classList.toggle('on', !annual);
  document.getElementById('pt-a').classList.toggle('on', annual);
  document.querySelectorAll('.pamt-val').forEach(el => { el.textContent = '$' + (annual ? el.dataset.a : el.dataset.m); });
}

// ── HELPERS ────────────────────────────────────────────────────
function showStatus(m, t) { statusEl.textContent = m; statusEl.className = 'status-msg ' + t; }
function auto(inp, v) { if (v == null) return; inp.value = v; inp.classList.add('auto-filled'); }
function clearAuto() { [fViews,fLikes,fFollowers].forEach(f=>f.classList.remove('auto-filled')); manualHint.classList.add('hidden'); statusEl.className='status-msg hidden'; }
function setSel(sel, v) { const o=[...sel.options].find(x=>x.value===v); if(o)sel.value=v; }
function showToast(m) {
  document.getElementById('iq-toast')?.remove();
  const t = document.createElement('div'); t.id='iq-toast'; t.className='toast'; t.textContent=m;
  document.body.appendChild(t); setTimeout(()=>t.classList.add('on'),10);
  setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),400);},2500);
}
window.showToast = showToast;
// ═══════════════════════════════════════════════════════════════
// CHANNEL ANALYTICS CHARTS
// ═══════════════════════════════════════════════════════════════
let _analyticsCharts = [];

function destroyAnalyticsCharts() {
  _analyticsCharts.forEach(c => c.destroy());
  _analyticsCharts = [];
}

async function fetchChannelAnalytics(url) {
  const box = document.getElementById('channel-analytics');
  if (!box) return;
  box.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:13px">Loading channel data...</div>';
  box.style.display = 'block';
  destroyAnalyticsCharts();

  try {
    const res = await fetch('/api/channel-analytics', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ url }),
    });
    const d = await res.json();
    if (d.error || !d.videos?.length) { box.style.display='none'; return; }

    const labels = d.videos.map((v,i) => v.title.slice(0,18) + (v.title.length>18?'…':''));
    const views  = d.videos.map(v => v.views);
    const ers    = d.videos.map(v => v.er);

    box.innerHTML = `
      <div style="background:var(--white);border-radius:18px;border:1px solid var(--border);padding:20px;margin-top:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--t1)">${d.channel_name}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:2px">
              ${(d.subscribers/1000).toFixed(0)}K subscribers · ${d.avg_views?.toLocaleString()} avg views · ER ${d.avg_er}%
            </div>
          </div>
          <button onclick="addToWatchlist('${url.replace(/'/g,"\\'")}','${d.channel_name.replace(/'/g,"\\'")}', this)"
            style="padding:7px 15px;border-radius:99px;font-size:12px;font-weight:600;border:1px solid var(--border);background:var(--white);cursor:pointer;font-family:inherit;transition:all .15s"
            onmouseover="this.style.background='var(--bg-gray)'" onmouseout="this.style.background='var(--white)'">
            + Watchlist
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:10px">Views — last 10 videos</div>
            <div style="height:130px"><canvas id="analyticsViewsChart"></canvas></div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:10px">Engagement Rate %</div>
            <div style="height:130px"><canvas id="analyticsErChart"></canvas></div>
          </div>
        </div>
      </div>`;

    const gridC = 'rgba(0,0,0,.05)', tickC = '#aeaeb2';
    const c1 = new Chart(document.getElementById('analyticsViewsChart'), {
      type: 'bar',
      data: { labels, datasets: [{ data: views, backgroundColor: 'rgba(29,29,31,.82)', borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display:false }, tooltip: { callbacks: { label: c => ' ' + c.parsed.y.toLocaleString() + ' views' } } },
        scales: { x: { grid:{display:false}, ticks:{display:false} }, y: { grid:{color:gridC}, ticks:{color:tickC,font:{size:10},callback:v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v} } }
      }
    });
    const c2 = new Chart(document.getElementById('analyticsErChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: ers, borderColor: '#1d1d1f', backgroundColor: 'rgba(29,29,31,.06)',
          borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#1d1d1f',
          pointBorderWidth: 2, tension: .35, fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.parsed.y}%`}} },
        scales: { x:{grid:{display:false},ticks:{display:false}}, y:{grid:{color:gridC},ticks:{color:tickC,font:{size:10},callback:v=>v+'%'}} }
      }
    });
    _analyticsCharts = [c1, c2];
  } catch(e) { box.style.display = 'none'; }
}

// ═══════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════
window._lastForecastPayload = null;
window._lastForecastResult  = null;

async function downloadReport() {
  const r = window._lastForecastResult;
  const p = window._lastForecastPayload;
  if (!r || !p) { showToast('Run an analysis first'); return; }

  const btn = document.getElementById('downloadReportBtn');
  if (btn) { btn.textContent = 'Generating...'; btn.disabled = true; }

  try {
    const profit_avg = (r.profit_min + r.profit_max) / 2;
    const roi = Math.round(profit_avg / p.campaign.ad_price * 100);
    const body = {
      channel_name:       _fetchedName || p.blogger.name || '',
      channel_url:        _fetchedUrl  || p.blogger.link || '',
      platform:           p.blogger.platform,
      views:              p.blogger.views,
      followers:          p.blogger.followers || 0,
      ad_price:           p.campaign.ad_price,
      engagement_rate:    r.engagement_rate,
      subscribers_min:    r.subscribers_min,
      subscribers_max:    r.subscribers_max,
      sales_min:          r.sales_min,
      sales_max:          r.sales_max,
      profit_min:         r.profit_min,
      profit_max:         r.profit_max,
      roi,
      audience_quality:   r.audience_quality,
      risk_level:         r.risk_level,
      recommendation:     r.recommendation,
      recommendation_label: r.recommendation_label,
    };
    const res = await fetch('/api/export-pdf', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) { showToast('PDF error'); return; }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'influenceiq-report.pdf';
    a.click();
    showToast('PDF downloaded!');
  } catch(e) { showToast('Download failed'); }
  finally { if (btn) { btn.textContent = '↓ Download Report'; btn.disabled = false; } }
}

// Store last result for PDF
const _origRenderResult = window.renderResult || function(){};
// patch after renderResult call — hook into submit handler instead
const _origSubmit = form?.onsubmit;

// ═══════════════════════════════════════════════════════════════
// WATCHLIST
// ═══════════════════════════════════════════════════════════════
async function loadWatchlist() {
  const token = localStorage.getItem('iq_token');
  const box = document.getElementById('watchlist-cards');
  const section = document.getElementById('watchlist-section');
  if (!box || !section) return;

  if (!token) { section.style.display = 'none'; return; }
  section.style.display = '';

  box.innerHTML = '<div style="color:var(--t3);font-size:13px;padding:8px 0">Loading...</div>';

  try {
    const res = await fetch('/api/watchlist', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) { section.style.display='none'; return; }
    const items = await res.json();

    if (!items.length) {
      box.innerHTML = `<div style="color:var(--t3);font-size:13px;padding:4px 0">No channels yet. Load a YouTube channel and click "+ Watchlist".</div>`;
      return;
    }

    box.innerHTML = items.map(it => `
      <div class="wl-card" data-id="${it.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px">
          <div style="min-width:0">
            <div style="font-size:13.5px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.channel_name||it.channel_url}</div>
            <div style="font-size:11px;color:var(--t3);margin-top:2px">${it.refreshed_at ? 'Updated '+new Date(it.refreshed_at).toLocaleDateString() : 'Never refreshed'}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="wl-btn" title="Refresh" onclick="refreshWatchlistItem(${it.id},this)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            </button>
            <button class="wl-btn danger" title="Remove" onclick="removeWatchlistItem(${it.id},this)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div class="wl-metric"><div class="wl-mlabel">Subscribers</div><div class="wl-mval">${it.subscribers!=null?(it.subscribers/1000).toFixed(0)+'K':'—'}</div></div>
          <div class="wl-metric"><div class="wl-mlabel">Avg Views</div><div class="wl-mval">${it.avg_views!=null?(it.avg_views/1000).toFixed(0)+'K':'—'}</div></div>
          <div class="wl-metric"><div class="wl-mlabel">ER</div><div class="wl-mval">${it.avg_er!=null?it.avg_er+'%':'—'}</div></div>
        </div>
        <button onclick="quickAnalyze('${(it.channel_url||'').replace(/'/g,"\\'")}',this)"
          style="width:100%;margin-top:10px;padding:8px;border-radius:10px;border:1px solid var(--border);background:transparent;font-size:12.5px;font-weight:600;color:var(--t1);cursor:pointer;font-family:inherit;transition:background .15s"
          onmouseover="this.style.background='var(--bg-gray)'" onmouseout="this.style.background='transparent'">
          Analyze →
        </button>
      </div>
    `).join('');
  } catch(e) { box.innerHTML = '<div style="color:var(--t3);font-size:13px">Failed to load</div>'; }
}

async function addToWatchlist(url, name, btn) {
  const token = localStorage.getItem('iq_token');
  if (!token) { showToast('Sign in to use watchlist'); return; }
  if (btn) { btn.textContent = 'Adding...'; btn.disabled = true; }
  try {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ url }),
    });
    const d = await res.json();
    if (res.status === 400) { showToast('Already in watchlist'); return; }
    if (!res.ok) { showToast('Error adding to watchlist'); return; }
    showToast('Added to watchlist!');
    if (btn) { btn.textContent = 'Added'; btn.style.color='#1a7a35'; btn.style.borderColor='#1a7a35'; }
    loadWatchlist();
  } catch(e) { showToast('Error'); }
  finally { if (btn) btn.disabled = false; }
}

async function removeWatchlistItem(id, btn) {
  const token = localStorage.getItem('iq_token');
  if (!token) return;
  const card = btn.closest('.wl-card');
  card.style.opacity = '0'; card.style.transition = 'opacity .25s';
  await fetch(`/api/watchlist/${id}`, { method: 'DELETE', headers: {'Authorization':'Bearer '+token} });
  setTimeout(() => card.remove(), 250);
  showToast('Removed from watchlist');
}

async function refreshWatchlistItem(id, btn) {
  const token = localStorage.getItem('iq_token');
  if (!token) return;
  btn.style.opacity = '.4'; btn.disabled = true;
  try {
    await fetch(`/api/watchlist/${id}/refresh`, { method:'POST', headers:{'Authorization':'Bearer '+token} });
    showToast('Stats refreshed');
    loadWatchlist();
  } catch(e) { showToast('Refresh failed'); }
  finally { btn.style.opacity='1'; btn.disabled=false; }
}

async function quickAnalyze(url, btn) {
  if (!url) return;
  // Scroll to analyze section and fill
  const section = document.getElementById('page-analyze');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    if (linkInput) { linkInput.value = url; fetchBtn?.click(); }
  }, 600);
}

// Init watchlist on page load + after auth changes
document.addEventListener('DOMContentLoaded', () => { setTimeout(loadWatchlist, 500); });
window.addEventListener('iq_auth_change', loadWatchlist);
