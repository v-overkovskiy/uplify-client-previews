(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('uk-UA').replace(/\s/g, '\u00a0');

  // повідомлення макета
  const toast = $('#toast'); let tt;
  const say = m => { if (!toast) return; toast.textContent = m; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 4200); };
  document.addEventListener('click', e => { const d = e.target.closest('[data-demo]'); if (d && d.tagName !== 'FORM') { e.preventDefault(); say(d.dataset.demo); } });
  $$('form[data-demo]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); say(f.dataset.demo); }));

  // наочне мегаменю каталогу
  const mega = document.getElementById('mega');
  if (mega) {
    const btns = [...document.querySelectorAll('[data-mega]')], rails = [...mega.querySelectorAll('.mrail')];
    let cur = null;
    const show = id => { rails.forEach(r => { const on = r.dataset.mp === id; r.setAttribute('aria-selected', on); r.tabIndex = on ? 0 : -1; document.getElementById('mp-' + r.dataset.mp).hidden = !on; }); };
    const close = () => { mega.hidden = true; btns.forEach(b => b.setAttribute('aria-expanded', false)); cur = null; };
    btns.forEach(b => b.addEventListener('click', () => {
      if (cur === b && !mega.hidden) { close(); return; }
      show(b.dataset.open); mega.hidden = false; btns.forEach(x => x.setAttribute('aria-expanded', x === b)); cur = b;
    }));
    rails.forEach((r, i) => {
      r.addEventListener('click', () => show(r.dataset.mp));
      r.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) show(r.dataset.mp); });
      r.addEventListener('keydown', e => { const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (d) { e.preventDefault(); const n = rails[(i + d + rails.length) % rails.length]; n.focus(); show(n.dataset.mp); } });
    });
    document.addEventListener('click', e => { if (!mega.hidden && !e.target.closest('.nav')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mega.hidden) { const c = cur; close(); c && c.focus(); } });
    mega.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  // шапка: тінь з'являється лише коли під нею прокручується контент
  const hdr = $('.hdr');
  if (hdr) { const upd = () => hdr.classList.toggle('is-scrolled', scrollY > 8); addEventListener('scroll', upd, { passive: true }); upd(); }

  // мобільне меню
  const dr = $('#drawer'), db = $('[data-drawer]');
  if (dr && db) {
    // відкриття: показати, а в наступному кадрі запустити виїзд; закриття: той самий шлях назад, потім сховати
    let t;
    const open = (o, keepFocus) => {
      clearTimeout(t); db.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : '';
      if (o) { dr.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => dr.classList.add('on'))); $('[data-drawer-close].icobtn', dr).focus(); }
      else { dr.classList.remove('on'); t = setTimeout(() => { if (!dr.classList.contains('on')) dr.hidden = true; }, 360); if (!keepFocus) db.focus(); }
    };
    db.addEventListener('click', () => open(true));
    $$('[data-drawer-close]', dr).forEach(b => b.addEventListener('click', () => open(false)));
    $$('nav a', dr).forEach(a => a.addEventListener('click', () => open(false, true)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dr.classList.contains('on')) open(false); });
  }

  // вкладки (вітрина)
  $$('[data-tabs]').forEach(tl => {
    const tabs = $$('[role=tab]', tl);
    const act = t => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.dataset.panel).hidden = !on; }); };
    tabs.forEach((t, i) => { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; t.addEventListener('click', () => act(t)); t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); act(n); } }); });
  });

  // підбір теплиці за шириною
  $$('[data-picker]').forEach(tl => {
    const sec = tl.closest('section'), grid = $('[data-models]', sec), cnt = $('[data-picker-count]', sec), tabs = $$('.tab', tl);
    const act = t => {
      tabs.forEach(x => x.setAttribute('aria-selected', x === t));
      const w = t.dataset.w; let n = 0;
      $$('.model', grid).forEach(m => { if (m.classList.contains('model--help')) return; const on = w === 'all' || m.dataset.w === w; m.hidden = !on; if (on) n++; });
      if (cnt) cnt.textContent = `Моделей шириною ${t.textContent.replace('Ширина ', '')}: ${n}`;
    };
    tabs.forEach((t, i) => { t.addEventListener('click', () => act(t)); t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); act(n); } }); });
  });

  // гортання вкладок і таблиці на мобільному: обрана вкладка видима, згасання справа зникає в кінці
  $$('.tabs, .tabs-pdp, .mx-wrap, .sc__tabs').forEach(el => {
    const end = () => el.classList.toggle('is-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    const sel = $('[aria-selected=true]', el);
    if (sel && el.scrollWidth > el.clientWidth) el.scrollLeft = Math.max(0, sel.offsetLeft - el.offsetLeft - 16);
    el.addEventListener('scroll', end, { passive: true }); addEventListener('resize', end); end();
  });

  // форми розрахунку
  $$('[data-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', f).filter(i => !i.value.trim());
    // помилки біля полів: текст під полем, aria-invalid і aria-describedby, фокус на першому
    $$('[required]', f).forEach((i, k) => {
      const err = !i.value.trim(), id = `${i.name}-err-${k}`; let m = document.getElementById(id);
      i.setAttribute('aria-invalid', err);
      if (err && !m) { m = document.createElement('span'); m.className = 'fld__err'; m.id = id; m.textContent = i.type === 'tel' ? 'Вкажіть телефон, щоб ми могли передзвонити' : "Вкажіть ім'я"; i.after(m); }
      if (m) m.hidden = !err;
      if (err) i.setAttribute('aria-describedby', id); else i.removeAttribute('aria-describedby');
    });
    if (bad.length) { bad[0].focus(); return; }
    $('.form__ok', f).hidden = false; $('.form__ok', f).setAttribute('tabindex', '-1'); $('.form__ok', f).focus();
  }));
  $$('[data-need]').forEach(a => a.addEventListener('click', () => { const r = $(`#rozrakhunok input[value="${a.dataset.need}"]`); if (r) r.checked = true; }));

  // фільтри лістингу
  const ff = $('[data-filter]'), grid = $('[data-grid]');
  if (ff && grid) {
    const cards = $$('.pc', grid), count = $('[data-count] b'), sort = $('[data-sort]');
    const apply = () => {
      const v = n => $$(`input[name=${n}]:checked`, ff).map(i => i.value);
      const L = v('len'), T = v('th'), Ln = v('line'); let n = 0;
      cards.forEach(c => { const on = (!L.length || L.includes(c.dataset.len)) && (!T.length || T.includes(c.dataset.th)) && (!Ln.length || Ln.includes(c.dataset.line)); c.hidden = !on; if (on) n++; });
      count.textContent = n;
      const s = sort.value, arr = [...cards];
      if (s !== 'size') arr.sort((a, b) => (s === 'asc' ? 1 : -1) * (a.dataset.price - b.dataset.price));
      arr.forEach(c => grid.appendChild(c));
    };
    ff.addEventListener('change', apply); sort.addEventListener('change', apply);
    ff.addEventListener('reset', () => setTimeout(apply));
    const ob = $('[data-flt-open]'), cb = $('[data-flt-close]');
    if (ob) ob.addEventListener('click', () => { ff.classList.add('on'); cb.focus(); });
    if (cb) cb.addEventListener('click', () => { ff.classList.remove('on'); ob.focus(); });
  }

  // картка товару
  if (window.D4) {
    const D = window.D4; let L = '6', C = 'СП 6 мм Standard';
    const q = new URLSearchParams(location.search);
    if (D[q.get('l')] || $(`[data-len="${q.get('l')}"]`)) L = q.get('l');
    if (q.get('c') && D[L] && D[L][q.get('c')]) C = q.get('c');
    const req = $('[data-req]'), buys = $$('[data-buy]');
    const render = () => {
      const has = !!D[L], p = has ? D[L][C] : null, name = `4×${L} м · ${C}`;
      const ptxt = has ? `${fmt(p)} <small>грн</small>` : '<small>ціна</small> за запитом';
      $('[data-price]').innerHTML = ptxt; $('[data-mprice]').innerHTML = ptxt;
      const qp = $('[data-qprice]'), qs = $('[data-qsel]'); if (qp) qp.innerHTML = ptxt; if (qs) qs.textContent = name;
      buys.forEach(b => b.hidden = !has); if (req) req.hidden = has;
      const sz = $('#rozrakhunok input[name=size]'); if (sz && (!sz.value || sz.dataset.auto)) { sz.value = `Дніпро-4, 4×${L} м, ${C}`; sz.dataset.auto = '1'; }
      $('[data-sel]').textContent = name; $('[data-msel]').textContent = name; $('[data-title-size]').textContent = `4×${L} м`;
      $('[data-len-cell]').textContent = `${L}000 мм`; $('[data-cov-cell]').textContent = C;
      $$('[data-len]').forEach(b => b.setAttribute('aria-pressed', b.dataset.len === L));
      $$('[data-cov]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.cov === C); $('[data-cov-price]', b).textContent = has ? fmt(D[L][b.dataset.cov]) + ' грн' : 'за запитом'; });
    };
    $$('[data-len]').forEach(b => b.addEventListener('click', () => { L = b.dataset.len; render(); }));
    $$('[data-cov]').forEach(b => b.addEventListener('click', () => { C = b.dataset.cov; render(); }));
    render();
    const main = $('[data-gal-main]');
    $$('.gal__th button').forEach(b => b.addEventListener('click', () => { if (main.getAttribute('src') !== b.dataset.src) { main.classList.add('is-swap'); setTimeout(() => { main.src = b.dataset.src; main.onload = () => main.classList.remove('is-swap'); if (main.complete) main.classList.remove('is-swap'); }, 160); }$$('.gal__th button').forEach(x => x.setAttribute('aria-current', x === b)); }));
    document.body.classList.add('has-mbar');
    // мобільна панель з'являється лише коли блок ціни пішов з екрана вгору
    const mbar = $('.mbar'), box = $('.bb__price');
    if (mbar && box) { let raf = 0; const upd = () => { raf = 0; mbar.classList.toggle('is-on', box.getBoundingClientRect().bottom < 0); }; addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd(); }
  }

  // конструктор теплиці: схема в косокутній проєкції, перемальовується з кожним вибором
  const cfg = $('[data-cfg]');
  if (cfg && window.CFG) {
    const M = window.CFG.models, D = window.CFG.d4, svg = $('[data-cfg-svg]', cfg), f = $('[data-cfg-form]', cfg);
    const lenIn = $('[data-cfg-len]', cfg), lout = $('[data-cfg-lout]', cfg);
    const num = v => String(v).replace('.', ',');
    let m = M.find(x => x.id === 'd4'), L = 6, th = 6;
    const covName = () => `СП ${th} мм${m.film ? ' + плівка' : ''}`;
    const chip = (name, val, label, on) => `<label class="chip"><input type="radio" name="${name}" value="${val}"${on ? ' checked' : ''}><span>${label}</span></label>`;
    const fillModels = () => {
      const w = $('input[name=cfg-w]:checked', f).value, list = M.filter(x => x.w === w);
      if (!list.includes(m)) m = list[0];
      $('[data-cfg-models]', cfg).innerHTML = list.map(x => chip('cfg-m', x.id, `«${x.name}» <small>труба ${x.pipe}</small>`, x === m)).join('');
      fillRest();
    };
    const fillRest = () => {
      if (!m.lens.includes(L)) L = m.lens.reduce((a, b) => Math.abs(b - L) < Math.abs(a - L) ? b : a);
      if (!m.th.includes(th)) th = m.th.includes(6) ? 6 : m.th[0];
      lenIn.max = m.lens.length - 1; lenIn.value = m.lens.indexOf(L);
      $('[data-cfg-ticks]', cfg).innerHTML = m.lens.map(x => `<span>${x}</span>`).join('');
      $('[data-cfg-covs]', cfg).innerHTML = m.th.map(t => chip('cfg-c', t, `СП ${t} мм${m.film ? ' + плівка' : ''}`, t === th)).join('');
      render();
    };
    const fmtp = n => fmt(n) + ' <small>грн</small>';
    const render = () => {
      lout.textContent = `${L} м`; lenIn.setAttribute('aria-valuetext', `${L} метрів`);
      $('[data-cfg-name]', cfg).textContent = `«${m.name}» ${num(m.wn)}×${L} м`;
      $('[data-cfg-spec]', cfg).innerHTML = [`ширина <b>${num(m.wn)} м</b>`, `висота <b>${num(m.h)} м</b>`, `труба <b>${m.pipe}</b>`, `<b>${covName()}</b>`].map(s => `<span>${s}</span>`).join('');
      const exact = m.id === 'd4' && D[L];
      if (exact) {
        $('[data-cfg-price]', cfg).innerHTML = fmtp(D[L][`СП ${th} мм Standard`]);
        $('[data-cfg-sub]', cfg).textContent = `СП ${th} мм Standard. Premium: ${fmt(D[L][`СП ${th} мм Premium`])} грн`;
      } else {
        $('[data-cfg-price]', cfg).innerHTML = '<small>від</small> ' + fmtp(m.frm);
        $('[data-cfg-sub]', cfg).textContent = `Ціна «від» - за найменшу довжину. Точну ціну для ${num(m.wn)}×${L} м назве менеджер.`;
      }
      const go = $('[data-cfg-go]', cfg);
      go.href = m.id === 'd4' ? `teplytsia-dnipro-4.html?l=${L}${D[L] ? '&c=' + encodeURIComponent(`СП ${th} мм Standard`) : ''}` : m.href;
      draw();
    };
    // креслення
    const KX = .62, KY = .3, mq = matchMedia('(max-width:759px)');
    const draw = () => {
      const W = mq.matches ? 500 : 800, H = mq.matches ? 380 : 470; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const w = m.wn, h = m.h, n = 18, LP = mq.matches ? 125 : 130;
      const s = Math.min((W - 70 - LP) / (w + L * KX + .7), (H - 110) / (h + L * KY + .2), 120);
      const ox = 20 + LP + Math.max(0, (W - 70 - LP - (w + L * KX + .7) * s) / 2), oy = H - 60;
      const p = (x, z, d) => [(ox + (x + d * KX) * s).toFixed(1), (oy - (z + d * KY) * s).toFixed(1)];
      const arc = t => [w / 2 - w / 2 * Math.cos(t), h * Math.pow(Math.sin(t), .6)];
      const ts = Array.from({ length: n + 1 }, (_, i) => Math.PI * i / n);
      const pl = (cls, ps) => `<polyline class="${cls}" points="${ps.map(q => q.join(',')).join(' ')}"/>`;
      const pg = (cls, ps) => `<polygon class="${cls}" points="${ps.map(q => q.join(',')).join(' ')}"/>`;
      const op = (.10 + th * .016).toFixed(3);
      let g = pg('c-shadow', [p(0, 0, 0), p(w, 0, 0), p(w, 0, L), p(0, 0, L)]);
      g += pl('c-rib c-rib--back', ts.map(t => p(...arc(t), L)));
      for (let i = 0; i < n; i++) { const a = arc(ts[i]), b = arc(ts[i + 1]); g += pg(m.film ? 'c-film' : 'c-skin', [p(...a, 0), p(...b, 0), p(...b, L), p(...a, L)]); }
      for (let d = 1; d < L; d++) g += pl('c-rib', ts.map(t => p(...arc(t), d)));
      [3, 6, 9, 12, 15].forEach(i => g += pl('c-long', [p(...arc(ts[i]), 0), p(...arc(ts[i]), L)]));
      g += pl('c-long', [p(0, 0, 0), p(0, 0, L)]) + pl('c-long', [p(w, 0, 0), p(w, 0, L)]);
      g += pg('c-end', ts.map(t => p(...arc(t), 0)));
      const dw = Math.min(.9, w * .3), dh = Math.min(1.8, h - .35);
      g += pg('c-door', [p(w / 2 - dw / 2, 0, 0), p(w / 2 + dw / 2, 0, 0), p(w / 2 + dw / 2, dh, 0), p(w / 2 - dw / 2, dh, 0)]);
      g += pl('c-door-l', [p(w / 2, 0, 0), p(w / 2, dh, 0)]);
      const vw = Math.min(.7, w * .22), vz = dh + .08, vh = Math.min(.35, h - dh - .15);
      if (vh > .12) g += pg('c-door', [p(w / 2 - vw / 2, vz, 0), p(w / 2 + vw / 2, vz, 0), p(w / 2 + vw / 2, vz + vh, 0), p(w / 2 - vw / 2, vz + vh, 0)]);
      g += pl('c-rib c-rib--front', ts.map(t => p(...arc(t), 0)));
      // розміри
      const dim = (a, b, lab, side) => { const mx = (+a[0] + +b[0]) / 2, my = (+a[1] + +b[1]) / 2;
        return pl('c-dim', [a, b]) + `<circle class="c-dot" cx="${a[0]}" cy="${a[1]}" r="3"/><circle class="c-dot" cx="${b[0]}" cy="${b[1]}" r="3"/><text class="c-lab" x="${mx}" y="${my}" dx="${side[0]}" dy="${side[1]}" text-anchor="${side[2]}">${lab}</text>`; };
      g += dim(p(0, -.42, 0), p(w, -.42, 0), `${num(w)} м`, [0, 22, 'middle']);
      g += dim(p(w + .35, 0, 0), p(w + .35, 0, L), `${L} м`, [12, 18, 'start']);
      g += dim(p(-.3, 0, 0), p(-.3, h, 0), `${num(h)} м`, [-10, 4, 'end']);
      // людина 1,75 м для масштабу
      const u = s, fx = ox - LP + 18, fy = oy;
      g += `<g class="c-man" transform="translate(${fx} ${fy})"><circle cx="0" cy="${-1.62 * u}" r="${.12 * u}"/><path d="M0 ${-1.48 * u}V${-.8 * u}M0 ${-.8 * u}L${-.16 * u} 0M0 ${-.8 * u}L${.16 * u} 0M${-.24 * u} ${-1.2 * u}L0 ${-1.38 * u}L${.24 * u} ${-1.2 * u}"/></g>`;
      g += `<text class="c-cap" x="${fx}" y="${fy + 20}" text-anchor="middle">1,75 м</text>`;
      svg.style.setProperty('--op', op); svg.innerHTML = g;
      const cap = `Схема теплиці «${m.name}»: ширина ${num(w)} м, довжина ${L} м, висота ${num(h)} м, покриття ${covName()}`;
      $('[data-cfg-cap]', cfg).textContent = cap;
    };
    f.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'cfg-w') fillModels();
      else if (t.name === 'cfg-m') { m = M.find(x => x.id === t.value); fillRest(); }
      else if (t.name === 'cfg-c') { th = +t.value; render(); }
    });
    lenIn.addEventListener('input', () => { L = m.lens[+lenIn.value]; render(); });
    $('[data-cfg-calc]', cfg).addEventListener('click', () => {
      const sz = $('#rozrakhunok input[name=size]'), r = $('#rozrakhunok input[value=tep]');
      if (sz) sz.value = `«${m.name}», ${num(m.wn)}×${L} м, ${covName()}`; if (r) r.checked = true;
    });
    mq.addEventListener('change', draw);
    fillModels();
  }

  // сцена «Де стане в пригоді полікарбонат»
  const sc = $('[data-scene]');
  if (sc) {
    const set = k => {
      sc.dataset.active = k;
      $$('[data-sc-pan]', sc).forEach(p => p.hidden = p.dataset.scPan !== k);
      $$('.sc-tab', sc).forEach(b => b.setAttribute('aria-pressed', b.dataset.scGo === k));
      $$('.sc-spot', sc).forEach(b => b.classList.toggle('is-on', b.dataset.scGo === k));
      $$('.s-g', sc).forEach(g => g.classList.toggle('is-on', g.dataset.sc === k));
    };
    sc.addEventListener('click', e => { const b = e.target.closest('[data-sc-go]'); if (b) set(b.dataset.scGo); });
    $$('.s-g', sc).forEach(g => g.addEventListener('click', () => set(g.dataset.sc)));
    // наведення на пункт списку чи точку підсвічує об'єкт на схемі; стрілки перемикають задачі
    const hov = k => $$('.s-g', sc).forEach(g => g.classList.toggle('is-hover', g.dataset.sc === k));
    $$('.sc-tab, .sc-spot', sc).forEach(b => { b.addEventListener('mouseenter', () => hov(b.dataset.scGo)); b.addEventListener('mouseleave', () => hov(null)); b.addEventListener('focus', () => hov(b.dataset.scGo)); b.addEventListener('blur', () => hov(null)); });
    const tabs = $$('.sc-tab', sc);
    tabs.forEach((b, i) => b.addEventListener('keydown', e => {
      const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0;
      if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); set(n.dataset.scGo); }
    }));
    set(sc.dataset.active);
  }
})();
