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
function basculerPleinEcran() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
}

const IDS_MODULES_JEU = [
    'moduleChiffres',
    'moduleAlphabet',
    'moduleFormes',
    'moduleDessin',
    'moduleTracerLettres',
    'moduleTracerChiffres',
    'moduleHistoire',
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
        if (configDessin.fantome) configDessin.fantome.innerText = '';
        effacerDessin(false);
        initialiserDessin();
        parler("Dessine avec tes doigts magiques !");
    } else if (type === 'tracerLettres') {
        bindDessinSurface(SURFACE_LETTRES);
        const el = document.getElementById('moduleTracerLettres');
        if (el) el.style.display = 'flex';
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
        typeActuel = 'chiffre';
        indexModeleActuel = 0;
        initialiserDessin();
        effacerDessin(false);
        afficherNouveauModele();
    } else if (type === 'histoire') {
        const el = document.getElementById('moduleHistoire');
        if (el) el.style.display = 'flex';
        genererSelectionHistoires();
    } else if (type === 'piano') {
        const el = document.getElementById('modulePiano');
        if (el) el.style.display = 'flex';
        initialiserPiano();
        parler("Le piano aux étoiles ! Joue de la musique !");
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
    conteneurId: 'conteneurCanevas',
    fantomeId: 'modeleFantome'
};
const SURFACE_LETTRES = {
    moduleId: 'moduleTracerLettres',
    canvasId: 'canvasTracerLettres',
    conteneurId: 'conteneurTracerLettres',
    fantomeId: 'modeleFantomeLettres'
};
const SURFACE_CHIFFRES = {
    moduleId: 'moduleTracerChiffres',
    canvasId: 'canvasTracerChiffres',
    conteneurId: 'conteneurTracerChiffres',
    fantomeId: 'modeleFantomeChiffres'
};

const configDessin = {
    moduleEl: null,
    canvas: null,
    ctx: null,
    conteneur: null,
    fantome: null
};

function bindDessinSurface(spec) {
    configDessin.moduleEl = document.getElementById(spec.moduleId);
    configDessin.canvas = document.getElementById(spec.canvasId);
    configDessin.ctx = configDessin.canvas
        ? configDessin.canvas.getContext('2d', { willReadFrequently: true })
        : null;
    configDessin.conteneur = document.getElementById(spec.conteneurId);
    configDessin.fantome = document.getElementById(spec.fantomeId);
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
let indexModeleActuel = 0;
let typeActuel = 'libre';

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
    }
}

function afficherNouveauModele() {
    const afficheur = configDessin.fantome;
    if (!afficheur) return;

    secteursTouches.clear();
    let caractere =
        typeActuel === 'lettre'
            ? modelesLettres[indexModeleActuel]
            : modelesChiffres[indexModeleActuel];
    afficheur.innerText = caractere;

    genererMasqueEtSecteurs(caractere);

    let texte =
        typeActuel === 'lettre'
            ? 'la lettre ' + caractere.toLowerCase()
            : 'le chiffre ' + caractere;
    parler('Essaie de tracer ' + texte);
}

function genererMasqueEtSecteurs(caractere) {
    const { canvas } = configDessin;
    if (!canvas || !ctxMasque) return;

    // S'assurer que le masque a la même taille que le canvas principal
    canvasMasque.width = canvas.width;
    canvasMasque.height = canvas.height;

    // 1. Préparer le masque (on dessine la lettre en blanc sur fond noir)
    ctxMasque.fillStyle = "black";
    ctxMasque.fillRect(0, 0, canvasMasque.width, canvasMasque.height);

    ctxMasque.fillStyle = "white";
    ctxMasque.strokeStyle = "white";
    ctxMasque.lineWidth = 50; // Contour pour être permissif sur le tracé (environ 25px de chaque côté)
    ctxMasque.lineJoin = "round";
    ctxMasque.textAlign = "center";
    ctxMasque.textBaseline = "middle";

    // On fait correspondre la police du fantôme CSS
    ctxMasque.font = "500px 'Arial Black', sans-serif";

    const xMid = canvasMasque.width / 2;
    const yMid = canvasMasque.height / 2;

    // On dessine le corps et le contour pour élargir la zone valide (plus facile pour l'enfant)
    ctxMasque.strokeText(caractere, xMid, yMid);
    ctxMasque.fillText(caractere, xMid, yMid);

    // 2. Analyser les secteurs actifs (grille invisible pour vérifier la complétion)
    secteursActifs = [];
    const stepX = canvas.width / NB_SECTEURS;
    const stepY = canvas.height / NB_SECTEURS;

    for (let iy = 0; iy < NB_SECTEURS; iy++) {
        for (let ix = 0; ix < NB_SECTEURS; ix++) {
            const x = ix * stepX;
            const y = iy * stepY;
            // On vérifie si le centre du secteur est dans la zone blanche du masque
            const data = ctxMasque.getImageData(Math.floor(x + stepX/2), Math.floor(y + stepY/2), 1, 1).data;
            if (data[0] > 100) {
                secteursActifs.push(iy * NB_SECTEURS + ix);
            }
        }
    }
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
            const ix = Math.floor(x / (canvas.width / NB_SECTEURS));
            const iy = Math.floor(y / (canvas.height / NB_SECTEURS));
            const idSecteur = iy * NB_SECTEURS + ix;
            if (secteursActifs.includes(idSecteur)) {
                secteursTouches.add(idSecteur);
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

    // Condition : Avoir parcouru au moins 85% des secteurs actifs de la lettre
    const ratioRemplissage = secteursTouches.size / secteursActifs.length;

    if (ratioRemplissage > 0.85) {
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

brancherEvenementsCanvas(document.getElementById('canvasDessin'));
brancherEvenementsCanvas(document.getElementById('canvasTracerLettres'));
brancherEvenementsCanvas(document.getElementById('canvasTracerChiffres'));

window.addEventListener('mouseup', arreterDessin);
window.addEventListener('touchend', arreterDessin);

// ==========================================================================
// 8. LOGIQUE DU MODULE PIANO
// ==========================================================================
const NOTES_FREQUENCES = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const COMPTINES = [
    {
        titre: "Ah! vous dirai-je, maman",
        notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"]
    },
    {
        titre: "Frère Jacques",
        notes: ["C4", "D4", "E4", "C4", "C4", "D4", "E4", "C4", "E4", "F4", "G4", "E4", "F4", "G4"]
    },
    {
        titre: "Au clair de la lune",
        notes: ["C4", "C4", "C4", "D4", "E4", "D4", "C4", "E4", "D4", "D4", "C4"]
    },
    {
        titre: "Une souris verte",
        notes: ["G4", "E4", "E4", "G4", "E4", "E4", "G4", "A4", "G4", "F4", "E4", "D4"]
    },
    {
        titre: "J'ai du bon tabac",
        notes: ["C4", "D4", "E4", "C4", "D4", "D4", "D4", "C4", "D4", "E4", "C4", "D4", "D4", "C4"]
    },
    {
        titre: "Dodo, l'enfant do",
        notes: ["E4", "D4", "C4", "E4", "D4", "C4", "E4", "G4", "F4", "E4", "D4", "C4"]
    },
    {
        titre: "À la volette",
        notes: ["C4", "D4", "E4", "F4", "G4", "G4", "A4", "G4", "F4", "E4", "D4", "C4"]
    },
    {
        titre: "Fais dodo",
        notes: ["G4", "E4", "G4", "E4", "D4", "E4", "F4", "D4", "F4", "D4", "C4", "E4", "G4"]
    },
    {
        titre: "Bateau sur l'eau",
        notes: ["C4", "E4", "G4", "C5", "G4", "E4", "C4", "G4", "C4"]
    },
    {
        titre: "Pomme de reinette",
        notes: ["G4", "G4", "E4", "F4", "F4", "D4", "E4", "E4", "C4", "D4", "D4", "G4", "C4"]
    }
];

let audioCtx = null;
let comptineEnCours = null;
let indexNoteAttendue = 0;

function initialiserPiano() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    comptineEnCours = null;
    indexNoteAttendue = 0;

    document.getElementById('selectionComptines').style.display = 'flex';
    document.getElementById('clavierPiano').style.display = 'flex';
    document.getElementById('btnQuitterComptine').style.display = 'none';

    genererSelectionComptines();
    brancherEvenementsPiano();
}

function genererSelectionComptines() {
    const grille = document.getElementById('grilleComptines');
    if (!grille) return;
    grille.innerHTML = "";

    COMPTINES.forEach((c, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-comptine';
        btn.innerText = c.titre;
        btn.onclick = () => demarrerComptine(index);
        grille.appendChild(btn);
    });
}

function demarrerComptine(index) {
    comptineEnCours = COMPTINES[index];
    indexNoteAttendue = 0;
    document.getElementById('selectionComptines').style.display = 'none';
    document.getElementById('btnQuitterComptine').style.display = 'block';

    parler("C'est parti ! Suis l'étoile !");
    montrerNoteSuivante();
}

function quitterComptine() {
    comptineEnCours = null;
    indexNoteAttendue = 0;
    document.getElementById('selectionComptines').style.display = 'flex';
    document.getElementById('btnQuitterComptine').style.display = 'none';

    // Nettoyer les guides
    document.querySelectorAll('.touche').forEach(t => t.classList.remove('guide'));
}

function montrerNoteSuivante() {
    // Retirer le guide précédent
    document.querySelectorAll('.touche').forEach(t => t.classList.remove('guide'));

    if (comptineEnCours && indexNoteAttendue < comptineEnCours.notes.length) {
        const note = comptineEnCours.notes[indexNoteAttendue];
        const idTouche = "touche-" + note.replace("#", "s");
        const el = document.getElementById(idTouche);
        if (el) el.classList.add('guide');
    } else if (comptineEnCours) {
        // Fin de la comptine
        parler("Bravo ! Tu as joué toute la chanson !");
        celebrerFinTracer(); // Réutiliser la célébration existante
        quitterComptine();
    }
}

function jouerNote(note, estManuel = true) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const freq = NOTES_FREQUENCES[note];
    if (!freq) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle'; // Son plus doux que 'sine' ou 'square'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);

    // Feedback visuel (étoiles)
    const idTouche = "touche-" + note.replace("#", "s");
    const el = document.getElementById(idTouche);
    if (el) {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 200);

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Créer une étoile lumineuse DOM
        const etoile = document.createElement('div');
        etoile.className = 'etoile-piano';
        etoile.innerHTML = '⭐';
        etoile.style.left = centerX + 'px';
        etoile.style.top = centerY + 'px';
        document.body.appendChild(etoile);
        setTimeout(() => etoile.remove(), 1000);

        for (let i = 0; i < 5; i++) {
            const p = new Particule(centerX, centerY);
            p.couleur = "#ffd700";
            particules.push(p);
        }
    }

    // Si on est en mode comptine
    if (estManuel && comptineEnCours) {
        const noteAttendue = comptineEnCours.notes[indexNoteAttendue];
        if (note === noteAttendue) {
            indexNoteAttendue++;
            montrerNoteSuivante();
        }
    }
}

function brancherEvenementsPiano() {
    document.querySelectorAll('.touche').forEach(touche => {
        // Éviter les branchements multiples
        touche.onclick = null;
        touche.onclick = (e) => {
            const note = touche.getAttribute('data-note');
            jouerNote(note);
        };
    });
}