/* KORSAR concept: каталог (desktop-панель + mobile drill-down), пошук, вкладки добірки, демонстраційний кошик. Без залежностей. */
(function () {
  'use strict';
  var D = window.KORSAR_DATA, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqDesk = window.matchMedia('(min-width:1024px)');
  var CHEV = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var BACK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>';
  var EXT = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  var SEARCH_URL = 'https://korsar.com.ua/ua/site_search?search_term=';
  var ALL_URL = 'https://korsar.com.ua/ua/product_list';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* ---------- рух: пружина (критичне демпфування), проєкція імпульсу ---------- */
  var REDUCE = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function project(v) { return (v / 1000) * 0.998 / (1 - 0.998); }
  // пружина від поточного значення з початковою швидкістю; повертає {cancel, v()} - переривається з будь-якого моменту
  function spring(from, to, v0, onUpdate, onDone, response, damping) {
    if (REDUCE) { onUpdate(to); onDone && onDone(); return { cancel: function () {}, v: function () { return 0; } }; }
    var T = response || 0.4, z = damping == null ? 1 : damping, w = 2 * Math.PI / T, k = w * w, c = 2 * z * w, x = from, v = v0 || 0, last = performance.now(), raf, done = false;
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 1 / 30); last = now;
      v += (-k * (x - to) - c * v) * dt; x += v * dt;
      if (Math.abs(x - to) < 0.4 && Math.abs(v) < 8) { onUpdate(to); done = true; onDone && onDone(); return; }
      onUpdate(x); raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { cancel: function () { if (!done) cancelAnimationFrame(raf); done = true; }, v: function () { return v; } };
  }
  function dept(id) { return D.depts.filter(function (d) { return d.id === id; })[0]; }

  /* ---------- каталог: desktop ---------- */
  var cat = $('#cat'), catBtn = $('#catbtn'), scrim = $('#scrim'), cDepts = $('#cat-depts'), cCats = $('#cat-cats'), cSubs = $('#cat-subs');
  var state = { dept: null, cat: null }, armed = false, openPos = '', lastPos = '';
  document.addEventListener('mousemove', function (e) { lastPos = e.clientX + ',' + e.clientY; }, true);

  function renderDepts() {
    cDepts.innerHTML = D.depts.map(function (d) {
      return '<li><button type="button" class="cat__dept" role="tab" data-d="' + d.id + '" aria-selected="' + (d.id === state.dept) + '"><span class="cat__dn">' + D.icons[d.id] + '<span>' + esc(d.name) + '</span></span>' + CHEV + '</button></li>';
    }).join('');
  }
  function renderCats() {
    var d = dept(state.dept);
    $('#cat-cats-h').textContent = d.name;
    cCats.innerHTML = d.cats.map(function (c) {
      var has = c.subs.length > 0;
      return '<li>' + (has
        ? '<button type="button" data-c="' + c.id + '"' + (c.id === state.cat ? ' aria-current="true"' : '') + '><span>' + esc(c.name) + '</span>' + CHEV + '</button>'
        : '<a href="' + c.url + '" target="_blank" rel="noopener" data-c="' + c.id + '"><span>' + esc(c.name) + '</span>' + EXT + '</a>') + '</li>';
    }).join('');
    renderSubs();
  }
  function renderSubs() {
    var d = dept(state.dept), c = d.cats.filter(function (x) { return x.id === state.cat; })[0];
    if (!c) {
      cSubs.innerHTML = '<p class="cat__empty">Оберіть розділ, щоб побачити підрозділи. Розділи без підрозділів відкриваються одразу.</p>';
      $('#cat-subs-h').textContent = 'Підрозділи';
      return;
    }
    $('#cat-subs-h').textContent = c.name;
    function li(s) { return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.name) + '</a></li>'; }
    var main = c.subs.filter(function (s) { return !s.brand; }), brands = c.subs.filter(function (s) { return s.brand; });
    cSubs.innerHTML = '<div class="cat__list"><a class="cat__all" href="' + c.url + '" target="_blank" rel="noopener"><span>Усі товари розділу</span>' + EXT + '</a></div><ul class="cat__subs">' + main.map(li).join('') + '</ul>' +
      (brands.length ? '<p class="cat__grp">За маркою авто</p><ul class="cat__subs">' + brands.map(li).join('') + '</ul>' : '');
  }
  function selectDept(id, keepCat) {
    state.dept = id; if (!keepCat) state.cat = null;
    var d = dept(id); if (!state.cat) { var first = d.cats.filter(function (c) { return c.subs.length; })[0]; state.cat = first ? first.id : null; }
    renderDepts(); renderCats(); animCol(cCats); animCol(cSubs);
  }
  function animCol(el) { el.classList.remove('anim'); void el.offsetWidth; el.classList.add('anim'); }
  function openCat(id) {
    if (!mqDesk.matches) { openSheet(id); return; }
    closeSugg();
    selectDept(id || state.dept || D.depts[0].id);
    armed = false; openPos = lastPos; cat.hidden = false; scrim.classList.add('on'); catBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.setProperty('--hdr-h', $('.hdr').offsetHeight + 'px');
    scrim.style.top = '0';
  }
  function closeCat(restore) {
    if (cat.hidden) return;
    cat.hidden = true; scrim.classList.remove('on'); catBtn.setAttribute('aria-expanded', 'false');
    if (restore) { catBtn.focus(); if (document.activeElement !== catBtn) setTimeout(function () { catBtn.focus(); }, 0); }
  }
  catBtn.addEventListener('click', function () {
    if (!mqDesk.matches) { openSheet(); return; }
    cat.hidden ? openCat() : closeCat();
  });
  cDepts.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (b) selectDept(b.dataset.d); });
  var hoverT;
  cDepts.addEventListener('mouseover', function (e) { var b = e.target.closest('[data-d]'); if (!(armed || (e.clientX + ',' + e.clientY !== openPos)) || !b || b.dataset.d === state.dept) return; clearTimeout(hoverT); hoverT = setTimeout(function () { selectDept(b.dataset.d); }, 90); });
  cDepts.addEventListener('mouseleave', function () { clearTimeout(hoverT); });
  cCats.addEventListener('click', function (e) { var b = e.target.closest('button[data-c]'); if (b) { state.cat = b.dataset.c; renderCats(); animCol(cSubs); } });
  cCats.addEventListener('mouseover', function (e) { var b = e.target.closest('[data-c]'); if (!(armed || (e.clientX + ',' + e.clientY !== openPos)) || !b || b.dataset.c === state.cat) return; var d = dept(state.dept), c = d.cats.filter(function (x) { return x.id === b.dataset.c; })[0]; if (c && c.subs.length) { clearTimeout(hoverT); hoverT = setTimeout(function () { state.cat = c.id; renderCats(); animCol(cSubs); }, 90); } });
  cat.addEventListener('mousemove', function (e) { if (e.clientX + ',' + e.clientY !== openPos) armed = true; });
  scrim.addEventListener('click', function () { closeCat(true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!cat.hidden) closeCat(true); else if (sheet.classList.contains('on')) closeSheet(); else if (!sugg.hidden) { closeSugg(); input.focus(); } else if (!cartPop.hidden) { cartPop.hidden = true; cartBtn.setAttribute('aria-expanded', 'false'); cartBtn.focus(); } }
  });
  // стрілки у списку відділів
  cDepts.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var bs = $$('button', cDepts), i = bs.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); var n = bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length]; n.focus(); selectDept(n.dataset.d);
  });
  document.addEventListener('click', function (e) {
    if (!cat.hidden && e.target.isConnected && !e.target.closest('#cat') && !e.target.closest('#catbtn') && !e.target.closest('[data-open-dept]')) closeCat();
    if (!e.target.closest('.search')) closeSugg();
    if (!cartPop.hidden && !e.target.closest('#cartpop') && !e.target.closest('#cartbtn')) { cartPop.hidden = true; cartBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- каталог: mobile drill-down ---------- */
  var sheet = $('#ms'), msTitle = $('#ms-title'), msBody = $('#ms-body'), msBack = $('#ms-back'), msClose = $('#ms-close');
  var stack = []; // [{lv:'root'|'dept'|'cat', id}]
  var lastFocus = null;
  function renderLevel(back) {
    var top = stack[stack.length - 1], html = '', title = 'Каталог';
    if (top.lv === 'root') {
      html = '<ul class="ms__lv' + (back ? ' back' : '') + '">' +
        '<li class="lead"><a href="' + ALL_URL + '" target="_blank" rel="noopener"><span>Усі товари магазину</span>' + EXT + '</a></li>' +
        D.depts.map(function (d) { return '<li><button type="button" data-d="' + d.id + '"><span class="msn">' + D.icons[d.id] + '<span>' + esc(d.name) + '<small>' + d.cats.length + ' ' + plural(d.cats.length) + '</small></span></span>' + CHEV + '</button></li>'; }).join('') + '</ul>';
    } else if (top.lv === 'dept') {
      var d = dept(top.id); title = d.name;
      html = '<ul class="ms__lv' + (back ? ' back' : '') + '">' + d.cats.map(function (c) {
        return '<li>' + (c.subs.length
          ? '<button type="button" data-c="' + c.id + '"><span>' + esc(c.name) + '<small>' + c.subs.length + ' ' + plural2(c.subs.length) + '</small></span>' + CHEV + '</button>'
          : '<a href="' + c.url + '" target="_blank" rel="noopener"><span>' + esc(c.name) + '</span>' + EXT + '</a>') + '</li>';
      }).join('') + '</ul>';
    } else {
      var dd = dept(top.dept), c = dd.cats.filter(function (x) { return x.id === top.id; })[0]; title = c.name;
      html = '<ul class="ms__lv' + (back ? ' back' : '') + '"><li class="lead"><a href="' + c.url + '" target="_blank" rel="noopener"><span>Усі товари розділу</span>' + EXT + '</a></li>' +
        c.subs.map(function (s) { return '<li><a href="' + s.url + '" target="_blank" rel="noopener"><span>' + esc(s.name) + '</span>' + EXT + '</a></li>'; }).join('') + '</ul>';
    }
    msTitle.textContent = title; msBody.innerHTML = html; msBody.scrollTop = 0;
    msBack.hidden = stack.length < 2;
    msBack.setAttribute('aria-label', stack.length > 1 ? 'Назад: ' + (stack.length === 2 ? 'Каталог' : dept(stack[1].id).name) : '');
    msTitle.setAttribute('tabindex', '-1'); msTitle.focus({ preventScroll: true });
  }
  function plural(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'розділ' : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? 'розділи' : 'розділів'; }
  function plural2(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'підрозділ' : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? 'підрозділи' : 'підрозділів'; }
  function openSheet(deptId) {
    closeSugg(); lastFocus = document.activeElement;
    stack = [{ lv: 'root' }]; if (deptId) stack.push({ lv: 'dept', id: deptId });
    sheet.classList.add('on'); sheet.removeAttribute('aria-hidden'); sheet.inert = false;
    document.body.style.overflow = 'hidden'; catBtn.setAttribute('aria-expanded', 'true');
    renderLevel(false);
  }
  function closeSheet() {
    sheet.classList.remove('on'); sheet.setAttribute('aria-hidden', 'true'); sheet.inert = true;
    document.body.style.overflow = ''; catBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  msClose.addEventListener('click', closeSheet);
  msBack.addEventListener('click', function () { stack.pop(); renderLevel(true); });
  msBody.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) stack.push({ lv: 'dept', id: b.dataset.d });
    else if (b.dataset.c) stack.push({ lv: 'cat', id: b.dataset.c, dept: stack[stack.length - 1].id });
    renderLevel(false);
  });
  sheet.inert = true;
  var drag = null;
  sheet.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' || e.button) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, active: false, pts: [{ x: e.clientX, t: performance.now() }], anim: null };
  });
  sheet.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (dx > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        drag.active = true; drag.el = stack.length > 1 ? msBody : sheet; drag.w = sheet.offsetWidth;
        drag.el.style.transition = 'none'; drag.el.style.animation = 'none'; try { sheet.setPointerCapture(e.pointerId); } catch (x) {}
      } else { if (Math.abs(dy) > 10) drag = null; return; }
    }
    var x = Math.max(0, dx); drag.el.style.transform = 'translateX(' + x + 'px)'; drag.dx = x;
    drag.pts.push({ x: e.clientX, t: performance.now() }); if (drag.pts.length > 5) drag.pts.shift();
  });
  function dragEnd(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null; if (!d.active) return;
    var a = d.pts[0], b = d.pts[d.pts.length - 1], v = b.t > a.t ? (b.x - a.x) / ((b.t - a.t) / 1000) : 0;
    var commit = (e.type !== 'pointercancel') && (d.dx + project(v) > d.w * 0.5);
    var to = commit ? d.w : 0;
    spring(d.dx, to, v, function (x) { d.el.style.transform = 'translateX(' + x + 'px)'; }, function () {
      d.el.style.transition = ''; d.el.style.animation = ''; d.el.style.transform = '';
      if (commit) { if (stack.length > 1) { stack.pop(); renderLevel(true); } else closeSheet(); }
    }, 0.38, commit ? 1 : 0.8);
  }
  sheet.addEventListener('pointerup', dragEnd); sheet.addEventListener('pointercancel', dragEnd);
  mqDesk.addEventListener('change', function () { closeCat(); if (sheet.classList.contains('on')) closeSheet(); });

  // плитки відділів на головній
  $$('[data-open-dept]').forEach(function (b) { b.addEventListener('click', function () { var id = b.dataset.openDept; if (mqDesk.matches) { openCat(id); window.scrollTo({ top: 0, behavior: 'smooth' }); } else openSheet(id); }); });
  $$('[data-open-cat]').forEach(function (b) { b.addEventListener('click', function () { openCat(); }); });

  /* ---------- пошук ---------- */
  var input = $('#q'), sugg = $('#sugg'), form = $('#sform');
  var CATS = []; D.depts.forEach(function (d) { d.cats.forEach(function (c) { CATS.push({ n: c.name, u: c.url, hay: (c.name + ' ' + c.orig).toLowerCase() }); c.subs.forEach(function (s) { CATS.push({ n: s.name, u: s.url, hay: (s.name + ' ' + s.orig).toLowerCase(), parent: c.name }); }); }); });
  var PRODS = D.products.map(function (p) { return { n: p.n, c: p.c, p: p.p, s: p.s, u: p.u, hay: (p.n + ' ' + p.c).toLowerCase() }; });
  var active = -1;
  function hl(text, toks) {
    var out = esc(text);
    toks.forEach(function (t) { if (t.length < 2) return; var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); out = out.replace(re, '<mark>$1</mark>'); });
    return out;
  }
  function closeSugg() { sugg.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; input.removeAttribute('aria-activedescendant'); }
  function place() { if (!mqDesk.matches) { var r = $('.search').getBoundingClientRect(); sugg.style.setProperty('--sugg-top', (r.bottom + 8) + 'px'); } }
  function renderSugg() {
    var q = input.value.trim().toLowerCase();
    place();
    if (!q) {
      sugg.innerHTML = '<p class="sugg__hint">Введіть назву, модель або код товару. Наприклад: <b>реле</b>, <b>лампа</b>, <b>6892</b>.</p>';
    } else {
      var toks = q.split(/\s+/).filter(Boolean);
      var cm = CATS.filter(function (c) { return toks.every(function (t) { return c.hay.indexOf(t) > -1; }); }).slice(0, 5);
      var pm = PRODS.filter(function (p) { return toks.every(function (t) { return p.hay.indexOf(t) > -1; }); });
      pm.sort(function (a, b) { return (b.c.toLowerCase() === q) - (a.c.toLowerCase() === q) || (a.n.toLowerCase().indexOf(toks[0]) === 0 ? 0 : 1) - (b.n.toLowerCase().indexOf(toks[0]) === 0 ? 0 : 1); });
      pm = pm.slice(0, 6);
      var h = '', i = 0;
      if (cm.length) h += '<div class="sugg__h" role="presentation">Розділи</div>' + cm.map(function (c) { return '<a role="option" id="o' + (i++) + '" href="' + c.u + '" target="_blank" rel="noopener"><span class="t">' + hl(c.n, toks) + '</span><span class="m">' + (c.parent ? esc(c.parent) : 'розділ') + '</span></a>'; }).join('');
      if (pm.length) h += '<div class="sugg__h" role="presentation">Товари</div>' + pm.map(function (p) { return '<a role="option" id="o' + (i++) + '" href="' + p.u + '" target="_blank" rel="noopener"><span class="t">' + hl(p.n, toks) + '</span><span class="m">код ' + esc(p.c) + ' · <b>' + esc(p.p) + '</b></span></a>'; }).join('');
      if (!cm.length && !pm.length) h += '<p class="sugg__hint">У швидкому пошуку збігів немає. Повний пошук по магазину покаже всі товари.</p>';
      h += '<a class="all" role="option" id="o' + (i++) + '" href="' + SEARCH_URL + encodeURIComponent(input.value.trim()) + '" target="_blank" rel="noopener">Усі результати для «' + esc(input.value.trim()) + '» →</a>';
      sugg.innerHTML = h;
    }
    sugg.hidden = false; input.setAttribute('aria-expanded', 'true'); active = -1;
  }
  input.addEventListener('input', renderSugg);
  input.addEventListener('focus', function () { if (!cat.hidden) closeCat(); renderSugg(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeSugg(); return; }
    var opts = $$('[role=option]', sugg);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!opts.length) return; e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === active); });
      input.setAttribute('aria-activedescendant', opts[active].id); opts[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active > -1) { e.preventDefault(); opts[active].click(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var q = input.value.trim(); if (!q) { input.focus(); return; }
    window.open(SEARCH_URL + encodeURIComponent(q), '_blank', 'noopener');
  });

  /* ---------- вкладки добірки ---------- */
  var tabs = $$('[role=tab].tab'), panels = $$('[role=tabpanel]');
  var ind = document.createElement('span'); ind.className = 'tab-ind'; ind.setAttribute('aria-hidden', 'true');
  var tabsWrap = $('.tabs'); tabsWrap.insertBefore(ind, tabsWrap.firstChild);
  function placeInd(instant) {
    var t = tabs.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0]; if (!t) return;
    ind.style.transition = instant || REDUCE ? 'none' : '';
    ind.style.width = t.offsetWidth + 'px'; ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    if (instant) void ind.offsetWidth;
  }
  window.addEventListener('resize', function () { placeInd(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeInd(true); });
  function selTab(t, focus) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
    panels.forEach(function (p) { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    placeInd(false);
    if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = k === 'ArrowRight' ? (i + 1) % tabs.length : k === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : -1;
      if (n > -1) { e.preventDefault(); selTab(tabs[n], true); }
    });
  });

  /* ---------- шапка: матеріал при прокрутці (без жорсткої лінії) ---------- */
  var hdr = $('.hdr'), ticking = false;
  function onScroll() { ticking = false; hdr.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- hero-карусель розділів ---------- */
  var trk = $('#htrk'), slides = $$('.slide', trk), dots = $$('.hero__dot'), pauseBtn = $('#hpause'), cur = 0, userPaused = false, hovering = false, timer = null;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function setCur(i) {
    cur = i;
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i); });
    slides.forEach(function (s, k) { s.inert = k !== i; s.setAttribute('aria-hidden', k !== i); });
  }
  function go(i, smooth) {
    i = (i + slides.length) % slides.length;
    var target = slides[i].offsetLeft - trk.offsetLeft;
    if (heroAnim) { heroV = heroAnim.v(); heroAnim.cancel(); }
    if (!smooth || REDUCE) { trk.scrollLeft = target; setCur(i); return; }
    trk.style.scrollSnapType = 'none';
    heroAnim = spring(trk.scrollLeft, target, heroV, function (x) { trk.scrollLeft = x; }, function () { heroAnim = null; heroV = 0; trk.style.scrollSnapType = ''; trk.scrollLeft = target; }, 0.5, 1);
    setCur(i);
  }
  var heroAnim = null, heroV = 0, st;
  function heroGrab() { if (heroAnim) { heroAnim.cancel(); heroAnim = null; heroV = 0; trk.style.scrollSnapType = ''; } }
  ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { trk.addEventListener(ev, heroGrab, { passive: true }); });
  trk.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(function () { var i = Math.round(trk.scrollLeft / trk.clientWidth); if (i !== cur && i >= 0 && i < slides.length) setCur(i); }, 80); }, { passive: true });
  $('#hprev').addEventListener('click', function () { stopAuto(true); go(cur - 1, true); });
  $('#hnext').addEventListener('click', function () { stopAuto(true); go(cur + 1, true); });
  dots.forEach(function (d) { d.addEventListener('click', function () { stopAuto(true); go(+d.dataset.i, true); }); });
  function tick() { if (!userPaused && !hovering && !document.hidden) go(cur + 1, true); }
  function startAuto() { if (reduce || timer) return; timer = setInterval(tick, 7000); }
  function stopAuto(byUser) { if (byUser) { userPaused = true; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Увімкнути автопрокрутку'); } }
  pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused; pauseBtn.setAttribute('aria-pressed', userPaused);
    pauseBtn.setAttribute('aria-label', userPaused ? 'Увімкнути автопрокрутку' : 'Зупинити автопрокрутку');
    if (!userPaused) startAuto();
  });
  var hero = $('#hero');
  hero.addEventListener('mouseenter', function () { hovering = true; }); hero.addEventListener('mouseleave', function () { hovering = false; });
  hero.addEventListener('focusin', function () { hovering = true; }); hero.addEventListener('focusout', function () { hovering = false; });
  trk.addEventListener('touchstart', function () { stopAuto(true); }, { passive: true });
  hero.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { stopAuto(true); go(cur + 1, true); } else if (e.key === 'ArrowLeft') { stopAuto(true); go(cur - 1, true); } });
  if (reduce) { userPaused = true; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Увімкнути автопрокрутку'); pauseBtn.hidden = true; }
  setCur(0); startAuto();

  /* ---------- демонстраційний кошик ---------- */
  var cartBtn = $('#cartbtn'), cartPop = $('#cartpop');
  cartBtn.addEventListener('click', function () { var o = cartPop.hidden; cartPop.hidden = !o; cartBtn.setAttribute('aria-expanded', o); });
})();
