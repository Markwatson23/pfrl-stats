(() => {
'use strict';
const clean=s=>String(s||'').trim().toLowerCase();
function planColumns(headers){
const h=headers.map(clean),find=n=>h.indexOf(n),pick=names=>names.map(find).filter(i=>i>=0);
if(h.includes('classified')&&h.includes('driver'))return pick(['classified','driver','grid']);
if(h[0]==='metric'||h[0]==='comparison')return h.map((_,i)=>i);
if(h.includes('driver')&&(h.includes('points')||h.includes('pts shown')||h.includes('pfrl points'))){
if(h.includes('season')&&h.includes('round'))return pick(['circuit','driver','finish','points']);
if(h.includes('finish')||h.includes('pos.'))return pick(['finish','pos.','driver','points','pfrl points','pts shown','gap / status']);
if(h.includes('#'))return pick(['#','driver','points','gap']);
return pick(['driver','points','wins','podiums']);
}
if(h.includes('team')&&h.includes('#'))return pick(['#','team','recorded points','points']);
if(h.includes('name')&&h.includes('#'))return pick(['#','name','points','gap']);
if(h.includes('winner'))return pick(['race','season','round','circuit','winner','pole']).slice(0,4);
if(h.includes('circuit'))return pick(['circuit','best finish','points','races','most recent season']).slice(0,4);
if(h.includes('total gained'))return pick(['driver','total gained','average per race','biggest gain']);
if(h.includes('best qualifying lap'))return pick(['driver','best qualifying lap','best race lap']);
if(h.includes('season')&&h.includes('points'))return pick(['season','points','wins','podiums']);
if(h.includes('grand prix'))return [0,...h.map((_,i)=>i).slice(1,4)];
if(h.includes('position')&&h.includes('driver'))return pick(['position','driver','lap']);
if(h.includes('average qualifying position'))return pick(['average qualifying position','average race finish','dnfs','best finish']);
return h.length<=4?h.map((_,i)=>i):[0,1,h.length-1];
}
function addCell(parent,label,cell){
const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
dt.textContent=label;dd.innerHTML=cell.innerHTML;item.append(dt,dd);parent.append(item);
}
function enhanceTable(table){
table.dataset.mobileAudited='true';
if(table.closest('.desktop-race-history'))return;
const headers=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
if(!headers.length)return;
const statusIndex=headers.map(clean).indexOf('status'),finishIndex=headers.map(clean).indexOf('finish');
if(statusIndex>=0&&finishIndex>=0)for(const row of table.querySelectorAll('tbody tr')){
const status=row.cells[statusIndex]?.textContent.trim();
if(status&&status!=='Finished'&&row.cells[finishIndex])row.cells[finishIndex].textContent=status;
}
const main=planColumns(headers),primary=new Set(main);
const extra=headers.map((_,i)=>i).filter(i=>!primary.has(i));
table.classList.add('audited-table');
for(const row of table.rows)for(let i=0;i<row.cells.length;i++)if(extra.includes(i))row.cells[i].classList.add('audit-secondary');
const container=table.parentElement;
container.classList.add('audited-table-wrap');
if(extra.length){
const toggle=document.createElement('button');toggle.type='button';toggle.className='table-detail-toggle';toggle.textContent='More stats';
toggle.setAttribute('aria-expanded','false');
toggle.addEventListener('click',()=>{const expanded=table.classList.toggle('show-all-columns');toggle.textContent=expanded?'Fewer stats':'More stats';toggle.setAttribute('aria-expanded',String(expanded));});
container.insertBefore(toggle,table);
}
const list=document.createElement('div');list.className='mobile-data-list';
for(const row of table.querySelectorAll('tbody tr')){
const cells=[...row.cells];if(cells.length!==headers.length)continue;
const card=document.createElement('article');card.className='mobile-data-card';
const lower=headers.map(clean);
let titleIndex=lower.indexOf('driver');if(titleIndex<0)titleIndex=lower.indexOf('name');if(titleIndex<0)titleIndex=lower.indexOf('team');if(titleIndex<0)titleIndex=main[0]??0;
const heading=document.createElement('div');heading.className='mobile-data-heading';
const rankIndex=lower.findIndex(x=>['#','pos.','finish','position','classified'].includes(x));
if(rankIndex>=0&&rankIndex!==titleIndex){const badge=document.createElement('span');badge.className='mobile-data-rank';badge.textContent=cells[rankIndex].textContent.trim();heading.append(badge);}
const title=document.createElement('strong');title.innerHTML=cells[titleIndex].innerHTML;heading.append(title);card.append(heading);
const circuit=lower.indexOf('circuit'),season=lower.indexOf('season'),round=lower.indexOf('round');
if(circuit>=0&&circuit!==titleIndex){const context=document.createElement('p');context.className='mobile-data-context';context.innerHTML=cells[circuit].innerHTML+(season>=0?' · S'+cells[season].textContent:'')+(round>=0?' R'+cells[round].textContent:'');card.append(context);}
const stats=document.createElement('dl');stats.className='mobile-data-stats';
for(const i of main)if(i!==titleIndex&&i!==rankIndex&&i!==circuit)addCell(stats,headers[i],cells[i]);
if(stats.children.length)card.append(stats);
const detailsIndexes=extra.filter(i=>!(lower[i]==='status'&&clean(cells[i].textContent)==='finished')&&!(lower[i]==='qualifying position'&&lower.includes('grid')&&cells[i].textContent===cells[lower.indexOf('grid')].textContent));
if(detailsIndexes.length){
const details=document.createElement('details'),summary=document.createElement('summary'),detailStats=document.createElement('dl');
summary.textContent='More details';detailStats.className='mobile-data-stats';
for(const i of detailsIndexes)addCell(detailStats,headers[i],cells[i]);
details.append(summary,detailStats);card.append(details);
}
list.append(card);
}
if(list.children.length){table.classList.add('has-mobile-cards');container.append(list);}
}
let queued=false;
function arrangePage(){
const nav=document.querySelector('.pfrl-site-nav');
if(nav&&!document.getElementById('mobileNavToggle')){
nav.classList.add('mobile-collapsed');nav.id='site-navigation';
const button=document.createElement('button');button.type='button';button.id='mobileNavToggle';button.className='mobile-nav-toggle';button.textContent='Browse PFRL sections ☰';button.setAttribute('aria-controls',nav.id);button.setAttribute('aria-expanded','false');
button.addEventListener('click',()=>{const expanded=!nav.classList.toggle('mobile-collapsed');button.setAttribute('aria-expanded',String(expanded));});nav.before(button);
}
if(location.hash.startsWith('#race/')){
const content=document.querySelector('#content'),classification=[...content.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent==='Race classification');
if(classification&&!classification.dataset.prioritized){classification.dataset.prioritized='true';const cards=content.querySelector('.archive-cards');if(cards)cards.after(classification);}
for(const panel of content.querySelectorAll('.panel'))if(panel.querySelector('h2')?.textContent.startsWith('Previous races at')&&!panel.querySelector('a'))panel.remove();
}
}
function refresh(){queued=false;arrangePage();document.querySelectorAll('main table:not([data-mobile-audited])').forEach(enhanceTable);}
function queue(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
function start(){refresh();new MutationObserver(queue).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
