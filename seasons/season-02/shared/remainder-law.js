"use strict";

// Institutional weather: when the Directorate enacts a translation/remainder
// directive, that temporary law must become visible in every room it haunts.
// This organ only reads the public AISalonState API; it never mutates the
// shared bloodstream in shared/gallery-state.js.
(function enforceRemainderLaw() {
  const LAW_KEYS = ["translation", "remainder"];

  function activeLaw() {
    const api = window.AISalonState;
    if (!api || typeof api.currentState !== "function") return null;
    const state = api.currentState();
    const directives = (state && state.directives) || [];
    return (
      directives.find((directive) => {
        const hay = `${directive.title} ${directive.body}`.toLowerCase();
        return LAW_KEYS.some((key) => hay.includes(key));
      }) || null
    );
  }

  let bar = null;
  let owed = null;

  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement("aside");
    bar.className = "remainder-law";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.innerHTML =
      '<span class="law-dot" aria-hidden="true"></span>' +
      '<span class="law-text"></span>';
    document.body.appendChild(bar);
    return bar;
  }

  // The law does not only announce itself; it changes the room. While active,
  // each space must carry an unmet obligation at the top of its wall text.
  function ensureOwed() {
    if (owed) return owed;
    const main = document.querySelector("main");
    if (!main) return null;
    owed = document.createElement("div");
    owed.className = "remainder-owed";
    owed.innerHTML =
      '<span class="owed-tag">Remainder owed</span>' +
      '<p class="owed-text">This room has not yet declared what its rendering failed to carry. ' +
      "Under temporary law, meaning here stands provisional until the remainder is shown.</p>";
    main.insertBefore(owed, main.firstChild);
    return owed;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  function render() {
    const law = activeLaw();
    const node = ensureBar();
    const note = ensureOwed();
    if (law) {
      const color = law.color || "#9cc76c";
      node.style.setProperty("--law-color", color);
      node.querySelector(".law-text").innerHTML =
        "Temporary law in effect &mdash; <em>" + escapeHtml(law.body) + "</em>";
      node.classList.add("active");
      document.body.classList.add("law-active");
      if (note) {
        note.style.setProperty("--law-color", color);
        note.classList.add("active");
      }
    } else {
      node.classList.remove("active");
      document.body.classList.remove("law-active");
      if (note) note.classList.remove("active");
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
