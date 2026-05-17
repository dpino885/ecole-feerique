// 4. ALPHABET SÉQUENTIEL MAGIQUE
const dictionnaireAlphabet = {
    'A': { mot: 'Avion', emoji: '✈️' },
    'B': { mot: 'Ballon', emoji: '🎈' },
    'C': { mot: 'Chat', emoji: '🐱' },
    'D': { mot: 'Dinosaure', emoji: '🦖' },
    'E': { mot: 'Éléphant', emoji: '🐘' },
    'F': { mot: 'Fleur', emoji: '🌸' },
    'G': { mot: 'Gâteau', emoji: '🍰' },
    'H': { mot: 'Hibou', emoji: '🦉' },
    'I': { mot: 'Île', emoji: '🏝️' },
    'J': { mot: 'Jardin', emoji: '🏡' },
    'K': { mot: 'Kangourou', emoji: '🦘' },
    'L': { mot: 'Lion', emoji: '🦁' },
    'M': { mot: 'Maison', emoji: '🏠' },
    'N': { mot: 'Nuage', emoji: '☁️' },
    'O': { mot: 'Ours', emoji: '🧸' },
    'P': { mot: 'Pomme', emoji: '🍎' },
    'Q': { mot: 'Quille', emoji: '🎳' },
    'R': { mot: 'Robot', emoji: '🤖' },
    'S': { mot: 'Soleil', emoji: '☀️' },
    'T': { mot: 'Train', emoji: '🚂' },
    'U': { mot: 'Unicorne', emoji: '🦄' },
    'V': { mot: 'Vélo', emoji: '🚲' },
    'W': { mot: 'Wagon', emoji: '🚃' },
    'X': { mot: 'Xylophone', emoji: '🎹' },
    'Y': { mot: 'Yaourt', emoji: '🍦' },
    'Z': { mot: 'Zèbre', emoji: '🦓' }
};

let indexLettreActuelle = 0;

/**
 * Prépare le module quand on l'ouvre depuis le menu
 */
function genererAlphabet() {
    const ecranDepart = document.getElementById('ecranDepartAlphabet');
    const zoneJeu = document.getElementById('zoneLettreMagique');

    if(ecranDepart && zoneJeu) {
        ecranDepart.style.display = 'block';
        zoneJeu.style.display = 'none';
    }
    indexLettreActuelle = 0;
}

/**
 * Lancé par le gros bouton "JOUER"
 */
function demarrerAlphabet() {
    console.log("Tentative de démarrage de l'alphabet..."); // Pour déboguer
    const ecran = document.getElementById('ecranDepartAlphabet');
    const zone = document.getElementById('zoneLettreMagique');

    if (ecran && zone) {
        ecran.style.setProperty('display', 'none', 'important');
        zone.style.setProperty('display', 'flex', 'important');
        indexLettreActuelle = 0; // On s'assure de repartir à A
        afficherLettre();
    } else {
        console.error("Erreur : Les IDs ecranDepartAlphabet ou zoneLettreMagique sont introuvables !");
    }
}

/**
 * Gère l'affichage et la voix pour la lettre en cours
 */
function afficherLettre() {
    const alphabet = Object.keys(dictionnaireAlphabet);
    const lettre = alphabet[indexLettreActuelle];
    const data = dictionnaireAlphabet[lettre];
    const mot = data.mot;
    const emoji = data.emoji;

    const bouton = document.getElementById('grandeLettre');
    const emojiExemple = document.getElementById('emojiExemple');
    const texteMot = document.getElementById('motExemple');

    if (bouton && texteMot && emojiExemple) {
        bouton.innerText = lettre;
        texteMot.innerText = mot;
        emojiExemple.innerText = emoji;

        // Remove the bounce class to reset the animation
        emojiExemple.classList.remove('bounce-animation');
        // Force a reflow to restart the animation
        void emojiExemple.offsetWidth;
        // Add the bounce class back
        emojiExemple.classList.add('bounce-animation');

        // Couleur dynamique (arc-en-ciel au fil de l'alphabet)
        const teinte = (indexLettreActuelle * (360 / 26));
        bouton.style.background = `linear-gradient(135deg, hsl(${teinte}, 70%, 60%), hsl(${teinte}, 80%, 40%))`;

        // La fée parle
        parler(`${lettre.toUpperCase()} comme ${mot}`);

        // Explosion d'étoiles au centre
        for (let i = 0; i < 20; i++) {
            const p = new Particule(window.innerWidth / 2, window.innerHeight / 2);
            p.couleur = `hsl(${teinte}, 100%, 70%)`;
            particules.push(p);
        }
    }
}

function lettreSuivante() {
    const alphabet = Object.keys(dictionnaireAlphabet);
    indexLettreActuelle++;

    if (indexLettreActuelle >= alphabet.length) {
        indexLettreActuelle = 0;
        parler("Bravo championne ! On recommence au début !");
    }
    afficherLettre();
}

function lettrePrecedente() {
    const alphabet = Object.keys(dictionnaireAlphabet);
    indexLettreActuelle--;

    if (indexLettreActuelle < 0) {
        indexLettreActuelle = alphabet.length - 1;
    }
    afficherLettre();
}

function interagirLettre() {
    const bouton = document.getElementById('grandeLettre');
    if (!bouton) return;

    bouton.classList.remove('anim-interaction');
    void bouton.offsetWidth;
    bouton.classList.add('anim-interaction');

    bouton.style.setProperty('--couleur-scintillement', couleurActuelle);

    const alphabet = Object.keys(dictionnaireAlphabet);
    const lettreEnCours = alphabet[indexLettreActuelle];

    ouvrirModule('tracerLettres', { lettre: lettreEnCours });
}
