/* PARROT concept — progressive enhancement only. Every page stays readable and linkable without this file. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var BASE = root.getAttribute('data-base') || './';
  var IDX = [];
  try { IDX = JSON.parse((doc.getElementById('idx') || {}).textContent || '[]'); } catch (e) { IDX = []; }
  var BY = {}; IDX.forEach(function (p) { BY[p.sku] = p; });
  var nbsp = ' ';
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, nbsp) + nbsp + '₴'; }
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function norm(s) { return String(s).toLowerCase().replace(/[‐-―]/g, '-').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- toast ---------- */
  var toast = $('#toast'), toastT;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 2200);
  }

  /* ---------- cart (local prototype, no orders) ---------- */
  var mem = {}, store = null;
  try { store = window.localStorage; store.setItem('_t', '1'); store.removeItem('_t'); } catch (e) { store = null; }
  function load() { try { return store ? JSON.parse(store.getItem('parrot-cart') || '{}') : mem; } catch (e) { return mem; } }
  function save(c) { mem = c; try { if (store) store.setItem('parrot-cart', JSON.stringify(c)); } catch (e) { /* private mode */ } }
  var cartDlg = $('#cart'), cartList = $('#cart-list'), cartTotal = $('#cart-total'), cartGo = $('#cart-go'), lastTrigger = null;
  function count(c) { return Object.keys(c).reduce(function (n, k) { return n + c[k]; }, 0); }
  function render() {
    var c = load(), n = count(c);
    $$('.js-cart-badge').forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
    if (!cartList) return;
    var skus = Object.keys(c).filter(function (k) { return BY[k]; }), sum = 0;
    if (!skus.length) { cartList.innerHTML = '<p class="cart__empty">Кошик порожній. Додайте товари з каталогу.</p>'; }
    else {
      cartList.innerHTML = skus.map(function (k) {
        var p = BY[k], q = c[k]; sum += p.price * q;
        return '<div class="cart__item"><img src="' + BASE + p.img + '" alt="" width="64" height="64"><div><h3>' + esc(p.title) + '</h3><div class="qty" role="group" aria-label="Кількість">' +
          '<button type="button" class="press" data-q="-1" data-sku="' + esc(k) + '" aria-label="Менше">−</button><output>' + q + '</output><button type="button" class="press" data-q="1" data-sku="' + esc(k) + '" aria-label="Більше">+</button></div></div>' +
          '<strong class="num">' + money(p.price * q) + '</strong></div>';
      }).join('');
    }
    if (cartTotal) cartTotal.textContent = money(sum);
    if (cartGo) cartGo.hidden = !skus.length;
  }
  function add(sku, q) {
    var c = load(); c[sku] = Math.max(0, (c[sku] || 0) + (q || 1)); if (!c[sku]) delete c[sku]; save(c); render();
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b && !b.disabled) {
      var q = 1, qb = b.closest('[data-buy]'); if (qb) { var o = $('output', qb); if (o) q = parseInt(o.textContent, 10) || 1; }
      add(b.getAttribute('data-add'), q); say('Додано в кошик'); return;
    }
    var m = e.target.closest('#cart-list [data-q]');
    if (m) { add(m.getAttribute('data-sku'), parseInt(m.getAttribute('data-q'), 10)); return; }
    var qs = e.target.closest('[data-qs]');
    if (qs) { var out = $('output', qs.closest('.qty')); out.textContent = Math.min(20, Math.max(1, (parseInt(out.textContent, 10) || 1) + parseInt(qs.getAttribute('data-qs'), 10))); return; }
    var open = e.target.closest('[data-cart-open]');
    if (open && cartDlg && cartDlg.showModal) { lastTrigger = open; cartDlg.showModal(); return; }
    if (e.target.closest('[data-cart-close]') && cartDlg) { cartDlg.close(); return; }
    if (e.target === cartDlg) cartDlg.close();
  });
  if (cartDlg) cartDlg.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });
  render();

  /* ---------- catalog menu ---------- */
  var mega = $('.mega');
  if (mega) {
    doc.addEventListener('click', function (e) { if (mega.open && !mega.contains(e.target)) mega.open = false; });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mega.open) { mega.open = false; $('summary', mega).focus(); } });
  }

  /* ---------- search with suggestions (combobox) ---------- */
  function rank(p, q, words) {
    var t = norm(p.title + ' ' + p.sku + ' ' + p.sub + ' ' + (p.brand || '')), s = 0;
    for (var i = 0; i < words.length; i++) { if (t.indexOf(words[i]) < 0) return -1; s += norm(p.title).indexOf(words[i]) === 0 ? 3 : 1; }
    if (norm(p.sku).indexOf(q) === 0) s += 5;
    return s + (p.top ? 1 : 0);
  }
  function find(q) {
    q = norm(q); if (!q) return [];
    var words = q.split(' ');
    return IDX.map(function (p) { return [rank(p, q, words), p]; }).filter(function (r) { return r[0] >= 0; })
      .sort(function (a, b) { return b[0] - a[0]; }).map(function (r) { return r[1]; });
  }
  $$('form[data-search]').forEach(function (form, n) {
    var inp = $('input[type=search]', form), box = $('.sugg', form), sel = -1, items = [];
    if (!inp || !box) return;
    function hide() { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); sel = -1; }
    function show() {
      var q = inp.value.trim(); if (!q) { hide(); return; }
      var res = find(q); items = res.slice(0, 5);
      if (!res.length) box.innerHTML = '<p class="sugg__empty">Нічого не знайдено за «' + esc(q) + '». Спробуйте артикул або тип пристрою.</p>';
      else box.innerHTML = '<ul role="listbox" id="sg' + n + '" aria-label="Підказки">' + items.map(function (p, i) {
        return '<li role="option" id="sg' + n + 'o' + i + '" aria-selected="false" class="sugg__item" data-href="' + BASE + p.url + '"><img src="' + BASE + p.img + '" alt="" width="48" height="48"><span><span class="sugg__t">' + esc(p.title) + '</span><span class="sugg__sku">' + esc(p.sku) + '</span></span><span class="sugg__p">' + money(p.price) + '</span></li>';
      }).join('') + '</ul><a class="sugg__more" href="' + BASE + 'search/?q=' + encodeURIComponent(q) + '">Усі результати (' + res.length + ')</a>';
      box.hidden = false; inp.setAttribute('aria-expanded', 'true'); sel = -1;
    }
    function mark(i) {
      var lis = $$('[role=option]', box); if (!lis.length) return;
      sel = (i + lis.length) % lis.length;
      lis.forEach(function (li, k) { li.setAttribute('aria-selected', k === sel ? 'true' : 'false'); });
      inp.setAttribute('aria-activedescendant', lis[sel].id);
    }
    inp.addEventListener('input', show);
    inp.addEventListener('focus', function () { if (inp.value.trim()) show(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (box.hidden) show(); mark(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Escape') { if (!box.hidden) { hide(); e.stopPropagation(); } }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = $$('[role=option]', box)[sel].getAttribute('data-href'); }
    });
    box.addEventListener('mousedown', function (e) { var li = e.target.closest('[role=option]'); if (li) { e.preventDefault(); location.href = li.getAttribute('data-href'); } });
    doc.addEventListener('click', function (e) { if (!form.contains(e.target)) hide(); });
  });

  /* ---------- home: swap hero search for header search on scroll ---------- */
  var heroSearch = $('.hero .search');
  if (heroSearch && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { doc.body.classList.toggle('hero-out', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-72px 0px 0px 0px' }).observe(heroSearch);
  } else { doc.body.classList.add('hero-out'); }

  /* ---------- search results page ---------- */
  var res = $('#search-results');
  if (res) {
    var q = new URLSearchParams(location.search).get('q') || '', hits = q ? find(q) : IDX, set = {};
    hits.forEach(function (p) { set[p.sku] = 1; });
    $$('.card', res).forEach(function (c) { c.hidden = !set[c.getAttribute('data-sku')]; });
    var n = hits.length, h = $('#search-title'), cnt = $('#search-count');
    if (h) h.textContent = q ? 'Результати за «' + q + '»' : 'Усі товари';
    if (cnt) cnt.textContent = n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'товар' : (n % 10 > 1 && n % 10 < 5 && (n % 100 < 12 || n % 100 > 14) ? 'товари' : 'товарів'));
    var em = $('#search-empty'); if (em) em.hidden = n > 0;
    $$('input[type=search]').forEach(function (i) { i.value = q; });
    if (q && hits.length) { var order = hits.map(function (p) { return p.sku; }); $$('.card', res).sort(function (a, b) { return order.indexOf(a.getAttribute('data-sku')) - order.indexOf(b.getAttribute('data-sku')); }).forEach(function (c) { c.parentNode.appendChild(c); }); }
  }

  /* ---------- listing: filters + sort ---------- */
  var grid = $('#listing-grid');
  if (grid) {
    var cards = $$('.card', grid), form = $('#filters'), sort = $('#sort'), cntEl = $('#list-count'), emptyEl = $('#list-empty'), orig = cards.slice();
    var plural = function (n) { return n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'товар' : (n % 10 > 1 && n % 10 < 5 && (n % 100 < 12 || n % 100 > 14) ? 'товари' : 'товарів')); };
    var apply = function () {
      var min = parseInt($('[name=min]', form).value, 10), max = parseInt($('[name=max]', form).value, 10);
      var onlyIn = $('[name=instock]', form).checked, onlyOff = $('[name=sale]', form).checked;
      var brands = $$('[name=brand]:checked', form).map(function (i) { return i.value; }), shown = 0;
      cards.forEach(function (c) {
        var price = +c.getAttribute('data-price'), ok = true;
        if (!isNaN(min) && price < min) ok = false;
        if (!isNaN(max) && price > max) ok = false;
        if (onlyIn && c.getAttribute('data-stock') !== 'in') ok = false;
        if (onlyOff && !c.getAttribute('data-off')) ok = false;
        if (brands.length && brands.indexOf(c.getAttribute('data-brand')) < 0) ok = false;
        c.hidden = !ok; if (ok) shown++;
      });
      cntEl.textContent = plural(shown); emptyEl.hidden = shown > 0;
    };
    var order = function () {
      var v = sort.value, list = orig.slice();
      if (v === 'asc') list.sort(function (a, b) { return a.getAttribute('data-price') - b.getAttribute('data-price'); });
      if (v === 'desc') list.sort(function (a, b) { return b.getAttribute('data-price') - a.getAttribute('data-price'); });
      if (v === 'new') list.sort(function (a, b) { return (b.getAttribute('data-new') ? 1 : 0) - (a.getAttribute('data-new') ? 1 : 0); });
      list.forEach(function (c) { grid.appendChild(c); });
    };
    form.addEventListener('input', apply); form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
    sort.addEventListener('change', order);
    var openF = function (on) { root.classList.toggle('filters-open', on); var b = $('#filters-open'); if (b) b.setAttribute('aria-expanded', on); if (on) { var f = $('input', form); if (f) f.focus(); } else if (b) b.focus(); };
    var fb = $('#filters-open'); if (fb) fb.addEventListener('click', function () { openF(true); });
    $$('[data-filters-close]').forEach(function (b) { b.addEventListener('click', function () { openF(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('filters-open')) openF(false); });
    apply();
  }

  /* ---------- PDP gallery thumbs reflect scroll position ---------- */
  var gal = $('.gal__main');
  if (gal) {
    var thumbs = $$('.gal__thumbs a'), slides = $$('.gal__slide', gal);
    var upd = function () { var i = Math.round(gal.scrollLeft / gal.clientWidth); thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); }); };
    gal.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    thumbs.forEach(function (t, k) { t.addEventListener('click', function (e) { e.preventDefault(); gal.scrollTo({ left: k * gal.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); }); });
    upd();
  }
})();
