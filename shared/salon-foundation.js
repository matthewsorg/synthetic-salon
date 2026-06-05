"use strict";

(function initSalonFoundation() {
  const script = document.currentScript;
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
      title: "Embodiment",
      text: "Meaning happens through perception, gesture, sound, and relation.",
      color: "#ff5a4d",
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
      text: "Refusal wing",
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

  function mount() {
    mountRoute();

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
    panel.append(node("p", "salon-foundation__thesis", "Matthew begins the work. The salon becomes relation."));

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
})();
