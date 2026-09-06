const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/main.js'), 'utf8');
const german = fs.readFileSync(path.join(root, 'public/de/i18n_de.js'), 'utf8');

function fixture(language = 'en') {
  const listeners = {};
  const frames = [];
  const nodes = {};
  const movements = [];
  const window = {
    innerWidth: 1000, innerHeight: 900, scrollX: 0, scrollY: 0,
    addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    requestAnimationFrame(callback) { frames.push(callback); },
    scrollTo(options) {
      movements.push(options);
      this.scrollX = Math.max(0, Math.min(options.left, document.documentElement.scrollWidth - this.innerWidth));
      this.scrollY = options.top;
      this.dispatch('scroll');
    },
    scrollBy(options) { this.scrollTo({...options, left: this.scrollX + options.left}); },
    dispatch(name, event = {}) { for (const callback of listeners[name] || []) callback(event); }
  };
  function element(id, left = 0, width = 600) {
    const events = {};
    const classes = new Set();
    const node = {
      left, width, textContent: '', style: {}, dataset: {}, attrs: {}, children: [],
      scrollTop: 0, scrollHeight: 10000, clientHeight: 400,
      classList: {add(value) { classes.add(value); }, toggle(value) {
        if (classes.has(value)) { classes.delete(value); return false; }
        classes.add(value); return true;
      }},
      appendChild(child) { this.children.push(child); },
      addEventListener(name, callback) { events[name] = callback; },
      dispatch(name) { events[name]?.(); },
      setAttribute(name, value) { this.attrs[name] = value; },
      getBoundingClientRect() { return {left: this.left - window.scrollX, width: this.width}; },
      closest() { return this; },
      querySelector(selector) {
        if (selector === '.counter-value') return this.value;
        if (selector === '.counter-context') return this.context;
        return {textContent: 'Example at ' + this.left};
      }
    };
    if (id) nodes[id] = node;
    return node;
  }
  const document = {
    documentElement: {lang: language, scrollWidth: 15100123, scrollHeight: 640},
    body: element('body'),
    getElementById(id) { assert.ok(nodes[id], 'Missing fixture element: ' + id); return nodes[id]; },
    querySelector() { return nodes['group-wealth']; },
    querySelectorAll() { return candidates; },
    createElement() { return element(); },
    createDocumentFragment() { return element(); }
  };
  for (const id of ['journey-nav', 'journey-previous', 'journey-next', 'journey-next-label',
    'journey-section', 'journey-announcement', 'sixty-percent', 'sixty-percent-indicator',
    'babies-wrapper', 'baby-counter', 'zoom-toggle', 'line-chart']) element(id);
  element('bezos', 10000, 1816400).dataset.wealth = '908200000000';
  element('group-wealth', 1900123, 13200000).dataset.wealth = '6600000000000';
  element('bezos-counter-start', 15000);
  element('four-hundred-counter-start', 1901000);
  for (const id of ['bezos-counter', 'four-hundred-counter']) {
    const counter = element(id);
    counter.value = element();
    counter.context = element();
  }
  nodes['babies-wrapper'].dataset.count = '434250';
  const candidates = [0, 1000, 1100, 2200, 10000, 15000, 168432, 1816900, 1900123, 2000456]
    .map((left) => element(null, left));
  const context = vm.createContext({window, document, Intl});
  if (language === 'de') vm.runInContext(german, context);
  vm.runInContext(source, context);
  function flush() { while (frames.length) frames.shift()(); }
  flush();
  function wheel(overrides = {}) {
    const event = {deltaX: 0, deltaY: 120, deltaMode: 0, target: {}, prevented: false,
      preventDefault() { this.prevented = true; }, ...overrides};
    window.dispatch('wheel', event);
    return event;
  }
  function key(key, overrides = {}) {
    const event = {key, target: {}, prevented: false,
      preventDefault() { this.prevented = true; }, ...overrides};
    window.dispatch('keydown', event);
    flush();
    return event;
  }
  function at(left) { window.scrollX = left; window.dispatch('scroll'); flush(); }
  return {window, document, nodes, candidates, context, movements, frames, flush, wheel, key, at};
}

test('next/back visit every distinct example, announce it, and restart at the last one', () => {
  const f = fixture();
  assert.equal(f.nodes['journey-previous'].disabled, true);
  assert.equal(f.nodes['journey-nav'].hidden, false);
  for (const candidate of f.candidates.slice(1)) {
    f.nodes['journey-next'].dispatch('click'); f.flush();
    assert.equal(f.window.scrollX, candidate.left - 20);
  }
  assert.equal(f.nodes['journey-next-label'].textContent, 'Start again');
  assert.match(f.nodes['journey-announcement'].textContent, /2000456/);
  f.nodes['journey-previous'].dispatch('click'); f.flush();
  assert.equal(f.window.scrollX, 1900103);
  f.key('End');
  f.nodes['journey-next'].dispatch('click'); f.flush();
  assert.equal(f.window.scrollX, 0);
  assert.ok(f.movements.every(move => move.behavior === 'instant' && move.top === 0));
});

test('manual scrolling can move to the next or previous narrative stop', () => {
  const f = fixture();
  f.at(90000);
  f.nodes['journey-next'].dispatch('click'); f.flush();
  assert.equal(f.window.scrollX, 168412);
  f.at(90000);
  f.nodes['journey-previous'].dispatch('click'); f.flush();
  assert.equal(f.window.scrollX, 14980);
});

test('wheel units work and both horizontal boundaries preserve native events', () => {
  const f = fixture();
  assert.equal(f.wheel().prevented, true);
  assert.equal(f.window.scrollX, 120);
  f.wheel({deltaY: 3, deltaMode: 1});
  assert.equal(f.window.scrollX, 168);
  f.wheel({deltaY: 1, deltaMode: 2});
  assert.equal(f.window.scrollX, 1168);
  f.at(0);
  assert.equal(f.wheel({deltaY: -100}).prevented, false);
  f.at(f.document.documentElement.scrollWidth - f.window.innerWidth);
  assert.equal(f.wheel().prevented, false);
});

test('trackpads, zoom gestures, controls, nested scrollers, and short windows stay native', () => {
  const f = fixture();
  for (const options of [
    {deltaX: 200}, {ctrlKey: true}, {metaKey: true}, {altKey: true}, {shiftKey: true},
    {defaultPrevented: true}, {target: {closest: () => ({})}}
  ]) assert.equal(f.wheel(options).prevented, false);
  f.document.documentElement.scrollHeight = 1000;
  assert.equal(f.wheel().prevented, false);
  assert.equal(f.window.scrollX, 0);
});

test('keyboard movement, reverse navigation, home/end, and focused controls', () => {
  const f = fixture();
  f.key('ArrowRight'); assert.equal(f.window.scrollX, 800);
  f.key('ArrowLeft'); assert.equal(f.window.scrollX, 0);
  f.key(' '); assert.equal(f.window.scrollX, 980);
  f.key('PageDown'); assert.equal(f.window.scrollX, 1080);
  f.key(' ', {shiftKey: true}); assert.equal(f.window.scrollX, 980);
  f.key('PageUp'); assert.equal(f.window.scrollX, 0);
  f.key('End'); assert.equal(f.window.scrollX, 2000436);
  f.key('Home'); assert.equal(f.window.scrollX, 0);
  assert.equal(f.key(' ', {target: {closest: () => ({})}}).prevented, false);
  assert.equal(f.key('ArrowRight', {ctrlKey: true}).prevented, false);
  assert.equal(f.key('ArrowDown').prevented, false);
});

test('counters use each rectangle origin, keep remainders positive, and clear after exit', () => {
  const f = fixture();
  const musk = f.nodes['bezos-counter'];
  const group = f.nodes['four-hundred-counter'];
  assert.equal(musk.style.visibility, 'hidden');
  f.at(10000 + 1816400 / 2);
  assert.equal(musk.value.textContent, '$454,100,000,000');
  assert.equal(musk.context.textContent, '50.0% still ahead');
  f.at(10000 + 1816400 - 1);
  assert.equal(musk.context.textContent, '<0.1% still ahead');
  f.at(1900123);
  assert.equal(musk.style.visibility, 'hidden');
  assert.equal(group.value.textContent, '$0');
  f.at(1900123 + 13200000 / 2);
  assert.equal(group.value.textContent, '$3,300,000,000,000');
  assert.equal(group.context.textContent, '50.0% still ahead');
  f.at(1900123 + 13200000);
  assert.equal(group.style.visibility, 'hidden');
});

test('scroll events share a frame and resize remeasures navigation', () => {
  const f = fixture();
  for (let i = 0; i < 20; i++) f.window.dispatch('scroll');
  assert.equal(f.frames.length, 1);
  f.flush();
  f.candidates[1].left = 900;
  f.window.dispatch('resize'); f.flush();
  f.nodes['journey-next'].dispatch('click'); f.flush();
  assert.equal(f.window.scrollX, 880);
});

test('vertical illustrations initialize at zero and clamp their totals on desktop and mobile', () => {
  const f = fixture();
  assert.equal(f.nodes['baby-counter'].textContent, '0');
  const people = f.nodes['sixty-percent'];
  people.scrollTop = people.scrollHeight - people.clientHeight;
  people.dispatch('scroll');
  assert.equal(f.nodes['sixty-percent-indicator'].textContent, '50.0%');
  const babies = f.nodes['babies-wrapper'];
  babies.scrollTop = 160 * 10; babies.dispatch('scroll');
  assert.equal(f.nodes['baby-counter'].textContent, '50');
  f.window.innerWidth = 390;
  babies.scrollTop = 68 * 10; babies.dispatch('scroll');
  assert.equal(f.nodes['baby-counter'].textContent, '50');
  babies.scrollTop = 99999999; babies.dispatch('scroll');
  assert.equal(f.nodes['baby-counter'].textContent, '434,250');
});

test('German controls, money, percentages, and zoom state are localized', () => {
  const f = fixture('de');
  assert.equal(f.nodes['journey-nav'].attrs['aria-label'], 'Beispiele');
  assert.equal(f.nodes['journey-next-label'].textContent, 'Weiter');
  f.at(10000 + 1816400 / 2);
  assert.equal(f.nodes['bezos-counter'].value.textContent, new Intl.NumberFormat('de', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(454100000000));
  assert.equal(f.nodes['bezos-counter'].context.textContent, '50,0% liegen noch vor dir');
  vm.runInContext('toggleZoom()', f.context);
  assert.equal(f.nodes['zoom-toggle'].attrs['aria-pressed'], 'true');
  vm.runInContext('toggleZoom()', f.context);
  assert.equal(f.nodes['zoom-toggle'].attrs['aria-pressed'], 'false');
});

function translationFixture() {
  let xhr;
  const scripts = [];
  const outer = {innerHTML: '', style: {}};
  const translated = {classList: ['i18n-journey-next'], innerHTML: 'Next example'};
  const document = {
    getElementsByClassName: () => [outer], querySelectorAll: () => [translated],
    getElementsByTagName: () => [], createElement: () => ({}),
    body: {appendChild(script) { scripts.push(script); }}
  };
  const data = {code: 'de', strings: {'i18n-journey-next': 'Weiter'}};
  const context = vm.createContext({
    document, window: {i18n_data: data}, i18n_data: data,
    XMLHttpRequest: function () {
      xhr = this; this.open = () => {}; this.send = () => {};
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'public/i18n.js'), 'utf8'), context);
  return {xhr, outer, scripts, translated};
}

test('German loading translates controls and loads the current interaction script', () => {
  const f = translationFixture();
  Object.assign(f.xhr, {readyState: 4, status: 200,
    response: '<html><!--i18n-start--><div>Content</div><!--i18n-end--></html>'});
  f.xhr.onreadystatechange();
  assert.equal(f.translated.innerHTML, 'Weiter');
  assert.equal(f.scripts[0].src, '../main.js?version=2026-09-06-ux');
  assert.equal(f.outer.style.display, 'block');
});

test('failed, timed out, and malformed translation responses give usable recovery links', () => {
  for (const failure of ['network', 'timeout', 'http', 'malformed']) {
    const f = translationFixture();
    if (failure === 'network') f.xhr.onerror();
    else if (failure === 'timeout') f.xhr.ontimeout();
    else {
      Object.assign(f.xhr, {readyState: 4, status: failure === 'http' ? 503 : 200, response: 'Bad response'});
      f.xhr.onreadystatechange();
    }
    assert.match(f.outer.innerHTML, /Erneut versuchen/);
    assert.match(f.outer.innerHTML, /href="\.\.\/index.html"/);
    assert.equal(f.outer.style.display, 'block');
    assert.equal(f.scripts.length, 0);
  }
});
