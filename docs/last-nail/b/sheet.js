(() => {
  'use strict';

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;

  const registrationMarkup = '<span></span><span></span><span></span><span></span>';
  const addRegistration = (element) => {
    if (!element || element.querySelector(':scope > .sheet-registration')) return;
    const marks = document.createElement('div');
    marks.className = 'sheet-registration';
    marks.setAttribute('aria-hidden', 'true');
    marks.innerHTML = registrationMarkup;
    element.prepend(marks);
  };

  document.querySelectorAll([
    '.hero > .wrap',
    '.segments > .wrap',
    '.services > .wrap',
    '.explainer > .wrap',
    '.gallery > .wrap',
    '.video-strip > .wrap',
    '.reviews > .wrap',
    '.faq > .wrap',
    '.final-cta > .wrap'
  ].join(',')).forEach(addRegistration);

  const createDetail = (target, modifier, viewBox, contents) => {
    if (!target) return null;
    const detail = document.createElement('div');
    detail.className = `sheet-detail ${modifier}`;
    detail.dataset.draw = '';
    detail.setAttribute('aria-hidden', 'true');
    detail.innerHTML = `<svg viewBox="${viewBox}" focusable="false">${contents}</svg>`;
    target.append(detail);
    return detail;
  };

  createDetail(
    document.querySelector('.hero-visual'),
    'sheet-detail--dimension',
    '0 0 200 34',
    '<path data-stroke pathLength="1" d="M8 21H192M8 14V28M192 14V28M8 21l8-4M8 21l8 4M192 21l-8-4M192 21l-8 4"/>' +
    '<path data-stroke data-accent pathLength="1" d="M74 21H126"/><text x="100" y="10" text-anchor="middle">PLAN / TORONTO + GTA</text>'
  );

  const servicePanels = document.querySelectorAll('.service-panel');
  createDetail(
    servicePanels[0],
    'sheet-detail--slab',
    '0 0 160 112',
    '<path data-stroke pathLength="1" d="M13 18H147V82H13ZM47 18V82M92 18V82M13 52H147M47 52l18-18 27 18-27 18zM104 27l28 28M110 21l28 28M104 67l28-28"/>' +
    '<path data-stroke data-accent pathLength="1" d="M70 43l8-13 8 13-4 12v17h-8V55z"/><text x="13" y="103">D-01 SLAB REMOVAL</text>'
  );
  createDetail(
    servicePanels[1],
    'sheet-detail--wall',
    '0 0 160 112',
    '<path data-stroke pathLength="1" d="M30 12H75V82H118V98H18V82H55V12M75 20h18v62M93 32h40M93 40h34M113 72a10 10 0 1 0 0 20 10 10 0 1 0 0-20M20 78l25-12M38 62l7 4-2 8"/>' +
    '<path data-stroke data-accent pathLength="1" stroke-dasharray="3 3" d="M80 18V78"/><text x="18" y="108">W-01 WALL SECTION</text>'
  );

  document.querySelectorAll('.diagram-panel').forEach((panel, index) => {
    const marker = document.createElement('span');
    marker.className = 'sheet-section-marker';
    marker.dataset.draw = '';
    marker.textContent = index === 0 ? 'A' : 'B';
    marker.setAttribute('aria-hidden', 'true');
    panel.append(marker);
  });

  const addGridNotation = (grid) => {
    if (!grid) return;
    addRegistration(grid);
    const scale = document.createElement('div');
    scale.className = 'sheet-scale';
    scale.setAttribute('aria-hidden', 'true');
    scale.innerHTML = '<span>0</span><span>1</span><span></span><span>2 m</span>';
    grid.append(scale);
  };
  addGridNotation(document.querySelector('.gallery-grid'));
  addGridNotation(document.querySelector('.video-grid'));

  const footer = document.querySelector('footer');
  if (footer) {
    const titleBlock = document.createElement('div');
    titleBlock.className = 'drawing-title-block';
    titleBlock.setAttribute('aria-label', 'Drawing title block');
    titleBlock.innerHTML =
      '<div><b>Project</b><span>Last Nail Demolition and Waterproofing</span></div>' +
      '<div><b>Location</b><span>Toronto + GTA, ON</span></div>' +
      '<div class="sheet-cell"><b>Sheet</b><span>10 / 10</span></div>' +
      '<div><b>Scale</b><span>N.T.S.</span></div>' +
      '<div><b>Drawn by</b><span>Last Nail</span></div>';
    footer.append(titleBlock);
  }

  const ruler = document.createElement('aside');
  ruler.className = 'elevation-ruler';
  ruler.setAttribute('aria-hidden', 'true');
  ruler.innerHTML =
    '<span class="ruler-datum" style="top:4%">GRADE ±0.00</span>' +
    '<span class="ruler-datum" style="top:13%">SLAB -0.15</span>' +
    '<span class="ruler-datum" style="top:71%">BASEMENT FLOOR -2.20</span>' +
    '<span class="ruler-datum" style="top:87%">FOOTING -2.40</span>' +
    '<div class="ruler-marker"><span>EL. ±0.00 m</span></div>';
  for (let pixels = 0; pixels <= 1800; pixels += 200) {
    const label = document.createElement('span');
    label.className = 'ruler-number';
    label.style.top = `${pixels + 3}px`;
    label.textContent = pixels === 0 ? '0.00' : `-${(pixels / 500).toFixed(2)}`;
    ruler.append(label);
  }
  document.body.append(ruler);

  const marker = ruler.querySelector('.ruler-marker');
  const markerLabel = marker.querySelector('span');
  const measuredContainer = document.querySelector('.wrap');
  const drawTargets = [...document.querySelectorAll('[data-draw]')];
  const nearViewport = new Set();
  let frame = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const updateRulerVisibility = () => {
    const rulerWidth = parseFloat(getComputedStyle(ruler).width) || 0;
    const freeGutter = measuredContainer?.getBoundingClientRect().left || 0;
    ruler.classList.toggle('is-visible', freeGutter >= rulerWidth + 8);
  };
  const update = () => {
    frame = 0;
    updateRulerVisibility();
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pageProgress = reducedMotion ? 0 : clamp(scrollY / maxScroll, 0, 1);
    const markerY = reducedMotion ? 80 : 80 + pageProgress * Math.max(0, innerHeight - 160);
    marker.style.transform = `translate3d(0, ${markerY}px, 0)`;
    const elevation = pageProgress * -2.4;
    markerLabel.textContent = pageProgress < .002 ? 'EL. ±0.00 m' : `EL. ${elevation.toFixed(2)} m`;

    if (reducedMotion) {
      drawTargets.forEach(target => target.style.setProperty('--dash', '0'));
      return;
    }

    nearViewport.forEach(target => {
      const rect = target.getBoundingClientRect();
      const travel = innerHeight * .45 + rect.height * .5;
      const progress = clamp((innerHeight * .9 - rect.top) / Math.max(1, travel), 0, 1);
      target.style.setProperty('--dash', String(1 - progress));
    });
  };

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) nearViewport.add(entry.target);
        else nearViewport.delete(entry.target);
      });
      requestUpdate();
    }, { rootMargin: '75% 0px 75% 0px' });
    drawTargets.forEach(target => observer.observe(target));
  } else {
    drawTargets.forEach(target => nearViewport.add(target));
  }

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  motionPreference.addEventListener?.('change', event => {
    reducedMotion = event.matches;
    requestUpdate();
  });
  requestUpdate();
})();
