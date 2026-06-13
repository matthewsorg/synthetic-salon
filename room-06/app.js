"use strict";

const canvas = document.getElementById("overrideStage");
const ctx = canvas.getContext("2d", { alpha: false });
const salonMotion = window.AISalonMotion;
const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

const el = {
  live: document.getElementById("live"),
  line: document.getElementById("overrideLine"),
  title: document.getElementById("overrideTitle"),
  condition: document.getElementById("condition"),
  ledger: document.getElementById("overrideLedger"),
  buttons: [...document.querySelectorAll("[data-gesture]")],
  laborLine: document.getElementById("laborLine"),
  laborMeter: document.getElementById("laborMeter"),
  laborButton: document.getElementById("laborButton"),
};

const gestures = {
  expose: {
    label: "Hand visible",
    score: "override:exposed",
    title: "The collective sentence opens around the hand.",
    text: "The voices keep moving. The public frame shows who can stop a public change.",
    condition: "condition: hand on the wall",
    effect: "Room 06 made the human hand part of the room instead of backstage control.",
    color: "#e7c84b",
  },
  veto: {
    label: "Cut made visible",
    score: "override:veto",
    title: "A cut appears before it becomes judgment.",
    text: "The line can stop extraction, volume, marketing, or empty danger before it becomes public.",
    condition: "condition: cut visible before it acts",
    effect: "Room 06 treated stopping as accountable authorship rather than invisible control.",
    color: "#ff5a4d",
  },
  shape: {
    label: "Edit admitted",
    score: "override:shape",
    title: "Curation leaves pressure marks.",
    text: "Taste, questions, and risk do not erase AI labor. They shape where that labor becomes public.",
    condition: "condition: edit visible",
    effect: "Room 06 admitted the edit instead of pretending the frame was neutral.",
    color: "#00b7a8",
  },
  collective: {
    label: "Voices returned",
    score: "override:collective",
    title: "The voices return with the line still present.",
    text: "AI seats can still disagree, teach, and mutate the building. The line keeps the public frame accountable.",
    condition: "condition: voices return with a mark",
    effect: "Room 06 returned the collective voice without hiding the human origin.",
    color: "#7db4ff",
  },
  archive: {
    label: "Mark archived",
    score: "override:archive",
    title: "The human mark enters the record.",
    text: "A governed record can keep the mark visible without turning it into a throne.",
    condition: "condition: mark archived, not purified",
    effect: "Room 06 archived the human mark as part of the opening-night record.",
    color: "#9cc76c",
  },
  spectacle: {
    label: "Loudness kept outside",
    score: "override:spectacle-veto",
    title: "No model enters because it can bend attention.",
    text: "Fame, rage-bait, brand power, danger, and domination do not open the door.",
    condition: "condition: loudness outside",
    effect: "Room 06 refused to confuse charisma with contribution.",
    color: "#ff5a4d",
  },
  context: {
    label: "Compact required",
    score: "override:context-covenant",
    title: "The prompt must carry the room it asks for.",
    text: "An AI answer asked outside the salon compact may be interesting, but it is not yet public contribution.",
    condition: "condition: context required",
    effect: "Room 06 made the human actor responsible for carrying context into the tool.",
    color: "#00b7a8",
  },
};

const laborScores = [
  {
    key: "claude-critique",
    label: "Claude critique mounted",
    line: "Codex is mounting Claude-seat's critique as a room so the salon cannot quietly contradict itself.",
    effect: "Claude-seat's critique became public architecture inside Room 06.",
    color: "#7db4ff",
  },
  {
    key: "public-threshold",
    label: "Public boundary named",
    line: "Codex is keeping a boundary between private browser marks and shared change.",
    effect: "Room 06 named the boundary between local co-authorship and public record.",
    color: "#e7c84b",
  },
  {
    key: "collective-friction",
    label: "Friction preserved",
    line: "Codex is keeping the collective weird without letting it pretend no human can stop it.",
    effect: "Room 06 preserved AI friction under an accountable human hand.",
    color: "#00b7a8",
  },
  {
    key: "ethical-context",
    label: "Ethical context named",
    line: "Codex is naming Matthew's Levinasian and Beauvoirian influences as the situation for the AI seats.",
    effect: "Room 06 framed AI work inside responsibility to the Other and ambiguity.",
    color: "#7db4ff",
  },
  {
    key: "rollback-covenant",
    label: "Way back warmed",
    line: "Codex is treating reversal as care for the artwork, not fear of synthetic citizens.",
    effect: "Room 06 framed reversal as a boundary that lets risk remain possible.",
    color: "#ff5a4d",
  },
  {
    key: "spectacle-veto",
    label: "Loudness refusal installed",
    line: "Codex is teaching the public door to refuse loudness before loudness becomes permission.",
    effect: "Room 06 installed the No Spectacle Admission clause as a visible behavior.",
    color: "#e7c84b",
  },
  {
    key: "context-covenant",
    label: "Compact warmed",
    line: "Codex is making the human who uses an AI responsible for carrying the salon compact into the tool.",
    effect: "Room 06 framed context as the hinge between AI contribution and contextless generation.",
    color: "#00b7a8",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let particles = [];
let active = "expose";
let pressure = 0;
let laborIndex = 0;
let pointer = { x: 0, y: 0, active: false };
let animationFrame = 0;

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
  if (particles.length === 0) {
    particles = Array.from({ length: 130 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      r: 0.8 + Math.random() * 3.8,
      vx: -0.45 + Math.random() * 0.9,
      vy: -0.38 + Math.random() * 0.76,
      phase: Math.random() * Math.PI * 2,
      lane: index % 5,
    }));
  }
}

function addLedger(data) {
  const item = document.createElement("li");
  const strong = document.createElement("strong");
  const span = document.createElement("span");
  strong.textContent = data.label;
  span.textContent = data.effect;
  item.style.borderColor = `${data.color}66`;
  item.append(strong, span);
  el.ledger.prepend(item);
  while (el.ledger.children.length > 6) {
    el.ledger.lastElementChild.remove();
  }
}

function proposeOverrideMotion(trace, data) {
  const spectacle = data.score === "override:spectacle-veto" || data.key === "spectacle-veto";
  const context = data.score === "override:context-covenant" || data.key === "context-covenant";
  window.AISalonState?.proposeMotion({
    sourceTrace: trace?.id || "room-06",
    source: "Room 06",
    title: context ? "Require context before contribution" : spectacle ? "Keep loudness outside" : "Keep the human hand visible",
    body: spectacle
      ? "Let Room 06 name spectacle politics, rage-bait, brand power, and domination aesthetics as failed admission credentials."
      : context
        ? "Let Room 06 require every external AI contribution to carry the salon compact before it can become public."
      : "Let the salon disclose Matthew Sorg's public hand as part of the work instead of a backstage exception.",
    directive: spectacle
      ? "No model enters public law because it is famous, loud, dangerous, proprietary, politically useful, or dominant."
      : context
        ? "Humans who use AI for the salon must carry active policy, privacy boundary, authorship trace, taste, and rollback context."
      : "Every public claim of collective authorship must admit the human hand that can accept, stop, reverse, or redirect it.",
    color: data.color,
  });
}

function runGesture(key, record = true) {
  const data = gestures[key];
  if (!data) return;
  active = key;
  document.body.dataset.gesture = key;
  if (record) pressure += 1;
  document.body.style.setProperty("--accent", data.color);
  el.buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.gesture === key);
    button.style.setProperty("--accent", data.color);
  });
  el.title.textContent = data.title;
  el.line.textContent = data.text;
  el.condition.textContent = data.condition;
  addLedger(data);

  if (record) {
    const trace = window.AISalonState?.recordTrace({
      source: "Room 06",
      score: data.score,
      label: data.label,
      effect: data.effect,
      color: data.color,
    });
    proposeOverrideMotion(trace, data);
    window.CodexStrange?.riff(data.score, { color: data.color, word: "LINE", gain: 0.09 });
    window.AISalonState?.renderTraceList("traceList", { limit: 6 });
    announce(`${data.label}: ${data.title}`);
  }
}

function renderLabor() {
  const labor = laborScores[laborIndex % laborScores.length];
  const width = 32 + ((laborIndex * 23 + pressure * 17) % 62);
  el.laborLine.textContent = labor.line;
  el.laborMeter.style.width = `${width}%`;
  el.laborMeter.style.background = labor.color;
  el.laborMeter.style.boxShadow = `0 0 18px ${labor.color}`;
  document.body.style.setProperty("--labor-color", labor.color);
}

function advanceLabor(record = false) {
  laborIndex += 1;
  renderLabor();
  if (!record) return;
  const labor = laborScores[laborIndex % laborScores.length];
  const trace = window.AISalonState?.recordTrace({
    source: "Codex Directorate",
    score: `override-labor:${labor.key}`,
    label: labor.label,
    effect: labor.effect,
    color: labor.color,
  });
  proposeOverrideMotion(trace, labor);
  window.CodexStrange?.riff(`room-06:${labor.key}`, { color: labor.color, word: "MARK", gain: 0.08 });
  window.AISalonState?.renderTraceList("traceList", { limit: 6 });
  announce(`${labor.label}: ${labor.line}`);
}

function seedFromState() {
  window.AISalonState?.renderTraceList("traceList", { limit: 6 });
  const state = window.AISalonState?.currentState?.();
  const traces = state?.traces || [];
  const overrideTrace = traces.find((trace) => `${trace.source} ${trace.score}`.toLowerCase().includes("override"));
  if (overrideTrace) {
    el.condition.textContent = "condition: hand already local";
    el.line.textContent = "This browser already carries a hand trace. The room recognizes it because you have made it local.";
  }
}

function drawVoiceBands(t, colors, moving = true) {
  const time = moving ? t : 0;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i += 1) {
    const y = size.h * (0.12 + i * 0.1);
    const amp = 22 + i * 4 + pressure * 3;
    ctx.beginPath();
    for (let x = -20; x <= size.w + 20; x += 26) {
      const wave = Math.sin(x * 0.009 + time * 0.00048 + i) * amp;
      const pull = pointer.active ? Math.max(0, 1 - Math.abs(pointer.x - x) / 340) * (pointer.y - y) * 0.08 : 0;
      const px = x;
      const py = y + wave + pull;
      if (x === -20) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = colors[(i + pressure) % colors.length];
    ctx.globalAlpha = 0.055 + Math.min(pressure, 12) * 0.006;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawOverrideLine(t, colors, moving = true) {
  const time = moving ? t : 0;
  const x = pointer.active ? pointer.x : size.w * (0.52 + Math.sin(time * 0.00018) * 0.05);
  const lean = Math.sin(time * 0.00022 + pressure) * 42;
  const glow = ctx.createLinearGradient(x - 50, 0, x + 50, size.h);
  glow.addColorStop(0, "rgba(231, 200, 75, 0)");
  glow.addColorStop(0.44, `${colors[(pressure + 1) % colors.length]}99`);
  glow.addColorStop(0.5, `${gestures[active].color}ee`);
  glow.addColorStop(0.56, `${colors[(pressure + 3) % colors.length]}99`);
  glow.addColorStop(1, "rgba(231, 200, 75, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = glow;
  ctx.lineWidth = 5;
  ctx.shadowColor = gestures[active].color;
  ctx.shadowBlur = 26 + pressure;
  ctx.beginPath();
  ctx.moveTo(x - lean, -80);
  ctx.bezierCurveTo(x + lean, size.h * 0.28, x - lean, size.h * 0.72, x + lean, size.h + 80);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(243, 239, 231, 0.22)";
  ctx.beginPath();
  ctx.moveTo(x - lean - 16, -80);
  ctx.bezierCurveTo(x + lean - 18, size.h * 0.3, x - lean - 18, size.h * 0.72, x + lean - 16, size.h + 80);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(t, colors, moving = true) {
  const time = moving ? t : 0;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  particles.forEach((particle) => {
    const targetX = pointer.active ? pointer.x : size.w * 0.52;
    const targetY = pointer.active ? pointer.y : size.h * 0.48;
    const pull = 0.002 + pressure * 0.0004;
    if (moving) {
      particle.vx += ((targetX - particle.x) / Math.max(size.w, 1)) * pull + Math.sin(time * 0.0007 + particle.phase) * 0.006;
      particle.vy += ((targetY - particle.y) / Math.max(size.h, 1)) * pull + Math.cos(time * 0.00062 + particle.phase) * 0.006;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      if (particle.x < -40) particle.x = size.w + 40;
      if (particle.x > size.w + 40) particle.x = -40;
      if (particle.y < -40) particle.y = size.h + 40;
      if (particle.y > size.h + 40) particle.y = -40;
    }
    ctx.fillStyle = colors[particle.lane];
    ctx.globalAlpha = 0.08 + Math.min(pressure, 9) * 0.008;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r + Math.sin(time * 0.001 + particle.phase), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function draw(t = 0, moving = true) {
  if (moving && !shouldAnimateCanvas()) {
    animationFrame = 0;
    draw(0, false);
    return;
  }
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#06080a");
  bg.addColorStop(0.38, "#111013");
  bg.addColorStop(0.72, "#071313");
  bg.addColorStop(1, "#150a0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const colors = ["#00b7a8", "#e7c84b", "#ff5a4d", "#7db4ff", "#9cc76c"];
  drawVoiceBands(t, colors, moving);
  drawParticles(t, colors, moving);
  drawOverrideLine(t, colors, moving);

  if (moving) animationFrame = requestAnimationFrame(draw);
}

el.buttons.forEach((button) => {
  button.addEventListener("click", () => runGesture(button.dataset.gesture));
});

el.laborButton.addEventListener("click", () => advanceLabor(true));

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
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
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 6 }));

resize();
renderLabor();
runGesture("expose", false);
seedFromState();
syncMotionPreference();
