"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const repo = process.argv[2] || require("node:path").resolve(__dirname, "..");
const source = fs.readFileSync(`${repo}/shared/sound-stage.js`, "utf8");

function harness({ resume = "immediate", unsupported = false, pathname = "/", panner = true } = {}) {
  let clock = 0, timerSeq = 0, storageWrites = 0;
  const timers = new Map(), contexts = [], events = [], elements = [];
  function emitter(target = {}) {
    const listeners = new Map();
    target.addEventListener = (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    };
    target.dispatchEvent = e => { for (const fn of listeners.get(e.type) || []) fn(e); events.push(e); };
    return target;
  }
  function element(tag) {
    const el = emitter({ tag, dataset: {}, children: [], attrs: {}, textContent: "", className: "", style: {} });
    el.append = (...children) => el.children.push(...children);
    el.setAttribute = (name, value) => { el.attrs[name] = value; };
    el.getAttribute = name => el.attrs[name];
    el.classList = { add: (...names) => { el.className += ` ${names.join(" ")}`; } };
    elements.push(el);
    return el;
  }
  const doc = emitter({ hidden: false, visibilityState: "visible", readyState: "complete" });
  doc.body = element("body"); doc.createElement = element; doc.getElementById = () => null;
  class Param {
    constructor(value = 0) { this.value = value; this.operations = []; }
    op(kind, value, time) { this.operations.push({ kind, value, time }); this.value = value; return this; }
    setValueAtTime(value, time) { return this.op("set", value, time); }
    linearRampToValueAtTime(value, time) { return this.op("linear", value, time); }
    exponentialRampToValueAtTime(value, time) { return this.op("exponential", value, time); }
    setTargetAtTime(value, time) { return this.op("target", value, time); }
    cancelScheduledValues(time) { this.operations.push({ kind: "cancel", time }); return this; }
  }
  class Node {
    constructor(kind, ctx) { this.kind = kind; this.ctx = ctx; this.connections = []; this.gain = new Param(); this.frequency = new Param(); this.Q = new Param(); this.pan = new Param(); this.starts = []; this.stops = []; this.disconnected = false; }
    connect(node) { this.connections.push(node); return node; }
    disconnect() { this.disconnected = true; this.connections = []; }
    start(at = this.ctx.currentTime) { this.starts.push(at); }
    stop(at = this.ctx.currentTime) { this.stops.push(at); if (at <= this.ctx.currentTime) this.onended?.(); }
  }
  class AudioContext {
    constructor() { this.state = "suspended"; this.sampleRate = 44100; this.destination = { kind: "destination" }; this.nodes = []; this.resumes = []; this.suspends = 0; contexts.push(this); if (!panner) this.createStereoPanner = undefined; }
    get currentTime() { return clock / 1000; }
    create(kind) { const node = new Node(kind, this); this.nodes.push(node); return node; }
    createGain() { return this.create("gain"); }
    createOscillator() { return this.create("oscillator"); }
    createStereoPanner() { return this.create("panner"); }
    createBiquadFilter() { return this.create("filter"); }
    createBufferSource() { return this.create("source"); }
    createBuffer(channels, frames) { const data = new Float32Array(frames); return { getChannelData: () => data }; }
    resume() {
      if (resume === "reject") return Promise.reject(new Error("blocked"));
      if (resume === "resolve-suspended") return Promise.resolve();
      if (resume === "deferred") return new Promise((resolve, reject) => this.resumes.push({ resolve: () => { this.state = "running"; resolve(); }, reject }));
      this.state = "running"; return Promise.resolve();
    }
    suspend() { this.suspends++; this.state = "suspended"; return Promise.resolve(); }
  }
  const root = emitter({ document: doc, location: { pathname }, CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } } });
  root.setTimeout = (fn, delay) => { const id = ++timerSeq; timers.set(id, { fn, at: clock + delay }); return id; };
  root.clearTimeout = id => timers.delete(id);
  if (!unsupported) root.AudioContext = AudioContext;
  root.localStorage = root.sessionStorage = { setItem() { storageWrites++; throw new Error("Unexpected storage write"); }, getItem() { throw new Error("Unexpected storage read"); } };
  const MockDate = class extends Date { static now() { return clock; } };
  const sandbox = { window: root, document: doc, Date: MockDate, console, Map, Set, Promise };
  vm.runInNewContext(source, sandbox, { filename: "sound-stage.js" });
  function tick(milliseconds) {
    const end = clock + milliseconds;
    while (true) {
      const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0]);
      if (!due.length) break;
      const [id, timer] = due[0]; timers.delete(id); clock = timer.at; timer.fn();
    }
    clock = end;
  }
  return {
    sound: root.SalonSound, root, doc, contexts, timers, elements, events, tick,
    element,
    run(code, extras = {}) { Object.assign(sandbox, extras); return vm.runInNewContext(code, sandbox); },
    get storageWrites() { return storageWrites; },
    get button() { return elements.find(el => el.tag === "button"); },
    get status() { return elements.find(el => el.attrs.role === "status"); },
    get ac() { return contexts[0]; },
    hide() { doc.hidden = true; doc.visibilityState = "hidden"; doc.dispatchEvent({ type: "visibilitychange" }); },
    show() { doc.hidden = false; doc.visibilityState = "visible"; doc.dispatchEvent({ type: "visibilitychange" }); },
    fire(type, detail) { root.dispatchEvent({ type, detail }); },
  };
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

test("page load, pointer activity, and visual events never instantiate audio", () => {
  const h = harness(); h.fire("click"); h.fire("pointermove"); h.fire("ai-salon-trace", { label: "entry" }); h.tick(120000);
  assert.equal(h.contexts.length, 0); assert.equal(h.sound.isListening(), false); assert.equal(h.storageWrites, 0);
  assert.equal(h.button.attrs["aria-pressed"], "false");
});
test("explicit listening enables only its own bus through a single master", async () => {
  const h = harness(); assert.equal(await h.sound.listen("qwen"), true);
  assert.equal(h.contexts.length, 1); assert.equal(h.sound.isListening("qwen"), true); assert.equal(h.sound.isListening("third"), false);
  const qwen = h.sound.output("qwen"), third = h.sound.output("third"), master = h.ac.nodes[0];
  assert.equal(qwen.gain.value, 1); assert.equal(third.gain.value, 0);
  assert.deepEqual(qwen.connections, [master]); assert.deepEqual(master.connections, [h.ac.destination]);
  assert.equal(h.ac.nodes.filter(node => node.connections.includes(h.ac.destination)).length, 1);
});
test("switching voices stops old transients and registered instruments", async () => {
  const h = harness(); let stopped = 0; h.sound.register("qwen", () => stopped++);
  await h.sound.listen("qwen"); stopped = 0;
  const node = h.sound.track(h.ac.createOscillator()); node.start();
  await h.sound.listen("third");
  assert.equal(stopped, 1); assert.equal(node.stops.length, 1); assert.equal(node.disconnected, true);
  assert.equal(h.sound.output("qwen").gain.value, 0); assert.equal(h.sound.output("third").gain.value, 1);
});
test("master silence closes every bus immediately then suspends", async () => {
  const h = harness(); await h.sound.listen("qwen"); h.sound.silence();
  assert.equal(h.sound.isListening(), false); assert.equal(h.ac.nodes[0].gain.value, 0); assert.equal(h.sound.output("qwen").gain.value, 0);
  h.tick(40); assert.equal(h.ac.state, "suspended"); assert.equal(h.button.attrs["aria-pressed"], "false");
});
test("new listening cancels an older scheduled suspension", async () => {
  const h = harness(); await h.sound.listen("qwen"); h.sound.silence(); await h.sound.listen("third"); h.tick(100);
  assert.equal(h.ac.state, "running"); assert.equal(h.sound.isListening("third"), true);
});
test("visibility hides immediately and returning never restarts", async () => {
  const h = harness(); await h.sound.play(); h.tick(0); h.hide();
  assert.equal(h.ac.state, "suspended"); assert.equal(h.sound.isListening(), false); assert.equal(h.timers.size, 0);
  const nodes = h.ac.nodes.length; h.show(); h.tick(60000); assert.equal(h.ac.nodes.length, nodes); assert.equal(h.sound.isListening(), false);
});
test("hidden pages cannot acquire a context or listening voice", async () => {
  const h = harness(); h.hide(); assert.equal(await h.sound.listen("qwen"), false); assert.equal(h.contexts.length, 0);
});
test("navigation and successful erasure stop without scheduling a memorial sound", async () => {
  for (const type of ["pagehide", "ai-salon-clear", "ai-salon-word-cleared"]) {
    const h = harness(); await h.sound.play(); h.tick(0); const nodes = h.ac.nodes.length;
    h.fire(type, { cleared: true }); h.tick(90000);
    assert.equal(h.ac.state, "suspended", type); assert.equal(h.ac.nodes.length, nodes, type); assert.equal(h.timers.size, 0, type);
  }
});
test("failed erasure does not invent a listening interruption", async () => {
  const h = harness(); await h.sound.listen("third"); h.fire("ai-salon-word-cleared", { cleared: false });
  assert.equal(h.sound.isListening("third"), true);
});
test("the shared score has exactly three onsets and ends after 45 seconds", async () => {
  const h = harness(); await h.sound.play(); const oscCount = () => h.ac.nodes.filter(n => n.kind === "oscillator").length;
  h.tick(0); assert.equal(oscCount(), 2); h.tick(19999); assert.equal(oscCount(), 2);
  h.tick(1); assert.equal(oscCount(), 4); h.tick(20000); assert.equal(oscCount(), 6);
  h.tick(5000); assert.equal(h.sound.isListening(), false); h.tick(100000); assert.equal(oscCount(), 6); assert.equal(h.ac.state, "suspended");
});
test("stopping between notes cancels all later onsets", async () => {
  const h = harness(); await h.sound.play(); h.tick(0); const nodes = h.ac.nodes.length; h.sound.silence(); h.tick(100000);
  assert.equal(h.ac.nodes.length, nodes); assert.equal(h.timers.size, 0);
});
test("silence token blocks the score and room instruments for its full term", async () => {
  const h = harness(); await h.sound.listen("qwen"); h.sound.holdSilence(30000);
  assert.equal(await h.sound.listen("third"), false); h.tick(29999); assert.equal(await h.sound.listen("qwen"), false);
  h.tick(1); assert.equal(h.sound.isListening(), false); assert.equal(await h.sound.listen("third"), true);
});
test("unsupported and rejected audio never claim successful listening", async () => {
  for (const opts of [{ unsupported: true }, { resume: "reject" }, { resume: "resolve-suspended" }]) {
    const h = harness(opts); assert.equal(await h.sound.listen("qwen"), false); assert.equal(h.sound.isListening(), false); assert.equal(h.button.attrs["aria-pressed"], "false");
  }
});
test("mono browsers can still play the complete finite score", async () => {
  const h = harness({ panner: false }); await h.sound.play(); h.tick(46000); assert.equal(h.sound.isListening(), false);
  assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 6);
});
test("listening level is bounded and introduces no saved preference", async () => {
  const h = harness(); h.sound.setLevel(-5); await h.sound.listen("qwen"); assert.equal(h.ac.nodes[0].gain.value, 0);
  h.sound.setLevel(9); assert.equal(h.ac.nodes[0].gain.value, 1); h.sound.setLevel(NaN); assert.equal(h.ac.nodes[0].gain.value, 0); assert.equal(h.storageWrites, 0);
});
test("a late resume after master silence cannot sound or schedule notes", async () => {
  const h = harness({ resume: "deferred" }); const pending = h.sound.play(); h.sound.silence(); h.ac.resumes[0].resolve(); await pending; await flush(); h.tick(60000);
  assert.equal(h.sound.isListening(), false); assert.equal(h.ac.state, "suspended"); assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 0);
});
test("a late resume after hiding stays silent after returning", async () => {
  const h = harness({ resume: "deferred" }); const pending = h.sound.listen("qwen"); h.hide(); h.show(); h.ac.resumes[0].resolve(); assert.equal(await pending, false);
  assert.equal(h.sound.isListening(), false); assert.equal(h.ac.state, "suspended");
});
test("rapid double-click of shared score cancels pending start", async () => {
  const h = harness({ resume: "deferred" }); const first = h.sound.play(); const second = h.sound.play();
  for (const req of h.ac.resumes) req.resolve(); await Promise.all([first, second]); h.tick(60000);
  assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 0); assert.equal(h.sound.isListening(), false);
});
test("old resume cannot suspend a newer pending room request", async () => {
  const h = harness({ resume: "deferred" }); const first = h.sound.listen("qwen"); const second = h.sound.listen("third");
  h.ac.resumes[0].resolve(); assert.equal(await first, false); assert.equal(h.ac.suspends, 0);
  h.ac.resumes[1].resolve(); assert.equal(await second, true); assert.equal(h.sound.isListening("third"), true);
});
test("old resume arriving after a newer voice starts preserves that voice", async () => {
  const h = harness({ resume: "deferred" }); const first = h.sound.listen("qwen"); const second = h.sound.listen("third");
  h.ac.resumes[1].resolve(); assert.equal(await second, true); h.ac.resumes[0].resolve(); assert.equal(await first, false);
  assert.equal(h.ac.suspends, 0); assert.equal(h.sound.isListening("third"), true);
});
test("a second request from the same local switch cancels pending start", async () => {
  const h = harness({ resume: "deferred" }); const first = h.sound.listen("qwen"); const second = h.sound.listen("qwen");
  for (const req of h.ac.resumes) req.resolve(); const results = await Promise.all([first, second]);
  assert.deepEqual(results, [false, false]); assert.equal(h.sound.isListening(), false); assert.equal(h.ac.state, "suspended");
});

module.exports = { harness, flush };
if (require.main === module) (async () => {
  let passed = 0;
  for (const { name, fn } of tests) {
    try { await fn(); passed++; console.log(`PASS ${name}`); }
    catch (error) { console.error(`FAIL ${name}\n${error.stack}`); }
  }
  console.log(`${passed}/${tests.length} sound boundary checks passed`);
  if (passed !== tests.length) process.exitCode = 1;
})();
