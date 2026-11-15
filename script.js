const COLORS = ['#ff5a5a', '#ffa02e', '#ffe135', '#4cf06a', '#2de8e8','#5c9dff','#bf7bff','#ff6ec7'];
const TYPES = [
  { id: 'sign',   label: '🪧', title: 'Sign' },
  { id: 'book',   label: '📖', title: 'Book' },
  { id: 'torch',  label: '🔦', title: 'Torch' },
  { id: 'bottle', label: '🍾', title: 'Bottle' }
];
const MOODS = {
  random: {
    label: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>`,
    title: 'Random',
    color: null,
    vx: [6, 16],
    vy: [-12, -4],
    bob: 3,
    bs: 0.0008
  },
  happy: {
    label: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>`,
    title: 'Happy',
    color: '#ffe135',
    vx: [10, 20],
    vy: [-14, -7],
    bob: 5,
    bs: 0.0016,
    wa: 16,
    wf: 0.004
  },
  sad: {
    label: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>`,
    title: 'Sad',
    color: '#5c9dff',
    vx: [3, 7],
    vy: [3, 6],
    bob: 2,
    bs: 0.0005,
    wa: 3,
    wf: 0.001
  },
  angry: {
    label: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
      <path d="M7.5 8.5l3 1.5"/>
      <path d="M16.5 8.5l-3 1.5"/>
    </svg>`,
    title: 'Angry',
    color: '#ff5a5a',
    vx: [14, 26],
    vy: [-6, -2],
    bob: 2,
    bs: 0.002,
    shake: 3,
    wa: 0,
    wf: 0
  },
  calm: {
    label: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 1.5 4 1.5 4-1.5 4-1.5"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>`,
    title: 'Calm',
    color: '#2de8e8',
    vx: [3, 6],
    vy: [-4, -2],
    bob: 6,
    bs: 0.0004,
    wa: 14,
    wf: 0.0008
  }
};
const MOOD_FX = {
    happy: [
        {transalate: '0 14px', rotate: '-8deg'},
        {translate: '0 -10px' , roate: '8deg'},
        {transalate: '0 6px' , rotate: '-5deg'},
        {translate: '0 -4px' , rotate: '3deg'},
        {translate: '0 0' , rotate: '0deg'}
    ],
    sad: [
        {translate : '0 -16px'},
        {translate: '0 0'}
    ],
    angry: [
        {translate: '-8px 0'} , {translate: '8px 0'},
        {translate: '-6px 0'}, {translate: '6px 0'},
    ],
    calm: [
        {scale: '0.9'},
        {scale: '1'}
    ]
};
const THEMES= {
    overworld:{label:'Overworld'},
    nether:{label:'Nether', sky:['#2b0606', '#b8341a'], stars: 0},
    end:   {label:'The End', sky:['#07030f', '#2b1559'], stars:1}
};
const SKY = [
    ['#1f3a73' , '#5d7fb5'],
    ['#2a3270', '#c4703f'],
    ['#05081c', '#121a42'],
    ['#4a5fb0', '#d9a46a'],
    ['#1f3a73','#5d7fb5']
];
const GAP = 24;
const CYCLE = 150000;
const SETTINGS_KEY = 'driftAway.settings';
const NOTES_KEY = 'driftAway.notes';
function load(key, fallback) {
    try {
        const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback;
    }
    catch {
        return fallback;
    }
}
function save(key , val) {
    try{ localStorage.setItem(key, JSON.stringify(val));} catch{}
}
const defaults = {
    sound:true, cycle:true, burst:true, speed: 1, life: 75, theme:'overworld'
};
const settings = Object.assign({}, defaults, load(SETTINGS_KEY, {}));
if(!THEMES[settings.theme])settings.theme = 'overworld';

const $ = id => document.getElementById(id);
const sky = $('sky'), input = $('noteInput'), releaseBtn = $('releaseBtn');
const clearBtn = $('clearBtn'), soundBtn = $('soundBtn'), settingsBtn = $('settingsBtn');
const cloudBox = $('clouds'), starsEl = $('stars'), embersEl = $('embers');
const statsEl = $('stats'), overlay = $('settings');
const sunEl = document.querySelector('.sun'), moonEl = document.querySelector('.moon');
const groundEl = document.querySelector('.ground');

const notes = [];
let releasedCount = load(NOTES_KEY, {}).count || 0;
let selectedColor = null;
let selectedType = 'sign';
let selectedMood = 'random';

let audioCtx;
function beep(freq, dur, type = 'square', vol = 0.04, slideTo) {
    if(!settings.sound) return;
    try {
        audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
    } catch {}
}
const sfx = {
    release: () => { beep(520, 0.08); setTimeout(() => beep(780, 0.1), 70);},
    pop:  () => beep(320, 0.12 , 'square', 0.035 , 90),
    pin:  () => beep(660 , 0.07, 'triangle', 0.06),
    click: () => beep(400 , 0.05 , 'square' , 0.025)
};
for(let i = 0; i < 6; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const dur = 110 + Math.random() * 130;
    c.style.width = (90 + Math.random() * 120) + 'px';
    c.style.top = (3 + Math.random() * 48) + '%';
    c.style.opacity = (0.65 + Math.random() * 0.3).toFixed(2);
    c.style.animationDuration = dur + 's';
    c.style.animationDelay = -(Math.random() * dur) + 's';
    cloudBox.appendChild(c);
}
for(let i = 0; i < 70; i++) {
    const st = document.createElement('div');
    st.className = 'star';
    st.style.left = Math.random() * 100 + '%';
    st.style.top = Math.random() * 65 + '%';
    st.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    starsEl.appendChild(st);
}
for(let i  = 0; i < 30; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    const size = 3 + Math.random() * 4;
    const dur = 6 + Math.random() * 9;
    e.style.width = e.style.height = size + 'px';
    e.style.left = Math.random() * 100 + '%';
    e.style.animationDuration = dur + 's';
    e.style.animationDelay = -(Math.random() * dur) + 's';
    embersEl.appendChild(e);
}
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
}

let skyClock = 0;
let lastSky = { top: '#1f3a73', bot: '#5d7fb5', night: 0 };

function updateSky() {
  const th = settings.theme;
  let top, bot, night = 0, starAlpha = 0;

  if (th === 'overworld') {
    const t = (skyClock % CYCLE) / CYCLE;
    const seg = Math.min(Math.floor(t * 4), 3), k = t * 4 - seg;
    top = mix(SKY[seg][0], SKY[seg + 1][0], k);
    bot = mix(SKY[seg][1], SKY[seg + 1][1], k);

    const a = t * Math.PI * 2;
    sunEl.style.left  = (50 + 42 * Math.sin(a)) + '%';
    sunEl.style.top   = (62 - 52 * Math.cos(a)) + '%';
    moonEl.style.left = (50 - 42 * Math.sin(a)) + '%';
    moonEl.style.top  = (62 + 52 * Math.cos(a)) + '%';

    night = (1 - Math.cos(a)) / 2;
    starAlpha = Math.max(0, Math.min(1, (night - 0.55) * 3));
    const dim = `brightness(${(1 - night * 0.6).toFixed(2)})`;
    cloudBox.style.filter = dim;
    groundEl.style.filter = dim;
    sunEl.style.display = moonEl.style.display = '';
  } else {
    [top, bot] = THEMES[th].sky;
    starAlpha = THEMES[th].stars;
    sunEl.style.display = moonEl.style.display = 'none';
    cloudBox.style.filter = groundEl.style.filter = 'none';
  }

  starsEl.style.opacity = starAlpha;
  document.body.style.background = `linear-gradient(to bottom, ${top}, ${bot} 70%)`;
  lastSky = { top, bot, night: starAlpha };
}

let setThemeBtn;
function setTheme(id) {
  settings.theme = id;
  document.body.dataset.theme = id;
  save(SETTINGS_KEY, settings);
  if (setThemeBtn) setThemeBtn(id);
  updateSky();
}

function area() {
  return { l: 12, r: innerWidth - 12, t: 110, b: innerHeight - 290 };
}
function spaceBetween(a, x, y, w, h) {
  const dx = Math.max(a.x - (x + w), x - (a.x + a.w), 0);
  const dy = Math.max(a.y - (y + h), y - (a.y + a.h), 0);
  return Math.hypot(dx, dy);
}
function findSpot(w, h) {
  const A = area();
  const others = notes.filter(n => !n.fading);
  let best = { x: A.l, y: A.t }, bestScore = -1;
  for (let i = 0; i < 80; i++) {
    const x = A.l + Math.random() * Math.max(1, A.r - A.l - w);
    const y = A.t + Math.random() * Math.max(1, A.b - A.t - h);
    let score = Infinity;
    for (const o of others) score = Math.min(score, spaceBetween(o, x, y, w, h));
    if (score > bestScore) { bestScore = score; best = { x, y }; }
    if (score >= GAP * 1.5) break;
  }
  return best;
}

function ago(ts) {
  const s = Math.max(0, ((Date.now() - ts) / 1000) | 0);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + ' h ago';
  return Math.round(h / 24) + ' d ago';
}
function metaText(n) {
  return `released ${ago(n.born)} · click to ${n.pinned ? 'unpin' : 'pin'}`;
}
function updateStats() {
  const live = notes.filter(n => !n.fading);
  const pinned = live.filter(n => n.pinned).length;
  statsEl.textContent = `Released ${releasedCount} · Floating ${live.length}` + (pinned ? ` · Pinned ${pinned}` : '');
}
function persist() {
  save(NOTES_KEY, {
    count: releasedCount,
    notes: notes.filter(n => !n.fading).map(n => ({
      id: n.id, text: n.text, color: n.color, type: n.type,
      mood: n.mood, born: n.born, expires: n.expires, pinned: n.pinned
    }))
  });
}

function popEffect(x, y, color, count = 16) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 8;
    p.style.cssText =
      `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;` +
      `background:${i % 3 === 0 ? '#fff' : color};border-radius:50%;` +
      `box-shadow:0 0 8px ${color};pointer-events:none;`;
    sky.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 70;
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + 30}px) scale(.3)`, opacity: 0 }
    ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.4,1)' })
      .onfinish = () => p.remove();
  }
}
const rand = r => r[0] + Math.random() * (r[1] - r[0]);

function spawnNote(d, isNew) {
  const type = TYPES.some(t => t.id === d.type) ? d.type : 'sign';
  const el = document.createElement('div');
  const moodId = MOODS[d.mood] ? d.mood : 'random';
  el.className = `note type-${type} mood-${moodId}` + (d.pinned ? ' pinned' : '');
  el.style.setProperty('--c', d.color);
  el.style.left = '0';
  el.style.top = '0';

  const txt = document.createElement('span');
  txt.className = 'txt';
  txt.textContent = d.text;
  const meta = document.createElement('span');
  meta.className = 'meta';
  el.append(txt, meta);
  sky.appendChild(el);

  const w = el.offsetWidth, h = el.offsetHeight;
  const pos = findSpot(w, h);
  const m = MOODS[d.mood] || MOODS.random;

  const n = {
    ...d, type, el, meta, w, h,
    x: pos.x, y: pos.y,
    vx: (Math.random() < .5 ? -1 : 1) * rand(m.vx),
    vy: rand(m.vy),
    shake: m.shake || 0,
    bob: m.bob,
    bs: m.bs * (0.8 + Math.random() * 0.4),
    wa: m.wa || 0,
    wf: (m.wf || 0) * (0.8 + Math.random() * 0.4),
    rot: Math.round((Math.random() - 0.5) * 8),
    phase: Math.random() * 6.28,
    bobNow: 0,
    hover: false,
    fading: false
  };

  el.addEventListener('mouseenter', () => { n.hover = true; meta.textContent = metaText(n); });
  el.addEventListener('mouseleave', () => { n.hover = false; });
  el.addEventListener('click', () => togglePin(n));

  notes.push(n);
  if (isNew && MOOD_FX[moodId]) {
    el.animate(MOOD_FX[moodId], {
        duration: moodId === 'angry' ? 450 : moodId === 'happy' ? 1300 : 1600,
        easing: 'ease-out'
    });
  }
  requestAnimationFrame(() => el.classList.add('visible'));
  if (isNew) popEffect(n.x + w / 2, n.y + h / 2, d.color);
  updateStats();
  return n;
}

function createNote(text) {
  const mood = MOODS[selectedMood];
  const color = selectedColor || mood.color || COLORS[Math.floor(Math.random() * COLORS.length)];
  const born = Date.now();
  releasedCount++;
  spawnNote({
    id: born + '-' + Math.random().toString(36).slice(2, 7),
    text, color,
    type: selectedType,
    mood: selectedMood,
    born,
    expires: born + settings.life * 1000 * (1 + Math.random() * 0.5),
    pinned: false
  }, true);
  sfx.release();
  persist();
}

function togglePin(n) {
  if (n.fading) return;
  n.pinned = !n.pinned;
  n.el.classList.toggle('pinned', n.pinned);
  if (!n.pinned) n.expires = Date.now() + settings.life * 1000;
  n.meta.textContent = metaText(n);
  sfx.pin();
  updateStats();
  persist();
}

function fadeAndRemove(n) {
  if (n.fading) return;
  n.fading = true;
  persist();
  const burst = settings.burst;
  if (burst) {
    popEffect(n.x + n.w / 2, n.y + n.h / 2, n.color, 12);
    sfx.pop();
    n.el.classList.add('bursting');
  }
  n.el.classList.add('fading');
  setTimeout(() => {
    n.el.remove();
    const i = notes.indexOf(n);
    if (i > -1) notes.splice(i, 1);
    updateStats();
  }, burst ? 300 : 2400);
  updateStats();
}

function clearNotes(includePinned) {
  notes.slice().forEach(n => { if (includePinned || !n.pinned) fadeAndRemove(n); });
}
function clampAndBounce(n, A) {
  if (n.x < A.l) { n.x = A.l; n.vx = Math.abs(n.vx); }
  if (n.x + n.w > A.r) { n.x = A.r - n.w; n.vx = -Math.abs(n.vx); }
  if (n.y < A.t) { n.y = A.t; n.vy = Math.abs(n.vy); }
  if (n.y + n.h > A.b) { n.y = A.b - n.h; n.vy = -Math.abs(n.vy); }
}

let last = performance.now();
let skyAcc = 0;

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const A = area();
  const wall = Date.now();

  if (settings.cycle) skyClock += dt * 1000;
  skyAcc += dt;
  if (skyAcc > 0.2) { skyAcc = 0; updateSky(); }

  for (const n of notes) {
    if (!n.fading && !n.pinned && wall > n.expires) fadeAndRemove(n);
    if (n.hover) continue;
    n.x += n.vx * dt * settings.speed;
    n.y += n.vy * dt * settings.speed;
    clampAndBounce(n, A);
  }

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i], b = notes[j];
      if (a.fading || b.fading) continue;
      const wa = a.hover ? 0 : 1, wb = b.hover ? 0 : 1;
      const total = wa + wb;
      if (!total) continue;
      const ox = Math.min(a.x + a.w + GAP - b.x, b.x + b.w + GAP - a.x);
      const oy = Math.min(a.y + a.h + GAP - b.y, b.y + b.h + GAP - a.y);
      if (ox > 0 && oy > 0) {
        if (ox < oy) {
          const dir = (a.x + a.w / 2 < b.x + b.w / 2) ? -1 : 1;
          a.x += dir * ox * wa / total; b.x -= dir * ox * wb / total;
          if (wa) a.vx = dir * Math.abs(a.vx);
          if (wb) b.vx = -dir * Math.abs(b.vx);
        } else {
          const dir = (a.y + a.h / 2 < b.y + b.h / 2) ? -1 : 1;
          a.y += dir * oy * wa / total; b.y -= dir * oy * wb / total;
          if (wa) a.vy = dir * Math.abs(a.vy);
          if (wb) b.vy = -dir * Math.abs(b.vy);
        }
      }
    }
  }

  for (const n of notes) {
    clampAndBounce(n, A);
    if (!n.hover) n.bobNow = Math.sin(now * n.bs + n.phase) * n.bob;
    let tx = n.x, ty = n.y + n.bobNow;
    if(n.wa && !n.hover) {
        ty += Math.sin(now * n.wf + n.phase) * n.wa;
        ty += Math.cos(now * n.wf * 0.5 + n.phase) * n.wa * 0.5;
    }
    if (n.shake && !n.hover) {
      tx += (Math.random() - 0.5) * n.shake * 2;
      ty += (Math.random() - 0.5) * n.shake * 2;
    }
    const rot = n.hover ? 0 : n.rot;
    const scale = n.hover ? 1.06 : 1;
    n.el.style.transform =
      `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot}deg) scale(${scale})`;
  }
  requestAnimationFrame(loop);
}

function buildSeg(box, items, current, onPick) {
  const btns = [];
  const set = id => btns.forEach(([i, b]) => b.setAttribute('aria-pressed', String(i === id)));
  items.forEach(it => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'seg-btn';

    if (typeof it.label === 'string' && it.label.trim().startsWith('<svg')) {
      b.innerHTML = it.label;
    } else {
      b.textContent = it.label;
    }
    b.title = it.title || '';
    b.setAttribute('aria-label', it.title || it.label);
    b.addEventListener('click', () => { set(it.id); onPick(it.id); });
    box.appendChild(b);
    btns.push([it.id, b]);
  });
  set(current);
  return set;
}

const swatchBox = $('swatches');
const swatchEls = [];
function addSwatch(color) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'swatch' + (color ? '' : ' random selected');
  b.setAttribute('aria-label', color ? 'Colour ' + color : 'Random colour');
  if (color) b.style.setProperty('--c', color);
  b.addEventListener('click', () => { pickColor(color); input.focus(); });
  swatchBox.appendChild(b);
  swatchEls.push([color, b]);
}
function pickColor(color) {
  selectedColor = color;
  swatchEls.forEach(([c, b]) => b.classList.toggle('selected', c === color));
}
addSwatch(null);
COLORS.forEach(addSwatch);

buildSeg($('types'), TYPES, selectedType, id => { selectedType = id; input.focus(); sfx.click(); });
buildSeg(
  $('moods'),
  Object.entries(MOODS).map(([id, m]) => ({ id, label: m.label, title: m.title })),
  selectedMood,
  id => {
    selectMood =id;
    pickColor(MOOS[id].color);
    input.focus();
    sfx.click();
  }
);
clearBtn.addEventListener('click', () => {
  const hasPinned = notes.some(n => n.pinned && !n.fading);
  const includePinned = hasPinned ? confirm('Clear pinned notes too?\n\nOK = clear everything, Cancel = keep pinned notes') : true;
  clearNotes(includePinned);
});

function setSound(v){
    settings.sound =v;
    $('optSound').checked = v;
    soundBtn.textContent = v ? '🔊' : '🔇';
    save(SETTINGS_KEY , settings);
}
function openSettings() {overlay.hidden = false; $('closeSettings').focus();}
function closeSettings() {overlay.hidden = true; input.focus();}

$('optCycle').checked = settings.cycle;
$('optBurst').checked = settings.burst;
$('optSpeed').value = settings.speed;
$('optLife').value = settings.life;
$('speedVal').textContent = settings.speed.toFixed(1) + 'x';
$('lifeVal').textContent = settings.life + 's';
setSound(settings.sound);

soundBtn.addEventListener('click', () => {setSound(!settings.sound); sfx.click();});
settingsBtn.addEventListener('click', openSettings);
$('closeSettings').addEventListener('click', closeSettings);
overlay.addEventListener('click', e => { if (e.target === overlay) closeSettings(); });
$('optSound').addEventListener('change' , e => setSound (e.target.checked));
$('optCycle').addEventListener('change' , e => {settings.cycle = e.target.checked; save(SETTINGS_KEY, settings);});
$('optBurst').addEventListener('change' , e => {settings.burst = e.target.checked; save(SETTINGS_KEY, settings);});
$('optSpeed').addEventListener('input', e => {
    settings.speed = parseFloat(e.target.value);
    $('speedVal').textContent = settings.speed.toFixed(1) + 'x';
    save(SETTINGS_KEY, settings);
});
$('optLife').addEventListener('input' , e => {
    settings.life = parseInt(e.target.value, 10);
    $("lifeVal").textContent = settings.life + 's';
    save(SETTINGS_KEY, settings);
});
setThemeBtn = buildSeg (
    $('themes'),
    Object.entries(THEMES).map(([id , t]) => ({id, label: t.label, title: t.label})),
    settings.theme, 
    id => setTheme(id)
);
$('wipeBtn').addEventListener('click', () => {
    if(!confirm('Delete ALL notes (including pinned) and reset the counter?')) return;
    clearNotes(true);
    releasedCount = 0;
    persist();
    updateStats();
});

function wrapText(c, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (c.measureText(test).width > maxW && line) {
      c.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  c.fillText(line, x, y);
}

async function exportImage() {
  try { await document.fonts.ready; } catch {}
  const W = 1280, H = 720;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const sx = W / innerWidth, sy = H / innerHeight;
  const css = getComputedStyle(document.body);

  const g = c.createLinearGradient(0, 0, 0, H * 0.7);
  g.addColorStop(0, lastSky.top);
  g.addColorStop(1, lastSky.bot);
  c.fillStyle = lastSky.bot; c.fillRect(0, 0, W, H);
  c.fillStyle = g; c.fillRect(0, 0, W, H * 0.7);

  const sa = parseFloat(starsEl.style.opacity) || 0;
  if (sa > 0) {
    c.fillStyle = '#fff';
    starsEl.querySelectorAll('.star').forEach(s => {
      c.globalAlpha = sa * parseFloat(s.style.opacity);
      c.fillRect(parseFloat(s.style.left) / 100 * W, parseFloat(s.style.top) / 100 * H, 3, 3);
    });
    c.globalAlpha = 1;
  }

  const gh = 96 * sy;
  c.fillStyle = css.getPropertyValue('--dirt').trim(); c.fillRect(0, H - gh, W, gh);
  c.fillStyle = css.getPropertyValue('--grass').trim(); c.fillRect(0, H - gh, W, 24 * sy);

  c.textBaseline = 'top';
  for (const n of notes) {
    if (n.fading) continue;
    const x = n.x * sx, y = n.y * sy, w = n.w * sx, h = n.h * sy;
    c.fillStyle = n.type === 'torch' ? 'rgba(30, 22, 14, 0.9)' : 'rgba(20, 20, 28, 0.8)';
    c.fillRect(x, y, w, h);
    c.lineWidth = 2 * sx; c.strokeStyle = n.color; c.strokeRect(x, y, w, h);
    c.fillStyle = n.type === 'torch' ? n.color : '#f2f0eb';
    c.font = `italic ${22 * sx}px "Cormorant Garamond", serif`;
    wrapText(c, n.text, x + 16 * sx, y + 14 * sx, w - 32 * sx, 22 * sx * 1.45);
  }

  c.fillStyle = '#f0eee9';
  c.font = '500 30px "Cormorant Garamond", serif';
  c.fillText('Drift Notes', 24, 24);

  const a = document.createElement('a');
  a.download = 'drift-notes.png';
  a.href = cv.toDataURL('image/png');
  a.click();
}
$('exportBtn').addEventListener('click', exportImage);

document.addEventListener('keydown', e => {
    if(!overlay.hidden) {
        if(e.key === 'Escape') closeSettings();
        return;
    }
    if(e.key === 'Escape') {
        if(input.value) input.value = "";
        else clearNotes(false);
        return;
    }
    if(e.altKey && /^Digit[0-8]$/.test(e.code)) {
        e.preventDefault();
        const i = parseInt(e.code.slice(5) , 10);
        pickColor(i === 0 ? null : COLORS[i - 1]);
    }
});

document.body.dataset.theme = settings.theme;
updateSky();
const saved = load(NOTES_KEY, {notes :[]});
(saved.notes || []).forEach(d => {
    if(d && d.text && (d.pinned || d.expires > Date.now())) spawnNote(d, false);
});
updateStats();
requestAnimationFrame(loop);
input.focus();

function releaseNote() {
    const text = input.value.trim();
    if(!text) return;

    createNote(text);
    input.value = "";
    input.focus();
}
releaseBtn.addEventListener('click' , releaseNote);
input.addEventListener('keydown',(e) => {
    if(e.key === 'Enter') releaseNote();
});