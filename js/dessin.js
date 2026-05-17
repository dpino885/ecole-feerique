// 6. LOGIQUE DU DESSIN (AVEC POINTS DE PASSAGE)
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
let estEnTrainDeCelebrer = false;


// Seuils de complétion par caractère (pourcentage de la forme à couvrir)
const SEUILS_TRACER = {
    // Simple (10%)
    'I': 0.10, 'J': 0.10, 'L': 0.10, '1': 0.10, '7': 0.10,
    // Moyen (30%)
    'C': 0.30, 'F': 0.30, 'O': 0.30, 'P': 0.30, 'T': 0.30, 'U': 0.30, 'V': 0.30, 'Y': 0.30, 'Z': 0.30,
    '0': 0.30, '2': 0.30, '3': 0.30, '4': 0.30, '5': 0.30,
    // Complexe (50%)
    'A': 0.50, 'B': 0.50, 'D': 0.50, 'E': 0.50, 'G': 0.50, 'H': 0.50, 'K': 0.50, 'M': 0.50, 'N': 0.50,
    'Q': 0.50, 'R': 0.50, 'S': 0.50, 'W': 0.50, 'X': 0.50, '6': 0.50, '8': 0.50, '9': 0.50
};

let caractereActuel = '';

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

    // S'assurer que le masque a la même taille que le canvas principal
    canvasMasque.width = canvas.width;
    canvasMasque.height = canvas.height;

    // 1. Préparer le masque (on dessine la lettre en blanc sur fond noir)
    ctxMasque.save();
    ctxMasque.fillStyle = "black";
    ctxMasque.fillRect(0, 0, canvasMasque.width, canvasMasque.height);

    ctxMasque.fillStyle = "white";
    ctxMasque.strokeStyle = "white";
    ctxMasque.lineWidth = 40; // Un peu moins permissif pour mieux coller au fantôme
    ctxMasque.lineJoin = "round";
    ctxMasque.textAlign = "center";
    ctxMasque.textBaseline = "middle";

    // On fait correspondre la police
    ctxMasque.font = "500px 'Arial Black', sans-serif";

    const xMid = canvasMasque.width / 2;
    const yMid = canvasMasque.height / 2;

    // On dessine le corps et le contour pour élargir la zone valide (plus facile pour l'enfant)
    ctxMasque.strokeText(caractere, xMid, yMid);
    ctxMasque.fillText(caractere, xMid, yMid);
    ctxMasque.restore();

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

    // Récupérer le seuil spécifique au caractère ou 25% par défaut
    const seuilReussite = SEUILS_TRACER[caractereActuel] || 0.25;
    const ratioRemplissage = secteursTouches.size / secteursActifs.length;

    if (ratioRemplissage > seuilReussite) {
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


window.addEventListener('mouseup', arreterDessin);
window.addEventListener('touchend', arreterDessin);
