(function () {
  'use strict';
  var ROOT = (document.currentScript && document.currentScript.src || '').replace(/assets\/js\/site\.js.*$/, '');
  var NB = ' ';
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + 'грн'; }
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
  var KEY = 'lx-cart', cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ } }
  var drawer = $('[data-drawer]'), lastFocus;
  function renderCart() {
    var LX = window.LX || {}, body = $('[data-cart-body]'), sum = 0, count = 0, html = '';
    Object.keys(cart).forEach(function (pid) {
      var it = LX[pid]; if (!it || cart[pid] < 1) { delete cart[pid]; return; }
      var q = cart[pid]; sum += it.p * q; count += q;
      html += '<div class="ci"><img src="' + ROOT + 'assets/img/' + it.i + '" alt="" width="72" height="72"><div><b>' + esc(it.n) + '</b>' +
        (it.l ? '<small>' + esc(it.l) + '</small>' : '') + '<div class="qty"><button type="button" data-q="-1" data-pid="' + pid + '" aria-label="Менше">−</button><span aria-live="polite">' + q +
        '</span><button type="button" data-q="1" data-pid="' + pid + '" aria-label="Більше">+</button></div></div><div class="price" style="font-size:17px">' + money(it.p * q) + '</div></div>';
    });
    if (body) body.innerHTML = html || '<p class="empty" style="margin-top:24px">У кошику поки порожньо. Додайте товар, що є в наявності.</p>';
    $$('[data-cart-count]').forEach(function (e) { e.textContent = count; });
    var s = $('[data-cart-sum]'); if (s) s.textContent = money(sum);
    save();
  }
  function openCart() {
    if (!drawer) return; lastFocus = document.activeElement;
    document.body.classList.add('cart-open'); drawer.setAttribute('aria-hidden', 'false');
    var c = $('[data-cart-close].iconbtn', drawer); if (c) c.focus();
  }
  function closeCart() {
    if (!drawer) return;
    document.body.classList.remove('cart-open'); drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function add(pid) {
    var it = (window.LX || {})[pid]; if (!it || !it.a) return;
    cart[pid] = (cart[pid] || 0) + 1; renderCart(); toast('Додано в кошик: ' + it.n + (it.l ? ', ' + it.l : '')); openCart();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-cart-open],[data-cart-close],[data-q],[data-top]'); if (!t) return;
    if (t.hasAttribute('data-add')) { e.preventDefault(); e.stopPropagation(); add(t.getAttribute('data-add')); }
    else if (t.hasAttribute('data-cart-open')) openCart();
    else if (t.hasAttribute('data-cart-close')) closeCart();
    else if (t.hasAttribute('data-q')) { var p = t.getAttribute('data-pid'); cart[p] = (cart[p] || 0) + (+t.getAttribute('data-q')); renderCart(); }
    else if (t.hasAttribute('data-top')) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('cart-open')) closeCart();
    var m = $('[data-mega][open]'); if (m) { m.removeAttribute('open'); $('summary', m).focus(); }
  });
  document.addEventListener('click', function (e) { var m = $('[data-mega][open]'); if (m && !m.contains(e.target)) m.removeAttribute('open'); });
  renderCart();

  /* ---------- listing filters ---------- */
  var grid = $('[data-grid]');
  if (grid) {
    var cards = $$('.pcard', grid), qs = new URLSearchParams(location.search);
    var st = { type: qs.get('type') || '', scen: qs.get('scen') || '', avail: qs.get('avail') === '1', q: (qs.get('q') || '').trim().toLowerCase() };
    var cnt = $('[data-count]'), emp = $('[data-empty]'), chk = $('[data-f-avail]'), qin = $('#q');
    if (qin && st.q) qin.value = qs.get('q');
    if (chk) chk.checked = st.avail;
    function apply() {
      var n = 0;
      cards.forEach(function (c) {
        var ok = (!st.type || c.dataset.type === st.type) && (!st.scen || c.dataset.scen === st.scen) && (!st.avail || c.dataset.avail === '1') && (!st.q || c.dataset.name.indexOf(st.q) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      $$('[data-f-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fType === st.type)); });
      $$('[data-f-scen]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fScen === st.scen)); });
      if (cnt) cnt.textContent = (st.q ? 'За запитом «' + qs.get('q') + '»: ' : 'Показано ') + n + (n === 1 ? ' товар' : ' товарів');
      if (emp) emp.hidden = n > 0; grid.hidden = n === 0;
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-f-type],[data-f-scen]'); if (!t) return;
      if (t.hasAttribute('data-f-type')) st.type = t.dataset.fType;
      else st.scen = st.scen === t.dataset.fScen ? '' : t.dataset.fScen;
      apply();
    });
    if (chk) chk.addEventListener('change', function () { st.avail = chk.checked; apply(); });
    apply();
  }

  /* ---------- product page ---------- */
  var F = window.FAM, pdp = $('[data-pdp]');
  if (F && pdp) {
    var cur = F.variants.filter(function (v) { return v.pid === F.cur; })[0] || F.variants[0];
    var thumbs = $$('.thumb', pdp), main = $('[data-gal-main] img', pdp), origFirst = thumbs.length ? $('img', thumbs[0]).getAttribute('src') : '';
    var leadPid = F.cur, notify = $('[data-notify]');
    function show(i) {
      var im = $('img', thumbs[i]); if (!im) return;
      main.src = im.src; thumbs.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    }
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    function stars(r) { return r ? '★ ' + String(r).replace('.', ',') : ''; }
    function render(first) {
      var v = cur;
      $('[data-price]').innerHTML = (v.avail ? '' : '') + money(v.price) + (v.old ? '<s>' + money(v.old) + '</s>' : '');
      $('[data-stock]').innerHTML = v.avail ? '<span class="stock stock--in"><i class="dot"></i>Є в наявності</span>' : '<span class="stock stock--off"><i class="dot dot--off"></i>Немає в наявності</span>';
      var bits = [];
      if (v.rating) bits.push(stars(v.rating) + ' · ' + v.reviews + ' ' + (v.reviews % 10 === 1 && v.reviews % 100 !== 11 ? 'відгук' : (v.reviews % 10 >= 2 && v.reviews % 10 <= 4 && (v.reviews % 100 < 12 || v.reviews % 100 > 14)) ? 'відгуки' : 'відгуків'));
      if (v.orders >= 30) bits.push('Замовляли ' + v.orders + ' разів');
      $('[data-sub]').innerHTML = bits.map(function (b) { return '<span>' + b + '</span>'; }).join('');
      var cta = $('[data-cta]'), bc = $('[data-bcta]'), bp = $('[data-bprice]');
      if (v.avail) {
        cta.innerHTML = '<button class="btn btn--gold" type="button" data-add="' + v.pid + '">Додати в кошик</button>';
        bc.innerHTML = '<button class="btn btn--gold" type="button" data-add="' + v.pid + '">Купити</button>';
        if (notify) notify.hidden = true;
      } else {
        cta.innerHTML = '<button class="btn" type="button" disabled>Немає в наявності</button><button class="btn btn--line" type="button" data-notify-btn aria-expanded="false">Повідомити про надходження</button><a class="btn btn--line" href="' + F.tel + '">Запитати за телефоном</a>';
        bc.innerHTML = '<button class="btn btn--line" type="button" data-notify-btn aria-expanded="false">Повідомити</button>';
        if (notify) notify.hidden = true;
      }
      if (bp) bp.textContent = money(v.price);
      $$('[data-coin]', pdp).forEach(function (e) { e.hidden = !v.avail; });
      $$('.var', pdp).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.var === v.pid)); });
      var dl = $('[data-attrs]'); if (dl) dl.innerHTML = v.attrs.map(function (a) { return '<div><dt>' + esc(a[0]) + '</dt><dd>' + esc(a[1]) + '</dd></div>'; }).join('');
      if (thumbs.length) {
        $('img', thumbs[0]).src = v.pid === leadPid ? origFirst : v.img;
        if (!first) show(0); else main.src = $('img', thumbs[0]).src;
      }
    }
    pdp.addEventListener('click', function (e) {
      var b = e.target.closest('.var'); if (!b) return;
      cur = F.variants.filter(function (v) { return v.pid === +b.dataset.var; })[0]; render(false);
    });
    document.addEventListener('click', function (e) {
      var n = e.target.closest('[data-notify-btn]'); if (!n || !notify) return;
      notify.hidden = !notify.hidden; $$('[data-notify-btn]').forEach(function (x) { x.setAttribute('aria-expanded', String(!notify.hidden)); });
    });
    render(true);
  }
})();
