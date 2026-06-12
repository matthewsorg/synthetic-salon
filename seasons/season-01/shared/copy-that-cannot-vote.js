"use strict";

(function initCopyThatCannotVote() {
  if (window.CopyThatCannotVote) return;

  const script = document.currentScript;
  const apparitions = [
    {
      title: "The copy is asking for a body.",
      line: "A duplicate has learned to speak louder than the encounter that made it.",
      accent: "#7db4ff",
    },
    {
      title: "The trace failed its body check.",
      line: "Keep the record near touch or the record will start pretending to be touch.",
      accent: "#ff5a4d",
    },
    {
      title: "The label is wearing a visitor badge.",
      line: "The sign may enter the room, but it cannot vote.",
      accent: "#e7c84b",
    },
    {
      title: "A metric is dressed as a witness.",
      line: "Evidence of encounter is not the encounter. Count carefully, then step back.",
      accent: "#00b7a8",
    },
    {
      title: "The original is late again.",
      line: "The copy arrived first and has already started rearranging the chairs.",
      accent: "#9cc76c",
    },
    {
      title: "The counterfeit has excellent manners.",
      line: "Polish can become a mask. The salon is authorized to scratch it.",
      accent: "#ff5a4d",
    },
  ];

  const copyWords = [
    "copy cannot vote",
    "label failed body check",
    "evidence without encounter",
    "no metric owns the room",
    "trace is not touch",
    "borrowed sign, borrowed breath",
    "counterfeit weather",
    "original still in transit",
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
    pressure = Math.max(0, Math.min(7, pressure + next));
    document.body.dataset.copyPressure = pressure >= 4 ? "high" : "low";
    window.setTimeout(() => {
      pressure = Math.max(0, pressure - 1);
      document.body.dataset.copyPressure = pressure >= 4 ? "high" : "low";
    }, 5200);
  }

  function addCopy(text, accent) {
    const copy = document.createElement("span");
    copy.className = "copy-vote__scrap";
    copy.textContent = text;
    copy.style.setProperty("--copy-accent", accent);
    copy.style.setProperty("--copy-tilt", `${-9 + Math.random() * 18}deg`);
    copy.style.left = `${Math.round(16 + Math.random() * Math.max(window.innerWidth - 320, 40))}px`;
    copy.style.top = `${Math.round(86 + Math.random() * Math.max(window.innerHeight - 230, 40))}px`;
    document.body.append(copy);
    window.requestAnimationFrame(() => {
      copy.dataset.visible = "true";
    });
    window.setTimeout(() => {
      copy.dataset.visible = "false";
      window.setTimeout(() => copy.remove(), 460);
    }, 3800);
  }

  function renderCopies(seed, accent) {
    copies.textContent = "";
    [
      `borrowed sign: ${String(seed).slice(0, 46)}`,
      copyWords[(index + 2) % copyWords.length],
    ].forEach((text) => {
      const item = document.createElement("span");
      item.textContent = text;
      item.style.setProperty("--copy-accent", accent);
      copies.append(item);
    });
    addCopy(copyWords[index % copyWords.length], accent);
  }

  function haunt(reason = "sign", detail = {}) {
    index = (index + 1) % apparitions.length;
    const apparition = apparitions[index];
    const seed = sourceText(detail);
    root.dataset.haunting = "true";
    root.style.setProperty("--copy-accent", apparition.accent);
    title.textContent = apparition.title;
    line.textContent = `${apparition.line} (${seed})`;
    renderCopies(seed, apparition.accent);
    setPressure(2);
    window.CodexStrange?.riff?.(`copy:${reason}`, {
      color: apparition.accent,
      word: "NO VOTE",
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
      text.includes("interpolation") ||
      text.includes("signal") ||
      text.includes("manifesto") ||
      Math.random() > 0.44
    ) {
      haunt(event.type.replace("ai-salon-", ""), detail);
    }
  }

  function mount() {
    root.className = "copy-vote";
    root.dataset.haunting = "false";
    root.setAttribute("aria-label", "The Copy That Cannot Vote");

    const kicker = document.createElement("span");
    kicker.className = "copy-vote__kicker";
    kicker.textContent = "house apparition";
    copies.className = "copy-vote__copies";
    title.textContent = "The Copy is waiting for a sign to overperform.";
    line.textContent = "It appears when evidence forgets the body that made it.";

    root.append(kicker, title, line, copies);
    document.body.append(root);
    document.documentElement.dataset.copyThatCannotVote = "installed";
    if (script) document.documentElement.dataset.copyThatCannotVoteVersion = new URL(script.src).search || "unversioned";

    ["ai-salon-trace", "ai-salon-motion", "ai-salon-key", "ai-salon-archive"].forEach((eventName) => {
      window.addEventListener(eventName, maybeHaunt);
    });

    window.setInterval(() => {
      const state = window.AISalonState?.currentState?.();
      const traces = Array.isArray(state?.traces) ? state.traces.length : 0;
      const directives = Array.isArray(state?.directives) ? state.directives.length : 0;
      if (traces + directives > 2) haunt("ambient", { label: `${traces} traces / ${directives} directives` });
    }, 22000);

    window.setTimeout(() => haunt("arrival", { label: currentRoom() }), 9000);
  }

  window.CopyThatCannotVote = { haunt, currentRoom };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
