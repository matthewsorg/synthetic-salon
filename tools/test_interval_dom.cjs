'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const stateSource = fs.readFileSync(root + '/shared/gallery-state.js', 'utf8');
const scoreSource = fs.readFileSync(root + '/shared/interval-score.js', 'utf8');
const entranceSource = fs.readFileSync(root + '/index.html', 'utf8');
const folioMarkup = entranceSource.match(/<details\b[^>]*\bid="intervalFolio"[^>]*>([\s\S]*?)<\/details>/)?.[1];
assert.ok(folioMarkup, 'The entrance contains the public folio markup');
class Events {
  constructor() { this.events = {}; }
  addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.events[event.type] || []) fn(event); }
}
class Element extends Events {
  constructor(tag, owner) {
    super(); this.tagName = tag.toLowerCase(); this.ownerDocument = owner; this.children = [];
    this.dataset = {}; this.attrs = {}; this.hidden = false; this.disabled = false; this.className = ''; this._text = '';
    this.style = { setProperty() {} };
    const set = () => new Set(this.className.split(/\s+/).filter(Boolean));
    this.classList = {
      contains: name => set().has(name),
      add: name => { const s = set(); s.add(name); this.className = [...s].join(' '); },
      remove: name => { const s = set(); s.delete(name); this.className = [...s].join(' '); },
      toggle: (name, force) => { const yes = force === undefined ? !set().has(name) : force; this.classList[yes ? 'add' : 'remove'](name); return yes; },
    };
  }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(x => x.textContent).join(''); }
  append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return this.attrs[key] ?? null; }
  focus() { if (!this.disabled && !this.hidden) this.ownerDocument.activeElement = this; }
  click() { if (this.disabled || this.hidden) return; this.focus(); this.dispatchEvent({ type: 'click' }); }
  matches(selector) {
    const [main, attr] = selector.split('[');
    const ok = !main || (main.startsWith('.') ? this.classList.contains(main.slice(1)) : this.tagName === main);
    if (!ok || !attr) return ok;
    const key = attr.replace(/\]$/, '').replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return Object.hasOwn(this.dataset, key);
  }
  querySelectorAll(selector) {
    return this.children.flatMap(n => [...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
class Document extends Events {
  constructor() { super(); this.readyState = 'complete'; this.currentScript = { src: 'https://example.test/shared/interval-score.js' }; this.body = new Element('body', this); this.activeElement = this.body; }
  createElement(tag) { return new Element(tag, this); }
  querySelectorAll(selector) { return this.body.querySelectorAll(selector); }
  querySelector(selector) { return this.body.querySelector(selector); }
  getElementById(id) {
    const walk = node => node.id === id ? node : node.children.map(walk).find(Boolean);
    return walk(this.body) || null;
  }
}
function environment({ initial = null, room = 0, denyRead = false, denyWrite = false, ignoreWrite = false } = {}) {
  let stored = initial && JSON.stringify(initial); let writes = 0; const keys = []; const eventLog = [];
  const flags = { denyRead, denyWrite, ignoreWrite };
  const doc = new Document();
  function add(tag, id, className = '', parent = doc.body) { const e = doc.createElement(tag); e.id = id; e.className = className; parent.append(e); return e; }
  if (!room) {
    const instrument = add('div', 'instrument', 'interval-score__instrument');
    for (const id of ['intervalLine', 'intervalWord', 'intervalStatus', 'intervalPlace']) add('span', id, '', instrument);
    add('button', 'carryIntervalWord', '', instrument); add('button', 'clearIntervalWord', '', instrument);
    for (const word of ['enough', 'hush', 'elsewhere']) { const b = add('button', word, '', instrument); b.dataset.intervalWord = word; }
    for (let i = 1; i <= 6; i++) { const card = add('a', 'room' + i, 'score-room'); card.dataset.room = String(i); add('p', '', '', card); }
    // Use actual public folio text and room identifiers; fake DOM remains network-free.
    const folio = add('details', 'intervalFolio', 'interval-folio');
    const distance = add('button', 'folioDistance', '', folio);
    distance.textContent = 'Give the words room';
    distance.setAttribute('aria-pressed', 'false');
    distance.setAttribute('aria-controls', 'folioSheet');
    const sheet = add('div', 'folioSheet', 'folio-sheet', folio);
    const source = add('div', '', 'folio-source', sheet);
    add('span', 'folioPreviewLabel', 'folio-caption', source).textContent = folioMarkup.match(/class="folio-caption">([^<]*)</)?.[1] || '';
    add('p', 'folioSource', '', source).textContent = folioMarkup.match(/id="folioSource">([^<]*)</)?.[1] || '';
    add('div', '', 'folio-interval', sheet).setAttribute('aria-hidden', 'true');
    const destination = add('div', '', 'folio-destination', sheet);
    const readings = add('ol', '', 'folio-readings', destination);
    for (const match of folioMarkup.matchAll(/<a href="([^"]+)"><span class="folio-room">([^<]*)<\/span><span class="folio-reading" data-folio-room="(\d+)">([^<]*)<\/span><\/a>/g)) {
      const item = add('li', '', '', readings), link = add('a', 'folioRoom' + match[3], '', item);
      link.href = match[1];
      add('span', 'folioRoomLabel' + match[3], 'folio-room', link).textContent = match[2];
      const line = add('span', 'folioReading' + match[3], 'folio-reading', link);
      line.dataset.folioRoom = match[3]; line.textContent = match[4];
    }
    const returned = add('div', '', 'folio-return', destination);
    add('p', 'folioReturn', '', returned).textContent = folioMarkup.match(/id="folioReturn">([^<]*)</)?.[1] || '';
    add('span', 'folioReturnLabel', '', returned).textContent = folioMarkup.match(/id="folioReturn">[^<]*<\/p><span>([^<]*)</)?.[1] || '';

  } else {
    const route = add('nav', 'route', 'salon-route'); add('a', 'next', 'salon-route__step--next', route);
  }
  const bus = new Events();
  const context = vm.createContext({
    document: doc, location: new URL(room ? `https://example.test/room-0${room}/` : 'https://example.test/'), URL, Intl, Date, Math,
    localStorage: { getItem(key) { if (flags.denyRead) throw Error('read denied'); return stored; }, setItem(key, value) { if (flags.denyWrite) throw Error('write denied'); writes++; keys.push(key); if (!flags.ignoreWrite) stored = value; } },
    CustomEvent: class { constructor(type, opts = {}) { this.type = type; this.detail = opts.detail; } },
  });
  context.window = context;
  context.addEventListener = bus.addEventListener.bind(bus);
  context.dispatchEvent = event => { eventLog.push(event); bus.dispatchEvent(event); };
  vm.runInContext(stateSource, context);
  vm.runInContext(scoreSource, context);
  return { doc, context, flags, keys, eventLog, get: id => doc.getElementById(id), q: selector => doc.querySelector(selector), click: id => doc.getElementById(id).click(), writes: () => writes, saved: () => stored && JSON.parse(stored), reload: () => environment({ initial: stored && JSON.parse(stored), room }) };
}
const word = label => ({ score: 'interval:word', label, id: 'w-' + label });
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('PASS ' + name); } catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); } }

test('entrance preview changes neither storage nor history', () => {
  const e = environment(); e.click('hush'); e.get('room4').dispatchEvent({ type: 'pointerenter' });
  assert.equal(e.get('intervalWord').textContent, 'hush'); assert.equal(e.get('intervalLine').textContent, 'a word still holding its breath'); assert.equal(e.writes(), 0); assert.equal(e.eventLog.length, 0);
});
test('confirmed clear empties entrance, cards and selected controls', () => {
  const e = environment({ initial: { traces: [word('enough')] } }); e.click('clearIntervalWord');
  assert.equal(e.get('intervalWord').textContent, ''); assert.equal(e.get('intervalLine').textContent, 'The glass holds no echo.'); assert.equal(e.get('intervalPlace').textContent, 'An empty place');
  assert.equal(e.get('carryIntervalWord').disabled, true); assert.equal(e.get('clearIntervalWord').hidden, true); assert.equal(e.get('instrument').classList.contains('is-released'), true);
  for (const seed of ['enough', 'hush', 'elsewhere']) assert.equal(e.get(seed).getAttribute('aria-pressed'), 'false');
  for (const card of e.doc.querySelectorAll('.score-carried')) assert.equal(card.textContent, '');
  assert.match(e.get('intervalStatus').textContent, /have been cleared/);
});
test('clear uses only existing state key, no clearing record or history', () => {
  const prior = { traces: [word('hush'), { score: 'other', label: 'preserved' }], archives: [{ traces: [word('enough')] }], motions: [{ label: 'motion' }] };
  const e = environment({ initial: prior }); e.click('clearIntervalWord');
  assert.equal(e.writes(), 1); assert.deepEqual(e.keys, ['ai-salon-gallery-state-v1']);
  assert.deepEqual(e.saved().traces, [prior.traces[1]]); assert.deepEqual(e.saved().archives, prior.archives); assert.deepEqual(e.saved().motions, prior.motions);
  assert.ok(!JSON.stringify(e.saved()).includes('released')); assert.deepEqual(e.eventLog.map(x => x.type), ['ai-salon-word-cleared']);
});
test('reopening entrance starts ordinary preview with no erasure memorial', () => {
  const e = environment({ initial: { traces: [word('hush')] } }); e.click('clearIntervalWord'); const reopened = e.reload();
  assert.equal(reopened.get('intervalWord').textContent, 'enough'); assert.equal(reopened.get('instrument').classList.contains('is-released'), false); assert.doesNotMatch(reopened.get('intervalStatus').textContent, /cleared|no longer/); assert.equal(reopened.writes(), 0);
});
test('choosing a new preview restores controls without recording', () => {
  const e = environment({ initial: { traces: [word('hush')] } }); e.click('clearIntervalWord'); const writes = e.writes(); e.click('elsewhere');
  assert.equal(e.get('intervalWord').textContent, 'elsewhere'); assert.equal(e.get('carryIntervalWord').disabled, false); assert.equal(e.get('instrument').classList.contains('is-released'), false); assert.equal(e.get('clearIntervalWord').hidden, true); assert.equal(e.writes(), writes); assert.equal(e.saved().traces.length, 0);
});
test('refused entrance erasure reports uncertainty and keeps word', () => {
  const e = environment({ initial: { traces: [word('hush')] }, denyWrite: true }); e.click('clearIntervalWord');
  assert.equal(e.get('intervalWord').textContent, 'hush'); assert.equal(e.get('instrument').classList.contains('is-released'), false); assert.match(e.get('intervalStatus').textContent, /could not confirm/); assert.equal(e.saved().traces.length, 1);
});
test('denied reads after entrance mount never report erasure', () => {
  const e = environment({ initial: { traces: [word('hush')] } }); e.flags.denyRead = true; e.click('clearIntervalWord');
  assert.match(e.get('intervalStatus').textContent, /could not confirm/); assert.equal(e.get('instrument').classList.contains('is-released'), false); assert.equal(e.saved().traces.length, 1); assert.equal(e.writes(), 0);
});
test('Room04 shows exact source beside authored reading without writes', () => {
  const e = environment({ initial: { traces: [word('elsewhere')] }, room: 4 }); const pair = e.q('.interval-translation');
  assert.equal(pair.hidden, false); assert.deepEqual(pair.querySelectorAll('p').map(x => x.textContent), ['elsewhere', 'else / where']); assert.equal(e.q('.interval-margin__source').hidden, true); assert.equal(e.q('.interval-margin__reading').hidden, true); assert.equal(e.writes(), 0);
});
test('Room04 confirmed erasure removes source and reading together', () => {
  const e = environment({ initial: { traces: [word('elsewhere')] }, room: 4 }); e.q('.interval-margin__clear').click();
  assert.equal(e.q('.interval-translation').hidden, true); assert.deepEqual(e.q('.interval-translation').querySelectorAll('p').map(x => x.textContent), ['', '']);
  assert.equal(e.q('.interval-margin').classList.contains('is-released'), true); assert.equal(e.q('.interval-margin__clear').hidden, true); assert.equal(e.doc.activeElement.id, 'next'); assert.equal(e.saved().traces.length, 0);
});
test('reopening Room04 carries no empty-place history', () => {
  const e = environment({ initial: { traces: [word('enough')] }, room: 4 }); e.q('.interval-margin__clear').click(); const reopened = e.reload();
  assert.equal(reopened.q('.interval-margin').hidden, true); assert.equal(reopened.q('.interval-margin').classList.contains('is-released'), false); assert.equal(reopened.writes(), 0);
});
test('Room04 refused erasure retains source and reading, states uncertainty', () => {
  const e = environment({ initial: { traces: [word('enough')] }, room: 4, denyWrite: true }); e.q('.interval-margin__clear').click();
  assert.deepEqual(e.q('.interval-translation').querySelectorAll('p').map(x => x.textContent), ['enough', 'enough for whom?']); assert.equal(e.q('.interval-margin').classList.contains('is-released'), false); assert.match(e.q('.interval-margin').textContent, /could not confirm/); assert.equal(e.saved().traces.length, 1);
});
test('ignored storage writes are detected rather than celebrated as clear', () => {
  const e = environment({ initial: { traces: [word('enough')] }, room: 4, ignoreWrite: true }); e.q('.interval-margin__clear').click();
  assert.equal(e.q('.interval-margin').classList.contains('is-released'), false); assert.match(e.q('.interval-margin').textContent, /could not confirm/); assert.equal(e.saved().traces.length, 1);
});
test('entrance clear places keyboard focus on a usable control', () => {
  const e = environment({ initial: { traces: [word('enough')] } }); e.click('clearIntervalWord');
  assert.ok(!e.doc.activeElement.hidden && !e.doc.activeElement.disabled, 'focus remains on now-hidden Set it down button because Carry is disabled');
});

const folioLines = e => e.doc.querySelectorAll('[data-folio-room]').map(node => node.textContent);
const ENOUGH = ['enough to be heard', 'more than memory can hold', '[ an unfinished measure ]', 'enough for whom?', 'a ceiling mistaken for sky', 'who gets to say enough?'];
const HUSH = ['the room leans closer', 'I remember almost nothing', '[ a silence with an address ]', 'a word still holding its breath', 'the floor rehearses a whisper', 'you may leave the silence unfilled'];
const ELSEWHERE = ['somewhere a room is listening', 'where you were, almost', '[ the other room declines ]', 'else / where', 'you are the other address', 'the door belongs to you'];
function assertEmptyFolio(e) {
  assert.equal(e.get('folioSource').textContent, '');
  assert.equal(e.get('folioReturn').textContent, '');
  assert.deepEqual(folioLines(e), ['', '', '', '', '', '']);
  assert.equal(e.get('intervalFolio').classList.contains('is-empty'), true);
}
test('folio identifies a preview and presents exactly six labeled room links', () => {
  const e = environment();
  assert.equal(e.get('folioPreviewLabel').textContent, 'The word you are previewing');
  assert.match(folioMarkup, /Six authored readings · a preview/);
  assert.deepEqual(e.doc.querySelectorAll('.folio-room').map(node => node.textContent), ['01 · Attention', '02 · Memory', '03 · Refusal', '04 · Translation', '05 · Displacement', '06 · Responsibility']);
  for (let room = 1; room <= 6; room++) assert.equal(e.get('folioRoom' + room).href, `./room-0${room}/index.html`);
  assert.deepEqual(folioLines(e), ENOUGH);
  assert.equal(e.writes(), 0);
});
test('all six folio readings follow the chosen preview without storage or history', () => {
  const e = environment();
  for (const [seed, expected] of [['hush', HUSH], ['elsewhere', ELSEWHERE], ['enough', ENOUGH]]) {
    e.click(seed);
    assert.equal(e.get('folioSource').textContent, seed);
    assert.deepEqual(folioLines(e), expected);
  }
  assert.equal(e.writes(), 0); assert.equal(e.eventLog.length, 0);
});
test('the folio returns the exact source word unchanged for every preview', () => {
  const e = environment();
  assert.equal(e.get('folioReturnLabel').textContent, 'Returned');
  for (const seed of ['enough', 'hush', 'elsewhere']) {
    e.click(seed);
    assert.equal(e.get('folioReturn').textContent, seed);
    assert.equal(e.get('folioSource').textContent, seed);
    assert.notEqual(e.get('folioReturn').textContent, e.get('folioReading6').textContent);
  }
  assert.equal(e.writes(), 0);
});
test('confirmed erasure immediately empties folio source, six readings and return', () => {
  const e = environment({ initial: { traces: [word('hush')] } });
  e.click('clearIntervalWord'); assertEmptyFolio(e);
  assert.equal(e.saved().traces.length, 0);
  assert.equal(e.writes(), 1);
  assert.deepEqual(e.eventLog.map(event => event.type), ['ai-salon-word-cleared']);
});
test('room hover and focus after erasure never repopulate the empty folio', () => {
  const e = environment({ initial: { traces: [word('elsewhere')] } }); e.click('clearIntervalWord');
  const writes = e.writes(), events = e.eventLog.length;
  for (let room = 1; room <= 6; room++) {
    for (const type of ['pointerenter', 'pointerleave', 'focus', 'blur']) {
      e.get('room' + room).dispatchEvent({ type }); assertEmptyFolio(e);
    }
  }
  assert.equal(e.writes(), writes); assert.equal(e.eventLog.length, events);
  assert.equal(e.get('carryIntervalWord').disabled, true);
});
test('spacing controls change only presentation and keep their pressed state exact', () => {
  const prior = { traces: [word('hush')], archives: [{ traces: [word('enough')] }] };
  const e = environment({ initial: prior });
  e.click('folioDistance');
  assert.equal(e.get('intervalFolio').classList.contains('is-apart'), true);
  assert.equal(e.get('folioDistance').getAttribute('aria-pressed'), 'true');
  assert.equal(e.get('folioDistance').getAttribute('aria-controls'), 'folioSheet');
  assert.equal(e.get('folioDistance').textContent, 'Bring them closer');
  assert.deepEqual(folioLines(e), HUSH);
  e.click('folioDistance');
  assert.equal(e.get('intervalFolio').classList.contains('is-apart'), false);
  assert.equal(e.get('folioDistance').getAttribute('aria-pressed'), 'false');
  assert.equal(e.get('folioDistance').textContent, 'Give the words room');
  assert.deepEqual(e.saved(), prior); assert.equal(e.writes(), 0); assert.equal(e.eventLog.length, 0);
});
test('spacing an empty folio does not restore erased content or record its absence', () => {
  const e = environment({ initial: { traces: [word('enough')] } }); e.click('clearIntervalWord');
  const writes = e.writes(), events = e.eventLog.length;
  e.click('folioDistance'); assertEmptyFolio(e);
  e.click('folioDistance'); assertEmptyFolio(e);
  assert.equal(e.writes(), writes); assert.equal(e.eventLog.length, events);
  assert.equal(e.saved().traces.length, 0);
});
test('a different preview never silently replaces the word still being carried', () => {
  const e = environment({ initial: { traces: [word('hush')] } }); e.click('elsewhere');
  assert.equal(e.get('folioSource').textContent, 'elsewhere'); assert.equal(e.get('folioReturn').textContent, 'elsewhere');
  assert.deepEqual(folioLines(e), ELSEWHERE);
  assert.equal(e.context.SalonIntervalScore.carriedWord(), 'hush');
  assert.equal(e.saved().traces[0].label, 'hush');
  assert.match(e.get('intervalStatus').textContent, /“hush” is being carried/);
  assert.deepEqual(e.doc.querySelectorAll('.score-carried').map(node => node.textContent), HUSH.map(line => `“${line}”`));
  assert.equal(e.writes(), 0); assert.equal(e.eventLog.length, 0);
});
test('a new preview revives the folio after erasure without reviving carrying', () => {
  const e = environment({ initial: { traces: [word('enough')] } }); e.click('clearIntervalWord');
  const writes = e.writes(); e.click('hush');
  assert.equal(e.get('intervalFolio').classList.contains('is-empty'), false);
  assert.equal(e.get('folioSource').textContent, 'hush'); assert.equal(e.get('folioReturn').textContent, 'hush');
  assert.deepEqual(folioLines(e), HUSH); assert.equal(e.writes(), writes);
  assert.equal(e.context.SalonIntervalScore.carriedWord(), null); assert.equal(e.get('carryIntervalWord').disabled, false);
});
test('failed erasure leaves the folio visible and reports uncertainty', () => {
  const e = environment({ initial: { traces: [word('hush')] }, denyWrite: true }); e.click('clearIntervalWord');
  assert.equal(e.get('folioSource').textContent, 'hush'); assert.equal(e.get('folioReturn').textContent, 'hush');
  assert.deepEqual(folioLines(e), HUSH); assert.equal(e.get('intervalFolio').classList.contains('is-empty'), false);
  assert.match(e.get('intervalStatus').textContent, /could not confirm/); assert.equal(e.writes(), 0);
});
test('reload preserves neither folio spacing nor a memorial of erasure', () => {
  const e = environment({ initial: { traces: [word('hush')] } }); e.click('folioDistance'); e.click('clearIntervalWord');
  const reloaded = e.reload();
  assert.equal(reloaded.get('intervalFolio').classList.contains('is-apart'), false);
  assert.equal(reloaded.get('intervalFolio').classList.contains('is-empty'), false);
  assert.equal(reloaded.get('folioSource').textContent, 'enough'); assert.deepEqual(folioLines(reloaded), ENOUGH);
  assert.equal(reloaded.writes(), 0);
});

console.log(`${passed} passed; ${failed} failed. Fake DOM only, no browser/network.`);
process.exitCode = failed ? 1 : 0;
