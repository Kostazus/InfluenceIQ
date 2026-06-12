// InfluenceIQ — settings.js
document.body.insertAdjacentHTML('beforeend',`
<div id="sov" class="sov">
<div id="smodal" class="smodal" style="scrollbar-width:none">
  <!-- Header -->
  <div class="sh">
    <div class="sh-l">
      <div style="width:36px;height:36px;border-radius:12px;background:rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;font-size:16px">⚙️</div>
      <div><div class="sh-title">Settings</div><div class="sh-sub">Customize your experience</div></div>
    </div>
    <button class="s-x" id="s-x">✕</button>
  </div>

  <div class="sbody" style="gap:0;padding:16px 20px 20px">

    <!-- PERSONALIZATION -->
    <div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:10px;padding:0 4px">Personalization</div>

      <div style="background:rgba(255,255,255,.45);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.6)">
        <!-- Name -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div>
            <div style="font-size:13.5px;font-weight:500;color:var(--t1)">Your name</div>
            <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Shown in greetings</div>
          </div>
          <input type="text" class="sinput" id="p-name" placeholder="Your name" style="max-width:150px;background:rgba(255,255,255,.5);border-color:rgba(0,0,0,.1);font-size:13px;padding:7px 11px">
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>

        <!-- Accent color -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div>
            <div style="font-size:13.5px;font-weight:500;color:var(--t1)">Accent color</div>
            <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Highlight color</div>
          </div>
          <div class="swatches" style="gap:6px">
            <button class="sw on" data-c="#0071e3" style="background:#0071e3"></button>
            <button class="sw" data-c="#17C964" style="background:#17C964"></button>
            <button class="sw" data-c="#7C3AED" style="background:#7C3AED"></button>
            <button class="sw" data-c="#F5A524" style="background:#F5A524"></button>
            <button class="sw" data-c="#F31260" style="background:#F31260"></button>
            <button class="sw" data-c="#06B6D4" style="background:#06B6D4"></button>
            <input type="color" class="cpick" id="p-color" value="#0071e3" title="Custom">
          </div>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>

        <!-- Corner style -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div>
            <div style="font-size:13.5px;font-weight:500;color:var(--t1)">Corner style</div>
            <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Roundness</div>
          </div>
          <div class="sseg" id="cg" style="background:rgba(0,0,0,.07)"><button class="sseg-b" data-v="sharp">Sharp</button><button class="sseg-b on" data-v="default">Default</button><button class="sseg-b" data-v="rounded">Round</button></div>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>

        <!-- Font size -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div>
            <div style="font-size:13.5px;font-weight:500;color:var(--t1)">Font size</div>
            <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Text size</div>
          </div>
          <div class="sseg" id="fg" style="background:rgba(0,0,0,.07)"><button class="sseg-b" data-v="small">S</button><button class="sseg-b on" data-v="medium">M</button><button class="sseg-b" data-v="large">L</button></div>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>

        <!-- Reset -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div>
            <div style="font-size:13.5px;font-weight:500;color:var(--t1)">Reset</div>
            <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Restore defaults</div>
          </div>
          <button class="mb danger" id="p-reset" style="font-size:12.5px">Reset</button>
        </div>
      </div>
    </div>

    <!-- LANGUAGE & REGION -->
    <div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:10px;padding:0 4px">Language & Region</div>
      <div style="background:rgba(255,255,255,.45);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.6)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">Language</div></div>
          <select class="s-sel" id="p-lang" style="background:rgba(255,255,255,.5);border-color:rgba(0,0,0,.1);font-size:13px;padding:7px 32px 7px 11px">
            <option value="en">🇺🇸 English</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="uk">🇺🇦 Українська</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">Currency</div></div>
          <select class="s-sel" id="p-cur" style="background:rgba(255,255,255,.5);border-color:rgba(0,0,0,.1);font-size:13px;padding:7px 32px 7px 11px">
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="UAH">₴ UAH</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
      </div>
    </div>

    <!-- API KEYS -->
    <div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:10px;padding:0 4px">API Keys</div>
      <div style="background:rgba(255,255,255,.45);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.6);padding:14px 16px">
        <div style="font-size:13.5px;font-weight:500;color:var(--t1);margin-bottom:3px">YouTube API v3</div>
        <div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-bottom:10px">For auto-loading YouTube stats</div>
        <div style="display:flex;gap:8px">
          <input type="password" class="sinput" id="p-yt" placeholder="AIzaSy..." style="background:rgba(255,255,255,.5);border-color:rgba(0,0,0,.1);font-size:13px;padding:8px 12px">
          <button class="mb" id="yt-eye" style="flex-shrink:0;font-size:14px;width:36px;height:36px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.5)">👁</button>
          <button class="mb accent" id="yt-save" style="flex-shrink:0;font-size:12.5px;border-radius:10px;background:var(--t1);color:#fff;border-color:var(--t1)">Save</button>
        </div>
        <div class="api-st" id="yt-st" style="margin-top:6px"></div>
      </div>
    </div>

    <!-- NOTIFICATIONS -->
    <div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:10px;padding:0 4px">Notifications</div>
      <div style="background:rgba(255,255,255,.45);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.6)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">Analysis complete</div><div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Notify when forecast ready</div></div>
          <label class="tog"><input type="checkbox" id="n-a" checked><span class="tog-tr"></span></label>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">High risk warning</div><div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Alert on high risk score</div></div>
          <label class="tog"><input type="checkbox" id="n-r" checked><span class="tog-tr"></span></label>
        </div>
      </div>
    </div>

    <!-- DATA -->
    <div>
      <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:10px;padding:0 4px">Data</div>
      <div style="background:rgba(255,255,255,.45);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.6)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">Clear history</div><div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Delete all analyses</div></div>
          <button class="mb danger" id="s-clear" style="font-size:12.5px">Clear</button>
        </div>
        <div style="height:1px;background:rgba(0,0,0,.06);margin:0 16px"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px">
          <div><div style="font-size:13.5px;font-weight:500;color:var(--t1)">Export data</div><div style="font-size:11.5px;color:rgba(0,0,0,.35);margin-top:1px">Download as CSV</div></div>
          <button class="mb" id="s-export" style="font-size:12.5px">Export CSV</button>
        </div>
      </div>
    </div>

  </div>
  <div class="sfoot">
    <span class="sver" style="color:rgba(0,0,0,.3)">InfluenceIQ v1.0 · 2026</span>
    <button class="btn btn-blue btn-sm" id="s-done" style="background:var(--t1);color:#fff;border:none;padding:9px 22px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Done</button>
  </div>
</div>
</div>`);

function openSettings(){document.getElementById('sov').classList.add('on');syncUI()}
function closeSettings(){document.getElementById('sov').classList.remove('on')}
document.getElementById('s-x').addEventListener('click',closeSettings);
document.getElementById('s-done').addEventListener('click',closeSettings);
document.getElementById('sov').addEventListener('click',e=>{if(e.target.id==='sov')closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});

function applyAccent(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  const d=document.documentElement;
  d.style.setProperty('--blue',hex);d.style.setProperty('--blue2',hex);d.style.setProperty('--blue3',hex);
  d.style.setProperty('--blue-soft',`rgba(${r},${g},${b},.10)`);
  d.style.setProperty('--blue-soft2',`rgba(${r},${g},${b},.06)`);
  d.style.setProperty('--blue-glow',`rgba(${r},${g},${b},.22)`);
  d.style.setProperty('--blue-grad',`linear-gradient(135deg,${hex},${hex}dd)`);
  d.style.setProperty('--sh-blue',`0 8px 32px rgba(${r},${g},${b},.28),0 2px 8px rgba(${r},${g},${b},.16)`);
  localStorage.setItem('iq_accent',hex);
}
document.querySelectorAll('.sw').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.sw').forEach(s=>s.classList.remove('on'));b.classList.add('on');applyAccent(b.dataset.c);document.getElementById('p-color').value=b.dataset.c;window.showToast&&showToast('Color updated')})});
document.getElementById('p-color').addEventListener('input',e=>{document.querySelectorAll('.sw').forEach(s=>s.classList.remove('on'));applyAccent(e.target.value)});

function applyCorner(v){const m={sharp:{sm:'8px',md:'12px',lg:'16px',xl:'20px',btn:'14px',inp:'12px',sb:'20px'},default:{sm:'12px',md:'18px',lg:'24px',xl:'32px',btn:'20px',inp:'16px',sb:'28px'},rounded:{sm:'16px',md:'24px',lg:'32px',xl:'40px',btn:'26px',inp:'20px',sb:'36px'}};const s=m[v]||m.default;const d=document.documentElement;d.style.setProperty('--r-sm',s.sm);d.style.setProperty('--r-md',s.md);d.style.setProperty('--r-lg',s.lg);d.style.setProperty('--r-xl',s.xl);d.style.setProperty('--r-btn',s.btn);d.style.setProperty('--r-input',s.inp);d.style.setProperty('--r-sidebar',s.sb);localStorage.setItem('iq_corner',v)}
document.querySelectorAll('#cg .sseg-b').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#cg .sseg-b').forEach(x=>x.classList.remove('on'));b.classList.add('on');applyCorner(b.dataset.v)})});

function applyFont(v){document.documentElement.style.fontSize={small:'12px',medium:'13px',large:'14px'}[v]||'13px';localStorage.setItem('iq_font',v)}
document.querySelectorAll('#fg .sseg-b').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#fg .sseg-b').forEach(x=>x.classList.remove('on'));b.classList.add('on');applyFont(b.dataset.v)})});

document.getElementById('p-reset').addEventListener('click',()=>{['iq_accent','iq_corner','iq_font'].forEach(k=>localStorage.removeItem(k));['--blue','--blue2','--blue3','--blue-soft','--blue-soft2','--blue-glow','--blue-grad','--sh-blue','--r-sm','--r-md','--r-lg','--r-xl','--r-btn','--r-input','--r-sidebar'].forEach(p=>document.documentElement.style.removeProperty(p));document.documentElement.style.fontSize='';syncUI();window.showToast&&showToast('Reset done')});

document.getElementById('p-lang').addEventListener('change',e=>{localStorage.setItem('iq_lang',e.target.value);window.showToast&&showToast('Language saved')});
document.getElementById('p-cur').addEventListener('change',e=>{const m={'USD':'$','EUR':'€','UAH':'₴','GBP':'£'};window.IQ_CUR=m[e.target.value]||'$';localStorage.setItem('iq_cur',e.target.value);window.showToast&&showToast('Currency: '+window.IQ_CUR)});

document.getElementById('yt-eye').addEventListener('click',()=>{const i=document.getElementById('p-yt');i.type=i.type==='password'?'text':'password'});
document.getElementById('yt-save').addEventListener('click',()=>{const v=document.getElementById('p-yt').value.trim();if(!v)return;localStorage.setItem('iq_yt',v);document.getElementById('yt-st').innerHTML='<span class="st-ok">✓ Saved</span>';window.showToast&&showToast('YouTube key saved')});

document.getElementById('n-a').addEventListener('change',e=>localStorage.setItem('iq_na',e.target.checked));
document.getElementById('n-r').addEventListener('change',e=>localStorage.setItem('iq_nr',e.target.checked));

document.getElementById('s-clear').addEventListener('click',async()=>{if(!confirm('Delete all history?'))return;try{await fetch('/api/history/clear',{method:'DELETE'});window.showToast&&showToast('Cleared')}catch(e){window.showToast&&showToast('Error')}});
document.getElementById('s-export').addEventListener('click',async()=>{try{const res=await fetch('/api/history?limit=1000');const rows=await res.json();if(!rows.length){window.showToast&&showToast('No data');return}const hdr='Date,Platform,Score,Recommendation\n';const b=rows.map(r=>[r.created,r.platform,Math.min(r.result.engagement_rate*10,10).toFixed(1),r.result.recommendation].join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([hdr+b],{type:'text/csv'}));a.download='influenceiq.csv';a.click();window.showToast&&showToast('Exported!')}catch(e){window.showToast&&showToast('Failed')}});
document.getElementById('p-name').addEventListener('input',e=>localStorage.setItem('iq_name',e.target.value));

function syncUI(){
  document.getElementById('p-lang').value=localStorage.getItem('iq_lang')||'en';
  document.getElementById('p-cur').value=localStorage.getItem('iq_cur')||'USD';
  document.getElementById('p-name').value=localStorage.getItem('iq_name')||'';
  const acc=localStorage.getItem('iq_accent')||'#0071e3';document.getElementById('p-color').value=acc;document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',s.dataset.c===acc));
  const cor=localStorage.getItem('iq_corner')||'default';document.querySelectorAll('#cg .sseg-b').forEach(b=>b.classList.toggle('on',b.dataset.v===cor));
  const fnt=localStorage.getItem('iq_font')||'medium';document.querySelectorAll('#fg .sseg-b').forEach(b=>b.classList.toggle('on',b.dataset.v===fnt));
  const yt=localStorage.getItem('iq_yt')||'';if(yt)document.getElementById('p-yt').value=yt;
  const na=localStorage.getItem('iq_na');if(na!==null)document.getElementById('n-a').checked=na==='true';
  const nr=localStorage.getItem('iq_nr');if(nr!==null)document.getElementById('n-r').checked=nr==='true';
}

(function init(){
  const acc=localStorage.getItem('iq_accent');if(acc)applyAccent(acc);
  const cor=localStorage.getItem('iq_corner');if(cor)applyCorner(cor);
  const fnt=localStorage.getItem('iq_font');if(fnt)applyFont(fnt);
  const cur=localStorage.getItem('iq_cur');if(cur){const m={'USD':'$','EUR':'€','UAH':'₴','GBP':'£'};window.IQ_CUR=m[cur]||'$'}
})();
