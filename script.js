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