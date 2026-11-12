(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const header = document.querySelector("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-compact", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const primaryNeedSelect = document.querySelector("[data-need-select]");
  document.querySelectorAll("[data-need]").forEach((button) => {
    button.addEventListener("click", () => {
      if (primaryNeedSelect) primaryNeedSelect.value = button.dataset.need || "";
      document.querySelector("#estimate")?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => primaryNeedSelect?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 450);
    });
  });

  document.querySelectorAll("[data-concept-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = form.querySelector("[data-form-note]");
      if (!note) return;
      note.textContent = "Concept form only — no request was sent.";
      note.classList.add("is-sent");
    });
    form.addEventListener("input", () => {
      const note = form.querySelector("[data-form-note]");
      if (!note?.classList.contains("is-sent")) return;
      note.textContent = "Concept form — not connected.";
      note.classList.remove("is-sent");
    });
  });

  const scrubSection = document.querySelector("[data-scrub]");
  const scrubVideo = scrubSection?.querySelector(".scrub-video");
  const scrubProgress = scrubSection?.querySelector("[data-scrub-progress]");
  const scrubCaptions = [...(scrubSection?.querySelectorAll("[data-scrub-caption]") || [])];
  const scrubChips = [...(scrubSection?.querySelectorAll("[data-story-chip]") || [])];
  const scrubStory = JSON.parse(scrubSection?.querySelector("[data-story-chapters]")?.textContent || '{"duration":0,"chapters":[]}');
  const scrubChapters = scrubStory.chapters || [];
  let scrubLoaded = false;
  let scrubDuration = 0;
  let scrubTarget = 0;
  let scrubValue = 0;
  let scrubVelocity = 0;
  let scrubActive = false;
  let lastFrame = performance.now();
  let scrubCaptionIndex = Math.max(0, scrubCaptions.findIndex((caption) => caption.classList.contains("is-active")));
  let scrubCaptionPendingIndex = scrubCaptionIndex;
  let scrubCaptionIsExiting = false;

  const loadScrubVideo = () => {
    if (!scrubVideo || scrubLoaded || reducedMotion.matches) return;
    const mobile = window.matchMedia("(max-width: 899px)").matches || navigator.connection?.saveData;
    const source = document.createElement("source");
    source.src = mobile ? scrubVideo.dataset.mobileSrc : scrubVideo.dataset.desktopSrc;
    source.type = "video/mp4";
    scrubVideo.append(source);
    scrubVideo.load();
    scrubLoaded = true;
  };

  if (scrubSection && !reducedMotion.matches) {
    if ("IntersectionObserver" in window) {
      const scrubObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadScrubVideo();
        observer.disconnect();
      }, { rootMargin: "1200px 0px" });
      scrubObserver.observe(scrubSection);
    } else {
      loadScrubVideo();
    }
  }

  scrubVideo?.addEventListener("loadedmetadata", () => {
    scrubDuration = Number.isFinite(scrubVideo.duration) ? scrubVideo.duration : 0;
  });

  const updateScrubTarget = () => {
    if (!scrubSection || reducedMotion.matches) return;
    const rect = scrubSection.getBoundingClientRect();
    const travel = Math.max(1, scrubSection.offsetHeight - window.innerHeight);
    scrubTarget = clamp(-rect.top / travel);
    scrubActive = rect.bottom > 0 && rect.top < window.innerHeight;
  };

  const activateScrubCaption = (index) => {
    scrubCaptions.forEach((caption, captionIndex) => caption.classList.toggle("is-active", captionIndex === index));
    scrubChips.forEach((chip, chipIndex) => chip.setAttribute("aria-current", String(chipIndex === index)));
    scrubCaptionIndex = index;
  };

  const setScrubCaption = (storyTime) => {
    if (!scrubCaptions.length) return;
    const foundIndex = scrubChapters.findIndex((chapter) => storyTime >= chapter.start && storyTime < chapter.end);
    const index = foundIndex < 0 ? scrubCaptions.length - 1 : foundIndex;
    scrubCaptionPendingIndex = index;

    if (reducedMotion.matches) {
      activateScrubCaption(index);
      return;
    }

    if (scrubCaptionIsExiting || index === scrubCaptionIndex) return;
    scrubCaptionIsExiting = true;
    scrubCaptions[scrubCaptionIndex]?.classList.remove("is-active");

    window.setTimeout(() => {
      activateScrubCaption(scrubCaptionPendingIndex);
      scrubCaptionIsExiting = false;
    }, 150);
  };

  const animateScrub = (now) => {
    const dt = Math.min(0.032, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    if (scrubActive) {
      // Critically damped second-order follow: x'' + 2wx' + w^2(x-target) = 0.
      const omega = 13;
      const acceleration = omega * omega * (scrubTarget - scrubValue) - 2 * omega * scrubVelocity;
      scrubVelocity += acceleration * dt;
      scrubValue = clamp(scrubValue + scrubVelocity * dt);
      if (scrubVideo && scrubDuration > 0 && scrubVideo.readyState >= 1) {
        const wantedTime = scrubValue * Math.max(0, scrubDuration - 0.04);
        if (Math.abs(scrubVideo.currentTime - wantedTime) > 0.012) scrubVideo.currentTime = wantedTime;
      }
      if (scrubProgress) scrubProgress.style.transform = `scaleX(${scrubValue})`;
      setScrubCaption(scrubValue * (scrubDuration || scrubStory.duration || 0));
    }
    requestAnimationFrame(animateScrub);
  };

  updateScrubTarget();
  window.addEventListener("scroll", updateScrubTarget, { passive: true });
  window.addEventListener("resize", updateScrubTarget, { passive: true });
  window.visualViewport?.addEventListener("resize", updateScrubTarget, { passive: true });
  document.fonts?.ready?.then(updateScrubTarget);
  if (!reducedMotion.matches && scrubSection) requestAnimationFrame(animateScrub);

  scrubChips.forEach((chip, index) => chip.addEventListener("click", () => {
    const chapter = scrubChapters[index];
    if (!chapter || !scrubSection) return;
    const rect = scrubSection.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const travel = Math.max(1, scrubSection.offsetHeight - window.innerHeight);
    const storyDuration = scrubStory.duration || 1;
    const chapterProgress = ((chapter.start + chapter.end) / 2) / storyDuration;
    window.scrollTo({ top: sectionTop + chapterProgress * travel, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }));

  const filmSection = document.querySelector("[data-film-scrub]");
  const filmVideo = filmSection?.querySelector(".film-process__video");
  const filmProgress = filmSection?.querySelector("[data-film-progress]");
  const filmCaptions = [...(filmSection?.querySelectorAll("[data-film-caption]") || [])];
  const filmChips = [...(filmSection?.querySelectorAll("[data-film-chip]") || [])];
  const filmData = JSON.parse(filmSection?.querySelector("[data-film-chapters]")?.textContent || '{"duration":24,"chapters":[]}');
  const filmChapters = filmData.chapters || [];
  let filmLoaded = false;
  let filmDuration = 0;
  let filmTarget = 0;
  let filmValue = 0;
  let filmVelocity = 0;
  let filmFrame = 0;
  let filmLastFrame = performance.now();
  let filmCaptionIndex = Math.max(0, filmCaptions.findIndex((caption) => caption.classList.contains("is-active")));
  let filmCaptionPendingIndex = filmCaptionIndex;
  let filmCaptionIsExiting = false;

  const readFilmState = () => {
    if (!filmSection) return false;
    const rect = filmSection.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    filmTarget = clamp(-rect.top / travel);
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };

  const activateFilmCaption = (index) => {
    filmCaptions.forEach((caption, position) => caption.classList.toggle("is-active", position === index));
    filmChips.forEach((chip, position) => {
      if (position === index) chip.setAttribute("aria-current", "step");
      else chip.removeAttribute("aria-current");
    });
    filmCaptionIndex = index;
  };

  const setFilmCaption = (filmTime) => {
    if (!filmCaptions.length) return;
    const foundIndex = filmChapters.findIndex((chapter) => filmTime >= chapter.start && filmTime < chapter.end);
    const index = foundIndex < 0 ? filmCaptions.length - 1 : foundIndex;
    filmCaptionPendingIndex = index;
    if (index === filmCaptionIndex || filmCaptionIsExiting) return;
    filmCaptionIsExiting = true;
    filmCaptions[filmCaptionIndex]?.classList.remove("is-active");
    window.setTimeout(() => {
      activateFilmCaption(filmCaptionPendingIndex);
      filmCaptionIsExiting = false;
    }, 150);
  };

  const drawFilmFrame = (now) => {
    filmFrame = 0;
    const visible = readFilmState();
    if (!visible || document.hidden || reducedMotion.matches) return;
    const dt = Math.min(0.032, Math.max(0.001, (now - filmLastFrame) / 1000));
    filmLastFrame = now;
    const omega = 13;
    const acceleration = omega * omega * (filmTarget - filmValue) - 2 * omega * filmVelocity;
    filmVelocity += acceleration * dt;
    filmValue = clamp(filmValue + filmVelocity * dt);
    const moving = Math.abs(filmTarget - filmValue) > 0.0005 || Math.abs(filmVelocity) > 0.0005;
    if (!moving) {
      filmValue = filmTarget;
      filmVelocity = 0;
    }
    if (filmVideo && filmDuration > 0 && filmVideo.readyState >= 1) {
      const wantedTime = filmValue * filmDuration;
      if (Math.abs(filmVideo.currentTime - wantedTime) > 0.012) filmVideo.currentTime = wantedTime;
    }
    if (filmProgress) filmProgress.style.transform = `scaleX(${filmValue})`;
    setFilmCaption(filmValue * (filmDuration || filmData.duration || 24));
    if (moving) filmFrame = requestAnimationFrame(drawFilmFrame);
  };

  const wakeFilm = () => {
    const visible = readFilmState();
    if (!visible || document.hidden || reducedMotion.matches || filmFrame) return;
    filmLastFrame = performance.now();
    filmFrame = requestAnimationFrame(drawFilmFrame);
  };

  const loadFilmVideo = () => {
    if (!filmVideo || filmLoaded || reducedMotion.matches) return;
    const source = document.createElement("source");
    source.src = window.matchMedia("(max-width: 899px)").matches || navigator.connection?.saveData ? filmVideo.dataset.mobileSrc : filmVideo.dataset.desktopSrc;
    source.type = "video/mp4";
    filmVideo.append(source);
    filmVideo.load();
    filmLoaded = true;
  };

  if (filmSection && !reducedMotion.matches) {
    if ("IntersectionObserver" in window) {
      const filmObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadFilmVideo();
        observer.disconnect();
      }, { rootMargin: "1200px 0px" });
      filmObserver.observe(filmSection);
    } else {
      loadFilmVideo();
    }
    window.addEventListener("scroll", wakeFilm, { passive: true });
    window.addEventListener("resize", wakeFilm, { passive: true });
    window.visualViewport?.addEventListener("resize", wakeFilm, { passive: true });
    document.addEventListener("visibilitychange", wakeFilm);
    document.fonts?.ready?.then(wakeFilm);
    wakeFilm();
  }

  filmVideo?.addEventListener("loadedmetadata", () => {
    filmDuration = Number.isFinite(filmVideo.duration) ? filmVideo.duration : 0;
    wakeFilm();
  });

  filmChips.forEach((chip, index) => chip.addEventListener("click", () => {
    const chapter = filmChapters[index];
    if (!chapter || !filmSection) return;
    const rect = filmSection.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const travel = Math.max(1, rect.height - window.innerHeight);
    const chapterProgress = chapter.start / (filmData.duration || 24);
    window.scrollTo({ top: sectionTop + chapterProgress * travel, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }));

  const createRowCollapser = ({ container, items, toggle, matches, countItems, noun }) => {
    let expanded = false;
    let currentFilter = "all";
    let resizeFrame = 0;
    let measuredWidth = 0;
    const maxRows = Math.max(1, Number.parseInt(container.dataset.maxRows, 10) || 1);

    const matchingItems = () => items.filter((item) => matches(item, currentFilter));
    const update = () => {
      const matching = matchingItems();
      items.forEach((item) => { item.hidden = !matching.includes(item); });

      const rowTops = [];
      matching.forEach((item) => {
        if (!rowTops.some((top) => Math.abs(top - item.offsetTop) < 2)) rowTops.push(item.offsetTop);
      });
      const hasMore = rowTops.length > maxRows;
      if (!hasMore) expanded = false;
      if (!expanded && hasMore) {
        const lastVisibleTop = rowTops[maxRows - 1];
        matching.forEach((item) => { item.hidden = item.offsetTop > lastVisibleTop + 1; });
      }

      const count = (countItems || matchingItems)().filter((item) => matches(item, currentFilter)).length;
      toggle.hidden = !hasMore;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Show fewer" : `Show all ${count} ${noun}`;
    };

    const setFilter = (filter) => {
      currentFilter = filter;
      expanded = false;
      update();
    };

    toggle.addEventListener("click", () => {
      const oldTop = toggle.getBoundingClientRect().top;
      const collapsing = expanded;
      expanded = !expanded;
      update();
      if (collapsing) {
        requestAnimationFrame(() => {
          const shift = toggle.getBoundingClientRect().top - oldTop;
          window.scrollBy({ top: shift, behavior: "auto" });
        });
      }
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width || 0;
        if (Math.abs(width - measuredWidth) < 1) return;
        measuredWidth = width;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(update);
      }).observe(container);
    } else {
      window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(update);
      }, { passive: true });
    }

    update();
    return { setFilter, matchingItems };
  };

  const filterButtons = [...document.querySelectorAll("[data-gallery-filter]")];
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const galleryCollapser = createRowCollapser({
    container: document.querySelector("[data-gallery]"),
    items: galleryItems,
    toggle: document.querySelector("[data-gallery-toggle]"),
    matches: (item, filter) => filter === "all" || item.dataset.category === filter,
    noun: "photos"
  });
  let visibleGalleryItems = galleryCollapser.matchingItems();
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      galleryCollapser.setFilter(filter);
      visibleGalleryItems = galleryCollapser.matchingItems();
    });
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = lightbox?.querySelector("figure img");
  const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
  let lightboxIndex = 0;
  let lightboxTrigger = null;

  const fullImagePath = (thumbnailPath) => thumbnailPath.replace(/-640\.webp$/, ".webp");
  const showLightboxItem = (index) => {
    if (!lightboxImage || !lightboxCaption || !visibleGalleryItems.length) return;
    lightboxIndex = (index + visibleGalleryItems.length) % visibleGalleryItems.length;
    const item = visibleGalleryItems[lightboxIndex];
    const sourceImage = item.querySelector("img");
    lightboxImage.src = fullImagePath(sourceImage.getAttribute("src"));
    lightboxImage.alt = sourceImage.alt;
    lightboxCaption.textContent = item.dataset.caption || sourceImage.alt;
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (!lightbox?.showModal) return;
      lightboxTrigger = item;
      visibleGalleryItems = galleryCollapser.matchingItems();
      showLightboxItem(visibleGalleryItems.indexOf(item));
      lightbox.showModal();
    });
  });
  lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
  lightbox?.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showLightboxItem(lightboxIndex - 1));
  lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showLightboxItem(lightboxIndex + 1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showLightboxItem(lightboxIndex - 1);
    if (event.key === "ArrowRight") showLightboxItem(lightboxIndex + 1);
  });
  lightbox?.addEventListener("close", () => lightboxTrigger?.focus());

  const videoFilterButtons = [...document.querySelectorAll("[data-video-filter]")];
  const videoCards = [...document.querySelectorAll(".video-card")];
  const projectVideoCards = [...document.querySelectorAll("[data-video-card]")];
  const videoCollapser = createRowCollapser({
    container: document.querySelector(".video-strip"),
    items: videoCards,
    toggle: document.querySelector("[data-video-toggle]"),
    matches: (card, filter) => filter === "all" || card.dataset.videoCategory === filter,
    countItems: () => projectVideoCards,
    noun: "videos"
  });
  videoFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.videoFilter;
      videoFilterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      videoCollapser.setFilter(filter);
      videoCards.forEach((card) => { if (card.hidden) card.querySelector("video")?.pause(); });
    });
  });

  document.querySelectorAll(".video-play[data-video-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const media = button.closest("[data-video-media]");
      const poster = media?.querySelector("img")?.getAttribute("src") || "";
      if (!media) return;
      document.querySelectorAll(".video-strip video").forEach((video) => video.pause());
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      video.poster = poster;
      video.width = 720;
      video.height = 1280;
      video.setAttribute("aria-label", button.getAttribute("aria-label")?.replace("Play video:", "Video:") || "Project video");
      video.src = button.dataset.videoSrc;
      video.addEventListener("play", () => {
        document.querySelectorAll(".video-strip video").forEach((other) => {
          if (other !== video) other.pause();
        });
      });
      media.replaceChildren(video);
      video.play().catch(() => {});
    });
  });
})();
