// InfluenceIQ Premium — settings.js
document.body.insertAdjacentHTML('beforeend',`
<div id="sov" class="sov">
<div id="smodal" class="smodal">
  <div class="sh"><div class="sh-l"><div class="sh-ic">⚙️</div><div><div class="sh-title">Settings</div><div class="sh-sub">Customize your experience</div></div></div><button class="s-x" id="s-x">✕</button></div>
  <div class="sbody">

    <div class="ssec">
      <div class="ssec-lbl">PERSONALIZATION</div>
      <div class="srow"><div><div class="srt">Your name</div><div class="srd">Shown in greetings</div></div><input type="text" class="sinput" id="p-name" placeholder="Your name" style="max-width:160px"></div>
      <div class="srow" style="margin-top:12px"><div><div class="srt">Accent color</div><div class="srd">Main highlight color</div></div>
        <div class="swatches">
          <button class="sw on" data-c="#4F8CFF" style="background:#4F8CFF"></button>
          <button class="sw" data-c="#17C964" style="background:#17C964"></button>
          <button class="sw" data-c="#7C3AED" style="background:#7C3AED"></button>
          <button class="sw" data-c="#F5A524" style="background:#F5A524"></button>
          <button class="sw" data-c="#F31260" style="background:#F31260"></button>
          <button class="sw" data-c="#06B6D4" style="background:#06B6D4"></button>
          <input type="color" class="cpick" id="p-color" value="#4F8CFF">
        </div>
      </div>
      <div class="srow" style="margin-top:12px"><div><div class="srt">Corner style</div><div class="srd">Roundness of elements</div></div>
        <div class="sseg" id="cg"><button class="sseg-b" data-v="sharp">Sharp</button><button class="sseg-b on" data-v="default">Default</button><button class="sseg-b" data-v="rounded">Round</button></div>
      </div>
      <div class="srow" style="margin-top:12px"><div><div class="srt">Font size</div><div class="srd">Text size</div></div>
        <div class="sseg" id="fg"><button class="sseg-b" data-v="small">S</button><button class="sseg-b on" data-v="medium">M</button><button class="sseg-b" data-v="large">L</button></div>
      </div>
      <div class="srow" style="margin-top:10px"><div><div class="srt">Reset personalization</div><div class="srd">Restore defaults</div></div><button class="mb danger" id="p-reset">Reset</button></div>
    </div>

    <div class="ssec">
      <div class="ssec-lbl">LANGUAGE & REGION</div>
      <div class="srow"><div><div class="srt">Language</div><div class="srd">Interface language</div></div><select class="s-sel" id="p-lang"><option value="en">🇺🇸 English</option><option value="ru">🇷🇺 Русский</option><option value="uk">🇺🇦 Українська</option><option value="de">🇩🇪 Deutsch</option><option value="es">🇪🇸 Español</option></select></div>
      <div class="srow" style="margin-top:8px"><div><div class="srt">Currency</div><div class="srd">Display in forecasts</div></div><select class="s-sel" id="p-cur"><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="UAH">₴ UAH</option><option value="RUB">₽ RUB</option><option value="GBP">£ GBP</option></select></div>
    </div>

    <div class="ssec">
      <div class="ssec-lbl">API KEYS</div>
      <div class="srow srow-col"><div><div class="srt">YouTube API v3</div><div class="srd">For auto-loading YouTube stats</div></div>
        <div class="api-row"><input type="password" class="sinput" id="p-yt" placeholder="AIzaSy..."><button class="mb" id="yt-eye">👁</button><button class="mb accent" id="yt-save">Save</button></div>
        <div class="api-st" id="yt-st"></div>
      </div>
      <div class="srow srow-col" style="margin-top:12px"><div><div class="srt">Telegram API</div><div class="srd">ID & Hash from my.telegram.org</div></div>
        <div class="api-row"><input type="text" class="sinput" id="p-tgid" placeholder="API ID"><input type="password" class="sinput" id="p-tghash" placeholder="API Hash"></div>
        <button class="mb accent full" id="tg-save">Save Telegram Keys</button>
        <div class="api-st" id="tg-st"></div>
      </div>
    </div>

    <div class="ssec">
      <div class="ssec-lbl">NOTIFICATIONS</div>
      <div class="srow"><div><div class="srt">Analysis complete</div><div class="srd">Notify when forecast ready</div></div><label class="tog"><input type="checkbox" id="n-a" checked><span class="tog-tr"><span class="tog-th"></span></span></label></div>
      <div class="srow" style="margin-top:8px"><div><div class="srt">High risk warning</div><div class="srd">Alert on high risk score</div></div><label class="tog"><input type="checkbox" id="n-r" checked><span class="tog-tr"><span class="tog-th"></span></span></label></div>
    </div>

    <div class="ssec">
      <div class="ssec-lbl">DATA</div>
      <div class="srow"><div><div class="srt">Clear history</div><div class="srd">Delete all analyses</div></div><button class="mb danger" id="s-clear">Clear All</button></div>
      <div class="srow" style="margin-top:8px"><div><div class="srt">Export data</div><div class="srd">Download as CSV</div></div><button class="mb" id="s-export">Export CSV</button></div>
    </div>
  </div>
  <div class="sfoot"><span class="sver">InfluenceIQ v1.0 · 2026</span><button class="btn btn-blue btn-sm" id="s-done">Done</button></div>
</div>
</div>`);

function openSettings(){document.getElementById('sov').classList.add('on');setTimeout(()=>document.getElementById('smodal').classList.add('on'),10);syncUI()}
function closeSettings(){document.getElementById('smodal').classList.remove('on');setTimeout(()=>document.getElementById('sov').classList.remove('on'),380)}
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

document.getElementById('p-reset').addEventListener('click',()=>{['iq_accent','iq_corner','iq_font'].forEach(k=>localStorage.removeItem(k));['--blue','--blue2','--blue3','--blue-soft','--blue-soft2','--blue-glow','--blue-grad','--sh-blue','--r-sm','--r-md','--r-lg','--r-xl','--r-btn','--r-input','--r-sidebar'].forEach(p=>document.documentElement.style.removeProperty(p));document.documentElement.style.fontSize='';syncUI();showToast&&showToast('Reset done')});

document.getElementById('p-lang').addEventListener('change',e=>{localStorage.setItem('iq_lang',e.target.value);showToast&&showToast('Language saved')});
document.getElementById('p-cur').addEventListener('change',e=>{const m={'USD':'$','EUR':'€','UAH':'₴','RUB':'₽','GBP':'£'};window.IQ_CUR=m[e.target.value]||'$';localStorage.setItem('iq_cur',e.target.value);showToast&&showToast('Currency: '+window.IQ_CUR)});

document.getElementById('yt-eye').addEventListener('click',()=>{const i=document.getElementById('p-yt');i.type=i.type==='password'?'text':'password'});
document.getElementById('yt-save').addEventListener('click',()=>{const v=document.getElementById('p-yt').value.trim();if(!v)return;localStorage.setItem('iq_yt',v);document.getElementById('yt-st').innerHTML='<span class="st-ok">✓ Saved</span>';showToast&&showToast('YouTube key saved')});
document.getElementById('tg-save').addEventListener('click',()=>{const id=document.getElementById('p-tgid').value.trim(),h=document.getElementById('p-tghash').value.trim();if(!id||!h)return;localStorage.setItem('iq_tgid',id);localStorage.setItem('iq_tghash',h);document.getElementById('tg-st').innerHTML='<span class="st-ok">✓ Saved — restart server</span>';showToast&&showToast('Telegram keys saved')});
document.getElementById('n-a').addEventListener('change',e=>localStorage.setItem('iq_na',e.target.checked));
document.getElementById('n-r').addEventListener('change',e=>localStorage.setItem('iq_nr',e.target.checked));
document.getElementById('s-clear').addEventListener('click',async()=>{if(!confirm('Delete all history?'))return;try{await fetch('/api/history/clear',{method:'DELETE'});showToast&&showToast('Cleared')}catch(e){showToast&&showToast('Error')}});
document.getElementById('s-export').addEventListener('click',async()=>{try{const res=await fetch('/api/history?limit=1000');const rows=await res.json();if(!rows.length){showToast&&showToast('No data');return}const hdr='Date,Platform,Score,Recommendation\n';const b=rows.map(r=>[r.created,r.platform,Math.min(r.result.engagement_rate*10,10).toFixed(1),r.result.recommendation].join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([hdr+b],{type:'text/csv'}));a.download='influenceiq.csv';a.click();showToast&&showToast('Exported!')}catch(e){showToast&&showToast('Failed')}});
document.getElementById('p-name').addEventListener('input',e=>localStorage.setItem('iq_name',e.target.value));

function syncUI(){
  document.getElementById('p-lang').value=localStorage.getItem('iq_lang')||'en';
  document.getElementById('p-cur').value=localStorage.getItem('iq_cur')||'USD';
  document.getElementById('p-name').value=localStorage.getItem('iq_name')||'';
  const acc=localStorage.getItem('iq_accent')||'#4F8CFF';document.getElementById('p-color').value=acc;document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',s.dataset.c===acc));
  const cor=localStorage.getItem('iq_corner')||'default';document.querySelectorAll('#cg .sseg-b').forEach(b=>b.classList.toggle('on',b.dataset.v===cor));
  const fnt=localStorage.getItem('iq_font')||'medium';document.querySelectorAll('#fg .sseg-b').forEach(b=>b.classList.toggle('on',b.dataset.v===fnt));
  const yt=localStorage.getItem('iq_yt')||'';if(yt)document.getElementById('p-yt').value=yt;
  const tgid=localStorage.getItem('iq_tgid')||'';if(tgid)document.getElementById('p-tgid').value=tgid;
  const tgh=localStorage.getItem('iq_tghash')||'';if(tgh)document.getElementById('p-tghash').value=tgh;
  const na=localStorage.getItem('iq_na');if(na!==null)document.getElementById('n-a').checked=na==='true';
  const nr=localStorage.getItem('iq_nr');if(nr!==null)document.getElementById('n-r').checked=nr==='true';
}

// Apply saved on load
(function init(){
  const acc=localStorage.getItem('iq_accent');if(acc)applyAccent(acc);
  const cor=localStorage.getItem('iq_corner');if(cor)applyCorner(cor);
  const fnt=localStorage.getItem('iq_font');if(fnt)applyFont(fnt);
  const cur=localStorage.getItem('iq_cur');if(cur){const m={'USD':'$','EUR':'€','UAH':'₴','RUB':'₽','GBP':'£'};window.IQ_CUR=m[cur]||'$'}
})();