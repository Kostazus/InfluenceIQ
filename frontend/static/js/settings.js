// InfluenceIQ — settings.js
const HTML = `
<div id="sov" class="sov" onclick="if(event.target===this)closeSettings()">
<div id="smodal" class="smodal">

  <!-- ── HEADER ── -->
  <div style="
    display:flex;align-items:center;justify-content:space-between;
    padding:22px 24px 18px;
    border-bottom:1px solid rgba(0,0,0,.06);
  ">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="
        width:40px;height:40px;border-radius:14px;
        background:linear-gradient(135deg,#1d1d1f,#3a3a3c);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px rgba(0,0,0,.18);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      <div>
        <div style="font-size:16px;font-weight:700;letter-spacing:-.02em;color:var(--t1)">Settings</div>
        <div style="font-size:12px;color:rgba(0,0,0,.38);margin-top:1px">Customize your experience</div>
      </div>
    </div>
    <button id="s-x" style="
      width:32px;height:32px;border-radius:50%;border:none;
      background:rgba(0,0,0,.08);color:var(--t2);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:14px;transition:background .15s;
    " onmouseover="this.style.background='rgba(0,0,0,.14)'" onmouseout="this.style.background='rgba(0,0,0,.08)'">✕</button>
  </div>

  <!-- ── BODY ── -->
  <div style="padding:16px 20px;overflow-y:auto;max-height:calc(88vh - 130px);scrollbar-width:none">

    <!-- APPEARANCE -->
    <div style="margin-bottom:6px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.28);padding:0 4px">Appearance</div>
    <div class="s-group">

      <!-- Accent color -->
      <div class="s-row">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#f093fb,#f5576c)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <div class="s-row-label">Accent color</div>
        <div style="display:flex;align-items:center;gap:5px;margin-left:auto">
          <button class="sc on" id="sc0" data-c="#0071e3" style="background:#0071e3"></button>
          <button class="sc" id="sc1" data-c="#17C964" style="background:#17C964"></button>
          <button class="sc" id="sc2" data-c="#7C3AED" style="background:#7C3AED"></button>
          <button class="sc" id="sc3" data-c="#F5A524" style="background:#F5A524"></button>
          <button class="sc" id="sc4" data-c="#F31260" style="background:#F31260"></button>
          <input type="color" id="p-color" value="#0071e3" style="width:22px;height:22px;border-radius:50%;border:2px solid rgba(0,0,0,.12);padding:0;cursor:pointer;background:none">
        </div>
      </div>

      <div class="s-div"></div>

      <!-- Font size -->
      <div class="s-row">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
        </div>
        <div class="s-row-label">Font size</div>
        <div class="s-seg" id="fg">
          <button class="s-seg-b" data-v="small">S</button>
          <button class="s-seg-b on" data-v="medium">M</button>
          <button class="s-seg-b" data-v="large">L</button>
        </div>
      </div>

      <div class="s-div"></div>

      <!-- Corner style -->
      <div class="s-row">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#a18cd1,#fbc2eb)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
        </div>
        <div class="s-row-label">Corners</div>
        <div class="s-seg" id="cg">
          <button class="s-seg-b" data-v="sharp">Sharp</button>
          <button class="s-seg-b on" data-v="default">Default</button>
          <button class="s-seg-b" data-v="rounded">Round</button>
        </div>
      </div>

    </div>

    <!-- LANGUAGE -->
    <div style="margin:16px 0 6px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.28);padding:0 4px">Language & Region</div>
    <div class="s-group">

      <div class="s-row">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <div class="s-row-label">Language</div>
        <select id="p-lang" class="s-select">
          <option value="en">🇺🇸 English</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="uk">🇺🇦 Українська</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>

      <div class="s-div"></div>

      <div class="s-row">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#f6d365,#fda085)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="s-row-label">Currency</div>
        <select id="p-cur" class="s-select">
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="UAH">₴ UAH</option>
          <option value="GBP">£ GBP</option>
        </select>
      </div>

    </div>

    <!-- API -->
    <div style="margin:16px 0 6px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.28);padding:0 4px">API Keys</div>
    <div class="s-group" style="padding:14px 16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#ff416c,#ff4b2b)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
        </div>
        <div style="font-size:13.5px;font-weight:600;color:var(--t1)">YouTube API v3</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="password" id="p-yt" placeholder="AIzaSy..." style="
          flex:1;padding:9px 13px;border-radius:12px;
          border:1px solid rgba(0,0,0,.1);
          background:rgba(255,255,255,.55);
          font-size:13px;font-family:inherit;color:var(--t1);
          outline:none;
        " onfocus="this.style.borderColor='var(--blue)';this.style.boxShadow='0 0 0 3px rgba(0,113,227,.12)'" onblur="this.style.borderColor='rgba(0,0,0,.1)';this.style.boxShadow='none'">
        <button id="yt-eye" style="
          width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.1);
          background:rgba(255,255,255,.55);cursor:pointer;font-size:15px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;
        " onmouseover="this.style.background='rgba(255,255,255,.8)'" onmouseout="this.style.background='rgba(255,255,255,.55)'">👁</button>
        <button id="yt-save" style="
          padding:9px 16px;border-radius:12px;border:none;
          background:var(--t1);color:#fff;font-size:13px;font-weight:600;
          cursor:pointer;font-family:inherit;white-space:nowrap;transition:opacity .15s;
        " onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">Save</button>
      </div>
      <div id="yt-st" style="font-size:12px;margin-top:7px;color:#1a7a35;font-weight:500"></div>
    </div>

    <!-- DATA -->
    <div style="margin:16px 0 6px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.28);padding:0 4px">Data</div>
    <div class="s-group">

      <div class="s-row" id="s-export" style="cursor:pointer" onmouseover="this.style.background='rgba(0,0,0,.02)'" onmouseout="this.style.background=''">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#0ba360,#3cba92)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="s-row-label">Export CSV</div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="2" style="margin-left:auto"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <div class="s-div"></div>

      <div class="s-row" id="s-clear" style="cursor:pointer" onmouseover="this.style.background='rgba(255,59,48,.04)'" onmouseout="this.style.background=''">
        <div class="s-row-icon" style="background:linear-gradient(135deg,#ff416c,#ff4b2b)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </div>
        <div class="s-row-label" style="color:#ff3b30">Clear history</div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,59,48,.4)" stroke-width="2" style="margin-left:auto"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

    </div>

    <div style="height:8px"></div>

  </div>

  <!-- ── FOOTER ── -->
  <div style="
    padding:14px 22px;
    border-top:1px solid rgba(0,0,0,.06);
    display:flex;align-items:center;justify-content:space-between;
  ">
    <span style="font-size:11.5px;color:rgba(0,0,0,.28)">InfluenceIQ v1.0 · 2026</span>
    <button id="s-done" style="
      padding:9px 24px;border-radius:99px;border:none;
      background:var(--t1);color:#fff;font-size:13.5px;font-weight:600;
      cursor:pointer;font-family:inherit;transition:opacity .15s;
    " onmouseover="this.style.opacity='.82'" onmouseout="this.style.opacity='1'">Done</button>
  </div>

</div>
</div>`;

// Inject styles
document.head.insertAdjacentHTML('beforeend',`<style>
.s-group {
  background:rgba(255,255,255,.52);
  border:1px solid rgba(255,255,255,.68);
  border-radius:18px;
  overflow:hidden;
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
}
.s-row {
  display:flex;align-items:center;gap:12px;
  padding:12px 16px;
  transition:background .15s;
}
.s-row-icon {
  width:30px;height:30px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,.15);
}
.s-row-label { font-size:13.5px;font-weight:500;color:var(--t1); }
.s-div { height:1px;background:rgba(0,0,0,.055);margin:0 16px; }
.sc {
  width:22px;height:22px;border-radius:50%;border:2px solid transparent;
  cursor:pointer;transition:transform .15s,border-color .15s;flex-shrink:0;
}
.sc.on { border-color:var(--t1);transform:scale(1.18); }
.sc:hover { transform:scale(1.1); }
.s-select {
  padding:7px 28px 7px 11px;border-radius:10px;
  border:1px solid rgba(0,0,0,.1);
  background:rgba(255,255,255,.55) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236e6e73' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;
  font-size:13px;font-family:inherit;color:var(--t1);
  outline:none;cursor:pointer;margin-left:auto;
  -webkit-appearance:none;appearance:none;
}
.s-seg {
  display:flex;gap:2px;background:rgba(0,0,0,.07);border-radius:9px;padding:2px;margin-left:auto;
}
.s-seg-b {
  padding:5px 12px;border-radius:7px;font-size:12px;font-weight:500;
  color:rgba(0,0,0,.45);border:none;background:transparent;cursor:pointer;
  font-family:inherit;transition:all .18s;
}
.s-seg-b.on { background:#fff;color:var(--t1);font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.1); }
</style>`);

document.body.insertAdjacentHTML('beforeend', HTML);

// ── Open / Close ──
function openSettings(){
  document.getElementById('sov').classList.add('on');
  syncUI();
}
function closeSettings(){
  document.getElementById('sov').classList.remove('on');
}
document.getElementById('s-x').onclick = closeSettings;
document.getElementById('s-done').onclick = closeSettings;
document.addEventListener('keydown', e => { if(e.key==='Escape') closeSettings(); });

// ── Accent color ──
function applyAccent(hex){
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  const d=document.documentElement;
  d.style.setProperty('--blue', hex);
  d.style.setProperty('--blue-soft', `rgba(${r},${g},${b},.10)`);
  d.style.setProperty('--blue-glow', `rgba(${r},${g},${b},.22)`);
  localStorage.setItem('iq_accent', hex);
}
document.querySelectorAll('.sc').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.sc').forEach(s => s.classList.remove('on'));
    b.classList.add('on');
    applyAccent(b.dataset.c);
    document.getElementById('p-color').value = b.dataset.c;
    window.showToast && showToast('Color updated ✓');
  };
});
document.getElementById('p-color').oninput = e => {
  document.querySelectorAll('.sc').forEach(s => s.classList.remove('on'));
  applyAccent(e.target.value);
};

// ── Font size ──
function applyFont(v){
  document.documentElement.style.fontSize = {small:'12px', medium:'13px', large:'15px'}[v] || '13px';
  localStorage.setItem('iq_font', v);
}
document.querySelectorAll('#fg .s-seg-b').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('#fg .s-seg-b').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    applyFont(b.dataset.v);
    window.showToast && showToast('Font size updated ✓');
  };
});

// ── Corner style ──
function applyCorner(v){
  const m = {
    sharp:   {sm:'6px',  md:'10px', lg:'14px', xl:'18px'},
    default: {sm:'12px', md:'18px', lg:'24px', xl:'32px'},
    rounded: {sm:'18px', md:'26px', lg:'34px', xl:'44px'},
  };
  const s = m[v] || m.default;
  const d = document.documentElement;
  Object.entries(s).forEach(([k,v]) => d.style.setProperty(`--r-${k}`, v));
  localStorage.setItem('iq_corner', v);
}
document.querySelectorAll('#cg .s-seg-b').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('#cg .s-seg-b').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    applyCorner(b.dataset.v);
    window.showToast && showToast('Corner style updated ✓');
  };
});

// ── Language ──
document.getElementById('p-lang').onchange = e => {
  localStorage.setItem('iq_lang', e.target.value);
  window.showToast && showToast('Language saved ✓');
};

// ── Currency ──
document.getElementById('p-cur').onchange = e => {
  const m = {'USD':'$','EUR':'€','UAH':'₴','GBP':'£'};
  window.IQ_CUR = m[e.target.value] || '$';
  localStorage.setItem('iq_cur', e.target.value);
  window.showToast && showToast('Currency: ' + window.IQ_CUR + ' ✓');
};

// ── YouTube API ──
document.getElementById('yt-eye').onclick = () => {
  const i = document.getElementById('p-yt');
  i.type = i.type === 'password' ? 'text' : 'password';
};
document.getElementById('yt-save').onclick = () => {
  const v = document.getElementById('p-yt').value.trim();
  if(!v) return;
  localStorage.setItem('iq_yt', v);
  document.getElementById('yt-st').textContent = '✓ Saved';
  window.showToast && showToast('YouTube key saved ✓');
};

// ── Export ──
document.getElementById('s-export').onclick = async () => {
  try {
    const res = await fetch('/api/history?limit=1000');
    const rows = await res.json();
    if(!rows.length){ window.showToast && showToast('No data yet'); return; }
    const hdr = 'Date,Platform,Views,Ad Spend,Recommendation\n';
    const body = rows.map(r => [r.created, r.platform, r.views, r.ad_price, r.result?.recommendation||''].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([hdr+body], {type:'text/csv'}));
    a.download = 'influenceiq-export.csv';
    a.click();
    window.showToast && showToast('Exported! ✓');
  } catch(e) { window.showToast && showToast('Export failed'); }
};

// ── Clear history ──
document.getElementById('s-clear').onclick = async () => {
  if(!confirm('Delete all analysis history?')) return;
  try {
    await fetch('/api/history/clear', {method:'DELETE'});
    window.showToast && showToast('History cleared ✓');
  } catch(e) { window.showToast && showToast('Error clearing history'); }
};

// ── Sync UI from localStorage ──
function syncUI(){
  const acc = localStorage.getItem('iq_accent') || '#0071e3';
  document.getElementById('p-color').value = acc;
  document.querySelectorAll('.sc').forEach(s => s.classList.toggle('on', s.dataset.c === acc));

  const cor = localStorage.getItem('iq_corner') || 'default';
  document.querySelectorAll('#cg .s-seg-b').forEach(b => b.classList.toggle('on', b.dataset.v === cor));

  const fnt = localStorage.getItem('iq_font') || 'medium';
  document.querySelectorAll('#fg .s-seg-b').forEach(b => b.classList.toggle('on', b.dataset.v === fnt));

  document.getElementById('p-lang').value = localStorage.getItem('iq_lang') || 'en';
  document.getElementById('p-cur').value  = localStorage.getItem('iq_cur')  || 'USD';

  const yt = localStorage.getItem('iq_yt');
  if(yt) document.getElementById('p-yt').value = yt;
}

// ── Init on load ──
(function init(){
  const acc = localStorage.getItem('iq_accent'); if(acc) applyAccent(acc);
  const cor = localStorage.getItem('iq_corner'); if(cor) applyCorner(cor);
  const fnt = localStorage.getItem('iq_font');   if(fnt) applyFont(fnt);
  const cur = localStorage.getItem('iq_cur');
  if(cur){ const m={'USD':'$','EUR':'€','UAH':'₴','GBP':'£'}; window.IQ_CUR = m[cur]||'$'; }
})();
