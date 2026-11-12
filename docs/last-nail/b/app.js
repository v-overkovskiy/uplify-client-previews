(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-concept-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const note = form.querySelector('.form-note');
      note.textContent = 'This concept form is not connected. Please call (437) 377-7737.';
      note.focus?.();
    });
  });

  const heroSelect = document.querySelector('#estimate select[name="need"]');
  document.querySelectorAll('[data-need]').forEach(button => button.addEventListener('click', () => {
    heroSelect.value = button.dataset.need;
    document.querySelector('#estimate').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => heroSelect.focus(), reduceMotion ? 0 : 450);
  }));

  const scrub = document.querySelector('.scrub');
  const scrubVideo = scrub.querySelector('video');
  const progressBar = scrub.querySelector('.scrub-progress i');
  const captions = [...scrub.querySelectorAll('.scrub-captions p')];
  let target = 0, smooth = 0, velocity = 0, loaded = false, duration = 0;
  const loadScrub = () => {
    if (loaded || reduceMotion) return;
    loaded = true;
    scrubVideo.src = innerWidth <= 700 ? scrubVideo.dataset.mobile : scrubVideo.dataset.desktop;
    scrubVideo.load();
    scrubVideo.addEventListener('loadedmetadata', () => { duration = scrubVideo.duration || 0; }, { once: true });
  };
  if (!reduceMotion) {
    const near = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { loadScrub(); near.disconnect(); } }, { rootMargin: '100% 0px' });
    near.observe(scrub);
    addEventListener('scroll', () => {
      const rect = scrub.getBoundingClientRect();
      target = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    }, { passive: true });
    const tick = () => {
      const force = (target - smooth) * 0.12;
      velocity = (velocity + force) * 0.72;
      smooth += velocity;
      if (duration && Math.abs(scrubVideo.currentTime - smooth * duration) > .025) scrubVideo.currentTime = smooth * duration;
      progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, smooth))})`;
      const index = Math.min(captions.length - 1, Math.floor(Math.max(0, Math.min(.999, smooth)) * captions.length));
      captions.forEach((caption, i) => caption.classList.toggle('active', i === index));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', selected);
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  const steps = [...document.querySelectorAll('.process-steps li')];
  const stageImages = [...document.querySelectorAll('.process-stage > img')];
  const stageLabel = document.querySelector('.stage-label');
  const titles = ['Inspect the visible conditions','Open and expose the working area','Place membrane and drainage','Complete the interior surface'];
  const setStage = index => {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    stageImages.forEach((image, i) => image.classList.toggle('active', i === index));
    stageLabel.innerHTML = `<span>0${index + 1} / 04</span><strong>${titles[index]}</strong>`;
  };
  steps.forEach((step, index) => {
    step.addEventListener('click', () => setStage(index));
    step.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setStage(index); } });
  });
  if (!reduceMotion) {
    const stepObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setStage(steps.indexOf(entry.target));
    }), { rootMargin: '-35% 0px -55%' });
    steps.forEach(step => stepObserver.observe(step));
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const galleryItems = [...document.querySelectorAll('.gallery-grid button')];
  filters.forEach(filter => filter.addEventListener('click', () => {
    filters.forEach(item => item.classList.toggle('active', item === filter));
    galleryItems.forEach(item => item.hidden = filter.dataset.filter !== 'all' && item.dataset.category !== filter.dataset.filter);
  }));

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox.querySelector('figure img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  let visibleItems = [], currentIndex = 0, opener = null;
  const showImage = index => {
    visibleItems = galleryItems.filter(item => !item.hidden);
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex], thumb = item.querySelector('img');
    lightboxImage.src = thumb.src.replace('-640.webp', '.webp');
    lightboxImage.alt = thumb.alt;
    lightboxCaption.textContent = item.dataset.caption;
  };
  galleryItems.forEach(item => item.addEventListener('click', () => {
    opener = item; visibleItems = galleryItems.filter(entry => !entry.hidden); showImage(visibleItems.indexOf(item)); lightbox.showModal();
  }));
  const closeLightbox = () => { lightbox.close(); opener?.focus(); };
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  const videoFilters = [...document.querySelectorAll('[data-video-filter]')];
  const videoCards = [...document.querySelectorAll('[data-video-card]')];
  videoFilters.forEach(button => button.addEventListener('click', () => {
    videoFilters.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    videoCards.forEach(card => {
      card.hidden = button.dataset.videoFilter !== 'all' && card.dataset.videoCategory !== button.dataset.videoFilter;
      if (card.hidden) card.querySelector('video')?.pause();
    });
  }));

  document.querySelectorAll('.video-play[data-video-src]').forEach(button => button.addEventListener('click', () => {
    const media = button.closest('[data-video-media]');
    const poster = media?.querySelector('img')?.getAttribute('src') || '';
    if (!media) return;
    document.querySelectorAll('.video-track video').forEach(video => video.pause());
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = poster;
    video.width = 720;
    video.height = 1280;
    video.setAttribute('aria-label', button.getAttribute('aria-label')?.replace('Play video:', 'Video:') || 'Project video');
    video.src = button.dataset.videoSrc;
    video.addEventListener('play', () => document.querySelectorAll('.video-track video').forEach(other => { if (other !== video) other.pause(); }));
    media.replaceChildren(video);
    video.play().catch(() => {});
  }));
})();
