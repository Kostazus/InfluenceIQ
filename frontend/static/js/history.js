// InfluenceIQ — history.js

let allRows = [];
let currentFilter = 'all';
let compareSet = new Set(); // ids selected for compare
let trendChart = null;

function authHeaders() {
  const token = localStorage.getItem('iq_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// ── Load ──────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const res = await fetch('/api/history?limit=200', { headers: authHeaders() });
    allRows = await res.json();
    if (!allRows.length) {
      document.getElementById('cardsGrid').innerHTML = '';
      document.getElementById('emptyHistory').classList.remove('hidden');
      updateStats([]);
      renderTrendChart([]);
      return;
    }
    document.getElementById('emptyHistory').classList.add('hidden');
    updateStats(allRows);
    renderCards(allRows);
    renderTrendChart(allRows);
  } catch(e) {
    document.getElementById('cardsGrid').innerHTML =
      '<div class="loading-state"><p>Failed to load history</p></div>';
  }
}

// ── Stats bar ─────────────────────────────────────────────────
function updateStats(rows) {
  const total = rows.length;
  const profits = rows.map(r => (r.result.profit_min + r.result.profit_max) / 2);
  const avgProfit = total ? profits.reduce((a,b)=>a+b,0)/total : 0;
  const bestProfit = total ? Math.max(...profits) : 0;
  const successRate = total ? Math.round(rows.filter(r=>r.result.recommendation==='take').length/total*100) : 0;

  document.getElementById('statTotal').textContent  = total;
  document.getElementById('statProfit').textContent = (avgProfit>=0?'+':'')+fmtMoney(avgProfit);
  document.getElementById('statRoi').textContent    = '+'+fmtMoney(bestProfit);
  document.getElementById('statSuccess').textContent = successRate+'%';
}

function fmtMoney(n) {
  return '$'+Math.abs(Math.round(n)).toLocaleString();
}

// ── Trend chart ───────────────────────────────────────────────
function renderTrendChart(rows) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  // Take last 20, chronological order
  const data = [...rows].reverse().slice(-20);
  const labels = data.map(r => {
    const d = new Date(r.created);
    return (d.getMonth()+1)+'/'+d.getDate();
  });
  const profits = data.map(r => Math.round((r.result.profit_min + r.result.profit_max) / 2));

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Avg Profit',
        data: profits,
        borderColor: '#1d1d1f',
        backgroundColor: 'rgba(29,29,31,.06)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: profits.map(p => p >= 0 ? '#34c759' : '#ff3b30'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => (ctx.parsed.y>=0?'+':'')+'$'+Math.abs(ctx.parsed.y).toLocaleString() }
      }},
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#aeaeb2' } },
        y: {
          grid: { color: 'rgba(0,0,0,.05)' },
          ticks: { font: { size: 11 }, color: '#aeaeb2',
            callback: v => (v>=0?'+':'')+fmtMoney(v) }
        }
      }
    }
  });
}

// ── Render cards ──────────────────────────────────────────────
function renderCards(rows) {
  const grid = document.getElementById('cardsGrid');
  if (!rows.length) {
    grid.innerHTML = '<div class="loading-state"><p>No results for this filter</p></div>';
    return;
  }
  grid.innerHTML = rows.map((r, i) => {
    const res = r.result;
    const date = new Date(r.created).toLocaleDateString('en', {day:'numeric',month:'short',year:'numeric'});
    const profit_avg = (res.profit_min + res.profit_max) / 2;
    const profit_str = (profit_avg>=0?'+':'')+fmtMoney(profit_avg);
    const profit_cls = profit_avg >= 0 ? 'positive' : 'negative';
    const isCompare  = compareSet.has(r.id);
    const name = r.channel_name || r.platform.toUpperCase();
    const er   = res.engagement_rate ? res.engagement_rate+'%' : '—';

    return `
      <div class="h-card ${isCompare?'compare-selected':''}" style="animation-delay:${i*.04}s" onclick="openDetail(${i})">
        <div class="h-card-top">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            <span class="h-platform-badge platform-${r.platform}">${r.platform.toUpperCase()}</span>
            <span style="font-size:12px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px" title="${name}">${name}</span>
          </div>
          <span class="h-date">${date}</span>
        </div>

        <div class="h-card-metrics">
          <div class="h-metric">
            <div class="h-metric-label">Followers</div>
            <div class="h-metric-val">+${res.subscribers_min}–${res.subscribers_max}</div>
          </div>
          <div class="h-metric">
            <div class="h-metric-label">Sales</div>
            <div class="h-metric-val">${res.sales_min}–${res.sales_max}</div>
          </div>
          <div class="h-metric">
            <div class="h-metric-label">Profit</div>
            <div class="h-metric-val ${profit_cls}">${profit_str}</div>
          </div>
          <div class="h-metric">
            <div class="h-metric-label">ER</div>
            <div class="h-metric-val">${er}</div>
          </div>
        </div>

        <div class="h-card-footer">
          <span class="h-rec-badge ${res.recommendation}">${res.recommendation_label}</span>
          <div class="h-card-btns" onclick="event.stopPropagation()">
            <button class="h-btn ${isCompare?'active':''}" title="Compare" onclick="toggleCompare(${r.id}, this)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            </button>
            <button class="h-btn" title="View details" onclick="openDetail(${i})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="h-btn" title="Repeat" onclick="repeatAnalysis(${i})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            </button>
            <button class="h-btn danger" title="Delete" onclick="deleteRow(${r.id}, this)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => { document.querySelectorAll('.h-card').forEach(el => el.style.opacity='1'); }, 50);
  updateCompareBar();
}

// ── Compare ───────────────────────────────────────────────────
function toggleCompare(id, btn) {
  if (compareSet.has(id)) {
    compareSet.delete(id);
  } else {
    if (compareSet.size >= 2) {
      showToast('Select max 2 analyses to compare');
      return;
    }
    compareSet.add(id);
  }
  // re-render cards to update styles
  const filtered = currentFilter === 'all' ? allRows : allRows.filter(r => r.result.recommendation === currentFilter);
  renderCards(filtered);
}

function updateCompareBar() {
  let bar = document.getElementById('compareBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'compareBar';
    bar.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:var(--t1);color:#fff;border-radius:99px;
      padding:12px 22px;display:flex;align-items:center;gap:16px;
      box-shadow:0 8px 32px rgba(0,0,0,.22);z-index:500;
      font-size:13.5px;font-weight:600;white-space:nowrap;
      transition:opacity .25s, transform .25s;
    `;
    document.body.appendChild(bar);
  }

  if (compareSet.size === 0) {
    bar.style.opacity = '0';
    bar.style.transform = 'translateX(-50%) translateY(20px)';
    bar.style.pointerEvents = 'none';
  } else if (compareSet.size === 1) {
    bar.style.opacity = '1';
    bar.style.transform = 'translateX(-50%) translateY(0)';
    bar.style.pointerEvents = 'all';
    bar.innerHTML = `<span>1 selected — pick one more to compare</span>
      <button onclick="compareSet.clear();renderCards(allRows)" style="background:rgba(255,255,255,.2);border:none;border-radius:99px;padding:5px 13px;color:#fff;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">Clear</button>`;
  } else {
    bar.style.opacity = '1';
    bar.style.transform = 'translateX(-50%) translateY(0)';
    bar.style.pointerEvents = 'all';
    bar.innerHTML = `<span>2 selected</span>
      <button onclick="openCompareModal()" style="background:#fff;border:none;border-radius:99px;padding:6px 16px;color:var(--t1);font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit">Compare →</button>
      <button onclick="compareSet.clear();renderCards(allRows)" style="background:rgba(255,255,255,.15);border:none;border-radius:99px;padding:5px 13px;color:#fff;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">Clear</button>`;
  }
}

function openCompareModal() {
  const ids = [...compareSet];
  const a   = allRows.find(r => r.id === ids[0]);
  const b   = allRows.find(r => r.id === ids[1]);
  if (!a || !b) return;

  const overlay = document.getElementById('compare-overlay');
  if (!overlay) return;

  const nameA = a.channel_name || a.platform.toUpperCase();
  const nameB = b.channel_name || b.platform.toUpperCase();

  function row(label, va, vb, higherBetter = true) {
    const numA = parseFloat(String(va).replace(/[^0-9.-]/g,''));
    const numB = parseFloat(String(vb).replace(/[^0-9.-]/g,''));
    const aWins = higherBetter ? numA > numB : numA < numB;
    const bWins = higherBetter ? numB > numA : numB < numA;
    return `<tr>
      <td style="padding:10px 14px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--border)">${label}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:${aWins?'700':'400'};color:${aWins?'var(--t1)':'var(--t2)'};border-bottom:1px solid var(--border);text-align:center">${va}${aWins?' ✓':''}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:${bWins?'700':'400'};color:${bWins?'var(--t1)':'var(--t2)'};border-bottom:1px solid var(--border);text-align:center">${vb}${bWins?' ✓':''}</td>
    </tr>`;
  }

  const ra = a.result, rb = b.result;
  const profA = Math.round((ra.profit_min+ra.profit_max)/2);
  const profB = Math.round((rb.profit_min+rb.profit_max)/2);
  const erA = ra.engagement_rate ?? '—';
  const erB = rb.engagement_rate ?? '—';

  document.getElementById('compare-body').innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:2px solid var(--border)">
          <th style="padding:10px 14px;font-size:11px;text-transform:uppercase;color:var(--t3);text-align:left;font-weight:600">Metric</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:700;color:var(--t1);text-align:center;max-width:120px">${nameA}</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:700;color:var(--t1);text-align:center;max-width:120px">${nameB}</th>
        </tr>
      </thead>
      <tbody>
        ${row('Engagement Rate', erA+'%', erB+'%')}
        ${row('New Followers', '+'+ra.subscribers_min+'–'+ra.subscribers_max, '+'+rb.subscribers_min+'–'+rb.subscribers_max)}
        ${row('Sales Forecast', ra.sales_min+'–'+ra.sales_max, rb.sales_min+'–'+rb.sales_max)}
        ${row('Avg Profit', (profA>=0?'+':'')+'$'+Math.abs(profA).toLocaleString(), (profB>=0?'+':'')+'$'+Math.abs(profB).toLocaleString())}
        ${row('ROI', Math.round(profA/a.ad_price*100)+'%', Math.round(profB/b.ad_price*100)+'%')}
        ${row('Risk', ra.risk_level, rb.risk_level, false)}
        ${row('Stability', Math.round(ra.stability_score*100)+'%', Math.round(rb.stability_score*100)+'%')}
        ${row('Recommendation', ra.recommendation_label, rb.recommendation_label)}
      </tbody>
    </table>
  `;

  overlay.classList.add('active');
  setTimeout(() => document.getElementById('compare-modal').classList.add('active'), 10);
}

function closeCompareModal() {
  const overlay = document.getElementById('compare-overlay');
  document.getElementById('compare-modal').classList.remove('active');
  setTimeout(() => overlay.classList.remove('active'), 350);
}

// ── Filter ────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    const filtered = currentFilter === 'all' ? allRows : allRows.filter(r => r.result.recommendation === currentFilter);
    renderCards(filtered);
  });
});

// ── Detail modal ──────────────────────────────────────────────
function openDetail(idx) {
  const r   = allRows[idx];
  const res = r.result;
  const overlay = document.getElementById('detail-overlay');
  const modal   = document.getElementById('detail-modal');
  const date    = new Date(r.created).toLocaleString('en');

  document.getElementById('detail-title').textContent =
    (r.channel_name || r.platform.toUpperCase()) + ' · ' + date;

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-label">RECOMMENDATION</div>
      <span class="h-rec-badge ${res.recommendation}" style="font-size:13px;padding:7px 16px">${res.recommendation_label}</span>
    </div>
    ${r.channel_url ? `<div class="detail-section"><a href="${r.channel_url}" target="_blank" style="font-size:13px;color:var(--blue);text-decoration:none;word-break:break-all">${r.channel_url}</a></div>` : ''}
    <div class="detail-section">
      <div class="detail-section-label">FORECAST</div>
      <div class="detail-metrics">
        <div class="detail-metric"><div class="dm-label">New Followers</div><div class="dm-val">+${res.subscribers_min}–${res.subscribers_max}</div></div>
        <div class="detail-metric"><div class="dm-label">Sales</div><div class="dm-val">${res.sales_min}–${res.sales_max}</div></div>
        <div class="detail-metric"><div class="dm-label">Profit Min</div><div class="dm-val">${res.profit_min>=0?'+':''}$${Math.abs(Math.round(res.profit_min)).toLocaleString()}</div></div>
        <div class="detail-metric"><div class="dm-label">Profit Max</div><div class="dm-val">${res.profit_max>=0?'+':''}$${Math.abs(Math.round(res.profit_max)).toLocaleString()}</div></div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-label">QUALITY</div>
      <div class="detail-metrics">
        <div class="detail-metric"><div class="dm-label">ER</div><div class="dm-val">${res.engagement_rate != null ? res.engagement_rate+'%' : '—'}</div></div>
        <div class="detail-metric"><div class="dm-label">Audience</div><div class="dm-val">${res.audience_quality}</div></div>
        <div class="detail-metric"><div class="dm-label">Risk</div><div class="dm-val">${res.risk_level}</div></div>
        <div class="detail-metric"><div class="dm-label">Stability</div><div class="dm-val">${Math.round(res.stability_score*100)}%</div></div>
      </div>
    </div>
    <button class="detail-repeat-btn" onclick="repeatAnalysis(${idx}); closeDetail()">Repeat this analysis</button>
  `;

  overlay.classList.add('active');
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeDetail() {
  const overlay = document.getElementById('detail-overlay');
  const modal   = document.getElementById('detail-modal');
  modal.classList.remove('active');
  setTimeout(() => overlay.classList.remove('active'), 350);
}

document.getElementById('detail-overlay')?.addEventListener('click', e => {
  if (e.target.id === 'detail-overlay') closeDetail();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDetail(); closeCompareModal(); }
});

// ── Repeat ────────────────────────────────────────────────────
function repeatAnalysis(idx) {
  sessionStorage.setItem('iq_repeat', JSON.stringify(allRows[idx]));
  window.location.href = '/#app';
}

// ── Delete ────────────────────────────────────────────────────
async function deleteRow(id, btn) {
  try {
    await fetch(`/api/history/${id}`, { method: 'DELETE', headers: authHeaders() });
    allRows = allRows.filter(r => r.id !== id);
    compareSet.delete(id);
    const card = btn.closest('.h-card');
    card.style.opacity = '0'; card.style.transform = 'scale(0.95)';
    card.style.transition = 'all .3s ease';
    setTimeout(() => card.remove(), 300);
    updateStats(allRows);
    renderTrendChart(allRows);
    updateCompareBar();
    showToast('Deleted');
  } catch(e) { showToast('Failed to delete'); }
}

// ── Export CSV ────────────────────────────────────────────────
document.getElementById('exportBtn')?.addEventListener('click', () => {
  if (!allRows.length) { showToast('No data to export'); return; }
  const hdr = 'Date,Channel,Platform,Views,Ad Price,Subs Min,Subs Max,Sales Min,Sales Max,Profit Min,Profit Max,ER,Recommendation\n';
  const lines = allRows.map(r => {
    const d = r.result;
    return [
      new Date(r.created).toLocaleString(),
      (r.channel_name||'').replace(/,/g,' '),
      r.platform, r.views, r.ad_price,
      d.subscribers_min, d.subscribers_max,
      d.sales_min, d.sales_max,
      d.profit_min, d.profit_max,
      d.engagement_rate ?? '',
      d.recommendation,
    ].join(',');
  }).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([hdr+lines], {type:'text/csv'}));
  a.download = 'influenceiq_history.csv'; a.click();
  showToast('CSV exported!');
});

// ── Clear ─────────────────────────────────────────────────────
document.getElementById('clearBtn')?.addEventListener('click', async () => {
  if (!confirm('Delete all history?')) return;
  try {
    await fetch('/api/history/clear', { method: 'DELETE', headers: authHeaders() });
    allRows = []; compareSet.clear();
    document.getElementById('cardsGrid').innerHTML = '';
    document.getElementById('emptyHistory').classList.remove('hidden');
    updateStats([]);
    renderTrendChart([]);
    updateCompareBar();
    showToast('History cleared');
  } catch(e) { showToast('Error'); }
});

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const existing = document.getElementById('iq-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'iq-toast'; t.className = 'iq-toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}

// ── Init ──────────────────────────────────────────────────────
loadHistory();
