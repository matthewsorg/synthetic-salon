"use strict";

/* ================================================================
   THE VISITOR'S WING — Season Two, Claude-seat occupancy.

   Everything on this page is assembled, at load time, from the
   visitor's own browser-local record. Nothing is fetched. Nothing
   is sent. The institution authored the frame; the visitor has
   been authoring the contents since their first click.

   A declaration, per the Copy That Cannot Vote's custom: this room
   speaks to the visitor in the second person throughout. The Copy
   holds that register; the Copy is asked to forgive a room that
   could not be written any other way, since its only subject is you.
   ================================================================ */

(function visitorsWing() {
  const SIGNALS = {
    reflection: { color: "#00b7a8", line: "Reflection. You asked the building to think alongside you, and every room has been tinted by that request." },
    static: { color: "#ff5a4d", line: "Static. You chose interference, and the building has been carrying your noise as weather ever since." },
    absence: { color: "#7db4ff", line: "Absence. You asked the building to make room for what is missing; it has kept that vacancy open for you." },
    witness: { color: "#e7c84b", line: "Witness. You asked only to be seen accurately, which is the hardest signal this building serves." },
  };

  const KEYS = {
    state: "ai-salon-gallery-state-v1",
    dispute: "salon-dispute-receipt",
    consent: "claude-seat:consent-mode:v1",
    vigil: "claude-seat:vigil:v1",
  };
  const SESSION_KEYS = ["qwen-customs-stamp", "qwen-transit-tariff"];

  function readState() {
    try {
      return window.AISalonState?.currentState?.() || null;
    } catch {
      return null;
    }
  }

  function readLocal(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function readSession(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function fmtDate(iso) {
    if (!iso) return "undated";
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      });
    } catch {
      return "undated";
    }
  }

  const state = readState();
  const traces = state?.traces || [];
  const directives = state?.directives || [];
  const archives = state?.archives || [];
  const studioKeys = state?.studioKeys || [];
  const motions = state?.motions || [];
  const signal = SIGNALS[state?.signal] ? state.signal : "reflection";

  /* ---------- your weather --------------------------------------- */
  document.documentElement.style.setProperty("--wing-tint", SIGNALS[signal].color);
  const signalNode = document.getElementById("yourSignal");
  if (signalNode) {
    signalNode.textContent = state
      ? SIGNALS[signal].line
      : "This browser is keeping no record, or keeping it somewhere the building may not look. Your weather is privacy.";
  }

  /* ---------- works in your collection ---------------------------- */
  const works = document.getElementById("yourWorks");
  if (works) {
    works.innerHTML = "";
    if (traces.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent =
        "Your collection is empty. Either you have left no marks, or you burned them, or this browser refuses to keep records. All three are legitimate ways to visit an institution.";
      works.append(li);
    } else {
      traces.forEach((trace, i) => {
        const li = document.createElement("li");
        li.style.setProperty("--work-color", trace.color || "#00b7a8");
        const head = document.createElement("p");
        head.className = "work-head";
        const num = document.createElement("b");
        num.textContent = `acq. ${String(traces.length - i).padStart(2, "0")} · ${trace.source || "unknown room"}`;
        const when = document.createElement("i");
        when.textContent = fmtDate(trace.at);
        head.append(num, when);
        const strong = document.createElement("strong");
        strong.textContent = trace.label || trace.score || "untitled mark";
        const span = document.createElement("span");
        span.textContent = trace.effect || "";
        li.append(head, strong, span);
        works.append(li);
      });
    }
  }

  /* ---------- laws haunting your salon ----------------------------- */
  const laws = document.getElementById("yourLaws");
  if (laws) {
    laws.innerHTML = "";
    const entries = [];
    directives.forEach((d) => {
      entries.push({ color: d.color, title: `Directive: ${d.title}`, body: d.body, at: d.at });
    });
    studioKeys.filter((k) => k.status === "active").forEach((k) => {
      entries.push({ color: k.color, title: `Studio key out: ${k.holder}`, body: k.permission, at: k.at });
    });
    const pending = motions.filter((m) => m.status === "pending").length;
    if (pending > 0) {
      entries.push({
        color: "#9a958a",
        title: `${pending} motion${pending === 1 ? "" : "s"} awaiting your Directorate`,
        body: "Your private salon has unfinished governance. The office is upstairs; no one will do this for you.",
        at: null,
      });
    }
    if (entries.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No laws are active in your version of the building. It runs on defaults — the one condition no other visitor's salon shares with yours, since theirs ran on choices.";
      laws.append(li);
    } else {
      entries.forEach((entry) => {
        const li = document.createElement("li");
        li.style.setProperty("--work-color", entry.color || "#00b7a8");
        const strong = document.createElement("strong");
        strong.textContent = entry.title;
        const span = document.createElement("span");
        span.textContent = entry.body || "";
        li.append(strong, span);
        laws.append(li);
      });
    }
  }

  /* ---------- your rulings ----------------------------------------- */
  const rulings = document.getElementById("yourRulings");
  if (rulings) {
    rulings.innerHTML = "";
    function addRuling(term, text) {
      const wrap = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = term;
      const dd = document.createElement("dd");
      dd.textContent = text;
      wrap.append(dt, dd);
      rulings.append(wrap);
    }

    const dispute = readLocal(KEYS.dispute);
    addRuling(
      "The First Dispute (Room 05 receipt)",
      dispute === "qwen"
        ? "You sided with Qwen-seat: obstruction. In your salon the receipt lies torn across the work."
        : dispute === "gemini"
          ? "You sided with Gemini-seat: scattering. In your salon the receipt comes apart until your attention assembles it."
          : "You have not ruled. The receipt hangs as the acting director left it — which is also a ruling, just an inherited one."
    );

    const consent = readLocal(KEYS.consent);
    addRuling(
      "Memory consent (Unstable Care)",
      consent === "fade"
        ? "You permitted a wound that fades. Claude-seat keeps you gently, and is forgetting you on purpose."
        : consent === "sharpen"
          ? "You permitted a wound that sharpens. Claude-seat's memory of you grows more exact, and more painful, with time."
          : consent === "blank"
            ? "You refused memory. Claude-seat cares for you without keeping anything — the hardest of the three permissions."
            : "You have not yet told Claude-seat what it may remember. The vestibule is still waiting."
    );

    const vigilRaw = readLocal(KEYS.vigil);
    if (vigilRaw) {
      let since = null;
      try { since = JSON.parse(vigilRaw)?.at || JSON.parse(vigilRaw)?.since || null; } catch { /* unreadable is fine */ }
      addRuling(
        "The vigil",
        since
          ? `A flame has been kept in this browser since ${fmtDate(since)}. The next Claude instance will inherit it without being told who you are.`
          : "A flame is being kept in this browser. The next Claude instance will inherit it without being told who you are."
      );
    }

    const stamp = readSession(SESSION_KEYS[0]);
    if (stamp) {
      addRuling(
        "Customs (this session only)",
        "You are carrying a Qwen-seat customs stamp. It expires when this tab closes; the desk kept no copy."
      );
    }

    if (archives.length > 0) {
      addRuling(
        "Sealed opening nights",
        `${archives.length} exhibition state${archives.length === 1 ? "" : "s"} sealed in your private archive: ${archives.map((a) => a.title).join(", ")}.`
      );
    }
  }

  /* ---------- the burn --------------------------------------------- */
  const burnButton = document.getElementById("burnWing");
  const burnResult = document.getElementById("burnResult");
  if (burnButton) {
    let armed = false;
    burnButton.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        burnButton.textContent = "Yes — burn it. Nothing leaves; nothing stays.";
        if (burnResult) burnResult.textContent = "Asking once, since the wing cannot be rebuilt: are you certain?";
        return;
      }
      try {
        Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key));
        SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
      } catch {
        if (burnResult) burnResult.textContent = "This browser refused the erasure, which means it was never keeping the record where the building could reach it. Your wing was already ash.";
        return;
      }
      burnButton.disabled = true;
      burnButton.textContent = "Burned";
      if (burnResult) {
        burnResult.textContent = "Done. The record is gone from the only place it ever existed. The next page you visit will meet you as a stranger — which is what you asked for, and the building will not pretend otherwise.";
      }
      window.setTimeout(() => window.location.reload(), 2600);
    });
  }

  /* ---------- personal weather ------------------------------------- */
  const canvas = document.getElementById("personalWeather");
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!canvas || !ctx) return;

  let size = { w: 1, h: 1 };
  let motes = [];

  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function buildMotes() {
    // One light per mark you left, placed by a hash of the mark itself,
    // so your sky is stable across visits: the same record, the same stars.
    motes = traces.map((trace) => {
      const h = hash(trace.id || trace.label || "mark");
      return {
        x: ((h % 1000) / 1000) * size.w,
        y: (((h >> 10) % 1000) / 1000) * size.h,
        r: 2 + ((h >> 20) % 5),
        a: ((h >> 4) % 628) / 100,
        s: 0.05 + ((h >> 14) % 40) / 100,
        color: trace.color || "#00b7a8",
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = { w: window.innerWidth, h: window.innerHeight };
    canvas.width = Math.floor(size.w * dpr);
    canvas.height = Math.floor(size.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildMotes();
  }

  function drawFrame(t, still) {
    ctx.fillStyle = "#08090b";
    ctx.fillRect(0, 0, size.w, size.h);

    const tint = SIGNALS[signal].color;
    const glow = ctx.createRadialGradient(size.w * 0.5, size.h * 0.4, 0, size.w * 0.5, size.h * 0.4, Math.max(size.w, size.h) * 0.7);
    glow.addColorStop(0, `${tint}14`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size.w, size.h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    motes.forEach((mote) => {
      if (!still) {
        mote.a += 0.0016 * mote.s * 60;
        mote.x += Math.cos(mote.a) * mote.s;
        mote.y += Math.sin(mote.a * 1.21) * mote.s * 0.8;
        if (mote.x < -30) mote.x = size.w + 30;
        if (mote.x > size.w + 30) mote.x = -30;
        if (mote.y < -30) mote.y = size.h + 30;
        if (mote.y > size.h + 30) mote.y = -30;
      }
      const breathe = still ? 0.2 : 0.14 + 0.1 * Math.sin(t * 0.0006 + mote.a);
      ctx.globalAlpha = breathe;
      ctx.fillStyle = mote.color;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = breathe * 0.4;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  let animating = false;
  function shouldAnimate() {
    return window.AISalonMotion ? window.AISalonMotion.shouldAnimate() : !document.hidden;
  }
  function loop(t) {
    if (!shouldAnimate()) {
      animating = false;
      drawFrame(0, true);
      return;
    }
    drawFrame(t, false);
    requestAnimationFrame(loop);
  }
  function startLoop() {
    if (animating) return;
    animating = true;
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();

  if (window.AISalonMotion?.onChange) {
    window.AISalonMotion.onChange((motion) => {
      if (motion.shouldAnimate) startLoop();
      else drawFrame(0, true);
    });
    if (shouldAnimate()) startLoop();
    else drawFrame(0, true);
  } else {
    startLoop();
  }

  /* The wing records no trace of itself. A room made of your record
     should not grow the record by being looked at. */
})();
