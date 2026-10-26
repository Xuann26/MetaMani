// Add only verified paper task names and the authors' original footage.
// Example: {title: 'Exact paper task name', src: 'assets/videos/demo-01.mp4', poster: ''}
const demonstrations = [
  {title:'BiTit-LR · Left → right',src:'',poster:''},
  {title:'BiTit-RL · Right → left',src:'',poster:''},
  {title:'Sol-PF · Pouring first',src:'',poster:''},
  {title:'Sol-TF · Titration first',src:'',poster:''},
  {title:'Cab-Take · Cabinet retrieval',src:'',poster:''},
  {title:'Cab-Place · Cabinet placement',src:'',poster:''}
];
const grid = document.querySelector('#video-grid');
const dialog = document.querySelector('#media-dialog');
const dialogVideo = document.querySelector('#dialog-video');
demonstrations.forEach((demo) => {
  const card = document.createElement('figure');
  card.className = 'demo-card';
  const media = document.createElement('div');
  media.className = 'demo-media';
  if (demo.src) {
    const video = document.createElement('video');
    video.src = demo.src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label',demo.title);
    if (demo.poster) video.poster = demo.poster;
    media.append(video);
    const expand = document.createElement('button');
    expand.className = 'expand-video';
    expand.textContent = '⤢';
    expand.setAttribute('aria-label',`Enlarge ${demo.title}`);
    expand.addEventListener('click', () => {
      document.querySelectorAll('.demo-media video').forEach(v=>v.pause());
      document.querySelector('#media-dialog-title').textContent = demo.title;
      dialogVideo.src = demo.src;
      dialog.showModal();
      dialogVideo.play().catch(()=>{});
    });
    media.append(expand);
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty-video';
    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.textContent = '▷';
    icon.setAttribute('aria-hidden','true');
    const label = document.createElement('small');
    label.textContent = 'Video pending';
    empty.append(icon,label);
    media.append(empty);
  }
  const caption = document.createElement('figcaption');
  caption.className = 'demo-caption';
  const title = document.createElement('h3');
  title.textContent = demo.title;
  const status = document.createElement('span');
  status.className = 'media-status';
  status.textContent = demo.src ? 'Demo video' : 'Reserved slot';
  caption.append(title);
  if (demo.src) caption.append(status);
  card.append(media,caption);
  grid.append(card);
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(({target,isIntersecting})=> {
    if (isIntersecting && document.visibilityState === 'visible' && !dialog.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) target.play().catch(()=>{});
    else target.pause();
  });
},{threshold:.3});
document.querySelectorAll('.demo-media video').forEach(video=>observer.observe(video));
document.addEventListener('visibilitychange',()=> {
  if (document.hidden) document.querySelectorAll('video').forEach(video=>video.pause());
});
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=> {dialogVideo.pause();dialogVideo.removeAttribute('src');dialogVideo.load();});
document.querySelector('#copy-citation').addEventListener('click',async event=> {
  const button=event.currentTarget;
  const text=document.querySelector('#bibtex').textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent='Copied';
    document.querySelector('#copy-status').textContent='BibTeX copied to clipboard.';
  } catch {
    const selection=window.getSelection();
    const range=document.createRange();
    range.selectNodeContents(document.querySelector('#bibtex'));
    selection.removeAllRanges();selection.addRange(range);
    document.querySelector('#copy-status').textContent='Citation selected. Press Ctrl+C or Command+C to copy.';
    button.textContent='Selected · press Ctrl+C';
  }
});

// Subtle motion supports the reading order and result charts.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.08});
document.querySelectorAll('.section-heading, .overview-content > h2, .overview-grid > div, .composition-figure, .paper-figure, .demo-card, .method-steps article, .result-copy, .simulation-results, .abstract-details').forEach((element,index) => {
  element.classList.add('will-reveal');
  if (element.matches('.demo-card, .method-steps article')) element.style.setProperty('--reveal-delay',`${(index % 3) * 65}ms`);
  revealObserver.observe(element);
});

const resultsChart = document.querySelector('.results-chart');
resultsChart.classList.add('chart-ready');
const chartObserver = new IntersectionObserver(entries => {
  if (entries.some(entry=>entry.isIntersecting)) {
    resultsChart.classList.add('chart-visible');
    chartObserver.disconnect();
  }
}, {threshold:.25});
chartObserver.observe(resultsChart);

const progress = document.querySelector('#reading-progress');
let scrollFrame = 0;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance>0 ? Math.min(1,Math.max(0,scrollY/distance)) : 0})`;
  scrollFrame=0;
}
addEventListener('scroll',()=>{if (!scrollFrame) scrollFrame=requestAnimationFrame(updateProgress);},{passive:true});
addEventListener('resize',updateProgress);
updateProgress();

// Accessible, resolution-independent inspection of original PDF figures.
const figureDialog = document.querySelector('#figure-dialog');
const figureStage = document.querySelector('#figure-stage');
const enlargedFigure = document.querySelector('#enlarged-figure');
const zoomFigureButton = document.querySelector('#toggle-figure-zoom');
const figurePanels={
  sequences:{file:'figure-3a-task-sequences.svg',title:'Figure 3(a) · Real-world MU sequences',caption:'Representative real-world manipulation-unit sequences.',label:'Figure 3(a).',width:996,alt:'Figure 3(a): representative chemistry-lab and household manipulation-unit sequences.'},
  evaluation:{file:'figure-3bcd-evaluation.svg',title:'Figure 3(b–d) · Real-world evaluation',caption:'MU organization, policy capabilities, heterogeneous selection, and checkpoint reuse.',label:'Figure 3(b–d).',width:1028,alt:'Figure 3(b–d): MU organization, independent policy capabilities, heterogeneous selection, and checkpoint reuse.'},
  full:{file:'figure-3-real-world.svg',title:'Figure 3 · Real-world evaluation',caption:'Complete original real-world evaluation figure.',label:'Figure 3.',width:2024,alt:'Complete Figure 3: real-world MU sequences and experimental evaluation.'}
};
document.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=> {
  const panel=figurePanels[button.dataset.panel];
  document.querySelectorAll('[data-panel]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const link=document.querySelector('#real-world-figure-link');
  const img=document.querySelector('#real-world-panel');
  link.href=`assets/images/${panel.file}`;link.dataset.figure=panel.title;
  img.classList.remove('panel-switch');
  img.src=link.getAttribute('href');img.alt=panel.alt;img.width=panel.width;
  img.addEventListener('load',()=>img.classList.add('panel-switch'),{once:true});
  const caption=document.querySelector('#real-world-caption');
  const label=document.createElement('strong');label.textContent=panel.label;
  caption.replaceChildren(label,document.createTextNode(` ${panel.caption}`));
}));
document.querySelectorAll('[data-figure]').forEach(link=> {
  link.addEventListener('click',event=> {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !figureDialog.showModal) return;
    event.preventDefault();
    enlargedFigure.src=link.getAttribute('href');
    enlargedFigure.alt=link.querySelector('img').alt;
    document.querySelector('#figure-dialog-title').textContent=link.dataset.figure;
    figureStage.classList.remove('is-zoomed');
    zoomFigureButton.textContent='Zoom in';
    zoomFigureButton.setAttribute('aria-pressed','false');
    figureDialog.showModal();
    document.body.classList.add('has-open-dialog');
  });
});
zoomFigureButton.addEventListener('click',()=> {
  const zoomed=figureStage.classList.toggle('is-zoomed');
  zoomFigureButton.textContent=zoomed?'Fit to view':'Zoom in';
  zoomFigureButton.setAttribute('aria-pressed',String(zoomed));
});
document.querySelector('#close-figure').addEventListener('click',()=>figureDialog.close());
figureDialog.addEventListener('close',()=>document.body.classList.remove('has-open-dialog'));
figureDialog.addEventListener('click',event=> {
  const rect=figureDialog.getBoundingClientRect();
  if (event.target===figureDialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) figureDialog.close();
});
