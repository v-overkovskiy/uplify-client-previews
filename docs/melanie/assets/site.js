/* Melanie Barbie Toys - concept. No dependencies. Cart lives only in this browser (localStorage). */
(function () {
  'use strict';
  var ROOT = document.body.getAttribute('data-root') || './';
  var M = window.MBT || { items: [], lines: {}, shop: {} };
  var BY = {}; M.items.forEach(function (i) { BY[i.id] = i; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NB = ' ';
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '₴'; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var LAST_FOCUS = null;

  /* ---------- scroll lock + overlay helpers ---------- */
  function lock(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function trap(panel, close) {
    function key(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href],button:not([disabled]),input,select,summary', panel).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
    }
    panel.addEventListener('keydown', key);
  }

  /* ---------- mega menu ---------- */
  var megaBtn = $('[data-mega]'), mega = $('#mega'), hdr = $('.hdr');
  function megaOpen(o) {
    if (!megaBtn || !mega) return; mega.hidden = !o; megaBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener('click', function () { megaOpen(mega.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mega.hidden) { megaOpen(false); megaBtn.focus(); } });
    document.addEventListener('click', function (e) { if (!mega.hidden && !e.target.closest('.hdr')) megaOpen(false); });
  }

  /* ---------- mobile menu ---------- */
  var burger = $('[data-burger]');
  if (burger) burger.addEventListener('click', function () {
    LAST_FOCUS = burger; var src = $('#mega-src'); var s = document.createElement('div'); s.className = 'msheet';
    s.innerHTML = '<div class="msheet__p" role="dialog" aria-modal="true" aria-label="Меню"><div class="msheet__h"><a class="logo" href="' + ROOT + '">' + $('.logo').innerHTML + '</a><button class="x" type="button" aria-label="Закрити меню"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 4 12 12M16 4 4 16"/></svg></button></div><div class="mega__side msheet__top"><ul><li><a href="tel:' + M.shop.tel + '">Зателефонувати <span>' + esc(M.shop.telText) + '</span></a></li><li><a href="' + ROOT + 'info/">Доставка й оплата</a></li></ul></div>' + src.innerHTML + '</div>';
    document.body.appendChild(s); lock(true); var p = $('.msheet__p', s);
    function close() { s.remove(); lock(false); burger.focus(); }
    $('.x', s).addEventListener('click', close); s.addEventListener('click', function (e) { if (e.target === s) close(); });
    $$('a', s).forEach(function (a) { a.addEventListener('click', function () { lock(false); }); });
    trap(p, close); $('.x', s).focus();
  });

  /* ---------- search + suggestions ---------- */
  function norm(s) { return String(s).toLowerCase().replace(/[’`ʼ]/g, "'").replace(/\s+/g, ' ').trim(); }
  function find(q, n) {
    var t = norm(q).split(' ').filter(Boolean); if (!t.length) return [];
    var out = [];
    M.items.forEach(function (i) {
      var h = norm(i.t + ' ' + i.e), sc = 0;
      for (var k = 0; k < t.length; k++) { var ix = h.indexOf(t[k]); if (ix < 0) return; sc += ix === 0 ? 3 : (h.charAt(ix - 1) === ' ' ? 2 : 0); }
      out.push([sc + (i.s === 'a' ? 2 : 0), i]);
    });
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out.slice(0, n).map(function (x) { return x[1]; });
  }
  $$('[data-srch]').forEach(function (box) {
    var inp = $('input', box), form = $('form', box), sug = null, sel = -1;
    function close() { if (sug) { sug.remove(); sug = null; } sel = -1; inp.setAttribute('aria-expanded', 'false'); }
    function render() {
      var q = inp.value; if (norm(q).length < 2) { close(); return; }
      var r = find(q, 6); if (!sug) { sug = document.createElement('div'); sug.className = 'sug'; sug.id = 'sug-' + Math.random().toString(36).slice(2, 7); sug.setAttribute('role', 'listbox'); box.appendChild(sug); }
      inp.setAttribute('aria-expanded', 'true'); inp.setAttribute('aria-controls', sug.id);
      sug.innerHTML = r.length ? r.map(function (i, k) { return '<a role="option" aria-selected="false" href="' + ROOT + 'p/' + i.id + '/"><img alt="" src="' + ROOT + 'assets/img/p/' + i.id + '.webp"><span><b>' + esc(i.t) + '</b><small>' + esc((M.lines[i.l] ? M.lines[i.l].name : '') + (M.cond[i.c] ? ' · ' + M.cond[i.c] : '') + ' · ' + M.stock[i.s]) + '</small></span><span class="p">' + money(i.p) + '</span></a>'; }).join('') + '<a class="sug__all" href="' + ROOT + 'catalog/?q=' + encodeURIComponent(q) + '">Усі результати</a>' : '<p style="padding:14px 12px;color:#5B4B66">Нічого не знайшли. Спробуйте ім’я персонажа: Дракулаура, Хлоя, Венздей.</p>';
      sel = -1;
    }
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', function (e) {
      if (!sug) return; var o = $$('a[role=option]', sug);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + o.length) % o.length; o.forEach(function (a, k) { a.setAttribute('aria-selected', k === sel ? 'true' : 'false'); }); }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = o[sel].href; }
      else if (e.key === 'Escape') close();
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    form.addEventListener('submit', function (e) { if (!inp.value.trim()) { e.preventDefault(); inp.focus(); } });
  });
  var sIcon = $('[data-srch-toggle]');
  if (sIcon) sIcon.addEventListener('click', function () { var o = !hdr.classList.contains('s-open'); hdr.classList.toggle('s-open', o); sIcon.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) $('.srch input').focus(); });

  /* ---------- cart ---------- */
  var KEY = 'mbt_cart_v1', cart = store(KEY) || {}, drawer = null;
  function count() { return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0); }
  function sync() { store(KEY, cart); $$('[data-cart-n]').forEach(function (e) { var n = count(); e.textContent = n || ''; e.setAttribute('data-n', n); }); if (drawer) drawRender(); }
  function add(id, q) { var it = BY[id]; if (!it || it.s === 'n') return; cart[id] = Math.min(9, (cart[id] || 0) + (q || 1)); sync(); }
  function toast(msg, act) {
    $$('.toast').forEach(function (t) { t.remove(); }); var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (act ? '<button type="button">' + esc(act.label) + '</button>' : ''); document.body.appendChild(t);
    if (act) $('button', t).addEventListener('click', function () { t.remove(); act.fn(); });
    setTimeout(function () { t.remove(); }, 4200);
  }
  function drawRender() {
    var ids = Object.keys(cart), b = $('.dr__b', drawer), f = $('.dr__f', drawer);
    if (!ids.length) { b.innerHTML = '<div class="dr__e"><p style="font:600 22px var(--serif);color:var(--ink);margin-bottom:8px">Кошик порожній</p><p>Додайте ляльку з вітрини, і вона з’явиться тут.</p></div>'; f.hidden = true; return; }
    f.hidden = false; var sum = 0;
    b.innerHTML = ids.map(function (id) { var i = BY[id]; if (!i) return ''; sum += i.p * cart[id]; return '<div class="li"><img alt="" src="' + ROOT + 'assets/img/p/' + id + '.webp"><div><a href="' + ROOT + 'p/' + id + '/">' + esc(i.t) + '</a><p class="li__s">' + esc((M.cond[i.c] ? M.cond[i.c] + ' · ' : '') + M.stock[i.s]) + '</p><div class="li__r"><div class="qty" role="group" aria-label="Кількість"><button type="button" data-dec="' + id + '" aria-label="Менше">−</button><output>' + cart[id] + '</output><button type="button" data-inc="' + id + '" aria-label="Більше">+</button></div><b style="font:600 18px var(--serif)">' + money(i.p * cart[id]) + '</b></div><button class="li__rm" type="button" data-rm="' + id + '">Прибрати</button></div></div>'; }).join('');
    $('.dr__tot b', drawer).textContent = money(sum);
  }
  function openCart() {
    if (drawer) return; LAST_FOCUS = document.activeElement;
    drawer = document.createElement('div'); drawer.className = 'dr';
    drawer.innerHTML = '<div class="dr__p" role="dialog" aria-modal="true" aria-label="Кошик"><div class="dr__h"><h2>Кошик</h2><button class="x" type="button" aria-label="Закрити кошик"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 4 12 12M16 4 4 16"/></svg></button></div><div class="dr__b"></div><div class="dr__f"><div class="dr__tot"><span>Разом</span><b></b></div><p class="dr__note">Доставка не входить у суму: для післясплати потрібен аванс за доставку 150–300 ₴, залежно від габаритів.</p><p class="dr__note">Демонстрація: кошик зберігається лише у вашому браузері, замовлення тут не оформлюються. Надішліть список магазину в чат або продиктуйте по телефону.</p><button class="btn btn--pri" type="button" data-copy>Скопіювати список для чату</button><a class="btn" href="tel:' + M.shop.tel + '">Замовити по телефону</a><a class="link" href="' + M.shop.prom + '" target="_blank" rel="noopener">Відкрити чат магазину на Prom</a></div></div>';
    document.body.appendChild(drawer); lock(true); drawRender();
    var p = $('.dr__p', drawer);
    function close() { drawer.remove(); drawer = null; lock(false); if (LAST_FOCUS && LAST_FOCUS.focus) LAST_FOCUS.focus(); }
    drawer.close = close;
    drawer.addEventListener('click', function (e) {
      var t = e.target; if (t === drawer || t.closest('.x')) { close(); return; }
      var d = t.closest('[data-dec]'), n = t.closest('[data-inc]'), r = t.closest('[data-rm]');
      if (d) { var id = d.getAttribute('data-dec'); cart[id] = (cart[id] || 1) - 1; if (cart[id] < 1) delete cart[id]; sync(); }
      if (n) { var id2 = n.getAttribute('data-inc'); cart[id2] = Math.min(9, cart[id2] + 1); sync(); }
      if (r) { delete cart[r.getAttribute('data-rm')]; sync(); }
      if (t.closest('[data-copy]')) {
        var lines = Object.keys(cart).map(function (id) { var i = BY[id]; return '- ' + i.t + ' (' + M.shop.promItem + id + ') x' + cart[id] + ' = ' + (i.p * cart[id]) + ' грн'; });
        var txt = 'Хочу замовити:\n' + lines.join('\n') + '\nРазом: ' + Object.keys(cart).reduce(function (s, id) { return s + BY[id].p * cart[id]; }, 0) + ' грн';
        var done = function () { toast('Список скопійовано. Вставте його в чат магазину.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { window.prompt('Скопіюйте список', txt); }); else window.prompt('Скопіюйте список', txt);
      }
    });
    trap(p, close); $('.x', drawer).focus();
  }
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', openCart); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (!a) return; e.preventDefault();
    var id = a.getAttribute('data-add'), q = 1, qo = $('[data-qty]'); if (qo && a.hasAttribute('data-useqty')) q = parseInt(qo.textContent, 10) || 1;
    add(id, q); if (drawer) return; toast('Додано до кошика: ' + (BY[id] ? BY[id].t : ''), { label: 'Відкрити', fn: openCart });
  });
  sync();

  /* ---------- PDP ---------- */
  $$('[data-qty-dec],[data-qty-inc]').forEach(function (b) { b.addEventListener('click', function () { var o = $('[data-qty]'); var n = parseInt(o.textContent, 10) + (b.hasAttribute('data-qty-inc') ? 1 : -1); o.textContent = Math.max(1, Math.min(9, n)); }); });
  var main = $('[data-gal-main]');
  $$('[data-gal-th]').forEach(function (b) { b.addEventListener('click', function () { main.src = b.getAttribute('data-gal-th'); $$('[data-gal-th]').forEach(function (x) { x.setAttribute('aria-current', 'false'); }); b.setAttribute('aria-current', 'true'); }); });
  var bar = $('.sbar'), anchor = $('[data-buy-anchor]');
  if (bar && anchor && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(anchor);

  /* ---------- listing engine ---------- */
  var grid = $('[data-grid]');
  if (grid) (function () {
    var cards = $$('.card', grid), PAGE = 24, shown = PAGE;
    var multi = {}, st = { pmin: '', pmax: '', q: '', avail: false, sort: 'def' };
    var ctl = $$('[data-f]'), qi = $('[data-q]'), pmin = $('[data-p=pmin]'), pmax = $('[data-p=pmax]'), av = $('[data-avail]'), so = $('[data-sort]');
    ctl.forEach(function (c) { var k = c.getAttribute('data-f'); multi[k] = multi[k] || {}; });
    var P = new URLSearchParams(location.search);
    Object.keys(multi).forEach(function (k) { var v = P.get(k); if (v) v.split(',').forEach(function (x) { multi[k][x] = 1; }); });
    st.q = P.get('q') || ''; st.pmin = P.get('pmin') || ''; st.pmax = P.get('pmax') || ''; st.avail = P.get('avail') === '1'; st.sort = P.get('sort') || 'def';
    if (location.hash === '#q' && qi) qi.focus();
    function ui() {
      ctl.forEach(function (c) { var on = !!multi[c.getAttribute('data-f')][c.getAttribute('data-v') || c.value]; if (c.tagName === 'INPUT') c.checked = on; else c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (qi) qi.value = st.q; if (pmin) pmin.value = st.pmin; if (pmax) pmax.value = st.pmax; if (av) av.checked = st.avail; if (so) so.value = st.sort;
      $$('[data-band]').forEach(function (b) { var r = b.getAttribute('data-band').split('-'); b.setAttribute('aria-pressed', (st.pmin === r[0] && st.pmax === r[1]) ? 'true' : 'false'); });
    }
    function match(c, skip) {
      var d = c.dataset, k, any;
      for (k in multi) { if (k === skip) continue; var sel = Object.keys(multi[k]); if (!sel.length) continue; if (k === 'c') { any = sel.some(function (v) { return v === 'col' ? d.col === '1' : d.c === v; }); } else any = sel.indexOf(d[k]) >= 0; if (!any) return false; }
      var p = +d.p; if (st.pmin !== '' && p < +st.pmin) return false; if (st.pmax !== '' && p > +st.pmax) return false;
      if (st.avail && d.s === 'n') return false;
      if (st.q) { var h = norm(d.q), t = norm(st.q).split(' '); for (var j = 0; j < t.length; j++) if (h.indexOf(t[j]) < 0) return false; }
      return true;
    }
    var order = cards.slice();
    function sorted(list) {
      var r = { a: 0, o: 1, n: 2 }, s = st.sort, base = order.indexOf.bind(order);
      return list.slice().sort(function (a, b) {
        var x = a.dataset, y = b.dataset;
        if (s === 'pa') return +x.p - +y.p; if (s === 'pd') return +y.p - +x.p;
        if (s === 'sale') return (+y.disc) - (+x.disc);
        if (s === 'pop') return (+y.pop) - (+x.pop);
        return (r[x.s] - r[y.s]) || (base(a) - base(b));
      });
    }
    function labelFor(k, v) { var e = $('[data-f="' + k + '"][data-v="' + v + '"]') || $('[data-f="' + k + '"][value="' + v + '"]'); return e ? (e.getAttribute('data-label') || e.textContent.replace(/\s*\d+$/, '').trim()) : v; }
    function render(push) {
      var list = sorted(cards.filter(function (c) { return match(c); })); cards.forEach(function (c) { c.hidden = true; });
      list.forEach(function (c, i) { c.hidden = i >= shown; grid.appendChild(c); });
      var more = $('[data-more]'); if (more) { more.hidden = list.length <= shown; $('button', more).textContent = 'Показати ще ' + Math.min(PAGE, list.length - shown); }
      var cnt = $('[data-count]'); if (cnt) cnt.textContent = list.length + ' ' + (list.length % 10 === 1 && list.length % 100 !== 11 ? 'позиція' : ([2, 3, 4].indexOf(list.length % 10) >= 0 && [12, 13, 14].indexOf(list.length % 100) < 0 ? 'позиції' : 'позицій'));
      var em = $('[data-empty]'); if (em) em.hidden = list.length > 0;
      var act = $('[data-active]'); if (act) {
        var h = []; Object.keys(multi).forEach(function (k) { Object.keys(multi[k]).forEach(function (v) { h.push('<button class="chip on" type="button" data-rmf="' + k + '|' + v + '">' + esc(labelFor(k, v)) + ' <span aria-hidden="true">×</span><span class="sr"> прибрати фільтр</span></button>'); }); });
        if (st.pmin || st.pmax) h.push('<button class="chip on" type="button" data-rmf="price|">' + (st.pmin || '0') + '–' + (st.pmax || '∞') + ' ₴ <span aria-hidden="true">×</span><span class="sr"> прибрати ціну</span></button>');
        if (st.avail) h.push('<button class="chip on" type="button" data-rmf="avail|">Готово до відправки <span aria-hidden="true">×</span><span class="sr"> прибрати</span></button>');
        if (st.q) h.push('<button class="chip on" type="button" data-rmf="q|">«' + esc(st.q) + '» <span aria-hidden="true">×</span><span class="sr"> прибрати пошук</span></button>');
        if (h.length) h.push('<button class="chip" type="button" data-reset style="border-style:dashed">Скинути все</button>'); act.innerHTML = h.join(''); act.hidden = !h.length;
      }
      var nf = Object.keys(multi).reduce(function (n, k) { return n + Object.keys(multi[k]).length; }, 0) + (st.pmin || st.pmax ? 1 : 0) + (st.avail ? 1 : 0) + (st.q ? 1 : 0);
      $$('[data-fn]').forEach(function (e) { e.textContent = nf ? ' (' + nf + ')' : ''; });
      if (push !== false) {
        var u = new URLSearchParams(); Object.keys(multi).forEach(function (k) { var v = Object.keys(multi[k]); if (v.length) u.set(k, v.join(',')); });
        if (st.q) u.set('q', st.q); if (st.pmin) u.set('pmin', st.pmin); if (st.pmax) u.set('pmax', st.pmax); if (st.avail) u.set('avail', '1'); if (st.sort !== 'def') u.set('sort', st.sort);
        try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u.toString() : '')); } catch (e) { }
      }
      $$('.opt input[data-f]').forEach(function (inp) { var sm = $('small', inp.parentNode); if (!sm) return; var k = inp.getAttribute('data-f'), v = inp.getAttribute('data-v'); sm.textContent = cards.filter(function (c) { if (!match(c, k)) return false; return k === 'c' && v === 'col' ? c.dataset.col === '1' : c.dataset[k] === v; }).length; });
      $$('[data-show]').forEach(function (e) { e.textContent = 'Показати ' + list.length; });
      ui();
    }
    function reset() { Object.keys(multi).forEach(function (k) { multi[k] = {}; }); st.q = ''; st.pmin = ''; st.pmax = ''; st.avail = false; shown = PAGE; render(); }
    ctl.forEach(function (c) {
      c.addEventListener('click', function (e) {
        var k = c.getAttribute('data-f'), v = c.getAttribute('data-v') || c.value;
        if (c.tagName === 'INPUT') { if (c.checked) multi[k][v] = 1; else delete multi[k][v]; } else { if (multi[k][v]) delete multi[k][v]; else { if (c.hasAttribute('data-single')) multi[k] = {}; multi[k][v] = 1; } }
        shown = PAGE; render();
      });
    });
    if (qi) qi.addEventListener('input', function () { st.q = qi.value.trim(); shown = PAGE; render(); });
    if (pmin) pmin.addEventListener('input', function () { st.pmin = pmin.value; shown = PAGE; render(); });
    if (pmax) pmax.addEventListener('input', function () { st.pmax = pmax.value; shown = PAGE; render(); });
    if (av) av.addEventListener('change', function () { st.avail = av.checked; shown = PAGE; render(); });
    if (so) so.addEventListener('change', function () { st.sort = so.value; render(); });
    $$('[data-band]').forEach(function (b) { b.addEventListener('click', function () { var r = b.getAttribute('data-band').split('-'); if (st.pmin === r[0] && st.pmax === r[1]) { st.pmin = ''; st.pmax = ''; } else { st.pmin = r[0]; st.pmax = r[1]; } shown = PAGE; render(); }); });
    document.addEventListener('click', function (e) {
      var r = e.target.closest('[data-rmf]'); if (r) { var a = r.getAttribute('data-rmf').split('|'); if (a[0] === 'price') { st.pmin = ''; st.pmax = ''; } else if (a[0] === 'avail') st.avail = false; else if (a[0] === 'q') st.q = ''; else delete multi[a[0]][a[1]]; shown = PAGE; render(); }
      if (e.target.closest('[data-reset]')) reset();
    });
    var mb = $('[data-more] button'); if (mb) mb.addEventListener('click', function () { shown += PAGE; render(false); });
    /* mobile filter sheet */
    var rail = $('[data-rail]'), fb = $('[data-fopen]'), shade = null;
    function fclose() { if (!rail) return; rail.classList.remove('open'); if (shade) { shade.remove(); shade = null; } lock(false); if (fb) fb.focus(); }
    if (fb && rail) { fb.addEventListener('click', function () { rail.classList.add('open'); shade = document.createElement('div'); shade.className = 'fshade'; shade.addEventListener('click', fclose); document.body.appendChild(shade); lock(true); $('[data-fclose]', rail).focus(); }); $$('[data-fclose]', rail).forEach(function (b) { b.addEventListener('click', fclose); }); trap(rail, fclose); }
    render(false); if (location.search) render(false);
  })();
})();
