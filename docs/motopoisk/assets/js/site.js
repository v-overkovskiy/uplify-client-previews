(function () {
  'use strict';
  var ROOT = (document.currentScript && document.currentScript.src || '').replace(/assets\/js\/site\.js.*$/, '');
  var NB = ' ';
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '₴'; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }

  /* ---------- cart (local only) ---------- */
  var KEY = 'mp-cart', cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ } }
  var drawer = $('[data-drawer]'), lastFocus;
  function renderCart() {
    var MP = window.MP || {}, body = $('[data-cart-body]'), sum = 0, count = 0, html = '';
    Object.keys(cart).forEach(function (id) {
      var it = MP[id]; if (!it || cart[id] < 1) { delete cart[id]; return; }
      var q = cart[id]; sum += it.p * q; count += q;
      html += '<div class="ci"><img src="' + ROOT + 'assets/img/p/' + id + '.webp" alt="" width="72" height="72"><div><b>' + esc(it.n) + '</b>' +
        '<small class="sku mono" style="margin-top:6px">' + esc(it.s) + '</small>' + (garage && garage.slug && it.k !== 'univ' && it.g && it.g !== garage.slug ? '<small class="ci__warn">Розділ «' + esc(it.gn) + '», у вас обрано «' + esc(garage.name) + '»</small>' : '') + '<div class="qty"><button type="button" data-q="-1" data-id="' + id + '" aria-label="Менше">−</button><span aria-live="polite">' + q +
        '</span><button type="button" data-q="1" data-id="' + id + '" aria-label="Більше">+</button></div><button type="button" class="ci__rm" data-rm="' + id + '">Прибрати</button></div><div class="price" style="font-size:17px">' + money(it.p * q) + '</div></div>';
    });
    if (body) body.innerHTML = html || '<p class="empty" style="margin-top:24px">У кошику поки порожньо. Додайте деталь, що є в наявності.</p>';
    $$('[data-cart-count]').forEach(function (e) { e.textContent = count; });
    var s = $('[data-cart-sum]'); if (s) s.textContent = money(sum);
    save();
  }
  function openCart() {
    if (!drawer) return; lastFocus = document.activeElement;
    document.body.classList.add('cart-open'); drawer.setAttribute('aria-hidden', 'false');
    var c = $('.iconbtn[data-cart-close]', drawer); if (c) c.focus();
  }
  function closeCart() {
    if (!drawer) return;
    document.body.classList.remove('cart-open'); drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function add(id) {
    var it = (window.MP || {})[id]; if (!it || !it.a) return;
    cart[id] = (cart[id] || 0) + 1; renderCart(); openCart();
  }
  document.addEventListener('click', function (e) {
    var gc = e.target.closest('[data-garage-close]'); if (gc) { var gm = gc.closest('[data-garage]'); gm.removeAttribute('open'); $('summary', gm).focus(); return; }
    var t = e.target.closest('[data-add],[data-cart-open],[data-cart-close],[data-q],[data-rm],[data-top]'); if (!t) return;
    if (t.hasAttribute('data-add')) { e.preventDefault(); e.stopPropagation(); add(t.getAttribute('data-add')); }
    else if (t.hasAttribute('data-cart-open')) openCart();
    else if (t.hasAttribute('data-cart-close')) closeCart();
    else if (t.hasAttribute('data-q')) { var p = t.getAttribute('data-id'); cart[p] = (cart[p] || 0) + (+t.getAttribute('data-q')); renderCart(); }
    else if (t.hasAttribute('data-rm')) { delete cart[t.getAttribute('data-rm')]; renderCart(); }
    else if (t.hasAttribute('data-top')) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('cart-open')) closeCart();
    var m = $('[data-garage][open]'); if (m) { m.removeAttribute('open'); $('summary', m).focus(); }
  });
  document.addEventListener('click', function (e) { var m = $('[data-garage][open]'); if (m && !m.contains(e.target)) m.removeAttribute('open'); });
  renderCart();

  /* ---------- garage (remembers the last model page, local only) ---------- */
  var GK = 'mp-garage', garage = null;
  try { garage = JSON.parse(localStorage.getItem(GK) || 'null'); } catch (e) { garage = null; }
  var mpage = document.body.getAttribute('data-model');
  if (mpage) {
    garage = { slug: mpage, name: document.body.getAttribute('data-model-name') };
    try { localStorage.setItem(GK, JSON.stringify(garage)); } catch (e) { /* storage unavailable */ }
  }
  if (garage && garage.slug) {
    $$('[data-garage-label]').forEach(function (el) { el.textContent = 'Гараж: ' + garage.name; });
    $$('[data-garage-link]').forEach(function (el) {
      el.hidden = false; el.setAttribute('href', ROOT + 'm/' + garage.slug + '/');
      var n = $('[data-garage-name]', el); if (n) n.textContent = garage.name;
    });
  }

  /* ---------- fitment line on the product page ---------- */
  var fm = $('[data-fit-match]');
  if (fm) {
    var fk = fm.getAttribute('data-kind'), fg = fm.getAttribute('data-group'), fn = fm.getAttribute('data-group-name');
    if (fk === 'univ') fm.textContent = 'Універсальний розділ: звіряйте розмір і параметри з вашою технікою.';
    else if (!garage || !garage.slug) fm.textContent = 'Оберіть свою техніку в шапці, щоб звірити розділ.';
    else if (garage.slug === fg) { fm.textContent = 'Деталь із розділу вашої техніки: ' + garage.name + '.'; fm.classList.add('is-ok'); }
    else {
      fm.textContent = 'Ця деталь із розділу «' + fn + '», а у вас обрано «' + garage.name + '». Перевірте перед замовленням.'; fm.classList.add('is-warn');
      $$('[data-fit-flag]').forEach(function (f) { f.hidden = false; f.textContent = f.classList.contains('buybar__flag') ? 'Інший розділ' : 'Увага: деталь з розділу «' + fn + '», у вас обрано «' + garage.name + '»'; });
    }
  }

  /* ---------- open now (Europe/Kyiv) ---------- */
  var on = $('[data-open]');
  if (on) {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var wd = p.filter(function (x) { return x.type === 'weekday'; })[0].value, hh = +p.filter(function (x) { return x.type === 'hour'; })[0].value % 24;
      var open = ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'].indexOf(wd) > -1 && hh >= 10 && hh < 17;
      on.classList.toggle('is-open', open);
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], names = { Mon: 'у понеділок', Tue: 'у вівторок', Wed: 'у середу', Thu: 'у четвер', Sat: 'у суботу' }, okd = ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'], txt = 'Зараз відчинено до 17:00';
      if (!open) {
        var i = days.indexOf(wd), nxt = '', k;
        if (okd.indexOf(wd) > -1 && hh < 10) nxt = 'сьогодні о 10:00';
        else for (k = 1; k <= 7; k++) { var dn = days[(i + k) % 7]; if (okd.indexOf(dn) > -1) { nxt = (k === 1 ? 'завтра' : names[dn]) + ' о 10:00'; break; } }
        txt = 'Зараз зачинено, відчинимось ' + nxt;
      }
      $('span', on).textContent = txt;
    } catch (e) { /* keep static text */ }
  }

  /* ---------- listing filters (model + catalog pages) ---------- */
  var grid = $('[data-grid]');
  if (grid) {
    var cards = $$('.pcard', grid), qs = new URLSearchParams(location.search), PAGE = 48;
    var st = { sys: qs.get('sys') || '', bike: qs.get('bike') || '', avail: qs.get('avail') === '1', q: (qs.get('q') || '').trim().toLowerCase(), sort: 'stock', shown: PAGE };
    var cnt = $('[data-count]'), emp = $('[data-empty]'), chk = $('[data-f-avail]'), qin = $('[data-f-q]'), more = $('[data-more]'), selB = $('[data-f-bike]'), selS = $('[data-f-sort]');
    var hq = $('#q'); if (hq && st.q) hq.value = qs.get('q');
    if (qin && st.q) qin.value = qs.get('q');
    if (chk) chk.checked = st.avail;
    if (selB) selB.value = st.bike;
    var chips = $$('[data-f-sys]');
    var totalAll = +grid.getAttribute('data-total') || cards.length, scope = grid.getAttribute('data-scope') || '';
    function apply() {
      var order = cards.slice();
      if (st.sort === 'asc') order.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
      else if (st.sort === 'desc') order.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
      else order.sort(function (a, b) { return (b.dataset.avail - a.dataset.avail) || (a.dataset.i - b.dataset.i); });
      order.forEach(function (c) { grid.appendChild(c); });
      var n = 0, vis = 0;
      order.forEach(function (c) {
        var ok = (!st.sys || c.dataset.sys === st.sys) && (!st.bike || c.dataset.bike === st.bike) && (!st.avail || c.dataset.avail === '1') && (!st.q || c.dataset.name.indexOf(st.q) > -1);
        if (ok) { n++; c.hidden = n > st.shown; if (!c.hidden) vis++; } else c.hidden = true;
      });
      chips.forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-f-sys') || '') === st.sys)); });
      if (emp) emp.hidden = n > 0;
      if (more) more.hidden = n <= st.shown;
      if (cnt) {
        var tot = st.sys ? (+($('[data-f-sys="' + st.sys + '"]') || {}).getAttribute('data-total') || 0) : totalAll;
        var fmt = function (x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, NB); };
        cnt.textContent = (st.q || st.avail || st.bike) ? 'Знайдено: ' + n : (n > vis ? 'Показано ' + vis + ' із ' + n : 'Позицій: ' + n);
      }
    }
    function sync() {
      var u = new URLSearchParams();
      if (st.sys) u.set('sys', st.sys); if (st.bike) u.set('bike', st.bike); if (st.avail) u.set('avail', '1'); if (st.q) u.set('q', st.q);
      try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '')); } catch (e) { /* ignore */ }
    }
    chips.forEach(function (b) { b.addEventListener('click', function () { st.sys = b.getAttribute('data-f-sys') || ''; st.shown = PAGE; apply(); sync(); }); });
    if (chk) chk.addEventListener('change', function () { st.avail = chk.checked; st.shown = PAGE; apply(); sync(); });
    if (qin) qin.addEventListener('input', function () { st.q = qin.value.trim().toLowerCase(); st.shown = PAGE; apply(); sync(); });
    if (selB) selB.addEventListener('change', function () { st.bike = selB.value; st.shown = PAGE; apply(); sync(); });
    if (selS) selS.addEventListener('change', function () { st.sort = selS.value; st.shown = PAGE; apply(); });
    if (more) more.addEventListener('click', function () { st.shown += PAGE; apply(); });
    apply();
  }

  /* ---------- pdp sticky bar ---------- */
  var bb = $('[data-buybar]'), bx = $('[data-buybox]');
  if (bb && bx && 'IntersectionObserver' in window) {
    bb.style.visibility = 'hidden';
    new IntersectionObserver(function (en) { bb.style.visibility = en[0].isIntersecting ? 'hidden' : 'visible'; }).observe(bx);
  }
})();
