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
    return ['moduleDessin'].some((id) => {
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
    'moduleDessin'
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

    parler(lettreEnCours);
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
// 6. LOGIQUE DU DESSIN
// ==========================================================================
const SURFACE_LIBRE = {
    moduleId: 'moduleDessin',
    canvasId: 'canvasDessin',
    conteneurId: 'conteneurCanevas',
    fantomeId: 'modeleFantome'
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
        canvasDessin: SURFACE_LIBRE
    };
    const spec = map[canvas.id];
    if (spec) bindDessinSurface(spec);
}

bindDessinSurface(SURFACE_LIBRE);

let enTrainDeDessiner = false;
let couleurActuelle = 'yellow';
let estEnTrainDeCelebrer = false;

let typeActuel = 'libre';

function initialiserDessin() {
    const { canvas, ctx, conteneur, moduleEl } = configDessin;
    if (!canvas || !ctx || !conteneur) return;
    canvas.width = conteneur.clientWidth;
    canvas.height = conteneur.clientHeight;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 20;

    if (moduleEl) moduleEl.style.zIndex = '500';
}

function changerCouleur(c) { 
    couleurActuelle = c; 
    parler("Couleur magique !");
}

function effacerDessin() {
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    ctx.strokeStyle = couleurActuelle;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < 2; i++) {
        let p = new Particule(x + rect.left, y + rect.top);
        p.couleur = couleurActuelle;
        particules.push(p);
    }
}

function arreterDessin() {
    if (dernierCanvasDessin) syncSurfaceDepuisCanvas(dernierCanvasDessin);
    const { ctx } = configDessin;
    if (!ctx) return;
    enTrainDeDessiner = false;
    ctx.beginPath();
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

window.addEventListener('mouseup', arreterDessin);
window.addEventListener('touchend', arreterDessin);