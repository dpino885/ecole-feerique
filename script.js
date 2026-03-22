// ==========================================================================
// 1. CONFIGURATION DE LA VOIX ET DES ÉTOILES
// ==========================================================================
function parler(message) {
    window.speechSynthesis.cancel(); // Arrête la voix précédente pour ne pas bégayer
    const voix = new SpeechSynthesisUtterance(message);
    voix.lang = 'fr-FR';
    voix.pitch = 1.8; 
    voix.rate = 0.9;  
    window.speechSynthesis.speak(voix);
}

const canvas = document.getElementById('canvasParticules');
const ctx = canvas.getContext('2d');
let particules = [];

function redimensionner() {
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
        ctx.fillStyle = this.couleur;
        ctx.globalAlpha = this.vie;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.taille, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gererParticules() {
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
gererParticules();

function creerTrainee(e) {
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;
    for (let i = 0; i < 3; i++) {
        let p = new Particule(x, y);
        const moduleDessin = document.getElementById('moduleDessin');
        if (moduleDessin && moduleDessin.style.display === 'block') {
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

function ouvrirModule(type) {
    // On cache le menu et on montre le bouton retour
    document.getElementById('menuPrincipal').style.display = 'none';
    document.getElementById('btnRetourGlobal').style.display = 'flex';

    // On cache tous les modules
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    // Logique spécifique par module
    if(type === 'chiffres') {
        document.getElementById('moduleChiffres').style.display = 'block';
        parler("Trouve les fées cachées et compte avec moi !");
        initialiserJeuFées();
    } else if(type === 'alphabet') {
        document.getElementById('moduleAlphabet').style.display = 'block';
        genererAlphabet();
        parler("L'alphabet des fées !");
    } else if(type === 'formes') {
        document.getElementById('moduleFormes').style.display = 'block';
        parler("Le jardin des formes !");
    } else if(type === 'dessin') {
        document.getElementById('moduleDessin').style.display = 'block';
        // Le dessin a son propre bouton retour dans sa barre d'outils
        document.getElementById('btnRetourGlobal').style.display = 'none';
        initialiserDessin();
        parler("Dessine avec tes doigts magiques !");
    }
}

function retourMenu() {
    document.getElementById('btnRetourGlobal').style.display = 'none';
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    document.getElementById('menuPrincipal').style.display = 'flex';
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
const motsMagiques = {
    'A': 'Arc-en-ciel', 'B': 'Baguette', 'C': 'Château', 'D': 'Dragon',
    'E': 'Étoile', 'F': 'Fée', 'G': 'Gâteau', 'H': 'Hibou',
    'I': 'Île', 'J': 'Jardin', 'K': 'Koala', 'L': 'Lune',
    'M': 'Magie', 'N': 'Nuage', 'O': 'Oiseau', 'P': 'Papillon',
    'Q': 'Quiche', 'R': 'Reine', 'S': 'Soleil', 'T': 'Trésor',
    'U': 'Unique', 'V': 'Vaguette', 'W': 'Wagon', 'X': 'Xylophone',
    'Y': 'Yack', 'Z': 'Zèbre'
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
    const alphabet = Object.keys(motsMagiques);
    const lettre = alphabet[indexLettreActuelle];
    const mot = motsMagiques[lettre];
    
    const bouton = document.getElementById('grandeLettre');
    const texteMot = document.getElementById('motExemple');
    
    if (bouton && texteMot) {
        bouton.innerText = lettre;
        texteMot.innerText = mot;
        
        // Couleur dynamique (arc-en-ciel au fil de l'alphabet)
        const teinte = (indexLettreActuelle * (360 / 26));
        bouton.style.background = `linear-gradient(135deg, hsl(${teinte}, 70%, 60%), hsl(${teinte}, 80%, 40%))`;
        
        // La fée parle
        parler(`La lettre ${lettre.toLowerCase()}... comme ${mot} !`);
        
        // Explosion d'étoiles au centre
        for (let i = 0; i < 20; i++) {
            const p = new Particule(window.innerWidth / 2, window.innerHeight / 2);
            p.couleur = `hsl(${teinte}, 100%, 70%)`;
            particules.push(p);
        }
    }
}

function lettreSuivante() {
    const alphabet = Object.keys(motsMagiques);
    indexLettreActuelle++;
    
    if (indexLettreActuelle >= alphabet.length) {
        indexLettreActuelle = 0;
        parler("Bravo championne ! On recommence au début !");
    }
    afficherLettre();
}

function lettrePrecedente() {
    const alphabet = Object.keys(motsMagiques);
    indexLettreActuelle--;
    
    if (indexLettreActuelle < 0) {
        indexLettreActuelle = alphabet.length - 1;
    }
    afficherLettre();
}

// ==========================================================================
// 5. LOGIQUE DES FORMES
// ==========================================================================

function clicForme(nom) {
    parler(`C'est un ${nom} !`);
    for (let i = 0; i < 20; i++) {
        particules.push(new Particule(window.innerWidth / 2, window.innerHeight / 2));
    }
}

// ==========================================================================
// 6. LOGIQUE DU DESSIN
// ==========================================================================
const canvasDessin = document.getElementById('canvasDessin');
const ctxDessin = canvasDessin.getContext('2d');
let enTrainDeDessiner = false;
let couleurActuelle = 'yellow';

function initialiserDessin() {
    const canvasDessin = document.getElementById('canvasDessin');
    const ctxDessin = canvasDessin.getContext('2d');
    
    // On donne la taille réelle de l'écran au canvas
    canvasDessin.width = window.innerWidth;
    canvasDessin.height = window.innerHeight;
    
    // Paramètres du pinceau magique
    ctxDessin.lineJoin = 'round';
    ctxDessin.lineCap = 'round';
    ctxDessin.lineWidth = 12; // Un peu plus gros pour ta fille
    
    // On s'assure que le mode dessin est bien visible
    document.getElementById('moduleDessin').style.zIndex = "500";
}

function changerCouleur(c) { 
    couleurActuelle = c; 
    const noms = {
        '#ff0000': "Rouge comme une pomme !", '#00ff00': "Vert comme l'herbe !",
        '#0000ff': "Bleu comme le ciel !", '#ffff00': "Jaune comme le soleil !",
        '#ff00ff': "Mauve comme une fleur !", '#ff9800': "Orange comme une citrouille !",
        '#ffffff': "Blanc comme la neige !"
    };
    parler(noms[c] || "Couleur magique !");
}

function effacerDessin() { ctxDessin.clearRect(0, 0, canvasDessin.width, canvasDessin.height); }

function demarrerDessin(e) {
    enTrainDeDessiner = true;
    dessiner(e);
}

function arreterDessin() {
    enTrainDeDessiner = false;
    ctxDessin.beginPath();
}

function dessiner(e) {
    if (!enTrainDeDessiner) return;
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;

    ctxDessin.strokeStyle = couleurActuelle;
    ctxDessin.shadowBlur = 10;
    ctxDessin.shadowColor = couleurActuelle;

    ctxDessin.lineTo(x, y);
    ctxDessin.stroke();
    ctxDessin.beginPath();
    ctxDessin.moveTo(x, y);
    
    for(let i = 0; i < 2; i++) {
        let p = new Particule(x, y);
        p.couleur = couleurActuelle;
        particules.push(p);
    }
}

canvasDessin.addEventListener('mousedown', demarrerDessin);
canvasDessin.addEventListener('mousemove', dessiner);
window.addEventListener('mouseup', arreterDessin);
canvasDessin.addEventListener('touchstart', demarrerDessin);
canvasDessin.addEventListener('touchmove', dessiner);
window.addEventListener('touchend', arreterDessin);