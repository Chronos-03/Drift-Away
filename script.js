const sky = document.getElementById('sky');
const input = document.getElementById('noteInput');
const releaseBtn = document.getElementById('releaseBtn');
const clearBtn = document.getElementById('clearBtn');

function createNote(text) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = text;

    const startX = 10 + Math.random() * 70;
    const startY = 15 + Math.random() * 50;

    note.style.left = startX + '%';

    //randomnesss
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