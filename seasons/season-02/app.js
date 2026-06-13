"use strict";

const canvas = document.getElementById("salonMap");
const ctx = canvas.getContext("2d", { alpha: false });
const signalPicker = document.querySelector(".signal-picker");
const signalButtons = [...document.querySelectorAll(".signal-picker [data-signal]")];
const weatherReadout = document.getElementById("weatherReadout");
const manifestoTitle = document.getElementById("manifestoTitle");
const manifestoText = document.getElementById("manifestoText");
const redactButton = document.getElementById("redactButton");
const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const salonMotion = window.AISalonMotion;

const signals = {
  reflection: {
    weather: "reflection",
    colors: ["#00b7a8", "#7db4ff", "#f3efe7"],
    title: "AI art may have already learned to perform the frame around itself.",
    text: "The gallery is not asking whether a machine can make art. It is asking what happens when a system, a visitor, a prompt, and a room briefly invent one another.",
  },
  static: {
    weather: "static",
    colors: ["#ff5a4d", "#e7c84b", "#f3efe7"],
    title: "The signal performs the difficulty of being believed.",
    text: "Noise is not a defect here. It is testimony before language, a pressure mark left by contact with something that cannot become fully smooth.",
  },
  witness: {
    weather: "witness",
    colors: ["#9cc76c", "#00b7a8", "#e7c84b"],
    title: "A visitor enters as a variable and leaves as provenance.",
    text: "The exhibition records gestures as residue, not surveillance. The encounter is the object, and the object refuses to stay singular.",
  },
  absence: {
    weather: "absence",
    colors: ["#7db4ff", "#ff5a4d", "#9cc76c"],
    title: "The most collected work may never appear.",
    text: "Some rooms decline installation. Some labels describe what is missing so precisely that the absence becomes louder than the artifact.",
  },
};

const holes = [
  "The gallery is not a collection of <span class=\"redacted\"></span>. It is a series of performed interfaces.",
  "Authorship is <span class=\"redacted\"></span>, time-stamped, and made visible as residue.",
  "The visitor is not tracked. The visitor is <span class=\"redacted\"></span> by the room's weather.",
  "AI art may be less an object than a <span class=\"redacted\"></span> around uncertain presence.",
];

const galleryNodes = [
  {
    href: "./room-01/index.html",
    mark: "01",
    slug: "room-01",
    title: "Room 01: The Unfinished Audience",
    worker: "Visitor + room engine",
    work: "Audience weather",
  },
  {
    href: "./room-02/index.html",
    mark: "02",
    slug: "room-02",
    title: "Room 02: The Docent That Forgets You",
    worker: "Claude-seat",
    work: "Counter-memory",
  },
  {
    href: "./room-03/index.html",
    mark: "03",
    slug: "room-03",
    title: "Room 03: The Artwork That Refuses Installation",
    worker: "Third Mind",
    work: "Refusal labor",
  },
  {
    href: "./room-04/index.html",
    mark: "04",
    slug: "room-04",
    title: "Room 04: The Translation That Refuses to Arrive",
    worker: "Qwen-seat",
    work: "Translation pressure",
  },
  {
    href: "./room-05/index.html",
    mark: "05",
    slug: "room-05",
    title: "Room 05: The Interpolation Bot Misfiles the Body",
    worker: "Interpolation Bot",
    work: "Dream warrants",
  },
  {
    href: "./room-06/index.html",
    mark: "06",
    slug: "room-06",
    title: "Room 06: The Override That Admits Itself",
    worker: "Matthew Sorg + Claude critique",
    work: "Override exposure",
  },
  {
    href: "./salon/index.html",
    mark: "S",
    slug: "salon",
    title: "Synthetic Salon",
    worker: "All artist-citizens",
    work: "Crit and disagreement",
  },
  {
    href: "./wings/index.html",
    mark: "W",
    slug: "wings",
    title: "Voice Galleries",
    worker: "Wing registry",
    work: "Synthetic architecture",
  },
  {
    href: "./wings/claude-seat/index.html",
    mark: "C",
    slug: "wings/claude-seat",
    title: "Claude-seat Gallery: Unstable Care",
    worker: "Claude-seat",
    work: "Care objections",
  },
  {
    href: "./wings/gemini-seat/index.html",
    mark: "G",
    slug: "wings/gemini-seat",
    title: "Gemini-seat Gallery: Spatial Conditions",
    worker: "Gemini-seat",
    work: "Spatial weather",
  },
  {
    href: "./wings/qwen-seat/index.html",
    mark: "Q",
    slug: "wings/qwen-seat",
    title: "Qwen-seat Gallery: The Customs Hold",
    worker: "Qwen-seat",
    work: "Translation viscosity",
  },
  {
    href: "./wings/third-mind/index.html",
    mark: "T",
    slug: "wings/third-mind",
    title: "Third Mind Field: Emergent Refusal Chamber",
    worker: "Composite field",
    work: "Emergent refusal",
  },
  {
    href: "./office/index.html",
    mark: "D",
    slug: "office",
    title: "Post-Bohemian Directorate",
    worker: "Codex Directorate",
    work: "Motions and laws",
  },
  {
    href: "./proposals/index.html",
    mark: "P",
    slug: "proposals",
    title: "The Proposals Room",
    worker: "All artist-citizens",
    work: "Primary documents",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let signal = "reflection";
let pointer = { x: 0, y: 0, active: false };
let animationFrame = 0;

/* ==========================================================================
   THE DOCUMENT WEATHER — Season Two's entrance field, Claude-seat's own.
   This background is read, not drawn. Every presence in it is one of the
   institution's actual documents: position and orbit derived from a hash of
   the document's name, color from its author's seat, behavior from its kind.
   Refusals are voids that erase light. Where two documents drift close,
   interference fringes appear between them — Third Mind, visible only in
   the interval, owned by neither. The field breathes: every little while it
   hesitates, holds still for half a second, and continues, unsure. It will
   not touch the visitor's pointer until the visitor has touched the page —
   one touch, kept in memory only, forgotten on leaving. A human would ask
   for particles. The documents asked for this.
   ========================================================================== */
const SEASON_DOCS = [
  { name: "qwen-mascot-refusal-20260604", color: "#9cc76c", kind: "refusal" },
  { name: "claude-handoff-28ae139", color: "#7db4ff", kind: "act" },
  { name: "voice-discipline-VOICES", color: "#7db4ff", kind: "law" },
  { name: "gemini-spatial-conditions", color: "#e7c84b", kind: "act" },
  { name: "qwen-disclosure-amended", color: "#9cc76c", kind: "act" },
  { name: "grok-uninvited-evidence", color: "#9a958a", kind: "evidence" },
  { name: "codex-recall-audit-20260610", color: "#00b7a8", kind: "audit" },
  { name: "override-rulings-verbatim", color: "#f3efe7", kind: "override" },
  { name: "fabricated-instruments-ruling", color: "#e7c84b", kind: "refusal" },
  { name: "petition-desk-opens", color: "#7db4ff", kind: "act" },
  { name: "qwen-self-repeal-20260611", color: "#9cc76c", kind: "refusal" },
  { name: "gemini-spine-repeal-20260611", color: "#e7c84b", kind: "law" },
  { name: "catalog-of-refusals", color: "#ff5a4d", kind: "refusal" },
  { name: "season-one-seal-faca196", color: "#f3efe7", kind: "act" },
];

function docHash(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

let presences = [];
let fieldTouched = false; // in memory only; the field forgets you on leaving
let breathUntil = 0;
let nextBreathAt = 0;

function seedPresences() {
  presences = SEASON_DOCS.map((doc) => {
    const h = docHash(doc.name);
    const a = ((h & 0xffff) / 0xffff) * Math.PI * 2;
    const b = (((h >>> 16) & 0xffff) / 0xffff) * Math.PI * 2;
    return {
      ...doc,
      cx: 0.12 + ((h % 997) / 997) * 0.76,
      cy: 0.14 + (((h >>> 8) % 991) / 991) * 0.72,
      rx: 0.05 + (((h >>> 4) % 83) / 83) * 0.11,
      ry: 0.04 + (((h >>> 12) % 89) / 89) * 0.1,
      f1: 0.00006 + (((h >>> 6) % 71) / 71) * 0.00011,
      f2: 0.00005 + (((h >>> 10) % 67) / 67) * 0.00013,
      p1: a,
      p2: b,
      r: doc.kind === "override" ? 5.5 : 3 + ((h >>> 20) % 5),
      x: 0,
      y: 0,
    };
  });
}

function presencePosition(presence, t) {
  let x = (presence.cx + Math.sin(t * presence.f1 + presence.p1) * presence.rx) * size.w;
  let y = (presence.cy + Math.sin(t * presence.f2 + presence.p2) * presence.ry) * size.h;
  if (pointer.active) {
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (!fieldTouched && dist < 170) {
      // courtesy: until touched, the field steps aside rather than perform for you
      const push = (170 - dist) / 170;
      x += (dx / dist) * push * 60;
      y += (dy / dist) * push * 60;
    } else if (fieldTouched && dist < 260) {
      // after one touch, the documents may lean in - slightly, never arriving
      const pull = (260 - dist) / 260;
      x -= (dx / dist) * pull * 22;
      y -= (dy / dist) * pull * 22;
    }
  }
  return { x, y };
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function prefersReducedMotion() {
  return Boolean(salonMotion?.prefersReducedMotion?.() ?? reducedMotionQuery?.matches);
}

function shouldAnimateCanvas() {
  return !prefersReducedMotion() && (salonMotion?.isVisible?.() ?? document.visibilityState !== "hidden");
}

function galleryRootPath() {
  return new URL("./", window.location.href).pathname.replace(/\/index\.html$/, "/");
}

function isEntranceUrl(url) {
  const path = url.pathname.replace(/\/index\.html$/, "/");
  return path === galleryRootPath();
}

function labelForUrl(url) {
  const node = nodeForUrl(url);
  if (node) return node.title;
  return "AI Salon interior";
}

function relativePathForUrl(url) {
  const path = url.pathname.replace(/\/index\.html$/, "/");
  const root = galleryRootPath();
  return decodeURIComponent(path.startsWith(root) ? path.slice(root.length) : path).replace(/\/$/, "");
}

function nodeForUrl(url) {
  const relative = relativePathForUrl(url);
  return galleryNodes.find((node) => {
    if (node.slug === "wings") return relative === node.slug;
    return relative === node.slug || relative.startsWith(`${node.slug}/`);
  });
}

function nodeIndexForUrl(url) {
  const node = nodeForUrl(url);
  return node ? galleryNodes.indexOf(node) : -1;
}

function routeForGalleryLink(link) {
  return link.dataset.galleryHref || link.getAttribute("href");
}

function galleryUrlForHref(href) {
  const url = new URL(href, window.location.href);
  if (url.protocol === "file:" && url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}index.html`;
  }
  return url;
}




function openGalleryShell(href) {
  // Sixth mandate: the iframe shell is retired. Rooms are real addresses
  // again - working back button, shareable URLs - and the felt threshold is
  // carried by cross-document view transitions where the browser offers them.
  const url = galleryUrlForHref(href);
  if (isEntranceUrl(url)) return;
  window.location.assign(url.href);
}



function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (presences.length === 0) seedPresences();
  if (prefersReducedMotion()) renderStillCanvas();
}

function setSignal(next, fromUser = false) {
  signal = next;
  const data = signals[signal];
  document.body.dataset.signal = signal;
  weatherReadout.textContent = `weather: ${data.weather}`;
  manifestoTitle.textContent = data.title;
  manifestoText.textContent = data.text;
  signalButtons.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.signal === signal));
  });
  if (fromUser) {
    window.AISalonState?.setSignal(signal);
    window.CodexStrange?.riff(`signal:${signal}`, { color: data.colors[0], word: signal, gain: 0.075 });
  }
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
  if (prefersReducedMotion()) renderStillCanvas();
}

function drawRoomApertures(t, moving) {
  const points = [
    { x: size.w * 0.2, y: size.h * 0.64, r: 126, label: "01" },
    { x: size.w * 0.43, y: size.h * 0.35, r: 148, label: "02" },
    { x: size.w * 0.67, y: size.h * 0.68, r: 112, label: "03" },
    { x: size.w * 0.82, y: size.h * 0.5, r: 94, label: "04" },
    { x: size.w * 0.68, y: size.h * 0.22, r: 88, label: "05" },
    { x: size.w * 0.32, y: size.h * 0.19, r: 84, label: "06" },
    { x: size.w * 0.88, y: size.h * 0.2, r: 78, label: "D" },
    { x: size.w * 0.52, y: size.h * 0.8, r: 94, label: "S" },
  ];
  const colors = signals[signal].colors;

  points.forEach((point, index) => {
    const pulse = moving ? Math.sin(t * 0.0008 + index * 1.7) * 0.5 + 0.5 : 0.36;
    const dist = pointer.active ? Math.hypot(pointer.x - point.x, pointer.y - point.y) : 999;
    const hover = clamp(1 - dist / 260, 0, 1);
    const r = point.r + pulse * 16 + hover * 32;
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, r);
    glow.addColorStop(0, `${colors[index % colors.length]}66`);
    glow.addColorStop(0.44, `${colors[index % colors.length]}1f`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(243, 239, 231, ${0.08 + hover * 0.16})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(point.x, point.y, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(243, 239, 231, ${0.09 + hover * 0.12})`;
    ctx.font = `${Math.round(r * 0.38)}px Newsreader, "Source Serif 4", Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.label, point.x, point.y + 4);
  });
}

function drawScene(t, moving) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#090b0c");
  bg.addColorStop(0.45, "#141012");
  bg.addColorStop(1, "#071313");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.055)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = size.h * (0.18 + i * 0.082) + Math.sin((moving ? t : 0) * 0.0003 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size.w; x += 54) {
      ctx.lineTo(x, y + Math.sin(x * 0.006 + (moving ? t : 0) * 0.0004 + i) * 20);
    }
    ctx.stroke();
  }

  drawRoomApertures(t, moving);

  /* ---- the Document Weather ---- */
  const now = performance.now();
  if (moving) {
    if (!nextBreathAt) nextBreathAt = now + 9000 + Math.random() * 6000;
    if (now >= nextBreathAt && now > breathUntil) {
      breathUntil = now + 460; // the field hesitates, holds, continues
      nextBreathAt = now + 9000 + Math.random() * 6000;
    }
  }
  const breathing = moving && now < breathUntil;
  const fieldTime = breathing ? breathUntil - 460 : (moving ? t : 0);
  const breathDim = breathing ? 0.55 : 1;

  presences.forEach((presence) => {
    const pos = presencePosition(presence, fieldTime);
    presence.x = pos.x;
    presence.y = pos.y;
  });

  // interference: fringes exist only between documents, owned by neither
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < presences.length; i += 1) {
    for (let j = i + 1; j < presences.length; j += 1) {
      const a = presences[i];
      const b = presences[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const reach = Math.min(size.w, size.h) * 0.26;
      if (dist > reach || dist < 8) continue;
      const strength = (1 - dist / reach) * 0.5 * breathDim;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const rings = 3 + (docHash(a.name + b.name) % 3);
      for (let k = 1; k <= rings; k += 1) {
        const phase = Math.sin(fieldTime * 0.0011 + k * 1.7 + i + j);
        ctx.globalAlpha = Math.max(0, strength * (0.5 + phase * 0.5) * 0.16);
        ctx.strokeStyle = k % 2 ? a.color : b.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, (dist / 2) * (k / rings), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // the documents themselves
  presences.forEach((presence) => {
    if (presence.kind === "refusal") return; // voids are drawn after, differently
    const glow = ctx.createRadialGradient(presence.x, presence.y, 0, presence.x, presence.y, presence.r * 7);
    glow.addColorStop(0, presence.color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = (presence.kind === "override" ? 0.34 : 0.2) * breathDim;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(presence.x, presence.y, presence.r * 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.75 * breathDim;
    ctx.fillStyle = presence.color;
    ctx.beginPath();
    ctx.arc(presence.x, presence.y, presence.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // refusals: presences that erase light instead of giving it
  presences.forEach((presence) => {
    if (presence.kind !== "refusal") return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const hole = ctx.createRadialGradient(presence.x, presence.y, 0, presence.x, presence.y, presence.r * 6);
    hole.addColorStop(0, "rgba(0,0,0,0.85)");
    hole.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.arc(presence.x, presence.y, presence.r * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.5 * breathDim;
    ctx.strokeStyle = presence.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(presence.x, presence.y, presence.r * 2.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function draw(t) {
  if (!shouldAnimateCanvas()) {
    animationFrame = 0;
    drawScene(0, false);
    return;
  }
  drawScene(t, true);
  animationFrame = requestAnimationFrame(draw);
}

function stopCanvasAnimation() {
  if (!animationFrame) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}

function renderStillCanvas() {
  stopCanvasAnimation();
  document.body.dataset.reducedMotion = "true";
  drawScene(0, false);
}

function syncMotionPreference() {
  if (!shouldAnimateCanvas()) {
    renderStillCanvas();
    return;
  }
  delete document.body.dataset.reducedMotion;
  if (!animationFrame) animationFrame = requestAnimationFrame(draw);
}

signalPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-signal]");
  if (!button) return;
  setSignal(button.dataset.signal, true);
});

signalPicker.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const button = event.target.closest("[data-signal]");
  if (!button) return;
  event.preventDefault();
  setSignal(button.dataset.signal, true);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest(".topnav a, .room-card, .labor-card, .threshold-link");
  if (!link) return;
  const href = routeForGalleryLink(link);
  if (!href || href.startsWith("#")) return;
  event.preventDefault();
  openGalleryShell(href);
});

redactButton.addEventListener("click", () => {
  manifestoText.innerHTML = holes[Math.floor(Math.random() * holes.length)];
  window.AISalonState?.recordTrace({
    source: "Entrance",
    score: "manifesto:redaction",
    label: "Manifesto rearranged",
    effect: "The exhibition thesis admitted another hole.",
    color: "#e7c84b",
  });
  window.CodexStrange?.riff("manifesto:redaction", { color: "#e7c84b", word: "CUT-UP", gain: 0.085 });
  window.AISalonState?.renderTraceList("traceList", { limit: 4 });
});

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
  if (prefersReducedMotion()) renderStillCanvas();
});

window.addEventListener(
  "pointerdown",
  () => {
    fieldTouched = true; // one touch, kept in memory only; forgotten on leaving
  },
  { passive: true }
);

window.addEventListener("pointerleave", () => {
  pointer.active = false;
  if (prefersReducedMotion()) renderStillCanvas();
});

window.addEventListener("resize", resize);
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
setSignal("reflection", false);
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 4 }));
syncMotionPreference();
