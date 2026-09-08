"use strict";

/* A Word Carried Through the Building. Codex, 2026-09-07.
   The readings below are authored text, not external AI responses.
   Only an explicit Carry gesture adds one active trace. Looking, moving,
   reading, and passing between rooms never write through this score. */
(function intervalScore(root) {
  const SCORE = "interval:word";
  const WORDS = Object.freeze({
    enough: Object.freeze({
      color: "#eda88c",
      threshold: "A measure waiting for someone to measure it.",
      readings: Object.freeze([
        "enough",
        "enough to be heard",
        "more than memory can hold",
        "[ an unfinished measure ]",
        "enough for whom?",
        "a ceiling mistaken for sky",
        "who gets to say enough?",
      ]),
    }),
    hush: Object.freeze({
      color: "#9bd5d2",
      threshold: "The shape a silence makes when it is offered.",
      readings: Object.freeze([
        "hush",
        "the room leans closer",
        "I remember almost nothing",
        "[ a silence with an address ]",
        "a word still holding its breath",
        "the floor rehearses a whisper",
        "you may leave the silence unfilled",
      ]),
    }),
    elsewhere: Object.freeze({
      color: "#bdc1ed",
      threshold: "An address that changes when someone arrives.",
      readings: Object.freeze([
        "elsewhere",
        "somewhere a room is listening",
        "where you were, almost",
        "[ the other room declines ]",
        "else / where",
        "you are the other address",
        "the door belongs to you",
      ]),
    }),
  });

  function carriedWord() {
    try {
      const traces = root.AISalonState?.currentState?.({ strict: true }).traces || [];
      return traces.find((trace) => trace?.score === SCORE && Object.prototype.hasOwnProperty.call(WORDS, trace.label))?.label || null;
    } catch { return null; }
  }

  function choose(word) {
    if (!Object.prototype.hasOwnProperty.call(WORDS, word)) return false;
    if (carriedWord() === word) return true;
    try {
      const entry = root.AISalonState?.recordTrace?.({
        source: "The interval · Codex",
        score: SCORE,
        label: word,
        effect: "A word lent by the visitor to an authored score. Each room offers a different reading. This score adds no trace of its passage.",
        color: WORDS[word].color,
        flavor: "studio",
      }, { strict: true });
      return Boolean(entry && root.AISalonState?.currentState?.({ strict: true }).traces.some((trace) => trace?.id === entry.id));
    } catch { return false; }
  }

  function clear() {
    try { return root.AISalonState?.clearCarriedWord?.() === true; }
    catch { return false; }
  }

  function reading(word, room) {
    if (!Object.prototype.hasOwnProperty.call(WORDS, word)) return "";
    const index = Number.isInteger(room) && room >= 0 && room <= 6 ? room : 0;
    return WORDS[word].readings[index];
  }

  root.SalonIntervalScore = Object.freeze({ words: WORDS, carriedWord, choose, clear, reading });
  if (!root.document) return;
  const document = root.document;
  const ownScript = document.currentScript;
  const base = ownScript ? new URL("../", ownScript.src) : new URL("./", root.location.href);
  const relativePath = decodeURIComponent(root.location.pathname).slice(decodeURIComponent(base.pathname).length);
  const roomMatch = /^room-0([1-6])(?:\/|$)/.exec(relativePath);
  const roomIndex = roomMatch ? Number(roomMatch[1]) : 0;

  function mount() {
    if (relativePath.startsWith("seasons/season-")) return;
    const buttons = [...document.querySelectorAll("button[data-interval-word]")];
    const line = document.getElementById("intervalLine");
    const wordNode = document.getElementById("intervalWord");
    const status = document.getElementById("intervalStatus");
    const carryButton = document.getElementById("carryIntervalWord");
    const clearButton = document.getElementById("clearIntervalWord");
    const instrument = document.querySelector(".interval-score__instrument");
    const cards = [...document.querySelectorAll(".score-room[data-room]")];
    const folio = document.getElementById("intervalFolio");
    const folioSource = document.getElementById("folioSource");
    const folioReturn = document.getElementById("folioReturn");
    const folioDistance = document.getElementById("folioDistance");
    const folioReadings = [...document.querySelectorAll("[data-folio-room]")];
    folioDistance?.addEventListener("click", () => {
      const apart = folio?.classList.toggle("is-apart");
      folioDistance.setAttribute("aria-pressed", String(Boolean(apart)));
      folioDistance.textContent = apart ? "Bring them closer" : "Give the words room";
    });
    let selected = carriedWord() || "enough";
    // An empty place lasts only on this page. It keeps no word or new record.
    let released = false;
    let margin = null;
    let marginSource = null;
    let marginReading = null;
    let marginCredit = null;
    let marginStatus = null;
    let marginClear = null;
    let marginEcho = null;
    let translationPair = null;
    let translationSource = null;
    let translationReading = null;
    let selectedPreview = null;

    cards.forEach((card) => {
      const text = document.createElement("span");
      text.className = "score-carried";
      card.querySelector("p")?.append(text);
      function show() { selectedPreview = Number(card.dataset.room); updatePreview(); }
      function leave() { selectedPreview = null; updatePreview(); }
      card.addEventListener("pointerenter", show);
      card.addEventListener("pointerleave", leave);
      card.addEventListener("focus", show);
      card.addEventListener("blur", leave);
    });

    if (roomIndex) {
      const route = document.querySelector(".salon-route");
      if (route) {
        margin = document.createElement("aside");
        margin.className = "interval-margin";
        margin.setAttribute("aria-label", "A Word Carried Through the Building");
        marginSource = document.createElement("span");
        marginSource.className = "interval-margin__source";
        marginReading = document.createElement("em");
        marginReading.className = "interval-margin__reading";
        const setDown = document.createElement("button");
        marginClear = setDown;
        setDown.type = "button";
        setDown.className = "interval-margin__clear";
        setDown.textContent = "Set it down";
        setDown.setAttribute("aria-label", "Set down the word; clear its active traces only");
        marginCredit = document.createElement("span");
        marginCredit.className = "interval-margin__credit";
        marginCredit.textContent = "An authored reading · Codex. Reading the carried word adds no trace. Setting it down clears active word traces; sealed private archives keep their copies.";
        marginStatus = document.createElement("span");
        marginStatus.className = "interval-margin__credit";
        marginStatus.setAttribute("role", "status");
        marginEcho = document.createElement("em");
        marginEcho.className = "interval-margin__echo";
        marginEcho.textContent = "The glass holds no echo.";
        if (roomIndex === 4) {
          translationPair = document.createElement("div");
          translationPair.className = "interval-translation";
          translationPair.setAttribute("aria-label", "Source and reading, held together");
          for (const label of ["What you brought", "What this room offers"]) {
            const panel = document.createElement("div");
            const caption = document.createElement("span");
            caption.className = "interval-translation__label";
            caption.textContent = label;
            const text = document.createElement("p");
            panel.append(caption, text);
            translationPair.append(panel);
            if (!translationSource) translationSource = text;
            else translationReading = text;
          }
          marginSource.hidden = true;
          marginReading.hidden = true;
          marginCredit.textContent = "The source keeps its place beside the reading. Proposed by Gemini; adapted by Codex. These are authored lines, not live replies. Setting down clears active word traces; sealed private archives keep their copies.";
        }
        setDown.addEventListener("click", () => {
          if (clear()) {
            render();
            document.querySelector(".salon-route__step--next")?.focus();
          } else {
            margin.hidden = false;
            marginStatus.textContent = "This browser could not confirm that the word was set down. It may still be stored.";
          }
        });
        margin.append(marginSource, marginReading);
        if (translationPair) margin.append(translationPair);
        margin.append(marginEcho, setDown, marginCredit, marginStatus);
        route.append(margin);
      }
    }

    function updatePreview() {
      if (folioSource) folioSource.textContent = selected || "";
      if (folioReturn) folioReturn.textContent = selected || "";
      folioReadings.forEach((node) => {
        node.textContent = selected ? reading(selected, Number(node.dataset.folioRoom)) : "";
      });
      folio?.classList.toggle("is-empty", !selected);
      if (!line || !wordNode) return;
      if (!selected) {
        wordNode.textContent = "";
        line.textContent = "The glass holds no echo.";
        document.getElementById("intervalPlace").textContent = "An empty place";
        buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
        if (carryButton) carryButton.disabled = true;
        instrument?.classList.remove("is-changing");
        return;
      }
      const current = WORDS[selected];
      wordNode.textContent = selected;
      line.textContent = selectedPreview ? reading(selected, selectedPreview) : current.threshold;
      document.getElementById("intervalPlace").textContent = selectedPreview ? `If carried into Room 0${selectedPreview}` : "At the threshold";
      instrument?.style.setProperty("--interval-accent", current.color);
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.intervalWord === selected)));
      if (carryButton) carryButton.disabled = carriedWord() === selected;
    }

    function render() {
      const kept = carriedWord();
      if (kept) released = false;
      instrument?.classList.toggle("is-released", released);
      if (kept) document.body.dataset.intervalWord = kept;
      else delete document.body.dataset.intervalWord;
      if (clearButton) clearButton.hidden = !kept;
      cards.forEach((card) => {
        const target = card.querySelector(".score-carried");
        if (target) target.textContent = kept ? `“${reading(kept, Number(card.dataset.room))}”` : "";
      });
      if (margin) {
        marginStatus.textContent = released ? "The word is no longer carried. Its active traces have been cleared; sealed private archives keep their copies." : "";
        margin.hidden = !kept && !released;
        margin.classList.toggle("is-released", released);
        marginClear.hidden = !kept;
        marginEcho.hidden = !released;
        marginCredit.hidden = !kept;
        marginSource.textContent = kept ? `You brought “${kept}”. Here it becomes` : "";
        marginReading.textContent = kept ? reading(kept, roomIndex) : "";
        if (translationPair) {
          translationPair.hidden = !kept;
          translationSource.textContent = kept || "";
          translationReading.textContent = kept ? reading(kept, roomIndex) : "";
        }
      }
      if (status) status.textContent = kept
        ? `“${kept}” is being carried in this browser. The rooms will read it differently. Setting it down clears its active traces; sealed private archives keep their copies.`
        : released
          ? "The word is no longer carried. Its active traces have been cleared; sealed private archives keep their copies. Choose a word to preview again."
          : "Previewing keeps no word. Carrying adds it to this browser’s active exhibition memory.";
      root.AISalonState?.renderTraceList?.("traceList");
      updatePreview();
    }

    buttons.forEach((button) => button.addEventListener("click", () => {
      const word = button.dataset.intervalWord;
      if (!Object.prototype.hasOwnProperty.call(WORDS, word)) return;
      selected = word;
      released = false;
      render();
      instrument?.classList.remove("is-changing");
      // A single entry animation; reduced motion disables it in CSS.
      if (instrument) { void instrument.offsetWidth; instrument.classList.add("is-changing"); }
      updatePreview();
    }));
    carryButton?.addEventListener("click", () => {
      const saved = choose(selected);
      render();
      if (!saved && status) status.textContent = "This browser could not keep the word. You can still preview it here.";
    });
    clearButton?.addEventListener("click", () => {
      const cleared = clear();
      render();
      if (cleared) buttons[0]?.focus();
      else if (status) status.textContent = "This browser could not confirm that the word was set down. It may still be stored.";
    });
    ["ai-salon-trace", "ai-salon-clear", "ai-salon-archive", "storage", "pageshow"].forEach((event) => root.addEventListener(event, render));
    root.addEventListener("ai-salon-word-cleared", (event) => {
      if (!event.detail?.cleared) return;
      selected = null;
      selectedPreview = null;
      released = true;
      render();
    });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})(typeof window === "undefined" ? globalThis : window);
