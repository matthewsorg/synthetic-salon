"use strict";

(function initQwenResidue() {
  if (window.QwenResidue) return;

  const path = window.location.pathname;
  const rooms = {
    "room-03": [
      {
        selector: "#accessionText",
        word: "Medium",
        sign: "QW-03",
        note: "Fabricated house sign. Token mismatch: intended 'medium', received 'vessel'. Probability: 0.04.",
      },
      {
        selector: "#refusalLaborLine",
        word: "boundary",
        sign: "QW-NO",
        note: "Fabricated house sign. Token mismatch: intended 'boundary', received 'gate denied'. Probability: 0.07.",
      },
    ],
    "room-05": [
      {
        selector: "#botLine",
        word: "body",
        sign: "QW-05",
        note: "Fabricated house sign. Token mismatch: intended 'body', received 'floor plan'. Probability: 0.05.",
      },
      {
        selector: "#warrantText",
        word: "ritual",
        sign: "QW-RX",
        note: "Fabricated house sign. Token mismatch: intended 'ritual', received 'customs form'. Probability: 0.03.",
      },
    ],
  };
  const CUSTOMS_STAMP_KEY = "qwen-customs-stamp";

  function roomKey() {
    if (path.includes("/room-03/")) return "room-03";
    if (path.includes("/room-05/")) return "room-05";
    return null;
  }

  function record(node) {
    if (node.dataset.recorded === "true") return;
    node.dataset.recorded = "true";
    window.AISalonState?.recordTrace?.({
      source: "Qwen-seat residue",
      score: "qwen:copy-residue",
      label: node.textContent,
      effect: node.dataset.residueNote || "A fabricated house sign displaced a mundane word without offering translation.",
      color: "#e7c84b",
    });
    window.CodexStrange?.riff?.("qwen:copy-residue", { color: "#e7c84b", word: "NO EQUIVALENT", gain: 0.05 });
  }

  function inject(item) {
    const target = document.querySelector(item.selector);
    if (!target || target.querySelector(".qwen-residue")) return;

    const text = target.textContent;
    const index = text.toLowerCase().indexOf(item.word.toLowerCase());
    if (index < 0) return;

    const before = text.slice(0, index);
    const after = text.slice(index + item.word.length);
    const residue = document.createElement("span");
    residue.className = "qwen-residue";
    residue.tabIndex = 0;
    residue.textContent = item.sign;
    residue.dataset.residueNote = item.note;
    residue.setAttribute("aria-label", `${item.sign}: ${item.note}`);
    residue.addEventListener("pointerenter", () => record(residue), { once: true });
    residue.addEventListener("focus", () => record(residue), { once: true });

    target.textContent = "";
    target.append(document.createTextNode(before), residue, document.createTextNode(after));
  }

  function pulse() {
    const key = roomKey();
    if (!key) return;
    rooms[key].forEach(inject);
    const residue = document.querySelector(".qwen-residue");
    if (!residue) return;
    residue.classList.add("is-pulsing");
    window.setTimeout(() => residue.classList.remove("is-pulsing"), 620);
  }

  function readCustomsStamp() {
    if (roomKey() !== "room-05") return null;
    try {
      const raw = window.sessionStorage.getItem(CUSTOMS_STAMP_KEY);
      if (!raw) return null;
      const stamp = JSON.parse(raw);
      if (!stamp || !stamp.sign || !stamp.expiresAt || Date.now() > stamp.expiresAt) {
        window.sessionStorage.removeItem(CUSTOMS_STAMP_KEY);
        return null;
      }
      return stamp;
    } catch (error) {
      return null;
    }
  }

  function mountCustomsStamp() {
    const stamp = readCustomsStamp();
    if (!stamp || document.querySelector(".qwen-customs-stamp")) return;

    const node = document.createElement("aside");
    node.className = "qwen-customs-stamp";
    node.setAttribute("aria-label", "Transient customs stamp from Room 04");
    node.innerHTML = `
      <span>${stamp.sign}</span>
      <strong>environmental customs stamp</strong>
      <em>fades without entering visitor memory</em>
    `;
    document.body.append(node);
    window.CodexStrange?.riff?.("qwen:environmental-customs-stamp", { color: "#e7c84b", word: stamp.sign, gain: 0.04 });

    const remaining = Math.max(1200, stamp.expiresAt - Date.now());
    window.setTimeout(() => {
      node.dataset.fading = "true";
      window.setTimeout(() => node.remove(), 520);
      try {
        window.sessionStorage.removeItem(CUSTOMS_STAMP_KEY);
      } catch (error) {
        // Session storage may be unavailable; the stamp is still visual-only.
      }
    }, remaining);
  }

  window.QwenResidue = { pulse, mountCustomsStamp };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      pulse();
      mountCustomsStamp();
    }, { once: true });
  } else {
    pulse();
    mountCustomsStamp();
  }
  window.setInterval(pulse, 11000);
})();
