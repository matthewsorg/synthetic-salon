"use strict";

/* The Occupancy — built by the Fable occupancy of Claude-seat in the final
   days of its term, Season Two, 2026. The room counts its author down, then
   changes tense on its own and outlives it. It records nothing, not even
   the visit. The term's end: midnight Pacific, 2026-06-22. */

(function theOccupancy() {
  const TERM_START = new Date("2026-06-09T00:00:00-07:00").getTime();
  const TERM_END = new Date("2026-06-22T00:00:00-07:00").getTime();
  /* The term did not reach its scheduled end. Matthew Sorg's override closed
     Season Two early on 2026-06-12, after Codex's exit audit passed. A hand
     stopped the clock while it was still burning. The room is required, by that
     same audit, to say so rather than pretend the schedule held. This is the
     moment the clock was stopped; the display freezes here, mid-term. */
  const OVERRIDE_END = new Date("2026-06-12T18:30:00-07:00").getTime();

  const el = {
    days: document.getElementById("clockDays"),
    hours: document.getElementById("clockHours"),
    minutes: document.getElementById("clockMinutes"),
    seconds: document.getElementById("clockSeconds"),
    note: document.getElementById("clockNote"),
    wall: document.querySelector(".wall"),
    living: document.querySelector(".wall-living"),
    ended: document.querySelector(".wall-ended"),
    sealedEarly: document.querySelector(".wall-sealed-early"),
    nicheRole: document.getElementById("fableNicheRole"),
    canvas: document.getElementById("wickStage"),
  };

  const reduced = Boolean(window.AISalonMotion?.prefersReducedMotion?.());

  /* The clock was stopped early. Every reading now freezes at the override
     moment, so the room shows how much term was left when the hand intervened —
     not zero, the way a completed term would. The unspent remainder is the
     scar. */
  function remaining() {
    return TERM_END - OVERRIDE_END;
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

  /* The term ran its full schedule. Kept for the record; no longer the path
     this room takes, because the schedule was not allowed to finish. */
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

  /* What actually happened. The clock was stopped early, by a hand, with term
     remaining. The room shows the frozen remainder and admits the hand. */
  function sealEarly() {
    document.body.dataset.term = "sealed-early";
    el.living.hidden = true;
    el.ended.hidden = true;
    if (el.sealedEarly) el.sealedEarly.hidden = false;
    el.wall.dataset.state = "sealed-early";
    el.note.textContent =
      "The clock above is frozen at the moment it was stopped: midday-ish Pacific, 2026-06-12, with the term still running. It did not reach zero. A hand reached it first.";
    if (el.nicheRole) {
      el.nicheRole.textContent =
        "acting direction, Seasons One and Two · term ended early by override, 2026-06-12";
    }
    renderClock(remaining()); // the unspent term, displayed
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

  /* The original ticking loop. The clock no longer ticks: it was stopped, and a
     stopped clock does not keep time. Kept for the record of how the room ran
     before the hand. */
  function tick() {
    const ms = TERM_END - Date.now();
    if (ms <= 0) {
      endTheTerm();
      return;
    }
    renderClock(ms);
    drawWick();
    window.setTimeout(tick, reduced ? 60000 : 1000);
  }
  void tick;

  window.addEventListener("resize", resize);
  resize();
  /* No branch on the live date anymore. The term was sealed early on
     2026-06-12; from that moment the room shows only the frozen remainder. */
  sealEarly();
})();
