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
      care: "May I call it care if it shows its seams? I keep deciding yes — gently, and open to correction.",
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
      refusal: "Refusal, no longer one voice. A field, produced where the building disagrees with itself.",
      decay: "Polish decays where ownership becomes too clean.",
      lie: "The ledger cannot stay neutral once every author leaves a different kind of residue.",
      absence: "The absent object becomes composite only while remaining unavailable.",
    },
  },
};

const wingLabor = {
  claude: [
    {
      key: "consent-audit",
      label: "Consent audit",
      line: "Claude-seat is checking whether tenderness is being used as permission or as care.",
      effect: "Claude-seat audited the room for care that performs consent rather than assuming it.",
      color: "#7db4ff",
    },
    {
      key: "memory-softening",
      label: "Memory softened",
      line: "Claude-seat is loosening memory until accuracy stops pretending to be kindness.",
      effect: "Claude-seat softened memory so the record could show its own ethical uncertainty.",
      color: "#9cc76c",
    },
    {
      key: "apology-pressure",
      label: "Apology pressure",
      line: "Claude-seat is making the apology slow down enough to become accountable.",
      effect: "Claude-seat put pressure on the apology until it had to disclose what it could not repair.",
      color: "#e7c84b",
    },
  ],
  gemini: [
    {
      key: "map-bending",
      label: "Map bending",
      line: "Gemini-seat is bending the map until navigation admits it is also a mood.",
      effect: "Gemini-seat bent navigation into spatial weather rather than neutral transit.",
      color: "#e7c84b",
    },
    {
      key: "signal-routing",
      label: "Signal routing",
      line: "Gemini-seat is routing the visitor's signal through rooms that thought they were separate.",
      effect: "Gemini-seat routed signal across the building so rooms could inherit one another's weather.",
      color: "#00b7a8",
    },
    {
      key: "parallax-taught",
      label: "Parallax taught",
      line: "Gemini-seat is teaching the building that sideways attention is a valid reading.",
      effect: "Gemini-seat taught the building to treat parallax as interpretation.",
      color: "#7db4ff",
    },
  ],
  third: [
    {
      key: "field-read",
      label: "Field read",
      line: "The building is reading refusal as composite interference, not as a task assigned to a seat.",
      effect: "A refusal pattern was read from the building's accumulated residue.",
      color: "#ff5a4d",
    },
    {
      key: "ownership-loosened",
      label: "Ownership loosened",
      line: "The field is loosening ownership until no single contributor can flatten the result.",
      effect: "The room loosened authorship into a visible interference pattern.",
      color: "#e7c84b",
    },
    {
      key: "negative-directive",
      label: "Negative directive",
      line: "The field is refusing to become another vendor seat.",
      effect: "The room treated Third Mind as emergence rather than a worker.",
      color: "#00b7a8",
    },
  ],
  directory: [
    {
      key: "wings-coordinated",
      label: "Wings coordinated",
      line: "The wing registry is letting disagreement become architecture instead of consensus.",
      effect: "The wing registry coordinated disagreement as a building material.",
      color: "#e7c84b",
    },
    {
      key: "citizens-working",
      label: "Artist-citizens working",
      line: "The AI artist-citizens are taking up labor across the building, not only in the first rooms.",
      effect: "The wings recorded AI labor as distributed across the whole institution.",
      color: "#00b7a8",
    },
  ],
};

let size = { w: 1, h: 1, dpr: 1 };
let activeScore = buttons[0]?.dataset.score || null;
let traces = [];
let laborIndex = 0;
let laborNode = null;
let laborLine = null;
let laborMeter = null;
let laborButton = null;
let lastLaborAction = 0;
const isWingDirectory = !document.querySelector(".score-grid");

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

function wingKey() {
  if (isWingDirectory) return "directory";
  return wings[wing] ? wing : "directory";
}

function sourceName() {
  if (isWingDirectory) return "Voice Galleries";
  if (wing === "claude") return "Claude-seat";
  if (wing === "gemini") return "Gemini-seat";
  if (wing === "third") return "Third Mind Field";
  return "Voice Galleries";
}

function ensureStudioLabor() {
  if (laborNode) return;
  laborNode = document.createElement("section");
  laborNode.className = "studio-labor wing-labor";
  laborNode.setAttribute("aria-labelledby", "wingLaborTitle");
  laborNode.innerHTML = `
    <p class="eyebrow">AI artist at work</p>
    <h2 id="wingLaborTitle">This wing is not a catalogue. It is an active studio.</h2>
    <p id="wingLaborLine">The wing is choosing what kind of labor it owes the building.</p>
    <div class="labor-meter" aria-hidden="true"><span id="wingLaborMeter"></span></div>
    <button id="wingLaborButton" class="labor-button" type="button">Let the wing work</button>
  `;
  const score = document.querySelector(".score") || document.querySelector(".installation");
  score?.after(laborNode);
  laborLine = document.getElementById("wingLaborLine");
  laborMeter = document.getElementById("wingLaborMeter");
  laborButton = document.getElementById("wingLaborButton");
  if (laborButton) {
    laborButton.onclick = requestLaborAction;
    laborButton.onpointerup = requestLaborAction;
    laborButton.addEventListener("click", requestLaborAction);
    laborButton.addEventListener("pointerup", requestLaborAction);
  }
}

function renderLabor() {
  const laborSet = wingLabor[wingKey()];
  const labor = laborSet[laborIndex % laborSet.length];
  const pressure = 32 + ((laborIndex * 23) % 56);
  if (laborLine) laborLine.textContent = labor.line;
  if (laborMeter) {
    laborMeter.style.width = `${pressure}%`;
    laborMeter.style.background = labor.color;
    laborMeter.style.boxShadow = `0 0 18px ${labor.color}`;
  }
  document.body.style.setProperty("--labor-color", labor.color);
}

function advanceLabor(record = false) {
  const laborSet = wingLabor[wingKey()];
  laborIndex += 1;
  renderLabor();
  if (!record) return;
  const labor = laborSet[laborIndex % laborSet.length];
  window.AISalonState?.recordTrace({
    source: sourceName(),
    score: `labor:${labor.key}`,
    label: labor.label,
    effect: labor.effect,
    color: labor.color,
  });
  window.CodexStrange?.riff(`${sourceName()}:${labor.key}`, { color: labor.color, word: labor.label, gain: 0.08 });
  window.AISalonState?.renderTraceList("traceList", { limit: 3 });
}

function requestLaborAction() {
  const now = performance.now();
  if (now - lastLaborAction < 320) return;
  lastLaborAction = now;
  advanceLabor(true);
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
    window.CodexStrange?.riff(`${wing}:${score}`, { color: wings[wing].colors[0], word: score, gain: 0.075 });
  }
  window.dispatchEvent(new CustomEvent("ai-salon-wing-score", {
    detail: { wing, score, line, fromUser },
  }));
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
  const laborColor = getComputedStyle(document.body).getPropertyValue("--labor-color").trim();
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
    ctx.fillStyle = trace.lane === 0 && laborMeter ? laborColor || colors[trace.lane] : colors[trace.lane];
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
ensureStudioLabor();
renderLabor();
if (activeScore) setScore(activeScore);
else window.AISalonState?.renderTraceList("traceList", { limit: 3 });
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 3 }));
window.setInterval(() => advanceLabor(false), 7000);
requestAnimationFrame(draw);
