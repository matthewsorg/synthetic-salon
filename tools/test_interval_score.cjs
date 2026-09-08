const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const stateSource = fs.readFileSync(path.join(root, 'shared/gallery-state.js'), 'utf8');
const scoreSource = fs.readFileSync(path.join(root, 'shared/interval-score.js'), 'utf8');

function environment(initial = null, refuse = false, denyRead = false) {
  let stored = initial && JSON.stringify(initial);
  let writes = 0;
  const events = [];
  const context = vm.createContext({
    localStorage: {
      getItem() { if (denyRead) throw new Error('read denied'); return stored; },
      setItem(key, value) {
        if (refuse) throw new Error('storage unavailable');
        writes += 1;
        stored = value;
      },
    },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    Intl, Date, Math,
  });
  context.window = context;
  context.dispatchEvent = event => { events.push(event.type); };
  vm.runInContext(stateSource, context);
  vm.runInContext(scoreSource, context);
  return {
    score: context.SalonIntervalScore,
    state: context.AISalonState,
    writes: () => writes,
    saved: () => JSON.parse(stored),
    events,
  };
}

let passed = 0;
function test(name, run) {
  run();
  passed += 1;
  process.stdout.write(`PASS ${name}\n`);
}

test('loading and all previews perform no writes', () => {
  const e = environment();
  assert.equal(e.score.carriedWord(), null);
  for (const word of Object.keys(e.score.words)) {
    for (let i = 0; i <= 6; i++) assert.ok(e.score.reading(word, i));
  }
  assert.equal(e.writes(), 0);
});
test('explicit choice stores one trace and preserves the exact source word', () => {
  const e = environment();
  assert.equal(e.score.choose('enough'), true);
  assert.equal(e.writes(), 1);
  assert.equal(e.score.carriedWord(), 'enough');
  assert.equal(e.saved().traces.length, 1);
  assert.equal(e.saved().traces[0].score, 'interval:word');
});
test('repeating Carry creates no duplicate trace', () => {
  const e = environment();
  e.score.choose('hush');
  e.score.choose('hush');
  assert.equal(e.writes(), 1);
});
test('the newest chosen word wins after reload', () => {
  const e = environment();
  e.score.choose('hush');
  e.score.choose('elsewhere');
  const reopened = environment(e.saved());
  assert.equal(reopened.score.carriedWord(), 'elsewhere');
  assert.equal(reopened.writes(), 0);
});
test('each room changes the reading without recording a journey', () => {
  const e = environment();
  e.score.choose('enough');
  const readings = Array.from({ length: 6 }, (_, i) => e.score.reading('enough', i + 1));
  assert.equal(new Set(readings).size, 6);
  assert.equal(readings[5], 'who gets to say enough?');
  assert.equal(e.writes(), 1);
});
test('setting down clears all active word traces without erasing other works', () => {
  const e = environment();
  e.state.recordTrace({ source: 'Room 04', score: 'translation:literal', label: 'Other work' });
  e.score.choose('hush');
  e.score.choose('enough');
  assert.equal(e.score.clear(), true);
  assert.equal(e.score.carriedWord(), null);
  assert.equal(e.saved().traces.length, 1);
  assert.equal(e.saved().traces[0].label, 'Other work');
  assert.ok(e.events.includes('ai-salon-word-cleared'));
});
test('an archive ends carrying and remains intact when another word is set down', () => {
  const e = environment();
  e.score.choose('enough');
  e.state.archiveOpeningNight();
  assert.equal(e.score.carriedWord(), null);
  e.score.choose('hush');
  e.score.clear();
  assert.equal(e.saved().archives[0].traces[0].label, 'enough');
});
test('the existing clear action also releases the word', () => {
  const e = environment();
  e.score.choose('elsewhere');
  e.state.clearContamination();
  assert.equal(e.score.carriedWord(), null);
});
test('refused storage is not reported as a successful choice', () => {
  const e = environment(null, true);
  assert.equal(e.score.choose('hush'), false);
  assert.equal(e.score.carriedWord(), null);
  assert.equal(e.writes(), 0);
});
test('refused erasure retains the old word and returns failure', () => {
  const e = environment({ traces: [{ score: 'interval:word', label: 'enough' }] }, true);
  assert.equal(e.score.clear(), false);
  assert.equal(e.score.carriedWord(), 'enough');
});
test('denied reads never turn inaccessible memory into successful erasure', () => {
  const previous = { traces: [{ score: 'interval:word', label: 'enough' }, { label: 'Other work' }] };
  const e = environment(previous, true, true);
  assert.equal(e.score.clear(), false);
  assert.deepEqual(e.saved(), previous);
  assert.equal(e.writes(), 0);
});
test('a denied read prevents carrying from overwriting unrelated memory', () => {
  const previous = { traces: [{ label: 'Other work' }] };
  const e = environment(previous, false, true);
  assert.equal(e.score.choose('hush'), false);
  assert.equal(e.writes(), 0);
  assert.deepEqual(e.saved(), previous);
});
test('unknown or injected words are never stored or rendered', () => {
  const e = environment({ traces: [{ score: 'interval:word', label: '<script>bad</script>' }] });
  assert.equal(e.score.carriedWord(), null);
  assert.equal(e.score.choose('__proto__'), false);
  assert.equal(e.score.reading('constructor', 1), '');
  assert.equal(e.writes(), 0);
});
test('a naturally expired trace does not reappear from other history', () => {
  const e = environment();
  e.score.choose('hush');
  for (let i = 0; i < 28; i++) e.state.recordTrace({ label: `Other ${i}` });
  assert.equal(e.score.carriedWord(), null);
});
process.stdout.write(`${passed} interaction-state checks passed. No browser or network used.\n`);
