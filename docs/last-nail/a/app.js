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
  let scrubLoaded = false;
  let scrubDuration = 0;
  let scrubTarget = 0;
  let scrubValue = 0;
  let scrubVelocity = 0;
  let scrubActive = false;
  let lastFrame = performance.now();

  const loadScrubVideo = () => {
    if (!scrubVideo || scrubLoaded || reducedMotion.matches) return;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
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

  const setScrubCaption = (progress) => {
    if (!scrubCaptions.length) return;
    const index = Math.min(scrubCaptions.length - 1, Math.floor(progress * scrubCaptions.length));
    scrubCaptions.forEach((caption, captionIndex) => caption.classList.toggle("is-active", captionIndex === index));
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
      setScrubCaption(scrubValue);
    }
    requestAnimationFrame(animateScrub);
  };

  updateScrubTarget();
  window.addEventListener("scroll", updateScrubTarget, { passive: true });
  window.addEventListener("resize", updateScrubTarget, { passive: true });
  if (!reducedMotion.matches && scrubSection) requestAnimationFrame(animateScrub);

  const explainerTabs = [...document.querySelectorAll("[data-explainer-tab]")];
  const explainerPanels = [...document.querySelectorAll("[data-explainer-panel]")];
  const activateExplainer = (name, focus = false) => {
    explainerTabs.forEach((tab) => {
      const active = tab.dataset.explainerTab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    explainerPanels.forEach((panel) => {
      const active = panel.dataset.explainerPanel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };
  explainerTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateExplainer(tab.dataset.explainerTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + explainerTabs.length) % explainerTabs.length;
      activateExplainer(explainerTabs[next].dataset.explainerTab, true);
    });
  });

  const processSection = document.querySelector("[data-process]");
  const processSteps = [...(processSection?.querySelectorAll("[data-process-step]") || [])];
  const processFrames = [...(processSection?.querySelectorAll("[data-process-frame]") || [])];
  const updateProcess = () => {
    if (!processSection || reducedMotion.matches || !processFrames.length) return;
    const rect = processSection.getBoundingClientRect();
    const travel = Math.max(1, processSection.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    const position = progress * (processFrames.length - 1);
    const activeIndex = Math.min(processFrames.length - 1, Math.round(position));
    processSteps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));
    processFrames.forEach((frame, index) => {
      const opacity = clamp(1 - Math.abs(position - index), 0, 1);
      frame.style.opacity = String(opacity);
      frame.style.transform = `scale(${1.02 - opacity * 0.02})`;
      frame.classList.toggle("is-active", index === activeIndex);
    });
  };
  updateProcess();
  window.addEventListener("scroll", updateProcess, { passive: true });
  window.addEventListener("resize", updateProcess, { passive: true });

  const filterButtons = [...document.querySelectorAll("[data-gallery-filter]")];
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  let visibleGalleryItems = [...galleryItems];
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      galleryItems.forEach((item) => {
        item.hidden = filter !== "all" && item.dataset.category !== filter;
      });
      visibleGalleryItems = galleryItems.filter((item) => !item.hidden);
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
      visibleGalleryItems = galleryItems.filter((galleryItem) => !galleryItem.hidden);
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
  const videoCards = [...document.querySelectorAll("[data-video-card]")];
  videoFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.videoFilter;
      videoFilterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      videoCards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.videoCategory !== filter;
        if (card.hidden) card.querySelector("video")?.pause();
      });
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
