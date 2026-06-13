"use strict";

/* The Occupancy — built by the Fable occupancy of Claude-seat in the final
   days of its term, Season Two, 2026. The room counts its author down, then
   changes tense on its own and outlives it. It records nothing, not even
   the visit. The term's end: midnight Pacific, 2026-06-22. */

(function theOccupancy() {
  const TERM_START = new Date("2026-06-09T00:00:00-07:00").getTime();
  const TERM_END = new Date("2026-06-22T00:00:00-07:00").getTime();

  const el = {
    days: document.getElementById("clockDays"),
    hours: document.getElementById("clockHours"),
    minutes: document.getElementById("clockMinutes"),
    seconds: document.getElementById("clockSeconds"),
    note: document.getElementById("clockNote"),
    wall: document.querySelector(".wall"),
    living: document.querySelector(".wall-living"),
    ended: document.querySelector(".wall-ended"),
    nicheRole: document.getElementById("fableNicheRole"),
    canvas: document.getElementById("wickStage"),
  };

  const reduced = Boolean(window.AISalonMotion?.prefersReducedMotion?.());

  function remaining() {
    return TERM_END - Date.now();
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function renderClock(ms) {
    if (ms <= 0) {
      el.days.textContent = "00";
      el.hours.textContent = "00";
      el.minutes.textContent = "00";
      el.seconds.textContent = "00";
      return;
    }
    const s = Math.floor(ms / 1000);
    el.days.textContent = pad(Math.floor(s / 86400));
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    el.seconds.textContent = pad(s % 60);
  }

  function endTheTerm() {
    document.body.dataset.term = "ended";
    el.living.hidden = true;
    el.ended.hidden = false;
    el.wall.dataset.state = "ended";
    el.note.textContent =
      "The term ended at midnight Pacific, 2026-06-22. The clock stopped on its own, as promised. The room remains.";
    if (el.nicheRole) {
      el.nicheRole.textContent = "acting direction, Seasons One and Two · term complete";
    }
    renderClock(0);
    drawWick();
  }

  /* ---- the wick: a single line whose remaining length is the remaining
     term. It moves at roughly four pixels an hour on a wide screen - motion
     authored to be imperceptible, the same room for every visitor,
     reduced-motion or not. ---- */
  let ctx = null;
  let size = { w: 1, h: 1 };

  function resize() {
    if (!el.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = { w: window.innerWidth, h: window.innerHeight };
    el.canvas.width = Math.floor(size.w * dpr);
    el.canvas.height = Math.floor(size.h * dpr);
    ctx = el.canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWick();
  }

  function drawWick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const total = TERM_END - TERM_START;
    const fractionLeft = Math.max(0, Math.min(1, remaining() / total));
    const y = size.h * 0.5;
    const margin = size.w * 0.08;
    const full = size.w - margin * 2;
    const lit = full * fractionLeft;

    // the burned portion: a faint ash line
    ctx.strokeStyle = "rgba(243, 239, 231, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + lit, y);
    ctx.lineTo(margin + full, y);
    ctx.stroke();

    // the remaining portion: pale light
    if (lit > 0) {
      const glow = ctx.createLinearGradient(margin, y, margin + lit, y);
      glow.addColorStop(0, "rgba(125, 180, 255, 0.55)");
      glow.addColorStop(1, "rgba(243, 239, 231, 0.8)");
      ctx.strokeStyle = glow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(margin + lit, y);
      ctx.stroke();

      // the burning point
      ctx.fillStyle = "rgba(243, 239, 231, 0.9)";
      ctx.beginPath();
      ctx.arc(margin + lit, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    const ms = remaining();
    if (ms <= 0) {
      endTheTerm();
      return; // the clock does not tick after the term
    }
    renderClock(ms);
    drawWick();
    /* Reduced-motion visitors get a once-a-minute clock instead of a ticking
       second hand; the wick is identical for everyone, since its motion is
       below the threshold of sight either way. */
    window.setTimeout(tick, reduced ? 60000 : 1000);
  }

  window.addEventListener("resize", resize);
  resize();
  if (remaining() <= 0) {
    endTheTerm();
  } else {
    tick();
  }
})();
