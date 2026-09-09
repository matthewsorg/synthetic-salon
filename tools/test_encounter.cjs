'use strict';
// Whole-script, real-markup fixture. No browser, network, dependencies, or checkout writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = process.argv[2] || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'encounter/app.js'), 'utf8');
const markup = fs.readFileSync(path.join(root, 'encounter/index.html'), 'utf8');
const digest = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
const decode = s => s.replace(/&(?:amp|quot|apos|lt|gt|#39|#x27);/g, x => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'",'&lt;':'<','&gt;':'>'}[x]));
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
  dispatchEvent(event) { event.target ||= this; for (const fn of this.listeners.get(event.type) || []) fn(event); }
}
class Element extends Events {
  constructor(tag, attrs = {}) {
    super(); this.tagName = tag.toUpperCase(); this.children = []; this.parentElement = null;
    this.attrs = {}; this.dataset = {}; this.className = ''; this.hidden = false; this.disabled = false; this._text = ''; this.value = '';
    this.style = { setProperty(name, value) { this[name] = String(value); }, getPropertyValue(name) { return this[name] || ''; } };
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        const enabled = force === undefined ? !classes.has(name) : Boolean(force);
        if (enabled) classes.add(name); else classes.delete(name);
        this.className = [...classes].join(' '); return enabled;
      }
    };
    Object.entries(attrs).forEach(([name, value]) => this.setAttribute(name, value));
  }
  setAttribute(name, value) {
    this.attrs[name] = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'hidden') this.hidden = true;
    if (name === 'disabled') this.disabled = true;
    if (name === 'value') this.value = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
  }
  getAttribute(name) { return Object.hasOwn(this.attrs, name) ? this.attrs[name] : null; }
  append(node) {
    if (node.parentElement) node.parentElement.children = node.parentElement.children.filter(n => n !== node);
    node.parentElement = this; this.children.push(node);
  }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(n => n.textContent).join(''); }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('[')) return Object.hasOwn(this.attrs, selector.slice(1, -1));
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) { return this.children.flatMap(n => [...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  click() { if (!this.disabled) this.dispatchEvent({ type: 'click' }); }
}
function parse(html) {
  const root = new Element('document'), stack = [root];
  const voids = new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR']);
  for (const token of html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/g) || []) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([^\s>]+)/)[1].toUpperCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tagName === tag) { stack.length = i; break; }
    } else if (token.startsWith('<')) {
      const match = token.match(/^<([^\s/>]+)([\s\S]*?)\/?\s*>$/); assert(match, `parse start tag: ${token}`);
      const attrs = {};
      for (const item of match[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[item[1]] = decode(item[2] ?? item[3] ?? item[4] ?? '');
      const el = new Element(match[1], attrs); stack.at(-1).append(el);
      if (!voids.has(el.tagName) && !token.endsWith('/>')) stack.push(el);
    } else {
      const text = new Element('#text'); text.textContent = decode(token); stack.at(-1).append(text);
    }
  }
  return root;
}
function environment({ reduced = false, legacy = false, visibility = 'visible' } = {}) {
  const tree = parse(markup), doc = new Events(), accesses = [];
  doc.body = tree.querySelector('body'); assert(doc.body, 'actual markup supplies body');
  doc.documentElement = tree.querySelector('html');
  doc.visibilityState = visibility;
  doc.querySelectorAll = selector => tree.querySelectorAll(selector);
  doc.querySelector = selector => tree.querySelector(selector);
  doc.getElementById = id => {
    const walk = node => node.getAttribute('id') === id ? node : node.children.map(walk).find(Boolean);
    return walk(tree) || null;
  };
  const query = new Events(); query.matches = reduced;
  if (legacy) { query.addListener = fn => Events.prototype.addEventListener.call(query, 'change', fn); query.addEventListener = undefined; }
  const sandbox = { document: doc, console, matchMedia: text => { assert.equal(text, '(prefers-reduced-motion: reduce)'); return query; } };
  const trap = (object, name) => Object.defineProperty(object, name, { configurable: true, get() { accesses.push(name); throw Error(`Unexpected API access: ${name}`); } });
  for (const name of ['localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','AudioContext','webkitAudioContext','requestAnimationFrame','setTimeout','setInterval']) trap(sandbox, name);
  const navigator = {}; trap(navigator, 'sendBeacon'); trap(navigator, 'serviceWorker'); sandbox.navigator = navigator;
  trap(doc, 'cookie'); sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, { filename: 'encounter/app.js' });
  const get = id => { const el = doc.getElementById(id); assert(el, `actual markup supplies #${id}`); return el; };
  const buttons = doc.querySelectorAll('[data-reading]').filter(e => e.tagName === 'BUTTON');
  function click(el) {
    for (let current = el; current; current = current.parentElement) assert.equal(current.hidden, false, `user control ${el.getAttribute('id') || el.dataset.reading} is reachable`);
    el.click();
  }
  return {
    get, doc, query, buttons, accesses,
    choose(key) { const el = buttons.find(b => b.dataset.reading === key); assert(el, `choice ${key} exists`); click(el); },
    click(id) { click(get(id)); },
    input(value) { const el = get('reflectionAngle'); el.value = String(value); el.dispatchEvent({ type: 'input' }); },
    reduce(matches) { query.matches = matches; query.dispatchEvent({ type: 'change' }); },
    visibility(value) { doc.visibilityState = value; doc.dispatchEvent({ type: 'visibilitychange' }); },
    clean() { assert.deepEqual(accesses, [], 'no storage, network, audio, cookie, worker, or autonomous clock API accessed'); },
    q: selector => doc.querySelector(selector),
  };
}
const AUTHOR = {
  source: ['The common description','Before interpretation','A pale ceramic loop holds a silver sphere across an impossible gap.'],
  claude: ['Claude · adapted by Codex','Seen Once, Not Twice','You may see the cut, or its reflection, but not both.'],
  qwen: ['Qwen · adapted by Codex','Vermilion Gap Suspended','The sphere holds the space between what is broken and what remains.'],
  gemini: ['Gemini · adapted by Codex','The Split Reflection','The mirror holds a gap wider than the one before you.']
};
const SOURCE_DESCRIPTION = 'An ivory ceramic loop with a red cut and a silver sphere suspended inside it.';
const CLAUDE_DIRECT = 'The ceramic cut faces you. The silver sphere shows a pale band with no red.';
const CLAUDE_REFLECTED = 'The cut is hidden. A red mark appears only in the silver sphere.';
let passed = 0, failed = 0;
const fixtures = [];
const env = opts => { const e = environment(opts); fixtures.push(e); return e; };
function test(name, run) {
  fixtures.length = 0;
  try { run(); fixtures.forEach(e => e.clean()); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); }
}
function checkChoice(e, key) {
  assert.equal(e.get('objectView').dataset.reading, key);
  for (const button of e.buttons) assert.equal(button.getAttribute('aria-pressed'), String(button.dataset.reading === key));
  assert.equal(e.buttons.filter(b => b.getAttribute('aria-pressed') === 'true').length, 1);
  for (const k of Object.keys(AUTHOR)) assert.equal(e.get(k + 'Controls').hidden, k !== key);
  for (const [i, id] of ['readingAuthor','readingTitle','readingLine'].entries()) assert.equal(e.get(id).textContent, AUTHOR[key][i]);
}
function checkMotion(e, { active, consent, disabled, label }) {
  assert.equal(e.doc.body.classList.contains('motion-enabled'), active);
  assert.equal(e.doc.body.classList.contains('motion-paused'), !active);
  assert.equal(e.get('motionChoice').getAttribute('aria-pressed'), String(consent));
  assert.equal(e.get('motionChoice').disabled, disabled);
  assert.equal(e.get('motionChoice').textContent, label);
}
function checkClaude(e, turned) {
  assert.equal(e.q('.object-source').style.opacity, '0');
  assert.equal(e.q('.object-claude-direct').hidden, turned);
  assert.equal(e.q('.object-claude-reflected').hidden, !turned);
  assert.equal([e.q('.object-claude-direct'),e.q('.object-claude-reflected')].filter(el => !el.hidden).length, 1);
  assert.equal(e.q('.object-qwen-light').hidden, true);
  assert.equal(e.q('.reflection-window').hidden, true);
  assert.equal(e.get('objectView').getAttribute('aria-label'), turned ? CLAUDE_REFLECTED : CLAUDE_DIRECT);
  assert.equal(e.get('turnObject').getAttribute('aria-pressed'), String(turned));
  assert.equal(e.get('turnObject').textContent, turned ? 'Turn to the cut ↙' : 'Turn to the reflection ↗');
}

test('actual markup has four choices, labelled range endpoints, source state, and transitions off on load', () => {
  const e = env(); assert.deepEqual(e.buttons.map(b => b.dataset.reading), ['source','claude','qwen','gemini']);
  checkChoice(e, 'source'); assert.equal(e.get('objectView').getAttribute('role'),'img');
  assert.equal(e.get('objectView').getAttribute('aria-label'), SOURCE_DESCRIPTION);
  assert.equal(e.get('objectStatus').getAttribute('role'),'status');
  assert.equal(e.get('objectStatus').textContent,'Nothing you do in this room is saved.');
  assert.equal(e.q('.object-source').style.opacity,'1');
  for (const selector of ['.object-claude-direct','.object-claude-reflected','.object-qwen-light','.reflection-window']) assert.equal(e.q(selector).hidden,true);
  assert.equal(e.get('reflectionAngle').getAttribute('min'),'0'); assert.equal(e.get('reflectionAngle').getAttribute('max'),'180');
  assert.equal(e.get('reflectionAngle').getAttribute('step'),'1'); assert.equal(e.get('reflectionAngle').value,'0');
  assert.equal(e.get('reflectionAngle').getAttribute('aria-describedby'),'reflectionHelp');
  assert(e.doc.querySelectorAll('label').some(n => n.getAttribute('for') === 'reflectionAngle'));
  checkMotion(e, {active:false,consent:false,disabled:false,label:'Allow slow transitions'});
});

test('all four reading choices update exclusive pressed state, controls, credits, description, and live status', () => {
  const e = env();
  for (const key of ['claude','qwen','gemini','source']) {
    e.choose(key); checkChoice(e,key);
    assert.equal(e.get('objectStatus').textContent, key === 'source' ? 'Nothing you do in this room is saved.' : `${AUTHOR[key][1]}. ${e.get('objectView').getAttribute('aria-label')}`);
    assert.equal(e.q('.object-source').style.opacity,key === 'claude' ? '0' : '1');
  }
});

test('Claude alternates exact mutually exclusive red-image hidden flags and accessible descriptions', () => {
  const e=env(); e.choose('claude'); checkClaude(e,false);
  for (const turned of [true,false,true,false]) { e.click('turnObject'); checkClaude(e,turned); assert.equal(e.get('objectStatus').textContent,turned ? CLAUDE_REFLECTED : CLAUDE_DIRECT); }
});

test('Claude exclusivity remains exact with transitions enabled and while switching other readings', () => {
  const e=env(); e.click('motionChoice'); e.choose('claude'); e.click('turnObject'); checkClaude(e,true);
  for(const key of ['source','qwen','gemini']) { e.choose(key); assert(e.q('.object-claude-direct').hidden); assert(e.q('.object-claude-reflected').hidden); }
  e.choose('claude'); checkClaude(e,true); e.click('turnObject'); checkClaude(e,false);
});

test('Qwen has exactly two light states, correct shadow descriptions, and no synthetic mirror overlay', () => {
  const e=env(); e.choose('qwen');
  for(const moved of [false,true,false]) {
    if(moved !== (e.get('moveLight').getAttribute('aria-pressed') === 'true')) e.click('moveLight');
    assert.equal(e.q('.object-qwen-light').hidden,false); assert.equal(e.q('.object-qwen-light').style.opacity,moved?'1':'0');
    assert.equal(e.q('.object-source').style.opacity,'1'); assert.equal(e.q('.reflection-window').hidden,true);
    assert.equal(e.get('moveLight').getAttribute('aria-pressed'),String(moved));
    assert.equal(e.get('moveLight').textContent,moved?'Return the light ↙':'Move the light ↗');
    assert.equal(e.get('objectView').getAttribute('aria-label'),SOURCE_DESCRIPTION+(moved?' Light enters from lower right; the shadow falls left.':' Light enters from upper left; the shadow falls right.'));
  }
  e.click('moveLight'); assert.equal(e.get('objectStatus').textContent,'Lower-right light. The shadow falls left.');
  e.click('moveLight'); assert.equal(e.get('objectStatus').textContent,'Upper-left light. The shadow falls right.');
});

test('Gemini range at 0, 180 and 90 updates only inner reflection angle and image description', () => {
  const e=env(); e.choose('gemini');
  for(const angle of [0,180,90,0]) {
    e.input(angle); assert.equal(e.q('.reflection-window').hidden,false);
    assert.equal(e.q('.reflection-window').style.getPropertyValue('--reflection-angle'),`${angle}deg`);
    assert.equal(e.get('objectView').getAttribute('aria-label'),`${SOURCE_DESCRIPTION} Only the inner reflection has turned ${angle} degrees.`);
    assert.equal(e.q('.object-source').style.opacity,'1'); assert.equal(e.q('.object-source').style.transform,undefined);
    assert.equal(e.q('.object-claude-direct').hidden,true); assert.equal(e.q('.object-claude-reflected').hidden,true); assert.equal(e.q('.object-qwen-light').hidden,true);
  }
});

test('reading-specific choices survive switching inside this page without leaking into other images', () => {
  const e=env(); e.choose('claude'); e.click('turnObject'); e.choose('qwen'); e.click('moveLight'); e.choose('gemini'); e.input(180);
  e.choose('source'); assert.equal(e.get('objectView').getAttribute('aria-label'),SOURCE_DESCRIPTION);
  e.choose('claude'); checkClaude(e,true); e.choose('qwen'); assert.equal(e.q('.object-qwen-light').style.opacity,'1'); assert.equal(e.q('.reflection-window').hidden,true);
  e.choose('gemini'); assert.equal(e.q('.reflection-window').style.getPropertyValue('--reflection-angle'),'180deg');
});

test('spacing toggles only triptych presentation with exact pressed state and control label', () => {
  const e=env(); const triptych=e.get('readingTriptych'); assert.equal(e.get('bringCloser').getAttribute('aria-controls'),'readingTriptych');
  assert.equal(triptych.classList.contains('is-close'),false); e.click('bringCloser');
  assert.equal(triptych.classList.contains('is-close'),true); assert.equal(e.get('bringCloser').getAttribute('aria-pressed'),'true'); assert.equal(e.get('bringCloser').textContent,'Give each reading room ↔');
  checkChoice(e,'source'); e.click('bringCloser');
  assert.equal(triptych.classList.contains('is-close'),false); assert.equal(e.get('bringCloser').getAttribute('aria-pressed'),'false'); assert.equal(e.get('bringCloser').textContent,'Bring the readings closer ↔');
});

test('motion begins only after user opt-in and stops exactly on a second click', () => {
  const e=env(); e.choose('qwen'); e.click('moveLight'); e.click('bringCloser');
  checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
  e.click('motionChoice'); checkMotion(e,{active:true,consent:true,disabled:false,label:'Stop transitions'});
  e.click('motionChoice'); checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
});

test('initial reduced-motion preference disables motion and rejects even a forced click handler', () => {
  const e=env({reduced:true}); checkMotion(e,{active:false,consent:false,disabled:true,label:'Motion off · device preference'});
  e.get('motionChoice').dispatchEvent({type:'click'}); checkMotion(e,{active:false,consent:false,disabled:true,label:'Motion off · device preference'});
  e.choose('claude'); e.click('turnObject'); checkClaude(e,true); e.click('bringCloser');
});

test('a runtime reduced-motion change stops transitions and does not revive old opt-in when lifted', () => {
  const e=env(); e.click('motionChoice'); e.reduce(true);
  checkMotion(e,{active:false,consent:false,disabled:true,label:'Motion off · device preference'});
  e.reduce(false); checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
  e.click('motionChoice'); checkMotion(e,{active:true,consent:true,disabled:false,label:'Stop transitions'});
});

test('legacy media-query change listener honors reduced-motion changes', () => {
  const e=env({legacy:true}); e.click('motionChoice'); e.reduce(true);
  checkMotion(e,{active:false,consent:false,disabled:true,label:'Motion off · device preference'});
  e.reduce(false); checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
});

test('hidden pages pause active transitions and resume only an existing unrevoked opt-in', () => {
  const e=env(); e.visibility('hidden'); checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
  e.visibility('visible'); checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
  e.click('motionChoice'); e.visibility('hidden'); checkMotion(e,{active:false,consent:true,disabled:false,label:'Stop transitions'});
  e.visibility('visible'); checkMotion(e,{active:true,consent:true,disabled:false,label:'Stop transitions'});
  e.visibility('hidden'); e.reduce(true); e.reduce(false); e.visibility('visible');
  checkMotion(e,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
});

test('a fresh page resets all ephemeral choices and needs a new motion opt-in', () => {
  const e=env(); e.choose('claude'); e.click('turnObject'); e.choose('qwen'); e.click('moveLight'); e.choose('gemini'); e.input(180); e.click('bringCloser'); e.click('motionChoice');
  const fresh=env(); checkChoice(fresh,'source'); assert.equal(fresh.get('reflectionAngle').value,'0');
  assert.equal(fresh.get('readingTriptych').classList.contains('is-close'),false); assert.equal(fresh.get('bringCloser').getAttribute('aria-pressed'),'false');
  checkMotion(fresh,{active:false,consent:false,disabled:false,label:'Allow slow transitions'});
  fresh.choose('claude'); checkClaude(fresh,false); fresh.choose('qwen'); assert.equal(fresh.get('moveLight').getAttribute('aria-pressed'),'false'); assert.equal(fresh.q('.object-qwen-light').style.opacity,'0');
});

console.log(`${passed} passed; ${failed} failed. Actual encounter/app.js sha256 ${digest}; real HTML fixture; no browser, network, or visual assertions.`);
process.exitCode=failed?1:0;
