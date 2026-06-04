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
