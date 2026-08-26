(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const searchButton = document.querySelector('.search-toggle');
  const searchPanel = document.querySelector('#search-panel');

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
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (mobileMenu && !mobileMenu.hidden) setPanel(menuButton, mobileMenu, 'menu-open', false);
    if (searchPanel && !searchPanel.hidden) setPanel(searchButton, searchPanel, 'search-open', false);
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
  document.querySelector('.mobile-filter-button')?.addEventListener('click', () => {
    filterRail?.classList.add('is-open');
    filterRail?.querySelector('input,button')?.focus();
  });
  document.querySelector('.filter-close')?.addEventListener('click', () => filterRail?.classList.remove('is-open'));

  const products = [...document.querySelectorAll('#catalog-grid .product-card')];
  const categoryInputs = [...document.querySelectorAll('input[name="category"]')];
  const applyFilters = () => {
    const active = document.querySelector('input[name="category"]:checked')?.value || 'all';
    let count = 0;
    products.forEach((product) => {
      const show = active === 'all' || product.dataset.category === active;
      product.hidden = !show;
      if (show) count += 1;
    });
    const label = `${count} ${count === 1 ? 'товар' : count < 5 ? 'товари' : 'товарів'}`;
    const toolbar = document.querySelector('#toolbar-count');
    const result = document.querySelector('#result-count');
    if (toolbar) toolbar.textContent = label;
    if (result) result.textContent = label;
  };
  categoryInputs.forEach((input) => input.addEventListener('change', applyFilters));

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
