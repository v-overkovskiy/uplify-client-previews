(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (new URLSearchParams(location.search).get('scrubdebug') === '1') window.__SCRUB_DEBUG = true;

  const setupLazyScrubber = (section, start) => {
    if (!section || reduceMotion) return;
    let started = false;
    let checkFrame = 0;
    let observer;

    const cleanup = () => {
      observer?.disconnect();
      removeEventListener('scroll', queueCheck);
      removeEventListener('resize', queueCheck);
      window.visualViewport?.removeEventListener('resize', queueCheck);
      removeEventListener('load', queueCheck);
    };
    const check = () => {
      checkFrame = 0;
      if (started) return;
      const rect = section.getBoundingClientRect();
      const margin = innerHeight * 2.5;
      if (rect.bottom < -margin || rect.top > innerHeight + margin) return;
      started = true;
      cleanup();
      start();
    };
    function queueCheck() {
      if (!checkFrame && !started) checkFrame = requestAnimationFrame(check);
    }

    addEventListener('scroll', queueCheck, { passive: true });
    addEventListener('resize', queueCheck, { passive: true });
    window.visualViewport?.addEventListener('resize', queueCheck, { passive: true });
    addEventListener('load', queueCheck, { once: true });
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) check();
      }, { rootMargin: '250% 0px' });
      observer.observe(section);
    }
    check();
  };

  const estimateForm = document.querySelector('#estimate');
  const needSelect = estimateForm.querySelector('select[name="need"]');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.section-head, .service-panel, .diagram-panel, .reviews-grid, .faq details');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealTargets.forEach(targetElement => {
      targetElement.classList.add('reveal-ready');
      revealObserver.observe(targetElement);
    });
  }

  document.querySelectorAll('[data-concept-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const note = form.querySelector('.form-note');
      note.textContent = 'This concept form is not connected. Please call (437) 377-7737.';
      note.focus();
    });
  });

  const chooseNeed = value => {
    needSelect.value = value;
    estimateForm.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => needSelect.focus(), reduceMotion ? 0 : 400);
  };
  document.querySelectorAll('[data-need]').forEach(button => button.addEventListener('click', () => chooseNeed(button.dataset.need)));
  document.querySelectorAll('[data-service-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    chooseNeed(link.dataset.serviceLink);
  }));

  const scrub = document.querySelector('.scrub');
  const scrubCanvas = scrub.querySelector('.scrub-canvas');
  const scrubPoster = scrub.querySelector('.scrub-fallback');
  const progressBar = scrub.querySelector('.scrub-progress i');
  const captions = [...scrub.querySelectorAll('.scrub-captions p')];
  const storyChips = [...scrub.querySelectorAll('[data-story-chip]')];
  const storyData = JSON.parse(scrub.querySelector('[data-story-chapters]')?.textContent || '{"count":0,"chapters":[]}');
  const storyChapters = storyData.chapters || [];
  let storyScrubber = null;
  let target = 0;
  let smooth = 0;
  let velocity = 0;
  let scrubActive = false;
  let lastFrame = performance.now();
  let captionIndex = Math.max(0, captions.findIndex(caption => caption.classList.contains('active')));
  let captionPendingIndex = captionIndex;
  let captionIsExiting = false;

  const activateCaption = index => {
    captions.forEach((caption, position) => caption.classList.toggle('active', position === index));
    storyChips.forEach((chip, position) => chip.setAttribute('aria-current', String(position === index)));
    captionIndex = index;
  };

  const setCaption = frameIndex => {
    const foundIndex = storyChapters.findIndex((chapter, index) => frameIndex >= chapter.startFrame && (index === storyChapters.length - 1 || frameIndex < storyChapters[index + 1].startFrame));
    const index = foundIndex < 0 ? captions.length - 1 : foundIndex;
    captionPendingIndex = index;

    if (reduceMotion) {
      activateCaption(index);
      return;
    }

    if (captionIsExiting || index === captionIndex) return;
    captionIsExiting = true;
    captions[captionIndex]?.classList.remove('active');

    window.setTimeout(() => {
      activateCaption(captionPendingIndex);
      captionIsExiting = false;
    }, 150);
  };

  const startStoryScrubber = () => {
    if (!scrubCanvas || !scrubPoster || typeof window.FrameScrubber !== 'function') return;
    const compact = matchMedia('(max-width: 899px)').matches || navigator.connection?.saveData;
    try {
      storyScrubber = new window.FrameScrubber({
        canvas: scrubCanvas,
        poster: scrubPoster,
        base: '../assets/frames/story',
        manifest: '../assets/frames/story/story.json',
        sizeKey: compact ? '540' : '720',
        maxDpr: 2,
        concurrency: 6,
        fit: 'cover',
        position: 'center',
        onFrame: setCaption
      });
      storyScrubber.setProgress(smooth);
      storyScrubber.start();
    } catch (_error) {
      storyScrubber = null;
    }
  };

  if (!reduceMotion) {
    const updateTarget = () => {
      const rect = scrub.getBoundingClientRect();
      const travel = Math.max(1, scrub.offsetHeight - window.innerHeight);
      target = Math.max(0, Math.min(1, -rect.top / travel));
      scrubActive = rect.bottom > 0 && rect.top < innerHeight;
    };
    addEventListener('scroll', updateTarget, { passive: true });
    addEventListener('resize', updateTarget, { passive: true });
    window.visualViewport?.addEventListener('resize', updateTarget, { passive: true });
    document.fonts?.ready?.then(updateTarget);
    updateTarget();
    smooth = target;
    setupLazyScrubber(scrub, startStoryScrubber);
    const tick = now => {
      const dt = Math.min(.032, Math.max(.001, (now - lastFrame) / 1000));
      lastFrame = now;
      if (scrubActive) {
        const omega = 18;
        const acceleration = omega * omega * (target - smooth) - 2 * omega * velocity;
        velocity += acceleration * dt;
        smooth += velocity * dt;
        const safeProgress = Math.max(0, Math.min(1, smooth));
        storyScrubber?.setProgress(safeProgress);
        progressBar.style.transform = `scaleX(${safeProgress})`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  storyChips.forEach((chip, index) => chip.addEventListener('click', () => {
    const chapter = storyChapters[index];
    if (!chapter) return;
    const rect = scrub.getBoundingClientRect();
    const sectionTop = scrollY + rect.top;
    const travel = Math.max(1, scrub.offsetHeight - innerHeight);
    const chapterProgress = chapter.startFrame / Math.max(1, storyData.count - 1);
    scrollTo({ top: sectionTop + chapterProgress * travel, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  const filmSection = document.querySelector('[data-film-scrub]');
  const filmCanvas = filmSection?.querySelector('.film-process__canvas');
  const filmPoster = filmSection?.querySelector('.film-process__poster');
  const filmProgress = filmSection?.querySelector('[data-film-progress]');
  const filmCaptions = [...(filmSection?.querySelectorAll('[data-film-caption]') || [])];
  const filmChips = [...(filmSection?.querySelectorAll('[data-film-chip]') || [])];
  const filmData = JSON.parse(filmSection?.querySelector('[data-film-chapters]')?.textContent || '{"count":361,"chapters":[]}');
  const filmChapters = filmData.chapters || [];
  let filmScrubber = null;
  let filmTarget = 0;
  let filmValue = 0;
  let filmVelocity = 0;
  let filmFrame = 0;
  let filmLastFrame = performance.now();
  let filmCaptionIndex = Math.max(0, filmCaptions.findIndex(caption => caption.classList.contains('is-active')));
  let filmCaptionPendingIndex = filmCaptionIndex;
  let filmCaptionIsExiting = false;

  const readFilmState = () => {
    if (!filmSection) return false;
    const rect = filmSection.getBoundingClientRect();
    const travel = Math.max(1, rect.height - innerHeight);
    filmTarget = Math.max(0, Math.min(1, -rect.top / travel));
    return rect.bottom > 0 && rect.top < innerHeight;
  };

  const activateFilmCaption = index => {
    filmCaptions.forEach((caption, position) => caption.classList.toggle('is-active', position === index));
    filmChips.forEach((chip, position) => {
      if (position === index) chip.setAttribute('aria-current', 'step');
      else chip.removeAttribute('aria-current');
    });
    filmCaptionIndex = index;
  };

  const setFilmCaption = frameIndex => {
    if (!filmCaptions.length) return;
    const foundIndex = filmChapters.findIndex((chapter, index) => frameIndex >= chapter.startFrame && (index === filmChapters.length - 1 || frameIndex < filmChapters[index + 1].startFrame));
    const index = foundIndex < 0 ? filmCaptions.length - 1 : foundIndex;
    filmCaptionPendingIndex = index;
    if (index === filmCaptionIndex || filmCaptionIsExiting) return;
    filmCaptionIsExiting = true;
    filmCaptions[filmCaptionIndex]?.classList.remove('is-active');
    window.setTimeout(() => {
      activateFilmCaption(filmCaptionPendingIndex);
      filmCaptionIsExiting = false;
    }, 150);
  };

  const startFilmScrubber = () => {
    if (!filmCanvas || !filmPoster || typeof window.FrameScrubber !== 'function') return;
    const phone = matchMedia('(max-width: 899px)').matches;
    const compact = phone || navigator.connection?.saveData;
    try {
      filmScrubber = new window.FrameScrubber({
        canvas: filmCanvas,
        poster: filmPoster,
        base: '../assets/frames/film',
        manifest: '../assets/frames/film/film.json',
        sizeKey: compact ? '854' : '1280',
        maxDpr: 2,
        concurrency: 6,
        fit: phone ? 'contain' : 'cover',
        position: 'center',
        onFrame: setFilmCaption
      });
      filmScrubber.setProgress(filmValue);
      filmScrubber.start();
    } catch (_error) {
      filmScrubber = null;
    }
  };

  const drawFilmFrame = now => {
    filmFrame = 0;
    const visible = readFilmState();
    if (!visible || document.hidden || reduceMotion) return;
    const dt = Math.min(.032, Math.max(.001, (now - filmLastFrame) / 1000));
    filmLastFrame = now;
    const omega = 18;
    const acceleration = omega * omega * (filmTarget - filmValue) - 2 * omega * filmVelocity;
    filmVelocity += acceleration * dt;
    filmValue = Math.max(0, Math.min(1, filmValue + filmVelocity * dt));
    const moving = Math.abs(filmTarget - filmValue) > .0005 || Math.abs(filmVelocity) > .0005;
    if (!moving) {
      filmValue = filmTarget;
      filmVelocity = 0;
    }
    filmScrubber?.setProgress(filmValue);
    filmProgress.style.transform = `scaleX(${filmValue})`;
    if (moving) filmFrame = requestAnimationFrame(drawFilmFrame);
  };

  const wakeFilm = () => {
    const visible = readFilmState();
    if (!visible || document.hidden || reduceMotion || filmFrame) return;
    filmLastFrame = performance.now();
    filmFrame = requestAnimationFrame(drawFilmFrame);
  };

  if (!reduceMotion) {
    readFilmState();
    filmValue = filmTarget;
    setupLazyScrubber(filmSection, startFilmScrubber);
    addEventListener('scroll', wakeFilm, { passive: true });
    addEventListener('resize', wakeFilm, { passive: true });
    window.visualViewport?.addEventListener('resize', wakeFilm, { passive: true });
    document.addEventListener('visibilitychange', wakeFilm);
    document.fonts?.ready?.then(wakeFilm);
    wakeFilm();
  }

  filmChips.forEach((chip, index) => chip.addEventListener('click', () => {
    const chapter = filmChapters[index];
    if (!chapter) return;
    const rect = filmSection.getBoundingClientRect();
    const sectionTop = scrollY + rect.top;
    const travel = Math.max(1, rect.height - innerHeight);
    const chapterProgress = chapter.startFrame / Math.max(1, filmData.count - 1);
    scrollTo({ top: sectionTop + chapterProgress * travel, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  const classToggle = (element, className, state) => element.classList.toggle(className, state);

  const createCollapsibleGrid = ({ grid, items, toggle, noun, countItem = () => true }) => {
    let expanded = false;
    let candidates = [...items];
    const columns = () => Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length);
    const update = () => {
      const maxRows = Math.max(1, Number.parseInt(grid.dataset.maxRows, 10) || 3);
      const limit = columns() * maxRows;
      candidates.forEach((item, index) => {
        item.hidden = !expanded && index >= limit;
        if (item.hidden) item.querySelector('video')?.pause();
      });
      const count = candidates.filter(countItem).length;
      const needsToggle = candidates.length > limit;
      toggle.hidden = !needsToggle;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Show fewer' : `Show all ${count} ${noun}`;
    };
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      update();
      if (!expanded) grid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    new ResizeObserver(update).observe(grid);
    return {
      filter(predicate) {
        expanded = false;
        items.forEach(item => { item.hidden = true; });
        candidates = items.filter(predicate);
        update();
      },
      update
    };
  };

  const galleryItems = [...document.querySelectorAll('.gallery-grid > button')];
  const galleryCollapse = createCollapsibleGrid({
    grid: document.querySelector('#gallery-grid'),
    items: galleryItems,
    toggle: document.querySelector('#gallery-toggle'),
    noun: 'photos'
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(filter => filter.addEventListener('click', () => {
    filters.forEach(item => {
      const active = item === filter;
      classToggle(item, 'active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    galleryCollapse.filter(item => filter.dataset.filter === 'all' || item.dataset.category === filter.dataset.filter);
  }));
  galleryCollapse.update();

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox.querySelector('figure img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  let visibleItems = [];
  let currentIndex = 0;
  let opener = null;
  const showImage = index => {
    visibleItems = galleryItems.filter(item => !item.hidden);
    if (!visibleItems.length) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex];
    const thumb = item.querySelector('img');
    lightboxImage.src = thumb.src.replace('-640.webp', '.webp');
    lightboxImage.alt = thumb.alt;
    lightboxCaption.textContent = item.dataset.caption;
  };
  galleryItems.forEach(item => item.addEventListener('click', () => {
    opener = item;
    visibleItems = galleryItems.filter(entry => !entry.hidden);
    showImage(visibleItems.indexOf(item));
    lightbox.showModal();
  }));
  const closeLightbox = () => {
    lightbox.close();
    opener?.focus();
  };
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  const videoCards = [...document.querySelectorAll('[data-video-card]')];
  const videoCollapse = createCollapsibleGrid({
    grid: document.querySelector('#video-grid'),
    items: videoCards,
    toggle: document.querySelector('#video-toggle'),
    noun: 'videos',
    countItem: item => item.dataset.placeholder !== 'true'
  });
  const videoFilters = [...document.querySelectorAll('[data-video-filter]')];
  videoFilters.forEach(button => button.addEventListener('click', () => {
    videoFilters.forEach(item => {
      const active = item === button;
      classToggle(item, 'active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    videoCollapse.filter(card => button.dataset.videoFilter === 'all' || card.dataset.videoCategory === button.dataset.videoFilter);
  }));
  videoCollapse.update();

  document.querySelectorAll('.video-play[data-video-src]').forEach(button => button.addEventListener('click', () => {
    const media = button.closest('[data-video-media]');
    if (!media) return;
    const poster = media.querySelector('img')?.getAttribute('src') || '';
    document.querySelectorAll('.video-grid video').forEach(video => video.pause());
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.poster = poster;
    video.width = 720;
    video.height = 1280;
    video.setAttribute('aria-label', button.getAttribute('aria-label')?.replace('Play video:', 'Video:') || 'Project video');
    video.src = button.dataset.videoSrc;
    video.addEventListener('play', () => document.querySelectorAll('.video-grid video').forEach(other => { if (other !== video) other.pause(); }));
    media.replaceChildren(video);
    video.play().catch(() => {});
  }));
})();
