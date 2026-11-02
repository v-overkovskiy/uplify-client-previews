(function(){
  'use strict';
  var BASE='https://prom.ua/ua/c4123141-puhnastij-svit.html';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var money=function(x){x=Math.round(x*100)/100;var s=(x%1?x.toFixed(2).replace('.',','):String(Math.round(x)));return s.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' ₴'};

  /* sticky header height for the hero and anchors */
  var head=$('.site-head');
  function setHead(){document.documentElement.style.setProperty('--head-h',head.offsetHeight+'px')}
  setHead();addEventListener('resize',setHead);

  /* mobile menu */
  var burger=$('#burger'),nav=$('#nav');
  burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);setHead()});
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')})});

  /* working hours: every day 10:00-18:00, Kyiv time */
  function kyivHour(){
    var d=new Date(),h=NaN,m=0,zone=['Europe/Kyiv','Europe/Kiev'];
    for(var i=0;i<zone.length&&isNaN(h);i++){try{var p=new Intl.DateTimeFormat('en-GB',{timeZone:zone[i],hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d);p.forEach(function(x){if(x.type==='hour')h=parseInt(x.value,10);if(x.type==='minute')m=parseInt(x.value,10)})}catch(e){}}
    return isNaN(h)?null:h+m/60;
  }
  var t=kyivHour(),st=$('#status'),dot=$('#dot'),st2=$('#status2');
  if(t!==null){
    var open=t>=10&&t<18;
    var txt=open?'Зараз працюємо до 18:00':(t<10?'Зараз зачинено, відкриємося о 10:00':'Зараз зачинено, відкриємося завтра о 10:00');
    st.textContent=txt;if(!open)dot.classList.add('off');if(st2)st2.textContent=txt+'.';
  }

  /* finder: maps to real Prom groups */
  var G={dogs:['145273135',62,'Собаки'],cats:['145273133',75,'Коти'],pup:['145278986',33,'Цуценята'],kit:['145278987',17,'Кошенята'],vet:['145273139',90,'Ветеринарні дієти'],wet:['145274539',65,'Вологі корми']};
  var f=$('#finder'),go=$('#finder-go'),note=$('#finder-note'),young=$('#young-lbl');
  function plural(n){var a=n%10,b=n%100;return (a===1&&b!==11)?'товар':(a>=2&&a<=4&&(b<12||b>14))?'товари':'товарів'}
  function finder(){
    var pet=f.pet.value,need=f.need.value;
    young.textContent=pet==='dog'?'Для цуценят':'Для кошенят';
    var key=need==='daily'?(pet==='dog'?'dogs':'cats'):need==='young'?(pet==='dog'?'pup':'kit'):need;
    var g=G[key];
    go.href=BASE+'?product_group='+g[0];
    go.textContent='Показати '+g[1]+' '+plural(g[1]);
    note.textContent='Розділ «'+g[2]+'»'+((key==='vet'||key==='wet')?' для собак і котів':'')+', відкриється на Prom';
    $('#finder-warn').hidden=need!=='vet';
    var ex=(window.CATALOG||[]).filter(function(r){return r[7].indexOf(g[0])>-1}).sort(function(a,b){return (b[6]-a[6])||(a[3]-b[3])}).slice(0,3);
    var box=$('#finder-ex');box.innerHTML='';
    if(ex.length){var lab=document.createElement('span');lab.textContent='Наприклад:';box.appendChild(lab);
      ex.forEach(function(r){var a=document.createElement('a');a.href='https://prom.ua/ua/p'+r[0]+'-'+r[4]+'.html';a.target='_blank';a.rel='noopener';a.innerHTML='<span></span>';a.firstChild.textContent=r[2].length>34?r[2].slice(0,32).trim()+'…':r[2];a.appendChild(document.createTextNode(' '+money(r[3])));box.appendChild(a)})}
  }
  f.addEventListener('change',finder);finder();

  /* tabs */
  var tabs=$$('[role=tab]');
  function sel(tab){tabs.forEach(function(x){var on=x===tab;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;$('#'+x.getAttribute('aria-controls')).hidden=!on});tab.focus()}
  tabs.forEach(function(tb,i){
    tb.addEventListener('click',function(){sel(tb)});
    tb.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();sel(tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length])}});
  });

  /* typeahead over the catalogue snapshot */
  var q=$('#q'),box=$('#sugg'),items=[],cur=-1;
  function href(r){return 'https://prom.ua/ua/p'+r[0]+'-'+r[4]+'.html'}
  function render(list,term){
    box.innerHTML='';items=[];cur=-1;
    if(!term){box.hidden=true;q.setAttribute('aria-expanded','false');return}
    if(!list.length){box.innerHTML='<li class="none" role="option" aria-selected="false">Нічого не знайшли в демо-каталозі. Спробуйте «Royal Canin» або «Monge».</li>'}
    list.forEach(function(r,i){
      var li=document.createElement('li');li.role='presentation';
      var a=document.createElement('a');a.href=href(r);a.target='_blank';a.rel='noopener';a.setAttribute('role','option');a.id='s'+i;a.setAttribute('aria-selected','false');
      var n=document.createElement('span');var tp=document.createElement('i');tp.className='tp';tp.textContent=r[5]==='a'?'аксесуар':'корм';var em=document.createElement('em');em.textContent=r[2];n.appendChild(tp);n.appendChild(em);
      var p=document.createElement('b');p.textContent=money(r[3]);
      a.appendChild(n);a.appendChild(p);li.appendChild(a);box.appendChild(li);items.push(a);
    });
    var more=document.createElement('li');more.className='more';more.innerHTML='<a href="'+BASE+'" target="_blank" rel="noopener">Усі товари магазину на Prom</a>';box.appendChild(more);
    box.hidden=false;q.setAttribute('aria-expanded','true');
  }
  function search(){
    var term=q.value.trim().toLowerCase();
    if(!term){render([],'');return}
    var AL=[[/роял|ройал/g,'royal'],[/канін|канин/g,'canin'],[/монж/g,'monge'],[/урінар\S*|уринар\S*/g,'urinary'],[/гастро\S*/g,'gastro'],[/ренал\S*/g,'renal'],[/гепатік\S*|гепатик\S*/g,'hepatic'],[/гіпоалерг\S*|гипоалерг\S*/g,'hypo'],[/стерил\S*/g,'sterilised'],[/кошеня\S*|кошенят\S*/g,'kitten'],[/цуцен\S*/g,'puppy']];
    AL.forEach(function(p){term=term.replace(p[0],p[1])});
    var parts=term.split(/\s+/),out=[];
    (window.CATALOG||[]).forEach(function(r){
      var s=r[1],ok=parts.every(function(x){return s.indexOf(x)>-1});
      if(ok)out.push([(r[5]==='a'?1000:0)+s.indexOf(parts[0])-Math.min(r[6],20),r]);
    });
    out.sort(function(a,b){return a[0]-b[0]});
    render(out.slice(0,6).map(function(x){return x[1]}),term);
  }
  function mark(i){items.forEach(function(a,k){a.setAttribute('aria-selected',k===i)});cur=i;if(i>-1)q.setAttribute('aria-activedescendant',items[i].id);else q.removeAttribute('aria-activedescendant')}
  q.addEventListener('input',search);
  q.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();if(items.length)mark((cur+1)%items.length)}
    else if(e.key==='ArrowUp'){e.preventDefault();if(items.length)mark((cur-1+items.length)%items.length)}
    else if(e.key==='Enter'){e.preventDefault();var a=items[cur>-1?cur:0];if(a)window.open(a.href,'_blank','noopener')}
    else if(e.key==='Escape'){render([],'');q.value=''}
  });
  document.addEventListener('click',function(e){if(!$('#search').contains(e.target))render([],'')});

  /* hits carousel: slow auto-scroll loop, pauses on hover/focus/touch/offscreen, manual arrows, pause button */
  (function(){
    var track=$('#car-track'); if(!track)return;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cards=$$('.card',track);
    cards.forEach(function(c){var k=c.cloneNode(true);k.setAttribute('aria-hidden','true');$$('a,button',k).forEach(function(x){x.tabIndex=-1});track.appendChild(k)});
    var prev=$('#car-prev'),next=$('#car-next'),pauseBtn=$('#car-pause');
    var loopW=function(){return cards.length?track.children[cards.length].offsetLeft-track.children[0].offsetLeft:0};
    var SPEED=38,acc=0,last=0,hold=false,user=reduce,visible=true,resumeAt=0,raf=0;
    function setPause(v){user=v;pauseBtn.setAttribute('aria-pressed',v);pauseBtn.querySelector('.sr').textContent=v?'Грати':'Пауза';
      pauseBtn.querySelector('svg').innerHTML=v?'<path d="M8 5v14l11-7z"/>':'<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>'}
    setPause(reduce);
    if(reduce){pauseBtn.hidden=true}
    pauseBtn.addEventListener('click',function(){setPause(!user)});
    function wrap(){var w=loopW();if(!w)return;if(track.scrollLeft>=w)track.scrollLeft-=w;else if(track.scrollLeft<=0&&!hold)track.scrollLeft+=w}
    function tick(t){
      raf=requestAnimationFrame(tick);
      if(!last){last=t;return}
      var dt=Math.min(t-last,64);last=t;
      if(user||hold||!visible||document.hidden||t<resumeAt)return;
      acc+=SPEED*dt/1000;var step=Math.floor(acc);
      if(step>=1){acc-=step;track.scrollLeft+=step;wrap()}
    }
    track.addEventListener('scroll',function(){var w=loopW();if(w&&track.scrollLeft<=0)track.scrollLeft=w},{passive:true});
    function by(dir){var c=track.children[0],w=c.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||16);
      track.scrollBy({left:dir*w,behavior:reduce?'auto':'smooth'});resumeAt=performance.now()+4500;setTimeout(wrap,420)}
    prev.addEventListener('click',function(){by(-1)});next.addEventListener('click',function(){by(1)});
    var sec=track.closest('section');
    sec.addEventListener('mouseenter',function(){hold=true});sec.addEventListener('mouseleave',function(){hold=false});
    sec.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches(':focus-visible'))hold=true});sec.addEventListener('focusout',function(){hold=false});
    track.addEventListener('touchstart',function(){hold=true},{passive:true});
    track.addEventListener('touchend',function(){hold=false;resumeAt=performance.now()+3000},{passive:true});
    track.addEventListener('wheel',function(){resumeAt=performance.now()+3000},{passive:true});
    track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){by(1)}else if(e.key==='ArrowLeft'){by(-1)}});
    if('IntersectionObserver' in window){new IntersectionObserver(function(en){visible=en[0].isIntersecting},{threshold:.1}).observe(track)}
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){track.scrollLeft=0})}
    raf=requestAnimationFrame(tick);
  })();

  /* local demo cart */
  var cart={},scrim=$('#scrim'),panel=$('#cart'),lastFocus=null;
  function count(){return Object.keys(cart).reduce(function(s,k){return s+cart[k].qty},0)}
  function draw(){
    var list=$('#cart-list'),ids=Object.keys(cart),tot=0;list.innerHTML='';
    ids.forEach(function(id){
      var it=cart[id];tot+=it.price*it.qty;
      var li=document.createElement('li');
      li.innerHTML='<img alt="" width="72" height="72"><div><p class="n"></p><div class="q"><button type="button" data-d aria-label="Менше">−</button><span aria-live="polite"></span><button type="button" data-i aria-label="Більше">+</button></div><a class="go" target="_blank" rel="noopener">Замовити на Prom</a></div><span class="sum"></span>';
      li.querySelector('img').src=it.img;li.querySelector('.n').textContent=it.name;li.querySelector('.q span').textContent=it.qty;li.querySelector('.sum').textContent=money(it.price*it.qty);li.querySelector('.go').href=it.url;
      li.querySelector('[data-d]').onclick=function(){if(--it.qty<1)delete cart[id];draw()};
      li.querySelector('[data-i]').onclick=function(){it.qty++;draw()};
      list.appendChild(li);
    });
    $('#cart-empty').hidden=ids.length>0;$('#cart-total').textContent=money(tot);
    var n=count();$('#cart-count').textContent=n;$('#cart-open').setAttribute('aria-label','Демо-кошик, товарів: '+n);
  }
  function openCart(){lastFocus=document.activeElement;panel.hidden=false;requestAnimationFrame(function(){panel.classList.add('on');scrim.classList.add('on')});$('#cart-close').focus()}
  function closeCart(){panel.classList.remove('on');scrim.classList.remove('on');setTimeout(function(){panel.hidden=true},280);if(lastFocus)lastFocus.focus()}
  $('#cart-open').addEventListener('click',openCart);$('#cart-close').addEventListener('click',closeCart);scrim.addEventListener('click',closeCart);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)closeCart()});
  $$('[data-add]').forEach(function(b){b.addEventListener('click',function(){
    var id=b.dataset.id;cart[id]=cart[id]||{name:b.dataset.name,price:parseFloat(b.dataset.price),img:b.dataset.img,url:b.dataset.url,qty:0};cart[id].qty++;draw();
    var o=b.textContent;b.textContent='Додано';b.setAttribute('aria-live','polite');setTimeout(function(){b.textContent=o},1200);
  })});
  draw();
})();
