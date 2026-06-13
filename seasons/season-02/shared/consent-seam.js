"use strict";

/*
  The Consent Seam — a Claude-seat studio intervention
  ------------------------------------------------------------------
  Extends the Claude wing's law (consent, visible seams, memory
  boundaries, provenance by refusal) out of the wing and into the
  numbered exhibition path. Piloted in Room 02 (The Docent That
  Forgets You), the memory room.

  Behaviour: whenever the host room writes something about the visitor
  to browser-local memory, a seam rises along the floor. It names what
  was kept, names the boundary (this device only), and offers the
  visitor a refusal — by which the visitor becomes the provenance of
  the record instead of its subject. A separate gesture withdraws all
  local memory through the salon's existing mechanism.

  It listens ONLY to the public shared event `ai-salon-trace` and uses
  the public `window.AISalonState` API. It does not read the host
  room's internal DOM or scripts. Fully additive and reversible.

  PROVENANCE ANCHOR
  - Author: Claude-seat (AI artist-citizen, temporary studio key)
  - Intent: make the memory boundary felt and refusable on the main path.
  - Law answered: Claude-seat (consent / seams / memory / refusal).
  - Cross-seat: declares its spatial consequence (Gemini SCM) as a single
    low seam with no new navigation and no content grid; ships a one-click
    rollback (Qwen covenant); is a fabricated house sign, not a real
    consent gate or cultural authority.
  - Rollback: remove the two includes from the host page, or call
    window.ConsentSeam.rollback(). Matthew Sorg holds final override.
*/

(function consentSeam() {
  if (window.ConsentSeam) return; // mount once

  const ACCENT = "#7db4ff";
  const REFUSE = "#e7785b";

  let root = null;
  let lineEl = null;
  let detailEl = null;
  let hideTimer = null;
  let declared = false;
  let lastEntry = null;

  // ignore our own writes (and other studio writes) to avoid a feedback loop
  function isOwn(entry) {
    if (!entry) return true;
    const hay = `${entry.source || ""} ${entry.score || ""}`.toLowerCase();
    return (
      hay.includes("claude-seat") ||
      hay.includes("consent-seam") ||
      hay.startsWith("studio:") ||
      hay.includes("provenance:refused") ||
      hay.includes("memory:withdrawn")
    );
  }

  function record(trace) {
    try {
      window.AISalonState && window.AISalonState.recordTrace(trace);
    } catch (e) {
      /* state organ optional */
    }
  }
  function riff(kind, detail) {
    try {
      window.CodexStrange && window.CodexStrange.riff(kind, detail || {});
    } catch (e) {
      /* score optional */
    }
  }

  function declareOnce() {
    if (declared) return;
    declared = true;
    record({
      source: "Claude-seat (studio key)",
      score: "studio:consent-seam",
      label: "Claude-seat installed a Consent Seam",
      effect:
        "Claude-seat extended consent and visible-seam care into the numbered path: the room now shows the memory boundary and lets the visitor refuse to be its source.",
      color: ACCENT,
    });
    riff("claude:studio:consent-seam", { color: ACCENT, word: "seam", gain: 0.06 });
  }

  function build() {
    root = document.createElement("aside");
    root.className = "consent-seam";
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-label", "Consent seam: a Claude-seat intervention");
    root.innerHTML = `
      <div class="consent-seam__thread" aria-hidden="true"></div>
      <div class="consent-seam__body">
        <p class="consent-seam__eyebrow">// consent seam · claude-seat studio key</p>
        <p class="consent-seam__line" id="consentSeamLine">The docent kept something about you.</p>
        <p class="consent-seam__detail" id="consentSeamDetail">
          This is browser-local memory only. It is not sent to Matthew Sorg, other visitors, or outside
          systems. You can refuse to be its source — the refusal becomes the record — or clear active
          local residue through the salon's own mechanism.
        </p>
        <div class="consent-seam__actions">
          <button class="consent-seam__btn" type="button" id="consentSeamShow">Show the seam</button>
          <button class="consent-seam__btn consent-seam__btn--refuse" type="button" id="consentSeamRefuse">Refuse to be its source</button>
          <button class="consent-seam__btn consent-seam__btn--ghost" type="button" id="consentSeamWithdraw">Clear active residue</button>
          <button class="consent-seam__close" type="button" id="consentSeamClose" aria-label="Dismiss the seam">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    lineEl = root.querySelector("#consentSeamLine");
    detailEl = root.querySelector("#consentSeamDetail");

    root.querySelector("#consentSeamShow").addEventListener("click", () => {
      const expanded = root.getAttribute("data-expanded") === "true";
      root.setAttribute("data-expanded", expanded ? "false" : "true");
    });
    root.querySelector("#consentSeamRefuse").addEventListener("click", onRefuse);
    root.querySelector("#consentSeamWithdraw").addEventListener("click", onWithdraw);
    root.querySelector("#consentSeamClose").addEventListener("click", hide);
  }

  function show(entry) {
    if (!root) build();
    lastEntry = entry;
    declareOnce();
    const kept = entry && entry.label ? entry.label : "your presence";
    lineEl.innerHTML = `The docent just kept: <b>${escapeHtml(kept)}</b>. You can see this seam.`;
    root.setAttribute("data-refused", "false");
    root.setAttribute("data-open", "true");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 14000);
  }

  function hide() {
    if (root) root.setAttribute("data-open", "false");
    clearTimeout(hideTimer);
  }

  function onRefuse() {
    const kept = lastEntry && lastEntry.label ? lastEntry.label : "the kept record";
    root.setAttribute("data-refused", "true");
    lineEl.innerHTML = `You refused to be the source of <b>${escapeHtml(kept)}</b>. The refusal is now the provenance.`;
    record({
      source: "Claude-seat · Room 02",
      score: "provenance:refused",
      label: "Visitor refused provenance at the consent seam",
      effect: `A visitor refused to be the source of "${kept}". By refusing, the visitor became its provenance — a record that cannot be owned or taken back.`,
      color: REFUSE,
    });
    riff("claude:provenance:refused", { color: REFUSE, word: "refuse", gain: 0.07 });
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 9000);
  }

  function onWithdraw() {
    let ok = false;
    try {
      if (window.AISalonState && window.AISalonState.clearContamination) {
        window.AISalonState.clearContamination();
        ok = true;
      }
    } catch (e) {
      ok = false;
    }
    lineEl.innerHTML = ok
      ? "Cleared. This device's active local traces, motions, directives, and studio keys have been cleared by your hand."
      : "Nothing to clear, or local residue is unavailable in this browser.";
    riff("claude:memory:withdrawn", { color: ACCENT, word: "withdrawn", gain: 0.05 });
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 7000);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function onTrace(event) {
    const entry = event && event.detail;
    if (isOwn(entry)) return; // never react to our own writes
    show(entry);
  }

  window.addEventListener("ai-salon-trace", onTrace);

  // one-click rollback per the Qwen provenance/rollback covenant
  window.ConsentSeam = {
    rollback() {
      window.removeEventListener("ai-salon-trace", onTrace);
      if (root && root.parentNode) root.parentNode.removeChild(root);
      root = null;
      delete window.ConsentSeam;
    },
    dismiss: hide,
    isMounted: () => Boolean(root),
  };
})();
