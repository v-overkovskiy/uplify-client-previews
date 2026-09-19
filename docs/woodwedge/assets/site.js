const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const menu = $("#catalog-menu");
const menuToggles = $$('[data-menu-toggle]');
const searchPanel = $("#site-search");
const searchToggles = $$('[data-search-toggle]');
const searchInput = $("#site-search-input");

const setSearchState = (open) => {
  if (!searchPanel) return;
  searchPanel.classList.toggle("is-open", open);
  searchPanel.setAttribute("aria-hidden", String(!open));
  searchToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));
  if (open) {
    setMenuState(false);
    window.setTimeout(() => searchInput?.focus(), 80);
  }
};

const setMenuState = (open) => {
  if (!menu) return;
  menu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open && window.innerWidth < 881);
  menuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));
  if (open) setSearchState(false);
};

menuToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => setMenuState(!menu?.classList.contains("is-open")));
});

searchToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => setSearchState(!searchPanel?.classList.contains("is-open")));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
    setSearchState(false);
  }
});

document.addEventListener("click", (event) => {
  if (menu?.classList.contains("is-open") && !menu.contains(event.target) && !menuToggles.some((toggle) => toggle.contains(event.target))) {
    setMenuState(false);
  }
  if (searchPanel?.classList.contains("is-open") && !searchPanel.contains(event.target) && !searchToggles.some((toggle) => toggle.contains(event.target))) {
    setSearchState(false);
  }
});

const carousel = $("[data-space-carousel]");
if (carousel) {
  const cards = $$('[data-space-card]', carousel);
  const dots = $("[data-space-dots]", carousel);
  const previous = $("[data-space-prev]", carousel);
  const next = $("[data-space-next]", carousel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 2;
  let timer;

  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Добірка ${index + 1}`);
    dot.addEventListener("click", () => {
      active = index;
      render();
      restart();
    });
    dots?.append(dot);
  });

  const normalizedOffset = (index) => {
    let offset = index - active;
    if (offset > cards.length / 2) offset -= cards.length;
    if (offset < -cards.length / 2) offset += cards.length;
    return Math.max(-2, Math.min(2, offset));
  };

  const render = () => {
    cards.forEach((card, index) => {
      const position = normalizedOffset(index);
      card.dataset.position = String(position);
      card.setAttribute("aria-hidden", String(Math.abs(position) > 1));
      card.tabIndex = Math.abs(position) > 1 ? -1 : 0;
    });
    $$('button', dots).forEach((dot, index) => dot.setAttribute("aria-current", String(index === active)));
  };

  const move = (direction) => {
    active = (active + direction + cards.length) % cards.length;
    render();
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    if (reduceMotion) return;
    stop();
    timer = window.setInterval(() => move(1), 5200);
  };
  const restart = () => { stop(); start(); };

  previous?.addEventListener("click", () => { move(-1); restart(); });
  next?.addEventListener("click", () => { move(1); restart(); });
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); restart(); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); restart(); }
  });

  render();
  start();
}

const detailImage = $("#detail-gallery-image");
const detailLabel = $("#detail-gallery-label");
$$('[data-gallery-image]').forEach((button) => {
  button.addEventListener("click", () => {
    if (!detailImage || button.getAttribute("aria-selected") === "true") return;
    $$('[data-gallery-image]').forEach((item) => item.setAttribute("aria-selected", String(item === button)));
    detailImage.classList.add("is-changing");
    window.setTimeout(() => {
      detailImage.src = button.dataset.galleryImage;
      detailImage.alt = button.dataset.galleryAlt;
      if (detailLabel) detailLabel.textContent = button.dataset.galleryLabel || "";
      detailImage.classList.remove("is-changing");
    }, 180);
  });
});

const catalogGrid = $("#catalog-grid");
const catalogCount = $("#catalog-count");
if (catalogGrid) {
  const cards = $$('[data-category]', catalogGrid);
  const queryParameters = new URLSearchParams(location.search);
  const searchQuery = queryParameters.get("search")?.trim().toLocaleLowerCase("uk") || "";
  if (searchInput && searchQuery) searchInput.value = queryParameters.get("search").trim();
  const updateCatalog = (value) => {
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = value === "all" || card.dataset.category === value;
      const matchesSearch = !searchQuery || card.textContent.toLocaleLowerCase("uk").includes(searchQuery);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (catalogCount) catalogCount.textContent = searchQuery ? `За запитом «${queryParameters.get("search").trim()}»: ${visible}` : `Показано: ${visible}`;
    $$('[data-filter]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === value)));
  };
  $$('[data-filter]').forEach((button) => button.addEventListener("click", () => updateCatalog(button.dataset.filter)));
  const initial = queryParameters.get("category");
  updateCatalog(initial || "all");
}
