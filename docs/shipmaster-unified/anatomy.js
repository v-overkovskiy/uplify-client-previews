// Construction mechanisms from the supplied engineering reference.
(()=>{'use strict';
const root=document.getElementById('anatomy');if(!root)return;
const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],NS='http://www.w3.org/2000/svg';
const order=['hopper','prop','rudder','power','gps','light'];
const parts={
 hopper:{n:'01',title:'Бункер',description:'Доставляє прикормку до обраного місця. За командою з пульта бункер нахиляється й вивантажує вміст у воду.',note:'Розвантаження показано схематично',action:'Розвантажити бункер',parameter:'Нахил бункера',min:0,max:100,initial:0,ends:['Закритий','Нахилений'],format:v=>Math.round(v*.42)+'°'},
 prop:{n:'02',title:'Гвинт',description:'Електродвигун обертає вал і гвинт. Лопаті відштовхують воду назад, створюючи тягу, яка рухає кораблик уперед.',note:'Корпус напівпрозорий, щоб було видно гвинт',action:'Запустити гвинт',parameter:'Швидкість демонстрації',min:0,max:100,initial:55,ends:['Повільніше','Швидше'],format:v=>Math.round(v)+'%'},
 rudder:{n:'03',title:'Кермо',description:'Перо керма відхиляється вбік і змінює напрямок потоку води. Так кораблик повертає ліворуч або праворуч.',note:'Вигляд зверху на кермо й потік води',action:'Показати поворот',parameter:'Відхилення керма',min:-30,max:30,initial:0,ends:['Ліворуч','Праворуч'],format:v=>(v>0?'+':'')+Math.round(v)+'°'},
 power:{n:'04',title:'Живлення',description:'Акумулятор живить двигун, керування та бортову електроніку. Щоб дістатися до нього, відгвинчують чотири фіксатори й знімають кришку.',note:'Розташування й підключення показано умовно',action:'Відкрити відсік',parameter:'Підняття кришки',min:0,max:100,initial:0,ends:['Кришка закрита','Відсік відкритий'],format:v=>Math.round(v)+'%'},
 gps:{n:'05',title:'GPS-навігація',description:'Автопілот веде кораблик до збереженої точки прикорму. У цьому прикладі він доставляє корм і повертається до домашньої точки.',note:'Умовний маршрут для версії з GPS-автопілотом',action:'Пройти маршрут',parameter:'Крок маршруту',min:0,max:100,initial:0,ends:['Старт від берега','Повернення'],format:v=>Math.round(v)+'%'},
 light:{n:'06',title:'Ліхтар',description:'Три передні лінзи спрямовують світло вперед. Увімкніть ліхтар, щоб побачити напрямок освітлення перед носом кораблика.',note:'Умовна схема напрямку світла',action:'Увімкнути ліхтар',parameter:'Стан ліхтаря',min:0,max:1,initial:0,ends:['Вимкнений','Увімкнений'],format:v=>v?'Увімкнено':'Вимкнено'}
};
// Overlaid hidden variants reserve the tallest wrapped text at each viewport width.
const stableText={};
function reserveText(selector,variants){
 const host=$(selector),copy=document.createElement('span');copy.textContent=host.textContent;
 const reserves=[...new Set(variants)].map(text=>{const span=document.createElement('span');span.textContent=text;span.className='text-size-reserve';span.setAttribute('aria-hidden','true');return span});
 host.classList.add('size-stable-text');host.replaceChildren(copy,...reserves);stableText[selector]=copy;
}
reserveText('#part-title',order.map(key=>parts[key].title));
reserveText('#part-description',order.map(key=>parts[key].description));
reserveText('#detail-note',order.map(key=>parts[key].note));
reserveText('#live-note',order.flatMap(key=>[-30,0,1,5,15,45,52,65,75,99,100].flatMap(value=>[note(key,value,false),note(key,value,true)])));
reserveText('#play-label',order.map(key=>parts[key].action).concat(['Призупинити','Продовжити','Вимкнути ліхтар']));
const state={part:'hopper',value:0,running:false,paused:false,elapsed:0,last:0,angle:0};
const q=p=>[480+935*(.847*p[0]+.532*p[2]),326-935*(.235*p[0]+.898*p[1]-.374*p[2])];
const pts=a=>a.map(p=>q(p).map(n=>n.toFixed(2)).join(',')).join(' ');
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const el=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e};
const poly=(p,c,parent)=>el('polygon',{points:p.map(x=>q(x).join(',')).join(' '),class:c},parent);
let detailCache='',detailNodes={};
function detailSkeleton(){
 const d=$('#idetail');d.innerHTML='<defs><marker id="arrow-detail" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" class="acc-stroke" stroke-width="1.2"/></marker></defs>';
 const key=state.part;
 if(key==='hopper')d.insertAdjacentHTML('beforeend','<path class="detail-water" d="M21 150q12-5 24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0"/><path class="detail-line" d="M55 119H231l-15 17H74Z"/><g id="d-hopper"><path class="detail-active" d="M88 44H218L208 103H101Z"/><path class="detail-line" d="M88 44l13 13h104l13-13M101 57v46"/><g id="d-feed"></g></g><circle class="detail-fill" cx="215" cy="105" r="4"/><g id="d-grains"></g><path class="detail-accent" d="M247 62q20 18 8 40" marker-end="url(#arrow-detail)"/><text class="detail-text" x="40" y="29">команда з пульта</text><path class="detail-water" stroke-dasharray="3 4" d="M42 34H82"/>');
 if(key==='prop')d.insertAdjacentHTML('beforeend','<path class="detail-line" d="M27 76H126M27 91H126"/><rect class="detail-fill" x="28" y="67" width="57" height="32" rx="5"/><text class="detail-text" x="35" y="120">двигун</text><circle class="detail-line" cx="173" cy="83" r="54"/><circle class="detail-water" cx="173" cy="83" r="47" stroke-dasharray="3 4"/><g id="d-rotor"></g><circle class="detail-fill" cx="173" cy="83" r="10"/><path class="detail-accent" d="M242 61h44M242 84h51M242 107h44" marker-end="url(#arrow-detail)"/><text class="detail-text" x="246" y="138">потік води</text>');
 if(key==='rudder')d.insertAdjacentHTML('beforeend','<path class="detail-water" d="M20 45H115M20 75H115M20 105H115"/><path class="detail-fill" d="M126 64q-18 14-18 20t18 21l35-14V77Z"/><g id="d-rudder"><path class="detail-active" d="M154 77q47-8 79 7-32 15-79 7Z"/></g><circle class="detail-fill" cx="157" cy="84" r="4"/><path id="d-turn-flow" class="detail-accent" marker-end="url(#arrow-detail)"/><path class="detail-water" d="M158 38a47 47 0 0 1 0 92" stroke-dasharray="3 4"/><text class="detail-text" x="92" y="150">відхилення потоку → поворот</text>');
 if(key==='power')d.insertAdjacentHTML('beforeend','<path class="detail-water" d="M30 143H290"/><rect class="detail-active" x="66" y="72" width="95" height="56" rx="4"/><path class="detail-line" d="M84 89h14m-7-7v14M133 89h14M78 113h69"/><path class="detail-line" d="M91 72V46H243V83M137 72V56H226V83"/><rect class="detail-fill" x="211" y="83" width="47" height="37" rx="4"/><path class="detail-line" d="M221 101h27"/><circle class="detail-fill" cx="91" cy="46" r="3"/><g id="d-current"></g><text class="detail-text" x="66" y="153">акумулятор</text><text class="detail-text" x="210" y="142">електроніка</text><g id="d-lid"><path class="detail-fill" d="M52 64h127l-9 7H61Z"/><circle class="detail-line" cx="65" cy="64" r="2"/><circle class="detail-line" cx="166" cy="64" r="2"/></g>');
 if(key==='gps')d.insertAdjacentHTML('beforeend','<path class="detail-water" d="M15 151q51-52 13-119M15 153H303"/><path class="detail-water" d="M54 132Q103 17 234 48Q245 139 54 132" stroke-dasharray="3 5"/><path id="d-route" class="detail-accent" d="M54 132Q103 17 234 48Q245 139 54 132" stroke-dasharray="3 5"/><circle class="detail-active" cx="54" cy="132" r="7"/><circle class="detail-active" cx="234" cy="48" r="7"/><text class="detail-text" x="35" y="157">берег</text><text class="detail-text" x="232" y="31">точка 01</text><g id="d-gps-boat"><path class="detail-active" d="M0-11q9 9 5 21H-5q-4-12 5-21Z"/><path class="detail-line" d="M-3-1H3"/></g>');
 if(key==='light')d.insertAdjacentHTML('beforeend','<g id="d-beams"><path d="M164 55L293 27V139L164 111Z" class="acc-fill" opacity=".32"/><path class="detail-accent" d="M169 62l103-26M169 83h114M169 104l103 26"/></g><rect class="detail-fill" x="36" y="49" width="130" height="68" rx="5"/><circle class="detail-active" cx="61" cy="83" r="16"/><circle class="detail-active" cx="101" cy="83" r="16"/><circle class="detail-active" cx="141" cy="83" r="16"/><circle class="detail-line" cx="61" cy="83" r="9"/><circle class="detail-line" cx="101" cy="83" r="9"/><circle class="detail-line" cx="141" cy="83" r="9"/><text class="detail-text" x="52" y="148">три лінзи</text><text class="detail-text" x="224" y="148">вперед</text>');
 detailCache=key;detailNodes={};
}
function dn(id){return detailNodes[id]||(detailNodes[id]=document.getElementById(id))}
function hopper(){
 const group=$('#hopper-art');group.replaceChildren();
 const amount=state.part==='hopper'?state.value:0,angle=-amount*.42*Math.PI/180,hinge=[.403,.023,0];
 const rot=p=>{let x=p[0]-hinge[0],y=p[1]-hinge[1];return[hinge[0]+x*Math.cos(angle)-y*Math.sin(angle),hinge[1]+x*Math.sin(angle)+y*Math.cos(angle),p[2]]};
 const top=[[-.141,.102,-.143],[.141,.102,-.143],[.141,.102,.143],[-.141,.102,.143]].map(p=>[p[0]+.270,p[1],p[2]]);
 const bottom=[[-.1135,.025,-.1125],[.1135,.025,-.1125],[.1135,.025,.1125],[-.1135,.025,.1125]].map(p=>[p[0]+.270,p[1],p[2]]);
 const itop=top.map(p=>[.270+(p[0]-.270)*.916,p[1],p[2]*.92]);
 const floor=bottom.map(p=>[.270+(p[0]-.270)*.89,.039,p[2]*.89]);
 let faces=[{p:floor,c:'hopper-floor'}];
 for(let i=0;i<4;i++){const j=(i+1)%4;faces.push({p:[bottom[i],bottom[j],top[j],top[i]],c:'hopper-wall'});faces.push({p:[floor[j],floor[i],itop[i],itop[j]],c:'hopper-inner'});faces.push({p:[top[i],top[j],itop[j],itop[i]],c:'hopper-rim'});}
 faces=faces.map(f=>({...f,p:f.p.map(rot)}));
 faces.sort((a,b)=>a.p.reduce((s,p)=>s+p[0]*-.477+p[1]*.442+p[2]*.760,0)/a.p.length-b.p.reduce((s,p)=>s+p[0]*-.477+p[1]*.442+p[2]*.760,0)/b.p.length);
 for(const face of faces){let e=poly(face.p,'shape '+face.c,group);e.dataset.part='hopper';if(state.part==='hopper')e.classList.add('selected')}
 // Small V in the photographed rear rim.
 const notch=[[.411,.102,-.014],[.411,.089,0],[.411,.102,.014]].map(rot);el('polyline',{points:pts(notch),class:'line'},group);
 if(state.part==='hopper'&&state.value>2){
  const f=(state.last/1000)%1;
  for(let i=0;i<11;i++){const t=(f+i/11)%1,p=rot([.393,.088,(i%5-2)*.012]);p[0]+=.016+.06*t;p[1]-=t*.13;const a=q(p);el('circle',{cx:a[0],cy:a[1],r:2.2,class:'acc-fill',opacity:state.value>50?1:state.value/50},group)}
 }
}
function boatEffects(){
 const key=state.part,v=state.value,fx=$('#main-effects');fx.replaceChildren();
 $('#hull-art').style.opacity=(key==='prop'||key==='rudder')?'.24':'1';
 $('#battery-well').style.opacity=key==='power'?String(v/100):'0';
 $('#cover-art').setAttribute('transform',key==='power'?`translate(${-v*.11} ${-v*.52})`:'');
 const pa=q([.326,-.13,0]);$('#prop-main').setAttribute('transform',key==='prop'?`rotate(${state.angle} ${pa[0]} ${pa[1]})`:'');
 const ru=q([.344,-.14,.049]);all('.shape.rudder').forEach(e=>e.setAttribute('transform',key==='rudder'?`rotate(${-v*.35} ${ru[0]} ${ru[1]})`:''));
 if(key==='light'&&v){
  poly([[-.335,.03,-.039],[-.52,.03,-.13],[-.52,.03,.13],[-.335,.03,.039]],'',fx).setAttribute('style','fill:var(--accent);fill-opacity:.30;stroke:none');
  for(const z of[-.025,0,.025])el('polyline',{points:pts([[-.338,.031,z],[-.50,.031,z*3]]),class:'detail-accent'},fx);
 }
 if(key==='gps'){
  const c=q([.07,.08,-.03]),t=state.last/1600;
  for(let i=0;i<3;i++){const r=15+((t+i/3)%1)*45;el('ellipse',{cx:c[0],cy:c[1],rx:r,ry:r*.42,fill:'none',class:'acc-stroke','stroke-width':1,opacity:1-(r-15)/45},fx)}
  el('path',{d:`M${c[0]-20},${c[1]-72}l15-15 15 15-15 15Z M${c[0]-21},${c[1]-86}l-8-8 8-8 8 8Z M${c[0]+13},${c[1]-62}l-8-8 8-8 8 8Z`,class:'detail-line'},fx);
 }
}
function detail(){
 if(detailCache!==state.part)detailSkeleton();
 const v=state.value,t=state.last/1000;
 if(state.part==='hopper'){
  dn('d-hopper').setAttribute('transform',`rotate(${-v*.42} 215 105)`);
  dn('d-feed').innerHTML=Array.from({length:13},(_,i)=>`<circle cx="${111+(i%6)*15}" cy="${76+Math.floor(i/6)*11}" r="2.5" class="acc-fill"/>`).join('');
  dn('d-grains').innerHTML=v>35?Array.from({length:8},(_,i)=>{const a=(t*.6+i/8)%1;return`<circle cx="${228+a*34+i%2*8}" cy="${94+a*50}" r="2.4" class="acc-fill" opacity="${Math.min(1,(v-35)/30)}"/>`}).join(''):'';
 }
 if(state.part==='prop'){
  dn('d-rotor').innerHTML=[0,120,240].map(a=>`<path class="detail-active" d="M172 80C138 57 154 26 173 35C188 44 179 63 178 80Z" transform="rotate(${a+state.angle} 173 83)"/>`).join('');
 }
 if(state.part==='rudder'){
  dn('d-rudder').setAttribute('transform',`rotate(${v} 157 84)`);const yy=84+v*1.25;
  dn('d-turn-flow').setAttribute('d',`M22 84H127Q182 84 218 ${yy}T292 ${yy}`);
 }
 if(state.part==='power'){
  dn('d-lid').setAttribute('transform',`translate(0 ${-v*.30})`);
  dn('d-current').innerHTML=Array.from({length:5},(_,i)=>{const x=92+((t*35+i*29)%149);return`<circle cx="${x}" cy="46" r="2.8" class="acc-fill"/>`}).join('');
 }
 if(state.part==='gps'){
  const progress=v/100,returning=progress>.52,z=returning?(progress-.52)/.48:Math.min(1,progress/.45),p0=returning?[234,48]:[54,132],p1=returning?[245,139]:[103,17],p2=returning?[54,132]:[234,48];
  const x=(1-z)**2*p0[0]+2*(1-z)*z*p1[0]+z*z*p2[0],y=(1-z)**2*p0[1]+2*(1-z)*z*p1[1]+z*z*p2[1];
  const dx=2*(1-z)*(p1[0]-p0[0])+2*z*(p2[0]-p1[0]),dy=2*(1-z)*(p1[1]-p0[1])+2*z*(p2[1]-p1[1]);
  dn('d-gps-boat').setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI+90})`);
 }
 if(state.part==='light')dn('d-beams').setAttribute('opacity',v?'1':'.08');
}
function note(part=state.part,v=state.value,running=state.running){return({hopper:v<10?'Прикормка залишається в бункері.':v<65?'Бункер нахиляється.':'Прикормка висипається у воду.',prop:running&&v>0?'Гвинт обертається, потік води спрямований назад.':v===0?'Швидкість демонстрації нульова, гвинт зупинено.':'Запустіть обертання або змініть швидкість демонстрації.',rudder:v<-4?'Кермо відхилене ліворуч.':v>4?'Кермо відхилене праворуч.':'Кермо в центральному положенні.',power:v<15?'Кришка закриває акумуляторний відсік.':v<75?'Кришку піднято над відсіком.':'Відкрито доступ до акумулятора.',gps:v<1?'Домашня точка біля берега.':v<45?'Рух до збереженої точки 01.':v<53?'Точка 01: вивантаження прикормки.':v<99?'Повернення до домашньої точки.':'Кораблик повернувся до берега.',light:v?'Світло спрямоване вперед перед носом.':'Ліхтар вимкнений.'})[part]}
function sync(){
 const p=parts[state.part];$('#parameter').value=state.value;$('#parameter-value').value=p.format(state.value);$('#parameter').setAttribute('aria-valuetext',p.format(state.value));
 const text=note();if(stableText['#live-note'].textContent!==text)stableText['#live-note'].textContent=text;
 stableText['#play-label'].textContent=state.part==='light'?(state.value?'Вимкнути ліхтар':'Увімкнути ліхтар'):state.running?'Призупинити':state.paused?'Продовжити':p.action;
 $('#play-icon').innerHTML=state.running?'<path d="M6 4h2v12H6Zm6 0h2v12h-2Z"/>':'<path d="M7 4l9 6-9 6Z"/>';
}
function render(){hopper();boatEffects();detail();sync()}
function select(key){
 if(!parts[key])return;state.part=key;state.value=parts[key].initial;state.running=false;state.paused=false;state.elapsed=0;state.angle=0;
 const p=parts[key];$('#part-number').textContent=p.n;stableText['#part-title'].textContent=p.title;stableText['#part-description'].textContent=p.description;stableText['#detail-note'].textContent=p.note;$('#idetail').setAttribute('aria-label','Схема роботи: '+p.title.toLowerCase());$('#parameter-label').textContent=p.parameter;
 const input=$('#parameter');input.min=p.min;input.max=p.max;input.step=1;input.setAttribute('aria-label',p.parameter);$('#range-min').textContent=p.ends[0];$('#range-max').textContent=p.ends[1];
 $('#figure-caption').innerHTML='<i></i>'+(key==='gps'?'GPS-маршрут показано схематично':p.title+' виділено на ілюстрації');
 all('#ill [data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.select===key)));
 const selectedButton=$(`#ill [data-select="${key}"]`),rail=$('#iparts');if(rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:selectedButton.offsetLeft-rail.offsetLeft-15,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 all('#ib [data-part]').forEach(e=>{e.classList.toggle('selected',e.dataset.part===key);e.classList.toggle('active',e.dataset.part===key);if(e.getAttribute('role')==='button')e.setAttribute('aria-pressed',String(e.dataset.part===key))});
 detailCache='';render();
}
all('#ill [data-select]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.select)));
$('#iparts').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const i=order.indexOf(state.part),n=e.key==='Home'?0:e.key==='End'?order.length-1:(i+(e.key==='ArrowRight'?1:-1)+order.length)%order.length;select(order[n]);$(`#ill [data-select="${order[n]}"]`).focus()});
$('#ib').addEventListener('click',e=>{const part=e.target.closest('[data-part]');if(part)select(part.dataset.part)});
$('#ib').addEventListener('keydown',e=>{const part=e.target.closest('.hotspot');if(part&&['Enter',' '].includes(e.key)){e.preventDefault();select(part.dataset.part)}});
$('#show-labels').addEventListener('change',e=>$('#ib').classList.toggle('labels-hidden',!e.target.checked));
$('#parameter').addEventListener('input',e=>{state.value=Number(e.target.value);state.running=false;state.paused=false;state.elapsed=0;if(state.part==='prop')state.angle=state.value*3.6;render()});
$('#iReset').addEventListener('click',()=>select(state.part));
$('#next-part').addEventListener('click',()=>select(order[(order.indexOf(state.part)+1)%order.length]));
$('#iPlay').addEventListener('click',()=>{if(state.part==='light'){state.value=state.value?0:1;render();return}if(state.running){state.running=false;state.paused=true}else{if(!state.paused){state.elapsed=0;if(['hopper','gps','power','rudder'].includes(state.part))state.value=0}state.running=true;state.paused=false}sync()});
let lastPaint=0;
function tick(time){
 const dt=Math.min(60,time-(state.last||time));state.last=time;let advanced=false;
 if(state.running){advanced=true;state.elapsed+=dt;const p=state.part;
  if(p==='prop')state.angle=(state.angle+dt*.007*state.value)%360;
  if(p==='rudder'){state.value=25*Math.sin(state.elapsed/850);if(state.elapsed>5350){state.running=false;state.paused=false;state.value=0}}
  if(p==='hopper'||p==='power'){const f=state.elapsed/5200;state.value=f<.3?ease(f/.3)*100:f<.65?100:(1-ease((f-.65)/.35))*100;if(f>=1){state.running=false;state.paused=false;state.value=0}}
  if(p==='gps'){state.value=Math.min(100,state.elapsed/80);if(state.value===100){state.running=false;state.paused=false}}
 }
 if(advanced&&(time-lastPaint>32||!state.running)){render();lastPaint=time}
 requestAnimationFrame(tick);
}
select('hopper');requestAnimationFrame(tick);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.running){state.running=false;state.paused=true;sync()}});
})();
