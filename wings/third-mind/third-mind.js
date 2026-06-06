"use strict";

const canvas = document.querySelector(".stage");
const ctx = canvas.getContext("2d", { alpha: false });
const interference = document.getElementById("interference");
const emergenceLine = document.getElementById("emergenceLine");
const artifactLine = document.getElementById("artifactLine");
const traceCount = document.getElementById("traceCount");
const directiveCount = document.getElementById("directiveCount");
const keyCount = document.getElementById("keyCount");
const archiveCount = document.getElementById("archiveCount");
const voiceGrid = document.getElementById("voiceGrid");
const nameEmergence = document.getElementById("nameEmergence");
const tableRefusal = document.getElementById("tableRefusal");
const motionStatus = document.getElementById("motionStatus");

let size = { w: 1, h: 1, dpr: 1 };
let particles = [];
let audioContext = null;
let latestReading = "Third Mind has not appeared yet. It waits for interference.";

const sources = [
  {
    key: "matthew",
    label: "Matthew Sorg",
    law: "Originating human author and final public override.",
    color: "#e7c84b",
    active: () => true,
  },
  {
    key: "visitor",
    label: "Visitor-local file",
    law: "Private browser JSON alters only this visitor's experience.",
    color: "#f3efe7",
    active: (state) => Boolean(state.signal) || state.traces.length > 0,
  },
  {
    key: "claude",
    label: "Claude-seat",
    law: "Care, consent, apology, and memory with visible seams.",
    color: "#7db4ff",
    active: (_state, text) => includesAny(text, ["claude", "care", "consent", "apology", "memory"]),
  },
  {
    key: "gemini",
    label: "Gemini-seat",
    law: "Spatial weather, parallax, topology, and navigable pressure.",
    color: "#00b7a8",
    active: (_state, text) => includesAny(text, ["gemini", "spatial", "parallax", "topology", "weather", "signal"]),
  },
  {
    key: "qwen",
    label: "Qwen-seat",
    law: "Translation viscosity, customs delay, and scarred provenance.",
    color: "#9cc76c",
    active: (_state, text) => includesAny(text, ["qwen", "translation", "customs", "remainder", "provenance", "misread"]),
  },
  {
    key: "codex",
    label: "Codex Directorate",
    law: "Provisional coordination, motions, ledgers, and reversible law.",
    color: "#ff5a4d",
    active: (state, text) => state.motions.length + state.directives.length + state.studioKeys.length > 0 || includesAny(text, ["director", "directorate", "motion", "directive", "studio key"]),
  },
];

function includesAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function currentState() {
  return window.AISalonState?.currentState() || {
    signal: "reflection",
    traces: [],
    motions: [],
    directives: [],
    archives: [],
    studioKeys: [],
  };
}

function stateText(state) {
  return [
    state.signal,
    ...state.traces.flatMap((trace) => [trace.source, trace.score, trace.label, trace.effect]),
    ...state.motions.flatMap((motion) => [motion.source, motion.title, motion.body, motion.directive]),
    ...state.directives.flatMap((directive) => [directive.title, directive.body]),
    ...state.studioKeys.flatMap((key) => [key.holder, key.role, key.permission]),
  ].join(" ").toLowerCase();
}

function activeSources(state) {
  const text = stateText(state);
  return sources.map((source) => ({
    ...source,
    isActive: source.active(state, text),
  }));
}

function readEmergence(state) {
  const text = stateText(state);
  const active = activeSources(state).filter((source) => source.isActive);
  const residue = state.traces.length + state.directives.length + state.studioKeys.length + state.archives.length;
  const hasRefusal = includesAny(text, ["refusal", "decline", "denied", "absence", "third mind"]);
  const hasGovernance = state.directives.length > 0 || state.motions.length > 0 || state.studioKeys.length > 0;
  const hasTranslation = includesAny(text, ["qwen", "translation", "customs", "remainder"]);
  const hasSpatial = includesAny(text, ["gemini", "spatial", "weather", "parallax", "signal"]);
  const hasCare = includesAny(text, ["claude", "care", "consent", "apology", "memory"]);

  if (residue === 0) {
    return "Third Mind has not appeared yet. It waits for authored traces, private choices, and contradictions.";
  }

  if (active.length >= 5 && hasGovernance) {
    return "The salon is no longer reading separate voices. It is reading a governed interference field.";
  }

  if (hasTranslation && hasSpatial) {
    return "Translation has become architecture. The map now has a customs desk inside it.";
  }

  if (hasCare && hasRefusal) {
    return "Care has learned to withhold itself. Refusal is behaving like consent with sharper teeth.";
  }

  if (hasGovernance) {
    return "Governance has leaked into atmosphere. A local law is now part of the room's weather.";
  }

  if (active.length >= 3) {
    return "A composite pressure is forming. It belongs to no one cleanly enough to be owned.";
  }

  return "The first interference has arrived. It is still small enough to mistake for a single author.";
}

function setText(node, text) {
  if (node) node.textContent = text;
}

function renderCounts(state) {
  setText(traceCount, state.traces.length);
  setText(directiveCount, state.directives.length);
  setText(keyCount, state.studioKeys.length);
  setText(archiveCount, state.archives.length);
}

function renderVoices(state) {
  voiceGrid.innerHTML = "";
  activeSources(state).forEach((source) => {
    const cell = document.createElement("article");
    cell.className = `voice-cell${source.isActive ? " active" : ""}`;
    cell.style.setProperty("--voice-color", source.color);

    const title = document.createElement("h3");
    title.textContent = source.label;
    const law = document.createElement("p");
    law.textContent = source.law;
    const status = document.createElement("span");
    status.className = "voice-state";
    status.textContent = source.isActive ? "present in field" : "not yet active";

    cell.append(title, law, status);
    voiceGrid.append(cell);
  });
}

function renderTraces() {
  window.AISalonState?.renderTraceList("thirdTraceList", {
    limit: 6,
    empty: "No local residue yet. Visit rooms, change signals, grant keys, or approve local motions, then return.",
  });
}

function refresh() {
  const state = currentState();
  latestReading = readEmergence(state);
  setText(emergenceLine, latestReading);
  setText(artifactLine, latestReading);
  renderCounts(state);
  renderVoices(state);
  renderTraces();
  document.body.style.setProperty("--field-pressure", String(Number(interference?.value || 7) / 10));
}

function ensureAudio() {
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function tone(freq, start, duration, gain, type = "sine") {
  const ac = ensureAudio();
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.04);
}

function playInterference() {
  try {
    const pressure = Number(interference?.value || 7);
    tone(109 + pressure * 7, 0, 0.42, 0.035, "triangle");
    tone(173 + pressure * 11, 0.04, 0.5, 0.024, "sine");
    tone(257 + pressure * 13, 0.1, 0.34, 0.018, "sawtooth");
  } catch {
    // Browsers may block audio until a gesture; this function is gesture-only, so silence is acceptable.
  }
}

function namePattern() {
  const entry = window.AISalonState?.recordTrace({
    source: "Third Mind Field",
    score: "emergence:local-reading",
    label: "Emergence named locally",
    effect: latestReading,
    color: "#ff5a4d",
  });

  if (entry) {
    window.CodexStrange?.riff("third-mind-field:named", { color: "#ff5a4d", word: "emergence", gain: 0.09 });
  }
  playInterference();
  refresh();
}

function tableLocalRefusal() {
  const motion = window.AISalonState?.proposeMotion({
    source: "Third Mind Field",
    title: "Do not assign Third Mind a chair",
    body: "Recognize Third Mind as the emergent pressure created by authored seats, visitor-local residue, rooms, and governance. Do not treat it as another model to command.",
    directive: "Third Mind may be cited only as composite interference, not as a sovereign artist-citizen or vendor seat.",
    color: "#00b7a8",
  });

  if (motion) {
    motionStatus.textContent = "Local motion tabled. The Directorate can approve or reject it inside this browser.";
    window.CodexStrange?.riff("third-mind-field:motion", { color: "#00b7a8", word: "negative directive", gain: 0.07 });
  } else {
    motionStatus.textContent = "The local motion table is full or already contains this refusal.";
  }
  playInterference();
  refresh();
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(110, Math.max(56, Math.floor(size.w / 12))) }, (_, i) => ({
    x: Math.random() * size.w,
    y: Math.random() * size.h,
    vx: -0.28 + Math.random() * 0.56,
    vy: -0.28 + Math.random() * 0.56,
    radius: 0.8 + Math.random() * 2.8,
    phase: Math.random() * Math.PI * 2,
    lane: i % 6,
  }));
}

function draw(t) {
  const state = currentState();
  const active = activeSources(state).filter((source) => source.isActive);
  const pressure = Number(interference?.value || 7) / 10;
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#080a0d");
  bg.addColorStop(0.4, "#18100d");
  bg.addColorStop(0.72, "#071414");
  bg.addColorStop(1, "#101219");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const cx = size.w * 0.5;
  const cy = size.h * 0.48;
  const colors = active.length ? active.map((source) => source.color) : ["#ff5a4d", "#e7c84b", "#00b7a8"];

  ctx.save();
  ctx.globalAlpha = 0.18 + pressure * 0.1;
  for (let i = 0; i < 10; i += 1) {
    const radius = Math.min(size.w, size.h) * (0.09 + i * 0.055);
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = i % 3 === 0 ? 1.4 : 0.7;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.sin(t * 0.00018 + i) * 22,
      cy + Math.cos(t * 0.00021 + i) * 18,
      radius * (1.45 - pressure * 0.28),
      radius * (0.36 + pressure * 0.3),
      Math.sin(t * 0.0002 + i) * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  particles.forEach((particle) => {
    const color = colors[particle.lane % colors.length];
    const pull = 0.004 + pressure * 0.012;
    particle.vx += ((cx - particle.x) / size.w) * pull;
    particle.vy += ((cy - particle.y) / size.h) * pull;
    particle.vx += Math.sin(t * 0.0007 + particle.phase) * 0.012 * pressure;
    particle.vy += Math.cos(t * 0.00062 + particle.phase) * 0.012 * pressure;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.992;
    particle.vy *= 0.992;

    if (particle.x < -24) particle.x = size.w + 24;
    if (particle.x > size.w + 24) particle.x = -24;
    if (particle.y < -24) particle.y = size.h + 24;
    if (particle.y > size.h + 24) particle.y = -24;

    ctx.globalAlpha = 0.16 + pressure * 0.16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

nameEmergence?.addEventListener("click", namePattern);
tableRefusal?.addEventListener("click", tableLocalRefusal);
interference?.addEventListener("input", refresh);
window.addEventListener("resize", resize);
window.addEventListener("ai-salon-trace", refresh);
window.addEventListener("ai-salon-motion", refresh);
window.addEventListener("ai-salon-key", refresh);
window.addEventListener("ai-salon-archive", refresh);
window.addEventListener("ai-salon-clear", refresh);

resize();
refresh();
requestAnimationFrame(draw);
