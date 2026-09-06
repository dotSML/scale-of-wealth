/* Navigation changes the reading position, never the monetary scale. */
(function () {
  'use strict';

  var copy = Object.assign({
    start: 'The scale', musk: 'Elon Musk', group: 'The richest 400',
    next: 'Next example', restart: 'Start again', navigation: 'Examples',
    ahead: '{percent}% still ahead', crossed: 'At the left edge: {money}. {percent}% still ahead.'
  }, window.i18n_data && window.i18n_data.journey);
  var locale = document.documentElement.lang || 'en';
  var money = new Intl.NumberFormat(locale, {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  });
  var number = new Intl.NumberFormat(locale);
  var percent = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1, maximumFractionDigits: 1
  });
  var nav = document.getElementById('journey-nav');
  var previous = document.getElementById('journey-previous');
  var next = document.getElementById('journey-next');
  var nextLabel = document.getElementById('journey-next-label');
  var sectionLabel = document.getElementById('journey-section');
  var announcement = document.getElementById('journey-announcement');
  var people = document.getElementById('sixty-percent');
  var peopleCounter = document.getElementById('sixty-percent-indicator');
  var babies = document.getElementById('babies-wrapper');
  var babyCounter = document.getElementById('baby-counter');
  var stops = [];
  var sections = [];
  var framePending = false;
  var needsMeasure = true;
  var innerScrollers = '.people-wrapper, .babies-wrapper, .modal-inner';
  var controls = 'a, button, input, select, textarea, [contenteditable]:not([contenteditable="false"])';

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function setText(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function absoluteLeft(element) {
    return element.getBoundingClientRect().left + window.scrollX;
  }

  function measure() {
    var candidates = document.querySelectorAll(
      '.title-screen, .wealth-row > .wealth-wrapper:not(.bezos):not(.four-hundred), ' +
      '#bezos, #four-hundred > .wealth, .infobox, ' +
      '.musk-scene:not(.musk-years), .musk-decade'
    );
    var maximum = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    stops = Array.from(candidates, function (element) {
      return {element: element, left: clamp(absoluteLeft(element) - 20, 0, maximum)};
    }).sort(function (a, b) { return a.left - b.left; }).filter(function (stop, index, list) {
      return index === 0 || stop.left - list[index - 1].left > 2;
    });
    sections = [
      {element: document.getElementById('bezos'), counter: document.getElementById('bezos-counter'),
        start: document.getElementById('bezos-counter-start'), label: copy.musk},
      {element: document.querySelector('#four-hundred > .wealth'), counter: document.getElementById('four-hundred-counter'),
        start: document.getElementById('four-hundred-counter-start'), label: copy.group}
    ].map(function (section) {
      section.left = absoluteLeft(section.element);
      section.width = section.element.getBoundingClientRect().width;
      section.total = Number(section.element.dataset.wealth);
      section.reveal = absoluteLeft(section.start.closest('.infobox'));
      section.value = section.counter.querySelector('.counter-value');
      section.context = section.counter.querySelector('.counter-context');
      return section;
    });
    needsMeasure = false;
  }

  function render() {
    framePending = false;
    if (needsMeasure) measure();
    var position = Math.max(0, window.scrollX);
    var label = copy.start;
    sections.forEach(function (section) {
      var inSection = position + 20 >= section.left && position < section.left + section.width;
      var visible = inSection && position + window.innerWidth > section.reveal;
      if (inSection) label = section.label;
      section.counter.style.visibility = visible ? 'visible' : 'hidden';
      if (!visible) return;
      var fraction = clamp((position - section.left) / section.width, 0, 1);
      var amount = money.format(Math.floor(fraction * section.total));
      // Keep tiny positive remainders visible instead of rounding them to zero.
      var shareAhead = (1 - fraction) * 100;
      var remaining = shareAhead > 0 && shareAhead < 0.1 ? '<' + percent.format(0.1) : percent.format(shareAhead);
      setText(section.value, amount);
      setText(section.context, copy.ahead.replace('{percent}', remaining));
      section.counter.setAttribute('aria-label', copy.crossed.replace('{money}', amount).replace('{percent}', remaining));
    });
    setText(sectionLabel, label);
    previous.disabled = position <= 2;
    setText(nextLabel, position >= stops[stops.length - 1].left - 2 ? copy.restart : copy.next);
  }

  function schedule(measureAgain) {
    if (measureAgain === true) needsMeasure = true;
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(render);
    }
  }

  function goTo(stop) {
    // Millions of pixels must not become a long, disorienting animation.
    window.scrollTo({left: stop.left, top: 0, behavior: 'instant'});
    var caption = stop.element.querySelector('.wealth-title, .title, .musk-caption, .people-label, .description, h1');
    var text = caption ? caption.textContent.replace(/\s+/g, ' ').trim() : copy.start;
    setText(announcement, text);
    schedule();
  }

  function navigate(direction) {
    if (needsMeasure) measure();
    var position = Math.max(0, window.scrollX);
    if (direction > 0) {
      goTo(stops.find(function (stop) { return stop.left > position + 2; }) || stops[0]);
    } else {
      goTo(stops.slice().reverse().find(function (stop) { return stop.left < position - 2; }) || stops[0]);
    }
  }

  function closest(target, selector) {
    return target && target.closest && target.closest(selector);
  }

  // Keep native horizontal gestures and the two vertical illustrations intact.
  window.addEventListener('wheel', function (event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) || closest(event.target, innerScrollers + ', ' + controls)) return;
    // Short windows still need normal vertical scrolling to reach all the text.
    if (document.documentElement.scrollHeight > window.innerHeight + 2) return;
    var factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1;
    var delta = event.deltaY * factor;
    var maximum = document.documentElement.scrollWidth - window.innerWidth;
    var destination = clamp(window.scrollX + delta, 0, maximum);
    if (destination === window.scrollX) return;
    event.preventDefault();
    window.scrollBy({left: delta, top: 0, behavior: 'instant'});
  }, {passive: false});

  window.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
        closest(event.target, controls + ', ' + innerScrollers)) return;
    if (event.key === 'PageDown' || event.key === ' ' || event.key === 'PageUp') {
      event.preventDefault();
      navigate(event.key === 'PageUp' || event.shiftKey ? -1 : 1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      window.scrollBy({left: (event.key === 'ArrowRight' ? 1 : -1) * window.innerWidth * 0.8, top: 0, behavior: 'instant'});
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (needsMeasure) measure();
      goTo(event.key === 'Home' ? stops[0] : stops[stops.length - 1]);
    }
  });

  previous.addEventListener('click', function () { navigate(-1); });
  next.addEventListener('click', function () { navigate(1); });
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', function () { schedule(true); updatePeople(); updateBabies(); });
  window.addEventListener('load', function () { schedule(true); });
  window.addEventListener('pageshow', function () { schedule(true); });

  var figures = document.createDocumentFragment();
  for (var i = 0; i < 100; i++) {
    var figure = document.createElement('div');
    figure.className = 'people' + (i === 0 ? ' first' : '');
    figures.appendChild(figure);
  }
  people.appendChild(figures);

  function updatePeople() {
    var maximum = people.scrollHeight - people.clientHeight;
    var share = maximum > 0 ? clamp(people.scrollTop / maximum, 0, 1) * 50 : 0;
    setText(peopleCounter, percent.format(share) + '%');
  }

  function updateBabies() {
    var tile = window.innerWidth <= 450 ? 68 : 160;
    var count = clamp(Math.floor(babies.scrollTop / tile * 5), 0, Number(babies.dataset.count));
    setText(babyCounter, number.format(count));
  }

  people.addEventListener('scroll', updatePeople, {passive: true});
  babies.addEventListener('scroll', updateBabies, {passive: true});
  updatePeople();
  updateBabies();
  nav.hidden = false;
  nav.setAttribute('aria-label', copy.navigation);
  document.body.classList.add('journey-ready');
  schedule(true);
}());

function toggleZoom() {
  var expanded = document.getElementById('line-chart').classList.toggle('zoom');
  document.getElementById('zoom-toggle').setAttribute('aria-pressed', String(expanded));
}
