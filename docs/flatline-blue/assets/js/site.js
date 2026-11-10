/* Flatline concept: local prototype behaviour. Everything works without JS except filtering and the cart. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var FL = window.FL || {};
  var root = (function () { var s = document.currentScript || $('script[src*="site.js"]'); return s.getAttribute("src").replace(/assets\/js\/site\.js.*$/, ""); })();
  var KEY = "flatline-concept-cart";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cart (browser-local, no orders) ---------- */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* storage may be blocked */ } }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " грн"; }
  function count() { return Object.keys(cart).reduce(function (a, k) { return a + cart[k]; }, 0); }
  function sum() { return Object.keys(cart).reduce(function (a, k) { return a + (FL[k] && FL[k].p ? FL[k].p * cart[k] : 0); }, 0); }
  var drawer = $("#cart"), lastFocus = null;

  function render() {
    var n = count(), badge = $("[data-cart-count]");
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    var body = $("[data-cart-body]");
    if (!body) return;
    var keys = Object.keys(cart).filter(function (k) { return FL[k]; });
    if (!keys.length) { body.innerHTML = '<p class="cart__empty">У кошику поки порожньо.<br>Додайте деталь з каталогу.</p>'; }
    else {
      body.innerHTML = keys.map(function (k) {
        var p = FL[k];
        return '<div class="cart__row"><span class="plate" aria-hidden="true"><img src="' + root + 'assets/img/p/' + k + '-1.webp" alt="" width="800" height="800"></span>' +
          '<div><a href="' + root + p.u + '">' + p.t + '</a><small>' + cart[k] + " × " + money(p.p) + '</small></div>' +
          '<button class="cart__rm" type="button" data-rm="' + k + '" aria-label="Прибрати з кошика"><svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 3.5l11 11M14.5 3.5l-11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>';
      }).join("");
    }
    var s = $("[data-cart-sum]"); if (s) s.textContent = money(sum());
  }
  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $$(".head,main,.foot,.demo,.sticky").forEach(function (el) { el.inert = true; });
    var c = $(".cart__head .iconbtn", drawer); if (c) c.focus();
  }
  function closeCart() {
    if (!drawer || drawer.getAttribute("aria-hidden") === "true") return;
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    $$(".head,main,.foot,.demo,.sticky").forEach(function (el) { el.inert = false; });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function add(id, qty, btn) {
    if (!FL[id] || !FL[id].p) return;
    cart[id] = (cart[id] || 0) + (qty || 1);
    save(); render();
    if (btn) {
      var t = btn.textContent;
      btn.classList.add("is-done"); btn.textContent = "Додано";
      setTimeout(function () { btn.classList.remove("is-done"); btn.textContent = t; }, 1300);
    }
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a"); if (!t) return;
    if (t.hasAttribute("data-add")) {
      var q = 1, box = t.closest("[data-pdp-buy]");
      if (box) { var o = $("[data-qty] output", box); q = o ? parseInt(o.textContent, 10) || 1 : 1; }
      add(t.getAttribute("data-add"), q, t);
    } else if (t.hasAttribute("data-cart-open")) { if (t.tagName === "A") e.preventDefault(); openCart(); }
    else if (t.hasAttribute("data-cart-close")) { closeCart(); }
    else if (t.hasAttribute("data-rm")) { delete cart[t.getAttribute("data-rm")]; save(); render(); }
    else if (t.hasAttribute("data-q")) {
      var out = $("output", t.parentNode), v = Math.max(1, Math.min(99, (parseInt(out.textContent, 10) || 1) + parseInt(t.getAttribute("data-q"), 10)));
      out.textContent = v;
    }
  });
  var scrim = $(".cart__scrim", drawer || document); if (scrim) scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
      var m = $(".mega[open]"); if (m) { m.removeAttribute("open"); $("summary", m).focus(); }
    }
    if (e.key === "Tab" && drawer && drawer.getAttribute("aria-hidden") === "false") {
      var f = $$("button:not([disabled]), a[href]", $(".cart__panel", drawer)); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("click", function (e) { var m = $(".mega[open]"); if (m && !m.contains(e.target)) m.removeAttribute("open"); });
  render();

  /* ---------- photo galleries: scroll-snap + dots/thumbs, accent dot = photo shown ---------- */
  $$("[data-gal]").forEach(function (g) {
    var track = $(".gal__track", g), root = g.closest("[data-gal-root]") || g;
    var ctrls = $$(".gal__dot, .thumb", root), n = $$(".gal__slide", g).length, cur = 0, raf = 0;
    function mark(i) { cur = i; ctrls.forEach(function (c) { if (+c.getAttribute("data-i") === i) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current"); }); }
    function go(i) { track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? "auto" : "smooth" }); }
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var i = Math.round(track.scrollLeft / (track.clientWidth || 1)); if (i !== cur) mark(Math.max(0, Math.min(n - 1, i))); }); }, { passive: true });
    ctrls.forEach(function (c) { c.addEventListener("click", function () { var i = +c.getAttribute("data-i"); mark(i); go(i); }); });
    /* mini card, mouse only: hovering the tile shows the next photo, a dot previews its own photo, leaving returns to the first */
    if (g.closest(".pcard") && n > 1 && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      g.addEventListener("mouseenter", function () { if (cur === 0) go(1); });
      g.addEventListener("mouseleave", function () { go(0); });
      ctrls.forEach(function (c) { c.addEventListener("mouseenter", function () { go(+c.getAttribute("data-i")); }); });
    }
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" && cur < n - 1) { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft" && cur > 0) { e.preventDefault(); go(cur - 1); }
    });
  });

  /* ---------- mobile buy bar: only while the buy box is out of view ---------- */
  var bar = $(".sticky"), box = $("[data-pdp-buy]");
  if (bar && box && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { bar.classList.toggle("is-on", !es[0].isIntersecting); }, { threshold: 0.1 }).observe(box);
  } else if (bar) { bar.classList.add("is-on"); }

  /* ---------- rails ---------- */
  $$("[data-rail]").forEach(function (rail) {
    var btns = $$("[data-scroll]", rail.closest(".block"));
    function edge() { var max = rail.scrollWidth - rail.clientWidth - 2; btns.forEach(function (b) { b.disabled = +b.getAttribute("data-scroll") < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max; }); }
    rail.addEventListener("scroll", edge, { passive: true }); window.addEventListener("resize", edge); edge();
  });
  $$("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var rail = $("[data-rail]", b.closest(".block")); if (!rail) return;
      rail.scrollBy({ left: parseInt(b.getAttribute("data-scroll"), 10) * (rail.clientWidth + 12), behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- hero: native scroll-snap + dots ---------- */
  var track = $("[data-hero]");
  if (track) {
    var dots = $$(".hero__dot");
    var sync = function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, k) { if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    };
    var slidesEl = $$(".slide", track);
    var sync2 = function () { var i = Math.round(track.scrollLeft / (track.clientWidth || 1)); slidesEl.forEach(function (s, k) { s.inert = k !== i; }); };
    sync2();
    track.addEventListener("scroll", function () { window.requestAnimationFrame(function () { sync(); sync2(); }); }, { passive: true });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { track.scrollTo({ left: k * track.clientWidth, behavior: reduce ? "auto" : "smooth" }); }); });
    track.addEventListener("keydown", function (e) {
      if (e.target !== track) return;
      if (e.key === "ArrowRight") { track.scrollBy({ left: track.clientWidth, behavior: "smooth" }); }
      if (e.key === "ArrowLeft") { track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }); }
    });
    /* arrows, pause and 7 s autoplay: the accent bar of the current slide fills in 7 s (CSS animation); its end moves to the next slide */
    var hero = track.closest(".hero"), n = slidesEl.length;
    var at = function () { return Math.round(track.scrollLeft / (track.clientWidth || 1)); };
    var to = function (i) { track.scrollTo({ left: ((i + n) % n) * track.clientWidth, behavior: reduce ? "auto" : "smooth" }); };
    var prev = $("[data-hero-prev]"), next = $("[data-hero-next]"), pause = $("[data-hero-pause]");
    if (prev) prev.addEventListener("click", function () { to(at() - 1); });
    if (next) next.addEventListener("click", function () { to(at() + 1); });
    if (pause) pause.addEventListener("click", function () {
      var on = hero.classList.toggle("is-paused");
      pause.setAttribute("aria-pressed", on ? "true" : "false");
      pause.setAttribute("aria-label", on ? "Увімкнути автоперемикання" : "Зупинити автоперемикання");
    });
    if (!reduce) {
      hero.classList.add("is-auto");
      $(".hero__dots", hero).addEventListener("animationend", function (e) { if (e.animationName === "heroFill") to(at() + 1); });
    } else if (pause) { pause.hidden = true; }
  }

  /* ---------- hero devices: on a mouse, each one tilts towards the pointer like an object held in the hand ---------- */
  if (!reduce && window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".slide__devices .dev").forEach(function (d) {
      d.addEventListener("pointermove", function (e) {
        var r = d.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        d.style.setProperty("--ry", (x * 22).toFixed(1) + "deg"); d.style.setProperty("--rx", (-y * 16).toFixed(1) + "deg");
      });
      d.addEventListener("pointerleave", function () { d.style.removeProperty("--ry"); d.style.removeProperty("--rx"); });
    });
  }

  /* ---------- finder: brand narrows the model list, dial follows ---------- */
  function wireFinder(brandSel, modelSel, onChange) {
    if (!brandSel || !modelSel) return;
    var groups = $$("optgroup", modelSel);
    function narrow() {
      var b = brandSel.value;
      groups.forEach(function (g) {
        var show = !b || g.getAttribute("data-brand") === b || g.label === b;
        g.hidden = !show; g.disabled = !show;
      });
      if (modelSel.selectedOptions[0] && modelSel.selectedOptions[0].parentNode.tagName === "OPTGROUP" && modelSel.selectedOptions[0].parentNode.disabled) modelSel.value = "";
    }
    brandSel.addEventListener("change", function () { narrow(); onChange && onChange(); });
    modelSel.addEventListener("change", function () {
      var o = modelSel.selectedOptions[0];
      if (o && o.getAttribute("data-brand") && brandSel.value !== o.getAttribute("data-brand")) { brandSel.value = o.getAttribute("data-brand"); narrow(); }
      onChange && onChange();
    });
    narrow();
  }
  var fb = $("#f-brand"), fm = $("#f-model"), hand = $(".dial__hand");
  wireFinder(fb, fm, function () {
    if (!hand) return;
    var steps = (fb.selectedIndex ? 1 : 0) + (fm.selectedIndex ? 1 : 0);
    hand.style.setProperty("--turn", (-90 + steps * 90 + (fb.selectedIndex % 5) * 9) + "deg");
  });

  /* ---------- listing filter (brand / model / q / sort) ---------- */
  var grid = $("[data-grid]");
  if (grid) {
    var lb = $("#l-brand"), lm = $("#l-model"), ls = $("#l-sort"), reset = $("#l-reset"), status = $("[data-status]"), cnt = $("[data-count]"), empty = $("[data-empty]");
    function plural(n) { return n + "\u00a0" + (n === 1 ? "позиція" : n >= 2 && n <= 4 ? "позиції" : "позицій"); }
    var items = $$("li", grid), q = "";
    var params = new URLSearchParams(location.search);
    q = (params.get("q") || "").trim().toLowerCase();
    wireFinder(lb, lm, apply);
    if (params.get("brand") && lb) { lb.value = params.get("brand"); lm.dispatchEvent(new Event("change")); lb.dispatchEvent(new Event("change")); }
    if (params.get("model") && lm) { lm.value = params.get("model"); lm.dispatchEvent(new Event("change")); }
    if (ls) ls.addEventListener("change", apply);
    if (reset) reset.addEventListener("click", function () { lb.value = ""; lm.value = ""; ls.value = ""; q = ""; lb.dispatchEvent(new Event("change")); history.replaceState(null, "", location.pathname); apply(); });
    function apply() {
      var b = lb ? lb.value : "", m = lm ? lm.value : "", shown = 0;
      items.forEach(function (li) {
        var c = $(".card", li), brands = c.getAttribute("data-brands").split("|"), models = c.getAttribute("data-models").split("|");
        var hay = (c.textContent + " " + c.getAttribute("data-sid")).toLowerCase();
        var ok = (!b || brands.indexOf(b) > -1) && (!m || models.indexOf(m) > -1) && (!q || hay.indexOf(q) > -1);
        li.hidden = !ok; if (ok) shown++;
      });
      var dir = ls ? ls.value : "";
      if (dir) {
        var price = function (li) { var v = parseInt($(".card", li).getAttribute("data-price"), 10); return isNaN(v) ? null : v; };
        var sorted = items.slice().sort(function (a, c2) {
          var pa = price(a), pc = price(c2);
          if (pa === null && pc === null) return 0; if (pa === null) return 1; if (pc === null) return -1;
          return dir === "asc" ? pa - pc : pc - pa;
        });
        sorted.forEach(function (li) { grid.appendChild(li); });
      }
      if (cnt) cnt.textContent = plural(shown);
      if (empty) empty.hidden = shown !== 0;
      var active = b || m || q;
      if (reset) reset.hidden = !active;
      if (status) status.textContent = m ? "Підібрано для: " + (b ? b + " " : "") + m : b ? "Підібрано для бренду: " + b : q ? "За запитом «" + q + "»" : "";
    }
    apply();
  }
})();
