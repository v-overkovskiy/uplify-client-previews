/* FreeBuy · Datasheet concept — progressive enhancement. Page stays complete without this file. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.className = root.className.replace("no-js", "js");
  var FB = window.FB || { products: [] };
  var base = doc.body.getAttribute("data-base") || "./";
  var byId = {};
  FB.products.forEach(function (p) { byId[p.id] = p; });
  var AVAIL = { "in": "Готово до відправки", low: "Менше 5 од.", out: "Немає в наявності" };

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function store(get, val) {
    try { if (val === undefined) return JSON.parse(sessionStorage.getItem("fb-cart") || "[]"); sessionStorage.setItem("fb-cart", JSON.stringify(val)); } catch (e) { return get === "r" ? [] : undefined; }
  }
  var cartMem = null;
  function readCart() { var c = store("r"); if (!Array.isArray(c)) c = []; if (cartMem && !c.length) return cartMem; return c; }
  function writeCart(c) { cartMem = c; store("w", c); }

  /* ---- Cart (local prototype state) ---- */
  var panel = $("#cart-panel"), cartBtns = $$("[data-cart-toggle]"), lastFocus = null;
  function cartCount() { return readCart().reduce(function (s, l) { return s + l.qty; }, 0); }
  function renderCount() { $$("[data-cart-count]").forEach(function (n) { n.textContent = cartCount(); }); }
  function renderCart() {
    if (!panel) return;
    var body = $(".cart-body", panel), sum = $("[data-cart-sum]", panel), cart = readCart();
    body.textContent = "";
    var total = 0;
    if (!cart.length) { body.appendChild(el("p", "cart-empty", "Кошик порожній. Додайте позицію з каталогу.")); }
    cart.forEach(function (l) {
      var p = byId[l.id]; if (!p) return;
      total += p.price * l.qty;
      var li = el("div", "cart-line");
      var img = el("img"); img.src = base + "assets/img/products/" + p.img + ".webp"; img.alt = ""; img.width = 56; img.height = 56;
      var t = el("div"); var a = el("a", "t", p.name); a.href = base + "product/" + p.id + "/";
      t.appendChild(a); t.appendChild(el("div", "m", (p.art ? "№ " + p.art + " · " : "") + l.qty + " × " + money(p.price)));
      var r = el("div", "readout"); r.appendChild(doc.createTextNode(money(p.price * l.qty))); var cur = el("small", "cur", "₴"); r.appendChild(cur);
      li.appendChild(img); li.appendChild(t); li.appendChild(r); body.appendChild(li);
    });
    if (sum) { sum.textContent = ""; sum.appendChild(doc.createTextNode(money(total))); sum.appendChild(el("small", "cur", " ₴")); }
  }
  function addToCart(id, qty) {
    var p = byId[id]; if (!p || p.avail === "out") return;
    var cart = readCart().slice(), f = cart.filter(function (l) { return l.id === id; })[0];
    if (f) f.qty += qty; else cart.push({ id: id, qty: qty });
    writeCart(cart); renderCount(); renderCart(); openCart();
  }
  function openCart() {
    if (!panel) return;
    lastFocus = doc.activeElement; panel.classList.add("open"); panel.removeAttribute("aria-hidden");
    cartBtns.forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var c = $("[data-cart-close]", panel); if (c) c.focus();
  }
  function closeCart() {
    if (!panel || !panel.classList.contains("open")) return;
    panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true");
    cartBtns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (location.hash === "#cart-panel") history.replaceState(null, "", location.pathname + location.search);
  }
  if (panel) {
    panel.setAttribute("aria-hidden", "true");
    cartBtns.forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
      b.addEventListener("click", function (e) { e.preventDefault(); if (panel.classList.contains("open")) closeCart(); else openCart(); });
    });
    var cc = $("[data-cart-close]", panel); if (cc) cc.addEventListener("click", closeCart);
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCart(); closeSuggest(); var d = $(".catalog-menu[open]"); if (d) { d.removeAttribute("open"); var s = $("summary", d); if (s) s.focus(); } } });
    doc.addEventListener("click", function (e) { if (panel.classList.contains("open") && !panel.contains(e.target) && !e.target.closest("[data-cart-toggle]") && !e.target.closest("[data-add]")) closeCart(); });
    renderCart();
  }
  renderCount();
  doc.addEventListener("click", function (e) {
    var a = e.target.closest("[data-add]"); if (!a) return;
    e.preventDefault();
    var qtyInput = $("[data-qty-input]"), q = a.hasAttribute("data-use-qty") && qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
    addToCart(a.getAttribute("data-add"), q);
  });

  /* ---- Search suggestions on the fixture ---- */
  var activeSearch = null;
  function closeSuggest() { $$(".suggest").forEach(function (s) { s.hidden = true; s.textContent = ""; }); }
  $$("form.search").forEach(function (f) {
    var input = $("input[type=search]", f), box = $(".suggest", f);
    if (!input || !box) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase(); box.textContent = "";
      if (q.length < 2) { box.hidden = true; return; }
      var tokens = q.split(/\s+/);
      var hits = FB.products.filter(function (p) {
        var hay = (p.name + " " + p.art + " " + p.params.map(function (x) { return x[1]; }).join(" ")).toLowerCase();
        return tokens.every(function (t) { return hay.indexOf(t) !== -1; });
      }).slice(0, 6);
      box.hidden = false;
      if (!hits.length) { box.appendChild(el("p", "", "У демонстраційному наборі нічого не знайдено. Спробуйте «18650» або «CAT III».")); return; }
      hits.forEach(function (p) {
        var a = el("a"); a.href = base + "product/" + p.id + "/";
        var img = el("img"); img.src = base + "assets/img/products/" + p.img + ".webp"; img.alt = ""; img.width = 44; img.height = 44;
        a.appendChild(img); a.appendChild(el("span", "s-name", p.name)); a.appendChild(el("span", "s-price", money(p.price) + " ₴"));
        box.appendChild(a);
      });
    });
    doc.addEventListener("click", function (e) { if (!f.contains(e.target)) { box.hidden = true; } });
  });

  /* ---- Catalog mega menu: panel follows hover or focus ---- */
  var mega = $(".mega");
  if (mega) {
    var items = $$(".mm-item", mega), panelsM = $$(".mm-panel", mega);
    var showMega = function (slug) {
      items.forEach(function (i) { i.classList.toggle("on", i.getAttribute("data-mm") === slug); });
      panelsM.forEach(function (p) { p.hidden = p.getAttribute("data-mm-panel") !== slug; });
    };
    items.forEach(function (i) {
      i.addEventListener("mouseenter", function () { showMega(i.getAttribute("data-mm")); });
      i.addEventListener("focus", function () { showMega(i.getAttribute("data-mm")); });
    });
    doc.addEventListener("click", function (e) { var d = $(".catalog-menu[open]"); if (d && !d.contains(e.target)) d.removeAttribute("open"); });
  }

  /* ---- Hero finder ---- */
  var finder = $("#finder");
  if (finder) finder.addEventListener("submit", function (e) {
    var g = finder.elements.group.value, q = finder.elements.q.value.trim();
    e.preventDefault();
    var url = base + "catalog/" + (g || "all") + "/" + (q ? "?q=" + encodeURIComponent(q) : "");
    location.href = url;
  });

  /* ---- Shelf tabs ---- */
  var tablist = $("[role=tablist]");
  if (tablist) {
    var tabs = $$("[role=tab]", tablist);
    var sel = function (t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; var p = doc.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on; });
      var more = $("[data-shelf-more]"); if (more) { more.setAttribute("href", base + "catalog/" + t.getAttribute("data-group") + "/"); more.textContent = "Усі позиції: " + t.getAttribute("data-group-name"); }
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length]; else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") n = tabs[0]; else if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); sel(n, true); }
      });
    });
  }

  /* ---- Listing filters ---- */
  var lst = $("[data-listing]");
  if (lst) {
    var rows = $$("[data-row]", lst), qs = new URLSearchParams(location.search), q = (qs.get("q") || "").toLowerCase();
    var fAvail = $("#f-avail"), fMin = $("#f-min"), fMax = $("#f-max"), fSort = $("#f-sort"), fSubs = $$("[name=sub]"), count = $("[data-count]"), empty = $("[data-empty]");
    var order = rows.slice();
    var subq = qs.get("sub") || "", subNote = $("[data-subnote]");
    if (subq && subNote) { subNote.hidden = false; $("[data-subname]", subNote).textContent = subq; }
    var apply = function () {
      var avail = fAvail && fAvail.checked, mn = fMin && fMin.value ? parseFloat(fMin.value) : 0, mx = fMax && fMax.value ? parseFloat(fMax.value) : Infinity;
      var sub = ""; fSubs.forEach(function (r) { if (r.checked) sub = r.value; });
      if (!sub && subq) sub = subq;
      var list = order.slice();
      var s = fSort ? fSort.value : "";
      if (s === "asc") list.sort(function (a, b) { return +a.dataset.price - +b.dataset.price; });
      else if (s === "desc") list.sort(function (a, b) { return +b.dataset.price - +a.dataset.price; });
      var host = rows[0] ? rows[0].parentNode : null, shown = 0;
      list.forEach(function (r) {
        var ok = (!avail || r.dataset.stock !== "out") && +r.dataset.price >= mn && +r.dataset.price <= mx && (!sub || r.dataset.sub === sub) && (!q || r.dataset.hay.indexOf(q) !== -1);
        r.hidden = !ok; if (ok) shown++; if (host) host.appendChild(r);
      });
      if (count) count.textContent = shown;
      if (empty) empty.hidden = shown !== 0;
      var g1 = $("#fg-avail"), g2 = $("#fg-price"), g3 = $("#fg-sub");
      if (g1) g1.classList.toggle("on", !!avail); if (g2) g2.classList.toggle("on", mn > 0 || mx !== Infinity); if (g3) g3.classList.toggle("on", !!sub);
    };
    [fAvail, fMin, fMax, fSort].forEach(function (c) { if (c) c.addEventListener("input", apply); });
    fSubs.forEach(function (c) { c.addEventListener("change", apply); });
    var reset = $("[data-reset]"); if (reset) reset.addEventListener("click", function () { if (fAvail) fAvail.checked = false; if (fMin) fMin.value = ""; if (fMax) fMax.value = ""; if (fSort) fSort.value = ""; fSubs.forEach(function (r) { r.checked = r.value === ""; }); apply(); });
    var qIn = $("#search-q"); if (qIn && q) qIn.value = qs.get("q");
    apply();
  }

  /* ---- PDP quantity ---- */
  var qi = $("[data-qty-input]");
  if (qi) {
    $$("[data-qty-step]").forEach(function (b) { b.addEventListener("click", function () { var v = Math.max(1, Math.min(99, (parseInt(qi.value, 10) || 1) + parseInt(b.getAttribute("data-qty-step"), 10))); qi.value = v; }); });
    qi.addEventListener("change", function () { qi.value = Math.max(1, Math.min(99, parseInt(qi.value, 10) || 1)); });
  }
})();
