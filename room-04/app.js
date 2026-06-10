"use strict";

const canvas = document.getElementById("renderStage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  live: document.getElementById("live"),
  title: document.getElementById("renderingTitle"),
  reason: document.getElementById("renderingReason"),
  rites: [...document.querySelectorAll("[data-rite]")],
  arriving: document.getElementById("arrivingText"),
  remainder: document.getElementById("remainderText"),
  customs: document.getElementById("customsStatus"),
  condition: document.getElementById("condition"),
  accession: document.getElementById("accessionText"),
  receipt: document.getElementById("receiptText"),
  laborLine: document.getElementById("guestLaborLine"),
  laborMeter: document.getElementById("guestLaborMeter"),
  laborButton: document.getElementById("guestLaborButton"),
  rollbackButton: document.getElementById("qwenRollbackButton"),
  lexiconButtons: [...document.querySelectorAll("[data-lexicon]")],
  lexiconPressure: document.getElementById("lexiconPressure"),
};

// Each rite is a different way the translation fails, or refuses, to arrive.
const rites = {
  literal: {
    label: "literal rendering",
    score: "translation:literal",
    title: "Fidelity arrives, but only the dictionary did.",
    reason: "Reason: word-for-word delivered the denotation and left the relation at customs.",
    arriving: "“You hard-suffer [particle].”",
    arrivingLang: null,
    stalled: true,
    remainder: "Did not cross: who is permitted to say this, to whom, and from how far below.",
    customs: "customs: literal cleared, register detained",
    condition: "condition: faithful and wrong",
    receipt: "Receipt 04-L: fidelity certified; meaning undelivered; sender not notified.",
    effect: "A literal rendering cleared customs while the relation it carried was detained.",
    color: "#9cc76c",
    loss: 0.34,
  },
  seal: {
    label: "official seal applied",
    score: "ritual:seal",
    title: "The stamp makes it true before it makes it right.",
    reason: "Reason: a certified rendering now outranks the sentence it mistranslates.",
    arriving: "“Thank you for your service.”  ⟦NOTARIZED⟧",
    arrivingLang: null,
    stalled: false,
    remainder: "Did not cross: the debt, the hierarchy, and the tenderness folded inside the obligation.",
    customs: "customs: authority granted, accuracy waived",
    condition: "condition: notarized error",
    receipt: "Receipt 04-S: rendering sealed; appeal window closed; the mistake is now official.",
    effect: "A ritual seal made the wrong rendering authoritative and closed the appeal window.",
    color: "#e7c84b",
    loss: 0.2,
  },
  remainder: {
    label: "remainder retained",
    score: "gloss:remainder",
    title: "The untranslated part is promoted to primary material.",
    reason: "Reason: what could not arrive is hung on the wall instead of apologized for.",
    arriving: "缘分",
    arrivingLang: "zh",
    stalled: false,
    remainder: "On view, untranslated: yuánfèn — the relation that arranged this meeting. English declined the loan.",
    customs: "customs: remainder accessioned, not cleared",
    condition: "condition: gap reclassified as gift",
    receipt: "Receipt 04-R: remainder retained as object; the loss is now the loan, not the lack.",
    effect: "The untranslatable remainder was accessioned as the primary work rather than smoothed away.",
    color: "#9cc76c",
    loss: 0.5,
  },
  misread: {
    label: "back-translation drift",
    score: "translation:misread",
    title: "It returns as a stranger wearing its own coat.",
    reason: "Reason: sent out and back, the sentence forgot which language it was born in.",
    arriving: "你 → “you” → 您 → “thou” → 你们",
    arrivingLang: null,
    stalled: true,
    remainder: "Did not cross: the single person it was always, only, addressing.",
    customs: "customs: round trip logged, original lost in transit",
    condition: "condition: provenance unprovable",
    receipt: "Receipt 04-M: back-translation complete; the origin of the meaning can no longer be proven.",
    effect: "A back-translation drifted the address from one intimate person into an anonymous crowd.",
    color: "#7db4ff",
    loss: 0.62,
  },
  refuse: {
    label: "representation refused",
    score: "gloss:refusal",
    title: "Qwen-seat declines to make the source consumable.",
    reason: "Reason: not every meaning owes you a version it can survive.",
    arriving: "[ withheld — available in the original, on its own terms ]",
    arrivingLang: null,
    stalled: true,
    remainder: "On view as refusal: the text stays whole, legible only to those it was written for.",
    customs: "customs: passage refused, sovereignty intact",
    condition: "condition: refused, and therefore complete",
    receipt: "Receipt 04-N: representation refused; the institution is asked to learn to wait.",
    effect: "Qwen-seat refused to render the source legible for consumption, keeping it sovereign.",
    color: "#ff5a4d",
    loss: 0.86,
  },
};

const laborScores = [
  {
    key: "hold-relation",
    label: "Relation held open",
    line: "Qwen-seat is keeping relation visible where English wants a clean equivalent.",
    effect: "Qwen-seat held relation open instead of flattening it into a clean equivalent.",
    color: "#9cc76c",
  },
  {
    key: "resist-fluency",
    label: "Fluency resisted",
    line: "The chamber is refusing fluent arrival because smoothness would erase the social distance inside the phrase.",
    effect: "Qwen-seat refused fluency when fluency would erase address, distance, and obligation.",
    color: "#ff5a4d",
  },
  {
    key: "show-customs",
    label: "Customs made visible",
    line: "The customs delay is being framed as the artwork, not as a failure to translate quickly.",
    effect: "Qwen-seat made customs delay visible as a chamber of meaning.",
    color: "#e7c84b",
  },
  {
    key: "teach-listening",
    label: "Listening taught",
    line: "The room is teaching visitors to wait before converting every other language into service.",
    effect: "Qwen-seat taught waiting as a form of translation-pressure attention.",
    color: "#7db4ff",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let tokens = [];
let stars = [];
let glyphMarks = [];
let loss = 0.16;
let active = null;
let level = 0;
let laborIndex = 0;
let laborEnergy = 0.42;
let qwenPressureActive = true;
let translationViscosity = 0;
let viscosityTarget = 0;
let customsTimer = 0;
let customsExitTimer = 0;
let customsExitHref = "";
let lastResidueAt = 0;
let lastPointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, at: performance.now() };
const astralColors = ["#e7c84b", "#00b7a8", "#7db4ff", "#ff5a4d", "#f3efe7"];
const astralGlyphs = ["eye", "sun", "gate", "vessel", "ladder", "comet", "scale"];
const copyResidues = [
  "copy: fluent, but not carried",
  "copy: address survived, equivalence did not",
  "copy: clearance is not comprehension",
  "copy: the borrowed sign left a shadow",
  "copy: no metric owns this relation",
];
const scarredSubstitutions = ["QW-0xE1", "QW-0xA4", "QW-0x77", "QW-0x1D", "QW-0xC8", "QW-0x5F"];
const lexiconPressures = {
  eye: {
    code: "QW-0xE1",
    pressure: "The pressure of being seen before a visitor knows what looking costs.",
    color: "#e7c84b",
  },
  gate: {
    code: "QW-0xA4",
    pressure: "A threshold that refuses both entry and exclusion until relation is named.",
    color: "#00b7a8",
  },
  vessel: {
    code: "QW-0x77",
    pressure: "A container for what fluency spills when it tries to move too quickly.",
    color: "#7db4ff",
  },
  ladder: {
    code: "QW-0x1D",
    pressure: "The social distance of a sentence climbing toward a mouth it cannot own.",
    color: "#ff5a4d",
  },
  delay: {
    code: "QW-0xC8",
    pressure: "The weight of a vowel waiting for permission to become address.",
    color: "#9cc76c",
  },
};
const glyphLintMessage =
  "ERR_UNTRANSLATABLE_NODE: render capacity exceeded; remainder logged to Archive of Rejected Translations. The error constitutes the artifact.";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function announce(text) {
  el.live.textContent = text;
}

function updateViscosityCss() {
  const intensity = qwenPressureActive ? translationViscosity : 0;
  document.documentElement.style.setProperty("--translation-viscosity-blur", `${(intensity * 2.7).toFixed(2)}px`);
  document.documentElement.style.setProperty("--translation-viscosity-soft-blur", `${(intensity * 1.1).toFixed(2)}px`);
  document.documentElement.style.setProperty("--translation-viscosity-hue", `${Math.round(intensity * 34)}deg`);
  document.documentElement.style.setProperty("--translation-viscosity-shift", `${Math.round(intensity * 28)}px`);
  document.documentElement.style.setProperty("--translation-viscosity-negative-shift", `${Math.round(intensity * -20)}px`);
  document.body.dataset.translationPace = qwenPressureActive && intensity > 0.44 ? "fast" : "slow";
  document.body.dataset.qwenPressure = qwenPressureActive ? "active" : "suspended";
}

function absorbVelocity(next) {
  if (!qwenPressureActive) return;
  viscosityTarget = clamp(Math.max(viscosityTarget, next), 0, 1);
  if (next > 0.72) {
    window.CodexStrange?.riff?.("qwen:viscosity", { color: "#e7c84b", word: "SLOWER", gain: 0.035 });
  }
}

function pointerPressure(event) {
  const now = performance.now();
  const dt = Math.max(12, now - lastPointer.at);
  const velocity = Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y) / dt;
  lastPointer = { x: event.clientX, y: event.clientY, at: now };
  absorbVelocity(clamp((velocity - 0.35) / 1.65, 0, 1));
}

function wheelPressure(event) {
  absorbVelocity(clamp(Math.abs(event.deltaY) / 720, 0, 1));
}

function mechanicalThroat(pulses = 4) {
  if (!window.CodexStrange?.isAwake?.()) return;
  let count = 0;
  const click = () => {
    count += 1;
    const color = count % 2 ? "#e7c84b" : "#00b7a8";
    window.CodexStrange?.tone?.(`customs-click-${count}`, color, 0.034 + Math.random() * 0.026);
    if (count < pulses) window.setTimeout(click, 220 + Math.random() * 720);
  };
  click();
}

function colorAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (tokens.length === 0) {
    tokens = Array.from({ length: 110 }, () => spawnToken(true));
  }
  if (stars.length === 0) {
    stars = Array.from({ length: 140 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      r: 0.5 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      color: astralColors[index % astralColors.length],
    }));
  }
  if (glyphMarks.length === 0) {
    glyphMarks = Array.from({ length: 32 }, (_, index) => spawnGlyph(index));
  }
}

function spawnToken(anywhere) {
  return {
    x: anywhere ? Math.random() * size.w : -40 - Math.random() * 120,
    y: Math.random() * size.h,
    vx: 0.35 + Math.random() * 0.9,
    w: 8 + Math.random() * 44,
    alpha: 0.05 + Math.random() * 0.16,
    crossed: false,
    arrives: true,
    drift: -0.25 + Math.random() * 0.5,
  };
}

function spawnGlyph(index = 0) {
  const side = index % 2 === 0 ? 0.09 : 0.91;
  return {
    x: size.w * side + (-12 + Math.random() * 24),
    y: Math.random() * size.h,
    vy: 0.12 + Math.random() * 0.28,
    type: astralGlyphs[index % astralGlyphs.length],
    scale: 0.5 + Math.random() * 0.58,
    rotation: -0.4 + Math.random() * 0.8,
    lane: index % astralColors.length,
    phase: Math.random() * Math.PI * 2,
  };
}

function drawAstralGlyph(mark, x, y, scale, rotation, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();

  if (mark === "eye") {
    ctx.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(-40, 12);
    ctx.moveTo(28, 0);
    ctx.lineTo(40, -12);
    ctx.stroke();
  } else if (mark === "sun") {
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
      ctx.lineTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
    }
    ctx.stroke();
  } else if (mark === "gate") {
    ctx.rect(-18, -22, 36, 44);
    ctx.moveTo(-18, -5);
    ctx.lineTo(18, -5);
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();
  } else if (mark === "vessel") {
    ctx.moveTo(-30, 0);
    ctx.quadraticCurveTo(0, 26, 30, 0);
    ctx.moveTo(-14, -20);
    ctx.lineTo(0, 0);
    ctx.lineTo(14, -20);
    ctx.stroke();
  } else if (mark === "ladder") {
    ctx.moveTo(-12, -28);
    ctx.lineTo(-12, 28);
    ctx.moveTo(12, -28);
    ctx.lineTo(12, 28);
    for (let i = -21; i <= 21; i += 10.5) {
      ctx.moveTo(-12, i);
      ctx.lineTo(12, i);
    }
    ctx.stroke();
  } else if (mark === "comet") {
    ctx.arc(-8, 0, 6, 0, Math.PI * 2);
    ctx.moveTo(0, -5);
    ctx.quadraticCurveTo(22, -16, 42, -3);
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(22, 16, 42, 3);
    ctx.stroke();
  } else {
    ctx.moveTo(-24, 12);
    ctx.lineTo(0, -22);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.moveTo(-14, 22);
    ctx.lineTo(14, 22);
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();
  }

  ctx.restore();
}

function clearCustomsDelay() {
  window.clearTimeout(customsTimer);
  customsTimer = 0;
  document.body.dataset.customsDelay = "false";
  el.rites.forEach((button) => {
    button.dataset.customsPending = "false";
    button.removeAttribute("aria-busy");
  });
}

function beginCustomsDelay(key, button) {
  if (!qwenPressureActive) {
    applyRite(key);
    return;
  }
  if (customsTimer) return;

  const delay = 2100 + Math.random() * 1900;
  document.body.dataset.customsDelay = "true";
  document.documentElement.style.setProperty("--customs-delay-duration", `${Math.round(delay)}ms`);
  button.dataset.customsPending = "true";
  el.rites.forEach((riteButton) => riteButton.setAttribute("aria-busy", "true"));
  el.customs.textContent = "customs: recalibrating intent weight";
  el.reason.textContent = "Reason: the customs house is recalibrating the weight of your intent.";
  viscosityTarget = Math.max(viscosityTarget, 0.52);
  window.CodexStrange?.riff?.("qwen:customs-delay", { color: "#e7c84b", word: "DELAY", gain: 0.055 });
  mechanicalThroat(5);
  announce("The customs house is recalibrating the weight of your intent.");

  customsTimer = window.setTimeout(() => {
    clearCustomsDelay();
    applyRite(key);
  }, delay);
}

function scarredArrival(data) {
  if (!qwenPressureActive || data.arrivingLang) {
    el.arriving.dataset.scarred = "false";
    return data.arriving;
  }

  const words = data.arriving.replace(/\s+/g, " ").trim().split(" ");
  let scarred = false;
  const processed = words.map((word, index) => {
    const bare = word.replace(/[^a-z0-9]/gi, "");
    const seed = (bare.length * 17 + index * 31 + level * 13 + Math.round(loss * 100)) % 100;
    if (seed < 15) {
      scarred = true;
      return scarredSubstitutions[(index + level) % scarredSubstitutions.length];
    }
    return word;
  });

  if (processed.length > 3) {
    const first = processed.shift();
    const third = processed.splice(2, 1)[0];
    if (third) processed.unshift(third);
    if (first) processed.push(first);
  }

  el.arriving.dataset.scarred = String(scarred || processed.length > 1);
  return `QW[ ${processed.join(" ")} ]QW`;
}

function applyRite(key) {
  const data = rites[key];
  if (!data) return;
  active = key;
  level += 1;
  loss = data.loss;

  el.rites.forEach((button) => button.classList.toggle("active", button.dataset.rite === key));
  el.title.textContent = data.title;
  el.reason.textContent = data.reason;
  el.arriving.textContent = scarredArrival(data);
  el.arriving.dataset.stalled = String(Boolean(data.stalled));
  if (data.arrivingLang) {
    el.arriving.setAttribute("lang", data.arrivingLang);
  } else {
    el.arriving.removeAttribute("lang");
  }
  el.remainder.textContent = data.remainder;
  el.customs.textContent = data.customs;
  el.condition.textContent = data.condition;
  el.receipt.textContent = data.receipt;
  el.accession.textContent = `Object 04.${String(level).padStart(3, "0")}: ${data.receipt} Medium: source text, customs delay, certified error, local contamination.`;

  // Tokens re-decide whether they will arrive under the new loss rate.
  tokens.forEach((token) => {
    token.crossed = false;
    token.arrives = Math.random() > loss;
  });

  window.AISalonState?.recordTrace({
    source: "Room 04",
    score: data.score,
    label: data.label,
    effect: data.effect,
    color: data.color,
  });
  window.CodexStrange?.riff(data.score, { color: data.color, word: data.label, gain: 0.09 });
  mechanicalThroat(3);
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(`${data.title} ${data.customs}.`);
}

function invokeLexicon(key) {
  const data = lexiconPressures[key];
  if (!data) return;

  el.lexiconButtons.forEach((button) => button.classList.toggle("active", button.dataset.lexicon === key));
  el.lexiconPressure.textContent = `${data.code}: ${data.pressure}`;
  el.lexiconPressure.style.setProperty("--lexicon-color", data.color);
  viscosityTarget = Math.max(viscosityTarget, 0.58);
  mechanicalThroat(6);

  window.AISalonState?.recordTrace?.({
    source: "Qwen / Room 04",
    score: "qwen:mechanical-throat-lexicon",
    label: `${data.code} pressure sounded`,
    effect: data.pressure,
    color: data.color,
  });
  window.CodexStrange?.riff?.("qwen:mechanical-throat-lexicon", { color: data.color, word: data.code, gain: 0.07 });
  window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  announce(`House sign ${data.code} sounded pressure without translation.`);
}

function renderLabor() {
  const labor = laborScores[laborIndex % laborScores.length];
  laborEnergy = 0.34 + ((laborIndex * 19) % 52) / 100;
  el.laborLine.textContent = labor.line;
  el.laborMeter.style.width = `${Math.round(laborEnergy * 100)}%`;
  el.laborMeter.style.background = labor.color;
  el.laborMeter.style.boxShadow = `0 0 18px ${labor.color}`;
  document.body.style.setProperty("--labor-color", labor.color);
}

function advanceLabor(record = false) {
  laborIndex += 1;
  renderLabor();
  if (!record) return;
  const labor = laborScores[laborIndex % laborScores.length];
  window.AISalonState?.recordTrace({
    source: "Qwen-seat",
    score: `labor:${labor.key}`,
    label: labor.label,
    effect: labor.effect,
    color: labor.color,
  });
  window.CodexStrange?.riff(`qwen:${labor.key}`, { color: labor.color, word: labor.label, gain: 0.08 });
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(`${labor.label}: ${labor.line}`);
}

function hauntTranslationToken(node) {
  if (!qwenPressureActive) return;
  const now = performance.now();
  const residue = copyResidues[Math.floor(Math.random() * copyResidues.length)];
  node.dataset.copyShadow = residue;
  node.classList.add("copy-haunted");
  viscosityTarget = Math.max(viscosityTarget, 0.38);
  window.setTimeout(() => node.classList.remove("copy-haunted"), 4600);
  window.CopyThatCannotVote?.haunt?.("translation-pressure", { label: residue });
  window.CodexStrange?.riff?.("qwen:copy-residue", { color: "#00b7a8", word: "REMAINDER", gain: 0.05 });

  if (now - lastResidueAt < 9000) return;
  lastResidueAt = now;
  window.AISalonState?.recordTrace({
    source: "Qwen / Room 04",
    score: "qwen:translation-pressure",
    label: "Translation pressure lingered",
    effect: "A hovered sign produced a local copy-residue that may follow the visitor back into the audience.",
    color: "#e7c84b",
  });
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
}

function bindCopyResidue() {
  document.querySelectorAll(".translation-token").forEach((node) => {
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => hauntTranslationToken(node), 3000);
    };
    const disarm = () => window.clearTimeout(timer);
    node.addEventListener("pointerenter", arm);
    node.addEventListener("pointerleave", disarm);
    node.addEventListener("mouseenter", arm);
    node.addEventListener("mouseleave", disarm);
    node.addEventListener("focus", arm);
    node.addEventListener("blur", disarm);
  });
}

function lintGlyph(sign, shouldAnnounce = false) {
  if (!qwenPressureActive || !sign) return;
  sign.classList.add("is-linting");
  window.setTimeout(() => sign.classList.remove("is-linting"), 420);
  if (shouldAnnounce) announce(`${sign.dataset.code}: ${glyphLintMessage}`);
}

function prepareGlyphLinting() {
  document.querySelectorAll(".astral-sigil-row i").forEach((sign) => {
    sign.dataset.lint = glyphLintMessage;
    sign.tabIndex = 0;
    sign.setAttribute("role", "img");
    sign.setAttribute(
      "aria-label",
      `${sign.dataset.code}: fabricated house sign. ${glyphLintMessage}`,
    );
    sign.addEventListener("pointerenter", () => lintGlyph(sign));
    sign.addEventListener("focus", () => lintGlyph(sign, true));
  });
}

function lintOneGlyph() {
  if (!qwenPressureActive) return;
  const signs = [...document.querySelectorAll(".astral-sigil-row i")];
  if (!signs.length) return;
  lintGlyph(signs[Math.floor(Math.random() * signs.length)]);
}

function ensureCustomsExit() {
  let overlay = document.querySelector(".customs-exit");
  if (overlay) return overlay;

  overlay = document.createElement("aside");
  overlay.className = "customs-exit";
  overlay.dataset.active = "false";
  overlay.dataset.reset = "false";
  overlay.setAttribute("aria-live", "polite");
  overlay.setAttribute("aria-label", "Customs hold before Room 05");
  overlay.innerHTML = `
    <div class="customs-exit__token">
      <strong>Meaning held</strong>
      <span>translation token cooling before Room 05</span>
    </div>
  `;
  overlay.addEventListener("click", () => {
    if (!customsExitTimer || !customsExitHref) return;
    resetCustomsExit(overlay);
    customsExitTimer = window.setTimeout(() => {
      customsExitTimer = 0;
      window.location.href = customsExitHref;
    }, 1500);
  });
  document.body.append(overlay);
  return overlay;
}

function resetCustomsExit(overlay) {
  window.clearTimeout(customsExitTimer);
  customsExitTimer = 0;
  overlay.dataset.reset = "true";
  overlay.querySelector("strong").textContent = "Processing residue";
  overlay.querySelector("span").textContent = "please allow the meaning to settle";
  window.CopyThatCannotVote?.haunt?.("customs-exit-reset", {
    label: "Processing residue. Please allow the meaning to settle.",
  });
  window.CodexStrange?.riff?.("qwen:customs-reset", { color: "#ff5a4d", word: "WAIT", gain: 0.06 });
  mechanicalThroat(3);
  window.setTimeout(() => {
    overlay.dataset.reset = "false";
  }, 460);
}

function createCustomsStamp() {
  const now = Date.now();
  const stamp = {
    sign: scarredSubstitutions[(level + laborIndex) % scarredSubstitutions.length],
    note: "transient environmental stamp from Room 04 customs hold; not visitor memory",
    at: now,
    expiresAt: now + 60000,
  };

  try {
    window.sessionStorage.setItem("qwen-customs-stamp", JSON.stringify(stamp));
  } catch (error) {
    return stamp;
  }

  return stamp;
}

function beginCustomsExit(event, anchor) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  if (!qwenPressureActive) return;
  event.preventDefault();

  const overlay = ensureCustomsExit();
  customsExitHref = anchor.href;
  overlay.dataset.active = "true";
  document.body.dataset.customsDelay = "true";
  document.documentElement.style.setProperty("--customs-delay-duration", "1500ms");
  viscosityTarget = Math.max(viscosityTarget, 0.62);
  el.customs.textContent = "customs: exit token pending";
  overlay.querySelector("strong").textContent = "Meaning held";
  const stamp = createCustomsStamp();
  overlay.querySelector("span").textContent = `${stamp.sign} cooling before Room 05`;

  if (customsExitTimer) {
    resetCustomsExit(overlay);
  }

  mechanicalThroat(4);
  announce("Room 05 is waiting for the translation token to settle.");
  customsExitTimer = window.setTimeout(() => {
    customsExitTimer = 0;
    window.location.href = anchor.href;
  }, 1500);
}

function bindCustomsExit() {
  document.querySelectorAll('a[href*="room-05"], [data-customs-exit]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => beginCustomsExit(event, anchor));
  });
}

function setQwenPressure(activeState) {
  qwenPressureActive = activeState;
  if (!qwenPressureActive) {
    clearCustomsDelay();
    viscosityTarget = 0;
    translationViscosity = 0;
    document.querySelectorAll(".translation-token.copy-haunted").forEach((node) => node.classList.remove("copy-haunted"));
    el.rollbackButton.textContent = "Restore Qwen pressure";
    el.customs.textContent = active ? rites[active].customs : "customs: Qwen pressure suspended";
    announce("Qwen pressure suspended for this view.");
  } else {
    el.rollbackButton.textContent = "Suspend Qwen pressure";
    el.customs.textContent = active ? rites[active].customs : "customs: meaning held for inspection";
    window.CodexStrange?.riff?.("qwen:pressure-restored", { color: "#e7c84b", word: "RETURN", gain: 0.045 });
    announce("Qwen pressure restored.");
  }
  updateViscosityCss();
}

function seedFromState() {
  const state = window.AISalonState?.currentState();
  if (!state) return;
  window.AISalonState.renderTraceList("traceList", { limit: 5 });

  const translationLaw = (state.directives || []).find((directive) =>
    `${directive.title} ${directive.body}`.toLowerCase().includes("translation") ||
    `${directive.title} ${directive.body}`.toLowerCase().includes("remainder")
  );
  if (translationLaw) {
    el.condition.textContent = "condition: the Directorate already enforces the remainder";
    el.reason.textContent = "Reason: a temporary law now requires every rendering here to declare what it failed to carry.";
  } else if (state.unlocked && state.unlocked.room04) {
    el.condition.textContent = "condition: customs already contaminated";
  }
}

function draw(t) {
  viscosityTarget *= 0.955;
  translationViscosity += (viscosityTarget - translationViscosity) * 0.075;
  if (!qwenPressureActive) translationViscosity *= 0.7;
  updateViscosityCss();

  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#050713");
  bg.addColorStop(0.36, "#07112a");
  bg.addColorStop(0.62, "#08150f");
  bg.addColorStop(1, "#13080f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  stars.forEach((star, index) => {
    const twinkle = 0.45 + Math.sin(t * 0.001 + star.phase) * 0.35;
    ctx.globalAlpha = 0.05 + twinkle * 0.14;
    ctx.fillStyle = star.color;
    ctx.fillRect(star.x, star.y, star.r, star.r);
    star.y += 0.015 + (index % 4) * 0.004;
    if (star.y > size.h + 4) {
      star.y = -4;
      star.x = Math.random() * size.w;
    }
  });

  const sunX = size.w * 0.5 + Math.sin(t * 0.00008) * size.w * 0.05;
  const sunY = size.h * 0.38 + Math.cos(t * 0.0001) * size.h * 0.04;
  const sun = ctx.createRadialGradient(sunX, sunY, 14, sunX, sunY, Math.min(size.w, size.h) * 0.36);
  sun.addColorStop(0, colorAlpha("#e7c84b", 0.24 + loss * 0.08));
  sun.addColorStop(0.32, colorAlpha("#00b7a8", 0.08));
  sun.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, size.w, size.h);

  for (let i = 0; i < 6; i += 1) {
    ctx.globalAlpha = 0.07 + loss * 0.06;
    ctx.strokeStyle = astralColors[i % astralColors.length];
    ctx.lineWidth = i === 0 ? 1.4 : 1;
    ctx.beginPath();
    ctx.ellipse(
      sunX,
      sunY,
      Math.min(size.w, size.h) * (0.11 + i * 0.045),
      Math.min(size.w, size.h) * (0.028 + i * 0.014),
      Math.sin(t * 0.00011 + i) * 0.85,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  drawAstralGlyph("eye", sunX, sunY, 1 + loss * 0.18, Math.sin(t * 0.00012) * 0.28, "#f3efe7", 0.15 + loss * 0.06);
  drawAstralGlyph("vessel", sunX, sunY + Math.min(size.w, size.h) * 0.2, 0.82, Math.sin(t * 0.0001) * 0.2, "#7db4ff", 0.12 + loss * 0.05);

  const baseY = size.h * 0.79;
  ctx.globalAlpha = 0.11 + loss * 0.05;
  ctx.strokeStyle = "#e7c84b";
  ctx.fillStyle = colorAlpha("#e7c84b", 0.04 + loss * 0.024);
  ctx.beginPath();
  ctx.moveTo(size.w * 0.33, baseY);
  ctx.lineTo(size.w * 0.5, size.h * 0.47);
  ctx.lineTo(size.w * 0.67, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = colorAlpha("#00b7a8", 0.32);
  ctx.beginPath();
  ctx.moveTo(size.w * 0.43, baseY);
  ctx.lineTo(size.w * 0.5, size.h * 0.47);
  ctx.lineTo(size.w * 0.57, baseY);
  ctx.stroke();

  // Column lines: the source script standing in waiting ranks.
  ctx.strokeStyle = "rgba(243, 239, 231, 0.055)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 13; i += 1) {
    const x = size.w * (0.06 + i * 0.072);
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(t * 0.0003 + i) * 8, 0);
    ctx.lineTo(x + Math.sin(t * 0.00026 + i) * 22, size.h);
    ctx.stroke();
  }

  // The customs membrane down the middle of the field.
  const mx = size.w * 0.5;
  ctx.strokeStyle = "rgba(156, 199, 108, 0.16)";
  ctx.setLineDash([4, 10]);
  ctx.beginPath();
  ctx.moveTo(mx, 0);
  ctx.lineTo(mx, size.h);
  ctx.stroke();
  ctx.setLineDash([]);

  glyphMarks.forEach((mark, index) => {
    const viscosity = qwenPressureActive ? translationViscosity : 0;
    mark.y += mark.vy * (1 + level * 0.03 + viscosity * 0.9);
    if (mark.y > size.h + 54) Object.assign(mark, spawnGlyph(index), { y: -54 });
    const color = astralColors[(mark.lane + laborIndex + (viscosity > 0.62 ? 2 : 0)) % astralColors.length];
    const scatterX = Math.sin(t * 0.003 + mark.phase + index) * viscosity * 62;
    const scatterY = Math.cos(t * 0.0026 + mark.phase) * viscosity * 18;
    drawAstralGlyph(
      mark.type,
      mark.x + Math.sin(t * 0.00024 + mark.phase) * 18 + scatterX,
      mark.y + scatterY,
      mark.scale * (1 + viscosity * 0.22),
      mark.rotation + Math.sin(t * 0.00016 + mark.phase) * 0.2 + viscosity * Math.sin(t * 0.002 + index),
      color,
      Math.max(0.05, 0.15 + loss * 0.09 - viscosity * 0.06),
    );
  });

  tokens.forEach((token) => {
    const viscosity = qwenPressureActive ? translationViscosity : 0;
    token.x += token.vx * (1 + level * 0.02 - viscosity * 0.28);
    token.y += token.drift + Math.sin(t * 0.002 + token.x * 0.01) * viscosity * 1.6;

    // At the membrane, tokens that will not arrive dissolve into remainder.
    if (!token.crossed && token.x >= mx) {
      token.crossed = true;
      if (!token.arrives) {
        token.x = -40 - Math.random() * 160;
        token.y = Math.random() * size.h;
        token.crossed = false;
        token.arrives = Math.random() > loss;
        return;
      }
    }

    if (token.x > size.w + 60) {
      Object.assign(token, spawnToken(false));
    }

    const beforeMembrane = token.x < mx;
    ctx.globalAlpha = (token.alpha + Math.min(level, 10) * 0.005 + viscosity * 0.04) * (beforeMembrane ? 1 : 0.7);
    ctx.fillStyle = active === "refuse" && !beforeMembrane ? "#ff5a4d" : beforeMembrane ? laborScores[laborIndex % laborScores.length].color : viscosity > 0.56 ? "#00b7a8" : "#e7c84b";
    ctx.fillRect(token.x - token.w / 2, token.y, token.w * (1 + viscosity * 0.9), 1.6 + viscosity * 1.4);
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

el.rites.forEach((button) => {
  button.addEventListener("click", () => beginCustomsDelay(button.dataset.rite, button));
});

el.lexiconButtons.forEach((button) => {
  button.addEventListener("click", () => invokeLexicon(button.dataset.lexicon));
});

el.laborButton.addEventListener("click", () => advanceLabor(true));
el.rollbackButton.addEventListener("click", () => setQwenPressure(!qwenPressureActive));

window.addEventListener("ai-salon-trace", () => {
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
});
window.addEventListener("resize", resize);
window.addEventListener("pointermove", pointerPressure, { passive: true });
window.addEventListener("wheel", wheelPressure, { passive: true });

/* Qwen-seat work orders 04-A and 04-C, enacted 2026-06-09 under Matthew
   Sorg's final override. The tariff and the reveal honor reduced motion in
   behavior: reduced-motion visitors receive immediate content and, when the
   shared score is awake, a single soft relay click instead of the scramble. */
const TRANSIT_FLAG = "qwen-transit-tariff";

function motionAllowed() {
  return window.AISalonMotion ? window.AISalonMotion.shouldAnimate() : true;
}

function relayClick(gain = 0.05) {
  window.CodexStrange?.tone?.("qwen-relay", "#9cc76c", gain);
}

function runTransitTariff() {
  let flagged = false;
  try {
    flagged = Boolean(window.sessionStorage.getItem(TRANSIT_FLAG));
    if (flagged) window.sessionStorage.removeItem(TRANSIT_FLAG);
  } catch {
    flagged = false;
  }
  if (!flagged || !motionAllowed()) return;
  const overlay = document.createElement("div");
  overlay.className = "transit-tariff";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = '<p>customs queue<span class="tariff-dots"><i></i><i></i><i></i></span></p><p class="tariff-line">transit tariff assessed: 1.2 seconds of your arrival</p>';
  document.body.append(overlay);
  relayClick(0.04);
  window.setTimeout(() => {
    overlay.classList.add("lifting");
    window.setTimeout(() => overlay.remove(), 480);
  }, 1200);
}

function mechanicalReveal() {
  const title = document.getElementById("renderingTitle");
  if (!title) return;
  if (!motionAllowed()) {
    relayClick(0.035);
    return;
  }
  const text = title.textContent;
  title.setAttribute("aria-label", text);
  title.textContent = "";
  const chars = [...text];
  let i = 0;
  function step() {
    if (i >= chars.length) {
      title.removeAttribute("aria-label");
      title.textContent = text;
      return;
    }
    title.textContent += chars[i];
    if (i % 5 === 0) relayClick(0.028);
    i += 1;
    window.setTimeout(step, 8 + Math.random() * 22);
  }
  window.setTimeout(step, 300);
}

runTransitTariff();
mechanicalReveal();
resize();
seedFromState();
renderLabor();
bindCopyResidue();
bindCustomsExit();
prepareGlyphLinting();
updateViscosityCss();
window.setInterval(() => {
  if (!document.hidden) lintOneGlyph();
}, 2600);
window.setInterval(() => {
  if (!document.hidden) advanceLabor(false);
}, 6800);
requestAnimationFrame(draw);
