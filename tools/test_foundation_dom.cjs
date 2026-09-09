'use strict';
// Bounded DOM fixture for real Foundation + interval scripts and actual public markup.
// Decorative canvas drawing and unrelated room scores are deliberately not executed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = process.argv[2] || path.resolve(__dirname, '..');
const files = ['shared/gallery-state.js','shared/salon-foundation.js','shared/interval-score.js','shared/wayfinding.js'];
const sources = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(root,file),'utf8')]));
const customsSource = fs.readFileSync(path.join(root,'room-04/app.js'),'utf8');
const bindingStart = customsSource.indexOf('function bindCustomsExit()');
const bindingEnd = customsSource.indexOf('function setQwenPressure(',bindingStart);
assert(bindingStart >= 0 && bindingEnd > bindingStart, 'actual Room 04 customs binding source located');
const bindingSource = customsSource.slice(bindingStart,bindingEnd) + '\nbindCustomsExit();';
const digest = crypto.createHash('sha256').update(sources['shared/salon-foundation.js']).digest('hex').slice(0,12);
const decode = text => text.replace(/&(?:amp|quot|apos|lt|gt|#39|#x27);/g, x => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'",'&lt;':'<','&gt;':'>'}[x]));
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn, options={}) { if(!this.listeners.has(type)) this.listeners.set(type,[]); this.listeners.get(type).push({fn,once:Boolean(options.once)}); }
  dispatchEvent(event) {
    if(!event.target) event.target=this;
    for(const entry of [...(this.listeners.get(event.type)||[])]) {
      if(entry.once) this.listeners.set(event.type,this.listeners.get(event.type).filter(e=>e!==entry));
      entry.fn(event);
    }
  }
}
class Element extends Events {
  constructor(tag, attrs={}, owner=null) {
    super(); this.tagName=tag.toUpperCase(); this.attrs={}; this.dataset={}; this.children=[]; this.parentElement=null; this.ownerDocument=owner;
    this.className=''; this.hidden=false; this.disabled=false; this.open=false; this.value=''; this._text='';
    this.style={setProperty(name,value){this[name]=String(value);},getPropertyValue(name){return this[name]||'';},removeProperty(name){delete this[name];}};
    this.classList={
      contains:name=>this.className.split(/\s+/).includes(name),
      add:(...names)=>{for(const name of names)this.classList.toggle(name,true);},
      remove:(...names)=>{for(const name of names)this.classList.toggle(name,false);},
      toggle:(name,force)=>{const set=new Set(this.className.split(/\s+/).filter(Boolean));const yes=force===undefined?!set.has(name):Boolean(force);if(yes)set.add(name);else set.delete(name);this.className=[...set].join(' ');return yes;}
    };
    Object.entries(attrs).forEach(([name,value])=>this.setAttribute(name,value));
  }
  get id(){return this.attrs.id||'';} set id(value){this.attrs.id=String(value);}
  get href(){const value=this.attrs.href||'';return new URL(value,this.ownerDocument?.location.href||'https://synthetic.salon/').href;} set href(value){this.attrs.href=String(value);}
  get src(){return new URL(this.attrs.src||'',this.ownerDocument?.location.href||'https://synthetic.salon/').href;} set src(value){this.attrs.src=String(value);}
  get parentNode(){return this.parentElement;}
  get nextElementSibling(){if(!this.parentElement)return null;const siblings=this.parentElement.children;return siblings.slice(siblings.indexOf(this)+1).find(n=>n.tagName!=='#TEXT')||null;}
  setAttribute(name,value){this.attrs[name]=String(value);if(name==='class')this.className=String(value);if(name==='hidden')this.hidden=true;if(name==='disabled')this.disabled=true;if(name==='open')this.open=true;if(name==='value')this.value=String(value);if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
  getAttribute(name){if(name==='class')return this.className;return Object.hasOwn(this.attrs,name)?this.attrs[name]:null;}
  remove(){if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(n=>n!==this);this.parentElement=null;}}
  append(...nodes){for(let node of nodes){if(typeof node==='string'){const text=new Element('#text',{},this.ownerDocument);text.textContent=node;node=text;}node.remove();node.parentElement=this;node.ownerDocument=this.ownerDocument;this.children.push(node);}}
  prepend(...nodes){for(const node of nodes.slice().reverse()){node.remove();node.parentElement=this;node.ownerDocument=this.ownerDocument;this.children.unshift(node);}}
  insertAdjacentElement(position,node){assert.equal(position,'afterend','fixture implements only used insertion position');assert(this.parentElement);const parent=this.parentElement;node.remove();node.parentElement=parent;node.ownerDocument=this.ownerDocument;parent.children.splice(parent.children.indexOf(this)+1,0,node);return node;}
  set textContent(value){for(const child of this.children)child.parentElement=null;this._text=String(value);this.children=[];}
  get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
  set innerHTML(value){assert.equal(value,'','fixture implements only trace-list clearing');this.textContent='';}
  contains(node){for(let n=node;n;n=n.parentElement)if(n===this)return true;return false;}
  simpleMatch(selector){
    const attrs=[...selector.matchAll(/\[([^\]=*\s]+)\s*(?:(\*=|=)\s*["']?([^\]"']*)["']?)?\]/g)];
    const bare=selector.replace(/\[[^\]]*\]/g,'');
    assert(!/[\[\]:>+~]/.test(bare),`unsupported fixture selector: ${selector}`);
    const tag=bare.match(/^[\w*-]+/);if(tag&&tag[0]!=='*'&&this.tagName!==tag[0].toUpperCase())return false;
    const id=bare.match(/#([\w-]+)/);if(id&&this.id!==id[1])return false;
    for(const cls of bare.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(cls[1]))return false;
    for(const [,name,op,value] of attrs){const found=this.getAttribute(name);if(found===null)return false;if(op==='='&&found!==value)return false;if(op==='*='&&!found.includes(value))return false;}
    return this.tagName!=='#TEXT';
  }
  matches(selector){return selector.split(',').some(part=>{const pieces=part.trim().split(/\s+(?![^\[]*\])/);let node=this;let i=pieces.length-1;if(!node.simpleMatch(pieces[i]))return false;while(--i>=0){node=node.parentElement;while(node&&!node.simpleMatch(pieces[i]))node=node.parentElement;if(!node)return false;}return true;});}
  closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  focus(){if(!this.disabled&&!this.hidden)this.ownerDocument.activeElement=this;}
  click(){if(!this.disabled){this.focus();this.dispatchEvent({type:'click',button:0});}}
  getContext(){assert.equal(this.tagName,'CANVAS');this.ownerDocument.canvasAttempts++;return null;}
}
function parse(html){
  const tree=new Element('document'),stack=[tree];const voids=new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR']);
  for(const token of html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/g)||[]){
    if(token.startsWith('<!'))continue;
    if(token.startsWith('</')){const tag=token.match(/^<\/([^\s>]+)/)[1].toUpperCase();for(let i=stack.length-1;i>0;i--)if(stack[i].tagName===tag){stack.length=i;break;}}
    else if(token.startsWith('<')){const m=token.match(/^<([^\s/>]+)([\s\S]*?)\/?\s*>$/);assert(m);const attrs={};for(const a of m[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=decode(a[2]??a[3]??a[4]??'');const el=new Element(m[1],attrs);stack.at(-1).append(el);if(!voids.has(el.tagName)&&!token.endsWith('/>'))stack.push(el);}
    else{const text=new Element('#text');text.textContent=decode(token);stack.at(-1).append(text);}
  }return tree;
}
const WORD={id:'word-active',score:'interval:word',label:'enough',effect:'a carried word'};
const OTHER={id:'other-work',score:'other:kept',label:'Unrelated work',effect:'must survive'};
const INITIAL={traces:[WORD,OTHER,{id:'older-word',score:'interval:word',label:'hush'}],archives:[{id:'sealed-copy',traces:[{id:'archive-word',score:'interval:word',label:'elsewhere'}]}],motions:[{id:'motion-kept'}],directives:[{id:'directive-kept'}],studioKeys:[{id:'key-kept',status:'active'}]};
function environment({page='room-04/index.html',pathname,initial=INITIAL,ready='loading'}={}){
  const markup=fs.readFileSync(path.join(root,page),'utf8');const tree=parse(markup);const doc=new Events();
  doc.location=new URL(pathname||('/'+page.replace(/index\.html$/,'')),'https://synthetic.salon');doc.readyState=ready;doc.visibilityState='visible';doc.canvasAttempts=0;
  function own(node){node.ownerDocument=doc;node.children.forEach(own);}own(tree);
  doc.body=tree.querySelector('body');doc.documentElement=tree.querySelector('html');doc.activeElement=doc.body;
  doc.querySelectorAll=s=>tree.querySelectorAll(s);doc.querySelector=s=>tree.querySelector(s);
  doc.getElementById=id=>{const walk=n=>n.id===id?n:n.children.map(walk).find(Boolean);return walk(tree)||null;};
  doc.createElement=tag=>new Element(tag,{},doc);doc.createTextNode=text=>{const n=new Element('#text',{},doc);n.textContent=text;return n;};
  const bus=new Events(),events=[],accesses=[],storageCalls=[],calls=[];let stored=JSON.stringify(initial),writes=0;
  const query=new Events();query.matches=true; // No decorative animation: null canvas is also explicitly supported.
  const sandbox={document:doc,location:doc.location,URL,Intl,Date,Math,console,navigator:{},matchMedia:()=>query,
    localStorage:{getItem(key){storageCalls.push(['get',key]);return stored;},setItem(key,value){storageCalls.push(['set',key]);writes++;stored=String(value);}},
    CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},
    addEventListener:bus.addEventListener.bind(bus),dispatchEvent:event=>{events.push(event);bus.dispatchEvent(event);},
    beginCustomsExit:(event,anchor)=>calls.push({event,anchor})
  };
  const trap=name=>Object.defineProperty(sandbox,name,{get(){accesses.push(name);throw Error(`unexpected API: ${name}`);}});
  for(const name of ['fetch','XMLHttpRequest','WebSocket','EventSource','AudioContext','webkitAudioContext','sessionStorage','requestAnimationFrame','setTimeout','setInterval'])trap(name);
  sandbox.window=sandbox;const context=vm.createContext(sandbox);
  const original=doc.querySelector('.topbar [data-customs-exit]');const originalTitle=doc.querySelector('h1');const pulse=doc.getElementById('pulseDot'),status=doc.getElementById('statusText');
  let directSpy=0;if(original)original.addEventListener('click',()=>directSpy++);
  const executed=[];
  for(const script of doc.querySelectorAll('script')){
    const file=new URL(script.src).pathname.slice(1);
    if(sources[file]){doc.currentScript=script;vm.runInContext(sources[file],context,{filename:file});executed.push(file);}
    else if(file==='room-04/app.js'){doc.currentScript=script;vm.runInContext(bindingSource,context,{filename:'room-04/app.js:actual-customs-binding'});executed.push('room-04:actual-customs-binding');}
  }
  doc.currentScript=null;
  function mount(){if(doc.readyState==='loading'){doc.readyState='interactive';doc.dispatchEvent({type:'DOMContentLoaded'});doc.readyState='complete';}}
  return{doc,original,originalTitle,pulse,status,calls,events,executed,sandbox,accesses,storageCalls,mount,q:s=>doc.querySelector(s),all:s=>doc.querySelectorAll(s),writes:()=>writes,saved:()=>JSON.parse(stored),spy:()=>directSpy,
    rerun(){doc.currentScript={src:'https://synthetic.salon/shared/salon-foundation.js'};vm.runInContext(sources['shared/salon-foundation.js'],context);doc.currentScript=null;},
    clean(){assert.deepEqual(accesses,[]);assert(storageCalls.every(([,key])=>key==='ai-salon-gallery-state-v1'),'only existing memory key used');}
  };
}
let passed=0,failed=0;let fixtures=[];const env=options=>{const e=environment(options);fixtures.push(e);return e;};
function test(name,run){fixtures=[];try{run();fixtures.forEach(e=>e.clean());passed++;console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+'\n'+error.stack);}}
function routeAtExit(e){const main=e.q('main'),route=e.q('.salon-route'),footer=e.q('.salon-colophon');assert(route);assert.equal(main.nextElementSibling,route,'route is immediately after actual main');assert.equal(route.parentElement,main.parentElement);assert(main.parentElement.children.indexOf(route)<main.parentElement.children.indexOf(footer),'route precedes actual footer');assert.equal(e.all('.salon-route').length,1);assert.equal(route.querySelector('.salon-route__all'),null);assert.equal(e.q('.salon-foundation').parentElement,footer);assert.equal(e.q('.salon-foundation__map'),null);assert.equal(e.all('.salon-season-tag').length,0);return route;}

test('actual Room 04 DOMContentLoaded order mounts an exit and preserves the already-bound original anchor',()=>{
  const e=env();assert(e.original);assert.equal(e.q('.salon-route'),null,'route has not been fabricated by fixture');
  assert.deepEqual(e.executed,['shared/gallery-state.js','shared/salon-foundation.js','room-04:actual-customs-binding','shared/interval-score.js','shared/wayfinding.js']);
  assert.equal(e.calls.length,0);e.mount();const route=routeAtExit(e),next=route.querySelector('.salon-route__step--next');
  assert.equal(next,e.original,'original DOM node identity retained');assert.equal(e.q('.topbar [data-customs-exit]'),null,'old parent no longer owns moved node');
  assert.equal(e.all('[data-customs-exit]').length,1);assert.equal(next.href,'https://synthetic.salon/room-05/index.html');
  assert.equal(e.q('h1'),e.originalTitle);next.click();assert.equal(e.spy(),1);assert.equal(e.calls.length,1);assert.equal(e.calls[0].anchor,next);assert.equal(e.calls[0].event.button,0);
  assert.equal(e.writes(),0,'mounting and test handler do not write memory');assert.equal(e.doc.canvasAttempts,1,'navigation succeeds without canvas context');
});

test('the actual interval script mounts Room 04 source and reading inside Foundation’s real exit',()=>{
  const e=env();e.mount();const route=routeAtExit(e),margin=e.q('.interval-margin');assert(margin);assert.equal(margin.parentElement,route);assert.equal(e.all('.interval-margin').length,1);assert.equal(margin.hidden,false);
  const pair=margin.querySelector('.interval-translation');assert(pair);assert.deepEqual(pair.querySelectorAll('p').map(n=>n.textContent),['enough','enough for whom?']);
  assert.equal(e.doc.body.dataset.intervalWord,'enough');assert.equal(e.writes(),0);assert.deepEqual(e.saved(),INITIAL);
});

test('setting down from the moved margin clears only active word traces and focuses the same customs anchor',()=>{
  const e=env();e.mount();const margin=e.q('.interval-margin');margin.querySelector('.interval-margin__clear').click();
  assert.equal(e.doc.activeElement,e.original);assert.equal(e.writes(),1);const saved=e.saved();assert.deepEqual(saved.traces,[OTHER]);
  for(const key of ['archives','motions','directives','studioKeys'])assert.deepEqual(saved[key],INITIAL[key]);
  assert.deepEqual(e.events.map(event=>event.type),['ai-salon-word-cleared']);assert.equal(e.events[0].detail.cleared,true);
  assert.equal(margin.hidden,false);assert(margin.classList.contains('is-released'));assert.equal(margin.querySelector('.interval-margin__clear').hidden,true);
  assert.equal(margin.querySelector('.interval-translation').hidden,true);assert.deepEqual(margin.querySelectorAll('.interval-translation p').map(n=>n.textContent),['','']);
  assert.equal(margin.querySelector('.interval-margin__echo').hidden,false);assert.equal(margin.querySelector('.interval-margin__echo').textContent,'The glass holds no echo.');
  assert.equal(e.doc.body.dataset.intervalWord,undefined);assert.equal(e.calls.length,0,'focus does not activate the customs departure');
  assert.match(e.q('.salon-foundation__status').textContent,/1 private marks/);
});

test('all six actual room pages have accurate previous/next destinations and carried-word exit readings',()=>{
  for(let room=1;room<=6;room++){
    const e=env({page:`room-0${room}/index.html`});e.mount();const route=routeAtExit(e);
    const prev=room===1?'index.html':`room-0${room-1}/index.html`,next=room===6?'encounter/index.html':`room-0${room+1}/index.html`;
    assert.equal(route.querySelector('.salon-route__step--prev').href,'https://synthetic.salon/'+prev);
    assert.equal(route.querySelector('.salon-route__step--next').href,'https://synthetic.salon/'+next);
    assert.equal(route.querySelector('.salon-horizon').href,'https://synthetic.salon/'+next);
    assert.match(route.querySelector('.salon-route__current').textContent,new RegExp(`Room 0${room} of 06`));
    assert.equal(route.querySelector('.interval-margin').hidden,false);assert.equal(e.q('h1'),e.originalTitle);assert.equal(e.writes(),0);
  }
});

test('Room 01 retains original title and performance status nodes while exit points to Room 02',()=>{
  const e=env({page:'room-01/index.html'});assert(e.pulse&&e.status);const before=e.status.textContent;e.mount();
  assert.equal(e.doc.getElementById('pulseDot'),e.pulse);assert.equal(e.doc.getElementById('statusText'),e.status);assert.equal(e.status.textContent,before);
  assert.equal(e.q('h1'),e.originalTitle);assert.equal(e.q('.salon-route__step--next').href,'https://synthetic.salon/room-02/index.html');
});

test('Room 06 index.html URL finishes its sequence at the new encounter, including the horizon',()=>{
  const e=env({page:'room-06/index.html',pathname:'/room-06/index.html'});e.mount();const route=routeAtExit(e);
  assert.equal(route.querySelector('.salon-route__step--next').href,'https://synthetic.salon/encounter/index.html');
  assert.equal(route.querySelector('.salon-route__step--next strong').textContent,'One object, three readings');
  assert.equal(route.querySelector('.salon-horizon').href,'https://synthetic.salon/encounter/index.html');
  assert.equal(route.querySelector('.interval-margin__reading').textContent,'who gets to say enough?');
});

test('unknown Statement route mounts its footer foundation without an invented exit, horizon, or crash',()=>{
  for(const pathname of ['/statement/','/statement/index.html','/not-a-room/']){
    const e=env({page:'statement/index.html',pathname});e.mount();assert.equal(e.q('.salon-route'),null);assert.equal(e.q('.salon-horizon'),null);assert.equal(e.q('.interval-margin'),null);
    assert.equal(e.q('.salon-foundation').parentElement,e.q('.salon-colophon'));assert.equal(e.q('h1'),e.originalTitle);assert.equal(e.writes(),0);assert.equal(e.doc.canvasAttempts,1);
  }
});

test('studios are destinations without fake sequential exits, including nested studio URLs',()=>{
  for(const page of ['wings/index.html','wings/claude-seat/index.html','office/index.html']){
    const e=env({page});e.mount();assert.equal(e.q('.salon-route'),null);assert.equal(e.q('.salon-horizon'),null);assert.equal(e.q('.salon-foundation').parentElement,e.q('.salon-colophon'));assert.equal(e.writes(),0);
  }
});

test('Entrance has no local room exit for either canonical root or explicit index.html URL',()=>{
  for(const pathname of ['/','/index.html']){const e=env({page:'index.html',pathname});e.mount();assert.equal(e.q('.salon-route'),null);assert.equal(e.q('.salon-horizon'),null);assert.equal(e.all('.salon-wayfinding').length,1);assert.equal(e.q('h1'),e.originalTitle);assert.equal(e.writes(),0);}
});

test('re-evaluating Foundation after load does not duplicate the exit, margin, foundation, or listeners',()=>{
  const e=env();e.mount();e.rerun();routeAtExit(e);assert.equal(e.all('.interval-margin').length,1);assert.equal(e.all('.salon-foundation').length,1);assert.equal(e.all('.salon-horizon').length,1);
  e.original.click();assert.equal(e.spy(),1);assert.equal(e.calls.length,1);assert.equal(e.writes(),0);
});

console.log(`${passed} passed; ${failed} failed. Whole Foundation sha256 ${digest}; actual HTML/state/interval; original Room 04 binding; null-canvas DOM only, no browser or visual assertions.`);
process.exitCode=failed?1:0;
