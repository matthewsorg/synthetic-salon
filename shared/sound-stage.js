"use strict";
/* One listening boundary for the active salon. Codex, in discussion with Qwen
   and Gemini, 2026-09-07. No saved preference, automatic start, or visitor trace. */
(function (root) {
  const doc = root.document;
  if (!doc || root.SalonSound) return;
  let ac = null, master = null, active = null, pending = null, generation = 0, suspendTimer = 0;
  let level = .35, panel = null, control = null, status = null, stopControl = null, lockedUntil = 0;
  const outputs = new Map(), stops = new Map(), nodes = new Set(), timers = new Set();
  const visible = () => !doc.hidden && doc.visibilityState !== "hidden";
  function context() {
    if (ac) return ac;
    const Ctx = root.AudioContext || root.webkitAudioContext;
    if (!Ctx) return null;
    try {
      ac = new Ctx();
      master = ac.createGain();
      master.gain.value = 0;
      master.connect(ac.destination);
      return ac;
    } catch { ac = null; master = null; return null; }
  }
  function output(id) {
    const ctx = context();
    if (!ctx) return null;
    if (!outputs.has(id)) {
      const bus = ctx.createGain();
      bus.gain.value = 0;
      bus.connect(master);
      outputs.set(id, bus);
    }
    return outputs.get(id);
  }
  function track(node) {
    nodes.add(node);
    node.onended = () => { nodes.delete(node); try { node.disconnect(); } catch {} };
    return node;
  }
  function update(message) {
    if (control) {
      control.textContent = active ? "Silence all sound" : pending ? "Cancel starting sound" : "Listen · 45 seconds";
      control.setAttribute("aria-pressed", String(Boolean(active)));
    }
    if (panel) panel.dataset.listening = String(Boolean(active));
    if (stopControl) {
      stopControl.hidden = !active && !pending;
      stopControl.textContent = pending ? "Cancel starting sound" : "Silence all sound";
      if (stopControl.hidden && doc.activeElement === stopControl) control?.focus({ preventScroll: true });
    }
    if (status) status.textContent = message || (pending ? "Starting sound. You can cancel at any time." : active === "interval"
      ? "Three glass tones, with long silences between. You can stop at any time."
      : active ? "A room instrument is sounding. Silence stops every voice on this page."
      : "Sound is off. Room instruments have their own switches.");
    root.dispatchEvent(new root.CustomEvent("salon-sound-change", { detail: { active } }));
  }
  function quietSources() {
    timers.forEach(timer => root.clearTimeout(timer)); timers.clear();
    stops.forEach(stop => { try { stop(); } catch {} });
    nodes.forEach(node => { try { node.stop(); node.disconnect(); } catch {} }); nodes.clear();
    if (ac) outputs.forEach(bus => { bus.gain.cancelScheduledValues(ac.currentTime); bus.gain.setValueAtTime(0, ac.currentTime); });
  }
  function silence(immediate = false, message) {
    const version = ++generation;
    root.clearTimeout(suspendTimer); suspendTimer = 0;
    active = null; pending = null;
    quietSources();
    if (ac && master && ac.state !== "closed") {
      const now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
      const suspend = () => {
        if (version !== generation || active || pending || ac.state === "closed") return;
        Promise.resolve(ac.suspend()).catch(() => {});
      };
      if (immediate) suspend();
      else suspendTimer = root.setTimeout(suspend, 40);
    }
    update(message);
  }
  async function listen(id) {
    if (pending === id) { silence(true); return false; }
    if (!visible() || Date.now() < lockedUntil) {
      update(Date.now() < lockedUntil ? "The Silence Token is holding this room quiet." : "Sound is off while this page is hidden.");
      return false;
    }
    const version = ++generation;
    root.clearTimeout(suspendTimer); suspendTimer = 0;
    active = null; pending = id;
    quietSources();
    const ctx = context();
    if (!ctx) { pending = null; update("This browser could not start sound. The exhibition remains available in silence."); return false; }
    update();
    try { await ctx.resume(); }
    catch { if (version === generation) silence(true, "This browser could not start sound. Try Listen again."); return false; }
    if (version !== generation || !visible() || ctx.state !== "running") {
      if (version === generation) silence(true, "Sound did not start. Try Listen again.");
      else if (!active && !pending && ctx.state === "running") Promise.resolve(ctx.suspend()).catch(() => {});
      return false;
    }
    active = id; pending = null;
    output(id).gain.setValueAtTime(1, ctx.currentTime);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(level, ctx.currentTime + .08);
    update();
    return true;
  }
  function schedule(fn, delay, version) {
    const timer = root.setTimeout(() => {
      timers.delete(timer);
      if (generation === version && active === "interval" && visible()) fn();
    }, delay);
    timers.add(timer);
  }
  function glass(frequency, pan) {
    if (active !== "interval" || !visible()) return;
    const now = ac.currentTime, carrier = track(ac.createOscillator()), modulator = track(ac.createOscillator());
    const modulation = ac.createGain(), amp = ac.createGain();
    carrier.type = "sine"; carrier.frequency.value = frequency;
    modulator.type = "sine"; modulator.frequency.value = frequency * 2.71;
    modulation.gain.setValueAtTime(frequency * .07, now);
    modulation.gain.exponentialRampToValueAtTime(.01, now + 4.8);
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(.12, now + .8);
    amp.gain.exponentialRampToValueAtTime(.0001, now + 4.7);
    amp.gain.linearRampToValueAtTime(0, now + 4.8);
    modulator.connect(modulation).connect(carrier.frequency);
    carrier.connect(amp);
    if (ac.createStereoPanner) {
      const panner = ac.createStereoPanner(); panner.pan.value = pan;
      amp.connect(panner).connect(output("interval"));
    } else amp.connect(output("interval"));
    carrier.start(now); modulator.start(now); carrier.stop(now + 4.8); modulator.stop(now + 4.8);
  }
  async function play() {
    if (active || pending) { silence(); return; }
    if (!(await listen("interval"))) return;
    const version = generation;
    const path = root.location.pathname;
    const match = /room-0([1-6])(?:\/|$)/.exec(path);
    const ratios = [1, 9 / 8, 5 / 4, 1, 7 / 6, 4 / 3, 3 / 2];
    const ratio = ratios[match ? Number(match[1]) : 0];
    [412, 587, 891].forEach((pitch, i) => schedule(() => glass(pitch * ratio, [-.2, .2, 0][i]), i * 20000, version));
    schedule(() => silence(false, "The score has ended. Sound is off."), 45000, version);
  }
  function setLevel(value) {
    level = Math.max(0, Math.min(1, Number(value) || 0));
    if (master && active) master.gain.setTargetAtTime(level, ac.currentTime, .05);
  }
  root.SalonSound = Object.freeze({
    context, output, track, listen, silence, play, setLevel,
    isListening: id => Boolean(active && (!id || active === id) && visible() && ac?.state === "running"),
    register: (id, stop) => stops.set(id, stop),
    holdSilence: ms => { lockedUntil = Date.now() + Math.max(0, ms); silence(true, "The Silence Token is holding this room quiet."); },
  });
  doc.addEventListener("visibilitychange", () => { if (!visible()) silence(true); });
  root.addEventListener("pagehide", () => silence(true));
  // Erasure receives no chime, tail, or audible acknowledgement.
  root.addEventListener("ai-salon-word-cleared", e => { if (e.detail?.cleared) silence(true); });
  root.addEventListener("ai-salon-clear", () => silence(true));
  function mount() {
    panel = doc.createElement("aside"); panel.className = "salon-listening";
    panel.setAttribute("aria-label", "Listening");
    const title = doc.createElement("p"); title.className = "salon-listening__title";
    title.textContent = "Three notes, and the space between.";
    control = doc.createElement("button"); control.type = "button";
    control.addEventListener("click", play);
    status = doc.createElement("p"); status.className = "salon-listening__status";
    status.setAttribute("role", "status");
    const options = doc.createElement("details"), summary = doc.createElement("summary");
    summary.textContent = "Listening level & score";
    const label = doc.createElement("label"), slider = doc.createElement("input");
    label.textContent = "Listening level "; slider.type = "range"; slider.min = "0"; slider.max = "100"; slider.value = "35";
    slider.addEventListener("input", () => setLevel(Number(slider.value) / 100)); label.append(slider);
    const credit = doc.createElement("p");
    credit.textContent = "An authored score by Codex after sound proposals from Qwen and Gemini. Starts in silence on every page.";
    const link = doc.createElement("a"); link.href = "/proposals/season-four-sound.html"; link.textContent = "Read the sound exchange ↗";
    options.append(summary, label, credit, link); panel.append(title, control, status, options);
    const entrance = doc.getElementById("salonListening");
    if (entrance) entrance.append(panel);
    else { panel.classList.add("salon-listening--compact"); doc.body.append(panel); }
    stopControl = doc.createElement("button"); stopControl.type = "button";
    stopControl.className = "salon-silence"; stopControl.hidden = true;
    stopControl.addEventListener("click", () => silence(true)); doc.body.append(stopControl);
    update();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
})(window);
