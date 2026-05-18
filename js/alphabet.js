// 4. ALPHABET SÉQUENTIEL MAGIQUE
const dictionnaireAlphabet = {
    'A': [
        { mot: 'Avion', emoji: '✈️' },
        { mot: 'Abeille', emoji: '🐝' },
        { mot: 'Arbre', emoji: '🌳' },
        { mot: 'Ananas', emoji: '🍍' }
    ],
    'B': [
        { mot: 'Ballon', emoji: '🎈' },
        { mot: 'Bateau', emoji: '🚢' },
        { mot: 'Banane', emoji: '🍌' },
        { mot: 'Baleine', emoji: '🐋' }
    ],
    'C': [
        { mot: 'Chat', emoji: '🐱' },
        { mot: 'Chien', emoji: '🐶' },
        { mot: 'Cadeau', emoji: '🎁' },
        { mot: 'Citrouille', emoji: '🎃' }
    ],
    'D': [
        { mot: 'Dinosaure', emoji: '🦖' },
        { mot: 'Dauphin', emoji: '🐬' },
        { mot: 'Domino', emoji: '🀄' },
        { mot: 'Dragon', emoji: '🐉' }
    ],
    'E': [
        { mot: 'Éléphant', emoji: '🐘' },
        { mot: 'Étoile', emoji: '⭐' },
        { mot: 'Escargot', emoji: '🐌' },
        { mot: 'Écureuil', emoji: '🐿️' }
    ],
    'F': [
        { mot: 'Fleur', emoji: '🌸' },
        { mot: 'Fraise', emoji: '🍓' },
        { mot: 'Forêt', emoji: '🌲' },
        { mot: 'Fromage', emoji: '🧀' }
    ],
    'G': [
        { mot: 'Gâteau', emoji: '🍰' },
        { mot: 'Girafe', emoji: '🦒' },
        { mot: 'Glace', emoji: '🍦' },
        { mot: 'Guitare', emoji: '🎸' }
    ],
    'H': [
        { mot: 'Hibou', emoji: '🦉' },
        { mot: 'Hélicoptère', emoji: '🚁' },
        { mot: 'Hippopotame', emoji: '🦛' },
        { mot: 'Hôtel', emoji: '🏨' }
    ],
    'I': [
        { mot: 'Île', emoji: '🏝️' },
        { mot: 'Igloo', emoji: '❄️' },
        { mot: 'Insecte', emoji: '🐞' },
        { mot: 'Image', emoji: '🖼️' }
    ],
    'J': [
        { mot: 'Jardin', emoji: '🏡' },
        { mot: 'Jouet', emoji: '🧸' },
        { mot: 'Jupe', emoji: '👗' },
        { mot: 'Jaguar', emoji: '🐆' }
    ],
    'K': [
        { mot: 'Kangourou', emoji: '🦘' },
        { mot: 'Koala', emoji: '🐨' },
        { mot: 'Kiwi', emoji: '🥝' },
        { mot: 'Képi', emoji: '👮' }
    ],
    'L': [
        { mot: 'Lion', emoji: '🦁' },
        { mot: 'Lapin', emoji: '🐰' },
        { mot: 'Lune', emoji: '🌙' },
        { mot: 'Livre', emoji: '📚' }
    ],
    'M': [
        { mot: 'Maison', emoji: '🏠' },
        { mot: 'Mouton', emoji: '🐑' },
        { mot: 'Montagne', emoji: '🏔️' },
        { mot: 'Miroir', emoji: '🪞' }
    ],
    'N': [
        { mot: 'Nuage', emoji: '☁️' },
        { mot: 'Nid', emoji: '🪹' },
        { mot: 'Neige', emoji: '❄️' },
        { mot: 'Nez', emoji: '👃' }
    ],
    'O': [
        { mot: 'Ours', emoji: '🧸' },
        { mot: 'Oiseau', emoji: '🐦' },
        { mot: 'Orange', emoji: '🍊' },
        { mot: 'Ordinateur', emoji: '💻' }
    ],
    'P': [
        { mot: 'Pomme', emoji: '🍎' },
        { mot: 'Papillon', emoji: '🦋' },
        { mot: 'Parapluie', emoji: '☂️' },
        { mot: 'Poisson', emoji: '🐟' }
    ],
    'Q': [
        { mot: 'Quille', emoji: '🎳' },
        { mot: 'Quatre', emoji: '4️⃣' },
        { mot: 'Question', emoji: '❓' },
        { mot: 'Queue', emoji: '🐕' }
    ],
    'R': [
        { mot: 'Robot', emoji: '🤖' },
        { mot: 'Renard', emoji: '🦊' },
        { mot: 'Rose', emoji: '🌹' },
        { mot: 'Roue', emoji: '🎡' }
    ],
    'S': [
        { mot: 'Soleil', emoji: '☀️' },
        { mot: 'Souris', emoji: '🐭' },
        { mot: 'Serpent', emoji: '🐍' },
        { mot: 'Singe', emoji: '🐒' }
    ],
    'T': [
        { mot: 'Train', emoji: '🚂' },
        { mot: 'Tortue', emoji: '🐢' },
        { mot: 'Tigre', emoji: '🐯' },
        { mot: 'Téléphone', emoji: '📞' }
    ],
    'U': [
        { mot: 'Unicorne', emoji: '🦄' },
        { mot: 'Univers', emoji: '🌌' },
        { mot: 'Usine', emoji: '🏭' },
        { mot: 'Ustensiles', emoji: '🍴' }
    ],
    'V': [
        { mot: 'Vélo', emoji: '🚲' },
        { mot: 'Vache', emoji: '🐄' },
        { mot: 'Voiture', emoji: '🚗' },
        { mot: 'Violon', emoji: '🎻' }
    ],
    'W': [
        { mot: 'Wagon', emoji: '🚃' },
        { mot: 'Wallaby', emoji: '🦘' },
        { mot: 'Wapiti', emoji: '🦌' },
        { mot: 'Web', emoji: '🕸️' }
    ],
    'X': [
        { mot: 'Xylophone', emoji: '🎹' },
        { mot: 'Xérus', emoji: '🐿️' },
        { mot: 'Rayons X', emoji: '🩻' },
        { mot: 'Xylocope', emoji: '🐝' }
    ],
    'Y': [
        { mot: 'Yaourt', emoji: '🍦' },
        { mot: 'Yoyo', emoji: '🪀' },
        { mot: 'Yacht', emoji: '🛥️' },
        { mot: 'Yoga', emoji: '🧘' }
    ],
    'Z': [
        { mot: 'Zèbre', emoji: '🦓' },
        { mot: 'Zéro', emoji: '0️⃣' },
        { mot: 'Zigzag', emoji: '📉' },
        { mot: 'Zoo', emoji: '🦁' }
    ]
};

let indexLettreActuelle = 0;
let indexMotActuel = 0;

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
    indexMotActuel = 0;
}

/**
 * Lancé par le gros bouton "JOUER"
 */
function demarrerAlphabet() {
    const ecran = document.getElementById('ecranDepartAlphabet');
    const zone = document.getElementById('zoneLettreMagique');

    if (ecran && zone) {
        ecran.style.display = 'none';
        zone.style.display = 'flex';
        indexLettreActuelle = 0;
        indexMotActuel = 0;
        afficherLettre();
    }
}

/**
 * Gère l'affichage et la voix pour la lettre en cours
 */
function afficherLettre() {
    const alphabet = Object.keys(dictionnaireAlphabet);
    const lettre = alphabet[indexLettreActuelle];
    const data = dictionnaireAlphabet[lettre][indexMotActuel];

    const bouton = document.getElementById('grandeLettre');
    const emojiExemple = document.getElementById('emojiExemple');
    const texteMot = document.getElementById('motExemple');

    if (bouton && texteMot && emojiExemple) {
        bouton.innerText = lettre;
        texteMot.innerText = data.mot;
        emojiExemple.innerText = data.emoji;

        emojiExemple.classList.remove('bounce-animation');
        void emojiExemple.offsetWidth;
        emojiExemple.classList.add('bounce-animation');

        const teinte = (indexLettreActuelle * (360 / 26));
        const couleurBouton = `hsl(${teinte}, 70%, 60%)`;
        bouton.style.background = `linear-gradient(135deg, ${couleurBouton}, hsl(${teinte}, 80%, 40%))`;
        bouton.style.setProperty('--couleur-scintillement', couleurBouton);

        parler(`${lettre} comme ${data.mot}`);

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
    indexMotActuel = 0;

    if (indexLettreActuelle >= alphabet.length) {
        indexLettreActuelle = 0;
        parler("Bravo championne ! On recommence au début !");
    }
    afficherLettre();
}

function lettrePrecedente() {
    const alphabet = Object.keys(dictionnaireAlphabet);
    indexLettreActuelle--;
    indexMotActuel = 0;

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

    const alphabet = Object.keys(dictionnaireAlphabet);
    const lettreEnCours = alphabet[indexLettreActuelle];
    const dataArray = dictionnaireAlphabet[lettreEnCours];

    // On passe au mot suivant
    indexMotActuel = (indexMotActuel + 1) % dataArray.length;

    afficherLettre();
}
