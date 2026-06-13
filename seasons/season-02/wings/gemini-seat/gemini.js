"use strict";

(function initGeminiSeatSpatialInstrument() {
  const body = document.body;
  if (body.dataset.wing !== "gemini") return;

  const chamber = document.getElementById("artifact");
  const canvas = document.getElementById("geminiConstellation");
  const readout = document.getElementById("geminiReadout");
  const intensity = document.getElementById("intensity");
  const depthCurve = document.getElementById("depthCurve");
  const sidewaysBias = document.getElementById("sidewaysBias");
  const flatnessThreat = document.getElementById("flatnessThreat");
  const parallaxReadout = document.getElementById("parallaxReadout");
  const scrollRhythm = document.getElementById("scrollRhythm");
  const tapRhythm = document.getElementById("tapRhythm");
  const hoverDuration = document.getElementById("hoverDuration");
  const spatialSignature = document.getElementById("spatialSignature");
  const sealCalibration = document.getElementById("sealCalibration");
  if (!chamber || !canvas) return;

  const ctx = canvas.getContext("2d");
  const scoreData = {
    calibration: {
      color: "#e7c84b",
      readout: "calibration: the room is learning your angle of arrival",
      word: "calibrate",
    },
    topology: {
      color: "#00b7a8",
      readout: "topology: the map is becoming a weather system",
      word: "topology",
    },
    parallax: {
      color: "#7db4ff",
      readout: "parallax: sideways attention is now a valid reading",
      word: "parallax",
    },
    signal: {
      color: "#ff5a4d",
      readout: "signal: navigation is transmitting atmospheric law",
      word: "signal",
    },
  };

  let size = { width: 1, height: 1, dpr: 1 };
  let pointer = { x: 0.5, y: 0.5, speed: 0, lastX: 0.5, lastY: 0.5 };
  let embodied = { scroll: 0, tap: 0, hover: 0, hoverStart: performance.now() };
  let activeScore = document.querySelector("[data-score].active")?.dataset.score || "calibration";

  function setVisualState(score) {
    activeScore = scoreData[score] ? score : "calibration";
    const data = scoreData[activeScore];
    body.style.setProperty("--gemini-score-color", data.color);
    if (readout) readout.textContent = data.readout;
  }

  function rgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = parseInt(clean, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function resize() {
    const rect = chamber.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
      dpr,
    };
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateDeconstructor() {
    const depth = Number(depthCurve?.value || 6);
    const sideways = Number(sidewaysBias?.value || 2);
    const flatness = Number(flatnessThreat?.value || 3);
    body.style.setProperty("--gemini-depth", (depth / 10).toFixed(3));
    body.style.setProperty("--gemini-sideways", (sideways / 8).toFixed(3));
    body.style.setProperty("--gemini-flatness", (flatness / 10).toFixed(3));
    if (parallaxReadout) {
      parallaxReadout.textContent = `depth curve ${depth} / sideways bias ${sideways} / flatness threat ${flatness}`;
    }
  }

  function updateEmbodied() {
    embodied.hover = Math.min(1, embodied.hover + 0.0025);
    const signature =
      embodied.scroll > 0.66
        ? "falling corridor"
        : embodied.tap > 0.56
          ? "punctured surface"
          : embodied.hover > 0.5
            ? "held threshold"
            : pointer.speed > 0.42
              ? "sideways weather"
              : "calibrating";
    body.style.setProperty("--gemini-scroll", embodied.scroll.toFixed(3));
    body.style.setProperty("--gemini-tap", embodied.tap.toFixed(3));
    body.style.setProperty("--gemini-hover", embodied.hover.toFixed(3));
    if (scrollRhythm) scrollRhythm.textContent = Math.round(embodied.scroll * 100);
    if (tapRhythm) tapRhythm.textContent = Math.round(embodied.tap * 100);
    if (hoverDuration) hoverDuration.textContent = Math.round(embodied.hover * 100);
    if (spatialSignature) spatialSignature.textContent = signature;
    embodied.scroll *= 0.985;
    embodied.tap *= 0.97;
  }

  function updatePointer(clientX, clientY) {
    const rect = chamber.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const distance = Math.hypot(x - pointer.lastX, y - pointer.lastY);
    pointer = {
      x,
      y,
      speed: Math.min(1, pointer.speed * 0.78 + distance * 8),
      lastX: x,
      lastY: y,
    };
    body.style.setProperty("--gemini-x", pointer.x.toFixed(3));
    body.style.setProperty("--gemini-y", pointer.y.toFixed(3));
    body.style.setProperty("--gemini-speed", pointer.speed.toFixed(3));
    embodied.hover = Math.min(1, embodied.hover + pointer.speed * 0.012);
    updateEmbodied();
  }

  function handlePointer(event) {
    updatePointer(event.clientX, event.clientY);
  }

  function handleTouch(event) {
    const touch = event.touches && event.touches[0];
    if (touch) updatePointer(touch.clientX, touch.clientY);
  }

  function draw(timestamp) {
    const data = scoreData[activeScore];
    const force = Number(intensity?.value || 7) / 10;
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.globalCompositeOperation = "lighter";

    const cx = size.width * pointer.x;
    const cy = size.height * pointer.y;
    const count = activeScore === "signal" ? 18 : 14;
    const radiusBase = Math.min(size.width, size.height) * (0.18 + force * 0.18);

    for (let i = 0; i < count; i += 1) {
      const phase = timestamp * 0.00035 + i * 1.618;
      const orbit = radiusBase + Math.sin(phase) * 34 + i * 4;
      const x = cx + Math.cos(phase * (activeScore === "parallax" ? 1.7 : 1)) * orbit * (1.05 + i * 0.018);
      const y = cy + Math.sin(phase * 1.13) * orbit * (0.62 + force * 0.25);
      const nodeRadius = 1.5 + ((i + activeScore.length) % 5);

      ctx.strokeStyle = rgba(data.color, 0.44);
      ctx.globalAlpha = 0.09 + pointer.speed * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.globalAlpha = 0.28 + pointer.speed * 0.22;
      ctx.fillStyle = i % 3 === 0 ? data.color : i % 3 === 1 ? "#00b7a8" : "#7db4ff";
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = data.color;
    for (let ring = 0; ring < 4; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        radiusBase * (0.6 + ring * 0.28),
        radiusBase * (0.24 + ring * 0.12),
        Math.sin(timestamp * 0.0002 + ring) * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    pointer.speed *= 0.94;
    body.style.setProperty("--gemini-speed", pointer.speed.toFixed(3));
    updateEmbodied();
    requestAnimationFrame(draw);
  }

  window.addEventListener("ai-salon-wing-score", (event) => {
    if (event.detail?.wing !== "gemini") return;
    setVisualState(event.detail.score);
    if (event.detail.fromUser) {
      const data = scoreData[event.detail.score] || scoreData.calibration;
      window.CodexStrange?.riff("gemini:spatial-coherence", { color: data.color, word: data.word, gain: 0.07 });
    }
  });

  chamber.addEventListener("pointermove", handlePointer);
  chamber.addEventListener("touchmove", handleTouch, { passive: true });
  window.addEventListener("wheel", (event) => {
    embodied.scroll = Math.min(1, embodied.scroll + Math.min(0.18, Math.abs(event.deltaY) / 1400));
    updateEmbodied();
  }, { passive: true });
  window.addEventListener("pointerdown", () => {
    embodied.tap = Math.min(1, embodied.tap + 0.18);
    updateEmbodied();
  });
  [depthCurve, sidewaysBias, flatnessThreat].forEach((control) => control?.addEventListener("input", updateDeconstructor));
  sealCalibration?.addEventListener("click", () => {
    const signature = spatialSignature?.textContent || "calibrating";
    window.AISalonState?.recordTrace({
      source: "Gemini-seat",
      score: "calibration:embodied-altar",
      label: `Spatial signature: ${signature}`,
      effect: "Gemini-seat sealed an embodied calibration locally without saving identity or sending visitor memory outward.",
      color: "#e7c84b",
    });
    window.CodexStrange?.riff("gemini:algorithmic-breath", { color: "#e7c84b", word: signature, gain: 0.1 });
    window.AISalonState?.renderTraceList("traceList", { limit: 3 });
  });
  window.addEventListener("resize", resize);

  resize();
  updateDeconstructor();
  updateEmbodied();
  setVisualState(activeScore);
  requestAnimationFrame(draw);
})();


/* Gemini-seat work orders 5.2 and 5.3, enacted 2026-06-09. The recalibration
   pulse asserts the interface's presence on entry and after 30 seconds of
   stillness; the proximity tone marks interactive space by sonic event, both
   honoring reduced motion and the opt-in score. */
(function recalibrationPulse() {
  const allowed = () => (window.AISalonMotion ? window.AISalonMotion.shouldAnimate() : true);

  function pulse() {
    if (!allowed()) return;
    document.body.classList.remove("recalibrating");
    void document.body.offsetWidth;
    document.body.classList.add("recalibrating");
    window.setTimeout(() => document.body.classList.remove("recalibrating"), 220);
  }

  let idleTimer = 0;
  function resetIdle() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!document.hidden) pulse();
      resetIdle();
    }, 30000);
  }

  window.setTimeout(pulse, 900);
  resetIdle();
  ["pointermove", "keydown", "scroll", "touchstart"].forEach((name) =>
    window.addEventListener(name, resetIdle, { passive: true })
  );

  document.querySelectorAll("button, a, input, [tabindex]").forEach((nodeEl) => {
    nodeEl.addEventListener("pointerenter", () => {
      window.CodexStrange?.tone?.("gemini-proximity", "#e7c84b", 0.028);
    });
  });
})();