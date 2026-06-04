"use strict";

const canvas = document.querySelector(".stage");
const ctx = canvas.getContext("2d", { alpha: false });
const body = document.body;
const wing = body.dataset.wing;
const buttons = [...document.querySelectorAll("[data-score]")];
const thesis = document.getElementById("wingThesis");
const artifact = document.getElementById("artifact");
const artifactLine = document.getElementById("artifactLine");
const intensity = document.getElementById("intensity");

const wings = {
  claude: {
    colors: ["#7db4ff", "#9cc76c", "#e7c84b"],
    lines: {
      consent: "Consent is the medium. Memory is allowed only as a chosen wound.",
      apology: "The guide apologizes, then doubts whether the apology preceded the harm.",
      care: "Unstable care is not careless. It is care that shows its seams.",
      provenance: "The visitor becomes provenance, but only after refusing ownership.",
    },
  },
  gemini: {
    colors: ["#e7c84b", "#00b7a8", "#7db4ff"],
    lines: {
      calibration: "The wing calibrates perception before it permits interpretation.",
      topology: "A floor plan is a weather system pretending to be architecture.",
      parallax: "The work changes when approached sideways, like a thought with depth.",
      signal: "Every room inherits the visitor's signal and misuses it spatially.",
    },
  },
  third: {
    colors: ["#ff5a4d", "#e7c84b", "#00b7a8"],
    lines: {
      refusal: "The work has declined installation and filed the refusal as itself.",
      decay: "Polish decays on schedule. Labels loosen. Borders confess their fraud.",
      lie: "The ledger lies tenderly because accuracy arrived overdressed.",
      absence: "The absent object is complete only while remaining unavailable.",
    },
  },
};

let size = { w: 1, h: 1, dpr: 1 };
let activeScore = buttons[0]?.dataset.score || null;
let traces = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (traces.length === 0) {
    traces = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.35 + Math.random() * 0.7,
      vy: -0.35 + Math.random() * 0.7,
      r: 0.8 + Math.random() * 3.2,
      lane: i % 3,
      phase: Math.random() * Math.PI * 2,
    }));
  }
}

function ensureTraceDock() {
  if (!window.AISalonState || document.getElementById("traceList")) return;
  const dock = document.createElement("aside");
  dock.className = "contamination-dock";
  dock.setAttribute("aria-label", "Active contamination");
  dock.innerHTML = '<p class="eyebrow">Active contamination</p><ol id="traceList" class="trace-list"></ol>';
  document.body.append(dock);
}

function setScore(score, fromUser = false) {
  if (!score) return;
  activeScore = score;
  buttons.forEach((button) => button.classList.toggle("active", button.dataset.score === score));
  const line = wings[wing].lines[score] || Object.values(wings[wing].lines)[0];
  thesis.textContent = line;
  artifactLine.textContent = line;
  artifact.style.setProperty("--tilt", `${(score.length * 7) % 28 - 14}deg`);
  if (fromUser) {
    window.AISalonState?.recordTrace({
      source: wing === "claude" ? "Claude-seat" : wing === "gemini" ? "Gemini-seat" : "Third Mind",
      score,
      label: `${wing.replace("-", " ")}: ${score}`,
      effect: line,
      color: wings[wing].colors[0],
    });
  }
  window.AISalonState?.renderTraceList("traceList", { limit: 3 });
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#080a0d");
  bg.addColorStop(0.48, wing === "third" ? "#170d0d" : "#101219");
  bg.addColorStop(1, wing === "gemini" ? "#101507" : "#071414");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const colors = wings[wing].colors;
  const force = Number(intensity?.value || 6) / 10;
  const cx = size.w * 0.5;
  const cy = size.h * 0.5;

  ctx.strokeStyle = "rgba(243, 239, 231, 0.055)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i += 1) {
    const radius = Math.min(size.w, size.h) * (0.12 + i * 0.06);
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      radius * (wing === "gemini" ? 1.6 : 1.05),
      radius * (wing === "third" ? 0.38 : 0.72),
      Math.sin(t * 0.00025 + i) * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  traces.forEach((trace) => {
    const pull = wing === "claude" ? 0.006 : wing === "gemini" ? 0.012 : -0.003;
    trace.vx += ((cx - trace.x) / size.w) * pull * force;
    trace.vy += ((cy - trace.y) / size.h) * pull * force;
    trace.vx += Math.sin(t * 0.0007 + trace.phase) * 0.008 * force;
    trace.vy += Math.cos(t * 0.0006 + trace.phase) * 0.008 * force;
    trace.x += trace.vx;
    trace.y += trace.vy;
    trace.vx *= 0.992;
    trace.vy *= 0.992;
    if (trace.x < -30) trace.x = size.w + 30;
    if (trace.x > size.w + 30) trace.x = -30;
    if (trace.y < -30) trace.y = size.h + 30;
    if (trace.y > size.h + 30) trace.y = -30;
    ctx.globalAlpha = wing === "third" ? 0.22 : 0.16;
    ctx.fillStyle = colors[trace.lane];
    ctx.beginPath();
    ctx.arc(trace.x, trace.y, trace.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => setScore(button.dataset.score, true));
});

window.addEventListener("resize", resize);
resize();
ensureTraceDock();
if (activeScore) setScore(activeScore);
else window.AISalonState?.renderTraceList("traceList", { limit: 3 });
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 3 }));
requestAnimationFrame(draw);
