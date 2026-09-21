(() => {
  const header = document.querySelector('.site-header');
  const mega = document.querySelector('#mega-menu');
  const catalogButton = document.querySelector('[data-interaction-id="INT-MEGA"]');
  const mobilePanel = document.querySelector('#mobile-panel');
  const mobileButton = document.querySelector('[data-interaction-id="INT-MOBILE-MENU"]');
  const toast = document.querySelector('.toast');
  let lastTrigger = null;
  let toastTimer = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    const heroImage = document.querySelector('.hero__image');
    heroImage?.animate(
      [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }],
      { duration: 1800, easing: 'cubic-bezier(.22,.8,.28,1)' }
    );

    const heroHeading = document.querySelector('.hero h1');
    heroHeading?.animate(
      [{ opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(20px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' }],
      { duration: 760, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
    );

    document.querySelectorAll('.hero__copy > *:not(h1)').forEach((element, index) => {
      element.animate(
        [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 560, delay: 340 + index * 70, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
      );
    });

    document.querySelector('.hero__route-fill')?.animate(
      [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }],
      { duration: 1250, delay: 620, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
    );
    const routeTrack = document.querySelector('.hero__route');
    const routeSignal = document.querySelector('.hero__route-signal');
    if (routeTrack && routeSignal) {
      const travel = Math.max(0, routeTrack.clientWidth - routeSignal.offsetWidth);
      routeSignal.animate(
        [{ transform: 'translate3d(0,0,0) rotate(45deg)', opacity: 0 }, { opacity: 1, offset: .12 }, { transform: `translate3d(${travel}px,0,0) rotate(45deg)`, opacity: 1 }],
        { duration: 1500, delay: 560, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
      );
    }

    const axleMap = document.querySelector('.axle-map');
    const axleObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelector('.route-line')?.animate(
          [{ strokeDasharray: 520, strokeDashoffset: 520, opacity: .25 }, { strokeDasharray: 520, strokeDashoffset: 0, opacity: 1 }],
          { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }
        );
        entry.target.querySelectorAll('.axle-choice').forEach((choice, index) => {
          choice.animate(
            [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 480, delay: 160 + index * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
          );
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.28 });
    if (axleMap) axleObserver.observe(axleMap);

    const engineeringStage = document.querySelector('.engineering__image');
    const engineeringObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelector('img')?.animate(
          [{ transform: 'scale(1.08) translateY(22px)', filter: 'grayscale(1) contrast(1.12) blur(5px)' }, { transform: 'scale(1) translateY(0)', filter: 'grayscale(1) contrast(1.12) blur(0)' }],
          { duration: 820, easing: 'cubic-bezier(.16,1,.3,1)' }
        );
        observer.unobserve(entry.target);
      });
    }, { threshold: .35 });
    if (engineeringStage) engineeringObserver.observe(engineeringStage);
  }

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
  };

  const closeMega = (restore = false) => {
    if (!mega || mega.hidden) return;
    mega.hidden = true;
    catalogButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restore && lastTrigger) lastTrigger.focus();
  };

  const closeMobile = (restore = false) => {
    if (!mobilePanel || mobilePanel.hidden) return;
    mobilePanel.hidden = true;
    mobileButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restore && lastTrigger) lastTrigger.focus();
  };

  catalogButton?.addEventListener('click', () => {
    const willOpen = mega.hidden;
    closeMobile();
    mega.hidden = !willOpen;
    catalogButton.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('menu-open', willOpen);
    lastTrigger = catalogButton;
  });

  mobileButton?.addEventListener('click', () => {
    const willOpen = mobilePanel.hidden;
    closeMega();
    mobilePanel.hidden = !willOpen;
    mobileButton.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('menu-open', willOpen);
    lastTrigger = mobileButton;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMega(true);
      closeMobile(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) closeMega();
    const toastTarget = event.target.closest('[data-toast]');
    if (toastTarget) showToast(toastTarget.dataset.toast);
  });

  document.querySelectorAll('.mega-menu a, .mobile-panel a').forEach((link) => {
    link.addEventListener('click', () => { closeMega(); closeMobile(); });
  });

  const axisLabels = {
    steer: 'Кермова вісь',
    drive: 'Ведуча вісь',
    trailer: 'Причіпна вісь'
  };
  const setAxis = (axis) => {
    document.querySelectorAll('[data-axis]').forEach((button) => {
      const active = button.dataset.axis === axis;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const result = document.querySelector('#axis-result-text');
    if (result && axisLabels[axis]) result.textContent = axisLabels[axis];
  };
  document.querySelectorAll('[data-axis]').forEach((button) => button.addEventListener('click', () => setAxis(button.dataset.axis)));
  document.querySelectorAll('[data-axis-jump]').forEach((link) => link.addEventListener('click', () => setAxis(link.dataset.axisJump)));

  document.querySelector('.site-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('У робочому магазині пошук працюватиме за розміром, виробником і моделлю.');
  });

  document.querySelector('.fleet-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Форму заповнено. У цьому приватному концепті дані не надсилаються.');
  });
})();
