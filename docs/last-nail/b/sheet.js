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

  const addGridLine = (group, axis, position, length, index) => {
    const major = index % 4 === 0;
    const line = createSvgElement('line', axis === 'vertical'
      ? { x1: position, y1: 0, x2: position, y2: length, pathLength: 1 }
      : { x1: 0, y1: position, x2: length, y2: position, pathLength: 1 });
    line.classList.add('sheet-grid-line', major ? 'sheet-grid-line--major' : 'sheet-grid-line--minor');
    group.append(line);
    return { element: line, axis, index, major, order: 0, progress: reducedMotion ? 1 : 0 };
  };

  const assignDrawOrder = (lines) => {
    [...lines]
      .sort((a, b) => Number(b.major) - Number(a.major)
        || Number(a.axis === 'horizontal') - Number(b.axis === 'horizontal')
        || a.index - b.index)
      .forEach((line, order) => { line.order = order; });
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
    const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const cssCell = innerWidth <= 700
      ? rootSize * 4
      : clamp(innerWidth * .07, rootSize * 5, rootSize * 8);
    const lineLimit = innerWidth <= 700 ? 34 : 60;
    let cell = cssCell;
    let verticalCount = Math.floor(width / cell) + 1;
    let horizontalCount = Math.floor(height / cell) + 1;
    while (verticalCount + horizontalCount > lineLimit) {
      cell *= 1.08;
      verticalCount = Math.floor(width / cell) + 1;
      horizontalCount = Math.floor(height / cell) + 1;
    }

    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    overlay.setAttribute('width', width);
    overlay.setAttribute('height', height);
    overlay.replaceChildren();

    const lineGroup = createSvgElement('g');
    const crossGroup = createSvgElement('g');
    overlay.append(lineGroup, crossGroup);

    const vertical = [];
    const horizontal = [];
    for (let index = 0; index < verticalCount; index += 1) {
      vertical.push(addGridLine(lineGroup, 'vertical', index * cell, height, index));
    }
    for (let index = 0; index < horizontalCount; index += 1) {
      horizontal.push(addGridLine(lineGroup, 'horizontal', index * cell, width, index));
    }
    assignDrawOrder([...vertical, ...horizontal]);

    const sectionRect = section.getBoundingClientRect();
    const textBoxes = collectTextBoxes(section, sectionRect);
    const crosses = [];
    let intersectionIndex = 0;
    const majorVertical = vertical.filter(line => line.major);
    const majorHorizontal = horizontal.filter(line => line.major);
    majorHorizontal.forEach(horizontalLine => {
      majorVertical.forEach(verticalLine => {
        const x = verticalLine.index * cell;
        const y = horizontalLine.index * cell;
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
  let activeUntil = 0;
  const updateRulerVisibility = () => {
    const rulerWidth = parseFloat(getComputedStyle(ruler).width) || 0;
    const freeGutter = measuredContainer?.getBoundingClientRect().left || 0;
    ruler.classList.toggle('is-visible', freeGutter >= rulerWidth + 8);
  };

  const updateGrid = () => {
    const lineWrites = [];
    const markWrites = [];
    const models = reducedMotion ? gridModels : activeGridModels;

    models.forEach(model => {
      if (!model.vertical || !model.horizontal) return;
      const rect = model.section.getBoundingClientRect();
      const rangeDistance = innerHeight * (rect.height > innerHeight * 1.5 ? 1.2 : .85);
      const sectionProgress = reducedMotion ? 1 : clamp(
        (innerHeight * 1.05 - rect.top) / rangeDistance,
        0,
        1
      );
      const maxOrder = Math.max(1, model.lineCount - 1);

      [...model.vertical, ...model.horizontal].forEach(line => {
        const start = line.order / maxOrder * .72;
        const linearProgress = clamp((sectionProgress - start) / .28, 0, 1);
        const progress = reducedMotion ? 1 : 1 - (1 - linearProgress) ** 3;
        line.progress = progress;
        lineWrites.push([line.element, 1 - progress]);
      });

      model.crosses.forEach(cross => {
        const lineProgress = Math.min(cross.verticalLine.progress, cross.horizontalLine.progress);
        const progress = reducedMotion ? 1 : clamp((lineProgress - .9) / .1, 0, 1);
        markWrites.push([cross.element, progress]);
      });
      const originLinearProgress = clamp(sectionProgress / .08, 0, 1);
      const originProgress = reducedMotion ? 1 : 1 - (1 - originLinearProgress) ** 3;
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
    updateRulerVisibility();
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pageProgress = reducedMotion ? 0 : clamp(scrollY / maxScroll, 0, 1);
    const markerY = reducedMotion ? 80 : 80 + pageProgress * Math.max(0, innerHeight - 160);
    marker.style.transform = `translate3d(0, ${markerY}px, 0)`;
    const elevation = pageProgress * -2.4;
    updateGrid();
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

  const runFrame = (time) => {
    frame = 0;
    update();
    if (time < activeUntil) frame = requestAnimationFrame(runFrame);
  };

  const requestUpdate = (keepAlive = false) => {
    if (keepAlive) activeUntil = performance.now() + 120;
    if (!frame) frame = requestAnimationFrame(runFrame);
  };

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
