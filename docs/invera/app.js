const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const body=document.body;
const toast=$('[data-toast]');
if(body.dataset.page!=='home'){
  const actions=$('.header-actions');
  if(actions&&!actions.querySelector('.cart-button')){
    const cart=document.createElement('button');
    cart.className='icon-button cart-button';
    cart.type='button';
    cart.setAttribute('aria-label','Кошик');
    cart.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2h9.8L20 7H6"></path><circle cx="9" cy="19" r="1.3"></circle><circle cx="17" cy="19" r="1.3"></circle></svg><span aria-hidden="true">0</span>';
    cart.addEventListener('click',()=>showToast('Кошик у цьому концепті не підключений.'));
    actions.append(cart);
  }
}
let toastTimer;
function showToast(message){
  if(!toast)return;
  toast.textContent=message;
  toast.hidden=false;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.hidden=true;toast.classList.remove('is-visible')},4300);
}

$$('[data-prototype-action]').forEach(control=>control.addEventListener('click',event=>{
  event.preventDefault();
  showToast(control.dataset.prototypeAction);
}));

const menu=$('[data-mega-menu]');
const menuOpen=$('[data-menu-open]');
const menuBackdrop=$('[data-menu-backdrop]');
let lastMenuFocus=null;
function setMenu(open){
  if(!menu)return;
  menu.classList.toggle('is-open',open);
  menu.setAttribute('aria-hidden',String(!open));
  menuOpen?.setAttribute('aria-expanded',String(open));
  if(menuBackdrop)menuBackdrop.hidden=!open;
  body.classList.toggle('menu-open',open);
  if(open){lastMenuFocus=document.activeElement;setTimeout(()=>$('a,button',menu)?.focus(),20)}
  else if(lastMenuFocus instanceof HTMLElement)lastMenuFocus.focus();
}
menuOpen?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
$$('[data-menu-close]').forEach(control=>control.addEventListener('click',()=>setMenu(false)));
menuBackdrop?.addEventListener('click',()=>setMenu(false));

const searchPanel=$('[data-search-panel]');
const searchOpen=$('[data-search-open]');
const filters=$('[data-filters]');
const filterToggle=$('[data-filter-toggle]');
const filterBackdrop=$('[data-filter-backdrop]');
let lastSearchFocus=null;
let lastFilterFocus=null;
function setSearch(open){
  if(!searchPanel)return;
  searchPanel.classList.toggle('is-open',open);
  searchPanel.setAttribute('aria-hidden',String(!open));
  body.classList.toggle('search-open',open);
  if(open){lastSearchFocus=document.activeElement;setTimeout(()=>$('#site-search')?.focus(),20)}
  else if(lastSearchFocus instanceof HTMLElement)lastSearchFocus.focus();
}
searchOpen?.addEventListener('click',()=>setSearch(true));
$('[data-search-close]')?.addEventListener('click',()=>setSearch(false));

function setFilters(open){
  if(!filters)return;
  filters.classList.toggle('is-open',open);
  filters.setAttribute('aria-hidden',String(!open&&matchMedia('(max-width:760px)').matches));
  filterToggle?.setAttribute('aria-expanded',String(open));
  if(filterBackdrop)filterBackdrop.hidden=!open;
  body.classList.toggle('filter-open',open);
  if(open){lastFilterFocus=document.activeElement;setTimeout(()=>$('[data-filter-close]')?.focus(),20)}
  else if(lastFilterFocus instanceof HTMLElement)lastFilterFocus.focus();
}
if(filters)filters.setAttribute('aria-hidden',String(matchMedia('(max-width:760px)').matches));
filterToggle?.addEventListener('click',()=>setFilters(true));
$('[data-filter-close]')?.addEventListener('click',()=>setFilters(false));
filterBackdrop?.addEventListener('click',()=>setFilters(false));

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(menu?.classList.contains('is-open'))setMenu(false);if(searchPanel?.classList.contains('is-open'))setSearch(false);if(filters?.classList.contains('is-open'))setFilters(false)}
  if(event.key==='Tab'){
    const activeLayer=menu?.classList.contains('is-open')?menu:searchPanel?.classList.contains('is-open')?searchPanel:filters?.classList.contains('is-open')?filters:null;
    if(!activeLayer)return;
    const focusable=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])',activeLayer).filter(el=>el.offsetParent!==null);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

const goals={
  heat:{number:'01',title:'Тепло для дому',copy:'Почніть із джерела тепла, способу розподілу й керування температурою. Для точного підбору знадобиться розрахунок тепловтрат.',links:[['Теплові насоси','heat-pumps'],['Радіатори','radiators'],['Термостати','thermostats']],cta:'heating'},
  cool:{number:'02',title:'Комфортне охолодження',copy:'Визначте площу, кількість кімнат і сценарій використання. Далі порівняйте тип системи, продуктивність, енергоефективність і рівень шуму.',links:[['Кондиціонери','ac'],['Мультиспліт','multi-split'],['Автоматика','automation']],cta:'ac'},
  air:{number:'03',title:'Свіже повітря без втрат тепла',copy:'Почніть з об’єму повітрообміну й планування каналів. Для рекуперації важливі параметри будівлі та сумісність усіх компонентів.',links:[['Вентиляція','ventilation'],['Рекуперація','recuperation'],['Повітроводи','ducts']],cta:'ventilation'},
  save:{number:'04',title:'Керування споживанням',copy:'Оцініть джерело тепла, автоматику й режими роботи як одну систему. Енергоефективність залежить від обладнання, будівлі та налаштувань.',links:[['Теплові насоси','heat-pumps'],['Термостати','thermostats'],['Smart Home','smart-home']],cta:'efficiency'},
  business:{number:'05',title:'Рішення для комерційного об’єкта',copy:'Сформуйте вимоги до площі, навантаження й режиму роботи. Корпоративний клієнт після авторизації бачитиме призначену йому цінову категорію.',links:[['Промисловий клімат','commercial'],['Автоматика','automation'],['Монтажні компоненти','fittings']],cta:'commercial'}
};
$$('[data-goal]').forEach(button=>button.addEventListener('click',()=>{
  const goal=goals[button.dataset.goal];
  if(!goal)return;
  $$('[data-goal]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});
  $('[data-goal-title]').textContent=goal.title;
  $('[data-goal-copy]').textContent=goal.copy;
  $('[data-goal-links]').innerHTML=goal.links.map(([label,slug])=>`<a href="catalog.html?category=${slug}">${label}</a>`).join('');
  $('[data-goal-cta]').href=`catalog.html?category=${goal.cta}`;
  if(window.matchMedia('(max-width: 760px)').matches){$('[data-goal-result]').scrollIntoView({behavior:'smooth',block:'center'})}
}));

$$('[data-product-tab]').forEach(button=>button.addEventListener('click',()=>{
  const kind=button.dataset.productTab;
  $$('[data-product-tab]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});
  $$('[data-product-kind]').forEach(card=>{card.hidden=kind!=='all'&&card.dataset.productKind!==kind});
}));

function applyCatalogFilter(filter,query=''){
  $$('[data-catalog-filter]').forEach(item=>item.classList.toggle('is-active',item.dataset.catalogFilter===filter));
  let visible=0;
  $$('[data-category]').forEach(card=>{
    const categoryMatch=filter==='all'||card.dataset.category===filter;
    const queryMatch=!query||card.textContent.toLocaleLowerCase('uk').includes(query.toLocaleLowerCase('uk'));
    const show=categoryMatch&&queryMatch;
    card.hidden=!show;
    if(show)visible++;
  });
  const label=$('[data-result-count]');if(label)label.textContent=`${visible} ${visible===1?'товар':'товари'}`;
}
$$('[data-catalog-filter]').forEach(button=>button.addEventListener('click',()=>applyCatalogFilter(button.dataset.catalogFilter)));

if(body.dataset.page==='catalog'){
  $$('.product-grid--listing .product-card').forEach(card=>{
    const link=card.querySelector('.product-card__footer a');
    const name=card.querySelector('h3')?.textContent?.trim();
    if(link){link.textContent='Деталі →';if(name)link.setAttribute('aria-label',`Переглянути ${name}`)}
  });
  const params=new URLSearchParams(location.search);
  const requested=params.get('category');
  const query=params.get('q')?.trim()||'';
  const heating=new Set(['heating','radiators','heat-pumps','boilers','floor','fireplaces']);
  const climate=new Set(['climate','ac']);
  const filter=heating.has(requested)?'heating':climate.has(requested)?'climate':requested==='automation'?'automation':requested?'none':'all';
  applyCatalogFilter(filter,query);
  if(query){const heading=$('.catalog-heading h1');if(heading)heading.textContent=`Пошук: ${query}`}
}

const pdpProducts={
  radiator:{title:'Панельний радіатор AIRFEL Klasik 22 / 600 / 600',short:'AIRFEL Klasik',category:'Радіатори · AIRFEL',image:'assets/media/radiator-airfel.jpg',alt:'Панельний радіатор AIRFEL Klasik',specs:[['Потужність','1007 Вт'],['Висота','600 мм'],['Довжина','600 мм'],['Тип','22']]},
  'heat-pump':{title:'Тепловий насос Daikin Altherma 3 M EDLA04E3V3',short:'Daikin Altherma 3 M',category:'Теплові насоси · DAIKIN',image:'assets/media/heat-pump-daikin.jpg',alt:'Тепловий насос Daikin Altherma 3 M',specs:[['Діапазон','3–6 кВт'],['Бренд','Daikin'],['Режим','опалення'],['Тип','моноблок']]},
  boiler:{title:'Конденсаційний котел ROTEX GW Smart 24C',short:'ROTEX GW Smart 24C',category:'Котли · ROTEX',image:'assets/media/boiler-rotex.jpg',alt:'Конденсаційний котел ROTEX GW Smart 24C',specs:[['Потужність','2,8–24 кВт'],['Бренд','ROTEX'],['Тип','конденсаційний'],['Режим','комбінований']]},
  ac:{title:'Кондиціонер Daikin Stylish FTXA20AW',short:'Daikin Stylish FTXA20AW',category:'Кондиціонери · DAIKIN',image:'assets/media/ac-daikin-stylish.jpeg',alt:'Кондиціонер Daikin Stylish FTXA20AW',specs:[['Серія','Stylish'],['Бренд','Daikin'],['Колір','білий'],['Тип','настінний']]}
};
if(body.dataset.page==='product'){
  const key=new URLSearchParams(location.search).get('product')||'radiator';
  const product=pdpProducts[key]||pdpProducts.radiator;
  document.title=`${product.short} — INVERA HOLDING`;
  const title=$('.pdp-info h1');if(title)title.textContent=product.title;
  const category=$('.pdp-info__category');if(category)category.textContent=product.category;
  const image=$('[data-pdp-image]');if(image){image.src=product.image;image.alt=product.alt}
  const crumb=$('.breadcrumbs span:last-child');if(crumb)crumb.textContent=product.short;
  const crumbCategory=$('.breadcrumbs a:last-of-type');
  const categorySlug={radiator:'radiators','heat-pump':'heat-pumps',boiler:'boilers',ac:'ac'}[key]||'radiators';
  if(crumbCategory){crumbCategory.textContent=product.category.split(' · ')[0];crumbCategory.href=`catalog.html?category=${categorySlug}`}
  const specs=$('.pdp-specs');if(specs)specs.innerHTML=product.specs.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  const details=$('.pdp-details dl');if(details)details.innerHTML=product.specs.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

if(location.hash){setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView(),80)}
