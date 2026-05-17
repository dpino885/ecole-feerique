// 9. LOGIQUE DU MODULE PIANO

const NOTES_PIANO = [
    { note: 'C4', freq: 261.63, type: 'blanche' },
    { note: 'C#4', freq: 277.18, type: 'noire' },
    { note: 'D4', freq: 293.66, type: 'blanche' },
    { note: 'D#4', freq: 311.13, type: 'noire' },
    { note: 'E4', freq: 329.63, type: 'blanche' },
    { note: 'F4', freq: 349.23, type: 'blanche' },
    { note: 'F#4', freq: 369.99, type: 'noire' },
    { note: 'G4', freq: 392.00, type: 'blanche' },
    { note: 'G#4', freq: 415.30, type: 'noire' },
    { note: 'A4', freq: 440.00, type: 'blanche' },
    { note: 'A#4', freq: 466.16, type: 'noire' },
    { note: 'B4', freq: 493.88, type: 'blanche' },
    { note: 'C5', freq: 523.25, type: 'blanche' }
];

const COMPTINES = [
    {
        titre: "Ah ! vous dirai-je, maman",
        notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4']
    },
    {
        titre: "Au clair de la lune",
        notes: ['C4', 'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'E4', 'D4', 'D4', 'C4']
    },
    {
        titre: "Frère Jacques",
        notes: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'E4', 'F4', 'G4']
    },
    {
        titre: "Une souris verte",
        notes: ['G4', 'E4', 'E4', 'G4', 'E4', 'E4', 'G4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4']
    },
    {
        titre: "J'ai du bon tabac",
        notes: ['C4', 'D4', 'E4', 'C4', 'D4', 'D4', 'D4', 'C4', 'D4', 'E4', 'C4', 'D4', 'D4', 'C4']
    },
    {
        titre: "Le bon roi Dagobert",
        notes: ['D4', 'G4', 'G4', 'G4', 'A4', 'B4', 'G4', 'B4', 'A4', 'A4', 'A4', 'G4', 'F#4', 'G4']
    },
    {
        titre: "Petit Papa Noël",
        notes: ['C4', 'F4', 'F4', 'F4', 'A4', 'G4', 'F4', 'G4', 'A4', 'F4', 'D4', 'C4']
    },
    {
        titre: "À la volette",
        notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4']
    },
    {
        titre: "Dans la forêt lointaine",
        notes: ['G4', 'E4', 'G4', 'E4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4']
    },
    {
        titre: "Pomme de reinette",
        notes: ['G4', 'G4', 'E4', 'E4', 'G4', 'G4', 'E4', 'G4', 'G4', 'A4', 'A4', 'G4']
    }
];


function initialiserPiano() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const clavier = document.getElementById('clavierPiano');
    if (!clavier) return;
    clavier.innerHTML = '';

    NOTES_PIANO.forEach(noteData => {
        const touche = document.createElement('div');
        touche.className = `touche ${noteData.type}`;
        touche.dataset.note = noteData.note;

        // Support souris et tactile
        touche.addEventListener('mousedown', (e) => { e.preventDefault(); jouerNote(noteData.note); });
        touche.addEventListener('touchstart', (e) => { e.preventDefault(); jouerNote(noteData.note); }, { passive: false });

        clavier.appendChild(touche);
    });

    comptineActuelle = null;
    indexNoteComptine = 0;
    document.getElementById('titreComptine').innerText = "Mode Libre";
    parler("Le piano aux étoiles ! Appuie sur les touches pour faire de la musique.");

    genererListeComptines();
}

function jouerNote(nomNote, estAuto = false) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const noteData = NOTES_PIANO.find(n => n.note === nomNote);
    if (!noteData) return;

    // Création du son "Casio-style" (onde triangle pour plus de douceur)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(noteData.freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1);

    // Feedback visuel
    const touche = document.querySelector(`.touche[data-note="${nomNote}"]`);
    if (touche) {
        touche.classList.add('active');
        setTimeout(() => touche.classList.remove('active'), 200);
        lancerEtoilePiano(touche);
    }

    // Logique "Suis la lumière"
    if (comptineActuelle && !estAuto) {
        if (nomNote === comptineActuelle.notes[indexNoteComptine]) {
            indexNoteComptine++;
            if (indexNoteComptine >= comptineActuelle.notes.length) {
                celebrerFinComptine();
            } else {
                guiderNoteSuivante();
            }
        }
    }
}

function lancerEtoilePiano(touche) {
    const rect = touche.getBoundingClientRect();
    const etoile = document.createElement('div');
    etoile.className = 'etoile-piano';
    etoile.innerText = '⭐';

    // Position de départ sur la touche
    etoile.style.left = `${rect.left + rect.width / 2}px`;
    etoile.style.top = `${rect.top + rect.height / 2}px`;

    // Direction aléatoire
    const dx = (Math.random() - 0.5) * 400;
    const dy = -Math.random() * 400 - 100;
    etoile.style.setProperty('--dx', `${dx}px`);
    etoile.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(etoile);
    setTimeout(() => etoile.remove(), 1500);
}

function genererListeComptines() {
    const grille = document.getElementById('grilleComptines');
    if (!grille) return;
    grille.innerHTML = '';

    COMPTINES.forEach((c, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-comptine';
        btn.innerHTML = `🎵 ${c.titre}`;
        btn.onclick = () => choisirComptine(index);
        grille.appendChild(btn);
    });
}

function choisirComptine(index) {
    comptineActuelle = COMPTINES[index];
    indexNoteComptine = 0;
    document.getElementById('titreComptine').innerText = comptineActuelle.titre;
    fermerListeComptines();
    parler(`C'est parti pour ${comptineActuelle.titre} ! Appuie sur l'étoile.`);
    guiderNoteSuivante();
}

function guiderNoteSuivante() {
    // Retirer les guides précédents
    document.querySelectorAll('.touche.guide').forEach(t => t.classList.remove('guide'));

    if (comptineActuelle && indexNoteComptine < comptineActuelle.notes.length) {
        const noteCible = comptineActuelle.notes[indexNoteComptine];
        const touche = document.querySelector(`.touche[data-note="${noteCible}"]`);
        if (touche) {
            touche.classList.add('guide');
        }
    }
}

function celebrerFinComptine() {
    const titre = comptineActuelle.titre;
    comptineActuelle = null;
    document.querySelectorAll('.touche.guide').forEach(t => t.classList.remove('guide'));

    parler(`Bravo ! Tu as joué ${titre} comme une fée !`);

    // Explosion d'étoiles
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const p = new Particule(x, y);
            p.couleur = "#ffd700";
            particules.push(p);
        }, i * 50);
    }

    setTimeout(() => {
        document.getElementById('titreComptine').innerText = "Mode Libre";
    }, 3000);
}

function ouvrirListeComptines() {
    document.getElementById('overlayComptines').style.display = 'flex';
}

function fermerListeComptines() {
    document.getElementById('overlayComptines').style.display = 'none';
}

function retourMenuPiano() {
    comptineActuelle = null;
    document.querySelectorAll('.touche.guide').forEach(t => t.classList.remove('guide'));
    retourMenu();
}
