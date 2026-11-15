const COLORS = ['#ff5a5a', '#ffe135', '#4cf064', '#2de8e8','#5c9bff','#ffe6ec7'];
const TYPE = [
  { id: 'sign',   label: '🪧', title: 'Sign' },
  { id: 'book',   label: '📖', title: 'Book' },
  { id: 'torch',  label: '🔦', title: 'Torch' },
  { id: 'bottle', label: '🍾', title: 'Bottle' }
];
const MODS = {
    random:{label:'🎲', title:'Random', color:null ,   vx:[6,16], vy:[-12, -4], bob:3, bs: 0.0008},
    happy: {label:'😊', title:'Happy', colo:'#ffe135', vx:[10, 20], vy:[-14, -7], bob:5, bs: 0.0016},
    sad:{label:'😢', title:'Sad', color:'#5c9dff', vx:[3, 7], vy:[3, 6] , bob:2, bs:0.0005},
    angry: {label:'😠', title:'Angry', color:'#ff5a5a', vx:[14, 26], vy:[-6, -2], bob:2, bs: 0.002, shake:2.5},
    calm: {label:'😌', title:'Calm', color:'#2de8e8', vx:[3, 6], vy:[-4, -2], bob:6, bs: 0.0004}
};
const THEMES= {
    overworld:{label:'Overworld'},
    nether:{lable:'Nether', sky:['#2b0606', '#b8314a'], stars: 0},
    end:   {label:'The End', sky:['#07030f', '#2b1559'], stars:1}
};
const SKY = [
    ['#5b9df0' , '#a9d4ff'],
    ['#3b4a9c', '#ff9a5c'],
    ['#0a1030', '#1d2b64'],
    ['#4a5fb0', '#ffc98a'],
    ['#5b9df0','#a9d4ff']
];
const GAP = 24;
const CYCLE = 150000;
const SETTING_KEY = 'driftAway.settings';
const NOTES_KEY = 'driftAway.notes';
function load(key, fallback) {
    try {
        const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback;
    }
    catch {
        return fallbacl;
    }
}
function save(key , val) {
    try{ localStorage.setItem(key, JSON.stringify(val));} catch{}
}
const defaults = {
    sound:true, cycle:true, brust:true, speed: 1, life: 75, theme:'overworld'
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
function beep(fre, dur, type = 'sqaure', vol = 0.04, slideTo) {
    if(!settings.sound) return;
    try {
        audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type;
        if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
    } catch {}
}
const sfx = {
    release: () => { beep(520, 0.08); setTimeout(() => beep(780, 0.01), 70);},
    pop:  () => beep(320, 0.12 , 'square', 0.035 , 90),
    pin:  () => beep(660 , 0.07, 'triangle', 0.06),
    click: () => beep(400 , 0.05 , 'square' , 0.025)
};
for(let i = 0; i < 6; i++) {
    const c = document.createElementNS('div');
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
    st.style.top = Math.ramdom() * 65 + '%';
    st.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    starsEl.appendChild(st);
}
for(let i  = 0; i < 30; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    const size = 3 + Math.random() * 4;
    const dur = 6 + Math.random() * 9;
    e.style.wdith = e.style.height = size + 'px';
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
let lastSky = { top: '#5b9df0', bot: '#a9d4ff', night: 0 };

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
  el.className = `note type-${type}` + (d.pinned ? ' pinned' : '');
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
// function clampAndBounce(n, A) {
//     if(n.x < A.I) {n.x = A.I; n.vx = Math.abs(n.vx);}
//     if(n.x + n.w > A.r) {n.x = }
// }

function createNote(text) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = text;

    const startX = 10 + Math.random() * 70;
    const startY = 15 + Math.random() * 50;

    note.style.left = startX + '%';

  
    const rotation = (Math.random() - 0.5) * 12;
    note.style.transform = `rotate(${rotation}deg)`;

    sky.appendChild(note);

    requestAnimationFrame(() => {
        note.classList.add('visible');
    });

    animateDrift(note, startX, startY, rotation);

    const lifetime = 12000 + Math.random() * 8000;
    setTimeout(() => {
        note.classList.add('fading');
        setTimeout(() => note.remove(), 2600);
    }, lifetime);
}

function animateDrift(note, startX, startY, startRot) {
    const duration = 1800 + Math.random() * 10000;
    const startTime = performance.now();

    const driftX = (Math.random() - 0.5) * 35;
    const driftY = -15 - Math.random() * 25;
    const rotChange = (Math.random() - 0.5) * 18;

    function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 2.5);
        const x = startX + driftX * ease;
        const y = startY + driftY * ease;
        const rot = startRot + rotChange * ease;

        note.style.left = x + '%';
        note.style.top = y + '%';
        note.style.transform = `rotate(${rot}deg)`;

        if(progress < 1 && note.parentElement) {
            requestAnimationFrame(frame);
        }
    }
    requestAnimationFrame(frame);
}
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