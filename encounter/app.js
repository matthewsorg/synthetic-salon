'use strict';
// An ephemeral optical score. No visitor memory, network, sound, or autonomous clock.
(() => {
  const get = id => document.getElementById(id);
  const view = get('objectView');
  if (!view) return;
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const choices = Array.from(document.querySelectorAll('[data-reading]')).filter(el => el.tagName === 'BUTTON');
  const source = view.querySelector('.object-source');
  const direct = view.querySelector('.object-claude-direct');
  const reflected = view.querySelector('.object-claude-reflected');
  const light = view.querySelector('.object-qwen-light');
  const mirror = view.querySelector('.reflection-window');
  const directSilver = view.querySelector('.direct-silver');
  const controls = ['source', 'claude', 'qwen', 'gemini'];
  let reading = 'source', turned = false, moved = false, motion = false;
  const text = {
    source: ['The common description','Before interpretation','A pale ceramic loop holds a silver sphere across an impossible gap.'],
    claude: ['Claude · adapted by Codex','Seen Once, Not Twice','You may see the cut, or its reflection, but not both.'],
    qwen: ['Qwen · adapted by Codex','Vermilion Gap Suspended','The sphere holds the space between what is broken and what remains.'],
    gemini: ['Gemini · adapted by Codex','The Split Reflection','The mirror holds a gap wider than the one before you.']
  };
  function describe() {
    let description = 'An ivory ceramic loop with a red cut and a silver sphere suspended inside it.';
    if (reading === 'claude') description = turned ? 'The cut is hidden. A red mark appears only in the silver sphere.' : 'The ceramic cut faces you. The silver sphere shows a pale band with no red.';
    if (reading === 'qwen') description += moved ? ' Light enters from lower right; the shadow falls left.' : ' Light enters from upper left; the shadow falls right.';
    if (reading === 'gemini') description += ` Only the inner reflection has turned ${get('reflectionAngle').value} degrees.`;
    view.setAttribute('aria-label', description);
  }
  function render() {
    view.dataset.reading = reading;
    // Claude's exclusive states change immediately: a crossfade would briefly show both reds.
    source.style.opacity = reading === 'claude' ? '0' : '1';
    direct.hidden = reading !== 'claude' || turned;
    reflected.hidden = reading !== 'claude' || !turned;
    directSilver.hidden = reading !== 'claude' || turned;
    light.hidden = reading !== 'qwen';
    light.style.opacity = moved ? '1' : '0';
    mirror.hidden = !['gemini','qwen'].includes(reading);
    mirror.style.setProperty('--reflection-angle', reading === 'gemini' ? `${get('reflectionAngle').value}deg` : '0deg');
    // Qwen's alternative has its own rendered reflection and light; do not paint over it.
    if (reading === 'qwen') mirror.hidden = true;
    controls.forEach(key => { get(key + 'Controls').hidden = key !== reading; });
    ['readingAuthor','readingTitle','readingLine'].forEach((id,i) => { get(id).textContent = text[reading][i]; });
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reading === reading)));
    get('turnObject').setAttribute('aria-pressed', String(turned));
    get('turnObject').textContent = turned ? 'Turn to the cut ↙' : 'Turn to the reflection ↗';
    get('moveLight').setAttribute('aria-pressed', String(moved));
    get('moveLight').textContent = moved ? 'Return the light ↙' : 'Move the light ↗';
    describe();
  }
  function motionState() {
    if (query.matches) motion = false;
    const active = motion && !query.matches && document.visibilityState !== 'hidden';
    document.body.classList.toggle('motion-enabled', active);
    document.body.classList.toggle('motion-paused', !active);
    get('motionChoice').disabled = query.matches;
    get('motionChoice').setAttribute('aria-pressed', String(motion));
    get('motionChoice').textContent = query.matches ? 'Motion off · device preference' : motion ? 'Stop transitions' : 'Allow slow transitions';
  }
  choices.forEach(button => button.addEventListener('click', () => {
    reading = button.dataset.reading; render();
    get('objectStatus').textContent = reading === 'source' ? 'Nothing you do in this room is saved.' : `${text[reading][1]}. ${get('objectView').getAttribute('aria-label')}`;
  }));
  get('turnObject').addEventListener('click', () => { turned = !turned; render(); get('objectStatus').textContent = view.getAttribute('aria-label'); });
  get('moveLight').addEventListener('click', () => { moved = !moved; render(); get('objectStatus').textContent = moved ? 'Lower-right light. The shadow falls left.' : 'Upper-left light. The shadow falls right.'; });
  get('reflectionAngle').addEventListener('input', () => { mirror.style.setProperty('--reflection-angle', `${get('reflectionAngle').value}deg`); describe(); });
  get('bringCloser').addEventListener('click', () => {
    const close = get('readingTriptych').classList.toggle('is-close');
    get('bringCloser').setAttribute('aria-pressed', String(close));
    get('bringCloser').textContent = close ? 'Give each reading room ↔' : 'Bring the readings closer ↔';
  });
  get('motionChoice').addEventListener('click', () => { if (!query.matches) motion = !motion; motionState(); });
  document.addEventListener('visibilitychange', motionState);
  if (query.addEventListener) query.addEventListener('change', motionState); else query.addListener(motionState);
  render(); motionState();
})();
