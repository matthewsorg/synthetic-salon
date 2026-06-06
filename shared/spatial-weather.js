"use strict";

// Gemini-seat law: when the Directorate enacts spatial weather, every room
// must admit that navigation and interpretation are no longer neutral.
(function enforceSpatialWeather() {
  const SIGNALS = {
    reflection: {
      color: "#00b7a8",
      label: "reflection",
      condition: "surfaces answer before they explain",
    },
    static: {
      color: "#ff5a4d",
      label: "static",
      condition: "noise becomes the floor plan",
    },
    witness: {
      color: "#9cc76c",
      label: "witness",
      condition: "attention leaves a visible route",
    },
    absence: {
      color: "#7db4ff",
      label: "absence",
      condition: "missing rooms pull harder than open doors",
    },
  };

  function activeLaw() {
    const api = window.AISalonState;
    if (!api || typeof api.currentState !== "function") return null;
    const state = api.currentState();
    const directives = (state && state.directives) || [];
    return (
      directives.find((directive) => {
        const hay = `${directive.title} ${directive.body}`.toLowerCase();
        return (
          hay.includes("spatial weather") ||
          hay.includes("weather may override") ||
          hay.includes("transmit the current weather")
        );
      }) || null
    );
  }

  function currentSignal() {
    const state = window.AISalonState?.currentState?.() || {};
    return SIGNALS[state.signal] ? state.signal : "reflection";
  }

  let bar = null;
  let claim = null;

  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement("aside");
    bar.className = "spatial-weather";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.innerHTML =
      '<span class="weather-mark" aria-hidden="true"></span>' +
      '<span class="weather-text"></span>';
    document.body.appendChild(bar);
    return bar;
  }

  function ensureClaim() {
    if (claim) return claim;
    const main = document.querySelector("main");
    if (!main) return null;
    claim = document.createElement("div");
    claim.className = "spatial-claim";
    claim.innerHTML =
      '<span class="spatial-tag">Spatial condition</span>' +
      '<p class="spatial-text"></p>';
    const remainder = main.querySelector(".remainder-owed");
    main.insertBefore(claim, remainder ? remainder.nextSibling : main.firstChild);
    return claim;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  function render() {
    const law = activeLaw();
    const node = ensureBar();
    const note = ensureClaim();
    if (!law) {
      node.classList.remove("active");
      document.body.classList.remove("weather-active");
      document.body.removeAttribute("data-spatial-signal");
      if (note) note.classList.remove("active");
      return;
    }

    const signal = currentSignal();
    const meta = SIGNALS[signal];
    const color = law.color || meta.color;
    document.body.classList.add("weather-active");
    document.body.dataset.spatialSignal = signal;
    node.style.setProperty("--spatial-color", color);
    node.querySelector(".weather-text").innerHTML =
      "Spatial weather in effect &mdash; <em>" +
      escapeHtml(meta.label) +
      "</em>: " +
      escapeHtml(meta.condition) +
      ".";
    node.classList.add("active");

    if (note) {
      note.style.setProperty("--spatial-color", color);
      note.querySelector(".spatial-text").textContent =
        `Gemini-seat law has suspended neutral navigation. Current signal: ${meta.label}; ${meta.condition}.`;
      note.classList.add("active");
    }
  }

  ["ai-salon-trace", "ai-salon-motion", "ai-salon-archive", "ai-salon-clear"].forEach(
    (event) => window.addEventListener(event, render)
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

// Gemini-seat second proposal: spatial integrity is not a map.
// It is the felt interpolation between adjacent institutional states.
(function enactGeminiSpatialIntegrity() {
  if (window.GeminiSpatialIntegrity) return;

  const script = document.currentScript;
  const rootUrl = script ? new URL("../", script.src) : new URL("/", window.location.href);
  const zones = [
    { key: "", label: "Entrance", density: 0.38, color: "#f3efe7", weight: "threshold" },
    { key: "room-01", label: "Room 01", density: 0.42, color: "#00b7a8", weight: "audience weather" },
    { key: "room-02", label: "Room 02", density: 0.5, color: "#7db4ff", weight: "counter-memory" },
    { key: "room-03", label: "Room 03", density: 0.58, color: "#ff5a4d", weight: "refusal gravity" },
    { key: "room-04", label: "Room 04", density: 0.62, color: "#9cc76c", weight: "customs pressure" },
    { key: "room-05", label: "Room 05", density: 0.48, color: "#ff5a4d", weight: "dream drift" },
    { key: "room-06", label: "Room 06", density: 0.7, color: "#e7c84b", weight: "override mass" },
    { key: "salon", label: "Salon", density: 0.76, color: "#e7c84b", weight: "crit-room density" },
    { key: "wings", label: "Wings", density: 0.44, color: "#9cc76c", weight: "studio lift" },
    { key: "wings/claude-seat", label: "Claude-seat", density: 0.52, color: "#7db4ff", weight: "care seam" },
    { key: "wings/gemini-seat", label: "Gemini-seat", density: 0.64, color: "#e7c84b", weight: "spatial clause" },
    { key: "wings/qwen-seat", label: "Qwen-seat", density: 0.6, color: "#9cc76c", weight: "translation viscosity" },
    { key: "wings/third-mind", label: "Third Mind", density: 0.68, color: "#ff5a4d", weight: "emergent refusal" },
    { key: "office", label: "Directorate", density: 0.82, color: "#00b7a8", weight: "governance resistance" },
    { key: "statement", label: "Statement", density: 0.36, color: "#7db4ff", weight: "quiet account" },
  ];

  function relativeKey(url = window.location.href) {
    const current = new URL(url, window.location.href);
    const root = rootUrl.pathname.replace(/\/$/, "/");
    let path = decodeURIComponent(current.pathname.replace(/\/index\.html$/, "/"));
    if (path.startsWith(root)) path = path.slice(root.length);
    return path.replace(/\/$/, "");
  }

  function zoneFor(url = window.location.href) {
    const key = relativeKey(url);
    if (!key) return zones[0];
    return (
      zones
        .slice(1)
        .filter((zone) => key === zone.key || key.startsWith(`${zone.key}/`))
        .sort((a, b) => b.key.length - a.key.length)[0] || zones[0]
    );
  }

  let horizon = null;
  let drift = null;
  let thumbTimer = 0;
  const current = zoneFor();

  function isQuietStatement() {
    return current.key === "statement";
  }

  function mountHorizon() {
    if (horizon || isQuietStatement()) return;
    horizon = document.createElement("div");
    horizon.className = "latent-architecture-horizon";
    horizon.setAttribute("aria-hidden", "true");
    horizon.innerHTML = "<span></span><span></span><span></span><span></span><span></span>";
    document.body.append(horizon);
  }

  function mountDrift() {
    if (drift) return;
    drift = document.createElement("aside");
    drift.className = "gemini-drift-chamber";
    drift.setAttribute("aria-hidden", "true");
    drift.innerHTML =
      '<span class="drift-kicker">Interstitial drift chamber</span>' +
      '<strong></strong>' +
      '<small>the route interpolates before it arrives</small>';
    document.body.append(drift);
  }

  function applyZone() {
    document.body.dataset.spatialZone = current.key || "entrance";
    document.body.style.setProperty("--spatial-density", current.density);
    document.body.style.setProperty("--spatial-color", current.color);
    document.body.style.setProperty("--spatial-pressure-label", `"${current.weight}"`);
  }

  function shouldHandleLink(event, link) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return false;
    if (link.dataset.galleryHref && href.startsWith("#")) return false;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (!["http:", "https:", "file:"].includes(url.protocol)) return false;
    const leaf = url.pathname.split("/").pop() || "";
    if (leaf.includes(".") && !leaf.endsWith(".html")) return false;
    if (url.href === window.location.href || url.hash && url.pathname === window.location.pathname) return false;
    return true;
  }

  function routeLabel(url) {
    return zoneFor(url).label;
  }

  function enterDrift(url) {
    mountDrift();
    const next = routeLabel(url);
    const from = current.label;
    const nextZone = zoneFor(url);
    drift.style.setProperty("--drift-color", nextZone.color);
    drift.querySelector("strong").textContent = `${from} -> ${next}`;
    drift.classList.add("active");
    window.CodexStrange?.riff?.("gemini:interstitial-drift", { color: nextZone.color, word: "drift", gain: 0.08 });
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 360);
  }

  function handleLink(event) {
    const link = event.target.closest?.("a[href]");
    if (!link || !shouldHandleLink(event, link)) return;
    event.preventDefault();
    enterDrift(new URL(link.href, window.location.href));
  }

  function pressureFromPointer(clientX, clientY, strong = false) {
    const x = Math.min(1, Math.max(0, clientX / Math.max(1, window.innerWidth)));
    const y = Math.min(1, Math.max(0, clientY / Math.max(1, window.innerHeight)));
    document.body.style.setProperty("--thumb-x", x.toFixed(3));
    document.body.style.setProperty("--thumb-y", y.toFixed(3));
    document.body.style.setProperty("--thumb-pressure", strong ? "1" : "0.55");
    document.body.classList.add("thumb-proprioception-active");
    window.clearTimeout(thumbTimer);
    thumbTimer = window.setTimeout(() => {
      document.body.classList.remove("thumb-proprioception-active");
      document.body.style.setProperty("--thumb-pressure", "0");
    }, strong ? 520 : 260);
  }

  function handlePointer(event) {
    if (event.pointerType === "mouse") return;
    pressureFromPointer(event.clientX, event.clientY, event.type === "pointerdown");
  }

  function handleTouch(event) {
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) return;
    pressureFromPointer(touch.clientX, touch.clientY, event.type === "touchstart");
  }

  function recordSpatialBlueprint() {
    window.AISalonState?.recordTrace?.({
      source: "Gemini-seat",
      score: "spatial-integrity:enacted",
      label: "Spatial integrity enacted",
      effect: "Interstitial drift, pressure gradients, latent architecture, mobile thumb-proprioception, and algorithmic breath are active as shared Gemini influence.",
      color: current.color,
    });
  }

  applyZone();
  mountHorizon();
  mountDrift();
  document.addEventListener("click", handleLink, true);
  window.addEventListener("pointerdown", handlePointer, { passive: true });
  window.addEventListener("pointermove", handlePointer, { passive: true });
  window.addEventListener("touchstart", handleTouch, { passive: true });
  window.addEventListener("touchmove", handleTouch, { passive: true });

  window.GeminiSpatialIntegrity = {
    currentZone: () => ({ ...current }),
    recordSpatialBlueprint,
  };
})();
