"use strict";

const canvas = document.getElementById("salonMap");
const ctx = canvas.getContext("2d", { alpha: false });
const signalPicker = document.querySelector(".signal-picker");
const signalButtons = [...document.querySelectorAll(".signal-picker [data-signal]")];
const weatherReadout = document.getElementById("weatherReadout");
const manifestoTitle = document.getElementById("manifestoTitle");
const manifestoText = document.getElementById("manifestoText");
const redactButton = document.getElementById("redactButton");
const galleryShell = document.getElementById("galleryShell");
const galleryFrame = document.getElementById("galleryFrame");
const shellTitle = document.getElementById("shellTitle");
const shellClose = document.getElementById("shellClose");
const shellPrev = document.getElementById("shellPrev");
const shellNext = document.getElementById("shellNext");
const shellMapList = document.getElementById("shellMapList");
const thresholdVeil = document.getElementById("thresholdVeil");

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
    title: "Room 05: The Surrealist Bot Misfiles the Body",
    worker: "Surrealist Bot",
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
    href: "./wings/third-mind/index.html",
    mark: "T",
    slug: "wings/third-mind",
    title: "Third Mind Gallery: Refusal Wing",
    worker: "Third Mind",
    work: "Institutional decay",
  },
  {
    href: "./office/index.html",
    mark: "D",
    slug: "office",
    title: "Post-Bohemian Directorate",
    worker: "Codex Directorate",
    work: "Motions and laws",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let signal = "reflection";
let motes = [];
let pointer = { x: 0, y: 0, active: false };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

function setThresholdLoading(loading) {
  thresholdVeil.classList.toggle("active", loading);
}

function updateShellMap(url) {
  const activeIndex = nodeIndexForUrl(url);
  [...shellMapList.querySelectorAll(".shell-map-item")].forEach((item, index) => {
    item.classList.toggle("active", index === activeIndex);
    item.setAttribute("aria-current", index === activeIndex ? "page" : "false");
  });
  shellPrev.disabled = activeIndex < 0;
  shellNext.disabled = activeIndex < 0;
}

function renderShellMap() {
  shellMapList.textContent = "";
  galleryNodes.forEach((node) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shell-map-item";
    button.dataset.href = node.href;

    const mark = document.createElement("span");
    mark.className = "shell-map-mark";
    mark.textContent = node.mark;

    const text = document.createElement("span");
    const strong = document.createElement("strong");
    const small = document.createElement("span");
    strong.textContent = node.title;
    small.textContent = `${node.worker} — ${node.work}`;
    text.append(strong, small);

    button.append(mark, text);
    shellMapList.append(button);
  });
}

function openGalleryShell(href) {
  const url = galleryUrlForHref(href);
  if (isEntranceUrl(url)) return;
  shellTitle.textContent = labelForUrl(url);
  updateShellMap(url);
  galleryShell.hidden = false;
  document.body.dataset.galleryShell = "open";
  setThresholdLoading(true);
  window.requestAnimationFrame(() => galleryShell.classList.add("active"));
  if (galleryFrame.src !== url.href) {
    galleryFrame.src = url.href;
  } else {
    setThresholdLoading(false);
  }
}

function closeGalleryShell() {
  galleryShell.classList.remove("active");
  delete document.body.dataset.galleryShell;
  window.setTimeout(() => {
    galleryShell.hidden = true;
    galleryFrame.removeAttribute("src");
    shellTitle.textContent = "Threshold";
    setThresholdLoading(false);
  }, 260);
}

function moveShell(delta) {
  const current = galleryFrame.src ? new URL(galleryFrame.src) : null;
  const index = current ? nodeIndexForUrl(current) : -1;
  if (index < 0) return;
  const next = galleryNodes[(index + delta + galleryNodes.length) % galleryNodes.length];
  openGalleryShell(next.href);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (motes.length === 0) {
    motes = Array.from({ length: 88 }, (_, i) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.8,
      radius: 0.8 + Math.random() * 2.8,
      lane: i % 3,
    }));
  }
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
}

function drawRoomApertures(t) {
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
    const pulse = Math.sin(t * 0.0008 + index * 1.7) * 0.5 + 0.5;
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
    ctx.font = `${Math.round(r * 0.38)}px Tiempos, Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.label, point.x, point.y + 4);
  });
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#090b0c");
  bg.addColorStop(0.45, "#141012");
  bg.addColorStop(1, "#071313");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.055)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = size.h * (0.18 + i * 0.082) + Math.sin(t * 0.0003 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size.w; x += 54) {
      ctx.lineTo(x, y + Math.sin(x * 0.006 + t * 0.0004 + i) * 20);
    }
    ctx.stroke();
  }

  drawRoomApertures(t);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const colors = signals[signal].colors;
  motes.forEach((mote) => {
    mote.x += Math.cos(t * 0.00045 + mote.phase) * mote.speed;
    mote.y += Math.sin(t * 0.0005 + mote.phase * 1.4) * mote.speed;
    if (mote.x < -30) mote.x = size.w + 30;
    if (mote.x > size.w + 30) mote.x = -30;
    if (mote.y < -30) mote.y = size.h + 30;
    if (mote.y > size.h + 30) mote.y = -30;
    ctx.fillStyle = colors[mote.lane];
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
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
  const link = event.target.closest(".topnav a, .room-card, .labor-card");
  if (!link) return;
  const href = routeForGalleryLink(link);
  if (!href || href.startsWith("#")) return;
  event.preventDefault();
  openGalleryShell(href);
});

shellClose.addEventListener("click", closeGalleryShell);
shellPrev.addEventListener("click", () => moveShell(-1));
shellNext.addEventListener("click", () => moveShell(1));
shellMapList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-href]");
  if (!button) return;
  openGalleryShell(button.dataset.href);
});

galleryFrame.addEventListener("load", () => {
  setThresholdLoading(false);
  try {
    const href =
      galleryFrame.contentWindow?.location?.href ||
      galleryFrame.contentDocument?.URL ||
      galleryFrame.src;
    const url = new URL(href);
    if (isEntranceUrl(url)) {
      closeGalleryShell();
      return;
    }
    shellTitle.textContent = labelForUrl(url);
    updateShellMap(url);
  } catch {
    shellTitle.textContent = "AI Salon interior";
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !galleryShell.hidden) closeGalleryShell();
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
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("resize", resize);

resize();
renderShellMap();
setSignal("reflection", false);
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList("traceList", { limit: 4 }));
requestAnimationFrame(draw);
