/*
 * Отдельная страница результатов: /results/ГГГГ/
 * Год берётся из <body data-year="ГГГГ">. Данные — /assets/js/npho-data.js,
 * при наличии — свежие результаты из редактора (/api/site-content).
 */
(function(){
  const I18N = window.NPHO_I18N;
  const t = (k,v) => I18N.t(k,v);
  const YEAR = document.body.dataset.year;
  const PDF_LINKS = window.NPHO_PDF_LINKS || {};
  const STAGE_DATES = window.NPHO_STAGE_DATES || {};
  const GOLD = window.NPHO_GOLD_COUNT || 5, SILVER = window.NPHO_SILVER_COUNT || 3;
  let RESULTS = JSON.parse(JSON.stringify(window.NPHO_RESULTS || {}));

  const esc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const total = r => (parseFloat(r.d1)||0)+(parseFloat(r.d2)||0)+(parseFloat(r.d3)||0);
  const years = () => Object.keys(RESULTS).filter(y=>/^\d{4}$/.test(y)).sort();

  function pdfLabel(f){
    if(f.label&&!f.kind) return f.label;
    return t('results.day',{n:f.day})+' · '+t(f.kind==='solutions'?'results.solutions':'results.problems');
  }

  function renderPDFs(){
    const list = PDF_LINKS[YEAR]||[];
    if(!list.length) return '';
    const ico='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" stroke-width="1.3"><path d="M3 1h7l4 4v10H3V1z"/><path d="M10 1v4h4"/><path d="M5 9h6M5 11.5h4"/></svg>';
    const dl='<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6.5 1v8M4 7l2.5 2.5L9 7"/><path d="M1 10v1.5a1 1 0 001 1h9a1 1 0 001-1V10"/></svg>';
    return '<div class="slbl">'+esc(t('results.pdfs'))+'</div>'+list.map(f=>
      '<div class="pdf-row"><div class="pdf-info"><div class="pdf-icon">'+ico+'</div><div><div class="pdf-name">'+esc(pdfLabel(f))+'</div><div class="pdf-sub">'+esc(t(f.url?'results.available':'results.later'))+'</div></div></div>'+
      (f.url?'<a class="btn-dl" href="'+esc(f.url)+'" target="_blank" rel="noopener">'+dl+' '+esc(t('results.download'))+'</a>':'<span class="no-file">'+esc(t('results.soon'))+'</span>')+
      '</div>').join('');
  }

  function renderTable(){
    const data = RESULTS[YEAR]||[];
    if(!data.length) return '<p style="font-size:13px;color:var(--text3);padding:.5rem 0">'+esc(t('results.noData'))+'</p>';
    const sorted=[...data].sort((a,b)=>total(b)-total(a));
    const hasDay3=sorted.some(r=>String(r.d3||'').trim());
    const day=n=>esc(t('results.day',{n}));
    let h='<table class="rt"><thead><tr><th></th><th>'+esc(t('results.participant'))+'</th><th>'+day(1)+'</th><th>'+day(2)+'</th>'+(hasDay3?'<th>'+day(3)+'</th>':'')+'<th>'+esc(t('results.total'))+'</th><th>'+esc(t('results.status'))+'</th></tr></thead><tbody>';
    sorted.forEach((r,i)=>{
      const tier=i<GOLD?'team1':i<GOLD+SILVER?'team2':'rest';
      const badge=r.status?'<span class="sbadge status-'+tier+'">'+esc(I18N.statusLabel(r.status))+'</span>':'';
      h+='<tr class="row-'+tier+'"><td><span class="medal medal-'+tier+'">'+(i+1)+'</span></td><td style="font-weight:600">'+I18N.personNameHtml(r,esc)+'</td><td>'+esc(r.d1||'—')+'</td><td>'+esc(r.d2||'—')+'</td>'+(hasDay3?'<td>'+esc(r.d3||'—')+'</td>':'')+'<td style="font-weight:700;color:var(--accent)">'+total(r).toFixed(2)+'</td><td>'+badge+'</td></tr>';
    });
    return h+'</tbody></table><p class="legend-note">'+esc(t('results.legend'))+'</p>';
  }

  function render(){
    const app=document.getElementById('app');
    const list=years();
    const data=RESULTS[YEAR]||[];
    const days=data.some(r=>String(r.d3||'').trim())?3:2;
    const dates=STAGE_DATES[YEAR];
    const dateFact=dates?'<div class="yhero-fact"><dt>'+esc(t('results.dates'))+'</dt><dd>'+esc(dates[I18N.lang]||dates.ru)+'</dd></div>':'';
    const tabs=list.map(y=>'<a class="ytab'+(y===YEAR?' active':'')+'" href="/results/'+y+'/"'+(y===YEAR?' aria-current="page"':'')+'>'+y+'</a>').join('');
    app.innerHTML=
      '<header class="rhead"><p class="official-badge"><strong>'+esc(t('official.site'))+'</strong><span>'+esc(t('official.badge'))+'</span></p>'+
      '<h1>'+esc(t('results.pageTitle',{year:YEAR})).replace(esc(YEAR),'<span>'+esc(YEAR)+'</span>')+'</h1><p class="sub">'+esc(t('results.pageSub'))+'</p></header>'+
      '<div class="ytabs" role="navigation" aria-label="'+esc(t('results.years'))+'">'+tabs+'</div>'+
      '<div class="yhero"><div><span class="yhero-kicker">'+esc(t('results.kicker'))+'</span><h2>'+esc(t('results.stage',{year:YEAR}))+'</h2><div class="yhero-actions"><button class="copy-btn" type="button" id="copy-link">⧉ '+esc(t('results.copyLink'))+'</button></div></div>'+
      '<dl class="yhero-facts">'+dateFact+'<div class="yhero-fact"><dt>'+esc(t('results.place'))+'</dt><dd>'+esc(t('results.bishkek'))+'</dd></div><div class="yhero-fact"><dt>'+esc(t('results.duration'))+'</dt><dd>'+esc(I18N.pluralDays(days))+'</dd></div></dl></div>'+
      renderPDFs()+
      '<div class="slbl" style="margin-top:1.5rem">'+esc(t('results.table'))+'</div><div class="tw">'+renderTable()+'</div>';
    document.title=t('results.pageTitle',{year:YEAR})+' — NPhO';
    document.querySelector('meta[name="description"]')?.setAttribute('content',t('results.pageSub')+' — '+YEAR+'. '+t('meta.description'));
    document.getElementById('copy-link')?.addEventListener('click',copyLink);
    I18N.applyStatic();
    updateThemeToggle();
  }

  async function copyLink(){
    const btn=document.getElementById('copy-link');
    const url=I18N.langUrl('/results/'+YEAR+'/');
    try{ await navigator.clipboard.writeText(url); if(btn){btn.textContent='✓ '+t('results.copied'); setTimeout(()=>{btn.textContent='⧉ '+t('results.copyLink')},1800);} }
    catch{ window.prompt(t('results.copyLink'),url); }
  }

  function resolvedTheme(){
    if(document.documentElement.dataset.theme) return document.documentElement.dataset.theme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light';
  }
  function updateThemeToggle(){
    const dark=resolvedTheme()==='dark';
    const icon=document.getElementById('theme-icon'),label=document.getElementById('theme-label'),btn=document.getElementById('theme-toggle');
    if(icon)icon.textContent=dark?'☀':'☾';
    if(label)label.textContent=dark?t('theme.light'):t('theme.dark');
    if(btn){const a=dark?t('theme.toLight'):t('theme.toDark');btn.setAttribute('aria-label',a);btn.title=a;}
  }
  window.toggleTheme=function(){
    const next=resolvedTheme()==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('npho-theme',next)}catch{}
    updateThemeToggle();
  };

  document.addEventListener('npho:langchange',render);
  render();

  /* Свежие результаты из редактора, если API доступно. */
  fetch('/api/site-content',{cache:'no-store',headers:{Accept:'application/json'}})
    .then(r=>r.ok?r.json():null)
    .then(payload=>{
      const res=payload&&payload.content&&payload.content.results;
      if(res&&typeof res==='object'&&Object.keys(res).length){
        Object.values(res).flat().forEach(row=>{ if(row) row.status=String(row.status||'').replace(/\bBPhO\b/g,'BPO'); });
        RESULTS={...RESULTS,...res};
        render();
      }
    })
    .catch(()=>{});
})();
