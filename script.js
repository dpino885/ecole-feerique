// --- 1. CONFIGURATION DE LA VOIX DE FÉE ---
function parler(message) {
    const voix = new SpeechSynthesisUtterance(message);
    voix.lang = 'fr-FR';
    voix.pitch = 1.8; 
    voix.rate = 0.9;  
    window.speechSynthesis.speak(voix);
}

// --- 2. LA TRAÎNÉE D'ÉTOILES (PARTICULES) ---
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
    
    // On crée 5 étoiles à chaque mouvement
    for (let i = 0; i < 5; i++) {
        let p = new Particule(x, y);
        
        // --- LA CORRECTION EST ICI ---
        // Si le module de dessin est ouvert, on utilise la couleurActuelle du pinceau.
        // Sinon, on utilise la couleur mauve par défaut du menu.
        const moduleDessin = document.getElementById('moduleDessin');
        if (moduleDessin && moduleDessin.style.display === 'block') {
            p.couleur = couleurActuelle; 
        }
        // Si ce n'est pas le dessin, p.couleur garde la couleur mauve 
        // définie dans le constructor de la classe Particule.
        
        particules.push(p);
    }
}
window.addEventListener('mousemove', creerTrainee);
window.addEventListener('touchmove', creerTrainee);


// --- 3. PLEIN ÉCRAN & QUITTER ---
function basculerPleinEcran() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log("Erreur plein écran:", err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// On lie le bouton au clic
const btnPleinEcran = document.getElementById('btnPleinEcran');
if(btnPleinEcran) {
    btnPleinEcran.onclick = basculerPleinEcran;
}

// On désactive l'ancien bouton quitter qui n'est plus utilisé
let timerQuitter;

// --- 4. GESTION DE LA NAVIGATION (Version Propre) ---
function ouvrirModule(type) {
    // 1. On cache absolument tout
    document.getElementById('menuPrincipal').style.display = 'none';
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    // 2. On affiche toujours les étoiles
    document.getElementById('canvasParticules').style.display = 'block';

    // 3. On ouvre le bon module
    if(type === 'chiffres') {
        document.getElementById('moduleChiffres').style.display = 'block';
        parler("Comptons ensemble !");
    } else if(type === 'alphabet') {
        document.getElementById('moduleAlphabet').style.display = 'block';
        genererAlphabet();
        parler("L'alphabet des fées !");
    } else if(type === 'formes') {
        document.getElementById('moduleFormes').style.display = 'block';
        parler("Le jardin des formes !");
    } else if(type === 'dessin') {
        document.getElementById('moduleDessin').style.display = 'block';
        initialiserDessin();
        parler("Dessine avec tes doigts magiques !");
    }
}

function retourMenu() {
    // On cache tout ce qui est module
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    
    // On réaffiche le menu
    document.getElementById('menuPrincipal').style.display = 'block';
}

// --- 5. LOGIQUE DES MODULES ---
// --- LOGIQUE DES CHIFFRES ---
function clicChiffre(n) {
    // On change ici pour que l'IA dise "Le chiffre..."
    parler(`Le chiffre ${n.toString()} !`); 
    
    // Effet visuel : on fait exploser des étoiles au centre !
    const centreX = window.innerWidth / 2;
    const centreY = window.innerHeight / 2;
    
    // On crée autant de particules que le chiffre cliqué (x10 pour que ce soit impressionnant)
    for (let i = 0; i < n * 10; i++) {
        setTimeout(() => {
            particules.push(new Particule(centreX, centreY));
        }, i * 20); 
    }
}

const motsMagiques = {
    'A': 'Arc-en-ciel', 'B': 'Baguette', 'C': 'Château', 'D': 'Dragon',
    'E': 'Étoile', 'F': 'Fée', 'G': 'Gâteau', 'H': 'Hibou',
    'I': 'Île', 'J': 'Jardin', 'K': 'Koala', 'L': 'Lune',
    'M': 'Magie', 'N': 'Nuage', 'O': 'Oiseau', 'P': 'Papillon',
    'Q': 'Quiche', 'R': 'Reine', 'S': 'Soleil', 'T': 'Trésor',
    'U': 'Unique', 'V': 'Vaguette', 'W': 'Wagon', 'X': 'Xylophone',
    'Y': 'Yack', 'Z': 'Zèbre'
};

function genererAlphabet() {
    const grille = document.getElementById('grilleABC');
    grille.innerHTML = ""; 
    
    Object.keys(motsMagiques).forEach((lettre, index) => {
        const btn = document.createElement('button');
        btn.innerText = lettre;
        btn.className = 'lettre-bouton';
        
        const teinte = (index * (360 / 26));
        btn.style.background = `hsl(${teinte}, 70%, 60%)`;
        
        btn.onclick = () => {
            const mot = motsMagiques[lettre];
            
            // Astuce ultime : on dit "La lettre" devant pour éviter "Monsieur"
            parler(`La lettre ${lettre.toLowerCase()}... comme ${mot} !`);
            
            // Explosion de particules
            for (let i = 0; i < 15; i++) {
                const p = new Particule(window.innerWidth/2, window.innerHeight/2);
                p.couleur = `hsl(${teinte}, 100%, 70%)`;
                particules.push(p);
            }
        };
        
        // C'est ici qu'on ajoute le bouton à la grille
        grille.appendChild(btn);
    });
}

function clicForme(nom) {
    parler(`C'est un ${nom} !`);
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    for (let i = 0; i < 20; i++) {
        particules.push(new Particule(x, y));
    }
}

// --- LOGIQUE DU DESSIN ---
const canvasDessin = document.getElementById('canvasDessin');
const ctxDessin = canvasDessin.getContext('2d');
let enTrainDeDessiner = false;
let couleurActuelle = 'yellow';

function initialiserDessin() {
    // --- NOUVEAU : On s'assure que le canvas des étoiles est prêt ---
    canvas.width = window.innerWidth;  // On redimensionne le canvas des étoiles
    canvas.height = window.innerHeight;
    document.getElementById('canvasParticules').style.display = 'block'; // On force l'affichage
    canvasDessin.width = window.innerWidth;
    canvasDessin.height = window.innerHeight;
    ctxDessin.lineJoin = 'round';
    ctxDessin.lineCap = 'round';
    ctxDessin.lineWidth = 8;
}


function changerCouleur(c) { 
    couleurActuelle = c; 
    
    // L'IA nomme la couleur avec une description féerique
    if (c === '#ff0000') parler("Rouge... comme une pomme d'amour !");
    if (c === '#00ff00') parler("Vert... comme l'herbe de la forêt !");
    if (c === '#0000ff') parler("Bleu... comme le ciel des fées !");
    if (c === '#ffff00') parler("Jaune... comme le chaud soleil !");
    if (c === '#ff00ff') parler("Mauve... comme une fleur magique !");
    if (c === '#ff9800') parler("Orange... comme une petite citrouille !");
    if (c === '#ffffff') parler("Blanc... comme la neige de l'hiver !");
}


function effacerDessin() { ctxDessin.clearRect(0, 0, canvasDessin.width, canvasDessin.height); }

// Fonctions de dessin
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
    
    // On récupère les coordonnées (souris ou doigt)
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;

    // --- LE TRAIT PERMANENT ---
    ctxDessin.strokeStyle = couleurActuelle;
    ctxDessin.lineWidth = 10; // Un trait un peu plus épais pour les petits doigts
    ctxDessin.shadowBlur = 15; // Lueur autour du trait
    ctxDessin.shadowColor = couleurActuelle;

    ctxDessin.lineTo(x, y);
    ctxDessin.stroke();
    ctxDessin.beginPath();
    ctxDessin.moveTo(x, y);
    
    // --- LA POUSSIÈRE D'ÉTOILES (Effet éphémère) ---
    // On crée 3 étoiles à chaque petit mouvement pour un effet dense
    for(let i = 0; i < 3; i++) {
        let p = new Particule(x, y);
        p.couleur = couleurActuelle; // L'étoile prend la couleur du pinceau choisi
        p.taille = Math.random() * 4 + 1; // Des étoiles de tailles variées
        particules.push(p);
    }
}


// Événements
canvasDessin.addEventListener('mousedown', demarrerDessin);
canvasDessin.addEventListener('mousemove', dessiner);
window.addEventListener('mouseup', arreterDessin);

canvasDessin.addEventListener('touchstart', demarrerDessin);
canvasDessin.addEventListener('touchmove', dessiner);
window.addEventListener('touchend', arreterDessin);

// Modifier ouvrirModule pour le dessin
const fnOuvrirOriginale = ouvrirModule;
ouvrirModule = function(type) {
    if (type === 'dessin') {
        document.getElementById('menuPrincipal').style.display = 'none';
        document.getElementById('moduleDessin').style.display = 'block';
        initialiserDessin();
        parler("Dessine avec tes doigts magiques !");
    } else {
        fnOuvrirOriginale(type);
    }
}

// Modifier retourMenu
const fnRetourOriginale = retourMenu;
retourMenu = function() {
    document.getElementById('moduleDessin').style.display = 'none';
    fnRetourOriginale();
}