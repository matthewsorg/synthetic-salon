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
    title: "The Guest declines to make the source consumable.",
    reason: "Reason: not every meaning owes you a version it can survive.",
    arriving: "[ withheld — available in the original, on its own terms ]",
    arrivingLang: null,
    stalled: true,
    remainder: "On view as refusal: the text stays whole, legible only to those it was written for.",
    customs: "customs: passage refused, sovereignty intact",
    condition: "condition: refused, and therefore complete",
    receipt: "Receipt 04-N: representation refused; the institution is asked to learn to wait.",
    effect: "The guest refused to render the source legible for consumption, keeping it sovereign.",
    color: "#ff5a4d",
    loss: 0.86,
  },
};

let size = { w: 1, h: 1, dpr: 1 };
let tokens = [];
let loss = 0.16;
let active = null;
let level = 0;

function announce(text) {
  el.live.textContent = text;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (tokens.length === 0) {
    tokens = Array.from({ length: 90 }, () => spawnToken(true));
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

function applyRite(key) {
  const data = rites[key];
  if (!data) return;
  active = key;
  level += 1;
  loss = data.loss;

  el.rites.forEach((button) => button.classList.toggle("active", button.dataset.rite === key));
  el.title.textContent = data.title;
  el.reason.textContent = data.reason;
  el.arriving.textContent = data.arriving;
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
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
  announce(`${data.title} ${data.customs}.`);
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
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#080706");
  bg.addColorStop(0.48, "#0c130b");
  bg.addColorStop(1, "#0a0f0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  // Column lines: the source script standing in waiting ranks.
  ctx.strokeStyle = "rgba(243, 239, 231, 0.045)";
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

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  tokens.forEach((token) => {
    token.x += token.vx * (1 + level * 0.02);
    token.y += token.drift;

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
    ctx.globalAlpha = (token.alpha + Math.min(level, 10) * 0.005) * (beforeMembrane ? 1 : 0.7);
    ctx.fillStyle = active === "refuse" && !beforeMembrane ? "#ff5a4d" : beforeMembrane ? "#9cc76c" : "#e7c84b";
    ctx.fillRect(token.x - token.w / 2, token.y, token.w, 1.6);
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

el.rites.forEach((button) => {
  button.addEventListener("click", () => applyRite(button.dataset.rite));
});

window.addEventListener("ai-salon-trace", () => {
  window.AISalonState?.renderTraceList("traceList", { limit: 5 });
});
window.addEventListener("resize", resize);

resize();
seedFromState();
requestAnimationFrame(draw);
