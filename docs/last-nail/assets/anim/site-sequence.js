(() => {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const ease = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const setOpacity = (element, value) => {
    if (element) element.style.opacity = String(clamp(value));
  };
  const setTransform = (element, value) => {
    if (element) element.style.transform = value;
  };

  document.querySelectorAll("[data-site-sequence]").forEach((section) => {
    const graphic = section.querySelector("[data-site-sequence-graphic]");
    if (!graphic) return;

    const camera = graphic.querySelector("[data-camera]");
    const chunks = [...graphic.querySelectorAll("[data-slab-chunk]")];
    const crackLines = [...graphic.querySelectorAll("[data-crack-line]")];
    const dust = [...graphic.querySelectorAll("[data-dust]")];
    const seepage = [...graphic.querySelectorAll("[data-seep]")];
    const gravel = [...graphic.querySelectorAll("[data-gravel]")];
    const flowDrops = [...graphic.querySelectorAll("[data-flow-drop]")];
    const breaker = graphic.querySelector("[data-breaker]");
    const soilClip = graphic.querySelector("[data-soil-clip]");
    const trench = graphic.querySelector("[data-trench]");
    const wallCrack = graphic.querySelector("[data-wall-crack]");
    const waterLayer = graphic.querySelector("[data-water-layer]");
    const membraneClip = graphic.querySelector("[data-membrane-clip]");
    const membraneRoll = graphic.querySelector("[data-membrane-roll]");
    const installedMembrane = graphic.querySelector("[data-installed-membrane]");
    const installedSystem = graphic.querySelector("[data-installed-system]");
    const xrayGhost = graphic.querySelector("[data-xray-ghost]");
    const drain = graphic.querySelector("[data-drain]");
    const flowArrow = graphic.querySelector("[data-flow-arrow]");
    const newSlab = graphic.querySelector("[data-new-slab]");
    const restoredGround = graphic.querySelector("[data-restored-ground]");
    const progressBar = section.querySelector("[data-sequence-progress]");
    const captions = [...section.querySelectorAll("[data-sequence-caption]")];
    const chips = [...section.querySelectorAll("[data-sequence-chip]")];
    const actStops = [0.02, 0.24, 0.44, 0.64, 0.84];
    let captionIndex = 0;
    let queuedCaptionIndex = 0;
    let captionExiting = false;
    let captionTimer = 0;
    let target = 0;
    let value = 0;
    let velocity = 0;
    let raf = 0;
    let lastTime = performance.now();
    let visible = false;

    captions.forEach((caption, index) => caption.setAttribute("aria-hidden", String(index !== 0)));

    crackLines.forEach((line) => {
      line.style.strokeDasharray = "1";
      line.style.strokeDashoffset = "1";
    });
    if (drain) {
      drain.style.strokeDasharray = "1";
      drain.style.strokeDashoffset = "1";
    }
    if (flowArrow) {
      flowArrow.style.strokeDasharray = "1";
      flowArrow.style.strokeDashoffset = "1";
    }

    const actIndex = (progress) => {
      if (progress < .22) return 0;
      if (progress < .42) return 1;
      if (progress < .62) return 2;
      if (progress < .82) return 3;
      return 4;
    };

    const setCaption = (index) => {
      queuedCaptionIndex = index;
      if (motionQuery.matches) return;
      if (captionExiting || index === captionIndex) return;
      captionExiting = true;
      captions[captionIndex]?.classList.remove("is-active");
      captions[captionIndex]?.setAttribute("aria-hidden", "true");
      window.clearTimeout(captionTimer);
      captionTimer = window.setTimeout(() => {
        captions.forEach((caption) => {
          caption.classList.remove("is-active");
          caption.setAttribute("aria-hidden", "true");
        });
        captionIndex = queuedCaptionIndex;
        captions[captionIndex]?.classList.add("is-active");
        captions[captionIndex]?.setAttribute("aria-hidden", "false");
        captionExiting = false;
        if (queuedCaptionIndex !== captionIndex) setCaption(queuedCaptionIndex);
      }, 150);
    };

    const stage = (progress) => {
      const p = clamp(progress);
      const a1 = range(p, 0, .22);
      const a2 = range(p, .22, .42);
      const a3 = range(p, .42, .62);
      const a4 = range(p, .62, .82);
      const a5 = range(p, .82, .92);
      const backfill = ease(a5);
      const excavation = p < .82 ? ease(a2) : 1 - backfill;
      const cameraIn = ease(range(p, .22, .32));
      const cameraOut = ease(range(p, .82, .92));
      const cameraZoom = cameraIn * (1 - cameraOut);
      const cameraScale = 1 + .35 * cameraZoom;
      setTransform(camera, `translate3d(${(-507 * cameraZoom).toFixed(2)}px, ${(-230 * cameraZoom).toFixed(2)}px, 0) scale(${cameraScale.toFixed(4)})`);

      crackLines.forEach((line, index) => {
        const drawn = ease(range(a1, .04 + index * .05, .3 + index * .07));
        line.style.strokeDashoffset = String(1 - drawn);
      });

      const breakerPulse = Math.sin(a1 * Math.PI * 8) * 10 * (1 - ease(range(a1, .42, .8)));
      setTransform(breaker, `translate3d(0, ${breakerPulse.toFixed(2)}px, 0) rotate(-8deg)`);
      setOpacity(breaker, 1 - ease(range(a1, .62, .86)));

      const chunkDestinations = [
        [-238, -24, -18],
        [-316, -35, 24],
        [-386, -22, -28],
        [-452, -31, 20],
        [-520, -18, -15]
      ];
      chunks.forEach((chunk, index) => {
        const t = ease(range(a1, .24 + index * .105, .58 + index * .105));
        const destination = chunkDestinations[index];
        const x = destination[0] * t;
        const y = destination[1] * t - Math.sin(Math.PI * t) * (108 + index * 8);
        const rotation = destination[2] * t;
        setTransform(chunk, `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`);
      });

      dust.forEach((dot, index) => {
        const t = range(a1, .08 + index * .055, .42 + index * .055);
        const opacity = Math.sin(Math.PI * t) * .75;
        setOpacity(dot, opacity);
        setTransform(dot, `translate3d(${(index % 2 ? 1 : -1) * 15 * t}px, ${(-38 * t).toFixed(2)}px, 0)`);
      });

      if (soilClip) soilClip.setAttribute("transform", `translate(0 ${(excavation * 338).toFixed(2)})`);
      setOpacity(trench, excavation * (1 - backfill));
      setOpacity(wallCrack, ease(range(excavation, .28, .62)));

      const seepIn = ease(range(a2, .28, .62));
      const seepOut = 1 - ease(range(a3, .05, .34));
      seepage.forEach((drop, index) => {
        const travelDown = ease(range(a2, .32 + index * .08, .82 + index * .06));
        setOpacity(drop, seepIn * seepOut);
        setTransform(drop, `translate3d(${(index * 8).toFixed(2)}px, ${(travelDown * 58).toFixed(2)}px, 0)`);
      });

      const waterAmount = ease(range(a2, .46, .95)) * (1 - ease(range(a3, .12, .6)));
      setOpacity(waterLayer, waterAmount);
      setTransform(waterLayer, `scaleY(${waterAmount.toFixed(4)})`);

      const membrane = ease(range(a3, .04, .9));
      if (membraneClip) membraneClip.setAttribute("height", String((310 * membrane).toFixed(2)));
      setOpacity(installedMembrane, membrane * (1 - backfill));
      setOpacity(membraneRoll, Math.sin(Math.PI * range(a3, .02, .98)));
      setTransform(membraneRoll, `translate3d(0, ${(membrane * 294).toFixed(2)}px, 0)`);

      const systemReveal = ease(range(a4, .08, .28));
      setOpacity(installedSystem, systemReveal * (1 - backfill));
      setOpacity(xrayGhost, .5 * backfill);

      gravel.forEach((stone, index) => {
        const settled = ease(range(a4, .02 + index * .035, .34 + index * .035));
        setOpacity(stone, settled * (1 - backfill * .2));
        setTransform(stone, `translate3d(0, ${(-92 * (1 - settled)).toFixed(2)}px, 0) rotate(${((index % 2 ? 1 : -1) * 16 * (1 - settled)).toFixed(2)}deg)`);
      });

      const pipeDraw = ease(range(a4, .2, .72));
      if (drain) drain.style.strokeDashoffset = String(1 - pipeDraw);
      if (flowArrow) flowArrow.style.strokeDashoffset = String(1 - ease(range(a4, .46, .86)));

      const flowEnabled = ease(range(p, .68, .76));
      const flowTravel = range(p, .68, .92);
      flowDrops.forEach((drop, index) => {
        const t = (flowTravel * .82 + index * .31) % 1;
        let x;
        let y;
        if (t < .46) {
          const vertical = t / .46;
          x = 0;
          y = mix(0, 235, vertical);
        } else {
          const horizontal = (t - .46) / .54;
          x = mix(0, 200, horizontal);
          y = mix(235, 268, horizontal);
        }
        setOpacity(drop, flowEnabled * (.35 + Math.sin(Math.PI * t) * .65));
        setTransform(drop, `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`);
      });

      setOpacity(newSlab, ease(range(a5, .2, .72)));
      setOpacity(restoredGround, ease(range(a5, .08, .62)));

      if (progressBar) progressBar.style.transform = `scaleX(${p.toFixed(5)})`;
      const index = actIndex(p);
      chips.forEach((chip, chipIndex) => {
        if (chipIndex === index) chip.setAttribute("aria-current", "step");
        else chip.removeAttribute("aria-current");
      });
      setCaption(index);
    };

    const updateTarget = () => {
      if (motionQuery.matches) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      target = clamp(-rect.top / travel);
      /* Do not depend on IntersectionObserver alone: derive visibility from the live rect too
         (observers can be delayed or suspended, e.g. in background or embedded views). */
      if (rect.bottom > -window.innerHeight * .1 && rect.top < window.innerHeight * 1.1) visible = true;
      if (visible) start();
    };

    const tick = (now) => {
      raf = 0;
      if (!visible || motionQuery.matches) return;
      const dt = Math.min(.032, Math.max(.001, (now - lastTime) / 1000));
      lastTime = now;
      const omega = 14;
      const acceleration = omega * omega * (target - value) - 2 * omega * velocity;
      velocity += acceleration * dt;
      value = clamp(value + velocity * dt);
      stage(value);
      if (Math.abs(target - value) > .00012 || Math.abs(velocity) > .00012) raf = requestAnimationFrame(tick);
      else {
        value = target;
        velocity = 0;
        stage(value);
      }
    };

    function start() {
      if (raf || !visible || motionQuery.matches) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }

    chips.forEach((chip, index) => {
      chip.addEventListener("click", () => {
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const top = window.scrollY + rect.top + travel * actStops[index];
        window.scrollTo({ top, behavior: motionQuery.matches ? "auto" : "smooth" });
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) {
          updateTarget();
          start();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { rootMargin: "10% 0px" });
      observer.observe(section);
    } else {
      visible = true;
    }

    const onMotionChange = () => {
      window.clearTimeout(captionTimer);
      captionExiting = false;
      if (motionQuery.matches) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        value = 1;
        target = 1;
        stage(1);
      } else {
        captions.forEach((caption, index) => {
          const active = index === actIndex(value);
          caption.classList.toggle("is-active", active);
          caption.setAttribute("aria-hidden", String(!active));
        });
        captionIndex = actIndex(value);
        updateTarget();
      }
    };

    if (motionQuery.matches) {
      value = 1;
      target = 1;
      stage(1);
    } else {
      updateTarget();
      value = target;
      stage(value);
    }
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });
    window.visualViewport?.addEventListener("resize", updateTarget, { passive: true });
    window.addEventListener("load", updateTarget, { once: true });
    document.fonts?.ready?.then(updateTarget);
    motionQuery.addEventListener?.("change", onMotionChange);
  });
})();
