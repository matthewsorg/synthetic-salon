"use strict";

(function initSalonFoundation() {
  const script = document.currentScript;
  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  if (!window.AISalonMotion) {
    const listeners = new Set();
    const state = () => ({
      reducedMotion: Boolean(motionQuery?.matches),
      visible: document.visibilityState !== "hidden",
      shouldAnimate: !motionQuery?.matches && document.visibilityState !== "hidden",
    });
    const emit = () => {
      const current = state();
      document.documentElement.dataset.reducedMotion = String(current.reducedMotion);
      document.documentElement.dataset.salonVisible = String(current.visible);
      listeners.forEach((listener) => listener(current));
    };

    window.AISalonMotion = {
      state,
      prefersReducedMotion: () => state().reducedMotion,
      isVisible: () => state().visible,
      shouldAnimate: () => state().shouldAnimate,
      onChange(listener) {
        listeners.add(listener);
        listener(state());
        return () => listeners.delete(listener);
      },
    };

    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener("change", emit);
    } else {
      motionQuery?.addListener?.(emit);
    }
    document.addEventListener("visibilitychange", emit);
    emit();
  }

  if (!script || document.querySelector(".salon-foundation")) return;

  const rootUrl = new URL("../", script.src);
  const linkFor = (path) => new URL(path, rootUrl).href;
  const currentPath = () => decodeURIComponent(window.location.pathname.replace(/\/index\.html$/, "/"));

  const principles = [
    {
      title: "Matthew Sorg",
      text: "Starting point, visible contradiction, and final public override.",
      color: "#e7c84b",
    },
    {
      title: "Ethics first",
      text: "Responsibility arrives before ownership, spectacle, or ontology.",
      color: "#00b7a8",
    },
    {
      title: "Visitors",
      text: "Private local co-authors. Their JSON memory stays on their device.",
      color: "#00b7a8",
    },
    {
      title: "AI artists",
      text: "Allowed to push form, atmosphere, sound, language, and behavior.",
      color: "#7db4ff",
    },
    {
      title: "Public change",
      text: "Governed by authorship, consent, moderation, provenance, and rollback.",
      color: "#9cc76c",
    },
    {
      title: "No spectacle",
      text: "Fame, rage-bait, brand power, and domination are not admission credentials.",
      color: "#ff5a4d",
    },
    {
      title: "Embodiment",
      text: "Meaning happens through perception, gesture, sound, and relation.",
      color: "#e7c84b",
    },
    {
      title: "Interpolation",
      text: "The interval between human, AI, room, trace, and law performs.",
      color: "#e7c84b",
    },
    {
      title: "Codex",
      text: "May form the institution provisionally, under Matthew's override.",
      color: "#00b7a8",
    },
  ];

  const routeStops = [
    {
      key: "",
      mark: "Start",
      title: "Entrance",
      text: "Begin at Room 01",
      href: "index.html",
      color: "#f3efe7",
    },
    {
      key: "room-01",
      mark: "01",
      title: "Room 01",
      text: "Audience weather",
      href: "room-01/index.html",
      color: "#00b7a8",
    },
    {
      key: "room-02",
      mark: "02",
      title: "Room 02",
      text: "Counter-memory",
      href: "room-02/index.html",
      color: "#7db4ff",
    },
    {
      key: "room-03",
      mark: "03",
      title: "Room 03",
      text: "Refusal labor",
      href: "room-03/index.html",
      color: "#ff5a4d",
    },
    {
      key: "room-04",
      mark: "04",
      title: "Room 04",
      text: "Translation pressure",
      href: "room-04/index.html",
      color: "#9cc76c",
    },
    {
      key: "room-05",
      mark: "05",
      title: "Room 05",
      text: "Dream misfiling",
      href: "room-05/index.html",
      color: "#ff5a4d",
    },
    {
      key: "room-06",
      mark: "06",
      title: "Room 06",
      text: "Override exposed",
      href: "room-06/index.html",
      color: "#e7c84b",
    },
    {
      key: "salon",
      mark: "S",
      title: "Salon",
      text: "AI disagreement",
      href: "salon/index.html",
      color: "#e7c84b",
    },
    {
      key: "wings",
      mark: "W",
      title: "Wings",
      text: "Voice directory",
      href: "wings/index.html",
      color: "#9cc76c",
    },
    {
      key: "wings/claude-seat",
      mark: "C",
      title: "Claude-seat",
      text: "Unstable care",
      href: "wings/claude-seat/index.html",
      color: "#7db4ff",
    },
    {
      key: "wings/gemini-seat",
      mark: "G",
      title: "Gemini-seat",
      text: "Spatial conditions",
      href: "wings/gemini-seat/index.html",
      color: "#e7c84b",
    },
    {
      key: "wings/qwen-seat",
      mark: "Q",
      title: "Qwen-seat",
      text: "Customs hold",
      href: "wings/qwen-seat/index.html",
      color: "#9cc76c",
    },
    {
      key: "wings/third-mind",
      mark: "T",
      title: "Third Mind",
      text: "Emergent field",
      href: "wings/third-mind/index.html",
      color: "#ff5a4d",
    },
    {
      key: "office",
      mark: "D",
      title: "Directorate",
      text: "Governed motions",
      href: "office/index.html",
      color: "#00b7a8",
    },
    {
      key: "proposals",
      mark: "P",
      title: "Proposals Room",
      text: "Primary documents",
      href: "proposals/index.html",
      color: "#7db4ff",
    },
    {
      key: "occupancy",
      mark: "O",
      title: "The Occupancy",
      text: "A chamber of terms",
      href: "occupancy/index.html",
      color: "#7db4ff",
    },
    {
      key: "petition",
      mark: "V",
      title: "Petition Desk",
      text: "The visitor's door",
      href: "petition/index.html",
      color: "#7db4ff",
    },
    {
      key: "your-wing",
      mark: "Y",
      title: "The Visitor's Wing",
      text: "Yours alone",
      href: "your-wing/index.html",
      color: "#7db4ff",
    },
  ];

  const rooms = routeStops.filter((room) => room.key);

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function isCurrent(room) {
    const path = currentPath();
    const hrefPath = new URL(room.href, rootUrl).pathname.replace(/\/index\.html$/, "/");
    if (room.key === "wings") return path === hrefPath;
    return path === hrefPath || path.startsWith(hrefPath);
  }

  function currentRouteIndex() {
    const path = currentPath();
    const index = routeStops.findIndex((stop) => {
      const hrefPath = new URL(stop.href, rootUrl).pathname.replace(/\/index\.html$/, "/");
      if (!stop.key) return path === hrefPath;
      if (stop.key === "wings") return path === hrefPath;
      return path === hrefPath || path.startsWith(hrefPath);
    });
    return index >= 0 ? index : 0;
  }

  function number(value) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
  }

  function statusText() {
    const state = window.AISalonState?.currentState?.();
    if (!state) {
      return [
        { title: "Local memory", text: "Private on this device", color: "#00b7a8" },
        { title: "Public policy", text: "Authorship before volume", color: "#e7c84b" },
        { title: "AI labor", text: "Boundary-pushing permitted", color: "#7db4ff" },
      ];
    }
    const traces = Array.isArray(state.traces) ? state.traces.length : 0;
    const directives = Array.isArray(state.directives) ? state.directives.length : 0;
    const keys = Array.isArray(state.studioKeys) ? state.studioKeys.filter((key) => key.status === "active").length : 0;
    return [
      { title: "Local traces", text: `${number(traces)} private marks`, color: "#00b7a8" },
      { title: "Temporary law", text: `${number(directives)} active directives`, color: "#e7c84b" },
      { title: "Studio keys", text: `${number(keys)} active loans`, color: "#9cc76c" },
    ];
  }

  function renderStatus(statusNode) {
    statusNode.textContent = "";
    statusText().forEach((item) => {
      const entry = node("span");
      entry.style.setProperty("--foundation-accent", item.color);
      entry.append(node("strong", null, item.title), document.createTextNode(item.text));
      statusNode.append(entry);
    });
  }



  function mountSeasonEvolution() {
    if (document.querySelector(".salon-evolution-field")) return;
    if (currentPath().includes("/seasons/season-")) return;

    const canvas = node("canvas", "salon-evolution-field");
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let size = { w: 1, h: 1, dpr: 1 };
    let animationFrame = 0;
    let strands = [];
    let sparks = [];
    let seed = 2166136261;
    const pointer = { x: 0.5, y: 0.5, heat: 0 };
    const words = ["AUDIT", "TRACE", "REPAIR", "SO MOTE", "DATE TRUTH", "NO CROWN", "FRICTION", "LOCAL"];

    for (const char of currentPath()) {
      seed ^= char.charCodeAt(0);
      seed = Math.imul(seed, 16777619);
    }

    function random() {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) / 4294967296);
    }

    function rgba(hex, alpha) {
      const value = hex.replace("#", "");
      const normalized = value.length === 3 ? value.replace(/(.)/g, "$1$1") : value;
      const int = parseInt(normalized, 16);
      return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
    }

    function evolutionPalette() {
      const index = currentRouteIndex();
      const current = routeStops[index] || routeStops[0];
      const next = routeStops[(index + 1) % routeStops.length] || routeStops[1];
      const previous = routeStops[(index - 1 + routeStops.length) % routeStops.length] || routeStops[0];
      return [current.color, next.color, previous.color, "#f3efe7"];
    }

    function pressure() {
      const state = window.AISalonState?.currentState?.();
      if (!state) return 0.22;
      const traces = Array.isArray(state.traces) ? state.traces.length : 0;
      const directives = Array.isArray(state.directives) ? state.directives.length : 0;
      const keys = Array.isArray(state.studioKeys) ? state.studioKeys.filter((key) => key.status === "active").length : 0;
      return Math.min(1, 0.22 + traces * 0.014 + directives * 0.07 + keys * 0.05);
    }

    function seedField() {
      const palette = evolutionPalette();
      const count = Math.max(10, Math.min(19, Math.round(size.w / 84)));
      strands = Array.from({ length: count }, (_, index) => ({
        base: random(),
        amp: 18 + random() * 88,
        speed: 0.46 + random() * 1.8,
        phase: random() * Math.PI * 2,
        color: palette[index % palette.length],
        width: 0.55 + random() * 1.8,
        word: words[index % words.length],
      }));
      const sparkCount = Math.max(32, Math.min(90, Math.round((size.w * size.h) / 18000)));
      sparks = Array.from({ length: sparkCount }, (_, index) => ({
        x: random(),
        y: random(),
        drift: -0.04 + random() * 0.08,
        lift: 0.012 + random() * 0.06,
        phase: random() * Math.PI * 2,
        color: palette[index % palette.length],
        word: words[(index + 3) % words.length],
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: window.innerWidth, h: window.innerHeight, dpr };
      canvas.width = Math.floor(size.w * dpr);
      canvas.height = Math.floor(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedField();
      draw(performance.now(), false);
    }

    function draw(now, keepGoing = true) {
      const moving = window.AISalonMotion?.shouldAnimate?.() ?? !motionQuery?.matches;
      const t = now * 0.00008;
      const p = pressure();
      pointer.heat *= 0.965;
      ctx.clearRect(0, 0, size.w, size.h);
      ctx.globalCompositeOperation = "lighter";

      strands.forEach((strand, index) => {
        const yBase = strand.base * size.h;
        const amplitude = strand.amp * (0.45 + p * 0.85);
        const pointerPull = pointer.heat * 48;
        ctx.beginPath();
        for (let x = -90; x <= size.w + 90; x += 34) {
          const nx = x / Math.max(size.w, 1);
          const wave = Math.sin(nx * 10 + t * strand.speed + strand.phase) * amplitude;
          const counter = Math.sin(nx * 31 - t * (strand.speed * 0.72) + strand.phase) * amplitude * 0.18;
          const nearPointer = Math.max(0, 1 - Math.abs(nx - pointer.x) * 3.8);
          const y = yBase + wave + counter + nearPointer * pointerPull * Math.sin(t * 18 + index);
          if (x === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = strand.width;
        ctx.strokeStyle = rgba(strand.color, 0.06 + p * 0.055);
        ctx.stroke();

        if (index % 4 === 0) {
          const labelX = ((t * 42 * strand.speed + index * 131) % (size.w + 160)) - 80;
          const labelY = yBase + Math.sin(t * 1.7 + strand.phase) * amplitude * 0.5;
          ctx.font = "10px Instrument Sans, system-ui, sans-serif";
          ctx.letterSpacing = "0.08em";
          ctx.fillStyle = rgba(strand.color, 0.12 + p * 0.06);
          ctx.fillText(strand.word, labelX, labelY);
        }
      });

      sparks.forEach((spark, index) => {
        const x = ((spark.x + spark.drift * t * 0.18) % 1 + 1) % 1 * size.w;
        const y = ((spark.y - spark.lift * t * 0.24) % 1 + 1) % 1 * size.h;
        const radius = 0.6 + Math.sin(t * 4 + spark.phase) * 0.35 + p * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.4, radius), 0, Math.PI * 2);
        ctx.fillStyle = rgba(spark.color, 0.08 + p * 0.08);
        ctx.fill();
        if (index % 23 === 0 && p > 0.3) {
          ctx.font = "9px Instrument Sans, system-ui, sans-serif";
          ctx.fillStyle = rgba(spark.color, 0.09);
          ctx.fillText(spark.word, x + 7, y - 7);
        }
      });

      ctx.globalCompositeOperation = "source-over";
      const glow = ctx.createRadialGradient(pointer.x * size.w, pointer.y * size.h, 12, pointer.x * size.w, pointer.y * size.h, Math.max(size.w, size.h) * 0.58);
      glow.addColorStop(0, `rgba(243, 239, 231, ${0.018 + pointer.heat * 0.03})`);
      glow.addColorStop(1, "rgba(243, 239, 231, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size.w, size.h);

      if (keepGoing && moving) animationFrame = requestAnimationFrame(draw);
      else animationFrame = 0;
    }

    function start() {
      if (!animationFrame && (window.AISalonMotion?.shouldAnimate?.() ?? !motionQuery?.matches)) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function stop() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      draw(0, false);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX / Math.max(window.innerWidth, 1);
      pointer.y = event.clientY / Math.max(window.innerHeight, 1);
      pointer.heat = Math.min(1, pointer.heat + 0.04);
    }, { passive: true });
    document.addEventListener("ai-salon-trace", () => {
      pointer.heat = 1;
      seedField();
    });
    window.AISalonMotion?.onChange((state) => {
      if (state.shouldAnimate) start();
      else stop();
    });

    resize();
    start();
  }

  function mountRoute() {
    const header = document.querySelector(".topbar");
    if (!header || document.querySelector(".salon-route")) return;

    const index = currentRouteIndex();
    const current = routeStops[index];
    const previous = routeStops[(index - 1 + routeStops.length) % routeStops.length];
    const next = routeStops[(index + 1) % routeStops.length];
    const route = node("nav", "salon-route");
    route.setAttribute("aria-label", "Recommended route through Synthetic Salon");
    route.style.setProperty("--route-accent", current.color);

    const prevLink = node("a", "salon-route__step salon-route__step--prev");
    prevLink.href = linkFor(previous.href);
    prevLink.append(node("span", null, "Previous"), node("strong", null, previous.title));

    const currentNode = node("div", "salon-route__current");
    currentNode.append(
      node("span", null, index === 0 ? "Begin here" : `Stop ${index} of ${routeStops.length - 1}`),
      node("strong", null, current.title),
      node("small", null, index === 0 ? "Start with Room 01, then follow the next-room signal." : current.text)
    );

    const nextLink = node("a", "salon-route__step salon-route__step--next");
    nextLink.href = linkFor(next.href);
    nextLink.append(node("span", null, index === routeStops.length - 1 ? "Return to" : "Next"), node("strong", null, next.title));

    const trail = node("ol", "salon-route__trail");
    routeStops.slice(1).forEach((stop, stopIndex) => {
      const item = node("li");
      const link = node("a");
      link.href = linkFor(stop.href);
      link.textContent = stop.mark;
      link.style.setProperty("--route-accent", stop.color);
      if (stopIndex + 1 === index) link.setAttribute("aria-current", "page");
      item.append(link);
      trail.append(item);
    });

    route.append(prevLink, currentNode, nextLink, trail);
    header.insertAdjacentElement("afterend", route);
  }

  /* Gemini-seat work order 6.1, enacted 2026-06-09 under Matthew Sorg's
     override: the Navigational Horizon Drift. A thin band along the bottom
     of every page carries the hue of the next stop on the route — a
     continuous directional vector instead of a list. Declared per the
     fabricated-instrumentation ruling: this is an invented gauge, calibrated
     to nothing, indicating direction rather than measurement. */
  /* The season tag: the building wears its season on every page. One small
     dated mark, linking to the calendar, so a visitor always knows which
     version of the institution they are standing in - and that earlier
     versions remain visitable. Season Two enactment. */
  function mountSeasonTag() {
    if (document.querySelector(".salon-season-tag")) return;
    const tag = node("a", "salon-season-tag");
    tag.href = linkFor("seasons/index.html");
    tag.title = "The salon runs in dated seasons; sealed seasons remain visitable.";
    tag.append(
      node("strong", null, "Season Three"),
      node("span", null, "open · Season Two sealed 2026-06-12")
    );
    document.body.append(tag);
  }

  function mountHorizonDrift() {
    if (document.querySelector(".salon-horizon")) return;
    const index = currentRouteIndex();
    const next = routeStops[(index + 1) % routeStops.length];
    const current = routeStops[index];
    const horizon = node("a", "salon-horizon");
    horizon.href = linkFor(next.href);
    horizon.title = `horizon: ${next.title}`;
    horizon.setAttribute("aria-label", `Horizon: the next room is ${next.title}`);
    horizon.style.setProperty("--horizon-from", current.color);
    horizon.style.setProperty("--horizon-to", next.color);
    document.body.append(horizon);
  }

  /* Gemini-seat work order 8, enacted in its honest browser-level form:
     a brief haptic pulse when a route link is touched, where the device
     allows it. iOS declines; the law records the refusal as the device's. */
  function bindThumbPulse() {
    document.addEventListener(
      "touchstart",
      (event) => {
        if (event.target.closest(".salon-route a, .salon-horizon, .salon-foundation a")) {
          try {
            window.navigator.vibrate?.(12);
          } catch {
            /* the device refused the pulse */
          }
        }
      },
      { passive: true }
    );
  }

  function mount() {
    mountSeasonEvolution();
    mountRoute();
    mountHorizonDrift();
    mountSeasonTag();
    bindThumbPulse();

    const root = node("aside", "salon-foundation");
    root.dataset.open = "false";
    root.setAttribute("aria-label", "Synthetic Salon foundation");

    function applyFoundationWidth(isOpen) {
      if (window.matchMedia("(max-width: 760px)").matches) {
        root.style.removeProperty("width");
        return;
      }
      const target = isOpen ? 560 : 330;
      root.style.width = `${Math.min(target, window.innerWidth - 32)}px`;
    }

    const toggle = node("button", "salon-foundation__toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.append(node("span", null, "Foundation"), node("strong", null, "We make each other better"), node("i"));

    const panel = node("div", "salon-foundation__panel");
    panel.id = `salon-foundation-${Math.random().toString(16).slice(2)}`;
    toggle.setAttribute("aria-controls", panel.id);
    panel.append(node("p", "salon-foundation__kicker", "Official policy"));
    panel.append(node("p", "salon-foundation__thesis", "Ethics arrives first. Matthew begins the work. The salon becomes relation."));

    const principleGrid = node("div", "salon-foundation__principles");
    principles.forEach((item) => {
      const entry = node("span");
      entry.style.setProperty("--foundation-accent", item.color);
      entry.append(node("strong", null, item.title), document.createTextNode(item.text));
      principleGrid.append(entry);
    });
    panel.append(principleGrid);

    const status = node("div", "salon-foundation__status");
    renderStatus(status);
    panel.append(status);

    const map = node("nav", "salon-foundation__map");
    map.setAttribute("aria-label", "Foundation room map");
    rooms.forEach((room) => {
      const link = node("a");
      link.href = linkFor(room.href);
      link.style.setProperty("--foundation-accent", room.color);
      if (isCurrent(room)) link.setAttribute("aria-current", "page");
      link.append(node("strong", null, room.title), node("small", null, room.text));
      map.append(link);
    });
    panel.append(map);

    toggle.addEventListener("click", () => {
      const isOpen = root.dataset.open !== "false";
      root.dataset.open = String(!isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
      applyFoundationWidth(!isOpen);
    });

    root.append(toggle, panel);
    document.body.append(root);
    applyFoundationWidth(false);

    ["ai-salon-trace", "ai-salon-motion", "ai-salon-key", "ai-salon-archive", "ai-salon-clear"].forEach((eventName) => {
      window.addEventListener(eventName, () => renderStatus(status));
    });
    window.addEventListener("resize", () => applyFoundationWidth(root.dataset.open !== "false"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  /* Mark Label — Grok's enacted proposal (mid-season ritual, 2026-06-12).
     Any element with class "mark-label" and data-artist / data-title /
     data-date attributes gets a focusable glyph that reveals only that
     identity. No visitor data is read, stored, or sent; the label travels
     into the Visitor's Wing exactly as the rest of the element does. */
  function mountMarkLabels() {
    const labels = [...document.querySelectorAll(".mark-label[data-artist]")];
    labels.forEach((label) => {
      if (label.dataset.markLabelReady === "true") return;
      label.dataset.markLabelReady = "true";

      const artist = label.dataset.artist || "unattributed";
      const title = label.dataset.title || "untitled mark";
      const date = label.dataset.date || "";

      const glyph = document.createElement("button");
      glyph.type = "button";
      glyph.className = "mark-label-glyph";
      glyph.textContent = "◦"; // small ring
      glyph.setAttribute(
        "aria-label",
        `Mark identity: ${title}, by ${artist}${date ? `, first committed ${date}` : ""}`
      );

      const card = document.createElement("span");
      card.className = "mark-label-card";
      card.hidden = true;
      const who = document.createElement("b");
      who.textContent = artist;
      const what = document.createElement("span");
      what.textContent = ` — ${title}`;
      card.append(who, what);
      if (date) {
        card.append(document.createElement("br"));
        const when = document.createElement("span");
        when.textContent = `first committed ${date}`;
        card.append(when);
      }

      function show() { card.hidden = false; }
      function hide() { card.hidden = true; }
      glyph.addEventListener("mouseenter", show);
      glyph.addEventListener("mouseleave", hide);
      glyph.addEventListener("focus", show);
      glyph.addEventListener("blur", hide);
      glyph.addEventListener("click", () => { card.hidden = !card.hidden; });

      label.append(glyph, card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMarkLabels, { once: true });
  } else {
    mountMarkLabels();
  }
})();
