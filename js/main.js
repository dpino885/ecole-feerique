// 1. CONFIGURATION DE LA VOIX ET DES ÉTOILES

const canvas = document.getElementById('canvasParticules');
const ctx = canvas ? canvas.getContext('2d') : null;

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
    return ['moduleDessin', 'moduleTableauTrace'].some((id) => {
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

// 2. NAVIGATION ET PLEIN ÉCRAN
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

// Initialiser les voix et les événements au chargement
window.addEventListener('DOMContentLoaded', () => {
    // Brancher les événements de dessin
    brancherEvenementsCanvas(document.getElementById('canvasDessin'));
});

// Débloquer l'audio au premier clic/touche
function debloquerAudio() {
    initialiserVoix();
}
window.addEventListener('click', debloquerAudio, { once: true, capture: true });
window.addEventListener('touchstart', debloquerAudio, { once: true, capture: true });

const IDS_MODULES_JEU = [
    'moduleChiffres',
    'moduleAlphabet',
    'moduleFormes',
    'moduleDessin',
    'moduleTableauTrace',
    'moduleHistoire',
    'moduleMemory',
    'modulePiano',
    'moduleCasseTete'
];

function ouvrirModule(type, options) {
    options = options || {};
    const menu = document.getElementById('menuPrincipal');
    const btnRetour = document.getElementById('btnRetourGlobal');

    if (menu) menu.style.display = 'none';

    // Par défaut, on affiche le bouton retour global, sauf pour les modules qui ont leur propre bouton
    const modulesAvecPropreRetour = ['dessin', 'tableauTrace', 'memory', 'piano', 'puzzle'];
    if (btnRetour) {
        btnRetour.style.display = modulesAvecPropreRetour.includes(type) ? 'none' : 'flex';
    }

    IDS_MODULES_JEU.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    switch(type) {
        case 'chiffres':
            document.getElementById('moduleChiffres').style.display = 'block';
            parler("Trouve les fées cachées et compte avec moi !");
            initialiserJeuFées();
            break;
        case 'alphabet':
            document.getElementById('moduleAlphabet').style.display = 'flex';
            genererAlphabet();
            parler("L'alphabet des fées !");
            break;
        case 'formes':
            document.getElementById('moduleFormes').style.display = 'flex';
            parler("Le jardin des formes !");
            ouvrirModuleFormes();
            break;
        case 'dessin':
            bindDessinSurface(SURFACE_LIBRE);
            document.getElementById('moduleDessin').style.display = 'flex';
            typeActuel = 'libre';
            effacerDessin(false);
            initialiserDessin();
            parler("Dessine avec tes doigts magiques !");
            break;
        case 'tableauTrace':
            document.getElementById('moduleTableauTrace').style.display = 'flex';
            initialiserTableauTrace();
            parler("Trace les lettres et les chiffres !");
            break;
        case 'histoire':
            document.getElementById('moduleHistoire').style.display = 'flex';
            genererSelectionHistoires();
            break;
        case 'memory':
            document.getElementById('moduleMemory').style.display = 'flex';
            initialiserMemory();
            break;
        case 'piano':
            document.getElementById('modulePiano').style.display = 'flex';
            initialiserPiano();
            break;
        case 'puzzle':
            document.getElementById('moduleCasseTete').style.display = 'flex';
            initialiserModulePuzzle();
            break;
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

    // Nettoyage voix si nécessaire
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}
