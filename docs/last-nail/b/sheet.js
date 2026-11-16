(() => {
  'use strict';

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const svgNamespace = 'http://www.w3.org/2000/svg';

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

  const gridModels = [];
  const gridModelBySection = new Map();
  const activeGridModels = new Set();
  const gridSections = [...document.querySelectorAll('main > section')];
  const darkGridSelector = '#system, #process, .final-cta';

  const createSvgElement = (name, attributes = {}) => {
    const element = document.createElementNS(svgNamespace, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  const getSectionCode = (section, index) => {
    const match = section.querySelector('.index-tag')?.textContent.match(/\b(\d{2})\b/);
    return match?.[1] || String(index + 1).padStart(2, '0');
  };

  const addGridLine = (group, axis, position, length, index, gridIndex = index) => {
    const major = Math.abs(gridIndex) % 4 === 0;
    const line = createSvgElement('line', axis === 'vertical'
      ? { x1: position, y1: 0, x2: position, y2: length, pathLength: 1 }
      : { x1: 0, y1: position, x2: length, y2: position, pathLength: 1 });
    line.classList.add('sheet-grid-line', major ? 'sheet-grid-line--major' : 'sheet-grid-line--minor');
    group.append(line);
    return { element: line, axis, index, gridIndex, position, major, progress: reducedMotion ? 1 : 0 };
  };

  const collectTextBoxes = (section, sectionRect) => [...section.querySelectorAll([
    'h1', 'h2', 'h3', 'p', 'a', 'button', 'label', 'summary', 'li',
    '.form-head', '.film-process__heading', '.film-process__panel'
  ].join(','))]
    .filter(element => !element.closest('.sheet-grid-overlay'))
    .map(element => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - sectionRect.left - 14,
        right: rect.right - sectionRect.left + 14,
        top: rect.top - sectionRect.top - 10,
        bottom: rect.bottom - sectionRect.top + 10
      };
    });

  const buildGrid = (model) => {
    const { section, overlay } = model;
    const width = Math.max(1, section.clientWidth);
    const height = Math.max(1, section.offsetHeight);
    const cell = innerWidth >= 1100 ? 160 : innerWidth >= 700 ? 128 : 96;
    const sectionRect = section.getBoundingClientRect();
    const pageTop = scrollY + sectionRect.top;
    const pageLeft = sectionRect.left;
    const firstX = ((cell - (pageLeft % cell)) % cell);
    const firstY = ((cell - (pageTop % cell)) % cell);
    const firstVerticalIndex = Math.round((pageLeft + firstX) / cell);
    const firstHorizontalIndex = Math.round((pageTop + firstY) / cell);

    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    overlay.setAttribute('width', width);
    overlay.setAttribute('height', height);
    overlay.replaceChildren();

    const lineGroup = createSvgElement('g');
    const crossGroup = createSvgElement('g');
    overlay.append(lineGroup, crossGroup);

    const vertical = [];
    const horizontal = [];
    for (let index = 0, x = firstX; x <= width; index += 1, x += cell) {
      vertical.push(addGridLine(lineGroup, 'vertical', x, height, index, firstVerticalIndex + index));
    }
    for (let index = 0, y = firstY; y <= height; index += 1, y += cell) {
      horizontal.push(addGridLine(lineGroup, 'horizontal', y, width, index, firstHorizontalIndex + index));
    }

    const textBoxes = collectTextBoxes(section, sectionRect);
    const crosses = [];
    let intersectionIndex = 0;
    const majorVertical = vertical.filter(line => line.major);
    const majorHorizontal = horizontal.filter(line => line.major);
    majorHorizontal.forEach(horizontalLine => {
      majorVertical.forEach(verticalLine => {
        const x = verticalLine.position;
        const y = horizontalLine.position;
        const selected = intersectionIndex % 6 === 0;
        intersectionIndex += 1;
        if (!selected || crosses.length >= 6 || (x < 18 && y < 18)) return;
        const touchesText = textBoxes.some(box => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom);
        if (touchesText) return;
        const cross = createSvgElement('g', { class: 'sheet-grid-cross' });
        cross.append(createSvgElement('path', { d: `M${x - 6} ${y}H${x + 6}M${x} ${y - 6}V${y + 6}` }));
        crossGroup.append(cross);
        crosses.push({ element: cross, x, y, verticalLine, horizontalLine });
      });
    });

    const origin = createSvgElement('g', { class: 'sheet-grid-origin' });
    origin.append(createSvgElement('path', { d: 'M4 10H16M10 4V16M7 7L13 13M13 7L7 13' }));
    const originLabel = createSvgElement('text', { x: 22, y: 13 });
    originLabel.textContent = `SECTION ${model.code} / ORIGIN`;
    origin.append(originLabel);
    crossGroup.append(origin);

    model.width = width;
    model.height = height;
    model.cell = cell;
    model.vertical = vertical;
    model.horizontal = horizontal;
    model.crosses = crosses;
    model.origin = origin;
    model.lineCount = vertical.length + horizontal.length;

    if (reducedMotion) {
      [...vertical, ...horizontal].forEach(line => { line.element.style.strokeDashoffset = '0'; });
      crosses.forEach(cross => {
        cross.element.style.opacity = '1';
        cross.element.style.transform = 'scale(1)';
      });
      origin.style.opacity = '1';
      origin.style.transform = 'scale(1)';
    }
  };

  gridSections.forEach((section, index) => {
    section.classList.add('sheet-grid-section');
    if (section.matches(darkGridSelector)) section.classList.add('sheet-grid-section--dark');
    const overlay = createSvgElement('svg', {
      class: 'sheet-grid-overlay',
      'aria-hidden': 'true',
      focusable: 'false',
      preserveAspectRatio: 'none'
    });
    section.prepend(overlay);
    const model = { section, overlay, code: getSectionCode(section, index) };
    gridModels.push(model);
    gridModelBySection.set(section, model);
    buildGrid(model);
  });

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
  ruler.id = 'page-ruler';
  ruler.setAttribute('role', 'scrollbar');
  ruler.setAttribute('aria-label', 'Page depth');
  ruler.setAttribute('aria-controls', 'main');
  ruler.setAttribute('aria-orientation', 'vertical');
  ruler.setAttribute('aria-valuemin', '0');
  ruler.setAttribute('aria-valuemax', '100');
  ruler.innerHTML = '<div class="ruler-marker"><span>EL. ±0.00 m</span></div>';
  for (let index = 0; index <= 4; index += 1) {
    const label = document.createElement('span');
    label.className = 'ruler-number';
    label.style.top = `${index * 25}%`;
    label.textContent = index === 0 ? '0.00' : `-${(index * .6).toFixed(2)}`;
    ruler.append(label);
  }
  document.body.append(ruler);

  const marker = ruler.querySelector('.ruler-marker');
  const markerLabel = marker.querySelector('span');
  const rulerMedia = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  const drawTargets = [...document.querySelectorAll('[data-draw]')];
  const nearViewport = new Set();
  let frame = 0;
  let activeUntil = 0;
  let dragState = null;

  const syncRulerMode = () => {
    const active = rulerMedia.matches;
    ruler.tabIndex = active ? 0 : -1;
    ruler.setAttribute('aria-hidden', String(!active));
    requestUpdate();
  };

  const updateGrid = (modelReads, viewportHeight, pageY) => {
    const lineWrites = [];
    const markWrites = [];
    modelReads.forEach(({ model, rect }) => {
      if (!model.vertical || !model.horizontal) return;

      model.vertical.forEach(line => {
        const stagger = line.index * 40;
        const remaining = clamp((pageY - stagger) / Math.max(1, 700 - stagger), 0, 1);
        const progress = reducedMotion ? 1 : .35 + remaining * .65;
        line.progress = progress;
        lineWrites.push([line.element, 1 - progress]);
      });

      model.horizontal.forEach(line => {
        const viewportY = rect.top + line.position;
        const progress = reducedMotion ? 1 : clamp(
          (viewportHeight * .92 - viewportY) / (viewportHeight * .34),
          0,
          1
        );
        line.progress = progress;
        lineWrites.push([line.element, 1 - progress]);
      });

      model.crosses.forEach(cross => {
        const lineProgress = Math.min(cross.verticalLine.progress, cross.horizontalLine.progress);
        const progress = reducedMotion ? 1 : clamp((lineProgress - .9) / .1, 0, 1);
        markWrites.push([cross.element, progress]);
      });
      const originProgress = reducedMotion ? 1 : (model.horizontal[0]?.progress || 0);
      markWrites.push([model.origin, originProgress]);
    });

    lineWrites.forEach(([element, dashOffset]) => {
      element.style.strokeDashoffset = String(dashOffset);
    });
    markWrites.forEach(([element, progress]) => {
      element.style.opacity = String(progress);
      element.style.transform = `scale(${progress})`;
    });
  };

  const update = () => {
    const viewportHeight = innerHeight;
    const pageY = scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, pageHeight - viewportHeight);
    const pageProgress = maxScroll ? clamp(pageY / maxScroll, 0, 1) : 0;
    const models = reducedMotion ? gridModels : activeGridModels;
    const modelReads = [...models].map(model => ({ model, rect: model.section.getBoundingClientRect() }));
    const detailReads = reducedMotion ? [] : [...nearViewport].map(target => ({ target, rect: target.getBoundingClientRect() }));
    const headerHeight = innerWidth <= 700 ? 64 : 72;
    const trackHeight = Math.max(0, viewportHeight - headerHeight);
    const thumbHeight = Math.min(trackHeight, Math.max(28, trackHeight * viewportHeight / Math.max(viewportHeight, pageHeight)));
    const markerY = pageProgress * Math.max(0, trackHeight - thumbHeight);

    marker.style.setProperty('--thumb-h', `${thumbHeight}px`);
    marker.style.setProperty('--thumb-y', `${markerY}px`);
    const elevation = pageProgress * -2.4;
    markerLabel.textContent = pageProgress < .002 ? 'EL. ±0.00 m' : `EL. ${elevation.toFixed(2)} m`;
    ruler.setAttribute('aria-valuenow', String(Math.round(pageProgress * 100)));
    ruler.setAttribute('aria-valuetext', `${Math.round(pageProgress * 100)}%, elevation ${elevation.toFixed(2)} metres`);
    updateGrid(modelReads, viewportHeight, pageY);

    if (reducedMotion) {
      drawTargets.forEach(target => target.style.setProperty('--dash', '0'));
      return;
    }

    detailReads.forEach(({ target, rect }) => {
      const travel = viewportHeight * .45 + rect.height * .5;
      const progress = clamp((viewportHeight * .9 - rect.top) / Math.max(1, travel), 0, 1);
      target.style.setProperty('--dash', String(1 - progress));
    });
  };

  const runFrame = (time) => {
    frame = 0;
    update();
    if (time < activeUntil) frame = requestAnimationFrame(runFrame);
  };

  const requestUpdate = (keepAlive = false) => {
    if (keepAlive) activeUntil = performance.now() + 120;
    if (!frame) frame = requestAnimationFrame(runFrame);
  };

  const scrollToRulerPosition = (clientY, behavior = 'auto') => {
    if (!rulerMedia.matches) return;
    const rect = ruler.getBoundingClientRect();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const progress = clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    scrollTo({ top: progress * maxScroll, behavior });
  };

  marker.addEventListener('pointerdown', event => {
    if (!rulerMedia.matches || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const trackRect = ruler.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      trackTop: trackRect.top,
      trackHeight: trackRect.height,
      thumbHeight: markerRect.height,
      offset: event.clientY - markerRect.top
    };
    marker.setPointerCapture(event.pointerId);
  });
  marker.addEventListener('pointermove', event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const travel = Math.max(1, dragState.trackHeight - dragState.thumbHeight);
    const markerTop = clamp(event.clientY - dragState.trackTop - dragState.offset, 0, travel);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: markerTop / travel * maxScroll, behavior: 'auto' });
  });
  const endRulerDrag = event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (marker.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
    dragState = null;
  };
  marker.addEventListener('pointerup', endRulerDrag);
  marker.addEventListener('pointercancel', endRulerDrag);
  ruler.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('.ruler-marker')) return;
    scrollToRulerPosition(event.clientY, reducedMotion ? 'auto' : 'smooth');
  });
  ruler.addEventListener('keydown', event => {
    const pageStep = innerHeight * .9;
    const keyTargets = {
      ArrowUp: scrollY - 40,
      ArrowDown: scrollY + 40,
      PageUp: scrollY - pageStep,
      PageDown: scrollY + pageStep,
      Home: 0,
      End: document.documentElement.scrollHeight
    };
    if (!(event.key in keyTargets)) return;
    event.preventDefault();
    scrollTo({ top: keyTargets[event.key], behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  rulerMedia.addEventListener?.('change', syncRulerMode);
  syncRulerMode();

  if ('IntersectionObserver' in window) {
    const detailObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) nearViewport.add(entry.target);
        else nearViewport.delete(entry.target);
      });
      requestUpdate();
    }, { rootMargin: '75% 0px 75% 0px' });
    drawTargets.forEach(target => detailObserver.observe(target));

    const gridObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const model = gridModelBySection.get(entry.target);
        if (!model) return;
        if (entry.isIntersecting) activeGridModels.add(model);
        else activeGridModels.delete(model);
      });
      requestUpdate();
    }, { rootMargin: '100% 0px 100% 0px' });
    gridSections.forEach(section => gridObserver.observe(section));
  } else {
    drawTargets.forEach(target => nearViewport.add(target));
    gridModels.forEach(model => activeGridModels.add(model));
  }

  if ('ResizeObserver' in window) {
    const gridResizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const model = gridModelBySection.get(entry.target);
        if (model) buildGrid(model);
      });
      requestUpdate();
    });
    gridSections.forEach(section => gridResizeObserver.observe(section));
  }

  addEventListener('scroll', () => requestUpdate(true), { passive: true });
  addEventListener('resize', () => {
    if (!('ResizeObserver' in window)) gridModels.forEach(buildGrid);
    requestUpdate(true);
  }, { passive: true });
  motionPreference.addEventListener?.('change', event => {
    reducedMotion = event.matches;
    gridModels.forEach(buildGrid);
    requestUpdate();
  });
  requestUpdate();
})();
