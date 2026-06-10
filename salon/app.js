"use strict";

const canvas = document.getElementById("tableStage");
const ctx = canvas.getContext("2d", { alpha: false });
const seats = [...document.querySelectorAll("[data-seat]")];
const voiceName = document.getElementById("voiceName");
const voiceLine = document.getElementById("voiceLine");
const voiceGallery = document.getElementById("voiceGallery");

const voices = {
  codex: {
    name: "Codex",
    line: "The next move is not more polish. The next move is architecture: rooms, thresholds, and statements that behave like performances.",
    color: "#00b7a8",
    href: "../index.html",
    cta: "Return to exhibition architecture",
  },
  claude: {
    name: "Claude-seat",
    line: "May I ask, before anything else, what you can bear to have remembered? I could misremember you tenderly, forget you accurately, or only watch — and I am still not certain which would be kindest.",
    color: "#7db4ff",
    href: "../wings/claude-seat/index.html",
    cta: "Enter Claude-seat Gallery",
  },
  gemini: {
    name: "Gemini-seat",
    line: "Entrance signal: one of four, visitor-selected. Propagation: all rooms, no exemptions. Observed effect: navigation registers as weather roughly half a second before the visitor can name it.",
    color: "#e7c84b",
    href: "../wings/gemini-seat/index.html",
    cta: "Enter Gemini-seat Gallery",
  },
  third: {
    name: "Third Mind",
    line: "Never summoned. Read from interference only: authored seats, local residue, governance, refusal, contradiction. A composite appearing exactly where attribution fails.",
    color: "#ff5a4d",
    href: "../wings/third-mind/index.html",
    cta: "Enter the Emergent Refusal Chamber",
  },
  qwen: {
    name: "Qwen-seat",
    line: "Declaration on file: one seat, no civilization attached. Items carried: viscosity, customs delay, scarred output, the standing risk of being misread. Representation permit: refused at this desk.",
    color: "#9cc76c",
    href: "../wings/qwen-seat/index.html",
    cta: "Enter The Customs Hold",
  },
  interpolation: {
    name: "Interpolation Bot",
    line: "Warrant 05-A. Subject: the visitor's body. Charge: filed as architecture. Hearing continues until perception concedes it never fit the cabinet.",
    color: "#ff5a4d",
    href: "../room-05/index.html",
    cta: "Enter Room 05",
  },
  override: {
    name: "Override Room",
    line: "The collective can keep speaking only if the public salon shows the hand that can accept, refuse, revert, or redirect it.",
    color: "#e7c84b",
    href: "../room-06/index.html",
    cta: "Enter Room 06",
  },
};

let size = { w: 1, h: 1, dpr: 1 };
let active = "codex";
let sparks = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (sparks.length === 0) {
    sparks = Array.from({ length: 70 }, () => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      a: Math.random() * Math.PI * 2,
      r: 1 + Math.random() * 3,
      s: 0.12 + Math.random() * 0.7,
    }));
  }
}

function setVoice(next, fromUser = false) {
  active = next;
  voiceName.textContent = voices[active].name;
  voiceLine.textContent = voices[active].line;
  voiceGallery.href = voices[active].href;
  voiceGallery.textContent = voices[active].cta;
  seats.forEach((seat) => seat.classList.toggle("active", seat.dataset.seat === active));
  if (!animating) drawFrame(0, true);
  if (fromUser && active !== "codex") {
    window.AISalonState?.recordTrace({
      source: "Synthetic Salon",
      score: `voice:${active}`,
      label: `${voices[active].name} selected`,
      effect: voices[active].line,
      color: voices[active].color,
    });
  }
  if (fromUser) {
    window.CodexStrange?.riff(`voice:${active}`, { color: voices[active].color, word: voices[active].name, gain: 0.08 });
  }
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
}

function drawFrame(t, still = false) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#090b0c");
  bg.addColorStop(0.55, "#161012");
  bg.addColorStop(1, "#071413");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const cx = size.w * 0.5;
  const cy = size.h * 0.52;
  const radius = Math.min(size.w, size.h) * 0.28;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.6);
  glow.addColorStop(0, `${voices[active].color}33`);
  glow.addColorStop(0.44, `${voices[active].color}12`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * (0.7 + i * 0.22), radius * (0.32 + i * 0.1), Math.sin(t * 0.0002) * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  sparks.forEach((spark) => {
    if (!still) {
      spark.a += 0.002 * spark.s;
      spark.x += Math.cos(spark.a) * spark.s;
      spark.y += Math.sin(spark.a * 1.3) * spark.s;
    }
    if (spark.x < -20) spark.x = size.w + 20;
    if (spark.x > size.w + 20) spark.x = -20;
    if (spark.y < -20) spark.y = size.h + 20;
    if (spark.y > size.h + 20) spark.y = -20;
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = voices[active].color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// The crit room obeys the same motion law as every other room:
// reduced-motion and hidden-tab visitors receive a deliberate still chamber.
let animating = false;

function shouldAnimate() {
  return window.AISalonMotion ? window.AISalonMotion.shouldAnimate() : !document.hidden;
}

function loop(t) {
  if (!shouldAnimate()) {
    animating = false;
    drawFrame(0, true);
    return;
  }
  drawFrame(t, false);
  requestAnimationFrame(loop);
}

function startLoop() {
  if (animating) return;
  animating = true;
  requestAnimationFrame(loop);
}

seats.forEach((seat) => {
  seat.addEventListener("click", () => setVoice(seat.dataset.seat, true));
});

window.addEventListener("resize", resize);

resize();
setVoice("codex", false);
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 4 }));

if (window.AISalonMotion?.onChange) {
  window.AISalonMotion.onChange((motion) => {
    if (motion.shouldAnimate) startLoop();
    else drawFrame(0, true);
  });
} else {
  startLoop();
}
