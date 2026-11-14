(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.FrameScrubber = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var globalObject = typeof window !== "undefined" ? window : null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function now() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  }

  function closeBitmap(bitmap) {
    if (bitmap && typeof bitmap.close === "function") {
      bitmap.close();
    }
  }

  function formatPattern(pattern, number) {
    return pattern.replace(/%0?(\d*)d/, function (_, width) {
      var value = String(number);
      var length = Number(width) || 0;
      while (value.length < length) value = "0" + value;
      return value;
    });
  }

  function isMobileViewport() {
    return !!(globalObject && globalObject.matchMedia &&
      globalObject.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
  }

  function FrameScrubber(options) {
    if (!(this instanceof FrameScrubber)) return new FrameScrubber(options);
    options = options || {};
    if (!options.canvas || typeof options.canvas.getContext !== "function") {
      throw new TypeError("FrameScrubber requires a canvas element.");
    }
    if (!options.manifest) {
      throw new TypeError("FrameScrubber requires a manifest object or URL.");
    }

    this._canvas = options.canvas;
    this._context = this._canvas.getContext("2d", { alpha: false });
    this._poster = options.poster || null;
    this._base = String(options.base || "").replace(/\/$/, "");
    this._manifestInput = options.manifest;
    this._sizeKey = String(options.sizeKey || "");
    this._maxDpr = Math.max(1, Number(options.maxDpr) || 2);
    this._windowSize = Math.max(1, Number(options.windowSize) || (isMobileViewport() ? 6 : 12));
    this._fit = options.fit === "contain" ? "contain" : "cover";
    this._position = options.position || "center";
    this._onFrame = typeof options.onFrame === "function" ? options.onFrame : null;
    this._saveData = !!(typeof navigator !== "undefined" && navigator.connection && navigator.connection.saveData);
    this._concurrency = Math.max(1, Number(options.concurrency) || 6);
    if (this._saveData) this._concurrency = Math.min(2, this._concurrency);

    this._manifest = null;
    this._count = 0;
    this._sourceWidth = 0;
    this._sourceHeight = 0;
    this._target = 0;
    this._pendingProgress = null;
    this._direction = 1;
    this._drawnIndex = -1;
    this._sizeDirty = true;
    this._ready = false;
    this._started = false;
    this._destroyed = false;
    this._manifestLoading = false;
    this._drawRaf = 0;

    this._bitmaps = new Map();
    this._completed = new Set();
    this._inflight = new Set();
    this._failed = new Set();
    this._attempts = Object.create(null);
    this._controllers = new Map();
    this._activeLoads = 0;
    this._permanentStride = 16;

    this._drawCount = 0;
    this._exactDrawCount = 0;
    this._distinctDrawn = new Set();
    this._fetched = 0;
    this._decodeMs = [];
    this._debugHook = null;

    if (globalObject && globalObject.__SCRUB_DEBUG) {
      if (!Array.isArray(globalObject.__scrubStats)) globalObject.__scrubStats = [];
      this._debugHook = [];
      this._debugHook.fetched = 0;
      this._debugHook.decodeMs = [];
      globalObject.__scrubStats.push(this._debugHook);
    }

    this._handleVisibility = this._handleVisibility.bind(this);
    this._handleResize = this._handleResize.bind(this);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this._handleVisibility);
    }
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(this._handleResize);
      this._resizeObserver.observe(this._canvas);
    } else if (globalObject) {
      globalObject.addEventListener("resize", this._handleResize);
    }
    this._handleResize();

    if (typeof this._manifestInput === "object") {
      this._applyManifest(this._manifestInput);
    }
  }

  FrameScrubber.prototype._isHidden = function () {
    return typeof document !== "undefined" && document.hidden;
  };

  FrameScrubber.prototype._applyManifest = function (manifest) {
    if (!manifest || !manifest.count || !manifest.pattern || !manifest.sizes) {
      throw new Error("Invalid frame manifest.");
    }
    var size = manifest.sizes[this._sizeKey];
    if (!size) throw new Error("Frame manifest has no size key: " + this._sizeKey);

    this._manifest = manifest;
    this._count = Number(manifest.count);
    this._sourceWidth = Number(size.width);
    this._sourceHeight = Number(size.height);
    if (this._pendingProgress !== null) {
      this._target = Math.round(this._pendingProgress * (this._count - 1));
      this._pendingProgress = null;
    } else {
      this._target = clamp(Math.round(this._target) || 0, 0, this._count - 1);
    }
  };

  FrameScrubber.prototype._loadManifest = function () {
    var self = this;
    if (this._manifest || this._manifestLoading || this._destroyed) return;
    this._manifestLoading = true;
    fetch(String(this._manifestInput))
      .then(function (response) {
        if (!response.ok) throw new Error("Manifest request failed: " + response.status);
        return response.json();
      })
      .then(function (manifest) {
        if (self._destroyed) return;
        self._applyManifest(manifest);
        self._manifestLoading = false;
        self._pump();
      })
      .catch(function (error) {
        self._manifestLoading = false;
        if (!self._destroyed && typeof console !== "undefined") console.error(error);
      });
  };

  FrameScrubber.prototype._frameUrl = function (index) {
    var filename = formatPattern(this._manifest.pattern, index + 1);
    return this._base + "/" + encodeURIComponent(this._sizeKey) + "/" + filename;
  };

  FrameScrubber.prototype._effectiveTarget = function () {
    if (!this._saveData || this._target % 2 === 0) return this._target;
    var lower = this._target - 1;
    var upper = this._target + 1;
    if (upper < this._count) return upper;
    return Math.max(0, lower);
  };

  FrameScrubber.prototype._liveRange = function () {
    var before = Math.floor((this._windowSize - 1) / 2);
    var after = this._windowSize - before - 1;
    if (this._direction > 0) {
      after += Math.floor(before / 2);
      before -= Math.floor(before / 2);
    } else if (this._direction < 0) {
      before += Math.floor(after / 2);
      after -= Math.floor(after / 2);
    }
    return [Math.max(0, this._target - before), Math.min(this._count - 1, this._target + after)];
  };

  FrameScrubber.prototype._priority = function (index, effectiveTarget, liveRange) {
    var completed = this._completed.has(index);
    var stage;
    if (index === effectiveTarget) {
      stage = -2;
    } else if (completed && index >= liveRange[0] && index <= liveRange[1]) {
      stage = -1;
    } else if (index % 8 === 0) {
      stage = 0;
    } else if (index % 4 === 0) {
      stage = 1;
    } else if (index % 2 === 0) {
      stage = 2;
    } else {
      stage = 3;
    }
    var delta = index - effectiveTarget;
    var directional = delta === 0 || delta * this._direction > 0 ? 0 : 1;
    return [stage, directional, Math.abs(delta), index];
  };

  FrameScrubber.prototype._pickNext = function () {
    if (!this._manifest) return -1;
    var target = this._effectiveTarget();
    var liveRange = this._liveRange();
    var best = -1;
    var bestPriority = null;

    for (var i = 0; i < this._count; i += 1) {
      if (this._saveData && i % 2 !== 0) continue;
      if (this._bitmaps.has(i) || this._inflight.has(i) || this._failed.has(i)) continue;
      var completed = this._completed.has(i);
      if (completed && i !== target && (i < liveRange[0] || i > liveRange[1])) continue;
      var priority = this._priority(i, target, liveRange);
      if (!bestPriority ||
          priority[0] < bestPriority[0] ||
          (priority[0] === bestPriority[0] && priority[1] < bestPriority[1]) ||
          (priority[0] === bestPriority[0] && priority[1] === bestPriority[1] && priority[2] < bestPriority[2]) ||
          (priority[0] === bestPriority[0] && priority[1] === bestPriority[1] && priority[2] === bestPriority[2] && priority[3] < bestPriority[3])) {
        best = i;
        bestPriority = priority;
      }
    }
    return best;
  };

  FrameScrubber.prototype._decodeImageElement = function (blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var image = new Image();
      var settled = false;
      function finish(error) {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(url);
        if (error) reject(error);
        else resolve(image);
      }
      image.onload = function () { finish(); };
      image.onerror = function () { finish(new Error("Image decode failed.")); };
      image.src = url;
      if (typeof image.decode === "function") {
        image.decode().then(function () { finish(); }).catch(function () {
          /* onload/onerror remains the compatibility fallback */
        });
      }
    });
  };

  FrameScrubber.prototype._decodeBlob = function (blob) {
    var self = this;
    var startedAt = now();
    var decoded;
    if (typeof createImageBitmap === "function") {
      decoded = createImageBitmap(blob).catch(function () {
        return self._decodeImageElement(blob);
      });
    } else {
      decoded = this._decodeImageElement(blob);
    }
    return decoded.then(function (bitmap) {
      var elapsed = now() - startedAt;
      self._decodeMs.push(elapsed);
      if (self._debugHook) self._debugHook.decodeMs.push(elapsed);
      return bitmap;
    });
  };

  FrameScrubber.prototype._loadFrame = function (index) {
    var self = this;
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    this._controllers.set(index, controller);
    this._inflight.add(index);
    this._activeLoads += 1;
    this._attempts[index] = (this._attempts[index] || 0) + 1;
    var requestOptions = controller ? { signal: controller.signal } : undefined;

    fetch(this._frameUrl(index), requestOptions)
      .then(function (response) {
        if (!response.ok) throw new Error("Frame request failed: " + response.status);
        self._fetched += 1;
        if (self._debugHook) self._debugHook.fetched = self._fetched;
        return response.blob();
      })
      .then(function (blob) { return self._decodeBlob(blob); })
      .then(function (bitmap) {
        if (self._destroyed) {
          closeBitmap(bitmap);
          return;
        }
        var prior = self._bitmaps.get(index);
        if (prior && prior !== bitmap) closeBitmap(prior);
        self._bitmaps.set(index, bitmap);
        self._completed.add(index);
        self._failed.delete(index);
        self._evict();
        self._requestDraw();
      })
      .catch(function (error) {
        if (self._destroyed) return;
        if (error && error.name === "AbortError") {
          self._attempts[index] = Math.max(0, self._attempts[index] - 1);
          return;
        }
        if (self._attempts[index] >= 2) self._failed.add(index);
      })
      .then(function () {
        self._controllers.delete(index);
        self._inflight.delete(index);
        self._activeLoads -= 1;
        self._pump();
      });
  };

  FrameScrubber.prototype._pump = function () {
    if (!this._started || !this._manifest || this._destroyed || this._isHidden()) return;
    while (this._activeLoads < this._concurrency) {
      var next = this._pickNext();
      if (next < 0) break;
      this._loadFrame(next);
    }
  };

  FrameScrubber.prototype._evict = function () {
    if (!this._count) return;
    var liveRange = this._liveRange();
    var self = this;
    this._bitmaps.forEach(function (bitmap, index) {
      var permanent = index % self._permanentStride === 0;
      var live = index >= liveRange[0] && index <= liveRange[1];
      var displayed = index === self._drawnIndex;
      if (!permanent && !live && !displayed) {
        closeBitmap(bitmap);
        self._bitmaps.delete(index);
      }
    });
  };

  FrameScrubber.prototype._nearestDecoded = function () {
    var self = this;
    var best = -1;
    var distance = Infinity;
    this._bitmaps.forEach(function (_, index) {
      var candidateDistance = Math.abs(index - self._target);
      var candidateAhead = (index - self._target) * self._direction >= 0;
      var bestAhead = best >= 0 && (best - self._target) * self._direction >= 0;
      if (candidateDistance < distance ||
          (candidateDistance === distance && candidateAhead && !bestAhead) ||
          (candidateDistance === distance && candidateAhead === bestAhead && index < best)) {
        best = index;
        distance = candidateDistance;
      }
    });
    return best;
  };

  FrameScrubber.prototype._requestDraw = function () {
    var self = this;
    if (this._drawRaf || this._destroyed || this._isHidden()) return;
    this._drawRaf = requestAnimationFrame(function () {
      self._drawRaf = 0;
      self._draw();
    });
  };

  FrameScrubber.prototype._draw = function () {
    if (this._destroyed || this._isHidden() || !this._bitmaps.size) return;
    var index = this._bitmaps.has(this._target) ? this._target : this._nearestDecoded();
    if (index < 0 || (index === this._drawnIndex && !this._sizeDirty)) return;
    var bitmap = this._bitmaps.get(index);
    if (!bitmap) return;

    var canvasWidth = this._canvas.width;
    var canvasHeight = this._canvas.height;
    var imageWidth = bitmap.width || this._sourceWidth;
    var imageHeight = bitmap.height || this._sourceHeight;
    var scale = this._fit === "contain" ?
      Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) :
      Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
    var drawWidth = imageWidth * scale;
    var drawHeight = imageHeight * scale;
    var x = (canvasWidth - drawWidth) / 2;
    var y = (canvasHeight - drawHeight) / 2;

    this._context.clearRect(0, 0, canvasWidth, canvasHeight);
    this._context.drawImage(bitmap, x, y, drawWidth, drawHeight);
    this._drawnIndex = index;
    this._sizeDirty = false;
    this._ready = true;
    this._drawCount += 1;
    this._distinctDrawn.add(index);
    var exact = index === this._target;
    if (exact) this._exactDrawCount += 1;

    if (this._poster) {
      this._poster.style.visibility = "hidden";
      this._poster.setAttribute("aria-hidden", "true");
    }
    if (this._debugHook) {
      this._debugHook.push({ t: now(), target: this._target, drawn: index, exact: exact });
    }
    if (this._onFrame) {
      try { this._onFrame(index); }
      catch (error) { setTimeout(function () { throw error; }, 0); }
    }
    this._evict();
  };

  FrameScrubber.prototype._handleResize = function () {
    if (this._destroyed) return;
    var rect = this._canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var dpr = Math.min((globalObject && globalObject.devicePixelRatio) || 1, this._maxDpr);
    var width = Math.max(1, Math.round(rect.width * dpr));
    var height = Math.max(1, Math.round(rect.height * dpr));
    if (this._canvas.width !== width || this._canvas.height !== height) {
      this._canvas.width = width;
      this._canvas.height = height;
      this._sizeDirty = true;
      this._requestDraw();
    }
  };

  FrameScrubber.prototype._handleVisibility = function () {
    if (this._isHidden()) {
      this._controllers.forEach(function (controller) {
        if (controller) controller.abort();
      });
      return;
    }
    this._handleResize();
    this._requestDraw();
    if (this._started && !this._manifest) this._loadManifest();
    else this._pump();
  };

  FrameScrubber.prototype.setProgress = function (progress) {
    progress = clamp(Number(progress) || 0, 0, 1);
    if (!this._count) {
      this._pendingProgress = progress;
      return this;
    }
    return this.setFrame(Math.round(progress * (this._count - 1)));
  };

  FrameScrubber.prototype.setFrame = function (index) {
    index = Math.round(Number(index) || 0);
    if (!this._count) {
      this._target = Math.max(0, index);
      this._pendingProgress = null;
      return this;
    }
    index = clamp(index, 0, this._count - 1);
    if (index !== this._target) {
      this._direction = index > this._target ? 1 : -1;
      this._target = index;
      this._evict();
      this._requestDraw();
      this._pump();
    }
    return this;
  };

  FrameScrubber.prototype.start = function () {
    if (this._destroyed || this._started) return this;
    this._started = true;
    if (this._isHidden()) return this;
    if (this._manifest) this._pump();
    else this._loadManifest();
    return this;
  };

  FrameScrubber.prototype.stats = function () {
    var exactRatio = this._drawCount ? this._exactDrawCount / this._drawCount : 0;
    return {
      draws: this._drawCount,
      distinctFrames: this._distinctDrawn.size,
      exactRatio: exactRatio,
      fetched: this._fetched,
      decodeMs: this._decodeMs.slice(),
      loadedCount: this._completed.size,
      bitmapCount: this._bitmaps.size
    };
  };

  FrameScrubber.prototype.destroy = function () {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._drawRaf) cancelAnimationFrame(this._drawRaf);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    else if (globalObject) globalObject.removeEventListener("resize", this._handleResize);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._handleVisibility);
    }
    this._controllers.forEach(function (controller) {
      if (controller) controller.abort();
    });
    this._controllers.clear();
    this._bitmaps.forEach(closeBitmap);
    this._bitmaps.clear();
    this._inflight.clear();
  };

  Object.defineProperties(FrameScrubber.prototype, {
    currentIndex: { get: function () { return this._target; } },
    loadedCount: { get: function () { return this._completed.size; } },
    count: { get: function () { return this._count; } },
    ready: { get: function () { return this._ready; } },
    bitmapCount: { get: function () { return this._bitmaps.size; } }
  });

  return FrameScrubber;
}));
