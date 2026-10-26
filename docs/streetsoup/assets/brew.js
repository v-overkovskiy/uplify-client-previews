/* Анімація заварювання (паперовий коміксний стиль).
   Один таймлайн p ∈ [0,1], кадри рахує rAF:
   кришка знімається → чайник наливає воду → інгредієнти спливають із порошку й змішуються → паличка перемішує → пара й таймер. */
(function () {
  'use strict';
  var stage = document.querySelector('[data-brew]');
  if (!stage) return;

  var $ = function (s) { return stage.querySelector(s); };
  var $$ = function (s) { return [].slice.call(stage.querySelectorAll(s)); };
  var el = {
    cup: $('[data-cup]'), lid: $('[data-lid]'), kettle: $('[data-kettle]'),
    stream: $('[data-stream]'), streamO: $('[data-stream-o]'), stream2: $('[data-stream2]'),
    wave: $('[data-wave]'), waveBack: $('[data-wave-back]'), edge: $('[data-edge]'), depth: $('[data-depth]'),
    powder: $('[data-powder]'), stick: $('[data-stick]'), stickA: $('[data-stick-a]'), stickB: $('[data-stick-b]'), stickO: $('[data-stick-o]'),
    ring: $('[data-ring]'), time: $('[data-time]'),
    drops: $$('[data-drop]'), parts: $$('[data-p]'), streaks: $$('[data-streak]'), gloss: $$('[data-gl]'),
    ripples: $$('[data-ripple]'), bubs: $$('[data-bub]'), stars: $$('[data-star]'),
    wPour: $('[data-word="pour"]'), wStir: $('[data-word="stir"]'),
    inside: $('[data-inside]'), insideK: $('[data-inside-k]')
  };
  var steps = [].slice.call(document.querySelectorAll('[data-bstep]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DURATION = 7600;
  var SPOUT_REST = { x: 540, y: -30 }, SPOUT_POUR = { x: 238, y: 72 };
  var IMPACT_X = 226;
  var WATER = [250, 243, 224];
  var RX = [.14, .30, .46, .58, .70, .84, .22, .38, .64, .76, .90, .50, .08, .88];
  var RY = [.26, .66, .18, .78, .40, .70, .86, .48, .12, .88, .30, .92, .62, .52];

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function backOut(t) { var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) { return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  function bez(p0, p1, p2, t) {
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }
  function f1(n) { return n.toFixed(1); }
  function wallL(y) { return 108 + 22 * (y - 150) / 218; }
  function wallR(y) { return 312 - 22 * (y - 150) / 218; }

  var flavor = { c: hex('#F4C514'), hi: hex('#FFE45C'), dk: hex('#B98400') };
  var ingTypes = (stage.getAttribute('data-ing') || '').split(',');
  var lastStep = -2, doneShown = false, steamOn = false, seekMode = null, setFlavorLater = null;

  function applyIngredients() {
    el.parts.forEach(function (u, i) { u.setAttribute('href', '#ing-' + (ingTypes[i % ingTypes.length] || 'pea')); });
  }
  applyIngredients();

  function render(p, now) {
    var tm = now / 1000;

    /* --- рівень води й колір --- */
    var L = easeInOut(smooth(.27, .6, p)) * .92;
    var sy = 368 - L * 190;
    var cm = smooth(.36, .76, p);
    stage.style.setProperty('--liq', mix(WATER, flavor.c, cm));
    stage.style.setProperty('--stripe', 'rgb(' + flavor.c.join(',') + ')');
    stage.style.setProperty('--liq-hi', mix([255, 252, 238], flavor.hi, cm));
    stage.style.setProperty('--liq-dk', mix([226, 212, 176], flavor.dk, cm));

    /* --- кришка --- */
    var lp = easeOut(smooth(0, .12, p)), fly = smooth(.1, .21, p);
    el.lid.setAttribute('transform', 'translate(' + f1(300 * fly * fly) + ' ' + f1(-30 * lp - 90 * fly) + ') rotate(' + f1(-9 * lp + 38 * fly) + ' 210 146)');
    el.lid.style.opacity = String(1 - smooth(.17, .22, p));

    /* --- чайник --- */
    var enter = easeOut(smooth(.12, .27, p)), exit = smooth(.58, .7, p);
    var k = enter * (1 - easeInOut(exit));
    var tilt = smooth(.2, .31, p) * (1 - smooth(.56, .64, p));
    var tx = lerp(SPOUT_REST.x, SPOUT_POUR.x, k), ty = lerp(SPOUT_REST.y, SPOUT_POUR.y, k) + Math.sin(tm * 9) * .8 * tilt;
    el.kettle.setAttribute('transform', 'translate(' + f1(tx) + ' ' + f1(ty) + ') rotate(' + f1(-31 * tilt) + ')');
    el.kettle.style.opacity = k > .005 ? '1' : '0';

    /* --- струмінь --- */
    var head = smooth(.27, .325, p), tail = smooth(.565, .61, p);
    var pour = head * (1 - tail);
    if (head > 0 && tail < 1) {
      var P0 = { x: tx - 2, y: ty + 3 }, P2 = { x: IMPACT_X, y: Math.max(sy, 120) }, P1 = { x: tx - 12, y: ty + (P2.y - ty) * .28 };
      var a = tail * .92, b = head, d = '';
      for (var i = 0; i <= 9; i++) {
        var pt = bez(P0, P1, P2, lerp(a, b, i / 9));
        d += (i ? 'L' : 'M') + f1(pt.x) + ',' + f1(pt.y) + ' ';
      }
      el.stream.setAttribute('d', d); el.stream2.setAttribute('d', d); el.streamO.setAttribute('d', d);
      el.stream.setAttribute('stroke-width', f1(9 * pour + 3));
      el.streamO.setAttribute('stroke-width', f1(9 * pour + 3 + 6));
      el.stream.style.opacity = '1'; el.stream2.style.opacity = '.9'; el.streamO.style.opacity = '1';
    } else { el.stream.style.opacity = '0'; el.stream2.style.opacity = '0'; el.streamO.style.opacity = '0'; }

    /* --- бризки й кола на воді --- */
    el.drops.forEach(function (c, i) {
      var ph = (tm * 2.4 + i * .143) % 1, vis = pour > .35 ? Math.sin(Math.PI * ph) : 0;
      var dir = (i % 2 ? 1 : -1) * (7 + i * 3);
      c.setAttribute('cx', f1(IMPACT_X + dir * ph));
      c.setAttribute('cy', f1(sy - 4 - (24 + (i % 3) * 8) * Math.sin(Math.PI * ph)));
      c.setAttribute('r', f1(3.8 - 1.6 * ph));
      c.setAttribute('opacity', f1(vis));
    });
    el.ripples.forEach(function (r, i) {
      var ph = (tm * 1.3 + i * .5) % 1, rx = 6 + 54 * ph;
      r.setAttribute('cx', IMPACT_X); r.setAttribute('cy', f1(sy + 3));
      r.setAttribute('rx', f1(rx)); r.setAttribute('ry', f1(rx * .16));
      r.setAttribute('opacity', f1(pour * (1 - ph)));
    });

    /* --- хвиля поверхні + контур --- */
    var stirP = smooth(.62, .7, p) * (1 - smooth(.84, .9, p));
    var amp = 1.8 + 5.5 * pour + 6 * stirP;
    var ph1 = tm * (2.4 + 3 * stirP), kx = .045;
    function pts(off, amp2, ph) {
      var out = [];
      for (var x = 92; x <= 328; x += 8) {
        var edge = Math.min(1, Math.min(x - 100, 320 - x) / 36);
        out.push([x, sy + off + amp2 * edge * Math.sin(x * kx + ph)]);
      }
      return out;
    }
    function poly(ar, close) {
      var d = 'M' + ar[0][0] + ',' + f1(ar[0][1]);
      for (var i = 1; i < ar.length; i++) d += ' L' + ar[i][0] + ',' + f1(ar[i][1]);
      return close ? d + ' L328,420 L92,420 Z' : d;
    }
    var front = pts(0, amp, ph1);
    el.wave.setAttribute('d', poly(front, true));
    el.waveBack.setAttribute('d', poly(pts(-4, amp * 1.15, ph1 + 1.9), true));
    el.edge.setAttribute('d', poly(front, false));
    var vis = L > .002;
    el.wave.style.opacity = vis ? '1' : '0'; el.waveBack.style.opacity = vis ? '1' : '0'; el.edge.style.opacity = vis ? '1' : '0';
    el.depth.setAttribute('y', f1(sy));

    /* --- глянцеві смуги на воді --- */
    var depthH = 368 - sy;
    el.gloss.forEach(function (g, i) {
      var y0 = sy + 16 + i * 30, len = clamp(depthH - 34 - i * 30, 0, i ? 12 : 34);
      var x0 = wallL(y0) + 16 + i * 5;
      g.setAttribute('d', 'M' + f1(x0) + ',' + f1(y0) + ' L' + f1(x0 - 2) + ',' + f1(y0 + len));
      g.style.opacity = len > 4 ? '1' : '0';
    });

    /* --- порошок розчиняється --- */
    var pwA = 1 - smooth(.3, .62, p);
    el.powder.style.opacity = f1(pwA);
    el.powder.setAttribute('transform', 'translate(210 346) scale(' + f1(1 - .14 * (1 - pwA)) + ') translate(-210 -346)');

    /* --- інгредієнти: лежать у купці, потім спливають і змішуються --- */
    var u = easeInOut(smooth(.34, .72, p));
    var a2 = (p - .62) / .24 * Math.PI * 7;
    el.parts.forEach(function (c, i) {
      var rx = RX[i % RX.length], ry = RY[i % RY.length];
      var s = .85 + ((i * 37) % 10) / 10 * .5, w = 29 * s;
      /* купка */
      var restX = 210 + (rx - .5) * 150, restY = 338 - 20 * (1 - Math.abs(2 * rx - 1)) + ry * 9;
      /* плавання */
      var yf = sy + 18 + ry * Math.max(0, depthH - 36) + Math.sin(tm * 1.4 + i * 2) * 1.8 + Math.cos(a2 * 1.3 + i) * 7 * stirP;
      var lx = wallL(yf) + 16, rxw = wallR(yf) - 16;
      var xf = lx + rx * (rxw - lx) + Math.sin(tm * 1.1 + i) * 2 + Math.sin(a2 + i) * 15 * stirP;
      var x = lerp(restX, xf, u), y = lerp(restY, yf, u) - 24 * Math.sin(Math.PI * u);
      var rot = ((i * 47) % 70) - 35 + u * 40 * Math.sin(i + 1) + stirP * Math.sin(a2 + i) * 40;
      c.setAttribute('x', f1(x - w / 2)); c.setAttribute('y', f1(y - w / 2));
      c.setAttribute('width', f1(w)); c.setAttribute('height', f1(w));
      c.setAttribute('transform', 'rotate(' + f1(rot) + ' ' + f1(x) + ' ' + f1(y) + ')');
    });
    el.streaks.forEach(function (s, i) {
      var x = 210 + Math.sin(a2 * (.9 + i * .15) + i * 1.7) * (52 - i * 5);
      var y = sy + 20 + i * Math.max(0, depthH - 44) * .22;
      s.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + f1(Math.cos(a2 + i) * 10) + ')');
      s.style.opacity = f1(stirP * .9);
    });
    el.bubs.forEach(function (b, i) {
      var ph = (tm * .5 + i * .17) % 1;
      b.setAttribute('cx', f1(150 + i * 24 + Math.sin(tm * 2 + i) * 4));
      b.setAttribute('cy', f1(sy + 4 - ph * 9));
      b.style.opacity = f1(stirP * Math.sin(Math.PI * ph));
    });

    /* --- паличка --- */
    var tipX = 210 + Math.sin(a2) * 46 * stirP, tipY = sy + 40 + Math.cos(a2 * 2) * 8 * stirP;
    var topX = 268 + (tipX - 210) * .25, topY = 52;
    [el.stickO, el.stickA, el.stickB].forEach(function (l, i) {
      var dx = i === 2 ? -1.5 : 0;
      l.setAttribute('x1', f1(tipX + dx)); l.setAttribute('y1', f1(tipY));
      l.setAttribute('x2', f1(topX + dx)); l.setAttribute('y2', topY);
    });
    el.stick.style.opacity = f1(clamp(stirP * 3, 0, 1));

    /* --- коміксні вигуки --- */
    var sp = smooth(.33, .38, p) * (1 - smooth(.47, .52, p));
    el.wPour.setAttribute('transform', 'translate(66 204) rotate(' + f1(-9 + Math.sin(tm * 16) * 2.2) + ') scale(' + f1(backOut(sp) * (sp > 0 ? 1 : 0)) + ')');
    el.wPour.style.opacity = sp > .01 ? '1' : '0';
    var ss = smooth(.67, .72, p) * (1 - smooth(.79, .84, p));
    el.wStir.setAttribute('transform', 'translate(354 292) rotate(' + f1(8 + Math.sin(tm * 18) * 2.4) + ') scale(' + f1(backOut(ss) * (ss > 0 ? 1 : 0)) + ')');
    el.wStir.style.opacity = ss > .01 ? '1' : '0';

    /* --- пара --- */
    var hot = p > .8;
    if (hot !== steamOn) { steamOn = hot; stage.classList.toggle('is-hot', hot); }

    /* --- «стрибок» стакана наприкінці --- */
    var bp = smooth(.9, .95, p) * (1 - smooth(.95, 1, p));
    el.cup.setAttribute('transform', 'translate(210 394) scale(' + f1(1 - .02 * bp) + ' ' + f1(1 + .035 * bp) + ') translate(-210 -394)');

    /* --- таймер --- */
    var tp = smooth(.68, .985, p), secs = Math.round(60 * (1 - tp));
    el.ring.style.strokeDashoffset = f1(1 - tp);
    el.time.textContent = secs >= 60 ? '1:00' : '0:' + (secs < 10 ? '0' : '') + secs;

    /* --- блискітки, «готово», кроки --- */
    var sg = smooth(.95, 1, p);
    el.stars.forEach(function (s, i) {
      var sc = backOut(sg) * (1 + .12 * Math.sin(tm * 3 + i * 2)) * (sg > 0 ? 1 : 0);
      var pos = [[70, 120], [356, 96], [344, 196]][i];
      s.setAttribute('transform', 'translate(' + pos[0] + ' ' + pos[1] + ') rotate(' + f1(Math.sin(tm * 1.5 + i) * 12) + ') scale(' + f1(sc) + ')');
    });
    var isDone = p >= .985;
    if (isDone !== doneShown) { doneShown = isDone; stage.classList.toggle('is-done', isDone); }
    var st = p < .26 ? 0 : p < .62 ? 1 : 2;
    if (p <= 0) st = -1;
    if (st !== lastStep || isDone) {
      lastStep = st;
      steps.forEach(function (li, i) { li.classList.toggle('is-active', i === st && !isDone); li.classList.toggle('is-done', i < st || isDone); });
    }
  }

  /* --- відтворення --- */
  var raf = 0, startAt = 0, playing = false, visible = false, idleRaf = 0;
  function frame(now) {
    var p = clamp((now - startAt) / DURATION, 0, 1);
    render(p, now);
    if (p < 1) raf = requestAnimationFrame(frame);
    else { playing = false; idleLoop(now); }
  }
  function idleLoop(t0) {
    cancelAnimationFrame(idleRaf);
    if (reduce) return;
    (function tick(now) { if (playing) return; render(1, now); if (visible) idleRaf = requestAnimationFrame(tick); })(t0 || performance.now());
  }
  function play() {
    cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf);
    lastStep = -2; doneShown = false; steamOn = false;
    stage.classList.remove('is-hot', 'is-done');
    if (reduce) { render(1, 0); stage.classList.add('is-hot', 'is-done'); return; }
    playing = true; startAt = performance.now();
    raf = requestAnimationFrame(frame);
  }

  render(0, 0);
  var seek = (location.search.match(/[?&]brew=([\d.]+)/) || [])[1];
  var seekFlavor = (location.search.match(/[?&]flavor=(\w+)/) || [])[1];
  if (seek !== undefined) {
    var sv = clamp(parseFloat(seek), 0, 1);
    var fb = seekFlavor && stage.querySelector('[data-flavor="' + seekFlavor + '"]');
    if (fb) setFlavorLater = fb;
    seekMode = sv;
  }
  if (reduce) { render(1, 0); stage.classList.add('is-hot', 'is-done'); }
  var started = false;
  if (seekMode !== null) { if (setFlavorLater) setFlavor(setFlavorLater); render(seekMode, 3000); stage.classList.toggle('is-hot', seekMode > .8); stage.classList.toggle('is-done', seekMode >= .985); return; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !started) { started = true; setTimeout(play, 350); }
      if (visible && started && !playing && !reduce) idleLoop(performance.now());
    }, { threshold: .45 }).observe(stage);
  } else { started = true; play(); }

  var rp = $('[data-replay]');
  if (rp) rp.addEventListener('click', function () { started = true; play(); });
  var art = $('[data-art]');
  if (art) art.addEventListener('click', function () { started = true; play(); });
  function setFlavor(b) {
    $$('[data-flavor]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    flavor = { c: hex(b.getAttribute('data-c')), hi: hex(b.getAttribute('data-hi')), dk: hex(b.getAttribute('data-dk')) };
    stage.style.setProperty('--pw', b.getAttribute('data-pw'));
    ingTypes = b.getAttribute('data-ing').split(',');
    applyIngredients();
    el.inside.textContent = b.getAttribute('data-inside');
    el.insideK.textContent = b.getAttribute('data-real') === '1' ? 'У стакані:' : 'У стакані (за назвою смаку):';
  }
  $$('[data-flavor]').forEach(function (b) {
    b.addEventListener('click', function () { setFlavor(b); started = true; play(); });
  });
})();
