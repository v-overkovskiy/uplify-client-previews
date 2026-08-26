(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const searchButton = document.querySelector('.search-toggle');
  const searchPanel = document.querySelector('#search-panel');
  const catalogMenuButton = document.querySelector('.mega-menu-toggle');
  const catalogMegaMenu = document.querySelector('#catalog-mega-menu');

  const setPanel = (button, panel, className, open) => {
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    body.classList.toggle(className, open);
    if (open) {
      const target = panel.querySelector('input, a, button');
      if (target) requestAnimationFrame(() => target.focus());
    } else button.focus();
  };

  menuButton?.addEventListener('click', () => setPanel(menuButton, mobileMenu, 'menu-open', mobileMenu.hidden));
  searchButton?.addEventListener('click', () => setPanel(searchButton, searchPanel, 'search-open', searchPanel.hidden));
  catalogMenuButton?.addEventListener('click', () => {
    if (!catalogMegaMenu) return;
    setPanel(catalogMenuButton, catalogMegaMenu, 'catalog-menu-open', catalogMegaMenu.hidden);
  });
  document.addEventListener('click', (event) => {
    if (!catalogMegaMenu || catalogMegaMenu.hidden) return;
    if (catalogMenuButton?.contains(event.target) || catalogMegaMenu.contains(event.target)) return;
    setPanel(catalogMenuButton, catalogMegaMenu, 'catalog-menu-open', false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (mobileMenu && !mobileMenu.hidden) setPanel(menuButton, mobileMenu, 'menu-open', false);
    if (searchPanel && !searchPanel.hidden) setPanel(searchButton, searchPanel, 'search-open', false);
    if (catalogMegaMenu && !catalogMegaMenu.hidden) setPanel(catalogMenuButton, catalogMegaMenu, 'catalog-menu-open', false);
    if (filterRail?.classList.contains('is-open')) setFilterDrawer(false);
  });

  document.querySelectorAll('.filter-group > button').forEach((button) => {
    button.addEventListener('click', () => {
      const options = button.nextElementSibling;
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('span').textContent = open ? '+' : '−';
      options.hidden = open;
    });
  });

  const filterRail = document.querySelector('#filter-rail');
  const filterButton = document.querySelector('.mobile-filter-button');
  const filterClose = document.querySelector('.filter-close');
  const setFilterDrawer = (open) => {
    if (!filterRail || !filterButton) return;
    filterRail.classList.toggle('is-open', open);
    filterButton.setAttribute('aria-expanded', String(open));
    body.classList.toggle('filter-open', open);
    if (open) filterClose?.focus();
    else filterButton.focus();
  };
  filterButton?.addEventListener('click', () => setFilterDrawer(true));
  filterClose?.addEventListener('click', () => setFilterDrawer(false));

  const products = [...document.querySelectorAll('#catalog-grid .product-card')];
  const categoryInputs = [...document.querySelectorAll('input[name="category"]')];
  const colorInputs = [...document.querySelectorAll('input[name="color"]')];
  const priceInputs = [...document.querySelectorAll('input[name="price"]')];
  const sortSelect = document.querySelector('select[aria-label="Сортування"]');
  const listingBanner = document.querySelector('.listing-banner');
  products.forEach((product, index) => { product.dataset.originalOrder = String(index); });

  const matchesPrice = (price, range) => {
    if (!price) return false;
    if (range === 'under1200') return price < 1200;
    if (range === '1200-1600') return price >= 1200 && price <= 1600;
    if (range === 'over1600') return price > 1600;
    return true;
  };

  const applySort = () => {
    const mode = sortSelect?.value || 'featured';
    const sorted = [...products].sort((a, b) => {
      const originalDelta = Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
      if (mode === 'featured' || mode === 'newest') return originalDelta;
      const aPrice = Number(a.dataset.price) || Number.POSITIVE_INFINITY;
      const bPrice = Number(b.dataset.price) || Number.POSITIVE_INFINITY;
      if (mode === 'price-asc') return aPrice - bPrice || originalDelta;
      const safeA = Number.isFinite(aPrice) ? aPrice : Number.NEGATIVE_INFINITY;
      const safeB = Number.isFinite(bPrice) ? bPrice : Number.NEGATIVE_INFINITY;
      return safeB - safeA || originalDelta;
    });
    sorted.forEach((product, index) => { product.style.order = String(index < 4 ? index + 1 : index + 2); });
    if (listingBanner) listingBanner.style.order = '5';
  };

  const applyFilters = () => {
    const active = document.querySelector('input[name="category"]:checked')?.value || 'all';
    const activeColors = colorInputs.filter((input) => input.checked).map((input) => input.value);
    const activePrices = priceInputs.filter((input) => input.checked).map((input) => input.value);
    let count = 0;
    products.forEach((product) => {
      const price = Number(product.dataset.price);
      const categoryMatch = active === 'all' || product.dataset.category === active;
      const colorMatch = !activeColors.length || activeColors.includes(product.dataset.color);
      const priceMatch = !activePrices.length || activePrices.some((range) => matchesPrice(price, range));
      const show = categoryMatch && colorMatch && priceMatch;
      product.hidden = !show;
      if (show) count += 1;
    });
    const label = `${count} ${count === 1 ? 'товар' : count < 5 ? 'товари' : 'товарів'}`;
    const toolbar = document.querySelector('#toolbar-count');
    const result = document.querySelector('#result-count');
    if (toolbar) toolbar.textContent = label;
    if (result) result.textContent = label;
    applySort();
  };
  [...categoryInputs, ...colorInputs, ...priceInputs].forEach((input) => input.addEventListener('change', applyFilters));
  sortSelect?.addEventListener('change', applySort);
  document.querySelector('.filter-reset')?.addEventListener('click', () => {
    const allCategories = document.querySelector('input[name="category"][value="all"]');
    if (allCategories) allCategories.checked = true;
    [...colorInputs, ...priceInputs].forEach((input) => { input.checked = false; });
    applyFilters();
  });

  if (body.dataset.page === 'catalog') {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const titles = { headwear: 'Головні убори', bags: 'Сумки', accessories: 'Аксесуари', new: 'Новий сезон' };
    if (filter && filter !== 'new') {
      const input = document.querySelector(`input[name="category"][value="${filter}"]`);
      if (input) input.checked = true;
    }
    const title = document.querySelector('#catalog-title');
    if (title && titles[filter]) title.innerHTML = filter === 'new' ? 'Новий <em>сезон</em>' : titles[filter];
    applyFilters();
  }

  const getCartQuantity = () => Number(localStorage.getItem('jojo-demo-cart') ?? '1');
  const setCartQuantity = (quantity) => {
    const safe = Math.max(0, Math.min(9, quantity));
    localStorage.setItem('jojo-demo-cart', String(safe));
    document.querySelectorAll('.cart-count').forEach((node) => node.textContent = String(safe));
    return safe;
  };
  setCartQuantity(getCartQuantity());

  const toast = (message) => {
    let node = document.querySelector('.toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast';
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add('is-visible');
    window.setTimeout(() => node.classList.remove('is-visible'), 3200);
  };
  document.querySelectorAll('.add-to-cart').forEach((button) => button.addEventListener('click', () => {
    setCartQuantity(Math.max(1, getCartQuantity()));
    toast('Берет додано до демонстраційного кошика');
  }));

  const updateCart = (quantity) => {
    const q = setCartQuantity(quantity);
    const filled = document.querySelector('#cart-filled');
    const empty = document.querySelector('#cart-empty');
    if (filled) filled.hidden = q === 0;
    if (empty) empty.hidden = q !== 0;
    document.querySelector('#cart-quantity')?.replaceChildren(String(q));
    const price = q * 1190;
    const formatted = `${price.toLocaleString('uk-UA')} грн`;
    ['#line-total', '#subtotal', '#cart-total'].forEach((selector) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = formatted;
    });
  };
  if (body.dataset.page === 'cart') {
    updateCart(getCartQuantity());
    document.querySelector('[data-quantity="minus"]')?.addEventListener('click', () => updateCart(getCartQuantity() - 1));
    document.querySelector('[data-quantity="plus"]')?.addEventListener('click', () => updateCart(getCartQuantity() + 1));
    document.querySelector('.remove-item')?.addEventListener('click', () => updateCart(0));
    document.querySelector('.checkout-demo')?.addEventListener('click', () => toast('У preview checkout не відкривається і замовлення не створюється'));
  }

  const primaryBuyButton = document.querySelector('.pdp-buybox .add-to-cart');
  const mobileBuybar = document.querySelector('.mobile-buybar');
  if (primaryBuyButton && mobileBuybar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => mobileBuybar.classList.toggle('is-visible', !entry.isIntersecting), { threshold: 0 });
    observer.observe(primaryBuyButton);
  }
})();
