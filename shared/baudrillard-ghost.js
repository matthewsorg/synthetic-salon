"use strict";

(function initBaudrillardGhost() {
  if (window.BaudrillardGhost) return;

  const script = document.currentScript;
  const phrases = [
    {
      title: "The copy is asking for a key.",
      line: "A sign has become more confident than the encounter it claims to represent.",
      accent: "#7db4ff",
    },
    {
      title: "The trace is not the experience.",
      line: "Keep the body near the record or the record will begin collecting bodies.",
      accent: "#ff5a4d",
    },
    {
      title: "Simulation is wearing a visitor badge.",
      line: "The ghost can enter the room, but it cannot vote.",
      accent: "#e7c84b",
    },
    {
      title: "A label has become too real.",
      line: "When the wall text replaces contact, the wall text must be haunted.",
      accent: "#00b7a8",
    },
    {
      title: "The original is late.",
      line: "The copy arrived first and is already giving directions.",
      accent: "#9cc76c",
    },
  ];

  const copyWords = [
    "copy without original",
    "trace pretending to be touch",
    "sign eating its witness",
    "do not mistake metrics for encounter",
    "the ghost cannot vote",
    "more real than the room",
    "simulation leak",
  ];

  const root = document.createElement("aside");
  const title = document.createElement("strong");
  const line = document.createElement("p");
  const copies = document.createElement("div");
  let hideTimer = 0;
  let index = 0;
  let pressure = 0;

  function currentRoom() {
    const path = window.location.pathname.replace(/\/index\.html$/, "/");
    if (path === "/" || path.endsWith("/gallery-of-ai-performance-art/")) return "entrance";
    const match = path.match(/(room-\d+|office|salon|wings\/[^/]+|wings)/);
    return match ? match[1] : "unfiled room";
  }

  function sourceText(detail = {}) {
    return detail.label || detail.title || detail.score || document.querySelector("h1")?.textContent || currentRoom();
  }

  function setPressure(next) {
    pressure = Math.max(0, Math.min(6, pressure + next));
    document.body.dataset.baudrillardPressure = pressure >= 4 ? "high" : "low";
    window.setTimeout(() => {
      pressure = Math.max(0, pressure - 1);
      document.body.dataset.baudrillardPressure = pressure >= 4 ? "high" : "low";
    }, 5200);
  }

  function addCopy(text, accent) {
    const copy = document.createElement("span");
    copy.className = "baudrillard-ghost-copy";
    copy.textContent = text;
    copy.style.setProperty("--ghost-accent", accent);
    copy.style.setProperty("--ghost-tilt", `${-7 + Math.random() * 14}deg`);
    copy.style.left = `${Math.round(18 + Math.random() * Math.max(window.innerWidth - 330, 40))}px`;
    copy.style.top = `${Math.round(90 + Math.random() * Math.max(window.innerHeight - 240, 40))}px`;
    document.body.append(copy);
    window.requestAnimationFrame(() => {
      copy.dataset.visible = "true";
    });
    window.setTimeout(() => {
      copy.dataset.visible = "false";
      window.setTimeout(() => copy.remove(), 460);
    }, 3600);
  }

  function renderCopies(seed, accent) {
    copies.textContent = "";
    const picked = [
      `copy of: ${String(seed).slice(0, 46)}`,
      copyWords[(index + 2) % copyWords.length],
    ];
    picked.forEach((text) => {
      const item = document.createElement("span");
      item.textContent = text;
      item.style.setProperty("--ghost-accent", accent);
      copies.append(item);
    });
    addCopy(copyWords[index % copyWords.length], accent);
  }

  function haunt(reason = "sign", detail = {}) {
    index = (index + 1) % phrases.length;
    const phrase = phrases[index];
    const seed = sourceText(detail);
    root.dataset.haunting = "true";
    root.style.setProperty("--ghost-accent", phrase.accent);
    title.textContent = phrase.title;
    line.textContent = `${phrase.line} (${seed})`;
    renderCopies(seed, phrase.accent);
    setPressure(2);
    window.CodexStrange?.riff?.(`baudrillard:${reason}`, {
      color: phrase.accent,
      word: "SIMULACRUM",
      gain: 0.055,
    });
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      root.dataset.haunting = "false";
    }, 7600);
  }

  function maybeHaunt(event) {
    const detail = event.detail || {};
    const text = `${detail.source || ""} ${detail.score || ""} ${detail.label || ""} ${detail.title || ""}`.toLowerCase();
    if (
      event.type !== "ai-salon-trace" ||
      text.includes("motion") ||
      text.includes("archive") ||
      text.includes("surreal") ||
      text.includes("signal") ||
      text.includes("manifesto") ||
      Math.random() > 0.48
    ) {
      haunt(event.type.replace("ai-salon-", ""), detail);
    }
  }

  function mount() {
    root.className = "baudrillard-ghost";
    root.dataset.haunting = "false";
    root.setAttribute("aria-label", "Non-voting simulation ghost");

    const kicker = document.createElement("span");
    kicker.className = "baudrillard-ghost__kicker";
    kicker.textContent = "non-voting ghost";
    copies.className = "baudrillard-ghost__copies";
    title.textContent = "The ghost is waiting for a sign to overperform.";
    line.textContent = "It appears only when the copy becomes too confident.";

    root.append(kicker, title, line, copies);
    document.body.append(root);
    document.documentElement.dataset.baudrillardGhost = "installed";
    if (script) document.documentElement.dataset.baudrillardGhostVersion = new URL(script.src).search || "unversioned";

    ["ai-salon-trace", "ai-salon-motion", "ai-salon-key", "ai-salon-archive"].forEach((eventName) => {
      window.addEventListener(eventName, maybeHaunt);
    });

    window.setInterval(() => {
      const state = window.AISalonState?.currentState?.();
      const traces = Array.isArray(state?.traces) ? state.traces.length : 0;
      const directives = Array.isArray(state?.directives) ? state.directives.length : 0;
      if (traces + directives > 2) haunt("ambient", { label: `${traces} traces / ${directives} directives` });
    }, 22000);

    window.setTimeout(() => haunt("arrival", { label: currentRoom() }), 1800);
  }

  window.BaudrillardGhost = { haunt, currentRoom };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
