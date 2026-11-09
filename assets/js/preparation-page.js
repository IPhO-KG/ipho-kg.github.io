(()=>{'use strict';const tabs=[...document.querySelectorAll('[data-stage]')];function setStage(id,focus=false){tabs.forEach(t=>{const active=t.dataset.stage===id;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;if(active&&focus)t.focus()})}tabs.forEach((t,i)=>{t.addEventListener('click',()=>setStage(t.dataset.stage));t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();setStage(tabs[next].dataset.stage,true)}})});document.querySelectorAll('[data-week]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-week]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.week-panel').forEach(p=>p.hidden=p.id!=='week-'+b.dataset.week)}));const theme=document.querySelector('.theme');
function updateHeader(){
 const i18n=window.NPHO_I18N;
 i18n.applyStatic();
 const dark=document.documentElement.dataset.theme==='dark';
 theme.textContent=dark?'☀':'☾';
 theme.setAttribute('aria-label',i18n.t(dark?'theme.toLight':'theme.toDark'));
 theme.title=theme.getAttribute('aria-label');
 document.querySelectorAll('[data-site-link]').forEach(a=>a.href=i18n.langUrl(a.getAttribute('data-site-link')));
 const notice=document.querySelector('.language-notice');
 notice.hidden=i18n.lang==='ru';
 notice.lang=i18n.lang;
 notice.textContent=i18n.lang==='ky'?'Бул автордук колдонмо азырынча орус тилинде гана жеткиликтүү.':'This author’s guide is currently available in Russian.';
}
theme.addEventListener('click',()=>{
 const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
 document.documentElement.dataset.theme=next;
 try{localStorage.setItem('npho-theme',next)}catch{}
 updateHeader();
});
document.addEventListener('npho:langchange',updateHeader);
window.addEventListener('pageshow',()=>{
 try{const saved=localStorage.getItem('npho-theme');if(saved==='dark'||saved==='light')document.documentElement.dataset.theme=saved}catch{}
 updateHeader();
});
updateHeader();let openBeforePrint;window.addEventListener('beforeprint',()=>{openBeforePrint=[...document.querySelectorAll('details')].filter(x=>x.open);document.querySelectorAll('details').forEach(x=>x.open=true)});window.addEventListener('afterprint',()=>document.querySelectorAll('details').forEach(x=>x.open=openBeforePrint?.includes(x)||false));})();
