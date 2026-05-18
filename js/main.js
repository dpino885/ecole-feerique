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

// Initialiser les voix au premier clic/touche de l'utilisateur
function debloquerAudio() {
    initialiserVoix();
}
// Utilisation de capture: true pour s'assurer que l'initialisation se fait AVANT les autres événements
window.addEventListener('click', debloquerAudio, { once: true, capture: true });
window.addEventListener('touchstart', debloquerAudio, { once: true, capture: true });

const IDS_MODULES_JEU = [
    'moduleChiffres',
    'moduleAlphabet',
    'moduleFormes',
    'moduleDessin',
    'moduleTracerLettres',
    'moduleTracerChiffres',
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
    } else if (type === 'puzzle') {
        const el = document.getElementById('moduleCasseTete');
        if (el) el.style.display = 'flex';
        const btnRetourGlobal = document.getElementById('btnRetourGlobal');
        if (btnRetourGlobal) btnRetourGlobal.style.display = 'none';
        initialiserModulePuzzle();
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
