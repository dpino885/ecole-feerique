// ==========================================================================
// 1. CONFIGURATION DE LA VOIX ET DES ÉTOILES
// ==========================================================================
function parler(message) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(message);
    msg.lang = 'fr-CA'; // Force l'accent québécois
    msg.pitch = 1.2;    // Voix de fée un peu plus haute
    window.speechSynthesis.speak(msg);
}

const canvas = document.getElementById('canvasParticules');
const ctx = canvas ? canvas.getContext('2d') : null;
let particules = [];

function redimensionner() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionner);
redimensionner();

class Particule {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.taille = Math.random() * 5 + 2;
        this.vitesseX = Math.random() * 3 - 1.5;
        this.vitesseY = Math.random() * 3 - 1.5;
        this.couleur = `hsl(${Math.random() * 60 + 280}, 100%, 70%)`; 
        this.vie = 1; 
    }
    update() {
        this.x += this.vitesseX;
        this.y += this.vitesseY;
        this.vie -= 0.02; 
    }
    dessiner() {
        if (!ctx) return;
        ctx.fillStyle = this.couleur;
        ctx.globalAlpha = this.vie;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.taille, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gererParticules() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particules.length; i++) {
        particules[i].update();
        particules[i].dessiner();
        if (particules[i].vie <= 0) {
            particules.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(gererParticules);
}
if (ctx && canvas) {
    gererParticules();
}

function estPlancheDessinOuverte() {
    return ['moduleDessin', 'moduleTracerLettres', 'moduleTracerChiffres'].some((id) => {
        const el = document.getElementById(id);
        return el && el.style.display !== 'none';
    });
}

function creerTrainee(e) {
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;
    for (let i = 0; i < 3; i++) {
        let p = new Particule(x, y);
        if (estPlancheDessinOuverte()) {
            p.couleur = couleurActuelle;
        }
        particules.push(p);
    }
}
window.addEventListener('mousemove', creerTrainee);
window.addEventListener('touchmove', creerTrainee);

// ==========================================================================
// 2. NAVIGATION ET PLEIN ÉCRAN
// ==========================================================================
let timerPleinEcran;
let debutPression;
const DUREE_LONG_PRESS = 3000;

function gererPressionPleinEcran(e) {
    e.preventDefault();
    const estPleinEcran = !!document.fullscreenElement;

    if (!estPleinEcran) {
        // Entrée immédiate en plein écran
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        // Sortie avec délai de 3 secondes
        debutPression = Date.now();
        const remplissage = document.getElementById('remplissagePleinEcran');

        timerPleinEcran = setInterval(() => {
            const tempsEcoule = Date.now() - debutPression;
            const pourcentage = Math.min((tempsEcoule / DUREE_LONG_PRESS) * 100, 100);

            if (remplissage) remplissage.style.height = pourcentage + '%';

            if (tempsEcoule >= DUREE_LONG_PRESS) {
                clearInterval(timerPleinEcran);
                document.exitFullscreen();
                if (remplissage) remplissage.style.height = '0%';
            }
        }, 50);
    }
}

function annulerPressionPleinEcran() {
    clearInterval(timerPleinEcran);
    const remplissage = document.getElementById('remplissagePleinEcran');
    if (remplissage) remplissage.style.height = '0%';
}

const btnPleinEcran = document.getElementById('btnPleinEcran');
if (btnPleinEcran) {
    btnPleinEcran.addEventListener('mousedown', gererPressionPleinEcran);
    btnPleinEcran.addEventListener('touchstart', gererPressionPleinEcran, { passive: false });

    window.addEventListener('mouseup', annulerPressionPleinEcran);
    window.addEventListener('touchend', annulerPressionPleinEcran);
}

const IDS_MODULES_JEU = [
    'moduleChiffres',
    'moduleAlphabet',
    'moduleFormes',
    'moduleDessin',
    'moduleTracerLettres',
    'moduleTracerChiffres',
    'moduleHistoire',
    'moduleMemory',
    'modulePiano'
];

function ouvrirModule(type, options) {
    options = options || {};
    const menu = document.getElementById('menuPrincipal');
    const btnRetour = document.getElementById('btnRetourGlobal');
    if (menu) menu.style.display = 'none';
    if (btnRetour) btnRetour.style.display = 'flex';

    IDS_MODULES_JEU.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (type === 'chiffres') {
        const el = document.getElementById('moduleChiffres');
        if (el) el.style.display = 'block';
        parler("Trouve les fées cachées et compte avec moi !");
        initialiserJeuFées();
    } else if (type === 'alphabet') {
        const el = document.getElementById('moduleAlphabet');
        if (el) el.style.display = 'flex';
        genererAlphabet();
        parler("L'alphabet des fées !");
    } else if (type === 'formes') {
        const el = document.getElementById('moduleFormes');
        if (el) el.style.display = 'flex';
        parler("Le jardin des formes !");
        ouvrirModuleFormes();
    } else if (type === 'dessin') {
        bindDessinSurface(SURFACE_LIBRE);
        const el = document.getElementById('moduleDessin');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        typeActuel = 'libre';
        effacerDessin(false);
        initialiserDessin();
        parler("Dessine avec tes doigts magiques !");
    } else if (type === 'tracerLettres') {
        bindDessinSurface(SURFACE_LETTRES);
        const el = document.getElementById('moduleTracerLettres');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        typeActuel = 'lettre';
        const lettre = options.lettre;
        if (lettre && modelesLettres.indexOf(lettre) !== -1) {
            indexModeleActuel = modelesLettres.indexOf(lettre);
        } else {
            indexModeleActuel = 0;
        }
        initialiserDessin();
        effacerDessin(false);
        afficherNouveauModele();
    } else if (type === 'tracerChiffres') {
        bindDessinSurface(SURFACE_CHIFFRES);
        const el = document.getElementById('moduleTracerChiffres');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        typeActuel = 'chiffre';
        indexModeleActuel = 0;
        initialiserDessin();
        effacerDessin(false);
        afficherNouveauModele();
    } else if (type === 'histoire') {
        const el = document.getElementById('moduleHistoire');
        if (el) el.style.display = 'flex';
        genererSelectionHistoires();
    } else if (type === 'memory') {
        const el = document.getElementById('moduleMemory');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        initialiserMemory();
    } else if (type === 'piano') {
        const el = document.getElementById('modulePiano');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        initialiserPiano();
    }
}

function retourMenu() {
    const btnRetour = document.getElementById('btnRetourGlobal');
    if (btnRetour) btnRetour.style.display = 'none';
    IDS_MODULES_JEU.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const menu = document.getElementById('menuPrincipal');
    if (menu) menu.style.display = 'flex';
}

// ==========================================================================
// 3. JEU DES FÉES (CHIFFRES)
// ==========================================================================
let scoreFées = 0;
function initialiserJeuFées() {
    scoreFées = 0;
    mettreAJourCompteur();
    const arene = document.getElementById('areneFées');
    if(arene) {
        arene.innerHTML = "";
        setTimeout(apparaitreFee, 1000);
    }
}

function apparaitreFee() {
    const arene = document.getElementById('areneFées');
    if(!arene || document.getElementById('moduleChiffres').style.display === 'none') return;

    const fee = document.createElement('div');
    fee.className = 'fee-cliquable';
    fee.innerHTML = "🧚‍♀️";

    const margeH = window.innerWidth * 0.20;
    const margeV = window.innerHeight * 0.20;
    const x = margeH + Math.random() * (window.innerWidth - (margeH * 2) - 100);
    const y = margeV + Math.random() * (window.innerHeight - (margeV * 2) - 100);
    
    fee.style.left = `${x}px`;
    fee.style.top = `${y}px`;

    fee.onclick = function(e) {
        e.stopPropagation();
        scoreFées++;
        parler(scoreFées.toString()); 
        for (let i = 0; i < 20; i++) {
            const p = new Particule(x + 75, y + 75);
            p.couleur = "#ffd700"; 
            particules.push(p);
        }
        fee.remove();
        mettreAJourCompteur();
        setTimeout(apparaitreFee, 800);
    };
    arene.appendChild(fee);
}

function mettreAJourCompteur() {
    const texte = document.getElementById('compteurFées');
    if(texte) texte.innerText = `Fées trouvées : ${scoreFées}`;
}

// ==========================================================================
// 4. ALPHABET SÉQUENTIEL MAGIQUE
// ==========================================================================
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

// ==========================================================================
// 5. LOGIQUE DES FORMES
// ==========================================================================

// --- LOGIQUE CHERCHE ET TROUVE (FORMES) ---
const listeFormes = [
    { nom: 'Carré', symbole: '■', couleur: '#FF5722', genre: 'le' },
    { nom: 'Cercle', symbole: '●', couleur: '#2196F3', genre: 'le' },
    { nom: 'Triangle', symbole: '▲', couleur: '#4CAF50', genre: 'le' },
    { nom: 'Étoile', symbole: '★', couleur: '#FFEB3B', genre: "l'" },
    { nom: 'Cœur', symbole: '❤', couleur: '#E91E63', genre: 'le' },
    { nom: 'Losange', symbole: '◆', couleur: '#9C27B0', genre: 'le' },
    { nom: 'Rectangle', symbole: '▮', couleur: '#795548', genre: 'le' },
    { nom: 'Hexagone', symbole: '⬢', couleur: '#00BCD4', genre: "l'" },
    { nom: 'Nuage', symbole: '☁', couleur: '#B0BEC5', genre: 'le' },
    // --- NOUVEAUX AJOUTS ---
    { nom: 'Lune', symbole: '🌙', couleur: '#FFD700', genre: 'la' },
    { nom: 'Soleil', symbole: '☀️', couleur: '#FFA500', genre: 'le' },
    { nom: 'Goutte', symbole: '💧', couleur: '#00FFFF', genre: 'la' },
    { nom: 'Éclair', symbole: '⚡', couleur: '#FFFF00', genre: "l'" },
    { nom: 'Trèfle', symbole: '☘️', couleur: '#2E7D32', genre: 'le' },
    { nom: 'Diamant', symbole: '💎', couleur: '#81D4FA', genre: 'le' }
];

let formeCible = null;

// Cette fonction fait le pont entre le menu et le jeu
function ouvrirModuleFormes() {
    console.log("Démarrage du jeu des formes...");
    // On s'assure que la zone est vide avant de commencer
    const zone = document.getElementById('zoneOptionsFormes');
    if (zone) {
        zone.innerHTML = '';
        nouveauDefiForme(); // On lance le tout premier défi
    }
}
function nouveauDefiForme() {
    // 1. Choisir la forme à trouver
    formeCible = listeFormes[Math.floor(Math.random() * listeFormes.length)];
    
    // LOGIQUE DE GRAMMAIRE CORRIGÉE
    const article = formeCible.genre;
    const espace = article.endsWith("'") ? "" : " ";
    const phraseMagique = `Peux-tu trouver ${article}${espace}${formeCible.nom.toLowerCase()} ?`;

    document.getElementById('consigneForme').innerText = phraseMagique;
    parler(phraseMagique);

    // 2. Mélanger les options - On en garde 3 pour que ça respire sur la tablette
    let options = [...listeFormes].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Si la cible n'est pas dans les 3, on remplace la première par la cible
    if (!options.find(o => o.nom === formeCible.nom)) {
        options[0] = formeCible;
    }
    // On remélange pour que la cible ne soit pas toujours à gauche
    options.sort(() => 0.5 - Math.random()); 

    // 3. Afficher les boutons
    const zone = document.getElementById('zoneOptionsFormes');
    zone.innerHTML = ''; 
    
    options.forEach(forme => {
        const btn = document.createElement('button');
        btn.className = 'forme-option';
        
        // C'est ici que la magie opère pour le CSS (data-forme="Lune")
        btn.setAttribute('data-forme', forme.nom);
        
        // On utilise un span pour appliquer les effets de texte du CSS
        btn.innerHTML = `<span>${forme.symbole}</span>`;
        btn.style.color = forme.couleur;
        
        btn.onclick = () => verifierForme(forme.nom);
        zone.appendChild(btn);
    });
}

let victoiresFormes = 0; // On commence à zéro

function verifierForme(nomClique) {
    const article = formeCible.genre;
    const espace = article.includes("'") ? "" : " ";
    const nomComplet = `${article}${espace}${formeCible.nom.toLowerCase()}`;

    if (nomClique === formeCible.nom) {
        victoiresFormes++; // +1 point !
        
        parler(`Bravo ! C'est bien ${nomComplet} !`);
        
        // Explosion d'étoiles
        for (let i = 0; i < 40; i++) {
            const p = new Particule(window.innerWidth / 2, window.innerHeight / 2);
            p.couleur = formeCible.couleur;
            particules.push(p);
        }

        // --- SYSTÈME DE RÉCOMPENSE ---
        if (victoiresFormes >= 5) {
            victoiresFormes = 0; // On remet à zéro pour la prochaine fois
            setTimeout(apparaitreFeeGeante, 1500); 
        } else {
            setTimeout(nouveauDefiForme, 4000);
        }

    } else {
        parler(`Oups ! Cherche encore ${nomComplet} !`);
    }
}

function apparaitreFeeGeante() {
    parler("Félicitations ! Tu es une championne des formes !");
    
    // On crée une fée géante qui vole au milieu
    const fee = document.createElement('div');
    fee.innerHTML = "🧚‍♀️";
    fee.style.position = 'fixed';
    fee.style.left = '50%';
    fee.style.top = '50%';
    fee.style.transform = 'translate(-50%, -50%) scale(0)';
    fee.style.fontSize = '250px';
    fee.style.zIndex = '10000';
    fee.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    fee.style.pointerEvents = 'none';
    
    document.body.appendChild(fee);

    // Animation d'apparition (Pop!)
    setTimeout(() => {
        fee.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }, 100);

    // Elle s'en va après 3 secondes et relance le jeu
    setTimeout(() => {
        fee.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            fee.remove();
            nouveauDefiForme();
        }, 1000);
    }, 3500);
}

// ==========================================================================
// 6. LOGIQUE DU DESSIN (AVEC POINTS DE PASSAGE)
// ==========================================================================
const SURFACE_LIBRE = {
    moduleId: 'moduleDessin',
    canvasId: 'canvasDessin',
    conteneurId: 'conteneurCanevas'
};
const SURFACE_LETTRES = {
    moduleId: 'moduleTracerLettres',
    canvasId: 'canvasTracerLettres',
    conteneurId: 'conteneurTracerLettres'
};
const SURFACE_CHIFFRES = {
    moduleId: 'moduleTracerChiffres',
    canvasId: 'canvasTracerChiffres',
    conteneurId: 'conteneurTracerChiffres'
};

const configDessin = {
    moduleEl: null,
    canvas: null,
    ctx: null,
    conteneur: null
};

function bindDessinSurface(spec) {
    configDessin.moduleEl = document.getElementById(spec.moduleId);
    configDessin.canvas = document.getElementById(spec.canvasId);
    configDessin.ctx = configDessin.canvas
        ? configDessin.canvas.getContext('2d', { willReadFrequently: true })
        : null;
    configDessin.conteneur = document.getElementById(spec.conteneurId);
}

let dernierCanvasDessin = null;

function syncSurfaceDepuisCanvas(canvas) {
    if (!canvas || !canvas.id) return;
    const map = {
        canvasDessin: SURFACE_LIBRE,
        canvasTracerLettres: SURFACE_LETTRES,
        canvasTracerChiffres: SURFACE_CHIFFRES
    };
    const spec = map[canvas.id];
    if (spec) bindDessinSurface(spec);
}

bindDessinSurface(SURFACE_LIBRE);

let enTrainDeDessiner = false;
let couleurActuelle = 'yellow';
let estEnTrainDeCelebrer = false;

const modelesLettres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const modelesChiffres = "0123456789".split("");

// Seuil de complétion uniforme (80% des zones de passage doivent être touchées)
const SEUIL_REUSSITE = 0.80;

let indexModeleActuel = 0;
let typeActuel = 'libre';
let caractereActuel = '';

// --- NOUVEAU SYSTÈME DE TRACÉ PAR MASQUE ET SECTEURS ---
const canvasMasque = document.createElement('canvas');
const ctxMasque = canvasMasque.getContext('2d', { willReadFrequently: true });
let secteursActifs = []; // Secteurs qui contiennent une partie de la lettre
let secteursTouches = new Set(); // Secteurs déjà parcourus par l'enfant
const NB_SECTEURS = 15; // Précision de la grille (15x15)

function initialiserDessin() {
    const { canvas, ctx, conteneur, moduleEl } = configDessin;
    if (!canvas || !ctx || !conteneur) return;
    canvas.width = conteneur.clientWidth;
    canvas.height = conteneur.clientHeight;

    // Synchroniser le masque
    canvasMasque.width = canvas.width;
    canvasMasque.height = canvas.height;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 25; // Tracé un peu plus épais pour faciliter le remplissage

    if (moduleEl) moduleEl.style.zIndex = '500';

    if (typeActuel !== 'libre') {
        dessinerFantome();
    }
}

function changerCouleur(c) { 
    couleurActuelle = c; 
    parler("Couleur magique !");
}

function effacerDessin(changerDeLettre = true) {
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    secteursTouches.clear();

    if (typeActuel !== 'libre' && changerDeLettre) {
        if (typeActuel === 'lettre') {
            indexModeleActuel = (indexModeleActuel + 1) % modelesLettres.length;
        } else {
            indexModeleActuel = (indexModeleActuel + 1) % modelesChiffres.length;
        }
        afficherNouveauModele();
    } else if (typeActuel !== 'libre') {
        dessinerFantome();
    }
}

function afficherNouveauModele() {
    secteursTouches.clear();
    let caractere =
        typeActuel === 'lettre'
            ? modelesLettres[indexModeleActuel]
            : modelesChiffres[indexModeleActuel];

    caractereActuel = caractere;

    genererMasqueEtSecteurs(caractere);
    dessinerFantome();

    let texte =
        typeActuel === 'lettre'
            ? 'la lettre ' + caractere.toLowerCase()
            : 'le chiffre ' + caractere;
    parler('Essaie de tracer ' + texte);
}

function dessinerFantome() {
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx || typeActuel === 'libre') return;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "500px 'Arial Black', sans-serif";

    const xMid = canvas.width / 2;
    const yMid = canvas.height / 2;

    ctx.fillText(caractereActuel, xMid, yMid);
    ctx.restore();
}

function genererMasqueEtSecteurs(caractere) {
    const { canvas } = configDessin;
    if (!canvas || !ctxMasque) return;

    canvasMasque.width = canvas.width;
    canvasMasque.height = canvas.height;

    const xMid = canvasMasque.width / 2;
    const yMid = canvasMasque.height / 2;

    // --- PHASE 1 : Définition des zones de passage (SKELETON) ---
    ctxMasque.save();
    ctxMasque.fillStyle = "black";
    ctxMasque.fillRect(0, 0, canvasMasque.width, canvasMasque.height);
    ctxMasque.fillStyle = "white";
    ctxMasque.textAlign = "center";
    ctxMasque.textBaseline = "middle";

    // On utilise une police plus fine pour définir les "zones de passage" essentielles
    // Cela évite de demander de remplir toute l'épaisseur d'une police "Black"
    ctxMasque.font = "500px Arial, sans-serif";
    ctxMasque.fillText(caractere, xMid, yMid);

    secteursActifs = [];
    const stepX = canvas.width / NB_SECTEURS;
    const stepY = canvas.height / NB_SECTEURS;

    for (let iy = 0; iy < NB_SECTEURS; iy++) {
        for (let ix = 0; ix < NB_SECTEURS; ix++) {
            const x = ix * stepX;
            const y = iy * stepY;
            // On vérifie 4 points dans le secteur pour voir s'il contient une partie de la lettre
            let estActif = false;
            const pointsTest = [0.25, 0.75];
            for (let py of pointsTest) {
                for (let px of pointsTest) {
                    const data = ctxMasque.getImageData(Math.floor(x + stepX*px), Math.floor(y + stepY*py), 1, 1).data;
                    if (data[0] > 100) {
                        estActif = true;
                        break;
                    }
                }
                if (estActif) break;
            }
            if (estActif) {
                secteursActifs.push(iy * NB_SECTEURS + ix);
            }
        }
    }

    // --- PHASE 2 : Masque de collision pour le feedback ROUGE ---
    // On repasse sur la police épaisse pour le feedback visuel en temps réel
    ctxMasque.fillStyle = "black";
    ctxMasque.fillRect(0, 0, canvasMasque.width, canvasMasque.height);
    ctxMasque.fillStyle = "white";
    ctxMasque.strokeStyle = "white";
    ctxMasque.lineWidth = 40;
    ctxMasque.font = "500px 'Arial Black', sans-serif";
    ctxMasque.strokeText(caractere, xMid, yMid);
    ctxMasque.fillText(caractere, xMid, yMid);
    ctxMasque.restore();
}

// --- GESTION DU TRACÉ ---
function demarrerDessin(e) {
    if (estEnTrainDeCelebrer) return;
    syncSurfaceDepuisCanvas(e.currentTarget);
    dernierCanvasDessin = e.currentTarget;
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    enTrainDeDessiner = true;
    dessiner(e);
}

function dessiner(e) {
    if (!enTrainDeDessiner) return;
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (typeActuel !== 'libre') {
        const data = ctxMasque.getImageData(x, y, 1, 1).data;
        const estDansLaLettre = data[0] > 128;

        if (estDansLaLettre) {
            ctx.strokeStyle = couleurActuelle;

            // On valide les secteurs dans un petit rayon autour du point (Zones de Passage)
            // Cela permet de valider le passage sans forcer à "remplir" toute l'épaisseur.
            const rayonValidation = 15;
            const pas = 10;
            for (let dx = -rayonValidation; dx <= rayonValidation; dx += pas) {
                for (let dy = -rayonValidation; dy <= rayonValidation; dy += pas) {
                    const ix = Math.floor((x + dx) / (canvas.width / NB_SECTEURS));
                    const iy = Math.floor((y + dy) / (canvas.height / NB_SECTEURS));
                    const idSecteur = iy * NB_SECTEURS + ix;
                    if (secteursActifs.includes(idSecteur)) {
                        secteursTouches.add(idSecteur);
                    }
                }
            }
        } else {
            ctx.strokeStyle = "red";
        }
    } else {
        ctx.strokeStyle = couleurActuelle;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < 2; i++) {
        let p = new Particule(x + rect.left, y + rect.top);
        p.couleur = ctx.strokeStyle === "red" ? "red" : couleurActuelle;
        particules.push(p);
    }
}

let timerVerification;
function arreterDessin() {
    if (dernierCanvasDessin) syncSurfaceDepuisCanvas(dernierCanvasDessin);
    const { ctx } = configDessin;
    if (!ctx) return;
    if (enTrainDeDessiner && typeActuel !== 'libre') {
        clearTimeout(timerVerification);
        timerVerification = setTimeout(verifierTracerFini, 1200);
    }
    enTrainDeDessiner = false;
    ctx.beginPath();
}

function verifierTracerFini() {
    if (estEnTrainDeCelebrer || typeActuel === 'libre') return;

    // Utilisation du seuil uniforme sur les zones de passage (80%)
    const ratioRemplissage = secteursTouches.size / secteursActifs.length;

    if (ratioRemplissage >= SEUIL_REUSSITE) {
        celebrerFinTracer();
    }
}

function celebrerFinTracer() {
    if (estEnTrainDeCelebrer) return;
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    estEnTrainDeCelebrer = true;
    
    parler("C'est magnifique ! Bravo !");

    // Explosion de confettis
    for (let i = 0; i < 100; i++) {
        const p = new Particule(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        p.couleur = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particules.push(p);
    }

    setTimeout(() => {
        effacerDessin(true); 
        estEnTrainDeCelebrer = false;
    }, 5000); 
}

// ==========================================================================
// 7. LOGIQUE DU MODULE HISTOIRE
// ==========================================================================
const baseHistoires = [
    {
        titre: "L'Aventure 1",
        pages: [
            "images/histoire1.1.png",
            "images/histoire1.2.png",
            "images/histoire1.3.png",
            "images/histoire1.4.png",
            "images/histoire1.5.png",
            "images/histoire1.6.png"
        ]
    },
    { titre: "Histoire 2", pages: [] },
    { titre: "Histoire 3", pages: [] },
    { titre: "Histoire 4", pages: [] },
    { titre: "Histoire 5", pages: [] },
    { titre: "Histoire 6", pages: [] }
];

let histoireActuelle = null;
let pageActuelle = 0;

function genererSelectionHistoires() {
    const grille = document.getElementById('grilleLivres');
    if (!grille) return;
    grille.innerHTML = "";

    baseHistoires.forEach((histoire, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-livre';
        btn.innerHTML = `📖`; // On peut mettre l'index ou un titre plus tard
        btn.onclick = () => ouvrirHistoire(index);
        grille.appendChild(btn);
    });

    document.getElementById('selectionHistoires').style.display = 'flex';
    document.getElementById('lecteurHistoire').style.display = 'none';
}

function ouvrirHistoire(index) {
    histoireActuelle = baseHistoires[index];
    if (!histoireActuelle || histoireActuelle.pages.length === 0) {
        parler("Cette histoire n'est pas encore prête !");
        return;
    }

    pageActuelle = 0;
    document.getElementById('selectionHistoires').style.display = 'none';
    document.getElementById('lecteurHistoire').style.display = 'flex';
    document.getElementById('btnRetourGlobal').style.display = 'none';

    afficherPage();
}

function afficherPage() {
    const img = document.getElementById('imageHistoire');
    const fin = document.getElementById('ecranFinHistoire');
    const btnPrecedent = document.getElementById('btnPrecedentHistoire');
    const btnSuivant = document.getElementById('btnSuivantHistoire');

    if (pageActuelle < histoireActuelle.pages.length) {
        img.src = histoireActuelle.pages[pageActuelle];
        img.style.display = 'block';
        fin.style.display = 'none';
    } else {
        img.style.display = 'none';
        fin.style.display = 'flex';
    }

    btnPrecedent.disabled = (pageActuelle === 0);
    // On permet d'aller une page au-delà de la dernière image pour voir l'écran "FIN"
    btnSuivant.disabled = (pageActuelle > histoireActuelle.pages.length - 1);
}

function pageSuivante() {
    if (pageActuelle <= histoireActuelle.pages.length - 1) {
        pageActuelle++;
        afficherPage();
    }
}

function pagePrecedente() {
    if (pageActuelle > 0) {
        pageActuelle--;
        afficherPage();
    }
}

function quitterHistoire() {
    document.getElementById('lecteurHistoire').style.display = 'none';
    document.getElementById('selectionHistoires').style.display = 'flex';
    document.getElementById('btnRetourGlobal').style.display = 'flex';
}

function brancherEvenementsCanvas(canvas) {
    if (!canvas) return;
    canvas.addEventListener('mousedown', demarrerDessin);
    canvas.addEventListener('mousemove', dessiner);
    canvas.addEventListener(
        'touchstart',
        (e) => {
            e.preventDefault();
            demarrerDessin(e);
        },
        { passive: false }
    );
    canvas.addEventListener(
        'touchmove',
        (e) => {
            e.preventDefault();
            dessiner(e);
        },
        { passive: false }
    );
}

// ==========================================================================
// 8. LOGIQUE DU MODULE MEMORY
// ==========================================================================

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

let difficulteActuelleMemory = 'facile';
let cartesRetournees = [];
let pairesTrouvees = 0;
let peutJouerMemory = true;

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

brancherEvenementsCanvas(document.getElementById('canvasDessin'));
brancherEvenementsCanvas(document.getElementById('canvasTracerLettres'));
brancherEvenementsCanvas(document.getElementById('canvasTracerChiffres'));

window.addEventListener('mouseup', arreterDessin);
window.addEventListener('touchend', arreterDessin);

// ==========================================================================
// 9. LOGIQUE DU MODULE PIANO
// ==========================================================================

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

let audioCtx = null;
let comptineActuelle = null;
let indexNoteComptine = 0;

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