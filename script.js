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
    for (let i = 0; i < 5; i++) {
        particules.push(new Particule(x, y));
    }
}
window.addEventListener('mousemove', creerTrainee);
window.addEventListener('touchmove', creerTrainee);

// --- 3. PLEIN ÉCRAN & QUITTER ---
const btnPleinEcran = document.getElementById('btnPleinEcran');
if(btnPleinEcran) btnPleinEcran.onclick = () => document.documentElement.requestFullscreen();

let timerQuitter;
const btnQuitter = document.getElementById('btnQuitter');
if(btnQuitter) {
    btnQuitter.onmousedown = btnQuitter.ontouchstart = () => {
        timerQuitter = setTimeout(() => {
            if (document.fullscreenElement) document.exitFullscreen();
        }, 3000);
    };
    btnQuitter.onmouseup = btnQuitter.ontouchend = () => clearTimeout(timerQuitter);
}

// --- 4. GESTION DE LA NAVIGATION ---
function ouvrirModule(type) {
    // On cache tout
    document.getElementById('menuPrincipal').style.display = 'none';
    document.getElementById('moduleChiffres').style.display = 'none';
    document.getElementById('moduleAlphabet').style.display = 'none';
    document.getElementById('moduleFormes').style.display = 'none';

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
    }
}

function retourMenu() {
    document.getElementById('moduleChiffres').style.display = 'none';
    document.getElementById('moduleAlphabet').style.display = 'none';
    document.getElementById('moduleFormes').style.display = 'none';
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