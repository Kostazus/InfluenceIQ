// ── History page JS ───────────────────────────────────────────

let allRows = [];
let currentFilter = 'all';

// ── Load history ──────────────────────────────────────────────
async function loadHistory() {
  try {
    const res  = await fetch('/api/history?limit=200');
    allRows    = await res.json();

    if (!allRows.length) {
      document.getElementById('cardsGrid').innerHTML = '';
      document.getElementById('emptyHistory').classList.remove('hidden');
      return;
    }

    updateStats(allRows);
    renderCards(allRows);
  } catch(e) {
    document.getElementById('cardsGrid').innerHTML =
      '<div class="loading-state"><p>Failed to load history</p></div>';
  }
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats(rows) {
  document.getElementById('statTotal').textContent = rows.length;

  const profits = rows.map(r => {
    const lo = r.result.profit_min;
    const hi = r.result.profit_max;
    return (lo + hi) / 2;
  });

  const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
  const bestProfit = Math.max(...profits);
  const successCount = rows.filter(r => r.result.recommendation === 'take').length;
  const successRate = Math.round((successCount / rows.length) * 100);

  document.getElementById('statProfit').textContent =
    (avgProfit >= 0 ? '+' : '') + '$' + Math.abs(Math.round(avgProfit)).toLocaleString();

  document.getElementById('statRoi').textContent =
    '+$' + Math.round(bestProfit).toLocaleString();

  document.getElementById('statSuccess').textContent = successRate + '%';
}

// ── Render cards ──────────────────────────────────────────────
function renderCards(rows) {
  const grid = document.getElementById('cardsGrid');

  if (!rows.length) {
    grid.innerHTML = '<div class="loading-state"><p>No results for this filter</p></div>';
    return;
  }

  grid.innerHTML = rows.map((r, i) => {
    const res   = r.result;
    const date  = new Date(r.created).toLocaleDateString('en', { day:'numeric', month:'short', year:'numeric' });
    const profit_avg = (res.profit_min + res.profit_max) / 2;
    const profit_str = (profit_avg >= 0 ? '+' : '') + '$' + Math.abs(Math.round(profit_avg)).toLocaleString();
    const profit_cls = profit_avg >= 0 ? 'positive' : 'negative';

    return `
      <div class="h-card" style="animation-delay:${i * 0.04}s" onclick="openDetail(${i})">
        <div class="h-card-top">
          <div class="h-platform">
            <span class="h-platform-badge platform-${r.platform}">${r.platform.toUpperCase()}</span>
          </div>
          <span class="h-date">${date}</span>
        </div>

        <div class="h-card-metrics">
          <div class="h-metric">
            <div class="h-metric-label">👥 Followers</div>
            <div class="h-metric-val">+${res.subscribers_min}–${res.subscribers_max}</div>
          </div>
          <div class="h-metric">
            <div class="h-metric-label">💰 Sales</div>
            <div class="h-metric-val">${res.sales_min}–${res.sales_max}</div>
          </div>
          <div class="h-metric">
            <div class="h-metric-label">📈 Profit</div>
            <div class="h-metric-val ${profit_cls}">${profit_str}</div>
          </div>
        </div>

        <div class="h-card-footer">
          <span class="h-rec-badge ${res.recommendation}">${res.recommendation_label}</span>
          <div class="h-card-btns" onclick="event.stopPropagation()">
            <button class="h-btn" title="View details" onclick="openDetail(${i})">👁</button>
            <button class="h-btn" title="Repeat analysis" onclick="repeatAnalysis(${i})">↺</button>
            <button class="h-btn danger" title="Delete" onclick="deleteRow(${r.id}, this)">🗑</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Scroll reveal
  setTimeout(() => {
    document.querySelectorAll('.h-card').forEach(el => {
      el.style.opacity = '1';
    });
  }, 50);
}

// ── Filter ────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;

    const filtered = currentFilter === 'all'
      ? allRows
      : allRows.filter(r => r.result.recommendation === currentFilter);

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
    r.platform.toUpperCase() + ' · ' + date;

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-label">RECOMMENDATION</div>
      <span class="h-rec-badge ${res.recommendation}" style="font-size:13px;padding:7px 16px">${res.recommendation_label}</span>
    </div>

    <div class="detail-section">
      <div class="detail-section-label">FORECAST</div>
      <div class="detail-metrics">
        <div class="detail-metric">
          <div class="dm-label">👥 New Followers</div>
          <div class="dm-val">+${res.subscribers_min}–${res.subscribers_max}</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">💰 Sales</div>
          <div class="dm-val">${res.sales_min}–${res.sales_max} units</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">📈 Profit Min</div>
          <div class="dm-val">${res.profit_min >= 0 ? '+' : ''}$${Math.abs(Math.round(res.profit_min)).toLocaleString()}</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">📈 Profit Max</div>
          <div class="dm-val">${res.profit_max >= 0 ? '+' : ''}$${Math.abs(Math.round(res.profit_max)).toLocaleString()}</div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-label">BLOGGER QUALITY</div>
      <div class="detail-metrics">
        <div class="detail-metric">
          <div class="dm-label">ER Rate</div>
          <div class="dm-val">${res.engagement_rate}%</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">Audience</div>
          <div class="dm-val" style="font-size:1rem">${res.audience_quality}</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">Risk</div>
          <div class="dm-val" style="font-size:1rem">${res.risk_level}</div>
        </div>
        <div class="detail-metric">
          <div class="dm-label">Stability</div>
          <div class="dm-val">${Math.round(res.stability_score * 100)}%</div>
        </div>
      </div>
    </div>

    <button class="detail-repeat-btn" onclick="repeatAnalysis(${idx}); closeDetail()">
      ↺ Repeat This Analysis
    </button>
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

document.getElementById('detail-overlay').addEventListener('click', e => {
  if (e.target.id === 'detail-overlay') closeDetail();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

// ── Repeat analysis ───────────────────────────────────────────
function repeatAnalysis(idx) {
  const r = allRows[idx];
  // Сохраняем данные в sessionStorage и переходим на главную
  sessionStorage.setItem('iq_repeat', JSON.stringify(r));
  window.location.href = '/#app';
}

// ── Delete ────────────────────────────────────────────────────
async function deleteRow(id, btn) {
  try {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
    allRows = allRows.filter(r => r.id !== id);
    const card = btn.closest('.h-card');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => card.remove(), 300);
    updateStats(allRows);
    showToast('Analysis deleted');
  } catch(e) {
    showToast('Failed to delete');
  }
}

// ── Export CSV ────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!allRows.length) { showToast('No data to export'); return; }

  const header = 'Date,Platform,Views,Ad Price,Subs Min,Subs Max,Sales Min,Sales Max,Profit Min,Profit Max,ER,Recommendation\n';
  const lines  = allRows.map(r => {
    const d = r.result;
    return [
      new Date(r.created).toLocaleString(),
      r.platform, r.views, r.ad_price,
      d.subscribers_min, d.subscribers_max,
      d.sales_min, d.sales_max,
      d.profit_min, d.profit_max,
      d.engagement_rate, d.recommendation
    ].join(',');
  }).join('\n');

  const blob = new Blob([header + lines], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'influenceiq_history.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported!');
});

// ── Clear all ─────────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', async () => {
  if (!confirm('Delete all history? This cannot be undone.')) return;
  try {
    await fetch('/api/history/clear', { method: 'DELETE' });
    allRows = [];
    document.getElementById('cardsGrid').innerHTML = '';
    document.getElementById('emptyHistory').classList.remove('hidden');
    showToast('History cleared');
  } catch(e) {
    showToast('Error');
  }
});

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const existing = document.getElementById('iq-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'iq-toast'; toast.className = 'iq-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
}

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Init
loadHistory();
