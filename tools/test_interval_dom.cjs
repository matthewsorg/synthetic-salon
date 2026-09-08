'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const stateSource = fs.readFileSync(root + '/shared/gallery-state.js', 'utf8');
const scoreSource = fs.readFileSync(root + '/shared/interval-score.js', 'utf8');
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
console.log(`${passed} passed; ${failed} failed. Fake DOM only, no browser/network.`);
process.exitCode = failed ? 1 : 0;
