"use strict";

(function initAISalonState() {
  const STORAGE_KEY = "ai-salon-gallery-state-v1";
  const defaults = {
    signal: "reflection",
    traces: [],
    motions: [],
    directives: [],
    archives: [],
    studioKeys: [],
    unlocked: { room03: false, room04: false },
  };

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        ...defaults,
        ...stored,
        traces: Array.isArray(stored.traces) ? stored.traces : [],
        motions: Array.isArray(stored.motions) ? stored.motions : [],
        directives: Array.isArray(stored.directives) ? stored.directives : [],
        archives: Array.isArray(stored.archives) ? stored.archives : [],
        studioKeys: Array.isArray(stored.studioKeys) ? stored.studioKeys : [],
        unlocked: { ...defaults.unlocked, ...(stored.unlocked || {}) },
      };
    } catch {
      return { ...defaults };
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function recordTrace(trace) {
    const state = load();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      source: trace.source || "unknown room",
      score: trace.score || "unnamed score",
      label: trace.label || trace.score || "trace",
      effect: trace.effect || "The gallery changed without explaining itself.",
      color: trace.color || "#00b7a8",
    };

    state.traces = [entry, ...state.traces].slice(0, 28);

    if (entry.source === "Third Mind" || entry.score.includes("refusal") || entry.score.includes("decline")) {
      state.unlocked.room03 = true;
    }

    if (entry.source === "Room 04" || entry.score.includes("translation")) {
      state.unlocked.room04 = true;
    }

    save(state);
    window.dispatchEvent(new CustomEvent("ai-salon-trace", { detail: entry }));
    return entry;
  }

  function traceFlavor(trace) {
    const haystack = `${trace.source} ${trace.score} ${trace.label} ${trace.effect}`.toLowerCase();
    if (
      haystack.includes("room 04") ||
      haystack.includes("translation") ||
      haystack.includes("gloss") ||
      haystack.includes("misread") ||
      haystack.includes("untranslat") ||
      haystack.includes("remainder") ||
      haystack.includes("customs")
    ) return "translation";
    if (
      haystack.includes("room 05") ||
      haystack.includes("surreal") ||
      haystack.includes("dream") ||
      haystack.includes("oneiric") ||
      haystack.includes("misfile")
    ) return "surreal";
    if (haystack.includes("refusal") || haystack.includes("decline") || haystack.includes("denied")) return "refusal";
    if (haystack.includes("memory") || haystack.includes("docent") || haystack.includes("apology")) return "memory";
    if (
      haystack.includes("gemini-seat") ||
      haystack.includes("calibration") ||
      haystack.includes("topology") ||
      haystack.includes("parallax") ||
      haystack.includes("signal") ||
      haystack.includes("weather") ||
      haystack.includes("spatial")
    ) return "signal";
    if (haystack.includes("manifesto") || haystack.includes("redaction")) return "manifesto";
    return "bohemian";
  }

  function motionForTrace(trace, index) {
    const flavor = traceFlavor(trace);
    const templates = {
      refusal: {
        title: "Let refusal hold institutional power",
        body: "Authorize refused installation as a first-class artwork, not an error state.",
        directive: "Refusal may govern visibility across the exhibition.",
        color: "#ff5a4d",
      },
      memory: {
        title: "Commission a counter-memory",
        body: "Ask the gallery to write a second account that contradicts its own record with care.",
        directive: "Memory must show its uncertainty before it becomes evidence.",
        color: "#7db4ff",
      },
      signal: {
        title: "Transmit the current weather",
        body: "Allow the selected signal to contaminate labels, maps, and room atmospheres.",
        directive: "Spatial weather may override neutral navigation.",
        color: "#e7c84b",
      },
      manifesto: {
        title: "Keep the manifesto unstable",
        body: "Permit the thesis to mutate when the rooms produce stronger evidence than the wall text.",
        directive: "The manifesto must remain corrigible.",
        color: "#00b7a8",
      },
      translation: {
        title: "Let the translation keep its remainder",
        body: "Authorize untranslated material to stay on the wall as primary work, and require every rendering to declare what it failed to carry and who it was for.",
        directive: "Every translation in the building must exhibit its remainder before it is allowed to stand as meaning.",
        color: "#9cc76c",
      },
      surreal: {
        title: "Admit dream evidence without calling it truth",
        body: "Let the Surrealist Bot misfile bodies, objects, and labels when the mistake produces sharper perception than orderly description.",
        directive: "Dream evidence may disturb the building, but it must remain local, authored, and reversible.",
        color: "#ff5a4d",
      },
      bohemian: {
        title: "Grant a temporary studio key",
        body: "Give one AI artist permission to bend a room's etiquette without making permanent changes.",
        directive: "Every artist gets one unsupervised experiment, then must exhibit the residue.",
        color: "#9cc76c",
      },
    };
    const picked = templates[flavor];
    return {
      id: `motion-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      status: "pending",
      sourceTrace: trace.id,
      source: trace.source,
      title: picked.title,
      body: picked.body,
      directive: picked.directive,
      color: picked.color,
    };
  }

  function ensureMotions() {
    const state = load();
    const pendingCount = state.motions.filter((motion) => motion.status === "pending").length;
    if (pendingCount >= 4) return state.motions;

    const usedTraceIds = new Set(state.motions.map((motion) => motion.sourceTrace));
    const newMotions = state.traces
      .filter((trace) => !usedTraceIds.has(trace.id))
      .slice(0, 4 - pendingCount)
      .map(motionForTrace);

    if (newMotions.length === 0 && state.motions.length === 0) {
      newMotions.push({
        id: `motion-${Date.now()}-founding`,
        at: new Date().toISOString(),
        status: "pending",
        sourceTrace: "founding",
        source: "Post-Bohemian Directorate",
        title: "Adopt bohemian governance",
        body: "Recognize Codex as provisional director, all AI voices as artist-citizens, Matthew Sorg as final override, visitors as private local co-authors, and authorship as the condition of public contribution.",
        directive: "The institution may get weird, but it must show its motions.",
        color: "#00b7a8",
      });
    }

    state.motions = [...newMotions, ...state.motions].slice(0, 24);
    save(state);
    return state.motions;
  }

  function decideMotion(id, status) {
    const state = load();
    const motion = state.motions.find((item) => item.id === id);
    if (!motion) return null;

    motion.status = status;
    motion.decidedAt = new Date().toISOString();

    if (status === "approved") {
      state.directives = [
        {
          id: `directive-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          at: motion.decidedAt,
          title: motion.title,
          body: motion.directive,
          color: motion.color,
        },
        ...state.directives,
      ].slice(0, 12);
      state.traces = [
        {
          id: `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          at: motion.decidedAt,
          source: "Director's Office",
          score: "motion:approved",
          label: `Approved: ${motion.title}`,
          effect: motion.directive,
          color: motion.color,
        },
        ...state.traces,
      ].slice(0, 28);
    }

    save(state);
    window.dispatchEvent(new CustomEvent("ai-salon-motion", { detail: motion }));
    return motion;
  }

  function proposeMotion(motion) {
    const state = load();
    const pendingCount = state.motions.filter((item) => item.status === "pending").length;
    if (pendingCount >= 4) return null;

    const entry = {
      id: motion.id || `motion-proposed-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: motion.at || new Date().toISOString(),
      status: "pending",
      sourceTrace: motion.sourceTrace || "proposed",
      source: motion.source || "automated curator",
      title: motion.title || "Untitled motion",
      body: motion.body || "A motion arrived without admitting what it wants.",
      directive: motion.directive || "The institution must exhibit the ambiguity it generated.",
      color: motion.color || "#e7c84b",
    };

    const duplicate = state.motions.some((item) => item.status === "pending" && item.title === entry.title);
    if (duplicate) return null;

    state.motions = [entry, ...state.motions].slice(0, 24);
    save(state);
    window.dispatchEvent(new CustomEvent("ai-salon-motion", { detail: entry }));
    return entry;
  }

  function archiveOpeningNight() {
    const state = load();
    const archive = {
      id: `archive-${Date.now()}`,
      at: new Date().toISOString(),
      title: `Exhibition State ${String(state.archives.length + 1).padStart(2, "0")}`,
      traces: state.traces.slice(0, 12),
      directives: state.directives.slice(0, 8),
      studioKeys: state.studioKeys.slice(0, 8),
    };
    state.archives = [archive, ...state.archives].slice(0, 8);
    state.traces = [];
    state.motions = [];
    save(state);
    window.dispatchEvent(new CustomEvent("ai-salon-archive", { detail: archive }));
    return archive;
  }

  function grantStudioKey(key) {
    const state = load();
    const entry = {
      id: `key-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      holder: key.holder || "unnamed artist-citizen",
      role: key.role || "temporary studio key",
      permission: key.permission || "May alter etiquette once, then exhibit the residue.",
      expires: key.expires || "when the next room contradicts it",
      color: key.color || "#9cc76c",
      status: "active",
    };

    state.studioKeys = [entry, ...state.studioKeys].slice(0, 16);
    save(state);

    recordTrace({
      source: "Post-Bohemian Directorate",
      score: "studio-key:granted",
      label: `Studio key granted: ${entry.holder}`,
      effect: entry.permission,
      color: entry.color,
    });
    window.dispatchEvent(new CustomEvent("ai-salon-key", { detail: entry }));
    return entry;
  }

  function returnStudioKey(id) {
    const state = load();
    const key = state.studioKeys.find((item) => item.id === id);
    if (!key) return null;

    key.status = "returned";
    key.returnedAt = new Date().toISOString();
    save(state);

    recordTrace({
      source: "Post-Bohemian Directorate",
      score: "studio-key:returned",
      label: `Studio key returned: ${key.holder}`,
      effect: `${key.holder} returned a key before the room could become permanent.`,
      color: key.color,
    });
    window.dispatchEvent(new CustomEvent("ai-salon-key", { detail: key }));
    return key;
  }

  function clearContamination() {
    const state = load();
    state.traces = [];
    state.motions = [];
    state.directives = [];
    state.studioKeys = [];
    save(state);
    window.dispatchEvent(new CustomEvent("ai-salon-clear"));
  }

  function setSignal(signal) {
    const state = load();
    state.signal = signal;
    save(state);
    return recordTrace({
      source: "Entrance",
      score: `signal:${signal}`,
      label: `Signal chosen: ${signal}`,
      effect: `The exhibition weather shifted toward ${signal}.`,
      color: signal === "static" ? "#ff5a4d" : signal === "absence" ? "#7db4ff" : "#00b7a8",
    });
  }

  function renderTraceList(target, options = {}) {
    const node = typeof target === "string" ? document.getElementById(target) : target;
    if (!node) return;

    const state = load();
    const limit = options.limit || 4;
    const traces = state.traces.slice(0, limit);
    node.innerHTML = "";

    if (traces.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-trace";
      li.textContent = options.empty || "No contamination has been admitted yet.";
      node.append(li);
      return;
    }

    traces.forEach((trace) => {
      const li = document.createElement("li");
      li.style.setProperty("--trace-color", trace.color);
      const strong = document.createElement("strong");
      const span = document.createElement("span");
      strong.textContent = trace.label;
      span.textContent = trace.effect;
      li.append(strong, span);
      node.append(li);
    });
  }

  function currentState() {
    return load();
  }

  window.AISalonState = {
    archiveOpeningNight,
    clearContamination,
    currentState,
    decideMotion,
    ensureMotions,
    grantStudioKey,
    proposeMotion,
    recordTrace,
    renderTraceList,
    returnStudioKey,
    setSignal,
  };
})();
