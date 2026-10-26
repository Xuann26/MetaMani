/* Video slots: add an MP4 to assets/videos/, then set its relative path here. */
const DEMO_VIDEOS = {
  titration: '', // 'assets/videos/titration.mp4'
  pouring: '',   // 'assets/videos/pouring.mp4'
  cabinet: ''    // 'assets/videos/cabinet.mp4'
};

document.documentElement.classList.add('js-ready');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const datasets = {
  real: {
    kicker: 'REAL-WORLD MANIPULATION', title: 'From local competence\nto task completion.',
    description: 'Six task settings across chemistry-lab and household scenarios, with 20 matched initial conditions per setting.',
    score: 81.7, scoreLabel: 'full heterogeneous system',
    values: [['Trajectory-E2E', 7.5], ['Flat-Single', 25.8], ['MetaMani-Single', 70.8], ['MetaMani (full)', 81.7]],
    note: 'Flat-Single and MetaMani-Single share the same MU-trained checkpoint. The heterogeneous system uses a four-policy pool. Source: Figure 3 and real-world results.'
  },
  casa: {
    kicker: 'ROBOCASA365 · OVERALL', title: 'Reusable operations.\nUnseen compositions.',
    description: 'The 50-task protocol covers atomic operations and seen / unseen composite tasks. Values below are overall task success rates.',
    score: 55.6, scoreLabel: 'overall task success',
    values: [['π₀.₅', 16.9], ['RLDX-1', 36.0], ['ABot-M0.5', 40.3], ['MetaMani-RLDX-1', 48.0], ['MetaMani (full)', 55.6]],
    note: 'Selected baselines from Table 2(a). MetaMani-RLDX-1 retains the RLDX-1 backbone; full MetaMani uses heterogeneous per-MU dispatch. See the paper for all baselines.'
  },
  twin: {
    kicker: 'ROBOTWIN 2.0 · HARD', title: 'Local recovery.\nBroader task coverage.',
    description: 'Mean success across eight tasks in the Hard setting. Retries stay within the original rollout horizon without environment resets.',
    score: 41.3, scoreLabel: 'Hard-setting mean success',
    values: [['ACT', 0.0], ['DP3', 17.0], ['π₀.₅', 27.9], ['MetaMani-π₀.₅', 31.8], ['MetaMani (full)', 41.3]],
    note: 'Selected methods from Table 2(b). The full heterogeneous system also reaches 94.6% mean success in the Easy setting. Expand the tables below for both settings.'
  }
};
const resultTabs = [...document.querySelectorAll('[data-result]')];
function renderResults(key) {
  const data = datasets[key];
  resultTabs.forEach(tab => {
    const selected = tab.dataset.result === key;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#results-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.querySelector('#result-kicker').textContent = data.kicker;
  const title = document.querySelector('#result-title');
  title.replaceChildren();
  data.title.split('\n').forEach((line, index) => { if (index) title.append(document.createElement('br')); title.append(document.createTextNode(line)); });
  document.querySelector('#result-description').textContent = data.description;
  document.querySelector('#result-score').innerHTML = `${data.score.toFixed(1)}<span>%</span>`;
  document.querySelector('#result-score-label').textContent = data.scoreLabel;
  document.querySelector('#chart-note').textContent = data.note;
  const chart = document.querySelector('#result-chart');
  chart.replaceChildren();
  data.values.forEach(([name, value], i) => {
    const row = document.createElement('div');
    row.className = `chart-row${i === data.values.length - 1 ? ' highlight' : ''}`;
    const label = document.createElement('span'); label.textContent = name;
    const bar = document.createElement('div'); bar.className = 'chart-bar'; bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('i'); fill.style.setProperty('--value', `${value}%`); bar.append(fill);
    const number = document.createElement('strong'); number.textContent = `${value.toFixed(1)}%`;
    row.append(label, bar, number); chart.append(row);
  });
}
resultTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderResults(tab.dataset.result));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % resultTabs.length;
    if (event.key === 'ArrowLeft') next = (index + resultTabs.length - 1) % resultTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = resultTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); resultTabs[next].focus(); renderResults(resultTabs[next].dataset.result); }
  });
});
renderResults('real');

const traceUnits = [...document.querySelectorAll('.trace-unit')];
const playButton = document.querySelector('#play-trace');
const traceMessage = document.querySelector('#trace-message');
const traceCounter = document.querySelector('#trace-counter');
const scenario = document.querySelector('#scenario');
let traceTimer;
let traceIndex = 0;
let tracePlaying = false;
let traceComplete = false;
function setUnit(index, state, status) {
  const unit = traceUnits[index];
  unit.className = `trace-unit ${state}`;
  unit.querySelector('.trace-status').textContent = status;
  unit.querySelector('.trace-icon').textContent = state === 'verified' ? '✓' : state === 'failed' ? '×' : `0${index + 1}`;
}
function traceSteps() {
  const steps = [
    {unit:0, state:'active', status:'Executing', message:'Dispatch a compatible policy for Transfer.', verified:0},
    {unit:0, state:'verified', status:'Verified · preserved', message:'Transfer verified. Preserve this completed operation.', verified:1},
    {unit:1, state:'active', status:'Executing', message:'Dispatch a compatible policy for Pour.', verified:1}
  ];
  if (scenario.value !== 'success') {
    steps.push({unit:1,state:'failed',status:'Failure detected',message:'Pour failed verification. Transfer stays complete.',verified:1});
    steps.push(scenario.value === 'retry'
      ? {unit:1,state:'active',status:'Retrying locally',message:'Recheck initiation. Retry Pour from the current physical state.',verified:1}
      : {unit:1,state:'active',status:'Switching policy',message:'Illustrative trace: retry budget exhausted. Dispatch the next eligible policy for Pour.',verified:1});
  }
  steps.push(
    {unit:1,state:'verified',status:'Verified · preserved',message:'Pour verified. No replay of the completed Transfer unit.',verified:2},
    {unit:2,state:'active',status:'Executing',message:'Advance to Titrate with the verified prefix preserved.',verified:2},
    {unit:2,state:'verified',status:'Verified · complete',message:'Task complete. Every manipulation unit reached verified success.',verified:3}
  );
  return steps;
}
function resetTrace() {
  clearTimeout(traceTimer); tracePlaying = false; traceComplete = false; traceIndex = 0;
  traceUnits.forEach((unit, i) => setUnit(i, '', i ? 'Waiting' : 'Ready'));
  traceMessage.textContent = 'Ready to execute. Choose a scenario and play the trace.';
  traceCounter.textContent = '0 / 3 verified';
  playButton.textContent = '▶ Play trace';
  scenario.disabled = false;
}
function tickTrace() {
  if (!tracePlaying) return;
  const steps = traceSteps();
  const step = steps[traceIndex++];
  setUnit(step.unit, step.state, step.status);
  traceMessage.textContent = step.message;
  traceCounter.textContent = `${step.verified} / 3 verified`;
  if (traceIndex >= steps.length) {
    tracePlaying = false; traceComplete = true; scenario.disabled = false;
    playButton.textContent = '↻ Replay trace'; return;
  }
  traceTimer = setTimeout(tickTrace, reducedMotion ? 1900 : 1500);
}
playButton.addEventListener('click', () => {
  if (tracePlaying) {
    tracePlaying = false; clearTimeout(traceTimer); playButton.textContent = '▶ Resume trace'; return;
  }
  if (traceComplete) resetTrace();
  tracePlaying = true; scenario.disabled = true; playButton.textContent = 'Ⅱ Pause trace'; tickTrace();
});
document.querySelector('#reset-trace').addEventListener('click', resetTrace);
scenario.addEventListener('change', resetTrace);

const figureDialog = document.querySelector('#figure-dialog');
let lastFigureTrigger;
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  lastFigureTrigger = button;
  const image = document.querySelector('#dialog-image');
  image.src = button.dataset.zoom;
  image.alt = button.querySelector('img').alt;
  document.querySelector('#figure-dialog-caption').textContent = button.dataset.caption;
  figureDialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => figureDialog.close());
figureDialog.addEventListener('click', event => { if (event.target === figureDialog) { const r = figureDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) figureDialog.close(); } });
figureDialog.addEventListener('close', () => lastFigureTrigger?.focus({preventScroll:true}));

let toastTimer;
function toast(message) {
  const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 3500);
}
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const text = document.querySelector('#citation-text').textContent;
  try {
    await navigator.clipboard.writeText(text);
    toast('Citation copied to clipboard.');
    document.querySelector('#copy-status').textContent = 'Citation copied to clipboard.';
  } catch {
    const range = document.createRange(); range.selectNodeContents(document.querySelector('#citation-text'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    toast('Citation selected. Press Ctrl+C (or ⌘C) to copy.');
    document.querySelector('#copy-status').textContent = 'Citation selected for manual copying.';
  }
});

Object.entries(DEMO_VIDEOS).forEach(([key, path]) => {
  if (!path) return;
  const card = document.querySelector(`[data-demo="${key}"]`);
  const media = card.querySelector('.demo-media');
  const poster = media.querySelector('img').getAttribute('src');
  const video = document.createElement('video');
  video.controls = true; video.playsInline = true; video.preload = 'none'; video.poster = poster;
  video.setAttribute('aria-label', card.querySelector('h3').textContent + ' robot demonstration');
  const source = document.createElement('source'); source.src = path; source.type = 'video/mp4';
  video.append(source, document.createTextNode('Your browser does not support embedded video.'));
  const fallback = document.createElement('a'); fallback.href = path; fallback.textContent = 'Download video';
  video.append(fallback); media.replaceChildren(video);
  card.querySelector('.demo-note').textContent = 'Real robot demonstration.';
  source.addEventListener('error', () => { card.querySelector('.demo-note').textContent = 'Video could not load. Check the configured media path.'; });
});
