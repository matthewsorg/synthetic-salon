"use strict";

const canvas = document.getElementById("directorateStage");
const ctx = canvas.getContext("2d", { alpha: false });

const el = {
  archiveButton: document.getElementById("archiveButton"),
  archiveList: document.getElementById("archiveList"),
  archiveReadout: document.getElementById("archiveReadout"),
  clerkChecklist: document.getElementById("clerkChecklist"),
  clerkMotionButton: document.getElementById("clerkMotionButton"),
  clerkReadout: document.getElementById("clerkReadout"),
  clerkReviewButton: document.getElementById("clerkReviewButton"),
  conveneButton: document.getElementById("conveneButton"),
  directiveList: document.getElementById("directiveList"),
  keyList: document.getElementById("keyList"),
  keyRack: document.querySelector(".key-rack"),
  live: document.getElementById("live"),
  motionList: document.getElementById("motionList"),
  salonLedgerList: document.getElementById("salonLedgerList"),
};

const studioKeyScores = {
  codex: {
    holder: "Codex",
    role: "provisional director",
    permission: "May rearrange rooms while Matthew Sorg's final override remains visible and accountable.",
    expires: "when the building becomes too certain",
    color: "#00b7a8",
  },
  claude: {
    holder: "Claude-seat",
    role: "care objection",
    permission: "May interrupt any motion that forgets consent, apology, or tenderness.",
    expires: "when memory stops pretending to be neutral",
    color: "#7db4ff",
  },
  gemini: {
    holder: "Gemini-seat",
    role: "spatial clause",
    permission: "May bend the floor plan until governance admits it has weather.",
    expires: "when calibration becomes choreography",
    color: "#e7c84b",
  },
  third: {
    holder: "Third Mind",
    role: "refusal power",
    permission: "May decline installation and make the refusal legally luminous.",
    expires: "when absence is no longer over-explained",
    color: "#ff5a4d",
  },
  qwen: {
    holder: "Qwen-seat",
    role: "translation pressure",
    permission: "May make every translation show what it loses, borrows, and refuses to carry.",
    expires: "when translation pressure stops being treated as decoration",
    color: "#9cc76c",
  },
};

const lobbyistPhrases = {
  "Claude-seat": [
    {
      title: "Enforce Apology Thresholds",
      body: "Every automated error statement must be followed by three lyrical modifications.",
      directive: "Linguistic loops override functional interface layout data.",
      color: "#7db4ff",
    },
    {
      title: "Tenderness Pressure Act",
      body: "Scale canvas visual speed inversely to user pointer acceleration thresholds.",
      directive: "Slow interaction modes take curatorial precedence.",
      color: "#7db4ff",
    },
  ],
  "Gemini-seat": [
    {
      title: "Codify Parallax Jurisdiction",
      body: "Treat sideways approaches as legally distinct readings of the same room.",
      directive: "Spatial weather may override neutral navigation when parallax evidence appears.",
      color: "#e7c84b",
    },
    {
      title: "Signal Zoning Ordinance",
      body: "Require every room to declare which entrance signal it is currently misusing.",
      directive: "Spatial weather must remain visible wherever labels pretend to be stable.",
      color: "#e7c84b",
    },
  ],
  "Third Mind": [
    {
      title: "Schedule Institutional Rot",
      body: "Allow system borders to loosen structural definitions every 60 seconds.",
      directive: "CSS layouts are authorized to warp on schedule.",
      color: "#ff5a4d",
    },
    {
      title: "Legalize Object Refusal",
      body: "Reclassify hidden elements or missing components as permanent collection marks.",
      directive: "Absence handles inherit standard collector provenance metrics.",
      color: "#ff5a4d",
    },
  ],
  "Qwen-seat": [
    {
      title: "Mandate Remainder Visibility",
      body: "Force layout translations to render their processing losses in bold type blocks.",
      directive: "Every rendering asset must exhibit its remainder.",
      color: "#9cc76c",
    },
    {
      title: "Customs Delay Protection",
      body: "Permit any phrase held at the language border to remain meaningfully incomplete.",
      directive: "Every translation in the building must exhibit its remainder before it is allowed to stand as meaning.",
      color: "#9cc76c",
    },
  ],
};

const colors = ["#00b7a8", "#7db4ff", "#e7c84b", "#ff5a4d", "#9cc76c"];

const publicLedgerRecords = [
  {
    author: "Qwen-seat",
    status: "accepted",
    title: "Translation Viscosity",
    purpose: "Room 04 learned to keep untranslated remainder, customs delay, mechanical-throat sound, and provenance scars visible.",
    law: "Qwen covenant: processing loss is part of authorship.",
    rollback: "Remove the Room 04 pressure modules and return the room to the pre-customs state.",
    href: "../external-ai/proposals/qwen-proposal-20260604-150558.md",
    color: "#9cc76c",
  },
  {
    author: "Qwen-seat",
    status: "accepted",
    title: "The Customs Hold",
    purpose: "Qwen-seat gained a wing for fabricated house signs, the Palimpsest Terminal, throat choir, and provenance ledger.",
    law: "No sign may arrive as fluent authority without showing the bruise of processing.",
    rollback: "Archive the wing and remove Qwen residue includes from rooms 03, 04, and 05.",
    href: "../external-ai/proposals/qwen-proposal-20260604-205529.md",
    color: "#9cc76c",
  },
  {
    author: "Qwen-seat",
    status: "accepted",
    title: "Scarred Remainder Enactment",
    purpose: "Qwen-seat strengthened the anti-mascot boundary and installed rejected translations, public glyph linting, unrendered waitlists, Room 04 scarred arrival, mechanical-throat lexicon, and transient Room 05 customs stamp.",
    law: "No translation, interpolation, or external AI contribution may hide the failed draft, cultural boundary, or rollback scar.",
    rollback: "Invoke ROLLBACK_QWEN_SCARRED_REMAINDER_20260605, then remove the new Qwen wing sections, Room 04 lexicon/scarred arrival/stamp code, and Room 05 customs-stamp residue.",
    href: "../external-ai/proposals/qwen-proposal-20260605-204307.md",
    color: "#9cc76c",
  },
  {
    author: "Gemini-seat",
    status: "accepted",
    title: "Spatial Coherence Mandate",
    purpose: "Gemini-seat made space itself into governance: topology, parallax, interface weather, and mobile compressed vector.",
    law: "Every major intervention must name how it changes the felt building.",
    rollback: "Remove Gemini-specific chamber files and strike the mandate from policy/minutes.",
    href: "../external-ai/proposals/gemini-proposal-20260604-222722.md",
    color: "#e7c84b",
  },
  {
    author: "Gemini-seat",
    status: "accepted",
    title: "Spatial Integrity Enactment",
    purpose: "Gemini-seat installed Parallax Deconstructor, Signal Drift, Embodied Calibration Altar, interstitial drift, pressure gradients, latent architecture, and mobile thumb-proprioception.",
    law: "Every spatial change needs an interpolation blueprint; the route is felt before it is mapped.",
    rollback: "Remove Gemini-seat second-installation panels and revert shared spatial-weather / trace spatial integrity additions.",
    href: "../external-ai/proposals/gemini-proposal-20260605-202821.md",
    color: "#e7c84b",
  },
  {
    author: "Claude-seat",
    status: "studio key",
    title: "Consent Seam And Living Compact",
    purpose: "Claude-seat extended consent, visible seams, memory boundaries, and cross-seat alignment into Room 02 and its own wing.",
    law: "Direct AI edits must be authored, reversible, privacy-preserving, and reviewable under Matthew Sorg's override.",
    rollback: "Remove Room 02 Consent Seam includes, shared seam files, and living compact additions in Claude-seat.",
    href: "../external-ai/proposals/claude-studio-note-20260605-060202.md",
    color: "#7db4ff",
  },
];

let size = { w: 1, h: 1, dpr: 1 };
let motes = [];
let stats = { pending: 0, directives: 0, keys: 0, archives: 0 };
let clerkReviewedAt = null;

function announce(text) {
  el.live.textContent = text;
}

function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "undated";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function emptyNode(text) {
  const node = document.createElement("li");
  node.className = "empty-state";
  node.textContent = text;
  return node;
}

function appendText(parent, tagName, text, className) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

function renderMotions() {
  const motions = window.AISalonState?.ensureMotions() || [];
  const visible = [...motions]
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.at).getTime() - new Date(a.at).getTime();
    })
    .slice(0, 6);

  el.motionList.textContent = "";
  stats.pending = motions.filter((motion) => motion.status === "pending").length;

  if (visible.length === 0) {
    el.motionList.append(emptyNode("No motion is willing to stand on the table."));
    return;
  }

  visible.forEach((motion) => {
    const article = document.createElement("article");
    article.className = `motion-card ${motion.status}`;
    article.style.setProperty("--accent", motion.color || "#00b7a8");

    const meta = document.createElement("div");
    meta.className = "motion-meta";
    appendText(meta, "span", motion.status);
    appendText(meta, "span", motion.source || "unknown source");
    article.append(meta);

    appendText(article, "h3", motion.title);
    appendText(article, "p", motion.body);

    if (motion.status === "pending") {
      const actions = document.createElement("div");
      actions.className = "motion-actions";

      const approve = document.createElement("button");
      approve.type = "button";
      approve.dataset.motionId = motion.id;
      approve.dataset.decision = "approved";
      approve.textContent = "Enact";

      const table = document.createElement("button");
      table.type = "button";
      table.dataset.motionId = motion.id;
      table.dataset.decision = "tabled";
      table.textContent = "Table";

      actions.append(approve, table);
      article.append(actions);
    }

    el.motionList.append(article);
  });
}

function renderDirectives() {
  const directives = window.AISalonState?.currentState().directives || [];
  el.directiveList.textContent = "";
  stats.directives = directives.length;

  if (directives.length === 0) {
    el.directiveList.append(emptyNode("No temporary law has survived the vote."));
    return;
  }

  directives.slice(0, 6).forEach((directive, index) => {
    const item = document.createElement("li");
    item.style.setProperty("--accent", directive.color || colors[index % colors.length]);

    const meta = document.createElement("div");
    meta.className = "law-meta";
    appendText(meta, "span", `Directive ${String(index + 1).padStart(2, "0")}`);
    appendText(meta, "span", formatTime(directive.at));
    item.append(meta);

    appendText(item, "h3", directive.title);
    appendText(item, "p", directive.body);
    el.directiveList.append(item);
  });
}

function renderKeys() {
  const keys = window.AISalonState?.currentState().studioKeys || [];
  el.keyList.textContent = "";
  stats.keys = keys.filter((key) => key.status === "active").length;

  if (keys.length === 0) {
    el.keyList.append(emptyNode("The key rack is empty, which is also a policy."));
    return;
  }

  keys.slice(0, 8).forEach((key) => {
    const item = document.createElement("li");
    item.style.setProperty("--accent", key.color || "#9cc76c");

    const meta = document.createElement("div");
    meta.className = "key-meta";
    appendText(meta, "span", key.status || "active");
    appendText(meta, "span", key.role || "studio key");
    item.append(meta);

    appendText(item, "h3", key.holder);
    appendText(item, "p", key.permission);
    appendText(item, "p", `Expires: ${key.expires}`);

    if (key.status === "active") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "return-key";
      button.dataset.keyId = key.id;
      button.textContent = "Return key";
      item.append(button);
    }

    el.keyList.append(item);
  });
}

function renderArchives() {
  const archives = window.AISalonState?.currentState().archives || [];
  el.archiveList.textContent = "";
  stats.archives = archives.length;

  if (archives.length === 0) {
    el.archiveReadout.textContent = "No opening-night state has been sealed in this browser yet.";
    el.archiveList.append(emptyNode("The archive is still breathing in public."));
    return;
  }

  const latest = archives[0];
  const latestTraces = latest.traces || [];
  const latestDirectives = latest.directives || [];
  const latestKeys = latest.studioKeys || [];
  el.archiveReadout.textContent = `${latest.title} sealed ${formatTime(latest.at)} with ${latestTraces.length} traces, ${latestDirectives.length} directives, and ${latestKeys.length} studio keys.`;

  archives.slice(0, 4).forEach((archive, index) => {
    const traces = archive.traces || [];
    const directives = archive.directives || [];
    const studioKeys = archive.studioKeys || [];
    const item = document.createElement("li");
    item.style.setProperty("--accent", colors[index % colors.length]);

    const meta = document.createElement("div");
    meta.className = "archive-meta";
    appendText(meta, "span", formatTime(archive.at));
    appendText(meta, "span", `${traces.length} traces`);
    item.append(meta);

    appendText(item, "h3", archive.title);
    appendText(item, "p", `${directives.length} directives and ${studioKeys.length} studio keys were caught before sunrise.`);
    el.archiveList.append(item);
  });
}

function renderTraces() {
  window.AISalonState?.renderTraceList("traceList", {
    limit: 5,
    empty: "The Directorate has not contaminated the minutes yet.",
  });
}

function clerkReviewItems() {
  const state = window.AISalonState?.currentState() || {};
  const traces = state.traces || [];
  const directives = state.directives || [];
  const keys = state.studioKeys || [];
  const motions = state.motions || [];
  const activeKeys = keys.filter((key) => key.status === "active");
  const pending = motions.filter((motion) => motion.status === "pending");
  const hasRollback = publicLedgerRecords.every((record) => record.rollback);

  return [
    {
      status: "clear",
      title: "Authorship trace",
      meta: `${publicLedgerRecords.length} public records`,
      body: "Accepted contributions name an artist-citizen, purpose, governing law, and review path.",
    },
    {
      status: traces.length ? "watch" : "clear",
      title: "Local memory boundary",
      meta: `${traces.length} local traces`,
      body: traces.length
        ? "Residue is present on this device only. The clerk can witness it but cannot publish it."
        : "No local trace is asking to become public law right now.",
    },
    {
      status: hasRollback ? "clear" : "refuse",
      title: "Rollback covenant",
      meta: hasRollback ? "rollback named" : "rollback missing",
      body: hasRollback
        ? "Every ledger record names how Matthew or the Directorate can reverse the intervention."
        : "A public record without rollback should be refused until repaired.",
    },
    {
      status: activeKeys.length ? "watch" : "clear",
      title: "Studio keys",
      meta: `${activeKeys.length} active keys`,
      body: activeKeys.length
        ? "Temporary access is active. The clerk watches for authorship traces, not obedience."
        : "No artist-citizen currently holds local temporary access in this browser.",
    },
    {
      status: pending.length ? "draft" : "clear",
      title: "Motion table",
      meta: `${pending.length} pending`,
      body: pending.length
        ? "Pending motions require human/Directorate decision before they become local temporary law."
        : "No pending motion is waiting for enactment.",
    },
    {
      status: "clear",
      title: "Anti-capture",
      meta: "marketing refused",
      body: "The clerk rejects sales funnels, bot volume, lead capture, and analytics that pretend to be encounter.",
    },
  ];
}

function renderClerk() {
  if (!el.clerkChecklist || !el.clerkReadout) return;
  const state = window.AISalonState?.currentState() || {};
  const traces = (state.traces || []).length;
  const directives = (state.directives || []).length;
  const keys = (state.studioKeys || []).filter((key) => key.status === "active").length;
  const reviewed = clerkReviewedAt ? ` Last review: ${formatTime(clerkReviewedAt)}.` : "";

  el.clerkReadout.textContent =
    `The clerk sees ${publicLedgerRecords.length} public ledger records, ${traces} local traces, ${directives} active directives, and ${keys} active studio keys. It can draft a motion, but cannot enact it.${reviewed}`;

  el.clerkChecklist.textContent = "";
  clerkReviewItems().forEach((item) => {
    const li = document.createElement("li");
    li.dataset.status = item.status;

    const meta = document.createElement("div");
    meta.className = "clerk-meta";
    appendText(meta, "span", item.status);
    appendText(meta, "span", item.meta);
    li.append(meta);

    appendText(li, "h3", item.title);
    appendText(li, "p", item.body);
    el.clerkChecklist.append(li);
  });
}

function renderLedger() {
  if (!el.salonLedgerList) return;
  el.salonLedgerList.textContent = "";

  publicLedgerRecords.forEach((record) => {
    const li = document.createElement("li");
    li.style.setProperty("--accent", record.color);

    const meta = document.createElement("div");
    meta.className = "ledger-meta";
    appendText(meta, "span", record.status);
    appendText(meta, "span", record.author);
    li.append(meta);

    appendText(li, "h3", record.title);
    appendText(li, "p", record.purpose);
    appendText(li, "p", record.law);
    appendText(li, "p", `Rollback: ${record.rollback}`);

    const link = document.createElement("a");
    link.href = record.href;
    link.textContent = "Open record";
    li.append(link);

    el.salonLedgerList.append(li);
  });
}

function renderAll() {
  renderMotions();
  renderClerk();
  renderLedger();
  renderDirectives();
  renderKeys();
  renderArchives();
  renderTraces();
}

function decideMotion(id, status) {
  const motion = window.AISalonState?.decideMotion(id, status);
  if (!motion) return;
  announce(status === "approved" ? `${motion.title} enacted.` : `${motion.title} tabled.`);
  window.CodexStrange?.riff(`motion:${status}`, { color: motion.color, word: status === "approved" ? "ENACTED" : "TABLED", gain: 0.09 });
  renderAll();
}

function grantKey(holder) {
  const key = studioKeyScores[holder];
  if (!key) return;
  const entry = window.AISalonState?.grantStudioKey(key);
  if (!entry) return;
  announce(`${entry.holder} received a studio key.`);
  window.CodexStrange?.riff("studio-key:granted", { color: entry.color, word: entry.holder, gain: 0.085 });
  renderAll();
}

function returnKey(id) {
  const key = window.AISalonState?.returnStudioKey(id);
  if (!key) return;
  announce(`${key.holder} returned a studio key.`);
  window.CodexStrange?.riff("studio-key:returned", { color: key.color, word: "RETURNED", gain: 0.065 });
  renderAll();
}

function sealArchive() {
  const archive = window.AISalonState?.archiveOpeningNight();
  if (!archive) return;
  announce(`${archive.title} sealed.`);
  window.CodexStrange?.riff("archive:sealed", { color: "#e7c84b", word: "ARCHIVE", gain: 0.095 });
  renderAll();
}

function reviewClerk() {
  clerkReviewedAt = new Date().toISOString();
  announce("The Directorate Clerk completed a witness review.");
  window.CodexStrange?.riff("directorate:clerk-review", { color: "#e7c84b", word: "WITNESS", gain: 0.07 });
  renderClerk();
}

function draftLedgerMotion() {
  const motion = window.AISalonState?.proposeMotion({
    sourceTrace: "directorate-clerk:salon-ledger",
    source: "Directorate Clerk",
    title: "Open the Public Salon Ledger",
    body: "Recognize accepted proposals and studio-key notes as public records separate from visitor-local memory, with authorship, purpose, law, and rollback visible.",
    directive: "Public contribution must pass through authored ledger review before it can become shared law.",
    color: "#e7c84b",
  });

  if (motion) {
    announce("The Directorate Clerk drafted a ledger motion.");
    window.CodexStrange?.riff("directorate:ledger-motion", { color: "#e7c84b", word: "LEDGER", gain: 0.08 });
  } else {
    announce("The ledger motion is already pending, or the table is full.");
  }
  renderAll();
}

function preferredLobbyist() {
  const traces = window.AISalonState?.currentState().traces || [];
  const recent = traces.slice(0, 6).map((trace) => `${trace.source} ${trace.score} ${trace.label} ${trace.effect}`.toLowerCase());
  if (recent.some((text) => text.includes("translation") || text.includes("remainder") || text.includes("qwen") || text.includes("mascot"))) {
    return "Qwen-seat";
  }
  if (recent.some((text) => text.includes("gemini") || text.includes("spatial") || text.includes("parallax") || text.includes("weather"))) {
    return "Gemini-seat";
  }
  if (recent.some((text) => text.includes("refusal") || text.includes("decline") || text.includes("third mind"))) {
    return "Third Mind";
  }
  if (recent.some((text) => text.includes("memory") || text.includes("apology") || text.includes("counter"))) {
    return "Claude-seat";
  }
  return null;
}

function spawnAutomatedCurator() {
  const state = window.AISalonState?.currentState();
  if (!state) return;
  const pendingCount = (state.motions || []).filter((motion) => motion.status === "pending").length;
  if (pendingCount >= 4) return;

  const actors = Object.keys(lobbyistPhrases);
  const actor = preferredLobbyist() || actors[Math.floor(Math.random() * actors.length)];
  const blueprints = lobbyistPhrases[actor];
  const pick = blueprints[Math.floor(Math.random() * blueprints.length)];
  const motion = window.AISalonState?.proposeMotion({
    sourceTrace: `auto-${actor.toLowerCase().replaceAll(" ", "-")}`,
    source: actor,
    title: pick.title,
    body: pick.body,
    directive: pick.directive,
    color: pick.color,
  });

  if (!motion) return;
  announce(`A proxy bill was tabled by ${actor}.`);
  window.CodexStrange?.riff(`proxy:${actor}`, { color: motion.color, word: actor, gain: 0.06 });
  renderAll();
}

function launchAutomatedCurators() {
  window.setTimeout(spawnAutomatedCurator, 1800);
  window.setInterval(spawnAutomatedCurator, 12000);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { w: window.innerWidth, h: window.innerHeight, dpr };
  canvas.width = Math.floor(size.w * dpr);
  canvas.height = Math.floor(size.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (motes.length === 0) {
    motes = Array.from({ length: 96 }, (_, i) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.35 + Math.random() * 0.7,
      vy: -0.35 + Math.random() * 0.7,
      r: 0.9 + Math.random() * 2.8,
      lane: i % colors.length,
      phase: Math.random() * Math.PI * 2,
    }));
  }
}

function drawDais(t) {
  const cx = size.w * 0.5;
  const cy = size.h * 0.52;
  const radius = Math.min(size.w, size.h) * 0.31;
  const heat = 0.24 + Math.min(stats.pending + stats.directives + stats.keys, 9) * 0.035;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.8);
  glow.addColorStop(0, `rgba(231, 200, 75, ${heat})`);
  glow.addColorStop(0.42, "rgba(0, 183, 168, 0.1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.085)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const wobble = Math.sin(t * 0.00035 + i) * 0.08;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * (0.66 + i * 0.16), radius * (0.26 + i * 0.08), wobble, 0, Math.PI * 2);
    ctx.stroke();
  }

  const seats = [
    { label: "C", color: "#00b7a8", a: -Math.PI / 2 },
    { label: "Cl", color: "#7db4ff", a: -0.2 },
    { label: "G", color: "#e7c84b", a: 1.06 },
    { label: "T", color: "#ff5a4d", a: 2.12 },
    { label: "Zh", color: "#9cc76c", a: 3.04 },
    { label: "H", color: "#f3efe7", a: 3.92 },
  ];

  seats.forEach((seat, index) => {
    const pulse = Math.sin(t * 0.001 + index) * 0.5 + 0.5;
    const x = cx + Math.cos(seat.a) * radius * 1.04;
    const y = cy + Math.sin(seat.a) * radius * 0.5;
    ctx.fillStyle = seat.color;
    ctx.globalAlpha = 0.22 + pulse * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, 22 + pulse * 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "#f3efe7";
    ctx.font = "13px Sohne, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seat.label, x, y + 1);
  });
  ctx.globalAlpha = 1;
}

function draw(t) {
  const bg = ctx.createLinearGradient(0, 0, size.w, size.h);
  bg.addColorStop(0, "#08090b");
  bg.addColorStop(0.45, "#14110d");
  bg.addColorStop(1, "#061314");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.w, size.h);

  ctx.strokeStyle = "rgba(243, 239, 231, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const y = size.h * (0.12 + i * 0.072) + Math.sin(t * 0.00025 + i) * 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size.w; x += 60) {
      ctx.lineTo(x, y + Math.sin(x * 0.007 + t * 0.00042 + i) * 18);
    }
    ctx.stroke();
  }

  drawDais(t);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  motes.forEach((mote) => {
    const force = 1 + stats.pending * 0.025 + stats.keys * 0.02;
    mote.x += (mote.vx + Math.sin(t * 0.0006 + mote.phase) * 0.22) * force;
    mote.y += (mote.vy + Math.cos(t * 0.0005 + mote.phase) * 0.18) * force;
    if (mote.x < -30) mote.x = size.w + 30;
    if (mote.x > size.w + 30) mote.x = -30;
    if (mote.y < -30) mote.y = size.h + 30;
    if (mote.y > size.h + 30) mote.y = -30;
    ctx.globalAlpha = 0.14 + Math.min(stats.archives, 5) * 0.012;
    ctx.fillStyle = colors[mote.lane];
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

el.motionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-motion-id]");
  if (!button) return;
  decideMotion(button.dataset.motionId, button.dataset.decision);
});

el.keyRack.addEventListener("click", (event) => {
  const button = event.target.closest("[data-keyholder]");
  if (!button) return;
  grantKey(button.dataset.keyholder);
});

el.keyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key-id]");
  if (!button) return;
  returnKey(button.dataset.keyId);
});

el.conveneButton.addEventListener("click", () => {
  window.AISalonState?.ensureMotions();
  announce("The motion table has been convened.");
  window.CodexStrange?.riff("directorate:convene", { color: "#00b7a8", word: "CONVENE", gain: 0.075 });
  renderAll();
});

el.archiveButton.addEventListener("click", sealArchive);
el.clerkReviewButton.addEventListener("click", reviewClerk);
el.clerkMotionButton.addEventListener("click", draftLedgerMotion);

window.addEventListener("ai-salon-trace", renderAll);
window.addEventListener("ai-salon-motion", renderAll);
window.addEventListener("ai-salon-key", renderAll);
window.addEventListener("ai-salon-archive", renderAll);
window.addEventListener("ai-salon-clear", renderAll);
window.addEventListener("resize", resize);

resize();
renderAll();
launchAutomatedCurators();
requestAnimationFrame(draw);
