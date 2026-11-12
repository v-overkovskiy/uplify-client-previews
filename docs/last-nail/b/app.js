(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const estimateForm = document.querySelector('#estimate');
  const needSelect = estimateForm.querySelector('select[name="need"]');

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
  const scrubVideo = scrub.querySelector('video');
  const progressBar = scrub.querySelector('.scrub-progress i');
  const captions = [...scrub.querySelectorAll('.scrub-captions p')];
  let target = 0;
  let smooth = 0;
  let velocity = 0;
  let loaded = false;
  let duration = 0;

  const setCaption = progress => {
    const index = Math.min(captions.length - 1, Math.floor(Math.max(0, Math.min(.999, progress)) * captions.length));
    captions.forEach((caption, position) => caption.classList.toggle('active', position === index));
  };
  const loadScrub = () => {
    if (loaded || reduceMotion) return;
    loaded = true;
    scrubVideo.src = innerWidth <= 700 ? scrubVideo.dataset.mobile : scrubVideo.dataset.desktop;
    scrubVideo.load();
    scrubVideo.addEventListener('loadedmetadata', () => { duration = scrubVideo.duration || 0; }, { once: true });
  };
  if (!reduceMotion) {
    const near = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      loadScrub();
      near.disconnect();
    }, { rootMargin: '100% 0px' });
    near.observe(scrub);
    const updateTarget = () => {
      const rect = scrub.getBoundingClientRect();
      target = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    };
    addEventListener('scroll', updateTarget, { passive: true });
    updateTarget();
    const tick = () => {
      const force = (target - smooth) * .12;
      velocity = (velocity + force) * .72;
      smooth += velocity;
      const safeProgress = Math.max(0, Math.min(1, smooth));
      if (duration && Math.abs(scrubVideo.currentTime - safeProgress * duration) > .025) scrubVideo.currentTime = safeProgress * duration;
      progressBar.style.transform = `scaleX(${safeProgress})`;
      setCaption(safeProgress);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const steps = [...document.querySelectorAll('.process-steps li')];
  const stageImages = [...document.querySelectorAll('.process-stage > img')];
  const stageLabel = document.querySelector('.stage-label');
  const stageTitles = ['Inspect the visible conditions', 'Open and expose the working area', 'Place membrane and drainage', 'Complete the interior surface'];
  const setStage = index => {
    steps.forEach((step, position) => classToggle(step, 'active', position === index));
    stageImages.forEach((image, position) => classToggle(image, 'active', position === index));
    stageLabel.innerHTML = `<span>0${index + 1} / 04</span><strong>${stageTitles[index]}</strong>`;
  };
  const classToggle = (element, className, state) => element.classList.toggle(className, state);
  steps.forEach((step, index) => {
    step.addEventListener('click', () => setStage(index));
    step.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setStage(index);
    });
  });
  if (!reduceMotion) {
    const stepObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setStage(steps.indexOf(entry.target));
    }), { rootMargin: '-35% 0px -55%' });
    steps.forEach(step => stepObserver.observe(step));
  }

  const createCollapsibleGrid = ({ grid, items, toggle, noun, countItem = () => true }) => {
    let expanded = false;
    let candidates = [...items];
    const columns = () => Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length);
    const update = () => {
      const limit = columns() * 3;
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
