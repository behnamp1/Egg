(() => {
  "use strict";

  const STORAGE_KEY = "the-egg-local-demo-v1";
  const eggArt = document.getElementById("eggArt");
  const eggOverlay = document.getElementById("eggOverlay");
  const eggHitArea = document.getElementById("eggHitArea");
  const impactLayer = document.getElementById("impactLayer");
  const hitCounter = document.getElementById("hitCounter");
  const lastHitText = document.getElementById("lastHitText");
  const strikeButton = document.getElementById("strikeButton");
  const soundToggle = document.getElementById("soundToggle");
  const soundLabel = document.getElementById("soundLabel");
  const soundIcon = document.getElementById("soundIcon");
  const resetButton = document.getElementById("resetButton");
  const year = document.getElementById("year");

  const NS = "http://www.w3.org/2000/svg";
  const MAX_RENDERED_HITS = 160;
  let soundEnabled = true;
  let audioContext = null;
  let state = loadState();

  year.textContent = new Date().getFullYear();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.hits)) {
        return {
          totalHits: Number.isFinite(saved.totalHits) ? saved.totalHits : saved.hits.length,
          hits: saved.hits.slice(-MAX_RENDERED_HITS)
        };
      }
    } catch (_) {}
    return { totalHits: 0, hits: [] };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalHits: state.totalHits,
        hits: state.hits.slice(-MAX_RENDERED_HITS)
      }));
    } catch (_) {
      // The interaction still works if local storage is unavailable.
    }
  }

  function toPersianDigits(value) {
    return Number(value).toLocaleString("fa-IR");
  }

  function updateCounter() {
    hitCounter.textContent = toPersianDigits(state.totalHits);
    if (state.totalHits === 0) {
      lastHitText.textContent = "هنوز ضربه‌ای ثبت نشده";
    } else {
      lastHitText.textContent = "آخرین ضربه همین حالا ثبت شد";
    }
  }

  function svgElement(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    return el;
  }

  function drawHit(hit, animate = false) {
    const group = svgElement("g", { class: "impact-group" });
    const x = hit.x;
    const y = hit.y;
    const angle = hit.angle;
    const length = hit.length;

    const ring = svgElement("circle", {
      cx: x, cy: y, r: 3, class: "impact-ring"
    });
    const dx = Math.cos(angle) * length;
    const dy = Math.sin(angle) * length;
    const bendX = x + dx * 0.52 + hit.bend;
    const bendY = y + dy * 0.52 - hit.bend * 0.55;
    const endX = x + dx;
    const endY = y + dy;

    const mainCrack = svgElement("path", {
      d: `M ${x} ${y} L ${bendX} ${bendY} L ${endX} ${endY}`,
      class: "crack-path"
    });
    const branchX = x + dx * 0.55;
    const branchY = y + dy * 0.55;
    const branch = svgElement("path", {
      d: `M ${branchX} ${branchY} L ${branchX + Math.cos(angle + 1.15) * length * .34} ${branchY + Math.sin(angle + 1.15) * length * .34}`,
      class: "crack-path crack-branch"
    });
    const dot = svgElement("circle", {
      cx: x, cy: y, r: 5.5, class: "impact-dot"
    });
    const core = svgElement("circle", {
      cx: x, cy: y, r: 2.1, class: "impact-core"
    });

    group.append(ring, mainCrack, branch, dot, core);
    impactLayer.appendChild(group);
    if (!animate) {
      group.querySelectorAll(".crack-path").forEach(path => {
        path.style.animation = "none";
        path.style.strokeDashoffset = "0";
      });
      ring.remove();
    }
  }

  function renderAllHits() {
    impactLayer.replaceChildren();
    state.hits.slice(-MAX_RENDERED_HITS).forEach(hit => drawHit(hit, false));
  }

  function playTapSound() {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume();

      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(620 + Math.random() * 160, now);
      osc.frequency.exponentialRampToValueAtTime(155, now + 0.055);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {
      // Sound is optional; visual interaction remains available.
    }
  }

  function createHit(point) {
    const hit = {
      x: Math.round(point.x),
      y: Math.round(point.y),
      angle: Math.random() * Math.PI * 2,
      length: 22 + Math.random() * 22,
      bend: -8 + Math.random() * 16,
      at: Date.now()
    };

    state.totalHits += 1;
    state.hits.push(hit);
    state.hits = state.hits.slice(-MAX_RENDERED_HITS);
    drawHit(hit, true);
    saveState();
    updateCounter();

    eggArt.classList.remove("is-shaking");
    void eggArt.offsetWidth;
    eggArt.classList.add("is-shaking");
    playTapSound();
  }

  function pointFromEvent(event) {
    const point = eggOverlay.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = eggOverlay.getScreenCTM();
    if (!matrix) return null;
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function handleEggPointer(event) {
    if (event.type === "keydown") {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      createHit({ x: 512, y: 510 });
      return;
    }
    if (event.target !== eggHitArea) return;
    const point = pointFromEvent(event);
    if (point) createHit(point);
  }

  eggOverlay.addEventListener("click", handleEggPointer);
  eggOverlay.addEventListener("keydown", handleEggPointer);

  strikeButton.addEventListener("click", () => {
    // The button is a convenience control and creates a centered demo hit.
    createHit({ x: 512 + (Math.random() - .5) * 90, y: 500 + (Math.random() - .5) * 100 });
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "صدا روشن" : "صدا خاموش";
    soundIcon.textContent = soundEnabled ? "♪" : "×";
  });

  resetButton.addEventListener("click", () => {
    const confirmed = window.confirm("تمام ضربه‌های ذخیره‌شده در این مرورگر پاک شوند؟");
    if (!confirmed) return;
    state.hits = [];
    state.totalHits = 0;
    saveState();
    renderAllHits();
    updateCounter();
  });

  renderAllHits();
  updateCounter();
})();
