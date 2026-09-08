"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { harness, flush } = require("./test_sound_stage.cjs");
const repo = process.argv[2] || require("node:path").resolve(__dirname, "..");
function section(file, start, end) {
  const text = fs.readFileSync(`${repo}/${file}`, "utf8");
  const a = text.indexOf(start), b = text.indexOf(end, a);
  assert(a >= 0 && b > a, `Source boundaries for ${file}`);
  return text.slice(a, b);
}
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function qwenHarness(opts) {
  const h = harness(opts), choirButton = h.element("button");
  h.run("let choirOn = false, audio = null, choirTimer = 0;", { el: { choirButton } });
  h.run(section("wings/qwen-seat/qwen.js", "function makeNoiseBurst(", "function stampLedger("));
  h.toggle = () => h.run("toggleChoir()"); h.choirButton = choirButton;
  return h;
}
test("Qwen choir remains uncreated before its switch", () => {
  const h = qwenHarness(); h.tick(10000); assert.equal(h.contexts.length, 0); assert.equal(h.timers.size, 0);
});
test("Qwen on/off/on owns only one recursive pulse timer", async () => {
  const h = qwenHarness(); await h.toggle(); assert.equal(h.timers.size, 1); await h.toggle(); h.tick(40); assert.equal(h.timers.size, 0);
  await h.toggle(); assert.equal(h.timers.size, 1); h.tick(10000); assert.equal(h.timers.size, 1);
  assert.equal(h.contexts.length, 1); assert.equal(h.choirButton.attrs["aria-pressed"], "true");
  h.sound.silence(true); assert.equal(h.timers.size, 0); assert.equal(h.choirButton.attrs["aria-pressed"], "false");
  const count = h.ac.nodes.length; h.tick(10000); assert.equal(h.ac.nodes.length, count);
});
test("Qwen switching to the common score cancels the choir loop and resets local control", async () => {
  const h = qwenHarness(); await h.toggle(); await h.sound.listen("interval"); assert.equal(h.timers.size, 0);
  assert.equal(h.choirButton.attrs["aria-pressed"], "false"); assert.equal(h.sound.output("qwen").gain.value, 0);
});
test("Qwen double-click while resume is pending starts no pulse", async () => {
  const h = qwenHarness({ resume: "deferred" }); const first = h.toggle(), second = h.toggle();
  for (const req of h.ac.resumes) req.resolve(); await Promise.all([first, second]);
  assert.equal(h.sound.isListening(), false); assert.equal(h.ac.nodes.filter(node => node.kind === "oscillator").length, 0);
  assert.equal(h.choirButton.attrs["aria-pressed"], "false");
});
test("Qwen hiding ends pulses and cancels future audio", async () => {
  const h = qwenHarness(); await h.toggle(); h.hide(); const count = h.ac.nodes.length; h.show(); h.tick(10000);
  assert.equal(h.ac.nodes.length, count); assert.equal(h.timers.size, 0); assert.equal(h.choirButton.attrs["aria-pressed"], "false");
});

function throatHarness(opts) {
  const h = harness(opts), toggle = h.element("button"), toggleState = h.element("span"), announcements = [];
  toggle.querySelector = () => toggleState; h.doc.getElementById = id => id === "throatToggle" ? toggle : null;
  h.run(section("room-04/app.js", "(function mechanicalThroatHum()", "\nrunTransitTariff();"), {
    roomIsSilenced: () => false, announce: text => announcements.push(text), relayClick: level => h.root.__qwenRelay?.(level)
  });
  h.toggle = () => { toggle.dispatchEvent({ type: "click" }); return flush(); };
  h.throatButton = toggle; h.announcements = announcements;
  return h;
}
test("Mechanical Throat creates no context and schedules no sound before opt-in", () => {
  const h = throatHarness(); h.root.__qwenRelay(); h.tick(20000); assert.equal(h.contexts.length, 0); assert.equal(h.timers.size, 0);
});
test("Mechanical Throat has one relay loop and one paper loop, both stopped by master silence", async () => {
  const h = throatHarness(); await h.toggle(); assert.equal(h.sound.isListening("room04"), true); assert.equal(h.timers.size, 2);
  h.tick(20000); assert.equal(h.timers.size, 2); assert(h.ac.nodes.some(node => node.kind === "source"));
  h.sound.silence(true); const count = h.ac.nodes.length; assert.equal(h.timers.size, 0); h.tick(20000);
  assert.equal(h.ac.nodes.length, count); assert.equal(h.throatButton.attrs["aria-checked"], "false");
});
test("Mechanical Throat restart reuses one context and one hum oscillator", async () => {
  const h = throatHarness(); await h.toggle(); await h.toggle(); h.tick(40); await h.toggle();
  assert.equal(h.contexts.length, 1); assert.equal(h.ac.nodes.filter(node => node.kind === "oscillator").length, 1); assert.equal(h.timers.size, 2);
});
test("Mechanical Throat double-click while starting creates no hum", async () => {
  const h = throatHarness({ resume: "deferred" }); h.toggle(); h.toggle(); for (const req of h.ac.resumes) req.resolve(); await flush();
  assert.equal(h.sound.isListening(), false); assert.equal(h.ac.nodes.filter(node => node.kind === "oscillator").length, 0); assert.equal(h.timers.size, 0);
});

function thirdHarness() {
  const h = harness(), button = h.element("button"); h.doc.getElementById = id => id === "thirdSoundToggle" ? button : null;
  h.run("let audioContext = null;", { interference: { value: "7" } });
  h.run(section("wings/third-mind/third-mind.js", "function ensureAudio()", "function namePattern()"));
  const source = fs.readFileSync(`${repo}/wings/third-mind/third-mind.js`, "utf8");
  h.run(source.slice(source.indexOf("const thirdSoundToggle =")));
  h.interfere = () => h.run("playInterference()"); h.toggle = () => { button.dispatchEvent({ type: "click" }); return flush(); }; h.thirdButton = button;
  return h;
}
test("Third Mind ordinary actions are silent until its explicit switch", async () => {
  const h = thirdHarness(); h.interfere(); assert.equal(h.contexts.length, 0);
  await h.toggle(); assert.equal(h.sound.isListening("third"), true); assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 3);
  h.interfere(); assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 6);
  h.sound.silence(true); h.interfere(); assert.equal(h.ac.nodes.filter(n => n.kind === "oscillator").length, 6); assert.equal(h.thirdButton.attrs["aria-pressed"], "false");
});
test("Third Mind cannot overlay its notes onto another selected voice", async () => {
  const h = thirdHarness(); await h.toggle(); await h.sound.listen("interval"); const count = h.ac.nodes.length; h.interfere();
  assert.equal(h.ac.nodes.length, count); assert.equal(h.thirdButton.attrs["aria-pressed"], "false");
});

function roomHarness(room, opts) {
  const h = harness(opts), soundToggle = h.element("button"); soundToggle.setAttribute("aria-checked", "false");
  const file = `room-0${room}/app.js`;
  h.run("let audio = null;", {
    el: { soundToggle, presenceRange: { value: "7" }, volatilityRange: { value: "5" } },
    scoreKey: "mirror", running: true, pointer: { active: false }, size: { w: 1000, h: 800 }, mode: "false", turn: 0,
    memoryPulse() {}, palette: () => ["white", "blue", "red"],
  });
  h.run(section(file, "function ensureAudio()", room === 1 ? "function capture()" : "el.form.addEventListener"));
  if (room === 1) h.run(section(file, '  window.SalonSound?.register("room01"', "\n}\n\nfunction init()"));
  else h.run(section(file, 'window.SalonSound?.register("room02"', '\nwindow.addEventListener("pointermove"'));
  h.toggle = () => { soundToggle.dispatchEvent({ type: "click" }); return flush(); };
  h.note = () => h.run(room === 1 ? "bell(); gestureTone(100, 100);" : "memoryChime();");
  h.roomButton = soundToggle;
  return h;
}
for (const room of [1, 2]) {
  test(`Room 0${room} gestures are silent until its instrument is enabled`, async () => {
    const h = roomHarness(room); h.note(); assert.equal(h.contexts.length, 0);
    await h.toggle(); assert.equal(h.sound.isListening(`room0${room}`), true); assert.equal(h.contexts.length, 1);
    const count = h.ac.nodes.length; h.note(); assert(h.ac.nodes.length > count);
    h.sound.silence(true); const offCount = h.ac.nodes.length; h.note(); assert.equal(h.ac.nodes.length, offCount); assert.equal(h.roomButton.attrs["aria-checked"], "false");
  });
  test(`Room 0${room} switching to another voice closes its gain and resets its local switch`, async () => {
    const h = roomHarness(room); await h.toggle(); await h.sound.listen("interval");
    assert.equal(h.roomButton.attrs["aria-checked"], "false"); assert.equal(h.sound.output(`room0${room}`).gain.value, 0);
    const count = h.ac.nodes.length; h.note(); assert.equal(h.ac.nodes.length, count);
  });
  test(`Room 0${room} rapid double-click before resume creates no oscillators`, async () => {
    const h = roomHarness(room, { resume: "deferred" }); h.toggle(); h.toggle(); for (const req of h.ac.resumes) req.resolve(); await flush();
    assert.equal(h.sound.isListening(), false); assert.equal(h.ac.nodes.filter(node => node.kind === "oscillator").length, 0); assert.equal(h.roomButton.attrs["aria-checked"], "false");
  });
}

(async () => {
  let passed = 0;
  for (const { name, fn } of tests) {
    try { await fn(); passed++; console.log(`PASS ${name}`); }
    catch (error) { console.error(`FAIL ${name}\n${error.stack}`); }
  }
  console.log(`${passed}/${tests.length} instrument integration checks passed`);
  if (passed !== tests.length) process.exitCode = 1;
})();
