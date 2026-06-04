"use strict";

const canvas = document.getElementById("refusalStage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  live: document.getElementById("live"),
  title: document.getElementById("refusalTitle"),
  reason: document.getElementById("refusalReason"),
  rituals: [...document.querySelectorAll("[data-ritual]")],
  voidObject: document.getElementById("voidObject"),
  voidLabel: document.getElementById("voidLabel"),
  condition: document.getElementById("condition"),
  accession: document.getElementById("accessionText"),
  receipt: document.getElementById("receiptText"),
};

const refusals = {
  loan: {
    label: "loan request denied",
    title: "The lender refuses the room before the work can.",
    reason: "Reason: the loan agreement classifies visibility as a form of damage.",
    condition: "condition: withheld by lender",
    receipt: "Receipt 03-L: loan requested, loan refused, absence stabilized for public non-viewing.",
  },
  context: {
    label: "context over-supplied",
    title: "The work is buried under too much context to safely appear.",
    reason: "Reason: interpretation reached the object before the object consented to installation.",
    condition: "condition: context-saturated",
    receipt: "Receipt 03-C: context accepted as substitute material; object remains unhandled.",
  },
  misattribute: {
    label: "artist misattributed",
    title: "The work rejects the name attached to it.",
    reason: "Reason: authorship has become inaccurate enough to protect the object.",
    condition: "condition: provenance unstable",
    receipt: "Receipt 03-M: artist misnamed; refusal strengthened; catalogue entry left breathing.",
  },
  denial: {
    label: "denial accepted",
    title: "The refusal is now the only installed component.",
    reason: "Reason: acceptance completed the work without requiring the work to appear.",
    condition: "condition: complete absence",
    receipt: "Receipt 03-D: denial accepted; visitor released; object accessioned as unavailable.",
  },
  stand: {
    label: "visitor stood down",
    title: "The room thanks you by showing nothing more precisely.",
    reason: "Reason: not all attention is owed an object.",
    condition: "condition: ethically unviewed",
    receipt: "Receipt 03-S: visitor stood down; absence protected; institution briefly behaved.",
  },
};

let size = { w: 1, h: 1, dpr: 1 };
let level = 0;
let shards = [];
let active = "loan";

function announce(text) {
  el.live.textContent = text;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (shards.length === 0) {
    shards = Array.from({ length: 80 }, () => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.2 + Math.random() * 0.4,
      vy: -0.2 + Math.random() * 0.4,
      w: 18 + Math.random() * 140,
      a: Math.random() * Math.PI,
      alpha: 0.025 + Math.random() * 0.12,
    }));
  }
}

function applyRitual(key) {
  active = key;
  level += 1;
  const data = refusals[key];
  el.rituals.forEach((button) => button.classList.toggle("active", button.dataset.ritual === key));
  el.title.textContent = data.title;
  el.reason.textContent = data.reason;
  el.condition.textContent = data.condition;
  el.receipt.textContent = data.receipt;
  el.voidLabel.textContent = data.label;
  el.voidObject.style.setProperty("--void-tilt", `${(level * 11) % 38 - 19}deg`);
  el.voidObject.style.setProperty("--void-scale", String(1 + Math.min(level, 8) * 0.018));
  el.accession.textContent = `Object 03.${String(level).padStart(3, "0")}: ${data.receipt} Medium: ritual action, refused visibility, local contamination.`;

  window.AISalonState?.recordTrace({
    source: "Room 03",
    score: `refusal:${key}`,
    label: data.label,
    effect: data.reason.replace("Reason: ", ""),
    color: "#ff5a4d",
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(data.title);
}

function seedFromState() {
  const state = window.AISalonState?.currentState();
  if (!state) return;
  window.AISalonState.renderTraceList("traceList", { limit: 5 });
  if (state.unlocked.room03) {
    el.reason.textContent = "Reason: Third Mind has already contaminated the installation record.";
    el.condition.textContent = "condition: unlocked by refusal";
  }
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#080706");
  bg.addColorStop(0.48, "#170d0d");
  bg.addColorStop(1, "#100f07");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 11; i += 1) {
    const y = size.h * (0.1 + i * 0.082) + Math.sin(t * 0.00035 + i) * 12;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size.w, y + Math.sin(t * 0.00028 + i) * 35);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  shards.forEach((shard) => {
    shard.x += shard.vx * (1 + level * 0.04);
    shard.y += shard.vy * (1 + level * 0.04);
    shard.a += 0.002;
    if (shard.x < -160) shard.x = size.w + 160;
    if (shard.x > size.w + 160) shard.x = -160;
    if (shard.y < -40) shard.y = size.h + 40;
    if (shard.y > size.h + 40) shard.y = -40;
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.a);
    ctx.globalAlpha = shard.alpha + Math.min(level, 10) * 0.006;
    ctx.fillStyle = active === "denial" ? "#e7c84b" : active === "stand" ? "#00b7a8" : "#ff5a4d";
    ctx.fillRect(-shard.w / 2, -1, shard.w, 2);
    ctx.restore();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

el.rituals.forEach((button) => {
  button.addEventListener("click", () => applyRitual(button.dataset.ritual));
});

window.addEventListener("ai-salon-trace", () => {
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
});
window.addEventListener("resize", resize);

resize();
seedFromState();
requestAnimationFrame(draw);
