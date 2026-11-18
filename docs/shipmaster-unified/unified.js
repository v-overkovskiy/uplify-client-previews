(function(){
'use strict';
const models={base:{name:'Амур базовий',price:'25 000 грн',delta:'Ручне керування з пульта. Бункер 3 л.'},gd:{name:'Амур GPS + глибиномір',price:'34 000 грн',delta:'GPS і глибиномір: +9 000 грн до базового.'},ge:{name:'Амур GPS + ехолот',price:'52 000 грн',delta:'Ехолот замість глибиноміра: +18 000 грн.'},md:{name:'Амур-М GPS + глибиномір',price:'39 950 грн',delta:'Водяне охолодження: +5 950 грн до Амура GPS.'},me:{name:'Амур-М GPS + ехолот TF-520',price:'57 950 грн',delta:'Водяне охолодження й ехолот TOSLON TF-520.'}};
const names={yellow:'Жовтий',orange:'Помаранчевий',red:'Червоний'};
const homeKeys=['base','gd','ge'],homeColours={base:'yellow',gd:'yellow',ge:'yellow'},homeComparison=new Set();
function renderHomeCard(key){
 const box=document.createElement('div');box.innerHTML=SM.homeCard(key,homeColours[key]);const card=box.firstElementChild;
 card.classList.add('u-catalog-card');card.dataset.homeConfig=key;
 if(key==='gd'){card.classList.add('u-product-featured');card.querySelector('.badges').insertAdjacentHTML('beforeend','<span class="b hit">Найпопулярніший</span>');}
 card.querySelector('[data-cmp]').checked=homeComparison.has(key);
 return card;
}
function drawHomeCards(){document.getElementById('u-top-sales-grid').replaceChildren(...homeKeys.map(renderHomeCard));}
function syncHomeComparison(){
 const n=homeComparison.size;document.getElementById('u-card-comparison').hidden=!n;
 document.getElementById('u-compare-count').textContent='Обрано: '+n;
 document.getElementById('u-compare-open').disabled=n<2;
 document.getElementById('u-card-status').textContent=n===1?'Оберіть ще один кораблик для порівняння.':'';
}
drawHomeCards();
document.getElementById('u-top-sales-grid').addEventListener('click',e=>{
 const card=e.target.closest('[data-home-config]');if(!card)return;const key=card.dataset.homeConfig;
 const sw=e.target.closest('[data-sw]');if(sw){homeColours[key]=sw.dataset.c;card.replaceWith(renderHomeCard(key));document.querySelector('#u-top-sales-grid [data-home-config="'+key+'"] [data-c="'+homeColours[key]+'"]').focus({preventScroll:true});return;}
 const buy=e.target.closest('[data-buy]');if(buy){const inCart=SM.homeCart(buy.dataset.buy);buy.textContent=inCart?'У кошику':'Купити';buy.setAttribute('aria-pressed',String(inCart));document.getElementById('u-card-status').textContent=inCart?'Додано в демонстраційний кошик. Замовлення не надсилається.':'Прибрано з демонстраційного кошика.';return;}
 const more=e.target.closest('[data-more]');if(more){SM.openPdp(key,homeColours[key]);}
});
document.getElementById('u-top-sales-grid').addEventListener('change',e=>{const input=e.target.closest('[data-cmp]');if(!input)return;const key=input.closest('[data-home-config]').dataset.homeConfig;if(input.checked)homeComparison.add(key);else homeComparison.delete(key);syncHomeComparison();});
document.getElementById('u-compare-open').addEventListener('click',()=>SM.compareFromHome([...homeComparison].map(key=>key+'-'+homeColours[key])));
document.getElementById('u-compare-clear').addEventListener('click',()=>{homeComparison.clear();drawHomeCards();syncHomeComparison();});
let selection='gd';
function choose(key){
 selection=key;const m=models[key];
 document.getElementById('u-selection-name').textContent=m.name;
 document.getElementById('u-selection-price').textContent=m.price;
 document.getElementById('u-selection-delta').textContent=m.delta;
 document.getElementById('u-selected-buy').dataset.uPdp=key;
 document.getElementById('u-m-variant').hidden=!['md','me'].includes(key);
 document.querySelectorAll('[data-u-config]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.uConfig===key||(b.closest('.u-configs')&&b.dataset.uConfig==='md'&&key==='me'))));
 const keys=['base','gd','ge','md','me'];
 document.querySelectorAll('.u-table tr').forEach(row=>Array.from(row.children).forEach((cell,i)=>{if(!i)return;cell.classList.toggle('u-selected',keys[i-1]===key);cell.classList.toggle('u-mobile-hide',keys[i-1]!=='base'&&keys[i-1]!==key&&!(key==='base'&&keys[i-1]==='gd'));}));
}
choose(selection);
// The video will be supplied later; show an honest inline state until then.
const videoButton=document.getElementById('u-video-button'),videoStatus=document.getElementById('u-video-status');
videoButton.addEventListener('click',()=>{videoStatus.hidden=!videoStatus.hidden;videoButton.setAttribute('aria-expanded',String(!videoStatus.hidden));});

document.addEventListener('click',e=>{
 const link=e.target.closest('[data-u-pdp]');
 if(link){e.preventDefault();const card=link.closest('.u-product');SM.openPdp(link.dataset.uPdp,card?card.dataset.colour:'yellow');return;}
 const col=e.target.closest('[data-u-colour]');
 if(col){const card=col.closest('.u-product');card.dataset.colour=col.dataset.uColour;const im=card.querySelector('img');im.src='assets/amur-'+col.dataset.uColour+'.webp';im.alt=names[col.dataset.uColour]+' '+models[card.dataset.config].name;card.querySelectorAll('[data-u-colour]').forEach(b=>b.setAttribute('aria-pressed',String(b===col)));return;}
 const cfg=e.target.closest('[data-u-config]');if(cfg){choose(cfg.dataset.uConfig);return;}
 const menu=e.target.closest('.u-menu');if(menu){const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню');document.getElementById('u-mobile-nav').hidden=!open;return;}
 if(e.target.closest('#u-mobile-nav a'))closeMenu();
});
function closeMenu(){document.getElementById('u-mobile-nav').hidden=true;document.querySelector('.u-menu').setAttribute('aria-expanded','false');document.querySelector('.u-menu').setAttribute('aria-label','Відкрити меню');}
document.querySelectorAll('#u-mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('hashchange',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
// Existing router does not scroll between anchors on the same home page.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.dataset.uPdp)return;const id=a.getAttribute('href').slice(1);if(['katalog','konfigurator','pasport'].includes(id))return;const el=document.getElementById(id||'top');if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}),0);});
const stage=document.getElementById('u-turntable'),image=document.getElementById('u-frame');let frame=61,drag=null;
function show(n){frame=(Math.round(n)%72+72)%72;image.src='assets/spin/s'+String(frame).padStart(2,'0')+'.webp';image.alt='Модель Амур за фотографіями, ракурс '+Math.round(frame*5)+' градусів';}
stage.addEventListener('pointerdown',e=>{drag={x:e.clientX,frame};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(drag)show(drag.frame+(e.clientX-drag.x)/8);});
stage.addEventListener('pointerup',()=>drag=null);stage.addEventListener('pointercancel',()=>drag=null);
stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(frame+(e.key==='ArrowLeft'?-3:3));}});
// Fetch the remaining view frames only when the reader approaches the viewer.
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){for(let i=0;i<72;i++){const im=new Image();im.src='assets/spin/s'+String(i).padStart(2,'0')+'.webp';}io.disconnect();}},{rootMargin:'250px'});io.observe(stage);}
})();
