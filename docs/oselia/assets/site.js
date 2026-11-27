(function(){
'use strict';
var CAT=window.CAT||{};var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var nf=new Intl.NumberFormat('uk-UA',{maximumFractionDigits:2,minimumFractionDigits:0});
var nf0=new Intl.NumberFormat('uk-UA',{maximumFractionDigits:0});
var money=function(n){var r=Math.round(n*100)/100;return (Number.isInteger(r)?nf0:nf2).format(r)+'\u00a0₴'};
var moneyR=function(n){return nf0.format(Math.round(n))+'\u00a0₴'};
var UL={'кв.м':'м²','пог.м':'пог. м','упаковка':'упак.','рулон':'рулон','м':'м'};
var uLbl=function(u){return UL[u]||u||''};
var plU=function(n){var m=n%100,d=n%10;return m>10&&m<15?'позицій':d===1?'позиція':d>1&&d<5?'позиції':'позицій'};
var packOf=function(p){if(!p||p.u!=='кв.м')return 0;var m=String(p.n).match(/Площа\s*-?\s*(\d+(?:[.,]\d+)?)\s*м[2²]/i);return m?parseFloat(m[1].replace(',','.')):0};
var packTxt=function(a){return 'упак. '+nf.format(a)+' м²'};
var priceU=function(p){var a=packOf(p);return a?{p:p.p*a,u:packTxt(a),m2:p.p}:{p:p.p,u:uLbl(p.u),m2:0}};
var nf2=new Intl.NumberFormat('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2});
var money2=function(n){return nf2.format(Math.round(n*100)/100).replace(/\u00a0/g,'\u00a0')+'\u00a0₴'};
var cl=function(x){return Math.ceil(x-1e-9)};
function gutLines(sys,ci,L,H,Nn,C){
  var s=CAT.gut.systems[sys],col=s.colors[ci],N=Nn||Math.max(1,cl(L/10)),out=[];
  var P=function(k){return col.parts[k]};
  var add=function(k,q,why){if(q>0&&P(k))out.push({p:P(k),q:q,why:why})};
  var pcs=cl(H/3),hold=cl(L*5/3)+1;
  if(sys==='bryza'){
    var gl=cl(L/3);
    add('gutter',gl,'ринва 3 м');add('joint',Math.max(0,gl-1),'з\'єднання ринви');add('outlet',N,'воронка');add('capR',1,'права заглушка');add('capL',1,'ліва заглушка');add('corner',C,'зовнішній кут');add('holder',hold,'тримачі через 0,6 м');
    add('pipe',N*pcs,'труба 3 м');add('coupler',N*Math.max(0,pcs-1),'муфти труби');add('elbow',N*2,'коліна труби');
  }else{
    var g4=cl(L/4);
    add('gutter',g4,'ринва 4 м');add('joint',Math.max(0,g4-1),'з\'єднання ринви');add('outlet',N,'лійка');add('cap',2,'заглушки');add('corner',C,'зовнішній кут');add('holder',hold,'гаки через 0,6 м');
    add('pipe',N*pcs,'труба 3 м');add('elbow',N,'верхнє коліно');add('clamp',N*cl(H/2),'хомути труби');
  }
  return out;
}
function gutTotal(ls){return ls.reduce(function(a,l){return a+l.p.p*l.q},0)}
var byId=Object.create(null);(CAT.products||[]).forEach(function(p){byId[p.id]=p});
var ROOT=document.documentElement.getAttribute('data-root')||'';
var ICON=function(n){return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(CAT.icons[n]||'')+'</svg>'};
var stTxt={in:'В наявності',order:'Під замовлення',out:'Немає в наявності',ask:'Ціна за запитом'};

/* ---------- cart ---------- */
function cleanLine(l){if(!l||typeof l!=='object'||l.k==null||l.n==null)return null;var q=Math.round(Number(l.q));if(!isFinite(q)||q<1)return null;var p=Number(l.p);return {k:String(l.k),n:String(l.n),p:isFinite(p)&&p>0?p:null,f:!!l.f,s:l.s?String(l.s):'',img:l.img?String(l.img):'',q:Math.min(q,9999),u:l.u?String(l.u):''}}
var cart=[];try{var raw=JSON.parse(localStorage.getItem('osCartV2')||'[]');if(Array.isArray(raw))cart=raw.map(cleanLine).filter(Boolean)}catch(e){cart=[]}
function save(){try{localStorage.setItem('osCartV2',JSON.stringify(cart))}catch(e){}render()}
function count(){return cart.reduce(function(a,l){return a+l.q},0)}
function pushLine(l){l=cleanLine(l);if(!l)return;var f=cart.filter(function(x){return x.k===l.k})[0];if(f){f.q=Math.min(9999,f.q+l.q);if(!f.u&&l.u)f.u=l.u;if(l.f)f.f=true}else cart.push(l)}
window.OsCart={add:function(l){pushLine(l);save();openDrawer()},addMany:function(ls){ls.forEach(pushLine);save();openDrawer()}};
window.addEventListener('storage',function(e){if(e.key==='osCartV2'){try{var r=JSON.parse(e.newValue||'[]');cart=Array.isArray(r)?r.map(cleanLine).filter(Boolean):[]}catch(x){cart=[]}render()}});
function th(s){return s&&s.indexOf('assets/img/p/')===0?s.replace('assets/img/p/','assets/img/t/'):s}
function lineFromProduct(p,q){var a=packOf(p);return {k:p.id,n:p.n,p:a&&p.p?p.p*a:p.p,f:p.f,img:p.img,q:q||1,u:a?packTxt(a):(p.u||'')}}
function render(){
  var cn=cart.length;$$('.cartn').forEach(function(b){b.textContent=cn>99?'99+':cn});
  $$('[data-to-talon],[data-clear]').forEach(function(b){b.hidden=!cart.length});
  var db=$('#dbody');if(!db)return;
  if(!cart.length){db.innerHTML='<p class="note" style="padding:20px 0">У кошику поки порожньо. Додайте товари або складіть комплект водостоку.</p>';$('#dtot').textContent='0 ₴';return}
  var tot=0,ask=0;
  var sy={};cart.forEach(function(l){if(l.s)sy[l.s]=1});
  var warn=Object.keys(sy).length>1?'<p class="dwarn" role="status">У кошику деталі двох водостічних систем (BRYZA і STRUGA). Вони між собою несумісні, залиште одну систему.</p>':'';
  db.innerHTML=warn+cart.map(function(l,i){if(l.p)tot+=l.p*l.q;else ask++;return '<div class="dr"><img src="'+esc(th(l.img)||CAT.placeholder)+'" alt="" width="56" height="56"><div>'+esc(l.n)+'<small>'+(l.p?(l.f?'від ':'')+money(l.p)+(l.u?' / '+esc(uLbl(l.u)):'')+' × '+l.q:'Ціна за запитом × '+l.q)+'</small><span class="qs"><button data-dq="-1" data-i="'+i+'" aria-label="Менше: '+esc(l.n)+'"'+(l.q<2?' disabled':'')+'>−</button><b aria-live="polite">'+l.q+'</b><button data-dq="1" data-i="'+i+'" aria-label="Більше: '+esc(l.n)+'">+</button></span></div><button class="chip" data-rm="'+i+'" aria-label="Прибрати '+esc(l.n)+'">×</button></div>'}).join('');
  $('#dtot').textContent=money(tot)+(ask?' + запит':'')+(cart.some(function(l){return l.f})?' (від)':'');
}
var drTrig=null;
function openDrawer(){var d=$('#drawer');if(!d)return;if(!d.classList.contains('open'))drTrig=document.activeElement;d.classList.add('open');$('#scrim').classList.add('open');$$('header.site,main,footer.site').forEach(function(x){x.inert=true});$$('[data-open-cart]').forEach(function(b){b.setAttribute('aria-expanded','true')});var c=$('[data-close-cart]',d);if(c)c.focus()}
function closeDrawer(){var d=$('#drawer');if(!d||!d.classList.contains('open'))return;d.classList.remove('open');$('#scrim').classList.remove('open');$$('header.site,main,footer.site').forEach(function(x){x.inert=false});$$('[data-open-cart]').forEach(function(b){b.setAttribute('aria-expanded','false')});if(drTrig&&document.contains(drTrig))drTrig.focus();drTrig=null}
document.addEventListener('keydown',function(e){var d=$('#drawer');if(e.key!=='Tab'||!d||!d.classList.contains('open'))return;var f=$$('button:not([disabled]),a[href],input,[tabindex]:not([tabindex="-1"])',d).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}else if(!d.contains(document.activeElement)){e.preventDefault();a.focus()}});

/* ---------- header, mega, search ---------- */
var hdr=$('header.site');if(hdr){var tk=false,ly=0;window.addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){var y=window.scrollY,cp=hdr.classList.contains('compact');hdr.classList.toggle('compact',cp?y>90:y>150);var h1=$('.h1r',hdr),busy=hdr.contains(document.activeElement)||$('.mega.open',hdr);if(h1)hdr.style.setProperty('--h1h',h1.offsetHeight+'px');if(y<150||busy||y<ly-4)hdr.classList.remove('tuck');else if(y>ly+4)hdr.classList.add('tuck');ly=y;tk=false})},{passive:true})}
var mega=$('#mega'),catbtn=$('#catbtn');
function megaShow(id){
  var g=CAT.groups.filter(function(x){return x.id===id})[0]||CAT.groups[0];
  $$('#mrail button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.g===g.id)});
  $('#mmain').innerHTML='<h3>'+esc(g.name)+'</h3><div class="mcols">'+g.subs.map(function(s){return '<a href="'+ROOT+g.file+(s.anchor?'#'+s.anchor:'')+'">'+esc(s.n)+'<small>'+s.c+'</small></a>'}).join('')+'</div><a class="all" href="'+ROOT+g.file+'">Усі товари розділу '+ICON('arrow')+'</a>';
  $('#mside').innerHTML=g.tiles.map(function(id){var p=byId[id];if(!p)return '';return '<a class="mtile" href="'+ROOT+'product.html?id='+p.id+'"><img src="'+ROOT+esc(th(p.img)||CAT.placeholder)+'" alt="" width="72" height="72"><span>'+esc(p.n.length>60?p.n.slice(0,58)+'…':p.n)+'<small>'+(p.p?(p.f?'від ':'')+money(p.p):'Ціна за запитом')+'</small></span></a>'}).join('')+'<div class="mhint"><b>Не знаєте, що обрати?</b><span>Назвіть розміри даху, а ми підберемо й порахуємо комплект.</span><a href="'+ROOT+'index.html#talon">Отримати розрахунок →</a></div>';
}
function megaOpen(o,id){if(!mega)return;mega.classList.toggle('open',o);catbtn.setAttribute('aria-expanded',o);if(o)megaShow(id||CAT.groups[0].id)}
if(catbtn){
  $('#mrail').innerHTML=CAT.groups.map(function(g){return '<button data-g="'+g.id+'" aria-pressed="false">'+ICON(g.icon)+esc(g.name)+ICON('chev').replace('class="ico"','class="ico chev"')+'</button>'}).join('');
  catbtn.addEventListener('click',function(e){e.stopPropagation();var was=mega.classList.contains('open');megaOpen(!was);if(!was&&e.detail===0){var fb=$('#mrail button');if(fb)fb.focus()}});
  $('#mrail').addEventListener('keydown',function(e){var l=$$('#mrail button'),i=l.indexOf(document.activeElement);if(i<0)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var n=l[(i+(e.key==='ArrowDown'?1:l.length-1))%l.length];n.focus();megaShow(n.dataset.g)}else if(e.key==='ArrowRight'){var a=$('#mmain a');if(a){e.preventDefault();a.focus()}}});
  $('#mrail').addEventListener('click',function(e){var b=e.target.closest('button');if(b)megaShow(b.dataset.g)});
  mega.addEventListener('click',function(e){if(e.target.closest('a'))megaOpen(false)});
  $('#mrail').addEventListener('mouseover',function(e){var b=e.target.closest('button');if(b&&matchMedia('(hover:hover)').matches)megaShow(b.dataset.g)});
  document.addEventListener('click',function(e){if(mega.classList.contains('open')&&!e.target.closest('#mega'))megaOpen(false);if(!e.target.closest('.search')){$('#sugg').classList.remove('open');if(q)q.setAttribute('aria-expanded','false')}});
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(mega){var inM=mega.contains(document.activeElement);var wasOpen=mega.classList.contains('open');megaOpen(false);if(wasOpen&&inM&&catbtn)catbtn.focus()}closeDrawer();var s=$('#sugg');if(s){var wasS=s.classList.contains('open');s.classList.remove('open');if(wasS)sdis=true;if(q){q.setAttribute('aria-expanded','false');if(wasS&&s.contains(document.activeElement))q.focus()}}}});
var q=$('#q'),sg=$('#sugg'),sdis=false;
function suggest(){
  var v=q.value.trim().toLowerCase().replace(/[×*]/g,'x'),h='';
  if(v.length<2){h='<h4>Що робимо?</h4>'+CAT.tasks.map(function(t){return '<a href="'+ROOT+t.href+'">'+ICON(t.icon)+esc(t.n)+'</a>'}).join('')}
  else{
    var words=v.split(/\s+/);
    var ts=CAT.tasks.filter(function(t){return (t.n+' '+t.kw).toLowerCase().indexOf(v)>-1||words.every(function(w){return (t.n+' '+t.kw).toLowerCase().indexOf(w)>-1})});
    var ps=(CAT.products||[]).filter(function(p){var n=p.n.toLowerCase().replace(/[×*]/g,'x');return words.every(function(w){return n.indexOf(w)>-1})}).slice(0,6);
    if(ts.length)h+='<h4>Завдання</h4>'+ts.map(function(t){return '<a href="'+ROOT+t.href+'">'+ICON(t.icon)+esc(t.n)+'</a>'}).join('');
    if(ps.length)h+='<h4>Товари</h4>'+ps.map(function(p){return '<a href="'+ROOT+'product.html?id='+p.id+'"><img src="'+ROOT+esc(th(p.img)||CAT.placeholder)+'" alt="" width="38" height="38"><span>'+esc(p.n)+'</span><small>'+(p.p?money(p.p):'')+'</small></a>'}).join('');
    if(!h)h='<h4>Нічого не знайдено</h4><a href="'+ROOT+'index.html#talon">'+ICON('calc')+'Залишити запит на підбір</a>';
  }
  sg.innerHTML=h;sg.setAttribute('role','listbox');$$('h4',sg).forEach(function(x){x.setAttribute('role','presentation')});$$('a',sg).forEach(function(x){x.setAttribute('role','option')});sg.classList.add('open');q.setAttribute('aria-expanded','true');var ss=$('#sstat');if(ss){var nA=sg.querySelectorAll('a').length;ss.textContent=nA?('Підказок: '+nA):'Нічого не знайдено'}
}
if(q){sg.addEventListener('keydown',function(e){if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;var l=$$('a',sg),i=l.indexOf(document.activeElement);e.preventDefault();if(e.key==='ArrowDown')(l[i+1]||l[0]).focus();else if(i<=0)q.focus();else l[i-1].focus()});q.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){var f=sg.querySelector('a');if(f){e.preventDefault();f.focus()}}});q.addEventListener('keydown',function(e){if(e.key==='Escape')e.preventDefault()});q.addEventListener('input',function(){sdis=false;suggest()});q.addEventListener('focus',function(){if(!sdis)suggest()});q.addEventListener('click',function(){sdis=false;suggest()});$('#sform').addEventListener('submit',function(e){e.preventDefault();var f=sg.querySelector('a');if(f)location.href=f.href})}
$$('[data-open-cart]').forEach(function(b){b.addEventListener('click',openDrawer)});
$$('[data-close-cart],#scrim').forEach(function(b){b.addEventListener('click',closeDrawer)});
document.addEventListener('click',function(e){
  var rm=e.target.closest('[data-rm]');if(rm){cart.splice(+rm.dataset.rm,1);save();return}
  var dq=e.target.closest('[data-dq]');if(dq){var ln=cart[+dq.dataset.i];if(ln){ln.q=Math.max(1,Math.min(9999,ln.q+(+dq.dataset.dq)));save();var nb=$('[data-dq="'+dq.dataset.dq+'"][data-i="'+dq.dataset.i+'"]');if(!nb||nb.disabled)nb=$('[data-dq="1"][data-i="'+dq.dataset.i+'"]');if(nb)nb.focus()}return}
  var a=e.target.closest('[data-add]');if(a){var p=byId[a.dataset.add];if(p){OsCart.add(lineFromProduct(p,1));if(!a.dataset.lbl)a.dataset.lbl=a.textContent;a.textContent='Додано';clearTimeout(a._t);a._t=setTimeout(function(){a.textContent=a.dataset.lbl},1000)}return}
  if(e.target.closest('[data-clear]')){cart=[];save();return}
  if(e.target.closest('[data-to-talon]')){goTalon('Кошик',cart.map(function(l){return l.n+' × '+l.q}).join('; '))}
});
function goTalon(task,text){try{sessionStorage.setItem('osTalon',JSON.stringify({task:task,text:text}))}catch(x){}
  if($('#tform')){closeDrawer();prefillTalon();var t=$('#talon');if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});if(location.hash!=='#talon')history.replaceState(null,'','#talon')}
  else location.href=ROOT+'index.html#talon'}
render();

/* ---------- listing ---------- */
var lg=$('#lgrid');
if(lg){
  var chips=$$('[data-sub-chip]'),sortSel=$('#lsort'),cur='all';
  var apply=function(){var cards=$$('.pc',lg);cards.forEach(function(c){c.hidden=!(cur==='all'||c.dataset.sub===cur)});
    var vis=cards.filter(function(c){return !c.hidden});
    var s=sortSel?sortSel.value:'def';
    if(s!=='def'){vis.sort(function(a,b){var pa=+a.dataset.price,pb=+b.dataset.price;if(!pa&&!pb)return 0;if(!pa)return 1;if(!pb)return -1;return s==='asc'?pa-pb:pb-pa}).forEach(function(c){lg.appendChild(c)})}
    else{cards.sort(function(a,b){return +a.dataset.i-+b.dataset.i}).forEach(function(c){lg.appendChild(c)})}
    $('#lcount').textContent=vis.length+' '+(vis.length%10===1&&vis.length%100!==11?'товар':(vis.length%10>1&&vis.length%10<5&&(vis.length%100<12||vis.length%100>14)?'товари':'товарів'));
    $('#lempty').hidden=vis.length>0};
  chips.forEach(function(c){c.addEventListener('click',function(){cur=c.dataset.subChip;chips.forEach(function(x){x.setAttribute('aria-pressed',x===c)});apply()})});
  if(sortSel)sortSel.addEventListener('change',apply);
  var fromHash=function(){var h='';try{h=decodeURIComponent(location.hash.slice(1))}catch(x){return}var m=chips.filter(function(c){return c.dataset.anchor===h})[0];if(m)m.click()};
  apply();if(location.hash)fromHash();window.addEventListener('hashchange',fromHash);
}

/* ---------- generic product page ---------- */
var gp=$('#gproduct');
if(gp){
  var id=new URLSearchParams(location.search).get('id'),p=byId[id];
  if(!p){gp.innerHTML='<div class="empty">Товар не знайдено. <a href="'+ROOT+'index.html">На головну</a></div>'}
  else{
    document.title=p.n+' | ОСЕЛЯ (концепт)';
    var g=CAT.groups.filter(function(x){return x.id===p.g})[0];
    $('#gcrumb').innerHTML='<a href="'+ROOT+'index.html">Головна</a> / '+(g?'<a href="'+ROOT+g.file+'">'+esc(g.name)+'</a> / ':'')+'<span>'+esc(p.n)+'</span>';
    var rel=(CAT.products||[]).filter(function(x){return x.g===p.g&&x.id!==p.id&&x.s==='in'}).sort(function(a,b){return (b.sub===p.sub)-(a.sub===p.sub)}).slice(0,4);
    var priceHtml=p.p?'<div class="bp">'+(p.f?'<small>від </small>':'')+money(priceU(p).p)+(priceU(p).u?' <small>/ '+esc(priceU(p).u)+'</small>':'')+'</div>'+(packOf(p)>0?'<p class="note">'+money(p.p)+' за м². Продається упаковками, кількість нижче в упаковках.</p>':'')+(p.u?'':'<p class="note">Одиницю виміру й комплектність уточнює менеджер.</p>')+'<p class="note">Ціна зі старого каталогу, перед запуском її звіряють з обліковою системою.</p>':'<div class="bp" style="font-size:26px">Ціна за запитом</div>';
    var packA=packOf(p)||NaN;
    var calc=(p.p&&p.s!=='out'&&packA>0)?'<div class="pcalc"><label class="fl" for="gA">Площа утеплення, м²</label><input class="inp" id="gA" inputmode="decimal" value="20" aria-describedby="gAr"><p class="note" id="gAr" aria-live="polite"></p><button class="btn line" id="gAset" type="button">Поставити кількість упаковок</button></div>':'';
    var BR=['VELUX','RUUKKI','ROCKWOOL','ISOVER','BRYZA','STRUGA','Strotex','TYTAN','SOUDAL','Alenor','Lenko','Logic'];
    var brand=(BR.filter(function(b){return p.n.toLowerCase().indexOf(b.toLowerCase())>-1})[0])||'';
    var sp=[['Розділ',g?g.name:''],['Тип',p.sub],['Бренд',brand]];
    var mm=p.n.match(/(\d+(?:[.,]\d+)?)\s*мм/i);if(mm)sp.push(['Товщина',mm[1]+' мм']);
    var pa=packOf(p);if(pa)sp.push(['Площа в упаковці',nf.format(pa)+' м²']);
    var ral=p.n.match(/RAL\s*(\d{4})/i);if(ral)sp.push(['Колір','RAL '+ral[1]]);
    sp.push(['Одиниця виміру',packA>0?'упаковка ('+nf.format(packA)+' м²)':(uLbl(p.u)||'уточнює менеджер')],['Наявність',stTxt[p.s]],['Артикул',p.id]);
    var specHtml='<section class="sec"><h2>Характеристики</h2><table class="spec">'+sp.filter(function(r){return r[1]}).map(function(r){return '<tr><th scope="row">'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>'}).join('')+'</table></section>';
    var stem=function(n){return n.replace(/RAL\s*\d{4}/gi,'').replace(/(Темно-коричневий|Золотий дуб|Темний дуб|Білий|Чорний|Коричневий|Графіт|Цегляний|Зелений|Червоний|Вишневий|Мідний)/gi,'').replace(/\d+(?:[.,]\d+)?\s*(мм|см|м[2²]|кв\.м\.?|м)(?![а-яіїєґ])/gi,'').replace(/[\d×x*]+/g,'').replace(/[(),;\-]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase()};
    var sibs=(CAT.products||[]).filter(function(x){return x.g===p.g&&x.sub===p.sub&&stem(x.n)===stem(p.n)});
    var vLabel=function(n){return ((n.match(/RAL\s*\d{4}|Золотий дуб|Темний дуб|\d+(?:[.,]\d+)?\s*мм|\d+(?:[.,]\d+)?\s*(?:кв\.м|м[2²])|\d+[×x*]\d+/gi)||[]).join(' '))||n.slice(0,26)};
    var varHtml=sibs.length>1&&sibs.length<=16?'<div><span class="fl" style="margin-top:0">Інші варіанти</span><div class="seg">'+sibs.map(function(x){return '<a class="chip" href="'+ROOT+'product.html?id='+x.id+'" aria-current="'+(x.id===p.id)+'">'+esc(vLabel(x.n))+'</a>'}).join('')+'</div></div>':'';
    var COMPL={pokrivlia:['472535065','468000037','473940684','961889649'],aksesuary:['1142078941','866389787','549858083'],uteplennia:['502029584','798353324','2551224886']};
    var cp=(COMPL[p.g]||[]).filter(function(i){return i!==p.id&&byId[i]}).map(function(i){return byId[i]});
    var cpHtml=cp.length?'<section class="sec"><h2>Що ще потрібно</h2><div class="grid">'+cp.map(function(r){return cardHtml(r)}).join('')+'</div></section>':(p.g==='vodostik'?'<section class="sec"><div class="teaser"><div><h2>Що ще потрібно</h2><p class="lede">Ринви, труби, муфти й кріплення краще брати комплектом під довжину карниза й висоту труби.</p><div class="acts"><a class="btn" href="'+ROOT+'vodostik.html#konstruktor">Скласти комплект</a></div></div></div></section>':'');
    var act=p.s==='out'||!p.p?'<a class="btn block" href="'+ROOT+'index.html#talon">Запитати '+(p.s==='out'?'наявність':'ціну')+'</a>':'<div style="display:flex;gap:10px"><div class="qty"><button data-q="-1" aria-label="Менше">−</button><input id="gq" value="1" inputmode="numeric" aria-label="'+(packA>0?'Кількість упаковок':'Кількість')+'"><button data-q="1" aria-label="Більше">+</button></div><button class="btn" style="flex:1" id="gadd">До кошика</button></div>';
    gp.innerHTML='<div class="pdp"><div class="gal"><div class="main"><img src="'+ROOT+esc(p.img||CAT.placeholder)+'" alt="'+esc(p.n)+'"></div></div><div class="buy"><span class="st '+p.s+'">'+stTxt[p.s]+'</span><h1>'+esc(p.n)+'</h1>'+priceHtml+varHtml+act+calc+'<div class="ship"><div>'+ICON('truck')+'Доставка по Україні</div><div>'+ICON('calc')+'Порахуємо кількість під ваш об\'єкт</div></div><a class="btn line block" href="'+ROOT+'index.html#talon">Отримати розрахунок</a></div></div>'+specHtml+cpHtml+(rel.length?'<section class="sec"><h2>Також підійде</h2><div class="grid">'+rel.map(function(r){return cardHtml(r)}).join('')+'</div></section>':'');
    if(p.p&&p.s!=='out'){var psb=document.createElement('div');psb.className='sticky';psb.id='psticky';psb.innerHTML='<span class="bp">'+(p.f?'від ':'')+money(priceU(p).p)+(packA>0?'<small> / упак.</small>':'')+'</span><button class="btn" type="button">До кошика</button>';document.body.appendChild(psb);document.body.classList.add('has-sticky');psb.querySelector('button').addEventListener('click',function(){$('#gadd').click()});var gq=$('#gq');gp.addEventListener('click',function(e){var b=e.target.closest('[data-q]');if(b)gq.value=Math.max(1,(parseInt(gq.value)||1)+(+b.dataset.q))});$('#gadd').addEventListener('click',function(){OsCart.add(lineFromProduct(p,Math.max(1,parseInt(gq.value)||1)))});var gA=$('#gA');if(gA){var covered=0;var calcA=function(){var v=parseFloat(gA.value.replace(',','.')),r=$('#gAr');if(!(v>0&&v<=5000)){r.textContent='Вкажіть площу від 1 до 5000 м².';gA.setAttribute('aria-invalid','true');covered=0;return}gA.removeAttribute('aria-invalid');var n=Math.ceil(v/packA-1e-9);covered=n*packA;r.textContent='Потрібно '+n+' упак. Вони покриють '+nf.format(Math.round(covered*100)/100)+' м², запас '+nf.format(Math.round((covered-v)*100)/100)+' м². Орієнтовно '+money(covered*p.p)+'.'};gA.addEventListener('input',calcA);calcA();$('#gAset').addEventListener('click',function(){if(covered>0)gq.value=Math.round(covered/packA)})}}
  }
}
function cardHtml(p){return '<article class="pc"><a class="im" tabindex="-1" aria-hidden="true" href="'+ROOT+'product.html?id='+p.id+'"><img loading="lazy" decoding="async" width="240" height="240" src="'+ROOT+esc(th(p.img)||CAT.placeholder)+'" alt=""></a><a class="nm" href="'+ROOT+'product.html?id='+p.id+'">'+esc(p.n)+'</a>'+(p.s==='ask'?'':'<span class="st '+p.s+'">'+stTxt[p.s]+'</span>')+'<div class="pr"><span class="price">'+(p.p?(p.f?'<small>від </small>':'')+money(priceU(p).p)+(priceU(p).u?'<small> / '+esc(priceU(p).u)+'</small>':''):'<small>За запитом</small>')+'</span>'+(p.p&&p.s!=='out'?'<button class="btn sm" data-add="'+p.id+'">'+(p.s==='order'?'Замовити':'Купити')+'</button>':'<a class="btn sm line" href="'+ROOT+'index.html#talon">Запитати</a>')+'</div></article>'}

/* ---------- window configurator (PDP) ---------- */
var wc=$('#wconf');
if(wc){
  var SER=CAT.win.series,qs=new URLSearchParams(location.search),sid=qs.get('s'),
  st={sr:SER.filter(function(x){return x.id===sid})[0]||SER[SER.length-1],h:qs.get('h')==='bot'?'bot':'top',s:qs.get('size')};
  var sizes=function(){return st.sr.rows.filter(function(r){return r.h===st.h})};
  var draw=function(){
    var rs=sizes();if(!rs.length){st.h=st.h==='top'?'bot':'top';rs=sizes()}
    var prev=st.s,msg='';
    if(!st.s||!rs.some(function(r){return r.k===st.s})){st.s=(rs.filter(function(r){return r.k==='78x118'})[0]||rs[0]).k;if(prev&&st.touched)msg='Розміру '+prev.replace('x','×')+' немає в цій комбінації. Показано '+st.s.replace('x','×')+'.'}
    var nm='VELUX '+st.sr.name;
    $('#wh1').textContent='Мансардне вікно '+nm;document.title='Мансардне вікно '+nm+': розмір і ціна | ОСЕЛЯ (концепт)';
    $('#wser').innerHTML=SER.map(function(x){return '<button class="chip" data-sr="'+x.id+'" aria-pressed="'+(x.id===st.sr.id)+'">'+esc(x.name)+(x.id==='stp'?' <small>двокамерне</small>':'')+'</button>'}).join('');
    $$('[data-h]',wc).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.h===st.h);var has=st.sr.rows.some(function(r){return r.h===b.dataset.h});b.disabled=!has});
    var avail={};rs.forEach(function(r){avail[r.k]=1});var allk={};SER.forEach(function(x){x.rows.forEach(function(r){if(r.h===st.h)allk[r.k]=r})});
    $('#wsizes').innerHTML=Object.keys(allk).map(function(k){return allk[k]}).sort(function(a,b){return a.w-b.w||a.hh-b.hh}).map(function(r){var ok=avail[r.k];return '<button class="chip" data-s="'+r.k+'" aria-pressed="'+(r.k===st.s)+'"'+(ok?'':' disabled title="Немає в серії '+esc(st.sr.name)+'"')+'>'+r.w+'×'+r.hh+' см</button>'}).join('');
    var r=rs.filter(function(x){return x.k===st.s})[0];st.r=r;
    $('#wprice').innerHTML=money(r.p);$('#wst').className='st '+r.s;$('#wst').textContent=stTxt[r.s];
    $('#wname').textContent='Розмір '+r.w+'×'+r.hh+' см, ручка '+(st.h==='top'?'верхня':'нижня');var oh=st.sr.rows.filter(function(x){return x.h!==st.h}).length;$('#wsnote').textContent=msg||(rs.length<oh?'Для цієї ручки доступно '+rs.length+' розмірів із '+oh+'. Інші є з другою ручкою.':'');$('#wspec').innerHTML='<tr><td>Серія</td><td>'+esc(nm)+'</td></tr>'+(st.sr.id==='stp'?'<tr><td>Склопакет</td><td>Двокамерний</td></tr>':'')+'<tr><td>Ручка</td><td>'+(st.h==='top'?'Верхня':'Нижня')+'</td></tr><tr><td>Розмір</td><td>'+r.w+'×'+r.hh+' см</td></tr><tr><td>Наявність</td><td>'+stTxt[r.s]+'</td></tr>';
    var url=new URL(location.href);url.searchParams.set('s',st.sr.id);url.searchParams.set('h',st.h);url.searchParams.set('size',st.s);history.replaceState(null,'',url.pathname+url.search);
    var sp=$('#wsp');if(sp)sp.textContent=money(r.p);
    var ad=$('#wadd');if(ad){ad.disabled=r.s==='out'}
  };
  wc.addEventListener('click',function(e){var b=e.target.closest('[data-sr]');if(b){st.sr=SER.filter(function(x){return x.id===b.dataset.sr})[0];st.touched=true;draw();return}b=e.target.closest('[data-h]');if(b&&!b.disabled){st.h=b.dataset.h;st.touched=true;draw();return}b=e.target.closest('[data-s]');if(b&&!b.disabled){st.s=b.dataset.s;draw();return}
    if(e.target.closest('#wadd')){var r=st.r;if(r.s==='out'){return}var extras=$$('#wopts input:checked').map(function(i){return i.value});OsCart.add({k:r.id,n:r.n,p:r.p,img:CAT.win.img,q:1,u:''});if(extras.length){try{sessionStorage.setItem('osTalon',JSON.stringify({task:'Мансардне вікно',text:r.n+'. Додатково: '+extras.join(', ')}))}catch(x){}}}
    if(e.target.closest('#wtalon')){var extras2=$$('#wopts input:checked').map(function(i){return i.value}).join(', ');goTalon('Мансардне вікно',st.r.n+(extras2?'. Додатково: '+extras2:''))}});
  draw();
  var wth=$$('#wthumbs button'),mi=$('#wmain');wth.forEach(function(b){b.addEventListener('click',function(){mi.src=b.dataset.src;wth.forEach(function(x){x.setAttribute('aria-pressed',x===b)})})});
  var ws=$('#wsticky');if(ws){document.body.classList.add('has-sticky');ws.querySelector('button').addEventListener('click',function(){$('#wadd').click()})}
}

/* ---------- gutter constructor ---------- */
var gc=$('#gcons');
if(gc){
  var G=CAT.gut,gs={sys:'bryza',col:0,L:12,N:null,H:4,C:0,ok:true};
  var LIM={L:[2,100,'Довжина карниза: від 2 до 100 м.'],H:[2,12,'Висота труби: від 2 до 12 м.'],N:[1,20,'Кількість труб: ціле число від 1 до 20.'],C:[0,20,'Зовнішніх кутів: ціле число від 0 до 20.']};
  var cl=function(x){return Math.ceil(x-1e-9)};
  var sysObj=function(){return G.systems[gs.sys]};
  var autoN=function(){return Math.max(1,cl(gs.L/10))};
  var lines=function(){return gutLines(gs.sys,gs.col,gs.L,gs.H,gs.N,gs.C)};
  var gdraw=function(){
    var s=sysObj();
    $$('[data-sys]',gc).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sys===gs.sys)});
    if(gs.col>=s.colors.length)gs.col=0;
    $('#gsw').innerHTML=s.colors.map(function(c,i){return '<button style="background:'+c.hex+'" data-col="'+i+'" aria-pressed="'+(i===gs.col)+'" title="'+esc(c.n)+'" aria-label="'+esc(c.n)+'"'+(c.ok?'':' disabled')+'></button>'}).join('');
    $('#gcn').textContent=s.colors[gs.col].n;
    var Nv=gs.N||autoN(),nfield=$('#gN');if(document.activeElement!==nfield)nfield.value=Nv;
    var ls=lines(),tot=0;
    $('#gres').innerHTML=ls.map(function(l){var sum=l.p.p*l.q;tot+=sum;return '<tr><td class="nm"><img src="'+ROOT+esc(th(l.p.img)||CAT.placeholder)+'" alt="" width="48" height="48"><span>'+esc(l.p.n)+'<br><small class="note">'+esc(l.why)+'</small></span></td><td>'+l.q+'</td><td>'+money2(l.p.p)+'</td><td>'+money2(sum)+'</td></tr>'}).join('');
    $('#gtot').textContent=money2(tot);var t2=$('#gtot2');if(t2)t2.textContent=money2(tot);var sp2=$('#gsp');if(sp2)sp2.textContent=money2(tot);var sb=$('#gsticky button');if(sb)sb.disabled=!gs.ok;var b2=$('#gadd2');if(b2)b2.disabled=!gs.ok;gc._tot=tot;gc._lines=ls;
    $('#gadd').disabled=!gs.ok;$('#gtalon').disabled=!gs.ok;gc.classList.toggle('stale',!gs.ok);
    var L=gs.L,H=gs.H;$('#gdraw').innerHTML='<svg viewBox="0 0 400 130" role="img" aria-label="Схема: довжина карниза '+L+' м, висота труби '+H+' м"><rect x="20" y="22" width="360" height="9" rx="3" fill="#8A8D90"/><path d="M20 22 L380 22" stroke="#26282B" stroke-width="1" stroke-dasharray="4 4"/>'+Array.apply(null,{length:Nv}).map(function(_,i){var x=60+(i*(280/Math.max(1,Nv-1||1)));if(Nv===1)x=200;return '<rect x="'+(x-4)+'" y="31" width="8" height="80" fill="#B9BCBF"/><circle cx="'+x+'" cy="31" r="7" fill="#FFB400" stroke="#26282B" stroke-width="1.5"/>'}).join('')+'<line x1="20" y1="14" x2="380" y2="14" stroke="#26282B"/><text x="200" y="10" text-anchor="middle" font-size="15" font-weight="700" fill="#26282B">'+L+' м карниз</text><line x1="392" y1="31" x2="392" y2="111" stroke="#26282B"/><text x="388" y="75" text-anchor="end" font-size="15" font-weight="700" fill="#26282B" transform="rotate(-90 388 75)">'+H+' м</text><text x="200" y="126" text-anchor="middle" font-size="15" font-weight="700" fill="#686C70">труб: '+Nv+(gs.C>0?' · кутів: '+gs.C:'')+'</text></svg>';
  };
  gc.addEventListener('click',function(e){var b=e.target.closest('[data-sys]');if(b){gs.sys=b.dataset.sys;gs.col=0;gdraw();return}b=e.target.closest('[data-col]');if(b&&!b.disabled){gs.col=+b.dataset.col;gdraw();return}
    if(!gs.ok)return;
    if(e.target.closest('#gadd')){OsCart.addMany(gc._lines.map(function(l){return {k:l.p.id,n:l.p.n,p:l.p.p,f:l.p.f,s:gs.sys,img:l.p.img,q:l.q,u:l.p.u||''}}))}
    if(e.target.closest('#gtalon')){goTalon('Водостік','Водостік '+sysObj().name+', '+sysObj().colors[gs.col].n+'. Карниз '+gs.L+' м, труб '+(gs.N||autoN())+', висота '+gs.H+' м, кутів '+gs.C+'. Орієнтовно '+money(gc._tot))}});
  var gerr=$('#gerr'),gbad={};
  var check=function(key,el,raw,isInt){
    var t=String(raw).trim().replace(',','.'),v=t===''?NaN:Number(t),lim=LIM[key];
    if(key==='N'&&t===''){gs.N=null;delete gbad[key];el.removeAttribute('aria-invalid');return}
    var okv=isFinite(v)&&v>=lim[0]&&v<=lim[1]&&(!isInt||Math.floor(v)===v);
    if(okv){gs[key]=v;if(key==='L')gs.N=null;delete gbad[key];el.removeAttribute('aria-invalid');return}
    gbad[key]=lim[2];el.setAttribute('aria-invalid','true')};
  var gshow=function(){var k=Object.keys(gbad);gs.ok=!k.length;gerr.textContent=k.map(function(x){return gbad[x]}).join(' ');gdraw()};
  [['#gL','L',false],['#gH','H',false],['#gN','N',true],['#gC','C',true]].forEach(function(d){var el=$(d[0]);el.addEventListener('input',function(){check(d[1],el,el.value,d[2]);gshow()});el.addEventListener('blur',function(){if(!gbad[d[1]]){el.value=d[1]==='N'?(gs.N||autoN()):gs[d[1]]}})});
  var qL=parseFloat(new URLSearchParams(location.search).get('L'));if(qL>=2&&qL<=100){gs.L=qL;$('#gL').value=qL}
  gdraw();
  var ga2=$('#gadd2');if(ga2)ga2.addEventListener('click',function(){var b=$('#gadd');if(b&&!b.disabled)b.click()});var gst=$('#gsticky');if(gst){document.body.classList.add('has-sticky');gst.querySelector('button').addEventListener('click',function(){var b=$('#gadd');if(b&&!b.disabled)b.click()})}
}

/* ---------- roof anatomy ---------- */
var an=$('#anat');
if(an){
  var A=CAT.anat,show=function(i){
    var a=A[i];$$('.pt',an).forEach(function(b,k){b.setAttribute('aria-pressed',k===i)});
    var p=byId[a.p];
    $('#acard',an).innerHTML='<span class="num">0'+(i+1)+' / 0'+A.length+'</span><h3>'+esc(a.t)+'</h3><p>'+esc(a.d)+'</p>'+(p?'<a class="ap" href="'+ROOT+'product.html?id='+p.id+'"><img src="'+ROOT+esc(th(p.img)||CAT.placeholder)+'" alt="" width="64" height="64"><span><b>'+esc(p.n)+'</b><small>'+(p.p?(p.f?'від ':'')+money(p.p):'Ціна за запитом')+'</small></span></a>':'')+'<div class="acts"><a class="btn" href="'+ROOT+a.href+'">'+esc(a.cta)+'</a></div>';
  };
  $$('.pt',an).forEach(function(b,i){b.addEventListener('click',function(){show(i)})});show(0);
}

/* ---------- how it works: scroll-linked fill ---------- */
var hs=$('#steps');
if(hs&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  var sfl=$('.sfill',hs),sts=$$('.step',hs),hq=false;hs.classList.add('anim');
  var hupd=function(){
    hq=false;
    var rem=parseFloat(getComputedStyle(document.documentElement).fontSize),pad=rem*1.25,r=hs.getBoundingClientRect(),track=Math.max(1,r.height-pad*2);
    var len=Math.max(0,Math.min(track,window.innerHeight*0.62-r.top-pad));
    sfl.style.height=len+'px';
    sts.forEach(function(s){s.classList.toggle('on',len>=s.offsetTop+rem*2.25-pad-1)});
  };
  var hreq=function(){if(!hq){hq=true;requestAnimationFrame(hupd)}};
  window.addEventListener('scroll',hreq,{passive:true});window.addEventListener('resize',hreq);hupd();
}


/* ---------- hero calculator ---------- */
var hc=$('#hcalc');
if(hc){
  var hA=$('#hcA'),hL=$('#hcL'),hErr=$('#hcerr'),ISO=byId['465794444'],ISOA=10.08,hres={};
  var num=function(el){return parseFloat(String(el.value).trim().replace(',','.'))};
  var hcalc=function(){
    var a=num(hA),l=num(hL),bad=[];
    var okA=a>=10&&a<=1000,okL=l>=4&&l<=100;
    if(!okA)bad.push('Площа даху: від 10 до 1000 м².');
    if(!okL)bad.push('Довжина карниза: від 4 до 100 м.');
    hA.setAttribute('aria-invalid',okA?'false':'true');hL.setAttribute('aria-invalid',okL?'false':'true');
    hErr.textContent=bad.join(' ');hc.classList.toggle('stale',bad.length>0);
    $('#hcSend').disabled=bad.length>0;
    if(bad.length)return;
    var cover=cl(a*1.1),gl=gutLines('bryza',0,l,4,null,0),gt=gutTotal(gl),packs=cl(a/ISOA),ic=ISO?packs*ISOA*ISO.p:0;
    $('#hcR').textContent='≈ '+cover+' м²';$('#hcRs').textContent='площа '+nf.format(a)+' м² і 10% запасу';
    $('#hcG').textContent=money(gt);$('#hcGs').textContent=gl.length+' позицій, BRYZA білий';
    $('#hcI').textContent=money(ic);$('#hcIs').textContent=packs+' упак. ISOVER 100 мм';
    hres={a:a,l:l,cover:cover,gt:gt,packs:packs,ic:ic};
    var gl2=$('#hcGo');if(gl2)gl2.href=ROOT+'vodostik.html?L='+l+'#konstruktor';
  };
  hA.addEventListener('input',hcalc);hL.addEventListener('input',hcalc);hcalc();
  $('#hcSend').addEventListener('click',function(){
    if(!hres.a)return;
    goTalon('Покрівля','Дах '+nf.format(hres.a)+' м², карниз '+nf.format(hres.l)+' м. Покриття ≈ '+hres.cover+' м² (із запасом 10%). Водостік BRYZA білий ≈ '+money(hres.gt)+'. Утеплення ISOVER 100 мм ≈ '+money(hres.ic)+' ('+hres.packs+' упак.). Орієнтовний розрахунок з калькулятора.');
  });
}

/* ---------- wizard: what do you need to do ---------- */
var wz=$('#wizbox');
if(wz){
  var WT=[{id:'roof',n:'Покрівля',d:'Нове покриття даху',t:'Покрівля'},{id:'gut',n:'Водостік',d:'Ринви й труби',t:'Водостік'},{id:'ins',n:'Утеплення',d:'Мінвата й плівки',t:'Утеплення'},{id:'win',n:'Мансардне вікно',d:'VELUX у дах',t:'Мансардне вікно'},{id:'fence',n:'Огорожа',d:'Металевий паркан',t:'Паркан'}];
  var WS={house:[{n:'Невеликий',d:'до 60 м² даху',A:50,L:16},{n:'Середній',d:'60-150 м² даху',A:110,L:30},{n:'Великий',d:'від 150 м² даху',A:200,L:50}],win:[{n:'1 вікно',d:'',c:1},{n:'2 вікна',d:'',c:2},{n:'3 вікна',d:'',c:3}],fence:[{n:'Близько 20 м',d:'',m:20},{n:'Близько 40 м',d:'',m:40},{n:'Близько 70 м',d:'',m:70}]};
  var wst={task:null,size:null};
  var wl=function(p,q,why,nt){return {p:p,q:q,why:why||'',nt:!!nt}};
  var kits=function(t,z){
    var P=function(i){return byId[i]};
    if(t==='roof'){var q=cl(z.A*1.1),w='покрити ≈ '+q+' м² (площа '+nf.format(z.A)+' м² і 10% запасу)';return [['Мінімум','Металопрофіль',[wl(P('549858083'),q,w,1)]],['Оптимально','Металочерепиця',[wl(P('1142078941'),q,w,1)]],['Надійно','RUUKKI Металочерепиця',[wl(P('866389787'),q,w,1)]]]}
    if(t==='gut'){return [['BRYZA, ПВХ','Пластик, колір білий',gutLines('bryza',0,z.L,4,null,0),'bryza'],['STRUGA, метал','Сталь, колір коричневий',gutLines('struga',0,z.L,4,null,0),'struga']]}
    if(t==='ins'){var f=function(id,A){var p=P(id),n=cl(z.A/A);return wl(p,n,'покриє '+nf.format(Math.round(n*A*100)/100)+' м², площа даху '+nf.format(z.A)+' м²')};return [['Мінімум','ISOVER 50 мм',[f('1052828898',20.16)]],['Оптимально','ISOVER 100 мм',[f('465794444',10.08)]],['Надійно','ISOVER 140 мм і пароізоляція',[f('898079120',7.68),wl(P('502029584'),1,'кількість уточнить менеджер',1)]]]}
    if(t==='win'){return [['Мінімум','VELUX Оптіма 78×118',[wl(P('685672764'),z.c)]],['Оптимально','VELUX Стандарт 78×118',[wl(P('687752171'),z.c)]],['Надійно','VELUX Стандарт Плюс 78×118',[wl(P('688398557'),z.c)]]]}
    var g=function(id){var p=P(id),q=p.u==='кв.м'?cl(z.m*1.8):z.m;return wl(p,q,p.u==='кв.м'?'площа полотна ≈ '+q+' м² (довжина '+z.m+' м, висота 1,8 м)':'довжина '+z.m+' м',1)};
    return [['Мінімум','Жалюзі Z',[g('1342554023')]],['Оптимально','Ранчо',[g('1314973571')]],['Надійно','Жалюзі Z+',[g('1348451149')]]];
  };
  var tot=function(ls){var t=0,any=false;ls.forEach(function(l){if(l.p.p&&!l.nt){t+=priceU(l.p).p*l.q;any=true}});return any?t:null};
  var qd=function(l){if(packOf(l.p))return l.q+' упак.';if(l.nt)return '';return l.q+' '+(l.p.u?uLbl(l.p.u):'шт.')};
  var lineTxt=function(l){var q=qd(l);return l.p.n+(q?' × '+q:'')};
  var wrender=function(){
    var body=$('#wzbody'),back=$('#wzback'),st=$('#wzstep'),h='';
    var step=!wst.task?1:wst.size===null?2:3;st.textContent='Крок '+step+' з 3';back.hidden=step===1;
    var sizes=function(tk){var a=tk==='win'?WS.win:tk==='fence'?WS.fence:WS.house.slice();if(a===WS.win||a===WS.fence)return a;if(hres&&hres.a)a.push({n:'Мої розміри',d:nf.format(hres.a)+' м² даху, карниз '+nf.format(hres.l)+' м (з калькулятора)',A:hres.a,L:hres.l});return a};
    if(step===1){h='<h3>Що робимо?</h3><div class="wz-opts">'+WT.map(function(t){return '<button type="button" class="wz-o" data-wt="'+t.id+'"><b>'+esc(t.n)+'</b><span>'+esc(t.d)+'</span></button>'}).join('')+'</div>'}
    else if(step===2){var tk=wst.task,arr=sizes(tk);h='<h3>'+(tk==='win'?'Скільки вікон?':tk==='fence'?'Яка довжина огорожі?':'Який будинок?')+'</h3><div class="wz-opts">'+arr.map(function(z,i){return '<button type="button" class="wz-o" data-ws="'+i+'"><b>'+esc(z.n)+'</b><span>'+esc(z.d)+'</span></button>'}).join('')+'</div>'}
    else{
      var tk2=wst.task,z=sizes(tk2)[wst.size],ks=kits(tk2,z);
      h='<h3>Оберіть комплект</h3><div class="wz-kits'+(ks.length===2?' n2':'')+'">'+ks.map(function(k,i){var ls=k[2].filter(function(l){return l.p&&l.q>0}),t=tot(ls),anyNt=ls.some(function(l){return l.nt}),u0=priceU(ls[0].p);
        return '<article class="wz-k"><h4>'+esc(k[0])+'</h4><p class="wz-sub">'+esc(k[1])+'</p><ul>'+ls.slice(0,4).map(function(l){var q=qd(l);return '<li><span>'+esc(l.p.n)+(l.why&&(l.nt||packOf(l.p))?'<small>'+esc(l.why)+'</small>':'')+'</span>'+(q?'<b>'+esc(q)+'</b>':'')+'</li>'}).join('')+(ls.length>4?'<li class="more">і ще '+(ls.length-4)+' '+plU(ls.length-4)+'</li>':'')+'</ul><div class="wz-t">'+(t!==null?'<small>'+(anyNt?'орієнтовно, без позицій з уточненням':'орієнтовно')+'</small><b>'+moneyR(t)+'</b>':'<small>суму уточнить менеджер</small><b>від '+money(u0.p)+'</b><small>'+(u0.u?'за '+esc(u0.u):'одиницю виміру уточнить менеджер')+'</small>')+'</div><div class="wz-a"><button type="button" class="btn sm" data-wadd="'+i+'">У кошик</button><button type="button" class="btn sm line" data-wtalk="'+i+'">Обговорити</button></div></article>'}).join('')+'</div><p class="note">Розрахунок орієнтовний, за типовими розмірами. Точні кількості, комплектуючі й вартість підтвердить менеджер.</p>';
      wst.ks=ks;
    }
    body.innerHTML=h;
  };
  wz.addEventListener('click',function(e){
    var b=e.target.closest('[data-wt]');if(b){wst.task=b.dataset.wt;wst.size=null;wrender();return}
    b=e.target.closest('[data-ws]');if(b){wst.size=+b.dataset.ws;wrender();return}
    if(e.target.closest('#wzback')){if(wst.size!==null)wst.size=null;else wst.task=null;wrender();return}
    b=e.target.closest('[data-wadd]');if(b){var k=wst.ks[+b.dataset.wadd];OsCart.addMany(k[2].filter(function(l){return l.p&&l.q>0}).map(function(l){var o=lineFromProduct(l.p,l.q);if(wst.task==='gut')o.s=k[3];return o}));return}
    b=e.target.closest('[data-wtalk]');if(b){var k2=wst.ks[+b.dataset.wtalk],tt=WT.filter(function(t){return t.id===wst.task})[0];goTalon(tt.t,'Комплект «'+k2[0]+'» ('+k2[1]+'): '+k2[2].filter(function(l){return l.p&&l.q>0}).map(lineTxt).join('; ')+'. З підбору за задачею.')}
  });
  wrender();
}

/* ---------- reveal on scroll ---------- */
if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&'IntersectionObserver' in window){
  var rvEls=$$('.sec>h2,.sec>.lede,.bento>.bc,.facts,.tasks>*,.about>div,.hcalc,.wiz,.teaser,.talon,.faq,.marquee,.ph-top,.cons,.grid>.pc,.anat,.faq details');
  document.documentElement.classList.add('rv');
  var rvIo=new IntersectionObserver(function(es){
    var k=0;es.forEach(function(en){if(en.isIntersecting){en.target.style.transitionDelay=Math.min(k,5)*70+'ms';k++;en.target.classList.add('in');rvIo.unobserve(en.target)}})
  },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  rvEls.forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top<window.innerHeight*0.9&&r.bottom>0){el.classList.add('in','nodelay')}else{el.setAttribute('data-rv','');rvIo.observe(el)}
  });
}

/* ---------- mobile tab bar ---------- */
var tb=$('.tabbar');
if(tb){
  tb.addEventListener('click',function(e){
    var b=e.target.closest('[data-tab]');if(!b)return;
    var t=b.dataset.tab;
    window.scrollTo({top:0,behavior:'instant'});if(hdr)hdr.classList.remove('compact','tuck');
    if(t==='cat'){setTimeout(function(){if(catbtn&&!mega.classList.contains('open'))catbtn.click()},40)}
    else if(t==='search'){setTimeout(function(){if(q)q.focus()},80)}
  });
}

/* ---------- talon ---------- */
function prefillTalon(){
  try{var pre=JSON.parse(sessionStorage.getItem('osTalon')||'null');if(pre&&typeof pre==='object'){var ts=$('#ttask');for(var i=0;i<ts.options.length;i++){if(ts.options[i].text===pre.task){ts.selectedIndex=i;break}}$('#ttext').value=pre.text||'';sessionStorage.removeItem('osTalon')}}catch(e){}
}
var tf=$('#tform');
if(tf){
  prefillTalon();window.addEventListener('hashchange',prefillTalon);
  tf.addEventListener('submit',function(e){e.preventDefault();var ph=$('#tphone'),er=$('#terr');er.textContent='';var d=ph.value.replace(/\D/g,'');
    if(d.length<9){er.textContent='Вкажіть телефон, щоб ми могли зателефонувати.';ph.setAttribute('aria-invalid','true');ph.focus();return}ph.removeAttribute('aria-invalid');
    $('#tmsg').classList.add('show')});
  $('#tphone').addEventListener('input',function(){$('#terr').textContent='';this.removeAttribute('aria-invalid')});
}
})();
