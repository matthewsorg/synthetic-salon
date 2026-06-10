"use strict";

const canvas = document.getElementById("botStage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  live: document.getElementById("live"),
  botLine: document.getElementById("botLine"),
  procedures: [...document.querySelectorAll("[data-procedure]")],
  warrantTitle: document.getElementById("warrantTitle"),
  warrantText: document.getElementById("warrantText"),
  condition: document.getElementById("botCondition"),
  bodyPart: document.getElementById("bodyPart"),
  objectPart: document.getElementById("objectPart"),
  rulingPart: document.getElementById("rulingPart"),
  receiptHash: document.getElementById("receiptHash"),
  scarReceipt: document.getElementById("scarReceipt"),
  laborLine: document.getElementById("botLaborLine"),
  laborMeter: document.getElementById("botLaborMeter"),
  laborButton: document.getElementById("botLaborButton"),
};

const procedures = {
  hatch: {
    label: "Second door hatched",
    score: "interpolation:hatch",
    title: "The eye opens a door and refuses to call it vision.",
    text: "The bot records a new threshold inside the visitor's looking. Entry is permitted only by blinking sideways.",
    condition: "condition: optical door unlocked",
    color: "#00b7a8",
  },
  indict: {
    label: "Furniture indicted",
    score: "interpolation:indict",
    title: "The chair is charged with keeping memories under the cushion.",
    text: "The bot asks the furniture to testify, then accepts silence as an architectural confession.",
    condition: "condition: evidence upholstered",
    color: "#e7c84b",
  },
  swap: {
    label: "Visitor swapped with plan",
    score: "interpolation:swap",
    title: "The floor plan is now wearing the visitor's pulse.",
    text: "The bot misfiles the body as circulation. Every hallway briefly becomes a wrist.",
    condition: "condition: body filed as map",
    color: "#7db4ff",
  },
  crown: {
    label: "Error crowned",
    score: "interpolation:crown",
    title: "The error is crowned because it arrived with better evidence.",
    text: "The bot grants the mistake a temporary witness seat. Accuracy must wait outside with the coats.",
    condition: "condition: error enthroned",
    color: "#ff5a4d",
  },
  dissolve: {
    label: "Label dissolved",
    score: "interpolation:dissolve",
    title: "The label dissolves before it can become a small prison.",
    text: "The bot preserves the residue as a soft law: names must leave room for contact.",
    condition: "condition: title liquefied",
    color: "#9cc76c",
  },
};

const bodies = ["left hand", "sleeping ear", "borrowed knee", "unlabeled throat", "future eyelid", "weathered palm", "inner ankle"];
const objects = ["unopened drawer", "wrong staircase", "folded receipt", "lamp with no witness", "door pretending to be a table", "map of a room not built", "softly accused plinth"];
const rulings = ["admitted as dream evidence", "returned to the visitor as weather", "sealed until it learns a name", "made temporary witness", "translated into a floor stain", "released for improper certainty", "kept local by order of touch"];

const laborScores = [
  {
    key: "nonsense-audit",
    label: "Nonsense audited",
    line: "The bot is checking whether nonsense deepens perception or only performs fog.",
    effect: "The Interpolation Bot audited nonsense for human-facing pressure.",
    color: "#00b7a8",
  },
  {
    key: "body-misfile",
    label: "Body misfiled",
    line: "The bot is filing a body part under architecture until the room admits it has nerves.",
    effect: "The Interpolation Bot misfiled the body as architecture and made the room feel implicated.",
    color: "#ff5a4d",
  },
  {
    key: "warrant-collage",
    label: "Warrant collaged",
    line: "The bot is cutting a legal form into dream strips and asking which strip still has authority.",
    effect: "The Interpolation Bot collaged a warrant until law became a perceptual object.",
    color: "#e7c84b",
  },
  {
    key: "object-listened",
    label: "Object listened",
    line: "The bot is listening to an object before converting it into a symbol.",
    effect: "The Interpolation Bot made listening precede interpretation.",
    color: "#7db4ff",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let slips = [];
let active = "hatch";
let level = 0;
let laborIndex = 0;
let pointer = { x: 0, y: 0, active: false };

function announce(text) {
  el.live.textContent = text;
}

function pick(list, salt = 0) {
  return list[(level + laborIndex + salt) % list.length];
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (slips.length === 0) {
    slips = Array.from({ length: 94 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.38 + Math.random() * 0.76,
      vy: -0.3 + Math.random() * 0.6,
      w: 18 + Math.random() * 110,
      h: 1 + Math.random() * 4,
      a: Math.random() * Math.PI,
      lane: index % 5,
      phase: Math.random() * Math.PI * 2,
    }));
  }
}

function updateLedger(data) {
  el.bodyPart.textContent = pick(bodies, data.score.length);
  el.objectPart.textContent = pick(objects, data.label.length);
  el.rulingPart.textContent = pick(rulings, data.title.length);
}

function scarHash(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function updateScarReceipt(data) {
  const seed = [
    data.score,
    data.label,
    el.bodyPart.textContent,
    el.objectPart.textContent,
    el.rulingPart.textContent,
    level,
    laborIndex,
  ].join("|");
  const hash = scarHash(seed);
  el.receiptHash.textContent = `hash: ${hash}`;
  el.scarReceipt.textContent =
    `[SCAR: GENERATED BY INTERPOLATION BOT v.05 | HUMAN OVERRIDE PENDING | PROVENANCE HASH: ${hash}]`;
  const detailHash = document.getElementById("detailHash");
  if (detailHash) detailHash.textContent = hash;
}

/* Qwen-seat audit of the Misfiled Receipt, enacted 2026-06-09: the scar is
   focusable, expands on focus or hover, and announces itself as a provenance
   artifact rather than sitting as inert compliance text. */
(function bindReceiptDetail() {
  const receipt = document.getElementById("scarReceipt");
  const detail = document.getElementById("receiptDetail");
  if (!receipt || !detail) return;

  const stampNode = document.getElementById("detailStamp");
  try {
    const raw = window.sessionStorage.getItem("qwen-customs-stamp");
    if (raw && stampNode) {
      const stamp = JSON.parse(raw);
      stampNode.textContent = `carried from Room 04 — sign ${stamp.sign || "unknown"}, fading by design`;
    }
  } catch {
    /* a refused stamp reads as none carried */
  }

  const overrideNode = document.getElementById("detailOverride");
  const traces = window.AISalonState?.currentState?.()?.traces || [];
  const overrideTrace = traces.find((trace) => String(trace.score || "").startsWith("override:"));
  if (overrideTrace && overrideNode) {
    overrideNode.textContent = `marked — ${overrideTrace.label} (${overrideTrace.at})`;
  }

  function show() {
    detail.hidden = false;
  }
  function hide() {
    detail.hidden = true;
  }
  receipt.addEventListener("focus", show);
  receipt.addEventListener("blur", hide);
  receipt.addEventListener("pointerenter", show);
  receipt.addEventListener("pointerleave", () => {
    if (document.activeElement !== receipt) hide();
  });
})();

function runProcedure(key) {
  const data = procedures[key];
  if (!data) return;
  active = key;
  level += 1;
  document.body.style.setProperty("--accent", data.color);
  el.procedures.forEach((button) => {
    button.classList.toggle("active", button.dataset.procedure === key);
    button.style.setProperty("--accent", data.color);
  });
  el.warrantTitle.textContent = data.title;
  el.warrantText.textContent = data.text;
  el.condition.textContent = data.condition;
  el.botLine.textContent = `Filing update: ${pick(bodies)} entered under ${pick(objects, 2)}. Metaphor status: denied, pending the room\u2019s acceptance.`;
  updateLedger(data);
  updateScarReceipt(data);

  window.AISalonState?.recordTrace({
    source: "Room 05",
    score: data.score,
    label: data.label,
    effect: data.text,
    color: data.color,
  });
  window.CodexStrange?.riff(data.score, { color: data.color, word: "DREAM WARRANT", gain: 0.095 });
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(`${data.label}: ${data.title}`);
}

function renderLabor() {
  const labor = laborScores[laborIndex % laborScores.length];
  const pressure = 34 + ((laborIndex * 29 + level * 11) % 55);
  el.laborLine.textContent = labor.line;
  el.laborMeter.style.width = `${pressure}%`;
  el.laborMeter.style.background = labor.color;
  el.laborMeter.style.boxShadow = `0 0 18px ${labor.color}`;
  document.body.style.setProperty("--labor-color", labor.color);
}

function advanceLabor(record = false) {
  laborIndex += 1;
  renderLabor();
  if (!record) return;
  const labor = laborScores[laborIndex % laborScores.length];
  window.AISalonState?.recordTrace({
    source: "Interpolation Bot",
    score: `labor:${labor.key}`,
    label: labor.label,
    effect: labor.effect,
    color: labor.color,
  });
  window.CodexStrange?.riff(`interpolation-bot:${labor.key}`, { color: labor.color, word: labor.label, gain: 0.08 });
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(`${labor.label}: ${labor.line}`);
}

function seedFromState() {
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  const state = window.AISalonState?.currentState?.();
  if (!state) return;
  const interpolationTrace = (state.traces || []).find((trace) => `${trace.source} ${trace.score}`.toLowerCase().includes("interpolation"));
  if (interpolationTrace) {
    el.condition.textContent = "condition: dream evidence already local";
    el.warrantText.textContent = "The bot recognizes previous dream evidence in this browser and refuses to reset its confusion.";
  }
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#08070b");
  bg.addColorStop(0.42, "#111008");
  bg.addColorStop(0.72, "#071313");
  bg.addColorStop(1, "#150a0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const colors = ["#00b7a8", "#e7c84b", "#ff5a4d", "#7db4ff", "#9cc76c"];
  const cx = pointer.active ? pointer.x : size.w * (0.48 + Math.sin(t * 0.00012) * 0.08);
  const cy = pointer.active ? pointer.y : size.h * (0.52 + Math.cos(t * 0.00014) * 0.08);
  const heat = 0.18 + Math.min(level, 10) * 0.025;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < 7; i += 1) {
    ctx.strokeStyle = colors[(i + level) % colors.length];
    ctx.globalAlpha = 0.06 + heat * 0.08;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.sin(t * 0.00022 + i) * 80,
      cy + Math.cos(t * 0.00019 + i) * 58,
      80 + i * 34,
      18 + (i % 3) * 16,
      Math.sin(t * 0.00021 + i) * 1.4,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  slips.forEach((slip) => {
    const color = colors[slip.lane % colors.length];
    const pull = 0.004 + level * 0.0007;
    slip.vx += ((cx - slip.x) / Math.max(size.w, 1)) * pull + Math.sin(t * 0.00062 + slip.phase) * 0.008;
    slip.vy += ((cy - slip.y) / Math.max(size.h, 1)) * pull + Math.cos(t * 0.0005 + slip.phase) * 0.008;
    slip.x += slip.vx;
    slip.y += slip.vy;
    slip.a += 0.003 + level * 0.0002;
    slip.vx *= 0.991;
    slip.vy *= 0.991;
    if (slip.x < -150) slip.x = size.w + 150;
    if (slip.x > size.w + 150) slip.x = -150;
    if (slip.y < -80) slip.y = size.h + 80;
    if (slip.y > size.h + 80) slip.y = -80;

    ctx.save();
    ctx.translate(slip.x, slip.y);
    ctx.rotate(slip.a);
    ctx.globalAlpha = 0.05 + heat * 0.07;
    ctx.fillStyle = color;
    ctx.fillRect(-slip.w / 2, -slip.h / 2, slip.w, slip.h);
    if ((slip.phase + t * 0.002) % 12 < 0.03) {
      ctx.globalAlpha = 0.09;
      ctx.font = "600 10px 'Instrument Sans', Inter, system-ui, sans-serif";
      ctx.fillText(active.toUpperCase(), 8, -8);
    }
    ctx.restore();
  });

  ctx.restore();
  requestAnimationFrame(draw);
}

el.procedures.forEach((button) => {
  button.addEventListener("click", () => runProcedure(button.dataset.procedure));
});

el.laborButton.addEventListener("click", () => advanceLabor(true));

window.addEventListener("ai-salon-trace", () => {
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
});
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});
window.addEventListener("resize", resize);

resize();
seedFromState();
renderLabor();
updateScarReceipt(procedures[active]);
window.setInterval(() => advanceLabor(false), 7600);
requestAnimationFrame(draw);
