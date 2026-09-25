/* ==========================================================
   Medelin · Історія · «Крива обсмаження»
   Без залежностей. Працює і без JS (увесь текст видно одразу).
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Мови ---------------- */

  const RU = {
    "skip": "Перейти к истории",
    "nav.history": "История Medelin",
    "nav.catalog": "Каталог",
    "nav.franchise": "Франшиза",
    "nav.contacts": "Контакты",
    "rail.label": "Кривая обжарки",

    "hero.eyebrow": "Ужгород · 1998",
    "hero.title": "Medelin.<br> История, которая<br> началась<br> с&nbsp;кофе",
    "hero.lede": "Мы начали с производства жареного кофе и ростера легендарной немецкой компании Probat. Зелёное зерно покупали у швейцарского импортёра, работавшего с кофейными регионами по всему миру.",
    "hero.cueTitle": "Листайте вниз",
    "hero.cue": "дальше историю ведёт кривая обжарки, от зелёного зерна до&nbsp;чашки",

    "origins.eyebrow": "Сушка · зелёное зерно",
    "origins.title": "Сорта, с которых всё началось",
    "origins.lede": "Многие сорта, с которых начиналась история Medelin, представлены до сих пор. Спустя почти три десятилетия у них по-прежнему есть свои преданные поклонники.",
    "origins.alt": "Мешок зелёного кофе с маркировкой происхождения",
    "o1.name": "Индийская арабика и робуста",
    "o1.fact": "В Индии кофе часто выращивают в тени деревьев, рядом со специями: перцем и кардамоном.",
    "o1.n1": "плотное тело", "o1.n2": "какао", "o1.n3": "специи",
    "o2.name": "Кения",
    "o2.fact": "AA — самый крупный размер зерна в кенийской классификации. Кенийский кофе любят за яркость.",
    "o2.n1": "чёрная смородина", "o2.n2": "цитрус", "o2.n3": "живая кислотность",
    "o3.name": "Никарагуа, Марагоджип",
    "o3.fact": "Разновидность арабики с одним из самых крупных зёрен в мире. Его называют «слоновым» зерном.",
    "o3.n1": "мягкое тело", "o3.n2": "орех", "o3.n3": "карамель",
    "o4.name": "Никарагуа, SHG",
    "o4.fact": "Strictly High Grown: кофе выращивают высоко в горах, поэтому зерно созревает медленнее и становится плотнее.",
    "o4.n1": "шоколад", "o4.n2": "карамель", "o4.n3": "баланс",
    "o5.name": "Индия, муссонный Малабар",
    "o5.fact": "Зерно неделями выдерживают под влажными муссонными ветрами. Оно светлеет, увеличивается и теряет кислотность.",
    "o5.n1": "низкая кислотность", "o5.n2": "пряности", "o5.n3": "дерево",
    "origins.fine": "Ноты вкуса типичны для происхождения, а не описание конкретного лота.",
    "origins.link": "Посмотреть сорта в каталоге",

    "unknown.eyebrow": "Первые два года",
    "unknown.lead": "Первые два года оказались прекрасным уроком. Мы предлагали свой кофе ресторанам и кафе, но постоянно слышали одно и то же:",
    "unknown.q1": "«Medelin никто не знает»",
    "unknown.q2": "«Покупатель хочет известные импортные марки»",
    "unknown.tired": "В какой-то момент мы устали убеждать тех, кто решал за покупателя.",
    "unknown.turn": "И решили: пусть выбирает сам покупатель.",

    "shop.eyebrow": "Реакция Майяра · эксперимент",
    "shop.title": "20&nbsp;м² и две полки",
    "shop.p1": "Мы сняли помещение площадью всего 20 квадратных метров и открыли собственный магазин-кафе.",
    "shop.p2": "На одной полке поставили практически весь доступный тогда импортный кофе, от недорогого до самых известных итальянских брендов. На другой — только кофе Medelin.",
    "shop.p3": "А рядом установили кофемашину, чтобы любой сорт можно было сначала попробовать и только потом решить, покупать его или нет.",
    "poll.q": "Как думаете, какая полка опустела быстрее за первый месяц?",
    "poll.import": "Импортная",
    "poll.medelin": "Medelin",
    "poll.hint": "Выберите полку или просто листайте дальше.",

    "crack.meta": "Первый крек",
    "crack.title": "Результат первого месяца изменил всё",
    "crack.import": "Импортный кофе",
    "crack.kg": "кг",
    "crack.note": "Импортного кофе мы продали около 30 килограммов. Кофе Medelin — 900. В тридцать раз больше.",
    "queue.alt": "Гости у входа в кофейню Medelin",
    "queue.title": "Очереди доходили до дверей",
    "queue.p": "Скоро открыли вторую локацию, затем третью. Очереди доходили до дверей и не исчезали практически весь день. Постепенно Medelin стал частью кофейной культуры Ужгорода, а затем появился и в других городах Закарпатья.",

    "lab.eyebrow": "Развитие · вкус",
    "lab.title": "Закарпатье стало нашей кофейной лабораторией",
    "lab.lede": "Здесь кофе пьют много, любят давно и прекрасно знают, каким хотят его видеть. Покупатели говорили нам, когда кофе казался слишком горьким, слишком кислым или когда во вкусе чего-то не хватало. Мы слушали, меняли профили и снова жарили.",
    "lab.q": "Что сказал покупатель?",
    "lab.bitter": "«Слишком горько»",
    "lab.sour": "«Слишком кисло»",
    "lab.flat": "«Чего-то не хватает»",
    "lab.min": "мин",
    "lab.fc": "первый крек",
    "lab.was": "было",
    "lab.now": "изменили",
    "lab.fine": "Упрощённая схема. Настоящий профиль зависит от зерна, партии и ростера.",
    "lab.alt": "Каппинг: ложка над чашками с кофе",
    "lab.quote": "Так постепенно появился собственный стиль Medelin и главная идея: нам важно сделать чашку, от которой человек получает удовольствие.",

    "sp.eyebrow": "Specialty coffee",
    "sp.title": "2022. Учимся заново",
    "sp.lede": "В 2022 году для Medelin начался новый этап — specialty coffee. Мы заново учились, экспериментировали, жарили, пробовали и снова жарили. Новое поколение оборудования позволило контролировать обжарку с точностью, о которой в конце девяностых можно было только мечтать.",
    "gen.alt1": "Барабанный ростер с лотком охлаждения",
    "gen.alt2": "Обжарщик за работой у ростера",
    "gen.alt3": "Современный ростер",
    "gen.t1": "Первое поколение",
    "gen.p1": "Ростер Probat, с которого Medelin начался в 1998 году.",
    "gen.t2": "Второе поколение",
    "gen.p2": "Следующий шаг в точности и стабильности обжарки.",
    "gen.t3": "Третье поколение",
    "gen.p3": "Десятки параметров под контролем и точное повторение профиля для specialty-лотов.",
    "sp.gens": "Сегодня на производстве Medelin встречаются уже три поколения ростеров Probat.",
    "sp.pause": "Технология повторяет. <em>Человек решает.</em>",
    "sp.body": "Современные технологии помогают контролировать десятки параметров и точно повторять созданный профиль, но главный инструмент по-прежнему не компьютер. Это вкус. Технология способна безупречно повторить задуманное человеком, но сначала человек должен понять, каким должен быть этот кофе.",

    "people.eyebrow": "Команда Medelin",
    "people.title": "Жарит с первого дня",
    "people.alt1": "Руки обжарщика перемешивают только что обжаренное зерно",
    "people.alt2": "Команда заваривает кофе для каппинга",
    "people.alt3": "Зелёное зерно микролота на весах",
    "people.s1": "с 1998",
    "people.p1": "Наш обжарщик работает в Medelin с самого основания компании.",
    "people.s2": "15–20+ лет",
    "people.p2": "Ядро нашей команды вместе уже 15–20 лет и больше.",
    "people.s3": "микролоты",
    "people.p3": "Самые редкие specialty-микролоты сегодня лично обжаривает основатель Medelin Феликс Бирман.",
    "people.ritual": "Мы выбираем интересное зелёное зерно, ищем для каждого лота собственный профиль и продолжаем делать то же, что делали много лет назад:",
    "loop.1": "пробовать",
    "loop.2": "слушать людей",
    "loop.3": "менять детали",
    "loop.4": "и снова пробовать",
    "people.end": "Только оборудование стало точнее, возможности — значительно шире, а требования к себе — выше.",

    "cup.alt": "Чашка кофе Medelin в руках",
    "cup.eyebrow": "Нам нравится кофе",
    "cup.lead": "Нравится техника, технологии, эксперименты и сам процесс создания чего-то нового. Но у всего этого есть очень простая цель: человек должен сделать первый глоток и подумать <em>«вау»</em>. Потом вернуться, сделать ещё один — и снова получить то же ощущение.",
    "cup.stand": "Когда-то над нашим выставочным стендом висела фраза:",
    "cup.slogan": "Не попробовав — не&nbsp;узнаешь",
    "cup.after": "Прошло почти тридцать лет, изменились технологии, оборудование и сам кофейный мир. А нам до сих пор трудно придумать более точное описание Medelin.",
    "cta.catalog": "Попробовать сорта Medelin",
    "cta.cafe": "Найти кофейню",
    "cta.franchise": "Франшиза Medelin",
    "footer.city": "Ужгород"
  };

  /* Рядки, які створює скрипт */
  const T = {
    uk: {
      title: "Medelin. Історія, що почалася з кави",
      desc: "Історія Medelin від 1998 року: Ужгород, ростер Probat, магазин на 20 м² і 900 кілограмів кави за перший місяць.",
      phases: { load: "Завантаження", dry: "Сушіння", maillard: "Реакція Маяра", crack: "Перший крек", dev: "Розвиток", cup: "У чашці" },
      years: { "1998": "1998", "1998–2000": "1998–2000", "20 м²": "20 м²", "перший місяць": "перший місяць", "Закарпаття": "Закарпаття", "2022": "2022", "сьогодні": "сьогодні", "у чашці": "у чашці" },
      pollHint: { import: "Ви обрали імпортну полицю. Перевірмо, як було насправді…", medelin: "Ви обрали Medelin. Перевірмо, як було насправді…" },
      pollResult: { import: "Ви поставили на імпорт, так само думали й ресторани. А покупці, скуштувавши, вирішили інакше.", medelin: "Ви поставили на Medelin — і не помилилися." },
      lab: {
        bitter: "Скорочуємо розвиток після першого креку й трохи знижуємо кінцеву температуру: гіркота йде, солодкість лишається.",
        sour: "Подовжуємо розвиток після першого креку: кислотність стає м'якшою, з'являється більше солодкості й тіла.",
        flat: "Даємо більше часу реакції Маяра: карамелізація глибша, смак повніший і багатший."
      }
    },
    ru: {
      title: "Medelin. История, которая началась с кофе",
      desc: "История Medelin с 1998 года: Ужгород, ростер Probat, магазин на 20 м² и 900 килограммов кофе за первый месяц.",
      phases: { load: "Загрузка", dry: "Сушка", maillard: "Реакция Майяра", crack: "Первый крек", dev: "Развитие", cup: "В чашке" },
      years: { "1998": "1998", "1998–2000": "1998–2000", "20 м²": "20 м²", "перший місяць": "первый месяц", "Закарпаття": "Закарпатье", "2022": "2022", "сьогодні": "сегодня", "у чашці": "в чашке" },
      pollHint: { import: "Вы выбрали импортную полку. Проверим, как было на самом деле…", medelin: "Вы выбрали Medelin. Проверим, как было на самом деле…" },
      pollResult: { import: "Вы поставили на импорт, так же думали и рестораны. А покупатели, попробовав, решили иначе.", medelin: "Вы поставили на Medelin — и не ошиблись." },
      lab: {
        bitter: "Сокращаем развитие после первого крека и немного снижаем конечную температуру: горечь уходит, сладость остаётся.",
        sour: "Удлиняем развитие после первого крека: кислотность становится мягче, появляется больше сладости и тела.",
        flat: "Даём больше времени реакции Майяра: карамелизация глубже, вкус полнее и богаче."
      }
    }
  };

  let lang = "uk";
  const UK = {};
  const i18nEls = $$("[data-i18n]");
  const altEls = $$("[data-i18n-alt]");
  const isSvg = (el) => el instanceof SVGElement;
  i18nEls.forEach((el) => { UK[el.dataset.i18n] = isSvg(el) ? el.textContent : el.innerHTML; });
  altEls.forEach((el) => { UK[el.dataset.i18nAlt] = el.getAttribute("alt"); });

  function setLang(next) {
    lang = next === "ru" ? "ru" : "uk";
    const dict = lang === "ru" ? RU : UK;
    i18nEls.forEach((el) => {
      const v = dict[el.dataset.i18n] ?? UK[el.dataset.i18n];
      if (v == null) return;
      if (isSvg(el)) el.textContent = v; else el.innerHTML = v;
    });
    altEls.forEach((el) => {
      const v = dict[el.dataset.i18nAlt] ?? UK[el.dataset.i18nAlt];
      if (v != null) el.setAttribute("alt", v);
    });
    document.documentElement.lang = lang === "ru" ? "ru" : "uk";
    document.title = T[lang].title;
    const md = $('meta[name="description"]'); if (md) md.setAttribute("content", T[lang].desc);
    $$("[data-language]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.language === lang)));
    renderPhaseLabels();
    updateLab(currentFb, true);
    refreshPollTexts();
    lastKey = "";
    update();
    try { localStorage.setItem("medelin-lang", lang); } catch (e) { /* немає сховища */ }
  }

  /* ---------------- Крива обсмаження ---------------- */

  // Типова крива температури зерна (хв, °C) + охолодження «до чашки»
  const CURVE = [
    [0, 200], [0.5, 140], [1, 105], [1.5, 92], [2.5, 110], [3.5, 130], [4.5, 152],
    [5.5, 165], [6.5, 176], [7.5, 186], [8.5, 196], [9.5, 202], [10.5, 207], [10.75, 120], [11, 65]
  ];
  const T_END = 11;
  const FC = 8.5;
  const PHASES = [
    { k: "load", a: 0, b: 1.5, go: "#s-1998" },
    { k: "dry", a: 1.5, b: 4.5, go: "#s-origins" },
    { k: "maillard", a: 4.5, b: 8.5, go: "#s-shop" },
    { k: "crack", a: 8.5, b: 8.5, go: "#s-crack" },
    { k: "dev", a: 8.5, b: 10.5, go: "#s-lab" },
    { k: "cup", a: 10.5, b: 11, go: "#s-cup" }
  ];

  function tempAt(t) {
    if (t <= CURVE[0][0]) return CURVE[0][1];
    for (let i = 1; i < CURVE.length; i++) {
      const [t1, T1] = CURVE[i];
      if (t <= t1) {
        const [t0, T0] = CURVE[i - 1];
        return T0 + (T1 - T0) * ((t - t0) / (t1 - t0));
      }
    }
    return CURVE[CURVE.length - 1][1];
  }
  function phaseAt(t) {
    if (Math.abs(t - FC) < 0.28) return "crack";
    for (const p of PHASES) if (p.k !== "crack" && t >= p.a && t < p.b) return p.k;
    return "cup";
  }

  // Згладжена крива через точки (Catmull-Rom → Безьє)
  function smooth(pts) {
    if (pts.length < 2) return "";
    let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return d;
  }

  // Вертикальна крива: час іде вниз, температура — вправо
  const RY = (t) => (t / T_END) * 600;
  const RX = (Tc) => 6 + ((Tc - 50) / (215 - 50)) * 88;
  // Горизонтальна міні-крива
  const MX = (t) => (t / T_END) * 220;
  const MY = (Tc) => 36 - ((Tc - 50) / (215 - 50)) * 32;

  const rail = $("[data-rail]");
  const railChart = rail ? $(".rail-chart", rail) : null;
  const railClip = $("[data-rail-clip]");
  const railDot = $("[data-rail-dot]");
  const railTime = $("[data-rail-time]");
  const railTemp = $("[data-rail-temp]");
  const railPhase = $("[data-rail-phase]");
  const railYear = $("[data-rail-year]");
  const phaseList = $("[data-rail-phases]");

  const mini = $("[data-mini]");
  const miniClip = $("[data-mini-clip]");
  const miniDot = $("[data-mini-dot]");
  const miniTime = $("[data-mini-time]");
  const miniTemp = $("[data-mini-temp]");
  const miniPhase = $("[data-mini-phase]");

  const railPts = CURVE.map(([t, Tc]) => [RX(Tc), RY(t)]);
  $$("[data-rail-path]").forEach((p) => p.setAttribute("d", smooth(railPts)));
  const crackLine = $("[data-rail-crack]");
  if (crackLine) { crackLine.setAttribute("y1", RY(FC)); crackLine.setAttribute("y2", RY(FC)); }
  const miniPts = CURVE.map(([t, Tc]) => [MX(t), MY(Tc)]);
  $$("[data-mini-path]").forEach((p) => p.setAttribute("d", smooth(miniPts)));

  function renderPhaseLabels() {
    if (!phaseList) return;
    phaseList.innerHTML = "";
    PHASES.forEach((p) => {
      const li = document.createElement("li");
      li.dataset.phase = p.k;
      const mid = p.k === "crack" ? FC : (p.a + p.b) / 2;
      li.style.top = `${(mid / T_END) * 100}%`;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = T[lang].phases[p.k];
      b.addEventListener("click", () => {
        const target = $(p.go);
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
      li.appendChild(b);
      phaseList.appendChild(li);
    });
  }

  /* ---------------- Прив'язка сцен до часу обсмаження ---------------- */

  const scenes = $$("[data-scene]");
  let anchors = [];
  function measure() {
    anchors = scenes.map((el) => ({
      el,
      top: el.getBoundingClientRect().top + window.scrollY,
      t: parseFloat(el.dataset.t) || 0,
      tone: el.dataset.tone || "light",
      year: el.dataset.year || ""
    }));
    const docEnd = document.documentElement.scrollHeight;
    anchors.push({ el: null, top: docEnd - window.innerHeight * 0.5, t: T_END, tone: "dark", year: anchors.length ? anchors[anchors.length - 1].year : "" });
  }

  function roastTimeAt(ref) {
    if (!anchors.length) return { t: 0, i: 0 };
    if (ref <= anchors[0].top) return { t: 0, i: 0 };
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i], b = anchors[i + 1];
      if (ref < b.top) {
        const k = clamp((ref - a.top) / Math.max(1, b.top - a.top), 0, 1);
        return { t: a.t + (b.t - a.t) * k, i };
      }
    }
    return { t: T_END, i: anchors.length - 2 };
  }

  const header = $(".site-header");
  const heroImg = $(".hero-media img");
  const heroYear = $(".hero-year");
  let lastKey = "";

  function fmtTime(t) {
    const total = Math.round(t * 60);
    const m = Math.floor(total / 60), s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function update() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const ref = y + vh * 0.5 * clamp(y / (vh * 0.5), 0, 1); // на самому верху крива стоїть на 00:00
    const { t, i } = roastTimeAt(ref);
    const Tc = tempAt(t);
    const ph = phaseAt(t);
    const scene = anchors[i] || anchors[0];

    // тон під кривою і хедером
    const tone = scene ? (scene.tone === "roast" ? "dark" : scene.tone) : "dark";
    if (document.body.dataset.tone !== tone) document.body.dataset.tone = tone;
    if (header) header.classList.toggle("is-scrolled", y > 24);

    // велика крива
    if (rail && railChart && rail.getClientRects().length) {
      const h = railChart.clientHeight, w = railChart.clientWidth;
      const yPx = (RY(t) / 600) * h;
      if (railClip) railClip.setAttribute("height", String(RY(t)));
      if (railDot) railDot.style.transform = `translate(${(w - 64 + (RX(Tc) / 100) * 64).toFixed(1)}px, ${yPx.toFixed(1)}px)`;
    }
    if (miniClip) miniClip.setAttribute("width", String(MX(t)));
    if (miniDot) { miniDot.setAttribute("cx", MX(t).toFixed(1)); miniDot.setAttribute("cy", MY(Tc).toFixed(1)); }
    if (mini) mini.classList.toggle("is-visible", y > vh * 0.6);

    const key = `${fmtTime(t)}|${Math.round(Tc)}|${ph}|${scene ? scene.year : ""}|${lang}`;
    if (key !== lastKey) {
      lastKey = key;
      const time = fmtTime(t), temp = String(Math.round(Tc));
      const phName = T[lang].phases[ph];
      const yr = scene ? (T[lang].years[scene.year] || scene.year) : "";
      if (railTime) railTime.textContent = time;
      if (railTemp) railTemp.textContent = temp;
      if (railPhase) railPhase.textContent = phName;
      if (railYear) railYear.textContent = yr;
      if (miniTime) miniTime.textContent = time;
      if (miniTemp) miniTemp.textContent = temp;
      if (miniPhase) miniPhase.textContent = phName;
      if (phaseList) $$("li", phaseList).forEach((li) => li.classList.toggle("is-current", li.dataset.phase === ph));
    }

    // герой: легкий наїзд камери
    if (!reduceMotion && y < vh * 1.2) {
      const k = y / vh;
      if (heroImg) heroImg.style.transform = `scale(${(1.06 + k * 0.08).toFixed(3)}) translateY(${(k * 30).toFixed(1)}px)`;
      if (heroYear) heroYear.style.transform = `translateY(${(k * -60).toFixed(1)}px)`;
    }

    updateStage();
    updateOrigins();
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }

  /* ---------------- «Medelin ніхто не знає»: кроки ---------------- */

  const stageSection = $(".s-unknown");
  const steps = stageSection ? $$(".step", stageSection) : [];
  const stepCount = stageSection ? parseInt(stageSection.dataset.steps || "5", 10) : 0;
  function updateStage() {
    if (!stageSection || !steps.length) return;
    const r = stageSection.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    const p = clamp(-r.top / span, 0, 1);
    const active = Math.min(stepCount - 1, Math.floor(p * stepCount * 1.05));
    steps.forEach((el) => {
      const s = parseInt(el.dataset.step, 10);
      el.classList.toggle("is-on", s === active || (s === 0 && active <= 0));
      el.classList.toggle("is-past", s < active && !(s === 0 && active <= 0));
    });
  }

  /* ---------------- Поява блоків ---------------- */

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------- Сорти: активна картка ---------------- */

  const originCards = $$("[data-origin]");
  const originCaption = $("[data-origin-caption]");
  let activeOrigin = -1;
  function updateOrigins() {
    if (!originCards.length) return;
    // активна картка — та, чий центр найближчий до лінії читання (55% висоти екрана)
    const line = window.innerHeight * 0.55;
    let best = 0, bestD = Infinity;
    originCards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - line);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === activeOrigin) return;
    activeOrigin = best;
    originCards.forEach((c, i) => c.classList.toggle("is-active", i === best));
    if (originCaption) originCaption.textContent = `${String(best + 1).padStart(2, "0")} / ${String(originCards.length).padStart(2, "0")}`;
  }
  updateOrigins();

  /* ---------------- Дві полиці: вибір ---------------- */

  let choice = null;
  const pollBtns = $$("[data-choice]");
  const pollHint = $("[data-poll-hint]");
  const pollResult = $("[data-poll-result]");

  function refreshPollTexts() {
    if (choice && pollHint) pollHint.textContent = T[lang].pollHint[choice];
    if (choice && pollResult) pollResult.textContent = T[lang].pollResult[choice];
  }

  function choose(c) {
    choice = c;
    pollBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.choice === c)));
    if (pollResult) pollResult.hidden = false;
    refreshPollTexts();
    const target = $("#s-crack");
    window.setTimeout(() => {
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }, reduceMotion ? 200 : 700);
  }
  pollBtns.forEach((b) => { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => choose(b.dataset.choice)); });

  /* ---------------- Перший крек: 30 проти 900 ---------------- */

  const tally = $("[data-tally]");
  if (tally) {
    const nums = $$("[data-count]", tally);
    const bars = $$("[data-bar]", tally);
    const MAX = 900;
    const run = () => {
      if (reduceMotion) {
        bars.forEach((b) => { b.style.width = `${(parseFloat(b.dataset.bar) / MAX) * 100}%`; });
        tally.classList.add("is-cracked");
        return;
      }
      const dur = 2600;
      const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 2.2);
      const frame = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const kg = ease(p) * MAX; // однакова «швидкість продажу» для обох полиць
        nums.forEach((n) => { n.textContent = String(Math.round(Math.min(parseFloat(n.dataset.count), kg))); });
        bars.forEach((b) => { b.style.width = `${(Math.min(parseFloat(b.dataset.bar), kg) / MAX) * 100}%`; });
        if (p < 1) requestAnimationFrame(frame); else tally.classList.add("is-cracked");
      };
      nums.forEach((n) => { n.textContent = "0"; });
      requestAnimationFrame(frame);
    };
    if ("IntersectionObserver" in window) {
      const tio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(); tio.disconnect(); } });
      }, { threshold: 0.5 });
      tio.observe(tally);
    } else run();
  }

  /* ---------------- Лабораторія: відгук → профіль ---------------- */

  const BASE = [[0, 200], [0.5, 140], [1, 105], [1.5, 92], [2.5, 110], [3.5, 130], [4.5, 152], [5.5, 165], [6.5, 176], [7.5, 186], [8.5, 196], [9.5, 202], [10.5, 207]];
  const PROFILES = {
    bitter: { fc: 8.5, pts: [...BASE.slice(0, 11), [9.0, 199], [9.6, 201]] },
    sour: { fc: 8.5, pts: [...BASE.slice(0, 11), [9.9, 203], [11.3, 210]] },
    flat: { fc: 9.2, pts: [...BASE.slice(0, 7), [5.8, 164], [7.0, 175], [8.1, 186], [9.2, 196], [10.2, 202], [11.2, 206]] }
  };
  const PX = (t) => 40 + (t / 12) * 430;
  const PY = (Tc) => 40 + (200 - Tc) * 1.4;
  const toXY = (pts) => pts.map(([t, Tc]) => [PX(t), PY(Tc)]);
  const profBase = $("[data-profile-base]");
  const profNew = $("[data-profile-new]");
  const profEnd = $("[data-profile-end]");
  const fcLine = $("[data-fc-line]");
  const fcLabel = $("[data-fc-label]");
  const labAnswer = $("[data-lab-answer]");
  const chips = $$("[data-fb]");
  let currentFb = "bitter";
  if (profBase) profBase.setAttribute("d", smooth(toXY(BASE)));

  function updateLab(fb, silent) {
    currentFb = fb;
    const prof = PROFILES[fb];
    if (!prof) return;
    const xy = toXY(prof.pts);
    if (profNew) profNew.setAttribute("d", smooth(xy));
    const end = xy[xy.length - 1];
    if (profEnd) { profEnd.setAttribute("cx", end[0].toFixed(1)); profEnd.setAttribute("cy", end[1].toFixed(1)); }
    const fx = PX(prof.fc);
    if (fcLine) { fcLine.setAttribute("x1", fx); fcLine.setAttribute("x2", fx); }
    if (fcLabel) fcLabel.setAttribute("x", fx);
    if (labAnswer) labAnswer.textContent = T[lang].lab[fb];
    chips.forEach((c) => c.setAttribute("aria-selected", String(c.dataset.fb === fb)));
    if (!silent && labAnswer && !reduceMotion) {
      labAnswer.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
    }
  }
  chips.forEach((c) => c.addEventListener("click", () => updateLab(c.dataset.fb)));
  chips.forEach((c, idx) => c.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = chips[(idx + (e.key === "ArrowRight" ? 1 : chips.length - 1)) % chips.length];
    n.focus(); updateLab(n.dataset.fb);
  }));

  /* ---------------- Старт ---------------- */

  $$("[data-language]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.language)));

  renderPhaseLabels();
  updateLab("bitter", true);
  refreshPollTexts();
  measure();

  let initial = "uk";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    initial = q || localStorage.getItem("medelin-lang") || "uk";
  } catch (e) { /* ігноруємо */ }
  if (initial === "ru") setLang("ru"); else update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { measure(); update(); });
  window.addEventListener("load", () => { measure(); update(); });
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { measure(); onScroll(); });
    ro.observe(document.body);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); update(); });
})();
