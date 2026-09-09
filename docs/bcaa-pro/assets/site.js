(() => {
  const body = document.body;
  const menu = document.querySelector('[data-menu-dialog]');
  const menuOpen = document.querySelector('[data-menu-open]');
  const menuClose = document.querySelector('[data-menu-close]');
  const searchPanels = document.querySelectorAll('[data-search-toggle]');
  const searchPanel = document.querySelector('#site-search');
  const searchInput = document.querySelector('#search-input');
  const toast = document.querySelector('[data-toast]');
  let toastTimer;

  const showToast = () => {
    if (!toast) return;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4600);
  };

  if (menu && menuOpen && menuClose) {
    menuOpen.addEventListener('click', () => {
      menu.showModal();
      body.classList.add('menu-open');
      menuClose.focus();
    });

    const closeMenu = () => {
      menu.close();
      body.classList.remove('menu-open');
      menuOpen.focus();
    };

    menuClose.addEventListener('click', closeMenu);
    menu.addEventListener('click', (event) => {
      if (event.target === menu) closeMenu();
    });
    menu.addEventListener('close', () => body.classList.remove('menu-open'));
  }

  searchPanels.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      if (!searchPanel) return;
      const open = searchPanel.classList.toggle('is-open');
      searchPanels.forEach((item) => item.setAttribute('aria-expanded', String(open)));
      if (open) {
        searchInput?.focus();
        searchPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  });

  const goalCopy = {
    mass: {
      label: 'набір маси',
      title: 'Для набору маси',
      copy: 'Почніть з протеїну та креатину, а потім порівняйте формат, вагу й ціну.'
    },
    endurance: {
      label: 'витривалість',
      title: 'Для витривалості',
      copy: 'Перейдіть до ізотоніків, вуглеводів та амінокислот і порівняйте доступні варіанти.'
    },
    recovery: {
      label: 'відновлення',
      title: 'Для відновлення',
      copy: 'Колаген, комплекси для суглобів та амінокислоти зібрані в окремий маршрут.'
    },
    wellbeing: {
      label: 'щоденне самопочуття',
      title: 'На щодень',
      copy: 'Вітаміни, мінерали та інші щоденні категорії без зайвого пошуку по всьому каталогу.'
    }
  };

  const catalogGrid = document.querySelector('[data-catalog-grid]');
  if (catalogGrid) {
    const sort = document.querySelector('[data-sort]');
    const filters = [...document.querySelectorAll('[data-filter]')];
    const brands = [...document.querySelectorAll('[data-brand]')];
    const count = document.querySelector('[data-result-count]');
    const cards = [...catalogGrid.querySelectorAll('.product-card')];

    const updateCatalog = () => {
      const selectedTypes = filters.filter((input) => input.checked).map((input) => input.value);
      const selectedBrands = brands.filter((input) => input.checked).map((input) => input.value);
      const visible = cards.filter((card) => selectedTypes.includes(card.dataset.type) && selectedBrands.includes(card.dataset.brandName));
      cards.forEach((card) => { card.hidden = !visible.includes(card); });
      if (sort?.value === 'asc') visible.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
      if (sort?.value === 'desc') visible.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
      if (sort?.value === 'default') visible.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
      visible.forEach((card) => catalogGrid.append(card));
      if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'товар' : 'товари'}`;
    };

    [...filters, ...brands].forEach((input) => input.addEventListener('change', updateCatalog));
    sort?.addEventListener('change', updateCatalog);
    updateCatalog();

    const params = new URLSearchParams(location.search);
    const goal = params.get('goal');
    const catalogTitle = document.querySelector('[data-catalog-title]');
    const catalogCopy = document.querySelector('[data-catalog-copy]');
    const catalogRoute = document.querySelector('[data-catalog-route]');
    if (goal && goalCopy[goal]) {
      if (catalogTitle) catalogTitle.textContent = goalCopy[goal].title;
      if (catalogCopy) catalogCopy.textContent = 'Почніть з релевантної категорії або порівняйте товари нижче за форматом, вагою та ціною.';
      if (catalogRoute) catalogRoute.textContent = `Маршрут: ${goalCopy[goal].label}`;
    }
  }

  document.querySelectorAll('[data-demo-cart]').forEach((button) => {
    button.addEventListener('click', showToast);
  });

  const mobileBuybar = document.querySelector('[data-mobile-buybar]');
  const buybox = document.querySelector('[data-buybox]');
  if (mobileBuybar && buybox && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      mobileBuybar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }, { threshold: 0.08 });
    observer.observe(buybox);
  }
})();
