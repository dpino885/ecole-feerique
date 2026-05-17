// 8. LOGIQUE DU MODULE MEMORY

const emojisAnimaux = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
    '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤',
    '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱',
    '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦗', '🕷️',
    '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐'
];

const configurationsMemory = {
    'facile': { cartes: 8, colonnes: 4 },
    'normal': { cartes: 16, colonnes: 4 },
    'difficile': { cartes: 32, colonnes: 8 }
};

let pairesTrouvees = 0;

function initialiserMemory() {
    const info = document.getElementById('infoMemory');
    if (info) info.innerText = `Niveau : ${difficulteActuelleMemory.charAt(0).toUpperCase() + difficulteActuelleMemory.slice(1)}`;

    parler(`Jeu de mémoire, niveau ${difficulteActuelleMemory}. Trouve les paires d'animaux !`);

    genererGrilleMemory();
}

function changerDifficulteMemory(nouvelleDiff) {
    difficulteActuelleMemory = nouvelleDiff;
    initialiserMemory();
}

function genererGrilleMemory() {
    const grille = document.getElementById('grilleMemory');
    if (!grille) return;

    const config = configurationsMemory[difficulteActuelleMemory];
    const nbPaires = config.cartes / 2;

    // Sélectionner des emojis aléatoires pour les paires
    const selectionEmojis = [...emojisAnimaux].sort(() => 0.5 - Math.random()).slice(0, nbPaires);
    const cartes = [...selectionEmojis, ...selectionEmojis].sort(() => 0.5 - Math.random());

    grille.innerHTML = '';
    grille.style.gridTemplateColumns = `repeat(${config.colonnes}, 1fr)`;

    // Ajouter ou retirer la classe pour les petites cartes
    grille.classList.remove('grille-facile', 'grille-normal', 'grille-difficile');
    grille.classList.add(`grille-${difficulteActuelleMemory}`);

    cartesRetournees = [];
    pairesTrouvees = 0;
    peutJouerMemory = true;

    cartes.forEach((emoji, index) => {
        const carte = document.createElement('div');
        carte.className = 'carte-memory';
        carte.dataset.emoji = emoji;
        carte.dataset.index = index;

        carte.innerHTML = `
            <div class="carte-dos"></div>
            <div class="carte-face">${emoji}</div>
        `;

        carte.onclick = () => retournerCarte(carte);
        grille.appendChild(carte);
    });
}

function retournerCarte(carte) {
    if (!peutJouerMemory || carte.classList.contains('retournee') || cartesRetournees.includes(carte)) {
        return;
    }

    carte.classList.add('retournee');
    cartesRetournees.push(carte);

    if (cartesRetournees.length === 2) {
        peutJouerMemory = false;
        verifierPaire();
    }
}

function verifierPaire() {
    const [carte1, carte2] = cartesRetournees;
    const estPaire = carte1.dataset.emoji === carte2.dataset.emoji;

    if (estPaire) {
        pairesTrouvees++;
        cartesRetournees = [];
        peutJouerMemory = true;

        // Petite explosion d'étoiles sur la paire
        const rect = carte2.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            const p = new Particule(rect.left + rect.width / 2, rect.top + rect.height / 2);
            p.couleur = "#ffd700";
            particules.push(p);
        }

        const config = configurationsMemory[difficulteActuelleMemory];
        if (pairesTrouvees === config.cartes / 2) {
            celebrerVictoireMemory();
        }
    } else {
        setTimeout(() => {
            carte1.classList.remove('retournee');
            carte2.classList.remove('retournee');
            cartesRetournees = [];
            peutJouerMemory = true;
        }, 1000);
    }
}

function celebrerVictoireMemory() {
    parler("Bravo ! Tu as trouvé toutes les paires !");

    // Grande explosion d'étoiles
    for (let i = 0; i < 100; i++) {
        const p = new Particule(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        p.couleur = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particules.push(p);
    }

    setTimeout(() => {
        passerNiveauSuivantMemory();
    }, 3000);
}

function passerNiveauSuivantMemory() {
    if (difficulteActuelleMemory === 'facile') {
        difficulteActuelleMemory = 'normal';
    } else if (difficulteActuelleMemory === 'normal') {
        difficulteActuelleMemory = 'difficile';
    } else {
        parler("Tu es une véritable experte du memory !");
        difficulteActuelleMemory = 'facile'; // On boucle
    }
    initialiserMemory();
}
