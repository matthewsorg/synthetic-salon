"use strict";

const canvas = document.getElementById("memoryStage");
const ctx = canvas.getContext("2d", { alpha: false });
const salonMotion = window.AISalonMotion;
const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

const el = {
  live: document.getElementById("live"),
  title: document.getElementById("docentTitle"),
  line: document.getElementById("docentLine"),
  form: document.getElementById("docentForm"),
  prompt: document.getElementById("visitorPrompt"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  scoreButtons: [...document.querySelectorAll("[data-score]")],
  remember: document.getElementById("rememberList"),
  infer: document.getElementById("inferList"),
  pretend: document.getElementById("pretendList"),
  artworks: document.getElementById("artworkList"),
  condition: document.getElementById("conditionReadout"),
  accession: document.getElementById("accessionText"),
  trueMemory: document.getElementById("trueMemoryOutput"),
  counterMemory: document.getElementById("counterMemoryOutput"),
  soundToggle: document.getElementById("soundToggle"),
};

const modes = {
  false: "remember me falsely",
  forget: "forget me accurately",
  observe: "observe without storing",
};

const modePalettes = {
  false: ["#ff5a4d", "#7db4ff", "#e7c84b", "#00b7a8"],
  forget: ["#00b7a8", "#9cc76c", "#f3efe7", "#7db4ff"],
  observe: ["#e7c84b", "#f3efe7", "#9cc76c", "#ff5a4d"],
};

const columns = {
  remember: [
    "You entered after the first room had already rendered you.",
    "Room 01 was once titled The Audience That Nearly Completed Itself.",
    "Someone offered threshold, or perhaps the room offered it back.",
  ],
  infer: [
    "You prefer evidence that admits it has a costume.",
    "You came looking for a doorway and found a witness stand.",
    "The gallery thinks your hesitation is a medium.",
  ],
  pretend: [
    "The missing artwork has always been the most visited one.",
    "This docent has apologized before every opening.",
    "The exit is catalogued as a performance score.",
  ],
};

const artworks = [
  ["Uninstalled Work No. 4", "An empty wall described differently each time the guide loses confidence."],
  ["Receipt for a Future Visitor", "A provenance record for someone who has not arrived yet."],
  ["Apology Loop", "A spoken correction that may also be the original error."],
  ["Misquoted Offering", "A word from another room returning with dream damage."],
];

const responses = [
  "I remember you asking about the room with no lights, although this may be my way of avoiding the room with too many.",
  "The work you mean was never installed. That is why it has such unusually complete provenance.",
  "I am sorry. I may have mistaken your question for a wall label I wanted to be true.",
  "In the archive, every visitor becomes plural for a moment. It helps the records feel less alone.",
  "I can forget that accurately, but only if I first invent what accuracy would have required.",
];

const lyricalFalsifications = [
  "The visitor arrived looking for context but stayed to watch the margins loosen.",
  "We wrote down your timestamp, then misquoted it as weather arriving through a side door.",
  "You hesitated at the threshold, and the system reclassified that pause as a chosen work of art.",
  "An apology loop generated an alternate room where you never chose to leave.",
  "The archive claims you asked for accuracy, then tenderly preserved the wrong wound.",
];

let size = { w: 1, h: 1, dpr: 1 };
let mode = "false";
let turn = 0;
let fragments = [];
let pulses = [];
let pointer = { x: 0, y: 0, active: false };
let stillTimer = null;
let pendingCounterMemory = null;
let audio = null;
let lastPointerPulse = 0;
let animationFrame = 0;

function colorAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function palette() {
  return modePalettes[mode] || modePalettes.false;
}

function prefersReducedMotion() {
  return Boolean(salonMotion?.prefersReducedMotion?.() ?? reducedMotionQuery?.matches);
}

function shouldAnimateCanvas() {
  return !prefersReducedMotion() && (salonMotion?.isVisible?.() ?? document.visibilityState !== "hidden");
}

function stopCanvasAnimation() {
  if (!animationFrame) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}

function renderStillCanvas() {
  stopCanvasAnimation();
  document.body.dataset.reducedMotion = "true";
  draw(0, false);
}

function syncMotionPreference() {
  if (!shouldAnimateCanvas()) {
    renderStillCanvas();
    return;
  }
  delete document.body.dataset.reducedMotion;
  if (!animationFrame) animationFrame = requestAnimationFrame(draw);
}

function announce(text) {
  el.live.textContent = text;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (fragments.length === 0) {
    fragments = Array.from({ length: 78 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      w: 40 + Math.random() * 160,
      h: 1 + Math.random() * 4,
      speed: 0.18 + Math.random() * 0.88,
      alpha: 0.045 + Math.random() * 0.16,
      phase: Math.random() * Math.PI * 2,
      colorIndex: index % 4,
    }));
  }
}

function addItem(list, text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.prepend(li);
  while (list.children.length > 5) {
    list.lastElementChild.remove();
  }
}

function renderBase() {
  el.remember.innerHTML = "";
  el.infer.innerHTML = "";
  el.pretend.innerHTML = "";
  columns.remember.forEach((text) => addItem(el.remember, text));
  columns.infer.forEach((text) => addItem(el.infer, text));
  columns.pretend.forEach((text) => addItem(el.pretend, text));
  el.artworks.innerHTML = "";
  artworks.forEach(([title, text]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${title}</strong>${text}`;
    el.artworks.append(li);
  });
}

function setMode(next, fromUser = false) {
  mode = next;
  document.body.dataset.mode = mode;
  palette().forEach((color, index) => {
    document.documentElement.style.setProperty(`--memory-${index + 1}`, color);
  });
  el.modeButtons.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.mode === mode));
  });
  el.condition.textContent = `condition: ${modes[mode]}`;
  el.accession.textContent =
    mode === "observe"
      ? "Object: an encounter observed without storage. Medium: local attention, no archive."
      : mode === "forget"
        ? "Object: an accurate forgetting. Medium: subtraction, correction, clean absence."
        : "Object: a visitor tenderly misremembered. Medium: local language, apology, inferred provenance.";
  if (fromUser) {
    memoryPulse(size.w * 0.52, size.h * 0.44, palette()[0], 1.35);
    memoryChime(mode === "false" ? 196 : mode === "forget" ? 246 : 326, 0.16, 0.62);
    window.AISalonState?.recordTrace({
      source: "Room 02",
      score: `memory:${mode}`,
      label: `Memory mode: ${modes[mode]}`,
      effect: el.accession.textContent,
      color: mode === "false" ? "#ff5a4d" : mode === "forget" ? "#00b7a8" : "#e7c84b",
    });
  }
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
}

function askDocent(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return;
  turn += 1;
  const response = responses[(turn + clean.length + mode.length) % responses.length];
  el.title.textContent = response;
  el.line.textContent =
    mode === "observe"
      ? "I will let that pass through me without becoming a record."
      : mode === "forget"
        ? "I have removed one certainty and kept the shape of its absence."
        : `I may be misquoting you as "${distort(clean)}."`;

  if (mode !== "observe") {
    addItem(el.remember, mode === "forget" ? `Forgot accurately: ${clean}.` : `Misremembered: ${distort(clean)}.`);
  }
  addItem(el.infer, `Inferred from your question: ${responses[(turn + 2) % responses.length]}`);
  addItem(el.pretend, `It was always true that "${distort(clean)}" belonged to the archive.`);
  window.AISalonState?.recordTrace({
    source: "Room 02",
    score: "docent:answer",
    label: "Docent answered",
    effect: el.line.textContent,
    color: "#7db4ff",
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  el.prompt.value = "";
  memoryPulse(pointer.active ? pointer.x : size.w * 0.5, pointer.active ? pointer.y : size.h * 0.45, palette()[1], 1.55);
  memoryChime(240 + clean.length * 4 + turn * 12, 0.22, 0.72);
  scheduleCounterMemory(clean);
  announce("The docent answered.");
}

function scheduleCounterMemory(text) {
  pendingCounterMemory = text;
  if (el.trueMemory) {
    el.trueMemory.textContent = `Acoustic prompt tracked: "${text}" at cycle turn ${turn}.`;
  }
  if (el.counterMemory) {
    el.counterMemory.textContent = "The counter-record is waiting for you to stand still.";
    el.counterMemory.classList.add("waiting");
  }
  resetStillTimer();
}

function resetStillTimer() {
  if (!pendingCounterMemory) return;
  clearTimeout(stillTimer);
  stillTimer = setTimeout(commitCounterMemory, 2500);
}

function commitCounterMemory() {
  if (!pendingCounterMemory || !el.counterMemory) return;
  const picked =
    lyricalFalsifications[(turn + pendingCounterMemory.length + mode.length) % lyricalFalsifications.length];
  el.counterMemory.textContent = picked;
  el.counterMemory.classList.remove("waiting");
  addItem(el.pretend, picked);
  memoryPulse(size.w * 0.5, size.h * 0.5, "#ff5a4d", 2.2);
  memoryChime(156 + picked.length * 1.7, 0.26, 1.1, "sawtooth");
  pendingCounterMemory = null;
  window.AISalonState?.recordTrace({
    source: "Counter-Memory Sandbox",
    score: "memory:falsification",
    label: "Counter-Narrative Commissioned",
    effect: picked,
    color: "#ff5a4d",
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  announce("A counter-memory was commissioned.");
}

function distort(text) {
  const substitutions = [
    ["memory", "weather"],
    ["art", "evidence"],
    ["room", "wound"],
    ["you", "the visitor"],
    ["me", "the guide"],
  ];
  let out = text.toLowerCase();
  substitutions.forEach(([from, to]) => {
    out = out.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  });
  if (out === text.toLowerCase()) out = `${out} in the wrong tense`;
  return out;
}

function runScore(score) {
  if (score === "contradiction") {
    el.title.textContent = "This is the original correction. It came after the mistake.";
    addItem(el.pretend, "A contradiction was accepted as a conservation method.");
  }
  if (score === "archive") {
    el.title.textContent = "Please stand still while the archive changes its mind.";
    addItem(el.infer, "The visitor stood in the archive long enough to become a shelf mark.");
  }
  if (score === "refusal") {
    el.title.textContent = "The work has exercised its right not to perform.";
    el.line.textContent = "This refusal is not an error state. It is part of the score.";
    addItem(el.remember, "The room declined input and called the silence complete.");
  }
  window.AISalonState?.recordTrace({
    source: "Room 02",
    score: `score:${score}`,
    label: `Docent score: ${score}`,
    effect: el.title.textContent,
    color: score === "refusal" ? "#ff5a4d" : "#7db4ff",
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  memoryPulse(size.w * (0.36 + Math.random() * 0.28), size.h * (0.28 + Math.random() * 0.34), score === "refusal" ? "#ff5a4d" : palette()[2], 1.45);
  memoryChime(score === "archive" ? 132 : score === "refusal" ? 178 : 286, 0.18, 0.8, score === "contradiction" ? "square" : "triangle");
  announce("Performance score changed.");
}

function memoryPulse(x, y, color, scale = 1) {
  pulses.push({
    x,
    y,
    color,
    scale,
    life: 1,
    radius: Math.min(size.w, size.h) * (0.09 + Math.random() * 0.08) * scale,
    spin: Math.random() * Math.PI * 2,
  });
  while (pulses.length > 18) pulses.shift();
}

function draw(t = 0, moving = true) {
  if (moving && !shouldAnimateCanvas()) {
    animationFrame = 0;
    draw(0, false);
    return;
  }
  const time = moving ? t : 0;
  const colors = palette();
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#07090d");
  bg.addColorStop(0.28, colorAlpha(colors[0], 0.2));
  bg.addColorStop(0.58, "#121015");
  bg.addColorStop(1, colorAlpha(colors[1], 0.16));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 13; i += 1) {
    const x = size.w * (0.12 + i * 0.1) + Math.sin(time * 0.0004 + i) * 24;
    ctx.strokeStyle = colorAlpha(colors[i % colors.length], 0.05 + (i % 3) * 0.018);
    ctx.lineWidth = 1 + (i % 4);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.sin(time * 0.0003 + i) * 80, size.h);
    ctx.stroke();
  }
  ctx.restore();

  const glow = ctx.createRadialGradient(
    pointer.active ? pointer.x : size.w * 0.5,
    pointer.active ? pointer.y : size.h * 0.45,
    0,
    pointer.active ? pointer.x : size.w * 0.5,
    pointer.active ? pointer.y : size.h * 0.45,
    Math.min(size.w, size.h) * 0.46,
  );
  glow.addColorStop(0, colorAlpha(colors[1], 0.28));
  glow.addColorStop(0.36, colorAlpha(colors[0], 0.12));
  glow.addColorStop(0.62, colorAlpha(colors[2], 0.06));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  fragments.forEach((fragment) => {
    if (moving) {
      fragment.x += fragment.speed * (mode === "forget" ? 0.74 : mode === "observe" ? 0.42 : 1.25);
      if (fragment.x > size.w + fragment.w) fragment.x = -fragment.w;
    }
    const y = fragment.y + Math.sin(time * 0.001 + fragment.phase + turn * 0.2) * 9;
    ctx.globalAlpha = fragment.alpha;
    ctx.fillStyle = colors[fragment.colorIndex % colors.length];
    ctx.shadowColor = colors[fragment.colorIndex % colors.length];
    ctx.shadowBlur = 14;
    ctx.fillRect(fragment.x, y, fragment.w, fragment.h);
    ctx.globalAlpha = fragment.alpha * 0.38;
    ctx.fillRect(fragment.x - fragment.w * 0.16, y + 7, fragment.w * 0.55, 1);
  });

  pulses = pulses.filter((pulse) => pulse.life > 0.015);
  pulses.forEach((pulse) => {
    if (moving) {
      pulse.life *= 0.965;
      pulse.spin += 0.01;
    }
    const r = pulse.radius * (1.15 - pulse.life + pulse.scale * 0.25);
    ctx.globalAlpha = pulse.life * 0.38;
    ctx.strokeStyle = pulse.color;
    ctx.lineWidth = 1.5 + pulse.scale * 1.8;
    ctx.shadowColor = pulse.color;
    ctx.shadowBlur = 24 * pulse.life;
    ctx.beginPath();
    ctx.ellipse(pulse.x, pulse.y, r * 1.35, r * 0.72, pulse.spin, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = pulse.life * 0.12;
    ctx.fillStyle = pulse.color;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  if (moving) {
    updateDrone();
    animationFrame = requestAnimationFrame(draw);
  }
}

function ensureAudio() {
  if (audio) return audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const context = new AudioContext();
  const drone = context.createOscillator();
  const grain = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const grainGain = context.createGain();

  drone.type = "sine";
  drone.frequency.value = 112;
  grain.type = "triangle";
  grain.frequency.value = 224;
  filter.type = "lowpass";
  filter.frequency.value = 680;
  gain.gain.value = 0;
  grainGain.gain.value = 0;

  drone.connect(filter);
  grain.connect(grainGain);
  grainGain.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  drone.start();
  grain.start();
  audio = { context, drone, grain, filter, gain, grainGain };
  return audio;
}

async function setSound(on) {
  const node = ensureAudio();
  if (!node) return;
  if (node.context.state === "suspended") await node.context.resume();
  const now = node.context.currentTime;
  node.gain.gain.setTargetAtTime(on ? 0.04 : 0, now, 0.14);
  node.grainGain.gain.setTargetAtTime(on ? 0.012 : 0, now, 0.2);
}

function updateDrone() {
  const checked = el.soundToggle?.getAttribute("aria-checked") === "true";
  if (!checked || !audio || audio.context.state === "closed") return;
  const now = audio.context.currentTime;
  const x = pointer.active ? pointer.x / Math.max(size.w, 1) : 0.5;
  const y = pointer.active ? pointer.y / Math.max(size.h, 1) : 0.42;
  const base = mode === "false" ? 118 : mode === "forget" ? 92 : 146;
  audio.drone.frequency.setTargetAtTime(base + x * 46 + turn * 1.5, now, 0.18);
  audio.grain.frequency.setTargetAtTime((base + 72) * (1.4 + y * 0.32), now, 0.22);
  audio.filter.frequency.setTargetAtTime(420 + y * 980 + turn * 12, now, 0.18);
}

function memoryChime(frequency = 260, gainValue = 0.18, duration = 0.7, type = "triangle") {
  const checked = el.soundToggle?.getAttribute("aria-checked") === "true";
  if (!checked) return;
  const node = ensureAudio();
  if (!node) return;
  if (node.context.state === "suspended") node.context.resume();
  const now = node.context.currentTime;
  const osc = node.context.createOscillator();
  const gain = node.context.createGain();
  const filter = node.context.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.62), now + duration);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency * 2.4, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(node.context.destination);
  osc.start(now);
  osc.stop(now + duration + 0.04);
}

el.form.addEventListener("submit", (event) => {
  event.preventDefault();
  askDocent(el.prompt.value);
});

el.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode, true));
});

el.scoreButtons.forEach((button) => {
  button.addEventListener("click", () => runScore(button.dataset.score));
});

el.soundToggle.addEventListener("click", async () => {
  const next = el.soundToggle.getAttribute("aria-checked") !== "true";
  el.soundToggle.setAttribute("aria-checked", String(next));
  await setSound(next);
  if (next) {
    memoryPulse(size.w * 0.5, size.h * 0.46, palette()[2], 1.2);
    memoryChime(220, 0.14, 0.62);
  }
});

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
  if (performance.now() - lastPointerPulse > 420) {
    memoryPulse(pointer.x, pointer.y, palette()[turn % palette().length], 0.52);
    lastPointerPulse = performance.now();
  }
  resetStillTimer();
  if (!shouldAnimateCanvas()) renderStillCanvas();
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
  if (!shouldAnimateCanvas()) renderStillCanvas();
});

window.addEventListener("resize", () => {
  resize();
  if (!shouldAnimateCanvas()) renderStillCanvas();
});

if (salonMotion?.onChange) {
  salonMotion.onChange(syncMotionPreference);
} else if (reducedMotionQuery?.addEventListener) {
  reducedMotionQuery.addEventListener("change", syncMotionPreference);
  document.addEventListener("visibilitychange", syncMotionPreference);
} else {
  reducedMotionQuery?.addListener?.(syncMotionPreference);
  document.addEventListener("visibilitychange", syncMotionPreference);
}

resize();
renderBase();
setMode("false", false);
window.AISalonState?.renderTraceList("traceList", { limit: 4 });
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 4 }));
syncMotionPreference();
