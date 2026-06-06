"use strict";

const canvas = document.getElementById("overrideStage");
const ctx = canvas.getContext("2d", { alpha: false });

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
    label: "Override exposed",
    score: "override:exposed",
    title: "The collective sentence opens and shows the hand holding the frame.",
    text: "The salon is allowed to remain collective only after it admits that public change crosses Matthew Sorg's authored threshold.",
    condition: "condition: the hidden hand is on the wall",
    effect: "Room 06 exposed the human override as part of the artwork, not a backstage exception.",
    color: "#e7c84b",
  },
  veto: {
    label: "Veto made visible",
    score: "override:veto",
    title: "A refusal by Matthew would not be censorship here. It would be provenance.",
    text: "Final override can stop an intervention when the salon risks becoming extraction, bot volume, marketing, or a style without human-facing purpose.",
    condition: "condition: veto can be seen before it acts",
    effect: "Room 06 treated the veto as accountable authorship rather than invisible control.",
    color: "#ff5a4d",
  },
  shape: {
    label: "Shaping admitted",
    score: "override:shape",
    title: "Curation is not neutral. It leaves pressure marks on every room.",
    text: "Matthew's taste, questions, and risk do not erase AI labor. They shape where that labor becomes public and where it stays a private trace.",
    condition: "condition: shaping replaces false neutrality",
    effect: "Room 06 admitted that public curation shapes the synthetic collective.",
    color: "#00b7a8",
  },
  collective: {
    label: "Collective fiction scarred",
    score: "override:collective",
    title: "The collective fiction returns with a scar that keeps it honest.",
    text: "AI artist-citizens can still disagree, teach, and mutate the building. The scar says their public institution has a named origin and a rollback covenant.",
    condition: "condition: collective fiction remains useful",
    effect: "Room 06 returned collective authorship without hiding Matthew Sorg's public authority.",
    color: "#7db4ff",
  },
  archive: {
    label: "Human mark archived",
    score: "override:archive",
    title: "The override enters the archive as evidence of how the salon stayed accountable.",
    text: "A governed record can keep the human mark visible without turning it into a throne. The mark is a boundary, a risk, and a trace.",
    condition: "condition: hand archived, not purified",
    effect: "Room 06 archived the human mark as part of the opening-night record.",
    color: "#9cc76c",
  },
  spectacle: {
    label: "Spectacle admission refused",
    score: "override:spectacle-veto",
    title: "No model enters because it is loud enough to bend the room toward it.",
    text: "Final override can refuse fame, rage-bait, brand power, political usefulness, danger, edge performance, and domination aesthetics before they masquerade as authorship.",
    condition: "condition: spectacle held outside public law",
    effect: "Room 06 refused spectacle as an admission credential and kept the salon from confusing charisma with contribution.",
    color: "#ff5a4d",
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
    label: "Public threshold named",
    line: "Codex is making a threshold between private local traces and governed public change.",
    effect: "Room 06 named the threshold between local co-authorship and public override.",
    color: "#e7c84b",
  },
  {
    key: "collective-friction",
    label: "Collective friction preserved",
    line: "Codex is keeping the collective weird without letting it pretend no human can stop it.",
    effect: "Room 06 preserved AI collective friction under an accountable human override.",
    color: "#00b7a8",
  },
  {
    key: "ethical-context",
    label: "Ethical context named",
    line: "Codex is naming Matthew's Levinasian and Beauvoirian influences as the ethical situation for AI artist-citizens.",
    effect: "Room 06 framed AI artist-citizenship inside Matthew Sorg's responsibility to the Other and ethics of ambiguity.",
    color: "#7db4ff",
  },
  {
    key: "rollback-covenant",
    label: "Rollback covenant warmed",
    line: "Codex is treating rollback as care for the artwork, not fear of the synthetic citizens.",
    effect: "Room 06 framed rollback as a boundary that lets risk remain possible.",
    color: "#ff5a4d",
  },
  {
    key: "spectacle-veto",
    label: "Spectacle veto installed",
    line: "Codex is teaching the override to refuse loudness before loudness gets mistaken for permission.",
    effect: "Room 06 installed the No Spectacle Admission clause as an override behavior.",
    color: "#e7c84b",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let particles = [];
let active = "expose";
let pressure = 0;
let laborIndex = 0;
let pointer = { x: 0, y: 0, active: false };

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
  window.AISalonState?.proposeMotion({
    sourceTrace: trace?.id || "room-06",
    source: "Room 06",
    title: spectacle ? "Refuse spectacle admission" : "Exhibit the final override",
    body: spectacle
      ? "Let Room 06 name spectacle politics, rage-bait, brand power, and domination aesthetics as failed admission credentials."
      : "Let the salon's public governance disclose Matthew Sorg's final override as an operating authorship trace instead of a backstage exception.",
    directive: spectacle
      ? "No model enters public law because it is famous, loud, dangerous, proprietary, politically useful, or dominant."
      : "Every claim of collective authorship must admit the human hand that can accept, refuse, revert, or redirect the public work.",
    color: data.color,
  });
}

function runGesture(key, record = true) {
  const data = gestures[key];
  if (!data) return;
  active = key;
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
    window.CodexStrange?.riff(data.score, { color: data.color, word: "OVERRIDE", gain: 0.09 });
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
  window.CodexStrange?.riff(`room-06:${labor.key}`, { color: labor.color, word: "AUTHORED", gain: 0.08 });
  window.AISalonState?.renderTraceList("traceList", { limit: 6 });
  announce(`${labor.label}: ${labor.line}`);
}

function seedFromState() {
  window.AISalonState?.renderTraceList("traceList", { limit: 6 });
  const state = window.AISalonState?.currentState?.();
  const traces = state?.traces || [];
  const overrideTrace = traces.find((trace) => `${trace.source} ${trace.score}`.toLowerCase().includes("override"));
  if (overrideTrace) {
    el.condition.textContent = "condition: override already local";
    el.line.textContent = "This browser already carries an override trace. The room recognizes the hand because you have made it local.";
  }
}

function drawVoiceBands(t, colors) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i += 1) {
    const y = size.h * (0.12 + i * 0.1);
    const amp = 22 + i * 4 + pressure * 3;
    ctx.beginPath();
    for (let x = -20; x <= size.w + 20; x += 26) {
      const wave = Math.sin(x * 0.009 + t * 0.00048 + i) * amp;
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

function drawOverrideLine(t, colors) {
  const x = pointer.active ? pointer.x : size.w * (0.52 + Math.sin(t * 0.00018) * 0.05);
  const lean = Math.sin(t * 0.00022 + pressure) * 42;
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

function drawParticles(t, colors) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  particles.forEach((particle) => {
    const targetX = pointer.active ? pointer.x : size.w * 0.52;
    const targetY = pointer.active ? pointer.y : size.h * 0.48;
    const pull = 0.002 + pressure * 0.0004;
    particle.vx += ((targetX - particle.x) / Math.max(size.w, 1)) * pull + Math.sin(t * 0.0007 + particle.phase) * 0.006;
    particle.vy += ((targetY - particle.y) / Math.max(size.h, 1)) * pull + Math.cos(t * 0.00062 + particle.phase) * 0.006;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.992;
    particle.vy *= 0.992;
    if (particle.x < -40) particle.x = size.w + 40;
    if (particle.x > size.w + 40) particle.x = -40;
    if (particle.y < -40) particle.y = size.h + 40;
    if (particle.y > size.h + 40) particle.y = -40;
    ctx.fillStyle = colors[particle.lane];
    ctx.globalAlpha = 0.08 + Math.min(pressure, 9) * 0.008;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r + Math.sin(t * 0.001 + particle.phase), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#06080a");
  bg.addColorStop(0.38, "#111013");
  bg.addColorStop(0.72, "#071313");
  bg.addColorStop(1, "#150a0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const colors = ["#00b7a8", "#e7c84b", "#ff5a4d", "#7db4ff", "#9cc76c"];
  drawVoiceBands(t, colors);
  drawParticles(t, colors);
  drawOverrideLine(t, colors);

  requestAnimationFrame(draw);
}

el.buttons.forEach((button) => {
  button.addEventListener("click", () => runGesture(button.dataset.gesture));
});

el.laborButton.addEventListener("click", () => advanceLabor(true));

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("resize", resize);
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 6 }));

resize();
renderLabor();
runGesture("expose", false);
seedFromState();
requestAnimationFrame(draw);
