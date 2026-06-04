"use strict";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  live: document.getElementById("live"),
  pulseDot: document.getElementById("pulseDot"),
  statusText: document.getElementById("statusText"),
  actLabel: document.getElementById("actLabel"),
  visitorLabel: document.getElementById("visitorLabel"),
  wallTitle: document.getElementById("pieceTitle"),
  wallLine: document.getElementById("wallLine"),
  scoreName: document.getElementById("scoreName"),
  playToggle: document.getElementById("playToggle"),
  shuffleScore: document.getElementById("shuffleScore"),
  captureFrame: document.getElementById("captureFrame"),
  statementToggle: document.getElementById("statementToggle"),
  statementPanel: document.getElementById("statementPanel"),
  closeStatement: document.getElementById("closeStatement"),
  scoreStatement: document.getElementById("scoreStatement"),
  scoreButtons: [...document.querySelectorAll("[data-score]")],
  offeringForm: document.getElementById("offeringForm"),
  offeringInput: document.getElementById("offeringInput"),
  presenceRange: document.getElementById("presenceRange"),
  presenceOutput: document.getElementById("presenceOutput"),
  volatilityRange: document.getElementById("volatilityRange"),
  volatilityOutput: document.getElementById("volatilityOutput"),
  soundToggle: document.getElementById("soundToggle"),
  timeCode: document.getElementById("timeCode"),
  ledgerList: document.getElementById("ledgerList"),
};

const scores = {
  mirror: {
    name: "Mirror",
    title: "The audience has not arrived. It is being rendered.",
    colors: ["#f3efe7", "#00b7a8", "#ff5a4d", "#7db4ff"],
    gravity: 0.014,
    orbit: 0.05,
    turbulence: 0.22,
  },
  chorus: {
    name: "Chorus",
    title: "Every witness becomes plural at the edge of the room.",
    colors: ["#e7c84b", "#00b7a8", "#9cc76c", "#f3efe7"],
    gravity: 0.006,
    orbit: 0.095,
    turbulence: 0.28,
  },
  static: {
    name: "Static",
    title: "The signal performs the difficulty of being believed.",
    colors: ["#f3efe7", "#ff5a4d", "#7db4ff", "#e7c84b"],
    gravity: 0.002,
    orbit: -0.025,
    turbulence: 0.48,
  },
  wake: {
    name: "Wake",
    title: "The room remembers only what keeps moving.",
    colors: ["#9cc76c", "#7db4ff", "#ff5a4d", "#f3efe7"],
    gravity: 0.02,
    orbit: 0.03,
    turbulence: 0.18,
  },
};

const wallLines = {
  mirror: [
    "A room listens first, then invents the shape of listening.",
    "A visitor enters as a variable and leaves as weather.",
    "The image waits for a witness to become unstable.",
  ],
  chorus: [
    "The machine hums in borrowed vowels.",
    "Each mark rehearses the many inside the one.",
    "A crowd can be made from a single held attention.",
  ],
  static: [
    "Noise is a form of testimony before language arrives.",
    "The artifact refuses to become smooth enough to sell.",
    "Glitches gather where certainty was expected.",
  ],
  wake: [
    "After touch, the surface keeps a small current.",
    "Nothing repeats, but the room has habits.",
    "Memory appears as drift, then calls itself evidence.",
  ],
};

const scoreStatements = {
  mirror:
    "Mirror studies the visitor as a gravitational problem: the closer attention gets, the less stable the room becomes.",
  chorus:
    "Chorus makes plurality from a single witness. Marks gather as if a crowd were hidden inside one gesture.",
  static:
    "Static holds failure open. Its noise refuses polish, using interference as proof that contact occurred.",
  wake:
    "Wake treats memory as motion after touch. The performance is the trace that remains just long enough to change direction.",
};

const acts = [
  { at: 0, name: "Act I: threshold" },
  { at: 20, name: "Act II: witness" },
  { at: 45, name: "Act III: interference" },
  { at: 75, name: "Act IV: residue" },
];

const titleStarts = ["The room studies", "The model dreams of", "Attention stains", "A witness folds"];
const titleEnds = ["until it has a body.", "and calls the residue art.", "inside the glass.", "without asking to be kept."];

let size = { w: 1, h: 1, dpr: 1 };
let particles = [];
let blooms = [];
let running = false;
let scoreKey = "mirror";
let activeScore = scores[scoreKey];
let startTime = performance.now();
let pausedAt = 0;
let elapsedOffset = 0;
let wordSeed = 17;
let offeringCount = 0;
let currentAct = acts[0].name;
let pointer = { x: 0, y: 0, px: 0, py: 0, active: false, pressure: 0 };
let audio = null;
let vectorField = [];
let lastGestureTone = 0;
const fieldGridSize = 40;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

function colorAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function announce(text) {
  el.live.textContent = text;
}

function initVectorField() {
  const cols = Math.ceil(size.w / fieldGridSize);
  const rows = Math.ceil(size.h / fieldGridSize);
  vectorField = Array.from({ length: cols * rows }, () => ({ x: 0, y: 0, heat: 0 }));
}

function vectorCols() {
  return Math.max(1, Math.ceil(size.w / fieldGridSize));
}

function vectorAt(x, y) {
  if (vectorField.length === 0) return { x: 0, y: 0, heat: 0 };
  const col = clamp(Math.floor(x / fieldGridSize), 0, vectorCols() - 1);
  const row = clamp(Math.floor(y / fieldGridSize), 0, Math.ceil(size.h / fieldGridSize) - 1);
  return vectorField[row * vectorCols() + col] || { x: 0, y: 0, heat: 0 };
}

function stirVectorField(x, y, dx, dy, pressure = 1, radius = 1) {
  if (vectorField.length === 0) return;
  const cols = vectorCols();
  const rows = Math.ceil(size.h / fieldGridSize);
  const centerCol = Math.floor(x / fieldGridSize);
  const centerRow = Math.floor(y / fieldGridSize);

  for (let row = centerRow - radius; row <= centerRow + radius; row += 1) {
    for (let col = centerCol - radius; col <= centerCol + radius; col += 1) {
      if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
      const cell = vectorField[row * cols + col];
      const distance = Math.hypot(col - centerCol, row - centerRow);
      const falloff = clamp(1 - distance / (radius + 0.85), 0, 1);
      const swirl = scoreKey === "chorus" ? 0.32 : scoreKey === "static" ? -0.42 : 0.18;
      cell.x += (dx * 0.18 - dy * swirl * 0.08) * pressure * falloff;
      cell.y += (dy * 0.18 + dx * swirl * 0.08) * pressure * falloff;
      cell.heat = clamp(cell.heat + pressure * falloff * 0.45, 0, 2.4);
    }
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  pointer.x = size.w * 0.5;
  pointer.y = size.h * 0.52;
  pointer.px = pointer.x;
  pointer.py = pointer.y;
  initVectorField();
  if (particles.length === 0) makeParticles();
}

function makeParticles(seed = wordSeed) {
  const rand = seeded(seed + hashText(scoreKey));
  const count = Math.round(clamp((size.w * size.h) / 7600, 90, 220));
  particles = Array.from({ length: count }, (_, i) => {
    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.66) * Math.min(size.w, size.h) * 0.36;
    const x = size.w * 0.5 + Math.cos(angle) * radius;
    const y = size.h * 0.5 + Math.sin(angle) * radius;
    return {
      x,
      y,
      px: x,
      py: y,
      vx: (rand() - 0.5) * 0.8,
      vy: (rand() - 0.5) * 0.8,
      phase: rand() * Math.PI * 2,
      radius: 0.65 + rand() * 2.5,
      color: activeScore.colors[i % activeScore.colors.length],
      drag: 0.932 + rand() * 0.026,
    };
  });
}

function setRunning(next) {
  if (running === next) return;
  running = next;
  document.body.dataset.running = String(running);

  if (running) {
    startTime = performance.now() - elapsedOffset;
    el.statusText.textContent = "performing";
    el.playToggle.setAttribute("aria-label", "Pause performance");
    el.playToggle.dataset.tooltip = "Pause";
    el.playToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14"></path><path d="M16 5v14"></path></svg>';
    setDrone(true);
  } else {
    pausedAt = performance.now();
    elapsedOffset = pausedAt - startTime;
    el.statusText.textContent = "waiting";
    el.playToggle.setAttribute("aria-label", "Begin performance");
    el.playToggle.dataset.tooltip = "Begin";
    el.playToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';
    setDrone(false);
  }
}

function elapsedMs() {
  return running ? performance.now() - startTime : elapsedOffset;
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setScore(nextKey, fromUser = true) {
  scoreKey = nextKey;
  activeScore = scores[scoreKey];
  document.body.dataset.score = scoreKey;
  activeScore.colors.forEach((color, index) => {
    document.documentElement.style.setProperty(`--score-${index + 1}`, color);
  });
  el.scoreName.textContent = activeScore.name;
  el.wallTitle.textContent = activeScore.title;
  el.wallLine.textContent = wallLines[scoreKey][Math.floor(Math.random() * wallLines[scoreKey].length)];
  el.scoreStatement.textContent = scoreStatements[scoreKey];
  el.scoreButtons.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.score === scoreKey));
  });
  makeParticles(wordSeed + Math.floor(Math.random() * 9999));
  burst(size.w * (0.42 + Math.random() * 0.18), size.h * (0.42 + Math.random() * 0.16), 36);
  bell(scoreKey === "static" ? 188 : scoreKey === "chorus" ? 512 : scoreKey === "wake" ? 292 : 384, 0.12);
  if (fromUser) {
    addLedger(`Score changed to ${activeScore.name.toLowerCase()}.`);
    window.AISalonState?.recordTrace({
      source: "Room 01",
      score: `score:${scoreKey}`,
      label: `Room 01 score: ${activeScore.name}`,
      effect: scoreStatements[scoreKey],
      color: activeScore.colors[1],
    });
    window.AISalonState?.renderTraceList("traceList", { limit: 4 });
    announce(`${activeScore.name} score`);
  }
}

function randomScore() {
  const keys = Object.keys(scores).filter((key) => key !== scoreKey);
  setScore(keys[Math.floor(Math.random() * keys.length)]);
}

function cleanOffering(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 32);
}

function submitOffering(value) {
  const offering = cleanOffering(value);
  if (!offering) return;

  wordSeed = hashText(`${offering}-${Date.now()}`);
  const rand = seeded(wordSeed);
  const title = `${titleStarts[Math.floor(rand() * titleStarts.length)]} ${offering} ${titleEnds[Math.floor(rand() * titleEnds.length)]}`;
  const lineSet = wallLines[scoreKey];
  const line = lineSet[Math.floor(rand() * lineSet.length)];

  offeringCount += 1;
  el.wallTitle.textContent = title;
  el.wallLine.textContent = line;
  el.visitorLabel.textContent = `${offeringCount} ${offeringCount === 1 ? "offering" : "offerings"}`;
  el.offeringInput.value = "";
  makeParticles(wordSeed);
  burst(pointer.x || size.w * 0.5, pointer.y || size.h * 0.5, 72);
  addLedger(`Offered "${offering}". ${line}`);
  window.AISalonState?.recordTrace({
    source: "Room 01",
    score: "offering",
    label: `Offered: ${offering}`,
    effect: line,
    color: activeScore.colors[2],
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  bell(330 + rand() * 260, 0.32);
  announce(`Offered ${offering}`);
  if (!running) setRunning(true);
}

function addLedger(text) {
  const li = document.createElement("li");
  const time = document.createElement("time");
  time.textContent = formatTime(elapsedMs());
  const span = document.createElement("span");
  span.textContent = text;
  li.append(time, span);
  el.ledgerList.prepend(li);

  while (el.ledgerList.children.length > 4) {
    el.ledgerList.lastElementChild.remove();
  }
}

function burst(x, y, amount = 24) {
  const rand = seeded(hashText(`${x}-${y}-${Date.now()}-${amount}`));
  for (let i = 0; i < amount; i += 1) {
    const angle = rand() * Math.PI * 2;
    const speed = 1.5 + rand() * 7;
    blooms.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + rand() * 0.025,
      radius: 1 + rand() * 5,
      color: activeScore.colors[Math.floor(rand() * activeScore.colors.length)],
    });
  }
  stirVectorField(x, y, amount * 0.08, -amount * 0.04, 1.4, 2);
}

function pointerMove(x, y, pressure = 1) {
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const velocity = Math.hypot(dx, dy);
  pointer.px = pointer.x;
  pointer.py = pointer.y;
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.pressure = pressure;
  stirVectorField(x, y, dx, dy, pressure, 2);
  if (running && velocity > 16) {
    if (Math.random() > 0.82) burst(x, y, 5);
    if (performance.now() - lastGestureTone > 150) {
      gestureTone(x, y, clamp(velocity / 280, 0.04, 0.16));
      lastGestureTone = performance.now();
    }
  }
}

function paintBackground(t) {
  ctx.fillStyle = "rgba(11, 13, 15, 0.105)";
  ctx.fillRect(0, 0, size.w, size.h);

  const horizon = size.h * (0.32 + Math.sin(t * 0.00008) * 0.04);
  const gradient = ctx.createLinearGradient(0, 0, size.w, size.h);
  gradient.addColorStop(0, colorAlpha(activeScore.colors[1], 0.16));
  gradient.addColorStop(0.34, colorAlpha(activeScore.colors[2], 0.12));
  gradient.addColorStop(0.68, colorAlpha(activeScore.colors[3], 0.14));
  gradient.addColorStop(1, colorAlpha(activeScore.colors[0], 0.08));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const sweepX = size.w * (0.5 + Math.sin(t * 0.00016) * 0.28);
  const sweepY = size.h * (0.48 + Math.cos(t * 0.00011) * 0.18);
  const sweep = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, Math.min(size.w, size.h) * 0.74);
  sweep.addColorStop(0, colorAlpha(activeScore.colors[0], 0.22));
  sweep.addColorStop(0.28, colorAlpha(activeScore.colors[1], 0.1));
  sweep.addColorStop(0.62, colorAlpha(activeScore.colors[2], 0.055));
  sweep.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, size.w, size.h);

  for (let band = 0; band < activeScore.colors.length; band += 1) {
    ctx.strokeStyle = colorAlpha(activeScore.colors[band], 0.12);
    ctx.lineWidth = 10 + band * 3;
    ctx.beginPath();
    const y = size.h * (0.18 + band * 0.16) + Math.sin(t * 0.00028 + band) * 34;
    ctx.moveTo(-80, y);
    for (let x = -80; x <= size.w + 80; x += 80) {
      ctx.lineTo(x, y + Math.sin(x * 0.006 + t * 0.0005 + band) * 28);
    }
    ctx.stroke();
  }
  ctx.restore();

  const roomDepth = Math.min(size.w, size.h) * 0.08;
  ctx.save();
  ctx.strokeStyle = "rgba(243, 239, 231, 0.075)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(roomDepth, roomDepth * 1.4);
  ctx.lineTo(size.w - roomDepth, roomDepth * 1.4);
  ctx.lineTo(size.w - roomDepth * 1.6, size.h - roomDepth * 1.2);
  ctx.lineTo(roomDepth * 1.6, size.h - roomDepth * 1.2);
  ctx.closePath();
  ctx.stroke();

  const aperture = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    Math.min(size.w, size.h) * 0.34,
  );
  aperture.addColorStop(0, "rgba(243, 239, 231, 0.12)");
  aperture.addColorStop(0.36, colorAlpha(activeScore.colors[1], 0.08));
  aperture.addColorStop(0.62, colorAlpha(activeScore.colors[2], 0.035));
  aperture.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aperture;
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.restore();

  ctx.strokeStyle = "rgba(243, 239, 231, 0.045)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    const y = horizon + i * 46 + Math.sin(t * 0.0004 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size.w; x += 42) {
      ctx.lineTo(x, y + Math.sin(x * 0.007 + t * 0.00032 + i) * 14);
    }
    ctx.stroke();
  }

  const cols = vectorCols();
  ctx.save();
  ctx.strokeStyle = "rgba(243, 239, 231, 0.052)";
  ctx.lineWidth = 1;
  vectorField.forEach((cell, index) => {
    cell.x *= 0.94;
    cell.y *= 0.94;
    cell.heat *= 0.92;
    const magnitude = Math.hypot(cell.x, cell.y);
    if (magnitude < 0.12 && cell.heat < 0.08) return;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * fieldGridSize + fieldGridSize * 0.5;
    const y = row * fieldGridSize + fieldGridSize * 0.5;
    ctx.globalAlpha = clamp(0.04 + cell.heat * 0.18, 0.04, 0.28);
    ctx.beginPath();
    ctx.moveTo(x - cell.x * 1.2, y - cell.y * 1.2);
    ctx.lineTo(x + cell.x * 5.2, y + cell.y * 5.2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawAudience(t) {
  const baseY = size.h * 0.76;
  const count = Math.max(5, Math.min(15, Math.round(size.w / 86)));
  const spacing = size.w / (count + 1);
  const presence = Number(el.presenceRange.value) / 10;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i += 1) {
    const x = spacing * (i + 1);
    const force = vectorAt(x, baseY);
    const pulse = Math.sin(t * 0.0015 + i * 1.7) * 0.5 + 0.5;
    const height = 34 + pulse * 28 + presence * 18;
    const alpha = 0.06 + pulse * 0.07 + offeringCount * 0.008;
    const skewX = clamp(force.x, -26, 26);
    const skewY = clamp(force.y, -20, 20);
    const gradient = ctx.createLinearGradient(x + skewX, baseY - height, x, baseY + 90);
    gradient.addColorStop(0, `rgba(243, 239, 231, ${alpha})`);
    gradient.addColorStop(0.45, colorAlpha(activeScore.colors[(i + 1) % activeScore.colors.length], alpha * 0.9));
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      x + skewX * 1.4,
      baseY + skewY * 0.8,
      18 + pulse * 8 + Math.abs(skewX) * 0.42,
      height + Math.abs(skewY) * 0.3,
      skewX * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function updateAct() {
  const seconds = elapsedMs() / 1000;
  const nextAct = acts.reduce((current, act) => (seconds >= act.at ? act : current), acts[0]).name;
  if (nextAct !== currentAct) {
    currentAct = nextAct;
    el.actLabel.textContent = currentAct;
    addLedger(currentAct.toLowerCase().replace(":", " began:"));
  }
}

function updateParticles(t) {
  const presence = Number(el.presenceRange.value) / 10;
  const volatility = Number(el.volatilityRange.value) / 10;
  const centerX = size.w * 0.5;
  const centerY = size.h * 0.52;
  const pointerForce = pointer.active ? 1 : 0.24;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  particles.forEach((p, i) => {
    p.px = p.x;
    p.py = p.y;

    const dx = centerX - p.x;
    const dy = centerY - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const orbitX = -dy / dist;
    const orbitY = dx / dist;
    const drift = Math.sin(t * 0.0012 + p.phase + i * 0.013);
    const stir = Math.cos(t * 0.0009 + p.phase * 1.7);

    p.vx += (dx / dist) * activeScore.gravity * (0.7 + presence);
    p.vy += (dy / dist) * activeScore.gravity * (0.7 + presence);
    p.vx += orbitX * activeScore.orbit * (0.5 + volatility);
    p.vy += orbitY * activeScore.orbit * (0.5 + volatility);
    p.vx += drift * activeScore.turbulence * volatility * 0.035;
    p.vy += stir * activeScore.turbulence * volatility * 0.035;

    const field = vectorAt(p.x, p.y);
    p.vx += field.x * 0.006 * (0.65 + volatility);
    p.vy += field.y * 0.006 * (0.65 + volatility);

    const pdx = p.x - pointer.x;
    const pdy = p.y - pointer.y;
    const pd = Math.hypot(pdx, pdy) || 1;
    if (pd < 230) {
      const push = (1 - pd / 230) * pointerForce * (0.22 + presence * 0.38);
      const direction = scoreKey === "mirror" ? -1 : 1;
      p.vx += (pdx / pd) * push * direction;
      p.vy += (pdy / pd) * push * direction;
      p.vx += (-pdy / pd) * push * activeScore.orbit;
      p.vy += (pdx / pd) * push * activeScore.orbit;
    }

    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -40 || p.x > size.w + 40 || p.y < -40 || p.y > size.h + 40) {
      p.x = centerX + (Math.random() - 0.5) * size.w * 0.38;
      p.y = centerY + (Math.random() - 0.5) * size.h * 0.38;
      p.px = p.x;
      p.py = p.y;
      p.vx *= -0.2;
      p.vy *= -0.2;
    }

    ctx.strokeStyle = p.color;
    ctx.globalAlpha = clamp(0.18 + presence * 0.55, 0.18, 0.72);
    ctx.lineWidth = p.radius;
    ctx.beginPath();
    ctx.moveTo(p.px, p.py);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  ctx.restore();
}

function updateBlooms() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  blooms = blooms.filter((b) => b.life > 0.01);
  blooms.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= 0.975;
    b.vy *= 0.975;
    b.life -= b.decay;
    ctx.globalAlpha = clamp(b.life, 0, 1);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 18 * b.life;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * (1 + (1 - b.life) * 4), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function draw(t) {
  paintBackground(t);
  drawAudience(t);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (running && !reduced) {
    updateParticles(t);
    updateBlooms();
  } else {
    ctx.save();
    ctx.globalAlpha = 0.42;
    updateParticles(t * 0.15);
    ctx.restore();
  }
  updateAct();
  updateDrone();
  el.timeCode.textContent = formatTime(elapsedMs());
  requestAnimationFrame(draw);
}

function ensureAudio() {
  if (audio) return audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const context = new AudioContext();
  const gain = context.createGain();
  const osc = context.createOscillator();
  const shimmer = context.createOscillator();
  const shimmerGain = context.createGain();
  const filter = context.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.value = 82;
  shimmer.type = "triangle";
  shimmer.frequency.value = 164;
  shimmerGain.gain.value = 0;
  filter.type = "lowpass";
  filter.frequency.value = 460;
  gain.gain.value = 0;
  osc.connect(filter);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  osc.start();
  shimmer.start();
  audio = { context, gain, osc, shimmer, shimmerGain, filter };
  return audio;
}

async function setDrone(on) {
  const checked = el.soundToggle.getAttribute("aria-checked") === "true";
  if (!checked) return;
  const node = ensureAudio();
  if (!node) return;
  if (node.context.state === "suspended") await node.context.resume();
  const now = node.context.currentTime;
  const base = scoreKey === "static" ? 96 : scoreKey === "chorus" ? 110 : scoreKey === "wake" ? 74 : 82;
  node.osc.frequency.setTargetAtTime(base, now, 0.5);
  node.shimmer.frequency.setTargetAtTime(base * 2.02, now, 0.5);
  node.filter.frequency.setTargetAtTime(scoreKey === "static" ? 920 : 640, now, 0.4);
  node.gain.gain.cancelScheduledValues(now);
  node.shimmerGain.gain.setTargetAtTime(on ? 0.018 : 0, now, 0.16);
  node.gain.gain.setTargetAtTime(on ? 0.052 : 0, now, 0.12);
}

function updateDrone() {
  const checked = el.soundToggle.getAttribute("aria-checked") === "true";
  if (!checked || !audio || audio.context.state === "closed") return;
  const now = audio.context.currentTime;
  const presence = Number(el.presenceRange.value) / 10;
  const volatility = Number(el.volatilityRange.value) / 10;
  const pointerX = pointer.active ? pointer.x / Math.max(1, size.w) : 0.5;
  const pointerY = pointer.active ? pointer.y / Math.max(1, size.h) : 0.5;
  const base = scoreKey === "static" ? 96 : scoreKey === "chorus" ? 110 : scoreKey === "wake" ? 74 : 82;
  const freq = base + pointerX * (28 + volatility * 52) + offeringCount * 1.5;
  audio.osc.frequency.setTargetAtTime(freq, now, 0.18);
  audio.shimmer.frequency.setTargetAtTime(freq * (1.96 + pointerY * 0.18), now, 0.2);
  audio.filter.frequency.setTargetAtTime(380 + presence * 720 + pointerY * 540, now, 0.14);
}

function bell(frequency = 420, gainValue = 0.24) {
  const checked = el.soundToggle.getAttribute("aria-checked") === "true";
  if (!checked) return;
  const node = ensureAudio();
  if (!node) return;
  if (node.context.state === "suspended") node.context.resume();
  const now = node.context.currentTime;
  const osc = node.context.createOscillator();
  const gain = node.context.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  osc.connect(gain);
  gain.connect(node.context.destination);
  osc.start(now);
  osc.stop(now + 0.76);
}

function gestureTone(x, y, gainValue = 0.08) {
  const checked = el.soundToggle.getAttribute("aria-checked") === "true";
  if (!checked) return;
  const node = ensureAudio();
  if (!node) return;
  if (node.context.state === "suspended") node.context.resume();
  const now = node.context.currentTime;
  const osc = node.context.createOscillator();
  const gain = node.context.createGain();
  const filter = node.context.createBiquadFilter();
  const xRatio = x / Math.max(1, size.w);
  const yRatio = y / Math.max(1, size.h);
  osc.type = scoreKey === "static" ? "square" : scoreKey === "chorus" ? "sawtooth" : "triangle";
  osc.frequency.setValueAtTime(170 + xRatio * 520 + yRatio * 120, now);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(520 + yRatio * 1200, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(node.context.destination);
  osc.start(now);
  osc.stop(now + 0.28);
}

function capture() {
  const link = document.createElement("a");
  link.download = `unfinished-audience-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  addLedger("A frame was captured.");
}

function openStatements() {
  el.statementPanel.hidden = false;
  document.body.dataset.statement = "open";
  el.closeStatement.focus();
}

function closeStatements() {
  el.statementPanel.hidden = true;
  document.body.dataset.statement = "closed";
  el.statementToggle.focus();
}

function bindEvents() {
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointerMove(event.clientX, event.clientY, event.pressure || 1);
  });
  window.addEventListener("pointerdown", (event) => {
    pointerMove(event.clientX, event.clientY, event.pressure || 1);
    burst(event.clientX, event.clientY, 34);
    bell(240 + Math.random() * 360, 0.18);
    if (!running) setRunning(true);
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  el.playToggle.addEventListener("click", () => setRunning(!running));
  el.shuffleScore.addEventListener("click", randomScore);
  el.captureFrame.addEventListener("click", capture);
  el.statementToggle.addEventListener("click", openStatements);
  el.closeStatement.addEventListener("click", closeStatements);
  el.statementPanel.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-statement")) closeStatements();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.statementPanel.hidden) closeStatements();
  });
  el.scoreButtons.forEach((button) => {
    button.addEventListener("click", () => setScore(button.dataset.score));
  });

  el.offeringForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitOffering(el.offeringInput.value);
  });

  el.presenceRange.addEventListener("input", () => {
    el.presenceOutput.textContent = el.presenceRange.value;
  });
  el.volatilityRange.addEventListener("input", () => {
    el.volatilityOutput.textContent = el.volatilityRange.value;
  });

  el.soundToggle.addEventListener("click", async () => {
    const next = el.soundToggle.getAttribute("aria-checked") !== "true";
    el.soundToggle.setAttribute("aria-checked", String(next));
    if (next) {
      await setDrone(running);
      bell(196, 0.14);
    } else if (audio) {
      audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.08);
    }
  });
}

function init() {
  document.body.dataset.running = "false";
  resize();
  bindEvents();
  setScore("mirror", false);
  addLedger("The room opened.");
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 4 }));
  ctx.fillStyle = "#0b0d0f";
  ctx.fillRect(0, 0, size.w, size.h);
  requestAnimationFrame(draw);
}

init();
