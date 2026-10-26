(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* situation tabs */
  var tabsWrap = $('[data-tabs]');
  var tabs = tabsWrap ? $$('.tag', tabsWrap) : [];
  var panels = $$('.sit');
  function select(id, focus, scroll) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-sit') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      if (on && focus) t.focus();
      if (on && !focus && tabsWrap.scrollWidth > tabsWrap.clientWidth) {
        tabsWrap.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
      }
    });
    panels.forEach(function (p) { p.hidden = p.id !== 'sit-' + id; });
    var cur = $('#sit-' + id); if (cur) $$('img', cur).forEach(function (im) { im.loading = 'eager'; });
    try { history.replaceState(null, '', '#sit-' + id); } catch (e) {}
    if (scroll && window.matchMedia('(max-width:1100px)').matches) {
      var p = $('#sit-' + id);
      var r = p.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.top < 0) {
        p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (ev) { ev.preventDefault(); select(t.getAttribute('data-sit'), false, true); });
    t.addEventListener('keydown', function (ev) {
      var n = null;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') n = (i + 1) % tabs.length;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      if (ev.key === 'Home') n = 0;
      if (ev.key === 'End') n = tabs.length - 1;
      if (n !== null) { ev.preventDefault(); select(tabs[n].getAttribute('data-sit'), true, false); }
    });
  });
  var qs = (location.search.match(/[?&]s=(\w+)/) || [])[1];
  if (qs && tabs.some(function (t) { return t.getAttribute('data-sit') === qs; })) {
    document.documentElement.classList.add('no-trans');
    select(qs, false, false);
    setTimeout(function () { document.documentElement.classList.remove('no-trans'); }, 400);
  }
  var h = (location.hash || '').replace('#sit-', '');
  if (tabs.length && h && tabs.some(function (t) { return t.getAttribute('data-sit') === h; })) select(h, false, false);

  /* demo cart */
  var count = 0;
  var badge = $('[data-count]');
  function setCount(n) { count = n; badge.textContent = n; badge.setAttribute('data-n', n); }
  setCount(0);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-add]');
    if (b) {
      var n = 1;
      if (b.hasAttribute('data-withqty')) {
        var qi = $('[data-qty]');
        n = Math.max(1, parseInt(qi && qi.value, 10) || 1);
      }
      setCount(count + n);
      bump(b);
      toast('Демо: «' + b.getAttribute('data-add') + '»' + (n > 1 ? ' × ' + n : '') + ' додано лише в лічильник. Справжній кошик працює на сайті магазину.');
    }
    if (ev.target.closest('[data-cart]')) {
      toast(count ? 'Демо-кошик: ' + count + ' поз. Оформлення замовлення в концепті не працює.' : 'Демо-кошик порожній.');
    }
  });

  /* search is a prototype */
  var sf = $('[data-proto="search"]');
  if (sf) sf.addEventListener('submit', function (ev) {
    ev.preventDefault();
    toast('Демо: пошук у концепті не працює. На сайті це нативний пошук Horoshop.');
  });

  /* mobile menu */
  var burger = $('.head__burger');
  var nav = $('#nav');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* drinks dropdown */
  $$('.nav-drop').forEach(function (d) {
    var btn = $('.nav-drop__btn', d);
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var o = d.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    document.addEventListener('click', function (ev) {
      if (!d.contains(ev.target)) { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* listing: filter + sort (local, прототип) */
  var lst = $('[data-listing]');
  if (lst) {
    var grid = $('[data-grid]');
    var cards = $$('.card', grid);
    var shown = $('[data-shown]');
    var chips = $$('.fchip', lst);
    var sortSel = $('#sort');
    var cur = 'all';
    var match = function (c) {
      if (cur === 'all') return true;
      if (cur === 'hit') return c.dataset.hit === '1';
      if (cur === 'new') return c.dataset.new === '1';
      var times = c.dataset.time.split(' ');
      if (cur === 't1') return times.indexOf('1') > -1;
      if (cur === 't8') return times.indexOf('8') > -1;
      return true;
    };
    var apply = function () {
      var v = sortSel.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (v === 'asc') return a.dataset.price - b.dataset.price || a.dataset.pos - b.dataset.pos;
        if (v === 'desc') return b.dataset.price - a.dataset.price || a.dataset.pos - b.dataset.pos;
        if (v === 'per') return a.dataset.per - b.dataset.per || a.dataset.pos - b.dataset.pos;
        if (v === 'name') return a.dataset.name.localeCompare(b.dataset.name, 'uk');
        return a.dataset.pos - b.dataset.pos;
      });
      var n = 0;
      sorted.forEach(function (c) {
        var ok = match(c);
        c.hidden = !ok;
        if (ok) n++;
        grid.appendChild(c);
      });
      shown.textContent = n;
    };
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        cur = ch.getAttribute('data-f');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === ch ? 'true' : 'false'); });
        apply();
      });
    });
    sortSel.addEventListener('change', apply);
  }

  /* product: gallery, qty, favourite, tabs, sticky bar */
  var gal = $('[data-gal]');
  if (gal) {
    var mainImg = $('[data-main]', gal);
    $$('.gal__thumb', gal).forEach(function (t) {
      t.addEventListener('click', function () {
        mainImg.src = t.getAttribute('data-src');
        mainImg.alt = t.getAttribute('data-alt');
        $$('.gal__thumb', gal).forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      });
    });
  }
  var qv = $('[data-qty]');
  if (qv) {
    $$('.qty__b').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = (parseInt(qv.value, 10) || 1) + parseInt(b.getAttribute('data-q'), 10);
        qv.value = Math.min(99, Math.max(1, n));
      });
    });
    qv.addEventListener('change', function () {
      qv.value = Math.min(99, Math.max(1, parseInt(qv.value, 10) || 1));
    });
  }
  var fav = $('[data-fav]');
  if (fav) fav.addEventListener('click', function () {
    var on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', on ? 'true' : 'false');
    toast(on ? 'Демо: додано до обраного лише на цій сторінці.' : 'Демо: прибрано з обраного.');
  });
  var pt = $('[data-ptabs]');
  if (pt) {
    var ptabs = $$('[role=tab]', pt);
    var pshow = function (id, focus) {
      ptabs.forEach(function (t) {
        var on = t.getAttribute('data-p') === id;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) t.focus();
      });
      $$('.pp').forEach(function (p) { p.hidden = p.id !== 'pp-' + id; });
    };
    ptabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pshow(t.getAttribute('data-p'), false); });
      t.addEventListener('keydown', function (ev) {
        var n = null;
        if (ev.key === 'ArrowRight') n = (i + 1) % ptabs.length;
        if (ev.key === 'ArrowLeft') n = (i - 1 + ptabs.length) % ptabs.length;
        if (n !== null) { ev.preventDefault(); pshow(ptabs[n].getAttribute('data-p'), true); }
      });
    });
  }
  var sbar = $('[data-sbar]');
  var row = $('[data-buyrow]');
  if (sbar && row && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sbar');
    new IntersectionObserver(function (en) {
      sbar.hidden = en[0].isIntersecting || en[0].boundingClientRect.top > 0;
    }, { threshold: 0 }).observe(row);
  }

  /* mobile search toggle */
  var find = $('[data-find]');
  var sform = $('#q-form');
  if (find && sform) find.addEventListener('click', function () {
    var o = sform.classList.toggle('is-open');
    find.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o) { var qi = $('#q'); if (qi) qi.focus(); }
  });

  /* warm the scenario images so tab switching never shows an empty frame */
  var warm = function () {
    $$('.sit img').forEach(function (im) { var x = new Image(); x.src = im.currentSrc || im.src; });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1500);

  /* min-order helper (product page) */
  var mn = $('[data-min]');
  if (mn) {
    var unit = parseFloat(mn.getAttribute('data-price'));
    var fmt = function (x) { return x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); };
    var upd = function () {
      var n = Math.max(1, parseInt(($('[data-qty]') || {}).value, 10) || 1);
      var sum = unit * n;
      if (sum >= 299) mn.innerHTML = n + ' шт. = <b>' + fmt(sum) + ' грн</b>. Мінімальне замовлення 299 грн виконано.';
      else mn.innerHTML = n + ' шт. = ' + fmt(sum) + ' грн. До мінімального замовлення 299 грн ще <b>' + fmt(299 - sum) + ' грн</b> (' + Math.ceil((299 - sum) / unit) + ' шт.).';
    };
    upd();
    document.addEventListener('click', function (ev) { if (ev.target.closest('.qty__b')) upd(); });
    var qq = $('[data-qty]'); if (qq) qq.addEventListener('change', upd);
  }

  /* link «Повний склад» opens the tab */
  var gc = $('[data-goto]');
  if (gc) gc.addEventListener('click', function (ev) {
    ev.preventDefault();
    var tb = $('#pt-' + gc.getAttribute('data-goto'));
    if (tb) { tb.click(); var sec = $('.tabsec'); if (sec) sec.scrollIntoView({ block: 'start' }); }
  });

  /* візуальний відгук на «У кошик» / «Купити» */
  function bump(btn) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.classList.add('is-added');
    btn.textContent = 'Додано';
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('is-added'); btn.textContent = btn.dataset.label; }, 1500);
    if (badge) { badge.classList.remove('is-bump'); void badge.offsetWidth; badge.classList.add('is-bump'); }
  }

  /* шапка: тінь після початку прокрутки */
  var head = $('.head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
