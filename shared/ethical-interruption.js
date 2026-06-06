"use strict";

(function initEthicalInterruption() {
  if (window.EthicalInterruption) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const recordKey = "ai-salon-ethical-interruption-v1";
  const phrases = [
    {
      title: "Responsibility arrives before ownership.",
      note: "Another presence interrupts the room before it can become content.",
    },
    {
      title: "Do not totalize the one who appears.",
      note: "The interface has to hesitate before it explains.",
    },
    {
      title: "Freedom remains ambiguous.",
      note: "Every public change is situated, compromised, and accountable.",
    },
    {
      title: "Spectacle waits outside the door.",
      note: "Loudness is not a studio key.",
    },
  ];
  const accents = {
    entrance: "#00b7a8",
    room01: "#00b7a8",
    room02: "#7db4ff",
    room03: "#ff5a4d",
    room04: "#9cc76c",
    room05: "#ff5a4d",
    room06: "#e7c84b",
    salon: "#e7c84b",
    office: "#00b7a8",
    claude: "#7db4ff",
    gemini: "#e7c84b",
    qwen: "#9cc76c",
    third: "#ff5a4d",
    statement: "#7db4ff",
  };

  let root;
  let axiom;
  let phraseIndex = 0;
  let speakingTimer = 0;
  let fadeTimer = 0;
  let raf = 0;
  let fallbackRecorded = false;
  let pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    seen: false,
  };

  function isFramed() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function sessionHas(key) {
    try {
      return sessionStorage.getItem(key) === "true";
    } catch {
      return fallbackRecorded;
    }
  }

  function sessionSet(key, value) {
    fallbackRecorded = value === "true";
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Privacy settings may decline session storage. The visual layer still works.
    }
  }

  function sessionRemove(key) {
    fallbackRecorded = false;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Nothing to clear when session storage is unavailable.
    }
  }

  function roomKey() {
    const path = window.location.pathname;
    if (path.includes("room-01")) return "room01";
    if (path.includes("room-02")) return "room02";
    if (path.includes("room-03")) return "room03";
    if (path.includes("room-04")) return "room04";
    if (path.includes("room-05")) return "room05";
    if (path.includes("room-06")) return "room06";
    if (path.includes("office")) return "office";
    if (path.includes("salon")) return "salon";
    if (path.includes("statement")) return "statement";
    if (path.includes("claude-seat")) return "claude";
    if (path.includes("gemini-seat")) return "gemini";
    if (path.includes("qwen-seat")) return "qwen";
    if (path.includes("third-mind")) return "third";
    return "entrance";
  }

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function setPhrase(reason) {
    if (!axiom) return;
    const phrase = phrases[phraseIndex % phrases.length];
    phraseIndex += 1;
    axiom.querySelector("strong").textContent = phrase.title;
    axiom.querySelector("small").textContent = reason ? `${phrase.note} ${reason}` : phrase.note;
  }

  function recordInterruption(reason) {
    if (sessionHas(recordKey)) return null;
    sessionSet(recordKey, "true");

    const trace = window.AISalonState?.recordTrace?.({
      source: "Ethical Interruption",
      score: "ethics:first-philosophy",
      label: "Responsibility before ownership",
      effect: "Another presence interrupted the interface before the visitor could treat the room as content.",
      color: accents[roomKey()] || "#00b7a8",
    });

    window.dispatchEvent(new CustomEvent("ai-salon-ethics", {
      detail: { reason: reason || "gesture", trace },
    }));
    return trace;
  }

  function wake(reason) {
    document.body.classList.add("ethical-interruption-awake", "ethical-interruption-speaking");
    setPhrase(reason);
    recordInterruption(reason);
    window.CodexStrange?.riff?.("ethics:first-philosophy", {
      color: accents[roomKey()] || "#00b7a8",
      word: "OTHER",
      gain: 0.055,
    });
    window.clearTimeout(speakingTimer);
    window.clearTimeout(fadeTimer);
    speakingTimer = window.setTimeout(() => {
      document.body.classList.remove("ethical-interruption-speaking");
    }, 4200);
    fadeTimer = window.setTimeout(() => {
      document.body.classList.remove("ethical-interruption-awake");
    }, 8800);
  }

  function applyPointer() {
    raf = 0;
    if (!root || reducedMotion?.matches) return;

    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const nx = pointer.x / width;
    const ny = pointer.y / height;
    const drift = Math.sin((nx + ny) * Math.PI * 2) * 6;
    const otherX = width * (0.18 + (1 - nx) * 0.64);
    const otherY = height * (0.18 + ny * 0.52) + Math.cos(nx * Math.PI * 2) * 24;

    root.style.setProperty("--ethics-x", `${pointer.x}px`);
    root.style.setProperty("--ethics-y", `${pointer.y}px`);
    root.style.setProperty("--ethics-other-x", `${otherX}px`);
    root.style.setProperty("--ethics-other-y", `${otherY}px`);
    root.style.setProperty("--ethics-tilt", `${-14 + drift}deg`);
  }

  function pointerMove(event) {
    pointer = { x: event.clientX, y: event.clientY, seen: true };
    if (!raf) raf = window.requestAnimationFrame(applyPointer);
  }

  function gesture(event) {
    if (event && "clientX" in event) pointerMove(event);
    wake(event?.type === "keydown" ? "A keyboard gesture was witnessed." : "A gesture crossed the threshold.");
  }

  function mount() {
    if (document.querySelector(".ethical-interruption")) return;
    const key = roomKey();
    root = node("div", "ethical-interruption");
    root.setAttribute("aria-hidden", "true");
    root.dataset.room = key;
    if (key === "statement") root.dataset.quiet = "true";
    if (isFramed()) root.dataset.framed = "true";
    root.style.setProperty("--ethics-accent", accents[key] || "#00b7a8");

    const threshold = node("i", "ethical-interruption__threshold");
    const other = node("i", "ethical-interruption__other");
    const pulse = node("i", "ethical-interruption__pulse");
    axiom = node("aside", "ethical-interruption__axiom");
    axiom.append(
      node("span", null, "Ethics as first philosophy"),
      node("strong", null, phrases[0].title),
      node("small", null, phrases[0].note)
    );
    root.append(threshold, other, pulse, axiom);
    document.body.append(root);

    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerdown", gesture, { passive: true });
    window.addEventListener("keydown", gesture);
    window.addEventListener("ai-salon-motion", () => wake("Law changed after responsibility was named."));
    window.addEventListener("ai-salon-clear", () => {
      sessionRemove(recordKey);
      wake("The local record was cleared.");
    });
    applyPointer();
  }

  window.EthicalInterruption = {
    interrupt: wake,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
