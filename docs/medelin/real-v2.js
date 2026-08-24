(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const notice = $('#notice');
  let noticeTimer;

  const showNotice = (message) => {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.add('is-visible');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => notice.classList.remove('is-visible'), 3600);
  };

  const closePanel = (button, panel) => {
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };

  const megaButton = $('[data-mega]');
  const mega = $('#mega');
  const mobileButton = $('[data-mobile-menu]');
  const mobileNav = $('#mobile-nav');

  megaButton?.addEventListener('click', () => {
    const open = megaButton.getAttribute('aria-expanded') === 'true';
    closePanel(mobileButton, mobileNav);
    megaButton.setAttribute('aria-expanded', String(!open));
    mega.hidden = open;
    document.body.classList.toggle('mega-open', !open);
  });

  mobileButton?.addEventListener('click', () => {
    const open = mobileButton.getAttribute('aria-expanded') === 'true';
    closePanel(megaButton, mega);
    document.body.classList.remove('mega-open');
    mobileButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closePanel(megaButton, mega);
    closePanel(mobileButton, mobileNav);
    document.body.classList.remove('mega-open');
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('[data-mega], #mega')) {
      closePanel(megaButton, mega);
      document.body.classList.remove('mega-open');
    }
  });

  const laneData = {
    green: {
      theme: 'green',
      label: 'Зелена лінійка',
      title: 'Знайомий еспресо без різкої кислотності.',
      copy: 'Для автомата, рожка і ранку, коли не хочеться експериментувати.',
      link: '?page=pdp&sku=italiano',
      action: 'Espresso Italiano, 223 грн'
    },
    specialty: {
      theme: 'yellow',
      label: 'Жовта лінійка',
      title: 'Лот, який хочеться розібрати на відтінки.',
      copy: 'Для тих, хто шукає квіти, фрукти, карамель і нове походження зерна.',
      link: '?page=pdp&sku=nicaragua',
      action: 'Nicaragua SHG, 301 грн'
    },
    filter: {
      theme: 'orange',
      label: 'Помаранчева лінійка',
      title: 'Легка чашка для повільного приготування.',
      copy: 'Для V60, кемекса та моментів, коли аромат важить не менше за міцність.',
      link: '?page=pdp&sku=ethiopia',
      action: 'Ethiopia Sidamo, 322 грн'
    }
  };

  $$('.lane').forEach((lane) => {
    lane.addEventListener('click', () => {
      $$('.lane').forEach((item) => {
        const active = item === lane;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const data = laneData[lane.dataset.lane];
      if (!data) return;
      const ticket = $('.lane-ticket');
      ticket.classList.remove('lane-ticket--green', 'lane-ticket--yellow', 'lane-ticket--orange');
      ticket.classList.add(`lane-ticket--${data.theme}`);
      $('#lane-ticket-label').textContent = data.label;
      $('#lane-ticket-title').textContent = data.title;
      $('#lane-ticket-copy').textContent = data.copy;
      const link = $('#lane-ticket-link');
      link.href = data.link;
      link.innerHTML = `${data.action} <span aria-hidden="true">↗</span>`;
    });
  });

  const methodData = {
    espresso: {
      title: 'Щільна чашка з кремою',
      copy: 'Шукайте шоколад, карамель і горіх. Зелена лінійка добре працює в автоматі та рожковій кавоварці.',
      link: '?page=listing&line=green',
      action: 'Кава для еспресо',
      image: 'assets/source/italiano.jpg',
      alt: 'Espresso Italiano'
    },
    filter: {
      title: 'Прозорий смак і більше аромату',
      copy: 'Шукайте фруктові, квіткові та цитрусові відтінки. Помаранчева лінійка створена для повільного проливу.',
      link: '?page=listing&line=filter',
      action: 'Кава для фільтра',
      image: 'assets/source/ethiopia.jpg',
      alt: 'Ethiopia Sidamo Gr1'
    },
    turka: {
      title: 'Насичена кава без зайвої різкості',
      copy: 'Для турки добре пасують шоколадні та пряні профілі з низькою кислотністю.',
      link: '?page=pdp&sku=malabar',
      action: 'India Monsooned Malabar',
      image: 'assets/source/malabar.jpg',
      alt: 'India Monsooned Malabar'
    }
  };

  $$('[data-method]').forEach((button) => {
    button.addEventListener('click', () => {
      const data = methodData[button.dataset.method];
      if (!data) return;
      $$('[data-method]').forEach((item) => item.classList.toggle('is-active', item === button));
      $('#method-title').textContent = data.title;
      $('#method-copy').textContent = data.copy;
      const link = $('#method-link');
      link.href = data.link;
      link.innerHTML = `${data.action} <span aria-hidden="true">↗</span>`;
      const image = $('#method-image');
      image.src = data.image;
      image.alt = data.alt;
    });
  });

  $$('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = $('input', form)?.value.trim();
      showNotice(query ? `Пошук «${query}» працюватиме через каталог Horoshop.` : 'Введіть назву кави або країну.');
    });
  });

  $$('[data-notice]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      showNotice(control.dataset.notice);
    });
  });

  const products = {
    italiano: { line: 'Еспресо', theme: 'green', title: 'Espresso Italiano', taste: 'Темний шоколад, карамель, гранат.', price: '223 грн', image: 'assets/source/italiano.jpg' },
    nicaragua: { line: 'Specialty', theme: 'yellow', title: 'Nicaragua SHG', taste: 'Квіти, карамель, винний відтінок.', price: '301 грн', image: 'assets/source/nicaragua.jpg' },
    ethiopia: { line: 'Фільтр specialty', theme: 'orange', title: 'Ethiopia Sidamo Gr1', taste: 'Шоколад, спеції, стиглі фрукти.', price: '322 грн', image: 'assets/source/ethiopia.jpg' },
    malabar: { line: 'Еспресо · низька кислотність', theme: 'green', title: 'India Monsooned Malabar', taste: 'Карамель, спеції, насичене тіло.', price: 'від 306 грн', image: 'assets/source/malabar.jpg' }
  };

  const params = new URLSearchParams(location.search);
  const page = params.get('page') || 'home';
  const homeView = $('#home-view');
  const listingView = $('#listing-view');
  const pdpView = $('#pdp-view');

  if (page === 'listing') {
    homeView.hidden = true;
    listingView.hidden = false;
    const line = params.get('line');
    if (line) {
      $$('.listing-tabs a').forEach((tab) => tab.classList.toggle('is-active', tab.href.includes(`line=${line}`)));
      const classMap = { green: 'green', specialty: 'yellow', filter: 'orange' };
      $$('.listing-item').forEach((item) => {
        const expected = classMap[line];
        item.hidden = expected ? !item.classList.contains(`listing-item--${expected}`) : false;
      });
    }
  } else if (page === 'pdp') {
    homeView.hidden = true;
    pdpView.hidden = false;
    const data = products[params.get('sku')] || products.italiano;
    const pack = $('.pdp-pack');
    pack.classList.remove('pdp-pack--green', 'pdp-pack--yellow', 'pdp-pack--orange', 'pdp-pack--teal');
    pack.classList.add(`pdp-pack--${data.theme}`);
    $('#pdp-line').textContent = data.line;
    $('#pdp-title').textContent = data.title;
    $('#pdp-taste').textContent = data.taste;
    $('#pdp-price').textContent = data.price;
    const image = $('#pdp-image');
    image.src = data.image;
    image.alt = data.title;
  }

  $$('.pdp-options button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.pdp-options button').forEach((item) => item.classList.toggle('is-active', item === button));
    });
  });
})();
