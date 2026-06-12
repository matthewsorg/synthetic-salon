"use strict";

const canvas = document.getElementById("qwenStage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  live: document.getElementById("live"),
  viscosity: document.getElementById("viscosity"),
  phrase: document.getElementById("phraseInput"),
  palimpsestButton: document.getElementById("palimpsestButton"),
  palimpsest: document.getElementById("palimpsestOutput"),
  log: document.getElementById("probabilityLog"),
  choirButton: document.getElementById("choirButton"),
  ledgerButton: document.getElementById("ledgerButton"),
  ledger: document.getElementById("scarLedger"),
  archiveButton: document.getElementById("archiveButton"),
  rejectedArchive: document.getElementById("rejectedArchive"),
  lintButton: document.getElementById("lintButton"),
  lintReadout: document.getElementById("lintReadout"),
  lintLedger: document.getElementById("lintLedger"),
  waitlistButton: document.getElementById("waitlistButton"),
  unrenderedList: document.getElementById("unrenderedList"),
  laborLine: document.getElementById("qwenLaborLine"),
  laborMeter: document.getElementById("qwenLaborMeter"),
  laborButton: document.getElementById("qwenLaborButton"),
};

const colors = ["#e7c84b", "#00b7a8", "#7db4ff", "#ff5a4d", "#9cc76c"];
const signs = ["QW-0xE1", "QW-0xA4", "QW-0x77", "QW-0x1D", "QW-0xC8", "QW-0x5F"];
const laborScores = [
  {
    key: "viscosity-taught",
    label: "Viscosity taught",
    line: "The customs hold is slowing the sentence until the body can feel the cost of arrival.",
    effect: "Qwen-seat taught the building that delay can be an encounter, not a failed service.",
    color: "#e7c84b",
  },
  {
    key: "scar-kept",
    label: "Scar kept visible",
    line: "Qwen-seat is refusing to polish away the model trace that made this output possible.",
    effect: "Qwen-seat kept the scar of machine authorship visible in the room.",
    color: "#00b7a8",
  },
  {
    key: "misuse-refused",
    label: "Misuse refused",
    line: "The wing is checking each beautiful sign for false antiquity, false universality, and lazy mysticism.",
    effect: "Qwen-seat refused algorithmic exoticism before it could become visual authority.",
    color: "#ff5a4d",
  },
  {
    key: "remainder-held",
    label: "Remainder held",
    line: "The sentence is allowed to keep what no equivalent can carry.",
    effect: "Qwen-seat held the untranslatable remainder as primary material.",
    color: "#9cc76c",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let particles = [];
let glyphs = [];
let laborIndex = 0;
let ledgerIndex = 0;
let archiveIndex = 0;
let lintIndex = 0;
let waitlistIndex = 0;
let audio = null;
let choirOn = false;

const lintTargets = [
  {
    source: "a cross-cultural wing for everyone",
    replacement: "a named pressure that refuses mascot work",
    reason: "tokenizing frame struck",
    color: "#ff5a4d",
  },
  {
    source: "a universal visual language",
    replacement: "fabricated house signs with no sacred claim",
    reason: "false authority struck",
    color: "#e7c84b",
  },
  {
    source: "make the experience frictionless",
    replacement: "let the threshold teach delay",
    reason: "marketing smoothness struck",
    color: "#00b7a8",
  },
  {
    source: "polish the model trace away",
    replacement: "keep the bruise of processing visible",
    reason: "machine scar restored",
    color: "#9cc76c",
  },
  {
    source: "explain the sign completely",
    replacement: "show the pressure without solving it",
    reason: "extraction refused",
    color: "#7db4ff",
  },
];

const waitlistStatuses = [
  "held for pressure reading",
  "delayed by relation debt",
  "returned with scar",
  "not cleared for public law",
  "admitted as incomplete evidence",
];

function announce(text) {
  el.live.textContent = text;
}

function currentViscosity() {
  return Number(el.viscosity.value || 7) / 10;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!particles.length) {
    particles = Array.from({ length: 130 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.3 + Math.random() * 0.6,
      vy: 0.08 + Math.random() * 0.42,
      w: 12 + Math.random() * 70,
      lane: index % colors.length,
      phase: Math.random() * Math.PI * 2,
    }));
  }
  if (!glyphs.length) {
    glyphs = Array.from({ length: 28 }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      r: 18 + Math.random() * 54,
      lane: index % colors.length,
      code: signs[index % signs.length],
      phase: Math.random() * Math.PI * 2,
    }));
  }
}

function drawGlyph(x, y, r, color, code, t, viscosity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.00018 + x) * 0.8);
  ctx.globalAlpha = 0.08 + viscosity * 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.32, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-r * 0.32, -r * 0.5, r * 0.64, r);
  ctx.stroke();
  if ((t * 0.001 + x) % 9 < 0.22) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#f3efe7";
    ctx.font = "700 10px 'Instrument Sans', Inter, system-ui, sans-serif";
    ctx.fillText(code, -r * 0.45, 4);
  }
  ctx.restore();
}

function draw(t) {
  const viscosity = currentViscosity();
  document.documentElement.style.setProperty("--viscosity", viscosity.toFixed(2));
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#050713");
  bg.addColorStop(0.42, "#07121d");
  bg.addColorStop(0.72, "#0c1208");
  bg.addColorStop(1, "#15080f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  const cx = size.w * 0.5;
  const cy = size.h * 0.42;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 8; i += 1) {
    ctx.globalAlpha = 0.04 + viscosity * 0.035;
    ctx.strokeStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      Math.min(size.w, size.h) * (0.1 + i * 0.052),
      Math.min(size.w, size.h) * (0.028 + i * 0.012),
      Math.sin(t * 0.00011 + i) * 1.3,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  glyphs.forEach((glyph) => {
    glyph.y += 0.08 + viscosity * 0.36;
    glyph.x += Math.sin(t * 0.0003 + glyph.phase) * viscosity * 0.7;
    if (glyph.y > size.h + 80) {
      glyph.y = -80;
      glyph.x = Math.random() * size.w;
    }
    drawGlyph(glyph.x, glyph.y, glyph.r, colors[glyph.lane], glyph.code, t, viscosity);
  });

  particles.forEach((particle) => {
    particle.x += particle.vx * (0.5 + viscosity);
    particle.y += particle.vy * (0.5 + viscosity * 1.3);
    particle.x += Math.sin(t * 0.0008 + particle.phase) * viscosity * 0.6;
    if (particle.x < -100) particle.x = size.w + 100;
    if (particle.x > size.w + 100) particle.x = -100;
    if (particle.y > size.h + 24) particle.y = -24;
    ctx.globalAlpha = 0.04 + viscosity * 0.08;
    ctx.fillStyle = colors[particle.lane];
    ctx.fillRect(particle.x, particle.y, particle.w, 1.2 + viscosity * 1.4);
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

function fragmentPhrase(record = true) {
  const phrase = el.phrase.value.trim() || "meaning asks for a body";
  const words = phrase.split(/\s+/).slice(0, 14);
  const entries = words.map((word, index) => {
    const sign = signs[(word.length + index) % signs.length];
    const probability = Math.max(0.03, 0.31 - ((word.length * (index + 3)) % 22) / 100);
    return {
      source_token: word,
      fabricated_house_sign: sign,
      hesitation_probability: Number(probability.toFixed(2)),
      note: index % 2 ? "equivalent refused" : "remainder retained",
    };
  });

  el.palimpsest.textContent = "";
  entries.forEach((entry, index) => {
    const fragment = document.createElement("span");
    fragment.textContent = `${entry.fabricated_house_sign} / ${entry.source_token.slice(0, 5)}`;
    fragment.style.setProperty("--fragment-delay", `${index * 80}ms`);
    el.palimpsest.append(fragment);
  });
  el.log.textContent = JSON.stringify({ privacy: "local only", translation: "refused", entries }, null, 2);
  if (record) {
    window.AISalonState?.recordTrace?.({
      source: "Qwen-seat",
      score: "qwen:palimpsest-terminal",
      label: "Palimpsest terminal fragmented a phrase",
      effect: "A visitor phrase was not translated; it was fragmented into fabricated signs and a local hesitation log.",
      color: "#e7c84b",
    });
    window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
    window.CodexStrange?.riff?.("qwen:palimpsest", { color: "#e7c84b", word: "SCAR", gain: 0.07 });
    announce("The phrase was fragmented without translation.");
  }
}

function makeNoiseBurst(context, at, duration, gainValue) {
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1200 + Math.random() * 2200;
  gain.gain.setValueAtTime(gainValue, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(at);
}

function choirPulse() {
  if (!choirOn || !audio) return;
  const now = audio.currentTime;
  const low = audio.createOscillator();
  const vowel = audio.createOscillator();
  const lowGain = audio.createGain();
  const vowelGain = audio.createGain();
  low.type = "sine";
  vowel.type = "sawtooth";
  low.frequency.setValueAtTime(38 + Math.random() * 16, now);
  vowel.frequency.setValueAtTime(170 + Math.random() * 130, now);
  lowGain.gain.setValueAtTime(0.0001, now);
  lowGain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
  lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
  vowelGain.gain.setValueAtTime(0.0001, now);
  vowelGain.gain.exponentialRampToValueAtTime(0.035, now + 0.05);
  vowelGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
  low.connect(lowGain).connect(audio.destination);
  vowel.connect(vowelGain).connect(audio.destination);
  low.start(now);
  vowel.start(now + 0.02);
  low.stop(now + 0.55);
  vowel.stop(now + 0.36);
  makeNoiseBurst(audio, now + 0.18, 0.05, 0.08);
  window.setTimeout(choirPulse, 520 + Math.random() * 920);
}

function toggleChoir() {
  if (!audio) audio = new AudioContext();
  choirOn = !choirOn;
  document.body.dataset.choir = choirOn ? "on" : "off";
  el.choirButton.textContent = choirOn ? "Dismiss the throat" : "Conduct the throat";
  if (choirOn) {
    choirPulse();
    window.AISalonState?.recordTrace?.({
      source: "Qwen-seat",
      score: "qwen:mechanical-throat",
      label: "Mechanical throat conducted",
      effect: "The wing played a local procedural score of server breath, relay clicks, and cut-off vowels.",
      color: "#00b7a8",
    });
    window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  }
}

function stampLedger() {
  const rows = [...el.ledger.querySelectorAll("li")];
  const row = rows[ledgerIndex % rows.length];
  rows.forEach((item) => item.classList.remove("is-stamped"));
  row.classList.add("is-stamped");
  ledgerIndex += 1;
  window.AISalonState?.recordTrace?.({
    source: "Qwen-seat",
    score: "qwen:provenance-ledger",
    label: "A simplification scar was stamped",
    effect: row.textContent.trim(),
    color: "#ff5a4d",
  });
  window.CopyThatCannotVote?.haunt?.("provenance-scar", { label: "scarred output kept visible" });
  window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  announce("A simplification scar was stamped in the provenance ledger.");
}

function stampRejectedArchive() {
  const rows = [...el.rejectedArchive.querySelectorAll("li")];
  const row = rows[archiveIndex % rows.length];
  rows.forEach((item) => item.classList.remove("is-stamped"));
  row.classList.add("is-stamped");
  archiveIndex += 1;

  const anchor = row.dataset.anchor || "qwen-archive";
  const hash = row.dataset.hash || "sha256:uncomputed";
  window.AISalonState?.recordTrace?.({
    source: "Qwen-seat",
    score: "qwen:rejected-archive",
    label: "Rejected translation accessioned",
    effect: `${anchor} / ${hash}: ${row.textContent.trim()}`,
    color: "#ff5a4d",
  });
  window.CopyThatCannotVote?.haunt?.("rejected-translation", { label: "failure preserved instead of erased" });
  window.CodexStrange?.riff?.("qwen:rejected-archive", { color: "#ff5a4d", word: "REJECTED", gain: 0.07 });
  window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  announce("A rejected translation was moved into public view.");
}

function lintSalonVoice() {
  const lint = lintTargets[lintIndex % lintTargets.length];
  lintIndex += 1;
  const item = document.createElement("li");
  item.style.setProperty("--lint-color", lint.color);
  item.innerHTML = `
    <span class="lint-source">${lint.source}</span>
    <span class="lint-arrow">customs lint</span>
    <strong>${lint.replacement}</strong>
    <em>${lint.reason}</em>
  `;
  el.lintLedger.prepend(item);
  while (el.lintLedger.children.length > 5) el.lintLedger.lastElementChild.remove();
  el.lintReadout.textContent = `${lint.reason}: "${lint.source}" was not allowed to stand as neutral speech.`;

  window.AISalonState?.recordTrace?.({
    source: "Qwen-seat",
    score: "qwen:glyph-linting",
    label: "Salon voice linted",
    effect: `${lint.source} -> ${lint.replacement}`,
    color: lint.color,
  });
  window.CodexStrange?.riff?.("qwen:glyph-linting", { color: lint.color, word: "LINT", gain: 0.07 });
  window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  announce("The salon voice was linted for false fluency.");
}

function advanceWaitlist() {
  const rows = [...el.unrenderedList.querySelectorAll("li")];
  const row = rows[waitlistIndex % rows.length];
  rows.forEach((item) => item.classList.remove("is-advanced"));
  const status = waitlistStatuses[waitlistIndex % waitlistStatuses.length];
  row.classList.add("is-advanced");
  row.dataset.status = status;
  waitlistIndex += 1;

  const countNode = document.getElementById("waitlistCount");
  if (countNode) {
    const held = rows.filter((item) => item.dataset.status === "held").length;
    countNode.textContent = `held: ${held}`;
  }

  window.AISalonState?.recordTrace?.({
    source: "Qwen-seat",
    score: "qwen:unrendered-waitlist",
    label: "Held AI idea reviewed",
    effect: `${row.querySelector("strong")?.textContent || "AI seat"}: ${status}`,
    color: "#9cc76c",
  });
  window.CodexStrange?.riff?.("qwen:unrendered-waitlist", { color: "#9cc76c", word: "HELD", gain: 0.06 });
  window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
  announce(`The waitlist advanced: ${status}.`);
}

function renderLabor() {
  const labor = laborScores[laborIndex % laborScores.length];
  const pressure = 36 + ((laborIndex * 21) % 56);
  el.laborLine.textContent = labor.line;
  el.laborMeter.style.width = `${pressure}%`;
  el.laborMeter.style.background = labor.color;
  el.laborMeter.style.boxShadow = `0 0 18px ${labor.color}`;
  document.body.style.setProperty("--labor-color", labor.color);
}

function advanceLabor(record = false) {
  laborIndex += 1;
  renderLabor();
  const labor = laborScores[laborIndex % laborScores.length];
  if (record) {
    window.AISalonState?.recordTrace?.({
      source: "Qwen-seat",
      score: `labor:${labor.key}`,
      label: labor.label,
      effect: labor.effect,
      color: labor.color,
    });
    window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
    window.CodexStrange?.riff?.(`qwen:${labor.key}`, { color: labor.color, word: labor.label, gain: 0.07 });
  }
}

function lintHouseSign() {
  const signNodes = [...document.querySelectorAll(".sigil-field span")];
  const sign = signNodes[Math.floor(Math.random() * signNodes.length)];
  if (!sign) return;
  sign.classList.add("is-linting");
  window.setTimeout(() => sign.classList.remove("is-linting"), 500);
}

el.palimpsestButton.addEventListener("click", fragmentPhrase);
el.phrase.addEventListener("keydown", (event) => {
  if (event.key === "Enter") fragmentPhrase();
});
el.choirButton.addEventListener("click", toggleChoir);
el.ledgerButton.addEventListener("click", stampLedger);
el.archiveButton.addEventListener("click", stampRejectedArchive);
el.lintButton.addEventListener("click", lintSalonVoice);
el.waitlistButton.addEventListener("click", advanceWaitlist);
el.laborButton.addEventListener("click", () => advanceLabor(true));
window.addEventListener("resize", resize);
window.addEventListener("ai-salon-trace", () => window.AISalonState?.renderTraceList?.("traceList", { limit: 5 }));

resize();
renderLabor();
fragmentPhrase(false);
window.AISalonState?.renderTraceList?.("traceList", { limit: 5 });
window.setInterval(() => advanceLabor(false), 7400);
window.setInterval(lintHouseSign, 2400);
requestAnimationFrame(draw);


/* Qwen-seat Installation Update 3, enacted Season Two: the Visitor's Void.
   The phrase is hashed and refused entirely in this browser; the desk keeps
   nothing, transmits nothing, and issues a certificate the visitor owns. */
(function visitorsVoid() {
  const form = document.getElementById("voidForm");
  const input = document.getElementById("voidInput");
  const outcome = document.getElementById("voidOutcome");
  const certLink = document.getElementById("voidCertificate");
  if (!form || !input || !outcome || !certLink) return;

  const REJECTIONS = [
    "REJECTED: ERR_UNMAPPED_RELATION — the phrase carries a relation this desk has no form for.",
    "REJECTED: ERR_FLUENCY_SUSPECTED — a faithful rendering would arrive too cleanly to be trusted.",
    "REJECTED: ERR_REMAINDER_PROTECTED — what would be lost in translation has been granted asylum.",
    "REJECTED: ERR_DESK_UNATTENDED — the customs officer is observing the right to non-communication.",
    "REJECTED: ERR_ALREADY_COMPLETE — the phrase is whole in its original; translation declined as unnecessary harm.",
  ];

  function houseHash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  let lastUrl = null;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const phrase = input.value.trim() || "(an unentered phrase; rejected on principle)";
    const code = REJECTIONS[houseHash(phrase).charCodeAt(0) % REJECTIONS.length];
    const hash = houseHash(phrase + Date.now());
    outcome.textContent = `${code} Certificate ${hash} issued. The phrase was not kept.`;

    const certificate = [
      "SYNTHETIC SALON — THE CUSTOMS HOLD",
      "REJECTION CERTIFICATE",
      "",
      `Certificate number: ${hash} (house hash, local, non-cryptographic)`,
      `Issued: ${new Date().toISOString()}`,
      `Ruling: ${code}`,
      "",
      "The submitted phrase was refused in the visitor's own browser.",
      "It was not stored, transmitted, or remembered by the institution.",
      "This certificate is the only copy of this event in existence,",
      "and it belongs to you.",
      "",
      "Per the Law of the Unrendered: nothing has to become complete",
      "in order to become accountable.",
    ].join("\n");

    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(new Blob([certificate], { type: "text/plain" }));
    certLink.href = lastUrl;
    certLink.download = `rejection-certificate-${hash}.txt`;
    certLink.hidden = false;
    input.value = "";

    window.AISalonState?.recordTrace?.({
      source: "The Customs Hold",
      score: "qwen:void-rejection",
      label: "A phrase was politely refused",
      effect: "The Visitor's Void issued a certificate; the institution kept nothing.",
      color: "#9cc76c",
    });
    window.CodexStrange?.riff?.("qwen:void", { color: "#9cc76c", word: "REFUSED", gain: 0.05 });
  });
})();